'use strict';
// Micro-benchmark of the JS -> Rust bridge (napi-rs), run in Node with the same input
// (bench/payload.json) as the criterion benchmark `bid_json/direct`.
//
// Method: per benchmark, WARMUP_MS of warm-up (lets V8 optimise the loop), then SAMPLES
// samples; each sample times N back-to-back calls with process.hrtime.bigint() and records
// ns/call. N is chosen so a sample takes ~SAMPLE_MS. Returned values are folded into a sink
// so the calls cannot be skipped. GC triggered by the returned strings is included.
//
// usage: node bench/napi-bench.js [out.json]
const fs = require('node:fs');
const path = require('node:path');
const engine = require('../engine-napi');

const WARMUP_MS = Number(process.env.WARMUP_MS || 3000);
const SAMPLES = Number(process.env.SAMPLES || 100);
const SAMPLE_MS = Number(process.env.SAMPLE_MS || 50);

const payload = fs.readFileSync(path.join(__dirname, 'payload.json'), 'utf8');
engine.init();
const expected = engine.bid(payload);
engine.probeSetEcho(expected);
if (engine.probeEcho(payload) !== expected) throw new Error('probeEcho() must return the bid() response');

function quantile(sorted, q) {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function bench(name, description, fn) {
  let sink = 0;
  let iters = 0;
  const w0 = process.hrtime.bigint();
  const wEnd = w0 + BigInt(WARMUP_MS) * 1000000n;
  while (process.hrtime.bigint() < wEnd) {
    for (let i = 0; i < 1000; i++) sink += fn();
    iters += 1000;
  }
  const warmNsPerCall = Number(process.hrtime.bigint() - w0) / iters;
  const n = Math.max(1000, Math.round((SAMPLE_MS * 1e6) / warmNsPerCall));
  const perCall = [];
  for (let s = 0; s < SAMPLES; s++) {
    const t0 = process.hrtime.bigint();
    for (let i = 0; i < n; i++) sink += fn();
    perCall.push(Number(process.hrtime.bigint() - t0) / n);
  }
  const sorted = [...perCall].sort((a, b) => a - b);
  const mean = perCall.reduce((a, b) => a + b, 0) / perCall.length;
  const stdev = Math.sqrt(perCall.reduce((a, b) => a + (b - mean) ** 2, 0) / (perCall.length - 1));
  return {
    name,
    description,
    samples: SAMPLES,
    calls_per_sample: n,
    ns_per_call: {
      min: sorted[0],
      p05: quantile(sorted, 0.05),
      median: quantile(sorted, 0.5),
      mean,
      p95: quantile(sorted, 0.95),
      max: sorted[sorted.length - 1],
      stdev,
    },
    sink,
  };
}

const results = [
  bench('bid(payload)', 'full napi call: string in -> parse/select/html/serialize in Rust -> string out', () =>
    engine.bid(payload).length),
  bench('probeEcho(payload)', 'same string in + same 1179-byte string out, no engine work', () =>
    engine.probeEcho(payload).length),
  bench('probeTakeString(payload)', 'same string in, number out', () => engine.probeTakeString(payload)),
  bench('probeNoop()', 'bare call, no arguments, no return value', () => (engine.probeNoop(), 1)),
  bench('js: () => 1', 'pure-JS loop baseline (harness overhead)', () => 1),
];

const pad = (s, n) => String(s).padEnd(n);
const f = (x) => x.toFixed(1).padStart(9);
console.log(`node ${process.version}  v8 ${process.versions.v8}  napi ${process.versions.napi}  pid ${process.pid}`);
console.log(`payload ${Buffer.byteLength(payload)} bytes, response ${Buffer.byteLength(expected)} bytes`);
console.log(`warm-up ${WARMUP_MS} ms, ${SAMPLES} samples of ~${SAMPLE_MS} ms each; ns per call:`);
console.log(`${pad('benchmark', 26)}${pad('calls/sample', 14)}      min      p05   median     mean      p95      max    stdev`);
for (const r of results) {
  const s = r.ns_per_call;
  console.log(
    `${pad(r.name, 26)}${pad(r.calls_per_sample, 14)}${f(s.min)}${f(s.p05)}${f(s.median)}${f(s.mean)}${f(s.p95)}${f(s.max)}${f(s.stdev)}`,
  );
}

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
        results,
      },
      null,
      2,
    ) + '\n',
  );
}
