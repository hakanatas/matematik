/* Eksen · Algoritma Laboratuvarı — 5. Tema: Algoritma ve Bilişim
   Deneyler: Çizge ve Euler yolu · İkili arama · Mantık kapıları */
(function () {
  'use strict';
  const E = window.E, Lab = window.Lab, T = window.EKSEN_TEMA;
  const { clamp, lerp } = E;
  const p = (h) => Lab.el('p', { html: h });

  /* ---------- 1. Çizge ve Euler yolu ---------- */
  const HAZIR = {
    konigsberg: { d: [[0.5, 0.18], [0.5, 0.5], [0.5, 0.82], [0.85, 0.5]], k: [[0, 1], [0, 1], [1, 2], [1, 2], [0, 3], [1, 3], [2, 3]] },
    zarf: { d: [[0.3, 0.8], [0.7, 0.8], [0.7, 0.45], [0.3, 0.45], [0.5, 0.15]], k: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [3, 4], [4, 2]] },
    ev: { d: [[0.3, 0.8], [0.7, 0.8], [0.7, 0.45], [0.3, 0.45], [0.5, 0.15]], k: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 2]] },
    yildiz: { d: [0, 1, 2, 3, 4].map((i) => [0.5 + 0.34 * Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / 5), 0.52 + 0.36 * Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / 5)]), k: [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0], [0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] },
  };
  const cizge = {
    id: 'cizge', ad: 'Çizge ve Euler yolu',
    ipucu: 'Boş yere dokun: düğüm ekle. Bir düğüme, sonra başka bir düğüme dokun: ayrıt ekle. Düğümleri sürükleyebilirsin.',
    kur(api) {
      const d = { dugum: HAZIR.konigsberg.d.map((x) => x.slice()), ayrit: HAZIR.konigsberg.k.map((x) => x.slice()), secili: -1, yol: null, yolT: 0 };
      const sonuc = p(''), tablo = p('');
      const derece = () => { const g = d.dugum.map(() => 0); d.ayrit.forEach(([a, b]) => { g[a]++; g[b]++; }); return g; };
      const bagli = () => {
        const kullanilan = d.dugum.map((_, i) => d.ayrit.some((e) => e.includes(i)));
        const bas = kullanilan.indexOf(true); if (bas < 0) return true;
        const gor = new Set([bas]), yig = [bas];
        while (yig.length) { const u = yig.pop(); d.ayrit.forEach(([a, b]) => { const v = a === u ? b : b === u ? a : -1; if (v >= 0 && !gor.has(v)) { gor.add(v); yig.push(v); } }); }
        return kullanilan.every((k, i) => !k || gor.has(i));
      };
      const hierholzer = (bas) => {
        const kalan = d.ayrit.map((e, i) => ({ e, i, kul: false }));
        const yig = [bas], yol = [];
        while (yig.length) {
          const u = yig[yig.length - 1];
          const k = kalan.find((x) => !x.kul && x.e.includes(u));
          if (k) { k.kul = true; yig.push(k.e[0] === u ? k.e[1] : k.e[0]); } else yol.push(yig.pop());
        }
        return yol.reverse();
      };
      const analiz = () => {
        const g = derece(), tek = g.map((x, i) => [x, i]).filter(([x]) => x % 2).map(([, i]) => i);
        tablo.innerHTML = 'Dereceler: ' + g.map((x, i) => `<b style="color:var(--${x % 2 ? 'mercan' : 'turkuaz'})">${String.fromCharCode(65 + i)}=${x}</b>`).join(' · ');
        let s;
        if (!d.ayrit.length) s = 'Ayrıt ekle.';
        else if (!bagli()) s = '<b style="color:var(--mercan)">Çizge bağlı değil</b>: tek seferde gezilemez.';
        else if (tek.length === 0) s = `<b style="color:var(--turkuaz)">Tek düğüm yok</b> → başladığın yere dönen bir tur var.`;
        else if (tek.length === 2) s = `<b style="color:var(--turkuaz)">2 tek düğüm</b> (${tek.map((i) => String.fromCharCode(65 + i)).join(', ')}) → yol var: birinden başla, ötekinde bitir.`;
        else s = `<b style="color:var(--mercan)">${tek.length} tek düğüm</b> → her ayrıttan bir kez geçen yol <b>yok</b>.`;
        sonuc.innerHTML = s;
        return { g, tek, ok: d.ayrit.length && bagli() && (tek.length === 0 || tek.length === 2) };
      };
      analiz();
      let surukle = -1, bas = null, tasindi = false;
      const ekran = () => d.dugum.map(([x, y]) => [x * api.W, y * api.H]);
      const yolBul = Lab.dugme('Yolu bul ve izle', () => {
        const a = analiz(); if (!a.ok) return;
        d.yol = hierholzer(a.tek.length ? a.tek[0] : d.ayrit[0][0]); d.yolT = performance.now(); api.animasyon(true);
      }, true);
      const hazir = Lab.segment({ secenekler: [['konigsberg', 'Königsberg'], ['zarf', 'Zarf'], ['ev', 'Ev'], ['yildiz', 'Yıldız'], ['bos', 'Boş']], deger: 'konigsberg', degisti: (v) => {
        const h = HAZIR[v] || { d: [], k: [] }; d.dugum = h.d.map((x) => x.slice()); d.ayrit = h.k.map((x) => x.slice()); d.secili = -1; d.yol = null; api.animasyon(false); analiz(); api.ciz();
      } });
      return {
        panel: [Lab.kart('Hazır çizgeler', [hazir]), Lab.kart('Algoritma', [Lab.el('pre', { html: '1. Her düğümün derecesini say\n2. Tek dereceli düğümleri say: t\n3. t = 0 → tur var\n   t = 2 → yol var (tek düğümden başla)\n   aksi hâlde → yol yok', style: 'font-family:var(--mono);font-size:13px;color:var(--tebesir);white-space:pre-wrap;margin:0' }), tablo, sonuc, Lab.el('div', { sinif: 'satir' }, [yolBul, Lab.dugme('Son ayrıtı sil', () => { d.ayrit.pop(); d.yol = null; analiz(); api.ciz(); })])])],
        basildi(x, y) { bas = [x, y]; tasindi = false; surukle = Lab.enYakin(ekran(), x, y, 28); },
        suruklendi(x, y) { if (Math.hypot(x - bas[0], y - bas[1]) > 6) tasindi = true; if (tasindi && surukle >= 0) d.dugum[surukle] = [clamp(x / api.W, 0.04, 0.96), clamp(y / api.H, 0.05, 0.95)]; },
        birakildi() {
          if (!tasindi) {
            if (surukle < 0) { if (d.dugum.length < 12) d.dugum.push([bas[0] / api.W, bas[1] / api.H]); d.secili = -1; }
            else if (d.secili < 0) d.secili = surukle;
            else if (d.secili !== surukle) { d.ayrit.push([d.secili, surukle]); d.secili = -1; }
            else d.secili = -1;
            d.yol = null; api.animasyon(false); analiz();
          }
          surukle = -1;
        },
        uzerinde(x, y) { return Lab.enYakin(ekran(), x, y, 28) >= 0; },
        ciz(ctx, W, H) {
          const P = ekran();
          // çoklu ayrıtları eğri çiz
          const sayac = {};
          const egri = (i) => { const [a, b] = d.ayrit[i]; const k = Math.min(a, b) + '-' + Math.max(a, b); const top = d.ayrit.filter(([x, y]) => Math.min(x, y) + '-' + Math.max(x, y) === k).length; sayac[k] = (sayac[k] || 0); const j = sayac[k]++; return (j - (top - 1) / 2) * 0.35 * (a < b ? 1 : -1); };
          const yollar = d.ayrit.map(([a, b], i) => {
            const e = egri(i), A = P[a], B = P[b];
            const mx = (A[0] + B[0]) / 2 - (B[1] - A[1]) * e, my = (A[1] + B[1]) / 2 + (B[0] - A[0]) * e;
            const pts = []; for (let s = 0; s <= 24; s++) { const t = s / 24; pts.push([(1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * mx + t * t * B[0], (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * my + t * t * B[1]]); }
            return pts;
          });
          yollar.forEach((pts) => E.cizgi(ctx, pts, { renk: 'cizgi', kalinlik: 4 }));
          if (d.yol) {
            const adim = (performance.now() - d.yolT) / 650;
            const kul = new Array(d.ayrit.length).fill(false);
            for (let s = 0; s < d.yol.length - 1 && s < adim; s++) {
              const u = d.yol[s], v = d.yol[s + 1];
              const i = d.ayrit.findIndex(([a, b], j) => !kul[j] && ((a === u && b === v) || (a === v && b === u)));
              if (i < 0) continue; kul[i] = true;
              let pts = yollar[i]; if (d.ayrit[i][0] !== u) pts = pts.slice().reverse();
              E.cizgi(ctx, pts, { renk: 'limon', kalinlik: 5, parilti: 1, p: clamp(adim - s), ok: adim - s < 1 });
            }
            if (adim > d.yol.length) api.animasyon(false);
          }
          const g = derece();
          P.forEach((Q, i) => {
            E.nokta(ctx, Q[0], Q[1], 17, { renk: g[i] % 2 ? 'mercan' : 'turkuaz', parilti: i === d.secili ? 1.6 : 0.6 });
            E.yazi(ctx, String.fromCharCode(65 + i), Q[0], Q[1], { boyut: 17, agirlik: 760, renk: 'gece' });
            E.yazi(ctx, String(g[i]), Q[0] + 22, Q[1] - 20, { boyut: 15, agirlik: 700, renk: g[i] % 2 ? 'mercan' : 'turkuaz' });
          });
        },
      };
    },
  };

  /* ---------- 2. İkili arama ---------- */
  const ikili = {
    id: 'ikili', ad: 'İkili arama',
    ipucu: '1 ile 1000 arasında bir sayı tut. Ben ortadaki sayıyı soracağım; sen "büyük", "küçük" ya da "buldun" de. En fazla 10 soru!',
    kur(api) {
      const d = { alt: 1, ust: 1000, sorular: [], bitti: false };
      const tahmin = () => Math.floor((d.alt + d.ust) / 2);
      const durum = p('');
      const yenile = () => {
        durum.innerHTML = d.bitti ? `<b style="color:var(--limon)">Buldum: ${tahmin()}!</b> ${d.sorular.length} soruda. (2¹⁰ = 1024 ≥ 1000 olduğu için en fazla 10 soru.)` : d.alt > d.ust ? '<b style="color:var(--mercan)">Cevaplarda çelişki var.</b> Baştan başla.' : `Sorum: Sayın <b>${tahmin()}</b> mi? (Aralık: ${d.alt}–${d.ust}, kalan aday: ${d.ust - d.alt + 1})`;
        api.ciz();
      };
      const cevap = (c) => { if (d.bitti || d.alt > d.ust) return; const g = tahmin(); d.sorular.push([g, c, d.alt, d.ust]); if (c === 'esit') d.bitti = true; else if (c === 'buyuk') d.alt = g + 1; else d.ust = g - 1; if (d.alt === d.ust) { d.bitti = true; } yenile(); };
      yenile();
      return {
        panel: [Lab.kart('Cevap ver', [durum, Lab.el('div', { sinif: 'satir' }, [Lab.dugme('Daha büyük', () => cevap('buyuk')), Lab.dugme('Daha küçük', () => cevap('kucuk')), Lab.dugme('Buldun!', () => cevap('esit'), true)]), Lab.dugme('Baştan başla', () => { d.alt = 1; d.ust = 1000; d.sorular = []; d.bitti = false; yenile(); })]),
          Lab.kart('Sözde kod', [Lab.el('pre', { html: 'alt ← 1, üst ← 1000\nTEKRARLA\n  orta ← ⌊(alt + üst) / 2⌋\n  EĞER cevap = "eşit" İSE bitir\n  EĞER cevap = "büyük" İSE alt ← orta + 1\n  DEĞİLSE üst ← orta − 1', style: 'font-family:var(--mono);font-size:13px;margin:0;white-space:pre-wrap' })])],
        ciz(ctx, W, H) {
          const x0 = 30, x1 = W - 30;
          const px = (v) => x0 + ((v - 1) / 999) * (x1 - x0);
          const y0 = 60;
          const satir = Math.min(40, (H - 120) / 11);
          E.yazi(ctx, '1', x0, y0 - 26, { boyut: 15, renk: 'gumus' }); E.yazi(ctx, '1000', x1, y0 - 26, { boyut: 15, renk: 'gumus' });
          const tum = d.sorular.concat(d.bitti || d.alt > d.ust ? [] : [[tahmin(), null, d.alt, d.ust]]);
          tum.forEach(([g, c, a, u], i) => {
            const y = y0 + i * satir;
            E.cizgi(ctx, [[x0, y], [x1, y]], { renk: 'sis', kalinlik: 2 });
            E.cizgi(ctx, [[px(a), y], [px(u), y]], { renk: 'turkuaz', kalinlik: 8, parilti: 0.7, uc: 'butt' });
            E.nokta(ctx, px(g), y, 6, { renk: c === 'esit' ? 'limon' : 'tebesir' });
            E.yazi(ctx, `${i + 1}. ${g}${c ? (c === 'buyuk' ? ' → büyük' : c === 'kucuk' ? ' → küçük' : ' ✓') : ' ?'}`, px(g) + (px(g) > W * 0.7 ? -12 : 12), y - 14, { boyut: 14, hiza: px(g) > W * 0.7 ? 'right' : 'left', renk: c ? 'gumus' : 'limon', agirlik: 650 });
          });
          E.yazi(ctx, `Soru sayısı: ${d.sorular.length} / 10`, W / 2, H - 22, { boyut: 18, agirlik: 700, renk: 'limon' });
        },
      };
    },
  };

  /* ---------- 3. Mantık kapıları ---------- */
  const kapilar = {
    id: 'kapilar', ad: 'Mantık kapıları',
    ipucu: 'Artık yıl: (4\'e bölünür ∧ 100\'e bölünmez) ∨ 400\'e bölünür. Bağlacı değiştirip 1900\'ü dene: küçük bir hata takvimi bozar!',
    kur(api) {
      const d = { yil: 1900, b1: 've', b2: 'veya' };
      const B = { ve: [(a, b) => a && b, '∧'], veya: [(a, b) => a || b, '∨'], yada: [(a, b) => a !== b, '⊻'] };
      const kY = Lab.kaydirici({ ad: 'yıl', min: 1800, max: 2400, adim: 1, deger: d.yil, bicim: (v) => String(v), degisti: (v) => { d.yil = v; api.ciz(); } });
      const hizli = Lab.el('div', { sinif: 'satir' }, [1900, 2000, 2023, 2024, 2100].map((y) => Lab.dugme(String(y), () => { d.yil = y; kY.ayarla(y); api.ciz(); })));
      const sonuc = p('');
      return {
        panel: [Lab.kart('Yıl', [kY, hizli]), Lab.kart('Bağlaçlar', [p('Birinci bağlaç (p ? q):'), Lab.segment({ secenekler: [['ve', '∧ ve'], ['veya', '∨ veya'], ['yada', '⊻ ya da']], deger: 've', degisti: (v) => { d.b1 = v; api.ciz(); } }), p('İkinci bağlaç (… ? r):'), Lab.segment({ secenekler: [['ve', '∧ ve'], ['veya', '∨ veya'], ['yada', '⊻ ya da']], deger: 'veya', degisti: (v) => { d.b2 = v; api.ciz(); } })]), Lab.kart('Sonuç', [sonuc])],
        ciz(ctx, W, H) {
          const y = d.yil;
          const pV = y % 4 === 0, qV = y % 100 !== 0, rV = y % 400 === 0;
          const ara = B[d.b1][0](pV, qV), son = B[d.b2][0](ara, rV);
          const dogru = (pV && qV) || rV;
          sonuc.innerHTML = `${y}: <b style="color:var(--${son ? 'turkuaz' : 'mercan'})">${son ? 'artık yıl' : 'artık yıl değil'}</b>` + (son !== dogru ? `<br><b style="color:var(--limon)">Dikkat:</b> doğru kural "${dogru ? 'artık yıl' : 'artık yıl değil'}" der. Bağlaç hatası!` : '');
          const s = Math.min(W / 800, H / 470);
          ctx.save(); ctx.translate(W / 2 - 400 * s, H / 2 - 235 * s); ctx.scale(s, s);
          const giris = [['p: 4\'e bölünür', pV, 70], ['q: 100\'e bölünmez', qV, 190], ['r: 400\'e bölünür', rV, 360]];
          giris.forEach(([ad, v, yy]) => {
            E.panel(ctx, 10, yy - 32, 220, 64, { renk: 'lacivert', kenar: v ? 'turkuaz' : 'sis', vurgu: v ? 'turkuaz' : null });
            E.yazi(ctx, ad, 26, yy - 8, { boyut: 18, hiza: 'left', agirlik: 650 });
            E.yazi(ctx, v ? 'DOĞRU (1)' : 'YANLIŞ (0)', 26, yy + 16, { boyut: 16, hiza: 'left', renk: v ? 'turkuaz' : 'mercan', agirlik: 700 });
          });
          const kapi = (x, yy, sem, v) => { E.panel(ctx, x - 48, yy - 48, 96, 96, { r: 48, renk: 'derin', kenar: v ? 'limon' : 'sis', kalinlik: 3 }); if (v) E.isik(ctx, x, yy, 90, 'limon', 0.35); E.formul(ctx, sem, x, yy, { boyut: 40, renk: v ? 'limon' : 'gumus' }); };
          const tel = (pts, v) => E.cizgi(ctx, pts, { renk: v ? 'turkuaz' : 'sis', kalinlik: 4, parilti: v ? 1 : 0 });
          tel([[230, 70], [300, 70], [300, 110], [352, 110]], pV); tel([[230, 190], [300, 190], [300, 150], [352, 150]], qV);
          kapi(400, 130, B[d.b1][1], ara);
          tel([[448, 130], [520, 130], [520, 230], [572, 230]], ara); tel([[230, 360], [520, 360], [520, 270], [572, 270]], rV);
          kapi(620, 250, B[d.b2][1], son);
          tel([[668, 250], [740, 250]], son);
          E.yazi(ctx, son ? '✓' : '✗', 752, 250, { boyut: 40, agirlik: 760, renk: son ? 'turkuaz' : 'mercan' });
          E.yazi(ctx, String(y), 380, 440, { boyut: 34, agirlik: 760 });
          ctx.restore();
        },
      };
    },
  };

  Lab.kur({ ad: T.labAd || 'Algoritma Laboratuvarı', tema: T.ad, temaNo: T.no, filmler: T.filmler, deneyler: [cizge, ikili, kapilar] });
})();
