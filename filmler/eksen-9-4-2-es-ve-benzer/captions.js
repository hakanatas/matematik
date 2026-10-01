/* Üçgeni Kilitlemek — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.5, son: 3.9, tr: 'Bir kenar verdim. Kaç üçgen çizebilirsin?', en: 'I gave you one side. How many triangles can you draw?', not: 'Alçak sesle, merak uyandırarak başlayın. Hayalet üçgenler titreşirken kısa bir es verin.' },
  { bas: 4.1, son: 7.7, tr: 'İkinci kenar da belli. Üçgen hâlâ menteşe gibi açılıp kapanıyor.', en: 'The second side is fixed too. The triangle still swings like a hinge.', not: '"Menteşe" sözcüğünde üçgenin açılıp kapanmasını gösterin. Sınıfa: "Neden hâlâ sonsuz?"' },
  { bas: 7.9, son: 10.6, tr: 'Bir üçgeni kilitlemek için kaç bilgi yeter?', en: 'How much information locks a triangle in place?', not: 'Filmin sorusu bu. Yavaş okuyun, öğrencilerden tahmin isteyin (varsayım).' },

  { bas: 18.6, son: 22.3, tr: 'Üç çubuk: 6, 5 ve 4 birim. Uçlarından birleştirelim.', en: 'Three rods: 6, 5 and 4 units. Let’s join them at the ends.', not: 'Geometri tahtası ya da çubuklarla sınıfta da yapılabilir; bunu hatırlatın.' },
  { bas: 22.5, son: 26.3, tr: 'Her çubuk kendi ucunda döner ve bir yay çizer.', en: 'Each rod swings about its end and traces an arc.', not: 'Pergelle çizim: yay, çubuğun ucunun gidebileceği tüm yerlerdir.' },
  { bas: 26.5, son: 30.0, tr: 'Yaylar tek noktada buluşur. Alttaki ise aynı üçgenin yansıması.', en: 'The arcs meet at one point. The lower one is just its reflection.', not: 'Alttaki kesişimin yeni bir üçgen olmadığını vurgulayın: AB’ye göre yansıma (9.4.1).' },
  { bas: 30.2, son: 33.4, tr: 'Başka yerde bir kopya: döndür, çevir, kaydır…', en: 'A copy somewhere else: rotate it, flip it, slide it…', not: 'Dönüşümleri sayarken hareketi takip edin; ritmi hızlandırın.' },
  { bas: 33.6, son: 36.3, tr: '…tam üstüne oturur. Üç kenar eşitse üçgenler eştir: KKK.', en: '…and it fits exactly. Equal three sides mean congruent triangles: SSS.', not: 'Eşliğin tanımı: dönüşümlerle üst üste getirilebilmek. "KKK" yi tahtaya yazın.' },

  { bas: 36.7, son: 40.5, tr: 'İki kenar verip aradaki açıyı serbest bırakırsan üçgen sallanır.', en: 'Give two sides but leave the angle between them free, and it wobbles.', not: 'Açılıştaki menteşeye geri bağlayın.' },
  { bas: 40.7, son: 44.6, tr: 'Açıyı 50°’de kilitle: üçüncü kenar kendiliğinden belirlenir. KAK.', en: 'Lock that angle at 50°: the third side decides itself. SAS.', not: 'Kilit sesi gibi kısa bir es. "Kendiliğinden" sözcüğünü vurgulayın.' },
  { bas: 44.8, son: 48.8, tr: 'Ya da bir kenar ve iki ucundaki açı: ışınlar tek noktada kesişir.', en: 'Or one side and the angles at both ends: the rays cross at one point.', not: 'İki ışının yalnızca bir kez kesişebileceğini sorun: neden?' },
  { bas: 49.0, son: 53.2, tr: 'Üçüncü açı zaten 180° − 40° − 65° = 75°. Bu da AKA.', en: 'The third angle is already 180° − 40° − 65° = 75°. That is ASA.', not: 'İç açılar toplamı (9.3.1) ile bağ kurun.' },

  { bas: 53.6, son: 56.2, tr: 'Peki açı iki kenarın arasında değilse?', en: 'But what if the angle is not between the two sides?', not: 'Tonu değiştirin: bir tuzak geliyor. Öğrencilere tahmin ettirin: yine tek üçgen mi?' },
  { bas: 56.4, son: 59.6, tr: '30°, 6 ve 4. Pergel yayı doğruyu iki noktada keser.', en: '30°, 6 and 4. The compass arc cuts the line at two points.', not: 'Yay doğruyu ilk kestiğinde durun, ikinci kesişimi sınıf görsün.' },
  { bas: 59.8, son: 63.8, tr: 'Aynı üç bilgi, iki farklı üçgen. KKA eşliği garanti etmez.', en: 'Same three facts, two different triangles. SSA does not guarantee congruence.', not: 'Varsayım ile genellemeyi karşılaştırma anı: "Her üç bilgi yeter" varsayımı çürüdü.' },
  { bas: 64.5, son: 67.6, tr: 'Üç açı eşit olsa? Boyutları farklı üçgenler çıkar.', en: 'What if all three angles match? You get triangles of different sizes.', not: 'Program sorusunu sorun: Açıları eşit üçgenler eş midir?' },
  { bas: 67.8, son: 70.3, tr: 'AAA eşlik değil. Kilitlenen şey: şekil.', en: 'AAA is not congruence. What gets locked is the shape.', not: '"Şekil" sözcüğünü vurgulayıp benzerliğe geçin.' },

  { bas: 70.7, son: 74.4, tr: 'İki açıyı sabitle: üçüncüsü 180°’den gelir, şekil kilitlenir.', en: 'Fix two angles: the third follows from 180°, and the shape is locked.', not: 'AA benzerliği. Neden üç açı değil de iki açı yeter, sorun.' },
  { bas: 74.6, son: 77.0, tr: 'Hayaletler artık aynı şeklin büyütülmüş kopyaları.', en: 'The ghosts are now scaled copies of one shape.', not: 'Açılıştaki hayalet aileyle karşılaştırın: şimdi hepsi aynı şekil.' },
  { bas: 77.4, son: 81.4, tr: '3-4-5 ve 6-8-10: her kenar tam 2 katı. Benzerlik oranı k = 2.', en: '3-4-5 and 6-8-10: every side exactly doubles. Similarity ratio k = 2.', not: 'Oranları sesli okuyun: altı bölü üç, sekiz bölü dört, on bölü beş.' },
  { bas: 81.6, son: 84.0, tr: 'Kenarların hepsi orantılıysa üçgenler benzerdir.', en: 'If all sides are in proportion, the triangles are similar.', not: 'KKK benzerliği: eşlikteki KKK ile farkını sorun.' },
  { bas: 84.2, son: 87.2, tr: 'İki kenar orantılı, aradaki açı eşit: yine benzer.', en: 'Two sides in proportion, equal angle between them: similar again.', not: 'KAK benzerliği. Eşlik koşullarıyla yan yana yazdırın.' },
  { bas: 87.4, son: 90.1, tr: 'k = 1 olduğunda benzerlik eşliğe dönüşür.', en: 'When k = 1, similarity becomes congruence.', not: 'Büyük üçgen küçülüp oturduğunda kısa bir es. Önemli genelleme.' },

  { bas: 90.5, son: 94.6, tr: 'Fotoğrafı iki parmakla büyüttüğünde açılar değişmez: benzerlik.', en: 'Pinch to zoom a photo and the angles stay the same: similarity.', not: 'Öğrencilere telefonlarında denemelerini önerin; harita ölçeğini de sorun.' },
  { bas: 94.8, son: 99.9, tr: 'Tek bir üçgeni döndürüp tekrarlayınca eş üçgenlerden bir süsleme doğar.', en: 'Rotate and repeat one triangle, and a pattern of congruent triangles appears.', not: 'Süsleme sanatına değinin; performans görevi fikri olarak verilebilir.' },

  { bas: 100.5, son: 105.2, tr: 'Aklında kalsın: KKK, KAK, AKA tek üçgene kilitler.', en: 'Remember: SSS, SAS and ASA lock a single triangle.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 105.4, son: 110.2, tr: 'AA yalnızca şekli kilitler; eşlik, oranı 1 olan benzerliktir.', en: 'AA locks only the shape; congruence is similarity with ratio 1.', not: 'KKA tuzağını bir kez daha hatırlatın.' },
  { bas: 110.8, son: 116.6, tr: 'Şimdi sıra sende: üçgeni laboratuvarda kendin kilitle.', en: 'Your turn: lock a triangle yourself in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
