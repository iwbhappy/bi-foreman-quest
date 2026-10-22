import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { traits } from '../data/traits';
import { TRAIT_ORDER, type Percents } from '../lib/types';
import { ru } from '../i18n/ru';
function AxisLabel({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number | string;
  y?: number | string;
  payload?: { value: string };
}) {
  const words = (payload?.value ?? '').split(' ');
  const lines = words.length > 1 ? [words[0], words.slice(1).join(' ')] : words;
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#0B3B6F" fontSize={13}>
        {lines.map((line, i) => (
          <tspan x="0" dy={i === 0 ? (lines.length > 1 ? -2 : 4) : 12} key={line}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}
export function ProfileRadar({ percents, compact = false }: { percents: Percents; compact?: boolean }) {
  const data = TRAIT_ORDER.map((id) => ({ name: traits[id].name, value: percents[id] }));
  return (
    <div
      className="radar-container"
      role="img"
      aria-label={`${ru.profile}: ${data.map((d) => `${d.name} ${d.value}%`).join(', ')}`}
    >
      <RadarChart
        data={data}
        width={compact ? 240 : 360}
        height={compact ? 210 : 260}
        outerRadius={compact ? '55%' : '75%'}
        margin={{ top: 20, bottom: 20, left: 24, right: 24 }}
      >
        <PolarGrid stroke="#C5CEDA" />
        <PolarAngleAxis dataKey="name" tick={<AxisLabel />} tickLine={false} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} tickCount={5} />
        <Radar
          dataKey="value"
          stroke="#1668B8"
          strokeWidth={2}
          fill="#1668B8"
          fillOpacity={0.15}
          isAnimationActive={false}
        />
      </RadarChart>
    </div>
  );
}
