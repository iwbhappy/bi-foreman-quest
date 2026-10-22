import { ru } from '../i18n/ru';
import { questions } from '../data/questions';
import { HELMETS } from '../data/skins';
import { resolveSkin, validSkin } from './skin';
import { deriveProfile } from './profiles';
import { completeAnswers } from './scoring';
import { TRAIT_ORDER, type Answers, type Level, type Participant, type ResultRecord } from './types';

export type ImportError = 'json' | 'version' | 'format' | 'answers';
export type ImportResult = { ok: true; record: ResultRecord } | { ok: false; error: ImportError };
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const levels: Level[] = ['growth', 'developing', 'strong'];

export function parseResultJSON(text: string): ImportResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, error: 'json' };
  }
  if (!object(value)) return { ok: false, error: 'format' };
  if (value.methodologyVersion !== '1.0') return { ok: false, error: 'version' };
  if (
    !object(value.answers) ||
    Object.keys(value.answers).length !== questions.length ||
    !completeAnswers(value.answers as Answers)
  )
    return { ok: false, error: 'answers' };
  const participant = value.participant;
  const times = value.perQuestionSec;
  const percents = value.percents;
  const recordLevels = value.levels;
  const archetype = value.archetype;
  const valid =
    typeof value.id === 'string' &&
    uuid.test(value.id) &&
    typeof value.createdAt === 'string' &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    object(participant) &&
    typeof participant.name === 'string' &&
    participant.name.length <= 100 &&
    ru.positions.includes(String(participant.position)) &&
    ru.experiences.includes(String(participant.experience)) &&
    number(value.durationSec) &&
    value.durationSec >= 0 &&
    object(times) &&
    Object.keys(times).length === questions.length &&
    questions.every((question) => number(times[question.id]) && Number(times[question.id]) >= 0) &&
    object(percents) &&
    TRAIT_ORDER.every(
      (trait) =>
        number(percents[trait]) &&
        Number.isInteger(percents[trait]) &&
        Number(percents[trait]) >= 0 &&
        Number(percents[trait]) <= 100,
    ) &&
    number(value.overall) &&
    Number.isInteger(value.overall) &&
    value.overall >= 0 &&
    value.overall <= 100 &&
    object(recordLevels) &&
    TRAIT_ORDER.every((trait) => levels.includes(recordLevels[trait] as Level)) &&
    object(archetype) &&
    ['key', 'name', 'emoji', 'description'].every((key) => typeof archetype[key] === 'string') &&
    [value.strengths, value.growthZones].every(
      (list) => Array.isArray(list) && list.length > 0 && list.every((trait) => TRAIT_ORDER.includes(trait)),
    ) &&
    Array.isArray(value.flags) &&
    value.flags.every((flag) => ['too_fast', 'likert_contradiction', 'likert_straightline'].includes(flag)) &&
    (value.mode === undefined || value.mode === 'quest' || value.mode === 'classic') &&
    (value.helmetColor === undefined || Object.values(HELMETS).some((color) => color === value.helmetColor)) &&
    (value.skin === undefined || validSkin(value.skin));
  if (!valid) return { ok: false, error: 'format' };
  const durationSec = value.durationSec as number;
  const perQuestionSec = times as Record<string, number>;
  if (Math.abs(Object.values(perQuestionSec).reduce((sum, time) => sum + time, 0) - durationSec) > 0.1) {
    return { ok: false, error: 'format' };
  }
  return {
    ok: true,
    record: deriveProfile({
      id: value.id as string,
      createdAt: value.createdAt as string,
      participant: participant as unknown as Participant,
      answers: value.answers as Answers,
      durationSec,
      perQuestionSec,
      mode: value.mode as ResultRecord['mode'],
      helmetColor: value.helmetColor as string | undefined,
      ...(value.skin || value.helmetColor ? { skin: resolveSkin(value.skin, value.helmetColor as string) } : {}),
    }),
  };
}
