//! VM stability check (diagnostic, not a benchmark of the architectures).
//!
//! Runs `bid_json()` on bench/payload.json for `secs` seconds and prints the mean
//! ns/iteration of every 250 ms window. Running one copy pinned to each CPU at the same
//! time shows whether the CPUs run at equal speed, and whether that speed is stable.
//!
//!   cargo run --release -p engine-core --example speed_check -- <secs> <label>
use engine_core::engine;
use std::hint::black_box;
use std::time::{Duration, Instant};

fn main() {
    let mut args = std::env::args().skip(1);
    let secs: f64 = args.next().and_then(|s| s.parse().ok()).unwrap_or(10.0);
    let label = args.next().unwrap_or_else(|| "-".into());
    let payload = include_str!("../../bench/payload.json");
    let e = engine();
    for _ in 0..10_000 {
        black_box(e.bid_json(black_box(payload)).ok()); // warm-up
    }
    let window = Duration::from_millis(250);
    let end = Instant::now() + Duration::from_secs_f64(secs);
    let mut series = Vec::new();
    while Instant::now() < end {
        let t0 = Instant::now();
        let mut n = 0u64;
        while t0.elapsed() < window {
            for _ in 0..100 {
                black_box(e.bid_json(black_box(payload)).ok());
            }
            n += 100;
        }
        series.push(t0.elapsed().as_nanos() as f64 / n as f64);
    }
    let mut sorted = series.clone();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let q = |p: f64| sorted[((sorted.len() - 1) as f64 * p).round() as usize];
    println!(
        "{label}: windows={} min={:.0} p10={:.0} median={:.0} p90={:.0} max={:.0} ns/iter",
        sorted.len(),
        q(0.0),
        q(0.1),
        q(0.5),
        q(0.9),
        q(1.0)
    );
    println!(
        "{label}: series(ns/iter per 250ms) {}",
        series.iter().map(|x| format!("{x:.0}")).collect::<Vec<_>>().join(" ")
    );
}
