/* İki Ayna — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.5, son: 3.4, tr: 'Bir kilim motifi. Tek bir parça.', en: 'A kilim motif. A single piece.', not: 'Yavaş ve alçak sesle başlayın; ekranda yalnızca tek motif var.' },
  { bas: 3.5, son: 6.6, tr: 'Bir ayna, bir ayna daha… ve kendini çoğaltıyor.', en: 'One mirror, then another… and it multiplies itself.', not: 'Kopyalar belirdikçe ritmi hızlandırın.' },
  { bas: 6.7, son: 9.6, tr: 'Kamerayı geri çek: koca desen aynı parçanın kopyaları.', en: 'Pull the camera back: the whole pattern is copies of one piece.', not: 'Desen yayılırken kısa bir es; görüntü konuşsun.' },
  { bas: 9.7, son: 12.6, tr: 'Bu desen, iki aynanın eseri.', en: 'This pattern is the work of two mirrors.', not: 'Filmin sorusu bu cümlede; vurgulayın, sınıfa "Nasıl?" diye sorun.' },

  { bas: 18.8, son: 22.0, tr: 'Bir ayna doğrusu. Motifin görüntüsü nerede olur?', en: 'A mirror line. Where will the motif’s image be?', not: 'Önce tahmin aldırın (varsayım); cevabı hemen vermeyin.' },
  { bas: 22.1, son: 25.6, tr: 'Her nokta aynaya dik iner ve aynı uzaklıkta karşıya geçer.', en: 'Each point drops perpendicular to the mirror and crosses the same distance.', not: 'Eşit uzaklık işaretlerini gösterin: tek, çift, üç çizgi.' },
  { bas: 25.7, son: 29.0, tr: 'Uzunluklar ve açılar korunur. Şekil ile görüntüsü eştir.', en: 'Lengths and angles are preserved. The shape and its image are congruent.', not: '"Neler değişmedi?" diye sordurup listeletin.' },
  { bas: 29.1, son: 32.4, tr: 'Ama bir şey değişti: dönüş yönü tersine döndü.', en: 'But something changed: the direction of turning reversed.', not: 'İki oku karşılaştırın; renk değişimine dikkat çekin.' },
  { bas: 32.5, son: 35.4, tr: 'Saat yönünün tersi, saat yönü oldu. Neden?', en: 'Counterclockwise became clockwise. Why?', not: 'Soru işaretinde durun; 3B sahneye merak taşıyın.' },

  { bas: 35.5, son: 38.8, tr: 'Bir boyut yukarı çık. Ayna doğrusu bir menteşe olsun.', en: 'Step up one dimension. Let the mirror line be a hinge.', not: 'Kamera eğilirken sesi açın; sinematik an.' },
  { bas: 38.9, son: 42.6, tr: 'Motif düzlemden kalkar, menteşe etrafında 180° döner…', en: 'The motif lifts off the plane and turns 180° around the hinge…', not: 'Dönüş sayacını izletin: 0, 90, 180.' },
  { bas: 42.7, son: 46.0, tr: '…ve arka yüzüyle geri iner. Yansıma budur.', en: '…and lands back on its other face. That is reflection.', not: '"Vay be" anı: arka yüz mercan rengiyle iniyor.' },
  { bas: 46.1, son: 50.0, tr: 'Arka yüzden bakınca yön ters görünür. Renk değişti, şekil aynı.', en: 'Seen from the back, the direction looks reversed. New color, same shape.', not: 'Bir kâğıda motif çizip arkasından ışığa tutturabilirsiniz.' },

  { bas: 50.6, son: 53.8, tr: 'Öteleme: her nokta aynı vektörle, aynı yöne kayar.', en: 'Translation: every point slides by the same vector.', not: 'Üç okun paralel ve eşit olduğunu gösterin.' },
  { bas: 53.9, son: 57.4, tr: 'Motif kaydı ama ters dönmedi: yön korunur.', en: 'The motif slid but did not flip: orientation is preserved.', not: 'Renk turkuaz kaldı; renk = yön kodunu hatırlatın.' },
  { bas: 57.5, son: 61.0, tr: 'Dönme: bir merkez ve bir açı. Her nokta merkezden aynı uzaklıkta kalır.', en: 'Rotation: a center and an angle. Each point keeps its distance from the center.', not: 'Pergel benzetmesi kullanın: merkez sabit, kollar döner.' },
  { bas: 61.1, son: 65.6, tr: 'Dönmede de yön korunur. Görüntü yine eş.', en: 'Rotation preserves orientation too. The image is congruent again.', not: 'Üç dönüşümün ortak özelliğine işaret edin: eşlik.' },

  { bas: 66.1, son: 69.6, tr: 'Şimdi iki ayna. Önce birincisinde yansıt…', en: 'Now two mirrors. Reflect in the first one…', not: 'İlk görüntü mercan: yön ters.' },
  { bas: 69.7, son: 73.0, tr: '…sonra görüntüyü ikinci aynada yansıt.', en: '…then reflect that image in the second.', not: 'İkinci görüntü turkuaz: yön geri döndü.' },
  { bas: 73.1, son: 76.6, tr: 'Sonuç bir öteleme! Aynalar arası d ise kayma 2d.', en: 'The result is a translation! If the mirrors are d apart, the shift is 2d.', not: 'Sürpriz an. "Neden 2 katı?" diye sorun.' },
  { bas: 76.7, son: 80.2, tr: 'Aynaları yaklaştır: d = 3, kayma 6. Kural değişmiyor.', en: 'Bring the mirrors closer: d = 3, shift 6. The rule holds.', not: 'Örnekten genellemeye geçişi vurgulayın.' },
  { bas: 80.3, son: 83.0, tr: 'İki ters dönüş, yönü geri çevirir.', en: 'Two flips set the orientation right again.', not: 'Kısa ve net.' },

  { bas: 83.1, son: 86.6, tr: 'Aynalar kesişirse? Aralarındaki açı θ = 45°.', en: 'What if the mirrors cross? The angle between them is θ = 45°.', not: 'Önce tahmin: "Bu kez ne olur?"' },
  { bas: 86.7, son: 90.2, tr: 'İki yansıma bu kez bir dönme: merkez kesişim, açı 2θ = 90°.', en: 'Two reflections now make a rotation: center at the crossing, angle 2θ = 90°.', not: 'Dönme merkezi ve dönme açısı kavramlarını burada adlandırın.' },
  { bas: 90.3, son: 93.6, tr: 'Aynaları 60° aç. Kopyalar kendi kendine çoğalır.', en: 'Open the mirrors to 60°. The copies multiply by themselves.', not: 'Kaleydoskop deneyimini sorun.' },
  { bas: 93.7, son: 97.6, tr: 'Altı kopya, bir rozet: kilimin sırrı iki aynada.', en: 'Six copies, one rosette: the kilim’s secret lies in two mirrors.', not: 'Açılıştaki desene geri bağlayın; ninelerimizin kilimlerinden örnek isteyin.' },

  { bas: 98.1, son: 101.6, tr: 'Yansıma yönü çevirir; öteleme ve dönme yönü korur.', en: 'Reflection reverses orientation; translation and rotation preserve it.', not: 'Önermeyi tahtaya yazdırın.' },
  { bas: 101.7, son: 105.2, tr: 'Üçünde de görüntü baştaki şekle eştir: çevre ve alan aynı.', en: 'In all three, the image is congruent to the original: same perimeter, same area.', not: 'Değişen ve değişmeyen özellikleri iki sütunda toplatın.' },

  { bas: 106.3, son: 109.8, tr: 'Aklında kalsın: iki yansıma, bir öteleme ya da bir dönmedir.', en: 'Remember: two reflections make a translation or a rotation.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 109.9, son: 113.4, tr: 'Paralel aynalar 2d öteler; kesişen aynalar 2θ döndürür.', en: 'Parallel mirrors translate by 2d; crossing mirrors rotate by 2θ.', not: 'İki kuralı sınıfa sesli tekrar ettirin.' },
  { bas: 113.9, son: 117.8, tr: 'Laboratuvarda kendi motifini tasarla, aynalarla çoğalt.', en: 'Design your own motif in the lab and multiply it with mirrors.', not: 'Karekodu okutmaları için zaman tanıyın; motif tasarımını ödev verebilirsiniz.' },
];
