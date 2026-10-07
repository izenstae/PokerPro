/* The quant games: every generator at every tier produces a checkable question; scores, tiers and the level move. */
var Q = require("../sb/quant.js");
var n = 0, fails = 0;
function ok(c, m) { n++; if (!c) { fails++; console.log("  FAIL " + m); } }
var rnd = (function () { var s = 99; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })();
Q.QT_GAMES.forEach(function (G) {
  G.tiers.forEach(function (T, ti) {
    for (var k = 0; k < 150; k++) {
      var q = Q.qtQuestion(G.id, ti, { rnd: rnd });
      ok(q && q.q && isFinite(q.a), G.id + " tier " + ti + " q" + k + " well formed: " + JSON.stringify(q));
      ok(Q.qtCheck(q, String(q.a)), G.id + " tier " + ti + " exact answer accepted: " + q.q + " = " + q.a);
      if (q.tol && !q.abs) ok(Q.qtCheck(q, String(q.a * (1 + q.tol * 0.9))), G.id + " within tolerance accepted");
      if (!q.tol) ok(!Q.qtCheck(q, String(q.a + 1)), G.id + " off by one rejected: " + q.q);
      if (G.id === "sprint" && q.kind === "÷") ok(Number.isInteger(q.a), "division is exact");
      if (G.id === "sequences") ok(Number.isInteger(q.a), "sequence answer is an integer: " + q.q);
    }
  });
});
var S = Q.qtNew();
for (var i = 0; i < 5; i++) Q.qtRecord(S, "sprint", 0, 25, 30, 1000 + i);
ok(Q.qtTier(S, "sprint") === 1, "five runs over target move the sprint to tier 2");
ok(S.best["sprint:0"] === 25, "best recorded");
var r = Q.qtRecord(S, "sequences", 0, 3, 5, 2000); ok(r.median === null && !r.moved, "no median before five runs");
var L = Q.qtLevel(S); ok(L.name && L.score > 0 && L.detail.length === 5, "level computed: " + L.name + " " + L.score.toFixed(0));
ok(Q.qtHistory(S, "sprint").length === 5, "history per game");
ok(Q.qtPlayedToday(S, "k", function () { return "k"; }), "played today");
/* a stale or corrupt tier is clamped to the ladder, like qtQuestion does, instead of indexing past it */
var S2 = Q.qtNew(), top = Q.qtGame("sprint").tiers.length - 1, threw = false, r2 = null;
try { r2 = Q.qtRecord(S2, "sprint", 99, 10, 20, 3000); } catch (e) { threw = true; }
ok(!threw && r2 && r2.target === Q.qtGame("sprint").tiers[top].target, "a tier past the ladder records against the top tier");
ok(S2.runs[0].tier === top && S2.best["sprint:" + top] === 10 && !S2.best["sprint:99"], "the run and the best are stored under the clamped tier");
threw = false; try { Q.qtRecord(S2, "sprint", -3, 5, 20, 3001); Q.qtRecord(S2, "sprint", "x", 6, 20, 3002); Q.qtRecord(S2, "sprint", undefined, 7, 20, 3003); } catch (e) { threw = true; }
ok(!threw && S2.runs.slice(1).every(function (r) { return r.tier === 0; }), "negative, non-numeric and missing tiers clamp to tier 1");
for (var j = 0; j < 5; j++) Q.qtRecord(S2, "odds", 7, 99, 99, 4000 + j);
ok(Q.qtTier(S2, "odds") === 0 && !S2.tier.odds, "five runs over target at the (clamped) top tier never move past the ladder");
console.log("quant: " + (n - fails) + "/" + n + " passed");
if (fails) process.exit(1);
