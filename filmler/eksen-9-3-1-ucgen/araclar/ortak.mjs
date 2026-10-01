// Dışa aktarım ve önizleme araçlarının ortak parçaları.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

export const FILM_KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Playwright'ı yerel node_modules'tan, yoksa global kurulumdan yükle */
export async function playwrightYukle() {
  try { return await import('playwright'); } catch (e) {}
  try {
    const kok = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const req = createRequire(join(kok, 'noop.js'));
    return req('playwright');
  } catch (e) {}
  console.error('\n✖ Playwright bulunamadı. Bu klasörde bir kez şunu çalıştırın:  npm install\n');
  process.exit(1);
}

/** Tarayıcıyı başlat. Mac'te yüklü Google Chrome kullanılır (channel: 'chrome'). */
export async function tarayiciBaslat() {
  const { chromium } = await playwrightYukle();
  const args = ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--disable-background-timer-throttling', '--force-color-profile=srgb', '--hide-scrollbars'];
  const kanal = process.env.EKSEN_KANAL ?? (process.platform === 'darwin' ? 'chrome' : '');
  const opt = { headless: true, args };
  if (kanal) opt.channel = kanal;
  if (process.env.EKSEN_CHROME_YOLU) opt.executablePath = process.env.EKSEN_CHROME_YOLU;
  try {
    return await chromium.launch(opt);
  } catch (e) {
    if (kanal === 'chrome') {
      console.error('\n✖ Google Chrome başlatılamadı. Chrome yüklü mü? (https://www.google.com/chrome/)');
      console.error('  Gerekirse yolu elle verin: EKSEN_CHROME_YOLU="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"\n');
    }
    throw e;
  }
}

const TUR = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
/** Film klasörünü yerelde sunan küçük HTTP sunucusu */
export function sunucuBaslat(kok = FILM_KOK) {
  return new Promise((ok) => {
    const s = http.createServer(async (req, res) => {
      try {
        let yol = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        if (yol.endsWith('/')) yol += 'index.html';
        const dosya = join(kok, yol);
        if (!dosya.startsWith(kok)) throw new Error('yasak');
        await stat(dosya);
        res.writeHead(200, { 'Content-Type': TUR[extname(dosya)] || 'application/octet-stream' });
        res.end(await readFile(dosya));
      } catch (e) { res.writeHead(404); res.end('yok'); }
    });
    s.listen(0, '127.0.0.1', () => ok({ sunucu: s, url: `http://127.0.0.1:${s.address().port}/` }));
  });
}

/** captions.js dosyasını Node'da oku */
export async function altyazilariOku(kok = FILM_KOK) {
  const kod = await readFile(join(kok, 'captions.js'), 'utf8');
  const window = {};
  new Function('window', kod)(window);
  return { altyazi: window.ALTYAZI || [], bilgi: window.ALTYAZI_BILGI || {} };
}

const zt = (s) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), sn = Math.floor((ms % 60000) / 1000), k = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sn).padStart(2, '0')},${String(k).padStart(3, '0')}`;
};
/** SRT üret: dil = 'tr' | 'en' | 'iki' */
export function srtUret(altyazi, dil) {
  return altyazi.map((a, i) => {
    const metin = dil === 'tr' ? a.tr : dil === 'en' ? a.en : `${a.tr}\n${a.en}`;
    return `${i + 1}\n${zt(a.bas)} --> ${zt(a.son)}\n${metin}\n`;
  }).join('\n');
}
/** Seslendirme notları (öğretmen için) — Markdown */
export function notlarUret(altyazi, meta, sahneler) {
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  let md = `# Seslendirme notları — ${meta.ad} (${meta.kod})\n\n`;
  md += `Film: ${meta.ad} / ${meta.adEn}  \nSüre: ${mmss(window_sure(sahneler))}  \n`;
  md += `Bu notlar, filmi sınıfta kendi sesinizle anlatmak isterseniz içindir. Altyazı metni okunacak cümledir; 🎙 satırı ton, vurgu ve duraklama önerisidir.\n\n`;
  let son = null;
  for (const a of altyazi) {
    const sh = sahneler.find((s) => a.bas >= s.bas && a.bas < s.son);
    if (sh && sh !== son) { md += `\n## ${sh.ad} (${mmss(sh.bas)}–${mmss(sh.son)})\n\n`; son = sh; }
    md += `**${mmss(a.bas)}–${mmss(a.son)}** — ${a.tr}  \n`;
    md += `_EN:_ ${a.en}  \n`;
    if (a.not) md += `🎙 ${a.not}\n`;
    md += `\n`;
  }
  return md;
}
const window_sure = (sahneler) => Math.max(...sahneler.map((s) => s.son));
