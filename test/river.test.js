/* River subgame solver: convergence, zero-sum bracket, payoff units,
   and a dominance sanity check. Depends on the layer 2 range engine
   and the 7-card evaluator, so eval the three modules together. */
const fs = require('fs');
const strip = f => fs.readFileSync(__dirname + '/../src/' + f, 'utf8').replace(/\nif \(typeof module[\s\S]*$/, '');
eval(strip('engine.js') + '\n' + strip('range.js') + '\n' + strip('river.js'));

const C = s => "23456789TJQKA".indexOf(s[0]) + 13 * "cdhs".indexOf(s[1]);
const board = str => str.trim().split(/\s+/).map(C);

let ok = 0, n = 0;
const chk = (s, c) => { n++; if (c) ok++; console.log((c ? "PASS " : "FAIL ") + s); };

/* ---- payoff units (see the tree in river.js) ---- */
chk("both check, P0 wins the dead pot -> +3", rvPayoff0("xx", 1) === 3);
chk("both check, P0 loses -> -3", rvPayoff0("xx", -1) === -3);
chk("both check, chop -> 0", rvPayoff0("xx", 0) === 0);
chk("bet pot + call, P0 wins -> +9", rvPayoff0("pc", 1) === 9);
chk("bet pot, villain folds -> +3", rvPayoff0("pf", 1) === 3);
chk("check, villain bets pot, P0 folds -> -3", rvPayoff0("xpf", 0) === -3);
chk("zero sum: half-pot bet+call sums to 0", rvPayoff0("hc", 1) + rvPayoff0("hc", -1) === 0);

/* ---- a real spot: BTN (in position, polarized bettor) vs BB, on A K 7 3 2 ---- */
const B = board("As Kd 7h 3c 2s");
const OOP = parseRange("AQ, AJ, KQ, 99, 88");                       /* bluff-catchers */
const IP  = parseRange("AA, KK, AK, 77, QJs, JTs, T9s, 65s");       /* value + missed draws */
const t = new River(OOP, IP, B);
console.log("\ndeals enumerated:", t.deals.length);
chk("deals were enumerated", t.deals.length > 100);

console.log("\niters   game value   exploitability   infosets   ms");
let prev = 0, e0 = null;
for (const m of [1, 100, 400, 1500]) {
  const s = Date.now(); t.train(m - prev); prev = m; const ms = Date.now() - s;
  const e = t.exploitability();
  if (e0 === null) e0 = e;
  console.log(String(t.iters).padEnd(7), t.gameValue().toFixed(4).padEnd(12), e.toFixed(5).padEnd(16), String(t.infosets()).padEnd(10), ms + "ms");
}
const e = t.exploitability();
chk("exploitability fell during training", e < e0);
chk("exploitability is small after 1500 iters (< 0.05)", e < 0.05);

/* zero-sum bracket: each best response is at least the value it can guarantee */
const b0 = t.bestResponse(0), b1 = t.bestResponse(1);
console.log("\nBR to P0:", b0.toFixed(4), " BR to P1:", b1.toFixed(4), " (sum ~ exploitability)");
chk("BR0 >= game value", b0 >= t.gameValue() - 1e-6);
chk("BR1 >= -game value", b1 >= -t.gameValue() - 1e-6);

/* ---- dominance: trip aces vs trip kings, P0 can never lose ---- */
const d = new River(parseRange("AA"), parseRange("KK"), board("As Ks 7h 3c 2d"));
d.train(1200);
console.log("\nnuts vs air game value to P0:", d.gameValue().toFixed(4), "(>= +2.9, wins the pot every time)");
chk("dominant range wins at least the dead pot", d.gameValue() > 2.9);

/* ---- what the real spot learned ---- */
console.log("\n--- IP (in position) betting after OOP checks ---");
t.byClass(1, 1).forEach(g => {   /* slot 1 = IP acting after a check: check / bet ½ / bet pot */
  const f = g.freq.map(x => (100 * x).toFixed(0).padStart(3) + "%");
  console.log("  " + g.name.padEnd(4) + " x" + g.count + "  check " + f[0] + "  ½pot " + f[1] + "  pot " + f[2]);
});

console.log("\n" + ok + "/" + n);
if (ok < n) process.exit(1);
