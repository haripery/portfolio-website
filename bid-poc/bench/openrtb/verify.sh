#!/usr/bin/env bash
# Starts both servers, runs verify.py against them, stops them. Exits non-zero on any difference.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
OUT="${1:-$HERE/../results/openrtb/verify}"
CORPUS="${CORPUS:-$HERE/corpus.jsonl}"
mkdir -p "$OUT"
node "$ROOT/server-node/server.js" 2>"$OUT/server-node.log" &
NODE_PID=$!
"$ROOT/target/release/server-rust" 2>"$OUT/server-rust.log" &
RUST_PID=$!
trap 'kill $NODE_PID $RUST_PID 2>/dev/null || true' EXIT
for f in "$OUT/server-node.log" "$OUT/server-rust.log"; do
  for _ in $(seq 1 200); do grep -q READY "$f" 2>/dev/null && break; sleep 0.05; done
  grep -q READY "$f" || { echo "server did not start: $f"; cat "$f"; exit 1; }
done
python3 -I "$HERE/verify.py" "$CORPUS" "$ROOT/engine-core/fixtures/openrtb-2.6" "${N_PLAIN:-2000}" "${N_GZIP:-300}"
echo
echo "raw HTTP exchange for the first corpus request (curl -si, body cut at 400 bytes):"
head -1 "$CORPUS" > "$OUT/first-request.json"
for target in "A 3001" "B 3002"; do
  set -- $target
  echo "----- $1 -----"
  curl -si -X POST -H 'content-type: application/json' --data-binary "@$OUT/first-request.json" "http://127.0.0.1:$2/openrtb2/bid" | head -c 900
  echo
done
echo
cat "$OUT/server-node.log" "$OUT/server-rust.log"
