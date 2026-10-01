/* ==========================================================================
   EKSEN 9.5.3 — Kırkıncı Adım
   Tek fikir: Bir algoritma binlerce örneği kontrol edebilir ama "her" demeye
   yetmez; tek bir karşıt örnek "her"i yıkar. n² + n + 41, kırk adım boyunca
   asal çıkar; kırkıncı adımda 1681 ışık parçacığı 41 × 41'lik bir kareye dizilir.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp, yd } = E;

  const meta = {
    kod: 'MAT.9.5.3',
    tema: 'Algoritma ve Bilişim',
    ad: 'Kırkıncı Adım',
    adEn: 'The Fortieth Step',
    labAd: 'Algoritma Laboratuvarı',
    labAciklama: 'Bir önermeyi döngüyle binlerce kez sına, karşıt örneği ara; mantık kapılarıyla kendi algoritmanı kur.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-algoritma/',
  };

  /* ---------- Sayısal yardımcılar (t'den bağımsız önbellek serbest) ---------- */
  const asal = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  const DEGER = Array.from({ length: 42 }, (_, n) => n * n + n + 41);
  // Doğrulama: n = 0..39 hepsi asal, n = 40'ta 1681 = 41²
  if (!DEGER.slice(0, 40).every(asal) || DEGER[40] !== 1681 || 41 * 41 !== 1681) console.error('n²+n+41 doğrulaması başarısız');
  const binlik = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');

  /* ---------- Çizim yardımcıları ---------- */
  const parca = (ctx, x, y, r, renk, a) => {
    if (a <= 0.01) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= clamp(a);
    ctx.fillStyle = E.rgba(renk, 0.16); ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, E.TAU); ctx.fill();
    ctx.fillStyle = E.rgba(renk, 0.95); ctx.beginPath(); ctx.arc(x, y, r, 0, E.TAU); ctx.fill();
    ctx.restore();
  };
  const qb = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
  const rozet = (ctx, x, y, r, dogru, a) => {
    if (a <= 0.01) return;
    const rk = dogru ? 'turkuaz' : 'mercan';
    ctx.save(); ctx.globalAlpha *= a;
    ctx.beginPath(); ctx.arc(x, y, r, 0, E.TAU); ctx.fillStyle = E.P.lacivert; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = E.R(rk); ctx.stroke();
    ctx.restore();
    E.isik(ctx, x, y, r * 2.4, rk, 0.25 * a);
    E.yazi(ctx, dogru ? '✓' : '✗', x, y + 1, { boyut: r * 1.35, agirlik: 700, renk: rk, alfa: a });
  };
  /** Sözde kod paneli: satirlar [[ [metin, renk, ek?], ... ], ...] */
  const kodPaneli = (ctx, x, y, w, satirlar, o) => {
    o = Object.assign({ boyut: 24, satirH: 40, alfa: 1, aktif: () => 0, baslik: 'SÖZDE KOD', yaz: 1, vurguRenk: () => 'gok' }, o);
    if (o.alfa <= 0.002) return 0;
    const ust = 48, h = ust + satirlar.length * o.satirH + 16;
    E.panel(ctx, x, y, w, h, { alfa: o.alfa, vurgu: 'gok' });
    E.yazi(ctx, o.baslik, x + 24, y + 26, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'gumus', hiza: 'left', alfa: o.alfa, font: 'mono' });
    satirlar.forEach((satir, i) => {
      const yy = y + ust + i * o.satirH + o.satirH / 2;
      const ak = o.aktif(i), vr = o.vurguRenk(i);
      if (ak > 0.01) {
        ctx.save(); ctx.globalAlpha *= o.alfa * ak;
        ctx.fillStyle = E.rgba(vr, 0.16); ctx.fillRect(x + 8, yy - o.satirH / 2 + 3, w - 16, o.satirH - 6);
        ctx.fillStyle = E.rgba(vr, 0.95); ctx.fillRect(x + 8, yy - o.satirH / 2 + 3, 4, o.satirH - 6);
        ctx.restore();
      }
      const gor = clamp(o.yaz * satirlar.length - i);
      if (gor <= 0) return;
      let xx = x + 24;
      for (const [m, renk, ek] of satir) {
        const op = { boyut: o.boyut, agirlik: ek?.agirlik || 520, font: 'mono' };
        const gw = E.yaziOlc(ctx, m, op);
        const bosluk = m.length - m.trimStart().length;
        const bw = bosluk ? E.yaziOlc(ctx, m.slice(0, bosluk), op) : 0;
        if (m.trim()) E.yazi(ctx, m.trim(), xx + bw, yy, Object.assign({}, op, { renk, hiza: 'left', alfa: o.alfa * gor, parilti: ek?.parilti }));
        xx += gw;
      }
    });
    return h;
  };
  /** Kod satırında bir sütunun (karakter) ekran x'i */
  const kodX = (ctx, x, m, boyut) => x + 24 + E.yaziOlc(ctx, m, { boyut, agirlik: 520, font: 'mono' });

  /* ---------- Ortak ızgara: 41 adım ---------- */
  const izgaraGeo = () => {
    const ic = E.L.icerik, H = E.yatay;
    return H
      ? { kod: { x: ic.x, y: ic.y + 8, w: 418 }, x0: ic.x + 452, y0: ic.y + 96, tw: 94, th: 62, gap: 8, okuX: ic.x + 452 + 353, okuY: ic.y + 40, sayac: [ic.x + 8, ic.y + 400] }
      : { kod: { x: ic.x, y: ic.y, w: 640 }, x0: ic.x + 2, y0: ic.y + 336, tw: 84, th: 56, gap: 8, okuX: E.L.cx, okuY: ic.y + 288, sayac: [E.L.cx, ic.y + 742] };
  };
  const hucre = (G, n) => {
    const c = n % 7, r = Math.floor(n / 7);
    return [G.x0 + c * (G.tw + G.gap), G.y0 + r * (G.th + G.gap)];
  };
  const tn = (n) => 1.4 + 8.0 * Math.pow(n / 39, 0.6); // n'inci adımın yandığı an (açılış)
  const DONGU = [
    [['n ← 0', 'tebesir']],
    [['döngü:', 'menekse']],
    [['  s ← n² + n + 41', 'tebesir']],
    [['  eğer ', 'menekse'], ['asal(s) ', 'gok'], ['değilse: ', 'menekse'], ['DUR', 'mercan', { agirlik: 760 }]],
    [['  n ← n + 1', 'tebesir']],
  ];
  /** 41 adımlık ızgara. o: yanan(n) 0..1, kirmizi (41. hücre 0..1), soru (41. hücre ? nabzı), alfa, t */
  const izgara = (ctx, G, o) => {
    for (let n = 0; n < 41; n++) {
      const [x, y] = hucre(G, n);
      const yan = n < 40 ? o.yanan(n) : 0;
      const son = n === 40;
      const kir = son ? o.kirmizi : 0;
      const a = o.alfa * (son ? Math.max(o.soru, kir, 0.35) : 1) * (o.hucreAlfa ? o.hucreAlfa(n) : 1);
      if (a <= 0.002) continue;
      E.panel(ctx, x, y, G.tw, G.th, { alfa: a, r: 10, kenar: yan > 0.5 || kir > 0.5 ? null : 'sis', dolguAlfa: 0.6 });
      if (yan > 0.01 || kir > 0.01) {
        const rk = kir > 0.01 ? 'mercan' : 'turkuaz';
        const g = Math.max(yan, kir);
        ctx.save(); ctx.globalAlpha *= a * g; E.yuvarlakDik(ctx, x, y, G.tw, G.th, 10);
        ctx.fillStyle = E.rgba(rk, 0.18); ctx.fill(); ctx.strokeStyle = E.R(rk); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        E.isik(ctx, x + G.tw / 2, y + G.th / 2, G.tw * 0.9, rk, (0.1 + 0.4 * E.nabiz(g, 0, 1)) * a);
      }
      if (son) {
        if (kir > 0.01) E.yazi(ctx, '1681', x + G.tw / 2, y + G.th / 2 + 1, { boyut: 24, agirlik: 760, renk: 'mercan', alfa: a * kir });
        else E.yazi(ctx, '?', x + G.tw / 2, y + G.th / 2 + 1, { boyut: 30, agirlik: 760, renk: 'limon', alfa: a * o.soru * (0.6 + 0.4 * Math.sin(o.t * 5)), parilti: 0.5 });
      } else if (yan > 0.01) E.yazi(ctx, binlik(DEGER[n]).replace('\u2009', ''), x + G.tw / 2, y + G.th / 2 + 1, { boyut: 24, agirlik: 600, alfa: a * yan });
    }
  };

  /* ---------- 1. Soğuk açılış: kırk asal ---------- */
  const acilis = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const G = izgaraGeo();
    let son = -1;
    for (let n = 0; n < 40; n++) if (t >= tn(n)) son = n;
    const fb = H ? 24 : 23, sh = H ? 44 : 36;
    // sözde kod
    const kA = ara(t, 0.2, 1.0);
    const hDongu = kodPaneli(ctx, G.kod.x, G.kod.y, G.kod.w, DONGU, {
      boyut: fb, satirH: sh, alfa: kA, yaz: ara(t, 0.2, 1.4, 'lin'),
      aktif: (i) => (son < 0 ? 0 : i === 2 || i === 3 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 7)) : 0.15),
    });
    // ızgara
    izgara(ctx, G, { t, alfa: ara(t, 0.6, 1.4), yanan: (n) => ara(t, tn(n), tn(n) + 0.25), kirmizi: 0, soru: ara(t, 9.6, 10.2) });
    // kod → hücre ışık parçacıkları
    const kaynak = [kodX(ctx, G.kod.x, '  eğer asal(s)', fb), G.kod.y + 48 + 3.5 * sh];
    for (let n = 0; n < 40; n++) {
      const u = ara(t, tn(n) - 0.42, tn(n), 'io2');
      if (u <= 0 || u >= 1) continue;
      const [hx, hy] = hucre(G, n);
      const hedef = [hx + G.tw / 2, hy + G.th / 2];
      const kont = [lerp(kaynak[0], hedef[0], 0.5) + (E.hash(n, 3) - 0.5) * 120, Math.min(kaynak[1], hedef[1]) - 80 - 60 * E.hash(n, 4)];
      for (let k = 0; k < 5; k++) {
        const uu = clamp(u - k * 0.04);
        const [px, py] = qb(kaynak, kont, hedef, uu);
        parca(ctx, px, py, 3.2 - k * 0.5, k ? 'turkuaz' : 'tebesir', (1 - k * 0.18));
      }
    }
    // okuma satırı
    const oA = ara(t, 1.3, 1.7) * (1 - ara(t, 9.6, 10.0));
    if (son >= 0 && oA > 0) {
      E.formul(ctx, `n = ${son}:\\;\\; ${son}^{2} + ${son} + 41 = \\c{turkuaz}{${DEGER[son]}}`, G.okuX, G.okuY, { boyut: H ? 34 : 30, alfa: oA });
    }
    E.yazi(ctx, 'Her n için asal mı?', G.okuX, G.okuY, { boyut: H ? 40 : 36, agirlik: 720, renk: 'limon', alfa: ara(t, 10.0, 10.5), parilti: 0.4 });
    // sayaç
    const sa = ara(t, 1.6, 2.2);
    const sayi = son + 1;
    if (H) {
      E.yazi(ctx, 'ART ARDA ASAL', G.sayac[0], G.sayac[1] - 60, { boyut: 22, agirlik: 700, harfAra: 4, hiza: 'left', renk: 'gumus', alfa: sa });
      E.yazi(ctx, `${sayi}`, G.sayac[0], G.sayac[1] + 6, { boyut: 96, agirlik: 780, hiza: 'left', renk: 'turkuaz', alfa: sa, parilti: 0.35 });
      E.yazi(ctx, '✓', G.sayac[0] + E.yaziOlc(ctx, `${sayi}`, { boyut: 96, agirlik: 780 }) + 22, G.sayac[1] + 6, { boyut: 64, agirlik: 700, hiza: 'left', renk: 'turkuaz', alfa: sa });
    } else {
      E.yazi(ctx, `ART ARDA ASAL:  ${sayi} ✓`, G.sayac[0], G.sayac[1], { boyut: 36, agirlik: 740, renk: 'turkuaz', alfa: sa, parilti: 0.3 });
    }
    E.isik(ctx, L.cx, L.cy, 600, 'turkuaz', 0.1 * ara(t, 8.0, 9.6) * (1 - ara(t, 10.4, 11.5)));
  };

  /* ---------- 2. Kırkıncı adım: 1681 = 41² ---------- */
  const BOLEN = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41];
  const kareGeo = () => {
    const ic = E.L.icerik, H = E.yatay;
    return H ? { x: ic.x + 40, y: ic.y + 56, k: 450 } : { x: E.L.cx - 250, y: ic.y + 4, k: 500 };
  };
  const kirkinci = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const G = izgaraGeo();
    const fb = H ? 24 : 23, sh = H ? 44 : 36;
    // Faz A: ızgara ve 41. hücre (0 – 5.4)
    const aA = 1 - ara(t, 5.0, 5.8);
    const bolIdx = Math.floor(clamp((t - 2.0) / 2.2) * (BOLEN.length - 1) + 1e-6);
    const bulundu = t >= 4.2;
    const kir = ara(t, 4.3, 4.6);
    if (aA > 0.002) {
      kodPaneli(ctx, G.kod.x, G.kod.y, G.kod.w, DONGU, {
        boyut: fb, satirH: sh, alfa: aA,
        aktif: (i) => (i === 2 ? ara(t, 0.6, 0.9) * (1 - ara(t, 1.6, 1.9)) : i === 3 ? ara(t, 1.7, 2.0) : 0),
        vurguRenk: (i) => (i === 3 && bulundu ? 'mercan' : 'gok'),
      });
      izgara(ctx, G, { t, alfa: aA, yanan: () => 1, kirmizi: kir, soru: 1 - kir });
      E.formul(ctx, '40^{2} + 40 + 41 = 1681', G.okuX, G.okuY, { boyut: H ? 34 : 30, alfa: ara(t, 0.4, 0.9) * aA * (1 - ara(t, 1.9, 2.1)), aciga: ara(t, 0.4, 1.6, 'lin') });
      if (t >= 2.0) {
        const b = BOLEN[bolIdx];
        const metin = bulundu ? '1681 : 41 = \\c{mercan}{41}' : `1681 : ${b} \\;\\t{ ✗}`;
        E.formul(ctx, metin, G.okuX, G.okuY, { boyut: H ? 34 : 30, alfa: aA * ara(t, 2.0, 2.2), renk: bulundu ? 'tebesir' : 'gumus' });
      }
      const [hx, hy] = hucre(G, 40);
      E.isik(ctx, hx + G.tw / 2, hy + G.th / 2, 260, 'mercan', 0.6 * E.nabiz(t, 4.2, 1.0) * aA);
      if (H) {
        E.yazi(ctx, 'ART ARDA ASAL', G.sayac[0], G.sayac[1] - 60, { boyut: 22, agirlik: 700, harfAra: 4, hiza: 'left', renk: 'gumus', alfa: aA });
        E.yazi(ctx, '40', G.sayac[0], G.sayac[1] + 6, { boyut: 96, agirlik: 780, hiza: 'left', renk: kir > 0.5 ? 'gumus' : 'turkuaz', alfa: aA });
        E.yazi(ctx, kir > 0.5 ? '✗' : '✓', G.sayac[0] + E.yaziOlc(ctx, '40', { boyut: 96, agirlik: 780 }) + 22, G.sayac[1] + 6, { boyut: 64, agirlik: 700, hiza: 'left', renk: kir > 0.5 ? 'mercan' : 'turkuaz', alfa: aA });
      } else {
        E.yazi(ctx, kir > 0.5 ? 'n = 40:  ✗  döngü durdu' : 'ART ARDA ASAL:  40 ✓', G.sayac[0], G.sayac[1], { boyut: 36, agirlik: 740, renk: kir > 0.5 ? 'mercan' : 'turkuaz', alfa: aA });
      }
    }
    // Faz B: 1681 parçacık 41 × 41 kareye dizilir
    const K = kareGeo();
    const hc = K.k / 41;
    const [hx, hy] = hucre(G, 40);
    const bas = [hx + G.tw / 2, hy + G.th / 2];
    if (t > 5.0) {
      E.isik(ctx, bas[0], bas[1], 340, 'mercan', 0.7 * E.nabiz(t, 5.0, 1.0));
      const dim = 1 - 0.55 * ara(t, 13.0, 14.0);
      for (let i = 0; i < 1681; i++) {
        const h1 = E.hash(i, 101), h2 = E.hash(i, 202), h3 = E.hash(i, 303);
        const s0 = 5.3 + 3.2 * Math.pow(h1, 0.8);
        const u = ara(t, s0, s0 + 1.5, 'io3');
        if (t < s0 - 0.05) continue;
        const c = i % 41, r = Math.floor(i / 41);
        const hedef = [K.x + (c + 0.5) * hc, K.y + (r + 0.5) * hc];
        const aci = h2 * E.TAU, yar = 60 + 260 * h3;
        const kont = [lerp(bas[0], hedef[0], 0.4) + Math.cos(aci) * yar, lerp(bas[1], hedef[1], 0.4) + Math.sin(aci) * yar];
        const [px, py] = qb(bas, kont, hedef, u);
        const rk = u >= 1 ? ((r === 20 || c === 20) && t > 11.4 ? 'limon' : 'turkuaz') : (i % 5 ? 'mercan' : 'tebesir');
        const r0 = u >= 1 ? hc * 0.28 : 2.2;
        if (u >= 1 && t > 6) {
          ctx.save(); ctx.globalAlpha *= dim * (rk === 'limon' ? 1 : 0.85); ctx.fillStyle = E.R(rk);
          ctx.fillRect(px - r0, py - r0, r0 * 2, r0 * 2); ctx.restore();
        } else parca(ctx, px, py, r0, rk, dim);
      }
      // çerçeve ve etiketler
      const cA = ara(t, 10.0, 11.0);
      E.cizgi(ctx, [[K.x - 6, K.y - 6], [K.x + K.k + 6, K.y - 6], [K.x + K.k + 6, K.y + K.k + 6], [K.x - 6, K.y + K.k + 6]], { kapali: true, renk: 'limon', kalinlik: 2.5, parilti: 0.8, p: cA, alfa: dim });
      E.isik(ctx, K.x + K.k / 2, K.y + K.k / 2, K.k, 'turkuaz', 0.18 * E.nabiz(t, 9.8, 2.4));
      const eA = ara(t, 11.2, 11.8) * (1 - 0.4 * ara(t, 13.0, 14.0));
      E.yazi(ctx, '41', K.x + K.k / 2, K.y + K.k + 32, { boyut: 30, agirlik: 760, renk: 'limon', alfa: eA });
      E.yazi(ctx, '41', K.x + K.k + 34, K.y + K.k / 2, { boyut: 30, agirlik: 760, renk: 'limon', alfa: eA });
    }
    // Faz C: yazılar
    const tx = H ? ic.x + 856 : L.cx, ty = H ? ic.y + 120 : ic.y + 596;
    const sayacA = ara(t, 5.6, 6.0) * (1 - ara(t, 10.8, 11.2));
    if (sayacA > 0) {
      let gelen = 0;
      for (let i = 0; i < 1681; i += 1) { const s0 = 5.3 + 3.2 * Math.pow(E.hash(i, 101), 0.8); if (t >= s0 + 1.5) gelen++; }
      E.yazi(ctx, binlik(gelen), tx, ty, { boyut: H ? 72 : 60, agirlik: 780, renk: 'mercan', alfa: sayacA, parilti: 0.3 });
      E.yazi(ctx, 'ışık parçacığı', tx, ty + (H ? 64 : 54), { boyut: H ? 28 : 26, agirlik: 560, renk: 'gumus', alfa: sayacA });
    }
    const f1 = ara(t, 11.0, 11.6);
    E.formul(ctx, '1681 = 41 × 41 = \\c{limon}{41^{2}}', tx, ty, { boyut: H ? 44 : 40, alfa: f1, parilti: 0.3 * f1, parRenk: 'limon' });
    E.formul(ctx, '40^{2} + 40 + 41 = 41^{2}', tx, ty + (H ? 76 : 58), { boyut: H ? 34 : 30, renk: 'gumus', alfa: ara(t, 12.0, 12.6) * (H ? 1 : 1 - ara(t, 13.0, 13.4)) });
    const q1 = ara(t, 13.4, 14.2, 'cik3');
    E.yazi(ctx, 'Kırk kez doğru olmak,', tx, ty + (H ? 190 : 70), { boyut: 32, agirlik: 700, alfa: q1 });
    E.yazi(ctx, 'her zaman doğru olmak değildir.', tx, ty + (H ? 236 : 112), { boyut: 32, agirlik: 700, renk: 'limon', alfa: ara(t, 14.2, 15.0, 'cik3'), parilti: 0.3, maxGen: H ? 560 : 640 });
    E.yazi(ctx, 'Tek karşıt örnek “her”i yıkar.', tx, ty + (H ? 330 : 166), { boyut: H ? 28 : 26, agirlik: 560, renk: 'mercan', alfa: ara(t, 16.0, 16.6) });
  };

  /* ---------- 3. Test ≠ ispat: bitmeyen döngü, tek hamlelik ispat ---------- */
  const Kt = (t) => 1.6 * t + 0.02 * Math.pow(t, 4.2); // kontrol edilen tek sayı indeksi (artan hız)
  const ispat = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    // A: tünel
    const tA = ara(t, 0.2, 0.9) * (1 - ara(t, 8.4, 9.2));
    if (tA > 0.002) {
      E.yazi(ctx, '“Her tek sayının karesi tektir.”', L.cx, ic.y + 24, { boyut: H ? 34 : 30, agirlik: 680, alfa: tA });
      const vp = [L.cx, ic.y + (H ? 150 : 200)];
      const on = [ic.y1 - (H ? 40 : 120)];
      const yan = H ? 0.27 * ic.w : 0.22 * ic.w;
      const K = Kt(t);
      const k0 = Math.max(0, Math.floor(K) - 1);
      const tabanB = H ? 50 : 40;
      // uzaktan yakına çiz
      for (let k = k0 + 60; k >= k0; k--) {
        const z = (k - K) * 0.9;
        if (z < -0.7) continue;
        const sc = 1 / (1 + 0.28 * Math.max(z, -0.6));
        const lane = k % 2 ? 1 : -1;
        const x = vp[0] + lane * yan * sc;
        const y = vp[1] + (on[0] - vp[1]) * sc;
        const al = tA * clamp(1 - (z - 40) / 20) * clamp((z + 0.7) / 0.7);
        const boy = tabanB * sc;
        if (boy >= 22 && z > -0.2) {
          const n = 2 * k + 1;
          E.yazi(ctx, `${binlik(n)}² = ${binlik(n * n)} ✓`, x, y, { boyut: boy, agirlik: 640, alfa: al * clamp(z + 0.6), renk: 'tebesir' });
        } else parca(ctx, x, y, Math.max(1.4, 5 * sc), k % 5 ? 'turkuaz' : 'tebesir', al * 0.9);
      }
      E.isik(ctx, vp[0], vp[1], 200, 'turkuaz', 0.25 * tA);
      // sayaç ve ∞ çubuğu
      const cy = H ? ic.y + 92 : ic.y + 80;
      E.yazi(ctx, `kontrol edilen: ${binlik(Math.floor(K) + 1)}`, H ? ic.x : L.cx, cy, { boyut: H ? 28 : 26, agirlik: 600, hiza: H ? 'left' : 'center', renk: 'turkuaz', alfa: tA * ara(t, 1.0, 1.5) });
      if (H) E.yazi(ctx, 'kalan: sonsuz', ic.x1, cy, { boyut: 28, agirlik: 600, hiza: 'right', renk: 'mercan', alfa: tA * ara(t, 4.5, 5.2) });
      else E.yazi(ctx, 'kalan: sonsuz', L.cx, cy + 40, { boyut: 26, agirlik: 600, renk: 'mercan', alfa: tA * ara(t, 4.5, 5.2) });
    }
    // B: nokta karesi ispatı (k = 3, n = 7)
    const bA = ara(t, 8.8, 9.6);
    if (bA <= 0.002) return;
    const hc = 52, kk = 3, N = 2 * kk + 1;
    const qx = H ? ic.x + 90 : L.cx - (N * hc) / 2, qy = H ? ic.y + 80 : ic.y + 64;
    const grup = ara(t, 11.0, 12.4);
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const i = r * N + c;
      const x = qx + (c + 0.5) * hc, y = qy + (r + 0.5) * hc;
      const ga = ara(t, 9.0 + i * 0.02, 9.4 + i * 0.02);
      const blok = r < 2 * kk && c < 2 * kk, kose = r === 2 * kk && c === 2 * kk;
      const rk = grup < 0.01 ? 'tebesir' : blok ? 'turkuaz' : kose ? 'limon' : 'gok';
      E.nokta(ctx, x, y, kose ? 9 : 8, { renk: rk, alfa: ga * bA, parilti: kose ? 0.6 + 0.6 * E.nabiz(t, 13.6, 1.2) : 0.35 });
    }
    // eşleştirme kapsülleri (ikişerli)
    if (grup > 0) {
      ctx.save(); ctx.globalAlpha *= grup * bA; ctx.lineWidth = 2;
      const kapsul = (x, y, w, h, rk) => { E.yuvarlakDik(ctx, x, y, w, h, Math.min(w, h) / 2); ctx.strokeStyle = E.rgba(rk, 0.85); ctx.stroke(); };
      for (let r = 0; r < 2 * kk; r++) for (let c = 0; c < 2 * kk; c += 2) kapsul(qx + c * hc + 6, qy + r * hc + 10, hc * 2 - 12, hc - 20, 'turkuaz');
      for (let r = 0; r < 2 * kk; r += 2) kapsul(qx + 2 * kk * hc + 10, qy + r * hc + 6, hc - 20, hc * 2 - 12, 'gok');
      for (let c = 0; c < 2 * kk; c += 2) kapsul(qx + c * hc + 6, qy + 2 * kk * hc + 10, hc * 2 - 12, hc - 20, 'gok');
      ctx.restore();
    }
    // kenar etiketleri
    const eA = ara(t, 10.0, 10.6) * bA;
    E.formul(ctx, '2k', qx + kk * hc, qy - 22, { boyut: 26, renk: 'turkuaz', alfa: eA });
    E.formul(ctx, '1', qx + (2 * kk + 0.5) * hc, qy - 22, { boyut: 26, renk: 'limon', alfa: eA });
    E.formul(ctx, '2k', qx - 30, qy + kk * hc, { boyut: 26, renk: 'turkuaz', alfa: eA });
    E.formul(ctx, '1', qx - 30, qy + (2 * kk + 0.5) * hc, { boyut: 26, renk: 'limon', alfa: eA });
    E.isik(ctx, qx + (N - 0.5) * hc, qy + (N - 0.5) * hc, 80, 'limon', 0.6 * E.nabiz(t, 13.6, 1.4) * bA);
    // formüller
    const fx = H ? ic.x + 830 : L.cx, f0 = H ? ic.y + 70 : ic.y + 470, sat = H ? 74 : 62, fb = H ? 40 : 34;
    E.formul(ctx, 'n = 2k + 1', fx, f0, { boyut: fb, alfa: ara(t, 10.4, 11.0) * bA });
    E.formul(ctx, 'n^{2} = \\c{turkuaz}{4k^{2}} + \\c{gok}{4k} + \\c{limon}{1}', fx, f0 + sat, { boyut: fb, alfa: ara(t, 11.4, 12.0) * bA, aciga: ara(t, 11.4, 12.6, 'lin') });
    E.formul(ctx, '= 2(2k^{2} + 2k) + \\c{limon}{1}', fx, f0 + sat * 2, { boyut: fb, alfa: ara(t, 12.8, 13.4) * bA });
    E.formul(ctx, '\\kutu{limon}{n^{2} \\t{ tek, her } k \\t{ için}}', fx, f0 + sat * 3.15, { boyut: fb * 0.95, alfa: ara(t, 14.0, 14.6) * bA, parilti: 0.3, parRenk: 'limon' });
    const cy = H ? f0 + sat * 4.6 : f0 + sat * 4.35;
    E.yazi(ctx, '∀ için: ispat gerekir', fx, cy, { boyut: H ? 30 : 28, agirlik: 640, renk: 'turkuaz', alfa: ara(t, 16.0, 16.6) * bA });
    E.yazi(ctx, '∃ için: bir örnek yeter', fx, cy + (H ? 46 : 42), { boyut: H ? 30 : 28, agirlik: 640, renk: 'gok', alfa: ara(t, 16.8, 17.4) * bA });
  };

  /* ---------- 4. Üç dil ve değil alma ---------- */
  const PAR_A = ['\\forall n \\in \\N,', 'n\\t{ tek}', '\\Rightarrow', 'n^{2}\\t{ tek}'];
  const PAR_B = ['\\exists n \\in \\N,', 'n\\t{ tek}', '\\and', 'n^{2}\\t{ çift}'];
  const DIL_KOD = [
    [['her ', 'menekse'], ['n ∈ ℕ ', 'tebesir'], ['için:', 'menekse']],
    [['  eğer ', 'menekse'], ['n tek ', 'tebesir'], ['ve ', 'turkuaz', { agirlik: 760 }], ['n² çift', 'tebesir'], [':', 'menekse']],
    [['    yaz ', 'menekse'], ['"yanlış"', 'mercan'], ['; DUR', 'menekse']],
  ];
  const ucDil = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const lx = ic.x, cx0 = H ? ic.x + 250 : ic.x;
    const ys = H ? [ic.y + 50, ic.y + 190, ic.y + 330] : [ic.y + 20, ic.y + 200, ic.y + 380];
    const lab = (m, y, a, rk = 'gumus') => E.yazi(ctx, m, lx, y, { boyut: 22, agirlik: 700, harfAra: 4, hiza: 'left', renk: rk, alfa: a });
    const dg = ara(t, 7.6, 9.4, 'io3'); // değil dönüşümü
    // SÖZEL
    const a1 = ara(t, 0.3, 0.9);
    lab('SÖZEL', ys[0] + (H ? 0 : 0), a1);
    const sy = H ? ys[0] : ys[0] + 48;
    E.yazi(ctx, 'Her tek doğal sayının karesi tektir.', cx0, sy, { boyut: H ? 34 : 30, agirlik: 600, hiza: 'left', alfa: a1 * (1 - dg), cakisabilir: dg > 0.02 && dg < 0.98 });
    E.yazi(ctx, 'Karesi çift olan bir tek doğal sayı vardır.', cx0, sy, { boyut: H ? 34 : 30, agirlik: 600, hiza: 'left', renk: 'mercan', alfa: a1 * dg, maxGen: H ? 900 : 640, cakisabilir: dg > 0.02 && dg < 0.98 });
    // SEMBOLİK: parça parça dönüşüm
    const a2 = ara(t, 1.6, 2.2);
    lab('SEMBOLİK', ys[1], a2, dg > 0.5 ? 'mercan' : 'gumus');
    const fb = H ? 46 : 38;
    const pY = H ? ys[1] : ys[1] + 56;
    const gen = (P) => P.map((p) => E.formulOlc(ctx, p, fb).w + fb * 0.4);
    const gA = gen(PAR_A), gB = gen(PAR_B);
    let xa = cx0, xb = cx0;
    const xsA = gA.map((w) => { const v = xa; xa += w; return v; });
    const xsB = gB.map((w) => { const v = xb; xb += w; return v; });
    PAR_A.forEach((p, i) => {
      const degisir = PAR_A[i] !== PAR_B[i];
      const x = lerp(xsA[i], xsB[i], dg);
      const al = a2 * ara(t, 1.6 + i * 0.3, 2.1 + i * 0.3);
      if (!degisir) { E.formul(ctx, p, x, pY, { boyut: fb, hiza: 'left', alfa: al }); return; }
      // takla: üst yarıda eski, alt yarıda yeni
      const q = ara(t, 7.6 + i * 0.25, 8.6 + i * 0.25, 'io3');
      const sc = Math.abs(Math.cos(q * Math.PI));
      const yeni = q >= 0.5;
      ctx.save(); ctx.translate(x, pY); ctx.scale(1, Math.max(0.02, sc)); ctx.translate(-x, -pY);
      E.formul(ctx, yeni ? PAR_B[i] : p, x, pY, { boyut: fb, hiza: 'left', alfa: al * Math.max(0.25, sc), renk: yeni ? 'mercan' : 'tebesir', parilti: yeni ? 0.35 : 0, parRenk: 'mercan' });
      ctx.restore();
      if (q > 0 && q < 1) E.isik(ctx, x + gA[i] / 2, pY, 70, 'mercan', 0.5 * Math.sin(q * Math.PI));
    });
    // ALGORİTMİK
    const a3 = ara(t, 3.2, 3.8);
    lab('ALGORİTMİK', ys[2], a3);
    const kx = H ? cx0 - 6 : ic.x, ky = H ? ys[2] - 26 : ys[2] + 28, kw = H ? 530 : 640;
    const fbk = H ? 26 : 24;
    kodPaneli(ctx, kx, ky, kw, DIL_KOD, {
      boyut: fbk, satirH: H ? 44 : 40, alfa: a3, yaz: ara(t, 3.3, 4.6, 'lin'), baslik: 'SÖZDE KOD',
      aktif: (i) => (i === 1 ? ara(t, 9.6, 10.2) : 0), vurguRenk: () => 'mercan',
    });
    // bağ: kod koşulu ↔ değil formülü
    const bA = ara(t, 10.0, 10.8) * (1 - ara(t, 15.6, 16.3));
    if (bA > 0) {
      const ky1 = ky + 48 + 1.5 * (H ? 44 : 40);
      const kx1 = kodX(ctx, kx, '  eğer n tek ve n² çift', fbk) + 8;
      const px = xsB[2] + gB[2] / 2, py = pY + fb * 0.6;
      const pts = [];
      for (let i = 0; i <= 24; i++) pts.push(qb([kx1, ky1], [Math.max(kx1, px) + 90, (ky1 + py) / 2], [px, py + 10], i / 24));
      E.cizgi(ctx, pts, { renk: 'mercan', kalinlik: 2.5, parilti: 0.8, p: bA, kesik: [8, 8] });
      for (let i = 0; i < 6; i++) { const u = (t * 0.6 + i / 6) % 1; const [x, y] = qb([kx1, ky1], [Math.max(kx1, px) + 90, (ky1 + py) / 2], [px, py + 10], u); parca(ctx, x, y, 2.6, 'mercan', bA * 0.9); }
    }
    // sonuç satırı
    const rx = H ? ic.x + 1004 : L.cx, ry = H ? ys[2] + 30 : ic.y + 640;
    const rA = ara(t, 11.0, 11.6);
    E.yazi(ctx, H ? 'Döngü, değilin\nörneğini arar.' : 'Döngü, değilin örneğini arar.', rx, ry, { boyut: H ? 30 : 28, agirlik: 640, renk: 'mercan', alfa: rA, hiza: 'center' });
    E.formul(ctx, '\\kutu{limon}{\\neg(p \\Rightarrow q) \\;≡\\; p \\and \\neg q}', rx, ry + (H ? 112 : 80), { boyut: H ? 30 : 32, alfa: ara(t, 12.4, 13.0), parilti: 0.25, parRenk: 'limon' });
  };

  /* ---------- 5. İSE'nin yönü ve VEYA'nın belirsizliği ---------- */
  const yon = (ctx, s) => {
    const t = s.t, L = E.L, ic = L.icerik;
    const H = E.yatay;
    const dA = 1 - ara(t, 10.0, 10.6);
    // Euler diyagramı
    const B = H ? { x: ic.x + 330, y: ic.y + 260, rx: 290, ry: 170 } : { x: L.cx, y: ic.y + 230, rx: 300, ry: 170 };
    const S = H ? { x: B.x + 110, y: B.y + 20, rx: 130, ry: 92 } : { x: B.x + 110, y: B.y + 22, rx: 140, ry: 92 };
    if (dA > 0.002) {
      const eA = ara(t, 0.6, 1.4) * dA;
      const elips = (o, rk, a, p) => {
        const pts = []; for (let i = 0; i <= 72; i++) { const u = (i / 72) * E.TAU; pts.push([o.x + Math.cos(u) * o.rx, o.y + Math.sin(u) * o.ry]); }
        E.cokgen(ctx, pts, { renk: rk, alfa: 0.08 * a });
        E.cizgi(ctx, pts, { renk: rk, kalinlik: 2.5, parilti: 0.6, alfa: a, p });
      };
      elips(B, 'gok', eA, ara(t, 0.6, 1.6));
      elips(S, 'turkuaz', ara(t, 1.0, 1.8) * dA, ara(t, 1.0, 2.0));
      E.yazi(ctx, '2’ye bölünenler', B.x - B.rx * 0.3, B.y - B.ry * 0.72, { boyut: 24, agirlik: 640, renk: 'gok', alfa: ara(t, 3.8, 4.4) * dA });
      E.yazi(ctx, '4’e bölünenler', S.x, S.y - S.ry * 0.58, { boyut: 22, agirlik: 640, renk: 'turkuaz', alfa: ara(t, 4.0, 4.6) * dA });
      // 1..12 sayıları: üst sıradan yerlerine uçar
      const yer = {
        4: [S.x - 62, S.y + 14], 8: [S.x + 2, S.y + 40], 12: [S.x + 66, S.y + 10],
        2: [B.x - B.rx * 0.62, B.y + 6], 6: [B.x - B.rx * 0.34, B.y + B.ry * 0.5], 10: [B.x - B.rx * 0.3, B.y - B.ry * 0.12],
      };
      const tek = [1, 3, 5, 7, 9, 11];
      const altY = H ? B.y + B.ry + 52 : B.y + B.ry + 48;
      const ustY = H ? ic.y + 24 : ic.y + 20;
      const aralik = H ? 54 : 52;
      for (let n = 1; n <= 12; n++) {
        const bas = [B.x - aralik * 5.5 + (n - 1) * aralik, ustY];
        const hedef = yer[n] || [B.x - 250 + tek.indexOf(n) * 100, altY];
        const u = ara(t, 1.8 + n * 0.08, 2.8 + n * 0.08, 'io3');
        const x = lerp(bas[0], hedef[0], u), y = lerp(bas[1], hedef[1], u) - Math.sin(u * Math.PI) * 30;
        const alti = n === 6 ? ara(t, 6.4, 6.9) : 0;
        const rk = n % 4 === 0 ? 'turkuaz' : n % 2 === 0 ? 'gok' : 'gumus';
        E.nokta(ctx, x, y - 22, 5, { renk: rk, alfa: ara(t, 0.2 + n * 0.04, 0.6 + n * 0.04) * dA, parilti: 0.7 });
        E.yazi(ctx, String(n), x, y + 6, { boyut: 26, agirlik: 680, renk: alti > 0.5 ? 'mercan' : n % 2 ? 'gumus' : 'tebesir', alfa: ara(t, 0.2 + n * 0.04, 0.6 + n * 0.04) * dA });
        if (alti > 0) {
          ctx.save(); ctx.globalAlpha *= alti * dA; ctx.strokeStyle = E.R('mercan'); ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(x, y - 6, 34, 0, E.TAU * alti); ctx.stroke(); ctx.restore();
          E.isik(ctx, x, y - 6, 90, 'mercan', 0.4 * alti * dA);
        }
      }
      // önermeler
      const fx = H ? ic.x + 900 : L.cx, f0 = H ? ic.y + 90 : ic.y + 520, sat = H ? 96 : 74, fb = H ? 38 : 34;
      E.formul(ctx, '4 \\,|\\, n \\;\\Rightarrow\\; 2 \\,|\\, n \\quad \\c{turkuaz}{\\t{✓}}', fx, f0, { boyut: fb, alfa: ara(t, 3.2, 3.8) * dA });
      E.formul(ctx, '2 \\,|\\, n \\;\\Rightarrow\\; 4 \\,|\\, n \\quad \\c{mercan}{\\t{✗}}', fx, f0 + sat, { boyut: fb, alfa: ara(t, 5.0, 5.6) * dA, renk: t > 6.6 ? 'gumus' : 'tebesir' });
      E.yazi(ctx, 'karşıt örnek: n = 6', fx, f0 + sat + (H ? 50 : 44), { boyut: H ? 26 : 24, agirlik: 640, renk: 'mercan', alfa: ara(t, 6.6, 7.1) * dA });
      E.formul(ctx, 'n \\t{ tek} \\;\\iff\\; n^{2} \\t{ tek} \\quad \\c{turkuaz}{\\t{✓}}', fx, f0 + sat * 2 + (H ? 40 : 34), { boyut: fb, alfa: ara(t, 8.0, 8.6) * dA });
    }
    // VEYA'nın belirsizliği
    const vA = ara(t, 10.4, 11.0);
    if (vA > 0.002) {
      const y0 = H ? ic.y + 110 : ic.y + 140;
      E.yazi(ctx, 'Menü: “çorba veya salata”', L.cx, y0, { boyut: H ? 40 : 34, agirlik: 700, alfa: vA });
      const sx = H ? [L.cx - 280, L.cx + 280] : [L.cx, L.cx];
      const sy = H ? [y0 + 170, y0 + 170] : [y0 + 170, y0 + 400];
      // günlük dil
      const a1 = ara(t, 11.2, 11.8), a2 = ara(t, 12.4, 13.0);
      E.panel(ctx, sx[0] - 250, sy[0] - 90, 500, 180, { alfa: a1, vurgu: 'gumus' });
      E.yazi(ctx, 'GÜNLÜK DİL', sx[0], sy[0] - 52, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'gumus', alfa: a1 });
      E.yazi(ctx, 'genelde yalnız biri', sx[0], sy[0] + 2, { boyut: 30, agirlik: 640, alfa: a1 });
      E.yazi(ctx, 'belirsiz', sx[0], sy[0] + 50, { boyut: 26, agirlik: 560, renk: 'mercan', alfa: a1 });
      E.panel(ctx, sx[1] - 250, sy[1] - 90, 500, 180, { alfa: a2, vurgu: 'turkuaz' });
      E.yazi(ctx, 'MATEMATİK', sx[1], sy[1] - 52, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'turkuaz', alfa: a2 });
      E.formul(ctx, 'p \\or q', sx[1] - 90, sy[1] + 12, { boyut: 40, alfa: a2, renk: 'turkuaz' });
      E.formul(ctx, 'p \\xor q', sx[1] + 90, sy[1] + 12, { boyut: 40, alfa: ara(t, 13.0, 13.6), renk: 'menekse' });
      E.yazi(ctx, 'ikisi de olabilir', sx[1] - 90, sy[1] + 58, { boyut: 22, agirlik: 560, renk: 'gumus', alfa: a2 });
      E.yazi(ctx, 'tam biri', sx[1] + 90, sy[1] + 58, { boyut: 22, agirlik: 560, renk: 'gumus', alfa: ara(t, 13.0, 13.6) });
      const kA = ara(t, 14.0, 14.6);
      E.yazi(ctx, 'Sembol belirsizliği kaldırır.', L.cx, H ? ic.y1 - 40 : sy[1] + 150, { boyut: H ? 34 : 30, agirlik: 700, renk: 'limon', alfa: kA, parilti: 0.3 });
    }
  };

  /* ---------- Özet ve bitiş ---------- */
  const imza = (ctx, s) => E.imza(ctx, s, meta);
  const baslik = (ctx, s) => E.baslikKarti(ctx, s, meta);
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Kırk test bile ispat değildir.', formul: '40^{2} + 40 + 41 = 41^{2}' },
    { tr: 'Tek karşıt örnek “her”i yıkar.', formul: '\\exists n:\\; \\neg P(n)' },
    { tr: '“Her” için ispat, “bazı” için bir örnek.', formul: '\\forall \\;\\t{ / }\\; \\exists' },
    { tr: 'Sembolik dil yalın ve kesindir.', formul: '\\forall n,\\; n\\t{ tek} \\Rightarrow n^{2}\\t{ tek}' },
  ], { aralik: 1.6 });
  // Yerel çözüm: motorun bitiş kartı iki satıra sarılan laboratuvar adını hesaba katmıyor;
  // adı tek satıra sığdırıp açıklamayı burada çiziyoruz.
  const bitis = (ctx, s) => {
    E.bitisKarti(ctx, s, Object.assign({}, meta, { labAd: '', labAciklama: '' }));
    const L = E.L, ic = L.icerik, t = s.t;
    const qy = E.yd(L.cy - 110 - 40, ic.y + 330);
    const tx = E.yd(L.cx - 400, L.cx), hz = E.yd('left', 'center');
    const boy = E.sigdir(ctx, meta.labAd, { boyut: E.yd(50, 46), agirlik: 760 }, E.yd(520, 600), 36);
    E.yazi(ctx, meta.labAd, tx, E.yd(qy + 82, ic.y + 120), { boyut: boy, agirlik: 760, hiza: hz, alfa: E.ara(t, 0, 0.9, 'cik3') });
    E.yazi(ctx, meta.labAciklama, tx, E.yd(qy + 158, ic.y + 210), { boyut: 26, agirlik: 460, renk: 'gumus', hiza: hz, alfa: E.ara(t, 0.5, 1.4, 'cik3'), maxGen: E.yd(500, 600) });
  };

  /* ---------- Film ---------- */
  E.film({
    meta,
    sure: 108.0,
    sahneler: [
      { ad: 'Soğuk açılış: kırk asal', bas: 0, son: 12.0, giris: 0, cikis: 0.7, itme: 0.04, ciz: acilis },
      { ad: 'İmza', bas: 11.7, son: 15.4, giris: 0.3, ciz: imza },
      { ad: 'Başlık', bas: 15.1, son: 19.4, ciz: baslik },
      { ad: 'Kırkıncı adım: 1681 = 41²', bas: 19.1, son: 39.0, ciz: kirkinci },
      { ad: 'Test ispat değildir', bas: 38.7, son: 58.5, ciz: ispat },
      { ad: 'Üç dil ve değil alma', bas: 58.2, son: 75.2, ciz: ucDil },
      { ad: 'İSE’nin yönü, VEYA’nın belirsizliği', bas: 74.9, son: 91.4, ciz: yon },
      { ad: 'Aklında kalsın', bas: 91.1, son: 101.6, ciz: ozet },
      { ad: 'Laboratuvar', bas: 101.4, son: 108.0, cikis: 0.8, ciz: bitis },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 6, renk1: 'turkuaz', renk2: 'menekse' }),
  });
})();
