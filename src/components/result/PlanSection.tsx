import { useState } from 'react';
import { ru } from '../../i18n/ru';
import { developmentPlan } from '../../lib/recommend';
import { loadPlan, savePlan } from '../../lib/storage';
import type { Percents } from '../../lib/types';
export function PlanSection({ id, percents }: { id: string; percents: Percents }) {
  const [checked, setChecked] = useState(() => loadPlan(id));
  const toggle = (index: number) => {
    const next = checked.map((value, i) => (i === index ? !value : value));
    setChecked(next);
    savePlan(id, next);
  };
  return (
    <section className="plan-section">
      <div className="section-heading">
        <h2 className="section-title">{ru.plan}</h2>
        <span className="text-xs text-slate-500">{ru.completed(checked.filter(Boolean).length)}</span>
      </div>
      <div className="plan-grid">
        {developmentPlan(percents).map((step, index) => (
          <label key={step.week} className={`plan-item ${checked[index] ? 'plan-checked' : ''}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue">{ru.week(step.week)}</span>
              <input type="checkbox" checked={checked[index]} onChange={() => toggle(index)} />
            </div>
            <span className="text-sm leading-relaxed">{step.text}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
