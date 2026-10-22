import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const base = process.env.BI_PREVIEW_URL || 'http://127.0.0.1:5173';
const dir = process.env.BI_ARTIFACT_DIR || 'artifacts/scene/regression';
mkdirSync(dir, { recursive: true });
const questionsSource = readFileSync('src/data/questions.ts', 'utf8');
const questions = JSON.parse(
  questionsSource.slice(questionsSource.indexOf('= ') + 2, questionsSource.lastIndexOf(';')),
);
const questSource = readFileSync('src/data/quest.ts', 'utf8');
const questData = (name) => {
  const part = questSource.slice(questSource.indexOf(`export const ${name}`));
  const next = part.indexOf('export const ', 1);
  const declaration = (next < 0 ? part : part.slice(0, next)).trim();
  return JSON.parse(declaration.slice(declaration.indexOf('= ') + 2, -1));
};
const consequences = questData('CONSEQUENCES');
const callbacks = questData('CALLBACKS');
const epilogues = questData('EPILOGUES');
const mentorNarrations = questData('MENTOR_NARRATIONS');
const mentorSpeech = questData('MENTOR_INTROS');
const initial = () => ({ schedule: 80, quality: 30, safety: 60, team: 65 });
const apply = (state, delta) =>
  Object.fromEntries(Object.keys(state).map((id) => [id, Math.min(100, Math.max(0, state[id] + (delta[id] || 0)))]));
const path =
  process.env.BI_BROWSER_PATH ||
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].find(existsSync);
const browser = await chromium.launch({ headless: true, ...(path ? { executablePath: path } : {}) });
const checks = [];
const errors = [];
const results = [];
function pass(label) {
  checks.push(label);
  process.stdout.write(`PASS ${label}\n`);
}
function observe(page) {
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) errors.push(msg.text());
  });
}
async function progress(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('bi-profile:v1:quest-progress')));
}
async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true, animations: 'disabled' });
}
async function noOverflow(page) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
}
async function meterValues(page) {
  return page
    .locator('.quest-hud [role=meter]')
    .evaluateAll((nodes) =>
      Object.fromEntries(
        nodes.map((node) => [node.getAttribute('aria-label'), Number(node.getAttribute('aria-valuenow'))]),
      ),
    );
}
async function createHero(page, color = 'Синяя') {
  await page.getByLabel('Имя (необязательно)').fill('Айдос Нурланов');
  await page.getByLabel('Должность', { exact: true }).selectOption('Прораб');
  await page.getByLabel('Стаж в строительстве').selectOption('3–5 лет');
  await page.getByRole('radio', { name: color, exact: true }).locator('..').click();
}

try {
  for (const width of [360, 1440]) {
    const reduced = width === 360;
    const color = width === 360 ? 'Синяя' : 'Жёлтая';
    const hex = width === 360 ? '#1668B8' : '#F2C230';
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: reduced ? 'reduce' : 'no-preference',
      locale: 'ru-RU',
      timezoneId: 'Asia/Qyzylorda',
    });
    const page = await context.newPage();
    observe(page);
    await page.goto(base);
    await page.getByRole('link', { name: 'Начать смену', exact: true }).click();
    await page.getByRole('heading', { name: 'Создание героя', exact: true }).waitFor();
    await createHero(page, color);
    assert.equal(await page.locator('.hero-silhouette').getAttribute('data-helmet-color'), hex);
    await noOverflow(page);
    await shot(page, `hero-start-${width}`);
    await page.getByRole('button', { name: 'Выйти на смену', exact: true }).click();
    let indicators = initial();
    const answers = {};
    const choiceId = width === 360 ? 'A' : 'B';
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];
      await page.getByText(`Сцена ${index + 1}/15`, { exact: true }).waitFor();
      await noOverflow(page);
      assert.equal(await page.locator('[data-floor]').count(), index);
      assert.equal(await page.getByRole('button', { name: 'Назад', exact: true }).count(), 0);
      const callback = callbacks.find((item) => item.atQuestionId === question.id);
      if (callback)
        assert.equal(
          await page.locator('.quest-callback > p').innerText(),
          callback.textByOption[answers[callback.dependsOn]],
        );
      if (index === 0) {
        if (width === 360) assert.equal(Math.round((await page.locator('.quest-stage').boundingBox()).height), 300);
        if (width === 1440) {
          assert.equal(await page.locator('.quest-stage').evaluate(node => getComputedStyle(node).position), 'sticky');
          const before = await page.locator('.quest-stage').boundingBox();
          await page.locator('.quest-controls').evaluate(node => node.scrollTop = 400);
          assert.equal((await page.locator('.quest-stage').boundingBox()).y, before.y);
          await page.locator('.quest-controls').evaluate(node => node.scrollTop = 0);
        }
        const animation = await page.locator('.stage-hook').evaluate((node) => getComputedStyle(node).animationName);
        assert.equal(animation === 'none', reduced);
        if (width === 360) {
          assert.equal(await page.locator('.hud-indicator').count(), 4);
        }
        await shot(page, `scene-before-${width}`);
      }
      if (question.type === 'situation') {
        if (question.id === 'q12') {
          assert.equal(await page.locator('.stage-location-label').innerText(), 'Офис ПТО');
          assert((await page.locator('.npc-name').innerText()).includes('Жанна'));
        }
        assert.equal(await page.locator('.question-heading').innerText(), question.scene);
        const options = page.getByRole('radio');
        assert.deepEqual(
          (await options.evaluateAll((nodes) => nodes.map((n) => n.getAttribute('aria-label')))).sort(),
          question.options.map((o) => o.text).sort(),
        );
        const order = await options.evaluateAll((nodes) => nodes.map((n) => n.value));
        const before = await meterValues(page);
        const chosen = question.options.find((option) => option.id === choiceId);
        await page.getByRole('radio', { name: chosen.text, exact: true }).locator('..').click();
        assert.equal(await page.locator('.consequence-card').count(), 0);
        assert.deepEqual(await meterValues(page), before);
        await page.getByRole('button', { name: 'Принять решение', exact: true }).click();
        if (!reduced) {
          assert.equal(await page.locator('.quest-stage').getAttribute('data-playing'), 'true');
          assert(await page.getByRole('button', { name: 'Дальше', exact: true }).isDisabled());
          await page.keyboard.press('Space');
        }
        const consequence = consequences.find((item) => item.questionId === question.id && item.optionId === choiceId);
        await page.locator('.consequence-card').waitFor();
        assert.equal(await page.locator('.consequence-card > p').innerText(), consequence.text);
        indicators = apply(indicators, consequence.deltas);
        assert.equal(await page.locator('[data-floor]').count(), index + 1);
        const actual = Object.values(await meterValues(page));
        assert.deepEqual(actual, Object.values(indicators));
        if (index === 0 || index === 14) {
          const beforeReload = await progress(page);
          await page.waitForTimeout(500);
          await page.reload();
          await page.locator('.consequence-card').waitFor();
          await page.keyboard.press('2');
          const restored = await progress(page);
          assert.equal(restored.answers[question.id], choiceId);
          assert.equal(restored.perQuestionSec[question.id], beforeReload.perQuestionSec[question.id]);
          assert.equal(restored.consequenceShown, true);
          assert.equal(await options.evaluateAll((nodes) => nodes.every((node) => node.disabled)), true);
          assert.deepEqual(await options.evaluateAll((nodes) => nodes.map((n) => n.value)), order);
          if (index === 0) await shot(page, `scene-after-${width}`);
        }
        answers[question.id] = choiceId;
      } else {
        assert.equal(await page.locator('.npc-bubble').innerText(), `«${mentorSpeech[question.id]}»`);
        if (mentorNarrations[question.id]) {
          assert.equal(await page.locator('.mentor-narration').innerText(), mentorNarrations[question.id]);
          assert.equal(await page.locator('.mentor-narration').evaluate(node => getComputedStyle(node).fontStyle), 'italic');
        } else assert.equal(await page.locator('.mentor-narration').count(), 0);
        assert.equal(await page.locator('.mentor-statement').innerText(), `«${question.statement}»`);
        await page.getByRole('radio').nth(3).locator('..').click();
        assert.equal(await page.locator('.consequence-card').count(), 0);
        answers[question.id] = 3;
        if (question.id === 'q04') await shot(page, `mentor-${width}`);
      }
      const next = page.getByRole('button', { name: 'Дальше', exact: true });
      assert.equal(await next.locator('svg').count(), 1);
      assert.equal(await next.innerText(), 'Дальше');
      await next.click();
    }
    await page.getByRole('heading', { name: 'Смена закрыта · 19:00', exact: true }).waitFor();
    assert.equal(await page.locator('.shift-journal li').count(), 11);
    assert.equal(await page.locator('[data-floor]').count(), 15);
    const epilogueOrder = ['safety', 'quality', 'team', 'schedule'];
    const best = [...epilogueOrder].sort((a, b) => indicators[b] - indicators[a])[0];
    assert.equal(await page.locator('.shift-epilogue h3').innerText(), epilogues[best]);
    const journal = page.locator('.shift-journal li');
    let row = 0;
    for (const question of questions.filter((q) => q.type === 'situation')) {
      const option = question.options.find((o) => o.id === answers[question.id]);
      assert((await journal.nth(row++).innerText()).includes(option.text));
    }
    await noOverflow(page);
    await shot(page, `shift-report-${width}`);
    const saved = await progress(page);
    assert.deepEqual(saved.answers, answers);
    await page.reload();
    await page.getByRole('button', { name: 'Узнать, кто вы', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Узнать, кто вы', exact: true }).click();
    if (!reduced) {
      assert.equal(await page.locator('.hero-reveal').getAttribute('data-revealed'), 'false');
      await shot(page, `reveal-silhouette-${width}`);
    }
    await page
      .getByRole('heading', { name: width === 360 ? 'Медведь-наставник' : 'Бобр-стратег', exact: true })
      .waitFor();
    assert.equal(await page.locator('.revealed-avatar').getAttribute('data-helmet-color'), hex);
    assert((await page.locator('.revealed-avatar image').getAttribute('href'))
      .endsWith('/' + (width === 360 ? 'blue' : 'yellow') + '.webp'));
    await noOverflow(page);
    await shot(page, `hero-reveal-${width}`);
    await page.getByRole('button', { name: 'Открыть мой профиль', exact: true }).click();
    await page.waitForURL('**/#/result/**');
    await page.getByRole('heading', { name: 'План на 30 дней', exact: true }).waitFor();
    const record = await page.evaluate(() => JSON.parse(localStorage.getItem('bi-profile:v1:results'))[0]);
    assert.equal(record.mode, 'quest');
    assert.equal(record.helmetColor, hex);
    assert.deepEqual(
      record.percents,
      width === 360
        ? { critical: 47, confidence: 79, discipline: 26, engagement: 63 }
        : { critical: 47, confidence: 44, discipline: 70, engagement: 34 },
    );
    for (const key of ['indicators', 'schedule', 'quality', 'safety', 'team', 'journal']) assert(!(key in record));
    assert.equal(await page.locator('.result-hero .archetype-avatar').getAttribute('data-helmet-color'), hex);
    assert((await page.locator('.result-hero img').getAttribute('src'))
      .endsWith('/' + (width === 360 ? 'blue' : 'yellow') + '-avatar.webp'));
    assert.equal(await page.locator('.result-hero').getByText('Сроки', { exact: true }).count(), 0);
    results.push({ width, reducedMotion: reduced, result: record, indicators });
    await shot(page, `quest-result-${width}`);
    await page.reload();
    assert.equal(await page.locator('.result-hero').getByText(record.archetype.name, { exact: true }).innerText(), record.archetype.name);
    pass(
      `${width}px: full shift, exact question content, frozen answers/reload, 15 floors, HUD, callbacks, 11-entry journal, epilogue, reveal/helmet, scoring parity`,
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
  pass('reduced-motion: animations off and immediate reveal on 360px; animated reveal on desktop');
  pass('zero browser errors or warnings');
} finally {
  writeFileSync(`${dir}/quest-browser-report.json`, JSON.stringify({ checks, errors, results }, null, 2));
  await browser.close();
}
