import type { LocationId } from '../../lib/types';

export function LocationMotif({
  location,
  vehicle = 'here',
}: {
  location: LocationId;
  /** Для миксера на въезде: 'leaving' — уезжает сейчас, 'gone' — уже уехал. */
  vehicle?: 'here' | 'leaving' | 'gone';
}) {
  const motifs = {
    office: (
      <>
        <rect x="0" y="-38" width="112" height="48" rx="3" fill="#EAF2FA" />
        <path d="M-5-40h122M70-30v40M3 12h108" stroke="#0B3B6F" strokeWidth="4" />
        <rect x="12" y="-27" width="33" height="21" fill="#92BBD9" />
        <rect x="78" y="-25" width="21" height="35" fill="#1668B8" />
      </>
    ),
    slab: (
      <>
        <path d="M0-4h125v15H0z" fill="#9E7854" />
        <path
          d="M8-10v24m20-24v24m20-24v24m20-24v24m20-24v24m20-24v24M0-6h125M0 2h125"
          stroke="#0B3B6F"
          strokeWidth="2"
        />
      </>
    ),
    mixer: (
      <>
        <path d="M-6 3h140v-18H96v-30h27l16 25V3" fill="#F28C28" />
        <ellipse cx="45" cy="-28" rx="42" ry="25" fill="#FFF4E6" transform="rotate(-17 45 -28)" />
        <path d="m29-48 28 39M99-40h18l10 16H99" fill="#8EC9FF" stroke="#0B3B6F" strokeWidth="2" />
        <circle cx="20" cy="9" r="11" fill="#1E2A3A" />
        <circle cx="116" cy="9" r="11" fill="#1E2A3A" />
      </>
    ),
    height: (
      <>
        <path
          d="M9-65v78m40-78v78m40-78v78M0-55h100M0-24h100M0 8h100M9-55l40 31L9 8m40-63 40 31L49 8"
          stroke="#0B3B6F"
          strokeWidth="3"
          fill="none"
        />
        <path d="M0-29h100v7H0z" fill="#F28C28" />
      </>
    ),
    floor: (
      <>
        <circle cx="28" cy="-8" r="25" fill="#9E7854" />
        <circle cx="28" cy="-8" r="17" fill="#DCC7AC" />
        <circle cx="28" cy="-8" r="8" fill="#0B3B6F" />
        <path d="M70-22h38l-5 35H76Z" fill="#EAF2FA" />
        <path d="M73-25c0-30 33-30 33 0" stroke="#0B3B6F" strokeWidth="2" fill="none" />
      </>
    ),
    warehouse: (
      <>
        <path d="M0 8h130M7 1h120M14-6h106M21-13h92M28-20h78" stroke="#556A80" strokeWidth="5" />
        <path d="M0 14h135M15 14v8m102-8v8" stroke="#9E7854" strokeWidth="6" />
      </>
    ),
    meeting: (
      <>
        <path d="M6-15h122v9H6zm14 9v30m92-30v30" fill="#9E7854" stroke="#9E7854" strokeWidth="3" />
        <rect x="43" y="-66" width="71" height="43" rx="3" fill="#0B3B6F" />
        <path d="m53-37 12-13 12 7 23-14" stroke="#BFE3FF" strokeWidth="3" fill="none" />
      </>
    ),
    ptoOffice: (
      <>
        <rect x="4" y="-40" width="21" height="55" rx="2" fill="#1668B8" />
        <rect x="29" y="-50" width="23" height="65" rx="2" fill="#F28C28" />
        <rect x="56" y="-44" width="22" height="59" rx="2" fill="#0B3B6F" />
        <path d="M10-24h9m16-10h10m17 6h10" stroke="white" strokeWidth="4" />
        <path d="M83 9h44v-6H89V-3h33v-6H94v-6h28" stroke="#EAF2FA" strokeWidth="6" />
      </>
    ),
    cabin: (
      <>
        <path d="M0 8h125M10 8v17m104-17v17" stroke="#9E7854" strokeWidth="7" />
        <path d="M11-6c0-26 2-36 21-36S54-31 54-6Z" fill="#EAF2FA" />
        <path d="M54-32c27 0 21 20 0 20M13-41h39M30-49v-5" stroke="#0B3B6F" strokeWidth="3" fill="none" />
        <path d="M73 2c0-24 9-35 24-35S121-22 121 2Z" fill="#F28C28" />
        <path d="M68 2h59" stroke="#0B3B6F" strokeWidth="4" />
      </>
    ),
  };
  return (
    <g transform="translate(150 205)" data-location-motif={location}>
      <g className={location === 'mixer' && vehicle !== 'here' ? `motif-vehicle-${vehicle}` : undefined}>
        {motifs[location]}
      </g>
    </g>
  );
}
