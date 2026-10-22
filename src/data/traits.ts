// Утверждённый контент продукта; любые изменения фиксирует снимок src/tests/__snapshots__/content.test.ts.snap
import type { TraitId } from '../lib/types';
interface Trait { id: TraitId; name: string; description: string; color: string; useStrength: string }
export const traits: Record<TraitId, Trait> = {
  "critical": {
    "id": "critical",
    "name": "Критическое мышление",
    "description": "Проверяет основания, видит риски и несоответствия, ищет причины",
    "color": "#1668B8",
    "useStrength": "Берите на себя проверку рисков перед ключевыми этапами: приёмка арматуры, бетонирование, сдача этажа."
  },
  "confidence": {
    "id": "confidence",
    "name": "Уверенность в себе",
    "description": "Берёт слово и ответственность, держит позицию, решает без лишней эскалации",
    "color": "#F28C28",
    "useStrength": "Проводите планёрки и переговоры со смежниками: ваша позиция помогает быстрее снимать вопросы."
  },
  "discipline": {
    "id": "discipline",
    "name": "Дисциплина",
    "description": "Работает по регламенту, технологии, плану; доводит документацию до конца",
    "color": "#0B3B6F",
    "useStrength": "Станьте ответственным за качество исполнительной документации на участке и помогайте коллегам."
  },
  "engagement": {
    "id": "engagement",
    "name": "Вовлечённость",
    "description": "Вкладывается в результат объекта и команды, проявляет инициативу, развивается",
    "color": "#2E9E5B",
    "useStrength": "Становитесь наставником для новых сотрудников и проводником изменений на объекте."
  }
};
