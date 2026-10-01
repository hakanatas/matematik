/* ==========================================================================
   EKSEN 9.4.5 — Ulaşılamayanı Ölçmek
   Tek fikir: Dokunamadığın bir uzunluğu, ona benzer küçük bir üçgen kurarak
   ölçersin. Gölge, ayna ve kazık: araç değişir, benzerlik aynı kalır.
   Problem çözme döngüsü (verilen → çizim → strateji → çözüm → kontrol)
   bir saha ölçümü gibi ekranın üstünde ilerler.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp } = E;

  const meta = {
    kod: 'MAT.9.4.5',
    tema: 'Eşlik ve Benzerlik',
    ad: 'Ulaşılamayanı Ölçmek',
    adEn: 'Measuring the Unreachable',
    labAd: 'Dönüşüm ve Benzerlik Laboratuvarı',
    labAciklama: 'Tales paralelini ve benzer üçgenleri sürükle; oranın nasıl korunduğunu kendin gör.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-donusumler/',
  };

  /* ======================= Yardımcılar ======================= */
  const TAU = Math.PI * 2;
  const loglerp = (a, b, p) => Math.exp(lerp(Math.log(a), Math.log(b), p));
  /** Dünya (metre) → ekran izdüşümü: (fx,fy) dünya noktası ekranda (ax,ay)'ye gelir */
  const izdusum = (pm, fx, fy, ax, ay) => ({
    pm, x: (m) => ax + (m - fx) * pm, y: (n) => ay - (n - fy) * pm,
    p(m, n) { return [ax + (m - fx) * pm, ay - (n - fy) * pm]; },
  });

  /* ---------- Gökyüzü: gün batımı (palet tokenlarıyla) ---------- */
  const gokCiz = (ctx, o) => {
    const W = E.W, Hh = E.H, u = o.ufuk, s = o.sicak ?? 1;
    const g = ctx.createLinearGradient(0, u - Hh * 0.95, 0, u + 30);
    g.addColorStop(0, E.P.gece);
    g.addColorStop(0.45, E.karistir('gece', 'derin', 0.9));
    g.addColorStop(0.75, E.karistir('derin', 'menekse', 0.32 * s));
    g.addColorStop(0.92, E.karistir(E.karistir('derin', 'menekse', 0.5), 'mercan', 0.55 * s));
    g.addColorStop(1, E.karistir('mercan', 'limon', 0.25 * s));
    ctx.fillStyle = g; ctx.fillRect(-W, -Hh, W * 3, u + Hh + 40);
    // ufuk ışıması
    E.isik(ctx, o.gx, u, Math.max(W, Hh) * 0.9, 'mercan', 0.22 * s);
    E.isik(ctx, o.gx, o.gy, Math.max(W, Hh) * 0.45, 'mercan', 0.28 * s);
    E.isik(ctx, o.gx, o.gy, 160, 'limon', 0.45 * s);
    // güneş diski
    const r = o.r ?? 42;
    ctx.save();
    const gg = ctx.createRadialGradient(o.gx - r * 0.2, o.gy - r * 0.2, r * 0.1, o.gx, o.gy, r);
    gg.addColorStop(0, E.karistir('tebesir', 'limon', 0.5)); gg.addColorStop(0.7, E.karistir('limon', 'mercan', 0.45)); gg.addColorStop(1, E.karistir('mercan', 'limon', 0.3));
    ctx.fillStyle = gg; ctx.globalAlpha *= s; ctx.beginPath(); ctx.arc(o.gx, o.gy, r, 0, TAU); ctx.fill();
    ctx.restore();
    // yıldızlar (üstte, tohumlu)
    const rr = E.rng(505);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 60; i++) {
      const x = rr() * W, y = rr() * (u * 0.55), b = 0.5 + rr() * 1.2, ti = 0.5 + 0.5 * Math.sin((o.t || 0) * (0.8 + rr()) + i);
      ctx.fillStyle = E.rgba('tebesir', 0.35 * ti * (1 - y / (u * 0.55)));
      ctx.beginPath(); ctx.arc(x, y, b, 0, TAU); ctx.fill();
    }
    ctx.restore();
  };

  /** Paralel güneş huzmeleri (yön: eğim k = düşey/yatay) */
  const huzmeler = (ctx, k, alfa, t, tohum = 3) => {
    if (alfa <= 0.002) return;
    const W = E.W, Hh = E.H, aci = Math.atan(k), uz = Math.hypot(W, Hh) * 1.6;
    const r = E.rng(tohum);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.translate(W / 2, Hh / 2); ctx.rotate(aci);
    for (let i = 0; i < 14; i++) {
      const y = (r() - 0.5) * uz * 0.8, w = 10 + r() * 50, a = (0.025 + r() * 0.05) * (0.6 + 0.4 * Math.sin(t * 0.7 + i));
      const g = ctx.createLinearGradient(0, y - w, 0, y + w);
      g.addColorStop(0, E.rgba('limon', 0)); g.addColorStop(0.5, E.rgba(i % 3 ? 'limon' : 'mercan', a * alfa)); g.addColorStop(1, E.rgba('limon', 0));
      ctx.fillStyle = g; ctx.fillRect(-uz / 2, y - w, uz, w * 2);
    }
    ctx.restore();
  };

  /* ---------- Şehir silueti (tohumlu, t'den bağımsız önbellek) ---------- */
  const SIL = {};
  const siluetVeri = (tohum, x0, x1, gen, hMin, hMax) => {
    const key = [tohum, x0, x1, gen, hMin, hMax].join('|');
    if (SIL[key]) return SIL[key];
    const r = E.rng(tohum), L = [];
    let x = x0;
    while (x < x1) {
      const w = gen * (0.55 + r() * 0.9);
      const z = r();
      const tur = z < 0.12 ? 'kubbe' : z < 0.22 ? 'anten' : z < 0.3 ? 'cati' : 'blok';
      const h = lerp(hMin, hMax, Math.pow(r(), 1.3));
      L.push({ x, w, h, tur, pt: r() });
      x += w + r() * gen * 0.12;
    }
    return (SIL[key] = L);
  };
  const siluetCiz = (ctx, veri, taban, renk, o = {}) => {
    ctx.save();
    ctx.fillStyle = renk;
    for (const b of veri) {
      const x = b.x, w = b.w, y = taban - b.h;
      ctx.beginPath();
      if (b.tur === 'kubbe') {
        const ty = taban - b.h * 0.55, r = w * 0.36;
        ctx.rect(x, ty, w, b.h * 0.55);
        ctx.moveTo(x + w / 2 + r, ty); ctx.arc(x + w / 2, ty, r, 0, Math.PI, true);
        // iki ince minare
        ctx.rect(x + w * 0.04, taban - b.h * 1.25, w * 0.07, b.h * 1.25);
        ctx.rect(x + w * 0.89, taban - b.h * 1.25, w * 0.07, b.h * 1.25);
        ctx.moveTo(x + w * 0.04, taban - b.h * 1.25); ctx.lineTo(x + w * 0.075, taban - b.h * 1.4); ctx.lineTo(x + w * 0.11, taban - b.h * 1.25);
        ctx.moveTo(x + w * 0.89, taban - b.h * 1.25); ctx.lineTo(x + w * 0.925, taban - b.h * 1.4); ctx.lineTo(x + w * 0.96, taban - b.h * 1.25);
      } else if (b.tur === 'cati') {
        ctx.moveTo(x, taban); ctx.lineTo(x, y + w * 0.3); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w, y + w * 0.3); ctx.lineTo(x + w, taban); ctx.closePath();
      } else {
        ctx.rect(x, y, w, b.h);
        if (b.tur === 'anten') ctx.rect(x + w * 0.45, y - b.h * 0.35, Math.max(1.5, w * 0.05), b.h * 0.35);
      }
      ctx.fill();
    }
    // pencereler
    if (o.pencere) {
      ctx.globalCompositeOperation = 'lighter';
      for (const [i, b] of veri.entries()) {
        if (b.tur !== 'blok' && b.tur !== 'anten') continue;
        const sx = 9, sy = 11;
        for (let yy = taban - b.h + 8; yy < taban - 6; yy += sy)
          for (let xx = b.x + 5; xx < b.x + b.w - 5; xx += sx) {
            const hsh = E.hash(Math.round(xx * 7 + yy * 13 + i), 77);
            if (hsh > 0.22) continue;
            ctx.fillStyle = E.rgba(hsh < 0.07 ? 'tebesir' : 'limon', o.pencere * (0.25 + hsh * 2));
            ctx.fillRect(xx, yy, 3, 4);
          }
      }
    }
    ctx.restore();
  };

  /* ---------- Figürler ---------- */
  /** Minare: (x, yz) taban, h yükseklik (alem ucu dahil) */
  const minare = (ctx, x, yz, h, o = {}) => {
    const w = Math.max(4, h * 0.07), a = o.alfa ?? 1;
    if (a <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= a;
    const yol = () => {
      ctx.beginPath();
      ctx.rect(x - w * 0.8, yz - h * 0.1, w * 1.6, h * 0.1);           // kaide
      ctx.rect(x - w / 2, yz - h * 0.8, w, h * 0.7 + 1);                // gövde
      for (const f of [0.52, 0.74]) {                                    // şerefeler
        ctx.rect(x - w * 0.95, yz - h * f - h * 0.016, w * 1.9, h * 0.016);
        ctx.moveTo(x - w * 0.95, yz - h * f); ctx.lineTo(x - w * 0.5, yz - h * f + h * 0.03); ctx.lineTo(x + w * 0.5, yz - h * f + h * 0.03); ctx.lineTo(x + w * 0.95, yz - h * f); ctx.closePath();
      }
      ctx.rect(x - w * 0.4, yz - h * 0.86, w * 0.8, h * 0.06 + 1);      // petek
      ctx.moveTo(x - w * 0.55, yz - h * 0.86); ctx.lineTo(x, yz - h * 0.975); ctx.lineTo(x + w * 0.55, yz - h * 0.86); ctx.closePath(); // külah
    };
    yol(); ctx.fillStyle = E.R(o.renk || 'gece'); ctx.fill();
    if (o.kenar) { ctx.strokeStyle = E.rgba(o.kenar, 0.75 * (o.kenarAlfa ?? 1)); ctx.lineWidth = 1.2; ctx.stroke(); }
    // alem
    ctx.strokeStyle = E.R(o.kenar || 'gumus'); ctx.lineWidth = Math.max(1.5, w * 0.12);
    ctx.beginPath(); ctx.moveTo(x, yz - h * 0.975); ctx.lineTo(x, yz - h); ctx.stroke();
    ctx.restore();
  };
  /** İnsan silueti: ayak (x, yz), boy px */
  const insan = (ctx, x, yz, boy, o = {}) => {
    const a = o.alfa ?? 1;
    if (a <= 0.002 || boy < 2) return;
    const renk = E.R(o.renk || 'tebesir');
    const bas = boy * 0.075;
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = renk; ctx.fillStyle = renk; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.arc(x, yz - boy + bas, bas, 0, TAU); ctx.fill();
    const omuz = yz - boy * 0.8, kalca = yz - boy * 0.47;
    ctx.lineWidth = Math.max(2, boy * 0.11);
    ctx.beginPath(); ctx.moveTo(x, yz - boy + bas * 2.3); ctx.lineTo(x, kalca); ctx.stroke();
    ctx.lineWidth = Math.max(1.5, boy * 0.065);
    ctx.beginPath();
    ctx.moveTo(x, kalca); ctx.lineTo(x - boy * 0.07, yz); ctx.moveTo(x, kalca); ctx.lineTo(x + boy * 0.06, yz);
    const kol = o.kol ?? 0;
    ctx.moveTo(x, omuz); ctx.lineTo(x - boy * 0.09, yz - boy * 0.48);
    ctx.moveTo(x, omuz); ctx.lineTo(x + boy * (0.09 + 0.12 * kol), yz - boy * (0.48 + 0.25 * kol));
    ctx.stroke();
    ctx.restore();
  };
  /** Ağaç: taban (x, yz), h tepe yüksekliği (taç tepesi tam h) */
  const agac = (ctx, x, yz, h, o = {}) => {
    const a = o.alfa ?? 1;
    if (a <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = E.karistir('sis', 'gece', 0.3);
    ctx.beginPath(); ctx.moveTo(x - h * 0.035, yz); ctx.lineTo(x - h * 0.02, yz - h * 0.55); ctx.lineTo(x + h * 0.02, yz - h * 0.55); ctx.lineTo(x + h * 0.035, yz); ctx.closePath(); ctx.fill();
    const r0 = h * 0.24;
    const loblar = [[0, h - r0, r0], [-h * 0.17, h * 0.62, h * 0.18], [h * 0.17, h * 0.6, h * 0.19], [-h * 0.06, h * 0.5, h * 0.17], [h * 0.08, h * 0.72, h * 0.2], [-h * 0.12, h * 0.8, h * 0.15]];
    const g = ctx.createLinearGradient(x - h * 0.3, yz - h, x + h * 0.3, yz - h * 0.4);
    g.addColorStop(0, E.karistir('derin', 'turkuaz', 0.32)); g.addColorStop(1, E.karistir('gece', 'derin', 0.6));
    ctx.fillStyle = g;
    ctx.beginPath();
    for (const [dx, yy, r] of loblar) { ctx.moveTo(x + dx + r, yz - yy); ctx.arc(x + dx, yz - yy, r, 0, TAU); }
    ctx.fill();
    if (o.kenar) {
      ctx.strokeStyle = E.rgba(o.kenar, 0.5); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, yz - h + r0, r0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    }
    ctx.restore();
  };

  /** Ölçü çizgisi: uç çentikli, ortada etiketli */
  const olcu = (ctx, x0, y0, x1, y1, etiket, o = {}) => {
    const a = o.alfa ?? 1;
    if (a <= 0.002) return;
    const renk = o.renk || 'gumus';
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, c = 8;
    E.cizgi(ctx, [[x0, y0], [x1, y1]], { renk, kalinlik: 2, alfa: a * 0.9, p: o.p ?? 1 });
    E.cizgi(ctx, [[x0 - nx * c, y0 - ny * c], [x0 + nx * c, y0 + ny * c]], { renk, kalinlik: 2, alfa: a * 0.9 });
    if ((o.p ?? 1) > 0.98) E.cizgi(ctx, [[x1 - nx * c, y1 - ny * c], [x1 + nx * c, y1 + ny * c]], { renk, kalinlik: 2, alfa: a * 0.9 });
    if (etiket) {
      const ex = (x0 + x1) / 2 + (o.dx || 0), ey = (y0 + y1) / 2 + (o.dy || 0);
      E.etiket(ctx, etiket, ex, ey, { formul: true, boyut: o.boyut || E.yd(28, 26), renk: o.yaziRenk || renk, alfa: a * clamp(((o.p ?? 1) - 0.6) / 0.4), hiza: o.hiza || 'center', plakaAlfa: 0.78 });
    }
  };

  /* ---------- Problem çözme şeridi ---------- */
  const ADIMLAR = ['Verilen', 'Çizim', 'Strateji', 'Çözüm', 'Kontrol'];
  const serit = (ctx, aktif, alfa) => {
    if (alfa <= 0.002) return;
    const L = E.L, ic = L.icerik;
    const y = ic.y + E.yd(10, 10);
    const gen = E.yd(860, ic.w - 40), x0 = L.cx - gen / 2, adim = gen / ADIMLAR.length;
    const xs = ADIMLAR.map((_, i) => x0 + adim * (i + 0.5));
    E.cizgi(ctx, [[xs[0], y], [xs[4], y]], { renk: 'sis', kalinlik: 2, alfa });
    const ilerleme = clamp(aktif / 4);
    E.cizgi(ctx, [[xs[0], y], [lerp(xs[0], xs[4], ilerleme), y]], { renk: 'turkuaz', kalinlik: 2.5, parilti: 0.6, alfa });
    ADIMLAR.forEach((ad, i) => {
      const yakin = clamp(1 - Math.abs(aktif - i) * 1.6);
      const bitti = aktif > i + 0.5;
      E.nokta(ctx, xs[i], y, 6 + yakin * 3, { renk: yakin > 0.3 ? 'limon' : bitti ? 'turkuaz' : 'sis', parilti: yakin > 0.3 ? 1.2 : bitti ? 0.4 : 0, bos: !bitti && yakin < 0.3, alfa });
      E.yazi(ctx, ad, xs[i], y + 28, { boyut: 22, agirlik: yakin > 0.3 ? 700 : 560, renk: yakin > 0.3 ? 'limon' : bitti ? 'tebesir' : 'gumus', alfa: alfa * (0.6 + 0.4 * Math.max(yakin, bitti ? 1 : 0)) });
    });
  };

  /** Arka plan: soluk şehir silueti ve ufuk ışıması (fikir sahnelerinde süreklilik) */
  const arkaSehir = (ctx, taban, alfa, sicak = 0.6) => {
    if (alfa <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= alfa;
    E.isik(ctx, E.W * 0.15, taban, E.W * 0.9, 'mercan', 0.12 * sicak);
    E.isik(ctx, E.W * 0.15, taban - 40, E.W * 0.5, 'menekse', 0.1);
    siluetCiz(ctx, siluetVeri(91, -40, E.W + 40, E.yd(46, 38), 20, E.yd(120, 110)), taban, E.karistir('derin', 'menekse', 0.18, 0.55), { pencere: 0.25 });
    ctx.restore();
  };

  /* ======================= 1. Soğuk açılış ======================= */
  const acilis = (ctx, s) => {
    const t = s.t, W = E.W, Hh = E.H, H = E.yatay, L = E.L;
    const u = H ? 500 : 770;
    const Tx = H ? 470 : 170, Th = H ? 300 : 330;
    const k = 1.7 / 2.5; // güneş eğimi
    const gx = H ? 180 : 110, gy = H ? 150 : 250;
    // kamera: minarenin tepesinden geri çekil
    const q = ara(t, 0.0, 6.2, 'io3');
    const z = lerp(H ? 2.2 : 2.0, 1, q);
    const fx = lerp(Tx + 40, W / 2, q), fy = lerp(u - Th * 0.88, Hh / 2, q);
    // gökyüzü: hafif paralaks
    ctx.save();
    E.kamera(ctx, { x: lerp(fx, W / 2, 0.7), y: lerp(fy, Hh / 2, 0.7), z: 1 + (z - 1) * 0.3 });
    gokCiz(ctx, { ufuk: u, gx, gy, r: H ? 40 : 38, sicak: 0.75 + 0.25 * ara(t, 0, 4), t });
    ctx.restore();
    // huzmeler
    huzmeler(ctx, k, ara(t, 5.2, 7.2), t);
    ctx.save();
    E.kamera(ctx, { x: fx, y: fy, z });
    // uzak ve orta siluet
    siluetCiz(ctx, siluetVeri(11, -300, W + 300, H ? 54 : 44, 30, H ? 150 : 170), u, E.karistir('derin', 'menekse', 0.22), { pencere: 0.35 });
    siluetCiz(ctx, siluetVeri(23, -300, W + 300, H ? 70 : 56, 20, H ? 95 : 110), u, E.karistir('lacivert', 'gece', 0.25), { pencere: 0.6 });
    // meydan zemini
    const zg = ctx.createLinearGradient(0, u, 0, u + 300);
    zg.addColorStop(0, E.karistir('lacivert', 'mercan', 0.12)); zg.addColorStop(1, E.P.gece);
    ctx.fillStyle = zg; ctx.fillRect(-W, u, W * 3, Hh);
    E.cizgi(ctx, [[-W, u], [W * 2, u]], { renk: 'mercan', kalinlik: 1.5, alfa: 0.35 });
    // meydan: perspektif derz çizgileri ve güneşin yansıması
    ctx.save(); ctx.beginPath(); ctx.rect(-W, u + 1, W * 3, Hh); ctx.clip();
    for (let i = -14; i <= 14; i++) {
      const xx = W / 2 + i * 90;
      E.cizgi(ctx, [[W / 2 + i * 26, u], [xx + i * 260, u + 900]], { renk: 'sis', kalinlik: 1, alfa: 0.35 });
    }
    for (let j = 1; j < 9; j++) { const yy = u + Math.pow(j / 9, 2) * 520; E.cizgi(ctx, [[-W, yy], [W * 2, yy]], { renk: 'sis', kalinlik: 1, alfa: 0.28 }); }
    E.isik(ctx, gx, u + 40, 260, 'mercan', 0.16);
    ctx.restore();
    // nesneler: minare, iki direk, öğrenci (gerçek oranlar: 34 m, 4 m, 1,7 m)
    const olc = Th / 34;
    const g = ara(t, 5.6, 8.6, 'io2');
    const golge = (x, hpx, renk, a = 1) => {
      const uc = x + (hpx / k) * g;
      if (g <= 0) return uc;
      const gr = ctx.createLinearGradient(x, 0, uc, 0);
      gr.addColorStop(0, E.rgba('gece', 0.95 * a)); gr.addColorStop(1, E.rgba('gece', 0.6 * a));
      ctx.fillStyle = gr; ctx.fillRect(x, u + 1, uc - x, 10);
      E.cizgi(ctx, [[x, u + 11], [uc, u + 11]], { renk, kalinlik: 2, parilti: 0.4, alfa: 0.75 * a });
      return uc;
    };
    const ucT = Tx + Th / k, Px = ucT - (1.7 * olc) / k;
    const direkler = H ? [Tx - 230, Tx + 120] : [Tx + 120, 560];
    golge(Tx, Th, 'mercan');
    for (const dx of direkler) golge(dx, 4 * olc, 'gumus', 0.7);
    golge(Px, 1.7 * olc, 'turkuaz');
    minare(ctx, Tx, u, Th, { renk: E.karistir('gece', 'derin', 0.4), kenar: 'mercan', kenarAlfa: 0.6 + 0.4 * ara(t, 5, 7) });
    for (const dx of direkler) {
      const hh = 4 * olc;
      E.cizgi(ctx, [[dx, u], [dx, u - hh], [dx + 7, u - hh]], { renk: 'gumus', kalinlik: 2, alfa: 0.8 });
      E.isik(ctx, dx + 7, u - hh + 2, 26, 'limon', 0.35);
    }
    insan(ctx, Px, u, 1.7 * olc, { renk: 'tebesir' });
    // ışın çizgileri (paralel) ve eşit açılar
    const ra = ara(t, 7.4, 8.4);
    if (ra > 0) {
      const isin = (x1, y1) => {
        const L0 = Th / k + 160;
        E.cizgi(ctx, [[x1 - L0, y1 - L0 * k], [x1, y1]], { renk: 'limon', kalinlik: 1.6 / z, parilti: 0.6, alfa: 0.85, p: ra });
      };
      isin(ucT, u); // minare tepesinden geçen ışın
      E.cizgi(ctx, [[Px, u - 1.7 * olc], [Px + (1.7 * olc) / k, u]], { renk: 'turkuaz', kalinlik: 2.5, alfa: ra });
      const ak = ara(t, 8.4, 9.2);
      E.aciYayi(ctx, ucT, u, 46, Math.PI, Math.PI + Math.atan(k), { renk: 'limon', alfa: ak, kalinlik: 2.5 });
      for (const dx of direkler) { const uc = dx + (4 * olc) / k; E.cizgi(ctx, [[dx, u - 4 * olc], [uc, u]], { renk: 'limon', kalinlik: 1.4, alfa: 0.6 * ra, p: ra }); E.aciYayi(ctx, uc, u, 22, Math.PI, Math.PI + Math.atan(k), { renk: 'limon', alfa: ak * 0.8, kalinlik: 2 }); }
    }
    // ön plan siluet (meydanın kenarı, kameradan yakın)
    ctx.restore();
    // h = ? işareti (ekran uzayında; kamera bitince)
    const ha = ara(t, 8.0, 8.8) * (q > 0.99 ? 1 : 0);
    if (ha > 0) {
      const lx = Tx - (H ? 34 : 28);
      olcu(ctx, lx, u, lx, u - Th, null, { renk: 'limon', alfa: ha, p: ara(t, 8.0, 9.0) });
      E.etiket(ctx, 'h = ?', lx - 10, u - Th / 2, { formul: true, boyut: H ? 36 : 34, renk: 'limon', hiza: 'right', alfa: ha, plakaAlfa: 0.8 });
    }
    // başlık sorusu
    const ya = ara(t, 2.6, 3.6) * (1 - ara(t, 6.6, 7.4));
    E.yazi(ctx, 'Tırmanmadan ölç.', L.cx, L.icerik.y + E.yd(40, 60), { boyut: E.yd(54, 50), agirlik: 760, alfa: ya, parilti: 0.25, parRenk: 'mercan' });
    // karartmadan aç
    const kar = 1 - ara(t, 0, 1.4, 'cik2');
    if (kar > 0) { ctx.fillStyle = E.rgba('gece', kar); ctx.fillRect(0, 0, W, Hh); }
  };

  /* ======================= Gölge yöntemi: yerleşim ======================= */
  const GY = () => {
    const ic = E.L.icerik;
    return E.yatay
      ? { G: ic.y + 500, X0: ic.x + 56, pm0: 12, pm1: 9, klip: [0, ic.y + 50, 770, 600], lensR: 96, lensDx: -128, lensDy: -200 }
      : { G: ic.y + 450, X0: ic.x + 40, pm0: 10.5, pm1: 8, klip: [0, ic.y + 50, 720, 520], lensR: 80, lensDx: -112, lensDy: -170 };
  };
  /**
   * Gölge diyagramı. o: P (izdüşüm), k (güneş eğimi), alfa'lar, etiketler
   */
  const golgeDiyagram = (ctx, P, o) => {
    const g = GY();
    const k = o.k, tip = 34 / k, sh = 1.7 / k, xs = tip - sh;
    const [kx, ky, kw, kh] = g.klip;
    ctx.save();
    ctx.beginPath(); ctx.rect(kx, ky, kw, kh - ky + 40); ctx.clip();
    const yz = P.y(0);
    // zemin
    E.cizgi(ctx, [[P.x(-12), yz], [P.x(tip + 14), yz]], { renk: 'cizgi', kalinlik: 2 });
    // ışın
    const isinA = o.isin ?? 1;
    E.cizgi(ctx, [P.p(-14, 34 + 14 * k), P.p(tip, 0)], { renk: 'limon', kalinlik: 2.2, parilti: 0.7, alfa: isinA, p: o.isinP ?? 1 });
    // gölgeler
    const strip = (x0, x1, renk, a) => { ctx.fillStyle = E.rgba(renk, a); ctx.fillRect(P.x(x0), yz + 2, P.x(x1) - P.x(x0), 7); };
    strip(0, tip, 'mercan', 0.45 * (o.kuleA ?? 1));
    strip(xs, tip, 'turkuaz', 0.75);
    // üçgenler
    const uA = o.ucgen ?? 0;
    if (uA > 0) {
      E.cokgen(ctx, [P.p(0, 0), P.p(0, 34), P.p(tip, 0)], { renk: 'mercan', alfa: 0.14 * uA, kenar: true, kenarAlfa: 0.9 * uA, kalinlik: 2.5, parilti: 0.5 });
      E.dikAci(ctx, P.x(0), yz, -Math.PI / 2, 14, { alfa: uA, renk: 'mercan' });
    }
    // minare
    minare(ctx, P.x(0), yz, 34 * P.pm, { renk: E.karistir('lacivert', 'derin', 0.5), kenar: 'mercan', alfa: o.kuleA ?? 1 });
    // öğrenci
    insan(ctx, P.x(xs), yz, 1.7 * P.pm, { renk: 'tebesir' });
    if (uA > 0) E.cizgi(ctx, [P.p(xs, 0), P.p(xs, 1.7), P.p(tip, 0)], { renk: 'turkuaz', kalinlik: 2.5, parilti: 0.5, alfa: uA });
    // açı
    const acA = o.aci ?? 0;
    if (acA > 0) E.aciYayi(ctx, P.x(tip), yz, E.yd(52, 46), Math.PI, Math.PI + Math.atan(k), { renk: 'limon', alfa: acA, kalinlik: 3, p: acA });
    ctx.restore();
    return { tip, xs, sh, yz };
  };
  /** Büyüteç: öğrencinin küçük üçgeni */
  const lens = (ctx, cx, cy, r, hedef, k, o) => {
    const a = o.alfa ?? 1;
    if (a <= 0.002) return;
    const sh = 1.7 / k, pmL = r / 2.3;
    ctx.save(); ctx.globalAlpha *= a;
    // bağlantı
    E.cizgi(ctx, [[cx + (hedef[0] - cx) * (r / Math.hypot(hedef[0] - cx, hedef[1] - cy)), cy + (hedef[1] - cy) * (r / Math.hypot(hedef[0] - cx, hedef[1] - cy))], hedef], { renk: 'turkuaz', kalinlik: 1.5, kesik: [5, 5], alfa: 0.8 });
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = E.rgba('gece', 0.9); ctx.fill(); ctx.clip();
    const ox = cx - (sh * pmL) / 2, oy = cy + (1.7 * pmL) / 2 + 4;
    const Pl = izdusum(pmL, 0, 0, ox, oy);
    E.cizgi(ctx, [[cx - r, oy], [cx + r, oy]], { renk: 'cizgi', kalinlik: 2 });
    E.cizgi(ctx, [Pl.p(-2.4, 1.7 + 2.4 * k), Pl.p(sh, 0)], { renk: 'limon', kalinlik: 2, parilti: 0.6 });
    ctx.fillStyle = E.rgba('turkuaz', 0.75); ctx.fillRect(Pl.x(0), oy + 2, sh * pmL, 6);
    E.cokgen(ctx, [Pl.p(0, 0), Pl.p(0, 1.7), Pl.p(sh, 0)], { renk: 'turkuaz', alfa: 0.18 * (o.ucgen ?? 0), kenar: (o.ucgen ?? 0) > 0, kenarAlfa: o.ucgen ?? 0, kalinlik: 2.5, parilti: 0.4 });
    insan(ctx, Pl.x(0), oy, 1.7 * pmL, { renk: 'tebesir' });
    if ((o.aci ?? 0) > 0) E.aciYayi(ctx, Pl.x(sh), oy, 24, Math.PI, Math.PI + Math.atan(k), { renk: 'limon', alfa: o.aci, kalinlik: 2.5 });
    if ((o.ucgen ?? 0) > 0) E.dikAci(ctx, Pl.x(0), oy, -Math.PI / 2, 10, { alfa: o.ucgen, renk: 'turkuaz' });
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.strokeStyle = E.rgba('turkuaz', 0.85); ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    // etiketler (lens dışına taşabilir; plaka ile)
    const ea = (o.etiket ?? 1) * a;
    E.etiket(ctx, o.boyEt || '1{,}7', Pl.x(0) - 10, oy - (1.7 * pmL) / 2, { formul: true, boyut: 24, renk: 'turkuaz', hiza: 'right', alfa: ea, plakaAlfa: 0.85 });
    E.etiket(ctx, o.golgeEt || '2{,}5', Pl.x(sh / 2), oy + 26, { formul: true, boyut: 24, renk: 'turkuaz', alfa: ea * (o.golgeA ?? 1), plakaAlfa: 0.85 });
  };

  /** Sağ/alt panel konumu */
  const panelYer = () => {
    const ic = E.L.icerik;
    return E.yatay ? { x: 800, w: ic.x1 - 800, cx: (800 + ic.x1) / 2, y0: ic.y + 110, y1: ic.y1 } : { x: ic.x, w: ic.w, cx: E.L.cx, y0: ic.y + 520, y1: ic.y1 };
  };
  const satir = (ctx, sol, sag, y, o = {}) => {
    const p = panelYer();
    E.yazi(ctx, sol, p.x + 10, y, { boyut: o.boyut || 28, agirlik: 520, renk: 'gumus', hiza: 'left', alfa: o.alfa });
    E.formul(ctx, sag, p.x + p.w - 10, y, { boyut: (o.boyut || 28) + 4, renk: o.renk || 'tebesir', hiza: 'right', alfa: o.alfa });
  };

  /* ======================= 3. Gölge yöntemi ======================= */
  const golgeSahne = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L, ic = L.icerik;
    const g = GY();
    arkaSehir(ctx, g.G, 0.7);
    const aktif = kf(t, [[0, 0], [8.2, 0], [8.8, 1, 'io2'], [11.4, 1], [12.0, 2, 'io2'], [14.6, 2], [15.2, 3, 'io2'], [19.0, 3], [19.6, 4, 'io2']]);
    serit(ctx, aktif, ara(t, 0.2, 1.0));
    // kamera: öğrenciden kuleye geri çekil
    const q = ara(t, 3.8, 8.0, 'io3');
    const pmC = H ? 92 : 80;
    const [kx, ky, kw, kh] = g.klip;
    const aC = [kx + kw * 0.5, (ky + kh) / 2 + 40];
    const tam = izdusum(g.pm0, 0, 0, g.X0, g.G);
    const fF = [25, 12], aF = tam.p(25, 12);
    const pm = loglerp(pmC, g.pm0, q);
    const f = [lerp(48.75, fF[0], q), lerp(0.85, fF[1], q)];
    const a = [lerp(aC[0], aF[0], q), lerp(aC[1], aF[1], q)];
    const P = izdusum(pm, f[0], f[1], a[0], a[1]);
    const ucgen = ara(t, 8.8, 9.6), aci = ara(t, 9.4, 10.4);
    const d = golgeDiyagram(ctx, P, { k: 1.7 / 2.5, isinP: ara(t, 0.4, 1.8, 'io2'), ucgen, aci, kuleA: 1 });
    // yakın plan etiketleri
    const yA = ara(t, 1.4, 2.0) * (1 - ara(t, 3.6, 4.4));
    if (yA > 0) {
      olcu(ctx, P.x(d.xs) - 40, P.y(0), P.x(d.xs) - 40, P.y(1.7), '1{,}7\\t{ m}', { renk: 'turkuaz', alfa: yA, dx: -54, p: ara(t, 1.4, 2.2) });
      olcu(ctx, P.x(d.xs), P.y(0) + 40, P.x(d.tip), P.y(0) + 40, '2{,}5\\t{ m}', { renk: 'turkuaz', alfa: ara(t, 2.2, 2.8) * (1 - ara(t, 3.6, 4.4)), dy: 34, p: ara(t, 2.2, 3.0) });
    }
    // geniş plan
    const gA = ara(t, 7.4, 8.2);
    if (gA > 0) {
      olcu(ctx, P.x(0), P.y(0) + 34, P.x(d.tip), P.y(0) + 34, '50\\t{ m}', { renk: 'mercan', yaziRenk: 'tebesir', alfa: gA, p: ara(t, 7.4, 8.4) });
      const lx = P.x(0) - 28;
      olcu(ctx, lx, P.y(0), lx, P.y(34), null, { renk: 'limon', alfa: gA, p: ara(t, 7.6, 8.6) });
      const coz = ara(t, 17.0, 17.8);
      const hx = P.x(0) + E.yd(48, 40), hy = P.y(17);
      E.etiket(ctx, 'h = ?', hx, hy, { formul: true, boyut: E.yd(34, 30), renk: 'limon', hiza: 'left', alfa: gA * (1 - coz), plakaAlfa: 0.8 });
      E.etiket(ctx, 'h = 34\\t{ m}', hx, hy, { formul: true, boyut: E.yd(34, 30), renk: 'limon', hiza: 'left', alfa: coz, plakaAlfa: 0.8, parilti: 0.4 });
      if (coz > 0) E.isik(ctx, P.x(0), P.y(34), 120, 'limon', 0.4 * E.nabiz(t, 17.0, 1.4));
      // büyüteç
      const la = ara(t, 8.2, 9.0);
      lens(ctx, P.x(d.tip) + g.lensDx, P.y(0) + g.lensDy, g.lensR, [P.x(d.tip) - 14, P.y(0) - 8], 1.7 / 2.5, { alfa: la, ucgen, aci });
    }
    // Panel
    const p = panelYer();
    const vA = ara(t, 1.0, 1.6) * (1 - ara(t, 8.4, 9.0));
    if (vA > 0) {
      const y0 = p.y0 + E.yd(0, 10), sa = E.yd(48, 42);
      E.yazi(ctx, 'VERİLEN', p.x + 10, y0, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'turkuaz', hiza: 'left', alfa: vA });
      satir(ctx, 'Öğrencinin boyu', '1{,}7\\t{ m}', y0 + sa, { alfa: vA * ara(t, 1.4, 2.0) });
      satir(ctx, 'Öğrencinin gölgesi', '2{,}5\\t{ m}', y0 + sa * 2, { alfa: vA * ara(t, 2.4, 3.0) });
      satir(ctx, 'Kulenin gölgesi', '50\\t{ m}', y0 + sa * 3, { alfa: vA * ara(t, 7.4, 8.0) });
      E.yazi(ctx, 'İSTENEN', p.x + 10, y0 + sa * 4.2, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'limon', hiza: 'left', alfa: vA * ara(t, 7.8, 8.3) });
      satir(ctx, 'Kulenin boyu', 'h', y0 + sa * 5.2, { alfa: vA * ara(t, 7.8, 8.3), renk: 'limon' });
    }
    const y0 = p.y0 + E.yd(30, 20);
    const sat = 78;
    const cA = ara(t, 9.0, 9.6) * (1 - (H ? ara(t, 18.6, 19.2) : ara(t, 11.3, 11.9)));
    E.formul(ctx, '\\t{aynı güneş} \\Rightarrow \\t{aynı açı}', p.cx, y0, { boyut: E.yd(30, 30), renk: 'gumus', alfa: cA });
    E.formul(ctx, '\\t{Açı–Açı} \\Rightarrow \\triangle \\sim \\triangle', p.cx, y0 + E.yd(sat * 0.7, 50), { boyut: E.yd(30, 30), renk: 'tebesir', alfa: cA * ara(t, 10.0, 10.6) });
    const fA = ara(t, 12.0, 12.8);
    const fy = H ? [y0 + sat * 2.0, y0 + sat * 3.15, y0 + sat * 4.15] : [y0 + 50, y0 + 140, y0 + 215];
    E.formul(ctx, '\\frac{\\c{mercan}{h}}{\\c{mercan}{50}} = \\frac{\\c{turkuaz}{1{,}7}}{\\c{turkuaz}{2{,}5}}', p.cx, fy[0], { boyut: E.yd(46, 44), alfa: fA, aciga: ara(t, 12.0, 13.6, 'lin') });
    E.formul(ctx, 'h = 50 · 0{,}68', p.cx, fy[1], { boyut: E.yd(38, 38), alfa: ara(t, 15.2, 15.9) });
    E.formul(ctx, '\\kutu{limon}{h = 34\\t{ m}}', p.cx, fy[2], { boyut: E.yd(42, 40), alfa: ara(t, 16.6, 17.3), parilti: 0.3, parRenk: 'limon' });
    // Tales notu
    const tA = ara(t, 19.0, 19.8);
    if (tA > 0) {
      const pw = E.yd(p.w, 400), ph = E.yd(118, 104), px = E.yd(p.x, ic.x1 - 400), py = E.yd(y0 - 40, ic.y + 70);
      E.panel(ctx, px, py, pw, ph, { alfa: tA, vurgu: 'limon' });
      // piramit ikonu ve gölgesi
      const ix = px + 56, iy = py + ph / 2 + 22;
      E.cokgen(ctx, [[ix - 36, iy], [ix, iy - 44], [ix + 36, iy]], { renk: 'limon', alfa: 0.18 * tA, kenar: true, kenarAlfa: tA, kalinlik: 2 });
      E.cizgi(ctx, [[ix + 36, iy + 3], [ix + 80, iy + 3]], { renk: 'gumus', kalinlik: 4, alfa: 0.7 * tA });
      E.yazi(ctx, 'Tales, MÖ 6. yüzyıl', px + 120, py + ph * 0.32, { boyut: 26, agirlik: 700, renk: 'limon', hiza: 'left', alfa: tA });
      E.yazi(ctx, 'Piramidi gölgesiyle ölçtü.', px + 120, py + ph * 0.68, { boyut: 26, agirlik: 520, hiza: 'left', alfa: tA });
    }
  };

  /* ======================= 4. Kontrol: başka saat ======================= */
  const kontrolSahne = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L;
    const g = GY();
    arkaSehir(ctx, g.G, 0.7, lerp(0.6, 1, ara(t, 1, 4.5)));
    serit(ctx, 4, 1);
    const q = ara(t, 1.0, 4.6, 'io3');
    const k = lerp(1.7 / 2.5, 1.7 / 3.4, q);
    const pm = lerp(g.pm0, g.pm1, q);
    const P = izdusum(pm, 0, 0, g.X0, g.G);
    const d = golgeDiyagram(ctx, P, { k, ucgen: 1, aci: 1 });
    // saat
    const sa = ara(t, 0.6, 1.2);
    const saat = q < 0.5 ? '16:00' : '17:00';
    E.etiket(ctx, saat, E.yd(560, 230), g.klip[1] + E.yd(30, 34), { boyut: 28, renk: 'limon', alfa: sa, agirlik: 700 });
    // ölçüler
    olcu(ctx, P.x(0), P.y(0) + 34, P.x(d.tip), P.y(0) + 34, q < 0.98 ? null : '68\\t{ m}', { renk: 'mercan', yaziRenk: 'tebesir', alfa: 1 });
    const lx = P.x(0) - 28;
    olcu(ctx, lx, P.y(0), lx, P.y(34), null, { renk: 'limon' });
    E.etiket(ctx, 'h = 34\\t{ m}', P.x(0) + E.yd(48, 40), P.y(17), { formul: true, boyut: E.yd(34, 30), renk: 'limon', hiza: 'left', plakaAlfa: 0.8 });
    lens(ctx, P.x(d.tip) + g.lensDx, P.y(0) + g.lensDy, g.lensR, [P.x(d.tip) - 14, P.y(0) - 8], k, { alfa: 1, ucgen: 1, aci: 1, golgeEt: q < 0.5 ? '2{,}5' : '3{,}4', golgeA: Math.pow(Math.abs(q - 0.5) * 2, 3), etiket: 1 });
    // Oran tablosu
    const p = panelYer();
    const tA = ara(t, 4.4, 5.0);
    if (tA > 0) {
      const y0 = p.y0 + E.yd(10, 16), sat = E.yd(58, 50);
      const c1 = p.x + p.w * E.yd(0.5, 0.5), c2 = p.x + p.w * E.yd(0.84, 0.82);
      E.panel(ctx, p.x, y0 - 30, p.w, sat * 4 + 24, { alfa: tA * 0.9, vurgu: 'turkuaz' });
      E.yazi(ctx, '16:00', c1, y0, { boyut: 24, agirlik: 700, renk: 'gumus', alfa: tA });
      E.yazi(ctx, '17:00', c2, y0, { boyut: 24, agirlik: 700, renk: 'limon', alfa: tA });
      const etk = [['Öğrenci', '1{,}7 : 2{,}5', '1{,}7 : 3{,}4'], ['Kule', 'h : 50', 'h : 68'], ['h', '34\\t{ m}', '34\\t{ m} ✓']];
      etk.forEach(([ad, a1, a2], i) => {
        const y = y0 + sat * (i + 1);
        const ra = ara(t, 4.8 + i * 0.7, 5.4 + i * 0.7);
        E.yazi(ctx, ad, p.x + 22, y, { boyut: 26, agirlik: 560, renk: 'gumus', hiza: 'left', alfa: ra });
        E.formul(ctx, a1, c1, y, { boyut: 30, alfa: ra, renk: i === 2 ? 'tebesir' : 'tebesir' });
        E.formul(ctx, a2, c2, y, { boyut: 30, alfa: ra * ara(t, 5.2 + i * 0.7, 5.8 + i * 0.7), renk: i === 2 ? 'limon' : 'tebesir', parilti: i === 2 ? 0.3 : 0 });
      });
      // kısa yol ve yanlış strateji (aynı yerde sırayla)
      const yk = H ? y0 + sat * 4 + 44 : L.icerik.y + 96;
      const kx = H ? p.cx : 505;
      const kA = ara(t, 8.4, 9.0) * (1 - ara(t, 11.2, 11.7));
      E.yazi(ctx, 'Kısa yol: gölge = 2 × boy', kx, yk, { boyut: E.yd(28, 28), agirlik: 640, renk: 'turkuaz', alfa: kA });
      E.formul(ctx, '\\kutu{turkuaz}{h = 68 : 2 = 34\\t{ m}}', kx, yk + E.yd(56, 54), { boyut: E.yd(32, 32), alfa: kA * ara(t, 9.0, 9.6) });
      const xA = ara(t, 11.6, 12.2);
      E.yazi(ctx, 'Saatler karışırsa:', kx, yk, { boyut: E.yd(28, 28), agirlik: 640, renk: 'mercan', alfa: xA });
      const fr = E.formul(ctx, '50 · 1{,}7 : 3{,}4 = 25\\t{ m}', kx, yk + E.yd(56, 54), { boyut: E.yd(32, 32), renk: 'mercan', alfa: xA * ara(t, 12.0, 12.5) });
      const ci = ara(t, 12.7, 13.3);
      if (ci > 0 && fr.w) E.cizgi(ctx, [[kx - fr.w / 2 - 8, yk + E.yd(56, 54)], [kx - fr.w / 2 - 8 + (fr.w + 16) * ci, yk + E.yd(56, 54)]], { renk: 'mercan', kalinlik: 3, parilti: 0.6 });
      // hangi hücreler karışık: vurgula
      if (xA > 0) {
        const hY1 = y0 + sat * 1, hY2 = y0 + sat * 2;
        E.cizgi(ctx, [[c2 - 70, hY1 + 18], [c2 + 70, hY1 + 18]], { renk: 'mercan', kalinlik: 2.5, alfa: xA });
        E.cizgi(ctx, [[c1 - 60, hY2 + 18], [c1 + 60, hY2 + 18]], { renk: 'mercan', kalinlik: 2.5, alfa: xA });
      }
    }
  };

  /* ======================= 5. Ayna yöntemi ======================= */
  const AY = () => {
    const ic = E.L.icerik;
    return E.yatay ? { G: ic.y + 486, Mx: ic.x + 140, pm: 42 } : { G: ic.y + 456, Mx: ic.x + 140, pm: 35 };
  };
  const aynaSahne = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L;
    const g = AY();
    const P = izdusum(g.pm, 0, 0, g.Mx, g.G);
    // alacakaranlık: güneş yok
    E.isik(ctx, E.W * 0.75, g.G, E.W * 0.8, 'menekse', 0.14);
    E.isik(ctx, E.W * 0.3, g.G - 200, E.W * 0.6, 'gok', 0.06);
    arkaSehir(ctx, g.G, 0.45, 0.15);
    const aktif = kf(t, [[0, 0], [4.0, 0], [4.6, 1, 'io2'], [9.2, 1], [9.8, 2, 'io2'], [11.2, 2], [11.8, 3, 'io2'], [13.4, 3], [14.0, 4, 'io2']]);
    serit(ctx, aktif, ara(t, 0.1, 0.8));
    const yz = g.G;
    E.cizgi(ctx, [[P.x(-3.4), yz], [P.x(14.4), yz]], { renk: 'cizgi', kalinlik: 2 });
    // ağaç ve kişi
    const giris = ara(t, 0.2, 1.2);
    agac(ctx, P.x(12), yz, 9 * g.pm, { alfa: giris, kenar: 'menekse' });
    insan(ctx, P.x(-2), yz, 1.62 * g.pm, { renk: 'tebesir', alfa: giris });
    // ayna
    const mg = E.nabiz(t, 2.4, 0.9);
    ctx.save(); ctx.globalAlpha *= giris;
    const mw = 0.5 * g.pm;
    const ag = ctx.createLinearGradient(P.x(0) - mw, 0, P.x(0) + mw, 0);
    ag.addColorStop(0, E.rgba('gok', 0.4)); ag.addColorStop(0.5, E.rgba('tebesir', 0.95)); ag.addColorStop(1, E.rgba('gok', 0.4));
    ctx.fillStyle = ag; ctx.fillRect(P.x(0) - mw, yz - 3, mw * 2, 5);
    ctx.restore();
    E.isik(ctx, P.x(0), yz, 50 + 120 * mg, 'tebesir', 0.25 + 0.6 * mg);
    // ışın: ağacın tepesi → ayna → göz
    const r1 = ara(t, 1.2, 2.4, 'io2'), r2 = ara(t, 2.5, 3.4, 'io2');
    E.cizgi(ctx, [P.p(12, 9), P.p(0, 0)], { renk: 'limon', kalinlik: 2.5, parilti: 0.8, p: r1 });
    E.cizgi(ctx, [P.p(0, 0), P.p(-2, 1.5)], { renk: 'limon', kalinlik: 2.5, parilti: 0.8, p: r2, ok: r2 > 0.98, okBoy: 12 });
    if (r1 > 0 && r1 < 1) E.nokta(ctx, lerp(P.x(12), P.x(0), r1), lerp(P.y(9), P.y(0), r1), 5, { renk: 'limon', parilti: 1.4 });
    if (r2 > 0 && r2 < 1) E.nokta(ctx, lerp(P.x(0), P.x(-2), r2), lerp(P.y(0), P.y(1.5), r2), 5, { renk: 'limon', parilti: 1.4 });
    E.isik(ctx, P.x(-2), P.y(1.5), 40, 'limon', 0.5 * E.nabiz(t, 3.3, 0.8));
    // açılar
    const acA = ara(t, 4.6, 5.4);
    const th = Math.atan(0.75);
    E.aciYayi(ctx, P.x(0), yz, 46, Math.PI, Math.PI + th, { renk: 'limon', alfa: acA, p: acA, kalinlik: 3 });
    E.aciYayi(ctx, P.x(0), yz, 46, -th, 0, { renk: 'limon', alfa: acA, p: acA, kalinlik: 3 });
    // normal (kesikli dik)
    E.cizgi(ctx, [P.p(0, 0), P.p(0, 2.4)], { renk: 'gumus', kalinlik: 1.5, kesik: [5, 6], alfa: acA * 0.7 });
    E.etiket(ctx, 'α', P.x(0) - 70, yz - 22, { formul: true, boyut: 26, renk: 'limon', alfa: acA, plakaAlfa: 0.6 });
    E.etiket(ctx, 'α', P.x(0) + 70, yz - 22, { formul: true, boyut: 26, renk: 'limon', alfa: acA, plakaAlfa: 0.6 });
    // üçgenler (13.4 sonrası: küçük üçgen yansır ve 6 kat büyür)
    const uA = ara(t, 8.2, 9.0);
    const yans = ara(t, 13.6, 14.6, 'io3'), buy = ara(t, 14.6, 15.8, 'io3');
    if (uA > 0) {
      E.cokgen(ctx, [P.p(0, 0), P.p(12, 0), P.p(12, 9)], { renk: 'mercan', alfa: 0.13 * uA, kenar: true, kenarAlfa: uA, kalinlik: 2.5, parilti: 0.5 });
      // küçük üçgen: (0,0), (-2,0), (-2,1.5) → x ölçeği: sx = lerp(1,-1,yans) * lerp(1,6,buy)
      const sx = lerp(1, -1, yans) * lerp(1, 6, buy), sy = lerp(1, 6, buy);
      const kp = [[0, 0], [-2 * sx, 0], [-2 * sx, 1.5 * sy]].map(([x, y]) => P.p(x, y));
      E.cokgen(ctx, kp, { renk: 'turkuaz', alfa: 0.18 * uA, kenar: true, kenarAlfa: uA, kalinlik: 2.5, parilti: 0.6 });
      E.dikAci(ctx, P.x(12), yz, -Math.PI, 13, { alfa: uA, renk: 'mercan' });
      if (yans < 0.05) E.dikAci(ctx, P.x(-2), yz, -Math.PI / 2, 11, { alfa: uA, renk: 'turkuaz' });
      const otur = E.nabiz(t, 15.7, 1.2);
      if (otur > 0) E.isik(ctx, P.x(8), P.y(3), 260, 'limon', 0.35 * otur);
    }
    // ölçüler
    const oA = ara(t, 8.4, 9.2) * (1 - ara(t, 13.2, 13.7));
    olcu(ctx, P.x(-2) - 26, yz, P.x(-2) - 26, P.y(1.5), null, { renk: 'turkuaz', alfa: oA });
    if (H) E.etiket(ctx, '1{,}5\\t{ m}', P.x(-2) - 34, P.y(0.75), { formul: true, boyut: 26, renk: 'turkuaz', hiza: 'right', alfa: oA, plakaAlfa: 0.8 });
    else E.etiket(ctx, '1{,}5\\t{ m}', P.x(-2), P.y(1.62) - 30, { formul: true, boyut: 24, renk: 'turkuaz', alfa: oA, plakaAlfa: 0.8 });
    olcu(ctx, P.x(-2), yz + 32, P.x(0), yz + 32, '2\\t{ m}', { renk: 'turkuaz', alfa: ara(t, 8.8, 9.4) * (1 - ara(t, 13.2, 13.7)), dy: 30 });
    olcu(ctx, P.x(0), yz + 32, P.x(12), yz + 32, '12\\t{ m}', { renk: 'mercan', yaziRenk: 'tebesir', alfa: ara(t, 9.2, 9.8), dy: 30 });
    const hc = ara(t, 12.4, 13.0);
    olcu(ctx, P.x(12) + E.yd(80, 52), yz, P.x(12) + E.yd(80, 52), P.y(9), null, { renk: 'limon', alfa: ara(t, 9.4, 10) });
    E.etiket(ctx, 'h = ?', P.x(12) + E.yd(70, 44), P.y(4.5), { formul: true, boyut: E.yd(30, 26), renk: 'limon', hiza: 'right', alfa: ara(t, 9.4, 10) * (1 - hc), plakaAlfa: 0.85 });
    E.etiket(ctx, 'h = 9\\t{ m}', P.x(12) + E.yd(70, 44), P.y(4.5), { formul: true, boyut: E.yd(30, 26), renk: 'limon', hiza: 'right', alfa: hc, plakaAlfa: 0.85 });
    // panel
    const p = panelYer();
    const y0 = p.y0 + E.yd(20, 46), sat = E.yd(84, 70);
    E.formul(ctx, '\\t{geliş açısı} = \\t{yansıma açısı}', p.cx, y0, { boyut: E.yd(28, 28), renk: 'gumus', alfa: ara(t, 5.0, 5.6) });
    E.formul(ctx, '\\frac{\\c{mercan}{h}}{\\c{mercan}{12}} = \\frac{\\c{turkuaz}{1{,}5}}{\\c{turkuaz}{2}}', p.cx, y0 + sat * 1.2, { boyut: E.yd(46, 42), alfa: ara(t, 10.0, 10.8), aciga: ara(t, 10.0, 11.4, 'lin') });
    E.formul(ctx, 'h = 12 · 0{,}75 = \\c{limon}{9\\t{ m}}', p.cx, y0 + sat * 2.3, { boyut: E.yd(38, 34), alfa: ara(t, 11.8, 12.5) });
    E.formul(ctx, '\\t{Kontrol: } \\frac{9}{12} = \\frac{1{,}5}{2} = 0{,}75 \\; ✓', p.cx, y0 + sat * 3.4, { boyut: E.yd(32, 30), renk: 'turkuaz', alfa: ara(t, 15.8, 16.5) });
    E.yazi(ctx, '× 6', P.x(4), P.y(5.6), { boyut: 34, agirlik: 760, renk: 'limon', alfa: ara(t, 14.6, 15.0) * (1 - ara(t, 16.6, 17.1)), parilti: 0.4, parRenk: 'limon' });
  };

  /* ======================= 6. Nehir: sürpriz ======================= */
  const NH = () => {
    const ic = E.L.icerik;
    return E.yatay ? { s: 26, X0: ic.x + 290, Y0: ic.y + 156, panel: true } : { s: 24, X0: ic.x + 260, Y0: ic.y + 140 };
  };
  // dünya: u kıyı boyunca (aşağı), v karşıya (sağa). A(0,0) T(0,15) C(6,0) D(10,0) E(10,-10)
  const NOK = { A: [0, 0], T: [0, 15], C: [6, 0], D: [10, 0], E: [10, -10] };
  const nehirSahne = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L, ic = L.icerik;
    const g = NH();
    const ust = (u, v) => [g.X0 + v * g.s, g.Y0 + u * g.s];
    const aktif = kf(t, [[0, 0], [6.4, 0], [7.0, 1, 'io2'], [11.8, 1], [12.4, 2, 'io2'], [15.8, 2], [16.4, 3, 'io2'], [17.8, 3], [18.4, 4, 'io2']]);
    serit(ctx, aktif, ara(t, 0.1, 0.8));
    // geçiş: yan görünüş (0) → kuşbakışı (1)
    const tilt = ara(t, 4.2, 6.6, 'io3');
    const zeminY = g.Y0 + 4 * g.s;
    const xA = ust(0, 0)[0], xT = ust(0, 15)[0];
    // ---- Yan görünüş ----
    const yanA = 1 - ara(t, 4.6, 5.8);
    if (yanA > 0) {
      ctx.save(); ctx.globalAlpha *= yanA;
      ctx.translate(0, zeminY); ctx.scale(1, lerp(1, 0.12, tilt)); ctx.translate(0, -zeminY);
      const derinlik = 70;
      // kıyılar
      ctx.fillStyle = E.karistir('lacivert', 'derin', 0.5);
      ctx.fillRect(ic.x - 40, zeminY, xA - ic.x + 40, 120);
      ctx.fillRect(xT, zeminY, ic.x1 - xT + 40, 120);
      // su
      const sg = ctx.createLinearGradient(0, zeminY + 10, 0, zeminY + derinlik + 40);
      sg.addColorStop(0, E.rgba('gok', 0.55)); sg.addColorStop(1, E.rgba('derin', 0.9));
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.moveTo(xA, zeminY + 8); ctx.quadraticCurveTo((xA + xT) / 2, zeminY + derinlik * 2.2, xT, zeminY + 8); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 6; i++) {
        const yy = zeminY + 14 + i * 7, ofs = (t * 30 + i * 37) % 60;
        E.cizgi(ctx, [[xA + 20 + ofs, yy], [xA + 60 + ofs, yy]], { renk: 'gok', kalinlik: 1.5, alfa: 0.5 });
        E.cizgi(ctx, [[xT - 120 + ofs, yy + 3], [xT - 80 + ofs, yy + 3]], { renk: 'gok', kalinlik: 1.5, alfa: 0.4 });
      }
      E.cizgi(ctx, [[ic.x - 40, zeminY], [xA, zeminY]], { renk: 'cizgi', kalinlik: 2 });
      E.cizgi(ctx, [[xT, zeminY], [ic.x1 + 40, zeminY]], { renk: 'cizgi', kalinlik: 2 });
      agac(ctx, xT + 22, zeminY, E.yd(150, 140), { kenar: 'menekse' });
      insan(ctx, xA - 22, zeminY, E.yd(56, 52), { renk: 'tebesir' });
      ctx.restore();
      const okA = ara(t, 1.2, 2.0) * yanA * (1 - tilt);
      E.ok(ctx, xA + 10, zeminY - 34, xT - 10, zeminY - 34, { renk: 'limon', kalinlik: 2.5, alfa: okA, okBoy: 14 });
      E.ok(ctx, xT - 10, zeminY - 34, xA + 10, zeminY - 34, { renk: 'limon', kalinlik: 2.5, alfa: okA, okBoy: 14 });
      E.etiket(ctx, 'x = ?', (xA + xT) / 2, zeminY - 70, { formul: true, boyut: 34, renk: 'limon', alfa: okA, plakaAlfa: 0.8 });
      E.yazi(ctx, 'Karşıya geçmek yok.', (xA + xT) / 2, zeminY + E.yd(150, 140), { boyut: E.yd(30, 28), agirlik: 600, renk: 'gumus', alfa: ara(t, 2.0, 2.6) * yanA * (1 - tilt) });
    }
    // ---- Kuşbakışı ----
    const ustA = ara(t, 4.8, 6.2);
    if (ustA > 0) {
      ctx.save(); ctx.globalAlpha *= ustA;
      ctx.translate(0, zeminY); ctx.scale(1, lerp(0.15, 1, tilt)); ctx.translate(0, -zeminY);
      const yU0 = g.Y0 - 3.2 * g.s, yU1 = g.Y0 + 12 * g.s;
      // kara (çimen dokusu, tohumlu)
      const sol0 = ic.x - 20, sag1 = E.yd(xT + 70, ic.x1 + 20);
      ctx.fillStyle = E.karistir('lacivert', 'derin', 0.5, 0.9);
      ctx.fillRect(sol0, yU0, xA - sol0, yU1 - yU0);
      ctx.fillRect(xT, yU0, sag1 - xT, yU1 - yU0);
      const rg = E.rng(4242);
      for (let i = 0; i < 260; i++) {
        const x = lerp(sol0, sag1, rg()), y = lerp(yU0, yU1, rg());
        if (x > xA - 4 && x < xT + 4) continue;
        ctx.fillStyle = E.rgba(rg() < 0.5 ? 'turkuaz' : 'sis', 0.18 + rg() * 0.2);
        ctx.fillRect(x, y, 2, 2);
      }
      // tarla şeritleri (sol kıyı)
      ctx.save(); ctx.beginPath(); ctx.rect(sol0, yU0, xA - sol0 - 18, yU1 - yU0); ctx.clip();
      ctx.strokeStyle = E.rgba('sis', 0.5); ctx.lineWidth = 1;
      for (let x = sol0 - 200; x < xA; x += 16) { ctx.beginPath(); ctx.moveTo(x, yU0); ctx.lineTo(x + 120, yU1); ctx.stroke(); }
      ctx.restore();
      // su
      const sg = ctx.createLinearGradient(xA, 0, xT, 0);
      sg.addColorStop(0, E.karistir('derin', 'gok', 0.45, 0.95)); sg.addColorStop(0.15, E.karistir('derin', 'gok', 0.25, 0.95));
      sg.addColorStop(0.85, E.karistir('derin', 'gok', 0.25, 0.95)); sg.addColorStop(1, E.karistir('derin', 'gok', 0.45, 0.95));
      ctx.fillStyle = sg; ctx.fillRect(xA, yU0, xT - xA, yU1 - yU0);
      // akıntı pırıltıları (tohumlu, t ile akar)
      const r = E.rng(808);
      ctx.save(); ctx.beginPath(); ctx.rect(xA, yU0, xT - xA, yU1 - yU0); ctx.clip();
      for (let i = 0; i < 40; i++) {
        const x = xA + 12 + r() * (xT - xA - 24), y0 = yU0 + ((r() * (yU1 - yU0) + t * (18 + r() * 16)) % (yU1 - yU0)), l = 10 + r() * 26;
        ctx.strokeStyle = E.rgba('gok', 0.25 + 0.25 * r()); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.quadraticCurveTo(x + 4, y0 + l / 2, x, y0 + l); ctx.stroke();
      }
      ctx.restore();
      E.cizgi(ctx, [[xA, yU0], [xA, yU1]], { renk: 'gok', kalinlik: 2, parilti: 0.5, alfa: 0.8 });
      E.cizgi(ctx, [[xT, yU0], [xT, yU1]], { renk: 'gok', kalinlik: 2, parilti: 0.5, alfa: 0.8 });
      // ağaç (üstten taç)
      const [tx, ty] = ust(0, 15);
      ctx.save(); ctx.fillStyle = E.karistir('derin', 'turkuaz', 0.4);
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; ctx.moveTo(tx + 20 + Math.cos(a) * 9 + 11, ty + Math.sin(a) * 9); ctx.arc(tx + 20 + Math.cos(a) * 9, ty + Math.sin(a) * 9, 11, 0, TAU); }
      ctx.fill(); ctx.restore();
      ctx.restore();
    }
    const kur = tilt >= 0.999;
    if (!kur) return;
    // ---- Kazıklar ve yürüyüş ----
    const yur = kf(t, [[6.8, 0], [8.0, 1, 'io2'], [8.8, 1], [9.6, 2, 'io2'], [10.0, 2], [11.4, 3, 'io2']]);
    const yolNok = [NOK.A, NOK.C, NOK.D, NOK.E];
    const seg = Math.min(2, Math.floor(yur)), qq = yur - seg;
    const yurP = yur >= 3 ? NOK.E : [lerp(yolNok[seg][0], yolNok[seg + 1][0], qq), lerp(yolNok[seg][1], yolNok[seg + 1][1], qq)];
    const iz = [NOK.A]; for (let i = 1; i <= Math.min(3, Math.floor(yur)); i++) iz.push(yolNok[i]); if (yur < 3) iz.push(yurP);
    E.cizgi(ctx, iz.map(([u, v]) => ust(u, v)), { renk: 'gumus', kalinlik: 2, kesik: [6, 6], alfa: 0.8 });
    // dönüşüm (sürpriz): küçük üçgen EDC, C etrafında 180° döner ve 1,5 kat büyür
    const don = ara(t, 12.4, 14.2, 'io3'), buy = ara(t, 14.2, 15.4, 'io3');
    const uA = ara(t, 11.6, 12.3);
    if (uA > 0) {
      E.cokgen(ctx, [NOK.T, NOK.A, NOK.C].map(([u, v]) => ust(u, v)), { renk: 'mercan', alfa: 0.15 * uA, kenar: true, kenarAlfa: uA, kalinlik: 2.5, parilti: 0.5 });
      const ang = Math.PI * don, sc = lerp(1, 1.5, buy);
      const [cu, cv] = NOK.C;
      const kp = [NOK.E, NOK.D, NOK.C].map(([u, v]) => {
        const du = u - cu, dv = v - cv;
        const ru = du * Math.cos(ang) - dv * Math.sin(ang), rv = du * Math.sin(ang) + dv * Math.cos(ang);
        return ust(cu + ru * sc, cv + rv * sc);
      });
      E.cokgen(ctx, kp, { renk: 'turkuaz', alfa: 0.2 * uA, kenar: true, kenarAlfa: uA, kalinlik: 2.5, parilti: 0.6 });
      const otur = E.nabiz(t, 15.2, 1.3);
      if (otur > 0) E.isik(ctx, ...ust(2, 5), 300, 'limon', 0.4 * otur);
      if (don > 0 && don < 1) {
        const [ccx, ccy] = ust(cu, cv);
        E.aciYayi(ctx, ccx, ccy, 40, 0, Math.PI * don, { renk: 'limon', alfa: 0.9, dolgu: 0, kalinlik: 2.5 });
      }
    }
    // görüş çizgisi E → C → T
    const gor = ara(t, 11.0, 12.0, 'io2');
    E.cizgi(ctx, [ust(...NOK.E), ust(...NOK.T)], { renk: 'limon', kalinlik: 2, parilti: 0.8, p: gor, alfa: 0.9 });
    // dik açılar
    const dA = ara(t, 8.0, 8.6) * (1 - don);
    E.dikAci(ctx, ...ust(0, 0), 0, 13, { renk: 'mercan', alfa: ara(t, 7.0, 7.6) });
    E.dikAci(ctx, ...ust(10, 0), -Math.PI / 2, 13, { renk: 'turkuaz', alfa: ara(t, 10.0, 10.6) * (1 - don) });
    // kazıklar ve harfler
    const kazik = (ad, [u, v], a, dx, dy, renk = 'tebesir') => {
      if (a <= 0) return;
      const [x, y] = ust(u, v);
      E.nokta(ctx, x, y, 6, { renk, parilti: 0.8, alfa: a });
      E.yazi(ctx, ad, x + dx, y + dy, { boyut: 26, agirlik: 700, renk, alfa: a });
    };
    kazik('T', NOK.T, ara(t, 6.4, 7.0), 30, -26, 'mercan');
    kazik('A', NOK.A, ara(t, 6.6, 7.2), -24, -24);
    kazik('C', NOK.C, ara(t, 7.8, 8.2), -26, 0, 'limon');
    kazik('D', NOK.D, ara(t, 9.4, 9.8) * (1 - buy), 22, 22);
    kazik('E', NOK.E, ara(t, 11.2, 11.6) * (1 - buy), -24, 22);
    E.nokta(ctx, ...ust(...yurP), 7, { renk: 'limon', parilti: 1.3, alfa: ara(t, 6.6, 7.0) * (1 - ara(t, 11.6, 12.2)) });
    // ölçüler
    const oa = 1 - ara(t, 12.2, 12.6);
    const solX = ust(0, 0)[0] - 30;
    olcu(ctx, solX, ust(0, 0)[1], solX, ust(6, 0)[1], null, { renk: 'gumus', alfa: ara(t, 7.8, 8.3) * oa });
    E.etiket(ctx, '6\\t{ m}', solX - 10, ust(3, 0)[1], { formul: true, boyut: 26, hiza: 'right', alfa: ara(t, 7.8, 8.3) * oa, plakaAlfa: 0.8 });
    olcu(ctx, solX, ust(6, 0)[1], solX, ust(10, 0)[1], null, { renk: 'gumus', alfa: ara(t, 9.4, 9.9) * oa });
    E.etiket(ctx, '4\\t{ m}', solX - 10, ust(8, 0)[1], { formul: true, boyut: 26, hiza: 'right', alfa: ara(t, 9.4, 9.9) * oa, plakaAlfa: 0.8 });
    const altY = ust(10, 0)[1] + 34;
    olcu(ctx, ust(10, -10)[0], altY, ust(10, 0)[0], altY, '10\\t{ m}', { renk: 'gumus', alfa: ara(t, 11.0, 11.5) * oa, dy: 30 });
    const ustY = ust(0, 0)[1] - 34;
    olcu(ctx, ust(0, 0)[0], ustY, ust(0, 15)[0], ustY, null, { renk: 'limon', alfa: ara(t, 6.8, 7.4) });
    const xs = ara(t, 17.0, 17.6);
    E.etiket(ctx, 'x = ?', (ust(0, 0)[0] + ust(0, 15)[0]) / 2, ustY - 2, { formul: true, boyut: 30, renk: 'limon', alfa: ara(t, 6.8, 7.4) * (1 - xs), plakaAlfa: 0.85, cakisabilir: true });
    E.etiket(ctx, 'x = 15\\t{ m}', (ust(0, 0)[0] + ust(0, 15)[0]) / 2, ustY - 2, { formul: true, boyut: 30, renk: 'limon', alfa: xs, plakaAlfa: 0.85, parilti: 0.4 });
    const okA = ara(t, 14.4, 15.0) * (1 - ara(t, 16.6, 17.2));
    E.yazi(ctx, '× 1,5', ust(5, 4)[0], ust(5, 4)[1], { boyut: 34, agirlik: 760, renk: 'limon', alfa: okA, parilti: 0.4, parRenk: 'limon' });
    // panel
    const p = panelYer();
    const y0 = p.y0 + E.yd(30, 14), sat = E.yd(86, 68);
    const cx = p.cx;
    const vA = ara(t, 7.6, 8.2) * (1 - ara(t, 12.0, 12.5));
    if (vA > 0) {
      const sa = E.yd(48, 44);
      E.yazi(ctx, 'VERİLEN', p.x + 10, y0 - E.yd(10, 0), { boyut: 22, agirlik: 700, harfAra: 4, renk: 'turkuaz', hiza: 'left', alfa: vA });
      satir(ctx, 'Kıyı boyunca', 'AC = 6\\t{ m}', y0 + sa, { alfa: vA * ara(t, 7.8, 8.4) });
      satir(ctx, 'Sonra', 'CD = 4\\t{ m}', y0 + sa * 2, { alfa: vA * ara(t, 9.4, 10.0) });
      satir(ctx, 'Dik yönde', 'DE = 10\\t{ m}', y0 + sa * 3, { alfa: vA * ara(t, 11.0, 11.5) });
      E.yazi(ctx, 'İSTENEN', p.x + 10, y0 + sa * 4.1, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'limon', hiza: 'left', alfa: vA * ara(t, 7.0, 7.6) });
      satir(ctx, 'Nehrin genişliği', 'x = AT', y0 + sa * 5, { alfa: vA * ara(t, 7.0, 7.6), renk: 'limon' });
    }
    E.formul(ctx, '\\triangle EDC \\sim \\triangle TAC', cx, y0, { boyut: E.yd(32, 30), renk: 'gumus', alfa: ara(t, 12.6, 13.2) });
    E.formul(ctx, '\\frac{\\c{mercan}{x}}{\\c{turkuaz}{10}} = \\frac{\\c{mercan}{6}}{\\c{turkuaz}{4}}', cx, y0 + sat, { boyut: E.yd(46, 42), alfa: ara(t, 16.2, 16.9), aciga: ara(t, 16.2, 17.4, 'lin') });
    E.formul(ctx, 'x = 10 · 1{,}5 = \\c{limon}{15\\t{ m}}', cx, y0 + sat * 2, { boyut: E.yd(38, 34), alfa: ara(t, 17.0, 17.6) });
    E.formul(ctx, '\\t{Kontrol: } \\frac{15}{6} = \\frac{10}{4} = 2{,}5 \\; ✓', cx, y0 + sat * 3, { boyut: E.yd(32, 30), renk: 'turkuaz', alfa: ara(t, 18.4, 19.0) });
  };

  /* ======================= 7. Hangi strateji? ======================= */
  const ikonGolge = (ctx, x, y, r, a) => {
    E.nokta(ctx, x - r * 0.7, y - r * 0.7, r * 0.18, { renk: 'limon', parilti: 0.8, alfa: a });
    E.cizgi(ctx, [[x - r * 0.4, y + r * 0.6], [x - r * 0.4, y - r * 0.2]], { renk: 'tebesir', kalinlik: 3, alfa: a });
    E.cizgi(ctx, [[x - r * 0.4, y - r * 0.2], [x + r * 0.8, y + r * 0.6]], { renk: 'limon', kalinlik: 2, alfa: a });
    E.cizgi(ctx, [[x - r * 0.4, y + r * 0.6], [x + r * 0.8, y + r * 0.6]], { renk: 'mercan', kalinlik: 4, alfa: a });
  };
  const ikonAyna = (ctx, x, y, r, a) => {
    E.cizgi(ctx, [[x - r * 0.9, y + r * 0.6], [x + r * 0.9, y + r * 0.6]], { renk: 'cizgi', kalinlik: 2, alfa: a });
    E.cizgi(ctx, [[x + r * 0.8, y - r * 0.7], [x, y + r * 0.6], [x - r * 0.5, y - r * 0.1]], { renk: 'limon', kalinlik: 2.5, alfa: a, parilti: 0.5 });
    E.cizgi(ctx, [[x - r * 0.15, y + r * 0.62], [x + r * 0.15, y + r * 0.62]], { renk: 'tebesir', kalinlik: 4, alfa: a });
  };
  const ikonKazik = (ctx, x, y, r, a) => {
    E.cokgen(ctx, [[x - r * 0.9, y - r * 0.7], [x - r * 0.9, y + r * 0.1], [x, y + r * 0.1]], { renk: 'mercan', alfa: 0.2 * a, kenar: true, kenarAlfa: a, kalinlik: 2 });
    E.cokgen(ctx, [[x, y + r * 0.1], [x + r * 0.6, y + r * 0.1], [x + r * 0.6, y + r * 0.63]], { renk: 'turkuaz', alfa: 0.2 * a, kenar: true, kenarAlfa: a, kalinlik: 2 });
  };
  const stratejiSahne = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L, ic = L.icerik;
    const kartlar = [
      { ad: 'Gölge', ikon: ikonGolge, renk: 'limon', satir: ['Güneşli bir gün', 'Gölgenin ucu ölçülebilir'] },
      { ad: 'Ayna', ikon: ikonAyna, renk: 'gok', satir: ['Güneş gerekmez', 'Düz zemin, tabana mesafe'] },
      { ad: 'Kazık', ikon: ikonKazik, renk: 'mercan', satir: ['Yatay uzaklıklar', 'Karşıya geçilemiyorsa'] },
    ];
    E.yazi(ctx, 'Hangi problem, hangi strateji?', L.cx, ic.y + E.yd(30, 40), { boyut: E.yd(40, 36), agirlik: 720, alfa: ara(t, 0.1, 0.8), maxGen: ic.w });
    kartlar.forEach((k, i) => {
      const a = ara(t, 0.6 + i * 0.6, 1.3 + i * 0.6, 'cik3');
      let x, y, w, h;
      if (H) { w = 350; h = 300; x = L.cx - 540 + i * 370; y = ic.y + 100; }
      else { w = ic.w; h = 180; x = ic.x; y = ic.y + 96 + i * 196; }
      y += (1 - a) * 20;
      E.panel(ctx, x, y, w, h, { alfa: a, vurgu: k.renk });
      if (H) {
        k.ikon(ctx, x + w / 2, y + 84, 54, a);
        E.yazi(ctx, k.ad, x + w / 2, y + 170, { boyut: 36, agirlik: 740, renk: k.renk, alfa: a });
        k.satir.forEach((sx, j) => E.yazi(ctx, sx, x + w / 2, y + 220 + j * 36, { boyut: 25, agirlik: 500, renk: 'gumus', alfa: a, maxGen: w - 30 }));
      } else {
        k.ikon(ctx, x + 90, y + h / 2, 52, a);
        E.yazi(ctx, k.ad, x + 190, y + 48, { boyut: 36, agirlik: 740, renk: k.renk, alfa: a, hiza: 'left' });
        k.satir.forEach((sx, j) => E.yazi(ctx, sx, x + 190, y + 100 + j * 38, { boyut: 26, agirlik: 500, renk: 'gumus', alfa: a, hiza: 'left' }));
      }
    });
    const by = H ? ic.y + 460 : ic.y + 712;
    const ba = ara(t, 4.6, 5.4);
    E.yazi(ctx, 'Hepsinde aynı fikir:', L.cx, by, { boyut: E.yd(28, 28), agirlik: 560, renk: 'gumus', alfa: ba });
    E.yazi(ctx, 'benzer üçgen kur, oranı taşı, kontrol et.', L.cx, by + E.yd(46, 44), { boyut: E.yd(34, 30), agirlik: 700, renk: 'limon', alfa: ara(t, 5.2, 6.0), parilti: 0.3, parRenk: 'limon', maxGen: ic.w });
  };

  /* ======================= Özet ve bitiş ======================= */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Benzerlikte oran korunur.', formul: '\\frac{h}{50} = \\frac{1{,}7}{2{,}5}' },
    { tr: 'Verilen → çizim → strateji → çözüm → kontrol.' },
    { tr: 'Aynı anda ölç; kısa yolu ara.', formul: '\\frac{3{,}4}{1{,}7} = 2 \\Rightarrow h = \\frac{68}{2}' },
    { tr: 'Sonucu ikinci bir yolla doğrula.', formul: '\\frac{15}{6} = \\frac{10}{4} = 2{,}5' },
  ], { aralik: 1.6 });

  /** Bitiş kartı (yerel): uzun laboratuvar adı iki satıra sığsın, açıklama altına otursun.
      Motorun E.bitisKarti'sinde labAd sarıldığında açıklamayla çakışıyor (bkz. rapor). */
  let qrOnbellek = null;
  const bitis = (ctx, s) => {
    const L = E.L, t = s.t, ic = L.icerik, H = E.yatay;
    const a1 = ara(t, 0, 0.9, 'cik3'), a2 = ara(t, 0.5, 1.4, 'cik3'), a3 = ara(t, 1.0, 1.9, 'cik3');
    const qrBoy = H ? 220 : 260;
    const qx = H ? L.cx + 190 : L.cx - qrBoy / 2, qy = H ? L.cy - qrBoy / 2 - 40 : ic.y + 380;
    const tx = H ? L.cx - 440 : L.cx, hz = H ? 'left' : 'center';
    const yb = H ? qy - 6 : ic.y + 30;
    E.yazi(ctx, 'ŞİMDİ SEN DENE', tx, yb, { boyut: 26, agirlik: 700, harfAra: 6, renk: 'turkuaz', hiza: hz, alfa: a1 });
    const r = E.yazi(ctx, meta.labAd, tx, yb + 30, { boyut: H ? 44 : 46, agirlik: 760, hiza: hz, alfa: a1, maxGen: H ? 560 : 620, satirAra: 1.05, taban: 'top' });
    E.yazi(ctx, meta.labAciklama, tx, yb + 30 + r.h + 20, { boyut: 26, agirlik: 460, renk: 'gumus', hiza: hz, alfa: a2, maxGen: H ? 540 : 600, taban: 'top' });
    if (window.qrcode && meta.labUrl) {
      if (!qrOnbellek) { const q = window.qrcode(0, 'M'); q.addData(meta.labUrl); q.make(); qrOnbellek = q; }
      const q = qrOnbellek, n = q.getModuleCount(), m = qrBoy / (n + 4);
      ctx.save(); ctx.globalAlpha *= a2;
      E.panel(ctx, qx, qy, qrBoy, qrBoy, { r: 16, renk: 'tebesir', dolguAlfa: 1, kenar: null });
      ctx.fillStyle = E.P.gece;
      for (let rr = 0; rr < n; rr++) for (let c = 0; c < n; c++) if (q.isDark(rr, c)) ctx.fillRect(qx + (c + 2) * m, qy + (rr + 2) * m, m + 0.4, m + 0.4);
      ctx.restore();
      E.isik(ctx, qx + qrBoy / 2, qy + qrBoy / 2, qrBoy, 'turkuaz', 0.12 * a2);
    }
    E.yazi(ctx, meta.labUrl.replace('https://', ''), H ? qx + qrBoy / 2 : L.cx, qy + qrBoy + 34, { boyut: 22, agirlik: 520, renk: 'gumus', alfa: a2 });
    E.yazi(ctx, 'Eksen · Hakan Ataş · CC BY-NC 4.0', L.cx, ic.y1 - (H ? 6 : 10), { boyut: 22, agirlik: 520, renk: 'gumus', alfa: a3, harfAra: 1 });
  };

  /* ======================= Film ======================= */
  E.film({
    meta,
    sure: 117,
    sahneler: [
      { ad: 'Soğuk açılış: gün batımında minare', bas: 0, son: 10.6, giris: 0, cikis: 0.7, itme: 0, ciz: acilis },
      { ad: 'İmza', bas: 10.3, son: 14.0, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 13.7, son: 18.0, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Gölge yöntemi', bas: 17.7, son: 41.0, itme: 0, ciz: golgeSahne },
      { ad: 'Kontrol: bir saat sonra', bas: 40.7, son: 55.5, itme: 0.01, giris: 0.3, ciz: kontrolSahne },
      { ad: 'Ayna yöntemi', bas: 55.2, son: 72.5, ciz: aynaSahne },
      { ad: 'Sürpriz: nehrin genişliği', bas: 72.2, son: 92.5, itme: 0.01, ciz: nehirSahne },
      { ad: 'Hangi strateji?', bas: 92.2, son: 101.5, ciz: stratejiSahne },
      { ad: 'Aklında kalsın', bas: 101.2, son: 111.0, ciz: ozet },
      { ad: 'Laboratuvar', bas: 110.8, son: 117, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 5, renk1: 'menekse', renk2: 'mercan', bulut: 0.8 }),
  });
})();
