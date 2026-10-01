#!/usr/bin/env node
// Başsız Chrome'da WebGL'in çalıştığını test eder (3B sahne içeren filmler için).
// Kullanım: node araclar/webgl-test.mjs [--t 64]   (--t: 3B sahneden örnek kare zamanı)
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { FILM_KOK, tarayiciBaslat, sunucuBaslat } from './ortak.mjs';

const i = process.argv.indexOf('--t');
const { sunucu, url } = await sunucuBaslat();
const tarayici = await tarayiciBaslat();
let basarili = false;
try {
  const sayfa = await tarayici.newPage({ viewport: { width: 1280, height: 720 } });
  await sayfa.goto(`${url}index.html?export=1&yerlesim=h&dil=yok`);
  const bilgi = await sayfa.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return { webgl: false };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return { webgl: true, surum: gl.getParameter(gl.VERSION), cizici: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) };
  });
  console.log('Tarayıcı:', tarayici.version());
  console.log('WebGL   :', bilgi.webgl ? `var — ${bilgi.surum}` : 'YOK');
  if (bilgi.cizici) console.log('Çizici  :', bilgi.cizici);
  await sayfa.evaluate(() => window.EKSEN_HAZIR);
  const t = i > 0 ? Number(process.argv[i + 1]) : await sayfa.evaluate(() => (window.FILM_META.uc3b || [0])[0]);
  // 3B sahne karesini çiz ve 3B tuvalinde boş olmayan piksel ara
  const sonuc = await sayfa.evaluate((t) => {
    window.renderFrame(t);
    const c = document.querySelector('canvas');
    const g = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let parlak = 0; for (let k = 0; k < g.length; k += 16) if (g[k] + g[k + 1] + g[k + 2] > 200) parlak++;
    return { parlak, uc: !!(window.E && window.E.uc && window.THREE) };
  }, t);
  await mkdir(join(FILM_KOK, 'onizleme'), { recursive: true });
  const yol = join(FILM_KOK, 'onizleme', `webgl-test-${t}.png`);
  await sayfa.locator('canvas').screenshot({ path: yol });
  basarili = bilgi.webgl && sonuc.uc && sonuc.parlak > 50;
  console.log(`3B kare (t=${t} sn): ${sonuc.parlak} parlak örnek piksel → ${yol}`);
  console.log(basarili ? '✔ WebGL başsız Chrome\'da çalışıyor.' : '✖ WebGL sorunu: 3B sahne çizilemedi.');
} finally {
  await tarayici.close();
  sunucu.close();
}
process.exit(basarili ? 0 : 1);
