/* ============================================================
   QUANT: daily games for mental arithmetic and estimation
   Modelled on the timed arithmetic game quant-firm applicants
   practise on (OpenQuant / Zetamac): a fixed clock, as many
   right answers as you can, score and history. Five games:
     sprint     + − × ÷ with the digit ranges growing by tier
     sequences  the next term of a pattern
     estimate   Fermi-style and arithmetic estimation within a tolerance
     percent    percentages, discounts, ratios, in the head
     odds       quick probability and expected value
   A game is a few minutes, no stakes: it lives outside the daily
   budget. Progress is the score over time, personal bests, and a
   tier plan that raises the difficulty as the median score climbs.
   ============================================================ */

var QT_GAMES = [
  { id: "sprint", name: "Arithmetic sprint", secs: 120, blurb: "Add, subtract, multiply, divide. Two minutes, as many as you can.", tiers: [
    { name: "Tier 1", add: [2, 100], mul: [2, 12], target: 20, about: "two-digit sums, times tables" },
    { name: "Tier 2", add: [2, 100], mul: [2, 25], target: 30, about: "sums to 100, products to 25 × 25" },
    { name: "Tier 3", add: [10, 500], mul: [2, 50], target: 35, about: "three-digit sums, two-digit products" },
    { name: "Tier 4", add: [10, 999], mul: [11, 99], target: 40, about: "the OpenQuant setting: 2-digit × 2-digit, 3-digit sums" },
    { name: "Tier 5", add: [100, 9999], mul: [11, 99], target: 50, about: "four-digit sums, fast 2 × 2" }
  ] },
  { id: "sequences", name: "Sequences", secs: 120, blurb: "What comes next? Arithmetic, geometric, squares, alternating, second differences.", tiers: [
    { name: "Tier 1", kinds: ["arith", "geo2"], target: 10, about: "constant difference, doubling" },
    { name: "Tier 2", kinds: ["arith", "geo", "squares"], target: 14, about: "ratios, squares, cubes" },
    { name: "Tier 3", kinds: ["arith", "geo", "squares", "diff2", "alt"], target: 16, about: "second differences, alternating rules" },
    { name: "Tier 4", kinds: ["geo", "squares", "diff2", "alt", "fib", "primes"], target: 18, about: "Fibonacci-like, primes, mixed" }
  ] },
  { id: "estimate", name: "Estimation", secs: 120, blurb: "Within 5%: big products, square roots, percentages of odd numbers, Fermi questions.", tiers: [
    { name: "Tier 1", tol: 0.1, kinds: ["prod", "sqrt"], target: 10, about: "within 10%" },
    { name: "Tier 2", tol: 0.05, kinds: ["prod", "sqrt", "div"], target: 12, about: "within 5%" },
    { name: "Tier 3", tol: 0.05, kinds: ["prod", "sqrt", "div", "pow", "fermi"], target: 14, about: "powers and Fermi" },
    { name: "Tier 4", tol: 0.03, kinds: ["prod", "sqrt", "div", "pow", "fermi"], target: 16, about: "within 3%" }
  ] },
  { id: "percent", name: "Percentages", secs: 120, blurb: "Percent of, percent change, discounts, ratios, the trick of switching the numbers.", tiers: [
    { name: "Tier 1", kinds: ["of"], target: 14, about: "x% of y with friendly numbers" },
    { name: "Tier 2", kinds: ["of", "change"], target: 16, about: "percent change" },
    { name: "Tier 3", kinds: ["of", "change", "reverse", "compound"], target: 18, about: "reverse percentages, two changes in a row" },
    { name: "Tier 4", kinds: ["of", "change", "reverse", "compound", "ratio"], target: 22, about: "ratios and parts" }
  ] },
  { id: "odds", name: "Odds and EV", secs: 120, blurb: "Dice, coins, cards and quick expected values: the arithmetic under every probability question.", tiers: [
    { name: "Tier 1", kinds: ["dice1", "coin", "ev"], target: 10, about: "one die, a few coins, simple EV" },
    { name: "Tier 2", kinds: ["dice2", "coin", "ev", "cards"], target: 12, about: "two dice, card draws" },
    { name: "Tier 3", kinds: ["dice2", "coinN", "ev", "cards", "cond"], target: 14, about: "binomial counts, conditional" },
    { name: "Tier 4", kinds: ["dice2", "coinN", "ev", "cards", "cond", "odds"], target: 16, about: "odds and implied probabilities" }
  ] }
];

function qtRnd(ctx) { return (ctx && ctx.rnd) || Math.random; }
function qtInt(rnd, a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
function qtPick(rnd, a) { return a[(rnd() * a.length) | 0]; }
function qtGame(id) { return QT_GAMES.filter(function (g) { return g.id === id; })[0]; }

/* ---- question generators: every question is { q, a (number), tol, kind, expl } ---- */
function qtSprint(T, rnd) {
  var op = qtPick(rnd, ["+", "-", "*", "/"]);
  if (op === "+") { var a = qtInt(rnd, T.add[0], T.add[1]), b = qtInt(rnd, T.add[0], T.add[1]); return { q: a + " + " + b, a: a + b, kind: "+", expl: a + " + " + b + " = " + (a + b) }; }
  if (op === "-") { var c = qtInt(rnd, T.add[0], T.add[1]), d = qtInt(rnd, T.add[0], T.add[1]); if (d > c) { var t = c; c = d; d = t; } return { q: c + " − " + d, a: c - d, kind: "−", expl: c + " − " + d + " = " + (c - d) }; }
  if (op === "*") { var e = qtInt(rnd, T.mul[0], T.mul[1]), f = qtInt(rnd, T.mul[0], T.mul[1]); return { q: e + " × " + f, a: e * f, kind: "×", expl: e + " × " + f + " = " + (e * f) }; }
  var g = qtInt(rnd, T.mul[0], T.mul[1]), h = qtInt(rnd, T.mul[0], T.mul[1]);
  return { q: (g * h) + " ÷ " + g, a: h, kind: "÷", expl: (g * h) + " ÷ " + g + " = " + h };
}
function qtSequence(T, rnd) {
  var kind = qtPick(rnd, T.kinds), s = [], n = 5, i, expl;
  if (kind === "arith") { var a0 = qtInt(rnd, -20, 40), d = qtInt(rnd, -9, 12) || 3; for (i = 0; i < n; i++) s.push(a0 + i * d); expl = "constant difference " + d; }
  else if (kind === "geo2") { var g0 = qtInt(rnd, 1, 9); for (i = 0; i < n; i++) s.push(g0 * Math.pow(2, i)); expl = "each term doubles"; }
  else if (kind === "geo") { var r = qtPick(rnd, [2, 3, -2, 4]), g1 = qtInt(rnd, 1, 6); for (i = 0; i < n; i++) s.push(g1 * Math.pow(r, i)); expl = "ratio " + r; }
  else if (kind === "squares") { var k0 = qtInt(rnd, 1, 8), cube = rnd() < 0.3; for (i = 0; i < n; i++) s.push(cube ? Math.pow(k0 + i, 3) : (k0 + i) * (k0 + i) + (cube ? 0 : 0)); expl = cube ? "cubes" : "squares"; }
  else if (kind === "diff2") { var b0 = qtInt(rnd, 1, 10), d1 = qtInt(rnd, 1, 6), dd = qtInt(rnd, 1, 4), cur = b0, step = d1; for (i = 0; i < n; i++) { s.push(cur); cur += step; step += dd; } expl = "the differences grow by " + dd + " each time"; }
  else if (kind === "alt") { var x0 = qtInt(rnd, 2, 15), p = qtInt(rnd, 2, 9), m = qtPick(rnd, [2, 3]); cur = x0; for (i = 0; i < n; i++) { s.push(cur); cur = i % 2 === 0 ? cur * m : cur + p; } expl = "alternate: × " + m + ", then + " + p; }
  else if (kind === "fib") { var f1 = qtInt(rnd, 1, 5), f2 = qtInt(rnd, f1, 9); s = [f1, f2]; for (i = 2; i < n; i++) s.push(s[i - 1] + s[i - 2]); expl = "each term is the sum of the two before"; }
  else { var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53], st = qtInt(rnd, 0, 9); s = primes.slice(st, st + n); expl = "consecutive primes"; }
  /* the answer is the next term */
  var next;
  if (kind === "arith") next = s[4] + (s[1] - s[0]);
  else if (kind === "geo2") next = s[4] * 2;
  else if (kind === "geo") next = s[4] * (s[1] / s[0]);
  else if (kind === "squares") next = expl === "cubes" ? Math.pow(Math.round(Math.cbrt(s[4])) + 1, 3) : Math.pow(Math.round(Math.sqrt(s[4])) + 1, 2);
  else if (kind === "diff2") next = s[4] + (s[4] - s[3]) + ((s[4] - s[3]) - (s[3] - s[2]));
  else if (kind === "alt") next = 4 % 2 === 0 ? s[4] * (s[1] / s[0]) : s[4] + (s[2] - s[1]);
  else if (kind === "fib") next = s[4] + s[3];
  else { var pr = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]; next = pr[pr.indexOf(s[4]) + 1]; }
  return { q: s.join(", ") + ", ?", a: next, kind: kind, expl: expl + " → " + next };
}
function qtEstimate(T, rnd) {
  var kind = qtPick(rnd, T.kinds), q, a, expl;
  if (kind === "prod") { var x = qtInt(rnd, 100, 999), y = qtInt(rnd, 10, 99); q = x + " × " + y + " ≈ ?"; a = x * y; expl = "round: " + Math.round(x / 10) * 10 + " × " + Math.round(y / 10) * 10 + " = " + Math.round(x / 10) * 10 * Math.round(y / 10) * 10 + "; exact " + a; }
  else if (kind === "sqrt") { var z = qtInt(rnd, 50, 5000); q = "√" + z + " ≈ ?"; a = Math.sqrt(z); var lo = Math.floor(a); expl = lo + "² = " + lo * lo + ", " + (lo + 1) + "² = " + (lo + 1) * (lo + 1) + "; interpolate: " + a.toFixed(1); }
  else if (kind === "div") { var u = qtInt(rnd, 1000, 99999), v = qtInt(rnd, 7, 97); q = u + " ÷ " + v + " ≈ ?"; a = u / v; expl = "≈ " + a.toFixed(1); }
  else if (kind === "pow") { var bs = qtInt(rnd, 2, 9), ex = qtInt(rnd, 3, 7); if (bs >= 6 && ex > 5) ex = 5; q = bs + "^" + ex + " ≈ ?"; a = Math.pow(bs, ex); expl = "exact " + a; }
  else {
    var F = qtPick(rnd, [["seconds in a day", 86400], ["hours in a year", 8760], ["minutes in a week", 10080], ["seconds in a week", 604800], ["days in 10 years", 3652], ["heartbeats in a day at 70/min", 100800], ["km in 100 miles", 161], ["cm in a mile", 160934], ["mm in 2.5 km", 2500000], ["steps in 10 km at 0.75 m", 13333], ["words in a 300-page novel at 280/page", 84000], ["weeks in 15 years", 782]]);
    q = "How many " + F[0] + "?"; a = F[1]; expl = "about " + F[1].toLocaleString();
  }
  return { q: q, a: a, tol: T.tol, kind: kind, expl: expl };
}
function qtPercent(T, rnd) {
  var kind = qtPick(rnd, T.kinds), q, a, expl;
  if (kind === "of") { var p = qtPick(rnd, [5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75, 80]), n = qtPick(rnd, [40, 60, 80, 120, 160, 200, 240, 300, 360, 400, 480, 640, 720, 900, 1200]); q = p + "% of " + n; a = p * n / 100; expl = p + "% of " + n + " = " + a + (p !== 50 ? " (tip: " + n + "% of " + p + " is the same number)" : ""); }
  else if (kind === "change") { var f = qtPick(rnd, [40, 50, 80, 120, 150, 200, 250, 400]), t = Math.round(f * qtPick(rnd, [0.5, 0.75, 0.8, 0.9, 1.1, 1.2, 1.25, 1.5, 2, 2.5])); q = "From " + f + " to " + t + ": percent change?"; a = Math.round(100 * (t - f) / f); expl = "(" + t + " − " + f + ") / " + f + " = " + a + "%"; }
  else if (kind === "reverse") { var orig = qtPick(rnd, [40, 50, 60, 80, 120, 150, 200, 240, 300]), pc = qtPick(rnd, [10, 20, 25, 40, 50]), after = orig * (100 - pc) / 100; q = "After a " + pc + "% discount the price is " + after + ". Original price?"; a = orig; expl = after + " is " + (100 - pc) + "% of the original: " + after + " / " + ((100 - pc) / 100) + " = " + orig; }
  else if (kind === "compound") { var base = qtPick(rnd, [100, 200, 400, 500, 1000]), p1 = qtPick(rnd, [10, 20, 25, 50]), p2 = qtPick(rnd, [10, 20, 25, 50]), up = rnd() < 0.5; var r1 = base * (1 + p1 / 100), r2 = up ? r1 * (1 + p2 / 100) : r1 * (1 - p2 / 100); q = base + " rises " + p1 + "% then " + (up ? "rises " : "falls ") + p2 + "%. Result?"; a = Math.round(r2 * 100) / 100; expl = base + " × " + (1 + p1 / 100) + " × " + (up ? (1 + p2 / 100) : (1 - p2 / 100)) + " = " + a + (!up && p1 === p2 ? ". Up then down the same percent never gets you back." : ""); }
  else { var total = qtPick(rnd, [60, 90, 120, 150, 180, 240, 300, 360]), ra = qtInt(rnd, 1, 5), rb = qtInt(rnd, 1, 5); q = total + " split in the ratio " + ra + ":" + rb + ". The larger share?"; a = Math.round(total * Math.max(ra, rb) / (ra + rb) * 100) / 100; expl = total + " × " + Math.max(ra, rb) + "/" + (ra + rb) + " = " + a; }
  return { q: q, a: a, tol: 0.011, kind: kind, expl: expl, rel: kind === "change" ? 0 : null };
}
function qtOdds(T, rnd) {
  var kind = qtPick(rnd, T.kinds), q, a, expl;
  function C(n, k) { var r = 1; for (var i = 0; i < k; i++) r = r * (n - i) / (i + 1); return Math.round(r); }
  if (kind === "dice1") { var k = qtInt(rnd, 1, 5), ge = rnd() < 0.5; q = "One die. P(" + (ge ? "at least " : "at most ") + k + ")? As a percent."; a = 100 * (ge ? (7 - k) : k) / 6; expl = (ge ? (7 - k) : k) + " of 6 faces: " + a.toFixed(1) + "%"; }
  else if (kind === "dice2") { var s = qtInt(rnd, 2, 12), ways = 6 - Math.abs(7 - s); q = "Two dice. P(sum = " + s + ")? As a percent."; a = 100 * ways / 36; expl = ways + " of 36 ways: " + a.toFixed(1) + "%"; }
  else if (kind === "coin") { var n1 = qtInt(rnd, 2, 4); q = n1 + " coins. P(all heads)? As a percent."; a = 100 / Math.pow(2, n1); expl = "1 / 2^" + n1 + " = " + a.toFixed(2) + "%"; }
  else if (kind === "coinN") { var n2 = qtInt(rnd, 3, 6), k2 = qtInt(rnd, 0, n2); q = n2 + " coins. P(exactly " + k2 + " heads)? As a percent."; a = 100 * C(n2, k2) / Math.pow(2, n2); expl = "C(" + n2 + "," + k2 + ") / 2^" + n2 + " = " + C(n2, k2) + " / " + Math.pow(2, n2) + " = " + a.toFixed(1) + "%"; }
  else if (kind === "cards") { var kind2 = qtPick(rnd, [["an ace", 4], ["a heart", 13], ["a face card", 12], ["a red card", 26], ["a spade or an ace", 16]]); q = "One card from a full deck. P(" + kind2[0] + ")? As a percent."; a = 100 * kind2[1] / 52; expl = kind2[1] + " / 52 = " + a.toFixed(1) + "%"; }
  else if (kind === "ev") { var win = qtPick(rnd, [10, 20, 25, 50, 100]), pw = qtPick(rnd, [10, 20, 25, 30, 40, 50]), cost = qtPick(rnd, [5, 10, 15, 20]); q = "Pay " + cost + " to win " + win + " with probability " + pw + "%. Expected profit?"; a = win * pw / 100 - cost; expl = win + " × " + pw / 100 + " − " + cost + " = " + a; }
  else if (kind === "cond") { var red = qtInt(rnd, 2, 6), blue = qtInt(rnd, 2, 6); q = red + " red and " + blue + " blue balls, two drawn without replacement. P(both red)? As a percent."; a = 100 * (red / (red + blue)) * ((red - 1) / (red + blue - 1)); expl = red + "/" + (red + blue) + " × " + (red - 1) + "/" + (red + blue - 1) + " = " + a.toFixed(1) + "%"; }
  else { var o1 = qtPick(rnd, [1, 2, 3, 4, 5, 9]), o2 = qtPick(rnd, [1, 2, 3, 4, 5]); q = "Odds of " + o1 + " to " + o2 + " against. Implied probability? As a percent."; a = 100 * o2 / (o1 + o2); expl = o2 + " / (" + o1 + " + " + o2 + ") = " + a.toFixed(1) + "%"; }
  return { q: q, a: Math.round(a * 100) / 100, tol: 0.6, abs: true, kind: kind, expl: expl };
}
function qtQuestion(gameId, tier, ctx) {
  var G = qtGame(gameId), T = G.tiers[Math.max(0, Math.min(G.tiers.length - 1, tier))], rnd = qtRnd(ctx);
  var q = gameId === "sprint" ? qtSprint(T, rnd) : gameId === "sequences" ? qtSequence(T, rnd) : gameId === "estimate" ? qtEstimate(T, rnd) : gameId === "percent" ? qtPercent(T, rnd) : qtOdds(T, rnd);
  q.game = gameId; q.tier = tier;
  return q;
}
/* grade: exact for integers; within tol (relative) for estimates; within abs for percents of odds */
function qtCheck(q, raw) {
  var v = parseFloat(String(raw).replace(/[^0-9.\-]/g, ""));
  if (!isFinite(v)) return false;
  if (q.abs) return Math.abs(v - q.a) <= (q.tol || 0.6);
  if (q.tol) return Math.abs(v - q.a) <= Math.max(0.5, Math.abs(q.a) * q.tol) || Math.abs(v - q.a) <= 0.011;
  return Math.abs(v - q.a) < 1e-9;
}

/* ---- scores and the plan ---- */
function qtNew() { return { runs: [], tier: {}, best: {} }; }
function qtRecord(S, gameId, tier, score, n, now) {
  var G = qtGame(gameId);
  tier = Math.max(0, Math.min(G.tiers.length - 1, (+tier | 0)));   /* clamp like qtQuestion: a stale or corrupt tier never indexes past the ladder */
  S.runs.push({ t: now, g: gameId, tier: tier, score: score, n: n });
  if (S.runs.length > 2000) S.runs.splice(0, S.runs.length - 2000);
  var key = gameId + ":" + tier;
  if (!S.best[key] || score > S.best[key]) S.best[key] = score;
  /* the plan: move up a tier once the median of the last five runs at this tier beats the target */
  var T = G.tiers[tier], last = S.runs.filter(function (r) { return r.g === gameId && r.tier === tier; }).slice(-5).map(function (r) { return r.score; }).sort(function (a, b) { return a - b; });
  var med = last.length >= 5 ? last[2] : null;
  var moved = false;
  if (med != null && med >= T.target && tier + 1 < G.tiers.length) { S.tier[gameId] = tier + 1; moved = true; }
  return { median: med, target: T.target, moved: moved, best: S.best[key] };
}
function qtTier(S, gameId) { return (S && S.tier && S.tier[gameId]) || 0; }
function qtHistory(S, gameId, n) { return (S && S.runs || []).filter(function (r) { return r.g === gameId; }).slice(-(n || 60)); }
function qtPlayedToday(S, dayKey, keyFn) { return (S && S.runs || []).some(function (r) { return keyFn(r.t) === dayKey; }); }
/* the overall quant level: how far through the tiers, weighted by the recent median against the target */
var QT_LEVELS = [{ min: 0, name: "Counting on fingers" }, { min: 15, name: "Warming up" }, { min: 30, name: "Quick" }, { min: 50, name: "Fast" }, { min: 70, name: "Second nature" }, { min: 90, name: "Quant" }];
function qtLevel(S) {
  var sum = 0, detail = [];
  QT_GAMES.forEach(function (G) {
    var tier = qtTier(S, G.id), T = G.tiers[tier], last = qtHistory(S, G.id, 5).filter(function (r) { return r.tier === tier; }).map(function (r) { return r.score; });
    var med = last.length ? last.sort(function (a, b) { return a - b; })[last.length >> 1] : 0;
    var frac = (tier + Math.min(1, med / T.target)) / G.tiers.length;
    sum += frac; detail.push([G.name, T.name + ", median " + med + " of " + T.target + (last.length < 5 ? " (" + last.length + " of 5 runs)" : "")]);
  });
  var score = 100 * sum / QT_GAMES.length, L = QT_LEVELS[0];
  for (var i = 0; i < QT_LEVELS.length; i++) if (score >= QT_LEVELS[i].min) L = QT_LEVELS[i];
  var ix = QT_LEVELS.indexOf(L), nx = QT_LEVELS[ix + 1] || null;
  return { score: score, name: L.name, about: "Across the five games: the tier you are on and how your median run compares with its target.", index: ix, count: QT_LEVELS.length, next: nx, toNext: nx ? (score - L.min) / (nx.min - L.min) : 1, detail: detail };
}
var QT_PLAN = [
  { title: "How it works", body: "Each game is two minutes against the clock. Your score is the number of right answers. Five runs at a tier set a median; when the median beats the tier's target, the next tier unlocks and the numbers get bigger. There is nothing to lose: no XP penalty, no streak, no place in the daily budget. It is a warm-up, the way a pianist plays scales." },
  { title: "The plan", body: "One game a day, rotating through the five, before the first real session of the day: two minutes of arithmetic wakes up the part of the mind the rest of the day uses. Do the sprint most often; it is the one interviews test and the one that transfers to the others. Once a week, look at the history chart and the per-operation breakdown and pick the weak operation for an extra run." },
  { title: "Techniques, in the order to learn them", body: "Addition: left to right, hundreds first, say the running total. Subtraction: add up from the smaller number (47 to 50 is 3, to 83 is 36). Multiplication: break one factor (23 × 47 = 23 × 50 − 23 × 3), squares near 50 and 100 (47² = 2209: 50² − 2·50·3 + 9), the difference of squares (48 × 52 = 2500 − 4). Division: find the quotient's first digit, multiply back, subtract. Percentages: x% of y is y% of x; 10% then halve, double, add. Estimation: round to two significant figures, compute, adjust the exponent. Sequences: check differences, then ratios, then second differences." },
  { title: "Targets", body: "The OpenQuant setting (tier 4 of the sprint: two-digit by two-digit multiplication, three-digit sums) at 40 in two minutes is the level trading firms look for in first-round screens; 55+ is strong. For the other games the targets are set so that reaching tier 4 means the skill is automatic. Expect the sprint median to rise about a point a week with daily play, faster early." }
];

if (typeof module !== "undefined") module.exports = { QT_GAMES: QT_GAMES, QT_PLAN: QT_PLAN, QT_LEVELS: QT_LEVELS, qtGame: qtGame, qtQuestion: qtQuestion, qtCheck: qtCheck, qtNew: qtNew, qtRecord: qtRecord, qtTier: qtTier, qtHistory: qtHistory, qtPlayedToday: qtPlayedToday, qtLevel: qtLevel };
