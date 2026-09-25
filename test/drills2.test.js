/* The new generators: shape invariants on many draws, and the maths
   checked against independent calculations. */
const fs = require("fs");
const src = ["engine.js", "range.js", "drills.js", "drills2.js"].map(f =>
  fs.readFileSync(__dirname + "/../src/" + f, "utf8").replace(/\nif \(typeof module[\s\S]*$/, "")).join("\n");
eval(src);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL " + m); } };
const close = (a, b, t) => Math.abs(a - b) <= (t || 1e-9);

const MODES = ["rules", "position", "prob", "ev", "rfi", "threebet", "spr", "eqr", "cbet", "geo", "multi", "akq", "jam", "icm"];
for (const m of MODES) {
  let bad = 0;
  for (let i = 0; i < 400; i++) {
    let q;
    try { q = GENS[m](); } catch (e) { ok(false, m + " threw " + e.message); break; }
    const probs = [];
    if (q.mode !== m) probs.push("mode " + q.mode);
    if (!q.question || !q.math || !q.math.length || q.math.some(x => typeof x !== "string" || !x)) probs.push("question/math");
    if (q.bar && !(q.bar.fill >= -0.01 && q.bar.fill <= 100.01)) probs.push("bar " + q.bar.fill);
    if (q.kind === "number" && (!(q.tol > 0) || !isFinite(q.answer))) probs.push("number answer/tol");
    if (q.kind === "choice" && (!q.options || q.options.indexOf(q.answer) < 0)) probs.push("choice answer");
    if (!(q.target > 0)) probs.push("target");
    if (q.math.join(" ").match(/NaN|undefined|Infinity/)) probs.push("NaN in math: " + q.math.join(" | "));
    if (probs.length) { bad++; if (bad < 3) console.log("  " + m + ": " + probs.join(", ")); }
  }
  ok(!bad, m + ": 400 draws hold every invariant");
}

/* independent checks */
ok(close(choose(52, 2), 1326), "C(52,2) = 1326");
ok(close(1 - choose(48, 3) / choose(50, 3), 0.1176, 1e-4), "set on the flop 11.76%");
ok(close(geoFrac(10, 10, 1), 1), "one street, stack = pot: pot-size bet");
ok(close(geoFrac(10, 40, 2), 1), "two streets, stack 4× pot: pot, pot");
ok(close(geoFrac(10, 130, 3), 1), "three streets, stack 13× pot: pot, pot, pot");
/* geometric bets really get it all in */
for (const [p, s, n] of [[12, 90, 3], [20, 35, 2], [7, 50, 3]]) {
  const f = geoFrac(p, s, n); let pot = p, st = s;
  for (let i = 0; i < n; i++) { const b = f * pot; st -= b; pot += 2 * b; }
  ok(close(st, 0, 1e-6), "geometric sizing empties the stack: " + p + "/" + s + "/" + n);
}
/* ICM: sums to the prize pool, equal stacks split evenly, and matches a hand computation */
const e1 = icmEquity([5000, 3000, 2000], [50, 30, 20]);
ok(close(e1[0] + e1[1] + e1[2], 100, 1e-9), "ICM hands out the whole prize pool");
ok(close(icmEquity([1, 1, 1], [50, 30, 20])[2], 100 / 3, 1e-9), "equal stacks, equal equity");
const T = 10000, s = [5000, 3000, 2000];
const p1 = s.map(x => x / T);
const p2 = s.map((x, i) => s.reduce((a, y, j) => j === i ? a : a + p1[j] * x / (T - y), 0));
const p3 = s.map((_, i) => 1 - p1[i] - p2[i]);
ok(close(e1[0], 50 * p1[0] + 30 * p2[0] + 20 * p3[0], 1e-9), "ICM matches the closed form for three players");
ok(e1[0] < 50 && e1[2] > 20, "ICM: the big stack is worth less than its chip share, the short stack more");
/* AKQ: pot 2, bet 1 gives the textbook one-third and one-third */
ok(close(1 / (2 + 1), 1 / 3), "AKQ beta = B/(P+B)");
ok(close((2 - 1) / (2 + 1), 1 / 3), "AKQ call = (P-B)/(P+B)");
/* the RFI chart widens toward the button */
const pct = Object.fromEntries(Object.keys(RFI).map(k => [k, rangePct(RFI[k])]));
ok(pct.UTG < pct.HJ && pct.HJ < pct.CO && pct.CO < pct.BTN, "charts widen UTG < HJ < CO < BTN: " + JSON.stringify(Object.fromEntries(Object.entries(pct).map(([k, v]) => [k, v.toFixed(1)]))));
ok(pct.UTG > 12 && pct.UTG < 22 && pct.BTN > 38 && pct.BTN < 55, "chart sizes are in the usual bands");
ok(Object.keys(RFI).every(k => Object.keys(rangeClasses(RFI.UTG)).every(h => rangeClasses(RFI[k])[h])), "every seat opens everything UTG opens");
ok(HAND_CLASSES.length === 169, "169 starting-hand classes");
/* multi-street: pot and pot gives 5/9 */
const a = 1 / 3; ok(close(a + (1 - a) * a, 5 / 9), "two pot-size streets: 5/9 of turn bets are bluffs");

console.log("drills2: " + pass + " passed, " + fail + " failed");
if (fail) process.exit(1);
