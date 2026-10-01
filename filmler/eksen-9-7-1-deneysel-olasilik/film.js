/* ==========================================================================
   EKSEN 9.7.1 — Gürültünün Sönmesi
   Tek fikir: Az denemede göreli sıklıklar zikzak çizer (gürültü); deneme
   sayısı arttıkça zikzaklar söner ve bir değere yerleşir (şekil).
   Bütün zar sonuçları tohumludur (E.rng) ve bir kez dizi olarak üretilir;
   her karede "t anına kadar kaç atış yapıldı" t'den hesaplanır.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp, yd } = E;

  const meta = {
    kod: 'MAT.9.7.1',
    tema: 'Veriden Olasılığa',
    ad: 'Gürültünün Sönmesi',
    adEn: 'When the Noise Fades',
    labAd: 'Olasılık Laboratuvarı',
    labAciklama: 'Zarı, parayı, çarkı binlerce kez at; göreli sıklığın bir değere yerleştiğini kendin gör.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-olasilik/',
  };

  /* ---------- Sayı biçimi ---------- */
  const binlik = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const ondalik = (v, b = 2) => v.toFixed(b).replace('.', ',');
  const ondalikF = (v, b = 2) => v.toFixed(b).replace('.', '{,}');

  /* ---------- Tohumlu veri (t'den bağımsız önbellek) ---------- */
  const onbellek = new Map();
  const bellek = (anahtar, uret) => { if (!onbellek.has(anahtar)) onbellek.set(anahtar, uret()); return onbellek.get(anahtar); };
  /** İki zar: n atış → Uint8Array [a0,b0,a1,b1,...] */
  const ikiZar = (tohum, n) => bellek('iz' + tohum + ':' + n, () => {
    const r = E.rng(tohum), a = new Uint8Array(n * 2);
    for (let i = 0; i < n * 2; i++) a[i] = 1 + Math.floor(r() * 6);
    return a;
  });
  /** Toplam s için birikimli sayım: c[s][k] = ilk k atışta toplamı s olanlar */
  const birikimli = (tohum, n) => bellek('bk' + tohum + ':' + n, () => {
    const z = ikiZar(tohum, n);
    const c = [];
    for (let s = 0; s <= 12; s++) c.push(new Int32Array(n + 1));
    for (let k = 0; k < n; k++) {
      const s = z[2 * k] + z[2 * k + 1];
      for (let q = 2; q <= 12; q++) c[q][k + 1] = c[q][k] + (q === s ? 1 : 0);
    }
    return c;
  });
  /** Tek zar (adil ya da 6'ya hileli) — 6 gelme birikimli sayımı ve değerler */
  const tekZar = (tohum, n, hile) => bellek('tz' + tohum + ':' + n + ':' + hile, () => {
    const r = E.rng(tohum), d = new Uint8Array(n), c = new Int32Array(n + 1);
    for (let k = 0; k < n; k++) {
      d[k] = hile ? (r() < 0.3 ? 6 : 1 + Math.floor(r() * 5)) : 1 + Math.floor(r() * 6);
      c[k + 1] = c[k] + (d[k] === 6 ? 1 : 0);
    }
    return { d, c };
  });

  /* ---------- Zar çizimi (prosedürel yüz ve noktalar) ---------- */
  const PIP = {
    1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]],
    4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  };
  /** o: renk, aci, alfa, sx (yalancı 3B yuvarlanma için yatay basıklık), isik */
  const zarCiz = (ctx, x, y, s, v, o = {}) => {
    const renk = o.renk || 'turkuaz', al = o.alfa ?? 1;
    if (al <= 0.003) return;
    ctx.save();
    ctx.globalAlpha *= al;
    ctx.translate(x, y); ctx.rotate(o.aci || 0); ctx.scale(o.sx ?? 1, 1);
    const r = s * 0.2, h = s / 2;
    // gölge ve dış ışık
    ctx.save(); ctx.shadowColor = E.rgba(renk, 0.55 * (o.isik ?? 1)); ctx.shadowBlur = s * 0.35;
    E.yuvarlakDik(ctx, -h, -h, s, s, r);
    const g = ctx.createLinearGradient(-h, -h, h, h);
    g.addColorStop(0, '#22305A'); g.addColorStop(0.55, '#131C36'); g.addColorStop(1, '#0A0F1E');
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    E.yuvarlakDik(ctx, -h, -h, s, s, r);
    ctx.strokeStyle = E.rgba(renk, 0.95); ctx.lineWidth = Math.max(1.5, s * 0.045); ctx.stroke();
    // cam parlaması
    E.yuvarlakDik(ctx, -h + s * 0.08, -h + s * 0.08, s * 0.84, s * 0.4, r * 0.8);
    const p = ctx.createLinearGradient(0, -h, 0, -h + s * 0.45);
    p.addColorStop(0, 'rgba(255,255,255,0.13)'); p.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = p; ctx.fill();
    // noktalar
    ctx.save(); ctx.shadowColor = E.rgba(renk, 0.95); ctx.shadowBlur = s * 0.16;
    ctx.fillStyle = E.R(renk);
    for (const [px, py] of PIP[v] || []) { ctx.beginPath(); ctx.arc(px * s * 0.26, py * s * 0.26, s * 0.085, 0, E.TAU); ctx.fill(); }
    ctx.restore();
    ctx.restore();
  };
  /** Yuvarlanan zar: t0..t1 arasında yuvarlanır, t1'de v değerinde durur */
  const yuvarlanan = (ctx, t, t0, t1, x, y, s, v, o = {}) => {
    const p = clamp((t - t0) / (t1 - t0));
    if (p >= 1 || t < t0) return zarCiz(ctx, x, y, s, v, o);
    const don = (1 - E.e.cik3(p));
    const yuz = 1 + Math.floor(E.hash(Math.floor(t * 18), (o.tohum || 1) * 31) * 6);
    zarCiz(ctx, x, y - Math.abs(Math.sin(p * Math.PI * 2)) * s * 0.3 * don, s, yuz, Object.assign({}, o, { aci: (o.aci || 0) + don * 5.5 * (o.yon || 1), sx: 0.55 + 0.45 * Math.abs(Math.cos(p * 9)) }));
  };

  /* ---------- Parçacık sprite'ı (önbellek) ---------- */
  const sprite = (renk) => bellek('sp' + renk, () => {
    const c = document.createElement('canvas'); c.width = c.height = 24;
    const g = c.getContext('2d'); const gr = g.createRadialGradient(12, 12, 0, 12, 12, 12);
    gr.addColorStop(0, E.rgba(renk, 1)); gr.addColorStop(0.25, E.rgba(renk, 0.6)); gr.addColorStop(1, E.rgba(renk, 0));
    g.fillStyle = gr; g.fillRect(0, 0, 24, 24); return c;
  });

  /* ---------- Grafik yardımcısı (görünüm penceresi animasyonlu) ---------- */
  /** o: x,y,w,h (ekran), n0,n1 (x aralığı), v0,v1 (y aralığı) */
  const grafik = (o) => {
    const g = Object.assign({}, o);
    g.px = (n) => g.x + ((n - g.n0) / (g.n1 - g.n0)) * g.w;
    g.py = (v) => g.y + g.h - ((v - g.v0) / (g.v1 - g.v0)) * g.h;
    g.kirp = (ctx) => { ctx.beginPath(); ctx.rect(g.x, g.y - 2, g.w + 4, g.h + 4); ctx.clip(); };
    /** eksenler: so.xTik (dizi), so.yAdim, so.alfa */
    g.eksen = (ctx, so) => {
      const a = so.alfa ?? 1; if (a <= 0.003) return;
      ctx.save(); ctx.globalAlpha *= a;
      // yatay ızgara
      const ya = so.yAdim;
      for (let v = Math.ceil(g.v0 / ya - 1e-9) * ya; v <= g.v1 + 1e-9; v += ya) {
        const yy = g.py(v);
        E.cizgi(ctx, [[g.x, yy], [g.x + g.w, yy]], { renk: 'sis', kalinlik: 1, alfa: 0.7 });
        E.yazi(ctx, ondalik(v, ya < 0.05 ? 2 : 1), g.x - 12, yy, { boyut: 22, hiza: 'right', renk: 'gumus', agirlik: 500 });
      }
      E.cizgi(ctx, [[g.x, g.y + g.h], [g.x + g.w + 14, g.y + g.h]], { renk: 'cizgi', kalinlik: 2.2, ok: true, okBoy: 11 });
      E.cizgi(ctx, [[g.x, g.y + g.h], [g.x, g.y - 12]], { renk: 'cizgi', kalinlik: 2.2, ok: true, okBoy: 11 });
      // x çentikleri (çakışmayanlar etiketlenir)
      let son = -1e9;
      for (const n of so.xTik) {
        if (n < g.n0 - 1e-9 || n > g.n1 + 1e-9) continue;
        const xx = g.px(n);
        E.cizgi(ctx, [[xx, g.y + g.h - 6], [xx, g.y + g.h + 6]], { renk: 'cizgi', kalinlik: 2 });
        const et = binlik(n), w = E.yaziOlc(ctx, et, { boyut: 22, agirlik: 500 });
        if (xx - w / 2 > son + 14 && xx + w / 2 < g.x + g.w + 30) {
          E.yazi(ctx, et, xx, g.y + g.h + 24, { boyut: 22, renk: 'gumus', agirlik: 500 });
          son = xx + w / 2;
        }
      }
      ctx.restore();
    };
    /** birikimli sayım dizisinden göreli sıklık eğrisi */
    g.egri = (ctx, c, nMax, so) => {
      const nA = Math.max(1, Math.floor(g.n0)), nB = Math.min(nMax, Math.ceil(g.n1));
      if (nB < nA + 1) return;
      const adim = Math.max(1, Math.floor(((g.n1 - g.n0) / g.w) * 1.2));
      ctx.beginPath();
      let ilk = true;
      for (let n = nA; n <= nB; n += n < 120 && adim > 1 ? 1 : adim) {
        const x = g.px(n), y = g.py(c[n] / n);
        if (ilk) { ctx.moveTo(x, y); ilk = false; } else ctx.lineTo(x, y);
      }
      ctx.lineTo(g.px(nB), g.py(c[nB] / nB));
      ctx.strokeStyle = so.stil; ctx.lineWidth = so.kalinlik || 2; ctx.lineJoin = 'round';
      ctx.stroke();
    };
    return g;
  };

  /* =====================================================================
     1. Soğuk açılış: 10 → 100 → 10 000 atış; parçacık yağmuru
     ===================================================================== */
  const AC_TOHUM = 70, AC_N = 10000, DUSUS = 0.6;
  /** i. atışın fırlatılma zamanı (sahne içi sn) */
  const acZaman = bellek('acZ', () => {
    const T = new Float32Array(AC_N);
    for (let i = 0; i < AC_N; i++) {
      if (i === 0) T[i] = 2.75;
      else if (i < 10) T[i] = 3.25 + (i - 1) * 0.25;
      else if (i < 100) T[i] = 5.75 + 1.75 * Math.pow((i - 10) / 89, 0.85);
      else T[i] = 7.75 + 2.55 * Math.pow((i - 100) / (AC_N - 101), 0.55);
    }
    return T;
  });
  /** T <= t olan atış sayısı (ikili arama) */
  const kacTane = (T, t) => { let a = 0, b = T.length; while (a < b) { const m = (a + b) >> 1; if (T[m] <= t) a = m + 1; else b = m; } return a; };

  const acilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const z = ikiZar(AC_TOHUM, AC_N), c = birikimli(AC_TOHUM, AC_N), T = acZaman;
    const fx = ic.cx, fy = H ? ic.y + 92 : ic.y + 230; // fırlatma noktası (zarlar)
    const aralik = H ? 86 : 56, sw = H ? 56 : 40;
    const sx = (q) => ic.cx + (q - 7) * aralik;
    const yb = ic.y1 - E.yd(40, 44), Hb = H ? 320 : 440, YMAX = 0.3;
    const atilan = kacTane(T, t), inen = kacTane(T, t - DUSUS);

    // kamera: yakın çekimden geri çekil
    const zKam = kf(t, [[0, 2.5], [2.3, 2.5], [3.5, 1, 'io3']]);
    const kx = lerp(fx, ic.cx, ara(t, 2.3, 3.5)), ky = lerp(fy + E.yd(10, 10), L.cy - E.yd(0, 40), ara(t, 2.3, 3.5));
    ctx.save();
    if (zKam > 1.0001) E.kamera(ctx, { x: lerp(ic.cx, kx, 1), y: ky, z: zKam });
    else E.kamera(ctx, { x: ic.cx, y: L.cy - E.yd(0, 40), z: 1 });

    const sahne = ara(t, 2.6, 3.6);
    // sütunlar (göreli sıklık)
    if (sahne > 0) {
      ctx.save(); ctx.globalAlpha *= sahne;
      E.cizgi(ctx, [[sx(2) - aralik * 0.7, yb], [sx(12) + aralik * 0.7, yb]], { renk: 'cizgi', kalinlik: 2 });
      const tepe = [];
      for (let q = 2; q <= 12; q++) {
        const rel = inen ? c[q][inen] / inen : 0;
        const h = Math.min(rel, YMAX) / YMAX * Hb;
        const x = sx(q);
        tepe.push([x, yb - h]);
        if (h > 0.5) {
          const gr = ctx.createLinearGradient(0, yb - h, 0, yb);
          gr.addColorStop(0, E.rgba('turkuaz', 0.55)); gr.addColorStop(1, E.rgba('turkuaz', 0.08));
          ctx.fillStyle = gr; ctx.fillRect(x - sw / 2, yb - h, sw, h);
          E.cizgi(ctx, [[x - sw / 2, yb - h], [x + sw / 2, yb - h]], { renk: rel > YMAX ? 'mercan' : 'turkuaz', kalinlik: 3, parilti: 0.9 });
        }
        E.yazi(ctx, String(q), x, yb + 24, { boyut: E.yd(24, 24), renk: q === 7 ? 'tebesir' : 'gumus', agirlik: 600 });
      }
      // şekil: sütun tepelerini birleştiren üçgen
      const ucA = ara(t, 10.4, 11.3);
      if (ucA > 0) {
        E.cizgi(ctx, tepe, { renk: 'limon', kalinlik: 3, parilti: 1.2, p: ucA, alfa: 0.95 });
        E.isik(ctx, sx(7), tepe[5][1], 260, 'limon', 0.22 * E.nabiz(t, 10.6, 1.4));
      }
      ctx.restore();
    }

    // uçuştaki parçacıklar
    if (atilan > inen) {
      const ucan = atilan - inen;
      const adim = Math.max(1, Math.ceil(ucan / 900));
      const sp = sprite('turkuaz'), spL = sprite('limon');
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = inen; i < atilan; i += adim) {
        const u = clamp((t - T[i]) / DUSUS);
        const q = z[2 * i] + z[2 * i + 1];
        const rel = inen ? c[q][inen] / inen : 0;
        const hedefY = yb - Math.min(rel, YMAX) / YMAX * Hb;
        const j1 = (E.hash(i, 3) - 0.5) * 40, j2 = (E.hash(i, 5) - 0.5) * sw * 0.7;
        const x = lerp(fx + j1, sx(q) + j2, E.e.cik2(u));
        const y = lerp(fy, hedefY, u * u) - Math.sin(u * Math.PI) * 30;
        const boy = i < 10 ? 26 : i < 100 ? 18 : 12;
        ctx.globalAlpha = (i < 100 ? 1 : 0.55) * Math.min(1, adim * 0.7) * (1 - 0.3 * u);
        ctx.drawImage(i < 10 ? spL : sp, x - boy / 2, y - boy / 2, boy, boy);
      }
      ctx.restore();
    }

    // zarlar
    if (t < 2.75) {
      // ilk atış: yakın çekimde yuvarlanarak gelir
      const a = z[0], b = z[1];
      const xA = kf(t, [[0, fx - 260], [1.7, fx - 44, 'cik3']]), xB = kf(t, [[0.15, fx + 260], [1.8, fx + 44, 'cik3']]);
      yuvarlanan(ctx, t, 0.0, 1.7, xA, fy, 64, a, { renk: 'turkuaz', tohum: 1 });
      yuvarlanan(ctx, t, 0.15, 1.8, xB, fy, 64, b, { renk: 'mercan', tohum: 2, yon: -1 });
      const sA = ara(t, 1.9, 2.3, 'cik3');
      E.formul(ctx, `= \\c{limon}{${a + b}}`, H ? fx + 92 : fx, H ? fy : fy + 70, { boyut: H ? 40 : 34, hiza: H ? 'left' : 'center', alfa: sA * (1 - ara(t, 2.4, 2.7)) });
      E.isik(ctx, fx, fy, 160, 'turkuaz', 0.18 * (1 - ara(t, 2.3, 2.7)));
    } else {
      const k = Math.max(0, atilan - 1);
      const s0 = atilan < 100 ? 52 : 46;
      const tz = T[k];
      const yuv = atilan < 100 ? 0.18 : 0.0;
      const al = 1 - 0.35 * ara(t, 7.8, 8.6) - 0.65 * ara(t, 10.5, 11.2);
      yuvarlanan(ctx, t, tz - yuv, tz, fx - 34, fy, s0, z[2 * k], { renk: 'turkuaz', tohum: k * 2 + 1, alfa: al });
      yuvarlanan(ctx, t, tz - yuv, tz, fx + 34, fy, s0, z[2 * k + 1], { renk: 'mercan', tohum: k * 2 + 2, yon: -1, alfa: al });
      if (atilan >= 100 && atilan < AC_N) E.isik(ctx, fx, fy, 140, 'turkuaz', 0.25 * al);
    }
    ctx.restore();

    // sayaç (ekran koordinatı)
    const sA = ara(t, 3.0, 3.6);
    if (sA > 0) {
      const n = Math.min(atilan, AC_N);
      const nGor = n >= AC_N ? AC_N : n;
      const cx = H ? ic.x + 4 : ic.cx, hz = H ? 'left' : 'center';
      const y0 = H ? ic.y + 10 : ic.y + 18;
      E.yazi(ctx, 'ATIŞ SAYISI', cx, y0 + 4, { boyut: 22, agirlik: 700, harfAra: 5, renk: 'turkuaz', hiza: hz, alfa: sA });
      E.yazi(ctx, binlik(nGor), cx, y0 + E.yd(54, 60), { boyut: E.yd(60, 68), agirlik: 760, hiza: hz, alfa: sA, parilti: 0.3 + 0.5 * E.nabiz(t, 10.2, 0.8) });
      const ets = [[5.4, 'gürültü'], [7.6, 'bir şekil mi?'], [10.3, 'şekil']];
      let et = null; for (const [tt, m] of ets) if (t >= tt) et = [tt, m];
      if (et) E.yazi(ctx, et[1], H ? ic.x1 - 4 : ic.cx, H ? y0 + 36 : y0 + 118, { boyut: E.yd(30, 30), agirlik: 640, hiza: H ? 'right' : 'center', renk: et[1] === 'şekil' ? 'limon' : 'gumus', alfa: ara(t, et[0], et[0] + 0.5) * sA });
    }
    E.isik(ctx, ic.cx, yb - Hb * 0.4, E.W * 0.6, 'limon', 0.12 * E.nabiz(t, 10.3, 1.6));
  };

  /* =====================================================================
     4. Kayıt: çetele → sıklık → göreli sıklık (ilk 25 atış)
     ===================================================================== */
  const ANA_TOHUM = 708;
  const KAYIT_N = 25;
  const kayitZaman = bellek('kZ', () => {
    const T = [];
    for (let k = 0; k < KAYIT_N; k++) T.push(k < 4 ? 1.1 + k * 0.85 : 4.6 + 4.8 * Math.pow((k - 4) / 20, 0.85));
    return T;
  });
  const cetele = (ctx, x, y, n, p, o) => {
    // n çizgi; gruplar 5'li (4 dik + çapraz)
    const ara1 = o.ara, boy = o.boy;
    for (let i = 0; i < n; i++) {
      const g = Math.floor(i / 5), j = i % 5;
      const gx = x + g * (ara1 * 4 + o.grupAra);
      const al = i === n - 1 ? p : 1;
      if (j < 4) E.cizgi(ctx, [[gx + j * ara1, y - boy / 2], [gx + j * ara1, y - boy / 2 + boy * al]], { renk: 'tebesir', kalinlik: 2.6 });
      else E.cizgi(ctx, [[gx - ara1 * 0.5, y + boy * 0.32], [gx - ara1 * 0.5 + (ara1 * 4) * al, y + boy * 0.32 - boy * 0.64 * al]], { renk: 'mercan', kalinlik: 2.6 });
    }
  };
  const kayit = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const z = ikiZar(ANA_TOHUM, KAYIT_N), T = kayitZaman;
    const toplam = (k) => z[2 * k] + z[2 * k + 1];
    const atilan = T.filter((x) => x <= t).length;
    // sayım
    const sayi = {}; for (let q = 2; q <= 12; q++) sayi[q] = 0;
    for (let k = 0; k < KAYIT_N; k++) sayi[toplam(k)]++;

    // tablo geometrisi
    const tb = H
      ? { x0: ic.x + 330, x1: ic.x1, yBas: ic.y + 18, y0: ic.y + 58, sh: (ic.h - 66) / 11, cTop: 44, cCet: 112, cSik: 312, cGor: 452, bar0: 578, barW: 236, bas: 24 }
      : { x0: ic.x, x1: ic.x1, yBas: ic.y + 196, y0: ic.y + 242, sh: (ic.y1 - (ic.y + 242)) / 11, cTop: 42, cCet: 104, cSik: 290, cGor: 384, bar0: 452, barW: 180, bas: 24 };
    const X = (v) => tb.x0 + v;
    const rowY = (q) => tb.y0 + (q - 2) * tb.sh + tb.sh / 2;
    const tA = ara(t, 0.1, 0.9);
    const sikA = ara(t, 9.9, 10.5), gorA = ara(t, 12.2, 12.8);
    // başlıklar
    const bas = (m, x, al, hz = 'center') => E.yazi(ctx, m, X(x), tb.yBas, { boyut: 22, agirlik: 700, harfAra: 1, renk: 'gumus', alfa: al, hiza: hz });
    bas('TOPLAM', tb.cTop, tA);
    bas('ÇETELE', tb.cCet, tA, 'left');
    bas('SIKLIK', tb.cSik, tA * Math.max(0.35, sikA));
    if (H) bas('GÖRELİ SIKLIK', tb.cGor, tA * Math.max(0.35, gorA));
    else {
      E.yazi(ctx, 'GÖRELİ', X(tb.cGor), tb.yBas - 13, { boyut: 22, agirlik: 700, harfAra: 2, renk: 'gumus', alfa: tA * Math.max(0.35, gorA) });
      E.yazi(ctx, 'SIKLIK', X(tb.cGor), tb.yBas + 13, { boyut: 22, agirlik: 700, harfAra: 2, renk: 'gumus', alfa: tA * Math.max(0.35, gorA) });
    }
    // çubuk başlığı: sıklık dağılımı → göreli sıklık dağılımı
    const bA = ara(t, 10.0, 10.8), donus = ara(t, 13.4, 14.2);
    if (H) {
      E.yazi(ctx, 'sıklık dağılımı', X(tb.bar0), tb.yBas, { boyut: 22, agirlik: 600, renk: 'turkuaz', hiza: 'left', alfa: bA * (1 - donus) });
      E.yazi(ctx, 'göreli sıklık dağılımı', X(tb.bar0), tb.yBas, { boyut: 22, agirlik: 600, renk: 'limon', hiza: 'left', alfa: bA * donus });
    }
    // satırlar
    const yedi = ara(t, 18.4, 19.0);
    for (let q = 2; q <= 12; q++) {
      const y = rowY(q);
      const rA = tA * ara(t, 0.15 + (q - 2) * 0.05, 0.6 + (q - 2) * 0.05);
      if (q % 2 === 0) { ctx.save(); ctx.globalAlpha *= rA * 0.5; ctx.fillStyle = E.rgba('lacivert', 0.8); ctx.fillRect(tb.x0, y - tb.sh / 2, tb.x1 - tb.x0, tb.sh); ctx.restore(); }
      if (q === 7 && yedi > 0) {
        E.panel(ctx, tb.x0 - 6, y - tb.sh / 2, tb.x1 - tb.x0 + 6, tb.sh, { r: 8, renk: 'limon', dolguAlfa: 0.1 * yedi, kenar: 'limon', kenarAlfa: 0.8 * yedi, alfa: 1 });
      }
      E.yazi(ctx, String(q), X(tb.cTop), y, { boyut: tb.bas + 2, agirlik: 700, renk: q === 7 && yedi > 0.5 ? 'limon' : 'tebesir', alfa: rA });
      // çetele: bu satıra düşen atışlar
      let n = 0, p = 1;
      for (let k = 0; k < atilan; k++) if (toplam(k) === q) { n++; p = ara(t, T[k] + 0.25, T[k] + 0.55); }
      if (n > 0) cetele(ctx, X(tb.cCet + 4), y, n, p, { ara: H ? 13 : 11, boy: tb.sh * 0.52, grupAra: H ? 14 : 12 });
      // sıklık
      const qa = ara(t, 9.9 + (q - 2) * 0.1, 10.3 + (q - 2) * 0.1);
      E.yazi(ctx, String(sayi[q]), X(tb.cSik), y, { boyut: tb.bas + 2, agirlik: 640, alfa: qa });
      // göreli sıklık
      const ga = ara(t, 12.2 + (q - 2) * 0.12, 12.6 + (q - 2) * 0.12);
      const parla = E.nabiz(t, 15.6 + (q - 2) * 0.12, 0.5);
      E.yazi(ctx, ondalik(sayi[q] / KAYIT_N), X(tb.cGor), y, { boyut: tb.bas + 2, agirlik: 640, renk: parla > 0.2 || (q === 7 && yedi > 0.5) ? 'limon' : 'turkuaz', alfa: ga, parilti: parla });
      // çubuk
      const bw = (sayi[q] / 6) * tb.barW * ara(t, 10.0 + (q - 2) * 0.06, 10.8 + (q - 2) * 0.06);
      if (bw > 0.5) {
        const gr = ctx.createLinearGradient(X(tb.bar0), 0, X(tb.bar0) + bw, 0);
        gr.addColorStop(0, E.rgba('turkuaz', 0.12)); gr.addColorStop(1, E.rgba('turkuaz', 0.55));
        ctx.fillStyle = gr; ctx.fillRect(X(tb.bar0), y - tb.sh * 0.26, bw, tb.sh * 0.52);
        E.cizgi(ctx, [[X(tb.bar0) + bw, y - tb.sh * 0.26], [X(tb.bar0) + bw, y + tb.sh * 0.26]], { renk: q === 7 && yedi > 0.5 ? 'limon' : 'turkuaz', kalinlik: 3, parilti: 0.8 });
      }
    }
    // çubuk ekseni
    E.cizgi(ctx, [[X(tb.bar0), tb.y0 - 4], [X(tb.bar0), tb.y0 + tb.sh * 11]], { renk: 'cizgi', kalinlik: 2, alfa: bA });

    // sol/üst yuva: zarlar, sonra formüller
    const slot = H ? { cx: ic.x + 140, cy: ic.cy - 10 } : { cx: ic.cx, cy: ic.y + 80 };
    const zarA = 1 - ara(t, 9.6, 10.2);
    if (zarA > 0) {
      const k = Math.max(0, atilan - 1);
      const tz = atilan ? T[k] : 1.1;
      const s0 = H ? 76 : 68;
      const dx = H ? 48 : 46;
      const zx = H ? slot.cx : ic.x + 120, zy = H ? slot.cy - 70 : slot.cy;
      const yuv = k < 4 ? 0.5 : 0.18;
      yuvarlanan(ctx, t, tz - yuv, tz, zx - dx, zy, s0, z[2 * k], { renk: 'turkuaz', tohum: 50 + k, alfa: zarA * tA });
      yuvarlanan(ctx, t, tz - yuv, tz, zx + dx, zy, s0, z[2 * k + 1], { renk: 'mercan', tohum: 90 + k, yon: -1, alfa: zarA * tA });
      const top = atilan ? toplam(k) : 0;
      const sa = atilan ? ara(t, tz, tz + 0.15) : 0;
      if (H) {
        E.formul(ctx, `= \\c{limon}{${top}}`, slot.cx, zy + 92, { boyut: 46, alfa: sa * zarA });
        E.yazi(ctx, `atış ${atilan} / ${KAYIT_N}`, slot.cx, zy + 170, { boyut: 26, agirlik: 600, renk: 'gumus', alfa: zarA * tA });
      } else {
        E.formul(ctx, `= \\c{limon}{${top}}`, zx + 100, zy, { boyut: 46, hiza: 'left', alfa: sa * zarA });
        E.yazi(ctx, `atış ${atilan} / ${KAYIT_N}`, ic.x1, zy, { boyut: 26, agirlik: 600, renk: 'gumus', hiza: 'right', alfa: zarA * tA });
      }
      // atışın satırına uçan ışık
      if (atilan && t - tz < 0.3 && t >= tz) {
        const u = clamp((t - tz) / 0.3);
        const hx = X(tb.cCet + 10), hy = rowY(top);
        E.nokta(ctx, lerp(zx, hx, E.e.io2(u)), lerp(zy, hy, E.e.io2(u)), 7, { renk: 'limon', parilti: 1.4, alfa: 1 - u * 0.3 });
      }
    }
    // formül yuvası
    const fA = (a0, b0) => ara(t, a0, a0 + 0.6, 'cik3') * (1 - ara(t, b0, b0 + 0.5));
    const fb = H ? 34 : 34;
    const satir = H ? 66 : 0;
    if (H) {
      E.formul(ctx, `n = ${KAYIT_N}`, slot.cx, slot.cy - 120, { boyut: 40, alfa: fA(10.4, 21.0) });
      E.yazi(ctx, 'göreli sıklık', slot.cx, slot.cy - 40, { boyut: 26, agirlik: 600, renk: 'turkuaz', alfa: fA(12.0, 15.4) });
      E.formul(ctx, '= \\frac{\\t{sıklık}}{\\t{deneme sayısı}}', slot.cx, slot.cy + 30, { boyut: 30, alfa: fA(12.3, 15.4) });
      E.yazi(ctx, 'göreli sıklıkların toplamı', slot.cx, slot.cy - 40, { boyut: 26, agirlik: 600, renk: 'turkuaz', alfa: fA(15.7, 18.2), maxGen: 240 });
      E.formul(ctx, '\\frac{25}{25} = \\c{limon}{1}', slot.cx, slot.cy + 40, { boyut: 38, alfa: fA(16.2, 18.2) });
      E.yazi(ctx, 'deneysel olasılık', slot.cx, slot.cy - 40, { boyut: 26, agirlik: 600, renk: 'limon', alfa: fA(18.6, 30) });
      E.formul(ctx, 'P(7) ≈ \\frac{6}{25} = 0{,}24', slot.cx, slot.cy + 36, { boyut: 34, alfa: fA(19.0, 30) });
      E.yazi(ctx, '25 atışlık bir tahmin', slot.cx, slot.cy + 120, { boyut: 24, agirlik: 500, renk: 'gumus', alfa: fA(19.6, 30) });
    } else {
      E.formul(ctx, `n = ${KAYIT_N}`, ic.cx, slot.cy - 20, { boyut: 36, alfa: fA(10.4, 12.0) });
      E.formul(ctx, '\\t{göreli sıklık} = \\frac{\\t{sıklık}}{\\t{deneme sayısı}}', ic.cx, slot.cy + 6, { boyut: fb * 0.92, alfa: fA(12.3, 15.4) });
      E.formul(ctx, '\\t{göreli sıklıkların toplamı} = \\frac{25}{25} = \\c{limon}{1}', ic.cx, slot.cy + 6, { boyut: fb * 0.84, alfa: fA(15.9, 18.2) });
      E.yazi(ctx, 'deneysel olasılık', ic.cx, slot.cy - 36, { boyut: 26, agirlik: 600, renk: 'limon', alfa: fA(18.6, 30) });
      E.formul(ctx, 'P(7) ≈ \\frac{6}{25} = 0{,}24', ic.cx, slot.cy + 36, { boyut: 34, alfa: fA(19.0, 30) });
    }
    void satir;
  };

  /* =====================================================================
     5. Toplam 7'nin izi: 25, 50, 100, 150, 200 → 500, 1000, 1500
     ===================================================================== */
  const DURAK = [25, 50, 100, 150, 200, 500, 1000, 1500];
  const iz = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const c = birikimli(ANA_TOHUM, 2000)[7];
    const n1 = kf(t, [[0, 200], [9.2, 200], [11.4, 1500, 'io3']]);
    const g = grafik(H
      ? { x: ic.x + 72, y: ic.y + 46, w: 640, h: ic.h - 46 - 60, n0: 0, n1, v0: 0, v1: 0.4 }
      : { x: ic.x + 66, y: ic.y + 50, w: ic.w - 86, h: 330, n0: 0, n1, v0: 0, v1: 0.4 });
    const eA = ara(t, 0.1, 0.9);
    g.eksen(ctx, { xTik: n1 < 420 ? [25, 50, 100, 150, 200] : [200, 500, 1000, 1500], yAdim: 0.1, alfa: eA });
    E.yazi(ctx, 'toplamın 7 olmasının göreli sıklığı', g.x - 8, g.y - E.yd(30, 30), { boyut: 22, agirlik: 600, renk: 'turkuaz', hiza: 'left', alfa: eA });
    E.yazi(ctx, 'atış sayısı', g.x + g.w, g.y + g.h + E.yd(52, 52), { boyut: 22, agirlik: 600, renk: 'gumus', hiza: 'right', alfa: eA });
    // eğri: 1 → 200 (sınıf grupları), sonra 200 → 1500 (simülasyon)
    const nMax = Math.floor(kf(t, [[1.2, 1], [8.6, 200, 'lin'], [11.4, 200], [16.4, 1500, 'io2']]));
    // hedef bandı (sonda)
    const bandA = ara(t, 16.8, 17.8);
    ctx.save(); g.kirp(ctx);
    if (bandA > 0) {
      const yy = g.py(1 / 6);
      E.cizgi(ctx, [[g.x, yy], [g.x + g.w, yy]], { renk: 'limon', kalinlik: 2, kesik: [10, 8], alfa: 0.85 * bandA, parilti: 0.6 });
    }
    ctx.globalCompositeOperation = 'lighter';
    if (nMax >= 2) {
      g.egri(ctx, c, nMax, { stil: E.rgba('turkuaz', 0.25), kalinlik: 7 });
      g.egri(ctx, c, nMax, { stil: E.rgba('turkuaz', 1), kalinlik: 2.6 });
    }
    ctx.restore();
    if (nMax >= 1) E.nokta(ctx, g.px(nMax), g.py(Math.min(c[nMax] / nMax, 0.4)), 7, { renk: 'tebesir', parilti: 1.3 });
    // duraklar
    DURAK.forEach((n, i) => {
      if (nMax < n) return;
      const a = 1;
      E.nokta(ctx, g.px(n), g.py(c[n] / n), 6, { renk: i < 5 ? 'turkuaz' : 'menekse', parilti: 1, alfa: a });
    });
    if (bandA > 0) E.etiket(ctx, '≈ 0,17', g.x + g.w * 0.56, g.py(1 / 6) - 34, { boyut: 24, renk: 'limon', alfa: bandA, kenar: 'limon' });
    // simülasyon etiketi
    const simA = ara(t, 9.4, 10.2) * (1 - ara(t, 15.6, 16.4));
    E.etiket(ctx, 'simülasyon', g.x + g.w * 0.62, g.y + 22, { boyut: 24, renk: 'menekse', alfa: simA, kenar: 'menekse' });

    // tablo
    const tb = H
      ? { x: ic.x + 780, w: ic.x1 - (ic.x + 780), y0: ic.y + 18, sh: 52 }
      : { x: ic.x, w: ic.w, y0: g.y + g.h + 104, sh: 36 };
    const cN = tb.x + tb.w * 0.17, cK = tb.x + tb.w * 0.5, cG = tb.x + tb.w * 0.84;
    E.yazi(ctx, 'n', cN, tb.y0, { boyut: 22, agirlik: 700, renk: 'gumus', alfa: eA });
    E.yazi(ctx, '7 sayısı', cK, tb.y0, { boyut: 22, agirlik: 700, renk: 'gumus', alfa: eA });
    E.yazi(ctx, 'göreli sıklık', cG, tb.y0, { boyut: 22, agirlik: 700, renk: 'gumus', alfa: eA });
    DURAK.forEach((n, i) => {
      const y = tb.y0 + E.yd(44, 34) + i * tb.sh;
      if (nMax < n) return;
      const a = 1;
      const sim = i >= 5;
      ctx.save(); ctx.globalAlpha *= a;
      E.panel(ctx, tb.x, y - tb.sh / 2 + 3, tb.w, tb.sh - 6, { r: 10, renk: 'lacivert', dolguAlfa: 0.55, kenar: null, vurgu: sim ? 'menekse' : 'turkuaz' });
      E.yazi(ctx, binlik(n), cN, y, { boyut: E.yd(26, 24), agirlik: 640 });
      E.yazi(ctx, String(c[n]), cK, y, { boyut: E.yd(26, 24), agirlik: 520, renk: 'gumus' });
      const son = i === DURAK.length - 1 && bandA > 0;
      E.yazi(ctx, ondalik(c[n] / n, 3), cG, y, { boyut: E.yd(26, 24), agirlik: 700, renk: son ? 'limon' : sim ? 'menekse' : 'turkuaz' });
      ctx.restore();
    });
  };

  /* =====================================================================
     6. Huni: 41 simülasyon, 2000'er atış (sürpriz)
     ===================================================================== */
  const HUNI_N = 2000;
  const HUNI_TOHUM = bellek('hT', () => { const a = [ANA_TOHUM]; for (let k = 0; k < 40; k++) a.push(2000 + k); return a; });
  const zarf = bellek('zarf', () => {
    const mn = new Float32Array(HUNI_N + 1), mx = new Float32Array(HUNI_N + 1);
    const cs = HUNI_TOHUM.map((s) => birikimli(s, HUNI_N)[7]);
    for (let n = 1; n <= HUNI_N; n++) { let a = 1, b = 0; for (const c of cs) { const v = c[n] / n; if (v < a) a = v; if (v > b) b = v; } mn[n] = a; mx[n] = b; }
    return { mn, mx };
  });
  const huni = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    // veri kamerası: tam görünüm → 2000'e yakın dar kanal → geri
    const zm = kf(t, [[0, 0], [12.6, 0], [14.6, 1, 'io3'], [16.8, 1], [18.2, 0, 'io3']]);
    const n0 = lerp(0, 1300, zm), n1 = 2000, v0 = lerp(0, 0.12, zm), v1 = lerp(0.4, 0.22, zm);
    const g = grafik(H
      ? { x: ic.x + 72, y: ic.y + 26, w: ic.w - 92, h: ic.h - 26 - 62, n0, n1, v0, v1 }
      : { x: ic.x + 66, y: ic.y + 40, w: ic.w - 86, h: 520, n0, n1, v0, v1 });
    const eA = ara(t, 0.1, 0.9);
    g.eksen(ctx, { xTik: zm > 0.5 ? [1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000] : [0, 500, 1000, 1500, 2000], yAdim: zm > 0.5 ? 0.02 : 0.1, alfa: eA });
    E.yazi(ctx, 'atış sayısı', g.x + g.w, g.y + g.h + 52, { boyut: 22, agirlik: 600, renk: 'gumus', hiza: 'right', alfa: eA });
    const nMax = Math.max(1, Math.floor(kf(t, [[1.2, 1], [3.6, 120, 'gir2'], [9.6, HUNI_N, 'io2']])));
    const kopA = ara(t, 0.6, 1.4); // ek simülasyonlar
    const Z = zarf;
    ctx.save(); g.kirp(ctx);
    // huni zarfı
    const zA = ara(t, 9.8, 11.0);
    if (zA > 0) {
      const ust = [], alt = [];
      const nA = Math.max(2, Math.floor(n0)), adim = Math.max(1, Math.floor((n1 - n0) / 300));
      for (let n = nA; n <= HUNI_N; n += n < 60 ? 1 : adim) { ust.push([g.px(n), g.py(Z.mx[n])]); alt.push([g.px(n), g.py(Z.mn[n])]); }
      E.cokgen(ctx, ust.concat(alt.reverse()), { renk: 'limon', alfa: 0.1 * zA });
      E.cizgi(ctx, ust, { renk: 'limon', kalinlik: 2, parilti: 0.8, alfa: 0.8 * zA });
      E.cizgi(ctx, alt.slice().reverse(), { renk: 'limon', kalinlik: 2, parilti: 0.8, alfa: 0.8 * zA });
    }
    ctx.globalCompositeOperation = 'lighter';
    HUNI_TOHUM.forEach((tohum, i) => {
      const c = birikimli(tohum, HUNI_N)[7];
      if (i === 0) return;
      g.egri(ctx, c, nMax, { stil: E.rgba(i % 3 === 0 ? 'gok' : 'turkuaz', 0.26 * kopA), kalinlik: 1.6 });
    });
    g.egri(ctx, birikimli(ANA_TOHUM, HUNI_N)[7], nMax, { stil: E.rgba('tebesir', 0.9), kalinlik: 2.4 });
    ctx.restore();

    // kesitler: n = 25 ve n = 2000
    const kes = (n, a0, ust) => {
      const a = ara(t, a0, a0 + 0.7) * (zm > 0.5 ? (n === 25 ? 0 : 1) : 1) * (n === 25 ? 1 - ara(t, 12.0, 12.6) : 1);
      if (a <= 0) return;
      const x = g.px(n), y1 = g.py(Z.mx[n]), y2 = g.py(Z.mn[n]);
      E.cizgi(ctx, [[x - 10, y1], [x + 10, y1]], { renk: 'tebesir', kalinlik: 2.5, alfa: a });
      E.cizgi(ctx, [[x - 10, y2], [x + 10, y2]], { renk: 'tebesir', kalinlik: 2.5, alfa: a });
      E.cizgi(ctx, [[x, y1], [x, y2]], { renk: 'tebesir', kalinlik: 2.5, alfa: a, parilti: 0.6 });
      const m = `${binlik(n)} atış: ${ondalik(Z.mn[n])} – ${ondalik(Z.mx[n])}`;
      E.etiket(ctx, m, ust.x, ust.y, { boyut: 26, renk: 'tebesir', alfa: a, kenar: 'limon', hiza: ust.hiza || 'center' });
    };
    kes(25, 10.6, H ? { x: g.px(25) + 24, y: g.py(Z.mx[25]) - 2, hiza: 'left' } : { x: g.px(25) + 24, y: g.py(Z.mx[25]) - 4, hiza: 'left' });
    if (zm > 0.5) kes(2000, 14.4, H ? { x: g.px(2000) - 24, y: g.py(Z.mx[2000]) - 40, hiza: 'right' } : { x: g.px(2000) - 24, y: g.py(Z.mx[2000]) - 40, hiza: 'right' });

    // sayaç
    E.yazi(ctx, `41 simülasyon × ${binlik(Math.min(nMax, HUNI_N))} atış`, H ? g.x + g.w : ic.cx, H ? g.y + 14 : g.y + g.h + 120, { boyut: E.yd(24, 28), agirlik: 600, renk: 'gumus', hiza: H ? 'right' : 'center', alfa: kopA * (1 - ara(t, 9.6, 10.2)) });
    // Büyük Sayılar Yasası
    const yA = ara(t, 18.0, 18.8);
    if (H) {
      const px = g.x + g.w - 520, py = g.y + 4;
      E.panel(ctx, px, py, 520, 128, { alfa: yA, vurgu: 'limon' });
      E.yazi(ctx, 'BÜYÜK SAYILAR YASASI', px + 30, py + 34, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'limon', hiza: 'left', alfa: yA });
      E.yazi(ctx, 'Deneme sayısı arttıkça göreli sıklık belli bir değere yaklaşır.', px + 30, py + 84, { boyut: 26, agirlik: 560, hiza: 'left', alfa: yA, maxGen: 470 });
    } else {
      const py = g.y + g.h + 72;
      E.panel(ctx, ic.x, py, ic.w, 150, { alfa: yA, vurgu: 'limon' });
      E.yazi(ctx, 'BÜYÜK SAYILAR YASASI', ic.x + 30, py + 34, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'limon', hiza: 'left', alfa: yA });
      E.yazi(ctx, 'Deneme sayısı arttıkça göreli sıklık belli bir değere yaklaşır.', ic.x + 30, py + 94, { boyut: 28, agirlik: 560, hiza: 'left', alfa: yA, maxGen: ic.w - 60 });
    }
    // dikeyde alt boşluk: zarf açıklaması
    if (!H) {
      const a = ara(t, 10.4, 11.0) * (1 - ara(t, 17.6, 18.0));
      E.yazi(ctx, 'Sarı huni: 41 deneyin en küçük ve en büyük değerleri', ic.cx, g.y + g.h + 130, { boyut: 26, agirlik: 560, renk: 'gumus', alfa: a, maxGen: ic.w - 20 });
    }
  };

  /* =====================================================================
     7. Yargı: Oyundaki zar adil mi?
     ===================================================================== */
  const HILE_TOHUM = 4000, YARGI_N = 600;
  const ADIL_TOHUM = bellek('aT', () => { const a = []; for (let k = 0; k < 40; k++) a.push(3000 + k); return a; });
  const adilZarf = bellek('aZ', () => {
    const mn = new Float32Array(YARGI_N + 1), mx = new Float32Array(YARGI_N + 1);
    const cs = ADIL_TOHUM.map((s) => tekZar(s, YARGI_N, false).c);
    for (let n = 1; n <= YARGI_N; n++) { let a = 1, b = 0; for (const c of cs) { const v = c[n] / n; if (v < a) a = v; if (v > b) b = v; } mn[n] = a; mx[n] = b; }
    return { mn, mx };
  });
  const yargiZaman = (t) => Math.floor(kf(t, [[4.6, 0], [7.4, 30, 'io2'], [10.6, 30], [14.4, YARGI_N, 'io2']]));
  const yargi = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const hz = tekZar(HILE_TOHUM, YARGI_N, true);
    const Z = adilZarf;
    const n = yargiZaman(t);
    const pA = ara(t, 0.1, 0.9);
    // uygulama paneli
    if (H) {
      const px = ic.x + 6, py = ic.y + 10, pw = 250, ph = ic.h - 24;
      E.panel(ctx, px, py, pw, ph, { r: 34, alfa: pA, kenar: 'cizgi', dolguAlfa: 0.85 });
      E.cizgi(ctx, [[px + pw / 2 - 30, py + 22], [px + pw / 2 + 30, py + 22]], { renk: 'cizgi', kalinlik: 5, alfa: pA });
      E.yazi(ctx, 'ZAR OYUNU', px + pw / 2, py + 62, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'mercan', alfa: pA });
      const v = n ? hz.d[n - 1] : 6;
      zarCiz(ctx, px + pw / 2, py + 170, 96, v, { renk: v === 6 ? 'limon' : 'mercan', alfa: pA, aci: (E.hash(n, 7) - 0.5) * 0.4 });
      E.yazi(ctx, `atış: ${n}`, px + pw / 2, py + 270, { boyut: 28, agirlik: 600, alfa: pA });
      E.yazi(ctx, `6 gelme: ${hz.c[n]}`, px + pw / 2, py + 316, { boyut: 28, agirlik: 600, renk: 'limon', alfa: pA });
      E.formul(ctx, n ? `\\frac{${hz.c[n]}}{${n}} ≈ ${ondalikF(hz.c[n] / n)}` : '–', px + pw / 2, py + 400, { boyut: 34, alfa: pA * ara(t, 4.8, 5.2), renk: 'mercan' });
    } else {
      const px = ic.x, py = ic.y, pw = ic.w, ph = 150;
      E.panel(ctx, px, py, pw, ph, { r: 26, alfa: pA, kenar: 'cizgi', dolguAlfa: 0.85 });
      const v = n ? hz.d[n - 1] : 6;
      zarCiz(ctx, px + 90, py + ph / 2, 92, v, { renk: v === 6 ? 'limon' : 'mercan', alfa: pA, aci: (E.hash(n, 7) - 0.5) * 0.4 });
      E.yazi(ctx, 'ZAR OYUNU', px + 170, py + 36, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'mercan', hiza: 'left', alfa: pA });
      E.yazi(ctx, `atış: ${n}`, px + 170, py + 80, { boyut: 26, agirlik: 600, hiza: 'left', alfa: pA });
      E.yazi(ctx, `6 gelme: ${hz.c[n]}`, px + 170, py + 118, { boyut: 26, agirlik: 600, renk: 'limon', hiza: 'left', alfa: pA });
      E.formul(ctx, n ? `\\frac{${hz.c[n]}}{${n}} ≈ ${ondalikF(hz.c[n] / n)}` : '–', px + pw - 30, py + ph / 2, { boyut: 36, hiza: 'right', alfa: pA * ara(t, 4.8, 5.2), renk: 'mercan' });
    }
    // grafik
    const g = grafik(H
      ? { x: ic.x + 360, y: ic.y + 40, w: ic.w - 380, h: ic.h - 40 - 62, n0: 0, n1: YARGI_N, v0: 0, v1: 0.5 }
      : { x: ic.x + 66, y: ic.y + 226, w: ic.w - 86, h: 330, n0: 0, n1: YARGI_N, v0: 0, v1: 0.5 });
    const eA = ara(t, 1.4, 2.2);
    g.eksen(ctx, { xTik: [0, 30, 100, 200, 300, 400, 500, 600], yAdim: 0.1, alfa: eA });
    E.yazi(ctx, '6 gelmesinin göreli sıklığı', g.x - 8, g.y - 30, { boyut: 22, agirlik: 600, renk: 'turkuaz', hiza: 'left', alfa: eA });
    E.yazi(ctx, 'atış sayısı', g.x + g.w, g.y + g.h + 52, { boyut: 22, agirlik: 600, renk: 'gumus', hiza: 'right', alfa: eA });
    // adil zarların hunisi
    const hA = ara(t, 2.2, 3.4);
    ctx.save(); g.kirp(ctx);
    if (hA > 0) {
      const ust = [], alt = [];
      for (let k = 2; k <= YARGI_N; k += k < 60 ? 1 : 3) { ust.push([g.px(k), g.py(Z.mx[k])]); alt.push([g.px(k), g.py(Z.mn[k])]); }
      E.cokgen(ctx, ust.concat(alt.slice().reverse()), { renk: 'turkuaz', alfa: 0.12 * hA });
      E.cizgi(ctx, ust, { renk: 'turkuaz', kalinlik: 1.6, alfa: 0.7 * hA });
      E.cizgi(ctx, alt, { renk: 'turkuaz', kalinlik: 1.6, alfa: 0.7 * hA });
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ADIL_TOHUM.forEach((tohum, i) => { if (i % 2) return; g.egri(ctx, tekZar(tohum, YARGI_N, false).c, YARGI_N, { stil: E.rgba('turkuaz', 0.16 * hA), kalinlik: 1.2 }); });
      ctx.restore();
    }
    if (n >= 2) {
      g.egri(ctx, hz.c, n, { stil: E.rgba('mercan', 0.3), kalinlik: 8 });
      g.egri(ctx, hz.c, n, { stil: E.R('mercan'), kalinlik: 3 });
    }
    ctx.restore();
    E.etiket(ctx, 'adil zarlar (40 simülasyon)', g.x + g.w - 6, g.py(0.05), { boyut: 22, hiza: 'right', renk: 'turkuaz', alfa: hA * (1 - ara(t, 13.8, 14.4)), kenar: 'turkuaz' });
    if (n >= 1) E.nokta(ctx, g.px(n), g.py(hz.c[n] / n), 7, { renk: 'mercan', parilti: 1.3 });
    // kesitler
    const kesit = (k, a) => {
      if (a <= 0) return;
      const x = g.px(k);
      E.cizgi(ctx, [[x, g.py(Z.mx[k])], [x, g.py(Z.mn[k])]], { renk: 'tebesir', kalinlik: 3, alfa: a, parilti: 0.6 });
      for (const v of [Z.mx[k], Z.mn[k]]) E.cizgi(ctx, [[x - 9, g.py(v)], [x + 9, g.py(v)]], { renk: 'tebesir', kalinlik: 3, alfa: a });
    };
    const k30 = ara(t, 7.6, 8.2) * (1 - ara(t, 10.2, 10.8)), k600 = ara(t, 14.4, 15.0);
    kesit(30, k30); kesit(600, k600);
    // hüküm damgaları
    const damga = (m, alt, renk, a, x, y, hiza) => {
      if (a <= 0) return;
      const sc = 1 + 0.25 * (1 - E.e.cik3(a));
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
      E.yazi(ctx, m, 0, 0, { boyut: E.yd(32, 32), agirlik: 760, renk, harfAra: 2, hiza, alfa: a, parilti: 0.3, parRenk: renk });
      E.yazi(ctx, alt, 0, 40, { boyut: 24, agirlik: 520, renk: 'gumus', hiza, alfa: a });
      ctx.restore();
    };
    const d1 = ara(t, 8.4, 9.0) * (1 - ara(t, 10.2, 10.8)), d2 = ara(t, 14.8, 15.4);
    if (H) {
      damga('KARAR İÇİN ERKEN', '30 atışta adil zar da 0,30 verebilir', 'tebesir', d1, g.px(30) + 50, g.py(0.45), 'left');
      damga('MUHTEMELEN HİLELİ', '600 atışta 0,31: huninin çok dışında', 'mercan', d2, g.px(600) - 10, g.py(0.45), 'right');
    } else {
      const yy = g.y + g.h + 110;
      damga('KARAR İÇİN ERKEN', '30 atışta adil zar da 0,30 verebilir', 'tebesir', d1, ic.cx, yy, 'center');
      damga('MUHTEMELEN HİLELİ', '600 atışta 0,31: huninin çok dışında', 'mercan', d2, ic.cx, yy, 'center');
    }
  };

  /* ---------- Kartlar ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Göreli sıklık:', formul: '\\frac{\\t{olayın sıklığı}}{\\t{deneme sayısı}}' },
    { tr: 'Göreli sıklıkların toplamı 1’dir.' },
    { tr: 'Deneme arttıkça zikzaklar söner, değişkenlik azalır.' },
    { tr: 'Deneysel olasılık bir değere yerleşir; yargı için çok deneme gerekir.' },
  ], { aralik: 1.5 });

  E.film({
    meta,
    sure: 118.8,
    sahneler: [
      { ad: 'Soğuk açılış: 10 000 atış', bas: 0, son: 12.4, giris: 0, cikis: 0.7, itme: 0, ciz: acilis },
      { ad: 'İmza', bas: 12.1, son: 15.8, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 15.5, son: 19.8, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Kayıt: çetele, sıklık, göreli sıklık', bas: 19.5, son: 41.6, ciz: kayit },
      { ad: 'Toplam 7’nin izi', bas: 41.3, son: 62.8, ciz: iz },
      { ad: 'Huni: gürültü söner', bas: 62.5, son: 82.6, itme: 0, ciz: huni },
      { ad: 'Yargı: zar adil mi?', bas: 82.3, son: 102.6, ciz: yargi },
      { ad: 'Aklında kalsın', bas: 102.3, son: 112.6, ciz: ozet },
      { ad: 'Laboratuvar', bas: 112.4, son: 118.8, cikis: 0.8, ciz: (c, s) => E.bitisKarti(c, s, meta) },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 6, renk1: 'turkuaz', renk2: 'gok' }),
  });
})();
