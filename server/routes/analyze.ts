import type { ServerResponse } from 'node:http';
import { handleAnalyze } from '../analyze';
import { serveAnalyze, type ApiRequest } from '../http';
import { serverDeps } from '../runtime';
export default async function analyze(req: ApiRequest, res: ServerResponse) {
  await serveAnalyze(req, res, handleAnalyze, serverDeps(), true);
}
