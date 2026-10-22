import { questions } from '../data/questions';
import { bounds } from './scoring';
import { TRAIT_ORDER, type TraitId } from './types';

export function coverageRows() {
  return questions.map((question) => ({
    question,
    maxima: Object.fromEntries(
      TRAIT_ORDER.map((trait) => [
        trait,
        question.type === 'situation'
          ? Math.max(...question.options.map((option) => option.weights[trait]))
          : question.trait === trait
            ? 3
            : 0,
      ]),
    ) as Record<TraitId, number>,
  }));
}
export function coverageTotals() {
  return TRAIT_ORDER.map((trait) => ({ trait, ...bounds(trait) }));
}
