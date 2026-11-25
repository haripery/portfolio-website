#!/usr/bin/env python3
"""Summarise a V8 .cpuprofile (from `node --cpu-prof`) by SELF time.

Every profiler sample is attributed to the function that was executing (self time).
The categories below are this script's grouping rules; the raw top-function list is printed
too so the grouping can be checked. "(idle)" is excluded from the percentages.

Attribution facts this relies on (checked in the profile itself):
 * napi functions are NOT shown as frames by V8's profiler: the time of `engine.bid()` is
   counted in the self time of the JS function that calls it, the 'end' handler in server.js.
 * time inside a syscall is attributed to the native function that made it (e.g. `writev`).

usage: profile-summary.py <file.cpuprofile> [oha.json [warmup.json]]
"""
import collections
import json
import pathlib
import sys

SERVER_JS = pathlib.Path(__file__).resolve().parent.parent / "server-node" / "server.js"
# 1-based line of the function that calls engine.bid(): the `req.on('end', () => {` line
END_HANDLER_LINE = next(i for i, l in enumerate(SERVER_JS.read_text().splitlines(), 1) if "req.on('end'" in l)


def category(cf):
    fn, url = cf["functionName"], cf["url"]
    if fn == "(idle)":
        return "(idle)"
    if fn == "(garbage collector)":
        return "V8 garbage collector"
    if fn == "(program)":
        return "(program): native code outside any JS function (libuv/epoll, C++ stream + llhttp parsing, V8 runtime)"
    if fn in ("(root)",):
        return "(root)"
    if url == "":
        if fn in ("writev", "writeUtf8String", "writeLatin1String", "writeBuffer", "writeAsciiString", "writeUcs2String"):
            return "socket write: native writev (on loopback includes the kernel TCP send path)"
        if fn == "utf8Slice":
            return "request body Buffer -> JS string (native utf8Slice)"
        return "other native functions called from JS"
    if "server-node/server.js" in url:
        if cf["lineNumber"] + 1 == END_HANDLER_LINE:
            return "server.js 'end' handler, INCLUDING the napi engine.bid() call (engine + string copies)"
        return "server.js, other functions (JS)"
    if url.startswith("node:_http") or url.startswith("node:http"):
        return "Node HTTP layer (JS: node:_http_server/_common/_incoming/_outgoing)"
    if url.startswith("node:net") or "streams" in url or url.startswith("node:stream"):
        return "Node net + streams (JS)"
    if url.startswith("node:events") or "event_target" in url:
        return "EventEmitter (JS)"
    if url.startswith("node:buffer") or "buffer" in url:
        return "Buffer (JS)"
    if url.startswith("node:"):
        return "other Node internals (JS)"
    return "other JS"


def main():
    prof = json.load(open(sys.argv[1]))
    nodes = {n["id"]: n for n in prof["nodes"]}
    counts = collections.Counter(prof["samples"])
    deltas = prof["timeDeltas"]
    # weight each sample by the time until the next sample (the interval it represents)
    weight = collections.Counter()
    for i, nid in enumerate(prof["samples"]):
        dt = deltas[i + 1] if i + 1 < len(deltas) else 0
        weight[nid] += dt
    total_us = sum(weight.values())
    by_cat = collections.Counter()
    by_fn = collections.Counter()
    for nid, w in weight.items():
        cf = nodes[nid]["callFrame"]
        by_cat[category(cf)] += w
        key = f"{cf['functionName'] or '(anonymous)'}  {cf['url'].split('/')[-1] if cf['url'] else '[native]'}:{cf['lineNumber'] + 1}"
        by_fn[key] += w
    idle = by_cat.pop("(idle)", 0)
    by_cat.pop("(root)", None)
    busy = total_us - idle
    duration = (prof["endTime"] - prof["startTime"]) / 1e6
    print(f"profile: {sys.argv[1].split('/')[-1]}  samples={len(prof['samples'])}  wall={duration:.1f}s  "
          f"busy={busy / 1e6:.1f}s  idle={idle / 1e6:.1f}s  (main thread; sampling interval ~{total_us / max(1, len(prof['samples'])):.0f} us)")
    requests = 0
    if len(sys.argv) > 2:
        oha = json.load(open(sys.argv[2]))
        print(f"throughput during the profiled measured run (profiler overhead included, NOT comparable with the benchmark): "
              f"{oha['summary']['requestsPerSec']:.0f} req/s")
        for f in sys.argv[2:4]:
            requests += sum(json.load(open(f)).get("statusCodeDistribution", {}).values())
        print(f"requests served while profiling (warm-up + measured run): {requests:,}")
    print("\nSELF time by category: % of non-idle main-thread time" + (", and main-thread us per request" if requests else "") + ":")
    for cat, w in by_cat.most_common():
        per_req = f"  {w / requests:6.2f} us/req" if requests else ""
        print(f"  {100 * w / busy:5.1f}%{per_req}  {cat}")
    if requests:
        print(f"  -----\n  100.0%  {busy / requests:6.2f} us/req  total non-idle main-thread time")
    print("\nTop 25 functions by SELF time, % of non-idle main-thread time:")
    for key, w in by_fn.most_common(27):
        if key.startswith("(idle)") or key.startswith("(root)"):
            continue
        print(f"  {100 * w / busy:5.1f}%  {key}")


if __name__ == "__main__":
    main()
