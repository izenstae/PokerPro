/* The turn solver: two streets by backward induction. Solve every river
   subgame, back its per-pair value up, then solve the turn's betting tree
   against those continuations. Depends on the range engine, the evaluator
   and the river solver, so eval the four modules together. */
const fs = require('fs');
const strip = f => fs.readFileSync(__dirname + '/../src/' + f, 'utf8').replace(/\nif \(typeof module[\s\S]*$/, '');
eval(strip('engine.js') + '\n' + strip('range.js') + '\n' + strip('river.js') + '\n' + strip('turn.js'));

const C = s => "23456789TJQKA".indexOf(s[0]) + 13 * "cdhs".indexOf(s[1]);
const board = str => str.trim().split(/\s+/).map(C);

let ok = 0, n = 0;
const chk = (s, c) => { n++; if (c) ok++; console.log((c ? "PASS " : "FAIL ") + s); };

/* ---- turn payoff units (see the tree in turn.js) ---- */
chk("turn check-through goes to river with the dead pot (2)", turnPotToRiver("xx") === 2);
chk("turn bet-pot + call sends the full pot to the river (6)", turnPotToRiver("pc") === 6);
chk("turn bet-pot, villain folds -> P0 wins the dead pot (+1)", turnFoldPay0("pf") === 1);
chk("turn check, villain bets pot, P0 folds -> -1", turnFoldPay0("xpf") === -1);

/* ---- a real two-street spot on A K 7 3, one card to come ---- */
const B4 = board("As Kd 7h 3c");
const OOP = parseRange("AQ, AJ, KQ, 99, 88");
const IP  = parseRange("AA, KK, AK, 77, QJs, JTs, T9s");

console.log("\nsolving 48 river subgames and backing them up...");
let s = Date.now();
const t = new Turn(OOP, IP, B4, { riverBuckets: 6, riverIters: 30 });
console.log("built in", Date.now() - s, "ms   rivers:", t.riverCount, "  turn deals:", t.deals.length);
chk("every river card was solved", t.riverCount === 48);
chk("turn deals were enumerated", t.deals.length > 100);
chk("a continuation value was backed up for a live pair", Number.isFinite(t.G[0][0]));

console.log("\niters   value      exploitability   infosets   ms");
let prev = 0, e0 = null;
for (const m of [1, 100, 400, 1200]) {
  s = Date.now(); t.train(m - prev); prev = m; const ms = Date.now() - s;
  const e = t.exploitability();
  if (e0 === null) e0 = e;
  console.log(String(t.iters).padEnd(7), t.evUnderAvg().toFixed(4).padEnd(10), e.toFixed(5).padEnd(16), String(t.infosets()).padEnd(10), ms + "ms");
}
const e = t.exploitability();
chk("turn exploitability fell during training", e < e0);
chk("turn exploitability is small after 1200 iters (< 0.06)", e < 0.06);

/* zero-sum bracket: each best response beats the value it guarantees */
const b0 = t.bestResponse(0), b1 = t.bestResponse(1);
console.log("\nBR to P0:", b0.toFixed(4), " BR to P1:", b1.toFixed(4), " value:", t.evUnderAvg().toFixed(4));
chk("BR0 >= game value", b0 >= t.evUnderAvg() - 1e-6);
chk("BR1 >= -game value", b1 >= -t.evUnderAvg() - 1e-6);

/* ---- the deferred (chunked) backup matches the one-shot solve ----
   The UI spreads the 48 river solves over animation frames; vanilla CFR has
   no randomness, so the chunked path must reproduce the same value. */
const td = new Turn(OOP, IP, B4, { defer: true, riverBuckets: 6, riverIters: 30 });
let rem; do { rem = td.solveRiverStep(7); } while (rem > 0);
td.finishBackup(); td.train(1200);
console.log("\nchunked backup value:", td.evUnderAvg().toFixed(4), " one-shot value:", t.evUnderAvg().toFixed(4));
chk("chunked river backup reproduces the one-shot solve", Math.abs(td.evUnderAvg() - t.evUnderAvg()) < 1e-9);

/* ---- abstraction on the turn tree cuts infosets ---- */
const ta = new Turn(OOP, IP, B4, { buckets: 6, riverBuckets: 6, riverIters: 30 }); ta.train(1000);
console.log("\nturn buckets=6 infosets:", ta.infosets(), " full infosets:", t.infosets());
chk("turn buckets cut the infoset count", ta.infosets() < t.infosets());
chk("bucketed turn value stays close to the full solve (within 0.06)", Math.abs(ta.evUnderAvg() - t.evUnderAvg()) < 0.06);

/* ---- what the turn learned: OOP's opening line ---- */
console.log("\n--- OOP opening the turn (check / bet ½ / bet pot) ---");
t.byClass(0, 0).forEach(g => {
  const f = g.freq.map(x => (100 * x).toFixed(0).padStart(3) + "%");
  console.log("  " + g.name.padEnd(4) + " x" + g.count + "  check " + f[0] + "  ½ " + f[1] + "  pot " + f[2]);
});

console.log("\n" + ok + "/" + n);
if (ok < n) process.exit(1);
