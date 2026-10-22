import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { fixtures } from './scene-qa.mjs';

const base = process.env.BI_PREVIEW_URL || 'http://127.0.0.1:5173';
const dir = 'artifacts';
mkdirSync(dir, { recursive: true });
const executablePath = process.env.BI_BROWSER_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const checks = [];
const consoleErrors = [];
const { questions: bank } = await fixtures();
const sourceTexts = bank.filter(q => q.type === 'situation').flatMap(q => q.options.map(o => ({ id: o.id, text: o.text,
  weights: [o.weights.critical, o.weights.confidence, o.weights.discipline, o.weights.engagement] })));
function record(label) { checks.push(label); process.stdout.write(`PASS ${label}\n`); }
async function noOverflow(page, label) {
  const sizes = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, width: innerWidth }));
  assert(sizes.page <= sizes.width, `${label}: overflow ${sizes.page}/${sizes.width}`);
}
async function screenshot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true, animations: 'disabled' });
}
function observe(page, label) {
  page.on('pageerror', error => consoleErrors.push(`${label}: ${error.message}`));
  page.on('console', msg => { if (['error', 'warning'].includes(msg.type())) consoleErrors.push(`${label}: ${msg.type()}: ${msg.text()}`); });
}
async function begin(page) {
  await page.getByRole('link', { name: 'Пройти в простом формате (без игры)', exact: true }).click();
  await page.getByLabel('Имя (необязательно)').fill('Айдос Нурланов');
  await page.getByLabel('Должность', { exact: true }).selectOption('Прораб');
  await page.getByLabel('Стаж в строительстве').selectOption('3–5 лет');
  await page.getByRole('button', { name: 'Начать тест' }).click();
  await page.getByText('Вопрос 1 из 15', { exact: true }).waitFor();
}
async function finishFrom(page, from, kind = 'A', capture = true) {
  for (let n = from; n <= 15; n++) {
    await page.getByText(`Вопрос ${n} из 15`, { exact: true }).waitFor();
    await noOverflow(page, `question ${n}`);
    const radios = page.getByRole('radio');
    if (await radios.count() === 7) await radios.nth(3).locator('..').click();
    else {
      const id = `q${String(n).padStart(2, '0')}`;
      const text = await page.locator('input[type=radio]').first().getAttribute('name');
      assert.equal(text, id);
      const index = [1, 2, 3, 5, 6, 7, 9, 10, 12, 13, 15].indexOf(n);
      const target = sourceTexts[index * 4 + (kind === 'A' ? 0 : 1)].text;
      await page.getByRole('radio', { name: target, exact: true }).locator('..').click();
    }
    if (n === 3 && capture) {
      const order = await radios.evaluateAll(nodes => nodes.map(n => n.value));
      await page.reload();
      await page.getByText('Вопрос 3 из 15', { exact: true }).waitFor();
      assert.deepEqual(await page.getByRole('radio').evaluateAll(nodes => nodes.map(n => n.value)), order);
      await page.getByRole('link', { name: /BI.*ACADEMY/ }).click();
      await page.getByRole('link', { name: 'Продолжить с вопроса 3', exact: true }).click();
    }
    if (n === 4 && capture) await screenshot(page, `likert-${page.viewportSize().width}`);
    await page.getByRole('button', { name: n === 15 ? 'Получить результат' : 'Далее', exact: true }).click();
  }
  await page.waitForURL('**/#/result/**');
  await page.getByRole('heading', { name: 'План на 30 дней', exact: true }).waitFor();
  await noOverflow(page, 'result');
}
try {
  for (const width of [360, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width === 360 ? 800 : 1000 }, deviceScaleFactor: 1, locale: 'ru-RU', timezoneId: 'Asia/Qyzylorda' });
    const page = await context.newPage(); observe(page, String(width));
    await page.goto(base); await page.getByRole('heading', { name: 'Профиль качеств сотрудника', exact: true }).waitFor();
    await noOverflow(page, 'landing'); await screenshot(page, `landing-${width}`);
    await begin(page);
    await assert.rejects(() => page.getByRole('button', { name: 'Далее', exact: true }).click({ timeout: 400 }));
    const order = await page.getByRole('radio').evaluateAll(nodes => nodes.map(n => n.value));
    await screenshot(page, `situation-${width}`);
    await page.keyboard.press('2'); await page.keyboard.press('Enter');
    await page.getByText('Вопрос 2 из 15', { exact: true }).waitFor();
    await page.keyboard.press('ArrowLeft');
    await page.getByText('Вопрос 1 из 15', { exact: true }).waitFor();
    assert.deepEqual(await page.getByRole('radio').evaluateAll(nodes => nodes.map(n => n.value)), order);
    assert(await page.getByRole('radio').nth(1).isChecked());
    await page.reload();
    await page.getByText('Вопрос 1 из 15', { exact: true }).waitFor();
    assert.deepEqual(await page.getByRole('radio').evaluateAll(nodes => nodes.map(n => n.value)), order);
    await page.getByRole('link', { name: /BI.*ACADEMY/ }).click();
    await page.getByRole('link', { name: 'Продолжить с вопроса 1', exact: true }).click();
    await finishFrom(page, 1, width === 360 ? 'A' : 'B');
    const result = await page.evaluate(() => JSON.parse(localStorage.getItem('bi-profile:v1:results'))[0]);
    assert.deepEqual(result.percents, width === 360 ? { critical: 47, confidence: 79, discipline: 26, engagement: 63 } : { critical: 47, confidence: 44, discipline: 70, engagement: 34 });
    assert.equal(result.overall, width === 360 ? 54 : 49);
    assert(Object.values(result.perQuestionSec).every(n => n > 0));
    assert(Math.abs(Object.values(result.perQuestionSec).reduce((a, b) => a + b, 0) - result.durationSec) < 0.01);
    assert(result.flags.includes('too_fast'));
    assert.equal(await page.getByRole('meter').count(), 4);
    assert.equal(await page.getByRole('checkbox').count(), 4);
    await page.getByRole('checkbox').first().check(); await page.reload();
    assert(await page.getByRole('checkbox').first().isChecked());
    await screenshot(page, `result-${width}`);
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Сохранить JSON' }).click();
    const download = await downloadEvent; await download.saveAs(`${dir}/result-${width}.json`);
    const downloaded = JSON.parse(readFileSync(`${dir}/result-${width}.json`, 'utf8'));
    assert.deepEqual(downloaded.answers, result.answers);
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.getByRole('button', { name: 'Скачать PDF' }).isVisible(), false);
    await page.pdf({ path: `${dir}/result-${width}.pdf`, format: 'A4', printBackground: true, preferCSSPageSize: true });
    await page.emulateMedia({ media: 'screen' });
    record(`${width}px: full flow, keyboard, stable shuffle/back/reload, resume, no overflow, 2 reference profiles, flags, plan persistence, JSON, PDF`);
    if (width === 1440) {
      // Exhaustively exercise UI flags and worst-case report density with a real completed record.
      const scenarios = [
        { name: 'contradiction', likerts: [6, 6, 6, 6], option: 'A' },
        { name: 'all-low', likerts: [0, 6, 0, 6], option: 'D' },
        { name: 'three-strengths', likerts: [6, 0, 6, 0], option: 'A', situationOptions: ['A','A','A','A','A','A','B','D','D','C','A'] },
        { name: 'three-low', likerts: [0, 6, 6, 6], option: 'B', situationOptions: ['B','B','B','B','D','C','B','B','B','B','B'] }
      ];
      for (const scenario of scenarios) {
        await page.evaluate(({ scenario }) => {
          const records = JSON.parse(localStorage.getItem('bi-profile:v1:results'));
          const r = records[0];
          for (const id of Object.keys(r.answers)) r.answers[id] = scenario.option;
          if (scenario.situationOptions) [1,2,3,5,6,7,9,10,12,13,15].forEach((n, i) => { r.answers[`q${String(n).padStart(2, '0')}`] = scenario.situationOptions[i]; });
          ['q04', 'q08', 'q11', 'q14'].forEach((id, i) => r.answers[id] = scenario.likerts[i]);
          localStorage.setItem('bi-profile:v1:results', JSON.stringify(records));
        }, { scenario });
        await page.reload();
        await page.getByRole('heading', { name: 'План на 30 дней', exact: true }).waitFor();
        if (scenario.name === 'contradiction') {
          await page.getByText('• Противоречивые ответы', { exact: true }).waitFor();
          await page.getByText('• Одинаковые крайние ответы', { exact: true }).waitFor();
        }
        if (scenario.name === 'three-strengths') assert.equal(await page.locator('.strength-card .analysis-item').count(), 3);
        if (scenario.name === 'three-low') {
          assert.equal(await page.locator('.recommendation-group').count(), 3);
          assert.equal(await page.locator('.recommendation-group').last().isVisible(), false);
          await page.getByRole('button', { name: 'Показать ещё', exact: true }).click();
          assert.equal(await page.locator('.recommendation-group').last().isVisible(), true);
          await page.getByRole('button', { name: 'Показать ещё', exact: true }).click();
        }
        await page.emulateMedia({ media: 'print' });
        await page.pdf({ path: `${dir}/result-${scenario.name}.pdf`, format: 'A4', printBackground: true, preferCSSPageSize: true });
        await page.emulateMedia({ media: 'screen' });
      }
      record('contradiction and straightline warnings; additional print profiles');
    }
    await context.close();
  }
  const blockedContext = await browser.newContext({ viewport: { width: 360, height: 800 } });
  await blockedContext.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked for QA'); } }); });
  const blocked = await blockedContext.newPage(); observe(blocked, 'storage-blocked');
  await blocked.goto(base); await blocked.getByText('Результат не сохранится после закрытия страницы', { exact: true }).waitFor();
  await begin(blocked); await finishFrom(blocked, 1, 'A', false);
  await blocked.getByRole('heading', { name: 'План на 30 дней', exact: true }).waitFor();
  record('localStorage blocked: complete flow using memory and warning');
  await blockedContext.close();
  const corrupt = await browser.newContext();
  await corrupt.addInitScript(() => { localStorage.setItem('bi-profile:v1:progress', '{broken'); localStorage.setItem('bi-profile:v1:results', JSON.stringify([{ methodologyVersion: '2.0' }, { methodologyVersion: '1.0', answers: {} }])); });
  const corruptPage = await corrupt.newPage(); observe(corruptPage, 'corrupt');
  await corruptPage.goto(`${base}/#/result/unknown`); await corruptPage.getByRole('heading', { name: 'Результат не найден' }).waitFor();
  await corruptPage.goto(base); await corruptPage.getByRole('link', { name: 'Пройти в простом формате (без игры)', exact: true }).click();
  await corruptPage.getByRole('button', { name: 'Начать тест' }).waitFor();
  record('corrupt/old storage ignored; missing result handled');
  await corrupt.close();
  assert.deepEqual(consoleErrors, [], 'Browser errors/warnings');
  record('zero browser console errors and warnings');
} finally {
  writeFileSync(`${dir}/browser-report.json`, JSON.stringify({ checks, consoleErrors }, null, 2));
  await browser.close();
}
