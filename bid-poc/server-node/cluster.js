'use strict';
// Architecture A, multi-core variant: Node `cluster` with one worker per available CPU.
// Each worker runs server.js unchanged (its own event loop, its own copy of the addon and
// advertiser list). Node's default scheduling policy on Linux is used (SCHED_RR: the
// primary accepts connections and hands them to workers round-robin). oha keeps its
// connections open, so the hand-off happens once per connection, not once per request.
const cluster = require('node:cluster');
const os = require('node:os');

if (cluster.isPrimary) {
  const n = Number(process.env.WORKERS || os.availableParallelism());
  let listening = 0;
  let shuttingDown = false;
  cluster.on('listening', () => {
    listening += 1;
    if (listening === n) {
      console.error(
        `[server-node cluster] READY primary pid=${process.pid} workers=${n} ` +
          `os.availableParallelism()=${os.availableParallelism()} os.cpus().length=${os.cpus().length} ` +
          `schedulingPolicy=${cluster.schedulingPolicy === cluster.SCHED_RR ? 'SCHED_RR' : 'SCHED_NONE'}`,
      );
    }
  });
  cluster.on('exit', (worker, code, signal) => {
    if (!shuttingDown) console.error(`[server-node cluster] worker ${worker.process.pid} exited code=${code} signal=${signal}`);
  });
  process.on('SIGTERM', () => {
    shuttingDown = true;
    for (const w of Object.values(cluster.workers)) w.process.kill('SIGTERM');
    setTimeout(() => process.exit(0), 500).unref();
    cluster.on('exit', () => {
      if (Object.keys(cluster.workers).length === 0) process.exit(0);
    });
  });
  for (let i = 0; i < n; i++) cluster.fork();
} else {
  require('./server.js');
}
