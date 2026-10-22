import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fixtures, launch, base, dir, progressAt, seed, choose } from './scene-qa.mjs';
mkdirSync(dir, { recursive: true });
const { questions, records, defaultSkin } = await fixtures();
const browser = await launch();
const checks = [],
  errors = [];
const pass = (label) => {
  checks.push(label);
  process.stdout.write(`PASS ${label}\n`);
};
async function shot(page, name, live = false) {
  if (name.startsWith('create-')) await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => document.fonts.ready);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true, ...(live ? {} : { animations: 'disabled' }) });
}
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      locale: 'ru-RU',
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (['warning', 'error'].includes(message.type())) errors.push(message.text());
    });
    await page.goto(`${base}/#/quest/start`);
    await page.getByRole('button', { name: 'Случайный герой', exact: true }).waitFor();
    assert.equal(await page.locator('.skin-designer fieldset').count(), 2);
    assert.equal(await page.locator('.skin-helmet input').count(), 6);
    assert.equal(await page.locator('.skin-theme input').count(), 4);
    assert.equal(await page.getByRole('switch').count(), 0);
    await page.getByRole('radio', { name: 'Синяя', exact: true }).locator('..').click();
    await shot(page, `create-skin-1-${width}`);
    await page.getByRole('radio', { name: 'Красная', exact: true }).locator('..').click();
    await shot(page, `create-skin-2-${width}`);
    await page.getByRole('button', { name: 'Случайный герой', exact: true }).click();
    await page.getByRole('button', { name: 'Случайный герой', exact: true }).waitFor({ state: 'visible' });
    await page.waitForTimeout(650);
    const skin = { ...defaultSkin, helmet: 'blue' };
    await seed(page, progressAt(questions, skin, 0));
    assert.equal(await page.locator('.quest-stage').getAttribute('aria-hidden'), 'true');
    const stageBox = await page.locator('.quest-stage').boundingBox();
    if (width === 1440) {
      const panel = page.locator('.quest-controls');
      assert.equal(await page.locator('.quest-stage').evaluate((node) => getComputedStyle(node).position), 'sticky');
      assert(stageBox.x > 600);
      await panel.evaluate((node) => (node.scrollTop = 450));
      const after = await page.locator('.quest-stage').boundingBox();
      assert.equal(after.y, stageBox.y);
      assert.equal(after.height, stageBox.height);
      await panel.evaluate((node) => (node.scrollTop = 0));
    } else assert.equal(Math.round(stageBox.height), 300);
    await shot(page, `scene-before-${width}`);
    await choose(page, questions[0], 'C');
    await page.locator('.quest-stage[data-playing=true]').waitFor();
    assert(await page.getByRole('button', { name: 'Дальше', exact: true }).isDisabled());
    await page.waitForTimeout(700);
    await shot(page, `scene-event-${width}`, true);
    await page.keyboard.press('Space');
    await page.locator('.quest-stage[data-playing=false]').waitFor();
    await page.getByRole('button', { name: 'Дальше', exact: true }).waitFor();
    assert.equal(await page.locator('.decision-stamp').innerText(), 'РЕШЕНИЕ ПРИНЯТО');
    assert.equal(
      await page
        .locator('.quest-choice.locked:not(.selected)')
        .first()
        .evaluate((node) => getComputedStyle(node).opacity),
      '0.45',
    );
    await shot(page, `scene-after-${width}`);
    await page.reload();
    assert.equal(await page.locator('.quest-stage').getAttribute('data-playing'), 'false');
    await seed(page, progressAt(questions, skin, 1));
    await choose(page, questions[1], 'D');
    await page.getByRole('button', { name: 'Пропустить анимацию', exact: true }).click();
    assert(await page.getByRole('button', { name: 'Дальше', exact: true }).isEnabled());
    await seed(page, progressAt(questions, skin, 4));
    await shot(page, `violation-q05-${width}`);
    await choose(page, questions[4], 'C');
    await page.locator('.quest-stage').click({ position: { x: 10, y: 10 } });
    assert(await page.getByRole('button', { name: 'Дальше', exact: true }).isEnabled());
    await seed(page, progressAt(questions, skin, 5, { q05: 'C' }));
    await page.locator('.quest-callback').waitFor();
    await shot(page, `echo-${width}`, true);
    assert.equal(await page.locator('.stage-npc').count(), 2);
    await seed(page, progressAt(questions, skin, 3));
    await shot(page, `mentor-${width}`);
    for (const theme of ['bright', 'strict', 'calm', 'tech']) {
      await seed(page, progressAt(questions, { ...skin, theme }, 6));
      await shot(page, `theme-${theme}-${width}`);
    }
    await seed(page, progressAt(questions, skin, 14));
    await choose(page, questions[14]);
    await page.keyboard.press('Space');
    await page.getByRole('button', { name: 'Дальше', exact: true }).click();
    await page.getByRole('button', { name: 'Узнать, кто вы', exact: true }).click();
    await page.locator('.hero-reveal[data-revealed=true]').waitFor();
    await page.waitForTimeout(1500);
    await shot(page, `reveal-${width}`);
    assert.equal(await page.locator('.reveal-traits>p').count(), 2);
    assert.deepEqual(
      JSON.parse(await page.locator('.revealed-avatar .hero-silhouette').getAttribute('data-skin')),
      skin,
    );
    await page.getByRole('button', { name: 'Открыть мой профиль', exact: true }).click();
    await page.locator('.navy-chips').waitFor();
    assert.equal(await page.locator('.navy-chips p').count(), 2);
    await page.waitForTimeout(1100);
    await shot(page, `profile-main-${width}`);
    assert.deepEqual(JSON.parse(await page.locator('.result-hero .archetype-avatar').getAttribute('data-skin')), skin);
    if (width === 1440) {
      await page.emulateMedia({ media: 'print' });
      assert.deepEqual(JSON.parse(await page.locator('.result-hero .archetype-avatar').getAttribute('data-skin')), skin);
      await page.pdf({ path: `${dir}/skin-profile.pdf`, format: 'A4', printBackground: true });
      await page.emulateMedia({ media: 'screen' });
    }
    await page.goto(`${base}/#/manager/${records[1].id}`);
    await page.locator('.main-change').waitFor();
    assert((await page.locator('.main-change').innerText()).includes('Уверенность в себе ▲ +10'));
    await shot(page, `manager-main-change-${width}`);
    pass(
      `${width}px: skin designer, sticky desktop/300px mobile, events, three skip methods, reload final, exact echo, q05, mentor, four themes, reveal skin, profile highlights, main manager change`,
    );
    await context.close();
  }
  for (const width of [900, 1100]) {
    const session = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await session.newPage();
    await seed(page, progressAt(questions, defaultSkin, 0));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const stage = await page.locator('.quest-stage').boundingBox();
    if (width === 900) assert.equal(Math.round(stage.height), 440);
    else {
      const actor = await page.locator('.stage-hero').boundingBox();
      assert(actor.x >= stage.x - 3);
      assert(actor.x + actor.width <= stage.x + stage.width);
    }
    await page.keyboard.press('1');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.consequence-card').count(), 1);
    await session.close();
  }
  pass('900px tablet: 440px stage; 1100px desktop: visible hero, keyboard 1/Enter and no overflow');
  const context = await browser.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await seed(page, progressAt(questions, defaultSkin, 0));
  for (const question of questions) {
    if (question.type === 'situation') {
      await choose(page, question);
      assert.equal(await page.locator('.quest-stage').getAttribute('data-playing'), 'false');
    } else await page.getByRole('radio').nth(3).locator('..').click();
    await page.getByRole('button', { name: 'Дальше', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Узнать, кто вы', exact: true }).click();
  await page.locator('.hero-reveal[data-revealed=true]').waitFor();
  const moving = await page.evaluate(
    () => document.getAnimations().filter((animation) => animation.playState === 'running').length,
  );
  assert.equal(moving, 0);
  pass('390px reduced-motion: full 15-scene shift and immediate reveal, zero running animations');
  await context.close();
  assert.deepEqual(errors, []);
  pass('zero browser errors and warnings');
} finally {
  writeFileSync(`${dir}/scene-browser-report.json`, JSON.stringify({ checks, errors }, null, 2));
  await browser.close();
}
