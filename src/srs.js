/* ============================================================
   SRS: spaced repetition with a speed gate
   A skill is one drill generator (or one lesson's rule, for recall
   cards). It sits in a Leitner box. Each box has a review interval
   that roughly doubles, and a time goal that tightens as the box
   climbs, so a skill only reaches the top by being right *and* fast,
   on separate days, weeks apart. That is what automatic means.
   ============================================================ */

var SRS_DAY = 864e5;
var SRS_DAYS = [0, 1, 3, 7, 16, 35, 80, 180];        /* interval once promoted into box i */
var SRS_TOP = SRS_DAYS.length - 1;
var SRS_SLACK = 4 * 36e5;                             /* due a few hours early, so "same time tomorrow" counts */
var SRS_LEVELS = ["new", "learning", "familiar", "solid", "solid", "fluent", "automatic", "automatic"];
var SRS_HIST = 20;

function srsNew() {
  return { box: 0, due: 0, run: 0, n: 0, ok: 0, lapses: 0, last: 0, secs: 0, hist: [] };
}

/* the time goal for a skill at a box: the drill's target at first,
   tightening 6% per box to 60% of it at the top */
function srsGoal(target, box) {
  return Math.round(10 * target * Math.max(0.6, 1 - 0.06 * box)) / 10;
}

/* clean answers in a row, on a due skill, to earn the next box */
function srsNeed(box) { return box === 0 ? 5 : 3; }

function srsLevel(s) { return SRS_LEVELS[s ? s.box : 0]; }
function srsIsDue(s, now) { return !s || now >= s.due; }

/* One answer. Returns what happened: up, miss, slow, clean.
   A miss drops a box and makes it due now. A slow right answer
   does not count toward the run. Cramming a skill that is not yet
   due builds the run but never promotes: only spacing does that. */
function srsRecord(s, ok, secs, target, now) {
  var goal = srsGoal(target, s.box);
  s.n++; s.last = now;
  s.secs += Math.min(secs, target * 3 + 20);
  s.hist.push(ok ? Math.round(100 * secs / target) / 100 : -1);
  if (s.hist.length > SRS_HIST) s.hist.shift();
  if (!ok) {
    if (s.box > 0) { s.lapses++; s.box--; }
    s.run = 0; s.due = now;
    return { ev: "miss", box: s.box, goal: goal };
  }
  s.ok++;
  if (secs > goal) { s.run = 0; return { ev: "slow", box: s.box, goal: goal }; }
  s.run++;
  if (now >= s.due && s.run >= srsNeed(s.box) && s.box < SRS_TOP) {
    s.box++;
    s.run = 0;
    s.due = now + SRS_DAYS[s.box] * SRS_DAY - SRS_SLACK;
    return { ev: "up", box: s.box, goal: goal, days: SRS_DAYS[s.box] };
  }
  return { ev: "clean", box: s.box, goal: goal, run: s.run, need: srsNeed(s.box) };
}

/* put a skill on the schedule after a passed checkpoint: first review tomorrow */
function srsGraduate(s, now) {
  if (s.box < 1) { s.box = 1; s.run = 0; s.due = now + SRS_DAYS[1] * SRS_DAY - SRS_SLACK; }
}

/* recent accuracy and median speed (as a multiple of the drill's target) */
function srsRecent(s, k) {
  var h = (s && s.hist || []).slice(-(k || 10));
  if (!h.length) return { n: 0, acc: 0, pace: 0 };
  var good = h.filter(function (x) { return x >= 0; }).sort(function (a, b) { return a - b; });
  return {
    n: h.length,
    acc: good.length / h.length,
    pace: good.length ? good[good.length >> 1] : 0
  };
}

/* Choose the next skill. Due skills dominate, overdue ones more so;
   weak ones get extra weight; the one just asked is damped so the
   session interleaves; a recent miss comes back after a short gap.
   ctx: { last, retry, idle } where idle weights skills that are not due. */
function srsPick(pool, skills, now, ctx, rnd) {
  rnd = rnd || Math.random;
  ctx = ctx || {};
  var retry = ctx.retry || [];
  for (var i = 0; i < retry.length; i++) {
    if (retry[i].wait <= 0 && pool.indexOf(retry[i].m) >= 0) return retry.splice(i, 1)[0].m;
  }
  var w = pool.map(function (m) {
    var s = skills[m];
    var x;
    if (srsIsDue(s, now)) {
      var late = s ? Math.max(0, (now - s.due) / SRS_DAY) : 0;
      x = 5 + Math.min(4, late) + (!s || s.box === 0 ? 2 : 0);
    } else x = ctx.idle != null ? ctx.idle : 0.6;     /* not due: filler, for interleaving */
    var r = srsRecent(s, 10);
    if (r.n) x *= 1 + 2 * (1 - r.acc) + Math.max(0, Math.min(1, r.pace - 0.8));
    if (m === ctx.last && pool.length > 1) x *= 0.2;
    return x;
  });
  var tot = w.reduce(function (a, b) { return a + b; }, 0);
  if (!(tot > 0)) return pool[(rnd() * pool.length) | 0];
  var u = rnd() * tot;
  for (var j = 0; j < pool.length; j++) { u -= w[j]; if (u < 0) return pool[j]; }
  return pool[pool.length - 1];
}

/* advance the retry queue by one question, and add a miss to it */
function srsTickRetry(ctx) { (ctx.retry || []).forEach(function (r) { r.wait--; }); }
function srsQueueRetry(ctx, m) {
  ctx.retry = ctx.retry || [];
  if (!ctx.retry.some(function (r) { return r.m === m; })) ctx.retry.push({ m: m, wait: 2 });
}

function srsDueList(ids, skills, now) {
  return ids.filter(function (m) { return skills[m] && srsIsDue(skills[m], now); });
}

/* local calendar day, for the practice log and the day streak */
function srsDayKey(t) {
  var d = new Date(t);
  return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
}

function srsDayStreak(log, now) {
  var n = 0, t = now;
  if (!log[srsDayKey(t)]) t -= SRS_DAY;               /* today not started yet does not break it */
  while (log[srsDayKey(t)]) { n++; t -= SRS_DAY; }
  return n;
}

if (typeof module !== "undefined") module.exports = {
  SRS_DAY: SRS_DAY, SRS_DAYS: SRS_DAYS, SRS_TOP: SRS_TOP, srsNew: srsNew, srsGoal: srsGoal, srsNeed: srsNeed,
  srsLevel: srsLevel, srsIsDue: srsIsDue, srsRecord: srsRecord, srsGraduate: srsGraduate, srsRecent: srsRecent,
  srsPick: srsPick, srsTickRetry: srsTickRetry, srsQueueRetry: srsQueueRetry, srsDueList: srsDueList,
  srsDayKey: srsDayKey, srsDayStreak: srsDayStreak
};
