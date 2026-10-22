import { describe, expect, it } from 'vitest';
import { qualityFlags } from '../lib/flags';
const normal = { q04: 4 as const, q08: 2 as const, q11: 5 as const, q14: 1 as const };
const times = Object.fromEntries(Array.from({ length: 15 }, (_, i) => [`q${i + 1}`, 10]));
describe('Флаги качества', () => {
  it('Нормальное прохождение без флагов', () => expect(qualityFlags(normal, 150, times)).toEqual([]));
  it('Быстрое общее время или медиана, включая чётную выборку', () => {
    expect(qualityFlags(normal, 89, times)).toContain('too_fast');
    expect(qualityFlags(normal, 150, { a: 2, b: 3, c: 4, d: 4 })).toContain('too_fast');
    expect(qualityFlags(normal, 90, { a: 4, b: 4 })).not.toContain('too_fast');
  });
  it('Противоречивые прямое и обратное утверждения', () => {
    expect(qualityFlags({ ...normal, q04: 5, q08: 5 }, 150, times)).toContain('likert_contradiction');
    expect(qualityFlags({ ...normal, q11: 5, q14: 5 }, 150, times)).toContain('likert_contradiction');
  });
  it('Одинаковые крайние ответы, но не нейтральные', () => {
    for (const v of [0, 6] as const) expect(qualityFlags({ q04: v, q08: v, q11: v, q14: v }, 150, times)).toContain('likert_straightline');
    expect(qualityFlags({ q04: 3, q08: 3, q11: 3, q14: 3 }, 150, times)).not.toContain('likert_straightline');
  });
});
