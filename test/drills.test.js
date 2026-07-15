const fs=require('fs');
const src = fs.readFileSync(__dirname + '/../src/engine.js','utf8').replace(/if \(typeof module[\s\S]*$/,'')
  + fs.readFileSync(__dirname + '/../src/range.js','utf8') + fs.readFileSync(__dirname + '/../src/drills.js','utf8');
eval(src);
const MODES = ["read","ladder","who","combos","blocker","beat","alpha","mdf","ratio","indiff","sample","tstat","ror","kelly","bayes","update","deviate"];
let bad=[];
for (const m of MODES){
  for(let i=0;i<200;i++){
    let q;
    try{ q = GENS[m](); }catch(e){ bad.push(m+" threw: "+e.message); break; }
    if(q.mode!==m && !(m==="beat"&&q.mode==="combos")) bad.push(m+" wrong mode tag: "+q.mode);
    if(!q.question||!q.math||!q.math.length) bad.push(m+" missing question/math");
    if(!q.bar||!(q.bar.fill>=-0.01&&q.bar.fill<=100.01)) bad.push(m+" bar out of range: "+(q.bar&&q.bar.fill));
    if(q.kind==="number"){ if(!(q.tol>0)) bad.push(m+" bad tol"); if(!isFinite(q.answer)) bad.push(m+" answer not finite"); }
    if(q.kind==="choice"){ if(!q.options||q.options.indexOf(q.answer)<0) bad.push(m+" answer not among options"); }
    if(!(q.target>0)) bad.push(m+" no target");
  }
}
console.log(bad.length ? "PROBLEMS:\n"+[...new Set(bad)].join("\n") : "PASS: all 17 new generators, 200 draws each, invariants hold");

// spot check the maths by hand
const show=(m,n)=>{ for(let i=0;i<n;i++){ const q=GENS[m](); console.log("  "+q.lines?.map(l=>l.join(" ")).join(" | ")+"  ->  "+(q.kind==="choice"?q.answer:q.answer.toFixed(2))); } };
console.log("\nalpha (bet/(bet+pot)):"); show("alpha",3);
console.log("mdf (pot/(pot+bet)):"); show("mdf",3);
console.log("sample (100*(2sd/wr)^2):"); show("sample",3);
console.log("ror:"); show("ror",3);
console.log("combos:"); show("combos",4);
