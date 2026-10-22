import sharp from 'sharp';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { appRoot } from './paths.mjs';
export async function encodeArt(input, publicPath) {
  const output = path.join(appRoot, publicPath);
  await mkdir(path.dirname(output), { recursive: true });
  const { width, height } = await sharp(input).metadata();
  await sharp(input).resize(600, 900, { fit: 'contain', position: 'south', background: '#00000000' })
    .webp({ quality: 86, effort: 6 }).toFile(output);
  let square = sharp(input);
  if (height < width) square = square.extend({ bottom: width - height, background: '#00000000' });
  const padded = await square.png().toBuffer();
  await sharp(padded).extract({ left: 0, top: 0, width, height: width }).resize(256, 256)
    .webp({ quality: 86, effort: 6 }).toFile(output.replace('.webp', '-avatar.webp'));
}
