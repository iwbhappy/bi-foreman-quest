// Собирает серверные функции Vercel в самодостаточные ESM-файлы api/*.js.
// Зачем: Vercel компилирует каждый файл api/*.ts отдельно и не связывает импорты без расширений
// (`./_lib/http`, `../src/...`) при "type": "module" — функция падала с FUNCTION_INVOCATION_FAILED.
// Исходники — server/routes/*.ts; в api/ попадают только сгенерированные бандлы (их коммитим).
import { build } from 'esbuild';
import { readdirSync, mkdirSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';

const routes = readdirSync('server/routes').filter((file) => file.endsWith('.ts'));
rmSync('api', { recursive: true, force: true });
mkdirSync('api', { recursive: true });
await build({
  entryPoints: routes.map((file) => join('server/routes', file)),
  outdir: 'api',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  // Ключ и переменные окружения читаются только во время выполнения через process.env.
  banner: { js: '// Сгенерировано scripts/build-api.mjs из server/routes — не редактировать вручную.' },
  logLevel: 'warning',
});
console.log('api:', routes.map((file) => `${basename(file, '.ts')}.js`).join(', '));
