#!/usr/bin/env bash
# Benchmark 1: the bridge alone. Repeated MICRO_REPS times, alternating:
#   (a) criterion: engine-core called directly from Rust      -> results/micro/repN/criterion.txt (+ raw criterion JSON)
#   (b) Node: the same work through the napi addon + probes    -> results/micro/repN/napi-bench.{txt,json}
# Both are pinned to the same CPUs (MICRO_CPUS, default: the servers' CPUs 0,1).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
OUT="${OUT:-$HERE/results/micro}"
CPUS="${MICRO_CPUS:-0,1}"
REPS="${MICRO_REPS:-3}"
mkdir -p "$OUT"
cd "$ROOT"

echo "== building criterion bench (not timed) =="
cargo bench -p engine-core --bench engine --no-run 2>&1 | tail -2

for rep in $(seq 1 "$REPS"); do
  d="$OUT/rep$rep"
  rm -rf "$d" && mkdir -p "$d"
  echo "== rep $rep (a) criterion, pinned to CPUs $CPUS =="
  taskset -c "$CPUS" cargo bench -p engine-core --bench engine 2>&1 | tee "$d/criterion.txt"
  # only this bench's own directories (target/criterion also holds the OpenRTB benches)
  ( cd target/criterion && find ./bid_json_direct ./stages -path '*/new/estimates.json' 2>/dev/null | while read -r f; do
      src="$(dirname "$f")"; dst="$d/criterion-estimates/$(dirname "$src")"; mkdir -p "$dst"
      cp "$src/estimates.json" "$src/benchmark.json" "$src/sample.json" "$dst/"
    done )
  echo "== rep $rep (b) napi from Node, pinned to CPUs $CPUS =="
  taskset -c "$CPUS" node "$HERE/napi-bench.js" "$d/napi-bench.json" 2>&1 | tee "$d/napi-bench.txt"
done
