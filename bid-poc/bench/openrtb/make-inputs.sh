#!/usr/bin/env bash
# Generates the deterministic load-test inputs (not committed; ~24 MB):
#   corpus.jsonl            10,000 OpenRTB 2.6 requests, one per line (seed 7)
#   single-request.json     the corpus' first request (it gets a bid), for the plain-vs-gzip test
#   single-request.json.gz  the same bytes, gzip level 1, mtime 0
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
cd "$ROOT"
cargo run -q --release -p engine-core --example gen_openrtb -- 10000 7 >"$HERE/corpus.jsonl"
head -1 "$HERE/corpus.jsonl" | tr -d '\n' >"$HERE/single-request.json"
python3 -I -c 'import gzip,sys; d=open(sys.argv[1],"rb").read(); open(sys.argv[2],"wb").write(gzip.compress(d, compresslevel=1, mtime=0))' \
  "$HERE/single-request.json" "$HERE/single-request.json.gz"
sha256sum "$HERE/corpus.jsonl" "$HERE/single-request.json" "$HERE/single-request.json.gz" | sed "s#$HERE/##"
wc -c "$HERE/single-request.json" "$HERE/single-request.json.gz" | sed "s#$HERE/##"
