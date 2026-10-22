import { Link } from 'react-router-dom';
import { ru } from '../../i18n/ru';
import type { ResultRecord } from '../../lib/types';
import { Icon } from '../Icon';
export function ResultActions({ record }: { record: ResultRecord }) {
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `bi-profile-${record.id}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="result-actions no-print">
      <button className="btn btn-primary" onClick={() => window.print()}>
        <Icon name="pdf" />
        {ru.pdf}
      </button>
      <button className="btn btn-link" onClick={exportJSON}>
        {ru.json}
      </button>
      <Link className="btn btn-link" to={`/manager/${encodeURIComponent(record.id)}`}>
        {ru.dashboard.manager}
      </Link>
      <Link className="btn btn-link" to="/">
        {ru.retake}
        <Icon name="arrow" className="!h-5 !w-5" />
      </Link>
    </div>
  );
}
