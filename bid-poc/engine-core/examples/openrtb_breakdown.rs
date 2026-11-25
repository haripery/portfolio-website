//! Where the OpenRTB engine's time goes, per stage, averaged over the corpus.
//!   cargo run --release -p engine-core --example openrtb_breakdown -- [corpus requests] [passes]
use engine_core::openrtb::{self, corpus, BidRequest};
use std::hint::black_box;
use std::time::Instant;

fn main() {
    let mut args = std::env::args().skip(1);
    let n: usize = args.next().and_then(|s| s.parse().ok()).unwrap_or(10_000);
    let passes: usize = args.next().and_then(|s| s.parse().ok()).unwrap_or(5);
    let reqs = corpus::generate(corpus::DEFAULT_CORPUS_SEED, n);
    let e = openrtb::engine();
    let (mut parse, mut decide, mut render, mut total) = (0u128, 0u128, 0u128, 0u128);
    for pass in 0..=passes {
        for r in &reqs {
            let t0 = Instant::now();
            let req: BidRequest = serde_json::from_str(black_box(r)).unwrap();
            let t1 = Instant::now();
            let d = e.decide(&req);
            let t2 = Instant::now();
            let out = e.render(&req, &d);
            let t3 = Instant::now();
            black_box(out);
            if pass > 0 {
                // pass 0 is warm-up
                parse += (t1 - t0).as_nanos();
                decide += (t2 - t1).as_nanos();
                render += (t3 - t2).as_nanos();
                total += (t3 - t0).as_nanos();
            }
        }
    }
    let k = (n * passes) as f64;
    println!(
        "line_items={} requests={n} passes={passes}: mean ns per request: parse={:.0} decide={:.0} render+serialize={:.0} total={:.0}",
        e.line_items().len(),
        parse as f64 / k,
        decide as f64 / k,
        render as f64 / k,
        total as f64 / k
    );
}
