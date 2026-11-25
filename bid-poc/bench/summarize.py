#!/usr/bin/env python3
"""Builds the Markdown result tables from the raw files in bench/results/.

Nothing is typed in by hand: every number below is read from
  results/http/<group>/<config>/c<N>/rep<K>/oha.json               (oha raw output)
  results/http/<group>/<config>/c<N>/rep<K>/server-usage.csv.summary.json   (sample.py)
  results/http/<group>/<config>/c<N>/rep<K>/client-usage.csv.summary.json   (sample.py)
  results/micro/criterion-estimates/**/estimates.json              (criterion raw output)
  results/micro/napi-bench.json                                    (bench/napi-bench.js)

usage: summarize.py [--readme README.md]   (writes results/summary.md and results/http/all-runs.md;
                                            with --readme, replaces the generated block in README.md)
"""
import argparse
import json
import pathlib
import statistics

HERE = pathlib.Path(__file__).resolve().parent
RES = HERE / "results"
HTTP = RES / "http"
MICRO = RES / "micro"


def set_results_dir(path):
    global RES, HTTP, MICRO
    RES = pathlib.Path(path).resolve()
    HTTP = RES / "http"
    MICRO = RES / "micro"

LABEL = {
    "node-single": "A: Node single process + napi",
    "node-cluster": "A: Node cluster + napi",
    "rust": "B: Rust axum (default tokio)",
    "rust-1worker": "B': Rust axum, 1 tokio worker",
    "node-stub": "A-stub: Node, no napi call",
    "rust-stub": "B-stub: Rust, no engine call",
}


def load_run(d):
    oha = json.loads((d / "oha.json").read_text())
    srv = json.loads((d / "server-usage.csv.summary.json").read_text())
    cli = json.loads((d / "client-usage.csv.summary.json").read_text())
    lp = oha["latencyPercentiles"]
    status = oha.get("statusCodeDistribution", {})
    errors = oha.get("errorDistribution", {})
    return {
        "rep": d.name,
        "rps": oha["summary"]["requestsPerSec"],
        "total_s": oha["summary"]["total"],
        "p50": lp["p50"] * 1e3,
        "p90": lp["p90"] * 1e3,
        "p99": lp["p99"] * 1e3,
        "p999": lp["p99.9"] * 1e3,
        "max": oha["summary"]["slowest"] * 1e3,
        "responses": sum(status.values()),
        "non200": sum(v for k, v in status.items() if k != "200"),
        "errors": sum(errors.values()),
        "error_kinds": errors,
        "srv_cpu": srv["cpu_pct_avg"],
        "srv_rss_mb": srv["rss_kb_max"] / 1024,
        "srv_pss_mb": srv["pss_kb_max"] / 1024,
        "srv_rss_avg_mb": srv["rss_kb_avg"] / 1024,
        "srv_threads": srv["threads_max"],
        "srv_procs": srv["processes_max"],
        "steal": srv.get("steal_pct_whole_window"),
        "busy": srv.get("busy_pct_whole_window", {}),
        "cli_cpu": cli["cpu_pct_avg"],
    }


def cells():
    """{(group, cfg, conc): [run, ...]}"""
    out = {}
    for rep_dir in sorted(HTTP.glob("*/*/c*/rep*")):
        if not (rep_dir / "oha.json").exists():
            continue
        group, cfg, conc = rep_dir.parts[-4], rep_dir.parts[-3], int(rep_dir.parts[-2][1:])
        out.setdefault((group, cfg, conc), []).append(load_run(rep_dir))
    return out


med = statistics.median


def fmt_rps(runs):
    v = [r["rps"] for r in runs]
    if len(v) == 1:
        return f"{v[0]:,.0f}"
    return f"{med(v):,.0f} ({min(v):,.0f}–{max(v):,.0f})"


def fmt_ms(runs, key):
    v = [r[key] for r in runs]
    if len(v) == 1:
        return f"{v[0]:.3f}"
    return f"{med(v):.3f}"


def fmt_ms_range(runs, key):
    v = [r[key] for r in runs]
    if len(v) == 1:
        return f"{v[0]:.3f}"
    return f"{med(v):.3f} ({min(v):.3f}–{max(v):.3f})"


def err_cell(runs):
    e = sum(r["errors"] for r in runs)
    n = sum(r["non200"] for r in runs)
    total = sum(r["responses"] + r["errors"] for r in runs)
    return f"{e} / {n} of {total:,}"


def http_table(c, group, cfgs, levels):
    lines = [
        "| conc | server | req/s median (min–max) | p50 ms | p90 ms | p99 ms (min–max) | p99.9 ms | errors / non-200 of requests (all reps) |",
        "|---:|---|---:|---:|---:|---:|---:|---:|",
    ]
    for conc in levels:
        for cfg in cfgs:
            runs = c.get((group, cfg, conc))
            if not runs:
                lines.append(f"| {conc} | {LABEL[cfg]} | missing | | | | | |")
                continue
            lines.append(
                f"| {conc} | {LABEL[cfg]} | {fmt_rps(runs)} | {fmt_ms(runs, 'p50')} | {fmt_ms(runs, 'p90')} | "
                f"{fmt_ms_range(runs, 'p99')} | {fmt_ms(runs, 'p999')} | {err_cell(runs)} |"
            )
    return "\n".join(lines)


def ratio_table(c, group, a, b, levels):
    lines = [
        f"| conc | req/s B ÷ A | p50 A ÷ B | p99 A ÷ B | p99.9 A ÷ B |",
        "|---:|---:|---:|---:|---:|",
    ]
    for conc in levels:
        ra, rb = c.get((group, a, conc)), c.get((group, b, conc))
        if not ra or not rb:
            continue
        m = lambda runs, k: med([r[k] for r in runs])
        lines.append(
            f"| {conc} | {m(rb, 'rps') / m(ra, 'rps'):.2f}× | {m(ra, 'p50') / m(rb, 'p50'):.2f}× | "
            f"{m(ra, 'p99') / m(rb, 'p99'):.2f}× | {m(ra, 'p999') / m(rb, 'p999'):.2f}× |"
        )
    return "\n".join(lines)


def usage_table(c, rows, conc=100):
    lines = [
        f"| round | server | server CPU avg % (100 = 1 core; max 200) | peak RSS MB (sum over processes) | peak PSS MB | processes / threads | oha CPU avg % (max 200) | VM steal % |",
        "|---|---|---:|---:|---:|---:|---:|---:|",
    ]
    for group, cfg in rows:
        runs = c.get((group, cfg, conc))
        if not runs:
            continue
        m = lambda k: med([r[k] for r in runs])
        rng = lambda k, f: f"{f(m(k))} ({f(min(r[k] for r in runs))}–{f(max(r[k] for r in runs))})" if len(runs) > 1 else f(m(k))
        steal = [r["steal"] for r in runs if r["steal"] is not None]
        steal_str = f"{max(steal):.2f} (max)" if steal else "-"
        lines.append(
            f"| {group} | {LABEL[cfg]} | {rng('srv_cpu', lambda x: f'{x:.0f}')} | {rng('srv_rss_mb', lambda x: f'{x:.1f}')} | "
            f"{rng('srv_pss_mb', lambda x: f'{x:.1f}')} | {max(r['srv_procs'] for r in runs)} / {max(r['srv_threads'] for r in runs)} | "
            f"{rng('cli_cpu', lambda x: f'{x:.0f}')} | {steal_str} |"
        )
    return "\n".join(lines)


def all_runs_table(c):
    lines = [
        "| group | config | conc | rep | req/s | p50 ms | p90 ms | p99 ms | p99.9 ms | max ms | responses | non-200 | errors | server CPU % | server peak RSS MB | server peak PSS MB | oha CPU % | steal % | busy % cpu0/cpu1/cpu2/cpu3 |",
        "|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|",
    ]
    for (group, cfg, conc), runs in sorted(c.items(), key=lambda kv: (kv[0][0], kv[0][1], kv[0][2])):
        for r in runs:
            busy = "/".join(f"{r['busy'].get(f'cpu{i}', 0):.0f}" for i in range(4))
            lines.append(
                f"| {group} | {cfg} | {conc} | {r['rep']} | {r['rps']:,.0f} | {r['p50']:.3f} | {r['p90']:.3f} | {r['p99']:.3f} | "
                f"{r['p999']:.3f} | {r['max']:.3f} | {r['responses']:,} | {r['non200']} | {r['errors']}"
                f"{(' ' + json.dumps(r['error_kinds'])) if r['errors'] else ''} | {r['srv_cpu']:.0f} | {r['srv_rss_mb']:.1f} | "
                f"{r['srv_pss_mb']:.1f} | {r['cli_cpu']:.0f} | {r['steal'] if r['steal'] is not None else '-'} | {busy} |"
            )
    return "\n".join(lines)


def micro_tables():
    out = []
    est_dir = MICRO / "criterion-estimates"
    if est_dir.exists():
        out.append("**Rust, criterion** (`cargo bench -p engine-core --bench engine`), point estimate [95% CI], ns per call:\n")
        out.append("| benchmark | mean | median |")
        out.append("|---|---:|---:|")
        for f in sorted(est_dir.glob("**/estimates.json")):
            e = json.loads(f.read_text())
            name = str(f.parent.relative_to(est_dir))
            mean, median = e["mean"], e["median"]
            ci = lambda x: f"{x['point_estimate']:.1f} [{x['confidence_interval']['lower_bound']:.1f}, {x['confidence_interval']['upper_bound']:.1f}]"
            out.append(f"| `{name}` | {ci(mean)} | {ci(median)} |")
        out.append("")
    nb = MICRO / "napi-bench.json"
    if nb.exists():
        d = json.loads(nb.read_text())
        out.append(
            f"**Node → napi** (`node bench/napi-bench.js`, {d['node']}, {d['results'][0]['samples']} samples, "
            f"ns per call, statistics over samples):\n"
        )
        out.append("| benchmark | what it does | calls/sample | median | mean | p05 | p95 | stdev |")
        out.append("|---|---|---:|---:|---:|---:|---:|---:|")
        for r in d["results"]:
            s = r["ns_per_call"]
            out.append(
                f"| `{r['name']}` | {r['description']} | {r['calls_per_sample']:,} | {s['median']:.1f} | {s['mean']:.1f} | "
                f"{s['p05']:.1f} | {s['p95']:.1f} | {s['stdev']:.1f} |"
            )
        out.append("")
        # derived numbers (simple differences of measured medians)
        direct = est_dir / "bid_json" / "direct" / "estimates.json"
        if direct.exists():
            rd = json.loads(direct.read_text())["median"]["point_estimate"]
            res = {r["name"]: r["ns_per_call"]["median"] for r in d["results"]}
            out.append("Derived from the two tables above (differences of measured medians, different harnesses):\n")
            out.append(f"- napi `bid()` − Rust `bid_json/direct` = {res['bid(payload)']:.1f} − {rd:.1f} = "
                       f"**{res['bid(payload)'] - rd:.1f} ns** per call attributable to crossing the JS↔Rust boundary.")
            out.append(f"- `probeEcho` (boundary only, measured directly) = **{res['probeEcho(payload)']:.1f} ns**; "
                       f"of which `probeNoop` (bare call) = {res['probeNoop()']:.1f} ns, string in (`probeTakeString` − `probeNoop`) = "
                       f"{res['probeTakeString(payload)'] - res['probeNoop()']:.1f} ns, string out (`probeEcho` − `probeTakeString`) = "
                       f"{res['probeEcho(payload)'] - res['probeTakeString(payload)']:.1f} ns.")
            out.append("")
    return "\n".join(out)


def run_params():
    """Settings recorded by run-http.sh in the first line of results/http/run.log."""
    import re
    params = {}
    log = HTTP / "run.log"
    if log.exists():
        for line in log.read_text().splitlines():
            if "=== run-http.sh:" in line:
                params = dict(re.findall(r"(\w+)=('[^']*'|\S+)", line))
                break
    return {k: v.strip("'") for k, v in params.items()}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--readme")
    ap.add_argument("--results", help="results directory (default: bench/results)")
    args = ap.parse_args()
    if args.results:
        set_results_dir(args.results)
    c = cells()
    levels = sorted({k[2] for k in c})
    reps = max((len(v) for v in c.values()), default=0)
    parts = []
    rp = run_params()
    parts.append(f"_Generated by `bench/summarize.py` from the raw files in `bench/results/`. "
                 f"HTTP numbers are the median of {reps} independent runs per cell (each: fresh server, "
                 f"{rp.get('WARMUP', '?')} warm-up, {rp.get('DURATION', '?')} measured; server pinned to CPUs {rp.get('SERVER_CPUS', '?')}, "
                 f"oha pinned to CPUs {rp.get('CLIENT_CPUS', '?')} with {rp.get('CLIENT_THREADS', '?')} worker threads); "
                 f"ranges are min–max over those runs. Latency = oha's per-request latency, in milliseconds._\n")
    parts.append("### Benchmark 1: the bridge alone (micro-benchmark)\n")
    parts.append(micro_tables())
    parts.append("### Benchmark 2, round 1: Node single process (A) vs Rust default tokio runtime (B)\n")
    parts.append(http_table(c, "round1", ["node-single", "rust"], levels))
    parts.append("\nRatios (medians):\n")
    parts.append(ratio_table(c, "round1", "node-single", "rust", levels))
    parts.append("\n### Benchmark 2, round 2: Node cluster, one worker per available CPU (A) vs Rust default tokio runtime (B)\n")
    parts.append(http_table(c, "round2", ["node-cluster", "rust"], levels))
    parts.append("\nRatios (medians):\n")
    parts.append(ratio_table(c, "round2", "node-cluster", "rust", levels))
    parts.append("\n### Benchmark 3: CPU and memory of each server during the concurrency-100 runs\n")
    parts.append(usage_table(c, [("round1", "node-single"), ("round1", "rust"), ("round2", "node-cluster"),
                                 ("round2", "rust"), ("supplementary", "rust-1worker")]))
    parts.append("\n### Supplementary runs (not part of the requested comparison)\n")
    parts.append("Rust limited to one tokio worker thread (`TOKIO_WORKER_THREADS=1`), run interleaved with round 1, "
                 "for a one-event-loop vs one-event-loop comparison with A (single process):\n")
    parts.append(http_table(c, "supplementary", ["rust-1worker"], levels))
    stub_levels = sorted({k[2] for k in c if k[1].endswith("-stub")})
    if stub_levels:
        parts.append("\nStub servers: identical HTTP handling (body read and decoded), but no engine/napi call; they send the "
                     "precomputed response bytes for the benchmark payload. Compare with the real servers in round 1:\n")
        parts.append(http_table(c, "supplementary", ["node-stub", "rust-stub"], stub_levels))
        parts.append("\n" + usage_table(c, [("supplementary", "node-stub"), ("supplementary", "rust-stub")], conc=100))
    summary = "\n".join(parts) + "\n"
    (RES / "summary.md").write_text(summary)
    (HTTP / "all-runs.md").write_text(
        "# Every measured HTTP run\n\n_Generated by `bench/summarize.py` from `bench/results/http/**/rep*/`._\n\n"
        + all_runs_table(c) + "\n"
    )
    print(summary)
    if args.readme:
        p = pathlib.Path(args.readme)
        text = p.read_text()
        begin, end = "<!-- BEGIN GENERATED RESULTS -->", "<!-- END GENERATED RESULTS -->"
        i, j = text.index(begin) + len(begin), text.index(end)
        p.write_text(text[:i] + "\n" + summary + text[j:])


if __name__ == "__main__":
    main()
