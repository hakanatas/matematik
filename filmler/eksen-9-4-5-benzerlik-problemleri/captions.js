/* Ulaşılamayanı Ölçmek — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.6, son: 3.6, tr: 'Gün batıyor. Şehrin en uzun minaresi karşında.', en: 'The sun is setting. The city’s tallest minaret stands before you.', not: 'Alçak ve sakin bir tonla başlayın; kamera minarenin tepesinden geri çekiliyor.' },
  { bas: 3.7, son: 6.6, tr: 'Ona tırmanmadan boyunu bulabilir misin?', en: 'Can you find its height without climbing it?', not: 'Soruyu sorun ve kısa bir es verin. Sınıftan birkaç fikir alabilirsiniz.' },
  { bas: 6.7, son: 10.2, tr: 'İpucu: güneş ışınları hepsine aynı açıyla düşer.', en: 'A clue: sunlight hits everything at the same angle.', not: '“Aynı açı” sözcüklerini vurgulayın; ekranda eşit açı yayları beliriyor.' },

  { bas: 18.2, son: 22.0, tr: 'Önce verilenler: 1,7 m boyundaki öğrencinin gölgesi 2,5 m.', en: 'First, the givens: a 1.7 m student casts a 2.5 m shadow.', not: 'Problem çözme şeridinde “Verilen” adımı yanıyor; sayıları tahtaya yazdırın.' },
  { bas: 22.1, son: 26.0, tr: 'Kamerayı geri çek: kulenin gölgesi 50 m. İstenen: h.', en: 'Pull the camera back: the tower’s shadow is 50 m. Wanted: h.', not: 'Verilen ile istenen arasındaki farkı sorun: hangisini ölçebiliyoruz, hangisini ölçemiyoruz?' },
  { bas: 26.1, son: 29.6, tr: 'Aynı ışın, aynı açı. İki açısı eşit üçgenler benzerdir.', en: 'Same ray, same angle. Triangles with two equal angles are similar.', not: 'Çizim adımı: dik açı ve güneş açısı ortak. Açı–Açı benzerliğini hatırlatın.' },
  { bas: 29.7, son: 33.6, tr: 'Strateji: karşılıklı kenarların oranı eşit. h/50 = 1,7/2,5.', en: 'Strategy: matching sides keep the same ratio. h/50 = 1.7/2.5.', not: 'Renklere dikkat çekin: büyük üçgen mercan, küçük üçgen turkuaz.' },
  { bas: 33.7, son: 36.6, tr: 'Çözüm: h = 50 · 0,68 = 34 m.', en: 'Solution: h = 50 · 0.68 = 34 m.', not: 'Sonucu söylerken minarenin tepesi parlıyor; kısa bir es.' },
  { bas: 36.7, son: 40.6, tr: 'Tales de Mısır’da piramidin yüksekliğini böyle ölçmüştü: gölgesiyle.', en: 'Thales measured a pyramid’s height the same way: with its shadow.', not: 'Tarihî bağlamı tek cümleyle verin; 2 600 yıllık bir yöntem olduğunu vurgulayın.' },

  { bas: 41.2, son: 45.0, tr: 'Kontrol: bir saat sonra yeniden ölç. Güneş alçalır, gölgeler uzar.', en: 'Check: measure again an hour later. The sun drops, the shadows grow.', not: 'Kontrol adımı. “Sonuç değişir mi?” diye sorun, cevabı bekleyin.' },
  { bas: 45.1, son: 49.1, tr: 'Öğrencinin gölgesi 3,4 m, kulenin 68 m. Sonuç yine 34 m.', en: 'The student’s shadow is 3.4 m, the tower’s 68 m. Still 34 m.', not: 'Oran tablosunu birlikte doldurun: iki sütun, aynı sonuç.' },
  { bas: 49.2, son: 52.0, tr: 'Kısa yol: gölge boyun tam 2 katı, öyleyse h = 68 : 2.', en: 'Shortcut: the shadow is exactly twice the height, so h = 68 ÷ 2.', not: 'Kısa yolu öğrencilerin bulmasına fırsat verin.' },
  { bas: 52.1, son: 55.3, tr: 'Saatleri karıştırırsan oran bozulur: 25 m çıkar, yanlış.', en: 'Mix up the times and the ratio breaks: you get 25 m, which is wrong.', not: 'Çözüme ulaştırmayan stratejiyi tartıştırın: ölçümler neden aynı anda yapılmalı?' },

  { bas: 55.7, son: 59.4, tr: 'Güneş yoksa? Yere bir ayna koy, ağacın tepesini aynada gör.', en: 'No sun? Put a mirror on the ground and find the treetop in it.', not: 'Yeni bir problem, aynı döngü. Sınıfta küçük bir aynayla denenebilir.' },
  { bas: 59.5, son: 63.4, tr: 'Işık aynadan aynı açıyla yansır: geliş açısı = yansıma açısı.', en: 'Light bounces off at the same angle: angle in = angle out.', not: 'Fizik dersindeki yansıma kuralıyla bağ kurun.' },
  { bas: 63.5, son: 67.2, tr: 'Göz 1,5 m yükseklikte, aynaya 2 m; ayna ağaca 12 m.', en: 'Eyes at 1.5 m, 2 m from the mirror; the mirror is 12 m from the tree.', not: 'Verilenleri tek tek gösterin; istenen yine h.' },
  { bas: 67.3, son: 72.0, tr: 'h/12 = 1,5/2, yani h = 9 m. Küçük üçgen 6 kat büyüyünce tam oturur.', en: 'h/12 = 1.5/2, so h = 9 m. Scaled up 6 times, the small triangle fits exactly.', not: 'Yansıyıp büyüyen üçgen bir kontrol yoludur; “neden 6 kat?” diye sorun.' },

  { bas: 72.7, son: 76.4, tr: 'Şimdi bir nehrin genişliğini ölç. Ama karşıya geçemezsin.', en: 'Now measure the width of a river. But you can’t cross it.', not: 'Zorluk artıyor: bu kez uzunluk yatay ve ulaşılamaz.' },
  { bas: 76.5, son: 80.0, tr: 'Kamerayı yukarı kaldır: problem bir haritaya dönüşür.', en: 'Lift the camera up: the problem turns into a map.', not: 'Temsil değişiyor: yan görünüşten kuşbakışına. Bu dönüşümü vurgulayın.' },
  { bas: 80.1, son: 84.2, tr: 'Kıyıda 6 m, sonra 4 m yürü. Dön, ağaçla kazık hizalanana dek: 10 m.', en: 'Walk 6 m along the bank, then 4 m. Turn and walk until tree and stake line up: 10 m.', not: 'Kazıkların neden bu sırayla çakıldığını tartışın.' },
  { bas: 84.3, son: 88.2, tr: 'Sürpriz: küçük üçgeni kazık çevresinde çevir, 1,5 kat büyüt.', en: 'Surprise: spin the small triangle around the stake and scale it by 1.5.', not: '“Vay be” anı: iki üçgen tam üst üste oturuyor. Durun ve izletin.' },
  { bas: 88.3, son: 92.1, tr: 'x/10 = 6/4, yani x = 15 m. Kontrol: 15/6 = 10/4 = 2,5.', en: 'x/10 = 6/4, so x = 15 m. Check: 15/6 = 10/4 = 2.5.', not: 'İkinci oranla doğrulama yapıldığını belirtin.' },

  { bas: 92.7, son: 96.8, tr: 'Hangi yöntem ne zaman? Gölge güneş ister, ayna düz zemin ister.', en: 'Which method when? Shadows need sun; a mirror needs flat ground.', not: 'Stratejilerin hangi probleme uyduğunu öğrencilere sıralatın.' },
  { bas: 96.9, son: 101.0, tr: 'Kazık yatay uzaklıklar içindir. Fikir hep aynı: benzer üçgen kur.', en: 'Stakes are for horizontal distances. The idea never changes: build a similar triangle.', not: 'Ortak fikri yüksek sesle söyleyin; bu cümle filmin özüdür.' },

  { bas: 101.6, son: 105.8, tr: 'Aklında kalsın: benzerlik, dokunamadığın uzunluğu ölçer.', en: 'Remember: similarity measures the lengths you can’t touch.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 105.9, son: 110.6, tr: 'Adımları izle, kısa yolu ara, sonucu ikinci bir yolla doğrula.', en: 'Follow the steps, look for shortcuts, and check with a second method.', not: 'Problem çözme döngüsünü öğrencilere tekrar ettirin.' },
  { bas: 111.2, son: 116.6, tr: 'Şimdi sıra sende: benzer üçgenleri laboratuvarda kendin kur.', en: 'Your turn: build similar triangles yourself in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
