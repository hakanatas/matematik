/* Üçgenin İçindeki Üçgenler — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.5, son: 3.7, tr: 'Bir dik üçgen. Dik açıdan hipotenüse bir yükseklik indir.', en: 'A right triangle. Drop an altitude from the right angle to the hypotenuse.', not: 'Sakin başlayın; yükseklik inerken kısa bir es.' },
  { bas: 3.9, son: 7.4, tr: 'Çıkan iki parça döner, büyür… ve büyük üçgenin üstüne tam oturur.', en: 'The two pieces turn, grow… and fit exactly onto the big triangle.', not: '"Tam oturur" anında durun; sınıfa "Bu ne demek?" diye sorun (benzerlik).' },
  { bas: 7.6, son: 11.2, tr: 'Parçayı yine böl. Ve yine. Her biri aynı üçgenin küçük kopyası.', en: 'Split a piece again. And again. Each is a small copy of the same triangle.', not: 'Ritmi hızlandırın; Matruşka bebeği benzetmesini kullanabilirsiniz.' },

  { bas: 19.0, son: 22.6, tr: 'Bir üçgene benzer üçgeni nasıl üretiriz? Önce elimizdekilere bakalım.', en: 'How do we make a triangle similar to a given one? First, what do we already know?', not: 'Yansıtma tonu: geçen dersin benzerlik koşullarını öğrencilere saydırın.' },
  { bas: 22.8, son: 26.5, tr: 'AA, KKK, KAK. Çizimle en kolayı: iki açıyı korumak.', en: 'AA, SSS, SAS. The easiest to draw: keep two angles.', not: 'Neden AA? Cetvelle oran ölçmek yerine açıyı korumak kolay.' },

  { bas: 27.0, son: 30.8, tr: 'Bir kenara paralel bir doğru çiz.', en: 'Draw a line parallel to one side.', not: 'Paralellik işaretlerini gösterin.' },
  { bas: 31.0, son: 35.0, tr: 'Yöndeş açılar eşit: küçük üçgen büyüğe benzer. AA.', en: 'Corresponding angles are equal: the small triangle is similar to the big one. AA.', not: 'Renkli açı yaylarını eşleştirin: turkuaz ile turkuaz, mercan ile mercan.' },
  { bas: 35.2, son: 39.0, tr: 'Doğruyu kaydır: oran değişir, şekil değişmez.', en: 'Slide the line: the ratio changes, the shape does not.', not: 'k değerini sesli okuyun. Öğrencilere k = 1 olunca ne olur diye sorun.' },
  { bas: 39.2, son: 42.4, tr: 'Üçgenin dışına çıksan da benzerlik bozulmaz.', en: 'Even outside the triangle, similarity holds.', not: 'Kenarların uzantılarını vurgulayın; k > 1.' },
  { bas: 42.6, son: 45.7, tr: 'Tepenin öbür yanında ters dönmüş bir benzer üçgen: kelebek.', en: 'Beyond the vertex: an upside-down similar triangle, the butterfly.', not: 'Ters açılar ve iç ters açılar. Şeklin kelebeğe benzediğini gösterin.' },

  { bas: 46.1, son: 50.0, tr: 'Peki doğru paralel olmasa? Açılar tutmaz: 80° ile 68°.', en: 'What if the line is not parallel? The angles disagree: 80° versus 68°.', not: 'Karşı örnek. Tahmin ettirin, sonra ölçümü gösterin.' },
  { bas: 50.2, son: 54.5, tr: 'Oranlar da tutmaz: 0,5 ile 0,7. Paralel olunca yine benzer.', en: 'Nor do the ratios: 0.5 versus 0.7. Make it parallel again: similar again.', not: 'Hangi çizim neden işe yaradı? Paralellik açıları korur.' },

  { bas: 55.0, son: 58.8, tr: 'İkinci çizim: dik üçgende dik açıdan hipotenüse yükseklik.', en: 'The second construction: in a right triangle, the altitude to the hypotenuse.', not: 'Program bu çizime özellikle dikkat çeker; yavaşlayın.' },
  { bas: 59.0, son: 63.0, tr: 'Açı renklerine bak: her parçada aynı üç açı var.', en: 'Look at the angle colours: every piece has the same three angles.', not: 'A köşesindeki açının ikiye bölündüğünü, parçaların B ve C ile eşleştiğini gösterin.' },
  { bas: 63.2, son: 67.4, tr: 'Döndürüp yan yana koyunca: üç benzer üçgen.', en: 'Rotate them and line them up: three similar triangles.', not: 'Dönüşüm sırasında açı renklerini takip ettirin.' },
  { bas: 67.6, son: 71.6, tr: 'Kenarlar 3-4-5’in 0,6, 0,8 ve 1 katı.', en: 'The sides are 0.6, 0.8 and 1 times 3-4-5.', not: 'Kenar uzunluklarını tahtaya tablo olarak yazdırın.' },
  { bas: 71.8, son: 74.6, tr: 'Bu oranlar Öklid ve Pisagor’un kapısını açacak.', en: 'These ratios will open the door to Euclid and Pythagoras.', not: 'Bir sonraki konuya merak bırakın.' },

  { bas: 75.1, son: 78.6, tr: 'Küçük parçaya yine yükseklik indir. Sonra yine…', en: 'Drop an altitude in the smaller piece. Then again…', not: 'Sesi alçaltın; kamera içeri dalıyor.' },
  { bas: 78.8, son: 83.0, tr: 'Her iki adımda şekil 0,48 katına küçülür ve çeyrek tur döner.', en: 'Every two steps the shape shrinks to 0.48 times and turns a quarter turn.', not: '0,8 · 0,6 = 0,48 çarpımını gösterin.' },
  { bas: 83.2, son: 87.0, tr: 'On adımda boyut %2,5’e iner; şekil yine aynı.', en: 'After ten steps the size is down to 2.5%; the shape is still the same.', not: '0,48 üzeri 5 yaklaşık 0,025. Hesap makinesiyle doğrulatın.' },
  { bas: 87.2, son: 89.6, tr: 'Sonsuza kadar sürer: üçgenin içinde üçgenler.', en: 'It never ends: triangles within a triangle.', not: 'Filmin adına bağlayın; kısa bir es.' },

  { bas: 90.0, son: 93.9, tr: 'Bir çatı makası: açıklık 8 m, yükseklik 3 m.', en: 'A roof truss: span 8 m, height 3 m.', not: 'Gerçek hayat problemi; verilenleri ayırt ettirin.' },
  { bas: 94.1, son: 97.6, tr: 'Tabandan 1,2 m yukarıdaki yatay kiriş kaç metre?', en: 'How long is the horizontal beam 1.2 m above the base?', not: 'İsteneni belirleyin; öğrencilerden çizim önerisi isteyin.' },
  { bas: 97.8, son: 101.0, tr: 'Kiriş tabana paralel: x/8 = 1,8/3, yani x = 4,8 m.', en: 'The beam is parallel to the base: x/8 = 1.8/3, so x = 4.8 m.', not: 'Kontrol adımını vurgulayın: 4,8 : 8 = 0,6.' },

  { bas: 101.6, son: 106.3, tr: 'Aklında kalsın: bir kenara paralel çiz, benzer üçgen doğar.', en: 'Remember: draw a line parallel to a side, and a similar triangle is born.', not: 'Özet maddelerini tek tek okuyun.' },
  { bas: 106.5, son: 111.1, tr: 'Dik üçgende hipotenüse yükseklik: üç benzer üçgen.', en: 'In a right triangle, the altitude to the hypotenuse: three similar triangles.', not: 'Hangi çizimin hangi koşulu (AA) kullandığını sorun.' },
  { bas: 111.7, son: 117.4, tr: 'Şimdi sıra sende: paraleli laboratuvarda kendin kaydır.', en: 'Your turn: slide the parallel yourself in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
