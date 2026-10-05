/* The level tracker: ratings stay in range and move the right way,
   weaknesses are the skills you actually play badly, mistakes are kept
   for review, and a real session feeds it without errors. */
const fs = require("fs");
eval(["engine.js", "range.js", "drills.js", "drills2.js", "holdem.js", "bots.js", "coach.js", "play.js", "level.js"].map(f =>
  fs.readFileSync(__dirname + "/../src/" + f, "utf8").replace(/\nif \(typeof module[\s\S]*$/, "")).join("\n"));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL " + m); } };

/* a fake hand: decisions with a given grade and concept */
const Q = { Best: 1, Good: 0.85, Inaccuracy: 0.55, Mistake: 0.25, Blunder: 0 };
function hand(no, specs) {
  return { no, pos: "BTN", cards: [0, 1], decisions: specs.map(([grade, c]) => ({
    A: { street: 1, board: [2, 3, 4], pot: 10, toCall: 5, eq: 0.3, best: "fold",
         options: [{ key: "fold", label: "Fold", ev: 0 }, { key: "call", label: "Call 5", ev: -2 }] },
    G: { quality: Q[grade], loss: grade === "Best" ? 0 : 2, grade, concepts: [c], chosen: grade === "Best" ? "fold" : "call", lines: ["x"] }
  })) };
}

/* placement, then levels */
let L = lvNew();
ok(!lvSummary(L).placed && lvSummary(L).rating === null, "no rating before any decision");
for (let i = 0; i < 10; i++) L = lvAddHand(L, hand(i, [["Good", "price"]]), 1000 + i);
ok(!lvSummary(L).placed && lvSummary(L).left === 10, "placement counts down");
for (let i = 10; i < 30; i++) L = lvAddHand(L, hand(i, [["Good", "price"]]), 1000 + i);
const s1 = lvSummary(L);
ok(s1.placed && s1.rating > 75 && s1.rating <= 85, "steady Good decisions rate in the 75-85 band: " + s1.rating.toFixed(1));
ok(["Solid reg", "Strong"].indexOf(s1.level.name) >= 0, "level from rating: " + s1.level.name);

/* the rating is recent: a run of blunders pulls it down, and the delta says so */
for (let i = 30; i < 230; i++) L = lvAddHand(L, hand(i, [[i < 130 ? "Best" : "Mistake", i % 2 ? "cbet" : "rfi"]]), 2000 + i);
const s2 = lvSummary(L);
ok(s2.rating < 35 && s2.delta < -50, "recent mistakes drag the rating down: " + s2.rating.toFixed(1) + ", delta " + s2.delta.toFixed(1));
ok(lvLevel(0).name === "Beginner" && lvLevel(100).name === "Elite" && lvLevel(65).name === "Regular", "level ladder edges");
ok(LV_LEVELS.every((x, i) => !i || x.min > LV_LEVELS[i - 1].min), "level floors climb");

/* weaknesses: the skill played badly, not the one played well */
let W = lvNew();
for (let i = 0; i < 60; i++) W = lvAddHand(W, hand(i, [["Best", "rfi"], [i % 3 ? "Mistake" : "Good", "mdf"]]), 5000 + i);
const weak = lvWeak(W).map(k => k.id);
ok(weak[0] === "mdf" && weak.indexOf("rfi") < 0, "weakness is the bad skill: " + weak.join(","));
const sk = lvSkills(W);
ok(sk.find(k => k.id === "rfi").rating > sk.find(k => k.id === "mdf").rating, "per-skill ratings rank the skills");
ok(Object.keys(LV_SKILLS).every(id => GENS[LV_SKILLS[id].drill]), "every table skill maps to a real drill");

/* mistakes kept for review, capped, dismissable */
ok(W.m.length === 40 && W.m.every(m => m.grade === "Mistake" && m.best === "Fold" && m.did === "Call 5"), "mistakes kept with what you did and what was best");
const id0 = W.m[0].id;
W = lvDismiss(W, id0);
ok(W.m.length === 39 && !W.m.some(m => m.id === id0), "a reviewed spot is dismissed");
ok(new Set(W.m.map(m => m.id)).size === W.m.length, "spot ids are unique");

/* series: points in range and ending on the current rating */
const ser = lvSeries(L, 30);
ok(ser.length >= 2 && ser.length <= 32 && ser.every(p => p.r >= 0 && p.r <= 100), "series has bounded points: " + ser.length);
ok(Math.abs(ser[ser.length - 1].r - s2.rating) < 1e-9, "series ends at the current rating");

/* replaying mistakes on a schedule */
const sp = W.m[0];
ok(lvReplayable(sp) && sp.opts.length === 2 && sp.bestKey === "fold", "a mistake keeps its options for replay");
ok(lvSpotsDue(W, sp.t).length === 0 && lvSpotsDue(W, sp.t + 2 * 864e5).length === W.m.length, "spots are first due the next day");
ok(lvSpotGood(sp, "fold") && !lvSpotGood(sp, "call"), "the best option is right, the costly one is wrong");
let tt = sp.t + 864e5;
ok(!lvSpotAnswer(sp, "call", tt) && sp.sr.box === 0 && sp.sr.due > tt, "a wrong replay starts the spot over");
for (let i = 0; i < LV_SPOT_DAYS.length; i++) { tt = sp.sr.due + 1; ok(lvSpotAnswer(sp, "fold", tt), "replay " + (i + 1) + " right"); }
ok(sp.sr.done && lvSpotsMastered(W) === 1 && lvSpotsDue(W, tt + 1e10).indexOf(sp) < 0, "four spaced right answers master a spot");
ok(lvSpotGood({ opts: [{ k: "a", ev: 2 }, { k: "b", ev: 1.9 }], pot: 10, toCall: 0 }, "b"), "a choice within 10% of the pot counts as right");

/* only skills you have learned count */
let U = lvNew();
for (let i = 0; i < 40; i++) U = lvAddHand(U, hand(i, [["Blunder", "mdf"]]), 100 + i, { rfi: 1 });   /* mdf not learned */
let su = lvSummary(U);
ok(su.n === 0 && su.played === 40 && su.unrated === 40 && !su.placed && su.rating === null, "blunders in an unlearned skill do not count");
for (let i = 40; i < 70; i++) U = lvAddHand(U, hand(i, [["Best", "rfi"]]), 100 + i, { rfi: 1 });
su = lvSummary(U);
ok(su.placed && su.n === 30 && su.rating > 90, "the rating is built only from learned skills: " + su.rating.toFixed(1));
const ukM = lvSkills(U, { rfi: 1 }).find(k => k.id === "mdf"), ukR = lvSkills(U, { rfi: 1 }).find(k => k.id === "rfi");
ok(!ukM.learned && ukM.rating === null && ukM.played === 40 && ukM.unrated === 40, "an unlearned skill shows what was played, unrated");
ok(ukR.learned && ukR.n === 30, "a learned skill is rated");
ok(lvWeak(U, { rfi: 1 }).every(k => k.id !== "mdf"), "an unlearned skill is never a weak spot");
ok(lvSeries(U).every(p => p.r > 80), "the chart ignores unrated decisions");
/* learning a skill later does not reach back */
for (let i = 70; i < 80; i++) U = lvAddHand(U, hand(i, [["Mistake", "mdf"]]), 100 + i, { rfi: 1, mdf: 1 });
const after = lvSkills(U, { rfi: 1, mdf: 1 }).find(k => k.id === "mdf");
ok(after.learned && after.n === 10 && after.played === 50, "after learning, only new decisions count: " + after.n);
/* a decision testing two skills counts only if both were learned */
let V = lvNew();
V = lvAddHand(V, { no: 1, pos: "BB", cards: [0, 1], decisions: [{ A: { street: 0, board: [], pot: 3, toCall: 2, eq: 0.4, best: "call", options: [{ key: "call", label: "Call", ev: 1 }] }, G: { quality: 0, loss: 3, grade: "Blunder", concepts: ["threebet", "eqr"], chosen: "call", lines: [] } }] }, 1, { threebet: 1 });
ok(!lvCounts(V.d[0]) && V.m[0].k.join() === "threebet", "a decision leaning on an unlearned skill is not rated");
ok(lvCounts({ c: ["rfi"] }), "decisions from before the rule still count");

/* a real session at the table feeds it */
let seed = 4321; const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const g = playNew("mixed", rng);
let R = lvNew(), errors = 0, decs = 0;
for (let n = 0; n < 60; n++) {
  playDeal(g);
  let guard = 0;
  while (!g.t.hand.over && guard++ < 200) {
    try {
      if (playHeroTurn(g)) {
        const A = playAnalyze(g);
        const o = rng() < 0.6 ? A.options.find(x => x.key === A.best) : A.options[(rng() * A.options.length) | 0];
        playHeroAct(g, o.type === "raise" ? { type: "raise", to: o.to } : { type: o.type }); decs++;
      } else playBotStep(g);
    } catch (e) { errors++; console.log(e.stack); break; }
  }
  R = lvAddHand(R, g.history[0], 9000 + n);
}
ok(!errors && R.d.length === decs, "60 real hands logged: " + decs + " decisions");
ok(R.d.every(x => x.q >= 0 && x.q <= 1 && x.c.every(c => LV_SKILLS[c])), "every logged concept is a known table skill");
ok(JSON.parse(JSON.stringify(R)).d.length === R.d.length, "the log survives a save");

console.log("level: " + pass + " passed, " + fail + " failed");
if (fail) process.exit(1);
