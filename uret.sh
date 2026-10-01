#!/bin/bash
# ==========================================================================
#  EKSEN — MP4 üretimi (Mac)
#  Her film için: yatay + dikey 720p MP4, TR/EN/iki dilli SRT, seslendirme notları.
#  Kullanım (depo kökünde):   ./uret.sh            # tüm filmler
#                             ./uret.sh 9-4-1      # adında "9-4-1" geçen filmler
#  Tekrar çalıştırılabilir: biten MP4'ler atlanır. Yeniden üretmek için: ./uret.sh 9-1-1 --zorla
#  Kendini caffeinate -dis altında yeniden başlatır (Mac uyumaz, ekran kararmaz).
# ==========================================================================
set -euo pipefail
cd "$(dirname "$0")"

if [[ "$(uname)" == "Darwin" && -z "${EKSEN_UYANIK:-}" ]]; then
  export EKSEN_UYANIK=1
  exec caffeinate -dis "$0" "$@"
fi

SUZGEC="${1:-}"
EK=""
[[ "${2:-}" == "--zorla" || "${1:-}" == "--zorla" ]] && EK="--zorla"
[[ "$SUZGEC" == "--zorla" ]] && SUZGEC=""

renk() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
baslik() { echo; renk "1;36" "━━ $1"; }

# --- Ön koşullar ---
command -v node >/dev/null || { renk 31 "✖ Node.js yok. Kurulum: brew install node"; exit 1; }
command -v ffmpeg >/dev/null || { renk 31 "✖ ffmpeg yok. Kurulum: brew install ffmpeg"; exit 1; }
if [[ "$(uname)" == "Darwin" && ! -d "/Applications/Google Chrome.app" && -z "${EKSEN_CHROME_YOLU:-}" ]]; then
  renk 31 "✖ Google Chrome bulunamadı (/Applications/Google Chrome.app). Kurun ya da EKSEN_CHROME_YOLU verin."; exit 1
fi
if [[ ! -d node_modules/playwright ]]; then
  baslik "Playwright kuruluyor (tarayıcı indirilmeden; yüklü Chrome kullanılacak)"
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --no-audit --no-fund
fi

# --- Ortak dosyaları güncelle ---
node araclar/senkronla.mjs >/dev/null

WEBGL_TAMAM=""
toplam=0; atlanan=0; hata=0
for d in filmler/*/; do
  ad="$(basename "$d")"
  [[ -f "$d/film.js" ]] || continue
  [[ -n "$SUZGEC" && "$ad" != *"$SUZGEC"* ]] && continue
  toplam=$((toplam+1))
  if [[ -z "$EK" && -f "$d/dist/$ad-yatay-720p.mp4" && -f "$d/dist/$ad-dikey-720p.mp4" && -f "$d/dist/$ad-seslendirme-notlari.md" ]]; then
    renk 90 "↷ $ad — hazır, atlanıyor"; atlanan=$((atlanan+1)); continue
  fi
  baslik "$ad"
  # 3B sahnesi olan ilk filmde başsız Chrome'da WebGL testi
  if [[ -z "$WEBGL_TAMAM" && -f "$d/motor/uc.js" ]]; then
    renk 33 "• 3B sahne var: başsız Chrome'da WebGL testi"
    if (cd "$d" && node araclar/webgl-test.mjs); then WEBGL_TAMAM=1; else
      renk 31 "✖ WebGL testi başarısız. Chrome'u güncelleyip tekrar deneyin; çıktı: $d/onizleme/"; exit 1; fi
  fi
  if (cd "$d" && EKSEN_DEPO="$ad" node araclar/disa-aktar.mjs $EK); then
    renk 32 "✔ $ad tamam"
  else
    renk 31 "✖ $ad üretilemedi (diğer filmlere devam ediliyor)"; hata=$((hata+1))
  fi
done

echo
renk "1;32" "Bitti: $toplam film · $atlanan atlandı · $hata hata"
[[ $hata -eq 0 ]] && renk 36 "Sıradaki adım:  ./yayinla.sh"
