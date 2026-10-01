/* Gürültünün Sönmesi — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 2.9, tr: 'İki zar at. Toplamı kaydet.', en: 'Roll two dice. Record the sum.', not: 'Sakin, alçak sesle başlayın; zarlar dururken susun.' },
  { bas: 3.0, son: 5.7, tr: '10 atış: sütunlar karmakarışık. Bu gürültü.', en: '10 rolls: the bars are a mess. This is noise.', not: '"Gürültü" sözcüğünü vurgulayın; filmin anahtar kelimesi.' },
  { bas: 5.8, son: 8.6, tr: '100 atışta bir şekil seziliyor gibi.', en: 'At 100 rolls, a shape seems to emerge.', not: 'Merak tonu. "Gibi" sözcüğünde kısa bir es.' },
  { bas: 8.7, son: 12.2, tr: '10 000 atış: gürültü söndü, geriye bir şekil kaldı.', en: '10,000 rolls: the noise has faded, a shape remains.', not: 'Üçgen çizilirken durun. Sınıfa sorun: "Neden ortası en yüksek?"' },

  { bas: 20.0, son: 23.6, tr: 'Önce az atışla başlayalım: bir grup 25 kez atıyor.', en: 'Let’s start small: one group rolls 25 times.', not: 'Sınıfta gerçek bir deney yaptırabilirsiniz; grup görevlerini paylaştırın.' },
  { bas: 23.7, son: 28.4, tr: 'Her toplamı çeteleye işle: dört çizgi, beşincisi çapraz.', en: 'Tally each sum: four strokes, the fifth crosses them.', not: 'Atışlar hızlanırken sesli sayabilirsiniz.' },
  { bas: 28.5, son: 31.6, tr: 'Çizgileri say: sıklık tablosu. Hangi toplam kaç kez geldi?', en: 'Count the strokes: a frequency table. How often did each sum appear?', not: 'Tablodaki boş satırlara (3, 11, 12) dikkat çekin: hiç gelmedi.' },
  { bas: 31.7, son: 35.2, tr: 'Göreli sıklık = sıklık ÷ deneme sayısı. Burada 25’e bölüyoruz.', en: 'Relative frequency = frequency ÷ number of trials. Here we divide by 25.', not: 'Tanımı yavaş okuyun; formülü tahtaya yazdırın.' },
  { bas: 35.3, son: 38.0, tr: 'Şekil aynı kaldı, ölçek değişti. Toplamları tam 1.', en: 'The shape stayed, the scale changed. They add up to exactly 1.', not: 'Sıklık dağılımı ile göreli sıklık dağılımını karşılaştırın.' },
  { bas: 38.1, son: 41.4, tr: 'Toplam 7’nin göreli sıklığı 0,24. Ama 25 atış yeterli mi?', en: 'The relative frequency of a sum of 7 is 0.24. But are 25 rolls enough?', not: 'Soruyu sorun ve bekleyin; öğrencilerden tahmin alın.' },

  { bas: 41.8, son: 45.4, tr: 'Yalnızca toplam 7’yi izleyelim. Diğer gruplar da atışlarını ekliyor.', en: 'Let’s follow only the sum 7. The other groups add their rolls too.', not: 'Grupların katkısıyla deneme sayısının büyüdüğünü vurgulayın.' },
  { bas: 45.5, son: 50.0, tr: '25 atışta 0,24; 50’de 0,14; 100’de 0,17. Değer zıplıyor.', en: '0.24 at 25 rolls; 0.14 at 50; 0.17 at 100. The value jumps.', not: 'Tablodaki sayıları tek tek gösterin.' },
  { bas: 50.1, son: 53.4, tr: 'Sınıfın gücü 200 atışa yetiyor. Gerisini simülasyona bırakalım.', en: 'The class can manage 200 rolls. Let a simulation do the rest.', not: 'Kamera geri çekilirken eksenin sıkıştığını gösterin.' },
  { bas: 53.5, son: 57.8, tr: '500, 1000, 1500 atış: zikzaklar küçülüyor.', en: '500, 1,000, 1,500 rolls: the zigzags shrink.', not: 'Eğrinin dalgalanmasının azaldığını parmakla izletin.' },
  { bas: 57.9, son: 62.3, tr: 'Eğri 0,17 civarına yerleşiyor. 1500 atışta: 0,169.', en: 'The curve settles around 0.17. At 1,500 rolls: 0.169.', not: '"Yerleşiyor" fiilini vurgulayın: değer artık pek kıpırdamıyor.' },

  { bas: 63.0, son: 66.4, tr: 'Ya şanslıysak? Deneyi 41 kez, her biri 2000 atışla tekrarlayalım.', en: 'What if we were lucky? Repeat it 41 times, 2,000 rolls each.', not: 'Şüpheyi sınıfa siz yöneltin: "Tek bir deney yeterli mi?"' },
  { bas: 66.5, son: 71.4, tr: 'Başta eğriler her yere saçılıyor. Sonra hepsi aynı kanala akıyor.', en: 'At first the curves scatter everywhere. Then they all flow into one channel.', not: 'Görüntüyü konuşturun; kısa bir sessizlik iyi gelir.' },
  { bas: 71.5, son: 75.0, tr: 'Bir huni! 25 atışta sonuçlar 0 ile 0,36 arasında.', en: 'A funnel! At 25 rolls the results range from 0 to 0.36.', not: 'Sürpriz anı: "huni" kelimesinde durun.' },
  { bas: 75.1, son: 79.2, tr: 'Yaklaşalım: 2000 atışta hepsi 0,15 ile 0,18 arasında.', en: 'Zoom in: at 2,000 rolls, all lie between 0.15 and 0.18.', not: 'Değişkenliğin azaldığını iki aralığı karşılaştırarak söyleyin.' },
  { bas: 79.3, son: 82.4, tr: 'Büyük Sayılar Yasası: deneme arttıkça göreli sıklık yerleşir.', en: 'The Law of Large Numbers: with more trials, relative frequency settles.', not: 'Yasayı formülsüz, sözel olarak verin (limit 12. sınıfta).' },

  { bas: 82.8, son: 86.6, tr: 'Bir oyundaki zar sana hileli geliyor: 6 çok sık çıkıyor.', en: 'A die in a game feels rigged: 6 comes up too often.', not: 'Öğrencilerin oyun deneyimlerini sorun.' },
  { bas: 86.7, son: 89.6, tr: 'Turkuaz bölge, 40 adil zar simülasyonunun hunisi.', en: 'The turquoise region is the funnel of 40 fair-die simulations.', not: 'Huninin bir karşılaştırma aracı olduğunu söyleyin.' },
  { bas: 89.7, son: 92.9, tr: '30 atışta 9 kez 6: 0,30. Ama adil bir zar da bunu yapabilir.', en: '9 sixes in 30 rolls: 0.30. But a fair die can do that too.', not: 'Kırmızı nokta hâlâ huninin içinde; acele karar vermeyin.' },
  { bas: 93.0, son: 96.6, tr: 'Atmaya devam. Şanslı bir seri mi, kalıcı bir durum mu?', en: 'Keep rolling. A lucky streak, or something lasting?', not: 'Gerilim kurun; eğri ilerlerken susun.' },
  { bas: 96.7, son: 99.4, tr: '600 atışta 186 kez 6: 0,31. Huninin çok dışında.', en: '186 sixes in 600 rolls: 0.31. Far outside the funnel.', not: 'Adil zarlar 600 atışta en fazla 0,19’a çıkmıştı.' },
  { bas: 99.5, son: 102.3, tr: 'Yargı: zar muhtemelen hileli. Az denemeyle karar vermek risklidir.', en: 'Verdict: the die is probably rigged. Deciding on few trials is risky.', not: '"Muhtemelen" sözcüğünü vurgulayın: olasılık dili kesinlik değil.' },

  { bas: 103.0, son: 107.2, tr: 'Aklında kalsın: göreli sıklık = sıklık ÷ deneme sayısı.', en: 'Remember: relative frequency = frequency ÷ number of trials.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 107.3, son: 112.0, tr: 'Deneme arttıkça gürültü söner; deneysel olasılık bir değere yerleşir.', en: 'With more trials the noise fades; experimental probability settles.', not: 'Filmin adını hatırlatın: gürültünün sönmesi.' },
  { bas: 112.8, son: 117.6, tr: 'Şimdi sen dene: Olasılık Laboratuvarı’nda zarı binlerce kez at.', en: 'Now you try: roll the dice thousands of times in the Probability Lab.', not: 'Karekodu gösterin; laboratuvarı ödev olarak verebilirsiniz.' },
];
