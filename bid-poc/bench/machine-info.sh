#!/usr/bin/env bash
# Prints the machine / toolchain facts the results depend on.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
section() { printf '\n===== %s =====\n' "$*"; }

section "date (UTC)";           date -u
section "CPU (lscpu)";          lscpu | grep -E '^(Architecture|CPU\(s\)|On-line|Model name|Thread|Core|Socket|NUMA node\(s\)|Hypervisor|Virtualization|L1d|L1i|L2|L3|CPU max MHz|BogoMIPS)'
section "cores (nproc)";        echo "nproc=$(nproc)  nproc --all=$(nproc --all)"
section "cgroup CPU limit";     cat /sys/fs/cgroup/cpu.max 2>/dev/null || echo "no /sys/fs/cgroup/cpu.max (no cgroup v2 CPU quota visible)"
section "memory (free -m)";     free -m
section "OS";                   uname -a; grep -E '^(PRETTY_NAME|VERSION_ID)=' /etc/os-release
section "node";                 node -v; node -p '"v8 " + process.versions.v8 + ", napi " + process.versions.napi + ", uv " + process.versions.uv'
section "npm";                  npm -v
section "rustc";                rustc -Vv
section "cargo";                cargo -V
section "napi CLI";             (cd "$ROOT/engine-napi" && npx --no-install napi --version) 2>&1
section "oha";                  oha --version
section "python3";              python3 --version
section "locked crate versions (Cargo.lock)"
grep -A1 -E '^name = "(axum|tokio|hyper|hyper-util|serde|serde_json|napi|napi-derive|napi-sys|napi-build|criterion)"$' "$ROOT/Cargo.lock" | grep -vE '^--$' | paste - - | sed -E 's/name = "([^"]+)"\s+version = "([^"]+)"/\1 \2/'
section "git commit of bid-poc"; (cd "$ROOT" && git rev-parse HEAD 2>/dev/null && git status --short -- . | head -20) || true
section "CPU pinning used by the benchmarks"
echo "servers + micro-benchmarks: CPUs ${SERVER_CPUS:-0,1}   load generator (oha) + samplers: CPUs ${CLIENT_CPUS:-2,3}"
