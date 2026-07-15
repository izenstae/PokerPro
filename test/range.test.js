const src = require('fs').readFileSync(__dirname + '/../src/engine.js','utf8').replace(/if \(typeof module[\s\S]*$/,'')
          + require('fs').readFileSync(__dirname + '/../src/range.js','utf8');
eval(src);
let pass=0, fail=0;
const t=(name,got,want)=>{ const ok = JSON.stringify(got)===JSON.stringify(want);
  console.log((ok?"PASS":"FAIL")+" "+name+"  got "+JSON.stringify(got)+(ok?"":" want "+JSON.stringify(want))); ok?pass++:fail++; };
const n = s => parseRange(s).length;

t("AA is 6 combos", n("AA"), 6);
t("AKs is 4", n("AKs"), 4);
t("AKo is 12", n("AKo"), 12);
t("AK is 16", n("AK"), 16);
t("77+ is 8 pairs x6", n("77+"), 48);
t("77-JJ is 5 pairs x6", n("77-JJ"), 30);
t("QQ+ is 18", n("QQ+"), 18);
t("A2s-A5s is 4 hands x4", n("A2s-A5s"), 16);
t("T9s+ walks connectors (T9s,JTs,QJs,KQs,AKs)=20", n("T9s+"), 20);
t("KJo+ is KJo,KQo = 24", n("KJo+"), 24);
t("explicit AsKh", n("AsKh"), 1);
t("dedupes overlap", n("AA, AA, AhAs"), 6);
t("compound range", n("QQ+, AKs"), 22);

// card removal / blockers
const AK = parseRange("AK");
t("AK after my Ah blocks 4", removeDead(AK, [12+13*2]).length, 12);
t("AA after my Ah blocks 3", removeDead(parseRange("AA"), [12+13*2]).length, 3);
const C=t2=>"23456789TJQKA".indexOf(t2[0])+13*"cdhs".indexOf(t2[1]);
t("AK on an A-high board (2 aces gone)", removeDead(AK,[C("Ah"),C("Ad"),C("7c"),C("2s")]).length, 8);
t("nut flush blocker: AsXs combos with As dead", removeDead(parseRange("AsKs,AsQs,AsJs"),[C("As")]).length, 0);

// equity sanity: AA vs a range of AK only should be ~93%
const eq = equityVsRange([C("Ah"),C("As")], parseRange("AKo"), [], 20000);
console.log((Math.abs(eq*100-92.7)<1.2?"PASS":"FAIL")+" AA vs AKo range = "+(100*eq).toFixed(1)+"% (want ~92.7)");
Math.abs(eq*100-92.7)<1.2?pass++:fail++;

// rangeSplit: on Ah7h2c holding AsKd vs range QQ,77,22 -> sets beat us
const sp = rangeSplit([C("As"),C("Kd")], parseRange("QQ,77,22"), [C("Ah"),C("7h"),C("2c")]);
t("split vs QQ/77/22 on A72", [sp.beat,sp.lose,sp.total], [6,6,12]);
console.log("\n"+pass+" pass, "+fail+" fail");

if (fail) process.exit(1);
