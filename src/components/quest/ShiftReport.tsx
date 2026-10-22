import { INDICATORS, SHIFT_DISCLAIMER } from '../../data/quest';
import { ru } from '../../i18n/ru';
import { buildJournal, indicatorsAfter, pickEpilogue, INITIAL_INDICATORS } from '../../lib/quest';
import { AnimatedNumber } from '../AnimatedNumber';
import type { Answers } from '../../lib/types';
import { Icon } from '../Icon';

export function ShiftReport({ answers, onReveal }: { answers: Answers; onReveal: () => void }) {
  const indicators = indicatorsAfter(answers);
  const epilogue = pickEpilogue(indicators);
  const [before, emphasis, after] = SHIFT_DISCLAIMER.split('*');
  return (
    <>
      <section className="shift-journal card">
        <h2 className="section-title">{ru.quest.journal}</h2>
        <ol>
          {buildJournal(answers).map(({ question, option, consequence }) => (
            <li
              key={question.id}
              className={`journal-outcome-${Object.values(consequence.deltas).reduce((a, b) => a + b, 0) > 0 ? 'positive' : Object.values(consequence.deltas).reduce((a, b) => a + b, 0) < 0 ? 'negative' : 'neutral'}`}
            >
              <span className="journal-time">{question.time}</span>
              <div>
                <h3>{question.title}</h3>
                <p>
                  <strong>{ru.quest.yourDecision}</strong> {option.text}
                </p>
                <p className="journal-consequence">{consequence.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="shift-totals card">
        <h2 className="section-title">{ru.quest.totals}</h2>
        <div className="final-indicators">
          {INDICATORS.map(({ id, name }) => (
            <div key={id} className={`indicator-${id}`}>
              <p>
                <Icon name={id} /> {name}
                <strong>
                  <AnimatedNumber value={indicators[id]} from={INITIAL_INDICATORS[id]} />
                  <small>/100</small>
                </strong>
              </p>
              <div
                className="hud-track"
                role="meter"
                aria-label={name}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={indicators[id]}
              >
                <span style={{ width: `${indicators[id]}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="shift-epilogue">
          <span>
            <Icon name={epilogue.id} /> {ru.quest.epilogue}
          </span>
          <h3>{epilogue.text}</h3>
          <p>
            {before}
            <em>{emphasis}</em>
            {after}
          </p>
          <button className="btn btn-primary" onClick={onReveal}>
            {ru.quest.reveal}
            <Icon name="arrow" />
          </button>
        </div>
      </section>
    </>
  );
}
