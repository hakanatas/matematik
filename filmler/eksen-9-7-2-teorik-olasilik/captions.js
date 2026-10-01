/* Yedinin Köşegeni — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.5, son: 2.9, tr: 'Tavla masası. Zarlar dönüyor... 4 ve 3: yine 7.', en: 'A backgammon board. The dice spin... 4 and 3: a 7 again.', not: 'Sakin başlayın; zarlar durana kadar susun.' },
  { bas: 3.0, son: 5.4, tr: 'Oyuncular bilir: en sık gelen toplam 7. Ama neden?', en: 'Players know: the most common sum is 7. But why?', not: 'Soruyu sınıfa yöneltin, tahminleri alın.' },
  { bas: 5.5, son: 8.0, tr: 'İki zarın bütün sonuçlarını yan yana koyalım: 36 tane.', en: 'Let’s lay out every outcome of two dice side by side: 36 of them.', not: 'Zarlar ızgaraya yerleşirken "36" sayısını vurgulayın.' },
  { bas: 8.1, son: 11.6, tr: 'Her köşegen bir toplam. En uzunu 7’nin köşegeni.', en: 'Each diagonal is one sum. The longest is the diagonal of 7.', not: 'Filmin adı bu cümlede; köşegen parlarken durun.' },

  { bas: 19.6, son: 23.2, tr: 'Önce sistemli say: birinci zar 1 iken ikinci zar 1’den 6’ya.', en: 'First, count systematically: first die 1, second die from 1 to 6.', not: 'Sistematik listenin hiçbir çıktıyı atlamamayı sağladığını söyleyin.' },
  { bas: 23.3, son: 26.8, tr: '36 çıktı, hepsi eş olasılıklı. (1, 2) ile (2, 1) ayrı çıktılardır.', en: '36 outcomes, all equally likely. (1, 2) and (2, 1) are different outcomes.', not: 'İki zarın farklı renkte olması bu ayrımı görünür kılar.' },
  { bas: 26.9, son: 31.4, tr: 'Aynı liste bir tabloya dönüşür: satır birinci zar, sütun ikinci.', en: 'The same list becomes a table: rows for the first die, columns for the second.', not: 'Tablo hücrelerindeki sayıların toplam olduğunu belirtin.' },
  { bas: 31.5, son: 35.3, tr: 'Üç kez para atınca? Ağaç şeması her dalı ikiye ayırır.', en: 'What about tossing a coin three times? A tree diagram splits every branch in two.', not: 'Y = yazı, T = tura. Dallar çizilirken ritmi takip edin.' },
  { bas: 35.4, son: 38.6, tr: '2 · 2 · 2 = 8 yaprak. Tam 2 tura: YTT, TYT, TTY.', en: '2 · 2 · 2 = 8 leaves. Exactly 2 tails: HTT, THT, TTH.', not: 'İngilizcede yazı = heads (H), tura = tails (T).' },
  { bas: 38.7, son: 41.2, tr: 'Yani P(tam 2 tura) = 3/8.', en: 'So P(exactly 2 tails) = 3/8.', not: 'Hangi gösterimin hangi deneye uygun olduğunu tartıştırın.' },
  { bas: 41.3, son: 44.0, tr: '9. yüzyılda el-Kindî, şifre çözmek için harflerin sıklığını saydı.', en: 'In the 9th century, al-Kindi counted letter frequencies to break codes.', not: 'Program, el-Kindî’yi ağaç şeması kullanan bilim insanları arasında anar; istatistik ve olasılığa katkısını kısaca anlatın.' },

  { bas: 44.3, son: 47.2, tr: 'Teorik olasılık: olaya ait çıktılar bölü tüm çıktılar.', en: 'Theoretical probability: favourable outcomes over all outcomes.', not: 'Çıktıların eş olasılıklı olması şartını vurgulayın.' },
  { bas: 47.3, son: 50.0, tr: 'Toplam 7: köşegende 6 hücre. 6/36 = 1/6.', en: 'A sum of 7: 6 cells on the diagonal. 6/36 = 1/6.', not: 'Hücreler tek tek parlarken sesli sayın.' },
  { bas: 50.1, son: 52.6, tr: 'Toplam 2 ise tek hücre: 1/36.', en: 'A sum of 2 is a single cell: 1/36.', not: 'Köşedeki hücreyi gösterin: yalnızca (1, 1).' },
  { bas: 52.7, son: 56.2, tr: '7 gelmeme olasılığı 30/36 = 5/6. İkisinin toplamı 1.', en: 'The probability of not rolling 7 is 30/36 = 5/6. Together they make 1.', not: 'Tümleyen olayı hatırlatın: P(A) + P(A′) = 1.' },
  { bas: 56.3, son: 59.6, tr: 'Şimdi ızgarayı 45° döndür ve hücreleri serbest bırak.', en: 'Now rotate the grid by 45° and let the cells drop.', not: 'Sürpriz anı: dönüş boyunca konuşmayın.' },
  { bas: 59.7, son: 63.3, tr: 'Bu üçgeni tanıyor musun? 10 000 atışın şekli buydu.', en: 'Recognise this triangle? It was the shape of 10,000 rolls.', not: '9.7.1 filmindeki parçacık yağmuruna bağlayın.' },

  { bas: 63.8, son: 67.2, tr: 'A: toplam 7. B: toplam 11. Ortak hücreleri var mı?', en: 'A: a sum of 7. B: a sum of 11. Do they share any cells?', not: 'Cevabı öğrencilere buldurun.' },
  { bas: 67.3, son: 70.9, tr: 'Yok: ayrık olaylar. Olasılıklar doğrudan toplanır: 8/36.', en: 'No: disjoint events. Their probabilities simply add: 8/36.', not: '"Ayrık" kavramını kesişimin boş olmasıyla ilişkilendirin.' },
  { bas: 71.0, son: 74.6, tr: 'Şimdi A: en az bir zar 6. B: toplam en az 10.', en: 'Now A: at least one die is 6. B: the sum is at least 10.', not: 'Önce A’nın 11 hücresini, sonra B’nin 6 hücresini saydırın.' },
  { bas: 74.7, son: 78.2, tr: 'Beş hücre iki renkte: iki kez sayıldı. Bir kez çıkar.', en: 'Five cells carry both colours: counted twice. Subtract them once.', not: 'Çift renkli hücreler parlarken durun; "−1" görüntüsünü bekleyin.' },
  { bas: 78.3, son: 82.3, tr: '12/36 = 1/3. Kural: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).', en: '12/36 = 1/3. The rule: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).', not: 'Kuralı tahtaya yazdırın; ayrık olaylarda son terimin 0 olduğunu söyleyin.' },

  { bas: 82.7, son: 86.0, tr: 'Teori bir tahmin yapar. Deney ne diyor? Önce 36 atış.', en: 'Theory makes a prediction. What does experiment say? First, 36 rolls.', not: 'Kesikli kutular teorik değerler; turkuaz çubuklar deney.' },
  { bas: 86.1, son: 88.6, tr: '36 atışta toplam 7 yalnızca bir kez geldi. Çubuklar dağınık.', en: 'In 36 rolls, a sum of 7 came up only once. The bars are scattered.', not: '"Teori yanlış mı?" diye sorun.' },
  { bas: 88.7, son: 91.6, tr: 'Atışlar sürüyor: çubuklar kesikli hayaletlere doğru yükseliyor.', en: 'The rolls go on: the bars rise toward the dashed ghosts.', not: 'Değişkenliğin azaldığını gösterin.' },
  { bas: 91.7, son: 94.6, tr: '3600, sonra 36 000 atış: sapmalar küçülüyor.', en: '3,600, then 36,000 rolls: the gaps shrink.', not: 'Çubuk tepelerinin sarıya döndüğü anlara dikkat çekin.' },
  { bas: 94.7, son: 97.8, tr: '36 000 atışta çubuklar teorik basamaklara oturdu.', en: 'At 36,000 rolls the bars settle onto the theoretical steps.', not: 'Paneldeki deneysel ve teorik P(7) değerlerini karşılaştırın.' },
  { bas: 97.9, son: 100.8, tr: 'Deneysel olasılık, deneme arttıkça teorik olasılığa yaklaşır.', en: 'As trials increase, experimental probability approaches theoretical probability.', not: 'Genellemeyi öğrencilerin kendi cümlesiyle kurdurun.' },

  { bas: 101.5, son: 106.1, tr: 'Aklında kalsın: teorik olasılık, örnek uzayı saymaktır.', en: 'Remember: theoretical probability means counting the sample space.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 106.2, son: 110.9, tr: 'Ve deneme arttıkça deney, teoriye yaklaşır.', en: 'And as trials increase, experiment approaches theory.', not: 'Filmin adını hatırlatın: yedinin köşegeni.' },
  { bas: 111.7, son: 117.1, tr: 'Şimdi sen dene: Olasılık Laboratuvarı’nda iki zarı binlerce kez at.', en: 'Now you try: roll two dice thousands of times in the Probability Lab.', not: 'Karekodu gösterin; laboratuvarı ödev olarak verebilirsiniz.' },
];
