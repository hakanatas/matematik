/* Eksen · Fonksiyon Laboratuvarı — 2. Tema: Nicelikler ve Değişimler
   Deneyler: Doğru dönüştürücü · Mutlak değer katlayıcı · Kesişim ve eşitsizlik */
(function () {
  'use strict';
  const E = window.E, Lab = window.Lab, T = window.EKSEN_TEMA;
  const { clamp, lerp } = E;
  const sy = (v, b = 2) => E.sayiYaz(Math.abs(v) < 1e-9 ? 0 : v, b);
  const p = (h) => Lab.el('p', { html: h });
  /** ax + b biçiminde düzgün yaz */
  const dogruTex = (a, b, x = 'x') => {
    let s = '';
    if (Math.abs(a) < 1e-9) return sy(b);
    s = a === 1 ? x : a === -1 ? '−' + x : `${sy(a)}${x}`;
    if (Math.abs(b) > 1e-9) s += b > 0 ? ` + ${sy(b)}` : ` − ${sy(-b)}`;
    return s;
  };
  const duzlemKur = (W, H, xr = 8, yr) => {
    yr = yr || xr * (H / W);
    const pad = 18;
    return E.duzlem({ x: pad, y: pad, w: W - 2 * pad, h: H - 2 * pad, xmin: -xr, xmax: xr, ymin: -yr, ymax: yr });
  };
  const adimSec = (W) => (W < 480 ? 2 : 1);

  /* ---------- 1. Doğru dönüştürücü ---------- */
  const donusturucu = {
    id: 'dogru', ad: 'Doğru dönüştürücü',
    ipucu: 'g(x) = a·f(x − r) + k. Önce yalnızca k\'yı, sonra r\'yi, sonra a\'yı değiştir. r kadar sağa kaydırmak, a·r kadar aşağı kaydırmakla aynı doğruyu verir!',
    kur(api) {
      const d = { a: 1, r: 0, k: 0, kisit: false, x0: -2, x1: 3, sa: true, sb: false };
      const fG = Lab.formulKanvas('', { boyut: 25 }), fA = Lab.formulKanvas('', { boyut: 25 });
      const gos = Lab.gosterge([['sifir', 'Sıfırı'], ['kes', 'y eksenini kestiği'], ['yon', 'Artan / azalan'], ['bire', 'Bire bir mi?'], ['tanim', 'Tanım kümesi'], ['goruntu', 'Görüntü kümesi'], ['max', 'Maksimum'], ['min', 'Minimum']]);
      const g = (x) => d.a * (x - d.r) + d.k;
      const guncelle = () => {
        const b = d.k - d.a * d.r;
        fG.yaz(`g(x) = ${sy(d.a)} · (x ${d.r >= 0 ? '−' : '+'} ${sy(Math.abs(d.r))}) ${d.k >= 0 ? '+' : '−'} ${sy(Math.abs(d.k))}`);
        fA.yaz(`g(x) = ${dogruTex(d.a, b)}`, { renk: 'limon' });
        gos.yaz('sifir', d.a === 0 ? (b === 0 ? 'her x' : 'yok') : `x = ${sy(-b / d.a)}`);
        gos.yaz('kes', `(0, ${sy(b)})`);
        gos.yaz('yon', d.a > 0 ? 'artan' : d.a < 0 ? 'azalan' : 'sabit');
        gos.yaz('bire', d.a !== 0 ? 'evet' : 'hayır');
        const ac = (x, sol) => (sol ? (d.sa ? '[' : '(') : (d.sb ? ']' : ')'));
        if (d.kisit) {
          gos.yaz('tanim', `${ac(0, 1)}${sy(d.x0)}, ${sy(d.x1)}${ac(0, 0)}`);
          const ya = g(d.x0), yb = g(d.x1);
          const lo = Math.min(ya, yb), hi = Math.max(ya, yb);
          const loKap = ya <= yb ? d.sa : d.sb, hiKap = ya <= yb ? d.sb : d.sa;
          gos.yaz('goruntu', d.a === 0 ? `{${sy(ya)}}` : `${loKap ? '[' : '('}${sy(lo)}, ${sy(hi)}${hiKap ? ']' : ')'}`);
          gos.yaz('max', d.a === 0 ? sy(ya) : hiKap ? sy(hi) : 'yok (uç açık)');
          gos.yaz('min', d.a === 0 ? sy(ya) : loKap ? sy(lo) : 'yok (uç açık)');
        } else {
          gos.yaz('tanim', 'ℝ'); gos.yaz('goruntu', d.a === 0 ? `{${sy(b)}}` : 'ℝ'); gos.yaz('max', d.a === 0 ? sy(b) : 'yok'); gos.yaz('min', d.a === 0 ? sy(b) : 'yok');
        }
        api.ciz();
      };
      const kA = Lab.kaydirici({ ad: 'a', min: -3, max: 3, adim: 0.25, deger: d.a, degisti: (v) => { d.a = v; guncelle(); } });
      const kR = Lab.kaydirici({ ad: 'r', min: -5, max: 5, adim: 0.5, deger: d.r, degisti: (v) => { d.r = v; guncelle(); } });
      const kK = Lab.kaydirici({ ad: 'k', min: -5, max: 5, adim: 0.5, deger: d.k, degisti: (v) => { d.k = v; guncelle(); } });
      const kX0 = Lab.kaydirici({ ad: 'x₁', min: -7, max: 7, adim: 0.5, deger: d.x0, degisti: (v) => { d.x0 = Math.min(v, d.x1); guncelle(); } });
      const kX1 = Lab.kaydirici({ ad: 'x₂', min: -7, max: 7, adim: 0.5, deger: d.x1, degisti: (v) => { d.x1 = Math.max(v, d.x0); guncelle(); } });
      const kisitKart = Lab.kart('Tanım aralığı', [kX0, kX1, Lab.segment({ secenekler: [['kk', '[x₁, x₂]'], ['ka', '[x₁, x₂)'], ['aa', '(x₁, x₂)']], deger: 'ka', degisti: (v) => { d.sa = v[0] === 'k'; d.sb = v[1] === 'k'; guncelle(); } })]);
      kisitKart.style.display = 'none';
      const mod = Lab.segment({ secenekler: [[false, 'Tanım kümesi ℝ'], [true, 'Bir aralıkta']], deger: false, degisti: (v) => { d.kisit = v; kisitKart.style.display = v ? '' : 'none'; guncelle(); } });
      guncelle();
      return {
        panel: [Lab.kart('Dönüşüm', [kA, kR, kK, fG, fA]), Lab.kart('Tanım', [mod]), kisitKart, Lab.kart('Nitel özellikler', [gos])],
        ciz(ctx, W, H) {
          const D = duzlemKur(W, H, 8);
          D.ciz(ctx, { adim: 1, etiketAdim: adimSec(W) * 2, boyut: 15 });
          D.egri(ctx, (x) => x, { renk: 'gumus', kalinlik: 2.5, parilti: 0, kesik: [8, 8] });
          E.yazi(ctx, 'f(x) = x', D.px(6.2), D.py(6.2) + 18, { boyut: 16, renk: 'gumus', hiza: 'left' });
          const x0 = d.kisit ? d.x0 : D.xmin, x1 = d.kisit ? d.x1 : D.xmax;
          // işaret bölgeleri
          if (d.a !== 0) {
            const z = d.r - d.k / d.a;
            if (z > D.xmin && z < D.xmax) {
              ctx.save(); ctx.globalAlpha = 0.07;
              ctx.fillStyle = E.R('turkuaz'); const xp = D.px(z);
              ctx.fillRect(d.a > 0 ? xp : D.x, D.y, d.a > 0 ? D.x + D.w - xp : xp - D.x, D.h);
              ctx.fillStyle = E.R('mercan'); ctx.fillRect(d.a > 0 ? D.x : xp, D.y, d.a > 0 ? xp - D.x : D.x + D.w - xp, D.h);
              ctx.restore();
              E.nokta(ctx, xp, D.py(0), 7, { renk: 'limon' });
              E.yazi(ctx, `x = ${sy(z)}`, xp, D.py(0) - 20, { boyut: 16, renk: 'limon', agirlik: 700 });
            }
          }
          D.egri(ctx, g, { renk: 'turkuaz', kalinlik: 4, x0, x1 });
          if (d.kisit) {
            E.nokta(ctx, D.px(d.x0), D.py(g(d.x0)), 7, { renk: 'turkuaz', bos: !d.sa });
            E.nokta(ctx, D.px(d.x1), D.py(g(d.x1)), 7, { renk: 'turkuaz', bos: !d.sb });
          }
          // r ve k okları
          if (d.r) E.ok(ctx, D.px(0), D.py(0) + 26, D.px(d.r), D.py(0) + 26, { renk: 'menekse', kalinlik: 3 });
          if (d.k) E.ok(ctx, D.px(d.r) + 0, D.py(0), D.px(d.r), D.py(d.k), { renk: 'mercan', kalinlik: 3 });
          E.nokta(ctx, D.px(d.r), D.py(d.k), 6, { renk: 'mercan' });
        },
      };
    },
  };

  /* ---------- 2. Mutlak değer katlayıcı ---------- */
  const katlayici = {
    id: 'mutlak', ad: 'Mutlak değer katlayıcı',
    ipucu: 'Katlama kaydırıcısını sürükle: h(x)\'in x ekseninin altındaki parçası eksen etrafında dönerek üste katlanır.',
    kur(api) {
      const d = { s: 1, a: 2, b: -4, c: -1, katla: 1 };
      const fM = Lab.formulKanvas('', { boyut: 25 }), fP = Lab.formulKanvas('', { boyut: 22 });
      const gos = Lab.gosterge([['tepe', 'Tepe noktası'], ['eksen', 'Simetri ekseni'], ['goruntu', 'Görüntü kümesi'], ['sifir', 'Sıfırları']]);
      const h = (x) => d.a * x + d.b;
      const guncelle = () => {
        const xt = -d.b / d.a;
        fM.yaz(`m(x) = ${d.s < 0 ? '−' : ''}|${dogruTex(d.a, d.b)}| ${d.c >= 0 ? '+' : '−'} ${sy(Math.abs(d.c))}`);
        // parçalı gösterim
        const sag = d.a > 0 ? '≥' : '≤';
        const p1 = dogruTex(d.s * d.a, d.s * d.b + d.c), p2 = dogruTex(-d.s * d.a, -d.s * d.b + d.c);
        fP.yaz(`x ${sag} ${sy(xt)} \\t{ ise } ${p1}; \\;\\; \\t{değilse } ${p2}`, { renk: 'gumus' });
        gos.yaz('tepe', `(${sy(xt)}, ${sy(d.c)})`);
        gos.yaz('eksen', `x = ${sy(xt)}`);
        gos.yaz('goruntu', d.s > 0 ? `[${sy(d.c)}, ∞)` : `(−∞, ${sy(d.c)}]`);
        const u = -d.c * d.s; // |h| = u
        gos.yaz('sifir', u < 0 ? 'yok' : u === 0 ? `x = ${sy(xt)}` : `x = ${sy((u - d.b) / d.a)}, ${sy((-u - d.b) / d.a)}`);
        api.ciz();
      };
      const kA = Lab.kaydirici({ ad: 'a', min: -3, max: 3, adim: 0.5, deger: d.a, degisti: (v) => { d.a = v === 0 ? 0.5 : v; guncelle(); } });
      const kB = Lab.kaydirici({ ad: 'b', min: -6, max: 6, adim: 0.5, deger: d.b, degisti: (v) => { d.b = v; guncelle(); } });
      const kC = Lab.kaydirici({ ad: 'c', min: -5, max: 5, adim: 0.5, deger: d.c, degisti: (v) => { d.c = v; guncelle(); } });
      const kK = Lab.kaydirici({ ad: '⤴', etiket: 'Katlama', min: 0, max: 1, adim: 0.01, deger: 1, bicim: (v) => Math.round(v * 100) + '%', degisti: (v) => { d.katla = v; api.ciz(); } });
      const sSeg = Lab.segment({ secenekler: [[1, '+|…|'], [-1, '−|…|']], deger: 1, degisti: (v) => { d.s = v; guncelle(); } });
      guncelle();
      return {
        panel: [Lab.kart('m(x) = ±|ax + b| + c', [sSeg, kA, kB, kC, fM]), Lab.kart('Katla', [kK, p('Kesikli çizgi: <b>h(x) = ax + b</b>. Kırılma noktası h\'nin sıfırıdır.')]), Lab.kart('Parçalı gösterim', [fP]), Lab.kart('Nitel özellikler', [gos])],
        ciz(ctx, W, H) {
          const D = duzlemKur(W, H, 8);
          D.ciz(ctx, { adim: 1, etiketAdim: adimSec(W) * 2, boyut: 15 });
          D.egri(ctx, h, { renk: 'gumus', kalinlik: 2.5, parilti: 0, kesik: [8, 8] });
          const cos = Math.cos(Math.PI * d.katla);
          // katlanma: h<0 kısmı y → y·cos (perspektifsiz dönme izdüşümü), sonra s ve c
          const m = (x) => { const y = h(x); const yk = y < 0 ? y * cos : y; return d.s * yk + (d.katla >= 1 ? d.c : d.c * d.katla); };
          D.egri(ctx, m, { renk: 'turkuaz', kalinlik: 4, n: 600 });
          const xt = -d.b / d.a;
          E.cizgi(ctx, [[D.px(xt), D.y], [D.px(xt), D.y + D.h]], { renk: 'menekse', kalinlik: 1.5, kesik: [5, 7], alfa: 0.8 });
          E.nokta(ctx, D.px(xt), D.py(m(xt)), 7, { renk: 'limon' });
        },
      };
    },
  };

  /* ---------- 3. Kesişim ve eşitsizlik ---------- */
  const kesisim = {
    id: 'kesisim', ad: 'Kesişim ve eşitsizlik',
    ipucu: 'İki doğru buluştuğu yerde f(x) = g(x). Eşitsizliği seç: çözüm kümesi x ekseninde ışıkla yanar.',
    kur(api) {
      const d = { a1: 2, b1: -2, a2: -0.5, b2: 3, iliski: '<', mut: false, k: 3 };
      const fE = Lab.formulKanvas('', { boyut: 24 }), cevap = p('');
      const f = (x) => d.a1 * x + d.b1, g = (x) => (d.mut ? d.k : d.a2 * x + d.b2);
      const F = (x) => (d.mut ? Math.abs(f(x)) : f(x));
      const sag = () => (d.mut ? sy(d.k) : dogruTex(d.a2, d.b2));
      const sol = () => (d.mut ? `|${dogruTex(d.a1, d.b1)}|` : dogruTex(d.a1, d.b1));
      const sagla = (x) => { const u = F(x) - g(x); return { '<': u < -1e-9, '≤': u <= 1e-9, '=': Math.abs(u) <= 1e-9, '≥': u >= -1e-9, '>': u > 1e-9 }[d.iliski]; };
      // Çözüm kümesini kritik noktalarla bul
      const coz = () => {
        const kr = [];
        if (d.mut) { if (d.a1) { kr.push((d.k - d.b1) / d.a1, (-d.k - d.b1) / d.a1, -d.b1 / d.a1); } }
        else if (d.a1 !== d.a2) kr.push((d.b2 - d.b1) / (d.a1 - d.a2));
        const nk = [...new Set(kr.map((v) => Math.round(v * 1e9) / 1e9))].sort((a, b) => a - b);
        const parca = []; const sinir = [-Infinity, ...nk, Infinity];
        for (let i = 0; i < sinir.length - 1; i++) {
          const a = sinir[i], b = sinir[i + 1];
          const orta = a === -Infinity ? (b === Infinity ? 0 : b - 1) : b === Infinity ? a + 1 : (a + b) / 2;
          if (sagla(orta)) parca.push({ a, b, sa: a !== -Infinity && sagla(a), sb: b !== Infinity && sagla(b) });
        }
        for (const v of nk) if (sagla(v) && !parca.some((I) => (I.a < v && v < I.b) || (I.a === v && I.sa) || (I.b === v && I.sb))) parca.push({ a: v, b: v, sa: true, sb: true });
        // birleştir
        parca.sort((x, y) => x.a - y.a);
        const s = [];
        for (const I of parca) { const o = s[s.length - 1]; if (o && o.b === I.a && (o.sb || I.sa)) { o.b = I.b; o.sb = I.sb; } else s.push({ ...I }); }
        if (!d.mut && d.a1 === d.a2) return (sagla(0) ? [{ a: -Infinity, b: Infinity }] : []);
        return s;
      };
      const yaz = (L) => !L.length ? '∅' : L.map((I) => I.a === I.b ? `{${sy(I.a)}}` : `${I.a === -Infinity ? '(−∞' : (I.sa ? '[' : '(') + sy(I.a)}, ${I.b === Infinity ? '∞)' : sy(I.b) + (I.sb ? ']' : ')')}`).join(' ∪ ');
      const guncelle = () => {
        fE.yaz(`${sol()} ${d.iliski} ${sag()}`);
        cevap.innerHTML = `Çözüm kümesi: <b style="color:var(--limon)">${yaz(coz())}</b>`;
        api.ciz();
      };
      const kart2 = Lab.kart('g(x) = ax + b (mercan)', [
        Lab.kaydirici({ ad: 'a', min: -3, max: 3, adim: 0.25, deger: d.a2, degisti: (v) => { d.a2 = v; guncelle(); } }),
        Lab.kaydirici({ ad: 'b', min: -6, max: 6, adim: 0.5, deger: d.b2, degisti: (v) => { d.b2 = v; guncelle(); } }),
      ]);
      const kartK = Lab.kart('|f(x)| ? k', [Lab.kaydirici({ ad: 'k', min: -2, max: 6, adim: 0.5, deger: d.k, degisti: (v) => { d.k = v; guncelle(); } })]);
      kartK.style.display = 'none';
      guncelle();
      return {
        panel: [
          Lab.kart('Mod', [Lab.segment({ secenekler: [[false, 'f ile g'], [true, '|f| ile k']], deger: false, degisti: (v) => { d.mut = v; kart2.style.display = v ? 'none' : ''; kartK.style.display = v ? '' : 'none'; guncelle(); } })]),
          Lab.kart('f(x) = ax + b (turkuaz)', [
            Lab.kaydirici({ ad: 'a', min: -3, max: 3, adim: 0.25, deger: d.a1, degisti: (v) => { d.a1 = v; guncelle(); } }),
            Lab.kaydirici({ ad: 'b', min: -6, max: 6, adim: 0.5, deger: d.b1, degisti: (v) => { d.b1 = v; guncelle(); } }),
          ]),
          kart2, kartK,
          Lab.kart('İlişki', [Lab.segment({ secenekler: [['<', '<'], ['≤', '≤'], ['=', '='], ['≥', '≥'], ['>', '>']], deger: d.iliski, degisti: (v) => { d.iliski = v; guncelle(); } }), fE, cevap]),
        ],
        ciz(ctx, W, H) {
          const D = duzlemKur(W, H, 8);
          D.ciz(ctx, { adim: 1, etiketAdim: adimSec(W) * 2, boyut: 15 });
          const L = coz();
          // çözüm şeritleri
          for (const I of L) {
            const xa = D.px(Math.max(I.a, D.xmin - 1)), xb = D.px(Math.min(I.b, D.xmax + 1));
            ctx.save(); ctx.globalAlpha = 0.09; ctx.fillStyle = E.R('limon'); ctx.fillRect(Math.max(xa, D.x), D.y, Math.min(xb, D.x + D.w) - Math.max(xa, D.x), D.h); ctx.restore();
            const nd = E.sayiDogrusu({ x: D.x, y: D.py(0), w: D.w, min: D.xmin, max: D.xmax });
            if (I.a === I.b) E.nokta(ctx, D.px(I.a), D.py(0), 8, { renk: 'limon' });
            else nd.aralik(ctx, I.a < D.xmin ? -Infinity : I.a, I.b > D.xmax ? Infinity : I.b, { renk: 'limon', acikSol: !I.sa, acikSag: !I.sb, kalinlik: 7 });
          }
          D.egri(ctx, F, { renk: 'turkuaz', kalinlik: 4, n: 500 });
          D.egri(ctx, g, { renk: 'mercan', kalinlik: 4 });
          // kesişimler
          for (let x = D.xmin; x <= D.xmax; x += 0.01) {
            const u0 = F(x) - g(x), u1 = F(x + 0.01) - g(x + 0.01);
            if (u0 === 0 || u0 * u1 < 0) {
              const xx = u0 === 0 ? x : x + 0.01 * (u0 / (u0 - u1));
              E.nokta(ctx, D.px(xx), D.py(g(xx)), 7, { renk: 'tebesir' });
              E.cizgi(ctx, [[D.px(xx), D.py(g(xx))], [D.px(xx), D.py(0)]], { renk: 'tebesir', kalinlik: 1.5, kesik: [4, 5], alfa: 0.7 });
              E.yazi(ctx, `(${sy(xx)}, ${sy(g(xx))})`, D.px(xx) + 10, D.py(g(xx)) - 18, { boyut: 15, hiza: 'left', agirlik: 650 });
            }
          }
        },
      };
    },
  };

  Lab.kur({ ad: T.labAd || 'Fonksiyon Laboratuvarı', tema: T.ad, temaNo: T.no, filmler: T.filmler, deneyler: [donusturucu, katlayici, kesisim] });
})();
