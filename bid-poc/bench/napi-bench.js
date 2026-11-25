'use strict';
// Micro-benchmark of the JS -> Rust bridge (napi-rs), run in Node with the same input
// (bench/payload.json) as the criterion benchmark `bid_json/direct`.
//
// Method:
//  1. warm-up: each benchmark runs for WARMUP_MS (lets V8 optimise the call sites);
//  2. calibration: from the warm-up rate, pick N calls per sample so a sample takes ~SAMPLE_MS;
//  3. measurement, INTERLEAVED: for s in 1..SAMPLES, take one sample of every benchmark in turn.
//     A sample times N back-to-back calls with process.hrtime.bigint(). Interleaving means a
//     slow period of the VM hits every benchmark, instead of whichever was running then.
// Results are folded into a sink so no call can be skipped. GC triggered by the returned
// strings happens inside the timed loops and is therefore included.
// Every per-sample value is saved (raw data) when an output path is given.
//
// usage: node bench/napi-bench.js [out.json]
const fs = require('node:fs');
const path = require('node:path');
const engine = require('../engine-napi');

const WARMUP_MS = Number(process.env.WARMUP_MS || 2000);
const SAMPLES = Number(process.env.SAMPLES || 100);
const SAMPLE_MS = Number(process.env.SAMPLE_MS || 50);
const ENGINE_LOOP_ITERS = 1000;

const payload = fs.readFileSync(path.join(__dirname, 'payload.json'), 'utf8');
engine.init();
const expected = engine.bid(payload);
engine.probeSetEcho(expected);
if (engine.probeEcho(payload) !== expected) throw new Error('probeEcho() must return the bid() response');

// [name, description, fn, operations per fn() call]
const BENCHES = [
  ['bid(payload)', 'full napi call: string in -> parse/select/html/serialize in Rust -> string out',
    () => engine.bid(payload).length, 1],
  ['probeEngineLoop(payload)', `engine only: bid_json() looped ${ENGINE_LOOP_ITERS}x inside Rust, in this Node process (per iteration)`,
    () => engine.probeEngineLoop(payload, ENGINE_LOOP_ITERS), ENGINE_LOOP_ITERS],
  ['probeEcho(payload)', 'boundary only: same string in + same 1179-byte string out, no engine work',
    () => engine.probeEcho(payload).length, 1],
  ['probeTakeString(payload)', 'same string in, number out', () => engine.probeTakeString(payload), 1],
  ['probeNoop()', 'bare call, no arguments, no return value', () => (engine.probeNoop(), 1), 1],
  ['js: () => 1', 'pure-JS loop baseline (harness overhead)', () => 1, 1],
];

let sink = 0;

function timeCalls(fn, n) {
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < n; i++) sink += fn();
  return Number(process.hrtime.bigint() - t0);
}

// 1 + 2: warm-up and calibration
const plan = BENCHES.map(([name, description, fn, ops]) => {
  let calls = 0;
  let elapsed = 0;
  const step = ops > 1 ? 1 : 1000;
  while (elapsed < WARMUP_MS * 1e6) {
    elapsed += timeCalls(fn, step);
    calls += step;
  }
  const n = Math.max(ops > 1 ? 1 : 1000, Math.round((SAMPLE_MS * 1e6) / (elapsed / calls)));
  return { name, description, fn, ops, n, samples: [] };
});

// 3: interleaved measurement
for (let s = 0; s < SAMPLES; s++) {
  for (const b of plan) b.samples.push(timeCalls(b.fn, b.n) / (b.n * b.ops));
}

function quantile(sorted, q) {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

const results = plan.map((b) => {
  const sorted = [...b.samples].sort((x, y) => x - y);
  const mean = b.samples.reduce((x, y) => x + y, 0) / b.samples.length;
  const stdev = Math.sqrt(b.samples.reduce((x, y) => x + (y - mean) ** 2, 0) / (b.samples.length - 1));
  return {
    name: b.name,
    description: b.description,
    samples: b.samples.length,
    calls_per_sample: b.n,
    ops_per_call: b.ops,
    ns_per_op: {
      min: sorted[0],
      p05: quantile(sorted, 0.05),
      median: quantile(sorted, 0.5),
      mean,
      p95: quantile(sorted, 0.95),
      max: sorted[sorted.length - 1],
      stdev,
    },
    samples_ns_per_op: b.samples.map((x) => Math.round(x * 10) / 10),
  };
});

const pad = (s, n) => String(s).padEnd(n);
const f = (x) => x.toFixed(1).padStart(9);
console.log(`node ${process.version}  v8 ${process.versions.v8}  napi ${process.versions.napi}  pid ${process.pid}`);
console.log(`payload ${Buffer.byteLength(payload)} bytes, response ${Buffer.byteLength(expected)} bytes`);
console.log(`warm-up ${WARMUP_MS} ms per benchmark, then ${SAMPLES} interleaved rounds (one ~${SAMPLE_MS} ms sample of each benchmark per round)`);
console.log(`ns per operation (operation = one call, or one engine iteration for probeEngineLoop):`);
console.log(`${pad('benchmark', 26)}${pad('calls/sample', 14)}      min      p05   median     mean      p95      max    stdev`);
for (const r of results) {
  const s = r.ns_per_op;
  console.log(`${pad(r.name, 26)}${pad(r.calls_per_sample, 14)}${f(s.min)}${f(s.p05)}${f(s.median)}${f(s.mean)}${f(s.p95)}${f(s.max)}${f(s.stdev)}`);
}
console.log(`(sink ${sink})`);

if (process.argv[2]) {
  fs.writeFileSync(
    process.argv[2],
    JSON.stringify(
      {
        node: process.version,
        v8: process.versions.v8,
        napi: process.versions.napi,
        payload_bytes: Buffer.byteLength(payload),
        response_bytes: Buffer.byteLength(expected),
        warmup_ms: WARMUP_MS,
        sample_ms: SAMPLE_MS,
        interleaved: true,
        results,
      },
      null,
      1,
    ) + '\n',
  );
}
