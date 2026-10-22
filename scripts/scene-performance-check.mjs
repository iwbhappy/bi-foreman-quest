import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { fixtures, launch, progressAt, seed, choose } from './scene-qa.mjs';
const before = JSON.parse(readFileSync('artifacts/scene/bundle-before.json', 'utf8'));
const after = JSON.parse(readFileSync('artifacts/scene/bundle-after.json', 'utf8'));
const lhBefore = JSON.parse(readFileSync('artifacts/scene/lighthouse-before.json', 'utf8'));
const lhAfter = JSON.parse(readFileSync('artifacts/scene/lighthouse-after.json', 'utf8'));
assert.deepEqual(before.hashes, after.hashes);
assert(after.totalGzip - before.totalGzip <= 70 * 1024);
const scoreBefore = Math.round(lhBefore.categories.performance.score * 100);
const scoreAfter = Math.round(lhAfter.categories.performance.score * 100);
assert(scoreAfter >= scoreBefore - 5);
const browser = await launch();
let frames;
try {
  const { questions, defaultSkin } = await fixtures();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await seed(page, progressAt(questions, defaultSkin, 0));
  await page.evaluate(() => document.fonts.ready);
  await choose(page, questions[0], 'C');
  frames = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const times = [];
        const start = performance.now();
        let previous = start;
        function tick(now) {
          times.push(now - previous);
          previous = now;
          if (now - start < 4000) requestAnimationFrame(tick);
          else {
            const sorted = [...times].sort((a, b) => a - b);
            resolve({
              frames: times.length,
              durationMs: now - start,
              averageFps: +((times.length * 1000) / (now - start)).toFixed(1),
              medianFrameMs: +sorted[Math.floor(sorted.length / 2)].toFixed(2),
            });
          }
        }
        requestAnimationFrame(tick);
      }),
  );
} finally {
  await browser.close();
}
const report = {
  jsGzipBefore: before.totalGzip,
  jsGzipAfter: after.totalGzip,
  jsGzipGrowth: after.totalGzip - before.totalGzip,
  lighthouse: {
    version: lhAfter.lighthouseVersion,
    url: lhAfter.requestedUrl,
    formFactor: lhAfter.configSettings.formFactor,
    before: scoreBefore,
    after: scoreAfter,
    lcpBeforeMs: lhBefore.audits['largest-contentful-paint'].numericValue,
    lcpAfterMs: lhAfter.audits['largest-contentful-paint'].numericValue,
  },
  frames,
  protectedHashesIdentical: true,
  allBudgetsPassed: true,
};
writeFileSync('artifacts/scene/performance-summary.json', JSON.stringify(report, null, 2));
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
