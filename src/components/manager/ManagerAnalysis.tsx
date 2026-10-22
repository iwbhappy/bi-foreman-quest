import { StatusBox } from '../ui/StatusBox';
import { traits } from '../../data/traits';
import { ru } from '../../i18n/ru';
import type { ResultRecord, TraitId } from '../../lib/types';

interface Props {
  record: ResultRecord;
  previous?: ResultRecord;
}
function TraitValue({ record, previous, trait }: Props & { trait: TraitId }) {
  const delta = previous ? record.percents[trait] - previous.percents[trait] : 0;
  return (
    <span className="analysis-value">
      <strong>{record.percents[trait]}%</strong>
      {previous && (
        <span className={`analysis-delta trend-${delta < 0 ? 'down' : delta > 0 ? 'up' : 'flat'}`}>
          {ru.dashboard.trend(delta)}
        </span>
      )}
    </span>
  );
}
export function ManagerAnalysis({ record, previous }: Props) {
  return (
    <div className="manager-analysis">
      <StatusBox kind="strength" title={ru.strengths}>
        <ul>
          {record.strengths.map((trait) => (
            <li key={trait}>
              {traits[trait].name}
              <TraitValue record={record} previous={previous} trait={trait} />
            </li>
          ))}
        </ul>
      </StatusBox>
      <StatusBox kind="growth" title={ru.growthZones}>
        <ul>
          {record.growthZones.map((trait) => (
            <li key={trait}>
              {traits[trait].name}
              <TraitValue record={record} previous={previous} trait={trait} />
            </li>
          ))}
        </ul>
      </StatusBox>
    </div>
  );
}
