import { beforeEach, describe, expect, it, vi } from 'vitest';
import fixture from './fixtures/aiAnalysis.json';
import { buildDemoTeam } from '../lib/team';
import { calculate } from '../lib/scoring';
import { recommend } from '../lib/recommend';

const record = { ...buildDemoTeam()[0], id: '20000000-0000-4000-8000-000000000001' };
const response = { analysis: fixture, model: 'gpt-5.4-mini-2026-03-17', promptVersion: '1', cached: false };
describe('AI browser client', () => {
  beforeEach(() => {
    vi.resetModules();
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value) });
  });
  it('stores the response with model/version and reuses it without another request, including after reload', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => Response.json(response));
    const client = await import('../lib/aiClient');
    expect(await client.requestAnalysis(record, false, fetcher)).toEqual(response);
    expect(JSON.parse(localStorage.getItem(client.analysisKey(record.id))!)).toEqual(response);
    await client.requestAnalysis(record, false, fetcher);
    vi.resetModules();
    await (await import('../lib/aiClient')).requestAnalysis(record, false, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(fetcher.mock.calls[0][1]!.body as string);
    expect(Object.keys(sent).sort()).toEqual(['answers', 'experience', 'position']);
    expect(JSON.stringify(sent)).not.toContain(record.participant.name);
  });
  it('deduplicates StrictMode/concurrent requests and refreshes only when explicitly requested', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => Response.json(response));
    const client = await import('../lib/aiClient');
    await Promise.all([client.requestAnalysis(record, false, fetcher), client.requestAnalysis(record, false, fetcher)]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    await client.requestAnalysis(record, true, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('does not cache an error and leaves answers and formula recommendations unchanged', async () => {
    const before = JSON.stringify(record);
    const percents = calculate(record.answers).percents;
    const rules = recommend(percents);
    const fetcher = vi.fn<typeof fetch>(async () => Response.json({ error: 'Лимит — 6 AI-разборов в час.' }, { status: 429 }));
    const client = await import('../lib/aiClient');
    await expect(client.requestAnalysis(record, false, fetcher)).rejects.toThrow('Лимит');
    expect(client.readAnalysis(record.id)).toBeUndefined();
    expect(JSON.stringify(record)).toBe(before);
    expect(recommend(calculate(record.answers).percents)).toEqual(rules);
  });
  it('checks health once and hides AI on static preview or a server without a key', async () => {
    const client = await import('../lib/aiClient');
    const fetcher = vi.fn<typeof fetch>(async () => Response.json({ ai: false }));
    expect(await client.aiAvailable(fetcher)).toBe(false);
    expect(await client.aiAvailable(fetcher)).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
    vi.resetModules();
    expect(await (await import('../lib/aiClient')).aiAvailable(async () => new Response('<html>preview</html>'))).toBe(false);
  });
  it('rejects stale or incomplete cached/model responses', async () => {
    const client = await import('../lib/aiClient');
    localStorage.setItem(client.analysisKey(record.id), JSON.stringify({ ...response, promptVersion: '0' }));
    expect(client.readAnalysis(record.id)).toBeUndefined();
    await expect(client.requestAnalysis(record, false, async () => Response.json({ analysis: {} })))
      .rejects.toThrow('Invalid AI response');
  });
});
