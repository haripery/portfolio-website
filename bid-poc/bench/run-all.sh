#!/usr/bin/env bash
# Reproduces every result in bench/results/ and the tables in README.md, in order.
# Each step can also be run on its own (see README). Total time: roughly 1 h 10 min,
# almost all of it in step 6 (3 repetitions x 24 HTTP cells x ~43 s).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
R="$HERE/results"
mkdir -p "$R"
cd "$ROOT"
step() { printf '\n######## %s ########\n' "$*"; }

step "1. machine info -> results/machine.txt"
"$HERE/machine-info.sh" | tee "$R/machine.txt"

step "2. release builds -> results/build.txt, results/build-flags.txt"
touch engine-core/src/lib.rs   # force engine-core to be recompiled so its rustc command line is printed
{
  echo "\$ cargo build --release -p server-rust -v"
  cargo build --release -p server-rust -v 2>&1
  echo
  echo "\$ (cd engine-napi && npm ci && npx napi build --platform --release --verbose)"
  (cd engine-napi && npm ci --no-audit --no-fund 2>&1 && npx napi build --platform --release --verbose 2>&1)
} > "$R/build-verbose.log"
grep -E '^\s+(Compiling|Finished)' "$R/build-verbose.log" | tee "$R/build.txt"
{
  echo "rustc command line used for engine-core in each build (only the --target flag differs; the triple is the host's):"
  grep -E 'Running `.*--crate-name engine_core ' "$R/build-verbose.log" | sed -E 's/ -L dependency=.*//'
} | tee "$R/build-flags.txt"
rm -f "$R/build-verbose.log"
sha256sum target/release/server-rust engine-napi/engine-napi.linux-x64-gnu.node | tee -a "$R/build.txt"

step "3. unit tests -> results/unit-tests.txt"
cargo test -p engine-core --release 2>&1 | tee "$R/unit-tests.txt"

step "4. identical-output check -> results/verify.txt"
"$HERE/verify.sh" "$R/verify" 2>&1 | tee "$R/verify.txt"

step "5. micro-benchmarks -> results/micro/"
"$HERE/run-micro.sh"

step "6. HTTP load tests -> results/http/"
"$HERE/run-http.sh"

step "7. diagnostics -> results/profile/, results/diagnostics/"
"$HERE/profile-node.sh"
"$HERE/vcpu-speed-check.sh"

step "8. tables -> results/summary.md, results/http/all-runs.md, README.md"
python3 "$HERE/summarize.py" --readme "$ROOT/README.md"
