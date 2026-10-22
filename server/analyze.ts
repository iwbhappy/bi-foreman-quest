import { createHash } from 'node:crypto';
import reference from './reference.json';
import { questions } from '../src/data/questions';
import { ru } from '../src/i18n/ru';
import { calculate, completeAnswers, validAnswer } from '../src/lib/scoring';
import { getArchetype } from '../src/lib/archetype';
import { qualityFlags } from '../src/lib/flags';
import { isObject, type AnalyzeResponse, type ShiftAnalysis } from '../src/lib/aiTypes';
import type { Answers } from '../src/lib/types';
import { clipWords, matchesSchema, type JsonSchema } from './schema';

export const SYSTEM = reference.SYSTEM;
export const SCHEMA = reference.SCHEMA;
export const DEFAULT_MODEL = 'gpt-5.4-mini-2026-03-17';
export const PROMPT_VERSION = '1' as const;
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const LIKERT = ['полностью не согласен', 'не согласен', 'скорее не согласен', 'нейтрально',
  'скорее согласен', 'согласен', 'полностью согласен'];
export interface AnalyzeInput { answers: Answers; position: string; experience: string }
export interface ApiResult { status: number; body: unknown; headers?: Record<string, string> }
interface LogEntry { status: number; durationMs: number; usage?: Record<string, number> }
export interface AiState {
  rates: Map<string, number[]>;
  cache: Map<string, { time: number; body: Omit<AnalyzeResponse, 'analysis'> & { analysis: unknown } }>;
  pending: Map<string, Promise<ApiResult>>;
  daily: { day: string; calls: number };
}
export const createAiState = (): AiState => ({
  rates: new Map(), cache: new Map(), pending: new Map(), daily: { day: '', calls: 0 },
});
export interface AnalyzeDeps {
  state: AiState;
  key?: string;
  model?: string;
  dailyLimit?: number;
  ip?: string;
  method?: string;
  contentType?: string;
  bodyBytes?: number;
  fetch?: typeof fetch;
  now?: () => number;
  timeoutMs?: number;
  log?: (entry: LogEntry) => void;
}
export const failure = (status: number, error: string): ApiResult => ({ status, body: { error } });
export function validInput(body: unknown): body is AnalyzeInput {
  if (!isObject(body) || Object.keys(body).length !== 3
    || !Object.keys(body).every((key) => ['answers', 'position', 'experience'].includes(key))) return false;
  if (!isObject(body.answers) || Object.keys(body.answers).length !== questions.length) return false;
  const values = body.answers;
  return questions.every((question) => Object.hasOwn(values, question.id) && validAnswer(question, values[question.id]))
    && completeAnswers(values as Answers) && ru.positions.includes(body.position as string)
    && ru.experiences.includes(body.experience as string);
}
export function buildPayload(input: AnalyzeInput) {
  const { answers, position, experience } = input;
  const { percents } = calculate(answers);
  return {
    position, experience,
    qualities: { 'Критическое мышление': percents.critical, 'Уверенность в себе': percents.confidence,
      'Дисциплина': percents.discipline, 'Вовлечённость': percents.engagement },
    archetype: getArchetype(percents).name,
    decisions: questions.filter((question) => question.type === 'situation').map((question) => ({
      situation: `${question.time} · ${question.title}`,
      decision: question.options.find((option) => option.id === answers[question.id])!.text,
    })),
    statements: questions.filter((question) => question.type === 'likert').map((question) => ({
      statement: question.statement, answer: LIKERT[answers[question.id] as number],
    })),
    qualityFlags: qualityFlags(answers, Infinity, {}).filter((flag) => flag !== 'too_fast'),
  };
}
export function normalizeAnalysis(value: ShiftAnalysis): ShiftAnalysis {
  const points = (items: ShiftAnalysis['strengths']) => items.map((item) => ({
    title: clipWords(item.title, 70), evidence: clipWords(item.evidence, 320),
  }));
  return {
    headline: clipWords(value.headline, 160), decisionStyle: clipWords(value.decisionStyle, 600),
    strengths: points(value.strengths), risks: points(value.risks),
    growthPlan: value.growthPlan.map((item) => ({ action: clipWords(item.action, 200), why: clipWords(item.why, 200) })),
    managerTips: value.managerTips.map((tip) => clipWords(tip, 200)), caveat: clipWords(value.caveat, 320),
  };
}
export function requestGuard(body: unknown, deps: AnalyzeDeps, maxBytes = 4096): ApiResult | undefined {
  if ((deps.method ?? 'POST') !== 'POST') return { ...failure(405, 'Допустим только POST.'), headers: { Allow: 'POST' } };
  if (!(deps.contentType ?? 'application/json').toLowerCase().match(/^application\/json(?:\s*;|$)/)) {
    return failure(415, 'Отправьте JSON с Content-Type: application/json.');
  }
  let bytes: number;
  try { bytes = deps.bodyBytes ?? Buffer.byteLength(JSON.stringify(body) ?? ''); }
  catch { return failure(400, 'Некорректный JSON.'); }
  if (bytes > maxBytes) return failure(413, `Размер запроса не должен превышать ${maxBytes / 1024} КБ.`);
}
export function rateGuard(deps: AnalyzeDeps): ApiResult | undefined {
  const now = (deps.now ?? Date.now)();
  for (const [ip, requests] of deps.state.rates) {
    const recent = requests.filter((time) => now - time < HOUR);
    if (recent.length) deps.state.rates.set(ip, recent); else deps.state.rates.delete(ip);
  }
  const ip = deps.ip ?? 'unknown';
  const recent = deps.state.rates.get(ip) ?? [];
  if (recent.length >= 6) return { ...failure(429, 'Лимит — 6 AI-разборов в час. Попробуйте позже.'),
    headers: { 'Retry-After': String(Math.max(1, Math.ceil((recent[0] + HOUR - now) / 1000))) } };
  recent.push(now);
  deps.state.rates.set(ip, recent);
}
function reserveDaily(deps: AnalyzeDeps) {
  const day = new Date((deps.now ?? Date.now)()).toISOString().slice(0, 10);
  if (deps.state.daily.day !== day) deps.state.daily = { day, calls: 0 };
  const limit = Number.isInteger(deps.dailyLimit) && deps.dailyLimit! >= 0 ? deps.dailyLimit! : 300;
  if (deps.state.daily.calls >= limit) return false;
  deps.state.daily.calls++;
  return true;
}
export async function completeWithModel(payload: unknown, system: string, schema: unknown, deps: AnalyzeDeps) {
  const now = deps.now ?? Date.now;
  const signal = AbortSignal.timeout(deps.timeoutMs ?? 25_000);
  for (let attempt = 0; attempt < 2; attempt++) {
    if (!reserveDaily(deps)) return { error: failure(429, 'Суточный лимит AI-разборов исчерпан. Попробуйте завтра.') };
    const start = now();
    try {
      const response = await (deps.fetch ?? fetch)('https://api.openai.com/v1/chat/completions', {
        method: 'POST', signal,
        headers: { Authorization: `Bearer ${deps.key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: deps.model ?? DEFAULT_MODEL,
          messages: [{ role: 'system', content: system }, { role: 'user', content: JSON.stringify(payload) }],
          response_format: { type: 'json_schema', json_schema: schema } }),
      });
      if (!response.ok) {
        deps.log?.({ status: response.status, durationMs: now() - start });
        await response.body?.cancel();
        if (response.status >= 500 && attempt === 0 && !signal.aborted) continue;
        return { error: failure(502, 'AI-разбор сейчас недоступен. Попробуйте позже.') };
      }
      let data;
      try { data = await response.json(); }
      catch { return { error: failure(502, 'AI вернул некорректный разбор. Попробуйте ещё раз.') }; }
      if (!isObject(data)) return { error: failure(502, 'AI вернул некорректный разбор. Попробуйте ещё раз.') };
      const rawUsage = data.usage;
      const usage = isObject(rawUsage) ? Object.fromEntries(
        ['prompt_tokens', 'completion_tokens', 'total_tokens'].filter((key) =>
          typeof rawUsage[key] === 'number').map((key) => [key, rawUsage[key] as number])) : undefined;
      deps.log?.({ status: response.status, durationMs: now() - start, usage });
      const choice: unknown = Array.isArray(data.choices) ? data.choices[0] : undefined;
      const content = isObject(choice) && isObject(choice.message) ? choice.message.content : undefined;
      if (typeof content !== 'string') return { error: failure(502, 'AI вернул некорректный разбор. Попробуйте ещё раз.') };
      try { return { value: JSON.parse(content) as unknown }; }
      catch { return { error: failure(502, 'AI вернул некорректный разбор. Попробуйте ещё раз.') }; }
    } catch {
      deps.log?.({ status: signal.aborted ? 504 : 502, durationMs: now() - start });
      if (signal.aborted) return { error: failure(504, 'AI-разбор не успел подготовиться. Попробуйте ещё раз.') };
      if (attempt === 1) return { error: failure(502, 'Не удалось связаться с AI. Попробуйте ещё раз.') };
    }
  }
  return { error: failure(502, 'AI-разбор сейчас недоступен.') };
}
export async function handleAnalyze(body: unknown, deps: AnalyzeDeps): Promise<ApiResult> {
  const guard = requestGuard(body, deps);
  if (guard) return guard;
  if (!validInput(body)) return failure(400, 'Нужны 15 допустимых ответов, должность и стаж из списков формы.');
  if (!deps.key?.trim()) return failure(503, 'AI-разбор не настроен.');
  const rate = rateGuard(deps);
  if (rate) return rate;
  const canonical = { answers: Object.fromEntries(questions.map((question) => [question.id, body.answers[question.id]])),
    position: body.position, experience: body.experience, model: deps.model ?? DEFAULT_MODEL, promptVersion: PROMPT_VERSION };
  const key = createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
  const now = (deps.now ?? Date.now)();
  for (const [id, item] of deps.state.cache) if (now - item.time >= DAY) deps.state.cache.delete(id);
  const cached = deps.state.cache.get(key);
  if (cached) return { status: 200, body: { ...cached.body, cached: true } };
  const pending = deps.state.pending.get(key);
  if (pending) {
    const result = await pending;
    return result.status === 200 ? { ...result, body: { ...(result.body as AnalyzeResponse), cached: true } } : result;
  }
  const work = (async (): Promise<ApiResult> => {
    const result = await completeWithModel(buildPayload(body), SYSTEM, SCHEMA, deps);
    if (result.error) return result.error;
    if (!matchesSchema(result.value, SCHEMA.schema as JsonSchema)) {
      return failure(502, 'AI вернул некорректный разбор. Попробуйте ещё раз.');
    }
    const response: AnalyzeResponse = { analysis: normalizeAnalysis(result.value as ShiftAnalysis),
      model: deps.model ?? DEFAULT_MODEL, promptVersion: PROMPT_VERSION, cached: false };
    deps.state.cache.set(key, { time: (deps.now ?? Date.now)(), body: response });
    return { status: 200, body: response };
  })();
  deps.state.pending.set(key, work);
  try { return await work; } finally { deps.state.pending.delete(key); }
}
