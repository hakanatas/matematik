/* ==========================================================================
   EKSEN 9.2.3 — Kesişim Anı
   Tek fikir: Denklem, iki doğrunun buluştuğu andır; eşitsizlik, bir doğrunun
   diğerinin altında kaldığı aralıktır. Çözüm kümesi x ekseninde yanan bir
   aralık olarak düşer.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp, yd } = E;

  const meta = {
    kod: 'MAT.9.2.3',
    tema: 'Nicelikler ve Değişimler',
    ad: 'Kesişim Anı',
    adEn: 'The Crossing Point',
    labAd: 'Fonksiyon Laboratuvarı',
    labAciklama: 'İki doğruyu kendin kur; kesişim noktasını ve eşitsizlik bölgelerini anında gör.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-fonksiyonlar/',
  };

  /* ---------- Yardımcılar ---------- */
  const sy = (v, b = 2) => E.sayiYaz(Math.abs(v) < 1e-9 ? 0 : v, b);
  const tl = (v) => v.toFixed(2).replace('.', ',');
  /** Eşit ölçekli koordinat düzlemi: kutu {x,y,w,h,u(px/birim)}; (ox,oy) kutunun merkezine gelir */
  const duz = (b, ox = 0, oy = 0) => E.duzlem({ x: b.x, y: b.y, w: b.w, h: b.h, xmin: ox - b.w / 2 / b.u, xmax: ox + b.w / 2 / b.u, ymin: oy - b.h / 2 / b.u, ymax: oy + b.h / 2 / b.u });
  const KUTU = () => (E.yatay ? { x: 84, y: 54, w: 520, h: 500, u: 40 } : { x: 50, y: 100, w: 620, h: 450, u: 44 });
  const PANEL = () => (E.yatay ? { x: 650, y: 54, w: 546, h: 500 } : { x: 40, y: 576, w: 640, h: 304 });

  /** Düzlemi boydan boya kesen doğru (kutuya kırpılmış). o.p: soldan sağa çizim */
  const dogru = (ctx, d, f, o = {}) => {
    o = Object.assign({ renk: 'turkuaz', kalinlik: 4, parilti: 0.9, p: 1, alfa: 1, x0: d.xmin, x1: d.xmax }, o);
    if (o.alfa <= 0.002 || o.p <= 0) return;
    const xe = lerp(o.x0, o.x1, clamp(o.p));
    const pts = [d.p(o.x0, f(o.x0)), d.p(xe, f(xe))];
    ctx.save(); ctx.beginPath(); ctx.rect(d.x, d.y, d.w, d.h); ctx.clip();
    E.cizgi(ctx, pts, Object.assign({}, o, { p: 1 }));
    if (o.bas && o.p < 1) E.isik(ctx, pts[1][0], pts[1][1], 70, o.renk, 0.7 * o.alfa);
    ctx.restore();
  };
  /** Kırpılmış alan dolgusu (matematik koordinatında çokgen) */
  const bolge = (ctx, d, pts, renk, alfa) => {
    if (alfa <= 0.002) return;
    ctx.save(); ctx.beginPath(); ctx.rect(d.x, d.y, d.w, d.h); ctx.clip();
    E.cokgen(ctx, pts.map(([x, y]) => d.p(x, y)), { renk, alfa });
    ctx.restore();
  };
  /** Eksen ve ızgara (x ve y için ayrı adım, etiket biçimi) */
  const eksenler = (ctx, d, o = {}) => {
    o = Object.assign({ alfa: 1, p: 1, boyut: 22, xAdim: 1, yAdim: 1, xAd: 'x', yAd: 'y', xFmt: sy, yFmt: sy, xAlt: false }, o);
    if (o.alfa <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= o.alfa;
    ctx.save(); ctx.beginPath(); ctx.rect(d.x, d.y, d.w, d.h); ctx.clip();
    ctx.strokeStyle = E.rgba('sis', 0.55); ctx.lineWidth = 1;
    for (let x = Math.ceil(d.xmin / o.xAdim) * o.xAdim; x <= d.xmax + 1e-9; x += o.xAdim) { ctx.beginPath(); ctx.moveTo(d.px(x), d.y + d.h); ctx.lineTo(d.px(x), d.y + d.h - d.h * o.p); ctx.stroke(); }
    for (let y = Math.ceil(d.ymin / o.yAdim) * o.yAdim; y <= d.ymax + 1e-9; y += o.yAdim) { ctx.beginPath(); ctx.moveTo(d.x, d.py(y)); ctx.lineTo(d.x + d.w * o.p, d.py(y)); ctx.stroke(); }
    ctx.restore();
    const ox = clamp(d.px(0), d.x, d.x + d.w), oy = clamp(d.py(0), d.y, d.y + d.h);
    E.cizgi(ctx, [[d.x, oy], [d.x + d.w, oy]], { renk: 'cizgi', kalinlik: 2.2, p: o.p, ok: true, okBoy: 12 });
    E.cizgi(ctx, [[ox, d.y + d.h], [ox, d.y]], { renk: 'cizgi', kalinlik: 2.2, p: o.p, ok: true, okBoy: 12 });
    const ly = o.xAlt ? d.y + d.h + o.boyut * 0.95 : oy + o.boyut * 0.95;
    for (let x = Math.ceil(d.xmin / o.xAdim) * o.xAdim; x <= d.xmax - o.xAdim * 0.4; x += o.xAdim) {
      if (Math.abs(x) < 1e-9 && !o.sifir) continue;
      E.yazi(ctx, o.xFmt(x), d.px(x), ly, { boyut: o.boyut, renk: 'gumus', alfa: o.p });
    }
    for (let y = Math.ceil(d.ymin / o.yAdim) * o.yAdim; y <= d.ymax - o.yAdim * 0.4; y += o.yAdim) {
      if (Math.abs(y) < 1e-9) continue;
      E.yazi(ctx, o.yFmt(y), ox - o.boyut * 0.5, d.py(y), { boyut: o.boyut, renk: 'gumus', hiza: 'right', alfa: o.p });
    }
    E.yazi(ctx, o.xAd, d.x + d.w - 4, oy - o.boyut * 1.05, { boyut: o.boyut, renk: 'gumus', agirlik: 600, hiza: 'right', alfa: o.p });
    E.yazi(ctx, o.yAd, ox + o.boyut * 0.7, d.y + o.boyut * 0.4, { boyut: o.boyut, renk: 'gumus', agirlik: 600, hiza: 'left', alfa: o.p });
    ctx.restore();
  };
  /** Düzlemin sayı etiketleri (d.ciz'in etiketleri, ayrı alfa ile) */
  const etiketler = (ctx, d, o = {}) => {
    const al = o.alfa ?? 1, ad = o.adim || 2, b = o.boyut || 22;
    if (al <= 0.002) return;
    const ox = clamp(d.px(0), d.x, d.x + d.w), oy = clamp(d.py(0), d.y, d.y + d.h);
    for (let x = Math.ceil(d.xmin / ad) * ad; x <= d.xmax - ad * 0.5; x += ad) if (Math.abs(x) > 1e-9) E.yazi(ctx, sy(x), d.px(x), oy + b * 0.95, { boyut: b, renk: 'gumus', alfa: al });
    for (let y = Math.ceil(d.ymin / ad) * ad; y <= d.ymax - ad * 0.5; y += ad) if (Math.abs(y) > 1e-9) E.yazi(ctx, sy(y), ox - b * 0.5, d.py(y), { boyut: b, renk: 'gumus', hiza: 'right', alfa: al });
    E.formul(ctx, 'x', d.x + d.w - b * 0.4, oy - b * 0.95, { boyut: b * 1.15, renk: 'gumus', alfa: al });
    E.formul(ctx, 'y', ox + b * 0.85, d.y + b * 0.5, { boyut: b * 1.15, renk: 'gumus', alfa: al });
  };
  /** Kimlik kartı: satirlar [{ad, deger(formül), alfa, vurgu}] — yatayda tek, dikeyde iki sütun */
  const kart = (ctx, o) => {
    const al = o.alfa ?? 1;
    if (al <= 0.002) return;
    E.panel(ctx, o.x, o.y, o.w, o.h, { alfa: al, vurgu: o.renk || 'turkuaz' });
    const ust = o.y + 34;
    if (o.kicker) E.yazi(ctx, o.kicker, o.x + 28, ust, { boyut: 22, agirlik: 700, harfAra: 4, renk: o.renk || 'turkuaz', hiza: 'left', alfa: al });
    if (o.baslik) E.formul(ctx, o.baslik, o.kicker ? o.x + o.w - 28 : o.x + o.w / 2, ust, { boyut: o.bBoyut || 30, hiza: o.kicker ? 'right' : 'center', alfa: al * (o.bAlfa ?? 1) });
    const n = o.satirlar.length;
    if (!E.yatay) {
      const cw = (o.w - 40) / 2, rows = Math.ceil(n / 2), rh = (o.h - 64) / rows;
      o.satirlar.forEach((r, i) => {
        const a = al * (r.alfa ?? 1);
        if (a <= 0.002) return;
        const x = o.x + 20 + (i % 2) * cw, y = o.y + 60 + Math.floor(i / 2) * rh;
        const v = r.vurgu || 0;
        if (v > 0.01) E.panel(ctx, x + 2, y + 2, cw - 6, rh - 6, { alfa: a * v, renk: 'limon', dolguAlfa: 0.07, kenar: 'limon', kenarAlfa: 0.55, r: 10 });
        E.yazi(ctx, r.ad, x + 16, y + 17, { boyut: 22, agirlik: 560, renk: 'gumus', hiza: 'left', alfa: a });
        E.formul(ctx, r.deger, x + 16, y + 42, { boyut: 27, hiza: 'left', renk: v > 0.5 ? 'limon' : 'tebesir', alfa: a });
      });
    } else {
      const rh = (o.h - 70) / n;
      o.satirlar.forEach((r, i) => {
        const a = al * (r.alfa ?? 1);
        if (a <= 0.002) return;
        const y = o.y + 66 + i * rh;
        const v = r.vurgu || 0;
        if (v > 0.01) E.panel(ctx, o.x + 14, y + 3, o.w - 28, rh - 6, { alfa: a * v, renk: 'limon', dolguAlfa: 0.07, kenar: 'limon', kenarAlfa: 0.55, r: 10 });
        E.yazi(ctx, r.ad, o.x + 30, y + rh / 2, { boyut: 25, agirlik: 560, renk: 'gumus', hiza: 'left', alfa: a });
        E.formul(ctx, r.deger, o.x + o.w - 30, y + rh / 2, { boyut: 29, hiza: 'right', renk: v > 0.5 ? 'limon' : 'tebesir', alfa: a });
        if (i < n - 1) E.cizgi(ctx, [[o.x + 28, y + rh], [o.x + o.w - 28, y + rh]], { renk: 'sis', kalinlik: 1, alfa: a * 0.8 });
      });
    }
  };
  /** Kıvrık parantez { : x, y0..y1 */
  const parantez = (ctx, x, y0, y1, o = {}) => {
    const w = o.w || 16, ym = (y0 + y1) / 2;
    ctx.save(); ctx.globalAlpha *= o.alfa ?? 1; ctx.strokeStyle = E.R(o.renk || 'tebesir'); ctx.lineWidth = o.kalinlik || 3; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + w, y0); ctx.quadraticCurveTo(x + w * 0.35, y0, x + w * 0.4, y0 + (ym - y0) * 0.35);
    ctx.lineTo(x + w * 0.4, ym - 12); ctx.quadraticCurveTo(x + w * 0.4, ym, x, ym);
    ctx.quadraticCurveTo(x + w * 0.4, ym, x + w * 0.4, ym + 12); ctx.lineTo(x + w * 0.4, y1 - (y1 - ym) * 0.35);
    ctx.quadraticCurveTo(x + w * 0.35, y1, x + w, y1);
    ctx.stroke(); ctx.restore();
  };
  /** İki ifade arasında yumuşak geçiş için pencere alfası */
  const pencere = (t, a0, a1, b0, b1) => ara(t, a0, a1, 'cik3') * (1 - ara(t, b0, b1));
  /** a·x + b ifadesini okunur yaz */
  const ifade = (a, b, deg = 'x') => {
    let s = '';
    if (Math.abs(a) > 1e-9) s = (Math.abs(a - 1) < 1e-9 ? '' : Math.abs(a + 1) < 1e-9 ? '−' : sy(a, 1)) + deg;
    if (Math.abs(b) > 0.049) s += s ? (b > 0 ? ' + ' : ' − ') + sy(Math.abs(b), 1) : sy(b, 1);
    return s || '0';
  };

  /** Bitiş kartı: laboratuvar adı tek satıra sığsın diye başlığı kendimiz yazarız (motor 50 px'te sarıyor) */
  const bitis = (ctx, s) => {
    E.bitisKarti(ctx, s, Object.assign({}, meta, { labAd: '' }));
    const L = E.L, ic = L.icerik;
    const qrBoy = yd(220, 260), qy = yd(L.cy - qrBoy / 2 - 40, ic.y + 330);
    const boy = E.sigdir(ctx, meta.labAd, { boyut: yd(50, 46), agirlik: 760 }, yd(500, 600), 30);
    E.yazi(ctx, meta.labAd, yd(L.cx - 400, L.cx), yd(qy + 82, ic.y + 120), { boyut: boy, agirlik: 760, hiza: yd('left', 'center'), alfa: ara(s.t, 0, 0.9, 'cik3') });
  };

  /* ---------- Ortak: tarife grafiği ---------- */
  const A = (x) => 100 + 20 * x, B = (x) => 220 + 5 * x;
  const TKUTU = () => (E.yatay ? { x: 110, y: 64, w: 500, h: 450 } : { x: 110, y: 110, w: 540, h: 420 });
  const tarifeDuzlem = () => { const g = TKUTU(); return E.duzlem({ x: g.x, y: g.y, w: g.w, h: g.h, xmin: 0, xmax: 12.8, ymin: 0, ymax: 380 }); };
  const tarifeEksen = (ctx, d, al = 1, p = 1) => {
    eksenler(ctx, d, { alfa: al, p, xAdim: 2, yAdim: 100, xAd: 'GB', yAd: 'TL' });
    E.yazi(ctx, '0', d.px(0) - 12, d.py(0) + 21, { boyut: 22, renk: 'gumus', hiza: 'right', alfa: al * p });
  };
  /** Aralık ışını x ekseni üzerinde: [a, b], uçlar dolu/boş */
  const aralikIsin = (ctx, d, a, b, o = {}) => {
    const al = o.alfa ?? 1; if (al <= 0.002) return;
    const y = d.py(0) + (o.dy || 0), p = o.p ?? 1;
    const xa = d.px(a), xb = lerp(xa, d.px(b), p);
    E.cizgi(ctx, [[xa, y], [xb, y]], { renk: o.renk || 'turkuaz', kalinlik: 8, parilti: 1.2, alfa: al, uc: 'butt' });
    if (p > 0.98) {
      if (o.solUc !== false) E.nokta(ctx, xa, y, 9, { renk: o.renk || 'turkuaz', bos: !!o.acikSol, parilti: 0.9, alfa: al });
      if (o.sagUc !== false) E.nokta(ctx, xb, y, 9, { renk: o.renk || 'turkuaz', bos: !!o.acikSag, parilti: 0.9, alfa: al });
    }
  };
  const PY = (h, v) => PANEL().y + yd(h, v);

  /* ---------- 1. Soğuk açılış: iki tarife yarışı ---------- */
  const tarifeKart = (ctx, x, y, w, h, o) => {
    E.panel(ctx, x, y, w, h, { alfa: o.alfa, vurgu: o.renk, kenar: o.ucuz > 0.5 ? 'limon' : 'sis', kenarAlfa: 0.4 + 0.5 * o.ucuz, kalinlik: 1.5 + o.ucuz });
    E.yazi(ctx, o.ad, x + 26, y + 32, { boyut: 22, agirlik: 700, harfAra: 4, renk: o.renk, hiza: 'left', alfa: o.alfa });
    if (o.ucuz > 0.01) E.yazi(ctx, 'UCUZ', x + w - 22, y + 32, { boyut: 22, agirlik: 760, harfAra: 2, renk: 'limon', hiza: 'right', alfa: o.alfa * o.ucuz });
    E.yazi(ctx, o.tarife, x + 26, y + yd(72, 70), { boyut: yd(26, 23), agirlik: 520, renk: 'gumus', hiza: 'left', alfa: o.alfa, maxGen: w - 40 });
    E.yazi(ctx, o.fiyat, x + 26, y + h - yd(42, 40), { boyut: yd(48, 40), agirlik: 700, font: 'mono', hiza: 'left', alfa: o.alfa, renk: 'tebesir', parilti: 0.2 });
  };
  const acilis = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = tarifeDuzlem();
    const ga = ara(t, 0.2, 1.0);
    tarifeEksen(ctx, d, ga, ara(t, 0.2, 1.4));
    const x = kf(t, [[1.4, 0], [6.0, 8, 'io2'], [7.0, 8], [8.8, 12.8, 'io2']]);
    if (x > 0.001) {
      E.cizgi(ctx, [d.p(0, A(0)), d.p(x, A(x))], { renk: 'mercan', kalinlik: 4.5, parilti: 1 });
      E.cizgi(ctx, [d.p(0, B(0)), d.p(x, B(x))], { renk: 'gok', kalinlik: 4.5, parilti: 1 });
      if (x < 12.79) for (const [f, rk] of [[A, 'mercan'], [B, 'gok']]) { E.isik(ctx, d.px(x), d.py(f(x)), 70, rk, 0.7); E.nokta(ctx, d.px(x), d.py(f(x)), 7, { renk: 'tebesir', parilti: 0.8 }); }
    }
    const fl = E.nabiz(t, 5.9, 1.2);
    if (t > 5.9) {
      E.nokta(ctx, d.px(8), d.py(260), 10, { renk: 'limon', parilti: 1.6, alfa: ara(t, 5.9, 6.2) });
      E.isik(ctx, d.px(8), d.py(260), 300, 'limon', 0.5 * fl);
      const ha = ara(t, 6.0, 6.4) * (1 - ara(t, 9.6, 10.2));
      const r = 14 + 120 * ara(t, 5.9, 7.0, 'cik3');
      ctx.save(); ctx.globalAlpha *= (1 - ara(t, 5.9, 7.0)) * 0.9; ctx.strokeStyle = E.R('limon'); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(d.px(8), d.py(260), r, 0, E.TAU); ctx.stroke(); ctx.restore();
      E.etiket(ctx, 'KESİŞİM ANI', d.px(8) - 20, d.py(260) - 52, { boyut: 26, agirlik: 760, renk: 'limon', hiza: 'right', alfa: ha, harfAra: 3 });
    }
    const xe = Math.min(x, 12.8), yon = x < 8 ? 1 : -1, yak = clamp((Math.abs(x - 8) - 0.3) / 0.8);
    E.etiket(ctx, 'A', d.px(xe) + 10, d.py(A(xe)) + 26 * yon, { boyut: 24, agirlik: 760, renk: 'mercan', hiza: 'left', alfa: ara(t, 1.6, 2.0) * yak });
    E.etiket(ctx, 'B', d.px(xe) + 10, d.py(B(xe)) - 26 * yon, { boyut: 24, agirlik: 760, renk: 'gok', hiza: 'left', alfa: ara(t, 1.6, 2.0) * yak });
    // tarife kartları
    const ucuzA = x < 8 - 1e-3 ? 1 : 0, ucuzB = x > 8 + 1e-3 ? 1 : 0;
    const ka = ara(t, 0.3, 1.1);
    const xs = Math.min(x, 12);
    const fiyat = (v) => Math.round(v) + ' TL';
    const gbYaz = sy(Math.min(x, 12), 1) + ' GB';
    if (H) {
      const kx = 670, kw = 520, kh = 200;
      tarifeKart(ctx, kx, 70, kw, kh, { alfa: ka, renk: 'mercan', ad: 'HAT A', tarife: H ? 'Aylık 100 TL + GB başına 20 TL' : '100 TL + 20 TL/GB', fiyat: fiyat(A(xs)), ucuz: ucuzA });
      tarifeKart(ctx, kx, 300, kw, kh, { alfa: ka, renk: 'gok', ad: 'HAT B', tarife: H ? 'Aylık 220 TL + GB başına 5 TL' : '220 TL + 5 TL/GB', fiyat: fiyat(B(xs)), ucuz: ucuzB });
      E.yazi(ctx, gbYaz, kx + kw - 26, 70 + kh - 42, { boyut: 30, agirlik: 640, renk: 'gumus', hiza: 'right', alfa: ka });
      E.yazi(ctx, gbYaz, kx + kw - 26, 300 + kh - 42, { boyut: 30, agirlik: 640, renk: 'gumus', hiza: 'right', alfa: ka });
    } else {
      const ky = 590, kw = 310, kh = 280;
      tarifeKart(ctx, 40, ky, kw, kh, { alfa: ka, renk: 'mercan', ad: 'HAT A', tarife: H ? 'Aylık 100 TL + GB başına 20 TL' : '100 TL + 20 TL/GB', fiyat: fiyat(A(xs)), ucuz: ucuzA });
      tarifeKart(ctx, 370, ky, kw, kh, { alfa: ka, renk: 'gok', ad: 'HAT B', tarife: H ? 'Aylık 220 TL + GB başına 5 TL' : '220 TL + 5 TL/GB', fiyat: fiyat(B(xs)), ucuz: ucuzB });
      E.yazi(ctx, gbYaz, 40 + 26, ky + 170, { boyut: 28, agirlik: 640, renk: 'gumus', hiza: 'left', alfa: ka });
      E.yazi(ctx, gbYaz, 370 + 26, ky + 170, { boyut: 28, agirlik: 640, renk: 'gumus', hiza: 'left', alfa: ka });
    }
  };

  /* ---------- 2. Denklem: buluşma anı ---------- */
  const denklem = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = tarifeDuzlem();
    tarifeEksen(ctx, d);
    E.cizgi(ctx, [d.p(0, A(0)), d.p(12.8, A(12.8))], { renk: 'mercan', kalinlik: 4.5, parilti: 1 });
    E.cizgi(ctx, [d.p(0, B(0)), d.p(12.8, B(12.8))], { renk: 'gok', kalinlik: 4.5, parilti: 1 });
    E.etiket(ctx, 'A: 100 + 20x', d.px(5.6), d.py(A(5.6)) + 36, { boyut: 24, formul: true, renk: 'mercan', hiza: 'left' });
    E.etiket(ctx, 'B: 220 + 5x', d.px(10.6), d.py(B(10.6)) + 34, { boyut: 24, formul: true, renk: 'gok', hiza: 'center' });
    // grafikten okuma: izdüşümler
    const gr = ara(t, 0.6, 2.0);
    const [kx, ky] = d.p(8, 260);
    E.cizgi(ctx, [[kx, ky], [kx, d.py(0)]], { renk: 'limon', kalinlik: 2, kesik: [6, 6], alfa: gr, p: ara(t, 0.8, 1.8) });
    E.cizgi(ctx, [[kx, ky], [d.px(0), ky]], { renk: 'limon', kalinlik: 2, kesik: [6, 6], alfa: gr, p: ara(t, 0.8, 1.8) });
    E.etiket(ctx, '260', d.px(0) + 8, ky - 24, { boyut: 24, renk: 'limon', hiza: 'left', alfa: ara(t, 1.6, 2.2) });
    E.nokta(ctx, kx, ky, 10, { renk: 'limon', parilti: 1.5 });
    E.isik(ctx, kx, ky, 160, 'limon', 0.25 + 0.2 * Math.sin(t * 3));
    E.etiket(ctx, '(8, 260)', kx - 18, ky - 36, { boyut: 26, renk: 'limon', hiza: 'right', alfa: ara(t, 2.0, 2.6) });
    // doğrulama anında iki nokta parlar
    const dg = E.nabiz(t, 9.0, 1.2) + E.nabiz(t, 10.4, 1.2);
    if (dg > 0) E.isik(ctx, kx, ky, 120, 'turkuaz', 0.5 * dg);
    // Panel
    const P = PANEL(), cx = P.x + P.w / 2;
    E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 0, 0.6), vurgu: 'limon' });
    E.yazi(ctx, 'DENKLEM = BULUŞMA', P.x + 28, PY(34, 32), { boyut: 22, agirlik: 700, harfAra: 4, renk: 'limon', hiza: 'left' });
    const lx = P.x + 34, fb = yd(30, 28);
    const baslik = (m, y, al) => E.yazi(ctx, m, lx, y, { boyut: 22, agirlik: 700, harfAra: 2, renk: 'gumus', hiza: 'left', alfa: al });
    if (H) {
      baslik('1 · GRAFİKTEN OKU', PY(84, 0), ara(t, 0.6, 1.2));
      E.formul(ctx, 'x = 8,\\; \\t{ücret } 260\\t{ TL}', lx, PY(124, 0), { boyut: fb, hiza: 'left', alfa: ara(t, 2.0, 2.6) });
      baslik('2 · CEBİRLE ÇÖZ', PY(178, 0), ara(t, 4.2, 4.8));
      E.formul(ctx, '100 + 20x = 220 + 5x', lx, PY(218, 0), { boyut: fb, hiza: 'left', alfa: ara(t, 4.4, 5.0), aciga: ara(t, 4.4, 5.6, 'lin') });
      E.formul(ctx, '15x = 120 \\Rightarrow x = \\c{limon}{8}', lx, PY(268, 0), { boyut: fb, hiza: 'left', alfa: ara(t, 6.0, 6.6), aciga: ara(t, 6.0, 7.2, 'lin') });
      baslik('3 · YERİNE KOY', PY(322, 0), ara(t, 8.3, 8.9));
      E.formul(ctx, '\\c{mercan}{A}: 100 + 20 · 8 = 260 \\; ✓', lx, PY(362, 0), { boyut: fb, hiza: 'left', alfa: ara(t, 8.6, 9.2) });
      E.formul(ctx, '\\c{gok}{B}: 220 + 5 · 8 = 260 \\; ✓', lx, PY(408, 0), { boyut: fb, hiza: 'left', alfa: ara(t, 10.0, 10.6) });
      E.formul(ctx, '\\kutu{limon}{f(x) = g(x) \\iff \\t{kesişim}}', cx, PY(466, 0), { boyut: 28, alfa: ara(t, 12.2, 12.8) });
    } else {
      const f1 = pencere(t, 0.6, 1.2, 4.0, 4.4), f2 = pencere(t, 4.2, 4.8, 8.0, 8.4), f3 = pencere(t, 8.3, 8.9, 12.0, 12.4), f4 = ara(t, 12.2, 12.8);
      baslik('1 · GRAFİKTEN OKU', PY(0, 90), f1);
      E.formul(ctx, 'x = 8,\\; \\t{ücret } 260\\t{ TL}', cx, PY(0, 160), { boyut: 34, alfa: f1 * ara(t, 2.0, 2.6) });
      baslik('2 · CEBİRLE ÇÖZ', PY(0, 90), f2);
      E.formul(ctx, '100 + 20x = 220 + 5x', cx, PY(0, 154), { boyut: fb, alfa: f2, aciga: ara(t, 4.4, 5.6, 'lin') });
      E.formul(ctx, '15x = 120 \\Rightarrow x = \\c{limon}{8}', cx, PY(0, 222), { boyut: fb, alfa: f2 * ara(t, 6.0, 6.6), aciga: ara(t, 6.0, 7.2, 'lin') });
      baslik('3 · YERİNE KOY', PY(0, 90), f3);
      E.formul(ctx, '\\c{mercan}{A}: 100 + 20 · 8 = 260 \\; ✓', cx, PY(0, 154), { boyut: fb, alfa: f3 * ara(t, 8.6, 9.2) });
      E.formul(ctx, '\\c{gok}{B}: 220 + 5 · 8 = 260 \\; ✓', cx, PY(0, 222), { boyut: fb, alfa: f3 * ara(t, 10.0, 10.6) });
      E.yazi(ctx, 'Üç yol, aynı cevap', cx, PY(0, 110), { boyut: 32, agirlik: 700, renk: 'limon', alfa: f4 });
      E.formul(ctx, '\\kutu{limon}{f(x) = g(x) \\iff \\t{kesişim}}', cx, PY(0, 196), { boyut: 30, alfa: f4 });
    }
  };

  /* ---------- 3. Eşitsizlik: altta kalan aralık ---------- */
  const esitsizlik = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = tarifeDuzlem();
    tarifeEksen(ctx, d);
    // tarama
    const xs = 12.8 * ara(t, 0.6, 4.0, 'io2');
    const bA = ara(t, 0.6, 1.0);
    if (xs > 0.01) {
      const x1 = Math.min(xs, 8);
      E.cokgen(ctx, [d.p(0, A(0)), d.p(x1, A(x1)), d.p(x1, B(x1)), d.p(0, B(0))], { renk: 'turkuaz', alfa: 0.2 * bA });
      if (xs > 8) E.cokgen(ctx, [d.p(8, 260), d.p(xs, B(xs)), d.p(xs, A(xs))], { renk: 'mercan', alfa: 0.16 * bA });
      if (xs < 12.79) E.cizgi(ctx, [d.p(xs, A(xs)), d.p(xs, B(xs))], { renk: xs < 8 ? 'turkuaz' : 'mercan', kalinlik: 4, parilti: 1.2 });
    }
    E.cizgi(ctx, [d.p(0, A(0)), d.p(12.8, A(12.8))], { renk: 'mercan', kalinlik: 4.5, parilti: 1 });
    E.cizgi(ctx, [d.p(0, B(0)), d.p(12.8, B(12.8))], { renk: 'gok', kalinlik: 4.5, parilti: 1 });
    E.etiket(ctx, 'A', d.px(12.4) + 4, d.py(A(12.4)) + 28, { boyut: 24, agirlik: 760, renk: 'mercan' });
    E.etiket(ctx, 'B', d.px(12.4) + 4, d.py(B(12.4)) + 28, { boyut: 24, agirlik: 760, renk: 'gok' });
    E.etiket(ctx, 'A < B', d.px(3.2), d.py(200), { boyut: 26, formul: true, renk: 'turkuaz', alfa: ara(t, 2.0, 2.6) });
    E.nokta(ctx, d.px(8), d.py(260), 9, { renk: 'limon', parilti: 1.2 });
    // x ekseninde çözüm aralığı ve izdüşüm perdesi
    const ia = ara(t, 8.0, 8.6);
    if (ia > 0) {
      const g = ctx.createLinearGradient(0, d.py(0), 0, d.py(200));
      g.addColorStop(0, E.rgba('turkuaz', 0.22 * ia)); g.addColorStop(1, E.rgba('turkuaz', 0));
      ctx.save(); ctx.fillStyle = g; ctx.fillRect(d.px(0), d.py(200), d.px(8) - d.px(0), d.py(0) - d.py(200)); ctx.restore();
    }
    aralikIsin(ctx, d, 0, 8, { alfa: ia, acikSag: true, p: ara(t, 8.0, 9.0, 'io2') });
    E.etiket(ctx, '[0, 8)', d.px(4), d.py(0) - 32, { boyut: 28, formul: true, renk: 'turkuaz', alfa: ara(t, 9.0, 9.6) });
    // Panel
    const P = PANEL(), cx = P.x + P.w / 2;
    E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 0, 0.6), vurgu: 'turkuaz' });
    E.yazi(ctx, 'EŞİTSİZLİK = ALTTA KALMAK', P.x + 28, PY(34, 32), { boyut: 22, agirlik: 700, harfAra: 3, renk: 'turkuaz', hiza: 'left' });
    const fb = yd(32, 28);
    if (H) {
      E.formul(ctx, '100 + 20x < 220 + 5x', cx, PY(104, 0), { boyut: fb, alfa: ara(t, 4.2, 4.8), aciga: ara(t, 4.2, 5.4, 'lin') });
      E.formul(ctx, '15x < 120 \\Rightarrow x < 8', cx, PY(162, 0), { boyut: fb, alfa: ara(t, 5.6, 6.2) });
      E.formul(ctx, 'x \\ge 0 \\quad \\t{(GB eksi olamaz)}', cx, PY(222, 0), { boyut: 28, renk: 'gumus', alfa: ara(t, 6.8, 7.4) });
      E.formul(ctx, '\\kutu{turkuaz}{\\t{Ç} = [0, 8)}', cx, PY(296, 0), { boyut: 36, alfa: ara(t, 8.6, 9.2) });
      E.yazi(ctx, '8 dahil değil: orada A = B', cx, PY(364, 0), { boyut: 26, agirlik: 560, renk: 'gumus', alfa: ara(t, 9.6, 10.2) });
      E.yazi(ctx, '8 GB’tan azsa A, fazlaysa B', cx, PY(436, 0), { boyut: 30, agirlik: 700, renk: 'limon', alfa: ara(t, 11.4, 12.0), parilti: 0.3 });
    } else {
      const f1 = 1 - ara(t, 8.2, 8.6);
      E.formul(ctx, '100 + 20x < 220 + 5x', cx, PY(0, 90), { boyut: fb, alfa: f1 * ara(t, 4.2, 4.8), aciga: ara(t, 4.2, 5.4, 'lin') });
      E.formul(ctx, '15x < 120 \\Rightarrow x < 8', cx, PY(0, 150), { boyut: fb, alfa: f1 * ara(t, 5.6, 6.2) });
      E.formul(ctx, 'x \\ge 0 \\quad \\t{(GB eksi olamaz)}', cx, PY(0, 214), { boyut: 26, renk: 'gumus', alfa: f1 * ara(t, 6.8, 7.4) });
      E.formul(ctx, '\\kutu{turkuaz}{\\t{Ç} = [0, 8)}', cx, PY(0, 96), { boyut: 36, alfa: ara(t, 8.6, 9.2) });
      E.yazi(ctx, '8 dahil değil: orada A = B', cx, PY(0, 168), { boyut: 26, agirlik: 560, renk: 'gumus', alfa: ara(t, 9.6, 10.2) });
      E.yazi(ctx, '8 GB’tan azsa A, fazlaysa B', cx, PY(0, 236), { boyut: 30, agirlik: 700, renk: 'limon', alfa: ara(t, 11.4, 12.0), parilti: 0.3 });
    }
  };

  /* ---------- 4. Sıfıra karşı: f(x) < 0 ---------- */
  const sifir = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = duz(KUTU());
    d.ciz(ctx, { adim: 1, etiketAdim: 2, p: ara(t, 0, 0.8) });
    const m = ara(t, 0.8, 3.6, 'io3');
    const ga = lerp(0.5, 0, m), gb = lerp(1, 0, m);
    const f = (x) => 2 * x - 6, g = (x) => ga * x + gb;
    const xk = (gb + 6) / (2 - ga);
    // f < g bölgesi (x < xk): iki doğru arası
    const ba = ara(t, 0.4, 1.0);
    bolge(ctx, d, [[d.xmin, f(d.xmin)], [xk, f(xk)], [d.xmin, g(d.xmin)]], 'turkuaz', 0.16 * ba);
    dogru(ctx, d, g, { renk: m > 0.98 ? 'limon' : 'gok', kalinlik: 4 - 1.5 * m, parilti: 1 - 0.3 * m });
    dogru(ctx, d, f, { renk: 'turkuaz', kalinlik: 4.5, parilti: 1, p: ara(t, 0.2, 1.0) });
    E.nokta(ctx, d.px(xk), d.py(f(xk)), 9, { renk: 'limon', parilti: 1.4, alfa: ba });
    E.etiket(ctx, 'f(x) = 2x − 6', d.px(4.6), d.py(-3.3), { boyut: 26, formul: true, renk: 'turkuaz', alfa: ba });
    E.etiket(ctx, m < 0.5 ? 'g(x) = 0,5x + 1' : 'g(x) = 0', d.px(-3.4), d.py(m < 0.5 ? 2.6 : 1.0), { boyut: 26, formul: true, renk: m < 0.5 ? 'gok' : 'limon', alfa: ba * (Math.abs(m - 0.5) * 2) });
    aralikIsin(ctx, d, d.xmin, 3, { alfa: ara(t, 6.0, 6.6), acikSag: true, solUc: false, p: 1 });
    if (t > 6.0) E.ok(ctx, d.px(d.xmin + 0.6), d.py(0), d.px(d.xmin) - 4, d.py(0), { renk: 'turkuaz', kalinlik: 6, okBoy: 18, alfa: ara(t, 6.0, 6.6) });
    // Panel
    const P = PANEL(), cx = P.x + P.w / 2;
    E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 0, 0.6), vurgu: 'gok' });
    E.yazi(ctx, 'ÖBÜR DOĞRU EKSENSE', P.x + 28, PY(34, 32), { boyut: 22, agirlik: 700, harfAra: 3, renk: 'gok', hiza: 'left' });
    E.formul(ctx, 'f(x) < g(x)', cx, PY(104, 86), { boyut: yd(40, 36), alfa: (1 - m) * ara(t, 0.4, 1.0), cakisabilir: true });
    E.formul(ctx, 'f(x) < \\c{limon}{0}', cx, PY(104, 86), { boyut: yd(40, 36), alfa: m, cakisabilir: true });
    E.formul(ctx, '2x − 6 < 0 \\Rightarrow x < 3', cx, PY(180, 146), { boyut: yd(34, 30), alfa: ara(t, 4.2, 4.8), aciga: ara(t, 4.2, 5.4, 'lin') });
    E.formul(ctx, '\\kutu{turkuaz}{\\t{Ç} = (−\\infty, 3)}', cx, PY(258, 0), { boyut: 34, alfa: H ? ara(t, 6.2, 6.8) : 0 });
    // işaret tablosu
    const ta = ara(t, 7.8, 8.4);
    if (ta > 0) {
      const tx = P.x + yd(40, 40), tw = P.w - yd(80, 80), ty = PY(350, 210), rh = yd(52, 44);
      ctx.save(); ctx.globalAlpha *= ta;
      const c0 = tx + yd(110, 100);
      E.cizgi(ctx, [[tx, ty + rh / 2], [tx + tw, ty + rh / 2]], { renk: 'cizgi', kalinlik: 1.5 });
      E.cizgi(ctx, [[c0, ty - rh / 2 + 4], [c0, ty + rh * 1.5 - 4]], { renk: 'cizgi', kalinlik: 1.5 });
      const xs = [c0 + 50, c0 + (tw - (c0 - tx)) / 2, tx + tw - 40];
      E.formul(ctx, 'x', tx + 30, ty, { boyut: 28, hiza: 'left' });
      E.formul(ctx, 'f(x)', tx + 14, ty + rh, { boyut: 28, hiza: 'left' });
      E.formul(ctx, '−\\infty', xs[0], ty, { boyut: 26, renk: 'gumus' });
      E.formul(ctx, '3', xs[1], ty, { boyut: 28, renk: 'limon' });
      E.formul(ctx, '+\\infty', xs[2], ty, { boyut: 26, renk: 'gumus' });
      E.yazi(ctx, '−', (xs[0] + xs[1]) / 2, ty + rh, { boyut: 36, agirlik: 700, renk: 'turkuaz' });
      E.yazi(ctx, '0', xs[1], ty + rh, { boyut: 28, agirlik: 600, renk: 'limon' });
      E.yazi(ctx, '+', (xs[1] + xs[2]) / 2, ty + rh, { boyut: 36, agirlik: 700, renk: 'mercan' });
      ctx.restore();
    }
  };

  /* ---------- 5. Bant: |x − 20| ≤ 2 ---------- */
  const bant = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const g = TKUTU();
    const d = E.duzlem({ x: g.x, y: g.y, w: g.w, h: g.h, xmin: 13.4, xmax: 26.6, ymin: 0, ymax: 6.4 });
    eksenler(ctx, d, { xAdim: 2, yAdim: 1, xAd: '°C', yAd: '|x − 20|', p: ara(t, 0, 0.8) });
    const f = (x) => Math.abs(x - 20);
    // V
    const vp = ara(t, 2.6, 4.2, 'io2');
    if (vp > 0) {
      const xl = lerp(20, d.xmin, vp), xr = lerp(20, d.xmax, vp);
      E.cizgi(ctx, [d.p(xl, f(xl)), d.p(20, 0)], { renk: 'mercan', kalinlik: 4.5, parilti: 1 });
      E.cizgi(ctx, [d.p(20, 0), d.p(xr, f(xr))], { renk: 'turkuaz', kalinlik: 4.5, parilti: 1 });
    }
    // bant y ≤ 2
    const ba = ara(t, 4.4, 5.0);
    if (ba > 0) {
      E.cokgen(ctx, [d.p(d.xmin, 0), d.p(d.xmax, 0), d.p(d.xmax, 2), d.p(d.xmin, 2)], { renk: 'limon', alfa: 0.07 * ba });
      E.cizgi(ctx, [d.p(d.xmin, 2), d.p(d.xmax, 2)], { renk: 'limon', kalinlik: 2.5, kesik: [10, 8], alfa: ba, p: ara(t, 4.4, 5.4) });
      E.etiket(ctx, 'y = 2', d.px(25.2), d.py(2) - 26, { boyut: 24, formul: true, renk: 'limon', alfa: ba });
    }
    // V'nin bant içindeki kısmı
    const ic = ara(t, 6.0, 6.6);
    if (ic > 0) E.cizgi(ctx, [d.p(18, 2), d.p(20, 0), d.p(22, 2)], { renk: 'limon', kalinlik: 7, parilti: 1.4, alfa: ic });
    // kesişimler
    const ks = ara(t, 8.0, 8.4);
    for (const x of [18, 22]) {
      E.nokta(ctx, d.px(x), d.py(2), 10, { renk: 'limon', parilti: 1.5, alfa: ks });
      E.cizgi(ctx, [d.p(x, 2), d.p(x, 0)], { renk: 'limon', kalinlik: 2, kesik: [6, 6], alfa: ks });
    }
    E.isik(ctx, d.px(18), d.py(2), 140, 'limon', 0.45 * E.nabiz(t, 8.0, 1.0));
    E.isik(ctx, d.px(22), d.py(2), 140, 'limon', 0.45 * E.nabiz(t, 8.2, 1.0));
    aralikIsin(ctx, d, 18, 22, { renk: 'limon', alfa: ara(t, 11.6, 12.2), p: ara(t, 11.6, 12.4, 'io2') });
    // termometre imleci
    const T = kf(t, [[0.6, 15.2], [2.4, 24.8, 'io2'], [2.8, 20]]);
    const ta = pencere(t, 0.4, 0.8, 2.6, 3.0);
    if (ta > 0) {
      const ok = Math.abs(T - 20) <= 2;
      E.cizgi(ctx, [d.p(T, 0), d.p(T, f(T))], { renk: ok ? 'limon' : 'mercan', kalinlik: 5, parilti: 1, alfa: ta, uc: 'butt' });
      E.nokta(ctx, d.px(T), d.py(0), 9, { renk: ok ? 'limon' : 'mercan', parilti: 1.2, alfa: ta });
      E.etiket(ctx, sy(T, 1) + ' °C', d.px(T), d.py(f(T)) - 30, { boyut: 24, renk: ok ? 'limon' : 'mercan', alfa: ta });
    }
    // Panel
    const P = PANEL(), cx = P.x + P.w / 2;
    E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 0, 0.6), vurgu: 'limon' });
    E.yazi(ctx, 'TERMOSTAT: 20 °C ± 2', P.x + 28, PY(34, 32), { boyut: 22, agirlik: 700, harfAra: 3, renk: 'limon', hiza: 'left' });
    const fb = yd(34, 30);
    if (H) {
      E.formul(ctx, '|x − 20| \\le 2', cx, PY(110, 0), { boyut: 42, alfa: ara(t, 3.0, 3.6), parilti: 0.2 });
      E.formul(ctx, '−2 \\le x − 20 \\le 2', cx, PY(188, 0), { boyut: fb, alfa: ara(t, 6.4, 7.0) });
      E.formul(ctx, '\\c{limon}{18 \\le x \\le 22}', cx, PY(252, 0), { boyut: fb, alfa: ara(t, 7.0, 7.6) });
      E.formul(ctx, '|x − 20| = 2 \\Rightarrow x = 18 \\t{ veya } x = 22', cx, PY(330, 0), { boyut: 28, renk: 'gumus', alfa: ara(t, 8.4, 9.0) });
      E.yazi(ctx, 'V, y = 2 doğrusunu iki yerde keser', cx, PY(380, 0), { boyut: 24, agirlik: 520, renk: 'gumus', alfa: ara(t, 9.0, 9.6) });
      E.formul(ctx, '\\kutu{limon}{\\t{Ç} = [18, 22]}', cx, PY(452, 0), { boyut: 36, alfa: ara(t, 11.8, 12.4) });
    } else {
      const f1 = 1 - ara(t, 8.0, 8.4);
      E.formul(ctx, '|x − 20| \\le 2', cx, PY(0, 92), { boyut: 40, alfa: f1 * ara(t, 3.0, 3.6), parilti: 0.2 });
      E.formul(ctx, '−2 \\le x − 20 \\le 2', cx, PY(0, 160), { boyut: fb, alfa: f1 * ara(t, 6.4, 7.0) });
      E.formul(ctx, '\\c{limon}{18 \\le x \\le 22}', cx, PY(0, 222), { boyut: fb, alfa: f1 * ara(t, 7.0, 7.6) });
      E.formul(ctx, '|x − 20| = 2', cx, PY(0, 92), { boyut: fb, alfa: ara(t, 8.4, 9.0) });
      E.formul(ctx, 'x = 18 \\t{ veya } x = 22', cx, PY(0, 150), { boyut: fb, renk: 'gumus', alfa: ara(t, 8.8, 9.4) });
      E.formul(ctx, '\\kutu{limon}{\\t{Ç} = [18, 22]}', cx, PY(0, 228), { boyut: 36, alfa: ara(t, 11.8, 12.4) });
    }
  };

  /* ---------- 6. Sürpriz: piyasa dengesi ---------- */
  const piyasa = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const g = TKUTU();
    const d = E.duzlem({ x: g.x, y: g.y, w: g.w, h: g.h, xmin: 0, xmax: 57, ymin: 0, ymax: 116 });
    eksenler(ctx, d, { xAdim: 10, yAdim: 20, xAd: 'q', yAd: 'fiyat p', p: ara(t, 0, 0.8) });
    E.yazi(ctx, '0', d.px(0) - 12, d.py(0) + 21, { boyut: 22, renk: 'gumus', hiza: 'right', alfa: ara(t, 0, 0.8) });
    const T = (q) => 100 - 2 * q, S = (q) => 20 + 2 * q;
    const lp = ara(t, 0.6, 2.2, 'io2');
    E.cizgi(ctx, [d.p(0, T(0)), d.p(50 * lp, T(50 * lp))], { renk: 'mercan', kalinlik: 4.5, parilti: 1, alfa: lp > 0 ? 1 : 0 });
    E.cizgi(ctx, [d.p(0, S(0)), d.p(48 * lp, S(48 * lp))], { renk: 'turkuaz', kalinlik: 4.5, parilti: 1, alfa: lp > 0 ? 1 : 0 });
    E.etiket(ctx, 'talep', d.px(44), d.py(T(44)) - 30, { boyut: 24, renk: 'mercan', alfa: ara(t, 2.0, 2.6) });
    E.etiket(ctx, 'arz', d.px(42), d.py(S(42)) + 30, { boyut: 24, renk: 'turkuaz', alfa: ara(t, 2.0, 2.6) });
    // fiyat çizgisi ve salınım
    const p = kf(t, [[4.0, 80], [7.6, 80], [9.0, 45], [10.2, 68], [11.2, 56], [12.0, 62], [12.7, 59], [13.3, 60]]);
    const fa = ara(t, 4.0, 4.6);
    const denge = ara(t, 13.3, 13.8);
    if (fa > 0) {
      const qT = (100 - p) / 2, qS = (p - 20) / 2;
      const fazla = qS - qT;
      E.cizgi(ctx, [d.p(0, p), d.p(56, p)], { renk: 'gumus', kalinlik: 2, kesik: [10, 8], alfa: fa * (1 - denge) });
      if (Math.abs(fazla) > 0.3) {
        const rk = fazla > 0 ? 'turkuaz' : 'mercan';
        E.cizgi(ctx, [d.p(Math.min(qT, qS), p), d.p(Math.max(qT, qS), p)], { renk: rk, kalinlik: 9, parilti: 1.2, alfa: fa, uc: 'butt' });
        E.nokta(ctx, d.px(qT), d.py(p), 7, { renk: 'mercan', parilti: 1, alfa: fa });
        E.nokta(ctx, d.px(qS), d.py(p), 7, { renk: 'turkuaz', parilti: 1, alfa: fa });
        E.etiket(ctx, (fazla > 0 ? 'arz fazlası ' : 'talep fazlası ') + sy(Math.abs(fazla), 0), d.px((qT + qS) / 2), d.py(p) + (fazla > 0 ? -32 : 32), { boyut: 24, renk: rk, alfa: fa * clamp(Math.abs(fazla) / 3) });
      }
      E.etiket(ctx, 'p = ' + sy(p, 0), d.px(0) + 12, d.py(p) + (p > 60 ? -26 : 26), { boyut: 24, renk: 'tebesir', hiza: 'left', alfa: fa * (1 - denge) });
    }
    // denge
    const [kx, ky] = d.p(20, 60);
    E.nokta(ctx, kx, ky, 10, { renk: 'limon', parilti: 1.6, alfa: denge });
    E.isik(ctx, kx, ky, 380, 'limon', 0.55 * E.nabiz(t, 13.2, 1.4));
    if (t > 13.2) E.isikSupur(ctx, ara(t, 13.3, 14.6, 'lin'), { renk: 'limon', guc: 0.25 });
    E.cizgi(ctx, [[kx, ky], [kx, d.py(0)]], { renk: 'limon', kalinlik: 2, kesik: [6, 6], alfa: denge });
    E.cizgi(ctx, [[kx, ky], [d.px(0), ky]], { renk: 'limon', kalinlik: 2, kesik: [6, 6], alfa: denge });
    E.etiket(ctx, 'DENGE (20, 60)', kx + 22, ky - 6, { boyut: 26, agirlik: 700, renk: 'limon', hiza: 'left', alfa: ara(t, 13.6, 14.2), harfAra: 1 });
    // Panel
    const P = PANEL(), cx = P.x + P.w / 2;
    E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 0, 0.6), vurgu: 'menekse' });
    E.yazi(ctx, 'SÜRPRİZ: PİYASA', P.x + 28, PY(34, 32), { boyut: 22, agirlik: 700, harfAra: 4, renk: 'menekse', hiza: 'left' });
    const fb = yd(30, 27);
    E.formul(ctx, '\\c{mercan}{\\t{talep: }p = 100 − 2q} \\quad \\c{gumus}{\\t{(q: miktar)}}', P.x + 40, PY(96, 80), { boyut: fb, hiza: 'left', alfa: ara(t, 0.8, 1.4) });
    E.formul(ctx, '\\c{turkuaz}{\\t{arz: }p = 20 + 2q}', P.x + 40, PY(146, 124), { boyut: fb, hiza: 'left', alfa: ara(t, 1.2, 1.8) });
    const qT = (100 - p) / 2, qS = (p - 20) / 2;
    const canli = `p = ${sy(p, 0)}:\\; \\c{turkuaz}{\\t{arz } ${sy(qS, 0)}},\\; \\c{mercan}{\\t{talep } ${sy(qT, 0)}}`;
    E.formul(ctx, canli, P.x + 40, PY(214, 172), { boyut: fb, hiza: 'left', alfa: ara(t, 4.4, 5.0) * (1 - denge) });
    if (H) E.formul(ctx, '\\t{fark} = |\\t{arz} − \\t{talep}| = |p − 60|', P.x + 40, PY(262, 0), { boyut: 26, hiza: 'left', renk: 'gumus', alfa: ara(t, 6.0, 6.6) * (1 - denge) });
    E.formul(ctx, '100 − 2q = 20 + 2q', cx, PY(330, 172), { boyut: fb, alfa: ara(t, 13.6, 14.2) });
    E.formul(ctx, '\\Rightarrow q = 20,\\; p = \\c{limon}{60}', cx, PY(386, 224), { boyut: fb, alfa: ara(t, 14.2, 14.8) });
    E.yazi(ctx, 'Denge fiyatı = kesişim anı', cx, PY(456, 270), { boyut: yd(30, 26), agirlik: 700, renk: 'limon', alfa: ara(t, 15.0, 15.6), parilti: 0.3 });
  };

  /* ---------- Özet ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Denklem: kesişimin x’i.', formul: 'f(x) = g(x)' },
    { tr: 'Eşitsizlik: altta kalan x’ler.', formul: 'f(x) < g(x)' },
    { tr: 'Mutlak değer bir bant çizer.', formul: '|x − m| \\le r' },
    { tr: 'Çözümü başka yolla doğrula.', formul: '100 + 20 · 8 = 220 + 5 · 8' },
  ], { aralik: 1.6 });

  /* ---------- Film ---------- */
  E.film({
    meta,
    sure: 107,
    sahneler: [
      { ad: 'Soğuk açılış: iki tarife', bas: 0, son: 10.6, giris: 0, cikis: 0.7, ciz: acilis },
      { ad: 'İmza', bas: 10.3, son: 14.0, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 13.7, son: 17.9, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Denklem: buluşma anı', bas: 17.6, son: 33.4, ciz: denklem },
      { ad: 'Eşitsizlik: altta kalan aralık', bas: 33.1, son: 47.4, ciz: esitsizlik },
      { ad: 'Öbür doğru eksen olunca', bas: 47.1, son: 58.6, ciz: sifir },
      { ad: 'Mutlak değer: termostat bandı', bas: 58.3, son: 72.6, ciz: bant },
      { ad: 'Sürpriz: piyasa dengesi', bas: 72.3, son: 90.6, ciz: piyasa },
      { ad: 'Aklında kalsın', bas: 90.3, son: 100.6, ciz: ozet },
      { ad: 'Laboratuvar', bas: 100.4, son: 107, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 6, renk2: 'gok' }),
  });
})();
