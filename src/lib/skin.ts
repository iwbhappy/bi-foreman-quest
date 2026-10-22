import { DEFAULT_SKIN, HELMETS, SKIN_OPTIONS } from '../data/skins';
import type { HeroSkin } from './types';
export function validSkin(value: unknown): value is HeroSkin {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const skin = value as Record<string, unknown>;
  return Object.entries(SKIN_OPTIONS).every(([key, values]) =>
    (values as readonly unknown[]).includes(skin[key]));
}
export function resolveSkin(value?: unknown, helmetColor?: string): HeroSkin {
  if (validSkin(value)) return { helmet: value.helmet, theme: value.theme };
  const helmet = (Object.keys(HELMETS) as HeroSkin['helmet'][]).find((key) => HELMETS[key] === helmetColor);
  return { ...DEFAULT_SKIN, helmet: helmetColor === '#FFFFFF' ? 'white' : helmet ?? DEFAULT_SKIN.helmet };
}
export function randomSkin(random = Math.random): HeroSkin {
  const pick = <T,>(values: readonly T[]) =>
    values[Math.min(values.length - 1, Math.max(0, Math.floor(random() * values.length)))];
  return { helmet: pick(SKIN_OPTIONS.helmet), theme: pick(SKIN_OPTIONS.theme) };
}

