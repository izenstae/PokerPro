/* The quant games: every generator produces a checkable question at the sites' settings; scores, bests and the level move. */
var Q = require("../sb/quant.js");
var n = 0, fails = 0;
function ok(c, m) { n++; if (!c) { fails++; console.log("  FAIL " + m); } }
var rnd = (function () { var s = 99; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })();
Q.QT_GAMES.forEach(function (G) {
  for (var k = 0; k < 400; k++) {
    var q = Q.qtQuestion(G.id, { rnd: rnd });
    ok(q && q.q && isFinite(q.a), G.id + " q" + k + " well formed: " + JSON.stringify(q));
    if (q.choices) {
      ok(q.choices.length === 4 && q.ci >= 0 && q.ci < 4, G.id + " four options with the answer among them: " + JSON.stringify(q));
      ok(new Set(q.choices).size === 4, G.id + " options distinct: " + q.choices.join(" | "));
      ok(q.choices[q.ci] === q.show, G.id + " the marked option is the answer");
      ok(Q.qtCheck(q, q.ci) && !Q.qtCheck(q, (q.ci + 1) % 4), G.id + " the right option is accepted, another rejected");
      continue;
    }
    ok(Q.qtCheck(q, String(q.a)), G.id + " exact answer accepted: " + q.q + " = " + q.a);
    if (q.tol && !q.abs) ok(Q.qtCheck(q, String(q.a * (1 + q.tol * 0.9))), G.id + " within tolerance accepted");
    if (!q.tol) ok(!Q.qtCheck(q, String(q.a + 1)), G.id + " off by one rejected: " + q.q);
    if (G.exact) ok(Number.isInteger(q.a), G.id + " answer is an integer: " + q.q);
  }
});
/* Zetamac's default: (2–100) + (2–100), − as + in reverse, (2–12) × (2–100), ÷ as × in reverse */
for (var z = 0; z < 2000; z++) {
  var s = Q.qtQuestion("sprint", { rnd: rnd }), m = s.q.match(/^(\d+) (.) (\d+)$/), x = +m[1], y = +m[3];
  if (s.kind === "+") ok(x >= 2 && x <= 100 && y >= 2 && y <= 100, "addition in range: " + s.q);
  if (s.kind === "−") ok(y >= 2 && y <= 100 && s.a >= 2 && s.a <= 100 && x === y + s.a, "subtraction is addition in reverse: " + s.q);
  if (s.kind === "×") ok(x >= 2 && x <= 12 && y >= 2 && y <= 100, "multiplication (2–12) × (2–100): " + s.q);
  if (s.kind === "÷") ok(y >= 2 && y <= 12 && s.a >= 2 && s.a <= 100 && x === y * s.a, "division is multiplication in reverse: " + s.q);
}
var G8 = Q.qtGame("optiver"); ok(G8.secs === 480 && G8.count === 80, "the Optiver game is 80 questions in 8 minutes");
ok(Q.qtGame("sprint").secs === 120, "Zetamac is 120 seconds");
var S = Q.qtNew();
for (var i = 0; i < 5; i++) Q.qtRecord(S, "sprint", 40 + i, 50, 1000 + i);
ok(Q.qtBest(S, "sprint") === 44, "best recorded");
var r = Q.qtRecord(S, "sprint", 10, 20, 1100); ok(r.median === 42 && r.target === 60 && !r.newBest, "median of the last five");
r = Q.qtRecord(S, "sequences", 3, 5, 2000); ok(r.median === null && r.newBest, "no median before five runs; a first score is a best");
r = Q.qtRecord(S, "optiver", -4, 30, 2100); ok(Q.qtBest(S, "optiver") === -4 && !r.newBest, "a negative Optiver score records but is not a new best");
var L = Q.qtLevel(S); ok(L.name && L.score > 0 && L.detail.length === Q.QT_GAMES.length, "level computed: " + L.name + " " + L.score.toFixed(0));
ok(Q.qtHistory(S, "sprint").length === 6, "history per game");
ok(Q.qtPlayedToday(S, "k", function () { return "k"; }), "played today");
/* runs from the old, easier tier ladder stay stored but never count */
var S2 = Q.qtNew(); S2.runs.push({ t: 1, g: "sprint", tier: 0, score: 90, n: 90 }); S2.best["sprint:0"] = 90;
ok(Q.qtHistory(S2, "sprint").length === 0 && Q.qtBest(S2, "sprint") === 0 && Q.qtLevel(S2).score === 0, "old-ladder runs are left out of history, best and level");
console.log("quant: " + (n - fails) + "/" + n + " passed");
if (fails) process.exit(1);
