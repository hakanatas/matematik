#!/usr/bin/env node
// Önizleme ve otomatik denetim:
//  - Her sahneden kareleri yatay ve dikey olarak onizleme/ klasörüne PNG yazar
//  - Filmi 0,25 sn aralıkla tarar; taşan yazı, üst üste binen yazı, 20 px altı yazıyı raporlar
//    (altyazılar en kalabalık durum olan TR+EN ile denetlenir)
// Kullanım: node araclar/onizleme.mjs [--yerlesim h|v|hepsi] [--adim 0.25] [--kare] [--zamanlar 3,10.5,40]
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FILM_KOK, tarayiciBaslat, sunucuBaslat } from './ortak.mjs';

const arg = (ad, vars) => { const i = process.argv.indexOf('--' + ad); return i > 0 ? process.argv[i + 1] : vars; };
const yerlesimler = { h: ['h'], v: ['v'], hepsi: ['h', 'v'] }[arg('yerlesim', 'hepsi')];
const adim = Number(arg('adim', 0.25));
const yalnizKare = process.argv.includes('--kare');
const zamanlar = arg('zamanlar', null);

const { sunucu, url } = await sunucuBaslat();
const tarayici = await tarayiciBaslat();
const DIR = join(FILM_KOK, 'onizleme');
await mkdir(DIR, { recursive: true });
let toplamSorun = 0;
const rapor = [];
try {
  for (const y of yerlesimler) {
    const W = y === 'h' ? 1280 : 720, H = y === 'h' ? 720 : 1280;
    const sayfa = await tarayici.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const hatalar = [];
    sayfa.on('pageerror', (e) => hatalar.push(e.message));
    sayfa.on('console', (m) => { if (m.type() === 'error') hatalar.push(m.text()); });
    await sayfa.goto(`${url}index.html?export=1&yerlesim=${y}&dil=iki`);
    const bilgi = await sayfa.evaluate(() => window.EKSEN_HAZIR);
    const meta = await sayfa.evaluate(() => window.FILM_META);
    // Kareler: her sahnenin %35 ve %80 noktası (veya verilen zamanlar)
    const ts = zamanlar ? zamanlar.split(',').map(Number) : meta.sahneler.flatMap((s) => [s.bas + (s.son - s.bas) * 0.35, s.bas + (s.son - s.bas) * 0.8]);
    for (const t of ts) {
      await sayfa.evaluate((t) => window.renderFrame(t), t);
      await sayfa.locator('canvas').screenshot({ path: join(DIR, `${y}-${String(t.toFixed(2)).padStart(6, '0')}.png`) });
    }
    console.log(`${y === 'h' ? 'Yatay' : 'Dikey'}: ${ts.length} kare → onizleme/`);
    if (!yalnizKare) {
      const gorulen = new Set();
      for (let t = 0; t < bilgi.sure; t += adim) {
        const sorunlar = await sayfa.evaluate((t) => window.EKSEN_DENETLE(t), t);
        for (const s of sorunlar) {
          const anahtar = s.tur + '|' + s.metin;
          if (gorulen.has(anahtar)) continue;
          gorulen.add(anahtar);
          rapor.push({ yerlesim: y, t: +t.toFixed(2), ...s });
          toplamSorun++;
        }
      }
    }
    if (hatalar.length) { console.log('  Sayfa hataları:'); [...new Set(hatalar)].forEach((h) => console.log('   ', h)); toplamSorun += hatalar.length; }
    await sayfa.close();
  }
} finally {
  await tarayici.close();
  sunucu.close();
}
if (!yalnizKare) {
  await writeFile(join(DIR, 'denetim.json'), JSON.stringify(rapor, null, 1));
  if (rapor.length) {
    console.log(`\n⚠ ${rapor.length} denetim bulgusu:`);
    for (const r of rapor) console.log(`  [${r.yerlesim} ${r.t}s] ${r.tur} · ${r.sahne} · ${r.metin}${r.px ? ' · ' + r.px + 'px' : ''}${r.kutu ? ' · ' + r.kutu.join(',') : ''}`);
  } else console.log('\n✔ Denetim temiz: taşma, çakışma ya da küçük yazı yok.');
}
process.exit(toplamSorun ? 2 : 0);
