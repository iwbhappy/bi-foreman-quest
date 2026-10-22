import type { Plugin } from 'vite';
export function aiDevPlugin(): Plugin {
  return {
    name: 'local-ai-api', apply: 'serve',
    async configureServer(server) {
      if (server.config.server.middlewareMode) return;
      const [{ handleAnalyze, createAiState }, { serveAnalyze, sendJson }, { localEnv }, { handleTeamAnalyze }] = await Promise.all([
        import('../../server/analyze'), import('../../server/http'), import('./local-env'),
        import('../../server/team-analyze'),
      ]);
      const deps = { ...await localEnv(), state: createAiState(),
        log: (entry: { status: number; durationMs: number; usage?: Record<string, number> }) =>
          console.info(JSON.stringify(entry)) };
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0];
        if (path === '/api/health') {
          sendJson(res, req.method === 'GET' ? { status: 200, body: { ai: Boolean(deps.key?.trim()) } }
            : { status: 405, body: { error: 'Допустим только GET.' }, headers: { Allow: 'GET' } });
        } else if (path === '/api/analyze') void serveAnalyze(req, res, handleAnalyze, deps);
        else if (path === '/api/team-analyze') void serveAnalyze(req, res, handleTeamAnalyze, deps, false, 16_384);
        else next();
      });
    },
  };
}
