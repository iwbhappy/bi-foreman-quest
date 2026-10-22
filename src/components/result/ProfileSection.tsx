import { ru } from '../../i18n/ru';
import { TRAIT_ORDER, type Percents } from '../../lib/types';
import { TraitBar } from '../TraitBar';
import { SectionTitle } from '../ui/Titles';
export function ProfileSection({ percents }: { percents: Percents }) {
  return <section className="profile-section"><SectionTitle>{ru.qualities}</SectionTitle>
    <div className="profile-metrics"><div className="profile-bars">{TRAIT_ORDER.map((trait) =>
      <TraitBar key={trait} trait={trait} value={percents[trait]} />)}</div></div></section>;
}

