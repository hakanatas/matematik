#!/usr/bin/env node
// Filmi kare kare MP4'e (yatay + dikey 720p) ve SRT'lere aktarır.
// Kullanım:  node araclar/disa-aktar.mjs [--yerlesim h|v|hepsi] [--zorla] [--fps 30] [--bas 0] [--son 12] [--altyazi tr|en|iki] [--png]
// Kareler varsayılan olarak %96 kaliteli JPEG ile aktarılır (hızlı); --png kayıpsız ara kare kullanır.
// Çıktılar dist/ klasörüne yazılır; var olan dosyalar atlanır (--zorla ile yeniden üretilir).
import { spawn } from 'node:child_process';
import { mkdir, writeFile, rename, rm, access } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { FILM_KOK, tarayiciBaslat, sunucuBaslat, altyazilariOku, srtUret, notlarUret } from './ortak.mjs';

const arg = (ad, vars) => { const i = process.argv.indexOf('--' + ad); return i > 0 ? process.argv[i + 1] : vars; };
const bayrak = (ad) => process.argv.includes('--' + ad);
const yerlesimler = { h: ['h'], v: ['v'], hepsi: ['h', 'v'] }[arg('yerlesim', 'hepsi')];
const zorla = bayrak('zorla');
const yakAltyazi = arg('altyazi', null);
const DIST = join(FILM_KOK, 'dist');
const AD = process.env.EKSEN_DEPO || basename(FILM_KOK);

const varMi = async (f) => { try { await access(f); return true; } catch { return false; } };
async function main() {
  await mkdir(DIST, { recursive: true });
  const { altyazi } = await altyazilariOku();
  const srtTr = join(DIST, `${AD}-tr.srt`), srtEn = join(DIST, `${AD}-en.srt`), srtIki = join(DIST, `${AD}-tr-en.srt`);
  await writeFile(srtTr, srtUret(altyazi, 'tr'));
  await writeFile(srtEn, srtUret(altyazi, 'en'));
  await writeFile(srtIki, srtUret(altyazi, 'iki'));
  console.log('✔ SRT dosyaları yazıldı');

  const { sunucu, url } = await sunucuBaslat();
  const tarayici = await tarayiciBaslat();
  try {
    let notlarYazildi = false;
    for (const y of yerlesimler) {
      const ad = y === 'h' ? 'yatay' : 'dikey';
      const hedef = join(DIST, `${AD}-${ad}-720p.mp4`);
      const W = y === 'h' ? 1280 : 720, H = y === 'h' ? 720 : 1280;
      const sayfa = await tarayici.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      sayfa.on('pageerror', (e) => console.error('  sayfa hatası:', e.message));
      await sayfa.goto(`${url}index.html?export=1&yerlesim=${y}&dil=${yakAltyazi || 'yok'}`);
      const bilgi = await sayfa.evaluate(() => window.EKSEN_HAZIR);
      if (!notlarYazildi) {
        const meta = await sayfa.evaluate(() => window.FILM_META);
        await writeFile(join(DIST, `${AD}-seslendirme-notlari.md`), notlarUret(altyazi, meta.meta, meta.sahneler));
        console.log('✔ Seslendirme notları yazıldı');
        notlarYazildi = true;
      }
      if (!zorla && (await varMi(hedef))) { console.log(`↷ ${basename(hedef)} zaten var, atlanıyor`); await sayfa.close(); continue; }
      const fps = Number(arg('fps', bilgi.fps));
      const bas = Number(arg('bas', 0)), son = Number(arg('son', bilgi.sure));
      const n = Math.round((son - bas) * fps);
      const gecici = hedef.replace('.mp4', '.gecici.mp4');
      const kayipsiz = bayrak('png');
      const p = spawn('ffmpeg', ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', kayipsiz ? 'png' : 'mjpeg', '-framerate', String(fps), '-i', '-',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', gecici], { stdio: ['pipe', 'inherit', 'inherit'] });
      const bitti = new Promise((ok, red) => { p.on('exit', (k) => (k === 0 ? ok() : red(new Error('ffmpeg hata kodu ' + k)))); p.on('error', (e) => red(new Error('ffmpeg çalıştırılamadı (brew install ffmpeg): ' + e.message))); });
      const t0 = Date.now();
      for (let i = 0; i < n; i++) {
        const t = bas + i / fps;
        const veri = await sayfa.evaluate(([t, k]) => { window.renderFrame(t); return document.querySelector('canvas').toDataURL(k ? 'image/png' : 'image/jpeg', 0.96); }, [t, kayipsiz]);
        const tampon = Buffer.from(veri.slice(veri.indexOf(',') + 1), 'base64');
        if (!p.stdin.write(tampon)) await new Promise((ok) => p.stdin.once('drain', ok));
        if (i % 30 === 0 || i === n - 1) {
          const gecen = (Date.now() - t0) / 1000, hiz = (i + 1) / gecen, kalan = (n - i - 1) / hiz;
          process.stdout.write(`\r  ${ad}: ${i + 1}/${n} kare · ${hiz.toFixed(1)} kare/sn · kalan ~${Math.ceil(kalan)} sn   `);
        }
      }
      p.stdin.end();
      await bitti;
      process.stdout.write('\n');
      // Altyazıları yumuşak iz olarak göm (TR + EN); görüntü yeniden kodlanmaz
      await new Promise((ok, red) => {
        const m = spawn('ffmpeg', ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-i', gecici, '-i', srtTr, '-i', srtEn,
          '-map', '0:v', '-map', '1', '-map', '2', '-c:v', 'copy', '-c:s', 'mov_text',
          '-metadata:s:s:0', 'language=tur', '-metadata:s:s:0', 'title=Türkçe', '-metadata:s:s:1', 'language=eng', '-metadata:s:s:1', 'title=English',
          '-disposition:s:0', 'default', '-movflags', '+faststart', hedef], { stdio: ['ignore', 'inherit', 'inherit'] });
        m.on('exit', (k) => (k === 0 ? ok() : red(new Error('ffmpeg altyazı gömme hatası ' + k))));
      });
      await rm(gecici, { force: true });
      console.log(`✔ ${basename(hedef)} (${((Date.now() - t0) / 1000).toFixed(0)} sn)`);
      await sayfa.close();
    }
  } finally {
    await tarayici.close();
    sunucu.close();
  }
}
main().catch((e) => { console.error('\n✖', e.message); process.exit(1); });
