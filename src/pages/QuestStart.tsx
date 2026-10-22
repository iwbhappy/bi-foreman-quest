import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MORNING_CONTEXT } from '../data/quest';
import { HELMETS } from '../data/skins';
import { resolveSkin } from '../lib/skin';
import { SkinDesigner } from '../components/quest/SkinDesigner';
import { ru } from '../i18n/ru';
import { loadQuestProgress, saveQuestProgress } from '../lib/storage';
import { ParticipantFields } from '../components/ParticipantFields';
import { HeroSilhouette } from '../components/quest/HeroSilhouette';
import { PageTitle } from '../components/ui/Titles';
import { Icon } from '../components/Icon';

export default function QuestStart() {
  const navigate = useNavigate();
  const [saved] = useState(loadQuestProgress);
  const [skin, setSkin] = useState(() => resolveSkin(saved?.skin, saved?.helmetColor));
  const helmetColor = HELMETS[skin.helmet];
  const start = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    saveQuestProgress({
      methodologyVersion: '1.0',
      participant: {
        name: String(data.get('name') ?? '').trim(),
        position: String(data.get('position')),
        experience: String(data.get('experience')),
      },
      answers: {},
      sessionSeed: crypto.randomUUID(),
      currentIndex: 0,
      startedAt: new Date().toISOString(),
      perQuestionSec: {},
      helmetColor,
      skin,
      consequenceShown: false,
      stage: 'play',
    });
    navigate('/quest/play');
  };
  return (
    <main className="wrap quest-start" data-theme={skin.theme}>
      <Link to="/" className="quest-back-link">
        ← {ru.home}
      </Link>
<PageTitle>{ru.quest.create}</PageTitle>
      <div className="quest-start-grid">
        <section className="hero-preview">
          <span className="hero-preview-time">{ru.quest.day}</span>
          <div className="hero-preview-actor">
            <HeroSilhouette helmetColor={helmetColor} skin={skin} />
          </div>
          <h2>{ru.quest.heroHint}</h2>
          <p className="morning-context">{MORNING_CONTEXT}</p>
          <p>{ru.quest.irreversible}</p>
        </section>
        <section className="participant-card card">
          {saved && (
            <Link className="resume-link" to={saved.stage === 'play' ? '/quest/play' : '/quest/report'}>
              {ru.quest.resume}
              <Icon name="arrow" />
            </Link>
          )}
          <form className="space-y-5" onSubmit={start}>
            <ParticipantFields participant={saved?.participant} />
            <SkinDesigner skin={skin} onChange={setSkin} />
            <button className="btn btn-primary w-full justify-between" type="submit">
              {ru.quest.leave}
              <Icon name="arrow" />
            </button>
          </form>
          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
            <Icon name="lock" className="!h-4 !w-4" />
            {ru.privacy}
          </p>
        </section>
      </div>
    </main>
  );
}
