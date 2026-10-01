/* Eksen · Veri Laboratuvarı — 6. Tema: İstatistiksel Araştırma Süreci
   Deneyler: Dağılım tezgâhı · Aynı ortalama · Yanıltıcı grafik */
(function () {
  'use strict';
  const E = window.E, Lab = window.Lab, T = window.EKSEN_TEMA;
  const { clamp, lerp } = E;
  const p = (h) => Lab.el('p', { html: h });
  const s1 = (v) => E.sayiYaz(v, 1);

  /* İstatistik (çeyrekler: ortanca dışarıda bırakılarak alt/üst yarıların ortancası) */
  const ortanca = (a) => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN; };
  const ozet = (a) => {
    const s = a.slice().sort((x, y) => x - y), n = s.length;
    const ort = s.reduce((t, x) => t + x, 0) / n;
    const alt = s.slice(0, Math.floor(n / 2)), ust = s.slice(Math.ceil(n / 2));
    const Q1 = ortanca(alt), Q3 = ortanca(ust), IQR = Q3 - Q1;
    const sd = Math.sqrt(s.reduce((t, x) => t + (x - ort) ** 2, 0) / (n - 1));
    const sayim = {}; s.forEach((x) => (sayim[x] = (sayim[x] || 0) + 1));
    const enCok = Math.max(...Object.values(sayim));
    const mod = enCok > 1 ? Object.keys(sayim).filter((k) => sayim[k] === enCok).map(Number) : [];
    const altSinir = Q1 - 1.5 * IQR, ustSinir = Q3 + 1.5 * IQR;
    const ic = s.filter((x) => x >= altSinir && x <= ustSinir);
    return { n, ort, med: ortanca(s), Q1, Q3, IQR, sd, mod, min: s[0], max: s[n - 1], acik: s[n - 1] - s[0], altUc: ic[0], ustUc: ic[ic.length - 1], aykiri: s.filter((x) => x < altSinir || x > ustSinir) };
  };
  const kutu = (ctx, z, px, y, h, renk) => {
    E.cizgi(ctx, [[px(z.altUc), y], [px(z.Q1), y]], { renk, kalinlik: 2.5 });
    E.cizgi(ctx, [[px(z.Q3), y], [px(z.ustUc), y]], { renk, kalinlik: 2.5 });
    for (const v of [z.altUc, z.ustUc]) E.cizgi(ctx, [[px(v), y - h * 0.3], [px(v), y + h * 0.3]], { renk, kalinlik: 2.5 });
    E.panel(ctx, px(z.Q1), y - h / 2, Math.max(2, px(z.Q3) - px(z.Q1)), h, { r: 6, renk, dolguAlfa: 0.18, kenar: renk, kalinlik: 2.5 });
    E.cizgi(ctx, [[px(z.med), y - h / 2], [px(z.med), y + h / 2]], { renk: 'limon', kalinlik: 3.5, parilti: 0.8 });
    for (const v of z.aykiri) E.nokta(ctx, px(v), y, 5, { renk: 'mercan', bos: true });
  };
  const eksen = (ctx, x0, x1, y, min, max, adim, b = 14) => {
    E.cizgi(ctx, [[x0, y], [x1, y]], { renk: 'cizgi', kalinlik: 2 });
    for (let v = min; v <= max + 1e-9; v += adim) { const x = lerp(x0, x1, (v - min) / (max - min)); E.cizgi(ctx, [[x, y - 5], [x, y + 5]], { renk: 'cizgi', kalinlik: 1.5 }); E.yazi(ctx, String(v), x, y + 16, { boyut: b, renk: 'gumus' }); }
  };

  /* ---------- 1. Dağılım tezgâhı ---------- */
  const BASLANGIC = [95, 110, 120, 125, 135, 140, 140, 150, 155, 160, 165, 170, 180, 185, 195, 210, 230, 245];
  const tezgah = {
    id: 'tezgah', ad: 'Dağılım tezgâhı',
    ipucu: 'Noktaları yatay sürükle. Boş bir yere dokunarak veri ekle; bir noktayı en sağa (> 400) sürükleyerek aykırı değer yap.',
    kur(api) {
      const d = { veri: BASLANGIC.slice(), genis: 30 };
      const gos = Lab.gosterge([['n', 'Veri sayısı'], ['ort', 'Aritmetik ortalama'], ['med', 'Ortanca'], ['mod', 'Tepe değer'], ['acik', 'Açıklık'], ['iqr', 'Çeyrekler açıklığı'], ['q', 'Q1 · Q3'], ['sd', 'Standart sapma']]);
      const min = 0, max = 420;
      const geo = () => { const W = api.W, H = api.H; return { x0: 30, x1: W - 30, yN: H * 0.3, yH: H * 0.68, yK: H * 0.86 }; };
      const px = (v) => { const g = geo(); return lerp(g.x0, g.x1, (v - min) / (max - min)); };
      const mx = (x) => { const g = geo(); return min + ((x - g.x0) / (g.x1 - g.x0)) * (max - min); };
      // nokta grafiğinde yığılma konumları
      const yigin = () => { const s = d.veri.map((v, i) => [Math.round(v / 5) * 5, i]).sort((a, b) => a[0] - b[0]); const k = {}; const pos = []; s.forEach(([v, i]) => { k[v] = (k[v] || 0) + 1; pos[i] = k[v] - 1; }); return pos; };
      const noktalar = () => { const g = geo(), pos = yigin(); return d.veri.map((v, i) => [px(Math.round(v / 5) * 5), g.yN - 9 - pos[i] * 15]); };
      let surukle = -1, bas = null, tasindi = false;
      const guncelle = () => {
        const z = ozet(d.veri);
        gos.yaz('n', String(z.n)); gos.yaz('ort', s1(z.ort)); gos.yaz('med', s1(z.med)); gos.yaz('mod', z.mod.length ? z.mod.join(', ') : 'yok');
        gos.yaz('acik', s1(z.acik)); gos.yaz('iqr', s1(z.IQR)); gos.yaz('q', `${s1(z.Q1)} · ${s1(z.Q3)}`); gos.yaz('sd', s1(z.sd));
      };
      guncelle();
      return {
        panel: [
          Lab.kart('Değişken', [p('9. sınıf öğrencilerinin <b>günlük ekran süresi</b> (dakika). Her nokta bir öğrenci.')]),
          Lab.kart('Histogram sınıf genişliği', [Lab.kaydirici({ ad: 'h', min: 10, max: 100, adim: 5, deger: d.genis, bicim: (v) => v + ' dk', degisti: (v) => { d.genis = v; api.ciz(); } })]),
          Lab.kart('Özet ölçüler', [gos, p('<span style="color:var(--mercan)">●</span> ortalama · <span style="color:var(--limon)">●</span> ortanca. Standart sapma: veriler ortalamadan tipik olarak ne kadar uzakta?')]),
          Lab.kart('', [Lab.el('div', { sinif: 'satir' }, [Lab.dugme('Başa al', () => { d.veri = BASLANGIC.slice(); guncelle(); api.ciz(); }), Lab.dugme('Aykırı ekle (410)', () => { d.veri.push(410); guncelle(); api.ciz(); }), Lab.dugme('Son veriyi sil', () => { if (d.veri.length > 3) d.veri.pop(); guncelle(); api.ciz(); })])]),
        ],
        basildi(x, y) { bas = [x, y]; tasindi = false; surukle = Lab.enYakin(noktalar(), x, y, 18); },
        suruklendi(x) { if (Math.abs(x - bas[0]) > 4) tasindi = true; if (surukle >= 0 && tasindi) { d.veri[surukle] = clamp(Math.round(mx(x)), min, max); guncelle(); } },
        birakildi() { if (!tasindi && surukle < 0 && bas[1] < geo().yN + 20) { d.veri.push(clamp(Math.round(mx(bas[0])), min, max)); guncelle(); } surukle = -1; },
        uzerinde(x, y) { return Lab.enYakin(noktalar(), x, y, 18) >= 0; },
        ciz(ctx, W, H) {
          const g = geo(), z = ozet(d.veri);
          E.yazi(ctx, 'Nokta grafiği', g.x0, 22, { boyut: 15, hiza: 'left', renk: 'gumus', agirlik: 650 });
          eksen(ctx, g.x0, g.x1, g.yN, min, max, W < 520 ? 100 : 50);
          noktalar().forEach(([x, y], i) => E.nokta(ctx, x, y, 6.5, { renk: i === surukle ? 'limon' : 'turkuaz', parilti: 0.4 }));
          const solda = z.ort < z.med;
          for (const [v, r, ad, sol] of [[z.ort, 'mercan', 'ortalama', solda], [z.med, 'limon', 'ortanca', !solda]]) { E.cizgi(ctx, [[px(v), g.yN - 120], [px(v), g.yN]], { renk: r, kalinlik: 2, kesik: [5, 5] }); E.yazi(ctx, ad, px(v) + (sol ? -6 : 6), g.yN - 124, { boyut: 13, renk: r, agirlik: 700, hiza: sol ? 'right' : 'left' }); }
          // histogram
          E.yazi(ctx, 'Histogram', g.x0, g.yN + 44, { boyut: 15, hiza: 'left', renk: 'gumus', agirlik: 650 });
          const kutular = {}; d.veri.forEach((v) => { const k = Math.floor(v / d.genis); kutular[k] = (kutular[k] || 0) + 1; });
          const enC = Math.max(...Object.values(kutular)), hMax = g.yH - g.yN - 70;
          for (const [k, c] of Object.entries(kutular)) {
            const a = +k * d.genis, b = a + d.genis, h = (c / enC) * hMax;
            E.panel(ctx, px(a) + 1, g.yH - h, px(Math.min(b, max)) - px(a) - 2, h, { r: 3, renk: 'menekse', dolguAlfa: 0.45, kenar: 'menekse', kalinlik: 1.5 });
            if (px(b) - px(a) > 18) E.yazi(ctx, String(c), (px(a) + px(Math.min(b, max))) / 2, g.yH - h - 10, { boyut: 12, renk: 'gumus' });
          }
          E.cizgi(ctx, [[g.x0, g.yH], [g.x1, g.yH]], { renk: 'cizgi', kalinlik: 2 });
          // kutu grafiği
          kutu(ctx, z, px, g.yK, 30, 'gok');
          E.yazi(ctx, 'Kutu grafiği', g.x0, g.yK - 30, { boyut: 15, hiza: 'left', renk: 'gumus', agirlik: 650 });
        },
      };
    },
  };

  /* ---------- 2. Aynı ortalama ---------- */
  const ayni = {
    id: 'ayni', ad: 'Aynı ortalama',
    ipucu: 'İki otobüs hattının ortalama bekleme süresi aynı: 10 dakika. B hattının yayılımını değiştir; ortalama kımıldamaz, standart sapma ve kutu grafiği değişir.',
    kur(api) {
      const A = [8, 9, 9, 10, 10, 10, 10, 11, 11, 12];
      const B0 = [1, 3, 5, 6, 9, 11, 14, 15, 16, 20];
      const d = { yay: 1 };
      const B = () => B0.map((v) => Math.round((10 + (v - 10) * d.yay) * 10) / 10);
      const gos = Lab.gosterge([['oA', 'A ortalama'], ['oB', 'B ortalama'], ['sA', 'A standart sapma'], ['sB', 'B standart sapma'], ['iA', 'A çeyrekler açıklığı'], ['iB', 'B çeyrekler açıklığı']]);
      return {
        panel: [Lab.kart('B hattının yayılımı', [Lab.kaydirici({ ad: '×', min: 0, max: 1.4, adim: 0.05, deger: 1, bicim: (v) => s1(v), degisti: (v) => { d.yay = v; api.ciz(); } })]), Lab.kart('Karşılaştır', [gos]), Lab.kart('Karar', [p('Düzenli varış istiyorsan küçük yayılımlı hattı seç. <b>Ortalama tek başına hikâyenin yarısıdır.</b>')])],
        ciz(ctx, W, H) {
          const b = B(), zA = ozet(A), zB = ozet(b);
          gos.yaz('oA', s1(zA.ort) + ' dk'); gos.yaz('oB', s1(zB.ort) + ' dk'); gos.yaz('sA', s1(zA.sd)); gos.yaz('sB', s1(zB.sd)); gos.yaz('iA', s1(zA.IQR)); gos.yaz('iB', s1(zB.IQR));
          const x0 = 40, x1 = W - 30, px = (v) => lerp(x0, x1, v / 30);
          const sat = (veri, z, y, ad, renk) => {
            E.yazi(ctx, ad, x0, y - 70, { boyut: 18, hiza: 'left', agirlik: 760, renk });
            eksen(ctx, x0, x1, y, 0, 30, 5);
            const k = {}; veri.forEach((v) => { const r = Math.round(v); k[r] = (k[r] || 0) + 1; E.nokta(ctx, px(v), y - 10 - (k[r] - 1) * 13, 5.5, { renk, parilti: 0.4 }); });
            kutu(ctx, z, px, y + 46, 24, renk);
            E.cizgi(ctx, [[px(z.ort), y - 60], [px(z.ort), y + 60]], { renk: 'mercan', kalinlik: 2, kesik: [4, 4] });
          };
          sat(A, zA, H * 0.3, 'A hattı', 'turkuaz');
          sat(b, zB, H * 0.74, 'B hattı', 'menekse');
        },
      };
    },
  };

  /* ---------- 3. Yanıltıcı grafik ---------- */
  const yaniltici = {
    id: 'yaniltici', ad: 'Yanıltıcı grafik',
    ipucu: 'Dikey eksenin başladığı değeri değiştir. Veri aynı kalır, ama sütunların görünen oranı değişir: "kamerayı geri çek!"',
    kur(api) {
      const d = { bas: 48, v1: 49, v2: 51 };
      const bilgi = p('');
      return {
        panel: [
          Lab.kart('Veri (ortalama hız, km/sa)', [Lab.kaydirici({ ad: 'Önce', min: 30, max: 70, adim: 1, deger: d.v1, degisti: (v) => { d.v1 = v; api.ciz(); } }), Lab.kaydirici({ ad: 'Sonra', min: 30, max: 70, adim: 1, deger: d.v2, degisti: (v) => { d.v2 = v; api.ciz(); } })]),
          Lab.kart('Eksen başlangıcı', [Lab.kaydirici({ ad: 'y₀', min: 0, max: 48, adim: 1, deger: d.bas, degisti: (v) => { d.bas = v; api.ciz(); } })]),
          Lab.kart('Gerçek mi, görüntü mü?', [bilgi]),
        ],
        ciz(ctx, W, H) {
          const lo = Math.min(d.bas, Math.min(d.v1, d.v2) - 1), hi = Math.max(d.v1, d.v2) + 4;
          const y0 = H - 50, yt = 40, py = (v) => lerp(y0, yt, (v - lo) / (hi - lo));
          const x0 = W * 0.18;
          E.cizgi(ctx, [[x0, y0], [x0, yt - 10]], { renk: 'cizgi', kalinlik: 2 });
          E.cizgi(ctx, [[x0, y0], [W - 30, y0]], { renk: 'cizgi', kalinlik: 2 });
          const adim = hi - lo > 30 ? 10 : hi - lo > 10 ? 2 : 1;
          for (let v = Math.ceil(lo / adim) * adim; v <= hi; v += adim) { E.cizgi(ctx, [[x0 - 5, py(v)], [x0, py(v)]], { renk: 'cizgi', kalinlik: 1.5 }); E.yazi(ctx, String(v), x0 - 10, py(v), { boyut: 14, hiza: 'right', renk: 'gumus' }); }
          if (lo > 0) { E.yazi(ctx, '≈', x0, y0 - 14, { boyut: 20, renk: 'mercan', agirlik: 700 }); }
          const bw = Math.min(140, W * 0.18);
          [[d.v1, 'Önce', 'gumus'], [d.v2, 'Sonra', 'mercan']].forEach(([v, ad, r], i) => {
            const x = x0 + (W - x0) * (0.32 + i * 0.36) - bw / 2;
            E.panel(ctx, x, py(v), bw, y0 - py(v), { r: 6, renk: r, dolguAlfa: 0.6, kenar: r });
            E.yazi(ctx, String(v), x + bw / 2, py(v) - 16, { boyut: 18, agirlik: 760 });
            E.yazi(ctx, ad, x + bw / 2, y0 + 20, { boyut: 15, renk: 'gumus' });
          });
          const gorunen = (d.v2 - lo) / Math.max(0.001, d.v1 - lo), gercek = d.v2 / d.v1;
          bilgi.innerHTML = `Görünen oran: <b style="color:var(--mercan)">${s1(gorunen)} kat</b><br>Gerçek oran: <b style="color:var(--turkuaz)">${E.sayiYaz(gercek, 2)} kat</b> (%${s1((gercek - 1) * 100)} değişim)<br>${d.bas > 0 ? 'Eksen 0\'dan başlamıyor: fark büyük görünüyor.' : 'Eksen 0\'dan başlıyor: görüntü veriyle tutarlı.'}`;
        },
      };
    },
  };

  Lab.kur({ ad: T.labAd || 'Veri Laboratuvarı', tema: T.ad, temaNo: T.no, filmler: T.filmler, deneyler: [tezgah, ayni, yaniltici] });
})();
