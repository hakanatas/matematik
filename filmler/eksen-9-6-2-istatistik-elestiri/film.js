/* ==========================================================================
   EKSEN 9.6.2 — Kamerayı Geri Çek
   Tek fikir: Başkalarının istatistiksel iddiaları çoğu zaman bir "kadraj"dır.
   Kamerayı geri çekince (tam eksen, tüm veri, örneklemin kim olduğu) iddianın
   hatası ya da yanlılığı ortaya çıkar. Her iddia: temellendir → hata/yanlılık
   ara → kabul et ya da çürüt.

   Kamera: her iddia bir "dünya" içinde çizilir; kamera {x, y, z} gerçekten
   geri çekilir (z küçülür). Grafik öğeleri dünya koordinatında ölçeklenir;
   yazılar ve veri noktaları ekran uzayında, dünyadaki yerlerine iz düşürülerek
   sabit boyutta çizilir (okunur kalsınlar diye).
   Bütün sayılar (ortalama, ortanca, çeyrekler, yüzde) aşağıdaki veriden
   kodda hesaplanır. Çeyrek yöntemi: yarıların ortancası.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp } = E;

  const meta = {
    kod: 'MAT.9.6.2',
    tema: 'İstatistiksel Araştırma Süreci',
    ad: 'Kamerayı Geri Çek',
    adEn: 'Pull the Camera Back',
    labAd: 'Veri Laboratuvarı',
    labAciklama: 'Ekseni kes, uç değer ekle, örneklemi değiştir: grafiğin ve özetlerin nasıl yanıltabildiğini kendin gör.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-veri/',
  };

  /* ---------- Veri ve istatistik (tek kaynak) ---------- */
  const sirala = (v) => v.slice().sort((a, b) => a - b);
  const ortalama = (v) => v.reduce((a, b) => a + b, 0) / v.length;
  const ortanca = (v) => { const s = sirala(v), n = s.length, h = n >> 1; return n % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
  const ceyrekler = (v) => { const s = sirala(v), n = s.length, h = n >> 1; return [ortanca(s.slice(0, h)), ortanca(s), ortanca(s.slice(n % 2 ? h + 1 : h))]; };
  const sy = (v, d = 1) => E.sayiYaz(v, d);
  const binlik = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // İddia 1: radar ölçümleri (km/sa), her ay 20 araç. Nisan = Mart'ın 2 km/sa kaymış hâli.
  const MART = [38, 41, 43, 44, 45, 46, 47, 47, 48, 48, 49, 50, 51, 51, 52, 53, 54, 55, 56, 62];
  const NISAN = MART.map((v) => v + 2);
  const M_ORT = ortalama(MART), N_ORT = ortalama(NISAN);
  const ARTIS = N_ORT - M_ORT, YUZDE = (ARTIS / M_ORT) * 100;
  const SINIR = 50;
  const H_MIN = Math.min(...MART, ...NISAN), H_MAX = Math.max(...MART, ...NISAN);
  // İddia 2: maaşlar (TL)
  const MAAS = [25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 775000];
  const MAAS_ORT = ortalama(MAAS), MAAS_MED = ortanca(MAAS);
  const ALTINDA = MAAS.filter((v) => v < MAAS_ORT).length;
  // İddia 3: anket
  const KATILAN = 200, EVET = 180, OKUL = 1200;
  const ORAN = (EVET / KATILAN) * 100;
  // İddia 4: kurayla seçilen 40 öğrencinin uyku süresi (saat)
  const UYKU = [].concat(Array(2).fill(5.5), Array(4).fill(6), Array(7).fill(6.5), Array(13).fill(7), Array(8).fill(7.5), Array(5).fill(8), [8.5]);
  const U_ORT = ortalama(UYKU), U_MED = ortanca(UYKU), U_Q = ceyrekler(UYKU);

  /* ---------- Kamera ---------- */
  /** Anahtar karelerle kamera yolu: [t, x, y, z]. z logaritmik, merkez kadraj kenarları doğrusal kayacak biçimde. */
  const kamYol = (t, keys) => {
    if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], z: keys[0][3] };
    for (let i = 1; i < keys.length; i++) {
      const [t1, x1, y1, z1] = keys[i], [t0, x0, y0, z0] = keys[i - 1];
      if (t <= t1) {
        const p = ara(t, t0, t1, 'io3');
        const z = Math.exp(lerp(Math.log(z0), Math.log(z1), p));
        const q = Math.abs(z1 - z0) < 1e-9 ? p : (1 / z - 1 / z0) / (1 / z1 - 1 / z0);
        return { x: lerp(x0, x1, q), y: lerp(y0, y1, q), z };
      }
    }
    const k = keys[keys.length - 1];
    return { x: k[1], y: k[2], z: k[3] };
  };
  /** Görüntü alanı (viewport) + kamera → iz düşüm yardımcıları */
  const kameraKur = (V, kam, hud = 40) => {
    const vcx = V.x + V.w / 2, vcy = V.y + V.h / 2, z = kam.z;
    const K = { V, z, kam, vcx, vcy };
    K.p = (wx, wy) => [vcx + (wx - kam.x) * z, vcy + (wy - kam.y) * z];
    K.uygula = (ctx) => { ctx.translate(vcx, vcy); ctx.scale(z, z); ctx.translate(-kam.x, -kam.y); };
    const gx0 = V.x + 6, gy0 = V.y + hud, gx1 = V.x + V.w - 6, gy1 = V.y + V.h - 6;
    K.gor = (x0, y0, x1, y1) => clamp(Math.min(x0 - gx0, y0 - gy0, gx1 - x1, gy1 - y1) / 12 + 1);
    K.icinde = (x, y, pay = 0) => x > V.x - pay && x < V.x + V.w + pay && y > V.y - pay && y < V.y + V.h + pay;
    return K;
  };
  /** Ekran uzayında, görüntü alanından taşmayan yazı */
  const kYazi = (ctx, K, metin, x, y, o) => {
    o = Object.assign({ boyut: 24, agirlik: 600, hiza: 'center', alfa: 1 }, o);
    if (o.alfa <= 0.01) return;
    const w = E.yaziOlc(ctx, metin, o);
    const x0 = o.hiza === 'center' ? x - w / 2 : o.hiza === 'right' ? x - w : x;
    const a = K.gor(x0, y - o.boyut * 0.6, x0 + w, y + o.boyut * 0.6);
    if (a > 0.01) E.yazi(ctx, metin, x, y, Object.assign({}, o, { alfa: o.alfa * a }));
  };
  /** Görüntü alanı çerçevesi ve vizör (kadraj köşeleri, yakınlık göstergesi) */
  const vizor = (ctx, K, a, zGoster, kayit) => {
    const { x, y, w, h } = K.V;
    E.panel(ctx, x, y, w, h, { r: 14, renk: 'gece', dolguAlfa: 0.38, kenar: 'sis', kenarAlfa: 0.8, alfa: a });
    const L = 26, renk = kayit > 0.5 ? 'mercan' : 'gumus';
    for (const [cx, cy, sx, sy2] of [[x + 10, y + 10, 1, 1], [x + w - 10, y + 10, -1, 1], [x + 10, y + h - 10, 1, -1], [x + w - 10, y + h - 10, -1, -1]])
      E.cizgi(ctx, [[cx, cy + sy2 * L], [cx, cy], [cx + sx * L, cy]], { renk, kalinlik: 2.5, alfa: a * (0.55 + 0.45 * kayit), parilti: 0.5 * kayit });
    const yan = 0.5 + 0.5 * Math.sin(E.t * 5);
    E.nokta(ctx, x + 34, y + 24, 5.5, { renk: 'mercan', alfa: a * kayit * yan, parilti: 0.8 });
    E.yazi(ctx, 'KADRAJ', x + 48, y + 24, { boyut: 22, agirlik: 700, harfAra: 3, hiza: 'left', renk: kayit > 0.5 ? 'mercan' : 'gumus', alfa: a });
    E.yazi(ctx, '× ' + sy(zGoster, 1), x + w - 24, y + 24, { boyut: 22, agirlik: 700, hiza: 'right', renk: 'gumus', alfa: a, font: 'mono' });
  };
  /** Dünyadaki iddia kadrajı (kesikli dikdörtgen) */
  const kadrajCiz = (ctx, K, r, a) => {
    if (a <= 0.01) return;
    const [x0, y0] = K.p(r[0], r[1]), [x1, y1] = K.p(r[2], r[3]);
    E.cizgi(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { kapali: true, renk: 'mercan', kalinlik: 2, kesik: [8, 6], alfa: a, parilti: 0.5 });
  };
  /** Mühür: ÇÜRÜTÜLDÜ / KABUL EDİLDİ */
  const muhur = (ctx, x, y, kabul, p) => {
    if (p <= 0.01) return;
    const renk = kabul ? 'turkuaz' : 'mercan';
    const s = lerp(1.7, 1, ara(p, 0, 1, 'cik3'));
    const metin = kabul ? 'KABUL EDİLDİ' : 'ÇÜRÜTÜLDÜ';
    ctx.save();
    ctx.translate(x, y); ctx.rotate(E.der(-5)); ctx.scale(s, s);
    const w = E.yaziOlc(ctx, metin, { boyut: 30, agirlik: 800, harfAra: 4 }) + 40, h = 52;
    ctx.globalAlpha *= clamp(p * 1.6);
    E.panel(ctx, -w / 2, -h / 2, w, h, { r: 10, renk, dolguAlfa: 0.14, kenar: renk, kenarAlfa: 1, kalinlik: 3 });
    E.yazi(ctx, metin, 0, 1, { boyut: 30, agirlik: 800, harfAra: 4, renk, parilti: 0.5 });
    ctx.restore();
    E.isik(ctx, x, y, 200, renk, 0.35 * E.nabiz(p, 0.05, 0.6));
  };

  /* ---------- İddia sahnesi iskeleti ---------- */
  /**
   * c: { no, iddia, adimlar:[{baslik, detay, t}], karar:{t, kabul, gerekce?}, keys:(V)=>kamera anahtarları,
   *      kadraj:(V)=>[x0,y0,x1,y1] | null, dunya:(ctx,K,t,V)=>{}, ust:(ctx,K,t,V)=>{} (ekran uzayı) }
   */
  const yerlesim = () => {
    const ic = E.L.icerik, H = E.yatay;
    if (H) return { H, ic, kart: { x: ic.x, y: ic.y, w: 404, h: ic.h }, V: { x: ic.x + 430, y: ic.y, w: ic.w - 430, h: ic.h } };
    return { H, ic, kart: { x: ic.x, y: ic.y, w: ic.w, h: 160 }, V: { x: ic.x, y: ic.y + 178, w: ic.w, h: 420 }, alt: { x: ic.x, y: ic.y + 616, w: ic.w, h: ic.h - 616 } };
  };
  const iddia = (c) => (ctx, s) => {
    const t = s.t, Y = yerlesim(), { H, kart, V } = Y;
    const keys = c.keys(V);
    const kam = kamYol(t, keys);
    const K = kameraKur(V, kam);
    const z0 = keys[0][3], z1 = keys[keys.length - 1][3];
    const kayit = clamp((Math.log(kam.z) - Math.log(z1)) / (Math.log(z0) - Math.log(z1)) * 3 - 0.2);
    const va = ara(t, 0.1, 0.9);
    // görüntü alanı
    vizor(ctx, K, va, kam.z / z1, kayit);
    ctx.save();
    E.yuvarlakDik(ctx, V.x + 1, V.y + 1, V.w - 2, V.h - 2, 13); ctx.clip();
    ctx.globalAlpha *= va;
    ctx.save(); K.uygula(ctx); c.dunya(ctx, K, t, V); ctx.restore();
    if (c.kadraj) {
      const ka = ara(t, keys[1][0] + 0.4, keys[1][0] + 1.2) * (1 - ara(t, c.karar.t + 2.5, c.karar.t + 3.5) * 0.6);
      kadrajCiz(ctx, K, c.kadraj(V, keys), ka);
    }
    ctx.restore();
    if (c.ust) c.ust(ctx, K, t, V);
    // hızlı geri çekilme ışığı
    for (let i = 1; i < keys.length; i++) {
      if (keys[i][3] < keys[i - 1][3]) {
        const p = ara(t, keys[i - 1][0], keys[i][0], 'lin');
        if (p > 0 && p < 1) E.isik(ctx, V.x + V.w / 2, V.y + V.h / 2, V.w * 0.6, 'turkuaz', 0.12 * Math.sin(p * Math.PI));
      }
    }
    // iddia kartı
    const ka = ara(t, 0, 0.8, 'cik3');
    if (H) {
      E.yazi(ctx, 'İDDİA ' + c.no, kart.x, kart.y + 20, { boyut: 22, agirlik: 760, harfAra: 5, renk: 'turkuaz', hiza: 'left', alfa: ka });
      E.yazi(ctx, c.iddia, kart.x, kart.y + 48, { boyut: 31, agirlik: 720, hiza: 'left', taban: 'top', maxGen: kart.w - 20, alfa: ka, yaz: ara(t, 0.2, 1.6, 'lin'), satirAra: 1.18 });
      let yy = kart.y + 206;
      c.adimlar.forEach((a, j) => {
        const on = t >= a.t ? 1 : 0;
        const aa = ara(t, a.t, a.t + 0.6);
        const etkin = on && (j === 2 || t < c.adimlar[j + 1].t);
        const renk = j === 2 ? (c.karar.kabul ? 'turkuaz' : 'mercan') : j === 0 ? 'gok' : 'menekse';
        E.panel(ctx, kart.x, yy - 17, 34, 34, { r: 17, renk: on ? renk : 'lacivert', dolguAlfa: on ? 0.22 : 0.6, kenar: on ? renk : 'sis', kalinlik: 2, alfa: ka });
        E.yazi(ctx, String(j + 1), kart.x + 17, yy + 1, { boyut: 22, agirlik: 760, renk: on ? renk : 'gumus', alfa: ka });
        E.yazi(ctx, a.baslik, kart.x + 48, yy, { boyut: 25, agirlik: 720, hiza: 'left', renk: etkin ? 'tebesir' : on ? 'gumus' : 'cizgi', alfa: ka });
        E.yazi(ctx, a.detay, kart.x + 48, yy + 22, { boyut: 22, agirlik: 480, hiza: 'left', taban: 'top', maxGen: kart.w - 56, renk: 'gumus', alfa: aa, satirAra: 1.2 });
        yy += a.yuk || 84;
      });
      muhur(ctx, kart.x + kart.w / 2 - 6, kart.y + kart.h - 28, c.karar.kabul, ara(t, c.karar.t, c.karar.t + 0.7));
    } else {
      E.yazi(ctx, 'İDDİA ' + c.no, kart.x, kart.y + 16, { boyut: 22, agirlik: 760, harfAra: 5, renk: 'turkuaz', hiza: 'left', alfa: ka });
      E.yazi(ctx, c.iddia, kart.x, kart.y + 42, { boyut: 30, agirlik: 720, hiza: 'left', taban: 'top', maxGen: kart.w, alfa: ka, yaz: ara(t, 0.2, 1.6, 'lin'), satirAra: 1.16 });
      const A = Y.alt, cw = (A.w - 16) / 3;
      const kisa = ['Temellendir', 'Hata / yanlılık', 'Karar'];
      let etkinJ = 0;
      c.adimlar.forEach((a, j) => { if (t >= a.t) etkinJ = j; });
      c.adimlar.forEach((a, j) => {
        const on = t >= a.t ? 1 : 0;
        const renk = j === 2 ? (c.karar.kabul ? 'turkuaz' : 'mercan') : j === 0 ? 'gok' : 'menekse';
        const x = A.x + j * (cw + 8);
        E.panel(ctx, x, A.y, cw, 44, { r: 22, renk: on ? renk : 'lacivert', dolguAlfa: on ? (j === etkinJ ? 0.26 : 0.1) : 0.5, kenar: on ? renk : 'sis', kalinlik: 2, alfa: ka });
        E.yazi(ctx, (j + 1) + ' ' + kisa[j], x + cw / 2, A.y + 22, { boyut: 22, agirlik: 700, renk: on ? (j === etkinJ ? 'tebesir' : 'gumus') : 'cizgi', alfa: ka });
      });
      c.adimlar.forEach((a, j) => {
        const sonraki = c.adimlar[j + 1];
        const aa = ara(t, a.t + 0.1, a.t + 0.6) * (sonraki ? 1 - ara(t, sonraki.t - 0.3, sonraki.t) : 1);
        if (aa <= 0.01) return;
        if (j < 2) E.yazi(ctx, a.detay, A.x + 4, A.y + 66, { boyut: 24, agirlik: 500, hiza: 'left', taban: 'top', maxGen: A.w - 8, renk: 'gumus', alfa: aa, satirAra: 1.2 });
        else E.yazi(ctx, a.detay, A.x + 4, A.y + 66, { boyut: 22, agirlik: 500, hiza: 'left', taban: 'top', maxGen: A.w - 252, renk: 'gumus', alfa: aa, satirAra: 1.2 });
      });
      muhur(ctx, A.x + A.w - 116, A.y + 104, c.karar.kabul, ara(t, c.karar.t, c.karar.t + 0.7));
    }
  };

  /* ---------- 1. Soğuk açılış: kesik eksen ---------- */
  const KB = 50; // dünya: 1 km/sa = 50 birim
  const acilis = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const V = H ? { x: ic.x, y: ic.y + 126, w: ic.w, h: ic.h - 126 } : { x: ic.x, y: ic.y + 196, w: ic.w, h: ic.h - 196 };
    const bw = 180, bx = [-130, 130], axX = -262;
    // iddia kadrajı: 48–52 aralığı; tam görünüm: 0–56
    const zA = Math.min((V.h * 0.9) / (4.3 * KB), (V.w * 0.9) / (2 * 300));
    const yA = -48 * KB - (V.h / 2 - 34) / zA; // sahte taban (48) kadrajın altında
    const zB = (V.h * 0.8) / (57 * KB);
    const keys = [[0, 0, yA, zA], [4.9, 0, yA, zA], [8.0, -20, -28.6 * KB, zB]];
    const kam = kamYol(t, keys);
    const K = kameraKur(V, kam, 6);
    const ac = ara(t, 4.9, 6.2); // eksenin altı görünür
    const kayit = 1 - ara(t, 4.9, 7.6);
    const va = ara(t, 0, 0.6);
    // başlık (haber)
    const hx = ic.x, hy = ic.y;
    E.yazi(ctx, 'SON DAKİKA', hx, hy + 18, { boyut: 22, agirlik: 780, harfAra: 5, renk: 'mercan', hiza: 'left', alfa: va });
    const satirlar = H ? ['Mahallemizde hız ihlalleri patladı!'] : ['Mahallemizde hız', 'ihlalleri patladı!'];
    const hb = H ? 46 : 44;
    const toplam = satirlar.join(' ').length;
    let yazilan = Math.floor(ara(t, 0.1, 1.5, 'lin') * toplam + 0.001);
    satirlar.forEach((sat, i) => {
      const yy = hy + (H ? 64 : 62) + i * (hb * 1.12);
      const n = Math.max(0, Math.min(sat.length, yazilan)); yazilan -= sat.length + 1;
      E.yazi(ctx, sat, hx, yy, { boyut: hb, agirlik: 780, hiza: 'left', alfa: va, yaz: n / sat.length });
      if (i === satirlar.length - 1) {
        // "patladı!" üstü çizilir
        const on = sat.slice(0, sat.indexOf('patladı'));
        const x0 = hx + E.yaziOlc(ctx, on, { boyut: hb, agirlik: 780 }), x1 = hx + E.yaziOlc(ctx, sat, { boyut: hb, agirlik: 780 });
        const p = ara(t, 9.0, 9.6, 'io3');
        E.cizgi(ctx, [[x0 - 4, yy + 2], [lerp(x0 - 4, x1 + 4, p), yy + 2]], { renk: 'mercan', kalinlik: 5, parilti: 1, p: p > 0 ? 1 : 0 });
      }
    });
    const dy = hy + (H ? 64 : 62) + satirlar.length * hb * 1.12 - (H ? 10 : 12);
    E.yazi(ctx, 'Gerçekte: ortalama hız ≈ %' + Math.round(YUZDE) + ' arttı', hx, dy, { boyut: H ? 30 : 30, agirlik: 700, hiza: 'left', renk: 'limon', alfa: ara(t, 9.5, 10.2), parilti: 0.25 });
    // görüntü alanı
    E.panel(ctx, V.x, V.y, V.w, V.h, { r: 14, renk: 'gece', dolguAlfa: 0.3, kenar: 'sis', kenarAlfa: 0.6, alfa: va });
    ctx.save();
    E.yuvarlakDik(ctx, V.x + 1, V.y + 1, V.w - 2, V.h - 2, 13); ctx.clip();
    ctx.globalAlpha *= va;
    ctx.save(); K.uygula(ctx);
    const z = kam.z, px = 1 / z;
    const buyu = ara(t, 0.5, 2.0, 'cik3');
    [[MART, M_ORT, 'gok'], [NISAN, N_ORT, 'mercan']].forEach(([, v, renk], i) => {
      const x0 = bx[i] - bw / 2, ust = -lerp(48, v, buyu) * KB;
      // 48'in üstü
      let g = ctx.createLinearGradient(0, ust, 0, -48 * KB);
      g.addColorStop(0, E.rgba(renk, 0.95)); g.addColorStop(1, E.rgba(renk, 0.55));
      ctx.fillStyle = g; ctx.fillRect(x0, ust, bw, -48 * KB - ust);
      // 48'in altı (geri çekilince görünür)
      if (ac > 0) {
        ctx.save(); ctx.globalAlpha *= ac;
        g = ctx.createLinearGradient(0, -48 * KB, 0, 0);
        g.addColorStop(0, E.rgba(renk, 0.55)); g.addColorStop(1, E.rgba(renk, 0.25));
        ctx.fillStyle = g; ctx.fillRect(x0, -48 * KB, bw, 48 * KB);
        ctx.restore();
      }
      E.cizgi(ctx, [[x0, ust], [x0 + bw, ust]], { renk: 'tebesir', kalinlik: 3 * px, alfa: 0.9, parilti: 0.6 });
    });
    // eksen ve çentikler
    E.cizgi(ctx, [[axX, lerp(-48 * KB, 0, ac)], [axX, -56.5 * KB]], { renk: 'cizgi', kalinlik: 2.5 * px });
    const birimA = clamp((KB * z - 18) / 20), onA = clamp((26 - KB * z) / 10);
    for (let v = 0; v <= 56; v++) {
      const y = -v * KB, on = v % 10 === 0;
      const a = (v >= 48 ? 1 : ac) * (on ? Math.max(birimA, onA) : birimA);
      if (a > 0.01) E.cizgi(ctx, [[axX - (on ? 12 : 8) * px, y], [axX, y]], { renk: 'cizgi', kalinlik: 2 * px, alfa: a });
    }
    // sahte taban (48) ve gerçek taban (0)
    E.cizgi(ctx, [[axX, -48 * KB], [440, -48 * KB]], { renk: ac > 0.5 ? 'mercan' : 'gumus', kalinlik: 2.5 * px, kesik: ac > 0.5 ? [10 * px, 8 * px] : null, alfa: 1 - 0.3 * ac, parilti: 0.6 * ac });
    E.cizgi(ctx, [[axX, 0], [440, 0]], { renk: 'gumus', kalinlik: 2.5 * px, alfa: ac });
    // hız sınırı
    E.cizgi(ctx, [[axX, -SINIR * KB], [440, -SINIR * KB]], { renk: 'limon', kalinlik: 2 * px, kesik: [12 * px, 10 * px], alfa: 0.7 });
    ctx.restore();
    ctx.restore();
    // ekran uzayı etiketler
    const [lx] = K.p(axX, 0);
    for (let v = 0; v <= 56; v++) {
      const on = v % 10 === 0;
      const a = (v >= 48 ? 1 : ac) * (on ? Math.max(birimA, onA) : birimA);
      if (a < 0.02) continue;
      const [, y] = K.p(axX, -v * KB);
      kYazi(ctx, K, String(v), lx - 18, y, { boyut: 22, agirlik: 560, hiza: 'right', renk: v === 48 && ac > 0.5 ? 'mercan' : 'gumus', alfa: a * va });
    }
    const etk = ['Mart', 'Nisan'];
    const yakin = 1 - ara(t, 5.4, 6.6), uzak = ara(t, 7.4, 8.2);
    [M_ORT, N_ORT].forEach((v, i) => {
      const [x, y] = K.p(bx[i], -lerp(48, v, buyu) * KB);
      kYazi(ctx, K, etk[i], x, y - 26, { boyut: 30, agirlik: 740, alfa: yakin * ara(t, 1.2, 1.8) });
      const [xs] = K.p(bx[i] + (i ? bw / 2 : -bw / 2), 0);
      kYazi(ctx, K, etk[i] + ' · ' + sy(v), xs + (i ? 14 : -14), y, { boyut: 24, agirlik: 700, hiza: i ? 'left' : 'right', renk: i ? 'mercan' : 'gok', alfa: uzak });
    });
    const [sx, sy2] = K.p(440, -SINIR * KB);
    kYazi(ctx, K, 'hız sınırı ' + SINIR, Math.min(sx, V.x + V.w - 20) - 8, sy2 - 18, { boyut: 22, agirlik: 640, hiza: 'right', renk: 'limon', alfa: yakin * va * 0.9 });
    kYazi(ctx, K, 'ortalama hız (km/sa)', K.p(axX, 0)[0] + 12, K.p(0, -56 * KB)[1] - 6, { boyut: 22, agirlik: 600, hiza: 'left', renk: 'gumus', alfa: uzak });
    const [nx, ny] = K.p(bx[1] + bw / 2, -N_ORT * KB);
    kYazi(ctx, K, '+' + sy(ARTIS) + ' km/sa ≈ %' + Math.round(YUZDE), nx + 14, ny + 36, { boyut: 26, agirlik: 760, hiza: 'left', renk: 'limon', alfa: ara(t, 8.4, 9.0) });
    kYazi(ctx, K, 'eksen 48’den başlıyormuş', K.p(440, 0)[0] - 10, K.p(0, -48 * KB)[1] + 22, { boyut: 22, agirlik: 640, hiza: 'right', renk: 'mercan', alfa: ara(t, 6.0, 6.6) * (1 - ara(t, 7.4, 7.9)) });
    // vizör
    const L2 = 26, renk = kayit > 0.5 ? 'mercan' : 'gumus';
    for (const [cx, cy, sx2, sy3] of [[V.x + 10, V.y + 10, 1, 1], [V.x + V.w - 10, V.y + 10, -1, 1], [V.x + 10, V.y + V.h - 10, 1, -1], [V.x + V.w - 10, V.y + V.h - 10, -1, -1]])
      E.cizgi(ctx, [[cx, cy + sy3 * L2], [cx, cy], [cx + sx2 * L2, cy]], { renk, kalinlik: 2.5, alfa: va * (0.5 + 0.5 * kayit) });
    E.yazi(ctx, '× ' + sy(kam.z / zB, 1), V.x + V.w - 24, V.y + 26, { boyut: 22, agirlik: 700, hiza: 'right', renk: 'gumus', alfa: va, font: 'mono' });
    E.isik(ctx, V.x + V.w / 2, V.y + V.h / 2, V.w * 0.7, 'turkuaz', 0.16 * E.nabiz(t, 4.9, 3.1));
  };

  /* ---------- 3. Yöntem: üç adım, üç kadraj ---------- */
  const yontem = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const cx = ic.cx, cy = ic.cy;
    const kut = H ? [[420, 160], [780, 330], [1110, 500]] : [[420, 270], [540, 500], [640, 740]];
    const adim = [
      ['1  Temellendir', 'İddia hangi veriye, hangi özete dayanıyor?', 'gok'],
      ['2  Hata ya da yanlılık ara', 'Eksen nereden başlıyor? Hangi özet seçilmiş? Örneklem kim?', 'menekse'],
      ['3  Kabul et ya da çürüt', 'Kararını veriyle gerekçelendir.', 'limon'],
    ];
    kut.forEach(([w, h], i) => {
      const t0 = 0.3 + i * 1.7;
      const p = ara(t, t0, t0 + 1.0, 'cik3');
      if (p <= 0.01) return;
      const iw = i ? lerp(kut[i - 1][0], w, p) : w * lerp(0.6, 1, p), ih = i ? lerp(kut[i - 1][1], h, p) : h * lerp(0.6, 1, p);
      const x0 = cx - iw / 2, y0 = cy - ih / 2;
      const renk = adim[i][2];
      const L = 30;
      for (const [qx, qy, sx, sy2] of [[x0, y0, 1, 1], [x0 + iw, y0, -1, 1], [x0, y0 + ih, 1, -1], [x0 + iw, y0 + ih, -1, -1]])
        E.cizgi(ctx, [[qx, qy + sy2 * L], [qx, qy], [qx + sx * L, qy]], { renk, kalinlik: 3, parilti: 0.8, alfa: p });
      E.cizgi(ctx, [[x0, y0], [x0 + iw, y0], [x0 + iw, y0 + ih], [x0, y0 + ih]], { kapali: true, renk, kalinlik: 1, alfa: 0.25 * p });
      const ta = ara(t, t0 + 0.5, t0 + 1.1);
      E.yazi(ctx, adim[i][0], x0 + 22, y0 + 30, { boyut: H ? 28 : 26, agirlik: 760, hiza: 'left', renk, alfa: ta });
      E.yazi(ctx, adim[i][1], x0 + 22, y0 + 52, { boyut: 22, agirlik: 500, hiza: 'left', taban: 'top', renk: 'gumus', alfa: ta, maxGen: (H ? iw : w) - 44 });
      E.isik(ctx, cx, cy, Math.max(iw, ih) * 0.6, renk, 0.1 * E.nabiz(t, t0, 1.2));
    });
  };

  /* ---------- İddia 1: tüm veri (radar) ---------- */
  const RK = 20; // dünya: 1 km/sa = 20 birim
  const iddia1 = iddia({
    no: 1,
    iddia: '“Mahallemizde hız ihlalleri patladı!”',
    adimlar: [
      { baslik: 'Temellendir', t: 0.8, detay: 'Dayanak: radarın ölçtüğü ortalama hız. Mart ' + sy(M_ORT) + ', Nisan ' + sy(N_ORT) + ' km/sa.' },
      { baslik: 'Hata / yanlılık', t: 4.6, detay: 'Grafik yalnızca iki ortalamayı ve 48–52 aralığını gösteriyor. Kamerayı geri çek: her araç.' },
      { baslik: 'Karar', t: 10.6, detay: 'Fark ' + sy(ARTIS) + ' km/sa (≈ %' + Math.round(YUZDE) + '). Hızlar zaten ' + H_MIN + '–' + H_MAX + ' arasında değişiyor.', yuk: 84 },
    ],
    karar: { t: 11.6, kabul: false },
    keys: (V) => {
      const zA = (V.w * 0.86) / (5.2 * RK), zB = (V.w * 0.9) / (40 * RK);
      return [[0, 50 * RK, 0, zA], [5.0, 50 * RK, 0, zA], [8.2, 50 * RK, 6, zB]];
    },
    kadraj: (V, keys) => { const z = keys[0][3], cx = keys[0][1], cy = keys[0][2]; return [cx - V.w / 2 / z, cy - (V.h / 2 - 40) / z, cx + V.w / 2 / z, cy + V.h / 2 / z]; },
    dunya: (ctx, K, t) => {
      const px = 1 / K.z;
      E.cizgi(ctx, [[25 * RK, 0], [75 * RK, 0]], { renk: 'cizgi', kalinlik: 2.5 * px });
      for (let v = 25; v <= 75; v++) {
        const on = v % 5 === 0;
        E.cizgi(ctx, [[v * RK, -(on ? 9 : 5) * px], [v * RK, (on ? 9 : 5) * px]], { renk: 'cizgi', kalinlik: (on ? 2 : 1.4) * px });
      }
      E.cizgi(ctx, [[SINIR * RK, -400], [SINIR * RK, 400]], { renk: 'limon', kalinlik: 2 * px, kesik: [10 * px, 8 * px], alfa: 0.6 });
    },
    ust: (ctx, K, t, V) => {
      const z = K.z;
      const [, ay] = K.p(0, 0);
      // eksen etiketleri: adım ekrana göre seçilir
      const adimlar = [1, 2, 5, 10];
      const adim = adimlar.find((a) => a * RK * z >= 52) || 10;
      for (let v = 25; v <= 75; v++) {
        if (v % adim) continue;
        const [x] = K.p(v * RK, 0);
        kYazi(ctx, K, String(v), x, ay + 28, { boyut: 22, agirlik: 540, renk: 'gumus' });
      }
      kYazi(ctx, K, 'km/sa', V.x + V.w - 16, ay + 28, { boyut: 22, agirlik: 600, hiza: 'right', renk: 'gumus', alfa: ara(t, 7.6, 8.4) });
      // tüm araçlar (ekran uzayında sabit boyut): Mart üstte, Nisan altta
      const da = ara(t, 6.6, 8.2);
      const r = E.yatay ? 6 : 5.5, sp = E.yatay ? 13.5 : 12.5;
      [[MART, 'gok', -1, 1], [NISAN, 'mercan', 1, 2]].forEach(([veri, renk, yon, tohum]) => {
        const say = {};
        sirala(veri).forEach((v, i) => {
          const k = (say[v] = (say[v] ?? -1) + 1);
          const [x] = K.p(v * RK, 0);
          const gec = ara(da, E.hash(i, tohum) * 0.5, 0.5 + E.hash(i, tohum) * 0.5);
          if (gec <= 0) return;
          E.nokta(ctx, x, ay + yon * (16 + (k + 0.5) * sp) - yon * (1 - gec) * 30, r, { renk, alfa: gec, parilti: 0.4 });
        });
      });
      // ortalama işaretleri (yakın kadrajda büyük)
      const buyuk = clamp((Math.log(z) - Math.log(1.6)) / 0.9);
      [[M_ORT, 'gok', -1, 'Mart'], [N_ORT, 'mercan', 1, 'Nisan']].forEach(([v, renk, yon, ad]) => {
        const [x] = K.p(v * RK, 0);
        const boy = lerp(10, 22, buyuk), uz = lerp(70, 100, buyuk);
        const y1 = ay + yon * uz;
        E.cizgi(ctx, [[x, ay + yon * 6], [x, y1]], { renk, kalinlik: lerp(3, 6, buyuk), parilti: 1 });
        E.nokta(ctx, x, y1, boy * 0.5, { renk, parilti: 1 });
        const ya = 1 - ara(t, 5.6, 6.4);
        kYazi(ctx, K, ad + ' ort. ' + sy(v), x, y1 + yon * 36, { boyut: 34, agirlik: 760, renk, alfa: ya * ara(t, 0.6, 1.2) });
        kYazi(ctx, K, ad + ' ort. ' + sy(v), x + yon * 12, ay + yon * 88, { boyut: 22, agirlik: 700, hiza: yon < 0 ? 'right' : 'left', renk, alfa: ara(t, 8.0, 8.6) });
      });
      const [lx] = K.p(SINIR * RK, 0);
      kYazi(ctx, K, 'hız sınırı ' + SINIR, lx, ay + 122, { boyut: 22, agirlik: 640, renk: 'limon', alfa: ara(t, 8.2, 8.8) });
      // değişkenlik parantezi
      const pa = ara(t, 9.2, 9.8);
      if (pa > 0.01) {
        const [xa] = K.p(H_MIN * RK, 0), [xb] = K.p(H_MAX * RK, 0);
        const yb = ay - 112;
        E.cizgi(ctx, [[xa, yb + 10], [xa, yb], [xb, yb], [xb, yb + 10]], { renk: 'tebesir', kalinlik: 2, alfa: pa * 0.8 });
        kYazi(ctx, K, 'araçlar arası fark: ' + H_MIN + '–' + H_MAX + ' km/sa', (xa + xb) / 2, yb - 22, { boyut: 22, agirlik: 640, renk: 'tebesir', alfa: pa });
      }
    },
  });

  /* ---------- İddia 2: ortalama mı, ortanca mı? ---------- */
  const MK = 40 / 25000; // dünya: 25 000 TL = 40 birim
  const iddia2 = iddia({
    no: 2,
    iddia: '“Bu şirkette çalışırsan ortalama ' + binlik(MAAS_ORT) + ' TL kazanırsın.”',
    adimlar: [
      { baslik: 'Temellendir', t: 0.8, detay: 'Dayanak: ' + MAAS.length + ' çalışanın maaş ortalaması = ' + binlik(MAAS_ORT) + ' TL.' },
      { baslik: 'Hata / yanlılık', t: 4.6, detay: '9 kişi ' + binlik(MAAS[0]) + ' TL, 1 yönetici ' + binlik(MAAS[9]) + ' TL. Tek uç değer ortalamayı şişiriyor.' },
      { baslik: 'Karar', t: 11.0, detay: 'Tipik maaşı ortanca anlatır: ' + binlik(MAAS_MED) + ' TL. ' + MAAS.length + ' kişiden ' + ALTINDA + '’u ortalamanın altında.' },
    ],
    karar: { t: 12.0, kabul: false },
    keys: (V) => {
      const H = E.yatay;
      const zA = H ? 3.2 : 2.8;
      const zM = Math.min((V.w * 0.9) / 600, (V.h * 0.62) / 240);
      const zB = (V.h * 0.78) / (MAAS[9] * MK + 120);
      return [[0, 250, -MAAS_ORT * MK, zA], [4.6, 250, -MAAS_ORT * MK, zA], [6.8, 270, -95, zM], [7.8, 270, -95, zM], [10.2, 330, -(MAAS[9] * MK) / 2 - 60, zB]];
    },
    kadraj: (V, keys) => { const [, x, y, z] = keys[0]; return [x - V.w / 2 / z, y - (V.h / 2 - 40) / z, x + V.w / 2 / z, y + V.h / 2 / z]; },
    dunya: (ctx, K, t) => {
      const px = 1 / K.z;
      // zemin
      E.cizgi(ctx, [[-60, 0], [740, 0]], { renk: 'cizgi', kalinlik: 2.5 * px });
      MAAS.forEach((v, i) => {
        const x = i < 9 ? i * 60 : 660, w = 40, h = v * MK;
        const renk = i < 9 ? 'gok' : 'mercan';
        const g = ctx.createLinearGradient(0, -h, 0, 0);
        g.addColorStop(0, E.rgba(renk, 0.9)); g.addColorStop(1, E.rgba(renk, 0.35));
        ctx.fillStyle = g; ctx.fillRect(x, -h, w, h);
        // kişi simgesi
        ctx.fillStyle = E.rgba('tebesir', 0.85);
        ctx.beginPath(); ctx.arc(x + w / 2, -h - 14, 7, 0, E.TAU); ctx.fill();
      });
      // ortalama çizgisi
      E.cizgi(ctx, [[-60, -MAAS_ORT * MK], [740, -MAAS_ORT * MK]], { renk: 'limon', kalinlik: Math.max(3 * px, 1.2), parilti: 1 });
      // ortanca çizgisi
      const oa = ara(t, 11.0, 11.8);
      if (oa > 0) E.cizgi(ctx, [[-60, -MAAS_MED * MK], [lerp(-60, 740, oa), -MAAS_MED * MK]], { renk: 'turkuaz', kalinlik: 3 * px, parilti: 1 });
    },
    ust: (ctx, K, t, V) => {
      const H = E.yatay;
      const [ox, oy] = K.p(-60, -MAAS_ORT * MK);
      const yakin = 1 - ara(t, 4.8, 5.6);
      // yakın kadraj: parlak rakam
      const [cx] = K.p(250, 0);
      kYazi(ctx, K, 'ortalama maaş', cx, oy - 74, { boyut: 26, agirlik: 640, renk: 'gumus', alfa: yakin * ara(t, 0.4, 1.0) });
      kYazi(ctx, K, binlik(MAAS_ORT) + ' TL', cx, oy - 34, { boyut: H ? 54 : 48, agirlik: 800, renk: 'limon', alfa: yakin * ara(t, 0.6, 1.2), parilti: 0.4 });
      // geniş kadraj etiketleri
      const orta = ara(t, 6.4, 7.0) * (1 - ara(t, 7.8, 8.4));
      const [x0, g0] = K.p(0, 0), [x8] = K.p(8 * 60 + 40, 0);
      kYazi(ctx, K, '9 çalışan × ' + binlik(MAAS[0]) + ' TL', (x0 + x8) / 2, g0 + 30, { boyut: 24, agirlik: 680, renk: 'gok', alfa: ara(t, 6.2, 6.9) });
      kYazi(ctx, K, 'ortalama ' + binlik(MAAS_ORT), ox + 8, oy - 20, { boyut: 22, agirlik: 700, hiza: 'left', renk: 'limon', alfa: orta });
      kYazi(ctx, K, '… hepsi çizginin altında', (x0 + x8) / 2, (oy + g0) / 2 + 6, { boyut: 22, agirlik: 600, renk: 'gumus', alfa: orta });
      const [mx, my] = K.p(680, -MAAS[9] * MK);
      kYazi(ctx, K, 'yönetici: ' + binlik(MAAS[9]) + ' TL', mx - 40, my + 14, { boyut: 26, agirlik: 760, hiza: 'right', renk: 'mercan', alfa: ara(t, 9.4, 10.0) });
      const son = ara(t, 10.2, 10.8);
      const [lx] = K.p(-70, 0), [, ry] = K.p(0, -MAAS_MED * MK);
      kYazi(ctx, K, 'ortalama ' + binlik(MAAS_ORT), lx - 6, oy, { boyut: 22, agirlik: 700, hiza: 'right', renk: 'limon', alfa: son });
      kYazi(ctx, K, 'ortanca ' + binlik(MAAS_MED), lx - 6, Math.min(ry, g0 - 4) + 4, { boyut: 22, agirlik: 700, hiza: 'right', renk: 'turkuaz', alfa: ara(t, 11.2, 11.8) });
      void V;
    },
  });

  /* ---------- İddia 3: örneklem kim? ---------- */
  const OKUL_SUT = 40, OKUL_SAT = 30, ARA = 12;
  const OKUL_NOKTA = (() => {
    const n = [];
    for (let r = 0; r < OKUL_SAT; r++) for (let c = 0; c < OKUL_SUT; c++) n.push({ x: (c - (OKUL_SUT - 1) / 2) * ARA, y: (r - (OKUL_SAT - 1) / 2) * ARA, i: n.length });
    // anket: sağ üst köşede, gece 23:00'te sunucudaki 200 kişi (düzensiz bir küme)
    const mx = 150, my = -110;
    const sir = n.slice().sort((a, b) => (Math.hypot(a.x - mx, (a.y - my) * 1.15) + E.hash(a.i, 3) * 26) - (Math.hypot(b.x - mx, (b.y - my) * 1.15) + E.hash(b.i, 3) * 26));
    sir.slice(0, KATILAN).forEach((d) => { d.anket = true; });
    // karşılaştırma: kurayla 200 kişi
    const kura = n.slice().sort((a, b) => E.hash(a.i, 91) - E.hash(b.i, 91));
    kura.slice(0, KATILAN).forEach((d, j) => { d.kura = j; });
    return n;
  })();
  const ANKET_MERKEZ = (() => { const a = OKUL_NOKTA.filter((d) => d.anket); return [ortalama(a.map((d) => d.x)), ortalama(a.map((d) => d.y))]; })();
  const iddia3 = iddia({
    no: 3,
    iddia: '“Öğrencilerin %' + Math.round(ORAN) + '’ı okulun 10:00’da başlamasını istiyor.”',
    adimlar: [
      { baslik: 'Temellendir', t: 0.8, detay: 'Dayanak: ' + KATILAN + ' kişilik anket, ' + EVET + ' kişi “evet” dedi.' },
      { baslik: 'Hata / yanlılık', t: 4.8, detay: 'Anket gece 23:00’te bir oyun sunucusunda yapılmış. Örneklem okulu temsil etmiyor.' },
      { baslik: 'Karar', t: 11.0, detay: 'Yanlı örneklem: sonuç bütün okula genellenemez. Kurayla seçilmiş bir örneklem gerekir.' },
    ],
    karar: { t: 12.0, kabul: false },
    keys: (V) => {
      const [ax, ay] = ANKET_MERKEZ;
      const zA = (V.h * 0.62) / 120, zM = (V.h * 0.66) / 200;
      const zB = Math.min((V.w * 0.94) / (OKUL_SUT * ARA + 20), (V.h - 160) / (OKUL_SAT * ARA + 20));
      return [[0, ax, ay, zA], [4.8, ax, ay, zA], [6.8, ax - 6, ay + 4, zM], [7.4, ax - 6, ay + 4, zM], [9.8, 0, 0, zB]];
    },
    kadraj: (V, keys) => { const [, x, y, z] = keys[0]; return [x - V.w / 2 / z, y - (V.h / 2 - 40) / z, x + V.w / 2 / z, y + V.h / 2 / z]; },
    dunya: (ctx, K, t) => {
      const px = 1 / K.z;
      const [ax, ay] = ANKET_MERKEZ;
      // sunucu penceresi
      const sa = ara(t, 5.4, 6.2) * (1 - 0.5 * ara(t, 11.4, 12.4));
      if (sa > 0) {
        const w = 230, h = 170;
        E.panel(ctx, ax - w / 2, ay - h / 2 - 8, w, h + 16, { r: 10, renk: 'menekse', dolguAlfa: 0.08, kenar: 'menekse', kenarAlfa: 0.9, kalinlik: 2 * px, alfa: sa });
      }
      // okul binası çerçevesi
      const oa = ara(t, 8.6, 9.6);
      if (oa > 0) {
        const W = OKUL_SUT * ARA + 16, Hh = OKUL_SAT * ARA + 16;
        E.panel(ctx, -W / 2, -Hh / 2, W, Hh, { r: 12, renk: 'gok', dolguAlfa: 0.05, kenar: 'gok', kenarAlfa: 0.7, kalinlik: 2 * px, alfa: oa });
      }
    },
    ust: (ctx, K, t, V) => {
      const H = E.yatay;
      const z = K.z;
      const r = clamp(z * 3.6, 2.2, 9);
      const okulA = ara(t, 7.6, 9.2);
      const kuraP = ara(t, 12.6, 14.4);
      for (const d of OKUL_NOKTA) {
        const [x, y] = K.p(d.x, d.y);
        if (!K.icinde(x, y, 10)) continue;
        let renk = 'gok', a = 0.35 * okulA, par = 0;
        if (d.anket) { renk = 'menekse'; a = 1 - 0.55 * kuraP; par = 0.6; }
        if (d.kura !== undefined) {
          const g = ara(kuraP, d.kura / KATILAN * 0.7, d.kura / KATILAN * 0.7 + 0.3);
          if (g > 0) { renk = d.anket && g < 0.5 ? renk : 'turkuaz'; a = Math.max(a, g); par = 0.7 * g; }
        }
        if (a <= 0.01) continue;
        E.nokta(ctx, x, y, r, { renk, alfa: a, parilti: par });
      }
      // halka grafik: %90 evet (yakın kadrajda)
      const [ax, ay] = ANKET_MERKEZ;
      const [hx, hy] = K.p(ax, ay);
      const ha = ara(t, 0.4, 1.2) * (1 - ara(t, 5.0, 5.8));
      if (ha > 0.01) {
        const R = H ? 110 : 96;
        E.isik(ctx, hx, hy, R * 2, 'menekse', 0.25 * ha);
        E.panel(ctx, hx - R - 20, hy - R - 20, 2 * R + 40, 2 * R + 40, { r: R + 20, renk: 'gece', dolguAlfa: 0.82, kenar: null, alfa: ha });
        ctx.save(); ctx.globalAlpha *= ha; ctx.lineCap = 'butt';
        ctx.lineWidth = 26; ctx.strokeStyle = E.rgba('sis', 1);
        ctx.beginPath(); ctx.arc(hx, hy, R, 0, E.TAU); ctx.stroke();
        const p = ara(t, 0.6, 2.0, 'io3');
        ctx.strokeStyle = E.R('menekse'); ctx.shadowColor = E.rgba('menekse', 0.8); ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.arc(hx, hy, R, -Math.PI / 2, -Math.PI / 2 + E.TAU * (EVET / KATILAN) * p); ctx.stroke();
        ctx.restore();
        E.yazi(ctx, '%' + Math.round(ORAN * p), hx, hy - 8, { boyut: H ? 58 : 52, agirlik: 800, renk: 'tebesir', alfa: ha });
        E.yazi(ctx, 'evet', hx, hy + 38, { boyut: 24, agirlik: 600, renk: 'gumus', alfa: ha });
      }
      // etiketler
      const sa = ara(t, 5.6, 6.3) * (1 - ara(t, 7.6, 8.2));
      kYazi(ctx, K, 'Oyun sunucusu · saat 23:00', hx, K.p(ax, ay - 93)[1] - 20, { boyut: 24, agirlik: 700, renk: 'menekse', alfa: sa });
      kYazi(ctx, K, KATILAN + ' katılımcı', hx, K.p(ax, ay + 93)[1] + 22, { boyut: 22, agirlik: 600, renk: 'gumus', alfa: sa });
      const la = ara(t, 9.4, 10.0);
      const [, ty] = K.p(0, -(OKUL_SAT * ARA) / 2 - 8);
      const [, by] = K.p(0, (OKUL_SAT * ARA) / 2 + 8);
      kYazi(ctx, K, 'Evren: okulun ' + binlik(OKUL) + ' öğrencisi', V.x + V.w / 2, ty - 20, { boyut: 24, agirlik: 700, renk: 'gok', alfa: la * (1 - ara(t, 12.4, 12.9)) });
      kYazi(ctx, K, 'Kurayla ' + KATILAN + ' kişi: her öğrencinin şansı eşit', V.x + V.w / 2, ty - 20, { boyut: 24, agirlik: 700, renk: 'turkuaz', alfa: ara(t, 12.9, 13.5) });
      kYazi(ctx, K, 'anket: yalnızca sağ üst köşe', V.x + V.w / 2, by + 22, { boyut: 22, agirlik: 640, renk: 'menekse', alfa: la });
    },
  });

  /* ---------- İddia 4: kabul edilen iddia ---------- */
  const UK = 50; // dünya: 1 saat = 50 birim
  const iddia4 = iddia({
    no: 4,
    iddia: '“Okulumuzda 9. sınıflar gecede tipik olarak ' + sy(U_MED) + ' saat uyuyor.”',
    adimlar: [
      { baslik: 'Temellendir', t: 0.8, detay: 'Dayanak: kurayla seçilen ' + UYKU.length + ' öğrencinin bir haftalık uyku kaydı.' },
      { baslik: 'Hata / yanlılık', t: 4.6, detay: 'Eksen sıfırdan başlıyor, örneklem rastgele, uç değer yok. Ortalama ' + sy(U_ORT) + ', ortanca ' + sy(U_MED) + '.' },
      { baslik: 'Karar', t: 9.8, detay: 'Dağılım ve özetler iddiayla tutarlı: örneklemimize göre muhtemelen doğru.' },
    ],
    karar: { t: 10.8, kabul: true },
    keys: (V) => {
      const zA = (V.w * 0.86) / (1.4 * UK), zB = (V.w * 0.9) / (12.4 * UK);
      return [[0, U_MED * UK, -10, zA], [4.6, U_MED * UK, -10, zA], [7.6, 6 * UK, E.yatay ? -90 : -70, zB]];
    },
    kadraj: (V, keys) => { const [, x, y, z] = keys[0]; return [x - V.w / 2 / z, y - (V.h / 2 - 40) / z, x + V.w / 2 / z, y + V.h / 2 / z]; },
    dunya: (ctx, K) => {
      const px = 1 / K.z;
      E.cizgi(ctx, [[0, 0], [12 * UK, 0]], { renk: 'cizgi', kalinlik: 2.5 * px });
      for (let v = 0; v <= 24; v++) {
        const on = v % 2 === 0;
        E.cizgi(ctx, [[v * UK / 2, -(on ? 9 : 5) * px], [v * UK / 2, (on ? 9 : 5) * px]], { renk: 'cizgi', kalinlik: (on ? 2 : 1.4) * px });
      }
    },
    ust: (ctx, K, t, V) => {
      const H = E.yatay;
      const z = K.z;
      const [, ay] = K.p(0, 0);
      const adim = [0.5, 1, 2].find((a) => a * UK * z >= 46) || 2;
      for (let v = 0; v <= 12 + 1e-9; v += adim) {
        const [x] = K.p(v * UK, 0);
        kYazi(ctx, K, sy(v), x, ay + 28, { boyut: 22, agirlik: 540, renk: 'gumus' });
      }
      kYazi(ctx, K, 'saat', V.x + V.w - 16, ay + 28, { boyut: 22, agirlik: 600, hiza: 'right', renk: 'gumus', alfa: ara(t, 7.4, 8.2) });
      // nokta grafiği (ekran uzayında)
      const da = ara(t, 6.4, 8.0);
      const r = H ? 7.5 : 6.5, sp = H ? 16.5 : 14;
      const say = {};
      sirala(UYKU).forEach((v, i) => {
        const k = (say[v] = (say[v] ?? -1) + 1);
        const g = ara(da, E.hash(i, 8) * 0.5, 0.5 + E.hash(i, 8) * 0.5);
        if (g <= 0) return;
        const [x] = K.p(v * UK, 0);
        E.nokta(ctx, x, ay - 16 - (k + 0.5) * sp - (1 - g) * 26, r, { renk: 'gok', alfa: g, parilti: 0.4 });
      });
      // kutu grafiği (eksenin altında)
      const ka = ara(t, 8.2, 9.0);
      if (ka > 0.01) {
        const by = ay + (H ? 82 : 64), bh = H ? 40 : 32;
        const [x1] = K.p(U_Q[0] * UK, 0), [xm] = K.p(U_Q[1] * UK, 0), [x3] = K.p(U_Q[2] * UK, 0);
        const [xa] = K.p(Math.min(...UYKU) * UK, 0), [xb] = K.p(Math.max(...UYKU) * UK, 0);
        ctx.save(); ctx.globalAlpha *= ka;
        E.cizgi(ctx, [[xa, by], [x1, by]], { renk: 'gumus', kalinlik: 2.5 });
        E.cizgi(ctx, [[x3, by], [xb, by]], { renk: 'gumus', kalinlik: 2.5 });
        for (const x of [xa, xb]) E.cizgi(ctx, [[x, by - 10], [x, by + 10]], { renk: 'gumus', kalinlik: 2.5 });
        ctx.fillStyle = E.rgba('turkuaz', 0.16); ctx.fillRect(x1, by - bh / 2, x3 - x1, bh);
        E.cizgi(ctx, [[x1, by - bh / 2], [x3, by - bh / 2], [x3, by + bh / 2], [x1, by + bh / 2]], { kapali: true, renk: 'turkuaz', kalinlik: 2.5, parilti: 0.6 });
        E.cizgi(ctx, [[xm, by - bh / 2], [xm, by + bh / 2]], { renk: 'limon', kalinlik: 3.5, parilti: 1 });
        ctx.restore();
        kYazi(ctx, K, 'ortanca ' + sy(U_MED) + ' · ortalama ' + sy(U_ORT) + ' · ÇA ' + sy(U_Q[2] - U_Q[0]) + ' saat', V.x + V.w / 2, by + bh / 2 + 28, { boyut: 22, agirlik: 640, renk: 'tebesir', alfa: ara(t, 8.8, 9.4) });
      }
      // yakın kadraj: "7 saat"
      const [mx] = K.p(U_MED * UK, 0);
      const yakin = 1 - ara(t, 4.8, 5.6);
      E.cizgi(ctx, [[mx, ay - 6], [mx, ay - 120]], { renk: 'limon', kalinlik: 5, parilti: 1, alfa: yakin * ara(t, 0.4, 1.0) });
      kYazi(ctx, K, sy(U_MED) + ' saat', mx, ay - 150, { boyut: H ? 54 : 48, agirlik: 800, renk: 'limon', alfa: yakin * ara(t, 0.6, 1.2), parilti: 0.35 });
      kYazi(ctx, K, 'tipik değer', mx, ay - 196, { boyut: 26, agirlik: 600, renk: 'gumus', alfa: yakin * ara(t, 0.8, 1.4) });
      // kontrol listesi (geniş kadrajda, sağ üst)
      const kl = [['eksen tam', 7.8], ['örneklem rastgele', 8.3], ['ortalama ≈ ortanca', 8.8]];
      kl.forEach(([m, ts], j) => {
        const a = ara(t, ts, ts + 0.5);
        kYazi(ctx, K, '✓ ' + m, V.x + 24, V.y + (H ? 70 : 66) + j * 34, { boyut: 22, agirlik: 640, hiza: 'left', renk: 'turkuaz', alfa: a });
      });
    },
  });

  /* ---------- Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Ekseni kontrol et: nereden başlıyor?', formul: '48 → 0' },
    { tr: 'Uç değer varsa ortancaya bak.', formul: '\\t{ortalama} \\ne \\t{tipik}' },
    { tr: 'Örneklem kim? Rastgele mi seçildi?', formul: '\\t{örneklem} \\subset \\t{evren}' },
    { tr: 'Kararını veriyle ver: kabul et ya da çürüt.', formul: '\\t{✓ / ✗}' },
  ], { aralik: 1.5 });
  const bitis = (ctx, s) => E.bitisKarti(ctx, s, meta);

  /* ---------- Film ---------- */
  E.film({
    meta,
    sure: 106,
    sahneler: [
      { ad: 'Soğuk açılış: kesik eksen', bas: 0, son: 12.5, giris: 0, cikis: 0.7, ciz: acilis, itme: 0 },
      { ad: 'İmza', bas: 12.2, son: 15.9, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 15.6, son: 19.9, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Üç adım, üç kadraj', bas: 19.7, son: 26.5, ciz: yontem },
      { ad: 'İddia 1: tüm veri', bas: 26.3, son: 42.5, ciz: iddia1, itme: 0 },
      { ad: 'İddia 2: ortalama mı, ortanca mı?', bas: 42.3, son: 58.5, ciz: iddia2, itme: 0 },
      { ad: 'İddia 3: örneklem kim?', bas: 58.3, son: 74.5, ciz: iddia3, itme: 0 },
      { ad: 'İddia 4: kabul', bas: 74.3, son: 89.0, ciz: iddia4, itme: 0 },
      { ad: 'Aklında kalsın', bas: 88.8, son: 99.5, ciz: ozet },
      { ad: 'Laboratuvar', bas: 99.3, son: 106, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 5, renk1: 'gok', renk2: 'mercan' }),
  });
})();
