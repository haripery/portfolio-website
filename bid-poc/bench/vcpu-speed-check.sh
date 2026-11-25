#!/usr/bin/env bash
# Diagnostic: are the VM's vCPUs equally fast, and is their speed stable over time?
# Runs engine-core/examples/speed_check (bid_json on bench/payload.json, ns/iteration per
# 250 ms window) (A) on all four CPUs at once and (B) on one CPU at a time.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
OUT="${OUT:-$HERE/results/diagnostics/vcpu-speed-check.txt}"
mkdir -p "$(dirname "$OUT")"
cd "$ROOT"
cargo build -q --release -p engine-core --example speed_check
BIN="$ROOT/target/release/examples/speed_check"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
CPUS=$(seq 0 $(( $(nproc) - 1 )))
{
  echo "# vCPU speed check: target/release/examples/speed_check (bid_json on bench/payload.json), ns/iteration per 250 ms window"
  echo "# $(date -u)  nothing else running"
  echo
  echo "## A) all vCPUs at the same time, one pinned copy per CPU, 30 s"
  for c in $CPUS; do taskset -c "$c" "$BIN" 30 "cpu$c" >"$TMP/$c.txt" & done
  wait
  for c in $CPUS; do cat "$TMP/$c.txt"; done
  echo
  echo "## B) one vCPU at a time (others idle), 15 s each"
  for c in $CPUS; do taskset -c "$c" "$BIN" 15 "cpu$c-alone"; done
} >"$OUT" 2>&1
grep -v series "$OUT"
