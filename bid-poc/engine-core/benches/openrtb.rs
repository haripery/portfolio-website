//! Criterion: the OpenRTB engine called directly from Rust (no HTTP, no FFI), cycling through a
//! corpus of realistic requests, so the time is the average over the request mix.
//!
//!   cargo bench -p engine-core --bench openrtb
use criterion::{criterion_group, criterion_main, Criterion};
use engine_core::openrtb::{self, corpus, BidRequest};
use std::hint::black_box;

fn benches(c: &mut Criterion) {
    let e = openrtb::engine();
    let corpus = corpus::generate(corpus::DEFAULT_CORPUS_SEED, 10_000);
    let gz: Vec<Vec<u8>> = corpus.iter().take(2_000).map(|r| openrtb::gzip(r.as_bytes())).collect();
    let mut g = c.benchmark_group("openrtb");
    g.bench_function("handle_json/corpus", |b| {
        let mut i = 0;
        b.iter(|| {
            let r = &corpus[i % corpus.len()];
            i += 1;
            e.handle(black_box(r.as_bytes()), false, false)
        })
    });
    g.bench_function("handle_gzip_in_out/corpus", |b| {
        let mut i = 0;
        b.iter(|| {
            let r = &gz[i % gz.len()];
            i += 1;
            e.handle(black_box(r), true, true)
        })
    });
    g.bench_function("parse_only/corpus", |b| {
        let mut i = 0;
        b.iter(|| {
            let r = &corpus[i % corpus.len()];
            i += 1;
            serde_json::from_str::<BidRequest>(black_box(r)).map(|r| r.imp.len())
        })
    });
    g.finish();
}

criterion_group!(openrtb_benches, benches);
criterion_main!(openrtb_benches);
