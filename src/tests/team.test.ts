import { describe, expect, it } from 'vitest';
import { demoEmployees } from '../data/demoTeam';
import { recommendations } from '../data/recommendations';
import { calculate, completeAnswers } from '../lib/scoring';
import {
  allProfiles,
  averageProfile,
  buildDemoTeam,
  developmentGroups,
  firstPrevious,
  isDemoRecord,
  latestProfiles,
  participantKey,
  academyNextStep,
} from '../lib/team';
import { deriveProfile } from '../lib/profiles';
import { coverageRows, coverageTotals } from '../lib/method';
import { TRAIT_ORDER } from '../lib/types';

describe('Команда, карточка и методика', () => {
  it('8 сотрудников, 11 прохождений, у троих история; каждый профиль вычисляется из ответов', () => {
    expect(demoEmployees).toHaveLength(8);
    const records = buildDemoTeam();
    expect(records).toHaveLength(11);
    expect(new Set(records.map((record) => record.id)).size).toBe(11);
    const counts = new Map<string, number>();
    records.forEach((record) => counts.set(participantKey(record), (counts.get(participantKey(record)) ?? 0) + 1));
    expect([...counts.values()].sort()).toEqual([1, 1, 1, 1, 1, 2, 2, 2]);
    for (const record of records) {
      expect(completeAnswers(record.answers)).toBe(true);
      expect(record.percents).toEqual(calculate(record.answers).percents);
      expect(record.overall).toBe(calculate(record.answers).overall);
      expect(isDemoRecord(record)).toBe(true);
      expect(record).not.toHaveProperty('indicators');
    }
  });
  it('Для динамики берётся первый предыдущий результат того же имени и должности', () => {
    const records = buildDemoTeam();
    const latest = latestProfiles(records);
    expect(latest).toHaveLength(8);
    const first = latest[0],
      second = latest[1];
    expect(firstPrevious(records, first)?.id).toBe(records[0].id);
    expect(first.overall - firstPrevious(records, first)!.overall).toBe(5);
    expect(second.overall - firstPrevious(records, second)!.overall).toBe(3);
    expect(firstPrevious(records, records[0])).toBeUndefined();
    expect(firstPrevious(records, latest[3])).toBeUndefined();
  });
  it('Средний профиль использует последние результаты, одинаковые id не дублируются', () => {
    const records = buildDemoTeam();
    expect(allProfiles([records[0]])).toHaveLength(11);
    expect(averageProfile([records[0], records[1]])).toEqual({
      critical: 57,
      confidence: 42,
      discipline: 44,
      engagement: 67,
    });
    expect(averageProfile([])).toEqual({ critical: 0, confidence: 0, discipline: 0, engagement: 0 });
  });
  it('Каждый сотрудник ровно в одной группе, рекомендация — course из mid', () => {
    const latest = latestProfiles(buildDemoTeam());
    const groups = developmentGroups(latest);
    expect(groups.flatMap((group) => group.members)).toHaveLength(8);
    expect(new Set(groups.flatMap((group) => group.members.map((record) => record.id))).size).toBe(8);
    for (const group of groups)
      expect(group.course).toEqual(recommendations[group.trait].mid.find((r) => r.type === 'course'));
    expect(academyNextStep(latest[0].percents)).toEqual({ title: 'Планирование работ и ППР', academy: 'BuildEX' });
  });
  it('Подменённые проценты и игровые поля не переходят в управленческий профиль', () => {
    const record = buildDemoTeam()[0];
    const untrusted = {
      ...record,
      overall: 100,
      percents: { critical: 100, confidence: 100, discipline: 100, engagement: 100 },
      indicators: { schedule: 100 },
      journal: ['hidden'],
    };
    const recalculated = deriveProfile(untrusted);
    expect(recalculated.percents).toEqual(calculate(record.answers).percents);
    expect(recalculated).not.toHaveProperty('indicators');
    expect(recalculated).not.toHaveProperty('journal');
  });
  it('Таблица покрытия содержит 15 строк, итог вычисляется из банка', () => {
    const rows = coverageRows();
    expect(rows).toHaveLength(15);
    expect(coverageTotals().map((row) => row.max)).toEqual([34, 33, 33, 33]);
    for (const { trait, max } of coverageTotals())
      expect(rows.reduce((sum, row) => sum + row.maxima[trait], 0)).toBe(max);
    for (const row of rows.filter((row) => row.question.type === 'likert')) {
      expect(TRAIT_ORDER.map((trait) => row.maxima[trait]).filter((value) => value > 0)).toEqual([3]);
    }
  });
});
