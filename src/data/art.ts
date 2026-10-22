import type { HeroSkin } from '../lib/types';

export const ART_ARCHETYPES = [
  'critical-confidence', 'critical-discipline', 'critical-engagement',
  'confidence-critical', 'confidence-discipline', 'confidence-engagement',
  'discipline-critical', 'discipline-confidence', 'discipline-engagement',
  'engagement-critical', 'engagement-confidence', 'engagement-discipline', 'universal',
] as const;
export const ART_NPCS = ['boss', 'foreman', 'surveyor', 'storekeeper', 'electric',
  'finisher', 'pm', 'pto', 'mentor', 'installer'] as const;

const root = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/art/`;
const archetype = (key: string) => (ART_ARCHETYPES as readonly string[]).includes(key) ? key : 'universal';
export const portraitUrl = (key: string, helmet: HeroSkin['helmet']) =>
  `${root}archetypes/${archetype(key)}/${helmet}.webp`;
export const avatarUrl = (key: string, helmet: HeroSkin['helmet']) =>
  `${root}archetypes/${archetype(key)}/${helmet}-avatar.webp`;
export const mysteryUrl = (helmet: HeroSkin['helmet']) => `${root}hero/mystery-${helmet}.webp`;
export const mysteryAvatarUrl = (helmet: HeroSkin['helmet']) => `${root}hero/mystery-${helmet}-avatar.webp`;
function npc(id: string) {
  if (!(ART_NPCS as readonly string[]).includes(id)) throw new RangeError('Unknown NPC portrait');
  return id;
}
export const npcUrl = (id: string) => `${root}npc/${npc(id)}.webp`;
export const npcAvatarUrl = (id: string) => `${root}npc/${npc(id)}-avatar.webp`;
