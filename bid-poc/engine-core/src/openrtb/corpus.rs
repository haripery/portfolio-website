//! Deterministic corpus of realistic OpenRTB 2.6 bid requests (synthetic; seed-based).
//!
//! The mix is meant to resemble exchange traffic, not to flatter either server: 1-4 impressions,
//! site / app / CTV, banner (incl. sizes nobody buys) and video, floors from 0 to 20 USD and in
//! EUR/GBP/JPY, block lists, GDPR consent strings, US privacy strings, GPP, schain, eids,
//! structured user agent, `ext` objects, and a few percent of edge cases a bidder must handle:
//! crawler user agents (-> nbr 3), tmax too small (-> nbr 15), private auctions, unknown fields.
//!
//!   cargo run --release -p engine-core --example gen_openrtb -- 10000 > corpus.jsonl
use super::{ADVERTISER_DOMAINS, COUNTRIES, DATA_PROVIDERS, SEGMENT_BASE};
use crate::SplitMix64;
use serde_json::{json, Value};

pub const DEFAULT_CORPUS_SEED: u64 = 7;

const EXTRA_COUNTRIES: [&str; 4] = ["CHE", "THA", "VNM", "EGY"]; // no line item targets these
const EU: [&str; 8] = ["GBR", "DEU", "FRA", "ESP", "ITA", "NLD", "SWE", "POL"];
const EXTRA_SIZES: [(u32, u32); 4] = [(468, 60), (120, 600), (970, 90), (250, 250)];

struct G(SplitMix64);

impl G {
    fn n(&mut self, k: u64) -> u64 {
        self.0.below(k)
    }
    fn pct(&mut self, p: u64) -> bool {
        self.0.below(100) < p
    }
    fn pick<'a, T>(&mut self, xs: &'a [T]) -> &'a T {
        &xs[self.0.below(xs.len() as u64) as usize]
    }
    fn hex(&mut self, len: usize) -> String {
        let mut s = String::with_capacity(len + 16);
        while s.len() < len {
            s.push_str(&format!("{:016x}", self.0.next_u64()));
        }
        s.truncate(len);
        s
    }
    fn b64(&mut self, len: usize) -> String {
        const A: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
        (0..len).map(|_| A[self.0.below(64) as usize] as char).collect()
    }
    fn uuid(&mut self) -> String {
        let h = self.hex(32);
        format!("{}-{}-{}-{}-{}", &h[..8], &h[8..12], &h[12..16], &h[16..20], &h[20..])
    }
    fn money(&mut self, lo_cents: u64, hi_cents: u64) -> f64 {
        (lo_cents + self.0.below(hi_cents - lo_cents + 1)) as f64 / 100.0
    }
}

#[derive(Clone, Copy, PartialEq)]
enum Class {
    Desktop,
    Phone,
    Tablet,
    Mobile,
    Ctv,
    Stb,
    Connected,
}

fn device_class(g: &mut G) -> Class {
    match g.n(100) {
        0..=34 => Class::Desktop,
        35..=64 => Class::Phone,
        65..=72 => Class::Tablet,
        73..=82 => Class::Mobile,
        83..=92 => Class::Ctv,
        93..=96 => Class::Stb,
        _ => Class::Connected,
    }
}

fn devicetype(c: Class) -> u8 {
    match c {
        Class::Mobile => 1,
        Class::Desktop => 2,
        Class::Ctv => 3,
        Class::Phone => 4,
        Class::Tablet => 5,
        Class::Connected => 6,
        Class::Stb => 7,
    }
}

fn user_agent(g: &mut G, c: Class) -> String {
    let v = 110 + g.n(20);
    match c {
        Class::Desktop => {
            if g.pct(60) {
                format!("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{v}.0.{}.{} Safari/537.36", 5000 + g.n(999), g.n(200))
            } else {
                format!("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.{} Safari/605.1.15", g.n(6))
            }
        }
        Class::Phone | Class::Mobile => {
            if g.pct(50) {
                format!("Mozilla/5.0 (iPhone; CPU iPhone OS 17_{} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.{} Mobile/15E148 Safari/604.1", g.n(6), g.n(6))
            } else {
                format!("Mozilla/5.0 (Linux; Android 14; SM-S91{}B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{v}.0.{}.{} Mobile Safari/537.36", g.n(9), 5000 + g.n(999), g.n(200))
            }
        }
        Class::Tablet => format!("Mozilla/5.0 (iPad; CPU OS 17_{} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.{} Mobile/15E148 Safari/604.1", g.n(6), g.n(6)),
        Class::Ctv | Class::Stb | Class::Connected => format!("Roku/DVP-12.{} (12.{}.{}.{})", g.n(6), g.n(6), g.n(9), 4000 + g.n(999)),
    }
}

fn banner_imp(g: &mut G) -> Value {
    let k = 1 + if g.pct(60) { 0 } else { g.n(3) } as usize;
    let mut formats = Vec::with_capacity(k);
    for _ in 0..k {
        let (w, h) = if g.pct(85) { *g.pick(&crate::AD_SIZES) } else { *g.pick(&EXTRA_SIZES) };
        formats.push(json!({ "w": w, "h": h }));
    }
    if g.pct(8) {
        // older-style banner with only w/h
        let f = formats[0].clone();
        json!({ "w": f["w"], "h": f["h"], "pos": g.n(4), "btype": [4], "battr": [3, 8, 9] })
    } else {
        json!({ "format": formats, "pos": g.n(4), "btype": [4], "battr": [3, 8, 9], "api": [3, 5, 6], "topframe": g.n(2) })
    }
}

fn video_imp(g: &mut G) -> Value {
    let mimes = if g.pct(5) { json!(["video/webm"]) } else { json!(["video/mp4", "video/webm", "application/javascript"]) };
    let protocols = match g.n(10) {
        0..=6 => json!([2, 3, 5, 6, 7, 8]),
        7..=8 => json!([2, 3, 5, 6]),
        _ => json!([7, 8]),
    };
    let (w, h) = *g.pick(&[(640u32, 480u32), (1280, 720), (1920, 1080)]);
    json!({
        "mimes": mimes,
        "minduration": 5,
        "maxduration": *g.pick(&[10, 15, 30, 30, 60]),
        "protocols": protocols,
        "w": w, "h": h,
        "startdelay": 0,
        "plcmt": 1 + g.n(4),
        "linearity": 1,
        "skip": g.n(2),
        "playbackmethod": [1 + g.n(6)],
        "delivery": [2],
        "api": [7],
        "battr": [13, 14]
    })
}

fn imp(g: &mut G, i: usize, class: Class, is_app: bool) -> Value {
    let video = match class {
        Class::Ctv | Class::Stb | Class::Connected => true,
        _ if is_app => g.pct(40),
        _ => g.pct(15),
    };
    let mut imp = json!({ "id": (i + 1).to_string(), "tagid": format!("slot-{}", g.hex(10)), "secure": 1, "instl": u64::from(g.pct(5)) });
    if video {
        imp["video"] = video_imp(g);
    } else {
        imp["banner"] = banner_imp(g);
    }
    match g.n(100) {
        0..=24 => {}                                                          // no floor
        25..=84 => imp["bidfloor"] = json!(g.money(10, 200)),                 // 0.10..2.00
        _ => imp["bidfloor"] = json!(g.money(200, 2000)),                     // 2.00..20.00
    }
    match g.n(100) {
        0..=89 => {}
        90..=95 => imp["bidfloorcur"] = json!("EUR"),
        96..=97 => imp["bidfloorcur"] = json!("GBP"),
        _ => imp["bidfloorcur"] = json!("JPY"), // not convertible by this bidder -> imp skipped
    }
    match g.n(100) {
        0..=3 => {
            imp["pmp"] = json!({ "private_auction": 1, "deals": [{ "id": format!("deal-{}", g.hex(8)), "bidfloor": 5.0, "at": 1, "wseat": ["another-dsp"] }] });
        }
        4..=6 => {
            imp["pmp"] = json!({ "private_auction": 0, "deals": [{ "id": format!("deal-{}", g.hex(8)), "bidfloor": 3.5, "at": 1 }] });
        }
        _ => {}
    }
    if is_app {
        imp["displaymanager"] = json!("GoogleMobileAdsSdk");
        imp["displaymanagerver"] = json!(format!("23.{}.0", g.n(9)));
    }
    if g.pct(30) {
        imp["ext"] = json!({ "prebid": { "storedrequest": { "id": g.hex(12) } }, "gpid": format!("/1234/home/slot-{}", i + 1) });
    }
    imp
}

fn iab(g: &mut G) -> String {
    if g.pct(30) {
        format!("IAB{}", 1 + g.n(26))
    } else {
        format!("IAB{}-{}", 1 + g.n(26), 1 + g.n(12))
    }
}

/// One request, as a compact JSON line.
pub(crate) fn request(g: &mut SplitMix64) -> String {
    let g = &mut G(SplitMix64(g.next_u64()));
    let class = device_class(g);
    let is_app = matches!(class, Class::Ctv | Class::Stb | Class::Connected) || g.pct(30);
    let country = if g.pct(40) {
        "USA"
    } else if g.pct(90) {
        *g.pick(&COUNTRIES)
    } else {
        *g.pick(&EXTRA_COUNTRIES)
    };
    let gdpr = EU.contains(&country);
    let n_imps = match g.n(100) {
        0..=69 => 1,
        70..=87 => 2,
        88..=95 => 3,
        _ => 4,
    };
    let imps: Vec<Value> = (0..n_imps).map(|i| imp(g, i, class, is_app)).collect();

    let ua = if g.pct(1) {
        (*g.pick(&[
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36",
        ]))
        .to_string()
    } else {
        user_agent(g, class)
    };
    let mut device = json!({
        "ua": ua,
        "ip": format!("198.51.{}.{}", g.n(256), g.n(256)),
        "geo": {
            "lat": (g.n(18_000) as f64 / 100.0) - 90.0,
            "lon": (g.n(36_000) as f64 / 100.0) - 180.0,
            "type": 2, "ipservice": 3, "country": country,
            "region": format!("R{}", g.n(50)), "city": format!("City {}", g.n(500)), "zip": format!("{:05}", g.n(99_999)),
            "utcoffset": (g.n(25) as i64 - 12) * 60
        },
        "dnt": 0,
        "lmt": u64::from(g.pct(5)),
        "make": *g.pick(&["Apple", "Samsung", "Google", "Roku", "LG", "Microsoft"]),
        "model": format!("Model-{}", g.n(90)),
        "os": *g.pick(&["iOS", "Android", "Windows", "macOS", "Roku OS", "Tizen"]),
        "osv": format!("{}.{}", 10 + g.n(8), g.n(9)),
        "h": *g.pick(&[844, 915, 1080, 1440, 2160]), "w": *g.pick(&[390, 412, 1920, 2560, 3840]),
        "pxratio": *g.pick(&[1.0, 2.0, 3.0]),
        "js": 1, "language": "en", "carrier": "WIFI", "connectiontype": *g.pick(&[2, 6, 7])
    });
    if g.pct(95) {
        device["devicetype"] = json!(devicetype(class));
    }
    if is_app {
        device["ifa"] = json!(g.uuid());
    }
    if g.pct(50) {
        device["sua"] = json!({
            "browsers": [{ "brand": "Chromium", "version": ["120", "0", "6099", "109"] }, { "brand": "Google Chrome", "version": ["120", "0", "6099", "109"] }],
            "platform": { "brand": "Android", "version": ["14", "0", "0"] }, "mobile": 1, "source": 2
        });
    }

    let mut user = json!({ "id": g.hex(40) });
    if g.pct(60) {
        user["buyeruid"] = json!(g.hex(32));
    }
    let n_data = g.n(4);
    if n_data > 0 {
        let data: Vec<Value> = (0..n_data)
            .map(|_| {
                let provider = if g.pct(85) { (*g.pick(&DATA_PROVIDERS)).to_string() } else { "dp9".to_string() };
                let segs: Vec<Value> = (0..g.n(13)).map(|_| json!({ "id": (SEGMENT_BASE + g.n(100) as u32).to_string() })).collect();
                json!({ "id": provider, "name": "Data Provider", "segment": segs })
            })
            .collect();
        user["data"] = json!(data);
    }
    if gdpr && g.pct(90) {
        let len = 120 + g.n(280) as usize;
        user["consent"] = json!(format!("CP{}", g.b64(len)));
    }
    let n_eids = g.n(4);
    if n_eids > 0 {
        let sources = ["liveramp.com", "id5-sync.com", "uidapi.com"];
        let eids: Vec<Value> = (0..n_eids as usize)
            .map(|k| {
                let len = 40 + g.n(40) as usize;
                json!({ "source": sources[k % 3], "uids": [{ "id": g.b64(len), "atype": 3 }] })
            })
            .collect();
        user["eids"] = json!(eids);
    }

    let mut regs = json!({ "coppa": u64::from(g.pct(1)), "gdpr": u64::from(gdpr) });
    if country == "USA" {
        regs["us_privacy"] = json!(if g.pct(10) { "1YYN" } else { "1YNN" });
    }
    if g.pct(30) {
        regs["gpp"] = json!(format!("DBAB{}", g.b64(60)));
        regs["gpp_sid"] = json!([*g.pick(&[2u32, 6, 7, 8])]);
    }

    let n_nodes = 1 + g.n(3);
    let nodes: Vec<Value> = (0..n_nodes)
        .map(|k| json!({ "asi": format!("ssp{}.example", k + 1), "sid": format!("pub-{}", g.n(100_000)), "hp": 1, "rid": g.hex(16) }))
        .collect();

    let tmax = if g.pct(1) { 5 } else { *g.pick(&[80, 100, 120, 150, 200, 300, 500, 1000]) };
    let mut req = json!({
        "id": g.hex(32),
        "imp": imps,
        "device": device,
        "user": user,
        "at": if g.pct(80) { 1 } else { 2 },
        "tmax": tmax,
        "regs": regs,
        "source": { "tid": g.uuid(), "schain": { "complete": 1, "ver": "1.0", "nodes": nodes } },
        "ext": { "prebid": { "debug": false } }
    });
    let cat_a = iab(g);
    let cat_b = iab(g);
    if is_app {
        req["app"] = json!({
            "id": g.hex(12), "name": format!("App {}", g.n(1000)), "bundle": format!("com.example.app{}", g.n(5000)),
            "storeurl": format!("https://play.google.com/store/apps/details?id=com.example.app{}", g.n(5000)),
            "cat": [cat_a, cat_b], "ver": format!("{}.{}.{}", g.n(9), g.n(9), g.n(9)),
            "publisher": { "id": format!("pub-{}", g.n(100_000)), "name": "Publisher" }
        });
    } else {
        req["site"] = json!({
            "id": g.hex(12), "name": format!("Site {}", g.n(1000)), "domain": format!("news{}.example", g.n(3000)),
            "cat": [cat_a, cat_b], "page": format!("https://news{}.example/section/{}/article-{}.html?utm_source=feed", g.n(3000), g.n(30), g.n(100_000)),
            "ref": "https://www.search.example/", "mobile": u64::from(matches!(class, Class::Phone | Class::Mobile | Class::Tablet)), "privacypolicy": 1,
            "publisher": { "id": format!("pub-{}", g.n(100_000)), "name": "Publisher", "domain": format!("news{}.example", g.n(3000)) },
            "content": { "language": "en", "keywords": "news,sports,weather" }
        });
    }
    match g.n(100) {
        0..=79 => req["cur"] = json!(["USD"]),
        80..=89 => req["cur"] = json!(["USD", "EUR"]),
        90..=98 => {}
        _ => req["cur"] = json!(["EUR"]), // we bid in USD only -> no bid
    }
    let n_bcat = g.n(7);
    if n_bcat > 0 {
        req["bcat"] = json!((0..n_bcat).map(|_| iab(g)).collect::<Vec<_>>());
    }
    let n_badv = g.n(5);
    if n_badv > 0 {
        req["badv"] = json!((0..n_badv)
            .map(|_| if g.pct(50) { format!("brand{:04}.example", 1 + g.n(ADVERTISER_DOMAINS as u64)) } else { format!("other{}.example", g.n(500)) })
            .collect::<Vec<_>>());
    }
    if g.pct(2) {
        req["newfield2030"] = json!({ "future": true, "values": [1, 2, 3] }); // must be tolerated (spec 2.6)
    }
    serde_json::to_string(&req).expect("serialize request")
}

/// `n` requests from `seed`.
pub fn generate(seed: u64, n: usize) -> Vec<String> {
    let mut rng = SplitMix64(seed);
    (0..n).map(|_| request(&mut rng)).collect()
}
