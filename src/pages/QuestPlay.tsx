import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import { SCENES } from '../data/quest';
import { INDICATORS } from '../data/quest';
import { stageSequence, sourceScene, stepLabel } from '../lib/stage';
import { useStagePlayback } from '../components/quest/stage/useStagePlayback';
import { ru } from '../i18n/ru';
import { hash, shuffle } from '../lib/shuffle';
import {
  callbackText,
  committedAnswers,
  completedScenes,
  consequenceFor,
  indicatorsAfter,
  sceneTime,
} from '../lib/quest';
import type { AnswerValue } from '../lib/types';
import { useQuestSession } from '../components/quest/useQuestSession';
import { QuestStage } from '../components/quest/stage/QuestStage';
import { NpcBubble } from '../components/quest/NpcBubble';
import { ChoiceCard } from '../components/quest/ChoiceCard';
import { ConsequenceCard } from '../components/quest/ConsequenceCard';
import { MentorPause } from '../components/quest/MentorPause';
import { plainText } from '../lib/moods';
import { Icon } from '../components/Icon';

export default function QuestPlay() {
  const { progress, select, accept: commit, next } = useQuestSession();
  const navigate = useNavigate();
  const sceneRef = useRef<HTMLElement>(null);
  const question = progress ? questions[progress.currentIndex] : null;
  const selected = question && progress ? progress.answers[question.id] : undefined;
  const sequence = stageSequence(question?.id ?? '', selected);
  const {
    running,
    phase,
    start: startPlayback,
    skip,
    reduced,
  } = useStagePlayback(question?.id ?? '', sequence, progress?.skin?.theme === 'calm');
  const accept = useCallback(() => {
    if (selected === undefined || progress?.consequenceShown) return;
    startPlayback();
    commit();
  }, [selected, progress?.consequenceShown, startPlayback, commit]);
  const options = useMemo(
    () =>
      question?.type === 'situation'
        ? shuffle(question.options, hash((progress?.sessionSeed ?? '') + question.id))
        : [],
    [question, progress?.sessionSeed],
  );
  const advance = useCallback(() => {
    if (running) return;
    if (next()) navigate('/quest/report');
  }, [next, navigate, running]);
  useEffect(() => {
    sceneRef.current?.focus();
    window.scrollTo(0, 0);
    document.querySelector('.quest-controls')?.scrollTo(0, 0);
  }, [question?.id]);
  useEffect(() => {
    if (!progress?.consequenceShown) return;
    const mobile = window.innerWidth < 768;
    if (running && mobile) {
      document
        .querySelector('.quest-stage')
        ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    } else if (!running) {
      document
        .querySelector('.consequence-card')
        ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'nearest' });
    }
  }, [running, reduced, progress?.consequenceShown]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (
        !question ||
        !progress ||
        progress.stage !== 'play' ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat
      )
        return;
      if (event.code === 'Space' && running) {
        event.preventDefault();
        skip();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (question.type === 'likert' || progress.consequenceShown) advance();
        else accept();
      } else if (/^[1-7]$/.test(event.key) && !progress.consequenceShown) {
        const index = Number(event.key) - 1;
        if (question.type === 'likert') {
          event.preventDefault();
          select(index as AnswerValue);
        } else if (options[index]) {
          event.preventDefault();
          select(options[index].id);
        }
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [question, progress, options, accept, advance, select, running, skip]);
  if (!progress || !question) return <Navigate to="/quest/start" replace />;
  if (progress.stage !== 'play') return <Navigate to="/quest/report" replace />;
  const scene = SCENES[question.id];
  const indicators = indicatorsAfter(committedAnswers(progress));
  const earlierAnswers = { ...committedAnswers(progress) };
  delete earlierAnswers[question.id];
  const callback = callbackText(question.id, progress.answers);
  const consequence = consequenceFor(question.id, selected);
  const canAdvance = question.type === 'likert' || progress.consequenceShown;
  const source = sourceScene(question.id);
  return (
    <main className="wrap quest-play" data-theme={progress.skin?.theme ?? 'bright'}>
      <div className="quest-layout">
        <QuestStage
          time={sceneTime(progress.currentIndex)}
          floors={completedScenes(progress)}
          location={scene.location}
          number={progress.currentIndex + 1}
          indicators={indicators}
          previousIndicators={indicatorsAfter(earlierAnswers)}
          skin={progress.skin}
          npcIds={
            question.type === 'likert'
              ? ['mentor']
              : question.id === 'q05'
                ? ['installer']
                : scene.npcLines.map((line) => line.npcId)
          }
          speech={scene.npcLines[0]?.text}
          mentor={question.type === 'likert'}
          sequence={sequence}
          consequence={consequence}
          running={running}
          phase={phase}
          committed={progress.consequenceShown}
          onSkip={skip}
          echoId={callback ? source?.id : undefined}
          alert={question.id === 'q05'}
        />
        <div className="quest-controls">
          <div className="quest-scene-heading">
            <span>{ru.quest.title}</span>
            <span>{ru.quest.scene(progress.currentIndex + 1)}</span>
          </div>
          <p className="quest-text-status">
            {sceneTime(progress.currentIndex)} ·{' '}
            {INDICATORS.map(
              ({ id, name }) =>
                `${name}: ${indicators[id]}${indicators[id] <= 25 ? ` (${ru.scene.danger})` : indicators[id] >= 90 ? ` (${ru.scene.excellent})` : ''}`,
            ).join(' · ')}{' '}
            · {ru.quest.completedBuilding(completedScenes(progress))}
          </p>
          <section
            className="quest-story card"
            ref={sceneRef}
            tabIndex={-1}
            aria-label={ru.quest.scene(progress.currentIndex + 1)}
          >
            {callback && (
              <div className="quest-callback">
                <small>↩ {ru.scene.echo(source?.type === 'situation' ? source.time : '')}</small>
                <p>{callback}</p>
              </div>
            )}
            {question.type === 'likert' ? (
              <MentorPause question={question} selected={selected} onSelect={select} />
            ) : (
              <>
                {scene.alert && (
                  <>
                    <p className="quest-alert">{plainText(scene.alert)}</p>
                  </>
                )}
                <span className="quest-question-title">
                  {question.time} · {question.title}
                </span>
                <h1 className="question-heading">{question.scene}</h1>
                {scene.npcLines.map((line, index) => (
                  <NpcBubble key={index} {...line} />
                ))}
                <p id="quest-prompt" className="quest-decision-title">
                  {question.prompt}
                </p>
                <div className="quest-choices" role="radiogroup" aria-labelledby="quest-prompt">
                  {options.map((option, index) => (
                    <ChoiceCard
                      key={option.id}
                      questionId={question.id}
                      option={option}
                      index={index}
                      selected={selected === option.id}
                      locked={progress.consequenceShown}
                      onSelect={select}
                    />
                  ))}
                </div>
                {progress.consequenceShown && consequence && (
                  <ConsequenceCard consequence={consequence} focus={!running} />
                )}
              </>
            )}
            <div className="quest-actions">
              {running && (
                <button className="btn btn-secondary stage-skip" onClick={skip}>
                  {ru.scene.skip}
                </button>
              )}
              <button
                className={`btn btn-primary ${selected !== undefined && !canAdvance ? 'decision-ready' : ''}`}
                disabled={selected === undefined || running}
                onClick={canAdvance ? advance : accept}
              >
                {canAdvance ? ru.quest.next : ru.quest.accept}
                <Icon name="arrow" className="!h-5 !w-5" />
              </button>
            </div>
            {progress.consequenceShown && sequence && (
              <p className="stage-text-events">
                {ru.scene.animation}:{' '}
                {sequence.steps.map((step) => stepLabel(step) || ru.scene.events[step.id]).join(' → ')}
              </p>
            )}
          </section>
          <p className="quest-keyboard">{question.type === 'likert' ? ru.quest.keyboardLikert : ru.quest.keyboard}</p>
        </div>
      </div>
    </main>
  );
}
