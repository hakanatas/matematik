#!/bin/bash
# ==========================================================================
#  EKSEN — GitHub'a yayın (Mac, gh CLI ile; tarayıcı gerekmez)
#  Her film, her laboratuvar ve hub ayrı bir depo + GitHub Pages sayfası olur.
#  Filmlerde v1.0 sürümüne 6 dosya yüklenir (önce ./uret.sh çalıştırın).
#  Kullanım (depo kökünde):  ./yayinla.sh          # hepsi
#                            ./yayinla.sh 9-2      # adında "9-2" geçenler
#  Tekrar çalıştırılabilir: var olan depo, Pages ve sürüm dosyaları atlanır;
#  yalnızca değişen dosyalar yeni bir commit olarak gönderilir.
# ==========================================================================
set -euo pipefail
cd "$(dirname "$0")"
KOK="$(pwd)"
SAHIP="${EKSEN_SAHIP:-hakanatas}"
CALISMA="${EKSEN_YAYIN_KLASORU:-$HOME/eksen-yayin}"
SUZGEC="${1:-}"

renk() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
baslik() { echo; renk "1;36" "━━ $1"; }

command -v gh >/dev/null || { renk 31 "✖ gh yok. Kurulum: brew install gh && gh auth login"; exit 1; }
command -v node >/dev/null || { renk 31 "✖ Node.js yok. Kurulum: brew install node"; exit 1; }
command -v rsync >/dev/null || { renk 31 "✖ rsync yok."; exit 1; }
gh auth status >/dev/null 2>&1 || { renk 31 "✖ gh oturumu yok. Önce: gh auth login"; exit 1; }
gh auth setup-git >/dev/null 2>&1 || true

node araclar/senkronla.mjs >/dev/null
[[ -f araclar/posterler.mjs && -d node_modules/playwright ]] && node araclar/posterler.mjs >/dev/null 2>&1 || true
mkdir -p "$CALISMA"

AD_GIT="$(git config --global user.name || true)"; EPOSTA_GIT="$(git config --global user.email || true)"
[[ -z "$AD_GIT" ]] && AD_GIT="Hakan Ataş"
[[ -z "$EPOSTA_GIT" ]] && EPOSTA_GIT="$SAHIP@users.noreply.github.com"

olustan=0; guncellenen=0; ayni=0; surum=0
while IFS=$'\t' read -r -u 3 klasor depo tur aciklama surumBaslik; do
  [[ -n "$SUZGEC" && "$depo" != *"$SUZGEC"* ]] && continue
  baslik "$depo"
  url="https://$SAHIP.github.io/$depo/"
  hedef="$CALISMA/$depo"

  # 1) Depo
  if gh repo view "$SAHIP/$depo" --json name >/dev/null 2>&1; then
    renk 90 "  depo var"
  else
    gh repo create "$SAHIP/$depo" --public --description "$aciklama" --homepage "$url" >/dev/null
    renk 32 "  ✔ depo oluşturuldu"; olustan=$((olustan+1))
    gh repo edit "$SAHIP/$depo" --add-topic matematik --add-topic egitim --add-topic maarif-modeli --add-topic eksen >/dev/null 2>&1 || true
  fi

  # 2) Yerel yayın kopyası
  if [[ ! -d "$hedef/.git" ]]; then
    if git ls-remote --exit-code "https://github.com/$SAHIP/$depo.git" HEAD >/dev/null 2>&1; then
      git clone -q "https://github.com/$SAHIP/$depo.git" "$hedef"
    else
      mkdir -p "$hedef"; git -C "$hedef" init -q -b main
      git -C "$hedef" remote add origin "https://github.com/$SAHIP/$depo.git"
    fi
  fi
  rsync -a --delete --exclude .git --exclude node_modules --exclude dist --exclude onizleme --exclude .DS_Store "$KOK/$klasor/" "$hedef/"
  touch "$hedef/.nojekyll"
  git -C "$hedef" add -A
  if git -C "$hedef" diff --cached --quiet; then
    renk 90 "  değişiklik yok"; ayni=$((ayni+1))
  else
    git -C "$hedef" -c user.name="$AD_GIT" -c user.email="$EPOSTA_GIT" commit -q -m "Eksen yayını: $depo"
    git -C "$hedef" push -q -u origin main
    renk 32 "  ✔ gönderildi"; guncellenen=$((guncellenen+1))
  fi

  # 3) GitHub Pages
  if gh api "repos/$SAHIP/$depo/pages" >/dev/null 2>&1; then
    renk 90 "  Pages açık: $url"
  else
    gh api -X POST "repos/$SAHIP/$depo/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null
    renk 32 "  ✔ Pages açıldı: $url (ilk yayın 1–2 dk sürebilir)"
  fi

  # 4) v1.0 sürümü (yalnızca filmler)
  if [[ "$tur" == "film" ]]; then
    dist="$KOK/$klasor/dist"
    dosyalar=("$dist/$depo-yatay-720p.mp4" "$dist/$depo-dikey-720p.mp4" "$dist/$depo-tr.srt" "$dist/$depo-en.srt" "$dist/$depo-tr-en.srt" "$dist/$depo-seslendirme-notlari.md")
    eksik=0; for f in "${dosyalar[@]}"; do [[ -f "$f" ]] || eksik=1; done
    if [[ $eksik -eq 1 ]]; then
      renk 33 "  ! dist/ eksik: önce ./uret.sh $depo — sürüm atlandı"; continue
    fi
    if mevcut="$(gh release view v1.0 -R "$SAHIP/$depo" --json assets -q '.assets[].name' 2>/dev/null)"; then
      yuklenecek=()
      for f in "${dosyalar[@]}"; do grep -qx "$(basename "$f")" <<<"$mevcut" || yuklenecek+=("$f"); done
      if [[ ${#yuklenecek[@]} -eq 0 ]]; then renk 90 "  v1.0 tam (6 dosya)"; else
        gh release upload v1.0 -R "$SAHIP/$depo" "${yuklenecek[@]}" >/dev/null
        renk 32 "  ✔ v1.0'a ${#yuklenecek[@]} eksik dosya yüklendi"; surum=$((surum+1))
      fi
    else
      notlar="$(mktemp)"
      {
        echo "**$surumBaslik**"; echo
        echo "▶ İzle: $url"; echo
        echo "| Dosya | İçerik |"; echo "|---|---|"
        echo "| \`$depo-yatay-720p.mp4\` | 16:9, 1280×720 (TR/EN altyazı izi gömülü) |"
        echo "| \`$depo-dikey-720p.mp4\` | 9:16, 720×1280 |"
        echo "| \`$depo-tr.srt\` | Türkçe altyazı |"
        echo "| \`$depo-en.srt\` | English subtitles |"
        echo "| \`$depo-tr-en.srt\` | İki dilli altyazı |"
        echo "| \`$depo-seslendirme-notlari.md\` | Öğretmen için seslendirme notları |"
        echo; echo "Lisans: CC BY-NC 4.0 — Hakan Ataş"
      } > "$notlar"
      gh release create v1.0 -R "$SAHIP/$depo" --target main --title "$surumBaslik" --notes-file "$notlar" "${dosyalar[@]}" >/dev/null
      rm -f "$notlar"
      renk 32 "  ✔ v1.0 sürümü 6 dosyayla yayınlandı"; surum=$((surum+1))
    fi
  fi
done 3< <(node araclar/yayin-listesi.mjs)

echo
renk "1;32" "Bitti: $olustan yeni depo · $guncellenen güncellendi · $ayni değişmedi · $surum sürüm işlemi"
renk 36 "Hub: https://$SAHIP.github.io/eksen-filmleri/"
