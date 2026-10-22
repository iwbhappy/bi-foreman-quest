import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuestProgress } from '../lib/types';
import { DEFAULT_SKIN } from '../data/skins';
const saved: QuestProgress = {
  methodologyVersion: '1.0',
  participant: { name: '', position: 'Прораб', experience: '1–3 года' },
  answers: { q01: 'A' },
  sessionSeed: 'seed',
  currentIndex: 0,
  startedAt: '2026-10-19T07:00:00Z',
  perQuestionSec: { q01: 7 },
  helmetColor: '#1668B8',
  consequenceShown: true,
  stage: 'play',
  skin: { ...DEFAULT_SKIN, helmet: 'blue' },
};
beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('localStorage', { getItem: vi.fn(() => JSON.stringify(saved)), setItem: vi.fn(), removeItem: vi.fn() });
});
describe('Восстановление квеста', () => {
  it('Восстанавливает флаг последствия, ответ, seed, время и каску', async () => {
    const storage = await import('../lib/storage');
    expect(storage.loadQuestProgress()).toEqual(saved);
    storage.saveQuestProgress(saved);
    expect(localStorage.setItem).toHaveBeenCalledWith('bi-profile:v1:quest-progress', JSON.stringify(saved));
  });
  it('Игнорирует несовместимую версию, неполные этапы и некорректные типы', async () => {
    const storage = await import('../lib/storage');
    for (const invalid of [
      { ...saved, methodologyVersion: '2.0' },
      { ...saved, helmetColor: 'bad' },
      { ...saved, answers: {} },
      { ...saved, currentIndex: 3 },
      { ...saved, stage: 'report' },
      { ...saved, currentIndex: -1 },
      { ...saved, perQuestionSec: { q01: -1 } },
    ]) {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(invalid));
      expect(storage.loadQuestProgress()).toBeNull();
    }
  });
  it('При запрете localStorage сохраняет последствие в памяти', async () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
      removeItem() {
        throw new Error('blocked');
      },
    });
    const storage = await import('../lib/storage');
    storage.saveQuestProgress(saved);
    expect(storage.loadQuestProgress()).toEqual(saved);
    expect(storage.storageUnavailable()).toBe(true);
    storage.clearQuestProgress();
    expect(storage.loadQuestProgress()).toBeNull();
  });
});
