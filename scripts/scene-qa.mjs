import { createServer } from 'vite';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { createServer as createHttpServer } from 'node:http';
export const base = process.env.BI_PREVIEW_URL || 'http://127.0.0.1:5173';
export const dir = 'artifacts/scene';
export async function fixtures() {
  const transport = createHttpServer();
  const server = await createServer({
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: { server: transport } },
    appType: 'custom',
  });
  try {
    const { questions } = await server.ssrLoadModule('/src/data/questions.ts');
    const { buildDemoTeam } = await server.ssrLoadModule('/src/lib/team.ts');
    const { DEFAULT_SKIN } = await server.ssrLoadModule('/src/data/skins.ts');
    return { questions, records: buildDemoTeam(), defaultSkin: DEFAULT_SKIN };
  } finally {
    await server.close();
  }
}
export async function launch() {
  const executablePath =
    process.env.BI_BROWSER_PATH ||
    [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    ].find(existsSync);
  return chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
}
export function progressAt(questions, skin, index, answers = {}) {
  const colors = {
    orange: '#F28C28',
    white: '#FFFFFF',
    blue: '#1668B8',
    yellow: '#F2C230',
    red: '#D94A3A',
    green: '#2E9E5B',
  };
  return {
    methodologyVersion: '1.0',
    participant: { name: 'Айдос Нурланов', position: 'Прораб', experience: '3–5 лет' },
    answers: Object.fromEntries(
      questions.slice(0, index).map((q) => [q.id, answers[q.id] ?? (q.type === 'situation' ? 'A' : 3)]),
    ),
    sessionSeed: 'scene-presentation',
    currentIndex: index,
    startedAt: '2026-10-19T02:00:00.000Z',
    perQuestionSec: Object.fromEntries(questions.slice(0, index).map((q) => [q.id, 14])),
    helmetColor: colors[skin.helmet],
    skin,
    consequenceShown: false,
    stage: 'play',
  };
}
export async function seed(page, progress) {
  await page.goto(base);
  await page.evaluate((value) => localStorage.setItem('bi-profile:v1:quest-progress', JSON.stringify(value)), progress);
  await page.goto(`${base}/#/quest/play`);
  await page.getByText(`Сцена ${progress.currentIndex + 1}/15`, { exact: true }).waitFor();
}
export async function choose(page, question, id = 'A') {
  await page
    .getByRole('radio', { name: question.options.find((option) => option.id === id).text, exact: true })
    .locator('..')
    .click();
  await page.getByRole('button', { name: 'Принять решение', exact: true }).click();
}
