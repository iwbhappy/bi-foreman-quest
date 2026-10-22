import { avatarUrl, portraitUrl } from '../../data/art';
import type { HeroSkin } from '../../lib/types';
type Props = { archetypeKey?: string; helmet?: HeroSkin['helmet']; src?: string; alt: string; eager?: boolean };
export function Portrait({ archetypeKey = 'universal', helmet = 'orange', src, alt, eager = false }: Props) {
  return <img className="portrait" src={src ?? portraitUrl(archetypeKey, helmet)} alt={alt}
    width="600" height="900" loading={eager ? 'eager' : 'lazy'} {...{ fetchpriority: eager ? 'high' : 'auto' }}
    decoding="async" data-art-helmet={helmet} />;
}
export function Avatar({ archetypeKey = 'universal', helmet = 'orange', src, alt, size = 40 }:
  Props & { size?: 32 | 40 | 64 | 120 }) {
  return <img className="art-avatar" src={src ?? avatarUrl(archetypeKey, helmet)} alt={alt}
    width={size} height={size} style={{ width: size, height: size }} loading="lazy" data-art-helmet={helmet} />;
}

