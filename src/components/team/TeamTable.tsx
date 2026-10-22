import { Link, useNavigate } from 'react-router-dom';
import { ru } from '../../i18n/ru';
import { level } from '../../lib/scoring';
import { TRAIT_ORDER, type ResultRecord } from '../../lib/types';
import { ArchetypeAvatar } from '../ArchetypeAvatar';
import { TraitColumnHeading } from './TraitColumnHeading';

export function TeamTable({ records }: { records: ResultRecord[] }) {
  const navigate = useNavigate();
  return (
    <div className="team-table-card card">
      <table className="team-table">
        <thead>
          <tr>
            <th>{ru.dashboard.participant}</th>
            {TRAIT_ORDER.map((trait) => (
              <th key={trait}>
                <TraitColumnHeading trait={trait} />
              </th>
            ))}
            <th>{ru.dashboard.index}</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const path = `/manager/${encodeURIComponent(record.id)}`;
            return (
              <tr
                key={record.id}
                tabIndex={0}
                onClick={(event) => {
                  if (!(event.target as HTMLElement).closest('a')) navigate(path);
                }}
                onKeyDown={(event) => {
                  if (event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) {
                    event.preventDefault();
                    navigate(path);
                  }
                }}
              >
                <td>
                  <div className="team-person">
                    <ArchetypeAvatar archetype={record.archetype} helmetColor={record.helmetColor} skin={record.skin} />
                    <div>
                      <Link to={path}>{record.participant.name || ru.participant}</Link>
                      <p>{record.participant.position}</p>
                    </div>
                  </div>
                </td>
                {TRAIT_ORDER.map((trait) => (
                  <td key={trait}>
                    <span className={`heat-cell heat-${level(record.percents[trait])}`}>{record.percents[trait]}%</span>
                  </td>
                ))}
                <td>
                  <span className="team-overall">{record.overall}%</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
