use super::*;
use serde_json::{json, Value};

const SPEC_EXAMPLES: [(&str, &str); 5] = [
    ("1 simple banner", include_str!("../../fixtures/openrtb-2.6/example-1.json")),
    ("2 expandable creative", include_str!("../../fixtures/openrtb-2.6/example-2.json")),
    ("3 mobile", include_str!("../../fixtures/openrtb-2.6/example-3.json")),
    ("4 video", include_str!("../../fixtures/openrtb-2.6/example-4.json")),
    ("5 pmp with direct deal", include_str!("../../fixtures/openrtb-2.6/example-5.json")),
];

fn e() -> &'static Engine {
    static E: LazyLock<Engine> = LazyLock::new(|| Engine::generate(DEFAULT_SEED, DEFAULT_LINE_ITEMS));
    &E
}

fn body_json(o: &Outcome) -> Option<Value> {
    match o {
        Outcome::Body(b) => Some(serde_json::from_slice(b).expect("response is JSON")),
        _ => None,
    }
}

/// Checks a response against the spec rules this bidder follows, using only the request JSON.
fn validate(req: &Value, resp: &Value) {
    assert_eq!(resp["id"], req["id"], "BidResponse.id echoes BidRequest.id (4.2.1)");
    assert_eq!(resp["cur"], "USD");
    let bids = resp["seatbid"][0]["bid"].as_array().expect("seatbid[0].bid");
    assert_eq!(resp["seatbid"][0]["seat"], SEAT);
    assert!(!bids.is_empty(), "1+ bids when bidding (4.2.2)");
    let strs = |v: &Value| -> Vec<String> {
        v.as_array().map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect()).unwrap_or_default()
    };
    let (bcat, badv) = (strs(&req["bcat"]), strs(&req["badv"]));
    let mut seen = std::collections::HashSet::new();
    for bid in bids {
        let impid = bid["impid"].as_str().expect("impid");
        assert!(seen.insert(impid.to_string()), "one bid per impression");
        let imp = req["imp"].as_array().unwrap().iter().find(|i| i["id"] == impid).expect("impid is a request imp");
        assert!(imp["banner"].is_object(), "bids only on banner impressions");
        assert_ne!(imp["pmp"]["private_auction"], 1, "no open-market bid on a private auction");
        assert!(imp["bidfloorcur"].as_str().is_none_or(|c| c == "USD"));
        let price = bid["price"].as_f64().unwrap();
        assert!(price > 0.0 && price + 1e-9 >= imp["bidfloor"].as_f64().unwrap_or(0.0), "price {price} below floor");
        let (w, h) = (bid["w"].as_u64().unwrap(), bid["h"].as_u64().unwrap());
        let banner = &imp["banner"];
        let offered = banner["format"]
            .as_array()
            .map(|f| f.iter().any(|f| f["w"] == w && f["h"] == h))
            .unwrap_or(banner["w"] == w && banner["h"] == h);
        assert!(offered, "size {w}x{h} was not offered");
        let adomain = bid["adomain"][0].as_str().unwrap();
        assert!(!badv.iter().any(|d| d == adomain), "{adomain} is in badv");
        let cat = bid["cat"][0].as_str().unwrap();
        assert!(
            !bcat.iter().any(|b| cat == b || (cat.starts_with(b.as_str()) && cat[b.len()..].starts_with('-'))),
            "{cat} blocked by {bcat:?}"
        );
        for k in ["nurl", "burl", "adm"] {
            assert!(bid[k].as_str().unwrap().contains("${AUCTION_PRICE}"), "{k} carries the price macro (4.4)");
        }
        assert_eq!(bid["mtype"], 1);
        assert!(bid["adm"].as_str().unwrap().contains("<img "));
    }
}

#[test]
fn spec_examples_are_handled() {
    for (name, raw) in SPEC_EXAMPLES {
        let out = e().handle(raw.as_bytes());
        assert_ne!(out, Outcome::Invalid, "spec example {name} must parse");
        if let Some(resp) = body_json(&out) {
            validate(&serde_json::from_str(raw).unwrap(), &resp);
        }
    }
    // Example 4 offers only video: an image-only bidder does not bid.
    assert_eq!(e().handle(SPEC_EXAMPLES[3].1.as_bytes()), Outcome::NoBid);
    // Example 5 offers the impression only through private deals for other seats.
    assert_eq!(e().handle(SPEC_EXAMPLES[4].1.as_bytes()), Outcome::NoBid);
}

#[test]
fn corpus_requests_are_valid_and_responses_follow_the_spec() {
    let (mut bids, mut nobid) = (0, 0);
    for raw in corpus::generate(corpus::DEFAULT_CORPUS_SEED, corpus::DEFAULT_CORPUS_SIZE) {
        match e().handle(raw.as_bytes()) {
            Outcome::Invalid => panic!("corpus request rejected: {raw}"),
            Outcome::NoBid => nobid += 1,
            out @ Outcome::Body(_) => {
                validate(&serde_json::from_str(&raw).unwrap(), &body_json(&out).unwrap());
                bids += 1;
            }
        }
    }
    assert!(bids > 500 && nobid > 50, "bids={bids} nobid={nobid}");
}

/// Deliberately naive re-implementation: every line item, string comparisons on the readable
/// fields, the same rules and tie-break order as the indexed fast path.
fn reference_decide(eng: &Engine, req: &BidRequest) -> Vec<Choice> {
    let devicetype = req.device.as_ref().and_then(|d| d.devicetype);
    let country = req.device.as_ref().and_then(|d| d.geo.as_ref()).and_then(|g| g.country.as_deref());
    let has_segment = |p: &str, s: u32| {
        req.user.iter().flat_map(|u| &u.data).any(|d| {
            d.id.as_deref() == Some(p) && d.segment.iter().any(|seg| seg.id.as_deref() == Some(s.to_string().as_str()))
        })
    };
    let value = |li: &LineItem| -> Option<u64> {
        if !li.device_types.is_empty() && !devicetype.is_some_and(|d| li.device_types.contains(&d)) {
            return None;
        }
        if !li.countries.is_empty() && !country.is_some_and(|c| li.countries.contains(&c)) {
            return None;
        }
        if req.bcat.iter().any(|b| li.cat == b.0 || (li.cat.starts_with(b.0.as_ref()) && li.cat[b.0.len()..].starts_with('-'))) {
            return None;
        }
        if req.badv.iter().any(|d| li.adomain == d.0) {
            return None;
        }
        let mut overlap = 0u64;
        if !li.audience.is_empty() {
            overlap = li.audience.iter().filter(|(p, s)| has_segment(p, *s)).count() as u64;
            if overlap == 0 {
                return None;
            }
        }
        Some(li.base_cpm_micros * (10_000 + 2_500 * overlap.min(4)) / 10_000)
    };
    let mut bids = Vec::new();
    for (i, imp) in req.imp.iter().enumerate() {
        let Some(banner) = &imp.banner else { continue };
        if imp.pmp.as_ref().is_some_and(|p| p.private_auction == 1) {
            continue;
        }
        let Some(floor) = floor_usd_micros(imp) else { continue };
        let mut sizes: Vec<(u32, u32)> = banner.format.iter().filter_map(|f| Some((f.w?, f.h?))).collect();
        if banner.format.is_empty() {
            if let (Some(w), Some(h)) = (banner.w, banner.h) {
                sizes.push((w, h));
            }
        }
        let mut best: Option<Choice> = None;
        for (w, h) in sizes {
            for (idx, li) in eng.line_items().iter().enumerate() {
                if !li.sizes.contains(&(w, h)) {
                    continue;
                }
                let Some(v) = value(li) else { continue };
                if v == 0 || v < floor {
                    continue;
                }
                let p = if req.at == 1 { (v * FIRST_PRICE_SHADE_PCT / 100).max(floor) } else { v };
                if best.is_none_or(|b| p > b.price_micros) {
                    best = Some(Choice { imp_index: i, item: idx as u32, price_micros: p, w, h });
                }
            }
        }
        bids.extend(best);
    }
    bids
}

#[test]
fn indexed_fast_path_matches_reference_implementation() {
    let mut corpus = corpus::generate(99, 500);
    corpus.extend(SPEC_EXAMPLES.iter().map(|(_, r)| r.to_string()));
    for raw in &corpus {
        let req: BidRequest = serde_json::from_str(raw).unwrap();
        assert_eq!(e().decide(&req), reference_decide(e(), &req), "request {raw}");
    }
}

#[test]
fn deterministic_engine_corpus_and_bytes() {
    let a = Engine::generate(DEFAULT_SEED, 500);
    assert_eq!(a.line_items(), Engine::generate(DEFAULT_SEED, 500).line_items());
    assert_ne!(Engine::generate(DEFAULT_SEED + 1, 500).line_items(), a.line_items());
    assert_eq!(corpus::generate(5, 100), corpus::generate(5, 100));
    for raw in corpus::generate(5, 100) {
        assert_eq!(e().handle(raw.as_bytes()), e().handle(raw.as_bytes()));
    }
}

#[test]
fn invalid_requests_are_rejected() {
    for (name, body) in [
        ("malformed JSON", &b"{\"id\":"[..]),
        ("not JSON", b"hello"),
        ("missing imp", br#"{"id":"x"}"#),
        ("empty imp array", br#"{"id":"x","imp":[]}"#),
        ("missing id", br#"{"imp":[{"id":"1"}]}"#),
        ("imp without id", br#"{"id":"x","imp":[{"banner":{"w":300,"h":250}}]}"#),
    ] {
        assert_eq!(e().handle(body), Outcome::Invalid, "{name}");
    }
    assert_eq!(e().handle(&vec![b' '; MAX_BODY_BYTES + 1]), Outcome::Invalid, "too large");
}

#[test]
fn unknown_fields_are_tolerated() {
    let raw = SPEC_EXAMPLES[0].1;
    let mut v: Value = serde_json::from_str(raw).unwrap();
    v["zzz_new_top"] = json!({ "a": [1, 2, { "b": null }] });
    v["imp"][0]["zzz_new_imp"] = json!(42);
    v["imp"][0]["banner"]["zzz_new_banner"] = json!("x");
    assert_eq!(e().handle(&serde_json::to_vec(&v).unwrap()), e().handle(raw.as_bytes()));
}

#[test]
fn floors_currency_and_first_price() {
    let with = |f: &dyn Fn(&mut Value)| {
        let mut v: Value = serde_json::from_str(SPEC_EXAMPLES[0].1).unwrap(); // at = 1, floor 0.03 USD
        f(&mut v);
        e().handle(&serde_json::to_vec(&v).unwrap())
    };
    assert_eq!(with(&|v| v["imp"][0]["bidfloorcur"] = json!("EUR")), Outcome::NoBid, "non-USD floor");
    assert_eq!(with(&|v| v["imp"][0]["bidfloor"] = json!(1_000.0)), Outcome::NoBid, "floor above every value");
    let price = |o: Outcome| body_json(&o).unwrap()["seatbid"][0]["bid"][0]["price"].as_f64().unwrap();
    let first = price(with(&|_| {}));
    let second = price(with(&|v| v["at"] = json!(2)));
    assert!((first - (second * 0.85).max(0.03)).abs() < 1e-6, "first price {first} vs second {second}");
}

#[test]
fn canonical_parsing() {
    assert_eq!(parse_iab("IAB12-3"), Some((12, Some(3))));
    assert_eq!(parse_iab("IAB12"), Some((12, None)));
    for bad in ["IAB012", "IAB+1", "IAB1-03", "iab1", "IAB", "IAB1-", "IAB300"] {
        assert_eq!(parse_iab(bad), None, "{bad}");
    }
    assert_eq!(parse_canonical_u32("1005"), Some(1005));
    assert_eq!(parse_canonical_u32("01005"), None);
}
