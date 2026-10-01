/* ==========================================================================
   EKSEN 9.4.3 — Üçgenin İçindeki Üçgenler
   Tek fikir: Bir üçgenin içinden benzer üçgenler "doğurmak" için iki çizim
   yeter: bir kenara paralel bir doğru ya da dik üçgende hipotenüse yükseklik.
   Yükseklik tekrar tekrar indirilince dikdörtgen bir sarmal oluşur; her iki
   adımda şekil 0,48 katına küçülür ve çeyrek tur döner (sonsuz yakınlaşma).
   Tüm noktalar gerçek koordinatlarla hesaplanır (dikme ayağı, paralel kesişim).
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp } = E;
  const D = Math.PI / 180;

  const meta = {
    kod: 'MAT.9.4.3',
    tema: 'Eşlik ve Benzerlik',
    ad: 'Üçgenin İçindeki Üçgenler',
    adEn: 'Triangles Within a Triangle',
    labAd: 'Dönüşüm ve Benzerlik Laboratuvarı',
    labAciklama: 'Tales paralelini kaydır, dik üçgende yüksekliği indir: oluşan benzer üçgenlerin oranlarını anında gör.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-donusumler/',
  };

  /* ---------- Geometri yardımcıları (matematik koordinatı: y yukarı) ---------- */
  const uzak = (P, Q) => Math.hypot(Q[0] - P[0], Q[1] - P[1]);
  const topla = (P, Q) => [P[0] + Q[0], P[1] + Q[1]];
  const fark = (P, Q) => [P[0] - Q[0], P[1] - Q[1]];
  const kat = (P, k) => [P[0] * k, P[1] * k];
  const ara2 = (P, Q, k) => [lerp(P[0], Q[0], k), lerp(P[1], Q[1], k)];
  const agirlik = (Ps) => [Ps.reduce((s, p) => s + p[0], 0) / Ps.length, Ps.reduce((s, p) => s + p[1], 0) / Ps.length];
  /** R noktasından SL doğrusuna dikmenin ayağı */
  const dikmeAyagi = (R, S, L) => {
    const d = fark(L, S), t = ((R[0] - S[0]) * d[0] + (R[1] - S[1]) * d[1]) / (d[0] * d[0] + d[1] * d[1]);
    return topla(S, kat(d, t));
  };
  /** Üç nokta arasındaki açı (V köşesinde), derece */
  const aciDer = (V, P, Q) => {
    const a = fark(P, V), b = fark(Q, V);
    return Math.acos(clamp((a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b)), -1, 1)) / D;
  };
  /* Karmaşık sayı (benzerlik dönüşümleri için) */
  const kc = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const kb = (a, b) => { const n = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / n, (a[1] * b[0] - a[0] * b[1]) / n]; };
  /** Dik üçgen temsili: R dik köşe, th = R→S yönü, s = |RS|, m = ±1 (L, S yönünün +90° mı −90° mı tarafında);
      |RL| = s·oran (3-4-5 için 4/3). m'nin 0'dan geçmesi "takla" gibi görünür. */
  const temsil = (R, S, L) => {
    const u = fark(S, R), v = fark(L, R);
    return { R, th: Math.atan2(u[1], u[0]), s: Math.hypot(...u), m: Math.sign(u[0] * v[1] - u[1] * v[0]), q: Math.hypot(...v) / Math.hypot(...u) };
  };
  const temsilNokta = (T) => {
    const c = Math.cos(T.th), s = Math.sin(T.th);
    const S = [T.R[0] + T.s * c, T.R[1] + T.s * s];
    const L = [T.R[0] + T.s * T.q * T.m * -s, T.R[1] + T.s * T.q * T.m * c];
    return [T.R, S, L];
  };
  const temsilAra = (A, B, f, mf = f) => {
    let d = B.th - A.th;
    while (d > Math.PI) d -= E.TAU;
    while (d < -Math.PI) d += E.TAU;
    return { R: ara2(A.R, B.R, f), th: A.th + d * f, s: lerp(A.s, B.s, f), m: lerp(A.m, B.m, mf), q: lerp(A.q, B.q, f) };
  };
  const harita = (ox, oy, s) => { const f = (P) => [ox + P[0] * s, oy - P[1] * s]; f.s = s; return f; };
  const sayi = (v, b = 2) => E.sayiYaz(v, b);

  /* ---------- Çizim yardımcıları (ekran) ---------- */
  const ucgen = (ctx, P, o = {}) => {
    const a = o.alfa ?? 1;
    if (a <= 0.002) return;
    if (o.dolgu) E.cokgen(ctx, P, { renk: o.dolguRenk || o.renk, alfa: o.dolgu * a });
    if ((o.kalinlik ?? 3) > 0.05) E.cizgi(ctx, P, { renk: o.renk || 'tebesir', kalinlik: o.kalinlik ?? 3, parilti: o.parilti ?? 0.8, kapali: true, p: o.p ?? 1, alfa: a, kesik: o.kesik });
  };
  const aci = (ctx, V, P1, P2, r, o = {}) => {
    const a0 = Math.atan2(P1[1] - V[1], P1[0] - V[0]);
    let d = Math.atan2(P2[1] - V[1], P2[0] - V[0]) - a0;
    while (d > Math.PI) d -= E.TAU;
    while (d < -Math.PI) d += E.TAU;
    E.aciYayi(ctx, V[0], V[1], r, a0, a0 + d, Object.assign({ kalinlik: 2.5, dolgu: 0.18 }, o));
  };
  /** Dik açı karesi (ekran): R köşesinde RS ve RL yönlerinde */
  const dikKare = (ctx, R, S, L, b, o = {}) => {
    const u = fark(S, R), v = fark(L, R), nu = Math.hypot(...u) || 1, nv = Math.hypot(...v) || 1;
    const a = [R[0] + (u[0] / nu) * b, R[1] + (u[1] / nu) * b], c = [R[0] + (v[0] / nv) * b, R[1] + (v[1] / nv) * b];
    E.cizgi(ctx, [a, [a[0] + c[0] - R[0], a[1] + c[1] - R[1]], c], Object.assign({ renk: 'limon', kalinlik: 2 }, o));
  };
  const kenarYer = (P1, P2, ref, d) => {
    const m = [(P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2];
    let n = [-(P2[1] - P1[1]), P2[0] - P1[0]];
    const nn = Math.hypot(...n) || 1; n = [n[0] / nn, n[1] / nn];
    if ((m[0] - ref[0]) * n[0] + (m[1] - ref[1]) * n[1] < 0) n = [-n[0], -n[1]];
    return [m[0] + n[0] * d, m[1] + n[1] * d];
  };
  const koseEt = (ctx, V, G, ad, o = {}) => {
    const u = fark(V, G), n = Math.hypot(...u) || 1, d = o.d || 28;
    E.formul(ctx, ad, V[0] + (u[0] / n) * d, V[1] + (u[1] / n) * d, { boyut: o.boyut || 28, renk: o.renk || 'gumus', alfa: o.alfa ?? 1 });
  };
  /** Paralellik işareti: doğru üzerinde ">" */
  const paralelIsaret = (ctx, P, Q, o = {}) => {
    const m = ara2(P, Q, 0.5), u = fark(Q, P), n = Math.hypot(...u) || 1, d = [u[0] / n, u[1] / n], b = o.b || 9;
    for (const k of o.cift ? [-5, 5] : [0]) {
      const c = [m[0] + d[0] * k, m[1] + d[1] * k];
      E.cizgi(ctx, [[c[0] - d[0] * b - d[1] * b, c[1] - d[1] * b + d[0] * b], [c[0], c[1]], [c[0] - d[0] * b + d[1] * b, c[1] - d[1] * b - d[0] * b]], { renk: o.renk || 'limon', kalinlik: 2.5, alfa: o.alfa ?? 1 });
    }
  };
  const baslik = (ctx, x, y, kisa, aciklama, o = {}) => {
    const al = o.alfa ?? 1;
    E.formul(ctx, kisa, x, y, { boyut: o.boyut || 44, hiza: o.hiza || 'left', alfa: al, parilti: 0.2 });
    if (aciklama) E.yazi(ctx, aciklama, x, y + (o.ara || 46), { boyut: o.aBoyut || 26, renk: 'gumus', agirlik: 520, hiza: o.hiza || 'left', alfa: al, maxGen: o.maxGen });
  };

  /* ---------- Ana dik üçgen (3-4-5, A dik köşe) ve sarmal dizisi ---------- */
  const B0 = [0, 0], C0 = [5, 0];
  const H0 = [1.8, 0];
  const A0 = [1.8, Math.sqrt(1.8 * 3.2)]; // h² = p·k ⇒ h = 2,4
  /** Sarmal: T_{n+1} sırayla L-parçası (oran 0,8) ve S-parçası (oran 0,6) */
  const SARMAL = (() => {
    const liste = [];
    let T = [A0, B0, C0]; // [R, S, L]
    for (let n = 0; n < 64; n++) {
      const [R, S, L] = T;
      const F = dikmeAyagi(R, S, L);
      const tut = n % 2 === 0 ? [F, R, L] : [F, S, R];
      const at = n % 2 === 0 ? [F, S, R] : [F, R, L];
      liste.push({ T, F, at, tut });
      T = tut;
    }
    // İki adımlık benzerlik z → a·z + b ve sabit nokta
    const T0 = liste[0].T, T2 = liste[2].T;
    const a = kb(fark(T2[1], T2[0]), fark(T0[1], T0[0]));
    const b = fark(T2[0], kc(a, T0[0]));
    const F = kb(b, [1 - a[0], -a[1]]);
    return { liste, a, F, olcek: Math.hypot(...a), donme: Math.atan2(a[1], a[0]) };
  })();
  const RENKLER = ['turkuaz', 'gok', 'menekse', 'mercan'];

  /* ---------- 1. Soğuk açılış: parçalar büyük üçgene oturur ---------- */
  const acilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc = H ? 96 : 104;
    const merk = H ? [L.cx, ic.cy + 50] : [L.cx, ic.y + 400];
    // kamera: sonda sarmalın sabit noktasına yaklaş
    const z = kf(t, [[0, 1.06], [6.8, 1.0], [11.6, H ? 1.55 : 1.3, 'io2']]);
    const odak = ara2([2.5, 1.2], SARMAL.F, ara(t, 6.8, 11.0, 'io2'));
    const g = (P) => [merk[0] + (P[0] - odak[0]) * sc * z, merk[1] - (P[1] - odak[1]) * sc * z];
    const big = [A0, B0, C0];
    const bp = ara(t, 0.2, 1.5);
    ucgen(ctx, big.map(g), { renk: 'tebesir', kalinlik: 3, parilti: 0.9, p: bp, dolgu: 0.06 * ara(t, 1.0, 1.6), dolguRenk: 'gok' });
    const yp = ara(t, 1.5, 2.6);
    if (t < 7.2) {
      E.cizgi(ctx, [g(A0), g(ara2(A0, H0, yp))], { renk: 'limon', kalinlik: 3.5, parilti: 1.1, alfa: 1 - ara(t, 6.6, 7.2) });
      if (yp >= 1) dikKare(ctx, g(H0), g(B0), g(A0), 14, { alfa: ara(t, 2.5, 2.9) * (1 - ara(t, 3.2, 3.6)) });
    }
    // köşe adları
    const ka = ara(t, 0.6, 1.2) * (1 - ara(t, 6.4, 7.0));
    const G = g(agirlik(big));
    koseEt(ctx, g(A0), G, 'A', { alfa: ka }); koseEt(ctx, g(B0), G, 'B', { alfa: ka }); koseEt(ctx, g(C0), G, 'C', { alfa: ka });
    E.formul(ctx, 'H', g(H0)[0], g(H0)[1] + 30, { boyut: 28, renk: 'limon', alfa: ara(t, 2.4, 2.9) * (1 - ara(t, 3.2, 3.6)) });
    // parçalar uçar
    const hedef = temsil(A0, B0, C0);
    const parcalar = [
      { T: temsil(H0, B0, A0), renk: 'turkuaz', t0: 3.4, t1: 5.2, it: [-0.3, 0] },
      { T: temsil(H0, A0, C0), renk: 'mercan', t0: 4.6, t1: 6.6, it: [0.3, 0] },
    ];
    const pa = ara(t, 2.8, 3.3) * (1 - ara(t, 6.9, 7.5));
    for (const p of parcalar) {
      if (pa <= 0) continue;
      const ay = ara(t, 2.9, 3.3) * (1 - ara(t, p.t0, p.t0 + 0.4));
      const f = ara(t, p.t0, p.t1, 'io3'), mf = ara(t, p.t0 + 0.3, p.t1 - 0.3, 'io2');
      const T = temsilAra(p.T, hedef, f, mf);
      T.R = topla(T.R, topla(kat(p.it, ay), [0, 0.9 * Math.sin(Math.PI * f)]));
      const P = temsilNokta(T).map(g);
      ucgen(ctx, P, { renk: p.renk, dolgu: 0.28, kalinlik: 2.5, parilti: 0.9, alfa: pa });
      E.isik(ctx, agirlik(P)[0], agirlik(P)[1], 260, p.renk, 0.45 * E.nabiz(t, p.t1 - 0.1, 0.9));
    }
    // sarmal (alt bölünmeler)
    const sa = ara(t, 6.9, 7.4);
    if (sa > 0) {
      SARMAL.liste.slice(0, 10).forEach((st, n) => {
        const a = ara(t, 7.0 + n * 0.42, 7.4 + n * 0.42);
        if (a <= 0) return;
        ucgen(ctx, st.at.map(g), { renk: RENKLER[n % 4], dolgu: 0.3, kalinlik: 1.5, parilti: 0.5, alfa: a * sa });
        E.cizgi(ctx, [g(st.T[0]), g(st.F)], { renk: 'limon', kalinlik: 3, parilti: 1.1, alfa: sa, p: a });
      });
    }
    // Soru
    const qa = ara(t, 8.6, 9.4, 'cik3');
    E.yazi(ctx, 'Hepsi aynı şekil.', L.cx, H ? ic.y + 30 : ic.y + 40, { boyut: H ? 46 : 46, agirlik: 760, alfa: qa, parilti: 0.3, parRenk: 'limon' });
  };

  /* ---------- 2. Elimizdeki araçlar ---------- */
  const araclar = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    E.yazi(ctx, 'Benzer üçgen nasıl üretilir?', L.cx, ic.y + (H ? 40 : 30), { boyut: H ? 42 : 38, agirlik: 720, alfa: ara(t, 0.2, 0.9) });
    const kartlar = [
      { kisa: '\\t{AA}', ac: 'iki açı eşit', tur: 0 },
      { kisa: '\\t{KKK}\\,∼', ac: 'üç kenar orantılı', tur: 1 },
      { kisa: '\\t{KAK}\\,∼', ac: 'iki kenar orantılı + aradaki açı', tur: 2 },
    ];
    const sec = ara(t, 4.2, 4.9);
    kartlar.forEach((k, i) => {
      const a = ara(t, 0.6 + i * 0.35, 1.3 + i * 0.35, 'cik3');
      const vurgu = i === 0 ? sec : 0, sonuk = i === 0 ? 1 : 1 - 0.55 * sec;
      const w = H ? 330 : ic.w - 40, h = H ? 250 : 176;
      const x = H ? L.cx - 525 + i * 360 : ic.x + 20, y = H ? ic.y + 110 + (1 - a) * 20 : ic.y + 100 + i * 198 + (1 - a) * 20;
      E.panel(ctx, x, y, w, h, { alfa: a * sonuk, vurgu: vurgu > 0.5 ? 'limon' : 'turkuaz', kenar: vurgu > 0.5 ? 'limon' : 'sis', kalinlik: 1.5 + vurgu });
      if (vurgu > 0) E.isik(ctx, x + w / 2, y + h / 2, w * 0.8, 'limon', 0.14 * vurgu);
      const tx = H ? x + w / 2 : x + 30, hz = H ? 'center' : 'left';
      E.formul(ctx, k.kisa, tx, y + (H ? 44 : 46), { boyut: 40, hiza: hz, alfa: a * sonuk, renk: vurgu > 0.5 ? 'limon' : 'tebesir' });
      E.yazi(ctx, k.ac, tx, y + (H ? 210 : 110), { boyut: 24, agirlik: 520, renk: 'gumus', hiza: hz, alfa: a * sonuk, maxGen: H ? w - 30 : 300, taban: H ? 'middle' : 'top' });
      // simge: küçük ve büyük benzer üçgen
      const ox = H ? x + w / 2 - 105 : x + w - 220, oy = H ? y + 170 : y + 130;
      const tri = [[0, 0], [3, 0], [1, 1.8]];
      for (const [sk, dx] of [[16, 0], [26, 72]]) {
        const P = tri.map(([px, py]) => [ox + dx + px * sk, oy - py * sk]);
        ucgen(ctx, P, { renk: 'tebesir', kalinlik: 2, parilti: 0.3, dolgu: 0.12, dolguRenk: 'turkuaz', alfa: a * sonuk });
        if (k.tur === 0 || k.tur === 2) aci(ctx, P[0], P[1], P[2], 12, { renk: 'turkuaz', alfa: a * sonuk, kalinlik: 2 });
        if (k.tur === 0) aci(ctx, P[1], P[0], P[2], 10, { renk: 'mercan', alfa: a * sonuk, kalinlik: 2 });
        if (k.tur >= 1) {
          const kenarlar = k.tur === 1 ? [[0, 1], [1, 2], [2, 0]] : [[0, 1], [2, 0]];
          kenarlar.forEach(([u, v], j) => {
            const m = ara2(P[u], P[v], 0.5), d = fark(P[v], P[u]), n = Math.hypot(...d);
            const nn = [-d[1] / n * 5, d[0] / n * 5];
            for (let c = 0; c <= j; c++) { const o = [d[0] / n * (c * 4 - j * 2), d[1] / n * (c * 4 - j * 2)]; E.cizgi(ctx, [[m[0] + o[0] - nn[0], m[1] + o[1] - nn[1]], [m[0] + o[0] + nn[0], m[1] + o[1] + nn[1]]], { renk: 'limon', kalinlik: 2, alfa: a * sonuk }); }
          });
        }
      }
    });
    E.yazi(ctx, 'Çizimle en kolayı: açıları korumak', L.cx, H ? ic.y + 430 : ic.y + 726, { boyut: H ? 34 : 32, agirlik: 680, renk: 'limon', alfa: ara(t, 4.6, 5.3), parilti: 0.25, maxGen: ic.w - 20 });
  };

  /* ---------- 3. Paralel çizim: içte, dışta, kelebek ---------- */
  const PA = [1.6, 4], PB = [0, 0], PC = [6, 0];
  const paralel = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    // matematik kamerası
    const odak = kf(t, [[0, [3, 2]], [12.4, [3, 2]], [15.0, [3.3, 1.5]], [16.0, [3.3, 1.5]], [18.4, [2.4, 3.3]]]);
    const sc = kf(t, [[0, H ? 76 : 82], [12.4, H ? 76 : 82], [15.0, H ? 56 : 64], [16.0, H ? 56 : 64], [18.4, H ? 54 : 62]]);
    const ekr = H ? [ic.x + 330, ic.cy + 10] : [L.cx, ic.y + 250];
    const g = (P) => [ekr[0] + (P[0] - odak[0]) * sc, ekr[1] - (P[1] - odak[1]) * sc];
    // k: üçgen içi → dışı → (söner) → kelebek
    const k = t < 15.9
      ? kf(t, [[3.0, 0.45], [8.6, 0.45], [9.6, 0.85], [10.8, 0.25], [12.0, 0.6], [12.6, 0.6], [14.8, 1.35]])
      : -0.65;
    const kA = t < 15.9 ? ara(t, 1.4, 2.4) * (1 - ara(t, 15.2, 15.9)) : ara(t, 16.4, 17.2);
    const Dp = ara2(PA, PB, k), Ep = ara2(PA, PC, k);
    const G = g(agirlik([PA, PB, PC]));
    // uzantılar (dışarı / kelebek)
    const uz1 = ara(t, 12.6, 13.4) * (1 - ara(t, 15.4, 15.9)), uz2 = ara(t, 15.9, 16.6);
    if (uz1 > 0) for (const P of [PB, PC]) E.cizgi(ctx, [g(P), g(ara2(PA, P, 1.45))], { renk: 'gumus', kalinlik: 2, kesik: [6, 7], alfa: uz1 });
    if (uz2 > 0) for (const P of [PB, PC]) E.cizgi(ctx, [g(PA), g(ara2(PA, P, -0.78))], { renk: 'gumus', kalinlik: 2, kesik: [6, 7], alfa: uz2 });
    // ana üçgen
    const ta = ara(t, 0.1, 1.2);
    ucgen(ctx, [PA, PB, PC].map(g), { renk: 'tebesir', kalinlik: 3, parilti: 0.8, p: ta, dolgu: 0.05, dolguRenk: 'gok' });
    koseEt(ctx, g(PA), G, 'A', { alfa: t > 15.9 ? 0 : ta });
    if (t > 15.9) E.formul(ctx, 'A', g(PA)[0] + 30, g(PA)[1], { boyut: 28, renk: 'gumus', alfa: ta });
    koseEt(ctx, g(PB), G, 'B', { alfa: ta }); koseEt(ctx, g(PC), G, 'C', { alfa: ta });
    const aa = ara(t, 0.9, 1.5);
    aci(ctx, g(PB), g(PC), g(PA), 36, { renk: 'turkuaz', alfa: aa });
    aci(ctx, g(PC), g(PB), g(PA), 42, { renk: 'mercan', alfa: aa });
    // paralel doğru
    if (kA > 0) {
      const sol = topla(Dp, [-(t > 12.6 ? 1.2 : 1.6), 0]), sag = topla(Ep, [t > 12.6 ? 1.2 : 1.6, 0]);
      E.cizgi(ctx, [g(sol), g(sag)], { renk: 'limon', kalinlik: 1.5, alfa: kA * 0.45, p: ara(t, 1.4, 2.4) });
      const sa = kA * ara(t, 2.6, 3.4);
      ucgen(ctx, [PA, Dp, Ep].map(g), { renk: 'turkuaz', dolgu: 0.22, kalinlik: 0, alfa: sa });
      E.cizgi(ctx, [g(Dp), g(Ep)], { renk: 'limon', kalinlik: 4, parilti: 1.1, alfa: sa });
      E.nokta(ctx, g(Dp)[0], g(Dp)[1], 6, { renk: 'limon', alfa: sa });
      E.nokta(ctx, g(Ep)[0], g(Ep)[1], 6, { renk: 'limon', alfa: sa });
      const dE = t > 15.9 ? -1 : 1, la = sa * clamp((Math.abs(k - 1) - 0.2) / 0.1);
      E.formul(ctx, 'D', g(Dp)[0] - 24 * dE, g(Dp)[1] - 20 * dE, { boyut: 28, renk: 'limon', alfa: la });
      E.formul(ctx, 'E', g(Ep)[0] + 24 * dE, g(Ep)[1] - 20 * dE, { boyut: 28, renk: 'limon', alfa: la });
      paralelIsaret(ctx, g(Dp), g(Ep), { alfa: sa * ara(t, 3.6, 4.2) });
      paralelIsaret(ctx, g(PB), g(PC), { alfa: sa * ara(t, 3.6, 4.2) });
      // yöndeş / iç ters açılar
      const ya = sa * ara(t, 4.4, 5.2);
      aci(ctx, g(Dp), g(Ep), g(PA), 30, { renk: 'turkuaz', alfa: ya, parilti: 0 });
      aci(ctx, g(Ep), g(Dp), g(PA), 34, { renk: 'mercan', alfa: ya });
      E.isik(ctx, g(Dp)[0], g(Dp)[1], 90, 'turkuaz', 0.5 * E.nabiz(t, 4.6, 0.9));
      E.isik(ctx, g(PB)[0], g(PB)[1], 90, 'turkuaz', 0.5 * E.nabiz(t, 4.6, 0.9));
      E.isik(ctx, g(Ep)[0], g(Ep)[1], 90, 'mercan', 0.5 * E.nabiz(t, 5.0, 0.9));
      E.isik(ctx, g(PC)[0], g(PC)[1], 90, 'mercan', 0.5 * E.nabiz(t, 5.0, 0.9));
      if (t > 15.9) aci(ctx, g(PA), g(Dp), g(Ep), 26, { renk: 'menekse', alfa: ya });
      if (t > 15.9) aci(ctx, g(PA), g(PB), g(PC), 26, { renk: 'menekse', alfa: ya });
    }
    // metin sütunu
    const sx = H ? 760 : L.cx, sh = H ? 'left' : 'center';
    const s0 = H ? ic.y + 40 : ic.y + 520;
    baslik(ctx, sx, s0, '\\c{limon}{DE} \\;∥\\; BC', null, { hiza: sh, alfa: ara(t, 1.6, 2.3), boyut: 40 });
    E.formul(ctx, '\\triangle ADE \\sim \\triangle ABC', sx, s0 + (H ? 64 : 58), { boyut: 36, hiza: sh, alfa: ara(t, 5.2, 5.9) });
    E.yazi(ctx, 'yöndeş açılar eşit (AA)', sx, s0 + (H ? 116 : 106), { boyut: 26, agirlik: 520, renk: 'gumus', hiza: sh, alfa: ara(t, 5.5, 6.1) * (1 - ara(t, 15.4, 15.9)) });
    E.yazi(ctx, 'iç ters açılar eşit (AA)', sx, s0 + (H ? 116 : 106), { boyut: 26, agirlik: 520, renk: 'gumus', hiza: sh, alfa: ara(t, 17.0, 17.6) });
    const ka = ara(t, 6.4, 7.1);
    const kStr = sayi(Math.abs(k), 2);
    E.formul(ctx, 'k = \\frac{|AD|}{|AB|} = \\frac{|DE|}{|BC|} = \\c{limon}{' + kStr.replace(',', '{,}') + '}', sx, s0 + (H ? 200 : 180), { boyut: H ? 36 : 34, hiza: sh, alfa: ka * (t > 15.9 ? ara(t, 16.6, 17.2) : 1 - ara(t, 15.3, 15.8)) });
    const durum = t < 12.6 ? 'üçgenin içinde · k < 1' : t < 15.9 ? 'üçgenin dışında · k > 1' : 'kelebek: ters yönde benzer';
    const da = t < 12.6 ? ara(t, 7.0, 7.6) * (1 - ara(t, 12.2, 12.6)) : t < 15.9 ? ara(t, 13.2, 13.8) * (1 - ara(t, 15.3, 15.8)) : ara(t, 17.4, 18.0);
    E.yazi(ctx, durum, sx, s0 + (H ? 290 : 262), { boyut: H ? 30 : 30, agirlik: 640, renk: t < 15.9 ? 'turkuaz' : 'menekse', hiza: sh, alfa: da, maxGen: H ? 440 : 620 });
  };

  /* ---------- 4. Paralel olmasa? ---------- */
  const paralelDegil = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc = H ? 78 : 84;
    const g = harita(H ? ic.x + 80 : L.cx - 3 * sc, H ? ic.y + 430 : ic.y + 400, sc);
    const k1 = 0.5;
    const k2 = kf(t, [[1.6, 0.5], [3.4, 0.7], [6.8, 0.7], [8.4, 0.5]]);
    const Dp = ara2(PA, PB, k1), Ep = ara2(PA, PC, k2);
    const ta = ara(t, 0.0, 0.6);
    ucgen(ctx, [PA, PB, PC].map(g), { renk: 'tebesir', kalinlik: 3, parilti: 0.8, dolgu: 0.05, dolguRenk: 'gok', alfa: ta });
    const G = g(agirlik([PA, PB, PC]));
    koseEt(ctx, g(PA), G, 'A', { alfa: ta }); koseEt(ctx, g(PB), G, 'B', { alfa: ta }); koseEt(ctx, g(PC), G, 'C', { alfa: ta });
    const bozuk = clamp((k2 - 0.5) / 0.2);
    const renk = bozuk > 0.5 ? 'mercan' : 'limon';
    ucgen(ctx, [PA, Dp, Ep].map(g), { renk: bozuk > 0.5 ? 'mercan' : 'turkuaz', dolgu: 0.2, kalinlik: 0, alfa: ta });
    E.cizgi(ctx, [g(topla(Dp, kat(fark(Ep, Dp), -0.3))), g(topla(Ep, kat(fark(Ep, Dp), 0.3)))], { renk, kalinlik: 1.5, alfa: 0.45 * ta });
    E.cizgi(ctx, [g(Dp), g(Ep)], { renk, kalinlik: 4, parilti: 1, alfa: ta });
    E.formul(ctx, 'D', g(Dp)[0] - 26, g(Dp)[1] - 14, { boyut: 28, renk, alfa: ta });
    E.formul(ctx, 'E', g(Ep)[0] + 26, g(Ep)[1] - 14, { boyut: 28, renk, alfa: ta });
    // açılar (gerçek ölçüler)
    const aB = aciDer(PB, PA, PC), aD = aciDer(Dp, PA, Ep);
    aci(ctx, g(PB), g(PC), g(PA), 40, { renk: 'turkuaz', alfa: ta });
    aci(ctx, g(Dp), g(Ep), g(PA), 34, { renk: bozuk > 0.5 ? 'mercan' : 'turkuaz', alfa: ta });
    E.formul(ctx, Math.round(aB) + '°', g(PB)[0] + 64, g(PB)[1] - 22, { boyut: 26, renk: 'turkuaz', alfa: ta });
    E.formul(ctx, Math.round(aD) + '°', g(Dp)[0] + 58, g(Dp)[1] + 4 - 22 * (1 - bozuk), { boyut: 26, renk: bozuk > 0.5 ? 'mercan' : 'turkuaz', alfa: ta });
    // metin
    const sx = H ? 760 : L.cx, sh = H ? 'left' : 'center';
    const s0 = H ? ic.y + 50 : ic.y + 520;
    E.yazi(ctx, 'Paralel olmasa?', sx, s0, { boyut: 40, agirlik: 720, hiza: sh, alfa: ara(t, 0.3, 0.9) });
    const r1 = sayi(uzak(PA, Dp) / uzak(PA, PB), 1), r2 = sayi(uzak(PA, Ep) / uzak(PA, PC), 1);
    E.formul(ctx, '\\frac{|AD|}{|AB|} = ' + r1.replace(',', '{,}') + ' \\quad \\frac{|AE|}{|AC|} = ' + r2.replace(',', '{,}'), sx, s0 + (H ? 100 : 86), { boyut: 34, hiza: sh, alfa: ara(t, 2.0, 2.6) });
    E.formul(ctx, Math.round(aD) + '° \\ne ' + Math.round(aB) + '°', sx, s0 + (H ? 186 : 166), { boyut: 36, hiza: sh, renk: 'mercan', alfa: ara(t, 3.6, 4.2) * (1 - ara(t, 6.8, 7.3)) });
    E.yazi(ctx, '✗ benzerlik bozulur', sx, s0 + (H ? 256 : 230), { boyut: 32, agirlik: 700, hiza: sh, renk: 'mercan', alfa: ara(t, 4.4, 5.0) * (1 - ara(t, 6.8, 7.3)) });
    E.yazi(ctx, '✓ paralel: yine benzer', sx, s0 + (H ? 256 : 230), { boyut: 32, agirlik: 700, hiza: sh, renk: 'turkuaz', alfa: ara(t, 8.2, 8.8), parilti: 0.2 });
  };

  /* ---------- 5. Dik üçgende yükseklik: üç benzer üçgen ---------- */
  const dikYukseklik = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc = H ? 70 : 78;
    const g = H ? harita(ic.x + 50, ic.y + 236, sc) : harita(L.cx - 2.5 * sc, ic.y + 236, sc);
    const big = [A0, B0, C0];
    const ta = ara(t, 0.1, 1.2);
    const ghost = 1 - 0.65 * ara(t, 5.6, 6.6);
    ucgen(ctx, big.map(g), { renk: 'tebesir', kalinlik: 3, parilti: 0.8, p: ta, alfa: ghost });
    const yp = ara(t, 1.0, 2.0);
    E.cizgi(ctx, [g(A0), g(ara2(A0, H0, yp))], { renk: 'limon', kalinlik: 3.5, parilti: 1, alfa: ghost });
    if (yp > 0.98) { dikKare(ctx, g(H0), g(B0), g(A0), 12, { alfa: ghost }); dikKare(ctx, g(H0), g(C0), g(A0), 12, { alfa: ghost }); }
    dikKare(ctx, g(A0), g(B0), g(C0), 14, { alfa: ta * ghost });
    const G = g(agirlik(big));
    const ka = ta * ghost;
    koseEt(ctx, g(A0), G, 'A', { alfa: ka }); koseEt(ctx, g(B0), G, 'B', { alfa: ka }); koseEt(ctx, g(C0), G, 'C', { alfa: ka });
    E.formul(ctx, 'H', g(H0)[0], g(H0)[1] + 28, { boyut: 26, renk: 'limon', alfa: ara(t, 1.8, 2.3) * ghost });
    // açı renkleri: β = ∠B (turkuaz), γ = ∠C (mercan)
    const ra = ara(t, 2.4, 3.2) * ghost;
    aci(ctx, g(B0), g(C0), g(A0), 34, { renk: 'turkuaz', alfa: ra });
    aci(ctx, g(C0), g(B0), g(A0), 44, { renk: 'mercan', alfa: ra });
    aci(ctx, g(A0), g(B0), g(H0), 40, { renk: 'mercan', alfa: ara(t, 3.2, 3.9) * ghost });
    aci(ctx, g(A0), g(H0), g(C0), 30, { renk: 'turkuaz', alfa: ara(t, 3.6, 4.3) * ghost });

    // Sıra: üç üçgen aynı yönde (R sol alt, S yukarı, L sağa)
    const rs = H ? 70 : 46, gap = H ? 70 : 54;
    const ks = [0.6, 0.8, 1];
    const top = ks.reduce((a, k) => a + 4 * k * rs, 0) + gap * 2;
    const taban = H ? ic.y + 498 : ic.y + 548;
    let x = L.cx - top / 2;
    const kaynak = [temsil(H0, B0, A0), temsil(H0, A0, C0), temsil(A0, B0, C0)];
    const renkler = ['turkuaz', 'mercan', 'menekse'];
    const adlar = [['H', 'B', 'A'], ['H', 'A', 'C'], ['A', 'B', 'C']];
    ks.forEach((k, i) => {
      const hedefP = [[x, taban], [x, taban - 3 * k * rs], [x + 4 * k * rs, taban]];
      x += 4 * k * rs + gap;
      const t0 = 5.4 + i * 0.7;
      const f = ara(t, t0, t0 + 2.0, 'io3');
      if (f <= 0) return;
      const srcP = kaynak[i].R ? temsilNokta(kaynak[i]).map(g) : null;
      const A = temsil(...srcP), B = temsil(...hedefP);
      const T = temsilAra(A, B, f, ara(t, t0 + 0.3, t0 + 1.7, 'io2'));
      T.R = topla(T.R, [0, -60 * Math.sin(Math.PI * f)]);
      const P = temsilNokta(T);
      ucgen(ctx, P, { renk: renkler[i], dolgu: 0.22, kalinlik: 2.5, parilti: 0.7 });
      const ia = ara(t, t0 + 1.8, t0 + 2.4);
      aci(ctx, P[1], P[0], P[2], 22 + 6 * k, { renk: 'turkuaz', alfa: ia });
      aci(ctx, P[2], P[0], P[1], 30 + 8 * k, { renk: 'mercan', alfa: ia });
      dikKare(ctx, P[0], P[1], P[2], 11, { alfa: ia });
      // kenar uzunlukları
      const la = ara(t, 8.8 + i * 0.4, 9.4 + i * 0.4);
      const GP = agirlik(P);
      const et = (u, v, val, renk) => { const [ex, ey] = kenarYer(P[u], P[v], GP, 22); E.formul(ctx, sayi(val, 1).replace(',', '{,}'), ex, ey, { boyut: H ? 26 : 22, renk, alfa: la }); };
      et(0, 1, 3 * k, 'tebesir'); et(0, 2, 4 * k, 'tebesir'); et(1, 2, 5 * k, 'tebesir');
      // köşe adları (sağda/üstte küçük)
      const na = ara(t, t0 + 2.0, t0 + 2.6) * (1 - ara(t, 8.4, 8.8));
      koseEt(ctx, P[0], GP, adlar[i][0], { alfa: na, boyut: 24, d: 22 });
      koseEt(ctx, P[1], GP, adlar[i][1], { alfa: na, boyut: 24, d: 22 });
      koseEt(ctx, P[2], GP, adlar[i][2], { alfa: na, boyut: 24, d: 22 });
      E.formul(ctx, 'k = ' + sayi(k, 1).replace(',', '{,}'), P[1][0] + (H ? 60 : 30), P[1][1] - (H ? 6 : 26), { boyut: H ? 28 : 24, hiza: 'left', renk: 'limon', alfa: ara(t, 12.4 + i * 0.4, 13.0 + i * 0.4) });
    });
    // metin
    if (H) {
      const sx = 560;
      baslik(ctx, sx, ic.y + 40, '\\t{yükseklik } AH \\;⊥\\; BC', 'dik açıdan hipotenüse', { alfa: ara(t, 1.4, 2.1), boyut: 36 });
      E.formul(ctx, '\\triangle HBA \\sim \\triangle HAC \\sim \\triangle ABC', sx, ic.y + 170, { boyut: 34, hiza: 'left', alfa: ara(t, 7.6, 8.3) });
    } else {
      E.formul(ctx, '\\triangle HBA \\sim \\triangle HAC \\sim \\triangle ABC', L.cx, ic.y + 640, { boyut: 32, alfa: ara(t, 7.6, 8.3) });
      E.yazi(ctx, 'dik açıdan hipotenüse yükseklik', L.cx, ic.y + 720, { boyut: 28, agirlik: 560, renk: 'gumus', alfa: ara(t, 1.4, 2.1) * (1 - ara(t, 14.0, 14.6)) });
    }
    const sonA = ara(t, 14.8, 15.6);
    E.formul(ctx, '\\frac{|AH|}{|BH|} = \\frac{|HC|}{|AH|} = \\frac{4}{3}', H ? 560 : L.cx, H ? ic.y + 238 : ic.y + 724, { boyut: H ? 32 : 30, hiza: H ? 'left' : 'center', alfa: sonA, renk: 'limon' });
  };

  /* ---------- 6. Sürpriz: sonsuz sarmal ---------- */
  const sarmal = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc0 = H ? 96 : 118;
    const merk = H ? [ic.x + 380, ic.cy + 18] : [L.cx, ic.y + 470];
    const n0 = 1.0, hiz = 0.7; // adım/sn
    const nd = Math.max(0, (t - n0) / hiz * 1); // çizilen adım (sürekli)
    // u: iki adımlık birim cinsinden yakınlaşma
    const u = Math.max(0, (nd - 4) / 2);
    const z = Math.pow(SARMAL.olcek, -u), r = -SARMAL.donme * u;
    const cz = [z * Math.cos(r), z * Math.sin(r)];
    const F = SARMAL.F;
    const g = (P) => { const w = kc(fark(P, F), cz); return [merk[0] + w[0] * sc0, merk[1] - w[1] * sc0]; };
    const ga = ara(t, 0, 0.6) * (1 - ara(t, s.d - 0.8, s.d));
    ctx.save(); ctx.globalAlpha *= ga;
    // pencere: içerik kutusu (altyazı bölgesine taşmasın)
    E.yuvarlakDik(ctx, ic.x - 20, ic.y - 20, ic.w + 40, ic.h + 30, 24); ctx.clip();
    // ekranda çok büyüyen eski parçalar söner: hep ~6 basamak görünür (girdap)
    const son = (boy) => 1 - clamp((boy - (H ? 560 : 520)) / 420);
    const T0 = SARMAL.liste[0].T.map(g);
    ucgen(ctx, T0, { renk: 'tebesir', kalinlik: 2.5, parilti: 0.6, dolgu: 0.04, dolguRenk: 'gok', alfa: son(uzak(T0[1], T0[2])) });
    const yol = [];
    SARMAL.liste.forEach((st, n) => {
      const a = clamp(nd - n);
      if (a <= 0) return;
      const P = st.at.map(g);
      const boy = Math.max(uzak(P[1], P[2]), uzak(P[0], P[1]), uzak(P[0], P[2]));
      const p0 = g(st.T[0]), p1 = ara2(p0, g(st.F), a);
      yol.push([p0, p1, son(uzak(p0, g(st.F)) * 1.4)]);
      if (boy < 1.2) return;
      ucgen(ctx, P, { renk: 'tebesir', dolgu: 0.34, dolguRenk: RENKLER[n % 4], kalinlik: 1.2, parilti: 0.2, alfa: a * 0.9 * son(boy) });
    });
    for (const [p0, p1, al] of yol) if (al > 0.01 && uzak(p0, p1) > 0.5) E.cizgi(ctx, [p0, p1], { renk: 'limon', kalinlik: 3, parilti: 1.2, alfa: al });
    E.isik(ctx, merk[0], merk[1], 120, 'limon', 0.25 + 0.1 * Math.sin(t * 3));
    ctx.restore();
    // gösterge
    const adim = Math.floor(nd);
    const olc = Math.pow(0.8, Math.ceil(adim / 2)) * Math.pow(0.6, Math.floor(adim / 2));
    const px = H ? ic.x1 - 10 : ic.x + 10, hz = H ? 'right' : 'left';
    const py = H ? ic.y + 30 : ic.y + 10;
    const ia = ara(t, 1.2, 1.8) * (1 - ara(t, s.d - 0.8, s.d));
    E.panel(ctx, H ? px - 350 : px - 14, py - 26, H ? 364 : ic.w - 8, H ? 360 : 222, { alfa: ia, dolguAlfa: 0.94, vurgu: 'limon' });
    E.yazi(ctx, 'ADIM', px, py, { boyut: 22, agirlik: 700, harfAra: 5, renk: 'turkuaz', hiza: hz, alfa: ia });
    E.yazi(ctx, String(adim), px, py + 52, { boyut: 60, agirlik: 760, hiza: hz, alfa: ia });
    E.yazi(ctx, 'BOYUT', px, py + 118, { boyut: 22, agirlik: 700, harfAra: 5, renk: 'turkuaz', hiza: hz, alfa: ia });
    const yuzde = olc * 100;
    E.yazi(ctx, (yuzde >= 0.1 ? sayi(yuzde, yuzde < 1 ? 2 : 1) : sayi(yuzde, 4)) + ' %', px, py + 166, { boyut: 44, agirlik: 700, hiza: hz, renk: 'limon', alfa: ia });
    if (!H) E.formul(ctx, '0{,}8 · 0{,}6 = 0{,}48', ic.x1 - 10, py + 166, { boyut: 30, hiza: 'right', alfa: ara(t, 4.6, 5.2) * ia });
    if (H) {
      E.formul(ctx, '0{,}8 · 0{,}6 = 0{,}48', px, py + 250, { boyut: 32, hiza: hz, alfa: ara(t, 4.6, 5.2) * ia });
      E.yazi(ctx, 'iki adımda: 0,48 kat ve çeyrek tur', px, py + 300, { boyut: 24, agirlik: 520, hiza: hz, renk: 'gumus', alfa: ara(t, 5.2, 5.8) * ia, maxGen: 330 });
    }
  };

  /* ---------- 7. Problem: çatı makası ---------- */
  const cati = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const sc = H ? 76 : 70;
    const g = H ? harita(ic.x + 20, ic.y + 400, sc) : harita(L.cx - 4.3 * sc, ic.y + 330, sc);
    const A = [4, 3], B = [0, 0], C = [8, 0];
    const yk = 1.2, k = (3 - yk) / 3; // kiriş: tabandan 1,2 m
    const Dp = ara2(A, B, k), Ep = ara2(A, C, k);
    const ta = ara(t, 0.1, 1.0);
    // makas: kalın kirişler
    const kiris = (P, Q, renk, al, kal = 9) => {
      E.cizgi(ctx, [g(P), g(Q)], { renk: 'derin', kalinlik: kal + 4, alfa: al });
      E.cizgi(ctx, [g(P), g(Q)], { renk, kalinlik: kal, alfa: al, parilti: 0.3 });
    };
    kiris(B, C, 'cizgi', ta); kiris(A, B, 'gumus', ta); kiris(A, C, 'gumus', ta);
    // dikmeler (süs)
    for (const xx of [2, 6]) { const ust = xx < 4 ? ara2(B, A, xx / 4) : ara2(C, A, (8 - xx) / 4); E.cizgi(ctx, [g([xx, 0]), g(ust)], { renk: 'cizgi', kalinlik: 4, alfa: ta * 0.7 }); }
    // yükseklik ve ölçüler
    const oa = ara(t, 0.8, 1.6);
    E.cizgi(ctx, [g(A), g([4, 0])], { renk: 'menekse', kalinlik: 2, kesik: [6, 6], alfa: oa });
    E.formul(ctx, '3\\t{ m}', g([4, 1.9])[0] + 12, g([4, 1.9])[1], { boyut: 26, hiza: 'left', renk: 'menekse', alfa: oa });
    E.formul(ctx, '8\\t{ m}', g([4, 0])[0], g([4, 0])[1] + 34, { boyut: 28, renk: 'tebesir', alfa: oa });
    const ba = ara(t, 4.0, 4.8);
    kiris(Dp, Ep, 'limon', ba, 7);
    E.cizgi(ctx, [g([Ep[0], 0]), g(Ep)], { renk: 'gok', kalinlik: 2.5, kesik: [5, 4], alfa: ba });
    E.formul(ctx, '1{,}2\\t{ m}', g([Ep[0], 0.34])[0] + 10, g([Ep[0], 0.34])[1], { boyut: 24, hiza: 'left', renk: 'gok', alfa: ba });
    const xa = ara(t, 4.6, 5.2);
    E.formul(ctx, t < 10.4 ? 'x' : 'x = 4{,}8\\t{ m}', g([5.4, yk])[0], g([5.4, yk])[1] + 30, { boyut: 30, renk: 'limon', alfa: xa });
    // küçük üçgen
    const ua = ara(t, 7.6, 8.3);
    ucgen(ctx, [A, Dp, Ep].map(g), { renk: 'turkuaz', dolgu: 0.25, kalinlik: 0, alfa: ua });
    ucgen(ctx, [A, B, C].map(g), { renk: 'menekse', dolgu: 0.08, kalinlik: 0, alfa: ua });
    E.cizgi(ctx, [g(A), g(ara2(A, [4, 0], k))], { renk: 'turkuaz', kalinlik: 2, kesik: [4, 5], alfa: ua });
    E.formul(ctx, '1{,}8', g([4, 2.1])[0] - 14, g([4, 2.1])[1], { boyut: 24, hiza: 'right', renk: 'turkuaz', alfa: ua });
    // metin
    const sx = H ? 760 : L.cx, sh = H ? 'left' : 'center';
    const s0 = H ? ic.y + 40 : ic.y + 440;
    E.yazi(ctx, 'ÇATI MAKASI', sx, s0, { boyut: 24, agirlik: 700, harfAra: 5, renk: 'turkuaz', hiza: sh, alfa: ara(t, 0.3, 0.9) });
    E.formul(ctx, '\\c{limon}{DE} \\;∥\\; BC \\Rightarrow \\triangle ADE \\sim \\triangle ABC', sx, s0 + 56, { boyut: H ? 30 : 30, hiza: sh, alfa: ara(t, 8.0, 8.6) });
    E.formul(ctx, '\\frac{x}{8} = \\frac{3 − 1{,}2}{3} = \\frac{1{,}8}{3}', sx, s0 + (H ? 150 : 140), { boyut: 36, hiza: sh, alfa: ara(t, 8.6, 9.3), aciga: ara(t, 8.6, 10.0, 'lin') });
    E.formul(ctx, '\\kutu{limon}{x = 4{,}8\\t{ m}}', sx, s0 + (H ? 250 : 232), { boyut: 40, hiza: sh, alfa: ara(t, 10.2, 10.8), parilti: 0.3, parRenk: 'limon' });
    E.formul(ctx, '\\t{kontrol: } \\frac{4{,}8}{8} = 0{,}6 = \\frac{1{,}8}{3} \\;✓', sx, s0 + (H ? 340 : 316), { boyut: 28, hiza: sh, renk: 'gumus', alfa: ara(t, 11.0, 11.6) });
  };

  /* ---------- 8–9. Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Benzer üçgen üretmenin en kısa yolu: açıları korumak (AA).' },
    { tr: 'Bir kenara paralel çiz: içte, dışta, kelebekte benzer üçgen.', formul: 'DE \\;∥\\; BC \\Rightarrow \\triangle ADE \\sim \\triangle ABC' },
    { tr: 'Paralel değilse açılar tutmaz, benzerlik bozulur.' },
    { tr: 'Dik üçgende hipotenüse yükseklik: üç benzer üçgen.', formul: '\\triangle HBA \\sim \\triangle HAC \\sim \\triangle ABC' },
  ], { aralik: 1.6 });
  /** Yerel bitiş kartı: motorun bitisKarti'si iki satırlık laboratuvar adında açıklamayla çakışıyor */
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
    sure: 117.8,
    sahneler: [
      { ad: 'Soğuk açılış: Matruşka', bas: 0, son: 11.5, giris: 0, cikis: 0.7, ciz: acilis },
      { ad: 'İmza', bas: 11.2, son: 14.9, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 14.6, son: 18.9, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Elimizdeki araçlar', bas: 18.6, son: 26.9, ciz: araclar },
      { ad: 'Paralel çizim: içte, dışta, kelebek', bas: 26.6, son: 46.0, ciz: paralel },
      { ad: 'Paralel olmasa?', bas: 45.7, son: 54.9, ciz: paralelDegil },
      { ad: 'Dik üçgende yükseklik', bas: 54.6, son: 75.0, ciz: dikYukseklik },
      { ad: 'Sürpriz: sonsuz sarmal', bas: 74.7, son: 89.9, ciz: sarmal, itme: 0 },
      { ad: 'Problem: çatı makası', bas: 89.6, son: 101.5, ciz: cati },
      { ad: 'Aklında kalsın', bas: 101.2, son: 111.5, ciz: ozet },
      { ad: 'Laboratuvar', bas: 111.3, son: 117.8, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 5, renk1: 'menekse', renk2: 'turkuaz' }),
  });
})();
