# Деплой на Vercel

Приложение — статический фронтенд (Vite) и три серверные функции (`/api/analyze`, `/api/team-analyze`, `/api/health`). Ключ OpenAI хранится только в переменных окружения Vercel.

## 1. Репозиторий

Корень репозитория — содержимое папки `app/`. В репозиторий не попадают `.env*`, `.vercel/`, `node_modules/`, `dist/` (см. `.gitignore`). Репозиторий может быть публичным или приватным.

## 2. Проект в Vercel

vercel.com → **Add New → Project** → выбрать репозиторий. Настройки (определяются автоматически, задаются также в `vercel.json`):

| Параметр | Значение |
|---|---|
| Framework | Vite |
| Root Directory | `.` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | 22.x |

`npm run build` сначала собирает функции из `server/routes/*.ts` в самодостаточные `api/*.js` (esbuild), затем фронтенд.

## 3. Переменные окружения

**Settings → Environment Variables**, окружения Production и Preview:

| Переменная | Значение |
|---|---|
| `OPENAI_API_KEY` | ключ OpenAI — лучше отдельный для этого проекта; отметить как Sensitive |
| `OPENAI_MODEL` | `gpt-5.4-mini-2026-03-17` |
| `AI_DAILY_LIMIT` | `300` |

Не добавляйте префикс `VITE_` к переменным с ключом — такие переменные попадают в браузер. Если ключ добавлен после первого деплоя, выполните **Redeploy**.

## 4. Лимит расходов OpenAI

В кабинете OpenAI для проекта ключа: **Project settings → Limits → Spend** — задать месячный лимит (например, 5 $) и включить жёсткое ограничение. Приложение дополнительно ограничивает запросы: 6 в час с одного IP и `AI_DAILY_LIMIT` в сутки на экземпляр функции; одинаковые прохождения отдаются из кэша.

## 5. Проверка

- `https://<project>.vercel.app/api/health` → `{"ai":true}`;
- пройти тест — AI-разбор появляется за 5–15 секунд;
- в файлах сайта нет ключа (локально: `npm run build && npm run check:dist`).

QR-код на итоговую ссылку: `node scripts/make-qr.mjs https://<project>.vercel.app` → `screenshots/qr.svg` и `qr.png`.
