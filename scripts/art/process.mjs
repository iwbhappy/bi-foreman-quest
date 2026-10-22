import sharp from 'sharp';
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { appRoot, artRoot, loadManifest, rawPath } from './paths.mjs';
import { alphaBounds, postprocess } from './pixels.mjs';

const sources = await Promise.all(['./process.mjs', './pixels.mjs'].map((file) =>
  readFile(new URL(file, import.meta.url), 'utf8')));
const pipelineVersion = createHash('sha256').update(sources.join('\n')).digest('hex');

export async function processImage(entry) {
  const source = await readFile(rawPath(entry));
  const sourceHash = createHash('sha256').update(source).digest('hex');
  const cachePath = path.join(artRoot, 'processed', `${entry.id}.process.json`);
  try {
    const cache = JSON.parse(await readFile(cachePath, 'utf8'));
    if (cache.sourceHash === sourceHash && cache.pipelineVersion === pipelineVersion) {
      await Promise.all([path.join(artRoot, 'processed', `${entry.id}.png`),
        path.join(appRoot, entry.path), path.join(appRoot, entry.path.replace(/\.webp$/, '-avatar.webp'))].map(stat));
      return { ...cache.result, cached: true };
    }
  } catch { /* A missing or stale cache requires the complete processing and checks below. */ }
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Work on the original canvas to match the reference exactly; trim after cleaning.
  const metrics = postprocess(data, info.width, info.height, entry.id.startsWith('mystery-'));
  const raw = { width: info.width, height: info.height, channels: 4 };
  const processed = path.join(artRoot, 'processed', `${entry.id}.png`);
  await mkdir(path.dirname(processed), { recursive: true });
  const box = alphaBounds(data, info.width, info.height);
  const cropped = await sharp(data, { raw }).extract(box).png().toBuffer();
  await writeFile(processed, cropped);
  const portrait = path.join(appRoot, entry.path);
  const avatar = portrait.replace(/\.webp$/, '-avatar.webp');
  await mkdir(path.dirname(portrait), { recursive: true });
  await sharp(cropped).resize(600, 900, {
    fit: 'contain', position: 'south', background: '#00000000',
  }).webp({ quality: 86, effort: 6 }).toFile(portrait);
  let head = sharp(cropped);
  if (box.height < box.width) {
    head = head.extend({ bottom: box.width - box.height, background: '#00000000' });
  }
  const square = await head.png().toBuffer();
  await sharp(square).extract({ left: 0, top: 0, width: box.width, height: box.width })
    .resize(256, 256).webp({ quality: 86, effort: 6 }).toFile(avatar);
  const result = { id: entry.id, ...metrics, processed: `art/processed/${entry.id}.png`,
    portrait: entry.path, avatar: entry.path.replace(/\.webp$/, '-avatar.webp') };
  await writeFile(cachePath, JSON.stringify({ sourceHash, pipelineVersion, result }, null, 2) + '\n');
  return result;
}

async function main() {
  const { values } = parseArgs({ options: {
    stage: { type: 'string', default: 'base' }, only: { type: 'string' },
  } });
  if (values.stage !== 'base') throw new Error('Process bases only; local recolors must not be postprocessed again');
  const manifest = await loadManifest();
  let entries = manifest.images.filter((entry) => values.stage === 'all' || entry.stage === values.stage);
  if (values.only) {
    const ids = values.only.split(',');
    if (ids.some((id) => !entries.some((entry) => entry.id === id))) throw new Error('Unknown --only ID');
    entries = entries.filter((entry) => ids.includes(entry.id));
  }
  const results = [];
  // Three independent encodes keep the stronger WebP compression practical on local CPUs.
  const queue = [...entries];
  await Promise.all(Array.from({ length: Math.min(3, queue.length) }, async () => {
    while (queue.length) {
      const entry = queue.shift();
      const result = await processImage(entry);
      results.push(result);
      console.log(`${result.helmetPass ? 'PASS' : 'FAIL'} ${entry.id}: helmet ${(result.helmetAfter * 100).toFixed(3)}%`
        + `; shadow removed ${result.shadowPixelsRemoved}; badge filled ${result.badgePixelsFilled}`);
    }
  }));
  results.sort((a, b) => entries.findIndex((entry) => entry.id === a.id)
    - entries.findIndex((entry) => entry.id === b.id));
  const regenerate = results.filter((entry) => !entry.helmetPass || entry.groundSuspected).map((entry) => entry.id);
  await mkdir(path.join(artRoot, 'review'), { recursive: true });
  const output = path.join(artRoot, 'review', `process-${values.stage}${values.only ? '-subset' : ''}.json`);
  await writeFile(output, JSON.stringify({ results, regenerate }, null, 2) + '\n');
  console.log(`Regenerate: ${regenerate.join(', ') || 'none'}`);
  if (regenerate.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
