/* Aynı Ortalama — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 3.6, tr: 'İki otobüs hattı. Her birinde 30 sefer boyunca bekleme ölçüldü.', en: 'Two bus lines. On each, the wait was timed over 30 trips.', not: 'Sakin başlayın; noktalar yağmur gibi düşerken konuşmayı kısa tutun.' },
  { bas: 3.7, son: 7.0, tr: 'Her nokta bir bekleme. A hattı sıkışık, B hattı dağınık.', en: 'Each dot is one wait. Line A is tight, line B is scattered.', not: 'İki şekli göstererek "fark ettiniz mi?" diye sorun.' },
  { bas: 7.1, son: 10.8, tr: 'Ama ortalamaları aynı: 10 dakika. Hangisine binersin?', en: 'Yet their averages match: 10 minutes. Which one would you take?', not: 'Soruyu sorun ve bekleyin; öğrencilerin tercihini ve gerekçesini alın.' },

  { bas: 18.8, son: 22.0, tr: 'Böyle bir karar bir araştırmayla başlar: önce iyi bir soru.', en: 'A decision like this starts with an investigation: first, a good question.', not: 'Döngüyü işaret edin; istatistiğin bir süreç olduğunu vurgulayın.' },
  { bas: 22.1, son: 26.0, tr: 'Plan: evren bütün 9. sınıflar, örneklem kurayla seçilen 29 kişi.', en: 'Plan: the population is all 9th graders; the sample is 29 drawn by lot.', not: 'Evren ile örneklem farkını bir örnekle sordurun: neden kura?' },
  { bas: 26.1, son: 28.6, tr: 'Veri değişkendir: kişiden kişiye, ölçümden ölçüme.', en: 'Data vary: from person to person, from measurement to measurement.', not: 'Üç değişkenlik kaynağını sayın: doğal, ölçüm, örneklem.' },
  { bas: 28.7, son: 31.3, tr: 'Sonra analiz, yorum ve yine soruya dönüş.', en: 'Then analysis, interpretation, and back to the question.', not: 'Işık döngüyü kapatırken kısa bir es verin.' },

  { bas: 31.6, son: 35.4, tr: 'Her nokta bir öğrenci. Nokta grafiği verinin tamamını gösterir.', en: 'Each dot is one student. A dot plot shows every single value.', not: 'Noktalar düşerken "bu kimin noktası olabilir?" diye sorabilirsiniz.' },
  { bas: 35.5, son: 38.9, tr: 'En sık görülen değer tepe değerdir: günde 150 dakika.', en: 'The most frequent value is the mode: 150 minutes a day.', not: 'Tepe değerin her zaman merkez olmak zorunda olmadığını not edin.' },
  { bas: 39.0, son: 42.2, tr: 'Noktalar sütunlara akar: histogram aralıklardaki sayıyı gösterir.', en: 'The dots pour into columns: a histogram counts values in intervals.', not: 'Dönüşüm anında susun; görüntü konuşsun.' },
  { bas: 42.3, son: 47.7, tr: 'Sınıf genişliği değişince şekil de değişir. Seçim senin elinde.', en: 'Change the class width and the shape changes too. The choice is yours.', not: 'Çok geniş: ayrıntı kaybolur. Çok dar: gürültü. İkisini de gösterin.' },
  { bas: 47.8, son: 51.5, tr: 'Şimdi veriyi dörde böl: kutu grafiği çeyrekleri gösterir.', en: 'Now split the data into quarters: a box plot shows the quartiles.', not: 'Renkli gruplara dikkat çekin: her biri verinin yaklaşık dörtte biri.' },
  { bas: 51.6, son: 55.4, tr: 'Kutunun içi ortadaki yarı: çeyrekler açıklığı 95 dakika.', en: 'The box holds the middle half: the interquartile range is 95 minutes.', not: 'Q3 − Q1 hesabını tahtada birlikte yapın.' },
  { bas: 55.5, son: 58.6, tr: 'Açıklık, en büyük ile en küçük değerin farkı: 270 dakika.', en: 'The range is the largest minus the smallest value: 270 minutes.', not: 'Açıklığın yalnızca iki uca baktığını vurgulayın.' },
  { bas: 58.7, son: 62.2, tr: 'Standart sapma ortalamaya tipik uzaklıktır. Hesabı teknoloji yapar.', en: 'Standard deviation is the typical distance from the mean. Technology computes it.', not: 'Formül vermeyin; hesap makinesi ya da tabloda bulmalarını isteyin.' },

  { bas: 62.6, son: 66.0, tr: 'Ortalama bir denge noktasıdır. Bir öğrenci daha ekleyelim.', en: 'The mean is a balance point. Let’s add one more student.', not: 'Teraziyi gösterin: kol dengede, üçgen ortalamada.' },
  { bas: 66.1, son: 69.6, tr: 'Günde 600 dakika: tam 10 saat. Kol bir anda devrilir.', en: '600 minutes a day: a full 10 hours. The beam tips at once.', not: 'Düşüşle birlikte sesi yükseltin, sonra hemen susun.' },
  { bas: 69.7, son: 73.2, tr: 'Ortalama 165’e kaydı. Ortanca hâlâ 150.', en: 'The mean slid to 165. The median is still 150.', not: 'İki sayıyı yan yana okuyun; ortancanın neden kımıldamadığını sordurun.' },
  { bas: 73.3, son: 75.8, tr: 'Uç değer ortalamayı çeker, ortancayı değil.', en: 'An outlier pulls the mean, not the median.', not: 'Filmin ana cümlelerinden biri; yavaş ve net söyleyin.' },

  { bas: 76.1, son: 79.6, tr: 'Otobüslere dönelim: kutular yayılımı hemen ele veriyor.', en: 'Back to the buses: the boxes reveal the spread at a glance.', not: 'İki kutunun genişliğini parmakla karşılaştırın.' },
  { bas: 79.7, son: 83.6, tr: 'Standart sapma A’da yaklaşık 1,4; B’de yaklaşık 5,6 dakika.', en: 'Standard deviation: about 1.4 on line A, about 5.6 minutes on line B.', not: 'Tablodaki yayılım satırlarını işaret edin.' },
  { bas: 83.7, son: 87.6, tr: 'Düzenli olmak istiyorsan A. B’de 30 seferin 5’i 15 dakikayı aştı.', en: 'If you want to be on time every day, take line A. On B, 5 of 30 trips exceeded 15 minutes.', not: 'Kararın soruya bağlı olduğunu söyleyin: "kim için en iyi?"' },
  { bas: 87.7, son: 91.7, tr: 'Örneklemimize göre yarın da muhtemelen böyle; kesinlik yok.', en: 'Based on our sample, tomorrow will probably look similar. No certainty, only likelihood.', not: 'Belirsizlik dilini vurgulayın: "muhtemelen", "örneklemimize göre".' },

  { bas: 92.2, son: 97.6, tr: 'Aklında kalsın: merkez tek başına yetmez, yayılıma da bak.', en: 'Remember: the center alone is not enough; look at the spread too.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 97.7, son: 102.2, tr: 'Uç değer ortalamayı çeker. Grafiği soruna göre seç.', en: 'An outlier pulls the mean. Choose the graph that fits your question.', not: 'Hangi soruda hangi grafiğin işe yaradığını sınıfa sorun.' },
  { bas: 102.8, son: 108.3, tr: 'Sıra sende: laboratuvarda noktaları sürükle, özetleri izle.', en: 'Your turn: drag the dots in the lab and watch the summaries change.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
