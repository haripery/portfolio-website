//! Architecture B: axum + tokio, POST /bid, engine-core called directly (no FFI).
//!
//! Env: PORT (default 3002), STUB=1 (diagnostic only: skip the engine and return a
//! precomputed response, see README "supplementary runs"), PAYLOAD (stub input file).
//! No logging on the request path; one line is printed to stderr at startup.
use axum::{
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    routing::post,
    serve::ListenerExt,
    Router,
};
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

    // Build the advertiser list before accepting traffic.
    let advertisers = engine_core::engine().advertisers().len();

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
    };

    // Node's http.createServer() disables Nagle by default (noDelay: true); do the same here.
    let listener = tokio::net::TcpListener::bind(("127.0.0.1", port))
        .await
        .expect("bind")
        .tap_io(|tcp| {
            let _ = tcp.set_nodelay(true);
        });

    eprintln!(
        "[server-rust] READY pid={} url=http://127.0.0.1:{port}/bid advertisers={advertisers} \
         tokio_workers={} available_parallelism={} stub={stub}",
        std::process::id(),
        tokio::runtime::Handle::current().metrics().num_workers(),
        std::thread::available_parallelism().map(|n| n.get()).unwrap_or(0),
    );
    axum::serve(listener, app).await.expect("server error");
}
