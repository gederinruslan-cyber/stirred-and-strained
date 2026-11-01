#!/usr/bin/env bash
# Fetches each house recipe's photo from the pinned Bar Assistant snapshot (data/SOURCES.md):
# the entry's first image as public/photos/recipes/<id>.webp, plus a 200 px jpg thumbnail.
# Run after a seed change, with the local stack up: bash scripts/fetch-photos.sh
set -euo pipefail
SHA=5a504d474614494119882eb91a8ffdc5491a483f
RAW="https://raw.githubusercontent.com/bar-assistant/data/$SHA/data/cocktails"
OUT="$(dirname "$0")/../apps/web/public/photos/recipes"
mkdir -p "$OUT/thumbs"
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "select id from recipe"' |
  while read -r id; do
    [ -f "$OUT/$id.webp" ] && continue
    file=$(curl -sfL "$RAW/$id/data.json" |
      python3 -c 'import json,sys; i=json.load(sys.stdin)["images"]; print(min(i,key=lambda x:x.get("sort",0))["uri"].split("/")[-1])')
    curl -sfL -o "$OUT/$id.webp" "$RAW/$id/$file"
    sips -s format jpeg -s formatOptions 70 -Z 200 "$OUT/$id.webp" --out "$OUT/thumbs/$id.jpg" >/dev/null
    echo "fetched $id"
  done
