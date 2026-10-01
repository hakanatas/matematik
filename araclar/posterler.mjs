#!/usr/bin/env node
// Her film için afiş karesi üretir: filmler/<film>/poster.jpg ve hub/posterler/<film>.jpg (1280×720).
// Afiş zamanı: film tanımındaki `poster` (sn) ya da başlık sahnesinin bitimine yakın bir an.
// Kullanım: node araclar/posterler.mjs [süzgeç]
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tarayiciBaslat, sunucuBaslat } from '../ortak/araclar/ortak.mjs';
const KOK = join(dirname(fileURLToPath(import.meta.url)), '..');
const M = JSON.parse(readFileSync(join(KOK, 'mufredat', '9-sinif.json'), 'utf8'));
const suz = process.argv[2] || '';
mkdirSync(join(KOK, 'hub', 'posterler'), { recursive: true });
const b = await tarayiciBaslat();
const sureler = {};
for (const tema of M.temalar) for (const c of tema.ciktilar) {
  const d = join(KOK, 'filmler', c.film);
  if (!existsSync(join(d, 'film.js')) || !c.film.includes(suz)) continue;
  const { sunucu, url } = await sunucuBaslat(d);
  const s = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await s.goto(url + 'index.html?export=1&yerlesim=h&dil=yok');
  await s.evaluate(() => window.EKSEN_HAZIR);
  const meta = await s.evaluate(() => ({ sure: window.FILM_META.sure, sahneler: window.FILM_META.sahneler, poster: window.E.F.poster }));
  const sur = meta.sahneler.find((x) => /sürpriz/i.test(x.ad)) || meta.sahneler[3] || meta.sahneler[0];
  const t = meta.poster ?? (sur.bas + (sur.son - sur.bas) * 0.62);
  await s.evaluate((t) => window.renderFrame(t), t);
  const jpg = await s.locator('canvas').screenshot({ type: 'jpeg', quality: 86 });
  writeFileSync(join(d, 'poster.jpg'), jpg);
  writeFileSync(join(KOK, 'hub', 'posterler', c.film + '.jpg'), jpg);
  sureler[c.film] = Math.round(meta.sure);
  console.log('✔', c.film, 't=' + t.toFixed(1));
  await s.close(); sunucu.close();
}
await b.close();
const yol = join(KOK, 'hub', 'sureler.json');
const eski = existsSync(yol) ? JSON.parse(readFileSync(yol, 'utf8')) : {};
writeFileSync(yol, JSON.stringify({ ...eski, ...sureler }, null, 1));
