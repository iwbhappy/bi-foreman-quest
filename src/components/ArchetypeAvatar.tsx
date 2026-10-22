import type { ResultRecord } from '../lib/types';
import { resolveSkin } from '../lib/skin';
import { Avatar } from './ui/Art';
type Props = Pick<ResultRecord, 'archetype' | 'helmetColor' | 'skin'> & { className?: string; size?: 40 | 120 };
export function ArchetypeAvatar({ archetype, helmetColor, skin, className = '', size = 40 }: Props) {
  const chosen = resolveSkin(skin, helmetColor);
  return <div className={'archetype-avatar ' + className} data-helmet-color={helmetColor} data-skin={JSON.stringify(chosen)}>
    <Avatar archetypeKey={archetype.key} helmet={chosen.helmet} alt={archetype.name} size={size} />
  </div>;
}

