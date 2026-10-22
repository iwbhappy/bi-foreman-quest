import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ru } from '../i18n/ru';
import { TRAIT_ORDER } from '../lib/types';
import { traits } from '../data/traits';
import { archetypes, universal } from '../data/archetypes';
import { loadProgress, loadResults, loadQuestProgress } from '../lib/storage';
import { mysteryUrl, npcUrl } from '../data/art';
import { Portrait } from '../components/ui/Art';
import { PageTitle, SectionTitle } from '../components/ui/Titles';
import { ProcessStrip } from '../components/ui/ProcessStrip';
import { Icon } from '../components/Icon';
export default function Landing() {
  const [progress] = useState(loadProgress), [quest] = useState(loadQuestProgress), [results] = useState(loadResults);
  const [showResults, setShowResults] = useState(false);
  const keys = ['critical-discipline', 'confidence-engagement', 'discipline-critical',
    'engagement-confidence', 'universal'];
  const descriptions = [...TRAIT_ORDER.map((id) => archetypes[id].animalDescription), universal.description];
  return <main className="landing wrap"><div className="landing-grid">
    <section className="hero-copy">
      <PageTitle eyebrow={ru.redesign.eyebrow}>{ru.redesign.title}</PageTitle>
      <p className="hero-subtitle">{ru.redesign.lead}</p>
      <div className="landing-quest-entry">
        <Link className="btn btn-primary" to="/quest/start">{ru.quest.start}<Icon name="arrow" /></Link>
        <Link to="/test/start">{ru.redesign.simple}</Link>
        {progress && <Link to="/test">{ru.continue(progress.currentIndex + 1)}</Link>}
        {quest && <Link className="quest-resume" to={quest.stage === 'play' ? '/quest/play' : '/quest/report'}>
          {ru.quest.resume}</Link>}
      </div><p className="landing-facts">{ru.redesign.facts}</p>
    </section>
    <div className="landing-hero-preview"><Portrait src={mysteryUrl('orange')} alt={ru.quest.silhouette} eager /></div>
  </div>
  <section className="landing-section"><SectionTitle>{ru.redesign.how}</SectionTitle>
    <ProcessStrip steps={ru.redesign.steps.map((step, i) => ({ ...step,
      image: i === 0 ? <Portrait src={mysteryUrl('orange')} alt="" /> : i === 1 ?
        <div className="process-npcs"><Portrait src={npcUrl('boss')} alt="" />
          <Portrait src={npcUrl('foreman')} alt="" /></div> :
        <Portrait archetypeKey="universal" alt="" /> }))} />
  </section>
  <section className="landing-section"><SectionTitle>{ru.redesign.gallery}</SectionTitle>
    <div className="hero-gallery">{keys.map((key, i) => <article key={key}>
      <Portrait archetypeKey={key} helmet={key === 'universal' ? 'blue' : 'orange'} alt={ru.redesign.animals[i]} />
      <h3>{ru.redesign.animals[i]}</h3><p>{descriptions[i].split(/(?<=\.)\s/)[0]}</p>
    </article>)}</div>
  </section>
  <section className="landing-section"><SectionTitle>{ru.qualities}</SectionTitle>
    <div className="traits-grid">{TRAIT_ORDER.map((id) => <article key={id}>
      <Icon name={id} /><h3>{traits[id].name}</h3><p>{traits[id].description}</p></article>)}</div>
  </section>
  {results.length > 0 && <section className="landing-section">
    <button className="btn btn-link" onClick={() => setShowResults(!showResults)}
      aria-expanded={showResults}>{ru.myResults}</button>
    {showResults && <ul>{results.map((record) => <li key={record.id}>
      <Link to={'/result/' + record.id}>{record.participant.name || ru.participant} ·
        {new Date(record.createdAt).toLocaleString('ru-RU')}</Link></li>)}</ul>}
  </section>}
  </main>;
}

