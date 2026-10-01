# Eksen motoru — film yapım kılavuzu

Bu belge, `filmler/<depo>/film.js` yazan herkes içindir. Referans film: `filmler/eksen-9-1-1-us-ve-kok/` (önce onu oku).

## Seri kimliği

- **Ad:** Eksen — 9. Sınıf Matematik Filmleri. Karaktersiz; yalnızca kamera, ışık ve nesnelerle anlatım.
- **Ton:** lise öğrencisi için olgun ve sinematik. Kısa cümleler. Tek görsel fikir; matematik gösterinin kendisi.
- **Palet (yalnızca bu tokenlar):** `gece` zemin, `lacivert` panel, `derin`, `sis` ızgara, `cizgi` eksen, `gumus` ikincil yazı, `tebesir` ana yazı, vurgular: `turkuaz` (A), `mercan` (B), `menekse` (C), `gok` (D), `limon` (E, az kullan, "sonuç/vurgu" rengi). Amber/krem/kâğıt dokusu ve voxel yok.
- **Fontlar:** `sans` = Bricolage Grotesque (metin), `serif` = Fraunces italik (değişkenler, formül içinde otomatik), `mono` = JetBrains Mono (kod/sözde kod), matematik sembolleri Noto Sans Math (otomatik yedek).
- **Yapı (≈ 90–120 sn):** soğuk açılış (çarpıcı soru/görüntü, 8–12 sn) → `E.imza` (≈3.5 sn) → `E.baslikKarti` (≈4 sn) → 3–5 fikir sahnesi (en az biri **sürpriz görsel dönüşüm**) → `E.ozetKarti` "Aklında kalsın" (≈10 sn) → `E.bitisKarti` laboratuvar QR'ı (≈6 sn).

## Dosyalar (film klasöründe yazacakların)

- `film.js` — sahneler. IIFE içinde `E.film({...})` çağrısı.
- `captions.js` — `window.ALTYAZI = [{ bas, son, tr, en, not }]`. `not`: öğretmen için seslendirme önerisi (ton, vurgu, es, sınıfa soru). Her altyazı ≤ ~70 karakter (TR), 2.5–5.5 sn ekranda. Altyazılar arası ≥ 0.1 sn boşluk; sıralı ve çakışmasız.
- `bilgi.json` — `{ ozet, fikir, sahneler: { "<sahne adı>": "ne oluyor" } }` (README'ye girer; sahne adları film.js ile birebir aynı).
- Geri kalan her şeyi (`index.html`, `motor/`, `araclar/`, `vendor/`, `README.md`, `package.json`, `LICENSE`, `PROMPT.md`) **elle yazma**: `node araclar/senkronla.mjs <depo-adı>` üretir. `ortak/` klasörünü değiştirme; motorda eksik görürsen film.js içinde yerel yardımcı yaz.

## Saf kare kuralı

Her şey `t`'nin (sahne içi `s.t`) fonksiyonudur. `Math.random`, `Date`, `performance.now`, `requestAnimationFrame`, sayaç/durum değişkeni **yasak**. Rastgelelik: `const r = E.rng(tohum); r()` — her karede aynı tohumla baştan üret (veya `E.hash(i, tohum)`). Önbellek (ör. önceden hesaplanan nokta listesi) yalnızca t'den bağımsız veriler için serbest.

## Film tanımı

```js
(function () {
  'use strict';
  const E = window.E;
  const { ara, kf, clamp, lerp, yd } = E;
  const meta = { kod: 'MAT.9.x.y', tema: 'Tema adı', ad: 'Film Adı', adEn: 'English Title',
    labAd: 'X Laboratuvarı', labAciklama: 'Bir cümle.', labUrl: 'https://hakanatas.github.io/eksen-lab-.../' };
  const sahneA = (ctx, s) => { /* s.t: sahne içi saniye, s.d: süre, s.p: 0..1, s.L: yerleşim */ };
  E.film({ meta, sure: 112, uc3b: [/* 3B sahnesi varsa örnek t */], sahneler: [
    { ad: 'Soğuk açılış: ...', bas: 0, son: 10.2, giris: 0, ciz: sahneA },
    { ad: 'İmza', bas: 10.0, son: 13.7, giris: 0.3, ciz: (c, s) => E.imza(c, s, meta) },
    { ad: 'Başlık', bas: 13.4, son: 17.7, ciz: (c, s) => E.baslikKarti(c, s, meta) },
    ...
    { ad: 'Aklında kalsın', bas: .., son: .., ciz: (c, s) => E.ozetKarti(c, s, [{ tr: '..', formul: '..' }, ...], { aralik: 1.6 }) },
    { ad: 'Laboratuvar', bas: .., son: sure, cikis: 0.8, ciz: (c, s) => E.bitisKarti(c, s, meta) },
  ]});
})();
```

Sahneler 0.2–0.3 sn örtüşerek çapraz geçer (`giris`/`cikis` varsayılan 0.6 sn). Her sahneye motor hafif bir kamera itmesi uygular (`itme: 0.018`; kapatmak için `itme: 0`).

## Yerleşim (16:9 ve 9:16 — ikisi de kusursuz olmalı)

- `E.yatay` (bool), `E.W/E.H` (1280×720 veya 720×1280), `E.yd(yatayDeger, dikeyDeger)`.
- `E.L.icerik = { x, y, w, h, x1, y1, cx, cy }` — **tüm içerik bu kutuda kalır**. Altında altyazı bölgesi vardır (yatayda alt ~150 px, dikeyde alt ~400 px). Dikeyde içerik ≈ 640×784'tür: yan yana koyduğun şeyleri dikeyde **üst üste** diz.
- En küçük yazı **22 px** (denetim 20 px altını hata sayar). Gövde 30–40 px, başlık 44+ px.

## Çizim API'si (özet)

| İşlev | Ne yapar |
|---|---|
| `E.ara(t, a, b, 'io3')` | t'nin [a,b]'deki 0..1 ilerlemesi, yumuşatmalı (`lin, io2, io3, cik3, cik5, gir2, geri, yumusak`) |
| `E.kf(t, [[t0,v0],[t1,v1,'io3'],...])` | anahtar kare (sayı veya dizi) |
| `E.nabiz(t, t0, d)` | t0'da başlayan 0→1→0 darbe |
| `E.rng(tohum)`, `E.hash(i, s)`, `E.gurultu(x, s)` | tohumlu rastgelelik |
| `E.yazi(ctx, metin, x, y, {boyut, agirlik, renk, hiza, maxGen, alfa, parilti, yaz:0..1, font:'sans'|'mono', harfAra})` | yazı (satır sarma, daktilo) |
| `E.formul(ctx, 'tex', x, y, {boyut, renk, hiza, alfa, aciga:0..1, parilti})` | mini TeX: `^{}`, `_{}`, `\frac{}{}`, `\sqrt{}`, `\sqrt[n]{}`, `\c{renk}{..}`, `\t{düz metin}`, `\kutu{renk}{..}`, `\ustcizgi{}`, `\,` `\;` `\quad`, `\cdot \le \ge \ne \in \notin \cup \cap \subset \subseteq \forall \exists \R \N \Z \Q \pi \infty \Rightarrow \iff \and \or \xor \neg \pm \approx \angle \triangle \cong \sim \emptyset \setminus \gamma \circ \parallel \perp \equiv \{ \}`, `\vec{v}`. Ondalık virgül: `3{,}14`. Tek harfler otomatik italik. |
| `E.yaziOlc`, `E.formulOlc`, `E.sigdir` | ölçüm / sığdırma |
| `E.cizgi(ctx, [[x,y],...], {renk, kalinlik, parilti, p:0..1, kesik:[a,b], kapali, ok})` | ışıklı çizgi, çizilerek belirme |
| `E.ok`, `E.cokgen(ctx, pts, {renk, alfa, kenar})`, `E.nokta(ctx, x, y, r, {renk, bos, parilti})` | ok, dolgu, nokta |
| `E.isik(ctx, x, y, r, renk, guc)` | toplamalı yumuşak ışık (vurgu, patlama) |
| `E.aciYayi(ctx, x, y, r, a0, a1, {renk, p})`, `E.dikAci` | açı işaretleri |
| `E.panel(ctx, x, y, w, h, {vurgu:'turkuaz', alfa})`, `E.etiket(ctx, metin, x, y, {formul})` | cam panel, plakalı etiket |
| `E.duzlem({x,y,w,h,xmin,xmax,ymin,ymax})` → `.ciz(ctx,{adim})`, `.egri(ctx, f, {renk,p})`, `.px .py .p(x,y)` | koordinat düzlemi |
| `E.sayiDogrusu({x,y,w,min,max})` → `.ciz(ctx,{adim,etiketAdim})`, `.aralik(ctx,a,b,{acikSol,acikSag,renk,dy,p})`, `.px` | sayı doğrusu ve aralık ışınları |
| `E.kamera(ctx, {x,y,z,r})` | (x,y)'yi ekran merkezine al, z yakınlaştır, r döndür (sahne içinde `ctx.save/restore` ile) |
| `E.isikSupur(ctx, p)` | çapraz ışık süpürmesi (geçiş vurgusu) |
| `E.karistir(r1, r2, p)`, `E.rgba(r, a)` | renk |

### 3B (yalnızca kavrama gerçekten değer katıyorsa)

`film.js` içinde `E.uc` kullanırsan senkron betiği `three.min.js` (r160, global `THREE`) ve `motor/uc.js`'i otomatik ekler. Sahneyi bir kez (tembel) kur, her karede t'den konum/dönüş/kamera hesapla, sonra `E.uc.ciz(ctx, sahne, kamera, {x,y,w,h,alfa})`. Yardımcılar: `E.uc.isiklar(sahne)`, `E.uc.malzeme('turkuaz')`, `E.uc.kenar(geo,'turkuaz')`, `E.uc.cubuk(a,b,r,'limon')`, `E.uc.ekranda(v3, kamera)` (3B noktaya 2B etiket). `E.film({ uc3b: [ornekT] })` ver; `npm run webgl-test` bu kareyi dener. Yazıları 3B'ye gömme; 2B katmanda `E.yazi/E.formul` ile çiz.

## Denetim ve önizleme (zorunlu)

```bash
node araclar/senkronla.mjs <depo-adı>
cd filmler/<depo-adı>
node araclar/onizleme.mjs               # kareler + 0,25 sn aralıkla taşma/çakışma/küçük yazı denetimi (altyazı TR+EN ile)
node ../../araclar/temas-yaprak.mjs . h  # onizleme/yaprak/h-*.png (2×2)
node ../../araclar/temas-yaprak.mjs . v  # onizleme/yaprak/v-*.png (4'lü)
```

Denetim temiz olana kadar düzelt ("✔ Denetim temiz"). Sonra yaprakları **gözle** incele: üst üste binen yazı/şekil, kenardan taşma, okunmayan küçük yazı, boş kalan dev alanlar, dikeyde sıkışma. Kasıtlı üst üste binme (ör. iki terimin birbirini silmesi) için o çağrıya `cakisabilir: true` ver. `--zamanlar 3.2,15,40` ile belirli kareleri, `--kare` ile yalnızca kareleri üretebilirsin.

## Altyazı ve içerik kuralları

- Müfredat çıktısının alt maddelerini kapsa (varsayım → örüntü → genelleme → önerme → doğrulama/ispat → problemde kullanım), ama madde madde okuma; görsel fikirle göster.
- Sayılar doğru olsun (hesapla ve kontrol et). Türkçe ondalık virgül; binlik ayırıcı ince boşluk.
- EN altyazı doğal İngilizce; TR'nin çevirisi.
- Gerçek hayat/lise öğrencisi dünyası örnekleri; çocuksu dil yok.
