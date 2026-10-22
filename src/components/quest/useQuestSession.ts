import { useCallback, useEffect, useRef, useState } from 'react';
import { questions } from '../../data/questions';
import { validAnswer } from '../../lib/scoring';
import { createQuestResult } from '../../lib/questResult';
import { loadQuestProgress, saveQuestProgress, saveResult } from '../../lib/storage';
import type { AnswerValue, QuestProgress } from '../../lib/types';

export function useQuestSession() {
  const [progress, setProgress] = useState(loadQuestProgress);
  const current = useRef(progress);
  const since = useRef<number | null>(null);
  const persist = useCallback((value: QuestProgress, render = true) => {
    current.current = value;
    saveQuestProgress(value);
    if (render) setProgress(value);
  }, []);
  const checkpoint = useCallback(() => {
    const value = current.current;
    if (!value || value.stage !== 'play' || value.consequenceShown) {
      since.current = null;
      return value;
    }
    const now = Date.now();
    const id = questions[value.currentIndex].id;
    const elapsed = since.current === null ? 0 : Math.max(0, (now - since.current) / 1000);
    const next = {
      ...value,
      perQuestionSec: { ...value.perQuestionSec, [id]: (value.perQuestionSec[id] ?? 0) + elapsed },
    };
    since.current = document.visibilityState === 'hidden' ? null : now;
    persist(next, false);
    return next;
  }, [persist]);
  useEffect(() => {
    const value = current.current;
    since.current =
      value?.stage === 'play' && !value.consequenceShown && document.visibilityState !== 'hidden' ? Date.now() : null;
    const leave = () => {
      checkpoint();
    };
    const visibility = () => {
      checkpoint();
    };
    window.addEventListener('pagehide', leave);
    window.addEventListener('beforeunload', leave);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      checkpoint();
      window.removeEventListener('pagehide', leave);
      window.removeEventListener('beforeunload', leave);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [checkpoint]);
  const select = useCallback(
    (answer: AnswerValue) => {
      const value = checkpoint();
      if (!value || value.stage !== 'play' || value.consequenceShown) return;
      const question = questions[value.currentIndex];
      if (validAnswer(question, answer)) persist({ ...value, answers: { ...value.answers, [question.id]: answer } });
    },
    [checkpoint, persist],
  );
  const accept = useCallback(() => {
    const value = checkpoint();
    if (!value || value.stage !== 'play' || value.consequenceShown) return;
    const question = questions[value.currentIndex];
    if (question.type !== 'situation' || !validAnswer(question, value.answers[question.id])) return;
    since.current = null;
    persist({ ...value, consequenceShown: true });
  }, [checkpoint, persist]);
  const next = useCallback(() => {
    const value = checkpoint();
    if (!value || value.stage !== 'play') return false;
    const question = questions[value.currentIndex];
    if (!validAnswer(question, value.answers[question.id])) return false;
    if (question.type === 'situation' && !value.consequenceShown) return false;
    if (value.currentIndex === questions.length - 1) {
      const result = createQuestResult(value);
      saveResult(result);
      persist({ ...value, stage: 'report', resultId: result.id });
      since.current = null;
      return true;
    }
    persist({ ...value, currentIndex: value.currentIndex + 1, consequenceShown: false });
    since.current = document.visibilityState === 'hidden' ? null : Date.now();
    return false;
  }, [checkpoint, persist]);
  return { progress, select, accept, next };
}
