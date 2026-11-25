# Larger OpenRTB version (superseded, kept for transparency)

Raw outputs of the first, larger OpenRTB 2.6 POC: banner **and video** (VAST), gzip request/response, privacy
gating, `nbr` reason codes, floor currencies, 10,000 requests of about 2.4 KB. The code is commit `e80791b`.

The user then asked for a smaller POC: image (banner) ads only, a smaller example, not the whole spec. These
results are therefore **not** the README's Part 2 tables, which come from the smaller image-only POC. They are kept
because they are measured data, and because two findings from them are cited in the README with this folder as
the source:

- `diagnostics/gzip-alloc.txt` (script `bench/openrtb/gzip-alloc-diagnostic.sh` in commit `e80791b`): allocating gzip state per request cost the multi-threaded Rust server 31.30
  minor page faults and 155.4 µs of CPU per request (12,844 req/s). Reusing that state per thread gave 0.00
  faults, 58.4 µs and 34,197 req/s.
- `summary.md`: the generated tables of the whole run (closed loop, open loop, cold start, gzip, engine weight,
  memory at 200,000 line items).
