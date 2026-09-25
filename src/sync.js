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
   A wipe stamps a new epoch; a newer epoch replaces an older one
   outright, so "Clear all progress" is not undone by the next pull.
   ============================================================ */

var SYNC_FILE = "pokerpro-progress.json";
var SYNC_API = "https://api.github.com";

function syncEmpty() {
  return { v: 1, epoch: 0, statsEpoch: 0, progress: {}, stats: null, skills: {}, plog: {} };
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
  return e;
}

function syncMerge(a, b) {
  a = syncNorm(a); b = syncNorm(b);
  if (a.epoch !== b.epoch) return a.epoch > b.epoch ? a : b;
  var out = syncEmpty();
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

/* ---- the gist, over GitHub's REST API ---- */
function syncReq(token, method, path, body, keepalive) {
  var opt = {
    method: method,
    cache: "no-store",
    headers: { "Authorization": "Bearer " + token, "Accept": "application/vnd.github+json" }
  };
  if (body) { opt.body = JSON.stringify(body); opt.headers["Content-Type"] = "application/json"; }
  if (keepalive) opt.keepalive = true;
  return fetch(SYNC_API + path, opt).then(function (r) {
    if (r.status === 401) throw new Error("GitHub rejected the token");
    if (r.status === 403 || r.status === 404) throw new Error("the token needs the gist permission");
    if (!r.ok) throw new Error("GitHub said " + r.status);
    return r.status === 204 ? null : r.json();
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
  SYNC_FILE: SYNC_FILE, syncEmpty: syncEmpty, syncNorm: syncNorm, syncMerge: syncMerge, syncCanon: syncCanon
};
