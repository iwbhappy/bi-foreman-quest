import { Icon } from '../Icon';
import { INDICATORS } from '../../data/quest';
import { ru } from '../../i18n/ru';
import type { IndicatorId, Indicators } from '../../lib/types';
import { AnimatedNumber } from '../AnimatedNumber';

export function Hud({
  time,
  number,
  indicators,
  bump = [],
}: {
  time: string;
  number: number;
  indicators: Indicators;
  /** Показатели, в которые только что «влетела» пилюля: короткая пульсация. */
  bump?: IndicatorId[];
}) {
  return (
    <section className="quest-hud" aria-label={ru.quest.scene(number)}>
      <span className="hud-time" key={time} aria-label={time}>
        {[...time].map((digit, i) => (
          <span className="hud-clock-digit" key={i} style={{ animationDelay: `${i * 30}ms` }}>
            {digit}
          </span>
        ))}
      </span>
      <span className="hud-scene">{ru.quest.sceneShort(number)}</span>
      <div className="hud-indicators">
        {INDICATORS.map(({ id, name }) => (
          <div
            key={id}
            className={`hud-indicator indicator-${id} ${indicators[id] <= 25 ? 'indicator-danger' : indicators[id] >= 90 ? 'indicator-excellent' : ''} ${bump.includes(id) ? 'hud-bump' : ''}`}
            role="meter"
            aria-label={name}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={indicators[id]}
          >
            <span className="indicator-emoji" aria-hidden="true">
              <Icon name={id} />
            </span>
            <span className="hud-label">{name}</span>
            <span className="hud-track">
              <span
                key={indicators[id]}
                style={{ transform: `scaleX(${indicators[id] / 100})`, width: '100%', transformOrigin: 'left' }}
              />
            </span>
            <span className="hud-value">
              <AnimatedNumber value={indicators[id]} duration={600} />
            </span>
            {indicators[id] <= 25 && <small>{ru.scene.danger}</small>}
            {indicators[id] >= 90 && <small>{ru.scene.excellent}</small>}
          </div>
        ))}
      </div>
    </section>
  );
}
