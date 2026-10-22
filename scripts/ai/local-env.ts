import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
export async function localEnv() {
  let env: Record<string, string> = {};
  try { env = parseEnv(await readFile(new URL('../../../.env', import.meta.url), 'utf8')) as Record<string, string>; }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw new Error('Cannot read local server env'); }
  return { key: process.env.OPENAI_API_KEY ?? env.GPT, model: process.env.OPENAI_MODEL ?? env.OPENAI_MODEL,
    dailyLimit: Number(process.env.AI_DAILY_LIMIT ?? env.AI_DAILY_LIMIT ?? 300) };
}
