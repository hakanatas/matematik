/* Tek Doğru — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 3.6, tr: 'Gece, bir taksi. Taksimetre 40 TL’den açılıyor.', en: 'Night, a taxi. The meter starts at 40 lira.', not: 'Alçak, sakin bir sesle başlayın; şehir ışıkları akarken kısa bir es.' },
  { bas: 3.7, son: 7.0, tr: 'Her kilometre 25 TL ekliyor. Noktalar bir doğruya diziliyor.', en: 'Each kilometre adds 25 lira. The points line up.', not: 'Noktalar düştükçe sayıları sınıfla birlikte sayın: 65, 90, 115…' },
  { bas: 7.1, son: 10.1, tr: 'Bu doğru, aslında başka bir doğrunun kılığı.', en: 'This line is really another line in disguise.', not: 'Doğru titrediğinde durun. "Hangi doğru?" diye sorun, cevabı bekletin.' },

  { bas: 17.8, son: 21.5, tr: 'Hepsinin atası tek bir doğru: f(x) = x. Her sayı kendine gider.', en: 'They all descend from one line: f(x) = x. Every number maps to itself.', not: 'Kamera geri çekilirken "ata" sözcüğünü vurgulayın.' },
  { bas: 21.6, son: 25.0, tr: 'Tanım kümesi de görüntü kümesi de tüm gerçek sayılar.', en: 'Its domain and its range are both all real numbers.', not: 'Eksenler boydan boya yanarken ℝ\'yi gösterin.' },
  { bas: 25.1, son: 29.2, tr: 'Sıfırı x = 0. Solda negatif, sağda pozitif; hep artıyor.', en: 'Its zero is x = 0. Negative on the left, positive on the right; always increasing.', not: 'Kimlik kartının satırlarını tek tek işaret edin.' },
  { bas: 29.3, son: 33.2, tr: 'En büyük ya da en küçük değeri yok. Her y’ye tek x: bire bir.', en: 'No maximum, no minimum. One x for every y: one-to-one.', not: 'Yatay doğru testini sorun: "Kaç noktada kesiyor?"' },

  { bas: 33.8, son: 37.3, tr: 'Şimdi onu kılık değiştirmeye zorlayalım. k, doğruyu yukarı taşır.', en: 'Now let’s make it change disguise. k lifts the line up.', not: 'Oyunbaz bir ton. k artınca okların yönünü gösterin.' },
  { bas: 37.4, son: 40.1, tr: 'k eksi olunca doğru aşağı iner.', en: 'When k is negative, the line moves down.', not: 'Kısa ve net.' },
  { bas: 40.2, son: 43.6, tr: 'r ise yatay kaydırır. Dikkat: x − 3, doğruyu sağa götürür.', en: 'r shifts it sideways. Careful: x − 3 moves the line to the right.', not: '"Dikkat" sözcüğünde durun; işaret tuzağı burada.' },
  { bas: 43.7, son: 46.6, tr: 'x + 2 ise sola. İşaret, tersini söylüyor gibi.', en: 'And x + 2 moves it left. The sign seems to say the opposite.', not: 'Neden böyle? Öğrencilere "x − 3 = 0 nerede?" diye sordurun.' },

  { bas: 47.2, son: 50.6, tr: 'a doğruyu eğer: a = 2 iken her adımda iki kat yükselir.', en: 'a tilts the line: with a = 2 it rises twice as fast.', not: 'Eğim üçgenini gösterin: bir sağa, iki yukarı.' },
  { bas: 50.7, son: 54.0, tr: 'a sıfıra yaklaştıkça doğru yatar. a = 0 olsaydı bire bir olmazdı.', en: 'As a approaches zero the line flattens. At a = 0 it would not be one-to-one.', not: 'a ≠ 0 koşulunu hatırlatın; sabit fonksiyonda her x aynı yere gider.' },
  { bas: 54.1, son: 57.0, tr: 'a eksi olunca doğru yansır: artan fonksiyon azalana döner.', en: 'With a negative a the line flips: increasing becomes decreasing.', not: 'Kayan ışığı izletin: soldan sağa giderken iniyor.' },
  { bas: 57.1, son: 60.3, tr: 'a = −2, r = 1, k = 3: g(x) = −2x + 5. Sıfırı 2,5; azalan.', en: 'a = −2, r = 1, k = 3: g(x) = −2x + 5. Its zero is 2.5; decreasing.', not: 'Yeni kimlik kartını eskisiyle karşılaştırın: ne değişti, ne aynı kaldı?' },

  { bas: 60.8, son: 64.4, tr: 'Bir varsayım: a pozitifse doğru hep artar. Kanıtlayalım.', en: 'A conjecture: if a is positive, the line always increases. Let’s prove it.', not: 'Varsayımı sınıftan alın, sonra ispata geçin.' },
  { bas: 64.5, son: 68.3, tr: 'x₁ < x₂ ise a ile çarp: a pozitif, eşitsizlik yön değiştirmez.', en: 'If x₁ < x₂, multiply by a: a is positive, so the inequality keeps its direction.', not: 'Her adımı tahtada da yazdırabilirsiniz.' },
  { bas: 68.4, son: 71.4, tr: 'b ekle: h(x₁) < h(x₂). Her a > 0 için artan.', en: 'Add b: h(x₁) < h(x₂). Increasing for every a > 0.', not: 'Noktalar kayarken "her" sözcüğünü vurgulayın: grafik doğruluyor, cebir ispatlıyor.' },
  { bas: 71.5, son: 74.7, tr: 'Sıfırı x = −b/a: 2x − 6 için 3. Solda eksi, sağda artı.', en: 'The zero is x = −b/a: for 2x − 6 it is 3. Negative left, positive right.', not: 'İşaret tablosunu grafikle eşleştirin.' },

  { bas: 75.2, son: 78.6, tr: 'Şimdi bir sürpriz. y = 2x + 1’i 2 birim sağa kaydıralım.', en: 'Now a surprise. Shift y = 2x + 1 two units to the right.', not: 'Gizemli bir ton; ilk hareketi sessizce izletin.' },
  { bas: 78.7, son: 82.0, tr: 'Bir de aynı doğruyu 4 birim aşağı indirelim.', en: 'Now move the same line four units down.', not: '"Nereye oturacak?" diye sorun, tahmin aldırın.' },
  { bas: 82.1, son: 85.6, tr: 'İkisi aynı yere oturdu! a(x − r) + k = ax + (k − ar).', en: 'They land in the same place! a(x − r) + k = ax + (k − ar).', not: 'Flaşta durun. Cebirsel ispatla grafiksel doğrulamayı yan yana koyun.' },
  { bas: 85.7, son: 89.3, tr: 'Taksinin 40 TL’si de 1,6 km’lik bir kayma: 25(x + 1,6).', en: 'The taxi’s 40 lira start is just a 1.6 km shift: 25(x + 1.6).', not: 'Açılışa dönüş: 25 · 1,6 = 40. "Vay be" anı.' },

  { bas: 89.8, son: 93.4, tr: 'Gerçek hayat tek doğruyla yetinmez. −10 °C’deki buzu ısıtalım.', en: 'Real life needs more than one line. Let’s heat ice at −10 °C.', not: 'Fizik dersindeki hâl değişimine bağlayın.' },
  { bas: 93.5, son: 97.0, tr: '0 °C’ye çıkar, eriyene kadar sabit kalır, sonra yine ısınır.', en: 'It reaches 0 °C, stays flat while melting, then warms again.', not: 'Düz parçada "enerji nereye gidiyor?" diye sorabilirsiniz.' },
  { bas: 97.1, son: 101.1, tr: 'Kapalı [0, 10] aralığında en küçük −10, en büyük 40. Uç açıksa yok.', en: 'On the closed interval [0, 10] the minimum is −10, the maximum 40. Open ends: none.', not: 'Açık uçta neden en büyük değer olmadığını tartıştırın.' },

  { bas: 101.6, son: 106.2, tr: 'Aklında kalsın: her doğru, f(x) = x’in kılık değiştirmiş hâli.', en: 'Remember: every line is f(x) = x in disguise.', not: 'Özet maddelerini tek tek okuyun.' },
  { bas: 106.3, son: 111.1, tr: 'a eğer ve çevirir, r ve k kaydırır; sıfır −b/a’da.', en: 'a tilts and flips, r and k shift; the zero is at −b/a.', not: 'Her maddede kısa bir es verin.' },
  { bas: 111.8, son: 117.2, tr: 'Şimdi sıra sende: a, r ve k’yi laboratuvarda kendin kaydır.', en: 'Your turn: slide a, r and k yourself in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
