import { useId } from 'react';
import { LOCATIONS } from '../../data/quest';
import { ru } from '../../i18n/ru';
import { skyAt } from '../../lib/quest';
import type { LocationId } from '../../lib/types';
import { LocationMotif } from './LocationMotif';

interface Props {
  time: string;
  floors: number;
  location: LocationId;
}
export function Diorama({ time, floors, location }: Props) {
  const skyId = useId();
  const sky = skyAt(time);
  return (
    <div className="diorama" role="img" aria-label={`${LOCATIONS[location]}. ${ru.quest.completedBuilding(floors)}`}>
      <svg viewBox="0 0 720 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={skyId} x2="0" y2="1">
            <stop stopColor={sky.top} />
            <stop offset="1" stopColor={sky.bottom} />
          </linearGradient>
        </defs>
        <rect width="720" height="240" fill={`url(#${skyId})`} />
        <circle
          r="19"
          fill="#FFF2BE"
          className="quest-sun"
          style={{ transform: `translate(${sky.sunX}px, ${sky.sunY}px)` }}
        />
        <g fill="white" opacity=".45">
          <ellipse cx="260" cy="56" rx="53" ry="10" />
          <ellipse cx="600" cy="75" rx="57" ry="8" />
        </g>
        <g fill="#0B3B6F" opacity=".08">
          <path d="M10 190V97h66v93m-40-93V79h29v18M585 190V116h66v74M662 190V82h58v108" />
        </g>
        <rect y="202" width="720" height="38" fill="#C9B79C" />
        <g stroke="#B09D84" strokeWidth="3">
          <path d="M0 190h720M0 200h720" />
          {Array.from({ length: 20 }, (_, index) => (
            <path key={index} d={`M${index * 40} 182v28`} />
          ))}
        </g>
        <g className="quest-crane" stroke="#BB741C" strokeWidth="3" fill="none">
          <path d="M525 204V35h15v169M525 42l15 15-15 15 15 15-15 15 15 15-15 15 15 15-15 15 15 15M388 35h230v10H388zM388 35 533 5l85 30M533 5v30" />
          <g className="crane-hook">
            <path d="M418 45v65m-6 0h12v9h-12zm6 9v10c0 11-12 11-12 2" />
          </g>
          <path d="M563 46h42v13h-42z" fill="#0B3B6F" stroke="none" />
        </g>
        <path d="M320 207h174v8H320Z" fill="#9A8A75" />
        {Array.from({ length: floors }, (_, floor) => (
          <g key={floor} className="quest-floor" data-floor={floor + 1}>
            <rect x="330" y={196 - floor * 9} width="150" height="8" rx="1" fill="#0B3B6F" />
            {[0, 1, 2, 3].map((window) => (
              <rect
                key={window}
                x={340 + window * 36}
                y={198 - floor * 9}
                width="23"
                height="4"
                rx=".5"
                fill="#BFE3FF"
              />
            ))}
          </g>
        ))}
        <LocationMotif location={location} />
        <path d="M599 208h10l-5-17Zm25 0h10l-5-17Z" fill="#F28C28" />
        {location === 'cabin' && <rect width="720" height="240" fill="#0B1B2D" opacity=".3" />}
      </svg>
      <span className="location-label">{LOCATIONS[location]}</span>
      <span className="building-counter" aria-hidden="true">
        {floors}/15
      </span>
    </div>
  );
}
