/* ============================================================
   QUANT: the timed games quant-firm applicants practise on, with
   the same settings as the sites, not an easier ladder:
     arithmetic  Zetamac's default game (also OpenQuant's Arithmetic):
                 (2 to 100) + (2 to 100), subtraction as addition in
                 reverse, (2 to 12) × (2 to 100), division as
                 multiplication in reverse, 120 seconds. A right answer
                 is taken the moment it is typed; there is no Enter and
                 no skipping.
     optiver     the Optiver 80 in 8: 80 multiple-choice questions in
                 8 minutes, four options, integers, decimals, fractions
                 and missing operands, +1 right, −1 wrong
     sequences   the next term, at the difficulty of the firms' number
                 logic tests
     estimate, percent, odds   warm-ups for the rest of a screen
   A game is a few minutes, no stakes: it lives outside the daily
   budget. Progress is the score over time against a fixed target.
   ============================================================ */

/* ver tags the runs of a game's current settings, so runs from the old,
   easier tier ladder (tiers 0 to 4) never mix into the median or the best */
var QT_GAMES = [
  { id: "sprint", name: "Arithmetic (Zetamac)", secs: 120, ver: 10, target: 60, exact: true, noSkip: true,
    blurb: "Zetamac's default game: add, subtract, multiply, divide. Two minutes; a right answer moves on as soon as it is typed.",
    about: "(2–100) + (2–100), − in reverse, (2–12) × (2–100), ÷ in reverse",
    set: { add: [2, 100], mulA: [2, 12], mulB: [2, 100] } },
  { id: "optiver", name: "Optiver 80 in 8", secs: 480, ver: 10, target: 60, mc: true, count: 80,
    blurb: "80 multiple-choice questions in 8 minutes: integers, decimals, fractions, missing operands. +1 right, −1 wrong.",
    about: "4 options, keys 1–4 or click, no calculator" },
  { id: "sequences", name: "Sequences", secs: 120, ver: 10, target: 16, exact: true,
    blurb: "What comes next? Ratios, powers, second differences, alternating and interleaved rules, primes.",
    about: "number-logic difficulty, exact answers",
    set: { kinds: ["geo", "squares", "diff2", "alt", "fib", "primes", "interleave", "mulAdd", "sqPlus"] } },
  { id: "estimate", name: "Estimation", secs: 120, ver: 3, target: 16,
    blurb: "Within 3%: big products, square roots, divisions, powers, Fermi questions.",
    about: "within 3%",
    set: { tol: 0.03, kinds: ["prod", "sqrt", "div", "pow", "fermi"] } },
  { id: "percent", name: "Percentages", secs: 120, ver: 3, target: 22,
    blurb: "Percent of, percent change, reverse percentages, two changes in a row, ratios.",
    about: "to within half a point",
    set: { kinds: ["of", "change", "reverse", "compound", "ratio"] } },
  { id: "odds", name: "Odds and EV", secs: 120, ver: 3, target: 16,
    blurb: "Dice, coins, cards, conditional draws, odds and expected values.",
    about: "percent to within 0.6",
    set: { kinds: ["dice2", "coinN", "ev", "cards", "cond", "odds"] } }
];

function qtRnd(ctx) { return (ctx && ctx.rnd) || Math.random; }
function qtInt(rnd, a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
function qtPick(rnd, a) { return a[(rnd() * a.length) | 0]; }
function qtGame(id) { return QT_GAMES.filter(function (g) { return g.id === id; })[0]; }

/* ---- question generators: every question is { q, a (number), tol, kind, expl } ---- */
/* Zetamac's default: subtraction is an addition problem in reverse, division a multiplication in reverse */
function qtSprint(T, rnd) {
  var op = qtPick(rnd, ["+", "-", "*", "/"]);
  if (op === "+" || op === "-") {
    var a = qtInt(rnd, T.add[0], T.add[1]), b = qtInt(rnd, T.add[0], T.add[1]);
    if (op === "+") return { q: a + " + " + b, a: a + b, kind: "+", expl: a + " + " + b + " = " + (a + b) };
    return { q: (a + b) + " − " + a, a: b, kind: "−", expl: (a + b) + " − " + a + " = " + b };
  }
  var e = qtInt(rnd, T.mulA[0], T.mulA[1]), f = qtInt(rnd, T.mulB[0], T.mulB[1]);
  if (op === "*") return { q: e + " × " + f, a: e * f, kind: "×", expl: e + " × " + f + " = " + (e * f) };
  return { q: (e * f) + " ÷ " + e, a: f, kind: "÷", expl: (e * f) + " ÷ " + e + " = " + f };
}
var QT_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103];
function qtSequence(T, rnd) {
  var kind = qtPick(rnd, T.kinds), s = [], n = 5, i, expl, next, cur;
  if (kind === "geo") { var r = qtPick(rnd, [3, -2, 4, -3, 5]), g1 = qtInt(rnd, 1, 7); for (i = 0; i <= n; i++) s.push(g1 * Math.pow(r, i)); expl = "ratio " + r; }
  else if (kind === "squares") { var k0 = qtInt(rnd, 3, 14), cube = rnd() < 0.4; if (cube) k0 = qtInt(rnd, 2, 7); for (i = 0; i <= n; i++) s.push(cube ? Math.pow(k0 + i, 3) : (k0 + i) * (k0 + i)); expl = cube ? "consecutive cubes" : "consecutive squares"; }
  else if (kind === "diff2") { var d1 = qtInt(rnd, -4, 9), dd = qtInt(rnd, 2, 7); cur = qtInt(rnd, -10, 30); var step = d1; for (i = 0; i <= n; i++) { s.push(cur); cur += step; step += dd; } expl = "the differences grow by " + dd + " each time"; }
  else if (kind === "alt") { var m = qtPick(rnd, [2, 3, -2]), p = qtInt(rnd, -9, 11) || 4; cur = qtInt(rnd, 2, 12); for (i = 0; i <= n; i++) { s.push(cur); cur = i % 2 === 0 ? cur * m : cur + p; } expl = "alternate: × " + m + ", then " + (p < 0 ? "− " + (-p) : "+ " + p); }
  else if (kind === "fib") { var f1 = qtInt(rnd, 1, 9), f2 = qtInt(rnd, 1, 12), tri = rnd() < 0.35; s = [f1, f2]; if (tri) s.push(qtInt(rnd, 1, 9)); for (i = s.length; i <= n; i++) s.push(s[i - 1] + s[i - 2] + (tri ? s[i - 3] : 0)); expl = tri ? "each term is the sum of the three before" : "each term is the sum of the two before"; }
  else if (kind === "primes") { var st = qtInt(rnd, 0, 18), sq = rnd() < 0.3; s = QT_PRIMES.slice(st, st + n + 1); if (sq) { st = qtInt(rnd, 0, 5); s = QT_PRIMES.slice(st, st + n + 1).map(function (x) { return x * x; }); } expl = sq ? "squares of consecutive primes" : "consecutive primes"; }
  else if (kind === "interleave") { var a0 = qtInt(rnd, -5, 30), da = qtInt(rnd, -7, 9) || 5, b0 = qtInt(rnd, 1, 9), rb = qtPick(rnd, [2, 3]); for (i = 0; i <= 6; i++) s.push(i % 2 === 0 ? a0 + (i / 2) * da : b0 * Math.pow(rb, (i - 1) / 2)); n = 6; expl = "two sequences interleaved: " + (da < 0 ? "− " + (-da) : "+ " + da) + " on the odd places, × " + rb + " on the even"; }
  else if (kind === "mulAdd") { var mm = qtPick(rnd, [2, 3, -2]), c = qtInt(rnd, -7, 7) || 1; cur = qtInt(rnd, 1, 9); for (i = 0; i <= n; i++) { s.push(cur); cur = cur * mm + c; } expl = "each term × " + mm + (c < 0 ? " − " + (-c) : " + " + c); }
  else { var k1 = qtInt(rnd, 1, 9), c2 = qtPick(rnd, [-3, -2, -1, 1, 2, 3]), lin = qtInt(rnd, 0, 1); for (i = 0; i <= n; i++) { var kk = k1 + i; s.push(kk * kk + lin * kk + c2); } expl = "n² " + (lin ? "+ n " : "") + (c2 < 0 ? "− " + (-c2) : "+ " + c2) + " for n = " + k1 + ", " + (k1 + 1) + ", …"; }
  next = s[n]; s = s.slice(0, n);
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
/* ---- the Optiver 80 in 8: four options, one right; values are exact rationals so 0.1 + 0.2 never goes wrong ---- */
function qtGcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
function qtFr(n, d) { if (d < 0) { n = -n; d = -d; } var g = qtGcd(n, d); return { n: n / g, d: d / g }; }
function qtFrStr(f) { return f.d === 1 ? String(f.n) : f.n + "/" + f.d; }
function qtNum(v) { return String(+(+v).toFixed(6)); }
function qtOptiver(rnd) {
  var kind = qtPick(rnd, ["mul", "add", "div", "dec", "decdiv", "frac", "miss", "pct"]), q, ans, alts, frac = false, x, y, z;
  if (kind === "mul") { x = qtInt(rnd, 12, 99); y = qtInt(rnd, 12, 99); q = x + " × " + y; ans = x * y; alts = [ans + 10, ans - 10, ans + x, ans - y, ans + 100, ans - 2]; }
  else if (kind === "add") { x = qtInt(rnd, 1000, 9999); y = qtInt(rnd, 100, 4999); var plus = rnd() < 0.5; if (!plus && y > x) { z = x; x = y; y = z; } q = x + (plus ? " + " : " − ") + y; ans = plus ? x + y : x - y; alts = [ans + 10, ans - 10, ans + 100, ans - 100, ans + 1, ans - 1]; }
  else if (kind === "div") { x = qtInt(rnd, 3, 19); y = qtInt(rnd, 12, 199); q = (x * y) + " ÷ " + x; ans = y; alts = [y + 1, y - 1, y + 2, y - 2, y + 10, y - 10]; }
  else if (kind === "dec") { x = qtPick(rnd, [0.2, 0.25, 0.4, 0.5, 0.75, 1.5, 2.5, 0.04, 0.06, 0.08, 0.12, 0.15, 1.25, 3.5]); y = qtPick(rnd, [1.6, 2.4, 3.2, 12, 36, 48, 0.8, 4.5, 120, 0.6, 7.2, 64]); q = qtNum(x) + " × " + qtNum(y); ans = x * y; alts = [ans * 10, ans / 10, ans + x, ans - x, ans * 100, ans + y / 10]; }
  else if (kind === "decdiv") { z = qtInt(rnd, 2, 19); y = qtPick(rnd, [0.003, 0.004, 0.006, 0.008, 0.02, 0.05, 0.12, 0.3, 0.7]); x = z * y; q = qtNum(x) + " ÷ " + qtNum(y); ans = z; alts = [z * 10, z / 10, z + 1, z - 1, z * 100, z + 2]; }
  else if (kind === "frac") {
    var D = [2, 3, 4, 5, 6, 8, 10, 12], b = qtPick(rnd, D), d = qtPick(rnd, D.filter(function (k) { return k !== b; })), a = qtInt(rnd, 1, b - 1), c = qtInt(rnd, 1, d - 1), sub = rnd() < 0.5;
    var A = qtFr(sub ? a * d - c * b : a * d + c * b, b * d); frac = true;
    q = a + "/" + b + (sub ? " − " : " + ") + c + "/" + d; ans = A;
    alts = [qtFr(sub ? a - c : a + c, b + d), qtFr(sub ? a * d + c * b : a * d - c * b, b * d), qtFr(A.n + 1, A.d), qtFr(A.n - 1, A.d), qtFr(A.n * 2, A.d), qtFr(A.n, A.d * 2)];
  }
  else if (kind === "miss") {
    if (rnd() < 0.5) { x = qtInt(rnd, 12, 99); z = qtInt(rnd, 11, 99) / 10; q = x + " × ? = " + qtNum(x * z); ans = z; }
    else { x = qtPick(rnd, [4, 8, 5, 12, 16, 25]); z = qtInt(rnd, 3, 60) / qtPick(rnd, [4, 8]); q = "? ÷ " + x + " = " + qtNum(z); ans = x * z; }
    alts = [ans * 10, ans / 10, ans + 0.1, ans - 0.1, ans + 1, ans - 1];
  }
  else { x = qtPick(rnd, [12.5, 15, 35, 45, 65, 85, 7.5, 2.5, 17.5]); y = qtPick(rnd, [240, 360, 480, 640, 720, 880, 1200, 160]); q = qtNum(x) + "% of " + y; ans = x * y / 100; alts = [ans * 10, ans / 10, ans + 10, ans - 5, ans + 1, ans * 2]; }
  var key = function (v) { return frac ? qtFrStr(v) : qtNum(v); }, seen = {}, opts = [ans];
  seen[key(ans)] = 1;
  alts.forEach(function (v) { if (opts.length >= 4) return; var k = key(v), val = frac ? v.n / v.d : v; if (seen[k] || !(val > 0)) return; seen[k] = 1; opts.push(v); });
  for (var g = 2; opts.length < 4; g++) { var w = frac ? qtFr(ans.n + g, ans.d) : ans + g; if (!seen[key(w)]) { seen[key(w)] = 1; opts.push(w); } }
  for (var i = opts.length - 1; i > 0; i--) { var j = (rnd() * (i + 1)) | 0, t = opts[i]; opts[i] = opts[j]; opts[j] = t; }
  var labels = opts.map(key), ci = labels.indexOf(key(ans));
  return { q: q, a: frac ? ans.n / ans.d : ans, show: key(ans), choices: labels, ci: ci, kind: kind, expl: q + " = " + key(ans) };
}
function qtQuestion(gameId, ctx) {
  var G = qtGame(gameId), T = G.set, rnd = qtRnd(ctx);
  var q = gameId === "sprint" ? qtSprint(T, rnd) : gameId === "optiver" ? qtOptiver(rnd) : gameId === "sequences" ? qtSequence(T, rnd) : gameId === "estimate" ? qtEstimate(T, rnd) : gameId === "percent" ? qtPercent(T, rnd) : qtOdds(T, rnd);
  q.game = gameId;
  return q;
}
/* grade: a choice index for multiple choice; exact for integers; within tol (relative) for estimates; within abs for percents of odds */
function qtCheck(q, raw) {
  if (q.choices) return String(raw) === String(q.ci);
  var v = parseFloat(String(raw).replace(/[^0-9.\-]/g, ""));
  if (!isFinite(v)) return false;
  if (q.abs) return Math.abs(v - q.a) <= (q.tol || 0.6);
  if (q.tol) return Math.abs(v - q.a) <= Math.max(0.5, Math.abs(q.a) * q.tol) || Math.abs(v - q.a) <= 0.011;
  return Math.abs(v - q.a) < 1e-9;
}

/* ---- scores ---- */
function qtNew() { return { runs: [], tier: {}, best: {} }; }
function qtRuns(S, G, n) { return (S && S.runs || []).filter(function (r) { return r.g === G.id && r.tier === G.ver; }).slice(-(n || 60)); }
function qtBest(S, gameId) { var G = qtGame(gameId); return (S && S.best && S.best[gameId + ":" + G.ver]) || 0; }
function qtRecord(S, gameId, score, n, now) {
  var G = qtGame(gameId);
  S.runs.push({ t: now, g: gameId, tier: G.ver, score: score, n: n });
  if (S.runs.length > 2000) S.runs.splice(0, S.runs.length - 2000);
  var key = gameId + ":" + G.ver, prev = S.best[key];
  if (prev == null || score > prev) S.best[key] = score;
  var last = qtRuns(S, G, 5).map(function (r) { return r.score; }).sort(function (a, b) { return a - b; });
  return { median: last.length >= 5 ? last[2] : null, target: G.target, best: S.best[key], newBest: prev == null ? score > 0 : score > prev };
}
/* runs of the current settings only; older runs from the easier ladder stay in S.runs but are not shown */
function qtHistory(S, gameId, n) { return qtRuns(S, qtGame(gameId), n); }
function qtPlayedToday(S, dayKey, keyFn) { return (S && S.runs || []).some(function (r) { return keyFn(r.t) === dayKey; }); }
/* the overall quant level: the recent median of each game against its target */
var QT_LEVELS = [{ min: 0, name: "Counting on fingers" }, { min: 15, name: "Warming up" }, { min: 30, name: "Quick" }, { min: 50, name: "Fast" }, { min: 70, name: "Second nature" }, { min: 90, name: "Quant" }];
function qtLevel(S) {
  var sum = 0, detail = [];
  QT_GAMES.forEach(function (G) {
    var last = qtRuns(S, G, 5).map(function (r) { return r.score; }).sort(function (a, b) { return a - b; });
    var med = last.length ? last[last.length >> 1] : 0;
    sum += Math.max(0, Math.min(1, med / G.target)); detail.push([G.name, "median " + med + " of " + G.target + (last.length < 5 ? " (" + last.length + " of 5 runs)" : "")]);
  });
  var score = 100 * sum / QT_GAMES.length, L = QT_LEVELS[0];
  for (var i = 0; i < QT_LEVELS.length; i++) if (score >= QT_LEVELS[i].min) L = QT_LEVELS[i];
  var ix = QT_LEVELS.indexOf(L), nx = QT_LEVELS[ix + 1] || null;
  return { score: score, name: L.name, about: "Across the games: how your median run compares with its target.", index: ix, count: QT_LEVELS.length, next: nx, toNext: nx ? (score - L.min) / (nx.min - L.min) : 1, detail: detail };
}
var QT_PLAN = [
  { title: "How it works", body: "The games use the same settings as the sites firms point applicants to. Arithmetic is Zetamac's default game: (2–100) + (2–100), subtraction as addition in reverse, (2–12) × (2–100), division as multiplication in reverse, two minutes, and a right answer moves on the moment it is typed, with no Enter and no skipping. The Optiver game is the 80 in 8: 80 multiple-choice questions in eight minutes, +1 for right and −1 for wrong. There is nothing to lose here: no XP penalty, no streak, no place in the daily budget." },
  { title: "The plan", body: "One game a day before the first real session, Zetamac most often: it is the one interviews test and the one that transfers to the others. Once a week play the full 80 in 8. Once a week, look at the history chart and the per-operation breakdown and pick the weak operation for an extra run." },
  { title: "Techniques, in the order to learn them", body: "Addition: left to right, tens first, say the running total. Subtraction: add up from the smaller number (47 to 50 is 3, to 83 is 36). Multiplication: break one factor (7 × 86 = 7 × 80 + 7 × 6), squares near 50 and 100, the difference of squares (48 × 52 = 2500 − 4). Division: find the quotient's first digit, multiply back, subtract. Decimals: count the decimal places, multiply as integers, put them back; for 0.078 ÷ 0.006 move both points until the divisor is whole (78 ÷ 6). Fractions: common denominator, then reduce. Sequences: check differences, then ratios, then second differences, then the odd and even places separately." },
  { title: "Targets", body: "Zetamac default in two minutes: 45–55 is a baseline, 60 is the target here, 70+ is what top trading firms like to see. Optiver 80 in 8: reported pass lines run from about 55 to 70 of 80 after the −1 penalties; the target here is 60." }
];

if (typeof module !== "undefined") module.exports = { QT_GAMES: QT_GAMES, QT_PLAN: QT_PLAN, QT_LEVELS: QT_LEVELS, qtGame: qtGame, qtQuestion: qtQuestion, qtCheck: qtCheck, qtNew: qtNew, qtRecord: qtRecord, qtBest: qtBest, qtHistory: qtHistory, qtPlayedToday: qtPlayedToday, qtLevel: qtLevel };
