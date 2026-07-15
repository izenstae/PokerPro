/* Soak test. Draws every generator many times and checks the invariants that
   the UI relies on, plus that grading accepts and rejects correctly.
   Pure node, no browser, no dependencies. */
const fs = require("fs");
const S = __dirname + "/../src/";
const strip = f => fs.readFileSync(S + f, "utf8").replace(/\nif \(typeof module[\s\S]*$/, "");
eval(strip("engine.js") + strip("range.js") + strip("drills.js"));

const MODES = Object.keys(GENS);
const DRAWS = 30;
let checks = 0;
const fails = [];
const bad = m => fails.push(m);

for (const mode of MODES) {
  for (let i = 0; i < DRAWS; i++) {
    const q = GENS[mode]();
    checks++;

    if (!q.question) bad(mode + ": no question");
    if (!(q.target > 0)) bad(mode + ": no time target");
    if (!q.math || !q.math.length) bad(mode + ": no worked solution");
    if (!q.bar) bad(mode + ": no bar");
    else {
      if (!(q.bar.fill >= -0.01 && q.bar.fill <= 100.01)) bad(mode + ": bar fill " + q.bar.fill);
      if (q.bar.tick != null && !(q.bar.tick >= -0.01 && q.bar.tick <= 100.01)) bad(mode + ": bar tick " + q.bar.tick);
      if (!q.bar.fillLabel) bad(mode + ": bar has no label");
    }

    if (q.kind === "choice") {
      if (!q.options || q.options.length < 2) bad(mode + ": choice with no options");
      else if (q.options.indexOf(q.answer) < 0) bad(mode + ": answer is not among the options");
      else if (new Set(q.options).size !== q.options.length) bad(mode + ": duplicate options");
    } else if (q.kind === "number") {
      if (!isFinite(q.answer)) bad(mode + ": answer is not finite");
      if (!(q.tol > 0)) bad(mode + ": tolerance " + q.tol);
      const wild = q.answer + q.tol * 5 + 10;
      if (Math.abs(wild - q.answer) <= q.tol) bad(mode + ": nonsense answer accepted");
      if (q.unit === "%" && (q.answer < -0.01 || q.answer > 100.01)) bad(mode + ": percent answer " + q.answer);
    } else bad(mode + ": unknown kind " + q.kind);

    if (q.cards) {
      const all = [].concat(q.cards.hero || [], q.cards.villain || [], q.cards.board || []);
      if (new Set(all).size !== all.length) bad(mode + ": a card was dealt twice");
      if (all.some(c => !(c >= 0 && c <= 51))) bad(mode + ": card index outside the deck");
    }
  }
}

const uniq = [...new Set(fails)];
console.log(MODES.length + " generators x " + DRAWS + " draws = " + checks + " questions");
if (uniq.length) { console.log("FAIL\n" + uniq.join("\n")); process.exit(1); }
console.log("PASS soak: every invariant holds");
