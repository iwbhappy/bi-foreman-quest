import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { recommendations } from '../data/recommendations';
import { archetypes, universal } from '../data/archetypes';
import { traits } from '../data/traits';
import { academyRoute, retestText } from '../data/routes';
import { methodology, levelRanges } from '../data/method';
import {
  CALLBACKS,
  CONSEQUENCES,
  EPILOGUES,
  LOCATIONS,
  MENTOR_INTROS,
  MENTOR_NARRATIONS,
  MORNING_CONTEXT,
  NPCS,
  SCENES,
  SHIFT_DISCLAIMER,
  START_INDICATORS,
} from '../data/quest';
import { EVENT_CATALOG, STAGE_SEQUENCES } from '../data/stageEvents';
import { ru } from '../i18n/ru';

// Утверждённый контент продукта зафиксирован снимком (__snapshots__/content.test.ts.snap).
// Любая правка текстов вопросов, весов, рекомендаций, архетипов, квеста, событий сцены или методики
// роняет этот тест; осознанное изменение контента — обновить снимок: npx vitest run -u src/tests/content.test.ts
describe('Утверждённый контент', () => {
  it('Банк вопросов и веса', () => expect(questions).toMatchSnapshot());
  it('Рекомендации, качества, архетипы, маршрут', () =>
    expect({ recommendations, traits, archetypes, universal, academyRoute, retestText }).toMatchSnapshot());
  it('Квест: сцены, персонажи, последствия, отсылки, наставник, эпилоги', () =>
    expect({
      SCENES,
      NPCS,
      LOCATIONS,
      CONSEQUENCES,
      CALLBACKS,
      MENTOR_INTROS,
      MENTOR_NARRATIONS,
      EPILOGUES,
      START_INDICATORS,
      MORNING_CONTEXT,
      SHIFT_DISCLAIMER,
    }).toMatchSnapshot());
  it('События сцены: словарь, последовательности, подписи, эмоции', () =>
    expect({ EVENT_CATALOG, STAGE_SEQUENCES }).toMatchSnapshot());
  it('Методика и ключевые тексты интерфейса', () =>
    expect({
      methodology,
      levelRanges,
      subtitle: ru.subtitle,
      levels: ru.levels,
      managerDisclaimer: ru.dashboard.managerDisclaimer,
    }).toMatchSnapshot());
});
