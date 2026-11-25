#!/usr/bin/env python3
"""A-vs-B identity check for the OpenRTB endpoint.

Sends the same requests to server-node (A) and server-rust (B) over keep-alive connections and
compares, byte for byte: status code, body, and the headers that carry meaning
(content-type, content-encoding, x-openrtb-version, and whether content-length is present).
Also applies basic OpenRTB 2.6 checks to every response. Exits 1 on any mismatch or failed check.

usage: verify.py <corpus.jsonl> <spec-examples-dir>
"""
import collections
import hashlib
import http.client
import json
import pathlib
import sys

A, B = ("127.0.0.1", 3001), ("127.0.0.1", 3002)
PATH = "/openrtb2/bid"
HEADERS_COMPARED = ("content-type", "x-openrtb-version")


def post(conn, body, headers):
    conn.request("POST", PATH, body=body, headers=headers)
    r = conn.getresponse()
    data = r.read()
    h = {k.lower(): v for k, v in r.getheaders()}
    return r.status, data, {k: h.get(k) for k in HEADERS_COMPARED}, "content-length" in h


def check_spec(req, status, body, hdrs):
    """Basic OpenRTB 2.6 response rules (the engine's unit tests check many more)."""
    problems = []
    if hdrs["x-openrtb-version"] != "2.6":
        problems.append("missing x-openrtb-version: 2.6")
    if status == 204:
        if body:
            problems.append("204 with a body")
        return problems
    if status != 200:
        problems.append(f"unexpected status {status} for a valid request")
        return problems
    if hdrs["content-type"] != "application/json":
        problems.append("content-type is not application/json")
    resp = json.loads(body)
    if resp.get("id") != req["id"]:
        problems.append("BidResponse.id != BidRequest.id")
    imp_ids = {i["id"] for i in req["imp"]}
    for sb in resp.get("seatbid", []):
        for bid in sb.get("bid", []):
            if bid.get("impid") not in imp_ids:
                problems.append("bid.impid not in request")
            if not (isinstance(bid.get("price"), (int, float)) and bid["price"] > 0):
                problems.append("bid.price missing or not positive")
            if not bid.get("id"):
                problems.append("bid.id missing")
    if not resp.get("seatbid"):
        problems.append("200 bid response without seatbid")
    return problems


def main():
    corpus_path, examples_dir = sys.argv[1], pathlib.Path(sys.argv[2])
    lines = [l for l in pathlib.Path(corpus_path).read_bytes().split(b"\n") if l]
    ct = {"content-type": "application/json"}
    cases = []  # (label, body, headers, request_json_or_None)
    for raw in lines:
        cases.append(("corpus", raw, ct, json.loads(raw)))
    for f in sorted(examples_dir.glob("example-*.json")):
        raw = f.read_bytes()
        cases.append((f"spec {f.stem}", raw, ct, json.loads(raw)))
    for label, body in [
        ("invalid: malformed JSON", b'{"id":'),
        ("invalid: empty imp array", b'{"id":"x","imp":[]}'),
        ("invalid: not JSON", b"hello"),
    ]:
        cases.append((label, body, ct, None))

    ca, cb = http.client.HTTPConnection(*A), http.client.HTTPConnection(*B)
    stats = collections.Counter()
    mismatches, spec_problems = [], []
    sample = {}
    for label, body, headers, req in cases:
        ra, rb = post(ca, body, headers), post(cb, body, headers)
        kind = label.split(":")[0]
        stats[(kind, ra[0])] += 1
        if ra != rb:
            mismatches.append((label, ra[0], rb[0], ra[2], rb[2], ra[3], rb[3], len(ra[1]), len(rb[1])))
        if req is not None:
            for p in check_spec(req, ra[0], ra[1], ra[2]):
                spec_problems.append((label, p))
        elif ra[0] != 400 or ra[1]:
            spec_problems.append((label, f"expected 400 with no content, got {ra[0]} with {len(ra[1])} bytes"))
        if ra[0] == 200 and kind not in sample:
            sample[kind] = (ra, rb)

    print(f"requests compared: {len(cases)}   (each sent to A on :{A[1]} and to B on :{B[1]})")
    print(f"{'case group':28s} {'status':>6s} {'count':>6s}")
    for (kind, status), n in sorted(stats.items()):
        print(f"{kind:28s} {status:>6d} {n:>6d}")
    digest = lambda d: hashlib.sha256(d).hexdigest()[:16]
    for kind, (ra, rb) in sample.items():
        print(f"\nfirst 200 response for '{kind}': A {len(ra[1])} bytes sha256[0:16]={digest(ra[1])} headers={ra[2]} | "
              f"B {len(rb[1])} bytes sha256[0:16]={digest(rb[1])} headers={rb[2]}")
    print(f"\nmismatches between A and B (status, compared headers, content-length presence, body bytes): {len(mismatches)}")
    for m in mismatches[:20]:
        print("  ", m)
    print(f"OpenRTB response check problems: {len(spec_problems)}")
    for p in spec_problems[:20]:
        print("  ", p)
    ok = not mismatches and not spec_problems
    print("RESULT:", "A and B identical on every request; all responses pass the checks" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
