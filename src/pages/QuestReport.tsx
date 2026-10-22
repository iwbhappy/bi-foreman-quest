import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ru } from '../i18n/ru';
import { loadQuestProgress, loadResults, saveQuestProgress, saveResult } from '../lib/storage';
import { createQuestResult } from '../lib/questResult';
import { QuestStage } from '../components/quest/stage/QuestStage';
import { indicatorsAfter } from '../lib/quest';
import { ShiftReport } from '../components/quest/ShiftReport';
import { portraitUrl } from '../data/art';
import { resolveSkin } from '../lib/skin';
import { HeroReveal } from '../components/quest/HeroReveal';

export default function QuestReport() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(loadQuestProgress);
  const record = useMemo(() => {
    if (!progress || progress.stage === 'play') return null;
    return loadResults().find((item) => item.id === progress.resultId) ?? createQuestResult(progress);
  }, [progress]);
  useEffect(() => {
    if (record && !loadResults().some((item) => item.id === record.id)) saveResult(record);
  }, [record]);
  useEffect(() => {
    if (!record || !progress) return;
    const image = new Image();
    image.src = portraitUrl(record.archetype.key, resolveSkin(progress.skin, progress.helmetColor).helmet);
  }, [record, progress]);
  if (!progress) return <Navigate to="/quest/start" replace />;
  if (progress.stage === 'play') return <Navigate to="/quest/play" replace />;
  if (!record) return <Navigate to="/quest/start" replace />;
  const reveal = () => {
    const next = { ...progress, stage: 'reveal' as const };
    saveQuestProgress(next);
    setProgress(next);
    window.scrollTo(0, 0);
  };
  return (
    <main className="wrap quest-report">
      {progress.stage === 'reveal' ? (
        <HeroReveal
          record={record}
          helmetColor={progress.helmetColor}
          onOpen={() => navigate(`/result/${record.id}`)}
        />
      ) : (
        <>
          <div className="quest-section-heading">
            
            <p>{ru.quest.title}</p>
          </div>
          <h1 className="quest-page-title">{ru.quest.closed}</h1>
          <div className="report-stage">
            <QuestStage
              time="19:00"
              floors={15}
              location="office"
              number={15}
              indicators={indicatorsAfter(progress.answers)}
              skin={progress.skin}
              report
            />
          </div>
          <ShiftReport answers={progress.answers} onReveal={reveal} />
        </>
      )}
    </main>
  );
}
