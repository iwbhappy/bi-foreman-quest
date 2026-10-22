import demoAnalyses from '../data/demoAnalyses.json';
import { validAnalyzeResponse, type AnalyzeResponse } from './aiTypes';
import type { ResultRecord } from './types';

const memory = new Map<string, AnalyzeResponse>();
const pending = new Map<string, Promise<AnalyzeResponse>>();
let healthRequest: Promise<boolean> | undefined;
export const analysisKey = (id: string) => `bi-profile:v1:analysis:${id}`;
export function demoAnalysis(id: string): AnalyzeResponse | undefined {
  const value: unknown = (demoAnalyses as Record<string, unknown>)[id];
  return validAnalyzeResponse(value) ? value : undefined;
}
export function readAnalysis(id: string): AnalyzeResponse | undefined {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(analysisKey(id)) ?? 'null');
    if (validAnalyzeResponse(value)) return value;
  } catch { /* Storage can be disabled or contain a stale record. */ }
  return memory.get(id);
}
export function aiAvailable(fetcher: typeof fetch = fetch): Promise<boolean> {
  if (!healthRequest) healthRequest = fetcher('/api/health', { cache: 'no-store' }).then(async (response) => {
    if (response.status === 404 || !response.headers.get('content-type')?.includes('application/json')) return false;
    if (!response.ok) throw new Error('AI health check failed');
    const value: unknown = await response.json();
    return typeof value === 'object' && value !== null && 'ai' in value && value.ai === true;
  }).catch((error) => { healthRequest = undefined; throw error; });
  return healthRequest;
}
export function requestAnalysis(record: ResultRecord, force = false,
  fetcher: typeof fetch = fetch): Promise<AnalyzeResponse> {
  const cached = readAnalysis(record.id);
  if (cached && !force) return Promise.resolve(cached);
  const active = pending.get(record.id);
  if (active) return active;
  const work = (async () => {
    const response = await fetcher('/api/analyze', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: record.answers, position: record.participant.position,
        experience: record.participant.experience }),
    });
    if (!response.ok) {
      let error = '';
      try { error = (await response.json()).error; } catch { /* Only show the generic UI fallback. */ }
      throw new Error(typeof error === 'string' ? error : 'AI unavailable');
    }
    const value: unknown = await response.json();
    if (!validAnalyzeResponse(value)) throw new Error('Invalid AI response');
    memory.set(record.id, value);
    try { localStorage.setItem(analysisKey(record.id), JSON.stringify(value)); }
    catch { /* Keep the result in memory when localStorage is unavailable. */ }
    return value;
  })();
  pending.set(record.id, work);
  void work.finally(() => pending.delete(record.id)).catch(() => {});
  return work;
}
