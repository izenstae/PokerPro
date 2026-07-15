const {Leduc, lExploitability, lBestResponse, L_DEALS} = require('../src/leduc.js');
console.log("deals enumerated:", L_DEALS.length, "(want 120)");
const t = new Leduc();
const avg = (k,n)=>t.average(k,n);
console.log("\niters     value       exploitability   infosets   ms");
let prev=0;
for (const m of [1, 10, 100, 500, 2000, 4000]) {
  const t0=Date.now(); t.train(m-prev); prev=m; const ms=Date.now()-t0;
  console.log(String(t.iters).padEnd(9), t.gameValue().toFixed(5).padEnd(11), lExploitability(avg).toFixed(6).padEnd(16), String(t.infosets()).padEnd(10), ms+"ms");
}
let ok=0,n=0; const chk=(s,c)=>{n++;if(c)ok++;console.log((c?"PASS ":"FAIL ")+s);};
console.log("");
const e = lExploitability(avg);
chk("exploitability under 0.02 chips/hand", e < 0.02);
chk("exploitability fell below the 2 chip ante", e < 2);
chk("game value is negative (acting first costs)", t.gameValue() < 0);
chk("infoset count is 288", t.infosets() === 288);
// zero sum sanity: BR values must bracket the game value
const b0 = lBestResponse(avg,0), b1 = lBestResponse(avg,1);
console.log("\nbest response for P0:", b0.toFixed(5), " (>= game value)");
console.log("best response for P1:", b1.toFixed(5), " (>= -game value)");
chk("BR0 >= game value", b0 >= t.gameValue() - 1e-6);
chk("BR1 >= -game value", b1 >= -t.gameValue() - 1e-6);

console.log("\n--- what it learned ---");
const R=["J","Q","K"];
console.log("Round 1 opening (bet frequency):");
for(let c=0;c<3;c++){ const s=avg(c+"::"+":",3); console.log("  "+R[c]+"  check "+(100*s[0]).toFixed(1)+"%  bet "+(100*s[1]).toFixed(1)+"%"); }
console.log("Round 1 facing a bet (fold/call/raise):");
for(let c=0;c<3;c++){ const s=avg(c+":r:"+":",3); console.log("  "+R[c]+"  fold "+(100*s[0]).toFixed(1)+"%  call "+(100*s[1]).toFixed(1)+"%  raise "+(100*s[2]).toFixed(1)+"%"); }
console.log("Round 2 opening, by (my card, board):");
for(let c=0;c<3;c++) for(let b=0;b<3;b++){
  const s=avg(c+":cc:"+b+":",2);
  console.log("  "+R[c]+" on "+R[b]+(c===b?" (paired!)":"       ")+"  check "+(100*s[0]).toFixed(1)+"%  bet "+(100*s[1]).toFixed(1)+"%");
}
console.log("\n"+ok+"/"+n);

if (ok < n) process.exit(1);
