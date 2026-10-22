import { Link } from 'react-router-dom';
import { ru } from '../../i18n/ru';
import type { ResultRecord } from '../../lib/types';
import { SectionTitle } from '../ui/Titles';
import { useAnalysis } from './useAnalysis';

export function AnalysisBlock({ record, manager = false }: { record: ResultRecord; manager?: boolean }) {
  const state = useAnalysis(record, !manager);
  if (state.status === 'hidden' || state.status === 'checking') return null;
  const analysis = state.response?.analysis;
  const ready = state.status === 'ready' && analysis;
  return <section className={`ai-analysis ${manager ? 'ai-manager' : 'ai-employee'} ${ready ? 'ai-ready' : 'no-print'}`}
    aria-busy={state.status === 'loading'} aria-label={manager ? ru.ai.managerTitle : ru.ai.title}>
    <SectionTitle>{manager ? ru.ai.managerTitle : ru.ai.title}</SectionTitle>
    {state.status === 'loading' && <div role="status" className="ai-loading">
      <div className="ai-skeleton" aria-hidden="true">{[0, 1, 2, 3].map((line) => <span key={line} />)}</div>
      <p>{ru.ai.loading}</p></div>}
    {state.status === 'idle' && <button className="btn btn-secondary no-print"
      onClick={() => void state.prepare()}>{ru.ai.prepare}</button>}
    {state.status === 'error' && <div className="ai-error" role="status"><p>{ru.ai.unavailable}</p>
      {state.error?.includes('лимит') || state.error?.includes('Лимит') ? <p>{state.error}</p> : null}
      <button className="btn btn-secondary no-print" onClick={() => void state.prepare(true)}>{ru.ai.retry}</button></div>}
    {ready && <>
      <h3 className="ai-headline">{analysis.headline}</h3>
      {manager ? <ul className="ai-manager-tips">{analysis.managerTips.map((tip) => <li key={tip}>{tip}</li>)}</ul> : <>
        <p className="ai-decision-style">{analysis.decisionStyle}</p>
        <div className="ai-columns">{[
          { title: ru.ai.strengths, points: analysis.strengths }, { title: ru.ai.risks, points: analysis.risks },
        ].map((group) => <div key={group.title}><h3>{group.title}</h3>{group.points.map((point) =>
          <article className="ai-point" key={point.title}><h4>{point.title}</h4><p>{point.evidence}</p></article>)}</div>)}</div>
        <h3>{ru.ai.growthPlan}</h3><ol className="ai-growth-plan">{analysis.growthPlan.map((step) =>
          <li key={step.action}><p>{step.action}</p><small>{step.why}</small></li>)}</ol>
      </>}
      <p className="ai-caveat">{analysis.caveat}</p>
      {state.demo && <p className="ai-attribution ai-demo-label">{ru.ai.demo}</p>}
      <p className="ai-attribution">{ru.ai.attribution}{' '}
        <Link to="/method#ai">{ru.ai.how}</Link></p>
      <button className="btn btn-link no-print ai-refresh" onClick={() => {
        if (window.confirm(ru.ai.confirmRefresh)) void state.prepare(true);
      }}>{ru.ai.refresh}</button>
    </>}
  </section>;
}
