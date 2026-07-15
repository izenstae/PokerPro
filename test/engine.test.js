var E = require('../src/engine.js');
var RANKS = "23456789TJQKA", SUITS = "cdhs";
function C(s) { return SUITS.indexOf(s[1]) * 13 + RANKS.indexOf(s[0]); }
function H(str) { return str.split(" ").map(C); }

function chk(name, got, want, tol) {
  var ok = tol === undefined ? got === want : Math.abs(got - want) <= tol;
  console.log((ok ? "PASS " : "FAIL ") + name + " -> got " + got + " want " + want);
  if (!ok) process.exitCode = 1;
}

/* ---- evaluator categories ---- */
chk("royal flush", E.handCategory(E.eval7(H("As Ks Qs Js Ts 2c 3d"))), "straight flush");
chk("wheel sf", E.handCategory(E.eval7(H("As 2s 3s 4s 5s Kd Qh"))), "straight flush");
chk("quads", E.handCategory(E.eval7(H("7c 7d 7h 7s Kd Qh 2c"))), "four of a kind");
chk("boat trips+pair", E.handCategory(E.eval7(H("7c 7d 7h Kd Ks 2c 3h"))), "full house");
chk("boat trips+trips", E.handCategory(E.eval7(H("7c 7d 7h Kd Ks Kh 3c"))), "full house");
chk("flush", E.handCategory(E.eval7(H("As Ts 8s 5s 2s Kd Qh"))), "flush");
chk("broadway straight", E.handCategory(E.eval7(H("Ac Kd Qh Js Tc 3d 4h"))), "straight");
chk("wheel straight", E.handCategory(E.eval7(H("Ac 2d 3h 4s 5c Kd Qh"))), "straight");
chk("no wraparound", E.handCategory(E.eval7(H("Qc Kd Ah 2s 3c 7d 9h"))), "high card");
chk("trips", E.handCategory(E.eval7(H("7c 7d 7h Kd 2s 4c 9h"))), "three of a kind");
chk("two pair", E.handCategory(E.eval7(H("7c 7d Kh Kd 2s 4c 9h"))), "two pair");
chk("pair", E.handCategory(E.eval7(H("7c 7d Kh 2d 3s 4c 9h"))), "one pair");
chk("flush beats straight", E.eval7(H("As Ts 8s 5s 2s Kd Qh")) > E.eval7(H("Ac Kd Qh Js Tc 3d 4h")), true);
chk("boat beats flush", E.eval7(H("7c 7d 7h Kd Ks 2s 3s")) > E.eval7(H("As Ts 8s 5s 2s Kd Qh")), true);

/* ---- kickers ---- */
chk("better kicker wins", E.eval7(H("Ac Kd 9h 5s 2c 3d 7h")) > E.eval7(H("Ac Qd 9h 5s 2c 3d 7h")), true);
chk("identical boards tie", E.eval7(H("2c 3d 9h 5s 7c Kd Qh")) === E.eval7(H("2c 3d 9h 5s 7c Kd Qh")), true);

/* ---- known preflop equities ---- */
var t0 = Date.now();
chk("AA vs KK", (100 * E.equityMC(H("As Ad"), H("Kc Kh"), 60000)).toFixed(1) * 1, 81.26, 0.6);
chk("AKs vs QQ", (100 * E.equityMC(H("As Ks"), H("Qc Qh"), 60000)).toFixed(1) * 1, 46.21, 0.7);
chk("AKo vs AQo", (100 * E.equityMC(H("Ah Kd"), H("As Qc"), 60000)).toFixed(1) * 1, 74.02, 0.7);
chk("72o vs AKo", (100 * E.equityMC(H("7h 2c"), H("As Kd"), 60000)).toFixed(1) * 1, 33.00, 0.8);
chk("JTs vs AA", (100 * E.equityMC(H("Jh Th"), H("As Ad"), 60000)).toFixed(1) * 1, 22.0, 0.8);
console.log("MC time for 5 runs: " + (Date.now() - t0) + "ms");

/* ---- known flop equities (exact) ---- */
/* nut flush draw + overcards vs top pair: AhKh on Qc 7h 2h vs Qd Jc */
var t1 = Date.now();
console.log("AhKh vs QdJc on Qc7h2h = " + (100 * E.equityExact(H("Ah Kh"), H("Qd Jc"), H("Qc 7h 2h"))).toFixed(2) + "%  (expect ~54)");
console.log("AsAd vs 7c7h on Kc9d2s  = " + (100 * E.equityExact(H("As Ad"), H("7c 7h"), H("Kc 9d 2s"))).toFixed(2) + "%  (expect ~91)");
console.log("bare FD 6h5h vs AsAc on Ah 9h 2c = " + (100 * E.equityExact(H("6h 5h"), H("As Ac"), H("Ah 9h 2c"))).toFixed(2) + "%  (expect ~18)");
console.log("exact time for 3 runs: " + (Date.now() - t1) + "ms");

/* ---- generators run clean ---- */
Object.keys(E.GENS).forEach(function (k) {
  for (var i = 0; i < 30; i++) {
    var q = E.GENS[k]();
    if (q.kind === "number" && !isFinite(q.answer)) { console.log("FAIL gen " + k + " bad answer"); process.exitCode = 1; return; }
    if (q.kind === "choice" && ["CALL", "FOLD"].indexOf(q.answer) < 0) { console.log("FAIL gen " + k + " bad choice"); process.exitCode = 1; return; }
  }
  console.log("PASS gen " + k);
});
