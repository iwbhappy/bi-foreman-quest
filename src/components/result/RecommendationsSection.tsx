import { useState } from 'react';
import { traits } from '../../data/traits';
import { ru } from '../../i18n/ru';
import { recommend } from '../../lib/recommend';
import type { Percents } from '../../lib/types';
import { Icon } from '../Icon';
export function RecommendationsSection({ percents }: { percents: Percents }) {
  const [showMore, setShowMore] = useState(false);
  const recommended = recommend(percents);
  return (
    <section className="recommendations-section">
      <div className="section-heading">
        <h2 className="section-title">{ru.recommendations}</h2>
        <span className="section-rule" />
      </div>
      {recommended.map((group, index) => (
        <div
          key={group.trait}
          className={`recommendation-group ${index >= 2 && !showMore ? 'extra-recommendations' : ''}`}
        >
          <h3 className="mb-4 text-base font-bold text-navy">
            {traits[group.trait].name}
            <span className="ml-3 text-sm font-medium text-slate-500">{percents[group.trait]}%</span>
          </h3>
          <div className="recommendation-grid">
            {group.items.map((item) => (
              <article key={item.type} className="recommendation-row">
                <div className="mb-4 flex items-center gap-2 text-blue">
                  <Icon name={item.type} />
                  <h4 className="text-xs font-semibold">{ru.recommendationTypes[item.type]}</h4>
                </div>
                <p className="text-sm leading-relaxed text-ink">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      ))}
      {recommended.length > 2 && (
        <button className="btn btn-secondary no-print" onClick={() => setShowMore(!showMore)} aria-expanded={showMore}>
          {ru.showMore}
        </button>
      )}
      <p className="mt-4 text-xs text-slate-500">{ru.courseDisclaimer}</p>
    </section>
  );
}
