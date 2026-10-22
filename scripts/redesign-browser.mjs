import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { fixtures, launch, base, progressAt, seed, choose } from './scene-qa.mjs';

const phase = process.argv[2] ?? 'after';
if (!['before', 'after'].includes(phase)) throw new Error('Expected before or after');
const directory = process.env.BI_ARTIFACT_DIR ?? `artifacts/redesign/${phase}`;
await mkdir(directory, { recursive: true });
const { questions, records, defaultSkin } = await fixtures();
const browser = await launch();
const errors = [], checks = [];
const record = records.find((item) => item.id === '10000000-0000-4000-8000-000000000012') ?? records[0];
try {
  for (const width of [1440, 390, ...(phase === 'after' ? [360] : [])]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    const shot = async (name) => {
      await page.evaluate(async () => {
        const original = scrollY;
        window.scrollTo(0, document.body.scrollHeight);
        document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
        await new Promise((resolve) => setTimeout(resolve, 100));
        window.scrollTo(0, original);
      });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
      });
      await page.waitForTimeout(150);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (phase === 'after') {
        const audit = await page.evaluate(() => {
          const small = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode, element = node.parentElement;
            if (!element || !node.textContent.trim() || ['SCRIPT','STYLE'].includes(element.tagName)) continue;
            const style = getComputedStyle(element);
            if (element.getClientRects().length && style.visibility !== 'hidden'
              && parseFloat(style.fontSize) < 13) small.push({ text: node.textContent.slice(0, 60),
                size: style.fontSize, class: element.className?.baseVal ?? element.className });
          }
          return { emoji: document.body.innerText.match(/\p{Extended_Pictographic}/gu), small };
        });
        assert.deepEqual(audit.emoji, null, name + ' emoji');
        assert.deepEqual(audit.small, [], name + ' small text: ' + JSON.stringify(audit.small));
      }
      if (width !== 360) await page.screenshot({ path: `${directory}/${name}-${width}.png`, fullPage: true });
      checks.push(`${width} ${name}`);
    };
    await page.goto(base);
    await shot('landing');
    await page.goto(`${base}/#/quest/start`);
    await shot('create');
    const skin = { ...defaultSkin, helmet: 'blue' };
    await seed(page, progressAt(questions, skin, 0));
    await shot('scene-before');
    await choose(page, questions[0], 'C');
    await shot('scene-after');
    await seed(page, progressAt(questions, skin, 3));
    await shot('mentor');
    const report = { ...progressAt(questions, skin, 14), answers: record.answers,
      stage: 'report', resultId: record.id };
    await page.evaluate((value) => localStorage.setItem('bi-profile:v1:quest-progress', JSON.stringify(value)), report);
    await page.goto(`${base}/#/quest/report`);
    await shot('report');
    await page.getByRole('button', { name: 'Узнать, кто вы', exact: true }).click();
    await page.locator('.hero-reveal[data-revealed=true]').waitFor();
    await shot('reveal');
    for (const [route, name] of [[`result/${record.id}`, 'profile'], [`manager/${record.id}`, 'manager'],
      ['team', 'team'], ['method', 'method']]) {
      await page.goto(`${base}/#/${route}`);
      await shot(name);
      if (phase === 'after' && width === 1440 && ['profile', 'manager'].includes(name)) {
        await page.pdf({ path: `${directory}/${name}.pdf`, format: 'A4', printBackground: true });
      }
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await writeFile(`${directory}/checks.json`, JSON.stringify({ checks, errors }, null, 2) + '\n');
}
console.log(`${phase}: ${checks.length} screens checked, no horizontal overflow or runtime errors`);
