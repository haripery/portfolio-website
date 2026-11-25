#!/usr/bin/env python3
"""Sample CPU and memory of a process (and, with --tree, all its descendants) from /proc.

Writes one CSV row per --interval seconds until SIGINT/SIGTERM, then a JSON summary to
<out>.summary.json.

cpu_pct   : CPU time (user+system, all threads, all processes in the tree) consumed during
            the interval / wall time of the interval * 100.  100 == one full core.
rss_kb    : sum of VmRSS over the tree.  For multi-process servers (Node cluster) this
            double-counts pages shared between processes (node binary, libraries).
pss_kb    : sum of Pss (proportional set size) from /proc/<pid>/smaps_rollup.  Shared pages
            are split between the processes sharing them, so the sum is not double-counted.
--system  : also record machine-wide /proc/stat numbers per interval: steal_pct (CPU time
            the hypervisor gave to someone else, % of all CPU time) and per-CPU busy %.
"""
import argparse
import json
import os
import signal
import sys
import time

CLK_TCK = os.sysconf("SC_CLK_TCK")


def children(pid):
    out = []
    try:
        for tid in os.listdir(f"/proc/{pid}/task"):
            try:
                with open(f"/proc/{pid}/task/{tid}/children") as f:
                    out.extend(int(x) for x in f.read().split())
            except OSError:
                pass
    except OSError:
        pass
    return out


def process_tree(root, tree):
    if not tree:
        return [root]
    pids, stack = [], [root]
    while stack:
        p = stack.pop()
        pids.append(p)
        stack.extend(children(p))
    return pids


def cpu_ticks(pid):
    with open(f"/proc/{pid}/stat") as f:
        data = f.read()
    fields = data[data.rindex(")") + 2 :].split()  # fields[0] is field 3 ("state")
    return int(fields[11]) + int(fields[12])  # utime (field 14) + stime (field 15)


def status_kb(pid):
    rss = threads = 0
    with open(f"/proc/{pid}/status") as f:
        for line in f:
            if line.startswith("VmRSS:"):
                rss = int(line.split()[1])
            elif line.startswith("Threads:"):
                threads = int(line.split()[1])
    return rss, threads


def pss_kb(pid):
    try:
        with open(f"/proc/{pid}/smaps_rollup") as f:
            for line in f:
                if line.startswith("Pss:"):
                    return int(line.split()[1])
    except OSError:  # process exited (FileNotFoundError / ProcessLookupError) or not readable
        pass
    return 0


def proc_stat():
    """{'cpu': [...], 'cpu0': [...], ...} from /proc/stat (user nice system idle iowait irq softirq steal ...)."""
    out = {}
    with open("/proc/stat") as f:
        for line in f:
            if line.startswith("cpu"):
                parts = line.split()
                out[parts[0]] = [int(x) for x in parts[1:]]
    return out


def stat_delta(a, b):
    """busy % per cpu and machine-wide steal % between two proc_stat() snapshots."""
    res = {}
    for name in a:
        d = [y - x for x, y in zip(a[name], b[name])]
        total = sum(d[:8])  # guest time is already included in user/nice
        if total <= 0:
            res[name] = (0.0, 0.0)
            continue
        idle = d[3] + d[4]
        res[name] = (100.0 * (total - idle) / total, 100.0 * d[7] / total)
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pid", type=int, required=True)
    ap.add_argument("--tree", action="store_true", help="include all descendant processes")
    ap.add_argument("--interval", type=float, default=1.0)
    ap.add_argument("--out", required=True)
    ap.add_argument("--system", action="store_true", help="also record machine-wide steal and per-CPU busy %")
    args = ap.parse_args()

    stop = False

    def on_signal(*_):
        nonlocal stop
        stop = True

    signal.signal(signal.SIGINT, on_signal)
    signal.signal(signal.SIGTERM, on_signal)

    rows = []
    t0 = time.monotonic()
    prev_t = t0
    last_ok_t = t0  # time of the last interval in which the process(es) could be read
    prev_ticks = {}
    first_ticks = {}
    for p in process_tree(args.pid, args.tree):
        try:
            prev_ticks[p] = first_ticks[p] = cpu_ticks(p)
        except OSError:
            pass

    sys_first = sys_prev = proc_stat() if args.system else None
    cpu_names = sorted((n for n in (sys_first or {}) if n != "cpu"), key=lambda n: int(n[3:]))
    sys_cols = "".join(f",{n}_busy_pct" for n in cpu_names) + (",steal_pct" if args.system else "")

    with open(args.out, "w") as out:
        out.write("elapsed_s,cpu_pct,rss_kb,pss_kb,processes,threads" + sys_cols + "\n")
        while True:
            # sleep in small steps so a stop signal is handled promptly
            deadline = prev_t + args.interval
            while not stop and time.monotonic() < deadline:
                time.sleep(min(0.05, max(0.0, deadline - time.monotonic())))
            now = time.monotonic()
            pids = process_tree(args.pid, args.tree)
            dticks = rss = pss = threads = nproc = 0
            for p in pids:
                try:
                    t = cpu_ticks(p)
                    r, th = status_kb(p)
                    ps = pss_kb(p)
                except OSError:  # process exited between reads
                    continue
                nproc += 1
                dticks += t - prev_ticks.get(p, t)
                prev_ticks[p] = t
                first_ticks.setdefault(p, t)
                rss += r
                pss += ps
                threads += th
            dt = now - prev_t
            extra = ""
            if args.system:
                sys_now = proc_stat()
                delta = stat_delta(sys_prev, sys_now)
                sys_prev = sys_now
                extra = "".join(f",{delta[n][0]:.1f}" for n in cpu_names) + f",{delta['cpu'][1]:.2f}"
            if dt > 0 and nproc:
                cpu = dticks / CLK_TCK / dt * 100.0
                rows.append((now - t0, cpu, rss, pss, nproc, threads))
                last_ok_t = now
                out.write(f"{now - t0:.3f},{cpu:.1f},{rss},{pss},{nproc},{threads}{extra}\n")
                out.flush()
            prev_t = now
            if stop or nproc == 0:
                break

    total_ticks = sum(prev_ticks[p] - first_ticks.get(p, prev_ticks[p]) for p in prev_ticks)
    wall = last_ok_t - t0
    summary = {
        "pid": args.pid,
        "tree": args.tree,
        "samples": len(rows),
        "wall_s": round(wall, 3),
        "cpu_pct_avg": round(total_ticks / CLK_TCK / wall * 100.0, 1) if wall > 0 else None,
        "cpu_pct_max_interval": round(max((r[1] for r in rows), default=0.0), 1),
        "rss_kb_max": max((r[2] for r in rows), default=0),
        "rss_kb_avg": round(sum(r[2] for r in rows) / len(rows)) if rows else 0,
        "pss_kb_max": max((r[3] for r in rows), default=0),
        "pss_kb_avg": round(sum(r[3] for r in rows) / len(rows)) if rows else 0,
        "processes_max": max((r[4] for r in rows), default=0),
        "threads_max": max((r[5] for r in rows), default=0),
    }
    if args.system:
        whole = stat_delta(sys_first, sys_prev)
        summary["steal_pct_whole_window"] = round(whole["cpu"][1], 2)
        summary["busy_pct_whole_window"] = {n: round(whole[n][0], 1) for n in cpu_names}
    with open(args.out + ".summary.json", "w") as f:
        json.dump(summary, f, indent=2)
        f.write("\n")


if __name__ == "__main__":
    sys.exit(main())
