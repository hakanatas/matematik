/* ==========================================================================
   EKSEN 9.4.1 — İki Ayna
   Tek fikir: Yansıma, öteleme ve dönme aynı ailedendir. Yansıma, şeklin ayna
   doğrusu etrafında düzlemden çıkıp 180° dönmesidir (3B an); iki yansıma
   ise bir öteleme (paralel aynalar, 2d) ya da bir dönmedir (kesişen aynalar, 2θ).
   Renk = yön: ön yüz turkuaz, arka yüz (ters yön) mercan.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp, yd } = E;

  const meta = {
    kod: 'MAT.9.4.1',
    tema: 'Eşlik ve Benzerlik',
    ad: 'İki Ayna',
    adEn: 'Two Mirrors',
    labAd: 'Dönüşüm ve Benzerlik Laboratuvarı',
    labAciklama: 'Kendi motifini tasarla; yansıt, ötele, döndür ve iki aynayla çoğalt.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-donusumler/',
  };

  const TAU = Math.PI * 2;
  /* ---------- Afin dönüşümler: m = [a, b, c, d, e, f] → (a x + c y + e, b x + d y + f) ---------- */
  const uygula = (m, p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
  const carp = (m1, m2) => [
    m1[0] * m2[0] + m1[2] * m2[1], m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3], m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4], m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
  const zincir = (...ms) => ms.reduce((a, b) => carp(a, b));
  const BIR = [1, 0, 0, 1, 0, 0];
  const Ote = (x, y) => [1, 0, 0, 1, x, y];
  const Don = (th, cx = 0, cy = 0) => zincir(Ote(cx, cy), [Math.cos(th), Math.sin(th), -Math.sin(th), Math.cos(th), 0, 0], Ote(-cx, -cy));
  const Olc = (s) => [s, 0, 0, s, 0, 0];
  /** φ açılı, p noktasından geçen doğruya göre yansıma */
  const Yans = (phi, px = 0, py = 0) => zincir(Ote(px, py), [Math.cos(2 * phi), Math.sin(2 * phi), Math.sin(2 * phi), -Math.cos(2 * phi), 0, 0], Ote(-px, -py));
  /** Yansımanın "katlanma" animasyonu: s=0 kimlik, s=1 yansıma; dik bileşen cos(πs) ile ölçeklenir (3B dönüşün izdüşümü) */
  const Katla = (phi, px, py, s) => zincir(Ote(px, py), Don(phi), [1, 0, 0, Math.cos(Math.PI * s), 0, 0], Don(-phi), Ote(-px, -py));
  const det = (m) => m[0] * m[3] - m[1] * m[2];
  /** Dünya → ekran görünümü (y yukarı) */
  const gorunum = (cx, cy, s, X0 = 0, Y0 = 0, r = 0) => zincir(Ote(cx, cy), [s, 0, 0, -s, 0, 0], Don(r), Ote(-X0, -Y0));

  /* ---------- Motif: basamaklı kilim kancası (simetrisiz) ---------- */
  const MOTIF = [[0, 0], [2, 0], [2, 1], [3, 1], [3, 4], [0, 4], [0, 3], [2, 3], [2, 2], [1, 2], [1, 1], [0, 1]].map(([x, y]) => [x - 1.5, y - 2]);
  const GOZ = [1, 1.5];
  const YAY = (() => { const o = []; for (let i = 0; i <= 26; i++) { const a = E.der(40 + (i / 26) * 250); o.push([-0.5 + 0.34 * Math.cos(a), 0.5 + 0.34 * Math.sin(a)]); } return o; })();
  /**
   * Motifi çiz. M: dünya dönüşümü (motif yerel → dünya), V: dünya → ekran.
   * o: alfa, renk (zorla), ok (yön oku), kalin, parilti, dolgu, hayalet, goz
   */
  const motifCiz = (ctx, M, V, o = {}) => {
    const al = o.alfa ?? 1;
    if (al <= 0.002) return;
    const F = carp(V, M);
    const d = det(M);
    const renk = o.renk || (d >= 0 ? 'turkuaz' : 'mercan');
    const pts = MOTIF.map((p) => uygula(F, p));
    if (o.hayalet) {
      E.cizgi(ctx, pts, { kapali: true, renk, kalinlik: 2, kesik: [6, 7], alfa: al * 0.7 });
      return pts;
    }
    E.cokgen(ctx, pts, { renk, alfa: (o.dolgu ?? 0.32) * al });
    E.cizgi(ctx, pts, { kapali: true, renk, kalinlik: o.kalin ?? 3, parilti: o.parilti ?? 0.6, alfa: al });
    if (o.goz !== false) {
      const g = uygula(F, GOZ);
      const r = Math.max(2, 0.2 * Math.sqrt(Math.abs(det(F))));
      E.nokta(ctx, g[0], g[1], r, { renk: 'limon', parilti: o.parilti ? 0.6 : 0, alfa: al });
    }
    if (o.ok) {
      const yp = YAY.map((p) => uygula(F, p));
      E.cizgi(ctx, yp, { renk: 'tebesir', kalinlik: 2.5, alfa: al * o.ok, ok: true, okBoy: 10 });
    }
    return pts;
  };
  const sayi = (v) => String(Math.round(v * 10) / 10).replace('.', ',');

  /* ---------- Izgara ---------- */
  const izgara = (ctx, V, x0, x1, y0, y1, alfa) => {
    if (alfa <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= alfa; ctx.strokeStyle = E.rgba('sis', 0.6); ctx.lineWidth = 1;
    for (let x = Math.ceil(x0); x <= x1; x++) { const a = uygula(V, [x, y0]), b = uygula(V, [x, y1]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    for (let y = Math.ceil(y0); y <= y1; y++) { const a = uygula(V, [x0, y]), b = uygula(V, [x1, y]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    ctx.restore();
  };
  /** Ayna doğrusu (dünya: φ açılı, p'den geçen, ±L) */
  const ayna = (ctx, V, phi, p, L, o = {}) => {
    const u = [Math.cos(phi), Math.sin(phi)];
    const a = uygula(V, [p[0] - u[0] * L, p[1] - u[1] * L]), b = uygula(V, [p[0] + u[0] * L, p[1] + u[1] * L]);
    const pp = o.p ?? 1;
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    E.cizgi(ctx, [[lerp(m[0], a[0], pp), lerp(m[1], a[1], pp)], [lerp(m[0], b[0], pp), lerp(m[1], b[1], pp)]], { renk: o.renk || 'limon', kalinlik: o.kalin ?? 3, parilti: 1, alfa: o.alfa ?? 1 });
    return [a, b];
  };

  /* ---------- Kilim deseni: 60°'lik iki ayna + öteleme kafesi ---------- */
  const ROZ_R = 3.4, ROZ_S = 0.62;
  // taban motif: a₁ (0°) ile 120° doğrusu arasındaki 60°'lik kamanın ortasında (−30°), uzun ekseni ışınsal
  const tabanM = zincir(Don(E.der(-30)), Ote(ROZ_R, 0), Don(E.der(-90)), Olc(ROZ_S));
  const GRUP = [ // [dönüşüm, belirme sırası]
    [BIR, 0], [Yans(0), 1], [Yans(E.der(60)), 2], [Don(E.der(120)), 3], [Don(E.der(240)), 4], [Yans(E.der(120)), 5],
  ];
  const A1 = [10.4, 0], A2 = [5.2, 9.0067];

  /* ---------- 1. Soğuk açılış ---------- */
  const acilis = (ctx, s) => {
    const t = s.t, ic = E.L.icerik;
    const z = kf(t, [[0, 2.6], [1.0, 2.5], [4.6, 1.15, 'io3'], [9.0, 0.3, 'io3'], [11.3, 0.27, 'lin']]);
    const odak = kf(t, [[0, uygula(tabanM, [0, 0])], [1.2, uygula(tabanM, [0, 0])], [4.2, [0, 0], 'io3']]);
    const rot = 0.12 * ara(t, 3.5, 11.3, 'io2');
    const u0 = E.yd(42, 36);
    const V = gorunum(ic.cx, E.yd(ic.cy, ic.cy - 40), u0 * z, odak[0], odak[1], rot);
    const kal = clamp(2.6 * z, 1.2, 3.5);
    // kafes rozetleri
    if (t > 4.4) {
      for (let i = -10; i <= 10; i++) for (let j = -9; j <= 9; j++) {
        if (i === 0 && j === 0) continue;
        const c = [i * A1[0] + j * A2[0], i * A1[1] + j * A2[1]];
        const cs = uygula(V, c);
        const m = 5 * u0 * z;
        if (cs[0] < -m || cs[0] > E.W + m || cs[1] < -m || cs[1] > E.H + m) continue;
        const dist = Math.hypot(c[0], c[1]);
        const p = ara(t, 4.5 + dist * 0.055, 5.3 + dist * 0.055, 'cik3');
        if (p <= 0) continue;
        const sc = lerp(0.4, 1, p);
        for (const [g] of GRUP) motifCiz(ctx, zincir(Ote(c[0], c[1]), Olc(sc), g, tabanM), V, { alfa: p * 0.85, kalin: kal, parilti: 0, goz: true, dolgu: 0.26 });
      }
    }
    // merkez rozet: kopyalar katlanarak/dönerek doğar
    const zaman = [[1.1, 2.1], [2.1, 2.9], [2.9, 3.5], [3.3, 3.9], [3.7, 4.3]];
    GRUP.forEach(([g, k]) => {
      let M;
      if (k === 0) M = tabanM;
      else {
        const [a, b] = zaman[k - 1];
        const p = ara(t, a, b, 'io3');
        if (p <= 0) return;
        if (k === 1) M = carp(Katla(0, 0, 0, p), tabanM);
        else if (k === 2) M = carp(Katla(E.der(60), 0, 0, p), tabanM);
        else if (k === 3) M = carp(Don(E.der(120) * p), tabanM);
        else if (k === 4) M = carp(Don(E.der(240) * p), tabanM);
        else M = carp(Katla(E.der(120), 0, 0, p), tabanM);
      }
      motifCiz(ctx, M, V, { alfa: k === 0 ? ara(t, 0, 0.9) : 1, kalin: kal, parilti: 0.8, ok: 0 });
    });
    // aynalar
    const aA = ara(t, 1.0, 1.5) * (1 - ara(t, 4.0, 5.0)) + ara(t, 8.6, 9.4);
    if (aA > 0) {
      ayna(ctx, V, 0, [0, 0], 7, { alfa: aA, kalin: 2.5, p: t < 5 ? ara(t, 1.0, 1.6) : ara(t, 8.6, 9.4) });
      ayna(ctx, V, E.der(60), [0, 0], 7, { alfa: aA * (t < 5 ? ara(t, 1.9, 2.3) : 1), kalin: 2.5, p: t < 5 ? ara(t, 1.9, 2.5) : ara(t, 8.8, 9.6) });
      const o = uygula(V, [0, 0]);
      E.isik(ctx, o[0], o[1], 160, 'limon', 0.35 * aA);
    }
    // yazı
    const yA = ara(t, 9.6, 10.3, 'cik3');
    if (yA > 0) {
      const y = ic.y1 - E.yd(50, 80);
      const w = E.yd(560, 520);
      E.panel(ctx, ic.cx - w / 2, y - 46, w, 92, { renk: 'gece', dolguAlfa: 0.82, kenar: 'limon', kenarAlfa: 0.5, alfa: yA });
      E.yazi(ctx, 'İki ayna · tek motif', ic.cx, y, { boyut: E.yd(44, 38), agirlik: 720, alfa: yA, parilti: 0.2 });
    }
  };

  /* ---------- 2. Yansıma (2B) ---------- */
  const yansima = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const u = H ? 46 : 46;
    const V = gorunum(H ? 460 : 360, H ? ic.y + 250 : ic.y + 270, u);
    const tx = H ? 1000 : 360, ty = H ? ic.y + 70 : ic.y + 560, tGen = H ? 400 : 620;
    izgara(ctx, V, -7, 7, -4, 4, ara(t, 0, 1.0) * 0.8);
    ayna(ctx, V, Math.PI / 2, [0, 0], 4.6, { p: ara(t, 0.2, 1.2) });
    const ust = uygula(V, [0, 4.6]);
    E.yazi(ctx, 'ayna doğrusu', ust[0], ust[1] - 22, { boyut: 24, agirlik: 600, renk: 'limon', alfa: ara(t, 0.8, 1.4) });
    const M0 = Ote(-3.6, 0);
    const R = Yans(Math.PI / 2);
    motifCiz(ctx, M0, V, { alfa: ara(t, 0.5, 1.3), ok: ara(t, 10.6, 11.4) });
    // A, B, C noktaları ve dikmeler
    const K = [[-1.5, -2], [0.5, -2], [-1.5, 2]].map((p) => uygula(M0, p));
    const ad = ['A', 'B', 'C'];
    K.forEach((p, i) => {
      const t0 = 2.4 + i * 0.7;
      const a = ara(t, t0, t0 + 0.4);
      if (a <= 0) return;
      const q = uygula(R, p);
      const pr = ara(t, t0 + 0.2, t0 + 1.2, 'io2');
      const ps = uygula(V, p), qs = uygula(V, q), ms = uygula(V, [0, p[1]]);
      E.cizgi(ctx, [ps, [lerp(ps[0], qs[0], pr), ps[1]]], { renk: 'gumus', kalinlik: 2, kesik: [5, 6], alfa: a * (1 - 0.6 * ara(t, 7.4, 8.0)) });
      E.nokta(ctx, ps[0], ps[1], 6, { renk: 'tebesir', parilti: 0.6, alfa: a });
      E.formul(ctx, ad[i], ps[0] - 22, ps[1] + (i === 2 ? -22 : 24), { boyut: 26, renk: 'tebesir', alfa: a });
      if (pr > 0.98) {
        E.nokta(ctx, qs[0], qs[1], 6, { renk: 'tebesir', parilti: 0.6 });
        E.formul(ctx, ad[i] + '′', qs[0] + 24, qs[1] + (i === 2 ? -22 : 24), { boyut: 26, renk: 'tebesir' });
        // eşit uzaklık işaretleri
        const ti = ara(t, t0 + 1.2, t0 + 1.6) * (1 - ara(t, 7.4, 8.0));
        for (const xm of [(ps[0] + ms[0]) / 2, (qs[0] + ms[0]) / 2]) for (let k = 0; k <= i; k++) E.cizgi(ctx, [[xm - 4 + k * 6, ps[1] - 8], [xm - 4 + k * 6, ps[1] + 8]], { renk: 'gok', kalinlik: 2.5, alfa: ti });
        E.dikAci(ctx, ms[0], ms[1], Math.PI, 10, { renk: 'gumus', kalinlik: 2, alfa: ti * 0.9 });
      }
    });
    // görüntü katlanarak belirir
    const kp = ara(t, 5.6, 7.2, 'io3');
    if (kp > 0) motifCiz(ctx, carp(Katla(Math.PI / 2, 0, 0, kp), M0), V, { ok: ara(t, 11.4, 12.2) });
    // yazılar
    const adim = (a0, a1, metin, renk = 'tebesir') => {
      const al = ara(t, a0, a0 + 0.5, 'cik3') * (1 - ara(t, a1, a1 + 0.4));
      if (al > 0) E.yazi(ctx, metin, tx, ty, { boyut: E.yd(32, 31), agirlik: 620, renk, alfa: al, maxGen: tGen });
    };
    adim(0.6, 2.2, 'Görüntü nerede, nasıl olur?');
    adim(2.4, 6.9, 'Her nokta aynaya dik iner, aynı uzaklıkta karşıya geçer.');
    const eA = ara(t, 7.3, 7.9, 'cik3') * (1 - ara(t, 10.2, 10.6));
    if (eA > 0) {
      E.formul(ctx, '|AB| = |A′B′| = 2', tx, ty - E.yd(20, 26), { boyut: E.yd(40, 38), alfa: eA });
      E.formul(ctx, '\\angle A = \\angle A′ = 90°', tx, ty + E.yd(50, 30), { boyut: E.yd(40, 38), alfa: ara(t, 7.9, 8.4) * eA });
      E.yazi(ctx, 'Şekil ile görüntüsü eş.', tx, ty + E.yd(130, 92), { boyut: E.yd(32, 30), agirlik: 680, renk: 'limon', alfa: ara(t, 8.6, 9.2) * eA });
    }
    const yA = ara(t, 10.8, 11.4, 'cik3');
    if (yA > 0) {
      E.yazi(ctx, 'Ama yön ters döner:', tx, ty - E.yd(20, 26), { boyut: E.yd(32, 30), agirlik: 640, alfa: yA, maxGen: tGen });
      E.yazi(ctx, '↺ saat yönünün tersi', tx, ty + E.yd(40, 22), { boyut: E.yd(30, 28), agirlik: 600, renk: 'turkuaz', alfa: ara(t, 11.2, 11.7) });
      E.yazi(ctx, '↻ saat yönü', tx, ty + E.yd(90, 66), { boyut: E.yd(30, 28), agirlik: 600, renk: 'mercan', alfa: ara(t, 12.0, 12.5) });
      E.yazi(ctx, 'Neden? Bir boyut yukarı çıkalım.', tx, ty + E.yd(170, 128), { boyut: E.yd(28, 27), agirlik: 520, renk: 'gumus', alfa: ara(t, 13.8, 14.4), maxGen: tGen });
    }
  };

  /* ---------- 3. 3B: yansıma = düzlemden çıkıp 180° dönmek ---------- */
  let U = null;
  const ucHazirla = () => {
    if (U) return U;
    const T = window.THREE;
    const sahne = new T.Scene();
    E.uc.isiklar(sahne);
    const kam = new T.PerspectiveCamera(35, 1, 0.1, 200);
    // zemin ızgarası (y = 0 düzlemi)
    const iz = [];
    for (let i = -8; i <= 8; i++) { iz.push(i, 0, -5, i, 0, 5); }
    for (let k = -5; k <= 5; k++) { iz.push(-8, 0, k, 8, 0, k); }
    const izGeo = new T.BufferGeometry(); izGeo.setAttribute('position', new T.Float32BufferAttribute(iz, 3));
    const izMat = new T.LineBasicMaterial({ color: E.uc.renk('cizgi'), transparent: true, opacity: 0.55, toneMapped: false });
    sahne.add(new T.LineSegments(izGeo, izMat));
    // ayna doğrusu = menteşe
    const ay = E.uc.cubuk(new T.Vector3(0, 0.02, -5.2), new T.Vector3(0, 0.02, 5.2), 0.045, 'limon');
    ay.material.toneMapped = false; sahne.add(ay);
    // motif plakası
    const sekil = new T.Shape(MOTIF.map(([x, y]) => new T.Vector2(x, y)));
    const sGeo = new T.ShapeGeometry(sekil);
    const kalinlik = 0.08;
    const mentese = new T.Group(); sahne.add(mentese);
    const plaka = new T.Group(); plaka.position.set(-3.6, 0, 0); mentese.add(plaka);
    const yatir = (m, y) => { m.rotation.x = -Math.PI / 2; m.position.y = y; return m; };
    const on = yatir(new T.Mesh(sGeo, E.uc.malzeme('turkuaz', { side: T.FrontSide, transparent: false, emissiveIntensity: 0.25 })), kalinlik + 0.001);
    const arka = yatir(new T.Mesh(sGeo, E.uc.malzeme('mercan', { side: T.BackSide, transparent: false, emissiveIntensity: 0.25 })), -0.001);
    const kenarGeo = new T.ExtrudeGeometry(sekil, { depth: kalinlik, bevelEnabled: false });
    const yan = yatir(new T.Mesh(kenarGeo, [new T.MeshBasicMaterial({ visible: false }), E.uc.malzeme('derin', { transparent: false, emissive: E.uc.renk('gumus'), emissiveIntensity: 0.15 })]), 0);
    const onKenar = yatir(E.uc.kenar(sGeo, 'turkuaz'), kalinlik + 0.004); onKenar.material.toneMapped = false;
    const arkaKenar = yatir(E.uc.kenar(sGeo, 'mercan'), -0.004); arkaKenar.material.toneMapped = false;
    const goz = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, kalinlik + 0.02, 24), new T.MeshBasicMaterial({ color: E.uc.renk('limon'), toneMapped: false }));
    goz.position.set(GOZ[0], kalinlik / 2, -GOZ[1]);
    plaka.add(on, arka, yan, onKenar, arkaKenar, goz);
    // hayalet: başlangıç yeri
    const hayalet = yatir(new T.Mesh(sGeo, new T.MeshBasicMaterial({ color: E.uc.renk('turkuaz'), transparent: true, opacity: 0.12, depthWrite: false, toneMapped: false, side: T.DoubleSide })), 0.003);
    hayalet.position.x = -3.6; sahne.add(hayalet);
    const hayaletKenar = yatir(E.uc.kenar(sGeo, 'turkuaz', { opacity: 0.45 }), 0.004); hayaletKenar.position.x = -3.6; hayaletKenar.material.toneMapped = false; sahne.add(hayaletKenar);
    U = { T, sahne, kam, mentese, hayalet, hayaletKenar, izMat };
    return U;
  };
  const uc3B = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const tx = ic.cx, ty = H ? ic.y + 34 : ic.y1 - 150;
    const merkez = H ? [640, 430] : [360, 470];
    const phi = ara(t, 4.0, 8.6, 'io3');
    const el = E.der(kf(t, [[0, 86], [1.0, 86], [3.6, 32, 'io3'], [9.4, 30], [12.4, 70, 'io3'], [15.8, 72, 'lin']]));
    const az = E.der(kf(t, [[0, 0], [1.0, 0], [3.6, 32, 'io3'], [9.4, 38, 'lin'], [12.4, 6, 'io3'], [15.8, 4, 'lin']]));
    const R = (H ? 21 : 40) * kf(t, [[0, 1.0], [3.6, 0.92, 'io3'], [9.4, 0.88], [12.4, 0.98, 'io3']]);
    const alfa = ara(t, 0, 0.9, 'cik3');
    if (!(E.uc && E.uc.var())) {
      E.yazi(ctx, 'WebGL yok', ic.cx, ic.cy, { boyut: 30, renk: 'gumus', alfa });
      return;
    }
    ucHazirla();
    const { kam, mentese, T } = U;
    const kutu = { x: 0, y: 0, w: E.W, h: E.H };
    kam.fov = 35; kam.aspect = kutu.w / kutu.h; kam.updateProjectionMatrix();
    const cp = [R * Math.cos(el) * Math.sin(az), R * Math.sin(el), R * Math.cos(el) * Math.cos(az)];
    kam.position.set(cp[0], cp[1], cp[2]);
    kam.up.set(-Math.sin(az), 0, -Math.cos(az));
    // bakış hedefini kaydırarak sahne merkezini istenen ekran noktasına getir
    kam.lookAt(0, 0, 0); kam.updateMatrixWorld(true);
    const sag = new T.Vector3().setFromMatrixColumn(kam.matrixWorld, 0), yuk = new T.Vector3().setFromMatrixColumn(kam.matrixWorld, 1);
    const upp = (2 * R * Math.tan(E.der(kam.fov / 2))) / kutu.h;
    const dx = merkez[0] - E.W / 2, dy = merkez[1] - E.H / 2;
    const hedef = new T.Vector3().addScaledVector(sag, -dx * upp).addScaledVector(yuk, dy * upp);
    kam.lookAt(hedef); kam.updateMatrixWorld(true);
    mentese.rotation.set(0, 0, -Math.PI * phi);
    mentese.updateMatrixWorld(true);
    U.hayalet.material.opacity = 0.12 * ara(t, 4.2, 5.0);
    U.hayaletKenar.material.opacity = 0.5 * ara(t, 4.2, 5.0);
    // 2B atmosfer
    const o = E.uc.ekranda(new T.Vector3(0, 0, 0), kam, kutu);
    E.isik(ctx, o[0], o[1], E.yd(520, 420), 'gok', 0.12 * alfa);
    E.isik(ctx, o[0], o[1], 200, 'limon', 0.25 * E.nabiz(t, 8.4, 1.2) * alfa);
    E.uc.ciz(ctx, U.sahne, kam, { x: 0, y: 0, w: E.W, h: E.H, alfa });
    // 2B etiketler
    const ek = (x, y, z) => E.uc.ekranda(new T.Vector3(x, y, z), kam, kutu);
    const ayUc = ek(0, 0, -5.4);
    E.etiket(ctx, 'ayna doğrusu = menteşe', ayUc[0], ayUc[1] - 30, { boyut: 24, renk: 'limon', agirlik: 640, alfa: ara(t, 2.6, 3.4) * (1 - ara(t, 9.4, 10.0)), kenar: 'limon' });
    // plaka merkezinin yeri (menteşe dönüşüyle)
    const pc = [-3.6 * Math.cos(Math.PI * phi), 3.6 * Math.sin(Math.PI * phi) + 0.04, 0];
    const ps = ek(pc[0], pc[1] + (phi > 0.5 ? -0.0 : 0), -2.2);
    const onA = ara(t, 2.0, 2.6) * (1 - ara(t, 5.4, 5.9)), arkaA = ara(t, 8.4, 9.0);
    E.etiket(ctx, 'ön yüz', ps[0], ps[1] - 26, { boyut: 24, renk: 'turkuaz', agirlik: 640, alfa: onA, kenar: 'turkuaz' });
    E.etiket(ctx, 'arka yüz', ps[0], ps[1] - 26, { boyut: 24, renk: 'mercan', agirlik: 640, alfa: arkaA, kenar: 'mercan' });
    const dik = ek(0, 3.6, 0);
    E.etiket(ctx, '90°: düzlemin dışında', dik[0] + E.yd(220, 150), dik[1], { boyut: 24, renk: 'tebesir', agirlik: 600, alfa: ara(t, 6.0, 6.4) * (1 - ara(t, 7.2, 7.6)) });
    // açı sayacı
    const sA = ara(t, 4.0, 4.4) * (1 - ara(t, 10.0, 10.6));
    if (sA > 0) {
      const sx = H ? 1080 : 600, sy = H ? ic.y + 150 : ic.y + 40;
      E.yazi(ctx, 'DÖNÜŞ', sx, sy, { boyut: 22, agirlik: 700, harfAra: 5, renk: 'gumus', alfa: sA });
      E.yazi(ctx, `${Math.round(180 * phi)}°`, sx, sy + E.yd(56, 50), { boyut: E.yd(60, 52), agirlik: 760, renk: phi >= 1 ? 'limon' : 'tebesir', alfa: sA, parilti: phi >= 1 ? 0.4 : 0, parRenk: 'limon' });
    }
    // başlık satırları
    const satir = (a0, a1, metin, renk = 'tebesir', boy = E.yd(34, 32)) => {
      const al = ara(t, a0, a0 + 0.5, 'cik3') * (1 - ara(t, a1, a1 + 0.4));
      if (al <= 0) return;
      const tw = E.yaziOlc(ctx, metin, { boyut: boy, agirlik: 660 }), mg = E.yd(900, 620);
      const w = Math.min(tw, mg) + 44, hh = tw > mg ? boy * 2.7 : boy * 1.6;
      E.panel(ctx, tx - w / 2, ty - hh / 2, w, hh, { renk: 'gece', dolguAlfa: 0.7, kenar: null, alfa: al });
      E.yazi(ctx, metin, tx, ty, { boyut: boy, agirlik: 660, renk, alfa: al, maxGen: mg });
    };
    satir(0.6, 3.8, 'Ayna doğrusunu bir menteşe yap.');
    satir(4.0, 8.4, 'Motif düzlemden kalkar, 180° döner…');
    satir(8.6, 12.0, '…ve arka yüzüyle geri iner.', 'mercan');
    satir(12.2, 16.5, 'Yansıma = uzayda yarım tur. Yön bu yüzden ters.', 'limon');
  };

  /* ---------- 4. Öteleme ve dönme ---------- */
  const oteDon = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const u = H ? 40 : 38;
    const V = gorunum(H ? 440 : 360, H ? ic.y + 270 : ic.y + 270, u);
    const tx = H ? 1000 : 360, ty = H ? ic.y + 70 : ic.y + 560, tGen = H ? 400 : 620;
    izgara(ctx, V, -8, 7, -5, 5, ara(t, 0, 0.8) * 0.8);
    // A: öteleme
    const aA = 1 - ara(t, 7.2, 7.8);
    if (aA > 0) {
      ctx.save(); ctx.globalAlpha *= aA;
      const v = [6, 2];
      const M0 = Ote(-4, -1);
      const p = ara(t, 1.6, 3.6, 'io3');
      motifCiz(ctx, M0, V, { hayalet: p > 0, alfa: p > 0 ? 1 : ara(t, 0.3, 1.0) });
      const K = [[-1.5, -2], [1.5, 1], [-1.5, 2]].map((q) => uygula(M0, q));
      K.forEach((q, i) => {
        const a = uygula(V, q), b = uygula(V, [q[0] + v[0] * p, q[1] + v[1] * p]);
        if (p > 0.02) E.ok(ctx, a[0], a[1], b[0], b[1], { renk: 'gok', kalinlik: 3, parilti: 0.6, okBoy: 13 });
      });
      motifCiz(ctx, carp(Ote(v[0] * p, v[1] * p), M0), V, { ok: ara(t, 4.4, 5.0), alfa: ara(t, 0.3, 1.0) });
      const vm = uygula(V, [1.6, -2.6]);
      E.formul(ctx, '\\b{v} = (6,\\, 2)', vm[0], vm[1] + 6, { boyut: 30, renk: 'gok', alfa: ara(t, 3.0, 3.6) });
      ctx.restore();
      const al1 = ara(t, 0.5, 1.0, 'cik3') * aA;
      E.yazi(ctx, 'ÖTELEME', tx, ty - E.yd(10, 30), { boyut: 26, agirlik: 760, harfAra: 6, renk: 'gok', alfa: al1 });
      E.yazi(ctx, 'Her nokta aynı vektörle kayar.', tx, ty + E.yd(50, 22), { boyut: E.yd(30, 30), agirlik: 600, alfa: ara(t, 1.4, 2.0) * aA, maxGen: tGen });
      E.yazi(ctx, 'Yön korunur. Görüntü eş.', tx, ty + E.yd(130, 80), { boyut: E.yd(30, 30), agirlik: 640, renk: 'turkuaz', alfa: ara(t, 4.6, 5.2) * aA, maxGen: tGen });
    }
    // B: dönme
    const bA = ara(t, 7.6, 8.2);
    if (bA > 0) {
      ctx.save(); ctx.globalAlpha *= bA;
      const O = [-1.5, -1.5];
      const M0 = Ote(2.8, -1.5);
      const th = E.der(90) * ara(t, 9.6, 12.0, 'io3');
      const Os = uygula(V, O);
      motifCiz(ctx, M0, V, { hayalet: th > 0.01 });
      const K = [[1.5, -1], [-1.5, 2]].map((q) => uygula(M0, q));
      K.forEach((q, i) => {
        const r = Math.hypot(q[0] - O[0], q[1] - O[1]);
        const a0 = Math.atan2(q[1] - O[1], q[0] - O[0]);
        const qs = uygula(V, q), qr = uygula(V, uygula(Don(th, O[0], O[1]), q));
        E.cizgi(ctx, [Os, qs], { renk: 'gumus', kalinlik: 2, kesik: [5, 6], alfa: 0.7 });
        if (th > 0.01) {
          E.cizgi(ctx, [Os, qr], { renk: 'gumus', kalinlik: 2, kesik: [5, 6], alfa: 0.7 });
          ctx.save(); ctx.strokeStyle = E.R('menekse'); ctx.lineWidth = 3; ctx.globalAlpha *= 0.9;
          ctx.beginPath(); ctx.arc(Os[0], Os[1], r * u, -a0, -a0 - th, true); ctx.stroke(); ctx.restore();
        }
      });
      motifCiz(ctx, carp(Don(th, O[0], O[1]), M0), V, { ok: ara(t, 12.4, 13.0) });
      E.aciYayi(ctx, Os[0], Os[1], 40, 0, -th, { renk: 'menekse', dolgu: 0.25 });
      E.nokta(ctx, Os[0], Os[1], 8, { renk: 'limon', parilti: 1.2 });
      E.formul(ctx, 'O', Os[0] - 26, Os[1] + 22, { boyut: 28, renk: 'limon' });
      E.yazi(ctx, '90°', Os[0] + 56, Os[1] - 52, { boyut: 26, agirlik: 700, renk: 'menekse', alfa: ara(t, 12.0, 12.4) });
      ctx.restore();
      E.yazi(ctx, 'DÖNME', tx, ty - E.yd(10, 30), { boyut: 26, agirlik: 760, harfAra: 6, renk: 'menekse', alfa: bA });
      E.yazi(ctx, 'Bir merkez, bir açı. Her nokta merkezden aynı uzaklıkta kalır.', tx, ty + E.yd(60, 30), { boyut: E.yd(29, 28), agirlik: 600, alfa: ara(t, 8.4, 9.0), maxGen: tGen });
      E.yazi(ctx, 'Yön yine korunur. Görüntü eş.', tx, ty + E.yd(170, 108), { boyut: E.yd(30, 30), agirlik: 640, renk: 'turkuaz', alfa: ara(t, 12.6, 13.2), maxGen: tGen });
    }
  };

  /* ---------- 5. Sürpriz 1: paralel iki ayna ---------- */
  const paralel = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const u = H ? 50 : 44;
    const V = gorunum(H ? 470 : 404, H ? ic.y + 250 : ic.y + 260, u);
    const tx = H ? 1010 : 360, ty = H ? ic.y + 60 : ic.y + 520, tGen = H ? 380 : 620;
    izgara(ctx, V, -8, 6, -3, 4, ara(t, 0, 0.8) * 0.8);
    const x1 = -3;
    const d = kf(t, [[9.0, 4], [11.4, 3, 'io3']]);
    const x2 = x1 + d;
    const M0 = Ote(-5.5, 0);
    const R1 = Yans(Math.PI / 2, x1, 0), R2 = Yans(Math.PI / 2, x2, 0);
    const k1 = ara(t, 1.8, 3.4, 'io3'), k2 = ara(t, 4.2, 5.8, 'io3');
    // aynalar
    ayna(ctx, V, Math.PI / 2, [x1, 0.5], 3.4, { p: ara(t, 1.0, 1.8) });
    ayna(ctx, V, Math.PI / 2, [x2, 0.5], 3.4, { p: ara(t, 3.4, 4.2) });
    const e1 = uygula(V, [x1, 4.1]), e2 = uygula(V, [x2, 4.1]);
    E.formul(ctx, 'a_{1}', e1[0], e1[1] - 8, { boyut: 28, renk: 'limon', alfa: ara(t, 1.4, 1.9) });
    E.formul(ctx, 'a_{2}', e2[0], e2[1] - 8, { boyut: 28, renk: 'limon', alfa: ara(t, 3.8, 4.3) });
    // motifler
    const hay = ara(t, 6.0, 6.6);
    motifCiz(ctx, M0, V, { alfa: ara(t, 0.3, 1.0), ok: ara(t, 0.8, 1.4) * (1 - hay * 0.6) });
    if (k1 > 0) motifCiz(ctx, carp(Katla(Math.PI / 2, x1, 0, k1), M0), V, { ok: ara(t, 3.0, 3.4), alfa: 1 - 0.55 * hay - 0.25 * ara(t, 8.6, 9.2) });
    if (k2 > 0) motifCiz(ctx, zincir(Katla(Math.PI / 2, x2, 0, k2), R1, M0), V, { ok: ara(t, 5.4, 5.8), parilti: 0.9 });
    // d ve 2d
    const dA = ara(t, 6.2, 6.8);
    if (dA > 0) {
      const yb = uygula(V, [0, -2.6])[1], a = uygula(V, [x1, 0])[0], b = uygula(V, [x2, 0])[0];
      E.cizgi(ctx, [[a, yb - 8], [a, yb], [b, yb], [b, yb - 8]], { renk: 'limon', kalinlik: 2.5, alfa: dA });
      E.formul(ctx, 'd', (a + b) / 2, yb + 24, { boyut: 30, renk: 'limon', alfa: dA });
      const yo = uygula(V, [0, 2.7])[1], o1 = uygula(V, [-5.5, 0])[0], o2 = uygula(V, [-5.5 + 2 * d, 0])[0];
      E.ok(ctx, o1, yo, o2, yo, { renk: 'gok', kalinlik: 3.5, parilti: 0.8, okBoy: 14, alfa: ara(t, 6.6, 7.2), p: ara(t, 6.6, 7.6) });
      E.formul(ctx, '2d', (o1 + o2) / 2, yo - 24, { boyut: 30, renk: 'gok', alfa: ara(t, 7.2, 7.7) });
    }
    // yazılar
    const sA = ara(t, 0.5, 1.0, 'cik3');
    E.yazi(ctx, 'PARALEL İKİ AYNA', tx, ty, { boyut: 24, agirlik: 760, harfAra: 5, renk: 'limon', alfa: sA });
    E.yazi(ctx, 'a₁’de yansıt, sonra a₂’de.', tx, ty + E.yd(56, 46), { boyut: E.yd(30, 29), agirlik: 600, alfa: ara(t, 1.4, 2.0) * (1 - ara(t, 6.4, 6.9)), maxGen: tGen });
    const fA = ara(t, 6.8, 7.4, 'cik3');
    E.formul(ctx, `d = ${sayi(d)} \\Rightarrow \\t{kayma} = \\c{gok}{${sayi(2 * d)}}`, tx, ty + E.yd(60, 46), { boyut: E.yd(38, 36), alfa: fA });
    E.formul(ctx, '\\kutu{limon}{a_{2}\\,∘\\,a_{1} = \\t{öteleme } 2d}', tx, ty + E.yd(150, 116), { boyut: E.yd(36, 36), alfa: ara(t, 12.0, 12.6, 'cik3'), parilti: 0.2, parRenk: 'limon' });
    E.yazi(ctx, 'İki kez ters dönen yön, geri düzelir.', tx, ty + E.yd(240, 180), { boyut: E.yd(27, 27), agirlik: 520, renk: 'gumus', alfa: ara(t, 13.0, 13.6), maxGen: tGen });
  };

  /* ---------- 6. Sürpriz 2: kesişen iki ayna → dönme → kaleydoskop ---------- */
  const kesisen = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const z = kf(t, [[0, 1], [11.0, 1], [15.0, 0.62, 'io3']]);
    const u = (H ? 42 : 40) * z;
    const V = gorunum(H ? 430 : 360, H ? ic.y + 300 : ic.y + 330, u, 0, 0, 0.0);
    const tx = H ? 1010 : 360, ty = H ? ic.y + 60 : ic.y + 560, tGen = H ? 380 : 620;
    izgara(ctx, V, -7, 7, -6, 6, ara(t, 0, 0.8) * 0.5 * (1 - ara(t, 10.5, 11.5)));
    const thD = kf(t, [[7.4, 45], [9.2, 60, 'io3']]);
    const th = E.der(thD);
    const M0 = tabanM; // açısı −30°, uzaklık 3,4
    const k1 = ara(t, 1.6, 2.8, 'io3'), k2 = ara(t, 3.0, 4.2, 'io3');
    const kale = ara(t, 10.0, 11.0);
    // aynalar
    ayna(ctx, V, 0, [0, 0], 6, { p: ara(t, 0.3, 1.0) });
    ayna(ctx, V, th, [0, 0], 6, { p: ara(t, 0.6, 1.3) });
    const O = uygula(V, [0, 0]);
    E.isik(ctx, O[0], O[1], 120, 'limon', 0.3);
    // θ yayı
    const tA = ara(t, 1.0, 1.5) * (1 - kale);
    if (tA > 0) {
      E.aciYayi(ctx, O[0], O[1], 5.2 * u, 0, -th, { renk: 'limon', dolgu: 0.06, kalinlik: 2.5, alfa: tA });
      const q = [O[0] + Math.cos(th / 2) * 5.6 * u, O[1] - Math.sin(th / 2) * 5.6 * u];
      E.formul(ctx, `θ = ${Math.round(thD)}°`, q[0] + 40, q[1] - 6, { boyut: 26, renk: 'limon', alfa: tA });
    }
    // motifler
    const R1 = Yans(0);
    const hay = ara(t, 4.6, 5.2) * (1 - kale);
    motifCiz(ctx, M0, V, { alfa: ara(t, 0.3, 1.0), ok: ara(t, 0.8, 1.3) * (1 - kale) });
    if (k1 > 0) motifCiz(ctx, carp(Katla(0, 0, 0, k1), M0), V, { alfa: 1 - 0.6 * hay * (1 - kale), ok: ara(t, 2.4, 2.8) * (1 - kale) });
    if (k2 > 0) motifCiz(ctx, zincir(Katla(th, 0, 0, k2), R1, M0), V, { ok: ara(t, 3.8, 4.2) * (1 - kale), parilti: 0.9 });
    // 2θ yayı
    const dA = ara(t, 4.6, 5.2) * (1 - kale);
    if (dA > 0) {
      const c0 = uygula(tabanM, [0, 0]);
      const r = Math.hypot(c0[0], c0[1]), a0 = Math.atan2(c0[1], c0[0]);
      ctx.save(); ctx.globalAlpha *= dA; ctx.strokeStyle = E.R('menekse'); ctx.lineWidth = 3.5; ctx.setLineDash([2, 8]); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(O[0], O[1], r * u, -a0, -a0 - 2 * th * ara(t, 4.6, 5.8), true); ctx.stroke(); ctx.restore();
      E.cizgi(ctx, [O, uygula(V, c0)], { renk: 'gumus', kalinlik: 2, kesik: [5, 6], alfa: dA * 0.7 });
      E.cizgi(ctx, [O, uygula(V, uygula(Don(2 * th), c0))], { renk: 'gumus', kalinlik: 2, kesik: [5, 6], alfa: dA * 0.7 });
      const q = uygula(V, uygula(Don(th), [r * 0.62 * Math.cos(a0), r * 0.62 * Math.sin(a0)]));
      E.etiket(ctx, `2θ = ${Math.round(2 * thD)}°`, q[0], q[1], { boyut: 26, renk: 'menekse', agirlik: 700, alfa: ara(t, 5.6, 6.0) * (1 - kale), kenar: 'menekse' });
    }
    // kaleydoskop: 60°'de altı kopya
    if (kale > 0) {
      // taban, a₁ görüntüsü ve a₂∘a₁ (120° dönme) zaten çizili; kalan üç kopya belirir
      [[GRUP[2][0], 10.2], [GRUP[4][0], 10.6], [GRUP[5][0], 11.0]].forEach(([g, t0]) => {
        motifCiz(ctx, carp(g, tabanM), V, { alfa: ara(t, t0, t0 + 0.6, 'cik3'), parilti: 0.9 });
      });
      // üçüncü ayna doğrusu (120°) da desende kendiliğinden belirir
      ayna(ctx, V, E.der(120), [0, 0], 6, { alfa: 0.5 * ara(t, 11.8, 12.6), kalin: 2 });
      E.isik(ctx, O[0], O[1], 260, 'turkuaz', 0.3 * E.nabiz(t, 12.0, 1.6));
    }
    // yazılar
    E.yazi(ctx, 'KESİŞEN İKİ AYNA', tx, ty, { boyut: 24, agirlik: 760, harfAra: 5, renk: 'limon', alfa: ara(t, 0.5, 1.0) });
    const f1 = ara(t, 5.2, 5.8, 'cik3') * (1 - ara(t, 9.6, 10.2));
    E.formul(ctx, `θ = ${Math.round(thD)}° \\Rightarrow \\t{dönme } \\c{menekse}{${Math.round(2 * thD)}°}`, tx, ty + E.yd(60, 46), { boyut: E.yd(36, 34), alfa: f1 });
    E.yazi(ctx, 'Merkez: aynaların kesiştiği nokta.', tx, ty + E.yd(130, 104), { boyut: E.yd(27, 27), agirlik: 560, renk: 'gumus', alfa: ara(t, 6.0, 6.6) * (1 - ara(t, 9.6, 10.2)), maxGen: tGen });
    E.formul(ctx, '\\kutu{limon}{a_{2}\\,∘\\,a_{1} = \\t{dönme } 2θ}', tx, ty + E.yd(210, 162), { boyut: E.yd(36, 34), alfa: ara(t, 6.6, 7.2, 'cik3') * (1 - ara(t, 9.6, 10.2)), parilti: 0.2, parRenk: 'limon' });
    const kA = ara(t, 10.4, 11.0, 'cik3');
    E.yazi(ctx, 'θ = 60° → altı kopya', tx, ty + E.yd(70, 50), { boyut: E.yd(34, 32), agirlik: 700, alfa: kA, maxGen: tGen });
    E.yazi(ctx, 'Üç dönme + üç yansıma: bir kilim rozeti.', tx, ty + E.yd(150, 106), { boyut: E.yd(28, 27), agirlik: 560, renk: 'gumus', alfa: ara(t, 11.6, 12.2), maxGen: tGen });
  };

  /* ---------- 7. Önerme: değişen ve değişmeyen ---------- */
  const onerme = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const kartlar = [
      ['YANSIMA', 'yön ters döner', Yans(Math.PI / 2), 'mercan'],
      ['ÖTELEME', 'yön korunur', Ote(0, 0), 'gok'],
      ['DÖNME', 'yön korunur', Don(E.der(90)), 'menekse'],
    ];
    const n = 3;
    const w = H ? 340 : 600, h = H ? 300 : 170, ara_ = H ? 36 : 22;
    const x0 = H ? ic.cx - (n * w + (n - 1) * ara_) / 2 : ic.cx - w / 2, y0 = H ? ic.y + 20 : ic.y + 10;
    kartlar.forEach(([ad, yon, M, renk], i) => {
      const a = ara(t, 0.3 + i * 0.5, 1.0 + i * 0.5, 'cik3');
      const x = H ? x0 + i * (w + ara_) : x0, y = H ? y0 : y0 + i * (h + ara_);
      E.panel(ctx, x, y, w, h, { vurgu: renk, alfa: a });
      const mx = H ? x + w / 2 : x + 120, my = H ? y + 150 : y + h / 2;
      const V = gorunum(mx, my, H ? 26 : 26);
      motifCiz(ctx, M, V, { alfa: a, ok: a, kalin: 2.5 });
      const ttx = H ? x + w / 2 : x + 380;
      E.yazi(ctx, ad, ttx, H ? y + 42 : y + h / 2 - 26, { boyut: 26, agirlik: 760, harfAra: 5, renk, alfa: a });
      E.yazi(ctx, yon, ttx, H ? y + 258 : y + h / 2 + 24, { boyut: 30, agirlik: 640, renk: i === 0 ? 'mercan' : 'turkuaz', alfa: a });
    });
    const by = H ? ic.y + 400 : ic.y + 3 * (h + 22) + 70;
    const bA = ara(t, 2.4, 3.0, 'cik3');
    E.yazi(ctx, 'Üçünde de görüntü, baştaki şekle eştir.', ic.cx, by, { boyut: E.yd(36, 32), agirlik: 700, renk: 'limon', alfa: bA, maxGen: E.yd(1100, 620), parilti: 0.25, parRenk: 'limon' });
    E.yazi(ctx, 'Uzunluklar, açılar, çevre ve alan değişmez.', ic.cx, by + E.yd(60, 84), { boyut: E.yd(30, 29), agirlik: 540, renk: 'gumus', alfa: ara(t, 3.2, 3.8), maxGen: E.yd(1100, 620) });
  };

  /* ---------- Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Yansıma yönü çevirir.', formul: '↺ \\to ↻' },
    { tr: 'Öteleme ve dönme yönü korur.', formul: '↺ \\to ↺' },
    { tr: 'Paralel iki ayna: öteleme.', formul: '\\t{aralık } d \\Rightarrow 2d' },
    { tr: 'Kesişen iki ayna: dönme.', formul: '\\t{açı } θ \\Rightarrow 2θ' },
    { tr: 'Görüntü her zaman eş.', formul: '\\t{çevre ve alan aynı}' },
  ], { aralik: 1.2 });

  /** Yerel bitiş kartı: motordaki E.bitisKarti iki satıra sarılan uzun laboratuvar adında
      (Dönüşüm ve Benzerlik Laboratuvarı) üst/alt yazılarla çakışıyor; burada başlık yüksekliği ölçülerek dizilir. */
  const bitisKarti = (ctx, s) => {
    const L = E.L, t = s.t, ic = L.icerik;
    const a1 = ara(t, 0, 0.9, 'cik3'), a2 = ara(t, 0.5, 1.4, 'cik3'), a3 = ara(t, 1.0, 1.9, 'cik3');
    const qrBoy = E.yd(220, 260);
    const qx = E.yd(L.cx + 170, L.cx - qrBoy / 2), qy = E.yd(L.cy - qrBoy / 2 - 40, ic.y + 400);
    const tx = E.yd(L.cx - 420, L.cx), hz = E.yd('left', 'center');
    const bas = E.yd(qy - 30, ic.y + 30);
    E.yazi(ctx, 'ŞİMDİ SEN DENE', tx, bas, { boyut: 26, agirlik: 700, harfAra: 6, renk: 'turkuaz', hiza: hz, alfa: a1 });
    const r = E.yazi(ctx, meta.labAd, tx, bas + 34, { boyut: E.yd(48, 44), agirlik: 760, hiza: hz, alfa: a1, maxGen: E.yd(540, 600), satirAra: 1.05, taban: 'top' });
    E.yazi(ctx, meta.labAciklama, tx, bas + 34 + r.h + 26, { boyut: 26, agirlik: 460, renk: 'gumus', hiza: hz, alfa: a2, maxGen: E.yd(520, 600), taban: 'top' });
    if (window.qrcode && meta.labUrl) {
      if (!E._qr || E._qr.url !== meta.labUrl) { const q = window.qrcode(0, 'M'); q.addData(meta.labUrl); q.make(); E._qr = { url: meta.labUrl, q }; }
      const q = E._qr.q, n = q.getModuleCount(), m = qrBoy / (n + 4);
      ctx.save(); ctx.globalAlpha *= a2;
      E.panel(ctx, qx, qy, qrBoy, qrBoy, { r: 16, renk: 'tebesir', dolguAlfa: 1, kenar: null });
      ctx.fillStyle = E.R('gece');
      for (let rr = 0; rr < n; rr++) for (let c = 0; c < n; c++) if (q.isDark(rr, c)) ctx.fillRect(qx + (c + 2) * m, qy + (rr + 2) * m, m + 0.4, m + 0.4);
      ctx.restore();
      E.isik(ctx, qx + qrBoy / 2, qy + qrBoy / 2, qrBoy, 'turkuaz', 0.12 * a2);
    }
    E.yazi(ctx, meta.labUrl.replace('https://', ''), E.yd(qx + qrBoy / 2, L.cx), qy + qrBoy + 34, { boyut: 22, agirlik: 520, renk: 'gumus', alfa: a2, maxGen: E.yd(600, 640) });
    E.yazi(ctx, 'Eksen · Hakan Ataş · CC BY-NC 4.0', L.cx, ic.y1 - E.yd(6, 10), { boyut: 22, agirlik: 520, renk: 'gumus', alfa: a3, harfAra: 1 });
  };

  E.film({
    meta,
    sure: 119.0,
    uc3b: [41.0, 47.0],
    sahneler: [
      { ad: 'Soğuk açılış: kilim deseni', bas: 0, son: 11.3, giris: 0, cikis: 0.7, itme: 0, ciz: acilis },
      { ad: 'İmza', bas: 11.0, son: 14.7, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 14.4, son: 18.7, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Yansıma: eş ama ters', bas: 18.4, son: 35.0, ciz: yansima },
      { ad: '3B: düzlemden çıkan yansıma', bas: 34.7, son: 50.5, itme: 0, ciz: uc3B },
      { ad: 'Öteleme ve dönme', bas: 50.2, son: 66.0, ciz: oteDon },
      { ad: 'Sürpriz: paralel iki ayna', bas: 65.7, son: 82.0, ciz: paralel },
      { ad: 'Sürpriz: kesişen iki ayna', bas: 81.7, son: 98.0, ciz: kesisen },
      { ad: 'Önerme: görüntü hep eş', bas: 97.7, son: 105.5, ciz: onerme },
      { ad: 'Aklında kalsın', bas: 105.2, son: 113.6, ciz: ozet },
      { ad: 'Laboratuvar', bas: 113.4, son: 119.0, cikis: 0.8, ciz: bitisKarti },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 5, renk1: 'turkuaz', renk2: 'mercan' }),
  });
})();
