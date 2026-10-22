import { ru } from '../../i18n/ru';
export function MetricBar({ name, value, baseline, level, trend = 'flat' }:
  { name: string; value: number; baseline?: number; level?: string; trend?: string }) {
  const delta = baseline === undefined ? undefined : value - baseline;
  return <div className={'metric-bar dynamics-trait trend-' + trend}>
    <div className="metric-heading"><span>{name}</span><strong>{value}%</strong>
      {delta !== undefined && <span className={'trend-' + trend}>{ru.dashboard.trend(delta)}</span>}</div>
    {baseline !== undefined && <div className="metric-track baseline-track" role="meter"
      aria-label={name + ' · ' + ru.dashboard.baseline} aria-valuemin={0} aria-valuemax={100}
      aria-valuenow={baseline}><span style={{ width: baseline + '%' }} /></div>}
    <div className="metric-track current-track" role="meter" aria-label={name}
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <span style={{ width: value + '%' }} /></div>
    {level && <p className="metric-level">{level}</p>}
  </div>;
}

