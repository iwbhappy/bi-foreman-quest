import { useState } from 'react';
import demo from '../../data/demoTeamAnalysis.json';
import { validTeamAnalysis, type TeamAnalysis } from '../../lib/aiTypes';
import { aiAvailable } from '../../lib/aiClient';
import { teamAnalysisInput } from '../../lib/teamAi';
import type { ResultRecord } from '../../lib/types';
import { ru } from '../../i18n/ru';
import { SectionTitle } from '../ui/Titles';

export function TeamAnalysisBlock({ records, hasLocal }: { records: ResultRecord[]; hasLocal: boolean }) {
  const initial = 'analysis' in demo && validTeamAnalysis(demo.analysis) ? demo.analysis : undefined;
  const [analysis, setAnalysis] = useState<TeamAnalysis | undefined>(initial);
  const [precomputed, setPrecomputed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const prepare = async () => {
    setLoading(true); setError('');
    try {
      if (records.length > 30) throw new Error('Для AI-анализа выберите не более 30 сотрудников.');
      if (!await aiAvailable()) throw new Error(ru.ai.teamUnavailable);
      const response = await fetch('/api/team-analyze', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(teamAnalysisInput(records)) });
      const value = await response.json();
      if (!response.ok) throw new Error(typeof value.error === 'string' ? value.error : ru.ai.teamUnavailable);
      if (!validTeamAnalysis(value.analysis)) throw new Error(ru.ai.teamUnavailable);
      setAnalysis(value.analysis); setPrecomputed(false);
    } catch (error) { setError(error instanceof Error ? error.message : ru.ai.teamUnavailable); }
    finally { setLoading(false); }
  };
  if (!analysis && !hasLocal) return null;
  return <section className="ai-analysis team-ai" aria-busy={loading}>
    <SectionTitle>{ru.ai.teamTitle}</SectionTitle>
    {loading && <p role="status">{ru.ai.teamLoading}</p>}
    {error && <p role="status" className="ai-caveat">{error}</p>}
    {analysis && <><h3>{analysis.headline}</h3><div className="team-ai-columns">
      <div><h3>{ru.ai.patterns}</h3><ul>{analysis.patterns.map((text) => <li key={text}>{text}</li>)}</ul></div>
      <div><h3>{ru.ai.teamRisks}</h3><ul>{analysis.risks.map((text) => <li key={text}>{text}</li>)}</ul></div>
    </div><h3>{ru.ai.priorities}</h3><ol className="team-ai-priorities">{analysis.trainingPriorities.map((item) =>
      <li key={item.quality}><strong>{item.quality}</strong><p>{item.action}</p></li>)}</ol>
      <p className="ai-caveat">{analysis.caveat}</p>
      {precomputed && <p className="ai-attribution">{ru.ai.teamDemo}</p>}</>}
    {hasLocal && <button className="btn btn-secondary no-print" disabled={loading}
      onClick={() => void prepare()}>{ru.ai.teamRefresh}</button>}
  </section>;
}
