/* Eksen · Sayılar Laboratuvarı — 1. Tema: Sayılar
   Deneyler: Üs merdiveni · Aralık tezgâhı · Sayı doğrusu mikroskobu */
(function () {
  'use strict';
  const E = window.E, Lab = window.Lab, T = window.EKSEN_TEMA;
  const { clamp, lerp } = E;
  const sy = (v, b = 3) => E.sayiYaz(v, b);
  const ustYaz = (k) => (k < 0 ? '−' + -k : String(k));

  /* ---------------- 1. Üs merdiveni ---------------- */
  const merdiven = {
    id: 'us', ad: 'Üs merdiveni',
    ipucu: 'Merdivende üs, kaç basamak çıktığını sayar. Yarım basamak karekök demektir.',
    kur(api) {
      const d = { taban: 2, m: 3, n: 2, payda: 2 };
      const kesir = (k) => {
        const p = d.payda, s = Math.round(k * p);
        if (s % p === 0) return ustYaz(s / p);
        const g = (a, b) => (b ? g(b, a % b) : a); const ob = g(Math.abs(s), p);
        return `${s < 0 ? '−' : ''}${Math.abs(s) / ob}/${p / ob}`;
      };
      const fTaban = Lab.formulKanvas('', { boyut: 26 }), fSonuc = Lab.formulKanvas('', { boyut: 26 });
      const gos = Lab.gosterge([['deger', 'Sonuç (ondalık)'], ['adim', 'Toplam adım']]);
      const panelGuncelle = () => {
        const a = d.taban, m = d.m, n = d.n, top = m + n;
        fTaban.yaz(`${sy(a)}^{${kesir(m)}} · ${sy(a)}^{${kesir(n)}} = ${sy(a)}^{${kesir(top)}}`);
        const p = d.payda, s = Math.round(top * p);
        let kokForm = '';
        if (s % p !== 0) {
          const g = (x, y) => (y ? g(y, x % y) : x); const ob = g(Math.abs(s), p);
          const pay = s / ob, pd = p / ob;
          kokForm = pd === 2 ? `= \\sqrt{${sy(a)}^{${ustYaz(pay)}}}` : `= \\sqrt[${pd}]{${sy(a)}^{${ustYaz(pay)}}}`;
        }
        fSonuc.yaz(`${sy(a)}^{${kesir(top)}} ${kokForm}`, { renk: 'limon' });
        gos.yaz('deger', sy(Math.pow(a, top), 4));
        gos.yaz('adim', kesir(top));
      };
      const kTaban = Lab.kaydirici({ ad: 'a', min: 1.5, max: 10, adim: 0.5, deger: d.taban, degisti: (v) => { d.taban = v; panelGuncelle(); api.ciz(); } });
      const yuvarla = (v) => Math.round(v * d.payda) / d.payda;
      const kM = Lab.kaydirici({ ad: 'm', min: -3, max: 4, adim: 0.25, deger: d.m, bicim: (v) => kesir(yuvarla(v)), degisti: (v) => { d.m = yuvarla(v); panelGuncelle(); api.ciz(); } });
      const kN = Lab.kaydirici({ ad: 'n', min: -3, max: 4, adim: 0.25, deger: d.n, bicim: (v) => kesir(yuvarla(v)), degisti: (v) => { d.n = yuvarla(v); panelGuncelle(); api.ciz(); } });
      const seg = Lab.segment({ secenekler: [[1, 'tam adım'], [2, '1/2 adım'], [3, '1/3 adım'], [4, '1/4 adım']], deger: 2, degisti: (v) => { d.payda = v; d.m = yuvarla(d.m); d.n = yuvarla(d.n); kM.ayarla(d.m); kN.ayarla(d.n); panelGuncelle(); api.ciz(); } });
      panelGuncelle();
      return {
        panel: [
          Lab.kart('Taban ve adımlar', [kTaban, el('p', 'İlk adım (turkuaz):'), kM, el('p', 'İkinci adım (mercan):'), kN, el('p', 'Adım inceliği:'), seg]),
          Lab.kart('Kural', [fTaban, fSonuc, gos]),
          Lab.kart('Dene', [el('p', '<b>a = 2</b>, m = 1/2, n = 1/2 yap: iki yarım adım bir tam adım eder, yani √2 · √2 = 2.'), el('p', 'Negatif adım <b>bölme</b> demektir: m = 3, n = −1 → a³ : a¹ = a².'), el('p', '<b>a = 10</b> ile bilimsel gösterimi dene: her basamak 10 kat.')]),
        ],
        ciz(ctx, W, H) {
          const a = d.taban;
          const kmin = -3, kmax = 6;
          const mx = W * 0.3, ust = 34, alt = H - 34;
          const ara = (alt - ust) / (kmax - kmin);
          const yk = (k) => alt - (k - kmin) * ara;
          for (const dx of [-26, 26]) E.cizgi(ctx, [[mx + dx, ust - 10], [mx + dx, alt + 10]], { renk: 'cizgi', kalinlik: 3 });
          const b = Math.min(24, Math.max(15, ara * 0.42));
          for (let k = kmin; k <= kmax; k++) {
            E.cizgi(ctx, [[mx - 26, yk(k)], [mx + 26, yk(k)]], { renk: 'turkuaz', kalinlik: 3, parilti: 0.6 });
            E.formul(ctx, `${sy(a)}^{${ustYaz(k)}}`, mx - 40, yk(k), { boyut: b, hiza: 'right', renk: 'gumus' });
            E.yazi(ctx, sy(Math.pow(a, k), 4), mx + 40, yk(k), { boyut: b, hiza: 'left', agirlik: 560 });
          }
          // ara basamaklar
          if (d.payda > 1) for (let k = kmin; k < kmax; k++) for (let j = 1; j < d.payda; j++) {
            const y = yk(k + j / d.payda);
            E.cizgi(ctx, [[mx - 20, y], [mx + 20, y]], { renk: 'menekse', kalinlik: 1.5, kesik: [4, 4], alfa: 0.7 });
          }
          // adımlar
          const m = clamp(d.m, kmin, kmax), son = clamp(d.m + d.n, kmin, kmax);
          const bx = mx - Math.min(W * 0.2, 140);
          E.cizgi(ctx, [[mx, yk(0)], [mx, yk(m)]], { renk: 'turkuaz', kalinlik: 7, parilti: 1.2 });
          E.cizgi(ctx, [[mx + 9, yk(m)], [mx + 9, yk(son)]], { renk: 'mercan', kalinlik: 7, parilti: 1.2 });
          E.nokta(ctx, mx, yk(0), 7, { renk: 'tebesir' });
          E.nokta(ctx, mx + 9, yk(son), 10, { renk: 'limon', parilti: 1.5 });
          // sağ tarafta anlatım
          const tx = Math.min(W - 20, mx + Math.max(200, W * 0.32));
          const sb = Math.max(18, Math.min(30, W * 0.03));
          E.yazi(ctx, 'Başlangıç: a⁰ = 1', tx, yk(0), { boyut: sb * 0.8, hiza: 'right', renk: 'gumus' });
          E.yazi(ctx, `≈ ${sy(Math.pow(a, d.m + d.n), 4)}`, tx, yk(son), { boyut: sb, hiza: 'right', renk: 'limon', agirlik: 700 });
          void bx;
        },
      };
    },
  };
  const el = (tag, html) => Lab.el(tag, { html });

  /* ---------------- 2. Aralık tezgâhı ---------------- */
  // Aralık listesi işlemleri: {a, b, sa, sb} (sa/sb: uç dahil mi)
  const normal = (L) => {
    L = L.filter((I) => I.a < I.b || (I.a === I.b && I.sa && I.sb)).map((I) => ({ ...I })).sort((x, y) => x.a - y.a || (y.sa - x.sa));
    const s = [];
    for (const I of L) {
      const o = s[s.length - 1];
      if (o && (I.a < o.b || (I.a === o.b && (o.sb || I.sa)))) {
        if (I.b > o.b) { o.b = I.b; o.sb = I.sb; } else if (I.b === o.b) o.sb = o.sb || I.sb;
      } else s.push(I);
    }
    return s;
  };
  const tumle = (L) => {
    L = normal(L); const s = []; let a = -Infinity, sa = false;
    for (const I of L) { s.push({ a, b: I.a, sa, sb: !I.sa }); a = I.b; sa = !I.sb; }
    s.push({ a, b: Infinity, sa, sb: false });
    return normal(s.filter((I) => !(I.a === -Infinity && I.b === -Infinity) && !(I.a === Infinity)));
  };
  const birlesim = (A, B) => normal(A.concat(B));
  const kesisim = (A, B) => tumle(birlesim(tumle(A), tumle(B)));
  const fark = (A, B) => kesisim(A, tumle(B));
  const yazAralik = (L) => {
    L = normal(L);
    if (!L.length) return '∅';
    return L.map((I) => {
      if (I.a === I.b) return `{${sy(I.a)}}`;
      const sol = I.a === -Infinity ? '(−∞' : `${I.sa ? '[' : '('}${sy(I.a)}`;
      const sag = I.b === Infinity ? '∞)' : `${sy(I.b)}${I.sb ? ']' : ')'}`;
      return `${sol}, ${sag}`;
    }).join(' ∪ ');
  };
  const yazEsitsizlik = (L) => {
    L = normal(L);
    if (!L.length) return 'çözüm yok';
    return L.map((I) => {
      if (I.a === I.b) return `x = ${sy(I.a)}`;
      if (I.a === -Infinity && I.b === Infinity) return 'x ∈ ℝ';
      if (I.a === -Infinity) return `x ${I.sb ? '≤' : '<'} ${sy(I.b)}`;
      if (I.b === Infinity) return `x ${I.sa ? '≥' : '>'} ${sy(I.a)}`;
      return `${sy(I.a)} ${I.sa ? '≤' : '<'} x ${I.sb ? '≤' : '<'} ${sy(I.b)}`;
    }).join('  veya  ');
  };
  const tezgah = {
    id: 'aralik', ad: 'Aralık tezgâhı',
    ipucu: 'Uçları sürükle. Bir uca dokunursan açık ↔ kapalı olur.',
    kur(api) {
      const d = {
        A: { a: -2, b: 4, sa: true, sb: false },
        B: { a: 1, b: 6, sa: false, sb: true },
        islem: 'birlesim', mod: 'iki', m: 5, r: 3, esit: false,
      };
      const sonucYazi = Lab.el('p', { html: '' }), esitYazi = Lab.el('p', { html: '' });
      const guncelle = () => {
        const R = sonuc();
        sonucYazi.innerHTML = `<b>${baslik()}</b> = <b style="color:var(--limon)">${yazAralik(R)}</b>`;
        esitYazi.innerHTML = yazEsitsizlik(R);
        api.ciz();
      };
      const baslik = () => d.mod === 'mutlak' ? `|x − ${sy(d.m)}| ${d.esit ? '≤' : '<'} ${sy(d.r)}` : ({ birlesim: 'A ∪ B', kesisim: 'A ∩ B', farkAB: 'A \\ B', farkBA: 'B \\ A', tumleA: "A'" })[d.islem];
      const sonuc = () => {
        if (d.mod === 'mutlak') return normal([{ a: d.m - d.r, b: d.m + d.r, sa: d.esit, sb: d.esit }]);
        const A = [d.A], B = [d.B];
        return ({ birlesim: birlesim(A, B), kesisim: kesisim(A, B), farkAB: fark(A, B), farkBA: fark(B, A), tumleA: tumle(A) })[d.islem];
      };
      const islemSeg = Lab.segment({ secenekler: [['birlesim', 'A ∪ B'], ['kesisim', 'A ∩ B'], ['farkAB', 'A \\ B'], ['farkBA', 'B \\ A'], ['tumleA', "A'"]], deger: d.islem, degisti: (v) => { d.islem = v; guncelle(); } });
      const kM = Lab.kaydirici({ ad: 'm', min: -6, max: 6, adim: 0.5, deger: d.m, degisti: (v) => { d.m = v; guncelle(); } });
      const kR = Lab.kaydirici({ ad: 'r', min: 0, max: 6, adim: 0.5, deger: d.r, degisti: (v) => { d.r = v; guncelle(); } });
      const esitSeg = Lab.segment({ secenekler: [[false, '<'], [true, '≤']], deger: d.esit, degisti: (v) => { d.esit = v; guncelle(); } });
      const ikiKart = Lab.kart('Küme işlemi', [islemSeg]);
      const mutKart = Lab.kart('Mutlak değerle aralık', [Lab.el('p', { html: '|x − m| < r : "m\'ye uzaklığı r\'den az olan sayılar".' }), kM, kR, esitSeg]);
      const modSeg = Lab.segment({ secenekler: [['iki', 'İki aralık'], ['mutlak', '|x − m| < r']], deger: d.mod, degisti: (v) => { d.mod = v; ikiKart.style.display = v === 'iki' ? '' : 'none'; mutKart.style.display = v === 'mutlak' ? '' : 'none'; guncelle(); } });
      mutKart.style.display = 'none';
      guncelle();
      let surukle = null, basXY = null, tasindi = false;
      const geo = () => {
        const W = api.W, H = api.H;
        const nd = E.sayiDogrusu({ x: 40, y: 0, w: W - 80, min: -10, max: 10 });
        return { nd, yA: H * 0.22, yB: H * 0.47, yR: H * 0.76 };
      };
      const tutamaklar = () => {
        if (d.mod !== 'iki') return [];
        const { nd, yA, yB } = geo();
        return [['A', 'a', nd.px(d.A.a), yA], ['A', 'b', nd.px(d.A.b), yA], ['B', 'a', nd.px(d.B.a), yB], ['B', 'b', nd.px(d.B.b), yB]];
      };
      return {
        panel: [Lab.kart('Mod', [modSeg]), ikiKart, mutKart, Lab.kart('Sonuç', [sonucYazi, esitYazi, Lab.el('p', { html: 'Evrensel küme: <b>ℝ</b>. Dolu nokta: uç dahil. Boş halka: uç dahil değil.' })])],
        basildi(x, y) {
          const t = tutamaklar(); const i = Lab.enYakin(t.map((u) => [u[2], u[3]]), x, y, 28);
          if (i < 0) return false;
          surukle = t[i]; basXY = [x, y]; tasindi = false;
        },
        suruklendi(x, y) {
          if (!surukle) return;
          if (Math.hypot(x - basXY[0], y - basXY[1]) > 5) tasindi = true;
          if (!tasindi) return;
          const { nd } = geo();
          const v = clamp(Math.round(nd.mx(x) * 2) / 2, -10, 10);
          const I = d[surukle[0]];
          if (surukle[1] === 'a') I.a = Math.min(v, I.b); else I.b = Math.max(v, I.a);
          guncelle();
        },
        birakildi() {
          if (surukle && !tasindi) { const I = d[surukle[0]]; if (surukle[1] === 'a') I.sa = !I.sa; else I.sb = !I.sb; guncelle(); }
          surukle = null;
        },
        uzerinde(x, y) { const t = tutamaklar(); return Lab.enYakin(t.map((u) => [u[2], u[3]]), x, y, 28) >= 0; },
        ciz(ctx, W, H) {
          const { yA, yB, yR } = geo();
          const b = Math.max(14, Math.min(20, W / 48));
          const sat = (y, ad, renk, L) => {
            const nd = E.sayiDogrusu({ x: 40, y, w: W - 80, min: -10, max: 10 });
            nd.ciz(ctx, { adim: 1, etiketAdim: W < 520 ? 5 : 2, boyut: b });
            E.yazi(ctx, ad, 14, y - 26, { boyut: b + 2, hiza: 'left', agirlik: 700, renk });
            for (const I of L) nd.aralik(ctx, Math.max(I.a, -10.6), Math.min(I.b, 10.6), { renk, acikSol: !I.sa, acikSag: !I.sb, dy: -14, kalinlik: 6, uc: true, r: 7 });
            return nd;
          };
          if (d.mod === 'iki') {
            sat(yA, 'A', 'turkuaz', [d.A]);
            sat(yB, 'B', 'mercan', [d.B]);
            E.yazi(ctx, yazAralik([d.A]), W - 20, yA - 26, { boyut: b + 2, hiza: 'right', renk: 'turkuaz', agirlik: 650 });
            E.yazi(ctx, yazAralik([d.B]), W - 20, yB - 26, { boyut: b + 2, hiza: 'right', renk: 'mercan', agirlik: 650 });
          } else {
            const nd = E.sayiDogrusu({ x: 40, y: yA + 30, w: W - 80, min: -10, max: 10 });
            nd.ciz(ctx, { adim: 1, etiketAdim: W < 520 ? 5 : 2, boyut: b });
            E.nokta(ctx, nd.px(d.m), yA + 30, 7, { renk: 'menekse' });
            E.isik(ctx, nd.px(d.m), yA + 30, (nd.px(d.r) - nd.px(0)) * 1.2 + 20, 'menekse', 0.35);
            E.ok(ctx, nd.px(d.m), yA - 6, nd.px(d.m + d.r), yA - 6, { renk: 'menekse', kalinlik: 2.5 });
            E.ok(ctx, nd.px(d.m), yA - 6, nd.px(d.m - d.r), yA - 6, { renk: 'menekse', kalinlik: 2.5 });
            E.yazi(ctx, `uzaklık ${sy(d.r)}`, nd.px(d.m), yA - 30, { boyut: b + 2, renk: 'menekse', agirlik: 650 });
          }
          sat(yR, baslik(), 'limon', sonuc());
          E.yazi(ctx, yazAralik(sonuc()), W - 20, yR - 26, { boyut: b + 4, hiza: 'right', renk: 'limon', agirlik: 760 });
        },
      };
    },
  };

  /* ---------------- 3. Sayı doğrusu mikroskobu ---------------- */
  const HEDEF = { kok2: [Math.SQRT2, '√2'], pi: [Math.PI, 'π'], ucte: [1 / 3, '1/3'], yarim: [0.5, '1/2'] };
  const mikroskop = {
    id: 'mikroskop', ad: 'Sayı doğrusu mikroskobu',
    ipucu: 'Yakınlaştır: iki kesir arasına hep yeni kesirler girer, ama √2 hiçbir kesirle tam çakışmaz.',
    kur(api) {
      const d = { hedef: 'kok2', zum: 0 };
      const gos = Lab.gosterge([['olcek', 'Görünen genişlik'], ['payda', 'Paydalar ≤'], ['yakin', 'En yakın kesir'], ['fark', 'Fark']]);
      const kZ = Lab.kaydirici({ ad: '🔍', min: 0, max: 7, adim: 0.01, deger: 0, bicim: (v) => '×' + sy(Math.pow(10, v), 0), degisti: (v) => { d.zum = v; api.ciz(); } });
      const hSeg = Lab.segment({ secenekler: Object.entries(HEDEF).map(([k, v]) => [k, v[1]]), deger: d.hedef, degisti: (v) => { d.hedef = v; api.ciz(); } });
      return {
        panel: [Lab.kart('Hedef ve yakınlaştırma', [hSeg, kZ]), Lab.kart('Ölçüm', [gos]), Lab.kart('Neden?', [Lab.el('p', { html: 'İki rasyonel sayı <b>a < b</b> arasında her zaman <b>(a + b) / 2</b> vardır: rasyoneller <b>yoğundur</b>. Yine de √2 = p/q olacak tam sayılar yoktur; ℝ bu boşlukları doldurur.' })])],
        ciz(ctx, W, H) {
          const [c, ad] = HEDEF[d.hedef];
          const gen = 4 / Math.pow(10, d.zum);
          const min = c - gen / 2, max = c + gen / 2;
          const y = H * 0.55;
          const nd = E.sayiDogrusu({ x: 30, y, w: W - 60, min, max });
          E.cizgi(ctx, [[10, y], [W - 10, y]], { renk: 'cizgi', kalinlik: 2.5 });
          // Kesirler: paydası q ≤ Q olan p/q (piksel aralığı ≥ 7 olacak şekilde Q seç)
          const pxBirim = (W - 60) / gen;
          let Q = 1; while (Q < 2000 && pxBirim / ((Q + 1) * (Q + 1)) > 3) Q++;
          Q = Math.max(Q, 1);
          let enYakin = null;
          for (let q = 1; q <= Q; q++) {
            const p0 = Math.ceil(min * q), p1 = Math.floor(max * q);
            if (p1 - p0 > 400) continue;
            for (let p = p0; p <= p1; p++) {
              const g = (a, b) => (b ? g(b, a % b) : Math.abs(a));
              if (g(p, q) !== 1) continue;
              const v = p / q, x = nd.px(v);
              const boy = 26 * Math.pow(1 / q, 0.45);
              E.cizgi(ctx, [[x, y - boy], [x, y + boy]], { renk: q === 1 ? 'tebesir' : 'turkuaz', kalinlik: q <= 2 ? 2.5 : 1.5, alfa: clamp(0.35 + 1.2 / Math.sqrt(q)) });
              if (q <= Math.max(2, Q / 3) && boy > 9 && (W - 60) / ((p1 - p0 + 1) * 1) > 34) E.yazi(ctx, q === 1 ? String(p) : `${p}/${q}`, x, y + boy + 16, { boyut: 14, renk: 'gumus', agirlik: 520 });
              if (!enYakin || Math.abs(v - c) < Math.abs(enYakin[0] - c)) enYakin = [v, p, q];
            }
          }
          // hedef
          const hx = nd.px(c);
          E.isik(ctx, hx, y, 70, 'limon', 0.35);
          E.cizgi(ctx, [[hx, y - 60], [hx, y + 60]], { renk: 'limon', kalinlik: 2.5, kesik: [6, 5] });
          E.yazi(ctx, ad, hx, y - 80, { boyut: 26, agirlik: 760, renk: 'limon' });
          E.yazi(ctx, `[${sy(min, 8)} ; ${sy(max, 8)}]`, W / 2, 28, { boyut: 16, renk: 'gumus' });
          gos.yaz('olcek', sy(gen, 8));
          gos.yaz('payda', String(Q));
          if (enYakin) { gos.yaz('yakin', `${enYakin[1]}/${enYakin[2]}`); gos.yaz('fark', Math.abs(enYakin[0] - c) < 1e-12 ? '0 (tam!)' : Math.abs(enYakin[0] - c).toExponential(2).replace('.', ',')); }
        },
      };
    },
  };

  Lab.kur({ ad: T.labAd || 'Sayılar Laboratuvarı', tema: T.ad, temaNo: T.no, filmler: T.filmler, deneyler: [merdiven, tezgah, mikroskop] });
})();
