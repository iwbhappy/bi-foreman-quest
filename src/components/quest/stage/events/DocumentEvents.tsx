export function Paper() {
  return (
    <>
      <path d="M20 0h70l23 23v75H20Z" fill="#FFFFFF" stroke="#8EB1C6" strokeWidth="3" />
      <path d="M90 0v25h23M35 38h61M35 50h61M35 62h45M35 74h35" fill="none" stroke="#92AFC0" strokeWidth="3" />
    </>
  );
}
export function Document() {
  return (
    <g>
      <Paper />
      <path className="event-pen" d="m65 72 50-48 8 8-49 49-14 5Z" fill="#1668B8" />
      <g className="event-stamp">
        <rect x="75" y="65" width="63" height="24" rx="4" fill="#E6F3E9" stroke="#2E9E5B" strokeWidth="3" />
        <path d="m94 75 8 6 16-15" fill="none" stroke="#2E9E5B" strokeWidth="3" />
      </g>
    </g>
  );
}
export function Blueprint() {
  return (
    <g className="event-unroll">
      <rect y="5" width="145" height="90" rx="4" fill="#CFE8F7" stroke="#1668B8" strokeWidth="3" />
      <path d="M20 20h100v55H20zM55 20v55M20 45h100" fill="none" stroke="#1668B8" strokeWidth="3" />
      <circle className="event-mark" cx="55" cy="45" r="17" fill="none" stroke="#F28C28" strokeWidth="4" />
      <path className="event-pen" d="m100 70 35-35" stroke="#BD7A30" strokeWidth="8" />
    </g>
  );
}
export function Analysis() {
  return (
    <g>
      <Paper />
      <g className="event-magnifier">
        <circle cx="85" cy="45" r="27" fill="#BFE3FF" fillOpacity=".5" stroke="#1668B8" strokeWidth="7" />
        <path d="m104 64 30 30" stroke="#0B3B6F" strokeWidth="10" strokeLinecap="round" />
      </g>
    </g>
  );
}
export function Calendar() {
  return (
    <g>
      <rect x="10" y="5" width="110" height="95" rx="8" fill="white" stroke="#8EB1C6" strokeWidth="3" />
      <path d="M10 5h110v25H10Z" fill="#1668B8" />
      <path d="M35 0v17M95 0v17" stroke="#0B3B6F" strokeWidth="5" />
      <g className="event-calendar">
        <path d="M29 45h18m14 0h18m14 0h10M29 64h18m14 0h18m14 0h10" stroke="#8EB1C6" strokeWidth="5" />
        <text x="55" y="91" fontSize="22" fill="#1668B8">
          ✓
        </text>
      </g>
    </g>
  );
}
export function PhoneCall() {
  return (
    <g>
      <g className="event-phone">
        <rect x="42" width="49" height="95" rx="8" fill="#17354F" />
        <rect x="48" y="10" width="37" height="67" rx="3" fill="#CFE8F7" />
        <path d="M59 85h15" stroke="white" strokeWidth="3" />
      </g>
      <path
        className="event-signal"
        d="M25 20q-20 28 0 55M12 9q-32 39 0 79M108 20q20 28 0 55m13-66q32 39 0 79"
        stroke="#1668B8"
        strokeWidth="4"
        fill="none"
      />
    </g>
  );
}
export function InspectorCheck() {
  return (
    <g>
      <Paper />
      <text x="50" y="57" fontSize="42" fill="#F28C28" className="event-inspect-warning">
        !
      </text>
      <text x="45" y="67" fontSize="52" fill="#2E9E5B" className="event-inspect-check">
        ✓
      </text>
    </g>
  );
}
export function Idea() {
  return (
    <g>
      <g className="event-bulb">
        <path
          d="M47 48c-35-40 42-70 40-15 0 12-13 17-13 32H54c0-10-2-13-7-17"
          fill="#FFE9A1"
          stroke="#D6A932"
          strokeWidth="3"
        />
        <path d="M54 74h22M58 82h14" stroke="#17354F" strokeWidth="5" />
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} className={`event-idea-copy copy-${i}`}>
          <rect x={10 + i * 50} y="71" width="30" height="20" fill="white" stroke="#1668B8" />
          <path d={`M${15 + i * 50} 78h20`} stroke="#1668B8" />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={`M${5 + i * 50} 110v-14l20-8 20 8v14Z`} fill="#D0E5ED" stroke="#1668B8" strokeWidth="2" />
          <text x={25 + i * 50} y="107" textAnchor="middle" fontSize="12" fill="#1668B8">
            {i + 1}
          </text>
        </g>
      ))}
    </g>
  );
}
