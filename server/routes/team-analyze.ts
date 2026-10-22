import type { ServerResponse } from 'node:http';
import { handleTeamAnalyze } from '../team-analyze';
import { serveAnalyze, type ApiRequest } from '../http';
import { serverDeps } from '../runtime';
export default async function analyze(req: ApiRequest, res: ServerResponse) {
  await serveAnalyze(req, res, handleTeamAnalyze, serverDeps(), true, 16_384);
}
