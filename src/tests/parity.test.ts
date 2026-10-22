import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import coreIntegrity from './core-integrity.json';
import { questions } from '../data/questions';
import { CONSEQUENCES } from '../data/quest';
import { createResult } from '../lib/result';
import { createQuestResult } from '../lib/questResult';
import type { AnswerValue, Progress, ResultRecord } from '../lib/types';

function profile(record: ResultRecord) {
  const { percents, overall, archetype, strengths, growthZones } = record;
  return { percents, overall, key: archetype.key, strengths, growthZones };
}
function fixture(seed: number): Progress {
  let state = seed;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  return {
    methodologyVersion: '1.0', participant: { name: '', position: 'Прораб', experience: '1–3 года' },
    answers: Object.fromEntries(questions.map(question => [question.id, question.type === 'situation'
      ? question.options[Math.floor(random() * 4)].id : Math.floor(random() * 7) as AnswerValue])),
    sessionSeed: String(seed), currentIndex: 14, startedAt: '2026-10-19T07:00:00Z',
    perQuestionSec: Object.fromEntries(questions.map(question => [question.id, 12])),
  };
}
describe('Квест и классический режим: паритет', () => {
  it('50 наборов с детерминированным seed дают одинаковый профиль', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const progress = fixture(seed);
      const classic = createResult(progress);
      const quest = createQuestResult({ ...progress, helmetColor: '#F2C230' });
      expect(profile(quest)).toEqual(profile(classic));
      expect(quest.mode).toBe('quest'); expect(quest.helmetColor).toBe('#F2C230');
      expect(quest).not.toHaveProperty('indicators');
      expect(quest).not.toHaveProperty('journal');
    }
  });
  it('Мутация всех игровых deltas не влияет на профиль', () => {
    const progress = fixture(42);
    const expected = profile(createResult(progress));
    const original = CONSEQUENCES.map(item => ({ ...item.deltas }));
    try {
      CONSEQUENCES.forEach(item => { item.deltas = { schedule: -10, quality: -10, safety: -10, team: -10 }; });
      expect(profile(createQuestResult({ ...progress, helmetColor: '#1668B8' }))).toEqual(expected);
    } finally { CONSEQUENCES.forEach((item, i) => { item.deltas = original[i]; }); }
  });
  it('Ядро не импортирует квест, исходные файлы подсчёта и банка не изменены', () => {
    for (const name of ['scoring', 'analysis', 'recommend']) {
      const code = readFileSync(new URL(`../lib/${name}.ts`, import.meta.url), 'utf8');
      expect(code).not.toMatch(/from\s+['"][^'"]*\/quest(?:Result)?(?:\.ts)?['"]/);
    }
    for (const [path, expected] of Object.entries(coreIntegrity)) {
      // Переводы строк приводятся к LF: хеш одинаков на Windows (CRLF в рабочей копии) и в CI на Linux.
      const code = readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
      expect(createHash('sha256').update(code).digest('hex').toUpperCase()).toBe(expected);
    }
  });
});
