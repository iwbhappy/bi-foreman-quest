import { moodFor } from '../../lib/moods';
export function MoodIcon({ emotion }: { emotion: string }) {
  const mood = moodFor(emotion);
  const color = { happy: '#2E9E5B', neutral: '#1668B8', doubt: '#A65310', angry: '#D94A3A', thumbs: '#2E9E5B' }[mood];
  return <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" data-mood={mood}>
    <circle cx="14" cy="14" r="13" fill="white" stroke={color} strokeWidth="2" />
    <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      {mood === 'thumbs' ? <path d="M8 14h4l3-7q3 0 1 6h5l-2 9H9Zm1 0v8" /> : <>
        <path d="M9 10h1m8 0h1" />
        <path d={mood === 'happy' ? 'M8 16q6 8 12 0' : mood === 'angry' ? 'M8 21q6-8 12 0' :
          mood === 'doubt' ? 'm8 19 12-3' : 'M8 18h12'} />
      </>}
    </g></svg>;
}

