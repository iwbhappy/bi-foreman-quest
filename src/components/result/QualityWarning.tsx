import { ru } from '../../i18n/ru';
import type { QualityFlag } from '../../lib/types';
export function QualityWarning({ flags }: { flags: QualityFlag[] }) {
  if (!flags.length) return null;
  return (
    <aside className="quality-warning" role="status">
      <p>{ru.warning(flags)}</p>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        {flags.map((flag) => (
          <li key={flag}>• {ru.flags[flag]}</li>
        ))}
      </ul>
    </aside>
  );
}
