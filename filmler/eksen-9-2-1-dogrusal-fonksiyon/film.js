/* ==========================================================================
   EKSEN 9.2.1 — Tek Doğru
   Tek fikir: Bütün doğrusal fonksiyonlar tek bir doğrunun, f(x) = x'in
   kılık değiştirmiş hâlidir: g(x) = a · f(x − r) + k.
   Sürpriz: doğruyu r kadar sağa kaydırmak, a·r kadar aşağı indirmekle aynıdır.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp, yd } = E;

  const meta = {
    kod: 'MAT.9.2.1',
    tema: 'Nicelikler ve Değişimler',
    ad: 'Tek Doğru',
    adEn: 'One Line',
    labAd: 'Fonksiyon Laboratuvarı',
    labAciklama: 'a, r ve k kaydırıcılarıyla f(x) = x’i dönüştür; kimlik kartını anında gör.',
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

  /* ---------- 1. Soğuk açılış: taksimetre ---------- */
  const acilis = (ctx, s) => {
    const t = s.t, H = E.yatay;
    // Gece şehir ışıkları (bokeh), sola akar
    const r = E.rng(31);
    const renkler = ['turkuaz', 'mercan', 'gok', 'menekse', 'limon'];
    for (let i = 0; i < 28; i++) {
      const der = 0.3 + r() * 0.7, x0 = r() * E.W * 1.5, y0 = r() * E.H, rr = 30 + r() * 100 * der, rk = renkler[Math.floor(r() * 5)], f = r() * 6;
      let x = (x0 - t * 70 * der) % (E.W * 1.5); if (x < 0) x += E.W * 1.5;
      E.isik(ctx, x - E.W * 0.2, y0, rr, rk, 0.11 * der * ara(t, 0, 1.4) * (0.75 + 0.25 * Math.sin(t * 1.7 + f)));
    }
    const km = kf(t, [[1.4, 0], [7.2, 6, 'io2']]);
    const ucret = 40 + 25 * km;
    // Taksimetre paneli
    const mp = H ? { x: 84, y: 120, w: 430, h: 340 } : { x: 60, y: 104, w: 600, h: 250 };
    const pa = ara(t, 0.3, 1.1);
    E.panel(ctx, mp.x, mp.y, mp.w, mp.h, { alfa: pa, vurgu: 'limon' });
    E.yazi(ctx, 'TAKSİMETRE', mp.x + 30, mp.y + 36, { boyut: 22, agirlik: 700, harfAra: 5, renk: 'limon', hiza: 'left', alfa: pa });
    E.isik(ctx, mp.x + mp.w / 2, mp.y + yd(118, 100), 160, 'limon', 0.12 * pa);
    E.yazi(ctx, tl(ucret) + ' TL', H ? mp.x + 30 : mp.x + mp.w / 2, mp.y + yd(118, 100), { boyut: yd(62, 60), agirlik: 700, font: 'mono', renk: 'limon', hiza: H ? 'left' : 'center', alfa: pa, parilti: 0.5 });
    if (H) {
      E.cizgi(ctx, [[mp.x + 30, mp.y + 178], [mp.x + mp.w - 30, mp.y + 178]], { renk: 'sis', kalinlik: 1.5, alfa: pa });
      E.yazi(ctx, 'Açılış', mp.x + 30, mp.y + 216, { boyut: 26, renk: 'gumus', hiza: 'left', alfa: pa });
      E.yazi(ctx, '40 TL', mp.x + mp.w - 30, mp.y + 216, { boyut: 28, agirlik: 640, hiza: 'right', alfa: pa });
      E.yazi(ctx, 'Kilometre başına', mp.x + 30, mp.y + 260, { boyut: 26, renk: 'gumus', hiza: 'left', alfa: pa });
      E.yazi(ctx, '25 TL', mp.x + mp.w - 30, mp.y + 260, { boyut: 28, agirlik: 640, hiza: 'right', alfa: pa });
      E.yazi(ctx, 'Yol', mp.x + 30, mp.y + 304, { boyut: 26, renk: 'gumus', hiza: 'left', alfa: pa });
      E.yazi(ctx, sy(km, 1) + ' km', mp.x + mp.w - 30, mp.y + 304, { boyut: 28, agirlik: 700, renk: 'turkuaz', hiza: 'right', alfa: pa });
    } else {
      E.cizgi(ctx, [[mp.x + 30, mp.y + 150], [mp.x + mp.w - 30, mp.y + 150]], { renk: 'sis', kalinlik: 1.5, alfa: pa });
      E.yazi(ctx, 'Açılış 40 TL  ·  km başına 25 TL', mp.x + mp.w / 2, mp.y + 184, { boyut: 24, renk: 'gumus', alfa: pa });
      E.yazi(ctx, 'Yol: ' + sy(km, 1) + ' km', mp.x + mp.w / 2, mp.y + 222, { boyut: 28, agirlik: 700, renk: 'turkuaz', alfa: pa });
    }
    // Grafik
    const g = H ? { x: 610, y: 74, w: 580, h: 440 } : { x: 120, y: 420, w: 530, h: 420 };
    const d = E.duzlem({ x: g.x, y: g.y, w: g.w, h: g.h, xmin: 0, xmax: 6.6, ymin: 0, ymax: 215 });
    const ga = ara(t, 0.6, 1.6);
    eksenler(ctx, d, { alfa: ga, p: ara(t, 0.6, 1.8), xAdim: 1, yAdim: 50, xAd: 'km', yAd: 'TL', sifir: false });
    E.yazi(ctx, '0', d.px(0) - 12, d.py(0) + 21, { boyut: 22, renk: 'gumus', hiza: 'right', alfa: ga });
    // tam doğru (7.3 sonrası)
    const tam = ara(t, 7.3, 8.3, 'io3');
    const glitch = E.nabiz(t, 8.4, 1.1);
    if (tam > 0) {
      const xe = lerp(km, 6.6, tam);
      for (const [rk, ox] of [['mercan', 1], ['gok', -1]]) {
        if (glitch <= 0.01) break;
        const dx = ox * glitch * 9 * (0.6 + 0.4 * E.gurultu(t * 30, ox + 3));
        E.cizgi(ctx, [[d.px(0) + dx, d.py(40)], [d.px(xe) + dx, d.py(40 + 25 * xe)]], { renk: rk, kalinlik: 3, alfa: 0.6 * glitch });
      }
      E.cizgi(ctx, [d.p(0, 40), d.p(xe, 40 + 25 * xe)], { renk: 'turkuaz', kalinlik: 4, parilti: 1 });
    }
    if (km > 0.001) E.cizgi(ctx, [d.p(0, 40), d.p(km, 40 + 25 * km)], { renk: 'turkuaz', kalinlik: 4, parilti: 1, alfa: ara(t, 1.3, 1.6) });
    for (let n = 0; n <= 6; n++) {
      const q = clamp((km - n) / 0.25 + (n === 0 ? ara(t, 1.1, 1.4) * 4 : 0));
      if (q <= 0) continue;
      const rr = 7 * E.e.geri(Math.min(1, q));
      E.nokta(ctx, d.px(n), d.py(40 + 25 * n), rr, { renk: 'tebesir', parilti: 0.8 });
      E.isik(ctx, d.px(n), d.py(40 + 25 * n), 60, 'limon', 0.5 * (1 - clamp((km - n) / 0.6)) * (km < 5.99 || n < 6 ? 1 : 0));
    }
    if (km > 0.01 && tam < 1) E.nokta(ctx, d.px(km), d.py(40 + 25 * km), 8, { renk: 'limon', parilti: 1.4 });
    const fa = ara(t, 7.7, 8.4);
    E.etiket(ctx, 'y = 25x + 40', d.px(0.45), d.py(178), { boyut: 30, formul: true, hiza: 'left', alfa: fa, renk: 'turkuaz' });
  };

  /* ---------- 2. Referans doğru: f(x) = x ve kimliği ---------- */
  const RT = [4.3, 5.5, 7.8, 9.0, 10.4, 12.0, 13.4]; // kimlik satırlarının belirdiği anlar (sahne içi)
  const referans = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = duz(KUTU());
    const o0 = d.p(0, 0);
    // Kamera: başlangıçta orijine yakın, sonra geri çekilir
    const z = kf(t, [[0, 1.35], [3.0, 1, 'io3']]);
    const pk = ara(t, 0, 3.0, 'io3');
    ctx.save();
    E.kamera(ctx, { x: lerp(o0[0], E.W / 2, pk), y: lerp(o0[1], E.H / 2, pk), z });
    d.ciz(ctx, { adim: 1, etiketAdim: 2, p: ara(t, 0, 1.4), boyut: 22, etiket: false });
    etiketler(ctx, d, { adim: 2, alfa: ara(t, 2.6, 3.3) });
    const lp = ara(t, 0.8, 2.6, 'io2');
    // işaret bölgeleri (sahne 9.0+)
    const isA = ara(t, RT[3], RT[3] + 0.8);
    bolge(ctx, d, [[0, 0], [d.xmax, 0], [d.xmax, d.xmax]], 'turkuaz', 0.16 * isA);
    bolge(ctx, d, [[0, 0], [d.xmin, 0], [d.xmin, d.xmin]], 'mercan', 0.16 * isA);
    // tanım kümesi: x ekseni ışını; görüntü kümesi: y ekseni ışını
    const tk = pencere(t, RT[0], RT[0] + 0.6, RT[1] + 0.2, RT[1] + 0.8);
    const gk = pencere(t, RT[1], RT[1] + 0.6, RT[2] - 0.4, RT[2] + 0.2);
    if (tk > 0) E.cizgi(ctx, [[d.x, o0[1]], [d.x + d.w * ara(t, RT[0], RT[0] + 0.9), o0[1]]], { renk: 'turkuaz', kalinlik: 5, parilti: 1.3, alfa: tk });
    if (gk > 0) E.cizgi(ctx, [[o0[0], d.y + d.h], [o0[0], d.y + d.h - d.h * ara(t, RT[1], RT[1] + 0.9)]], { renk: 'turkuaz', kalinlik: 5, parilti: 1.3, alfa: gk });
    // doğru
    // doğru orijinden iki yöne doğar
    const m = Math.max(d.xmax, d.ymax) * lp;
    dogru(ctx, d, (x) => x, { renk: 'turkuaz', kalinlik: 4.5, parilti: 1, x0: -m, x1: m });
    const mm = Math.min(m, d.xmax, d.ymax);
    if (lp > 0 && lp < 1) for (const sg of [-1, 1]) E.isik(ctx, d.px(sg * mm), d.py(sg * mm), 80, 'turkuaz', 0.8 * (m > mm + 0.3 ? 0 : 1));
    if (lp > 0) E.isik(ctx, o0[0], o0[1], 160, 'turkuaz', 0.35 * E.nabiz(t, 0.7, 1.4));
    if (isA > 0) dogru(ctx, d, (x) => x, { renk: 'mercan', kalinlik: 4.5, parilti: 1, x1: 0, alfa: isA });
    E.yazi(ctx, '+', d.px(4.4), d.py(1.8), { boyut: 44, agirlik: 700, renk: 'turkuaz', alfa: isA });
    E.yazi(ctx, '−', d.px(-4.4), d.py(-1.8), { boyut: 44, agirlik: 700, renk: 'mercan', alfa: isA });
    // sıfır: orijinde nabız
    const sf = ara(t, RT[2], RT[2] + 0.4);
    if (sf > 0) {
      const halka = ara(t, RT[2], RT[2] + 1.2, 'cik3');
      ctx.save(); ctx.globalAlpha *= (1 - halka) * 0.9; ctx.strokeStyle = E.R('limon'); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(o0[0], o0[1], 10 + 60 * halka, 0, E.TAU); ctx.stroke(); ctx.restore();
      E.nokta(ctx, o0[0], o0[1], 8, { renk: 'limon', parilti: 1.2, alfa: sf * (1 - 0.5 * ara(t, RT[4], RT[4] + 0.5)) });
    }
    // artan: doğru boyunca kayan ışık
    const ar = ara(t, RT[4], RT[5] - 0.2, 'io2');
    if (ar > 0 && ar < 1) {
      const x = lerp(-5, 5, ar);
      E.nokta(ctx, d.px(x), d.py(x), 9, { renk: 'limon', parilti: 1.5 });
      E.ok(ctx, d.px(x) + 18, d.py(x) - 2, d.px(x) + 46, d.py(x) - 30, { renk: 'limon', kalinlik: 3, okBoy: 12 });
    }
    // uçlarda sonsuz okları
    const uc = pencere(t, RT[5], RT[5] + 0.5, RT[6] - 0.2, RT[6] + 0.4);
    if (uc > 0) {
      const m = Math.min(d.xmax, d.ymax) - 0.25;
      E.ok(ctx, d.px(m - 1.2), d.py(m - 1.2), d.px(m), d.py(m), { renk: 'limon', kalinlik: 4, parilti: 1, alfa: uc, okBoy: 18 });
      E.ok(ctx, d.px(-m + 1.2), d.py(-m + 1.2), d.px(-m), d.py(-m), { renk: 'limon', kalinlik: 4, parilti: 1, alfa: uc, okBoy: 18 });
    }
    // bire bir: yatay doğru testi
    const bb = ara(t, RT[6], RT[6] + 0.4) * (1 - ara(t, 15.6, 16.2));
    if (bb > 0) {
      const c = kf(t, [[RT[6], -4], [RT[6] + 2.2, 4, 'io2']]);
      E.cizgi(ctx, [d.p(d.xmin, c), d.p(d.xmax, c)], { renk: 'gumus', kalinlik: 2, kesik: [10, 8], alfa: bb });
      E.nokta(ctx, d.px(c), d.py(c), 9, { renk: 'limon', parilti: 1.3, alfa: bb });
    }
    E.etiket(ctx, 'f(x) = x', d.px(-3.2), d.py(3.4), { boyut: 32, formul: true, renk: 'turkuaz', alfa: ara(t, 2.2, 2.9) });
    ctx.restore();
    // Kimlik kartı
    const P = PANEL();
    const satir = (i, ad, deger) => ({ ad, deger, alfa: ara(t, RT[i], RT[i] + 0.5, 'cik3'), vurgu: pencere(t, RT[i], RT[i] + 0.3, (RT[i + 1] ?? 15.4) - 0.1, (RT[i + 1] ?? 15.4) + 0.3) });
    kart(ctx, {
      ...P, alfa: ara(t, 2.4, 3.1), kicker: 'KİMLİK KARTI', baslik: 'f(x) = x',
      satirlar: [
        satir(0, 'Tanım kümesi', '\\R'),
        satir(1, 'Görüntü kümesi', '\\R'),
        satir(2, 'Sıfırı', 'x = 0'),
        satir(3, 'İşareti', H ? 'x < 0: \\c{mercan}{−} \\quad x > 0: \\c{turkuaz}{+}' : '\\c{mercan}{−} \\; | \\; 0 \\; | \\; \\c{turkuaz}{+}'),
        satir(4, 'Artanlık', '\\t{artan}'),
        satir(5, H ? 'En büyük / en küçük' : 'Maks. / min.', '\\t{yok}'),
        satir(6, 'Bire bir', '\\t{evet}'),
      ],
    });
  };

  /* ---------- 3. Kaydır: k ve r ---------- */
  const kaydir = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = duz(KUTU());
    const k = kf(t, [[0.6, 0], [2.0, 3], [4.2, 3], [5.4, -2], [6.0, -2], [6.8, 0]]);
    const r = kf(t, [[7.0, 0], [8.4, 3], [10.6, 3], [11.8, -2]]);
    d.ciz(ctx, { adim: 1, etiketAdim: 2 });
    dogru(ctx, d, (x) => x, { renk: 'gumus', kalinlik: 2, parilti: 0, kesik: [8, 8], alfa: 0.75 });
    const g = (x) => x - r + k;
    // k okları (dikey)
    const kA = ara(t, 0.6, 1.0) * (1 - ara(t, 6.4, 6.9));
    if (Math.abs(k) > 0.15) for (const x of [-3, -0.5, 1.5]) E.ok(ctx, d.px(x), d.py(x), d.px(x), d.py(x + k), { renk: 'turkuaz', kalinlik: 2.5, alfa: kA, okBoy: 12 });
    // r okları (yatay)
    const rA = ara(t, 7.0, 7.4) * (1 - ara(t, 13.0, 13.6));
    if (Math.abs(r) > 0.15) for (const y of [-3, -0.5, 1.5]) E.ok(ctx, d.px(y), d.py(y), d.px(y + r), d.py(y), { renk: 'menekse', kalinlik: 2.5, alfa: rA, okBoy: 12 });
    dogru(ctx, d, g, { renk: t < 6.9 ? 'turkuaz' : 'menekse', kalinlik: 4.5, parilti: 1.1 });
    // r'de işaretçi nokta: orijin → (r, 0)
    if (rA > 0) E.nokta(ctx, d.px(r), d.py(0), 9, { renk: 'limon', parilti: 1.3, alfa: rA });
    // Panel
    const P = PANEL(), cx = P.x + P.w / 2;
    E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 0, 0.6), vurgu: 'turkuaz' });
    const y = (h, v) => P.y + yd(h, v);
    E.yazi(ctx, 'KAYDIR', P.x + 28, y(34, 34), { boyut: 22, agirlik: 700, harfAra: 4, renk: 'turkuaz', hiza: 'left' });
    E.formul(ctx, 'g(x) = f(x − \\c{menekse}{r}) + \\c{turkuaz}{k}', cx, y(112, 88), { boyut: yd(42, 38) });
    const kFaz = t < 6.9;
    E.formul(ctx, kFaz ? `\\c{turkuaz}{k = ${sy(k, 1)}}` : `\\c{menekse}{r = ${sy(r, 1)}}`, cx, y(196, 148), { boyut: yd(38, 34) });
    const ins = kFaz ? ifade(1, k) : `f(${ifade(1, -r)}) = ${ifade(1, -r)}`;
    E.formul(ctx, 'g(x) = ' + ins, cx, y(276, 204), { boyut: yd(40, 34), renk: 'tebesir' });
    // notlar
    const n1 = pencere(t, 1.2, 1.8, 4.1, 4.5), n2 = pencere(t, 4.5, 4.9, 6.7, 7.1);
    const n3 = pencere(t, 7.1, 7.6, 10.6, 11.0), n4 = pencere(t, 11.0, 11.5, 13.2, 13.7);
    const ny = y(380, 262);
    E.yazi(ctx, 'k > 0  →  yukarı', cx, ny, { boyut: yd(34, 30), agirlik: 640, renk: 'turkuaz', alfa: n1 });
    E.yazi(ctx, 'k < 0  →  aşağı', cx, ny, { boyut: yd(34, 30), agirlik: 640, renk: 'turkuaz', alfa: n2 });
    E.yazi(ctx, 'x − 3  →  3 birim SAĞA', cx, ny, { boyut: yd(34, 30), agirlik: 680, renk: 'mercan', alfa: n3 });
    E.yazi(ctx, 'x + 2  →  2 birim SOLA', cx, ny, { boyut: yd(34, 30), agirlik: 680, renk: 'mercan', alfa: n4 });
    if (H) E.yazi(ctx, 'işaret tuzağı: eksi, sağa götürür', cx, ny + 60, { boyut: 26, agirlik: 520, renk: 'gumus', alfa: Math.max(n3, n4) });
  };

  /* ---------- 4. Eğ ve çevir: a ---------- */
  const eg = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = duz(KUTU());
    const a = kf(t, [[0.6, 1], [1.8, 2], [4.0, 2], [5.0, 0.5], [5.6, 0.5], [6.4, 0], [7.4, 0], [8.4, -1], [10.4, -1], [11.4, -2]]);
    const r = kf(t, [[10.4, 0], [11.4, 1]]), k = kf(t, [[10.4, 0], [11.4, 3]]);
    const g = (x) => a * (x - r) + k;
    const son = ara(t, 11.4, 12.0);
    d.ciz(ctx, { adim: 1, etiketAdim: 2 });
    dogru(ctx, d, (x) => x, { renk: 'gumus', kalinlik: 2, parilti: 0, kesik: [8, 8], alfa: 0.75 * (1 - son) });
    // son hâl: işaret bölgeleri
    bolge(ctx, d, [[2.5, 0], [d.xmin, 0], [d.xmin, -2 * d.xmin + 5]], 'turkuaz', 0.15 * son);
    bolge(ctx, d, [[2.5, 0], [d.xmax, 0], [d.xmax, -2 * d.xmax + 5]], 'mercan', 0.15 * son);
    // eğim üçgeni (a = 2)
    const ucg = pencere(t, 1.9, 2.4, 3.8, 4.2);
    if (ucg > 0) {
      E.cizgi(ctx, [d.p(1, 2), d.p(2, 2), d.p(2, 4)], { renk: 'limon', kalinlik: 3, alfa: ucg, p: ara(t, 1.9, 2.8) });
      E.yazi(ctx, '1', d.px(1.5), d.py(2) + 20, { boyut: 26, agirlik: 700, renk: 'limon', alfa: ucg });
      E.yazi(ctx, '2', d.px(2) + 20, d.py(3), { boyut: 26, agirlik: 700, renk: 'limon', alfa: ucg, hiza: 'left' });
    }
    // a = 0: her x aynı yere
    const sifirA = pencere(t, 6.3, 6.7, 7.3, 7.7);
    for (const x of [-4, -1.5, 1.5, 4]) E.nokta(ctx, d.px(x), d.py(0), 8, { renk: 'limon', parilti: 1.2, alfa: sifirA });
    dogru(ctx, d, g, { renk: son > 0.5 ? 'turkuaz' : 'mercan', kalinlik: 4.5, parilti: 1.1 });
    // a < 0: azalan — kayan nokta
    const az = ara(t, 8.6, 10.2, 'io2');
    if (az > 0 && az < 1) { const x = lerp(-3.5, 3.5, az); E.nokta(ctx, d.px(x), d.py(g(x)), 9, { renk: 'limon', parilti: 1.4 }); }
    // sıfır noktası (son hâl)
    if (son > 0) {
      E.nokta(ctx, d.px(2.5), d.py(0), 9, { renk: 'limon', parilti: 1.4, alfa: son });
      E.isik(ctx, d.px(2.5), d.py(0), 120, 'limon', 0.4 * E.nabiz(t, 11.6, 1.0));
    }
    // Panel
    const P = PANEL(), cx = P.x + P.w / 2;
    const pA = 1 - ara(t, 10.4, 10.9);
    if (pA > 0) {
      ctx.save(); ctx.globalAlpha *= pA;
      E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 0, 0.6), vurgu: 'mercan' });
      const y = (h, v) => P.y + yd(h, v);
      E.yazi(ctx, 'EĞ VE ÇEVİR', P.x + 28, y(34, 34), { boyut: 22, agirlik: 700, harfAra: 4, renk: 'mercan', hiza: 'left' });
      E.formul(ctx, 'g(x) = \\c{mercan}{a} · f(x)', cx, y(112, 88), { boyut: yd(42, 38) });
      E.formul(ctx, `\\c{mercan}{a = ${sy(a, 1)}}`, cx, y(196, 148), { boyut: yd(38, 34) });
      E.formul(ctx, 'g(x) = ' + ifade(a, 0), cx, y(276, 204), { boyut: yd(40, 34) });
      const ny = y(380, 262), nb = yd(32, 28);
      E.yazi(ctx, 'a = 2: her adımda 2 kat yükselir', cx, ny, { boyut: nb, agirlik: 620, renk: 'limon', alfa: pencere(t, 1.4, 2.0, 3.9, 4.3), maxGen: P.w - 50 });
      E.yazi(ctx, 'a küçüldükçe doğru yatar', cx, ny, { boyut: nb, agirlik: 620, renk: 'gumus', alfa: pencere(t, 4.3, 4.7, 6.0, 6.4), maxGen: P.w - 50 });
      E.yazi(ctx, 'a = 0: sabit, bire bir değil', cx, ny, { boyut: nb, agirlik: 620, renk: 'limon', alfa: pencere(t, 6.4, 6.8, 7.9, 8.3), maxGen: P.w - 50 });
      E.yazi(ctx, 'a < 0: yansır, artık azalan', cx, ny, { boyut: nb, agirlik: 620, renk: 'mercan', alfa: pencere(t, 8.3, 8.7, 10.2, 10.5), maxGen: P.w - 50 });
      ctx.restore();
    }
    // Son hâl: yeni kimlik kartı
    const sa = (t0) => ara(t, t0, t0 + 0.5, 'cik3');
    kart(ctx, {
      ...P, alfa: ara(t, 10.5, 11.1), renk: 'mercan',
      baslik: 'g(x) = −2(x − 1) + 3 = −2x + 5', bBoyut: yd(27, 28),
      satirlar: [
        { ad: H ? 'Tanım / görüntü kümesi' : 'Tanım / görüntü', deger: '\\R \\; / \\; \\R', alfa: sa(10.8) },
        { ad: 'Sıfırı', deger: 'x = 2{,}5', alfa: sa(11.1), vurgu: sa(11.1) },
        { ad: 'İşareti', deger: H ? 'x < 2{,}5: \\c{turkuaz}{+} \\quad x > 2{,}5: \\c{mercan}{−}' : '\\c{turkuaz}{+} \\; | \\; 2{,}5 \\; | \\; \\c{mercan}{−}', alfa: sa(11.4) },
        { ad: 'Artanlık', deger: '\\t{azalan}', alfa: sa(11.7), vurgu: sa(11.7) },
        { ad: H ? 'En büyük / en küçük' : 'Maks. / min.', deger: '\\t{yok}', alfa: sa(12.0) },
        { ad: 'Bire bir', deger: '\\t{evet}', alfa: sa(12.3) },
      ],
    });
  };

  /* ---------- 5. Varsayım → ispat; sıfır ve işaret ---------- */
  const ispat = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = duz(KUTU());
    const B = ara(t, 9.6, 10.6, 'io3');
    const a = lerp(0.5, 2, B), b = lerp(1, -6, B);
    const h = (x) => a * x + b;
    d.ciz(ctx, { adim: 1, etiketAdim: 2, etiket: false });
    // Bölüm B: işaret bölgeleri
    const isA = ara(t, 11.4, 12.0);
    bolge(ctx, d, [[3, 0], [d.xmin, 0], [d.xmin, h(d.xmin)]], 'mercan', 0.16 * isA);
    bolge(ctx, d, [[3, 0], [d.xmax, 0], [d.xmax, h(d.xmax)]], 'turkuaz', 0.16 * isA);
    dogru(ctx, d, h, { renk: 'turkuaz', kalinlik: 4.5, parilti: 1, p: ara(t, 0.2, 1.4, 'io2'), bas: true });
    // Bölüm A: x1 < x2
    const AA = ara(t, 1.2, 1.8) * (1 - ara(t, 9.2, 9.7));
    if (AA > 0) {
      const x1 = kf(t, [[6.4, -3], [7.2, -5], [8.4, -1]]), x2 = kf(t, [[6.4, 2], [7.2, 5], [8.4, 3]]);
      ctx.save(); ctx.globalAlpha *= AA;
      for (const [x, rk, ad] of [[x1, 'gok', '1'], [x2, 'menekse', '2']]) {
        const [px, py] = d.p(x, h(x)), oy = d.py(0), ox = d.px(0);
        E.cizgi(ctx, [[px, oy], [px, py]], { renk: rk, kalinlik: 2.5, kesik: [6, 6] });
        E.cizgi(ctx, [[px, py], [ox, py]], { renk: rk, kalinlik: 2, kesik: [4, 6], alfa: ara(t, 4.6, 5.2) });
        E.nokta(ctx, px, oy, 7, { renk: rk, parilti: 0.8 });
        E.nokta(ctx, px, py, 8, { renk: rk, parilti: 1.2 });
        E.formul(ctx, `x_{${ad}}`, px, oy + (h(x) >= 0 ? 26 : -26), { boyut: 28, renk: rk });
        E.etiket(ctx, `h(x_{${ad}})`, ox - 16, py - (x < 0 ? 26 : 0), { boyut: 26, formul: true, renk: rk, hiza: 'right', alfa: ara(t, 4.6, 5.2), plakaAlfa: 0.8 });
      }
      ctx.restore();
    }
    // Bölüm B: sıfır noktası
    if (B > 0.5) {
      const z = ara(t, 10.6, 11.0);
      E.nokta(ctx, d.px(3), d.py(0), 9, { renk: 'limon', parilti: 1.4, alfa: z });
      E.isik(ctx, d.px(3), d.py(0), 140, 'limon', 0.45 * E.nabiz(t, 10.7, 1.0));
      E.formul(ctx, '3', d.px(3) + 16, d.py(0) + 26, { boyut: 28, renk: 'limon', hiza: 'left', alfa: z });
      E.yazi(ctx, '−', d.px(0.6), d.py(-1.6), { boyut: 44, agirlik: 700, renk: 'mercan', alfa: isA });
      E.yazi(ctx, '+', d.px(5.2), d.py(1.6), { boyut: 44, agirlik: 700, renk: 'turkuaz', alfa: isA });
    }
    // Panel
    const P = PANEL(), cx = P.x + P.w / 2;
    E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 0, 0.6), vurgu: 'limon' });
    const pa = 1 - ara(t, 9.2, 9.7);
    const y = (h2, v) => P.y + yd(h2, v);
    if (pa > 0) {
      ctx.save(); ctx.globalAlpha *= pa;
      E.yazi(ctx, 'VARSAYIM → İSPAT', P.x + 28, y(34, 32), { boyut: 22, agirlik: 700, harfAra: 4, renk: 'limon', hiza: 'left' });
      E.formul(ctx, '\\kutu{limon}{a > 0 \\Rightarrow h(x) = ax + b \\t{ artan}}', cx, y(100, 80), { boyut: yd(32, 28), alfa: ara(t, 0.4, 1.0) });
      const sat = yd(66, 46), f0 = y(186, 132), fb = yd(32, 27);
      const adimlar = [
        ['x_{1} < x_{2}', 1.4],
        ['\\Rightarrow ax_{1} < ax_{2} \\quad \\c{gumus}{(a > 0)}', 3.2],
        ['\\Rightarrow ax_{1} + b < ax_{2} + b', 4.6],
        ['\\Rightarrow \\c{limon}{h(x_{1}) < h(x_{2})}', 5.8],
      ];
      adimlar.forEach(([f, t0], i) => E.formul(ctx, f, P.x + yd(60, 40), f0 + i * sat, { boyut: fb, hiza: 'left', alfa: ara(t, t0, t0 + 0.6, 'cik3'), aciga: ara(t, t0, t0 + 1.0, 'lin') }));
      if (H) E.yazi(ctx, 'a < 0 olsaydı eşitsizlik döner: azalan', cx, y(462, 0), { boyut: 26, agirlik: 560, renk: 'mercan', alfa: ara(t, 7.8, 8.4) });
      ctx.restore();
    }
    const pb = ara(t, 9.8, 10.4);
    if (pb > 0) {
      ctx.save(); ctx.globalAlpha *= pb;
      E.yazi(ctx, 'SIFIR VE İŞARET', P.x + 28, y(34, 32), { boyut: 22, agirlik: 700, harfAra: 4, renk: 'limon', hiza: 'left' });
      E.formul(ctx, '2x − 6 = 0 \\Rightarrow x = \\c{limon}{3}', cx, y(104, 82), { boyut: yd(36, 32) });
      E.formul(ctx, 'ax + b = 0 \\Rightarrow x = −\\frac{b}{a}', cx, y(186, 146), { boyut: yd(36, 30), renk: 'gumus', alfa: ara(t, 11.0, 11.6) });
      // İşaret tablosu
      const ta = ara(t, 11.6, 12.2);
      const tx = P.x + yd(40, 30), tw = P.w - yd(80, 60), ty = y(270, 200), rh = yd(52, 44);
      ctx.save(); ctx.globalAlpha *= ta;
      const c0 = tx + yd(110, 90);
      E.cizgi(ctx, [[tx, ty + rh / 2], [tx + tw, ty + rh / 2]], { renk: 'cizgi', kalinlik: 1.5 });
      E.cizgi(ctx, [[c0, ty - rh / 2 + 4], [c0, ty + rh * 1.5 - 4]], { renk: 'cizgi', kalinlik: 1.5 });
      const xs = [c0 + 50, c0 + (tw - (c0 - tx)) / 2, tx + tw - 40];
      E.formul(ctx, 'x', tx + 30, ty, { boyut: 28, hiza: 'left' });
      E.formul(ctx, 'h(x)', tx + 14, ty + rh, { boyut: 28, hiza: 'left' });
      E.formul(ctx, '−\\infty', xs[0], ty, { boyut: 26, renk: 'gumus' });
      E.formul(ctx, '3', xs[1], ty, { boyut: 28, renk: 'limon' });
      E.formul(ctx, '+\\infty', xs[2], ty, { boyut: 26, renk: 'gumus' });
      E.yazi(ctx, '−', (xs[0] + xs[1]) / 2, ty + rh, { boyut: 36, agirlik: 700, renk: 'mercan' });
      E.yazi(ctx, '0', xs[1], ty + rh, { boyut: 28, agirlik: 600, renk: 'limon' });
      E.yazi(ctx, '+', (xs[1] + xs[2]) / 2, ty + rh, { boyut: 36, agirlik: 700, renk: 'turkuaz' });
      ctx.restore();
      ctx.restore();
    }
  };

  /* ---------- 6. Sürpriz: sağa kaymak = aşağı inmek ---------- */
  const surpriz = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = duz(KUTU());
    const pA = ara(t, 1.6, 3.4, 'io3'), pB = ara(t, 4.4, 6.8, 'io3');
    const birles = ara(t, 6.8, 7.3);
    // kamera: birleşme anına doğru hafifçe yaklaş, sonra geri çekil
    const zz = 1 + 0.07 * ara(t, 4.2, 6.8, 'io2') * (1 - ara(t, 7.8, 9.4, 'io3'));
    const mrk = d.p(0.5, -1);
    ctx.save(); ctx.translate(mrk[0], mrk[1]); ctx.scale(zz, zz); ctx.translate(-mrk[0], -mrk[1]);
    d.ciz(ctx, { adim: 1, etiketAdim: 2, etiket: false });
    const L0 = (x) => 2 * x + 1;
    dogru(ctx, d, L0, { renk: 'gumus', kalinlik: 2.5, parilti: 0, alfa: 0.8, p: ara(t, 0.2, 1.2, 'io2') });
    E.etiket(ctx, 'y = 2x + 1', d.px(-2.6), d.py(2.6), { boyut: 28, formul: true, renk: 'gumus', alfa: ara(t, 0.8, 1.4) });
    const ca = ara(t, 1.2, 1.6);
    const renkA = E.karistir('mercan', 'limon', birles), renkB = E.karistir('menekse', 'limon', birles);
    dogru(ctx, d, (x) => 2 * (x - 2 * pA) + 1, { renk: renkA, kalinlik: 5, parilti: 1.1, alfa: ca });
    dogru(ctx, d, (x) => 2 * x + 1 - 4 * pB, { renk: renkB, kalinlik: 3, parilti: 0.8, alfa: ca * ara(t, 4.2, 4.5) });
    // işaretçiler
    const P0 = d.p(-1, -1);
    const oa = ca * (1 - ara(t, 8.0, 8.6));
    if (pA > 0) {
      E.ok(ctx, P0[0], P0[1], d.px(-1 + 2 * pA), P0[1], { renk: 'mercan', kalinlik: 3.5, okBoy: 14, alfa: oa, parilti: 0.6 });
      E.etiket(ctx, 'sağa 2', d.px(0), d.py(-1) + 30, { boyut: 26, renk: 'mercan', alfa: oa * ara(t, 2.4, 2.9) });
    }
    if (pB > 0) {
      E.ok(ctx, P0[0], P0[1], P0[0], d.py(-1 - 4 * pB), { renk: 'menekse', kalinlik: 3.5, okBoy: 14, alfa: oa, parilti: 0.6 });
      E.etiket(ctx, 'aşağı 4', P0[0] - 16, d.py(-3.4), { boyut: 26, renk: 'menekse', hiza: 'right', alfa: oa * ara(t, 5.4, 5.9) });
    }
    E.nokta(ctx, P0[0], P0[1], 7, { renk: 'tebesir', parilti: 0.8, alfa: ca });
    // birleşme flaşı
    const fl = E.nabiz(t, 6.75, 1.0);
    if (fl > 0) { E.isik(ctx, d.px(1.5), d.py(0), 420, 'limon', 0.35 * fl); E.isikSupur(ctx, ara(t, 6.8, 7.9, 'lin'), { renk: 'limon', guc: 0.3 }); }
    E.etiket(ctx, 'y = 2x − 3', d.px(1.6), d.py(-1.6), { boyut: 30, formul: true, hiza: 'left', renk: 'limon', alfa: ara(t, 7.0, 7.6), plakaAlfa: 0.8 });
    ctx.restore();
    // Panel
    const P = PANEL(), cx = P.x + P.w / 2;
    E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 0, 0.6), vurgu: 'limon' });
    const y = (h2, v) => P.y + yd(h2, v);
    const f1 = H ? 1 : 1 - ara(t, 7.6, 8.1);
    E.yazi(ctx, 'İKİ YOL', P.x + 28, y(34, 32), { boyut: 22, agirlik: 700, harfAra: 4, renk: 'limon', hiza: 'left', alfa: f1 });
    E.formul(ctx, '\\c{mercan}{2(x − 2) + 1} = 2x − 3', cx, y(100, 92), { boyut: yd(34, 32), alfa: f1 * ara(t, 3.0, 3.6), aciga: ara(t, 3.0, 4.0, 'lin') });
    E.formul(ctx, '\\c{menekse}{2x + 1 − 4} = 2x − 3', cx, y(166, 160), { boyut: yd(34, 32), alfa: f1 * ara(t, 6.4, 7.0), aciga: ara(t, 6.4, 7.4, 'lin') });
    E.yazi(ctx, 'Aynı doğru!', cx, y(222, 226), { boyut: yd(32, 32), agirlik: 720, renk: 'limon', alfa: f1 * ara(t, 7.0, 7.5), parilti: 0.4 });
    const f2 = ara(t, 8.0, 8.6) * (1 - (H ? 0 : ara(t, 11.0, 11.5)));
    E.formul(ctx, '\\kutu{limon}{a(x − \\c{mercan}{r}) + k = ax + (k − \\c{menekse}{ar})}', cx, y(296, 92), { boyut: yd(30, 30), alfa: f2 });
    E.yazi(ctx, 'sağa r  ≡  aşağı a·r', cx, y(362, 172), { boyut: yd(30, 32), agirlik: 640, renk: 'tebesir', alfa: f2 * ara(t, 9.0, 9.6) });
    const f3 = ara(t, 11.2, 11.8);
    E.formul(ctx, '25x + 40 = 25(x + 1{,}6)', cx, y(424, 120), { boyut: yd(32, 32), alfa: f3, renk: 'turkuaz' });
    E.yazi(ctx, 'Taksinin açılışı = 1,6 km’lik kayma', cx, y(472, 190), { boyut: yd(26, 28), agirlik: 600, renk: 'limon', alfa: ara(t, 12.0, 12.6), maxGen: P.w - 40 });
  };

  /* ---------- 7. Parçalı fonksiyon: ısıtılan buz ---------- */
  const buzIkon = (ctx, x, y, s, erime, isinma, al) => {
    if (al <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= al;
    // su birikintisi
    const gw = s * (0.4 + 0.9 * erime), gh = s * (0.08 + 0.12 * erime);
    const suRenk = E.karistir('gok', 'mercan', isinma);
    ctx.fillStyle = suRenk.replace(',1)', ',0.45)'); ctx.beginPath(); ctx.ellipse(x, y + s * 0.5, gw, gh, 0, 0, E.TAU); ctx.fill();
    // küp
    const k = s * (1 - erime);
    if (k > 2) {
      const kx = x - k / 2, ky = y + s * 0.5 - k;
      ctx.fillStyle = E.rgba('gok', 0.28); ctx.strokeStyle = E.rgba('tebesir', 0.85); ctx.lineWidth = 2.5;
      E.yuvarlakDik(ctx, kx, ky, k, k, k * 0.16); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = E.rgba('tebesir', 0.6); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(kx + k * 0.2, ky + k * 0.3); ctx.lineTo(kx + k * 0.35, ky + k * 0.18); ctx.stroke();
    }
    // buhar
    if (isinma > 0.05) {
      ctx.strokeStyle = E.rgba('gumus', 0.7 * isinma); ctx.lineWidth = 2.5;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        for (let j = 0; j <= 12; j++) { const yy = y + s * 0.3 - j * s * 0.07, xx = x + i * s * 0.35 + Math.sin(j * 0.8 + E.t * 4 + i) * s * 0.07; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
        ctx.stroke();
      }
    }
    ctx.restore();
    E.isik(ctx, x, y, s * 1.6, isinma > 0.5 ? 'mercan' : 'gok', 0.18 * al);
  };
  const buz = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const g = H ? { x: 120, y: 64, w: 500, h: 450 } : { x: 110, y: 104, w: 540, h: 420 };
    const d = E.duzlem({ x: g.x, y: g.y, w: g.w, h: g.h, xmin: -0.6, xmax: 11, ymin: -14, ymax: 46 });
    eksenler(ctx, d, { xAdim: 2, yAdim: 10, xAd: 'dakika', yAd: '°C', xAlt: true, p: ara(t, 0, 0.9) });
    const p1 = ara(t, 0.8, 3.0, 'lin'), p2 = ara(t, 3.6, 6.2, 'lin'), p3 = ara(t, 6.4, 7.8, 'lin');
    const parca = [
      [p1, 0, -10, 2, 0, 'turkuaz'],
      [p2, 2, 0, 6, 0, 'gok'],
      [p3, 6, 0, 10, 40, 'mercan'],
    ];
    let bas = null;
    for (const [p, x0, y0, x1, y1, rk] of parca) {
      if (p <= 0) continue;
      const xe = lerp(x0, x1, p), ye = lerp(y0, y1, p);
      E.cizgi(ctx, [d.p(x0, y0), d.p(xe, ye)], { renk: rk, kalinlik: 5, parilti: 1.1 });
      if (p < 1) bas = [d.px(xe), d.py(ye), rk];
    }
    if (bas) E.isik(ctx, bas[0], bas[1], 80, bas[2], 0.7);
    // uç noktalar
    const ac = ara(t, 10.0, 10.5);
    const ux = ara(t, 8.0, 8.5);
    for (const [x, y, rk, ad, hz, dy] of [[0, -10, 'turkuaz', 'en küçük: −10', 'left', 0], [10, 40, 'mercan', 'en büyük: 40', 'right', 0]]) {
      E.nokta(ctx, d.px(x), d.py(y), 9, { renk: rk, bos: ac > 0.5, parilti: 1.2, alfa: ux });
      E.etiket(ctx, ad, d.px(x) + (hz === 'left' ? 34 : -22), d.py(y) + dy, { boyut: 26, renk: ac > 0.5 ? 'gumus' : rk, hiza: hz, alfa: ux });
    }
    buzIkon(ctx, d.px(3.6), d.py(29), H ? 62 : 58, ara(t, 3.6, 6.2, 'io2'), ara(t, 6.4, 7.8), ara(t, 0.4, 1.0));
    // Panel: parçalı tanım
    const P = H ? { x: 680, y: 54, w: 516, h: 500 } : { x: 40, y: 586, w: 640, h: 294 };
    E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 0, 0.6), vurgu: 'gok' });
    E.yazi(ctx, 'PARÇALI TANIM', P.x + 28, P.y + 34, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'gok', hiza: 'left' });
    const fb = yd(30, 29), sat = yd(58, 50), y0 = P.y + yd(150, 124);
    const lx = P.x + yd(28, 30);
    E.formul(ctx, 'T(x) =', lx, y0, { boyut: fb, hiza: 'left', alfa: ara(t, 0.6, 1.2) });
    const bx = lx + E.formulOlc(ctx, 'T(x) =', fb).w + 12;
    parantez(ctx, bx, y0 - sat - 22, y0 + sat + 22, { alfa: ara(t, 0.8, 1.4), w: 18 });
    const satirlar = [
      ['\\c{turkuaz}{5x − 10}', '0 \\le x < 2', 1.0],
      ['\\c{gok}{0}', '2 \\le x < 6', 3.8],
      ['\\c{mercan}{10x − 60}', '6 \\le x \\le 10', 6.6],
    ];
    const kx = bx + 30, kosX = bx + yd(196, 200);
    satirlar.forEach(([f, k, t0], i) => {
      const al = ara(t, t0, t0 + 0.6, 'cik3');
      E.formul(ctx, f + ',', kx, y0 + (i - 1) * sat, { boyut: fb, hiza: 'left', alfa: al });
      E.formul(ctx, k, kosX, y0 + (i - 1) * sat, { boyut: fb * 0.9, hiza: 'left', renk: 'gumus', alfa: al });
    });
    const ey = P.y + yd(330, 260);
    E.yazi(ctx, '[0, 10] kapalı: en küçük −10, en büyük 40', P.x + P.w / 2, ey, { boyut: yd(25, 25), agirlik: 560, alfa: ara(t, 8.2, 8.8) * (1 - (H ? 0 : ara(t, 9.8, 10.2))) });
    E.yazi(ctx, 'Uçlar açık olsaydı (0, 10): ikisi de yok', P.x + P.w / 2, H ? ey + 64 : ey, { boyut: yd(26, 25), agirlik: 560, renk: 'mercan', alfa: ara(t, 10.2, 10.8), maxGen: P.w - 40 });
    if (H) E.yazi(ctx, 'Her parça bir doğru: f(x) = x’in kılığı', P.x + P.w / 2, ey + 128, { boyut: 24, agirlik: 520, renk: 'gumus', alfa: ara(t, 11.0, 11.6) });
  };

  /* ---------- 8–9. Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Her doğru, f(x) = x’in kılığıdır.', formul: 'g(x) = a · f(x − r) + k' },
    { tr: 'a > 0 artan, a < 0 azalan.', formul: 'h(x) = ax + b' },
    { tr: 'Sıfır, eksenin kesildiği yer.', formul: 'x = −\\frac{b}{a}' },
    { tr: 'Sağa r = aşağı a·r.', formul: 'a(x − r) + k = ax + (k − ar)' },
  ], { aralik: 1.6 });

  /** Bitiş kartı: laboratuvar adı tek satıra sığsın diye başlığı kendimiz yazarız (motor 50 px'te sarıyor) */
  const bitis = (ctx, s) => {
    E.bitisKarti(ctx, s, Object.assign({}, meta, { labAd: '' }));
    const L = E.L, ic = L.icerik;
    const qrBoy = yd(220, 260), qy = yd(L.cy - qrBoy / 2 - 40, ic.y + 330);
    const boy = E.sigdir(ctx, meta.labAd, { boyut: yd(50, 46), agirlik: 760 }, yd(500, 600), 30);
    E.yazi(ctx, meta.labAd, yd(L.cx - 400, L.cx), yd(qy + 82, ic.y + 120), { boyut: boy, agirlik: 760, hiza: yd('left', 'center'), alfa: ara(s.t, 0, 0.9, 'cik3') });
  };

  /* ---------- Film ---------- */
  E.film({
    meta,
    sure: 118,
    sahneler: [
      { ad: 'Soğuk açılış: taksimetre', bas: 0, son: 10.3, giris: 0, cikis: 0.7, ciz: acilis },
      { ad: 'İmza', bas: 10.0, son: 13.7, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 13.4, son: 17.6, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Referans doğru: f(x) = x', bas: 17.3, son: 33.6, ciz: referans },
      { ad: 'Kaydır: k ve r', bas: 33.3, son: 47.0, ciz: kaydir },
      { ad: 'Eğ ve çevir: a', bas: 46.7, son: 60.6, ciz: eg },
      { ad: 'Varsayımdan ispata', bas: 60.3, son: 75.0, ciz: ispat },
      { ad: 'Sürpriz: iki yol, tek doğru', bas: 74.7, son: 89.6, ciz: surpriz },
      { ad: 'Parçalı fonksiyon: ısıtılan buz', bas: 89.3, son: 101.6, ciz: buz },
      { ad: 'Aklında kalsın', bas: 101.3, son: 111.6, ciz: ozet },
      { ad: 'Laboratuvar', bas: 111.4, son: 118, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 6 }),
  });
})();
