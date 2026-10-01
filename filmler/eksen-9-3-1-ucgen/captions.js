/* 180’in Sırrı — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 3.3, tr: 'Kuzey Kutbu’ndan yola çık, dümdüz güneye, ekvatora in.', en: 'Start at the North Pole and walk straight south to the equator.', not: 'Sakin, gizemli bir tonla başlayın; ışık noktası kutuptan inerken konuşun.' },
  { bas: 3.4, son: 6.3, tr: 'Sola dön. Ekvator boyunca dünyanın çeyreği kadar yürü.', en: 'Turn left. Walk a quarter of the way around the equator.', not: '"Dön" sözcüğünde kısa bir es; ilk 90° etiketi beliriyor.' },
  { bas: 6.4, son: 8.9, tr: 'Bir kez daha dön ve kutba geri çık.', en: 'Turn once more and climb back to the pole.', not: 'Ritmi koruyun; üçüncü kenar kapanırken sesi hafifçe yükseltin.' },
  { bas: 9.0, son: 11.6, tr: 'Üç dik açı: 90 + 90 + 90 = 270. Nasıl yani?', en: 'Three right angles: 90 + 90 + 90 = 270. How is that possible?', not: 'Soru işaretinde durun. Sınıfa sorun: "Üçgenin açıları 180 değil miydi?"' },
  { bas: 11.7, son: 14.4, tr: 'Bunu sona saklayalım. Önce düzleme bakalım.', en: 'Let’s save that for the end. First, the flat plane.', not: 'Merak uyandırın; cevabı vermeyin.' },

  { bas: 19.8, son: 23.4, tr: 'Ortaokuldan biliyorsun: üçgenin iç açıları toplamı 180°.', en: 'You know it from middle school: a triangle’s angles add up to 180°.', not: 'Bildik bir bilgiyle başlayın; sınıfın onayını alın.' },
  { bas: 23.5, son: 27.0, tr: 'Köşeleri oynat, yeniden ölç. Toplam yine 180.', en: 'Move the corners and measure again. Still 180.', not: 'Köşeler kayarken sayıların değiştiğini ama toplamın sabit kaldığını gösterin.' },
  { bas: 27.1, son: 30.0, tr: 'Ama ölçmek ispat değildir. Her üçgen için neden?', en: 'But measuring is not proving. Why is it true for every triangle?', not: 'Önemli bir es: "Sonsuz üçgeni tek tek ölçebilir miyiz?"' },
  { bas: 30.1, son: 33.4, tr: 'C’den AB’ye paralel bir doğru çiz. Yalnızca bir tane çizilebilir.', en: 'Draw a line through C parallel to AB. Only one such line exists.', not: '"Yalnızca bir tane" vurgusu ispatın dayanağı; altını çizin.' },
  { bas: 33.5, son: 36.8, tr: 'İç ters açılar eşittir: α ve β, C’nin yanına taşınır.', en: 'Alternate angles are equal: α and β move next to C.', not: 'Kamalar yarım tur dönerken "Z" biçimini parmakla gösterin.' },
  { bas: 36.9, son: 40.0, tr: 'Üç açı yan yana: bir doğru açısı. α + β + γ = 180°.', en: 'Three angles side by side: a straight angle. α + β + γ = 180°.', not: 'Işık parladığında kısa bir es; formülü yavaş okuyun.' },
  { bas: 40.1, son: 43.6, tr: 'Dayanağı: bir noktadan tek paralel geçer. Öklid’in 5. postulatı.', en: 'Its foundation: only one parallel passes through a point. Euclid’s 5th postulate.', not: 'Bu cümle filmin sonundaki sürprize zemin hazırlıyor; aklınızda tutun.' },

  { bas: 43.7, son: 47.6, tr: 'Bir kenarı uzat: dış açı doğar. İçine α ve β tam sığar.', en: 'Extend a side: an exterior angle appears. α and β fit inside it exactly.', not: 'β kayarak, α dönerek yerleşiyor; iki hareketi ayrı ayrı gösterin.' },
  { bas: 47.7, son: 51.0, tr: 'Dış açı, komşu olmayan iki iç açının toplamıdır.', en: 'An exterior angle equals the sum of the two non-adjacent interior angles.', not: 'İkinci ispat yolunu sordurun: 180 − γ.' },
  { bas: 51.1, son: 55.0, tr: 'Şimdi üçgenin çevresinde yürü. Her köşede biraz dön.', en: 'Now walk around the triangle. Turn a little at every corner.', not: 'Ok döndükçe sayaçtaki dönüşleri sesli toplayın.' },
  { bas: 55.1, son: 59.6, tr: 'Üçgeni küçült: dönüşler tek noktada tam bir tur olur. 360°.', en: 'Shrink the triangle: the turns meet at one point as a full turn. 360°.', not: '"Vay be" anı: dilimler birleşip tam daire olduğunda durun.' },

  { bas: 60.1, son: 63.6, tr: 'Bir açıyı menteşe gibi aç. Karşısındaki kenara bak.', en: 'Open an angle like a hinge. Watch the side across from it.', not: 'Kapı menteşesi benzetmesini kullanabilirsiniz.' },
  { bas: 63.7, son: 66.8, tr: 'Açı büyüdükçe karşı kenar uzar.', en: 'As the angle grows, the opposite side gets longer.', not: 'Önce varsayım: "Ters yönde de doğru mu?" diye sorun.' },
  { bas: 66.9, son: 70.2, tr: 'Kenarları 4, 6 ve 8 olan üçgende açıları sırala.', en: 'In a triangle with sides 4, 6 and 8, rank the angles.', not: 'Renk eşleşmelerine dikkat çekin: her kenar, karşı açısıyla aynı renk.' },
  { bas: 70.3, son: 73.6, tr: 'En uzun kenarın karşısında en büyük açı durur.', en: 'The largest angle sits opposite the longest side.', not: 'Önermeyi öğrencilere kendi cümleleriyle söyletin.' },

  { bas: 73.8, son: 77.0, tr: 'Uzunlukları 3, 4 ve 8 olan üç çubuk. Üçgen kurabilir misin?', en: 'Three rods of length 3, 4 and 8. Can you build a triangle?', not: 'Tahmin aldırın, sonra çubukların inişini izletin.' },
  { bas: 77.1, son: 80.2, tr: 'Kapanmıyor: 3 + 4 = 7, 8’e yetmiyor.', en: 'It won’t close: 3 + 4 = 7 is not enough to reach 8.', not: 'Boşluğu gösterin: tam 1 birim eksik.' },
  { bas: 80.3, son: 83.4, tr: 'Tabanı 6 yap: 3 + 4 > 6, çubuklar buluşur.', en: 'Make the base 6: 3 + 4 > 6, and the rods meet.', not: 'Pergel yaylarının kesiştiği noktayı işaret edin.' },
  { bas: 83.5, son: 86.8, tr: 'Her kenar, diğer ikisinin farkından büyük, toplamından küçüktür.', en: 'Each side is longer than the difference of the other two, shorter than their sum.', not: 'Sayı doğrusundaki açık aralığı vurgulayın: 1 ve 7 dahil değil.' },
  { bas: 86.9, son: 90.2, tr: 'Köprülerdeki kafes kirişler bu yüzden üçgen: üçgen yamulmaz.', en: 'That is why bridge trusses use triangles: a triangle cannot be bent out of shape.', not: 'Okul çevresindeki çatı makaslarını, vinçleri örnek gösterin.' },

  { bas: 90.3, son: 93.6, tr: 'Şimdi küreye dön. Küçük bir üçgen: toplam neredeyse 180.', en: 'Back to the sphere. A small triangle: the sum is almost 180.', not: 'Açılıştaki soruya döndüğünüzü hatırlatın.' },
  { bas: 93.7, son: 97.4, tr: 'Üçgen büyüdükçe toplam da büyüyor.', en: 'As the triangle grows, so does the sum.', not: 'Sayaç yükselirken sessiz kalın; sayılar konuşsun.' },
  { bas: 97.5, son: 100.8, tr: 'Kutup–ekvator üçgeni: üç dik açı, toplam 270°.', en: 'The pole–equator triangle: three right angles, 270° in total.', not: 'Açılıştaki yürüyüşle aynı üçgen olduğunu söyleyin.' },
  { bas: 100.9, son: 104.0, tr: 'Kürede paralel doğru yoktur. 180, düzlemin imzasıdır.', en: 'A sphere has no parallel lines. 180 is the signature of the plane.', not: 'Filmin ana cümlesi. Yavaş ve vurgulu okuyun.' },
  { bas: 104.1, son: 107.2, tr: 'Nasirüddin Tusi, bu postulatı yüzyıllar önce derinlemesine inceledi.', en: 'Nasir al-Din al-Tusi studied this postulate deeply centuries ago.', not: 'Araştırma ödevi olarak Tusi ve Ebu Cafer Hazin’in çalışmalarını önerebilirsiniz.' },

  { bas: 107.3, son: 110.6, tr: 'Aklında kalsın: iç açılar 180°, dış açılar 360°.', en: 'Remember: interior angles make 180°, exterior angles 360°.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 110.7, son: 114.2, tr: 'Büyük kenar, büyük açı; her kenar diğer ikisinin arasında.', en: 'Longer side, larger angle; each side lies between the other two.', not: 'Eşitsizliği öğrencilere sözlü olarak tekrar ettirin.' },
  { bas: 114.8, son: 118.6, tr: 'Üçgen Laboratuvarı’nda köşeleri kendin sürükle.', en: 'Drag the corners yourself in the Triangle Lab.', not: 'Karekodu okutmaları için zaman tanıyın.' },
];
