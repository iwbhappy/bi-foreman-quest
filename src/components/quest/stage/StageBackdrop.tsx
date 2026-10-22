import { useEffect, useId, useState, type CSSProperties } from 'react';
import { skyAt } from '../../../lib/quest';
import type { HeroSkin } from '../../../lib/types';

// Безопасная область сцены — 800×600. Небо, земля и забор нарисованы с запасом за её краями,
// потому что видимая область подстраивается под пропорции панели (см. QuestStage).
const WIDE_X = -1600;
const WIDE_W = 4000;
export const GROUND_Y = 378;
export const BUILDING = { x: 600, width: 160, floorStep: 14, floorHeight: 13 };
export const HOOK_X = BUILDING.x + BUILDING.width / 2;
const HOOK_REST_Y = 200; // точка подвеса крюка в покое (над высоким зданием — выше крыши)
const BOOM_Y = 104;

export const floorTop = (index: number) => GROUND_Y - BUILDING.floorStep * (index + 1);

export function StageBackdrop({
  time,
  floors,
  theme,
  lifting = false,
  report = false,
}: {
  time: string;
  floors: number;
  theme: HeroSkin['theme'];
  lifting?: boolean;
  report?: boolean;
}) {
  const id = useId();
  const sky = skyAt(time);
  const night = time >= '18:30';
  const top = theme === 'tech' ? '#071E38' : theme === 'calm' ? '#9DC5C7' : theme === 'strict' ? '#8C9EAF' : sky.top;
  const bottom =
    theme === 'tech' ? '#173F5F' : theme === 'calm' ? '#E2ECD9' : theme === 'strict' ? '#D8DFE6' : sky.bottom;
  const [previous, setPrevious] = useState({ top, bottom });
  useEffect(() => {
    const timer = setTimeout(() => setPrevious({ top, bottom }), 800);
    return () => clearTimeout(timer);
  }, [top, bottom]);
  const groundFill = theme === 'tech' ? '#102D44' : '#C9B9A0';
  const fenceStroke = theme === 'tech' ? '#47B9CE' : '#988A74';
  const buildingFill = theme === 'tech' ? '#194B68' : '#0B3B6F';
  const buildingStroke = theme === 'tech' ? '#62D9ED' : '#506E8D';
  const craneStroke = theme === 'tech' ? '#62D9ED' : '#BD7A30';
  const newFloor = floors - 1;
  const slingApex = floorTop(newFloor) - 30;
  const hookRest = Math.min(HOOK_REST_Y, floors > 0 ? floorTop(floors - 1) - 46 : HOOK_REST_Y);
  const hookVars = {
    '--hook-from': `${slingApex - 80 - hookRest}px`,
    '--hook-to': `${slingApex - hookRest}px`,
  } as CSSProperties;
  const hour = Number(time.slice(0, 2)) + Number(time.slice(3, 5)) / 60;
  const day = Math.max(0, Math.min(1, (hour - 7) / 12));
  const orbit = { x: 60 + day * 680, y: 230 - Math.sin(day * Math.PI) * 170 };
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
          <stop stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`${id}-previous`} x1="0" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
          <stop stopColor={previous.top} />
          <stop offset="1" stopColor={previous.bottom} />
        </linearGradient>
        <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#62D9ED" strokeWidth=".5" opacity=".2" />
        </pattern>
        <clipPath id={`${id}-cable`}>
          <rect x={WIDE_X} y={BOOM_Y + 2} width={WIDE_W} height="1000" />
        </clipPath>
      </defs>
      {/* Небо: над безопасной областью — сплошной верхний цвет, внутри — градиент. */}
      <rect x={WIDE_X} y="-2000" width={WIDE_W} height="2600" fill={previous.top} />
      <rect x={WIDE_X} y="0" width={WIDE_W} height="600" fill={`url(#${id}-previous)`} />
      <g className="stage-sky" key={time + theme}>
        <rect x={WIDE_X} y="-2000" width={WIDE_W} height="2600" fill={top} />
        <rect x={WIDE_X} y="0" width={WIDE_W} height="600" fill={`url(#${id})`} />
      </g>
      {theme === 'tech' && <rect x={WIDE_X} y="-2000" width={WIDE_W} height="2600" fill={`url(#${id}-grid)`} />}
      <g className="stage-orbit" style={{ transform: `translate(${orbit.x}px, ${orbit.y}px)` }}>
        <circle r={night ? 19 : 28} fill={night ? '#EAF2FA' : '#FFE9A1'} />
        {night && <circle cx="10" cy="-6" r="18" fill={top} />}
      </g>
      {night &&
        [130, 270, 430, 690].map((x, i) => (
          <path
            key={x}
            className="stage-star"
            d="M0-4v8M-4 0h8"
            transform={`translate(${x} ${60 + (i % 2) * 40})`}
            stroke="white"
            opacity=".8"
          />
        ))}
      {[0, 1, 2].map((i) => (
        <g key={i} className={`stage-cloud cloud-${i}`} opacity=".45" fill="white">
          <ellipse cx={90 + i * 280} cy={120 + (i % 2) * 55} rx="58" ry="14" />
          <ellipse cx={112 + i * 280} cy={108 + (i % 2) * 55} rx="28" ry="19" />
        </g>
      ))}
      {/* Городской силуэт — повторяется по ширине. */}
      <g fill="#0B3B6F" opacity=".09">
        {[-800, 0, 800].map((dx) => (
          <path
            key={dx}
            transform={`translate(${dx} 0)`}
            d="M0 380V280h70v100h25V235h75v145h50V300h65v80h120V250h70v130h60V300h80v80h120V262h65v118Z"
          />
        ))}
      </g>
      <rect x={WIDE_X} y={GROUND_Y - 18} width={WIDE_W} height="2000" fill={groundFill} />
      <path d={`M${WIDE_X} 500H${WIDE_X + WIDE_W}M${WIDE_X} 560H${WIDE_X + WIDE_W}`} stroke="#A89B86" opacity=".18" strokeWidth="2" />
      <g stroke={fenceStroke} strokeWidth="4">
        <path d={`M${WIDE_X} 372H${WIDE_X + WIDE_W}M${WIDE_X} 392H${WIDE_X + WIDE_W}`} />
        {Array.from({ length: 106 }, (_, i) => (
          <path key={i} d={`M${-1596 + i * 38} 362v40`} />
        ))}
      </g>
      {/* Здание: этаж за каждую пройденную сцену. */}
      <g className="stage-building" fill={buildingFill} stroke={buildingStroke}>
        <path d={`M${BUILDING.x - 10} ${GROUND_Y - 4}h${BUILDING.width + 20}v12H${BUILDING.x - 10}Z`} fill="#73828D" />
        {Array.from({ length: floors }, (_, floor) => {
          const y = floorTop(floor);
          const isNew = lifting && floor === newFloor;
          return (
            <g key={floor} className={isNew ? 'stage-new-floor' : undefined} data-floor={floor + 1}>
              <rect x={BUILDING.x} y={y} width={BUILDING.width} height={BUILDING.floorHeight} rx="1" />
              {[0, 1, 2, 3].map((w) => (
                <rect
                  key={w}
                  x={BUILDING.x + 12 + w * 37}
                  y={y + 3.5}
                  width="25"
                  height="6"
                  fill={night || report ? '#FFE29B' : '#B9DFF4'}
                  stroke="none"
                />
              ))}
              {isNew && (
                <path
                  className="floor-sling"
                  d={`M${BUILDING.x + 8} ${y}L${HOOK_X} ${y - 30}L${BUILDING.x + BUILDING.width - 8} ${y}`}
                  fill="none"
                  stroke="#17354F"
                  strokeWidth="2"
                />
              )}
            </g>
          );
        })}
      </g>
      {/* Кран: мачта справа, стрела над зданием, крюк по центру здания. */}
      <g stroke={craneStroke} strokeWidth="4" fill="none">
        <path d={`M775 ${GROUND_Y}V92h18V${GROUND_Y}M775 104l18 22-18 22 18 22-18 22 18 22-18 22 18 22-18 22 18 22-18 22 18 22`} />
        <g className="stage-boom">
          <path d={`M540 92h330v12H540zM540 92 784 46l86 46M784 46v46`} />
          <rect x="820" y="106" width="44" height="22" fill="#0B3B6F" stroke="none" />
          <g clipPath={`url(#${id}-cable)`}>
            <g className={lifting ? 'stage-hook lifting' : 'stage-hook'} style={hookVars}>
              <path d={`M${HOOK_X} -600V${hookRest}`} strokeWidth="2.5" />
              <path
                d={`M${HOOK_X - 7} ${hookRest}h14v11h-14zM${HOOK_X} ${hookRest + 11}v12c0 11-14 11-14 1`}
                strokeWidth="4"
              />
            </g>
          </g>
        </g>
      </g>
      {Array.from({ length: night ? 1 : 3 }, (_, i) => (
        <g key={i} className={`stage-worker worker-${i}`} transform={`translate(${40 + i * 230} 352)`}>
          <circle cy="-15" r="5" fill="#F2C230" />
          <path d="M0-8V8m0-1-6 10M0 7l6 10M0-4l7 5" stroke="#45617B" strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}
      {(night || report) &&
        [40, 220, 470, 790].map((x, i) => (
          <g key={x} className="stage-lamp" style={{ animationDelay: `${i * 0.2}s` }}>
            <path d={`M${x} 396v-66`} stroke="#0B3B6F" strokeWidth="4" />
            <circle cx={x} cy="328" r="7" fill="#FFE49A" />
          </g>
        ))}
    </>
  );
}
