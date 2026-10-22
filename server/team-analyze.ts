import { createHash } from 'node:crypto';
import { ru } from '../src/i18n/ru';
import { getArchetype } from '../src/lib/archetype';
import { isObject, type TeamAnalysis } from '../src/lib/aiTypes';
import { TRAIT_ORDER, type Percents } from '../src/lib/types';
import { completeWithModel, DEFAULT_MODEL, failure, rateGuard, requestGuard, type AnalyzeDeps,
  type ApiResult } from './analyze';
import { clipWords, matchesSchema } from './schema';

export const TEAM_SYSTEM = `Ты — методист BI Academy (строительная компания BI Group).
Тебе передают обезличенные профили команды: должность, стаж, четыре качества в процентах и архетип.
Сделай короткий разбор на русском языке, только по переданным данным, без выдуманных фактов и имён.
Называй качества точно: критическое мышление, уверенность в себе, дисциплина, вовлечённость.
Не путай качества сотрудника с качеством работ или безопасностью. Проценты не пересчитывай и не оспаривай.
Не ставь диагнозы, не используй психологические ярлыки, слова «тип личности», «всегда», «никогда» и emoji.
Не делай выводов о конкретных решениях: ответов на вопросы в этих данных нет.
Опиши три общие закономерности, два риска и три конкретных приоритета обучения на 2–4 недели.
В trainingPriorities.quality указывай одно из четырёх качеств точным названием.
Каждый пункт — одно-два коротких предложения. Это ориентир для развития, а не оценка сотрудников:
скажи это в caveat одним предложением.`;
const string = { type: 'string' as const };
const strings = (count: number) => ({ type: 'array', minItems: count, maxItems: count, items: string });
export const TEAM_SCHEMA = { name: 'team_analysis', strict: true, schema: {
  type: 'object', additionalProperties: false,
  required: ['headline', 'patterns', 'risks', 'trainingPriorities', 'caveat'],
  properties: { headline: string, patterns: strings(3), risks: strings(2), caveat: string,
    trainingPriorities: { type: 'array', minItems: 3, maxItems: 3, items: {
      type: 'object', additionalProperties: false, required: ['quality', 'action'],
      properties: { quality: string, action: string },
    } },
  },
} };
interface Member { position: string; experience: string; percents: Percents; archetype: string }
function validMember(value: unknown): value is Member {
  return isObject(value) && Object.keys(value).length === 4
    && Object.keys(value).every((key) => ['position', 'experience', 'percents', 'archetype'].includes(key))
    && ru.positions.includes(value.position as string) && ru.experiences.includes(value.experience as string)
    && isObject(value.percents) && Object.keys(value.percents).length === 4
    && TRAIT_ORDER.every((key) => {
      const percent = (value.percents as Record<string, unknown>)[key];
      return typeof percent === 'number' && Number.isInteger(percent) && percent >= 0 && percent <= 100;
    }) && value.archetype === getArchetype(value.percents as Percents).name;
}
export async function handleTeamAnalyze(body: unknown, deps: AnalyzeDeps): Promise<ApiResult> {
  const guard = requestGuard(body, deps, 16_384);
  if (guard) return guard;
  if (!isObject(body) || Object.keys(body).length !== 1 || !Array.isArray(body.members)
    || body.members.length < 1 || body.members.length > 30 || !body.members.every(validMember)) {
    return failure(400, 'Нужны обезличенные профили 1–30 сотрудников с должностью, стажем и процентами 0–100.');
  }
  if (!deps.key?.trim()) return failure(503, 'AI-разбор не настроен.');
  const rate = rateGuard(deps);
  if (rate) return rate;
  const names = ['Критическое мышление', 'Уверенность в себе', 'Дисциплина', 'Вовлечённость'];
  const members = body.members.map((member: Member) => ({ position: member.position, experience: member.experience,
    qualities: Object.fromEntries(TRAIT_ORDER.map((key, index) => [names[index], member.percents[key]])),
    archetype: member.archetype }));
  const key = createHash('sha256').update(JSON.stringify({ team: members, model: deps.model ?? DEFAULT_MODEL,
    promptVersion: '1' })).digest('hex');
  const cached = deps.state.cache.get(key);
  if (cached && (deps.now ?? Date.now)() - cached.time < 86_400_000) {
    return { status: 200, body: { ...cached.body, cached: true } };
  }
  const pending = deps.state.pending.get(key);
  if (pending) return pending;
  const work = (async (): Promise<ApiResult> => {
    const result = await completeWithModel({ members }, TEAM_SYSTEM, TEAM_SCHEMA, deps);
    if (result.error) return result.error;
    if (!matchesSchema(result.value, TEAM_SCHEMA.schema)) return failure(502, 'AI вернул некорректный анализ команды.');
    const value = result.value as TeamAnalysis;
    if (!value.trainingPriorities.every((item) => names.includes(item.quality))) {
      return failure(502, 'AI вернул неизвестное качество в анализе команды.');
    }
    const analysis: TeamAnalysis = { headline: clipWords(value.headline, 160),
      patterns: value.patterns.map((text) => clipWords(text, 320)), risks: value.risks.map((text) => clipWords(text, 320)),
      trainingPriorities: value.trainingPriorities.map((item) => ({ quality: item.quality,
        action: clipWords(item.action, 200) })), caveat: clipWords(value.caveat, 320) };
    const response = { analysis, model: deps.model ?? DEFAULT_MODEL, promptVersion: '1' as const, cached: false };
    deps.state.cache.set(key, { time: (deps.now ?? Date.now)(), body: response });
    return { status: 200, body: response };
  })();
  deps.state.pending.set(key, work);
  try { return await work; } finally { deps.state.pending.delete(key); }
}
