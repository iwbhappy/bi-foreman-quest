import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const appRoot = fileURLToPath(new URL('../../', import.meta.url));
export const projectRoot = path.resolve(appRoot, '..');
export const artRoot = path.join(projectRoot, 'art');
export const manifestPath = fileURLToPath(new URL('./manifest.json', import.meta.url));
export const loadManifest = async () => JSON.parse(await readFile(manifestPath, 'utf8'));
export const rawPath = (entry) => path.join(projectRoot, entry.rawPath);
