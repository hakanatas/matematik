/* Haritadan Çizgeye — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.6, son: 3.8, tr: 'Königsberg, 1736. Bir nehir şehri dört kara parçasına bölüyor.', en: 'Königsberg, 1736. A river splits the city into four pieces of land.', not: 'Belgesel tonunda, sakin başlayın. Harita ışıkla çiziliyor.' },
  { bas: 3.9, son: 7.4, tr: 'Yedi köprü var. Her köprüden tam bir kez geçen bir yürüyüş mümkün mü?', en: 'There are seven bridges. Can you walk across each one exactly once?', not: 'Soruyu sorun; öğrencilerin tahta üzerinde denemesine izin verebilirsiniz.' },
  { bas: 7.5, son: 10.8, tr: 'Denedikçe hep bir köprü artıyor. Şans mı, yoksa bir sebebi mi var?', en: 'Every attempt leaves one bridge over. Bad luck, or is there a reason?', not: 'Kalan köprü kırmızı yanıp sönüyor; merak uyandırın, cevabı vermeyin.' },

  { bas: 18.8, son: 22.6, tr: 'Euler bir şey fark etti: köprülerin uzunluğu, sokakların şekli önemsiz.', en: 'Euler noticed something: bridge lengths and street shapes don’t matter.', not: 'Problemdeki işe yarayan ve yaramayan bilgileri ayırmanın önemini vurgulayın.' },
  { bas: 22.7, son: 26.4, tr: 'Kara parçalarını noktaya, köprüleri çizgiye çevir.', en: 'Turn each piece of land into a point and each bridge into a line.', not: 'Sürpriz an: harita bulanıklaşıp çizgeye dönüşüyor. Konuşmayı kısa tutun, izletin.' },
  { bas: 26.5, son: 30.2, tr: 'Bu temsile çizge denir: noktalar düğüm, çizgiler ayrıt.', en: 'This representation is called a graph: points are nodes, lines are edges.', not: '“Düğüm” ve “ayrıt” terimlerini tahtaya yazın.' },
  { bas: 30.3, son: 34.2, tr: 'Harita gitti, problem kaldı: 4 düğüm, 7 ayrıt. Yürüyüş yine takılır.', en: 'The map is gone, the problem remains: 4 nodes, 7 edges. The walk still gets stuck.', not: 'Aynı yürüyüşün çizgede de başarısız olduğunu gösterin: temsil problemi değiştirmedi.' },

  { bas: 34.7, son: 38.6, tr: 'Bir düğümden geçen yol, bir ayrıtla girer, başka bir ayrıtla çıkar.', en: 'A path through a node comes in on one edge and leaves on another.', not: 'Işık noktası D’ye girip çıkıyor; “gir” ve “çık” sözcüklerini vurgulayın.' },
  { bas: 38.7, son: 42.3, tr: 'Ayrıtlar çift çift harcanır. Tek kalan ayrıt seni orada bırakır.', en: 'Edges are used up in pairs. A leftover edge leaves you stranded.', not: 'Neden çift? Sınıfa sorun ve birkaç cevap alın.' },
  { bas: 42.4, son: 46.0, tr: 'Bir düğüme değen ayrıt sayısına derece denir. A: 5; B, C, D: 3.', en: 'The number of edges touching a node is its degree. A: 5; B, C, D: 3.', not: 'Dereceleri öğrencilere saydırın, sonra ekranla karşılaştırın.' },

  { bas: 46.7, son: 50.4, tr: '“Algoritma” sözcüğü, 9. yüzyıl matematikçisi Harizmi’nin adından gelir.', en: 'The word “algorithm” comes from the name of al-Khwarizmi, a 9th-century mathematician.', not: 'Kültürel mirasa kısa bir değinme; sözcüğün kökenini sorabilirsiniz.' },
  { bas: 50.5, son: 54.4, tr: 'Fikri adım adım yaz: her düğümün derecesini say, tek olanları say.', en: 'Write the idea step by step: find each degree, count the odd ones.', not: 'Sözde kodu satır satır okuyun; mono yazı bir programın satırları gibi.' },
  { bas: 54.5, son: 58.4, tr: 'Königsberg’de dört düğümün dördü de tek. Sayaç: 4.', en: 'In Königsberg, all four nodes are odd. Counter: 4.', not: 'Değişken izleme satırına dikkat çekin: v, d ve sayaç nasıl değişiyor?' },
  { bas: 58.5, son: 62.2, tr: 'Tek düğüm yoksa döngü, iki tane ise yol var. Dört ise: imkânsız.', en: 'No odd nodes: a loop. Two: a path. Four: impossible.', not: 'Damga anında durun. 1736’daki sorunun cevabı bu.' },

  { bas: 62.7, son: 66.6, tr: 'Algoritmayı test et: girdi ver, çıktıyı tabloya yaz.', en: 'Test the algorithm: give it an input, write the output in a table.', not: 'Algoritma testi: tablo, sonucu kontrol etmenin yoludur.' },
  { bas: 66.7, son: 70.6, tr: 'Zarfta iki tek düğüm var: yol var, ama tek düğümden başlamalısın.', en: 'The envelope has two odd nodes: a path exists, but start at an odd node.', not: 'Öğrencilere zarfı kâğıtta kalem kaldırmadan çizdirin.' },
  { bas: 70.7, son: 73.6, tr: 'Kalemi kaldırmadan çiz: başla… ve öteki tek düğümde bitir.', en: 'Draw without lifting your pen: start… and finish at the other odd node.', not: 'Çizim bitince kısa bir es verin.' },
  { bas: 73.7, son: 76.2, tr: 'Papyonda tek düğüm yok: başladığın yere dönersin.', en: 'The bow tie has no odd nodes: you end where you began.', not: 'Döngü ile yol arasındaki farkı sorun.' },

  { bas: 76.7, son: 80.8, tr: 'Aynı algoritma şehirde: çöp kamyonu her sokaktan bir kez geçsin.', en: 'The same algorithm in the city: a garbage truck should drive each street once.', not: 'Gerçek hayat bağlantısı: belediyeler rota planlamada çizge kullanır.' },
  { bas: 80.9, son: 83.5, tr: 'İki tek kavşak var: kamyon birinden başlar, ötekinde biter.', en: 'There are two odd junctions: the truck starts at one and ends at the other.', not: 'Algoritmanın çıktısını gerçek bir karara çevirdiğimizi vurgulayın.' },
  { bas: 83.6, son: 86.2, tr: 'Tekrar yok: daha az yakıt, daha temiz hava.', en: 'No repeats: less fuel, cleaner air.', not: 'Çevre bilinciyle bağ kurun.' },

  { bas: 86.7, son: 90.4, tr: 'Algoritma bir stratejidir. 1 ile 1000 arasında bir sayı tuttum.', en: 'An algorithm is a strategy. I’m thinking of a number from 1 to 1000.', not: 'Sınıfta oynayın: biri sayı tutsun, diğerleri evet/hayır sorusu sorsun.' },
  { bas: 90.5, son: 94.4, tr: 'Tek tek sorarsan 737 soru. Her seferinde aralığı ikiye böl.', en: 'Asking one by one takes 737 questions. Halve the range every time.', not: 'Çözüme ulaştıran ama verimsiz stratejiyle karşılaştırın.' },
  { bas: 94.5, son: 97.4, tr: 'Her cevap aralığın yarısını eler.', en: 'Each answer throws away half of the range.', not: 'Yakın plan doğrusunun her adımda yeniden ölçeklendiğine dikkat çekin.' },
  { bas: 97.5, son: 100.2, tr: '10 soru yeter, çünkü 2¹⁰ = 1024, yani 1000’den büyük.', en: 'Ten questions are enough, because 2¹⁰ = 1024, which is more than 1000.', not: 'Strateji karşılaştırması: 737’ye karşı 10.' },

  { bas: 100.6, son: 105.2, tr: 'Aklında kalsın: önce temsil et, sonra adım adım çöz.', en: 'Remember: represent first, then solve step by step.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 105.3, son: 110.0, tr: 'Algoritmanı test et ve en kısa stratejiyi ara.', en: 'Test your algorithm and look for the shortest strategy.', not: 'Hangi problemler algoritmayla çözülebilir? Kısa bir tartışma.' },
  { bas: 110.8, son: 116.0, tr: 'Şimdi sıra sende: laboratuvarda çizge çiz, Euler yolunu ara.', en: 'Your turn: draw a graph in the lab and hunt for an Euler path.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
