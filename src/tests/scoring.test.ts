import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { calculate, bounds, scoreAnswer, level, completeAnswers } from '../lib/scoring';
import { TRAIT_ORDER, type Answers } from '../lib/types';

export const sample = (option: 'A' | 'B' = 'A', likert: 0 | 3 | 6 = 3): Answers => Object.fromEntries(questions.map(q => [q.id, q.type === 'situation' ? option : likert]));
describe('Подсчёт', () => {
  for (const trait of TRAIT_ORDER) {
    for (const extreme of ['min', 'max'] as const) it(`${trait}: ${extreme} даёт ${extreme === 'max' ? 100 : 0}%`, () => {
      const answers: Answers = {};
      for (const q of questions) {
        if (q.type === 'situation') {
          answers[q.id] = [...q.options].sort((a, b) => extreme === 'max' ? b.weights[trait] - a.weights[trait] : a.weights[trait] - b.weights[trait])[0].id;
        } else answers[q.id] = q.reverse === (extreme === 'max') ? 0 : 6;
      }
      expect(calculate(answers).percents[trait]).toBe(extreme === 'max' ? 100 : 0);
    });
  }
  it('q08 reverse: 0 → 3, 6 → 0; остальные качества не затронуты', () => {
    const q = questions[7];
    expect(scoreAnswer(q, 0, 'confidence')).toBe(3);
    expect(scoreAnswer(q, 6, 'confidence')).toBe(0);
    expect(scoreAnswer(q, 0, 'critical')).toBe(0);
  });
  it('Детерминизм, целые проценты и среднее', () => {
    const a = calculate(sample());
    expect(a).toEqual(calculate(sample()));
    for (const p of Object.values(a.percents)) { expect(Number.isInteger(p)).toBe(true); expect(p).toBeGreaterThanOrEqual(0); expect(p).toBeLessThanOrEqual(100); }
    expect(a.overall).toBe(Math.round(Object.values(a.percents).reduce((a, b) => a + b) / 4));
  });
  it('Границы уровней', () => {
    expect([0, 39, 40, 69, 70, 100].map(level)).toEqual(['growth', 'growth', 'developing', 'developing', 'strong', 'strong']);
  });
  it('Два независимых контрольных набора по формуле методики', () => {
    // Все A + Likert 3: raw [18.5, 26.5, 14.5, 22.5].
    expect(calculate(sample('A')).raw).toEqual({ critical: 18.5, confidence: 26.5, discipline: 14.5, engagement: 22.5 });
    // min/max независимо суммируются по исходной таблице: [5/34, 2/33, 8/33, 5/33].
    expect(TRAIT_ORDER.map(t => bounds(t))).toEqual([{ min: 5, max: 34 }, { min: 2, max: 33 }, { min: 8, max: 33 }, { min: 5, max: 33 }]);
    expect(calculate(sample('A')).percents).toEqual({ critical: 47, confidence: 79, discipline: 26, engagement: 63 });
    expect(calculate(sample('B')).raw).toEqual({ critical: 18.5, confidence: 15.5, discipline: 25.5, engagement: 14.5 });
    expect(calculate(sample('B')).percents).toEqual({ critical: 47, confidence: 44, discipline: 70, engagement: 34 });
  });
  it('Неполные и некорректные ответы не считаются завершённым тестом', () => {
    expect(completeAnswers({})).toBe(false);
    expect(completeAnswers({ ...sample(), q01: 3 })).toBe(false);
    expect(completeAnswers(sample())).toBe(true);
  });
});
