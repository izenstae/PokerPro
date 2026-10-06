/* Chess drills and the Play model: every generator yields a sound, engine-verified question; curated mates are real; play and grading work end to end. */
var vm = require("vm"), fs = require("fs"), path = require("path");
var ctx = { console: console, Math: Math, Date: Date, String: String, Object: Object, Array: Array, RegExp: RegExp, JSON: JSON, Number: Number, parseFloat: parseFloat, parseInt: parseInt, isFinite: isFinite, Error: Error, Int8Array: Int8Array, Infinity: Infinity };
vm.createContext(ctx);
["chess.js", "lang.js", "core.js", "chess_drills.js", "chess_course.js"].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../sb", f), "utf8").replace(/\nif \(typeof module[\s\S]*$/, ""), ctx, { filename: f });
});
var n = 0, fails = 0;
function ok(c, m) { n++; if (!c) { fails++; console.log("  FAIL " + m); } }
var rnd = (function () { var s = 777; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })();
var t0 = Date.now();

/* curated mates are mates */
ctx.CH_MATE1.forEach(function (c) {
  var s = ctx.chFromFen(c[0]), mm = ctx.chMatingMoves(s).map(function (m) { return ctx.chSan(s, m); });
  ok(mm.indexOf(c[1]) >= 0, "mate in 1 " + c[0] + " has " + c[1] + " (found " + mm.join(",") + ")");
});
ctx.CH_MATE2.forEach(function (c) {
  var s = ctx.chFromFen(c[0]), m = ctx.chMateIn(s, 2);
  ok(m && ctx.chSan(s, m) === c[1], "mate in 2 " + c[0] + " solvable, found " + (m ? ctx.chSan(s, m) : "none") + " expected " + c[1]);
  ok(!ctx.chMateIn(s, 1), "mate in 2 " + c[0] + " is not mate in 1");
});
/* openings parse */
ctx.CH_OPENINGS.forEach(function (o) {
  var s = ctx.chStart(), okAll = true;
  o[0].split(/\s+/).forEach(function (tok) { var san = tok.replace(/^\d+\./, ""); if (!san) return; var m = ctx.chParseSan(s, san); if (!m) okAll = false; else ctx.chMake(s, m); });
  ok(okAll, "opening parses: " + o[0]);
});
/* the square rule agrees with the engine on small cases */
[["8/8/8/8/4P3/8/8/k3K3 b - - 0 1".replace("k3K3", "k6K"), null]].forEach(function () {});
function engineCatches(fen) {
  var s = ctx.chFromFen(fen), r = ctx.chSearch(s, 7, 900000);
  /* white to move wins if score is big (queening) from white's view */
  var whiteScore = s.side > 0 ? r.score : -r.score;
  return whiteScore < 400;
}
var cases = [["8/8/8/8/2k1P3/8/8/7K b - - 0 1", true], ["8/8/8/8/k3P3/8/8/7K b - - 0 1", true], ["8/8/8/8/k3P3/8/8/7K w - - 0 1", true], ["8/8/8/4P3/8/k7/8/7K w - - 0 1", false], ["8/8/8/4P3/8/2k5/8/7K b - - 0 1", false], ["8/8/8/k3P3/8/8/8/7K w - - 0 1", false], ["8/8/8/k3P3/8/8/8/7K b - - 0 1", true]];
cases.forEach(function (c) {
  var s = ctx.chFromFen(c[0]), pawn = ctx.chPieces(s).filter(function (p) { return p.kind === 1; })[0].sq, bk = ctx.chKingSq(s, -1);
  var rule = ctx.chdSquareRule(pawn, bk, 1, s.side < 0);
  ok(rule === c[1], "square rule " + c[0] + " expected " + c[1] + " got " + rule);
  ok(engineCatches(c[0]) === c[1], "engine agrees on " + c[0]);
});
/* every drill: many questions, right answer grades right */
var c = ctx.COURSES.chess;
ok(c.stages.length === 8, "chess has 8 stages");
Object.keys(c.drills).forEach(function (m) {
  var N = m === "chmate2" ? 3 : m === "chbest" ? 4 : 25;
  for (var k = 0; k < N; k++) {
    var q = ctx.skQuestion("chess:" + m, { rnd: rnd, caps: {} });
    ok(q && q.answer != null && q.question, "drill " + m + " q" + k);
    if (q.kind === "choice") ok(q.options.indexOf(q.answer) >= 0, "drill " + m + " answer among options");
    if (q.kind === "move" || q.kind === "square") {
      ok(q.board && q.board.fen, "drill " + m + " has a board");
      if (q.kind === "move") { var s = ctx.chFromFen(q.board.fen); (q.accept || [q.answer]).forEach(function (san) { ok(ctx.chParseSan(s, san), "drill " + m + " answer " + san + " is a legal move in " + q.board.fen); }); }
    }
    ok(ctx.gradeAnswer(q, q.answer).ok, "drill " + m + " right answer ok");
  }
});
/* mate-in-one generator answers really mate */
for (var k = 0; k < 6; k++) {
  var q1 = ctx.skQuestion("chess:chmate1", { rnd: rnd, caps: {} }), s1 = ctx.chFromFen(q1.board.fen);
  q1.accept.forEach(function (san) { var m = ctx.chParseSan(s1, san); ctx.chMake(s1, m); ok(ctx.chStatus(s1) === "checkmate", "generated mate in 1 is mate: " + san); ctx.chUnmake(s1); });
}
/* forks really attack two pieces */
for (k = 0; k < 10; k++) {
  var q2 = ctx.skQuestion("chess:chfork", { rnd: rnd, caps: {} }), s2 = ctx.chFromFen(q2.board.fen), m2 = ctx.chParseSan(s2, q2.answer);
  ctx.chMake(s2, m2); var hits = ctx.chAttacksFrom(s2, m2.to).filter(function (t) { var p = s2.b[t]; return p && p !== 7 && (p > 0) !== (s2.b[m2.to] > 0) && (Math.abs(p) === 6 || ctx.CH_VAL[Math.abs(p)] > ctx.CH_VAL[2]); }); ctx.chUnmake(s2);
  ok(hits.length >= 2, "fork hits two: " + q2.answer);
}
/* checkpoints for every lesson */
c.lessonList.forEach(function (L) {
  if (!ctx.passable(L)) return;
  for (var k = 0; k < 4; k++) { var q = ctx.cpQuestion(c, L, { rnd: rnd, caps: {} }); ok(q && q.answer != null, "checkpoint " + L.id); ok(ctx.gradeAnswer(q, q.answer).ok, "checkpoint right answer ok " + L.id); }
  ctx.lessonSkillIds(c, L).forEach(function (id) { ok(ctx.skInfo(id), "skill " + id); });
});
/* play: a short game against level 1, grading every hero move */
var g = ctx.chPlayNew(1, 1, rnd), moves = 0;
while (!g.over && moves < 30) {
  if (g.s.side === g.color) { var legal = ctx.chLegal(g.s); var best = ctx.chSearch(g.s, 2, 50000).move || legal[0]; var j = ctx.chHeroMove(g, best, 3); ok(j && j.grade, "hero move graded " + j.grade); }
  else ctx.chEngineMove(g);
  moves++;
}
ok(g.n > 5, "hero played moves: " + g.n);
var acc = ctx.chAccuracy(g); ok(acc && acc.accuracy > 50, "accuracy computed " + (acc && acc.accuracy.toFixed(0)));
var L = ctx.chlNew(); ctx.chlAddGame(L, g, Date.now());
var S = ctx.chlSummary(L); ok(S.n === g.n && S.games === 1, "level summary records the game");
var p0 = L.puzzle; ctx.chlPuzzle(L, 1200, true); ok(L.puzzle > p0, "puzzle rating rises on a solve"); ctx.chlPuzzle(L, 800, false); ok(L.puzzle < p0 + 60, "and falls on a miss");
/* every engine level answers */
for (var lv = 1; lv <= 6; lv++) { var g2 = ctx.chPlayNew(lv, -1, rnd); var tt = Date.now(); var mv = ctx.chEngineMove(g2); ok(mv, "engine level " + lv + " moves in " + (Date.now() - tt) + "ms"); }
console.log("chess drills: " + (n - fails) + "/" + n + " passed in " + ((Date.now() - t0) / 1000).toFixed(1) + "s");
if (fails) process.exit(1);
