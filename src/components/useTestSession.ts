import { useCallback, useEffect, useRef, useState } from 'react';
import { loadProgress, saveProgress, clearProgress, saveResult } from '../lib/storage';
import { questions } from '../data/questions';
import { createResult } from '../lib/result';
import type { AnswerValue, Progress } from '../lib/types';

export function useTestSession() {
  const [progress, setProgress] = useState(loadProgress);
  const current = useRef(progress);
  const active = useRef(true);
  const since = useRef<number | null>(Date.now());
  const checkpoint = useCallback(() => {
    const p = current.current;
    if (!p || !active.current) return p;
    const now = Date.now();
    const id = questions[p.currentIndex].id;
    const elapsed = since.current === null ? 0 : Math.max(0, (now - since.current) / 1000);
    const updated = { ...p, perQuestionSec: { ...p.perQuestionSec, [id]: (p.perQuestionSec[id] ?? 0) + elapsed } };
    since.current = document.visibilityState === 'hidden' ? null : now;
    current.current = updated;
    saveProgress(updated);
    return updated;
  }, []);
  useEffect(() => {
    active.current = true;
    since.current = document.visibilityState === 'hidden' ? null : Date.now();
    const visibility = () => {
      checkpoint();
      since.current = document.visibilityState === 'hidden' ? null : Date.now();
    };
    const leave = () => {
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
  const update = useCallback((p: Progress) => {
    current.current = p;
    setProgress(p);
    saveProgress(p);
  }, []);
  const answer = useCallback(
    (value: AnswerValue) => {
      const p = checkpoint();
      if (p) update({ ...p, answers: { ...p.answers, [questions[p.currentIndex].id]: value } });
    },
    [checkpoint, update],
  );
  const move = useCallback(
    (delta: number) => {
      const p = checkpoint();
      if (p) update({ ...p, currentIndex: Math.max(0, Math.min(questions.length - 1, p.currentIndex + delta)) });
    },
    [checkpoint, update],
  );
  const finish = useCallback(() => {
    const p = checkpoint();
    if (!p) return null;
    const result = createResult(p);
    saveResult(result);
    active.current = false;
    clearProgress();
    return result.id;
  }, [checkpoint]);
  return { progress, answer, move, finish };
}
