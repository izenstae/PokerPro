/* Sync: merging two devices' progress converges, whatever the order,
   and a wipe spreads rather than being undone. */
const S = require("../src/sync.js");
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL " + m); } };
const same = (a, b) => S.syncCanon(a) === S.syncCanon(b);

const sk = (last, n, box) => ({ box, due: 0, run: 0, n, ok: n, lapses: 0, last, secs: 0, hist: [] });
const stats = n => ({ n, correct: n, clean: 0, time: 0, streak: 0, best: 0, mode: { odds: { n, correct: n } } });

const laptop = {
  progress: { a: 1, b: 1 },
  skills: { odds: sk(200, 30, 3), outs: sk(100, 10, 1) },
  plog: { "2026-09-24": { s: 600, n: 40, ok: 35 }, "2026-09-25": { s: 100, n: 5, ok: 5 } },
  stats: stats(80), epoch: 0, statsEpoch: 0, openLayer: 2
};
const ipad = {
  progress: { c: 1 },
  skills: { odds: sk(150, 25, 2), outs: sk(300, 14, 2), combos: sk(250, 8, 1) },
  plog: { "2026-09-25": { s: 400, n: 20, ok: 18 } },
  stats: stats(50), epoch: 0, statsEpoch: 0
};

const m = S.syncMerge(laptop, ipad);
ok(same(m.progress, { a: 1, b: 1, c: 1 }), "passed lessons are the union");
ok(m.skills.odds.last === 200 && m.skills.outs.last === 300, "each skill takes the most recently answered copy");
ok(m.skills.combos && m.skills.combos.box === 1, "a skill only one device has is kept");
ok(m.plog["2026-09-24"].s === 600 && m.plog["2026-09-25"].s === 400 && m.plog["2026-09-25"].n === 20, "each day keeps the larger figures");
ok(m.stats.n === 80, "stats come from the device with more answers");
ok(!("openLayer" in m), "view state does not sync");

ok(same(S.syncMerge(ipad, laptop), m), "the merge is commutative");
ok(same(S.syncMerge(m, laptop), m) && same(S.syncMerge(m, ipad), m), "merging again changes nothing");
ok(same(S.syncMerge(m, m), m), "the merge is idempotent");

/* a wipe on one device carries: the newer epoch wins outright */
const wiped = { progress: {}, skills: {}, plog: {}, stats: stats(0), epoch: 1000, statsEpoch: 1000 };
const w = S.syncMerge(m, wiped);
ok(Object.keys(w.progress).length === 0 && Object.keys(w.skills).length === 0 && w.epoch === 1000, "a newer wipe replaces older progress");
ok(same(S.syncMerge(wiped, m), w), "whichever side the wipe is on");
const after = S.syncMerge(w, { progress: { d: 1 }, skills: {}, plog: {}, epoch: 1000 });
ok(after.progress.d === 1, "progress made after the wipe still merges");

/* resetting only the stats */
const reset = Object.assign({}, m, { stats: stats(3), statsEpoch: 500 });
ok(S.syncMerge(m, reset).stats.n === 3 && S.syncMerge(reset, m).stats.n === 3, "a newer stats reset wins over more answers");

/* first sync: an empty or garbled gist */
ok(same(S.syncMerge(laptop, S.syncEmpty()).progress, laptop.progress), "merging with an empty gist keeps local progress");
ok(same(S.syncMerge(laptop, null).skills, laptop.skills), "a missing remote is treated as empty");
ok(S.syncMerge({ progress: { a: 1 } }, { stats: { n: 1 } }).stats === null, "stats without a mode table are ignored");

/* key order does not matter to the change check */
ok(S.syncCanon({ a: 1, b: [1, { y: 2, x: 1 }] }) === S.syncCanon({ b: [1, { x: 1, y: 2 }], a: 1 }), "canonical form ignores key order");

/* devices: each keeps its latest sighting, and a wipe does not forget them */
const dA = { devices: { a: { name: "Mac", seen: 10 }, b: { name: "iPad", seen: 5 } } };
const dB = { devices: { b: { name: "iPad Pro", seen: 20 } } };
const dm = S.syncMerge(dA, dB).devices;
ok(dm.a.name === "Mac" && dm.b.name === "iPad Pro", "each device keeps its most recent record");
ok(same(S.syncMerge(dB, dA).devices, dm), "device merge is commutative");
const dw = S.syncMerge(Object.assign({ epoch: 9 }, dB), dA);
ok(dw.epoch === 9 && dw.devices.a && dw.devices.b.seen === 20, "a wipe keeps the device list");
dw.devices.z = 1;
ok(!dB.devices.z, "a merged state never aliases its inputs");

/* the summary and the diff behind the sync screen */
const sum = S.syncSummary(m);
ok(sum.lessons === 3 && sum.skills === 3 && sum.automatic === 0, "summary counts lessons and scheduled skills");
ok(sum.days === 2 && sum.minutes === Math.round(1000 / 60) && sum.answers === 60, "summary totals the practice log");
ok(sum.lastAnswer === 300 && sum.lastDay === "2026-09-25", "summary finds the latest answer and day");
const df = S.syncDiff(ipad, m);
ok(df.lessons === 2 && df.skills === 1 && df.days === 1 && df.any, "diff counts what the iPad gained");
ok(!S.syncDiff(m, m).any, "no diff between a state and itself");
ok(S.syncDiff(m, wiped).wiped, "diff notices a wipe");

console.log("sync: " + pass + " passed, " + fail + " failed");
if (fail) process.exit(1);
