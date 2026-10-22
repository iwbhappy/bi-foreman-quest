import { describe, expect, it } from 'vitest';
import { parseResultJSON } from '../lib/importResult';
import { buildDemoTeam } from '../lib/team';

describe('Импорт результата JSON', () => {
  const record = buildDemoTeam()[0];
  it('Принимает экспорт и пересчитывает производные поля из ответов', () => {
    const value = { ...record, overall: 0, indicators: { schedule: 100 }, team: 100,
      percents: { critical: 0, confidence: 0, discipline: 0, engagement: 0 } };
    const result = parseResultJSON(JSON.stringify(value));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record).toEqual(record);
    expect(result.record).not.toHaveProperty('indicators');
    expect(result.record).not.toHaveProperty('team');
  });
  it('Отличает ошибки JSON, версии и ответов', () => {
    expect(parseResultJSON('{broken')).toEqual({ ok: false, error: 'json' });
    expect(parseResultJSON('[]')).toEqual({ ok: false, error: 'format' });
    expect(parseResultJSON(JSON.stringify({ ...record, methodologyVersion: '2.0' }))).toEqual({ ok: false, error: 'version' });
    expect(parseResultJSON(JSON.stringify({ ...record, answers: { q01: 'X' } }))).toEqual({ ok: false, error: 'answers' });
  });
  it('Проверяет обязательные поля, uuid, даты, время, режим и цвет', () => {
    for (const changes of [
      { id: '../path' }, { createdAt: 'not-a-date' }, { participant: { name: 'Имя' } },
      { durationSec: -1 }, { durationSec: record.durationSec + 1 }, { perQuestionSec: {} },
      { helmetColor: 'url(bad)' }, { mode: 'other' }, { flags: ['unknown'] }, { archetype: null },
    ]) expect(parseResultJSON(JSON.stringify({ ...record, ...changes }))).toEqual({ ok: false, error: 'format' });
  });
  it('Совместим с классическим экспортом без mode и helmetColor', () => {
    const copy = { ...record };
    delete copy.mode; delete copy.helmetColor;
    expect(parseResultJSON(JSON.stringify(copy))).toEqual({ ok: true, record: copy });
  });
});
