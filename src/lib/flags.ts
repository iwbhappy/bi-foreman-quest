import type { Answers, QualityFlag } from './types';
export function qualityFlags(answers: Answers, durationSec: number, perQuestionSec: Record<string, number>): QualityFlag[] {
  const flags: QualityFlag[] = [];
  const times = Object.values(perQuestionSec).sort((a, b) => a - b);
  const mid = Math.floor(times.length / 2);
  const median = times.length ? times.length % 2 ? times[mid] : (times[mid - 1] + times[mid]) / 2 : 0;
  if (durationSec < 90 || median < 4) flags.push('too_fast');
  const likert = ['q04', 'q08', 'q11', 'q14'].map(id => answers[id]);
  const high = (v: unknown) => typeof v === 'number' && v >= 5;
  if ((high(answers.q04) || high(answers.q11)) && (high(answers.q08) || high(answers.q14))) flags.push('likert_contradiction');
  if ((likert[0] === 0 || likert[0] === 6) && likert.every(v => v === likert[0])) flags.push('likert_straightline');
  return flags;
}
