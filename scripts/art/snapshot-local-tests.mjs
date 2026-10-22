// Freeze already validated bases/outputs so a private app-only checkout can run the same tests offline.
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { artRoot, loadManifest } from './paths.mjs';
const manifest = await loadManifest();
const directory = 'src/tests/fixtures/art-bases';
await mkdir(directory, { recursive: true });
const hashes = { pixels: {}, public: {} };
for (const base of manifest.images.filter((entry) => entry.stage === 'base' && entry.type !== 'npc')) {
  await copyFile(path.join(artRoot, 'processed', `${base.id}.png`), path.join(directory, `${base.id}.png`));
  for (const color of manifest.helmets) {
    const id = `${base.type === 'mystery' ? 'mystery' : base.archetypeKey}-${color.id}`;
    const pixels = await sharp(path.join(artRoot, 'local', `${id}.png`)).ensureAlpha().raw().toBuffer();
    hashes.pixels[id] = createHash('sha256').update(pixels).digest('hex');
  }
}
for (const entry of manifest.images) for (const file of [entry.path, entry.path.replace('.webp', '-avatar.webp')]) {
  hashes.public[file] = createHash('sha256').update(await readFile(file)).digest('hex');
}
await writeFile('src/tests/fixtures/art-hashes.json', JSON.stringify(hashes, null, 2) + '\n');
console.log('Frozen 14 processed bases, 84 RGBA digests and 188 public-file digests.');
