//! Writes the OpenRTB request corpus as JSON lines (one bid request per line) to stdout, and a
//! summary of what the engine does with it to stderr.
//!   cargo run --release -p engine-core --example gen_openrtb -- [count] [seed] > corpus.jsonl
use engine_core::openrtb::{self, corpus, Outcome};
use std::io::Write;

fn main() {
    let mut args = std::env::args().skip(1);
    let n: usize = args.next().and_then(|s| s.parse().ok()).unwrap_or(corpus::DEFAULT_CORPUS_SIZE);
    let seed: u64 = args.next().and_then(|s| s.parse().ok()).unwrap_or(corpus::DEFAULT_CORPUS_SEED);
    let reqs = corpus::generate(seed, n);
    let e = openrtb::engine();
    let (mut bid, mut nobid, mut imps, mut bids, mut bytes_out) = (0usize, 0usize, 0usize, 0usize, 0usize);
    let mut sizes: Vec<usize> = reqs.iter().map(String::len).collect();
    sizes.sort_unstable();
    let mut out = std::io::BufWriter::new(std::io::stdout().lock());
    for r in &reqs {
        writeln!(out, "{r}").unwrap();
        imps += serde_json::from_str::<serde_json::Value>(r).unwrap()["imp"].as_array().unwrap().len();
        match e.handle(r.as_bytes()) {
            Outcome::Body(b) => {
                bid += 1;
                bids += serde_json::from_slice::<serde_json::Value>(&b).unwrap()["seatbid"][0]["bid"].as_array().unwrap().len();
                bytes_out += b.len();
            }
            Outcome::NoBid => nobid += 1,
            Outcome::Invalid => panic!("invalid corpus request"),
        }
    }
    eprintln!(
        "requests={n} seed={seed} line_items={} | request bytes: mean={} p50={} p90={} max={} | imps={imps} ({:.2}/request)",
        e.line_items().len(),
        sizes.iter().sum::<usize>() / n,
        sizes[n / 2],
        sizes[n * 9 / 10],
        sizes[n - 1],
        imps as f64 / n as f64
    );
    eprintln!(
        "outcomes: 200 with bids={bid} ({:.1}%), 204 no-bid={nobid} ({:.1}%) | bids={bids} | bid response bytes mean={}",
        100.0 * bid as f64 / n as f64,
        100.0 * nobid as f64 / n as f64,
        bytes_out / bid.max(1)
    );
}
