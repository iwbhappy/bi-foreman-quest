import { useCallback, useEffect, useState } from 'react';
import type { StageSequence } from '../../../data/stageEvents';
import { useReducedMotion } from '../useReducedMotion';

// Фазы: -1 — жест героя; 0…n-1 — события; 20 — новый этаж и пилюли показателей; 21 — пилюли долетели до HUD.
export const PHASE_RESULT = 20;
export const PHASE_HUD = 21;
const GESTURE_MS = 350;
const STEP_MS = 1150;
const PILLS_LAND_MS = 1150;
const SETTLE_MS = 1750;

export function useStagePlayback(questionId: string, sequence?: StageSequence, calm = false) {
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState(-1);
  const [runQuestion, setRunQuestion] = useState('');
  const running = playing && runQuestion === questionId && !reduced;
  const start = useCallback(() => {
    setRunQuestion(questionId);
    setPhase(-1);
    setPlaying(!reduced);
  }, [questionId, reduced]);
  const skip = useCallback(() => {
    setPlaying(false);
    setPhase(99);
  }, []);
  useEffect(() => {
    if (!running || !sequence) return;
    const k = calm ? 1.3 : 1;
    const step = STEP_MS * k;
    const result = GESTURE_MS + sequence.steps.length * step;
    const ids = sequence.steps.map((_, i) => setTimeout(() => setPhase(i), GESTURE_MS + i * step));
    ids.push(setTimeout(() => setPhase(PHASE_RESULT), result));
    ids.push(setTimeout(() => setPhase(PHASE_HUD), result + PILLS_LAND_MS * k));
    ids.push(setTimeout(skip, result + SETTLE_MS * k));
    return () => ids.forEach(clearTimeout);
  }, [running, sequence, skip, calm]);
  return { running, phase: running ? phase : 99, start, skip, reduced };
}
