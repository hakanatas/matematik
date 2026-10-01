/* Kırkıncı Adım — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 3.4, tr: 'Bir döngü: n’yi 0’dan başlat, n² + n + 41’i hesapla.', en: 'A loop: start n at 0 and compute n² + n + 41.', not: 'Sakin başlayın; sözde kodu satır satır gösterin.' },
  { bas: 3.5, son: 6.6, tr: 'Asal mı? Evet. Sonraki: 43, 47, 53… hepsi asal.', en: 'Prime? Yes. Next: 43, 47, 53… all prime.', not: 'Her yeni karede sınıfla birlikte "asal" deyin; ritim kurun.' },
  { bas: 6.7, son: 9.3, tr: 'Döngü hızlanır: tam 40 kez art arda asal.', en: 'The loop speeds up: 40 primes in a row.', not: 'Sesinizi hızlandırın; sayaç 40’a ulaşınca durun.' },
  { bas: 9.4, son: 11.9, tr: 'Her n için asal mı?', en: 'Is it prime for every n?', not: 'Soruyu sorun ve oylama yapın: kaç kişi "evet" diyor?' },

  { bas: 19.4, son: 23.2, tr: 'n = 40: 40² + 40 + 41 = 1681. Döngü bölen arar…', en: 'n = 40: 40² + 40 + 41 = 1681. The loop searches for a divisor…', not: 'Bölenler hızla geçerken gerilimi artırın.' },
  { bas: 23.3, son: 27.6, tr: '41 böler. 1681 asal değil; döngü kırkıncı adımda durur.', en: '41 divides it. 1681 is not prime; the loop stops at step forty.', not: '"Durur" sözcüğünde kısa bir es. Kırmızı hücreyi gösterin.' },
  { bas: 27.7, son: 31.6, tr: '1681 ışık, 41’e 41’lik bir kare olur: 1681 = 41².', en: '1681 lights form a 41 by 41 square: 1681 = 41².', not: 'Parçacıklar dizilirken susun; kare tamamlanınca "vay" anını bekleyin.' },
  { bas: 31.7, son: 35.0, tr: 'Kırk kez doğru olmak, her zaman doğru olmak değildir.', en: 'Being right forty times is not being right every time.', not: 'Filmin ana cümlesi. Yavaş ve vurgulu okuyun.' },
  { bas: 35.1, son: 38.6, tr: 'Tek bir karşıt örnek, “her n için” sözünü yıkar.', en: 'A single counterexample breaks the claim “for every n”.', not: 'n = 40’ın neden kolay bulunduğunu sorun: 40² + 40 = 40 · 41.' },

  { bas: 39.0, son: 42.8, tr: 'Peki “her tek sayının karesi tektir” doğru mu?', en: 'So is “the square of every odd number is odd” true?', not: 'Öğrencilerden birkaç örnek deneyip söylemelerini isteyin.' },
  { bas: 42.9, son: 47.0, tr: 'Döngü kontrol eder, eder… ama tek sayılar bitmez.', en: 'The loop checks and checks… but odd numbers never run out.', not: 'Sayılar tünelden akarken "ne zaman biter?" diye sorun.' },
  { bas: 47.1, son: 51.4, tr: 'Cebir tek hamlede yapar: n = 2k + 1 ise n² = 4k² + 4k + 1.', en: 'Algebra does it in one move: if n = 2k + 1, then n² = 4k² + 4k + 1.', not: 'Tek sayının 2k + 1 yazılışını tahtada da gösterin.' },
  { bas: 51.5, son: 55.0, tr: 'Noktalar ikişer eşleşir, hep bir tane artar: n² tektir.', en: 'The dots pair up and one is always left over: n² is odd.', not: 'Köşedeki tek noktayı gösterin; bu "+1"dir.' },
  { bas: 55.1, son: 58.2, tr: '“Her” için ispat gerekir; “bazı” için bir örnek yeter.', en: '“Every” needs a proof; “some” needs just one example.', not: '∀ ve ∃ sembollerini adlarıyla okuyun: her, en az bir.' },

  { bas: 58.5, son: 62.0, tr: 'Aynı önerme, üç dil: sözel, sembolik, algoritmik.', en: 'One statement, three languages: verbal, symbolic, algorithmic.', not: 'Üç satırı tek tek gösterin; hangisinin daha kısa olduğunu sorun.' },
  { bas: 62.1, son: 65.6, tr: 'Sembolik dil en kısası ve en kesini.', en: 'Symbolic language is the shortest and the most precise.', not: 'Yalınlık ve kesinlik sözcüklerini vurgulayın.' },
  { bas: 65.7, son: 69.0, tr: 'Değilini alalım: ∀ ∃ olur, ⇒ ∧ olur, tek çift olur.', en: 'Negate it: ∀ becomes ∃, ⇒ becomes ∧, odd becomes even.', not: 'Semboller takla atarken her değişimi sesli söyleyin.' },
  { bas: 69.1, son: 74.6, tr: 'Döngü, değilin örneğini arar. Bulursa önerme yanlıştır.', en: 'The loop searches for an example of the negation. If found, the claim is false.', not: 'Koddaki "eğer" satırı ile değil formülü arasındaki bağı gösterin.' },

  { bas: 75.0, son: 79.6, tr: '4’e bölünen her sayı 2’ye bölünür: 4 | n ⇒ 2 | n.', en: 'Every number divisible by 4 is divisible by 2: 4 | n ⇒ 2 | n.', not: 'Küçük kümenin büyüğün içinde olduğunu gösterin: ise = kapsama.' },
  { bas: 79.7, son: 83.0, tr: 'Tersi doğru mu? 6, 2’ye bölünür ama 4’e bölünmez.', en: 'Is the converse true? 6 is divisible by 2 but not by 4.', not: '"İse"nin yönü önemlidir; ters çevirince doğruluk korunmayabilir.' },
  { bas: 83.1, son: 85.6, tr: 'Tek sayılarda iki yön de doğru: ⇔.', en: 'For odd numbers both directions hold: ⇔.', not: 'n² tek ise n’nin neden tek olduğunu sınıfa bırakabilirsiniz.' },
  { bas: 85.7, son: 88.5, tr: 'Menüde “çorba veya salata” çoğu zaman biri demektir.', en: 'On a menu, “soup or salad” usually means just one.', not: 'Gülümseyerek; günlük dilden örnekler isteyin.' },
  { bas: 88.6, son: 91.2, tr: 'Matematikte ∨ ikisini de kapsar; belirsizlik kalmaz.', en: 'In mathematics ∨ includes both; no ambiguity remains.', not: '∨ ile ⊻ farkını önceki filmle bağlayın.' },

  { bas: 91.4, son: 96.3, tr: 'Aklında kalsın: test etmek ispat etmek değildir.', en: 'Remember: testing is not proving.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 96.4, son: 101.2, tr: 'Tek karşıt örnek yıkar; sembolik dil kesinleştirir.', en: 'One counterexample breaks a claim; symbolic language makes it precise.', not: 'Açılıştaki kırk asala geri dönün.' },
  { bas: 101.7, son: 107.6, tr: 'Karşıt örnek avına laboratuvarda devam et.', en: 'Keep hunting counterexamples in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
