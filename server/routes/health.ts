import type { IncomingMessage, ServerResponse } from 'node:http';
import { sendJson } from '../http';
export default function health(req: IncomingMessage, res: ServerResponse) {
  sendJson(res, req.method === 'GET' ? { status: 200, body: { ai: Boolean(process.env.OPENAI_API_KEY?.trim()) } }
    : { status: 405, body: { error: 'Допустим только GET.' }, headers: { Allow: 'GET' } });
}
