#!/usr/bin/env bash
# Checks that server-node (A) and server-rust (B) return the same status code and
# byte-identical bodies for every request in bench/cases/. Exits non-zero on any mismatch.
# Raw responses (headers + bodies) are kept in the output directory.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
OUT="${1:-$HERE/results/verify}"
mkdir -p "$OUT/responses"

node "$ROOT/server-node/server.js" 2> "$OUT/server-node.log" &
NODE_PID=$!
"$ROOT/target/release/server-rust" 2> "$OUT/server-rust.log" &
RUST_PID=$!
trap 'kill $NODE_PID $RUST_PID 2>/dev/null || true' EXIT

wait_ready() {
  for _ in $(seq 1 200); do grep -q READY "$1" 2>/dev/null && return 0; sleep 0.05; done
  echo "FAILED: server did not start ($1):"; cat "$1"; exit 1
}
wait_ready "$OUT/server-node.log"
wait_ready "$OUT/server-rust.log"

post() { # url case-file name
  curl -s -o "$OUT/responses/$3.body" -D "$OUT/responses/$3.headers" -w '%{http_code}' \
    -X POST -H 'content-type: application/json' --data-binary "@$2" "$1"
}

mismatches=0
printf '%-38s %-7s %-7s %-6s %-8s %-18s %s\n' case A-code B-code bytes A==B? sha256[0:16] "content-type A | B"
for f in "$HERE"/cases/*; do
  name="$(basename "$f")"
  a_code=$(post http://127.0.0.1:3001/bid "$f" "$name.A-node")
  b_code=$(post http://127.0.0.1:3002/bid "$f" "$name.B-rust")
  a_body="$OUT/responses/$name.A-node.body"
  b_body="$OUT/responses/$name.B-rust.body"
  ct_a=$(grep -i '^content-type:' "$OUT/responses/$name.A-node.headers" | tr -d '\r' | cut -d' ' -f2- || true)
  ct_b=$(grep -i '^content-type:' "$OUT/responses/$name.B-rust.headers" | tr -d '\r' | cut -d' ' -f2- || true)
  if [ "$a_code" = "$b_code" ] && cmp -s "$a_body" "$b_body" && [ "$ct_a" = "$ct_b" ]; then same=yes; else same=NO; mismatches=$((mismatches + 1)); fi
  printf '%-38s %-7s %-7s %-6s %-8s %-18s %s\n' "$name" "$a_code" "$b_code" "$(wc -c < "$a_body")" "$same" \
    "$(sha256sum "$a_body" | cut -c1-16)" "${ct_a:--} | ${ct_b:--}"
done

echo
echo "Non-benchmarked paths (status only):"
for spec in "GET /bid" "POST /other"; do
  m=${spec% *}; p=${spec#* }
  a=$(curl -s -o /dev/null -w '%{http_code}' -X "$m" "http://127.0.0.1:3001$p")
  b=$(curl -s -o /dev/null -w '%{http_code}' -X "$m" "http://127.0.0.1:3002$p")
  echo "  $spec -> A=$a B=$b"
done

echo
echo "Full raw responses for the benchmark payload (curl -si):"
for target in "A server-node http://127.0.0.1:3001/bid" "B server-rust http://127.0.0.1:3002/bid"; do
  set -- $target
  echo "----- $1 ($2) -----"
  curl -si -X POST -H 'content-type: application/json' --data-binary "@$HERE/payload.json" "$3"
  echo
done

echo
echo "Startup lines:"
cat "$OUT/server-node.log" "$OUT/server-rust.log"
echo
if [ "$mismatches" -eq 0 ]; then
  echo "RESULT: all $(ls "$HERE"/cases | wc -l) cases identical (status code, content-type, body bytes)"
else
  echo "RESULT: $mismatches case(s) DIFFER"
  exit 1
fi
