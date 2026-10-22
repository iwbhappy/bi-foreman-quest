import { describe, expect, it } from 'vitest';
import { ru } from '../i18n/ru';
describe('Правки текстов без изменения оценки', () => {
  it('Предупреждение содержит только сработавшие причины без разделителя /', () => {
    expect(ru.warning(['too_fast'])).toBe('Возможно, результат неточный: вы отвечали очень быстро. '
      + 'Рекомендуем пройти тест ещё раз в спокойной обстановке.');
    expect(ru.warning(['likert_straightline'])).not.toContain('очень быстро');
    expect(ru.warning(['likert_straightline'])).toContain('на все утверждения выбран один и тот же крайний ответ');
    expect(ru.warning(['too_fast', 'likert_contradiction'])).toContain('быстро; ответы');
    expect(ru.warning(['too_fast', 'likert_contradiction', 'likert_straightline'])).not.toContain('/');
  });
  it('Плашка главной и подпись уровня growth', () => {
    expect(ru.levels.growth).toBe('Требует развития');
    expect(ru.testSummary).toBe('15 вопросов · ~10 минут');
  });
});
