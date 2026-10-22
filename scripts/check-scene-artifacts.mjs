import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const report = readFileSync('REPORT_SCENE.md', 'utf8');
const links = [...report.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);
for (const link of links) {
  assert(existsSync(resolve(link)), link);
  assert(statSync(resolve(link)).size > 0, link);
}
const pictures = ['create-skin-1', 'create-skin-2', 'scene-before', 'scene-event', 'scene-after', 'echo',
  'violation-q05', 'mentor', 'reveal', 'profile-main', 'manager-main-change', 'theme-bright', 'theme-strict', 'theme-calm', 'theme-tech'];
for (const picture of pictures) for (const width of [1440, 390]) assert(existsSync(`artifacts/scene/${picture}-${width}.png`));
const before = JSON.parse(readFileSync('artifacts/scene/bundle-before.json', 'utf8'));
const after = JSON.parse(readFileSync('artifacts/scene/bundle-after.json', 'utf8'));
assert.deepEqual(before.hashes, after.hashes);
process.stdout.write(`PASS ${links.length} report links, 30 required screenshots, unchanged core/content SHA-256\n`);
