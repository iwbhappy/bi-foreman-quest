import { traits } from '../../data/traits';
import { ru } from '../../i18n/ru';
import type { TraitId } from '../../lib/types';

export function TraitColumnHeading({ trait }: { trait: TraitId }) {
  return (
    <>
      <span className="trait-column-full">{traits[trait].name}</span>
      <abbr className="trait-column-short" title={traits[trait].name}>
        {ru.dashboard.shortTraits[trait]}
      </abbr>
    </>
  );
}
