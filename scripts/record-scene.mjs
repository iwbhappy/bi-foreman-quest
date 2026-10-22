import { mkdirSync, writeFileSync } from 'node:fs';
import { fixtures, launch, base, dir, progressAt, seed, choose } from './scene-qa.mjs';

mkdirSync(dir, { recursive: true });
const { questions, records } = await fixtures();
const browser = await launch();
const errors = [],
  videos = [];
async function context() {
  const result = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ru-RU',
    reducedMotion: 'no-preference',
    recordVideo: { dir, size: { width: 1440, height: 900 } },
  });
  const page = await result.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors.push(message.text());
  });
  return { context: result, page };
}
async function decision(page, index, option) {
  await choose(page, questions[index], option);
  await page.locator('.quest-stage[data-playing=false]').waitFor();
  await page.waitForTimeout(2300);
}
let skin;
try {
  {
    const { context: session, page } = await context();
    const start = Date.now();
    await page.goto(`${base}/#/quest/start`);
    await page.getByLabel('Имя (необязательно)').fill('Айдос Нурланов');
    await page.getByLabel('Должность', { exact: true }).selectOption('Прораб');
    await page.getByLabel('Стаж в строительстве').selectOption('3–5 лет');
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: '🎲 Случайный герой', exact: true }).click();
    await page.waitForTimeout(1500);
    await page.getByRole('radio', { name: 'синий', exact: true }).locator('..').click();
    await page.getByRole('radio', { name: 'Лаймовый жилет', exact: true }).locator('..').click();
    await page.getByRole('radio', { name: 'BI', exact: true }).locator('..').click();
    await page.getByRole('radio', { name: 'Яркий', exact: true }).locator('..').click();
    skin = JSON.parse(await page.locator('.hero-preview .hero-silhouette').getAttribute('data-skin'));
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: 'Выйти на смену', exact: true }).click();
    await page.waitForTimeout(4500);
    await decision(page, 0, 'C');
    await page.getByRole('button', { name: 'Дальше', exact: true }).click();
    await page.waitForTimeout(4000);
    await decision(page, 1, 'D');
    await seed(page, progressAt(questions, skin, 4, { q01: 'C', q02: 'D' }));
    await page.waitForTimeout(5000);
    await decision(page, 4, 'C');
    await seed(page, progressAt(questions, skin, 7, { q01: 'C', q02: 'D', q05: 'C' }));
    await page.waitForTimeout(5500);
    await page.getByRole('radio').nth(4).locator('..').click();
    await page.waitForTimeout(Math.max(1500, 60000 - (Date.now() - start)));
    const video = page.video();
    await session.close();
    await video.saveAs(`${dir}/01-hero-and-decisions.webm`);
    await video.delete();
    videos.push({
      file: '01-hero-and-decisions.webm',
      durationSec: Math.round((Date.now() - start) / 1000),
      width: 1440,
      height: 900,
    });
    process.stdout.write('PASS video 1: constructor/random hero, q01, q02, q05, mentor\n');
  }
  {
    const { context: session, page } = await context();
    const start = Date.now();
    await seed(page, progressAt(questions, skin, 14, records[1].answers));
    await page.waitForTimeout(4500);
    await decision(page, 14, 'A');
    await page.getByRole('button', { name: 'Дальше', exact: true }).click();
    await page.getByRole('heading', { name: 'Смена закрыта · 19:00', exact: true }).waitFor();
    await page.waitForTimeout(2500);
    await page
      .locator('.shift-journal')
      .evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    await page.waitForTimeout(3000);
    await page
      .locator('.shift-totals')
      .evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await page.waitForTimeout(4000);
    await page.getByRole('button', { name: 'Узнать, кто вы', exact: true }).click();
    await page.locator('.hero-reveal[data-revealed=true]').waitFor();
    await page.waitForTimeout(6000);
    await page.getByRole('button', { name: 'Открыть мой профиль', exact: true }).click();
    await page.locator('.profile-highlights').waitFor();
    await page.waitForTimeout(2500);
    await page
      .locator('.profile-highlights')
      .evaluate((node) => node.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    await page.waitForTimeout(Math.max(7000, 55000 - (Date.now() - start)));
    const video = page.video();
    await session.close();
    await video.saveAs(`${dir}/02-report-reveal-profile.webm`);
    await video.delete();
    videos.push({
      file: '02-report-reveal-profile.webm',
      durationSec: Math.round((Date.now() - start) / 1000),
      width: 1440,
      height: 900,
    });
    process.stdout.write('PASS video 2: last decision, report, reveal, profile highlights\n');
  }
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  writeFileSync(
    `${dir}/videos.json`,
    JSON.stringify(
      {
        videos,
        errors,
        note: 'Playwright recordVideo. Между q02 и q05 и перед паузой подготовлен валидный прогресс пропущенных эпизодов; все показанные решения и подсчёт выполняются приложением.',
      },
      null,
      2,
    ),
  );
  await browser.close();
}
