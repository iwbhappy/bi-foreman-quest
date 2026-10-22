import { describe, expect, it } from 'vitest';
import { demoEmployees } from '../data/demoTeam';
import { buildDemoTeam, firstPrevious, latestProfiles, weakestTrait } from '../lib/team';
import { TRAIT_ORDER } from '../lib/types';

const records = buildDemoTeam();
const latest = latestProfiles(records);
const histories = latest.slice(0, 3).map((current) => ({ current, previous: firstPrevious(records, current)! }));

describe('Правдоподобная демо-команда — раздел 1 правок', () => {
  it('В каждом наборе ситуаций минимум три разные буквы', () => {
    for (const person of demoEmployees)
      for (const attempt of person.attempts) {
        expect(attempt.pattern).toMatch(/^[ABCD]{11}$/);
        expect(new Set(attempt.pattern).size).toBeGreaterThanOrEqual(3);
      }
  });
  it('В каждом прохождении минимум два разных ответа на утверждения в диапазоне 1–5', () => {
    for (const person of demoEmployees)
      for (const attempt of person.attempts) {
        expect(attempt.likert).toHaveLength(4);
        expect(new Set(attempt.likert).size).toBeGreaterThanOrEqual(2);
        attempt.likert.forEach((value) => expect([1, 2, 3, 4, 5]).toContain(value));
      }
  });
  it('Повторное прохождение отличается 2–4 ситуациями и 0–1 утверждением', () => {
    for (const person of demoEmployees.filter((person) => person.attempts.length === 2)) {
      const [before, after] = person.attempts;
      const changed = [...after.pattern].filter((letter, i) => letter !== before.pattern[i]).length;
      expect(changed).toBeGreaterThanOrEqual(2);
      expect(changed).toBeLessThanOrEqual(4);
      expect(after.likert.filter((value, i) => value !== before.likert[i]).length).toBeLessThanOrEqual(1);
    }
  });
  it('Динамика каждого качества ограничена ±15 п.п.', () => {
    for (const { current, previous } of histories)
      for (const trait of TRAIT_ORDER) {
        expect(Math.abs(current.percents[trait] - previous.percents[trait])).toBeLessThanOrEqual(15);
      }
  });
  it('Айдос: индекс +5…+12, одно снижение на 3–6 п.п., минимум два роста, итог 55–72%', () => {
    const { current, previous } = histories[0];
    expect(current.participant.name).toBe('Айдос Нурланов');
    expect(current.overall - previous.overall).toBeGreaterThanOrEqual(5);
    expect(current.overall - previous.overall).toBeLessThanOrEqual(12);
    expect(current.overall).toBeGreaterThanOrEqual(55);
    expect(current.overall).toBeLessThanOrEqual(72);
    const deltas = TRAIT_ORDER.map((trait) => current.percents[trait] - previous.percents[trait]);
    const drops = deltas.filter((delta) => delta < 0);
    expect(drops).toHaveLength(1);
    expect(drops[0]).toBeGreaterThanOrEqual(-6);
    expect(drops[0]).toBeLessThanOrEqual(-3);
    expect(deltas.filter((delta) => delta > 0).length).toBeGreaterThanOrEqual(2);
  });
  it('Алия растёт на 2–8 п.п., Тимур снижается на 2–6 п.п.', () => {
    const alia = histories[1],
      timur = histories[2];
    expect(alia.current.participant.name).toBe('Алия Серикова');
    expect(timur.current.participant.name).toBe('Тимур Садыков');
    expect(alia.current.overall - alia.previous.overall).toBeGreaterThanOrEqual(2);
    expect(alia.current.overall - alia.previous.overall).toBeLessThanOrEqual(8);
    expect(timur.current.overall - timur.previous.overall).toBeGreaterThanOrEqual(-6);
    expect(timur.current.overall - timur.previous.overall).toBeLessThanOrEqual(-2);
  });
  it('Каждое качество слабейшее минимум у одного и максимум у троих', () => {
    for (const trait of TRAIT_ORDER) {
      const count = latest.filter((record) => weakestTrait(record.percents) === trait).length;
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(3);
    }
  });
  it('Минимум пять архетипов, представлены все пять животных', () => {
    expect(new Set(latest.map((record) => record.archetype.name)).size).toBeGreaterThanOrEqual(5);
    expect(new Set(latest.map((record) => record.archetype.emoji))).toEqual(new Set(['🦉', '🐻', '🦫', '🐺', '🦊']));
  });
  it('Индексы последних прохождений 38–75%, одинаковый индекс максимум у двоих', () => {
    for (const record of latest) {
      expect(record.overall).toBeGreaterThanOrEqual(38);
      expect(record.overall).toBeLessThanOrEqual(75);
      expect(latest.filter((other) => other.overall === record.overall).length).toBeLessThanOrEqual(2);
    }
  });
});
