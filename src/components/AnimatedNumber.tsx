import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './quest/useReducedMotion';

export function AnimatedNumber({ value, from, duration = 1000 }: { value: number; from?: number; duration?: number }) {
  const reduced = useReducedMotion();
  const previous = useRef(from ?? value);
  const [display, setDisplay] = useState(previous.current);
  useEffect(() => {
    if (reduced) {
      previous.current = value;
      return;
    }
    const initial = previous.current;
    if (initial === value) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(initial + (value - initial) * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
      else previous.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced, duration]);
  return <span className="animated-number" aria-label={String(value)}>
    <span className="number-screen">{reduced ? value : display}</span>
    <span className="number-print">{value}</span>
  </span>;
}
