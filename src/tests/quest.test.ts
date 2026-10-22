import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { CALLBACKS, CONSEQUENCES, MENTOR_INTROS, MENTOR_NARRATIONS, SCENES, LOCATIONS } from '../data/quest';
import { applyDeltas, buildJournal, callbackText, indicatorsAfter, pickEpilogue, skyAt, INITIAL_INDICATORS } from '../lib/quest';

describe('Контент и механика квеста', () => {
  it('Подписи всех девяти локаций — текст без emoji', () => {
    expect(Object.keys(LOCATIONS)).toHaveLength(9);
    for (const label of Object.values(LOCATIONS)) expect(label).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(LOCATIONS.ptoOffice).toBe('Офис ПТО');
    expect(SCENES.q12.location).toBe('ptoOffice');
    expect(SCENES.q12.npcLines[0].npcId).toBe('pto');
  });
  it('Стартовые игровые показатели: 80 / 30 / 60 / 65', () => {
    expect(INITIAL_INDICATORS).toEqual({ schedule: 80, quality: 30, safety: 60, team: 65 });
    expect(indicatorsAfter({})).toEqual(INITIAL_INDICATORS);
  });
  it('Реплики наставника без тире в начале; повествование есть у q04 и q08', () => {
    for (const id of ['q04', 'q08', 'q11', 'q14']) {
      expect(MENTOR_INTROS[id]).toBeTruthy();
      expect(MENTOR_INTROS[id]).not.toMatch(/^[—−-]/);
    }
    expect(MENTOR_NARRATIONS.q04).toBeTruthy();
    expect(MENTOR_NARRATIONS.q11).toBe('');
  });
  it('Покрытие 15 сцен, 44 последствий и пауз', () => {
    expect(Object.keys(SCENES)).toHaveLength(15);
    expect(CONSEQUENCES).toHaveLength(44);
    for (const question of questions) {
      expect(SCENES[question.id].questionId).toBe(question.id);
      if (question.type === 'situation') {
        expect(CONSEQUENCES.filter(item => item.questionId === question.id).map(item => item.optionId))
          .toEqual(['A', 'B', 'C', 'D']);
      } else {
        expect(SCENES[question.id].location).toBe('cabin');
        expect(MENTOR_INTROS[question.id]).toBeTruthy();
      }
    }
  });
  it('У каждого решения есть плюс и минус, кроме финального q15', () => {
    for (const item of CONSEQUENCES) {
      const values = Object.values(item.deltas);
      if (item.questionId === 'q15') expect(values).toEqual([]);
      else { expect(values.some(value => value > 0)).toBe(true); expect(values.some(value => value < 0)).toBe(true); }
      values.forEach(value => expect([-10, -5, 5, 10]).toContain(value));
    }
  });
  it('Полные отсылки только на более ранние вопросы', () => {
    expect(CALLBACKS).toHaveLength(4);
    for (const item of CALLBACKS) {
      expect(Object.keys(item.textByOption).sort()).toEqual(['A', 'B', 'C', 'D']);
      expect(questions.findIndex(q => q.id === item.dependsOn))
        .toBeLessThan(questions.findIndex(q => q.id === item.atQuestionId));
      for (const answer of ['A', 'B', 'C', 'D'] as const) {
        expect(callbackText(item.atQuestionId, { [item.dependsOn]: answer })).toBe(item.textByOption[answer]);
      }
    }
  });
  it('Ограничение 0..100 и отсутствие мутации', () => {
    const state = { schedule: 2, quality: 99, safety: 100, team: 0 };
    expect(applyDeltas(state, { schedule: -10, quality: 10, safety: 5, team: -5 }))
      .toEqual({ schedule: 0, quality: 100, safety: 100, team: 0 });
    expect(state).toEqual({ schedule: 2, quality: 99, safety: 100, team: 0 });
  });
  it('Ничьи эпилога: safety → quality → team → schedule', () => {
    expect(pickEpilogue({ schedule: 60, quality: 60, safety: 60, team: 60 }).id).toBe('safety');
    expect(pickEpilogue({ schedule: 80, quality: 80, safety: 60, team: 80 }).id).toBe('quality');
    expect(pickEpilogue({ schedule: 80, quality: 60, safety: 60, team: 80 }).id).toBe('team');
    expect(pickEpilogue({ schedule: 90, quality: 60, safety: 60, team: 80 }).id).toBe('schedule');
  });
  it('Журнал содержит ровно 11 ситуаций в порядке дня; показатели считаются последовательно', () => {
    const answers = Object.fromEntries(questions.map(q => [q.id, q.type === 'situation' ? 'A' as const : 3 as const]));
    expect(buildJournal(answers).map(item => item.question.id))
      .toEqual(questions.filter(q => q.type === 'situation').map(q => q.id));
    expect(indicatorsAfter(answers)).toEqual({ schedule: 40, quality: 80, safety: 65, team: 90 });
  });
  it('Четыре палитры и дуга солнца', () => {
    expect(['07:00', '09:00', '16:00', '19:00'].map(time => skyAt(time).top))
      .toEqual(['#FFD8A8', '#8EC9FF', '#FFC48A', '#F28C28']);
    expect(skyAt('13:00').sunY).toBeLessThan(skyAt('07:00').sunY);
    expect(skyAt('19:00').sunX).toBeGreaterThan(skyAt('07:00').sunX);
  });
});
