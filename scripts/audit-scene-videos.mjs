import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const cache = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const folder = readdirSync(cache)
  .filter((name) => name.startsWith('ffmpeg-'))
  .sort()
  .at(-1);
if (!folder) throw new Error('Playwright FFmpeg is missing');
const ffmpeg = join(cache, folder, 'ffmpeg-win64.exe');
const videos = [];
for (const [file, second] of [
  ['01-hero-and-decisions.webm', 25],
  ['02-report-reveal-profile.webm', 30],
]) {
  const path = join('artifacts/scene', file);
  const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', path], { encoding: 'utf8' });
  const duration = probe.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  assert(duration);
  assert(probe.stderr.includes('1440x900'));
  const durationSec = Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]);
  assert(durationSec >= 50 && durationSec < 75);
  const frame = path.replace('.webm', '-frame.png');
  const extract = spawnSync(
    ffmpeg,
    ['-hide_banner', '-loglevel', 'error', '-ss', String(second), '-i', path, '-frames:v', '1', '-y', frame],
    { encoding: 'utf8' },
  );
  assert.equal(extract.status, 0, extract.stderr);
  videos.push({ file, durationSec, width: 1440, height: 900, bytes: statSync(path).size, frame });
}
writeFileSync('artifacts/scene/video-audit.json', JSON.stringify(videos, null, 2));
process.stdout.write(JSON.stringify(videos, null, 2) + '\n');
