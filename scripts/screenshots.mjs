import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { fixtures, launch, base, seed, progressAt, choose } from './scene-qa.mjs';
const { questions, records, defaultSkin } = await fixtures();
const record = records.find((item) => item.id.endsWith('000000000012'));
const skin = { ...defaultSkin, helmet: 'orange', theme: 'bright' };
await mkdir('screenshots', { recursive: true });
const browser = await launch();
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 },
      reducedMotion: 'reduce' });
    await context.route('**/api/health', (route) => route.fulfill({ json: { ai: false } }));
    await context.route('**/api/analyze', (route) => route.fulfill({ status: 503, json: {} }));
    const page = await context.newPage();
    const shot = async (name, locator) => {
      await page.evaluate(async () => {
        await document.fonts.ready;
        document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
        await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
      });
      await page.waitForTimeout(150);
      const path = `screenshots/${name}${width === 390 ? '-mobile' : ''}.png`;
      if (locator) await locator.screenshot({ path }); else await page.screenshot({ path });
    };
    await page.goto(base);
    await shot('01-landing');
    await page.goto(`${base}/#/quest/start`);
    await page.getByRole('radio', { name: 'Оранжевая', exact: true }).check();
    await page.getByRole('radio', { name: 'Яркий', exact: true }).check();
    await shot('02-hero-start');
    await seed(page, progressAt(questions, skin, 1, record.answers));
    await shot('03-scene');
    await choose(page, questions[1], 'A');
    await page.locator('.consequence-card').waitFor();
    await shot('04-consequence');
    await seed(page, progressAt(questions, skin, 3, record.answers));
    await shot('05-mentor');
    const report = { ...progressAt(questions, skin, 14), answers: record.answers,
      stage: 'report', resultId: record.id };
    await page.evaluate((value) => localStorage.setItem('bi-profile:v1:quest-progress', JSON.stringify(value)), report);
    await page.goto(`${base}/#/quest/report`);
    await shot('06-shift-report');
    await page.getByRole('button', { name: 'Узнать, кто вы', exact: true }).click();
    await page.locator('.hero-reveal[data-revealed=true]').waitFor();
    await shot('07-hero-reveal');
    for (const [route, name] of [[`result/${record.id}`, '08-result'], [`manager/${record.id}`, '09-manager-card'],
      ['team', '10-team']]) {
      await page.goto(`${base}/#/${route}`);
      await shot(name);
    }
    await page.goto(`${base}/#/method`);
    await page.getByRole('heading', { name: 'Почему здесь нет правильных ответов', exact: true }).scrollIntoViewIfNeeded();
    await shot('11-method');
    await page.goto(base);
    await page.evaluate(() => {
      const gallery = document.querySelector('.hero-gallery').cloneNode(true);
      document.body.replaceChildren(gallery);
      document.body.style.padding = '24px';
    });
    await shot('12-avatars', page.locator('.hero-gallery'));
    await context.close();
  }
} finally { await browser.close(); }
const names = ['01-landing', '02-hero-start', '03-scene', '04-consequence', '05-mentor', '06-shift-report',
  '07-hero-reveal', '08-result', '09-manager-card', '10-team', '11-method', '12-avatars'];
const tiles = await Promise.all(names.map(async (name, index) => ({
  input: await sharp(`screenshots/${name}.png`).resize(360, 225, { fit: 'contain', background: '#F5F8FB' }).png().toBuffer(),
  left: (index % 3) * 360, top: Math.floor(index / 3) * 225,
})));
await sharp({ create: { width: 1080, height: 900, channels: 4, background: '#F5F8FB' } })
  .composite(tiles).png().toFile('artifacts/ai/screenshots-contact.png');
console.log('Prepared 12 desktop + 12 mobile screenshots and the contact sheet.');
