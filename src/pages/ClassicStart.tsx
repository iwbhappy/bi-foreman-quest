import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ru } from '../i18n/ru';
import { loadProgress, saveProgress } from '../lib/storage';
import { ParticipantFields } from '../components/ParticipantFields';
import { PageTitle } from '../components/ui/Titles';
import { Icon } from '../components/Icon';

export default function ClassicStart() {
  const navigate = useNavigate();
  const [progress] = useState(loadProgress);
  const start = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    saveProgress({
      methodologyVersion: '1.0',
      participant: {
        name: String(form.get('name') ?? '').trim(),
        position: String(form.get('position')),
        experience: String(form.get('experience')),
      },
      answers: {},
      sessionSeed: crypto.randomUUID(),
      currentIndex: 0,
      startedAt: new Date().toISOString(),
      perQuestionSec: {},
    });
    navigate('/test');
  };
  return (
    <main className="wrap classic-start">
      <Link to="/" className="quest-back-link">
        ← {ru.home}
      </Link>
      <PageTitle>{ru.classic}</PageTitle>
      <section className="participant-card card">
        {progress && (
          <Link className="resume-link" to="/test">
            {ru.continue(progress.currentIndex + 1)}
            <Icon name="arrow" />
          </Link>
        )}
        <form className="space-y-5" onSubmit={start}>
          <ParticipantFields participant={progress?.participant} />
          <button className="btn btn-primary w-full justify-between" type="submit">
            {ru.start}
            <Icon name="arrow" />
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-slate-500">{ru.privacy}</p>
      </section>
    </main>
  );
}
