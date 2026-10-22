import { readdir, readFile, stat, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import path from 'node:path';
const destination = path.resolve('artifacts/ai/clean-checkout');
const files = [], findings = [];
const excluded = (name) => ['node_modules', 'dist', 'artifacts', '.git', '.vercel'].includes(name)
  || name.startsWith('.env') || /^REPORT.*\.md$/u.test(name) || /\.(?:log|tsbuildinfo)$/u.test(name);
let key = process.env.OPENAI_API_KEY;
try { key ??= parseEnv(await readFile(new URL('../../../.env', import.meta.url), 'utf8')).GPT; } catch { /* CI. */ }
async function collect(directory = '') {
  for (const entry of await readdir(directory || '.', { withFileTypes: true })) {
    if (excluded(entry.name)) continue;
    const file = directory ? `${directory}/${entry.name}` : entry.name;
    if (entry.isDirectory()) { await collect(file); continue; }
    const data = await readFile(file);
    files.push({ file, bytes: (await stat(file)).size });
    if (/\.(?:tsx?|mjs|py|json|html|css|md|ya?ml)$/u.test(file)) {
      const text = data.toString('utf8');
      if ((key && text.includes(key)) || /sk-(?:proj-)?[A-Za-z0-9_-]{16,}/u.test(text)) {
        throw new Error('Secret found in proposed repository files; no secret value was printed.');
      }
      text.split('\n').forEach((line, index) => {
        if (/C:[\\/](?:PROJECTS|Users)[\\/]/u.test(line)) findings.push({ file, line: index + 1, kind: 'absolute-path' });
        if (/[\w.+-]+@(?:gmail|outlook|hotmail|mail)\./iu.test(line)) findings.push({ file, line: index + 1, kind: 'email' });
      });
    }
    await mkdir(path.dirname(path.join(destination, file)), { recursive: true });
    await copyFile(file, path.join(destination, file));
  }
}
await collect();
const groups = {};
for (const item of files) {
  const folder = item.file.includes('/') ? item.file.split('/')[0] : '(root)';
  groups[folder] ??= { files: 0, bytes: 0 };
  groups[folder].files++; groups[folder].bytes += item.bytes;
}
await writeFile('artifacts/ai/repository-inventory.json', JSON.stringify({ files, groups, findings,
  totalBytes: files.reduce((sum, item) => sum + item.bytes, 0), secretFound: false }, null, 2) + '\n');
console.log(`Prepared clean app-only checkout: ${files.length} files; no credentials. Path/email references: ${findings.length}.`);
