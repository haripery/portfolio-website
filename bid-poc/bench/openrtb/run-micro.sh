#!/usr/bin/env bash
# OpenRTB micro-benchmarks, MICRO_REPS times, alternating, pinned to the servers' CPUs:
#   (a) criterion: engine-core's OpenRTB handle() called directly, cycling through the corpus
#   (b) Node: openrtbBid(Buffer) vs the same engine work looped inside Rust (no boundary), interleaved
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
OUT="${OUT:-$HERE/../results/openrtb/micro}"
CPUS="${MICRO_CPUS:-0,1}"
REPS="${MICRO_REPS:-3}"
mkdir -p "$OUT"
cd "$ROOT"
cargo bench -p engine-core --bench openrtb --no-run 2>&1 | tail -1
# start from an empty criterion directory: only benchmarks of THIS run may be copied into the results
rm -rf target/criterion/openrtb
for rep in $(seq 1 "$REPS"); do
  d="$OUT/rep$rep"; rm -rf "$d"; mkdir -p "$d"
  echo "== rep $rep (a) criterion openrtb, CPUs $CPUS =="
  taskset -c "$CPUS" cargo bench -p engine-core --bench openrtb 2>&1 | tee "$d/criterion.txt"
  ( cd target/criterion && find openrtb -path '*/new/estimates.json' | while read -r f; do
      src="$(dirname "$f")"; dst="$d/criterion-estimates/$(dirname "$src")"; mkdir -p "$dst"
      cp "$src/estimates.json" "$src/benchmark.json" "$src/sample.json" "$dst/"
    done )
  echo "== rep $rep (b) napi from Node, CPUs $CPUS =="
  taskset -c "$CPUS" node "$HERE/napi-bench.js" "$HERE/corpus.jsonl" "$d/napi-bench.json" 2>&1 | tee "$d/napi-bench.txt"
done
