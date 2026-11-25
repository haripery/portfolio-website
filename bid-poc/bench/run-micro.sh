#!/usr/bin/env bash
# Benchmark 1: the bridge alone.
#   (a) criterion: engine-core called directly from Rust   -> results/micro/criterion.txt
#   (b) Node: the same work through the napi addon + probes -> results/micro/napi-bench.{txt,json}
# Both are pinned to the same CPUs the servers use in the HTTP runs.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
OUT="${OUT:-$HERE/results/micro}"
CPUS="${MICRO_CPUS:-0,1}"
mkdir -p "$OUT"
cd "$ROOT"

echo "== building criterion bench (not timed) =="
cargo bench -p engine-core --bench engine --no-run 2>&1 | tail -2

echo "== (a) criterion, pinned to CPUs $CPUS =="
taskset -c "$CPUS" cargo bench -p engine-core --bench engine 2>&1 | tee "$OUT/criterion.txt"
rm -rf "$OUT/criterion-estimates" && mkdir -p "$OUT/criterion-estimates"
( cd target/criterion && find . -path '*/new/estimates.json' | while read -r f; do
    d="$OUT/criterion-estimates/$(dirname "$(dirname "$f")")"; mkdir -p "$d"; cp "$f" "$d/estimates.json"
  done )

echo "== (b) napi from Node, pinned to CPUs $CPUS =="
taskset -c "$CPUS" node "$HERE/napi-bench.js" "$OUT/napi-bench.json" 2>&1 | tee "$OUT/napi-bench.txt"
