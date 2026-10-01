// Fontları base64 olarak motor/fontlar.js içine gömer (file:// ile açılınca da çalışsın diye).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const kok = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontlar = [
  ['Bricolage Grotesque', 'BricolageGrotesque.woff2', { weight: '200 800', style: 'normal' }],
  ['Fraunces', 'Fraunces-Italic.woff2', { weight: '100 900', style: 'italic' }],
  ['JetBrains Mono', 'JetBrainsMono.woff2', { weight: '100 800', style: 'normal' }],
  ['Noto Sans Math', 'NotoSansMath.woff2', { weight: '400', style: 'normal' }],
];
let js = '/* Eksen fontları — SIL Open Font License 1.1 (bkz. fontlar/OFL-LISANSLAR.txt). Otomatik üretildi. */\n';
js += 'window.EKSEN_FONTLARI = [\n';
for (const [ad, dosya, opt] of fontlar) {
  const b64 = readFileSync(join(kok, 'fontlar', dosya)).toString('base64');
  js += `  { ad: ${JSON.stringify(ad)}, opt: ${JSON.stringify(opt)}, veri: "${b64}" },\n`;
}
js += '];\n';
writeFileSync(join(kok, 'motor', 'fontlar.js'), js);
console.log('motor/fontlar.js yazıldı', (js.length / 1024).toFixed(0), 'KB');
