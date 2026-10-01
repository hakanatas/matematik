/* ==========================================================================
   EKSEN 9.1.3 — Kaçış
   Tek fikir: Her sayı kümesi bir ışık halkasıdır. Bir işlemin sonucu halkanın
   dışına kaçtığında yeni, daha büyük bir halka doğar: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.
   Kapalılık = kaçamamak. Rasyoneller her yerde ama doğruda delikler var.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp } = E;

  const meta = {
    kod: 'MAT.9.1.3',
    tema: 'Sayılar',
    ad: 'Kaçış',
    adEn: 'Escape',
    labAd: 'Sayılar Laboratuvarı',
    labAciklama: 'Sayı doğrusu mikroskobuyla iki sayının arasına dal; hangi kümenin nerede delik bıraktığını gör.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-sayilar/',
  };

  /* ---------- Halka geometrisi ---------- */
  const RENK = ['turkuaz', 'gok', 'menekse', 'tebesir'];
  const AD = ['\\N', '\\Z', '\\Q', '\\R'];
  const geo = () => {
    const H = E.yatay, ic = E.L.icerik;
    return H
      ? { cx: ic.x + 300, cy: ic.cy, r: [72, 132, 192, 252], sx: 930 }
      : { cx: E.L.cx, cy: ic.y + 286, r: [78, 144, 210, 276], sx: E.L.cx };
  };
  const bantR = (g, k) => (k === 0 ? g.r[0] * 0.52 : (g.r[k - 1] + g.r[k]) / 2);
  // Halka elemanları: [formül, halka no, açı (rad)]
  const ELEMAN = [
    ['0', 0, Math.PI], ['1', 0, -Math.PI / 2], ['2', 0, 0], ['3', 0, Math.PI / 2],
    ['−1', 1, -2.3], ['−2', 1, 0.9], ['−5', 1, 2.5],
    ['\\frac{1}{2}', 2, 0.05], ['−\\frac{3}{4}', 2, 2.0], ['0{,}3', 2, -2.55],
    ['\\sqrt{2}', 3, 0.42], ['\\pi', 3, -2.05], ['−\\sqrt{3}', 3, 2.45],
  ];
  const elemanXY = (g, e) => { const r = bantR(g, e[1]); return [g.cx + Math.cos(e[2]) * r, g.cy + Math.sin(e[2]) * r]; };

  /** Bir halka: yumuşak hale + parlak çekirdek + plakalı etiket */
  const halka = (ctx, g, k, r, al, o = {}) => {
    if (al <= 0.002 || r <= 0) return;
    const renk = RENK[k];
    const p = o.p ?? 1;
    ctx.save(); ctx.globalAlpha *= al;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createRadialGradient(g.cx, g.cy, Math.max(0, r - 26), g.cx, g.cy, r + 26);
    gr.addColorStop(0, E.rgba(renk, 0)); gr.addColorStop(0.5, E.rgba(renk, 0.13 + 0.25 * (o.flas || 0))); gr.addColorStop(1, E.rgba(renk, 0));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(g.cx, g.cy, r + 26, 0, E.TAU); ctx.arc(g.cx, g.cy, Math.max(0, r - 26), 0, E.TAU, true); ctx.fill();
    ctx.restore();
    const pts = [];
    for (let i = 0; i <= 120; i++) { const a = -Math.PI / 2 + (i / 120) * E.TAU; pts.push([g.cx + Math.cos(a) * r, g.cy + Math.sin(a) * r]); }
    E.cizgi(ctx, pts, { renk, kalinlik: 2.5, parilti: 0.8 + (o.flas || 0), p });
    ctx.restore();
    if (o.etiket !== false && p > 0.9) {
      const a = -0.8;
      E.etiket(ctx, AD[k], g.cx + Math.cos(a) * r, g.cy + Math.sin(a) * r, { formul: true, boyut: 30, renk, plaka: 'gece', plakaAlfa: 0.9, kenar: renk, alfa: al * ara(p, 0.9, 1, 'lin') });
    }
  };
  /** Halkanın kırılması: geçiş noktasında mercan çatlaklar */
  const catlak = (ctx, x, y, a, p, al, tohum) => {
    if (al <= 0.002 || p <= 0) return;
    const r = E.rng(tohum);
    for (let i = 0; i < 5; i++) {
      const yon = a + (r() - 0.5) * 2.2;
      const pts = [[x, y]];
      let px = x, py = y;
      for (let j = 0; j < 3; j++) { const uz = 10 + r() * 14; const yy = yon + (r() - 0.5) * 0.9; px += Math.cos(yy) * uz; py += Math.sin(yy) * uz; pts.push([px, py]); }
      E.cizgi(ctx, pts, { renk: 'mercan', kalinlik: 2, parilti: 0.8, p, alfa: al });
    }
    E.isik(ctx, x, y, 90, 'mercan', 0.7 * al * E.nabiz(p, 0, 1));
  };
  /** Kaçan ışık noktası: (x0,y0) → (x1,y1), iz bırakarak */
  const kacan = (ctx, x0, y0, x1, y1, p, renk, al = 1) => {
    if (p <= 0 || al <= 0.002) return;
    const n = 14;
    for (let i = 0; i < n; i++) {
      const q = clamp(p - i * 0.035);
      if (q <= 0) break;
      const x = lerp(x0, x1, q), y = lerp(y0, y1, q);
      E.nokta(ctx, x, y, 7 * (1 - i / n), { renk, parilti: i === 0 ? 1.5 : 0.4, alfa: al * (1 - i / n) * (p >= 1 && i > 0 ? 0 : 1) });
    }
  };
  /** Halkalar sahnesi: durum = { r:[..], al:[..], flas:[..], elemanAl(i) } */
  const halkalarCiz = (ctx, g, d) => {
    for (let k = 3; k >= 0; k--) halka(ctx, g, k, d.r[k], d.al[k], { flas: d.flas ? d.flas[k] : 0, p: d.p ? d.p[k] : 1 });
    ELEMAN.forEach((e, i) => {
      const a = d.elemanAl(i);
      if (a <= 0.002) return;
      const [x, y] = elemanXY(g, e);
      E.formul(ctx, e[0], x, y, { boyut: e[1] === 0 ? 28 : 26, renk: e[1] === 3 ? 'tebesir' : RENK[e[1]], alfa: a });
    });
  };

  /* ---------- 1. Soğuk açılış: 3 − 5 ---------- */
  const acilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const g = geo();
    const z = kf(t, [[0, H ? 2.0 : 1.7], [3.0, H ? 2.0 : 1.7], [6.0, 1.0, 'io3']]);
    const kx = kf(t, [[0, g.cx], [3.0, g.cx], [6.0, H ? L.cx : g.cx, 'io3']]);
    const ky = kf(t, [[0, g.cy], [3.0, g.cy], [6.0, H ? L.cy : L.cy, 'io3']]);
    ctx.save();
    E.kamera(ctx, { x: kx + (H ? 0 : 0), y: ky, z });
    const rZ = kf(t, [[4.4, g.r[0]], [5.8, g.r[1], 'geri']]);
    const hedef = elemanXY(g, ELEMAN[5]);
    const p = ara(t, 3.0, 4.4, 'gir2');
    const gec = clamp((p - 0.45) / 0.1);
    halkalarCiz(ctx, g, {
      r: [g.r[0], rZ, 0, 0], al: [1, ara(t, 4.2, 4.6), 0, 0], flas: [E.nabiz(t, 3.6, 0.8), E.nabiz(t, 5.0, 1.2), 0, 0], p: [ara(t, 0.2, 1.6), 1, 1, 1],
      elemanAl: (i) => (i < 4 ? ara(t, 1.0 + i * 0.15, 1.6 + i * 0.15) : i === 5 ? ara(t, 4.3, 4.7) : i < 7 ? ara(t, 6.0 + i * 0.2, 6.6 + i * 0.2) : 0),
    });
    // 3 ve 5'in nabzı
    const e3 = elemanXY(g, ELEMAN[3]);
    E.isik(ctx, e3[0], e3[1], 60, 'limon', 0.5 * E.nabiz(t, 2.2, 0.9));
    // kaçış
    kacan(ctx, g.cx, g.cy, hedef[0], hedef[1], p, 'limon', 1 - ara(t, 4.4, 4.8));
    const ca = Math.atan2(hedef[1] - g.cy, hedef[0] - g.cx);
    catlak(ctx, g.cx + Math.cos(ca) * g.r[0], g.cy + Math.sin(ca) * g.r[0], ca, ara(t, 3.75, 4.3), 1 - ara(t, 5.2, 6.0), 31);
    ctx.restore();
    // yazılar
    const fx = H ? g.sx : L.cx, fy = H ? ic.y + 110 : ic.y + 640;
    const f1 = ara(t, 1.8, 2.5);
    E.formul(ctx, '3 − 5 = \\c{limon}{?}', fx, fy, { boyut: H ? 64 : 56, alfa: f1 * (1 - ara(t, 4.6, 5.0)) });
    E.formul(ctx, '3 − 5 = \\c{limon}{−2} \\notin \\c{turkuaz}{\\N}', fx, fy, { boyut: H ? 56 : 50, alfa: ara(t, 4.7, 5.3) });
    const m = ara(t, 7.6, 8.4, 'cik3');
    E.yazi(ctx, 'Bazı sorular, sorulduğu kümeye sığmaz.', fx, H ? ic.y + 330 : ic.y + 736, { boyut: H ? 38 : 32, agirlik: 700, renk: 'limon', alfa: m, maxGen: H ? 520 : ic.w - 20, parilti: 0.3, parRenk: 'limon' });
    E.yazi(ctx, 'Halka genişler: tam sayılar doğar.', fx, H ? ic.y + 200 : ic.y + 700, { boyut: H ? 30 : 28, agirlik: 560, renk: 'gok', alfa: ara(t, 5.4, 6.0) * (1 - ara(t, 7.2, 7.6)), maxGen: H ? 520 : ic.w - 20 });
  };

  /* ---------- 4. Halkalar doğuyor ---------- */
  const dogum = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const g = geo();
    // ℚ doğumu
    const hQ = elemanXY(g, ELEMAN[7]);
    const pQ = ara(t, 1.8, 3.0, 'gir2');
    const rQ = kf(t, [[3.0, g.r[1]], [4.3, g.r[2], 'geri']]);
    // ℝ doğumu
    const hR = elemanXY(g, ELEMAN[10]);
    const pR = ara(t, 9.6, 10.8, 'gir2');
    const rR = kf(t, [[10.8, g.r[2]], [12.1, g.r[3], 'geri']]);
    halkalarCiz(ctx, g, {
      r: [g.r[0], g.r[1], rQ, rR], al: [1, 1, ara(t, 2.9, 3.2), ara(t, 10.7, 11.0)],
      flas: [0, E.nabiz(t, 2.4, 0.8), E.nabiz(t, 3.6, 1.2) + E.nabiz(t, 10.2, 0.8), E.nabiz(t, 11.4, 1.2)],
      elemanAl: (i) => (i < 7 ? 1 : i === 7 ? ara(t, 2.9, 3.3) : i < 10 ? ara(t, 4.6 + (i - 8) * 0.3, 5.2 + (i - 8) * 0.3) : i === 10 ? ara(t, 10.7, 11.1) : ara(t, 12.2 + (i - 11) * 0.3, 12.8 + (i - 11) * 0.3)),
    });
    // 1 ve 2'nin nabzı
    const e1 = elemanXY(g, ELEMAN[1]), e2 = elemanXY(g, ELEMAN[2]);
    E.isik(ctx, e1[0], e1[1], 50, 'limon', 0.5 * E.nabiz(t, 1.0, 0.9));
    E.isik(ctx, e2[0], e2[1], 50, 'limon', 0.5 * E.nabiz(t, 1.0, 0.9));
    kacan(ctx, g.cx, g.cy, hQ[0], hQ[1], pQ, 'limon', 1 - ara(t, 3.0, 3.4));
    const aQ = Math.atan2(hQ[1] - g.cy, hQ[0] - g.cx);
    catlak(ctx, g.cx + Math.cos(aQ) * g.r[1], g.cy + Math.sin(aQ) * g.r[1], aQ, ara(t, 2.4, 2.9), 1 - ara(t, 3.6, 4.4), 47);
    kacan(ctx, g.cx, g.cy, hR[0], hR[1], pR, 'limon', 1 - ara(t, 10.8, 11.2));
    const aR = Math.atan2(hR[1] - g.cy, hR[0] - g.cx);
    catlak(ctx, g.cx + Math.cos(aR) * g.r[2], g.cy + Math.sin(aR) * g.r[2], aR, ara(t, 10.25, 10.7), 1 - ara(t, 11.4, 12.2), 59);

    // Sağ sütun (yatay) / alt bölge (dikey)
    const fx = H ? g.sx : L.cx;
    const A1 = ara(t, 0.6, 1.2) * (1 - ara(t, 5.6, 6.1));
    const y1 = H ? ic.y + 80 : ic.y + 620, y2 = H ? ic.y + 170 : ic.y + 700;
    E.formul(ctx, t < 3.0 ? '1 : 2 = \\c{limon}{?}' : '1 : 2 = \\c{limon}{\\frac{1}{2}} \\notin \\c{gok}{\\Z}', fx, y1, { boyut: H ? 54 : 48, alfa: A1 });
    E.formul(ctx, '\\c{menekse}{\\Q} = \\{ \\frac{a}{b} \\}', fx, y2, { boyut: 1, alfa: 0 });
    // ℚ tanımı (kesir biçimi) — yerel küme parantezleri yerine sözel
    E.formul(ctx, '\\c{menekse}{\\Q}:\\; \\frac{a}{b},\\;\\; a, b \\in \\Z,\\; b \\ne 0', fx, y2 + (H ? 10 : 0), { boyut: H ? 40 : 36, alfa: ara(t, 3.8, 4.4) * (1 - ara(t, 5.6, 6.1)) });
    // Birim kare
    const kA = ara(t, 6.0, 6.7) * (1 - ara(t, 13.0, 13.6));
    if (kA > 0) {
      const kb = H ? 170 : 130;
      const kx = H ? fx - kb / 2 : ic.x + 40, ky = H ? ic.y + 60 : ic.y + 610;
      ctx.save(); ctx.globalAlpha *= kA;
      E.cokgen(ctx, [[kx, ky], [kx + kb, ky], [kx + kb, ky + kb], [kx, ky + kb]], { renk: 'menekse', alfa: 0.12, kenar: true, kalinlik: 2.5 });
      E.cizgi(ctx, [[kx, ky + kb], [kx + kb, ky]], { renk: 'limon', kalinlik: 4, parilti: 1, p: ara(t, 6.6, 7.6) });
      E.yazi(ctx, '1', kx + kb / 2, ky + kb + 26, { boyut: 26, agirlik: 600, renk: 'menekse' });
      E.yazi(ctx, '1', kx - 22, ky + kb / 2, { boyut: 26, agirlik: 600, renk: 'menekse' });
      E.formul(ctx, 'd', kx + kb / 2 + 18, ky + kb / 2 - 18, { boyut: 30, renk: 'limon', alfa: ara(t, 7.2, 7.8) });
      ctx.restore();
      const tx = H ? fx : ic.x + 210 + (ic.x1 - ic.x - 210) / 2 + 10, hz = 'center';
      const ty = H ? ic.y + 310 : ic.y + 616;
      const sat = H ? 66 : 62;
      E.formul(ctx, 'd^{2} = 1^{2} + 1^{2} = 2', tx, ty, { boyut: H ? 40 : 34, alfa: kA * ara(t, 7.6, 8.2), hiza: hz });
      E.formul(ctx, 'd = \\c{limon}{\\sqrt{2}} \\notin \\c{menekse}{\\Q}', tx, ty + sat, { boyut: H ? 40 : 34, alfa: kA * ara(t, 8.4, 9.0), hiza: hz });
      E.yazi(ctx, 'Hiçbir kesre eşit değil.', tx, ty + sat * 2, { boyut: H ? 28 : 26, agirlik: 560, renk: 'gumus', alfa: kA * ara(t, 9.0, 9.6), hiza: hz });
    }
    // Zincir
    const zA = ara(t, 13.4, 14.2, 'cik3');
    E.formul(ctx, '\\c{turkuaz}{\\N} \\subset \\c{gok}{\\Z} \\subset \\c{menekse}{\\Q} \\subset \\c{tebesir}{\\R}', fx, H ? ic.y + 200 : ic.y + 650, { boyut: H ? 64 : 56, alfa: zA, parilti: 0.3 * zA });
    E.yazi(ctx, 'Her halka, içindekileri kapsar.', fx, H ? ic.y + 290 : ic.y + 730, { boyut: H ? 30 : 28, agirlik: 560, renk: 'gumus', alfa: ara(t, 14.4, 15.0), maxGen: H ? 480 : ic.w });
  };

  /* ---------- 5. Kapalılık tablosu ---------- */
  const KUME = ['\\N', '\\Z', '\\Q', '\\R'];
  const ISL = ['+', '−', '·', ':'];
  const HUCRE = [
    [1, '3 − 5', 1, '1 : 2'],
    [1, 1, 1, '1 : 2'],
    [1, 1, 1, 2],
    [1, 1, 1, 2],
  ];
  const kapalilik = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const lw = H ? 96 : 92, cw = H ? 132 : 132, rh = H ? 80 : 84;
    const tw = lw + cw * 4;
    const x0 = H ? ic.x + 30 : L.cx - tw / 2, y0 = H ? ic.y + 34 : ic.y + 20;
    const ga = ara(t, 0.2, 0.9);
    E.panel(ctx, x0 - 14, y0 - 10, tw + 28, rh * 5 + 20, { alfa: ga * 0.9, vurgu: 'turkuaz' });
    // başlıklar
    ISL.forEach((op, j) => E.formul(ctx, op, x0 + lw + cw * j + cw / 2, y0 + rh / 2, { boyut: 40, renk: 'gumus', alfa: ga }));
    KUME.forEach((k, i) => {
      E.formul(ctx, k, x0 + lw / 2, y0 + rh * (i + 1) + rh / 2, { boyut: 40, renk: RENK[i], alfa: ga });
      E.cizgi(ctx, [[x0, y0 + rh * (i + 1)], [x0 + tw, y0 + rh * (i + 1)]], { renk: 'sis', kalinlik: 1.2, alfa: ga });
    });
    for (let j = 0; j < 4; j++) E.cizgi(ctx, [[x0 + lw + cw * j, y0 + 8], [x0 + lw + cw * j, y0 + rh * 5 - 8]], { renk: 'sis', kalinlik: 1.2, alfa: ga });
    // hücreler
    const zaman = [1.0, 3.6, 6.2, 8.2];
    HUCRE.forEach((sat, i) => sat.forEach((h, j) => {
      const tc = zaman[i] + j * 0.45;
      const a = ara(t, tc, tc + 0.4, 'cik3');
      if (a <= 0) return;
      const cx = x0 + lw + cw * j + cw / 2, cy = y0 + rh * (i + 1) + rh / 2;
      if (h === 1 || h === 2) {
        E.yazi(ctx, h === 2 ? '✓*' : '✓', cx, cy, { boyut: 36, agirlik: 700, renk: 'turkuaz', alfa: a });
      } else {
        E.isik(ctx, cx, cy, 70, 'mercan', 0.5 * E.nabiz(t, tc, 0.8));
        E.yazi(ctx, '✗', cx, cy - 15, { boyut: 30, agirlik: 700, renk: 'mercan', alfa: a });
        E.formul(ctx, h, cx, cy + 20, { boyut: 22, renk: 'gumus', alfa: a });
      }
    }));
    E.yazi(ctx, '* sıfıra bölme hariç', x0 + tw, y0 + rh * 5 + 34, { boyut: 22, agirlik: 500, renk: 'gumus', hiza: 'right', alfa: ara(t, 10.0, 10.6) });
    // açıklama
    const fx = H ? 960 : L.cx;
    const fy = H ? ic.y + 80 : ic.y + 530;
    E.yazi(ctx, 'KAPALILIK', fx, fy, { boyut: 24, agirlik: 700, harfAra: 6, renk: 'turkuaz', alfa: ara(t, 0.6, 1.2) });
    E.yazi(ctx, 'İşlemin sonucu kümeden kaçmıyorsa, küme o işleme göre kapalıdır.', fx, fy + (H ? 76 : 64), { boyut: H ? 30 : 28, agirlik: 560, alfa: ara(t, 1.0, 1.6), maxGen: H ? 440 : ic.w - 20 });
    const sA = ara(t, 11.0, 11.8, 'cik3');
    E.formul(ctx, '\\forall a, b \\in \\R:\\;\\; a · b \\in \\R', fx, fy + (H ? 220 : 160), { boyut: H ? 40 : 38, renk: 'limon', alfa: sA, parilti: 0.3 * sA });
    E.yazi(ctx, 'ℝ çarpmaya göre kapalıdır.', fx, fy + (H ? 284 : 218), { boyut: H ? 28 : 26, agirlik: 560, renk: 'gumus', alfa: ara(t, 11.8, 12.4) });
  };

  /* ---------- 6. Arada olma: sonsuz yakınlaştırma + doğrudan ispat ---------- */
  const kesirYaz = (j, k) => {
    if (k === 0) return String(j);
    while (j % 2 === 0 && k > 0) { j /= 2; k--; }
    return k === 0 ? String(j) : `\\frac{${j}}{${Math.pow(2, k)}}`;
  };
  const aradaOlma = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const ly = H ? ic.y + 120 : ic.y + 150;
    const lx = H ? 120 : 60, lw = H ? 1040 : 600;
    // Bölüm 1: ℤ — 2 ile 3 arası boş
    const b1 = ara(t, 0.1, 0.7) * (1 - ara(t, 4.4, 5.0));
    if (b1 > 0.002) {
      ctx.save(); ctx.globalAlpha *= b1;
      const d = E.sayiDogrusu({ x: lx + 40, y: ly, w: lw - 80, min: 0, max: 5 });
      d.ciz(ctx, { adim: 1, boyut: 26 });
      for (let v = 0; v <= 5; v++) E.nokta(ctx, d.px(v), ly, 8, { renk: 'gok', parilti: 1 });
      const qa = ara(t, 1.0, 1.6);
      ctx.save(); ctx.globalAlpha *= qa * 0.5;
      ctx.fillStyle = E.rgba('mercan', 0.18); ctx.fillRect(d.px(2) + 14, ly - 34, d.px(3) - d.px(2) - 28, 68);
      ctx.restore();
      E.yazi(ctx, '?', (d.px(2) + d.px(3)) / 2, ly - 60, { boyut: 40, agirlik: 700, renk: 'mercan', alfa: qa * (1 - ara(t, 2.2, 2.6)) });
      E.yazi(ctx, 'boş', (d.px(2) + d.px(3)) / 2, ly - 60, { boyut: 30, agirlik: 700, renk: 'mercan', alfa: ara(t, 2.4, 2.9) });
      E.yazi(ctx, '2 ile 3 arasında hiç tam sayı yok.', L.cx, H ? ic.y + 280 : ic.y + 320, { boyut: H ? 36 : 32, agirlik: 640, alfa: ara(t, 1.4, 2.0), maxGen: ic.w - 20 });
      E.yazi(ctx, 'ℤ sıralıdır ama "arada olma" özelliği yoktur.', L.cx, H ? ic.y + 350 : ic.y + 420, { boyut: H ? 30 : 28, agirlik: 520, renk: 'gok', alfa: ara(t, 2.6, 3.2), maxGen: ic.w - 20 });
      ctx.restore();
    }
    // Bölüm 2: ℚ — sonsuz yakınlaştırma
    const b2 = ara(t, 4.6, 5.4);
    if (b2 > 0.002) {
      ctx.save(); ctx.globalAlpha *= b2;
      const z = kf(t, [[6.4, 0], [15.6, 5, 'io2']]);
      const w = 1.2 * Math.pow(2, -z);
      const c = 0.4 + 0.1 * Math.pow(2, -z);
      const lo = c - w / 2, hi = c + w / 2;
      const px = (v) => lx + ((v - lo) / w) * lw;
      ctx.save(); ctx.beginPath(); ctx.rect(lx - 20, ly - 120, lw + 40, 260); ctx.clip();
      E.cizgi(ctx, [[lx - 10, ly], [lx + lw + 10, ly]], { renk: 'cizgi', kalinlik: 2.5 });
      const etiketMin = H ? 120 : 110;
      const etiketler = [];
      for (let k = 0; k <= 11; k++) {
        const adim = Math.pow(2, -k);
        const ara_ = (adim / w) * lw;
        const gor = clamp((ara_ - 14) / 40) * ara(t, 5.2 + Math.min(k, 4) * 0.5, 5.7 + Math.min(k, 4) * 0.5);
        if (gor <= 0.01) continue;
        const j0 = Math.ceil(lo / adim), j1 = Math.floor(hi / adim);
        for (let j = j0; j <= j1; j++) {
          if (k > 0 && j % 2 === 0) continue;
          const x = px(j * adim);
          const yeni = k >= 1 ? E.nabiz(t, 5.2 + Math.min(k, 4) * 0.5, 0.8) : 0;
          E.cizgi(ctx, [[x, ly - 10 - 6 * gor], [x, ly + 10 + 6 * gor]], { renk: 'menekse', kalinlik: 2, alfa: gor });
          E.nokta(ctx, x, ly, 4 + 3 * gor, { renk: k === 0 ? 'tebesir' : 'menekse', parilti: 0.7 + yeni, alfa: gor });
          if (ara_ >= etiketMin && x > lx + 30 && x < lx + lw - 30) etiketler.push([x, kesirYaz(j, k), clamp((ara_ - etiketMin) / 50) * gor]);
        }
      }
      for (const [x, f, a] of etiketler) E.formul(ctx, f, x, ly + 52, { boyut: 26, renk: 'gumus', alfa: a });
      ctx.restore();
      E.formul(ctx, '\\c{menekse}{\\Q}', lx + lw - 10, ly - 70, { boyut: 36, hiza: 'right', alfa: ara(t, 5.0, 5.6) });
      E.yazi(ctx, 'yakınlaş: ×' + String(Math.round(Math.pow(2, z))), lx + 10, ly - 70, { boyut: 22, font: 'mono', renk: 'gumus', hiza: 'left', alfa: ara(t, 6.4, 7.0) });
      ctx.restore();
      // İspat paneli
      const px0 = H ? ic.x + 120 : ic.x, pw = H ? ic.w - 240 : ic.w, py0 = H ? ic.y + 250 : ic.y + 300, ph = H ? 270 : 470;
      const pa = ara(t, 6.2, 6.9);
      E.panel(ctx, px0, py0, pw, ph, { vurgu: 'limon', alfa: pa });
      E.yazi(ctx, 'DOĞRUDAN İSPAT', px0 + 30, py0 + 32, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'limon', hiza: 'left', alfa: pa });
      const cx = px0 + pw / 2;
      const sat = H ? 58 : 82;
      const fb = H ? 34 : 32;
      E.formul(ctx, '\\t{Hipotez: }\\; a, b \\in \\Q,\\;\\; a < b', cx, py0 + (H ? 80 : 100), { boyut: fb, renk: 'gumus', alfa: ara(t, 7.0, 7.6) });
      E.formul(ctx, 'a = \\frac{a + a}{2} < \\c{limon}{\\frac{a + b}{2}} < \\frac{b + b}{2} = b', cx, py0 + (H ? 80 : 100) + sat * (H ? 1.25 : 1.3), { boyut: fb, alfa: ara(t, 8.4, 9.0), aciga: ara(t, 8.4, 10.0, 'lin') });
      E.formul(ctx, '\\frac{a + b}{2} \\in \\Q', cx, py0 + (H ? 80 : 100) + sat * (H ? 2.45 : 2.6), { boyut: fb, alfa: ara(t, 10.4, 11.0), renk: 'tebesir' });
      E.yazi(ctx, H ? '(toplama ve bölme ℚ’de kapalı)' : '(toplama ve bölme ℚ’de kapalı)', cx, py0 + (H ? 80 : 100) + sat * (H ? 2.45 : 2.6) + (H ? 0 : 50), { boyut: 22, renk: 'gumus', alfa: ara(t, 10.8, 11.4), hiza: H ? 'left' : 'center', ...(H ? { } : {}) });
      E.yazi(ctx, 'Hüküm: iki rasyonelin arasında her zaman bir rasyonel vardır.', cx, py0 + ph - (H ? 30 : 50), { boyut: H ? 28 : 28, agirlik: 640, renk: 'limon', alfa: ara(t, 12.0, 12.7), maxGen: pw - 40 });
    }
  };

  /* ---------- 7. Sürpriz: delik ---------- */
  const KOK2 = Math.SQRT2;
  const ondalikYaz = (v, m) => v.toFixed(m).replace('.', ',');
  const delik = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const ly = H ? ic.y + 240 : ic.y + 300;
    const lx = H ? 120 : 60, lw = H ? 1040 : 600;
    const z = kf(t, [[2.4, 0], [10.0, 4.4, 'io2']]);
    const w = 1.3 * Math.pow(10, -z);
    const c = KOK2 + (1.5 - KOK2) * Math.pow(10, -z);
    const lo = c - w / 2, hi = c + w / 2;
    const px = (v) => lx + ((v - lo) / w) * lw;
    const dol = ara(t, 10.6, 11.8, 'io3');
    const ga = ara(t, 0, 0.8);
    // Soru
    E.yazi(ctx, 'Rasyoneller her yerde. O hâlde doğru dolu mu?', L.cx, H ? ic.y + 40 : ic.y + 30, { boyut: H ? 34 : 30, agirlik: 640, alfa: ara(t, 0.2, 0.9) * (1 - ara(t, 10.2, 10.8)), maxGen: ic.w - 20 });
    E.yazi(ctx, 'Gerçek sayılar delikleri doldurur. Doğru artık kesintisiz.', L.cx, H ? ic.y + 40 : ic.y + 30, { boyut: H ? 34 : 30, agirlik: 700, renk: 'limon', alfa: ara(t, 11.6, 12.3), maxGen: ic.w - 20, parilti: 0.3, parRenk: 'limon' });
    ctx.save(); ctx.globalAlpha *= ga;
    ctx.save(); ctx.beginPath(); ctx.rect(lx - 20, ly - 120, lw + 40, 260); ctx.clip();
    E.cizgi(ctx, [[lx - 10, ly], [lx + lw + 10, ly]], { renk: 'cizgi', kalinlik: 2.5 });
    const etiketler = [];
    for (let m = 0; m <= 7; m++) {
      const adim = Math.pow(10, -m);
      const ar = (adim / w) * lw;
      const gor = clamp((ar - 10) / 40);
      if (gor <= 0.01) continue;
      const j0 = Math.ceil(lo / adim - 1e-9), j1 = Math.floor(hi / adim + 1e-9);
      if (j1 - j0 > 200) continue;
      for (let j = j0; j <= j1; j++) {
        if (m > 0 && j % 10 === 0) continue;
        const x = px(j * adim);
        E.cizgi(ctx, [[x, ly - 6 - 8 * gor], [x, ly + 6 + 8 * gor]], { renk: 'menekse', kalinlik: 1.6 + gor, alfa: gor * 0.9 });
        E.nokta(ctx, x, ly, 2.5 + 2.5 * gor, { renk: 'menekse', parilti: 0.6, alfa: gor });
        if (ar >= (H ? 150 : 130) && x > lx + 50 && x < lx + lw - 50) etiketler.push([x, ondalikYaz(j * adim, m), clamp((ar - (H ? 150 : 130)) / 60) * gor]);
      }
    }
    for (const [x, f, a] of etiketler) E.yazi(ctx, f, x, ly + 46, { boyut: 24, agirlik: 520, renk: 'gumus', alfa: a });
    // ℝ dolumu: kesintisiz ışık
    if (dol > 0) {
      const g = ctx.createLinearGradient(0, ly - 30, 0, ly + 30);
      g.addColorStop(0, E.rgba('tebesir', 0)); g.addColorStop(0.5, E.rgba('tebesir', 0.25 * dol)); g.addColorStop(1, E.rgba('tebesir', 0));
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(lx - 10, ly - 30, (lw + 20) * dol, 60); ctx.restore();
      E.cizgi(ctx, [[lx - 10, ly], [lx - 10 + (lw + 20) * dol, ly]], { renk: 'tebesir', kalinlik: 4, parilti: 1 });
    }
    ctx.restore();
    // delik
    const hx = px(KOK2);
    const da = ara(t, 1.2, 1.8);
    if (dol < 1) {
      E.nokta(ctx, hx, ly, 12 + 2 * Math.sin(t * 5), { renk: 'mercan', bos: true, parilti: 0.6, alfa: da * (1 - dol) });
      ctx.save(); ctx.globalAlpha *= da * (1 - dol) * 0.9; ctx.fillStyle = E.R('gece'); ctx.beginPath(); ctx.arc(hx, ly, 8, 0, E.TAU); ctx.fill(); ctx.restore();
    }
    E.nokta(ctx, hx, ly, 10, { renk: 'tebesir', parilti: 1.6, alfa: dol });
    E.isik(ctx, hx, ly, 260, 'tebesir', 0.6 * E.nabiz(t, 11.0, 1.4));
    E.formul(ctx, '\\sqrt{2}', hx, ly - 66, { boyut: 36, renk: dol > 0.5 ? 'tebesir' : 'mercan', alfa: da });
    E.yazi(ctx, dol > 0.5 ? '∈ ℝ' : 'ışık düşmüyor', hx, ly - 110, { boyut: 24, agirlik: 600, renk: dol > 0.5 ? 'limon' : 'mercan', alfa: ara(t, 3.0, 3.6) * (1 - ara(t, 10.2, 10.6)) + ara(t, 11.4, 12.0) });
    ctx.restore();
    // Yaklaşım sayacı
    const m = clamp(Math.floor(z + 0.75) + 1, 1, 6);
    const yak = ondalikYaz(Math.floor(KOK2 * Math.pow(10, m)) / Math.pow(10, m), m);
    const ky = H ? ic.y + 400 : ic.y + 500;
    const sA = ara(t, 2.6, 3.2) * (1 - ara(t, 10.2, 10.8));
    E.formul(ctx, `\\sqrt{2} ≈ ${yak.replace(',', '{,}')}…`, L.cx, ky, { boyut: H ? 46 : 42, renk: 'tebesir', alfa: sA });
    E.formul(ctx, `${yak.replace(',', '{,}')} = \\frac{${Math.floor(KOK2 * Math.pow(10, m))}}{${'1' + '0'.repeat(m)}} \\in \\Q`, L.cx, ky + (H ? 76 : 80), { boyut: H ? 32 : 28, renk: 'menekse', alfa: sA * ara(t, 4.0, 4.6) });
    E.yazi(ctx, 'Her yaklaşım rasyonel. Ama √2’nin kendisi hiçbir kesre eşit değil.', L.cx, H ? ky - 76 : ky + 170, { boyut: H ? 28 : 26, agirlik: 560, renk: 'gumus', alfa: ara(t, 6.0, 6.6) * (1 - ara(t, 10.2, 10.8)), maxGen: ic.w - 30 });
    E.formul(ctx, '\\c{menekse}{\\Q} \\cup \\{\\t{irrasyoneller}\\} = \\R', L.cx, ky, { boyut: 1, alfa: 0 });
    E.yazi(ctx, 'ℚ + irrasyoneller = ℝ', L.cx, ky + (H ? 30 : 40), { boyut: H ? 40 : 36, agirlik: 700, renk: 'tebesir', alfa: ara(t, 12.2, 12.9) });
  };

  /* ---------- 8. Tek karşıt örnek ---------- */
  const karsit = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const px0 = H ? ic.x + 90 : ic.x, pw = H ? ic.w - 180 : ic.w, py0 = H ? ic.y + 14 : ic.y + 10, ph = H ? 120 : 160;
    const kir = ara(t, 5.4, 6.2);
    const titre = E.nabiz(t, 5.3, 0.5) * 6;
    const oA = ara(t, 0.2, 0.9) * (1 - ara(t, 8.4, 9.0) * 0.0);
    const ust = 1 - ara(t, 8.2, 8.8);
    ctx.save(); ctx.translate(titre * Math.sin(t * 90), 0);
    E.panel(ctx, px0, py0, pw, ph, { vurgu: kir > 0.5 ? 'mercan' : 'turkuaz', alfa: oA * ust });
    E.yazi(ctx, 'ÖNERME', px0 + 30, py0 + 30, { boyut: 22, agirlik: 700, harfAra: 4, renk: kir > 0.5 ? 'mercan' : 'turkuaz', hiza: 'left', alfa: oA * ust });
    E.yazi(ctx, 'İki irrasyonel sayının çarpımı irrasyoneldir.', px0 + pw / 2, py0 + ph / 2 + (H ? 14 : 18), { boyut: H ? 34 : 32, agirlik: 640, alfa: oA * ust, maxGen: pw - 60 });
    // çatlaklar
    if (kir > 0) {
      const r = E.rng(77);
      const ox = px0 + pw * 0.72, oy = py0 + ph * 0.55;
      for (let i = 0; i < 9; i++) {
        const yon = r() * E.TAU; const pts = [[ox, oy]]; let x = ox, y = oy;
        for (let j = 0; j < 5; j++) { const uz = 18 + r() * 34; const yy = yon + (r() - 0.5) * 0.8; x += Math.cos(yy) * uz; y += Math.sin(yy) * uz * 0.6; x = clamp(x, px0 + 6, px0 + pw - 6); y = clamp(y, py0 + 6, py0 + ph - 6); pts.push([x, y]); }
        E.cizgi(ctx, pts, { renk: 'mercan', kalinlik: 2.2, parilti: 0.9, p: kir, alfa: ust });
      }
      E.isik(ctx, ox, oy, 240, 'mercan', 0.6 * E.nabiz(t, 5.4, 0.9));
    }
    ctx.restore();
    // denemeler
    const satirlar = [
      ['\\sqrt{2} · \\sqrt{3} = \\sqrt{6}', 'irrasyonel ✓', 'turkuaz', 1.6],
      ['\\pi · \\pi = \\pi^{2}', 'irrasyonel ✓', 'turkuaz', 2.8],
      ['\\sqrt{2} · \\sqrt{2} = \\c{limon}{2}', 'rasyonel ✗', 'mercan', 4.2],
    ];
    satirlar.forEach(([f, v, rk, ts], i) => {
      const a = ara(t, ts, ts + 0.6, 'cik3') * ust;
      const y = (H ? ic.y + 210 : ic.y + 260) + i * (H ? 84 : 100);
      E.formul(ctx, f, H ? L.cx - 120 : L.cx - 90, y, { boyut: H ? 42 : 38, alfa: a, hiza: 'center' });
      E.yazi(ctx, v, H ? L.cx + 220 : L.cx + 200, y, { boyut: H ? 30 : 26, agirlik: 700, renk: rk, alfa: a * ara(t, ts + 0.5, ts + 1.0) });
    });
    E.yazi(ctx, 'Tek bir karşıt örnek yeter: önerme yanlış.', L.cx, H ? ic.y + 480 : ic.y + 610, { boyut: H ? 32 : 30, agirlik: 700, renk: 'mercan', alfa: ara(t, 6.2, 6.8) * ust, maxGen: ic.w - 30 });
    // karşılaştırma kartları
    const kA = (i) => ara(t, 8.8 + i * 1.0, 9.6 + i * 1.0, 'cik3');
    const kartlar = [
      ['DOĞRUDAN İSPAT', 'turkuaz', 'Her durumu kapsar: hipotezden hükme adım adım gider.', 'a < b \\Rightarrow a < \\frac{a + b}{2} < b'],
      ['AKSİNE ÖRNEK', 'mercan', '“Her” diyen bir önermeyi tek bir örnek yıkar.', '\\sqrt{2} · \\sqrt{2} = 2 \\in \\Q'],
    ];
    kartlar.forEach(([b, rk, m, f], i) => {
      const a = kA(i);
      if (a <= 0) return;
      let x, y, w, h;
      if (H) { w = 544; h = 330; x = L.cx - w - 12 + i * (w + 24); y = ic.y + 40; }
      else { w = ic.w; h = 300; x = ic.x; y = ic.y + 40 + i * (h + 30); }
      y += (1 - a) * 24;
      E.panel(ctx, x, y, w, h, { vurgu: rk, alfa: a });
      E.yazi(ctx, b, x + 36, y + 44, { boyut: 24, agirlik: 700, harfAra: 4, renk: rk, hiza: 'left', alfa: a });
      E.yazi(ctx, m, x + 36, y + (H ? 120 : 112), { boyut: H ? 30 : 30, agirlik: 560, hiza: 'left', alfa: a, maxGen: w - 72 });
      E.formul(ctx, f, x + w / 2, y + h - (H ? 76 : 70), { boyut: H ? 38 : 38, renk: rk, alfa: a });
    });
  };

  /* ---------- Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Sayı kümeleri iç içe halkalardır.', formul: '\\N \\subset \\Z \\subset \\Q \\subset \\R' },
    { tr: 'Kapalılık: işlemin sonucu kümeden kaçmaz.', formul: '3 − 5 = −2 \\notin \\N' },
    { tr: 'İki rasyonel arasında her zaman bir rasyonel var.', formul: 'a < \\frac{a + b}{2} < b' },
    { tr: 'Tek karşıt örnek “her” önermesini çürütür.', formul: '\\sqrt{2} · \\sqrt{2} = 2 \\in \\Q' },
  ], { aralik: 1.6 });
  const bitis = (ctx, s) => E.bitisKarti(ctx, s, meta);

  E.film({
    meta,
    sure: 113.5,
    sahneler: [
      { ad: 'Soğuk açılış: 3 − 5', bas: 0, son: 11.0, giris: 0, cikis: 0.7, ciz: acilis, itme: 0 },
      { ad: 'İmza', bas: 10.7, son: 14.4, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 14.1, son: 18.4, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Halkalar doğuyor', bas: 18.1, son: 35.0, ciz: dogum },
      { ad: 'Kapalılık: kaçamamak', bas: 34.7, son: 49.4, ciz: kapalilik },
      { ad: 'Arada olma ve doğrudan ispat', bas: 49.1, son: 66.0, ciz: aradaOlma },
      { ad: 'Sürpriz: doğrudaki delik', bas: 65.7, son: 80.6, ciz: delik },
      { ad: 'Tek karşıt örnek', bas: 80.3, son: 96.6, ciz: karsit },
      { ad: 'Aklında kalsın', bas: 96.3, son: 106.8, ciz: ozet },
      { ad: 'Laboratuvar', bas: 106.6, son: 113.5, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: Math.sin(t * 0.04) * 50, ky: -t * 5, renk1: 'menekse', renk2: 'turkuaz' }),
  });
})();
