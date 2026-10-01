/* ==========================================================================
   EKSEN 9.6.1 — Aynı Ortalama
   Tek fikir: Ortalama bir hikâyenin yalnızca merkezidir. Aynı ortalamaya
   sahip iki dağılım bambaşka davranabilir. Nokta grafiği → histogram →
   kutu grafiği dönüşümü dağılımın şeklini ve yayılımını görünür kılar.

   Bütün özet değerler (ortalama, ortanca, çeyrekler, standart sapma,
   açıklık, tepe değer) aşağıdaki sabit veri dizilerinden KODDA hesaplanır;
   ekrana yazılan sayı ile çizilen grafik aynı kaynaktan gelir.
   Çeyrek yöntemi: "yarıların ortancası" — n tekse ortanca iki yarıya da
   katılmaz (ders kitaplarındaki yaygın yöntem). Standart sapma: örneklem
   standart sapması (n − 1 ile), hesap makinesinin "s" değeri.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp } = E;

  const meta = {
    kod: 'MAT.9.6.1',
    tema: 'İstatistiksel Araştırma Süreci',
    ad: 'Aynı Ortalama',
    adEn: 'Same Average',
    labAd: 'Veri Laboratuvarı',
    labAciklama: 'Noktaları sürükle: histogram, kutu grafiği, ortalama, ortanca ve standart sapma anında değişsin.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-veri/',
  };

  /* ---------- Veri ---------- */
  // İki otobüs hattında 30 seferlik bekleme süreleri (dakika). İkisinin de ortalaması 10.
  const A_HAT = [7, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 12, 12, 12, 9, 8, 13, 10];
  const B_HAT = [1, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 14, 14, 15, 16, 17, 18, 19, 25];
  // Kurayla seçilen 29 öğrencinin günlük ekran süresi (dakika, 1 haftalık ortalama, 10'a yuvarlanmış)
  const EKRAN = [120, 30, 150, 200, 90, 160, 100, 240, 140, 60, 180, 150, 110, 250, 70, 190, 130, 300, 160, 50, 220, 100, 150, 80, 210, 120, 190, 230, 170];
  const UC = 600; // sonradan eklenen uç değer

  /* ---------- İstatistik (tek kaynak) ---------- */
  const sirala = (v) => v.slice().sort((a, b) => a - b);
  const ortalama = (v) => v.reduce((a, b) => a + b, 0) / v.length;
  const ortanca = (v) => { const s = sirala(v), n = s.length, h = n >> 1; return n % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
  const ceyrekler = (v) => {
    const s = sirala(v), n = s.length, h = n >> 1;
    return [ortanca(s.slice(0, h)), ortanca(s), ortanca(s.slice(n % 2 ? h + 1 : h))];
  };
  const sapma = (v) => { const m = ortalama(v); return Math.sqrt(v.reduce((a, x) => a + (x - m) * (x - m), 0) / (v.length - 1)); };
  const tepe = (v) => {
    const say = new Map(); v.forEach((x) => say.set(x, (say.get(x) || 0) + 1));
    const en = Math.max(...say.values());
    return [...say.keys()].filter((k) => say.get(k) === en).sort((a, b) => a - b);
  };
  const ozetle = (v) => {
    const [q1, med, q3] = ceyrekler(v), s = sirala(v);
    return { n: v.length, ort: ortalama(v), med, q1, q3, ca: q3 - q1, min: s[0], max: s[s.length - 1], acik: s[s.length - 1] - s[0], s: sapma(v), tepe: tepe(v) };
  };
  const SA = ozetle(A_HAT), SB = ozetle(B_HAT);
  const EK = sirala(EKRAN), SE = ozetle(EKRAN), SE2 = ozetle(EKRAN.concat([UC]));
  const B_UZUN = B_HAT.filter((x) => x > 15).length, A_UZUN = A_HAT.filter((x) => x > 15).length;

  /** Sayıyı Türkçe yaz (ondalık virgül); tam değilse "≈" ekle */
  const sy = (v, d = 1) => E.sayiYaz(v, d);
  const yk = (v, d = 1) => (Math.abs(v - Math.round(v * Math.pow(10, d)) / Math.pow(10, d)) > 1e-9 ? '≈ ' : '') + sy(v, d);

  /* ---------- Ortak çizim yardımcıları ---------- */
  /** Hat rozeti: yuvarlak kare içinde harf */
  const rozet = (ctx, harf, x, y, renk, a, boy = 50) => {
    if (a <= 0.01) return;
    E.panel(ctx, x - boy / 2, y - boy / 2, boy, boy, { r: 12, renk, dolguAlfa: 0.16, kenar: renk, kenarAlfa: 0.95, kalinlik: 2.2, alfa: a });
    E.isik(ctx, x, y, boy * 1.4, renk, 0.18 * a);
    E.yazi(ctx, harf, x, y + 1, { boyut: Math.round(boy * 0.6), agirlik: 780, renk, alfa: a });
  };
  /** Yağmur: her noktaya varış zamanı ve sütundaki sırası (varış sırasına göre) — t'den bağımsız */
  const yagmur = (veri, tohum, t0, yay) => {
    const n = veri.map((v, i) => ({ v, i, ts: t0 + E.hash(i, tohum) * yay }));
    const grup = {};
    n.slice().sort((a, b) => a.ts - b.ts).forEach((d) => { d.k = grup[d.v] = (grup[d.v] ?? -1) + 1; });
    return n;
  };
  /** Düşen nokta: iz, yere çarpma halkası ve parlama */
  const DUS = 0.7;
  const dusenNokta = (ctx, d, x, yHedef, t, o) => {
    const p = clamp((t - d.ts) / DUS);
    if (p <= 0) return;
    const y = lerp(o.yBas, yHedef, p * p);
    if (p < 1) E.cizgi(ctx, [[x, y - 26 - 90 * p], [x, y]], { renk: o.renk, kalinlik: o.r * 0.8, alfa: 0.32, parilti: 0.5 });
    const h = clamp((t - d.ts - DUS) / 0.55);
    E.nokta(ctx, x, y, o.r, { renk: o.renk, parilti: 0.45 + 0.9 * E.nabiz(t, d.ts + DUS - 0.05, 0.5) });
    if (h > 0 && h < 1) {
      ctx.save(); ctx.globalAlpha *= (1 - h) * 0.65; ctx.strokeStyle = E.R(o.renk); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(x, yHedef + o.r * 0.6, o.r * (1 + h * 2.4), o.r * 0.45 * (1 + h), 0, 0, E.TAU); ctx.stroke(); ctx.restore();
    }
  };
  /** Kutu grafiği: alt uç, Q1, ortanca, Q3, üst uç */
  const kutu = (ctx, S, px, y, bh, o = {}) => {
    const a = o.alfa ?? 1, p = o.p ?? 1, renk = o.renk || 'turkuaz';
    if (a <= 0.01 || p <= 0) return;
    const x1 = px(S.q1), x3 = px(S.q3), xm = px(S.med);
    const pb = ara(p, 0, 0.6, 'io3'), pw = ara(p, 0.4, 1, 'io3');
    ctx.save(); ctx.globalAlpha *= a;
    // bıyıklar
    E.cizgi(ctx, [[x1, y], [lerp(x1, px(S.min), pw), y]], { renk: 'gumus', kalinlik: 2.5 });
    E.cizgi(ctx, [[x3, y], [lerp(x3, px(S.max), pw), y]], { renk: 'gumus', kalinlik: 2.5 });
    if (pw > 0.98) for (const v of [S.min, S.max]) E.cizgi(ctx, [[px(v), y - bh * 0.28], [px(v), y + bh * 0.28]], { renk: 'gumus', kalinlik: 2.5 });
    // kutu
    const yar = (bh / 2) * pb;
    const g = ctx.createLinearGradient(0, y - yar, 0, y + yar);
    g.addColorStop(0, E.rgba(renk, 0.26)); g.addColorStop(1, E.rgba(renk, 0.08));
    ctx.fillStyle = g; ctx.fillRect(x1, y - yar, x3 - x1, yar * 2);
    E.cizgi(ctx, [[x1, y - yar], [x3, y - yar], [x3, y + yar], [x1, y + yar]], { kapali: true, renk, kalinlik: 2.5, parilti: 0.7 });
    E.cizgi(ctx, [[xm, y - yar], [xm, y + yar]], { renk: 'limon', kalinlik: 3.5, parilti: 1 });
    ctx.restore();
  };
  /** Köşeli parantez (ölçü çizgisi) */
  const parantez = (ctx, xa, xb, y, yon, renk, a, p = 1) => {
    if (a <= 0.01) return;
    const xm = (xa + xb) / 2, ya = lerp(xm, xa, p), yb = lerp(xm, xb, p);
    E.cizgi(ctx, [[ya, y - 10 * yon], [ya, y], [yb, y], [yb, y - 10 * yon]], { renk, kalinlik: 2.5, alfa: a, parilti: 0.6 });
  };

  /* ---------- 1. Soğuk açılış: iki hat, aynı ortalama ---------- */
  const YA = yagmur(A_HAT, 11, 1.0, 3.6), YB = yagmur(B_HAT, 23, 1.3, 3.8);
  const acilis = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const ax0 = H ? ic.x + 236 : ic.x + 26, ax1 = H ? ic.x1 - 46 : ic.x1 - 26;
    const px = (v) => ax0 + (v / 25) * (ax1 - ax0);
    const r = H ? 8.5 : 8, sp = H ? 17.5 : 17;
    const satir = [
      { Y: YA, S: SA, harf: 'A', renk: 'turkuaz', y: H ? ic.y + 292 : ic.y + 300, ly: H ? ic.y + 230 : ic.y + 18 },
      { Y: YB, S: SB, harf: 'B', renk: 'mercan', y: H ? ic.y1 - 68 : ic.y + 540, ly: H ? ic.y1 - 126 : ic.y + 400 },
    ];
    // Hafif geri çekilme: yağmur başlarken kadraj yakından başlar
    const z = lerp(1.05, 1, ara(t, 0, 4.5, 'io2'));
    ctx.save();
    ctx.translate(ic.cx, ic.cy); ctx.scale(z, z); ctx.translate(-ic.cx, -ic.cy);
    satir.forEach((R, j) => {
      const ea = ara(t, 0.2 + j * 0.25, 1.2 + j * 0.25);
      const nd = E.sayiDogrusu({ x: ax0, y: R.y, w: ax1 - ax0, min: 0, max: 25 });
      nd.ciz(ctx, { adim: 1, etiketAdim: 5, boyut: 22, p: ea, cubuk: 9 });
      // yağmur
      for (const d of R.Y) dusenNokta(ctx, d, px(d.v), R.y - 14 - (d.k + 0.5) * sp, t, { r, renk: R.renk, yBas: -40 });
      // etiket
      const la = ara(t, 0.6 + j * 0.3, 1.4 + j * 0.3);
      if (H) {
        rozet(ctx, R.harf, ic.x + 30, R.y - 84, R.renk, la);
        E.yazi(ctx, R.harf + ' hattı', ic.x + 70, R.y - 100, { boyut: 30, agirlik: 680, hiza: 'left', alfa: la });
        E.yazi(ctx, '30 sefer', ic.x + 70, R.y - 66, { boyut: 22, agirlik: 500, hiza: 'left', renk: 'gumus', alfa: la });
      } else {
        rozet(ctx, R.harf, ic.x + 24, R.ly, R.renk, la, 46);
        E.yazi(ctx, R.harf + ' hattı · 30 sefer', ic.x + 62, R.ly, { boyut: 28, agirlik: 640, hiza: 'left', alfa: la });
      }
      // ortalama etiketi (satır başına, hesaplanan)
      const ma = ara(t, 6.6 + j * 0.35, 7.2 + j * 0.35);
      if (H) E.yazi(ctx, 'ortalama ' + sy(R.S.ort) + ' dk', ic.x + 70, R.y - 32, { boyut: 24, agirlik: 620, hiza: 'left', renk: 'limon', alfa: ma });
      else E.yazi(ctx, 'ort. ' + sy(R.S.ort) + ' dk', ic.x1, R.ly, { boyut: 26, agirlik: 640, hiza: 'right', renk: 'limon', alfa: ma });
    });
    // Ortalama çizgisi: iki satırı birden kesen ışık
    const lp = ara(t, 6.0, 7.0, 'io3');
    if (lp > 0) {
      const xm = px(SA.ort);
      const yUst = H ? ic.y + 52 : ic.y + 92, yAlt = satir[1].y;
      E.cizgi(ctx, [[xm, yAlt], [xm, lerp(yAlt, yUst, lp)]], { renk: 'limon', kalinlik: 2.5, parilti: 1.1, kesik: [9, 7] });
      E.isik(ctx, xm, lerp(yAlt, yUst, lp), 70, 'limon', 0.5 * (1 - ara(t, 7, 7.8)));
      const ty = H ? ic.y + 26 : ic.y + 640;
      E.yazi(ctx, 'ortalama = ' + sy(SA.ort) + ' dk', xm, ty, { boyut: H ? 28 : 30, agirlik: 700, renk: 'limon', alfa: ara(t, 6.6, 7.3), parilti: 0.3 });
    }
    ctx.restore();
    // Soru
    const qa = ara(t, 7.8, 8.6, 'cik3');
    if (H) E.yazi(ctx, 'Hangisine binersin?', ic.x1, ic.y + 26 + (1 - qa) * 12, { boyut: 40, agirlik: 760, hiza: 'right', alfa: qa, parilti: 0.25 });
    else E.yazi(ctx, 'Hangisine binersin?', E.L.cx, ic.y + 722 + (1 - qa) * 12, { boyut: 46, agirlik: 760, alfa: qa, parilti: 0.25 });
    E.isik(ctx, E.L.cx, ic.cy, E.W * 0.7, 'limon', 0.08 * E.nabiz(t, 6.2, 1.4));
  };

  /* ---------- 3. İstatistiksel araştırma döngüsü ---------- */
  const DUGUM = [
    { ad: 'Soru', renk: 'turkuaz' },
    { ad: 'Plan', renk: 'gok' },
    { ad: 'Veri', renk: 'menekse' },
    { ad: 'Analiz', renk: 'mercan' },
    { ad: 'Yorum', renk: 'limon' },
  ];
  const ADIM_ICERIK = [
    { baslik: 'Soru sor', satir: ['“Okulumuzdaki 9. sınıflar günde kaç dakika ekran başında?”', 'Cevap tek bir sayı değil: kişiden kişiye değişiyor.'] },
    { baslik: 'Plan yap', satir: ['Evren: okuldaki bütün 9. sınıflar', 'Örneklem: kurayla seçilen 29 öğrenci', 'Rastgele seçim: herkesin şansı eşit'] },
    { baslik: 'Veri topla', satir: ['Telefonun ekran süresi kaydı: 1 haftanın günlük ortalaması', 'Değişkenlik: doğal · ölçüm · örneklem'] },
    { baslik: 'Analiz et', satir: ['Görselleştir: nokta grafiği, histogram, kutu grafiği', 'Özetle: merkez ve yayılım'] },
    { baslik: 'Yorumla', satir: ['Sonucu soruya geri bağla.', 'Ne söylüyor? Neyi söyleyemiyor?'] },
  ];
  const ADIM = 2.4, ADIM0 = 1.0;
  const dongu = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const cx = H ? ic.x + 236 : E.L.cx, cy = H ? ic.cy + 6 : ic.y + 214;
    const R = H ? 176 : 160, nr = H ? 46 : 43;
    const aci = (i) => -Math.PI / 2 + (i / 5) * E.TAU;
    const nkt = (i) => [cx + Math.cos(aci(i)) * R, cy + Math.sin(aci(i)) * R];
    const etkin = clamp(Math.floor((t - ADIM0) / ADIM), -1, 4);
    // kuyruklu ışık: düğümler arasında atlar
    const kom = kf(t, [[ADIM0 - 0.6, -0.4], [ADIM0, 0, 'io3'], ...[1, 2, 3, 4, 5].flatMap((k) => [[ADIM0 + k * ADIM - 0.55, k - 1], [ADIM0 + k * ADIM, k, 'io3']])]);
    // yaylar
    const ya = ara(t, 0, 1.0);
    ctx.save();
    ctx.globalAlpha *= ya;
    ctx.strokeStyle = E.rgba('cizgi', 0.9); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + E.TAU * ya); ctx.stroke();
    ctx.restore();
    // ışıklı iz (geçilen yol)
    if (kom > 0) {
      const pts = [];
      for (let u = 0; u <= 1.0001; u += 0.01) { const a = aci(kom * u); pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
      E.cizgi(ctx, pts, { renk: 'turkuaz', kalinlik: 3, parilti: 0.9, alfa: 0.75 });
    }
    // ok başları (yön)
    for (let i = 0; i < 5; i++) {
      const a = aci(i + 0.5), x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, tg = a + Math.PI / 2;
      E.cizgi(ctx, [[x - Math.cos(tg - 0.5) * 10, y - Math.sin(tg - 0.5) * 10], [x, y], [x - Math.cos(tg + 0.5) * 10, y - Math.sin(tg + 0.5) * 10]], { renk: 'gumus', kalinlik: 2.2, alfa: ya * 0.8 });
    }
    // kuyruklu yıldız
    if (kom > -0.39) {
      const a = aci(kom), x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      E.isik(ctx, x, y, 80, 'turkuaz', 0.5);
    }
    // veri noktaları: Veri düğümünden Analiz düğümüne akar
    const vb = ADIM0 + 2 * ADIM + 0.3;
    for (let i = 0; i < 29; i++) {
      const ts = vb + E.hash(i, 5) * 1.6, p = ara(t, ts, ts + 1.6, 'io2');
      if (t < ts - 0.4) continue;
      const dogus = ara(t, ts - 0.4, ts);
      const u = 2 + p, a = aci(u), rr = R - 30 - 26 * Math.sin(p * Math.PI) - E.hash(i, 6) * 26;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      E.nokta(ctx, x, y, 4, { renk: 'menekse', alfa: dogus * (1 - ara(t, ts + 1.4, ts + 1.9)), parilti: 0.6 });
    }
    // merkez yazısı
    E.yazi(ctx, 'İSTATİSTİKSEL', cx, cy - 16, { boyut: 22, agirlik: 700, harfAra: 3, renk: 'gumus', alfa: ara(t, 0.4, 1.2) });
    E.yazi(ctx, 'ARAŞTIRMA', cx, cy + 16, { boyut: 22, agirlik: 700, harfAra: 3, renk: 'gumus', alfa: ara(t, 0.4, 1.2) });
    // düğümler
    DUGUM.forEach((d, i) => {
      const [x, y] = nkt(i);
      const da = ara(t, 0.2 + i * 0.15, 0.7 + i * 0.15, 'cik3');
      const on = i === etkin ? 1 : 0;
      const parla = E.nabiz(t, ADIM0 + i * ADIM - 0.1, 0.9) + (i === 0 ? E.nabiz(t, ADIM0 + 5 * ADIM - 0.1, 0.9) : 0);
      E.isik(ctx, x, y, nr * 2.6, d.renk, (0.15 + 0.35 * on + 0.4 * parla) * da);
      E.panel(ctx, x - nr, y - nr, nr * 2, nr * 2, { r: nr, renk: 'gece', dolguAlfa: 0.92, kenar: on ? d.renk : 'cizgi', kenarAlfa: 1, kalinlik: on ? 3 : 2, alfa: da });
      E.yazi(ctx, d.ad, x, y, { boyut: 23, agirlik: 700, renk: on || parla > 0.3 ? d.renk : 'tebesir', alfa: da });
    });
    // sağ/alt panel: etkin adımın içeriği
    const px = H ? ic.x + 500 : ic.x, py = H ? ic.y + 36 : ic.y + 432;
    const pw = H ? ic.x1 - (ic.x + 500) : ic.w, ph = H ? 450 : 350;
    const pa = ara(t, 0.6, 1.4);
    E.panel(ctx, px, py, pw, ph, { alfa: pa, vurgu: DUGUM[Math.max(0, etkin)].renk });
    ADIM_ICERIK.forEach((c, i) => {
      const t0 = ADIM0 + i * ADIM;
      const a = ara(t, t0 + 0.05, t0 + 0.55, 'cik3') * (i < 4 ? 1 - ara(t, t0 + ADIM - 0.3, t0 + ADIM) : 1);
      if (a <= 0.01) return;
      const kay = (1 - a) * 14;
      const x0 = px + (H ? 40 : 32);
      E.yazi(ctx, (i + 1) + ' / 5', x0, py + (H ? 48 : 42), { boyut: 22, agirlik: 700, harfAra: 3, hiza: 'left', renk: DUGUM[i].renk, alfa: a });
      E.yazi(ctx, c.baslik, x0 + kay, py + (H ? 104 : 92), { boyut: H ? 48 : 42, agirlik: 760, hiza: 'left', alfa: a });
      let y = py + (H ? 178 : 156);
      c.satir.forEach((sat, j) => {
        const sa = a * ara(t, t0 + 0.3 + j * 0.35, t0 + 0.8 + j * 0.35);
        E.nokta(ctx, x0 + 6, y, 4.5, { renk: DUGUM[i].renk, alfa: sa, parilti: 0.4 });
        const r = E.yazi(ctx, sat, x0 + 26, y, { boyut: H ? 29 : 27, agirlik: j === 0 && i === 0 ? 640 : 520, hiza: 'left', taban: 'top', alfa: sa, maxGen: pw - (H ? 100 : 80), renk: j === 0 ? 'tebesir' : 'gumus' });
        y += r.h + (H ? 26 : 22);
      });
    });
  };

  /* ---------- 4. Üç bakış: nokta grafiği → histogram → kutu grafiği ---------- */
  const YE = yagmur(EK, 31, 0.8, 2.8);
  const GENIS = [50, 100, 20];
  const binSay = (w) => { const m = {}; EK.forEach((v) => { const b = Math.floor(v / w); m[b] = (m[b] || 0) + 1; }); return m; };
  const BINLER = Object.fromEntries(GENIS.map((w) => [w, binSay(w)]));
  const MAXSAY = Math.max(...GENIS.flatMap((w) => Object.values(BINLER[w])));
  const binSira = (w) => { const ilk = {}; return EK.map((v, i) => { const b = Math.floor(v / w); if (ilk[b] === undefined) ilk[b] = i; return { b, j: i - ilk[b] }; }); };
  const SIRA = Object.fromEntries(GENIS.map((w) => [w, binSira(w)]));
  const SAHNE4 = [[7.8, 9.3, 50], [11.0, 12.2, 100], [13.2, 14.4, 20], [15.4, 16.5, 50], [17.0, 18.6, 'kutu']];
  const ceyrekGrup = (i) => { const n = EK.length, h = n >> 1; if (i === h && n % 2) return 'limon'; const q = i < h ? (i < h / 2 ? 0 : 1) : (i - (n - h) < h / 2 ? 2 : 3); return q === 0 || q === 3 ? 'gok' : 'turkuaz'; };

  const g4 = (t) => {
    const H = E.yatay, ic = E.L.icerik;
    const sk = ara(t, 20.4, 22.0, 'io3');
    const ax0 = H ? ic.x + 40 : ic.x + 24;
    const ax1 = H ? lerp(ic.x1 - 30, ic.x + 716, sk) : ic.x1 - 24;
    const base0 = H ? ic.y1 - 56 : ic.y + 650;
    const base = H ? base0 : lerp(base0, ic.y + 380, sk);
    const ust = H ? ic.y + 100 : ic.y + 112;
    const unit = Math.min(H ? 40 : 44, (base0 - ust) / MAXSAY);
    const px = (v) => ax0 + (v / 350) * (ax1 - ax0);
    const r = H ? 10 : 7, sp = H ? 24 : 17;
    const bh = H ? 76 : 60, boxY = base - (H ? 132 : 112);
    return { H, ic, ax0, ax1, base, px, unit, r, sp, bh, boxY, sk };
  };
  const konum = (G, i, lay) => {
    const v = EK[i];
    if (lay === 'nokta') return [G.px(v), G.base - 14 - (YE[i].k + 0.5) * G.sp];
    if (lay === 'kutu') { const dup = YE[i].k; return [G.px(v), G.boxY + (E.hash(i, 77) - 0.5) * G.bh * 0.5 + (dup - 1) * 0]; }
    const { b, j } = SIRA[lay][i];
    return [G.px((b * lay + Math.min((b + 1) * lay, 350)) / 2), G.base - (j + 0.5) * G.unit];
  };
  const cubuklar = (ctx, G, w, a) => {
    if (a <= 0.01) return;
    const m = BINLER[w];
    for (const k of Object.keys(m)) {
      const b = +k, x0 = G.px(b * w) + 1.5, x1 = G.px(Math.min((b + 1) * w, 350)) - 1.5, h = m[k] * G.unit, y0 = G.base - h;
      ctx.save(); ctx.globalAlpha *= a;
      const g = ctx.createLinearGradient(0, y0, 0, G.base);
      g.addColorStop(0, E.rgba('turkuaz', 0.34)); g.addColorStop(1, E.rgba('gok', 0.1));
      ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, h);
      ctx.restore();
      E.cizgi(ctx, [[x0, G.base], [x0, y0], [x1, y0], [x1, G.base]], { renk: 'turkuaz', kalinlik: 2, alfa: a, parilti: 0.5 });
      E.yazi(ctx, String(m[k]), (x0 + x1) / 2, y0 - 18, { boyut: 22, agirlik: 640, renk: 'tebesir', alfa: a });
    }
  };
  const ucBakis = (ctx, s) => {
    const t = s.t;
    const G = g4(t), { H, ic } = G;
    // eksen
    const nd = E.sayiDogrusu({ x: G.ax0, y: G.base, w: G.ax1 - G.ax0, min: 0, max: 350 });
    nd.ciz(ctx, { adim: 10, etiketAdim: 50, boyut: 22, p: ara(t, 0, 1.0), cubuk: 9 });
    // aşama ağırlıkları (çubukların görünürlüğü)
    const asamaA = (j) => {
      const [a, b] = SAHNE4[j];
      const sonraki = SAHNE4[j + 1];
      return ara(t, a + 0.5, b + 0.1) * (sonraki ? 1 - ara(t, sonraki[0], sonraki[0] + 0.5) : 1);
    };
    SAHNE4.forEach(([, , lay], j) => { if (lay !== 'kutu') cubuklar(ctx, G, lay, asamaA(j) * 0.95); });
    // kutu
    const kp = ara(t, 18.2, 19.6);
    kutu(ctx, SE, G.px, G.boxY, G.bh, { p: kp });
    // noktalar
    const tepeA = E.nabiz(t, 4.4, 3.4);
    for (let i = 0; i < EK.length; i++) {
      let lay0 = 'nokta', pos = null, p = 0, lay1 = null;
      for (const [a, b, lay] of SAHNE4) {
        const st = E.hash(i, 9) * 0.35;
        if (t >= b + 0.35) { lay0 = lay; continue; }
        if (t > a + st) { p = ara(t, a + st, b + st - 0.1, 'io3'); lay1 = lay; }
        break;
      }
      const P0 = konum(G, i, lay0);
      pos = lay1 ? [lerp(P0[0], konum(G, i, lay1)[0], p), lerp(P0[1], konum(G, i, lay1)[1], p) - Math.sin(p * Math.PI) * 30] : P0;
      const histte = (l) => typeof l === 'number';
      const rH = Math.min(G.r, G.unit * 0.36);
      const rr = lerp(histte(lay0) ? rH : G.r, lay1 ? (histte(lay1) ? rH : G.r) : histte(lay0) ? rH : G.r, p);
      const kutuP = (lay1 === 'kutu' ? p : lay0 === 'kutu' ? 1 : 0);
      const renk = kutuP > 0.5 ? ceyrekGrup(i) : EK[i] === SE.tepe[0] && tepeA > 0.05 ? 'limon' : 'turkuaz';
      if (lay0 === 'nokta' && !lay1 && t < 6) dusenNokta(ctx, YE[i], pos[0], pos[1], t, { r: rr, renk, yBas: -40 });
      else E.nokta(ctx, pos[0], pos[1], rr, { renk, parilti: 0.5 + (renk === 'limon' ? 0.6 * tepeA : 0), alfa: 1 });
    }
    // tepe değer etiketi
    if (tepeA > 0.01) {
      const say = EK.filter((v) => v === SE.tepe[0]).length;
      const y = G.base - 14 - say * G.sp - 34;
      E.yazi(ctx, 'tepe değer: ' + SE.tepe.map((v) => sy(v)).join(', ') + ' dk', G.px(SE.tepe[0]), y, { boyut: 26, agirlik: 680, renk: 'limon', alfa: clamp(tepeA * 2) });
    }
    // başlık çipi
    const cip = [
      ['NOKTA GRAFİĞİ', 'her nokta bir öğrenci · dakika/gün', 0, 8.6],
      ['HİSTOGRAM', 'sınıf genişliği: 50 dk', 8.6, 11.4],
      ['HİSTOGRAM', 'sınıf genişliği: 100 dk', 11.4, 13.6],
      ['HİSTOGRAM', 'sınıf genişliği: 20 dk', 13.6, 15.8],
      ['HİSTOGRAM', 'sınıf genişliği: 50 dk', 15.8, 17.6],
      ['KUTU GRAFİĞİ', 'beş sayılık özet', 17.6, 99],
    ];
    cip.forEach(([b, alt, a0, a1], j) => {
      const a = ara(t, a0 + (j ? 0 : 0.6), a0 + (j ? 0.3 : 1.3)) * (1 - ara(t, a1 - 0.3, a1));
      if (a <= 0.01) return;
      const ayni = j > 0 && cip[j - 1][0] === b;
      E.yazi(ctx, b, ic.x, ic.y + 20, { boyut: 24, agirlik: 760, harfAra: 4, renk: 'turkuaz', hiza: 'left', alfa: ayni ? 1 : a });
      E.yazi(ctx, alt, ic.x, ic.y + 56, { boyut: 26, agirlik: 520, renk: 'gumus', hiza: 'left', alfa: a });
    });
    // kutu etiketleri: ad ve değer
    const la = ara(t, 19.0, 19.9) ;
    if (la > 0.01) {
      const yAd = G.boxY - G.bh / 2 - (G.H ? 60 : 52), yDeg = G.boxY - G.bh / 2 - (G.H ? 26 : 22);
      const etk = [['alt uç', SE.min, 'gumus'], ['Q_{1}', SE.q1, 'turkuaz'], ['ortanca', SE.med, 'limon'], ['Q_{3}', SE.q3, 'turkuaz'], ['üst uç', SE.max, 'gumus']];
      etk.forEach(([ad, v, renk], j) => {
        const a = la * ara(t, 19.0 + j * 0.12, 19.6 + j * 0.12);
        const x = G.px(v);
        if (ad.startsWith('Q')) E.formul(ctx, ad, x, yAd, { boyut: 26, renk, alfa: a });
        else E.yazi(ctx, ad, x, yAd, { boyut: 22, agirlik: 640, renk, alfa: a });
        E.yazi(ctx, sy(v), x, yDeg, { boyut: G.H ? 26 : 24, agirlik: 700, renk: 'tebesir', alfa: a });
      });
    }
    // çeyrekler açıklığı → açıklık (aynı yerde sırayla)
    const yP = G.boxY + G.bh / 2 + 14, yT = yP + (G.H ? 30 : 28);
    const caA = ara(t, 21.6, 22.3) * (1 - ara(t, 24.6, 25.1));
    parantez(ctx, G.px(SE.q1), G.px(SE.q3), yP, -1, 'turkuaz', caA, ara(t, 21.6, 22.4));
    E.formul(ctx, '\\t{ÇA} = Q_{3} − Q_{1} = ' + sy(SE.q3) + ' − ' + sy(SE.q1) + ' = \\c{limon}{' + sy(SE.ca) + '}', G.px((SE.q1 + SE.q3) / 2), yT, { boyut: G.H ? 28 : 25, alfa: caA });
    const acA = ara(t, 25.0, 25.6) * (1 - ara(t, 30.4, 31));
    parantez(ctx, G.px(SE.min), G.px(SE.max), yP, -1, 'gumus', acA, ara(t, 25.0, 25.8));
    E.formul(ctx, '\\t{açıklık} = ' + sy(SE.max) + ' − ' + sy(SE.min) + ' = \\c{limon}{' + sy(SE.acik) + '}', G.px((SE.min + SE.max) / 2), yT, { boyut: G.H ? 28 : 25, alfa: acA });
    // standart sapma bandı: ortalamaya tipik uzaklık
    const sdA = ara(t, 27.2, 28.0);
    if (sdA > 0.01) {
      const yB = G.boxY - G.bh / 2 - (G.H ? 108 : 92);
      const xa = G.px(SE.ort - SE.s), xb = G.px(SE.ort + SE.s), xm = G.px(SE.ort);
      const pw = ara(t, 27.2, 28.4, 'io3');
      ctx.save(); ctx.globalAlpha *= sdA;
      const g = ctx.createLinearGradient(xa, 0, xb, 0);
      g.addColorStop(0, E.rgba('menekse', 0.05)); g.addColorStop(0.5, E.rgba('menekse', 0.5)); g.addColorStop(1, E.rgba('menekse', 0.05));
      ctx.fillStyle = g; ctx.fillRect(lerp(xm, xa, pw), yB - 6, (xb - xa) * pw, 12);
      ctx.restore();
      E.nokta(ctx, xm, yB, 6, { renk: 'limon', alfa: sdA });
      E.ok(ctx, xm, yB, lerp(xm, xa, pw), yB, { renk: 'menekse', kalinlik: 2.5, alfa: sdA, okBoy: 11 });
      E.ok(ctx, xm, yB, lerp(xm, xb, pw), yB, { renk: 'menekse', kalinlik: 2.5, alfa: sdA, okBoy: 11 });
      E.formul(ctx, '\\t{ortalama} \\pm s', xm, yB - (G.H ? 30 : 28), { boyut: G.H ? 26 : 24, renk: 'menekse', alfa: sdA * ara(t, 27.8, 28.5) });
    }
    // özet paneli
    const pa = ara(t, 21.6, 22.4);
    if (pa > 0.01) {
      const satirlar = [
        ['MERKEZ'],
        ['Ortalama', sy(SE.ort, 1) + ' dk', 22.3],
        ['Ortanca', sy(SE.med) + ' dk', 22.6],
        ['Tepe değer', SE.tepe.map((v) => sy(v)).join(', ') + ' dk', 22.9],
        ['YAYILIM'],
        ['Çeyrekler açıklığı', sy(SE.ca) + ' dk', 23.4],
        ['Açıklık', sy(SE.acik) + ' dk', 25.6],
        ['Standart sapma', yk(SE.s) + ' dk', 28.2],
      ];
      if (H) {
        const x = ic.x + 768, w = ic.x1 - x, y = ic.y + 14, h = 500;
        E.panel(ctx, x, y, w, h, { alfa: pa, vurgu: 'turkuaz' });
        let yy = y + 44;
        satirlar.forEach(([ad, deg, ts], j) => {
          if (!deg) { if (j) yy += 14; E.yazi(ctx, ad, x + 28, yy, { boyut: 22, agirlik: 760, harfAra: 4, renk: j ? 'menekse' : 'turkuaz', hiza: 'left', alfa: pa }); yy += 50; return; }
          const a = ara(t, ts, ts + 0.5);
          E.yazi(ctx, ad, x + 28, yy, { boyut: 24, agirlik: 520, renk: 'gumus', hiza: 'left', alfa: a });
          E.yazi(ctx, deg, x + w - 24, yy, { boyut: 29, agirlik: 720, renk: ad === 'Standart sapma' ? 'menekse' : 'tebesir', hiza: 'right', alfa: a });
          yy += 54;
        });
      } else {
        const x = ic.x, w = ic.w, y = ic.y + 450, h = 330;
        E.panel(ctx, x, y, w, h, { alfa: pa, vurgu: 'turkuaz' });
        const kol = [satirlar.slice(0, 4), satirlar.slice(4)];
        kol.forEach((k, c) => {
          const x0 = x + 26 + c * (w / 2), x1 = x + (c + 1) * (w / 2) - 18;
          let yy = y + 40;
          k.forEach(([ad, deg, ts], j) => {
            if (!deg) { E.yazi(ctx, ad, x0, yy, { boyut: 22, agirlik: 760, harfAra: 4, renk: c ? 'menekse' : 'turkuaz', hiza: 'left', alfa: pa }); yy += 46; return; }
            const a = ara(t, ts, ts + 0.5);
            E.yazi(ctx, ad, x0, yy, { boyut: 22, agirlik: 520, renk: 'gumus', hiza: 'left', alfa: a });
            E.yazi(ctx, deg, x0, yy + 32, { boyut: 30, agirlik: 720, renk: ad === 'Standart sapma' ? 'menekse' : 'tebesir', hiza: 'left', alfa: a });
            yy += 84;
          });
        });
      }
    }
  };

  /* ---------- 5. Sürpriz: uç değer ---------- */
  const ucDeger = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const zoom = ara(t, 1.4, 3.6, 'io3');
    const dmax = lerp(350, 650, zoom);
    const ax0 = H ? ic.x + 40 : ic.x + 20, ax1 = H ? ic.x1 - 40 : ic.x1 - 20;
    const base = H ? ic.y + 318 : ic.y + 452;
    const px = (v) => ax0 + (v / dmax) * (ax1 - ax0);
    const r = lerp(H ? 10 : 7, H ? 7.5 : 5, zoom), sp = lerp(H ? 24 : 17, H ? 17 : 11.5, zoom);
    const IN = 4.7; // uç değerin yere değdiği an
    const fp = ara(t, 3.9, IN, 'gir2');
    const ortSimdi = t >= IN ? SE2.ort : SE.ort;
    const f = lerp(SE.ort, SE2.ort, ara(t, 6.4, 8.6, 'io3'));
    const egim = ((ortSimdi - f) / (SE2.ort - SE.ort)) * E.der(4.5) * ara(t, IN, IN + 0.55, 'geri');
    const xf = px(f);
    const a0 = ara(t, 0, 0.8);
    // --- terazi kolu (dönen grup)
    ctx.save();
    ctx.translate(xf, base); ctx.rotate(egim); ctx.translate(-xf, -base);
    ctx.save(); ctx.globalAlpha *= a0;
    E.cizgi(ctx, [[ax0 - 20, base], [ax1 + 20, base]], { renk: 'cizgi', kalinlik: 4, parilti: 0.3 });
    for (let v = 0; v <= dmax + 1e-6; v += 50) E.cizgi(ctx, [[px(v), base - 8], [px(v), base + 8]], { renk: 'cizgi', kalinlik: 2 });
    for (let v = 0; v <= 600; v += 100) {
      const x = px(v);
      if (x > ax1 + 4) continue;
      const ua = clamp((Math.abs(x - xf) - 34) / 24) * clamp((ax1 + 4 - x) / 10);
      E.yazi(ctx, String(v), x, base + 30, { boyut: 22, agirlik: 520, renk: 'gumus', alfa: ua });
    }
    ctx.restore();
    // noktalar
    const say = {};
    EK.forEach((v) => {
      const k = (say[v] = (say[v] ?? -1) + 1);
      E.nokta(ctx, px(v), base - 12 - (k + 0.5) * sp, r, { renk: 'turkuaz', parilti: 0.45, alfa: a0 });
    });
    // ortanca işareti (kolla birlikte)
    const kolon = EK.filter((v) => v === SE.med).length;
    const ym = base - 12 - kolon * sp - 18;
    const ma = ara(t, 0.6, 1.3);
    E.ok(ctx, px(SE2.med), ym - 34, px(SE2.med), ym, { renk: 'turkuaz', kalinlik: 3, alfa: ma, okBoy: 12, parilti: 0.8 + E.nabiz(t, 8.6, 1.2) });
    E.yazi(ctx, 'ortanca', px(SE2.med), ym - 54, { boyut: 24, agirlik: 700, renk: 'turkuaz', alfa: ma });
    // uç değer (yere değdikten sonra kolla döner)
    if (t >= IN) {
      E.nokta(ctx, px(UC), base - 12 - 0.5 * sp, r * 1.25, { renk: 'mercan', parilti: 0.8 + 1.4 * E.nabiz(t, IN, 0.8) });
      E.yazi(ctx, UC + ' dk = ' + UC / 60 + ' saat', Math.min(px(UC), ax1 - 100), base - 12 - sp - 34, { boyut: 26, agirlik: 700, renk: 'mercan', alfa: ara(t, IN + 0.1, IN + 0.6) });
    }
    ctx.restore();
    // düşen uç değer
    if (fp > 0 && t < IN) {
      const x = px(UC), y = lerp(-40, base - 12 - 0.5 * sp, fp);
      E.cizgi(ctx, [[x, y - 120 * fp - 20], [x, y]], { renk: 'mercan', kalinlik: r, alfa: 0.4, parilti: 0.8 });
      E.nokta(ctx, x, y, r * 1.25, { renk: 'mercan', parilti: 1.2 });
    }
    // çarpma ışığı
    E.isik(ctx, px(UC), base, 260, 'mercan', 0.45 * E.nabiz(t, IN - 0.05, 0.9));
    // denge üçgeni (ortalama) — dönmez, kayar
    const ua = ara(t, 0.6, 1.3);
    E.cokgen(ctx, [[xf, base + 4], [xf - 17, base + 34], [xf + 17, base + 34]], { renk: 'limon', alfa: 0.9 * ua, kenar: true, parilti: 0.8 });
    E.yazi(ctx, 'ortalama', xf, base + 62, { boyut: 24, agirlik: 700, renk: 'limon', alfa: ua });
    E.yazi(ctx, '= denge noktası', xf, base + 92, { boyut: 22, agirlik: 520, renk: 'gumus', alfa: ua * (1 - ara(t, 4.0, 4.6)) });
    // üst gösterge: önce → sonra (hesaplanan değerler)
    const ga = ara(t, 0.8, 1.6);
    const sonra = ara(t, 6.4, 8.6, 'io3');
    const ortYaz = t < 6.4 ? sy(SE.ort) : sy(Math.round(f));
    const kol = (x, baslik, deger, renk, alt, aa) => {
      E.yazi(ctx, baslik, x, ic.y + 20, { boyut: 22, agirlik: 760, harfAra: 4, renk, hiza: 'left', alfa: ga });
      E.yazi(ctx, deger, x, ic.y + 66, { boyut: H ? 46 : 44, agirlik: 780, renk, hiza: 'left', alfa: ga, parilti: 0.25 });
      E.yazi(ctx, alt, x, ic.y + 112, { boyut: 22, agirlik: 520, renk: 'gumus', hiza: 'left', alfa: aa });
    };
    kol(H ? ic.x + 40 : ic.x + 10, 'ORTALAMA', ortYaz + ' dk', 'limon', sy(SE.ort) + ' → ' + sy(SE2.ort) + ' dk', ara(t, 8.4, 9.0));
    kol(H ? ic.x + 360 : ic.x + 340, 'ORTANCA', sy(SE2.med) + ' dk', 'turkuaz', sy(SE.med) + ' → ' + sy(SE2.med) + ' dk: kımıldamadı', ara(t, 9.0, 9.6));
    E.isik(ctx, H ? ic.x + 120 : ic.x + 90, ic.y + 66, 160, 'limon', 0.3 * E.nabiz(t, 6.4, 2.2) * sonra);
    const sa = ara(t, 10.4, 11.1, 'cik3');
    E.yazi(ctx, 'Uç değer ortalamayı çeker, ortancayı değil.', E.L.cx, H ? ic.y1 - 26 : ic.y + 660, { boyut: H ? 34 : 32, agirlik: 700, renk: 'tebesir', alfa: sa, maxGen: ic.w - 20, parilti: 0.2 });
  };

  /* ---------- 6. Karar: hangi hat? ---------- */
  const karar = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const ax0 = H ? ic.x + 96 : ic.x + 24, ax1 = H ? ic.x + 596 : ic.x1 - 24;
    const px = (v) => ax0 + (v / 25) * (ax1 - ax0);
    const r = 5.5, sp = 11.5;
    const satir = [
      { veri: A_HAT, S: SA, harf: 'A', renk: 'turkuaz', y: H ? ic.y + 186 : ic.y + 172, ly: H ? ic.y + 118 : ic.y + 14 },
      { veri: B_HAT, S: SB, harf: 'B', renk: 'mercan', y: H ? ic.y + 380 : ic.y + 358, ly: H ? ic.y + 312 : ic.y + 230 },
    ];
    const m = ara(t, 1.4, 3.0, 'io3');
    satir.forEach((R, j) => {
      const ea = ara(t, 0.1 + j * 0.2, 0.9 + j * 0.2);
      E.sayiDogrusu({ x: ax0, y: R.y, w: ax1 - ax0, min: 0, max: 25 }).ciz(ctx, { adim: 1, etiketAdim: 5, boyut: 22, alfa: ea, cubuk: 8 });
      if (H) rozet(ctx, R.harf, ic.x + 30, R.ly, R.renk, ea, 46);
      else { rozet(ctx, R.harf, ic.x + 22, R.ly, R.renk, ea, 42); E.yazi(ctx, R.harf + ' hattı', ic.x + 56, R.ly, { boyut: 26, agirlik: 640, hiza: 'left', alfa: ea }); }
      const by = R.y - (H ? 64 : 58), bh = H ? 64 : 56;
      const say = {};
      sirala(R.veri).forEach((v, i) => {
        const k = (say[v] = (say[v] ?? -1) + 1);
        const p0 = [px(v), R.y - 12 - (k + 0.5) * sp];
        const p1 = [px(v), by + (E.hash(i, 40 + j) - 0.5) * bh * 0.62];
        const q = ara(m, E.hash(i, 3) * 0.3, 0.7 + E.hash(i, 3) * 0.3);
        E.nokta(ctx, lerp(p0[0], p1[0], q), lerp(p0[1], p1[1], q), r, { renk: R.renk, alfa: ea * (1 - 0.55 * ara(t, 3.0, 4.0)), parilti: 0.4 });
      });
      kutu(ctx, R.S, px, by, bh, { p: ara(t, 2.6 + j * 0.2, 3.8 + j * 0.2), renk: R.renk });
    });
    // karşılaştırma tablosu (hesaplanan)
    const tab = [
      ['Ortalama', sy(SA.ort) + ' dk', sy(SB.ort) + ' dk'],
      ['Ortanca', sy(SA.med) + ' dk', sy(SB.med) + ' dk'],
      ['Çeyrekler açıklığı', sy(SA.ca) + ' dk', sy(SB.ca) + ' dk'],
      ['Standart sapma', yk(SA.s) + ' dk', yk(SB.s) + ' dk'],
      ['15 dk’dan uzun', A_UZUN + ' / ' + SA.n, B_UZUN + ' / ' + SB.n],
    ];
    const tx = H ? ic.x + 650 : ic.x, ty = H ? ic.y + 6 : ic.y + 414, tw = H ? ic.x1 - (ic.x + 650) : ic.w;
    const sat = H ? 62 : 40, th = (tab.length + 1) * sat + (H ? 30 : 20);
    const ta = ara(t, 3.6, 4.4);
    E.panel(ctx, tx, ty, tw, th, { alfa: ta });
    const c1 = tx + tw - (H ? 176 : 190), c2 = tx + tw - 28;
    const yh = ty + (H ? 44 : 30);
    rozet(ctx, 'A', c1 - 46, yh, 'turkuaz', ta, H ? 40 : 36);
    rozet(ctx, 'B', c2 - 46, yh, 'mercan', ta, H ? 40 : 36);
    tab.forEach(([ad, va, vb], j) => {
      const y = yh + (j + 1) * sat;
      const a = ara(t, 3.9 + j * 0.75, 4.5 + j * 0.75);
      const vurgu = j >= 2;
      E.cizgi(ctx, [[tx + 20, y - sat / 2], [tx + tw - 20, y - sat / 2]], { renk: 'sis', kalinlik: 1, alfa: a });
      E.yazi(ctx, ad, tx + (H ? 26 : 22), y, { boyut: H ? 24 : 22, agirlik: 520, renk: 'gumus', hiza: 'left', alfa: a });
      E.yazi(ctx, va, c1, y, { boyut: H ? 28 : 26, agirlik: 700, renk: vurgu ? 'turkuaz' : 'tebesir', hiza: 'right', alfa: a });
      E.yazi(ctx, vb, c2, y, { boyut: H ? 28 : 26, agirlik: 700, renk: vurgu ? 'mercan' : 'tebesir', hiza: 'right', alfa: a });
    });
    // karar
    const ka = ara(t, 8.6, 9.4, 'cik3');
    const ky = H ? ic.y1 - 58 : ic.y + 732;
    E.isik(ctx, E.L.cx, ky, 360, 'limon', 0.14 * ka);
    E.yazi(ctx, 'Düzenli olmak istiyorsan: A hattı', H ? ic.x + 30 : E.L.cx, ky - (H ? 14 : 22), { boyut: H ? 36 : 32, agirlik: 760, renk: 'limon', hiza: H ? 'left' : 'center', alfa: ka, parilti: 0.3 });
    E.yazi(ctx, 'Örneklemimize göre A’da bekleme muhtemelen ' + sy(SA.q1) + '–' + sy(SA.q3) + ' dk civarında.', H ? ic.x + 30 : E.L.cx, ky + (H ? 30 : 26), { boyut: H ? 25 : 22, agirlik: 520, renk: 'gumus', hiza: H ? 'left' : 'center', alfa: ara(t, 11.6, 12.4), maxGen: H ? 1100 : ic.w });
  };

  /* ---------- Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Merkez tek başına yetmez: yayılıma da bak.', formul: '\\t{merkez + yayılım}' },
    { tr: 'Kutu, ortadaki yarıyı gösterir.', formul: '\\t{ÇA} = Q_{3} − Q_{1}' },
    { tr: 'Uç değer ortalamayı çeker, ortancayı değil.', formul: '\\t{ortalama } ' + sy(SE.ort) + ' → ' + sy(SE2.ort) },
    { tr: 'Grafiği soruna göre seç.', formul: '\\t{nokta · histogram · kutu}' },
  ], { aralik: 1.5 });
  const bitis = (ctx, s) => E.bitisKarti(ctx, s, meta);

  /* ---------- Film ---------- */
  E.film({
    meta,
    sure: 109,
    sahneler: [
      { ad: 'Soğuk açılış: iki hat, aynı ortalama', bas: 0, son: 11.2, giris: 0, cikis: 0.7, ciz: acilis },
      { ad: 'İmza', bas: 10.9, son: 14.6, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 14.3, son: 18.6, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Araştırma döngüsü', bas: 18.4, son: 31.5, ciz: dongu },
      { ad: 'Nokta → histogram → kutu', bas: 31.3, son: 62.5, ciz: ucBakis, itme: 0.01 },
      { ad: 'Sürpriz: uç değer', bas: 62.3, son: 76.0, ciz: ucDeger, itme: 0.012 },
      { ad: 'Karar: hangi hat?', bas: 75.8, son: 92.0, ciz: karar },
      { ad: 'Aklında kalsın', bas: 91.8, son: 102.5, ciz: ozet },
      { ad: 'Laboratuvar', bas: 102.3, son: 109, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 5, renk1: 'turkuaz', renk2: 'mercan' }),
  });
})();
