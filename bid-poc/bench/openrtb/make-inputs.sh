#!/usr/bin/env bash
# Generates the deterministic load-test input (not committed): corpus.jsonl, 1,000 small OpenRTB 2.6
# image-ad bid requests, one per line (seed 7). Prints its sha256 and statistics.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
cd "$ROOT"
cargo run -q --release -p engine-core --example gen_openrtb -- 1000 7 >"$HERE/corpus.jsonl"
sha256sum "$HERE/corpus.jsonl" | sed "s#$HERE/##"
