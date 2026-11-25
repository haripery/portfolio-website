'use strict';
// Micro-benchmark of the OpenRTB path through napi, over the request corpus (bench/openrtb/corpus.jsonl).
// Same method as bench/napi-bench.js: warm-up, calibration, then INTERLEAVED samples (one sample of
// every benchmark per round), every per-sample value saved.
//
//   openrtbBid(Buffer)        what server-node does: bytes in (zero-copy view), bytes out (external Buffer)
//   openrtbBidStr(string)     the same work with strings across the boundary (copy + transcode both ways)
//   probeOpenrtbEngineLoop    the same engine work looped inside Rust, in this process (no boundary)
//
// usage: node bench/openrtb/napi-bench.js [corpus.jsonl] [out.json]
const fs = require('node:fs');
const path = require('node:path');
const engine = require('../../engine-napi');

const WARMUP_MS = Number(process.env.WARMUP_MS || 2000);
const SAMPLES = Number(process.env.SAMPLES || 60);
const SAMPLE_MS = Number(process.env.SAMPLE_MS || 50);

const corpusPath = process.argv[2] || path.join(__dirname, 'corpus.jsonl');
const raw = fs.readFileSync(corpusPath);
const lines = raw.toString('utf8').split('\n').filter((l) => l.length > 0);
const buffers = lines.map((l) => Buffer.from(l, 'utf8'));
const corpusBuffer = Buffer.from(lines.join('\n') + '\n', 'utf8');
engine.openrtbInit();

// sanity: both boundary styles return the same bytes
for (let i = 0; i < 200; i++) {
  const a = engine.openrtbBid(buffers[i], false, false);
  const b = engine.openrtbBidStr(lines[i]);
  if ((a === null) !== (b === null) || (a !== null && a.toString('utf8') !== b)) throw new Error(`mismatch at ${i}`);
}

let bi = 0;
let si = 0;
const BENCHES = [
  ['openrtbBid(Buffer)', 'server path: Buffer in (zero-copy), Buffer out (external)', () => {
    const out = engine.openrtbBid(buffers[bi++ % buffers.length], false, false);
    return out === null ? 0 : out.length;
  }, 1],
  ['openrtbBidStr(string)', 'same work, JS string in and out', () => {
    const out = engine.openrtbBidStr(lines[si++ % lines.length]);
    return out === null ? 0 : out.length;
  }, 1],
  ['probeOpenrtbEngineLoop', `engine only: one pass over all ${lines.length} requests inside Rust (per request)`, () =>
    engine.probeOpenrtbEngineLoop(corpusBuffer, 1), lines.length],
  ['js: () => 1', 'pure-JS loop baseline (harness overhead)', () => 1, 1],
];

let sink = 0;
function timeCalls(fn, n) {
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < n; i++) sink += fn();
  return Number(process.hrtime.bigint() - t0);
}
const plan = BENCHES.map(([name, description, fn, ops]) => {
  let calls = 0;
  let elapsed = 0;
  const step = ops > 1 ? 1 : 1000;
  while (elapsed < WARMUP_MS * 1e6) {
    elapsed += timeCalls(fn, step);
    calls += step;
  }
  const n = Math.max(1, Math.round((SAMPLE_MS * 1e6) / (elapsed / calls)));
  return { name, description, fn, ops, n, samples: [] };
});
for (let s = 0; s < SAMPLES; s++) {
  for (const b of plan) b.samples.push(timeCalls(b.fn, b.n) / (b.n * b.ops));
}

const quantile = (sorted, q) => {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};
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
    ns_per_op: { min: sorted[0], p05: quantile(sorted, 0.05), median: quantile(sorted, 0.5), mean, p95: quantile(sorted, 0.95), max: sorted[sorted.length - 1], stdev },
    samples_ns_per_op: b.samples.map((x) => Math.round(x * 10) / 10),
  };
});

const pad = (s, n) => String(s).padEnd(n);
const f = (x) => x.toFixed(1).padStart(9);
console.log(`node ${process.version}  v8 ${process.versions.v8}  napi ${process.versions.napi}  pid ${process.pid}`);
console.log(`corpus ${lines.length} requests, mean ${Math.round(raw.length / lines.length)} bytes; line items ${engine.openrtbInit()}`);
console.log(`warm-up ${WARMUP_MS} ms per benchmark, then ${SAMPLES} interleaved rounds (one ~${SAMPLE_MS} ms sample of each benchmark per round)`);
console.log('ns per request (per call; per corpus request for the engine loop):');
console.log(`${pad('benchmark', 26)}${pad('calls/sample', 14)}      min      p05   median     mean      p95      max    stdev`);
for (const r of results) {
  const s = r.ns_per_op;
  console.log(`${pad(r.name, 26)}${pad(r.calls_per_sample, 14)}${f(s.min)}${f(s.p05)}${f(s.median)}${f(s.mean)}${f(s.p95)}${f(s.max)}${f(s.stdev)}`);
}
console.log(`(sink ${sink})`);
if (process.argv[3]) {
  fs.writeFileSync(process.argv[3], JSON.stringify({
    node: process.version, v8: process.versions.v8, napi: process.versions.napi, corpus_requests: lines.length,
    corpus_bytes: raw.length, warmup_ms: WARMUP_MS, sample_ms: SAMPLE_MS, interleaved: true, results,
  }, null, 1) + '\n');
}
