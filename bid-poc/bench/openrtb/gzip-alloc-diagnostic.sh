#!/usr/bin/env bash
# Diagnostic: cost of allocating gzip state per request vs reusing it per thread (ORTB_GZIP_REUSE),
# measured as minor page faults and CPU time per request of the server process (from /proc/<pid>/stat),
# for the gzip single-request load at c=100. Includes a glibc-malloc control (large trim/mmap thresholds).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
OUT="${OUT:-$HERE/../results/openrtb/diagnostics/gzip-alloc.txt}"
mkdir -p "$(dirname "$OUT")"
CLK=$(getconf CLK_TCK)
G="$HERE/single-request.json.gz"
OHA=(taskset -c 2,3 oha --no-tui -w -c 100 --worker-threads 2 -m POST -H "content-type: application/json"
     -H "content-encoding: gzip" -H "accept-encoding: gzip" -D "$G" --output-format json)
tree_stat() { # sum of minflt and utime+stime over the process and its children
  local pids; pids="$1 $( (pgrep -P "$1" || true) | tr '\n' ' ')"  # pgrep exits 1 when there are no children
  for p in $pids; do awk '{print $10, $14+$15}' "/proc/$p/stat"; done | awk '{f+=$1; t+=$2} END {print f, t}'
}
run() { # label port env... -- cmd...
  local label=$1 port=$2; shift 2
  local envs=(); while [ "$1" != "--" ]; do envs+=("$1"); shift; done; shift
  env "${envs[@]}" taskset -c 0,1 "$@" 2>/dev/null &
  local pid=$!
  for _ in $(seq 1 200); do (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null && break; sleep 0.05; done
  sleep 1
  "${OHA[@]}" -z 5s "http://127.0.0.1:$port/openrtb2/bid" >/dev/null
  read -r f0 t0 < <(tree_stat "$pid")
  local json; json=$("${OHA[@]}" -z 15s "http://127.0.0.1:$port/openrtb2/bid")
  read -r f1 t1 < <(tree_stat "$pid")
  kill -TERM "$pid"; wait "$pid" 2>/dev/null || true; sleep 1
  python3 -c "
import json,sys
d=json.loads(sys.argv[1]); n=sum(d['statusCodeDistribution'].values()); errs=sum(d['errorDistribution'].values())
print(f'{sys.argv[2]:<52s} {d[\"summary\"][\"requestsPerSec\"]:>9.0f} req/s  {($f1-$f0)/n:>7.2f} minor faults/req  {($t1-$t0)/$CLK*1e6/n:>7.1f} CPU us/req  errors {errs}')
" "$json" "$label"
}
{
  echo "# gzip state per request (ORTB_GZIP_REUSE=0) vs reused per thread (=1); gzip request+response, c=100, 15 s after 5 s warm-up"
  echo "# $(date -u)"
  printf '%-52s %15s %22s %18s\n' "server / setting" "throughput" "page faults" "CPU"
  run "A1 Node single, ORTB_GZIP_REUSE=0 (allocate per req)" 3001 ORTB_GZIP_REUSE=0 -- node "$ROOT/server-node/server.js"
  run "A1 Node single, ORTB_GZIP_REUSE=1 (reuse)" 3001 ORTB_GZIP_REUSE=1 -- node "$ROOT/server-node/server.js"
  run "B  Rust axum,   ORTB_GZIP_REUSE=0 (allocate per req)" 3002 ORTB_GZIP_REUSE=0 -- "$ROOT/target/release/server-rust"
  run "B  Rust axum,   ORTB_GZIP_REUSE=1 (reuse)" 3002 ORTB_GZIP_REUSE=1 -- "$ROOT/target/release/server-rust"
  run "B  Rust axum,   REUSE=0 + glibc trim/mmap thresholds 64MiB" 3002 ORTB_GZIP_REUSE=0 MALLOC_TRIM_THRESHOLD_=67108864 MALLOC_MMAP_THRESHOLD_=67108864 -- "$ROOT/target/release/server-rust"
} | tee "$OUT"
