// Маленький рабочий: каска, лицо, сигнальный жилет. Ноги стоят на y≈84.
function Worker({
  x = 0,
  pose = 'stand',
  vest = '#F28C28',
}: {
  x?: number;
  pose?: 'stand' | 'sit' | 'cheer' | 'walk';
  vest?: string;
}) {
  const body = pose === 'sit' ? 12 : 0;
  return (
    <g transform={`translate(${x} 0)`} className={`worker worker-${pose}`}>
      {pose === 'sit' ? (
        <path d="M13 66h13v18M27 66h13v18" stroke="#24405C" strokeWidth="7" strokeLinecap="round" fill="none" />
      ) : (
        <g className="worker-legs">
          <path d="M15 60 11 84M25 60l4 24" stroke="#24405C" strokeWidth="7" strokeLinecap="round" />
        </g>
      )}
      <g transform={`translate(0 ${body})`}>
        {pose === 'cheer' ? (
          <path d="M9 37 3 14M31 37l6-23" stroke={vest} strokeWidth="7" strokeLinecap="round" />
        ) : (
          <path d="M9 38 3 56M31 38l6 18" stroke={vest} strokeWidth="7" strokeLinecap="round" />
        )}
        <rect x="6" y="31" width="28" height="31" rx="9" fill={vest} />
        <path d="M7 48h26" stroke="#E6EEF5" strokeWidth="4" />
        <circle cx="20" cy="21" r="9" fill="#F1C9A5" />
        <path d="M10 19a10 10 0 0 1 20 0Z" fill="#F2C230" />
        <rect x="8" y="17" width="24" height="3.5" rx="1.5" fill="#F2C230" />
      </g>
    </g>
  );
}
export function CrewIdle() {
  return (
    <g className="event-idle">
      <rect x="-4" y="78" width="98" height="10" rx="2" fill="#9E7854" />
      <Worker pose="sit" />
      <Worker x={46} pose="sit" vest="#1668B8" />
      <g transform="translate(118 30)">
        <circle r="18" fill="white" stroke="#1668B8" strokeWidth="3" />
        <path className="event-clock-hand" d="M0 0V-12" stroke="#1668B8" strokeWidth="3" strokeLinecap="round" />
        <path d="M0 0h8" stroke="#1668B8" strokeWidth="3" strokeLinecap="round" />
      </g>
      <text className="event-zz" x="30" y="10" fill="#0B3B6F" fontSize="18" fontWeight="700">
        z
      </text>
      <text className="event-zz zz-2" x="44" y="-4" fill="#0B3B6F" fontSize="14" fontWeight="700">
        z
      </text>
    </g>
  );
}
export function CrewWork() {
  return (
    <g>
      <Worker />
      <Worker x={52} vest="#1668B8" />
      <g className="event-hammer">
        <path d="M86 56 104 30" stroke="#8C5A2B" strokeWidth="5" strokeLinecap="round" />
        <rect x="96" y="20" width="20" height="10" rx="2" fill="#5E6E7C" transform="rotate(-35 106 25)" />
      </g>
      <path className="event-sparks" d="m112 60 10 3m-6-10 8-8m-1 21 8 5" stroke="#F2C230" strokeWidth="3" />
      <rect x="0" y="96" width="140" height="7" rx="3" fill="#DCE7EC" />
      <rect className="event-progress" x="0" y="96" width="118" height="7" rx="3" fill="#2E9E5B" />
    </g>
  );
}
export function CrewMove() {
  return (
    <g>
      <g className="event-move">
        <Worker pose="walk" />
        <Worker x={44} pose="walk" vest="#1668B8" />
      </g>
      <path d="M100 50h44m-12-12 12 12-12 12" stroke="#1668B8" strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  );
}
export function StopWork() {
  return (
    <g className="event-pop">
      <path d="M60 50v52" stroke="#0B3B6F" strokeWidth="6" />
      <path
        d="m20 0 40 0 20 20v40L60 80H20L0 60V20Z"
        transform="translate(20 -18)"
        fill="#D94A3A"
        stroke="white"
        strokeWidth="4"
      />
      <text x="60" y="28" textAnchor="middle" fontSize="19" fontWeight="800" fill="white">
        СТОП
      </text>
    </g>
  );
}
export function Meeting() {
  return (
    <g>
      <Worker />
      <Worker x={46} vest="#1668B8" />
      <Worker x={92} vest="#2E9E5B" />
      <path d="M-6 66h144v9H-6Zm14 9v18m116-18v18" fill="#B8905C" stroke="#B8905C" strokeWidth="4" />
      <g className="event-bubble">
        <rect x="44" y="-30" width="44" height="26" rx="13" fill="white" />
        <text x="66" y="-12" textAnchor="middle" fontSize="20" fill="#1668B8">
          …
        </text>
      </g>
    </g>
  );
}
export function TeamCheer() {
  return (
    <g>
      <g className="event-cheer">
        <Worker pose="cheer" />
        <Worker x={46} pose="cheer" vest="#1668B8" />
        <Worker x={92} pose="cheer" vest="#2E9E5B" />
      </g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle
          className="stage-particle"
          key={i}
          cx={8 + i * 24}
          cy={-4 - (i % 2) * 14}
          r="4"
          fill={i % 2 ? '#F28C28' : '#1668B8'}
          style={{ animationDelay: `${i * 0.06}s` }}
        />
      ))}
    </g>
  );
}
// Уходит сам NPC на сцене (см. QuestStage), здесь — только стрелка направления.
export function NpcLeave() {
  return (
    <path
      className="event-pop"
      d="M30 60h80m-16-16 16 16-16 16"
      stroke="#1668B8"
      strokeWidth="6"
      fill="none"
      strokeLinecap="round"
    />
  );
}
export function NpcMood() {
  return null;
}
