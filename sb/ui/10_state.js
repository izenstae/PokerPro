/* ============================================================
   UI 1: state, storage, speech, XP and the bridges
   One saved object (HUB) holds everything the hub learns about
   you; PokerPro and Math 340 keep their own keys in the same
   browser storage and the hub reads them to build the day.
   ============================================================ */
function $(id) { return document.getElementById(id); }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function btn(label, cls, fn) { var b = el("button", "act" + (cls ? " " + cls : ""), label); b.type = "button"; b.onclick = fn; return b; }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function fmtDur(secs) { return secs > 0 && secs < 60 ? "<1m" : secs < 3600 ? Math.round(secs / 60) + "m" : (secs / 3600).toFixed(1) + "h"; }
function fmtIn(ms) { var h = ms / 36e5; return h < 1 ? Math.max(1, Math.round(ms / 6e4)) + " min" : h < 36 ? Math.round(h) + " h" : Math.round(h / 24) + " d"; }
function fmtAgo(t) { if (!t) return "never"; var m = (Date.now() - t) / 6e4; return m < 1 ? "just now" : m < 60 ? Math.round(m) + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " d ago"; }
function dayKey(t) { return srsDayKey(t == null ? Date.now() : t); }
function todayKey() { return dayKey(Date.now()); }
function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }
function pct(x) { return Math.round(100 * x) + "%"; }

/* ---- storage: localStorage, probed ---- */
var STORE = (function () {
  try { var p = "__probe" + Math.random(); localStorage.setItem(p, "1"); localStorage.removeItem(p);
    return { kind: "local", get: function (k) { return localStorage.getItem(k); }, set: function (k, v) { localStorage.setItem(k, v); }, del: function (k) { localStorage.removeItem(k); } }; } catch (e) {}
  var mem = {};
  return { kind: "none", get: function (k) { return mem[k] == null ? null : mem[k]; }, set: function (k, v) { mem[k] = v; }, del: function (k) { delete mem[k]; } };
})();
var HUB_KEY = "sb-hub-v1", SYNC_CFG_KEY = "sb-sync-v1";
var POKER_KEYS = { course: "poker-course-v1", game: "poker-game-v1", sim: "poker-sim-v1" };

/* ---- the hub state ---- */
var HUB = null;
var saveState = "off", saveTimer = 0;
/* saveHold: the saved copy could not be read, so nothing is written over it until the user acts
   (a sync merge or a restore through syncApply, or Start fresh on the Sync page) */
var saveHold = false;
function gstateDefault() { return { goal: 60, goalAt: 0, seen: {}, conf: true, sweeps: 0, convs: 0, planStreak: 0, planLast: "" }; }
/* the one place a saved hub (or nothing) becomes the live HUB with every default filled in */
function hubHydrate(st) {
  st = st && typeof st === "object" ? st : {};
  HUB = Object.assign(hsEmptyHub(), st);
  HUB.gstate = Object.assign(gstateDefault(), st.gstate || {});
  HUB.plan = Object.assign(plDefault(), st.plan || {});
  HUB.plan.week = Object.assign(plDefault().week, (st.plan || {}).week || {});
  HUB.plan.priority = Object.assign(plDefault().priority, (st.plan || {}).priority || {});
  HUB.quant = Object.assign(qtNew(), st.quant || {});
  rebind();
  return HUB;
}
hubHydrate(null);
function hubLoad() {
  var raw = null;
  try { raw = STORE.get(HUB_KEY); } catch (e) { saveState = "error"; return; }
  if (!raw) { saveState = STORE.kind === "none" ? "off" : "on"; return; }
  try {
    var st = JSON.parse(raw);
    if (!st || typeof st !== "object") throw new Error("not a hub");
    hubHydrate(st);
    saveState = "on";
  } catch (e) {
    /* keep the unreadable blob (only the latest) next to the key and refuse to overwrite it */
    try { STORE.set(HUB_KEY + ".corrupt", raw); } catch (e2) {}
    saveState = "error"; saveHold = true;
  }
}
function hubSnapshot() { return JSON.parse(JSON.stringify(HUB)); }
function saveRelease() { saveHold = false; }
function saveNow() {
  if (saveHold) { saveState = "error"; drawSaveTag(); return; }
  try { STORE.set(HUB_KEY, JSON.stringify(HUB)); saveState = STORE.kind === "none" ? "off" : "on"; } catch (e) { saveState = "error"; }
  drawSaveTag();
}
function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () { saveTimer = 0; saveNow(); if (typeof syncSoon === "function") syncSoon(); }, 400);
}
window.addEventListener("pagehide", function () { if (saveTimer) { clearTimeout(saveTimer); saveTimer = 0; saveNow(); } if (typeof syncFlush === "function") syncFlush(); });
function drawSaveTag() {
  var msg = saveHold ? "the saved copy on this device could not be read; nothing is being saved until you sync, restore or start fresh" : saveState === "error" ? "save failed" : saveState !== "on" ? "not saved in this window" : (typeof sync !== "undefined" && sync.token) ? (sync.state === "error" ? "saved here, sync failed" : "saved and synced") : "saved to this device";
  var t = $("savetag"); if (t) t.innerHTML = "<i>" + esc(msg) + "</i>";
  /* the bar under the masthead shows on every screen, but only when something is wrong */
  var bar = $("saveBar"); if (!bar) return;
  var bad = saveHold || saveState !== "on";
  bar.hidden = !bad;
  if (bad) bar.innerHTML = esc(msg) + ' · <a href="#/sync">Sync, backup and install ›</a>';
}

/* ---- skills on the schedule ---- */
var skills = HUB.skills, progress = HUB.progress, plog = HUB.plog;
function rebind() { skills = HUB.skills; progress = HUB.progress; plog = HUB.plog; }
function skillOf(id) { return skills[id] || (skills[id] = srsNew()); }
function passed(cid, lid) { return !!progress[cid + ":" + lid]; }
function courseSkillIds(cid) { return Object.keys(skills).filter(function (id) { var i = skInfo(id); return i && i.course === cid; }); }
function allSkillIds() { return Object.keys(skills).filter(isSkillId); }
function dueIds(cid) { return srsDueList(cid ? courseSkillIds(cid) : allSkillIds(), skills, Date.now()); }
function dueMinutes(ids) { return ids.reduce(function (a, id) { var s = skills[id], i = skInfo(id); return a + (i && i.kind === "rule" ? 25 : (4 + (s ? s.box : 0)) * (s && s.n ? s.secs / s.n + 6 : 14)); }, 0) / 60; }
function overdueDays(ids) { var now = Date.now(); return ids.reduce(function (a, id) { return Math.max(a, skills[id] ? (now - skills[id].due) / SRS_DAY : 0); }, 0); }
function nextLesson(c) { return c.lessonList.filter(function (L) { return passable(L) && !passed(c.id, L.id); })[0] || null; }
function stageDone(c, S) { return S.lessons.filter(function (L) { return passed(c.id, L.id); }).length; }
function lessonDue(c, L) { var now = Date.now(); return lessonSkillIds(c, L).some(function (id) { return skills[id] && now >= skills[id].due; }); }
function courseLessonsPassed(c) { return c.lessonList.filter(function (L) { return passable(L) && passed(c.id, L.id); }).length; }
function courseLessonsTotal(c) { return c.lessonList.filter(passable).length; }

/* ---- the day log: seconds, answers and XP, overall and per course ---- */
function logDay(cid, secs, n, ok) {
  var k = todayKey(), d = plog[k] || (plog[k] = { s: 0, n: 0, ok: 0, x: 0, by: {} });
  d.s += secs; d.n += n; d.ok += ok;
  if (cid) { d.by = d.by || {}; var b = d.by[cid] || (d.by[cid] = { s: 0, n: 0, ok: 0, x: 0 }); b.s += secs; b.n += n; b.ok += ok; }
  if (typeof sess !== "undefined" && sess) sess.secs += secs;
}
function gmToday() { var k = todayKey(); return plog[k] || (plog[k] = { s: 0, n: 0, ok: 0, x: 0, by: {} }); }
function gmGain(cid, x, why) {
  if (!x) return;
  var d = gmToday(); d.x = (d.x || 0) + x;
  if (cid) { d.by = d.by || {}; var b = d.by[cid] || (d.by[cid] = { s: 0, n: 0, ok: 0, x: 0 }); b.x += x; }
  if (why) toast("<b>+" + x + " XP</b> " + why, "xp");
  gmGoalCheck(); drawGamePill(); saveSoon();
}
function gmAnswer(cid, mode, wasDue, ok, fast, recall, promoted) {
  var d = gmToday(); d.r = d.r || {};
  var due = wasDue && (d.r[mode] || 0) < 6;
  if (due) d.r[mode] = (d.r[mode] || 0) + 1;
  var x = gmAnswerXP({ due: due, ok: ok, fast: fast, recall: recall, promoted: promoted, cramToday: d.c || 0 });
  if (!due) d.c = (d.c || 0) + 1;
  gmGain(cid, x, null);
  return x;
}
function gmGoalCheck() {
  var d = gmToday();
  if (d.g || (d.x || 0) < HUB.gstate.goal) return;
  d.g = true; d.x += GM_XP_GOAL;
  toast("<b>Daily goal hit.</b> +" + GM_XP_GOAL + " XP. " + (gmStreak(plog, Date.now()).days) + "-day streak.", "goal");
  gmCheckTrophies();
}
function hubTotalXP() { return gmTotal(plog); }
function toast(html, cls) {
  var box = $("toasts"), t = el("div", "toast " + (cls || ""), html);
  box.appendChild(t);
  setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 450); }, cls === "xp" ? 1600 : 4200);
}
function gmRing(frac, size) {
  size = size || 22; var r = (size - 4) / 2, c = 2 * Math.PI * r;
  return '<svg class="gring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><circle class="bg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '"/><circle class="fg' + (frac >= 1 ? " done" : "") + '" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-dasharray="' + (c * Math.min(1, frac)).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/></svg>';
}
function drawGamePill() {
  var p = $("gPill"); if (!p) return;
  var d = gmToday(), st = gmStreak(plog, Date.now());
  p.innerHTML = gmRing((d.x || 0) / HUB.gstate.goal) + '<span class="gx">' + (d.x || 0) + ' / ' + HUB.gstate.goal + ' XP</span><span class="gs' + (st.todayMet ? " lit" : "") + '">🔥 ' + st.days + '</span>';
  p.title = (d.x || 0) + " of " + HUB.gstate.goal + " XP today · " + st.days + "-day streak" + (st.freezes ? " · " + st.freezes + " freeze" + (st.freezes > 1 ? "s" : "") : "");
}

/* ---- trophies ---- */
function trophySummary() {
  var boxes = allSkillIds().map(function (id) { return skills[id].box; });
  var words = 0;
  COURSE_ORDER.forEach(function (cid) { var c = COURSES[cid]; if (c.kind !== "lang") return; Object.keys(c.words).forEach(function (lid) { c.words[lid].forEach(function (it) { var s = skills[it.id]; if (s && s.box >= 3) words++; }); }); });
  var started = COURSE_ORDER.filter(function (cid) { return courseLessonsPassed(COURSES[cid]) > 0; }).length + (pokerRead().lessons > 0 ? 1 : 0);
  var ch = HUB.chess ? chlSummary(HUB.chess) : null;
  var A = HUB.apply || {};
  var convs = Object.keys(A).filter(function (k) { return /:conv$/.test(k) && A[k].best >= 0.8; }).length;
  return { lessons: Object.keys(progress).length + pokerRead().lessons, coursesStarted: started, bestStreak: gmStreak(plog, Date.now()).best,
    atLeast3: boxes.filter(function (b) { return b >= 3; }).length, atLeast6: boxes.filter(function (b) { return b >= 6; }).length, wordsKnown: words,
    answers: Object.keys(plog).reduce(function (a, k) { return a + (plog[k].n || 0); }, 0), planStreak: HUB.gstate.planStreak || 0,
    chessWins: ch ? ch.wins : 0, chessPuzzle: ch ? ch.puzzle : 0, convs: convs, genesis: passed("he", "bh_gen1") ? 1 : 0, sweeps: HUB.gstate.sweeps || 0, schoolClear: HUB.gstate.schoolClear || 0 };
}
function gmCheckTrophies() {
  var T = sbTrophies(trophySummary()), seen = HUB.gstate.seen || (HUB.gstate.seen = {}), fresh = [];
  T.forEach(function (t) { if (t.got && !seen[t.id]) { seen[t.id] = Date.now(); fresh.push(t); } });
  if (!HUB.gstate.primed) { HUB.gstate.primed = true; saveSoon(); return; }
  fresh.forEach(function (t) { toast('<span class="ttro">🏆</span><b>' + t.name + '</b> ' + t.about, "trophy"); });
  if (fresh.length) saveSoon();
}

/* ---- speech: can this device speak and listen in a language? ---- */
var SPEECH = { voices: [], ready: false };
function speechInit() {
  if (!("speechSynthesis" in window)) return;
  var load = function () { SPEECH.voices = speechSynthesis.getVoices() || []; SPEECH.ready = true; };
  load(); if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = load;
}
function voiceFor(code) {
  var lang = code.split("-")[0];
  var exact = SPEECH.voices.filter(function (v) { return v.lang && v.lang.toLowerCase().replace("_", "-") === code.toLowerCase(); });
  var any = SPEECH.voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(lang) === 0; });
  var list = exact.length ? exact : any;
  list.sort(function (a, b) { return (b.localService ? 1 : 0) - (a.localService ? 1 : 0); });
  return list[0] || null;
}
function capsFor(lang) {
  var code = (LG_LANG[lang] || {}).code || "en-US";
  return { tts: !!voiceFor(code), asr: !!(window.SpeechRecognition || window.webkitSpeechRecognition) && navigator.onLine !== false };
}
function speak(text, code, rate) {
  if (!("speechSynthesis" in window)) return false;
  try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(lgStrip(text)); var v = voiceFor(code); if (v) u.voice = v; u.lang = code; u.rate = rate || 0.9; speechSynthesis.speak(u); return !!v; } catch (e) { return false; }
}
function listen(code, onResult, onErr) {
  var R = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!R) { onErr("no recognition"); return null; }
  try {
    var r = new R(); r.lang = code; r.interimResults = false; r.maxAlternatives = 3;
    r.onresult = function (e) { var alts = []; for (var i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript); onResult(alts); };
    r.onerror = function (e) { onErr(e.error || "error"); }; r.onend = function () {};
    r.start(); return r;
  } catch (e) { onErr("error"); return null; }
}

/* ---- PokerPro's saved progress, read from the same browser storage ---- */
var POKER_TOTAL_LESSONS = 39;
function pokerRead() {
  var out = { has: false, lessons: 0, due: 0, dueMin: 0, overdue: 0, skills: 0, auto: 0, xp: 0, minutesToday: 0, level: null, streak: 0, hands: 0, quality: null, nextTitle: "", plog: {} };
  try {
    var raw = STORE.get(POKER_KEYS.course); if (!raw) return out;
    var st = JSON.parse(raw); out.has = true;
    out.lessons = Object.keys(st.progress || {}).length;
    var sk = st.skills || {}, now = Date.now(), ids = Object.keys(sk);
    out.skills = ids.length;
    var due = ids.filter(function (id) { return now >= (sk[id].due || 0); });
    out.due = due.length;
    out.dueMin = due.reduce(function (a, id) { var s = sk[id]; return a + (id.indexOf("rule:") === 0 ? 25 : (4 + s.box) * (s.n ? s.secs / s.n + 6 : 20)); }, 0) / 60;
    out.overdue = due.reduce(function (a, id) { return Math.max(a, (now - sk[id].due) / SRS_DAY); }, 0);
    out.auto = ids.filter(function (id) { return sk[id].box >= 6; }).length;
    out.plog = st.plog || {};
    out.xp = gmTotal(out.plog);
    var tk = out.plog[todayKey()]; out.minutesToday = tk ? tk.s / 60 : 0;
    out.streak = gmStreak(out.plog, now).days;
    var sim = STORE.get(POKER_KEYS.sim);
    if (sim) { var S = JSON.parse(sim); if (S.level) { var L = lvSummary(S.level); out.level = L; } if (S.career) { out.hands = S.career.hands || 0; out.quality = S.career.decisions ? S.career.quality : null; } }
  } catch (e) {}
  return out;
}
function pokerRaw() {
  var out = {};
  try { out.course = JSON.parse(STORE.get(POKER_KEYS.course) || "null"); } catch (e) { out.course = null; }
  try { out.game = JSON.parse(STORE.get(POKER_KEYS.game) || "null"); } catch (e) { out.game = null; }
  try { out.sim = JSON.parse(STORE.get(POKER_KEYS.sim) || "null"); } catch (e) { out.sim = null; }
  return out;
}

/* ---- Math 340 and any other school course ---- */
function schoolRead(course) {
  var units = (course.id === "math340" && typeof MATH340 !== "undefined") ? MATH340.units : null;
  var R = schRead(course, STORE.get(course.storeKey), Date.now(), units);
  if (course.id === "math340" && typeof MATH340 !== "undefined") { course.keyDates = MATH340.keyDates; course.termStart = MATH340.course.termStart; }
  return R;
}

/* ---- the level of each track, in one shape: { name, about, index, count, score, toNext, detail } ---- */
function courseLevel(cid) {
  var c = COURSES[cid];
  if (cid === "poker") {
    var P = pokerRead(), lv = P.level;
    if (lv && lv.placed) return { name: lv.level.name, about: lv.level.about, index: lv.level.index, count: LV_LEVELS.length, score: lv.rating, toNext: lv.level.toNext, detail: [["Rating at the table", Math.round(lv.rating)], ["Decisions rated", lv.n], ["Lessons passed", P.lessons + " of " + POKER_TOTAL_LESSONS], ["Skills automatic", P.auto]] };
    return { name: P.lessons ? "Not yet placed" : "Beginner", about: P.lessons ? (lv ? lv.left : 20) + " more graded decisions at the table place you." : "Start with the first lesson, or take PokerPro's placement test.", index: 0, count: LV_LEVELS.length, score: 0, toNext: 0, detail: [["Lessons passed", P.lessons + " of " + POKER_TOTAL_LESSONS]] };
  }
  if (c.kind === "lang") return langLevel(c, { skills: skills, progress: progress, plog: plog, applyScores: applyScores(cid), hours: loggedHours(cid) });
  if (c.kind === "chess") {
    var S = HUB.chess ? chlSummary(HUB.chess) : null, lessons = courseLessonsPassed(c);
    if (S && S.placed) return { name: S.level.name, about: S.level.about, index: S.level.index, count: CHL_LEVELS.length, score: S.rating, toNext: S.level.toNext, detail: [["Move quality (last 100)", Math.round(S.rating)], ["Average centipawn loss", S.acpl != null ? Math.round(S.acpl) : "–"], ["Tactics rating", S.puzzle + " over " + S.puzzles + " puzzles"], ["Games", S.games + ", " + S.wins + " won"], ["Highest level beaten", S.bestLevelBeaten || "–"], ["Lessons passed", lessons + " of " + courseLessonsTotal(c)]] };
    return { name: "Not yet placed", about: (S ? S.left : 20) + " more graded moves against the engine place you. The tactics rating starts at 1000.", index: 0, count: CHL_LEVELS.length, score: 0, toNext: 0, detail: [["Tactics rating", (S ? S.puzzle : 1000) + " over " + (S ? S.puzzles : 0) + " puzzles"], ["Lessons passed", lessons + " of " + courseLessonsTotal(c)]] };
  }
  return { name: "–", about: "", index: 0, count: 1, score: 0, toNext: 0, detail: [] };
}
function applyScores(cid) {
  var A = HUB.apply || {}, out = {};
  ["conv", "read", "listen", "write"].forEach(function (k) { var x = A[cid + ":" + k]; out[k] = x && x.n ? x.sum / x.n : null; });
  return out;
}
function applyRecord(cid, kind, score, extra) {
  var A = HUB.apply || (HUB.apply = {}), k = cid + ":" + kind, x = A[k] || (A[k] = { n: 0, sum: 0, best: 0, last: 0, done: {} });
  x.n++; x.sum += score; x.best = Math.max(x.best, score); x.last = Date.now();
  if (extra && extra.id) x.done[extra.id] = Math.max(x.done[extra.id] || 0, score);
  saveSoon();
}
function loggedHours(cid) { return (HUB.logs || []).filter(function (l) { return l.c === cid; }).reduce(function (a, l) { return a + (l.min || 0); }, 0) / 60; }

/* ---- what every track needs today, for the planner ---- */
function buildDemand() {
  var D = {}, now = Date.now();
  COURSE_ORDER.forEach(function (cid) {
    var c = COURSES[cid], due = dueIds(cid), nx = nextLesson(c), lv = courseLevel(cid);
    var ap = c.apply && c.apply[0];
    D[cid] = { name: c.name, due: due.length, dueMin: dueMinutes(due), overdue: overdueDays(due), level: lv.index,
      lesson: nx ? { id: nx.id, title: nx.title, min: lessonMinutes(nx), href: "#/c/" + cid + "/learn/" + nx.id } : null,
      drill: { href: "#/c/" + cid + "/practice", label: "Practice" },
      apply: ap ? { href: "#/c/" + cid + "/apply", label: c.name + ": " + ap.label, min: ap.min || 15 } : null };
  });
  var P = pokerRead();
  D.poker = { name: "Poker", due: P.due, dueMin: P.dueMin, overdue: P.overdue, level: P.level && P.level.placed ? P.level.level.index : 0,
    lesson: P.lessons < POKER_TOTAL_LESSONS ? { id: "next", title: "Next poker lesson", min: 8, href: "poker/#/learn" } : null,
    drill: { href: "poker/#/practice/review", label: "Reviews" }, apply: { href: "poker/#/play", label: "Poker: play graded hands", min: 15 } };
  SCHOOL_COURSES.forEach(function (sc) {
    var R = schoolRead(sc), dm = schDemand(sc, R, now);
    D["school:" + sc.id] = { name: sc.code, school: true, due: R.due + R.misses, dueMin: dm.items.filter(function (i) { return i.kind === "review"; }).reduce(function (a, i) { return a + i.min; }, 0), overdue: 0, level: 0, lesson: null, drill: { href: sc.href + "#/practice", label: "Practice" }, apply: null, items: dm.items, meta: dm };
  });
  return D;
}
/* school blocks come first and are built from the course's own list, not the generic rule */
function planToday(now) {
  now = now || Date.now();
  var S = HUB.plan, wd = new Date(now).getDay(), key = dayKey(now), D = buildDemand();
  var done = {}; var tk = plog[key]; if (tk && tk.by) Object.keys(tk.by).forEach(function (c) { done[c] = tk.by[c].s / 60; });
  SCHOOL_COURSES.forEach(function (sc) { var R = schoolRead(sc); done["school:" + sc.id] = (R.today || 0) * 0.3; });
  var P = pokerRead(); done.poker = P.minutesToday;
  var general = {}; Object.keys(D).forEach(function (k) { if (!D[k].school) general[k] = D[k]; });
  var plan = plPlan(S, wd, general, done, key);
  /* school first: its own items, at full priority, inside the same budget */
  var school = [];
  Object.keys(D).forEach(function (k) {
    if (!D[k].school) return;
    var pr = S.priority[k] == null ? 4 : S.priority[k]; if (!pr) return;
    D[k].items.forEach(function (it) { school.push({ skill: k, kind: it.kind, min: it.min, label: D[k].name + ": " + it.label, href: it.href, why: it.why, school: true }); });
  });
  var schoolMin = school.reduce(function (a, b) { return a + (b.kind === "homework" ? 0 : b.min); }, 0);
  /* make room: push the generic blocks down until the school work fits the budget */
  var left = plan.left - schoolMin, kept = [], deferred = [];
  plan.blocks.forEach(function (b) { if (b.deferred) { deferred.push(b); return; } if (b.min <= left) { kept.push(b); left -= b.min; } else { b.deferred = true; b.why = "Schoolwork took today's budget; it waits for tomorrow."; deferred.push(b); } });
  var blocks = school.concat(kept).concat(deferred);
  /* place the blocks into the free windows again, school first */
  var wins = plFree(S, wd).map(function (w) { return { f: w.f, t: w.t }; }), wi = 0, cur = wins.length ? wins[0].f : 0;
  var nowMin = new Date(now).getHours() * 60 + new Date(now).getMinutes();
  while (wi < wins.length && wins[wi].t <= nowMin) wi++;
  if (wi < wins.length) cur = Math.max(wins[wi].f, nowMin);
  blocks.forEach(function (b) {
    if (b.deferred) { b.at = null; return; }
    while (wi < wins.length && cur + b.min > wins[wi].t) { wi++; if (wi < wins.length) cur = wins[wi].f; }
    if (wi >= wins.length) { b.at = null; return; }
    b.at = { f: cur, t: cur + b.min }; cur += b.min;
  });
  plan.blocks = blocks; plan.used = schoolMin + kept.reduce(function (a, b) { return a + b.min; }, 0); plan.demand = D; plan.done = done;
  /* a block is done when its track has logged at least its minutes today, or was marked */
  var marks = (HUB.gstate.planDone && HUB.gstate.planDone[key]) || {};
  blocks.forEach(function (b, i) { b.i = i; b.done = !!marks[b.skill + ":" + b.kind] || ((done[b.skill] || 0) >= b.min && b.kind !== "homework" && b.kind !== "lesson"); if (b.kind === "lesson" && b.id && D[b.skill] && D[b.skill].lesson && D[b.skill].lesson.id !== b.id) b.done = true; });
  return plan;
}
function planMark(b) {
  var key = todayKey(), PD = HUB.gstate.planDone || (HUB.gstate.planDone = {}), m = PD[key] || (PD[key] = {});
  m[b.skill + ":" + b.kind] = !m[b.skill + ":" + b.kind];
  Object.keys(PD).forEach(function (k) { if (k < dayKey(Date.now() - 7 * SRS_DAY)) delete PD[k]; });
  saveSoon();
}
function planRemember(plan) {
  var key = todayKey();
  if (HUB.gstate.planLast !== key) { HUB.gstate.planLast = key; plNote(HUB.plan, key, plan.blocks.filter(function (b) { return !b.deferred; })); saveSoon(); }
}
