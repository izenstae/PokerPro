/* ============================================================
   HUB SYNC: one gist, every app's progress
   The hub keeps its own progress, PokerPro's three saved keys and
   the Math 340 store in one private GitHub gist file and merges
   them the way PokerPro does: commutatively and idempotently, so
   devices converge whatever order they sync in. The gist client
   (syncReq, syncFindGist, syncRead, syncWrite) is PokerPro's own
   sync.js with the file name switched; the merges are here.
   Shape of the gist file:
     { v: 1, hub: <hub snapshot>, poker: <PokerPro snapshot>, pokerGame, pokerSim, math340: <Math 340 store>, devices }
   ============================================================ */

var HS_FILE = "skillbuilder-progress.json";

function hsMaxNum(a, b) { return Math.max(+a || 0, +b || 0); }
function hsMinNum(a, b) { a = +a || 0; b = +b || 0; return !a ? b : !b ? a : Math.min(a, b); }
function hsNewer(a, b, key) { if (!a) return b; if (!b) return a; return (+b[key] || 0) > (+a[key] || 0) ? b : a; }
/* shape guards: a malformed gist (null where an object should be, a string where an array should be)
   must never throw in the merge, or one bad write breaks sync on every device */
function hsIsObj(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
function hsObj(x) { return hsIsObj(x) ? x : {}; }
function hsArr(x) { return Array.isArray(x) ? x : []; }
function hsNum(x) { x = +x; return isFinite(x) ? x : 0; }
function hsObjOf(x) { var out = {}; Object.keys(hsObj(x)).forEach(function (k) { if (hsIsObj(x[k])) out[k] = x[k]; }); return out; }   /* only the object-valued entries */
function hsNumsOf(x) { var out = {}; Object.keys(hsObj(x)).forEach(function (k) { out[k] = hsNum(x[k]); }); return out; }
/* a skill record: the more recently answered copy, with tiebreaks so a graduated skill
   ({box: 1, last: 0}, never answered) is never demoted by a fresh copy, and a tie on
   `last` (or an unanswered side) goes to the higher box, then the more answered, then
   the more correct; a final canonical-string tiebreak keeps the choice order-independent */
function hsNewerSkill(x, y) {
  if (!hsIsObj(x)) return hsIsObj(y) ? y : x; if (!hsIsObj(y)) return x;
  var lx = hsNum(x.last), ly = hsNum(y.last);
  if (lx && ly && lx !== ly) return ly > lx ? y : x;
  var bx = hsNum(x.box), by = hsNum(y.box); if (bx !== by) return by > bx ? y : x;
  var nx = hsNum(x.n), ny = hsNum(y.n); if (nx !== ny) return ny > nx ? y : x;
  var ox = hsNum(x.ok), oy = hsNum(y.ok); if (ox !== oy) return oy > ox ? y : x;
  if (lx !== ly) return ly > lx ? y : x;
  return hsCanon(y) > hsCanon(x) ? y : x;
}
/* a set by key; with a cap the newest by timeOf survive (sorted before capping, so both
   merge orders keep the same members); without timeOf the cap keeps the last ones */
function hsUnionBy(a, b, keyOf, cap, timeOf) {
  var seen = {}, out = [];
  hsArr(a).concat(hsArr(b)).forEach(function (x) { if (x == null) return; var k = keyOf(x); if (k == null || seen[k]) return; seen[k] = 1; out.push(x); });
  if (timeOf) out.sort(function (x, y) { return (hsNum(timeOf(x)) - hsNum(timeOf(y))) || (String(keyOf(x)) < String(keyOf(y)) ? -1 : String(keyOf(x)) > String(keyOf(y)) ? 1 : 0); });
  if (cap && out.length > cap) out = out.slice(-cap);
  return out;
}
/* the plan ticks: { dayKey: { "skill:kind": true } }; the union of the ticks per day, the newest days kept */
var HS_PLAN_DAYS = 8;
function hsMergePlanDone(a, b) {
  a = hsObj(a); b = hsObj(b);
  var out = {}, keys = {};
  Object.keys(a).concat(Object.keys(b)).forEach(function (k) { if (hsIsObj(a[k]) || hsIsObj(b[k])) keys[k] = 1; });
  Object.keys(keys).sort().slice(-HS_PLAN_DAYS).forEach(function (k) {
    var x = hsObj(a[k]), y = hsObj(b[k]), m = {};
    Object.keys(x).concat(Object.keys(y)).forEach(function (f) { if (x[f] || y[f]) m[f] = true; });
    out[k] = m;
  });
  return out;
}
/* when did this hub's settings last move: the game-state stamps and the plan's `at` */
function hsHubStamp(h) { var g = hsObj(h.gstate); return Math.max(hsNum(g.goalAt), hsNum(g.confAt), hsNum(hsObj(h.plan).at)); }
function hsDayMerge(a, b) {
  var out = {};
  Object.keys(a || {}).concat(Object.keys(b || {})).forEach(function (k) {
    var x = (a || {})[k], y = (b || {})[k];
    if (!x) { out[k] = y; return; } if (!y) { out[k] = x; return; }
    var m = {};
    Object.keys(x).concat(Object.keys(y)).forEach(function (f) {
      if (f === "by") { m.by = {}; Object.keys(x.by || {}).concat(Object.keys(y.by || {})).forEach(function (c) { var p = (x.by || {})[c] || {}, q = (y.by || {})[c] || {}; m.by[c] = { s: hsMaxNum(p.s, q.s), n: hsMaxNum(p.n, q.n), ok: hsMaxNum(p.ok, q.ok), x: hsMaxNum(p.x, q.x) }; }); }
      else if (f === "g") m.g = !!(x.g || y.g);
      else if (f === "r") { m.r = {}; Object.keys(x.r || {}).concat(Object.keys(y.r || {})).forEach(function (c) { m.r[c] = hsMaxNum((x.r || {})[c], (y.r || {})[c]); }); }
      else m[f] = typeof x[f] === "number" || typeof y[f] === "number" ? hsMaxNum(x[f], y[f]) : (x[f] != null ? x[f] : y[f]);
    });
    out[k] = m;
  });
  return out;
}

/* the hub's own snapshot */
function hsEmptyHub() { return { v: 1, epoch: 0, progress: {}, skills: {}, plog: {}, gstate: {}, chess: null, apply: {}, logs: [], plan: null, placed: {}, quant: null }; }
/* coerce a hub snapshot to its shape: objects where objects belong, arrays where arrays belong,
   finite numbers for counters, null for the optional parts; unknown keys ride along untouched */
function hsNormHub(h) {
  var out = Object.assign(hsEmptyHub(), hsObj(h));
  out.epoch = hsNum(out.epoch);
  out.progress = hsObj(out.progress);
  out.skills = hsObjOf(out.skills);
  out.plog = hsObjOf(out.plog);
  out.gstate = Object.assign({}, hsObj(out.gstate));
  if (out.gstate.seen != null) out.gstate.seen = hsNumsOf(out.gstate.seen);
  if (out.gstate.calib != null && !hsIsObj(out.gstate.calib)) delete out.gstate.calib;
  if (out.gstate.planDone != null && !hsIsObj(out.gstate.planDone)) delete out.gstate.planDone;
  out.apply = hsObjOf(out.apply);
  out.logs = hsArr(out.logs).filter(hsIsObj);
  out.plan = hsIsObj(out.plan) ? out.plan : null;
  out.placed = hsNumsOf(out.placed);
  if (hsIsObj(out.chess)) { var c = out.chess = Object.assign({}, out.chess); c.d = hsArr(c.d); c.games = hsArr(c.games).filter(hsIsObj); c.ph = hsArr(c.ph); c.puzzle = c.puzzle == null ? 1000 : hsNum(c.puzzle); c.pn = hsNum(c.pn); }
  else out.chess = null;
  if (hsIsObj(out.quant)) { var q = out.quant = Object.assign({}, out.quant); q.runs = hsArr(q.runs).filter(hsIsObj); q.tier = hsNumsOf(q.tier); q.best = hsNumsOf(q.best); }
  else out.quant = null;
  return out;
}
function hsMergeHub(a, b) {
  a = hsNormHub(a); b = hsNormHub(b);
  /* a newer epoch (a deliberate wipe) beats everything older */
  if (a.epoch !== b.epoch) { var w = a.epoch > b.epoch ? a : b; return JSON.parse(JSON.stringify(w)); }
  var m = hsEmptyHub(); m.epoch = a.epoch;
  Object.keys(a.progress).concat(Object.keys(b.progress)).forEach(function (k) { if (a.progress[k] || b.progress[k]) m.progress[k] = 1; });
  Object.keys(a.skills).concat(Object.keys(b.skills)).forEach(function (k) { m.skills[k] = hsNewerSkill(a.skills[k], b.skills[k]); });
  m.plog = hsDayMerge(a.plog, b.plog);
  /* game state: unknown fields last-writer (b), counters max, the goal by its stamp, trophies by first sighting,
     the plan ticks a union per day, the plan day the later, flags by the newer settings stamp and otherwise OR,
     so that merging in either order gives the same result */
  var ga = a.gstate, gb = b.gstate, sa = hsHubStamp(a), sb = hsHubStamp(b);
  m.gstate = Object.assign({}, ga, gb);
  ["spots", "sweeps", "plugged", "peakLevel", "convs", "planStreak", "schoolClear"].forEach(function (k) { if (ga[k] != null || gb[k] != null) m.gstate[k] = hsMaxNum(ga[k], gb[k]); });
  m.gstate.goal = hsNum(gb.goalAt) > hsNum(ga.goalAt) ? gb.goal : hsNum(ga.goalAt) > hsNum(gb.goalAt) ? ga.goal : (ga.goal != null ? ga.goal : gb.goal);
  m.gstate.goalAt = hsMaxNum(ga.goalAt, gb.goalAt);
  m.gstate.seen = {}; var seenA = hsObj(ga.seen), seenB = hsObj(gb.seen);
  Object.keys(seenA).concat(Object.keys(seenB)).forEach(function (k) { m.gstate.seen[k] = hsMinNum(seenA[k], seenB[k]); });
  if (ga.calib || gb.calib) { m.gstate.calib = {}; ["g", "f", "s"].forEach(function (k) { var p = hsArr(hsObj(ga.calib)[k]), q = hsArr(hsObj(gb.calib)[k]); m.gstate.calib[k] = [hsMaxNum(p[0], q[0]), hsMaxNum(p[1], q[1])]; }); }
  if (ga.planDone || gb.planDone) m.gstate.planDone = hsMergePlanDone(ga.planDone, gb.planDone);
  if (ga.planLast != null || gb.planLast != null) { var pa = String(ga.planLast || ""), pb = String(gb.planLast || ""); m.gstate.planLast = pb > pa ? pb : pa; }
  if (ga.primed != null || gb.primed != null) m.gstate.primed = !!(ga.primed || gb.primed);
  if (ga.conf != null || gb.conf != null) {
    var ca2 = hsNum(ga.confAt), cb2 = hsNum(gb.confAt);
    if (ca2 !== cb2) m.gstate.conf = cb2 > ca2 ? gb.conf : ga.conf;
    else if (sa !== sb && ga.conf != null && gb.conf != null) m.gstate.conf = sb > sa ? gb.conf : ga.conf;
    else m.gstate.conf = ga.conf == null ? gb.conf : gb.conf == null ? ga.conf : !!(ga.conf || gb.conf);
    if (ca2 || cb2) m.gstate.confAt = Math.max(ca2, cb2);
  }
  /* chess: games are a set by time; the move log is the longer one; the puzzle rating follows the more answered */
  var ca = a.chess, cb = b.chess;
  if (ca || cb) {
    ca = ca || { d: [], games: [], puzzle: 1000, pn: 0, ph: [] }; cb = cb || { d: [], games: [], puzzle: 1000, pn: 0, ph: [] };
    var moreP = cb.pn > ca.pn ? cb : ca;
    m.chess = { d: ca.d.length >= cb.d.length ? ca.d : cb.d, games: hsUnionBy(ca.games, cb.games, function (g) { return g.t; }, 60, function (g) { return g.t; }).sort(function (x, y) { return y.t - x.t; }), puzzle: moreP.puzzle, pn: moreP.pn, ph: moreP.ph };
  }
  Object.keys(a.apply).concat(Object.keys(b.apply)).forEach(function (k) {
    var p = a.apply[k], q = b.apply[k];
    if (!p) { m.apply[k] = q; return; } if (!q) { m.apply[k] = p; return; }
    m.apply[k] = { n: hsMaxNum(p.n, q.n), sum: hsMaxNum(p.sum, q.sum), best: hsMaxNum(p.best, q.best), last: hsMaxNum(p.last, q.last), done: Object.assign({}, hsObj(p.done), hsObj(q.done)) };
  });
  m.logs = hsUnionBy(a.logs, b.logs, function (x) { return x.id; }, 2000, function (x) { return x.t; });
  m.plan = hsNewer(a.plan, b.plan, "at");
  Object.keys(a.placed).concat(Object.keys(b.placed)).forEach(function (k) { m.placed[k] = hsMaxNum(a.placed[k], b.placed[k]); });
  var qa = a.quant, qb = b.quant;
  if (qa || qb) {
    qa = qa || { runs: [], tier: {}, best: {} }; qb = qb || { runs: [], tier: {}, best: {} };
    m.quant = { runs: hsUnionBy(qa.runs, qb.runs, function (r) { return r.t + ":" + r.g; }, 2000, function (r) { return r.t; }), tier: {}, best: {} };
    Object.keys(qa.tier).concat(Object.keys(qb.tier)).forEach(function (k) { m.quant.tier[k] = hsMaxNum(qa.tier[k], qb.tier[k]); });
    Object.keys(qa.best).concat(Object.keys(qb.best)).forEach(function (k) { m.quant.best[k] = hsMaxNum(qa.best[k], qb.best[k]); });
  }
  return m;
}

/* the Math 340 store: cards by the later review, practice by the more attempts, misses and exams as sets, activity per day max */
function hsNormM340(s) {
  if (!hsIsObj(s)) return null;
  var out = Object.assign({}, s);
  out.cards = hsObjOf(out.cards); out.practice = hsObjOf(out.practice);
  out.misses = hsArr(out.misses).filter(hsIsObj); out.exams = hsArr(out.exams).filter(hsIsObj);
  out.sheet = hsArr(out.sheet).filter(function (id) { return id != null && typeof id !== "object"; });
  out.activity = hsNumsOf(out.activity);
  return out;
}
function hsMergeM340(a, b) {
  a = hsNormM340(a); b = hsNormM340(b);
  if (!a) return b || null; if (!b) return a;
  var m = { v: 2, cards: {}, practice: {}, misses: [], exams: [], sheet: [], activity: {} };
  Object.keys(a.cards).concat(Object.keys(b.cards)).forEach(function (k) {
    var x = a.cards[k], y = b.cards[k];
    if (!x) { m.cards[k] = y; return; } if (!y) { m.cards[k] = x; return; }
    m.cards[k] = (y.seen || 0) > (x.seen || 0) || ((y.seen || 0) === (x.seen || 0) && (y.due || 0) > (x.due || 0)) ? y : x;
  });
  Object.keys(a.practice).concat(Object.keys(b.practice)).forEach(function (k) {
    var x = a.practice[k], y = b.practice[k];
    m.practice[k] = !x ? y : !y ? x : (y.attempts || 0) > (x.attempts || 0) ? y : x;
  });
  m.misses = hsUnionBy(a.misses, b.misses, function (x) { return x.key; }, 60, function (x) { return x.at; });
  m.exams = hsUnionBy(a.exams, b.exams, function (x) { return x.at; }, 20, function (x) { return x.at; });
  var sh = {}; a.sheet.concat(b.sheet).forEach(function (id) { sh[id] = 1; }); m.sheet = Object.keys(sh).sort();
  Object.keys(a.activity).concat(Object.keys(b.activity)).forEach(function (k) { m.activity[k] = hsMaxNum(a.activity[k], b.activity[k]); });
  return m;
}

/* the whole gist file */
var HS_KEYS = ["v", "hub", "poker", "pokerGame", "pokerSim", "math340", "devices"];
function hsEmpty() { return { v: 1, hub: hsEmptyHub(), poker: null, pokerGame: null, pokerSim: null, math340: null, devices: {} }; }
/* coerce a gist file to its shape; keys this version does not know are kept so a newer schema round-trips */
function hsNorm(x) {
  var out = Object.assign(hsEmpty(), hsObj(x));
  out.hub = hsNormHub(out.hub);
  out.poker = hsIsObj(out.poker) ? out.poker : null;
  out.pokerGame = hsIsObj(out.pokerGame) ? out.pokerGame : null;
  out.pokerSim = hsIsObj(out.pokerSim) ? out.pokerSim : null;
  out.math340 = hsNormM340(out.math340);
  out.devices = hsObjOf(out.devices);
  return out;
}
function hsMergeAll(a, b) {
  a = hsNorm(a); b = hsNorm(b);
  var out = hsEmpty();
  /* unknown top-level keys ride along: whichever side has one, the remote (b) when both do */
  Object.keys(a).concat(Object.keys(b)).forEach(function (k) { if (HS_KEYS.indexOf(k) < 0) out[k] = b[k] !== undefined ? b[k] : a[k]; });
  out.hub = hsMergeHub(a.hub, b.hub);
  out.poker = a.poker && b.poker ? syncMerge(syncNorm(a.poker), syncNorm(b.poker)) : (a.poker || b.poker || null);
  out.pokerGame = hsMergePokerGame(a.pokerGame, b.pokerGame);
  out.pokerSim = hsMergePokerSim(a.pokerSim, b.pokerSim);
  out.math340 = hsMergeM340(a.math340, b.math340);
  out.devices = syncMergeDevices(a.devices, b.devices);
  return out;
}
function hsMergePokerGame(a, b) {
  if (!hsIsObj(a)) return hsIsObj(b) ? b : null; if (!hsIsObj(b)) return a;
  var m = Object.assign({}, a, b);
  ["spots", "sweeps", "plugged", "peakLevel"].forEach(function (k) { m[k] = hsMaxNum(a[k], b[k]); });
  m.goal = hsNum(b.goalAt) > hsNum(a.goalAt) ? b.goal : hsNum(a.goalAt) > hsNum(b.goalAt) ? a.goal : (a.goal != null ? a.goal : b.goal); m.goalAt = hsMaxNum(a.goalAt, b.goalAt);
  m.seen = {}; var sa = hsNumsOf(a.seen), sb = hsNumsOf(b.seen);
  Object.keys(sa).concat(Object.keys(sb)).forEach(function (k) { m.seen[k] = hsMinNum(sa[k], sb[k]); });
  if (a.calib || b.calib) { m.calib = {}; ["g", "f", "s"].forEach(function (k) { var p = hsArr(hsObj(a.calib)[k]), q = hsArr(hsObj(b.calib)[k]); m.calib[k] = [hsMaxNum(p[0], q[0]), hsMaxNum(p[1], q[1])]; }); }
  return m;
}
/* the table: PokerPro's own table merge handles career and level; settings follow the newer copy */
function hsMergePokerSim(a, b) {
  if (!hsIsObj(a)) return hsIsObj(b) ? b : null; if (!hsIsObj(b)) return a;
  var t = syncTableMerge({ career: a.career, level: a.level }, { career: b.career, level: b.level });
  return { set: (+b.at || 0) > (+a.at || 0) ? b.set : (a.set || b.set), career: t.career, level: t.level, at: hsMaxNum(a.at, b.at) };
}
/* key-order independent, devices left out: to tell whether a merge changed anything */
function hsCanon(x) {
  if (x === null || typeof x !== "object") return JSON.stringify(x);
  if (Array.isArray(x)) return "[" + x.map(hsCanon).join(",") + "]";
  return "{" + Object.keys(x).filter(function (k) { return k !== "devices" && x[k] !== undefined; }).sort().map(function (k) { return JSON.stringify(k) + ":" + hsCanon(x[k]); }).join(",") + "}";
}

if (typeof module !== "undefined") module.exports = { HS_FILE: HS_FILE, hsEmptyHub: hsEmptyHub, hsNormHub: hsNormHub, hsMergeHub: hsMergeHub, hsMergeM340: hsMergeM340, hsEmpty: hsEmpty, hsNorm: hsNorm, hsMergeAll: hsMergeAll, hsDayMerge: hsDayMerge, hsCanon: hsCanon, hsMergePokerGame: hsMergePokerGame, hsUnionBy: hsUnionBy, hsNewerSkill: hsNewerSkill, hsMergePlanDone: hsMergePlanDone };
