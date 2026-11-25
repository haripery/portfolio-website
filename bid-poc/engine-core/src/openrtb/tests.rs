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

fn outcome_json(o: &Outcome) -> Option<Value> {
    match o {
        Outcome::Body(b) => Some(serde_json::from_slice(b).expect("response is JSON")),
        _ => None,
    }
}

/// Checks a response against the spec rules this bidder claims to follow, using only the request
/// JSON (not the engine's internals).
fn validate(req: &Value, resp: &Value) {
    assert_eq!(resp["id"], req["id"], "BidResponse.id must echo BidRequest.id (4.2.1)");
    if let Some(nbr) = resp.get("nbr") {
        assert!(nbr == 3 || nbr == 15, "unexpected nbr {nbr}");
        assert!(resp.get("seatbid").is_none());
        return;
    }
    assert_eq!(resp["cur"], "USD");
    let seatbid = resp["seatbid"].as_array().expect("seatbid array");
    assert_eq!(seatbid.len(), 1);
    assert_eq!(seatbid[0]["seat"], SEAT);
    let bids = seatbid[0]["bid"].as_array().expect("bid array");
    assert!(!bids.is_empty(), "1+ bids required when bidding (4.2.2)");
    let imps = req["imp"].as_array().unwrap();
    let mut seen = std::collections::HashSet::new();
    let strs = |v: &Value| -> Vec<String> {
        v.as_array().map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect()).unwrap_or_default()
    };
    let bcat = strs(&req["bcat"]);
    let badv = strs(&req["badv"]);
    for bid in bids {
        let impid = bid["impid"].as_str().expect("impid");
        assert!(seen.insert(impid.to_string()), "one bid per impression");
        assert!(!bid["id"].as_str().unwrap().is_empty());
        let imp = imps.iter().find(|i| i["id"] == impid).expect("impid refers to a request imp");
        assert_ne!(imp["pmp"]["private_auction"], 1, "no open-market bid on a private auction");
        let price = bid["price"].as_f64().unwrap();
        let cur = imp["bidfloorcur"].as_str().unwrap_or("USD");
        let rate = FX_TO_USD_MICROS.iter().find(|(c, _)| *c == cur).expect("floor currency convertible").1;
        let floor = imp["bidfloor"].as_f64().unwrap_or(0.0) * rate as f64 / 1e6;
        assert!(price > 0.0 && price + 1e-9 >= floor, "price {price} below floor {floor}");
        let adomain = bid["adomain"][0].as_str().unwrap();
        assert!(!badv.iter().any(|d| d == adomain), "adomain {adomain} is in badv");
        let cat = bid["cat"][0].as_str().unwrap();
        assert!(
            !bcat.iter().any(|b| cat == b || (cat.starts_with(b.as_str()) && cat[b.len()..].starts_with('-'))),
            "category {cat} blocked by bcat {bcat:?}"
        );
        for k in ["nurl", "burl"] {
            assert!(bid[k].as_str().unwrap().contains("${AUCTION_PRICE}"), "{k} carries the price macro");
        }
        assert!(bid["lurl"].as_str().unwrap().contains("${AUCTION_LOSS}"));
        let adm = bid["adm"].as_str().unwrap();
        match bid["mtype"].as_u64() {
            Some(1) => {
                let (w, h) = (bid["w"].as_u64().unwrap(), bid["h"].as_u64().unwrap());
                let banner = &imp["banner"];
                let offered = banner["format"]
                    .as_array()
                    .map(|f| f.iter().any(|f| f["w"] == w && f["h"] == h))
                    .unwrap_or(banner["w"] == w && banner["h"] == h);
                assert!(offered, "banner size {w}x{h} was not offered");
                assert!(adm.starts_with("<div") && adm.contains("${AUCTION_PRICE}"));
            }
            Some(2) => {
                let video = &imp["video"];
                assert!(strs(&video["mimes"]).iter().any(|m| m == VIDEO_MIME));
                let dur = bid["dur"].as_u64().unwrap();
                assert!(video["minduration"].as_u64().is_none_or(|m| dur >= m));
                assert!(video["maxduration"].as_u64().is_none_or(|m| dur <= m));
                let protos = video["protocols"].as_array().cloned().unwrap_or_default();
                assert!(protos.is_empty() || protos.contains(&bid["protocol"]));
                assert!(adm.starts_with("<VAST version="));
            }
            other => panic!("unexpected mtype {other:?}"),
        }
    }
}

#[test]
fn spec_examples_are_handled() {
    for (name, raw) in SPEC_EXAMPLES {
        let req: Value = serde_json::from_str(raw).unwrap();
        let out = e().handle(raw.as_bytes(), false, false);
        assert_ne!(out, Outcome::Invalid, "spec example {name} must parse");
        if let Some(resp) = outcome_json(&out) {
            validate(&req, &resp);
        }
    }
    // Example 5 offers the impression only through private deals for other seats.
    assert_eq!(e().handle(SPEC_EXAMPLES[4].1.as_bytes(), false, false), Outcome::NoBid);
}

#[test]
fn corpus_requests_are_valid_and_responses_follow_the_spec() {
    let corpus = corpus::generate(corpus::DEFAULT_CORPUS_SEED, 3_000);
    let (mut bids, mut nobid, mut nbr3, mut nbr15) = (0, 0, 0, 0);
    for raw in &corpus {
        let req: Value = serde_json::from_str(raw).unwrap();
        match e().handle(raw.as_bytes(), false, false) {
            Outcome::Invalid => panic!("corpus request rejected: {raw}"),
            Outcome::NoBid => nobid += 1,
            out @ Outcome::Body(_) => {
                let resp = outcome_json(&out).unwrap();
                validate(&req, &resp);
                match resp.get("nbr").and_then(Value::as_u64) {
                    Some(3) => nbr3 += 1,
                    Some(15) => nbr15 += 1,
                    _ => bids += 1,
                }
            }
        }
    }
    // the corpus is meant to contain all of these outcomes
    assert!(bids > 1_000 && nobid > 100 && nbr3 > 5 && nbr15 > 5, "bids={bids} nobid={nobid} nbr3={nbr3} nbr15={nbr15}");
}

/// Deliberately naive re-implementation: every line item, string comparisons on the readable
/// fields, same rules and tie-break order as the indexed fast path.
fn reference_decide(eng: &Engine, req: &BidRequest) -> Decision {
    if req.device.as_ref().and_then(|d| d.ua.as_deref()).is_some_and(is_known_crawler) {
        return Decision::NoBidReason(3);
    }
    if req.tmax.is_some_and(|t| t < MIN_TMAX_MS) {
        return Decision::NoBidReason(15);
    }
    if !req.cur.is_empty() && !req.cur.iter().any(|c| c.0 == "USD") {
        return Decision::NoBid;
    }
    let devicetype = req.device.as_ref().and_then(|d| d.devicetype);
    let country = req.device.as_ref().and_then(|d| d.geo.as_ref()).and_then(|g| g.country.as_deref());
    let audience_ok = audience_allowed(req);
    let has_segment = |p: &str, s: u32| {
        req.user.iter().flat_map(|u| &u.data).any(|d| {
            d.id.as_deref() == Some(p) && d.segment.iter().any(|seg| seg.id.as_deref() == Some(s.to_string().as_str()))
        })
    };
    let req_cats: Vec<&str> = req
        .site
        .as_ref()
        .map(|s| &s.cat)
        .or(req.app.as_ref().map(|a| &a.cat))
        .map(|c| c.iter().map(|x| x.0.as_ref()).collect())
        .unwrap_or_default();
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
            if !audience_ok {
                return None;
            }
            overlap = li.audience.iter().filter(|(p, s)| has_segment(p, *s)).count() as u64;
            if overlap == 0 {
                return None;
            }
        }
        let mut v = li.base_cpm_micros * (10_000 + 2_500 * overlap.min(4)) / 10_000;
        let top = format!("IAB{}", li.content_top);
        if li.content_top != 0 && req_cats.iter().any(|c| *c == top || (c.starts_with(top.as_str()) && c[top.len()..].starts_with('-'))) {
            v = v * 12 / 10;
        }
        Some(v)
    };
    let mut bids = Vec::new();
    for (i, imp) in req.imp.iter().enumerate() {
        if imp.pmp.as_ref().is_some_and(|p| p.private_auction == 1) {
            continue;
        }
        let Some(floor) = floor_usd_micros(imp) else { continue };
        let price = |v: u64| -> Option<u64> {
            if v == 0 || v < floor {
                None
            } else if req.at == 1 {
                Some((v * FIRST_PRICE_SHADE_PCT / 100).max(floor))
            } else {
                Some(v)
            }
        };
        let mut best: Option<Choice> = None;
        let mut sizes: Vec<(u32, u32)> = Vec::new();
        if let Some(b) = &imp.banner {
            sizes.extend(b.format.iter().filter_map(|f| Some((f.w?, f.h?))));
            if b.format.is_empty() {
                if let (Some(w), Some(h)) = (b.w, b.h) {
                    sizes.push((w, h));
                }
            }
        }
        for (w, h) in sizes {
            for (idx, li) in eng.line_items().iter().enumerate() {
                let Creative::Banner { sizes } = &li.creative else { continue };
                if sizes.contains(&(w, h)) {
                    if let Some(p) = value(li).and_then(price) {
                        if best.is_none_or(|b| p > b.price_micros) {
                            best = Some(Choice { imp_index: i, item: idx as u32, price_micros: p, w, h });
                        }
                    }
                }
            }
        }
        if let Some(v) = &imp.video {
            if v.mimes.iter().any(|m| m.0 == VIDEO_MIME) {
                for (idx, li) in eng.line_items().iter().enumerate() {
                    let Creative::Video { duration_s, protocol } = li.creative else { continue };
                    let ok = (v.protocols.is_empty() || v.protocols.contains(&protocol))
                        && v.minduration.is_none_or(|m| duration_s >= m)
                        && v.maxduration.is_none_or(|m| duration_s <= m);
                    if ok {
                        if let Some(p) = value(li).and_then(price) {
                            if best.is_none_or(|b| p > b.price_micros) {
                                best = Some(Choice { imp_index: i, item: idx as u32, price_micros: p, w: 0, h: 0 });
                            }
                        }
                    }
                }
            }
        }
        bids.extend(best);
    }
    if bids.is_empty() {
        Decision::NoBid
    } else {
        Decision::Bids(bids)
    }
}

#[test]
fn indexed_fast_path_matches_reference_implementation() {
    let mut corpus = corpus::generate(99, 600);
    corpus.extend(SPEC_EXAMPLES.iter().map(|(_, r)| r.to_string()));
    for raw in &corpus {
        let req: BidRequest = serde_json::from_str(raw).unwrap();
        assert_eq!(e().decide(&req), reference_decide(e(), &req), "request {raw}");
    }
}

#[test]
fn deterministic_engine_corpus_and_bytes() {
    let a = Engine::generate(DEFAULT_SEED, 2_000);
    let b = Engine::generate(DEFAULT_SEED, 2_000);
    assert_eq!(a.line_items(), b.line_items());
    assert_ne!(Engine::generate(DEFAULT_SEED + 1, 2_000).line_items(), a.line_items());
    assert_eq!(corpus::generate(5, 200), corpus::generate(5, 200));
    for raw in corpus::generate(5, 200) {
        assert_eq!(e().handle(raw.as_bytes(), false, false), e().handle(raw.as_bytes(), false, false));
    }
}

#[test]
fn gzip_in_and_out() {
    for raw in corpus::generate(11, 200) {
        let plain = e().handle(raw.as_bytes(), false, false);
        assert_eq!(e().handle(&gzip(raw.as_bytes()), true, false), plain, "gzip request body");
        match (e().handle(raw.as_bytes(), false, true), &plain) {
            (Outcome::Body(gz), Outcome::Body(p)) => assert_eq!(&gunzip(&gz).unwrap(), p, "gzip response body"),
            (o, p) => assert_eq!(&o, p),
        }
    }
}

#[test]
fn invalid_requests_are_rejected() {
    let bomb = gzip(format!("{{\"id\":\"x\",\"imp\":[{{\"id\":\"1\"}}],\"pad\":\"{}\"}}", " ".repeat(MAX_BODY_BYTES)).as_bytes());
    for (name, body, gz) in [
        ("malformed JSON", b"{\"id\":".to_vec(), false),
        ("not JSON", b"hello".to_vec(), false),
        ("missing imp", br#"{"id":"x"}"#.to_vec(), false),
        ("empty imp array", br#"{"id":"x","imp":[]}"#.to_vec(), false),
        ("missing id", br#"{"imp":[{"id":"1"}]}"#.to_vec(), false),
        ("imp without id", br#"{"id":"x","imp":[{"banner":{"w":300,"h":250}}]}"#.to_vec(), false),
        ("gzip flag on a plain body", br#"{"id":"x","imp":[{"id":"1"}]}"#.to_vec(), true),
        ("gzip bomb over the size limit", bomb, true),
    ] {
        assert_eq!(e().handle(&body, gz, false), Outcome::Invalid, "{name}");
    }
}

#[test]
fn unknown_fields_are_tolerated() {
    let raw = corpus::generate(13, 50).into_iter().find(|r| matches!(e().handle(r.as_bytes(), false, false), Outcome::Body(_))).unwrap();
    let mut v: Value = serde_json::from_str(&raw).unwrap();
    v["zzz_new_top"] = json!({ "a": [1, 2, { "b": null }] });
    v["imp"][0]["zzz_new_imp"] = json!(42);
    v["device"]["zzz_new_device"] = json!("x");
    v["user"]["zzz_new_user"] = json!([true]);
    let changed = serde_json::to_vec(&v).unwrap();
    assert_eq!(e().handle(&changed, false, false), e().handle(raw.as_bytes(), false, false));
}

#[test]
fn nbr_and_currency_rules() {
    let base = SPEC_EXAMPLES[0].1;
    let with = |f: &dyn Fn(&mut Value)| {
        let mut v: Value = serde_json::from_str(base).unwrap();
        f(&mut v);
        e().handle(&serde_json::to_vec(&v).unwrap(), false, false)
    };
    let nbr = |o: Outcome| outcome_json(&o).and_then(|v| v["nbr"].as_u64());
    assert_eq!(nbr(with(&|v| v["device"] = json!({ "ua": "Mozilla/5.0 (compatible; Googlebot/2.1)" }))), Some(3));
    assert_eq!(nbr(with(&|v| v["tmax"] = json!(5))), Some(15));
    assert_eq!(with(&|v| v["cur"] = json!(["EUR"])), Outcome::NoBid);
    assert_eq!(with(&|v| v["imp"][0]["bidfloorcur"] = json!("JPY")), Outcome::NoBid);
    assert_eq!(with(&|v| v["imp"][0]["bidfloor"] = json!(1_000.0)), Outcome::NoBid);
}

#[test]
fn privacy_signals_switch_off_audience_targeting() {
    let corpus = corpus::generate(17, 4_000);
    let mut checked = 0;
    for raw in &corpus {
        let req: BidRequest = serde_json::from_str(raw).unwrap();
        let Decision::Bids(choices) = e().decide(&req) else { continue };
        if !choices.iter().any(|c| !e().line_items()[c.item as usize].audience.is_empty()) {
            continue; // need a request won by an audience-targeted line item
        }
        for regs in [json!({ "coppa": 1 }), json!({ "gdpr": 1 }), json!({ "us_privacy": "1YYN" })] {
            let mut v: Value = serde_json::from_str(raw).unwrap();
            v["regs"] = regs.clone();
            if let Some(u) = v.get_mut("user") {
                u.as_object_mut().unwrap().remove("consent");
            }
            let changed = serde_json::to_string(&v).unwrap();
            let req2: BidRequest = serde_json::from_str(&changed).unwrap();
            if let Decision::Bids(cs) = e().decide(&req2) {
                for c in cs {
                    assert!(e().line_items()[c.item as usize].audience.is_empty(), "audience used despite {regs}");
                }
            }
        }
        checked += 1;
        if checked == 25 {
            break;
        }
    }
    assert_eq!(checked, 25);
}

#[test]
fn first_price_is_shaded_but_not_below_floor() {
    let raw = SPEC_EXAMPLES[0].1; // at = 1
    let mut v: Value = serde_json::from_str(raw).unwrap();
    let first = outcome_json(&e().handle(raw.as_bytes(), false, false)).unwrap();
    v["at"] = json!(2);
    let second = outcome_json(&e().handle(&serde_json::to_vec(&v).unwrap(), false, false)).unwrap();
    let p1 = first["seatbid"][0]["bid"][0]["price"].as_f64().unwrap();
    let p2 = second["seatbid"][0]["bid"][0]["price"].as_f64().unwrap();
    assert!((p1 - (p2 * 0.85).max(0.03)).abs() < 1e-6, "first {p1} second {p2}");
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

#[test]
fn gzip_interoperates_with_standard_implementations() {
    use flate2::{read::GzDecoder, write::GzEncoder, GzBuilder};
    use std::io::{Read, Write};
    let data = corpus::generate(3, 1)[0].clone().into_bytes();
    // ours -> standard decoder
    let mut back = Vec::new();
    GzDecoder::new(&gzip(&data)[..]).read_to_end(&mut back).unwrap();
    assert_eq!(back, data);
    // standard encoder (default and best levels) -> ours
    for level in [flate2::Compression::default(), flate2::Compression::best()] {
        let mut enc = GzEncoder::new(Vec::new(), level);
        enc.write_all(&data).unwrap();
        assert_eq!(gunzip(&enc.finish().unwrap()).unwrap(), data);
    }
    // header with file name, comment and extra field (FNAME | FCOMMENT | FEXTRA) -> ours
    let mut enc = GzBuilder::new().filename("req.json").comment("c").extra(vec![1, 2, 3]).write(Vec::new(), flate2::Compression::fast());
    enc.write_all(&data).unwrap();
    assert_eq!(gunzip(&enc.finish().unwrap()).unwrap(), data);
    // truncated or corrupted input is rejected
    let gz = gzip(&data);
    assert_eq!(gunzip(&gz[..gz.len() - 4]), None, "truncated trailer");
    assert_eq!(gunzip(&gz[..gz.len() / 2]), None, "truncated stream");
    let mut bad = gz.clone();
    let n = bad.len();
    bad[n - 6] ^= 0xff; // CRC32 byte
    assert_eq!(gunzip(&bad), None, "bad CRC");
}
