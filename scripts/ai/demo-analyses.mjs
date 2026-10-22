import { createServer } from 'vite';
import { createServer as createHttpServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const onlyTwo = process.argv.includes('--live-two');
const transport = createHttpServer();
const server = await createServer({ optimizeDeps: { noDiscovery: true, entries: [] },
  server: { middlewareMode: true, hmr: { server: transport } }, appType: 'custom' });
await mkdir('artifacts/ai', { recursive: true });
try {
  const [{ handleAnalyze, createAiState, DEFAULT_MODEL }, { localEnv }, { buildDemoTeam, latestProfiles },
    { deriveProfile }, { questions }] = await Promise.all([
    server.ssrLoadModule('/server/analyze.ts'), server.ssrLoadModule('/scripts/ai/local-env.ts'),
    server.ssrLoadModule('/src/lib/team.ts'), server.ssrLoadModule('/src/lib/profiles.ts'),
    server.ssrLoadModule('/src/data/questions.ts'),
  ]);
  const environment = await localEnv();
  if (!environment.key) throw new Error('Local server key is not configured');
  const model = environment.model ?? DEFAULT_MODEL;
  const state = createAiState();
  const demos = latestProfiles(buildDemoTeam());
  const selected = onlyTwo ? [demos[0], demos[2]] : demos;
  const output = {};
  const summary = [];
  async function prepare(record, label = record.id) {
    const input = { answers: record.answers, position: record.participant.position,
      experience: record.participant.experience };
    const fingerprint = createHash('sha256').update(JSON.stringify({ input, model, promptVersion: '1' })).digest('hex');
    const artifact = `artifacts/ai/real-${label}.json`;
    let previous;
    try { previous = JSON.parse(await readFile(artifact, 'utf8')); } catch { /* First run. */ }
    if (previous?.fingerprint === fingerprint && previous.response?.analysis) {
      output[record.id] = previous.response;
      summary.push({ id: record.id, reused: true, elapsedMs: previous.elapsedMs, usage: previous.usage });
      console.log(`REUSE ${record.id}`);
      return;
    }
    let usage;
    const started = performance.now();
    const response = await handleAnalyze(input, { ...environment, model, state, ip: `local-demo:${record.id}`,
      log: (entry) => { if (entry.usage) usage = entry.usage; console.log(JSON.stringify(entry)); } });
    if (response.status !== 200) throw new Error(`Analysis failed: ${record.id}, HTTP ${response.status}`);
    const elapsedMs = Math.round(performance.now() - started);
    await writeFile(artifact, JSON.stringify({ fingerprint, response: response.body, elapsedMs, usage }, null, 2) + '\n');
    output[record.id] = response.body;
    summary.push({ id: record.id, elapsedMs, usage });
    console.log(`PASS ${record.id}: ${elapsedMs}ms`);
  }
  for (const record of selected) await prepare(record);
  if (!onlyTwo) {
    await writeFile('src/data/demoAnalyses.json', JSON.stringify(output, null, 2) + '\n');
    let situation = 0, likert = 0;
    const own = deriveProfile({ id: '20000000-0000-4000-8000-000000000001',
      methodologyVersion: '1.0', createdAt: '2026-10-20T06:00:00.000Z',
      participant: { name: 'Проверочный прогон', position: 'Мастер СМР', experience: '1–3 года' },
      answers: Object.fromEntries(questions.map((question) => [question.id, question.type === 'situation'
        ? 'CABDCABDCAB'[situation++] : [4, 2, 5, 1][likert++]])),
      durationSec: 210, perQuestionSec: Object.fromEntries(questions.map((question) => [question.id, 14])),
      mode: 'classic', skin: { helmet: 'orange', theme: 'bright' }, helmetColor: '#F28C28',
    });
    await writeFile('artifacts/ai/own-result.json', JSON.stringify(own, null, 2) + '\n');
    await prepare(own, 'own');
    const [{ handleTeamAnalyze }, { teamAnalysisInput }] = await Promise.all([
      server.ssrLoadModule('/server/team-analyze.ts'), server.ssrLoadModule('/src/lib/teamAi.ts'),
    ]);
    const input = teamAnalysisInput(demos);
    const fingerprint = createHash('sha256').update(JSON.stringify({ input, model, promptVersion: '1' })).digest('hex');
    let previous;
    try { previous = JSON.parse(await readFile('artifacts/ai/real-team.json', 'utf8')); } catch { /* First run. */ }
    let team;
    if (previous?.fingerprint === fingerprint && previous.response?.analysis) team = previous.response;
    else {
      let usage;
      const started = performance.now();
      const result = await handleTeamAnalyze(input, { ...environment, model, state, ip: 'local-demo:team',
        log: (entry) => { if (entry.usage) usage = entry.usage; console.log(JSON.stringify(entry)); } });
      if (result.status !== 200) throw new Error(`Team analysis failed: HTTP ${result.status}`);
      team = result.body;
      previous = { fingerprint, response: team, elapsedMs: Math.round(performance.now() - started), usage };
      await writeFile('artifacts/ai/real-team.json', JSON.stringify(previous, null, 2) + '\n');
    }
    summary.push({ id: 'team', elapsedMs: previous.elapsedMs, usage: previous.usage });
    await writeFile('src/data/demoTeamAnalysis.json', JSON.stringify(team, null, 2) + '\n');
  }
  await writeFile(`artifacts/ai/${onlyTwo ? 'live-two' : 'generation'}-summary.json`,
    JSON.stringify({ model, promptVersion: '1', entries: summary }, null, 2) + '\n');
} finally { await server.close(); }
