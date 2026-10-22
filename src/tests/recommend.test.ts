import { describe, expect, it } from 'vitest';
import { recommend, developmentPlan } from '../lib/recommend';
import { analyze, evidence } from '../lib/analysis';
import { TRAIT_ORDER, type Percents } from '../lib/types';
import { questions } from '../data/questions';
describe('Анализ и рекомендации', () => {
  it('35 → low, 50 → mid, ≥55 → mid для самого низкого', () => {
    expect(recommend({ critical: 35, confidence: 50, discipline: 80, engagement: 90 }).map(r => r.band)).toEqual(['low', 'mid']);
    expect(recommend({ critical: 55, confidence: 60, discipline: 80, engagement: 90 })[0]).toMatchObject({ trait: 'critical', band: 'mid' });
  });
  it('Списки не пусты и не пересекаются для 6⁴ сочетаний', () => {
    for (const a of [0, 39, 54, 60, 70, 100]) for (const b of [0, 39, 54, 60, 70, 100]) for (const c of [0, 39, 54, 60, 70, 100]) for (const d of [0, 39, 54, 60, 70, 100]) {
      const p = Object.fromEntries(TRAIT_ORDER.map((t, i) => [t, [a, b, c, d][i]])) as Percents;
      const { strengths, growthZones } = analyze(p);
      expect(strengths.length).toBeGreaterThan(0); expect(growthZones.length).toBeGreaterThan(0);
      expect(strengths.some(t => growthZones.includes(t))).toBe(false);
    }
  });
  it('Пример все по 60: critical сильное, engagement в рост', () => expect(analyze({ critical: 60, confidence: 60, discipline: 60, engagement: 60 })).toEqual({ strengths: ['critical'], growthZones: ['engagement'] }));
  it('План из четырёх недель в нужном порядке', () => {
    const plan = developmentPlan({ critical: 35, confidence: 50, discipline: 80, engagement: 90 });
    expect(plan.map(p => p.type)).toEqual(['practice', 'course', 'mentor', 'retest']);
    expect(plan.map(p => p.week)).toEqual([1, 2, 3, 4]);
  });
  it('Доказательства берутся из выбранных ответов, альтернативы имеют вес 3', () => {
    const answers = Object.fromEntries(questions.map(q => [q.id, q.type === 'situation' ? 'A' as const : 3 as const]));
    for (const trait of TRAIT_ORDER) {
      const e = evidence(answers, trait);
      expect(e.strengths.length).toBeLessThanOrEqual(2);
      e.strengths.forEach(s => { expect(s.option.id).toBe(answers[s.question.id]); expect(s.weight).toBeGreaterThanOrEqual(2); });
      if (e.alternative) { expect(e.alternative.weight).toBeLessThanOrEqual(1); expect(e.alternative.better.weights[trait]).toBe(3); }
    }
  });
});
