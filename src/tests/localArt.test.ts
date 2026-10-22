import { describe, it, expect } from 'vitest';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { helmetMask, recolor, TARGETS, validateColor } from '../../scripts/art/local-color.mjs';
import hashes from './fixtures/art-hashes.json';
const root = fileURLToPath(new URL('../../../art/', import.meta.url));
describe('local recoloring acceptance invariants', () => {
  it('keeps every alpha byte and every pixel outside the top helmet mask unchanged for all 84 variants', async () => {
    const manifest = JSON.parse(await readFile('scripts/art/manifest.json', 'utf8'));
    const results = [];
    for (const base of manifest.images.filter((entry: { stage: string; type: string }) =>
      entry.stage === 'base' && entry.type !== 'npc')) {
      const { data, info } = await sharp(path.join('src/tests/fixtures/art-bases', base.id + '.png'))
        .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const selection = helmetMask(data, info.width, info.height, base.helmet);
      for (const color of Object.keys(TARGETS)) {
        const id = (base.type === 'mystery' ? 'mystery' : base.archetypeKey) + '-' + color;
        const output = recolor(data, color, selection);
        const expected = (hashes.pixels as Record<string, string>)[id];
        expect(createHash('sha256').update(output).digest('hex'), id).toBe(expected);
        const localFile = path.join(root, 'local', id + '.png');
        if (existsSync(localFile)) {
          const actual = await sharp(localFile).ensureAlpha().raw().toBuffer();
          expect(createHash('sha256').update(actual).digest('hex'), id + ' generated PNG').toBe(expected);
        }
        expect(output.length).toBe(data.length);
        const check = validateColor(data, output, info.width, info.height, selection);
        expect(check.alphaDifferences, id).toBe(0);
        expect(check.outsideDifferences, id).toBe(0);
        expect(check.maskShare, id).toBeGreaterThanOrEqual(.1);
        expect(check.maskShare, id).toBeLessThanOrEqual(.35);
        expect(check.maskBottomShare, id).toBeLessThanOrEqual(.45);
        results.push({ id, profile: base.helmet, ...check });
      }
    }
    expect(results).toHaveLength(84);
    if (existsSync(path.join(root, 'review'))) {
      await writeFile(path.join(root, 'review', 'local-validation.json'), JSON.stringify(results, null, 2) + '\n');
    }
    for (const [file, hash] of Object.entries(hashes.public)) {
      expect(createHash('sha256').update(await readFile(file)).digest('hex'), file).toBe(hash);
    }
  }, 120_000);
});
