# 9. Sınıf Matematik Filmleri — seri özeti

Ben Hakan Ataş (GitHub: hakanatas), matematik ve bilişim öğretmeniyim. Daha önce ortaokul matematik için "Nokta'nın Filmleri" serisini yaptık: her öğrenme çıktısı için JavaScript ile prosedürel üretilen kısa animasyonlar (https://hakanatas.github.io/nokta-filmleri). Şimdi aynı üretim düzeniyle, lise 9. sınıf matematik için yeni bir seri istiyorum.

## Hedef kitle ve ton
- Lise öğrencileri: ortaokul serisindeki sevimli, sade dili tekrar etme. Daha olgun, sinematik, "vay be" dedirten bir anlatım istiyorum: güçlü açılış, kamera hareketi, ritim, sürpriz bir görsel dönüşüm.
- Matematik süs değil, gösterinin kendisi olsun: kavramı en çarpıcı biçimde gösteren tek bir görsel fikir bul ve filmi onun etrafında kur.
- Tek fikir, kısa cümleler, gerçek hayattan ya da lise öğrencisinin dünyasından örnekler; sonda kısa bir "aklında kalsın" özeti.

## İçerik
- Kaynak: MEB Türkiye Yüzyılı Maarif Modeli, ortaöğretim matematik öğretim programı (https://tymm.meb.gov.tr). 9. sınıfın temalarını, öğrenme çıktılarını ve alt maddelerini oradan birebir al; özetleme, uydurma.
- Her öğrenme çıktısı için bir film, müfredat sırasıyla.

## Yapı: 2B iskelet, gerektiği yerde 3B
- Ana seri sinematik 2B video: derinlik katmanları, ışık, kamera hareketi, akıcı geçişler. Nokta serisinin krem kâğıt, siyah mürekkep ve amber vurgu estetiğini tekrar etme; Polen serisindeki voxel görünümünü de tekrar etme.
- 3B yalnızca kavrama gerçekten değer kattığında kullanılsın: uzay geometrisi, dönüşümler, bir yüzeyin ya da cismin farklı açılardan görülmesi gibi. Gerekirse videonun bir sahnesi 3B olabilir (Three.js/WebGL), ama görsel dil 2B sahnelerle aynı palet ve ışıkla tutarlı kalsın.
- Her temaya bir etkileşimli "laboratuvar" sayfası: öğrencinin bir parametreyi kaydırıp, bir şekli sürükleyip ya da bir deneyi binlerce kez çalıştırıp sonucu anında gördüğü tek bir sayfa. Uygunsa 3B olabilir. Bu bir gezinti dünyası değil, kavramı elle denemek için bir araç olsun. Videolar ilgili laboratuvara bağlantı versin.
- Kendine özgü, tutarlı bir palet (token olarak tanımlı), karakterli ve Türkçe karakterleri tam destekleyen bir font (Inter, Roboto, Arial gibi jenerik fontlar olmasın).
- Bir rehber karakter kullanılacaksa özgün olsun, bilinen hiçbir maskota benzemesin, lise öğrencisine çocuksu gelmesin. Karaktersiz, yalnızca kamera ve nesnelerle anlatım da bir seçenek.

## Teknik düzen
- Her film tek HTML sayfası ve saf JavaScript. Her kare renderFrame(t) ile zamanın saf fonksiyonu, rastgelelik tohumlu; ekran kaydı yok. 3B sahnelerde de animasyon requestAnimationFrame'e değil t'ye bağlı olsun, böylece dışa aktarım kare kare ve her seferinde aynı çıksın.
- Süre yaklaşık 90–120 sn; 16:9 ve 9:16 düzen.
- Altyazılar Türkçe, İngilizce ya da ikisi birlikte seçilebilsin; captions.js'de öğretmen için seslendirme notları olsun.
- Playwright ile kare kare MP4 (yatay ve dikey) ve SRT dışa aktarımı.
- Her film ayrı bir GitHub deposu ve GitHub Pages sayfası. README'de TR özet, birebir öğrenme çıktısı, sahne tablosu ve çalıştırma bilgisi olsun; PROMPT.md verilen istemi birebir içersin. v1.0 sürümünde 6 dosya: yatay ve dikey 720p MP4, TR SRT, EN SRT, iki dilli SRT, seslendirme notları.
- Laboratuvarlar da ayrı depo ve Pages sayfası olsun; telefonda ve okul bilgisayarlarında akıcı çalışsın.
- Bütün filmleri ve laboratuvarları toplayan bir hub sayfası (ayrı depo).
- Lisans: CC BY-NC 4.0 (atıf zorunlu, ticari olmayan kullanım). README'de iki dilli lisans bölümü ve hazır atıf metni olsun.

## Yayınlama (öğrendiklerimiz)
- Yükleme Chrome ile değil, Mac'imdeki gh ile yapılsın (kurulu ve girişli). Sen depoları ve bir betiği bağlı klasöre koy, ben Terminal'de tek komutla çalıştırayım. Betikler tekrar çalıştırılabilir olsun, biten işleri atlasın.
- MP4 üretimi Mac'te yapılsın: Playwright yüklü Google Chrome'u channel: 'chrome' ile kullansın (kendi Chromium indirmesi Mac'imde takılıyor), ffmpeg -nostdin ile çalışsın, komut caffeinate -dis ile başlasın. 3B sahne içeren ilk filmde başsız Chrome'da WebGL'in çalıştığını test et.
- Her filmde yatay ve dikey önizleme karelerini üret ve kendin bak: üst üste binen yazı, kenardan taşan metin, okunmayan küçük yazı kalmasın.
