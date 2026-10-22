import { Link } from 'react-router-dom';
import { traits } from '../../data/traits';
import { ru } from '../../i18n/ru';
import { developmentGroups } from '../../lib/team';
import type { ResultRecord } from '../../lib/types';

export function DevelopmentGroups({ records }: { records: ResultRecord[] }) {
  return (
    <section className="development-groups card">
      <h2 className="section-title">{ru.dashboard.groups}</h2>
      {developmentGroups(records).map((group) => (
        <article key={group.trait}>
          <h3>
            {traits[group.trait].name}
            <span>{group.members.length}</span>
          </h3>
          <p className="group-members">
            {group.members.map((record, index) => (
              <span key={record.id}>
                {index > 0 && ', '}
                <Link to={`/manager/${encodeURIComponent(record.id)}`}>
                  {record.participant.name || ru.participant}
                </Link>
              </span>
            ))}
          </p>
          <p className="group-course">{group.course.text}</p>
        </article>
      ))}
      <p className="course-note">{ru.courseDisclaimer}</p>
    </section>
  );
}
