/* Eksen · Üçgen Laboratuvarı — 3. Tema: Geometrik Şekiller
   Deneyler: Açılar ve kenarlar · Üçgen eşitsizliği · Küre üzerinde üçgen (3B) */
(function () {
  'use strict';
  const E = window.E, Lab = window.Lab, T = window.EKSEN_TEMA;
  const { clamp, lerp } = E;
  const p = (h) => Lab.el('p', { html: h });
  const der = (r) => (r * 180) / Math.PI;
  const fmtA = (r) => E.sayiYaz(der(r), 1) + '°';
  const uz = (P, Q) => Math.hypot(P[0] - Q[0], P[1] - Q[1]);
  const aciAt = (A, B, C) => { // A köşesindeki açı
    const u = [B[0] - A[0], B[1] - A[1]], v = [C[0] - A[0], C[1] - A[1]];
    return Math.acos(clamp((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v)), -1, 1));
  };
  const RENK = ['turkuaz', 'mercan', 'menekse'];

  /* ---------- 1. Açılar ve kenarlar ---------- */
  const acilar = {
    id: 'acilar', ad: 'Açılar ve kenarlar',
    ipucu: 'Köşeleri sürükle. Hangi üçgeni çizersen çiz, iç açılar 180°. "Paralel ispatı"nı aç: A ve B açıları C\'nin yanına taşınır.',
    kur(api) {
      // normalleştirilmiş koordinatlar (0..1)
      const d = { P: [[0.2, 0.78], [0.82, 0.8], [0.55, 0.2]], paralel: false, dis: false };
      const gos = Lab.gosterge([['A', 'm(A)'], ['B', 'm(B)'], ['C', 'm(C)'], ['top', 'Toplam'], ['a', '|BC| = a'], ['b', '|AC| = b'], ['c', '|AB| = c'], ['sira', 'Büyükten küçüğe']]);
      let surukle = -1;
      const ekran = (W, H) => d.P.map(([x, y]) => [x * W, y * H]);
      const guncelle = (W, H) => {
        const [A, B, C] = ekran(W, H);
        const aA = aciAt(A, B, C), aB = aciAt(B, A, C), aC = aciAt(C, A, B);
        const k = 30 / Math.min(W, H); // birim: kısa kenarın 1/30'u
        const a = uz(B, C) * k, b = uz(A, C) * k, c = uz(A, B) * k;
        gos.yaz('A', fmtA(aA)); gos.yaz('B', fmtA(aB)); gos.yaz('C', fmtA(aC));
        gos.yaz('top', E.sayiYaz(der(aA + aB + aC), 1) + '°');
        gos.yaz('a', E.sayiYaz(a, 1)); gos.yaz('b', E.sayiYaz(b, 1)); gos.yaz('c', E.sayiYaz(c, 1));
        const s = [['A', aA, 'a', a], ['B', aB, 'b', b], ['C', aC, 'c', c]].sort((x, y) => y[1] - x[1]);
        gos.yaz('sira', s.map((x) => x[0]).join(' > ') + '  ⇔  ' + s.map((x) => x[2]).join(' > '));
        return { A, B, C, aA, aB, aC };
      };
      return {
        panel: [
          Lab.kart('Göster', [
            Lab.segment({ secenekler: [[false, 'İç açılar'], [true, 'Paralel ispatı']], deger: false, degisti: (v) => { d.paralel = v; api.ciz(); } }),
            Lab.segment({ secenekler: [[false, 'Dış açılar gizli'], [true, 'Dış açılar']], deger: false, degisti: (v) => { d.dis = v; api.ciz(); } }),
          ]),
          Lab.kart('Ölçümler', [gos]),
          Lab.kart('Neden 180°?', [p('C\'den AB\'ye <b>tek</b> bir paralel çizilebilir (Öklid\'in 5. postulatı). İç ters açılar eşit olduğundan A ve B açıları C\'nin iki yanına taşınır; üçü birlikte bir doğru açısı (180°) oluşturur.'), p('Dış açı = komşu olmayan iki iç açının toplamı. Dış açıların toplamı 360°.')]),
        ],
        basildi(x, y) { const i = Lab.enYakin(ekran(api.W, api.H), x, y, 30); if (i < 0) return false; surukle = i; },
        suruklendi(x, y) { d.P[surukle] = [clamp(x / api.W, 0.06, 0.94), clamp(y / api.H, 0.08, 0.92)]; },
        birakildi() { surukle = -1; },
        uzerinde(x, y) { return Lab.enYakin(ekran(api.W, api.H), x, y, 30) >= 0; },
        ciz(ctx, W, H) {
          const { A, B, C, aA, aB, aC } = guncelle(W, H);
          const V = [A, B, C], ac = [aA, aB, aC], ad = ['A', 'B', 'C'];
          E.cokgen(ctx, V, { renk: 'turkuaz', alfa: 0.07 });
          E.cizgi(ctx, V, { kapali: true, renk: 'tebesir', kalinlik: 3, parilti: 0.5 });
          const r = Math.min(W, H) * 0.07;
          V.forEach((P, i) => {
            const Q = V[(i + 1) % 3], R2 = V[(i + 2) % 3];
            const a0 = Math.atan2(Q[1] - P[1], Q[0] - P[0]), a1 = Math.atan2(R2[1] - P[1], R2[0] - P[0]);
            let bas = a0, son = a1; let fark = son - bas; while (fark > Math.PI) fark -= E.TAU; while (fark < -Math.PI) fark += E.TAU;
            E.aciYayi(ctx, P[0], P[1], r, bas, bas + fark, { renk: RENK[i], dolgu: 0.25 });
            const orta = bas + fark / 2;
            E.yazi(ctx, fmtA(ac[i]), P[0] + Math.cos(orta) * r * 1.9, P[1] + Math.sin(orta) * r * 1.9, { boyut: 16, agirlik: 700, renk: RENK[i] });
            // köşe etiketi
            const gx = (A[0] + B[0] + C[0]) / 3, gy = (A[1] + B[1] + C[1]) / 3;
            const dx = P[0] - gx, dy = P[1] - gy, dl = Math.hypot(dx, dy) || 1;
            E.yazi(ctx, ad[i], P[0] + (dx / dl) * 24, P[1] + (dy / dl) * 24, { boyut: 22, agirlik: 760 });
            E.nokta(ctx, P[0], P[1], 8, { renk: 'tebesir' });
            if (d.dis) {
              const ux = (P[0] - R2[0]) / uz(P, R2), uy = (P[1] - R2[1]) / uz(P, R2);
              E.cizgi(ctx, [P, [P[0] + ux * r * 2.4, P[1] + uy * r * 2.4]], { renk: 'gumus', kalinlik: 2, kesik: [5, 5] });
              const b0 = Math.atan2(uy, ux); let f2 = a0 - b0; while (f2 > Math.PI) f2 -= E.TAU; while (f2 < -Math.PI) f2 += E.TAU;
              E.aciYayi(ctx, P[0], P[1], r * 0.7, b0, b0 + f2, { renk: 'limon', dolgu: 0.15 });
              E.yazi(ctx, fmtA(Math.PI - ac[i]), P[0] + Math.cos(b0 + f2 / 2) * r * 1.3, P[1] + Math.sin(b0 + f2 / 2) * r * 1.3, { boyut: 14, renk: 'limon', agirlik: 650 });
            }
          });
          if (d.paralel) {
            const ux = B[0] - A[0], uy = B[1] - A[1], l = Math.hypot(ux, uy);
            const L = Math.max(W, H);
            E.cizgi(ctx, [[C[0] - (ux / l) * L, C[1] - (uy / l) * L], [C[0] + (ux / l) * L, C[1] + (uy / l) * L]], { renk: 'limon', kalinlik: 2, kesik: [8, 6] });
            // A ve B açılarının kopyaları C'de
            const yAB = Math.atan2(uy, ux);
            const aCA = Math.atan2(A[1] - C[1], A[0] - C[0]), aCB = Math.atan2(B[1] - C[1], B[0] - C[0]);
            const sar = (x) => { while (x > Math.PI) x -= E.TAU; while (x < -Math.PI) x += E.TAU; return x; };
            E.aciYayi(ctx, C[0], C[1], r * 1.25, yAB + Math.PI, yAB + Math.PI + sar(aCA - yAB - Math.PI), { renk: 'turkuaz', dolgu: 0.3 });
            E.aciYayi(ctx, C[0], C[1], r * 1.25, yAB, yAB + sar(aCB - yAB), { renk: 'mercan', dolgu: 0.3 });
            E.yazi(ctx, 'A + B + C = 180°', W / 2, 26, { boyut: 20, agirlik: 760, renk: 'limon' });
          }
        },
      };
    },
  };

  /* ---------- 2. Üçgen eşitsizliği ---------- */
  const esitsizlik = {
    id: 'esitsizlik', ad: 'Üçgen eşitsizliği',
    ipucu: 'Üç çubuğun uzunluğunu değiştir. İki kısa çubuğun toplamı uzun çubuktan büyük değilse uçlar buluşmaz.',
    kur(api) {
      const d = { a: 5, b: 4, c: 8 };
      const kontrol = p('');
      const guncelle = () => {
        const { a, b, c } = d; const ok = (v) => (v ? '<b style="color:var(--turkuaz)">✓</b>' : '<b style="color:var(--mercan)">✗</b>');
        const s = E.sayiYaz;
        kontrol.innerHTML = `${ok(a + b > c)} a + b = ${s(a + b)} > c = ${s(c)}<br>${ok(a + c > b)} a + c = ${s(a + c)} > b = ${s(b)}<br>${ok(b + c > a)} b + c = ${s(b + c)} > a = ${s(a)}<br><br>|a − b| < c < a + b → ${s(Math.abs(a - b))} < ${s(c)} < ${s(a + b)} ${ok(Math.abs(a - b) < c && c < a + b)}`;
        api.ciz();
      };
      guncelle();
      const k = (ad, renk) => Lab.kaydirici({ ad, min: 1, max: 12, adim: 0.5, deger: d[ad], degisti: (v) => { d[ad] = v; guncelle(); } });
      return {
        panel: [Lab.kart('Çubuklar', [k('a'), k('b'), k('c')]), Lab.kart('Kontrol', [kontrol]), Lab.kart('Mühendislik', [p('Köprü ve çatı kafeslerinde üçgen kullanılır: üç kenarı belli olan üçgenin şekli değişmez, yapı "kilitlenir".')])],
        ciz(ctx, W, H) {
          const { a, b, c } = d;
          const kurulur = Math.abs(a - b) < c && c < a + b;
          // matematik koordinatlarında B=(0,0), C=(c,0)
          let a1, a2;
          if (kurulur) { const x = (a * a - b * b + c * c) / (2 * c); a1 = a2 = [x, Math.sqrt(Math.max(0, a * a - x * x))]; }
          else if (a + b <= c) { a1 = [a, 0.35]; a2 = [c - b, 0.7]; }
          else if (a >= b + c) { a1 = [a, 0.35]; a2 = [c + b, 0.7]; }
          else { a1 = [-a, 0.35]; a2 = [c - b, 0.7]; }
          const xs = [0, c, a1[0], a2[0]], ys = [0, a1[1], a2[1]];
          const xmin = Math.min(...xs), xmax = Math.max(...xs), ymax = Math.max(...ys, 1);
          const olc = Math.min((W * 0.84) / (xmax - xmin), (H * 0.62) / ymax);
          const x0 = W / 2 - ((xmin + xmax) / 2) * olc, y0 = H * 0.8;
          const ek = (P) => [x0 + P[0] * olc, y0 - P[1] * olc];
          const B = ek([0, 0]), C = ek([c, 0]), A1 = ek(a1), A2 = ek(a2);
          E.cizgi(ctx, [B, C], { renk: 'menekse', kalinlik: 7, parilti: 0.8 });
          E.yazi(ctx, `c = ${E.sayiYaz(c)}`, (B[0] + C[0]) / 2, y0 + 30, { boyut: 18, renk: 'menekse', agirlik: 700 });
          if (kurulur) {
            E.cokgen(ctx, [B, A1, C], { renk: 'turkuaz', alfa: 0.08 });
            E.yazi(ctx, 'Üçgen kuruldu', W / 2, 30, { boyut: 22, agirlik: 760, renk: 'turkuaz' });
          } else {
            E.yazi(ctx, 'Uçlar buluşamıyor', W / 2, 30, { boyut: 22, agirlik: 760, renk: 'mercan' });
            E.isik(ctx, (A1[0] + A2[0]) / 2, (A1[1] + A2[1]) / 2, 60, 'mercan', 0.4);
            E.cizgi(ctx, [A1, A2], { renk: 'mercan', kalinlik: 2, kesik: [4, 5] });
          }
          E.cizgi(ctx, [B, A1], { renk: 'turkuaz', kalinlik: 7, parilti: 0.8 });
          E.cizgi(ctx, [C, A2], { renk: 'mercan', kalinlik: 7, parilti: 0.8 });
          E.yazi(ctx, `a = ${E.sayiYaz(a)}`, (B[0] + A1[0]) / 2 - 28, (B[1] + A1[1]) / 2 - 16, { boyut: 18, renk: 'turkuaz', agirlik: 700 });
          E.yazi(ctx, `b = ${E.sayiYaz(b)}`, (C[0] + A2[0]) / 2 + 28, (C[1] + A2[1]) / 2 - 16, { boyut: 18, renk: 'mercan', agirlik: 700 });
          [B, C, A1, A2].forEach((P) => E.nokta(ctx, P[0], P[1], 6, { renk: 'tebesir' }));
        },
      };
    },
  };

  /* ---------- 3. Küre üzerinde üçgen (3B) ---------- */
  const kure = {
    id: 'kure', ad: 'Küre üzerinde üçgen',
    ipucu: 'Küreyi sürükleyerek döndür. Kuzey kutbundan ekvatora inen ve ekvatorda çeyrek tur yürüyen üçgenin üç açısı da 90°!',
    kur(api) {
      const d = { enlem: 0, genislik: 90, yaw: 0.6, pitch: 0.35 };
      const gos = Lab.gosterge([['N', 'Kutuptaki açı'], ['A', 'A açısı'], ['B', 'B açısı'], ['top', 'Toplam']]);
      let r3 = null, canv = null, sahne, kam, grup, yaylar, durum = null;
      const kurulum = () => {
        canv = document.createElement('canvas');
        r3 = new THREE.WebGLRenderer({ canvas: canv, antialias: true, alpha: true, preserveDrawingBuffer: true });
        r3.setPixelRatio(1);
        sahne = new THREE.Scene();
        kam = new THREE.PerspectiveCamera(36, 1, 0.1, 100); kam.position.set(0, 0, 4.4);
        sahne.add(new THREE.AmbientLight(0x6a7aa8, 0.7));
        const l1 = new THREE.DirectionalLight(0xf1f4f9, 1.4); l1.position.set(3, 4, 5); sahne.add(l1);
        const l2 = new THREE.DirectionalLight(0x3ce6cf, 0.8); l2.position.set(-4, 1, -3); sahne.add(l2);
        grup = new THREE.Group(); sahne.add(grup);
        grup.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), new THREE.MeshStandardMaterial({ color: 0x16203a, roughness: 0.55, metalness: 0.1, transparent: true, opacity: 0.92 })));
        const tel = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1.002, 24, 12)), new THREE.LineBasicMaterial({ color: 0x3a4a6e, transparent: true, opacity: 0.35 }));
        grup.add(tel);
        yaylar = new THREE.Group(); grup.add(yaylar);
      };
      const nokta = (enlemD, boylamD) => { const f = (enlemD * Math.PI) / 180, l = (boylamD * Math.PI) / 180; return new THREE.Vector3(Math.cos(f) * Math.sin(l), Math.sin(f), Math.cos(f) * Math.cos(l)); };
      const yay = (a, b, renk) => {
        const pts = []; const om = a.angleTo(b);
        for (let i = 0; i <= 64; i++) { const t = i / 64; const s = Math.sin(om); const v = a.clone().multiplyScalar(Math.sin((1 - t) * om) / s).add(b.clone().multiplyScalar(Math.sin(t * om) / s)); pts.push(v.multiplyScalar(1.006)); }
        return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.014, 8, false), new THREE.MeshBasicMaterial({ color: renk }));
      };
      const kureAci = (X, Y, Z) => { const t1 = Y.clone().sub(X.clone().multiplyScalar(X.dot(Y))).normalize(), t2 = Z.clone().sub(X.clone().multiplyScalar(X.dot(Z))).normalize(); return Math.acos(clamp(t1.dot(t2), -1, 1)); };
      const yenile = () => {
        if (!r3) kurulum();
        while (yaylar.children.length) yaylar.remove(yaylar.children[0]);
        const N = new THREE.Vector3(0, 1, 0), A = nokta(d.enlem, -d.genislik / 2), B = nokta(d.enlem, d.genislik / 2);
        yaylar.add(yay(N, A, 0x3ce6cf), yay(A, B, 0xff5c70), yay(B, N, 0x9a86ff));
        for (const P of [N, A, B]) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshBasicMaterial({ color: 0xf1f4f9 })); m.position.copy(P.clone().multiplyScalar(1.01)); yaylar.add(m); }
        const aN = kureAci(N, A, B), aA = kureAci(A, N, B), aB = kureAci(B, N, A);
        durum = { N, A, B, aN, aA, aB };
        gos.yaz('N', fmtA(aN)); gos.yaz('A', fmtA(aA)); gos.yaz('B', fmtA(aB)); gos.yaz('top', E.sayiYaz(der(aN + aA + aB), 1) + '°');
        api.ciz();
      };
      let son = null;
      const panel = [
        Lab.kart('Üçgeni ayarla', [
          Lab.kaydirici({ ad: 'enlem', min: 0, max: 80, adim: 1, deger: 0, bicim: (v) => v + '°', degisti: (v) => { d.enlem = v; yenile(); } }),
          Lab.kaydirici({ ad: 'açı', min: 5, max: 170, adim: 1, deger: 90, bicim: (v) => v + '°', degisti: (v) => { d.genislik = v; yenile(); } }),
        ]),
        Lab.kart('Açılar', [gos]),
        Lab.kart('180 neden aşıldı?', [p('Kürede "doğru" büyük çemberdir ve <b>paralel büyük çember yoktur</b>. 180° ispatı paralel doğruya dayandığı için kürede geçmez. Üçgen küçüldükçe toplam 180°\'ye yaklaşır: küçük bir parça neredeyse düzlemdir.')]),
      ];
      setTimeout(yenile, 0);
      return {
        panel,
        basildi(x, y) { son = [x, y]; },
        suruklendi(x, y) { d.yaw += (x - son[0]) * 0.01; d.pitch = clamp(d.pitch + (y - son[1]) * 0.01, -1.3, 1.3); son = [x, y]; },
        uzerinde() { return true; },
        ciz(ctx, W, H) {
          if (!r3 || !durum) return;
          const k = Math.min(window.devicePixelRatio || 1, 2);
          r3.setSize(Math.round(W * k), Math.round(H * k), false);
          kam.aspect = W / H; kam.updateProjectionMatrix();
          grup.rotation.set(d.pitch, d.yaw, 0);
          r3.render(sahne, kam);
          ctx.drawImage(canv, 0, 0, W, H);
          grup.updateMatrixWorld();
          const ek = (v) => { const q = v.clone().multiplyScalar(1.12).applyMatrix4(grup.matrixWorld).project(kam); return [(q.x * 0.5 + 0.5) * W, (-q.y * 0.5 + 0.5) * H, q.z]; };
          [['N', durum.N, durum.aN, 'turkuaz'], ['A', durum.A, durum.aA, 'mercan'], ['B', durum.B, durum.aB, 'menekse']].forEach(([ad, v, a, renk]) => {
            const [x, y] = ek(v);
            const onde = v.clone().applyMatrix4(grup.matrixWorld).z > -0.15;
            E.etiket(ctx, `${ad}  ${fmtA(a)}`, x, y, { boyut: 16, renk, alfa: onde ? 1 : 0.35 });
          });
          E.yazi(ctx, `Toplam: ${E.sayiYaz(der(durum.aN + durum.aA + durum.aB), 1)}°`, W / 2, 28, { boyut: 22, agirlik: 760, renk: 'limon' });
        },
      };
    },
  };

  Lab.kur({ ad: T.labAd || 'Üçgen Laboratuvarı', tema: T.ad, temaNo: T.no, filmler: T.filmler, deneyler: [acilar, esitsizlik, kure] });
})();
