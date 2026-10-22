import { chromium } from 'playwright';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';

const dir = 'artifacts/polish';
mkdirSync(dir, { recursive: true });
const base = process.env.BI_PREVIEW_URL || 'http://127.0.0.1:5173';
const server = await createServer({
  server: { middlewareMode: true, hmr: { server: createHttpServer() } },
  appType: 'custom',
});
let records, lineup;
try {
  const team = await server.ssrLoadModule('/src/lib/team.ts');
  const { HeroSilhouette } = await server.ssrLoadModule('/src/components/quest/HeroSilhouette.tsx');
  const latest = team.latestProfiles(team.buildDemoTeam());
  records = ['🦉', '🐻', '🦫', '🐺', '🦊'].map((emoji) => latest.find((record) => record.archetype.emoji === emoji));
  const all = team.buildDemoTeam();
  writeFileSync(
    `${dir}/demo-team.json`,
    JSON.stringify(
      latest.map((record) => ({
        name: record.participant.name,
        percents: record.percents,
        overall: record.overall,
        archetype: record.archetype.name,
        weakest: team.weakestTrait(record.percents),
        delta: team.firstPrevious(all, record) ? record.overall - team.firstPrevious(all, record).overall : null,
      })),
      null,
      2,
    ),
  );
  lineup = records
    .map(
      (record) =>
        `<article><div>${renderToStaticMarkup(
          createElement(HeroSilhouette, {
            helmetColor: record.helmetColor,
            emoji: record.archetype.emoji,
            label: record.archetype.name,
          }),
        )}</div><h2>${record.archetype.name}</h2></article>`,
    )
    .join('');
} finally {
  await server.close();
}
const executablePath =
  process.env.BI_BROWSER_PATH ||
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const checks = [],
  errors = [];
function pass(label) {
  checks.push(label);
  process.stdout.write(`PASS ${label}\n`);
}
async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true, animations: 'disabled' });
}
async function avatar(page, selector, record) {
  await page.evaluate(() => document.fonts.ready);
  const svg = page.locator(selector);
  assert.equal(await svg.locator('clipPath, text[clip-path]').count(), 0);
  assert.equal(await svg.locator('.hero-emoji-face').textContent(), record.archetype.emoji);
  assert.equal(await svg.locator('[data-helmet-shape]').getAttribute('data-helmet-color'), record.helmetColor);
  const geometry = await svg.evaluate((node) => {
    const face = node.querySelector('.hero-emoji-face');
    const helmet = node.querySelector('[data-helmet-shape]');
    return {
      width: face.getBBox().width,
      before: Boolean(helmet.compareDocumentPosition(face) & Node.DOCUMENT_POSITION_FOLLOWING),
    };
  });
  assert(
    geometry.width / 210 >= 0.65 && geometry.width / 210 <= 0.8,
    `${record.archetype.emoji}: width ${geometry.width}`,
  );
  assert(geometry.before, 'Emoji drawn in front: helmet cannot hide eyes, nose or ears');
}
try {
  for (const width of [360, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
      locale: 'ru-RU',
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) errors.push(message.text());
    });
    await page.goto(base);
    for (const record of records) {
      await page.goto(`${base}/#/manager/${record.id}`);
      await page.locator('.manager-sidebar').waitFor();
      await avatar(page, '.manager-sidebar .hero-silhouette', record);
      const disclaimer = page.locator('.manager-disclaimer');
      assert.equal(await disclaimer.evaluate((node) => getComputedStyle(node).fontStyle), 'italic');
      assert.equal(await disclaimer.evaluate((node) => getComputedStyle(node).textAlign), 'center');
      if (record.participant.name === 'Айдос Нурланов') {
        assert.equal(await page.locator('.analysis-delta.trend-down').count(), 1);
        assert.equal(await page.locator('.analysis-delta.trend-up').count(), 2);
        if (width === 1440) await shot(page, 'aidos-manager-1440');
      }
      await page.goto(`${base}/#/result/${record.id}`);
      await page.locator('.result-hero').waitFor();
      await avatar(page, '.result-hero .hero-silhouette', record);
      await page.evaluate((record) => {
        localStorage.setItem('bi-profile:v1:results', JSON.stringify([record]));
        localStorage.setItem(
          'bi-profile:v1:quest-progress',
          JSON.stringify({
            methodologyVersion: '1.0',
            participant: record.participant,
            answers: record.answers,
            sessionSeed: 'polish-avatar-check',
            currentIndex: 14,
            startedAt: record.createdAt,
            perQuestionSec: record.perQuestionSec,
            helmetColor: record.helmetColor,
            consequenceShown: false,
            stage: 'reveal',
            resultId: record.id,
          }),
        );
      }, record);
      await page.goto(`${base}/#/quest/report`);
      await page.locator('.hero-reveal[data-revealed=true]').waitFor();
      await avatar(page, '.hero-reveal .hero-silhouette', record);
      if (record.archetype.emoji === '🦫') await shot(page, `hero-reveal-${width}`);
      await page.evaluate(() => {
        localStorage.clear();
      });
    }
    await page.goto(`${base}/#/team`);
    await page.locator('.team-table').waitFor();
    for (const record of records) {
      const row = page.locator('.team-table tr', {
        has: page.getByRole('link', { name: record.participant.name, exact: true }),
      });
      assert.equal(await row.locator('.hero-emoji-face').textContent(), record.archetype.emoji);
      assert.equal(await row.locator('[data-helmet-shape]').getAttribute('data-helmet-color'), record.helmetColor);
    }
    assert.equal(await page.locator('.development-groups article').count(), 4);
    if (width === 1440) await shot(page, 'team-1440');
    await page.goto(`${base}/#/method`);
    await page.getByRole('heading', { name: 'Методика', exact: true }).waitFor();
    assert(!/ТЗ|Likert|questions\.ts|`/i.test(await page.locator('main').innerText()));
    await page.getByRole('heading', { name: 'Почему здесь нет правильных ответов', exact: true }).waitFor();
    if (width === 360) await shot(page, 'method-360');
    pass(
      `${width}px: all 5 animals on reveal/result/manager/team, unclipped emoji ~70% of circle, helmet behind face, four development groups, analysis deltas/disclaimer, human method text`,
    );
    if (width === 1440) {
      await page.evaluate((html) => {
        document.body.innerHTML = `<main class="avatar-lineup"><p>BI ACADEMY · ГЕРОИ СМЕНЫ</p><h1>Пять характеров — одна команда</h1><section>${html}</section></main>`;
        const style = document.createElement('style');
        style.textContent =
          '.avatar-lineup{padding:48px 32px;color:#0b3b6f}.avatar-lineup>p{font-size:12px;letter-spacing:.16em}.avatar-lineup h1{font-size:32px;font-weight:700;margin:12px 0 32px}.avatar-lineup>section{display:flex;gap:20px}.avatar-lineup article{flex:1;text-align:center;background:white;border-radius:20px;padding:20px 0}.avatar-lineup article>div{height:330px}.avatar-lineup .hero-silhouette{width:240px;height:330px}.avatar-lineup h2{font-size:18px;font-weight:600;margin-top:12px}';
        document.head.append(style);
      }, lineup);
      await shot(page, 'avatar-lineup');
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
  pass('zero browser errors and warnings');
} finally {
  writeFileSync(`${dir}/polish-browser-report.json`, JSON.stringify({ checks, errors }, null, 2));
  await browser.close();
}
