import { ru } from '../i18n/ru';
import { methodology } from '../data/method';
import { CoverageTable } from '../components/method/CoverageTable';
import { PageTitle } from '../components/ui/Titles';
import { MethodDetails } from '../components/method/MethodDetails';
import { useEffect } from 'react';
import { SectionTitle } from '../components/ui/Titles';

export default function Method() {
  useEffect(() => {
    const scroll = () => {
      if (window.location.hash.endsWith('/method#ai')) document.getElementById('ai')?.scrollIntoView();
    };
    scroll();
    window.addEventListener('hashchange', scroll);
    return () => window.removeEventListener('hashchange', scroll);
  }, []);
  return (
    <main className="wrap dashboard-page method-page">
      <PageTitle>{ru.dashboard.methodTitle}</PageTitle>
      <section className="method-section card">
        <h2 className="section-title">{ru.dashboard.structure}</h2>
        <p>{methodology.structure}</p>
      </section>
      <section className="method-section card">
        <h2 className="section-title">{ru.dashboard.noRightAnswers}</h2>
        <p>{methodology.noRightAnswers}</p>
      </section>
      <CoverageTable />
      <MethodDetails />
      <section id="ai" className="method-section">
        <SectionTitle>{ru.ai.methodTitle}</SectionTitle>
        <p>{ru.ai.methodData}</p><p>{ru.ai.methodFormula}</p>
        <p>{ru.ai.methodModel}</p><p>{ru.ai.methodLimits}</p>
      </section>
    </main>
  );
}
