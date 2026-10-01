/* Kapılar — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 3.6, tr: '1900 yılında şubat 29 gün müydü?', en: 'Did February 1900 have 29 days?', not: 'Merakla, yavaş sorun. Takvimdeki 29 yanıp sönerken bekleyin.' },
  { bas: 3.7, son: 7.0, tr: '1900, 4’e bölünüyor. Artık yıl olmalı… değil mi?', en: '1900 is divisible by 4. It should be a leap year… right?', not: '"Değil mi?" deyip sınıftan tahmin alın; çoğu "evet" diyecektir.' },
  { bas: 7.1, son: 10.6, tr: 'Hayır. Takvim algoritması 1900’ü kapıdan geçirmedi.', en: 'No. The calendar algorithm did not let 1900 through the gate.', not: '"Hayır" sözcüğünden sonra kısa bir es. Kırmızı çarpı ekrandayken susun.' },

  { bas: 18.4, son: 22.3, tr: 'Algoritmalar karar verirken mantık bağlaçlarını kullanır.', en: 'Algorithms use logical connectives to make decisions.', not: 'Filmin ana cümlesi: bağlaç = karar kapısı. Net ve yavaş okuyun.' },
  { bas: 22.4, son: 26.4, tr: 'VE kapısı yalnızca iki ışık birden gelirse açılır.', en: 'The AND gate opens only when both lights arrive.', not: 'Tablonun ∧ sütununda yalnızca ilk satırın yandığını gösterin.' },
  { bas: 26.5, son: 30.4, tr: 'VEYA için biri yeter; ikisi birden gelse de açılır.', en: 'For OR, one is enough; it opens when both come too.', not: '"İkisi birden gelse de" kısmını vurgulayın: kapsayıcı veya.' },
  { bas: 30.5, son: 36.0, tr: 'YA DA tam birini ister: çay ya da kahve, ikisi değil.', en: 'XOR wants exactly one: tea or coffee, not both.', not: 'Günlük dilden örnek isteyin: "ya bu ya şu" dediğimiz durumlar.' },

  { bas: 36.6, son: 40.4, tr: 'İSE bir söz verir: yağmur yağarsa yol ıslaktır.', en: 'IF–THEN makes a promise: if it rains, the road is wet.', not: 'Sözü bir anlaşma gibi okuyun; p ve q harflerini gösterin.' },
  { bas: 40.5, son: 44.6, tr: 'Yağmur yağdı ama yol kuru: söz bozuldu. Tek yanlış durum bu.', en: 'It rained but the road is dry: the promise is broken. The only false case.', not: 'Kırmızı lamba yandığında durun: "Başka hangi durumda söz bozulur?" diye sorun.' },
  { bas: 44.7, son: 49.0, tr: 'Yağmur yağmadıysa söz bozulmuş sayılmaz: p ⇒ q doğrudur.', en: 'If it did not rain, the promise is not broken: p ⇒ q is true.', not: 'Öğrenciler buna şaşırabilir; söz yalnızca yağmur yağınca sınanır.' },

  { bas: 49.3, son: 53.4, tr: 'Artık yıl kuralı: 4’e bölünür ve 100’e bölünmez…', en: 'The leap year rule: divisible by 4 and not by 100…', not: 'Devrenin üst kısmını gösterin: ∧ kapısı ve ¬ halkası.' },
  { bas: 53.5, son: 57.4, tr: '…veya 400’e bölünür. Üç koşul, iki bağlaç ve bir değil.', en: '…or divisible by 400. Three conditions, two connectives and a NOT.', not: 'Sözde koddaki "ve" ile "veya"yı parmakla gösterin.' },
  { bas: 57.5, son: 61.6, tr: '2024 geçer. 2023 ilk kapıda kalır. 1900, değil halkasına takılır.', en: '2024 passes. 2023 stops at the first gate. 1900 is blocked by the NOT.', not: 'Her yıl için ışığın nerede söndüğünü takip ettirin.' },
  { bas: 61.7, son: 65.6, tr: '2000 ise 400 yolundan geçer. 2100 geçemez.', en: '2000 gets through on the 400 path. 2100 does not.', not: '2000 ile 1900 arasındaki farkı sordurun: ikisi de 100’e bölünüyor.' },
  { bas: 65.7, son: 69.6, tr: 'Devre, sözde kod, sembol: aynı karar, üç dil.', en: 'Circuit, pseudocode, symbols: one decision, three languages.', not: 'Üç temsili birbirine eşleyin: hangi kapı hangi satır, hangi sembol?' },

  { bas: 70.0, son: 73.6, tr: 'Şimdi tek bir bağlacı değiştirelim: ve yerine veya.', en: 'Now change a single connective: OR instead of AND.', not: 'Sesinizi alçaltın; bir şeyin bozulacağını hissettirin.' },
  { bas: 73.7, son: 77.8, tr: '1900 artık yıl oldu. 2023 de. 2100 de!', en: '1900 became a leap year. So did 2023. And 2100!', not: 'Her yıl lambayı yaktıkça biraz daha şaşkın bir tonla okuyun.' },
  { bas: 77.9, son: 80.6, tr: 'Dilde küçük bir fark, sonuçta büyük bir hata.', en: 'A small change in language, a big error in the result.', not: 'Bu cümleyi tahtaya yazdırabilirsiniz.' },
  { bas: 80.7, son: 84.4, tr: 'Şifre kuralında da öyle: ve yerine veya, “abc1” kabul.', en: 'Same with a password rule: OR instead of AND, and “abc1” gets in.', not: 'Güvenlik bağlantısını kurun: kuralı yazan kişi bağlacı yanlış seçerse ne olur?' },

  { bas: 84.7, son: 88.6, tr: 'Her öğrenci kaydını tamamladı mı? Döngü tek tek bakar.', en: 'Has every student completed registration? A loop checks one by one.', not: 'Akış şemasında ışığın i ← i + 1 döngüsünde dolaştığını gösterin.' },
  { bas: 88.7, son: 92.6, tr: 'İlk ✗’te durur: cevap hayır. “Her” (∀) böyle çalışır.', en: 'It stops at the first ✗: the answer is no. “Every” (∀) works like this.', not: 'Geri kalan öğrencilere hiç bakılmadığını vurgulayın.' },
  { bas: 92.7, son: 97.2, tr: 'Stokta olmayan ürün var mı? İlk ✓’te durur: evet. “Bazı” (∃).', en: 'Is any product out of stock? It stops at the first ✓: yes. “Some” (∃).', not: '∀ ile ∃ döngülerinin durma koşullarını karşılaştırın.' },
  { bas: 97.3, son: 102.0, tr: '“Hepsi tamam” yanlışsa, tamamlamayan en az bir kişi vardır.', en: 'If “all done” is false, at least one person is not done.', not: 'Değil almanın kuralı: ∀ ∃’e döner, P ise ¬P olur.' },

  { bas: 102.5, son: 107.2, tr: 'Aklında kalsın: algoritmalar bağlaçlarla karar verir.', en: 'Remember: algorithms decide with connectives.', not: 'Özet maddelerini tek tek okuyun, her birinde kısa bir es.' },
  { bas: 107.3, son: 112.0, tr: 'Döngüler ise “her” ve “bazı” sorularını yanıtlar.', en: 'Loops answer the “every” and “some” questions.', not: 'Son maddede açılıştaki 1900’e geri dönün.' },
  { bas: 112.5, son: 118.2, tr: 'Kapıları kendin kurmak için laboratuvara geç.', en: 'Build the gates yourself in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
