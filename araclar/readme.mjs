// Film ve laboratuvar depoları için README.md üreticisi.
const PAGES = 'https://hakanatas.github.io';
const GH = 'https://github.com/hakanatas';
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

const lisans = (ad, url) => `## Lisans / License

**TR —** Bu çalışma [Creative Commons Atıf-GayriTicari 4.0 Uluslararası (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/deed.tr) lisansı ile paylaşılmıştır. Atıf vermek koşuluyla kopyalayabilir, dağıtabilir, uyarlayabilir ve sınıfınızda kullanabilirsiniz. Ticari amaçla kullanılamaz.

**EN —** This work is licensed under [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/). You may copy, share and adapt it, with attribution, for non-commercial purposes only.

Üçüncü taraf bileşenler / Third-party components: Bricolage Grotesque, Fraunces, JetBrains Mono ve Noto Sans Math fontları SIL Open Font License 1.1 ile (bkz. \`fontlar/OFL-LISANSLAR.txt\`); qrcode-generator (Kazuhiko Arase) MIT lisansı ile${'{{UC}}'} kullanılmıştır.

### Hazır atıf metni / Ready-to-use attribution

> ${ad} — Hakan Ataş, *Eksen: 9. Sınıf Matematik Filmleri*, ${url}, CC BY-NC 4.0.

> ${ad} — Hakan Ataş, *Eksen: Grade 9 Mathematics Films*, ${url}, licensed under CC BY-NC 4.0.
`;

export function readmeFilm({ tema, cikti, bilgi, filmKod, uc }) {
  const no = cikti.kod.replace('MAT.', '');
  const url = `${PAGES}/${cikti.film}/`;
  const sahneler = [...filmKod.matchAll(/\{\s*ad:\s*'([^']+)',\s*bas:\s*([\d.]+),\s*son:\s*([\d.]+)/g)].map((m) => ({ ad: m[1], bas: +m[2], son: +m[3] }));
  const sure = sahneler.length ? Math.max(...sahneler.map((s) => s.son)) : 0;
  const acik = bilgi.sahneler || {};
  let md = `# Eksen ${no} · ${cikti.filmAdi}

*${cikti.filmAdiEn}* — 9. sınıf matematik, **${tema.no}. Tema: ${tema.ad}**

▶ **Filmi izle:** ${url}
🧪 **Laboratuvar:** ${PAGES}/${tema.lab}/
🗂 **Tüm seri:** ${PAGES}/eksen-filmleri/

${bilgi.ozet || ''}

${bilgi.fikir ? `**Tek görsel fikir:** ${bilgi.fikir}\n` : ''}
## Öğrenme çıktısı (birebir)

Kaynak: MEB Türkiye Yüzyılı Maarif Modeli, Ortaöğretim Matematik Dersi Öğretim Programı, 9. sınıf, ${tema.no}. Tema: ${tema.ad}.

**${cikti.kod}. ${cikti.baslik}**

${cikti.maddeler.map((m) => `- ${m}`).join('\n')}

## Sahneler

Süre: **${mmss(sure)}** · Yerleşim: 16:9 (1280×720) ve 9:16 (720×1280)${uc ? ' · 3B sahne: Three.js/WebGL' : ''}

| # | Sahne | Zaman | Ne oluyor? |
|---|---|---|---|
${sahneler.map((s, i) => `| ${i + 1} | ${s.ad} | ${mmss(s.bas)}–${mmss(s.son)} | ${acik[s.ad] || ''} |`).join('\n')}

## Sınıfta kullanım

- Sayfayı açın; altyazı dili (TR, EN, TR+EN, kapalı) ve yerleşim (16:9 / 9:16) alt çubuktan seçilir. Kısayollar: **boşluk** oynat/durdur, **← →** 5 sn, **c** altyazı, **y** yerleşim, **f** tam ekran.
- **Notlar** düğmesi, filmi kendi sesinizle anlatmak isterseniz her cümle için seslendirme önerilerini gösterir (\`captions.js\` içindeki \`not\` alanları).
- Bağlantıya \`?t=40\` ekleyerek filmi 40. saniyeden, \`?yerlesim=v\` ile dikey, \`?dil=en\` ile İngilizce altyazıyla açabilirsiniz.

## v1.0 sürüm dosyaları

| Dosya | İçerik |
|---|---|
| \`${cikti.film}-yatay-720p.mp4\` | 16:9, 1280×720, 30 fps (TR ve EN altyazı izi gömülü, seçilebilir) |
| \`${cikti.film}-dikey-720p.mp4\` | 9:16, 720×1280, 30 fps |
| \`${cikti.film}-tr.srt\` | Türkçe altyazı |
| \`${cikti.film}-en.srt\` | İngilizce altyazı |
| \`${cikti.film}-tr-en.srt\` | İki dilli altyazı |
| \`${cikti.film}-seslendirme-notlari.md\` | Öğretmen için seslendirme notları |

## Nasıl çalışır? / Çalıştırma

Film tek bir HTML sayfası ve saf JavaScript'tir. Her kare \`renderFrame(t)\` ile zamanın saf bir fonksiyonu olarak çizilir; rastgelelik tohumludur, ekran kaydı yoktur.${uc ? ' 3B sahne de Three.js ile aynı t değerinden çizilir; requestAnimationFrame yalnızca oynatıcıda saati ilerletir.' : ''} Bu yüzden dışa aktarım kare kare ve her seferinde aynı çıkar.

\`\`\`bash
# Yerelde izlemek için: index.html dosyasını tarayıcıda açmanız yeterli.
npm install            # yalnızca MP4 üretimi için (Playwright)
npm run mp4            # dist/ içine yatay + dikey MP4, SRT'ler ve seslendirme notları
npm run onizleme       # onizleme/ içine kareler + yazı taşma/çakışma denetimi${uc ? '\nnpm run webgl-test     # başsız Chrome\'da WebGL çalışıyor mu?' : ''}
\`\`\`

macOS'ta dışa aktarım yüklü Google Chrome'u kullanır (\`channel: 'chrome'\`) ve \`ffmpeg -nostdin\` ile kodlar (\`brew install ffmpeg\`). Uzun işlerde Mac'in uyumaması için \`caffeinate -dis npm run mp4\` önerilir.

| Dosya | Görev |
|---|---|
| \`index.html\` | Sayfa |
| \`film.js\` | Sahneler (renderFrame(t) içinde çizilen her şey) |
| \`captions.js\` | TR/EN altyazılar ve seslendirme notları |
| \`motor/\` | Eksen ortak motoru (çizim, formül dizgisi, atmosfer, altyazı, oynatıcı${uc ? ', 3B köprüsü' : ''}) |
| \`araclar/\` | Playwright ile MP4/SRT dışa aktarımı ve önizleme denetimi |
| \`PROMPT.md\` | Serinin üretim istemi (birebir) |

${lisans(`Eksen ${no} · ${cikti.filmAdi}`, url).replace('{{UC}}', uc ? '; three.js (MIT)' : '')}`;
  return md;
}

export function readmeLab({ tema, bilgi, uc }) {
  const url = `${PAGES}/${tema.lab}/`;
  let md = `# ${bilgi.ad || 'Eksen Laboratuvarı'} · ${tema.no}. Tema: ${tema.ad}

▶ **Laboratuvarı aç:** ${url}
🗂 **Tüm seri:** ${PAGES}/eksen-filmleri/

${bilgi.ozet || ''}

## Bu temanın öğrenme çıktıları (birebir)

Kaynak: MEB Türkiye Yüzyılı Maarif Modeli, Ortaöğretim Matematik Dersi Öğretim Programı, 9. sınıf.

${tema.ciktilar.map((c) => `- **${c.kod}.** ${c.baslik} — film: [${c.filmAdi}](${PAGES}/${c.film}/)`).join('\n')}

## Deneyler

${(bilgi.deneyler || []).map((d) => `- **${d.ad}:** ${d.aciklama}`).join('\n')}

## Sınıfta kullanım

${bilgi.sinif || 'Laboratuvar telefonda ve okul bilgisayarlarında çalışır; kurulum gerektirmez. Bağlantıyı paylaşmanız yeterli.'}

## Teknik

Tek HTML sayfası ve saf JavaScript; dış bağlantı gerektirmez (fontlar sayfaya gömülüdür). Çizim Canvas 2B ile yapılır${uc ? ', 3B görünüm Three.js/WebGL iledir' : ''}; düşük güçlü cihazlarda çözünürlük kendiliğinden ayarlanır.

${lisans(`${bilgi.ad || 'Eksen Laboratuvarı'}`, url).replace('{{UC}}', uc ? '; three.js (MIT)' : '')}`;
  return md;
}

export function readmeHub(M) {
  const url = `${PAGES}/eksen-filmleri/`;
  let md = `# Eksen · 9. Sınıf Matematik Filmleri

▶ **Seriyi aç:** ${url}

Türkiye Yüzyılı Maarif Modeli ortaöğretim matematik öğretim programının 9. sınıf öğrenme çıktılarının her biri için kısa, sinematik bir film (JavaScript ile prosedürel üretilmiş, 16:9 ve 9:16, TR/EN altyazılı) ve her tema için etkileşimli bir laboratuvar. Ortaokul serisi: [Nokta'nın Filmleri](${PAGES}/nokta-filmleri).

`;
  for (const t of M.temalar) {
    md += `## ${t.no}. Tema: ${t.ad}\n\n🧪 [Laboratuvar](${PAGES}/${t.lab}/)\n\n| Kod | Film | Öğrenme çıktısı |\n|---|---|---|\n`;
    for (const c of t.ciktilar) md += `| ${c.kod} | [${c.filmAdi}](${PAGES}/${c.film}/) · [depo](${GH}/${c.film}) | ${c.baslik} |\n`;
    md += '\n';
  }
  md += lisans('Eksen: 9. Sınıf Matematik Filmleri', url).replace('{{UC}}', '');
  return md;
}
