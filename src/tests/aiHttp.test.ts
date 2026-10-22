import { expect, it } from 'vitest';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { handleAnalyze, createAiState } from '../../server/analyze';
import { serveAnalyze } from '../../server/http';
import { buildDemoTeam } from '../lib/team';
import fixture from './fixtures/aiAnalysis.json';

it('enforces the same JSON/POST/size boundary through a real local HTTP adapter', async () => {
  let calls = 0;
  const deps = { key: 'http-unit-key', state: createAiState(), fetch: async () => {
    calls++; return Response.json({ choices: [{ message: { content: JSON.stringify(fixture) } }] });
  } };
  const server = createServer((req, res) => void serveAnalyze(req, res, handleAnalyze, deps));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test address');
  const url = `http://127.0.0.1:${address.port}/api/analyze`;
  try {
    expect((await fetch(url)).status).toBe(405);
    expect((await fetch(url, { method: 'POST', body: '{}' })).status).toBe(415);
    expect((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status).toBe(400);
    expect((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'я'.repeat(2200) }) })).status).toBe(413);
    const record = buildDemoTeam()[0];
    const body = JSON.stringify({ answers: record.answers, position: record.participant.position,
      experience: record.participant.experience });
    for (let index = 0; index < 6; index++) {
      expect((await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })).status).toBe(200);
    }
    const limited = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBeTruthy();
    expect(calls).toBe(1);
  } finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
});
