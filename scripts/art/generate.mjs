import { readFile, writeFile, mkdir, stat, rename } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import path from 'node:path';
import { artRoot, projectRoot, loadManifest, rawPath } from './paths.mjs';

function options(args) {
  const result = { stage: 'base', concurrency: 3, only: null, force: false, dryRun: false };
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (flag === '--force') result.force = true;
    else if (flag === '--dry-run') result.dryRun = true;
    else if (['--stage', '--only', '--concurrency'].includes(flag)) {
      const value = args[++index];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
      if (flag === '--stage') result.stage = value;
      if (flag === '--only') result.only = value.split(',');
      if (flag === '--concurrency') result.concurrency = Number(value);
    } else throw new Error(`Unknown option: ${flag}`);
  }
  if (!['base', 'recolor'].includes(result.stage)) throw new Error('Stage must be base or recolor');
  if (!Number.isInteger(result.concurrency) || result.concurrency < 1 || result.concurrency > 10) {
    throw new Error('Concurrency must be an integer between 1 and 10');
  }
  return result;
}

async function exists(file) {
  try { return (await stat(file)).size > 0; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

async function loadKey() {
  if (process.env.OPENAI_API_KEY?.trim()) return process.env.OPENAI_API_KEY.trim();
  try {
    const env = parseEnv(await readFile(path.join(projectRoot, '.env'), 'utf8'));
    if (env.GPT?.trim()) return env.GPT.trim();
  } catch (error) {
    if (error.code !== 'ENOENT') throw new Error('Cannot read the server-side key file');
  }
  throw new Error('Set GPT in the project-root .env or OPENAI_API_KEY in the environment');
}

async function main() {
  const config = options(process.argv.slice(2));
  if (config.stage === 'recolor') throw new Error('API recoloring disabled by specification 3.10');
  const manifest = await loadManifest();
  const selected = manifest.images.filter((entry) => entry.stage === config.stage);
  if (config.only?.some((id) => !selected.some((entry) => entry.id === id))) {
    throw new Error('One or more --only IDs do not belong to the selected stage');
  }
  const queue = [];
  for (const entry of selected.filter((item) => !config.only || config.only.includes(item.id))) {
    const skip = !config.force && await exists(rawPath(entry));
    console.log(`${skip ? 'SKIP' : 'PLAN'} ${entry.id} -> ${entry.rawPath}`);
    if (!skip) queue.push(entry);
  }
  const estimate = queue.length * manifest.estimatedUsdPerImage;
  const total = queue.length;
  console.log(`${queue.length} requests; estimated $${estimate.toFixed(3)} (spec estimate, not billing)`);
  if (config.dryRun || queue.length === 0) return;

  const key = await loadKey();
  await mkdir(path.join(artRoot, 'raw'), { recursive: true });
  const logPath = path.join(artRoot, 'generation-log.json');
  let log;
  try { log = JSON.parse(await readFile(logPath, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    log = { model: manifest.api.model, requests: [], totalUsage: {} };
  }
  let saving = Promise.resolve();
  function record(event) {
    log.requests.push(event);
    for (const [field, value] of Object.entries(event.usage ?? {})) {
      if (typeof value === 'number') log.totalUsage[field] = (log.totalUsage[field] ?? 0) + value;
    }
    const snapshot = JSON.stringify(log, null, 2) + '\n';
    saving = saving.then(async () => {
      const temporary = `${logPath}.tmp`;
      await writeFile(temporary, snapshot);
      await rename(temporary, logPath);
    });
    return saving;
  }
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let completed = 0;
  let failed = 0;
  async function generate(entry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const started = Date.now();
      console.log(`START ${entry.id} attempt ${attempt}`);
      try {
        const form = new FormData();
        for (const [field, value] of Object.entries(manifest.api)) form.set(field, String(value));
        form.set('prompt', entry.promptParts.join(' '));
        const input = entry.stage === 'recolor'
          ? path.join(artRoot, 'processed', `${entry.base}.png`)
          : path.join(projectRoot, manifest.reference);
        const inputBytes = await readFile(input);
        form.append('image[]', new Blob([inputBytes], { type: 'image/png' }), path.basename(input));
        if (entry.stage === 'recolor') form.set('input_fidelity', 'high');
        const response = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}` },
          body: form,
          signal: AbortSignal.timeout(600_000),
        });
        const time = new Date().toISOString();
        if (!response.ok) {
          // Never log response bodies, request objects, headers or credentials.
          await response.body?.cancel();
          await record({ id: entry.id, time, attempt, status: 'http-error', httpStatus: response.status });
          if ((response.status === 429 || response.status >= 500) && attempt < 3) {
            console.log(`RETRY ${entry.id} HTTP ${response.status}`);
            await sleep(2000 * 2 ** (attempt - 1));
            continue;
          }
          console.log(`FAILED ${entry.id} HTTP ${response.status}`);
          failed++;
          return;
        }
        const result = await response.json();
        const encoded = result.data?.[0]?.b64_json;
        if (typeof encoded !== 'string') throw new Error('Missing image data');
        const bytes = Buffer.from(encoded, 'base64');
        if (bytes.length < 8 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
          throw new Error('Invalid PNG data');
        }
        const output = rawPath(entry);
        await writeFile(`${output}.tmp`, bytes);
        await rename(`${output}.tmp`, output);
        await record({ id: entry.id, time, attempt, status: 'success',
          elapsedMs: Date.now() - started, bytes: bytes.length, usage: result.usage ?? null });
        console.log(`OK ${++completed}/${total} ${entry.id}`);
        return;
      } catch {
        // Fixed diagnostic text prevents accidental secret leakage from underlying errors.
        await record({ id: entry.id, time: new Date().toISOString(), attempt, status: 'transport-or-file-error' });
        console.log(`FAILED ${entry.id}: transport, response or file error; inspect status log`);
        failed++;
        return;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(config.concurrency, queue.length) }, async () => {
    while (queue.length) await generate(queue.shift());
  }));
  await saving;
  console.log(`Finished: ${completed} saved, ${failed} failed. Usage: ${JSON.stringify(log.totalUsage)}`);
  if (failed) process.exitCode = 1;
}

main().catch(() => {
  console.error('Art generation stopped. Check arguments, manifest, key availability and local file permissions.');
  process.exitCode = 1;
});
