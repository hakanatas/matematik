/* Kaçış — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 3.4, tr: 'Doğal sayılar: bir ışık halkası. 0, 1, 2, 3…', en: 'The natural numbers: a ring of light. 0, 1, 2, 3…', not: 'Sakin başlayın; halka çizilirken sayıları tek tek söyleyin.' },
  { bas: 3.5, son: 6.4, tr: '3 − 5 = ? Cevap halkanın dışına fırlar: −2.', en: '3 − 5 = ? The answer shoots out of the ring: −2.', not: 'Işık halkayı kırdığında kısa bir es verin.' },
  { bas: 6.5, son: 9.2, tr: 'Halka genişler: tam sayılar doğar.', en: 'The ring grows: the integers are born.', not: '"Doğar" sözcüğünü vurgulayın; tarihte de böyle oldu.' },
  { bas: 9.3, son: 12.0, tr: 'Bazı sorular, sorulduğu kümeye sığmaz.', en: 'Some questions do not fit in the set they are asked in.', not: 'Filmin ana cümlesi; ağır ve net söyleyin.' },

  { bas: 18.5, son: 21.2, tr: 'Tam sayılarda 1’i 2’ye böl. Sonuç yine kaçar.', en: 'Divide 1 by 2 in the integers. The answer escapes again.', not: 'Sınıfa sorun: "Bölmenin sonucu hep tam sayı mı?"' },
  { bas: 21.3, son: 24.0, tr: 'Rasyonel sayılar doğar: a/b biçiminde yazılabilen sayılar.', en: 'The rational numbers are born: numbers written as a/b.', not: 'b ≠ 0 koşulunu ayrıca vurgulayın.' },
  { bas: 24.1, son: 27.6, tr: 'Birim karenin köşegeni: d² = 2, yani d = √2.', en: 'The diagonal of a unit square: d² = 2, so d = √2.', not: 'Pisagor bağıntısını hatırlatın; tarihsel not: Pisagorcular bu sayıdan rahatsız olmuştu.' },
  { bas: 27.7, son: 30.6, tr: '√2 hiçbir kesre eşit değil. Yine kaçış: gerçek sayılar doğar.', en: '√2 equals no fraction. Another escape: the real numbers are born.', not: 'Son halka beyaz ışıkla doğuyor; sesi biraz yükseltin.' },
  { bas: 30.7, son: 34.6, tr: 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Her halka, öncekini kapsar.', en: 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Each ring contains the one before.', not: '"Alt küme" sembolünü okuyun: ℕ, ℤ’nin alt kümesidir…' },

  { bas: 35.0, son: 37.9, tr: 'Kapalılık: işlemin sonucu kümede kalıyor mu? Önce ℕ.', en: 'Closure: does the result stay inside the set? First, ℕ.', not: 'Önce öğrencilerden tahmin isteyin (varsayım), sonra tabloyu doldurun.' },
  { bas: 38.0, son: 40.8, tr: 'ℤ: toplama, çıkarma, çarpma güvenli; bölme kaçırır.', en: 'ℤ: addition, subtraction, multiplication are safe; division escapes.', not: 'Her ✗ için karşıt örneği okuyun: 1 : 2.' },
  { bas: 40.9, son: 44.6, tr: 'ℚ ve ℝ dört işleme göre kapalı. Tek şart: sıfıra bölme yok.', en: 'ℚ and ℝ are closed under all four operations, except division by zero.', not: 'Yıldızlı notu mutlaka söyleyin.' },
  { bas: 44.7, son: 49.0, tr: 'Genelleme: her a, b ∈ ℝ için a · b ∈ ℝ.', en: 'Generalisation: for all a, b ∈ ℝ, a · b ∈ ℝ.', not: '∀ sembolünü "her" diye okuyun; bu bir önerme.' },

  { bas: 49.5, son: 53.4, tr: '2 ile 3 arasında tam sayı yok. ℤ’de arada olma yok.', en: 'There is no integer between 2 and 3. ℤ is not dense.', not: 'ℤ’nin sıralı olduğunu ama arada olma özelliği taşımadığını ayırt edin.' },
  { bas: 53.6, son: 56.4, tr: 'ℚ’de durum farklı: iki kesrin ortasına hep yeni bir kesir girer.', en: 'ℚ is different: a new fraction always fits between two others.', not: 'Yakınlaşma başlarken sessiz kalın, görüntü konuşsun.' },
  { bas: 56.5, son: 60.0, tr: 'Doğrudan ispat: a < b ise ortalamaları ikisinin arasındadır.', en: 'Direct proof: if a < b, their average lies between them.', not: 'Hipotez ve hükmü ayrı ayrı gösterin.' },
  { bas: 60.1, son: 62.9, tr: 'Ortalama da rasyonel. Hipotezden hükme, her durum için.', en: 'The average is rational too. From hypothesis to conclusion, in every case.', not: 'Kapalılığın burada kullanıldığına dikkat çekin.' },
  { bas: 63.0, son: 65.9, tr: 'Ne kadar yakınlaşırsan yaklaş, araya hep yeni bir kesir girer.', en: 'However far you zoom in, a new fraction always fits between.', not: 'Sayaçtaki büyütme oranını gösterin.' },

  { bas: 66.0, son: 69.0, tr: 'Rasyoneller her yerde. O hâlde doğru dolu mu?', en: 'Rationals are everywhere. So is the line full?', not: 'Soruyu sorun ve bekleyin; çoğu öğrenci "evet" diyecektir.' },
  { bas: 69.1, son: 72.4, tr: '√2’ye yakınlaş: 1,4; 1,41; 1,414… Hepsi rasyonel.', en: 'Zoom in on √2: 1.4, 1.41, 1.414… All rational.', not: 'Basamakları ritimle okuyun.' },
  { bas: 72.5, son: 75.9, tr: 'Ama √2’nin tam yerine hiçbir kesir düşmez. Orada bir delik var.', en: 'But no fraction lands exactly on √2. There is a hole.', not: 'Filmin sürprizi: "vay be" anı. Kısa bir es.' },
  { bas: 76.0, son: 80.2, tr: 'Gerçek sayılar bu delikleri doldurur. Doğru kesintisiz olur.', en: 'The real numbers fill these holes. The line becomes unbroken.', not: 'Işık doğruyu doldururken sesi açın.' },

  { bas: 80.7, son: 83.9, tr: 'Bir önerme: iki irrasyonel sayının çarpımı irrasyoneldir.', en: 'A claim: the product of two irrational numbers is irrational.', not: 'Önce sınıfa sorun: doğru mu?' },
  { bas: 84.0, son: 86.5, tr: '√2 · √3, π · π… tutuyor gibi. Ama √2 · √2 = 2.', en: '√2 · √3, π · π… it seems to hold. But √2 · √2 = 2.', not: 'Çatlama anında durun.' },
  { bas: 86.6, son: 89.1, tr: 'Tek bir karşıt örnek yeter. Önerme çürüdü.', en: 'One counterexample is enough. The claim collapses.', not: 'Birkaç örneğin doğrulaması ispat değildir; vurgulayın.' },
  { bas: 89.2, son: 92.6, tr: 'Doğrudan ispat her durumu kapsar.', en: 'A direct proof covers every case.', not: 'İki yöntemi karşılaştırın: hangisi ne zaman kullanışlı?' },
  { bas: 92.7, son: 96.2, tr: 'Çürütmek içinse tek bir aksine örnek yeterlidir.', en: 'To disprove, a single counterexample is enough.', not: 'Öğrencilerden kendi karşıt örneklerini isteyin.' },

  { bas: 97.0, son: 101.6, tr: 'Aklında kalsın: kümeler iç içe halkalar; kapalılık, kaçamamaktır.', en: 'Remember: the sets are nested rings; closure means no escape.', not: 'Özet maddelerini sırayla okuyun.' },
  { bas: 101.7, son: 106.4, tr: 'Rasyoneller sık ama delikli; gerçek sayılar doğruyu tamamlar.', en: 'Rationals are dense but full of holes; the reals complete the line.', not: 'Son cümlede kısa bir es verin.' },
  { bas: 107.2, son: 112.7, tr: 'Şimdi sıra sende: sayı doğrusu mikroskobuyla aralara dal.', en: 'Your turn: dive between numbers with the number-line microscope.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
