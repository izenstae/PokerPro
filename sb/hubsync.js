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
function hsNewer(a, b, key) { if (!a) return b; if (!b) return a; return (+b[key] || 0) > (+a[key] || 0) ? b : a; }
function hsUnionBy(a, b, keyOf, cap) {
  var seen = {}, out = [];
  (a || []).concat(b || []).forEach(function (x) { var k = keyOf(x); if (k == null || seen[k]) return; seen[k] = 1; out.push(x); });
  if (cap && out.length > cap) out = out.slice(-cap);
  return out;
}
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
function hsMergeHub(a, b) {
  a = Object.assign(hsEmptyHub(), a || {}); b = Object.assign(hsEmptyHub(), b || {});
  /* a newer epoch (a deliberate wipe) beats everything older */
  if ((+a.epoch || 0) !== (+b.epoch || 0)) { var w = (+a.epoch || 0) > (+b.epoch || 0) ? a : b; return JSON.parse(JSON.stringify(w)); }
  var m = hsEmptyHub(); m.epoch = a.epoch;
  Object.keys(a.progress).concat(Object.keys(b.progress)).forEach(function (k) { if (a.progress[k] || b.progress[k]) m.progress[k] = 1; });
  Object.keys(a.skills).concat(Object.keys(b.skills)).forEach(function (k) { m.skills[k] = hsNewer(a.skills[k], b.skills[k], "last"); });
  m.plog = hsDayMerge(a.plog, b.plog);
  var ga = a.gstate || {}, gb = b.gstate || {};
  m.gstate = Object.assign({}, ga, gb);
  ["spots", "sweeps", "plugged", "peakLevel", "convs", "planStreak"].forEach(function (k) { m.gstate[k] = hsMaxNum(ga[k], gb[k]); });
  m.gstate.goal = (+gb.goalAt || 0) > (+ga.goalAt || 0) ? gb.goal : (ga.goal != null ? ga.goal : gb.goal);
  m.gstate.goalAt = hsMaxNum(ga.goalAt, gb.goalAt);
  m.gstate.seen = Object.assign({}, ga.seen || {}, gb.seen || {});
  if (ga.calib || gb.calib) { m.gstate.calib = {}; ["g", "f", "s"].forEach(function (k) { var p = (ga.calib || {})[k] || [0, 0], q = (gb.calib || {})[k] || [0, 0]; m.gstate.calib[k] = [hsMaxNum(p[0], q[0]), hsMaxNum(p[1], q[1])]; }); }
  /* chess: games are a set by time; the move log is the longer one; the puzzle rating follows the more answered */
  var ca = a.chess, cb = b.chess;
  if (ca || cb) {
    ca = ca || { d: [], games: [], puzzle: 1000, pn: 0, ph: [] }; cb = cb || { d: [], games: [], puzzle: 1000, pn: 0, ph: [] };
    var moreP = (cb.pn || 0) > (ca.pn || 0) ? cb : ca;
    m.chess = { d: (ca.d || []).length >= (cb.d || []).length ? ca.d : cb.d, games: hsUnionBy(ca.games, cb.games, function (g) { return g.t; }, 60).sort(function (x, y) { return y.t - x.t; }), puzzle: moreP.puzzle, pn: moreP.pn, ph: moreP.ph || [] };
  }
  Object.keys(a.apply || {}).concat(Object.keys(b.apply || {})).forEach(function (k) {
    var p = (a.apply || {})[k], q = (b.apply || {})[k];
    if (!p) { m.apply[k] = q; return; } if (!q) { m.apply[k] = p; return; }
    m.apply[k] = { n: hsMaxNum(p.n, q.n), sum: hsMaxNum(p.sum, q.sum), best: hsMaxNum(p.best, q.best), last: hsMaxNum(p.last, q.last), done: Object.assign({}, p.done || {}, q.done || {}) };
  });
  m.logs = hsUnionBy(a.logs, b.logs, function (x) { return x.id; }, 2000).sort(function (x, y) { return x.t - y.t; });
  m.plan = hsNewer(a.plan, b.plan, "at");
  Object.keys(a.placed || {}).concat(Object.keys(b.placed || {})).forEach(function (k) { m.placed[k] = hsMaxNum((a.placed || {})[k], (b.placed || {})[k]); });
  var qa = a.quant, qb = b.quant;
  if (qa || qb) {
    qa = qa || { runs: [], tier: {}, best: {} }; qb = qb || { runs: [], tier: {}, best: {} };
    m.quant = { runs: hsUnionBy(qa.runs, qb.runs, function (r) { return r.t + ":" + r.g; }, 2000).sort(function (x, y) { return x.t - y.t; }), tier: {}, best: {} };
    Object.keys(qa.tier || {}).concat(Object.keys(qb.tier || {})).forEach(function (k) { m.quant.tier[k] = hsMaxNum((qa.tier || {})[k], (qb.tier || {})[k]); });
    Object.keys(qa.best || {}).concat(Object.keys(qb.best || {})).forEach(function (k) { m.quant.best[k] = hsMaxNum((qa.best || {})[k], (qb.best || {})[k]); });
  }
  return m;
}

/* the Math 340 store: cards by the later review, practice by the more attempts, misses and exams as sets, activity per day max */
function hsMergeM340(a, b) {
  if (!a) return b || null; if (!b) return a;
  var m = { v: 2, cards: {}, practice: {}, misses: [], exams: [], sheet: [], activity: {} };
  Object.keys(a.cards || {}).concat(Object.keys(b.cards || {})).forEach(function (k) {
    var x = (a.cards || {})[k], y = (b.cards || {})[k];
    if (!x) { m.cards[k] = y; return; } if (!y) { m.cards[k] = x; return; }
    m.cards[k] = (y.seen || 0) > (x.seen || 0) || ((y.seen || 0) === (x.seen || 0) && (y.due || 0) > (x.due || 0)) ? y : x;
  });
  Object.keys(a.practice || {}).concat(Object.keys(b.practice || {})).forEach(function (k) {
    var x = (a.practice || {})[k], y = (b.practice || {})[k];
    m.practice[k] = !x ? y : !y ? x : (y.attempts || 0) > (x.attempts || 0) ? y : x;
  });
  m.misses = hsUnionBy(a.misses, b.misses, function (x) { return x.key; }, 60).sort(function (x, y) { return (x.at || 0) - (y.at || 0); });
  m.exams = hsUnionBy(a.exams, b.exams, function (x) { return x.at; }, 20).sort(function (x, y) { return (x.at || 0) - (y.at || 0); });
  var sh = {}; (a.sheet || []).concat(b.sheet || []).forEach(function (id) { sh[id] = 1; }); m.sheet = Object.keys(sh).sort();
  Object.keys(a.activity || {}).concat(Object.keys(b.activity || {})).forEach(function (k) { m.activity[k] = hsMaxNum((a.activity || {})[k], (b.activity || {})[k]); });
  return m;
}

/* the whole gist file */
function hsEmpty() { return { v: 1, hub: hsEmptyHub(), poker: null, pokerGame: null, pokerSim: null, math340: null, devices: {} }; }
function hsNorm(x) { return Object.assign(hsEmpty(), x || {}); }
function hsMergeAll(a, b) {
  a = hsNorm(a); b = hsNorm(b);
  var out = hsEmpty();
  out.hub = hsMergeHub(a.hub, b.hub);
  out.poker = a.poker && b.poker ? syncMerge(syncNorm(a.poker), syncNorm(b.poker)) : (a.poker || b.poker || null);
  out.pokerGame = hsMergePokerGame(a.pokerGame, b.pokerGame);
  out.pokerSim = hsMergePokerSim(a.pokerSim, b.pokerSim);
  out.math340 = hsMergeM340(a.math340, b.math340);
  out.devices = syncMergeDevices(a.devices || {}, b.devices || {});
  return out;
}
function hsMergePokerGame(a, b) {
  if (!a) return b || null; if (!b) return a;
  var m = Object.assign({}, a, b);
  ["spots", "sweeps", "plugged", "peakLevel"].forEach(function (k) { m[k] = hsMaxNum(a[k], b[k]); });
  m.goal = (+b.goalAt || 0) > (+a.goalAt || 0) ? b.goal : a.goal; m.goalAt = hsMaxNum(a.goalAt, b.goalAt);
  m.seen = Object.assign({}, a.seen || {}, b.seen || {});
  if (a.calib || b.calib) { m.calib = {}; ["g", "f", "s"].forEach(function (k) { var p = (a.calib || {})[k] || [0, 0], q = (b.calib || {})[k] || [0, 0]; m.calib[k] = [hsMaxNum(p[0], q[0]), hsMaxNum(p[1], q[1])]; }); }
  return m;
}
/* the table: PokerPro's own table merge handles career and level; settings follow the newer copy */
function hsMergePokerSim(a, b) {
  if (!a) return b || null; if (!b) return a;
  var t = syncTableMerge({ career: a.career, level: a.level }, { career: b.career, level: b.level });
  return { set: (+b.at || 0) > (+a.at || 0) ? b.set : (a.set || b.set), career: t.career, level: t.level, at: hsMaxNum(a.at, b.at) };
}
/* key-order independent, devices left out: to tell whether a merge changed anything */
function hsCanon(x) {
  if (x === null || typeof x !== "object") return JSON.stringify(x);
  if (Array.isArray(x)) return "[" + x.map(hsCanon).join(",") + "]";
  return "{" + Object.keys(x).filter(function (k) { return k !== "devices" && x[k] !== undefined; }).sort().map(function (k) { return JSON.stringify(k) + ":" + hsCanon(x[k]); }).join(",") + "}";
}

if (typeof module !== "undefined") module.exports = { HS_FILE: HS_FILE, hsEmptyHub: hsEmptyHub, hsMergeHub: hsMergeHub, hsMergeM340: hsMergeM340, hsEmpty: hsEmpty, hsNorm: hsNorm, hsMergeAll: hsMergeAll, hsDayMerge: hsDayMerge, hsCanon: hsCanon, hsMergePokerGame: hsMergePokerGame };
