/* ==========================================================================
   EKSEN 9.1.2 — Işık Aralıkları
   Tek fikir: Aralık, sayı doğrusuna düşen bir ışık hüzmesidir. Kapalı uç dolu
   ışık noktası, açık uç içi boş halka. Küme işlemleri ışığın davranışıdır;
   mutlak değer ise merkezi ve yarıçapı olan bir projektördür.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp } = E;

  const meta = {
    kod: 'MAT.9.1.2',
    tema: 'Sayılar',
    ad: 'Işık Aralıkları',
    adEn: 'Intervals of Light',
    labAd: 'Sayılar Laboratuvarı',
    labAciklama: 'Aralık tezgâhında iki ışını sürükle: birleşim, kesişim, fark ve tümleme anında yansın.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-sayilar/',
  };

  /* ---------- Yardımcılar ---------- */
  const ondalik = (v, b = 1) => v.toFixed(b).replace('.', ',').replace('-', '−');

  /** Küme parantezli formül: { içerik }. Mini TeX'te \{ \} olmadığı için yerel çözüm. */
  const kume = (ctx, ic, x, y, o = {}) => {
    const b = o.boyut || 36, al = o.alfa ?? 1;
    if (al <= 0.002) return;
    const m = E.formulOlc(ctx, ic, b);
    const bw = b * 0.5, tw = m.w + bw * 2;
    const x0 = o.hiza === 'left' ? x : o.hiza === 'right' ? x - tw : x - tw / 2;
    E.formul(ctx, ic, x0 + bw, y, Object.assign({}, o, { hiza: 'left' }));
    ctx.save(); ctx.globalAlpha *= al; ctx.fillStyle = E.R(o.renk || 'tebesir');
    ctx.font = `400 ${b * 1.12}px ${E.FONT.sans}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText('{', x0 + bw * 0.42, y - b * 0.04); ctx.fillText('}', x0 + tw - bw * 0.42, y - b * 0.04);
    ctx.restore();
  };

  /** Işık hüzmesi: yumuşak hale + parlak çekirdek + uç noktaları. Toplamalı: üst üste binen ışık beyazlaşır. */
  const huzme = (ctx, d, a, b, o = {}) => {
    o = Object.assign({ renk: 'turkuaz', dy: 0, p: 1, alfa: 1, acikSol: false, acikSag: false, kalinlik: 7, r: 9, hale: 1, uc: true }, o);
    if (o.alfa <= 0.002 || o.p <= 0) return;
    const xa = a === -Infinity ? d.x - 30 : d.px(a), xb = b === Infinity ? d.x + d.w + 30 : d.px(b);
    const xm = (xa + xb) / 2, yar = ((xb - xa) / 2) * o.p;
    const y = d.y + o.dy;
    ctx.save(); ctx.globalAlpha *= o.alfa;
    if (o.hale > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(0, y - 40, 0, y + 40);
      g.addColorStop(0, E.rgba(o.renk, 0)); g.addColorStop(0.5, E.rgba(o.renk, 0.2 * o.hale)); g.addColorStop(1, E.rgba(o.renk, 0));
      ctx.fillStyle = g; ctx.fillRect(xm - yar, y - 40, yar * 2, 80);
      ctx.restore();
    }
    E.cizgi(ctx, [[xm - yar, y], [xm + yar, y]], { renk: o.renk, kalinlik: o.kalinlik, parilti: 1, uc: 'butt' });
    // sonsuz uçlar: ok başı
    const okBas = (x, yon) => {
      ctx.save(); ctx.fillStyle = E.R(o.renk); ctx.beginPath();
      ctx.moveTo(x + yon * 16, y); ctx.lineTo(x - yon * 2, y - 11); ctx.lineTo(x - yon * 2, y + 11); ctx.closePath(); ctx.fill(); ctx.restore();
    };
    if (o.p > 0.98) {
      if (a === -Infinity) okBas(xa, -1);
      if (b === Infinity) okBas(xb, 1);
      if (o.uc) {
        if (a !== -Infinity) E.nokta(ctx, xa, y, o.r, { renk: o.renk, bos: !!o.acikSol, parilti: 0.9 });
        if (b !== Infinity) E.nokta(ctx, xb, y, o.r, { renk: o.renk, bos: !!o.acikSag, parilti: 0.9 });
      }
    }
    ctx.restore();
  };

  /** Gölge bandı: ışığı kesen karanlık parça (fark ve tümleme için) */
  const golge = (ctx, d, a, b, y, alfa) => {
    if (alfa <= 0.002) return;
    const xa = a === -Infinity ? d.x - 40 : d.px(a), xb = b === Infinity ? d.x + d.w + 40 : d.px(b);
    ctx.save(); ctx.globalAlpha *= alfa;
    const g = ctx.createLinearGradient(0, y - 30, 0, y + 30);
    g.addColorStop(0, E.rgba('gece', 0)); g.addColorStop(0.3, E.rgba('gece', 0.96)); g.addColorStop(0.7, E.rgba('gece', 0.96)); g.addColorStop(1, E.rgba('gece', 0));
    ctx.fillStyle = g; ctx.fillRect(xa, y - 30, xb - xa, 60);
    ctx.setLineDash([5, 6]); ctx.strokeStyle = E.rgba('cizgi', 0.9); ctx.lineWidth = 1.5;
    ctx.strokeRect(xa, y - 16, xb - xa, 32);
    ctx.restore();
  };

  /** Basit çıplak eksen (ince çizgi + çentikler, etiketsiz) */
  const iz = (ctx, d, y, alfa) => {
    if (alfa <= 0.002) return;
    E.cizgi(ctx, [[d.x - 24, y], [d.x + d.w + 24, y]], { renk: 'sis', kalinlik: 2, alfa });
    for (let v = Math.ceil(d.min); v <= d.max; v++) E.cizgi(ctx, [[d.px(v), y - 6], [d.px(v), y + 6]], { renk: 'sis', kalinlik: 1.5, alfa });
  };

  /* ---------- 1. Soğuk açılış: aşı dolabı ---------- */
  const acilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const pw = H ? 560 : 620, ph = H ? 180 : 200;
    const px = L.cx - pw / 2, py = H ? ic.y + 20 : ic.y + 40;
    const ay = H ? ic.y + 340 : ic.y + 440;
    const ty = H ? ic.y + 462 : ic.y + 620;
    const d = E.sayiDogrusu({ x: H ? 160 : 80, y: ay, w: H ? 960 : 560, min: -2, max: 12 });
    // kamera: önce ekrana yakın, sonra geri çekil
    const q = ara(t, 2.2, 4.2, 'io3');
    const z = lerp(H ? 1.3 : 1.12, 1, q);
    ctx.save();
    E.kamera(ctx, { x: lerp(L.cx, L.cx, q), y: lerp(py + ph / 2, L.cy, q), z });
    // dolap ışığı
    E.isik(ctx, L.cx, py + ph / 2, H ? 520 : 420, 'turkuaz', 0.16 * ara(t, 0, 1.2));
    // sıcaklık
    const T = kf(t, [[0, 5.4], [3.6, 5.5], [6.6, 8.0, 'io3']]) + 0.12 * Math.sin(t * 2.1) * (1 - ara(t, 3.6, 6.6));
    const Tg = Math.round(T * 10) / 10;
    const pa = ara(t, 0.2, 1.0);
    E.panel(ctx, px, py, pw, ph, { vurgu: 'turkuaz', alfa: pa });
    E.yazi(ctx, 'AŞI DOLABI', px + 30, py + 36, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'turkuaz', hiza: 'left', alfa: pa });
    E.yazi(ctx, '03:12', px + pw - 28, py + 36, { boyut: 22, agirlik: 500, font: 'mono', renk: 'gumus', hiza: 'right', alfa: pa });
    E.yazi(ctx, ondalik(Tg) + ' °C', px + 30, py + 100, { boyut: 72, agirlik: 600, font: 'mono', hiza: 'left', alfa: pa, parilti: 0.25 + 0.5 * E.nabiz(t, 6.4, 1.2), parRenk: 'turkuaz' });
    const kenar = E.nabiz(t, 6.4, 1.6);
    E.yazi(ctx, '● UYGUN', px + pw - 28, py + 100, { boyut: 24, agirlik: 700, renk: E.karistir('turkuaz', 'limon', kenar), hiza: 'right', alfa: pa * (0.75 + 0.25 * Math.sin(t * 4)) });
    E.yazi(ctx, 'Saklama: 2 °C ile 8 °C arası', px + 30, py + 152, { boyut: 24, agirlik: 500, renk: 'gumus', hiza: 'left', alfa: pa });
    // sayı doğrusu (termometre)
    const dp = ara(t, 3.3, 4.5, 'io2');
    d.ciz(ctx, { adim: 1, etiketAdim: 2, p: dp, alfa: dp > 0 ? 1 : 0, boyut: H ? 24 : 22 });
    E.yazi(ctx, '°C', d.x + d.w + 30, ay - 34, { boyut: 22, renk: 'gumus', agirlik: 600, alfa: dp });
    // hüzme [2, 8]
    const hp = ara(t, 4.5, 5.6, 'io3');
    huzme(ctx, d, 2, 8, { p: hp, renk: 'turkuaz' });
    // ölçüm iğnesi
    const ia = ara(t, 3.8, 4.3);
    if (ia > 0) {
      const x = d.px(T);
      E.cizgi(ctx, [[x, ay - 62], [x, ay - 14]], { renk: 'limon', kalinlik: 2, alfa: ia * 0.8 });
      E.nokta(ctx, x, ay - 66, 7, { renk: 'limon', parilti: 1.2, alfa: ia });
    }
    // 8 sınırda: nabız
    const n8 = E.nabiz(t, 6.5, 1.4);
    E.isik(ctx, d.px(8), ay, 120, 'limon', 0.5 * n8);
    ctx.restore();
    // yazılar (kamera dışında)
    const s1 = ara(t, 6.6, 7.2) * (1 - ara(t, 8.4, 8.8));
    E.yazi(ctx, '8 °C tam sınırda. İçeride mi?', L.cx, ty, { boyut: H ? 40 : 36, agirlik: 640, alfa: s1, maxGen: ic.w - 40 });
    const s2 = ara(t, 8.8, 9.5, 'cik3');
    E.yazi(ctx, 'Sınırda olmak da içeride olmaktır.', L.cx, ty, { boyut: H ? 42 : 38, agirlik: 700, renk: 'limon', alfa: s2, parilti: 0.35, parRenk: 'limon', maxGen: ic.w - 40 });
    E.formul(ctx, '[2,\\, 8]', d.px(5), ay - 70, { boyut: 40, renk: 'turkuaz', alfa: ara(t, 9.0, 9.6), parilti: 0.4 });
  };

  /* ---------- 4. Tek ışın, üç yazılış ---------- */
  const DURUM = [
    { es: '2 \\le x \\le 8', ar: '[2,\\, 8]', ku: 'x \\in \\R \\;|\\; 2 \\le x \\le 8', sol: false, sag: false },
    { es: '2 < x < 8', ar: '(2,\\, 8)', ku: 'x \\in \\R \\;|\\; 2 < x < 8', sol: true, sag: true },
    { es: '2 \\le x < 8', ar: '[2,\\, 8)', ku: 'x \\in \\R \\;|\\; 2 \\le x < 8', sol: false, sag: true },
    { es: 'x \\le 8', ar: '(−\\infty,\\, 8]', ku: 'x \\in \\R \\;|\\; x \\le 8', sol: true, sag: false, sonsuz: true },
  ];
  const ucYazilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const ay = H ? ic.y + 92 : ic.y + 64;
    const d = E.sayiDogrusu({ x: H ? 160 : 80, y: ay, w: H ? 960 : 560, min: -2, max: 12 });
    const dp = ara(t, 0, 0.9);
    d.ciz(ctx, { adim: 1, etiketAdim: 2, p: dp, boyut: H ? 24 : 22 });
    // hangi durum? 0: [2,8]  1: (2,8)  2: [2,8)  3: (−∞, 8]
    const gecis = [6.2, 8.8, 11.4];
    let k = 0; for (const g of gecis) if (t >= g) k++;
    const D = DURUM[k];
    const deg = (g) => E.nabiz(t, g - 0.1, 0.6);
    const flas = gecis.reduce((a, g) => a + deg(g), 0);
    const sonsuzP = ara(t, 11.4, 12.4, 'io3');
    const a = lerp(2, d.min - 0.43, sonsuzP);
    huzme(ctx, d, k === 3 && sonsuzP > 0.99 ? -Infinity : a, 8, { p: ara(t, 0.4, 1.4), acikSol: D.sol && k !== 3, acikSag: D.sag });
    E.isik(ctx, d.px(5), ay, 400, 'turkuaz', 0.25 * flas);
    // ışın → panellere ışık çizgileri
    const pa = (i) => ara(t, 1.6 + i * 0.9, 2.4 + i * 0.9, 'cik3');
    const baslik = ['EŞİTSİZLİK', 'ARALIK', 'KÜME'];
    const ps = [];
    if (H) {
      const pw = 352, ph = 156, gap = 22, x0 = L.cx - (pw * 3 + gap * 2) / 2, y0 = ic.y + 250;
      for (let i = 0; i < 3; i++) ps.push([x0 + i * (pw + gap), y0, pw, ph]);
    } else {
      const pw = 620, ph = 150, gap = 24, y0 = ic.y + 186;
      for (let i = 0; i < 3; i++) ps.push([L.cx - pw / 2, y0 + i * (ph + gap), pw, ph]);
    }
    ps.forEach(([x, y, w, h], i) => {
      const al = pa(i);
      if (al <= 0) return;
      // ışık sızıntısı: hüzmeden panele
      if (H) {
        const g = ctx.createLinearGradient(0, ay + 40, 0, y);
        g.addColorStop(0, E.rgba('turkuaz', 0)); g.addColorStop(1, E.rgba('turkuaz', 0.16 * al));
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(d.px(4.6), ay + 40); ctx.lineTo(d.px(5.4), ay + 40); ctx.lineTo(x + w * 0.8, y); ctx.lineTo(x + w * 0.2, y); ctx.closePath(); ctx.fill(); ctx.restore();
      }
      E.panel(ctx, x, y, w, h, { vurgu: i === 1 ? 'limon' : 'turkuaz', alfa: al });
      const bx = H ? x + w / 2 : x + 30;
      E.yazi(ctx, baslik[i], bx, H ? y + 34 : y + h / 2, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'gumus', alfa: al, hiza: H ? 'center' : 'left' });
      const fx = H ? x + w / 2 : x + w - 30, fy = H ? y + 98 : y + h / 2, hz = H ? 'center' : 'right';
      const fb = H ? 36 : 38;
      const op = { boyut: fb, alfa: al, hiza: hz, renk: i === 1 ? 'limon' : 'tebesir', parilti: 0.3 * flas };
      if (i === 0) E.formul(ctx, D.es, fx, fy, op);
      if (i === 1) E.formul(ctx, D.ar, fx, fy, op);
      if (i === 2) kume(ctx, D.ku, fx, fy, Object.assign({}, op, { boyut: H ? 32 : 34 }));
    });
    // kural satırı
    const ky = H ? ic.y1 - 44 : ic.y1 - 40;
    const ka = ara(t, 6.8, 7.5) * (1 - ara(t, 11.0, 11.4));
    E.formul(ctx, '\\c{turkuaz}{[\\;\\;]}\\t{ kapalı uç: dahil}\\qquad \\c{mercan}{(\\;\\;)}\\t{ açık uç: dahil değil}', L.cx, ky, { boyut: H ? 30 : 26, alfa: ka });
    const ka2 = ara(t, 12.2, 12.9);
    E.yazi(ctx, '∞ bir sayı değil: yanındaki parantez hep açık.', L.cx, ky, { boyut: H ? 30 : 28, agirlik: 600, renk: 'limon', alfa: ka2, maxGen: ic.w - 20 });
  };

  /* ---------- 5. Hayattan aralıklar: probleme uygun sembol ---------- */
  const KART = [
    { ad: 'Sınavı geçme notu', kosul: '50 \\le n \\le 100', ar: '[50,\\, 100]', min: 0, max: 100, adim: 10, ea: 50, a: 50, b: 100, sol: false, sag: false, renk: 'turkuaz' },
    { ad: 'Ehliyet yaşı (B sınıfı)', kosul: 'y \\ge 18', ar: '[18,\\, \\infty)', min: 0, max: 40, adim: 2, ea: 18, a: 18, b: Infinity, sol: false, sag: true, renk: 'gok' },
    { ad: 'Dondurucu: −18 °C ve altı', kosul: 'T \\le \\minus 18', ar: '(−\\infty,\\, \\minus 18]', min: -40, max: 10, adim: 2, ea: 18, a: -Infinity, b: -18, sol: true, sag: false, renk: 'menekse' },
  ];
  const hayat = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    KART.forEach((k, i) => {
      const t0 = 0.4 + i * 2.9;
      const al = ara(t, t0, t0 + 0.7, 'cik3');
      if (al <= 0) return;
      let x, y, w, h;
      if (H) { w = 362; h = 420; x = L.cx - (w * 3 + 48) / 2 + i * (w + 24); y = ic.y + 36; }
      else { w = 640; h = 236; x = ic.x; y = ic.y + 14 + i * (h + 18); }
      const kay = (1 - al) * 30;
      y += kay;
      E.panel(ctx, x, y, w, h, { vurgu: k.renk, alfa: al });
      const lp = ara(t, t0 + 0.6, t0 + 1.5, 'io3');
      const sembol = ara(t, t0 + 1.6, t0 + 2.2, 'cik3');
      const fl = E.nabiz(t, t0 + 1.6, 0.9);
      if (H) {
        E.yazi(ctx, k.ad, x + w / 2, y + 52, { boyut: 26, agirlik: 640, alfa: al, maxGen: w - 40 });
        E.formul(ctx, k.kosul, x + w / 2, y + 130, { boyut: 36, renk: 'gumus', alfa: al * ara(t, t0 + 0.3, t0 + 0.9) });
        const d = E.sayiDogrusu({ x: x + 46, y: y + 228, w: w - 92, min: k.min, max: k.max });
        d.ciz(ctx, { adim: k.adim, etiketAdim: k.ea, p: lp, boyut: 22, cubuk: 9 });
        huzme(ctx, d, k.a, k.b, { renk: k.renk, p: lp, acikSol: k.sol, acikSag: k.sag, kalinlik: 6, r: 8 });
        E.isik(ctx, x + w / 2, y + 340, 160, k.renk, 0.3 * fl);
        E.formul(ctx, k.ar, x + w / 2, y + 340, { boyut: 48, renk: k.renk, alfa: sembol, parilti: 0.3 + fl });
      } else {
        E.yazi(ctx, k.ad, x + 30, y + 42, { boyut: 26, agirlik: 640, alfa: al, hiza: 'left', maxGen: 380 });
        E.formul(ctx, k.kosul, x + w - 30, y + 42, { boyut: 32, renk: 'gumus', hiza: 'right', alfa: al * ara(t, t0 + 0.3, t0 + 0.9) });
        const d = E.sayiDogrusu({ x: x + 44, y: y + 128, w: 330, min: k.min, max: k.max });
        d.ciz(ctx, { adim: k.adim, etiketAdim: k.ea, p: lp, boyut: 22, cubuk: 9 });
        huzme(ctx, d, k.a, k.b, { renk: k.renk, p: lp, acikSol: k.sol, acikSag: k.sag, kalinlik: 6, r: 8 });
        E.isik(ctx, x + w - 120, y + 140, 150, k.renk, 0.3 * fl);
        E.formul(ctx, k.ar, x + w - 120, y + 140, { boyut: 44, renk: k.renk, alfa: sembol, parilti: 0.3 + fl });
      }
    });
    // alt mesaj
    const ma = ara(t, 9.4, 10.1);
    if (H) E.yazi(ctx, 'Önce durumu oku, sonra ucu seç: dahil mi, değil mi?', L.cx, ic.y1 - 26, { boyut: 30, agirlik: 600, renk: 'limon', alfa: ma });
  };

  /* ---------- 6. Işığın işlemleri: ∪ ∩ \ ′ ---------- */
  const A = [-2, 4], B = [1, 6];
  const ISLEM = [
    { t0: 3.0, t1: 7.6, tur: 'birlesim', ad: 'A \\cup B', sonuc: '[\\minus 2,\\, 6]', parca: [[-2, 6, false, false]], ger: '−2 ∈ A, 6 ∈ B: iki uç da kapalı' },
    { t0: 7.6, t1: 12.2, tur: 'kesisim', ad: 'A \\cap B', sonuc: '(1,\\, 4)', parca: [[1, 4, true, true]], ger: '1 ∉ B ve 4 ∉ A: iki uç da açık' },
    { t0: 12.2, t1: 17.0, tur: 'farkAB', ad: 'A \\setminus B', sonuc: '[\\minus 2,\\, 1]', parca: [[-2, 1, false, false]], ger: '1 ∉ B olduğu için 1 ∈ A \\ B: uç kapalı' },
    { t0: 17.0, t1: 21.6, tur: 'farkBA', ad: 'B \\setminus A', sonuc: '[4,\\, 6]', parca: [[4, 6, false, false]], ger: '4 ∉ A olduğu için 4 ∈ B \\ A: uç kapalı' },
    { t0: 21.6, t1: 28.0, tur: 'tumleme', ad: 'A′', sonuc: '(−\\infty,\\, \\minus 2) \\cup [4,\\, \\infty)', parca: [[-Infinity, -2, false, true], [4, Infinity, false, false]], ger: 'Evrensel küme ℝ: A’nın dışında kalan her şey' },
  ];
  const islemler = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const dx = H ? 250 : 80, dw = H ? 640 : 560;
    const yA = H ? ic.y + 70 : ic.y + 100, yB = H ? ic.y + 170 : ic.y + 260, yR = H ? ic.y + 310 : ic.y + 450;
    const d = E.sayiDogrusu({ x: dx, y: yR, w: dw, min: -4, max: 8 });
    const g0 = ara(t, 0.2, 1.4);
    // kılavuz çizgileri
    for (const v of [-2, 1, 4, 6]) {
      E.cizgi(ctx, [[d.px(v), yA - 30], [d.px(v), yR + 16]], { renk: 'sis', kalinlik: 1.2, kesik: [4, 7], alfa: g0 * 0.9 });
    }
    iz(ctx, d, yA, g0); iz(ctx, d, yB, g0);
    d.ciz(ctx, { adim: 1, etiketAdim: 1, p: g0, boyut: H ? 24 : 22 });
    // A ve B
    huzme(ctx, d, A[0], A[1], { dy: yA - yR, renk: 'turkuaz', acikSag: true, p: ara(t, 0.6, 1.6) });
    huzme(ctx, d, B[0], B[1], { dy: yB - yR, renk: 'mercan', acikSol: true, p: ara(t, 1.2, 2.2) });
    // etiketler
    if (H) {
      E.formul(ctx, '\\c{turkuaz}{A}', ic.x + 40, yA, { boyut: 44, alfa: ara(t, 0.6, 1.2) });
      E.formul(ctx, '\\c{mercan}{B}', ic.x + 40, yB, { boyut: 44, alfa: ara(t, 1.2, 1.8) });
      E.formul(ctx, '[\\minus 2,\\, 4)', ic.x1 - 20, yA, { boyut: 38, hiza: 'right', renk: 'turkuaz', alfa: ara(t, 1.0, 1.6) });
      E.formul(ctx, '(1,\\, 6]', ic.x1 - 20, yB, { boyut: 38, hiza: 'right', renk: 'mercan', alfa: ara(t, 1.6, 2.2) });
    } else {
      E.formul(ctx, '\\c{turkuaz}{A} = [\\minus 2,\\, 4)', ic.x + 10, yA - 52, { boyut: 34, hiza: 'left', renk: 'turkuaz', alfa: ara(t, 0.6, 1.2) });
      E.formul(ctx, '\\c{mercan}{B} = (1,\\, 6]', ic.x + 10, yB - 52, { boyut: 34, hiza: 'left', renk: 'mercan', alfa: ara(t, 1.2, 1.8) });
    }
    // sonuç rayı etiketi
    E.yazi(ctx, 'SONUÇ', H ? ic.x + 40 : ic.x1 - 10, H ? yR - 2 : yR - 54, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'gumus', alfa: g0 * 0.9, hiza: H ? 'center' : 'right' });

    for (const op of ISLEM) {
      if (t < op.t0 - 0.05 || t > op.t1 + 0.05) continue;
      const u = t - op.t0, dur = op.t1 - op.t0;
      const son = 1 - ara(u, dur - 0.5, dur);
      const dus = ara(u, 0.15, 1.2, 'io3');
      const sonucA = ara(u, 1.3, 1.9);
      const kopyaA = (1 - sonucA) * son;
      const yy = (y0) => lerp(y0, yR, dus) - yR;
      // kopyalar
      if (kopyaA > 0.002) {
        if (op.tur === 'tumleme') {
          huzme(ctx, d, -Infinity, Infinity, { renk: 'gok', alfa: kopyaA * ara(u, 0, 0.4), hale: 0.6 });
          golge(ctx, d, A[0], A[1], yR + yy(yA), kopyaA);
        } else if (op.tur === 'farkAB') {
          huzme(ctx, d, A[0], A[1], { dy: yy(yA), renk: 'turkuaz', acikSag: true, alfa: kopyaA });
          golge(ctx, d, B[0], B[1], yR + yy(yB), kopyaA);
        } else if (op.tur === 'farkBA') {
          huzme(ctx, d, B[0], B[1], { dy: yy(yB), renk: 'mercan', acikSol: true, alfa: kopyaA });
          golge(ctx, d, A[0], A[1], yR + yy(yA), kopyaA);
        } else {
          huzme(ctx, d, A[0], A[1], { dy: yy(yA), renk: 'turkuaz', acikSag: true, alfa: kopyaA, uc: op.tur !== 'birlesim' || dus < 1 });
          huzme(ctx, d, B[0], B[1], { dy: yy(yB), renk: 'mercan', acikSol: true, alfa: kopyaA, uc: op.tur !== 'birlesim' || dus < 1 });
          if (op.tur === 'kesisim') E.isik(ctx, d.px(2.5), yR, 200, 'tebesir', 0.3 * E.nabiz(u, 1.0, 0.9));
        }
      }
      // sonuç
      const rA = sonucA * son;
      for (const [a, b, sol, sag] of op.parca) huzme(ctx, d, a, b, { renk: 'limon', acikSol: sol, acikSag: sag, alfa: rA, r: 10 });
      // uç vurgusu: gerekçedeki nokta
      const vur = E.nabiz(u, 2.4, 1.2) * son;
      const vx = { birlesim: null, kesisim: [1, 4], farkAB: [1], farkBA: [4], tumleme: [-2, 4] }[op.tur];
      if (vx) for (const v of vx) E.isik(ctx, d.px(v), yR, 70, 'limon', 0.6 * vur);
      // yazılar
      const fa = ara(u, 1.6, 2.2, 'cik3') * son;
      const ga = ara(u, 2.3, 2.9, 'cik3') * son;
      const ifade = op.ad + ' = ' + op.sonuc;
      if (H) {
        E.formul(ctx, ifade, L.cx, ic.y + 410, { boyut: op.tur === 'tumleme' ? 40 : 44, renk: 'limon', alfa: fa, parilti: 0.25 });
        E.yazi(ctx, op.ger, L.cx, ic.y + 476, { boyut: 30, agirlik: 560, renk: 'gumus', alfa: ga, maxGen: ic.w - 40 });
      } else {
        E.formul(ctx, ifade, L.cx, ic.y + 580, { boyut: op.tur === 'tumleme' ? 32 : 40, renk: 'limon', alfa: fa, parilti: 0.25 });
        E.yazi(ctx, op.ger, L.cx, ic.y + 680, { boyut: 30, agirlik: 560, renk: 'gumus', alfa: ga, maxGen: ic.w - 30 });
      }
    }
  };

  /* ---------- 7. Sürpriz: projektör — mutlak değer ---------- */
  const lamba = (ctx, x, y, al) => {
    if (al <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= al;
    ctx.fillStyle = E.R('lacivert'); ctx.strokeStyle = E.R('cizgi'); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 34, y - 28); ctx.lineTo(x + 34, y - 28); ctx.lineTo(x + 22, y + 10); ctx.lineTo(x - 22, y + 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 28); ctx.lineTo(x, y - 60); ctx.stroke();
    ctx.restore();
    E.nokta(ctx, x, y + 10, 8, { renk: 'tebesir', parilti: 1.4, alfa: al });
  };
  const koni = (ctx, x, y, xa, xb, yz, al, renk = 'turkuaz') => {
    if (al <= 0.002) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, y, 0, yz);
    g.addColorStop(0, E.rgba(renk, 0.34 * al)); g.addColorStop(1, E.rgba(renk, 0.07 * al));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.lineTo(xb, yz); ctx.lineTo(xa, yz); ctx.closePath(); ctx.fill();
    // zemindeki ışık havuzu
    const r = Math.max(4, (xb - xa) / 2);
    ctx.save(); ctx.translate((xa + xb) / 2, yz); ctx.scale(1, 0.16);
    const h = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.1);
    h.addColorStop(0, E.rgba(renk, 0.4 * al)); h.addColorStop(1, E.rgba(renk, 0));
    ctx.fillStyle = h; ctx.beginPath(); ctx.arc(0, 0, r * 1.1, 0, E.TAU); ctx.fill(); ctx.restore();
    ctx.restore();
  };
  const projektor = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik, H = E.yatay;
    const ay = H ? ic.y + 330 : ic.y + 510;
    const ly = H ? ic.y + 70 : ic.y + 210;
    const dx = H ? 160 : 80, dw = H ? 960 : 560;
    // --- Bölüm 1: |x − 5| ≤ 3 → [2, 8]
    const b1 = 1 - ara(t, 11.0, 11.8);
    if (b1 > 0.002) {
      ctx.save(); ctx.globalAlpha *= b1;
      const d = E.sayiDogrusu({ x: dx, y: ay, w: dw, min: H ? -2 : 0, max: H ? 12 : 10 });
      d.ciz(ctx, { adim: 1, etiketAdim: 1, boyut: H ? 24 : 22, p: ara(t, 0, 0.9) });
      const lx = d.px(5);
      lamba(ctx, lx, ly, ara(t, 0.5, 1.2));
      const r = kf(t, [[1.8, 0], [4.4, 3, 'io3']]);
      const acik = ara(t, 8.4, 9.0) > 0.5;
      koni(ctx, lx, ly + 14, d.px(5 - r), d.px(5 + r), ay, ara(t, 1.6, 2.2));
      huzme(ctx, d, 5 - r, 5 + r, { p: r > 0.02 ? 1 : 0, acikSol: acik, acikSag: acik, uc: r > 2.98, renk: 'turkuaz' });
      // merkez ve yarıçap okları
      const oa = ara(t, 3.0, 3.6) * (1 - ara(t, 10.4, 11));
      E.nokta(ctx, lx, ay, 6, { renk: 'limon', parilti: 1, alfa: ara(t, 1.0, 1.5) });
      E.yazi(ctx, 'merkez', lx, ay + 70, { boyut: 22, agirlik: 600, renk: 'limon', alfa: ara(t, 1.2, 1.8) * (1 - ara(t, 10.4, 11)) });
      const oy = ay - 36;
      E.ok(ctx, lx, oy, d.px(5 - r) + 4, oy, { renk: 'limon', kalinlik: 2.5, alfa: oa });
      E.ok(ctx, lx, oy, d.px(5 + r) - 4, oy, { renk: 'limon', kalinlik: 2.5, alfa: oa });
      E.yazi(ctx, '3', (lx + d.px(5 - r)) / 2, oy - 22, { boyut: 26, agirlik: 700, renk: 'limon', alfa: oa });
      E.yazi(ctx, '3', (lx + d.px(5 + r)) / 2, oy - 22, { boyut: 26, agirlik: 700, renk: 'limon', alfa: oa });
      // formüller
      const f1 = ara(t, 1.4, 2.0);
      const kati = t < 8.7;
      const fx = H ? ic.x + 20 : L.cx, fy = H ? ic.y + 40 : ic.y + 36;
      E.formul(ctx, kati ? '|x − 5| \\le 3' : '|x − 5| < 3', fx, fy, { boyut: H ? 44 : 42, hiza: H ? 'left' : 'center', alfa: f1, parilti: 0.3 * E.nabiz(t, 8.6, 0.8) });
      E.yazi(ctx, kati ? '5’e uzaklığı en fazla 3' : '5’e uzaklığı 3’ten az', fx, fy + (H ? 58 : 56), { boyut: H ? 26 : 26, agirlik: 520, renk: 'gumus', hiza: H ? 'left' : 'center', alfa: ara(t, 2.2, 2.8) });
      const sx = H ? ic.x1 - 20 : L.cx, sy = H ? ic.y + 40 : ay + 124;
      const f2 = ara(t, 5.0, 5.6);
      E.formul(ctx, kati ? '2 \\le x \\le 8 \\iff [2,\\, 8]' : '2 < x < 8 \\iff (2,\\, 8)', sx, sy, { boyut: H ? 38 : 36, hiza: H ? 'right' : 'center', renk: 'limon', alfa: f2, parilti: 0.3 * E.nabiz(t, 8.6, 0.8) });
      // aşı dolabı geri dönüşü
      const ga = ara(t, 6.0, 6.7) * (1 - ara(t, 8.2, 8.6));
      const gy = H ? ic.y1 - 40 : ay + 216;
      E.yazi(ctx, 'Aşı dolabının aralığı: merkezi 5, yarıçapı 3 olan bir ışık.', L.cx, gy, { boyut: H ? 30 : 28, agirlik: 640, renk: 'tebesir', alfa: ga, maxGen: ic.w - 30 });
      const ga2 = ara(t, 9.0, 9.6) * (1 - ara(t, 10.4, 11));
      E.yazi(ctx, '< ise uçlar açık, ≤ ise kapalı.', L.cx, gy, { boyut: H ? 30 : 28, agirlik: 640, renk: 'tebesir', alfa: ga2, maxGen: ic.w - 30 });
      ctx.restore();
    }
    // --- Bölüm 2: vida toleransı (mikroskop)
    const b2 = ara(t, 11.4, 12.4, 'io3');
    if (b2 > 0.002) {
      ctx.save(); ctx.globalAlpha *= b2;
      // yakınlaşma hissi: ölçek 0.86 → 1
      const z = lerp(0.86, 1, b2);
      ctx.translate(L.cx, ay); ctx.scale(z, z); ctx.translate(-L.cx, -ay);
      const d = E.sayiDogrusu({ x: dx, y: ay, w: dw, min: 19.88, max: 20.12 });
      d.ciz(ctx, { adim: 0.01, etiketAdim: 0.05, boyut: H ? 24 : 22, etiketFn: (v) => ondalik(v, 2), cubuk: 10 });
      const lx = d.px(20);
      lamba(ctx, lx, ly, 1);
      const r = kf(t, [[12.6, 0], [14.2, 0.05, 'io3']]);
      koni(ctx, lx, ly + 14, d.px(20 - r), d.px(20 + r), ay, ara(t, 12.4, 13));
      huzme(ctx, d, 20 - r, 20 + r, { p: r > 0.001 ? 1 : 0, uc: r > 0.0495, renk: 'turkuaz' });
      // örnek vidalar düşer
      const VIDA = [[19.93, 15.2], [19.97, 15.7], [20.04, 16.2], [20.07, 16.7]];
      for (const [v, td] of VIDA) {
        const p = ara(t, td, td + 0.6, 'gir2');
        if (p <= 0) continue;
        const ici = Math.abs(v - 20) <= 0.05 + 1e-9;
        const yv = lerp(ly + 40, ay - 46, p);
        const renk = p < 1 ? 'gumus' : ici ? 'turkuaz' : 'mercan';
        E.nokta(ctx, d.px(v), yv, 8, { renk, parilti: 1 });
        if (p >= 1) {
          E.yazi(ctx, ici ? '✓' : '✗', d.px(v), yv - 30, { boyut: 26, agirlik: 700, renk, alfa: ara(t, td + 0.6, td + 0.9) });
          if (!ici) E.isik(ctx, d.px(v), yv, 60, 'mercan', 0.6 * E.nabiz(t, td + 0.6, 0.6));
        }
      }
      ctx.restore();
      const fx = H ? ic.x + 20 : L.cx, fy = H ? ic.y + 40 : ic.y + 36, hz = H ? 'left' : 'center';
      E.yazi(ctx, 'Vida çapı: 20 mm ± 0,05 mm', fx, fy, { boyut: H ? 30 : 28, agirlik: 640, hiza: hz, alfa: ara(t, 12.2, 12.8) });
      E.formul(ctx, '|d − 20| \\le 0{,}05', fx, fy + (H ? 62 : 60), { boyut: H ? 40 : 38, hiza: hz, alfa: ara(t, 13.0, 13.6) });
      const sx = H ? ic.x1 - 20 : L.cx, sy = H ? ic.y + 72 : ay + 124;
      E.formul(ctx, 'd \\in [19{,}95;\\; 20{,}05]', sx, sy, { boyut: H ? 38 : 36, hiza: H ? 'right' : 'center', renk: 'limon', alfa: ara(t, 14.2, 14.8), parilti: 0.3 });
      const ma = ara(t, 17.6, 18.3);
      E.yazi(ctx, 'Işığın dışına düşen vida: hatalı üretim.', L.cx, H ? ic.y1 - 40 : ay + 216, { boyut: H ? 30 : 28, agirlik: 640, renk: 'mercan', alfa: ma, maxGen: ic.w - 30 });
    }
  };

  /* ---------- Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Aralık, sayı doğrusunda kesintisiz bir parçadır.', formul: '[a,\\, b] \\quad (a,\\, b) \\quad [a,\\, \\infty)' },
    { tr: 'Köşeli parantez uç dahil; normal parantez dahil değil.', formul: '2 \\le x < 8 \\iff [2,\\, 8)' },
    { tr: 'İşlemler: birleşim, kesişim, fark, tümleme.', formul: 'A \\cup B \\quad A \\cap B \\quad A \\setminus B \\quad A′' },
    { tr: 'Mutlak değer: merkez ve yarıçap.', formul: '|x − m| \\le r \\iff [m − r,\\, m + r]' },
  ], { aralik: 1.6 });
  const bitis = (ctx, s) => E.bitisKarti(ctx, s, meta);

  /* ---------- Film ---------- */
  E.film({
    meta,
    sure: 110.5,
    sahneler: [
      { ad: 'Soğuk açılış: aşı dolabı', bas: 0, son: 11.0, giris: 0, cikis: 0.7, ciz: acilis },
      { ad: 'İmza', bas: 10.7, son: 14.4, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 14.1, son: 18.4, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Tek ışın, üç yazılış', bas: 18.1, son: 32.4, ciz: ucYazilis },
      { ad: 'Hayattan aralıklar', bas: 32.1, son: 44.0, ciz: hayat },
      { ad: 'Işığın işlemleri', bas: 43.7, son: 72.0, ciz: islemler },
      { ad: 'Sürpriz: projektör ve mutlak değer', bas: 71.7, son: 93.2, ciz: projektor },
      { ad: 'Aklında kalsın', bas: 92.9, son: 103.6, ciz: ozet },
      { ad: 'Laboratuvar', bas: 103.4, son: 110.5, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: Math.sin(t * 0.05) * 40, ky: -t * 6 }),
  });
})();
