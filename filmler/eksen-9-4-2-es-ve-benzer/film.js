/* ==========================================================================
   EKSEN 9.4.2 — Üçgeni Kilitlemek
   Tek fikir: Bir üçgeni kilitlemek için kaç bilgi gerekir? Her bilgi olası
   üçgenlerin "hayalet ailesini" daraltır. KKK, KAK, AKA tek üçgene kilitler
   (eşlik); AA ise yalnızca şekli kilitler, boyut serbest kalır (benzerlik).
   Tüm geometri gerçek koordinatlarla hesaplanır (çember–çember, çember–doğru,
   doğru–doğru kesişimleri).
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp } = E;
  const D = Math.PI / 180;

  const meta = {
    kod: 'MAT.9.4.2',
    tema: 'Eşlik ve Benzerlik',
    ad: 'Üçgeni Kilitlemek',
    adEn: 'Locking a Triangle',
    labAd: 'Dönüşüm ve Benzerlik Laboratuvarı',
    labAciklama: 'Kenar ve açıları tek tek kilitle: hangi bilgiler tek üçgen, hangileri benzer bir aile veriyor, kendin dene.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-donusumler/',
  };

  /* ---------- Geometri yardımcıları (matematik koordinatı: y yukarı) ---------- */
  const uzak = (P, Q) => Math.hypot(Q[0] - P[0], Q[1] - P[1]);
  const kutup = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
  const topla = (P, Q) => [P[0] + Q[0], P[1] + Q[1]];
  const agirlik = (Ps) => [Ps.reduce((s, p) => s + p[0], 0) / Ps.length, Ps.reduce((s, p) => s + p[1], 0) / Ps.length];
  /** İki çemberin kesişimi: [üst, alt] (AB yönüne göre sol/sağ) */
  const cemberKes = (A, ra, B, rb) => {
    const d = uzak(A, B), a = (ra * ra - rb * rb + d * d) / (2 * d), h = Math.sqrt(Math.max(0, ra * ra - a * a));
    const ux = (B[0] - A[0]) / d, uy = (B[1] - A[1]) / d;
    const M = [A[0] + a * ux, A[1] + a * uy];
    return [[M[0] - h * uy, M[1] + h * ux], [M[0] + h * uy, M[1] - h * ux]];
  };
  /** Çember ile doğrunun (P0 + s·u, u birim) kesişimleri, s'ye göre sıralı */
  const cemberDogru = (C, r, P0, u) => {
    const dx = P0[0] - C[0], dy = P0[1] - C[1];
    const b = dx * u[0] + dy * u[1], c = dx * dx + dy * dy - r * r, Dk = b * b - c;
    if (Dk < 0) return [];
    const k = Math.sqrt(Dk);
    return [-b - k, -b + k].map((s) => [P0[0] + s * u[0], P0[1] + s * u[1]]);
  };
  /** İki doğrunun kesişimi: P + s·u ve Q + r·v */
  const dogruKes = (P, u, Q, v) => {
    const det = u[0] * -v[1] - u[1] * -v[0];
    const s = ((Q[0] - P[0]) * -v[1] - (Q[1] - P[1]) * -v[0]) / det;
    return [P[0] + s * u[0], P[1] + s * u[1]];
  };
  /** Açıları (A, B; derece) ve taban uzunluğu verilen üçgenin tepe noktası */
  const aaTepe = (L, a, b) => dogruKes([0, 0], kutup(1, a * D), [L, 0], kutup(1, Math.PI - b * D));
  /** Matematik → ekran eşlemesi */
  const harita = (ox, oy, s) => { const f = (P) => [ox + P[0] * s, oy - P[1] * s]; f.s = s; return f; };
  const sayi = (v, b = 2) => E.sayiYaz(v, b);
  const derece = (rad) => Math.round(rad / D);

  /* ---------- Çizim yardımcıları (ekran koordinatı) ---------- */
  const ucgen = (ctx, P, o = {}) => {
    const a = o.alfa ?? 1;
    if (a <= 0.002) return;
    if (o.dolgu) E.cokgen(ctx, P, { renk: o.dolguRenk || o.renk, alfa: o.dolgu * a });
    E.cizgi(ctx, P, { renk: o.renk || 'tebesir', kalinlik: o.kalinlik ?? 3, parilti: o.parilti ?? 0.8, kapali: true, p: o.p ?? 1, alfa: a, kesik: o.kesik });
  };
  /** V köşesindeki iç açı yayı (P1 ve P2 yönleri arasında, küçük açı) */
  const aci = (ctx, V, P1, P2, r, o = {}) => {
    const a0 = Math.atan2(P1[1] - V[1], P1[0] - V[0]);
    let d = Math.atan2(P2[1] - V[1], P2[0] - V[0]) - a0;
    while (d > Math.PI) d -= E.TAU;
    while (d < -Math.PI) d += E.TAU;
    E.aciYayi(ctx, V[0], V[1], r, a0, a0 + d, Object.assign({ kalinlik: 2.5, dolgu: 0.16 }, o));
  };
  /** Açıortay yönünde etiket konumu */
  const aciYer = (V, P1, P2, r) => {
    const u1 = [P1[0] - V[0], P1[1] - V[1]], u2 = [P2[0] - V[0], P2[1] - V[1]];
    const n1 = Math.hypot(...u1), n2 = Math.hypot(...u2);
    const b = [u1[0] / n1 + u2[0] / n2, u1[1] / n1 + u2[1] / n2], nb = Math.hypot(...b) || 1;
    return [V[0] + (b[0] / nb) * r, V[1] + (b[1] / nb) * r];
  };
  /** Kenar etiketi: orta noktadan, referans noktasının tersine dik uzaklıkta */
  const kenarYer = (P1, P2, ref, d) => {
    const m = [(P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2];
    let n = [-(P2[1] - P1[1]), P2[0] - P1[0]];
    const nn = Math.hypot(...n) || 1; n = [n[0] / nn, n[1] / nn];
    if ((m[0] - ref[0]) * n[0] + (m[1] - ref[1]) * n[1] < 0) n = [-n[0], -n[1]];
    return [m[0] + n[0] * d, m[1] + n[1] * d];
  };
  /** Köşe etiketi: ağırlık merkezinden dışarı doğru */
  const koseYer = (V, G, d) => {
    const u = [V[0] - G[0], V[1] - G[1]], n = Math.hypot(...u) || 1;
    return [V[0] + (u[0] / n) * d, V[1] + (u[1] / n) * d];
  };
  const etiketler = (ctx, P, adlar, o = {}) => {
    const G = agirlik(P);
    P.forEach((V, i) => {
      if (!adlar[i]) return;
      const [x, y] = koseYer(V, G, o.d || 30);
      E.formul(ctx, adlar[i], x, y, { boyut: o.boyut || 28, renk: o.renk || 'gumus', alfa: o.alfa ?? 1 });
    });
  };
  /** Asma kilit simgesi: kapali 0 (açık) → 1 (kilitli) */
  const kilit = (ctx, x, y, b, kapali, o = {}) => {
    const al = o.alfa ?? 1;
    if (al <= 0.002) return;
    const renk = o.renk || 'limon';
    ctx.save();
    ctx.globalAlpha *= al;
    if (kapali > 0.98) E.isik(ctx, x, y, b * 2.6, renk, 0.35 * (o.parla ?? 1));
    const w = b, h = b * 0.78, sr = w * 0.29;
    const kalk = (1 - kapali) * b * 0.36;
    const sy = y - h / 2 - b * 0.26 - kalk;
    ctx.strokeStyle = E.R(renk); ctx.lineWidth = b * 0.13; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - sr, y - h / 2 + 2);
    ctx.lineTo(x - sr, sy);
    ctx.arc(x, sy, sr, Math.PI, 0);
    ctx.lineTo(x + sr, y - h / 2 - kalk + b * 0.02);
    ctx.stroke();
    E.yuvarlakDik(ctx, x - w / 2, y - h / 2, w, h, b * 0.14);
    ctx.fillStyle = E.R(renk); ctx.fill();
    ctx.fillStyle = E.R('gece');
    ctx.beginPath(); ctx.arc(x, y - h * 0.08, b * 0.09, 0, E.TAU); ctx.fill();
    ctx.fillRect(x - b * 0.035, y - h * 0.08, b * 0.07, h * 0.28);
    ctx.restore();
  };
  /** Çubuk: başlangıç (ekran), açı (matematik, radyan), uzunluk (px) */
  const cubuk = (ctx, P0, a, boy, renk, o = {}) => {
    const P1 = [P0[0] + boy * Math.cos(a), P0[1] - boy * Math.sin(a)];
    E.cizgi(ctx, [P0, P1], { renk, kalinlik: o.kalinlik || 7, parilti: o.parilti ?? 0.9, alfa: o.alfa ?? 1 });
    E.nokta(ctx, P0[0], P0[1], 6, { renk: 'tebesir', parilti: 0.6, alfa: o.alfa ?? 1 });
    E.nokta(ctx, P1[0], P1[1], 6, { renk: 'tebesir', parilti: 0.6, alfa: o.alfa ?? 1 });
    return P1;
  };
  const yay = (ctx, M, r, a0, a1, o = {}) => {
    const n = 48, pts = [];
    for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); pts.push([M[0] + r * Math.cos(a), M[1] - r * Math.sin(a)]); }
    E.cizgi(ctx, pts, Object.assign({ kalinlik: 2, renk: 'gumus' }, o));
  };
  const yakinlas = (ctx, x, y, z) => { ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y); };
  /** Başlık satırı: büyük kısaltma + açıklama */
  const baslik = (ctx, x, y, kisa, aciklama, o = {}) => {
    const al = o.alfa ?? 1;
    E.formul(ctx, kisa, x, y, { boyut: o.boyut || 46, hiza: o.hiza || 'left', alfa: al, parilti: 0.25 });
    if (aciklama) E.yazi(ctx, aciklama, x, y + (o.ara || 46), { boyut: o.aBoyut || 26, renk: 'gumus', agirlik: 520, hiza: o.hiza || 'left', alfa: al * (o.aAlfa ?? 1), maxGen: o.maxGen });
  };

  /* ---------- 1. Soğuk açılış: hayalet üçgenler ---------- */
  const acilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc = H ? 62 : 56;
    const Ax = H ? L.cx - 3 * sc : ic.x + 4 * sc + 18;
    const by = H ? ic.y1 - 64 : ic.y + 640;
    const g = harita(Ax, by, sc);
    const A = [0, 0], B = [6, 0];
    const snap = ara(t, 4.3, 5.7, 'io3');
    const son = ara(t, 8.0, 9.0);
    // kamera: hafif yaklaşma, sonda itme
    ctx.save();
    yakinlas(ctx, g([3, 1.6])[0], g([3, 1.6])[1], kf(t, [[0, 1.08], [7.8, 1.0], [11, 1.1, 'gir2']]));
    // çember (ikinci bilgi)
    const cp = ara(t, 4.0, 5.0);
    if (cp > 0) yay(ctx, g(A), 4 * sc, 10 * D, lerp(10, 170, cp) * D, { renk: 'menekse', kesik: [8, 9], alfa: 0.75, parilti: 0.4 });
    // hayalet aile
    const N = 26;
    const hA = ara(t, 0.9, 1.9) * (1 - 0.5 * son);
    for (let i = 0; i < N; i++) {
      const gz = [3 + 3.9 * E.gurultu(t * 0.32 + i * 7.31, i + 1), 2.5 + 1.9 * E.gurultu(t * 0.27 + i * 3.17, i + 60)];
      gz[1] = Math.max(0.55, gz[1]);
      const th = (18 + 144 * (i / (N - 1)) + 7 * Math.sin(t * 0.9 + i * 1.7)) * D;
      const C = [lerp(gz[0], 4 * Math.cos(th), snap), lerp(gz[1], 4 * Math.sin(th), snap)];
      const tit = 0.55 + 0.45 * Math.sin(t * 3.1 + i * 2.3) * (son > 0 ? 1 : 0.4);
      const renk = i % 3 === 0 ? 'menekse' : i % 3 === 1 ? 'turkuaz' : 'gok';
      ucgen(ctx, [g(A), g(B), g(C)], { renk, kalinlik: 1.5, parilti: 0.35, alfa: hA * 0.32 * tit });
      E.nokta(ctx, g(C)[0], g(C)[1], 3, { renk, alfa: hA * 0.7 * tit, parilti: 0.5 });
    }
    // parlak "canlı" üçgen
    const gzC = [3 + 3.2 * E.gurultu(t * 0.85, 3), Math.max(0.9, 2.5 + 1.5 * E.gurultu(t * 0.75, 4))];
    const thC = (90 + 62 * Math.sin((t - 4.3) * 1.25)) * D;
    const C = [lerp(gzC[0], 4 * Math.cos(thC), snap), lerp(gzC[1], 4 * Math.sin(thC), snap)];
    const cA = ara(t, 1.1, 1.8);
    ucgen(ctx, [g(A), g(B), g(C)], { renk: 'tebesir', dolgu: 0.08, dolguRenk: 'turkuaz', kalinlik: 2.5, parilti: 0.6, alfa: cA });
    if (snap > 0.05) E.cizgi(ctx, [g(A), g(C)], { renk: 'menekse', kalinlik: 5, parilti: 1, alfa: snap });
    E.nokta(ctx, g(C)[0], g(C)[1], 7, { renk: 'limon', parilti: 1.2, alfa: cA });
    // taban
    const p = ara(t, 0.2, 1.2);
    E.cizgi(ctx, [g(A), g(B)], { renk: 'turkuaz', kalinlik: 5, parilti: 1.1, p });
    E.nokta(ctx, g(A)[0], g(A)[1], 7, { renk: 'turkuaz', alfa: p });
    E.nokta(ctx, g(B)[0], g(B)[1], 7, { renk: 'turkuaz', alfa: ara(t, 1.0, 1.3) });
    E.formul(ctx, 'A', g(A)[0] - 26, g(A)[1] + 24, { boyut: 28, renk: 'gumus', alfa: p });
    E.formul(ctx, 'B', g(B)[0] + 26, g(B)[1] + 24, { boyut: 28, renk: 'gumus', alfa: p });
    ctx.restore();

    // Sayaçlar
    const bilgi = t < 4.2 ? '1' : t < 8.2 ? '2' : '3?';
    const ga = ara(t, 0.5, 1.2);
    const lx = ic.x + 10, rx = ic.x1 - 10, y0 = ic.y + 14;
    E.yazi(ctx, 'BİLGİ', lx, y0, { boyut: 22, agirlik: 700, harfAra: 5, renk: 'turkuaz', hiza: 'left', alfa: ga });
    E.yazi(ctx, bilgi, lx, y0 + 54, { boyut: 64, agirlik: 760, hiza: 'left', alfa: ga, renk: t >= 8.2 ? 'limon' : 'tebesir', parilti: 0.3 * E.nabiz(t, 8.2, 0.8) + 0.2 * E.nabiz(t, 4.2, 0.8) });
    E.formul(ctx, '|AB| = 6', lx, y0 + 126, { boyut: 32, hiza: 'left', renk: 'turkuaz', alfa: ara(t, 1.0, 1.6) });
    E.formul(ctx, '|AC| = 4', lx, y0 + 174, { boyut: 32, hiza: 'left', renk: 'menekse', alfa: ara(t, 4.2, 4.8) });
    E.formul(ctx, '?', lx, y0 + 222, { boyut: 34, hiza: 'left', renk: 'limon', alfa: ara(t, 8.2, 8.8) });
    E.yazi(ctx, 'OLASI ÜÇGEN', rx, y0, { boyut: 22, agirlik: 700, harfAra: 5, renk: 'mercan', hiza: 'right', alfa: ga });
    E.yazi(ctx, '∞', rx, y0 + 54, { boyut: 72, agirlik: 600, hiza: 'right', alfa: ga, renk: 'tebesir' });
    // Soru
    const qa = ara(t, 8.4, 9.3, 'cik3');
    const qy = H ? ic.y + 40 : ic.y + 320;
    E.yazi(ctx, 'Kaç bilgi yeter?', L.cx, qy + (1 - qa) * 14, { boyut: H ? 54 : 50, agirlik: 760, alfa: qa, parilti: 0.3, parRenk: 'limon' });
    kilit(ctx, L.cx, qy + (H ? 88 : 90), 40, 0.15 * E.nabiz(t, 9.6, 0.6), { alfa: qa, renk: 'limon', parla: 0 });
  };

  /* ---------- 2. KKK: üç çubuk, tek üçgen ---------- */
  const kkk = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc = 58;
    const Ax = H ? ic.x + 150 : ic.x + 130, by = H ? ic.y + 263 : ic.y + 250;
    const g = harita(Ax, by, sc);
    const A = [0, 0], B = [6, 0];
    const [Cu, Cd] = cemberKes(A, 4, B, 5); // gerçek kesişimler
    const aAC = Math.atan2(Cu[1], Cu[0]), aBC = Math.atan2(Cu[1], Cu[0] - 6);
    // tepsi (çubukların başlangıç yeri)
    const tx = H ? 784 : ic.x + 40, ty = H ? ic.y + 168 : ic.y + 590, tAra = H ? 50 : 52;
    const tepsi = [[tx, ty], [tx, ty + tAra], [tx, ty + tAra * 2]];
    const kilitP = ara(t, 8.2, 8.7, 'geri');
    const ref = 1 - ara(t, 12.4, 13.0);

    // Başlık sütunu
    const sx = H ? 784 : L.cx, sh = H ? 'left' : 'center';
    const s0 = H ? ic.y + 40 : ic.y + 486;
    baslik(ctx, sx, s0, '\\c{turkuaz}{\\t{K}}\\c{mercan}{\\t{K}}\\c{menekse}{\\t{K}}', 'kenar · kenar · kenar', { hiza: sh, alfa: ara(t, 0.2, 0.9) * (H ? 1 : 1 - ara(t, 11.6, 12.0) + ara(t, 15.4, 15.9)), boyut: 50 });
    const m1 = ara(t, 8.8, 9.5) * (H ? 1 : 1 - ara(t, 11.8, 12.3) + ara(t, 15.4, 15.9));
    E.yazi(ctx, 'Üç çubuk → tek üçgen', sx, s0 + (H ? 120 : 112), { boyut: H ? 34 : 32, agirlik: 640, hiza: sh, alfa: m1, renk: 'limon', parilti: 0.2 });
    E.yazi(ctx, 'Alttaki kesişim: aynı üçgenin yansıması', sx, s0 + (H ? 176 : 168), { boyut: 26, agirlik: 500, renk: 'gumus', hiza: sh, alfa: ara(t, 9.8, 10.5) * (1 - ara(t, 11.4, 11.9)), maxGen: H ? 400 : 620 });
    const cong = ara(t, 15.6, 16.3, 'cik3');
    E.formul(ctx, '\\triangle ABC \\cong \\triangle DEF', sx, s0 + (H ? 186 : 176), { boyut: 38, hiza: sh, alfa: cong, renk: 'tebesir' });
    E.yazi(ctx, 'öteleme · dönme · yansıma', sx, s0 + (H ? 240 : 228), { boyut: 26, agirlik: 520, hiza: sh, renk: 'gumus', alfa: ara(t, 16.2, 16.9) });

    // Pergel yayları (çubukların süpürdüğü)
    const aAC_t = kf(t, [[1.6, 0], [2.8, 95 * D], [3.1, 95 * D], [5.0, 20 * D], [7.0, 20 * D], [8.3, aAC]]);
    const aBC_t = kf(t, [[2.0, 0], [3.3, 100 * D], [3.9, 100 * D], [6.0, 175 * D], [7.0, 175 * D], [8.3, aBC]]);
    const yayA = clamp((95 * D - aAC_t) / (75 * D)) * (t > 3.1 ? 1 : 0);
    const yayB = clamp((aBC_t - 100 * D) / (75 * D)) * (t > 3.9 ? 1 : 0);
    const yayAlfa = 1 - 0.6 * ara(t, 9.0, 10.0);
    if (yayA > 0) yay(ctx, g(A), 4 * sc, 95 * D, lerp(95, 20, Math.max(yayA, t > 5 ? 1 : 0)) * D, { renk: 'menekse', kesik: [7, 7], alfa: 0.85 * yayAlfa, parilti: 0.5 });
    if (yayB > 0) yay(ctx, g(B), 5 * sc, 100 * D, lerp(100, 175, Math.max(yayB, t > 6 ? 1 : 0)) * D, { renk: 'mercan', kesik: [7, 7], alfa: 0.85 * yayAlfa, parilti: 0.5 });
    // yansıyan yaylar (alt)
    const ay = ara(t, 6.0, 6.8);
    if (ay > 0) {
      yay(ctx, g(A), 4 * sc, -95 * D, lerp(-95, -20, ay) * D, { renk: 'gumus', kesik: [5, 8], alfa: 0.6 * yayAlfa * ref });
      yay(ctx, g(B), 5 * sc, -100 * D, lerp(-100, -175, ay) * D, { renk: 'gumus', kesik: [5, 8], alfa: 0.6 * yayAlfa * ref });
    }
    // Kesişim noktaları
    const kn1 = ara(t, 6.4, 6.8), kn2 = ara(t, 6.8, 7.2);
    E.nokta(ctx, g(Cu)[0], g(Cu)[1], 7, { renk: 'limon', parilti: 1.3 + E.nabiz(t, 6.4, 0.8), alfa: kn1 * (1 - ara(t, 8.0, 8.4)) });
    E.isik(ctx, g(Cu)[0], g(Cu)[1], 120, 'limon', 0.4 * E.nabiz(t, 6.4, 0.9));
    E.nokta(ctx, g(Cd)[0], g(Cd)[1], 6, { renk: 'gumus', parilti: 0.8, alfa: kn2 * ref * (1 - ara(t, 10.4, 10.8)) });

    // Yansıyan üçgen alttan katlanarak çıkar
    const yansA = ara(t, 9.8, 10.4) * (1 - ara(t, 11.6, 12.2));
    if (yansA > 0) {
      const f = ara(t, 10.4, 11.6, 'io3');
      const Cf = [Cu[0], Cu[1] * -Math.cos(Math.PI * f)];
      ucgen(ctx, [g(A), g(B), g(Cf)], { renk: 'gok', kesik: [9, 7], kalinlik: 2.5, dolgu: 0.08, alfa: yansA, parilti: 0.6 });
      E.formul(ctx, "C'", g(Cf)[0] + 32, g(Cf)[1] + (f < 0.5 ? 0 : -18), { boyut: 28, renk: 'gok', alfa: yansA * (1 - ara(t, 10.6, 11.0)) });
    }
    // Tek üçgen (kilitlendikten sonra)
    const ucA = ara(t, 8.3, 8.9);
    ucgen(ctx, [g(A), g(B), g(Cu)], { renk: 'tebesir', dolgu: 0.13, dolguRenk: 'turkuaz', kalinlik: 0.01, parilti: 0, alfa: ucA });
    E.isik(ctx, g(Cu)[0], g(Cu)[1], 260, 'turkuaz', 0.35 * E.nabiz(t, 8.3, 1.2));
    E.isik(ctx, g([3, 1.2])[0], g([3, 1.2])[1], 300, 'turkuaz', 0.25 * E.nabiz(t, 11.6, 1.0));

    // Çubuklar
    const fAB = ara(t, 1.0, 2.2), fAC = ara(t, 1.6, 2.8), fBC = ara(t, 2.0, 3.3);
    const cA = ara(t, 0.3, 0.9);
    cubuk(ctx, [lerp(tepsi[0][0], g(A)[0], fAB), lerp(tepsi[0][1], g(A)[1], fAB)], 0, 6 * sc, 'turkuaz', { alfa: cA });
    cubuk(ctx, [lerp(tepsi[2][0], g(A)[0], fAC), lerp(tepsi[2][1], g(A)[1], fAC)], aAC_t, 4 * sc, 'menekse', { alfa: ara(t, 0.5, 1.1) });
    cubuk(ctx, [lerp(tepsi[1][0], g(B)[0], fBC), lerp(tepsi[1][1], g(B)[1], fBC)], aBC_t, 5 * sc, 'mercan', { alfa: ara(t, 0.4, 1.0) });
    // uzunluk etiketleri
    const et = (P, Q, m, renk, al) => { const [x, y] = kenarYer(P, Q, g([3, 1.1]), 26); E.formul(ctx, m, x, y, { boyut: 30, renk, alfa: al }); };
    et(g(A), g(B), '6', 'turkuaz', fAB);
    if (t < 1.6) { E.formul(ctx, '5', tepsi[1][0] + 5 * sc + 26, tepsi[1][1], { boyut: 28, renk: 'mercan', hiza: 'left', alfa: cA }); }
    if (t < 1.6) { E.formul(ctx, '4', tepsi[2][0] + 4 * sc + 26, tepsi[2][1], { boyut: 28, renk: 'menekse', hiza: 'left', alfa: cA }); }
    if (t >= 1.6 && t < 1.6) { /* yok */ }
    et(g(A), g(Cu), '4', 'menekse', ara(t, 8.4, 9.0));
    et(g(B), g(Cu), '5', 'mercan', ara(t, 8.4, 9.0));
    etiketler(ctx, [g(A), g(B), g(Cu)], ['A', 'B', 'C'], { alfa: ara(t, 8.6, 9.2), d: 30 });
    if (t < 8.6) {
      E.formul(ctx, 'A', g(A)[0] - 26, g(A)[1] + 22, { boyut: 28, renk: 'gumus', alfa: fAB });
      E.formul(ctx, 'B', g(B)[0] + 26, g(B)[1] + 22, { boyut: 28, renk: 'gumus', alfa: fAB });
    }
    // Kilit
    const kx = g(Cu)[0] + (H ? 96 : 92), ky = g(Cu)[1] + 10;
    kilit(ctx, kx, ky, 36, kilitP, { alfa: ara(t, 7.4, 7.9), parla: 1 + E.nabiz(t, 8.6, 1) });

    // DEF kopyası: yansımış, dönmüş, uzakta → üst üste gelir
    const dA = ara(t, 12.0, 12.7);
    if (dA > 0) {
      const Q = [A, B, Cu], G0 = agirlik(Q);
      const f = ara(t, 13.0, 15.4, 'io3'), fy = ara(t, 13.5, 14.9, 'io3');
      const bas = H ? [(1000 - Ax) / sc, (by - (ic.y + 380)) / sc] : [(400 - Ax) / sc, (by - (ic.y + 600)) / sc];
      const Gc = [lerp(bas[0], G0[0], f), lerp(bas[1], G0[1], f)];
      const r = lerp(150, 0, f) * D, syy = lerp(-1, 1, fy);
      const P = Q.map((q) => { const x = q[0] - G0[0], y = (q[1] - G0[1]) * syy; return g([Gc[0] + x * Math.cos(r) - y * Math.sin(r), Gc[1] + x * Math.sin(r) + y * Math.cos(r)]); });
      const birles = ara(t, 15.2, 15.6);
      ucgen(ctx, P, { renk: 'limon', dolgu: 0.1, kalinlik: 3, parilti: 0.9, alfa: dA * (1 - 0.7 * birles) });
      etiketler(ctx, P, ['D', 'E', 'F'], { alfa: dA * (1 - ara(t, 14.4, 14.9)), renk: 'limon', d: 26 });
      E.isik(ctx, g(G0)[0], g(G0)[1], 320, 'limon', 0.4 * E.nabiz(t, 15.3, 1.1));
    }
    // Son: kenarlar ışıldar
    if (t > 8.3) ucgen(ctx, [g(A), g(B), g(Cu)], { renk: 'tebesir', kalinlik: 2, parilti: 0.5 + 0.8 * E.nabiz(t, 15.3, 1.2), alfa: 0.6 });
  };

  /* ---------- 3. KAK ve AKA ---------- */
  const kakPanel = (ctx, t, K) => {
    const g = harita(K.Ax, K.by, K.sc);
    const A = [0, 0], B = [6, 0];
    baslik(ctx, K.x, K.y, '\\c{turkuaz}{\\t{K}}\\c{limon}{\\t{A}}\\c{menekse}{\\t{K}}', 'iki kenar + aradaki açı', { alfa: ara(t, 0.1, 0.7), boyut: 44, ara: 42, aBoyut: 24 });
    const tA = ara(t, 0.2, 1.0);
    E.cizgi(ctx, [g(A), g(B)], { renk: 'turkuaz', kalinlik: 5, parilti: 1, p: tA });
    const kil = ara(t, 3.4, 4.3, 'io3');
    const th = (t2) => (K.oMerkez + K.oGenlik * Math.sin((t2 - 0.6) * 1.7)) * D;
    const ac = lerp(th(t), 50 * D, kil);
    // menteşe izi
    if (kil < 1) for (let k = 1; k <= 8; k++) {
      const a2 = th(t - k * 0.06);
      E.cizgi(ctx, [g(A), g(kutup(4, a2))], { renk: 'menekse', kalinlik: 3, alfa: ara(t, 0.6, 1.0) * (1 - kil) * 0.32 * (1 - k / 9) });
    }
    const C = kutup(4, ac);
    const al = ara(t, 0.5, 1.0);
    // BC
    const bc = ara(t, 4.4, 5.4);
    if (kil < 1 && al > 0) E.cizgi(ctx, [g(B), g(C)], { renk: 'gumus', kalinlik: 1.5, kesik: [5, 7], alfa: al * 0.5 * (1 - kil) });
    E.cizgi(ctx, [g(B), g(C)], { renk: 'mercan', kalinlik: 4, parilti: 0.8, p: bc });
    ucgen(ctx, [g(A), g(B), g(C)], { renk: 'tebesir', kalinlik: 0.01, parilti: 0, dolgu: 0.13, dolguRenk: 'turkuaz', alfa: ara(t, 5.2, 5.8) });
    E.cizgi(ctx, [g(A), g(C)], { renk: 'menekse', kalinlik: 5, parilti: 1, alfa: al });
    E.nokta(ctx, g(C)[0], g(C)[1], 6, { renk: 'tebesir', alfa: al });
    aci(ctx, g(A), g(B), g(C), 42, { renk: 'limon', alfa: al, dolgu: 0.2 + 0.3 * kil });
    const [ax, ay] = aciYer(g(A), g(B), g(C), 76);
    E.formul(ctx, derece(ac) + '°', ax + 10, ay, { boyut: 28, renk: 'limon', alfa: al });
    const G = g([2.8, 1.0]);
    const et = (P, Q, m, renk, a) => { const [x, y] = kenarYer(P, Q, G, 24); E.formul(ctx, m, x, y, { boyut: 28, renk, alfa: a }); };
    et(g(A), g(B), '6', 'turkuaz', tA);
    et(g(A), g(C), '4', 'menekse', al);
    et(g(B), g(C), '≈ 4{,}6', 'mercan', ara(t, 5.4, 6.0));
    kilit(ctx, K.kx, K.ky, 32, ara(t, 5.6, 6.0, 'geri'), { alfa: ara(t, 0.6, 1.1), parla: 1 + E.nabiz(t, 5.9, 0.9) });
    E.formul(ctx, '\\cong', K.kx - 46, K.ky, { boyut: 38, renk: 'limon', hiza: 'right', alfa: ara(t, 5.9, 6.4) });
    E.isik(ctx, g(C)[0], g(C)[1], 200, 'turkuaz', 0.3 * E.nabiz(t, 5.6, 1.0));
  };
  const akaPanel = (ctx, t, K) => {
    const g = harita(K.Ax, K.by, K.sc);
    const A = [0, 0], B = [6, 0], a = 40, b = 65;
    const C = aaTepe(6, a, b);
    const lA = uzak(A, C), lB = uzak(B, C);
    baslik(ctx, K.x, K.y, '\\c{turkuaz}{\\t{A}}\\c{tebesir}{\\t{K}}\\c{mercan}{\\t{A}}', 'bir kenar + iki uç açısı', { alfa: ara(t, 0.1, 0.7), boyut: 44, ara: 42, aBoyut: 24 });
    const tA = ara(t, 0.2, 1.0);
    E.cizgi(ctx, [g(A), g(B)], { renk: 'tebesir', kalinlik: 5, parilti: 0.8, p: tA });
    const aA = ara(t, 1.0, 1.6), aB = ara(t, 1.4, 2.0);
    // ışınlar
    const p = ara(t, 2.2, 3.6, 'io2');
    const uA = kutup(1, a * D), uB = kutup(1, Math.PI - b * D);
    E.cizgi(ctx, [g(A), g(topla(A, [uA[0] * lA * p, uA[1] * lA * p]))], { renk: 'turkuaz', kalinlik: 4, parilti: 1.1, alfa: aA });
    E.cizgi(ctx, [g(B), g(topla(B, [uB[0] * lB * p, uB[1] * lB * p]))], { renk: 'mercan', kalinlik: 4, parilti: 1.1, alfa: aB });
    const uz = ara(t, 3.6, 4.4);
    if (uz > 0) {
      E.cizgi(ctx, [g(C), g(topla(C, [uA[0] * 1.2 * uz, uA[1] * 1.2 * uz]))], { renk: 'turkuaz', kalinlik: 2, kesik: [5, 6], alfa: 0.55 * (1 - ara(t, 6, 7)) });
      E.cizgi(ctx, [g(C), g(topla(C, [uB[0] * 1.2 * uz, uB[1] * 1.2 * uz]))], { renk: 'mercan', kalinlik: 2, kesik: [5, 6], alfa: 0.55 * (1 - ara(t, 6, 7)) });
    }
    ucgen(ctx, [g(A), g(B), g(C)], { renk: 'tebesir', kalinlik: 0.01, parilti: 0, dolgu: 0.13, dolguRenk: 'mercan', alfa: ara(t, 3.8, 4.4) });
    E.nokta(ctx, g(C)[0], g(C)[1], 7, { renk: 'limon', parilti: 1 + 1.5 * E.nabiz(t, 3.6, 0.8), alfa: ara(t, 3.5, 3.7) });
    E.isik(ctx, g(C)[0], g(C)[1], 180, 'limon', 0.6 * E.nabiz(t, 3.6, 0.9));
    aci(ctx, g(A), g(B), g(C), 44, { renk: 'turkuaz', alfa: aA });
    aci(ctx, g(B), g(A), g(C), 40, { renk: 'mercan', alfa: aB });
    const [x1, y1] = aciYer(g(A), g(B), g(C), 78);
    E.formul(ctx, a + '°', x1 + 10, y1 + 2, { boyut: 28, renk: 'turkuaz', alfa: aA });
    const [x2, y2] = aciYer(g(B), g(A), g(C), 72);
    E.formul(ctx, b + '°', x2 - 6, y2, { boyut: 28, renk: 'mercan', alfa: aB });
    const [ex, ey] = kenarYer(g(A), g(B), g(C), 24);
    E.formul(ctx, '6', ex, ey, { boyut: 28, alfa: tA });
    aci(ctx, g(C), g(A), g(B), 30, { renk: 'menekse', alfa: ara(t, 4.6, 5.2) });
    E.formul(ctx, '\\angle C = ' + (180 - a - b) + '°', g(C)[0] + 34, g(C)[1] - 6, { boyut: 28, hiza: 'left', renk: 'menekse', alfa: ara(t, 4.8, 5.4) });
    kilit(ctx, K.kx, K.ky, 32, ara(t, 4.2, 4.6, 'geri'), { alfa: ara(t, 0.6, 1.1), parla: 1 + E.nabiz(t, 4.5, 0.9) });
    E.formul(ctx, '\\cong', K.kx - 46, K.ky, { boyut: 38, renk: 'limon', hiza: 'right', alfa: ara(t, 4.5, 5.0) });
  };
  const kakAka = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    let K1, K2;
    if (H) {
      const sc = 58, w = 560;
      K1 = { x: ic.x + 16, y: ic.y + 30, sc, Ax: ic.x + w / 2 - 3 * sc, by: ic.y + 400, kx: ic.x + w - 30, ky: ic.y + 40, oMerkez: 85, oGenlik: 58 };
      K2 = { x: ic.x + w + 48, y: ic.y + 30, sc, Ax: ic.x + w + 32 + w / 2 - 3 * sc - 40, by: ic.y + 400, kx: ic.x1 - 20, ky: ic.y + 40 };
    } else {
      const sc = 54;
      K1 = { x: ic.x + 10, y: ic.y + 20, sc, Ax: L.cx - 3 * sc, by: ic.y + 318, kx: ic.x1 - 26, ky: ic.y + 30, oMerkez: 80, oGenlik: 50 };
      K2 = { x: ic.x + 10, y: ic.y + 420, sc, Ax: L.cx - 3 * sc - 30, by: ic.y + 752, kx: ic.x1 - 26, ky: ic.y + 430 };
    }
    // ayırıcı
    const ay = ara(t, 6.6, 7.4);
    if (H) E.cizgi(ctx, [[ic.x + 584, ic.y + 20], [ic.x + 584, ic.y + 20 + (ic.h - 40) * ay]], { renk: 'sis', kalinlik: 1.5 });
    else E.cizgi(ctx, [[ic.x + 20, ic.y + 392], [ic.x + 20 + (ic.w - 40) * ay, ic.y + 392]], { renk: 'sis', kalinlik: 1.5 });
    // Odak ışığı: aktif panel
    const odak = ara(t, 6.8, 7.6);
    const pc1 = H ? [ic.x + 290, ic.cy + 40] : [L.cx, ic.y + 220], pc2 = H ? [ic.x + 870, ic.cy + 40] : [L.cx, ic.y + 620];
    E.isik(ctx, lerp(pc1[0], pc2[0], odak), lerp(pc1[1], pc2[1], odak), 360, 'gok', 0.08);
    kakPanel(ctx, t, K1);
    if (t > 7.0) akaPanel(ctx, t - 7.0, K2);
    // Sonda iki üçgen aynı anda ışıldar
    const n = E.nabiz(t, 14.6, 1.6);
    if (n > 0) E.isikSupur(ctx, ara(t, 14.4, 16.4, 'lin'), { renk: 'limon', guc: 0.18 });
  };

  /* ---------- 4. Tuzak: KKA ve AAA ---------- */
  const tuzak = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const k1 = 1 - ara(t, 10.6, 11.3);
    if (k1 > 0) {
      ctx.save(); ctx.globalAlpha *= k1;
      const sc = H ? 70 : 64;
      const Ax = H ? L.cx - 4.6 * sc : ic.x + 18, by = H ? ic.y + 340 : ic.y + 400;
      const g = harita(Ax, by, sc);
      const A = [0, 0], aA = 30 * D;
      const C = kutup(6, aA);
      const [B1, B2] = cemberDogru(C, 4, A, [1, 0]); // pergel yayının doğruyu kestiği iki nokta
      const hx = H ? ic.x + 10 : ic.x + 10, hy = H ? ic.y + 28 : ic.y + 24;
      baslik(ctx, hx, hy, '\\c{menekse}{\\t{K}}\\c{mercan}{\\t{K}}\\c{limon}{\\t{A}}', 'açı, iki kenarın arasında değil', { alfa: ara(t, 0.2, 0.8), boyut: 46 });
      // ışın
      E.cizgi(ctx, [g(A), g([9.0, 0])], { renk: 'gumus', kalinlik: 2.5, p: ara(t, 0.4, 1.4), ok: true, okBoy: 14 });
      // AC
      const pAC = ara(t, 0.8, 1.8);
      E.cizgi(ctx, [g(A), g(C)], { renk: 'menekse', kalinlik: 5, parilti: 1, p: pAC });
      const [ex, ey] = kenarYer(g(A), g(C), g([4, -1]), 24);
      E.formul(ctx, '6', ex, ey, { boyut: 30, renk: 'menekse', alfa: pAC });
      aci(ctx, g(A), g([1, 0]), g(C), 60, { renk: 'limon', alfa: ara(t, 1.4, 2.0) });
      E.formul(ctx, '30°', g(A)[0] + 92, g(A)[1] - 22, { boyut: 28, renk: 'limon', alfa: ara(t, 1.5, 2.1) });
      E.formul(ctx, 'A', g(A)[0] - 4, g(A)[1] + 30, { boyut: 28, renk: 'gumus', alfa: ara(t, 0.4, 1.0) });
      E.formul(ctx, 'C', g(C)[0], g(C)[1] - 30, { boyut: 28, renk: 'gumus', alfa: pAC });
      E.nokta(ctx, g(C)[0], g(C)[1], 6, { renk: 'tebesir', alfa: pAC });
      // pergel
      const sw = ara(t, 3.0, 6.0, 'lin');
      const pa = ara(t, 2.2, 2.8) * (1 - ara(t, 6.2, 6.8));
      const ac = lerp(-20, -160, sw) * D;
      const uc = topla(C, kutup(4, ac));
      if (sw > 0) yay(ctx, g(C), 4 * sc, -20 * D, ac, { renk: 'mercan', kalinlik: 2.5, parilti: 0.6, alfa: 0.9 * (1 - 0.5 * ara(t, 7.5, 8.5)) });
      if (pa > 0) {
        // pergel kolları: iğne C'de, kalem yay üzerinde
        // menteşe: iğne ile kalem arasındaki orta noktanın 1,1 birim yukarısı (dik yönde)
        const orta = [(C[0] + uc[0]) / 2, (C[1] + uc[1]) / 2];
        let dik = [-(uc[1] - C[1]) / 4, (uc[0] - C[0]) / 4];
        if (dik[1] < 0) dik = [-dik[0], -dik[1]];
        const tepe = topla(orta, [dik[0] * 1.1, dik[1] * 1.1]);
        E.cizgi(ctx, [g(C), g(tepe), g(uc)], { renk: 'gumus', kalinlik: 3, alfa: pa * 0.9, parilti: 0.2 });
        E.nokta(ctx, g(tepe)[0], g(tepe)[1], 6, { renk: 'gumus', alfa: pa, parilti: 0 });
        E.nokta(ctx, g(uc)[0], g(uc)[1], 5, { renk: 'mercan', alfa: pa, parilti: 1.2 });
        E.formul(ctx, '4', g(topla(C, kutup(2, ac)))[0] + 22, g(topla(C, kutup(2, ac)))[1], { boyut: 28, renk: 'mercan', alfa: pa });
      }
      // kesişimler (gerçek hesap: yay açısı = kesişim noktasının açısı)
      const t2 = 3.0 + 3.0 * ((-Math.atan2(B2[1] - C[1], B2[0] - C[0]) / D - 20) / 140);
      const t1 = 3.0 + 3.0 * ((-Math.atan2(B1[1] - C[1], B1[0] - C[0]) / D - 20) / 140);
      for (const [Bp, tt, renk, ad] of [[B2, t2, 'mercan', 'B_{2}'], [B1, t1, 'turkuaz', 'B_{1}']]) {
        const a = ara(t, tt, tt + 0.25);
        E.nokta(ctx, g(Bp)[0], g(Bp)[1], 7, { renk, parilti: 1 + 2 * E.nabiz(t, tt, 0.7), alfa: a });
        E.isik(ctx, g(Bp)[0], g(Bp)[1], 140, renk, 0.6 * E.nabiz(t, tt, 0.8));
        E.formul(ctx, ad, g(Bp)[0], g(Bp)[1] + 32, { boyut: 28, renk, alfa: a });
      }
      // iki üçgen
      const iA = ara(t, 6.4, 7.2);
      ucgen(ctx, [g(A), g(B2), g(C)], { renk: 'mercan', dolgu: 0.12, kalinlik: 3, parilti: 0.8, alfa: iA });
      ucgen(ctx, [g(A), g(B1), g(C)], { renk: 'turkuaz', dolgu: 0.16, kalinlik: 3, parilti: 0.8, alfa: iA });
      kilit(ctx, g(B1)[0], g(B1)[1] + 84, 28, ara(t, 7.0, 7.4, 'geri'), { renk: 'turkuaz', alfa: iA });
      kilit(ctx, g(B2)[0], g(B2)[1] + 84, 28, ara(t, 7.0, 7.4, 'geri'), { renk: 'mercan', alfa: iA });
      // alt metin
      const my = H ? ic.y1 - 64 : ic.y + 560;
      E.formul(ctx, '|AB_{1}| ≈ ' + sayi(B1[0]) + ' \\quad |AB_{2}| ≈ ' + sayi(B2[0]), L.cx, my, { boyut: H ? 32 : 30, alfa: ara(t, 7.4, 8.0) });
      E.yazi(ctx, 'Aynı üç bilgi → iki farklı üçgen', L.cx, my + (H ? 50 : 70), { boyut: H ? 32 : 32, agirlik: 680, renk: 'mercan', alfa: ara(t, 8.0, 8.7), maxGen: ic.w - 20 });
      if (!H) E.formul(ctx, '\\t{KKA} \\Rightarrow \\t{eşlik garantisi yok}', L.cx, my + 150, { boyut: 30, renk: 'gumus', alfa: ara(t, 8.8, 9.4) });
      ctx.restore();
    }
    // AAA
    const k2 = ara(t, 11.2, 11.9);
    if (k2 > 0) {
      ctx.save(); ctx.globalAlpha *= k2;
      const hx = ic.x + 10, hy = H ? ic.y + 28 : ic.y + 24;
      baslik(ctx, hx, hy, '\\c{turkuaz}{\\t{A}}\\c{mercan}{\\t{A}}\\c{menekse}{\\t{A}}', 'üç açı da eşit: 40°, 60°, 80°', { boyut: 46 });
      const tabanlar = H ? [2.2, 3.4, 5.0] : [1.9, 2.8, 4.0];
      const sc = H ? 64 : 60;
      const gap = H ? 60 : 26;
      const top = tabanlar.reduce((s2, l) => s2 + l * sc, 0) + gap * 2;
      let x = L.cx - top / 2;
      const by = H ? ic.y + 340 : ic.y + 420;
      tabanlar.forEach((Lb, i) => {
        const a = ara(t, 11.4 + i * 0.45, 12.0 + i * 0.45, 'cik3');
        const g = harita(x, by + (1 - a) * 30, sc);
        const C = aaTepe(Lb, 40, 60);
        const P = [g([0, 0]), g([Lb, 0]), g(C)];
        ucgen(ctx, P, { renk: 'tebesir', dolgu: 0.1, dolguRenk: ['turkuaz', 'gok', 'menekse'][i], kalinlik: 2.5, alfa: a });
        aci(ctx, P[0], P[1], P[2], 24 + i * 6, { renk: 'turkuaz', alfa: a });
        aci(ctx, P[1], P[0], P[2], 22 + i * 6, { renk: 'mercan', alfa: a });
        aci(ctx, P[2], P[0], P[1], 20 + i * 5, { renk: 'menekse', alfa: a });
        x += Lb * sc + gap;
      });
      const my = H ? ic.y1 - 108 : ic.y + 540;
      E.yazi(ctx, 'Açılar aynı, boyutlar farklı → eş değil', L.cx, my, { boyut: H ? 32 : 30, agirlik: 640, alfa: ara(t, 13.2, 13.9), maxGen: ic.w - 20 });
      E.yazi(ctx, 'Kilitlenen şey: şekil', L.cx, my + (H ? 56 : 100), { boyut: H ? 40 : 40, agirlik: 760, renk: 'limon', alfa: ara(t, 14.6, 15.3, 'cik3'), parilti: 0.35, parRenk: 'limon' });
      ctx.restore();
    }
  };

  /* ---------- 5. Benzerlik: şekli kilitlemek ---------- */
  const benzerlik = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sx = H ? 760 : L.cx, sh = H ? 'left' : 'center';
    const s0 = H ? ic.y + 40 : ic.y + 470;
    // --- Bölüm 1: AA ailesi (merkezil büyütme) ---
    const b1 = 1 - ara(t, 6.2, 6.8);
    if (b1 > 0) {
      ctx.save(); ctx.globalAlpha *= b1;
      const sc = H ? 60 : 52;
      const g = harita(H ? ic.x + 40 : ic.x + 36, H ? ic.y + 440 : ic.y + 384, sc);
      const ra = ara(t, 0.2, 1.2);
      E.cizgi(ctx, [g([0, 0]), g([7.6, 0])], { renk: 'cizgi', kalinlik: 2, p: ra });
      E.cizgi(ctx, [g([0, 0]), g(kutup(6.6, 40 * D))], { renk: 'cizgi', kalinlik: 2, p: ra });
      for (let i = 0; i < 6; i++) {
        const Lb = 2 + i;
        const a = ara(t, 1.0 + i * 0.32, 1.5 + i * 0.32, 'cik3');
        const C = aaTepe(Lb, 40, 60);
        const renk = E.karistir('turkuaz', 'menekse', i / 5);
        ucgen(ctx, [g([0, 0]), g([Lb, 0]), g(C)], { renk, kalinlik: 1.8, parilti: 0.6, dolgu: 0.035, alfa: a * 0.75 });
        aci(ctx, g([Lb, 0]), g([0, 0]), g(C), 20, { renk: 'mercan', alfa: a * 0.6, dolgu: 0.1, kalinlik: 2 });
      }
      // canlı üçgen
      const ca = ara(t, 3.0, 3.6);
      const Lc = 5.0 + 1.2 * Math.sin((t - 3.0) * 1.15);
      const C = aaTepe(Lc, 40, 60);
      const P = [g([0, 0]), g([Lc, 0]), g(C)];
      ucgen(ctx, P, { renk: 'tebesir', dolgu: 0.12, dolguRenk: 'turkuaz', kalinlik: 3.5, parilti: 1, alfa: ca });
      aci(ctx, P[0], P[1], P[2], 54, { renk: 'turkuaz', alfa: ara(t, 0.8, 1.4) });
      aci(ctx, P[1], P[0], P[2], 34, { renk: 'mercan', alfa: ca });
      aci(ctx, P[2], P[0], P[1], 30, { renk: 'menekse', alfa: ca });
      const y40 = aciYer(P[0], P[1], P[2], 84), y60 = aciYer(P[1], P[0], P[2], 62);
      E.formul(ctx, '40°', y40[0], y40[1], { boyut: 26, renk: 'turkuaz', alfa: ara(t, 0.8, 1.4) });
      E.formul(ctx, '60°', y60[0], y60[1], { boyut: 26, renk: 'mercan', alfa: ca });
      E.formul(ctx, '80°', P[2][0], P[2][1] - 34, { boyut: 26, renk: 'menekse', alfa: ca });
      baslik(ctx, sx, s0, '\\c{turkuaz}{\\t{A}}\\c{mercan}{\\t{A}}', 'iki açı → şekil kilitlenir', { hiza: sh, alfa: ara(t, 0.2, 0.9), boyut: 50 });
      E.formul(ctx, '180° − 40° − 60° = \\c{menekse}{80°}', sx, s0 + (H ? 120 : 108), { boyut: H ? 34 : 32, hiza: sh, alfa: ara(t, 1.8, 2.5) });
      E.formul(ctx, 'k = \\frac{|AB|}{3} = ' + sayi(Lc / 3), sx, s0 + (H ? 210 : 190), { boyut: H ? 36 : 34, hiza: sh, renk: 'limon', alfa: ca });
      E.yazi(ctx, 'boyut serbest', sx, s0 + (H ? 290 : 262), { boyut: 28, agirlik: 560, hiza: sh, renk: 'gumus', alfa: ara(t, 3.6, 4.3) });
      ctx.restore();
    }
    // --- Bölüm 2: KKK benzerliği (3-4-5 ve 6-8-10) ---
    const b2 = ara(t, 6.4, 6.9) * (1 - ara(t, 13.1, 13.7));
    if (b2 > 0) {
      ctx.save(); ctx.globalAlpha *= b2;
      const sc = H ? 40 : 34;
      const by = H ? ic.y + 400 : ic.y + 360;
      const kx = H ? ic.x + 40 : ic.x + 30, bx = H ? ic.x + 300 : ic.x + 290;
      const kucuk = [[0, 0], [4, 0], [0, 3]], buyuk = kucuk.map(([x, y]) => [x * 2, y * 2]);
      const gk = harita(kx, by, sc), gb = harita(bx, by, sc);
      const yanlar = (g, P, ad, al) => {
        const G = g(agirlik(P));
        const et = (i, j, m, renk) => { const [x, y] = kenarYer(g(P[i]), g(P[j]), G, 24); E.formul(ctx, m, x, y, { boyut: 28, renk, alfa: al }); };
        et(0, 1, ad[0], 'turkuaz'); et(0, 2, ad[1], 'menekse'); et(1, 2, ad[2], 'mercan');
      };
      const ka = ara(t, 6.5, 7.1), ba = ara(t, 6.9, 7.5);
      ucgen(ctx, kucuk.map(gk), { renk: 'tebesir', dolgu: 0.14, dolguRenk: 'turkuaz', kalinlik: 3, alfa: ka });
      E.dikAci(ctx, gk([0, 0])[0], gk([0, 0])[1], -Math.PI / 2, 14, { alfa: ka });
      yanlar(gk, kucuk, ['4', '3', '5'], ka);
      ucgen(ctx, buyuk.map(gb), { renk: 'tebesir', dolgu: 0.08, dolguRenk: 'menekse', kalinlik: 3, alfa: ba });
      E.dikAci(ctx, gb([0, 0])[0], gb([0, 0])[1], -Math.PI / 2, 18, { alfa: ba });
      yanlar(gb, buyuk, ['8', '6', '10'], ba);
      // uçan kopya: k = 1 → 2
      const f = ara(t, 8.8, 10.6, 'io3');
      if (f > 0 && f < 1) {
        const k = lerp(1, 2, f);
        const ox = lerp(kx, bx, f);
        const gu = harita(ox, by, sc * k);
        ucgen(ctx, kucuk.map(gu), { renk: 'limon', kalinlik: 2.5, parilti: 1, alfa: 0.9, dolgu: 0.06 });
      }
      E.isik(ctx, gb([2.6, 2])[0], gb([2.6, 2])[1], 260, 'limon', 0.45 * E.nabiz(t, 10.5, 1.0));
      if (t > 10.6) ucgen(ctx, buyuk.map(gb), { renk: 'limon', kalinlik: 2.5, parilti: 0.8, alfa: 0.9 });
      baslik(ctx, sx, s0, '\\t{KKK}\\c{limon}{\\,∼}', 'kenarlar orantılı', { hiza: sh, alfa: ara(t, 6.8, 7.4), boyut: 50 });
      E.formul(ctx, '\\frac{\\c{turkuaz}{8}}{\\c{turkuaz}{4}} = \\frac{\\c{menekse}{6}}{\\c{menekse}{3}} = \\frac{\\c{mercan}{10}}{\\c{mercan}{5}} = \\c{limon}{2}', sx, s0 + (H ? 150 : 132), { boyut: H ? 40 : 38, hiza: sh, alfa: ara(t, 9.2, 9.9), aciga: ara(t, 9.2, 10.8, 'lin') });
      E.formul(ctx, '\\kutu{limon}{k = 2}', sx, s0 + (H ? 260 : 232), { boyut: 40, hiza: sh, alfa: ara(t, 10.8, 11.4), parilti: 0.3, parRenk: 'limon' });
      ctx.restore();
    }
    // --- Bölüm 3: KAK benzerliği ve k = 1 ---
    const b3 = ara(t, 13.6, 14.2);
    if (b3 > 0) {
      ctx.save(); ctx.globalAlpha *= b3;
      const sc = H ? 60 : 46;
      const by = H ? ic.y + 400 : ic.y + 340;
      const kx = H ? ic.x + 40 : ic.x + 30, bx0 = H ? ic.x + 290 : ic.x + 250;
      const tri = [[0, 0], [3, 0], kutup(2, 50 * D)];
      const ka = ara(t, 13.8, 14.4), ba = ara(t, 14.2, 14.8);
      const kk = kf(t, [[16.4, 2], [18.2, 1, 'io3']]);
      const bx = lerp(bx0, kx, ara(t, 16.4, 18.2, 'io3'));
      const gk = harita(kx, by, sc), gb = harita(bx, by, sc * kk);
      const ciz = (g, renk, al, ad, etA = 1) => {
        const P = tri.map(g);
        ucgen(ctx, P, { renk: 'tebesir', dolgu: 0.12, dolguRenk: renk, kalinlik: 3, alfa: al });
        aci(ctx, P[0], P[1], P[2], 34, { renk: 'limon', alfa: al });
        const G = agirlik(P);
        const [x1, y1] = kenarYer(P[0], P[1], G, 24), [x2, y2] = kenarYer(P[0], P[2], G, 24);
        E.formul(ctx, ad[0], x1, y1, { boyut: 28, renk: 'turkuaz', alfa: al * etA });
        E.formul(ctx, ad[1], x2, y2, { boyut: 28, renk: 'menekse', alfa: al * etA });
        return P;
      };
      ciz(gk, 'turkuaz', ka * (1 - 0.7 * ara(t, 17.6, 18.2)), ['3', '2'], 1 - ara(t, 16.2, 16.6));
      const kStr = sayi(kk * 3, 1), kStr2 = sayi(kk * 2, 1);
      const Pb = ciz(gb, 'menekse', ba, [kStr, kStr2]);
      E.formul(ctx, '50°', gk([0, 0])[0] + 62, gk([0, 0])[1] - 22, { boyut: 24, renk: 'limon', alfa: ka * (1 - ara(t, 16.4, 16.8)) });
      E.isik(ctx, agirlik(Pb)[0], agirlik(Pb)[1], 220, 'limon', 0.5 * E.nabiz(t, 18.2, 1.0));
      baslik(ctx, sx, s0, '\\t{KAK}\\c{limon}{\\,∼}', 'iki kenar orantılı, aradaki açı eşit', { hiza: sh, alfa: ara(t, 13.8, 14.5), boyut: 50, maxGen: H ? 440 : 620 });
      E.formul(ctx, '\\frac{6}{3} = \\frac{4}{2} = 2, \\quad 50° = 50°', sx, s0 + (H ? 140 : 124), { boyut: H ? 36 : 34, hiza: sh, alfa: ara(t, 15.0, 15.7) * (1 - ara(t, 16.2, 16.6)) });
      E.formul(ctx, 'k = ' + sayi(kk, 2), sx, s0 + (H ? 140 : 124), { boyut: 40, hiza: sh, renk: 'limon', alfa: ara(t, 16.4, 16.8) });
      const es = ara(t, 18.2, 18.8, 'cik3');
      E.formul(ctx, '\\kutu{limon}{k = 1 \\;\\Rightarrow\\; \\cong}', sx, s0 + (H ? 236 : 210), { boyut: 40, hiza: sh, alfa: es, parilti: 0.3, parRenk: 'limon' });
      kilit(ctx, H ? sx + 250 : L.cx + 190, s0 + (H ? 236 : 210), 30, ara(t, 18.6, 19.0, 'geri'), { alfa: es });
      ctx.restore();
    }
  };

  /* ---------- 6. Nerede karşımıza çıkar: fotoğraf ve süsleme ---------- */
  const nerede = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    // Telefon
    const pw = H ? 230 : 196, ph = H ? 420 : 340;
    const px = H ? ic.x + 30 : ic.x + 10, py = H ? ic.y + 50 : ic.y + 20;
    const ta = ara(t, 0.1, 0.8);
    E.panel(ctx, px, py, pw, ph, { r: 30, renk: 'lacivert', dolguAlfa: 0.95, kenar: 'cizgi', kalinlik: 3, alfa: ta });
    const ex = px + 12, ey = py + 34, ew = pw - 24, eh = ph - 68;
    const k = kf(t, [[1.0, 1], [3.6, 1.8, 'io3']]);
    ctx.save(); ctx.globalAlpha *= ta;
    ctx.beginPath(); ctx.rect(ex, ey, ew, eh); ctx.clip();
    const gr = ctx.createLinearGradient(0, ey, 0, ey + eh);
    gr.addColorStop(0, '#1B2A4D'); gr.addColorStop(1, '#0E1526');
    ctx.fillStyle = gr; ctx.fillRect(ex, ey, ew, eh);
    const mx = ex + ew / 2, my = ey + eh / 2 + 10;
    ctx.translate(mx, my); ctx.scale(k, k); ctx.translate(-mx, -my);
    E.nokta(ctx, mx + 46, my - 92, 14, { renk: 'limon', parilti: 1 });
    // fotoğraftaki üçgen (çatı / dağ)
    const T = [[mx - 70, my + 40], [mx + 60, my + 40], [mx - 18, my - 50]];
    E.cokgen(ctx, [[ex - 200, my + 40], [ex + ew + 200, my + 40], [ex + ew + 200, ey + eh + 200], [ex - 200, ey + eh + 200]], { renk: 'derin', alfa: 1 });
    E.cokgen(ctx, T, { renk: 'menekse', alfa: 0.55 });
    E.cizgi(ctx, T, { renk: 'turkuaz', kalinlik: 2.5 / k, kapali: true, parilti: 0.6 });
    aci(ctx, T[0], T[1], T[2], 16, { renk: 'turkuaz', kalinlik: 2 / k });
    aci(ctx, T[1], T[0], T[2], 16, { renk: 'mercan', kalinlik: 2 / k });
    aci(ctx, T[2], T[0], T[1], 14, { renk: 'limon', kalinlik: 2 / k });
    ctx.restore();
    // parmaklar
    const fa = ara(t, 0.6, 1.0) * (1 - ara(t, 4.0, 4.6));
    const d = kf(t, [[1.0, 22], [3.6, 92, 'io3']]);
    for (const sgn of [-1, 1]) {
      const fx = ex + ew / 2 + sgn * d * 0.75, fy = ey + eh / 2 + 10 - sgn * d;
      ctx.save(); ctx.globalAlpha *= fa;
      ctx.strokeStyle = E.rgba('tebesir', 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(fx, fy, 17, 0, E.TAU); ctx.stroke();
      ctx.fillStyle = E.rgba('tebesir', 0.18); ctx.fill();
      ctx.restore();
    }
    // metin (telefonun yanında)
    const tx = H ? px + pw + 30 : px + pw + 26, tyy = H ? ic.y + 90 : ic.y + 60;
    E.yazi(ctx, 'BENZERLİK', tx, tyy, { boyut: 24, agirlik: 700, harfAra: 5, renk: 'turkuaz', hiza: 'left', alfa: ara(t, 0.3, 0.9) });
    E.formul(ctx, 'k = ' + sayi(k, 1), tx, tyy + 66, { boyut: 44, hiza: 'left', renk: 'limon', alfa: ara(t, 0.8, 1.3) });
    E.yazi(ctx, 'açılar aynı kalır', tx, tyy + 130, { boyut: 26, agirlik: 520, hiza: 'left', renk: 'gumus', alfa: ara(t, 2.4, 3.0), maxGen: H ? 260 : 380 });
    E.yazi(ctx, 'harita ölçeği de böyle', tx, tyy + 174, { boyut: 26, agirlik: 520, hiza: 'left', renk: 'gumus', alfa: ara(t, 3.2, 3.8), maxGen: H ? 260 : 380 });

    // Süsleme: tek üçgenin 180° döndürülmüş kopyalarıyla döşeme
    const R = H ? { x: ic.x + 600, y: ic.y + 20, w: ic.w - 600, h: ic.h - 40 } : { x: ic.x, y: ic.y + 400, w: ic.w, h: ic.h - 404 };
    const ra = ara(t, 3.6, 4.4);
    if (ra > 0) {
      ctx.save(); ctx.globalAlpha *= ra;
      E.yuvarlakDik(ctx, R.x, R.y, R.w, R.h, 20);
      ctx.fillStyle = E.rgba('lacivert', 0.6); ctx.fill();
      ctx.clip();
      const u = [1, 0], v = [0.26, 0.78];
      const bir = H ? 64 : 58;
      const zz = kf(t, [[3.6, 1.7], [10.3, 0.9, 'io2']]);
      const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
      const ekr = (P) => [cx + (P[0] - 0.45) * bir * zz, cy - (P[1] - 0.3) * bir * zz];
      const T0 = [[0, 0], [1, 0], v];
      const liste = [];
      for (let i = -9; i <= 9; i++) for (let j = -7; j <= 7; j++) {
        const o = [i * u[0] + j * v[0], i * u[1] + j * v[1]];
        const yuk = T0.map((p) => topla(p, o));
        const asg = T0.map((p) => topla(o, [u[0] + v[0] - p[0], u[1] + v[1] - p[1]])); // kenar orta noktası etrafında 180° dönmüş
        for (const [P, tur] of [[yuk, 0], [asg, 1]]) {
          const G = agirlik(P);
          liste.push({ P, tur, d: Math.hypot(G[0] - 0.45, G[1] - 0.3) });
        }
      }
      for (const q of liste) {
        const a = ara(t, 4.0 + q.d * 0.45, 4.5 + q.d * 0.45, 'cik3');
        if (a <= 0) continue;
        const P = q.P.map(ekr);
        E.cokgen(ctx, P, { renk: q.tur ? 'menekse' : 'turkuaz', alfa: 0.22 * a });
        E.cizgi(ctx, P, { renk: 'tebesir', kalinlik: 1.3, kapali: true, alfa: 0.45 * a });
      }
      const P0 = T0.map(ekr);
      E.cizgi(ctx, P0, { renk: 'limon', kalinlik: 3, kapali: true, parilti: 1 });
      ctx.restore();
      E.etiket(ctx, 'EŞLİK · süsleme', R.x + 20, R.y + 34, { boyut: 24, hiza: 'left', renk: 'turkuaz', agirlik: 700, alfa: ara(t, 4.2, 4.8), plakaAlfa: 0.85 });
    }
  };

  /* ---------- 7–8. Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Eşlik: üç kenar, iki kenar + aradaki açı, kenar + iki uç açısı.', formul: '\\t{KKK},\\; \\t{KAK},\\; \\t{AKA} \\Rightarrow \\cong' },
    { tr: 'Açı kenarların arasında değilse iki üçgen çıkabilir.', formul: '\\t{KKA}: \\t{tuzak}' },
    { tr: 'Benzerlik yalnızca şekli kilitler.', formul: '\\t{AA},\\; \\t{KKK}∼,\\; \\t{KAK}∼' },
    { tr: 'Eşlik, oranın 1 olduğu benzerliktir.', formul: 'k = 1 \\iff \\cong' },
  ], { aralik: 1.6 });
  /** Yerel bitiş kartı: motorun bitisKarti'si iki satıra sarılan uzun laboratuvar adında
      ad ile açıklamayı üst üste bindiriyor; burada satır yüksekliği ölçülerek diziliyor. */
  const bitis = (ctx, s) => {
    const L = E.L, t = s.t, ic = L.icerik, H = E.yatay;
    const a1 = ara(t, 0, 0.9, 'cik3'), a2 = ara(t, 0.5, 1.4, 'cik3'), a3 = ara(t, 1.0, 1.9, 'cik3');
    const qrBoy = H ? 230 : 250;
    const qx = H ? L.cx + 190 : L.cx - qrBoy / 2, qy = H ? ic.y + 90 : ic.y + 340;
    const tx = H ? ic.x + 60 : L.cx, hz = H ? 'left' : 'center', gen = H ? 560 : 620;
    let y = H ? ic.y + 80 : ic.y + 20;
    E.yazi(ctx, 'ŞİMDİ SEN DENE', tx, y, { boyut: 26, agirlik: 700, harfAra: 6, renk: 'turkuaz', hiza: hz, alfa: a1, taban: 'top' });
    y += 54;
    const r = E.yazi(ctx, meta.labAd, tx, y, { boyut: H ? 50 : 46, agirlik: 760, hiza: hz, alfa: a1, maxGen: gen, satirAra: 1.08, taban: 'top' });
    y += r.h + 22;
    E.yazi(ctx, meta.labAciklama, tx, y, { boyut: 26, agirlik: 460, renk: 'gumus', hiza: hz, alfa: a2, maxGen: gen, taban: 'top' });
    if (window.qrcode && meta.labUrl) {
      if (!E._qr || E._qr.url !== meta.labUrl) { const q = window.qrcode(0, 'M'); q.addData(meta.labUrl); q.make(); E._qr = { url: meta.labUrl, q }; }
      const q = E._qr.q, n = q.getModuleCount(), m = qrBoy / (n + 4);
      ctx.save(); ctx.globalAlpha *= a2;
      E.panel(ctx, qx, qy, qrBoy, qrBoy, { r: 16, renk: 'tebesir', dolguAlfa: 1, kenar: null });
      ctx.fillStyle = E.R('gece');
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (q.isDark(i, j)) ctx.fillRect(qx + (j + 2) * m, qy + (i + 2) * m, m + 0.4, m + 0.4);
      ctx.restore();
      E.isik(ctx, qx + qrBoy / 2, qy + qrBoy / 2, qrBoy, 'turkuaz', 0.12 * a2);
    }
    E.yazi(ctx, meta.labUrl.replace('https://', ''), qx + qrBoy / 2, qy + qrBoy + 32, { boyut: 22, agirlik: 520, renk: 'gumus', alfa: a2 });
    E.yazi(ctx, 'Eksen · Hakan Ataş · CC BY-NC 4.0', L.cx, ic.y1 - (H ? 6 : 10), { boyut: 22, agirlik: 520, renk: 'gumus', alfa: a3, harfAra: 1 });
  };

  /* ---------- Film ---------- */
  E.film({
    meta,
    sure: 117.0,
    sahneler: [
      { ad: 'Soğuk açılış: hayalet üçgenler', bas: 0, son: 11.0, giris: 0, cikis: 0.7, ciz: acilis },
      { ad: 'İmza', bas: 10.7, son: 14.4, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 14.1, son: 18.4, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'KKK: üç çubuk, tek üçgen', bas: 18.1, son: 36.6, ciz: kkk },
      { ad: 'KAK ve AKA', bas: 36.3, son: 53.6, ciz: kakAka },
      { ad: 'Tuzak: KKA ve AAA', bas: 53.3, son: 70.6, ciz: tuzak },
      { ad: 'Benzerlik: şekli kilitlemek', bas: 70.3, son: 90.4, ciz: benzerlik },
      { ad: 'Fotoğraf ve süsleme', bas: 90.1, son: 100.4, ciz: nerede },
      { ad: 'Aklında kalsın', bas: 100.1, son: 110.6, ciz: ozet },
      { ad: 'Laboratuvar', bas: 110.4, son: 117.0, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 5, renk1: 'turkuaz', renk2: 'menekse' }),
  });
})();
