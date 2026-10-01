/* ==========================================================================
   EKSEN 9.5.1 — Haritadan Çizgeye
   Tek fikir: Bir problemi algoritmayla çözmenin ilk adımı onu doğru temsile
   çevirmektir. Königsberg haritası gözümüzün önünde noktalara ve çizgilere
   (çizge) dönüşür; köprü sorusu, dereceleri sayan kısa bir algoritmaya iner.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp } = E;

  const meta = {
    kod: 'MAT.9.5.1',
    tema: 'Algoritma ve Bilişim',
    ad: 'Haritadan Çizgeye',
    adEn: 'From Map to Graph',
    labAd: 'Algoritma Laboratuvarı',
    labAciklama: 'Kendi çizgeni çiz, Euler yolunu ara; ikili arama oyununda en az soruyla sayıyı bul.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-algoritma/',
  };

  const TAU = Math.PI * 2;
  const H_ = () => E.yatay;

  /* ======================= Königsberg verisi (harita birimi: 1000 × 600) ======================= */
  // Akarsu kolları: batıdan gelen ana kol adanın (A) batı ucunda ikiye ayrılır; kuzey kol B ile A/D arasından,
  // güney kol C ile A/D arasından doğuya akar; A ile D arasındaki kısa bağlantı kanalı iki kolu birleştirir.
  const KOL = {
    bati: { w: 58, p: [[-90, 300], [40, 302], [150, 300]] },
    kuzey: { w: 50, p: [[150, 300], [240, 220], [400, 196], [560, 194], [760, 186], [1090, 160]] },
    guney: { w: 50, p: [[150, 300], [240, 380], [400, 404], [560, 406], [760, 414], [1090, 440]] },
    bag: { w: 40, p: [[560, 194], [580, 300], [560, 406]] },
  };
  const BOLGE = { A: [365, 300], B: [455, 78], C: [455, 522], D: [835, 300] };
  const RENK = { A: 'turkuaz', B: 'mercan', C: 'menekse', D: 'gok' };
  // Köprüler: hangi kolda, nerede, hangi iki kara parçası
  const KOPRU_TANIM = [
    { kol: 'kuzey', x: 285, u: 'A', v: 'B' },
    { kol: 'kuzey', x: 455, u: 'A', v: 'B' },
    { kol: 'guney', x: 285, u: 'A', v: 'C' },
    { kol: 'guney', x: 455, u: 'A', v: 'C' },
    { kol: 'bag', y: 300, u: 'A', v: 'D' },
    { kol: 'kuzey', x: 790, u: 'B', v: 'D' },
    { kol: 'guney', x: 790, u: 'C', v: 'D' },
  ];
  /** Catmull–Rom örnekleme */
  const egri = (p, n = 18) => {
    const out = [];
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
      for (let j = 0; j < n; j++) {
        const t = j / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
      }
    }
    out.push(p[p.length - 1]);
    return out;
  };
  const ORNEK = {};
  for (const k in KOL) ORNEK[k] = egri(KOL[k].p);
  const KOPRU = KOPRU_TANIM.map((b, i) => {
    const o = ORNEK[b.kol];
    let en = 0, eb = Infinity;
    o.forEach((q, j) => { const d = b.x !== undefined ? Math.abs(q[0] - b.x) : Math.abs(q[1] - b.y); if (d < eb) { eb = d; en = j; } });
    const c = o[en], a = o[Math.max(0, en - 2)], z = o[Math.min(o.length - 1, en + 2)];
    const L = Math.hypot(z[0] - a[0], z[1] - a[1]);
    const tg = [(z[0] - a[0]) / L, (z[1] - a[1]) / L];
    let n = [-tg[1], tg[0]];
    const bu = BOLGE[b.u];
    if ((bu[0] - c[0]) * n[0] + (bu[1] - c[1]) * n[1] < 0) n = [-n[0], -n[1]]; // n: u tarafına bakar
    return { ...b, i, c, tg, n, w: KOL[b.kol].w };
  });
  const DERECE = { A: 5, B: 3, C: 3, D: 3 };

  /* ---------- Statik harita önbelleği (t'den bağımsız) ---------- */
  const suUzaklik = (x, y) => {
    let m = Infinity;
    for (const k in ORNEK) for (const q of ORNEK[k]) { const d = Math.hypot(q[0] - x, q[1] - y) - KOL[k].w / 2; if (d < m) m = d; }
    return m;
  };
  let haritaTuval = null;
  const haritaHazirla = () => {
    if (haritaTuval) return haritaTuval;
    const S = 2, c = document.createElement('canvas');
    c.width = 1000 * S; c.height = 600 * S;
    const g = c.getContext('2d');
    g.scale(S, S);
    // kara
    const zg = g.createLinearGradient(0, 0, 1000, 600);
    zg.addColorStop(0, E.karistir('lacivert', 'derin', 0.6)); zg.addColorStop(1, E.karistir('lacivert', 'derin', 0.3));
    g.fillStyle = zg; g.fillRect(0, 0, 1000, 600);
    // sokak ağı (ince)
    const r = E.rng(1736);
    g.strokeStyle = E.rgba('sis', 0.55); g.lineWidth = 1;
    for (let i = 0; i < 46; i++) {
      const x = r() * 1000, y = r() * 600, a = r() * Math.PI, l = 60 + r() * 120;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    // binalar (çatılar)
    for (let i = 0; i < 1500; i++) {
      const x = r() * 1000, y = r() * 600;
      const su = suUzaklik(x, y);
      if (su < 12) continue;
      // Kneiphof (A) yoğun eski şehir; Lomse (D) seyrek
      const bolgeD = x > 600 && y > 215 && y < 395;
      if (bolgeD && r() < 0.6) continue;
      if (su > 140 && r() < 0.5) continue;
      const w = 6 + r() * 14, h = 5 + r() * 10, a = (r() - 0.5) * 0.5;
      g.save(); g.translate(x, y); g.rotate(a);
      g.fillStyle = E.karistir('derin', r() < 0.2 ? 'menekse' : 'gumus', 0.12 + r() * 0.18);
      g.fillRect(-w / 2, -h / 2, w, h);
      if (r() < 0.12) { g.fillStyle = E.rgba('limon', 0.55); g.fillRect(-1, -1, 2, 2); }
      g.restore();
    }
    // katedral (adada)
    g.fillStyle = E.karistir('derin', 'gumus', 0.35);
    g.fillRect(380, 286, 46, 20); g.fillRect(372, 282, 10, 28);
    // ağaçlar (Lomse bahçeleri)
    for (let i = 0; i < 120; i++) {
      const x = 600 + r() * 400, y = 215 + r() * 180;
      if (suUzaklik(x, y) < 10) continue;
      g.fillStyle = E.rgba('turkuaz', 0.1 + r() * 0.12); g.beginPath(); g.arc(x, y, 3 + r() * 5, 0, TAU); g.fill();
    }
    // su
    for (const k of ['bati', 'kuzey', 'guney', 'bag']) {
      const o = ORNEK[k];
      const yol = () => { g.beginPath(); o.forEach((q, j) => (j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); };
      g.lineCap = 'round'; g.lineJoin = 'round';
      yol(); g.strokeStyle = E.karistir('gece', 'gok', 0.18); g.lineWidth = KOL[k].w + 6; g.stroke();
      yol(); g.strokeStyle = E.karistir('derin', 'gok', 0.35); g.lineWidth = KOL[k].w; g.stroke();
      yol(); g.strokeStyle = E.karistir('derin', 'gok', 0.5); g.lineWidth = KOL[k].w * 0.35; g.stroke();
    }
    // kenar kararması
    g.globalCompositeOperation = 'destination-in';
    const mg = g.createRadialGradient(500, 300, 220, 500, 300, 620);
    mg.addColorStop(0, 'rgba(0,0,0,1)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = mg; g.fillRect(0, 0, 1000, 600);
    haritaTuval = c;
    return c;
  };

  /* ---------- Harita/çizge çizim yardımcıları ---------- */
  const donustur = (T) => (q) => [T.x0 + q[0] * T.k, T.y0 + q[1] * T.k];
  const haritaCiz = (ctx, T, o = {}) => {
    const a = o.alfa ?? 1;
    if (a <= 0.002) return;
    const c = haritaHazirla();
    ctx.save(); ctx.globalAlpha *= a;
    if (o.bulanik) ctx.filter = `blur(${(o.bulanik * T.k).toFixed(2)}px)`;
    ctx.drawImage(c, T.x0, T.y0, 1000 * T.k, 600 * T.k);
    ctx.filter = 'none';
    ctx.restore();
    // akan su pırıltıları
    if ((o.parilti ?? 1) > 0 && a > 0.05) {
      const P = donustur(T), t = o.t || 0;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const k of ['bati', 'kuzey', 'guney']) {
        const s = ORNEK[k];
        for (let i = 0; i < 9; i++) {
          const u = ((i / 9 + t * 0.025 * (k === 'bati' ? -1 : 1)) % 1 + 1) % 1;
          const j = Math.floor(u * (s.length - 1)), q = s[j];
          const [x, y] = P([q[0], q[1] + Math.sin(i * 7.1) * KOL[k].w * 0.25]);
          ctx.fillStyle = E.rgba('gok', 0.35 * a * (o.parilti ?? 1));
          ctx.fillRect(x - 6 * T.k, y - 1, 12 * T.k, 2);
        }
      }
      ctx.restore();
    }
  };
  /** Köprü: suyu dik kesen plaka. durum: 0 normal, renk ile vurgu */
  const kopruCiz = (ctx, T, b, o = {}) => {
    const a = o.alfa ?? 1;
    if (a <= 0.002) return;
    const P = donustur(T);
    const yar = (b.w / 2 + 12) * T.k * (o.boy ?? 1), gen = 7 * T.k;
    const [cx, cy] = P(b.c);
    const nx = b.n[0], ny = b.n[1], tx = b.tg[0], ty = b.tg[1];
    const pts = [[cx + nx * yar + tx * gen, cy + ny * yar + ty * gen], [cx - nx * yar + tx * gen, cy - ny * yar + ty * gen], [cx - nx * yar - tx * gen, cy - ny * yar - ty * gen], [cx + nx * yar - tx * gen, cy + ny * yar - ty * gen]];
    const renk = o.renk || 'gumus';
    E.cokgen(ctx, pts, { renk, alfa: (o.dolgu ?? 0.85) * a, kenar: true, kenarRenk: renk, kenarAlfa: a, kalinlik: 1.5, parilti: o.parilti || 0 });
    if (o.isik) E.isik(ctx, cx, cy, 40 * T.k + 20, renk, 0.5 * o.isik * a);
  };

  /* ---------- Çizge ---------- */
  // Kanonik çizge yerleşimi (harita birimi) ve ayrıtlar: [u, v, kontrol noktası]
  const KANON = { A: [380, 300], B: [380, 60], C: [380, 540], D: [820, 300] };
  const KANON_K = [[262, 180], [498, 180], [262, 420], [498, 420], [600, 300], [650, 150], [650, 450]];
  /** p ∈ [0,1] arasında: köprüden geçen çizge (0) → kanonik çizge (1) */
  const cizgeGeometri = (p) => {
    const dug = {};
    for (const k of 'ABCD') dug[k] = [lerp(BOLGE[k][0], KANON[k][0], p), lerp(BOLGE[k][1], KANON[k][1], p)];
    const ayr = KOPRU.map((b, i) => {
      const P0 = BOLGE[b.u], P1 = BOLGE[b.v];
      const kB = [2 * b.c[0] - (P0[0] + P1[0]) / 2, 2 * b.c[1] - (P0[1] + P1[1]) / 2];
      return { u: b.u, v: b.v, k: [lerp(kB[0], KANON_K[i][0], p), lerp(kB[1], KANON_K[i][1], p)] };
    });
    return { dug, ayr };
  };
  const kuad = (a, k, b, n = 28) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * a[0] + 2 * u * t * k[0] + t * t * b[0], u * u * a[1] + 2 * u * t * k[1] + t * t * b[1]]); } return o; };
  /**
   * Çizgeyi çiz. o.ayrit(i) → {renk, alfa, p, ortadan, kalinlik}; o.dugum(k) → {alfa, r, renk, isik}
   */
  const cizgeCiz = (ctx, T, G, o = {}) => {
    const P = donustur(T);
    G.ayr.forEach((e, i) => {
      const s = o.ayrit ? o.ayrit(i) : {};
      const al = s.alfa ?? 1;
      if (al <= 0.002) return;
      const pts = kuad(G.dug[e.u], e.k, G.dug[e.v]).map(P);
      const st = { renk: s.renk || 'gumus', kalinlik: s.kalinlik || 3.5, parilti: s.parilti ?? 0.5, alfa: al };
      if (s.ortadan !== undefined) { // ortadan iki uca doğru büyü
        const m = Math.floor(pts.length / 2);
        E.cizgi(ctx, pts.slice(0, m + 1).reverse(), Object.assign({ p: s.ortadan }, st));
        E.cizgi(ctx, pts.slice(m), Object.assign({ p: s.ortadan }, st));
      } else E.cizgi(ctx, pts, Object.assign({ p: s.p ?? 1 }, st));
    });
    for (const k of 'ABCD') {
      const s = o.dugum ? o.dugum(k) : {};
      const al = s.alfa ?? 1;
      if (al <= 0.002) continue;
      const [x, y] = P(G.dug[k]);
      const r = s.r ?? 20;
      if (s.isik) E.isik(ctx, x, y, r * 5, s.renk || RENK[k], 0.5 * s.isik * al);
      ctx.save(); ctx.globalAlpha *= al;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = E.P.lacivert; ctx.fill();
      ctx.lineWidth = 3.5; ctx.strokeStyle = E.R(s.renk || RENK[k]); ctx.stroke();
      ctx.restore();
      if (r >= 15) E.yazi(ctx, k, x, y + 1, { boyut: Math.max(22, r * 1.15), agirlik: 760, renk: s.renk || RENK[k], alfa: al * (s.harf ?? 1) });
    }
  };
  /** Ayrıt noktası (kuadratik üzerinde t) */
  const ayritNokta = (G, i, t) => { const e = G.ayr[i], a = G.dug[e.u], b = G.dug[e.v], u = 1 - t; return [u * u * a[0] + 2 * u * t * e.k[0] + t * t * b[0], u * u * a[1] + 2 * u * t * e.k[1] + t * t * b[1]]; };

  /** Derece rozeti */
  const rozet = (ctx, x, y, metin, o = {}) => E.etiket(ctx, metin, x, y, { boyut: o.boyut || 24, renk: o.renk || 'tebesir', plaka: 'gece', plakaAlfa: 0.85, kenar: o.kenar || null, alfa: o.alfa ?? 1, agirlik: 700, formul: !!o.formul });

  /* ---------- Yürüyüş (soğuk açılış) ---------- */
  // C → A (3) → C (4) → D (7) → A (5) → B (1) → A (2) : 6 köprü; 6 numaralı köprü (B–D) artar
  const YURU_K = [2, 3, 6, 4, 0, 1]; // köprü indeksleri
  const YURU_BOLGE = ['C', 'A', 'C', 'D', 'A', 'B', 'A'];
  const yuruyusYolu = (() => {
    const yol = [[300, 470]], kopruS = [];
    let bolge = 'C';
    YURU_K.forEach((bi, j) => {
      const b = KOPRU[bi];
      const yon = b.u === bolge ? 1 : -1; // n: u tarafını gösterir
      const g = [b.c[0] + b.n[0] * yon * 46, b.c[1] + b.n[1] * yon * 46];
      const c = [b.c[0] - b.n[0] * yon * 46, b.c[1] - b.n[1] * yon * 46];
      yol.push(g, b.c);
      kopruS.push(yol.length - 1);
      yol.push(c);
      bolge = YURU_BOLGE[j + 1];
    });
    yol.push([372, 300]);
    // yay uzunlukları
    const uz = [0];
    for (let i = 1; i < yol.length; i++) uz.push(uz[i - 1] + Math.hypot(yol[i][0] - yol[i - 1][0], yol[i][1] - yol[i - 1][1]));
    return { yol, uz, top: uz[uz.length - 1], kopruUz: kopruS.map((i) => uz[i]) };
  })();
  const yolKes = (Y, s) => { // s: yay uzunluğu → noktalar ve uç
    const out = [Y.yol[0]];
    for (let i = 1; i < Y.yol.length; i++) {
      if (Y.uz[i] <= s) out.push(Y.yol[i]);
      else { const q = (s - Y.uz[i - 1]) / (Y.uz[i] - Y.uz[i - 1]); out.push([lerp(Y.yol[i - 1][0], Y.yol[i][0], q), lerp(Y.yol[i - 1][1], Y.yol[i][1], q)]); break; }
    }
    return out;
  };

  /* ======================= Yerleşimler ======================= */
  const TR = (ad) => {
    const ic = E.L.icerik, H = E.yatay;
    const tablo = {
      acilis: H ? { k: 0.95, x0: E.L.cx - 475, y0: ic.y + 0 } : { k: 0.7, x0: 10, y0: ic.y + 170 },
      donusum: H ? { k: 0.86, x0: ic.x - 10, y0: ic.y + 30 } : { k: 0.68, x0: 20, y0: ic.y + 30 },
      euler: H ? { k: 0.64, x0: ic.x - 10, y0: ic.y + 60 } : { k: 0.66, x0: 26, y0: ic.y + 6 },
      algo: H ? { k: 0.56, x0: ic.x - 20, y0: ic.y + 150 } : { k: 0.5, x0: 112, y0: ic.y + 100 },
    };
    return tablo[ad];
  };

  /* ======================= 1. Soğuk açılış ======================= */
  const acilis = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L, ic = L.icerik;
    const T = TR('acilis');
    const ink = ara(t, 0.0, 1.8, 'cik3');
    haritaCiz(ctx, T, { alfa: ink, t });
    // bölge etiketleri
    const P = donustur(T);
    for (const k of 'ABCD') {
      const [x, y] = P(BOLGE[k]);
      rozet(ctx, x, y, k, { renk: RENK[k], alfa: ara(t, 1.4 + 'ABCD'.indexOf(k) * 0.15, 2.0 + 'ABCD'.indexOf(k) * 0.15), boyut: 26 });
    }
    // yürüyüş
    const Y = yuruyusYolu;
    const sY = Y.top * ara(t, 3.6, 9.4, 'lin');
    let gecilen = 0;
    Y.kopruUz.forEach((u) => { if (sY >= u) gecilen++; });
    KOPRU.forEach((b, i) => {
      const sira = YURU_K.indexOf(i);
      const gecti = sira >= 0 && sira < gecilen;
      const art = i === 5 && t > 9.4;
      const nab = art ? 0.5 + 0.5 * Math.sin((t - 9.4) * 8) : 0;
      kopruCiz(ctx, T, b, { alfa: ara(t, 1.0 + i * 0.12, 1.5 + i * 0.12), renk: art ? 'mercan' : gecti ? 'turkuaz' : 'gumus', isik: art ? nab : gecti ? 0.4 : 0, parilti: gecti || art ? 0.6 : 0 });
    });
    if (t > 3.5) {
      const iz = yolKes(Y, sY).map(P);
      E.cizgi(ctx, iz, { renk: 'limon', kalinlik: 2.5, parilti: 0.7, alfa: 0.85 * ara(t, 3.5, 3.9) });
      const u = iz[iz.length - 1];
      E.nokta(ctx, u[0], u[1], 7, { renk: 'limon', parilti: 1.5 });
      if (t > 9.4) E.isik(ctx, u[0], u[1], 60, 'mercan', 0.5 * (0.5 + 0.5 * Math.sin(t * 6)));
    }
    if (t > 9.4) { const [x, y] = P(KOPRU[5].c); rozet(ctx, x + E.yd(34, 30), y - E.yd(30, 28), '?', { renk: 'mercan', boyut: 30, alfa: ara(t, 9.5, 9.9) }); }
    // başlık ve sayaç
    const ba = ara(t, 0.6, 1.4);
    const tx = H ? ic.x + 6 : L.cx, hz = H ? 'left' : 'center';
    const ty = H ? ic.y + 22 : ic.y + 24;
    E.yazi(ctx, 'KÖNIGSBERG · 1736', tx, ty, { boyut: E.yd(26, 26), agirlik: 700, harfAra: 6, renk: 'turkuaz', hiza: hz, alfa: ba });
    E.yazi(ctx, '4 kara parçası · 7 köprü', tx, ty + E.yd(40, 42), { boyut: E.yd(28, 30), agirlik: 560, renk: 'gumus', hiza: hz, alfa: ara(t, 1.8, 2.5) });
    const sa = ara(t, 3.4, 3.9);
    if (sa > 0) {
      const son = t > 9.4;
      const sx = H ? ic.x1 - 6 : L.cx, sy = H ? ic.y + 22 : T.y0 + 600 * T.k + 34, hz2 = H ? 'right' : 'center';
      E.yazi(ctx, 'GEÇİLEN KÖPRÜ', sx, sy, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'gumus', hiza: hz2, alfa: sa });
      E.yazi(ctx, `${gecilen} / 7`, sx, sy + 48, { boyut: 48, agirlik: 760, renk: son ? 'mercan' : 'tebesir', hiza: hz2, alfa: sa, parilti: son ? 0.4 : 0 });
    }
    const kar = 1 - ara(t, 0, 1.0, 'cik2');
    if (kar > 0) { ctx.fillStyle = E.rgba('gece', kar); ctx.fillRect(0, 0, E.W, E.H); }
  };

  /* ======================= 3. Haritadan çizgeye (sürpriz) ======================= */
  const donusum = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L, ic = L.icerik;
    const T = TR('donusum'), P = donustur(T);
    const bul = ara(t, 4.0, 6.6, 'io2');
    const harA = 1 - 0.7 * ara(t, 4.2, 6.6) - 0.3 * ara(t, 8.0, 9.5);
    haritaCiz(ctx, T, { alfa: harA, bulanik: 12 * bul, t, parilti: 1 - bul });
    // bölge ışıkları → düğümler
    const kuculme = ara(t, 4.6, 7.0, 'io3');
    const yerles = ara(t, 8.4, 10.2, 'io3');
    const G = cizgeGeometri(yerles);
    for (const k of 'ABCD') {
      const [x, y] = P(G.dug[k]);
      const r = lerp(170 * T.k, 0, kuculme);
      if (kuculme > 0 && kuculme < 1) E.isik(ctx, x, y, r * 1.6 + 30, RENK[k], 0.45 * Math.sin(kuculme * Math.PI));
      if (t < 4.6) { const [lx, ly] = P(BOLGE[k]); rozet(ctx, lx, ly, k, { renk: RENK[k], boyut: 26, alfa: 1 - ara(t, 4.0, 4.6) }); }
    }
    // köprüler: parlar, sonra ayrıta dönüşür
    const kp = ara(t, 3.0, 3.8);
    const buy = (i) => ara(t, 6.0 + i * 0.18, 7.6 + i * 0.18, 'io2');
    KOPRU.forEach((b, i) => kopruCiz(ctx, T, b, { renk: kp > 0 ? 'limon' : 'gumus', isik: kp * (1 - buy(i)), alfa: 1 - ara(t, 6.6 + i * 0.18, 7.4 + i * 0.18), parilti: kp }));
    const dA = ara(t, 6.6, 7.2);
    cizgeCiz(ctx, T, G, {
      ayrit: (i) => ({ ortadan: buy(i), alfa: buy(i) > 0 ? 1 : 0, renk: t > 11.6 ? (yurumeRenk(t, i)) : 'limon', parilti: 0.7 }),
      dugum: (k) => ({ alfa: dA, r: 20, isik: 1 - ara(t, 7.2, 8.4) }),
    });
    // terimler: düğüm ve ayrıt
    const tA = ara(t, 9.8, 10.4) * (1 - ara(t, 15.4, 16.0));
    if (tA > 0) {
      const [ax, ay] = P(G.dug.D);
      E.ok(ctx, ax + E.yd(80, 70), ay + E.yd(70, 70), ax + 26, ay + 18, { renk: 'tebesir', kalinlik: 2, alfa: tA, okBoy: 10 });
      E.yazi(ctx, 'düğüm', ax + E.yd(86, 74), ay + E.yd(84, 84), { boyut: E.yd(30, 28), agirlik: 700, renk: 'tebesir', hiza: 'left', alfa: tA });
      const [ex, ey] = P(ayritNokta(G, 5, 0.5));
      E.ok(ctx, ex + E.yd(60, 50), ey - E.yd(52, 46), ex + 6, ey - 6, { renk: 'limon', kalinlik: 2, alfa: tA, okBoy: 10 });
      E.yazi(ctx, 'ayrıt', ex + E.yd(66, 56), ey - E.yd(64, 58), { boyut: E.yd(30, 28), agirlik: 700, renk: 'limon', hiza: 'left', alfa: tA });
    }
    // yan sütun: neler önemli?
    const kol = H ? { x: 900, y: ic.y + 70, w: ic.x1 - 900 } : { x: ic.x, y: ic.y + 470, w: ic.w };
    const satirlar = [
      ['Köprünün uzunluğu', false, 0.8], ['Sokakların şekli', false, 1.4], ['Kara parçasının büyüklüğü', false, 2.0], ['Hangi kara, hangi köprüyle bağlı', true, 2.8],
    ];
    const sA = 1 - ara(t, 8.0, 8.6);
    const sat = E.yd(84, 62);
    E.yazi(ctx, 'ÖNEMLİ OLAN NE?', kol.x, kol.y, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'turkuaz', hiza: 'left', alfa: ara(t, 0.4, 1.0) * sA });
    satirlar.forEach(([m, evet, ts], i) => {
      const a = ara(t, ts, ts + 0.5) * sA;
      const y = kol.y + 52 + i * sat;
      E.yazi(ctx, evet ? '✓' : '✗', kol.x, y, { boyut: 30, agirlik: 700, renk: evet ? 'limon' : 'mercan', hiza: 'left', alfa: a });
      E.yazi(ctx, m, kol.x + 40, y, { boyut: E.yd(26, 28), agirlik: evet ? 700 : 520, renk: evet ? 'tebesir' : 'gumus', hiza: 'left', alfa: a, maxGen: kol.w - 40 });
    });
    // sonuç: 4 düğüm, 7 ayrıt
    const rA = ara(t, 11.0, 11.6);
    if (rA > 0) {
      const y = kol.y + E.yd(70, 30);
      E.yazi(ctx, 'ÇİZGE', kol.x, y, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'turkuaz', hiza: 'left', alfa: rA });
      E.yazi(ctx, '4 düğüm', kol.x, y + E.yd(56, 54), { boyut: E.yd(40, 40), agirlik: 760, hiza: 'left', alfa: rA });
      E.yazi(ctx, '7 ayrıt', kol.x + E.yd(0, 300), y + E.yd(112, 54), { boyut: E.yd(40, 40), agirlik: 760, renk: 'limon', hiza: 'left', alfa: ara(t, 11.3, 11.9) });
      E.yazi(ctx, 'Euler, 1736', kol.x, y + E.yd(180, 130), { boyut: 26, agirlik: 520, renk: 'gumus', hiza: 'left', alfa: ara(t, 12.0, 12.6) });
      const yk = ara(t, 12.2, 15.6, 'lin');
      if (yk > 0) {
        const n = Math.min(6, Math.floor(yk * 6.999));
        E.yazi(ctx, `Yürüyüş: ${n} / 7`, kol.x, y + E.yd(232, 180), { boyut: 28, agirlik: 700, renk: n >= 6 && yk > 0.95 ? 'mercan' : 'tebesir', hiza: 'left', alfa: ara(t, 12.2, 12.6) });
      }
    }
  };
  // Haritadaki başarısız yürüyüşün çizgede tekrarı
  const yurumeRenk = (t, i) => {
    const yk = ara(t, 12.2, 15.6, 'lin');
    const n = Math.min(6, Math.floor(yk * 6.999));
    const sira = YURU_K.indexOf(i);
    if (sira >= 0 && sira < n) return 'turkuaz';
    if (i === 5 && yk > 0.95) return 'mercan';
    return 'limon';
  };

  /* ======================= 4. Euler'in fikri: derece ======================= */
  const eulerSahne = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L, ic = L.icerik;
    const T = TR('euler'), P = donustur(T);
    const G = cizgeGeometri(1);
    // ışık noktası: C→D (ayrıt 6), D→B (ayrıt 5), sonra A→D (ayrıt 4) ve takılma
    const g1 = ara(t, 0.8, 2.0, 'io2'), g2 = ara(t, 2.0, 3.2, 'io2'), g3 = ara(t, 3.6, 4.8, 'io2');
    const dR = ara(t, 8.0, 8.6);
    cizgeCiz(ctx, T, G, {
      ayrit: (i) => {
        if (t > 8.0) return { renk: 'gumus', alfa: 0.9 };
        if (i === 6 && g1 > 0) return { renk: 'turkuaz', parilti: 0.8 };
        if (i === 5 && g2 > 0) return { renk: 'turkuaz', parilti: 0.8 };
        if (i === 4 && g3 > 0) return { renk: g3 >= 1 ? 'mercan' : 'limon', parilti: 0.8 };
        return { renk: 'gumus', alfa: 0.75 };
      },
      dugum: (k) => ({ r: 22, isik: k === 'D' ? 0.6 * (1 - dR) : 0 }),
    });
    const isik = (i, p, tersten) => { const [x, y] = P(ayritNokta(G, i, tersten ? 1 - p : p)); E.nokta(ctx, x, y, 7, { renk: 'limon', parilti: 1.5 }); };
    if (g1 > 0 && g1 < 1) isik(6, g1, false);        // C → D (ayrıt C–D: u=C, v=D)
    if (g2 > 0 && g2 < 1) isik(5, g2, true);         // D → B (ayrıt B–D: u=B, v=D)
    if (g3 > 0 && g3 < 1) isik(4, g3, false);        // A → D
    if (t > 4.8 && t < 8.0) { const [x, y] = P(G.dug.D); E.isik(ctx, x, y, 90, 'mercan', 0.4 * (0.6 + 0.4 * Math.sin(t * 7))); }
    // etiketler: gir / çık
    const [dx, dy] = P(G.dug.D);
    const eA = ara(t, 1.6, 2.1) * (1 - ara(t, 7.6, 8.1));
    const [gx, gy] = P(ayritNokta(G, 6, 0.75)), [cx, cy] = P(ayritNokta(G, 5, 0.75));
    rozet(ctx, gx + 30, gy + 26, 'gir', { renk: 'turkuaz', alfa: eA });
    rozet(ctx, cx + 30, cy - 26, 'çık', { renk: 'turkuaz', alfa: ara(t, 2.8, 3.2) * (1 - ara(t, 7.6, 8.1)) });
    rozet(ctx, dx, dy + E.yd(52, 50), 'takıldın', { renk: 'mercan', alfa: ara(t, 4.8, 5.3) * (1 - ara(t, 7.6, 8.1)) });
    // dereceler
    const derA = (k) => ara(t, 8.2 + 'ABCD'.indexOf(k) * 0.4, 8.7 + 'ABCD'.indexOf(k) * 0.4);
    const ofs = { A: [-58, -40], B: [-62, 0], C: [-62, 0], D: [0, -52] };
    for (const k of 'ABCD') {
      const [x, y] = P(G.dug[k]);
      rozet(ctx, x + ofs[k][0], y + ofs[k][1], String(DERECE[k]), { renk: 'mercan', kenar: 'mercan', alfa: derA(k), boyut: 28 });
    }
    // metin sütunu
    const kol = H ? { x: 720, y: ic.y + 70, w: ic.x1 - 720 } : { x: ic.x, y: ic.y + 420, w: ic.w };
    const st = E.yd(60, 56);
    const m = (txt, i, a, o = {}) => E.yazi(ctx, txt, kol.x, kol.y + i * st, Object.assign({ boyut: E.yd(30, 30), agirlik: 560, hiza: 'left', alfa: a, maxGen: kol.w }, o));
    const b1 = 1 - ara(t, 7.8, 8.3);
    m('Bir düğümden geçmek:', 0, ara(t, 0.6, 1.2) * b1, { renk: 'gumus' });
    m('bir ayrıtla gir, başkasıyla çık.', 1, ara(t, 2.2, 2.8) * b1, { agirlik: 700 });
    m('Ayrıtlar çift çift harcanır.', 2.2, ara(t, 3.4, 4.0) * b1, { renk: 'turkuaz', agirlik: 700 });
    m('Tek kalan ayrıt: yol biter.', 3.4, ara(t, 5.0, 5.6) * b1, { renk: 'mercan', agirlik: 700 });
    m('Başlangıç ve bitiş dışındaki', 4.6, ara(t, 6.0, 6.6) * b1, { renk: 'gumus' });
    m('her düğüm çift dereceli olmalı.', 5.4, ara(t, 6.0, 6.6) * b1, { agirlik: 700 });
    const b2 = ara(t, 8.2, 8.8);
    m('DERECE', 0, b2, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'turkuaz' });
    m('Bir düğüme değen ayrıt sayısı.', 0.8, b2, { agirlik: 640 });
    E.formul(ctx, '\\c{turkuaz}{A}: 5 \\quad \\c{mercan}{B}: 3 \\quad \\c{menekse}{C}: 3 \\quad \\c{gok}{D}: 3', kol.x, kol.y + st * 2.3, { boyut: E.yd(34, 34), hiza: 'left', alfa: ara(t, 9.6, 10.2) });
    m('Dördü de tek!', 3.6, ara(t, 10.6, 11.2), { renk: 'mercan', agirlik: 760, boyut: E.yd(36, 36), parilti: 0.3, parRenk: 'mercan' });
  };

  /* ======================= 5. Algoritma: sözde kod ======================= */
  const KOD = [
    'GİRDİ: çizge G',
    'sayaç ← 0',
    'her v düğümü için:',
    '    d ← derece(v)',
    '    d tek ise: sayaç ← sayaç + 1',
    'eğer sayaç = 0: "Döngü var"',
    'değilse sayaç = 2: "Yol var"',
    'değilse: "İmkânsız"',
  ];
  const DUG_AYR = { A: [0, 1, 2, 3, 4], B: [0, 1, 5], C: [2, 3, 6], D: [4, 5, 6] };
  const algoDurum = (t) => {
    // satır, düğüm, d, sayaç, ayrıt ışığı
    const dur = { satir: -1, v: null, d: 0, sayac: null, ayr: new Set() };
    if (t >= 6.6) dur.satir = 0;
    if (t >= 7.2) { dur.satir = 1; dur.sayac = 0; }
    'ABCD'.split('').forEach((k, i) => {
      const b = 7.8 + i * 1.3;
      if (t >= b) { dur.satir = 2; dur.v = k; dur.d = 0; }
      if (t >= b + 0.2) {
        dur.satir = 3;
        const n = Math.min(DERECE[k], Math.floor(((t - b - 0.2) / 0.6) * DERECE[k]) + 1);
        dur.d = n; dur.ayr = new Set(DUG_AYR[k].slice(0, n));
      }
      if (t >= b + 0.85) { dur.satir = 4; }
      if (t >= b + 1.0) { dur.sayac = i + 1; }
    });
    if (t >= 13.0) { dur.satir = 5; dur.v = null; dur.ayr = new Set(); }
    if (t >= 13.6) dur.satir = 6;
    if (t >= 14.2) dur.satir = 7;
    return dur;
  };
  const algoSahne = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L, ic = L.icerik;
    // Harizmi kartı
    const hA = ara(t, 0.2, 0.9);
    const hk = H ? { x: ic.x, y: ic.y + 6, w: 560, h: 116 } : { x: ic.x, y: ic.y + 2, w: ic.w, h: 84 };
    E.panel(ctx, hk.x, hk.y, hk.w, hk.h, { alfa: hA, vurgu: 'limon' });
    if (H) {
      E.yazi(ctx, 'algoritma', hk.x + 26, hk.y + 38, { boyut: 34, agirlik: 760, renk: 'limon', hiza: 'left', alfa: hA, font: 'mono' });
      E.yazi(ctx, '← Harizmi (el-Hârizmî), 9. yüzyıl', hk.x + 26, hk.y + 84, { boyut: 26, agirlik: 520, renk: 'gumus', hiza: 'left', alfa: ara(t, 0.8, 1.4) });
    } else {
      E.yazi(ctx, 'algoritma', hk.x + 24, hk.y + 30, { boyut: 30, agirlik: 760, renk: 'limon', hiza: 'left', alfa: hA, font: 'mono' });
      E.yazi(ctx, '← Harizmi, 9. yüzyıl', hk.x + 24, hk.y + 62, { boyut: 24, agirlik: 520, renk: 'gumus', hiza: 'left', alfa: ara(t, 0.8, 1.4) });
    }
    // çizge
    const T = TR('algo'), P = donustur(T), G = cizgeGeometri(1);
    const dur = algoDurum(t);
    const gA = ara(t, 2.6, 3.4);
    ctx.save(); ctx.globalAlpha *= gA;
    cizgeCiz(ctx, T, G, {
      ayrit: (i) => (dur.ayr.has(i) ? { renk: RENK[dur.v], parilti: 0.9, kalinlik: 4.5 } : { renk: 'gumus', alfa: 0.7, kalinlik: 3 }),
      dugum: (k) => ({ r: 18, isik: dur.v === k ? 0.9 : 0, renk: RENK[k] }),
    });
    // sayılan dereceler rozetleri
    const ofs = { A: [-50, -34], B: [-52, 0], C: [-52, 0], D: [0, -46] };
    'ABCD'.split('').forEach((k, i) => {
      const b = 7.8 + i * 1.3;
      if (t < b + 0.8) return;
      const [x, y] = P(G.dug[k]);
      rozet(ctx, x + ofs[k][0], y + ofs[k][1], String(DERECE[k]), { renk: 'mercan', kenar: 'mercan', alfa: ara(t, b + 0.8, b + 1.0), boyut: 24 });
    });
    ctx.restore();
    // izleme (değişkenler)
    const wA = ara(t, 7.2, 7.6);
    if (wA > 0) {
      const wx = H ? ic.x + 300 : L.cx, wy = H ? ic.y1 - 20 : T.y0 + 600 * T.k + 24;
      const v = dur.v || '–', d = dur.v ? String(dur.d) : '–';
      E.yazi(ctx, `v = ${v}   d = ${d}   sayaç = ${dur.sayac ?? 0}`, wx, wy, { boyut: 24, agirlik: 600, font: 'mono', renk: 'tebesir', alfa: wA });
    }
    // kod paneli
    const kp = H ? { x: 680, y: ic.y + 6, w: ic.x1 - 680, sat: 46, b: 24 } : { x: ic.x, y: ic.y + 460, w: ic.w, sat: 38, b: 23 };
    const pA = ara(t, 3.6, 4.2);
    const ph = 64 + KOD.length * kp.sat + 14;
    E.panel(ctx, kp.x, kp.y, kp.w, ph, { alfa: pA, vurgu: 'turkuaz', dolguAlfa: 0.85 });
    E.yazi(ctx, 'SÖZDE KOD', kp.x + 24, kp.y + 32, { boyut: 22, agirlik: 700, harfAra: 4, renk: 'turkuaz', hiza: 'left', alfa: pA, font: 'mono' });
    KOD.forEach((satir, i) => {
      const y = kp.y + 72 + i * kp.sat;
      const yaz = ara(t, 4.0 + i * 0.28, 4.4 + i * 0.28, 'lin');
      const aktif = dur.satir === i;
      if (aktif) {
        ctx.save(); ctx.globalAlpha *= pA;
        ctx.fillStyle = E.rgba(i === 7 && t >= 14.2 ? 'mercan' : 'limon', 0.14); ctx.fillRect(kp.x + 6, y - kp.sat / 2 + 2, kp.w - 12, kp.sat - 4);
        ctx.fillStyle = E.rgba(i === 7 && t >= 14.2 ? 'mercan' : 'limon', 0.9); ctx.fillRect(kp.x + 6, y - kp.sat / 2 + 2, 4, kp.sat - 4);
        ctx.restore();
      }
      E.yazi(ctx, String(i + 1), kp.x + 34, y, { boyut: 22, agirlik: 500, renk: 'sis', font: 'mono', alfa: pA * (yaz > 0 ? 1 : 0), hiza: 'right' });
      const renk = aktif ? (i === 7 && t >= 14.2 ? 'mercan' : 'limon') : i >= 5 ? 'gumus' : 'tebesir';
      E.yazi(ctx, satir, kp.x + 52, y, { boyut: kp.b, agirlik: aktif ? 700 : 500, font: 'mono', renk, hiza: 'left', yaz, alfa: pA });
      // karar sonuçları
      if (i === 5 || i === 6) {
        const ka = ara(t, i === 5 ? 13.2 : 13.8, i === 5 ? 13.5 : 14.1);
        E.yazi(ctx, '✗', kp.x + kp.w - 24, y, { boyut: 26, agirlik: 700, renk: 'mercan', hiza: 'right', alfa: ka });
      }
    });
    // damga: İMKÂNSIZ
    const dA = ara(t, 14.5, 14.9, 'cik5');
    if (dA > 0) {
      const [ax, ay] = P(G.dug.A);
      const cx = H ? ic.x + 280 : L.cx, cy = H ? ic.y + 380 : T.y0 + 300 * T.k;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.12); ctx.scale(lerp(1.6, 1, dA), lerp(1.6, 1, dA));
      E.panel(ctx, -170, -40, 340, 80, { r: 12, renk: 'gece', dolguAlfa: 0.85, kenar: 'mercan', kalinlik: 3, alfa: dA });
      E.yazi(ctx, 'İMKÂNSIZ', 0, 2, { boyut: 46, agirlik: 800, renk: 'mercan', harfAra: 6, alfa: dA, parilti: 0.5, parRenk: 'mercan' });
      ctx.restore();
    }
  };

  /* ======================= 6. Algoritma testi ======================= */
  // Zarf (ev): köşeler ve ayrıtlar
  const ZARF = { BL: [0, 1], BR: [1, 1], TL: [0, 0.42], TR: [1, 0.42], P: [0.5, 0] };
  const ZARF_YOL = ['BL', 'BR', 'TL', 'BL', 'TR', 'TL', 'P', 'TR', 'BR'];
  const ZARF_DER = { BL: 3, BR: 3, TL: 4, TR: 4, P: 2 };
  const PAP = { L1: [0, 0.1], L2: [0, 0.9], M: [0.5, 0.5], R1: [1, 0.1], R2: [1, 0.9] };
  const PAP_YOL = ['M', 'L1', 'L2', 'M', 'R1', 'R2', 'M'];
  const PAP_DER = { L1: 2, L2: 2, M: 4, R1: 2, R2: 2 };
  const kenarlar = (yol) => yol.slice(1).map((k, i) => [yol[i], k]);
  const sekilCiz = (ctx, nok, yol, der, x, y, w, h, o = {}) => {
    const p = (k) => [x + nok[k][0] * w, y + nok[k][1] * h];
    const kn = kenarlar(yol);
    const pi = o.p ?? 0; // izlenen kenar sayısı (kesirli)
    kn.forEach(([a, b], i) => E.cizgi(ctx, [p(a), p(b)], { renk: 'cizgi', kalinlik: o.ince ? 2 : 3, alfa: o.alfa ?? 1 }));
    kn.forEach(([a, b], i) => { const q = clamp(pi - i); if (q > 0) E.cizgi(ctx, [p(a), p(b)], { renk: o.izRenk || 'turkuaz', kalinlik: o.ince ? 2.5 : 4.5, parilti: 0.8, p: q, alfa: o.alfa ?? 1 }); });
    for (const k in nok) {
      const tek = der[k] % 2 === 1;
      E.nokta(ctx, ...p(k), o.ince ? 4 : 8, { renk: tek ? 'mercan' : 'gumus', parilti: tek ? 0.8 : 0.2, alfa: o.alfa ?? 1 });
      if (o.derece) rozet(ctx, p(k)[0] + (nok[k][0] < 0.5 ? -36 : nok[k][0] > 0.5 ? 36 : 0), p(k)[1] + (nok[k][1] < 0.05 ? -32 : 0) + (nok[k][0] === 0.5 && nok[k][1] > 0.05 ? -36 : 0), String(der[k]), { renk: tek ? 'mercan' : 'gumus', alfa: (o.alfa ?? 1) * o.derece, boyut: 22 });
    }
    if (pi > 0 && pi < kn.length) {
      const i = Math.floor(pi), q = pi - i, [a, b] = kn[i];
      E.nokta(ctx, lerp(p(a)[0], p(b)[0], q), lerp(p(a)[1], p(b)[1], q), o.ince ? 4 : 8, { renk: 'limon', parilti: 1.5 });
    }
    return p;
  };
  const testSahne = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L, ic = L.icerik;
    // tablo
    const tb = H ? { x: ic.x, y: ic.y + 20, w: 560, sat: 128, ikon: 92 } : { x: ic.x, y: ic.y + 6, w: ic.w, sat: 108, ikon: 80 };
    const sut = H ? [tb.x + 70, tb.x + 260, tb.x + 440] : [tb.x + 70, tb.x + 290, tb.x + 500];
    const ba = ara(t, 0.2, 0.8);
    E.yazi(ctx, 'GİRDİ', sut[0], tb.y + 18, { boyut: 22, agirlik: 700, harfAra: 3, renk: 'turkuaz', alfa: ba });
    E.yazi(ctx, 'TEK DÜĞÜM', sut[1], tb.y + 18, { boyut: 22, agirlik: 700, harfAra: 3, renk: 'turkuaz', alfa: ba });
    E.yazi(ctx, 'ÇIKTI', sut[2], tb.y + 18, { boyut: 22, agirlik: 700, harfAra: 3, renk: 'turkuaz', alfa: ba });
    E.cizgi(ctx, [[tb.x, tb.y + 40], [tb.x + tb.w, tb.y + 40]], { renk: 'sis', kalinlik: 1.5, alfa: ba });
    const satirlar = [
      { ad: 'Königsberg', tek: '4', cikti: 'İmkânsız', renk: 'mercan', ts: 0.6, ok: 1.4 },
      { ad: 'Zarf', tek: '2', cikti: 'Yol var', renk: 'turkuaz', ts: 1.6, ok: 9.4 },
      { ad: 'Papyon', tek: '0', cikti: 'Döngü var', renk: 'limon', ts: 2.6, ok: 13.4 },
    ];
    satirlar.forEach((r, i) => {
      const y = tb.y + 40 + tb.sat * (i + 0.5);
      const a = ara(t, r.ts, r.ts + 0.6);
      const ix = sut[0] - tb.ikon / 2, iy = y - tb.ikon / 2 + 2;
      if (i === 0) {
        ctx.save(); ctx.globalAlpha *= a;
        cizgeCiz(ctx, { k: tb.ikon / 600, x0: sut[0] - (tb.ikon / 600) * 600, y0: iy - 4 }, cizgeGeometri(1), { ayrit: () => ({ renk: 'gumus', kalinlik: 1.6, parilti: 0 }), dugum: (k) => ({ r: 4 }) });
        ctx.restore();
      } else if (i === 1) sekilCiz(ctx, ZARF, ZARF_YOL, ZARF_DER, ix + 10, iy + 4, tb.ikon - 20, tb.ikon - 14, { ince: true, alfa: a });
      else sekilCiz(ctx, PAP, PAP_YOL, PAP_DER, ix + 4, iy + 6, tb.ikon - 8, tb.ikon - 16, { ince: true, alfa: a });
      E.yazi(ctx, r.ad, sut[0], y + tb.ikon / 2 + 10, { boyut: 22, agirlik: 560, renk: 'gumus', alfa: a });
      E.yazi(ctx, r.tek, sut[1], y, { boyut: 40, agirlik: 760, renk: r.renk, alfa: ara(t, r.ts + 0.3, r.ts + 0.8), font: 'mono' });
      E.yazi(ctx, r.cikti, sut[2], y, { boyut: E.yd(28, 28), agirlik: 700, renk: r.renk, alfa: ara(t, r.ts + 0.6, r.ts + 1.1) });
      const oa = ara(t, r.ok, r.ok + 0.4);
      E.yazi(ctx, '✓', sut[2] + E.yd(96, 100), y, { boyut: 30, agirlik: 700, renk: 'limon', alfa: oa, parilti: 0.5, parRenk: 'limon' });
      if (i < 2) E.cizgi(ctx, [[tb.x, y + tb.sat / 2], [tb.x + tb.w, y + tb.sat / 2]], { renk: 'sis', kalinlik: 1, alfa: a * 0.7 });
    });
    // çizim alanı
    const ca = H ? { cx: 960, cy: ic.y + 290, w: 330, h: 340 } : { cx: L.cx, cy: ic.y + 600, w: 300, h: 300 };
    const zA = ara(t, 4.0, 4.6) * (1 - ara(t, 9.6, 10.0));
    if (zA > 0) {
      const p = ara(t, 5.0, 9.2, 'lin') * 8;
      ctx.save(); ctx.globalAlpha *= zA;
      const pp = sekilCiz(ctx, ZARF, ZARF_YOL, ZARF_DER, ca.cx - ca.w / 2, ca.cy - ca.h / 2, ca.w, ca.h, { p, derece: ara(t, 4.2, 4.8) });
      rozet(ctx, pp('BL')[0], pp('BL')[1] + 40, 'başla', { renk: 'limon', alfa: ara(t, 4.6, 5.0) });
      rozet(ctx, pp('BR')[0], pp('BR')[1] + 40, 'bitir', { renk: 'limon', alfa: ara(t, 9.0, 9.3) });
      ctx.restore();
    }
    const pA = ara(t, 9.8, 10.3);
    if (pA > 0) {
      const p = ara(t, 10.4, 13.2, 'lin') * 6;
      ctx.save(); ctx.globalAlpha *= pA;
      const pp = sekilCiz(ctx, PAP, PAP_YOL, PAP_DER, ca.cx - ca.w / 2, ca.cy - ca.h * 0.4, ca.w, ca.h * 0.8, { p, derece: ara(t, 10.0, 10.5), izRenk: 'limon' });
      rozet(ctx, pp('M')[0], pp('M')[1] + 44, p >= 5.99 ? 'başa döndün' : 'başla', { renk: 'limon', alfa: ara(t, 10.2, 10.6) });
      ctx.restore();
    }
  };

  /* ======================= 7. Çöp kamyonu ======================= */
  const KAV = { TL: [0, 0], TM: [1, 0], TR: [2, 0], BL: [0, 1], BM: [1, 1], BR: [2, 1] };
  const KAV_DER = { TL: 2, TM: 3, TR: 2, BL: 2, BM: 3, BR: 2 };
  const SOKAK_YOL = ['TM', 'TL', 'BL', 'BM', 'TM', 'TR', 'BR', 'BM'];
  const kamyonSahne = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L, ic = L.icerik;
    const g = H ? { x0: ic.x + 150, y0: ic.y + 70, dx: 420, dy: 380 } : { x0: ic.x + 50, y0: ic.y + 120, dx: 270, dy: 560 };
    const p = (k) => [g.x0 + KAV[k][0] * g.dx, g.y0 + KAV[k][1] * g.dy];
    const a0 = ara(t, 0.0, 0.8);
    // bloklar ve binalar
    const r = E.rng(77);
    ctx.save(); ctx.globalAlpha *= a0;
    for (let bx = 0; bx < 2; bx++) {
      const x = g.x0 + bx * g.dx + 26, y = g.y0 + 26, w = g.dx - 52, h = g.dy - 52;
      ctx.fillStyle = E.karistir('lacivert', 'derin', 0.5, 0.9); ctx.fillRect(x, y, w, h);
      for (let i = 0; i < 46; i++) {
        const bw = 18 + r() * 40, bh = 18 + r() * 40, xx = x + 8 + r() * (w - bw - 16), yy = y + 8 + r() * (h - bh - 16);
        ctx.fillStyle = E.karistir('derin', 'gumus', 0.1 + r() * 0.16); ctx.fillRect(xx, yy, bw, bh);
        if (r() < 0.3) { ctx.fillStyle = E.rgba('limon', 0.5); ctx.fillRect(xx + bw * r(), yy + bh * r(), 2.5, 2.5); }
      }
    }
    ctx.restore();
    // sokaklar
    const sokaklar = [['TL', 'TM'], ['TM', 'TR'], ['BL', 'BM'], ['BM', 'BR'], ['TL', 'BL'], ['TM', 'BM'], ['TR', 'BR']];
    for (const [a, b] of sokaklar) {
      E.cizgi(ctx, [p(a), p(b)], { renk: E.karistir('gece', 'sis', 0.6), kalinlik: 30, alfa: a0, uc: 'square' });
      E.cizgi(ctx, [p(a), p(b)], { renk: 'cizgi', kalinlik: 2, kesik: [10, 12], alfa: a0 * 0.8 });
    }
    // geçiş izi
    const kn = kenarlar(SOKAK_YOL);
    const pi = ara(t, 2.6, 9.0, 'lin') * kn.length;
    kn.forEach(([a, b], i) => { const q = clamp(pi - i); if (q > 0) E.cizgi(ctx, [p(a), p(b)], { renk: 'turkuaz', kalinlik: 8, parilti: 0.9, p: q, alfa: 0.9 }); });
    // kavşaklar ve dereceler
    for (const k in KAV) {
      const tek = KAV_DER[k] % 2 === 1;
      const [x, y] = p(k);
      E.nokta(ctx, x, y, 9, { renk: tek ? 'mercan' : 'gumus', parilti: tek ? 1 : 0.2, alfa: a0 });
      const dA = ara(t, 1.0, 1.6);
      const dx = KAV[k][0] === 2 ? -38 : 38, dy = KAV[k][1] === 0 ? -34 : 34;
      rozet(ctx, x + dx, y + dy, String(KAV_DER[k]), { renk: tek ? 'mercan' : 'gumus', kenar: tek ? 'mercan' : null, alfa: dA, boyut: 24 });
    }
    // kamyon
    if (pi > 0) {
      const i = Math.min(kn.length - 1, Math.floor(pi)), q = pi >= kn.length ? 1 : pi - i, [a, b] = kn[i];
      const [ax, ay] = p(a), [bx, by] = p(b);
      const x = lerp(ax, bx, q), y = lerp(ay, by, q), ang = Math.atan2(by - ay, bx - ax);
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      E.isik(ctx, 30, 0, 50, 'limon', 0.5);
      ctx.fillStyle = E.P.turkuaz; E.yuvarlakDik(ctx, -20, -10, 30, 20, 4); ctx.fill();
      ctx.fillStyle = E.P.tebesir; E.yuvarlakDik(ctx, 10, -9, 12, 18, 3); ctx.fill();
      ctx.restore();
    }
    // metinler
    const kol = H ? { x: L.cx, y: ic.y1 - 30 } : { x: L.cx, y: ic.y + 30 };
    E.yazi(ctx, H ? 'Her sokaktan bir kez: 2 tek kavşak → yol var' : 'Her sokaktan bir kez', kol.x, H ? ic.y + 18 : kol.y, { boyut: E.yd(30, 30), agirlik: 700, alfa: ara(t, 0.4, 1.0), maxGen: ic.w });
    if (!H) E.yazi(ctx, '2 tek kavşak → yol var', L.cx, ic.y + 72, { boyut: 28, agirlik: 600, renk: 'gumus', alfa: ara(t, 1.2, 1.8) });
    const sA = ara(t, 9.0, 9.6);
    E.yazi(ctx, '7 sokak · 0 tekrar', kol.x, H ? ic.y1 - 14 : ic.y1 - 30, { boyut: E.yd(34, 34), agirlik: 760, renk: 'limon', alfa: sA, parilti: 0.4, parRenk: 'limon' });
    const [sx, sy] = p('TM'), [ex, ey] = p('BM');
    rozet(ctx, sx, sy - E.yd(40, 40), 'başla', { renk: 'limon', alfa: ara(t, 2.2, 2.6) });
    rozet(ctx, ex, ey + E.yd(40, 40), 'bitir', { renk: 'limon', alfa: ara(t, 8.8, 9.2) });
  };

  /* ======================= 8. İkili arama ======================= */
  const GIZLI = 737;
  const ADIMLAR = (() => {
    const a = [];
    let lo = 1, hi = 1000;
    while (lo < hi) {
      const m = Math.floor((lo + hi) / 2);
      const evet = GIZLI > m;
      a.push({ lo, hi, m, evet });
      if (evet) lo = m + 1; else hi = m;
    }
    a.push({ lo, hi, m: lo, bulundu: true });
    return a; // 10 soru + bulundu
  })();
  const ikiliSahne = (ctx, s) => {
    const t = s.t, H = E.yatay, L = E.L, ic = L.icerik;
    const x0 = ic.x + E.yd(30, 20), x1 = ic.x1 - E.yd(30, 20);
    const y1 = ic.y + E.yd(70, 80), y2 = ic.y + E.yd(200, 210);
    const a0 = ara(t, 0.2, 0.8);
    // naif strateji: tek tek
    const nA = ara(t, 1.4, 1.8) * (1 - ara(t, 4.0, 4.4));
    const nS = Math.floor(lerp(1, GIZLI, Math.pow(ara(t, 1.6, 3.8, 'lin'), 2.2)));
    // ikili arama adımları
    const adimT = (i) => 4.4 + i * 0.7;
    let k = -1; for (let i = 0; i < ADIMLAR.length; i++) if (t >= adimT(i)) k = i;
    const lo = k < 0 ? 1 : ADIMLAR[Math.min(k, ADIMLAR.length - 1)].lo, hi = k < 0 ? 1000 : ADIMLAR[Math.min(k, ADIMLAR.length - 1)].hi;
    const nxt = ADIMLAR[Math.min(k + 1, ADIMLAR.length - 1)];
    const q = k >= 0 && k < ADIMLAR.length - 1 ? ara(t, adimT(k) + 0.25, adimT(k) + 0.6) : 0;
    const clo = lerp(lo, nxt.lo, q), chi = lerp(hi, nxt.hi, q);
    // ana sayı doğrusu
    const D = E.sayiDogrusu({ x: x0, y: y1, w: x1 - x0, min: 0, max: 1000 });
    D.ciz(ctx, { adim: 100, etiketAdim: 500, boyut: 22, alfa: a0, etiketFn: (v) => (v === 0 ? '1' : String(v)) });
    if (nA > 0) {
      E.nokta(ctx, D.px(nS), y1, 7, { renk: 'mercan', parilti: 1, alfa: nA });
      E.yazi(ctx, `Tek tek: ${nS}. soru`, D.px(Math.min(nS, 820)), y1 - 40, { boyut: 26, agirlik: 700, renk: 'mercan', alfa: nA, font: 'mono' });
    }
    if (k >= 0) D.aralik(ctx, clo - 0.5, chi + 0.5, { renk: 'turkuaz', kalinlik: 10, uc: false, alfa: ara(t, 4.4, 4.8) });
    // yakın plan doğrusu: geçerli aralık
    const zA = ara(t, 4.6, 5.0);
    if (zA > 0) {
      const Z = E.sayiDogrusu({ x: x0, y: y2, w: x1 - x0, min: clo - 0.5, max: chi + 0.5 });
      E.cizgi(ctx, [[D.px(clo - 0.5), y1 + 10], [x0, y2 - 14]], { renk: 'turkuaz', kalinlik: 1, kesik: [4, 6], alfa: zA * 0.6 });
      E.cizgi(ctx, [[D.px(chi + 0.5), y1 + 10], [x1, y2 - 14]], { renk: 'turkuaz', kalinlik: 1, kesik: [4, 6], alfa: zA * 0.6 });
      E.cizgi(ctx, [[x0, y2], [x1, y2]], { renk: 'turkuaz', kalinlik: 8, parilti: 0.8, alfa: zA, uc: 'butt' });
      E.yazi(ctx, String(lo), x0, y2 + 34, { boyut: 26, agirlik: 700, font: 'mono', hiza: 'left', alfa: zA * (1 - q) });
      E.yazi(ctx, String(hi), x1, y2 + 34, { boyut: 26, agirlik: 700, font: 'mono', hiza: 'right', alfa: zA * (1 - q) });
      if (k >= 0 && k < ADIMLAR.length - 1) {
        const m = ADIMLAR[k].m;
        const xm = Z.px(m + 0.5);
        E.cizgi(ctx, [[xm, y2 - 22], [xm, y2 + 22]], { renk: 'limon', kalinlik: 3, alfa: zA * (1 - q) });
      }
      if (k === ADIMLAR.length - 1) {
        E.isik(ctx, L.cx, y2, 200, 'limon', 0.5 * E.nabiz(t, adimT(k), 1.2));
        E.yazi(ctx, String(GIZLI), L.cx, y2 - 44, { boyut: 48, agirlik: 800, renk: 'limon', font: 'mono', parilti: 0.5, parRenk: 'limon' });
      }
    }
    // soru listesi
    const ls = H ? { x: ic.x + 40, y: ic.y + 290, sx: 330, sy: 46, kolon: 5 } : { x: ic.x + 10, y: ic.y + 300, sx: 320, sy: 44, kolon: 5 };
    ADIMLAR.slice(0, 10).forEach((a, i) => {
      const al = ara(t, adimT(i), adimT(i) + 0.3);
      if (al <= 0) return;
      const c = Math.floor(i / ls.kolon), r = i % ls.kolon;
      const x = ls.x + c * ls.sx, y = ls.y + r * ls.sy;
      E.yazi(ctx, `${String(i + 1).padStart(2, ' ')}. > ${String(a.m).padEnd(3, ' ')} ?`, x, y, { boyut: E.yd(24, 23), agirlik: 500, font: 'mono', hiza: 'left', alfa: al, renk: 'gumus' });
      E.yazi(ctx, a.evet ? 'evet' : 'hayır', x + E.yd(210, 200), y, { boyut: E.yd(24, 23), agirlik: 700, font: 'mono', hiza: 'left', alfa: al, renk: a.evet ? 'turkuaz' : 'mercan' });
    });
    // karşılaştırma ve 2^10
    const sA = ara(t, 12.0, 12.6);
    const fx = H ? ic.x1 - 230 : L.cx, fy = H ? ic.y + 340 : ic.y + 570;
    if (sA > 0) {
      E.formul(ctx, '\\kutu{limon}{2^{10} = 1024 \\ge 1000}', fx, fy, { boyut: E.yd(40, 40), alfa: sA, parilti: 0.3, parRenk: 'limon' });
      E.yazi(ctx, 'Tek tek: 737 soru', fx, fy + E.yd(80, 76), { boyut: 28, agirlik: 560, renk: 'mercan', alfa: ara(t, 12.4, 12.9) });
      E.yazi(ctx, 'İkiye bölerek: 10 soru', fx, fy + E.yd(124, 118), { boyut: 28, agirlik: 700, renk: 'turkuaz', alfa: ara(t, 12.8, 13.3) });
    }
    const baslik = ara(t, 0.2, 0.8) * (1 - ara(t, 4.0, 4.4));
    E.yazi(ctx, 'Aklımdan 1 ile 1000 arasında bir sayı tuttum.', L.cx, ic.y + E.yd(250, 270), { boyut: E.yd(32, 30), agirlik: 640, alfa: baslik, maxGen: ic.w - 20 });
  };

  /* ======================= Özet ve bitiş ======================= */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'Önce temsil et: harita → çizge.' },
    { tr: 'Derece: düğüme değen ayrıt sayısı.', formul: 'A: 5,\\; B: 3,\\; C: 3,\\; D: 3' },
    { tr: 'Tek dereceli düğümleri say.', formul: '0 \\Rightarrow \\t{döngü}, \\; 2 \\Rightarrow \\t{yol}' },
    { tr: 'Algoritmayı adım adım yaz, testle kontrol et.' },
  ], { aralik: 1.6 });

  /* ======================= Film ======================= */
  E.film({
    meta,
    sure: 116.5,
    sahneler: [
      { ad: 'Soğuk açılış: Königsberg, 1736', bas: 0, son: 11.2, giris: 0, cikis: 0.7, ciz: acilis },
      { ad: 'İmza', bas: 10.9, son: 14.6, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 14.3, son: 18.6, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'Sürpriz: haritadan çizgeye', bas: 18.3, son: 34.5, giris: 0.5, ciz: donusum },
      { ad: 'Euler’in fikri: derece', bas: 34.2, son: 46.5, ciz: eulerSahne },
      { ad: 'Algoritma: sözde kod', bas: 46.2, son: 62.5, ciz: algoSahne },
      { ad: 'Algoritma testi: zarf ve papyon', bas: 62.2, son: 76.5, ciz: testSahne },
      { ad: 'Gerçek hayat: çöp kamyonu', bas: 76.2, son: 86.5, ciz: kamyonSahne },
      { ad: 'Algoritma = strateji: ikili arama', bas: 86.2, son: 100.5, ciz: ikiliSahne },
      { ad: 'Aklında kalsın', bas: 100.2, son: 110.5, ciz: ozet },
      { ad: 'Laboratuvar', bas: 110.3, son: 116.5, cikis: 0.8, ciz: (c, s) => E.bitisKarti(c, s, meta) },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 5 }),
  });
})();
