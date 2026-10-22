import QRCode from 'qrcode';
import { mkdir, writeFile } from 'node:fs/promises';
const value = process.argv[2];
let url;
try { url = new URL(value); } catch { throw new Error('Pass the final HTTPS application URL.'); }
if (url.protocol !== 'https:' || url.username || url.password || value.includes('<') || value.includes('{{')) {
  throw new Error('Pass the final public HTTPS application URL, without placeholders or credentials.');
}
await mkdir('screenshots', { recursive: true });
const options = { errorCorrectionLevel: 'M', margin: 4, color: { dark: '#0B3B6F', light: '#FFFFFF' } };
await writeFile('screenshots/qr.svg', await QRCode.toString(url.href, { ...options, type: 'svg' }));
await QRCode.toFile('screenshots/qr.png', url.href, { ...options, width: 1024 });
console.log('Created screenshots/qr.svg and screenshots/qr.png for the final application URL.');
