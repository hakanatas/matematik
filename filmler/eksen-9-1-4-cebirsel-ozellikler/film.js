/* ==========================================================================
   EKSEN 9.1.4 — Aynı Alan, İki Yazılış
   Tek fikir: Gerçek sayıların işlem özellikleri alanın korunmasıdır.
   Döndürmek değişme, bölmek dağılma, kesip kaydırmak özdeşliktir.
   Aynı alan, iki farklı cebirsel yazılış.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp } = E;

  const meta = {
    kod: 'MAT.9.1.4',
    tema: 'Sayılar',
    ad: 'Aynı Alan, İki Yazılış',
    adEn: 'Same Area, Two Spellings',
    labAd: 'Sayılar Laboratuvarı',
    labAciklama: 'Dikdörtgenleri kes, döndür, kaydır: alan aynı kalırken cebirsel yazılışın nasıl değiştiğini gör.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-sayilar/',
  };

  /* ---------- Yardımcılar ---------- */
  /** Işıklı dikdörtgen (alan parçası). o: alfa, hucre (birim kare px), p (kenar çizimi), dolgu, kalinlik */
  const kutu = (ctx, x, y, w, h, renk, o = {}) => {
    const al = o.alfa ?? 1;
    if (al <= 0.002) return;
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }
    ctx.save(); ctx.globalAlpha *= al;
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    const d = o.dolgu ?? 1;
    g.addColorStop(0, E.rgba(renk, 0.34 * d)); g.addColorStop(1, E.rgba(renk, 0.12 * d));
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    if (o.hucre && w > 2 && h > 2) {
      ctx.strokeStyle = E.rgba(renk, 0.32); ctx.lineWidth = 1;
      ctx.beginPath();
      for (let xx = x + o.hucre; xx < x + w - 1; xx += o.hucre) { ctx.moveTo(xx, y); ctx.lineTo(xx, y + h); }
      for (let yy = y + o.hucre; yy < y + h - 1; yy += o.hucre) { ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); }
      ctx.stroke();
    }
    ctx.restore();
    E.cizgi(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { kapali: true, renk, kalinlik: o.kalinlik || 2.5, parilti: o.parilti ?? 0.8, alfa: al, p: o.p ?? 1 });
  };
  /** Merkez etrafında döndürülmüş dikdörtgen */
  const kutuDon = (ctx, cx, cy, w, h, aci, renk, o = {}) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(aci);
    kutu(ctx, -w / 2, -h / 2, w, h, renk, o);
    ctx.restore();
  };
  /** Kenar ölçüsü: ok uçlu ince çizgi + etiket */
  const olcu = (ctx, x0, y0, x1, y1, metin, o = {}) => {
    const al = o.alfa ?? 1;
    if (al <= 0.002) return;
    const renk = o.renk || 'gumus';
    E.cizgi(ctx, [[x0, y0], [x1, y1]], { renk, kalinlik: 1.6, alfa: al * 0.8 });
    const a = Math.atan2(y1 - y0, x1 - x0), n = [Math.cos(a + Math.PI / 2) * 7, Math.sin(a + Math.PI / 2) * 7];
    E.cizgi(ctx, [[x0 - n[0], y0 - n[1]], [x0 + n[0], y0 + n[1]]], { renk, kalinlik: 1.6, alfa: al * 0.8 });
    E.cizgi(ctx, [[x1 - n[0], y1 - n[1]], [x1 + n[0], y1 + n[1]]], { renk, kalinlik: 1.6, alfa: al * 0.8 });
    const ox = o.ox ?? 0, oy = o.oy ?? 0;
    E.etiket(ctx, metin, (x0 + x1) / 2 + ox, (y0 + y1) / 2 + oy, { formul: true, boyut: o.boyut || 28, renk: o.yaziRenk || 'tebesir', plaka: 'gece', plakaAlfa: 0.85, alfa: al });
  };

  /* ---------- 1. Soğuk açılış: 51 · 49 ---------- */
  const acilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const fy = H ? ic.y + 170 : ic.y + 230;
    // dalış: ızgara
    const dal = ara(t, 7.0, 10.8, 'gir2');
    const z = 1 + 5 * dal;
    const ga = ara(t, 5.6, 7.0) * (1 - ara(t, 10.2, 10.9));
    if (ga > 0) {
      const ara0 = 44 * z;
      const cx = L.cx, cy = H ? ic.cy + 30 : ic.cy + 40;
      ctx.save(); ctx.globalAlpha *= ga;
      ctx.strokeStyle = E.rgba('sis', 0.8); ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = -40; k <= 40; k++) {
        const x = cx + k * ara0; if (x < -10 || x > E.W + 10) continue; ctx.moveTo(x, 0); ctx.lineTo(x, E.H);
      }
      for (let k = -40; k <= 40; k++) {
        const y = cy + k * ara0; if (y < -10 || y > E.H + 10) continue; ctx.moveTo(0, y); ctx.lineTo(E.W, y);
      }
      ctx.stroke();
      // a² ve b² ön izlemesi
      const kb = 5 * ara0;
      kutu(ctx, cx - kb / 2, cy - kb / 2, kb, kb, 'turkuaz', { alfa: ara(t, 6.4, 7.2), dolgu: 0.6 });
      kutu(ctx, cx + kb / 2 - ara0, cy + kb / 2 - ara0, ara0, ara0, 'mercan', { alfa: ara(t, 6.8, 7.6) });
      ctx.restore();
    }
    const fa = 1 - ara(t, 7.6, 8.4);
    // kronometre
    const sn = clamp((t - 1.2) / 1.0) * 1.2;
    E.yazi(ctx, sn.toFixed(2).replace('.', ',') + ' sn', L.cx, fy - (H ? 110 : 120), { boyut: 26, font: 'mono', renk: t > 2.2 ? 'limon' : 'gumus', alfa: ara(t, 1.0, 1.4) * fa });
    const cev = ara(t, 2.2, 2.6, 'cik3');
    E.formul(ctx, '51 · 49 = \\c{limon}{?}', L.cx, fy, { boyut: H ? 96 : 76, alfa: ara(t, 0.2, 0.9) * (1 - cev) * fa });
    E.formul(ctx, '51 · 49 = \\c{limon}{2499}', L.cx, fy, { boyut: H ? 96 : 76, alfa: cev * fa, parilti: 0.5 * E.nabiz(t, 2.2, 1.0), parRenk: 'limon' });
    E.isik(ctx, L.cx, fy, 420, 'limon', 0.35 * E.nabiz(t, 2.2, 1.0) * fa);
    E.yazi(ctx, 'Nasıl?', L.cx, fy + (H ? 120 : 120), { boyut: H ? 44 : 40, agirlik: 700, alfa: ara(t, 3.8, 4.4) * (1 - ara(t, 5.0, 5.4)) });
    E.formul(ctx, '= \\c{turkuaz}{50^{2}} − \\c{mercan}{1^{2}}', L.cx, fy + (H ? 120 : 120), { boyut: H ? 60 : 54, alfa: ara(t, 5.2, 5.8) * fa });
    E.yazi(ctx, 'Cevap, bir şeklin alanında saklı.', L.cx, H ? ic.y1 - 60 : ic.y + 620, { boyut: H ? 40 : 34, agirlik: 700, renk: 'limon', alfa: ara(t, 8.4, 9.1) * (1 - ara(t, 10.4, 11)), parilti: 0.3, parRenk: 'limon', maxGen: ic.w - 30 });
  };

  /* ---------- 4. Döndür: değişme ve birleşme ---------- */
  const degisme = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const u = H ? 56 : 52;
    const cx = H ? ic.x + 320 : L.cx, cy = H ? ic.cy - 10 : ic.y + 230;
    const don = ara(t, 2.0, 3.4, 'io3');
    const ra = 1 - ara(t, 5.2, 5.8);
    const w = 5 * u, h = 3 * u;
    // hücreler sırayla yanar
    const hucreP = ara(t, 0.2, 1.4, 'lin');
    if (ra > 0) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI / 2 * don);
      ctx.save(); ctx.globalAlpha *= ra;
      for (let i = 0; i < 15; i++) {
        const a = clamp(hucreP * 15 - i);
        if (a <= 0) continue;
        const c = i % 5, r = Math.floor(i / 5);
        ctx.fillStyle = E.rgba('turkuaz', 0.18 * a); ctx.fillRect(-w / 2 + c * u + 2, -h / 2 + r * u + 2, u - 4, u - 4);
      }
      ctx.restore();
      kutu(ctx, -w / 2, -h / 2, w, h, 'turkuaz', { alfa: ra, hucre: u, dolgu: 0.6 });
      ctx.restore();
      E.isik(ctx, cx, cy, 260, 'turkuaz', 0.3 * E.nabiz(t, 3.3, 0.9) * ra);
      // ölçüler: döndürmeden önce / sonra
      const o1 = ara(t, 0.8, 1.3) * (1 - ara(t, 1.8, 2.1)) * ra, o2 = ara(t, 3.3, 3.8) * ra;
      olcu(ctx, cx - w / 2, cy + h / 2 + 30, cx + w / 2, cy + h / 2 + 30, 'a = 5', { alfa: o1 });
      olcu(ctx, cx - w / 2 - 30, cy - h / 2, cx - w / 2 - 30, cy + h / 2, 'b = 3', { alfa: o1, ox: -40 });
      olcu(ctx, cx - h / 2, cy + w / 2 + 30, cx + h / 2, cy + w / 2 + 30, 'b = 3', { alfa: o2 });
      olcu(ctx, cx - h / 2 - 30, cy - w / 2, cx - h / 2 - 30, cy + w / 2, 'a = 5', { alfa: o2, ox: -40 });
      E.etiket(ctx, '15', cx, cy, { boyut: 34, agirlik: 700, renk: 'limon', plaka: 'gece', plakaAlfa: 0.8, alfa: ara(t, 1.2, 1.7) * ra });
    }
    // birleşme: üç çubuk
    const ba = ara(t, 5.6, 6.2);
    if (ba > 0) {
      const parca = [[2, 'turkuaz', 'a'], [3, 'mercan', 'b'], [4, 'menekse', 'c']];
      const top = 9 * u * (H ? 1 : 0.68);
      const uu = top / 9;
      let x = cx - top / 2;
      const by = cy;
      const xs = [];
      parca.forEach(([n, rk, ad], i) => {
        const a = ara(t, 5.6 + i * 0.25, 6.2 + i * 0.25);
        kutu(ctx, x + 2, by - 22, n * uu - 4, 44, rk, { alfa: a * ba, hucre: uu });
        E.formul(ctx, ad, x + (n * uu) / 2, by + 52, { boyut: 30, renk: rk, alfa: a });
        xs.push([x, x + n * uu]);
        x += n * uu;
      });
      // gruplama parantezi
      const g1 = ara(t, 6.6, 7.2) * (1 - ara(t, 7.9, 8.3));
      const g2 = ara(t, 8.3, 8.9);
      const kose = (x0, x1, al) => E.cizgi(ctx, [[x0 + 3, by - 40], [x0 + 3, by - 52], [x1 - 3, by - 52], [x1 - 3, by - 40]], { renk: 'limon', kalinlik: 3, parilti: 0.6, alfa: al });
      kose(xs[0][0], xs[1][1], g1);
      kose(xs[1][0], xs[2][1], g2);
      E.yazi(ctx, '= 9', xs[2][1] + 24, by, { boyut: 34, agirlik: 700, renk: 'limon', hiza: 'left', alfa: ara(t, 7.0, 7.6) });
    }
    // formüller
    const fx = H ? 930 : L.cx;
    const y0 = H ? ic.y + 110 : ic.y + 520;
    const fA = ara(t, 3.6, 4.2) * (1 - ara(t, 5.2, 5.8));
    E.formul(ctx, 'a · b = b · a', fx, y0, { boyut: H ? 56 : 50, renk: 'limon', alfa: fA, parilti: 0.3 * fA });
    E.formul(ctx, '\\forall a,\\, b \\in \\R:\\;\\; a · b = b · a', fx, y0 + (H ? 90 : 80), { boyut: H ? 34 : 32, alfa: ara(t, 4.2, 4.8) * (1 - ara(t, 5.2, 5.8)) });
    E.yazi(ctx, 'Değişme: döndürmek alanı değiştirmez.', fx, y0 + (H ? 170 : 150), { boyut: H ? 28 : 28, agirlik: 560, renk: 'gumus', alfa: ara(t, 4.6, 5.0) * (1 - ara(t, 5.2, 5.8)), maxGen: H ? 480 : ic.w - 20 });
    const fB = ara(t, 6.8, 7.4);
    E.formul(ctx, '(a + b) + c = a + (b + c)', fx, y0, { boyut: H ? 44 : 40, renk: 'limon', alfa: fB, parilti: 0.3 * fB });
    E.formul(ctx, '(2 + 3) + 4 = 2 + (3 + 4)', fx, y0 + (H ? 90 : 80), { boyut: H ? 36 : 32, alfa: ara(t, 7.4, 8.0) });
    E.yazi(ctx, 'Birleşme: nasıl gruplarsan grupla, toplam aynı.', fx, y0 + (H ? 170 : 150), { boyut: 28, agirlik: 560, renk: 'gumus', alfa: ara(t, 8.6, 9.2), maxGen: H ? 480 : ic.w - 20 });
  };

  /* ---------- 5. Bir, sıfır, ters ---------- */
  const ozelEleman = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const u = H ? 86 : 84;
    const cx = H ? ic.x + 320 : L.cx, cy = H ? ic.cy + 20 : ic.y + 240;
    const W4 = 4 * u;
    // yükseklik (birim cinsinden)
    let hb = kf(t, [[0, 3], [0.4, 3], [1.6, 1, 'io3'], [4.0, 1], [5.0, 0, 'gir3'], [6.8, 0], [7.6, 0.25, 'cik3']]);
    const x0 = cx - W4 / 2, yAlt = cy + u * 0.75;
    const parcala = ara(t, 8.4, 8.9);
    const yigin = ara(t, 9.0, 10.8, 'io3');
    const renk = t < 3.8 ? 'turkuaz' : t < 6.8 ? 'mercan' : 'menekse';
    if (t < 8.4) {
      const h = hb * u;
      kutu(ctx, x0, yAlt - h, W4, h, renk, { hucre: hb >= 0.99 ? u : 0 });
      if (hb < 0.02 && t > 4.9 && t < 6.8) {
        E.cizgi(ctx, [[x0, yAlt], [x0 + W4, yAlt]], { renk: 'mercan', kalinlik: 4, parilti: 1.4 });
        E.isik(ctx, cx, yAlt, 300, 'mercan', 0.5 * E.nabiz(t, 4.95, 0.9));
      }
    } else {
      // 4 parça: 1 × 1/4 → üst üste: 1 × 1 kare
      const ph = 0.25 * u;
      for (let i = 0; i < 4; i++) {
        const sx = x0 + i * u + (i - 1.5) * 10 * parcala, sy = yAlt - ph;
        const hx = cx - u / 2, hy = yAlt - ph * (i + 1);
        const x = lerp(sx, hx, yigin), y = lerp(sy, hy, ara(yigin, 0, 1, 'lin'));
        kutu(ctx, x, y, u, ph, 'menekse', { alfa: 1 });
      }
      E.isik(ctx, cx, yAlt - u / 2, 200, 'menekse', 0.4 * E.nabiz(t, 10.8, 1.0));
    }
    // ölçüler
    const oa = ara(t, 0.2, 0.7) * (1 - ara(t, 8.2, 8.5));
    olcu(ctx, x0, yAlt + 34, x0 + W4, yAlt + 34, 'a', { alfa: oa });
    if (t < 4.0) olcu(ctx, x0 - 30, yAlt - hb * u, x0 - 30, yAlt, String(Math.round(hb * 10) / 10).replace('.', ','), { alfa: ara(t, 0.3, 0.8) * (1 - ara(t, 3.6, 4.0)), ox: -36 });
    if (t > 7.2 && t < 8.6) E.formul(ctx, '\\frac{1}{4}', x0 - 50, yAlt - 0.125 * u, { boyut: 28, renk: 'menekse', alfa: ara(t, 7.4, 7.9) * (1 - ara(t, 8.2, 8.5)) });
    if (t > 10.6) {
      olcu(ctx, cx - u / 2, yAlt + 34, cx + u / 2, yAlt + 34, '1', { alfa: ara(t, 10.8, 11.3) });
      olcu(ctx, cx - u / 2 - 30, yAlt - u, cx - u / 2 - 30, yAlt, '1', { alfa: ara(t, 10.8, 11.3), ox: -26 });
    }
    // alan etiketi
    const alanYaz = t < 3.8 ? (hb > 1.01 ? 'alan = a · ' + String(Math.round(hb * 10) / 10).replace('.', ',') : 'alan = a') : t < 6.8 ? 'alan = 0' : t < 8.4 ? 'alan = 1' : '';
    if (alanYaz) E.yazi(ctx, alanYaz, cx, yAlt - Math.max(hb, 0) * u - 36, { boyut: 28, agirlik: 650, renk: 'limon', alfa: ara(t, 0.5, 1.0) * (t < 6.8 && t > 5.6 ? 1 : 1) });
    // formüller
    const fx = H ? 930 : L.cx;
    const y0 = H ? ic.y + 110 : ic.y + 520;
    const fb = H ? 50 : 46;
    const blok = (ta, tb) => ara(t, ta, ta + 0.6) * (1 - ara(t, tb, tb + 0.5));
    const A1 = blok(1.6, 3.6), A2 = blok(5.0, 6.6), A3 = ara(t, 7.6, 8.2);
    E.formul(ctx, 'a · 1 = a', fx, y0, { boyut: fb, renk: 'limon', alfa: A1, parilti: 0.3 * A1 });
    E.yazi(ctx, '1: çarpmanın birim (etkisiz) elemanı', fx, y0 + (H ? 80 : 74), { boyut: 28, agirlik: 560, renk: 'gumus', alfa: A1, maxGen: H ? 480 : ic.w - 20 });
    E.formul(ctx, 'a · 0 = 0', fx, y0, { boyut: fb, renk: 'mercan', alfa: A2, parilti: 0.3 * A2 });
    E.yazi(ctx, '0: çarpmanın yutan elemanı', fx, y0 + (H ? 80 : 74), { boyut: 28, agirlik: 560, renk: 'gumus', alfa: A2, maxGen: H ? 480 : ic.w - 20 });
    E.formul(ctx, '\\forall a \\ne 0,\\;\\; \\exists b:\\;\\; a · b = 1', fx, y0, { boyut: H ? 40 : 38, renk: 'limon', alfa: A3, parilti: 0.3 * A3 });
    E.formul(ctx, '4 · \\frac{1}{4} = 1 \\qquad b = \\frac{1}{a}', fx, y0 + (H ? 96 : 90), { boyut: H ? 38 : 36, alfa: ara(t, 8.6, 9.2) });
    E.yazi(ctx, 'Ters eleman: 4 ince şerit, tek bir birim kare.', fx, y0 + (H ? 190 : 180), { boyut: 28, agirlik: 560, renk: 'gumus', alfa: ara(t, 10.8, 11.4), maxGen: H ? 480 : ic.w - 20 });
  };

  /* ---------- 6. Böl: dağılma ---------- */
  const dagilma = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const fx = H ? 930 : L.cx;
    const y0 = H ? ic.y + 100 : ic.y + 500;
    // Bölüm A: a(b + c)
    const A = ara(t, 0.1, 0.7) * (1 - ara(t, 5.4, 6.0));
    if (A > 0.002) {
      const u = H ? 60 : 58;
      const ah = 3 * u, bw = 4 * u, cw = 2 * u;
      const x0 = (H ? ic.x + 320 : L.cx) - (bw + cw) / 2, y = (H ? ic.cy - 10 : ic.y + 230) - ah / 2;
      const ayr = ara(t, 2.2, 3.0, 'io3');
      ctx.save(); ctx.globalAlpha *= A;
      if (ayr <= 0) kutu(ctx, x0, y, bw + cw, ah, 'tebesir', { dolgu: 0.5 });
      E.cizgi(ctx, [[x0 + bw, y - 10], [x0 + bw, y + ah + 10]], { renk: 'limon', kalinlik: 3, kesik: [8, 6], parilti: 0.8, p: ara(t, 1.2, 2.0), alfa: 1 - ayr });
      if (ayr > 0) {
        kutu(ctx, x0 - 10 * ayr, y, bw, ah, 'turkuaz', { alfa: ayr });
        kutu(ctx, x0 + bw + 10 * ayr, y, cw, ah, 'mercan', { alfa: ayr });
        E.formul(ctx, 'ab', x0 + bw / 2 - 10 * ayr, y + ah / 2, { boyut: 40, renk: 'turkuaz', alfa: ayr });
        E.formul(ctx, 'ac', x0 + bw + cw / 2 + 10 * ayr, y + ah / 2, { boyut: 40, renk: 'mercan', alfa: ayr });
      } else {
        E.formul(ctx, 'a(b + c)', x0 + (bw + cw) / 2, y + ah / 2, { boyut: 40, alfa: ara(t, 0.4, 0.9) * (1 - ara(t, 1.8, 2.2)) });
      }
      olcu(ctx, x0 - 34, y, x0 - 34, y + ah, 'a', { alfa: 1, ox: -24 });
      olcu(ctx, x0, y + ah + 34, x0 + bw, y + ah + 34, 'b', { alfa: ara(t, 1.4, 2.0), yaziRenk: 'turkuaz' });
      olcu(ctx, x0 + bw, y + ah + 34, x0 + bw + cw, y + ah + 34, 'c', { alfa: ara(t, 1.4, 2.0), yaziRenk: 'mercan' });
      ctx.restore();
      const fa = ara(t, 3.0, 3.6) * A;
      E.formul(ctx, 'a(\\c{turkuaz}{b} + \\c{mercan}{c}) = \\c{turkuaz}{ab} + \\c{mercan}{ac}', fx, y0, { boyut: H ? 50 : 46, alfa: fa, parilti: 0.2 * fa });
      E.yazi(ctx, 'Dağılma: dikdörtgeni ikiye bölmek.', fx, y0 + (H ? 86 : 80), { boyut: 28, agirlik: 560, renk: 'gumus', alfa: ara(t, 3.6, 4.2) * A, maxGen: H ? 480 : ic.w - 20 });
    }
    // Bölüm B: 7 · 98
    const B = ara(t, 5.8, 6.5);
    if (B > 0.002) {
      const rw = H ? 520 : 560, rh = H ? 150 : 140;
      const x0 = (H ? ic.x + 320 : L.cx) - rw / 2, y = (H ? ic.cy - 30 : ic.y + 200) - rh / 2;
      const kes = ara(t, 7.4, 8.2, 'io3');
      const sw = rw * 0.08;
      ctx.save(); ctx.globalAlpha *= B;
      kutu(ctx, x0, y, rw - sw, rh, 'turkuaz');
      kutu(ctx, x0 + rw - sw + 14 * kes, y + 30 * kes, sw, rh, 'mercan', { alfa: 1 - 0.45 * kes });
      E.formul(ctx, '7 · 98', x0 + (rw - sw) / 2, y + rh / 2, { boyut: 40, renk: 'turkuaz', alfa: ara(t, 8.6, 9.2) });
      E.formul(ctx, '7 · 100', x0 + rw / 2, y + rh / 2, { boyut: 40, alfa: ara(t, 6.0, 6.5) * (1 - ara(t, 7.2, 7.6)) });
      olcu(ctx, x0, y + rh + 34, x0 + rw, y + rh + 34, '100', { alfa: ara(t, 6.2, 6.8) * (1 - ara(t, 7.4, 7.8)) });
      olcu(ctx, x0, y + rh + 34, x0 + rw - sw, y + rh + 34, '98', { alfa: ara(t, 8.2, 8.8), yaziRenk: 'turkuaz' });
      olcu(ctx, x0 - 34, y, x0 - 34, y + rh, '7', { alfa: 1, ox: -24 });
      E.yazi(ctx, '7 · 2 = 14', x0 + rw - sw / 2 + 14 * kes, y + rh + 34 + 30 * kes + 40, { boyut: 26, agirlik: 650, renk: 'mercan', alfa: ara(t, 8.0, 8.6), hiza: 'right' });
      ctx.restore();
      const satir = H ? 70 : 64;
      E.formul(ctx, '7 · 98 = 7(100 − 2)', fx, y0, { boyut: H ? 46 : 42, alfa: ara(t, 6.6, 7.2) });
      E.formul(ctx, '= 7 · 100 − 7 · 2', fx, y0 + satir, { boyut: H ? 42 : 40, alfa: ara(t, 8.4, 9.0) });
      E.formul(ctx, '= 700 − 14 = \\c{limon}{686}', fx, y0 + satir * 2, { boyut: H ? 46 : 42, alfa: ara(t, 9.6, 10.2), parilti: 0.4 * E.nabiz(t, 9.8, 1.0), parRenk: 'limon' });
    }
  };

  /* ---------- 7. Kare dört parçaya ---------- */
  const kare = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const fx = H ? 930 : L.cx;
    const y0 = H ? ic.y + 110 : ic.y + 520;
    const a = H ? 210 : 200, b = H ? 110 : 104;
    const cx = H ? ic.x + 320 : L.cx, cy = H ? ic.cy : ic.y + 240;
    // (a + b)²
    const A = ara(t, 0.1, 0.7) * (1 - ara(t, 5.8, 6.4));
    if (A > 0.002) {
      const S = a + b, x0 = cx - S / 2, y = cy - S / 2;
      const ayr = ara(t, 2.4, 3.2, 'io3'), g = 10 * ayr;
      ctx.save(); ctx.globalAlpha *= A;
      if (ayr <= 0) kutu(ctx, x0, y, S, S, 'tebesir', { dolgu: 0.45 });
      const kes = ara(t, 1.4, 2.4);
      E.cizgi(ctx, [[x0 + a, y - 10], [x0 + a, y + S + 10]], { renk: 'limon', kalinlik: 3, kesik: [8, 6], p: kes, alfa: 1 - ayr });
      E.cizgi(ctx, [[x0 - 10, y + a], [x0 + S + 10, y + a]], { renk: 'limon', kalinlik: 3, kesik: [8, 6], p: kes, alfa: 1 - ayr });
      if (ayr > 0) {
        kutu(ctx, x0 - g, y - g, a, a, 'turkuaz', { alfa: ayr });
        kutu(ctx, x0 + a + g, y - g, b, a, 'mercan', { alfa: ayr });
        kutu(ctx, x0 - g, y + a + g, a, b, 'mercan', { alfa: ayr });
        kutu(ctx, x0 + a + g, y + a + g, b, b, 'menekse', { alfa: ayr });
        E.formul(ctx, 'a^{2}', x0 - g + a / 2, y - g + a / 2, { boyut: 42, renk: 'turkuaz', alfa: ayr });
        E.formul(ctx, 'ab', x0 + a + g + b / 2, y - g + a / 2, { boyut: 36, renk: 'mercan', alfa: ayr });
        E.formul(ctx, 'ab', x0 - g + a / 2, y + a + g + b / 2, { boyut: 36, renk: 'mercan', alfa: ayr });
        E.formul(ctx, 'b^{2}', x0 + a + g + b / 2, y + a + g + b / 2, { boyut: 34, renk: 'menekse', alfa: ayr });
      } else {
        E.formul(ctx, '(a + b)^{2}', cx, cy, { boyut: 44, alfa: ara(t, 0.4, 0.9) * (1 - ara(t, 1.2, 1.6)) });
      }
      olcu(ctx, x0 - g, y - g - 32, x0 - g + a, y - g - 32, 'a', { alfa: ara(t, 0.6, 1.1) });
      olcu(ctx, x0 + a + g, y - g - 32, x0 + a + g + b, y - g - 32, 'b', { alfa: ara(t, 0.6, 1.1) });
      olcu(ctx, x0 - g - 32, y - g, x0 - g - 32, y - g + a, 'a', { alfa: ara(t, 0.6, 1.1), ox: -22 });
      olcu(ctx, x0 - g - 32, y + a + g, x0 - g - 32, y + a + g + b, 'b', { alfa: ara(t, 0.6, 1.1), ox: -22 });
      ctx.restore();
      E.formul(ctx, '(a + b)^{2} = \\c{turkuaz}{a^{2}} + \\c{mercan}{2ab} + \\c{menekse}{b^{2}}', fx, y0, { boyut: H ? 44 : 42, alfa: ara(t, 3.4, 4.0) * A, aciga: ara(t, 3.4, 4.8, 'lin') });
      E.yazi(ctx, 'Dört parça, tek kare.', fx, y0 + (H ? 86 : 80), { boyut: 28, agirlik: 560, renk: 'gumus', alfa: ara(t, 4.6, 5.2) * A });
    }
    // (a − b)²
    const B = ara(t, 6.0, 6.6);
    if (B > 0.002) {
      const S = a + b * 0.4, bb = b * 0.9;
      const x0 = cx - S / 2, y = cy - S / 2, k = S - bb;
      ctx.save(); ctx.globalAlpha *= B;
      kutu(ctx, x0, y, S, S, 'tebesir', { dolgu: 0.2 });
      kutu(ctx, x0, y, k, k, 'turkuaz', { alfa: ara(t, 6.4, 7.0) });
      const s1 = ara(t, 7.2, 7.7), s2 = ara(t, 8.0, 8.5), kose = ara(t, 8.8, 9.3);
      // sağ şerit ve alt şerit: çıkarılan
      ctx.save(); ctx.globalAlpha *= 0.85;
      ctx.fillStyle = E.rgba('mercan', 0.22 * s1); ctx.fillRect(x0 + k, y, bb, S);
      ctx.fillStyle = E.rgba('mercan', 0.22 * s2); ctx.fillRect(x0, y + k, S, bb);
      ctx.restore();
      E.cizgi(ctx, [[x0 + k, y], [x0 + S, y], [x0 + S, y + S], [x0 + k, y + S]], { kapali: true, renk: 'mercan', kalinlik: 2.5, parilti: 0.8, alfa: s1 });
      E.cizgi(ctx, [[x0, y + k], [x0 + S, y + k], [x0 + S, y + S], [x0, y + S]], { kapali: true, renk: 'mercan', kalinlik: 2.5, parilti: 0.8, alfa: s2 });
      kutu(ctx, x0 + k, y + k, bb, bb, 'menekse', { alfa: kose, dolgu: 1.6 });
      E.isik(ctx, x0 + k + bb / 2, y + k + bb / 2, 120, 'menekse', 0.5 * E.nabiz(t, 8.8, 0.9));
      E.formul(ctx, '(a − b)^{2}', x0 + k / 2, y + k / 2, { boyut: 34, renk: 'turkuaz', alfa: ara(t, 6.6, 7.2) });
      E.formul(ctx, '−ab', x0 + k + bb / 2, y + k / 2, { boyut: 26, renk: 'mercan', alfa: s1 });
      E.formul(ctx, '−ab', x0 + k / 2, y + k + bb / 2, { boyut: 26, renk: 'mercan', alfa: s2 });
      E.formul(ctx, '+b^{2}', x0 + k + bb / 2, y + k + bb / 2, { boyut: 24, renk: 'menekse', alfa: kose });
      olcu(ctx, x0, y - 32, x0 + S, y - 32, 'a', { alfa: ara(t, 6.4, 6.9) });
      olcu(ctx, x0 + k, y + S + 32, x0 + S, y + S + 32, 'b', { alfa: ara(t, 6.4, 6.9) });
      ctx.restore();
      E.formul(ctx, '(a − b)^{2} = \\c{turkuaz}{a^{2}} − \\c{mercan}{2ab} + \\c{menekse}{b^{2}}', fx, y0, { boyut: H ? 44 : 42, alfa: ara(t, 9.4, 10.0), aciga: ara(t, 9.4, 10.8, 'lin') });
      E.yazi(ctx, 'İki şerit çıkar; köşe iki kez gitti, geri ekle.', fx, y0 + (H ? 86 : 80), { boyut: 28, agirlik: 560, renk: 'gumus', alfa: ara(t, 9.0, 9.6), maxGen: H ? 480 : ic.w - 20 });
    }
  };

  /* ---------- 8. Sürpriz: kes, kaydır — a² − b² ---------- */
  const kesKaydir = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const a = H ? 300 : 300, b = H ? 120 : 120, k = a - b;
    const sx = H ? ic.x + 80 : L.cx - (a + b) / 2, sy = H ? ic.y + 90 : ic.y + 70;
    const cik = ara(t, 2.0, 3.2, 'io3');
    const kes = ara(t, 3.4, 4.4, 'lin');
    const tas = ara(t, 4.8, 7.2, 'io3');
    // kesimden önce: tek parça L şekli (b² köşesi üstünde)
    const ilk = ara(t, 0.2, 0.9);
    if (t < 3.4) {
      const Lp = [[sx, sy], [sx + a, sy], [sx + a, sy + k], [sx + k, sy + k], [sx + k, sy + a], [sx, sy + a]];
      E.cokgen(ctx, Lp, { renk: 'turkuaz', alfa: 0.24 * ilk });
      E.cizgi(ctx, Lp, { kapali: true, renk: 'turkuaz', kalinlik: 2.5, parilti: 0.8, alfa: ilk });
    } else {
    // a² karesi: üst dikdörtgen (a × k) sabit
    kutu(ctx, sx, sy, a, k, 'turkuaz', { alfa: ilk });
    // alt-sol parça (k × b) — döner ve sağa kayar
    const c0 = [sx + k / 2, sy + k + b / 2], c1 = [sx + a + b / 2, sy + k / 2];
    const yay = Math.sin(tas * Math.PI) * -60; // kavisli yol
    const pcx = lerp(c0[0], c1[0], tas), pcy = lerp(c0[1], c1[1], tas) + yay;
    kutuDon(ctx, pcx, pcy, k, b, -Math.PI / 2 * tas, tas > 0.98 ? 'turkuaz' : 'gok', { alfa: ilk });
    }
    // b² köşesi: çıkar ve düş
    const bA = ara(t, 0.2, 0.9) * (1 - cik);
    const dus = H ? 140 : 50;
    kutu(ctx, sx + k + 30 * cik, sy + k + dus * cik, b, b, 'mercan', { alfa: bA, dolgu: 1.4 });
    E.formul(ctx, 'b^{2}', sx + k + b / 2 + 30 * cik, sy + k + b / 2 + dus * cik, { boyut: 34, renk: 'mercan', alfa: bA * ara(t, 1.0, 1.5) });
    // kesim çizgisi + makas ışığı
    if (kes > 0 && tas < 0.05) {
      E.cizgi(ctx, [[sx, sy + k], [sx + k, sy + k]], { renk: 'limon', kalinlik: 3, kesik: [8, 6], parilti: 1, p: kes });
      E.nokta(ctx, sx + k * kes, sy + k, 7, { renk: 'limon', parilti: 1.6, alfa: kes < 1 ? 1 : 0 });
    }
    E.formul(ctx, 'a^{2}', sx + a / 2, sy + k / 2, { boyut: 44, renk: 'turkuaz', alfa: ara(t, 0.6, 1.1) * (1 - ara(t, 4.6, 5.0)) });
    // birleşme anı
    const flas = E.nabiz(t, 7.2, 1.0);
    E.isik(ctx, sx + a, sy + k / 2, 260, 'limon', 0.5 * flas);
    // ölçüler (önce)
    const oA = ara(t, 0.6, 1.1) * (1 - ara(t, 4.4, 4.8));
    olcu(ctx, sx, sy - 30, sx + a, sy - 30, 'a', { alfa: oA });
    olcu(ctx, sx - 30, sy, sx - 30, sy + a, 'a', { alfa: oA, ox: -22 });
    // ölçüler (sonra)
    const numara = ara(t, 10.2, 10.8);
    const oB = ara(t, 7.4, 8.0);
    const ust = numara > 0.5 ? '51' : 'a + b', yan = numara > 0.5 ? '49' : 'a − b';
    olcu(ctx, sx, sy + k + 34, sx + a + b, sy + k + 34, ust, { alfa: oB, yaziRenk: numara > 0.5 ? 'limon' : 'tebesir' });
    olcu(ctx, sx - 30, sy, sx - 30, sy + k, yan, { alfa: oB, ox: H ? -46 : -40, yaziRenk: numara > 0.5 ? 'limon' : 'tebesir' });
    E.formul(ctx, numara > 0.5 ? '51 · 49' : '(a + b)(a − b)', sx + (a + b) / 2, sy + k / 2, { boyut: 38, renk: 'tebesir', alfa: ara(t, 7.6, 8.2) });
    // formüller
    const fx = H ? 940 : L.cx;
    const y0 = H ? ic.y + 80 : ic.y + 420;
    const sat = H ? 74 : 66;
    E.formul(ctx, 'a^{2} − b^{2}', fx, y0, { boyut: H ? 50 : 46, alfa: ara(t, 2.6, 3.2) * (1 - ara(t, 7.8, 8.2)) });
    const kA = ara(t, 8.0, 8.6, 'cik3');
    E.formul(ctx, '\\kutu{limon}{a^{2} − b^{2} = (a + b)(a − b)}', fx, y0, { boyut: H ? 42 : 40, alfa: kA * (1 - ara(t, 9.8, 10.2) * 0.0), parilti: 0.3 * kA, parRenk: 'limon' });
    E.formul(ctx, '51 · 49 = (50 + 1)(50 − 1)', fx, y0 + sat * 1.3, { boyut: H ? 38 : 36, alfa: ara(t, 10.4, 11.0) });
    E.formul(ctx, '= 50^{2} − 1^{2}', fx, y0 + sat * 2.3, { boyut: H ? 38 : 36, alfa: ara(t, 11.6, 12.2) });
    E.formul(ctx, '= 2500 − 1 = \\c{limon}{2499}', fx, y0 + sat * 3.3, { boyut: H ? 42 : 40, alfa: ara(t, 12.8, 13.4), parilti: 0.5 * E.nabiz(t, 13.0, 1.2), parRenk: 'limon' });
    E.isik(ctx, fx, y0 + sat * 3.3, 300, 'limon', 0.3 * E.nabiz(t, 13.0, 1.2));
    E.yazi(ctx, 'Aynı alan, iki yazılış.', H ? fx : L.cx, H ? y0 + sat * 4.6 : y0 + sat * 4.5, { boyut: H ? 40 : 36, agirlik: 760, renk: 'limon', alfa: ara(t, 14.6, 15.4, 'cik3'), parilti: 0.35, parRenk: 'limon' });
  };

  /* ---------- 9. Çarpanlara ayırma ve sıfır çarpımı ---------- */
  const DAG = (() => { // karo başlangıç yerleri (tohumlu)
    const r = E.rng(914); const p = [];
    for (let i = 0; i < 12; i++) p.push([r(), r(), (r() - 0.5) * 0.8]);
    return p;
  })();
  const carpan = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const X = H ? 150 : 150, U = H ? 50 : 48;
    const A = 1 - ara(t, 9.2, 9.8);
    const fx = H ? 930 : L.cx;
    const y0 = H ? ic.y + 100 : ic.y + 520;
    if (A > 0.002) {
      const RW = X + 3 * U, RH = X + 2 * U;
      const rx = (H ? ic.x + 320 : L.cx) - RW / 2, ry = (H ? ic.cy + 10 : ic.y + 250) - RH / 2;
      const yer = ara(t, 2.0, 5.2, 'io3');
      // dağınık alan
      const dx0 = H ? ic.x + 40 : ic.x + 20, dw = H ? 560 : 600, dy0 = H ? ic.y + 30 : ic.y + 20, dh = H ? 440 : 440;
      const karo = [];
      karo.push({ w: X, h: X, renk: 'turkuaz', hx: rx, hy: ry, don: 0, ad: 'x^{2}' });
      for (let i = 0; i < 3; i++) karo.push({ w: U, h: X, renk: 'mercan', hx: rx + X + i * U, hy: ry, don: 0, ad: 'x' });
      for (let i = 0; i < 2; i++) karo.push({ w: U, h: X, renk: 'mercan', hx: rx + X / 2 - U / 2, hy: ry + X + i * U - X / 2 + U / 2, don: 1, ad: 'x' });
      for (let i = 0; i < 6; i++) karo.push({ w: U, h: U, renk: 'menekse', hx: rx + X + (i % 3) * U, hy: ry + X + Math.floor(i / 3) * U, don: 0, ad: '1' });
      karo.forEach((k, i) => {
        const [qx, qy, qr] = DAG[i];
        const sx = dx0 + qx * (dw - k.w), sy = dy0 + qy * (dh - k.h);
        const hx = k.hx, hy = k.hy;
        const gec = ara(yer, i * 0.03, 0.6 + i * 0.03, 'io3');
        const cx = lerp(sx + k.w / 2, hx + k.w / 2, gec), cy = lerp(sy + k.h / 2, hy + k.h / 2, gec);
        const aci = lerp(qr, k.don ? Math.PI / 2 : 0, gec);
        const a = ara(t, 0.2 + i * 0.06, 0.7 + i * 0.06) * A;
        kutuDon(ctx, cx, cy, k.w, k.h, aci, k.renk, { alfa: a });
        if (k.ad !== '1' || gec < 0.5) {
          E.formul(ctx, k.ad, cx, cy, { boyut: k.ad === 'x^{2}' ? 40 : 26, renk: k.renk, alfa: a * (k.ad === 'x^{2}' ? 1 : 0.9), cakisabilir: gec > 0.001 && gec < 0.999 });
        }
      });
      const oA = ara(t, 5.6, 6.2) * A;
      olcu(ctx, rx, ry - 30, rx + RW, ry - 30, 'x + 3', { alfa: oA, yaziRenk: 'limon' });
      olcu(ctx, rx - 30, ry, rx - 30, ry + RH, 'x + 2', { alfa: oA, ox: -40, yaziRenk: 'limon' });
      E.formul(ctx, 'x^{2} + 5x + 6', fx, y0, { boyut: H ? 50 : 46, alfa: ara(t, 0.4, 1.0) * (1 - ara(t, 6.0, 6.4)) * A });
      E.formul(ctx, 'x^{2} + 5x + 6 = \\c{limon}{(x + 2)(x + 3)}', fx, y0, { boyut: H ? 40 : 38, alfa: ara(t, 6.2, 6.8) * A, parilti: 0.3 * E.nabiz(t, 6.4, 1.0), parRenk: 'limon' });
      E.yazi(ctx, 'Çarpanlara ayırmak: parçaları tek bir dikdörtgene dizmek.', fx, y0 + (H ? 86 : 80), { boyut: 28, agirlik: 560, renk: 'gumus', alfa: ara(t, 7.0, 7.6) * A, maxGen: H ? 480 : ic.w - 20 });
    }
    // Sıfır çarpımı
    const B = ara(t, 9.6, 10.2);
    if (B > 0.002) {
      const u = H ? 60 : 58;
      const aW = 5 * u;
      const bh = kf(t, [[10.4, 3], [12.0, 0, 'gir3'], [13.2, 0], [14.2, 3, 'io3']]);
      const bw = kf(t, [[13.2, 5], [14.2, 5], [15.4, 0, 'gir3']]);
      const cx = H ? ic.x + 320 : L.cx, yAlt = H ? ic.cy + 100 : ic.y + 330;
      const x0 = cx - aW / 2;
      ctx.save(); ctx.globalAlpha *= B;
      kutu(ctx, x0, yAlt - bh * u, bw * u, bh * u, 'turkuaz', { hucre: u });
      if (bh < 0.03 || bw < 0.03) E.isik(ctx, x0 + bw * u / 2, yAlt - bh * u / 2, 220, 'mercan', 0.45);
      const alan = Math.round(bw * bh * 10) / 10;
      E.yazi(ctx, 'alan = ' + String(alan).replace('.', ','), cx, yAlt + 50, { boyut: 30, agirlik: 650, renk: alan < 0.05 ? 'mercan' : 'limon' });
      ctx.restore();
      const sat = H ? 74 : 70;
      E.formul(ctx, 'a · b = 0 \\iff a = 0 \\or b = 0', fx, y0, { boyut: H ? 38 : 36, renk: 'limon', alfa: ara(t, 10.4, 11.0), parilti: 0.2 });
      E.formul(ctx, 'a · b \\ne 0 \\iff a \\ne 0 \\and b \\ne 0', fx, y0 + sat, { boyut: H ? 34 : 34, alfa: ara(t, 12.0, 12.6) });
      E.formul(ctx, '(x + 2)(x + 3) = 0 \\Rightarrow x = \\minus 2 \\or x = \\minus 3', fx, y0 + sat * 2, { boyut: H ? 32 : 30, renk: 'gumus', alfa: ara(t, 13.6, 14.2) });
      E.formul(ctx, '\\forall\\t{ her}\\quad \\exists\\t{ bazı}\\quad \\and\\t{ ve}\\quad \\or\\t{ veya}\\quad \\Rightarrow\\t{ ise}\\quad \\iff\\t{ ancak ve ancak}', L.cx, H ? ic.y1 - 24 : ic.y1 - 30, { boyut: H ? 26 : 22, renk: 'gumus', alfa: ara(t, 14.8, 15.4) });
    }
  };

  /* ---------- Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Döndürmek alanı değiştirmez.', formul: 'a · b = b · a' },
    { tr: 'Bölmek dağılmadır.', formul: 'a(b + c) = ab + ac' },
    { tr: 'Kes, kaydır: aynı alan.', formul: 'a^{2} − b^{2} = (a + b)(a − b)' },
    { tr: 'Alan sıfırsa bir kenar sıfırdır.', formul: 'a · b = 0 \\iff a = 0 \\or b = 0' },
  ], { aralik: 1.6 });
  const bitis = (ctx, s) => E.bitisKarti(ctx, s, meta);

  E.film({
    meta,
    sure: 117.0,
    sahneler: [
      { ad: 'Soğuk açılış: 51 · 49', bas: 0, son: 11.0, giris: 0, cikis: 0.7, ciz: acilis, itme: 0 },
      { ad: 'İmza', bas: 10.7, son: 14.4, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 14.1, son: 18.4, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Döndür: değişme ve birleşme', bas: 18.1, son: 28.0, ciz: degisme },
      { ad: 'Bir, sıfır, ters', bas: 27.7, son: 40.4, ciz: ozelEleman },
      { ad: 'Böl: dağılma', bas: 40.1, son: 52.6, ciz: dagilma },
      { ad: 'Kare dört parçaya', bas: 52.3, son: 64.4, ciz: kare },
      { ad: 'Sürpriz: kes ve kaydır', bas: 64.1, son: 82.6, ciz: kesKaydir },
      { ad: 'Çarpanlara ayırma ve sıfır çarpımı', bas: 82.3, son: 99.4, ciz: carpan },
      { ad: 'Aklında kalsın', bas: 99.1, son: 109.8, ciz: ozet },
      { ad: 'Laboratuvar', bas: 109.6, son: 117.0, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: Math.cos(t * 0.05) * 40, ky: -t * 5, renk1: 'turkuaz', renk2: 'mercan' }),
  });
})();
