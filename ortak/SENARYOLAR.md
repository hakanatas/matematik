# Eksen — film senaryo özetleri (9. sınıf)

Her film için: tek görsel fikir, sürpriz dönüşüm, sahne akışı, doğrulanmış sayılar. Süre 95–120 sn. Yapı ve kurallar: `ortak/MOTOR.md`. Birebir öğrenme çıktısı ve alt maddeler: `mufredat/9-sinif.json`. Öğretim uygulaması ipuçları: `mufredat/9-sinif-program-metni.txt`.

Laboratuvarlar (bitiş kartındaki `labUrl`/`labAd`):

| Tema | labAd | labUrl | İçerik (labAciklama için) |
|---|---|---|---|
| 1 Sayılar | Sayılar Laboratuvarı | https://hakanatas.github.io/eksen-lab-sayilar/ | Üs merdiveni, aralık tezgâhı (∪ ∩ \ tümleme), sayı doğrusu mikroskobu |
| 2 Nicelikler ve Değişimler | Fonksiyon Laboratuvarı | https://hakanatas.github.io/eksen-lab-fonksiyonlar/ | a, r, k kaydırıcılarıyla f(x)=x'i dönüştür; mutlak değeri katla; iki doğrunun kesişimi ve eşitsizlik bölgeleri |
| 3 Geometrik Şekiller | Üçgen Laboratuvarı | https://hakanatas.github.io/eksen-lab-ucgen/ | Köşeleri sürükle: iç/dış açılar, kenar–açı sırası, üçgen eşitsizliği çubukları, küre üzerinde üçgen (3B) |
| 4 Eşlik ve Benzerlik | Dönüşüm ve Benzerlik Laboratuvarı | https://hakanatas.github.io/eksen-lab-donusumler/ | Motif tasarla, yansıt-ötele-döndür, iki ayna; Tales paraleli ve dik üçgende yükseklik |
| 5 Algoritma ve Bilişim | Algoritma Laboratuvarı | https://hakanatas.github.io/eksen-lab-algoritma/ | Çizge çiz ve Euler yolunu ara, ikili arama oyunu, mantık kapılarıyla algoritma kur |
| 6 İstatistiksel Araştırma Süreci | Veri Laboratuvarı | https://hakanatas.github.io/eksen-lab-veri/ | Noktaları sürükle: histogram, kutu grafiği, ortalama, ortanca, standart sapma anında değişsin; yanıltıcı eksen |
| 7 Veriden Olasılığa | Olasılık Laboratuvarı | https://hakanatas.github.io/eksen-lab-olasilik/ | Zar, para, çark deneyini binlerce kez çalıştır; göreli sıklık teorik olasılığa yaklaşsın |

---

## 9.1.2 — Işık Aralıkları (eksen-9-1-2-araliklar)
**Fikir:** Aralıklar sayı doğrusuna düşen ışık hüzmeleridir. Kapalı uç = dolu ışık noktası, açık uç = içi boş halka. Küme işlemleri ışığın davranışıdır: birleşim iki hüzmenin toplamı, kesişim ikisinin üst üste geldiği (renkler karışıp beyazlaşan) bölge, fark gölgeyle kesilen parça, tümleme ışığın negatifi.
- **Soğuk açılış:** Gece, bir aşı dolabının ekranı: "2 °C ile 8 °C arasında saklayın". Sıcaklık ibresi sayı doğrusu olur; [2, 8] aralığı ışıkla yanar. 2 ve 8 dahil mi? Dolu uçlar. "Sınırda olmak da içeride olmaktır."
- Gösterimler: `[a, b]`, `(a, b)`, `[a, b)`, `(−∞, a]`; eşitsizlik ↔ aralık ↔ küme gösterimi `{x ∈ ℝ | 2 ≤ x ≤ 8}` üçü aynı anda (aynı ışın, üç yazılış).
- Örnek: sınav notu geçme `[50, 100]`, ehliyet yaşı `[18, ∞)`, yaş sınırı 13 yaş altı `(−∞, 13)`, otobüs indirimi.
- **İşlemler:** A = [−2, 4), B = (1, 6]. A ∪ B = [−2, 6], A ∩ B = (1, 4), A \ B = [−2, 1], B \ A = [4, 6], A' (evrensel küme ℝ) = (−∞, −2) ∪ [4, ∞). Uçların açık/kapalı olması tek tek gerekçelendirilsin (1 B'de yok → A\B'de 1 var; 4 A'da yok → B\A'da 4 var).
- **Sürpriz:** Mutlak değerle aralık: |x − 5| < 3 → "5'e uzaklığı 3'ten az" bir projektör: merkez 5'te, yarıçapı 3 olan ışık; (2, 8) çıkar. Üretim toleransı örneği: çapı 20 mm olması gereken vida, |d − 20| ≤ 0,05 → [19,95; 20,05].
- Alt maddeler: tanıma (a), probleme uygun sembolü belirleme (b), kullanma (c).
- Özet: aralık = sayı doğrusundaki kesintisiz parça; ∪ ∩ \ ′; açık/kapalı uç; |x − m| < r.

## 9.1.3 — Kaçış (eksen-9-1-3-sayi-kumeleri)
**Fikir:** Her sayı kümesi bir ışık halkasıdır. Bir işlem sonucu halkanın dışına "kaçtığında" yeni, daha büyük halka doğar: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Kapalılık = kaçamamak.
- **Soğuk açılış:** 3 − 5 = ? Doğal sayılar halkasında hesap yapan ışık noktası halkanın dışına fırlar (−2). Halka genişler: ℤ doğar. "Bazı sorular, sorulduğu kümeye sığmaz."
- ℕ: toplama ve çarpmaya göre kapalı, çıkarmaya göre değil (3 − 5). ℤ: bölmeye göre değil (1 : 2) → ℚ. ℚ: karekök almaya göre değil (birim karenin köşegeni √2) → ℝ.
- **Arada olma (yoğunluk):** sonsuz yakınlaştırma: iki rasyonel sayı arasına her zaman (a + b)/2 girer (cebirsel ispat: a < b ⇒ a < (a+b)/2 < b). 0 ile 1 arasında yakınlaştıkça hep yeni kesirler doğar. Ama ℤ'de 2 ile 3 arasında hiç tam sayı yok (sıralama var, arada olma yok).
- **Sürpriz:** "Rasyoneller her yerde, o hâlde doğru dolu mu?" Yakınlaştırmada √2'nin yeri boş bir delik olarak kalır; ışık oraya düşmez. ℝ bu delikleri doldurur.
- **Çürütme (aksine örnek):** "İki irrasyonel sayının çarpımı irrasyoneldir." → √2 · √2 = 2. Tek bir karşıt örnek önermeyi yıkar (kırmızı çatlak efekti). Doğrudan ispat ve aksine örnek yöntemlerinin karşılaştırılması.
- Tablo: küme × işlem kapalılık ızgarası (+, −, ·, :) ✓/✗ dolarak (: için 0'a bölme hariç).
- Özet: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ; kapalılık; iki rasyonel arasında hep rasyonel var; tek karşıt örnek "her" önermesini çürütür.

## 9.1.4 — Aynı Alan, İki Yazılış (eksen-9-1-4-cebirsel-ozellikler)
**Fikir:** Gerçek sayıların işlem özellikleri, alanın korunmasıdır. Bir dikdörtgeni döndürmek değişme, bölmek dağılma, kesip kaydırmak özdeşliktir. Aynı alan, iki farklı cebirsel yazılış.
- **Soğuk açılış:** Akıldan: 51 · 49 = ? Saniyede cevap: 2499. Nasıl? 50² − 1². Kamera bir kare ızgaraya dalar.
- Değişme: a·b dikdörtgeni 90° döner, alan aynı: ∀a, b ∈ ℝ, a · b = b · a. Birleşme (kutu hacmi değil, 2B kalsın: (a+b)+c). Birim eleman (·1), yutan eleman (·0 → alan sıfıra çöker), ters eleman (∀a ≠ 0 ∃b: a·b = 1).
- Dağılma: a(b + c) dikdörtgeni ikiye bölünür = ab + ac. Gerçek örnek: 7 · 98 = 7(100 − 2) = 686.
- (a + b)² karesi dört parçaya ayrılır: a², ab, ab, b² → a² + 2ab + b². (a − b)² benzer.
- **Sürpriz:** a² − b²: büyük kareden küçük kare kesilir; kalan L şekli kesilip döndürülerek (a + b) × (a − b) dikdörtgenine kayar. Sonra 51·49 = (50+1)(50−1) = 2500 − 1 = 2499 açılışa döner.
- Sıfır çarpımı: a · b = 0 ⇔ a = 0 ∨ b = 0 — alanı sıfır olan dikdörtgenin bir kenarı sıfırdır. Çarpanlara ayırma = alanı dikdörtgene dönüştürmek: x² + 5x + 6 = (x + 2)(x + 3) parçaların dikdörtgen olarak dizilmesi.
- Niceleyiciler ve bağlaçlar sembolik dille: ∀, ∃, ∧, ∨, ⇒, ⇔ (kısa, görsel).
- Özet: değişme/dağılma/özdeşlikler; a² − b² = (a + b)(a − b); ab = 0 ⇔ a = 0 ∨ b = 0.

## 9.2.1 — Tek Doğru (eksen-9-2-1-dogrusal-fonksiyon)
**Fikir:** Bütün doğrusal fonksiyonlar tek bir doğrunun, f(x) = x'in dönüşmüş hâlidir. g(x) = a · f(x − r) + k: a eğer/çevirir, r yatay kaydırır, k dikey kaydırır.
- **Soğuk açılış:** Taksimetre: açılış 40 TL, km başına 25 TL (örnek sayılar; "yaklaşık" deme, kurgusal tarife). Ücret grafiği bir doğru. "Bu doğru aslında başka bir doğrunun kılık değiştirmiş hâli."
- f(x) = x referans doğrusu: tanım kümesi ℝ, görüntü kümesi ℝ, sıfırı x = 0, işareti (x < 0 negatif, x > 0 pozitif), artan, maksimum/minimum yok, bire bir (yatay doğru testi).
- Dönüşümler sırayla: k (yukarı/aşağı), r (sağa/sola; x − r'de işaret tuzağı), a (eğim; a < 0 yansıma, artan→azalan), a = 0 sabit fonksiyon (artık bire bir değil).
- Önermeler: ∀a > 0 için h(x) = ax + b artandır; ispat: x₁ < x₂ ⇒ ax₁ < ax₂ ⇒ h(x₁) < h(x₂). Sıfır: x = −b/a; işaret tablosu.
- **Sürpriz:** Doğruyu r kadar sağa kaydırmak ile a·r kadar aşağı kaydırmak aynı doğruyu verir (iki animasyon aynı yere oturur): a(x − r) + k = ax + (k − ar). Doğru için yatay ve dikey kayma birbirinin kılığıdır.
- Kapalı/açık aralıkta tanımlı doğrusal fonksiyonda max/min (açık uçta yok). Parçalı fonksiyon: ısıtılan buz (−10 °C'den 0 °C'ye yükselir, eriyene kadar 0 °C'de sabit kalır, sonra yükselir).
- Özet: g(x) = a·f(x − r) + k; a işareti artanlık; sıfır −b/a; parçalı tanım.

## 9.2.2 — Katlanan Doğru (eksen-9-2-2-mutlak-deger)
**Fikir:** Mutlak değer, doğrunun x ekseninin altında kalan parçasını eksen boyunca yukarı katlamaktır. Katlama, düzlemin x ekseni etrafında 180° dönmesidir (kâğıt katlama perspektifi: alt yarı derinlikte dönerek üste gelir; 2B'de cos ile ölçeklenen yükseklikle canlandır).
- **Soğuk açılış:** Bir otobüs durağına doğru yürüyen öğrenci: durağa uzaklık önce azalır, durakta 0 olur, sonra artar. Uzaklık–konum grafiği V çizer. Konum − durak = x − 3 ise uzaklık |x − 3|.
- f(x) = x ve n(x) = |x|: benzerlik (x ≥ 0'da aynı) ve fark (x < 0'da yansıyor); n(x) = −|x| (ters V).
- Parçalı gösterim: |x| = { x, x ≥ 0; −x, x < 0 }.
- h(x) = 2x − 4 → |h(x)|: kırılma noktası h'nin sıfırı x = 2; katlama; m(x) = |2x − 4| − 1 (aşağı kaydır) → sıfırları x = 1,5 ve 2,5.
- Nitel özellikler: tepe noktası (b/a'nın işaretiyle −b/a, c), simetri ekseni x = −b/a, görüntü kümesi [c, ∞) veya (−∞, c], artan/azalan aralıklar, sıfır sayısı (0, 1 veya 2).
- **Sürpriz:** Katlama 3B bir dönüştür: x ekseni menteşe olur, alt yarı ekrandan dışarı dönerek üste kapanır (perspektifli 2B ya da tek 3B sahne). Sonra iki parçanın denklemleri ayrı renklerde yazılıp tek parçalı ifadede birleşir.
- Özet: |h(x)| = h'nin negatif parçasını katla; tepe x = −b/a; parçalı gösterim; ±|ax+b| ± c.

## 9.2.3 — Kesişim Anı (eksen-9-2-3-denklem-esitsizlik)
**Fikir:** Denklem, iki doğrunun buluştuğu andır; eşitsizlik, bir doğrunun diğerinin üstünde kaldığı zaman dilimidir. Çözüm kümesi x ekseninde yanan bir aralık olarak düşer.
- **Soğuk açılış:** İki mobil hat tarifesi. Hat A: aylık 100 TL + GB başına 20 TL; Hat B: 220 TL + GB başına 5 TL. Hangisi ucuz? İki doğru yarışır, 8 GB'ta kesişir (100 + 20x = 220 + 5x ⇒ x = 8; ücret 260 TL).
- Eşitsizlik: 100 + 20x < 220 + 5x ⇒ x < 8: A'nın doğrusu B'nin altında kalan bölge; x ekseninde [0, 8) aralığı yanar (GB negatif olamaz: bağlam tanım kümesini kısıtlar).
- f(x) < 0'ın, g(x) = 0 (x ekseni) özel hâli olduğu: f(x) = 2x − 6 < 0 ⇒ x < 3; işaret tablosu x = −b/a.
- Mutlak değer: |x − 20| ≤ 2 (termostat 20 °C ± 2) ⇒ 18 ≤ x ≤ 22: V'nin y = 2 doğrusunun altında kaldığı aralık. |f(x)| = g(x) iki kesişim.
- **Sürpriz:** Arz–talep: talep doğrusu p = 100 − 2q, arz p = 20 + 2q; kesişim q = 20, p = 60 (denge fiyatı). Fiyat 60'ın üstündeyken arz fazlası bölgesi görünür.
- Strateji karşılaştırma: grafik okuma, cebirsel çözüm, yerine koyarak doğrulama (8 GB: A = 260, B = 260 ✓).
- Özet: f(x) = g(x) kesişim; f(x) < g(x) altta kalan x'ler; |f(x)| ≤ k bir bant; çözümü başka yolla doğrula.

## 9.3.1 — 180'in Sırrı (eksen-9-3-1-ucgen)  · 3B sahne içerir
**Fikir:** Üçgenin açıları bir doğru üzerinde yan yana dizilince tam bir doğru açısı (180°) olur — çünkü paraleller öyle söyler. Sürpriz: paralellerin olmadığı bir yüzeyde (küre) bu toplam 180'i aşar.
- **Soğuk açılış:** Kuzey Kutbu'ndan yola çıkan biri ekvatora iner, ekvator boyunca dünyanın çeyreği kadar yürür, tekrar kutba döner: üç dik açılı bir üçgen! 90 + 90 + 90 = 270? (Sadece kısa bir ipucu: dönen bir küre siluetinde, "bunu sona saklayalım".)
- Düzlemde ispat: C'den AB'ye paralel çiz (bir noktadan tek paralel — Öklid'in 5. postulatı). İç ters açılar A ve B'yi C'nin yanına taşır; üç açı bir doğru açısı oluşturur. Açılar ışık dilimleri olarak yerlerinden kopup paralelin üstünde yan yana dizilir.
- Dış açı = komşu olmayan iki iç açının toplamı (ispat: 180 − C). Dış açılar toplamı 360°: üçgenin çevresinde yürüyen bir ok her köşede dönüş yapar; üçgen noktaya küçülünce dönüşler tam bir tur olur (görsel ispat).
- Kenar–açı: en uzun kenarın karşısında en büyük açı (köşeyi kaydırınca açı büyür, karşı kenar uzar; menteşe animasyonu).
- Üçgen eşitsizliği: 3, 4 ve 8 birimlik çubuklar kapanmaz; 3 + 4 > 8 değil. |b − c| < a < b + c. Köprü kafes kirişleri (mimari, mühendislik): üçgen kilitlenir.
- **Sürpriz (3B):** Three.js küre: kutup–ekvator üçgeni, üç 90° açı → 270°. Küçük üçgenler neredeyse 180°, büyüdükçe toplam artar. "180, düzlemin imzasıdır." (Nasirüddin Tusi'nin paralellik postulatı çalışmalarına bir cümlelik değinme.)
- Özet: iç açılar 180°, dış açı = iki uzak iç açı, dış açılar 360°, büyük kenar ↔ büyük açı, |b − c| < a < b + c.
- `uc3b: [<küre sahnesinden bir t>]`; WebGL testi bu filmde yapılır.

## 9.4.1 — İki Ayna (eksen-9-4-1-donusumler) · 3B sahne içerir
**Fikir:** Yansıma, öteleme ve dönme aynı ailedendir: iki yansıma bir öteleme ya da bir dönme eder. Paralel iki ayna → öteleme (aynalar arası uzaklığın 2 katı). Kesişen iki ayna → dönme (aynalar arası açının 2 katı, merkez kesişim noktası).
- **Soğuk açılış:** Bir kilim motifi kendini çoğaltır; kamera geri çekildikçe bütün desenin tek bir küçük parçanın kopyaları olduğu anlaşılır. "Bu desen, iki aynanın eseri."
- Yansıma: şekil ve görüntü eş, uzunluk/açı korunur, yön (saat yönü) ters döner. **3B anı:** yansıma, şeklin ayna doğrusu etrafında düzlemden çıkıp 180° dönerek arka yüzüyle geri gelmesidir (Three.js'te ince bir motif plakası menteşe gibi döner; arka yüzü farklı renkte, yön değişimi görünür).
- Öteleme: tüm noktalar aynı vektörle kayar; yön korunur. Dönme: merkez ve açı; yön korunur.
- **Sürpriz:** Paralel iki ayna (aralık d) → art arda yansıma = 2d öteleme. Kesişen aynalar (açı θ) → 2θ dönme. Aynalar 60° iken altı kopya: kaleydoskop → bir kilim/çini rozeti doğar.
- Değişmezler: her üç dönüşümde de görüntü baştaki şekle eştir (çevre ve alan aynı).
- Özet: yansıma yön çevirir; öteleme ve dönme yön korur; iki yansıma = öteleme veya dönme; görüntü hep eş.
- `uc3b: [<3B yansıma sahnesinden bir t>]`.

## 9.4.2 — Üçgeni Kilitlemek (eksen-9-4-2-es-ve-benzer)
**Fikir:** Bir üçgeni "kilitlemek" için kaç bilgi gerekir? Her bilgi verildiğinde olası üçgenlerin hayalet ailesi daralır. KKK, KAK, AKA tek üçgene kilitler (eşlik). AA ise yalnızca şekli kilitler, boyut serbest kalır: hayaletler aynı şeklin büyütülmüş kopyalarıdır — benzerlik.
- **Soğuk açılış:** Bir kenar verilir: sonsuz üçgen titreşir. İkinci kenar: menteşe gibi açılıp kapanan üçgenler. "Kaç bilgi yeter?"
- KKK: üç çubuk tek üçgen (geometri tahtası). KAK: iki kenar + arasındaki açı. AKA: bir kenar + iki uç açısı. Eşlik = yansıma/öteleme/dönmeyle üst üste getirilebilme (9.4.1'e bağ).
- **Tuzak/sürpriz:** KKA (açı kenarlar arasında değil) bazen iki farklı üçgen verir: pergel yayı doğruyu iki noktada keser (iki hayalet aynı anda kilitlenir). AAA eşlik değil benzerlik!
- Benzerlik: AA (üçüncü açı zaten 180'den gelir), KKK orantı (3-4-5 ve 6-8-10, oran 2), KAK orantı. Benzerlik oranı k; eş üçgenlerde k = 1.
- Gerçek hayat: telefon ekranında fotoğrafı iki parmakla büyütmek (benzerlik), harita ölçeği.
- Özet: eşlik koşulları KKK, KAK, AKA; benzerlik AA, KKK∼, KAK∼; KKA tuzağı; eşlik = benzerlik oranı 1.

## 9.4.3 — Üçgenin İçindeki Üçgenler (eksen-9-4-3-benzer-ucgen-olusturma)
**Fikir:** Bir üçgenin içinden benzer üçgenler "doğurmak" için iki çizim yeter: bir kenara paralel bir doğru, ya da dik üçgende hipotenüse yükseklik. Yansıtma (geçmiş deneyimleri gözden geçirme) tonu: "Hangi çizim neden işe yaradı?"
- **Soğuk açılış:** Bir dik üçgen hipotenüse yükseklikle bölünür; çıkan iki parça dönüp büyüyerek büyük üçgenin üstüne tam oturur. Sonra parçalar tekrar bölünür: sonsuza giden bir sarmal (Matruşka).
- Paralel çizim: DE ∥ BC → ADE ∼ ABC (AA: yöndeş açılar). Paralel doğru kaydırıldıkça sonsuz benzer üçgen ailesi; dışarı uzatınca da (üçgenin dışında) benzer üçgen. Kelebek (çapraz) durum: paraleller arasında ters yönde benzer üçgenler.
- Paralel olmayan bir doğru çizilirse? Benzerlik bozulur (karşı örnek: açı ölçüleri tutmaz).
- Dik üçgende yükseklik: üç benzer üçgen (büyük, sol, sağ), her biri döndürülüp hizalanarak karşılaştırılır; açı renkleri eşleşir.
- **Sürpriz:** Yüksekliği tekrar tekrar indirerek oluşan altın sarmal benzeri spiral; her adımda aynı oran.
- Problem: bir resim çerçevesinde ya da çatı makasında paralel kirişlerin oluşturduğu benzer üçgenlerle eksik uzunluğu bulmak.
- Özet: kenara paralel → benzer; dik üçgende hipotenüse yükseklik → üç benzer üçgen; hangi çizim, hangi koşul (AA).

## 9.4.4 — Kaybolmayan Alan (eksen-9-4-4-tales-oklid-pisagor)
**Fikir:** Dik üçgende hipotenüse indirilen yükseklik iki benzer üçgen doğurur; benzerlikten Öklid bağıntıları, onlardan da Pisagor kendiliğinden çıkar. Görsel ispat: bacaklar üzerindeki kareler, alanları korunarak (kesme/kaydırma) hipotenüs karesinin iki dikdörtgenine dönüşür.
- **Soğuk açılış:** 3-4-5 üçgeninin kenarlarına kareler; 9 + 16 = 25 kare birimleri tek tek akıp büyük karenin içini doldurur. "Peki her dik üçgende mi?"
- **Tales:** Paralel üç doğru (perdenin jaluzi şeritleri / güneş ışınları) iki kesen üzerinde orantılı parçalar ayırır: |AB|/|BC| = |DE|/|EF|. İspat: kesen boyunca paralel kaydırma + benzer üçgenler.
- **Öklid:** ABC'de A dik, AH yükseklik, BH = p, HC = k, BC = a. ABH ∼ CAH ∼ CBA (AA) ⇒ h² = p · k, c² = p · a, b² = k · a (c = |AB|, b = |AC|).
- **Pisagor:** c² + b² = p·a + k·a = a(p + k) = a². Görselde: c² karesi kesilip kaydırılarak (alan korunur: paralelkenara çarpıtma) p×a dikdörtgenine, b² karesi k×a dikdörtgenine dönüşür; ikisi birlikte a² karesini tam doldurur — sürpriz an.
- Sonuç: Geniş açılı üçgende a² > b² + c², dar açılıda a² < b² + c² (açı aralığında kayan köşe ile karşı kenarın karesinin değişimi).
- Özet: Tales orantısı; h² = pk, b² = ka, c² = pa; a² = b² + c²; geniş/dar açılı sonuçlar.

## 9.4.5 — Ulaşılamayanı Ölçmek (eksen-9-4-5-benzerlik-problemleri)
**Fikir:** Benzer üçgenler, dokunamadığın uzunlukları ölçmenin anahtarıdır: gölgeyle minare yüksekliği, ayna ile ağaç boyu, nehir genişliği. Problem çözme döngüsü (verilen/istenen → temsil → strateji → çözüm → kontrol) sinematik bir saha ölçümü gibi.
- **Soğuk açılış:** Gün batımında bir şehir silueti; uzun bir minare (ya da kule). "Ona tırmanmadan boyunu bul." Güneş ışınları hepsine aynı açıyla düşer.
- Gölge yöntemi: 1,7 m boyunda öğrencinin gölgesi 2,5 m; kulenin gölgesi 50 m ⇒ h/50 = 1,7/2,5 ⇒ h = 34 m. (Tales'in piramit hikâyesine bir cümle.)
- Kontrol: farklı saatte ölçüm (gölge 1,7 m'ye karşı 3,4 m; kule 68 m ⇒ yine 34 m ✓). Strateji karşılaştırma ve kısa yol: oran tablosu.
- Ayna yöntemi: yerdeki aynada ağacın tepesi görünür; geliş = yansıma açısı ⇒ benzer üçgenler. Göz yüksekliği 1,5 m, göz–ayna 2 m, ayna–ağaç 12 m ⇒ ağaç 9 m.
- **Sürpriz:** Nehir genişliği (karşıya geçmeden): kıyıda kazıklarla iki benzer üçgen kurulur; ölçülen 6 m, 4 m, 10 m'den genişlik = 15 m (6/4 = x/10 kurgusu; kurulumu çizimle tutarlı yap ve doğrula).
- Hangi strateji hangi probleme? (gölge: güneşli gün; ayna: ışık yok, düz zemin; kazık: yatay mesafe).
- Özet: benzerlik oranı; verilen–istenen–çizim–oran–kontrol; aynı problemi iki yolla doğrula.

## 9.5.1 — Haritadan Çizgeye (eksen-9-5-1-algoritma)
**Fikir:** Bir problemi algoritmayla çözmenin ilk adımı onu doğru temsile çevirmektir. Königsberg haritası gözümüzün önünde noktalara ve çizgilere (çizge) dönüşür; köprüleri bir kez geçme sorusu, düğümlerin derecelerini sayan basit bir algoritmaya iner.
- **Soğuk açılış:** 1736, Königsberg: 4 kara parçası, 7 köprü. Bir ışık izi her köprüden bir kez geçmeye çalışır, hep bir köprü artar.
- **Sürpriz dönüşüm:** Harita bulanıklaşır, kara parçaları noktaya, köprüler kıvrık çizgilere dönüşür (çizge: düğüm ve ayrıt). Euler'in fikri: bir düğüme girip çıkmak için çift sayıda ayrıt gerekir.
- Algoritma (akış şeması / sözde kod, mono font): her düğümün derecesini say → tek dereceli düğüm sayısı 0 ise döngü, 2 ise yol (o düğümlerden başla), değilse imkânsız. Königsberg: dereceler 5, 3, 3, 3 → 4 tek düğüm → imkânsız.
- Algoritma testi: tablo (girdi çizge, tek düğüm sayısı, çıktı) — el kaldırmadan çizim (zarf şekli: 2 tek düğüm → mümkün, tek düğümden başla).
- Gerçek hayat: çöp kamyonunun her sokaktan bir kez geçmesi (yakıt tasarrufu, temiz çevre).
- Kısa ikinci örnek: tokalaşma problemi (n kişi, n(n−1)/2) ya da ikili arama (1–1000 arası sayı en fazla 10 evet/hayır sorusuyla; 2¹⁰ = 1024) — biri yeter, ikili arama tercih: "algoritma = strateji".
- Algoritma kelimesinin Harizmi'nin adından geldiğine bir cümle.
- Özet: problemi temsil et (çizge/tablo/akış şeması); algoritmayı adım adım yaz; testle kontrol et; dereceler kuralı.

## 9.5.2 — Kapılar (eksen-9-5-2-baglaclar)
**Fikir:** Algoritmanın içindeki mantık bağlaçları kapılardır: VE kapısı ancak iki ışık birden gelirse açılır, VEYA biri yeterse, YA DA tam biri gelirse; İSE bir söz verir. Niceleyiciler döngülerdir: HER tek bir ✗ görünce durur, BAZI tek bir ✓ görünce durur.
- **Soğuk açılış:** 1900 yılı artık yıl mıydı? 4'e bölünüyor... ama hayır! Takvim algoritması kapıdan geçemiyor.
- Artık yıl algoritması: (4'e bölünür ∧ 100'e bölünmez) ∨ 400'e bölünür. Yıllar (2024, 2023, 1900, 2000, 2100) ışık parçacıkları gibi kapı devresine girer; 2000 geçer, 1900 ve 2100 takılır. Akış şeması ↔ sözde kod ↔ sembolik ifade aynı anda.
- Bağlaçlar: ∧ (ve), ∨ (veya — kapsayıcı), ⊻ (ya da — dışlayıcı; "çay ya da kahve"), ⇒ (ise: "yağmur yağarsa yol ıslaktır"; yanlış olduğu tek durum: 1 ⇒ 0). Doğruluk tabloları ışık ızgarası olarak yanar.
- Şifre kuralı örneği: uzunluk ≥ 8 ∧ en az bir rakam ∧ en az bir büyük harf; kural metninde "ve/veya" yanlış okunursa ne olur?
- Niceleyiciler: "Her öğrenci kaydını tamamladı mı?" → döngü, ilk ✗'de dur (∀). "Bazı ürünler stokta yok mu?" → ilk ✓'de dur (∃). Değil alma: ¬(∀x P) ≡ ∃x ¬P.
- **Sürpriz:** Aynı devrede tek bir bağlacı ∧ yerine ∨ yapınca 1900'ün artık yıl çıkması: dilde küçük fark, sonuçta büyük hata.
- Özet: ∧ ∨ ⊻ ⇒; ∀ döngüsü ilk ✗'de durur, ∃ ilk ✓'de; algoritmalar bağlaçlarla karar verir.

## 9.5.3 — Kırkıncı Adım (eksen-9-5-3-niceleyiciler)
**Fikir:** Bir algoritma binlerce örneği kontrol edebilir ama "her" demek için yetmez; tek bir karşıt örnek "her"i yıkar. Mantık bağlaçları ve niceleyiciler, matematik dilini kesin ve yalın yapar.
- **Soğuk açılış:** n² + n + 41. n = 0 → 41 asal, 1 → 43, 2 → 47, 3 → 53 ... algoritma döngüsü sayılar akarken her birine ✓ basar; 39'a kadar 40 asal art arda. "Her n için asal mı?"
- **Sürpriz:** n = 40: 40² + 40 + 41 = 1681 = 41². Kırmızı ✗; döngü durur. "Kırk kez doğru olmak, her zaman doğru olmak değildir."
- Karşı yol: "Her tek sayının karesi tektir." Algoritma 1, 3, 5, ... kontrol eder (sonsuz döngü, bitmez) — cebirsel ispat tek hamlede: n = 2k + 1 ⇒ n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1. ∀ önermesi ispatla, ∃ önermesi (veya ∀'nın değili) tek örnekle kanıtlanır.
- Önermeyi sözel ↔ sembolik ↔ algoritmik dilde yaz: ∀n ∈ ℕ, n tek ⇒ n² tek. Değili: ∃n ∈ ℕ, n tek ∧ n² çift.
- Bağlaçların kesinliği: günlük dildeki "veya"nın belirsizliği vs ∨; "ise"nin yönü (n² tek ⇒ n tek de doğru mu? evet; ama "4'e bölünür ⇒ 2'ye bölünür" tersi yanlış: 6).
- Özet: test ≠ ispat; tek karşıt örnek ∀'yı çürütür; ∃ için bir örnek yeter; sembolik dil yalın ve kesindir.

## 9.6.1 — Aynı Ortalama (eksen-9-6-1-veri-dagilimi)
**Fikir:** Ortalama bir hikâyenin yalnızca merkezidir. Aynı ortalamaya sahip iki dağılım bambaşka davranabilir; nokta grafiği → histogram → kutu grafiği dönüşümü dağılımın şeklini ve yayılımını görünür kılar.
- **Soğuk açılış:** İki otobüs hattı, ikisinde de ortalama bekleme 10 dakika. Hangisine binersin? Veri noktaları yağmur gibi düşer ve iki nokta grafiği oluşur: A hattı 8–12 arası sıkışık, B hattı 1–25 arası dağınık.
- İstatistiksel araştırma döngüsü (kısa, dairesel ikon dizisi): soru → plan (evren, örneklem, rastgelelik) → veri toplama → analiz → yorum.
- Araştırma sorusu örneği: "Okulumuzdaki 9. sınıflar günde kaç dakika ekran başında?" (değişebilirlik: doğal, ölçüm, örneklem).
- Analiz araçları: nokta grafiği → (noktalar sütunlara akar) histogram (sınıf genişliği değişince şekil değişir) → (histogram çeyreklere sıkışır) kutu grafiği: alt uç, Q1, ortanca, Q3, üst uç; çeyrekler açıklığı = Q3 − Q1. Standart sapma kavramsal: ortalamaya tipik uzaklık; teknolojiyle hesaplanır (formül yok). Tepe değer.
- **Sürpriz:** Uç değer etkisi: bir öğrencinin 600 dakikalık değeri eklenince ortalama sıçrar, ortanca kımıldamaz.
- Karar: düzenli olmak isteyen için A hattı (küçük yayılım). Belirsizlik dili: "Örneklemimize göre muhtemelen ...". Verilerin arasını ve ötesini okuma.
- Veri seti örnek (A): 8, 9, 9, 10, 10, 10, 10, 11, 11, 12 (ortalama 10); (B): 1, 3, 5, 6, 9, 11, 14, 15, 16, 20 (ortalama 10) — gerekirse daha büyük, tohumlu üretilmiş ama ortalaması tam 10 olan veri kullan; tüm özetleri doğru hesapla.
- Özet: merkez (ortalama, ortanca, mod) + yayılım (açıklık, çeyrekler açıklığı, standart sapma); grafiği soruya göre seç; uç değer ortalamayı çeker.

## 9.6.2 — Kamerayı Geri Çek (eksen-9-6-2-istatistik-elestiri)
**Fikir:** Başkalarının istatistiksel iddiaları çoğu zaman bir "kadraj"dır. Kamerayı geri çekince (tam eksen, tüm veri, örneklemin kim olduğu) iddianın hatası ya da yanlılığı ortaya çıkar. Her iddia: temellendir → hatayı/yanlılığı bul → kabul et ya da çürüt.
- **Soğuk açılış:** Haber başlığı: "Mahallemizde hız ihlalleri patladı!" Grafikte sütunlar fırlıyor. Kamera geri çekilir: y ekseni 48'den başlıyormuş; gerçek fark %4.
- İddia 1 — kesik eksen: radar verisi (curriculum örneği): ortalama hız 49 → 51 km/s; sınır 50. Tam eksenle aynı veri.
- İddia 2 — uç değerle ortalama: "Bu şirkette ortalama maaş 100 000 TL" (9 çalışan 25 000 TL, 1 yönetici 775 000 TL ⇒ ortalama 100 000; ortanca 25 000). Hangi özet uygun?
- İddia 3 — yanlı örneklem: "Öğrencilerin %90'ı okul saatinin 10:00'da başlamasını istiyor" — anket yalnızca saat 23:00'te açık olan bir oyun sunucusunda yapılmış. Örneklem evreni temsil etmiyor.
- İddia 4 (kabul edilen): Dağılım ve özetler tutarlıysa iddia kabul edilir (çürütmek tek seçenek değil).
- **Sürpriz:** Her iddiada kameranın geri çekilmesi/kadrajın genişlemesi (gerçek bir kamera hareketi).
- Özet: ekseni kontrol et; ortalama mı ortanca mı; örneklem kim; iddiayı veriye dayanarak kabul et ya da çürüt.

## 9.7.1 — Gürültünün Sönmesi (eksen-9-7-1-deneysel-olasilik)
**Fikir:** Deney sayısı arttıkça göreli sıklıkların zikzakları söner ve bir değere yerleşir. Az denemede gürültü, çok denemede şekil.
- **Soğuk açılış:** İki zar atılır, toplam yazılır. 10 atış: çubuk grafik karmakarışık. 100: bir şekil seziliyor. 10 000 atış: kusursuz bir üçgen (piramit) doğar. Zarlar ekranda ışık parçacıklarına dönüşüp sütunlara yağar.
- Kayıt: çetele → sıklık tablosu → göreli sıklık (sıklık / deneme sayısı). Sıklık dağılımı vs göreli sıklık dağılımı (yükseklikler toplamı 1).
- Tek olay izlemesi: "toplam 7" göreli sıklığı vs deneme sayısı grafiği: başta sıçrar, giderek 0,167 civarına yerleşir. Birkaç farklı simülasyon (farklı tohum) üst üste: hepsi aynı değere doğru daralan bir huni.
- 25, 50, 100, 150, 200 (sınıf grupları) → 500, 1000, 1500 (simülasyon) aşamaları.
- Büyük sayılar yasası (formülsüz, sözel).
- **Sürpriz:** Huni görseli: farklı denemelerin eğrileri dar bir kanala sıkışır.
- Deneyler tamamen tohumlu (E.rng) ve t'den türetilmiş; n. atışa kadar sonuçlar her karede aynı biçimde yeniden üretilir (önceden hesaplanmış dizi önbelleği serbest).
- Özet: göreli sıklık = olay sayısı / deneme sayısı; deneme arttıkça değişkenlik azalır; deneysel olasılık bir değere yaklaşır.

## 9.7.2 — Yedinin Köşegeni (eksen-9-7-2-teorik-olasilik)
**Fikir:** İki zarın 36 eş olasılıklı sonucu bir 6×6 ızgaradır. Toplam 7 en uzun köşegendir: 6/36. Teorik olasılık, örnek uzayı görünür kılmaktır; deney uzun vadede bu köşegene yaklaşır.
- **Soğuk açılış:** Tavla masası: "Neden en çok 7 gelir?" Zar yüzleri ızgaraya dizilir; köşegenler renk renk yanar, 7'nin köşegeni en uzunu.
- Temsiller: sistematik liste, tablo (6×6), ağaç şeması (üç para: 8 yaprak; HHH ... TTT). Kindi'nin ağaç gösterimine bir cümlelik değinme.
- Hesaplar: P(toplam 7) = 6/36 = 1/6; P(toplam 2) = 1/36; üç parada P(tam 2 tura) = 3/8.
- Ayrık olaylar: A = toplam 7, B = toplam 11 → P(A ∪ B) = 6/36 + 2/36 = 8/36. Ayrık olmayan: A = çift sayı gelmesi (çark), B = asal sayı → 2 ikisinde de; P(A ∪ B) = P(A) + P(B) − P(A ∩ B) (iki kez sayılan hücre parlar ve biri söner). İki zarda "en az biri 6" ile "toplam ≥ 10" gibi örnekle de gösterilebilir (hesabı doğrula).
- **Sürpriz:** Simülasyon: deneysel göreli sıklık çubukları teorik basamakların (1,2,...,6,...,1)/36 hayaletine doğru yükselir ve oturur.
- Koşullu olasılık yok (müfredat dışı).
- Özet: P(A) = olaya ait çıktı / tüm çıktılar (eş olasılıklı); ∪ formülü; ayrık olaylarda kesişim boş; deney sayısı arttıkça deneysel → teorik.
