#!/usr/bin/env bash
# Diagnostic, NOT part of the comparison tables: a V8 CPU profile of server-node (single
# process) under the same concurrency-100 load, to measure where its CPU time goes.
# The sampling profiler itself costs CPU, so this run's throughput is not comparable with
# the benchmark runs; only the *distribution* of CPU time is used.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
OUT="${OUT:-$HERE/results/profile}"
SERVER_CPUS="${SERVER_CPUS:-0,1}"
CLIENT_CPUS="${CLIENT_CPUS:-2,3}"
WARMUP="${WARMUP:-10s}"
DURATION="${DURATION:-30s}"
mkdir -p "$OUT"
rm -f "$OUT"/*.cpuprofile "$OUT"/*.cpuprofile.gz

taskset -c "$SERVER_CPUS" node --cpu-prof --cpu-prof-dir="$OUT" --cpu-prof-name=node-single-c100.cpuprofile \
  "$ROOT/server-node/server.js" 2>"$OUT/server.log" &
PID=$!
for _ in $(seq 1 200); do grep -q READY "$OUT/server.log" 2>/dev/null && break; sleep 0.05; done
grep -q READY "$OUT/server.log" || { echo "server did not start"; cat "$OUT/server.log"; exit 1; }

OHA=(taskset -c "$CLIENT_CPUS" oha --no-tui -w -c 100 --worker-threads 2 -m POST
     -H "content-type: application/json" -D "$HERE/payload.json" --output-format json http://127.0.0.1:3001/bid)
"${OHA[@]}" -z "$WARMUP" >"$OUT/warmup.json"
"${OHA[@]}" -z "$DURATION" >"$OUT/oha.json"
kill -TERM "$PID"
wait "$PID" || true   # the profile is written when the process exits

python3 "$HERE/profile-summary.py" "$OUT/node-single-c100.cpuprofile" "$OUT/oha.json" "$OUT/warmup.json" | tee "$OUT/summary.txt"
gzip -f "$OUT/node-single-c100.cpuprofile"
