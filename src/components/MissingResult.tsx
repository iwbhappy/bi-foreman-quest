import { Link } from 'react-router-dom';
import { ru } from '../i18n/ru';

export function MissingResult() {
  return (
    <main className="wrap dashboard-page">
      <h1 className="quest-page-title">{ru.notFound}</h1>
      <p className="mb-6">{ru.notFoundBody}</p>
      <Link className="btn btn-primary" to="/">
        {ru.home}
      </Link>
    </main>
  );
}
