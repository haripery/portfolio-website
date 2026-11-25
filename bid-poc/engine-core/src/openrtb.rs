//! A small OpenRTB 2.6 bidder for image (banner) ads, shared by both architectures like the v1 engine.
//!
//! Deliberately a subset of the spec (no video, audio or native; no gzip; no deals).
//! Spec: IAB Tech Lab OpenRTB 2.6, <https://github.com/InteractiveAdvertisingBureau/openrtb2.x> (`2.6.md`).
//!
//! | Behaviour                                                              | Spec                          |
//! |------------------------------------------------------------------------|-------------------------------|
//! | parse a BidRequest; unknown fields are ignored                         | 3.2.1; 2.6 "Versioning"       |
//! | `id` + at least one `imp` required, otherwise invalid (HTTP 400)       | 3.2.1; 2.1                    |
//! | bid only on banner impressions; video/audio/native-only imps: no bid   | 3.2.4, 3.2.6, 3.2.10          |
//! | floor `imp.bidfloor`; only USD floors are understood, others: no bid   | 3.2.4                         |
//! | `pmp.private_auction = 1` is not bid on (this bidder has no deals)     | 3.2.11                        |
//! | `bcat` (a parent category blocks its children) and `badv`              | 3.2.1                         |
//! | device type, geo country and user data segments as targeting           | AdCOM device types; 3.2.18-22 |
//! | first price (`at` = 1): bid 85% of the value, never below the floor    | 3.2.1                         |
//! | BidResponse / SeatBid / Bid; `${AUCTION_PRICE}` in `nurl`, `burl`, `adm` | 4.2, 4.4                    |
//! | no bid -> HTTP 204 with no body                                        | 2.1; 7.1                      |
//!
//! Price math is integer micro-USD, as the spec recommends for currencies (4.2.3).

use crate::SplitMix64;
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::collections::HashMap;
use std::fmt::Write as _;
use std::sync::LazyLock;

pub mod corpus;

pub const DEFAULT_SEED: u64 = 2026;
pub const DEFAULT_LINE_ITEMS: usize = 2_000;
/// Our buyer seat (`seatbid.seat`).
pub const SEAT: &str = "dsp-poc";
/// Requests larger than this are rejected as invalid.
pub const MAX_BODY_BYTES: usize = 1 << 20;
/// First-price shading: bid 85% of our value, but never below the floor.
pub const FIRST_PRICE_SHADE_PCT: u64 = 85;

pub const BANNER_SIZES: [(u32, u32); 8] = crate::AD_SIZES;
/// Countries line items can target (ISO-3166-1 alpha-3, as in `geo.country`).
pub const COUNTRIES: [&str; 20] = [
    "USA", "GBR", "DEU", "FRA", "CAN", "AUS", "IND", "BRA", "JPN", "ESP", "ITA", "NLD", "SWE", "MEX",
    "KOR", "POL", "TUR", "ARG", "ZAF", "NZL",
];
/// Data providers (`user.data[].id`) whose segments (`segment[].id` "1000".."1063") we can use.
pub const DATA_PROVIDERS: [&str; 4] = ["dp1", "dp2", "dp3", "dp4"];
pub const SEGMENT_BASE: u32 = 1000;
pub const SEGMENTS_PER_PROVIDER: u32 = 64;
pub const ADVERTISER_DOMAINS: usize = 400;

// ---------------------------------------------------------------------------
// Bid request: only the fields this bidder reads. Everything else (site, app, regs, source,
// ext, ...) is still parsed as JSON, then ignored.
// ---------------------------------------------------------------------------

/// A borrowed-when-possible string inside arrays (`Vec<Cow<str>>` alone would always copy).
#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(transparent)]
pub struct Str<'a>(#[serde(borrow)] pub Cow<'a, str>);

#[derive(Debug, Deserialize)]
pub struct BidRequest<'a> {
    #[serde(borrow)]
    pub id: Cow<'a, str>,
    #[serde(borrow)]
    pub imp: Vec<Imp<'a>>,
    #[serde(borrow, default)]
    pub device: Option<Device<'a>>,
    #[serde(borrow, default)]
    pub user: Option<User<'a>>,
    #[serde(default = "default_at")]
    pub at: u32,
    #[serde(borrow, default)]
    pub bcat: Vec<Str<'a>>,
    #[serde(borrow, default)]
    pub badv: Vec<Str<'a>>,
}

fn default_at() -> u32 {
    2
}

#[derive(Debug, Deserialize)]
pub struct Imp<'a> {
    #[serde(borrow)]
    pub id: Cow<'a, str>,
    #[serde(default)]
    pub banner: Option<Banner>,
    #[serde(default)]
    pub bidfloor: f64,
    #[serde(borrow, default)]
    pub bidfloorcur: Option<Cow<'a, str>>,
    #[serde(default)]
    pub pmp: Option<Pmp>,
}

#[derive(Debug, Default, Deserialize)]
pub struct Banner {
    #[serde(default)]
    pub format: Vec<Format>,
    pub w: Option<u32>,
    pub h: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct Format {
    pub w: Option<u32>,
    pub h: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct Pmp {
    #[serde(default)]
    pub private_auction: u8,
}

#[derive(Debug, Deserialize)]
pub struct Device<'a> {
    pub devicetype: Option<u8>,
    #[serde(borrow, default)]
    pub geo: Option<Geo<'a>>,
}

#[derive(Debug, Deserialize)]
pub struct Geo<'a> {
    #[serde(borrow, default)]
    pub country: Option<Cow<'a, str>>,
}

#[derive(Debug, Deserialize)]
pub struct User<'a> {
    #[serde(borrow, default)]
    pub data: Vec<Data<'a>>,
}

#[derive(Debug, Deserialize)]
pub struct Data<'a> {
    #[serde(borrow, default)]
    pub id: Option<Cow<'a, str>>,
    #[serde(borrow, default)]
    pub segment: Vec<Segment<'a>>,
}

#[derive(Debug, Deserialize)]
pub struct Segment<'a> {
    #[serde(borrow, default)]
    pub id: Option<Cow<'a, str>>,
}

// ---------------------------------------------------------------------------
// Line items (synthetic, deterministic), each with one image creative in 1-3 sizes
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LineItem {
    pub id: String,
    pub campaign_id: String,
    pub creative_id: String,
    pub adomain: String,
    /// IAB Content Taxonomy 1.0 subcategory, e.g. "IAB2-3".
    pub cat: String,
    pub sizes: Vec<(u32, u32)>,
    /// Base value (CPM) in micro-USD; whole cents.
    pub base_cpm_micros: u64,
    /// AdCOM device types (1..=8); empty = any device.
    pub device_types: Vec<u8>,
    /// Empty = any country.
    pub countries: Vec<&'static str>,
    /// (data provider, segment id); empty = no audience targeting. Non-empty = needs >= 1 match.
    pub audience: Vec<(&'static str, u32)>,
}

/// What the candidate scan reads, packed together per line item.
#[derive(Debug, Clone, Copy)]
struct Hot {
    audience_mask: [u64; 4],
    base_cpm_micros: u64,
    country_mask: u32,
    cat_id: u16,
    adomain_id: u16,
    device_mask: u8,
}

pub struct Engine {
    items: Vec<LineItem>,
    hot: Vec<Hot>,
    by_size: HashMap<(u32, u32), Vec<u32>>,
    country_ids: HashMap<&'static str, u32>,
    domain_ids: HashMap<String, u16>,
}

static ENGINE: LazyLock<Engine> = LazyLock::new(|| {
    let n = std::env::var("ORTB_LINE_ITEMS")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(DEFAULT_LINE_ITEMS);
    Engine::generate(DEFAULT_SEED, n)
});

/// The process-wide engine (`ORTB_LINE_ITEMS` env var, default [`DEFAULT_LINE_ITEMS`]).
pub fn engine() -> &'static Engine {
    &ENGINE
}

/// Canonical decimal only ("7", "1005"; not "07" or "+7"), so matching the number is the same as
/// comparing the strings, which is what OpenRTB IDs and categories are.
pub fn parse_canonical_u32(s: &str) -> Option<u32> {
    let b = s.as_bytes();
    if b.is_empty() || b.len() > 9 || !b.iter().all(u8::is_ascii_digit) || (b[0] == b'0' && b.len() > 1) {
        return None;
    }
    s.parse().ok()
}

/// "IAB12" -> (12, None), "IAB12-3" -> (12, Some(3)); None for anything else.
pub fn parse_iab(cat: &str) -> Option<(u8, Option<u8>)> {
    let rest = cat.strip_prefix("IAB")?;
    let (top, sub) = match rest.split_once('-') {
        Some((t, s)) => (t, Some(s)),
        None => (rest, None),
    };
    let top = u8::try_from(parse_canonical_u32(top)?).ok()?;
    let sub = match sub {
        Some(s) => Some(u8::try_from(parse_canonical_u32(s)?).ok()?),
        None => None,
    };
    Some((top, sub))
}

fn cat_id(top: u8, sub: u8) -> u16 {
    (top as u16 - 1) * 10 + (sub as u16 - 1)
}

impl Engine {
    pub fn generate(seed: u64, n: usize) -> Engine {
        let mut rng = SplitMix64(seed);
        let country_ids: HashMap<&'static str, u32> =
            COUNTRIES.iter().enumerate().map(|(i, &c)| (c, i as u32)).collect();
        let mut items = Vec::with_capacity(n);
        let mut hot = Vec::with_capacity(n);
        for i in 0..n {
            let k = i + 1;
            let n_sizes = 1 + rng.below(3) as usize;
            let sizes: Vec<(u32, u32)> = rng.distinct(n_sizes, BANNER_SIZES.len()).iter().map(|&s| BANNER_SIZES[s]).collect();
            let adomain_n = 1 + rng.below(ADVERTISER_DOMAINS as u64) as usize;
            let (top, sub) = (1 + rng.below(26) as u8, 1 + rng.below(10) as u8);
            let base_cents = 50 + rng.below(1_951); // CPM 0.50 ..= 20.00
            let device_types: Vec<u8> = if rng.below(3) == 0 {
                vec![]
            } else {
                let n_dev = 1 + rng.below(3) as usize;
                rng.distinct(n_dev, 8).iter().map(|&d| d as u8 + 1).collect()
            };
            let countries: Vec<&'static str> = if rng.below(3) == 0 {
                vec![]
            } else {
                let n_c = 1 + rng.below(4) as usize;
                rng.distinct(n_c, COUNTRIES.len()).iter().map(|&c| COUNTRIES[c]).collect()
            };
            let audience: Vec<(&'static str, u32)> = if rng.below(2) == 0 {
                vec![]
            } else {
                let n_seg = 1 + rng.below(4) as usize;
                let total = DATA_PROVIDERS.len() * SEGMENTS_PER_PROVIDER as usize;
                rng.distinct(n_seg, total)
                    .iter()
                    .map(|&b| (DATA_PROVIDERS[b / SEGMENTS_PER_PROVIDER as usize], SEGMENT_BASE + (b as u32 % SEGMENTS_PER_PROVIDER)))
                    .collect()
            };
            let mut audience_mask = [0u64; 4];
            for &(p, s) in &audience {
                let pi = DATA_PROVIDERS.iter().position(|&x| x == p).unwrap();
                audience_mask[pi] |= 1 << (s - SEGMENT_BASE);
            }
            hot.push(Hot {
                audience_mask,
                base_cpm_micros: base_cents * 10_000,
                country_mask: countries.iter().fold(0u32, |m, c| m | 1 << country_ids[c]),
                cat_id: cat_id(top, sub),
                adomain_id: (adomain_n - 1) as u16,
                device_mask: device_types.iter().fold(0u8, |m, &d| m | 1 << (d - 1)),
            });
            items.push(LineItem {
                id: format!("li-{k:06}"),
                campaign_id: format!("cmp-{:05}", i / 4 + 1),
                creative_id: format!("cr-{k:06}"),
                adomain: format!("brand{adomain_n:04}.example"),
                cat: format!("IAB{top}-{sub}"),
                sizes,
                base_cpm_micros: base_cents * 10_000,
                device_types,
                countries,
                audience,
            });
        }
        let mut by_size: HashMap<(u32, u32), Vec<u32>> = HashMap::new();
        for (i, li) in items.iter().enumerate() {
            for s in &li.sizes {
                by_size.entry(*s).or_default().push(i as u32);
            }
        }
        let domain_ids = (1..=ADVERTISER_DOMAINS).map(|d| (format!("brand{d:04}.example"), (d - 1) as u16)).collect();
        Engine { items, hot, by_size, country_ids, domain_ids }
    }

    pub fn line_items(&self) -> &[LineItem] {
        &self.items
    }
}

// ---------------------------------------------------------------------------
// Decisioning
// ---------------------------------------------------------------------------

/// The chosen line item for one impression.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Choice {
    pub imp_index: usize,
    pub item: u32,
    pub price_micros: u64,
    pub w: u32,
    pub h: u32,
}

/// Request-level facts, resolved once per request so that each candidate check is a few bit tests.
struct Ctx {
    device_bit: u8,
    country_bit: u32,
    audience_mask: [u64; 4],
    blocked_cats: [u64; 5],
    blocked_domains: [u64; 7],
    first_price: bool,
}

/// Floor in micro-USD; None for a floor currency other than USD (this bidder bids in USD only).
pub fn floor_usd_micros(imp: &Imp) -> Option<u64> {
    if imp.bidfloorcur.as_deref().is_some_and(|c| c != "USD") || !imp.bidfloor.is_finite() || imp.bidfloor < 0.0 {
        return None;
    }
    Some((imp.bidfloor * 1_000_000.0).round() as u64)
}

impl Engine {
    fn ctx(&self, req: &BidRequest) -> Ctx {
        let device = req.device.as_ref();
        let device_bit = match device.and_then(|d| d.devicetype) {
            Some(t @ 1..=8) => 1u8 << (t - 1),
            _ => 0,
        };
        let country_bit = device
            .and_then(|d| d.geo.as_ref())
            .and_then(|g| g.country.as_deref())
            .and_then(|c| self.country_ids.get(c))
            .map_or(0, |&i| 1u32 << i);
        let mut audience_mask = [0u64; 4];
        for data in req.user.iter().flat_map(|u| &u.data) {
            let Some(pi) = data.id.as_deref().and_then(|p| DATA_PROVIDERS.iter().position(|&x| x == p)) else {
                continue;
            };
            for seg in &data.segment {
                if let Some(s) = seg.id.as_deref().and_then(parse_canonical_u32) {
                    if (SEGMENT_BASE..SEGMENT_BASE + SEGMENTS_PER_PROVIDER).contains(&s) {
                        audience_mask[pi] |= 1 << (s - SEGMENT_BASE);
                    }
                }
            }
        }
        let mut blocked_cats = [0u64; 5];
        let mut block = |id: u16| blocked_cats[id as usize / 64] |= 1 << (id % 64);
        for c in &req.bcat {
            match parse_iab(&c.0) {
                Some((top @ 1..=26, None)) => (1..=10).for_each(|sub| block(cat_id(top, sub))),
                Some((top @ 1..=26, Some(sub @ 1..=10))) => block(cat_id(top, sub)),
                _ => {} // categories outside our taxonomy subset cannot block our line items
            }
        }
        let mut blocked_domains = [0u64; 7];
        for d in &req.badv {
            if let Some(&id) = self.domain_ids.get(d.0.as_ref()) {
                blocked_domains[id as usize / 64] |= 1 << (id % 64);
            }
        }
        Ctx { device_bit, country_bit, audience_mask, blocked_cats, blocked_domains, first_price: req.at == 1 }
    }

    /// Value of line item `idx` for this request, or None if it is not eligible.
    #[inline]
    fn value_micros(&self, idx: u32, ctx: &Ctx) -> Option<u64> {
        let li = &self.hot[idx as usize];
        if li.device_mask != 0 && li.device_mask & ctx.device_bit == 0 {
            return None;
        }
        if li.country_mask != 0 && li.country_mask & ctx.country_bit == 0 {
            return None;
        }
        if ctx.blocked_cats[li.cat_id as usize / 64] & (1 << (li.cat_id % 64)) != 0 {
            return None;
        }
        if ctx.blocked_domains[li.adomain_id as usize / 64] & (1 << (li.adomain_id % 64)) != 0 {
            return None;
        }
        let mut overlap = 0;
        if li.audience_mask != [0; 4] {
            overlap = (0..4).map(|i| (li.audience_mask[i] & ctx.audience_mask[i]).count_ones()).sum::<u32>();
            if overlap == 0 {
                return None;
            }
        }
        Some(li.base_cpm_micros * (10_000 + 2_500 * overlap.min(4) as u64) / 10_000)
    }

    /// Best line item for one banner impression: highest price; ties go to the earlier format,
    /// then to the lower line-item index.
    fn best_for_imp(&self, imp_index: usize, banner: &Banner, floor: u64, ctx: &Ctx) -> Option<Choice> {
        let explicit = banner.format.iter().filter_map(|f| Some((f.w?, f.h?)));
        let fallback = match (banner.format.is_empty(), banner.w, banner.h) {
            (true, Some(w), Some(h)) => Some((w, h)),
            _ => None,
        };
        let mut best: Option<Choice> = None;
        for (w, h) in explicit.chain(fallback) {
            for &item in self.by_size.get(&(w, h)).map(Vec::as_slice).unwrap_or(&[]) {
                let Some(value) = self.value_micros(item, ctx) else { continue };
                if value == 0 || value < floor {
                    continue;
                }
                let price = if ctx.first_price { (value * FIRST_PRICE_SHADE_PCT / 100).max(floor) } else { value };
                if best.is_none_or(|b| price > b.price_micros) {
                    best = Some(Choice { imp_index, item, price_micros: price, w, h });
                }
            }
        }
        best
    }

    /// One bid per eligible banner impression; empty = no bid.
    pub fn decide(&self, req: &BidRequest) -> Vec<Choice> {
        let ctx = self.ctx(req);
        let mut bids = Vec::new();
        for (i, imp) in req.imp.iter().enumerate() {
            let Some(banner) = &imp.banner else { continue }; // image ads only
            if imp.pmp.as_ref().is_some_and(|p| p.private_auction == 1) {
                continue;
            }
            let Some(floor) = floor_usd_micros(imp) else { continue };
            bids.extend(self.best_for_imp(i, banner, floor, &ctx));
        }
        bids
    }
}

// ---------------------------------------------------------------------------
// Bid response
// ---------------------------------------------------------------------------

#[derive(Serialize)]
struct BidOut<'a> {
    id: String,
    impid: &'a str,
    price: f64,
    adid: &'a str,
    nurl: String,
    burl: String,
    adm: String,
    adomain: [&'a str; 1],
    cid: &'a str,
    crid: &'a str,
    cat: [&'a str; 1],
    w: u32,
    h: u32,
    mtype: u8,
}

#[derive(Serialize)]
struct SeatBidOut<'a> {
    bid: Vec<BidOut<'a>>,
    seat: &'static str,
}

#[derive(Serialize)]
struct BidResponseOut<'a> {
    id: &'a str,
    seatbid: [SeatBidOut<'a>; 1],
    bidid: String,
    cur: &'static str,
}

/// Image ad markup: the image in a click-through link, plus an impression pixel that receives the
/// clearing price through the `${AUCTION_PRICE}` macro (spec 4.4).
fn image_adm(li: &LineItem, w: u32, h: u32) -> String {
    let mut s = String::with_capacity(512);
    let _ = write!(
        s,
        r#"<a href="https://{d}/landing?li={li}" target="_blank" rel="noopener"><img src="https://cdn.dsp-poc.example/cr/{cr}-{w}x{h}.png" width="{w}" height="{h}" alt="Advertisement"></a><img src="https://ev.dsp-poc.example/imp?a=${{AUCTION_ID}}&amp;i=${{AUCTION_IMP_ID}}&amp;p=${{AUCTION_PRICE}}&amp;li={li}" width="1" height="1" alt="" style="display:none">"#,
        d = li.adomain,
        li = li.id,
        cr = li.creative_id
    );
    s
}

impl Engine {
    /// Serialize the bids; None means "no bid" (HTTP 204).
    pub fn render(&self, req: &BidRequest, choices: &[Choice]) -> Option<Vec<u8>> {
        if choices.is_empty() {
            return None;
        }
        let bids = choices
            .iter()
            .map(|c| {
                let li = &self.items[c.item as usize];
                let imp_id: &str = &req.imp[c.imp_index].id;
                let q = format!("a=${{AUCTION_ID}}&i=${{AUCTION_IMP_ID}}&li={}&p=${{AUCTION_PRICE}}", li.id);
                BidOut {
                    id: format!("{imp_id}-{}", li.id),
                    impid: imp_id,
                    price: c.price_micros as f64 / 1_000_000.0,
                    adid: &li.creative_id,
                    nurl: format!("https://win.dsp-poc.example/win?{q}"),
                    burl: format!("https://bill.dsp-poc.example/bill?{q}"),
                    adm: image_adm(li, c.w, c.h),
                    adomain: [&li.adomain],
                    cid: &li.campaign_id,
                    crid: &li.creative_id,
                    cat: [&li.cat],
                    w: c.w,
                    h: c.h,
                    mtype: 1, // banner
                }
            })
            .collect();
        let resp = BidResponseOut {
            id: &req.id,
            seatbid: [SeatBidOut { bid: bids, seat: SEAT }],
            bidid: format!("{SEAT}-{}", req.id),
            cur: "USD",
        };
        Some(serde_json::to_vec(&resp).expect("serialize"))
    }
}

// ---------------------------------------------------------------------------
// The whole HTTP-body pipeline (what both servers call)
// ---------------------------------------------------------------------------

#[derive(Debug, PartialEq, Eq)]
pub enum Outcome {
    /// HTTP 200 with this JSON body.
    Body(Vec<u8>),
    /// HTTP 204, no body.
    NoBid,
    /// HTTP 400, no body (malformed or invalid request, spec 2.1).
    Invalid,
}

impl Engine {
    /// Raw HTTP body in, outcome out.
    pub fn handle(&self, body: &[u8]) -> Outcome {
        if body.len() > MAX_BODY_BYTES {
            return Outcome::Invalid;
        }
        let req: BidRequest = match serde_json::from_slice(body) {
            Ok(r) => r,
            Err(_) => return Outcome::Invalid,
        };
        if req.imp.is_empty() {
            return Outcome::Invalid;
        }
        match self.render(&req, &self.decide(&req)) {
            Some(out) => Outcome::Body(out),
            None => Outcome::NoBid,
        }
    }
}

#[cfg(test)]
mod tests;
