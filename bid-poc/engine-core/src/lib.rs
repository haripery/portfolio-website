//! `engine-core`: the bidding logic shared by both architectures.
//!
//! * No I/O, no threads, no mutable global state.
//! * Deterministic: the advertiser list is generated from a fixed seed with a
//!   self-contained SplitMix64 PRNG, and all pricing math is integer
//!   micro-currency, so the same input always produces the same output bytes
//!   (no dependency on a `rand` crate version or on float rounding in scoring).
//!
//! Pipeline, see [`Engine::bid_json`]:
//! 1. parse the JSON bid request                                   ([`Engine::parse_request`])
//! 2. filter eligible advertisers (size + device), score each
//!    (base bid x segment-overlap multiplier), pick the highest     ([`Engine::select`])
//! 3. build the HTML creative                                      ([`Engine::build_html`])
//! 4. serialize the JSON response                                  ([`Engine::serialize_response`])

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fmt::{self, Write as _};
use std::sync::LazyLock;

/// Fixed seed for the synthetic advertiser list.
pub const DEFAULT_SEED: u64 = 42;
/// Number of synthetic advertisers held in memory.
pub const DEFAULT_ADVERTISER_COUNT: usize = 1_000;

/// Ad sizes an advertiser can buy (IAB standard units). At most 8 so a set fits in a `u8`.
pub const AD_SIZES: [(u32, u32); 8] = [
    (300, 250),
    (728, 90),
    (320, 50),
    (160, 600),
    (300, 600),
    (970, 250),
    (320, 100),
    (336, 280),
];

/// Audience-segment vocabulary. At most 64 so a set fits in a `u64`.
pub const SEGMENTS: [&str; 48] = [
    "auto-intender",
    "travel",
    "sports",
    "football",
    "basketball",
    "golf",
    "running",
    "cycling",
    "fitness",
    "health",
    "finance",
    "banking",
    "insurance",
    "crypto",
    "real-estate",
    "small-business",
    "jobs",
    "education",
    "students",
    "parenting",
    "pets",
    "home-improvement",
    "diy",
    "gardening",
    "cooking",
    "food",
    "coffee",
    "wine",
    "fashion",
    "beauty",
    "luxury",
    "budget-shopper",
    "tech-early-adopter",
    "smart-home",
    "electric-vehicles",
    "gaming",
    "mobile-gamer",
    "esports",
    "music",
    "movies",
    "streaming",
    "books",
    "anime",
    "photography",
    "art",
    "news-junkie",
    "outdoors",
    "frequent-flyer",
];

/// Scoring: price = base_bid x (1 + 0.25 x matching segments), matches capped at 4 (=> max 2.0x).
pub const SEGMENT_BONUS_BP: u64 = 2_500;
pub const MAX_SEGMENT_MATCHES: u32 = 4;
const BP_SCALE: u64 = 10_000;

// ---------------------------------------------------------------------------
// Request / response types
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Device {
    Mobile,
    Desktop,
    Tv,
}

impl Device {
    pub const ALL: [Device; 3] = [Device::Mobile, Device::Desktop, Device::Tv];

    #[inline]
    fn bit(self) -> u8 {
        1u8 << (self as u8)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct Slot {
    pub w: u32,
    pub h: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct BidRequest {
    pub id: String,
    pub slot: Slot,
    pub device: Device,
    pub url: String,
    pub user_segments: Vec<String>,
}

/// Owned form of the response, used by tests and tools to read a response back.
#[derive(Debug, Clone, PartialEq, Deserialize)]
pub struct BidResponse {
    pub request_id: String,
    pub advertiser_id: String,
    pub price: f64,
    pub html: String,
}

/// Borrowed form used on the hot path (no clones of ids / html).
#[derive(Serialize)]
struct BidResponseOut<'a> {
    request_id: &'a str,
    advertiser_id: &'a str,
    price: f64,
    html: &'a str,
}

#[derive(Debug)]
pub enum BidError {
    InvalidRequest(serde_json::Error),
}

impl fmt::Display for BidError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BidError::InvalidRequest(e) => write!(f, "invalid bid request: {e}"),
        }
    }
}

impl std::error::Error for BidError {}

impl BidError {
    /// The exact HTTP 400 body both servers send, built here so it is byte-identical.
    pub fn to_json_body(&self) -> String {
        serde_json::json!({ "error": self.to_string() }).to_string()
    }
}

// ---------------------------------------------------------------------------
// Advertisers
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Advertiser {
    pub id: String,
    pub sizes: Vec<(u32, u32)>,
    pub devices: Vec<Device>,
    pub target_segments: Vec<&'static str>,
    /// Base bid (CPM) in micro-units of currency: 1_000_000 == 1.00.
    pub base_bid_micros: u64,
    pub click_url: String,
    pub image_url: String,
    // Pre-computed bitsets used on the hot path.
    size_mask: u8,
    device_mask: u8,
    segment_mask: u64,
}

/// SplitMix64: tiny, well-known, integer-only PRNG => identical sequence everywhere.
struct SplitMix64(u64);

impl SplitMix64 {
    fn next_u64(&mut self) -> u64 {
        self.0 = self.0.wrapping_add(0x9E37_79B9_7F4A_7C15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        z ^ (z >> 31)
    }

    /// Uniform-ish integer in `0..n` (modulo bias is irrelevant here; determinism is what matters).
    fn below(&mut self, n: u64) -> u64 {
        self.next_u64() % n
    }

    /// `k` distinct indices from `0..n`, ascending (partial Fisher-Yates).
    fn distinct(&mut self, k: usize, n: usize) -> Vec<usize> {
        let mut pool: Vec<usize> = (0..n).collect();
        for j in 0..k {
            let r = j + self.below((n - j) as u64) as usize;
            pool.swap(j, r);
        }
        let mut picked = pool[..k].to_vec();
        picked.sort_unstable();
        picked
    }
}

/// Score (= bid price) in micro-currency. Integer-exact because base bids are whole cents.
#[inline]
pub fn score_micros(base_bid_micros: u64, segment_overlap: u32) -> u64 {
    let matches = segment_overlap.min(MAX_SEGMENT_MATCHES) as u64;
    base_bid_micros * (BP_SCALE + SEGMENT_BONUS_BP * matches) / BP_SCALE
}

#[inline]
fn size_index(w: u32, h: u32) -> Option<usize> {
    AD_SIZES.iter().position(|&s| s == (w, h))
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

/// The winning advertiser for a request.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Winner {
    /// Index into [`Engine::advertisers`].
    pub index: usize,
    /// Clearing price (CPM) in micro-currency.
    pub price_micros: u64,
    /// Number of the user's segments the advertiser targets (before the cap).
    pub segment_overlap: u32,
}

impl Winner {
    /// Price as a CPM in whole currency units (what goes into the JSON response).
    pub fn price(&self) -> f64 {
        self.price_micros as f64 / 1_000_000.0
    }
}

pub struct Engine {
    advertisers: Vec<Advertiser>,
    segment_ids: HashMap<&'static str, u32>,
}

static DEFAULT_ENGINE: LazyLock<Engine> =
    LazyLock::new(|| Engine::generate(DEFAULT_SEED, DEFAULT_ADVERTISER_COUNT));

/// The process-wide engine both servers use (seed [`DEFAULT_SEED`], [`DEFAULT_ADVERTISER_COUNT`] advertisers).
pub fn engine() -> &'static Engine {
    &DEFAULT_ENGINE
}

impl Engine {
    /// Deterministically generate `count` synthetic advertisers from `seed`.
    pub fn generate(seed: u64, count: usize) -> Engine {
        let mut rng = SplitMix64(seed);
        let mut advertisers = Vec::with_capacity(count);
        for i in 0..count {
            let n = i + 1;
            let id = format!("adv-{n:04}");

            let n_sizes = 1 + rng.below(3) as usize; // 1..=3 sizes
            let size_idx = rng.distinct(n_sizes, AD_SIZES.len());
            let device_mask = 1 + rng.below(7) as u8; // non-empty subset of 3 devices
            let n_segments = 1 + rng.below(5) as usize; // 1..=5 target segments
            let seg_idx = rng.distinct(n_segments, SEGMENTS.len());
            let base_bid_cents = 50 + rng.below(1_151); // CPM 0.50 ..= 12.00

            advertisers.push(Advertiser {
                click_url: format!("https://brand{n:04}.example.com/landing?cid={id}"),
                image_url: format!("https://cdn.adserver.example/creatives/{id}.png"),
                id,
                sizes: size_idx.iter().map(|&s| AD_SIZES[s]).collect(),
                devices: Device::ALL
                    .iter()
                    .copied()
                    .filter(|d| device_mask & d.bit() != 0)
                    .collect(),
                target_segments: seg_idx.iter().map(|&s| SEGMENTS[s]).collect(),
                base_bid_micros: base_bid_cents * 10_000,
                size_mask: size_idx.iter().fold(0u8, |m, &s| m | (1 << s)),
                device_mask,
                segment_mask: seg_idx.iter().fold(0u64, |m, &s| m | (1 << s)),
            });
        }
        let segment_ids = SEGMENTS
            .iter()
            .enumerate()
            .map(|(i, &s)| (s, i as u32))
            .collect();
        Engine {
            advertisers,
            segment_ids,
        }
    }

    pub fn advertisers(&self) -> &[Advertiser] {
        &self.advertisers
    }

    /// Full pipeline: raw JSON string in, JSON string out. `Ok(None)` means "no bid".
    pub fn bid_json(&self, input: &str) -> Result<Option<String>, BidError> {
        let req = Self::parse_request(input)?;
        Ok(self.select(&req).map(|winner| {
            let html = self.build_html(&req, &winner);
            self.serialize_response(&req, &winner, &html)
        }))
    }

    /// Step 1: parse.
    pub fn parse_request(input: &str) -> Result<BidRequest, BidError> {
        serde_json::from_str(input).map_err(BidError::InvalidRequest)
    }

    /// Step 2: filter (size + device), score (base bid x segment-overlap multiplier), pick the highest.
    /// Ties go to the advertiser with the lowest index.
    pub fn select(&self, req: &BidRequest) -> Option<Winner> {
        let size_bit = 1u8 << size_index(req.slot.w, req.slot.h)?;
        let device_bit = req.device.bit();
        let user_mask = self.user_segment_mask(&req.user_segments);

        let mut best: Option<Winner> = None;
        for (index, adv) in self.advertisers.iter().enumerate() {
            if adv.size_mask & size_bit == 0 || adv.device_mask & device_bit == 0 {
                continue;
            }
            let segment_overlap = (adv.segment_mask & user_mask).count_ones();
            let price_micros = score_micros(adv.base_bid_micros, segment_overlap);
            if best.is_none_or(|b| price_micros > b.price_micros) {
                best = Some(Winner {
                    index,
                    price_micros,
                    segment_overlap,
                });
            }
        }
        best
    }

    fn user_segment_mask(&self, segments: &[String]) -> u64 {
        segments.iter().fold(0u64, |mask, s| {
            match self.segment_ids.get(s.as_str()) {
                Some(&bit) => mask | (1u64 << bit),
                None => mask, // unknown segments are ignored
            }
        })
    }

    /// Step 3: HTML creative = image wrapped in a click-through link, a 1x1 tracking
    /// pixel, and a small inline viewability script (50% visible for 1s => beacon).
    /// Request-controlled values are HTML-escaped in attributes and percent-encoded in URLs.
    pub fn build_html(&self, req: &BidRequest, winner: &Winner) -> String {
        let adv = &self.advertisers[winner.index];
        let (w, h) = (req.slot.w, req.slot.h);
        let mut out = String::with_capacity(1_400);

        out.push_str(r#"<div class="ad" data-adv=""#);
        out.push_str(&adv.id);
        out.push_str(r#"" data-req=""#);
        push_html_escaped(&mut out, &req.id);
        let _ = write!(
            out,
            r#"" style="position:relative;overflow:hidden;width:{w}px;height:{h}px">"#
        );

        // click-through link + image
        out.push_str(r#"<a href=""#);
        out.push_str(&adv.click_url);
        out.push_str("&amp;req=");
        push_pct_encoded(&mut out, &req.id);
        out.push_str(r#"" target="_blank" rel="noopener noreferrer"><img src=""#);
        out.push_str(&adv.image_url);
        let _ = write!(
            out,
            r#"" width="{w}" height="{h}" alt="Advertisement" style="display:block;border:0"></a>"#
        );

        // impression tracking pixel
        out.push_str(r#"<img src="https://track.adserver.example/imp?adv="#);
        out.push_str(&adv.id);
        out.push_str("&amp;req=");
        push_pct_encoded(&mut out, &req.id);
        let _ = write!(out, "&amp;cpm_micros={}&amp;page=", winner.price_micros);
        push_pct_encoded(&mut out, &req.url);
        out.push_str(
            r#"" width="1" height="1" alt="" style="position:absolute;left:-9999px">"#,
        );

        // viewability script
        out.push_str(concat!(
            r#"<script>(function(){var s=document.currentScript,el=s&&s.parentNode;"#,
            r#"if(!el||!("IntersectionObserver" in window))return;"#,
            r#"var t=0,o=new IntersectionObserver(function(es){if(es[0].intersectionRatio>=0.5){"#,
            r#"if(!t)t=setTimeout(function(){o.disconnect();"#,
            r#"new Image().src="https://track.adserver.example/view?adv="#,
        ));
        out.push_str(&adv.id);
        out.push_str("&req=");
        push_pct_encoded(&mut out, &req.id);
        out.push_str(concat!(
            r#""},1000)}else if(t){clearTimeout(t);t=0}},{threshold:[0,0.5]});"#,
            r#"o.observe(el)})();</script></div>"#,
        ));
        out
    }

    /// Step 4: serialize `{ request_id, advertiser_id, price, html }`.
    pub fn serialize_response(&self, req: &BidRequest, winner: &Winner, html: &str) -> String {
        let out = BidResponseOut {
            request_id: &req.id,
            advertiser_id: &self.advertisers[winner.index].id,
            price: winner.price(),
            html,
        };
        serde_json::to_string(&out).expect("serializing strings and a finite f64 cannot fail")
    }
}

/// Escape for an HTML attribute value.
fn push_html_escaped(out: &mut String, s: &str) {
    for c in s.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&#39;"),
            _ => out.push(c),
        }
    }
}

/// Percent-encode everything except RFC 3986 unreserved characters.
fn push_pct_encoded(out: &mut String, s: &str) {
    const HEX: &[u8; 16] = b"0123456789ABCDEF";
    for &b in s.as_bytes() {
        if b.is_ascii_alphanumeric() || matches!(b, b'-' | b'.' | b'_' | b'~') {
            out.push(b as char);
        } else {
            out.push('%');
            out.push(HEX[(b >> 4) as usize] as char);
            out.push(HEX[(b & 0x0F) as usize] as char);
        }
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    /// The exact payload used by every benchmark (bench/payload.json).
    const BENCH_PAYLOAD: &str = include_str!("../../bench/payload.json");

    fn winner_of(input: &str) -> Option<(String, f64)> {
        engine()
            .bid_json(input)
            .expect("valid request")
            .map(|json| {
                let r: BidResponse = serde_json::from_str(&json).expect("valid response JSON");
                (r.advertiser_id, r.price)
            })
    }

    /// Independent, deliberately naive reference implementation: string comparisons on the
    /// human-readable advertiser fields (no bitsets), same scoring rule, same tie-break.
    fn reference_winner(e: &Engine, req: &BidRequest) -> Option<(String, u64)> {
        let mut best: Option<(String, u64)> = None;
        for adv in e.advertisers() {
            let size_ok = adv.sizes.iter().any(|&(w, h)| w == req.slot.w && h == req.slot.h);
            let device_ok = adv.devices.contains(&req.device);
            if !(size_ok && device_ok) {
                continue;
            }
            let overlap = adv
                .target_segments
                .iter()
                .filter(|t| req.user_segments.iter().any(|u| u == *t))
                .count() as u64;
            let price = adv.base_bid_micros * (10_000 + 2_500 * overlap.min(4)) / 10_000;
            if best.as_ref().is_none_or(|(_, p)| price > *p) {
                best = Some((adv.id.clone(), price));
            }
        }
        best
    }

    // Golden winners. Expected values were recorded from this implementation
    // (`cargo run -p engine-core --example inspect`); `matches_reference_implementation`
    // below checks the same logic independently.
    #[test]
    fn golden_bench_payload() {
        assert_eq!(winner_of(BENCH_PAYLOAD), Some(("adv-0330".into(), 15.21)));
    }

    #[test]
    fn golden_desktop_leaderboard() {
        let input = r#"{"id":"golden-desktop","slot":{"w":728,"h":90},"device":"desktop","url":"https://shop.example.com/","user_segments":["fashion","luxury","beauty"]}"#;
        assert_eq!(winner_of(input), Some(("adv-0066".into(), 14.55)));
    }

    #[test]
    fn golden_tv_billboard() {
        let input = r#"{"id":"golden-tv","slot":{"w":970,"h":250},"device":"tv","url":"https://stream.example.com/watch/42","user_segments":["streaming","movies","anime","music"]}"#;
        assert_eq!(winner_of(input), Some(("adv-0344".into(), 14.0625)));
    }

    #[test]
    fn golden_no_segments() {
        let input = r#"{"id":"golden-nosegs","slot":{"w":320,"h":50},"device":"mobile","url":"https://m.example.com/","user_segments":[]}"#;
        assert_eq!(winner_of(input), Some(("adv-0751".into(), 11.97)));
    }

    #[test]
    fn unknown_size_is_no_bid() {
        let input = r#"{"id":"golden-nobid","slot":{"w":1,"h":1},"device":"desktop","url":"https://x.example.com/","user_segments":["travel"]}"#;
        assert_eq!(engine().bid_json(input).unwrap(), None);
    }

    #[test]
    fn same_seed_same_advertisers_and_bytes() {
        let a = Engine::generate(DEFAULT_SEED, DEFAULT_ADVERTISER_COUNT);
        let b = Engine::generate(DEFAULT_SEED, DEFAULT_ADVERTISER_COUNT);
        assert_eq!(a.advertisers(), b.advertisers());
        assert_eq!(a.advertisers().len(), 1_000);
        let first = a.bid_json(BENCH_PAYLOAD).unwrap().unwrap();
        for _ in 0..100 {
            assert_eq!(b.bid_json(BENCH_PAYLOAD).unwrap().unwrap(), first);
        }
        assert_ne!(
            Engine::generate(DEFAULT_SEED + 1, DEFAULT_ADVERTISER_COUNT).advertisers(),
            a.advertisers(),
            "a different seed must give a different list"
        );
    }

    #[test]
    fn generated_advertisers_are_well_formed() {
        for adv in engine().advertisers() {
            assert!((1..=3).contains(&adv.sizes.len()), "{adv:?}");
            assert!((1..=3).contains(&adv.devices.len()), "{adv:?}");
            assert!((1..=5).contains(&adv.target_segments.len()), "{adv:?}");
            assert!((500_000..=12_000_000).contains(&adv.base_bid_micros), "{adv:?}");
            assert_eq!(adv.base_bid_micros % 10_000, 0, "whole cents");
        }
    }

    #[test]
    fn matches_reference_implementation() {
        let e = engine();
        let mut rng = SplitMix64(0xC0FFEE);
        let extra_sizes = [(1u32, 1u32), (300, 251), (468, 60)]; // nobody buys these
        let mut bids = 0;
        for i in 0..5_000 {
            let slot = if rng.below(10) == 0 {
                extra_sizes[rng.below(3) as usize]
            } else {
                AD_SIZES[rng.below(8) as usize]
            };
            let n_seg = rng.below(7) as usize;
            let mut user_segments: Vec<String> = rng
                .distinct(n_seg, SEGMENTS.len())
                .into_iter()
                .map(|s| SEGMENTS[s].to_string())
                .collect();
            if rng.below(4) == 0 {
                user_segments.push("not-a-known-segment".into());
            }
            let req = BidRequest {
                id: format!("r{i}"),
                slot: Slot { w: slot.0, h: slot.1 },
                device: Device::ALL[rng.below(3) as usize],
                url: "https://example.com/".into(),
                user_segments,
            };
            let fast = e.select(&req).map(|w| (e.advertisers()[w.index].id.clone(), w.price_micros));
            assert_eq!(fast, reference_winner(e, &req), "request {req:?}");
            bids += fast.is_some() as u32;
        }
        assert!(bids > 4_000, "most random requests should produce a bid, got {bids}");
    }

    #[test]
    fn scoring_rule() {
        assert_eq!(score_micros(1_000_000, 0), 1_000_000);
        assert_eq!(score_micros(1_000_000, 1), 1_250_000);
        assert_eq!(score_micros(1_000_000, 4), 2_000_000);
        assert_eq!(score_micros(1_000_000, 9), 2_000_000, "capped at 4 matches");
    }

    #[test]
    fn response_shape_and_html() {
        let json = engine().bid_json(BENCH_PAYLOAD).unwrap().unwrap();
        let r: BidResponse = serde_json::from_str(&json).unwrap();
        assert_eq!(r.request_id, "req-000001");
        let adv = engine()
            .advertisers()
            .iter()
            .find(|a| a.id == r.advertiser_id)
            .unwrap();
        assert!(r.html.contains(&format!(r#"<img src="{}" width="300" height="250""#, adv.image_url)));
        assert!(r.html.contains(&format!(r#"<a href="{}&amp;req=req-000001""#, adv.click_url)));
        assert!(r.html.contains("https://track.adserver.example/imp?adv="));
        assert!(r.html.contains("IntersectionObserver"));
        assert!(r.html.contains("page=https%3A%2F%2Fnews.example.com%2Fsports%2Farticle-123%3Futm_source%3Dfeed"));
        // keys in the documented order
        let order: Vec<usize> = ["request_id", "advertiser_id", "price", "html"]
            .iter()
            .map(|k| json.find(&format!("\"{k}\":")).unwrap())
            .collect();
        assert!(order.windows(2).all(|p| p[0] < p[1]), "{json}");
    }

    #[test]
    fn request_values_are_escaped() {
        let input = r#"{"id":"x\"><script>alert(1)</script>","slot":{"w":300,"h":250},"device":"mobile","url":"https://e.com/?a=1&b=<2>","user_segments":["sports"]}"#;
        let r: BidResponse =
            serde_json::from_str(&engine().bid_json(input).unwrap().unwrap()).unwrap();
        assert_eq!(r.request_id, "x\"><script>alert(1)</script>");
        assert!(!r.html.contains("<script>alert"), "{}", r.html);
        assert!(r.html.contains(r#"data-req="x&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;""#));
        assert!(r.html.contains("page=https%3A%2F%2Fe.com%2F%3Fa%3D1%26b%3D%3C2%3E"));
    }

    #[test]
    fn invalid_requests_are_errors() {
        for bad in [
            "",
            "not json",
            r#"{"id":"a"}"#,
            r#"{"id":"a","slot":{"w":300,"h":250},"device":"watch","url":"u","user_segments":[]}"#,
            r#"{"id":"a","slot":{"w":-1,"h":250},"device":"tv","url":"u","user_segments":[]}"#,
        ] {
            let err = engine().bid_json(bad).unwrap_err();
            let body: serde_json::Value = serde_json::from_str(&err.to_json_body()).unwrap();
            assert!(body["error"].as_str().unwrap().starts_with("invalid bid request: "));
        }
    }
}
