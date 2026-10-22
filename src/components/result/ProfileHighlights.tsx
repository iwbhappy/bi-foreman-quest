import { traits } from '../../data/traits';
import { ru } from '../../i18n/ru';
import { developmentPlan } from '../../lib/recommend';
import type { ResultRecord } from '../../lib/types';

export function ProfileHighlights({ record }: { record: ResultRecord }) {
  const practice = developmentPlan(record.percents)[0].text;
  const title = practice.match(/^«(.*?)»/)?.[1] ?? practice;
  return (
    <section className="profile-highlights card no-print">
      <h2 className="section-title">{ru.scene.main}</h2>
      <div>
        <p className="highlight-strength">
          {ru.scene.strength} — <strong>{traits[record.strengths[0]].name}</strong>
        </p>
        <p className="highlight-growth">
          {ru.scene.growth} — <strong>{traits[record.growthZones[0]].name}</strong>
        </p>
        <p className="highlight-first">
          {ru.scene.first} — <strong>{title}</strong>
        </p>
      </div>
    </section>
  );
}
