/* ============================================================
   CORE: the course registry and the skill model
   Every track (chess, Swedish, Hebrew, a school course) registers
   itself here with the same shape, and the shell treats them
   alike: a path of stages, lessons made of blocks, drills that
   generate questions, words and rules that live on the schedule,
   reference cards, a glossary, a reading list, ranks, and a level.
   Poker and Math 340 are full apps of their own; they register
   through a bridge that reads their saved progress (school.js).
   ============================================================ */

var COURSES = {}, COURSE_ORDER = [];

function registerCourse(c) {
  c.stages = []; c.lessonList = []; c.lessonById = {};
  Object.keys(c.lessons || {}).forEach(function (id) { c.lessons[id].course = c.id; });
  (c.path || []).forEach(function (S, n) {
    var ls = (S.ids || []).map(function (id) {
      var L = c.lessons[id];
      if (!L) throw new Error(c.id + ": path names a missing lesson " + id);
      return L;
    });
    ls.forEach(function (L, i) { L.layer = n; L.idx = i; L.of_n = ls.length; c.lessonList.push(L); c.lessonById[L.id] = L; });
    c.stages.push({ n: n, title: S.title, sub: S.sub, blurb: S.blurb, lessons: ls });
  });
  /* vocabulary sets become items, each its own skill */
  c.words = {}; c.wordById = {};
  if (c.vocab) Object.keys(c.vocab).forEach(function (lid) {
    c.words[lid] = c.vocab[lid].map(function (row, i) { var it = lgItem(c.lang, lid, i, row); c.wordById[it.id] = it; return it; });
  });
  c.drills = c.drills || {};
  COURSES[c.id] = c;
  if (COURSE_ORDER.indexOf(c.id) < 0) COURSE_ORDER.push(c.id);
  return c;
}
function courseOf(id) { return COURSES[id]; }
function lessonOf(cid, lid) { var c = COURSES[cid]; return c && c.lessonById[lid] || null; }
function passable(L) { return L.mode && L.mode !== "none"; }
function lessonMinutes(L) {
  var chars = 0;
  (L.blocks || []).forEach(function (b) {
    [b.x, b.note, b.caption, b.punch, b.tip, b.ask].forEach(function (t) { if (t) chars += String(t).length; });
    (b.steps || []).forEach(function (t) { chars += t.length; });
    (b.rows || []).forEach(function (r) { chars += r.join(" ").length; });
    if (b.t === "verse") chars += 600;
  });
  return Math.max(2, Math.round(chars / 5 / 190));
}

/* ---- skills: every drill, word, rule and quiz has an id and a schedule entry ----
   ids: "<course>:<drill>" · "<course>:w:<lesson>:<i>" · "rule:<course>:<lesson>" · "<course>:q:<lesson>" */
function ruleOf(L) { var k = (L.blocks || []).filter(function (b) { return b.t === "key"; })[0]; return k ? k.x : null; }
function lessonSkillIds(c, L) {
  var out = [];
  if (!passable(L)) return out;
  if (L.mode.indexOf("words:") === 0) (c.words[L.mode.slice(6)] || []).forEach(function (it) { out.push(it.id); });
  else if (L.mode === "quiz") out.push(c.id + ":q:" + L.id);
  else if (L.mode !== "mixed" && c.drills[L.mode]) out.push(c.id + ":" + L.mode);
  if (ruleOf(L)) out.push("rule:" + c.id + ":" + L.id);
  return out;
}
/* what a skill id is: course, kind, display name, target seconds, its lesson, and a generator */
var SK_CACHE = {};
function skInfo(id) {
  if (SK_CACHE[id]) return SK_CACHE[id];
  var info = null, m;
  if ((m = id.match(/^rule:([^:]+):(.+)$/))) {
    var c0 = COURSES[m[1]], L0 = c0 && c0.lessonById[m[2]];
    if (L0) info = { id: id, course: m[1], kind: "rule", name: "Recall: " + L0.title, target: 25, lesson: L0, text: ruleOf(L0) };
  } else if ((m = id.match(/^([^:]+):w:([^:]+):(\d+)$/))) {
    var c1 = COURSES[m[1]], it = c1 && c1.wordById[id];
    if (it) info = { id: id, course: m[1], kind: "word", name: it.w + " · " + it.g, target: 8, lesson: c1.lessonById[it.lesson], item: it };
  } else if ((m = id.match(/^([^:]+):q:(.+)$/))) {
    var c2 = COURSES[m[1]], L2 = c2 && c2.lessonById[m[2]];
    if (L2 && L2.quiz) info = { id: id, course: m[1], kind: "quiz", name: "Reader: " + L2.title, target: 20, lesson: L2 };
  } else if ((m = id.match(/^([^:]+):(.+)$/))) {
    var c3 = COURSES[m[1]], d = c3 && c3.drills[m[2]];
    if (d) {
      var LL = c3.lessonList.filter(function (L) { return L.mode === m[2]; })[0] || null;
      info = { id: id, course: m[1], kind: "drill", name: d.name, target: d.target || 10, lesson: LL, drill: d, mode: m[2] };
    }
  }
  if (info) SK_CACHE[id] = info;
  return info;
}
function isSkillId(id) { return !!skInfo(id); }
function skillName(id) { var i = skInfo(id); return i ? i.name : id; }
function skillTarget(id) { var i = skInfo(id); return i ? i.target : 10; }

/* make a question for a skill. ctx: { caps, rnd, box } */
function skQuestion(id, ctx) {
  var i = skInfo(id); if (!i) return null;
  var c = COURSES[i.course], q;
  ctx = ctx || {}; ctx.rnd = ctx.rnd || Math.random;
  if (i.kind === "word") q = lgWordQ(i.item, ctx.box || 0, c.words[i.item.lesson], ctx.caps, ctx.rnd);
  else if (i.kind === "rule") q = { kind: "recall", question: "Say the rule from <b>" + i.lesson.title + "</b> out loud, then reveal it.", answer: i.text, target: 25, explain: [], rule: i.text };
  else if (i.kind === "quiz") { var qq = i.lesson.quiz[(ctx.rnd() * i.lesson.quiz.length) | 0]; q = { kind: "choice", question: qq.q, options: qq.options.slice(), answer: qq.answer, target: 20, explain: [qq.explain || ("<b>" + qq.answer + "</b>")], rtl: c.lang === "he" }; }
  else q = i.drill.gen(ctx);
  q.skill = id; q.course = i.course;
  if (q.target == null) q.target = i.target;
  if (q.rtl == null && c.lang === "he") q.rtl = true;
  return q;
}
/* checkpoint questions for a lesson: from its drill, its words, its quiz, or the stage's drills when mixed */
function cpQuestion(c, L, ctx, asked) {
  ctx = ctx || {}; ctx.rnd = ctx.rnd || Math.random;
  if (L.mode.indexOf("words:") === 0) { var q = lgLessonQ(c.words[L.mode.slice(6)], c.words[L.mode.slice(6)], ctx.caps, ctx.rnd); q.skill = q.item.id; q.course = c.id; return q; }
  if (L.mode === "quiz") {
    var left = L.quiz.filter(function (x, i) { return (asked || []).indexOf(i) < 0; });
    var pool = left.length ? left : L.quiz, qi = pool[(ctx.rnd() * pool.length) | 0];
    var qq = { kind: "choice", question: qi.q, options: qi.options.slice(), answer: qi.answer, target: 30, explain: [qi.explain || ("<b>" + qi.answer + "</b>")], rtl: c.lang === "he", qi: L.quiz.indexOf(qi), skill: c.id + ":q:" + L.id, course: c.id };
    return qq;
  }
  if (L.mode === "mixed") {
    var modes = c.stages[L.layer].lessons.map(function (x) { return x.mode; }).filter(function (m) { return c.drills[m]; });
    var mode = modes[(ctx.rnd() * modes.length) | 0];
    return skQuestion(c.id + ":" + mode, ctx);
  }
  return skQuestion(c.id + ":" + L.mode, ctx);
}

/* grade an answer against a question */
function gradeAnswer(q, raw, lang) {
  if (q.kind === "choice" || q.kind === "recall") return { ok: raw === q.answer, said: raw };
  if (q.kind === "num") { var v = parseFloat(String(raw).replace(/[^0-9.\-]/g, "")); if (!isFinite(v)) return null; return { ok: Math.abs(v - q.answer) <= (q.tol || 0), said: v }; }
  if (q.kind === "text" || q.kind === "speak") {
    var ok = lgMatch(raw, q.accept || [q.answer], lang);
    var near = !ok && lgDistance(lgNorm(raw, lang), lgNorm(q.answer, lang)) === 1;
    return { ok: ok, said: raw, near: near };
  }
  if (q.kind === "square" || q.kind === "move") return { ok: raw === q.answer || (q.accept || []).indexOf(raw) >= 0, said: raw };
  return { ok: false, said: raw };
}

/* ---- ranks, overall and per course ---- */
var SB_RANKS = [
  { xp: 0, name: "Novice" }, { xp: 500, name: "Student" }, { xp: 1500, name: "Practitioner" }, { xp: 4000, name: "Adept" },
  { xp: 8000, name: "Expert" }, { xp: 15000, name: "Master" }, { xp: 30000, name: "Polymath" }
];
function rankIn(ranks, total) {
  var i = 0;
  while (i + 1 < ranks.length && total >= ranks[i + 1].xp) i++;
  var R = ranks[i], N = ranks[i + 1] || null;
  return { index: i, name: R.name, xp: R.xp, next: N, toNext: N ? (total - R.xp) / (N.xp - R.xp) : 1, need: N ? N.xp - total : 0 };
}
/* XP per course lives in the day log: plog[day].by[course] = { s, n, ok, x } */
function xpOf(plog, cid) {
  var t = 0;
  Object.keys(plog || {}).forEach(function (k) { var b = plog[k].by && plog[k].by[cid]; if (b) t += b.x || 0; });
  return t;
}
function minutesOf(plog, cid, dayKey) {
  var t = 0;
  Object.keys(plog || {}).forEach(function (k) { if (dayKey && k !== dayKey) return; var b = plog[k].by && plog[k].by[cid]; if (b) t += b.s || 0; });
  return t / 60;
}

/* ---- the level of a language course, from the schedule and the logs ---- */
function langLevel(c, st) {
  var ids = [], known = 0, auto = 0;
  Object.keys(c.words).forEach(function (lid) { c.words[lid].forEach(function (it) { ids.push(it.id); }); });
  ids.forEach(function (id) { var s = st.skills[id]; if (s && s.box >= 3) known++; if (s && s.box >= 5) auto++; });
  var gram = c.lessonList.filter(function (L) { return passable(L) && !L.vocab && L.mode !== "quiz"; });
  var gp = gram.filter(function (L) { return st.progress[c.id + ":" + L.id]; }).length;
  var A = st.applyScores || {};
  var lv = lgLevel({ known: known, auto: auto, grammarPassed: gp, grammarTotal: gram.length, conv: A.conv, read: A.read, listen: A.listen, write: A.write, hours: (st.hours || 0) + minutesOf(st.plog, c.id) / 60, need: c.need || 700 });
  lv.detail = [["Words known (box 3+)", known + " of " + ids.length], ["Words automatic (box 5+)", auto], ["Grammar lessons passed", gp + " of " + gram.length], ["Conversation", A.conv == null ? "–" : Math.round(100 * A.conv) + "%"], ["Reading", A.read == null ? "–" : Math.round(100 * A.read) + "%"], ["Listening", A.listen == null ? "–" : Math.round(100 * A.listen) + "%"], ["Writing", A.write == null ? "–" : Math.round(100 * A.write) + "%"], ["Hours (study + logged)", Math.round(((st.hours || 0) + minutesOf(st.plog, c.id) / 60) * 10) / 10 + " of " + (c.need || 700)]];
  lv.count = LG_CEFR.length;
  return lv;
}

/* ---- trophies shared by every course; each course may add its own ---- */
function sbTrophies(s) {
  var T = [];
  function add(id, name, about, cur, max) { T.push({ id: id, name: name, about: about, cur: Math.min(cur, max), max: max, got: cur >= max }); }
  add("first", "First checkpoint", "Pass your first lesson checkpoint, in any skill.", s.lessons || 0, 1);
  add("four", "Four fronts", "Pass a checkpoint in four different skills.", s.coursesStarted || 0, 4);
  add("streak3", "Warming up", "Hit your daily goal 3 days running.", s.bestStreak || 0, 3);
  add("streak7", "One week", "A 7-day goal streak. It earns your first streak freeze.", s.bestStreak || 0, 7);
  add("streak30", "Habit", "A 30-day goal streak.", s.bestStreak || 0, 30);
  add("streak100", "Unshakeable", "A 100-day goal streak.", s.bestStreak || 0, 100);
  add("solid1", "It sticks", "Get a skill to solid: three spaced reviews passed.", s.atLeast3 || 0, 1);
  add("auto1", "Second nature", "Get a skill to automatic: right and fast, months apart.", s.atLeast6 || 0, 1);
  add("auto25", "Autopilot", "Twenty-five skills automatic.", s.atLeast6 || 0, 25);
  add("words100", "A hundred words", "Know 100 words (box 3+) across your languages.", s.wordsKnown || 0, 100);
  add("words500", "Five hundred words", "Know 500 words across your languages.", s.wordsKnown || 0, 500);
  add("ans100", "Hundred reps", "Answer 100 questions.", s.answers || 0, 100);
  add("ans1000", "Thousand reps", "Answer 1,000 questions.", s.answers || 0, 1000);
  add("plan7", "On schedule", "Finish the day's plan 7 days in a row.", s.planStreak || 0, 7);
  add("chessWin", "Checkmate", "Beat the engine at any level.", s.chessWins || 0, 1);
  add("chess1500", "Club player", "Reach a 1500 tactics rating.", (s.chessPuzzle || 0) >= 1500 ? 1 : 0, 1);
  add("conv1", "Said it", "Finish a conversation scenario at 80% or better.", s.convs || 0, 1);
  add("bible", "In the beginning", "Pass the Genesis 1 reading.", s.genesis || 0, 1);
  add("sweep", "Clean sweep", "Finish a review session of 10+ answers at 90% or better.", s.sweeps || 0, 1);
  add("school", "Straight A", "Clear every due flashcard and the redo queue in a school course on the same day.", s.schoolClear || 0, 1);
  return T;
}

if (typeof module !== "undefined") module.exports = {
  COURSES: COURSES, COURSE_ORDER: COURSE_ORDER, registerCourse: registerCourse, courseOf: courseOf, lessonOf: lessonOf, passable: passable, lessonMinutes: lessonMinutes,
  ruleOf: ruleOf, lessonSkillIds: lessonSkillIds, skInfo: skInfo, isSkillId: isSkillId, skillName: skillName, skillTarget: skillTarget, skQuestion: skQuestion, cpQuestion: cpQuestion,
  gradeAnswer: gradeAnswer, SB_RANKS: SB_RANKS, rankIn: rankIn, xpOf: xpOf, minutesOf: minutesOf, langLevel: langLevel, sbTrophies: sbTrophies
};
