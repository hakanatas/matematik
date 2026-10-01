/* ==========================================================================
   Eksen laboratuvar kiti: sekmeler, tuval, sürükleme, kaydırıcılar, göstergeler.
   Laboratuvar etkileşimlidir; çizim yalnızca bir şey değiştiğinde yapılır
   (pil ve okul bilgisayarı dostu). Motorun çizim yardımcıları (E.yazi, E.formul,
   E.cizgi, E.duzlem ...) aynen kullanılır.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const Lab = (window.Lab = {});
  const el = (Lab.el = (tag, ozel = {}, cocuklar = []) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(ozel)) {
      if (k === 'sinif') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
    }
    for (const c of [].concat(cocuklar)) if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    return e;
  });

  /**
   * def: { ad, tema, temaNo, filmler:[{kod, ad, url}], deneyler:[{ id, ad, ipucu, oran?, kur(api) }] }
   * kur(api) → { ciz(ctx, W, H), panel: [DOM...], basildi?, suruklendi?, birakildi?, uzerinde? }
   */
  Lab.kur = async (def) => {
    document.body.classList.add('lab');
    document.title = `${def.ad} · Eksen`;
    const q = new URLSearchParams(location.search);
    const ust = el('header', { sinif: 'lab-ust' }, [
      el('div', { sinif: 'marka' }, [el('b', {}, 'EKSEN'), el('h1', {}, def.ad)]),
      el('nav', {}, [
        el('a', { href: 'https://hakanatas.github.io/eksen-filmleri/', sinif: 'ikincil' }, 'Tüm filmler'),
        def.filmler && def.filmler[0] ? el('a', { href: def.filmler[0].url }, '▶ Film') : null,
      ]),
    ]);
    const sekmeler = el('div', { sinif: 'lab-sekmeler', role: 'tablist' });
    const tuvalKap = el('div', { sinif: 'lab-tuval' });
    const tuval = el('canvas');
    const ipucu = el('div', { sinif: 'ipucu' });
    tuvalKap.append(tuval);
    const panel = el('aside', { sinif: 'lab-panel' });
    const govde = el('main', { sinif: 'lab-govde' }, [el('div', { sinif: 'lab-sol' }, [tuvalKap, ipucu]), panel]);
    const filmler = el('section', { sinif: 'lab-filmler' }, [
      el('h2', {}, `${def.temaNo}. Tema: ${def.tema} — filmler`),
      el('div', { sinif: 'liste' }, (def.filmler || []).map((f) => el('a', { href: f.url }, [el('small', {}, f.kod), el('span', {}, f.ad)]))),
    ]);
    const alt = el('footer', { sinif: 'lab-alt', html: `Eksen · Hakan Ataş · <a href="https://creativecommons.org/licenses/by-nc/4.0/deed.tr">CC BY-NC 4.0</a> · Kaynak: MEB Türkiye Yüzyılı Maarif Modeli 9. sınıf matematik öğretim programı` });
    document.body.append(ust, sekmeler, govde, filmler, alt);
    await E.fontlarHazir;

    const ctx = tuval.getContext('2d');
    let W = 800, H = 500, olcek = 1, aktif = null, kirli = true, animasyon = false;
    const api = {
      get W() { return W; }, get H() { return H; },
      ciz: () => { kirli = true; },
      animasyon: (v) => { animasyon = v; kirli = true; },
      el, kaydirici: Lab.kaydirici, segment: Lab.segment, kart: Lab.kart, gosterge: Lab.gosterge, formulKanvas: Lab.formulKanvas, dugme: Lab.dugme,
      ipucu: (m) => { ipucu.textContent = m; ipucu.style.display = m ? '' : 'none'; },
    };
    const boyutla = () => {
      const r = tuvalKap.getBoundingClientRect();
      W = Math.max(200, r.width); H = Math.max(160, r.height);
      olcek = Math.min(window.devicePixelRatio || 1, 2);
      tuval.width = Math.round(W * olcek); tuval.height = Math.round(H * olcek);
      E.W = W; E.H = H; E.olcek = olcek;
      kirli = true;
    };
    new ResizeObserver(boyutla).observe(tuvalKap);

    const sec = (d) => {
      if (aktif && aktif.durdur) aktif.durdur();
      [...sekmeler.children].forEach((b) => b.classList.toggle('aktif', b.dataset.id === d.id));
      tuvalKap.style.aspectRatio = d.oran || '';
      panel.innerHTML = '';
      animasyon = false;
      aktif = d.kur(api);
      aktif.id = d.id;
      (aktif.panel || []).forEach((p) => panel.appendChild(p));
      api.ipucu(d.ipucu || '');
      history.replaceState(null, '', '?deney=' + d.id);
      boyutla();
    };
    def.deneyler.forEach((d) => sekmeler.appendChild(el('button', { role: 'tab', 'data-id': d.id, onclick: () => sec(d) }, d.ad)));
    if (def.deneyler.length < 2) sekmeler.style.display = 'none';

    // İşaretçi olayları (fare + dokunma)
    const konum = (ev) => { const r = tuval.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    let surukluyor = false;
    tuval.addEventListener('pointerdown', (ev) => {
      if (!aktif || !aktif.basildi) return;
      const [x, y] = konum(ev);
      if (aktif.basildi(x, y, ev) !== false) { surukluyor = true; tuval.setPointerCapture(ev.pointerId); kirli = true; ev.preventDefault(); }
    });
    tuval.addEventListener('pointermove', (ev) => {
      const [x, y] = konum(ev);
      if (surukluyor && aktif.suruklendi) { aktif.suruklendi(x, y, ev); kirli = true; }
      else if (aktif && aktif.uzerinde) tuval.style.cursor = aktif.uzerinde(x, y) ? 'grab' : 'default';
    });
    const birak = (ev) => { if (surukluyor) { surukluyor = false; if (aktif.birakildi) aktif.birakildi(); kirli = true; } };
    tuval.addEventListener('pointerup', birak); tuval.addEventListener('pointercancel', birak);

    const dongu = (zaman) => {
      if (aktif && (kirli || animasyon)) {
        kirli = false;
        ctx.setTransform(olcek, 0, 0, olcek, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.5, Math.hypot(W, H) * 0.65);
        g.addColorStop(0, '#111A30'); g.addColorStop(1, '#070A13');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.save(); aktif.ciz(ctx, W, H, zaman / 1000); ctx.restore();
      }
      requestAnimationFrame(dongu);
    };
    const ilk = def.deneyler.find((d) => d.id === q.get('deney')) || def.deneyler[0];
    sec(ilk);
    requestAnimationFrame(dongu);
  };

  /* ---- Kontroller ---- */
  Lab.kart = (baslik, icerik = []) => el('section', { sinif: 'kart' }, [baslik ? el('h3', {}, baslik) : null, ...[].concat(icerik)]);
  /** Kaydırıcı: {ad, min, max, adim, deger, bicim(v), degisti(v)} */
  Lab.kaydirici = (o) => {
    const giris = el('input', { type: 'range', min: o.min, max: o.max, step: o.adim ?? 0.1, value: o.deger, 'aria-label': o.etiket || o.ad });
    const cikti = el('output');
    const guncelle = () => {
      const v = parseFloat(giris.value);
      cikti.textContent = o.bicim ? o.bicim(v) : E.sayiYaz(v);
      giris.style.setProperty('--dolu', ((v - o.min) / (o.max - o.min)) * 100 + '%');
      return v;
    };
    giris.addEventListener('input', () => o.degisti(guncelle()));
    guncelle();
    const kap = el('div', { sinif: 'kaydirici' }, [el('label', {}, o.ad), giris, cikti]);
    kap.ayarla = (v) => { giris.value = v; guncelle(); };
    return kap;
  };
  /** Bölümlü düğmeler: {secenekler:[[deger, ad],...], deger, degisti(v)} */
  Lab.segment = (o) => {
    const kap = el('div', { sinif: 'segment', role: 'group' });
    const ciz = (aktif) => [...kap.children].forEach((b) => b.classList.toggle('aktif', b.dataset.v === String(aktif)));
    o.secenekler.forEach(([v, ad]) => kap.appendChild(el('button', { 'data-v': String(v), onclick: () => { ciz(v); o.degisti(v); } }, ad)));
    ciz(o.deger);
    kap.ayarla = ciz;
    return kap;
  };
  Lab.dugme = (ad, tik, ana = false) => el('button', { sinif: 'dugme' + (ana ? ' ana' : ''), onclick: tik }, ad);
  /** Gösterge ızgarası: [[anahtar, etiket], ...] → .yaz(anahtar, değer) */
  Lab.gosterge = (alanlar) => {
    const kap = el('div', { sinif: 'gosterge' });
    const d = {};
    for (const [k, etiket] of alanlar) { const s = el('strong', {}, '–'); d[k] = s; kap.appendChild(el('div', {}, [el('small', {}, etiket), s])); }
    kap.yaz = (k, v) => { if (d[k]) d[k].textContent = v; };
    return kap;
  };
  /** Formülü küçük bir tuvale çizer (DOM içinde formül göstermek için) */
  Lab.formulKanvas = (tex, o = {}) => {
    const c = el('canvas', { sinif: 'formul' });
    let son = [tex, {}];
    c.yaz = (tex2, o2 = {}) => {
      son = [tex2, o2];
      const b = o2.boyut || o.boyut || 26, dpr = Math.min(window.devicePixelRatio || 1, 2);
      const g = c.getContext('2d');
      const olc = E.formulOlc(g, tex2, b);
      const w = Math.ceil(olc.w + 8), h = Math.ceil(olc.a + olc.d + 10);
      c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      E.formul(g, tex2, 4, h / 2, { boyut: b, hiza: 'left', renk: o2.renk || o.renk || 'tebesir' });
    };
    E.fontlarHazir.then(() => c.yaz(...son));
    return c;
  };
  /** Bir noktaya en yakın sürüklenebilir tutamaç */
  Lab.enYakin = (noktalar, x, y, r = 26) => {
    let en = -1, d = r;
    noktalar.forEach((p, i) => { const k = Math.hypot(p[0] - x, p[1] - y); if (k < d) { d = k; en = i; } });
    return en;
  };
})();
