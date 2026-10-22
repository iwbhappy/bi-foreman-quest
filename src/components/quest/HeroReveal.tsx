import { useEffect, useState } from 'react';
import { ru } from '../../i18n/ru';
import { traits } from '../../data/traits';
import type { ResultRecord } from '../../lib/types';
import { HeroSilhouette } from './HeroSilhouette';
import { useReducedMotion } from './useReducedMotion';
import { Icon } from '../Icon';

interface Props {
  record: ResultRecord;
  helmetColor: string;
  onOpen: () => void;
}
export function HeroReveal({ record, helmetColor, onOpen }: Props) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<'waiting' | 'rays' | 'flash' | 'final'>(reduced ? 'final' : 'waiting');
  useEffect(() => {
    if (reduced) return;
    const timers = [
      setTimeout(() => setPhase('rays'), 1000),
      setTimeout(() => setPhase('flash'), 2200),
      setTimeout(() => setPhase('final'), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduced]);
  const final = reduced || phase === 'final';
  const strength = record.strengths[0],
    growth = record.growthZones[0];
  const letterDuration = record.archetype.name.length * 40;
  return (
    <section className={`hero-reveal reveal-phase-${phase}`} data-revealed={final}>
      <div className="reveal-rays" aria-hidden="true" />
      <div className="reveal-flash" aria-hidden="true" />
      {final && !reduced && (
        <div className="reveal-particles" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${8 + ((i * 37) % 84)}%`,
                top: `${8 + ((i * 17) % 62)}%`,
                background: i % 2 ? '#F28C28' : '#62B6F2',
                animationDelay: `${(i % 5) * 60}ms`,
              }}
            />
          ))}
        </div>
      )}
      <div className="reveal-portrait">
        <div className={final ? 'revealed-avatar' : 'mystery-avatar'} data-helmet-color={helmetColor}>
          <HeroSilhouette
            helmetColor={helmetColor}
            skin={record.skin}
            archetypeKey={final ? record.archetype.key : undefined}
            label={final ? record.archetype.name : undefined}
          />
        </div>
      </div>
      <div className={`reveal-copy ${final ? 'visible' : ''}`} aria-live="polite">
        {final && (
          <>
            <p>{ru.quest.revealed}</p>
            <h1 aria-label={record.archetype.name}>
              {record.archetype.name.split('-').map((word, index, words) => {
                const offset = words.slice(0, index).join('-').length + (index ? 1 : 0);
                return (
                  <span className="reveal-word" key={index} aria-hidden="true">
                    {[...(word + (index < words.length - 1 ? '-' : ''))].map((letter, i) => (
                      <span className="reveal-letter" key={i} style={{ animationDelay: `${(offset + i) * 40}ms` }}>
                        {letter === ' ' ? '\u00a0' : letter}
                      </span>
                    ))}
                  </span>
                );
              })}
            </h1>
            <div className="reveal-details" style={{ animationDelay: `${letterDuration}ms` }}>
              <p className="reveal-description">{record.archetype.description}</p>
              <div className="reveal-traits">
                <p>
                  {ru.scene.strength}: {traits[strength].name} {record.percents[strength]}%
                </p>
                <p>
                  {ru.scene.growth}: {traits[growth].name} {record.percents[growth]}%
                </p>
              </div>
              <button className="btn btn-primary" onClick={onOpen}>
                {ru.quest.openProfile}
                <Icon name="arrow" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
