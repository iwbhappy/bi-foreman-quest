import { CALLBACKS, CONSEQUENCES, EPILOGUES, SKY_PALETTES, START_INDICATORS } from '../data/quest';
import { questions } from '../data/questions';
import type { Answers, Consequence, Indicators, QuestProgress } from './types';

export const INITIAL_INDICATORS: Indicators = { ...START_INDICATORS };
export const EPILOGUE_ORDER = ['safety', 'quality', 'team', 'schedule'] as const;

export function applyDeltas(state: Indicators, deltas: Consequence['deltas']): Indicators {
  const next = { ...state };
  for (const id of EPILOGUE_ORDER) next[id] = Math.max(0, Math.min(100, state[id] + (deltas[id] ?? 0)));
  return next;
}
export function consequenceFor(questionId: string, optionId: unknown) {
  return CONSEQUENCES.find((item) => item.questionId === questionId && item.optionId === optionId);
}
export function indicatorsAfter(answers: Answers): Indicators {
  return questions.reduce(
    (state, question) => {
      const item = consequenceFor(question.id, answers[question.id]);
      return item ? applyDeltas(state, item.deltas) : state;
    },
    { ...INITIAL_INDICATORS },
  );
}
export function callbackText(questionId: string, answers: Answers) {
  const callback = CALLBACKS.find((item) => item.atQuestionId === questionId);
  if (!callback) return '';
  const answer = answers[callback.dependsOn];
  return typeof answer === 'string' ? callback.textByOption[answer] : '';
}
export function pickEpilogue(indicators: Indicators) {
  const id = [...EPILOGUE_ORDER].sort((a, b) => indicators[b] - indicators[a])[0];
  return { id, text: EPILOGUES[id] };
}
export function buildJournal(answers: Answers) {
  return questions.flatMap((question) => {
    if (question.type !== 'situation') return [];
    const option = question.options.find((item) => item.id === answers[question.id]);
    const consequence = consequenceFor(question.id, option?.id);
    return option && consequence ? [{ question, option, consequence }] : [];
  });
}
export function committedAnswers(progress: QuestProgress): Answers {
  return Object.fromEntries(
    questions.flatMap((question, index) => {
      const committed =
        progress.stage !== 'play' ||
        index < progress.currentIndex ||
        (index === progress.currentIndex && progress.consequenceShown);
      const answer = progress.answers[question.id];
      return committed && answer !== undefined ? [[question.id, answer]] : [];
    }),
  );
}
export function completedScenes(progress: QuestProgress) {
  return progress.stage !== 'play' ? questions.length : progress.currentIndex + Number(progress.consequenceShown);
}
export function sceneTime(index: number) {
  for (let i = index; i >= 0; i--) {
    const question = questions[i];
    if (question?.type === 'situation') return question.time;
  }
  return '07:00';
}
export function skyAt(time: string) {
  const [hour, minutes] = time.split(':').map(Number);
  const palette = SKY_PALETTES.find((item) => hour >= item.fromHour && hour < item.toHour) ?? SKY_PALETTES[0];
  const day = Math.max(0, Math.min(1, (hour + minutes / 60 - 7) / 12));
  return { ...palette, sunX: 180 + day * 360, sunY: 145 - Math.sin(day * Math.PI) * 105 };
}
