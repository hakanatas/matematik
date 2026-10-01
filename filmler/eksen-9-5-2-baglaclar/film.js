/* ==========================================================================
   EKSEN 9.5.2 — Kapılar
   Tek fikir: Algoritmanın içindeki mantık bağlaçları kapılardır. VE iki ışık
   birden ister, VEYA biri yeter der, YA DA tam birini ister; İSE bir söz verir.
   Niceleyiciler döngüdür: HER ilk ✗'te, BAZI ilk ✓'te durur.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp, yd } = E;

  const meta = {
    kod: 'MAT.9.5.2',
    tema: 'Algoritma ve Bilişim',
    ad: 'Kapılar',
    adEn: 'Gates',
    labAd: 'Algoritma Laboratuvarı',
    labAciklama: 'Mantık kapılarıyla kendi algoritmanı kur: bağlacı değiştir, yılları ve şifreleri devreden geçir.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-algoritma/',
  };

  /* ---------- Yol ve ışık parçacıkları ---------- */
  const yol = (pts) => {
    const u = [0];
    for (let i = 1; i < pts.length; i++) u.push(u[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, u, top: u[u.length - 1] };
  };
  const yolda = (Y, f) => {
    const d = clamp(f) * Y.top;
    for (let i = 1; i < Y.pts.length; i++) {
      if (d <= Y.u[i] || i === Y.pts.length - 1) {
        const q = clamp((d - Y.u[i - 1]) / Math.max(1e-6, Y.u[i] - Y.u[i - 1]));
        return [lerp(Y.pts[i - 1][0], Y.pts[i][0], q), lerp(Y.pts[i - 1][1], Y.pts[i][1], q)];
      }
    }
    return Y.pts[0];
  };
  /** Tek ışık parçacığı (toplamalı) */
  const parca = (ctx, x, y, r, renk, a) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= clamp(a);
    ctx.fillStyle = E.rgba(renk, 0.16); ctx.beginPath(); ctx.arc(x, y, r * 3.4, 0, E.TAU); ctx.fill();
    ctx.fillStyle = E.rgba(renk, 0.95); ctx.beginPath(); ctx.arc(x, y, r, 0, E.TAU); ctx.fill();
    ctx.restore();
  };
  /**
   * Tel: pts boyunca uzanan iletken. on: sinyal cephesinin ilerlemesi (0..1).
   * deger 1 ise tel yanar ve üzerinde ışık parçacıkları akar. Parçacık konumu
   * yalnızca t ve tohumdan türetilir: f = (t·hız/uzunluk + hash(i)) mod 1.
   */
  const tel = (ctx, pts, o) => {
    o = Object.assign({ renk: 'turkuaz', on: 0, deger: 0, alfa: 1, p: 1, t: 0, tohum: 1, hiz: 130, sik: 24 }, o);
    if (o.alfa <= 0.002 || o.p <= 0) return;
    E.cizgi(ctx, pts, { renk: 'cizgi', kalinlik: 2.5, alfa: o.alfa * 0.9, p: o.p });
    if (o.on <= 0) return;
    if (!o.deger) { E.cizgi(ctx, pts, { renk: 'sis', kalinlik: 3.5, alfa: o.alfa, p: o.on }); return; }
    const Y = yol(pts);
    E.cizgi(ctx, pts, { renk: o.renk, kalinlik: 3, parilti: 0.8, p: o.on, alfa: o.alfa });
    const n = Math.max(3, Math.round(Y.top / o.sik));
    for (let i = 0; i < n; i++) {
      const f = (o.t * o.hiz / Y.top + E.hash(i, o.tohum)) % 1;
      if (f > o.on) continue;
      const [x, y] = yolda(Y, f);
      parca(ctx, x, y, 1.8 + 1.6 * E.hash(i, o.tohum + 5), i % 4 ? o.renk : 'tebesir', o.alfa * clamp(0.25 + (o.on - f) * Y.top / 40));
    }
    if (o.on < 1) { const [x, y] = yolda(Y, o.on); E.isik(ctx, x, y, 34, o.renk, 0.7 * o.alfa); parca(ctx, x, y, 4, 'tebesir', o.alfa); }
  };

  /* ---------- Kapı şekilleri (aynı nokta sayısı: biçim değiştirebilsin) ---------- */
  const NS = 20;
  const qb = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
  const sekilVe = (x, y, s) => {
    const r = 0.8 * s, P = [];
    for (let i = 0; i < NS; i++) P.push([x - s, lerp(y + r, y - r, i / NS)]);
    for (let i = 0; i < NS; i++) {
      const u = i / NS;
      if (u < 0.45) P.push([lerp(x - s, x, u / 0.45), y - r]);
      else { const a = -Math.PI / 2 + ((u - 0.45) / 0.55) * (Math.PI / 2); P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    }
    for (let i = 0; i < NS; i++) {
      const u = i / NS;
      if (u < 0.55) { const a = (u / 0.55) * (Math.PI / 2); P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
      else P.push([lerp(x, x - s, (u - 0.55) / 0.45), y + r]);
    }
    return P;
  };
  const sekilVeya = (x, y, s) => {
    const r = 0.8 * s, P = [];
    const A = [x - s, y + r], B = [x - s, y - r], T = [x + s, y];
    for (let i = 0; i < NS; i++) P.push(qb(A, [x - 0.55 * s, y], B, i / NS));
    for (let i = 0; i < NS; i++) P.push(qb(B, [x + 0.25 * s, y - r], T, i / NS));
    for (let i = 0; i < NS; i++) P.push(qb(T, [x + 0.25 * s, y + r], A, i / NS));
    return P;
  };
  /** Kapı: tur 've' | 'veya'; hedef + morf ile biçim değiştirir; xor: ek yay; ters: üst girişte değil halkası */
  const kapi = (ctx, x, y, s, o) => {
    o = Object.assign({ tur: 've', hedef: null, morf: 0, renk: 'turkuaz', cikis: 0, alfa: 1, sembol: null, xor: false, ters: false, sembolRenk: 'tebesir' }, o);
    if (o.alfa <= 0.002) return;
    const A = (o.tur === 've' ? sekilVe : sekilVeya)(x, y, s);
    const B = o.hedef ? (o.hedef === 've' ? sekilVe : sekilVeya)(x, y, s) : A;
    const P = A.map((p, i) => [lerp(p[0], B[i][0], o.morf), lerp(p[1], B[i][1], o.morf)]);
    ctx.save(); ctx.globalAlpha *= o.alfa;
    ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.fillStyle = E.rgba('lacivert', 0.97); ctx.fill();
    if (o.cikis > 0) { ctx.fillStyle = E.rgba(o.renk, 0.24 * o.cikis); ctx.fill(); }
    ctx.restore();
    if (o.cikis > 0) E.isik(ctx, x, y, s * 2.6, o.renk, 0.32 * o.cikis * o.alfa);
    E.cizgi(ctx, P, { kapali: true, renk: o.renk, kalinlik: 3, parilti: 0.35 + 0.8 * o.cikis, alfa: o.alfa });
    const veA = o.tur === 've' ? (o.hedef ? 1 - o.morf : 1) : (o.hedef === 've' ? o.morf : 0);
    if (veA > 0.01) E.cizgi(ctx, [[x + 0.8 * s, y], [x + s, y]], { renk: o.renk, kalinlik: 3, alfa: o.alfa * veA });
    if (o.xor) {
      const r = 0.8 * s, pts = [];
      for (let i = 0; i <= NS; i++) pts.push(qb([x - 1.24 * s, y + r], [x - 0.79 * s, y], [x - 1.24 * s, y - r], i / NS));
      E.cizgi(ctx, pts, { renk: o.renk, kalinlik: 3, alfa: o.alfa, parilti: 0.35 });
    }
    if (o.ters) halka(ctx, x - 0.83 * s - 9, y - 0.4 * s, 8, o.renk, o.alfa);
    if (o.sembol) E.formul(ctx, o.sembol, x - 0.12 * s, y, { boyut: s * 0.7, renk: o.sembolRenk, alfa: o.alfa });
  };
  /** Değil halkası */
  const halka = (ctx, x, y, r, renk, alfa = 1) => {
    ctx.save(); ctx.globalAlpha *= alfa;
    ctx.beginPath(); ctx.arc(x, y, r, 0, E.TAU); ctx.fillStyle = E.P.lacivert; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = E.R(renk); ctx.stroke();
    ctx.restore();
  };
  /** Çıkış lambası */
  const lamba = (ctx, x, y, r, a, renk, alfa = 1) => {
    if (alfa <= 0.002) return;
    E.isik(ctx, x, y, r * 6, renk, 0.55 * a * alfa);
    ctx.save(); ctx.globalAlpha *= alfa;
    ctx.beginPath(); ctx.arc(x, y, r, 0, E.TAU);
    ctx.fillStyle = E.karistir('lacivert', renk, a * 0.9); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = E.karistir('cizgi', renk, Math.max(a, 0.25)); ctx.stroke();
    ctx.restore();
    if (a > 0.05) parca(ctx, x, y, r * 0.45, 'tebesir', a * alfa);
  };
  /** ✓ / ✗ rozeti */
  const rozet = (ctx, x, y, r, dogru, a, renkD = 'turkuaz', renkY = 'mercan') => {
    if (a <= 0.01) return;
    const rk = dogru ? renkD : renkY;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.beginPath(); ctx.arc(x, y, r, 0, E.TAU); ctx.fillStyle = E.P.lacivert; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = E.R(rk); ctx.stroke();
    ctx.restore();
    E.isik(ctx, x, y, r * 2.4, rk, 0.25 * a);
    E.yazi(ctx, dogru ? '✓' : '✗', x, y + 1, { boyut: r * 1.35, agirlik: 700, renk: rk, alfa: a });
  };
  /** Hesaplanmış yazı (kayıt dışı): yalnızca kamera yakınlaşmasında ekran dışına taşan takvim için */
  const hamYazi = (ctx, m, x, y, o) => {
    ctx.save(); ctx.globalAlpha *= o.alfa ?? 1;
    ctx.font = E.fontStr({ boyut: o.boyut, agirlik: o.agirlik || 600, font: o.font });
    ctx.textAlign = o.hiza || 'center'; ctx.textBaseline = 'middle';
    if (o.harfAra) ctx.letterSpacing = o.harfAra + 'px';
    ctx.fillStyle = E.R(o.renk || 'tebesir'); ctx.fillText(m, x, y);
    ctx.restore();
  };

  /* ---------- Sözde kod paneli ---------- */
  /** satirlar: [[ [metin, renk], ... ], ...]; aktif(i): 0..1 vurgusu */
  const kodPaneli = (ctx, x, y, w, satirlar, o) => {
    o = Object.assign({ boyut: 24, satirH: 40, alfa: 1, aktif: () => 0, baslik: 'SÖZDE KOD', yaz: 1, vurguRenk: 'gok' }, o);
    if (o.alfa <= 0.002) return;
    const ust = 48, h = ust + satirlar.length * o.satirH + 16;
    E.panel(ctx, x, y, w, h, { alfa: o.alfa, vurgu: o.vurguRenk });
    E.yazi(ctx, o.baslik, x + 24, y + 26, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'gumus', hiza: 'left', alfa: o.alfa, font: 'mono' });
    const toplam = satirlar.length;
    satirlar.forEach((satir, i) => {
      const yy = y + ust + i * o.satirH + o.satirH / 2;
      const ak = o.aktif(i);
      if (ak > 0.01) {
        ctx.save(); ctx.globalAlpha *= o.alfa * ak;
        ctx.fillStyle = E.rgba(o.vurguRenk, 0.16); ctx.fillRect(x + 8, yy - o.satirH / 2 + 3, w - 16, o.satirH - 6);
        ctx.fillStyle = E.rgba(o.vurguRenk, 0.95); ctx.fillRect(x + 8, yy - o.satirH / 2 + 3, 4, o.satirH - 6);
        ctx.restore();
      }
      const gor = clamp(o.yaz * toplam - i);
      if (gor <= 0) return;
      let xx = x + 24;
      for (const tok of satir) {
        const [m, renk, ek] = tok;
        const op = { boyut: o.boyut, agirlik: ek?.agirlik || 520, font: 'mono' };
        const gw = E.yaziOlc(ctx, m, op);
        const bosluk = m.length - m.trimStart().length;
        const bw = bosluk ? E.yaziOlc(ctx, m.slice(0, bosluk), op) : 0;
        const ic = m.trim();
        if (ic && (ek?.alfa ?? 1) > 0.002) E.yazi(ctx, ic, xx + bw + (ek?.dx || 0), yy, Object.assign({}, op, { renk, hiza: 'left', alfa: o.alfa * gor * (ek?.alfa ?? 1), parilti: ek?.parilti, cakisabilir: ek?.cakisabilir }));
        xx += ek?.genislik ?? gw;
      }
    });
    return h;
  };

  /* ---------- Artık yıl devresi ---------- */
  const devreGeo = (k) => {
    const sx = k.w / 700, h = k.h, s = yd(44, 40);
    const cw = yd(220, 210), ch = yd(54, 52);
    const yA = k.y + 0.13 * h, yB = k.y + 0.43 * h, yC = k.y + 0.86 * h;
    return {
      s, cw, ch, yA, yB, yC,
      g1: [k.x + 400 * sx, (yA + yB) / 2],
      g2: [k.x + 582 * sx, k.y + 0.64 * h],
      lamba: [k.x + k.w - 24, k.y + 0.64 * h],
      e1: k.x + 300 * sx, e2: k.x + 488 * sx, e3: k.x + 508 * sx,
    };
  };
  const KOSUL = [
    { harf: 'p', metin: '4’e bölünür', renk: 'turkuaz', bol: 4 },
    { harf: 'q', metin: '100’e bölünür', renk: 'gok', bol: 100 },
    { harf: 'r', metin: '400’e bölünür', renk: 'menekse', bol: 400 },
  ];
  /** D: yil, faz (0..3: algılayıcı → kapı 1 → kapı 2 → lamba), bozuk (0..1), alfa, insa, t, giris [x,y], uyari */
  const devre = (ctx, k, D) => {
    const G = devreGeo(k), s = G.s, t = D.t;
    const al = D.alfa ?? 1, insa = D.insa ?? 1, f = D.faz ?? -1, bz = D.bozuk ?? 0;
    const y = D.yil;
    const a = y % 4 === 0, b = y % 100 === 0, c = y % 400 === 0;
    const g1 = bz > 0.5 ? (a || !b) : (a && !b);
    const g2 = g1 || c;
    const on1 = ara(f, 0.6, 1.4, 'lin'), on2 = ara(f, 1.45, 2.1, 'lin'), onC = ara(f, 0.6, 2.1, 'lin'), on3 = ara(f, 2.15, 2.8, 'lin');
    const sag = k.x + G.cw;
    const i1a = [G.g1[0] - 0.8 * s, G.g1[1] - 0.4 * s], i1b = [G.g1[0] - 0.8 * s, G.g1[1] + 0.4 * s];
    const i2a = [G.g2[0] - 0.8 * s, G.g2[1] - 0.4 * s], i2b = [G.g2[0] - 0.8 * s, G.g2[1] + 0.4 * s];
    const notX = G.g1[0] - s - 22;
    const k1Renk = bz > 0.5 ? 'mercan' : 'turkuaz';
    const lRenk = D.uyari ? 'mercan' : 'limon';
    // giriş parçacıkları: yıl, üç algılayıcıya akar
    if (D.giris && f > 0) {
      const env = ara(f, 0, 0.15) * (1 - ara(f, 0.5, 0.85));
      if (env > 0.01) {
        [G.yA, G.yB, G.yC].forEach((yy, j) => {
          const A0 = D.giris, B0 = [k.x + 6, yy], C0 = [D.giris[0], yy];
          for (let i = 0; i < 14; i++) {
            const u = (t * 1.3 + E.hash(i, 40 + j)) % 1;
            const [px, py] = qb(A0, C0, B0, u);
            parca(ctx, px, py, 1.8 + 1.4 * E.hash(i, 50 + j), i % 3 ? KOSUL[j].renk : 'tebesir', env * al * (0.4 + 0.6 * u));
          }
        });
      }
    }
    // teller
    tel(ctx, [[sag, G.yA], [G.e1, G.yA], [G.e1, i1a[1]], i1a], { renk: 'turkuaz', on: on1, deger: a, t, tohum: 11, alfa: al, p: insa });
    tel(ctx, [[sag, G.yB], [G.e1, G.yB], [G.e1, i1b[1]], [notX - 8, i1b[1]]], { renk: 'gok', on: ara(f, 0.6, 1.0, 'lin'), deger: b, t, tohum: 12, alfa: al, p: insa });
    tel(ctx, [[notX + 8, i1b[1]], i1b], { renk: 'gok', on: ara(f, 1.0, 1.4, 'lin'), deger: !b, t, tohum: 13, alfa: al, p: insa });
    tel(ctx, [[G.g1[0] + s, G.g1[1]], [G.e2, G.g1[1]], [G.e2, i2a[1]], i2a], { renk: k1Renk, on: on2, deger: g1, t, tohum: 14, alfa: al, p: insa });
    tel(ctx, [[sag, G.yC], [G.e3, G.yC], [G.e3, i2b[1]], i2b], { renk: 'menekse', on: onC, deger: c, t, tohum: 15, alfa: al, p: insa });
    tel(ctx, [[G.g2[0] + s, G.g2[1]], [G.lamba[0] - 16, G.g2[1]]], { renk: lRenk, on: on3, deger: g2, t, tohum: 16, alfa: al, p: insa });
    halka(ctx, notX, i1b[1], 8, 'gok', al * insa);
    // kapılar
    kapi(ctx, G.g1[0], G.g1[1], s, { tur: 've', hedef: 'veya', morf: ara(bz, 0, 1, 'io3'), renk: k1Renk, cikis: g1 ? ara(f, 1.35, 1.55) : 0, alfa: al * insa, sembol: bz > 0.5 ? '\\or' : '\\and', sembolRenk: bz > 0.5 ? 'mercan' : 'tebesir' });
    kapi(ctx, G.g2[0], G.g2[1], s, { tur: 'veya', renk: 'limon', cikis: g2 ? ara(f, 2.05, 2.25) : 0, alfa: al * insa, sembol: '\\or' });
    // takılma: sinyal kapıda sönerse kısa bir kırmızı nabız
    if (a && !g1) E.isik(ctx, G.g1[0], G.g1[1], s * 3, 'mercan', 0.45 * E.nabiz(f, 1.35, 0.6) * al);
    const yanik = g2 ? ara(f, 2.75, 2.95) : 0;
    lamba(ctx, G.lamba[0], G.lamba[1], 16, yanik, lRenk, al * insa);
    if (yanik > 0) E.isik(ctx, G.lamba[0], G.lamba[1], 160, lRenk, 0.4 * E.nabiz(f, 2.8, 0.8) * al);
    E.yazi(ctx, 'ARTIK YIL', k.x + k.w, G.lamba[1] + 52, { boyut: 22, agirlik: 700, harfAra: 2, hiza: 'right', renk: yanik > 0.5 ? lRenk : 'gumus', alfa: al * insa * (0.55 + 0.45 * yanik) });
    // algılayıcılar
    [G.yA, G.yB, G.yC].forEach((yy, j) => {
      const K = KOSUL[j];
      E.panel(ctx, k.x, yy - G.ch / 2, G.cw, G.ch, { alfa: al * insa, vurgu: K.renk, r: 12 });
      E.formul(ctx, K.harf, k.x + 24, yy - 2, { boyut: 30, renk: K.renk, alfa: al * insa });
      E.yazi(ctx, K.metin, k.x + 44, yy, { boyut: yd(24, 22), agirlik: 560, hiza: 'left', alfa: al * insa });
      const deger = j === 0 ? a : j === 1 ? b : c;
      rozet(ctx, sag + 22, yy, 15, deger, ara(f, 0.3 + j * 0.12, 0.5 + j * 0.12) * al);
    });
    return { g1, g2, a, b, c };
  };
  /** Sözde kod satırları (artık yıl) */
  const artikKod = (bz) => [
    [['eğer ', 'menekse'], ['(y mod 4 = 0 ', 'tebesir'], ['ve', 'turkuaz', { agirlik: 760, alfa: 1 - bz, cakisabilir: true, genislik: 0 }], ['veya', 'mercan', { agirlik: 760, alfa: bz, parilti: 0.5 * bz, cakisabilir: true }]],
    [['      y mod 100 ≠ 0)', 'tebesir']],
    [['   veya ', 'turkuaz', { agirlik: 760 }], ['y mod 400 = 0:', 'tebesir']],
    [['    yaz ', 'menekse'], ['"artık yıl"', 'limon']],
    [['değilse:', 'menekse']],
    [['    yaz ', 'menekse'], ['"değil"', 'gumus']],
  ];
  const sembolik = (ctx, x, y, bz, o) => {
    const b = o.boyut;
    E.formul(ctx, '(\\c{turkuaz}{p} \\c{turkuaz}{\\and} \\neg \\c{gok}{q}) \\c{limon}{\\or} \\c{menekse}{r}', x, y, { boyut: b, alfa: o.alfa * (1 - bz), cakisabilir: bz > 0.02, parilti: o.parilti });
    if (bz > 0.002) E.formul(ctx, '(\\c{turkuaz}{p} \\c{mercan}{\\or} \\neg \\c{gok}{q}) \\c{limon}{\\or} \\c{menekse}{r}', x, y, { boyut: b, alfa: o.alfa * bz, cakisabilir: true, parilti: 0.4 * bz, parRenk: 'mercan' });
  };

  /* ---------- 1. Soğuk açılış: 29 Şubat 1900 ---------- */
  const takvim = (ctx, x, y, w, o) => {
    // Şubat 1900: 1 Şubat perşembe (Pzt'den 4. sütun)
    const hc = w / 7, ust = yd(118, 128);
    const h = ust + hc * 0.75 + 5 * hc + 20;
    E.panel(ctx, x, y, w, h, { alfa: o.alfa, vurgu: 'turkuaz' });
    hamYazi(ctx, 'ŞUBAT', x + 28, y + 34, { boyut: 24, agirlik: 700, harfAra: 6, renk: 'turkuaz', hiza: 'left', alfa: o.alfa });
    hamYazi(ctx, '1900', x + 26, y + 82, { boyut: yd(58, 64), agirlik: 760, hiza: 'left', alfa: o.alfa });
    const gun = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
    gun.forEach((g, i) => hamYazi(ctx, g, x + hc * (i + 0.5), y + ust + hc * 0.3, { boyut: 22, agirlik: 600, renk: 'gumus', alfa: o.alfa }));
    const gy = y + ust + hc * 0.75;
    let h29 = null;
    for (let d = 1; d <= 29; d++) {
      const i = d + 2, sx = i % 7, sy = Math.floor(i / 7);
      const cx = x + hc * (sx + 0.5), cy = gy + hc * (sy + 0.5);
      if (d === 29) { h29 = [cx, cy]; continue; }
      hamYazi(ctx, String(d), cx, cy, { boyut: yd(22, 26), agirlik: 520, renk: sx >= 5 ? 'gumus' : 'tebesir', alfa: o.alfa * 0.9 });
    }
    // 29: soru, sonra ret
    const [cx, cy] = h29;
    const nab = 0.5 + 0.5 * Math.sin(o.t * 4);
    ctx.save(); ctx.globalAlpha *= o.alfa;
    E.yuvarlakDik(ctx, cx - hc * 0.44, cy - hc * 0.44, hc * 0.88, hc * 0.88, 8);
    ctx.strokeStyle = E.karistir('limon', 'mercan', o.ret); ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]); ctx.stroke();
    ctx.restore();
    E.isik(ctx, cx, cy, hc * 1.6, o.ret > 0.5 ? 'mercan' : 'limon', (0.25 + 0.2 * nab) * o.alfa);
    hamYazi(ctx, '29', cx, cy, { boyut: yd(24, 28), agirlik: 760, renk: o.ret > 0.5 ? 'mercan' : 'limon', alfa: o.alfa });
    if (o.ret > 0) {
      const p = o.ret;
      E.cizgi(ctx, [[cx - hc * 0.36, cy - hc * 0.36], [cx + hc * 0.36, cy + hc * 0.36]], { renk: 'mercan', kalinlik: 4, parilti: 1, p: clamp(p * 2), alfa: o.alfa });
      E.cizgi(ctx, [[cx + hc * 0.36, cy - hc * 0.36], [cx - hc * 0.36, cy + hc * 0.36]], { renk: 'mercan', kalinlik: 4, parilti: 1, p: clamp(p * 2 - 1), alfa: o.alfa });
    }
    return { h, c29: h29, yil: [x + 26 + yd(70, 76), y + 82] };
  };
  const acilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const tw = H ? 378 : 340, tx = H ? ic.x + 4 : L.cx - tw / 2, ty = H ? ic.y + 16 : ic.y;
    const k = H ? { x: ic.x + 448, y: ic.y + 40, w: 704, h: 430 } : { x: ic.x, y: ic.y + 494, w: 640, h: 290 };
    // kamera: 29 hücresinden geri çekil
    const hc = tw / 7, ust = yd(118, 128);
    const c29 = [tx + hc * 3.5, ty + ust + hc * 0.75 + hc * 4.5];
    const p = ara(t, 0.2, 3.8, 'io3');
    const z = lerp(2.6, 1, p);
    ctx.save();
    E.kamera(ctx, { x: lerp(c29[0], L.cx, p), y: lerp(c29[1], L.cy, p), z });
    const ret = ara(t, 8.7, 9.5);
    const T = takvim(ctx, tx, ty, tw, { alfa: ara(t, 0, 0.6), t, ret });
    ctx.restore();
    const faz = clamp((t - 3.9) / 4.6) * 3.0;
    devre(ctx, k, { yil: 1900, faz, t, alfa: ara(t, 3.0, 3.8), insa: ara(t, 3.0, 4.0, 'io2'), giris: T.yil });
    // hüküm
    const hk = ara(t, 8.8, 9.4, 'cik3');
    const vx = H ? tx + tw / 2 : L.cx, vy = H ? ty + T.h + 46 : ty + T.h + 32;
    E.yazi(ctx, '29 Şubat 1900 yok.', vx, vy, { boyut: H ? 30 : 30, agirlik: 700, renk: 'mercan', alfa: hk, parilti: 0.4 });
    E.isik(ctx, k.x + k.w / 2, k.y + k.h / 2, 420, 'mercan', 0.16 * E.nabiz(t, 8.7, 1.4));
  };

  /* ---------- 2. Üç kapı: VE, VEYA, YA DA ---------- */
  const SATIR = [[1, 1], [1, 0], [0, 1], [0, 0]];
  const KAPI3 = [
    { ad: 'VE', sembol: '\\and', tur: 've', renk: 'turkuaz', f: (p, q) => p && q },
    { ad: 'VEYA', sembol: '\\or', tur: 'veya', renk: 'gok', f: (p, q) => p || q },
    { ad: 'YA DA', sembol: '\\xor', tur: 'veya', xor: true, renk: 'menekse', f: (p, q) => p !== q },
  ];
  const tablo = (ctx, x0, y0, cw, hh, rh, basliklar, renkler, deger, o) => {
    // deger(r, c) → {v, a (yazılma), aktif}
    basliklar.forEach((b, c) => {
      E.formul(ctx, b, x0 + cw * (c + 0.5), y0 + hh / 2, { boyut: yd(30, 28), renk: renkler[c] || 'gumus', alfa: o.alfa });
    });
    E.cizgi(ctx, [[x0, y0 + hh], [x0 + cw * basliklar.length, y0 + hh]], { renk: 'cizgi', kalinlik: 2, alfa: o.alfa });
    for (let r = 0; r < 4; r++) {
      const yy = y0 + hh + rh * r;
      const ak = o.aktif ? o.aktif(r) : 0;
      if (ak > 0.01) {
        ctx.save(); ctx.globalAlpha *= o.alfa * ak;
        E.yuvarlakDik(ctx, x0 - 6, yy + 4, cw * basliklar.length + 12, rh - 8, 10);
        ctx.strokeStyle = E.rgba('tebesir', 0.5); ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
      }
      for (let c = 0; c < basliklar.length; c++) {
        const d = deger(r, c);
        const cx = x0 + cw * c + 4, cy = yy + 6, w = cw - 8, h = rh - 12;
        ctx.save(); ctx.globalAlpha *= o.alfa;
        E.yuvarlakDik(ctx, cx, cy, w, h, 8);
        ctx.fillStyle = E.rgba('lacivert', 0.6); ctx.fill();
        const rk = renkler[c];
        if (d.v && rk && d.a > 0) { ctx.globalAlpha *= d.a; ctx.fillStyle = E.rgba(rk, 0.26); ctx.fill(); ctx.strokeStyle = E.rgba(rk, 0.9); ctx.lineWidth = 2; ctx.stroke(); }
        else if (d.yanlis && d.a > 0) { ctx.globalAlpha *= d.a; ctx.fillStyle = E.rgba('mercan', 0.22); ctx.fill(); ctx.strokeStyle = E.rgba('mercan', 0.9); ctx.lineWidth = 2; ctx.stroke(); }
        ctx.restore();
        if (d.v && rk && d.a > 0) E.isik(ctx, cx + w / 2, cy + h / 2, w * 0.8, rk, 0.16 * d.a * o.alfa);
        if (d.a > 0) E.yazi(ctx, d.v ? '1' : '0', cx + w / 2, cy + h / 2 + 1, { boyut: yd(30, 28), agirlik: 640, renk: d.yanlis ? 'mercan' : d.v ? 'tebesir' : 'gumus', alfa: o.alfa * d.a });
        if (d.halka > 0) {
          ctx.save(); ctx.globalAlpha *= o.alfa * d.halka;
          E.yuvarlakDik(ctx, cx - 5, cy - 5, w + 10, h + 10, 12);
          ctx.strokeStyle = E.R(d.halkaRenk || 'limon'); ctx.lineWidth = 3; ctx.stroke();
          ctx.restore();
          E.isik(ctx, cx + w / 2, cy + h / 2, w * 1.1, d.halkaRenk || 'limon', 0.25 * d.halka * o.alfa);
        }
      }
    }
  };
  /** Giriş kaynağı: değer çemberi */
  const kaynak = (ctx, x, y, harf, v, a, alfa, renk = 'tebesir') => {
    E.isik(ctx, x, y, 90, 'gok', 0.3 * v * a * alfa);
    ctx.save(); ctx.globalAlpha *= alfa;
    ctx.beginPath(); ctx.arc(x, y, 26, 0, E.TAU); ctx.fillStyle = E.karistir('lacivert', 'gok', 0.3 * v * a); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = E.karistir('cizgi', 'gok', v ? a : 0.2); ctx.stroke();
    ctx.restore();
    E.formul(ctx, harf, x, y - 50, { boyut: 32, renk, alfa });
    if (a > 0.01) E.yazi(ctx, v ? '1' : '0', x, y + 1, { boyut: 30, agirlik: 700, renk: v ? 'tebesir' : 'gumus', alfa: alfa * a });
  };
  const ucKapi = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const sz = H ? 46 : 40;
    const gx = H ? ic.x + 380 : ic.x + 350;
    const gys = H ? [ic.y + 80, ic.y + 265, ic.y + 450] : [ic.y + 60, ic.y + 200, ic.y + 340];
    const src = H ? [[ic.x + 40, ic.y + 172], [ic.x + 40, ic.y + 358]] : [[ic.x + 46, ic.y + 130], [ic.x + 46, ic.y + 270]];
    const bus = H ? [ic.x + 150, ic.x + 210] : [ic.x + 130, ic.x + 180];
    const insa = ara(t, 0.1, 1.6, 'io2');
    // aktif satır
    const RT = 1.8, RD = 2.4;
    let r = -1, u = 0;
    if (t >= RT && t < RT + 4 * RD) { r = Math.floor((t - RT) / RD); u = t - RT - r * RD; }
    else if (t >= 11.8) { r = 0; u = t - 11.8; }
    const [pv, qv] = r >= 0 ? SATIR[r] : [0, 0];
    const onG = r >= 0 ? ara(u, 0.15, 0.95, 'lin') : 0;
    const onC = r >= 0 ? ara(u, 0.95, 1.35, 'lin') : 0;
    // teller
    KAPI3.forEach((K, i) => {
      const gy = gys[i];
      const xin = gx - 0.8 * sz - (K.xor ? 0 : 0);
      tel(ctx, [[src[0][0] + 26, src[0][1]], [bus[0], src[0][1]], [bus[0], gy - 0.4 * sz], [xin, gy - 0.4 * sz]], { renk: 'gok', on: onG, deger: pv, t, tohum: 20 + i, p: insa });
      tel(ctx, [[src[1][0] + 26, src[1][1]], [bus[1], src[1][1]], [bus[1], gy + 0.4 * sz], [xin, gy + 0.4 * sz]], { renk: 'gok', on: onG, deger: qv, t, tohum: 30 + i, p: insa });
      const out = K.f(pv, qv);
      tel(ctx, [[gx + sz, gy], [gx + sz + 46, gy]], { renk: K.renk, on: onC, deger: out, t, tohum: 40 + i, p: insa });
    });
    // dallanma noktaları
    for (const [bx, ys] of [[bus[0], gys.map((g) => g - 0.4 * sz)], [bus[1], gys.map((g) => g + 0.4 * sz)]])
      for (const yy of ys) E.nokta(ctx, bx, yy, 4, { renk: 'cizgi', parilti: 0, alfa: insa });
    kaynak(ctx, src[0][0], src[0][1], 'p', pv, r >= 0 ? ara(u, 0, 0.2) : 0, insa);
    kaynak(ctx, src[1][0], src[1][1], 'q', qv, r >= 0 ? ara(u, 0, 0.2) : 0, insa);
    KAPI3.forEach((K, i) => {
      const gy = gys[i];
      const out = K.f(pv, qv);
      const ka = ara(t, 0.5 + i * 0.25, 1.2 + i * 0.25);
      kapi(ctx, gx, gy, sz, { tur: K.tur, xor: K.xor, renk: K.renk, cikis: out && r >= 0 ? ara(u, 0.9, 1.1) : 0, alfa: ka, sembol: K.sembol });
      const yan = out && r >= 0 ? ara(u, 1.3, 1.45) : 0;
      lamba(ctx, gx + sz + 62, gy, 16, yan, K.renk, ka);
      E.yazi(ctx, K.ad, gx + sz + 92, gy, { boyut: H ? 30 : 28, agirlik: 720, hiza: 'left', renk: yan > 0.5 ? K.renk : 'gumus', alfa: ka });
    });
    // doğruluk tablosu
    const cw = H ? 96 : 118, hh = H ? 70 : 58, rh = H ? 78 : 62;
    const x0 = H ? ic.x + 640 : ic.x + (ic.w - cw * 5) / 2, y0 = H ? ic.y + 16 : ic.y + 418;
    const ta = ara(t, 0.8, 1.6);
    const vurgu = ara(t, 12.6, 13.2) * 1;
    tablo(ctx, x0, y0, cw, hh, rh, ['p', 'q', 'p \\and q', 'p \\or q', 'p \\xor q'], [null, null, 'turkuaz', 'gok', 'menekse'], (rr, c) => {
      const yaz = t < RT ? 0 : rr < Math.floor((t - RT) / RD) || t >= RT + 4 * RD ? 1 : rr === Math.floor((t - RT) / RD) ? ara(t - RT - rr * RD, c < 2 ? 0.05 : 1.4, c < 2 ? 0.3 : 1.7) : 0;
      const [p, q] = SATIR[rr];
      const v = c === 0 ? p : c === 1 ? q : KAPI3[c - 2].f(p, q);
      const halka = rr === 0 && c === 3 ? vurgu : rr === 0 && c === 4 ? ara(t, 15.0, 15.6) : 0;
      return { v: !!v, a: yaz, halka, halkaRenk: c === 3 ? 'gok' : 'menekse' };
    }, { alfa: ta, aktif: (rr) => (rr === r ? (t < 11.8 ? 1 : 0.6) : 0) * ta });
    // vurgu yazıları: VEYA kapsayıcı, YA DA dışlayıcı
    const e1 = ara(t, 12.8, 13.4) * (H ? 1 : 1 - ara(t, 14.8, 15.2));
    const e2 = ara(t, 15.2, 15.8);
    if (H) {
      E.yazi(ctx, '∨  VEYA: biri yeter, ikisi de olur.', x0, y0 + hh + rh * 4 + 54, { boyut: 28, agirlik: 600, hiza: 'left', renk: 'gok', alfa: e1 });
      E.yazi(ctx, '⊻  YA DA: tam biri. Çay ya da kahve.', x0, y0 + hh + rh * 4 + 104, { boyut: 28, agirlik: 600, hiza: 'left', renk: 'menekse', alfa: e2 });
    } else {
      const yy = y0 + hh + rh * 4 + 34;
      E.yazi(ctx, '∨  VEYA: biri yeter, ikisi de olur.', L.cx, yy, { boyut: 26, agirlik: 600, renk: 'gok', alfa: e1 });
      E.yazi(ctx, '⊻  YA DA: tam biri. Çay ya da kahve.', L.cx, yy, { boyut: 26, agirlik: 600, renk: 'menekse', alfa: e2 });
    }
  };

  /* ---------- 3. İSE: bir söz ---------- */
  const bulut = (ctx, x, y, r, yagmur, t, alfa) => {
    ctx.save(); ctx.globalAlpha *= alfa;
    ctx.fillStyle = E.karistir('cizgi', 'gumus', 0.3 + 0.4 * yagmur);
    ctx.beginPath();
    ctx.arc(x - r * 0.55, y, r * 0.5, 0, E.TAU); ctx.arc(x, y - r * 0.25, r * 0.65, 0, E.TAU); ctx.arc(x + r * 0.6, y + r * 0.05, r * 0.45, 0, E.TAU);
    ctx.fill(); ctx.fillRect(x - r * 0.55, y, r * 1.15, r * 0.5);
    ctx.restore();
    if (yagmur > 0.01) {
      for (let i = 0; i < 9; i++) {
        const dx = (E.hash(i, 7) - 0.5) * r * 1.6;
        const f = (t * 1.6 + E.hash(i, 8)) % 1;
        const yy = y + r * 0.55 + f * r * 1.1;
        E.cizgi(ctx, [[x + dx, yy], [x + dx - 3, yy + 9]], { renk: 'gok', kalinlik: 2.2, alfa: alfa * yagmur * (1 - f) });
      }
    }
  };
  const yolIkon = (ctx, x, y, w, islak, t, alfa) => {
    ctx.save(); ctx.globalAlpha *= alfa;
    ctx.beginPath(); ctx.moveTo(x - w * 0.25, y - 22); ctx.lineTo(x + w * 0.25, y - 22); ctx.lineTo(x + w * 0.5, y + 22); ctx.lineTo(x - w * 0.5, y + 22); ctx.closePath();
    ctx.fillStyle = E.karistir('derin', 'gok', 0.35 * islak); ctx.fill();
    ctx.strokeStyle = E.rgba('cizgi', 1); ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    E.cizgi(ctx, [[x, y - 18], [x, y - 8]], { renk: 'gumus', kalinlik: 2.5, alfa });
    E.cizgi(ctx, [[x, y + 2], [x, y + 16]], { renk: 'gumus', kalinlik: 2.5, alfa });
    if (islak > 0.01) for (let i = 0; i < 3; i++) {
      const f = (t * 0.5 + i / 3) % 1;
      E.cizgi(ctx, [[x - w * 0.35 + f * w * 0.5, y + 10 - i * 8], [x - w * 0.25 + f * w * 0.5, y + 10 - i * 8]], { renk: 'tebesir', kalinlik: 2, alfa: alfa * islak * Math.sin(f * Math.PI) * 0.8 });
    }
  };
  const IS_SATIR = [
    'Yağmur yağdı, yol ıslak: söz tutuldu.',
    'Yağmur yağdı, yol kuru: söz bozuldu!',
    'Yağmur yok, yol ıslak: söz bozulmadı.',
    'Yağmur yok, yol kuru: söz bozulmadı.',
  ];
  const ise = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const sz = H ? 54 : 48;
    const g = H ? [ic.x + 400, ic.y + 250] : [ic.x + 360, ic.y + 196];
    const pS = H ? [ic.x + 90, ic.y + 160] : [ic.x + 90, ic.y + 108];
    const qS = H ? [ic.x + 90, ic.y + 350] : [ic.x + 90, ic.y + 286];
    const insa = ara(t, 0.1, 1.2, 'io2');
    const RT = 1.2, RD = 2.2;
    let r = -1, u = 0;
    if (t >= RT && t < RT + 4 * RD) { r = Math.floor((t - RT) / RD); u = t - RT - r * RD; }
    const [pv, qv] = r >= 0 ? SATIR[r] : [0, 0];
    const out = !pv || qv;
    const onG = r >= 0 ? ara(u, 0.1, 0.8, 'lin') : 0, onC = r >= 0 ? ara(u, 0.85, 1.2, 'lin') : 0;
    // söz
    E.yazi(ctx, '“Yağmur yağarsa yol ıslaktır.”', H ? ic.x + 300 : L.cx, H ? ic.y + 36 : ic.y + 20, { boyut: H ? 34 : 32, agirlik: 640, alfa: ara(t, 0.1, 0.8), renk: 'tebesir' });
    // teller ve kapı
    const xin = g[0] - 0.8 * sz;
    const bx = g[0] - 0.83 * sz - 18;
    tel(ctx, [[pS[0] + 70, pS[1]], [g[0] - 140, pS[1]], [g[0] - 140, g[1] - 0.4 * sz], [bx - 8, g[1] - 0.4 * sz]], { renk: 'gok', on: onG, deger: pv, t, tohum: 61, p: insa });
    tel(ctx, [[qS[0] + 70, qS[1]], [g[0] - 140, qS[1]], [g[0] - 140, g[1] + 0.4 * sz], [xin, g[1] + 0.4 * sz]], { renk: 'gok', on: onG, deger: qv, t, tohum: 62, p: insa });
    const outRenk = out ? 'limon' : 'mercan';
    tel(ctx, [[g[0] + sz, g[1]], [g[0] + sz + 50, g[1]]], { renk: 'limon', on: onC, deger: out, t, tohum: 63, p: insa });
    kapi(ctx, g[0], g[1], sz, { tur: 'veya', renk: 'gok', ters: true, cikis: out && r >= 0 ? ara(u, 0.8, 1.0) : 0, alfa: insa, sembol: '\\Rightarrow' });
    const yan = r >= 0 ? ara(u, 1.15, 1.3) : 0;
    lamba(ctx, g[0] + sz + 66, g[1], 18, yan, outRenk, insa);
    if (r === 1) {
      E.isik(ctx, g[0] + sz + 66, g[1], 200, 'mercan', 0.5 * E.nabiz(u, 1.15, 0.9));
      // çatlak
      const cp = ara(u, 1.2, 1.5);
      if (cp > 0) { const cx = g[0] + sz + 66, cy = g[1]; E.cizgi(ctx, [[cx - 6, cy - 30], [cx + 4, cy - 10], [cx - 4, cy + 4], [cx + 7, cy + 30]], { renk: 'mercan', kalinlik: 3, parilti: 1, p: cp }); }
    }
    E.formul(ctx, 'p \\Rightarrow q', g[0], g[1] + sz + 36, { boyut: 30, renk: 'gumus', alfa: insa });
    // ikonlar
    bulut(ctx, pS[0], pS[1] - 6, 34, r >= 0 ? pv * ara(u, 0, 0.3) : 0, t, insa);
    yolIkon(ctx, qS[0], qS[1], 96, r >= 0 ? qv * ara(u, 0, 0.3) : 0, t, insa);
    E.yazi(ctx, 'p: yağmur yağar', pS[0] - 50, pS[1] + 52, { boyut: 22, agirlik: 560, hiza: 'left', renk: 'gumus', alfa: insa });
    E.yazi(ctx, 'q: yol ıslak', qS[0] - 50, qS[1] + 52, { boyut: 22, agirlik: 560, hiza: 'left', renk: 'gumus', alfa: insa });
    if (r >= 0) {
      E.yazi(ctx, pv ? '1' : '0', pS[0] + 70, pS[1] - 26, { boyut: 26, agirlik: 700, renk: pv ? 'gok' : 'gumus', alfa: ara(u, 0, 0.25) });
      E.yazi(ctx, qv ? '1' : '0', qS[0] + 70, qS[1] - 26, { boyut: 26, agirlik: 700, renk: qv ? 'gok' : 'gumus', alfa: ara(u, 0, 0.25) });
    }
    // durum cümlesi
    const dx = H ? ic.x + 300 : L.cx, dy = H ? ic.y + 452 : ic.y + 380;
    if (r >= 0) E.yazi(ctx, IS_SATIR[r], dx, dy, { boyut: H ? 30 : 28, agirlik: 640, renk: r === 1 ? 'mercan' : 'tebesir', alfa: ara(u, 1.2, 1.45) * (1 - ara(u, 2.05, 2.2)) });
    const son = ara(t, 10.3, 10.9);
    E.formul(ctx, '\\kutu{mercan}{1 \\Rightarrow 0 \\;=\\; 0}', dx, dy, { boyut: H ? 36 : 34, alfa: son, parilti: 0.3 * son, parRenk: 'mercan' });
    E.yazi(ctx, 'İSE’nin yanlış olduğu tek durum', dx, dy + (H ? 56 : 52), { boyut: H ? 26 : 24, agirlik: 560, renk: 'gumus', alfa: ara(t, 10.6, 11.2) });
    // tablo
    const cw = H ? 150 : 150, hh = H ? 70 : 56, rh = H ? 78 : 58;
    const x0 = H ? ic.x + 690 : L.cx - cw * 1.5, y0 = H ? ic.y + 40 : ic.y + 476;
    const ta = ara(t, 0.6, 1.4);
    tablo(ctx, x0, y0, cw, hh, rh, ['p', 'q', 'p \\Rightarrow q'], [null, null, 'limon'], (rr, c) => {
      const yaz = t < RT ? 0 : rr < Math.floor((t - RT) / RD) || t >= RT + 4 * RD ? 1 : rr === Math.floor((t - RT) / RD) ? ara(t - RT - rr * RD, c < 2 ? 0.05 : 1.2, c < 2 ? 0.3 : 1.45) : 0;
      const [p, q] = SATIR[rr];
      const v = c === 0 ? p : c === 1 ? q : !p || q;
      return { v: !!v, a: yaz, yanlis: c === 2 && !v, halka: c === 2 && rr === 1 ? ara(t, 10.3, 10.9) : 0, halkaRenk: 'mercan' };
    }, { alfa: ta, aktif: (rr) => (rr === r ? 1 : 0) * ta });
  };

  /* ---------- 4. Artık yıl devresi ---------- */
  const YILLAR = [
    { yil: 2024, t0: 2.3, d: 2.4 },
    { yil: 2023, t0: 5.0, d: 2.0 },
    { yil: 1900, t0: 7.4, d: 3.0 },
    { yil: 2000, t0: 10.8, d: 2.6 },
    { yil: 2100, t0: 13.8, d: 2.0 },
  ];
  const artikYerlesim = () => {
    const ic = E.L.icerik, H = E.yatay;
    return H
      ? { k: { x: ic.x, y: ic.y + 100, w: 700, h: 340 }, yilY: ic.y + 40, logY: ic.y + 536, kod: { x: ic.x + 742, y: ic.y + 8, w: 410 }, sem: { x: ic.x + 947, y: ic.y + 420 }, logDx: 140 }
      : { k: { x: ic.x, y: ic.y + 76, w: 640, h: 290 }, yilY: ic.y + 30, logY: ic.y + 398, kod: { x: ic.x, y: ic.y + 430, w: 640 }, sem: { x: E.L.cx, y: ic.y + 750 }, logDx: 128 };
  };
  const yilLog = (ctx, Y, ly, liste, t, o) => {
    const ic = E.L.icerik;
    const x0 = E.yatay ? ic.x + 62 : E.L.cx - Y.logDx * 2;
    liste.forEach((y, i) => {
      const a = ara(t, y.t0 + y.d + 0.1, y.t0 + y.d + 0.5, 'cik3');
      if (a <= 0) return;
      const ok = o.sonuc(y.yil);
      const uyari = o.uyari && ok;
      const rk = uyari ? 'mercan' : ok ? 'limon' : 'gumus';
      E.etiket(ctx, `${y.yil}  ${ok ? '✓' : '✗'}`, x0 + i * Y.logDx, ly + (1 - a) * 14, { boyut: 24, agirlik: 640, renk: rk, kenar: rk, alfa: a * (o.alfa ?? 1), hiza: 'center' });
    });
  };
  const artik = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const Y = artikYerlesim();
    let aktif = YILLAR[0];
    for (const y of YILLAR) if (t >= y.t0 - 0.5) aktif = y;
    const faz = clamp((t - aktif.t0) / aktif.d) * 3.0;
    const insa = ara(t, 0.1, 1.6, 'io2');
    const yilA = ara(t, aktif.t0 - 0.5, aktif.t0 - 0.1, 'cik3');
    // yıl etiketi
    E.yazi(ctx, 'y =', Y.k.x, Y.yilY, { boyut: H ? 36 : 34, agirlik: 520, hiza: 'left', renk: 'gumus', alfa: insa });
    E.yazi(ctx, String(aktif.yil), Y.k.x + (H ? 64 : 60), Y.yilY + (1 - yilA) * 12, { boyut: H ? 48 : 46, agirlik: 760, hiza: 'left', alfa: insa * yilA, parilti: 0.3 });
    E.yazi(ctx, 'DEVRE', Y.k.x + Y.k.w, Y.yilY, { boyut: 22, agirlik: 700, harfAra: 4, hiza: 'right', renk: 'gumus', alfa: insa * (1 - ara(t, 15.8, 16.3)) + ara(t, 16.6, 17.2) * 0 });
    const uc = ara(t, 16.5, 17.1);
    if (uc > 0) E.yazi(ctx, 'DEVRE', Y.k.x + Y.k.w, Y.yilY, { boyut: 22, agirlik: 700, harfAra: 4, hiza: 'right', renk: 'limon', alfa: uc, parilti: 0.5, cakisabilir: true });
    const r = devre(ctx, Y.k, { yil: aktif.yil, faz, t, alfa: 1, insa, giris: [Y.k.x + (H ? 120 : 112), Y.yilY + 18] });
    yilLog(ctx, Y, Y.logY, YILLAR, t, { sonuc: (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 });
    // sözde kod
    const kodA = ara(t, 0.5, 1.4);
    kodPaneli(ctx, Y.kod.x, Y.kod.y, Y.kod.w, artikKod(0), {
      boyut: H ? 24 : 23, satirH: H ? 42 : 34, alfa: kodA, yaz: ara(t, 0.6, 2.2, 'lin'), vurguRenk: uc > 0.5 ? 'limon' : 'gok',
      aktif: (i) => {
        if (uc > 0.5) return 0.6;
        if (i <= 1) return ara(faz, 0.2, 0.4) * (1 - ara(faz, 1.4, 1.6));
        if (i === 2) return ara(faz, 1.4, 1.6) * (1 - ara(faz, 2.5, 2.7));
        if (i === 3) return r.g2 ? ara(faz, 2.6, 2.8) : 0;
        return !r.g2 ? ara(faz, 2.6, 2.8) : 0;
      },
    });
    // sembolik
    if (H) E.yazi(ctx, 'SEMBOLİK', Y.sem.x, Y.sem.y - 52, { boyut: 22, agirlik: 700, harfAra: 4, renk: uc > 0.5 ? 'limon' : 'gumus', alfa: ara(t, 1.4, 2.0) });
    sembolik(ctx, Y.sem.x, Y.sem.y, 0, { boyut: H ? 40 : 38, alfa: ara(t, 1.6, 2.4), parilti: 0.4 * uc });
    if (uc > 0) {
      E.isik(ctx, Y.k.x + Y.k.w / 2, Y.k.y + Y.k.h / 2, 380, 'limon', 0.08 * uc);
      E.isik(ctx, Y.sem.x, Y.sem.y, 260, 'limon', 0.12 * uc);
    }
  };

  /* ---------- 5. Sürpriz: tek bağlaç ---------- */
  const SURPRIZ = [
    { yil: 1900, t0: 3.6, d: 2.6 },
    { yil: 2023, t0: 6.6, d: 1.6 },
    { yil: 2100, t0: 8.5, d: 1.6 },
  ];
  const SIFRE = [
    { metin: 'en az 8 karakter', renk: 'turkuaz', v: 0 },
    { metin: 'en az bir rakam', renk: 'gok', v: 1 },
    { metin: 'en az bir büyük harf', renk: 'menekse', v: 0 },
  ];
  const surpriz = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const Y = artikYerlesim();
    const bz = ara(t, 1.4, 2.6, 'io3');
    const glitch = E.nabiz(t, 1.3, 1.4);
    const devA = 1 - ara(t, 10.6, 11.2);
    if (devA > 0.002) {
      ctx.save();
      // bozulma anında küçük titreme (t'den türeyen)
      if (glitch > 0) ctx.translate(E.gurultu(t * 40, 3) * 6 * glitch, E.gurultu(t * 40, 4) * 3 * glitch);
      let aktif = null;
      for (const y of SURPRIZ) if (t >= y.t0 - 0.5) aktif = y;
      const yil = aktif ? aktif.yil : 1900;
      const faz = aktif ? clamp((t - aktif.t0) / aktif.d) * 3.0 : -1;
      const yilA = aktif ? ara(t, aktif.t0 - 0.5, aktif.t0 - 0.1, 'cik3') : 1;
      E.yazi(ctx, 'y =', Y.k.x, Y.yilY, { boyut: H ? 36 : 34, agirlik: 520, hiza: 'left', renk: 'gumus', alfa: devA });
      E.yazi(ctx, String(yil), Y.k.x + (H ? 64 : 60), Y.yilY + (1 - yilA) * 12, { boyut: H ? 48 : 46, agirlik: 760, hiza: 'left', alfa: devA * yilA, parilti: 0.3 });
      const r = devre(ctx, Y.k, { yil, faz, t, alfa: devA, bozuk: bz, uyari: true, giris: [Y.k.x + (H ? 120 : 112), Y.yilY + 18] });
      yilLog(ctx, Y, Y.logY, SURPRIZ, t, { sonuc: (y) => (y % 4 === 0 || y % 100 !== 0) || y % 400 === 0, uyari: true, alfa: devA });
      kodPaneli(ctx, Y.kod.x, Y.kod.y, Y.kod.w, artikKod(bz), {
        boyut: H ? 24 : 23, satirH: H ? 42 : 34, alfa: devA, vurguRenk: 'mercan',
        aktif: (i) => (i === 0 ? E.nabiz(t, 1.2, 2.0) : i === 3 && faz >= 2.6 && r.g2 ? 1 : 0),
      });
      if (H) E.yazi(ctx, 'SEMBOLİK', Y.sem.x, Y.sem.y - 52, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'gumus', alfa: devA });
      sembolik(ctx, Y.sem.x, Y.sem.y, bz, { boyut: H ? 40 : 38, alfa: devA });
      ctx.restore();
      if (glitch > 0) E.isikSupur(ctx, ara(t, 1.2, 2.6, 'lin'), { renk: 'mercan', guc: 0.3 });
    }
    // Şifre kuralı
    const sA = ara(t, 11.0, 11.6);
    if (sA > 0.002) {
      const sz = H ? 52 : 46;
      const g = H ? [ic.x + 700, ic.y + 300] : [ic.x + 420, ic.y + 470];
      const ys = H ? [ic.y + 180, ic.y + 300, ic.y + 420] : [ic.y + 300, ic.y + 470, ic.y + 640];
      const cw = H ? 330 : 300, cx0 = H ? ic.x + 180 : ic.x;
      E.yazi(ctx, 'şifre:', H ? cx0 : ic.x, H ? ic.y + 70 : ic.y + 110, { boyut: H ? 34 : 32, agirlik: 520, hiza: 'left', renk: 'gumus', alfa: sA });
      E.yazi(ctx, 'abc1', H ? cx0 + 110 : ic.x + 104, H ? ic.y + 70 : ic.y + 110, { boyut: H ? 44 : 42, agirlik: 700, hiza: 'left', font: 'mono', alfa: sA, parilti: 0.3 });
      const morf = ara(t, 13.0, 13.8, 'io3');
      const f1 = ara(t, 11.6, 12.4, 'lin'), f2 = ara(t, 12.4, 12.8, 'lin');
      const g2 = ara(t, 13.9, 14.5, 'lin');
      const sonuc = morf > 0.5 ? 1 : 0;
      SIFRE.forEach((S, j) => {
        const yy = ys[j];
        const xin = g[0] - 0.8 * sz;
        const yin = g[1] + (j - 1) * 0.42 * sz;
        const ex = g[0] - 120 - j * 0;
        tel(ctx, [[cx0 + cw, yy], [ex, yy], [ex, yin], [xin, yin]], { renk: S.renk, on: f1, deger: S.v, t, tohum: 80 + j, alfa: sA });
        E.panel(ctx, cx0, yy - 27, cw, 54, { alfa: sA, vurgu: S.renk, r: 12 });
        E.yazi(ctx, S.metin, cx0 + 22, yy, { boyut: H ? 26 : 24, agirlik: 560, hiza: 'left', alfa: sA });
        rozet(ctx, cx0 + cw + 22, yy, 15, !!S.v, ara(t, 11.4 + j * 0.1, 11.7 + j * 0.1) * sA);
      });
      const outRk = morf > 0.5 ? 'mercan' : 'turkuaz';
      tel(ctx, [[g[0] + sz, g[1]], [g[0] + sz + 50, g[1]]], { renk: 'mercan', on: morf > 0.5 ? g2 : f2, deger: sonuc, t, tohum: 90, alfa: sA });
      kapi(ctx, g[0], g[1], sz, { tur: 've', hedef: 'veya', morf, renk: morf > 0.5 ? 'mercan' : 'turkuaz', cikis: sonuc ? ara(t, 13.9, 14.1) : 0, alfa: sA, sembol: morf > 0.5 ? '\\or' : '\\and', sembolRenk: morf > 0.5 ? 'mercan' : 'tebesir' });
      const yan = sonuc ? ara(t, 14.4, 14.6) : 0;
      lamba(ctx, g[0] + sz + 66, g[1], 18, yan, 'mercan', sA);
      const lx = g[0] + sz + 66, ly = g[1] + 56;
      const ret = ara(t, 12.8, 13.1) * (1 - ara(t, 13.0, 13.3));
      E.yazi(ctx, 'reddedildi', lx, ly, { boyut: 26, agirlik: 700, renk: 'turkuaz', alfa: sA * ret, cakisabilir: true });
      E.yazi(ctx, 'kabul?!', lx, ly, { boyut: 30, agirlik: 760, renk: 'mercan', alfa: sA * yan, parilti: 0.5 });
    }
  };

  /* ---------- 6. Niceleyiciler: döngü ---------- */
  const kisiIkon = (ctx, x, y, r, renk, a) => {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = E.R(renk); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y - r * 0.35, r * 0.32, 0, E.TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y + r * 0.75, r * 0.62, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.restore();
  };
  const kutuIkon = (ctx, x, y, r, renk, a) => {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = E.R(renk); ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x, y - r * 0.55); ctx.lineTo(x + r * 0.6, y - r * 0.25); ctx.lineTo(x + r * 0.6, y + r * 0.45); ctx.lineTo(x, y + r * 0.75); ctx.lineTo(x - r * 0.6, y + r * 0.45); ctx.lineTo(x - r * 0.6, y - r * 0.25); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - r * 0.6, y - r * 0.25); ctx.lineTo(x, y + r * 0.05); ctx.lineTo(x + r * 0.6, y - r * 0.25); ctx.moveTo(x, y + r * 0.05); ctx.lineTo(x, y + r * 0.75); ctx.stroke();
    ctx.restore();
  };
  /** Akış şeması: başla → karar → artır (döngü) ; karar dalından DUR */
  const akis = (ctx, F, o) => {
    const al = o.alfa;
    if (al <= 0.002) return;
    const fb = F.boyut;
    const kutuC = (x, y, w, h, metin, ak, renk = 'gok', yuvarlak = 12, opt = {}) => {
      E.panel(ctx, x - w / 2, y - h / 2, w, h, { alfa: al, r: yuvarlak, kenar: ak > 0.05 ? null : 'sis', renk: 'lacivert' });
      if (ak > 0.01) {
        ctx.save(); ctx.globalAlpha *= al * ak; E.yuvarlakDik(ctx, x - w / 2, y - h / 2, w, h, yuvarlak);
        ctx.fillStyle = E.rgba(renk, 0.2); ctx.fill(); ctx.strokeStyle = E.R(renk); ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
        E.isik(ctx, x, y, w * 0.8, renk, 0.22 * ak * al);
      }
      E.yazi(ctx, metin, x, y, Object.assign({ boyut: fb, agirlik: 600, font: 'mono', alfa: al, renk: ak > 0.5 ? 'tebesir' : 'gumus' }, opt));
    };
    const ok = (pts, ak = 0, kesik) => {
      E.cizgi(ctx, pts, { renk: 'cizgi', kalinlik: 2.5, alfa: al, ok: true, okBoy: 11, kesik });
      if (ak > 0.01) E.cizgi(ctx, pts, { renk: 'gok', kalinlik: 3, parilti: 1, alfa: al * ak, p: ak });
    };
    const { cx, y0, y1, y2, y3, dw, dh, tx, tw, bw, lx } = F;
    // oklar
    ok([[cx, y0 + 26], [cx, y1 - dh / 2 - 4]], o.ok0);
    ok([[cx, y1 + dh / 2], [cx, y2 - 26 - 4]], o.ok1);
    ok([[cx + dw / 2, y1], [tx - tw / 2 - 4, y1]], o.ok2);
    ok([[cx - bw / 2, y2], [lx, y2], [lx, y1], [cx - dw / 2 - 4, y1]], o.ok3);
    ok([[cx, y2 + 26], [cx, y3 - 26 - 4]], 0, [6, 6]);
    E.yazi(ctx, o.devamDal, cx + 22, (y1 + dh / 2 + y2 - 26) / 2, { boyut: 26, agirlik: 700, hiza: 'left', renk: o.devamRenk, alfa: al });
    E.yazi(ctx, o.durDal, (cx + dw / 2 + tx - tw / 2) / 2, y1 - 24, { boyut: 26, agirlik: 700, renk: o.durRenk, alfa: al });
    E.yazi(ctx, 'i > 8', cx + 22, (y2 + y3) / 2, { boyut: 22, agirlik: 520, hiza: 'left', renk: 'gumus', alfa: al, font: 'mono' });
    // düğümler
    kutuC(cx, y0, bw, 52, 'i ← 1', o.a0);
    // karar (eşkenar dörtgen)
    ctx.save(); ctx.globalAlpha *= al;
    ctx.beginPath(); ctx.moveTo(cx, y1 - dh / 2); ctx.lineTo(cx + dw / 2, y1); ctx.lineTo(cx, y1 + dh / 2); ctx.lineTo(cx - dw / 2, y1); ctx.closePath();
    ctx.fillStyle = E.rgba('lacivert', 0.85); ctx.fill();
    ctx.strokeStyle = E.karistir('sis', 'gok', o.a1); ctx.lineWidth = 2.5; ctx.stroke();
    if (o.a1 > 0.01) { ctx.globalAlpha *= o.a1; ctx.fillStyle = E.rgba('gok', 0.18); ctx.fill(); }
    ctx.restore();
    if (o.a1 > 0.01) E.isik(ctx, cx, y1, dw * 0.6, 'gok', 0.2 * o.a1 * al);
    E.yazi(ctx, o.kosul, cx, y1, { boyut: fb, agirlik: 600, font: 'mono', alfa: al, renk: o.a1 > 0.5 ? 'tebesir' : 'gumus' });
    kutuC(cx, y2, bw, 52, 'i ← i + 1', o.a2);
    kutuC(tx, y1, tw, 56, o.durMetin, o.a3, o.durRenk, 28, { agirlik: 760, boyut: fb + 2 });
    kutuC(cx, y3, F.sw, 50, o.sonMetin, 0, 'gok', 25, { boyut: fb - 1 });
  };
  const nicel = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const F = H
      ? { cx: ic.x + 870, y0: ic.y + 50, y1: ic.y + 180, y2: ic.y + 316, y3: ic.y + 430, dw: 240, dh: 118, tx: ic.x + 1084, tw: 128, bw: 190, lx: ic.x + 752, sw: 250, boyut: 24 }
      : { cx: ic.x + 270, y0: ic.y + 408, y1: ic.y + 524, y2: ic.y + 646, y3: ic.y + 744, dw: 270, dh: 112, tx: ic.x + 530, tw: 150, bw: 200, lx: ic.x + 120, sw: 270, boyut: 23 };
    const P2 = 7.4; // ikinci soru başlangıcı
    const ikinci = t >= P2;
    const lt = ikinci ? t - P2 : t;
    // soru başına parçalar
    const adimlar = ikinci ? [1.0, 1.9, 2.8] : [1.2, 2.1, 3.0, 3.9];
    const durIdx = adimlar.length - 1;
    const durT = adimlar[durIdx] + 0.5;
    const blokA = ikinci ? ara(t, P2, P2 + 0.6) * (1 - ara(t, 13.0, 13.6)) : ara(t, 0, 0.6) * (1 - ara(t, P2 - 0.6, P2));
    const soru = ikinci ? 'Stokta olmayan ürün var mı?' : 'Her öğrenci kaydını tamamladı mı?';
    if (blokA > 0.002) {
      // döşemeler 4×2
      const tw = H ? 150 : 145, th = H ? 118 : 100, gap = H ? 18 : 12;
      const gx0 = H ? ic.x + 18 : L.cx - (tw * 4 + gap * 3) / 2, gy0 = H ? ic.y + 80 : ic.y + 64;
      E.yazi(ctx, soru, H ? gx0 + (tw * 4 + gap * 3) / 2 : L.cx, H ? ic.y + 34 : ic.y + 20, { boyut: H ? 32 : 30, agirlik: 640, alfa: blokA });
      // tarayıcı imleç konumu
      let imlec = -1;
      adimlar.forEach((a, i) => { if (lt >= a - 0.3) imlec = i; });
      for (let i = 0; i < 8; i++) {
        const cx = gx0 + (i % 4) * (tw + gap), cy = gy0 + Math.floor(i / 4) * (th + gap);
        const tarandi = i < adimlar.length && lt >= adimlar[i];
        const durdu = i === durIdx && tarandi;
        const sonra = i > durIdx && lt > durT;
        const deg = ikinci ? (i === 2) : (i !== 3);   // ∀: kayıt tamam mı ; ∃: stok = 0 mı
        const rk = !tarandi ? 'sis' : durdu ? (ikinci ? 'limon' : 'mercan') : (ikinci ? 'gumus' : 'turkuaz');
        const ta = blokA * (sonra ? 0.4 : 1);
        E.panel(ctx, cx, cy, tw, th, { alfa: ta, r: 14, kenar: tarandi ? null : 'sis' });
        if (tarandi) { ctx.save(); ctx.globalAlpha *= ta; E.yuvarlakDik(ctx, cx, cy, tw, th, 14); ctx.strokeStyle = E.R(rk); ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); }
        if (i === imlec && lt < durT + 0.2) E.isik(ctx, cx + tw / 2, cy + th / 2, tw, 'gok', 0.35 * blokA);
        if (durdu) E.isik(ctx, cx + tw / 2, cy + th / 2, tw * 1.6, rk, 0.4 * blokA * (0.6 + 0.4 * E.nabiz(lt, adimlar[i], 1)));
        const ikonX = cx + tw * 0.3, ikonY = cy + th / 2;
        if (ikinci) kutuIkon(ctx, ikonX, ikonY - 4, H ? 34 : 30, tarandi ? 'tebesir' : 'gumus', ta);
        else kisiIkon(ctx, ikonX, ikonY - 2, H ? 38 : 34, tarandi ? 'tebesir' : 'gumus', ta);
        E.yazi(ctx, String(i + 1), cx + 16, cy + 18, { boyut: 22, agirlik: 600, hiza: 'left', renk: 'gumus', alfa: ta });
        if (ikinci) E.yazi(ctx, i === 2 ? 'stok 0' : `stok ${[12, 5, 0, 8, 3, 0, 9, 4][i]}`, cx + tw * 0.62, cy + th - 22, { boyut: 22, agirlik: 560, renk: tarandi ? 'tebesir' : 'gumus', alfa: ta * (tarandi ? 1 : 0.7) });
        if (tarandi) {
          const ra = ara(lt, adimlar[i], adimlar[i] + 0.25, 'cik3');
          rozet(ctx, cx + tw * 0.74, cy + th * (ikinci ? 0.38 : 0.5), H ? 22 : 20, deg, ra * ta, ikinci ? 'limon' : 'turkuaz', ikinci ? 'gumus' : 'mercan');
        } else if (sonra) E.yazi(ctx, '?', cx + tw * 0.74, cy + th * (ikinci ? 0.38 : 0.5), { boyut: 30, agirlik: 700, renk: 'gumus', alfa: ta });
      }
      // cevap
      const ca = ara(lt, durT, durT + 0.5, 'cik3');
      const cy = H ? gy0 + th * 2 + gap + 62 : gy0 + th * 2 + gap + 36;
      const cev = ikinci ? 'Cevap: EVET' : 'Cevap: HAYIR';
      const alt = ikinci ? '∃ ilk ✓ görünce durur' : '∀ ilk ✗ görünce durur';
      if (H) {
        E.yazi(ctx, cev, gx0, cy, { boyut: 40, agirlik: 760, hiza: 'left', renk: ikinci ? 'limon' : 'mercan', alfa: ca * blokA, parilti: 0.3 });
        E.yazi(ctx, alt, gx0, cy + 54, { boyut: 30, agirlik: 600, hiza: 'left', renk: 'tebesir', alfa: ara(lt, durT + 0.4, durT + 0.9) * blokA });
      } else {
        E.yazi(ctx, cev, ic.x + 8, cy, { boyut: 30, agirlik: 760, hiza: 'left', renk: ikinci ? 'limon' : 'mercan', alfa: ca * blokA, parilti: 0.3 });
        E.yazi(ctx, alt, ic.x1 - 8, cy, { boyut: 26, agirlik: 600, hiza: 'right', renk: 'tebesir', alfa: ara(lt, durT + 0.4, durT + 0.9) * blokA });
      }
      // akış şeması
      let a0 = 0, a1 = 0, a2 = 0, a3 = 0, ok0 = 0, ok1 = 0, ok2 = 0, ok3 = 0;
      ok0 = ara(lt, adimlar[0] - 0.55, adimlar[0] - 0.2, 'lin') * (1 - ara(lt, adimlar[0], adimlar[0] + 0.3));
      a0 = ara(lt, adimlar[0] - 0.9, adimlar[0] - 0.6) * (1 - ara(lt, adimlar[0] - 0.4, adimlar[0] - 0.1));
      adimlar.forEach((a, i) => {
        a1 = Math.max(a1, ara(lt, a - 0.25, a - 0.05) * (1 - ara(lt, a + 0.35, a + 0.5)));
        if (i < durIdx) {
          ok1 = Math.max(ok1, ara(lt, a + 0.35, a + 0.5, 'lin') * (1 - ara(lt, a + 0.55, a + 0.7)));
          a2 = Math.max(a2, ara(lt, a + 0.45, a + 0.55) * (1 - ara(lt, a + 0.6, a + 0.7)));
          ok3 = Math.max(ok3, ara(lt, a + 0.6, adimlar[i + 1] - 0.25, 'lin') * (1 - ara(lt, adimlar[i + 1] - 0.15, adimlar[i + 1])));
        } else {
          ok2 = ara(lt, a + 0.35, a + 0.55, 'lin');
          a3 = ara(lt, a + 0.5, a + 0.7);
        }
      });
      akis(ctx, F, {
        alfa: blokA, a0, a1: Math.max(a1, lt < adimlar[0] - 0.5 ? 0 : 0), a2, a3, ok0, ok1, ok2, ok3,
        kosul: ikinci ? 'stok(i) = 0 ?' : 'tamam(i) ?',
        devamDal: ikinci ? '✗' : '✓', devamRenk: ikinci ? 'gumus' : 'turkuaz',
        durDal: ikinci ? '✓' : '✗', durRenk: ikinci ? 'limon' : 'mercan',
        durMetin: ikinci ? 'EVET' : 'HAYIR', sonMetin: ikinci ? 'bitti → HAYIR' : 'bitti → EVET',
      });
    }
    // değil alma
    const dA = ara(t, 13.4, 14.2);
    if (dA > 0.002) {
      const cy = ic.cy - (H ? 40 : 60);
      E.formul(ctx, '\\neg(\\forall x\\; P(x))', H ? L.cx - 44 : L.cx, cy - (H ? 0 : 70), { boyut: H ? 50 : 44, alfa: dA, renk: 'tebesir', hiza: H ? 'right' : 'center' });
      E.formul(ctx, '≡', L.cx, cy, { boyut: H ? 50 : 44, alfa: ara(t, 14.0, 14.5), renk: 'limon' });
      E.formul(ctx, '\\exists x\\; \\neg P(x)', H ? L.cx + 44 : L.cx, cy + (H ? 0 : 70), { boyut: H ? 50 : 44, alfa: ara(t, 14.3, 15.0), renk: 'limon', hiza: H ? 'left' : 'center', parilti: 0.3 });
      E.yazi(ctx, '“Hepsi tamam” yanlışsa,', L.cx, cy + (H ? 110 : 180), { boyut: H ? 32 : 30, agirlik: 600, alfa: ara(t, 15.0, 15.6) });
      E.yazi(ctx, 'tamamlamayan en az bir kişi vardır.', L.cx, cy + (H ? 160 : 226), { boyut: H ? 32 : 30, agirlik: 600, renk: 'limon', alfa: ara(t, 15.6, 16.2), maxGen: ic.w - 20 });
    }
  };

  /* ---------- Özet ve bitiş ---------- */
  const imza = (ctx, s) => E.imza(ctx, s, meta);
  const baslik = (ctx, s) => E.baslikKarti(ctx, s, meta);
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Bağlaçlar algoritmanın kapılarıdır.', formul: 'p \\and q \\quad p \\or q \\quad p \\xor q' },
    { tr: 'İSE yalnızca 1 ⇒ 0 iken yanlıştır.', formul: 'p \\Rightarrow q' },
    { tr: '∀ ilk ✗’te, ∃ ilk ✓’te durur.', formul: '\\neg(\\forall x\\, P) \\;≡\\; \\exists x\\, \\neg P' },
    { tr: 'Tek bağlaç değişirse karar değişir.', formul: '(p \\and \\neg q) \\or r' },
  ], { aralik: 1.6 });
  // Yerel çözüm: motorun bitiş kartı, iki satıra sarılan laboratuvar adını hesaba katmıyor
  // ("Algoritma Laboratuvarı" yatayda 50 px'te 520 px'e sığmıyor ve üstteki/alttaki yazıya biniyor).
  // Adı ve açıklamayı burada, adı tek satıra sığdırarak çiziyoruz.
  const bitis = (ctx, s) => {
    E.bitisKarti(ctx, s, Object.assign({}, meta, { labAd: '', labAciklama: '' }));
    const L = E.L, ic = L.icerik, t = s.t;
    const qy = E.yd(L.cy - 110 - 40, ic.y + 330);
    const tx = E.yd(L.cx - 400, L.cx), hz = E.yd('left', 'center');
    const a1 = E.ara(t, 0, 0.9, 'cik3'), a2 = E.ara(t, 0.5, 1.4, 'cik3');
    const boy = E.sigdir(ctx, meta.labAd, { boyut: E.yd(50, 46), agirlik: 760 }, E.yd(520, 600), 36);
    E.yazi(ctx, meta.labAd, tx, E.yd(qy + 82, ic.y + 120), { boyut: boy, agirlik: 760, hiza: hz, alfa: a1 });
    E.yazi(ctx, meta.labAciklama, tx, E.yd(qy + 158, ic.y + 210), { boyut: 26, agirlik: 460, renk: 'gumus', hiza: hz, alfa: a2, maxGen: E.yd(500, 600) });
  };

  /* ---------- Film ---------- */
  E.film({
    meta,
    sure: 118.7,
    sahneler: [
      { ad: 'Soğuk açılış: 29 Şubat 1900', bas: 0, son: 11.0, giris: 0, cikis: 0.7, itme: 0, ciz: acilis },
      { ad: 'İmza', bas: 10.7, son: 14.4, giris: 0.3, ciz: imza },
      { ad: 'Başlık', bas: 14.1, son: 18.4, ciz: baslik },
      { ad: 'Üç kapı: VE, VEYA, YA DA', bas: 18.1, son: 36.6, ciz: ucKapi },
      { ad: 'İSE: bir söz', bas: 36.3, son: 49.3, ciz: ise },
      { ad: 'Artık yıl devresi', bas: 49.0, son: 70.0, ciz: artik },
      { ad: 'Sürpriz: tek bağlaç', bas: 69.7, son: 84.7, ciz: surpriz },
      { ad: 'Niceleyiciler: döngünün durduğu yer', bas: 84.4, son: 102.4, ciz: nicel },
      { ad: 'Aklında kalsın', bas: 102.1, son: 112.4, ciz: ozet },
      { ad: 'Laboratuvar', bas: 112.2, son: 118.7, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 6, renk1: 'gok', renk2: 'menekse' }),
  });
})();
