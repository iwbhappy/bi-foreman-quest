import { questions } from '../data/questions';
import { TRAIT_ORDER, type Answers, type AnswerValue, type Level, type Percents, type Question, type TraitId } from './types';

export function scoreAnswer(q: Question, answer: AnswerValue | undefined, trait: TraitId): number {
  if (q.type === 'situation') return q.options.find(o => o.id === answer)?.weights[trait] ?? 0;
  if (q.trait !== trait || typeof answer !== 'number' || answer < 0 || answer > 6) return 0;
  return q.reverse ? 3 - answer / 2 : answer / 2;
}
export function bounds(trait: TraitId, bank = questions, situationsOnly = false) {
  return bank.reduce((acc, q) => {
    if (q.type === 'situation') {
      const weights = q.options.map(o => o.weights[trait]);
      acc.min += Math.min(...weights); acc.max += Math.max(...weights);
    } else if (!situationsOnly && q.trait === trait) acc.max += 3;
    return acc;
  }, { min: 0, max: 0 });
}
export function level(percent: number): Level { return percent < 40 ? 'growth' : percent < 70 ? 'developing' : 'strong'; }
export function calculate(answers: Answers) {
  const raw = {} as Percents;
  const percents = {} as Percents;
  const levels = {} as Record<TraitId, Level>;
  for (const t of TRAIT_ORDER) {
    raw[t] = questions.reduce((n, q) => n + scoreAnswer(q, answers[q.id], t), 0);
    const { min, max } = bounds(t);
    percents[t] = Math.max(0, Math.min(100, Math.round((raw[t] - min) / (max - min) * 100)));
    levels[t] = level(percents[t]);
  }
  return { raw, percents, levels, overall: Math.round(TRAIT_ORDER.reduce((n, t) => n + percents[t], 0) / 4) };
}
export function validAnswer(q: Question, value: unknown): value is AnswerValue {
  return q.type === 'situation' ? q.options.some(o => o.id === value) : typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 6;
}
export function completeAnswers(answers: Answers) { return questions.every(q => validAnswer(q, answers[q.id])); }
