#!/usr/bin/env node
// Laboratuvar ekran görüntüleri: masaüstü (1280×820) ve telefon (390×844), her deney için.
// Kullanım: node araclar/lab-onizleme.mjs laboratuvarlar/<lab> [--etkilesim]
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tarayiciBaslat, sunucuBaslat } from '../ortak/araclar/ortak.mjs';
const kok = resolve(process.argv[2]);
const { sunucu, url } = await sunucuBaslat(kok);
const b = await tarayiciBaslat();
const cik = join(kok, 'onizleme'); await mkdir(cik, { recursive: true });
const hatalar = [];
for (const [ad, vp, dpr] of [['masa', { width: 1280, height: 820 }, 1], ['tel', { width: 390, height: 844 }, 2]]) {
  const s = await b.newPage({ viewport: vp, deviceScaleFactor: dpr });
  s.on('pageerror', (e) => hatalar.push(ad + ': ' + e.message));
  s.on('console', (m) => { if (m.type() === 'error') hatalar.push(ad + ': ' + m.text()); });
  await s.goto(url + 'index.html');
  await s.waitForTimeout(800);
  const deneyler = await s.$$eval('.lab-sekmeler button', (bs) => bs.map((x) => x.dataset.id));
  for (const d of deneyler.length ? deneyler : ['tek']) {
    if (d !== 'tek') await s.click(`.lab-sekmeler button[data-id="${d}"]`);
    await s.waitForTimeout(500);
    await s.screenshot({ path: join(cik, `${ad}-${d}.png`), fullPage: ad === 'tel' });
  }
  await s.close();
}
await b.close(); sunucu.close();
console.log(hatalar.length ? '⚠ ' + [...new Set(hatalar)].join('\n') : '✔ hata yok', '→', cik);
