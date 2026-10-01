#!/usr/bin/env node
// Ortak motoru, araçları ve lisans dosyalarını her film ve laboratuvar klasörüne kopyalar,
// index.html, package.json ve README.md dosyalarını üretir.
// Her klasör böylece kendi başına bir GitHub deposu olarak yayınlanabilir.
// Kullanım: node araclar/senkronla.mjs [klasör-adı-süzgeci]
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readmeFilm, readmeLab, readmeHub } from './readme.mjs';

const KOK = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORTAK = join(KOK, 'ortak');
const M = JSON.parse(readFileSync(join(KOK, 'mufredat', '9-sinif.json'), 'utf8'));
const suzgec = process.argv[2] || '';

const kopya = (kaynak, hedef) => { mkdirSync(dirname(hedef), { recursive: true }); copyFileSync(kaynak, hedef); };
const yaz = (hedef, metin) => { mkdirSync(dirname(hedef), { recursive: true }); writeFileSync(hedef, metin); };

const ortakDosyalar = (d, { uc = false, film = true } = {}) => {
  for (const f of ['eksen.js', 'eksen.css', 'fontlar.js']) kopya(join(ORTAK, 'motor', f), join(d, 'motor', f));
  if (film) kopya(join(ORTAK, 'motor', 'oynatici.js'), join(d, 'motor', 'oynatici.js'));
  if (uc) kopya(join(ORTAK, 'motor', 'uc.js'), join(d, 'motor', 'uc.js'));
  kopya(join(ORTAK, 'vendor', 'qrcode.js'), join(d, 'vendor', 'qrcode.js'));
  if (uc) kopya(join(ORTAK, 'vendor', 'three.min.js'), join(d, 'vendor', 'three.min.js'));
  kopya(join(ORTAK, 'fontlar', 'OFL-LISANSLAR.txt'), join(d, 'fontlar', 'OFL-LISANSLAR.txt'));
  kopya(join(ORTAK, 'LICENSE-cc-by-nc.txt'), join(d, 'LICENSE'));
  kopya(join(KOK, 'PROMPT.md'), join(d, 'PROMPT.md'));
  yaz(join(d, '.gitignore'), 'node_modules/\ndist/\nonizleme/\n.DS_Store\n');
};

let sayi = 0;
for (const tema of M.temalar) {
  for (const c of tema.ciktilar) {
    const d = join(KOK, 'filmler', c.film);
    if (!existsSync(join(d, 'film.js')) || !c.film.includes(suzgec)) continue;
    const filmKod = readFileSync(join(d, 'film.js'), 'utf8');
    const uc = /E\.uc\b/.test(filmKod);
    ortakDosyalar(d, { uc });
    for (const f of ['ortak.mjs', 'disa-aktar.mjs', 'onizleme.mjs', 'webgl-test.mjs']) if (existsSync(join(ORTAK, 'araclar', f))) kopya(join(ORTAK, 'araclar', f), join(d, 'araclar', f));
    const no = c.kod.replace('MAT.', '');
    const bilgi = existsSync(join(d, 'bilgi.json')) ? JSON.parse(readFileSync(join(d, 'bilgi.json'), 'utf8')) : {};
    const html = readFileSync(join(ORTAK, 'sablon-index.html'), 'utf8')
      .replaceAll('{{AD}}', c.filmAdi).replaceAll('{{NO}}', no)
      .replaceAll('{{ACIKLAMA}}', (bilgi.ozet || c.baslik).replace(/"/g, '&quot;'))
      .replace('{{EK_BETIKLER}}', uc ? '<script src="vendor/three.min.js"></script>\n<script src="motor/uc.js"></script>\n' : '');
    yaz(join(d, 'index.html'), html);
    yaz(join(d, 'package.json'), JSON.stringify({
      name: c.film, version: '1.0.0', private: true, type: 'module',
      description: `Eksen ${no} — ${c.filmAdi}: ${c.baslik}`,
      license: 'CC-BY-NC-4.0', author: 'Hakan Ataş',
      scripts: { mp4: 'node araclar/disa-aktar.mjs', onizleme: 'node araclar/onizleme.mjs', ...(uc ? { 'webgl-test': 'node araclar/webgl-test.mjs' } : {}) },
      devDependencies: { playwright: '^1.48.0' },
    }, null, 2) + '\n');
    yaz(join(d, 'README.md'), readmeFilm({ tema, cikti: c, bilgi, filmKod, uc, kok: d }));
    sayi++;
  }
  // Laboratuvar
  const ld = join(KOK, 'laboratuvarlar', tema.lab);
  if (existsSync(join(ld, 'lab.js')) && tema.lab.includes(suzgec)) {
    const labKod = readFileSync(join(ld, 'lab.js'), 'utf8');
    const uc = /THREE\./.test(labKod);
    ortakDosyalar(ld, { uc, film: false });
    const bilgi = existsSync(join(ld, 'bilgi.json')) ? JSON.parse(readFileSync(join(ld, 'bilgi.json'), 'utf8')) : {};
    kopya(join(ORTAK, 'lab', 'lab.js'), join(ld, 'motor', 'lab-kit.js'));
    kopya(join(ORTAK, 'lab', 'lab.css'), join(ld, 'motor', 'lab.css'));
    const veri = { no: tema.no, ad: tema.ad, lab: tema.lab, labAd: bilgi.ad || '', filmler: tema.ciktilar.map((c) => ({ kod: c.kod, ad: c.filmAdi, url: `https://hakanatas.github.io/${c.film}/` })) };
    yaz(join(ld, 'veri.js'), `/* Otomatik üretildi (araclar/senkronla.mjs) */\nwindow.EKSEN_TEMA = ${JSON.stringify(veri, null, 1)};\n`);
    const html = readFileSync(join(ORTAK, 'sablon-lab.html'), 'utf8')
      .replaceAll('{{AD}}', bilgi.ad || 'Laboratuvar').replaceAll('{{ACIKLAMA}}', (bilgi.ozet || '').replace(/"/g, '&quot;'))
      .replace('{{EK_BETIKLER}}', uc ? '<script src="vendor/three.min.js"></script>\n' : '');
    yaz(join(ld, 'index.html'), html);
    yaz(join(ld, 'README.md'), readmeLab({ tema, bilgi, uc }));
    sayi++;
  }
}
// Hub
if (existsSync(join(KOK, 'hub', 'index.html')) && 'eksen-filmleri'.includes(suzgec)) {
  const d = join(KOK, 'hub');
  for (const f of ['eksen.css', 'fontlar.js']) kopya(join(ORTAK, 'motor', f), join(d, 'motor', f));
  kopya(join(ORTAK, 'fontlar', 'OFL-LISANSLAR.txt'), join(d, 'fontlar', 'OFL-LISANSLAR.txt'));
  kopya(join(ORTAK, 'LICENSE-cc-by-nc.txt'), join(d, 'LICENSE'));
  kopya(join(KOK, 'PROMPT.md'), join(d, 'PROMPT.md'));
  kopya(join(KOK, 'mufredat', '9-sinif.json'), join(d, 'mufredat.json'));
  const sureler = existsSync(join(d, 'sureler.json')) ? readFileSync(join(d, 'sureler.json'), 'utf8') : '{}';
  yaz(join(d, 'veri.js'), `/* Otomatik üretildi (araclar/senkronla.mjs) */\nwindow.EKSEN_MUFREDAT = ${JSON.stringify(M)};\nwindow.EKSEN_SURELER = ${sureler.trim()};\n`);
  yaz(join(d, '.gitignore'), '.DS_Store\n');
  yaz(join(d, 'README.md'), readmeHub(M));
  sayi++;
}
console.log(`✔ ${sayi} klasör senkronlandı`);
