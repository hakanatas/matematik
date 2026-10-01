/* ==========================================================================
   EKSEN 3B köprüsü — Three.js sahnelerini 2B karelerin içine çizer.
   Kural: 3B sahnede de her şey t'nin fonksiyonudur. Nesnelerin konumu,
   kamera ve ışık her karede t'den yeniden hesaplanır; saat, rAF ya da
   animasyon karıştırıcısı kullanılmaz. Böylece dışa aktarım deterministiktir.
   ========================================================================== */
(function () {
  'use strict';
  const E = window.E;
  let renderer = null, tuval = null;

  const uc = (E.uc = {});
  uc.var = () => !!window.THREE;
  /** Paylaşılan WebGL çizicisi (tek bağlam) */
  uc.cizici = () => {
    if (renderer) return renderer;
    tuval = document.createElement('canvas');
    renderer = new THREE.WebGLRenderer({ canvas: tuval, alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    return renderer;
  };
  /** Palet tokenından THREE.Color */
  uc.renk = (token) => new THREE.Color(E.P[token] || token);
  /** Eksen ışık düzeni: soğuk anahtar ışık, turkuaz kontur, menekşe dolgu */
  uc.isiklar = (sahne) => {
    sahne.add(new THREE.AmbientLight(0x6a7aa8, 0.55));
    const anahtar = new THREE.DirectionalLight(0xf1f4f9, 1.6); anahtar.position.set(3, 5, 4); sahne.add(anahtar);
    const kontur = new THREE.DirectionalLight(E.P.turkuaz, 1.1); kontur.position.set(-4, 2, -3); sahne.add(kontur);
    const dolgu = new THREE.DirectionalLight(E.P.menekse, 0.6); dolgu.position.set(-2, -3, 4); sahne.add(dolgu);
    return { anahtar, kontur, dolgu };
  };
  /** Paletle uyumlu malzeme */
  uc.malzeme = (token, o = {}) => new THREE.MeshStandardMaterial(Object.assign({
    color: uc.renk(token), roughness: 0.42, metalness: 0.08, transparent: true, opacity: 1,
    emissive: uc.renk(token), emissiveIntensity: 0.12, side: THREE.DoubleSide,
  }, o));
  /** Kenar çizgileri (ışıklı tel görünüm) */
  uc.kenar = (geo, token, o = {}) => new THREE.LineSegments(new THREE.EdgesGeometry(geo, o.esik || 20), new THREE.LineBasicMaterial({ color: uc.renk(token), transparent: true, opacity: o.opacity ?? 1 }));
  /** Kalın ışıklı çizgi: iki nokta arasında ince silindir */
  uc.cubuk = (a, b, r, token, o = {}) => {
    const v = new THREE.Vector3().subVectors(b, a); const uz = v.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, uz, 12, 1, true), new THREE.MeshBasicMaterial({ color: uc.renk(token), transparent: true, opacity: o.opacity ?? 1 }));
    m.position.copy(a).addScaledVector(v, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
    return m;
  };
  /** Sahneyi çiz ve 2B tuvale bindir. kutu: {x,y,w,h} (mantıksal piksel) — verilmezse tüm kare */
  uc.ciz = (ctx, sahne, kamera, o = {}) => {
    const r = uc.cizici();
    const k = E.olcek;
    const x = o.x ?? 0, y = o.y ?? 0, w = o.w ?? E.W, h = o.h ?? E.H;
    const pw = Math.max(2, Math.round(w * k)), ph = Math.max(2, Math.round(h * k));
    if (tuval.width !== pw || tuval.height !== ph) r.setSize(pw, ph, false);
    if (kamera.isPerspectiveCamera) { const a = w / h; if (Math.abs(kamera.aspect - a) > 1e-6) { kamera.aspect = a; kamera.updateProjectionMatrix(); } }
    r.render(sahne, kamera);
    ctx.save();
    ctx.globalAlpha *= o.alfa ?? 1;
    ctx.drawImage(tuval, x, y, w, h);
    ctx.restore();
  };
  /** Bir 3B noktanın ekrandaki (mantıksal piksel) yeri — 3B nesnelere 2B etiket koymak için */
  uc.ekranda = (v, kamera, o = {}) => {
    const x = o.x ?? 0, y = o.y ?? 0, w = o.w ?? E.W, h = o.h ?? E.H;
    if (kamera.isPerspectiveCamera) { const a = w / h; if (Math.abs(kamera.aspect - a) > 1e-6) { kamera.aspect = a; kamera.updateProjectionMatrix(); } }
    kamera.updateMatrixWorld();
    const p = v.clone().project(kamera);
    return [x + (p.x * 0.5 + 0.5) * w, y + (-p.y * 0.5 + 0.5) * h, p.z];
  };
})();
