//! Architecture B: axum + tokio, POST /bid, engine-core called directly (no FFI).
//!
//! Env: PORT (default 3002), STUB=1 (diagnostic only: skip the engine and return a
//! precomputed response, see README "supplementary runs"), PAYLOAD (stub input file).
//! No logging on the request path; one line is printed to stderr at startup.
use axum::{
    body::Bytes,
    http::{header, HeaderName, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::post,
    serve::ListenerExt,
    Router,
};
use engine_core::openrtb::{self, Outcome};
use std::sync::OnceLock;

/// Main handler: `String` extractor = read the whole body + check it is UTF-8 (like
/// server-node's Buffer -> string), then one direct call into engine-core.
async fn bid(body: String) -> Response {
    match engine_core::engine().bid_json(&body) {
        Ok(Some(json)) => ([(header::CONTENT_TYPE, "application/json")], json).into_response(),
        Ok(None) => StatusCode::NO_CONTENT.into_response(),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            [(header::CONTENT_TYPE, "application/json")],
            e.to_json_body(),
        )
            .into_response(),
    }
}

const X_OPENRTB: HeaderName = HeaderName::from_static("x-openrtb-version");
const ORTB_VERSION: HeaderValue = HeaderValue::from_static("2.6");

/// OpenRTB 2.6 image bidder (Part 2): the raw body bytes go straight to engine-core.
async fn openrtb_bid(body: Bytes) -> Response {
    match openrtb::engine().handle(&body) {
        Outcome::Body(out) => {
            let mut r = ([(header::CONTENT_TYPE, "application/json")], out).into_response();
            r.headers_mut().insert(X_OPENRTB, ORTB_VERSION);
            r
        }
        Outcome::NoBid => (StatusCode::NO_CONTENT, [(X_OPENRTB, ORTB_VERSION)]).into_response(),
        Outcome::Invalid => (StatusCode::BAD_REQUEST, [(X_OPENRTB, ORTB_VERSION)]).into_response(),
    }
}

static STUB_BODY: OnceLock<String> = OnceLock::new();

/// Diagnostic handler (STUB=1): same body read, no engine call, same response bytes.
async fn bid_stub(body: String) -> Response {
    drop(body);
    let json = STUB_BODY.get().expect("stub body initialised").clone();
    ([(header::CONTENT_TYPE, "application/json")], json).into_response()
}

#[tokio::main]
async fn main() {
    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3002);
    let stub = std::env::var("STUB").as_deref() == Ok("1");

    // Build the advertiser list and the OpenRTB line-item index before accepting traffic.
    let advertisers = engine_core::engine().advertisers().len();
    let line_items = openrtb::engine().line_items().len();

    let app = if stub {
        let path = std::env::var("PAYLOAD").unwrap_or_else(|_| {
            concat!(env!("CARGO_MANIFEST_DIR"), "/../bench/payload.json").to_string()
        });
        let payload = std::fs::read_to_string(&path).expect("read stub payload");
        let body = engine_core::engine()
            .bid_json(&payload)
            .expect("valid payload")
            .expect("payload produces a bid");
        STUB_BODY.set(body).unwrap();
        Router::new().route("/bid", post(bid_stub))
    } else {
        Router::new().route("/bid", post(bid))
    }
    .route("/openrtb2/bid", post(openrtb_bid));

    // Node's http.createServer() disables Nagle by default (noDelay: true); do the same here.
    let listener = tokio::net::TcpListener::bind(("127.0.0.1", port))
        .await
        .expect("bind")
        .tap_io(|tcp| {
            let _ = tcp.set_nodelay(true);
        });

    eprintln!(
        "[server-rust] READY pid={} url=http://127.0.0.1:{port}/bid advertisers={advertisers} \
         ortb_line_items={line_items} tokio_workers={} available_parallelism={} stub={stub}",
        std::process::id(),
        tokio::runtime::Handle::current().metrics().num_workers(),
        std::thread::available_parallelism().map(|n| n.get()).unwrap_or(0),
    );
    axum::serve(listener, app).await.expect("server error");
}
