#!/usr/bin/env bash
# Benchmark 2 + 3: end-to-end HTTP load tests with oha, plus CPU/RSS sampling.
#
# Every (round, config, concurrency) cell is independent:
#   start a fresh server pinned to SERVER_CPUS -> wait for its READY line + one 200 response
#   -> warm-up run (WARMUP, discarded but saved as warmup.json)
#   -> measured run (DURATION) while sampling CPU/RSS of the server process tree and of oha
#   -> stop the server.
# Configs are interleaved per concurrency level so slow drift of the VM affects both sides,
# and the whole suite is repeated REPS times (rep1, rep2, ...) to expose run-to-run variance.
#
# Env overrides: SERVER_CPUS CLIENT_CPUS CLIENT_THREADS WARMUP DURATION LEVELS STUB_LEVELS
#                PHASES ("round1 round2 stubs") REPS RESULTS
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
RESULTS="${RESULTS:-$HERE/results/http}"
SERVER_CPUS="${SERVER_CPUS:-0,1}"
CLIENT_CPUS="${CLIENT_CPUS:-2,3}"
CLIENT_THREADS="${CLIENT_THREADS:-2}"
WARMUP="${WARMUP:-10s}"
DURATION="${DURATION:-30s}"
LEVELS="${LEVELS:-1 10 50 100}"
STUB_LEVELS="${STUB_LEVELS:-1 100}"
PHASES="${PHASES:-round1 round2 stubs}"
REPS="${REPS:-3}"
PAYLOAD="$HERE/payload.json"
RUST_BIN="$ROOT/target/release/server-rust"

declare -A PORT=([node-single]=3001 [node-cluster]=3001 [node-stub]=3001 [rust]=3002 [rust-1worker]=3002 [rust-stub]=3002)
declare -A READY=([node-single]='role=single' [node-cluster]='[server-node cluster] READY' [node-stub]='role=single'
                  [rust]='[server-rust] READY' [rust-1worker]='[server-rust] READY' [rust-stub]='[server-rust] READY')

mkdir -p "$RESULTS"
LOG="$RESULTS/run.log"
log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"; }

SERVER_PID=""
cleanup() { [ -n "$SERVER_PID" ] && kill -TERM "$SERVER_PID" 2>/dev/null || true; }
trap cleanup EXIT

port_open() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

start_server() { # cfg logfile
  local cfg=$1 slog=$2
  if port_open "${PORT[$cfg]}"; then log "ERROR: port ${PORT[$cfg]} already in use before starting $cfg"; return 1; fi
  case $cfg in
    node-single)  taskset -c "$SERVER_CPUS" node "$ROOT/server-node/server.js" 2>"$slog" & ;;
    node-cluster) taskset -c "$SERVER_CPUS" node "$ROOT/server-node/cluster.js" 2>"$slog" & ;;
    node-stub)    STUB=1 taskset -c "$SERVER_CPUS" node "$ROOT/server-node/server.js" 2>"$slog" & ;;
    rust)         taskset -c "$SERVER_CPUS" "$RUST_BIN" 2>"$slog" & ;;
    rust-1worker) TOKIO_WORKER_THREADS=1 taskset -c "$SERVER_CPUS" "$RUST_BIN" 2>"$slog" & ;;
    rust-stub)    STUB=1 taskset -c "$SERVER_CPUS" "$RUST_BIN" 2>"$slog" & ;;
    *) log "unknown config $cfg"; return 1 ;;
  esac
  SERVER_PID=$!
  for _ in $(seq 1 200); do grep -qF "${READY[$cfg]}" "$slog" 2>/dev/null && break; sleep 0.05; done
  if ! grep -qF "${READY[$cfg]}" "$slog"; then log "ERROR: $cfg did not report READY"; cat "$slog"; return 1; fi
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'content-type: application/json' \
    --data-binary "@$PAYLOAD" "http://127.0.0.1:${PORT[$cfg]}/bid")
  if [ "$code" != 200 ]; then log "ERROR: $cfg answered HTTP $code to the payload"; return 1; fi
}

stop_server() { # cfg
  kill -TERM "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
  SERVER_PID=""
  for _ in $(seq 1 50); do port_open "${PORT[$1]}" || return 0; sleep 0.1; done
  log "ERROR: port ${PORT[$1]} still open after stopping $1"
  return 1
}

oha_cmd() { # duration conc url
  echo taskset -c "$CLIENT_CPUS" oha --no-tui -w -z "$1" -c "$2" --worker-threads "$CLIENT_THREADS" \
    -m POST -H "content-type: application/json" -D "$PAYLOAD" --output-format json "$3"
}

run_cell() { # group cfg conc   (uses global REP)
  local group=$1 cfg=$2 conc=$3
  local dir="$RESULTS/$group/$cfg/c$conc/rep$REP"
  local url="http://127.0.0.1:${PORT[$cfg]}/bid"
  mkdir -p "$dir"
  log "START rep$REP $group/$cfg c=$conc"
  start_server "$cfg" "$dir/server.log"

  # warm-up (discarded from the tables, kept as raw output)
  taskset -c "$CLIENT_CPUS" oha --no-tui -w -z "$WARMUP" -c "$conc" --worker-threads "$CLIENT_THREADS" \
    -m POST -H "content-type: application/json" -D "$PAYLOAD" --output-format json "$url" >"$dir/warmup.json"

  # measured run + samplers (samplers run on the client CPUs so they do not disturb the server)
  echo "$(oha_cmd "$DURATION" "$conc" "$url")" >"$dir/oha-command.txt"
  taskset -c "$CLIENT_CPUS" oha --no-tui -w -z "$DURATION" -c "$conc" --worker-threads "$CLIENT_THREADS" \
    -m POST -H "content-type: application/json" -D "$PAYLOAD" --output-format json "$url" >"$dir/oha.json" &
  local oha_pid=$!
  taskset -c "$CLIENT_CPUS" python3 "$HERE/sample.py" --pid "$SERVER_PID" --tree --system --out "$dir/server-usage.csv" &
  local s_srv=$!
  taskset -c "$CLIENT_CPUS" python3 "$HERE/sample.py" --pid "$oha_pid" --out "$dir/client-usage.csv" &
  local s_cli=$!
  local rc=0
  wait "$oha_pid" || rc=$?
  kill -INT "$s_srv" "$s_cli" 2>/dev/null || true
  wait "$s_srv" 2>/dev/null || true
  wait "$s_cli" 2>/dev/null || true
  stop_server "$cfg"
  if [ "$rc" -ne 0 ]; then log "ERROR: oha exited with $rc for rep$REP $group/$cfg c=$conc"; return 1; fi
  log "DONE  rep$REP $group/$cfg c=$conc -> $(python3 -c "import json,sys; s=json.load(open(sys.argv[1]))['summary']; print(f\"{s['requestsPerSec']:.0f} req/s\")" "$dir/oha.json")"
  sleep 2
}

log "=== run-http.sh: SERVER_CPUS=$SERVER_CPUS CLIENT_CPUS=$CLIENT_CPUS CLIENT_THREADS=$CLIENT_THREADS WARMUP=$WARMUP DURATION=$DURATION LEVELS='$LEVELS' STUB_LEVELS='$STUB_LEVELS' PHASES='$PHASES' REPS=$REPS"
for REP in $(seq 1 "$REPS"); do
for phase in $PHASES; do
  case $phase in
    round1) # Node single process vs Rust default tokio runtime (+ supplementary: Rust with 1 worker)
      for c in $LEVELS; do
        run_cell round1 node-single "$c"
        run_cell round1 rust "$c"
        run_cell supplementary rust-1worker "$c"
      done ;;
    round2) # Node cluster (one worker per available CPU) vs Rust default tokio runtime
      for c in $LEVELS; do
        run_cell round2 node-cluster "$c"
        run_cell round2 rust "$c"
      done ;;
    stubs) # diagnostic: same HTTP handling, no engine call
      for c in $STUB_LEVELS; do
        run_cell supplementary node-stub "$c"
        run_cell supplementary rust-stub "$c"
      done ;;
    *) log "unknown phase $phase"; exit 1 ;;
  esac
done
done
log "=== all phases finished"
