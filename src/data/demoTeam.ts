import type { HeroSkin, Participant } from '../lib/types';

export interface DemoAttempt {
  pattern: string;
  likert: [number, number, number, number];
  createdAt: string;
}
export interface DemoEmployee {
  participant: Participant;
  helmetColor: string;
  skin?: HeroSkin;
  attempts: DemoAttempt[];
}

// Только готовые ответы. Подбор: scripts/select-demo.mjs; оценка: lib/team.ts → scoring.ts.
export const demoEmployees: DemoEmployee[] = [
  {
    participant: {
      name: 'Айдос Нурланов',
      position: 'Прораб',
      experience: '3–5 лет',
    },
    helmetColor: '#1668B8',
    skin: {
      helmet: 'blue',
      theme: 'bright',
    },
    attempts: [
      {
        pattern: 'BAAADCCDDCC',
        likert: [2, 5, 1, 1],
        createdAt: '2026-09-01T04:00:00.000Z',
      },
      {
        pattern: 'BAAACCBDACC',
        likert: [2, 5, 1, 1],
        createdAt: '2026-10-15T04:00:00.000Z',
      },
    ],
  },
  {
    participant: {
      name: 'Алия Серикова',
      position: 'Инженер ПТО',
      experience: 'более 5 лет',
    },
    helmetColor: '#ECEFF3',
    skin: {
      helmet: 'white',
      theme: 'calm',
    },
    attempts: [
      {
        pattern: 'CDBDCDBBDBD',
        likert: [1, 1, 2, 4],
        createdAt: '2026-09-01T04:00:00.000Z',
      },
      {
        pattern: 'CDBDCDBADBA',
        likert: [1, 1, 2, 4],
        createdAt: '2026-10-15T04:00:00.000Z',
      },
    ],
  },
  {
    participant: {
      name: 'Тимур Садыков',
      position: 'Начальник участка',
      experience: 'более 5 лет',
    },
    helmetColor: '#F28C28',
    skin: {
      helmet: 'orange',
      theme: 'strict',
    },
    attempts: [
      {
        pattern: 'ABDAABDCAAA',
        likert: [1, 5, 2, 4],
        createdAt: '2026-09-01T04:00:00.000Z',
      },
      {
        pattern: 'ABDDABDDAAA',
        likert: [1, 4, 2, 4],
        createdAt: '2026-10-15T04:00:00.000Z',
      },
    ],
  },
  {
    participant: {
      name: 'Данияр Омаров',
      position: 'Мастер СМР',
      experience: '1–3 года',
    },
    helmetColor: '#F2C230',
    skin: {
      helmet: 'yellow',
      theme: 'bright',
    },
    attempts: [
      {
        pattern: 'DADABCBACBD',
        likert: [1, 1, 1, 2],
        createdAt: '2026-10-15T04:00:00.000Z',
      },
    ],
  },
  {
    participant: {
      name: 'Айгерим Касымова',
      position: 'Инженер технадзора',
      experience: '3–5 лет',
    },
    helmetColor: '#D94A3A',
    skin: {
      helmet: 'red',
      theme: 'tech',
    },
    attempts: [
      {
        pattern: 'DADABDDCDBA',
        likert: [5, 1, 2, 5],
        createdAt: '2026-10-15T04:00:00.000Z',
      },
    ],
  },
  {
    participant: {
      name: 'Нурбек Тлеубаев',
      position: 'Прораб',
      experience: 'более 5 лет',
    },
    helmetColor: '#2E9E5B',
    skin: {
      helmet: 'green',
      theme: 'calm',
    },
    attempts: [
      {
        pattern: 'ADBDDCBBCDB',
        likert: [2, 5, 2, 4],
        createdAt: '2026-10-15T04:00:00.000Z',
      },
    ],
  },
  {
    participant: {
      name: 'Жанна Ибраева',
      position: 'Инженер ПТО',
      experience: '1–3 года',
    },
    helmetColor: '#1668B8',
    skin: {
      helmet: 'blue',
      theme: 'tech',
    },
    attempts: [
      {
        pattern: 'DDABABCABDA',
        likert: [2, 4, 4, 1],
        createdAt: '2026-10-15T04:00:00.000Z',
      },
    ],
  },
  {
    participant: {
      name: 'Ермек Муратов',
      position: 'Мастер СМР',
      experience: 'до 1 года',
    },
    helmetColor: '#ECEFF3',
    skin: {
      helmet: 'white',
      theme: 'strict',
    },
    attempts: [
      {
        pattern: 'DBBCCCBDDAD',
        likert: [2, 4, 3, 1],
        createdAt: '2026-10-15T04:00:00.000Z',
      },
    ],
  },
];
