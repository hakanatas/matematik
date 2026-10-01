#!/usr/bin/env node
// Önizleme karelerinden 2×2 temas yaprakları üretir (gözle kontrol için).
// Kullanım: node araclar/temas-yaprak.mjs <film-klasörü> [h|v]
import { readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const klasor = process.argv[2];
const yer = process.argv[3] || 'h';
const on = join(klasor, 'onizleme');
const cikis = join(on, 'yaprak');
mkdirSync(cikis, { recursive: true });
const kareler = readdirSync(on).filter((f) => f.startsWith(yer + '-') && f.endsWith('.png')).sort();
const n = yer === 'h' ? 4 : 4;
const [w, h] = yer === 'h' ? [960, 540] : [480, 853];
for (let i = 0; i < kareler.length; i += n) {
  const grup = kareler.slice(i, i + n);
  const args = ['-nostdin', '-loglevel', 'error', '-y'];
  grup.forEach((f) => args.push('-i', join(on, f)));
  let fc = grup.map((_, k) => `[${k}:v]scale=${w}:${h}[s${k}];`).join('');
  const yerlesim = yer === 'h' ? ['0_0', 'w0_0', '0_h0', 'w0_h0'] : ['0_0', 'w0_0', 'w0+w1_0', 'w0+w1+w2_0'];
  if (grup.length === 1) fc += `[s0]null`;
  else fc += grup.map((_, k) => `[s${k}]`).join('') + `xstack=inputs=${grup.length}:layout=${yerlesim.slice(0, grup.length).join('|')}:fill=black`;
  const ad = join(cikis, `${yer}-${String(i / n).padStart(2, '0')}.png`);
  execFileSync('ffmpeg', [...args, '-filter_complex', fc, ad]);
  console.log(ad, grup.join(' '));
}
