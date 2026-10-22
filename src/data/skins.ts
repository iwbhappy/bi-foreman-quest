import type { HeroSkin } from '../lib/types';
export const HELMETS = {
  orange: '#F28C28', white: '#ECEFF3', blue: '#1668B8',
  yellow: '#F2C230', red: '#D94A3A', green: '#2E9E5B',
} as const;
export const SKIN_OPTIONS = {
  helmet: ['orange', 'white', 'blue', 'yellow', 'red', 'green'],
  theme: ['bright', 'strict', 'calm', 'tech'],
} as const;
export const DEFAULT_SKIN: HeroSkin = { helmet: 'orange', theme: 'bright' };

