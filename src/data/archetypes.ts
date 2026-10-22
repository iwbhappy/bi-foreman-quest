// Утверждённый контент продукта; любые изменения фиксирует снимок src/tests/__snapshots__/content.test.ts.snap
import type { TraitId } from '../lib/types';
interface Animal { animal: string; emoji: string; animalDescription: string; role: string; roleDescription: string }
export const archetypes: Record<TraitId, Animal> = {
  "critical": {
    "animal": "Сова",
    "emoji": "🦉",
    "animalDescription": "Вы замечаете то, что другие пропускают: несоответствия в чертежах, риски в графике, слабые места в решениях.",
    "role": "стратег",
    "roleDescription": "Решения принимаете с опорой на анализ и расчёт."
  },
  "confidence": {
    "animal": "Медведь",
    "emoji": "🐻",
    "animalDescription": "Вы берёте ответственность и держите позицию, когда на объекте нужно быстро принять решение.",
    "role": "лидер",
    "roleDescription": "Не боитесь взять слово и повести за собой."
  },
  "discipline": {
    "animal": "Бобр",
    "emoji": "🦫",
    "animalDescription": "Вы строите надёжно и по правилам: порядок в документах, технологии и сроках.",
    "role": "мастер",
    "roleDescription": "Доводите дело до конца строго по технологии."
  },
  "engagement": {
    "animal": "Волк",
    "emoji": "🐺",
    "animalDescription": "Вы живёте результатом команды и объекта и тянете за собой других.",
    "role": "наставник",
    "roleDescription": "Вкладываетесь в людей вокруг и делитесь опытом."
  }
};
export const universal = {"key": "universal", "name": "Универсал", "emoji": "🦊", "description": "Качества развиты ровно: вы одинаково уверенно чувствуете себя в анализе, решениях, порядке и командной работе. Следующий шаг — выбрать одно качество и сделать его своей опорой."};
