import { Link, useParams } from 'react-router-dom';
import { ru } from '../i18n/ru';
import { calculate } from '../lib/scoring';
import { analyze } from '../lib/analysis';
import { getArchetype } from '../lib/archetype';
import { qualityFlags } from '../lib/flags';
import { loadResults } from '../lib/storage';
import { allProfiles } from '../lib/team';
import type { ResultRecord } from '../lib/types';
import { ResultHero } from '../components/result/ResultHero';
import { QualityWarning } from '../components/result/QualityWarning';
import { ProfileSection } from '../components/result/ProfileSection';
import { AnalysisCards } from '../components/result/AnalysisCards';
import { RecommendationsSection } from '../components/result/RecommendationsSection';
import { PlanSection } from '../components/result/PlanSection';
import { ResultActions } from '../components/result/ResultActions';
import { PageTitle } from '../components/ui/Titles';
import { AnalysisBlock } from '../components/ai/AnalysisBlock';

function ResultContent({ record }: { record: ResultRecord }) {
  const { percents, overall, levels } = calculate(record.answers);
  const { strengths, growthZones } = analyze(percents);
  const archetype = getArchetype(percents);
  const flags = qualityFlags(record.answers, record.durationSec, record.perQuestionSec);
  const fresh = { ...record, percents, overall, levels, strengths, growthZones, archetype, flags };
  return (
    <main className={`result-wrap wrap ${strengths.length > 1 ? 'many-strengths' : ''}`}>
      <div className="no-print mb-6 flex items-center justify-between">
        <Link to="/" className="text-sm font-medium text-blue">
          ← {ru.home}
        </Link>

      </div>
<PageTitle>{ru.profile}</PageTitle>
<div className="result-layout"><ResultHero {...fresh} /><div className="result-detail"><p className="archetype-description">{archetype.description}</p>
      <QualityWarning flags={flags} />

      <ProfileSection percents={percents} />
      <AnalysisBlock record={record} />
      <AnalysisCards answers={record.answers} percents={percents} strengths={strengths} growthZones={growthZones} />
      <RecommendationsSection percents={percents} />
      <PlanSection id={record.id} percents={percents} />
      </div></div><ResultActions record={fresh} />
      <p className="result-disclaimer">{ru.disclaimer}</p>
    </main>
  );
}
export default function Result() {
  const { id } = useParams();
  const record = allProfiles(loadResults()).find((item) => item.id === id);
  if (record) return <ResultContent key={record.id} record={record} />;
  return (
    <main className="wrap py-16">
      <h1 className="text-3xl font-bold text-navy">{ru.notFound}</h1>
      <p className="my-5">{ru.notFoundBody}</p>
      <Link className="btn btn-primary" to="/">
        {ru.start}
      </Link>
    </main>
  );
}
