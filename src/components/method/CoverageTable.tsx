import { ru } from '../../i18n/ru';
import { coverageRows, coverageTotals } from '../../lib/method';
import { TRAIT_ORDER } from '../../lib/types';
import { TraitColumnHeading } from '../team/TraitColumnHeading';

export function CoverageTable() {
  return (
    <section className="coverage-section card">
      <h2 className="section-title">{ru.dashboard.coverage}</h2>
      <p>{ru.dashboard.maximum}</p>
      <table className="coverage-table">
        <thead>
          <tr>
            <th>{ru.dashboard.question}</th>
            {TRAIT_ORDER.map((trait) => (
              <th key={trait}>
                <TraitColumnHeading trait={trait} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {coverageRows().map(({ question, maxima }) => (
            <tr key={question.id}>
              <th scope="row">
                <span>{question.id}</span>
                {question.type === 'situation' ? `${question.time} · ${question.title}` : ru.assertion}
              </th>
              {TRAIT_ORDER.map((trait) => (
                <td key={trait}>{maxima[trait]}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>{ru.dashboard.total}</th>
            {coverageTotals().map((item) => (
              <td key={item.trait}>{item.max}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
