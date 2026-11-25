//! Deterministic corpus of small, realistic OpenRTB 2.6 bid requests for image (banner) ads.
//!
//! Each request has the usual parts (imp with banner formats and a floor, site or app, device with
//! geo, user with data segments, auction type, tmax, block lists), and the mix includes the cases a
//! bidder must decline: sizes nobody buys, high floors, non-USD floors, private auctions.
//!
//!   cargo run --release -p engine-core --example gen_openrtb -- 1000 > corpus.jsonl
use super::{ADVERTISER_DOMAINS, COUNTRIES, DATA_PROVIDERS, SEGMENT_BASE};
use crate::SplitMix64;
use serde_json::{json, Value};

pub const DEFAULT_CORPUS_SEED: u64 = 7;
pub const DEFAULT_CORPUS_SIZE: usize = 1_000;

const EXTRA_COUNTRIES: [&str; 3] = ["CHE", "THA", "EGY"]; // no line item targets these
const EXTRA_SIZES: [(u32, u32); 3] = [(468, 60), (120, 600), (970, 90)]; // no line item buys these

struct G(SplitMix64);

impl G {
    fn n(&mut self, k: u64) -> u64 {
        self.0.below(k)
    }
    fn pct(&mut self, p: u64) -> bool {
        self.0.below(100) < p
    }
    fn hex(&mut self, len: usize) -> String {
        let mut s = format!("{:016x}{:016x}", self.0.next_u64(), self.0.next_u64());
        s.truncate(len);
        s
    }
    fn iab(&mut self) -> String {
        if self.pct(30) {
            format!("IAB{}", 1 + self.n(26))
        } else {
            format!("IAB{}-{}", 1 + self.n(26), 1 + self.n(12))
        }
    }
}

const UAS: [&str; 4] = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
];

fn imp(g: &mut G, i: usize) -> Value {
    let n_formats = if g.pct(60) { 1 } else { 2 };
    let formats: Vec<Value> = (0..n_formats)
        .map(|_| {
            let (w, h) = if g.pct(85) { crate::AD_SIZES[g.n(8) as usize] } else { EXTRA_SIZES[g.n(3) as usize] };
            json!({ "w": w, "h": h })
        })
        .collect();
    let mut imp = json!({ "id": (i + 1).to_string(), "banner": { "format": formats, "pos": g.n(4) }, "tagid": format!("slot-{}", i + 1), "secure": 1 });
    match g.n(100) {
        0..=24 => {}
        25..=84 => imp["bidfloor"] = json!((10 + g.n(191)) as f64 / 100.0), // 0.10 .. 2.00
        _ => imp["bidfloor"] = json!((200 + g.n(1301)) as f64 / 100.0),     // 2.00 .. 15.00
    }
    if g.pct(5) {
        imp["bidfloorcur"] = json!("EUR"); // this bidder only understands USD floors -> no bid on this imp
    }
    if g.pct(3) {
        imp["pmp"] = json!({ "private_auction": 1, "deals": [{ "id": format!("deal-{}", g.hex(6)), "bidfloor": 5.0 }] });
    }
    imp
}

/// One request, as a compact JSON line.
fn request(outer: &mut SplitMix64) -> String {
    let g = &mut G(SplitMix64(outer.next_u64()));
    let n_imps = if g.pct(80) { 1 } else { 2 };
    let imps: Vec<Value> = (0..n_imps).map(|i| imp(g, i)).collect();
    let country = if g.pct(45) {
        "USA"
    } else if g.pct(90) {
        COUNTRIES[g.n(COUNTRIES.len() as u64) as usize]
    } else {
        EXTRA_COUNTRIES[g.n(3) as usize]
    };
    let mut device = json!({
        "ua": UAS[g.n(4) as usize],
        "ip": format!("198.51.{}.{}", g.n(256), g.n(256)),
        "geo": { "country": country }
    });
    if g.pct(95) {
        let devicetype = [1, 2, 2, 3, 4, 4, 5][g.n(7) as usize];
        device["devicetype"] = json!(devicetype);
    }
    let mut user = json!({ "id": g.hex(16) });
    let n_data = g.n(3);
    if n_data > 0 {
        let data: Vec<Value> = (0..n_data)
            .map(|_| {
                let provider = if g.pct(90) { DATA_PROVIDERS[g.n(4) as usize] } else { "dp9" };
                let segs: Vec<Value> = (0..g.n(7)).map(|_| json!({ "id": (SEGMENT_BASE + g.n(80) as u32).to_string() })).collect();
                json!({ "id": provider, "segment": segs })
            })
            .collect();
        user["data"] = json!(data);
    }
    let at = if g.pct(80) { 1 } else { 2 };
    let tmax = [100, 120, 150, 200, 300][g.n(5) as usize];
    let mut req = json!({
        "id": g.hex(16),
        "imp": imps,
        "device": device,
        "user": user,
        "at": at,
        "tmax": tmax,
        "cur": ["USD"],
        "regs": { "coppa": 0 }
    });
    let cat = g.iab();
    if g.pct(65) {
        let site = g.n(3000);
        req["site"] = json!({ "id": g.hex(8), "domain": format!("news{site}.example"),
                               "page": format!("https://news{site}.example/a/{}", g.n(100_000)), "cat": [cat], "publisher": { "id": format!("pub-{}", g.n(1000)) } });
    } else {
        req["app"] = json!({ "id": g.hex(8), "bundle": format!("com.example.app{}", g.n(5000)), "cat": [cat],
                              "publisher": { "id": format!("pub-{}", g.n(1000)) } });
    }
    let n_bcat = g.n(4);
    if n_bcat > 0 {
        req["bcat"] = json!((0..n_bcat).map(|_| g.iab()).collect::<Vec<_>>());
    }
    let n_badv = g.n(3);
    if n_badv > 0 {
        req["badv"] = json!((0..n_badv).map(|_| format!("brand{:04}.example", 1 + g.n(ADVERTISER_DOMAINS as u64))).collect::<Vec<_>>());
    }
    if g.pct(2) {
        req["newfield2030"] = json!({ "future": true }); // unknown fields must be tolerated (spec 2.6)
    }
    serde_json::to_string(&req).expect("serialize request")
}

/// `n` requests from `seed`.
pub fn generate(seed: u64, n: usize) -> Vec<String> {
    let mut rng = SplitMix64(seed);
    (0..n).map(|_| request(&mut rng)).collect()
}
