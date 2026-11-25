#!/usr/bin/env bash
# OpenRTB image-bidder (Part 2) load tests against POST /openrtb2/bid, with the same pinning and sampling as
# bench/run-http.sh. Configs: A1 = Node single process, A2 = Node cluster (2 workers), B = Rust axum.
#
# Phases (PHASES env, default all):
#   closed       closed loop, oha -Z corpus (a random corpus line per request), c = CLOSED_LEVELS
#   open         OPEN loop at fixed offered rates (-q, with --latency-correction) and a per-request
#                timeout of TMAX (default 100ms, a typical exchange tmax) -> timeouts = lost auctions
#   cold         fresh server, NO warm-up, open loop at COLD_RATE for 10 s: what a deploy/restart costs
#   memory       closed loop c=100 with BIG_ITEMS line items: memory of each architecture at scale
# Every cell starts a fresh server; warm-up (except "cold") then a measured run with CPU/RSS sampling.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
RESULTS="${RESULTS:-$HERE/../results/openrtb/load}"
SERVER_CPUS="${SERVER_CPUS:-0,1}"
CLIENT_CPUS="${CLIENT_CPUS:-2,3}"
CLIENT_THREADS="${CLIENT_THREADS:-2}"
WARMUP="${WARMUP:-10s}"
DURATION="${DURATION:-30s}"
CORPUS="${CORPUS:-$HERE/corpus.jsonl}"
READY_REQ="$ROOT/engine-core/fixtures/openrtb-2.6/example-1.json"   # gets a bid
PHASES="${PHASES:-closed open cold memory}"
CLOSED_LEVELS="${CLOSED_LEVELS:-1 100}"
CLOSED_REPS="${CLOSED_REPS:-2}"
OPEN_RATES="${OPEN_RATES:-10000 25000 40000 55000}"
OPEN_REPS="${OPEN_REPS:-2}"
OPEN_CONNS="${OPEN_CONNS:-500}"
TMAX="${TMAX:-100ms}"
COLD_RATE="${COLD_RATE:-10000}"
COLD_REPS="${COLD_REPS:-2}"
BIG_ITEMS="${BIG_ITEMS:-200000}"
URLPATH=/openrtb2/bid
RUST_BIN="$ROOT/target/release/server-rust"

declare -A PORT=([A1]=3001 [A2]=3001 [B]=3002)
declare -A READY=([A1]='role=single' [A2]='[server-node cluster] READY' [B]='[server-rust] READY')

mkdir -p "$RESULTS"
LOG="$RESULTS/run.log"
log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG"; }
SERVER_PID=""
trap '[ -n "$SERVER_PID" ] && kill -TERM "$SERVER_PID" 2>/dev/null || true' EXIT
port_open() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }
now_ms() { date +%s%3N; }

start_server() { # cfg logfile line_items
  local cfg=$1 slog=$2 items=$3 t0
  if port_open "${PORT[$cfg]}"; then log "ERROR: port ${PORT[$cfg]} busy before $cfg"; return 1; fi
  t0=$(now_ms)
  case $cfg in
    A1) ORTB_LINE_ITEMS=$items taskset -c "$SERVER_CPUS" node "$ROOT/server-node/server.js" 2>"$slog" & ;;
    A2) ORTB_LINE_ITEMS=$items taskset -c "$SERVER_CPUS" node "$ROOT/server-node/cluster.js" 2>"$slog" & ;;
    B)  ORTB_LINE_ITEMS=$items taskset -c "$SERVER_CPUS" "$RUST_BIN" 2>"$slog" & ;;
  esac
  SERVER_PID=$!
  for _ in $(seq 1 600); do grep -qF "${READY[$cfg]}" "$slog" 2>/dev/null && break; sleep 0.02; done
  grep -qF "${READY[$cfg]}" "$slog" || { log "ERROR: $cfg not READY"; cat "$slog"; return 1; }
  STARTUP_MS=$(( $(now_ms) - t0 ))
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'content-type: application/json' \
    --data-binary "@$READY_REQ" "http://127.0.0.1:${PORT[$cfg]}$URLPATH")
  [ "$code" = 200 ] || { log "ERROR: $cfg answered HTTP $code"; return 1; }
}

stop_server() {
  kill -TERM "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
  SERVER_PID=""
  for _ in $(seq 1 50); do port_open "$1" || return 0; sleep 0.1; done
  log "ERROR: port $1 still open"
  return 1
}

# set_oha_args <mode> <concurrency-or-rate>: fills the OHA_ARGS array (no word-splitting surprises)
set_oha_args() {
  OHA_ARGS=(--no-tui -w --worker-threads "$CLIENT_THREADS" -m POST -H "content-type: application/json"
            -H "x-openrtb-version: 2.6" --output-format json)
  case $1 in
    closed) OHA_ARGS+=(-c "$2" --disable-compression -Z "$CORPUS") ;;
    open)   OHA_ARGS+=(-c "$OPEN_CONNS" -q "$2" --latency-correction -t "$TMAX" --disable-compression -Z "$CORPUS") ;;
    *) log "unknown mode $1"; return 1 ;;
  esac
}

# run_cell <group> <cfg> <label> <mode> <param> <line_items> <warmup:yes|no> <duration>
run_cell() {
  local group=$1 cfg=$2 label=$3 mode=$4 param=$5 items=$6 warm=$7 dur=$8
  local dir="$RESULTS/$group/$cfg/$label/rep$REP"
  local url="http://127.0.0.1:${PORT[$cfg]}$URLPATH"
  mkdir -p "$dir"
  log "START $group/$cfg/$label rep$REP"
  start_server "$cfg" "$dir/server.log" "$items"
  echo "$STARTUP_MS" >"$dir/startup-ms.txt"
  set_oha_args "$mode" "$param"
  if [ "$warm" = yes ]; then
    taskset -c "$CLIENT_CPUS" oha "${OHA_ARGS[@]}" -z "$WARMUP" "$url" >"$dir/warmup.json"
  fi
  { printf 'ORTB_LINE_ITEMS=%s taskset -c %s oha' "$items" "$CLIENT_CPUS"; printf ' %q' "${OHA_ARGS[@]}" -z "$dur" "$url"; echo; } >"$dir/oha-command.txt"
  taskset -c "$CLIENT_CPUS" oha "${OHA_ARGS[@]}" -z "$dur" "$url" >"$dir/oha.json" &
  local oha_pid=$!
  taskset -c "$CLIENT_CPUS" python3 "$HERE/../sample.py" --pid "$SERVER_PID" --tree --system --out "$dir/server-usage.csv" &
  local s1=$!
  taskset -c "$CLIENT_CPUS" python3 "$HERE/../sample.py" --pid "$oha_pid" --out "$dir/client-usage.csv" &
  local s2=$!
  local rc=0
  wait "$oha_pid" || rc=$?
  kill -INT "$s1" "$s2" 2>/dev/null || true
  wait "$s1" 2>/dev/null || true
  wait "$s2" 2>/dev/null || true
  stop_server "${PORT[$cfg]}"
  [ "$rc" -eq 0 ] || { log "ERROR: oha exited $rc"; return 1; }
  log "DONE  $group/$cfg/$label rep$REP -> $(python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(f\"{d['summary']['requestsPerSec']:.0f} req/s, errors {sum(d['errorDistribution'].values())}\")" "$dir/oha.json")"
  sleep 2
}

# run_group <group> <label> <mode> <param> <items> <warm> <dur>: runs A1, A2, B (reversed on even reps)
run_group() {
  local cfgs=(A1 A2 B)
  if (( REP % 2 == 0 )); then cfgs=(B A2 A1); fi
  for cfg in "${cfgs[@]}"; do run_cell "$1" "$cfg" "${@:2}"; done
}

log "=== run-load.sh SERVER_CPUS=$SERVER_CPUS CLIENT_CPUS=$CLIENT_CPUS CLIENT_THREADS=$CLIENT_THREADS WARMUP=$WARMUP DURATION=$DURATION PHASES='$PHASES' CLOSED_LEVELS='$CLOSED_LEVELS' OPEN_RATES='$OPEN_RATES' OPEN_CONNS=$OPEN_CONNS TMAX=$TMAX COLD_RATE=$COLD_RATE BIG_ITEMS=$BIG_ITEMS corpus_sha256=$(sha256sum "$CORPUS" | cut -c1-16)"
DEFAULT_ITEMS=$(cd "$ROOT" && grep -oP 'DEFAULT_LINE_ITEMS: usize = \K[0-9_]+' engine-core/src/openrtb.rs | tr -d _)
for phase in $PHASES; do
  case $phase in
    closed)
      for REP in $(seq 1 "$CLOSED_REPS"); do for c in $CLOSED_LEVELS; do
        run_group closed "c$c" closed "$c" "$DEFAULT_ITEMS" yes "$DURATION"
      done; done ;;
    open)
      for REP in $(seq 1 "$OPEN_REPS"); do for q in $OPEN_RATES; do
        run_group open "q$q" open "$q" "$DEFAULT_ITEMS" yes "$DURATION"
      done; done ;;
    cold)
      for REP in $(seq 1 "$COLD_REPS"); do
        run_group cold "q$COLD_RATE" open "$COLD_RATE" "$DEFAULT_ITEMS" no 10s
      done ;;
    memory)
      REP=1
      run_group memory "items$BIG_ITEMS" closed 100 "$BIG_ITEMS" yes "$DURATION" ;;
    *) log "unknown phase $phase"; exit 1 ;;
  esac
done
log "=== all phases finished"
