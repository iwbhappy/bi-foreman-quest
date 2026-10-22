import { calculate, completeAnswers } from './scoring';
import { analyze } from './analysis';
import { getArchetype } from './archetype';
import { qualityFlags } from './flags';
import type { Progress, ResultRecord } from './types';
export function createResult(progress: Progress): ResultRecord {
  if (!completeAnswers(progress.answers)) throw new Error('Incomplete answers');
  const { percents, overall, levels } = calculate(progress.answers);
  const durationSec = Object.values(progress.perQuestionSec).reduce((a, b) => a + b, 0);
  return {
    id: crypto.randomUUID(), methodologyVersion: '1.0', createdAt: new Date().toISOString(),
    participant: progress.participant, answers: { ...progress.answers }, durationSec,
    perQuestionSec: { ...progress.perQuestionSec }, percents, overall, levels,
    archetype: getArchetype(percents), ...analyze(percents), flags: qualityFlags(progress.answers, durationSec, progress.perQuestionSec)
  };
}
