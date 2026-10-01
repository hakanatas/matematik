/* ==========================================================================
   EKSEN 9.1.1 — Üssün Merdiveni
   Tek fikir: Üs bir adım sayacıdır. Çarpmak adım atmak, bölmek geri adım,
   kesirli üs ise yarım adımdır — yani kök.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp, yd } = E;

  const meta = {
    kod: 'MAT.9.1.1',
    tema: 'Sayılar',
    ad: 'Üssün Merdiveni',
    adEn: 'The Exponent Ladder',
    labAd: 'Sayılar Laboratuvarı',
    labAciklama: 'Üs merdivenini kendin kur: tabanı ve üssü değiştir, yarım adımın kökü nasıl bulduğunu gör.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-sayilar/',
  };

  /* ---------- Yardımcılar ---------- */
  const binlik = (n) => {
    const s = Math.round(n).toString();
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
  };
  /** metre → okunabilir uzunluk */
  const uzunluk = (m) => {
    if (m < 0.01) return (m * 1000).toFixed(m < 0.001 ? 2 : 1).replace('.', ',') + ' mm';
    if (m < 1) return (m * 100).toFixed(1).replace('.', ',') + ' cm';
    if (m < 1000) return (m < 10 ? m.toFixed(1).replace('.', ',') : binlik(m)) + ' m';
    return binlik(m / 1000) + ' km';
  };
  const degerYaz = (k) => (k >= 0 ? binlik(Math.pow(10, k)) : '0,' + '0'.repeat(-k - 1) + '1');

  /** Dikey merdiven: iki ray ve basamaklar. o: x, y0 (k=0 basamağı), ara (piksel/basamak), kmin, kmax, taban */
  const merdiven = (ctx, o) => {
    const ic = E.L.icerik;
    const y = (k) => o.y0 - k * o.ara;
    const gor = (yy) => clamp((yy - (o.ust ?? ic.y) + 10) / 50) * clamp(((o.alt ?? ic.y1) + 10 - yy) / 50);
    const genis = o.genis || 30;
    // raylar
    const yUst = y(o.kmax) - o.ara * 0.45, yAlt = y(o.kmin) + o.ara * 0.45;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, (o.ust ?? ic.y) - 12, E.W, (o.alt ?? ic.y1) - (o.ust ?? ic.y) + 24); ctx.clip();
    for (const dx of [-genis, genis]) {
      const g = ctx.createLinearGradient(0, yUst, 0, yAlt);
      g.addColorStop(0, E.rgba('cizgi', 0)); g.addColorStop(0.12, E.rgba('cizgi', 1)); g.addColorStop(0.88, E.rgba('cizgi', 1)); g.addColorStop(1, E.rgba('cizgi', 0));
      ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.globalAlpha = o.alfa ?? 1;
      ctx.beginPath(); ctx.moveTo(o.x + dx, yUst + (yAlt - yUst) * (1 - (o.p ?? 1))); ctx.lineTo(o.x + dx, yAlt); ctx.stroke();
    }
    ctx.restore();
    for (let k = o.kmin; k <= o.kmax; k++) {
      const yy = y(k);
      const a = gor(yy) * (o.alfa ?? 1) * (o.basamakAlfa ? o.basamakAlfa(k) : 1);
      if (a < 0.01) continue;
      const vurgu = o.vurgu ? o.vurgu(k) : 0;
      E.cizgi(ctx, [[o.x - genis, yy], [o.x + genis, yy]], { renk: vurgu > 0.01 ? E.karistir('turkuaz', 'limon', vurgu) : 'turkuaz', kalinlik: 3 + vurgu * 2, parilti: 0.7 + vurgu, alfa: a });
      if (o.solEtiket) E.formul(ctx, o.solEtiket(k), o.x - genis - 18, yy, { boyut: o.boyut || 30, hiza: 'right', renk: vurgu > 0.3 ? 'limon' : 'gumus', alfa: a });
      if (o.sagEtiket) E.yazi(ctx, o.sagEtiket(k), o.x + genis + 18, yy, { boyut: o.boyut || 30, hiza: 'left', renk: vurgu > 0.3 ? 'limon' : 'tebesir', agirlik: 560, alfa: a });
    }
    return y;
  };

  /* ---------- 1. Soğuk açılış: kâğıt katlama → Ay ---------- */
  const IMLER = [
    [0.012, 'Telefon', '1 cm'],
    [1.7, 'İnsan boyu', '1,7 m'],
    [67, 'Galata Kulesi', '67 m'],
    [8849, 'Everest', '8 849 m'],
    [408000, 'Uzay İstasyonu', '408 km'],
  ];
  const AY = 384400000;
  const acilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    // katlama sayısı
    const kesikli = [[1.0, 1], [1.9, 2], [2.7, 3], [3.45, 4]];
    let n = 0, q = 0, nTam = 0;
    for (const [tt, k] of kesikli) { if (t >= tt) { nTam = k - 1; q = ara(t, tt, tt + 0.55, 'io3'); n = nTam + q; if (q >= 1) nTam = k; } }
    if (t >= 4.2) { const p = ara(t, 4.2, 8.7, 'gir2'); n = 4 + 38 * p; nTam = Math.floor(n + 1e-6); q = 0; }
    const kalinlik = 0.0001 * Math.pow(2, n); // metre
    const taban = ic.y1 - E.yd(14, 30);
    const Ht = taban - ic.y - E.yd(175, 190);
    const ppm0 = 6 / 0.0001; // her katman 6 px (abartılı)
    const ham = kalinlik * ppm0;
    const hpx = Ht * (1 - Math.exp(-ham / Ht));
    const ppm = hpx / kalinlik;

    // İşaret çizgileri (gerçek ölçekte)
    IMLER.concat([[AY, 'Ay', '384 400 km']]).forEach(([m, ad, d], i) => {
      const y = taban - m * ppm;
      if (y < ic.y - 40 || y > taban - 4) return;
      const a = clamp((taban - y - 10) / 70) * clamp((y - ic.y - 30) / 50) * ara(t, 3.6, 4.4);
      if (a <= 0.01) return;
      const ay = ad === 'Ay';
      E.cizgi(ctx, [[ic.x + 20, y], [ic.x1 - 20, y]], { renk: ay ? 'limon' : 'cizgi', kalinlik: ay ? 2 : 1.5, kesik: [10, 10], alfa: a * 0.9 });
      E.yazi(ctx, ad, ic.x1 - 24, y - E.yd(20, 20), { boyut: E.yd(26, 26), hiza: 'right', renk: ay ? 'limon' : 'gumus', agirlik: 620, alfa: a });
      E.yazi(ctx, d, ic.x1 - 24, y + E.yd(20, 20), { boyut: E.yd(24, 24), hiza: 'right', renk: 'gumus', agirlik: 460, alfa: a * 0.85 });
    });
    // Ay
    const yAy = taban - AY * ppm;
    if (yAy > ic.y - 120) {
      const a = ara(t, 7.6, 8.4);
      const ax = L.cx + E.yd(250, 150), r = E.yd(48, 44);
      E.isik(ctx, ax, yAy, r * 4, 'limon', 0.25 * a);
      ctx.save(); ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(ax - r * 0.4, yAy - r * 0.4, r * 0.1, ax, yAy, r);
      g.addColorStop(0, '#F4F7E8'); g.addColorStop(1, '#8C93A8');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ax, yAy, r, 0, E.TAU); ctx.fill();
      const kr = E.rng(4);
      ctx.fillStyle = 'rgba(80,88,110,0.35)';
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(ax + (kr() - 0.5) * r * 1.2, yAy + (kr() - 0.5) * r * 1.2, r * (0.08 + kr() * 0.14), 0, E.TAU); ctx.fill(); }
      ctx.restore();
    }

    // Kâğıt yığını (yan görünüş)
    const W0 = E.yd(560, 480);
    const gen = Math.max(W0 / Math.pow(2, Math.min(nTam, 4)), 44);
    const katman = Math.pow(2, nTam);
    const yuk = Math.min(katman * 6, hpx);
    const x0 = L.cx - gen / 2;
    const yuz = taban - yuk;
    // gövde
    ctx.save();
    const g = ctx.createLinearGradient(0, yuz, 0, taban);
    g.addColorStop(0, '#E9EEF6'); g.addColorStop(1, '#B9C4D6');
    ctx.fillStyle = g; ctx.fillRect(x0, yuz, gen, yuk);
    // katman çizgileri
    if (katman <= 64) {
      ctx.strokeStyle = 'rgba(40,52,80,0.55)'; ctx.lineWidth = 1;
      for (let i = 1; i < katman; i++) { const yy = taban - (i * yuk) / katman; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 + gen, yy); ctx.stroke(); }
    } else {
      // sürekli yığın: kayan ince çizgiler
      ctx.save(); ctx.beginPath(); ctx.rect(x0, yuz, gen, yuk); ctx.clip();
      ctx.strokeStyle = 'rgba(40,52,80,0.35)'; ctx.lineWidth = 1;
      const aralik = 7, kay = (n * 60) % aralik;
      for (let yy = taban - kay; yy > yuz; yy -= aralik) { ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 + gen, yy); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
    E.isik(ctx, L.cx, yuz, 140, 'turkuaz', 0.18 + 0.2 * ara(t, 4.2, 8.7));
    // katlanan yarı (kesikli aşamada)
    if (q > 0 && q < 1 && nTam < 4) {
      const genEski = W0 / Math.pow(2, nTam);
      const yukEski = Math.pow(2, nTam) * 6;
      const sol = L.cx - genEski / 2;
      const ortaX = sol + genEski / 2;
      // sabit sol yarı
      ctx.fillStyle = '#C9D3E3'; ctx.fillRect(sol, taban - yukEski, genEski / 2, yukEski);
      // dönen sağ yarı: ortaX etrafında, üst yüzeyden menteşe
      const aci = -Math.PI * q;
      ctx.save(); ctx.translate(ortaX, taban - yukEski); ctx.rotate(aci);
      ctx.fillStyle = '#E9EEF6'; ctx.globalAlpha = 0.95; ctx.fillRect(0, 0, genEski / 2, yukEski);
      ctx.strokeStyle = E.rgba('turkuaz', 0.9); ctx.lineWidth = 2; ctx.strokeRect(0, 0, genEski / 2, yukEski);
      ctx.restore();
      ctx.fillStyle = E.rgba('gece', 1); // yığın gövdesini katlanırken gizleme
    }
    // zemin çizgisi
    E.cizgi(ctx, [[ic.x + 30, taban + 2], [ic.x1 - 30, taban + 2]], { renk: 'sis', kalinlik: 2, alfa: 0.9 });

    // Gösterge paneli
    const px = E.yd(ic.x + 10, ic.x + 10), py = E.yd(ic.y + 6, ic.y - 20);
    const pa = ara(t, 0.6, 1.3);
    E.yazi(ctx, 'KATLAMA', px, py + 16, { boyut: 22, agirlik: 700, harfAra: 5, renk: 'turkuaz', hiza: 'left', alfa: pa });
    E.yazi(ctx, String(Math.min(42, nTam)), px, py + 70, { boyut: E.yd(72, 66), agirlik: 760, hiza: 'left', alfa: pa, parilti: 0.3 });
    const fx = px + E.yd(120, 112);
    E.formul(ctx, `0{,}1\\t{ mm} · 2^{${Math.min(42, nTam)}}`, fx, py + 52, { boyut: E.yd(32, 30), hiza: 'left', renk: 'gumus', alfa: pa });
    E.yazi(ctx, '≈ ' + uzunluk(0.0001 * Math.pow(2, Math.min(42, nTam))), fx, py + 96, { boyut: E.yd(34, 32), hiza: 'left', agirlik: 640, renk: nTam >= 42 ? 'limon' : 'tebesir', alfa: pa });
    // Ay'a ulaşınca parlama
    const flas = E.nabiz(t, 8.6, 1.2);
    if (flas > 0) E.isik(ctx, L.cx, ic.y + 80, E.W * 0.8, 'limon', 0.22 * flas);
  };

  /* ---------- 2. İmza ve başlık ---------- */
  const imza = (ctx, s) => E.imza(ctx, s, meta);
  const baslik = (ctx, s) => E.baslikKarti(ctx, s, meta);

  /* ---------- 3. Merdiven: üs = adım sayısı ---------- */
  const merdivenSahne = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const mx = H ? ic.x + 210 : ic.x + 170;
    const araP = H ? 72 : 64;
    const pan = kf(t, [[12.9, 0], [16.2, 2 * araP, 'io3']]);
    const y0 = (H ? ic.y1 - 40 : ic.y1 - 30) - pan;
    const ust = H ? ic.y : ic.y + 330;
    // işaretçi konumu (basamak cinsinden)
    const k = kf(t, [[4.6, 0], [5.3, 1], [6.0, 2], [6.9, 2], [7.6, 3], [8.3, 4], [9.0, 5], [13.4, 5], [14.3, 4], [15.2, 3], [15.9, 3], [16.7, 2], [17.2, 1], [17.6, 0], [17.9, -1]].map(([a, b]) => [a, b, 'io2']));
    const insa = ara(t, 0.1, 1.8);
    const vurgu3 = E.nabiz(t, 1.9, 2.4);
    const yk = merdiven(ctx, {
      x: mx, y0, ara: araP, kmin: -2, kmax: 6, p: insa, ust, alt: ic.y1,
      basamakAlfa: (kk) => ara(t, 0.2 + (kk + 2) * 0.12, 0.6 + (kk + 2) * 0.12) * (kk < 0 ? ara(t, 13, 14.5) : 1),
      solEtiket: (kk) => `10^{${kk < 0 ? '−' + -kk : kk}}`,
      sagEtiket: (kk) => degerYaz(kk),
      vurgu: (kk) => (kk === 3 ? vurgu3 : 0) + (Math.abs(k - kk) < 0.08 && t > 4.5 ? 1 : 0) * 0.8,
      boyut: H ? 28 : 26,
    });
    // işaretçi ve iz
    if (t > 4.4) {
      const ya = yk(0), yb = yk(k);
      const kBas = t < 13 ? 0 : 5;
      E.cizgi(ctx, [[mx, yk(kBas)], [mx, yb]], { renk: t < 13 ? 'turkuaz' : 'mercan', kalinlik: 6, parilti: 1.2, alfa: ara(t, 4.4, 4.8) });
      E.nokta(ctx, mx, yb, 9, { renk: 'limon', parilti: 1.4 });
      // adım parantezleri (sağda değil, solda değil: rayların hemen dışına)
      if (t < 13) {
        const bx = mx - (H ? 150 : 120);
        const k1 = clamp(k, 0, 2), k2 = clamp(k, 2, 5);
        const pa = ara(t, 5, 5.6) * (1 - ara(t, 12.2, 12.9));
        if (k1 > 0.02) E.cizgi(ctx, [[bx + 8, yk(0)], [bx, yk(0)], [bx, yk(k1)], [bx + 8, yk(k1)]], { renk: 'turkuaz', kalinlik: 3, alfa: pa });
        if (k2 > 2.02) E.cizgi(ctx, [[bx + 8, yk(2)], [bx, yk(2)], [bx, yk(k2)], [bx + 8, yk(k2)]], { renk: 'mercan', kalinlik: 3, alfa: pa });
      }
    }
    // Formül alanı
    const fx = H ? 860 : L.cx, f0 = H ? ic.y + 96 : ic.y + 46, fb = H ? 46 : 40, sat = H ? 84 : 72;
    const A = (a0, a1, b0, b1) => ara(t, a0, a1, 'cik3') * (1 - ara(t, b0, b1));
    E.formul(ctx, '10^{3} = 10 · 10 · 10 = 1\\,000', fx, f0, { boyut: fb, alfa: A(1.6, 2.4, 4.0, 4.6) });
    E.yazi(ctx, 'üs = basamak sayısı', fx, f0 + sat, { boyut: H ? 30 : 28, renk: 'turkuaz', agirlik: 600, alfa: A(2.4, 3.2, 4.0, 4.6) });
    // B: 10^2 · 10^3
    const bA = A(4.6, 5.2, 12.4, 13.0);
    if (bA > 0) {
      E.formul(ctx, '\\c{turkuaz}{10^{2}} · \\c{mercan}{10^{3}} = 10^{\\c{turkuaz}{2}+\\c{mercan}{3}} = \\c{limon}{10^{5}}', fx, f0, { boyut: fb, alfa: bA, aciga: kf(t, [[4.6, 0], [6.4, 0.33], [7.4, 0.42], [9.3, 1, 'lin']]) });
    }
    // C: başka tabanlar → genelleme
    const cA1 = A(9.0, 9.6, 12.4, 13.0), cA2 = A(9.8, 10.4, 12.4, 13.0), cA3 = A(10.9, 11.6, 12.4, 13.0);
    E.formul(ctx, '2^{3} · 2^{4} = 2^{7}', fx, f0 + sat, { boyut: fb * 0.92, renk: 'gumus', alfa: cA1 });
    E.formul(ctx, '5^{1} · 5^{2} = 5^{3}', fx, f0 + sat * 2, { boyut: fb * 0.92, renk: 'gumus', alfa: cA2 });
    E.formul(ctx, '\\kutu{limon}{a^{m} · a^{n} = a^{m+n}}', fx, f0 + sat * 3.25, { boyut: fb * 1.1, alfa: cA3, parilti: 0.3 * cA3, parRenk: 'limon' });
    // D: bölme = geri adım
    const dA = ara(t, 13.0, 13.6, 'cik3');
    E.formul(ctx, '\\frac{10^{5}}{10^{2}} = 10^{5−2} = 10^{3}', fx, f0 + 10, { boyut: fb, alfa: dA * (1 - ara(t, 17.4, 18.2)), aciga: ara(t, 13.0, 15.0, 'lin') });
    E.formul(ctx, '10^{0} = 1 \\qquad 10^{−1} = 0{,}1', fx, f0 + sat * 1.5, { boyut: fb * 0.92, renk: 'gumus', alfa: ara(t, 16.2, 16.8) * (1 - ara(t, 17.4, 18.2)) });
    E.formul(ctx, '\\kutu{limon}{\\frac{a^{m}}{a^{n}} = a^{m−n}}', fx, f0 + sat * 2.75, { boyut: fb * 1.05, alfa: ara(t, 15.2, 15.9) * (1 - ara(t, 17.4, 18.2)) });
  };

  /* ---------- 4. Kozmik cetvel: bilimsel gösterim ---------- */
  const NESNE = [
    [-10, 'Atom', '1 × 10^{−10}\\t{ m}', 'atom'],
    [-5, 'Hücre', '1 × 10^{−5}\\t{ m}', 'hucre'],
    [Math.log10(1.7), 'İnsan', '1{,}7 × 10^{0}\\t{ m}', 'insan'],
    [Math.log10(8849), 'Everest', '8{,}8 × 10^{3}\\t{ m}', 'dag'],
    [Math.log10(1.27e7), 'Dünya\u2019nın çapı', '1{,}3 × 10^{7}\\t{ m}', 'dunya'],
    [Math.log10(1.5e11), 'Dünya–Güneş', '1{,}5 × 10^{11}\\t{ m}', 'gunes'],
    [Math.log10(9.46e15), 'Işık yılı', '9{,}46 × 10^{15}\\t{ m}', 'yildiz'],
  ];
  const ikon = (ctx, tur, x, y, r, a) => {
    ctx.save(); ctx.globalAlpha *= a; ctx.lineWidth = 2.2; ctx.strokeStyle = E.R('turkuaz'); ctx.fillStyle = E.R('turkuaz');
    if (tur === 'atom') {
      E.nokta(ctx, x, y, r * 0.22, { renk: 'mercan', parilti: 0.8 });
      for (const aa of [0, 1.05, 2.1]) { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.36, aa, 0, E.TAU); ctx.stroke(); }
    } else if (tur === 'hucre') {
      ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = (i / 40) * E.TAU, rr = r * (1 + 0.08 * Math.sin(a * 3) + 0.05 * Math.cos(a * 5)); i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.85) : ctx.moveTo(x + rr, y); } ctx.stroke();
      E.nokta(ctx, x + r * 0.2, y - r * 0.1, r * 0.28, { renk: 'menekse', parilti: 0.5 });
    } else if (tur === 'insan') {
      ctx.beginPath(); ctx.arc(x, y - r * 0.62, r * 0.24, 0, E.TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - r * 0.36); ctx.lineTo(x, y + r * 0.3); ctx.moveTo(x - r * 0.45, y - r * 0.12); ctx.lineTo(x + r * 0.45, y - r * 0.12);
      ctx.moveTo(x, y + r * 0.3); ctx.lineTo(x - r * 0.32, y + r); ctx.moveTo(x, y + r * 0.3); ctx.lineTo(x + r * 0.32, y + r); ctx.stroke();
    } else if (tur === 'dag') {
      ctx.beginPath(); ctx.moveTo(x - r, y + r * 0.7); ctx.lineTo(x - r * 0.2, y - r * 0.8); ctx.lineTo(x + r * 0.15, y - r * 0.2); ctx.lineTo(x + r * 0.4, y - r * 0.5); ctx.lineTo(x + r, y + r * 0.7); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - r * 0.42, y - r * 0.4); ctx.lineTo(x - r * 0.2, y - r * 0.8); ctx.lineTo(x + 0.02 * r, y - r * 0.45); ctx.stroke();
    } else if (tur === 'dunya') {
      ctx.beginPath(); ctx.arc(x, y, r, 0, E.TAU); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y, r * 0.45, r, 0, 0, E.TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.stroke();
    } else if (tur === 'gunes') {
      E.nokta(ctx, x - r * 0.6, y, r * 0.42, { renk: 'limon', parilti: 1 });
      ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(x - r * 0.1, y); ctx.lineTo(x + r * 0.8, y); ctx.stroke(); ctx.setLineDash([]);
      E.nokta(ctx, x + r, y, r * 0.16, { renk: 'gok', parilti: 0.8 });
    } else if (tur === 'yildiz') {
      for (let i = 0; i < 8; i++) { const a = (i / 8) * E.TAU, rr = i % 2 ? r * 0.45 : r; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); ctx.stroke(); }
      E.nokta(ctx, x, y, r * 0.2, { renk: 'tebesir', parilti: 1.2 });
    }
    ctx.restore();
  };
  const kozmik = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const araP = H ? 50 : 46;
    const mx = H ? ic.x + 300 : ic.x + 90;
    const ustSinir = H ? ic.y : ic.y + kf(t, [[0, 175], [9.0, 175], [9.7, 350]]);
    // kamera: merkezdeki k değeri
    const kOrta = kf(t, [[0, -8.2], [1.2, -8.2], [8.8, 13.6, 'io3'], [16.2, 13.6]]);
    const yOrta = H ? ic.cy : kf(t, [[0, ic.y1 - 240], [8.8, ic.y1 - 240], [9.8, ic.y1 - 200, 'io3']]);
    const yk = (k) => yOrta - (k - kOrta) * araP;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, ustSinir - 6, E.W, ic.y1 - ustSinir + 12); ctx.clip();
    const icinde = (yy, pay = 20) => yy > ustSinir + pay && yy < ic.y1 - pay;
    // ray
    E.cizgi(ctx, [[mx, yk(-11)], [mx, yk(16.6)]], { renk: 'cizgi', kalinlik: 3 });
    for (let k = -11; k <= 16; k++) {
      const yy = yk(k);
      if (yy < ic.y - 30 || yy > ic.y1 + 30) continue;
      const vur = t > 9.4 && (k === 11 || k === 15) ? ara(t, 9.4, 10.2) : 0;
      E.cizgi(ctx, [[mx - 16, yy], [mx + 16, yy]], { renk: vur ? 'limon' : 'turkuaz', kalinlik: 2.5, parilti: 0.6 + vur });
      if (icinde(yy, 8)) E.formul(ctx, `10^{${k < 0 ? '−' + -k : k}}`, mx - 30, yy, { boyut: H ? 24 : 22, hiza: 'right', renk: vur ? 'limon' : 'gumus', alfa: 0.95 });
    }
    // nesneler
    NESNE.forEach(([k, ad, f, tur], i) => {
      const yy = yk(k);
      if (!icinde(yy, 30)) return;
      const yak = clamp(1 - Math.abs(k - kOrta) / 9);
      const a = clamp(0.35 + yak) * (t > 9.4 && i < 5 ? 1 - 0.6 * ara(t, 9.4, 10.2) : 1);
      E.cizgi(ctx, [[mx + 16, yy], [mx + 60, yy]], { renk: 'sis', kalinlik: 1.5, alfa: a });
      const ix = mx + (H ? 96 : 84);
      ikon(ctx, tur, ix, yy, H ? 22 : 20, a);
      const tx = ix + (H ? 44 : 38);
      E.yazi(ctx, ad, tx, yy - 16, { boyut: H ? 24 : 22, hiza: 'left', renk: 'gumus', agirlik: 600, alfa: a });
      E.formul(ctx, f, tx, yy + 18, { boyut: H ? 28 : 26, hiza: 'left', alfa: a });
    });
    ctx.restore();
    // Tanım (4.8 – 9.4)
    const tanA = ara(t, 4.9, 5.6) * (1 - ara(t, 9.0, 9.6));
    if (tanA > 0) {
      const px = H ? 760 : ic.x, py = H ? ic.y + 40 : ic.y + 6, pw = H ? 440 : ic.w, ph = H ? 150 : 140;
      E.panel(ctx, px, py, pw, ph, { alfa: tanA, vurgu: 'turkuaz' });
      E.formul(ctx, 'a × 10^{n}', px + pw / 2, py + 52, { boyut: 44, alfa: tanA, renk: 'turkuaz' });
      E.formul(ctx, '1 \\le a < 10, \\;\\; n \\in \\Z', px + pw / 2, py + 108, { boyut: 30, alfa: tanA, renk: 'gumus' });
    }
    // Karşılaştırma (9.6 – 15.7)
    const kA = ara(t, 9.7, 10.4);
    if (kA > 0) {
      const px = H ? 720 : ic.x, py = H ? ic.y + 30 : ic.y + 6, pw = H ? 490 : ic.w, ph = H ? 330 : 330;
      E.panel(ctx, px, py, pw, ph, { alfa: kA, vurgu: 'limon' });
      const cx = px + pw / 2;
      E.formul(ctx, '\\frac{9{,}46 × 10^{15}}{1{,}5 × 10^{11}}', cx, py + 70, { boyut: 34, alfa: kA });
      E.formul(ctx, '= \\frac{9{,}46}{1{,}5} × 10^{15−11}', cx, py + 160, { boyut: 34, alfa: ara(t, 11.0, 11.7), renk: 'tebesir' });
      E.formul(ctx, '≈ 6{,}3 × 10^{4} = \\c{limon}{63\\,000}', cx, py + 250, { boyut: 36, alfa: ara(t, 12.4, 13.1), parilti: 0.3 });
    }
  };

  /* ---------- 5. Yarım adım = kök; A4 kâğıdın sırrı ---------- */
  const yarim = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const lA = 1 - ara(t, 13.0, 13.8);
    // Taban 2 merdiveni: 2^0 ve 2^1, büyük aralık
    const mx = H ? ic.x + 230 : ic.x + 150;
    const yA = H ? ic.y1 - 50 : ic.y1 - 30, yB = H ? ic.y + 60 : ic.y + 420;
    const yk = (k) => lerp(yA, yB, k);
    if (lA > 0) {
      ctx.save(); ctx.globalAlpha *= lA;
      for (const dx of [-30, 30]) E.cizgi(ctx, [[mx + dx, yA + 40], [mx + dx, yB - 40]], { renk: 'cizgi', kalinlik: 3 });
      for (const [k, sol, sag] of [[0, '2^{0}', '1'], [1, '2^{1}', '2']]) {
        E.cizgi(ctx, [[mx - 30, yk(k)], [mx + 30, yk(k)]], { renk: 'turkuaz', kalinlik: 3.5, parilti: 1 });
        E.formul(ctx, sol, mx - 96, yk(k), { boyut: 34, hiza: 'right', renk: 'gumus' });
        E.yazi(ctx, sag, mx + 52, yk(k), { boyut: 34, hiza: 'left', agirlik: 600 });
      }
      // yarım basamak
      const yaA = ara(t, 1.2, 2.0) * (1 - ara(t, 9.0, 9.6));
      const ym = yk(0.5);
      E.cizgi(ctx, [[mx - 30, ym], [mx + 30, ym]], { renk: 'limon', kalinlik: 3, kesik: [6, 6], alfa: yaA, parilti: 0.6 });
      E.yazi(ctx, t < 6.6 ? '?' : '1,414…', mx + 52, ym, { boyut: 34, hiza: 'left', agirlik: 700, renk: 'limon', alfa: yaA });
      E.formul(ctx, t < 6.6 ? '2^{?}' : '2^{1/2}', mx - 96, ym, { boyut: 34, hiza: 'right', renk: 'limon', alfa: yaA * ara(t, 2.4, 3.0) });
      // üçte bir basamaklar
      const ucA = ara(t, 9.2, 9.9);
      for (const k of [1 / 3, 2 / 3]) {
        E.cizgi(ctx, [[mx - 30, yk(k)], [mx + 30, yk(k)]], { renk: 'menekse', kalinlik: 3, kesik: [6, 6], alfa: ucA, parilti: 0.6 });
      }
      E.formul(ctx, '2^{1/3} ≈ 1{,}26', mx + 52, yk(1 / 3), { boyut: 30, hiza: 'left', renk: 'menekse', alfa: ucA * ara(t, 10.4, 11) });
      E.formul(ctx, '2^{2/3} ≈ 1{,}59', mx + 52, yk(2 / 3), { boyut: 30, hiza: 'left', renk: 'menekse', alfa: ucA * ara(t, 10.4, 11) });
      // işaretçi sekmeleri
      let k = 0;
      if (t < 9.2) k = kf(t, [[4.6, 0], [5.4, 0.5, 'io3'], [6.2, 0.5], [7.0, 1, 'io3']]);
      else k = kf(t, [[9.4, 0], [9.6, 0], [10.2, 1 / 3, 'io3'], [10.8, 2 / 3, 'io3'], [11.4, 1, 'io3']]);
      if (t > 4.4) {
        E.nokta(ctx, mx, yk(k), 10, { renk: 'limon', parilti: 1.4, alfa: ara(t, 4.4, 4.7) });
        // sekme yayları (sağ tarafta değil, solda)
        const yaylar = t < 9.2 ? [[0, 0.5, 5.0], [0.5, 1, 6.6]] : [[0, 1 / 3, 9.8], [1 / 3, 2 / 3, 10.4], [2 / 3, 1, 11.0]];
        for (const [a, b, ts] of yaylar) {
          const p = ara(t, ts - 0.4, ts + 0.4);
          if (p <= 0) continue;
          const y1 = yk(a), y2 = yk(b), r = (y1 - y2) / 2;
          ctx.save(); ctx.globalAlpha *= 0.85 * lA * (t < 9.2 ? 1 - ara(t, 8.6, 9.2) : 1);
          ctx.strokeStyle = E.R(t < 9.2 ? 'limon' : 'menekse'); ctx.lineWidth = 2.5; ctx.setLineDash([5, 6]);
          ctx.beginPath(); ctx.ellipse(mx - 30, (y1 + y2) / 2, 44, r, 0, Math.PI / 2, Math.PI / 2 + Math.PI * p); ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();
    }
    // Formüller
    const fx = H ? 860 : L.cx, f0 = H ? ic.y + 60 : ic.y + 30, sat = H ? 78 : 70, fb = H ? 40 : 36;
    const fa = (a0, b0) => ara(t, a0, a0 + 0.6, 'cik3') * (1 - ara(t, b0, b0 + 0.5));
    E.formul(ctx, 'x · x = 2', fx, f0, { boyut: fb, alfa: fa(4.8, 8.8) });
    E.formul(ctx, 'x = \\sqrt{2} ≈ 1{,}414', fx, f0 + sat, { boyut: fb, alfa: fa(6.0, 8.8), renk: 'limon' });
    E.formul(ctx, '2^{1/2} · 2^{1/2} = 2^{1}', fx, f0 + sat * 2, { boyut: fb * 0.92, alfa: fa(7.2, 8.8), renk: 'gumus' });
    E.formul(ctx, '2^{1/3} · 2^{1/3} · 2^{1/3} = 2', fx, f0, { boyut: fb * 0.92, alfa: fa(9.6, 12.9), renk: 'gumus' });
    E.formul(ctx, '2^{1/3} = \\sqrt[3]{2}', fx, f0 + sat, { boyut: fb, alfa: fa(10.6, 12.9), renk: 'menekse' });
    E.formul(ctx, '\\kutu{limon}{a^{m/n} = \\sqrt[n]{a^{m}}}', fx, f0 + sat * 2.3, { boyut: fb * 1.1, alfa: fa(11.6, 12.9), parilti: 0.3, parRenk: 'limon' });

    // A4 kâğıt
    const kA = ara(t, 13.6, 14.4);
    if (kA > 0) {
      const h = H ? 400 : 480, w = h / Math.SQRT2;
      const cx = L.cx + (H ? -150 : 0), cy = H ? ic.cy : ic.y + 290;
      const katla = ara(t, 18.4, 19.8, 'io3');
      const don = ara(t, 20.0, 21.6, 'io3');
      ctx.save(); ctx.globalAlpha *= kA;
      // hayalet: orijinal çerçeve (dönüşten sonra eşleşme için)
      E.cizgi(ctx, [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]], { kapali: true, renk: 'turkuaz', kalinlik: 2, kesik: [8, 8], alfa: 0.5 + 0.5 * don, parilti: don });
      if (don <= 0) {
        // alt yarı
        ctx.fillStyle = 'rgba(233,238,246,0.92)'; ctx.fillRect(cx - w / 2, cy, w, h / 2);
        // üst yarı katlanıyor (fold çizgisi y=cy)
        const c = Math.cos(Math.PI * katla);
        const ust = cy - (h / 2) * c;
        ctx.fillStyle = c >= 0 ? 'rgba(233,238,246,0.92)' : 'rgba(190,201,220,0.95)';
        ctx.fillRect(cx - w / 2, Math.min(cy, ust), w, Math.abs(cy - ust));
        ctx.strokeStyle = E.rgba('gece', 0.5); ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - w / 2, Math.min(cy, ust), w, Math.abs(cy - ust));
        if (katla > 0) { ctx.setLineDash([6, 6]); ctx.strokeStyle = E.rgba('mercan', 0.8); ctx.beginPath(); ctx.moveTo(cx - w / 2 - 20, cy); ctx.lineTo(cx + w / 2 + 20, cy); ctx.stroke(); ctx.setLineDash([]); }
      } else {
        // A5: alt yarı, 90° döner ve √2 kat büyür
        const a5cx = lerp(cx, cx, don), a5cy = lerp(cy + h / 4, cy, don);
        const olc = lerp(1, Math.SQRT2, don), aci = lerp(0, -Math.PI / 2, don);
        ctx.save(); ctx.translate(a5cx, a5cy); ctx.rotate(aci); ctx.scale(olc, olc);
        ctx.fillStyle = 'rgba(233,238,246,0.92)'; ctx.fillRect(-w / 2, -h / 4, w, h / 2);
        ctx.restore();
        if (don >= 1) E.isik(ctx, cx, cy, h, 'turkuaz', 0.25 * E.nabiz(t, 21.6, 1.4));
      }
      ctx.restore();
      // ölçüler
      const oA = ara(t, 14.6, 15.3) * (1 - ara(t, 18.0, 18.4));
      E.formul(ctx, '1', cx, cy + h / 2 + 32, { boyut: 32, alfa: oA, renk: 'turkuaz' });
      E.formul(ctx, '\\sqrt{2}', cx - w / 2 - 44, cy, { boyut: 32, alfa: oA, renk: 'turkuaz' });
      const tx = H ? 900 : L.cx, ty = H ? ic.y + 120 : ic.y + 650;
      E.formul(ctx, '\\frac{297\\t{ mm}}{210\\t{ mm}} ≈ 1{,}414 ≈ \\sqrt{2}', tx, ty, { boyut: H ? 36 : 32, alfa: ara(t, 15.4, 16.1) * (1 - ara(t, 21.8, 22.4)) });
      E.yazi(ctx, 'Yarısı da aynı şekil', tx, ty + (H ? 110 : 84), { boyut: H ? 34 : 30, agirlik: 640, renk: 'limon', alfa: ara(t, 21.2, 21.9), parilti: 0.3, parRenk: 'limon' });
    }
  };

  /* ---------- 6. Köklerle işlem ve eşlenik ---------- */
  const kokIslem = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const cx = L.cx, fb = H ? 42 : 34;
    // A: √8 = 2√2
    const aA = ara(t, 0.3, 0.9) * (1 - ara(t, 4.8, 5.3));
    if (aA > 0) {
      const y1 = H ? ic.y + 90 : ic.y + 120;
      E.formul(ctx, '\\sqrt{8} = \\sqrt{4 · 2} = \\sqrt{4} · \\sqrt{2} = \\c{limon}{2\\sqrt{2}}', cx, y1, { boyut: fb, alfa: aA, aciga: ara(t, 0.3, 2.4, 'lin') });
      E.formul(ctx, '8^{1/2} = (2^{3})^{1/2} = 2^{3/2} = 2^{1} · 2^{1/2}', cx, y1 + (H ? 90 : 90), { boyut: fb * 0.82, renk: 'gumus', alfa: aA * ara(t, 2.2, 2.9) });
      // mini yatay merdiven: 1,2,4,8
      const y2 = H ? ic.y + 330 : ic.y + 400, x0 = cx - (H ? 330 : 260), adim = H ? 220 : 173;
      E.cizgi(ctx, [[x0 - 30, y2], [x0 + adim * 3 + 30, y2]], { renk: 'cizgi', kalinlik: 3, alfa: aA });
      [1, 2, 4, 8].forEach((v, i) => {
        E.cizgi(ctx, [[x0 + i * adim, y2 - 16], [x0 + i * adim, y2 + 16]], { renk: 'turkuaz', kalinlik: 3, parilti: 0.7, alfa: aA });
        E.yazi(ctx, String(v), x0 + i * adim, y2 + 46, { boyut: 30, agirlik: 600, alfa: aA });
        E.formul(ctx, `2^{${i}}`, x0 + i * adim, y2 - 46, { boyut: 26, renk: 'gumus', alfa: aA });
      });
      const m = kf(t, [[2.6, 3], [3.6, 1.5, 'io3']]);
      const mxp = x0 + m * adim;
      E.nokta(ctx, mxp, y2, 10, { renk: 'limon', parilti: 1.3, alfa: aA * ara(t, 2.4, 2.7) });
      E.yazi(ctx, '2√2 ≈ 2,83', x0 + 1.5 * adim, y2 + 96, { boyut: 30, agirlik: 700, renk: 'limon', alfa: aA * ara(t, 3.6, 4.1) });
    }
    // B: eşlenik
    const bA = ara(t, 5.3, 5.9) * (1 - ara(t, 10.0, 10.5));
    if (bA > 0) {
      const y1 = H ? ic.y + 100 : ic.y + 140;
      E.formul(ctx, '(\\sqrt{5} − \\sqrt{3})(\\sqrt{5} + \\sqrt{3})', cx, y1, { boyut: fb, alfa: bA });
      // açılım parçaları
      const y2 = y1 + (H ? 150 : 150);
      const parca = ['5', '+', '\\sqrt{15}', '−', '\\sqrt{15}', '−', '3'];
      const b = fb * 1.05;
      const g = parca.map((p) => E.formulOlc(ctx, p, b).w + b * 0.28);
      const top = g.reduce((a, c) => a + c, 0);
      let x = cx - top / 2;
      const xs = g.map((w) => { const xx = x + w / 2; x += w; return xx; });
      const yok = ara(t, 7.4, 8.2, 'io3'), kapan = ara(t, 8.3, 9.0, 'io3');
      const orta = (xs[1] + xs[4]) / 2;
      const ac = ara(t, 6.3, 6.9);
      parca.forEach((p, i) => {
        let px = xs[i], al = ac;
        if (i >= 1 && i <= 4) { px = lerp(xs[i], orta, yok); al *= 1 - ara(t, 7.9, 8.3); }
        if (i === 0) px = lerp(xs[0], orta - g[5] / 2 - g[0] / 2 - g[6] * 0.0, kapan);
        if (i >= 5) px = lerp(xs[i], orta + (i === 5 ? 0 : g[5] / 2 + g[6] / 2), kapan);
        const renk = i === 2 || i === 4 ? 'mercan' : 'tebesir';
        E.formul(ctx, p, px, y2, { boyut: b, renk, alfa: al * bA, cakisabilir: i >= 1 && i <= 4 && yok > 0.05 });
      });
      E.isik(ctx, orta, y2, 220, 'mercan', 0.55 * E.nabiz(t, 7.8, 0.8) * bA);
      E.formul(ctx, '= \\c{limon}{2}', orta + g[5] / 2 + g[6] + b * 0.9, y2, { boyut: b, alfa: ara(t, 9.0, 9.5) * bA });
      E.yazi(ctx, 'kök kayboldu', cx, y2 + (H ? 110 : 110), { boyut: H ? 30 : 28, agirlik: 600, renk: 'turkuaz', alfa: ara(t, 9.1, 9.7) * bA });
    }
    // C: paydayı kökten kurtar ve doğrula
    const cA = ara(t, 10.4, 11.0);
    if (cA > 0) {
      const y1 = H ? ic.y + 90 : ic.y + 110;
      E.formul(ctx, '\\frac{1}{\\sqrt{5} − \\sqrt{3}} = \\frac{\\sqrt{5} + \\sqrt{3}}{2}', cx, y1, { boyut: fb, alfa: cA });
      const y2 = H ? ic.y + 290 : ic.y + 330;
      const solx = H ? cx - 270 : cx, sagx = H ? cx + 270 : cx;
      const y3 = H ? y2 : y2 + 170;
      E.panel(ctx, solx - (H ? 240 : 300), y2 - 70, H ? 480 : 600, 140, { alfa: ara(t, 11.6, 12.2), vurgu: 'turkuaz' });
      E.yazi(ctx, 'Sol taraf', solx, y2 - 34, { boyut: 24, renk: 'gumus', agirlik: 600, alfa: ara(t, 11.6, 12.2) });
      E.yazi(ctx, '1 : 0,5040 ≈ 1,984', solx, y2 + 18, { boyut: 34, agirlik: 640, alfa: ara(t, 11.8, 12.4) });
      E.panel(ctx, sagx - (H ? 240 : 300), y3 - 70, H ? 480 : 600, 140, { alfa: ara(t, 12.4, 13.0), vurgu: 'turkuaz' });
      E.yazi(ctx, 'Sağ taraf', sagx, y3 - 34, { boyut: 24, renk: 'gumus', agirlik: 600, alfa: ara(t, 12.4, 13.0) });
      E.yazi(ctx, '(2,236 + 1,732) : 2 ≈ 1,984', sagx, y3 + 18, { boyut: 34, agirlik: 640, alfa: ara(t, 12.6, 13.2) });
      E.yazi(ctx, '✓ aynı sayı', cx, (H ? y2 : y3) + (H ? 120 : 120), { boyut: 34, agirlik: 700, renk: 'limon', alfa: ara(t, 13.4, 14.0), parilti: 0.4, parRenk: 'limon' });
    }
  };

  /* ---------- 7. Problem: tarla ve çit ---------- */
  const tarla = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const boy = H ? 380 : 400;
    const x0 = H ? ic.x + 90 : L.cx - boy / 2, y0 = H ? ic.cy - boy / 2 + 6 : ic.y + 20;
    const a = ara(t, 0.1, 0.8);
    // tarla dokusu
    ctx.save(); ctx.globalAlpha *= a;
    const g = ctx.createLinearGradient(x0, y0, x0 + boy, y0 + boy);
    g.addColorStop(0, 'rgba(60,230,207,0.10)'); g.addColorStop(1, 'rgba(154,134,255,0.10)');
    ctx.fillStyle = g; ctx.fillRect(x0, y0, boy, boy);
    ctx.beginPath(); ctx.rect(x0, y0, boy, boy); ctx.clip();
    ctx.strokeStyle = 'rgba(167,179,201,0.16)'; ctx.lineWidth = 2;
    for (let i = -boy; i < boy * 2; i += 18) { ctx.beginPath(); ctx.moveTo(x0 + i, y0); ctx.lineTo(x0 + i + boy * 0.35, y0 + boy); ctx.stroke(); }
    ctx.restore();
    E.formul(ctx, 'A = 1000\\t{ m}^{2}', x0 + boy / 2, y0 + boy / 2, { boyut: 36, alfa: ara(t, 0.6, 1.2) });
    // çit
    const p = ara(t, 4.6, 7.4, 'io2');
    const kose = [[x0, y0], [x0 + boy, y0], [x0 + boy, y0 + boy], [x0, y0 + boy]];
    E.cizgi(ctx, kose, { kapali: true, renk: 'mercan', kalinlik: 4, parilti: 1, p });
    // direkler
    const cevre = boy * 4;
    for (let d = 0; d < cevre * p; d += boy / 8) {
      const kenar = Math.floor(d / boy), u = (d % boy) / boy;
      const [ax, ay] = kose[kenar], [bx, by] = kose[(kenar + 1) % 4];
      E.nokta(ctx, lerp(ax, bx, u), lerp(ay, by, u), 4, { renk: 'mercan', parilti: 0.5 });
    }
    // kenar etiketi
    E.formul(ctx, '\\sqrt{1000} ≈ 31{,}62\\t{ m}', x0 + boy / 2, y0 - 34, { boyut: 30, renk: 'turkuaz', alfa: ara(t, 2.0, 2.7) });
    // hesap
    const fx = H ? 880 : L.cx, f0 = H ? ic.y + 110 : y0 + boy + 80, sat = H ? 82 : 72, fb = H ? 38 : 34;
    E.formul(ctx, 'Ç = 4\\sqrt{1000} = 4 · 10\\sqrt{10} = 40\\sqrt{10}', fx, f0, { boyut: fb * (H ? 0.9 : 0.86), alfa: ara(t, 4.6, 5.3), aciga: ara(t, 4.6, 6.4, 'lin') });
    E.formul(ctx, '40\\sqrt{10} ≈ 126{,}49\\t{ m}', fx, f0 + sat, { boyut: fb, alfa: ara(t, 6.6, 7.2), renk: 'limon' });
    const yA = ara(t, 7.8, 8.4), yB = ara(t, 8.8, 9.4);
    E.yazi(ctx, '126 m  ✗ yetmez', fx, f0 + sat * 2, { boyut: fb * 0.86, agirlik: 640, renk: 'mercan', alfa: yA });
    E.yazi(ctx, '127 m  ✓ yeter', fx, f0 + sat * 2.85, { boyut: fb * 0.86, agirlik: 700, renk: 'turkuaz', alfa: yB, parilti: 0.3 });
  };

  /* ---------- 8–9. Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Üs, kaç adım attığını sayar.', formul: 'a^{m} · a^{n} = a^{m+n}' },
    { tr: 'Bölmek geri adımdır.', formul: '\\frac{a^{m}}{a^{n}} = a^{m−n}, \\;\\; a^{0} = 1' },
    { tr: 'Kesirli üs köktür.', formul: 'a^{m/n} = \\sqrt[n]{a^{m}}' },
    { tr: 'Eşlenik, kökü siler.', formul: '(\\sqrt{a} − \\sqrt{b})(\\sqrt{a} + \\sqrt{b}) = a − b' },
  ], { aralik: 1.6 });
  const bitis = (ctx, s) => E.bitisKarti(ctx, s, meta);

  /* ---------- Film ---------- */
  E.film({
    meta,
    sure: 117.5,
    sahneler: [
      { ad: 'Soğuk açılış: 42 katlama', bas: 0, son: 10.3, giris: 0, cikis: 0.7, ciz: acilis },
      { ad: 'İmza', bas: 10.0, son: 13.7, giris: 0.3, ciz: imza },
      { ad: 'Başlık', bas: 13.4, son: 17.7, ciz: baslik },
      { ad: 'Üs bir adım sayacıdır', bas: 17.4, son: 36.0, ciz: merdivenSahne },
      { ad: 'Kozmik cetvel: bilimsel gösterim', bas: 35.7, son: 51.9, ciz: kozmik },
      { ad: 'Yarım adım: kök ve A4 kâğıdı', bas: 51.9, son: 74.9, ciz: yarim },
      { ad: 'Köklerle işlem ve eşlenik', bas: 74.7, son: 90.5, ciz: kokIslem },
      { ad: 'Problem: tarlanın çiti', bas: 90.3, son: 100.9, ciz: tarla },
      { ad: 'Aklında kalsın', bas: 100.7, son: 111.0, ciz: ozet },
      { ad: 'Laboratuvar', bas: 110.8, son: 117.5, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 6 }),
  });
})();
