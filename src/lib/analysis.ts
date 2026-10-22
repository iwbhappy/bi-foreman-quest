import { questions } from '../data/questions';
import { TRAIT_ORDER, type Answers, type Percents, type TraitId } from './types';

export function ranked(percents: Percents) {
  return [...TRAIT_ORDER].sort((a, b) => percents[b] - percents[a] || TRAIT_ORDER.indexOf(a) - TRAIT_ORDER.indexOf(b));
}
export function analyze(percents: Percents) {
  const order = ranked(percents);
  let strengths = order.filter(t => percents[t] >= 70);
  if (!strengths.length) strengths = [order[0]];
  let growthZones = [...TRAIT_ORDER].filter(t => percents[t] < 55 && !strengths.includes(t))
    .sort((a, b) => percents[a] - percents[b] || TRAIT_ORDER.indexOf(a) - TRAIT_ORDER.indexOf(b));
  if (!growthZones.length) {
    const lowest = order[order.length - 1];
    growthZones = [lowest];
    strengths = strengths.filter(t => t !== lowest);
  }
  return { strengths, growthZones };
}
export function evidence(answers: Answers, trait: TraitId) {
  const selected = questions.flatMap((q, index) => {
    if (q.type !== 'situation') return [];
    const option = q.options.find(o => o.id === answers[q.id]);
    return option ? [{ question: q, option, index, weight: option.weights[trait] }] : [];
  });
  const strengths = selected.filter(e => e.weight >= 2).sort((a, b) => b.weight - a.weight || a.index - b.index).slice(0, 2);
  const weak = selected.find(e => e.weight <= 1 && e.question.options.some(o => o.weights[trait] === 3));
  const alternative = weak && { ...weak, better: weak.question.options.find(o => o.weights[trait] === 3)! };
  return { strengths, alternative };
}
