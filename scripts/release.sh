#!/usr/bin/env bash
# Publica una versión nueva: sube el número, comprueba, hace commit + tag y empuja a GitHub (Vercel despliega solo desde main).
# Uso:  bash scripts/release.sh 0.18.0 "Mazmorras nuevas y arreglos"
set -euo pipefail
cd "$(dirname "$0")/.."
V="${1:-}"; MSG="${2:-Versión $V}"
[[ "$V" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Uso: bash scripts/release.sh X.Y.Z \"mensaje\"   (ej. 0.18.0)"; exit 1; }
git rev-parse --git-dir >/dev/null 2>&1 || { echo "Esto no es un repositorio git (git init ...)."; exit 1; }
git rev-parse "v$V" >/dev/null 2>&1 && { echo "La etiqueta v$V ya existe."; exit 1; }
BR="$(git rev-parse --abbrev-ref HEAD)"; [[ "$BR" == "main" ]] || { echo "Estás en '$BR'. Las versiones se publican desde main."; exit 1; }

echo "▶ Comprobando…"; node tools/check-data.js >/dev/null && node tools/check-rules.js >/dev/null && node tools/check-html.js >/dev/null
echo "▶ Subiendo versión a $V"
sed -i.bak -E "s/APP_VERSION='[^']*'/APP_VERSION='$V'/" js/version.js && rm -f js/version.js.bak
sed -i.bak -E "s/\"version\": \"[^\"]*\"/\"version\": \"$V\"/" package.json && rm -f package.json.bak
DATE="$(date +%Y-%m-%d)"
if [[ -f CHANGELOG.md ]]; then
  { head -n 2 CHANGELOG.md; printf '\n## v%s · %s\n- %s\n' "$V" "$DATE" "$MSG"; tail -n +3 CHANGELOG.md; } > CHANGELOG.tmp && mv CHANGELOG.tmp CHANGELOG.md
fi
git add -A
git commit -m "release: v$V · $MSG"
git tag -a "v$V" -m "$MSG"
git push origin main --follow-tags
echo "✔ v$V publicada. Vercel la despliega en ~1 minuto."
