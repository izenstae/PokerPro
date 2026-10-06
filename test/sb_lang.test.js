/* The language engine and both language courses: every lesson resolves, every drill generates a gradable question, the level model moves. */
var vm = require("vm"), fs = require("fs"), path = require("path");
var ctx = { console: console, Math: Math, Date: Date, String: String, Object: Object, Array: Array, RegExp: RegExp, JSON: JSON, Number: Number, parseFloat: parseFloat, parseInt: parseInt, isFinite: isFinite, Error: Error, Intl: Intl };
vm.createContext(ctx);
["lang.js", "core.js", "sv_data.js", "sv_course.js", "he_data.js", "he_data2.js", "he_course.js", "es_data.js", "es_course.js"].forEach(function (f) {
  var src = fs.readFileSync(path.join(__dirname, "../sb", f), "utf8").replace(/\nif \(typeof module[\s\S]*$/, "");
  vm.runInContext(src, ctx, { filename: f });
});
var n = 0, fails = 0;
function ok(c, m) { n++; if (!c) { fails++; console.log("  FAIL " + m); } }
var rnd = (function () { var s = 12345; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })();

["sv", "he", "es"].forEach(function (cid) {
  var c = ctx.COURSES[cid];
  ok(c && c.stages.length >= 8, cid + " registered with stages");
  var words = 0; Object.keys(c.words).forEach(function (k) { words += c.words[k].length; });
  ok(words >= 400, cid + " has " + words + " words");
  c.lessonList.forEach(function (L) {
    ok(L.blocks && L.blocks.length, cid + " lesson " + L.id + " has blocks");
    if (!ctx.passable(L)) return;
    var ids = ctx.lessonSkillIds(c, L);
    ok(ids.length > 0, cid + " lesson " + L.id + " has skills");
    ids.forEach(function (id) { ok(ctx.skInfo(id), "skill resolves: " + id); });
    for (var k = 0; k < 12; k++) {
      var q = ctx.cpQuestion(c, L, { caps: { tts: k % 2 === 0, asr: k % 3 === 0 }, rnd: rnd });
      ok(q && q.kind && q.question && q.answer != null, cid + " " + L.id + " checkpoint question " + k);
      if (q.kind === "choice") ok(q.options.indexOf(q.answer) >= 0 && q.options.length >= 2, cid + " " + L.id + " choice has the answer among options");
      var g = ctx.gradeAnswer(q, q.answer, c.lang);
      ok(g && g.ok, cid + " " + L.id + " the right answer grades right (" + q.kind + ")");
    }
  });
  /* every word at every box */
  Object.keys(c.words).forEach(function (lid) { c.words[lid].forEach(function (it) {
    for (var b = 0; b <= 7; b += 1) {
      var q = ctx.skQuestion(it.id, { caps: { tts: true, asr: true }, rnd: rnd, box: b });
      ok(q && q.answer != null, "word q " + it.id + " box " + b);
      if (q.kind !== "speak") ok(ctx.gradeAnswer(q, q.answer, c.lang).ok, "word q right answer ok " + it.id + " box " + b);
    }
  }); });
  /* every drill, with and without speech */
  Object.keys(c.drills).forEach(function (m) {
    for (var k = 0; k < 40; k++) {
      var q = ctx.skQuestion(cid + ":" + m, { caps: { tts: k % 2 === 0, asr: k % 3 === 0 }, rnd: rnd, box: k % 7 });
      ok(q && q.answer != null && q.question, "drill " + m + " q " + k);
      if (q.kind === "choice") ok(q.options.indexOf(q.answer) >= 0, "drill " + m + " answer among options: " + q.options.join("|") + " vs " + q.answer);
      ok(ctx.gradeAnswer(q, q.answer, c.lang).ok, "drill " + m + " right answer grades right");
    }
  });
  /* rules */
  c.lessonList.forEach(function (L) { var r = "rule:" + cid + ":" + L.id; if (ctx.ruleOf(L)) ok(ctx.skQuestion(r, {}).kind === "recall", "rule card " + L.id); });
  var lv0 = ctx.langLevel(c, { skills: {}, progress: {}, plog: {} });
  ok(lv0.name === "A0", cid + " starts at A0, got " + lv0.name);
  var sk = {}; Object.keys(c.words).forEach(function (lid) { c.words[lid].forEach(function (it) { sk[it.id] = { box: 4 }; }); });
  var pr = {}; c.lessonList.forEach(function (L) { pr[cid + ":" + L.id] = 1; });
  var lv1 = ctx.langLevel(c, { skills: sk, progress: pr, plog: {}, applyScores: { conv: 0.9, read: 0.9, listen: 0.8, write: 0.8 }, hours: 400 });
  ok(lv1.index >= 3, cid + " all words + grammar + use + 400h reaches B1 or more, got " + lv1.name + " " + Math.round(lv1.score));
});
/* Hebrew matching ignores points and finals */
ok(ctx.lgMatch("שלום", "שָׁלוֹם", "he") && ctx.lgMatch("מלכ", "מֶלֶךְ", "he"), "hebrew normalisation");
ok(!ctx.lgMatch("tak", "tack", "sv") && ctx.lgMatch("Jag är trött", "jag är trött.", "sv"), "swedish strictness and leniency");
console.log("lang: " + (n - fails) + "/" + n + " passed");
if (fails) process.exit(1);
