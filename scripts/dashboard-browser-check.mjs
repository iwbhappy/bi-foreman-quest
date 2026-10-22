import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const base = process.env.BI_PREVIEW_URL || 'http://127.0.0.1:5173';
const dir = process.env.BI_ARTIFACT_DIR || 'artifacts/polish';
mkdirSync(dir, { recursive: true });
const executablePath = process.env.BI_BROWSER_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const checks = [];
const errors = [];
const report = label => { checks.push(label); process.stdout.write(`PASS ${label}\n`); };
const traits = ['Критическое мышление', 'Уверенность в себе', 'Дисциплина', 'Вовлечённость'];
async function noOverflow(page) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
}
async function screenshot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await noOverflow(page);
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true, animations: 'disabled' });
}
async function noGameMetrics(page) {
  assert.equal(await page.locator('.quest-hud, .hud-indicators, .final-indicators').count(), 0);
  for (const label of ['Сроки', 'Качество', 'Безопасность']) {
    assert.equal(await page.getByText(label, { exact: true }).count(), 0);
  }
}
try {
  for (const width of [360, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'ru-RU', timezoneId: 'Asia/Qyzylorda' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
    await page.goto(base);
    await page.getByRole('heading', { name: 'Квест прораба', exact: true }).waitFor();
    assert.equal(await page.locator('form').count(), 0);
    await page.getByText('≈ 10 минут · 15 вопросов · результат сразу', { exact: true }).waitFor();
    assert((await page.locator('.hero-subtitle').innerText()).includes('Одна смена на объекте, 15 решений'));
    await page.getByRole('link', { name: 'Пройти без игры', exact: true }).click();
    await page.getByRole('button', { name: 'Начать тест', exact: true }).waitFor();
    assert.equal(await page.locator('form').count(), 1);
    assert.equal(await page.locator('form').evaluate(form => form.checkValidity()), false);
    await noOverflow(page);
    await page.goto(`${base}/#/team`);
    await page.getByRole('heading', { name: 'Команда', exact: true }).waitFor();
    assert.equal(await page.locator('.team-table tbody tr').count(), 8);
    await page.getByText('Прохождений: 11', { exact: false }).waitFor();
    await page.locator('.demo-badge').waitFor();
    assert.equal(await page.locator('.team-person [data-art-helmet]').count(), 8);
    const values = await page.locator('.team-table tbody tr').evaluateAll(rows => rows.map(row =>
      [...row.querySelectorAll('.heat-cell')].map(cell => parseInt(cell.textContent, 10))));
    const average = traits.map((_, index) => Math.round(values.reduce((sum, row) => sum + row[index], 0) / values.length));
    const chartLabel = await page.locator('.team-radar .radar-container').getAttribute('aria-label');
    traits.forEach((trait, index) => assert(chartLabel.includes(`${trait} ${average[index]}%`)));
    assert.equal(await page.locator('.group-members a').count(), 8);
    await noGameMetrics(page);
    await screenshot(page, `team-${width}`);
    await page.locator('.team-table').getByRole('link', { name: 'Айдос Нурланов', exact: true }).click();
    await page.getByRole('heading', { name: 'Карточка развития сотрудника', exact: true }).waitFor();
    assert.equal(await page.locator('.manager-route li').count(), 4);
    assert.equal(await page.locator('.manager-route .complete').count(), 1);
    assert.equal(await page.locator('.manager-route .active').count(), 1);
    assert.equal(await page.locator('.baseline-track').count(), 4);
    assert.equal(await page.locator('.current-track').count(), 4);
    assert((await page.locator('.period-delta').innerText()).includes('▲ +5'));
    assert.equal(await page.locator('.manager-sidebar .archetype-avatar').getAttribute('data-helmet-color'), '#1668B8');
    const red = page.locator('.dynamics-trait.trend-down .current-track > span');
    assert.equal(await red.count(), 1);
    assert.equal(await red.evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(217, 74, 58)');
    assert.equal(await page.locator('.manager-audience > p').count(), 2);
    await noGameMetrics(page);
    await screenshot(page, `manager-${width}`);
    await page.goto(`${base}/#/manager/10000000-0000-4000-8000-000000000032`);
    await page.locator('.period-delta').waitFor();
    assert((await page.locator('.period-delta').innerText()).includes('▼ −2'));
    await page.goto(`${base}/#/manager/10000000-0000-4000-8000-000000000041`);
    await page.getByText('Первое прохождение', { exact: true }).waitFor();
    assert.equal(await page.locator('.baseline-track').count(), 0);
    assert.equal(await page.locator('.period-delta').count(), 0);
    await page.goto(`${base}/#/result/10000000-0000-4000-8000-000000000012`);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Сохранить JSON', exact: true }).click();
    const download = await downloadPromise;
    const fixture = JSON.parse(readFileSync(await download.path(), 'utf8'));
    await page.goto(`${base}/#/team`);
    const upload = page.locator('input[type=file]');
    await upload.setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
    await page.getByRole('alert').waitFor();
    assert((await page.getByRole('alert').innerText()).includes('JSON'));
    assert.equal(await page.locator('.team-table tbody tr').count(), 8);
    Object.assign(fixture, {
      id: 'f0000000-0000-4000-8000-000000000001',
      participant: { name: 'Тестовый Участник', position: 'Прораб', experience: '3–5 лет' },
      createdAt: '2026-10-19T02:00:00.000Z', durationSec: 150,
      perQuestionSec: Object.fromEntries(Object.keys(fixture.answers).map(id => [id, 10])),
      mode: 'quest', helmetColor: '#1668B8', indicators: { schedule: 100 },
    });
    await upload.setInputFiles({ name: 'wrong-version.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...fixture, methodologyVersion: '2.0' })) });
    await page.getByRole('alert').getByText('Версия методики в файле не поддерживается. Нужна версия 1.0.', { exact: true }).waitFor();
    const file = { name: 'result.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)) };
    await upload.setInputFiles(file);
    await page.getByRole('status').getByText('Результат импортирован. Профиль пересчитан по ответам.', { exact: true }).waitFor();
    assert.equal(await page.locator('.team-table tbody tr').count(), 9);
    await upload.setInputFiles(file);
    await page.getByRole('status').waitFor();
    assert.equal(await page.locator('.team-table tbody tr').count(), 9);
    await page.reload();
    await page.locator('.team-table').getByRole('link', { name: 'Тестовый Участник', exact: true }).waitFor();
    const imported = await page.evaluate(() => JSON.parse(localStorage.getItem('bi-profile:v1:results'))[0]);
    assert.equal(imported.id, fixture.id);
    assert(!('indicators' in imported));
    await page.locator('.team-table').getByRole('link', { name: 'Тестовый Участник', exact: true }).click();
    await page.locator('.manager-sidebar').waitFor();
    assert.equal(await page.locator('.demo-badge').count(), 0);
    assert.equal(await page.locator('.manager-sidebar .archetype-avatar').getAttribute('data-helmet-color'), '#1668B8');
    await noGameMetrics(page);
    await page.goto(`${base}/#/method`);
    await page.getByRole('heading', { name: 'Методика', exact: true }).waitFor();
    assert.equal(await page.locator('.coverage-table tbody tr').count(), 15);
    assert.deepEqual(await page.locator('.coverage-table tfoot td').allTextContents(), ['34', '33', '33', '33']);
    await page.getByRole('heading', { name: 'Почему игра не искажает оценку', exact: true }).waitFor();
    await page.getByText('Требует развития', { exact: true }).waitFor();
    assert((await page.locator('.method-limitations').innerText()).includes('α Кронбаха'));
    await screenshot(page, `method-${width}`);
    await page.goto(`${base}/#/manager/missing`);
    await page.getByRole('heading', { name: 'Результат не найден', exact: true }).waitFor();
    await noOverflow(page);
    report(`${width}px: landing/classic form, 8-person heatmap, average/groups, manager growth/fall/first attempt, JSON validation/dedup/persistence, helmet color, no game metrics, method coverage`);
    await context.close();
  }
  assert.deepEqual(errors, []);
  report('zero browser errors and warnings');
} finally {
  writeFileSync(`${dir}/dashboard-browser-report.json`, JSON.stringify({ checks, errors }, null, 2));
  await browser.close();
}
