import { describe, expect, it } from 'vitest';
import { getArchetype } from '../lib/archetype';
describe('Архетип', () => {
  it('Бобр-стратег', () => expect(getArchetype({ critical: 80, confidence: 60, discipline: 90, engagement: 50 }).name).toBe('Бобр-стратег'));
  it('Ничьи по TRAIT_ORDER', () => expect(getArchetype({ critical: 80, confidence: 80, discipline: 60, engagement: 50 }).key).toBe('critical-confidence'));
  it('Разброс до 10 включительно → Универсал', () => {
    expect(getArchetype({ critical: 60, confidence: 60, discipline: 60, engagement: 70 }).key).toBe('universal');
    expect(getArchetype({ critical: 60, confidence: 60, discipline: 60, engagement: 71 }).key).toBe('engagement-critical');
  });
});
