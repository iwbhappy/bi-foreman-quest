import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fixtures, launch, base } from '../scene-qa.mjs';
const directory = 'artifacts/ai';
await mkdir(directory, { recursive: true });
const own = JSON.parse(await readFile(`${directory}/own-result.json`, 'utf8'));
const mock = { analysis: JSON.parse(await readFile('src/tests/fixtures/aiAnalysis.json', 'utf8')),
  model: 'gpt-5.4-mini-2026-03-17', promptVersion: '1', cached: false };
const browser = await launch();
const errors = [], checks = [], pdfChecks = [];
async function pdf(page, name) {
  const data = await page.pdf({ path: `${directory}/${name}.pdf`, format: 'A4', printBackground: true });
  const pages = (data.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length;
  assert(pages >= 1 && pages <= 2, `${name}: ${pages} A4 pages`);
  pdfChecks.push({ name, pages });
}
async function seed(page, record, analysis) {
  await page.goto(base);
  await page.evaluate(({ record, analysis }) => {
    localStorage.setItem('bi-profile:v1:results', JSON.stringify([record]));
    if (analysis) localStorage.setItem(`bi-profile:v1:analysis:${record.id}`, JSON.stringify(analysis));
  }, { record, analysis });
}
async function routes(context, enabled = true) {
  await context.route('**/api/health', (route) => route.fulfill({ json: { ai: enabled } }));
  await context.route('**/api/team-analyze', async (route) => {
    const payload = route.request().postDataJSON();
    assert(!JSON.stringify(payload).includes(own.participant.name));
    const demo = JSON.parse(await readFile('src/data/demoTeamAnalysis.json', 'utf8'));
    await route.fulfill({ json: demo });
  });
}
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await routes(context);
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    let mode = 'slow', calls = 0, release;
    await context.route('**/api/analyze', async (route) => {
      calls++;
      const payload = route.request().postDataJSON();
      assert.deepEqual(Object.keys(payload).sort(), ['answers', 'experience', 'position']);
      assert.equal(Object.keys(payload.answers).length, 15);
      assert(!JSON.stringify(payload).includes(own.participant.name));
      if (mode === 'slow') await new Promise((resolve) => { release = resolve; });
      await route.fulfill(mode === 'error' ? { status: 429, json: { error: 'Лимит — 6 AI-разборов в час. Попробуйте позже.' } }
        : { json: mock });
    });
    await seed(page, own);
    await page.goto(`${base}/#/result/${own.id}`);
    const block = page.locator('.ai-employee');
    await page.getByText('Разбираем ваши 15 решений… обычно 5–10 секунд', { exact: true }).waitFor();
    assert.equal(await page.locator('.ai-skeleton span').count(), 4);
    assert(await page.getByRole('heading', { name: 'Рекомендации', exact: true }).count());
    await block.screenshot({ path: `${directory}/loading-${width}.png` });
    await page.waitForFunction(() => document.querySelector('.ai-analysis')?.getAttribute('aria-busy') === 'true');
    while (!release) await page.waitForTimeout(10);
    mode = 'success'; release();
    await page.getByRole('heading', { name: mock.analysis.headline }).waitFor();
    for (const text of [mock.analysis.decisionStyle, mock.analysis.caveat,
      ...mock.analysis.strengths.flatMap((point) => [point.title, point.evidence]),
      ...mock.analysis.risks.flatMap((point) => [point.title, point.evidence]),
      ...mock.analysis.growthPlan.flatMap((step) => [step.action, step.why])]) {
      assert((await block.innerText()).includes(text), text);
    }
    assert.equal(calls, 1);
    assert.equal(await page.locator('.profile-radar').count(), 0);
    await page.reload();
    await page.getByRole('heading', { name: mock.analysis.headline }).waitFor();
    assert.equal(calls, 1);
    await block.getByRole('link', { name: 'Как это работает', exact: true }).click();
    await page.waitForURL('**/#/method#ai');
    await page.getByRole('heading', { name: 'Как работает AI-разбор' }).waitFor();
    await page.goto(`${base}/#/manager/${own.id}`);
    for (const tip of mock.analysis.managerTips) assert((await page.locator('.ai-manager').innerText()).includes(tip));
    assert.equal(calls, 1);
    const failed = { ...own, id: '20000000-0000-4000-8000-000000000002' };
    await seed(page, failed);
    mode = 'error';
    await page.goto(`${base}/#/result/${failed.id}`);
    await page.getByText('AI-разбор сейчас недоступен. Рекомендации ниже составлены по методике.', { exact: true }).waitFor();
    assert(await page.getByRole('heading', { name: 'Рекомендации', exact: true }).count());
    await page.locator('.ai-error').screenshot({ path: `${directory}/error-${width}.png` });
    mode = 'success';
    await page.getByRole('button', { name: 'Повторить', exact: true }).click();
    await page.getByRole('heading', { name: mock.analysis.headline }).waitFor();
    const before = calls;
    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Обновить разбор', exact: true }).click();
    assert.equal(calls, before);
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Обновить разбор', exact: true }).click();
    await page.getByRole('heading', { name: mock.analysis.headline }).waitFor();
    assert.equal(calls, before + 1);
    const manual = { ...own, id: '20000000-0000-4000-8000-000000000003' };
    await seed(page, manual);
    await page.goto(`${base}/#/manager/${manual.id}`);
    await page.getByRole('button', { name: 'Подготовить подсказки', exact: true }).click();
    await page.getByRole('heading', { name: mock.analysis.headline }).waitFor();
    await page.goto(`${base}/#/team`);
    await page.getByRole('button', { name: 'Пересчитать с моими результатами', exact: true }).click();
    assert(await page.getByRole('heading', { name: 'AI-анализ команды', exact: true }).count());
    checks.push(`${width}: auto/skeleton/content/cache/error429/retry/confirmed refresh/manager/manual/team/method anchor`);
    // Capture actual generated responses, not the stub used for behavioral checks.
    const { records } = await fixtures();
    for (const [label, record, file] of [
      ['aidos', records.find((item) => item.id.endsWith('000000000012')), 'real-10000000-0000-4000-8000-000000000012'],
      ['timur', records.find((item) => item.id.endsWith('000000000032')), 'real-10000000-0000-4000-8000-000000000032'],
      ['own', own, 'real-own'],
    ]) {
      const { response } = JSON.parse(await readFile(`${directory}/${file}.json`, 'utf8'));
      const priorRequests = calls;
      await seed(page, record, response);
      await page.goto(`${base}/#/result/${record.id}`);
      await page.locator('.ai-employee.ai-ready').waitFor();
      assert.equal(calls, priorRequests, 'Precomputed/cached real analysis must not request the API');
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images]
        .map((image) => image.decode().catch(() => {}))); });
      assert.equal(await page.locator('.profile-radar').count(), 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('.ai-employee').screenshot({ path: `${directory}/${label}-${width}.png` });
      await page.screenshot({ path: `${directory}/${label}-profile-${width}.png`, fullPage: true });
      if (width === 1440) await pdf(page, label);
      if (label === 'aidos') {
        await page.goto(`${base}/#/manager/${record.id}`);
        await page.locator('.ai-manager.ai-ready').waitFor();
        await page.screenshot({ path: `${directory}/manager-${width}.png`, fullPage: true });
        await page.locator('.ai-manager').screenshot({ path: `${directory}/manager-tips-${width}.png` });
        if (width === 1440) await pdf(page, 'manager');
      }
    }
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await routes(context, false);
  let requests = 0;
  await context.route('**/api/analyze', (route) => { requests++; return route.fulfill({ status: 503, json: {} }); });
  const page = await context.newPage();
  await seed(page, own);
  await page.goto(`${base}/#/result/${own.id}`);
  await page.getByRole('heading', { name: 'Рекомендации', exact: true }).waitFor();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('.ai-analysis').count(), 0);
  assert.equal(requests, 0);
  await context.close();
  assert.deepEqual(errors, []);
  checks.push('no key: AI hidden, no upstream request; all pages: no JS errors');
} finally {
  await browser.close();
  await writeFile(`${directory}/browser-checks.json`, JSON.stringify({ checks, errors }, null, 2) + '\n');
  await writeFile(`${directory}/pdf-checks.json`, JSON.stringify(pdfChecks, null, 2) + '\n');
}
console.log(checks.map((check) => 'PASS ' + check).join('\n'));
