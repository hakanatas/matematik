/* Kesişim Anı — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 3.6, tr: 'İki tarife. A: 100 TL + GB başı 20 TL. B: 220 TL + GB başı 5 TL.', en: 'Two plans. A: 100 lira + 20 per GB. B: 220 lira + 5 per GB.', not: 'Hızlı ve merak uyandıran bir giriş; iki kartı gösterin.' },
  { bas: 3.7, son: 6.9, tr: 'Hangisi ucuz? İki doğru yarışıyor.', en: 'Which is cheaper? Two lines are racing.', not: 'Sınıftan tahmin alın: "Kim kazanır?"' },
  { bas: 7.0, son: 10.3, tr: '8 GB’ta ikisi de 260 TL. İşte kesişim anı.', en: 'At 8 GB both cost 260 lira. That is the crossing point.', not: 'Flaşta durun; sonra "UCUZ" etiketinin yer değiştirdiğini gösterin.' },

  { bas: 18.1, son: 21.8, tr: 'Denklem, iki doğrunun buluştuğu andır: grafikten (8, 260).', en: 'An equation is the moment two lines meet: from the graph, (8, 260).', not: 'Önce grafikten okumayı yaptırın.' },
  { bas: 21.9, son: 25.8, tr: 'Cebirle: 100 + 20x = 220 + 5x. Buradan 15x = 120, x = 8.', en: 'Algebraically: 100 + 20x = 220 + 5x. So 15x = 120 and x = 8.', not: 'Adımları tahtada birlikte yazın.' },
  { bas: 25.9, son: 29.6, tr: 'Doğrula: A’da 100 + 160 = 260, B’de 220 + 40 = 260.', en: 'Check: for A, 100 + 160 = 260; for B, 220 + 40 = 260.', not: 'Yerine koyarak doğrulamanın neden önemli olduğunu sorun.' },
  { bas: 29.7, son: 33.0, tr: 'Üç yol, aynı cevap. f(x) = g(x), kesişimin x’idir.', en: 'Three methods, one answer. f(x) = g(x) is the x of the crossing.', not: 'Hangi stratejinin ne zaman daha kullanışlı olduğunu tartıştırın.' },

  { bas: 33.6, son: 37.2, tr: 'Eşitsizlik, bir doğrunun diğerinin altında kaldığı aralıktır.', en: 'An inequality is the stretch where one line stays below the other.', not: 'Tarama çizgisini izletin: renk 8’de değişiyor.' },
  { bas: 37.3, son: 41.0, tr: '100 + 20x < 220 + 5x ⇒ x < 8. Ama GB eksi olamaz.', en: '100 + 20x < 220 + 5x ⇒ x < 8. But GB cannot be negative.', not: 'Bağlamın tanım kümesini kısıttığını vurgulayın.' },
  { bas: 41.1, son: 44.4, tr: 'Çözüm kümesi [0, 8): 8 dahil değil, orada ikisi eşit.', en: 'The solution set is [0, 8): 8 is excluded, there they are equal.', not: 'Açık ve kapalı uçları sordurun.' },
  { bas: 44.5, son: 47.1, tr: 'Ayda 8 GB’tan az kullanıyorsan A, fazlaysa B.', en: 'Use less than 8 GB a month: A. More: B.', not: 'Öğrencilere kendi kullanımlarını sorun.' },

  { bas: 47.6, son: 51.2, tr: 'Ya öbür doğru x ekseninin kendisiyse? g(x) = 0.', en: 'What if the other line is the x-axis itself? g(x) = 0.', not: 'Doğru dönerken kesişim noktasının kaydığını gösterin.' },
  { bas: 51.3, son: 54.8, tr: 'f(x) < 0 da bir kesişim sorusu: 2x − 6 < 0 ⇒ x < 3.', en: 'f(x) < 0 is also a crossing question: 2x − 6 < 0 ⇒ x < 3.', not: '9.2.1’deki işaret tablosuna bağlayın.' },
  { bas: 54.9, son: 58.3, tr: 'Doğrunun eksenin altında kaldığı x’ler: (−∞, 3).', en: 'The x values where the line is below the axis: (−∞, 3).', not: 'Aralığın neden sola sonsuza gittiğini sorun.' },

  { bas: 58.8, son: 62.4, tr: 'Termostat 20 °C’ye ayarlı, 2 derece sapmaya izin veriyor.', en: 'The thermostat is set to 20 °C and allows a 2-degree drift.', not: 'Günlük hayattan başka tolerans örnekleri isteyin.' },
  { bas: 62.5, son: 66.2, tr: 'Sıcaklığın 20’ye uzaklığı |x − 20|. Bu V, 2’nin altında kalmalı.', en: 'The distance from 20 is |x − 20|. This V must stay below 2.', not: '9.2.2’deki katlanmış doğruyu hatırlatın.' },
  { bas: 66.3, son: 69.8, tr: 'V, y = 2 doğrusunu iki yerde keser: 18 ve 22.', en: 'The V meets the line y = 2 at two points: 18 and 22.', not: '|x − 20| = 2 denkleminin neden iki çözümü olduğunu sorun.' },
  { bas: 69.9, son: 72.4, tr: 'Çözüm bandı: 18 ≤ x ≤ 22.', en: 'The solution band: 18 ≤ x ≤ 22.', not: 'Kısa ve net; uçlar dahil.' },

  { bas: 72.8, son: 76.4, tr: 'Son sürpriz: piyasa. Talep p = 100 − 2q, arz p = 20 + 2q.', en: 'A final surprise: the market. Demand p = 100 − 2q, supply p = 20 + 2q.', not: 'Ekonomi bağlantısını kurun: fiyat artınca talep düşer, arz artar.' },
  { bas: 76.5, son: 80.2, tr: 'Fiyat 80 olsun: üretilen 30, istenen 10. Arz fazlası 20.', en: 'Let the price be 80: 30 produced, 10 wanted. A surplus of 20.', not: 'Sayıları denklemlere koyarak kontrol ettirin.' },
  { bas: 80.3, son: 83.8, tr: 'Fiyat düşer, fazla düşer: bu kez talep fazlası.', en: 'The price drops, too far: now there is a shortage.', not: 'Salınımı izletin; renklerin yer değiştirmesine dikkat.' },
  { bas: 83.9, son: 87.4, tr: 'Salınım söner, fiyat kesişime oturur: q = 20, p = 60.', en: 'The swings die out and the price settles at the crossing: q = 20, p = 60.', not: '"Vay be" anı: piyasa denklemi kendi çözüyor.' },
  { bas: 87.5, son: 90.2, tr: 'Denge fiyatı, iki doğrunun kesişim anıdır.', en: 'The equilibrium price is the crossing point of two lines.', not: 'Filmin başlığına geri bağlayın.' },

  { bas: 90.6, son: 95.2, tr: 'Aklında kalsın: denklem kesişim, eşitsizlik altta kalan aralık.', en: 'Remember: an equation is a crossing, an inequality a stretch below.', not: 'Özet maddelerini tek tek okuyun.' },
  { bas: 95.3, son: 100.2, tr: 'Mutlak değer bir bant çizer; çözümü hep başka yolla doğrula.', en: 'Absolute value draws a band; always check your answer another way.', not: 'Her maddede kısa bir es verin.' },
  { bas: 100.8, son: 106.4, tr: 'Şimdi sıra sende: laboratuvarda iki doğruyu kendin yarıştır.', en: 'Your turn: race two lines yourself in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
