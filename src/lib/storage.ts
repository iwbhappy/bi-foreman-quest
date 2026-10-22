import { questions } from '../data/questions';
import { completeAnswers, validAnswer } from './scoring';
import { resolveSkin } from './skin';
import { HELMETS } from '../data/skins';
import type { Answers, Participant, Progress, ResultRecord, QuestProgress } from './types';

const prefix = 'bi-profile:v1:';
export function clearMyData() {
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith('bi-profile:')) localStorage.removeItem(key);
  } catch { /* In-memory records are cleared even when browser storage is unavailable. */ }
  memory.clear();
}
const memory = new Map<string, unknown>();
const listeners = new Set<() => void>();
let unavailable = false;
function markUnavailable() {
  if (!unavailable) {
    unavailable = true;
    listeners.forEach((fn) => fn());
  }
}
export const subscribeStorage = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const storageUnavailable = () => unavailable;
const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const finiteTimes = (v: unknown): v is Record<string, number> =>
  object(v) && Object.values(v).every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0);
const participant = (v: unknown): v is Participant =>
  object(v) && ['name', 'position', 'experience'].every((k) => typeof v[k] === 'string');
function answers(v: unknown): v is Answers {
  return (
    object(v) &&
    Object.entries(v).every(([id, value]) => {
      const q = questions.find((q) => q.id === id);
      return q !== undefined && validAnswer(q, value);
    })
  );
}
function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(prefix + key);
    if (raw !== null) {
      const value: unknown = JSON.parse(raw);
      memory.set(key, value);
      return value;
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) markUnavailable();
  }
  return memory.get(key);
}
function write(key: string, value: unknown) {
  memory.set(key, value);
  try {
    localStorage.setItem(prefix + key, JSON.stringify(value));
  } catch {
    markUnavailable();
  }
}
export function probeStorage() {
  try {
    localStorage.setItem(prefix + 'probe', '1');
    localStorage.removeItem(prefix + 'probe');
  } catch {
    markUnavailable();
  }
}
export function loadProgress(): Progress | null {
  const v = read('progress');
  if (
    !object(v) ||
    v.methodologyVersion !== '1.0' ||
    !participant(v.participant) ||
    !answers(v.answers) ||
    typeof v.sessionSeed !== 'string' ||
    typeof v.startedAt !== 'string' ||
    !Number.isFinite(Date.parse(v.startedAt)) ||
    !Number.isInteger(v.currentIndex) ||
    Number(v.currentIndex) < 0 ||
    Number(v.currentIndex) >= questions.length ||
    !finiteTimes(v.perQuestionSec)
  )
    return null;
  const savedAnswers = v.answers;
  if (!questions.slice(0, Number(v.currentIndex)).every((q) => validAnswer(q, savedAnswers[q.id]))) return null;
  return v as unknown as Progress;
}
export const saveProgress = (progress: Progress) => write('progress', progress);
export function clearProgress() {
  memory.delete('progress');
  try {
    localStorage.removeItem(prefix + 'progress');
  } catch {
    markUnavailable();
  }
}
export function loadResults(): ResultRecord[] {
  const records = read('results');
  if (!Array.isArray(records)) return [];
  return records
    .filter(
      (v: unknown): v is ResultRecord =>
        object(v) &&
        v.methodologyVersion === '1.0' &&
        typeof v.id === 'string' &&
        typeof v.createdAt === 'string' &&
        Number.isFinite(Date.parse(v.createdAt)) &&
        participant(v.participant) &&
        answers(v.answers) &&
        completeAnswers(v.answers) &&
        typeof v.durationSec === 'number' &&
        Number.isFinite(v.durationSec) &&
        v.durationSec >= 0 &&
        finiteTimes(v.perQuestionSec),
    )
    .map((record) =>
      record.skin || record.helmetColor ? { ...record, skin: resolveSkin(record.skin, record.helmetColor) } : record,
    );
}
export function saveResult(result: ResultRecord) {
  write('results', [result, ...loadResults().filter((r) => r.id !== result.id)]);
}
export function loadPlan(id: string): boolean[] {
  const v = read(`plan:${id}`);
  return Array.isArray(v) && v.length === 4 && v.every((x) => typeof x === 'boolean')
    ? v
    : [false, false, false, false];
}
export function savePlan(id: string, checked: boolean[]) {
  write(`plan:${id}`, checked);
}

export function loadQuestProgress(): QuestProgress | null {
  const value = read('quest-progress');
  if (
    !object(value) ||
    value.methodologyVersion !== '1.0' ||
    !participant(value.participant) ||
    !answers(value.answers) ||
    !finiteTimes(value.perQuestionSec) ||
    typeof value.sessionSeed !== 'string' ||
    typeof value.startedAt !== 'string' ||
    !Number.isFinite(Date.parse(value.startedAt)) ||
    typeof value.currentIndex !== 'number' ||
    !Number.isInteger(value.currentIndex) ||
    value.currentIndex < 0 ||
    value.currentIndex >= questions.length ||
    !(Object.values(HELMETS).includes(String(value.helmetColor) as typeof HELMETS.orange) || value.helmetColor === '#FFFFFF') ||
    typeof value.consequenceShown !== 'boolean' ||
    !['play', 'report', 'reveal'].includes(String(value.stage))
  ) {
    return null;
  }
  const savedAnswers = value.answers;
  if (!questions.slice(0, value.currentIndex).every((q) => validAnswer(q, savedAnswers[q.id]))) return null;
  if (value.consequenceShown) {
    const question = questions[value.currentIndex];
    if (question.type !== 'situation' || !validAnswer(question, savedAnswers[question.id])) return null;
  }
  if (value.stage !== 'play' && (!completeAnswers(savedAnswers) || typeof value.resultId !== 'string')) return null;
  return { ...value, skin: resolveSkin(value.skin, String(value.helmetColor)) } as unknown as QuestProgress;
}
export const saveQuestProgress = (progress: QuestProgress) => write('quest-progress', progress);
export function clearQuestProgress() {
  memory.delete('quest-progress');
  try {
    localStorage.removeItem(prefix + 'quest-progress');
  } catch {
    markUnavailable();
  }
}
