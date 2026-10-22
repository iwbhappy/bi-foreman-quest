import { ru } from '../../i18n/ru';
import { mysteryUrl, portraitUrl } from '../../data/art';
import { resolveSkin } from '../../lib/skin';
import type { HeroSkin } from '../../lib/types';
export function HeroSilhouette({ helmetColor, skin: chosen, archetypeKey, label, gesture, bare = false }:
  { helmetColor?: string; skin?: HeroSkin; archetypeKey?: string; label?: string;
    gesture?: boolean; bare?: boolean }) {
  const skin = resolveSkin(chosen, helmetColor);
  return <svg width="240" height="340" viewBox="0 0 240 340" className="hero-silhouette" role="img"
    aria-label={label ?? ru.quest.silhouette} data-skin={JSON.stringify(skin)}
    data-art-helmet={skin.helmet} data-helmet-color={helmetColor}>
    {!bare && <circle cx="120" cy="160" r="108" fill="currentColor" opacity=".04" />}
    <image key={`${skin.helmet}-${archetypeKey ?? 'mystery'}`}
      className={gesture ? 'hero-image hero-hop' : 'hero-image'} x="0" y="0" width="240" height="340"
      href={archetypeKey ? portraitUrl(archetypeKey, skin.helmet) : mysteryUrl(skin.helmet)}
      preserveAspectRatio="xMidYMax meet" />
  </svg>;
}

