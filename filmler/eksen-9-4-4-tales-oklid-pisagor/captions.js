/* Kaybolmayan Alan — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.5, son: 3.4, tr: '3-4-5 dik üçgeninin kenarlarına kareler kur.', en: 'Build squares on the sides of a 3-4-5 right triangle.', not: 'Sakin başlayın; ortaokuldan tanıdık bir görüntü olduğunu hatırlatın.' },
  { bas: 3.6, son: 7.4, tr: 'Küçük karelerin 9 + 16 birimi tek tek büyük kareye akar…', en: 'The 9 + 16 unit cells of the small squares flow into the big one…', not: 'Sayacı birlikte sayın; ritim hızlanıyor.' },
  { bas: 7.6, son: 11.1, tr: '…ve 25’lik kareyi tam doldurur. Peki her dik üçgende mi?', en: '…and fill the 25-square exactly. But does it work for every right triangle?', not: 'Asıl soru: bir örnek ispat değildir. Kısa bir es verin.' },

  { bas: 19.0, son: 22.6, tr: 'Paralel üç doğru, iki keseni keser.', en: 'Three parallel lines cut two transversals.', not: 'Jaluzi şeritleri ya da güneş ışınları benzetmesini kullanın.' },
  { bas: 22.8, son: 26.6, tr: 'Parçalar orantılı: 3 / 4,5 = 2,5 / 3,75.', en: 'The pieces are in proportion: 3 / 4.5 = 2.5 / 3.75.', not: 'Oranları sesli hesaplatın: ikisi de üçte iki.' },
  { bas: 26.8, son: 29.6, tr: 'Keseni döndür: oran yine üçte iki.', en: 'Turn the transversal: the ratio is still two thirds.', not: 'Uzunluklar değişiyor, oran değişmiyor; vurgulayın.' },
  { bas: 29.8, son: 33.2, tr: 'İspat: keseni A’dan geçecek şekilde paralel kaydır.', en: 'Proof: slide the transversal parallel to itself until it passes through A.', not: 'İspat dili: "Neden bu çizimi yaptık?" diye sorun (9.4.3).' },
  { bas: 33.4, son: 36.4, tr: 'İçte benzer üçgenler, yanda paralelkenarlar oluşur.', en: 'Similar triangles appear inside, parallelograms beside them.', not: 'Paralelkenarın karşı kenarları eşit: AE′ = DE.' },
  { bas: 36.5, son: 38.9, tr: 'Böylece oran korunur: Tales teoremi.', en: 'So the ratio is preserved: Thales’ theorem.', not: 'Sonucu tahtaya yazdırın.' },

  { bas: 39.1, son: 42.0, tr: 'Dik üçgende hipotenüse yükseklik: p ve k parçaları.', en: 'In a right triangle, the altitude splits the hypotenuse into p and k.', not: 'Harfleri renkleriyle tanıtın: h limon, p gök, k menekşe.' },
  { bas: 42.2, son: 46.4, tr: 'İki küçük üçgen benzer: h/p = k/h, yani h² = p · k.', en: 'The two small triangles are similar: h/p = k/h, so h² = p · k.', not: 'İçler dışlar çarpımını adım adım gösterin; 2,4² = 5,76.' },
  { bas: 46.6, son: 51.4, tr: 'Küçük ile büyük üçgen: c/a = p/c, yani c² = p · a.', en: 'Small and big triangle: c/a = p/c, so c² = p · a.', not: 'Hangi açıların ortak olduğunu sorun (AA).' },
  { bas: 51.6, son: 56.4, tr: 'Öbür parça ile büyük üçgen: b/a = k/b, yani b² = k · a.', en: 'The other piece and the big triangle: b/a = k/b, so b² = k · a.', not: 'Sayısal kontrol: 16 = 3,2 · 5.' },
  { bas: 56.6, son: 58.8, tr: 'Üç bağıntı, tek fikir: benzerlik.', en: 'Three relations, one idea: similarity.', not: 'Öklid bağıntılarını bir tabloya topladırın.' },

  { bas: 59.1, son: 62.0, tr: 'Şimdi c² ve b² karelerini hipotenüs karesine taşıyalım.', en: 'Now let’s move the squares c² and b² into the square on the hypotenuse.', not: 'Filmin sürpriz anı başlıyor; sesi alçaltın.' },
  { bas: 62.2, son: 66.2, tr: 'Kare kenarı boyunca kayar: taban aynı, yükseklik aynı, alan aynı.', en: 'The square slides along its side: same base, same height, same area.', not: 'Alan sayısının hiç değişmediğine dikkat çekin: 9.' },
  { bas: 66.4, son: 69.4, tr: 'Bir kesme ve bir kaydırma daha: c², p × a dikdörtgeni olur.', en: 'One more shear and a slide: c² becomes the p × a rectangle.', not: 'Öklid’in c² = p · a bağıntısını burada görüyoruz.' },
  { bas: 69.6, son: 74.6, tr: 'b² de aynı yoldan geçer ve k × a dikdörtgenine dönüşür.', en: 'b² takes the same path and becomes the k × a rectangle.', not: 'Ritmi koruyun; 16 yerine oturduğunda durun.' },
  { bas: 74.8, son: 77.6, tr: 'Hiç alan kaybolmadı: a² = b² + c².', en: 'No area was lost: a² = b² + c².', not: 'Filmin adını burada söyleyin: kaybolmayan alan.' },
  { bas: 77.8, son: 82.6, tr: 'Cebirle de aynı: c² + b² = a(p + k) = a · a.', en: 'Algebra agrees: c² + b² = a(p + k) = a · a.', not: 'İki farklı ispat: alanla ve Öklid bağıntılarıyla. Karşılaştırın.' },

  { bas: 83.1, son: 86.9, tr: 'Peki açı 90° değilse? Kenarlar 3 ve 4, açı açılıyor.', en: 'And if the angle is not 90°? Sides 3 and 4, the angle opens.', not: 'Teoremi yeni bir duruma uyarlıyoruz; tahmin isteyin.' },
  { bas: 87.1, son: 91.4, tr: 'Geniş açıda karşı kenarın karesi büyür: a² > b² + c².', en: 'With an obtuse angle the opposite square grows: a² > b² + c².', not: 'Çubuğun 25 çizgisini aştığını gösterin.' },
  { bas: 91.6, son: 96.4, tr: 'Dar açıda küçülür: a² < b² + c². Eşitlik yalnızca dik açıda.', en: 'With an acute angle it shrinks: a² < b² + c². Equality only at a right angle.', not: 'Programdaki örnek önerme: geniş açının karşısındaki kenar.' },

  { bas: 97.1, son: 101.9, tr: 'Aklında kalsın: paraleller orantıyı, benzerlik Öklid’i taşır.', en: 'Remember: parallels carry proportion, similarity carries Euclid.', not: 'Özet maddelerini tek tek okuyun.' },
  { bas: 102.1, son: 106.9, tr: 'Ve alan kaybolmaz: a² = b² + c².', en: 'And area never disappears: a² = b² + c².', not: 'Geniş ve dar açı sonucunu da hatırlatın.' },
  { bas: 107.4, son: 113.1, tr: 'Şimdi sıra sende: laboratuvarda yüksekliği kendin sürükle.', en: 'Your turn: drag the altitude yourself in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
