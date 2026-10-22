import { academyRoute } from '../../data/routes';
import { ru } from '../../i18n/ru';

export function AcademyRoute() {
  return (
    <section className="manager-route" aria-label={ru.roadmap}>
      <h2 className="section-title">{ru.roadmap}</h2>
      <ol>
        {academyRoute.map((step, index) => (
          <li key={step} className={index === 0 ? 'complete' : index === 1 ? 'active' : ''}>
            <span>{index === 0 ? '✓' : index + 1}</span>
            <p>{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
