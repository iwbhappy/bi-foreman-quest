import { Icon } from '../Icon';
import { useEffect, useRef } from 'react';
import { INDICATORS } from '../../data/quest';
import { ru } from '../../i18n/ru';
import type { Consequence } from '../../lib/types';

export function ConsequenceCard({ consequence, focus = true }: { consequence: Consequence; focus?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus({ preventScroll: true });
  }, [focus]);
  return (
    <div
      className={`consequence-card outcome-${Object.values(consequence.deltas).reduce((a, b) => a + b, 0) > 0 ? 'positive' : Object.values(consequence.deltas).reduce((a, b) => a + b, 0) < 0 ? 'negative' : 'neutral'}`}
      ref={ref}
      tabIndex={-1}
      role="status"
    >
      <h2>{ru.quest.consequence}</h2>
      <p>{consequence.text}</p>
      <div className="consequence-deltas">
        {INDICATORS.map(({ id, name }) => {
          const delta = consequence.deltas[id];
          return delta === undefined ? null : (
            <span key={id} className={delta > 0 ? 'delta-positive' : 'delta-negative'}>
              {delta > 0 ? '+' : '−'}
              {Math.abs(delta)} <Icon name={id} /> {name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
