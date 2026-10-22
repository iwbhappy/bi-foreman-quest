function Truck({ mixer = false }: { mixer?: boolean }) {
  return (
    <>
      <path d="M0 55h155V35h-30V10h-30v45Z" fill="#F28C28" />
      <path d="M100 15h21v22h-21Z" fill="#D0EFF9" />
      {mixer ? (
        <g className="event-drum">
          <ellipse cx="48" cy="26" rx="43" ry="28" fill="#EAF2FA" />
          <path d="m29 1 29 49M49 0l28 42" stroke="#7FA4BA" strokeWidth="6" />
        </g>
      ) : (
        <path d="M5 42h82M5 33h82M12 23h68" stroke="#668095" strokeWidth="8" />
      )}
      <circle cx="25" cy="64" r="14" fill="#17354F" />
      <circle cx="126" cy="64" r="14" fill="#17354F" />
      <circle cx="25" cy="64" r="6" fill="#DCE7EC" />
      <circle cx="126" cy="64" r="6" fill="#DCE7EC" />
    </>
  );
}
export function MixerArrive() {
  return (
    <g className="event-arrive">
      <Truck mixer />
    </g>
  );
}
// Сам миксер на въезде уезжает в декорации локации (QuestStage → LocationMotif), здесь — пыль и стрелка.
export function MixerLeave() {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          className="event-dust"
          cx={40 + i * 28}
          cy={72 - (i % 2) * 8}
          r={14 - i * 2}
          fill="#D8CCB8"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
      <path
        className="event-pop"
        d="M120 40H40m14-14L40 40l14 14"
        stroke="#1668B8"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}
export function TruckDelivery() {
  return (
    <g className="event-arrive">
      <Truck />
    </g>
  );
}
// Лоток подаёт бетон в опалубку перекрытия, опалубка заполняется снизу вверх.
export function PourConcrete() {
  return (
    <g>
      <path d="M4 0h26l42 40-12 9Z" fill="#F28C28" />
      <path d="M8 3h18l38 36" stroke="#C46A12" strokeWidth="3" fill="none" />
      <path className="event-stream" d="M68 48v24" stroke="#8C99A3" strokeWidth="11" strokeLinecap="round" />
      <rect className="event-fill" x="4" y="72" width="142" height="20" fill="#8C99A3" />
      <path d="M8 79h134M8 86h134" stroke="#0B3B6F" strokeWidth="1.5" opacity=".5" />
      <path d="M2 64v30h146V64" stroke="#9E7854" strokeWidth="5" fill="none" />
    </g>
  );
}
export function SlumpTest() {
  return (
    <g>
      <path className="event-slump" d="M40 5h32l24 75H18Z" fill="#9AA8B0" />
      <path d="M8 85h100" stroke="#17354F" strokeWidth="5" />
      <text className="event-pop" x="110" y="45" fontSize="40" fill="#D94A3A">
        ✗
      </text>
    </g>
  );
}
export function Samples() {
  return (
    <g className="event-samples">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          className="event-cube"
          x={i * 43}
          y={25 - i * 4}
          width="32"
          height="32"
          rx="3"
          fill="#A5AFB7"
          stroke="#607D91"
          strokeWidth="2"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
      <path d="M-8 64h145v30H-8Z" fill="#B8905C" />
      <path d="M0 75h126" stroke="#9E7854" strokeWidth="3" />
    </g>
  );
}
