#!/usr/bin/env bash
# Reproduces every result in bench/results/openrtb/ and the Part 2 tables in README.md (about 35 min).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
R="$HERE/../results/openrtb"
mkdir -p "$R/diagnostics"
cd "$ROOT"
step() { printf '\n######## %s ########\n' "$*"; }

step "1. provenance, builds and inputs -> results/openrtb/provenance.txt"
{
  echo "date: $(date -u)"
  echo "git commit: $(git rev-parse HEAD)"; git status --short -- . | grep -v '^?? bench/results' || true
  cargo build -q --release -p server-rust 2>&1
  (cd engine-napi && npm ci --no-audit --no-fund >/dev/null 2>&1 && npx napi build --platform --release 2>&1 | tail -1)
  sha256sum target/release/server-rust engine-napi/engine-napi.linux-x64-gnu.node
  echo; echo "inputs (bench/openrtb/make-inputs.sh):"
  "$HERE/make-inputs.sh" 2>&1
  echo; node -v; rustc -V; oha --version
} 2>&1 | tee "$R/provenance.txt"

step "2. unit tests -> results/openrtb/unit-tests.txt"
cargo test -p engine-core --release 2>&1 | tee "$R/unit-tests.txt"

step "3. A-vs-B identical output -> results/openrtb/verify.txt"
"$HERE/verify.sh" "$R/verify" 2>&1 | tee "$R/verify.txt"

step "4. micro-benchmarks -> results/openrtb/micro/"
"$HERE/run-micro.sh"

step "5. engine stage breakdown -> results/openrtb/diagnostics/engine-breakdown.txt"
cargo build -q --release -p engine-core --example openrtb_breakdown
for rep in 1 2 3; do taskset -c 1 target/release/examples/openrtb_breakdown 1000 20; done 2>&1 | tee "$R/diagnostics/engine-breakdown.txt"

step "6. load tests -> results/openrtb/load/"
"$HERE/run-load.sh"

step "7. tables -> results/openrtb/summary.md and README.md"
python3 "$HERE/summarize.py" --readme "$ROOT/README.md"
