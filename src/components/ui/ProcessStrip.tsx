import type { ReactNode } from 'react';
import { Icon } from '../Icon';
export function ProcessStrip({ steps }: { steps: { title: string; text: string; image?: ReactNode }[] }) {
  return <div className="process-strip">{steps.map((step, i) =>
    <div className="process-step" key={step.title}><h3 className={'process-cap cap-' + i}>{step.title}</h3>
      <p>{step.text}</p>{step.image}{i < steps.length - 1 && <Icon name="arrow" />}</div>)}</div>;
}

