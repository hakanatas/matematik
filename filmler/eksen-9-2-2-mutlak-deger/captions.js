/* Katlanan Doğru — altyazılar ve öğretmen için seslendirme notları
   bas/son: saniye · tr/en: altyazı metni · not: seslendirme önerisi (ton, vurgu, duraklama) */
window.ALTYAZI = [
  { bas: 0.4, son: 3.6, tr: 'Durağa yürüyorsun. Durağa uzaklığın her adımda azalıyor.', en: 'You walk toward the bus stop. Your distance shrinks with every step.', not: 'Sakin bir anlatım; yürüyüşün ritmine uyun.' },
  { bas: 3.7, son: 7.0, tr: 'Durakta sıfır. Sonra yeniden artıyor.', en: 'Zero at the stop. Then it grows again.', not: '"Sıfır" sözcüğünde durun: ışık durakta parlıyor.' },
  { bas: 7.1, son: 10.3, tr: 'Uzaklığın grafiği bir V: |x − 3|. Bir doğru, katlanmış.', en: 'The graph of the distance is a V: |x − 3|. A line, folded.', not: '"Katlanmış" sözcüğünü vurgulayın; filmin fikri bu.' },

  { bas: 18.0, son: 21.6, tr: 'f(x) = x ile başlayalım. Sol yarısı eksenin altında.', en: 'Start with f(x) = x. Its left half lies below the axis.', not: 'Sol yarıyı parmakla gösterin.' },
  { bas: 21.7, son: 25.4, tr: 'Eksenin altındaki yarıyı yukarı katla: işte |x|.', en: 'Fold the half below the axis upward: that is |x|.', not: 'Katlama sırasında sessiz kalın; görüntü konuşsun.' },
  { bas: 25.5, son: 29.3, tr: 'Sağda ikisi aynı. Solda |x| = −x. Görüntü kümesi [0, ∞).', en: 'On the right they match. On the left |x| = −x. The range is [0, ∞).', not: 'Benzerlik ve farkı tablo üzerinden sordurun.' },
  { bas: 29.4, son: 32.1, tr: 'En küçük değeri 0. Bire bir değil: y = 2’yi iki x verir.', en: 'Its minimum is 0. Not one-to-one: two x values give y = 2.', not: 'Yatay doğru testini f(x) = x ile karşılaştırın.' },
  { bas: 32.2, son: 34.8, tr: 'Başına eksi koy: −|x|, ters bir V.', en: 'Put a minus in front: −|x|, an upside-down V.', not: 'En büyük değerin 0 olduğunu sordurun.' },

  { bas: 35.2, son: 38.6, tr: 'Şimdi h(x) = 2x − 4. Ekseni x = 2’de kesiyor.', en: 'Now take h(x) = 2x − 4. It crosses the axis at x = 2.', not: 'Sıfırı önce sınıfa buldurun: 2x − 4 = 0.' },
  { bas: 38.7, son: 42.4, tr: 'Alt yarı düzlemi, x eksenini menteşe yapıp katla.', en: 'Fold the lower half-plane, using the x-axis as a hinge.', not: 'Kamera döndüğünde "kâğıt gibi" benzetmesini yapın.' },
  { bas: 42.5, son: 45.6, tr: 'Alt yarı dönüp üste kapanıyor. Doğru, x = 2’de kırılıyor.', en: 'The lower half swings over the top. The line breaks at x = 2.', not: 'Konduğu anda kısa bir es: "vay be" anı.' },
  { bas: 45.7, son: 49.6, tr: 'Sağ kol aynı kaldı: 2x − 4. Sol kol ters döndü: −2x + 4.', en: 'The right arm stays 2x − 4. The left arm flips: −2x + 4.', not: 'Renkleri eşleştirin: turkuaz sağ, mercan sol.' },
  { bas: 49.7, son: 54.6, tr: 'İki parça, tek ifade: |2x − 4|’ün parçalı yazılışı.', en: 'Two pieces, one expression: the piecewise form of |2x − 4|.', not: 'Parçalı gösterimi tahtaya yazdırın.' },

  { bas: 55.2, son: 58.6, tr: 'V’yi 1 birim aşağı indir: m(x) = |2x − 4| − 1.', en: 'Move the V down one unit: m(x) = |2x − 4| − 1.', not: '9.2.1’deki k kaydırmasını hatırlatın.' },
  { bas: 58.7, son: 62.4, tr: 'Her kol kendi doğrusu: x ≥ 2’de 2x − 5, x < 2’de −2x + 3.', en: 'Each arm is its own line: 2x − 5 for x ≥ 2, −2x + 3 for x < 2.', not: 'Her kola 1 çıkarıldığını gösterin.' },
  { bas: 62.5, son: 67.0, tr: 'Her koldan bir sıfır: 1,5 ve 2,5. Tepe noktası (2, −1).', en: 'One zero from each arm: 1.5 and 2.5. The vertex is (2, −1).', not: 'Sıfırları yerine koyarak doğrulatın.' },

  { bas: 67.7, son: 71.4, tr: 'Her V’nin tepesi x = −b/a’da. V, bu doğruya göre simetrik.', en: 'Every V has its vertex at x = −b/a. The V is symmetric about that line.', not: 'Simetrik nokta çiftlerini gösterin.' },
  { bas: 71.5, son: 75.0, tr: '+|ax + b| + c’nin görüntü kümesi [c, ∞). Tepede yön değişir.', en: 'The range of +|ax + b| + c is [c, ∞). Direction changes at the vertex.', not: 'Azalan ve artan kolları ayrı ayrı işaret edin.' },
  { bas: 75.1, son: 78.8, tr: 'c’yi kaydır: tepe altta 2 sıfır, eksende 1, üstte hiç yok.', en: 'Slide c: vertex below gives 2 zeros, on the axis 1, above none.', not: 'Önce tahmin aldırın, sonra sayacı izletin.' },
  { bas: 78.9, son: 82.4, tr: 'Başa eksi koy: V ters döner. −|2x − 4| + 3’ün en büyüğü 3.', en: 'Put a minus in front and the V flips. −|2x − 4| + 3 has maximum 3.', not: 'Görüntü kümesinin (−∞, c] olduğuna dikkat çekin.' },
  { bas: 82.5, son: 85.6, tr: 'Sıfırları 0,5 ve 3,5; görüntü kümesi (−∞, 3].', en: 'Its zeros are 0.5 and 3.5; its range is (−∞, 3].', not: '|2x − 4| = 3 denklemini iki kola ayırarak çözdürün.' },

  { bas: 86.0, son: 90.6, tr: 'Aklında kalsın: mutlak değer, eksenin altını yukarı katlar.', en: 'Remember: absolute value folds whatever is below the axis upward.', not: 'Özet maddelerini tek tek okuyun.' },
  { bas: 90.7, son: 95.6, tr: 'Kırılma h’nin sıfırında; her kol bir doğru, tepe (−b/a, c).', en: 'The break is at the zero of h; each arm is a line; the vertex is (−b/a, c).', not: 'Her maddede kısa bir es verin.' },
  { bas: 96.2, son: 101.8, tr: 'Şimdi sıra sende: laboratuvarda bir doğruyu kendin katla.', en: 'Your turn: fold a line yourself in the lab.', not: 'Karekodu okutmaları için birkaç saniye bekleyin.' },
];
