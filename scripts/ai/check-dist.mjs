import { readdir, readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';

export async function checkDist(key) {
  const files = [];
  async function visit(directory) {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      const file = `${directory}/${item.name}`;
      if (item.isDirectory()) await visit(file);
      else if (/\.(js|css|html|json|map)$/u.test(file)) files.push(file);
    }
  }
  await visit('dist');
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    if (text.includes('sk-') || (key && text.includes(key))) throw new Error('Secret marker found in built output');
    if (text.includes('Bearer ') || text.includes('OPENAI_API_KEY') || text.includes('Ты — методист BI Academy')) {
      throw new Error('Server implementation found in browser output');
    }
  }
  console.log(`PASS dist security: ${files.length} text files; no key, sk- marker, server prompt or credentials.`);
}
let key = process.env.OPENAI_API_KEY;
try { key ??= parseEnv(await readFile(new URL('../../../.env', import.meta.url), 'utf8')).GPT; }
catch { /* CI has no key file. The marker checks still run. */ }
await checkDist(key);
