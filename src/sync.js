/* ============================================================
   SYNC: carry progress between devices through a private GitHub Gist
   There is no server. Each device keeps its own copy in browser
   storage and, when a token is set, merges it with one secret gist.
   The merge is commutative and idempotent, so any device can pull
   and push in any order, as often as it likes, and they converge:
     progress  union of passed lessons
     skills    per skill, the one answered most recently wins
     plog      per day, the larger of each figure
     stats     the one reset most recently, then the one with more answers
     devices   per device, the one seen most recently (survives wipes)
   A wipe stamps a new epoch; a newer epoch replaces an older one
   outright, so "Clear all progress" is not undone by the next pull.
   ============================================================ */

var SYNC_FILE = "pokerpro-progress.json";
var SYNC_API = "https://api.github.com";

function syncEmpty() {
  return { v: 1, epoch: 0, statsEpoch: 0, progress: {}, stats: null, skills: {}, plog: {}, devices: {} };
}

function syncNorm(st) {
  var e = syncEmpty();
  if (!st || typeof st !== "object") return e;
  e.epoch = +st.epoch || 0;
  e.statsEpoch = +st.statsEpoch || 0;
  e.progress = st.progress || {};
  e.stats = st.stats && st.stats.mode ? st.stats : null;
  e.skills = st.skills || {};
  e.plog = st.plog || {};
  e.devices = st.devices || {};
  return e;
}

function syncMergeDevices(a, b) {
  var out = {};
  Object.keys(a).concat(Object.keys(b)).forEach(function (k) {
    var x = a[k], y = b[k];
    out[k] = !x ? y : !y ? x : (y.seen || 0) > (x.seen || 0) ? y : x;
  });
  return out;
}

function syncMerge(a, b) {
  a = syncNorm(a); b = syncNorm(b);
  if (a.epoch !== b.epoch) {
    var w = JSON.parse(JSON.stringify(a.epoch > b.epoch ? a : b));
    w.devices = syncMergeDevices(a.devices, b.devices);
    return w;
  }
  var out = syncEmpty();
  out.devices = syncMergeDevices(a.devices, b.devices);
  out.epoch = a.epoch;

  Object.keys(a.progress).concat(Object.keys(b.progress)).forEach(function (k) {
    if (a.progress[k] || b.progress[k]) out.progress[k] = 1;
  });

  Object.keys(a.skills).concat(Object.keys(b.skills)).forEach(function (k) {
    var x = a.skills[k], y = b.skills[k];
    if (!x || !y) { out.skills[k] = x || y; return; }
    var xl = x.last || 0, yl = y.last || 0;
    out.skills[k] = xl !== yl ? (xl > yl ? x : y)
                  : (y.n || 0) > (x.n || 0) ? y
                  : (y.n || 0) < (x.n || 0) ? x
                  : (y.box || 0) > (x.box || 0) ? y : x;
  });

  Object.keys(a.plog).concat(Object.keys(b.plog)).forEach(function (k) {
    var x = a.plog[k] || {}, y = b.plog[k] || {};
    out.plog[k] = {
      s: Math.max(x.s || 0, y.s || 0),
      n: Math.max(x.n || 0, y.n || 0),
      ok: Math.max(x.ok || 0, y.ok || 0)
    };
  });

  var sa = a.stats, sb = b.stats;
  if (a.statsEpoch !== b.statsEpoch) {
    out.statsEpoch = Math.max(a.statsEpoch, b.statsEpoch);
    out.stats = a.statsEpoch > b.statsEpoch ? sa : sb;
  } else {
    out.statsEpoch = a.statsEpoch;
    out.stats = !sa ? sb : !sb ? sa : (sb.n || 0) > (sa.n || 0) ? sb : sa;
  }
  return out;
}

/* key-order independent JSON, to tell whether a merge changed anything */
function syncCanon(x) {
  if (x === null || typeof x !== "object") return JSON.stringify(x);
  if (Array.isArray(x)) return "[" + x.map(syncCanon).join(",") + "]";
  return "{" + Object.keys(x).sort().filter(function (k) { return x[k] !== undefined; })
    .map(function (k) { return JSON.stringify(k) + ":" + syncCanon(x[k]); }).join(",") + "}";
}

/* what a state holds, for the side-by-side table */
function syncSummary(st) {
  st = syncNorm(st);
  var sk = Object.keys(st.skills).map(function (k) { return st.skills[k]; });
  var days = Object.keys(st.plog).filter(function (k) { return (st.plog[k].n || 0) > 0 || (st.plog[k].s || 0) > 0; });
  var secs = 0, answers = 0;
  days.forEach(function (k) { secs += st.plog[k].s || 0; answers += st.plog[k].n || 0; });
  return {
    lessons: Object.keys(st.progress).filter(function (k) { return st.progress[k]; }).length,
    skills: sk.filter(function (s) { return s.box >= 1; }).length,
    automatic: sk.filter(function (s) { return s.box >= 6; }).length,
    days: days.length,
    minutes: Math.round(secs / 60),
    answers: answers,
    lastAnswer: sk.reduce(function (m, s) { return Math.max(m, s.last || 0); }, 0),
    lastDay: days.sort().slice(-1)[0] || "",
    devices: Object.keys(st.devices).length,
    epoch: st.epoch
  };
}

/* what moved from one state to another: lessons gained, skills and days changed */
function syncDiff(from, to) {
  from = syncNorm(from); to = syncNorm(to);
  var d = { lessons: 0, skills: 0, days: 0, wiped: to.epoch > from.epoch, stats: to.statsEpoch > from.statsEpoch };
  Object.keys(to.progress).forEach(function (k) { if (!from.progress[k]) d.lessons++; });
  Object.keys(to.skills).forEach(function (k) { if (syncCanon(to.skills[k]) !== syncCanon(from.skills[k])) d.skills++; });
  Object.keys(to.plog).forEach(function (k) { if (syncCanon(to.plog[k]) !== syncCanon(from.plog[k])) d.days++; });
  d.any = !!(d.lessons || d.skills || d.days || d.wiped || d.stats);
  return d;
}

/* ---- the gist, over GitHub's REST API ---- */
var syncRate = { left: null, limit: null, reset: 0 };

function syncErr(code, msg) { var e = new Error(msg); e.code = code; return e; }

function syncReq(token, method, path, body, keepalive) {
  var opt = {
    method: method,
    cache: "no-store",
    headers: { "Authorization": "Bearer " + token, "Accept": "application/vnd.github+json" }
  };
  if (body) { opt.body = JSON.stringify(body); opt.headers["Content-Type"] = "application/json"; }
  if (keepalive) opt.keepalive = true;
  return fetch(SYNC_API + path, opt).then(function (r) {
    var h = function (k) { return r.headers && r.headers.get ? r.headers.get(k) : null; };
    if (h("x-ratelimit-remaining") != null) {
      syncRate.left = +h("x-ratelimit-remaining"); syncRate.limit = +h("x-ratelimit-limit");
      syncRate.reset = +h("x-ratelimit-reset") * 1000;
    }
    if (r.status === 401) throw syncErr("auth", "GitHub rejected the token");
    if (r.status === 403 && h("x-ratelimit-remaining") === "0") throw syncErr("rate", "GitHub's hourly API limit is used up");
    if (r.status === 403 || r.status === 404) throw syncErr("scope", "the token can't read or write gists");
    if (r.status >= 500) throw syncErr("down", "GitHub is having trouble (" + r.status + ")");
    if (!r.ok) throw syncErr("http", "GitHub answered " + r.status);
    return r.status === 204 ? null : r.json().then(function (j) {
      if (j && typeof j === "object") Object.defineProperty(j, "_scopes", { value: h("x-oauth-scopes"), enumerable: false });
      return j;
    });
  }, function () {
    throw syncErr("offline", "couldn't reach GitHub");
  });
}

/* find this app's gist among the token owner's gists, or make a secret one */
async function syncFindGist(token, seed) {
  for (var page = 1; page <= 10; page++) {
    var list = await syncReq(token, "GET", "/gists?per_page=100&page=" + page);
    for (var i = 0; i < list.length; i++) if (list[i].files && list[i].files[SYNC_FILE]) return list[i].id;
    if (list.length < 100) break;
  }
  var files = {};
  files[SYNC_FILE] = { content: JSON.stringify(seed || syncEmpty()) };
  var g = await syncReq(token, "POST", "/gists", {
    description: "PokerPro progress (synced between devices by the app)", public: false, files: files
  });
  return g.id;
}

/* who the token belongs to, and what it may do (classic tokens list their scopes) */
async function syncWho(token) {
  var u = await syncReq(token, "GET", "/user");
  return { login: u.login, name: u.name || "", url: u.html_url, avatar: u.avatar_url, scopes: u._scopes };
}

async function syncRead(token, id) {
  var g = await syncReq(token, "GET", "/gists/" + id);
  var f = g.files && g.files[SYNC_FILE];
  if (!f) return syncEmpty();
  var text = f.content;
  if (f.truncated && f.raw_url) text = await (await fetch(f.raw_url, { cache: "no-store" })).text();
  try { return syncNorm(JSON.parse(text)); } catch (e) { return syncEmpty(); }
}

function syncWrite(token, id, st, keepalive) {
  var files = {};
  files[SYNC_FILE] = { content: JSON.stringify(st) };
  return syncReq(token, "PATCH", "/gists/" + id, { files: files }, keepalive);
}

if (typeof module !== "undefined") module.exports = {
  SYNC_FILE: SYNC_FILE, syncEmpty: syncEmpty, syncNorm: syncNorm, syncMerge: syncMerge, syncCanon: syncCanon,
  syncSummary: syncSummary, syncDiff: syncDiff
};
