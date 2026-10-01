#!/usr/bin/env node
// yayinla.sh için yayınlanacak klasörleri sekmeyle ayrılmış satırlar olarak yazar:
// klasör \t depo-adı \t tür(film|lab|hub) \t açıklama \t sürüm başlığı
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const KOK = join(dirname(fileURLToPath(import.meta.url)), '..');
const M = JSON.parse(readFileSync(join(KOK, 'mufredat', '9-sinif.json'), 'utf8'));
const satir = (...a) => console.log(a.map((x) => String(x).replace(/[\t\n]/g, ' ')).join('\t'));
for (const tema of M.temalar) {
  for (const c of tema.ciktilar) {
    const d = join('filmler', c.film);
    if (!existsSync(join(KOK, d, 'film.js'))) continue;
    const no = c.kod.replace('MAT.', '');
    satir(d, c.film, 'film', `Eksen ${no} · ${c.filmAdi} — 9. sınıf matematik filmi (${c.kod}, ${tema.ad})`, `v1.0 · Eksen ${no} · ${c.filmAdi}`);
  }
}
for (const tema of M.temalar) {
  const d = join('laboratuvarlar', tema.lab);
  if (!existsSync(join(KOK, d, 'lab.js'))) continue;
  let ad = 'Laboratuvar';
  try { ad = JSON.parse(readFileSync(join(KOK, d, 'bilgi.json'), 'utf8')).ad || ad; } catch {}
  satir(d, tema.lab, 'lab', `Eksen · ${ad} — 9. sınıf matematik, ${tema.no}. tema: ${tema.ad}`, '');
}
if (existsSync(join(KOK, 'hub', 'index.html'))) satir('hub', 'eksen-filmleri', 'hub', 'Eksen — 9. Sınıf Matematik Filmleri ve Laboratuvarları (Türkiye Yüzyılı Maarif Modeli)', '');
