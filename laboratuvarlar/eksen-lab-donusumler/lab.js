/* Eksen · Dönüşüm ve Benzerlik Laboratuvarı — 4. Tema: Eşlik ve Benzerlik
   Deneyler: Dönüşüm atölyesi · İki ayna · Benzer üçgenler */
(function () {
  'use strict';
  const E = window.E, Lab = window.Lab, T = window.EKSEN_TEMA;
  const { clamp, lerp } = E;
  const p = (h) => Lab.el('p', { html: h });
  const s1 = (v) => E.sayiYaz(v, 1), s2 = (v) => E.sayiYaz(v, 2);
  // Asimetrik motif (yön değişimi görünsün diye "bayrak/çizme" biçimi), birim koordinatlar
  const MOTIF = [[0, 0], [0, 3], [2, 3], [2, 2.3], [0.8, 2.3], [0.8, 1.6], [1.6, 1.6], [1.6, 0.9], [0.8, 0.9], [0.8, 0]];
  const yansit = (P, A, B) => { const dx = B[0] - A[0], dy = B[1] - A[1], l2 = dx * dx + dy * dy; const t = ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / l2; const H = [A[0] + t * dx, A[1] + t * dy]; return [2 * H[0] - P[0], 2 * H[1] - P[1]]; };
  const dondur = (P, M, a) => { const c = Math.cos(a), s = Math.sin(a), x = P[0] - M[0], y = P[1] - M[1]; return [M[0] + c * x - s * y, M[1] + s * x + c * y]; };
  const yonlu = (pts) => { let s = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s += a[0] * b[1] - b[0] * a[1]; } return s; };
  const cevre = (pts) => pts.reduce((t, a, i) => t + Math.hypot(pts[(i + 1) % pts.length][0] - a[0], pts[(i + 1) % pts.length][1] - a[1]), 0);
  const motifCiz = (ctx, pts, renk, alfa = 1) => { E.cokgen(ctx, pts, { renk, alfa: 0.22 * alfa, kenar: true, kenarAlfa: alfa, kalinlik: 3, parilti: 0.6 }); E.nokta(ctx, pts[2][0], pts[2][1], 5, { renk: 'limon', alfa }); };

  /* ---------- 1. Dönüşüm atölyesi ---------- */
  const atolye = {
    id: 'atolye', ad: 'Dönüşüm atölyesi',
    ipucu: 'Sarı nokta köşe sırasını (yönü) gösterir. Yansımada saat yönü tersine döner; öteleme ve dönmede korunur.',
    kur(api) {
      const d = { tur: 'yansima', A: [0.55, 0.15], B: [0.62, 0.85], V: [0.25, -0.12], M: [0.55, 0.5], aci: 90, motif: [0.2, 0.55] };
      const gos = Lab.gosterge([['es', 'Eş mi?'], ['yon', 'Yön (saat yönü)'], ['cevre', 'Çevre (şekil / görüntü)'], ['alan', 'Alan (şekil / görüntü)']]);
      let surukle = null;
      const geo = (W, H) => {
        const u = Math.min(W, H) / 9;
        const o = [d.motif[0] * W, d.motif[1] * H];
        const sekil = MOTIF.map(([x, y]) => [o[0] + x * u, o[1] - y * u]);
        const A = [d.A[0] * W, d.A[1] * H], B = [d.B[0] * W, d.B[1] * H], M = [d.M[0] * W, d.M[1] * H];
        const V = [d.V[0] * W, d.V[1] * H];
        let gor;
        if (d.tur === 'yansima') gor = sekil.map((P) => yansit(P, A, B));
        else if (d.tur === 'oteleme') gor = sekil.map((P) => [P[0] + V[0], P[1] + V[1]]);
        else gor = sekil.map((P) => dondur(P, M, (-d.aci * Math.PI) / 180));
        return { sekil, gor, A, B, M, V, o, u };
      };
      const tutamak = (W, H) => {
        const g = geo(W, H);
        const L = [['motif', g.o]];
        if (d.tur === 'yansima') L.push(['A', g.A], ['B', g.B]);
        if (d.tur === 'oteleme') L.push(['V', [g.sekil[0][0] + g.V[0], g.sekil[0][1] + g.V[1]]]);
        if (d.tur === 'donme') L.push(['M', g.M]);
        return L;
      };
      const kAci = Lab.kaydirici({ ad: 'α', min: -180, max: 180, adim: 5, deger: d.aci, bicim: (v) => v + '°', degisti: (v) => { d.aci = v; api.ciz(); } });
      const aciKart = Lab.kart('Dönme açısı (saat yönünün tersi +)', [kAci]); aciKart.style.display = 'none';
      return {
        panel: [
          Lab.kart('Dönüşüm', [Lab.segment({ secenekler: [['yansima', 'Yansıma'], ['oteleme', 'Öteleme'], ['donme', 'Dönme']], deger: d.tur, degisti: (v) => { d.tur = v; aciKart.style.display = v === 'donme' ? '' : 'none'; api.ciz(); } })]),
          aciKart, Lab.kart('Ne değişti, ne değişmedi?', [gos]),
          Lab.kart('Sürükle', [p('Motifi (sol alt köşesinden), ayna doğrusunun iki ucunu, öteleme okunun ucunu ya da dönme merkezini sürükle.')]),
        ],
        basildi(x, y) { const L = tutamak(api.W, api.H); const i = Lab.enYakin(L.map((l) => l[1]), x, y, 30); if (i < 0) return false; surukle = L[i][0]; },
        suruklendi(x, y) {
          const W = api.W, H = api.H, n = [clamp(x / W, 0.03, 0.97), clamp(y / H, 0.03, 0.97)];
          if (surukle === 'motif') d.motif = n; else if (surukle === 'V') { const g = geo(W, H); d.V = [(x - g.sekil[0][0]) / W, (y - g.sekil[0][1]) / H]; } else d[surukle] = n;
        },
        birakildi() { surukle = null; },
        uzerinde(x, y) { return Lab.enYakin(tutamak(api.W, api.H).map((l) => l[1]), x, y, 30) >= 0; },
        ciz(ctx, W, H) {
          const g = geo(W, H);
          if (d.tur === 'yansima') {
            const dx = g.B[0] - g.A[0], dy = g.B[1] - g.A[1], l = Math.hypot(dx, dy), L = W + H;
            E.cizgi(ctx, [[g.A[0] - (dx / l) * L, g.A[1] - (dy / l) * L], [g.A[0] + (dx / l) * L, g.A[1] + (dy / l) * L]], { renk: 'gok', kalinlik: 3, parilti: 1 });
            [g.A, g.B].forEach((P) => E.nokta(ctx, P[0], P[1], 9, { renk: 'gok' }));
            for (const i of [0, 2, 6]) E.cizgi(ctx, [g.sekil[i], g.gor[i]], { renk: 'gumus', kalinlik: 1.5, kesik: [4, 6], alfa: 0.7 });
          } else if (d.tur === 'oteleme') {
            for (const i of [0, 2, 6]) E.ok(ctx, g.sekil[i][0], g.sekil[i][1], g.gor[i][0], g.gor[i][1], { renk: i === 0 ? 'gok' : 'gumus', kalinlik: i === 0 ? 3 : 1.5, alfa: i === 0 ? 1 : 0.6 });
            E.nokta(ctx, g.gor[0][0], g.gor[0][1], 9, { renk: 'gok' });
          } else {
            E.nokta(ctx, g.M[0], g.M[1], 9, { renk: 'gok' });
            const r = Math.hypot(g.sekil[2][0] - g.M[0], g.sekil[2][1] - g.M[1]);
            const a0 = Math.atan2(g.sekil[2][1] - g.M[1], g.sekil[2][0] - g.M[0]);
            E.aciYayi(ctx, g.M[0], g.M[1], r, a0, a0 - (d.aci * Math.PI) / 180, { renk: 'gok', dolgu: 0.06, kalinlik: 2 });
            E.cizgi(ctx, [g.M, g.sekil[2]], { renk: 'gumus', kalinlik: 1.5, kesik: [4, 5] });
            E.cizgi(ctx, [g.M, g.gor[2]], { renk: 'gumus', kalinlik: 1.5, kesik: [4, 5] });
          }
          motifCiz(ctx, g.sekil, 'turkuaz');
          motifCiz(ctx, g.gor, 'mercan');
          E.nokta(ctx, g.o[0], g.o[1], 8, { renk: 'tebesir' });
          const y1 = yonlu(g.sekil), y2 = yonlu(g.gor);
          gos.yaz('es', 'evet ✓');
          gos.yaz('yon', Math.sign(y1) === Math.sign(y2) ? 'korundu' : 'ters döndü');
          gos.yaz('cevre', `${s1(cevre(g.sekil) / g.u)} / ${s1(cevre(g.gor) / g.u)}`);
          gos.yaz('alan', `${s1(Math.abs(y1) / 2 / g.u / g.u)} / ${s1(Math.abs(y2) / 2 / g.u / g.u)}`);
        },
      };
    },
  };

  /* ---------- 2. İki ayna ---------- */
  const ikiAyna = {
    id: 'ayna', ad: 'İki ayna',
    ipucu: 'Paralel iki ayna = öteleme (aradaki uzaklığın 2 katı). Kesişen iki ayna = dönme (aradaki açının 2 katı). Kaleydoskopu aç!',
    kur(api) {
      const d = { mod: 'kesisen', uzak: 0.16, aci: 40, kaleydo: false };
      const bilgi = p('');
      const kU = Lab.kaydirici({ ad: 'd', min: 0.05, max: 0.3, adim: 0.01, deger: d.uzak, bicim: (v) => Math.round(v * 100) + ' br', degisti: (v) => { d.uzak = v; api.ciz(); } });
      const kA = Lab.kaydirici({ ad: 'θ', min: 10, max: 90, adim: 5, deger: d.aci, bicim: (v) => v + '°', degisti: (v) => { d.aci = v; api.ciz(); } });
      const uK = Lab.kart('Aynalar arası uzaklık', [kU]), aK = Lab.kart('Aynalar arası açı', [kA, Lab.segment({ secenekler: [[false, 'İki yansıma'], [true, 'Kaleydoskop']], deger: false, degisti: (v) => { d.kaleydo = v; api.ciz(); } })]);
      uK.style.display = 'none';
      return {
        panel: [Lab.kart('Aynalar', [Lab.segment({ secenekler: [['paralel', 'Paralel'], ['kesisen', 'Kesişen']], deger: d.mod, degisti: (v) => { d.mod = v; uK.style.display = v === 'paralel' ? '' : 'none'; aK.style.display = v === 'kesisen' ? '' : 'none'; api.ciz(); } })]), uK, aK, Lab.kart('Sonuç', [bilgi])],
        ciz(ctx, W, H) {
          const u = Math.min(W, H) / 10;
          if (d.mod === 'paralel') {
            const x1 = W * 0.42, x2 = x1 + d.uzak * W;
            for (const x of [x1, x2]) E.cizgi(ctx, [[x, 10], [x, H - 10]], { renk: 'gok', kalinlik: 3, parilti: 1 });
            const o = [W * 0.14, H * 0.7];
            const sekil = MOTIF.map(([x, y]) => [o[0] + x * u, o[1] - y * u]);
            const g1 = sekil.map((P) => yansit(P, [x1, 0], [x1, 1])), g2 = g1.map((P) => yansit(P, [x2, 0], [x2, 1]));
            motifCiz(ctx, sekil, 'turkuaz'); motifCiz(ctx, g1, 'menekse', 0.6); motifCiz(ctx, g2, 'mercan');
            E.ok(ctx, sekil[0][0], H * 0.82, g2[0][0], H * 0.82, { renk: 'limon', kalinlik: 3 });
            E.yazi(ctx, `öteleme = 2d`, (sekil[0][0] + g2[0][0]) / 2, H * 0.82 - 18, { boyut: 18, renk: 'limon', agirlik: 700 });
            bilgi.innerHTML = `İki yansıma, şekli aynalara dik doğrultuda <b>2 × ${Math.round(d.uzak * 100)} = ${Math.round(d.uzak * 200)} br</b> öteler. Yön önce ters döner, sonra tekrar düzelir.`;
          } else {
            const M = [W * 0.5, H * 0.55], th = (d.aci * Math.PI) / 180, L = Math.max(W, H);
            const a1 = -Math.PI / 2 + 0.0, a2 = a1 - th; // iki ayna doğrultusu (ekran açıları)
            const ayna = (a) => [M, [M[0] + Math.cos(a) * L, M[1] + Math.sin(a) * L]];
            if (d.kaleydo) {
              const n = Math.round(360 / (2 * d.aci));
              const dilim = (Math.PI * 2) / n;
              const o = [M[0] + u * 1.2, M[1] - u * 0.3];
              const sekil = MOTIF.map(([x, y]) => [o[0] + x * u * 0.55, o[1] - y * u * 0.55]);
              for (let k = 0; k < n; k++) {
                const dd = sekil.map((P) => dondur(P, M, k * dilim));
                motifCiz(ctx, dd, 'turkuaz', 0.9);
                const yy = dd.map((P) => yansit(P, M, dondur([M[0] + 1, M[1]], M, k * dilim + dilim / 2)));
                motifCiz(ctx, yy, 'mercan', 0.9);
              }
              bilgi.innerHTML = Number.isInteger(360 / (2 * d.aci)) ? `Aynalar arası ${d.aci}° → <b>${n}</b> dönme kopyası ve onların yansımaları: bir kilim rozeti.` : `Kaleydoskop en güzel 360°'yi tam bölen açılarda olur (ör. 30°, 45°, 60°, 90°).`;
            } else {
              E.cizgi(ctx, ayna(a1), { renk: 'gok', kalinlik: 3, parilti: 1 });
              E.cizgi(ctx, ayna(a2), { renk: 'gok', kalinlik: 3, parilti: 1 });
              E.aciYayi(ctx, M[0], M[1], u * 0.9, a2, a1, { renk: 'gok', dolgu: 0.1 });
              E.yazi(ctx, `θ = ${d.aci}°`, M[0] + Math.cos((a1 + a2) / 2) * u * 1.4, M[1] + Math.sin((a1 + a2) / 2) * u * 1.4, { boyut: 17, renk: 'gok', agirlik: 700 });
              const o = [M[0] + u * 1.4, M[1] + u * 2.2];
              const sekil = MOTIF.map(([x, y]) => [o[0] + x * u * 0.7, o[1] - y * u * 0.7]);
              const g1 = sekil.map((P) => yansit(P, ayna(a1)[0], ayna(a1)[1]));
              const g2 = g1.map((P) => yansit(P, ayna(a2)[0], ayna(a2)[1]));
              motifCiz(ctx, sekil, 'turkuaz'); motifCiz(ctx, g1, 'menekse', 0.6); motifCiz(ctx, g2, 'mercan');
              const r = Math.hypot(sekil[2][0] - M[0], sekil[2][1] - M[1]), b0 = Math.atan2(sekil[2][1] - M[1], sekil[2][0] - M[0]);
              E.aciYayi(ctx, M[0], M[1], r, b0, b0 - 2 * th, { renk: 'limon', dolgu: 0.05, kalinlik: 2.5 });
              E.nokta(ctx, M[0], M[1], 7, { renk: 'tebesir' });
              bilgi.innerHTML = `İki yansıma = merkezi kesişim noktası olan <b>2 × ${d.aci}° = ${2 * d.aci}°</b> dönme.`;
            }
          }
        },
      };
    },
  };

  /* ---------- 3. Benzer üçgenler ---------- */
  const benzer = {
    id: 'benzer', ad: 'Benzer üçgenler',
    ipucu: 'Tales: kenara paralel çizilen doğru, benzer bir üçgen keser. Dik üçgende hipotenüse yükseklik üç benzer üçgen doğurur.',
    kur(api) {
      const d = { mod: 'tales', t: 0.55, P: [[0.5, 0.12], [0.14, 0.86], [0.86, 0.86]], dikAci: 35 };
      const gos = Lab.gosterge([['r1', ''], ['r2', ''], ['r3', ''], ['r4', '']]);
      let surukle = -1;
      const ekran = (W, H) => d.P.map(([x, y]) => [x * W, y * H]);
      const kT = Lab.kaydirici({ ad: 'k', min: 0.1, max: 1.4, adim: 0.01, deger: d.t, degisti: (v) => { d.t = v; api.ciz(); } });
      const kD = Lab.kaydirici({ ad: 'B', min: 15, max: 75, adim: 1, deger: d.dikAci, bicim: (v) => v + '°', degisti: (v) => { d.dikAci = v; api.ciz(); } });
      const tK = Lab.kart('Paralel doğru (DE ∥ BC)', [kT, p('k > 1 olunca doğru üçgenin dışına çıkar; benzerlik yine sürer.')]);
      const dK = Lab.kart('Dik üçgen', [kD]); dK.style.display = 'none';
      return {
        panel: [Lab.kart('Mod', [Lab.segment({ secenekler: [['tales', 'Paralel (Tales)'], ['dik', 'Yükseklik (Öklid)']], deger: d.mod, degisti: (v) => { d.mod = v; tK.style.display = v === 'tales' ? '' : 'none'; dK.style.display = v === 'dik' ? '' : 'none'; api.ciz(); } })]), tK, dK, Lab.kart('Oranlar', [gos])],
        basildi(x, y) { if (d.mod !== 'tales') return false; const i = Lab.enYakin(ekran(api.W, api.H), x, y, 30); if (i < 0) return false; surukle = i; },
        suruklendi(x, y) { d.P[surukle] = [clamp(x / api.W, 0.05, 0.95), clamp(y / api.H, 0.06, 0.94)]; },
        birakildi() { surukle = -1; },
        uzerinde(x, y) { return d.mod === 'tales' && Lab.enYakin(ekran(api.W, api.H), x, y, 30) >= 0; },
        ciz(ctx, W, H) {
          const kis = Math.min(W, H) / 30;
          if (d.mod === 'tales') {
            const [A, B, C] = ekran(W, H);
            const D = [lerp(A[0], B[0], d.t), lerp(A[1], B[1], d.t)], Ee = [lerp(A[0], C[0], d.t), lerp(A[1], C[1], d.t)];
            E.cokgen(ctx, [A, B, C], { renk: 'turkuaz', alfa: 0.06, kenar: true, kalinlik: 3 });
            E.cokgen(ctx, [A, D, Ee], { renk: 'mercan', alfa: 0.15, kenar: true, kalinlik: 3, parilti: 0.6 });
            if (d.t > 1) { E.cizgi(ctx, [B, D], { renk: 'turkuaz', kalinlik: 2, kesik: [5, 5] }); E.cizgi(ctx, [C, Ee], { renk: 'turkuaz', kalinlik: 2, kesik: [5, 5] }); }
            [['A', A], ['B', B], ['C', C], ['D', D], ['E', Ee]].forEach(([ad, P], i) => { E.nokta(ctx, P[0], P[1], i < 3 ? 8 : 6, { renk: i < 3 ? 'tebesir' : 'limon' }); E.yazi(ctx, ad, P[0] + 14, P[1] - 14, { boyut: 18, agirlik: 760, renk: i < 3 ? 'tebesir' : 'limon' }); });
            const u = (P, Q) => Math.hypot(P[0] - Q[0], P[1] - Q[1]) / kis;
            gos.yaz('r1', `AD/AB = ${s2(u(A, D) / u(A, B))}`); gos.yaz('r2', `AE/AC = ${s2(u(A, Ee) / u(A, C))}`);
            gos.yaz('r3', `DE/BC = ${s2(u(D, Ee) / u(B, C))}`); gos.yaz('r4', `ADE ∼ ABC (AA)`);
          } else {
            const b = (d.dikAci * Math.PI) / 180;
            const a = 1, c = Math.cos(b) * a, bb = Math.sin(b) * a; // hipotenüs 1: |AB|=c (B yanında), |AC|=bb
            const olc = Math.min(W * 0.8, (H * 0.75) / Math.max(0.5, Math.sin(b) * Math.cos(b)) * 0.5);
            const Bp = [W / 2 - olc / 2, H * 0.84], Cp = [W / 2 + olc / 2, H * 0.84];
            const px = c * c, h = c * bb; // BH = c², AH = c·b
            const Ap = [Bp[0] + px * olc, Bp[1] - h * olc], Hp = [Ap[0], Bp[1]];
            E.cokgen(ctx, [Ap, Bp, Hp], { renk: 'turkuaz', alfa: 0.18, kenar: true, kalinlik: 2.5 });
            E.cokgen(ctx, [Ap, Hp, Cp], { renk: 'mercan', alfa: 0.18, kenar: true, kalinlik: 2.5 });
            E.cizgi(ctx, [Ap, Bp, Cp], { kapali: true, renk: 'tebesir', kalinlik: 3 });
            E.dikAci(ctx, Hp[0], Hp[1], -Math.PI / 2, 12, { renk: 'limon' });
            [['A', Ap, 0, -18], ['B', Bp, -16, 10], ['C', Cp, 16, 10], ['H', Hp, 0, 22]].forEach(([ad, P, dx, dy]) => E.yazi(ctx, ad, P[0] + dx, P[1] + dy, { boyut: 18, agirlik: 760 }));
            const p1 = px, k1 = 1 - px;
            gos.yaz('r1', `h² = ${s2(h * h)} = p·k = ${s2(p1 * k1)}`); gos.yaz('r2', `c² = ${s2(c * c)} = p·a = ${s2(p1)}`);
            gos.yaz('r3', `b² = ${s2(bb * bb)} = k·a = ${s2(k1)}`); gos.yaz('r4', `b² + c² = ${s2(bb * bb + c * c)} = a²`);
            E.yazi(ctx, 'a = |BC| = 1 birim · p = |BH| · k = |HC|', W / 2, 26, { boyut: 16, renk: 'gumus' });
          }
        },
      };
    },
  };

  Lab.kur({ ad: T.labAd || 'Dönüşüm ve Benzerlik Laboratuvarı', tema: T.ad, temaNo: T.no, filmler: T.filmler, deneyler: [atolye, ikiAyna, benzer] });
})();
