import type { IncomingMessage, ServerResponse } from 'node:http';
import { failure, requestGuard, type AnalyzeDeps, type ApiResult } from './analyze';

export type ApiRequest = IncomingMessage & { body?: unknown };
export type Handler = (body: unknown, deps: AnalyzeDeps) => Promise<ApiResult>;
export function sendJson(res: ServerResponse, result: ApiResult) {
  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [key, value] of Object.entries(result.headers ?? {})) res.setHeader(key, value);
  res.end(JSON.stringify(result.body));
}
async function jsonBody(req: ApiRequest, maxBytes: number): Promise<{ body: unknown; bytes: number }> {
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' ? req.body : Buffer.isBuffer(req.body)
      ? req.body.toString('utf8') : JSON.stringify(req.body);
    return { body: JSON.parse(raw), bytes: Buffer.byteLength(raw) };
  }
  return new Promise((resolve, reject) => {
    let bytes = 0;
    let chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes <= maxBytes) chunks.push(chunk); else chunks = [];
    });
    req.once('end', () => {
      if (bytes > maxBytes) return resolve({ body: null, bytes });
      try { resolve({ body: JSON.parse(Buffer.concat(chunks).toString('utf8')), bytes }); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.once('error', reject);
  });
}
export async function serveAnalyze(req: ApiRequest, res: ServerResponse, handler: Handler,
  deps: AnalyzeDeps, trustedProxy = false, maxBytes = 4096) {
  const contentType = String(req.headers['content-type'] ?? '');
  const meta = { ...deps, method: req.method, contentType,
    ip: trustedProxy ? String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress).split(',')[0].trim()
      : req.socket.remoteAddress ?? 'unknown' };
  const guard = requestGuard(null, { ...meta, bodyBytes: Number(req.headers['content-length'] ?? 0) }, maxBytes);
  if (guard) { req.resume(); sendJson(res, guard); return; }
  try {
    const { body, bytes } = await jsonBody(req, maxBytes);
    sendJson(res, await handler(body, { ...meta, bodyBytes: bytes }));
  } catch {
    sendJson(res, failure(400, 'Некорректный JSON.'));
  }
}
