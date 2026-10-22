import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const canvas = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
<rect width="1200" height="630" fill="#0B3B6F"/>
<g font-family="Arial,sans-serif" fill="white">
<text x="64" y="100" font-size="22" font-weight="700">BI ACADEMY</text>
<text x="64" y="245" font-size="76" font-weight="800">Квест</text>
<text x="64" y="332" font-size="76" font-weight="800">прораба</text>
<text x="64" y="415" font-size="27" fill="#D6E2EE">Профиль качеств сотрудника</text>
<text x="64" y="458" font-size="27" fill="#D6E2EE">BI Academy</text>
</g><rect x="64" y="525" width="96" height="5" fill="#F28C28"/></svg>`);
const sources = [
  ['public/art/hero/mystery-orange.webp', 625, 180, 180, 360],
  ['public/art/archetypes/critical-discipline/orange.webp', 810, 230, 170, 310],
  ['public/art/archetypes/universal/blue.webp', 980, 170, 190, 370],
];
const layers = await Promise.all(sources.map(async ([source, left, top, width, height]) => ({ left, top,
  input: await sharp(source).resize(width, height, { fit: 'contain', background: '#00000000' }).png().toBuffer() })));
await sharp(canvas).composite(layers).png().toFile('public/og-image.png');
await writeFile('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path fill="#F28C28" d="M9 40a23 23 0 0 1 46 0v5H9z"/>
<rect x="4" y="42" width="56" height="11" rx="5" fill="#F28C28"/>
<path d="M18 35a16 16 0 0 1 9-13" fill="none" stroke="#FFF3E6" stroke-width="5" stroke-linecap="round"/>
<path d="M32 16v23" stroke="#D16D12" stroke-width="3"/></svg>\n`);
console.log('Prepared og-image.png and favicon.svg from the existing artwork; no image API calls.');
