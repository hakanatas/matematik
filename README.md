# Eksen — 9. Sınıf Matematik Filmleri (üretim deposu)

Türkiye Yüzyılı Maarif Modeli ortaöğretim matematik öğretim programının **9. sınıf** öğrenme çıktılarının her biri için kısa, sinematik bir film; her tema için etkileşimli bir laboratuvar; hepsini toplayan bir hub. Ortaokul serisi [Nokta'nın Filmleri](https://hakanatas.github.io/nokta-filmleri)'nin lise karşılığıdır.

Bu depo **üretim deposudur**: her film, laboratuvar ve hub burada ayrı bir klasör olarak durur ve `yayinla.sh` ile **ayrı bir GitHub deposu + GitHub Pages sayfası** olarak yayınlanır.

## Mac'te iki komut

```bash
./uret.sh        # tüm filmlerin MP4 (yatay + dikey 720p), SRT ve seslendirme notlarını üretir
./yayinla.sh     # depoları oluşturur/günceller, Pages'i açar, v1.0 sürümlerine 6 dosyayı yükler
```

- İkisi de **tekrar çalıştırılabilir**: biten MP4'ler, var olan depolar, açık Pages ve yüklenmiş sürüm dosyaları atlanır. Yarıda kalırsa aynı komutu yeniden çalıştırın.
- Yalnızca bazı filmler için: `./uret.sh 9-4-1`, `./yayinla.sh 9-4` (adında geçen metinle süzer). Bir filmi yeniden üretmek: `./uret.sh 9-1-1 --zorla`.
- `uret.sh` kendini `caffeinate -dis` altında yeniden başlatır (Mac uyumaz). Playwright, **yüklü Google Chrome'u** `channel: 'chrome'` ile kullanır; kendi Chromium'unu indirmez (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`). Kodlama `ffmpeg -nostdin` ile yapılır. 3B sahne içeren ilk filmde önce başsız Chrome'da WebGL testi çalışır.
- `yayinla.sh` yükleme için yalnızca **gh** kullanır (tarayıcı yok). Yayın kopyaları `~/eksen-yayin/<depo>` altında tutulur.
- Gerekenler: Node.js 18+, ffmpeg, Google Chrome, gh (girişli). `brew install node ffmpeg gh`.

## Klasörler

| Klasör | İçerik |
|---|---|
| `filmler/eksen-9-x-y-…/` | Her öğrenme çıktısı için bir film (ayrı depo). `film.js`, `captions.js`, `bilgi.json` elle yazılır; gerisi senkronla üretilir. |
| `laboratuvarlar/eksen-lab-…/` | Her tema için bir laboratuvar (ayrı depo). `lab.js`, `bilgi.json` elle yazılır. |
| `hub/` | Bütün filmleri ve laboratuvarları toplayan sayfa (`eksen-filmleri` deposu). |
| `ortak/` | Ortak motor (`motor/`), laboratuvar kiti (`lab/`), fontlar, üçüncü taraf kütüphaneler, dışa aktarım araçları, `MOTOR.md` (yapım kılavuzu), `SENARYOLAR.md` (film senaryoları). |
| `mufredat/` | Öğrenme çıktıları ve alt maddeleri (birebir, JSON) ve programın 9. sınıf metni. |
| `araclar/` | `senkronla.mjs` (ortak dosyaları dağıtır, index/README üretir), `posterler.mjs`, `temas-yaprak.mjs`, `lab-onizleme.mjs`, `yayin-listesi.mjs`, `readme.mjs`. |
| `PROMPT.md` | Serinin istemi (birebir); her depoya kopyalanır. |

## Geliştirme

```bash
node araclar/senkronla.mjs                 # ortak/ değişince her klasöre dağıt
cd filmler/<film> && node araclar/onizleme.mjs   # kareler + yazı taşma/çakışma/küçük yazı denetimi
node araclar/temas-yaprak.mjs filmler/<film> h   # 2×2 temas yaprağı
node araclar/lab-onizleme.mjs laboratuvarlar/<lab>   # masaüstü + telefon ekran görüntüleri
node araclar/posterler.mjs                 # film afişleri (hub ve og:image için)
```

Her film karesi `renderFrame(t)` ile zamanın saf fonksiyonudur; rastgelelik tohumludur, ekran kaydı yoktur. 3B sahneler de (Three.js) aynı `t`'den çizilir.

## Lisans

Bu çalışma [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.tr) ile lisanslanmıştır (bkz. `LICENSE`). Fontlar SIL OFL 1.1, three.js ve qrcode-generator MIT lisanslıdır.
