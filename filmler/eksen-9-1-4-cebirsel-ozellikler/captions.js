/* Aynı Alan, İki Yazılış — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.3, son: 2.9, tr: 'Akıldan hesapla: 51 çarpı 49.', en: 'Work it out in your head: 51 times 49.', not: 'Sınıfa gerçekten süre verin; kronometre işliyor.' },
  { bas: 3.0, son: 5.6, tr: 'Bir saniyeden kısa sürede: 2499. Nasıl?', en: 'In under a second: 2499. How?', not: '"Nasıl?" sorusunda durun, birkaç tahmin alın.' },
  { bas: 5.7, son: 8.3, tr: 'Hile yok: 50 kare eksi 1 kare.', en: 'No trick: 50 squared minus 1 squared.', not: 'Henüz açıklamayın; merak bırakın.' },
  { bas: 8.4, son: 11.2, tr: 'Cevap, bir şeklin alanında saklı.', en: 'The answer is hidden in the area of a shape.', not: 'Kamera ızgaraya dalarken sesi alçaltın.' },

  { bas: 18.5, son: 21.5, tr: '3’e 5’lik bir dikdörtgen: 15 birim kare. Şimdi döndür.', en: 'A 3 by 5 rectangle: 15 unit squares. Now rotate it.', not: 'Kareleri birlikte saydırabilirsiniz.' },
  { bas: 21.6, son: 24.3, tr: 'Alan değişmedi: a · b = b · a. Değişme özelliği.', en: 'The area did not change: a · b = b · a. Commutativity.', not: '∀ sembolünü "her a, b gerçek sayısı için" diye okuyun.' },
  { bas: 24.4, son: 27.9, tr: 'Toplamada gruplama önemsiz: (a + b) + c = a + (b + c).', en: 'In addition, grouping does not matter: (a + b) + c = a + (b + c).', not: 'Birleşme özelliği; parantezin yer değiştirdiğini gösterin.' },

  { bas: 28.1, son: 31.4, tr: 'Yüksekliği 1’e indir: alan a’nın kendisi. 1 etkisiz elemandır.', en: 'Shrink the height to 1: the area is a itself. 1 is the identity.', not: '"Birim eleman" ve "etkisiz eleman" aynı şeydir; ikisini de söyleyin.' },
  { bas: 31.5, son: 34.4, tr: 'Yüksekliği 0 yap: alan çöker. 0 yutan elemandır.', en: 'Make the height 0: the area collapses. 0 is the absorbing element.', not: 'Çöküş anında kısa bir es.' },
  { bas: 34.5, son: 37.4, tr: 'Sıfırdan farklı her a için a · b = 1 olacak bir b vardır.', en: 'For every nonzero a, there is a b with a · b = 1.', not: '∀ ve ∃ sembollerini okuyun: "her" ve "vardır".' },
  { bas: 37.5, son: 40.4, tr: '4 ince şerit, tek bir birim kare: 4 · 1/4 = 1.', en: 'Four thin strips make one unit square: 4 · 1/4 = 1.', not: 'Şeritlerin üst üste dizilmesini izletin; ters eleman 1/a.' },

  { bas: 40.5, son: 43.0, tr: 'Dikdörtgeni ikiye böl: a(b + c).', en: 'Split the rectangle in two: a(b + c).', not: 'Kesim çizgisine dikkat çekin.' },
  { bas: 43.1, son: 45.8, tr: 'Parçaların toplamı: ab + ac. Dağılma özelliği.', en: 'The parts add up: ab + ac. The distributive property.', not: 'Aynı alanın iki yazılışı: bir çarpım, bir toplam.' },
  { bas: 45.9, son: 49.0, tr: 'Akıldan 7 · 98? 7 · 100’den ince bir şerit kes.', en: '7 · 98 in your head? Cut a thin strip off 7 · 100.', not: 'Önce öğrencilerin denemesine izin verin.' },
  { bas: 49.1, son: 52.4, tr: '700 − 14 = 686. Bölmek, hesabı kolaylaştırır.', en: '700 − 14 = 686. Splitting makes the sum easy.', not: 'Dağılmanın çıkarmada da çalıştığını vurgulayın.' },

  { bas: 52.7, son: 55.6, tr: 'Kenarı a + b olan kareyi iki çizgiyle kes.', en: 'Cut the square of side a + b with two lines.', not: 'Kesim çizgileri belirirken yavaşlayın.' },
  { bas: 55.7, son: 58.2, tr: 'Dört parça: a², iki tane ab ve b².', en: 'Four pieces: a², two copies of ab, and b².', not: '"İki tane ab" kısmını vurgulayın; en sık yapılan hata burada.' },
  { bas: 58.3, son: 61.0, tr: 'Ya (a − b)²? Büyük kareden iki şerit çıkar.', en: 'What about (a − b)²? Remove two strips from the big square.', not: 'Öğrencilere tahmin ettirin: sonuç a² − b² mi?' },
  { bas: 61.1, son: 64.3, tr: 'Köşe iki kez çıktı; bir kez geri ekle: + b².', en: 'The corner was removed twice; add it back once: + b².', not: 'Köşenin parladığı anda durun.' },

  { bas: 64.5, son: 67.4, tr: 'Şimdi a² karesinden b² karesini kes.', en: 'Now cut the square b² out of the square a².', not: 'Sürpriz bölüm; sesi biraz yükseltin.' },
  { bas: 67.5, son: 70.4, tr: 'Kalan L şeklini ikiye ayır, bir parçayı döndür…', en: 'Split the leftover L shape, rotate one piece…', not: 'Hareket boyunca sessiz kalabilirsiniz.' },
  { bas: 70.5, son: 73.9, tr: '…ve kaydır. Yeni dikdörtgen: (a + b) çarpı (a − b).', en: '…and slide it. A new rectangle: (a + b) times (a − b).', not: 'Kenar uzunluklarını tek tek gösterin.' },
  { bas: 74.0, son: 76.8, tr: 'Açılıştaki soru: 51 · 49 = (50 + 1)(50 − 1).', en: 'The opening question: 51 · 49 = (50 + 1)(50 − 1).', not: '"Vay be" anı. Açılışa geri dönün.' },
  { bas: 76.9, son: 79.6, tr: '= 50² − 1² = 2499. Hesap değil, geometri.', en: '= 50² − 1² = 2499. Not arithmetic: geometry.', not: 'Sınıfa yeni bir örnek verin: 31 · 29 = ?' },
  { bas: 79.7, son: 82.4, tr: 'Aynı alan, iki yazılış.', en: 'Same area, two spellings.', not: 'Filmin adı; ağır ve net söyleyin.' },

  { bas: 82.7, son: 85.6, tr: 'x² + 5x + 6: bir kare, beş şerit, altı birim kare.', en: 'x² + 5x + 6: one square, five strips, six unit squares.', not: 'Parçaları sayın.' },
  { bas: 85.7, son: 88.4, tr: 'Parçaları tek bir dikdörtgene diz.', en: 'Arrange the pieces into a single rectangle.', not: 'Önce öğrencilere sorun: nasıl dizilir?' },
  { bas: 88.5, son: 91.8, tr: 'Kenarlar x + 2 ve x + 3. Çarpanlara ayırmak budur.', en: 'The sides are x + 2 and x + 3. That is factorising.', not: 'Çarpanlara ayırmanın dağılmanın tersi olduğunu söyleyin.' },
  { bas: 91.9, son: 94.6, tr: 'Alan sıfırsa, kenarlardan en az biri sıfırdır.', en: 'If the area is zero, at least one side is zero.', not: '"veya" bağlacının "en az biri" demek olduğunu vurgulayın.' },
  { bas: 94.7, son: 97.2, tr: 'Çarpım sıfır değilse, iki çarpan da sıfırdan farklıdır.', en: 'If the product is not zero, both factors are nonzero.', not: '"ve" bağlacına dikkat: değil alınca "veya", "ve" olur.' },
  { bas: 97.3, son: 99.8, tr: 'Semboller: ∀ her, ∃ bazı, ∧ ve, ∨ veya, ⇔ ancak ve ancak.', en: 'Symbols: ∀ for all, ∃ some, ∧ and, ∨ or, ⇔ if and only if.', not: 'Sembolleri sınıfla birlikte okuyun.' },

  { bas: 99.9, son: 104.6, tr: 'Aklında kalsın: işlem özellikleri, alanın korunmasıdır.', en: 'Remember: the rules of arithmetic are conservation of area.', not: 'Özet maddelerini sırayla okuyun.' },
  { bas: 104.7, son: 109.4, tr: 'Döndür, böl, kes, kaydır: alan aynı, yazılış farklı.', en: 'Rotate, split, cut, slide: same area, different spelling.', not: 'Son cümlede kısa bir es verin.' },
  { bas: 110.2, son: 115.7, tr: 'Şimdi sıra sende: laboratuvarda kendi dikdörtgenlerini kes ve kaydır.', en: 'Your turn: cut and slide your own rectangles in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
