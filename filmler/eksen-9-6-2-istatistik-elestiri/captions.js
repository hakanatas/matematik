/* Kamerayı Geri Çek — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 3.4, tr: 'Haber başlığı: “Mahallemizde hız ihlalleri patladı!”', en: 'Headline: “Speeding has exploded in our neighbourhood!”', not: 'Haber spikeri gibi, abartılı bir tonla okuyun.' },
  { bas: 3.5, son: 6.4, tr: 'Grafik de öyle diyor: Nisan’ın sütunu Mart’ınkinin üç katı.', en: 'The chart agrees: April’s bar is three times March’s.', not: '"Üç kat" sözcüğünde durun; sınıfa "inandınız mı?" diye sorun.' },
  { bas: 6.5, son: 9.4, tr: 'Kamerayı geri çek: eksen 48’den başlıyormuş.', en: 'Pull the camera back: the axis started at 48.', not: 'Kamera geri çekilirken susun; görüntü konuşsun.' },
  { bas: 9.5, son: 12.4, tr: 'Ortalama hız 49’dan 51’e çıkmış. Gerçek artış yaklaşık yüzde 4.', en: 'Average speed rose from 49 to 51. The real increase is about 4 percent.', not: '2 ÷ 49 hesabını sınıfla birlikte yapın.' },

  { bas: 20.0, son: 23.1, tr: 'Bir iddiayı sınamak için önce neye dayandığını bul.', en: 'To test a claim, first find what it rests on.', not: 'Üç kadrajı işaret edin: her adım kamerayı biraz daha geri çeker.' },
  { bas: 23.2, son: 26.3, tr: 'Sonra hata ya da yanlılık ara. En sonunda kabul et ya da çürüt.', en: 'Then look for errors or bias. Finally, accept it or refute it.', not: '"Çürütmek" ile "kabul etmek" eşit derecede geçerli sonuçlardır.' },

  { bas: 26.6, son: 30.0, tr: 'İlk iddia açılıştaki haber. Dayanağı iki ayın ortalama hızı.', en: 'The first claim is the opening headline. It rests on two monthly averages.', not: 'Temellendirme adımını adlandırın: veri nedir, özet nedir?' },
  { bas: 30.1, son: 33.8, tr: 'Grafik yalnızca iki ortalamayı gösteriyor. Kamerayı geri çekelim.', en: 'The chart shows only two averages. Let’s pull the camera back.', not: 'Kesikli çerçeve iddianın kadrajıdır; geri çekilince küçüldüğünü gösterin.' },
  { bas: 33.9, son: 37.4, tr: 'Her nokta bir araç. Hızlar 38 ile 64 arasında değişiyor.', en: 'Each dot is one car. Speeds range from 38 to 64.', not: 'Mart üstte, Nisan altta: iki dağılımın ne kadar örtüştüğüne baktırın.' },
  { bas: 37.5, son: 42.2, tr: '2 km/sa’lik fark bu değişkenliğin yanında küçük. Çürütüldü.', en: 'A 2 km/h gap is small next to this variability. Refuted.', not: 'Hız artışı yok demiyoruz; "patladı" sözcüğünü çürütüyoruz. Bu ayrımı vurgulayın.' },

  { bas: 42.6, son: 46.2, tr: 'İkinci iddia: “Bu şirkette ortalama maaş 100 000 TL.”', en: 'Second claim: “The average salary at this company is 100,000 lira.”', not: 'İş ilanı okur gibi, cazip bir tonla.' },
  { bas: 46.3, son: 49.8, tr: 'Geri çekil: dokuz çalışan 25 000 TL alıyor, hepsi çizginin altında.', en: 'Pull back: nine employees earn 25,000, all below the line.', not: '"Ortalama herkesin aldığı mı?" sorusunu sorun.' },
  { bas: 49.9, son: 53.2, tr: 'Biraz daha geri: yönetici 775 000 TL alıyor. Ortalamayı o şişiriyor.', en: 'Further back: the manager earns 775,000. That one value inflates the mean.', not: 'Kule yükselirken durun; uç değer kavramını hatırlatın.' },
  { bas: 53.3, son: 58.2, tr: 'Tipik maaşı ortanca söyler: 25 000 TL. İddia yanıltıcı, çürütüldü.', en: 'The median tells the typical salary: 25,000. The claim misleads. Refuted.', not: 'Ortalamanın hesap olarak doğru ama seçim olarak yanıltıcı olduğunu ayırt ettirin.' },

  { bas: 58.6, son: 62.9, tr: 'Üçüncü iddia: öğrencilerin %90’ı okulun 10:00’da başlamasını istiyor.', en: 'Third claim: 90% of students want school to start at 10:00.', not: 'Sınıfa önce kendi tahminlerini sorun.' },
  { bas: 63.0, son: 66.3, tr: 'Anket gece 23:00’te, bir oyun sunucusunda yapılmış.', en: 'The poll was taken at 11 p.m. on a gaming server.', not: '"Kimler o saatte orada olur?" diye sorun.' },
  { bas: 66.4, son: 70.0, tr: 'Okulun tamamına bakınca: örneklem yalnızca küçük, özel bir grup.', en: 'Look at the whole school: the sample is a small, special group.', not: 'Evren ve örneklem sözcüklerini yeniden kullanın.' },
  { bas: 70.1, son: 74.2, tr: 'Yanlı örneklem genellenemez. Kura, herkese eşit şans verir.', en: 'A biased sample can’t be generalized. A random draw gives everyone an equal chance.', not: 'Kurayla seçilen noktaların okulun her yerine dağıldığını gösterin.' },

  { bas: 74.6, son: 78.4, tr: 'Son iddia: 9. sınıflar gecede tipik olarak 7 saat uyuyor.', en: 'Last claim: 9th graders typically sleep 7 hours a night.', not: 'Aynı üç adımı bu kez kendileri uygulasın.' },
  { bas: 78.5, son: 82.2, tr: 'Geri çekil: eksen tam, örneklem kurayla seçilmiş, uç değer yok.', en: 'Pull back: full axis, a random sample, no outliers.', not: 'Kontrol listesini tek tek okuyun.' },
  { bas: 82.3, son: 85.5, tr: 'Ortalama 7, ortanca 7: özetler de dağılım da tutarlı.', en: 'Mean 7, median 7: the summaries and the distribution agree.', not: 'Ortalama ile ortancanın yakınlığının neden önemli olduğunu sorun.' },
  { bas: 85.6, son: 88.8, tr: 'Bu kez iddiayı kabul ediyoruz. Çürütmek tek seçenek değil.', en: 'This time we accept the claim. Refuting is not the only option.', not: 'Eleştirel düşünmenin her şeyi reddetmek olmadığını vurgulayın.' },

  { bas: 89.2, son: 94.4, tr: 'Aklında kalsın: ekseni kontrol et, uç değere dikkat et.', en: 'Remember: check the axis, watch for outliers.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 94.5, son: 99.2, tr: 'Örneklemi sorgula. Kararını veriyle ver: kabul et ya da çürüt.', en: 'Question the sample. Decide with data: accept or refute.', not: 'Sınıftan haberlerde gördükleri bir grafik getirmelerini isteyebilirsiniz.' },
  { bas: 99.8, son: 105.2, tr: 'Sıra sende: laboratuvarda grafikleri kendin yanılt, sonra düzelt.', en: 'Your turn: mislead with charts in the lab, then fix them.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
