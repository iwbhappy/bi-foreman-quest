import { ru } from '../../i18n/ru';
import { academyNextStep } from '../../lib/team';
import type { ResultRecord } from '../../lib/types';
import { NavyPanel } from '../ui/StatusBox';
import { ArchetypeAvatar } from '../ArchetypeAvatar';

export function ManagerSidebar({ record, previous }: { record: ResultRecord; previous?: ResultRecord }) {
  const next = academyNextStep(record.percents);
  const delta = previous ? record.overall - previous.overall : 0;
  return (
    <NavyPanel className="manager-sidebar">
      <ArchetypeAvatar archetype={record.archetype} helmetColor={record.helmetColor} skin={record.skin} size={120} />
      <h2>{record.participant.name || ru.participant}</h2>
      <p className="manager-position">{record.participant.position}</p>
      <p className="manager-date">
        {new Date(record.createdAt).toLocaleDateString('ru-RU')} · {record.participant.experience}
      </p>
      <div className="manager-overall">
        <h3>{ru.dashboard.overall}</h3>
        <p>
          {record.overall}
          <span>%</span>
        </p>
        {previous && (
          <span className={`period-delta trend-${delta < 0 ? 'down' : delta > 0 ? 'up' : 'flat'}`}>
            {ru.dashboard.trend(delta)} {ru.dashboard.period}
          </span>
        )}
      </div>
      <div className="manager-archetype">
        <h3>{ru.dashboard.archetype}</h3>
        <p>{record.archetype.name}</p>
      </div>
      <div className="manager-next-step">
        <h3>{ru.dashboard.nextStep}</h3>
        <p>{ru.dashboard.routeStep(next.academy, next.title)}</p>
      </div>
    </NavyPanel>
  );
}
