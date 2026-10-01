/* Eksen · Olasılık Laboratuvarı — 7. Tema: Veriden Olasılığa
   Deneyler: Deney makinesi · Örnek uzay · Ağaç şeması */
(function () {
  'use strict';
  const E = window.E, Lab = window.Lab, T = window.EKSEN_TEMA;
  const { clamp, lerp } = E;
  const p = (h) => Lab.el('p', { html: h });
  const s3 = (v) => E.sayiYaz(v, 3);
  const zar = (r) => 1 + Math.floor(r() * 6);

  const DENEYLER = {
    zar2: { ad: 'İki zar: toplam', ciktilar: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], teorik: (k) => (6 - Math.abs(k - 7)) / 36, at: (r) => zar(r) + zar(r), olay: 7, olayAd: (k) => `toplam = ${k}` },
    para3: { ad: 'Üç para: tura sayısı', ciktilar: [0, 1, 2, 3], teorik: (k) => [1, 3, 3, 1][k] / 8, at: (r) => (r() < 0.5) + (r() < 0.5) + (r() < 0.5), olay: 2, olayAd: (k) => `${k} tura` },
    zar1: { ad: 'Tek zar', ciktilar: [1, 2, 3, 4, 5, 6], teorik: () => 1 / 6, at: (r) => zar(r), olay: 6, olayAd: (k) => `${k} gelmesi` },
  };

  /* ---------- 1. Deney makinesi ---------- */
  const makine = {
    id: 'makine', ad: 'Deney makinesi',
    ipucu: 'Deneyi 10, 100, 10 000 kez tekrarla. Sütunlar teorik olasılığın hayaletine yerleşir; alttaki eğri gürültünün nasıl söndüğünü gösterir.',
    kur(api) {
      const d = { tur: 'zar2', n: 0, sayim: {}, gecmis: [], olay: 7, akis: false, tohum: (Math.random() * 1e9) | 0, huni: false };
      let r = E.rng(d.tohum);
      const D = () => DENEYLER[d.tur];
      const gos = Lab.gosterge([['n', 'Deneme sayısı'], ['f', 'Olayın sıklığı'], ['g', 'Göreli sıklık'], ['t', 'Teorik olasılık']]);
      const ekle = (k) => {
        for (let i = 0; i < k; i++) {
          const c = D().at(r); d.sayim[c] = (d.sayim[c] || 0) + 1; d.n++;
          const lg = Math.log10(d.n);
          if (d.n <= 20 || Math.floor(lg * 40) !== Math.floor(Math.log10(d.n - 1) * 40)) d.gecmis.push([d.n, (d.sayim[d.olay] || 0) / d.n]);
        }
        yaz(); api.ciz();
      };
      const sifirla = () => { d.n = 0; d.sayim = {}; d.gecmis = []; d.tohum = (Math.random() * 1e9) | 0; r = E.rng(d.tohum); yaz(); api.ciz(); };
      const yaz = () => { const f = d.sayim[d.olay] || 0; gos.yaz('n', d.n.toLocaleString('tr-TR')); gos.yaz('f', f.toLocaleString('tr-TR')); gos.yaz('g', d.n ? s3(f / d.n) : '–'); gos.yaz('t', s3(D().teorik(d.olay))); };
      const olaySeg = Lab.el('div');
      const olayKur = () => { olaySeg.innerHTML = ''; olaySeg.appendChild(Lab.segment({ secenekler: D().ciktilar.map((k) => [k, String(k)]), deger: d.olay, degisti: (v) => { d.olay = v; d.gecmis = []; sifirla(); } })); };
      olayKur(); yaz();
      setTimeout(() => ekle(20), 0);
      let akisZ = null;
      const akisDugme = Lab.dugme('▶ Sürekli', () => { d.akis = !d.akis; akisDugme.textContent = d.akis ? '❚❚ Durdur' : '▶ Sürekli'; if (d.akis) { const f = () => { if (!d.akis) return; ekle(Math.max(5, Math.floor(d.n / 30))); akisZ = setTimeout(f, 60); }; f(); } else clearTimeout(akisZ); });
      return {
        durdur() { d.akis = false; clearTimeout(akisZ); },
        panel: [
          Lab.kart('Deney', [Lab.segment({ secenekler: Object.entries(DENEYLER).map(([k, v]) => [k, v.ad]), deger: d.tur, degisti: (v) => { d.tur = v; d.olay = DENEYLER[v].olay; olayKur(); sifirla(); } })]),
          Lab.kart('İzlenen olay', [olaySeg]),
          Lab.kart('Tekrarla', [Lab.el('div', { sinif: 'satir' }, [Lab.dugme('+1', () => ekle(1)), Lab.dugme('+10', () => ekle(10)), Lab.dugme('+100', () => ekle(100)), Lab.dugme('+1000', () => ekle(1000), true), Lab.dugme('+10 000', () => ekle(10000))]), Lab.el('div', { sinif: 'satir', style: 'margin-top:8px' }, [akisDugme, Lab.dugme('Sıfırla', sifirla)])]),
          Lab.kart('Sonuç', [gos, p('Deneme sayısı arttıkça göreli sıklığın değişkenliği azalır ve teorik olasılığa yaklaşır (büyük sayılar yasası).')]),
        ],
        ciz(ctx, W, H) {
          const C = D().ciktilar, x0 = 46, x1 = W - 20, yAlt = H * 0.52, yUst = 34;
          const enY = Math.max(...C.map((k) => D().teorik(k))) * 1.6;
          const py = (v) => lerp(yAlt, yUst, v / enY);
          const bw = (x1 - x0) / C.length;
          E.cizgi(ctx, [[x0, yAlt], [x1, yAlt]], { renk: 'cizgi', kalinlik: 2 });
          for (let v = 0; v <= enY; v += enY > 0.4 ? 0.1 : 0.05) { E.yazi(ctx, s3(v).replace(/0+$/, '').replace(/,$/, ''), x0 - 8, py(v), { boyut: 12, hiza: 'right', renk: 'gumus' }); E.cizgi(ctx, [[x0, py(v)], [x1, py(v)]], { renk: 'sis', kalinlik: 1, alfa: 0.5 }); }
          C.forEach((k, i) => {
            const x = x0 + i * bw + bw * 0.14, w = bw * 0.72;
            const g = d.n ? (d.sayim[k] || 0) / d.n : 0, t = D().teorik(k);
            E.panel(ctx, x, py(Math.min(g, enY)), w, yAlt - py(Math.min(g, enY)), { r: 4, renk: k === d.olay ? 'limon' : 'turkuaz', dolguAlfa: k === d.olay ? 0.75 : 0.5, kenar: null });
            E.cizgi(ctx, [[x - 3, py(t)], [x + w + 3, py(t)]], { renk: 'mercan', kalinlik: 2.5, kesik: [5, 4] });
            E.yazi(ctx, String(k), x + w / 2, yAlt + 14, { boyut: 13, renk: 'gumus' });
          });
          E.yazi(ctx, '— — teorik', x1, 18, { boyut: 13, hiza: 'right', renk: 'mercan', agirlik: 700 });
          // yakınsama eğrisi (log x)
          const gy0 = H - 34, gy1 = yAlt + 66, gx0 = x0, gx1 = x1, nmax = Math.max(100, d.n);
          const t = D().teorik(d.olay);
          const lo = Math.max(0, t - 0.25), hi = Math.min(1, t + 0.25);
          const gpy = (v) => lerp(gy0, gy1, (clamp(v, lo, hi) - lo) / (hi - lo)), gpx = (n) => lerp(gx0, gx1, Math.log10(n) / Math.log10(nmax));
          E.cizgi(ctx, [[gx0, gy0], [gx1, gy0]], { renk: 'cizgi', kalinlik: 1.5 });
          E.cizgi(ctx, [[gx0, gpy(t)], [gx1, gpy(t)]], { renk: 'mercan', kalinlik: 2, kesik: [6, 5] });
          for (let n = 1; n <= nmax; n *= 10) E.yazi(ctx, n.toLocaleString('tr-TR'), gpx(n), gy0 + 13, { boyut: 12, renk: 'gumus' });
          if (d.gecmis.length > 1) E.cizgi(ctx, d.gecmis.map(([n, v]) => [gpx(n), gpy(v)]), { renk: 'limon', kalinlik: 2.5, parilti: 0.6 });
          E.yazi(ctx, `"${D().olayAd(d.olay)}" göreli sıklığı · deneme sayısı (log ölçek)`, gx0, gy1 - 16, { boyut: 13, hiza: 'left', renk: 'gumus' });
        },
      };
    },
  };

  /* ---------- 2. Örnek uzay (iki zar) ---------- */
  const OLAYLAR = {
    t7: ['Toplam 7', (a, b) => a + b === 7], t11: ['Toplam 11', (a, b) => a + b === 11], cift: ['Toplam çift', (a, b) => (a + b) % 2 === 0],
    bir6: ['En az biri 6', (a, b) => a === 6 || b === 6], t10: ['Toplam ≥ 10', (a, b) => a + b >= 10], ayni: ['İki zar aynı', (a, b) => a === b],
  };
  const uzay = {
    id: 'uzay', ad: 'Örnek uzay',
    ipucu: 'A ve B olaylarını seç. Ortak hücreler iki kez sayılmasın diye çıkarılır: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).',
    kur(api) {
      const d = { A: 't7', B: 'bir6' };
      const f = Lab.formulKanvas('', { boyut: 22 }), f2 = Lab.formulKanvas('', { boyut: 22 }), ayrik = p('');
      const yaz = () => {
        let a = 0, b = 0, ab = 0;
        for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) { const x = OLAYLAR[d.A][1](i, j), y = OLAYLAR[d.B][1](i, j); a += x; b += y; ab += x && y; }
        f.yaz(`P(A) = \\frac{${a}}{36}, \\; P(B) = \\frac{${b}}{36}, \\; P(A ∩ B) = \\frac{${ab}}{36}`);
        f2.yaz(`P(A ∪ B) = \\frac{${a} + ${b} − ${ab}}{36} = \\frac{${a + b - ab}}{36}`, { renk: 'limon' });
        ayrik.innerHTML = ab === 0 ? '<b style="color:var(--turkuaz)">A ve B ayrık:</b> ortak çıktı yok, olasılıklar doğrudan toplanır.' : '<b style="color:var(--mercan)">A ve B ayrık değil:</b> ' + ab + ' hücre iki olayda da var.';
        api.ciz();
      };
      const sec = (k) => Lab.segment({ secenekler: Object.entries(OLAYLAR).map(([key, v]) => [key, v[0]]), deger: d[k], degisti: (v) => { d[k] = v; yaz(); } });
      yaz();
      return {
        panel: [Lab.kart('A olayı (turkuaz)', [sec('A')]), Lab.kart('B olayı (mercan)', [sec('B')]), Lab.kart('Hesap', [f, f2, ayrik])],
        ciz(ctx, W, H) {
          const h = Math.min((W - 80) / 6.4, (H - 70) / 6.6), x0 = (W - h * 6) / 2 + 14, y0 = (H - h * 6) / 2 + 10;
          for (let i = 1; i <= 6; i++) {
            E.yazi(ctx, String(i), x0 + (i - 0.5) * h, y0 - 16, { boyut: 15, renk: 'gumus', agirlik: 700 });
            E.yazi(ctx, String(i), x0 - 18, y0 + (i - 0.5) * h, { boyut: 15, renk: 'gumus', agirlik: 700 });
            for (let j = 1; j <= 6; j++) {
              const x = x0 + (j - 1) * h, y = y0 + (i - 1) * h;
              const a = OLAYLAR[d.A][1](i, j), b = OLAYLAR[d.B][1](i, j);
              const renk = a && b ? 'limon' : a ? 'turkuaz' : b ? 'mercan' : 'derin';
              E.panel(ctx, x + 3, y + 3, h - 6, h - 6, { r: 8, renk, dolguAlfa: a || b ? 0.5 : 0.6, kenar: a || b ? renk : 'sis' });
              E.yazi(ctx, `${i},${j}`, x + h / 2, y + h / 2, { boyut: Math.max(12, h * 0.22), agirlik: 650, renk: a || b ? 'tebesir' : 'gumus' });
            }
          }
          E.yazi(ctx, '1. zar ↓   2. zar →', x0 - 30, y0 - 38, { boyut: 13, hiza: 'left', renk: 'gumus' });
        },
      };
    },
  };

  /* ---------- 3. Ağaç şeması (üç para) ---------- */
  const agac = {
    id: 'agac', ad: 'Ağaç şeması',
    ipucu: 'Üç para atıldığında 2 × 2 × 2 = 8 eş olasılıklı çıktı var. Bir olay seç; dallar ışıkla yanar.',
    kur(api) {
      const d = { k: 2, tur: 'tam' };
      const sonuc = p('');
      const sagla = (yol) => { const t = [...yol].filter((c) => c === 'T').length; return d.tur === 'tam' ? t === d.k : d.tur === 'enaz' ? t >= d.k : t <= d.k; };
      const yaz = () => { let n = 0; for (let m = 0; m < 8; m++) { const y = [0, 1, 2].map((b) => ((m >> (2 - b)) & 1 ? 'T' : 'Y')).join(''); if (sagla(y)) n++; } sonuc.innerHTML = `P = <b style="color:var(--limon)">${n}/8 = ${E.sayiYaz(n / 8, 3)}</b>`; api.ciz(); };
      yaz();
      return {
        panel: [Lab.kart('Olay', [Lab.segment({ secenekler: [['tam', 'tam'], ['enaz', 'en az'], ['encok', 'en çok']], deger: d.tur, degisti: (v) => { d.tur = v; yaz(); } }), Lab.kaydirici({ ad: 'k', min: 0, max: 3, adim: 1, deger: d.k, bicim: (v) => v + ' tura', degisti: (v) => { d.k = v; yaz(); } }), sonuc]),
          Lab.kart('Not', [p('T = tura, Y = yazı. Ağaç şemasını ilk kullananlardan biri olarak 9. yüzyıl bilgini <b>Kindî</b> anılır.')])],
        ciz(ctx, W, H) {
          const sut = [W * 0.08, W * 0.3, W * 0.52, W * 0.74];
          const yk = (seviye, i) => (H * (i + 0.5)) / Math.pow(2, seviye);
          const dugum = (sev, i, ad, yanik) => { E.nokta(ctx, sut[sev], yk(sev, i), 15, { renk: yanik ? 'limon' : 'derin', parilti: yanik ? 1 : 0 }); E.yazi(ctx, ad, sut[sev], yk(sev, i), { boyut: 15, agirlik: 760, renk: yanik ? 'gece' : 'tebesir' }); };
          for (let sev = 0; sev < 3; sev++) for (let i = 0; i < Math.pow(2, sev); i++) for (const c of [0, 1]) {
            const j = i * 2 + c;
            const yanik = [...Array(8).keys()].some((m) => (m >> (2 - sev)) === j && sagla([0, 1, 2].map((b) => ((m >> (2 - b)) & 1 ? 'T' : 'Y')).join('')));
            E.cizgi(ctx, [[sut[sev], yk(sev, i)], [sut[sev + 1], yk(sev + 1, j)]], { renk: yanik ? 'limon' : 'sis', kalinlik: yanik ? 3.5 : 2, parilti: yanik ? 0.8 : 0 });
          }
          dugum(0, 0, '•', true);
          for (let sev = 1; sev <= 3; sev++) for (let j = 0; j < Math.pow(2, sev); j++) {
            const ad = j & 1 ? 'T' : 'Y';
            const yanik = [...Array(8).keys()].some((m) => (m >> (3 - sev)) === j && sagla([0, 1, 2].map((b) => ((m >> (2 - b)) & 1 ? 'T' : 'Y')).join('')));
            dugum(sev, j, ad, yanik);
          }
          for (let m = 0; m < 8; m++) { const y = [0, 1, 2].map((b) => ((m >> (2 - b)) & 1 ? 'T' : 'Y')).join(''); E.yazi(ctx, y, W * 0.84, yk(3, m), { boyut: 16, hiza: 'left', agirlik: 700, renk: sagla(y) ? 'limon' : 'gumus' }); }
        },
      };
    },
  };

  Lab.kur({ ad: T.labAd || 'Olasılık Laboratuvarı', tema: T.ad, temaNo: T.no, filmler: T.filmler, deneyler: [makine, uzay, agac] });
})();
