import { describe, expect, it } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { ART_ARCHETYPES, ART_NPCS, avatarUrl, mysteryAvatarUrl, mysteryUrl,
  npcAvatarUrl, npcUrl, portraitUrl } from '../data/art';
import { SKIN_OPTIONS } from '../data/skins';

describe('complete illustration library', () => {
  it('has all 94 portraits and their avatars under BASE_URL, within the 12 MB budget', () => {
    const urls: string[] = [];
    expect(ART_ARCHETYPES).toHaveLength(13);
    for (const key of ART_ARCHETYPES) for (const helmet of SKIN_OPTIONS.helmet) {
      urls.push(portraitUrl(key, helmet), avatarUrl(key, helmet));
    }
    for (const helmet of SKIN_OPTIONS.helmet) urls.push(mysteryUrl(helmet), mysteryAvatarUrl(helmet));
    for (const id of ART_NPCS) urls.push(npcUrl(id), npcAvatarUrl(id));
    expect(urls).toHaveLength(188);
    expect(new Set(urls).size).toBe(188);
    let totalBytes = 0;
    for (const url of urls) {
      expect(url.startsWith(import.meta.env.BASE_URL)).toBe(true);
      const file = path.resolve('public', url.slice(import.meta.env.BASE_URL.length));
      expect(existsSync(file), `Missing illustration: ${url}`).toBe(true);
      totalBytes += statSync(file).size;
    }
    expect(totalBytes).toBeLessThanOrEqual(12 * 1024 * 1024);
  });
  it('falls back to the universal profile and rejects mixing location IDs with NPCs', () => {
    expect(portraitUrl('unknown', 'blue')).toBe(portraitUrl('universal', 'blue'));
    expect(() => npcUrl('ptoOffice')).toThrow(RangeError);
  });
});
