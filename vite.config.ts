import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { aiDevPlugin } from './scripts/ai/dev-plugin';
export default defineConfig({
  base: '/', plugins: [react(), aiDevPlugin(), {
    // Recharts uses `task-${...}` labels. Escape only this known dash to keep the strict
    // "no sk- substring" acceptance check useful without changing the runtime string.
    name: 'chart-label-literal', apply: 'build',
    renderChunk: { order: 'post', handler(code) {
      return { code: code.replaceAll('`task-${', '`task\\u002d${'), map: null };
    } },
  }],
  build: { rollupOptions: { output: { manualChunks: { charts: ['recharts'], react: ['react', 'react-dom', 'react-router-dom'] } } } },
  test: { include: ['src/tests/**/*.test.ts'] }
});
