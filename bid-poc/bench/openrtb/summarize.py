#!/usr/bin/env python3
"""Builds the Part 2 (OpenRTB image bidder) result tables from raw files in bench/results/openrtb/.

Reuses the readers of bench/summarize.py (oha JSON + per-second sampler CSVs, averaged only
inside oha's measured window). Nothing is typed in by hand.

usage: summarize.py [--results DIR] [--readme README.md]
"""
import argparse
import importlib.util
import json
import pathlib
import re
import statistics

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("v1summ", HERE.parent / "summarize.py")
v1 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v1)

LABEL = {"A1": "A: Node single process + napi", "A2": "A: Node cluster (2 workers) + napi", "B": "B: Rust axum (default tokio)"}
CFGS = ["A1", "A2", "B"]


def med(v):
    v = [x for x in v if x is not None]
    return statistics.median(v) if v else None


def rng(v, fmt):
    v = [x for x in v if x is not None]
    if not v:
        return "-"
    if len(v) == 1:
        return fmt.format(v[0])
    return f"{fmt.format(statistics.median(v))} ({fmt.format(min(v))}–{fmt.format(max(v))})"


def load(d):
    r = v1.load_run(d)
    oha = json.loads((d / "oha.json").read_text())
    status = oha.get("statusCodeDistribution", {})
    r["n200"] = status.get("200", 0)
    r["n204"] = status.get("204", 0)
    r["other_status"] = sum(v for k, v in status.items() if k not in ("200", "204"))
    sm = d / "startup-ms.txt"
    r["startup_ms"] = int(sm.read_text()) if sm.exists() else None
    return r


def cells(root):
    out, skipped = {}, []
    for rep in sorted(root.glob("*/*/*/rep*")):
        group, cfg, label = rep.parts[-4], rep.parts[-3], rep.parts[-2]
        try:
            out.setdefault((group, label, cfg), []).append(load(rep))
        except (OSError, ValueError, KeyError) as e:
            skipped.append(f"{rep.relative_to(root)}: {type(e).__name__}: {e}")
    return out, skipped


def params(root):
    log = root / "run.log"
    if not log.exists():
        return {}
    for line in log.read_text().splitlines():
        if "=== run-load.sh" in line:
            return {k: v.strip("'") for k, v in re.findall(r"(\w+)=('[^']*'|\S+)", line)}
    return {}


def seconds(s):
    return float(s[:-1]) if s and s.endswith("s") else None


def micro_section(mroot):
    reps = sorted(mroot.glob("rep*"))
    if not reps:
        return ""
    out = []
    crit = {}
    for d in reps:
        for f in sorted(d.glob("criterion-estimates/**/estimates.json")):
            name = json.loads((f.parent / "benchmark.json").read_text())["full_id"]
            crit.setdefault(name, []).append(json.loads(f.read_text()))
    if crit:
        out.append(f"**Rust, criterion** (`cargo bench -p engine-core --bench openrtb`): engine-core called directly, cycling "
                   f"through the 1,000-request corpus; µs per request, median point estimate, median over {len(reps)} runs (min–max):\n")
        out.append("| benchmark | median µs | mean µs |")
        out.append("|---|---:|---:|")
        for name, es in sorted(crit.items()):
            out.append(f"| `{name}` | {rng([e['median']['point_estimate'] / 1000 for e in es], '{:.2f}')} | "
                       f"{rng([e['mean']['point_estimate'] / 1000 for e in es], '{:.2f}')} |")
        out.append("")
    nbs = [json.loads((d / "napi-bench.json").read_text()) for d in reps if (d / "napi-bench.json").exists()]
    if nbs:
        names = [r["name"] for r in nbs[0]["results"]]
        out.append(f"**Node → napi** (`bench/openrtb/napi-bench.js`, {nbs[0]['node']}, interleaved samples): µs per request, "
                   f"median over {nbs[0]['results'][0]['samples']} samples per run, median over {len(nbs)} runs (min–max):\n")
        out.append("| benchmark | what it measures | median µs | p05 µs | p95 µs |")
        out.append("|---|---|---:|---:|---:|")
        get = lambda nb, n: next(r for r in nb["results"] if r["name"] == n)
        for n in names:
            rs = [get(nb, n) for nb in nbs]
            out.append(f"| `{n}` | {rs[0]['description']} | {rng([r['ns_per_op']['median'] / 1000 for r in rs], '{:.2f}')} | "
                       f"{rng([r['ns_per_op']['p05'] / 1000 for r in rs], '{:.2f}')} | {rng([r['ns_per_op']['p95'] / 1000 for r in rs], '{:.2f}')} |")

        def paired(a, b):
            per = []
            for nb in nbs:
                xa, xb = get(nb, a)["samples_ns_per_op"], get(nb, b)["samples_ns_per_op"]
                per.append(statistics.median([x - y for x, y in zip(xa, xb)]) / 1000)
            return rng(per, "{:.2f}")
        out.append("\nDerived, per round (each sample minus the other benchmark's sample from the same round), median over runs (min–max):\n")
        out.append(f"- `openrtbBid(Buffer)` − `probeOpenrtbEngineLoop` = **{paired('openrtbBid(Buffer)', 'probeOpenrtbEngineLoop')} µs**: "
                   f"what reaching the engine from JS costs per request.")
        out.append("")
    return "\n".join(out)


def closed_table(c, levels):
    lines = ["| conc | server | req/s median (min–max) | p50 ms | p90 ms | p99 ms | p99.9 ms | 204 no-bid share | other status / errors |",
             "|---:|---|---:|---:|---:|---:|---:|---:|---:|"]
    for lv in levels:
        for cfg in CFGS:
            runs = c.get(("closed", f"c{lv}", cfg))
            if not runs:
                continue
            m = lambda k: med([r[k] for r in runs])
            share = sum(r["n204"] for r in runs) / max(1, sum(r["responses"] for r in runs))
            other = sum(r["other_status"] for r in runs)
            errs = sum(r["errors"] for r in runs)
            lines.append(f"| {lv} | {LABEL[cfg]} | {rng([r['rps'] for r in runs], '{:,.0f}')} | {m('p50'):.3f} | {m('p90'):.3f} | "
                         f"{m('p99'):.3f} | {m('p999'):.3f} | {share:.1%} | {other} / {errs} |")
    return "\n".join(lines)


def usage_table(c, rows):
    lines = ["| cell | server | server CPU % (max 200) | CPU µs per request | peak RSS MB | peak PSS MB | processes / threads | oha CPU % |",
             "|---|---|---:|---:|---:|---:|---:|---:|"]
    for group, label in rows:
        for cfg in CFGS:
            runs = c.get((group, label, cfg))
            if not runs:
                continue
            lines.append(f"| {group} {label} | {LABEL[cfg]} | {rng([r['srv_cpu'] for r in runs], '{:.0f}')} | "
                         f"{rng([r['srv_us_per_req'] for r in runs], '{:.1f}')} | {rng([r['srv_rss_mb'] for r in runs], '{:.1f}')} | "
                         f"{rng([r['srv_pss_mb'] for r in runs], '{:.1f}')} | {max(r['srv_procs'] for r in runs)} / {max(r['srv_threads'] for r in runs)} | "
                         f"{rng([r['cli_cpu'] for r in runs], '{:.0f}')} |")
    return "\n".join(lines)


def open_table(c, rates, dur_s, tmax):
    lines = [f"| offered req/s | server | sent (share of offered) | answered within {tmax} (share of offered) | timeouts (> {tmax}) | p50 ms | p99 ms | p99.9 ms | server CPU % |",
             "|---:|---|---:|---:|---:|---:|---:|---:|---:|"]
    for q in rates:
        for cfg in CFGS:
            runs = c.get(("open", f"q{q}", cfg))
            if not runs:
                continue
            offered = q * dur_s
            share = [r["responses"] / offered for r in runs]
            sent = [(r["responses"] + r["errors"]) / offered * 100 for r in runs]
            lines.append(f"| {q:,} | {LABEL[cfg]} | {rng(sent, '{:.2f}%')} | {rng([s * 100 for s in share], '{:.2f}%')} | "
                         f"{rng([r['error_kinds'].get('timeout', 0) for r in runs], '{:,.0f}')} | "
                         f"{rng([r['p50'] for r in runs], '{:.2f}')} | {rng([r['p99'] for r in runs], '{:.2f}')} | "
                         f"{rng([r['p999'] for r in runs], '{:.2f}')} | {rng([r['srv_cpu'] for r in runs], '{:.0f}')} |")
    return "\n".join(lines)


def cold_table(c, rate, tmax):
    lines = [f"| server | answered within {tmax} in the first 10 s (share of offered) | timeouts | p99 ms | time to READY ms |",
             "|---|---:|---:|---:|---:|"]
    for cfg in CFGS:
        runs = c.get(("cold", f"q{rate}", cfg))
        if not runs:
            continue
        lines.append(f"| {LABEL[cfg]} | {rng([r['responses'] / (rate * 10) * 100 for r in runs], '{:.2f}%')} | "
                     f"{rng([r['error_kinds'].get('timeout', 0) for r in runs], '{:,.0f}')} | {rng([r['p99'] for r in runs], '{:.2f}')} | "
                     f"{rng([r['startup_ms'] for r in runs], '{:.0f}')} |")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--results", default=str(HERE.parent / "results" / "openrtb"))
    ap.add_argument("--readme")
    a = ap.parse_args()
    root = pathlib.Path(a.results)
    load_root = root / "load"
    c, skipped = cells(load_root)
    p = params(load_root)
    dur_s = seconds(p.get("DURATION", "30s"))
    tmax = p.get("TMAX", "100ms")
    parts = [f"_Generated by `bench/openrtb/summarize.py` from the raw files in `bench/results/openrtb/`. Each cell: fresh server; "
             f"{p.get('WARMUP', '?')} warm-up (none in the cold-start test), {p.get('DURATION', '?')} measured; server on CPUs {p.get('SERVER_CPUS', '?')}, "
             f"oha on CPUs {p.get('CLIENT_CPUS', '?')}; requests drawn at random from the 1,000-request corpus (corpus sha256 prefix "
             f"`{p.get('corpus_sha256', '?')}`). Medians over repetitions, (min–max) ranges. Latency in ms._\n"]
    parts.append("#### Micro-benchmark: the OpenRTB engine and the JS → Rust boundary\n")
    parts.append(micro_section(root / "micro"))
    levels = sorted({int(k[1][1:]) for k in c if k[0] == "closed"})
    parts.append("#### Closed loop (as in v1): throughput and latency\n")
    parts.append(closed_table(c, levels))
    parts.append("\nCPU and memory during those runs (CPU µs per request = server CPU time ÷ responses, derived):\n")
    parts.append(usage_table(c, [("closed", f"c{lv}") for lv in levels]))
    rates = sorted({int(k[1][1:]) for k in c if k[0] == "open"})
    if rates:
        parts.append(f"\n#### Open loop at fixed offered rates, per-request timeout {tmax} (the exchange's tmax): what an exchange would see\n")
        parts.append(f"oha sends at the offered rate on {p.get('OPEN_CONNS', '?')} connections with coordinated-omission correction "
                     f"(`--latency-correction`); a response later than {tmax} is a timeout, which an exchange treats as no bid. "
                     f"Latency percentiles are over the answered requests.\n")
        parts.append(open_table(c, rates, dur_s, tmax))
    cold = [k for k in c if k[0] == "cold"]
    if cold:
        rate = int(cold[0][1][1:])
        parts.append(f"\n#### Cold start: a freshly started server, no warm-up, {rate:,} req/s offered for 10 s\n")
        parts.append(cold_table(c, rate, tmax))
    mem = [k for k in c if k[0] == "memory"]
    if mem:
        label = mem[0][1]
        parts.append(f"\n#### Memory at scale: {int(label[5:]):,} line items, c=100\n")
        parts.append(usage_table(c, [("memory", label)]))
        lines = ["", "| server | time from process start to READY, ms | req/s |", "|---|---:|---:|"]
        for cfg in CFGS:
            runs = c.get(("memory", label, cfg))
            if runs:
                lines.append(f"| {LABEL[cfg]} | {rng([r['startup_ms'] for r in runs], '{:.0f}')} | {rng([r['rps'] for r in runs], '{:,.0f}')} |")
        parts.append("\n".join(lines))
    if skipped:
        parts.append("\n**Incomplete runs skipped:**\n\n" + "\n".join(f"- `{s}`" for s in skipped))
    summary = "\n".join(parts) + "\n"
    (root / "summary.md").write_text(summary)
    print(summary)
    if a.readme:
        rp = pathlib.Path(a.readme)
        t = rp.read_text()
        b, e = "<!-- BEGIN OPENRTB RESULTS -->", "<!-- END OPENRTB RESULTS -->"
        i, j = t.index(b) + len(b), t.index(e)
        rp.write_text(t[:i] + "\n" + summary + t[j:])


if __name__ == "__main__":
    main()
