//! Prints the winner for a few fixed inputs and the first advertisers.
//! Used to record the golden values in the unit tests:
//!   cargo run -p engine-core --example inspect
use engine_core::{engine, BidResponse, Engine};

const INPUTS: &[(&str, &str)] = &[
    ("bench payload", include_str!("../../bench/payload.json")),
    ("desktop leaderboard", r#"{"id":"golden-desktop","slot":{"w":728,"h":90},"device":"desktop","url":"https://shop.example.com/","user_segments":["fashion","luxury","beauty"]}"#),
    ("tv billboard", r#"{"id":"golden-tv","slot":{"w":970,"h":250},"device":"tv","url":"https://stream.example.com/watch/42","user_segments":["streaming","movies","anime","music"]}"#),
    ("no segments", r#"{"id":"golden-nosegs","slot":{"w":320,"h":50},"device":"mobile","url":"https://m.example.com/","user_segments":[]}"#),
    ("unknown size", r#"{"id":"golden-nobid","slot":{"w":1,"h":1},"device":"desktop","url":"https://x.example.com/","user_segments":["travel"]}"#),
];

fn main() {
    let e = engine();
    println!("advertisers: {}", e.advertisers().len());
    for a in &e.advertisers()[..3] {
        println!("  {a:?}");
    }
    for (name, input) in INPUTS {
        let req = Engine::parse_request(input).unwrap();
        let eligible = e
            .advertisers()
            .iter()
            .filter(|a| a.sizes.contains(&(req.slot.w, req.slot.h)) && a.devices.contains(&req.device))
            .count();
        match e.bid_json(input).unwrap() {
            Some(json) => {
                let r: BidResponse = serde_json::from_str(&json).unwrap();
                let w = e.select(&req).unwrap();
                println!(
                    "{name}: eligible={eligible} winner={} price={} overlap={} response_bytes={}",
                    r.advertiser_id,
                    r.price,
                    w.segment_overlap,
                    json.len()
                );
            }
            None => println!("{name}: eligible={eligible} no bid"),
        }
    }
    println!("\nbench payload response:\n{}", e.bid_json(INPUTS[0].1).unwrap().unwrap());
}
