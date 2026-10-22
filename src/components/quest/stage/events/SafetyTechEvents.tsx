export function SafetyFix() {
  return (
    <g>
      <path d="M20 0v45m85-45v45" stroke="#9DAEB7" strokeWidth="7" />
      <g className="event-carabiner">
        <rect
          x="34"
          y="20"
          width="50"
          height="55"
          rx="21"
          transform="rotate(25 59 48)"
          fill="none"
          stroke="#1668B8"
          strokeWidth="9"
        />
        <path d="m74 21 10 32" stroke="#F2C230" strokeWidth="9" />
      </g>
      <g className="event-shield">
        <path d="m95 38 32 10v24q0 20-32 31-32-11-32-31V48Z" fill="#D2EFDD" stroke="#2E9E5B" strokeWidth="3" />
        <path d="m78 68 12 10 23-25" fill="none" stroke="#2E9E5B" strokeWidth="5" />
      </g>
    </g>
  );
}
export function AnchorAdd() {
  return (
    <g>
      <path d="M0 80h150" stroke="#617F95" strokeWidth="12" />
      {[35, 110].map((x, i) => (
        <g key={x} className="event-anchor" style={{ animationDelay: `${i * 0.2}s` }}>
          <path d={`M${x} 80V38`} stroke="#17354F" strokeWidth="8" />
          <circle cx={x} cy="25" r="15" fill="none" stroke="#2E9E5B" strokeWidth="7" />
        </g>
      ))}
    </g>
  );
}
export function Tablet() {
  return (
    <g className="event-tablet">
      <rect x="15" width="115" height="95" rx="8" fill="#17354F" />
      <rect x="23" y="9" width="99" height="77" rx="3" fill="#D5F1F3" />
      {[28, 51, 74].map((y, i) => (
        <g key={y} className="event-tablet-check" style={{ animationDelay: `${i * 0.2}s` }}>
          <path d={`m34 ${y} 6 6 12-13`} fill="none" stroke="#2E9E5B" strokeWidth="4" />
          <path d={`M65 ${y}h40`} stroke="#8AAEBA" strokeWidth="3" />
        </g>
      ))}
    </g>
  );
}
export function TabletGlitch() {
  return (
    <g>
      <g className="event-glitch">
        <rect x="0" y="5" width="90" height="80" rx="8" fill="#17354F" />
<g transform="translate(18 20)" fill="none" stroke="#F2C230" strokeWidth="3"><path d="m20 0 20 36H0Z"/><path d="M20 11v12m0 6v1"/></g>
      </g>
      <rect x="90" y="25" width="48" height="65" rx="2" fill="white" stroke="#1668B8" strokeWidth="3" />
      <path d="M100 40h28m-28 12h28m-28 12h28m-28 12h20" stroke="#8EB1C6" strokeWidth="2" />
    </g>
  );
}
export function NightWork() {
  return (
    <g>
      <rect x="-20" y="-10" width="190" height="120" rx="12" fill="#102A46" opacity=".9" />
      <path d="M0 100V35h30m85 65V35h30" stroke="#D2DFE8" strokeWidth="4" />
      <path className="event-spotlight" d="m30 35 70 65H0Z" fill="#FFE9A1" opacity=".3" />
      <path className="event-spotlight" d="m145 35 25 65H75Z" fill="#FFE9A1" opacity=".3" />
      <circle cx="95" cy="18" r="13" fill="#FFE9A1" />
      <circle cx="101" cy="14" r="13" fill="#102A46" />
    </g>
  );
}
