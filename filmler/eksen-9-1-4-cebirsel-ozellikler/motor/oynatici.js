/* ==========================================================================
   EKSEN oynatıcı — film.js'in tanımladığı E.F filmini oynatır.
   Kareler her zaman E.ciz(ctx, t) ile çizilir; requestAnimationFrame
   yalnızca oynatma sırasında "şimdiki t" değerini hesaplamak içindir.
   URL parametreleri: yerlesim=h|v  dil=tr|en|iki|yok  t=saniye  export=1  denetim=1
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const q = new URLSearchParams(location.search);
  const disari = q.get('export') === '1';
  const dilKayit = (() => { try { return localStorage.getItem('eksen-dil'); } catch (e) { return null; } })();
  E.dil = q.get('dil') || dilKayit || 'tr';
  let yatay = q.get('yerlesim') ? q.get('yerlesim') !== 'v' : window.innerWidth >= window.innerHeight * 0.9;
  E.yerlesimKur(yatay);
  E.denetim = q.get('denetim') === '1';

  const F = E.F;
  const sahne = document.getElementById('sahne') || document.body.appendChild(Object.assign(document.createElement('main'), { id: 'sahne' }));
  const kap = document.createElement('div'); kap.id = 'tuvalKap';
  const tuval = document.createElement('canvas');
  kap.appendChild(tuval); sahne.appendChild(kap);
  const ctx = tuval.getContext('2d');

  /* ---- Dışa aktarım modu: yalnızca tuval ve renderFrame ---- */
  if (disari) {
    document.body.classList.add('disari');
    sahne.style.background = '#000';
    tuval.width = E.W; tuval.height = E.H;
    kap.style.width = E.W + 'px'; kap.style.height = E.H + 'px'; kap.style.borderRadius = '0'; kap.style.boxShadow = 'none';
    sahne.style.placeItems = 'start';
    window.renderFrame = (t) => { E.ciz(ctx, t, 1); return true; };
    window.EKSEN_HAZIR = (async () => {
      await E.fontlarHazir;
      if (F.hazirla) await F.hazirla();
      E.ciz(ctx, 0, 1);
      return { sure: F.sure, fps: E.FPS, W: E.W, H: E.H };
    })();
    window.EKSEN_DENETLE = (t) => { E.denetim = true; E.ciz(ctx, t, 1); return E.denetle(); };
    return;
  }

  /* ---- Oynatıcı ---- */
  let t = Math.max(0, Math.min(F.sure, parseFloat(q.get('t')) || 0));
  let oynuyor = false, basDuvar = 0, basT = 0;
  let olcek = 1;

  const boyutla = () => {
    const pad = window.innerWidth < 640 ? 0 : 24;
    const kontrolPay = window.innerWidth < 640 ? 0 : 70;
    const mw = window.innerWidth - pad * 2, mh = window.innerHeight - pad * 2 - kontrolPay;
    const s = Math.min(mw / E.W, mh / E.H);
    const cw = Math.floor(E.W * s), ch = Math.floor(E.H * s);
    kap.style.width = cw + 'px'; kap.style.height = ch + 'px';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    olcek = Math.max(0.5, (cw * dpr) / E.W);
    // Zayıf cihazlarda tamponu sınırla
    olcek = Math.min(olcek, 2560 / Math.max(E.W, E.H));
    tuval.width = Math.round(E.W * olcek); tuval.height = Math.round(E.H * olcek);
    if (F.boyutDegisti) F.boyutDegisti();
    ciz();
  };
  const ciz = () => { E.ciz(ctx, t, olcek); arayuzGuncelle(); };

  /* ---- Arayüz ---- */
  const svg = {
    oynat: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
    durdur: '<svg viewBox="0 0 24 24"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>',
    tam: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5v2H6v3zm10-5h6v5h-2V6h-4zM4 15h2v3h3v2H4zm14 3v-3h2v5h-6v-2z"/></svg>',
    not: '<svg viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5zm9 1.5V8h3.5zM8 11h8v1.6H8zm0 3.4h8V16H8zm0 3.4h5v1.6H8z"/></svg>',
    geri: '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/></svg>',
  };
  const el = (tag, ozel = {}, ic = '') => { const e = document.createElement(tag); Object.assign(e, ozel); if (ic) e.innerHTML = ic; return e; };

  const ust = el('div', { id: 'ustBilgi' });
  ust.innerHTML = `<div><span class="marka">EKSEN</span> <span class="ad">· ${F.meta.kod} · ${F.meta.ad}</span></div>`;
  if (F.meta.labUrl) ust.appendChild(el('a', { href: F.meta.labUrl, target: '_blank', rel: 'noopener', textContent: 'Laboratuvara git →' }));
  document.body.appendChild(ust);

  const buyuk = el('button', { id: 'buyukOynat', 'aria-label': 'Oynat' }, `<span class="halka">${svg.oynat}</span>`);
  buyuk.setAttribute('aria-label', 'Oynat');
  kap.appendChild(buyuk);

  const kontrol = el('div', { id: 'kontrol' });
  const dOynat = el('button', { className: 'dug', title: 'Oynat / durdur (boşluk)' }, svg.oynat);
  const dBasa = el('button', { className: 'dug', title: 'Başa sar' }, svg.geri);
  const zaman = el('div', { id: 'zaman' });
  const serit = el('div', { id: 'serit' });
  serit.innerHTML = '<div class="ray"></div><div class="dolu"></div><div class="tutamak"></div><div class="ipucu"></div>';
  F.sahneler.forEach((s) => { if (s.bas > 0.1) serit.appendChild(el('div', { className: 'bolum', style: `left:${(s.bas / F.sure) * 100}%` })); });
  const dil = el('select', { className: 'dug', title: 'Altyazı (c)' });
  [['tr', 'TR'], ['en', 'EN'], ['iki', 'TR + EN'], ['yok', 'Altyazı yok']].forEach(([v, a]) => dil.appendChild(el('option', { value: v, textContent: a })));
  dil.value = E.dil;
  const dYer = el('button', { className: 'dug', title: 'Yatay (16:9) / dikey (9:16)' });
  const dNot = el('button', { className: 'dug', title: 'Öğretmen için seslendirme notları' }, svg.not + '<span>Notlar</span>');
  const dTam = el('button', { className: 'dug', title: 'Tam ekran (f)' }, svg.tam);
  [dOynat, dBasa, zaman, serit, dil, el('div', { className: 'ayrac' }), dYer, dNot, dTam].forEach((x) => kontrol.appendChild(x));
  document.body.appendChild(kontrol);

  /* Notlar paneli */
  const notlar = el('aside', { id: 'notlar' });
  notlar.innerHTML = '<header><h2>Seslendirme notları</h2></header><div class="liste"></div>';
  const kapat = el('button', { className: 'dug', textContent: 'Kapat' });
  notlar.querySelector('header').appendChild(kapat);
  const liste = notlar.querySelector('.liste');
  const fmtZ = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const notDugmeleri = [];
  let sonSahne = null;
  (window.ALTYAZI || []).forEach((a) => {
    const sh = F.sahneler.find((s) => a.bas >= s.bas && a.bas < s.son);
    if (sh && sh !== sonSahne) { liste.appendChild(el('div', { className: 'sahneBaslik', textContent: sh.ad })); sonSahne = sh; }
    const b = el('button', { className: 'not' });
    b.innerHTML = `<span class="zt">${fmtZ(a.bas)}–${fmtZ(a.son)}</span><span class="tr"></span><span class="sn"></span>`;
    b.querySelector('.tr').textContent = a.tr;
    b.querySelector('.sn').textContent = a.not ? '🎙 ' + a.not : '';
    b.onclick = () => { git(a.bas + 0.01); };
    liste.appendChild(b); notDugmeleri.push([a, b]);
  });
  document.body.appendChild(notlar);

  const arayuzGuncelle = () => {
    const p = t / F.sure;
    serit.querySelector('.dolu').style.width = p * 100 + '%';
    serit.querySelector('.tutamak').style.left = p * 100 + '%';
    zaman.textContent = `${fmtZ(t)} / ${fmtZ(F.sure)}`;
    dOynat.innerHTML = oynuyor ? svg.durdur : svg.oynat;
    dYer.textContent = E.yatay ? '16:9' : '9:16';
    if (notlar.classList.contains('acik')) for (const [a, b] of notDugmeleri) b.classList.toggle('simdi', t >= a.bas && t < a.son);
  };

  const dongu = (simdi) => {
    if (!oynuyor) return;
    t = basT + (simdi - basDuvar) / 1000;
    if (t >= F.sure) { t = F.sure; oynuyor = false; buyuk.classList.remove('gizli'); arayuzGoster(); }
    ciz();
    if (oynuyor) requestAnimationFrame(dongu);
  };
  const oynat = () => {
    if (t >= F.sure - 0.05) t = 0;
    oynuyor = true; basT = t; basDuvar = performance.now(); buyuk.classList.add('gizli');
    requestAnimationFrame(dongu); arayuzGuncelle(); arayuzZamanla();
  };
  const durdur = () => { oynuyor = false; arayuzGuncelle(); arayuzGoster(); };
  const git = (yeni) => { t = Math.max(0, Math.min(F.sure, yeni)); basT = t; basDuvar = performance.now(); ciz(); };

  dOynat.onclick = () => (oynuyor ? durdur() : oynat());
  buyuk.onclick = oynat;
  tuval.onclick = () => (oynuyor ? durdur() : oynat());
  dBasa.onclick = () => git(0);
  dil.onchange = () => { E.dil = dil.value; try { localStorage.setItem('eksen-dil', E.dil); } catch (e) {} ciz(); };
  dYer.onclick = () => { E.yerlesimKur(!E.yatay); boyutla(); };
  dNot.onclick = () => { notlar.classList.toggle('acik'); arayuzGuncelle(); };
  kapat.onclick = () => notlar.classList.remove('acik');
  dTam.onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); };

  // Şerit sürükleme
  const seritT = (ev) => { const r = serit.getBoundingClientRect(); return Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) * F.sure; };
  let surukle = false;
  serit.addEventListener('pointerdown', (ev) => { surukle = true; serit.setPointerCapture(ev.pointerId); git(seritT(ev)); });
  serit.addEventListener('pointermove', (ev) => {
    const tt = seritT(ev); const sh = F.sahneler.find((s) => tt >= s.bas && tt < s.son);
    const ip = serit.querySelector('.ipucu'); ip.textContent = `${fmtZ(tt)} · ${sh ? sh.ad : ''}`; ip.style.left = (tt / F.sure) * 100 + '%';
    if (surukle) git(tt);
  });
  serit.addEventListener('pointerup', () => (surukle = false));

  // Klavye
  window.addEventListener('keydown', (ev) => {
    if (ev.target.tagName === 'SELECT') return;
    if (ev.code === 'Space') { ev.preventDefault(); oynuyor ? durdur() : oynat(); }
    else if (ev.code === 'ArrowRight') git(t + 5);
    else if (ev.code === 'ArrowLeft') git(t - 5);
    else if (ev.key === 'f') dTam.onclick();
    else if (ev.key === 'c') { const s = ['tr', 'en', 'iki', 'yok']; dil.value = s[(s.indexOf(dil.value) + 1) % 4]; dil.onchange(); }
    else if (ev.key === 'y') dYer.onclick();
    arayuzGoster();
  });

  // Arayüzü otomatik gizle
  let gizleZ = null;
  const arayuzGoster = () => { kontrol.classList.remove('sakla'); ust.classList.remove('sakla'); arayuzZamanla(); };
  const arayuzZamanla = () => { clearTimeout(gizleZ); gizleZ = setTimeout(() => { if (oynuyor) { kontrol.classList.add('sakla'); ust.classList.add('sakla'); } }, 2600); };
  window.addEventListener('pointermove', arayuzGoster);
  window.addEventListener('touchstart', arayuzGoster, { passive: true });
  window.addEventListener('resize', boyutla);

  window.renderFrame = (tt) => { t = tt; ciz(); return true; };
  (async () => {
    await E.fontlarHazir;
    if (F.hazirla) await F.hazirla();
    boyutla();
  })();
})();
