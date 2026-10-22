import { levelRanges, methodology } from '../../data/method';
import { traits } from '../../data/traits';
import { ru } from '../../i18n/ru';
import { coverageTotals } from '../../lib/method';

export function MethodDetails() {
  return (
    <>
      <section className="method-section card">
        <h2 className="section-title">{ru.dashboard.normalization}</h2>
        <p>{methodology.normalization}</p>
        <pre>{methodology.formula}</pre>
        <p>{methodology.statements}</p>
        <p>{methodology.overall}</p>
        <h3>{ru.dashboard.minMax}</h3>
        <ul className="method-bounds">
          {coverageTotals().map((item) => (
            <li key={item.trait}>
              <span>{traits[item.trait].name}</span>
              <span>
                {ru.dashboard.minimum}: {item.min} · {ru.dashboard.maximumTotal}: {item.max}
              </span>
            </li>
          ))}
        </ul>
        <h3>{ru.dashboard.levels}</h3>
        <div className="method-levels">
          {levelRanges.map((item) => (
            <div key={item.level} className={`heat-${item.level}`}>
              <strong>
                {item.from}–{item.to}%
              </strong>
              <span>{ru.levels[item.level]}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="method-section card">
        <h2 className="section-title">{ru.dashboard.flags}</h2>
        <ol>
          {methodology.flags.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ol>
        <p>{methodology.flagNote}</p>
      </section>
      <section className="method-section game-method card">
        <h2 className="section-title">{ru.dashboard.game}</h2>
        {methodology.game.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
      <section className="method-section method-limitations card">
        <h2 className="section-title">{ru.dashboard.limitations}</h2>
        <p>{methodology.limitations}</p>
      </section>
    </>
  );
}
