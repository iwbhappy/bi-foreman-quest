import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import { ru } from '../i18n/ru';
import { hash, shuffle } from '../lib/shuffle';
import { useTestSession } from '../components/useTestSession';
import { Icon } from '../components/Icon';
import { SituationQuestion } from '../components/test/SituationQuestion';
import { LikertQuestion } from '../components/test/LikertQuestion';
import { TestProgress } from '../components/test/TestProgress';
import type { AnswerValue } from '../lib/types';

export default function Test() {
  const { progress, answer, move, finish } = useTestSession();
  const navigate = useNavigate();
  const heading = useRef<HTMLHeadingElement>(null);
  const question = progress ? questions[progress.currentIndex] : null;
  const options = useMemo(
    () =>
      question?.type === 'situation'
        ? shuffle(question.options, hash((progress?.sessionSeed ?? '') + question.id))
        : [],
    [question, progress?.sessionSeed],
  );
  const selected = question && progress ? progress.answers[question.id] : undefined;
  const next = useCallback(() => {
    if (!question || selected === undefined) return;
    if (progress?.currentIndex === questions.length - 1) {
      const id = finish();
      if (id) navigate(`/result/${id}`);
    } else move(1);
  }, [question, selected, progress?.currentIndex, finish, navigate, move]);
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo(0, 0);
  }, [question?.id]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      } else if (/^[1-7]$/.test(event.key) && question) {
        const index = Number(event.key) - 1;
        if (question.type === 'likert') {
          event.preventDefault();
          answer(index as AnswerValue);
        } else if (options[index]) {
          event.preventDefault();
          answer(options[index].id);
        }
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [question, options, answer, move, next]);
  if (!progress || !question) return <Navigate to="/" replace />;
  return (
    <main className="test-wrap wrap">
      <TestProgress index={progress.currentIndex} total={questions.length} />
      <section className="question-card card">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="scene-chip">
            {question.type === 'situation' ? `${question.time} · ${question.title}` : ru.assertion}
          </span>
          <span className="text-xs text-slate-400">{String(progress.currentIndex + 1).padStart(2, '0')} / 15</span>
        </div>
        <h1
          ref={heading}
          tabIndex={-1}
          className={`question-heading ${question.type === 'likert' ? 'likert-heading' : ''}`}
        >
          {question.type === 'situation' ? question.scene : `«${question.statement}»`}
        </h1>
        {question.type === 'situation' ? (
          <SituationQuestion question={question} options={options} selected={selected} onAnswer={answer} />
        ) : (
          <LikertQuestion question={question} selected={selected} onAnswer={answer} />
        )}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
          <button className="btn btn-secondary" disabled={progress.currentIndex === 0} onClick={() => move(-1)}>
            {ru.back}
          </button>
          <button className="btn btn-primary" disabled={selected === undefined} onClick={next}>
            {progress.currentIndex === questions.length - 1 ? ru.finish : ru.next}
            <Icon name="arrow" className="!h-5 !w-5" />
          </button>
        </div>
      </section>
      <p className="mt-5 hidden text-center text-xs text-slate-400 sm:block">
        {question.type === 'situation' ? ru.keyboard : ru.keyboardLikert}
      </p>
    </main>
  );
}
