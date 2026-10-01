/* ==========================================================================
   EKSEN — 9. sınıf matematik filmleri için ortak çizim motoru
   Her kare, zamanın saf fonksiyonudur: renderFrame(t).
   Rastgelelik yalnızca tohumlu üreteçlerden gelir; requestAnimationFrame
   yalnızca oynatıcıda "şu an hangi t?" sorusunu yanıtlamak için kullanılır.
   Lisans: CC BY-NC 4.0 — Hakan Ataş
   ========================================================================== */
(function () {
  'use strict';
  const E = (window.E = {});

  /* ---------- Palet (tokenlar) ---------- */
  E.P = {
    gece: '#080C17',     // en derin zemin
    lacivert: '#0E1526', // panel / katman
    derin: '#16203A',    // uzak katman
    sis: '#26324F',      // ızgara, ince çizgi
    cizgi: '#3A4A6E',    // eksen, pasif çizgi
    gumus: '#A7B3C9',    // ikincil yazı
    tebesir: '#F1F4F9',  // birincil yazı
    turkuaz: '#3CE6CF',  // vurgu A
    mercan: '#FF5C70',   // vurgu B
    menekse: '#9A86FF',  // vurgu C
    gok: '#5AB8FF',      // vurgu D
    limon: '#DDF26A',    // vurgu E (az kullan)
  };
  E.FONT = {
    sans: "'Bricolage Grotesque', 'Noto Sans Math', sans-serif",
    serif: "Fraunces, 'Noto Sans Math', serif",
    mono: "'JetBrains Mono', 'Noto Sans Math', monospace",
    math: "'Noto Sans Math', 'Bricolage Grotesque', sans-serif",
  };
  E.FPS = 30;

  /* ---------- Sayısal yardımcılar ---------- */
  const clamp = (E.clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v));
  const lerp = (E.lerp = (a, b, p) => a + (b - a) * p);
  E.ters = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
  E.harita = (v, a, b, c, d) => c + (d - c) * ((v - a) / (b - a));
  E.TAU = Math.PI * 2;
  E.der = (d) => (d * Math.PI) / 180;

  const e = (E.e = {
    lin: (x) => x,
    gir2: (x) => x * x,
    cik2: (x) => 1 - (1 - x) * (1 - x),
    io2: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
    gir3: (x) => x * x * x,
    cik3: (x) => 1 - Math.pow(1 - x, 3),
    io3: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    cik5: (x) => 1 - Math.pow(1 - x, 5),
    io5: (x) => (x < 0.5 ? 16 * Math.pow(x, 5) : 1 - Math.pow(-2 * x + 2, 5) / 2),
    yumusak: (x) => x * x * x * (x * (x * 6 - 15) + 10),
    geri: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    yay: (x) => { // hafif sönümlü yay
      if (x <= 0) return 0; if (x >= 1) return 1;
      return 1 - Math.exp(-6 * x) * Math.cos(10 * x) * (1 - x) - 0 * x;
    },
  });
  /** t'nin [a,b] aralığındaki ilerlemesi (0..1), isteğe bağlı yumuşatma ile */
  E.ara = (t, a, b, kolay = 'io3') => {
    const p = clamp((t - a) / (b - a));
    return typeof kolay === 'function' ? kolay(p) : e[kolay](p);
  };
  /** Anahtar kare: keys = [[t, değer, yumuşatma?], ...]; değer sayı veya dizi */
  E.kf = (t, keys) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, k] = keys[i];
      const [t0, v0] = keys[i - 1];
      if (t <= t1) {
        const p = (k ? (typeof k === 'function' ? k : e[k]) : e.io3)(clamp((t - t0) / (t1 - t0)));
        if (Array.isArray(v0)) return v0.map((a, j) => lerp(a, v1[j], p));
        return lerp(v0, v1, p);
      }
    }
    return keys[keys.length - 1][1];
  };
  /** Nabız: t anında başlayan, d sürede sönen 0..1..0 */
  E.nabiz = (t, t0, d = 0.6) => { const p = (t - t0) / d; return p < 0 || p > 1 ? 0 : Math.sin(p * Math.PI); };

  /* ---------- Tohumlu rastgelelik ---------- */
  E.rng = (seed) => {
    let a = seed >>> 0 || 1;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  E.hash = (n, s = 0) => {
    let h = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(s | 0, 0xc2b2ae35);
    h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  /** Pürüzsüz 1B değer gürültüsü (deterministik) */
  E.gurultu = (x, s = 0) => {
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return lerp(E.hash(i, s), E.hash(i + 1, s), u) * 2 - 1;
  };

  /* ---------- Renk ---------- */
  const hexRgb = (h) => {
    if (h.startsWith('rgb')) { const m = h.match(/[\d.]+/g).map(Number); return m.slice(0, 3); }
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  E.rgba = (renk, a = 1) => { const [r, g, b] = hexRgb(E.P[renk] || renk); return `rgba(${r},${g},${b},${a})`; };
  E.karistir = (r1, r2, p, a = 1) => {
    const x = hexRgb(E.P[r1] || r1), y = hexRgb(E.P[r2] || r2);
    return `rgba(${Math.round(lerp(x[0], y[0], p))},${Math.round(lerp(x[1], y[1], p))},${Math.round(lerp(x[2], y[2], p))},${a})`;
  };
  const R = (E.R = (renk) => E.P[renk] || renk);

  /* ---------- Yerleşim ---------- */
  E.yerlesimKur = (yatay) => {
    E.yatay = yatay;
    E.W = yatay ? 1280 : 720;
    E.H = yatay ? 720 : 1280;
    const W = E.W, H = E.H;
    // Altyazı bölgesi ve içerik güvenli alanı
    E.L = yatay
      ? { W, H, cx: W / 2, cy: H / 2, u: H / 100,
          icerik: { x: 64, y: 44, w: W - 128, h: H - 44 - 150 },
          altyazi: { y: H - 34, gen: 1060, ust: H - 150 } }
      : { W, H, cx: W / 2, cy: H / 2, u: W / 100,
          icerik: { x: 40, y: 96, w: W - 80, h: H - 96 - 400 },
          altyazi: { y: H - 190, gen: 640, ust: H - 400 } };
    const ic = E.L.icerik;
    ic.cx = ic.x + ic.w / 2; ic.cy = ic.y + ic.h / 2; ic.x1 = ic.x + ic.w; ic.y1 = ic.y + ic.h;
    E.L.yatay = yatay;
  };
  E.yerlesimKur(true);
  /** Yatay/dikey için farklı değer seç */
  E.yd = (h, v) => (E.yatay ? h : v);

  /* ---------- Tuval katmanları ---------- */
  const katmanlar = [];
  E.olcek = 1; // arka tampon / mantıksal piksel oranı (oynatıcıda DPR, dışa aktarımda 1)
  const katman = (i) => {
    if (!katmanlar[i]) katmanlar[i] = document.createElement('canvas');
    const c = katmanlar[i];
    const w = Math.round(E.W * E.olcek), h = Math.round(E.H * E.olcek);
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    return c;
  };
  E.katman = katman;

  /* ---------- Denetim (yazı çakışması / taşma / küçük yazı) ---------- */
  E.denetim = false;
  E._kayit = [];
  E._katmanAlfa = 1;
  E._sahneAdi = '';
  const kaydet = (ctx, x0, y0, x1, y1, px, alfa, metin, opt = {}) => {
    if (!E.denetim) return;
    const m = ctx.getTransform(), k = E.olcek;
    const pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => [(m.a * x + m.c * y + m.e) / k, (m.b * x + m.d * y + m.f) / k]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const olcek = Math.hypot(m.a, m.b) / k;
    E._kayit.push({
      x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys),
      px: px * olcek, alfa: alfa * ctx.globalAlpha * E._katmanAlfa, metin: String(metin).slice(0, 40),
      sahne: E._sahneAdi, cakisabilir: !!opt.cakisabilir, altyazi: !!opt.altyazi,
    });
  };
  E.denetle = (kayit = E._kayit) => {
    const sorun = [];
    const W = E.W, H = E.H;
    const gor = kayit.filter((k) => k.alfa > 0.35);
    for (const k of gor) {
      if (k.x0 < -1 || k.y0 < -1 || k.x1 > W + 1 || k.y1 > H + 1)
        sorun.push({ tur: 'taşma', metin: k.metin, sahne: k.sahne, kutu: [k.x0, k.y0, k.x1, k.y1].map(Math.round) });
      if (k.px < 19.5 && !k.altyazi)
        sorun.push({ tur: 'küçük yazı', metin: k.metin, sahne: k.sahne, px: +k.px.toFixed(1) });
    }
    for (let i = 0; i < gor.length; i++)
      for (let j = i + 1; j < gor.length; j++) {
        const a = gor[i], b = gor[j];
        if (a.cakisabilir || b.cakisabilir) continue;
        if (a.altyazi && b.altyazi) continue;
        const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
        const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        if (w <= 2 || h <= 2) continue;
        const kucuk = Math.min((a.x1 - a.x0) * (a.y1 - a.y0), (b.x1 - b.x0) * (b.y1 - b.y0));
        if ((w * h) / Math.max(kucuk, 1) > 0.08)
          sorun.push({ tur: a.altyazi || b.altyazi ? 'altyazı çakışması' : 'çakışma', metin: a.metin + ' ⟷ ' + b.metin, sahne: a.sahne || b.sahne });
      }
    return sorun;
  };

  /* ---------- Yazı ---------- */
  const fontStr = (o) => `${o.italik ? 'italic ' : ''}${o.agirlik || 500} ${o.boyut}px ${E.FONT[o.font || 'sans'] || o.font}`;
  E.fontStr = fontStr;
  /** Metni satırlara böl */
  E.sar = (ctx, metin, gen) => {
    const satirlar = [];
    for (const paragraf of String(metin).split('\n')) {
      const kel = paragraf.split(' ');
      let s = '';
      for (const k of kel) {
        const deneme = s ? s + ' ' + k : k;
        if (ctx.measureText(deneme).width > gen && s) { satirlar.push(s); s = k; } else s = deneme;
      }
      satirlar.push(s);
    }
    return satirlar;
  };
  /**
   * Yazı çiz. opt: boyut, agirlik, renk, hiza(left|center|right), taban(middle|alphabetic|top),
   * font(sans|serif|mono), italik, alfa, parilti(0..1), maxGen, satirAra, harfAra(px), yaz(0..1: daktilo),
   * golge, cakisabilir. Dönüş: {w, h, satir}
   */
  E.yazi = (ctx, metin, x, y, o = {}) => {
    o = Object.assign({ boyut: 32, agirlik: 500, renk: 'tebesir', hiza: 'center', taban: 'middle', alfa: 1, satirAra: 1.22 }, o);
    if (o.alfa <= 0.002) return { w: 0, h: 0 };
    ctx.save();
    ctx.font = fontStr(o);
    ctx.textAlign = o.hiza;
    ctx.textBaseline = 'middle';
    if (o.harfAra) ctx.letterSpacing = o.harfAra + 'px';
    ctx.globalAlpha *= o.alfa;
    let satirlar = o.maxGen ? E.sar(ctx, metin, o.maxGen) : String(metin).split('\n');
    const lh = o.boyut * o.satirAra;
    const top = satirlar.length * lh;
    let y0 = o.taban === 'top' ? y + lh / 2 : o.taban === 'bottom' ? y - top + lh / 2 : y - top / 2 + lh / 2;
    let enGen = 0;
    let toplamKar = satirlar.reduce((s, l) => s + l.length, 0);
    let kalan = o.yaz !== undefined ? Math.floor(clamp(o.yaz) * toplamKar + 0.0001) : Infinity;
    for (let i = 0; i < satirlar.length; i++) {
      let s = satirlar[i];
      const tam = ctx.measureText(s).width;
      enGen = Math.max(enGen, tam);
      if (kalan !== Infinity) { s = s.slice(0, Math.max(0, kalan)); kalan -= satirlar[i].length; }
      const yy = y0 + i * lh;
      if (o.parilti) {
        ctx.save();
        ctx.shadowColor = E.rgba(o.parRenk || o.renk, 0.85);
        ctx.shadowBlur = o.boyut * 0.6 * o.parilti;
        ctx.fillStyle = R(o.renk);
        ctx.fillText(s, x, yy);
        ctx.restore();
      }
      if (o.golge) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = o.boyut * 0.35; ctx.shadowOffsetY = 2; ctx.fillStyle = R(o.renk); ctx.fillText(s, x, yy); ctx.restore(); }
      else { ctx.fillStyle = R(o.renk); ctx.fillText(s, x, yy); }
      if (o.cizgiAlti) { ctx.fillRect(o.hiza === 'center' ? x - tam / 2 : o.hiza === 'right' ? x - tam : x, yy + o.boyut * 0.55, tam * o.cizgiAlti, Math.max(2, o.boyut * 0.06)); }
      const bx = o.hiza === 'center' ? x - tam / 2 : o.hiza === 'right' ? x - tam : x;
      kaydet(ctx, bx, yy - o.boyut * 0.5, bx + tam, yy + o.boyut * 0.5, o.boyut, 1, satirlar[i], o);
    }
    ctx.restore();
    return { w: enGen, h: top, satir: satirlar.length };
  };
  E.yaziOlc = (ctx, metin, o = {}) => {
    o = Object.assign({ boyut: 32, agirlik: 500 }, o);
    ctx.save(); ctx.font = fontStr(o); if (o.harfAra) ctx.letterSpacing = o.harfAra + 'px';
    const w = ctx.measureText(metin).width; ctx.restore(); return w;
  };
  /** Belirtilen genişliğe sığacak en büyük boyutu bul */
  E.sigdir = (ctx, metin, o, gen, enKucuk = 22) => {
    let b = o.boyut;
    while (b > enKucuk && E.yaziOlc(ctx, metin, Object.assign({}, o, { boyut: b })) > gen) b -= 1;
    return b;
  };

  /* ---------- Formül dizgisi (mini TeX) ----------
     Desteklenen: ^{..} _{..} \frac{a}{b} \sqrt{x} \sqrt[n]{x} \c{renk}{..} \t{düz metin}
     \b{kalın} \, (ince boşluk) \; (boşluk). Tek harfler italik serif (değişken),
     rakam ve işaretler düz. Unicode matematik sembolleri doğrudan yazılabilir.  */
  const ayristir = (src) => {
    let i = 0;
    const grup = () => {
      const dugumler = [];
      while (i < src.length) {
        const c = src[i];
        if (c === '}') { i++; return dugumler; }
        if (c === '{') { i++; dugumler.push({ tur: 'grup', ic: grup() }); continue; }
        if (c === '^' || c === '_') { i++; const arg = tekArg(); dugumler.push({ tur: c === '^' ? 'ust' : 'alt', ic: arg }); continue; }
        if (c === '\\') {
          i++;
          let ad = '';
          while (i < src.length && /[a-zA-Z]/.test(src[i])) ad += src[i++];
          if (!ad) { const s = src[i++]; dugumler.push({ tur: 'bosluk', w: s === ',' ? 0.18 : s === ';' ? 0.32 : s === '!' ? -0.12 : 0.25 }); continue; }
          if (ad === 'quad' || ad === 'qquad') { dugumler.push({ tur: 'bosluk', w: ad === 'quad' ? 1 : 2 }); continue; }
          if (ad === 'frac') { const a = tekArg(), b = tekArg(); dugumler.push({ tur: 'kesir', a, b }); continue; }
          if (ad === 'sqrt') {
            let n = null;
            if (src[i] === '[') { i++; let s = ''; while (src[i] !== ']') s += src[i++]; i++; n = ayristir(s); }
            dugumler.push({ tur: 'kok', ic: tekArg(), n }); continue;
          }
          if (ad === 'c') { const renk = hamArg(); dugumler.push({ tur: 'renk', renk, ic: tekArg() }); continue; }
          if (ad === 't') { dugumler.push({ tur: 'metin', s: hamArg() }); continue; }
          if (ad === 'b') { dugumler.push({ tur: 'kalin', ic: tekArg() }); continue; }
          if (ad === 'kutu') { const renk = hamArg(); dugumler.push({ tur: 'kutu', renk, ic: tekArg() }); continue; }
          if (ad === 'ustcizgi') { dugumler.push({ tur: 'ustcizgi', ic: tekArg() }); continue; }
          dugumler.push({ tur: 'sembol', s: ad });
          continue;
        }
        if (c === ' ') { i++; dugumler.push({ tur: 'bosluk', w: 0.0 }); continue; }
        i++;
        dugumler.push({ tur: 'k', s: c });
      }
      return dugumler;
    };
    const tekArg = () => {
      if (src[i] === '{') { i++; return grup(); }
      if (src[i] === '\\') { const bas = i; i++; let ad = ''; while (/[a-zA-Z]/.test(src[i] || '')) ad += src[i++]; return ayristir(src.slice(bas, i)); }
      return [{ tur: 'k', s: src[i++] }];
    };
    const hamArg = () => { if (src[i] !== '{') return ''; i++; let d = 1, s = ''; while (i < src.length) { const c = src[i++]; if (c === '{') d++; if (c === '}' && --d === 0) break; s += c; } return s; };
    return grup();
  };
  const ISLEC = '+−-=<>≤≥≠≈±·×÷∈∉⊂⊆∪∩⇒⇔→∧∨⊻≅∼:|';
  const fmCache = new Map();
  /** Kutu modeli: {w, a (taban üstü), d (taban altı), ciz(ctx,x,y)} */
  const kutula = (ctx, dugumler, boy, st) => {
    const parcalar = [];
    for (let j = 0; j < dugumler.length; j++) {
      const n = dugumler[j];
      if (n.tur === 'k') {
        const c = n.s;
        const harf = /[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(c) && !st.duz;
        const fnt = harf ? `italic ${st.kalin ? 600 : 420} ${boy}px ${E.FONT.serif}` : `${st.kalin ? 700 : 500} ${boy}px ${E.FONT.sans}`;
        ctx.font = fnt;
        let w = ctx.measureText(c).width;
        let oi = j - 1; while (oi >= 0 && dugumler[oi].tur === 'bosluk' && dugumler[oi].w === 0) oi--;
        const onceki = dugumler[oi];
        const tekli = (c === '−' || c === '-' || c === '+') && (!onceki || (onceki.tur === 'k' && '(=<>≤≥+−-·×'.includes(onceki.s)) || onceki.tur === 'bosluk');
        const islec = ISLEC.includes(c) && c !== '|' && !tekli && !st.kucuk;
        const pad = islec ? boy * 0.2 : c === ',' ? boy * 0.08 : 0;
        const renk = st.renk;
        parcalar.push({ w: w + pad * 2 + (harf ? boy * 0.03 : 0), a: boy * 0.74, d: boy * 0.24, ciz: (cx, x, y, al) => { cx.font = fnt; cx.fillStyle = R(renk()); cx.globalAlpha = al; cx.fillText(c, x + pad, y); } });
      } else if (n.tur === 'metin') {
        const fnt = `${st.kalin ? 700 : 500} ${boy}px ${E.FONT.sans}`;
        ctx.font = fnt; const w = ctx.measureText(n.s).width; const renk = st.renk;
        parcalar.push({ w, a: boy * 0.74, d: boy * 0.24, ciz: (cx, x, y, al) => { cx.font = fnt; cx.fillStyle = R(renk()); cx.globalAlpha = al; cx.fillText(n.s, x, y); } });
      } else if (n.tur === 'sembol') {
        const tablo = { cdot: '·', times: '×', le: '≤', ge: '≥', ne: '≠', in: '∈', notin: '∉', cup: '∪', cap: '∩', subset: '⊂', subseteq: '⊆', forall: '∀', exists: '∃', R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', pi: 'π', infty: '∞', to: '→', Rightarrow: '⇒', iff: '⇔', and: '∧', or: '∨', xor: '⊻', neg: '¬', pm: '±', approx: '≈', deg: '°', alpha: 'α', beta: 'β', theta: 'θ', sigma: 'σ', mu: 'μ', triangle: '△', angle: '∠', cong: '≅', sim: '∼', emptyset: '∅', setminus: '\\', minus: '−', ldots: '…' };
        const s = tablo[n.s] || n.s;
        const fnt = `500 ${boy}px ${E.FONT.math}`;
        ctx.font = fnt; const w = ctx.measureText(s).width; const renk = st.renk;
        const pad = '·×≤≥≠∈∉∪∩⊂⊆⇒⇔→∧∨⊻≅∼≈±\\'.includes(s) ? boy * 0.2 : 0;
        parcalar.push({ w: w + 2 * pad, a: boy * 0.74, d: boy * 0.24, ciz: (cx, x, y, al) => { cx.font = fnt; cx.fillStyle = R(renk()); cx.globalAlpha = al; cx.fillText(s, x + pad, y); } });
      } else if (n.tur === 'bosluk') {
        parcalar.push({ w: boy * n.w, a: 0, d: 0, ciz: () => {} });
      } else if (n.tur === 'grup') {
        parcalar.push(kutula(ctx, n.ic, boy, st));
      } else if (n.tur === 'kalin') {
        parcalar.push(kutula(ctx, n.ic, boy, Object.assign({}, st, { kalin: true })));
      } else if (n.tur === 'renk') {
        const rk = n.renk; parcalar.push(kutula(ctx, n.ic, boy, Object.assign({}, st, { renk: () => (st.renkZorla ? st.renk() : rk) })));
      } else if (n.tur === 'ust' || n.tur === 'alt') {
        const k = kutula(ctx, n.ic, boy * 0.62, Object.assign({}, st, { kucuk: true }));
        const onceki = parcalar[parcalar.length - 1];
        const kay = n.tur === 'ust' ? -Math.max(boy * 0.42, onceki ? onceki.a - boy * 0.3 : 0) : boy * 0.22;
        parcalar.push({ w: k.w + boy * 0.04, a: n.tur === 'ust' ? -kay + k.a : k.a - kay, d: n.tur === 'alt' ? kay + k.d : 0, ciz: (cx, x, y, al) => k.ciz(cx, x + boy * 0.02, y + kay, al) });
      } else if (n.tur === 'kesir') {
        const a = kutula(ctx, n.a, boy * 0.82, st), b = kutula(ctx, n.b, boy * 0.82, st);
        const w = Math.max(a.w, b.w) + boy * 0.3, ek = boy * 0.28; const renk = st.renk;
        parcalar.push({ w: w + boy * 0.16, a: a.a + a.d + ek + boy * 0.12, d: b.a + b.d + boy * 0.02, ciz: (cx, x, y, al) => {
          const xm = x + boy * 0.08, yc = y - ek;
          cx.globalAlpha = al; cx.fillStyle = R(renk()); cx.fillRect(xm, yc - boy * 0.03, w, Math.max(1.5, boy * 0.055));
          a.ciz(cx, xm + (w - a.w) / 2, yc - boy * 0.14 - a.d, al);
          b.ciz(cx, xm + (w - b.w) / 2, yc + boy * 0.12 + b.a, al);
        } });
      } else if (n.tur === 'kok') {
        const k = kutula(ctx, n.ic, boy, st); const renk = st.renk;
        const kn = n.n ? kutula(ctx, n.n, boy * 0.5, st) : null;
        const sol = boy * 0.62 + (kn ? Math.max(0, kn.w - boy * 0.25) : 0);
        const ust = k.a + boy * 0.14;
        parcalar.push({ w: sol + k.w + boy * 0.12, a: ust + boy * 0.06, d: k.d + boy * 0.04, ciz: (cx, x, y, al) => {
          cx.globalAlpha = al; cx.strokeStyle = R(renk()); cx.lineWidth = Math.max(1.6, boy * 0.06); cx.lineJoin = 'round'; cx.lineCap = 'round';
          const x0 = x + sol - boy * 0.6;
          cx.beginPath();
          cx.moveTo(x0, y - boy * 0.22);
          cx.lineTo(x0 + boy * 0.14, y - boy * 0.3);
          cx.lineTo(x0 + boy * 0.32, y + k.d * 0.8);
          cx.lineTo(x0 + boy * 0.56, y - ust);
          cx.lineTo(x + sol + k.w + boy * 0.08, y - ust);
          cx.stroke();
          if (kn) kn.ciz(cx, x0 - boy * 0.02, y - boy * 0.42, al);
          k.ciz(cx, x + sol, y, al);
        } });
      } else if (n.tur === 'ustcizgi') {
        const k = kutula(ctx, n.ic, boy, st); const renk = st.renk;
        parcalar.push({ w: k.w, a: k.a + boy * 0.12, d: k.d, ciz: (cx, x, y, al) => { k.ciz(cx, x, y, al); cx.globalAlpha = al; cx.fillStyle = R(renk()); cx.fillRect(x, y - k.a - boy * 0.06, k.w, Math.max(1.5, boy * 0.05)); } });
      } else if (n.tur === 'kutu') {
        const k = kutula(ctx, n.ic, boy, st); const rk = n.renk; const p = boy * 0.16;
        parcalar.push({ w: k.w + p * 2, a: k.a + p, d: k.d + p, ciz: (cx, x, y, al) => {
          cx.globalAlpha = al * 0.9; cx.strokeStyle = R(rk); cx.lineWidth = Math.max(1.5, boy * 0.05);
          yuvarlakDik(cx, x, y - k.a - p, k.w + p * 2, k.a + k.d + p * 2, boy * 0.18); cx.stroke();
          cx.globalAlpha = al * 0.14; cx.fillStyle = R(rk); cx.fill();
          k.ciz(cx, x + p, y, al);
        } });
      }
    }
    let w = 0, a = 0, d = 0;
    for (const p of parcalar) { w += p.w; a = Math.max(a, p.a); d = Math.max(d, p.d); }
    return { w, a, d, parcalar, ciz: (cx, x, y, al, aciga) => {
      let xx = x;
      for (const p of parcalar) {
        let pa = al;
        if (aciga !== undefined) { const orta = (xx + p.w / 2 - x) / Math.max(w, 1); pa = al * clamp((aciga * 1.25 - orta) / 0.25); }
        if (pa > 0.003) p.ciz(cx, xx, y, pa);
        xx += p.w;
      }
    } };
  };
  /**
   * Formül çiz. opt: boyut, renk, hiza(left|center|right), alfa, aciga(0..1 soldan sağa belirme), parilti
   * Dönüş: {w, a, d}
   */
  E.formul = (ctx, src, x, y, o = {}) => {
    o = Object.assign({ boyut: 40, renk: 'tebesir', hiza: 'center', alfa: 1 }, o);
    if (o.alfa <= 0.002) return { w: 0 };
    ctx.save();
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const renkF = () => o.renk;
    const k = kutula(ctx, ayristir(src), o.boyut, { renk: renkF, kalin: o.kalin, renkZorla: o.renkZorla });
    const x0 = o.hiza === 'center' ? x - k.w / 2 : o.hiza === 'right' ? x - k.w : x;
    const yb = y + (k.a - k.d) / 2; // dikey ortala
    const al = ctx.globalAlpha * o.alfa;
    if (o.parilti) { ctx.save(); ctx.shadowColor = E.rgba(o.parRenk || o.renk, 0.8); ctx.shadowBlur = o.boyut * 0.5 * o.parilti; k.ciz(ctx, x0, yb, al, o.aciga); ctx.restore(); }
    k.ciz(ctx, x0, yb, al, o.aciga);
    ctx.restore();
    kaydet(ctx, x0, yb - k.a, x0 + k.w, yb + k.d, o.boyut * (o.minOlcek || 1), o.alfa * (o.aciga === undefined ? 1 : clamp(o.aciga * 2)), src.replace(/\\[a-z]+/g, ''), o);
    return { w: k.w, a: k.a, d: k.d, x0 };
  };
  E.formulOlc = (ctx, src, boyut = 40) => { ctx.save(); const k = kutula(ctx, ayristir(src), boyut, { renk: () => 'tebesir' }); ctx.restore(); return { w: k.w, a: k.a, d: k.d }; };

  /* ---------- Şekil yardımcıları ---------- */
  const yuvarlakDik = (E.yuvarlakDik = (ctx, x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  });
  /** Işıklı çizgi/çoklu çizgi. pts: [[x,y],...]; opt: renk, kalinlik, parilti, p (çizim ilerlemesi), kesik, alfa, kapali, ucu(ok) */
  E.cizgi = (ctx, pts, o = {}) => {
    o = Object.assign({ renk: 'tebesir', kalinlik: 3, parilti: 0, p: 1, alfa: 1 }, o);
    if (o.alfa <= 0.002 || o.p <= 0 || pts.length < 2) return;
    let yol = pts;
    if (o.kapali) yol = pts.concat([pts[0]]);
    if (o.p < 1) {
      let top = 0; const uz = [];
      for (let i = 1; i < yol.length; i++) { const d = Math.hypot(yol[i][0] - yol[i - 1][0], yol[i][1] - yol[i - 1][1]); uz.push(d); top += d; }
      let hedef = top * o.p; const yeni = [yol[0]];
      for (let i = 1; i < yol.length; i++) {
        if (hedef >= uz[i - 1]) { yeni.push(yol[i]); hedef -= uz[i - 1]; }
        else { const q = hedef / uz[i - 1]; yeni.push([lerp(yol[i - 1][0], yol[i][0], q), lerp(yol[i - 1][1], yol[i][1], q)]); break; }
      }
      yol = yeni;
    }
    ctx.save();
    ctx.globalAlpha *= o.alfa;
    ctx.lineCap = o.uc || 'round'; ctx.lineJoin = 'round';
    if (o.kesik) ctx.setLineDash(o.kesik);
    const yolCiz = () => { ctx.beginPath(); ctx.moveTo(yol[0][0], yol[0][1]); for (let i = 1; i < yol.length; i++) ctx.lineTo(yol[i][0], yol[i][1]); };
    if (o.parilti) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = E.rgba(o.renk, 0.16 * o.parilti); ctx.lineWidth = o.kalinlik * 5; yolCiz(); ctx.stroke();
      ctx.strokeStyle = E.rgba(o.renk, 0.3 * o.parilti); ctx.lineWidth = o.kalinlik * 2.4; yolCiz(); ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = R(o.renk); ctx.lineWidth = o.kalinlik; yolCiz(); ctx.stroke();
    if (o.ok && yol.length >= 2) {
      const a = yol[yol.length - 2], b = yol[yol.length - 1];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), s = o.okBoy || o.kalinlik * 4.5;
      ctx.setLineDash([]);
      ctx.fillStyle = R(o.renk);
      ctx.beginPath(); ctx.moveTo(b[0] + Math.cos(ang) * s * 0.3, b[1] + Math.sin(ang) * s * 0.3);
      ctx.lineTo(b[0] - Math.cos(ang - 0.45) * s, b[1] - Math.sin(ang - 0.45) * s);
      ctx.lineTo(b[0] - Math.cos(ang + 0.45) * s, b[1] - Math.sin(ang + 0.45) * s); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };
  E.ok = (ctx, x0, y0, x1, y1, o = {}) => E.cizgi(ctx, [[x0, y0], [x1, y1]], Object.assign({ ok: true }, o));
  /** Çokgen dolgu */
  E.cokgen = (ctx, pts, o = {}) => {
    o = Object.assign({ renk: 'turkuaz', alfa: 0.25 }, o);
    if (o.alfa <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= o.alfa; ctx.fillStyle = o.dolgu || R(o.renk);
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (o.kenar) E.cizgi(ctx, pts, { renk: o.kenarRenk || o.renk, kalinlik: o.kalinlik || 3, kapali: true, parilti: o.parilti || 0, alfa: o.kenarAlfa ?? 1, p: o.p ?? 1 });
  };
  /** Işıklı nokta */
  E.nokta = (ctx, x, y, r, o = {}) => {
    o = Object.assign({ renk: 'tebesir', alfa: 1, parilti: 1, bos: false }, o);
    if (o.alfa <= 0.002 || r <= 0) return;
    ctx.save(); ctx.globalAlpha *= o.alfa;
    if (o.parilti) E.isik(ctx, x, y, r * 4.5, o.renk, 0.55 * o.parilti);
    ctx.beginPath(); ctx.arc(x, y, r, 0, E.TAU);
    if (o.bos) { ctx.fillStyle = R('gece'); ctx.fill(); ctx.lineWidth = Math.max(2, r * 0.38); ctx.strokeStyle = R(o.renk); ctx.stroke(); }
    else { ctx.fillStyle = R(o.renk); ctx.fill(); }
    ctx.restore();
  };
  /** Yumuşak ışık (toplamalı radyal gradyan) */
  E.isik = (ctx, x, y, r, renk = 'turkuaz', guc = 0.5) => {
    if (guc <= 0.002 || r <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, E.rgba(renk, guc)); g.addColorStop(0.35, E.rgba(renk, guc * 0.35)); g.addColorStop(1, E.rgba(renk, 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  };
  /** Açı yayı: merkez, başlangıç açısı, bitiş açısı (radyan, ekran koordinatı) */
  E.aciYayi = (ctx, x, y, r, a0, a1, o = {}) => {
    o = Object.assign({ renk: 'limon', kalinlik: 3, alfa: 1, dolgu: 0.18, p: 1 }, o);
    if (o.alfa <= 0.002) return;
    const a1p = a0 + (a1 - a0) * o.p;
    ctx.save(); ctx.globalAlpha *= o.alfa;
    if (o.dolgu) { ctx.fillStyle = E.rgba(o.renk, o.dolgu); ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, a0, a1p, a1p < a0); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = R(o.renk); ctx.lineWidth = o.kalinlik; ctx.beginPath(); ctx.arc(x, y, r, a0, a1p, a1p < a0); ctx.stroke();
    ctx.restore();
  };
  /** Dik açı işareti */
  E.dikAci = (ctx, x, y, a, s, o = {}) => {
    const ux = Math.cos(a), uy = Math.sin(a), vx = Math.cos(a + Math.PI / 2), vy = Math.sin(a + Math.PI / 2);
    E.cizgi(ctx, [[x + ux * s, y + uy * s], [x + ux * s + vx * s, y + uy * s + vy * s], [x + vx * s, y + vy * s]], Object.assign({ renk: 'gumus', kalinlik: 2.5 }, o));
  };
  /** Yarı saydam panel (cam) */
  E.panel = (ctx, x, y, w, h, o = {}) => {
    o = Object.assign({ r: 18, alfa: 1, renk: 'lacivert', kenar: 'sis', dolguAlfa: 0.72 }, o);
    if (o.alfa <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= o.alfa;
    yuvarlakDik(ctx, x, y, w, h, o.r);
    ctx.fillStyle = E.rgba(o.renk, o.dolguAlfa); ctx.fill();
    if (o.kenar) { ctx.strokeStyle = E.rgba(o.kenar, o.kenarAlfa ?? 0.9); ctx.lineWidth = o.kalinlik || 1.5; ctx.stroke(); }
    if (o.vurgu) { ctx.save(); ctx.clip(); ctx.fillStyle = E.rgba(o.vurgu, 0.9); ctx.fillRect(x, y, 5, h); ctx.restore(); }
    ctx.restore();
  };
  /** Etiket: yazı + arkasında yuvarlak plaka */
  E.etiket = (ctx, metin, x, y, o = {}) => {
    o = Object.assign({ boyut: 26, renk: 'tebesir', plaka: 'gece', plakaAlfa: 0.7, kenar: null, hiza: 'center', alfa: 1, formul: false }, o);
    if (o.alfa <= 0.002) return;
    const w = o.formul ? E.formulOlc(ctx, metin, o.boyut).w : E.yaziOlc(ctx, metin, o);
    const px = o.boyut * 0.5, py = o.boyut * 0.32, h = o.boyut * 1.25;
    const x0 = o.hiza === 'center' ? x - w / 2 : o.hiza === 'right' ? x - w : x;
    E.panel(ctx, x0 - px, y - h / 2 - py * 0.3, w + px * 2, h + py * 0.6, { r: h * 0.5, renk: o.plaka, dolguAlfa: o.plakaAlfa, kenar: o.kenar, alfa: o.alfa });
    if (o.formul) E.formul(ctx, metin, x0, y, Object.assign({}, o, { hiza: 'left' }));
    else E.yazi(ctx, metin, x0, y, Object.assign({}, o, { hiza: 'left' }));
  };

  /* ---------- Koordinat düzlemi ---------- */
  /** opt: x, y, w, h (ekran kutusu); xmin,xmax,ymin,ymax (matematik) */
  E.duzlem = (o) => {
    const d = Object.assign({ xmin: -5, xmax: 5, ymin: -5, ymax: 5 }, o);
    d.sx = d.w / (d.xmax - d.xmin);
    d.sy = d.h / (d.ymax - d.ymin);
    d.px = (x) => d.x + (x - d.xmin) * d.sx;
    d.py = (y) => d.y + d.h - (y - d.ymin) * d.sy;
    d.p = (x, y) => [d.px(x), d.py(y)];
    d.mx = (px) => d.xmin + (px - d.x) / d.sx;
    d.my = (py) => d.ymin + (d.y + d.h - py) / d.sy;
    /** Izgara ve eksenler */
    d.ciz = (ctx, so = {}) => {
      so = Object.assign({ alfa: 1, izgara: true, etiket: true, adim: 1, etiketAdim: so.adim || 1, boyut: 22, p: 1, xAd: 'x', yAd: 'y' }, so);
      if (so.alfa <= 0.002) return;
      ctx.save(); ctx.globalAlpha *= so.alfa;
      ctx.beginPath(); ctx.rect(d.x - 2, d.y - 2, d.w + 4, d.h + 4); ctx.save(); ctx.clip();
      if (so.izgara) {
        ctx.strokeStyle = E.rgba('sis', 0.55); ctx.lineWidth = 1;
        for (let x = Math.ceil(d.xmin / so.adim) * so.adim; x <= d.xmax + 1e-9; x += so.adim) { ctx.beginPath(); ctx.moveTo(d.px(x), d.y); ctx.lineTo(d.px(x), d.y + d.h * so.p); ctx.stroke(); }
        for (let y = Math.ceil(d.ymin / so.adim) * so.adim; y <= d.ymax + 1e-9; y += so.adim) { ctx.beginPath(); ctx.moveTo(d.x, d.py(y)); ctx.lineTo(d.x + d.w * so.p, d.py(y)); ctx.stroke(); }
      }
      ctx.restore();
      const ox = clamp(d.px(0), d.x, d.x + d.w), oy = clamp(d.py(0), d.y, d.y + d.h);
      E.cizgi(ctx, [[d.x, oy], [d.x + d.w, oy]], { renk: 'cizgi', kalinlik: 2.2, p: so.p, ok: true, okBoy: 12 });
      E.cizgi(ctx, [[ox, d.y + d.h], [ox, d.y]], { renk: 'cizgi', kalinlik: 2.2, p: so.p, ok: true, okBoy: 12 });
      if (so.etiket) {
        for (let x = Math.ceil(d.xmin / so.etiketAdim) * so.etiketAdim; x <= d.xmax - so.etiketAdim * 0.5; x += so.etiketAdim) {
          if (Math.abs(x) < 1e-9) continue;
          E.yazi(ctx, fmt(x), d.px(x), oy + so.boyut * 0.95, { boyut: so.boyut, renk: 'gumus', agirlik: 500, alfa: so.p });
        }
        for (let y = Math.ceil(d.ymin / so.etiketAdim) * so.etiketAdim; y <= d.ymax - so.etiketAdim * 0.5; y += so.etiketAdim) {
          if (Math.abs(y) < 1e-9) continue;
          E.yazi(ctx, fmt(y), ox - so.boyut * 0.5, d.py(y), { boyut: so.boyut, renk: 'gumus', agirlik: 500, hiza: 'right', alfa: so.p });
        }
        E.formul(ctx, so.xAd, d.x + d.w - so.boyut * 0.4, oy - so.boyut * 0.95, { boyut: so.boyut * 1.15, renk: 'gumus', alfa: so.p });
        E.formul(ctx, so.yAd, ox + so.boyut * 0.85, d.y + so.boyut * 0.5, { boyut: so.boyut * 1.15, renk: 'gumus', alfa: so.p });
      }
      ctx.restore();
    };
    /** Fonksiyon eğrisi; p: soldan sağa çizim ilerlemesi */
    d.egri = (ctx, f, so = {}) => {
      so = Object.assign({ renk: 'turkuaz', kalinlik: 4, parilti: 0.8, p: 1, x0: d.xmin, x1: d.xmax, n: 240 }, so);
      const pts = [];
      const x1 = lerp(so.x0, so.x1, clamp(so.p));
      for (let i = 0; i <= so.n; i++) {
        const x = lerp(so.x0, x1, i / so.n), y = f(x);
        if (!isFinite(y)) continue;
        pts.push([d.px(x), d.py(clamp(y, d.ymin - (d.ymax - d.ymin), d.ymax + (d.ymax - d.ymin)))]);
      }
      ctx.save(); ctx.beginPath(); ctx.rect(d.x, d.y, d.w, d.h); ctx.clip();
      E.cizgi(ctx, pts, so);
      ctx.restore();
    };
    return d;
  };
  /* ---------- Sayı doğrusu ---------- */
  /** opt: x, y (eksen çizgisinin ekran yeri), w (piksel genişlik), min, max */
  E.sayiDogrusu = (o) => {
    const d = Object.assign({ min: -5, max: 5 }, o);
    d.px = (v) => d.x + ((v - d.min) / (d.max - d.min)) * d.w;
    d.mx = (px) => d.min + ((px - d.x) / d.w) * (d.max - d.min);
    /** Eksen, çentikler ve sayılar. so: adim, etiketAdim, boyut, p (çizim), alfa, renk, etiketFn */
    d.ciz = (ctx, so = {}) => {
      so = Object.assign({ adim: 1, boyut: 24, p: 1, alfa: 1, renk: 'cizgi', cubuk: 12 }, so);
      if (so.alfa <= 0.002) return;
      const ea = so.etiketAdim || so.adim;
      ctx.save(); ctx.globalAlpha *= so.alfa;
      E.cizgi(ctx, [[d.x - 24, d.y], [d.x + d.w + 24, d.y]], { renk: so.renk, kalinlik: 2.5, p: so.p, ok: true, okBoy: 13 });
      for (let v = Math.ceil(d.min / so.adim) * so.adim; v <= d.max + 1e-9; v += so.adim) {
        const x = d.px(v), q = clamp((so.p * (d.w + 48) - (x - d.x + 24)) / 40);
        if (q <= 0) continue;
        const ana = Math.abs(v / ea - Math.round(v / ea)) < 1e-6;
        E.cizgi(ctx, [[x, d.y - (ana ? so.cubuk : so.cubuk * 0.55)], [x, d.y + (ana ? so.cubuk : so.cubuk * 0.55)]], { renk: so.renk, kalinlik: ana ? 2.2 : 1.5, alfa: q });
        if (ana && so.etiket !== false) E.yazi(ctx, so.etiketFn ? so.etiketFn(v) : fmt(v), x, d.y + so.cubuk + so.boyut * 0.85, { boyut: so.boyut, renk: 'gumus', agirlik: 520, alfa: q });
      }
      ctx.restore();
    };
    /** Aralık ışını: [a,b]; so: acikSol, acikSag, renk, kalinlik, yukseklik (y kayması), p, alfa, sonsuzSol/Sag */
    d.aralik = (ctx, a, b, so = {}) => {
      so = Object.assign({ renk: 'turkuaz', kalinlik: 7, dy: 0, p: 1, alfa: 1, uc: true, r: 8 }, so);
      if (so.alfa <= 0.002 || so.p <= 0) return;
      const xa = a === -Infinity ? d.x - 24 : d.px(a), xb = b === Infinity ? d.x + d.w + 24 : d.px(b);
      const y = d.y + so.dy;
      const xm = (xa + xb) / 2, yar = ((xb - xa) / 2) * so.p;
      ctx.save(); ctx.globalAlpha *= so.alfa;
      E.cizgi(ctx, [[xm - yar, y], [xm + yar, y]], { renk: so.renk, kalinlik: so.kalinlik, parilti: 1, uc: 'butt' });
      if (so.uc && so.p > 0.98) {
        if (a !== -Infinity) E.nokta(ctx, xa, y, so.r, { renk: so.renk, bos: !!so.acikSol, parilti: 0.8 });
        if (b !== Infinity) E.nokta(ctx, xb, y, so.r, { renk: so.renk, bos: !!so.acikSag, parilti: 0.8 });
      }
      ctx.restore();
    };
    return d;
  };

  const fmt = (E.sayiYaz = (v, basamak = 2) => {
    let s = (Math.round(v * Math.pow(10, basamak)) / Math.pow(10, basamak)).toString();
    return s.replace('-', '−').replace('.', ',');
  });

  /* ---------- Kamera ---------- */
  /** kam: {x, y, z (yakınlaştırma), r (dönme, rad)} — (x,y) ekran merkezine gelir */
  E.kamera = (ctx, kam) => {
    const z = kam.z ?? 1;
    ctx.translate(E.W / 2, E.H / 2);
    ctx.scale(z, z);
    if (kam.r) ctx.rotate(kam.r);
    ctx.translate(-(kam.x ?? E.W / 2), -(kam.y ?? E.H / 2));
  };

  /* ---------- Atmosfer: derinlik, ışık, gren ---------- */
  let grenDokulari = null;
  const grenHazirla = () => {
    grenDokulari = [];
    for (let k = 0; k < 4; k++) {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const g = c.getContext('2d'); const img = g.createImageData(256, 256); const r = E.rng(9001 + k);
      for (let i = 0; i < img.data.length; i += 4) { const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      g.putImageData(img, 0, 0); grenDokulari.push(c);
    }
  };
  /** Zemin: koyu gradyan + yavaş sürüklenen renk bulutları + paralaks toz */
  E.zemin = (ctx, t, o = {}) => {
    o = Object.assign({ kx: 0, ky: 0, renk1: 'turkuaz', renk2: 'menekse', bulut: 1, toz: 1, tohum: 7 }, o);
    const W = E.W, H = E.H;
    const g = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.5, Math.hypot(W, H) * 0.62);
    g.addColorStop(0, '#111A30'); g.addColorStop(0.55, '#0B1122'); g.addColorStop(1, '#05070E');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (o.bulut > 0) {
      const b = [
        [0.22 + 0.05 * Math.sin(t * 0.05), 0.3 + 0.04 * Math.cos(t * 0.04), 0.55, o.renk1, 0.075],
        [0.8 + 0.04 * Math.cos(t * 0.045), 0.68 + 0.05 * Math.sin(t * 0.05), 0.6, o.renk2, 0.085],
        [0.6 + 0.06 * Math.sin(t * 0.03 + 2), 0.12, 0.4, 'gok', 0.045],
      ];
      for (const [bx, by, br, rk, a] of b) E.isik(ctx, bx * W - o.kx * 0.15, by * H - o.ky * 0.15, br * Math.max(W, H), rk, a * o.bulut);
    }
    if (o.toz > 0) {
      const r = E.rng(o.tohum * 7919);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 90; i++) {
        const derinlik = 0.2 + r() * 0.8; // 1 yakın
        const x0 = r() * W, y0 = r() * H, hiz = 4 + r() * 10, faz = r() * 6.28, boy = 0.6 + derinlik * 1.6;
        let x = (x0 - o.kx * derinlik * 0.5 + Math.sin(t * 0.13 + faz) * 12 * derinlik) % W; if (x < 0) x += W;
        let y = (y0 - t * hiz * derinlik - o.ky * derinlik * 0.5) % H; if (y < 0) y += H;
        const tit = 0.55 + 0.45 * Math.sin(t * (0.6 + r()) + faz);
        ctx.fillStyle = E.rgba(i % 7 === 0 ? 'turkuaz' : 'tebesir', 0.12 * derinlik * tit * o.toz);
        ctx.beginPath(); ctx.arc(x, y, boy, 0, E.TAU); ctx.fill();
      }
      ctx.restore();
    }
  };
  /** Son işlem: vinyet + gren (kare numarasına bağlı, deterministik) */
  E.sonIslem = (ctx, t, o = {}) => {
    o = Object.assign({ vinyet: 0.55, gren: 0.045 }, o);
    const W = E.W, H = E.H;
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.6);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${o.vinyet})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    if (o.gren > 0) {
      if (!grenDokulari) grenHazirla();
      const kare = Math.round(t * E.FPS);
      const doku = grenDokulari[kare & 3];
      const ox = Math.floor(E.hash(kare, 1) * 256), oy = Math.floor(E.hash(kare, 2) * 256);
      ctx.save(); ctx.globalAlpha = o.gren; ctx.globalCompositeOperation = 'overlay';
      ctx.translate(-ox, -oy);
      ctx.fillStyle = ctx.createPattern(doku, 'repeat'); ctx.fillRect(ox, oy, W, H);
      ctx.restore();
    }
  };
  /** Işık süpürmesi (geçişlerde): p 0..1 boyunca çapraz bir ışık bandı geçer */
  E.isikSupur = (ctx, p, o = {}) => {
    if (p <= 0 || p >= 1) return;
    o = Object.assign({ renk: 'turkuaz', guc: 0.35, aci: -0.5 }, o);
    const W = E.W, H = E.H, uz = Math.hypot(W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.translate(W / 2, H / 2); ctx.rotate(o.aci);
    const x = lerp(-uz * 0.8, uz * 0.8, e.io2(p));
    const g = ctx.createLinearGradient(x - 220, 0, x + 220, 0);
    const a = Math.sin(p * Math.PI) * o.guc;
    g.addColorStop(0, E.rgba(o.renk, 0)); g.addColorStop(0.5, E.rgba(o.renk, a)); g.addColorStop(1, E.rgba(o.renk, 0));
    ctx.fillStyle = g; ctx.fillRect(x - 220, -uz, 440, uz * 2); ctx.restore();
  };

  /* ---------- Altyazı ---------- */
  E.dil = 'tr'; // 'tr' | 'en' | 'iki' | 'yok'
  E.altyaziBul = (t) => {
    const A = window.ALTYAZI || [];
    for (const a of A) if (t >= a.bas && t < a.son) return a;
    return null;
  };
  E.altyaziCiz = (ctx, t, dil = E.dil) => {
    if (dil === 'yok') return;
    const a = E.altyaziBul(t);
    if (!a) return;
    const giris = clamp((t - a.bas) / 0.18), cikis = clamp((a.son - t) / 0.18);
    const al = Math.min(giris, cikis);
    const L = E.L;
    const trB = E.yd(31, 33), enB = E.yd(25, 27);
    ctx.save();
    const satirlar = [];
    ctx.font = fontStr({ boyut: trB, agirlik: 560 });
    if (dil === 'tr' || dil === 'iki') for (const s of E.sar(ctx, a.tr, L.altyazi.gen)) satirlar.push({ s, b: trB, renk: 'tebesir', ag: 560 });
    ctx.font = fontStr({ boyut: dil === 'en' ? trB : enB, agirlik: 480 });
    if (dil === 'en' || dil === 'iki') for (const s of E.sar(ctx, a.en, L.altyazi.gen)) satirlar.push({ s, b: dil === 'en' ? trB : enB, renk: dil === 'en' ? 'tebesir' : 'gumus', ag: dil === 'en' ? 560 : 480 });
    const lh = (b) => b * 1.3;
    const top = satirlar.reduce((s, x) => s + lh(x.b), 0);
    let gen = 0;
    for (const x of satirlar) { ctx.font = fontStr({ boyut: x.b, agirlik: x.ag }); gen = Math.max(gen, ctx.measureText(x.s).width); }
    const yAlt = L.altyazi.y;
    const y0 = yAlt - top;
    ctx.globalAlpha = al;
    E.panel(ctx, L.cx - gen / 2 - 22, y0 - 12, gen + 44, top + 22, { r: 14, renk: 'gece', dolguAlfa: 0.62, kenar: null });
    let y = y0;
    for (const x of satirlar) {
      E.yazi(ctx, x.s, L.cx, y + lh(x.b) / 2, { boyut: x.b, agirlik: x.ag, renk: x.renk, altyazi: true });
      y += lh(x.b);
    }
    ctx.restore();
  };

  /* ---------- Kartlar: açılış imzası, başlık, özet, bitiş ---------- */
  /** Seri imzası: bir ışık çizgisi (eksen) çizilir, üzerinde EKSEN yazısı belirir */
  E.imza = (ctx, s, meta) => {
    const L = E.L, t = s.t;
    const y = L.cy - E.yd(20, 60);
    const yar = E.yd(420, 280);
    const p1 = E.ara(t, 0.1, 1.4, 'io3');
    E.cizgi(ctx, [[L.cx - yar * p1, y], [L.cx + yar * p1, y]], { renk: 'turkuaz', kalinlik: 2.5, parilti: 1.2 });
    E.isik(ctx, L.cx + yar * p1, y, 90, 'turkuaz', 0.5 * (1 - E.ara(t, 1.2, 2)));
    E.isik(ctx, L.cx - yar * p1, y, 90, 'turkuaz', 0.5 * (1 - E.ara(t, 1.2, 2)));
    // çentikler
    for (let i = -4; i <= 4; i++) {
      const a = E.ara(t, 0.8 + Math.abs(i) * 0.06, 1.2 + Math.abs(i) * 0.06);
      const x = L.cx + i * (yar / 4.5);
      E.cizgi(ctx, [[x, y - 9 * a], [x, y + 9 * a]], { renk: i === 0 ? 'limon' : 'turkuaz', kalinlik: 2, alfa: a * 0.9 });
    }
    const a2 = E.ara(t, 1.1, 2.0, 'cik3');
    E.yazi(ctx, 'EKSEN', L.cx, y - E.yd(62, 66) + (1 - a2) * 16, { boyut: E.yd(78, 76), agirlik: 760, harfAra: E.yd(26, 18), alfa: a2, parilti: 0.35, parRenk: 'turkuaz' });
    E.yazi(ctx, '9. SINIF MATEMATİK FİLMLERİ', L.cx, y + E.yd(46, 50), { boyut: E.yd(24, 24), agirlik: 600, harfAra: 6, renk: 'gumus', alfa: E.ara(t, 1.5, 2.3) });
  };
  /** Başlık kartı: kod, film adı (TR) ve İngilizce adı */
  E.baslikKarti = (ctx, s, meta, o = {}) => {
    const L = E.L, t = s.t;
    const a1 = E.ara(t, 0.0, 0.8, 'cik3'), a2 = E.ara(t, 0.3, 1.2, 'cik3'), a3 = E.ara(t, 0.7, 1.5, 'cik3');
    const y = L.cy - E.yd(10, 80);
    E.yazi(ctx, meta.kod + '  ·  ' + meta.tema.toLocaleUpperCase('tr'), L.cx, y - E.yd(92, 120), { boyut: E.yd(24, 24), agirlik: 620, harfAra: 4, renk: 'turkuaz', alfa: a1 });
    const ad = meta.ad;
    const boy = E.sigdir(ctx, ad, { boyut: E.yd(92, 84), agirlik: 760 }, L.icerik.w - 40, 40);
    const r = E.yazi(ctx, ad, L.cx, y + (1 - a2) * 22, { boyut: boy, agirlik: 760, alfa: a2, maxGen: L.icerik.w - 20, satirAra: 1.05 });
    E.yazi(ctx, meta.adEn, L.cx, y + r.h / 2 + E.yd(40, 48), { boyut: E.yd(30, 30), agirlik: 420, renk: 'gumus', alfa: a3, italik: false });
    const cy = y + r.h / 2 + E.yd(90, 104);
    E.cizgi(ctx, [[L.cx - 60 * a3, cy], [L.cx + 60 * a3, cy]], { renk: 'limon', kalinlik: 3, parilti: 0.6, alfa: a3 });
  };
  /** "Aklında kalsın" kartı. maddeler: [{tr, formul?}] */
  E.ozetKarti = (ctx, s, maddeler, o = {}) => {
    const L = E.L, t = s.t, ic = L.icerik;
    const bas = E.ara(t, 0, 0.8, 'cik3');
    E.yazi(ctx, 'AKLINDA KALSIN', L.cx, ic.y + E.yd(36, 60), { boyut: E.yd(30, 32), agirlik: 720, harfAra: 8, renk: 'limon', alfa: bas, parilti: 0.4, parRenk: 'limon' });
    const n = maddeler.length;
    const aralik = E.yd(Math.min(108, (ic.h - 110) / n), Math.min(170, (ic.h - 170) / n));
    const ust = E.yd(ic.y + 90 + Math.max(0, (ic.h - 110 - aralik * n) / 2), ic.y + 150);
    const gen = E.yd(Math.min(ic.w, 980), ic.w);
    maddeler.forEach((m, i) => {
      const a = E.ara(t, 0.7 + i * (o.aralik || 1.1), 1.5 + i * (o.aralik || 1.1), 'cik3');
      const y = ust + i * aralik + aralik / 2;
      const x0 = L.cx - gen / 2;
      E.nokta(ctx, x0 + 14, y - (m.formul ? E.yd(14, 30) : 0), 6, { renk: 'turkuaz', alfa: a });
      if (m.formul && E.yatay) {
        E.yazi(ctx, m.tr, x0 + 44, y, { boyut: 32, agirlik: 560, hiza: 'left', alfa: a, maxGen: gen * 0.48 });
        E.formul(ctx, m.formul, x0 + gen, y, { boyut: 38, hiza: 'right', renk: 'turkuaz', alfa: a });
      } else if (m.formul) {
        E.yazi(ctx, m.tr, x0 + 44, y - 30, { boyut: 30, agirlik: 560, hiza: 'left', alfa: a, maxGen: gen - 50 });
        E.formul(ctx, m.formul, x0 + 44, y + 36, { boyut: 36, hiza: 'left', renk: 'turkuaz', alfa: a });
      } else {
        E.yazi(ctx, m.tr, x0 + 44, y, { boyut: E.yd(32, 32), agirlik: 560, hiza: 'left', alfa: a, maxGen: gen - 50 });
      }
      E.cizgi(ctx, [[x0, y + aralik / 2 - 2], [x0 + gen * a, y + aralik / 2 - 2]], { renk: 'sis', kalinlik: 1, alfa: a * 0.8 });
    });
  };
  /** Bitiş kartı: laboratuvar QR'ı, bağlantı, künye */
  E.bitisKarti = (ctx, s, meta) => {
    const L = E.L, t = s.t, ic = L.icerik;
    const a1 = E.ara(t, 0, 0.9, 'cik3'), a2 = E.ara(t, 0.5, 1.4, 'cik3'), a3 = E.ara(t, 1.0, 1.9, 'cik3');
    const qrBoy = E.yd(220, 260);
    const qx = E.yd(L.cx + 170, L.cx - qrBoy / 2), qy = E.yd(L.cy - qrBoy / 2 - 40, ic.y + 330);
    const tx = E.yd(L.cx - 400, L.cx), hz = E.yd('left', 'center');
    E.yazi(ctx, 'ŞİMDİ SEN DENE', tx, E.yd(qy + 20, ic.y + 40), { boyut: 26, agirlik: 700, harfAra: 6, renk: 'turkuaz', hiza: hz, alfa: a1 });
    E.yazi(ctx, meta.labAd, tx, E.yd(qy + 82, ic.y + 120), { boyut: E.yd(50, 46), agirlik: 760, hiza: hz, alfa: a1, maxGen: E.yd(520, 600), satirAra: 1.05 });
    E.yazi(ctx, meta.labAciklama, tx, E.yd(qy + 158, ic.y + 210), { boyut: 26, agirlik: 460, renk: 'gumus', hiza: hz, alfa: a2, maxGen: E.yd(500, 600) });
    if (window.qrcode && meta.labUrl) {
      if (!E._qr || E._qr.url !== meta.labUrl) { const q = window.qrcode(0, 'M'); q.addData(meta.labUrl); q.make(); E._qr = { url: meta.labUrl, q }; }
      const q = E._qr.q, n = q.getModuleCount(), m = qrBoy / (n + 4);
      ctx.save(); ctx.globalAlpha *= a2;
      E.panel(ctx, qx, qy, qrBoy, qrBoy, { r: 16, renk: 'tebesir', dolguAlfa: 1, kenar: null });
      ctx.fillStyle = R('gece');
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) ctx.fillRect(qx + (c + 2) * m, qy + (r + 2) * m, m + 0.4, m + 0.4);
      ctx.restore();
      E.isik(ctx, qx + qrBoy / 2, qy + qrBoy / 2, qrBoy, 'turkuaz', 0.12 * a2);
    }
    E.yazi(ctx, meta.labUrl.replace('https://', ''), E.yd(qx + qrBoy / 2, L.cx), qy + qrBoy + 34, { boyut: 22, agirlik: 520, renk: 'gumus', alfa: a2, maxGen: E.yd(600, 640) });
    E.yazi(ctx, 'Eksen · Hakan Ataş · CC BY-NC 4.0', L.cx, ic.y1 - E.yd(6, 10), { boyut: 22, agirlik: 520, renk: 'gumus', alfa: a3, harfAra: 1 });
  };

  /* ---------- Film tanımı ve renderFrame ---------- */
  /**
   * def: { meta:{kod,tema,ad,adEn,labAd,labUrl,labAciklama}, sure, tohum,
   *        sahneler:[{ad, bas, son, ciz(ctx, s), gecis?:'kes'|'sol', giris?, cikis?}],
   *        zemin?:(t)=>opts, hazirla?:()=>Promise }
   */
  E.film = (def) => {
    E.F = def;
    def.sahneler.forEach((s) => { s.giris ??= 0.6; s.cikis ??= 0.6; });
    window.FILM_META = { sure: def.sure, fps: E.FPS, meta: def.meta, uc3b: def.uc3b || null, sahneler: def.sahneler.map((s) => ({ ad: s.ad, bas: s.bas, son: s.son })) };
    return def;
  };
  E.sahneAt = (t) => {
    const F = E.F; let son = null;
    for (const s of F.sahneler) if (t >= s.bas && t < s.son) son = s;
    return son;
  };
  /** Ana tuvale t anını çiz. Saf: yalnızca t, yerleşim ve dil ayarına bağlı. */
  E.ciz = (ctx, t, k = 1) => {
    const F = E.F;
    const W = E.W, H = E.H;
    E.olcek = k;
    t = clamp(t, 0, F.sure - 1e-6);
    E.t = t;
    if (E.denetim) E._kayit = [];
    ctx.save();
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    E.zemin(ctx, t, F.zemin ? F.zemin(t) : {});
    let ki = 0;
    for (const s of F.sahneler) {
      if (t < s.bas - 1e-9 || t >= s.son) continue;
      const lt = t - s.bas, d = s.son - s.bas;
      const g = s.giris > 0 ? E.ara(lt, 0, s.giris, 'io2') : 1;
      const c = s.cikis > 0 ? E.ara(lt, d - s.cikis, d, 'io2') : 0;
      const alfa = Math.min(g, 1 - c);
      const so = { t: lt, d, p: lt / d, alfa, T: t, L: E.L, g, c };
      E._sahneAdi = s.ad;
      const itme = s.itme ?? 0.018; // her sahnede yavaş kamera itmesi
      const kam = (cx) => { if (itme) { const z = 1 + itme * e.io2(lt / d); cx.translate(E.L.icerik.cx, E.L.icerik.cy); cx.scale(z, z); cx.translate(-E.L.icerik.cx, -E.L.icerik.cy); } };
      if (alfa >= 0.999) { E._katmanAlfa = 1; ctx.save(); kam(ctx); s.ciz(ctx, so); ctx.restore(); }
      else if (alfa > 0.002) {
        const kat = katman(ki++ % 3); const kc = kat.getContext('2d');
        kc.setTransform(1, 0, 0, 1, 0, 0); kc.globalAlpha = 1; kc.globalCompositeOperation = 'source-over'; kc.clearRect(0, 0, kat.width, kat.height);
        kc.setTransform(E.olcek, 0, 0, E.olcek, 0, 0);
        E._katmanAlfa = alfa;
        kc.save(); kam(kc); s.ciz(kc, so); kc.restore();
        ctx.globalAlpha = alfa; ctx.drawImage(kat, 0, 0, W, H); ctx.globalAlpha = 1;
      }
    }
    E._katmanAlfa = 1; E._sahneAdi = 'altyazı';
    if (F.ust) { ctx.save(); F.ust(ctx, t); ctx.restore(); }
    E.sonIslem(ctx, t, F.son ? F.son(t) : {});
    E.altyaziCiz(ctx, t);
    ctx.restore();
  };

  /* ---------- Fontlar ---------- */
  E.fontlarHazir = (async () => {
    const liste = window.EKSEN_FONTLARI || [];
    const yukle = liste.map(async (f) => {
      const ikili = Uint8Array.from(atob(f.veri), (c) => c.charCodeAt(0));
      const ff = new FontFace(f.ad, ikili.buffer, f.opt);
      await ff.load(); document.fonts.add(ff);
    });
    await Promise.all(yukle);
    await document.fonts.ready;
  })();
})();
