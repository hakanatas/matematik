/* Işık Aralıkları — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 3.6, tr: 'Gece 03:12. Bir aşı dolabı: 2 °C ile 8 °C arasında saklayın.', en: '3:12 a.m. A vaccine fridge: store between 2 °C and 8 °C.', not: 'Alçak ve sakin bir sesle, gece sessizliğinde başlayın.' },
  { bas: 3.7, son: 6.5, tr: 'Termometre bir sayı doğrusudur. İzin verilen bölge ışıkla yanar.', en: 'A thermometer is a number line. The allowed zone lights up.', not: '"Işıkla yanar" derken hüzme beliriyor; kısa bir es verin.' },
  { bas: 6.6, son: 9.1, tr: 'Sıcaklık 8 °C’ye çıktı. Tam sınırda.', en: 'The temperature hits 8 °C. Right on the edge.', not: 'Gerilim anı. Sınıfa sorun: "Aşılar çöpe mi gidecek?"' },
  { bas: 9.2, son: 12.0, tr: 'Sınırda olmak da içeride olmaktır.', en: 'Being on the edge still counts as being inside.', not: 'Cümleyi ağır ve net söyleyin; filmin ilk anahtar fikri.' },

  { bas: 18.5, son: 21.9, tr: 'Bu ışın, üç farklı dille yazılabilir.', en: 'This beam can be written in three different languages.', not: 'Paneller tek tek açılırken bekleyin.' },
  { bas: 22.0, son: 24.9, tr: 'Eşitsizlik, aralık, küme gösterimi: hepsi aynı ışın.', en: 'Inequality, interval, set-builder notation: all the same beam.', not: 'Üç yazılışı parmakla gösterir gibi tek tek okuyun.' },
  { bas: 25.0, son: 27.5, tr: 'Uçları boşalt: 2 ve 8 artık dahil değil.', en: 'Hollow out the ends: 2 and 8 are no longer included.', not: 'Uçlar boş halkaya dönerken parantezin değiştiğine dikkat çekin.' },
  { bas: 27.6, son: 30.1, tr: 'Yalnız sağ uç açık: [2, 8). Sol dahil, sağ değil.', en: 'Only the right end is open: [2, 8). Left in, right out.', not: 'Yarı açık aralık; öğrencilere "8 dahil mi?" diye sorun.' },
  { bas: 30.2, son: 32.8, tr: 'Sola sonsuza uzat: (−∞, 8]. ∞’un yanı hep açık.', en: 'Stretch it to minus infinity: (−∞, 8]. Infinity is always open.', not: 'Sonsuzun bir sayı olmadığını, bu yüzden "dahil" edilemeyeceğini vurgulayın.' },

  { bas: 32.9, son: 35.8, tr: 'Geçme notu 50 ile 100 arası, ikisi de dahil: [50, 100].', en: 'A passing grade is 50 to 100, both included: [50, 100].', not: '"50 alan geçer mi?" sorusuyla başlayın.' },
  { bas: 35.9, son: 38.7, tr: 'Ehliyet için en az 18 yaş. Üst sınır yok: [18, ∞).', en: 'A driving licence needs age 18 or more. No upper limit: [18, ∞).', not: 'Üst sınır olmadığında ne yazacağımızı sordurun.' },
  { bas: 38.8, son: 41.6, tr: 'Dondurucu −18 °C ve altında: (−∞, −18].', en: 'A freezer at −18 °C or colder: (−∞, −18].', not: 'Negatif uçlu bir ışın; sola doğru açılıyor.' },
  { bas: 41.7, son: 44.6, tr: 'Önce durumu oku, sonra sembolü seç: uç dahil mi, değil mi?', en: 'Read the situation first, then choose the symbol: is the end in or out?', not: 'Alt madde b: probleme uygun sembolü belirleme. Bir örnek de sınıftan isteyin.' },

  { bas: 44.8, son: 47.4, tr: 'İki ışın: A = [−2, 4) ve B = (1, 6].', en: 'Two beams: A = [−2, 4) and B = (1, 6].', not: 'Renkleri eşleyin: A turkuaz, B mercan.' },
  { bas: 47.5, son: 51.2, tr: 'Birleşim: iki ışığı topla. A ∪ B = [−2, 6].', en: 'Union: add the two lights. A ∪ B = [−2, 6].', not: 'Işınlar aşağı düşerken "en az birinde olan" tanımını söyleyin.' },
  { bas: 51.4, son: 55.8, tr: 'Kesişim: ışıkların üst üste geldiği yer. A ∩ B = (1, 4).', en: 'Intersection: where the lights overlap. A ∩ B = (1, 4).', not: 'Beyazlaşan bölgeyi gösterin. Uçların neden açık olduğunu sorun.' },
  { bas: 56.0, son: 60.6, tr: 'Fark: B’nin gölgesi A’yı keser. A \\ B = [−2, 1].', en: 'Difference: B’s shadow cuts A. A \\ B = [−2, 1].', not: '1 B’de yok, o yüzden A’dan atılmaz: uç kapalı. Burada durup gerekçeyi tartışın.' },
  { bas: 60.8, son: 65.2, tr: 'B \\ A = [4, 6]. 4, A’da yok; bu kez uç kapalı.', en: 'B \\ A = [4, 6]. 4 is not in A, so this end is closed.', not: 'Sıranın önemli olduğunu vurgulayın: A \\ B ile B \\ A farklı.' },
  { bas: 65.4, son: 68.8, tr: 'Tümleme: evrensel küme ℝ. A’nın dışındaki her şey ışık olur.', en: 'Complement: the universal set is ℝ. Everything outside A lights up.', not: 'Evrensel kümenin ℝ olduğunu açıkça söyleyin.' },
  { bas: 68.9, son: 71.9, tr: 'A′ = (−∞, −2) ∪ [4, ∞). Işığın negatifi.', en: 'A′ = (−∞, −2) ∪ [4, ∞). The negative of the light.', not: '−2 A’da olduğu için A′’de yok; 4 A’da olmadığı için A′’de var.' },

  { bas: 72.1, son: 75.2, tr: 'Şimdi bir projektör: merkezi 5’te, ışığı iki yana 3 birim.', en: 'Now a spotlight: centred at 5, shining 3 units each way.', not: 'Ses tonunu yükseltin; filmin sürpriz bölümü başlıyor.' },
  { bas: 75.3, son: 77.9, tr: '|x − 5| ≤ 3: 5’e uzaklığı en fazla 3 olan sayılar.', en: '|x − 5| ≤ 3: the numbers at most 3 away from 5.', not: 'Mutlak değeri "uzaklık" olarak okuyun.' },
  { bas: 78.0, son: 80.5, tr: 'Tanıdık mı? Aşı dolabının aralığı: [2, 8].', en: 'Look familiar? It is the vaccine fridge range: [2, 8].', not: '"Vay be" anı. Açılışa geri dönün, kısa bir es verin.' },
  { bas: 80.6, son: 83.1, tr: 'Eşitsizlik kesin olursa uçlar söner: (2, 8).', en: 'Make the inequality strict and the ends go dark: (2, 8).', not: '< ile ≤ arasındaki farkı uçlardan gösterin.' },
  { bas: 83.2, son: 86.6, tr: 'Fabrikada da aynı ışık: vida çapı 20 mm, tolerans 0,05 mm.', en: 'A factory uses the same light: a 20 mm screw, 0.05 mm tolerance.', not: 'Ekran yakınlaşıyor; ölçeğin yüzde bir milimetreye indiğini söyleyin.' },
  { bas: 86.7, son: 89.3, tr: '|d − 20| ≤ 0,05 demek, d ∈ [19,95; 20,05] demek.', en: '|d − 20| ≤ 0.05 means d ∈ [19.95, 20.05].', not: 'Türkçede ondalık virgül olduğu için aralıkta noktalı virgül kullanıldığını belirtin.' },
  { bas: 89.4, son: 92.8, tr: 'Işığın dışına düşen vida, hatalı üretimdir.', en: 'A screw that falls outside the light is a defect.', not: '19,93 ve 20,07 neden dışarıda? Uzaklıkları sordurun: 0,07 > 0,05.' },

  { bas: 93.6, son: 98.0, tr: 'Aklında kalsın: aralık, sayı doğrusunda kesintisiz bir ışıktır.', en: 'Remember: an interval is an unbroken beam on the number line.', not: 'Özet maddelerini sırayla okuyun.' },
  { bas: 98.1, son: 103.0, tr: 'Uçlar, işlemler, mutlak değer: hepsi ışığın dili.', en: 'Ends, operations, absolute value: all in the language of light.', not: 'Son maddede durup |x − m| ≤ r kalıbını tahtaya yazdırabilirsiniz.' },
  { bas: 104.0, son: 109.5, tr: 'Şimdi sıra sende: ışınları laboratuvarda kendin birleştir.', en: 'Your turn: combine the beams yourself in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
