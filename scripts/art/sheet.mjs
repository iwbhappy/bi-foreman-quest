import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { appRoot, artRoot, loadManifest, rawPath } from './paths.mjs';

const { values } = parseArgs({ options: {
  sheet: { type: 'string', default: 'base' },
  background: { type: 'string', default: 'both' },
  source: { type: 'string', default: 'processed' },
} });
const manifest = await loadManifest();
const sheet = values.sheet;
if (!['base', 'archetypes', 'npc', 'avatars', 'all'].includes(sheet)) throw new Error('Unknown sheet');
if (!['checker', 'dark', 'both'].includes(values.background)) throw new Error('Unknown background');
if (!['raw', 'processed'].includes(values.source)) throw new Error('Unknown source');
let entries;
if (sheet === 'base') entries = manifest.images.filter((entry) => entry.stage === 'base');
else if (sheet === 'archetypes') {
  entries = manifest.images.filter((entry) => entry.type === 'archetype').sort((a, b) =>
    a.archetypeKey.localeCompare(b.archetypeKey)
    || manifest.helmets.findIndex((color) => color.id === a.helmet)
    - manifest.helmets.findIndex((color) => color.id === b.helmet));
} else if (sheet === 'npc') entries = manifest.images.filter((entry) => entry.type === 'npc');
else entries = manifest.images;

const columns = sheet === 'npc' ? 5 : 6;
const cellWidth = 250;
const cellHeight = sheet === 'avatars' ? 310 : 410;
const imageWidth = cellWidth - 24;
const imageHeight = cellHeight - 62;
const width = columns * cellWidth;
const height = Math.ceil(entries.length / columns) * cellHeight + 56;
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const backgrounds = values.background === 'both' ? ['checker', 'dark'] : [values.background];
await mkdir(path.join(artRoot, 'review'), { recursive: true });
for (const background of backgrounds) {
  const dark = background === 'dark';
  const composites = [];
  const header = `<svg width="${width}" height="56"><rect width="100%" height="100%" fill="#0B3B6F"/>
    <text x="20" y="35" fill="white" font-family="Arial" font-size="21" font-weight="bold">
    BI ACADEMY / ${sheet.toUpperCase()} / ${entries.length} IMAGES / ${values.source.toUpperCase()}</text></svg>`;
  composites.push({ input: Buffer.from(header), left: 0, top: 0 });
  for (const [index, entry] of entries.entries()) {
    let file;
    if (sheet === 'base') {
      file = values.source === 'raw' ? rawPath(entry) : path.join(artRoot, 'processed', `${entry.id}.png`);
    } else file = path.join(appRoot, sheet === 'avatars' ? entry.path.replace('.webp', '-avatar.webp') : entry.path);
    await stat(file); // Missing images must fail the sheet rather than disappear from it.
    const left = (index % columns) * cellWidth;
    const top = Math.floor(index / columns) * cellHeight + 56;
    if (!dark) {
      const squares = [];
      for (let y = 0; y < imageHeight; y += 12) {
        for (let x = 0; x < imageWidth; x += 12) {
          if ((x / 12 + y / 12) % 2 === 0) {
            squares.push(`<rect x="${x}" y="${y}" width="12" height="12" fill="#E8EDF2"/>`);
          }
        }
      }
      const checker = Buffer.from(`<svg width="${imageWidth}" height="${imageHeight}">
        <rect width="100%" height="100%" fill="#F7F9FB"/>${squares.join('')}</svg>`);
      composites.push({ input: checker, left: left + 12, top: top + 12 });
    }
    let pipeline = sharp(file).trim({ threshold: 10 });
    if (sheet === 'avatars') {
      pipeline = pipeline.resize(imageWidth, imageWidth, { fit: 'contain', background: '#00000000' })
        .ensureAlpha().composite([{ input: Buffer.from(
          `<svg width="${imageWidth}" height="${imageWidth}"><circle cx="${imageWidth / 2}" cy="${imageWidth / 2}"
          r="${imageWidth / 2}" fill="white"/></svg>`), blend: 'dest-in' }]);
    } else pipeline = pipeline.resize(imageWidth, imageHeight, { fit: 'inside' });
    const { data, info } = await pipeline.png().toBuffer({ resolveWithObject: true });
    composites.push({ input: data, left: left + Math.round((cellWidth - info.width) / 2),
      top: top + 12 + imageHeight - info.height });
    const label = Buffer.from(`<svg width="${cellWidth}" height="42">
      <text x="${cellWidth / 2}" y="20" text-anchor="middle" fill="${dark ? '#FFFFFF' : '#0B3B6F'}"
        font-family="Arial" font-size="12" font-weight="bold">${escape(entry.id)}</text></svg>`);
    composites.push({ input: label, left, top: top + cellHeight - 40 });
  }
  const suffix = (values.source === 'raw' ? '-raw' : '') + (dark ? '-dark' : '');
  const output = path.join(artRoot, 'review', `${sheet}${suffix}.png`);
  await sharp({ create: { width, height, channels: 4, background: dark ? '#142036' : '#FFFFFF' } })
    .composite(composites).png().toFile(output);
  console.log(`Saved ${output}`);
}
