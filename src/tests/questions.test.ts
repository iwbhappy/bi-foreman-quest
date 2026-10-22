import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { TRAIT_ORDER } from '../lib/types';

describe('Банк вопросов', () => {
  it('15 уникальных вопросов по порядку: 11 ситуаций и 4 утверждения', () => {
    expect(questions.map(q => q.id)).toEqual(Array.from({ length: 15 }, (_, i) => `q${String(i + 1).padStart(2, '0')}`));
    expect(questions.filter(q => q.type === 'situation')).toHaveLength(11);
    expect(questions.filter(q => q.type === 'likert')).toHaveLength(4);
  });
  it('У ситуаций 4 варианта A–D и целочисленные веса 0..3; нет доминирования', () => {
    for (const q of questions) {
      if (q.type !== 'situation') continue;
      expect(q.options.map(o => o.id)).toEqual(['A', 'B', 'C', 'D']);
      for (const a of q.options) {
        for (const t of TRAIT_ORDER) expect([0, 1, 2, 3]).toContain(a.weights[t]);
        for (const b of q.options) {
          if (a.id !== b.id) expect(TRAIT_ORDER.every(t => a.weights[t] >= b.weights[t]), `${q.id}: ${a.id} dominates ${b.id}`).toBe(false);
        }
      }
    }
  });
  it('Likert покрывают 4 качества, confidence и engagement обратные', () => {
    const likerts = questions.filter(q => q.type === 'likert');
    expect(likerts.map(q => q.trait)).toEqual(TRAIT_ORDER);
    expect(likerts.map(q => q.reverse)).toEqual([false, true, false, true]);
  });
  it('Контрольные суммы и баланс максимумов', () => {
    const maxima = TRAIT_ORDER.map(t => questions.reduce((n, q) => n + (q.type === 'situation' ? Math.max(...q.options.map(o => o.weights[t])) : 0), 0));
    expect(maxima).toEqual([31, 30, 30, 30]);
    const withLikert = maxima.map(n => n + 3);
    expect(Math.max(...withLikert) / Math.min(...withLikert)).toBeLessThanOrEqual(1.15);
  });
});
