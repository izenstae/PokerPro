/* Spaced repetition: promotion needs spacing and speed, misses demote,
   the picker favours due and weak skills and interleaves. */
const S = require("../src/srs.js");
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL " + m); } };
const H = 36e5, D = S.SRS_DAY;

/* a new skill: five clean answers promote it to box 1, due tomorrow */
let s = S.srsNew(), t = 1e12, ev;
for (let i = 0; i < 4; i++) ev = S.srsRecord(s, true, 3, 8, t);
ok(ev.ev === "clean" && s.box === 0, "four clean answers do not promote a new skill");
ev = S.srsRecord(s, true, 3, 8, t);
ok(ev.ev === "up" && s.box === 1, "the fifth clean answer promotes");
ok(s.due > t + 12 * H && s.due <= t + D, "box 1 is due within a day, not sooner than half a day");

/* cramming: more clean answers the same day never promote */
for (let i = 0; i < 20; i++) ev = S.srsRecord(s, true, 3, 8, t + H);
ok(s.box === 1 && ev.ev === "clean", "cramming before the due date does not promote");

/* the next day, three clean answers promote to box 2 with a 3 day gap */
s.run = 0; t = s.due + 1;
for (let i = 0; i < 3; i++) ev = S.srsRecord(s, true, 3, 8, t);
ok(ev.ev === "up" && s.box === 2 && ev.days === 3, "a due review promotes after three clean answers");

/* slow but right does not count toward the run */
let r = S.srsNew();
for (let i = 0; i < 10; i++) ev = S.srsRecord(r, true, 9, 8, t);
ok(ev.ev === "slow" && r.box === 0 && r.run === 0, "right but over the goal is not clean");
ok(r.ok === 10, "slow answers still count as correct");

/* the goal tightens as the box climbs */
ok(S.srsGoal(10, 0) === 10 && S.srsGoal(10, 5) === 7 && S.srsGoal(10, 7) === 6, "time goal tightens to 60%");
let u = S.srsNew(); u.box = 5; u.due = 0;
ev = S.srsRecord(u, true, 7.5, 10, t);
ok(ev.ev === "slow", "an answer inside the drill target is still slow for a fluent skill");

/* a miss drops one box and makes it due now */
let m = S.srsNew(); m.box = 4; m.due = t + 10 * D; m.run = 2;
ev = S.srsRecord(m, false, 3, 8, t);
ok(ev.ev === "miss" && m.box === 3 && m.due === t && m.run === 0 && m.lapses === 1, "a miss demotes one box and resets");
ok(S.srsIsDue(m, t), "a missed skill is due immediately");

/* the top box stays the top box */
let top = S.srsNew(); top.box = S.SRS_TOP; top.due = 0;
for (let i = 0; i < 5; i++) S.srsRecord(top, true, 1, 10, t);
ok(top.box === S.SRS_TOP, "cannot promote past the top box");

/* graduation schedules tomorrow and never demotes */
let g = S.srsNew(); S.srsGraduate(g, t);
ok(g.box === 1 && g.due > t, "a passed checkpoint puts the skill in box 1");
let g2 = S.srsNew(); g2.box = 4; g2.due = 5; S.srsGraduate(g2, t);
ok(g2.box === 4 && g2.due === 5, "graduating an advanced skill leaves it alone");

/* recent stats */
let h = S.srsNew(); h.hist = [0.5, -1, 1.0, 0.7];
let rc = S.srsRecent(h, 10);
ok(rc.n === 4 && Math.abs(rc.acc - 0.75) < 1e-9 && rc.pace === 0.7, "recent accuracy and median pace");

/* the picker: a due skill beats a not-due one about 10 to 1 */
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const sk = { a: Object.assign(S.srsNew(), { box: 3, due: t + 5 * D }), b: Object.assign(S.srsNew(), { box: 3, due: t - D }) };
let cnt = { a: 0, b: 0 };
for (let i = 0; i < 4000; i++) cnt[S.srsPick(["a", "b"], sk, t, {}, rnd)]++;
ok(cnt.b > 6 * cnt.a, "due skills dominate the draw (" + cnt.b + " vs " + cnt.a + ")");

/* idle 0 never picks a skill that is not due, when one is */
let bad = 0;
for (let i = 0; i < 1000; i++) if (S.srsPick(["a", "b"], sk, t, { idle: 0 }, rnd) === "a") bad++;
ok(bad === 0, "idle 0 sticks to due skills");
/* with nothing due at all it still returns something */
ok(["a", "b"].indexOf(S.srsPick(["a", "b"], { a: sk.a, b: sk.a }, t, { idle: 0 }, rnd)) >= 0, "nothing due still picks");

/* weak skills get more weight than strong ones at equal due state */
const wk = { a: Object.assign(S.srsNew(), { hist: [0.5, 0.5, 0.5, 0.5] }), b: Object.assign(S.srsNew(), { hist: [-1, -1, 0.5, -1] }) };
cnt = { a: 0, b: 0 };
for (let i = 0; i < 4000; i++) cnt[S.srsPick(["a", "b"], wk, t, {}, rnd)]++;
ok(cnt.b > 1.8 * cnt.a, "weak skills are drawn more often (" + cnt.b + " vs " + cnt.a + ")");

/* interleaving: the last skill is damped */
cnt = { a: 0, b: 0 };
const eq = { a: S.srsNew(), b: S.srsNew() };
for (let i = 0; i < 4000; i++) cnt[S.srsPick(["a", "b"], eq, t, { last: "a" }, rnd)]++;
ok(cnt.b > 3 * cnt.a, "the skill just asked is damped (" + cnt.b + " vs " + cnt.a + ")");

/* a miss comes back after exactly two other questions */
const ctx = { last: null };
S.srsQueueRetry(ctx, "a");
S.srsQueueRetry(ctx, "a");
ok(ctx.retry.length === 1, "a skill is queued for retry once");
S.srsTickRetry(ctx); S.srsTickRetry(ctx);
ok(S.srsPick(["a", "b"], eq, t, ctx, rnd) === "a" && ctx.retry.length === 0, "the retry fires and leaves the queue");

/* day streak */
const log = {};
log[S.srsDayKey(t)] = 1; log[S.srsDayKey(t - D)] = 1; log[S.srsDayKey(t - 2 * D)] = 1;
ok(S.srsDayStreak(log, t) === 3, "three days in a row");
ok(S.srsDayStreak(log, t + D) === 3, "today not yet trained does not break the streak");
ok(S.srsDayStreak(log, t + 2 * D) === 0, "a missed day does");

console.log((fail ? "FAIL " : "PASS ") + "srs: " + pass + " of " + (pass + fail) + " assertions");
if (fail) process.exit(1);
