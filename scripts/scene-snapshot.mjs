import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
const label = process.argv[2] || 'after';
mkdirSync('artifacts/scene', { recursive: true });
const files = readdirSync('dist/assets')
  .filter((name) => name.endsWith('.js'))
  .map((name) => {
    const data = readFileSync('dist/assets/' + name);
    return { name, bytes: data.length, gzip: gzipSync(data).length };
  });
const protectedFiles = [
  'src/lib/scoring.ts',
  'src/data/questions.ts',
  'src/lib/analysis.ts',
  'src/lib/recommend.ts',
  'src/data/quest.ts',
];
const hashes = Object.fromEntries(
  protectedFiles.map((path) => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]),
);
const result = { files, totalGzip: files.reduce((n, file) => n + file.gzip, 0), hashes };
writeFileSync(`artifacts/scene/bundle-${label}.json`, JSON.stringify(result, null, 2));
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
