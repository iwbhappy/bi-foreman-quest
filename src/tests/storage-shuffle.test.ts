import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shuffle, hash } from '../lib/shuffle';
import { questions } from '../data/questions';
import { createResult } from '../lib/result';
import type { Progress } from '../lib/types';
const progress: Progress = { methodologyVersion: '1.0', participant: { name: '', position: 'Прораб', experience: '1–3 года' }, answers: { q01: 'A', q02: 'B', q03: 'C' }, sessionSeed: 'test', currentIndex: 3, startedAt: new Date().toISOString(), perQuestionSec: { q01: 12 } };
beforeEach(() => { vi.resetModules(); vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() }); });
describe('Хранилище и перемешивание', () => {
  it('Детерминированная перестановка без мутаций и потери элементов', () => {
    const original = ['A', 'B', 'C', 'D'];
    const a = shuffle(original, hash('seedq01'));
    expect(a).toEqual(shuffle(original, hash('seedq01')));
    expect([...a].sort()).toEqual(original);
    expect(original).toEqual(['A', 'B', 'C', 'D']);
    expect(new Set(Array.from({ length: 20 }, (_, i) => shuffle(original, hash(String(i))).join(''))).size).toBeGreaterThan(5);
  });
  it('Сохраняет и валидирует прогресс, игнорирует старые/повреждённые данные', async () => {
    const s = await import('../lib/storage');
    const get = vi.mocked(localStorage.getItem);
    get.mockReturnValue(JSON.stringify(progress)); expect(s.loadProgress()).toEqual(progress);
    get.mockReturnValue(JSON.stringify({ ...progress, methodologyVersion: '2.0' })); expect(s.loadProgress()).toBeNull();
    get.mockReturnValue(JSON.stringify({ ...progress, answers: { q01: 6 } })); expect(s.loadProgress()).toBeNull();
    get.mockReturnValue(JSON.stringify({ ...progress, currentIndex: 14 })); expect(s.loadProgress()).toBeNull();
    get.mockReturnValue('{broken'); expect(() => s.loadProgress()).not.toThrow();
    s.clearProgress(); get.mockReturnValue(null); expect(s.loadProgress()).toBeNull();
  });
  it('При запрете localStorage работает через память, включая результат и чекбоксы', async () => {
    vi.stubGlobal('localStorage', { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } });
    const s = await import('../lib/storage');
    s.probeStorage(); expect(s.storageUnavailable()).toBe(true);
    s.saveProgress(progress); expect(s.loadProgress()).toEqual(progress);
    s.savePlan('id', [true, false, false, true]); expect(s.loadPlan('id')).toEqual([true, false, false, true]);
    const result = createResult({ ...progress, answers: Object.fromEntries(questions.map(q => [q.id, q.type === 'situation' ? 'A' : 3])) });
    s.saveResult(result); expect(s.loadResults()).toEqual([result]);
  });
});
