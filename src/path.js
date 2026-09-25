/* ============================================================
   THE PATH: every lesson, in the order you should meet it,
   from the rules of the game to the maths the best players use.
   Lesson ids never change, so saved progress always carries over.
   ============================================================ */
var PATH = [
  { title: "The game", sub: "Start here",
    blurb: "Assumes nothing. How a hand is played, what beats what, and why the seat you sit in matters as much as your cards.",
    ids: ["rules", "ladder", "read", "shape", "seats"] },
  { title: "Odds and equity", sub: "The arithmetic",
    blurb: "Counting, pot odds, outs, expected value, fold equity and implied odds. Easy maths; the skill is doing it fast.",
    ids: ["prob", "price", "outs", "decide", "ev", "fold", "implied", "shapes", "table"] },
  { title: "Preflop", sub: "The first decision",
    blurb: "Opening charts by seat, the maths of 3-bets, and the stack-to-pot ratio that decides how the rest of the hand plays.",
    ids: ["rfi", "threebet", "spr"] },
  { title: "Ranges", sub: "Thinking in combos",
    blurb: "Stop putting them on a hand and start counting combos, card removal and blockers. Where most players stall.",
    ids: ["combos", "removal", "blockers", "counting"] },
  { title: "Game theory", sub: "Equilibrium",
    blurb: "Indifference, alpha, MDF, sizing, the AKQ toy game, and four working solvers you can watch converge.",
    ids: ["indiff", "alpha", "mdf", "sizing", "akq", "cfrlab", "leduc", "river", "turn"] },
  { title: "Postflop strategy", sub: "Theory at the table",
    blurb: "Equity realisation, c-bets, geometric sizing and bluffing across streets: game theory turned into bet sizes.",
    ids: ["eqr", "cbet", "geo", "multi"] },
  { title: "Tournaments", sub: "Short stacks and ICM",
    blurb: "Push-or-fold with a short stack, and why tournament chips are not money.",
    ids: ["jam", "icm"] },
  { title: "Variance and bankroll", sub: "Knowing if you are good",
    blurb: "The t-stat on your own winrate, how many hands it takes to know, risk of ruin, and Kelly.",
    ids: ["tstat", "sample", "ror", "kelly"] },
  { title: "Exploitative play", sub: "Where the money is",
    blurb: "Bayesian updating with equilibrium as the prior, and the discipline to deviate only when the read is real.",
    ids: ["bayes", "update", "deviate"] }
];

var LAYERS = [], LESSONS = [];
(function () {
  var byId = {};
  [LESSONS_0, LESSONS_1, LESSONS_2, LESSONS_3, LESSONS_4, LESSONS_5].forEach(function (arr) {
    arr.forEach(function (L) { byId[L.id] = L; });
  });
  Object.keys(NEW_LESSONS).forEach(function (k) { byId[k] = NEW_LESSONS[k]; });
  PATH.forEach(function (S, n) {
    var lessons = S.ids.map(function (id) {
      if (!byId[id]) throw new Error("path names a missing lesson: " + id);
      return byId[id];
    });
    lessons.forEach(function (les, i) {
      les.layer = n; les.idx = i; les.of_n = lessons.length;
      LESSONS.push(les);
    });
    LAYERS.push({ n: n, title: S.title, sub: S.sub, blurb: S.blurb, lessons: lessons });
  });
})();
