/* ==========================================================================
   EKSEN 9.2.2 — Katlanan Doğru
   Tek fikir: Mutlak değer, doğrunun x ekseninin altında kalan parçasını
   eksen boyunca yukarı katlamaktır. Katlama, alt yarı düzlemin x ekseni
   etrafında 180° dönmesidir (perspektifli 2B canlandırma).
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp, yd } = E;

  const meta = {
    kod: 'MAT.9.2.2',
    tema: 'Nicelikler ve Değişimler',
    ad: 'Katlanan Doğru',
    adEn: 'The Folded Line',
    labAd: 'Fonksiyon Laboratuvarı',
    labAciklama: 'Bir doğruyu x ekseni boyunca katla; tepe, simetri ekseni ve sıfırların nasıl değiştiğini gör.',
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

  /** s·|a·x + b| + c fonksiyonunu iki renkli kol olarak çiz */
  const vCiz = (ctx, d, a, b, c, o = {}) => {
    const sg = o.s ?? 1, xk = -b / a;
    const f = (x) => sg * Math.abs(a * x + b) + c;
    const temel = Object.assign({ kalinlik: 4.5, parilti: 1, alfa: 1 }, o);
    dogru(ctx, d, f, Object.assign({}, temel, { renk: o.sol || o.renk || 'turkuaz', x0: d.xmin, x1: xk }));
    dogru(ctx, d, f, Object.assign({}, temel, { renk: o.sag || o.renk || 'turkuaz', x0: xk, x1: d.xmax }));
  };
  /** Perspektif izdüşüm: matematik birimi (x, y, z) → ekran. cam: {ox, oy, u, yaw, pitch, F} */
  const izdusum = (cam) => {
    const cy = Math.cos(cam.yaw), sy_ = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    return (x, y, z) => {
      const x1 = x * cy + z * sy_, z1 = -x * sy_ + z * cy;
      const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      const k = cam.F / (cam.F - z2);
      return [cam.ox + x1 * k * cam.u, cam.oy - y2 * k * cam.u];
    };
  };
  const alan = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a / 2; };

  /* ---------- 1. Soğuk açılış: durağa uzaklık ---------- */
  const yaya = (ctx, x, y, s, faz, al) => {
    if (al <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= al; ctx.strokeStyle = E.R('tebesir'); ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const b = Math.sin(faz) * 0.5;
    const kalca = [x, y - s * 0.46], omuz = [x + s * 0.03, y - s * 0.8];
    ctx.beginPath(); ctx.arc(x + s * 0.05, y - s * 0.96, s * 0.12, 0, E.TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(omuz[0], omuz[1]); ctx.lineTo(kalca[0], kalca[1]);
    ctx.moveTo(kalca[0], kalca[1]); ctx.lineTo(x + Math.sin(b) * s * 0.42, y);
    ctx.moveTo(kalca[0], kalca[1]); ctx.lineTo(x - Math.sin(b) * s * 0.42, y);
    ctx.moveTo(omuz[0], omuz[1] + s * 0.05); ctx.lineTo(x - Math.sin(b) * s * 0.3, y - s * 0.46);
    ctx.moveTo(omuz[0], omuz[1] + s * 0.05); ctx.lineTo(x + Math.sin(b) * s * 0.3, y - s * 0.46);
    ctx.stroke(); ctx.restore();
  };
  const acilis = (ctx, s) => {
    const t = s.t, H = E.yatay, ic = E.L.icerik;
    const g = H ? { x: 110, y: 170, w: 1060, h: 350 } : { x: 70, y: 350, w: 590, h: 450 };
    const d = E.duzlem({ x: g.x, y: g.y, w: g.w, h: g.h, xmin: -0.3, xmax: 6.9, ymin: -0.38, ymax: 3.5 });
    const ga = ara(t, 0.2, 1.2);
    const ox = d.px(0), oy = d.py(0);
    // sokak lambaları (bokeh)
    const r = E.rng(52);
    for (let i = 0; i < 16; i++) {
      const der = 0.3 + r() * 0.7, x0 = r() * E.W, y0 = r() * E.H * 0.6, rr = 40 + r() * 90 * der;
      E.isik(ctx, x0 - t * 12 * der, y0, rr, ['gok', 'menekse', 'turkuaz', 'mercan'][i % 4], 0.08 * der * ga);
    }
    // yol
    ctx.save(); ctx.globalAlpha *= ga;
    ctx.fillStyle = E.rgba('lacivert', 0.95); ctx.fillRect(d.x, oy, d.w, 34);
    ctx.restore();
    E.cizgi(ctx, [[d.x, oy + 17], [d.x + d.w, oy + 17]], { renk: 'sis', kalinlik: 2, kesik: [18, 14], alfa: ga });
    // ızgara
    ctx.save(); ctx.globalAlpha *= ga; ctx.strokeStyle = E.rgba('sis', 0.5); ctx.lineWidth = 1;
    for (let x = 0; x <= 6; x++) { ctx.beginPath(); ctx.moveTo(d.px(x), oy); ctx.lineTo(d.px(x), d.y); ctx.stroke(); }
    for (let y = 1; y <= 3; y++) { ctx.beginPath(); ctx.moveTo(d.x, d.py(y)); ctx.lineTo(d.x + d.w, d.py(y)); ctx.stroke(); }
    ctx.restore();
    E.cizgi(ctx, [[d.x, oy], [d.x + d.w, oy]], { renk: 'cizgi', kalinlik: 2.5, ok: true, okBoy: 12, alfa: ga });
    E.cizgi(ctx, [[ox, oy], [ox, d.y]], { renk: 'cizgi', kalinlik: 2.2, ok: true, okBoy: 12, alfa: ga });
    for (let x = 0; x <= 6; x++) E.yazi(ctx, String(x), d.px(x), oy + 54, { boyut: 22, renk: 'gumus', alfa: ga });
    if (H) E.yazi(ctx, '× 100 m', d.x + d.w, oy + 54, { boyut: 22, renk: 'gumus', hiza: 'right', alfa: ga });
    E.yazi(ctx, 'uzaklık', ox + 16, d.y + 10, { boyut: 22, renk: 'gumus', agirlik: 600, hiza: 'left', alfa: ga });
    // durak tabelası
    const dx = d.px(3), da = ara(t, 0.6, 1.4);
    E.cizgi(ctx, [[dx, oy], [dx, oy - 96]], { renk: 'gumus', kalinlik: 3, alfa: da });
    E.panel(ctx, dx - 46, oy - 128, 92, 34, { r: 8, renk: 'gok', dolguAlfa: 0.9, kenar: null, alfa: da });
    E.yazi(ctx, 'DURAK', dx, oy - 111, { boyut: 22, agirlik: 760, renk: 'gece', alfa: da, harfAra: 1 });
    // yaya ve uzaklık
    const x = kf(t, [[1.0, 0], [4.4, 3, 'io2'], [5.0, 3], [8.3, 6, 'io2']]);
    const uz = Math.abs(x - 3);
    const ya = ara(t, 0.8, 1.2);
    // iz (V)
    const iz = x <= 3 ? [d.p(0, 3), d.p(x, 3 - x)] : [d.p(0, 3), d.p(3, 0), d.p(x, x - 3)];
    const parla = ara(t, 8.3, 9.0);
    E.cizgi(ctx, iz, { renk: E.karistir('gok', 'limon', parla), kalinlik: 4.5, parilti: 1 + 0.4 * parla, alfa: ya });
    if (uz > 0.01) E.cizgi(ctx, [[d.px(x), oy], [d.px(x), d.py(uz)]], { renk: 'gok', kalinlik: 7, parilti: 0.9, alfa: 0.55 * ya * (1 - parla), uc: 'butt' });
    E.nokta(ctx, d.px(x), d.py(uz), 8, { renk: 'limon', parilti: 1.3, alfa: ya * (1 - parla) });
    const yur = (x < 3 - 1e-3 || (t > 5.0 && x < 6 - 1e-3)) ? 1 : 0;
    yaya(ctx, d.px(x), oy - 2, 48, t * 9 * yur, ya);
    const durFl = E.nabiz(t, 4.3, 0.9);
    if (durFl > 0) E.isik(ctx, dx, oy, 120, 'limon', 0.5 * durFl);
    // bilgi
    const ia = ara(t, 0.6, 1.4);
    const deger = Math.round(uz * 100) + ' m';
    if (H) {
      E.yazi(ctx, 'DURAĞA UZAKLIK', ic.x + 4, ic.y + 22, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'gok', hiza: 'left', alfa: ia });
      E.yazi(ctx, deger, ic.x + 4, ic.y + 76, { boyut: 52, agirlik: 700, font: 'mono', renk: 'tebesir', hiza: 'left', alfa: ia, parilti: 0.3 });
      E.formul(ctx, 'uzaklık = |x − 3|', ic.x1 - 4, ic.y + 60, { boyut: 44, hiza: 'right', renk: 'limon', alfa: ara(t, 8.3, 9.0), parilti: 0.4 });
      E.formul(ctx, '\\t{konum − durak} = x − 3', ic.x1 - 4, ic.y + 60, { boyut: 34, hiza: 'right', renk: 'gumus', alfa: pencere(t, 5.4, 6.0, 7.9, 8.3) });
    } else {
      E.panel(ctx, ic.x + 20, ic.y + 4, ic.w - 40, 200, { alfa: ia, vurgu: 'gok' });
      E.yazi(ctx, 'DURAĞA UZAKLIK', ic.cx, ic.y + 38, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'gok', alfa: ia });
      E.yazi(ctx, deger, ic.cx, ic.y + 96, { boyut: 54, agirlik: 700, font: 'mono', alfa: ia, parilti: 0.3 });
      E.formul(ctx, 'uzaklık = |x − 3|', ic.cx, ic.y + 160, { boyut: 38, renk: 'limon', alfa: ara(t, 8.3, 9.0), parilti: 0.4 });
      E.formul(ctx, '\\t{konum − durak} = x − 3', ic.cx, ic.y + 160, { boyut: 32, renk: 'gumus', alfa: pencere(t, 5.4, 6.0, 7.9, 8.3) });
    }
  };

  /* ---------- 2. x ve |x|: benzer ama aynı değil ---------- */
  const RT = [6.6, 7.3, 8.0, 8.7, 9.6, 10.6];
  const xMutlak = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = duz(KUTU());
    d.ciz(ctx, { adim: 1, etiketAdim: 2, p: ara(t, 0, 1.0) });
    const fp = ara(t, 4.2, 6.2, 'io3');
    const ters = ara(t, 12.0, 14.0, 'io3');
    const cs = Math.cos(Math.PI * fp), cT = Math.cos(Math.PI * ters);
    const lp = ara(t, 0.4, 2.0, 'io2');
    const m = Math.max(d.xmax, d.ymax) * lp;
    // katlanan kanat
    const kan = ara(t, 3.4, 4.2) * (1 - ara(t, 6.4, 7.2));
    bolge(ctx, d, [[0, 0], [d.xmin, 0], [d.xmin, d.xmin * cs]], 'mercan', 0.2 * kan);
    const mt = E.nabiz(t, 3.8, 2.8);
    if (mt > 0) E.cizgi(ctx, [d.p(d.xmin, 0), d.p(d.xmax, 0)], { renk: 'limon', kalinlik: 3, parilti: 1.2, alfa: mt });
    // görüntü kümesi ışını (y ≥ 0)
    const gk = pencere(t, RT[1], RT[1] + 0.5, RT[2] - 0.1, RT[2] + 0.4);
    if (gk > 0) E.cizgi(ctx, [d.p(0, 0), d.p(0, d.ymax * ara(t, RT[1], RT[1] + 0.8))], { renk: 'limon', kalinlik: 6, parilti: 1.3, alfa: gk });
    dogru(ctx, d, (x) => x, { renk: 'gumus', kalinlik: 2, parilti: 0, kesik: [8, 8], alfa: 0.6 * ara(t, 6.2, 6.8) * (1 - ters) });
    const renkSol = ters > 0.5 ? 'menekse' : fp > 0.5 ? 'mercan' : 'turkuaz';
    dogru(ctx, d, (x) => x * cT, { renk: ters > 0.5 ? 'menekse' : 'turkuaz', kalinlik: 4.5, parilti: 1, x0: 0, x1: m });
    dogru(ctx, d, (x) => x * cs * cT, { renk: renkSol, kalinlik: 4.5, parilti: 1, x0: -m, x1: 0 });
    // en küçük değer: orijinde nabız
    const ek = pencere(t, RT[4], RT[4] + 0.4, RT[5] - 0.2, RT[5] + 0.2);
    if (ek > 0) { E.nokta(ctx, d.px(0), d.py(0), 9, { renk: 'limon', parilti: 1.5, alfa: ek }); E.isik(ctx, d.px(0), d.py(0), 120, 'limon', 0.4 * ek); }
    // artanlık: V boyunca kayan ışık
    const ar = ara(t, RT[3], RT[4] - 0.1, 'io2');
    if (ar > 0 && ar < 1) { const x = lerp(-4.5, 4.5, ar); E.nokta(ctx, d.px(x), d.py(Math.abs(x)), 9, { renk: 'limon', parilti: 1.4 }); }
    // bire bir değil: yatay doğru iki noktada keser
    const bb = pencere(t, RT[5], RT[5] + 0.4, 11.6, 12.0);
    if (bb > 0) {
      E.cizgi(ctx, [d.p(d.xmin, 2), d.p(d.xmax, 2)], { renk: 'gumus', kalinlik: 2, kesik: [10, 8], alfa: bb });
      for (const x of [-2, 2]) E.nokta(ctx, d.px(x), d.py(2), 9, { renk: 'limon', parilti: 1.3, alfa: bb });
    }
    // −|x|: en büyük değer
    if (ters > 0.9) { E.nokta(ctx, d.px(0), d.py(0), 9, { renk: 'limon', parilti: 1.4, alfa: ara(t, 13.8, 14.3) }); }
    E.etiket(ctx, 'f(x) = x', d.px(3.3), d.py(-3.2), { boyut: 30, formul: true, renk: 'turkuaz', alfa: pencere(t, 1.6, 2.2, 5.6, 6.2) });
    E.etiket(ctx, 'n(x) = |x|', d.px(3.3), d.py(-3.2), { boyut: 30, formul: true, renk: 'mercan', alfa: pencere(t, 6.0, 6.6, 11.6, 12.0) });
    E.etiket(ctx, 'y = −|x|', d.px(-3.4), d.py(1.6), { boyut: 30, formul: true, renk: 'menekse', alfa: ara(t, 13.6, 14.2) });
    // Karşılaştırma tablosu
    const P = PANEL();
    const tA = ara(t, 6.2, 6.8) * (H ? 1 : 1 - ara(t, 11.8, 12.3));
    const satirlar = [
      ['Tanım kümesi', '\\R', '\\R', 0],
      ['Görüntü kümesi', '\\R', '[0, \\infty)', 1],
      ['Sıfırı', 'x = 0', 'x = 0', 0],
      ['Artanlık', '\\t{artan}', '\\t{azalır, artar}', 1],
      ['En küçük değer', '\\t{yok}', '0', 1],
      ['Bire bir', '\\t{evet}', '\\t{hayır}', 1],
    ];
    E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 6.0, 6.6), vurgu: 'mercan' });
    if (tA > 0) {
      ctx.save(); ctx.globalAlpha *= tA;
      const c1 = P.x + yd(300, 340), c2 = P.x + yd(450, 520), hy = P.y + yd(40, 28);
      const y0 = P.y + yd(98, 64), adim = yd(56, 38), bl = yd(24, 22), bv = yd(28, 24);
      E.formul(ctx, 'f(x) = x', c1, hy, { boyut: yd(28, 24), renk: 'turkuaz' });
      E.formul(ctx, 'n(x) = |x|', c2, hy, { boyut: yd(28, 24), renk: 'mercan' });
      E.cizgi(ctx, [[P.x + 20, hy + yd(26, 18)], [P.x + P.w - 20, hy + yd(26, 18)]], { renk: 'sis', kalinlik: 1.5 });
      satirlar.forEach(([ad, v1, v2, fark], i) => {
        const a = ara(t, RT[i], RT[i] + 0.5, 'cik3');
        if (a <= 0.002) return;
        const y = y0 + i * adim;
        const vur = fark ? pencere(t, RT[i], RT[i] + 0.3, (RT[i + 1] ?? 11.8) - 0.1, (RT[i + 1] ?? 11.8) + 0.3) : 0;
        if (vur > 0.01) E.panel(ctx, c2 - yd(90, 80), y - adim / 2 + 3, yd(180, 160), adim - 6, { alfa: a * vur, renk: 'limon', dolguAlfa: 0.08, kenar: 'limon', kenarAlfa: 0.6, r: 10 });
        E.yazi(ctx, ad, P.x + yd(28, 24), y, { boyut: bl, agirlik: 560, renk: 'gumus', hiza: 'left', alfa: a });
        E.formul(ctx, v1, c1, y, { boyut: bv, alfa: a });
        E.formul(ctx, v2, c2, y, { boyut: bv, alfa: a, renk: fark ? 'limon' : 'tebesir' });
      });
      ctx.restore();
    }
    // −|x| notu
    const nA = ara(t, 12.4, 13.0);
    if (H) {
      E.formul(ctx, '−|x|: \\t{ ters V, en büyük değer } 0', P.x + P.w / 2, P.y + 452, { boyut: 26, renk: 'menekse', alfa: nA });
    } else if (nA > 0) {
      E.formul(ctx, 'y = −|x|', P.x + P.w / 2, P.y + 70, { boyut: 44, renk: 'menekse', alfa: nA, parilti: 0.3 });
      E.yazi(ctx, 'Aynı V, ters dönmüş', P.x + P.w / 2, P.y + 140, { boyut: 30, agirlik: 620, alfa: nA });
      E.formul(ctx, '\\t{en büyük değer } 0', P.x + P.w / 2, P.y + 196, { boyut: 30, renk: 'limon', alfa: ara(t, 13.4, 14.0) });
      E.formul(ctx, '\\t{görüntü kümesi } (−\\infty, 0]', P.x + P.w / 2, P.y + 252, { boyut: 30, renk: 'gumus', alfa: ara(t, 14.0, 14.6) });
    }
  };

  /* ---------- 3. Katla: |2x − 4| (perspektifli katlama) ---------- */
  const katla = (ctx, s) => {
    const t = s.t, H = E.yatay, ic = E.L.icerik;
    const K = KUTU(), u = K.u;
    const xr = K.w / 2 / u, yr = K.h / 2 / u;
    const kay = ara(t, 9.8, 11.0, 'io3');
    const ox = lerp(ic.cx, K.x + K.w / 2, kay), oy = lerp(ic.cy, K.y + K.h / 2, kay);
    const orb = ara(t, 2.0, 4.0, 'io3') * (1 - ara(t, 8.4, 10.2, 'io3'));
    const P3 = izdusum({ ox, oy: oy + yd(56, 150) * orb, u: u * (1 - yd(0.24, 0.08) * orb), yaw: -0.5 * orb, pitch: -0.55 * orb, F: 26 });
    const th = Math.PI * ara(t, 4.4, 8.0, 'io3');
    const ust = (x, y) => P3(x, y, 0);
    const alt = (x, y) => P3(x, y * Math.cos(th), -y * Math.sin(th));
    const pa = ara(t, 0, 0.8);
    const cizY = (f, pts, o) => E.cizgi(ctx, pts.map((p) => f(p[0], p[1])), o);
    const izgara = (f, y0, y1, al) => {
      if (al <= 0.002) return;
      for (let x = Math.ceil(-xr); x <= xr; x++) if (x !== 0) cizY(f, [[x, y0], [x, y1]], { renk: 'sis', kalinlik: 1, alfa: 0.75 * al });
      for (let y = Math.ceil(Math.min(y0, y1)); y <= Math.max(y0, y1); y++) if (y !== 0) cizY(f, [[-xr, y], [xr, y]], { renk: 'sis', kalinlik: 1, alfa: 0.75 * al });
    };
    // üst yarı düzlem (sabit)
    E.cokgen(ctx, [ust(-xr, 0), ust(xr, 0), ust(xr, yr), ust(-xr, yr)], { renk: 'derin', alfa: 0.45 * pa, kenar: true, kenarRenk: 'sis', kalinlik: 1.5, kenarAlfa: 0.8 * pa });
    izgara(ust, 0, yr, pa);
    cizY(ust, [[0, 0], [0, yr]], { renk: 'cizgi', kalinlik: 2.2, alfa: pa, ok: true, okBoy: 12 });
    // yeni alt yarı (katlamadan sonra)
    const yeni = ara(t, 8.8, 10.2);
    izgara(ust, -yr, 0, yeni);
    cizY(ust, [[0, -yr], [0, 0]], { renk: 'cizgi', kalinlik: 2.2, alfa: yeni });
    // doğru: üst parça
    const lp = ara(t, 0.4, 1.9, 'io2');
    const xe = Math.min(xr, (yr + 4) / 2), xl = Math.max(-xr, (4 - yr) / 2);
    const pU = clamp(lp * 2 - 1), pL = clamp(lp * 2);
    if (pU > 0) cizY(ust, [[2, 0], [lerp(2, xe, pU), lerp(0, 2 * xe - 4, pU)]], { renk: 'turkuaz', kalinlik: 4.5, parilti: 1 });
    // menteşe
    const mt = ara(t, 3.6, 4.4) * (1 - ara(t, 8.2, 9.2));
    cizY(ust, [[-xr, 0], [xr, 0]], { renk: mt > 0.01 ? E.karistir('cizgi', 'limon', mt) : 'cizgi', kalinlik: 2.5 + 1.5 * mt, parilti: 1.2 * mt, alfa: pa, ok: true, okBoy: 12 });
    // alt yarı düzlem (dönen yaprak)
    const yap = 1 - ara(t, 9.0, 10.0);
    const q = [alt(-xr, -yr), alt(xr, -yr), alt(xr, 0), alt(-xr, 0)];
    const on = alan(q) * alan([ust(-xr, -yr), ust(xr, -yr), ust(xr, 0), ust(-xr, 0)]) > 0;
    const tint = ara(t, 2.2, 3.4) * (1 - ara(t, 8.2, 9.0));
    if (yap > 0.002) {
      E.cokgen(ctx, q, { dolgu: on ? E.karistir('derin', 'mercan', 0.25 * tint, 0.55) : E.karistir('derin', 'menekse', 0.35, 0.6), alfa: pa * yap, kenar: true, kenarRenk: on ? 'mercan' : 'menekse', kalinlik: 2, kenarAlfa: (0.4 + 0.5 * tint) * pa * yap });
      izgara(alt, -yr, 0, pa * yap);
      cizY(alt, [[0, -yr], [0, 0]], { renk: 'cizgi', kalinlik: 2.2, alfa: pa * yap });
    }
    // doğru: alt parça (yaprakla birlikte döner, sonra sol kol olur)
    if (pL > 0) {
      const renk = E.karistir('turkuaz', 'mercan', ara(t, 2.2, 3.2));
      cizY(alt, [[lerp(2, xl, pL), lerp(0, 2 * xl - 4, pL)], [2, 0]], { renk, kalinlik: 4.5, parilti: 1 });
    }
    // sıfır noktası
    const [zx, zy] = ust(2, 0);
    E.nokta(ctx, zx, zy, 9, { renk: 'limon', parilti: 1.4, alfa: ara(t, 1.6, 2.0) });
    E.isik(ctx, zx, zy, 220, 'limon', 0.6 * E.nabiz(t, 7.9, 1.0));
    const [lx, ly] = ust(0.7, 0.75);
    E.etiket(ctx, 'x = 2', lx, ly, { boyut: 28, formul: true, renk: 'limon', alfa: pencere(t, 1.8, 2.4, 4.2, 4.6) });
    const [hx, hy] = ust(4.4, -2.3);
    E.etiket(ctx, 'h(x) = 2x − 4', hx, hy, { boyut: 28, formul: true, renk: 'turkuaz', alfa: pencere(t, 1.2, 1.8, 3.8, 4.3) });
    // düz düzlem etiketleri
    const d = duz({ x: ox - K.w / 2, y: oy - K.h / 2, w: K.w, h: K.h, u });
    etiketler(ctx, d, { adim: 2, alfa: ara(t, 10.2, 11.0) });
    if (t > 10.2) vCiz(ctx, d, 2, -4, 0, { sol: 'mercan', sag: 'turkuaz', alfa: ara(t, 10.2, 10.6), parilti: 1 });
    // Panel
    const P = PANEL();
    const pA = ara(t, 10.6, 11.2);
    if (pA > 0) {
      ctx.save(); ctx.globalAlpha *= pA;
      E.panel(ctx, P.x, P.y, P.w, P.h, { vurgu: 'mercan' });
      const y = (h2, v) => P.y + yd(h2, v);
      E.yazi(ctx, 'KATLAMA', P.x + 28, y(34, 32), { boyut: 22, agirlik: 700, harfAra: 4, renk: 'mercan', hiza: 'left' });
      const fb = yd(32, 28);
      E.formul(ctx, '\\c{turkuaz}{2x − 4}', P.x + 40, y(108, 78), { boyut: fb, hiza: 'left', alfa: ara(t, 11.2, 11.8) });
      E.formul(ctx, 'x \\ge 2', P.x + P.w - 40, y(108, 78), { boyut: fb, hiza: 'right', renk: 'gumus', alfa: ara(t, 11.2, 11.8) });
      E.yazi(ctx, 'sağ kol: aynı kaldı', P.x + 40, y(150, 0), { boyut: 24, renk: 'gumus', hiza: 'left', alfa: H ? ara(t, 11.6, 12.2) : 0 });
      E.formul(ctx, '\\c{mercan}{−(2x − 4)} = −2x + 4', P.x + 40, y(212, 128), { boyut: fb, hiza: 'left', alfa: ara(t, 12.4, 13.0) });
      E.formul(ctx, 'x < 2', P.x + P.w - 40, y(212, 128), { boyut: fb, hiza: 'right', renk: 'gumus', alfa: ara(t, 12.4, 13.0) });
      E.yazi(ctx, 'sol kol: ters döndü', P.x + 40, y(254, 0), { boyut: 24, renk: 'gumus', hiza: 'left', alfa: H ? ara(t, 12.8, 13.4) : 0 });
      // parçalı birleşim
      const bA = ara(t, 15.0, 15.8, 'cik3');
      if (bA > 0) {
        const yc = y(388, 228), sat = yd(34, 28), bx0 = P.x + yd(40, 50), fb2 = yd(32, 28);
        E.cizgi(ctx, [[P.x + 28, yc - yd(80, 60)], [P.x + P.w - 28, yc - yd(80, 60)]], { renk: 'sis', kalinlik: 1.5, alfa: bA });
        E.formul(ctx, '|2x − 4| =', bx0, yc, { boyut: fb2, hiza: 'left', alfa: bA, parilti: 0.2 });
        const bx = bx0 + E.formulOlc(ctx, '|2x − 4| =', fb2).w + 10;
        parantez(ctx, bx, yc - sat - 18, yc + sat + 18, { alfa: bA, w: 16 });
        E.formul(ctx, '\\c{turkuaz}{2x − 4},', bx + 28, yc - sat, { boyut: fb2, hiza: 'left', alfa: bA });
        E.formul(ctx, '\\c{mercan}{−2x + 4},', bx + 28, yc + sat, { boyut: fb2, hiza: 'left', alfa: bA });
        E.formul(ctx, 'x \\ge 2', bx + yd(210, 200), yc - sat, { boyut: fb2 * 0.92, hiza: 'left', renk: 'gumus', alfa: bA });
        E.formul(ctx, 'x < 2', bx + yd(210, 200), yc + sat, { boyut: fb2 * 0.92, hiza: 'left', renk: 'gumus', alfa: bA });
        E.isik(ctx, bx + 120, yc, 260, 'limon', 0.25 * E.nabiz(t, 15.0, 1.2));
      }
      ctx.restore();
    }
  };

  /* ---------- 4. Kaydır ve parçalı yaz: m(x) = |2x − 4| − 1 ---------- */
  const kaydir = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = duz(KUTU());
    d.ciz(ctx, { adim: 1, etiketAdim: 2 });
    const c = kf(t, [[0.8, 0], [2.2, -1]]);
    vCiz(ctx, d, 2, -4, 0, { renk: 'gumus', kalinlik: 2, parilti: 0, kesik: [8, 8], alfa: 0.7 * ara(t, 0.8, 1.2) });
    const okA = pencere(t, 0.8, 1.1, 2.6, 3.0);
    if (Math.abs(c) > 0.1) for (const x of [0.5, 3.5]) E.ok(ctx, d.px(x), d.py(Math.abs(2 * x - 4)), d.px(x), d.py(Math.abs(2 * x - 4) + c), { renk: 'limon', kalinlik: 3, okBoy: 12, alfa: okA });
    vCiz(ctx, d, 2, -4, c, { sol: 'mercan', sag: 'turkuaz' });
    const za = ara(t, 2.6, 3.1);
    for (const [x, ad, hz, dx] of [[1.5, '1,5', 'right', -0.95], [2.5, '2,5', 'left', 0.95]]) {
      E.nokta(ctx, d.px(x), d.py(0), 9, { renk: 'limon', parilti: 1.4, alfa: za });
      E.etiket(ctx, ad, d.px(x + dx), d.py(0.75), { boyut: 26, renk: 'limon', alfa: ara(t, 7.4, 8.0) });
    }
    E.nokta(ctx, d.px(2), d.py(-1), 8, { renk: 'tebesir', parilti: 1, alfa: ara(t, 8.8, 9.2) });
    E.etiket(ctx, 'T(2,\\,−1)', d.px(2), d.py(-2.1), { boyut: 26, formul: true, renk: 'tebesir', alfa: ara(t, 8.8, 9.4) });
    // Panel
    const P = PANEL(), cx = P.x + P.w / 2;
    E.panel(ctx, P.x, P.y, P.w, P.h, { alfa: ara(t, 0, 0.6), vurgu: 'turkuaz' });
    const y = (h2, v) => P.y + yd(h2, v);
    E.yazi(ctx, 'KAYDIR VE PARÇALI YAZ', P.x + 28, y(34, 32), { boyut: 22, agirlik: 700, harfAra: 4, renk: 'turkuaz', hiza: 'left' });
    E.formul(ctx, 'm(x) = |2x − 4| \\c{limon}{− 1}', cx, y(102, 78), { boyut: yd(36, 32), alfa: ara(t, 0.4, 1.0) });
    const bA = ara(t, 4.0, 4.6, 'cik3');
    const yc = y(214, 158), sat = yd(34, 26), fb = yd(30, 27), bx0 = P.x + yd(50, 60);
    E.formul(ctx, 'm(x) =', bx0, yc, { boyut: fb, hiza: 'left', alfa: bA });
    const bx = bx0 + E.formulOlc(ctx, 'm(x) =', fb).w + 10;
    parantez(ctx, bx, yc - sat - 16, yc + sat + 16, { alfa: bA, w: 16 });
    E.formul(ctx, '\\c{turkuaz}{2x − 4 − 1 = 2x − 5},', bx + 28, yc - sat, { boyut: fb, hiza: 'left', alfa: bA, aciga: ara(t, 4.0, 5.0, 'lin') });
    E.formul(ctx, '\\c{mercan}{−2x + 4 − 1 = −2x + 3},', bx + 28, yc + sat, { boyut: fb, hiza: 'left', alfa: ara(t, 4.8, 5.3), aciga: ara(t, 4.8, 5.8, 'lin') });
    E.formul(ctx, 'x \\ge 2', P.x + P.w - 28, yc - sat, { boyut: fb * 0.9, hiza: 'right', renk: 'gumus', alfa: bA });
    E.formul(ctx, 'x < 2', P.x + P.w - 28, yc + sat, { boyut: fb * 0.9, hiza: 'right', renk: 'gumus', alfa: ara(t, 4.8, 5.3) });
    if (H) {
      E.formul(ctx, '2x − 5 = 0 \\Rightarrow x = \\c{limon}{2{,}5}', cx, y(330, 0), { boyut: 30, alfa: ara(t, 7.4, 8.0) });
      E.formul(ctx, '−2x + 3 = 0 \\Rightarrow x = \\c{limon}{1{,}5}', cx, y(388, 0), { boyut: 30, alfa: ara(t, 7.8, 8.4) });
      E.formul(ctx, '\\t{Tepe: } (2,\\,−1)', cx, y(452, 0), { boyut: 30, renk: 'tebesir', alfa: ara(t, 8.8, 9.4) });
    } else {
      E.formul(ctx, '\\t{sıfırlar: } x = \\c{limon}{1{,}5} \\quad x = \\c{limon}{2{,}5}', cx, y(0, 232), { boyut: 28, alfa: ara(t, 7.4, 8.0) });
      E.formul(ctx, '\\t{Tepe: } (2,\\,−1)', cx, y(0, 276), { boyut: 28, alfa: ara(t, 8.8, 9.4) });
    }
  };

  /* ---------- 5. Nitel özellikler: tepe, simetri, görüntü, sıfır sayısı ---------- */
  const ozellik = (ctx, s) => {
    const t = s.t, H = E.yatay;
    const d = duz(KUTU());
    d.ciz(ctx, { adim: 1, etiketAdim: 2 });
    const fp = ara(t, 11.8, 13.6, 'io3');
    const sg = Math.cos(Math.PI * fp);
    const c = lerp(kf(t, [[8.2, -1], [8.8, 0], [9.4, 0], [10.2, 1.5], [10.6, 1.5], [11.2, -1]]), 3, fp);
    const f = (x) => sg * Math.abs(2 * x - 4) + c;
    // simetri ekseni
    const sa = ara(t, 0.6, 1.4);
    E.cizgi(ctx, [d.p(2, d.ymin), d.p(2, d.ymax)], { renk: 'limon', kalinlik: 2, kesik: [10, 8], alfa: 0.75 * sa, p: ara(t, 0.6, 1.6) });
    // simetrik nokta çifti
    const sc = pencere(t, 1.6, 2.0, 3.6, 4.0);
    if (sc > 0) {
      const uu = lerp(0.4, 2.4, ara(t, 1.6, 3.6, 'io2'));
      const yy = f(2 - uu);
      E.cizgi(ctx, [d.p(2 - uu, yy), d.p(2 + uu, yy)], { renk: 'limon', kalinlik: 2, kesik: [6, 6], alfa: sc });
      E.nokta(ctx, d.px(2 - uu), d.py(yy), 8, { renk: 'mercan', parilti: 1.2, alfa: sc });
      E.nokta(ctx, d.px(2 + uu), d.py(yy), 8, { renk: 'turkuaz', parilti: 1.2, alfa: sc });
    }
    // görüntü kümesi bandı (y ekseni üzerinde)
    const rb = Math.max(pencere(t, 3.8, 4.4, 11.4, 11.8), ara(t, 13.8, 14.4));
    if (rb > 0) {
      const [a0, a1] = sg > 0 ? [c, d.ymax] : [d.ymin, c];
      E.cizgi(ctx, [d.p(0, a0), d.p(0, a1)], { renk: 'limon', kalinlik: 7, parilti: 1.2, alfa: 0.75 * rb, uc: 'butt' });
      E.nokta(ctx, d.px(0), d.py(c), 8, { renk: 'limon', parilti: 1, alfa: rb });
    }
    // artan / azalan
    const az = pencere(t, 5.4, 5.9, 7.4, 7.8);
    E.etiket(ctx, 'azalan', d.px(-1.9), d.py(1.0), { boyut: 26, renk: 'mercan', alfa: az });
    E.etiket(ctx, 'artan', d.px(5.0), d.py(1.0), { boyut: 26, renk: 'turkuaz', alfa: az });
    const kd = ara(t, 5.6, 7.4, 'io2');
    if (kd > 0 && kd < 1) { const x = lerp(-0.6, 4.6, kd); E.nokta(ctx, d.px(x), d.py(f(x)), 9, { renk: 'limon', parilti: 1.4 }); }
    vCiz(ctx, d, 2, -4, c, { s: sg, sol: 'mercan', sag: 'turkuaz' });
    // tepe
    E.nokta(ctx, d.px(2), d.py(c), 9, { renk: 'tebesir', parilti: 1.2, alfa: ara(t, 0.4, 0.8) });
    // sıfırlar
    let n = 0;
    const kok = (sg !== 0 && -c / sg >= -1e-9) ? -c / sg : null;
    if (kok !== null) {
      const zs = kok < 0.04 ? [2] : [2 - kok / 2, 2 + kok / 2];
      n = zs.length;
      for (const z of zs) E.nokta(ctx, d.px(z), d.py(0), 9, { renk: 'limon', parilti: 1.4, alfa: ara(t, 7.8, 8.2) * (fp > 0.05 && fp < 0.95 ? 0 : 1) });
    }
    if (fp > 0.95) {
      const za = ara(t, 13.8, 14.3);
      E.etiket(ctx, '0,5', d.px(0.5), d.py(-1.2), { boyut: 26, renk: 'limon', alfa: za });
      E.etiket(ctx, '3,5', d.px(3.5), d.py(-1.2), { boyut: 26, renk: 'limon', alfa: za });
      E.etiket(ctx, 'en büyük: 3', d.px(2), d.py(3.9), { boyut: 26, renk: 'tebesir', alfa: ara(t, 13.4, 14.0) });
    }
    // Panel: kimlik
    const P = PANEL();
    const sa2 = (t0) => ara(t, t0, t0 + 0.5, 'cik3');
    const vur = (a0, b0) => pencere(t, a0, a0 + 0.3, b0, b0 + 0.4);
    const canli = fp < 0.5 ? `c = ${sy(c, 1)} \\Rightarrow \\t{${n} sıfır}` : (H ? '−|2x − 4| + 3: \\t{ en büyük } 3' : '\\t{en büyük } 3');
    kart(ctx, {
      ...P, alfa: ara(t, 0, 0.6), renk: 'menekse', baslik: 'm(x) = ±|ax + b| + c', bBoyut: yd(30, 28),
      satirlar: [
        { ad: 'Tepe noktası', deger: '(−b/a,\\; c)', alfa: sa2(0.6), vurgu: vur(0.6, 1.4) },
        { ad: 'Simetri ekseni', deger: 'x = −b/a', alfa: sa2(1.4), vurgu: vur(1.4, 3.6) },
        { ad: 'Görüntü kümesi', deger: H ? '+: [c, \\infty) \\quad −: (−\\infty, c]' : '[c, \\infty) \\; / \\; (−\\infty, c]', alfa: sa2(4.0), vurgu: Math.max(vur(4.0, 5.2), vur(13.8, 16.0)) },
        { ad: H ? 'Artan / azalan' : 'Artanlık', deger: '\\t{tepede yön değişir}', alfa: sa2(5.6), vurgu: vur(5.6, 7.4) },
        { ad: 'Sıfır sayısı', deger: '0, 1 \\t{ ya da } 2', alfa: sa2(7.8), vurgu: vur(7.8, 11.4) },
        { ad: fp < 0.5 ? (H ? 'Örnek: |2x − 4| + c' : 'Örnek') : (H ? 'Örnek' : '−|2x − 4| + 3'), deger: canli, alfa: sa2(8.0), vurgu: 0.6 * ara(t, 8.2, 8.6) },
      ],
    });
  };

  /* ---------- Özet ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Mutlak değer, eksenin altını yukarı katlar.', formul: '|h(x)| \\ge 0' },
    { tr: 'Kırılma, h’nin sıfırında olur.', formul: 'x = −\\frac{b}{a}' },
    { tr: 'Tepe ve simetri ekseni aynı yerde.', formul: 'T(−\\frac{b}{a},\\; c)' },
    { tr: 'Her kol bir doğru: parçalı yaz.', formul: '|2x − 4| = ±(2x − 4)' },
  ], { aralik: 1.6 });

  /* ---------- Film ---------- */
  E.film({
    meta,
    sure: 102.5,
    sahneler: [
      { ad: 'Soğuk açılış: durağa uzaklık', bas: 0, son: 10.5, giris: 0, cikis: 0.7, ciz: acilis },
      { ad: 'İmza', bas: 10.2, son: 13.9, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 13.6, son: 17.8, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'x ve |x|: benzer ama aynı değil', bas: 17.5, son: 35.0, ciz: xMutlak },
      { ad: 'Katla: |2x − 4|', bas: 34.7, son: 55.0, ciz: katla },
      { ad: 'Kaydır ve parçalı yaz', bas: 54.7, son: 67.5, ciz: kaydir },
      { ad: 'Tepe, simetri, sıfır sayısı', bas: 67.2, son: 86.0, ciz: ozellik },
      { ad: 'Aklında kalsın', bas: 85.7, son: 96.0, ciz: ozet },
      { ad: 'Laboratuvar', bas: 95.8, son: 102.5, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 6, renk2: 'mercan' }),
  });
})();
