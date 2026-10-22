import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { sceneTime } from '../../../lib/quest';
import { LOCATIONS, INDICATORS, SCENES } from '../../../data/quest';
import { npcUrl } from '../../../data/art';
import { MoodIcon } from '../MoodIcon';
import { Icon } from '../../Icon';
import type { StageSequence } from '../../../data/stageEvents';
import { DEFAULT_SKIN } from '../../../data/skins';
import { ru } from '../../../i18n/ru';
import type { Consequence, HeroSkin, IndicatorId, Indicators, LocationId } from '../../../lib/types';
import { Hud } from '../Hud';
import { LocationMotif } from '../LocationMotif';
import { StageBackdrop } from './StageBackdrop';
import { HeroSilhouette } from '../HeroSilhouette';
import { StageEvent } from './events/StageEvent';
import { PHASE_HUD, PHASE_RESULT } from './useStagePlayback';
import { stepLabel } from '../../../lib/stage';

interface Props {
  time: string;
  floors: number;
  location: LocationId;
  number: number;
  indicators: Indicators;
  previousIndicators?: Indicators;
  skin?: HeroSkin;
  npcIds?: string[];
  speech?: string;
  mentor?: boolean;
  report?: boolean;
  sequence?: StageSequence;
  consequence?: Consequence;
  running?: boolean;
  phase?: number;
  committed?: boolean;
  onSkip?: () => void;
  echoId?: string;
  alert?: boolean;
}

/*
 * Раскладка безопасной области 800×600 (координаты SVG):
 *   передний план слева — герой и NPC (ноги на y≈592);
 *   второй план по центру — декорация локации (x 400…590);
 *   справа сзади — здание и кран (x 600…810);
 *   в небе слева — «врезка» события: крупная карточка с иллюстрацией и подписью, как кадр комикса.
 */
const ACTOR_SCALE = 0.7;
const ACTOR_Y = 350; // PNG-спрайт 240×340 при масштабе 0.7: ноги на y≈588
const HERO_X = 0;
const NPC_X = [140, 260];
const MOTIF_TRANSFORM = 'translate(213 99) scale(1.3)';
const INSTALLER_TRANSFORM = 'translate(427 157) scale(.38)';
const PANEL = { x: 60, y: 70, width: 340, height: 252 };
const EVENT_ORIGIN = { x: 114, y: 122, scale: 1.55 };
const PILLS_ANCHOR = { x: PANEL.x + PANEL.width / 2, y: PANEL.y - 6 };

interface View {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}
const DEFAULT_VIEW: View = { x: 0, y: 0, width: 800, height: 600, scale: 1 };

// Видимая область: вся ширина 0…800 и высота от regionTop до 600 помещаются под HUD,
// лишнее место заполняется небом сверху и землёй по бокам.
function computeView(width: number, height: number, hud: number): View {
  if (!width || !height) return DEFAULT_VIEW;
  const regionTop = height < 260 ? 250 : 90;
  const scale = Math.min(width / 800, Math.max(40, height - hud) / (600 - regionTop));
  const vw = width / scale;
  const vh = height / scale;
  return { x: 400 - vw / 2, y: 600 - vh, width: vw, height: vh, scale };
}

function wrapWords(text: string, max: number, lines: number) {
  const words = text.split(' ');
  const out: string[] = [''];
  for (const word of words) {
    const line = out[out.length - 1];
    if ((line + ' ' + word).trim().length <= max) out[out.length - 1] = (line + ' ' + word).trim();
    else if (out.length < lines) out.push(word);
    else {
      out[out.length - 1] = line.replace(/[,.!?]?$/, '…');
      return out;
    }
  }
  return out;
}

export function QuestStage({
  time,
  floors,
  location,
  number,
  indicators,
  previousIndicators,
  skin = DEFAULT_SKIN,
  npcIds = [],
  speech = '',
  mentor = false,
  report = false,
  sequence,
  consequence,
  running = false,
  phase = 99,
  committed = false,
  onSkip,
  echoId,
  alert = false,
}: Props) {
  const [bubble, setBubble] = useState(true);
  const spotlight = useId();
  const stageRef = useRef<HTMLElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [hudBottom, setHudBottom] = useState(0);

  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const measure = () => {
      const hud = node.querySelector<HTMLElement>('.quest-hud');
      const bottom = hud ? hud.offsetTop + hud.offsetHeight + 6 : 0;
      setHudBottom(bottom);
      setView(computeView(node.clientWidth, node.clientHeight, bottom));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    // HUD может менять высоту (перенос строк, подписи состояний) — подписи сцены и масштаб пересчитываются.
    const hud = node.querySelector<HTMLElement>('.quest-hud');
    if (hud) observer.observe(hud);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setBubble(true);
    const id = setTimeout(() => setBubble(false), 3000);
    return () => clearTimeout(id);
  }, [number]);

  const steps = sequence?.steps ?? [];
  const stepIndex = running ? Math.min(Math.max(phase, 0), steps.length - 1) : steps.length - 1;
  const step = committed && steps.length ? steps[stepIndex] : undefined;
  const showStep = step && (!running || phase >= 0);
  const resultShown = committed && (!running || phase >= PHASE_RESULT);
  const shownFloors = running && phase < PHASE_RESULT ? Math.max(0, floors - 1) : floors;
  const hudIndicators = running && phase < PHASE_HUD ? (previousIndicators ?? indicators) : indicators;
  const changed = INDICATORS.filter(({ id }) => consequence?.deltas[id] !== undefined);
  const showPills = running && phase >= PHASE_RESULT && changed.length > 0;
  const bump: IndicatorId[] = running && phase >= PHASE_HUD ? changed.map(({ id }) => id) : [];

  // Миксер на въезде уезжает сам (событие mixer_leave), а не появляется его копия.
  const leaveIndex = steps.findIndex((s) => s.id === 'mixer_leave');
  const vehicle =
    !committed || leaveIndex < 0
      ? 'here'
      : !running || phase > leaveIndex
        ? 'gone'
        : phase === leaveIndex
          ? 'leaving'
          : 'here';

  // Пилюли летят точно к своей шкале в HUD: смещение считаем по реальным прямоугольникам.
  useLayoutEffect(() => {
    if (!showPills) return;
    const stage = stageRef.current;
    pillsRef.current?.querySelectorAll<HTMLElement>('.stage-pill').forEach((pill) => {
      const target = stage?.querySelector<HTMLElement>(`.indicator-${pill.dataset.indicator} .hud-track`);
      if (!target) return;
      const from = pill.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      pill.style.setProperty('--dx', `${to.left + to.width / 2 - (from.left + from.width / 2)}px`);
      pill.style.setProperty('--dy', `${to.top + to.height / 2 - (from.top + from.height / 2)}px`);
    });
  }, [showPills]);

  const toPx = (x: number, y: number) => ({ left: (x - view.x) * view.scale, top: (y - view.y) * view.scale });
  const wide = { x: view.x - 10, y: view.y - 10, width: view.width + 20, height: view.height + 20 };
  const speechLines = wrapWords(speech, 34, 2);
  const npcState = (id: string) => {
    const index = steps.findIndex((s) => s.id === 'npc_leave' && s.target === id);
    if (!committed || index < 0) return '';
    if (!running || phase > index) return 'npc-departed';
    return phase === index ? 'npc-leaving' : '';
  };

  return (
    <aside
      ref={stageRef}
      className={`quest-stage theme-${skin.theme} ${mentor ? 'mentor-stage' : ''} ${committed ? 'stage-committed' : ''} ${running ? 'stage-playing' : 'stage-settled'}`}
      aria-hidden="true"
      data-theme={skin.theme}
      data-playing={running}
      onClick={running ? onSkip : undefined}
    >
      <Hud time={time} number={number} indicators={hudIndicators} bump={bump} />
      <svg
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        preserveAspectRatio="xMidYMax meet"
        className="stage-svg"
      >
        <defs>
          <radialGradient id={spotlight}>
            <stop stopColor="#FFF4CD" stopOpacity=".55" />
            <stop offset="1" stopColor="#FFF4CD" stopOpacity="0" />
          </radialGradient>
        </defs>
        <StageBackdrop
          time={time}
          floors={shownFloors}
          theme={skin.theme}
          report={report}
          lifting={running && phase >= PHASE_RESULT}
        />
        {step?.id === 'night_work' && showStep && (
          <g className="stage-night-event">
            <rect {...wide} fill="#071E38" opacity=".45" />
            <path d="m80 330 220 270H-60Zm620 0 120 270H470Z" fill="#FFE9A1" opacity=".12" />
          </g>
        )}
        <g transform={MOTIF_TRANSFORM}>
          <g className="stage-location" key={location}>
            <LocationMotif location={location} vehicle={vehicle} />
          </g>
        </g>
        <g className="stage-hero stage-actor" transform={`translate(${HERO_X} ${ACTOR_Y}) scale(${ACTOR_SCALE})`}>
          <g className={running && phase < 0 ? 'actor-gesture' : 'actor-idle'}>
            <HeroSilhouette skin={skin} gesture={running && phase < 0} bare />
          </g>
        </g>
        {!committed && !mentor && !report && (
          <g className="stage-thinking">
            <rect x="52" y="304" width="64" height="30" rx="15" fill="white" />
            <path d="m76 333 6 9 6-9" fill="white" />
            <text x="84" y="325" textAnchor="middle" fontSize="22" fill="#0B3B6F">
              {ru.scene.waiting}
            </text>
          </g>
        )}
        {npcIds.map((id, i) => {
          const installer = id === 'installer';
          const moods = resultShown
            ? sequence?.moods.filter((mood) => mood.npcId === id).map((mood) => mood.emotions[mood.emotions.length - 1])
            : committed && running
              ? sequence?.moods.filter((mood) => mood.npcId === id && mood.emotions.length > 1).map((mood) => mood.emotions[0])
              : [];
          return (
            <g
              key={id}
              data-npc={id}
              data-npc-index={i}
              className="stage-npc stage-actor"
              transform={
                installer ? INSTALLER_TRANSFORM : `translate(${NPC_X[i] ?? NPC_X[0]} ${ACTOR_Y}) scale(${ACTOR_SCALE})`
              }
            >
              {/* CSS-анимации — только на внутренних группах: внешняя держит позицию через атрибут transform. */}
              <g className={`npc-enter ${npcState(id)}`}>
                <g className="actor-idle">
<svg width="240" height="340" viewBox="0 0 240 340"><image href={npcUrl(id)} width="240" height="340" preserveAspectRatio="xMidYMax meet" /></svg>
                </g>
              </g>
              {moods?.map((emotion) => (
                <g key={emotion} className="npc-mood">
<g transform="translate(184 26) scale(2.4)"><MoodIcon emotion={emotion} /></g>
                </g>
              ))}
            </g>
          );
        })}
        {bubble && speech && !committed && !mentor && (
          <g className="stage-speech">
            <rect x="110" y={318 - speechLines.length * 23 - 22} width="330" height={speechLines.length * 23 + 22} rx="14" fill="white" />
            <path d="m210 317 14 18 10-18" fill="white" />
            {speechLines.map((line, i) => (
              <text key={line} x="128" y={318 - speechLines.length * 23 + 4 + i * 23} fontSize="16" fill="#0B3B6F">
                {line}
              </text>
            ))}
          </g>
        )}
        {echoId && SCENES[echoId] && (
          <g key={number} className="stage-memory">
            <rect x="20" y="150" width="180" height="104" rx="12" fill="#D8C6A8" opacity=".95" />
            <g transform="translate(-85 30) scale(.9)">
              <LocationMotif location={SCENES[echoId].location} />
            </g>
            <text x="34" y="244" fill="#694E2D" fontSize="14" fontWeight="600">
              ↩ {sceneTime(Number(echoId.slice(1)) - 1)}
            </text>
          </g>
        )}
        {showStep && (
          <g className="stage-event-panel">
            <rect {...PANEL} rx="22" fill="white" opacity=".96" />
            <path d={`M${PANEL.x + 120} ${PANEL.y + PANEL.height - 1}l-14 26 40-26Z`} fill="white" opacity=".96" />
            <g
              className="stage-event-position"
              transform={`translate(${EVENT_ORIGIN.x} ${EVENT_ORIGIN.y}) scale(${EVENT_ORIGIN.scale})`}
            >
              <StageEvent key={step.id + stepIndex} step={step} final={!running} />
            </g>
            {stepLabel(step) && (
              <text
                key={step.id + stepIndex}
                className="stage-event-caption"
                x={PANEL.x + PANEL.width / 2}
                y={PANEL.y + PANEL.height - 18}
                textAnchor="middle"
                fontSize="18"
                fontWeight="800"
                fill={step.alert ? '#D94A3A' : '#0B3B6F'}
              >
                {stepLabel(step)}
              </text>
            )}
          </g>
        )}
        {mentor && (
          <g className="stage-mentor-overlay">
            <rect {...wide} fill="#071E38" opacity=".45" />
            <ellipse cx="230" cy="470" rx="300" ry="190" fill={`url(#${spotlight})`} />
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                className="stage-steam"
                style={{ animationDelay: `${i * 0.5}s` }}
                d={`M${438 + i * 12} 304q-8-12 0-24t0-20`}
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ))}
          </g>
        )}
        {alert && !committed && (
          <rect
            className="stage-violation"
            x={view.x + 4}
            y={view.y + 4}
            width={view.width - 8}
            height={view.height - 8}
            rx={12 / view.scale}
            fill="none"
            stroke="#D94A3A"
            strokeWidth={10 / view.scale}
          />
        )}
      </svg>
      {showPills && consequence && (
        <div className="stage-pills" ref={pillsRef} style={toPx(PILLS_ANCHOR.x, PILLS_ANCHOR.y)}>
          {changed.map(({ id, name }, i) => {
            const value = consequence.deltas[id]!;
            return (
              <span
                key={id}
                className={`stage-pill ${value > 0 ? 'pill-up' : 'pill-down'}`}
                data-indicator={id}
                style={{ '--i': i } as CSSProperties}
              >
                {value > 0 ? '+' : '−'}
                {Math.abs(value)} <Icon name={id} /> {name}
              </span>
            );
          })}
        </div>
      )}
      <span className="stage-location-label" style={{ top: hudBottom + 4 }}>
        {LOCATIONS[location]}
      </span>
      <span className="stage-floor-label" style={{ top: hudBottom + 4 }}>
        {floors}/15 · {ru.quest.completedBuilding(floors)}
      </span>
      {running && <span className="stage-skip-hint">{ru.scene.skipHint}</span>}
    </aside>
  );
}
