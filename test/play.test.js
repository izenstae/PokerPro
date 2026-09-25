/* Bots, the coach and a session: policies are proper distributions,
   ranges shrink the way the styles say, the coach prices obvious spots
   the obvious way, and long sessions run clean. */
const fs = require("fs");
eval(["engine.js", "range.js", "drills.js", "drills2.js", "holdem.js", "bots.js", "coach.js", "play.js"].map(f =>
  fs.readFileSync(__dirname + "/../src/" + f, "utf8").replace(/\nif \(typeof module[\s\S]*$/, "")).join("\n"));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL " + m); } };
const C = s => "23456789TJQKA".indexOf(s[0]) + 13 * "cdhs".indexOf(s[1]);
let seed = 7; const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

ok(COMBOS.length === 1326, "1326 combos");
ok(comboIndex(C("As"), C("Kd")) === comboIndex(C("Kd"), C("As")), "combo index is symmetric");

/* preflop: a Reg opening UTG raises exactly its chart */
const t0 = hNewTable([0, 1, 2, 3, 4, 5].map(i => ({ name: "P" + i })));
hStart(t0, rng);
const ctx0 = botCtx(t0, t0.hand.toAct);
const P0 = botPolicy("reg", ctx0, rangeNew([]));
const raiseShare = P0.raise.reduce((a, b) => a + b, 0) / 1326;
ok(Math.abs(raiseShare - rangePct(RFI.UTG) / 100) < 1e-9, "Reg UTG opens its chart: " + (100 * raiseShare).toFixed(1) + "%");
let sumsOk = true;
for (let i = 0; i < 1326; i++) if (Math.abs(P0.fold[i] + P0.call[i] + P0.raise[i] - 1) > 1e-6) sumsOk = false;
ok(sumsOk, "preflop policy sums to one for every hand");

/* postflop: facing a pot-size bet heads up, a Reg defends about MDF = 50% of its range */
const board = [C("Kd"), C("7s"), C("2c")];
const w = rangeNew(board);
const ctxF = { street: 1, toCall: 10, pot: 20, currentBet: 10, myBet: 0, stack: 90, minTo: 20, maxTo: 90, canRaise: true, defenders: 1, board, isPFA: false, aggressor: 1, nOpp: 1, firstIn: false };
const PF = botPolicy("reg", ctxF, w);
let m = 0, cont = 0;
for (let i = 0; i < 1326; i++) if (w[i]) { m += w[i]; cont += w[i] * (PF.call[i] + PF.raise[i]); }
ok(Math.abs(cont / m - 0.5) < 0.03, "Reg defends ~MDF against a pot bet: " + (100 * cont / m).toFixed(1) + "%");
const PN = botPolicy("nit", ctxF, w), PS = botPolicy("station", ctxF, w);
const share = P => { let c = 0; for (let i = 0; i < 1326; i++) if (w[i]) c += w[i] * (P.call[i] + P.raise[i]); return c / m; };
ok(share(PN) < 0.4 && share(PS) > 0.65, "Nit under-defends, Station over-defends: " + (100 * share(PN)).toFixed(0) + "% / " + (100 * share(PS)).toFixed(0) + "%");

/* betting: a Reg's bluffs are about alpha of its bets */
const ctxB = Object.assign({}, ctxF, { toCall: 0, currentBet: 0, minTo: 1, isPFA: true, aggressor: 1, firstIn: true });
const T = boardTable(board);
const PB = botPolicy("reg", ctxB, w);
let bets = 0, value = 0;
const byS = T.valid.slice().sort((a, b) => T.ehs[b] - T.ehs[a]);
const vset = new Set(); let acc = 0; for (const i of byS) { if (acc >= 0.3 * m) break; vset.add(i); acc += w[i]; }
for (let i = 0; i < 1326; i++) if (w[i] && PB.raise[i]) { bets += w[i]; if (vset.has(i)) value += w[i]; }
const alpha = 0.5 / 2;
ok(Math.abs((bets - value) / bets - alpha) < 0.03, "Reg's flop bets are ~alpha bluffs: " + (100 * (bets - value) / bets).toFixed(1) + "% vs α " + 100 * alpha + "%");

/* strength table: the nuts are at the top */
ok(T.hs[comboIndex(C("Kh"), C("Ks"))] > 0.99, "top set is near the top of the table");
ok(drawOuts(C("Ah"), C("5h"), [C("Kh"), C("7h"), C("2c")]) === 9, "flush draw: nine outs");
ok(drawOuts(C("9d"), C("8c"), [C("Th"), C("7s"), C("2c")]) === 8, "open-ender: eight outs");

/* equity against a range: AA vs a random hand ~85% preflop */
const eqAA = equityVs([C("As"), C("Ah")], [], [rangeNew([C("As"), C("Ah")])], 4000, rng);
ok(Math.abs(eqAA - 0.852) < 0.03, "AA vs a random hand ≈ 85%: " + (100 * eqAA).toFixed(1));
/* river exact: the nuts against anything is 100% */
const rb = [C("As"), C("Ks"), C("Qs"), C("2d"), C("7c")];
ok(equityVs([C("Js"), C("Ts")], rb, [rangeNew([C("Js"), C("Ts")].concat(rb))]) === 1, "royal flush on the river: equity 1");

/* coach on real spots */
function spot(heroCards, lineup) {
  seed = 99;
  const g = playNew(lineup || "mixed", rng);
  playDeal(g);
  return g;
}
let g = spot(); let steps = 0;
while (!playHeroTurn(g) && !g.t.hand.over && steps++ < 20) playBotStep(g);
if (playHeroTurn(g)) {
  const A = playAnalyze(g);
  ok(A.options.length >= 2 && A.options.every(o => isFinite(o.ev)), "coach prices every option: " + A.options.map(o => o.label + " " + o.ev.toFixed(2)).join(", "));
  ok(A.options.some(o => o.key === A.best), "coach names a best option");
  const f = A.options.find(o => o.type === "fold"); if (f) ok(f.ev === 0, "fold is worth zero");
}

/* long sessions: the hero follows the coach, bots play, nothing breaks */
seed = 1234;
g = playNew("mixed", rng);
let hands = 0, decisions = 0, errors = 0, tMax = 0, conserved = true, rangesOk = true;
for (let n = 0; n < 150; n++) {
  playDeal(g);
  let guard = 0;
  while (!g.t.hand.over && guard++ < 200) {
    try {
      if (playHeroTurn(g)) {
        const t1 = Date.now();
        const A = playAnalyze(g);
        tMax = Math.max(tMax, Date.now() - t1);
        const pickBest = rng() < 0.7;
        const o = pickBest ? A.options.find(x => x.key === A.best) : A.options[(rng() * A.options.length) | 0];
        playHeroAct(g, o.type === "raise" ? { type: "raise", to: o.to } : { type: o.type });
        decisions++;
      } else {
        const seat = g.t.hand.toAct;
        playBotStep(g);
        if (g.ranges[seat] && rangeMass(g.ranges[seat]) <= 0) rangesOk = false;
      }
    } catch (e) { errors++; console.log(e.stack); break; }
  }
  if (!g.t.hand.over) errors++;
  const s = g.t.hand.result.net.reduce((a, b) => a + b, 0);
  if (Math.abs(s) > 1e-6) conserved = false;
  hands++;
}
ok(!errors, "150 hands with the coach: no errors");
ok(conserved, "chips conserved every hand");
ok(rangesOk, "tracked ranges never collapse to nothing");
ok(g.session.hands === 150 && g.session.decisions === decisions, "session counts hands and decisions: " + decisions + " decisions");
ok(tMax < 2500, "slowest analysis " + tMax + " ms");
const grades = g.session.grades;
ok(grades.Best > grades.Blunder, "following the coach mostly grades Best: " + JSON.stringify(grades));
console.log("  session: " + g.session.hands + " hands, net " + g.session.net.toFixed(1) + " bb, EV lost " + g.session.lost.toFixed(1) + " bb, leaks " + JSON.stringify(playLeaks(g.session, 3).slice(0, 3).map(l => l.id + ":" + l.lost.toFixed(1))));

console.log("play: " + pass + " passed, " + fail + " failed");
if (fail) process.exit(1);
