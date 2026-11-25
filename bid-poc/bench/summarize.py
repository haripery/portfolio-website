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


def window_stats(csv_path, end_s):
    """Aggregate the per-second sampler rows that fall inside oha's measured window.

    The samplers start right after oha's measured run starts and are stopped only when oha exits,
    which is ~1 s after its last request because oha then computes its statistics. Rows ending
    after end_s (+0.25 s tolerance for the sampler's start offset) are excluded, so that idle
    tail does not dilute the averages. Each row covers the interval since the previous row.
    """
    rows = []
    with open(csv_path) as f:
        header = f.readline().strip().split(",")
        for line in f:
            vals = line.strip().split(",")
            if len(vals) == len(header):
                rows.append(dict(zip(header, (float(v) for v in vals))))
    prev, inside = 0.0, []
    for r in rows:
        r["dt"] = r["elapsed_s"] - prev
        prev = r["elapsed_s"]
        if r["elapsed_s"] <= end_s + 0.25:
            inside.append(r)
    if not inside:
        return None
    wsum = sum(r["dt"] for r in inside)
    wavg = lambda k: sum(r[k] * r["dt"] for r in inside) / wsum
    out = {
        "cpu_pct_avg": wavg("cpu_pct"),
        "rss_kb_max": max(r["rss_kb"] for r in inside),
        "pss_kb_max": max(r["pss_kb"] for r in inside),
        "threads_max": max(r["threads"] for r in inside),
        "processes_max": max(r["processes"] for r in inside),
        "rows": len(inside),
        "rows_excluded": len(rows) - len(inside),
    }
    if "steal_pct" in header:
        out["steal_pct"] = wavg("steal_pct")
        out["busy"] = {k[:-9]: wavg(k) for k in header if k.endswith("_busy_pct")}
    return out


def load_run(d):
    oha = json.loads((d / "oha.json").read_text())
    total = oha["summary"]["total"]
    srv = window_stats(d / "server-usage.csv", total)
    cli = window_stats(d / "client-usage.csv", total)
    if srv is None or cli is None:
        raise ValueError("sampler has no rows inside the measured window")
    lp = oha["latencyPercentiles"]
    status = oha.get("statusCodeDistribution", {})
    errors = oha.get("errorDistribution", {})
    responses = sum(status.values())
    return {
        "rep": d.name,
        "rps": oha["summary"]["requestsPerSec"],
        "total_s": total,
        "p50": lp["p50"] * 1e3,
        "p90": lp["p90"] * 1e3,
        "p99": lp["p99"] * 1e3,
        "p999": lp["p99.9"] * 1e3,
        "max": oha["summary"]["slowest"] * 1e3,
        "responses": responses,
        "non200": sum(v for k, v in status.items() if k != "200"),
        "errors": sum(errors.values()),
        "error_kinds": errors,
        "srv_cpu": srv["cpu_pct_avg"],
        "srv_rss_mb": srv["rss_kb_max"] / 1024,
        "srv_pss_mb": srv["pss_kb_max"] / 1024,
        "srv_threads": srv["threads_max"],
        "srv_procs": srv["processes_max"],
        "steal": srv.get("steal_pct"),
        "busy": srv.get("busy", {}),
        "cli_cpu": cli["cpu_pct_avg"],
        # derived: server CPU time per completed request = avg CPU (cores) x measured duration / responses
        "srv_us_per_req": srv["cpu_pct_avg"] / 100 * total / max(1, responses) * 1e6,
    }


SKIPPED = []  # incomplete runs (e.g. still in progress); listed in the output, never dropped silently


def cells():
    """{(group, cfg, conc): [run, ...]}"""
    import sys
    out = {}
    for rep_dir in sorted(HTTP.glob("*/*/c*/rep*")):
        group, cfg, conc = rep_dir.parts[-4], rep_dir.parts[-3], int(rep_dir.parts[-2][1:])
        try:
            run = load_run(rep_dir)
        except (OSError, ValueError, KeyError) as e:
            SKIPPED.append(f"{rep_dir.relative_to(HTTP)}: {type(e).__name__}: {e}")
            print(f"WARNING: skipping incomplete run {rep_dir}: {e}", file=sys.stderr)
            continue
        out.setdefault((group, cfg, conc), []).append(run)
    return out


def med(values):
    """median of the non-None values (None = sampler had no complete interval)"""
    v = [x for x in values if x is not None]
    return statistics.median(v) if v else float("nan")


def num(x, fmt="{:.0f}"):
    return "-" if x is None else fmt.format(x)


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
        vals = lambda k: [r[k] for r in runs if r[k] is not None]
        rng = lambda k, f: (f"{f(m(k))} ({f(min(vals(k)))}–{f(max(vals(k)))})" if len(vals(k)) > 1 else (f(m(k)) if vals(k) else "-"))
        steal = [r["steal"] for r in runs if r["steal"] is not None]
        steal_str = f"{max(steal):.2f} (max)" if steal else "-"
        lines.append(
            f"| {group} | {LABEL[cfg]} | {rng('srv_cpu', lambda x: f'{x:.0f}')} | {rng('srv_rss_mb', lambda x: f'{x:.1f}')} | "
            f"{rng('srv_pss_mb', lambda x: f'{x:.1f}')} | {max(r['srv_procs'] for r in runs)} / {max(r['srv_threads'] for r in runs)} | "
            f"{rng('cli_cpu', lambda x: f'{x:.0f}')} | {steal_str} |"
        )
    return "\n".join(lines)


def cpu_per_req_table(c, rows, levels):
    head = " | ".join(f"c={l}" for l in levels)
    lines = [f"| round | server | {head} |", "|---|---|" + "---:|" * len(levels)]
    for group, cfg in rows:
        cellv = []
        for l in levels:
            runs = c.get((group, cfg, l))
            cellv.append(f"{med([r['srv_us_per_req'] for r in runs]):.1f}" if runs else "")
        lines.append(f"| {group} | {LABEL[cfg]} | " + " | ".join(cellv) + " |")
    return "\n".join(lines)


def text_block(path, title, keep=None):
    if not path.exists():
        return ""
    lines = path.read_text().splitlines()
    if keep:
        lines = [l for l in lines if keep(l)]
    return f"{title}\n\n```text\n" + "\n".join(lines) + "\n```\n"


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
                f"{(' ' + json.dumps(r['error_kinds'])) if r['errors'] else ''} | {num(r['srv_cpu'])} | {r['srv_rss_mb']:.1f} | "
                f"{r['srv_pss_mb']:.1f} | {num(r['cli_cpu'])} | {num(r['steal'], '{:.2f}')} | {busy} |"
            )
    return "\n".join(lines)


def micro_reps():
    """[(rep_name, {criterion_name: estimates}, napi_bench_json_or_None)] for results/micro/rep*/ (or the flat layout)."""
    dirs = sorted(MICRO.glob("rep*")) or ([MICRO] if MICRO.exists() else [])
    reps = []
    for d in dirs:
        crit = {}
        est_dir = d / "criterion-estimates"
        for f in sorted(est_dir.glob("**/estimates.json")):
            meta = f.parent / "benchmark.json"  # criterion's own id, e.g. "bid_json/direct"
            name = json.loads(meta.read_text())["full_id"] if meta.exists() else str(f.parent.relative_to(est_dir))
            crit[name.replace("bid_json_direct", "bid_json/direct")] = json.loads(f.read_text())
        nb = d / "napi-bench.json"
        reps.append((d.name, crit, json.loads(nb.read_text()) if nb.exists() else None))
    return reps


def ns_stats(r):
    return r.get("ns_per_op") or r["ns_per_call"]


def med_range(values, fmt="{:.1f}"):
    if len(values) == 1:
        return fmt.format(values[0])
    return f"{fmt.format(med(values))} ({fmt.format(min(values))}–{fmt.format(max(values))})"


def micro_tables():
    reps = micro_reps()
    if not reps:
        return ""
    out = []
    n = len(reps)
    crit_names = sorted({k for _, c, _ in reps for k in c})
    if crit_names:
        out.append(f"**Rust, criterion** (`cargo bench -p engine-core --bench engine`), ns per call. Columns are criterion's "
                   f"*median* and *mean* point estimates (its printed `time:` is the slope estimate, also in `estimates.json`). "
                   f"Median over {n} run(s) (min–max over runs).\n")
        out.append("| benchmark | median ns | mean ns |")
        out.append("|---|---:|---:|")
        for name in crit_names:
            md = [c[name]["median"]["point_estimate"] for _, c, _ in reps if name in c]
            mn = [c[name]["mean"]["point_estimate"] for _, c, _ in reps if name in c]
            out.append(f"| `{name}` | {med_range(md)} | {med_range(mn)} |")
        out.append("")
    nbs = [nb for _, _, nb in reps if nb]
    if nbs:
        names = [r["name"] for r in nbs[0]["results"]]
        desc = {r["name"]: r["description"] for r in nbs[0]["results"]}
        out.append(f"**Node → napi** (`node bench/napi-bench.js`, {nbs[0]['node']}): median ns per operation over "
                   f"{nbs[0]['results'][0]['samples']} samples per run; median over {len(nbs)} run(s) (min–max over runs). "
                   f"Samples of all benchmarks were interleaved: {nbs[0].get('interleaved', False)}.\n")
        out.append("| benchmark | what it measures | median ns | mean ns | p05 ns | p95 ns |")
        out.append("|---|---|---:|---:|---:|---:|")
        for name in names:
            rs = [next(r for r in nb["results"] if r["name"] == name) for nb in nbs]
            out.append(f"| `{name}` | {desc[name]} | {med_range([ns_stats(r)['median'] for r in rs])} | "
                       f"{med_range([ns_stats(r)['mean'] for r in rs])} | "
                       f"{med_range([ns_stats(r)['p05'] for r in rs])} | {med_range([ns_stats(r)['p95'] for r in rs])} |")
        out.append("")
        # derived numbers: arithmetic on the medians above
        m = {name: med([ns_stats(next(r for r in nb["results"] if r["name"] == name))["median"] for nb in nbs]) for name in names}
        direct = [c["bid_json/direct"]["median"]["point_estimate"] for _, c, _ in reps if "bid_json/direct" in c]
        out.append("Derived (arithmetic on the medians above; each line names its inputs):\n")
        if "probeEngineLoop(payload)" in m:
            out.append(f"- `bid()` − `probeEngineLoop` (same process, same CPUs, interleaved samples) = "
                       f"{m['bid(payload)']:.1f} − {m['probeEngineLoop(payload)']:.1f} = **{m['bid(payload)'] - m['probeEngineLoop(payload)']:.1f} ns**: "
                       f"the cost of reaching the engine from JS instead of from a Rust loop.")
            # paired: sample s of every benchmark was taken in the same round (~300 ms window)
            per_rep = []
            for nb in nbs:
                by = {r["name"]: r.get("samples_ns_per_op") for r in nb["results"]}
                a, b = by.get("bid(payload)"), by.get("probeEngineLoop(payload)")
                if a and b:
                    per_rep.append(statistics.median([x - y for x, y in zip(a, b)]))
            if per_rep:
                out.append(f"- the same difference computed **per round** (each `bid()` sample minus the `probeEngineLoop` sample taken "
                           f"in the same round, so both saw the same CPU-speed state): median {med_range(per_rep)} ns "
                           f"(median over {len(per_rep)} run(s), min–max over runs).")
        if direct:
            rd = med(direct)
            out.append(f"- `bid()` − criterion `bid_json/direct` (different processes and harnesses) = {m['bid(payload)']:.1f} − {rd:.1f} = "
                       f"**{m['bid(payload)'] - rd:.1f} ns**.")
            if "probeEngineLoop(payload)" in m:
                out.append(f"- engine inside the Node process (`probeEngineLoop`) − engine in the criterion process = "
                           f"{m['probeEngineLoop(payload)']:.1f} − {rd:.1f} = **{m['probeEngineLoop(payload)'] - rd:.1f} ns**.")
        out.append(f"- boundary alone, measured directly by `probeEcho` = **{m['probeEcho(payload)']:.1f} ns**, of which: bare call (`probeNoop`) "
                   f"{m['probeNoop()']:.1f} ns; string in (`probeTakeString` − `probeNoop`) {m['probeTakeString(payload)'] - m['probeNoop()']:.1f} ns; "
                   f"string out (`probeEcho` − `probeTakeString`) {m['probeEcho(payload)'] - m['probeTakeString(payload)']:.1f} ns.")
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
    parts.append("\nServer CPU time per completed request, µs (derived: average server CPU × measured duration ÷ responses; "
                 "median over runs). Lower is more efficient, independent of how many cores were used:\n")
    parts.append(cpu_per_req_table(c, [("round1", "node-single"), ("round1", "rust"), ("round2", "node-cluster"), ("round2", "rust"),
                                       ("supplementary", "rust-1worker"), ("supplementary", "node-stub"), ("supplementary", "rust-stub")],
                                   levels))
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
    parts.append("\n### Diagnostics (raw output, verbatim)\n")
    parts.append(text_block(RES / "profile" / "summary.txt",
                            "V8 CPU profile of A (single process) under concurrency 100 (`bench/profile-node.sh`; separate run, "
                            "profiler overhead included, so its throughput is not comparable):"))
    parts.append(text_block(RES / "diagnostics" / "vcpu-speed-check.txt",
                            "vCPU speed check (`engine-core/examples/speed_check.rs`; ns per `bid_json()` iteration over 250 ms windows; "
                            "per-window series in the file):", keep=lambda l: "series" not in l and l.strip()))
    if SKIPPED:
        parts.append("\n**Incomplete runs skipped by the summarizer:**\n\n" + "\n".join(f"- `{x}`" for x in SKIPPED))
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

        def fill(text, name, body):
            begin, end = f"<!-- BEGIN {name} -->", f"<!-- END {name} -->"
            i, j = text.index(begin) + len(begin), text.index(end)
            return text[:i] + "\n" + body + text[j:]

        text = fill(text, "GENERATED RESULTS", summary)
        machine = RES / "machine.txt"
        if machine.exists():
            text = fill(text, "MACHINE", "```text\n" + machine.read_text().strip() + "\n```\n")
        p.write_text(text)


if __name__ == "__main__":
    main()
