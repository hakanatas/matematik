/* ==========================================================================
   EKSEN 9.4.4 — Kaybolmayan Alan
   Tek fikir: Dik üçgende hipotenüse indirilen yükseklik benzer üçgenler
   doğurur; benzerlikten Öklid bağıntıları, onlardan Pisagor kendiliğinden
   çıkar. Görsel ispat: dik kenarlar üzerindeki kareler kesme/kaydırma ile
   (alan korunarak) hipotenüs karesinin p×a ve k×a dikdörtgenlerine dönüşür.
   Bütün noktalar gerçek koordinatlarla hesaplanır: 3-4-5 dik üçgeni,
   p = 1,8, k = 3,2, h = 2,4.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp } = E;
  const D = Math.PI / 180;

  const meta = {
    kod: 'MAT.9.4.4',
    tema: 'Eşlik ve Benzerlik',
    ad: 'Kaybolmayan Alan',
    adEn: 'The Area That Never Disappears',
    labAd: 'Dönüşüm ve Benzerlik Laboratuvarı',
    labAciklama: 'Tales paralellerini ve dik üçgendeki yüksekliği sürükle; Öklid ve Pisagor bağıntılarının her durumda tuttuğunu gör.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-donusumler/',
  };

  /* ---------- Geometri ---------- */
  const uzak = (P, Q) => Math.hypot(Q[0] - P[0], Q[1] - P[1]);
  const topla = (P, Q) => [P[0] + Q[0], P[1] + Q[1]];
  const fark = (P, Q) => [P[0] - Q[0], P[1] - Q[1]];
  const kat = (P, k) => [P[0] * k, P[1] * k];
  const ara2 = (P, Q, k) => [lerp(P[0], Q[0], k), lerp(P[1], Q[1], k)];
  const agirlik = (Ps) => [Ps.reduce((s, p) => s + p[0], 0) / Ps.length, Ps.reduce((s, p) => s + p[1], 0) / Ps.length];
  const birim = (P) => { const n = Math.hypot(...P) || 1; return [P[0] / n, P[1] / n]; };
  const dikmeAyagi = (R, S, L) => {
    const d = fark(L, S), t = ((R[0] - S[0]) * d[0] + (R[1] - S[1]) * d[1]) / (d[0] * d[0] + d[1] * d[1]);
    return topla(S, kat(d, t));
  };
  /** y = sabit doğrusu ile P + s·u doğrusunun kesişimi */
  const yatayKes = (P, u, y) => topla(P, kat(u, (y - P[1]) / u[1]));
  /** Çokgen alanı (ayakkabı bağı formülü) */
  const alan = (Ps) => Math.abs(Ps.reduce((s, p, i) => { const q = Ps[(i + 1) % Ps.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  const sayi = (v, b = 2) => E.sayiYaz(v, b);
  const tx = (v, b = 2) => sayi(v, b).replace(',', '{,}');

  /* ---------- Ana dik üçgen: A dik, BC hipotenüs ---------- */
  const B = [0, 0], C = [5, 0];
  const A = [1.8, 2.4]; // |AB| = 3, |AC| = 4
  const Hh = dikmeAyagi(A, B, C); // (1,8 ; 0)
  const a = uzak(B, C), b = uzak(A, C), c = uzak(A, B);
  const p = uzak(B, Hh), k = uzak(Hh, C), h = uzak(A, Hh);
  // Kareler: dışa doğru
  const nAB = kat(birim([-(A[1] - B[1]), A[0] - B[0]]), c); // AB'nin C'den uzak normali
  const nAC = kat(birim([A[1] - C[1], -(A[0] - C[0])]), b);
  const KARE_C = [B, A, topla(A, nAB), topla(B, nAB)];
  const KARE_B = [A, C, topla(C, nAC), topla(A, nAC)];
  const KARE_A = [B, C, [C[0], -a], [B[0], -a]];

  /* ---------- Çizim yardımcıları ---------- */
  const cokgen = (ctx, P, o = {}) => {
    const al = o.alfa ?? 1;
    if (al <= 0.002) return;
    if (o.dolgu) E.cokgen(ctx, P, { renk: o.dolguRenk || o.renk, alfa: o.dolgu * al });
    if ((o.kalinlik ?? 3) > 0.05) E.cizgi(ctx, P, { renk: o.renk || 'tebesir', kalinlik: o.kalinlik ?? 3, parilti: o.parilti ?? 0.8, kapali: true, p: o.p ?? 1, alfa: al, kesik: o.kesik });
  };
  const aci = (ctx, V, P1, P2, r, o = {}) => {
    const a0 = Math.atan2(P1[1] - V[1], P1[0] - V[0]);
    let d = Math.atan2(P2[1] - V[1], P2[0] - V[0]) - a0;
    while (d > Math.PI) d -= E.TAU;
    while (d < -Math.PI) d += E.TAU;
    E.aciYayi(ctx, V[0], V[1], r, a0, a0 + d, Object.assign({ kalinlik: 2.5, dolgu: 0.18 }, o));
  };
  const dikKare = (ctx, R, S, L, bb, o = {}) => {
    const u = birim(fark(S, R)), v = birim(fark(L, R));
    const p1 = topla(R, kat(u, bb)), p2 = topla(R, kat(v, bb));
    E.cizgi(ctx, [p1, topla(p1, kat(v, bb)), p2], Object.assign({ renk: 'limon', kalinlik: 2 }, o));
  };
  const kenarYer = (P1, P2, ref, d) => {
    const m = ara2(P1, P2, 0.5);
    let n = birim([-(P2[1] - P1[1]), P2[0] - P1[0]]);
    if ((m[0] - ref[0]) * n[0] + (m[1] - ref[1]) * n[1] < 0) n = [-n[0], -n[1]];
    return topla(m, kat(n, d));
  };
  const koseEt = (ctx, V, G, ad, o = {}) => {
    const u = birim(fark(V, G)), d = o.d ?? 28;
    E.formul(ctx, ad, V[0] + u[0] * d, V[1] + u[1] * d, { boyut: o.boyut || 28, renk: o.renk || 'gumus', alfa: o.alfa ?? 1 });
  };
  /** Birim ızgara (kare içinde) */
  const izgara = (ctx, P, n, o = {}) => {
    const al = o.alfa ?? 1;
    if (al <= 0.002) return;
    for (let i = 1; i < n; i++) {
      E.cizgi(ctx, [ara2(P[0], P[1], i / n), ara2(P[3], P[2], i / n)], { renk: o.renk || 'tebesir', kalinlik: 1, alfa: al * 0.35 });
      E.cizgi(ctx, [ara2(P[0], P[3], i / n), ara2(P[1], P[2], i / n)], { renk: o.renk || 'tebesir', kalinlik: 1, alfa: al * 0.35 });
    }
  };
  const harita = (ox, oy, s) => { const f = (P) => [ox + P[0] * s, oy - P[1] * s]; f.s = s; return f; };

  /* ---------- 1. Soğuk açılış: 9 + 16 = 25 ---------- */
  const HUCRELER = (() => {
    const liste = [];
    const ekle = (K, n, renk) => {
      const u = kat(fark(K[1], K[0]), 1 / n), v = kat(fark(K[3], K[0]), 1 / n);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const m = topla(K[0], topla(kat(u, i + 0.5), kat(v, j + 0.5)));
        liste.push({ m, aci: Math.atan2(u[1], u[0]), renk });
      }
    };
    ekle(KARE_C, 3, 'turkuaz');
    ekle(KARE_B, 4, 'mercan');
    // soldan sağa sırala, hipotenüs karesine sütun sütun yerleştir
    const c9 = liste.slice(0, 9).sort((x, y) => x.m[0] - y.m[0]);
    const b16 = liste.slice(9).sort((x, y) => x.m[0] - y.m[0]);
    return c9.concat(b16).map((q, s) => Object.assign(q, { hedef: [Math.floor(s / 5) + 0.5, -((s % 5) + 0.5)], s }));
  })();
  const kareHucre = (ctx, g, m, ac, boy, renk, al) => {
    const c = Math.cos(ac), s = Math.sin(ac), r = boy / 2;
    const P = [[-r, -r], [r, -r], [r, r], [-r, r]].map(([x, y]) => g([m[0] + x * c - y * s, m[1] + x * s + y * c]));
    E.cokgen(ctx, P, { renk, alfa: 0.55 * al });
    E.cizgi(ctx, P, { renk, kalinlik: 1.5, kapali: true, alfa: al, parilti: 0.4 });
  };
  const acilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc = H ? 46 : 58;
    const z = kf(t, [[0, 1.0], [8.6, 1.0], [11.6, 1.08, 'io2']]);
    const ox = H ? L.cx - 2.5 * sc : L.cx - 2.5 * sc, oy = H ? ic.y + 12 + 5.6 * sc : ic.y + 30 + 5.6 * sc;
    const g0 = harita(ox, oy, sc);
    const odak = g0([2.5, 0]);
    const g = (P) => { const q = g0(P); return [odak[0] + (q[0] - odak[0]) * z, odak[1] + (q[1] - odak[1]) * z]; };
    const tp = ara(t, 0.2, 1.4);
    cokgen(ctx, [A, B, C].map(g), { renk: 'tebesir', kalinlik: 3, parilti: 0.9, p: tp, dolgu: 0.08, dolguRenk: 'gok' });
    dikKare(ctx, g(A), g(B), g(C), 12, { alfa: ara(t, 1.0, 1.4) });
    // kareler
    const ka = ara(t, 1.2, 2.2), kb = ara(t, 1.6, 2.6), kh = ara(t, 2.4, 3.2);
    const bos = 1 - ara(t, 3.6, 8.4, 'lin');
    cokgen(ctx, KARE_C.map(g), { renk: 'turkuaz', kalinlik: 2.5, p: ka, alfa: 0.4 + 0.6 * bos });
    cokgen(ctx, KARE_B.map(g), { renk: 'mercan', kalinlik: 2.5, p: kb, alfa: 0.4 + 0.6 * bos });
    cokgen(ctx, KARE_A.map(g), { renk: 'limon', kalinlik: 2.5, kesik: [8, 7], p: kh, parilti: 0.5 });
    izgara(ctx, KARE_A.map(g), 5, { alfa: kh * 0.6, renk: 'limon' });
    // hücreler
    HUCRELER.forEach((q, i) => {
      const t0 = 3.6 + i * 0.16;
      const f = ara(t, t0, t0 + 1.0, 'io3');
      const al = q.renk === 'turkuaz' ? ka : kb;
      const m = topla(ara2(q.m, q.hedef, f), [0, 1.4 * Math.sin(Math.PI * f)]);
      const ac = lerp(q.aci, 0, f);
      kareHucre(ctx, g, m, ac, 0.9 * sc * z / sc, q.renk, al);
      if (f >= 1) E.isik(ctx, g(q.hedef)[0], g(q.hedef)[1], 40, q.renk, 0.5 * E.nabiz(t, t0 + 1.0, 0.5));
    });
    const dolu = E.nabiz(t, 8.6, 1.3);
    if (dolu > 0) E.isik(ctx, g([2.5, -2.5])[0], g([2.5, -2.5])[1], 5 * sc * 1.2, 'limon', 0.35 * dolu);
    // etiketler
    const G = g(agirlik([A, B, C]));
    E.formul(ctx, '9', g(agirlik(KARE_C))[0], g(agirlik(KARE_C))[1], { boyut: 34, renk: 'turkuaz', alfa: ka * bos });
    E.formul(ctx, '16', g(agirlik(KARE_B))[0], g(agirlik(KARE_B))[1], { boyut: 34, renk: 'mercan', alfa: kb * bos });
    const yA = ara(t, 0.8, 1.4);
    E.formul(ctx, '3', kenarYer(g(A), g(B), G, 22)[0] + 14, kenarYer(g(A), g(B), G, 22)[1] + 14, { boyut: 26, renk: 'turkuaz', alfa: yA * bos });
    E.formul(ctx, '4', kenarYer(g(A), g(C), G, 22)[0] - 14, kenarYer(g(A), g(C), G, 22)[1] + 14, { boyut: 26, renk: 'mercan', alfa: yA * bos });
    // sayaç
    const sx = H ? ic.x1 - 20 : L.cx, sh = H ? 'right' : 'center';
    const sy = H ? ic.y + 60 : ic.y1 - 120;
    const n1 = HUCRELER.filter((q, i) => q.renk === 'turkuaz' && t >= 4.6 + i * 0.16).length;
    const n2 = HUCRELER.filter((q, i) => q.renk === 'mercan' && t >= 4.6 + i * 0.16).length;
    const sa = ara(t, 3.4, 4.0);
    E.formul(ctx, '\\c{turkuaz}{' + n1 + '} + \\c{mercan}{' + n2 + '} = \\c{limon}{' + (n1 + n2) + '}', sx, sy, { boyut: H ? 52 : 50, hiza: sh, alfa: sa, parilti: 0.3 * dolu, parRenk: 'limon' });
    E.formul(ctx, '3^{2} + 4^{2} = 5^{2}', sx, sy + (H ? 70 : 64), { boyut: 34, hiza: sh, renk: 'gumus', alfa: ara(t, 8.8, 9.4) });
    const qa = ara(t, 9.4, 10.2, 'cik3');
    E.yazi(ctx, 'Her dik üçgende mi?', sx, sy + (H ? 150 : -82), { boyut: H ? 44 : 44, agirlik: 760, hiza: sh, alfa: qa, parilti: 0.3, parRenk: 'limon' });
  };

  /* ---------- 2. Tales ---------- */
  // d1: y = 6, d2: y = 3,6, d3: y = 0 (aralıklar 2,4 ve 3,6 → oran 2 : 3)
  const YLER = [6, 3.6, 0];
  const K1 = { P: [1, 6], u: [0.6, -0.8] };
  const tales = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc = H ? 58 : 64;
    const g = H ? harita(ic.x + 40, ic.y + 430, sc) : harita(ic.x + 10, ic.y + 420, sc);
    // k2: D'den geçer, açısı sallanır
    const fi = kf(t, [[6.8, 0], [8.0, 14], [9.4, -12], [10.6, 0]]) * D;
    const u0 = [0.28, -0.96];
    const u2 = [u0[0] * Math.cos(fi) - u0[1] * Math.sin(fi), u0[0] * Math.sin(fi) + u0[1] * Math.cos(fi)];
    const Dp = [6.5, 6];
    const [Ap, Bp, Cp] = YLER.map((y) => yatayKes(K1.P, K1.u, y));
    const [_, Ep, Fp] = YLER.map((y) => yatayKes(Dp, u2, y));
    // paraleller: ışık şeritleri
    YLER.forEach((y, i) => {
      const pa = ara(t, 0.1 + i * 0.25, 1.1 + i * 0.25);
      const sol = g([-0.6, y]), sag = g([9.6, y]);
      E.cizgi(ctx, [sol, ara2(sol, sag, pa)], { renk: 'gok', kalinlik: 3, parilti: 1.0, alfa: 0.9 });
      E.formul(ctx, 'd_{' + (i + 1) + '}', sag[0] - 6, sag[1] - 22, { boyut: 26, renk: 'gok', hiza: 'right', alfa: ara(t, 0.8 + i * 0.25, 1.4 + i * 0.25) });
    });
    // kesenler
    const k1p = ara(t, 1.4, 2.6), k2p = ara(t, 2.4, 3.6);
    E.cizgi(ctx, [g(topla(Ap, kat(K1.u, -0.6))), g(topla(Cp, kat(K1.u, 0.5)))], { renk: 'tebesir', kalinlik: 2, p: k1p, alfa: 0.8 });
    E.cizgi(ctx, [g(topla(Dp, kat(u2, -0.6))), g(topla(Fp, kat(u2, 0.5)))], { renk: 'tebesir', kalinlik: 2, p: k2p, alfa: 0.8 });
    // parçalar
    const pp = ara(t, 3.8, 4.8);
    E.cizgi(ctx, [g(Ap), g(Bp)], { renk: 'turkuaz', kalinlik: 5, parilti: 1, p: pp });
    E.cizgi(ctx, [g(Bp), g(Cp)], { renk: 'mercan', kalinlik: 5, parilti: 1, p: ara(t, 4.2, 5.2) });
    E.cizgi(ctx, [g(Dp), g(Ep)], { renk: 'turkuaz', kalinlik: 5, parilti: 1, p: pp });
    E.cizgi(ctx, [g(Ep), g(Fp)], { renk: 'mercan', kalinlik: 5, parilti: 1, p: ara(t, 4.2, 5.2) });
    const noktalar = [[Ap, 'A', k1p, -1], [Bp, 'B', k1p, -1], [Cp, 'C', k1p, -1], [Dp, 'D', k2p, 1], [Ep, 'E', k2p, 1], [Fp, 'F', k2p, 1]];
    for (const [P, ad, al, yon] of noktalar) {
      E.nokta(ctx, g(P)[0], g(P)[1], 6, { renk: 'tebesir', alfa: al });
      E.formul(ctx, ad, g(P)[0] + yon * 22, g(P)[1] - 20, { boyut: 28, renk: 'gumus', alfa: al });
    }
    // uzunluk etiketleri
    const la = ara(t, 4.8, 5.4);
    const et = (P, Q, deger, renk, yon) => { const m = g(ara2(P, Q, 0.5)); E.formul(ctx, tx(deger), m[0] + yon * 16, m[1], { boyut: 26, renk, hiza: yon < 0 ? 'right' : 'left', alfa: la }); };
    et(Ap, Bp, uzak(Ap, Bp), 'turkuaz', -1); et(Bp, Cp, uzak(Bp, Cp), 'mercan', -1);
    et(Dp, Ep, uzak(Dp, Ep), 'turkuaz', 1); et(Ep, Fp, uzak(Ep, Fp), 'mercan', 1);
    // İspat: k2'yi A'dan geçecek şekilde paralel kaydır
    const kay = ara(t, 11.6, 13.4, 'io3');
    if (kay > 0) {
      const P0 = ara2(Dp, Ap, kay);
      const E2 = yatayKes(P0, u2, YLER[1]), F2 = yatayKes(P0, u2, YLER[2]);
      const ka = 1;
      E.cizgi(ctx, [g(topla(P0, kat(u2, -0.4))), g(topla(F2, kat(u2, 0.4)))], { renk: 'limon', kalinlik: 2.5, kesik: [8, 6], alfa: ka, parilti: 0.6 });
      const ta = ara(t, 13.6, 14.4);
      if (ta > 0) {
        E.cokgen(ctx, [Ap, Bp, E2].map(g), { renk: 'turkuaz', alfa: 0.28 * ta });
        E.cokgen(ctx, [Bp, Cp, F2, E2].map(g), { renk: 'mercan', alfa: 0.16 * ta });
        E.cizgi(ctx, [g(Bp), g(E2)], { renk: 'limon', kalinlik: 3, alfa: ta });
        E.cizgi(ctx, [g(Cp), g(F2)], { renk: 'limon', kalinlik: 3, alfa: ta });
        E.formul(ctx, "E'", g(E2)[0] - 24, g(E2)[1] + 22, { boyut: 26, renk: 'limon', alfa: ta });
        E.formul(ctx, "F'", g(F2)[0] - 22, g(F2)[1] + 24, { boyut: 26, renk: 'limon', alfa: ta });
      }
      // paralelkenarlar: AE' = DE, E'F' = EF
      const pk = ara(t, 15.4, 16.2);
      if (pk > 0) {
        E.cokgen(ctx, [Ap, Dp, Ep, E2].map(g), { renk: 'turkuaz', alfa: 0.12 * pk });
        E.cokgen(ctx, [E2, Ep, Fp, F2].map(g), { renk: 'mercan', alfa: 0.1 * pk });
      }
    }
    // metin
    const sx = H ? 720 : L.cx, sh = H ? 'left' : 'center';
    const s0 = H ? ic.y + 40 : ic.y + 470;
    E.yazi(ctx, 'TALES', sx, s0, { boyut: 24, agirlik: 700, harfAra: 6, renk: 'turkuaz', hiza: sh, alfa: ara(t, 0.5, 1.1) });
    E.formul(ctx, 'd_{1} \\;∥\\; d_{2} \\;∥\\; d_{3}', sx, s0 + 50, { boyut: 34, hiza: sh, alfa: ara(t, 1.0, 1.6) * (1 - ara(t, 11.2, 11.7)) });
    const fa = ara(t, 5.4, 6.1) * (1 - ara(t, 11.2, 11.7));
    E.formul(ctx, '\\frac{\\c{turkuaz}{|AB|}}{\\c{mercan}{|BC|}} = \\frac{\\c{turkuaz}{|DE|}}{\\c{mercan}{|EF|}}', sx, s0 + (H ? 140 : 128), { boyut: 40, hiza: sh, alfa: fa });
    const oran = uzak(Dp, Ep) / uzak(Ep, Fp);
    E.formul(ctx, '\\frac{3}{4{,}5} = \\frac{' + tx(uzak(Dp, Ep)) + '}{' + tx(uzak(Ep, Fp)) + '} = \\c{limon}{' + tx(oran) + '}', sx, s0 + (H ? 240 : 222), { boyut: 34, hiza: sh, alfa: ara(t, 6.0, 6.6) * (1 - ara(t, 11.2, 11.7)) });
    // ispat metni
    const ia = ara(t, 11.8, 12.4);
    E.yazi(ctx, 'İSPAT', sx, s0 + 50, { boyut: 24, agirlik: 700, harfAra: 6, renk: 'limon', hiza: sh, alfa: ia });
    E.formul(ctx, "BE' \\;∥\\; CF' \\Rightarrow \\triangle ABE' \\sim \\triangle ACF'", sx, s0 + (H ? 104 : 96), { boyut: H ? 30 : 30, hiza: sh, alfa: ara(t, 14.0, 14.6) });
    E.formul(ctx, "\\frac{|AB|}{|AC|} = \\frac{|AE'|}{|AF'|}", sx, s0 + (H ? 182 : 166), { boyut: 34, hiza: sh, alfa: ara(t, 14.6, 15.2) });
    E.formul(ctx, "|AE'| = |DE|, \\;\\; |E'F'| = |EF|", sx, s0 + (H ? 262 : 236), { boyut: 30, hiza: sh, renk: 'gumus', alfa: ara(t, 15.8, 16.4) });
    E.formul(ctx, '\\kutu{limon}{\\frac{|AB|}{|BC|} = \\frac{|DE|}{|EF|}}', sx, s0 + (H ? 352 : 318), { boyut: 36, hiza: sh, alfa: ara(t, 16.8, 17.4), parilti: 0.25, parRenk: 'limon' });
  };

  /* ---------- 3. Öklid ---------- */
  const oklid = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc = H ? 92 : 104;
    const g = H ? harita(ic.x + 40, ic.y + 290, sc) : harita(L.cx - 2.5 * sc, ic.y + 270, sc);
    const ta = ara(t, 0.1, 1.2);
    // vurgulanan üçgen çiftleri
    const evre = t < 7.7 ? 0 : t < 12.7 ? 1 : 2;
    const ciftler = [[[A, B, Hh], [A, Hh, C]], [[A, B, Hh], [A, B, C]], [[A, Hh, C], [A, B, C]]];
    const ea = ara(t, 2.9 + evre * 5, 3.5 + evre * 5) * (1 - ara(t, 7.2 + evre * 5, 7.7 + evre * 5)) * (t < 17.6 ? 1 : 0);
    if (ea > 0) {
      const [T1, T2] = ciftler[evre];
      E.cokgen(ctx, T2.map(g), { renk: 'menekse', alfa: 0.22 * ea });
      E.cokgen(ctx, T1.map(g), { renk: 'turkuaz', alfa: 0.32 * ea });
      E.cizgi(ctx, T1.map(g), { renk: 'turkuaz', kalinlik: 3, kapali: true, parilti: 0.8, alfa: ea });
      E.cizgi(ctx, T2.map(g), { renk: 'menekse', kalinlik: 2.5, kapali: true, kesik: [8, 6], alfa: ea });
    }
    cokgen(ctx, [A, B, C].map(g), { renk: 'tebesir', kalinlik: 3, parilti: 0.8, p: ta });
    const yp = ara(t, 0.8, 1.6);
    E.cizgi(ctx, [g(A), g(ara2(A, Hh, yp))], { renk: 'limon', kalinlik: 3.5, parilti: 1 });
    if (yp >= 1) dikKare(ctx, g(Hh), g(C), g(A), 12);
    dikKare(ctx, g(A), g(B), g(C), 14, { alfa: ta });
    const G = g(agirlik([A, B, C]));
    koseEt(ctx, g(A), G, 'A', { alfa: ta }); koseEt(ctx, g(B), G, 'B', { alfa: ta }); koseEt(ctx, g(C), G, 'C', { alfa: ta });
    E.formul(ctx, 'H', g(Hh)[0], g(Hh)[1] + 30, { boyut: 26, renk: 'limon', alfa: yp });
    // kenar adları
    const la = ara(t, 1.4, 2.4);
    const et = (P, Q, ad, renk, d = 24, ref = G) => { const [x, y] = kenarYer(g(P), g(Q), ref, d); E.formul(ctx, ad, x, y, { boyut: 30, renk, alfa: la }); };
    et(A, B, 'c', 'turkuaz'); et(A, C, 'b', 'mercan');
    E.formul(ctx, 'h', ara2(g(A), g(Hh), 0.5)[0] + 16, ara2(g(A), g(Hh), 0.5)[1], { boyut: 30, renk: 'limon', alfa: la });
    E.formul(ctx, 'p', ara2(g(B), g(Hh), 0.5)[0], g(B)[1] + 30, { boyut: 30, renk: 'gok', alfa: la });
    E.formul(ctx, 'k', ara2(g(Hh), g(C), 0.5)[0], g(C)[1] + 30, { boyut: 30, renk: 'menekse', alfa: la });
    // a: tabanın altında süslü parantez yerine çizgi
    const ay = g(B)[1] + 66;
    E.cizgi(ctx, [[g(B)[0], ay - 8], [g(B)[0], ay], [g(C)[0], ay], [g(C)[0], ay - 8]], { renk: 'gumus', kalinlik: 1.5, alfa: la });
    E.formul(ctx, 'a = p + k', ara2(g(B), g(C), 0.5)[0], ay + 26, { boyut: 28, renk: 'gumus', alfa: la });
    // bağıntılar
    const satir = [
      { f: '\\frac{h}{p} = \\frac{k}{h} \\;\\Rightarrow\\; \\kutu{limon}{h^{2} = p · k}', d: tx(h, 1) + '^{2} = ' + tx(h * h) + ' = ' + tx(p, 1) + ' · ' + tx(k, 1) },
      { f: '\\frac{c}{a} = \\frac{p}{c} \\;\\Rightarrow\\; \\kutu{limon}{c^{2} = p · a}', d: tx(c, 0) + '^{2} = ' + tx(c * c, 0) + ' = ' + tx(p, 1) + ' · ' + tx(a, 0) },
      { f: '\\frac{b}{a} = \\frac{k}{b} \\;\\Rightarrow\\; \\kutu{limon}{b^{2} = k · a}', d: tx(b, 0) + '^{2} = ' + tx(b * b, 0) + ' = ' + tx(k, 1) + ' · ' + tx(a, 0) },
    ];
    const etiket = ['\\triangle ABH \\sim \\triangle CAH', '\\triangle ABH \\sim \\triangle CBA', '\\triangle AHC \\sim \\triangle BAC'];
    const sx = H ? 640 : L.cx, sh = H ? 'left' : 'center';
    E.yazi(ctx, 'ÖKLİD', sx, H ? ic.y + 20 : ic.y + 380, { boyut: 24, agirlik: 700, harfAra: 6, renk: 'turkuaz', hiza: sh, alfa: ara(t, 0.4, 1.0) });
    satir.forEach((r, i) => {
      const t0 = 3.0 + i * 5;
      const y = H ? ic.y + 90 + i * 160 : ic.y + 436 + i * 148;
      E.formul(ctx, etiket[i], sx, y, { boyut: H ? 28 : 26, renk: 'gumus', hiza: sh, alfa: ara(t, t0, t0 + 0.6) });
      E.formul(ctx, r.f, sx, y + (H ? 54 : 50), { boyut: H ? 34 : 32, hiza: sh, alfa: ara(t, t0 + 0.8, t0 + 1.5), aciga: ara(t, t0 + 0.8, t0 + 2.4, 'lin') });
      E.formul(ctx, r.d + ' \\;✓', sx, y + (H ? 106 : 98), { boyut: 26, hiza: sh, renk: 'gumus', alfa: ara(t, t0 + 2.6, t0 + 3.2) });
    });
  };

  /* ---------- 4. Pisagor: kaybolmayan alan (kesme ile ispat) ---------- */
  /** Dik kenar karesinin üç aşamalı dönüşümü: kesme (kenara paralel) → dikey kesme → aşağı kaydırma */
  const donusum = (K, w, solX, sagX, f1, f2, f3) => {
    // K: [P0 (taban ucu), P1, P1+n, P0+n]; P0P1 bacak; w = (0, a) dikey kaydırma hedefi
    const [P0, P1, P2, P3] = K;
    // 1) dış kenar kendi doğrusu boyunca kayar: P3 → P0 + w, P2 → P1 + w
    const Q2 = ara2(P2, topla(P1, w), f1), Q3 = ara2(P3, topla(P0, w), f1);
    let R = [P0, P1, Q2, Q3];
    // 2) dikey kesme: yüksek uç (A tarafı) aşağı iner, şekil dikdörtgen olur
    const yA = Math.max(P0[1], P1[1]);
    const ust = (P0[1] > P1[1]) ? 0 : 1; // A köşesi
    R = R.map((q, i) => {
      const ustMu = (i === ust) || (i === (ust === 0 ? 3 : 2));
      return ustMu ? [q[0], q[1] - yA * f2] : q;
    });
    // 3) aşağı kaydırma: dikdörtgen [solX, sagX] × [0, a] → [solX, sagX] × [−a, 0]
    R = R.map((q) => [q[0], q[1] - w[1] * f3]);
    return R;
  };
  const pisagor = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc = H ? 46 : 58;
    const g = H ? harita(ic.x + 150 + 2.4 * 46, ic.y + 10 + 5.6 * 46, sc) : harita(L.cx - 2.5 * sc, ic.y + 16 + 5.6 * sc, sc);
    const w = [0, a];
    // c² karesi (B, A, ...) ve b² karesi (C, A, ...) — taban ucu dik açıya komşu olmayan köşe
    const Kc = [B, A, KARE_C[2], KARE_C[3]];
    const Kb = [C, A, KARE_B[3], KARE_B[2]];
    const fc = [ara(t, 3.4, 5.6, 'io3'), ara(t, 6.0, 7.8, 'io3'), ara(t, 8.2, 9.8, 'io3')];
    const fb = [ara(t, 10.4, 12.2, 'io3'), ara(t, 12.5, 14.1, 'io3'), ara(t, 14.4, 15.9, 'io3')];
    const Rc = donusum(Kc, w, 0, p, ...fc);
    const Rb = donusum(Kb, w, p, a, ...fb);
    const ta = ara(t, 0.1, 1.0);
    // hipotenüs karesi ve yükseklik doğrultusu
    cokgen(ctx, KARE_A.map(g), { renk: 'limon', kalinlik: 2.5, parilti: 0.5, alfa: ta, dolgu: 0.04 });
    const yp = ara(t, 1.4, 2.6);
    E.cizgi(ctx, [g(A), g(ara2(A, [Hh[0], -a], yp))], { renk: 'limon', kalinlik: 2, kesik: [7, 6], alfa: 0.85 });
    // orijinal karelerin hayaletleri
    cokgen(ctx, KARE_C.map(g), { renk: 'turkuaz', kalinlik: 1.5, kesik: [5, 6], alfa: ta * 0.45 * ara(t, 3.4, 3.8) });
    cokgen(ctx, KARE_B.map(g), { renk: 'mercan', kalinlik: 1.5, kesik: [5, 6], alfa: ta * 0.45 * ara(t, 10.4, 10.8) });
    // hareketli şekiller
    const bitti = ara(t, 16.0, 16.6);
    cokgen(ctx, Rc.map(g), { renk: 'turkuaz', dolgu: 0.42, kalinlik: 2.5, parilti: 0.9, alfa: ta });
    cokgen(ctx, Rb.map(g), { renk: 'mercan', dolgu: 0.38, kalinlik: 2.5, parilti: 0.9, alfa: ta });
    // alan etiketleri (gerçek hesap)
    const ac = alan(Rc), ab = alan(Rb);
    E.formul(ctx, tx(ac, 0), g(agirlik(Rc))[0], g(agirlik(Rc))[1], { boyut: 34, alfa: ta, parilti: 0.3 });
    E.formul(ctx, tx(ab, 0), g(agirlik(Rb))[0], g(agirlik(Rb))[1], { boyut: 34, alfa: ta, parilti: 0.3 });
    // üçgen en üstte
    cokgen(ctx, [A, B, C].map(g), { renk: 'tebesir', kalinlik: 3, parilti: 0.8, dolgu: 0.5, dolguRenk: 'gece', alfa: ta });
    dikKare(ctx, g(A), g(B), g(C), 12, { alfa: ta });
    E.formul(ctx, 'p', g([p / 2, 0])[0], g([p / 2, 0])[1] + 26, { boyut: 26, renk: 'gok', alfa: ara(t, 2.0, 2.6) * (1 - bitti) });
    E.formul(ctx, 'k', g([p + k / 2, 0])[0], g([p + k / 2, 0])[1] + 26, { boyut: 26, renk: 'menekse', alfa: ara(t, 2.0, 2.6) * (1 - bitti) });
    // kesme kılavuzları: kayan kenarın doğrusu
    const kil = (K, f, renk) => { if (f > 0 && f < 1) E.cizgi(ctx, [g(topla(K[3], kat(fark(K[2], K[3]), -1.2))), g(topla(K[2], kat(fark(K[2], K[3]), 1.2)))], { renk, kalinlik: 1.5, kesik: [3, 6], alfa: 0.7 }); };
    kil(Kc, fc[0], 'turkuaz'); kil(Kb, fb[0], 'mercan');
    // yerleşince parlama
    E.isik(ctx, g([p / 2, -a / 2])[0], g([p / 2, -a / 2])[1], 160, 'turkuaz', 0.5 * E.nabiz(t, 9.8, 0.9));
    E.isik(ctx, g([p + k / 2, -a / 2])[0], g([p + k / 2, -a / 2])[1], 220, 'mercan', 0.5 * E.nabiz(t, 15.9, 0.9));
    if (bitti > 0) {
      E.isik(ctx, g([a / 2, -a / 2])[0], g([a / 2, -a / 2])[1], a * sc * 1.3, 'limon', 0.4 * E.nabiz(t, 16.2, 1.6));
      cokgen(ctx, KARE_A.map(g), { renk: 'limon', kalinlik: 4, parilti: 1.4, alfa: bitti });
      E.formul(ctx, '25', g([a / 2, -a - 0.02])[0], g([a / 2, -a])[1] + 34, { boyut: 30, renk: 'limon', alfa: bitti });
    }
    // metin
    const sx = H ? 700 : L.cx, sh = H ? 'left' : 'center';
    if (H) {
      E.yazi(ctx, 'PİSAGOR', sx, ic.y + 20, { boyut: 24, agirlik: 700, harfAra: 6, renk: 'turkuaz', hiza: sh, alfa: ara(t, 0.4, 1.0) });
      E.yazi(ctx, 'Kesme ve kaydırma alanı değiştirmez.', sx, ic.y + 70, { boyut: 28, agirlik: 600, hiza: sh, alfa: ara(t, 3.6, 4.2) * (1 - ara(t, 16.4, 16.9)), maxGen: 480 });
      E.formul(ctx, 'c^{2} = p · a \\quad b^{2} = k · a', sx, ic.y + 140, { boyut: 34, hiza: sh, alfa: ara(t, 9.8, 10.4) * (1 - ara(t, 16.4, 16.9)) });
      E.formul(ctx, '\\kutu{limon}{a^{2} = b^{2} + c^{2}}', sx, ic.y + 90, { boyut: 46, hiza: sh, alfa: ara(t, 16.6, 17.2), parilti: 0.4, parRenk: 'limon' });
      const cebir = ['c^{2} + b^{2} = p · a + k · a', '= a · (p + k)', '= a · a = a^{2}'];
      cebir.forEach((f, i) => E.formul(ctx, f, sx + (i ? 40 : 0), ic.y + 200 + i * 62, { boyut: 34, hiza: sh, alfa: ara(t, 18.4 + i * 1.3, 19.0 + i * 1.3) }));
      E.formul(ctx, '9 + 16 = 25', sx, ic.y + 420, { boyut: 34, hiza: sh, renk: 'gumus', alfa: ara(t, 22.0, 22.6) });
    } else {
      const y0 = ic.y1 - 116;
      E.yazi(ctx, 'Kesme ve kaydırma alanı değiştirmez.', sx, y0, { boyut: 28, agirlik: 600, hiza: sh, alfa: ara(t, 3.6, 4.2) * (1 - ara(t, 9.6, 10.0)), maxGen: 620 });
      E.formul(ctx, 'c^{2} = p · a \\quad b^{2} = k · a', sx, y0, { boyut: 32, hiza: sh, alfa: ara(t, 10.0, 10.5) * (1 - ara(t, 16.2, 16.6)) });
      E.formul(ctx, '\\kutu{limon}{a^{2} = b^{2} + c^{2}}', sx, y0, { boyut: 42, hiza: sh, alfa: ara(t, 16.6, 17.2) * (1 - ara(t, 18.0, 18.4)), parilti: 0.4, parRenk: 'limon' });
      E.formul(ctx, 'c^{2} + b^{2} = pa + ka = a(p + k) = a^{2}', sx, y0, { boyut: 30, hiza: sh, alfa: ara(t, 18.4, 19.2), aciga: ara(t, 18.4, 21.0, 'lin') });
      E.formul(ctx, '9 + 16 = 25', sx, y0 + 60, { boyut: 32, hiza: sh, renk: 'limon', alfa: ara(t, 21.6, 22.2) });
    }
  };

  /* ---------- 5. Dar ve geniş açı ---------- */
  const darGenis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc = H ? 50 : 54;
    const tepe = H ? [ic.x + 300, ic.y + 40] : [L.cx, ic.y + 30];
    const th = kf(t, [[1.6, 90], [4.0, 115], [6.0, 115], [8.6, 65], [10.6, 65], [12.4, 90]]) * D;
    const g = (P) => [tepe[0] + P[0] * sc, tepe[1] - P[1] * sc];
    const Ap = [0, 0];
    const Bp = [-3 * Math.sin(th / 2), -3 * Math.cos(th / 2)], Cp = [4 * Math.sin(th / 2), -4 * Math.cos(th / 2)];
    const BC = fark(Cp, Bp), aa = Math.hypot(...BC);
    let n = birim([BC[1], -BC[0]]);
    if (n[1] > 0) n = [-n[0], -n[1]]; // aşağı (A'dan uzak)
    const Kr = [Bp, Cp, topla(Cp, kat(n, aa)), topla(Bp, kat(n, aa))];
    const a2 = aa * aa, ref = 25;
    const durum = a2 > ref + 0.3 ? 1 : a2 < ref - 0.3 ? -1 : 0;
    const renk = durum > 0 ? 'mercan' : durum < 0 ? 'gok' : 'limon';
    const ta = ara(t, 0.1, 0.9);
    cokgen(ctx, Kr.map(g), { renk, dolgu: 0.22, kalinlik: 2.5, parilti: 0.8, alfa: ta });
    E.formul(ctx, 'a^{2} ≈ ' + tx(a2, 1), g(agirlik(Kr))[0], g(agirlik(Kr))[1], { boyut: 32, renk: 'tebesir', alfa: ta });
    cokgen(ctx, [Ap, Bp, Cp].map(g), { renk: 'tebesir', kalinlik: 3, parilti: 0.8, dolgu: 0.08, dolguRenk: 'gok', alfa: ta });
    aci(ctx, g(Ap), g(Bp), g(Cp), 30, { renk, alfa: ta });
    E.formul(ctx, Math.round(th / D) + '°', g(Ap)[0], g(Ap)[1] + 52, { boyut: 26, renk, alfa: ta });
    const G = g(agirlik([Ap, Bp, Cp]));
    const et = (P, Q, m, rk) => { const [x, y] = kenarYer(g(P), g(Q), G, 22); E.formul(ctx, m, x, y, { boyut: 28, renk: rk, alfa: ta }); };
    et(Ap, Bp, '3', 'turkuaz'); et(Ap, Cp, '4', 'mercan');
    // çubuk karşılaştırma
    const bx = H ? 700 : ic.x + 30, by = H ? ic.y + 230 : ic.y + 560, bs = H ? 12 : 15;
    E.yazi(ctx, 'b² + c² = 16 + 9 = 25', bx, by - 50, { boyut: 26, agirlik: 560, renk: 'gumus', hiza: 'left', alfa: ara(t, 1.0, 1.6) });
    E.panel(ctx, bx, by - 20, ref * bs, 34, { r: 8, renk: 'limon', dolguAlfa: 0.12, kenar: 'limon', kalinlik: 2, alfa: ara(t, 1.0, 1.6) });
    E.panel(ctx, bx, by + 30, a2 * bs, 34, { r: 8, renk, dolguAlfa: 0.6, kenar: null, alfa: ara(t, 1.2, 1.8) });
    E.cizgi(ctx, [[bx + ref * bs, by - 30], [bx + ref * bs, by + 74]], { renk: 'limon', kalinlik: 2, kesik: [4, 4], alfa: ara(t, 1.0, 1.6) });
    E.yazi(ctx, 'a²', bx - 12, by + 47, { boyut: 26, agirlik: 600, hiza: 'right', alfa: ara(t, 1.2, 1.8) });
    const metin = durum > 0 ? 'geniş açı: a² > b² + c²' : durum < 0 ? 'dar açı: a² < b² + c²' : 'dik açı: a² = b² + c²';
    E.yazi(ctx, metin, bx, by + 130, { boyut: H ? 34 : 34, agirlik: 700, renk, hiza: 'left', alfa: ara(t, 1.6, 2.2), parilti: 0.2 });
    E.yazi(ctx, 'SONUÇ', bx, H ? ic.y + 30 : ic.y + 470, { boyut: 24, agirlik: 700, harfAra: 6, renk: 'turkuaz', hiza: 'left', alfa: ara(t, 0.3, 0.9) });
    E.yazi(ctx, 'Açı 90°’den saparsa eşitlik bozulur.', bx, H ? ic.y + 80 : ic.y + 504 - 0, { boyut: 26, agirlik: 520, renk: 'gumus', hiza: 'left', alfa: ara(t, 0.6, 1.2), maxGen: H ? 470 : 620 });
  };

  /* ---------- 6–7. Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Tales: paraleller, kesenleri orantılı böler.', formul: '\\frac{|AB|}{|BC|} = \\frac{|DE|}{|EF|}' },
    { tr: 'Öklid: benzer üçgenlerden üç bağıntı.', formul: 'h^{2} = pk,\\; c^{2} = pa,\\; b^{2} = ka' },
    { tr: 'Pisagor: alan kaybolmaz.', formul: 'a^{2} = b^{2} + c^{2}' },
    { tr: 'Geniş açıda büyük, dar açıda küçük.', formul: 'a^{2} > b^{2} + c^{2} \\;\\; / \\;\\; a^{2} < b^{2} + c^{2}' },
  ], { aralik: 1.6 });
  /** Yerel bitiş kartı: motorun bitisKarti'si iki satırlık laboratuvar adında açıklamayla çakışıyor */
  const bitis = (ctx, s) => {
    const L = E.L, t = s.t, ic = L.icerik, H = E.yatay;
    const a1 = ara(t, 0, 0.9, 'cik3'), a2 = ara(t, 0.5, 1.4, 'cik3'), a3 = ara(t, 1.0, 1.9, 'cik3');
    const qrBoy = H ? 230 : 250;
    const qx = H ? L.cx + 190 : L.cx - qrBoy / 2, qy = H ? ic.y + 90 : ic.y + 340;
    const tx0 = H ? ic.x + 60 : L.cx, hz = H ? 'left' : 'center', gen = H ? 560 : 620;
    let y = H ? ic.y + 80 : ic.y + 20;
    E.yazi(ctx, 'ŞİMDİ SEN DENE', tx0, y, { boyut: 26, agirlik: 700, harfAra: 6, renk: 'turkuaz', hiza: hz, alfa: a1, taban: 'top' });
    y += 54;
    const r = E.yazi(ctx, meta.labAd, tx0, y, { boyut: H ? 50 : 46, agirlik: 760, hiza: hz, alfa: a1, maxGen: gen, satirAra: 1.08, taban: 'top' });
    y += r.h + 22;
    E.yazi(ctx, meta.labAciklama, tx0, y, { boyut: 26, agirlik: 460, renk: 'gumus', hiza: hz, alfa: a2, maxGen: gen, taban: 'top' });
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
    sure: 113.5,
    sahneler: [
      { ad: 'Soğuk açılış: 9 + 16 = 25', bas: 0, son: 11.5, giris: 0, cikis: 0.7, ciz: acilis },
      { ad: 'İmza', bas: 11.2, son: 14.9, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 14.6, son: 18.9, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Tales: paraleller ve orantı', bas: 18.6, son: 39.0, ciz: tales },
      { ad: 'Öklid: üç bağıntı', bas: 38.7, son: 59.0, ciz: oklid },
      { ad: 'Pisagor: kaybolmayan alan', bas: 58.7, son: 83.0, ciz: pisagor },
      { ad: 'Dar ve geniş açı', bas: 82.7, son: 97.0, ciz: darGenis },
      { ad: 'Aklında kalsın', bas: 96.7, son: 107.2, ciz: ozet },
      { ad: 'Laboratuvar', bas: 107.0, son: 113.5, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 5, renk1: 'turkuaz', renk2: 'menekse' }),
  });
})();
