//! OpenRTB 2.6 bidder (a subset), shared by both architectures exactly like the v1 engine.
//!
//! Spec: IAB Tech Lab OpenRTB 2.6, <https://github.com/InteractiveAdvertisingBureau/openrtb2.x>
//! (`2.6.md`, `implementation.md`); enumerations from AdCOM 1.0; no-bid reason codes from OpenRTB 3.0.
//!
//! | Behaviour                                                            | Spec                                  |
//! |----------------------------------------------------------------------|---------------------------------------|
//! | parse a BidRequest; unknown fields and values are ignored            | 3.2.1; 2.6 "Versioning Behavior"      |
//! | `id` + at least one `imp` required, otherwise invalid (HTTP 400)     | 3.2.1; 2.1                            |
//! | at most one bid per banner / video impression                        | 3.2.4, 3.2.6, 3.2.7, 3.2.10           |
//! | floor = `imp.bidfloor` in `imp.bidfloorcur` (default USD)            | 3.2.4; 7.11                           |
//! | `pmp.private_auction = 1` is not bid on (this bidder holds no deals) | 3.2.11                                |
//! | `bcat` (a parent category blocks its children) and `badv`            | 3.2.1                                 |
//! | `cur`: we bid in USD only, so a request that excludes USD is no-bid  | 3.2.1; 4.2.1                          |
//! | device type, geo country, user data segments as targeting            | AdCOM device types; 3.2.18-3.2.22     |
//! | no audience data if COPPA, GDPR without consent, US opt-out, or LMT  | 3.2.3, 3.2.18, 3.2.20                 |
//! | first price (`at` = 1): shade the bid 15%, never below the floor     | 3.2.1 `at`                            |
//! | BidResponse / SeatBid / Bid, macros in `nurl`/`burl`/`lurl`/`adm`    | 4.2, 4.4                              |
//! | no bid -> HTTP 204 with no body                                      | 2.1; 4.2.1; 7.1                       |
//! | known crawler -> `nbr` 3; `tmax` below our minimum -> `nbr` 15       | 7.1; OpenRTB 3.0 no-bid reason codes  |
//! | gzip request bodies (`Content-Encoding`) and gzip responses          | 2.4                                   |
//!
//! Price math is integer micro-currency, as the spec recommends for `price` (4.2.3).

use crate::SplitMix64;
use flate2::{Compress, Compression, Crc, Decompress, FlushCompress, FlushDecompress, Status as ZStatus};
use std::cell::RefCell;
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
/// Below this `tmax` we cannot answer in time: no-bid with `nbr` 15 ("Insufficient Auction Time").
pub const MIN_TMAX_MS: u32 = 10;
/// Upper bound for a (decompressed) request body; larger is treated as invalid (gzip-bomb guard).
pub const MAX_BODY_BYTES: usize = 1 << 20;
/// First-price shading: bid 85% of our value, but never below the floor.
pub const FIRST_PRICE_SHADE_PCT: u64 = 85;
/// Fixed, synthetic exchange rates for floors in other currencies (USD micros per unit). POC only.
pub const FX_TO_USD_MICROS: [(&str, u64); 3] = [("USD", 1_000_000), ("EUR", 1_080_000), ("GBP", 1_270_000)];

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
// Bid request (the fields this bidder reads; everything else is parsed and ignored)
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
    pub site: Option<Site<'a>>,
    #[serde(borrow, default)]
    pub app: Option<App<'a>>,
    #[serde(borrow, default)]
    pub device: Option<Device<'a>>,
    #[serde(borrow, default)]
    pub user: Option<User<'a>>,
    #[serde(default)]
    pub test: u8,
    #[serde(default = "default_at")]
    pub at: u32,
    #[serde(default)]
    pub tmax: Option<u32>,
    #[serde(borrow, default)]
    pub cur: Vec<Str<'a>>,
    #[serde(borrow, default)]
    pub bcat: Vec<Str<'a>>,
    #[serde(borrow, default)]
    pub badv: Vec<Str<'a>>,
    #[serde(borrow, default)]
    pub regs: Option<Regs<'a>>,
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
    #[serde(borrow, default)]
    pub video: Option<Video<'a>>,
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
pub struct Video<'a> {
    #[serde(borrow, default)]
    pub mimes: Vec<Str<'a>>,
    pub minduration: Option<u32>,
    pub maxduration: Option<u32>,
    #[serde(default)]
    pub protocols: Vec<u32>,
}

#[derive(Debug, Deserialize)]
pub struct Pmp {
    #[serde(default)]
    pub private_auction: u8,
}

#[derive(Debug, Deserialize)]
pub struct Site<'a> {
    #[serde(borrow, default)]
    pub cat: Vec<Str<'a>>,
}

#[derive(Debug, Deserialize)]
pub struct App<'a> {
    #[serde(borrow, default)]
    pub cat: Vec<Str<'a>>,
}

#[derive(Debug, Deserialize)]
pub struct Device<'a> {
    #[serde(borrow, default)]
    pub ua: Option<Cow<'a, str>>,
    pub devicetype: Option<u8>,
    #[serde(borrow, default)]
    pub geo: Option<Geo<'a>>,
    pub lmt: Option<u8>,
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
    #[serde(borrow, default)]
    pub consent: Option<Cow<'a, str>>,
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

#[derive(Debug, Deserialize)]
pub struct Regs<'a> {
    pub coppa: Option<u8>,
    pub gdpr: Option<u8>,
    #[serde(borrow, default)]
    pub us_privacy: Option<Cow<'a, str>>,
}

// ---------------------------------------------------------------------------
// Line items (synthetic, deterministic)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Creative {
    Banner { sizes: Vec<(u32, u32)> },
    /// VAST video; `protocol` per AdCOM "Creative Subtypes - Audio/Video": 3 = VAST 3.0, 7 = VAST 4.0.
    Video { duration_s: u32, protocol: u32 },
}

pub const VIDEO_MIME: &str = "video/mp4";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LineItem {
    pub id: String,
    pub campaign_id: String,
    pub creative_id: String,
    pub adomain: String,
    /// IAB Content Taxonomy 1.0 subcategory, e.g. "IAB2-3".
    pub cat: String,
    pub creative: Creative,
    /// Base value (CPM) in micro-USD; whole cents.
    pub base_cpm_micros: u64,
    /// AdCOM device types (1..=8); empty = any device.
    pub device_types: Vec<u8>,
    /// Empty = any country.
    pub countries: Vec<&'static str>,
    /// (data provider, segment id); empty = no audience targeting. Non-empty = needs >= 1 match.
    pub audience: Vec<(&'static str, u32)>,
    /// Top-level content category (1..=26 for "IAB1".."IAB26") that earns +20%; 0 = none.
    pub content_top: u8,
    // pre-computed for the hot path
    cat_id: u16,
    adomain_id: u16,
    device_mask: u8,
    country_mask: u32,
    audience_mask: [u64; 4],
}

/// The fields the candidate scan reads, packed into one cache line per line item.
#[derive(Debug, Clone, Copy)]
struct Hot {
    audience_mask: [u64; 4],
    base_cpm_micros: u64,
    country_mask: u32,
    cat_id: u16,
    adomain_id: u16,
    device_mask: u8,
    content_top: u8,
    /// Video only: duration in seconds and VAST protocol; 0 for banners.
    video_duration: u8,
    video_protocol: u8,
}

pub struct Engine {
    items: Vec<LineItem>,
    hot: Vec<Hot>,
    banner_by_size: HashMap<(u32, u32), Vec<u32>>,
    video_items: Vec<u32>,
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

/// The process-wide OpenRTB engine (`ORTB_LINE_ITEMS` env var, default [`DEFAULT_LINE_ITEMS`]).
pub fn engine() -> &'static Engine {
    &ENGINE
}

fn cat_id(top: u8, sub: u8) -> u16 {
    (top as u16 - 1) * 10 + (sub as u16 - 1)
}

/// Canonical decimal only ("7", "1005"; not "07", "+7", "1e3"), so that matching a parsed number
/// is the same as comparing the strings, which is what OpenRTB IDs and categories are.
pub fn parse_canonical_u32(s: &str) -> Option<u32> {
    let b = s.as_bytes();
    if b.is_empty() || b.len() > 9 || !b.iter().all(u8::is_ascii_digit) || (b[0] == b'0' && b.len() > 1) {
        return None;
    }
    s.parse().ok()
}

/// Top-level category of "IAB12" or "IAB12-<anything>" -> 12 (used for content affinity).
pub fn iab_top(cat: &str) -> Option<u8> {
    let rest = cat.strip_prefix("IAB")?;
    let top = rest.split_once('-').map_or(rest, |(t, _)| t);
    u8::try_from(parse_canonical_u32(top)?).ok()
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

impl Engine {
    pub fn generate(seed: u64, n: usize) -> Engine {
        let mut rng = SplitMix64(seed);
        let country_ids: HashMap<&'static str, u32> =
            COUNTRIES.iter().enumerate().map(|(i, &c)| (c, i as u32)).collect();
        let mut items = Vec::with_capacity(n);
        for i in 0..n {
            let k = i + 1;
            let creative = if rng.below(4) == 0 {
                Creative::Video {
                    duration_s: [6, 15, 30][rng.below(3) as usize],
                    protocol: if rng.below(2) == 0 { 3 } else { 7 },
                }
            } else {
                let k = 1 + rng.below(3) as usize;
                let idx = rng.distinct(k, BANNER_SIZES.len());
                Creative::Banner { sizes: idx.iter().map(|&s| BANNER_SIZES[s]).collect() }
            };
            let adomain_n = 1 + rng.below(ADVERTISER_DOMAINS as u64) as usize;
            let (top, sub) = (1 + rng.below(26) as u8, 1 + rng.below(10) as u8);
            let base_cents = 50 + rng.below(1_951); // CPM 0.50 ..= 20.00
            let device_types: Vec<u8> = if rng.below(3) == 0 {
                vec![]
            } else {
                let k = 1 + rng.below(3) as usize;
                rng.distinct(k, 8).iter().map(|&d| d as u8 + 1).collect()
            };
            let countries: Vec<&'static str> = if rng.below(3) == 0 {
                vec![]
            } else {
                let k = 1 + rng.below(4) as usize;
                rng.distinct(k, COUNTRIES.len()).iter().map(|&c| COUNTRIES[c]).collect()
            };
            let audience: Vec<(&'static str, u32)> = if rng.below(2) == 0 {
                vec![]
            } else {
                let total = DATA_PROVIDERS.len() * SEGMENTS_PER_PROVIDER as usize;
                let k = 1 + rng.below(4) as usize;
                rng.distinct(k, total)
                    .iter()
                    .map(|&b| {
                        (DATA_PROVIDERS[b / SEGMENTS_PER_PROVIDER as usize], SEGMENT_BASE + (b as u32 % SEGMENTS_PER_PROVIDER))
                    })
                    .collect()
            };
            let content_top = if rng.below(4) == 0 { 1 + rng.below(26) as u8 } else { 0 };

            let mut audience_mask = [0u64; 4];
            for &(p, s) in &audience {
                let pi = DATA_PROVIDERS.iter().position(|&x| x == p).unwrap();
                audience_mask[pi] |= 1 << (s - SEGMENT_BASE);
            }
            items.push(LineItem {
                id: format!("li-{k:06}"),
                campaign_id: format!("cmp-{:05}", i / 4 + 1),
                creative_id: format!("cr-{k:06}"),
                adomain: format!("brand{adomain_n:04}.example"),
                cat: format!("IAB{top}-{sub}"),
                cat_id: cat_id(top, sub),
                adomain_id: (adomain_n - 1) as u16,
                device_mask: device_types.iter().fold(0u8, |m, &d| m | 1 << (d - 1)),
                country_mask: countries.iter().fold(0u32, |m, c| m | 1 << country_ids[c]),
                audience_mask,
                creative,
                base_cpm_micros: base_cents * 10_000,
                device_types,
                countries,
                audience,
                content_top,
            });
        }
        let mut banner_by_size: HashMap<(u32, u32), Vec<u32>> = HashMap::new();
        let mut video_items = Vec::new();
        for (i, li) in items.iter().enumerate() {
            match &li.creative {
                Creative::Banner { sizes } => {
                    for s in sizes {
                        banner_by_size.entry(*s).or_default().push(i as u32);
                    }
                }
                Creative::Video { .. } => video_items.push(i as u32),
            }
        }
        let domain_ids = (1..=ADVERTISER_DOMAINS)
            .map(|d| (format!("brand{d:04}.example"), (d - 1) as u16))
            .collect();
        let hot = items
            .iter()
            .map(|li| {
                let (video_duration, video_protocol) = match li.creative {
                    Creative::Video { duration_s, protocol } => (duration_s as u8, protocol as u8),
                    Creative::Banner { .. } => (0, 0),
                };
                Hot {
                    audience_mask: li.audience_mask,
                    base_cpm_micros: li.base_cpm_micros,
                    country_mask: li.country_mask,
                    cat_id: li.cat_id,
                    adomain_id: li.adomain_id,
                    device_mask: li.device_mask,
                    content_top: li.content_top,
                    video_duration,
                    video_protocol,
                }
            })
            .collect();
        Engine { items, hot, banner_by_size, video_items, country_ids, domain_ids }
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
    /// Banner size used (0x0 for video).
    pub w: u32,
    pub h: u32,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Decision {
    Bids(Vec<Choice>),
    NoBid,
    /// No-bid with a reason code (BidResponse.nbr, OpenRTB 3.0 list).
    NoBidReason(u32),
}

/// Request-level facts, resolved once per request so that each candidate check is a few bit tests.
struct Ctx {
    device_bit: u8,
    country_bit: u32,
    audience_ok: bool,
    audience_mask: [u64; 4],
    content_tops: u32,
    blocked_cats: [u64; 5],
    blocked_domains: [u64; 7],
    first_price: bool,
}

pub fn is_known_crawler(ua: &str) -> bool {
    const BOTS: [&[u8]; 4] = [b"bot", b"spider", b"crawler", b"headless"];
    let ua = ua.as_bytes();
    BOTS.iter().any(|pat| ua.windows(pat.len()).any(|w| w.eq_ignore_ascii_case(pat)))
}

/// Audience (user data) may be used only when no privacy signal forbids it.
pub fn audience_allowed(req: &BidRequest) -> bool {
    let regs = req.regs.as_ref();
    if regs.and_then(|r| r.coppa) == Some(1) {
        return false;
    }
    if regs.and_then(|r| r.gdpr) == Some(1)
        && req.user.as_ref().and_then(|u| u.consent.as_deref()).is_none_or(str::is_empty)
    {
        return false;
    }
    // US Privacy string "1YYN": the 3rd character is "opt-out of sale".
    if regs.and_then(|r| r.us_privacy.as_deref()).and_then(|s| s.as_bytes().get(2)) == Some(&b'Y') {
        return false;
    }
    if req.device.as_ref().and_then(|d| d.lmt) == Some(1) {
        return false;
    }
    true
}

/// Floor in micro-USD, or None if the floor currency is not one we can convert.
pub fn floor_usd_micros(imp: &Imp) -> Option<u64> {
    let cur = imp.bidfloorcur.as_deref().unwrap_or("USD");
    let rate = FX_TO_USD_MICROS.iter().find(|(c, _)| *c == cur)?.1;
    if !imp.bidfloor.is_finite() || imp.bidfloor < 0.0 {
        return None;
    }
    Some((imp.bidfloor * rate as f64).round() as u64)
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
        let audience_ok = audience_allowed(req);
        let mut audience_mask = [0u64; 4];
        if audience_ok {
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
        }
        let cats = req.site.as_ref().map(|s| &s.cat).or(req.app.as_ref().map(|a| &a.cat));
        let mut content_tops = 0u32;
        for c in cats.into_iter().flatten() {
            if let Some(top @ 1..=26) = iab_top(&c.0) {
                content_tops |= 1 << (top - 1);
            }
        }
        let mut blocked_cats = [0u64; 5];
        for c in &req.bcat {
            match parse_iab(&c.0) {
                Some((top @ 1..=26, None)) => {
                    for sub in 1..=10 {
                        let id = cat_id(top, sub);
                        blocked_cats[id as usize / 64] |= 1 << (id % 64);
                    }
                }
                Some((top @ 1..=26, Some(sub @ 1..=10))) => {
                    let id = cat_id(top, sub);
                    blocked_cats[id as usize / 64] |= 1 << (id % 64);
                }
                _ => {} // categories outside our taxonomy subset cannot block our line items
            }
        }
        let mut blocked_domains = [0u64; 7];
        for d in &req.badv {
            if let Some(&id) = self.domain_ids.get(d.0.as_ref()) {
                blocked_domains[id as usize / 64] |= 1 << (id % 64);
            }
        }
        Ctx {
            device_bit,
            country_bit,
            audience_ok,
            audience_mask,
            content_tops,
            blocked_cats,
            blocked_domains,
            first_price: req.at == 1,
        }
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
            if !ctx.audience_ok {
                return None;
            }
            overlap = (0..4).map(|i| (li.audience_mask[i] & ctx.audience_mask[i]).count_ones()).sum::<u32>();
            if overlap == 0 {
                return None;
            }
        }
        let mut v = li.base_cpm_micros * (10_000 + 2_500 * overlap.min(4) as u64) / 10_000;
        if li.content_top != 0 && ctx.content_tops & (1 << (li.content_top - 1)) != 0 {
            v = v * 12 / 10;
        }
        Some(v)
    }

    fn price(&self, value: u64, floor: u64, ctx: &Ctx) -> Option<u64> {
        if value == 0 || value < floor {
            return None;
        }
        Some(if ctx.first_price { (value * FIRST_PRICE_SHADE_PCT / 100).max(floor) } else { value })
    }

    /// Best line item for one impression. Highest price wins; ties go to the earlier banner
    /// format, then to the lower line-item index (video candidates come after banner ones).
    fn best_for_imp(&self, imp_index: usize, imp: &Imp, floor: u64, ctx: &Ctx) -> Option<Choice> {
        let mut best: Option<Choice> = None;
        let consider = |item: u32, w: u32, h: u32, best: &mut Option<Choice>| {
            if let Some(price) = self.value_micros(item, ctx).and_then(|v| self.price(v, floor, ctx)) {
                if best.is_none_or(|b| price > b.price_micros) {
                    *best = Some(Choice { imp_index, item, price_micros: price, w, h });
                }
            }
        };
        if let Some(banner) = &imp.banner {
            let explicit = banner.format.iter().filter_map(|f| Some((f.w?, f.h?)));
            let fallback = match (banner.format.is_empty(), banner.w, banner.h) {
                (true, Some(w), Some(h)) => Some((w, h)),
                _ => None,
            };
            for (w, h) in explicit.chain(fallback) {
                for &item in self.banner_by_size.get(&(w, h)).map(Vec::as_slice).unwrap_or(&[]) {
                    consider(item, w, h, &mut best);
                }
            }
        }
        if let Some(video) = &imp.video {
            if video.mimes.iter().any(|m| m.0 == VIDEO_MIME) {
                for &item in &self.video_items {
                    let hot = &self.hot[item as usize];
                    let (duration_s, protocol) = (hot.video_duration as u32, hot.video_protocol as u32);
                    let proto_ok = video.protocols.is_empty() || video.protocols.contains(&protocol);
                    let dur_ok = video.minduration.is_none_or(|m| duration_s >= m)
                        && video.maxduration.is_none_or(|m| duration_s <= m);
                    if proto_ok && dur_ok {
                        consider(item, 0, 0, &mut best);
                    }
                }
            }
        }
        best
    }

    pub fn decide(&self, req: &BidRequest) -> Decision {
        if req.device.as_ref().and_then(|d| d.ua.as_deref()).is_some_and(is_known_crawler) {
            return Decision::NoBidReason(3); // Known Web Crawler
        }
        if req.tmax.is_some_and(|t| t < MIN_TMAX_MS) {
            return Decision::NoBidReason(15); // Insufficient Auction Time
        }
        if !req.cur.is_empty() && !req.cur.iter().any(|c| c.0 == "USD") {
            return Decision::NoBid;
        }
        let ctx = self.ctx(req);
        let mut bids = Vec::new();
        for (i, imp) in req.imp.iter().enumerate() {
            if imp.pmp.as_ref().is_some_and(|p| p.private_auction == 1) {
                continue;
            }
            let Some(floor) = floor_usd_micros(imp) else { continue };
            if let Some(choice) = self.best_for_imp(i, imp, floor, &ctx) {
                bids.push(choice);
            }
        }
        if bids.is_empty() {
            Decision::NoBid
        } else {
            Decision::Bids(bids)
        }
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
    lurl: String,
    adm: String,
    adomain: [&'a str; 1],
    cid: &'a str,
    crid: &'a str,
    cat: [&'a str; 1],
    #[serde(skip_serializing_if = "Option::is_none")]
    w: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    h: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    dur: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    protocol: Option<u32>,
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

#[derive(Serialize)]
struct NoBidOut<'a> {
    id: &'a str,
    nbr: u32,
}

const VIEWABILITY_JS: &str = concat!(
    r#"<script>(function(){var s=document.currentScript,el=s&&s.parentNode;"#,
    r#"if(!el||!("IntersectionObserver" in window))return;"#,
    r#"var t=0,o=new IntersectionObserver(function(es){if(es[0].intersectionRatio>=0.5){"#,
    r#"if(!t)t=setTimeout(function(){o.disconnect();new Image().src=el.getAttribute("data-vurl")},1000)}"#,
    r#"else if(t){clearTimeout(t);t=0}},{threshold:[0,0.5]});o.observe(el)})();</script>"#,
);

fn banner_adm(li: &LineItem, w: u32, h: u32) -> String {
    let mut s = String::with_capacity(1_100);
    let _ = write!(
        s,
        r#"<div class="ad" data-li="{li}" data-vurl="https://ev.dsp-poc.example/view?a=${{AUCTION_ID}}&amp;i=${{AUCTION_IMP_ID}}&amp;li={li}" style="position:relative;overflow:hidden;width:{w}px;height:{h}px">"#,
        li = li.id
    );
    let _ = write!(
        s,
        r#"<a href="https://{d}/landing?li={li}&amp;imp=${{AUCTION_IMP_ID}}" target="_blank" rel="noopener noreferrer"><img src="https://cdn.dsp-poc.example/cr/{cr}-{w}x{h}.png" width="{w}" height="{h}" alt="Advertisement" style="display:block;border:0"></a>"#,
        d = li.adomain,
        li = li.id,
        cr = li.creative_id
    );
    let _ = write!(
        s,
        r#"<img src="https://ev.dsp-poc.example/imp?a=${{AUCTION_ID}}&amp;i=${{AUCTION_IMP_ID}}&amp;p=${{AUCTION_PRICE}}&amp;li={li}" width="1" height="1" alt="" style="position:absolute;left:-9999px">"#,
        li = li.id
    );
    s.push_str(VIEWABILITY_JS);
    s.push_str("</div>");
    s
}

fn vast_adm(li: &LineItem, duration_s: u32, protocol: u32) -> String {
    let v4 = protocol == 7;
    let mut s = String::with_capacity(1_800);
    let _ = write!(s, r#"<VAST version="{}"><Ad id="{}"><InLine><AdSystem version="1.0">{SEAT}</AdSystem>"#, if v4 { "4.0" } else { "3.0" }, li.creative_id);
    if v4 {
        s.push_str("<AdServingId>${AUCTION_ID}-${AUCTION_IMP_ID}</AdServingId>");
    }
    let _ = write!(
        s,
        "<AdTitle>{li}</AdTitle><Impression id=\"imp\"><![CDATA[https://ev.dsp-poc.example/vimp?a=${{AUCTION_ID}}&i=${{AUCTION_IMP_ID}}&p=${{AUCTION_PRICE}}&li={li}]]></Impression>",
        li = li.id
    );
    let _ = write!(s, r#"<Creatives><Creative id="{cr}" adId="{cr}">"#, cr = li.creative_id);
    if v4 {
        let _ = write!(s, r#"<UniversalAdId idRegistry="dsp-poc.example">{}</UniversalAdId>"#, li.creative_id);
    }
    let _ = write!(s, "<Linear><Duration>00:00:{duration_s:02}</Duration><TrackingEvents>");
    for ev in ["start", "firstQuartile", "midpoint", "thirdQuartile", "complete"] {
        let _ = write!(
            s,
            "<Tracking event=\"{ev}\"><![CDATA[https://ev.dsp-poc.example/v?e={ev}&a=${{AUCTION_ID}}&li={li}]]></Tracking>",
            li = li.id
        );
    }
    let _ = write!(
        s,
        "</TrackingEvents><VideoClicks><ClickThrough id=\"click\"><![CDATA[https://{d}/landing?li={li}]]></ClickThrough></VideoClicks>",
        d = li.adomain,
        li = li.id
    );
    let _ = write!(
        s,
        "<MediaFiles><MediaFile id=\"mp4-720p\" delivery=\"progressive\" type=\"{VIDEO_MIME}\" width=\"1280\" height=\"720\" bitrate=\"2000\"><![CDATA[https://cdn.dsp-poc.example/cr/{cr}-{duration_s}s-720p.mp4]]></MediaFile></MediaFiles></Linear></Creative></Creatives></InLine></Ad></VAST>",
        cr = li.creative_id
    );
    s
}

impl Engine {
    /// Serialize a decision; None means "no bid" (HTTP 204).
    pub fn render(&self, req: &BidRequest, decision: &Decision) -> Option<Vec<u8>> {
        match decision {
            Decision::NoBid => None,
            Decision::NoBidReason(nbr) => Some(serde_json::to_vec(&NoBidOut { id: &req.id, nbr: *nbr }).expect("serialize")),
            Decision::Bids(choices) => {
                let bids = choices
                    .iter()
                    .map(|c| {
                        let li = &self.items[c.item as usize];
                        let imp_id: &str = &req.imp[c.imp_index].id;
                        let (adm, w, h, dur, protocol, mtype) = match li.creative {
                            Creative::Banner { .. } => (banner_adm(li, c.w, c.h), Some(c.w), Some(c.h), None, None, 1),
                            Creative::Video { duration_s, protocol } => {
                                (vast_adm(li, duration_s, protocol), None, None, Some(duration_s), Some(protocol), 2)
                            }
                        };
                        let q = format!("a=${{AUCTION_ID}}&i=${{AUCTION_IMP_ID}}&li={}", li.id);
                        BidOut {
                            id: format!("{imp_id}-{}", li.id),
                            impid: imp_id,
                            price: c.price_micros as f64 / 1_000_000.0,
                            adid: &li.creative_id,
                            nurl: format!("https://win.dsp-poc.example/win?{q}&p=${{AUCTION_PRICE}}"),
                            burl: format!("https://bill.dsp-poc.example/bill?{q}&p=${{AUCTION_PRICE}}"),
                            lurl: format!("https://loss.dsp-poc.example/loss?{q}&r=${{AUCTION_LOSS}}&m=${{AUCTION_MIN_TO_WIN}}"),
                            adm,
                            adomain: [&li.adomain],
                            cid: &li.campaign_id,
                            crid: &li.creative_id,
                            cat: [&li.cat],
                            w,
                            h,
                            dur,
                            protocol,
                            mtype,
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
    }
}

// ---------------------------------------------------------------------------
// Full HTTP-body pipeline (what both servers call)
// ---------------------------------------------------------------------------

#[derive(Debug, PartialEq, Eq)]
pub enum Outcome {
    /// HTTP 200 with this body (gzip-compressed if the caller asked for it).
    Body(Vec<u8>),
    /// HTTP 204, no body.
    NoBid,
    /// HTTP 400, no body (malformed/corrupt payload, spec 2.1).
    Invalid,
}

// gzip (RFC 1952) around flate2's raw deflate. The compressor and decompressor state is large
// (hundreds of KB); allocating it per request made the multi-threaded server page-fault ~16 times
// per request under glibc malloc (measured, see README). So each thread keeps one of each and resets
// it per request. ORTB_GZIP_REUSE=0 restores the allocate-per-request behaviour for comparison.
static GZIP_REUSE: LazyLock<bool> = LazyLock::new(|| std::env::var("ORTB_GZIP_REUSE").as_deref() != Ok("0"));
thread_local! {
    static COMPRESS: RefCell<Compress> = RefCell::new(Compress::new(Compression::fast(), false));
    static DECOMPRESS: RefCell<Decompress> = RefCell::new(Decompress::new(false));
}

fn with_compress<T>(f: impl FnOnce(&mut Compress) -> T) -> T {
    if *GZIP_REUSE {
        COMPRESS.with(|c| {
            let mut c = c.borrow_mut();
            c.reset();
            f(&mut c)
        })
    } else {
        f(&mut Compress::new(Compression::fast(), false))
    }
}

fn with_decompress<T>(f: impl FnOnce(&mut Decompress) -> T) -> T {
    if *GZIP_REUSE {
        DECOMPRESS.with(|d| {
            let mut d = d.borrow_mut();
            d.reset(false);
            f(&mut d)
        })
    } else {
        f(&mut Decompress::new(false))
    }
}

/// Decompress a gzip member; None if it is not valid gzip or inflates beyond MAX_BODY_BYTES.
pub fn gunzip(body: &[u8]) -> Option<Vec<u8>> {
    if body.len() > MAX_BODY_BYTES || body.len() < 18 || body[0] != 0x1f || body[1] != 0x8b || body[2] != 8 {
        return None;
    }
    let flg = body[3];
    if flg & 0xe0 != 0 {
        return None; // reserved flag bits must be zero
    }
    let mut pos = 10;
    if flg & 0x04 != 0 {
        let xlen = u16::from_le_bytes([*body.get(pos)?, *body.get(pos + 1)?]) as usize;
        pos += 2 + xlen;
    }
    for bit in [0x08u8, 0x10] {
        if flg & bit != 0 {
            pos += body.get(pos..)?.iter().position(|&b| b == 0)? + 1; // zero-terminated name / comment
        }
    }
    if flg & 0x02 != 0 {
        pos += 2; // header CRC16 (not verified)
    }
    let deflate = body.get(pos..)?;
    with_decompress(|d| {
        let mut out = Vec::with_capacity((deflate.len() * 4).clamp(256, MAX_BODY_BYTES));
        loop {
            let (consumed, produced) = (d.total_in() as usize, out.len());
            match d.decompress_vec(&deflate[consumed..], &mut out, FlushDecompress::None).ok()? {
                ZStatus::StreamEnd => break,
                _ if out.len() > MAX_BODY_BYTES => return None,
                _ if out.len() == out.capacity() => out.reserve(out.len().min(MAX_BODY_BYTES + 1 - out.len()).max(256)),
                // neither input consumed nor output produced: truncated or corrupt stream
                _ if d.total_in() as usize == consumed && out.len() == produced => return None,
                _ => {}
            }
        }
        if out.len() > MAX_BODY_BYTES {
            return None;
        }
        let trailer = deflate.get(d.total_in() as usize..)?.get(..8)?;
        let mut crc = Crc::new();
        crc.update(&out);
        let ok = u32::from_le_bytes(trailer[..4].try_into().ok()?) == crc.sum()
            && u32::from_le_bytes(trailer[4..].try_into().ok()?) == out.len() as u32;
        ok.then_some(out)
    })
}

/// gzip-compress (deflate level 1, "fast").
pub fn gzip(data: &[u8]) -> Vec<u8> {
    // header: magic, CM=deflate, no flags, MTIME=0, XFL=4 (fastest), OS=255 (unknown)
    let mut out = Vec::with_capacity(data.len() + data.len() / 8 + 64);
    out.extend_from_slice(&[0x1f, 0x8b, 8, 0, 0, 0, 0, 0, 4, 255]);
    with_compress(|c| loop {
        let consumed = c.total_in() as usize;
        if out.capacity() - out.len() < 64 {
            out.reserve(out.len().max(256));
        }
        match c.compress_vec(&data[consumed..], &mut out, FlushCompress::Finish).expect("deflate into a Vec") {
            ZStatus::StreamEnd => break,
            _ => out.reserve(256),
        }
    });
    let mut crc = Crc::new();
    crc.update(data);
    out.extend_from_slice(&crc.sum().to_le_bytes());
    out.extend_from_slice(&(data.len() as u32).to_le_bytes());
    out
}

impl Engine {
    /// Raw HTTP body in (possibly gzip), response body out (gzip if `gzip_out`).
    pub fn handle(&self, body: &[u8], gzip_in: bool, gzip_out: bool) -> Outcome {
        let decoded;
        let json = if gzip_in {
            match gunzip(body) {
                Some(d) => {
                    decoded = d;
                    &decoded[..]
                }
                None => return Outcome::Invalid,
            }
        } else if body.len() > MAX_BODY_BYTES {
            return Outcome::Invalid;
        } else {
            body
        };
        let req: BidRequest = match serde_json::from_slice(json) {
            Ok(r) => r,
            Err(_) => return Outcome::Invalid,
        };
        if req.imp.is_empty() {
            return Outcome::Invalid;
        }
        let decision = self.decide(&req);
        match self.render(&req, &decision) {
            None => Outcome::NoBid,
            Some(out) if gzip_out => Outcome::Body(gzip(&out)),
            Some(out) => Outcome::Body(out),
        }
    }
}

#[cfg(test)]
mod tests;
