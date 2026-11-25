# First attempt (aborted)

Raw outputs of the first `bench/run-all.sh` run, kept for transparency. They are **not used in the README tables**.

The run was stopped by hand after 8 of 72 HTTP cells (the 9th, `supplementary/rust-1worker/c50`, was interrupted
mid-run). It was stopped because the code was about to change before the final measurements:

- `engine-napi` gained one more micro-benchmark probe (`probeEngineLoop`). `bid()` and the server code were unchanged,
  but the addon binary was going to be different from the one these runs used;
- `bench/napi-bench.js` was changed to interleave its samples and save every per-sample value. In this attempt's
  micro run (`micro/`), the `bid()` samples were bimodal (p05 2658 ns, median 3340 ns), and so were criterion's raw samples.

All final results were produced from a single later `run-all.sh` run of the committed code.

`vcpu-speed-check-between-attempts.txt` was run by hand between the two attempts. It is the first output of what became
`bench/vcpu-speed-check.sh`. It showed that every vCPU alternates, independently of the others, between a ~2,100 ns and a
~2,650 ns per-iteration speed for multi-second stretches. That is why the final run interleaves the Node micro-benchmark
samples, alternates the A/B order between repetitions, and reports ranges.
