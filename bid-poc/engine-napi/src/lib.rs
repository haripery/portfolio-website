//! napi-rs wrapper around engine-core, loaded by server-node (architecture A).
//!
//! Boundary design: ONE synchronous call per HTTP request, raw JSON string in,
//! JSON string out. napi copies the JS string into a Rust `String` (UTF-8) on the
//! way in, and copies the Rust `String` into a new JS string on the way out. The JSON
//! is parsed in Rust (serde_json), not in JS.
#![deny(clippy::all)]

use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::sync::OnceLock;

/// Builds the advertiser list eagerly (so the first request is not penalised).
/// Returns the number of advertisers.
#[napi]
pub fn init() -> u32 {
    engine_core::engine().advertisers().len() as u32
}

/// Called by server-node once per request.
/// Returns the JSON response, or `null` when no advertiser is eligible.
/// Invalid input throws an Error whose `message` is the exact JSON 400 body.
#[napi]
pub fn bid(request_json: String) -> Result<Option<String>> {
    engine_core::engine()
        .bid_json(&request_json)
        .map_err(|e| Error::new(Status::InvalidArg, e.to_json_body()))
}

// ---------------------------------------------------------------------------
// Boundary probes, used ONLY by bench/napi-bench.js to split up the cost of bid().
// server-node never calls them.
// ---------------------------------------------------------------------------

/// No arguments and no return value: the bare JS -> Rust -> JS call.
#[napi]
pub fn probe_noop() {}

/// The same argument conversion as bid() (JS string -> Rust String), trivial work, a number back.
#[napi]
pub fn probe_take_string(request_json: String) -> u32 {
    request_json.len() as u32
}

static ECHO: OnceLock<String> = OnceLock::new();

/// Stores the string probe_echo() returns. Set it once to a real bid() response.
#[napi]
pub fn probe_set_echo(response: String) -> bool {
    ECHO.set(response).is_ok()
}

/// The same argument conversion as bid(), no engine work, and returns a new JS string with
/// the same bytes as a real response => the string-in + string-out boundary cost on its own.
#[napi]
pub fn probe_echo(request_json: String) -> Result<&'static str> {
    let _ = request_json; // converted (copied) like bid()'s argument, then dropped
    ECHO.get()
        .map(String::as_str)
        .ok_or_else(|| Error::new(Status::GenericFailure, "call probeSetEcho() first"))
}

// ---------------------------------------------------------------------------
// OpenRTB 2.6 image bidder (Part 2). Bytes cross the boundary, not strings:
//  - in:  `BufferSlice` = zero-copy view of the Node Buffer (napi_get_buffer_info), valid during the call
//  - out: `Buffer` from a Rust Vec<u8> = external buffer, no copy; Rust frees it when V8 collects it
// ---------------------------------------------------------------------------

use engine_core::openrtb::{self, Outcome};

/// Builds the OpenRTB line-item index eagerly. Returns the number of line items.
#[napi]
pub fn openrtb_init() -> u32 {
    openrtb::engine().line_items().len() as u32
}

/// Called by server-node once per OpenRTB request: raw body in, JSON response bytes out,
/// `null` for no-bid (HTTP 204). Throws for a malformed request (HTTP 400).
#[napi]
pub fn openrtb_bid(body: BufferSlice) -> Result<Option<Buffer>> {
    match openrtb::engine().handle(&body) {
        Outcome::Body(b) => Ok(Some(b.into())),
        Outcome::NoBid => Ok(None),
        Outcome::Invalid => Err(Error::new(Status::InvalidArg, "invalid bid request")),
    }
}

/// Micro-benchmark only: runs `handle()` over every line of `corpus` (JSON lines), `passes` times,
/// inside Rust in this Node process. Returns mean ns per request.
#[napi]
pub fn probe_openrtb_engine_loop(corpus: BufferSlice, passes: u32) -> f64 {
    let lines: Vec<&[u8]> = corpus.split(|&b| b == b'\n').filter(|l| !l.is_empty()).collect();
    let e = openrtb::engine();
    let start = std::time::Instant::now();
    for _ in 0..passes.max(1) {
        for l in &lines {
            std::hint::black_box(e.handle(std::hint::black_box(l)));
        }
    }
    start.elapsed().as_nanos() as f64 / (lines.len().max(1) as f64 * passes.max(1) as f64)
}

/// Runs the full engine pipeline (`bid_json`, the same work as one bid() call minus the
/// boundary) `iterations` times in a Rust loop and returns the mean ns per iteration.
/// Measures the engine inside the Node process, so it can be compared with bid() sample by
/// sample in the same process, on the same CPU, at the same time.
#[napi]
pub fn probe_engine_loop(request_json: String, iterations: u32) -> f64 {
    let engine = engine_core::engine();
    let n = iterations.max(1);
    let start = std::time::Instant::now();
    for _ in 0..n {
        std::hint::black_box(engine.bid_json(std::hint::black_box(&request_json)).ok());
    }
    start.elapsed().as_nanos() as f64 / n as f64
}
