import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
const stage = process.argv[2] || 'final';
mkdirSync('artifacts', { recursive: true });
for (const name of ['test', 'build', ...(stage === 'final' ? ['lint'] : [])]) {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', name], { encoding: 'utf8', shell: process.platform === 'win32' });
  const output = (result.stdout || '') + (result.stderr || '');
  writeFileSync(`artifacts/${stage}-${name}.txt`, output);
  process.stdout.write(output);
  if (result.status !== 0) process.exit(result.status || 1);
}
