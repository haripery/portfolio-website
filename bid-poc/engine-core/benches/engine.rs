//! Criterion micro-benchmarks of engine-core called directly from Rust.
//!
//! `bid_json/direct` does the same work as one napi `bid()` call minus the JS<->Rust
//! boundary: &str in -> parse -> select -> html -> serialize -> String out (dropped).
//! The `stages/*` benches split that pipeline up.
//!
//!   cargo bench -p engine-core --bench engine
use criterion::{criterion_group, criterion_main, Criterion};
use engine_core::{engine, Engine};
use std::hint::black_box;

const PAYLOAD: &str = include_str!("../../bench/payload.json");

fn benches(c: &mut Criterion) {
    let e = engine();
    let req = Engine::parse_request(PAYLOAD).unwrap();
    let winner = e.select(&req).unwrap();
    let html = e.build_html(&req, &winner);

    c.bench_function("bid_json/direct", |b| b.iter(|| e.bid_json(black_box(PAYLOAD))));

    let mut g = c.benchmark_group("stages");
    g.bench_function("1_parse_request", |b| {
        b.iter(|| Engine::parse_request(black_box(PAYLOAD)))
    });
    g.bench_function("2_select_winner", |b| b.iter(|| e.select(black_box(&req))));
    g.bench_function("3_build_html", |b| {
        b.iter(|| e.build_html(black_box(&req), black_box(&winner)))
    });
    g.bench_function("4_serialize_response", |b| {
        b.iter(|| e.serialize_response(black_box(&req), black_box(&winner), black_box(&html)))
    });
    g.finish();
}

criterion_group!(engine_benches, benches);
criterion_main!(engine_benches);
