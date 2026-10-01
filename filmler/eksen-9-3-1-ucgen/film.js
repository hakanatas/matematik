/* ==========================================================================
   EKSEN 9.3.1 — 180'in Sırrı
   Tek fikir: Üçgenin üç açısı bir paralelin üstünde yan yana dizilince tam
   bir doğru açısı olur; 180, paralellerin (düzlemin) imzasıdır. Sürpriz:
   paralellerin olmadığı kürede aynı üçgen 270°'ye çıkar (3B sahne).
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp, yd } = E;

  const meta = {
    kod: 'MAT.9.3.1',
    tema: 'Geometrik Şekiller',
    ad: '180\u2019in Sırrı',
    adEn: 'The Secret of 180',
    labAd: 'Üçgen Laboratuvarı',
    labAciklama: 'Köşeleri sürükle: iç ve dış açılar, kenar–açı sırası, üçgen eşitsizliği çubukları ve küre üzerinde üçgen.',
    labUrl: 'https://hakanatas.github.io/eksen-lab-ucgen/',
  };

  /* ---------- 2B vektör yardımcıları ---------- */
  const TAU = Math.PI * 2;
  const topla = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const fark2 = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const kat = (a, k) => [a[0] * k, a[1] * k];
  const uz = (a) => Math.hypot(a[0], a[1]);
  const don = (a, th) => [a[0] * Math.cos(th) - a[1] * Math.sin(th), a[0] * Math.sin(th) + a[1] * Math.cos(th)];
  const ara2 = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
  const yon = (a) => Math.atan2(a[1], a[0]);
  const acFark = (a0, a1) => { let d = a1 - a0; while (d > Math.PI) d -= TAU; while (d <= -Math.PI) d += TAU; return d; };
  const derece = (r) => (r * 180) / Math.PI;
  const virgul = (v, b = 1) => v.toFixed(b).replace('.', ',');
  /** iç açı: tepe v, komşular p ve q → {a0, sw} */
  const icAci = (v, p, q) => { const a0 = yon(fark2(p, v)); return { a0, sw: acFark(a0, yon(fark2(q, v))) }; };
  /** Açı kaması: dolgu + yay */
  const kama = (ctx, v, a0, sw, r, renk, alfa = 1, dolgu = 0.3, kalin = 3) => {
    if (alfa <= 0.002 || Math.abs(sw) < 1e-4) return;
    ctx.save(); ctx.globalAlpha *= alfa;
    ctx.fillStyle = E.rgba(renk, dolgu);
    ctx.beginPath(); ctx.moveTo(v[0], v[1]); ctx.arc(v[0], v[1], r, a0, a0 + sw, sw < 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = E.R(renk); ctx.lineWidth = kalin; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(v[0], v[1], r, a0, a0 + sw, sw < 0); ctx.stroke();
    ctx.restore();
  };
  /** Kamanın açıortayı üzerinde bir nokta */
  const ortay = (v, a0, sw, d) => [v[0] + Math.cos(a0 + sw / 2) * d, v[1] + Math.sin(a0 + sw / 2) * d];
  /** Köşe harfi: ağırlık merkezinden dışarı doğru */
  const koseHarf = (ctx, h, v, g, d, o = {}) => {
    const u = fark2(v, g), l = uz(u) || 1;
    E.formul(ctx, h, v[0] + (u[0] / l) * d, v[1] + (u[1] / l) * d, Object.assign({ boyut: 32, renk: 'gumus' }, o));
  };
  const agirlik = (P) => [(P[0][0] + P[1][0] + P[2][0]) / 3, (P[0][1] + P[1][1] + P[2][1]) / 3];
  const RENK = ['turkuaz', 'mercan', 'menekse']; // α, β, γ
  const HARF = ['α', 'β', 'γ'];

  /* ---------- 3B: küre sahnesi (tembel kurulum, her karede t'den) ---------- */
  const v3 = {
    n: (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; },
    d: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    t: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
    top: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    cik: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  };
  /** Birim vektörler arası büyük çember (slerp) */
  const slerp = (a, b, s) => {
    const om = Math.acos(clamp(v3.d(a, b), -1, 1));
    if (om < 1e-6) return a.slice();
    const k0 = Math.sin((1 - s) * om) / Math.sin(om), k1 = Math.sin(s * om) / Math.sin(om);
    return [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1];
  };
  /** V'de P yönündeki teğet */
  const teget = (V, P) => v3.n(v3.cik(P, v3.t(V, v3.d(V, P))));
  /** Küresel üçgende V köşesindeki açı (radyan) */
  const kureAci = (V, P, Q) => Math.acos(clamp(v3.d(teget(V, P), teget(V, Q)), -1, 1));
  const KC = v3.n([1, 1, 1]);
  const KE = [[0, 1, 0], [1, 0, 0], [0, 0, 1]]; // Kuzey Kutbu, ekvatorda iki nokta
  const KU = KE.map((e) => v3.n(v3.cik(e, v3.t(KC, v3.d(e, KC)))));
  const RHO_TAM = Math.acos(1 / Math.sqrt(3)); // 54,7356°: kutup–ekvator üçgeni
  /** KC merkezli eşkenar küresel üçgen; rho = merkezden köşeye açısal uzaklık */
  const kureUcgen = (rho) => KU.map((u) => v3.n(v3.top(v3.t(KC, Math.cos(rho)), v3.t(u, Math.sin(rho)))));
  const rotY = (v, a) => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];

  let U = null;
  const ucHazirla = () => {
    if (U) return U;
    const T = window.THREE;
    const sahne = new T.Scene();
    E.uc.isiklar(sahne);
    const kam = new T.PerspectiveCamera(30, 1, 0.1, 60);
    const grup = new T.Group(); sahne.add(grup);
    const govdeMat = E.uc.malzeme('derin', { roughness: 0.58, metalness: 0.06, emissive: E.uc.renk('derin'), emissiveIntensity: 0.55, transparent: false, side: T.FrontSide });
    const govde = new T.Mesh(new T.SphereGeometry(1, 128, 96), govdeMat);
    grup.add(govde);
    // enlem–boylam ızgarası
    const nok = (la, lo, r = 1.002) => [r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo)];
    const izgPos = [];
    const ad = Math.PI / 60;
    for (let m = 0; m < 12; m++) {
      const lo = (m * Math.PI) / 6;
      for (let la = -Math.PI / 2; la < Math.PI / 2 - 1e-9; la += ad) izgPos.push(...nok(la, lo), ...nok(la + ad, lo));
    }
    for (const la of [-60, -30, 30, 60].map(E.der)) for (let lo = 0; lo < TAU - 1e-9; lo += ad) izgPos.push(...nok(la, lo), ...nok(la, lo + ad));
    const izgGeo = new T.BufferGeometry(); izgGeo.setAttribute('position', new T.Float32BufferAttribute(izgPos, 3));
    const izgMat = new T.LineBasicMaterial({ color: E.uc.renk('cizgi'), transparent: true, opacity: 0.7, toneMapped: false });
    const izgara = new T.LineSegments(izgGeo, izgMat); grup.add(izgara);
    const ekvPos = []; for (let lo = 0; lo < TAU - 1e-9; lo += ad) ekvPos.push(...nok(0, lo, 1.003), ...nok(0, lo + ad, 1.003));
    const ekvGeo = new T.BufferGeometry(); ekvGeo.setAttribute('position', new T.Float32BufferAttribute(ekvPos, 3));
    const ekvMat = new T.LineBasicMaterial({ color: E.uc.renk('gok'), transparent: true, opacity: 0.55, toneMapped: false });
    grup.add(new T.LineSegments(ekvGeo, ekvMat));
    // kutup ekseni (ince)
    const eksen = E.uc.cubuk(new T.Vector3(0, -1.32, 0), new T.Vector3(0, 1.32, 0), 0.006, 'gumus', { opacity: 0.55 });
    eksen.material.toneMapped = false; grup.add(eksen);
    // kenar tüpleri ve açı yayları
    const tupMat = (renk) => new T.MeshBasicMaterial({ color: E.uc.renk(renk), toneMapped: false });
    const bos = () => new T.BufferGeometry();
    const kenarlar = [0, 1, 2].map(() => { const m = new T.Mesh(bos(), tupMat('tebesir')); grup.add(m); return m; });
    const yaylar = [0, 1, 2].map((i) => { const m = new T.Mesh(bos(), tupMat(RENK[i])); grup.add(m); return m; });
    // açı yelpazeleri (sabit topoloji, konumlar her karede)
    const NY = 28;
    const yelpazeler = [0, 1, 2].map((i) => {
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(new Float32Array((NY + 2) * 3), 3));
      const idx = []; for (let k = 0; k < NY; k++) idx.push(0, k + 1, k + 2);
      g.setIndex(idx);
      const m = new T.Mesh(g, new T.MeshBasicMaterial({ color: E.uc.renk(RENK[i]), transparent: true, opacity: 0.4, side: T.DoubleSide, depthWrite: false, toneMapped: false }));
      m.frustumCulled = false; grup.add(m); return m;
    });
    // üçgen yüzeyi (barisentrik ağ)
    const M = 24, ag = [];
    for (let i = 0; i <= M; i++) for (let j = 0; j <= M - i; j++) ag.push([i / M, j / M]);
    const id = (i, j) => { let s = 0; for (let k = 0; k < i; k++) s += M - k + 1; return s + j; };
    const yIdx = [];
    for (let i = 0; i < M; i++) for (let j = 0; j < M - i; j++) {
      yIdx.push(id(i, j), id(i + 1, j), id(i, j + 1));
      if (j < M - i - 1) yIdx.push(id(i + 1, j), id(i + 1, j + 1), id(i, j + 1));
    }
    const yGeo = new T.BufferGeometry();
    yGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(ag.length * 3), 3));
    yGeo.setIndex(yIdx);
    const yama = new T.Mesh(yGeo, new T.MeshBasicMaterial({ color: E.uc.renk('turkuaz'), transparent: true, opacity: 0.16, side: T.DoubleSide, depthWrite: false, toneMapped: false }));
    yama.frustumCulled = false; grup.add(yama);
    // yürüyen
    const yuruyen = new T.Mesh(new T.SphereGeometry(0.035, 20, 14), new T.MeshBasicMaterial({ color: E.uc.renk('limon'), toneMapped: false }));
    grup.add(yuruyen);
    U = { T, sahne, kam, grup, govde, izgMat, ekvMat, kenarlar, yaylar, yelpazeler, NY, yama, ag, yuruyen };
    return U;
  };
  const tupGuncelle = (mesh, pts, r) => {
    const T = U.T;
    mesh.geometry.dispose();
    if (pts.length < 2) { mesh.geometry = new T.BufferGeometry(); mesh.visible = false; return; }
    mesh.visible = true;
    mesh.geometry = new T.TubeGeometry(new T.CatmullRomCurve3(pts.map((p) => new T.Vector3(p[0], p[1], p[2]))), Math.max(4, pts.length * 2), r, 8, false);
  };
  /** Büyük çember yayı noktaları (p: çizim ilerlemesi) */
  const yayNoktalari = (a, b, p, r = 1.006, n = 40) => {
    const k = Math.max(1, Math.round(n * p)); const out = [];
    if (p <= 0.001) return out;
    for (let i = 0; i <= k; i++) out.push(v3.t(slerp(a, b, (p * i) / k), r));
    return out;
  };
  /** V köşesinde P→Q açısının küre üstündeki yayı/yelpazesi */
  const aciNoktalari = (V, P, Q, r, n) => {
    const tP = teget(V, P), tQ = teget(V, Q);
    const th = Math.acos(clamp(v3.d(tP, tQ), -1, 1));
    const w = v3.n(v3.cik(tQ, v3.t(tP, v3.d(tQ, tP))));
    const out = [];
    for (let i = 0; i <= n; i++) {
      const s = (th * i) / n;
      const dir = v3.top(v3.t(tP, Math.cos(s)), v3.t(w, Math.sin(s)));
      out.push(v3.t(v3.n(v3.top(v3.t(V, Math.cos(r)), v3.t(dir, Math.sin(r)))), 1.005));
    }
    return out;
  };

  /**
   * Küreyi çiz. o: kutu, kamDir, kamUz, fov, ry (küre dönüşü), tri (3 birim vektör),
   * kenarP [3], aciA [3], aciR, yamaA, yuruyen (birim vektör | null), alfa, izgA
   * Dönüş: ekran(v) → [x, y, görünür]
   */
  const kureCiz = (ctx, o) => {
    const k = o.kutu;
    if (!(E.uc && E.uc.var())) {
      // WebGL yoksa sade 2B yedek
      const r = Math.min(k.w, k.h) * 0.38;
      ctx.save(); ctx.globalAlpha *= o.alfa ?? 1; ctx.strokeStyle = E.R('turkuaz'); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(k.x + k.w / 2, k.y + k.h / 2, r, 0, TAU); ctx.stroke(); ctx.restore();
      return () => [k.x + k.w / 2, k.y + k.h / 2, false];
    }
    ucHazirla();
    const { kam, grup } = U;
    // kamera
    const cp = v3.t(v3.n(o.kamDir), o.kamUz);
    kam.fov = o.fov ?? 30; kam.aspect = k.w / k.h; kam.updateProjectionMatrix();
    kam.position.set(cp[0], cp[1], cp[2]);
    kam.up.set(0, 1, 0);
    // küreyi kutunun içinde istenen ekran noktasına kaydır: bakış hedefini kamera düzleminde ötele
    const ileri = v3.n(v3.t(cp, -1));
    const sag = v3.n([ileri[1] * 0 - ileri[2] * 1, ileri[2] * 0 - ileri[0] * 0, ileri[0] * 1 - ileri[1] * 0]);
    const yukari = [sag[1] * ileri[2] - sag[2] * ileri[1], sag[2] * ileri[0] - sag[0] * ileri[2], sag[0] * ileri[1] - sag[1] * ileri[0]];
    const upp = (2 * o.kamUz * Math.tan(E.der(kam.fov / 2))) / k.h;
    const dx = (o.merkez ? o.merkez[0] - (k.x + k.w / 2) : 0), dy = (o.merkez ? o.merkez[1] - (k.y + k.h / 2) : 0);
    const bak = v3.top(v3.t(sag, -dx * upp), v3.t(yukari, dy * upp));
    kam.lookAt(bak[0], bak[1], bak[2]);
    kam.updateMatrixWorld(true);
    grup.rotation.set(0, o.ry || 0, 0);
    grup.updateMatrixWorld(true);
    U.izgMat.opacity = 0.7 * (o.izgA ?? 1);
    U.ekvMat.opacity = 0.55 * (o.izgA ?? 1);
    const tri = o.tri;
    // kenarlar
    for (let i = 0; i < 3; i++) {
      const a = tri[i], b = tri[(i + 1) % 3];
      tupGuncelle(U.kenarlar[i], yayNoktalari(a, b, o.kenarP[i]), o.kalin ?? 0.011);
    }
    // açılar
    for (let i = 0; i < 3; i++) {
      const V = tri[i], P = tri[(i + 1) % 3], Q = tri[(i + 2) % 3];
      const al = o.aciA[i];
      const yel = U.yelpazeler[i], yay = U.yaylar[i];
      if (al <= 0.01) { yel.visible = false; yay.visible = false; continue; }
      const pts = aciNoktalari(V, P, Q, o.aciR, U.NY);
      const arr = yel.geometry.attributes.position.array;
      const merk = v3.t(V, 1.005);
      arr[0] = merk[0]; arr[1] = merk[1]; arr[2] = merk[2];
      pts.forEach((p, j) => { arr[(j + 1) * 3] = p[0]; arr[(j + 1) * 3 + 1] = p[1]; arr[(j + 1) * 3 + 2] = p[2]; });
      yel.geometry.attributes.position.needsUpdate = true;
      yel.visible = true; yel.material.opacity = 0.42 * al;
      tupGuncelle(yay, pts, 0.008);
      yay.visible = al > 0.5;
    }
    // yüzey
    const ya = o.yamaA ?? 0;
    U.yama.visible = ya > 0.01;
    if (U.yama.visible) {
      const arr = U.yama.geometry.attributes.position.array;
      U.ag.forEach(([b0, b1], j) => {
        const b2 = Math.max(0, 1 - b0 - b1);
        const p = v3.t(v3.n(v3.top(v3.top(v3.t(tri[0], b0), v3.t(tri[1], b1)), v3.t(tri[2], b2))), 1.003);
        arr[j * 3] = p[0]; arr[j * 3 + 1] = p[1]; arr[j * 3 + 2] = p[2];
      });
      U.yama.geometry.attributes.position.needsUpdate = true;
      U.yama.material.opacity = 0.18 * ya;
    }
    // yürüyen
    U.yuruyen.visible = !!o.yuruyen;
    if (o.yuruyen) { const p = v3.t(o.yuruyen, 1.02); U.yuruyen.position.set(p[0], p[1], p[2]); }
    // ekrana izdüşüm (2B etiketler için)
    const ekran = (vLoc, r = 1) => {
      const w = rotY(v3.t(vLoc, r), o.ry || 0);
      const s = E.uc.ekranda(new U.T.Vector3(w[0], w[1], w[2]), kam, k);
      const gor = v3.d(w, v3.cik(cp, w)) > 0;
      return [s[0], s[1], gor];
    };
    // atmosfer: kürenin arkasında yumuşak ışık (2B)
    const m = ekran([0, 0, 0], 0);
    const rpx = (k.h / 2) * Math.tan(Math.asin(1 / o.kamUz)) / Math.tan(E.der(kam.fov / 2));
    E.isik(ctx, m[0], m[1], rpx * 1.9, 'gok', 0.16 * (o.alfa ?? 1));
    E.isik(ctx, m[0] - rpx * 0.5, m[1] - rpx * 0.4, rpx * 1.3, 'turkuaz', 0.07 * (o.alfa ?? 1));
    E.uc.ciz(ctx, U.sahne, kam, { x: k.x, y: k.y, w: k.w, h: k.h, alfa: o.alfa ?? 1 });
    return ekran;
  };
  /** 3B kutusu ve yazı sütunu */
  const kureYer = () => {
    const ic = E.L.icerik;
    const kutu = { x: 0, y: 0, w: E.W, h: E.H };
    return E.yatay
      ? { kutu, merkez: [400, 300], olc: 720 / 580, tx: 1000, ty: ic.y + 40, tGen: 400 }
      : { kutu, merkez: [360, 350], olc: 1280 / 560, tx: 360, ty: 660, tGen: 620 };
  };

  /* ---------- 1. Soğuk açılış: küre üzerinde üç dik açı ---------- */
  const acilis = (ctx, s) => {
    const t = s.t, Y = kureYer();
    // yürüyüş: N → X → Z → N
    const tri = KE;
    const p1 = ara(t, 0.8, 3.2, 'io2'), p2 = ara(t, 3.6, 6.0, 'io2'), p3 = ara(t, 6.4, 8.4, 'io2');
    let yur = null;
    if (t < 3.4) yur = slerp(tri[0], tri[1], p1);
    else if (t < 6.2) yur = slerp(tri[1], tri[2], p2);
    else yur = slerp(tri[2], tri[0], p3);
    if (t > 9.4) yur = null;
    const aciA = [ara(t, 8.4, 8.9), ara(t, 3.2, 3.7), ara(t, 6.0, 6.5)];
    const ry = -1.15 * (1 - ara(t, 0, 4.5, 'io2')) + 0.06 * Math.sin(t * 0.4);
    const kamUz = kf(t, [[0, 6.4], [9.5, 5.35, 'io2'], [12.3, 5.2, 'lin']]);
    const ekran = kureCiz(ctx, {
      kutu: Y.kutu, merkez: Y.merkez, kamDir: [1, 0.82, 1], kamUz: kamUz * Y.olc, ry, tri,
      kenarP: [p1, p2, p3], aciA, aciR: 0.2, yamaA: ara(t, 8.6, 9.6) * 0.8, yuruyen: yur,
      alfa: ara(t, 0, 1.4, 'cik3'),
    });
    // yürüyenin parıltısı
    if (yur) { const p = ekran(yur, 1.02); E.isik(ctx, p[0], p[1], 46, 'limon', 0.5 * ara(t, 0.6, 1.0)); }
    // köşe etiketleri: 90°
    const g = [0, 1, 2].map((i) => ekran(tri[i]));
    const gm = [(g[0][0] + g[1][0] + g[2][0]) / 3, (g[0][1] + g[1][1] + g[2][1]) / 3];
    const dis = (i, d) => { const u = fark2(g[i], gm), l = uz(u) || 1; return [g[i][0] + (u[0] / l) * d, g[i][1] + (u[1] / l) * d]; };
    [0, 1, 2].forEach((i) => {
      const a = aciA[i];
      if (a <= 0.01 || !g[i][2]) return;
      const p = dis(i, E.yd(54, 50));
      E.etiket(ctx, '90°', p[0], p[1], { boyut: E.yd(28, 26), renk: RENK[i], agirlik: 700, alfa: a, kenar: RENK[i] });
    });
    // N etiketi
    const kn = ekran(tri[0], 1.0);
    E.yazi(ctx, 'Kuzey Kutbu', kn[0] + E.yd(110, 96), kn[1] - E.yd(34, 30), { boyut: E.yd(24, 22), agirlik: 600, renk: 'gumus', alfa: ara(t, 0.4, 1.0) * (1 - ara(t, 3.0, 3.6)) });
    // yazı sütunu
    const A1 = ara(t, 8.7, 9.3, 'cik3');
    if (E.yatay) {
      const x = Y.tx;
      E.formul(ctx, '\\c{mercan}{90°}', x, Y.ty + 70, { boyut: 52, alfa: ara(t, 3.3, 3.8) });
      E.formul(ctx, '+ \\c{menekse}{90°}', x, Y.ty + 140, { boyut: 52, alfa: ara(t, 6.1, 6.6) });
      E.formul(ctx, '+ \\c{turkuaz}{90°}', x, Y.ty + 210, { boyut: 52, alfa: ara(t, 8.5, 9.0) });
      E.cizgi(ctx, [[x - 120, Y.ty + 262], [x + 120, Y.ty + 262]], { renk: 'gumus', kalinlik: 2, alfa: A1 });
      E.formul(ctx, '= 270°\\,\\c{limon}{?}', x, Y.ty + 320, { boyut: 64, alfa: A1, parilti: 0.3 * A1, parRenk: 'limon' });
      E.yazi(ctx, 'Üçgenin açıları 180° değil miydi?', x, Y.ty + 420, { boyut: 30, agirlik: 560, renk: 'gumus', alfa: ara(t, 9.8, 10.5), maxGen: Y.tGen });
    } else {
      E.formul(ctx, '\\c{mercan}{90°} + \\c{menekse}{90°} + \\c{turkuaz}{90°}', 360, Y.ty, { boyut: 46, alfa: ara(t, 3.3, 3.8), aciga: kf(t, [[3.3, 0.33], [6.1, 0.33], [6.6, 0.68], [8.5, 0.68], [9.0, 1]]) });
      E.formul(ctx, '= 270°\\,\\c{limon}{?}', 360, Y.ty + 88, { boyut: 62, alfa: A1, parilti: 0.3 * A1, parRenk: 'limon' });
      E.yazi(ctx, 'Üçgenin açıları 180° değil miydi?', 360, Y.ty + 180, { boyut: 30, agirlik: 560, renk: 'gumus', alfa: ara(t, 9.8, 10.5), maxGen: Y.tGen });
    }
    E.isik(ctx, Y.tx, Y.ty + E.yd(320, 88), 260, 'limon', 0.18 * E.nabiz(t, 8.8, 1.4));
  };

  /* ---------- Düzlem üçgeni (sahne 4–5) ---------- */
  const UCGEN = { A: [-2.6, 1.5], B: [2.6, 1.5], C: [-0.6, -1.7] };
  const duzlemYer = () => {
    const ic = E.L.icerik;
    return E.yatay
      ? { o: [420, ic.y + 268], s: 88, tx: 1004, ty: ic.y + 60, tGen: 390 }
      : { o: [360, ic.y + 270], s: 82, tx: 360, ty: ic.y + 556, tGen: 620 };
  };
  const ekr = (Y, p) => [Y.o[0] + p[0] * Y.s, Y.o[1] + p[1] * Y.s];

  /** Üçgen + üç iç açı (+ harfler); P: ekran köşeleri [A,B,C] */
  const ucgenCiz = (ctx, P, o = {}) => {
    const al = o.alfa ?? 1;
    E.cokgen(ctx, P, { renk: 'gok', alfa: 0.07 * al });
    E.cizgi(ctx, P, { kapali: true, renk: 'tebesir', kalinlik: 3, parilti: 0.5, alfa: al, p: o.p ?? 1 });
    const g = agirlik(P);
    const r = o.r ?? 46;
    const aci = [icAci(P[0], P[1], P[2]), icAci(P[1], P[2], P[0]), icAci(P[2], P[0], P[1])];
    for (let i = 0; i < 3; i++) {
      const a = (o.aciA ? o.aciA[i] : 1) * al;
      kama(ctx, P[i], aci[i].a0, aci[i].sw, r, RENK[i], a);
      const q = ortay(P[i], aci[i].a0, aci[i].sw, r + 24);
      if (o.harfler !== false) E.formul(ctx, HARF[i], q[0], q[1], { boyut: 28, renk: RENK[i], alfa: a });
    }
    if (o.koseHarf !== false) ['A', 'B', 'C'].forEach((h, i) => koseHarf(ctx, h, P[i], g, 30, { alfa: al * (o.koseA ?? 1) }));
    return aci;
  };

  /* ---------- 4. İç açılar: tek paralel ---------- */
  const icAcilar = (ctx, s) => {
    const t = s.t, Y = duzlemYer(), H = E.yatay;
    // A: köşeler oynar, ölçüm hep 180
    const Cm = kf(t, [[0.8, UCGEN.C], [2.4, [1.6, -1.3]], [3.9, [-2.0, -0.6]], [5.4, [0.4, -2.1]], [7.0, UCGEN.C]]);
    const Am = kf(t, [[0.8, UCGEN.A], [2.4, [-2.2, 1.7]], [3.9, [-2.8, 1.2]], [5.4, [-2.5, 1.5]], [7.0, UCGEN.A]]);
    const P = [ekr(Y, Am), ekr(Y, UCGEN.B), ekr(Y, Cm)];
    const aciAlfa = [1, 1, 1];
    // kopan kamalar (paralel ispatı)
    const pA = ara(t, 12.6, 14.6, 'io3'), pB = ara(t, 14.9, 16.9, 'io3');
    const gAl = 1;
    const aci = ucgenCiz(ctx, P, { p: ara(t, 0, 0.9), aciA: aciAlfa, alfa: gAl });
    // canlı ölçüm
    const dA = derece(Math.abs(aci[0].sw)), dB = derece(Math.abs(aci[1].sw));
    const rA = Math.round(dA), rB = Math.round(dB), rC = 180 - rA - rB;
    const olcA = ara(t, 0.9, 1.6) * (1 - ara(t, 9.6, 10.3));
    if (olcA > 0) {
      if (H) {
        const x = Y.tx, y = Y.ty;
        E.yazi(ctx, 'ÖLÇ', x, y, { boyut: 24, agirlik: 700, harfAra: 6, renk: 'gumus', alfa: olcA });
        E.formul(ctx, `\\c{turkuaz}{α} = ${rA}°`, x, y + 66, { boyut: 44, alfa: olcA });
        E.formul(ctx, `\\c{mercan}{β} = ${rB}°`, x, y + 130, { boyut: 44, alfa: olcA });
        E.formul(ctx, `\\c{menekse}{γ} = ${rC}°`, x, y + 194, { boyut: 44, alfa: olcA });
        E.cizgi(ctx, [[x - 130, y + 238], [x + 130, y + 238]], { renk: 'gumus', kalinlik: 2, alfa: olcA });
        E.formul(ctx, '\\t{toplam} = \\c{limon}{180°}', x, y + 286, { boyut: 44, alfa: olcA });
        E.yazi(ctx, 'Ölçmek, ispat değildir.', x, y + 380, { boyut: 34, agirlik: 640, alfa: ara(t, 7.6, 8.3) * (1 - ara(t, 9.6, 10.3)), maxGen: Y.tGen });
      } else {
        const y = Y.ty;
        E.formul(ctx, `\\c{turkuaz}{${rA}°} + \\c{mercan}{${rB}°} + \\c{menekse}{${rC}°} = \\c{limon}{180°}`, 360, y, { boyut: 40, alfa: olcA });
        E.yazi(ctx, 'Ölçmek, ispat değildir.', 360, y + 90, { boyut: 34, agirlik: 640, alfa: ara(t, 7.6, 8.3) * (1 - ara(t, 9.6, 10.3)) });
      }
    }
    E.isik(ctx, Y.tx, Y.ty + E.yd(286, 0), 200, 'limon', 0.2 * E.nabiz(t, 2.4, 0.8) + 0.2 * E.nabiz(t, 3.9, 0.8) + 0.2 * E.nabiz(t, 5.4, 0.8));

    // B: paralel doğru
    const [A, B, C] = P;
    const u = fark2(B, A), ul = uz(u), ue = [u[0] / ul, u[1] / ul];
    const parP = ara(t, 10.6, 11.9, 'io3');
    const yar = E.yd(330, 300);
    if (parP > 0) {
      E.cizgi(ctx, [topla(C, kat(ue, -yar * parP)), topla(C, kat(ue, yar * parP))], { renk: 'gok', kalinlik: 3, parilti: 0.8 });
      // paralel işaretleri
      const ok = (m) => { const q = topla(m, kat(ue, 0)); E.cizgi(ctx, [[q[0] - 8, q[1] - 9], [q[0] + 4, q[1]], [q[0] - 8, q[1] + 9]], { renk: 'gok', kalinlik: 3, alfa: ara(t, 11.6, 12.1) }); };
      ok(topla(C, kat(ue, yar * 0.62))); ok(ara2(A, B, 0.72));
      E.nokta(ctx, C[0], C[1], 6, { renk: 'gok', parilti: 1, alfa: parP });
    }
    // kamalar 180° döner: A, AC'nin orta noktası etrafında; B, BC'nin orta noktası etrafında
    const kop = (v, w, a, renk, p, isaret) => {
      if (p <= 0) return;
      const m = ara2(v, w, 0.5), th = isaret * Math.PI * p;
      const tepe = topla(m, don(fark2(v, m), th));
      kama(ctx, tepe, a.a0 + th, a.sw, 46, renk, 1, 0.42, 3.5);
      E.isik(ctx, tepe[0], tepe[1], 70, renk, 0.35 * Math.sin(Math.PI * p));
      if (p >= 1) { const q = ortay(tepe, a.a0 + th, a.sw, 70); E.formul(ctx, HARF[renk === 'turkuaz' ? 0 : 1], q[0], q[1], { boyut: 28, renk, alfa: ara(p, 0.8, 1) }); }
    };
    // dönüş yönü: tepe üçgenin dışından geçsin
    const g = agirlik(P);
    const isaretBul = (v, w) => { const m = ara2(v, w, 0.5), d = fark2(v, m), tur = [-d[1], d[0]]; return (tur[0] * (v[0] - g[0]) + tur[1] * (v[1] - g[1]) > 0 ? 1 : -1); };
    kop(A, C, aci[0], 'turkuaz', pA, isaretBul(A, C));
    kop(B, C, aci[1], 'mercan', pB, isaretBul(B, C));
    // doğru açısı parlaması
    const dog = ara(t, 17.1, 18.0);
    if (dog > 0) {
      const a0 = yon(ue);
      ctx.save(); ctx.globalAlpha *= dog;
      ctx.strokeStyle = E.R('limon'); ctx.lineWidth = 3; ctx.setLineDash([2, 7]); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(C[0], C[1], 92, a0, a0 + Math.PI * dog, false); ctx.stroke(); ctx.restore();
      E.isik(ctx, C[0], C[1], 160, 'limon', 0.3 * E.nabiz(t, 17.4, 1.4));
      E.yazi(ctx, '180°', C[0], C[1] + 122, { boyut: 30, agirlik: 720, renk: 'limon', alfa: ara(t, 17.6, 18.2) });
    }
    // ispat adımları (tek tek)
    const adim = (i, a0, a1, metin) => {
      const al = ara(t, a0, a0 + 0.5, 'cik3') * (1 - ara(t, a1, a1 + 0.4));
      if (al <= 0) return;
      E.yazi(ctx, `${i}/3`, Y.tx, Y.ty + E.yd(0, -8), { boyut: 24, agirlik: 700, harfAra: 4, renk: 'gok', alfa: al });
      E.yazi(ctx, metin, Y.tx, Y.ty + E.yd(66, 44), { boyut: E.yd(34, 32), agirlik: 620, alfa: al, maxGen: Y.tGen });
    };
    adim(1, 10.6, 12.4, 'C’den AB’ye paralel çiz.');
    adim(2, 12.8, 16.8, 'İç ters açılar eşittir.');
    adim(3, 17.2, 22.6, 'Üç açı yan yana: doğru açısı.');
    const fA = ara(t, 18.0, 18.7, 'cik3');
    E.formul(ctx, '\\kutu{limon}{\\c{turkuaz}{α} + \\c{mercan}{β} + \\c{menekse}{γ} = 180°}', Y.tx, Y.ty + E.yd(190, 128), { boyut: E.yd(44, 42), alfa: fA, parilti: 0.3 * fA, parRenk: 'limon' });
    E.yazi(ctx, 'Dayanak: bir noktadan tek paralel geçer (Öklid’in 5. postulatı).', Y.tx, Y.ty + E.yd(310, 216), { boyut: E.yd(26, 25), agirlik: 500, renk: 'gumus', alfa: ara(t, 19.4, 20.1), maxGen: Y.tGen });
  };

  /* ---------- 5. Dış açı ve dönen ok ---------- */
  const disAcilar = (ctx, s) => {
    const t = s.t, Y = duzlemYer(), H = E.yatay;
    const P0 = [ekr(Y, UCGEN.A), ekr(Y, UCGEN.B), ekr(Y, UCGEN.C)];
    const G = agirlik(P0);
    const kucul = kf(t, [[14.0, 1], [16.2, 0.025, 'io3']]);
    const P = P0.map((p) => ara2(G, p, kucul));
    const [A, B, C] = P;
    const aAl = 1 - ara(t, 7.4, 8.2);
    const aci = ucgenCiz(ctx, P, { aciA: [aAl, aAl, aAl], harfler: true, koseA: 1 - ara(t, 13.8, 14.4), alfa: 1 });
    // A bölümü: BC'yi C'den uzat; dış açı γ'
    const uzP = ara(t, 0.3, 1.3) * aAl;
    const BC = fark2(C, B), bcl = uz(BC), bce = [BC[0] / bcl, BC[1] / bcl];
    const D = topla(C, kat(bce, 150 * uzP));
    if (uzP > 0) E.cizgi(ctx, [C, D], { renk: 'tebesir', kalinlik: 3, kesik: [8, 8], alfa: uzP });
    const disA0 = yon(bce), disSw = acFark(disA0, yon(fark2(A, C)));
    const dP = ara(t, 1.3, 2.2) * aAl;
    if (dP > 0) {
      kama(ctx, C, disA0, disSw * dP, 74, 'limon', 1, 0.08, 2.5);
      const q = ortay(C, disA0, disSw, 104);
      E.formul(ctx, 'γ\u2032', q[0], q[1], { boyut: 30, renk: 'limon', alfa: ara(t, 1.9, 2.4) * aAl });
    }
    // β ötelenir (B → C), α yarım tur döner (AC orta noktası)
    const pB = ara(t, 2.6, 4.0, 'io3') * (t < 7.4 ? 1 : 0), pA = ara(t, 4.2, 5.8, 'io3') * (t < 7.4 ? 1 : 0);
    const kAl = aAl;
    if (pB > 0) { const tepe = ara2(B, C, pB); kama(ctx, tepe, aci[1].a0, aci[1].sw, 46, 'mercan', kAl, 0.42, 3.5); }
    if (pA > 0) {
      const m = ara2(A, C, 0.5), d = fark2(A, m);
      const isr = ((-d[1]) * (A[0] - G[0]) + d[0] * (A[1] - G[1])) > 0 ? 1 : -1;
      const th = isr * Math.PI * pA;
      kama(ctx, topla(m, don(d, th)), aci[0].a0 + th, aci[0].sw, 46, 'turkuaz', kAl, 0.42, 3.5);
    }
    E.isik(ctx, C[0], C[1], 140, 'limon', 0.35 * E.nabiz(t, 5.6, 1.2));
    // formüller
    const f1 = ara(t, 5.9, 6.5, 'cik3') * (1 - ara(t, 7.4, 8.0));
    E.formul(ctx, '\\c{limon}{γ\u2032} = \\c{turkuaz}{α} + \\c{mercan}{β}', Y.tx, Y.ty + E.yd(40, 0), { boyut: E.yd(50, 46), alfa: f1 });
    E.formul(ctx, '\\c{limon}{γ\u2032} = 180° − \\c{menekse}{γ}', Y.tx, Y.ty + E.yd(120, 74), { boyut: E.yd(40, 36), renk: 'gumus', alfa: ara(t, 6.6, 7.1) * (1 - ara(t, 7.4, 8.0)) });
    E.yazi(ctx, 'Dış açı = komşu olmayan iki iç açı', Y.tx, Y.ty + E.yd(200, 146), { boyut: E.yd(28, 27), agirlik: 560, renk: 'gumus', alfa: f1, maxGen: Y.tGen });

    // B bölümü: çevrede yürüyen ok
    const kenarlar = [[A, B], [B, C], [C, A]];
    const yonler = kenarlar.map(([p, q]) => yon(fark2(q, p)));
    const dons = [acFark(yonler[0], yonler[1]), acFark(yonler[1], yonler[2]), acFark(yonler[2], yonler[0])]; // B, C, A köşelerinde
    const plan = [[9.0, 10.0], [10.6, 11.6], [12.2, 13.2]];
    const donus = [[10.0, 10.6], [11.6, 12.2], [13.2, 13.8]];
    const disRenk = ['mercan', 'menekse', 'turkuaz']; // B, C, A köşeleri
    const disKose = [B, C, A];
    const okA = ara(t, 8.6, 9.0) * (1 - ara(t, 14.0, 14.3));
    let poz = A, bas = yonler[0], toplamDon = 0;
    for (let i = 0; i < 3; i++) {
      if (t >= plan[i][0]) { const p = ara(t, plan[i][0], plan[i][1], 'io2'); poz = ara2(kenarlar[i][0], kenarlar[i][1], p); bas = yonler[i]; }
      if (t >= donus[i][0]) { const p = ara(t, donus[i][0], donus[i][1], 'io2'); bas = yonler[i] + dons[i] * p; toplamDon += Math.abs(dons[i]) * p; poz = kenarlar[i][1]; }
    }
    // dış açı dilimleri (dönüşler)
    const disAl = ara(t, 8.6, 9.0);
    for (let i = 0; i < 3; i++) {
      const p = ara(t, donus[i][0], donus[i][1], 'io2');
      if (p <= 0) continue;
      const v = disKose[i];
      const r = lerp(58, 70, ara(t, 14.0, 16.2));
      kama(ctx, v, yonler[i], dons[i] * p, r, disRenk[i], disAl, 0.34, 3);
      // gelen kenarın uzantısı
      E.cizgi(ctx, [v, topla(v, [Math.cos(yonler[i]) * 90 * kucul, Math.sin(yonler[i]) * 90 * kucul])], { renk: 'gumus', kalinlik: 2, kesik: [6, 7], alfa: disAl * 0.8 * (1 - ara(t, 14.0, 15.0)) });
    }
    if (okA > 0) {
      ctx.save(); ctx.translate(poz[0], poz[1]); ctx.rotate(bas); ctx.globalAlpha *= okA;
      E.isik(ctx, 0, 0, 50, 'limon', 0.4);
      ctx.fillStyle = E.R('limon'); ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-12, -12); ctx.lineTo(-5, 0); ctx.lineTo(-12, 12); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // dönüş sayacı
    const sayA = ara(t, 8.8, 9.3);
    if (sayA > 0) {
      const top = Math.round(derece(toplamDon));
      E.yazi(ctx, 'TOPLAM DÖNÜŞ', Y.tx, Y.ty + E.yd(0, -8), { boyut: 24, agirlik: 700, harfAra: 5, renk: 'gumus', alfa: sayA });
      E.yazi(ctx, `${top}°`, Y.tx, Y.ty + E.yd(80, 54), { boyut: E.yd(76, 64), agirlik: 760, renk: top >= 360 ? 'limon' : 'tebesir', alfa: sayA, parilti: top >= 360 ? 0.5 : 0, parRenk: 'limon' });
      E.formul(ctx, '\\c{turkuaz}{α\u2032} + \\c{mercan}{β\u2032} + \\c{menekse}{γ\u2032} = 360°', Y.tx, Y.ty + E.yd(200, 140), { boyut: E.yd(40, 38), alfa: ara(t, 15.8, 16.5, 'cik3') });
      E.yazi(ctx, 'Üçgen bir noktaya büzülür: dönüşler tam bir tur.', Y.tx, Y.ty + E.yd(290, 212), { boyut: E.yd(28, 27), agirlik: 520, renk: 'gumus', alfa: ara(t, 16.4, 17.0), maxGen: Y.tGen });
    }
    E.isik(ctx, G[0], G[1], 200, 'limon', 0.35 * E.nabiz(t, 15.9, 1.6));
  };

  /* ---------- 6. Büyük kenar, büyük açı ---------- */
  const kenarAci = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const tx = H ? 1004 : 360, ty = H ? ic.y + 70 : ic.y + 560, tGen = H ? 390 : 620;
    // A: menteşe
    const mA = 1 - ara(t, 6.6, 7.3);
    if (mA > 0) {
      const sc = H ? 75 : 70;
      const Ap = H ? [300, ic.y + 400] : [230, ic.y + 400];
      const al = E.der(kf(t, [[0, 35], [0.6, 35], [4.8, 140, 'io2'], [6.4, 80, 'io2']]));
      const Bp = [Ap[0] + 4 * sc, Ap[1]];
      const Cp = [Ap[0] + 3 * sc * Math.cos(al), Ap[1] - 3 * sc * Math.sin(al)];
      const aLen = Math.sqrt(25 - 24 * Math.cos(al));
      ctx.save(); ctx.globalAlpha *= mA * ara(t, 0, 0.6);
      E.cizgi(ctx, [Bp, Cp], { renk: 'limon', kalinlik: 5, parilti: 1 });
      E.cizgi(ctx, [Ap, Bp], { renk: 'tebesir', kalinlik: 6 });
      E.cizgi(ctx, [Ap, Cp], { renk: 'tebesir', kalinlik: 6 });
      kama(ctx, Ap, 0, -al, 40, 'turkuaz', 1, 0.3, 3);
      E.nokta(ctx, Ap[0], Ap[1], 9, { renk: 'turkuaz', parilti: 1 });
      E.nokta(ctx, Bp[0], Bp[1], 6, { renk: 'tebesir', parilti: 0.4 });
      E.nokta(ctx, Cp[0], Cp[1], 6, { renk: 'tebesir', parilti: 0.4 });
      const q = ortay(Ap, 0, -al, 62);
      E.formul(ctx, 'α', q[0], q[1], { boyut: 30, renk: 'turkuaz' });
      E.yazi(ctx, '4', (Ap[0] + Bp[0]) / 2, Ap[1] + 32, { boyut: 28, agirlik: 600, renk: 'gumus' });
      const m3 = ara2(Ap, Cp, 0.5), n3 = [-(Cp[1] - Ap[1]), Cp[0] - Ap[0]], l3 = uz(n3);
      E.yazi(ctx, '3', m3[0] - (n3[0] / l3) * 26 * Math.sign(Math.cos(al) + 2), m3[1] - (n3[1] / l3) * 26, { boyut: 28, agirlik: 600, renk: 'gumus' });
      ctx.restore();
      E.yazi(ctx, 'MENTEŞE', tx, ty - E.yd(10, 24), { boyut: 24, agirlik: 700, harfAra: 6, renk: 'gumus', alfa: mA * ara(t, 0.2, 0.8) });
      E.formul(ctx, `\\c{turkuaz}{α} = ${Math.round(derece(al))}°`, tx, ty + E.yd(66, 40), { boyut: E.yd(56, 50), alfa: mA * ara(t, 0.3, 0.9) });
      E.formul(ctx, `\\c{limon}{a} = ${virgul(aLen)}`, tx, ty + E.yd(146, 110), { boyut: E.yd(56, 50), alfa: mA * ara(t, 0.5, 1.1) });
      E.yazi(ctx, 'Açı büyüdükçe karşı kenar uzar.', tx, ty + E.yd(240, 186), { boyut: E.yd(30, 30), agirlik: 600, alfa: mA * ara(t, 3.6, 4.2), maxGen: tGen });
    }
    // B: 4–6–8 üçgeni
    const bA = ara(t, 7.0, 7.8);
    if (bA > 0) {
      const sc = H ? 62 : 70;
      const O = H ? [150, ic.y + 430] : [80, ic.y + 400];
      const Pp = O, Qp = [O[0] + 8 * sc, O[1]], Rp = [O[0] + 2.75 * sc, O[1] - 2.9047 * sc];
      const T = [Pp, Qp, Rp];
      const g = agirlik(T);
      ctx.save(); ctx.globalAlpha *= bA;
      E.cokgen(ctx, T, { renk: 'gok', alfa: 0.07 });
      // kenarlar: karşısındaki açının rengi
      const kenar = [[Pp, Qp, 'mercan', '8', 2], [Qp, Rp, 'turkuaz', '6', 0], [Rp, Pp, 'menekse', '4', 1]];
      kenar.forEach(([a, b, renk, l], i) => {
        const vur = ara(t, 8.4 + i * 0.9, 9.0 + i * 0.9);
        E.cizgi(ctx, [a, b], { renk: vur > 0 ? E.karistir('tebesir', renk, vur) : 'tebesir', kalinlik: 3 + 2 * vur, parilti: vur });
        const m = ara2(a, b, 0.5), d = fark2(m, g), dl = uz(d);
        E.yazi(ctx, l, m[0] + (d[0] / dl) * 30, m[1] + (d[1] / dl) * 30, { boyut: 30, agirlik: 700, renk: vur > 0.5 ? renk : 'gumus' });
      });
      // açılar: R (104°, karşısı 8), P (47°, karşısı 6), Q (29°, karşısı 4)
      const ac = [[Rp, Pp, Qp, 'mercan', '104°', 0], [Pp, Qp, Rp, 'turkuaz', '47°', 1], [Qp, Rp, Pp, 'menekse', '29°', 2]];
      ac.forEach(([v, p, q, renk, d, i]) => {
        const vur = ara(t, 8.6 + i * 0.9, 9.2 + i * 0.9);
        const a = icAci(v, p, q);
        const rr = i === 2 ? 70 : 44;
        kama(ctx, v, a.a0, a.sw, rr, renk, 0.35 + 0.65 * vur, 0.3, 3);
        const qq = ortay(v, a.a0, a.sw, rr + (i === 0 ? 34 : 44));
        E.yazi(ctx, d, qq[0] + (i === 2 ? -12 : 0), qq[1], { boyut: 26, agirlik: 700, renk, alfa: vur });
      });
      ctx.restore();
      const fa = ara(t, 11.0, 11.7, 'cik3');
      E.formul(ctx, '\\c{mercan}{8} > \\c{turkuaz}{6} > \\c{menekse}{4}', tx, ty + E.yd(30, 0), { boyut: E.yd(50, 46), alfa: bA * ara(t, 9.8, 10.4) });
      E.formul(ctx, '\\c{mercan}{104°} > \\c{turkuaz}{47°} > \\c{menekse}{29°}', tx, ty + E.yd(110, 72), { boyut: E.yd(46, 42), alfa: fa });
      E.yazi(ctx, 'En uzun kenarın karşısında en büyük açı.', tx, ty + E.yd(210, 156), { boyut: E.yd(30, 29), agirlik: 620, renk: 'limon', alfa: ara(t, 11.8, 12.4), maxGen: tGen });
    }
  };

  /* ---------- 7. Üçgen eşitsizliği ---------- */
  const esitsizlik = (ctx, s) => {
    const t = s.t, ic = E.L.icerik, H = E.yatay;
    const tx = H ? 1004 : 360, ty = H ? ic.y + 80 : ic.y + 560, tGen = H ? 390 : 620;
    const cA = 1 - ara(t, 10.0, 10.6);
    if (cA > 0) {
      const sc = H ? 66 : 68;
      const O = H ? [150, ic.y + 400] : [88, ic.y + 400];
      const Qx = kf(t, [[6.8, 8], [7.8, 6, 'io3']]);
      const P = O, Q = [O[0] + Qx * sc, O[1]];
      // çubuk açıları
      let thP, thQ;
      if (t < 6.8) { const p = ara(t, 0.8, 3.4, 'io2'); thP = lerp(Math.PI / 2, 0, p); thQ = thP; }
      else {
        const p = ara(t, 7.9, 9.4, 'io3');
        const Rx = 29 / 12, Ry = Math.sqrt(9 - Rx * Rx);
        thP = lerp(0, Math.atan2(Ry, Rx), p); thQ = lerp(0, Math.atan2(Ry, 6 - Rx), p);
      }
      const Tp = [P[0] + 3 * sc * Math.cos(thP), P[1] - 3 * sc * Math.sin(thP)];
      const Tq = [Q[0] - 4 * sc * Math.cos(thQ), Q[1] - 4 * sc * Math.sin(thQ)];
      ctx.save(); ctx.globalAlpha *= cA * ara(t, 0, 0.6);
      // pergel yayları
      ctx.save(); ctx.setLineDash([4, 8]); ctx.lineWidth = 2;
      ctx.strokeStyle = E.rgba('turkuaz', 0.45); ctx.beginPath(); ctx.arc(P[0], P[1], 3 * sc, -Math.PI / 2 - 0.15, 0.02); ctx.stroke();
      ctx.strokeStyle = E.rgba('mercan', 0.45); ctx.beginPath(); ctx.arc(Q[0], Q[1], 4 * sc, Math.PI - 0.02, Math.PI * 1.5 + 0.15); ctx.stroke();
      ctx.restore();
      const kapandi = ara(t, 9.3, 9.6);
      if (kapandi > 0) E.cokgen(ctx, [P, Q, Tp], { renk: 'limon', alfa: 0.12 * kapandi });
      E.cizgi(ctx, [P, Q], { renk: 'gumus', kalinlik: 9 });
      E.cizgi(ctx, [P, Tp], { renk: 'turkuaz', kalinlik: 9, parilti: 0.7 });
      E.cizgi(ctx, [Q, Tq], { renk: 'mercan', kalinlik: 9, parilti: 0.7 });
      E.nokta(ctx, P[0], P[1], 8, { renk: 'tebesir', parilti: 0.5 });
      E.nokta(ctx, Q[0], Q[1], 8, { renk: 'tebesir', parilti: 0.5 });
      E.yazi(ctx, String(Math.round(Qx * 10) / 10).replace('.', ','), (P[0] + Q[0]) / 2, P[1] + 38, { boyut: 30, agirlik: 700, renk: 'gumus' });
      const mp = ara2(P, Tp, 0.5), mq = ara2(Q, Tq, 0.5);
      E.yazi(ctx, '3', mp[0] - 26 * Math.sin(thP) - 6, mp[1] - 26 * Math.cos(thP), { boyut: 30, agirlik: 700, renk: 'turkuaz' });
      E.yazi(ctx, '4', mq[0] + 26 * Math.sin(thQ) + 6, mq[1] - 26 * Math.cos(thQ), { boyut: 30, agirlik: 700, renk: 'mercan' });
      // boşluk
      const bos = ara(t, 3.4, 3.9) * (1 - ara(t, 6.6, 7.0));
      if (bos > 0) {
        const x1 = P[0] + 3 * sc, x2 = Q[0] - 4 * sc, y = P[1] - 34;
        E.cizgi(ctx, [[x1, y + 8], [x1, y], [x2, y], [x2, y + 8]], { renk: 'limon', kalinlik: 3, alfa: bos });
        E.yazi(ctx, '1 eksik', (x1 + x2) / 2, y - 26, { boyut: 26, agirlik: 700, renk: 'limon', alfa: bos });
        E.isik(ctx, (x1 + x2) / 2, P[1], 80, 'mercan', 0.4 * bos * (0.6 + 0.4 * Math.sin(t * 6)));
      }
      if (kapandi > 0) { E.isik(ctx, Tp[0], Tp[1], 120, 'limon', 0.5 * E.nabiz(t, 9.3, 1.0)); E.nokta(ctx, Tp[0], Tp[1], 8, { renk: 'limon', alfa: kapandi }); }
      ctx.restore();
      const f1 = ara(t, 4.0, 4.6, 'cik3') * (1 - ara(t, 6.6, 7.0));
      E.formul(ctx, '3 + 4 = 7 < 8', tx, ty + E.yd(40, 0), { boyut: E.yd(50, 46), alfa: f1 * cA });
      E.yazi(ctx, '✗ kapanmıyor', tx, ty + E.yd(120, 74), { boyut: 32, agirlik: 700, renk: 'mercan', alfa: ara(t, 4.6, 5.1) * (1 - ara(t, 6.6, 7.0)) * cA });
      const f2 = ara(t, 9.4, 10.0, 'cik3');
      E.formul(ctx, '3 + 4 = 7 > 6', tx, ty + E.yd(40, 0), { boyut: E.yd(50, 46), alfa: f2 * cA });
      E.yazi(ctx, '✓ üçgen kuruldu', tx, ty + E.yd(120, 74), { boyut: 32, agirlik: 700, renk: 'turkuaz', alfa: f2 * cA });
    }
    // C: genel kural, sayı doğrusu, kafes kiriş
    const gA = ara(t, 10.5, 11.2, 'cik3');
    if (gA > 0) {
      const cx = E.L.cx;
      const y0 = H ? ic.y + 50 : ic.y + 40;
      E.formul(ctx, '\\kutu{limon}{|b − c| < a < b + c}', cx, y0, { boyut: H ? 52 : 46, alfa: gA, parilti: 0.3 * gA, parRenk: 'limon' });
      E.formul(ctx, 'b = 4,\\; c = 3 \\Rightarrow \\c{limon}{1 < a < 7}', cx, y0 + (H ? 100 : 92), { boyut: H ? 40 : 36, alfa: ara(t, 11.4, 12.0) });
      const sd = E.sayiDogrusu({ x: H ? 330 : 80, y: y0 + (H ? 200 : 196), w: H ? 620 : 560, min: 0, max: 8 });
      const sA = ara(t, 11.9, 12.5);
      sd.ciz(ctx, { adim: 1, boyut: 24, p: sA, alfa: sA });
      sd.aralik(ctx, 1, 7, { acikSol: true, acikSag: true, renk: 'limon', p: ara(t, 12.4, 13.2, 'io3'), alfa: sA });
      // kafes kiriş
      const kA = ara(t, 13.4, 15.4, 'lin');
      if (kA > 0) {
        const kx = H ? 300 : 70, kw = H ? 680 : 580, ky = y0 + (H ? 300 : 320), kh = H ? 90 : 100, n = H ? 8 : 6;
        const alt = [], ust = [];
        for (let i = 0; i <= n; i++) alt.push([kx + (kw * i) / n, ky + kh]);
        for (let i = 0; i < n; i++) ust.push([kx + (kw * (i + 0.5)) / n, ky]);
        const zig = []; for (let i = 0; i < n; i++) { zig.push(alt[i], ust[i]); } zig.push(alt[n]);
        E.cizgi(ctx, alt.length ? [alt[0], alt[n]] : [], { renk: 'gumus', kalinlik: 4, p: clamp(kA * 2) });
        E.cizgi(ctx, [ust[0], ust[n - 1]], { renk: 'gumus', kalinlik: 4, p: clamp(kA * 2 - 0.4) });
        E.cizgi(ctx, zig, { renk: 'turkuaz', kalinlik: 3, parilti: 0.6, p: clamp(kA * 1.4 - 0.3) });
        for (let i = 0; i < n; i++) {
          const tri = [alt[i], ust[i], alt[i + 1]];
          E.cokgen(ctx, tri, { renk: 'turkuaz', alfa: 0.12 * ara(t, 14.6 + i * 0.08, 15.0 + i * 0.08) });
        }
        E.yazi(ctx, 'Üçgen yamulmaz: kenarları belliyse şekli kilitlidir.', cx, ky + kh + (H ? 44 : 56), { boyut: H ? 28 : 27, agirlik: 560, renk: 'gumus', alfa: ara(t, 15.0, 15.6), maxGen: H ? 900 : 620 });
      }
    }
  };

  /* ---------- 8. Sürpriz: kürede üçgen ---------- */
  const kure = (ctx, s) => {
    const t = s.t, Y = kureYer(), H = E.yatay;
    const rho = E.der(kf(t, [[0, 4], [1.6, 4], [9.0, derece(RHO_TAM), 'io2']]));
    const tri = kureUcgen(rho);
    const kamUz = kf(t, [[0, 2.9], [1.6, 2.9], [9.4, 5.3, 'io2'], [16.8, 5.45, 'lin']]);
    const orb = 0.28 * Math.sin(t * 0.18) - 0.1;
    const kd = rotY([1, 0.9, 1], orb);
    const aciR = Math.min(0.2, rho * 0.55);
    const ekran = kureCiz(ctx, {
      kutu: Y.kutu, merkez: Y.merkez, kamDir: kd, kamUz: kamUz * Y.olc, ry: 0, tri,
      kenarP: [1, 1, 1], aciA: [1, 1, 1].map(() => ara(t, 0.6, 1.4)), aciR, yamaA: 1,
      kalin: lerp(0.005, 0.011, ara(t, 1.6, 6)), alfa: ara(t, 0, 1.0, 'cik3'),
    });
    const a1 = kureAci(tri[0], tri[1], tri[2]);
    const toplam = derece(a1) * 3;
    // köşe etiketleri
    const g = [0, 1, 2].map((i) => ekran(tri[i]));
    const gm = [(g[0][0] + g[1][0] + g[2][0]) / 3, (g[0][1] + g[1][1] + g[2][1]) / 3];
    const etA = ara(t, 1.2, 1.8);
    const tamMi = t > 9.0;
    [0, 1, 2].forEach((i) => {
      if (!g[i][2]) return;
      const u = fark2(g[i], gm), l = uz(u) || 1;
      const d = E.yd(62, 58);
      const p = [g[i][0] + (u[0] / l) * d, g[i][1] + (u[1] / l) * d];
      const deg = tamMi ? '90°' : virgul(derece(a1)) + '°';
      E.etiket(ctx, deg, p[0], p[1], { boyut: E.yd(26, 24), renk: RENK[i], agirlik: 700, alfa: etA, kenar: RENK[i] });
    });
    // toplam paneli
    const pA = ara(t, 1.0, 1.6);
    const topYaz = toplam > 269.95 ? '270' : virgul(toplam);
    const son = ara(t, 9.0, 9.4);
    if (H) {
      const x = Y.tx;
      E.yazi(ctx, 'KÜREDE ÜÇGEN', x, Y.ty, { boyut: 24, agirlik: 700, harfAra: 6, renk: 'gumus', alfa: pA });
      E.formul(ctx, '\\c{turkuaz}{α} + \\c{mercan}{β} + \\c{menekse}{γ}', x, Y.ty + 64, { boyut: 40, alfa: pA });
      E.yazi(ctx, `= ${topYaz}°`, x, Y.ty + 150, { boyut: 76, agirlik: 760, renk: son > 0 ? E.karistir('tebesir', 'limon', son) : 'tebesir', alfa: pA, parilti: 0.5 * son, parRenk: 'limon' });
      E.yazi(ctx, 'Kürede paralel doğru yok.', x, Y.ty + 262, { boyut: 30, agirlik: 600, alfa: ara(t, 11.2, 11.8), maxGen: Y.tGen });
      E.yazi(ctx, '180, düzlemin imzasıdır.', x, Y.ty + 318, { boyut: 34, agirlik: 700, renk: 'limon', alfa: ara(t, 12.2, 12.8), maxGen: Y.tGen, parilti: 0.3, parRenk: 'limon' });
      E.yazi(ctx, 'Nasirüddin Tusi (13. yy) paralellik postulatı üzerine çalıştı.', x, Y.ty + 410, { boyut: 24, agirlik: 500, renk: 'gumus', alfa: ara(t, 14.2, 14.8), maxGen: Y.tGen });
    } else {
      E.formul(ctx, '\\c{turkuaz}{α} + \\c{mercan}{β} + \\c{menekse}{γ}', 330, Y.ty + 10, { boyut: 38, hiza: 'right', alfa: pA });
      E.yazi(ctx, `= ${topYaz}°`, 346, Y.ty + 10, { boyut: 60, agirlik: 760, hiza: 'left', renk: son > 0 ? E.karistir('tebesir', 'limon', son) : 'tebesir', alfa: pA, parilti: 0.5 * son, parRenk: 'limon' });
      const yA = ara(t, 11.2, 11.8) * (1 - ara(t, 14.0, 14.5));
      E.yazi(ctx, 'Kürede paralel doğru yok.', 360, Y.ty + 100, { boyut: 30, agirlik: 600, alfa: yA });
      E.yazi(ctx, '180, düzlemin imzasıdır.', 360, Y.ty + 158, { boyut: 34, agirlik: 700, renk: 'limon', alfa: ara(t, 12.2, 12.8), parilti: 0.3, parRenk: 'limon' });
      E.yazi(ctx, 'Nasirüddin Tusi (13. yy) paralellik postulatı üzerine çalıştı.', 360, Y.ty + 100, { boyut: 24, agirlik: 500, renk: 'gumus', alfa: ara(t, 14.5, 15.0), maxGen: Y.tGen });
    }
    E.isik(ctx, Y.tx, Y.ty + E.yd(150, 10), 240, 'limon', 0.25 * E.nabiz(t, 9.0, 1.6));
  };

  /* ---------- Özet ve bitiş ---------- */
  const ozet = (ctx, s) => E.ozetKarti(ctx, s, [
    { tr: 'İç açılar toplamı 180°.', formul: 'α + β + γ = 180°' },
    { tr: 'Dış açı, iki uzak iç açının toplamı.', formul: 'γ\u2032 = α + β' },
    { tr: 'Dış açılar toplamı 360°.', formul: 'α\u2032 + β\u2032 + γ\u2032 = 360°' },
    { tr: 'Büyük kenar karşısında büyük açı.', formul: 'a > b \\iff α > β' },
    { tr: 'Üçgen eşitsizliği.', formul: '|b − c| < a < b + c' },
  ], { aralik: 1.2 });

  E.film({
    meta,
    sure: 119.8,
    uc3b: [96.5, 6.0],
    sahneler: [
      { ad: 'Soğuk açılış: kürede üç dik açı', bas: 0, son: 12.3, giris: 0, cikis: 0.7, itme: 0, ciz: acilis },
      { ad: 'İmza', bas: 12.0, son: 15.7, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
      { ad: 'Başlık', bas: 15.4, son: 19.7, ciz: (c, s) => E.baslikKarti(c, s, meta) },
      { ad: 'İç açılar: tek paralel', bas: 19.4, son: 42.0, ciz: icAcilar },
      { ad: 'Dış açı ve dönen ok', bas: 41.7, son: 60.0, ciz: disAcilar },
      { ad: 'Büyük kenar, büyük açı', bas: 59.7, son: 73.5, ciz: kenarAci },
      { ad: 'Üçgen eşitsizliği', bas: 73.2, son: 90.0, ciz: esitsizlik },
      { ad: 'Sürpriz: kürede 270°', bas: 89.7, son: 106.5, itme: 0, ciz: kure },
      { ad: 'Aklında kalsın', bas: 106.2, son: 114.5, ciz: ozet },
      { ad: 'Laboratuvar', bas: 114.3, son: 119.8, cikis: 0.8, ciz: (c, s) => E.bitisKarti(c, s, meta) },
    ],
    zemin: (t) => ({ kx: 0, ky: -t * 5 }),
  });
})();
