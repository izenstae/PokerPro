const {CFR, exploitability, bestResponse} = require('../src/cfr.js');
const t = new CFR();
const marks = [1, 10, 100, 1000, 10000, 100000];
let prev = null;
console.log("iters      value      exploitability");
for (const m of marks) {
  t.train(m - (prev||0)); prev = m;
  const avg = k => t.average(k);
  console.log(String(t.iters).padEnd(10), t.gameValue().toFixed(5).padEnd(10), exploitability(avg).toFixed(6));
}
const avg = k => t.average(k);
console.log("\nKnown Nash: game value to P0 = -1/18 =", (-1/18).toFixed(5));
console.log("converged  :", t.gameValue().toFixed(5));

// the alpha relationship: P0 bets J with prob a, bets K with prob 3a, never bets Q
const bJ = avg("0")[1], bQ = avg("1")[1], bK = avg("2")[1];
console.log("\nP0 opening frequencies");
console.log("  bet J (bluff) a =", bJ.toFixed(4), " must lie in [0, 1/3]");
console.log("  bet Q         =", bQ.toFixed(4), " must be 0");
console.log("  bet K         =", bK.toFixed(4), " must equal 3a =", (3*bJ).toFixed(4));
console.log("\nP1 facing a bet");
console.log("  call with Q   =", avg("1b")[1].toFixed(4), " must be 1/3");
console.log("  call with J   =", avg("0b")[1].toFixed(4), " must be 0");
console.log("\nP0 facing a check-bet");
console.log("  call with Q   =", avg("1pb")[1].toFixed(4), " must be a + 1/3 =", (bJ+1/3).toFixed(4));

let ok = 0, n = 0;
const chk=(name,cond)=>{n++;if(cond)ok++;console.log((cond?"PASS ":"FAIL ")+name);};
console.log("");
chk("game value -> -1/18", Math.abs(t.gameValue()+1/18) < 0.002);
chk("exploitability -> 0", exploitability(avg) < 0.002);
chk("never bet Q", bQ < 0.02);
chk("bet J alpha in [0,1/3]", bJ >= -0.01 && bJ <= 0.34);
chk("bet K = 3 x bet J", Math.abs(bK - 3*bJ) < 0.03);
chk("P1 calls Q at 1/3", Math.abs(avg("1b")[1] - 1/3) < 0.03);
chk("P1 never calls J", avg("0b")[1] < 0.02);
chk("P0 calls Q at alpha+1/3", Math.abs(avg("1pb")[1] - (bJ+1/3)) < 0.03);
console.log("\n"+ok+"/"+n);

if (ok < n) process.exit(1);
