import { EVENT_CATALOG, STAGE_SEQUENCES } from '../data/stageEvents';
import { CALLBACKS } from '../data/quest';
import { questions } from '../data/questions';
import { TRAIT_ORDER, type Percents } from './types';

export const stageSequence = (questionId: string, optionId: unknown) =>
  STAGE_SEQUENCES.find((sequence) => sequence.questionId === questionId && sequence.optionId === optionId);
export const stepLabel = (step: { id: keyof typeof EVENT_CATALOG; label?: string }) =>
  step.label ?? EVENT_CATALOG[step.id].label;
export function sourceScene(questionId: string) {
  const callback = CALLBACKS.find((item) => item.atQuestionId === questionId);
  return callback ? questions.find((question) => question.id === callback.dependsOn) : undefined;
}
export function mainChange(current: Percents, previous?: Percents) {
  if (!previous) return null;
  const trait = [...TRAIT_ORDER].sort(
    (a, b) =>
      Math.abs(current[b] - previous[b]) - Math.abs(current[a] - previous[a]) ||
      TRAIT_ORDER.indexOf(a) - TRAIT_ORDER.indexOf(b),
  )[0];
  return { trait, delta: current[trait] - previous[trait] };
}
