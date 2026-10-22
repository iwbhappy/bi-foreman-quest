import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SKIN, HELMETS } from '../data/skins';
import { demoEmployees } from '../data/demoTeam';
import { randomSkin, resolveSkin, validSkin } from '../lib/skin';
import { buildDemoTeam } from '../lib/team';
import { createQuestResult } from '../lib/questResult';
import { loadQuestProgress, loadResults } from '../lib/storage';
import type { QuestProgress } from '../lib/types';

describe('Скин: модель, миграция и независимость оценки', () => {
  const record = buildDemoTeam()[0];
  const progress: QuestProgress = {
    methodologyVersion: '1.0',
    participant: record.participant,
    answers: record.answers,
    sessionSeed: 'skin-test',
    currentIndex: 14,
    startedAt: record.createdAt,
    perQuestionSec: record.perQuestionSec,
    helmetColor: '#1668B8',
    consequenceShown: false,
    stage: 'play',
  };
  it('Проверяет каждое поле и не принимает посторонние значения', () => {
    expect(validSkin(DEFAULT_SKIN)).toBe(true);
    for (const key of Object.keys(DEFAULT_SKIN)) expect(validSkin({ ...DEFAULT_SKIN, [key]: 'bad' })).toBe(false);
    for (const value of [undefined, null, [], {}, 42]) expect(validSkin(value)).toBe(false);
  });
  it('Мигрирует все прежние каски без изменения остального образа', () => {
    for (const [helmet, color] of Object.entries(HELMETS)) {
      expect(resolveSkin(undefined, color)).toEqual({ ...DEFAULT_SKIN, helmet });
    }
    expect(resolveSkin({ helmet: 'bad' }, 'bad')).toEqual(DEFAULT_SKIN);
  });
  it('Чтение старых результата и прогресса добавляет скин', () => {
    const saved = { ...record, helmetColor: '#1668B8' };
    delete saved.skin;
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => JSON.stringify(key.endsWith('quest-progress') ? progress : [saved]),
      setItem: () => {},
    });
    try {
      expect(loadResults()[0].skin).toEqual({ ...DEFAULT_SKIN, helmet: 'blue' });
      expect(loadQuestProgress()?.skin).toEqual({ ...DEFAULT_SKIN, helmet: 'blue' });
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it('Случайный герой всегда валиден, включая граничные значения генератора', () => {
    for (let i = 0; i < 100; i++) expect(validSkin(randomSkin())).toBe(true);
    for (const value of [0, 0.999999, 1]) expect(validSkin(randomSkin(() => value))).toBe(true);
  });
  it('Каски восьми демо-сотрудников идут по кругу шести цветов', () => {
    expect(new Set(demoEmployees.map((person) => person.skin?.helmet)).size).toBe(6);
    demoEmployees.forEach((person) => expect(validSkin(person.skin)).toBe(true));
  });
  it('20 случайных скинов не меняют ни одно поле оценки', () => {
    const expected = createQuestResult(progress);
    for (let i = 0; i < 20; i++) {
      const skin = randomSkin();
      const result = createQuestResult({ ...progress, skin, helmetColor: HELMETS[skin.helmet] });
      for (const key of ['percents', 'archetype', 'strengths', 'growthZones', 'overall', 'levels'] as const) {
        expect(result[key]).toEqual(expected[key]);
      }
      expect(result.skin).toEqual(skin);
    }
  });
});

