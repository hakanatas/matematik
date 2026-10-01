/* ==========================================================================
   EKSEN 9.7.2 — Yedinin Köşegeni
   Tek fikir: İki zarın 36 eş olasılıklı sonucu bir 6×6 ızgaradır. Toplam 7
   ızgaranın en uzun köşegenidir: 6/36. Teorik olasılık, örnek uzayı görünür
   kılmaktır; ızgara 45° dönüp çöktüğünde dağılımın üçgeni çıkar ve deney
   uzun vadede bu üçgene yerleşir.
   Simülasyon tohumludur (E.rng); sonuçlar bir kez dizi olarak üretilir,
   her karede "t anına kadar kaç atış" t'den hesaplanır.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp, yd } = E;

  const meta = {
    kod: 'MAT.9.7.2',
    tema: 'Veriden Olasılığa',
    ad: 'Yedinin Köşegeni',
    adEn: 'The Diagonal of Seven',
    labAd: 'Olasılık Laboratuvarı',
    labAciklama: 'İki zarı binlerce kez at; deneysel çubukların teorik basamaklara nasıl oturduğunu izle.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-olasilik/',
  };

  /* ---------- Yardımcılar ---------- */
  const binlik = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const ondalik = (v, b = 2) => v.toFixed(b).replace('.', ',');
  const onbellek = new Map();
  const bellek = (k, f) => { if (!onbellek.has(k)) onbellek.set(k, f()); return onbellek.get(k); };
  const SUM_RENK = (s) => (s === 7 ? 'limon' : ['turkuaz', 'gok', 'menekse'][s % 3]);

  /* ---------- Zar (prosedürel yüz ve noktalar) ---------- */
  const PIP = {
    1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]],
    4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  };
  const zarCiz = (ctx, x, y, s, v, o = {}) => {
    const renk = o.renk || 'turkuaz', al = o.alfa ?? 1;
    if (al <= 0.003 || s < 2) return;
    ctx.save();
    ctx.globalAlpha *= al;
    ctx.translate(x, y); ctx.rotate(o.aci || 0); ctx.scale(o.sx ?? 1, 1);
    const r = s * 0.2, h = s / 2;
    if (s > 24) { ctx.save(); ctx.shadowColor = E.rgba(renk, 0.5); ctx.shadowBlur = s * 0.3; }
    E.yuvarlakDik(ctx, -h, -h, s, s, r);
    const g = ctx.createLinearGradient(-h, -h, h, h);
    g.addColorStop(0, '#22305A'); g.addColorStop(0.55, '#131C36'); g.addColorStop(1, '#0A0F1E');
    ctx.fillStyle = g; ctx.fill();
    if (s > 24) ctx.restore();
    E.yuvarlakDik(ctx, -h, -h, s, s, r);
    ctx.strokeStyle = E.rgba(renk, 0.95); ctx.lineWidth = Math.max(1.2, s * 0.05); ctx.stroke();
    if (s > 24) {
      E.yuvarlakDik(ctx, -h + s * 0.08, -h + s * 0.08, s * 0.84, s * 0.4, r * 0.8);
      const p = ctx.createLinearGradient(0, -h, 0, -h + s * 0.45);
      p.addColorStop(0, 'rgba(255,255,255,0.13)'); p.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = p; ctx.fill();
    }
    ctx.fillStyle = E.R(renk);
    if (s > 24) { ctx.shadowColor = E.rgba(renk, 0.9); ctx.shadowBlur = s * 0.15; }
    for (const [px, py] of PIP[v] || []) { ctx.beginPath(); ctx.arc(px * s * 0.26, py * s * 0.26, Math.max(1.4, s * 0.09), 0, E.TAU); ctx.fill(); }
    ctx.restore();
  };
  const yuvarlanan = (ctx, t, t0, t1, x, y, s, v, o = {}) => {
    const p = clamp((t - t0) / (t1 - t0));
    if (p >= 1 || t < t0) return zarCiz(ctx, x, y, s, v, o);
    const don = 1 - E.e.cik3(p);
    const yuz = 1 + Math.floor(E.hash(Math.floor(t * 16), (o.tohum || 1) * 31) * 6);
    zarCiz(ctx, x, y - Math.abs(Math.sin(p * Math.PI * 2.5)) * s * 0.35 * don, s, yuz, Object.assign({}, o, { aci: (o.aci || 0) + don * 6 * (o.yon || 1), sx: 0.55 + 0.45 * Math.abs(Math.cos(p * 10)) }));
  };

  /* ---------- 6×6 ızgara geometrisi ---------- */
  /** o: cx, cy (ızgara merkezi), c (hücre) → hücre merkezleri */
  const izgara = (o) => {
    const g = Object.assign({}, o);
    g.x0 = g.cx - 3 * g.c; g.y0 = g.cy - 3 * g.c;
    g.m = (i, j) => [g.x0 + (j + 0.5) * g.c, g.y0 + (i + 0.5) * g.c]; // i: 1. zar (satır), j: 2. zar (sütun), 0..5
    return g;
  };
  /** başlıklar: üstte 2. zar (mercan), solda 1. zar (turkuaz) */
  const basliklar = (ctx, g, a) => {
    if (a <= 0.003) return;
    const s = g.c * 0.5;
    for (let k = 0; k < 6; k++) {
      zarCiz(ctx, g.x0 + (k + 0.5) * g.c, g.y0 - g.c * 0.55, s, k + 1, { renk: 'mercan', alfa: a });
      zarCiz(ctx, g.x0 - g.c * 0.55, g.y0 + (k + 0.5) * g.c, s, k + 1, { renk: 'turkuaz', alfa: a });
    }
  };
  /** hücre: yuvarlak kare + toplam yazısı. o: dolgu (renk), dolguAlfa, kenar, yazi, alfa, aci, boy, ikiRenk ([r1,r2] çapraz bölünmüş) */
  const hucre = (ctx, x, y, o) => {
    const a = o.alfa ?? 1; if (a <= 0.003) return;
    const b = o.boy, h = b / 2 - 3;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(o.aci || 0);
    E.yuvarlakDik(ctx, -h, -h, h * 2, h * 2, Math.min(10, b * 0.14));
    ctx.fillStyle = E.rgba('lacivert', 0.85); ctx.fill();
    if (o.ikiRenk) {
      ctx.save(); ctx.clip();
      ctx.fillStyle = E.rgba(o.ikiRenk[0], o.dolguAlfa ?? 0.45);
      ctx.beginPath(); ctx.moveTo(-h, -h); ctx.lineTo(h, -h); ctx.lineTo(-h, h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = E.rgba(o.ikiRenk[1], (o.dolguAlfa ?? 0.45) * (o.ikinciAlfa ?? 1));
      ctx.beginPath(); ctx.moveTo(h, -h); ctx.lineTo(h, h); ctx.lineTo(-h, h); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else if (o.dolgu) {
      ctx.fillStyle = E.rgba(o.dolgu, o.dolguAlfa ?? 0.4); ctx.fill();
    }
    E.yuvarlakDik(ctx, -h, -h, h * 2, h * 2, Math.min(10, b * 0.14));
    ctx.strokeStyle = E.rgba(o.kenar || 'sis', o.kenarAlfa ?? 0.9); ctx.lineWidth = o.kenarKal || 1.5; ctx.stroke();
    if (o.parla) E.isik(ctx, 0, 0, b * 0.9, o.kenar || 'limon', 0.35 * o.parla);
    ctx.restore();
    if (o.yazi !== undefined) {
      ctx.save(); ctx.globalAlpha *= a;
      E.yazi(ctx, String(o.yazi), x, y + 1, { boyut: o.yaziBoy || Math.max(22, b * 0.38), agirlik: 640, renk: o.yaziRenk || 'tebesir' });
      ctx.restore();
    }
  };
  const kosegenCiz = (ctx, g, s, o) => {
    // i + j = s - 2 (0-indeksli) köşegenini ışıkla çiz
    const pts = [];
    for (let i = 0; i < 6; i++) { const j = s - 2 - i; if (j >= 0 && j < 6) pts.push(g.m(i, j)); }
    if (!pts.length) return;
    const a = pts[0], b = pts[pts.length - 1];
    const dx = 0.42 * g.c;
    const yol = pts.length === 1 ? [[a[0] - dx * 0.6, a[1] + dx * 0.6], [a[0] + dx * 0.6, a[1] - dx * 0.6]] : [[b[0] - dx, b[1] + dx], [a[0] + dx, a[1] - dx]];
    E.cizgi(ctx, yol, Object.assign({ renk: SUM_RENK(s), kalinlik: s === 7 ? 6 : 4, parilti: s === 7 ? 1.6 : 0.9 }, o));
  };

  /* =====================================================================
     1. Soğuk açılış: tavla masası → 36 sonuç → köşegenler
     ===================================================================== */
  const tavla = (ctx, x, y, w, h, a) => {
    if (a <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= a;
    E.yuvarlakDik(ctx, x, y, w, h, 22);
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#16213F'); g.addColorStop(1, '#0B1226');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = E.rgba('cizgi', 0.9); ctx.lineWidth = 3; ctx.stroke();
    const pad = 18, ic = { x: x + pad, y: y + pad, w: w - pad * 2, h: h - pad * 2 };
    const yatayMi = w > h;
    // orta bar
    if (yatayMi) { ctx.fillStyle = E.rgba('gece', 0.8); ctx.fillRect(x + w / 2 - 12, y, 24, h); }
    else { ctx.fillStyle = E.rgba('gece', 0.8); ctx.fillRect(x, y + h / 2 - 12, w, 24); }
    // hane üçgenleri
    for (let yarim = 0; yarim < 2; yarim++) {
      for (let k = 0; k < 12; k++) {
        const rk = (k + yarim) % 2 ? 'mercan' : 'turkuaz';
        ctx.beginPath();
        if (yatayMi) {
          const half = k < 6 ? 0 : 1, kk = k % 6;
          const bw = (ic.w / 2 - 16) / 6;
          const bx = ic.x + half * (ic.w / 2 + 16) + kk * bw;
          const ust = yarim === 0;
          const by = ust ? ic.y : ic.y + ic.h, uc = ust ? ic.y + ic.h * 0.42 : ic.y + ic.h * 0.58;
          ctx.moveTo(bx + 2, by); ctx.lineTo(bx + bw - 2, by); ctx.lineTo(bx + bw / 2, uc);
        } else {
          const half = k < 6 ? 0 : 1, kk = k % 6;
          const bh = (ic.h / 2 - 16) / 6;
          const by = ic.y + half * (ic.h / 2 + 16) + kk * bh;
          const sol = yarim === 0;
          const bx = sol ? ic.x : ic.x + ic.w, uc = sol ? ic.x + ic.w * 0.42 : ic.x + ic.w * 0.58;
          ctx.moveTo(bx, by + 2); ctx.lineTo(bx, by + bh - 2); ctx.lineTo(uc, by + bh / 2);
        }
        ctx.closePath();
        ctx.fillStyle = E.rgba(rk, 0.13); ctx.fill();
        ctx.strokeStyle = E.rgba(rk, 0.45); ctx.lineWidth = 1.5; ctx.stroke();
      }
    }
    // birkaç pul
    const pul = yatayMi ? [[0.06, 0.12], [0.06, 0.2], [0.06, 0.28], [0.94, 0.88], [0.94, 0.8], [0.62, 0.12], [0.33, 0.88]] : [[0.12, 0.06], [0.2, 0.06], [0.28, 0.06], [0.88, 0.94], [0.8, 0.94], [0.12, 0.62], [0.88, 0.33]];
    pul.forEach(([px, py], i) => {
      const cx = x + px * w, cy = y + py * h, r = Math.min(w, h) * 0.04;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, E.TAU);
      ctx.fillStyle = i % 2 ? E.rgba('tebesir', 0.85) : E.rgba('menekse', 0.85); ctx.fill();
      ctx.strokeStyle = E.rgba('gece', 0.6); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, 0, E.TAU); ctx.stroke();
    });
    ctx.restore();
  };
  const acilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const g = izgara(H ? { cx: ic.cx, cy: ic.cy + 26, c: 70 } : { cx: ic.cx, cy: ic.y + 400, c: 96 });
    const kz = kf(t, [[0, 1.18], [4.6, 1.0, 'io2']]);
    const masaA = ara(t, 0, 0.6) * (1 - ara(t, 4.4, 5.4));
    // masa (kamera itmesi)
    ctx.save(); ctx.translate(L.cx, ic.cy); ctx.scale(kz, kz); ctx.translate(-L.cx, -ic.cy);
    tavla(ctx, ic.x + 10, ic.y + E.yd(14, 90), ic.w - 20, ic.h - E.yd(28, 170), masaA);
    ctx.restore();
    // atılan zarlar: 4 ve 3 → ızgarada (4,3) hücresine uçar
    const [ci, cj] = [3, 2];
    const hedef = g.m(ci, cj);
    const uc = ara(t, 4.6, 6.0, 'io3');
    const ds = lerp(E.yd(78, 92), g.c * 0.36, uc);
    const ax = lerp(kf(t, [[0.2, ic.x - 60], [2.2, L.cx - E.yd(52, 58), 'cik3']]), hedef[0] - g.c * 0.2, uc);
    const bx = lerp(kf(t, [[0.4, ic.x1 + 60], [2.4, L.cx + E.yd(52, 58), 'cik3']]), hedef[0] + g.c * 0.2, uc);
    const zy = lerp(ic.cy + E.yd(20, 0), hedef[1], uc);
    yuvarlanan(ctx, t, 0.2, 2.2, ax, zy, ds, 4, { renk: 'turkuaz', tohum: 3 });
    yuvarlanan(ctx, t, 0.4, 2.4, bx, zy, ds, 3, { renk: 'mercan', tohum: 4, yon: -1 });
    const yA = ara(t, 2.5, 2.9) * (1 - ara(t, 4.4, 4.8));
    E.formul(ctx, '= \\c{limon}{7}', L.cx, zy + E.yd(86, 100), { boyut: 52, alfa: yA, parilti: 0.4 });
    // soru
    const sA = ara(t, 2.9, 3.3) * (1 - ara(t, 11.2, 11.8));
    E.yazi(ctx, 'Neden en çok 7 gelir?', L.cx, ic.y + E.yd(16, 22), { boyut: E.yd(40, 40), agirlik: 720, alfa: sA, yaz: ara(t, 2.9, 4.2, 'lin'), parilti: 0.2 });
    // 36 sonuç
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      if (i === ci && j === cj) continue;
      const k = i * 6 + j;
      const t0 = 4.8 + E.hash(k, 11) * 1.6;
      const p = ara(t, t0, t0 + 0.9, 'cik3');
      if (p <= 0) continue;
      const [mx, my] = g.m(i, j);
      const ang = E.hash(k, 13) * E.TAU, R = E.yd(700, 800);
      const x = lerp(L.cx + Math.cos(ang) * R, mx, p), y = lerp(ic.cy + Math.sin(ang) * R, my, p);
      const rot = (1 - p) * (E.hash(k, 17) - 0.5) * 8;
      const al = clamp(p * 2);
      zarCiz(ctx, x - g.c * 0.2, y, g.c * 0.36, i + 1, { renk: 'turkuaz', alfa: al, aci: rot });
      zarCiz(ctx, x + g.c * 0.2, y, g.c * 0.36, j + 1, { renk: 'mercan', alfa: al, aci: -rot });
    }
    // hücre çerçeveleri
    const cA = ara(t, 6.4, 7.2);
    if (cA > 0) {
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
        const [mx, my] = g.m(i, j);
        ctx.save(); ctx.globalAlpha *= cA * 0.8;
        E.yuvarlakDik(ctx, mx - g.c / 2 + 3, my - g.c / 2 + 3, g.c - 6, g.c - 6, 10);
        ctx.strokeStyle = E.rgba('sis', 1); ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
      }
    }
    // köşegenler
    for (let q = 2; q <= 12; q++) {
      const t0 = 7.2 + (q - 2) * 0.24;
      const p = ara(t, t0, t0 + 0.45);
      if (p <= 0) continue;
      const son = q === 7 ? 1 + 0.8 * E.nabiz(t, 10.0, 1.2) : 1 - 0.55 * ara(t, 9.8, 10.4);
      kosegenCiz(ctx, g, q, { p, alfa: son > 1 ? 1 : son, kalinlik: q === 7 ? 6 + 4 * E.nabiz(t, 10.0, 1.2) : 4 });
      // etiket: köşegenin üst-sağ ucunda
      const iMin = Math.max(0, q - 2 - 5), jMax = q - 2 - iMin;
      const [ex, ey] = g.m(iMin, jMax);
      E.yazi(ctx, String(q), ex + g.c * 0.62, ey - g.c * 0.62, { boyut: q === 7 ? 34 : 26, agirlik: 720, renk: SUM_RENK(q), alfa: p * (q === 7 ? 1 : son), parilti: q === 7 ? 0.6 : 0 });
    }
    E.isik(ctx, g.cx, g.cy, g.c * 4, 'limon', 0.18 * E.nabiz(t, 10.0, 1.4));
  };

  /* =====================================================================
     4. Örnek uzay: sistematik liste → tablo → ağaç şeması
     ===================================================================== */
  const tabloIzgara = () => (E.yatay ? izgara({ cx: E.L.icerik.cx + 30, cy: E.L.icerik.cy + 30, c: 64 }) : izgara({ cx: E.L.icerik.cx + 30, cy: E.L.icerik.y + 380, c: 90 }));
  const ornekUzay = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const baslik = (m, a0, a1) => E.yazi(ctx, m, ic.x + 4, ic.y + 10, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'turkuaz', hiza: 'left', alfa: ara(t, a0, a0 + 0.5) * (1 - ara(t, a1, a1 + 0.5)) });
    baslik('1 · SİSTEMATİK LİSTE', 0.2, 7.4);
    baslik('2 · TABLO', 7.8, 12.4);
    baslik('3 · AĞAÇ ŞEMASI', 13.0, 30);
    const g = tabloIzgara();
    // liste konumu
    const lb = H ? 30 : 28, lsx = H ? 150 : 104, lsy = H ? 62 : 70;
    const lx0 = L.cx - lsx * 2.5, ly0 = H ? ic.y + 74 : ic.y + 150;
    const tasi = ara(t, 7.6, 9.2, 'io3');
    const yaziA = 1 - ara(t, 8.2, 8.9);
    const tabloA = ara(t, 8.1, 8.9) * (1 - ara(t, 12.4, 13.1));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      const k = i * 6 + j;
      const a = ara(t, 0.5 + k * 0.11, 0.8 + k * 0.11);
      if (a <= 0) continue;
      const [tx, ty] = g.m(i, j);
      const x = lerp(lx0 + j * lsx, tx, tasi), y = lerp(ly0 + i * lsy, ty, tasi);
      const vurgu = (i === 0 && j === 1) || (i === 1 && j === 0) ? E.nabiz(t, 5.9, 1.6) : 0;
      if (yaziA > 0) E.formul(ctx, `(\\c{turkuaz}{${i + 1}}, \\c{mercan}{${j + 1}})`, x, y, { boyut: lb * lerp(1, 0.7, tasi), alfa: a * yaziA, parilti: vurgu, parRenk: 'limon' });
      if (vurgu > 0.05) E.isik(ctx, x, y, 70, 'limon', 0.25 * vurgu);
      if (tabloA > 0) hucre(ctx, tx, ty, { boy: g.c, alfa: tabloA, yazi: i + j + 2, yaziRenk: i + j + 2 === 7 ? 'limon' : 'tebesir', kenar: 'sis' });
    }
    // liste notları
    const nA = ara(t, 4.6, 5.2) * (1 - ara(t, 7.4, 7.9));
    E.yazi(ctx, '36 çıktı · hepsi eş olasılıklı', L.cx, H ? ic.y1 - 34 : ly0 + lsy * 6 + 30, { boyut: 30, agirlik: 640, renk: 'limon', alfa: nA });
    E.formul(ctx, '(\\c{turkuaz}{1}, \\c{mercan}{2}) \\ne (\\c{turkuaz}{2}, \\c{mercan}{1})', L.cx, H ? ic.y1 - 88 : ly0 + lsy * 6 + 110, { boyut: 30, alfa: ara(t, 6.0, 6.5) * (1 - ara(t, 7.4, 7.9)) });
    // tablo başlıkları
    basliklar(ctx, g, ara(t, 9.0, 9.8) * (1 - ara(t, 12.4, 13.1)));
    const fA = ara(t, 10.2, 10.8) * (1 - ara(t, 12.4, 13.1));
    if (H) {
      E.yazi(ctx, '1. zar', g.x0 - g.c * 0.55, g.y0 - g.c * 1.15, { boyut: 22, agirlik: 600, renk: 'turkuaz', alfa: fA });
      E.yazi(ctx, '2. zar', g.x0 + g.c * 6.7, g.y0 - g.c * 0.55, { boyut: 22, agirlik: 600, renk: 'mercan', alfa: fA, hiza: 'left' });
      E.formul(ctx, '6 · 6 = \\c{limon}{36}', g.x0 + g.c * 6.5 + 110, g.cy + 20, { boyut: 40, alfa: fA });
    } else {
      E.yazi(ctx, 'satır: 1. zar · sütun: 2. zar', L.cx, g.y0 + g.c * 6 + 34, { boyut: 24, agirlik: 600, renk: 'gumus', alfa: fA });
      E.formul(ctx, '6 · 6 = \\c{limon}{36}', L.cx, g.y0 + g.c * 6 + 96, { boyut: 40, alfa: fA });
    }

    // ağaç şeması: üç para (Y: yazı, T: tura)
    const aA = ara(t, 13.0, 13.6);
    if (aA <= 0) return;
    const ag = H
      ? { x: [ic.x + 70, ic.x + 220, ic.x + 370, ic.x + 520], lx: ic.x + 600, top: ic.y + 86, h: ic.h - 92 }
      : { x: [ic.x + 40, ic.x + 170, ic.x + 300, ic.x + 430], lx: ic.x + 500, top: ic.y + 190, h: ic.y1 - (ic.y + 190) };
    const yaprakY = (k) => ag.top + (k + 0.5) * (ag.h / 8);
    const dugY = (sev, idx) => { const n = 8 >> sev; let ss = 0; for (let k = idx * n; k < idx * n + n; k++) ss += yaprakY(k); return ss / n; };
    const yol = (sev, idx) => { let m = ''; for (let b = sev - 1; b >= 0; b--) m += (idx >> b) & 1 ? 'T' : 'Y'; return m; };
    const ikiTura = (k) => yol(3, k).split('').filter((c) => c === 'T').length === 2;
    const sec = ara(t, 18.4, 19.0);
    ['1. atış', '2. atış', '3. atış'].forEach((m, i) => E.yazi(ctx, m, ag.x[i + 1], ag.top - E.yd(36, 40), { boyut: 22, agirlik: 600, renk: 'gumus', alfa: aA * ara(t, 13.6 + i * 1.3, 14.2 + i * 1.3) }));
    E.nokta(ctx, ag.x[0], dugY(0, 0), 8, { renk: 'tebesir', alfa: aA });
    for (let sev = 1; sev <= 3; sev++) {
      const t0 = 13.6 + (sev - 1) * 1.3;
      for (let idx = 0; idx < (1 << sev); idx++) {
        const p = ara(t, t0 + idx * 0.06, t0 + 0.7 + idx * 0.06);
        if (p <= 0) continue;
        const px = ag.x[sev - 1], py = dugY(sev - 1, idx >> 1), x = ag.x[sev], y = dugY(sev, idx);
        const tura = idx & 1;
        const yolK = sev === 3 ? idx : -1;
        const vurgu = sev === 3 && ikiTura(yolK) ? sec : 0;
        // dal yol vurgusu: üst seviyeler için bu dalın altında iki turalı yaprak var mı
        E.cizgi(ctx, [[px, py], [lerp(px, x, p), lerp(py, y, p)]], { renk: vurgu > 0.5 ? 'limon' : 'cizgi', kalinlik: 2.5, parilti: vurgu * 0.8 });
        if (p >= 0.98) {
          const r = H ? 17 : 17;
          ctx.save();
          ctx.beginPath(); ctx.arc(x, y, r, 0, E.TAU);
          ctx.fillStyle = E.rgba(tura ? 'menekse' : 'gok', 0.22); ctx.fill();
          ctx.strokeStyle = E.R(tura ? 'menekse' : 'gok'); ctx.lineWidth = 2.5; ctx.stroke();
          ctx.restore();
          E.yazi(ctx, tura ? 'T' : 'Y', x, y + 1, { boyut: 22, agirlik: 760, renk: tura ? 'menekse' : 'gok' });
        }
      }
    }
    // yapraklar
    for (let k = 0; k < 8; k++) {
      const a = ara(t, 16.6 + k * 0.1, 17.0 + k * 0.1);
      const v = ikiTura(k) ? sec : 0;
      E.yazi(ctx, yol(3, k), ag.lx, yaprakY(k), { boyut: 28, agirlik: 700, harfAra: 3, hiza: 'left', renk: v > 0.5 ? 'limon' : 'tebesir', alfa: a * (1 - 0.6 * sec * (ikiTura(k) ? 0 : 1)), parilti: v * 0.5, parRenk: 'limon' });
    }
    // sonuç
    const rA = ara(t, 19.4, 20.0);
    const kA = ara(t, 21.6, 22.3);
    if (H) {
      const px = ic.x + 770, py = ic.y + 60, pw = ic.x1 - px;
      E.yazi(ctx, 'Y: yazı · T: tura', px + pw / 2, py, { boyut: 26, agirlik: 560, renk: 'gumus', alfa: ara(t, 14.0, 14.6) });
      E.formul(ctx, '2 · 2 · 2 = 8', px + pw / 2, py + 60, { boyut: 36, alfa: ara(t, 17.4, 18.0) });
      E.panel(ctx, px, py + 110, pw, 150, { alfa: rA, vurgu: 'limon' });
      E.yazi(ctx, 'tam 2 tura', px + pw / 2, py + 146, { boyut: 26, agirlik: 600, renk: 'limon', alfa: rA });
      E.formul(ctx, 'P = \\frac{3}{8}', px + pw / 2, py + 210, { boyut: 40, alfa: rA });
      E.panel(ctx, px, py + 290, pw, 150, { alfa: kA, vurgu: 'menekse' });
      E.yazi(ctx, 'el-Kindî · 9. yüzyıl', px + 26, py + 324, { boyut: 22, agirlik: 700, harfAra: 2, renk: 'menekse', hiza: 'left', alfa: kA });
      E.yazi(ctx, 'Şifre çözmek için harflerin sıklığını saydı.', px + 26, py + 386, { boyut: 26, agirlik: 520, hiza: 'left', alfa: kA, maxGen: pw - 50 });
    } else {
      const py = ic.y + 64;
      const sekiz = ara(t, 17.4, 18.0);
      E.yazi(ctx, 'Y: yazı · T: tura', L.cx, py, { boyut: 26, agirlik: 560, renk: 'gumus', alfa: ara(t, 14.0, 14.6) * (1 - sekiz) });
      E.formul(ctx, '2 · 2 · 2 = 8 \\t{ yaprak}', L.cx, py, { boyut: 34, alfa: sekiz * (1 - rA) });
      E.formul(ctx, 'P(\\t{tam 2 tura}) = \\frac{3}{8}', L.cx, py, { boyut: 36, alfa: rA * (1 - kA) });
      E.yazi(ctx, 'el-Kindî (9. yy) şifre çözmek için harflerin sıklığını saydı.', L.cx, py, { boyut: 26, agirlik: 560, renk: 'menekse', alfa: kA, maxGen: ic.w - 20 });
    }
  };

  /* =====================================================================
     5. Köşegen sayımı → ızgara döner, çöker: dağılımın üçgeni (sürpriz)
     ===================================================================== */
  const kosegen = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const g = H ? izgara({ cx: ic.x + 300, cy: ic.cy + 30, c: 64 }) : izgara({ cx: ic.cx + 30, cy: ic.y + 330, c: 88 });
    const rot = ara(t, 10.6, 12.8, 'io3');
    const cok = (k) => ara(t, 13.0 + k * 0.12, 14.2 + k * 0.12, 'io3');
    const basA = ara(t, 0.1, 0.8) * (1 - ara(t, 10.2, 10.8));
    basliklar(ctx, g, basA);
    // hedef: histogram
    const hs = H ? { cx: ic.cx, base: ic.y1 - 60, sp: 92, q: 46 } : { cx: ic.cx, base: ic.y1 - 70, sp: 56, q: 50 };
    // elmas merkezi ve ölçeği
    const D = H ? [ic.cx, ic.cy + 6] : [ic.cx, ic.y + 360];
    const c1 = H ? 52 : 70;
    // sütun içi sıralar
    const sira = bellek('sira', () => { const r = {}; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { r[i * 6 + j] = Math.min(5, i + j) - i; } return r; });
    const yediA = ara(t, 1.0, 1.6);
    const ikiA = ara(t, 6.0, 6.6) * (1 - ara(t, 8.4, 9.0));
    const degilA = ara(t, 8.8, 9.4) * (1 - ara(t, 10.2, 10.7));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      const sm = i + j + 2, k = i * 6 + j;
      const [gx, gy] = g.m(i, j);
      // dönme
      const phi = -Math.PI / 4 * rot;
      const cc = lerp(g.c, c1, rot);
      const rx = (j - 2.5) * cc, ry = (i - 2.5) * cc;
      const cx0 = lerp(g.cx, D[0], rot), cy0 = lerp(g.cy, D[1], rot);
      let x = cx0 + rx * Math.cos(phi) - ry * Math.sin(phi);
      let y = cy0 + rx * Math.sin(phi) + ry * Math.cos(phi);
      let aci = phi, boy = cc;
      // çökme (alt satırdan başlayarak)
      const b = cok(sira[k]);
      if (b > 0) {
        const hx = hs.cx + (sm - 7) * hs.sp, hy = hs.base - (sira[k] + 0.5) * hs.q;
        x = lerp(x, hx, b); y = lerp(y, hy, b); aci = lerp(phi, 0, b); boy = lerp(cc, hs.q, b);
      }
      const yedi = sm === 7;
      const sira7 = yedi ? ara(t, 1.2 + i * 0.35, 1.5 + i * 0.35) : 0;
      let dolgu = null, dA = 0.4, kenar = 'sis', yr = 'tebesir';
      if (yedi) { dolgu = 'limon'; dA = 0.35 * Math.max(sira7, rot); kenar = sira7 > 0.5 || rot > 0 ? 'limon' : 'sis'; yr = 'limon'; }
      if (sm === 2 && ikiA > 0) { dolgu = 'mercan'; dA = 0.5 * ikiA; kenar = 'mercan'; }
      if (!yedi && degilA > 0) { dolgu = 'gumus'; dA = 0.22 * degilA; }
      if (rot > 0 && !yedi) { dolgu = SUM_RENK(sm); dA = 0.18 * rot; kenar = SUM_RENK(sm); }
      hucre(ctx, x, y, { boy, aci, alfa: 1, dolgu, dolguAlfa: dA, kenar, kenarAlfa: yedi ? 1 : 0.85, yazi: sm, yaziRenk: yr, yaziBoy: Math.max(22, boy * 0.4), parla: yedi ? E.nabiz(t, 1.2 + i * 0.35, 0.6) : 0, kenarKal: yedi ? 2.5 : 1.5 });
    }
    if (yediA > 0 && rot < 0.05) {
      const ka = 1 - ara(t, 10.2, 10.6);
      kosegenCiz(ctx, g, 7, { p: ara(t, 1.0, 3.2), alfa: 0.55 * ka, kalinlik: 4 });
      for (let i = 0; i < 6; i++) { const [x7, y7] = g.m(i, 5 - i); E.yazi(ctx, '7', x7, y7 + 1, { boyut: Math.max(22, g.c * 0.4), agirlik: 760, renk: 'tebesir', alfa: ka * ara(t, 1.2 + i * 0.35, 1.5 + i * 0.35), cakisabilir: true }); }
    }
    // formüller (dönmeden önce)
    const fx = H ? ic.x + 820 : L.cx, f0 = H ? ic.y + 110 : g.y0 + g.c * 6 + 64, sat = H ? 100 : 0;
    const fA = (a0, b0) => ara(t, a0, a0 + 0.6, 'cik3') * (1 - ara(t, b0, b0 + 0.5));
    if (H) {
      E.formul(ctx, 'P(A) = \\frac{\\t{A’ya ait çıktılar}}{\\t{tüm çıktılar}}', fx, f0, { boyut: 32, alfa: fA(0.4, 10.2) });
      E.formul(ctx, 'P(\\t{toplam 7}) = \\frac{6}{36} = \\c{limon}{\\frac{1}{6}}', fx, f0 + sat * 1.3, { boyut: 36, alfa: fA(3.4, 10.2) });
      E.formul(ctx, 'P(\\t{toplam 2}) = \\frac{1}{36}', fx, f0 + sat * 2.4, { boyut: 34, alfa: fA(6.2, 10.2), renk: 'tebesir' });
      E.formul(ctx, 'P(\\t{7 değil}) = \\frac{30}{36} = \\frac{5}{6}', fx, f0 + sat * 3.5, { boyut: 34, alfa: fA(9.0, 10.2) });
    } else {
      E.formul(ctx, 'P(A) = \\frac{\\t{A’ya ait çıktılar}}{\\t{tüm çıktılar}}', fx, f0, { boyut: 30, alfa: fA(0.4, 3.2) });
      E.formul(ctx, 'P(\\t{toplam 7}) = \\frac{6}{36} = \\c{limon}{\\frac{1}{6}}', fx, f0, { boyut: 36, alfa: fA(3.4, 5.8) });
      E.formul(ctx, 'P(\\t{toplam 2}) = \\frac{1}{36}', fx, f0, { boyut: 36, alfa: fA(6.3, 8.4) });
      E.formul(ctx, 'P(\\t{7 değil}) = \\frac{30}{36} = \\frac{5}{6}', fx, f0, { boyut: 36, alfa: fA(9.0, 10.2) });
    }
    // histogram etiketleri
    const hA = ara(t, 15.0, 15.8);
    if (hA > 0) {
      E.cizgi(ctx, [[hs.cx - hs.sp * 5.6, hs.base + 2], [hs.cx + hs.sp * 5.6, hs.base + 2]], { renk: 'cizgi', kalinlik: 2, alfa: hA });
      const tepe = [];
      for (let q = 2; q <= 12; q++) {
        const n = 6 - Math.abs(q - 7), x = hs.cx + (q - 7) * hs.sp;
        E.yazi(ctx, String(q), x, hs.base + 24, { boyut: 24, agirlik: 640, renk: q === 7 ? 'limon' : 'gumus', alfa: hA });
        const ka = ara(t, 15.8 + Math.abs(q - 7) * 0.12, 16.3 + Math.abs(q - 7) * 0.12);
        if (H) E.formul(ctx, `\\frac{${n}}{36}`, x, hs.base - n * hs.q - 40, { boyut: 26, renk: q === 7 ? 'limon' : 'tebesir', alfa: ka });
        else E.yazi(ctx, String(n), x, hs.base - n * hs.q - 24, { boyut: 24, agirlik: 700, renk: q === 7 ? 'limon' : 'tebesir', alfa: ka });
        tepe.push([x, hs.base - n * hs.q]);
      }
      const ucA = ara(t, 17.0, 18.0);
      E.cizgi(ctx, tepe, { renk: 'limon', kalinlik: 3, parilti: 1.2, p: ucA, alfa: 0.9 });
      if (!H) E.yazi(ctx, 'her sütun: çıktı sayısı (36 üzerinden)', L.cx, ic.y + 50, { boyut: 24, agirlik: 560, renk: 'gumus', alfa: ara(t, 16.0, 16.6) });
      E.isik(ctx, hs.cx, hs.base - 6 * hs.q, 240, 'limon', 0.25 * E.nabiz(t, 17.6, 1.5));
    }
  };

  /* =====================================================================
     6. Birleşim: ayrık ve ayrık olmayan olaylar
     ===================================================================== */
  const birlesim = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const g = H ? izgara({ cx: ic.x + 280, cy: ic.cy + 34, c: 64 }) : izgara({ cx: ic.cx + 30, cy: ic.y + 300, c: 80 });
    const gA = ara(t, 0.1, 0.8);
    basliklar(ctx, g, gA);
    const bol1 = 1 - ara(t, 7.6, 8.2); // 1. bölüm (ayrık)
    const bol2 = ara(t, 8.2, 8.8);
    const a1 = ara(t, 0.9, 1.5), b1 = ara(t, 2.2, 2.8);
    const a2 = ara(t, 8.8, 9.4), b2 = ara(t, 10.0, 10.6);
    const kes = ara(t, 11.4, 12.0), sil = ara(t, 13.6, 14.6);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      const sm = i + j + 2;
      const [x, y] = g.m(i, j);
      let o = { boy: g.c, alfa: gA, yazi: sm, yaziBoy: 24, kenar: 'sis' };
      if (bol1 > 0.001 && bol2 < 0.001) {
        if (sm === 7 && a1 > 0) Object.assign(o, { dolgu: 'turkuaz', dolguAlfa: 0.45 * a1 * bol1, kenar: 'turkuaz' });
        if (sm === 11 && b1 > 0) Object.assign(o, { dolgu: 'mercan', dolguAlfa: 0.5 * b1 * bol1, kenar: 'mercan' });
      } else {
        const inA = i === 5 || j === 5, inB = sm >= 10;
        if (inA && inB && a2 > 0 && b2 > 0) {
          Object.assign(o, { ikiRenk: ['turkuaz', 'mercan'], dolguAlfa: 0.5, ikinciAlfa: b2 * (1 - sil), kenar: 'limon', kenarAlfa: kes, kenarKal: 2.5, parla: kes * (1 - sil) * (0.6 + 0.4 * Math.sin(t * 6)) });
          if (sil > 0.5) Object.assign(o, { ikiRenk: null, dolgu: 'limon', dolguAlfa: 0.32, kenar: 'limon', kenarAlfa: 1 });
        } else if (inA && a2 > 0) Object.assign(o, { dolgu: 'turkuaz', dolguAlfa: 0.45 * a2, kenar: 'turkuaz' });
        else if (inB && b2 > 0) Object.assign(o, { dolgu: 'mercan', dolguAlfa: 0.5 * b2, kenar: 'mercan' });
      }
      hucre(ctx, x, y, o);
      // iki kez sayılan: "−1" yukarı uçar
      if (bol2 > 0 && (i === 5 || j === 5) && sm >= 10 && sil > 0 && sil < 1) {
        E.yazi(ctx, '−1', x, y - g.c * 0.2 - sil * 40, { boyut: 24, agirlik: 760, renk: 'limon', alfa: Math.sin(sil * Math.PI), cakisabilir: true });
      }
    }
    // metinler
    const tx = H ? ic.x + 640 : ic.x, tw = H ? ic.x1 - (ic.x + 640) : ic.w;
    const ty = H ? ic.y + 30 : g.y0 + g.c * 6 + 40;
    const satir = H ? 58 : 50;
    const leg = (renk, metin, y, a) => {
      if (a <= 0.003) return;
      ctx.save(); ctx.globalAlpha *= a;
      E.yuvarlakDik(ctx, tx, y - 13, 26, 26, 6); ctx.fillStyle = E.rgba(renk, 0.5); ctx.fill(); ctx.strokeStyle = E.R(renk); ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      E.formul(ctx, metin, tx + 42, y, { boyut: H ? 30 : 28, hiza: 'left', alfa: a });
    };
    if (bol1 > 0.001) {
      leg('turkuaz', 'A: \\t{toplam 7}', ty, a1 * bol1);
      leg('mercan', 'B: \\t{toplam 11}', ty + satir, b1 * bol1);
      E.yazi(ctx, 'Ortak çıktı yok: ayrık olaylar', H ? tx : L.cx, ty + satir * 2.1, { boyut: H ? 28 : 28, agirlik: 640, renk: 'limon', hiza: H ? 'left' : 'center', alfa: ara(t, 3.4, 4.0) * bol1 });
      E.formul(ctx, 'P(A \\cup B) = \\frac{6}{36} + \\frac{2}{36} = \\c{limon}{\\frac{8}{36}}', H ? tx : L.cx, ty + satir * 3.6, { boyut: H ? 34 : 34, hiza: H ? 'left' : 'center', alfa: ara(t, 4.6, 5.2) * bol1 });
      if (H) E.formul(ctx, 'A \\cap B = \\emptyset', tx, ty + satir * 5.2, { boyut: 32, hiza: 'left', renk: 'gumus', alfa: ara(t, 5.6, 6.2) * bol1 });
    }
    if (bol2 > 0) {
      const lgA = H ? 1 : 1 - ara(t, 16.2, 16.6);
      leg('turkuaz', 'A: \\t{en az bir zar 6}', ty, a2 * lgA);
      leg('mercan', 'B: \\t{toplam} \\ge 10', ty + satir, b2 * lgA);
      const eA = ara(t, 11.4, 12.0);
      E.yazi(ctx, '5 çıktı iki kez sayıldı', H ? tx : L.cx, ty + satir * 2.1, { boyut: 28, agirlik: 640, renk: 'limon', hiza: H ? 'left' : 'center', alfa: eA * (1 - ara(t, 15.6, 16.2)) });
      E.formul(ctx, 'A \\cap B: \\t{5 çıktı} \\;\\; \\Rightarrow \\;\\; \\t{ayrık değil}', H ? tx : L.cx, ty + satir * 2.1, { boyut: 28, hiza: H ? 'left' : 'center', alfa: ara(t, 15.8, 16.4), renk: 'limon' });
      E.formul(ctx, 'P(A \\cup B) = \\frac{11}{36} + \\frac{6}{36} − \\frac{5}{36} = \\c{limon}{\\frac{12}{36}}', H ? tx : L.cx, ty + satir * 3.6, { boyut: H ? 30 : 30, hiza: H ? 'left' : 'center', alfa: ara(t, 12.6, 13.2), aciga: ara(t, 12.6, 14.6, 'lin') });
      const kA = ara(t, 16.6, 17.2);
      if (H) {
        E.panel(ctx, tx - 10, ty + satir * 4.6, tw + 10, 92, { alfa: kA, vurgu: 'limon' });
        E.formul(ctx, 'P(A \\cup B) = P(A) + P(B) − P(A \\cap B)', tx + tw / 2, ty + satir * 4.6 + 46, { boyut: 28, alfa: kA });
      } else {
        E.panel(ctx, ic.x, ty - 26, ic.w, 84, { alfa: kA, vurgu: 'limon' });
        E.formul(ctx, 'P(A \\cup B) = P(A) + P(B) − P(A \\cap B)', L.cx, ty + 16, { boyut: 27, alfa: kA });
      }
    }
  };

  /* =====================================================================
     7. Deney teoriye yaklaşır: 36 → 360 → 3600 → 36 000 atış
     ===================================================================== */
  const SIM_TOHUM = 916, SIM_N = 36000;
  const simCum = bellek('sim', () => {
    const r = E.rng(SIM_TOHUM);
    const c = []; for (let q = 0; q <= 12; q++) c.push(new Int32Array(SIM_N + 1));
    for (let k = 0; k < SIM_N; k++) {
      const s = 2 + Math.floor(r() * 6) + Math.floor(r() * 6);
      for (let q = 2; q <= 12; q++) c[q][k + 1] = c[q][k] + (q === s ? 1 : 0);
    }
    return c;
  });
  const simN = (t) => {
    // log ölçekte büyüme, durak noktalarında bekleme
    const l = kf(t, [[1.2, 0], [3.4, Math.log10(36), 'io2'], [6.2, Math.log10(36)], [7.6, Math.log10(360), 'io2'], [8.8, Math.log10(360)], [10.0, Math.log10(3600), 'io2'], [11.0, Math.log10(3600)], [12.4, Math.log10(36000), 'io2']]);
    return Math.min(SIM_N, Math.round(Math.pow(10, l)) - (t < 1.25 ? 1 : 0));
  };
  const deney = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const c = simCum;
    const n = simN(t);
    const hs = H ? { cx: ic.cx, base: ic.y1 - 56, sp: 92, w: 62, olc: 1700 } : { cx: ic.cx, base: ic.y1 - 60, sp: 56, w: 42, olc: 2350 };
    const gA = ara(t, 0.1, 0.9);
    E.cizgi(ctx, [[hs.cx - hs.sp * 5.6, hs.base + 2], [hs.cx + hs.sp * 5.6, hs.base + 2]], { renk: 'cizgi', kalinlik: 2, alfa: gA });
        for (let q = 2; q <= 12; q++) {
      const x = hs.cx + (q - 7) * hs.sp;
      const th = (6 - Math.abs(q - 7)) / 36;
      const hTh = th * hs.olc;
      // teorik hayalet
      ctx.save(); ctx.globalAlpha *= gA;
      ctx.setLineDash([7, 6]); ctx.strokeStyle = E.rgba(q === 7 ? 'limon' : 'tebesir', 0.75); ctx.lineWidth = 2;
      ctx.strokeRect(x - hs.w / 2, hs.base - hTh, hs.w, hTh); ctx.setLineDash([]);
      ctx.restore();
      // deneysel çubuk
      const rel = n > 0 ? c[q][n] / n : 0;
      const h = Math.min(rel * hs.olc, hs.base - ic.y - 150);
      if (h > 0.5) {
        const gr = ctx.createLinearGradient(0, hs.base - h, 0, hs.base);
        gr.addColorStop(0, E.rgba('turkuaz', 0.7)); gr.addColorStop(1, E.rgba('turkuaz', 0.12));
        ctx.fillStyle = gr; ctx.fillRect(x - hs.w / 2 + 5, hs.base - h, hs.w - 10, h);
        const yakin = Math.abs(h - hTh) < 3 && n >= 3600;
        E.cizgi(ctx, [[x - hs.w / 2 + 5, hs.base - h], [x + hs.w / 2 - 5, hs.base - h]], { renk: yakin ? 'limon' : 'turkuaz', kalinlik: 3, parilti: 1 });
      }
      E.yazi(ctx, String(q), x, hs.base + 24, { boyut: 24, agirlik: 640, renk: q === 7 ? 'limon' : 'gumus', alfa: gA });
    }
    // sayaç ve açıklama
    const sx = H ? ic.x + 4 : ic.cx, hz = H ? 'left' : 'center';
    E.yazi(ctx, 'ATIŞ SAYISI', sx, ic.y + 10, { boyut: 22, agirlik: 700, harfAra: 5, renk: 'turkuaz', hiza: hz, alfa: gA });
    E.yazi(ctx, binlik(Math.max(0, n)), sx, ic.y + 62, { boyut: E.yd(56, 60), agirlik: 760, hiza: hz, alfa: gA, parilti: 0.3 });
    const lx = H ? ic.x1 : ic.cx, lh = H ? 'right' : 'center';
    const leA = ara(t, 0.8, 1.4);
    E.yazi(ctx, '- - -  teorik: çıktı sayısı / 36', lx, ic.y + E.yd(14, 120), { boyut: 24, agirlik: 560, renk: 'tebesir', hiza: lh, alfa: leA });
    E.yazi(ctx, '▮  deneysel: göreli sıklık', lx, ic.y + E.yd(48, 154), { boyut: 24, agirlik: 560, renk: 'turkuaz', hiza: lh, alfa: leA });
    // P(7) karşılaştırma
    const pA = ara(t, 12.8, 13.5);
    if (pA > 0) {
      const p7 = c[7][n] / n;
      const px = H ? ic.x1 - 380 : ic.x, py = H ? ic.y + 92 : ic.y + 200, pw = H ? 380 : ic.w, ph = H ? 120 : 110;
      E.panel(ctx, px, py, pw, ph, { alfa: pA, vurgu: 'limon' });
      E.formul(ctx, `\\t{deneysel } P(7) ≈ ${ondalik(p7, 3).replace(',', '{,}')}`, px + pw / 2, py + ph * 0.32, { boyut: 30, alfa: pA });
      E.formul(ctx, `\\t{teorik } P(7) = \\frac{1}{6} ≈ 0{,}167`, px + pw / 2, py + ph * 0.72, { boyut: 30, alfa: pA, renk: 'limon' });
    }
  };

  /* ---------- Kartlar ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Eş olasılıklı çıktılarda:', formul: 'P(A) = \\frac{\\t{A’ya ait çıktılar}}{\\t{tüm çıktılar}}' },
    { tr: 'Liste, tablo, ağaç: örnek uzayı görünür kıl.' },
    { tr: 'Birleşim:', formul: 'P(A \\cup B) = P(A) + P(B) − P(A \\cap B)' },
    { tr: 'Deneme arttıkça deneysel olasılık teoriğe yaklaşır.' },
  ], { aralik: 1.5 });

  E.film({
    meta,
    sure: 117.9,
    sahneler: [
      { ad: 'Soğuk açılış: tavla ve 36 sonuç', bas: 0, son: 12.0, giris: 0, cikis: 0.7, itme: 0, ciz: acilis },
      { ad: 'İmza', bas: 11.7, son: 15.4, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 15.1, son: 19.4, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Örnek uzay: liste, tablo, ağaç', bas: 19.1, son: 44.2, ciz: ornekUzay },
      { ad: 'Yedinin köşegeni ve üçgen', bas: 43.9, son: 63.6, itme: 0.01, ciz: kosegen },
      { ad: 'Birleşim: ayrık ve ayrık olmayan', bas: 63.3, son: 82.6, ciz: birlesim },
      { ad: 'Deney teoriye yaklaşır', bas: 82.3, son: 101.1, ciz: deney },
      { ad: 'Aklında kalsın', bas: 100.8, son: 111.3, ciz: ozet },
      { ad: 'Laboratuvar', bas: 111.1, son: 117.9, cikis: 0.8, ciz: (c, s) => E.bitisKarti(c, s, meta) },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 6, renk1: 'menekse', renk2: 'turkuaz' }),
  });
})();
