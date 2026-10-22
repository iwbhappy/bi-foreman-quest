import { traits } from '../../data/traits';
import { ru } from '../../i18n/ru';
import { TRAIT_ORDER, type ResultRecord } from '../../lib/types';
import { mainChange } from '../../lib/stage';
import { MetricBar } from '../ui/MetricBar';
export function DynamicsSection({ current, previous }: { current: ResultRecord; previous?: ResultRecord }) {
  const change = mainChange(current.percents, previous?.percents);
  return <section className="dynamics-section">
    {change && <p className={'main-change trend-' + (change.delta < 0 ? 'down' : 'up')}>
      {ru.scene.mainChange}: <strong>{traits[change.trait].name} {ru.dashboard.trend(change.delta)}</strong></p>}
    <div className="dynamics-heading"><h2 className="section-title">{ru.dashboard.dynamics}</h2>
      {!previous && <span>{ru.dashboard.first}</span>}</div>
    {previous && <div className="dynamics-legend"><span>{ru.dashboard.baseline}</span>
      <span>{ru.dashboard.current}</span></div>}
    {TRAIT_ORDER.map((trait) => {
      const delta = previous ? current.percents[trait] - previous.percents[trait] : 0;
      return <MetricBar key={trait} name={traits[trait].name} value={current.percents[trait]}
        baseline={previous?.percents[trait]} trend={delta < 0 ? 'down' : delta > 0 ? 'up' : 'flat'} />;
    })}</section>;
}

