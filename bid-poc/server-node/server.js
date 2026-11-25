'use strict';
// Architecture A: plain Node `http` server (no Express) -> engine-napi -> engine-core.
//
// Per request: collect the body chunks, decode them to ONE JS string, make ONE
// synchronous napi call `bid(string)` (the raw JSON string crosses the boundary; the
// JSON is parsed in Rust), and send the returned string.
//
// Env: PORT (default 3001), STUB=1 (diagnostic only: skip the napi call and send a
// precomputed response, see README "supplementary runs"), PAYLOAD (stub input file).
// No logging on the request path; one line is printed to stderr at startup.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const engine = require('../engine-napi');

const PORT = Number(process.env.PORT || 3001);
const HOST = '127.0.0.1';
const STUB = process.env.STUB === '1';

const advertisers = engine.init(); // build the advertiser list before accepting traffic
const lineItems = engine.openrtbInit(); // and the OpenRTB line-item index
const STUB_BODY = STUB
  ? engine.bid(fs.readFileSync(process.env.PAYLOAD || path.join(__dirname, '../bench/payload.json'), 'utf8'))
  : null;

function send(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(body),
  });
  res.end(body);
}

// OpenRTB 2.6 image bidder (Part 2): the raw body bytes go to Rust as a Buffer (no string decoding).
const ORTB_HEADER = 'x-openrtb-version';
function onOpenRtb(req, res) {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const body = chunks.length === 1 ? chunks[0] : Buffer.concat(chunks);
    let out;
    try {
      out = engine.openrtbBid(body); // the single JS -> Rust call
    } catch (err) {
      res.writeHead(400, { 'content-length': '0', [ORTB_HEADER]: '2.6' }); // malformed request (spec 2.1)
      res.end();
      return;
    }
    if (out == null) {
      res.writeHead(204, { [ORTB_HEADER]: '2.6' }); // no bid (spec 2.1, 7.1)
      res.end();
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json', 'content-length': out.length, [ORTB_HEADER]: '2.6' });
    res.end(out);
  });
}

function onRequest(req, res) {
  if (req.url === '/openrtb2/bid') {
    if (req.method !== 'POST') {
      res.writeHead(405, { allow: 'POST', 'content-length': '0' });
      res.end();
      return;
    }
    onOpenRtb(req, res);
    return;
  }
  if (req.url !== '/bid') {
    res.writeHead(404, { 'content-length': '0' });
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    res.writeHead(405, { allow: 'POST', 'content-length': '0' });
    res.end();
    return;
  }
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const body = chunks.length === 1 ? chunks[0].toString('utf8') : Buffer.concat(chunks).toString('utf8');
    let out;
    try {
      out = STUB ? STUB_BODY : engine.bid(body); // the single JS -> Rust call
    } catch (err) {
      send(res, 400, err.message); // message is the JSON error body built by engine-core
      return;
    }
    if (out == null) {
      res.writeHead(204); // no bid
      res.end();
      return;
    }
    send(res, 200, out);
  });
}

// noDelay is already the default in Node >= 18; set explicitly to mirror server-rust.
const server = http.createServer({ noDelay: true }, onRequest);
server.listen(PORT, HOST, () => {
  const role = require('node:cluster').isWorker ? 'worker' : 'single';
  console.error(
    `[server-node] READY pid=${process.pid} role=${role} url=http://${HOST}:${PORT}/bid ` +
      `advertisers=${advertisers} ortb_line_items=${lineItems} stub=${STUB} node=${process.version}`,
  );
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
  server.closeAllConnections();
  setTimeout(() => process.exit(0), 1000).unref();
});
