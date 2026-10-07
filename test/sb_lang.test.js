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

/* ---- course structure: no lesson id is registered twice, every word set has exactly one vocabulary lesson ---- */
["sv", "he", "es"].forEach(function (cid) {
  var c = ctx.COURSES[cid], seen = {};
  c.lessonList.forEach(function (L) { ok(!seen[L.id], cid + " lesson id listed twice: " + L.id); seen[L.id] = 1; });
  var src = fs.readFileSync(path.join(__dirname, "../sb", cid + "_course.js"), "utf8"), adds = {}, m, re = /add\((?:vocabLesson\()?\{?\s*(?:id: )?"([a-z0-9_]+)"/g;
  while ((m = re.exec(src))) { ok(!adds[m[1]], cid + " add() overwrites lesson " + m[1]); adds[m[1]] = 1; }
  var byLesson = {};
  c.lessonList.forEach(function (L) { if (L.mode && L.mode.indexOf("words:") === 0) { var w = L.mode.slice(6); byLesson[w] = (byLesson[w] || 0) + 1; } });
  Object.keys(c.vocab).forEach(function (w) { ok(byLesson[w] === 1, cid + " word set " + w + " has " + (byLesson[w] || 0) + " vocabulary lessons"); });
  /* every data row has the expected number of columns */
  var cols = cid === "he" ? 7 : 6;
  Object.keys(c.vocab).forEach(function (w) { c.vocab[w].forEach(function (r, i) { ok(r.length === cols, cid + " " + w + "[" + i + "] (" + r[0] + ") has " + r.length + " columns, expected " + cols); }); });
});
ok(ctx.COURSES.sv.lessonById.sv_verbs && ctx.COURSES.sv.lessonById.sv_verbs.vocab && ctx.COURSES.sv.lessonById.sv_v2 && !ctx.COURSES.sv.lessonById.sv_v2.vocab, "sv: the verb vocabulary and the verb-second lesson are both registered");
ok(ctx.COURSES.sv.stages[1].lessons.some(function (L) { return L.id === "sv_verbs"; }) && ctx.COURSES.sv.stages[2].lessons.some(function (L) { return L.id === "sv_v2"; }), "sv: stage 1 holds the verbs, stage 2 holds verb second");

/* ---- conversation: every model answer passes its own turn; literal patterns match whole words ---- */
["sv", "he", "es"].forEach(function (cid) {
  var c = ctx.COURSES[cid];
  c.dialogues.forEach(function (d) { d.turns.forEach(function (t, i) { if (t.expect) ok(ctx.lgTurnOk(t, t.model, c.lang), cid + " " + d.id + " turn " + i + " model answer passes: " + t.model); }); });
});
var hockey = ctx.COURSES.sv.dialogues[0].turns[3];
ok(ctx.lgTurnOk(hockey, "Ja, jag spelar hockey", "sv"), "sv hockey yes-turn passes a yes");
ok(!ctx.lgTurnOk(hockey, "Nej, jag spelar inte hockey", "sv"), "sv hockey yes-turn rejects 'Nej, jag spelar inte hockey'");
ok(!ctx.lgTurnOk({ expect: ["ja"] }, "Jag bor här", "sv"), "'ja' does not match inside 'jag'");
ok(!ctx.lgTurnOk({ expect: ["te"] }, "Jag vill inte", "sv") && ctx.lgTurnOk({ expect: ["te"] }, "En te, tack!", "sv"), "'te' does not match inside 'inte' but matches the word");
ok(!ctx.lgTurnOk({ expect: ["no"] }, "Buenas noches", "es") && ctx.lgTurnOk({ expect: ["no"] }, "No, gracias", "es"), "'no' does not match inside 'noche'");
ok(!ctx.lgTurnOk({ expect: ["מ"] }, "אני מקנדה", "he"), "a bare Hebrew letter does not match inside a word");
ok(ctx.lgTurnOk({ expect: ["קוראים לי"] }, "קוראים לי אריק", "he") && ctx.lgTurnOk({ expect: ["כן"] }, "כן, קצת", "he"), "Hebrew final letters in patterns match the folded reply");
ok(ctx.lgTurnOk({ expect: ["^כן"] }, "כן", "he") && !ctx.lgTurnOk({ expect: ["^כן"] }, "לא, כן", "he"), "Hebrew regex patterns keep their anchor and fold finals");

/* ---- cloze: the gap sits on a word boundary, inflected forms are blanked whole and accepted ---- */
var b1 = ctx.lgBlank("Jag går hem nu.", "gå", "sv");
ok(b1 && b1.text === "Jag ____ hem nu." && b1.found === "går", "cloze gå -> går blanked whole, got " + JSON.stringify(b1));
var b2 = ctx.lgBlank("A pesar del frío, entrené.", "a pesar de", "es");
ok(b2 && b2.text === "____ frío, entrené." && b2.found === "A pesar del", "cloze 'a pesar de' blanks the whole phrase, got " + JSON.stringify(b2));
var b3 = ctx.lgBlank("בְּרֵאשִׁית בָּרָא אֱלֹהִים", "בָּרָא", "he");
ok(b3 && b3.text === "בראשית ____ אלהים" && b3.found === "ברא", "cloze bara does not land inside bereshit, got " + JSON.stringify(b3));
ok(ctx.lgBlank("Hon är här.", "han", "sv") === null, "cloze returns null when the word is absent");
var gaItem = ctx.COURSES.sv.words.sv_verbs.filter(function (it) { return it.w === "gå"; })[0];
var gaQ = ctx.lgWordQ(gaItem, 4, ctx.COURSES.sv.words.sv_verbs, {}, rnd);
ok(gaQ.type === "cloze" && ctx.gradeAnswer(gaQ, "går", "sv").ok && ctx.gradeAnswer(gaQ, "gå", "sv").ok && !ctx.gradeAnswer(gaQ, "gick", "sv").ok, "cloze for gå accepts går and gå");

/* ---- choice questions: options are distinct and hold the answer exactly once ---- */
function checkChoice(q, where) {
  if (!q || q.kind !== "choice") return;
  var seen = {}, dup = false, hits = 0;
  q.options.forEach(function (o) { var k = ctx.lgNorm(o, q.lang) || String(o).toLowerCase(); if (seen[k]) dup = true; seen[k] = 1; if (o === q.answer) hits++; });
  ok(!dup && hits === 1 && q.options.length >= 2, where + " options distinct with the answer once: " + q.options.join(" | ") + " vs " + q.answer);
}
["sv", "he", "es"].forEach(function (cid) {
  var c = ctx.COURSES[cid];
  Object.keys(c.drills).forEach(function (m) { for (var k = 0; k < 60; k++) checkChoice(ctx.skQuestion(cid + ":" + m, { caps: { tts: k % 2 === 0, asr: k % 3 === 0 }, rnd: rnd, box: k % 7 }), cid + " drill " + m); });
  Object.keys(c.words).forEach(function (lid) { c.words[lid].forEach(function (it) { for (var b = 0; b <= 7; b++) checkChoice(ctx.skQuestion(it.id, { caps: { tts: true, asr: true }, rnd: rnd, box: b }), "word " + it.id + " box " + b); }); });
  c.lessonList.forEach(function (L) { if (ctx.passable(L)) for (var k = 0; k < 6; k++) checkChoice(ctx.cpQuestion(c, L, { caps: {}, rnd: rnd }), cid + " checkpoint " + L.id); });
});
ok(ctx.lgFormQ({ cols: ["w", "f"], rows: [["a", "x"], ["b", "x"], ["c", "x"]], ask: [1], choice: true }, "sv", rnd).kind === "text", "a table with one distinct form falls back to a typed question");

/* ---- the level model: monotone in words, C2 reachable, A0 without NaN ---- */
["sv", "he", "es"].forEach(function (cid) {
  var c = ctx.COURSES[cid], ids = [];
  Object.keys(c.words).forEach(function (lid) { c.words[lid].forEach(function (it) { ids.push(it.id); }); });
  var lv0 = ctx.langLevel(c, { skills: {}, progress: {}, plog: {} });
  ok(lv0.name === "A0" && lv0.score === 0 && !isNaN(lv0.toNext), cid + " empty state is A0 at zero");
  var sk = {}, pr = {};
  ids.forEach(function (id) { sk[id] = { box: 7 }; }); c.lessonList.forEach(function (L) { pr[cid + ":" + L.id] = 1; });
  var top = ctx.langLevel(c, { skills: sk, progress: pr, plog: {}, applyScores: { conv: 1, read: 1, listen: 1, write: 1 }, hours: c.need });
  ok(top.name === "C2" && top.score >= 95, cid + " everything done reaches C2, got " + top.name + " " + Math.round(top.score));
  /* promote any single word by one box from a mixed state: the score never falls */
  var mixed = {}; ids.forEach(function (id, i) { mixed[id] = { box: i % 8 }; });
  var base = ctx.langLevel(c, { skills: mixed, progress: {}, plog: {} }).score, falls = 0;
  ids.forEach(function (id) { var was = mixed[id].box; if (was >= 7) return; mixed[id] = { box: was + 1 }; if (ctx.langLevel(c, { skills: mixed, progress: {}, plog: {} }).score < base - 1e-9) falls++; mixed[id] = { box: was }; });
  ok(falls === 0, cid + " promoting a word never lowers the level (" + falls + " drops)");
  for (var k = 0; k < 40; k++) { var a = ctx.lgLevelScore({ known: k, auto: 0, total: 40 }), bb = ctx.lgLevelScore({ known: k + 1, auto: 0, total: 40 }), cc = ctx.lgLevelScore({ known: 40, auto: k, total: 40 }), dd = ctx.lgLevelScore({ known: 40, auto: k + 1, total: 40 }); ok(bb >= a && dd >= cc, cid + " score monotone in known and automatic counts at " + k); }
});

/* ---- normalisation: maqaf, Spanish and dash punctuation, NFC ---- */
ok(ctx.lgNorm("בֵּית־סֵפֶר", "he") === "בית ספר", "maqaf becomes a space, got " + JSON.stringify(ctx.lgNorm("בֵּית־סֵפֶר", "he")));
ok(ctx.lgNorm("¿Dónde está? ¡Hola!", "es") === "dónde está hola", "inverted marks are stripped");
ok(ctx.lgNorm("Vi vann – 3–2 — ja", "sv") === "vi vann 3 2 ja", "en and em dashes are stripped");
ok(ctx.lgNorm("café", "es") === ctx.lgNorm("café", "es") && ctx.lgMatch("café", "café", "es"), "NFC: a decomposed accent equals the precomposed letter");
ok(ctx.lgNumberWords("sv", 1000) === "ettusen" && ctx.lgNumberWords("sv", 2000) === "tvåtusen" && ctx.lgNumberWords("sv", 1500) === "ettusen femhundra", "1000 is ettusen");
ok(ctx.lgMatch("sade", "sade / sa", "sv") && ctx.lgMatch("sa", "sade / sa", "sv") && ctx.lgMatch("lade", "lade / la", "sv"), "säga and lägga accept the standard and the colloquial past");
console.log("lang: " + (n - fails) + "/" + n + " passed");
if (fails) process.exit(1);
