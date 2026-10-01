/* Üssün Merdiveni — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 3.5, tr: 'Bir kâğıdı ikiye katla. Kalınlığı iki katına çıkar.', en: 'Fold a sheet of paper in half. Its thickness doubles.', not: 'Sakin ve yavaş başlayın; "iki katına" sözcüğünde kâğıt katlanıyor.' },
  { bas: 3.6, son: 6.6, tr: 'Yine katla. Ve yine. Her katlama bir çarpma: × 2.', en: 'Fold again. And again. Each fold is one multiplication: × 2.', not: 'Ritim hızlanıyor; "ve yine" deyip kısa bir es verin.' },
  { bas: 6.7, son: 10.0, tr: '42 katlamada bu yığın Ay’ı geçer.', en: 'After 42 folds, the stack passes the Moon.', not: 'Ay belirdiğinde durun, sınıfın tepkisini bekleyin.' },

  { bas: 17.6, son: 21.6, tr: 'Her basamak bir öncekinin 10 katı. Üs, kaç basamak çıktığını sayar.', en: 'Each rung is 10 times the one below. The exponent counts how many rungs you climbed.', not: 'Ana fikir bu cümle: "üs bir sayaçtır". Vurgulayın.' },
  { bas: 21.7, son: 26.0, tr: 'Çarpmak, adımları art arda atmaktır: 2 adım, sonra 3 adım.', en: 'Multiplying means taking steps one after another: 2 steps, then 3 steps.', not: 'Işık basamakları tırmanırken adımları sesli sayın: bir, iki… üç, dört, beş.' },
  { bas: 26.1, son: 30.2, tr: 'Taban değişse de örüntü değişmez: üsler toplanır.', en: 'Change the base and the pattern stays: the exponents add up.', not: 'Önce varsayım, sonra genelleme. "Her zaman mı?" diye sorabilirsiniz.' },
  { bas: 30.3, son: 35.6, tr: 'Bölmek geri adımdır. 1’in altına inince üs eksi olur.', en: 'Dividing is stepping back. Below 1, the exponent turns negative.', not: '10 üzeri sıfırın neden 1 olduğunu buradan sordurun: hiç adım atmadın.' },

  { bas: 36.0, son: 40.4, tr: 'Bilim bu merdiveni kullanır: atomdan ışık yılına kadar.', en: 'Science uses this ladder: from atoms to light-years.', not: 'Kamera yükselirken sesi açın, hayranlık tonu.' },
  { bas: 40.5, son: 45.2, tr: 'Bilimsel gösterim: 1 ile 10 arasında bir sayı, çarpı 10’un bir kuvveti.', en: 'Scientific notation: a number between 1 and 10, times a power of 10.', not: 'Tanımı yavaş ve net okuyun.' },
  { bas: 45.3, son: 51.4, tr: 'Bir ışık yılı, Dünya–Güneş uzaklığının yaklaşık 63 000 katı.', en: 'One light-year is about 63,000 times the Earth–Sun distance.', not: 'Önce sayılar bölünür, sonra üsler çıkarılır; ikisini ayrı gösterin.' },

  { bas: 52.4, son: 56.4, tr: 'Peki iki basamağın tam ortasında ne var?', en: 'So what lies exactly halfway between two rungs?', not: 'Soru sorun ve bekleyin. Cevabı öğrencilerden alın.' },
  { bas: 56.5, son: 61.2, tr: 'İki yarım adım bir tam adım eder: x · x = 2. Yani x = √2.', en: 'Two half steps make one full step: x · x = 2. So x = √2.', not: '"Yarım adım" ile "karekök" arasındaki köprüyü kurun.' },
  { bas: 61.3, son: 65.6, tr: 'Üç eşit adımda çıkarsan her adım ∛2. Kesirli üs, köktür.', en: 'Climb in three equal steps and each one is ∛2. A fractional exponent is a root.', not: 'Genellemeyi tahtaya yazdırabilirsiniz: a üzeri m bölü n.' },
  { bas: 65.7, son: 70.2, tr: 'Elindeki A4 kâğıda bak: uzun kenar, kısa kenarın √2 katı.', en: 'Look at an A4 sheet: the long side is √2 times the short side.', not: 'Sınıfta gerçek bir A4 kâğıt gösterin.' },
  { bas: 70.3, son: 74.4, tr: 'Bu yüzden ikiye katlayınca şekli hiç bozulmaz.', en: 'That is why folding it in half keeps its shape exactly.', not: 'Açılıştaki katlamaya geri dönüş: "vay be" anı.' },

  { bas: 75.2, son: 80.0, tr: 'Kökün içinden tam kareyi çıkar: √8 = 2√2. Merdivende 3 adımın yarısı.', en: 'Pull the perfect square out of the root: √8 = 2√2. On the ladder, half of 3 steps.', not: 'İki temsili yan yana gösterin: cebir ve merdiven.' },
  { bas: 80.1, son: 85.0, tr: 'Eşlenikle çarpınca ortadaki terimler birbirini siler. Kök kaybolur.', en: 'Multiply by the conjugate and the middle terms cancel. The root disappears.', not: 'Işık patlamasında durun: "nereye gitti?"' },
  { bas: 85.1, son: 90.0, tr: 'Sonucu bir de hesap makinesiyle doğrula: iki yol aynı sayıya çıkar.', en: 'Check it with a calculator too: both roads reach the same number.', not: 'Doğrulama yöntemlerinin hangisinin daha kullanışlı olduğunu tartıştırın.' },

  { bas: 90.6, son: 94.6, tr: 'Bir çiftçi 1 dönümlük kare tarlasını çitle çevirecek.', en: 'A farmer will fence a square field of 1,000 square metres.', not: '1 dönüm = 1000 m² olduğunu hatırlatın.' },
  { bas: 94.7, son: 100.4, tr: 'Çevre 4√1000 ≈ 126,5 m. Aşağı yuvarlarsan çit yetmez: 127 m al.', en: 'The perimeter is 4√1000 ≈ 126.5 m. Round down and you run short: buy 127 m.', not: 'Yaklaşık değer ve tasarruf: neden yukarı yuvarladık?' },

  { bas: 101.0, son: 110.6, tr: 'Aklında kalsın: üs adım sayar, kesirli üs köktür.', en: 'Remember: an exponent counts steps; a fractional exponent is a root.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 111.2, son: 117.0, tr: 'Şimdi sıra sende: merdiveni laboratuvarda kendin kur.', en: 'Your turn: build the ladder yourself in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
