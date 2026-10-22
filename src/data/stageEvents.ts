// Утверждённый контент продукта; любые изменения фиксирует снимок src/tests/__snapshots__/content.test.ts.snap
export interface StageStep {
  id: StageEventId;
  label?: string;
  target?: string;
  alert?: boolean;
}
export interface StageSequence {
  questionId: string;
  optionId: string;
  steps: StageStep[];
  moods: { npcId: string; emotions: string[] }[];
}
export const EVENT_CATALOG = {
  crew_idle: {
    description: 'Бригада садится, над ней часы и «z z»',
    label: 'Простой',
  },
  crew_work: {
    description: 'Бригада работает: молоток, искры, мини-прогрессбар',
    label: '',
  },
  crew_move: {
    description: 'Бригада уходит на другой фронт (переход вправо)',
    label: 'Другой фронт',
  },
  stop_work: {
    description: 'Поднимается табличка СТОП',
    label: 'Работы остановлены',
  },
  mixer_arrive: {
    description: 'Миксер въезжает, барабан крутится',
    label: '',
  },
  mixer_leave: {
    description: 'Миксер разворачивается и уезжает',
    label: 'Машина возвращена',
  },
  pour_concrete: {
    description: 'Серый поток из лотка на перекрытие, перекрытие заполняется',
    label: 'Бетонирование',
  },
  slump_test: {
    description: 'Конус, смесь «оседает», значок ✗',
    label: 'Осадка конуса: вне нормы',
  },
  samples: {
    description: 'Три кубика укладываются в ящик и уезжают',
    label: 'Образцы в лабораторию',
  },
  inspector_check: {
    description: 'Технадзор с планшетом, сначала «!», потом ✓',
    label: 'Принято с замечаниями',
  },
  document: {
    description: 'Лист/журнал, ручка, штамп',
    label: '',
  },
  phone_call: {
    description: 'Телефон вибрирует, волны сигнала',
    label: '',
  },
  meeting: {
    description: 'Стол, 2–3 человека, облачка «…»',
    label: '',
  },
  blueprint: {
    description: 'Чертёж разворачивается, карандаш, выделение узла',
    label: '',
  },
  analysis: {
    description: 'Лупа проходит по документу',
    label: '',
  },
  safety_fix: {
    description: 'Карабин перестёгивается, зелёная вспышка-щит',
    label: 'Страховка в порядке',
  },
  anchor_add: {
    description: 'На конструкции появляются 2 новые анкерные точки',
    label: '+2 анкерные точки',
  },
  truck_delivery: {
    description: 'Грузовик с арматурой въезжает',
    label: '',
  },
  calendar: {
    description: 'Листок календаря перелистывается',
    label: '',
  },
  night_work: {
    description: 'Сцена темнеет, прожекторы, луна',
    label: '',
  },
  tablet: {
    description: 'Планшет, появляются галочки',
    label: '',
  },
  tablet_glitch: {
    description: 'Планшет мигает «⚠», рядом бумажный журнал',
    label: 'Сбой — выручил журнал',
  },
  idea: {
    description: 'Лампочка, затем 3 копии листа разлетаются к трём «участкам»',
    label: '',
  },
  team_cheer: {
    description: 'Люди поднимают руки, лёгкие частицы',
    label: '',
  },
  npc_leave: {
    description: 'NPC уходит из кадра',
    label: '',
  },
  npc_mood: {
    description: 'Над NPC всплывает emoji-эмоция и держится до конца сцены',
    label: '',
  },
} as const;
export type StageEventId = keyof typeof EVENT_CATALOG;
export const STAGE_SEQUENCES: StageSequence[] = [
  {
    questionId: 'q01',
    optionId: 'A',
    steps: [
      {
        id: 'stop_work',
      },
      {
        id: 'crew_move',
      },
    ],
    moods: [
      {
        npcId: 'boss',
        emotions: ['😠', '😐'],
      },
    ],
  },
  {
    questionId: 'q01',
    optionId: 'B',
    steps: [
      {
        id: 'meeting',
      },
      {
        id: 'crew_idle',
      },
    ],
    moods: [
      {
        npcId: 'boss',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q01',
    optionId: 'C',
    steps: [
      {
        id: 'phone_call',
      },
      {
        id: 'inspector_check',
      },
      {
        id: 'pour_concrete',
      },
    ],
    moods: [
      {
        npcId: 'boss',
        emotions: ['👍'],
      },
    ],
  },
  {
    questionId: 'q01',
    optionId: 'D',
    steps: [
      {
        id: 'document',
        label: 'Запись в журнале',
      },
      {
        id: 'stop_work',
      },
      {
        id: 'crew_idle',
      },
    ],
    moods: [
      {
        npcId: 'boss',
        emotions: ['😐'],
      },
    ],
  },
  {
    questionId: 'q02',
    optionId: 'A',
    steps: [
      {
        id: 'slump_test',
      },
      {
        id: 'mixer_leave',
      },
      {
        id: 'crew_idle',
      },
    ],
    moods: [
      {
        npcId: 'foreman',
        emotions: ['😒'],
      },
    ],
  },
  {
    questionId: 'q02',
    optionId: 'B',
    steps: [
      {
        id: 'document',
        label: 'Накладная и паспорт',
      },
      {
        id: 'phone_call',
      },
      {
        id: 'crew_idle',
      },
    ],
    moods: [
      {
        npcId: 'foreman',
        emotions: ['😐'],
      },
    ],
  },
  {
    questionId: 'q02',
    optionId: 'C',
    steps: [
      {
        id: 'pour_concrete',
      },
    ],
    moods: [
      {
        npcId: 'foreman',
        emotions: ['👍'],
      },
    ],
  },
  {
    questionId: 'q02',
    optionId: 'D',
    steps: [
      {
        id: 'pour_concrete',
      },
      {
        id: 'samples',
      },
    ],
    moods: [
      {
        npcId: 'foreman',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q03',
    optionId: 'A',
    steps: [
      {
        id: 'blueprint',
        label: 'Ваше решение узла',
      },
      {
        id: 'phone_call',
      },
      {
        id: 'document',
        label: 'Согласовано',
      },
    ],
    moods: [
      {
        npcId: 'surveyor',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q03',
    optionId: 'B',
    steps: [
      {
        id: 'stop_work',
      },
      {
        id: 'crew_move',
      },
    ],
    moods: [
      {
        npcId: 'surveyor',
        emotions: ['😐'],
      },
    ],
  },
  {
    questionId: 'q03',
    optionId: 'C',
    steps: [
      {
        id: 'crew_work',
      },
      {
        id: 'blueprint',
        label: '40 мм',
        alert: true,
      },
    ],
    moods: [
      {
        npcId: 'surveyor',
        emotions: ['😟'],
      },
    ],
  },
  {
    questionId: 'q03',
    optionId: 'D',
    steps: [
      {
        id: 'phone_call',
      },
      {
        id: 'crew_idle',
      },
    ],
    moods: [
      {
        npcId: 'surveyor',
        emotions: ['😐'],
      },
    ],
  },
  {
    questionId: 'q05',
    optionId: 'A',
    steps: [
      {
        id: 'safety_fix',
      },
      {
        id: 'team_cheer',
      },
    ],
    moods: [
      {
        npcId: 'installer',
        emotions: ['🙏'],
      },
    ],
  },
  {
    questionId: 'q05',
    optionId: 'B',
    steps: [
      {
        id: 'document',
        label: 'Предписание',
      },
      {
        id: 'safety_fix',
      },
    ],
    moods: [
      {
        npcId: 'installer',
        emotions: ['😒'],
      },
    ],
  },
  {
    questionId: 'q05',
    optionId: 'C',
    steps: [
      {
        id: 'stop_work',
      },
      {
        id: 'anchor_add',
      },
      {
        id: 'safety_fix',
      },
    ],
    moods: [
      {
        npcId: 'installer',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q05',
    optionId: 'D',
    steps: [
      {
        id: 'phone_call',
      },
      {
        id: 'safety_fix',
      },
    ],
    moods: [
      {
        npcId: 'installer',
        emotions: ['😒'],
      },
    ],
  },
  {
    questionId: 'q06',
    optionId: 'A',
    steps: [
      {
        id: 'meeting',
      },
      {
        id: 'team_cheer',
      },
    ],
    moods: [
      {
        npcId: 'electric',
        emotions: ['🙂'],
      },
      {
        npcId: 'finisher',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q06',
    optionId: 'B',
    steps: [
      {
        id: 'document',
        label: 'По ППР',
      },
      {
        id: 'crew_work',
      },
    ],
    moods: [
      {
        npcId: 'electric',
        emotions: ['😠'],
      },
      {
        npcId: 'finisher',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q06',
    optionId: 'C',
    steps: [
      {
        id: 'blueprint',
        label: 'Критический путь',
      },
      {
        id: 'npc_leave',
        target: 'finisher',
      },
      {
        id: 'crew_work',
      },
    ],
    moods: [
      {
        npcId: 'electric',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q06',
    optionId: 'D',
    steps: [
      {
        id: 'document',
        label: 'В протокол',
      },
    ],
    moods: [
      {
        npcId: 'electric',
        emotions: ['😠'],
      },
      {
        npcId: 'finisher',
        emotions: ['😠'],
      },
    ],
  },
  {
    questionId: 'q07',
    optionId: 'A',
    steps: [
      {
        id: 'phone_call',
      },
      {
        id: 'truck_delivery',
        label: 'Металл к вечеру',
      },
    ],
    moods: [
      {
        npcId: 'storekeeper',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q07',
    optionId: 'B',
    steps: [
      {
        id: 'document',
        label: 'Дозаявка',
      },
      {
        id: 'crew_work',
      },
    ],
    moods: [
      {
        npcId: 'storekeeper',
        emotions: ['😒'],
      },
    ],
  },
  {
    questionId: 'q07',
    optionId: 'C',
    steps: [
      {
        id: 'document',
        label: 'Дозаявка по регламенту',
      },
      {
        id: 'calendar',
        label: '+2 дня',
      },
      {
        id: 'crew_move',
      },
    ],
    moods: [
      {
        npcId: 'storekeeper',
        emotions: ['😐'],
      },
    ],
  },
  {
    questionId: 'q07',
    optionId: 'D',
    steps: [
      {
        id: 'analysis',
      },
      {
        id: 'document',
        label: 'Ошибка округления',
      },
    ],
    moods: [
      {
        npcId: 'storekeeper',
        emotions: ['😮'],
      },
    ],
  },
  {
    questionId: 'q09',
    optionId: 'A',
    steps: [
      {
        id: 'meeting',
      },
      {
        id: 'document',
        label: 'Расчёт выработки',
      },
    ],
    moods: [
      {
        npcId: 'boss',
        emotions: ['😐'],
      },
    ],
  },
  {
    questionId: 'q09',
    optionId: 'B',
    steps: [
      {
        id: 'meeting',
      },
      {
        id: 'night_work',
        label: 'Вторая смена',
      },
    ],
    moods: [
      {
        npcId: 'boss',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q09',
    optionId: 'C',
    steps: [
      {
        id: 'calendar',
        label: '−7 дней',
      },
    ],
    moods: [
      {
        npcId: 'boss',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q09',
    optionId: 'D',
    steps: [
      {
        id: 'analysis',
      },
      {
        id: 'calendar',
        label: '+1 день на анализ',
      },
    ],
    moods: [
      {
        npcId: 'boss',
        emotions: ['😐'],
      },
    ],
  },
  {
    questionId: 'q10',
    optionId: 'A',
    steps: [
      {
        id: 'meeting',
      },
    ],
    moods: [
      {
        npcId: 'pm',
        emotions: ['😐'],
      },
    ],
  },
  {
    questionId: 'q10',
    optionId: 'B',
    steps: [
      {
        id: 'night_work',
        label: 'Вечерняя проверка осей',
      },
      {
        id: 'analysis',
      },
    ],
    moods: [
      {
        npcId: 'pm',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q10',
    optionId: 'C',
    steps: [
      {
        id: 'document',
        label: 'Исполнительная съёмка',
      },
    ],
    moods: [
      {
        npcId: 'pm',
        emotions: ['😠'],
      },
    ],
  },
  {
    questionId: 'q10',
    optionId: 'D',
    steps: [
      {
        id: 'idea',
        label: 'Двойная проверка',
      },
    ],
    moods: [
      {
        npcId: 'pm',
        emotions: ['👍'],
      },
    ],
  },
  {
    questionId: 'q12',
    optionId: 'A',
    steps: [
      {
        id: 'night_work',
        label: '23:00',
      },
      {
        id: 'document',
        label: 'Всё закрыто',
      },
    ],
    moods: [
      {
        npcId: 'pto',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q12',
    optionId: 'B',
    steps: [
      {
        id: 'document',
        label: 'Задачи мастерам',
      },
      {
        id: 'crew_work',
      },
    ],
    moods: [
      {
        npcId: 'pto',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q12',
    optionId: 'C',
    steps: [
      {
        id: 'document',
        label: 'Часть закрыта',
      },
      {
        id: 'calendar',
        label: 'Новая дата',
      },
    ],
    moods: [
      {
        npcId: 'pto',
        emotions: ['😐'],
      },
    ],
  },
  {
    questionId: 'q12',
    optionId: 'D',
    steps: [
      {
        id: 'idea',
        label: 'Чек-лист для 3 участков',
      },
    ],
    moods: [
      {
        npcId: 'pto',
        emotions: ['👍'],
      },
    ],
  },
  {
    questionId: 'q13',
    optionId: 'A',
    steps: [
      {
        id: 'tablet',
        label: 'Фото дефекта в акт',
      },
      {
        id: 'team_cheer',
      },
    ],
    moods: [
      {
        npcId: 'foreman',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q13',
    optionId: 'B',
    steps: [
      {
        id: 'tablet',
        label: 'Строго по инструкции',
      },
    ],
    moods: [
      {
        npcId: 'foreman',
        emotions: ['😠'],
      },
    ],
  },
  {
    questionId: 'q13',
    optionId: 'C',
    steps: [
      {
        id: 'tablet',
      },
      {
        id: 'idea',
        label: '3 замечания разработчикам',
      },
    ],
    moods: [
      {
        npcId: 'foreman',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q13',
    optionId: 'D',
    steps: [
      {
        id: 'tablet_glitch',
      },
    ],
    moods: [
      {
        npcId: 'foreman',
        emotions: ['😐'],
      },
    ],
  },
  {
    questionId: 'q15',
    optionId: 'A',
    steps: [
      {
        id: 'calendar',
        label: 'Суббота',
      },
    ],
    moods: [
      {
        npcId: 'mentor',
        emotions: ['😊'],
      },
    ],
  },
  {
    questionId: 'q15',
    optionId: 'B',
    steps: [
      {
        id: 'analysis',
        label: 'Программа курса',
      },
    ],
    moods: [
      {
        npcId: 'mentor',
        emotions: ['🙂'],
      },
    ],
  },
  {
    questionId: 'q15',
    optionId: 'C',
    steps: [
      {
        id: 'calendar',
        label: '3 вечера',
      },
    ],
    moods: [
      {
        npcId: 'mentor',
        emotions: ['😊'],
      },
    ],
  },
  {
    questionId: 'q15',
    optionId: 'D',
    steps: [
      {
        id: 'team_cheer',
      },
    ],
    moods: [
      {
        npcId: 'mentor',
        emotions: ['😊'],
      },
    ],
  },
];
