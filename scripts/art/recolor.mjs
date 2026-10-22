// Локальная детерминированная перекраска касок без сети и ключей: маска каски → смена оттенка со светотенью.
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { artRoot, loadManifest } from './paths.mjs';
import { helmetMask, recolor, TARGETS, validateColor } from './local-color.mjs';
import { encodeArt } from './encode.mjs';
const manifest = await loadManifest();
const queue = manifest.images.filter((entry) => entry.stage === 'base' && entry.type !== 'npc');
await mkdir(path.join(artRoot, 'local'), { recursive: true });
const results = [];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) {
    const base = queue.shift();
    const input = await readFile(path.join(artRoot, 'processed', `${base.id}.png`));
    const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const selection = helmetMask(data, info.width, info.height, base.helmet);
    for (const color of Object.keys(TARGETS)) {
      const id = base.type === 'mystery' ? `mystery-${color}` : `${base.archetypeKey}-${color}`;
      const entry = manifest.images.find((item) => item.type === base.type && item.helmet === color
        && (base.type === 'mystery' || item.archetypeKey === base.archetypeKey));
      const output = recolor(data, color, selection);
      const check = validateColor(data, output, info.width, info.height, selection);
      if (!check.pass) throw new Error(`Local color invariants failed: ${id}`);
      const png = await sharp(output, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png().toBuffer();
      await writeFile(path.join(artRoot, 'local', `${id}.png`), png);
      await encodeArt(png, entry.path);
      results.push({ id, profile: base.helmet, ...check });
      console.log(`PASS ${id}: alpha identical, outside mask unchanged, mask ${(check.maskShare * 100).toFixed(2)}%`);
    }
  }
}));
await writeFile(path.join(artRoot, 'review', 'local-validation.json'), JSON.stringify(results, null, 2) + '\n');
console.log(`Local recoloring completed: ${results.length} images; 0 API requests.`);
