/* Library: every formula renders, links to a real lesson, and the glossary matches whole words only. */
const fs = require("fs");
eval(["lessons.js", "course.js", "lessons2.js", "path.js"].map(f => fs.readFileSync(__dirname + "/../src/" + f, "utf8")).join("\n"));
const L = require("../src/library.js");
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL " + m); } };
const ids = new Set(LESSONS.map(x => x.id));

const seen = new Set();
L.FORMULAS.forEach(f => {
  ok(!seen.has(f.id), "formula id unique: " + f.id); seen.add(f.id);
  ok(ids.has(f.lesson), "formula " + f.id + " links to a real lesson (" + f.lesson + ")");
  const h = L.fxHTML(f.f);
  ok(!/\/\/|\^\{|_\{|sqrt\(/.test(h), "formula " + f.id + " fully rendered: " + h.slice(0, 80));
  ok((h.match(/<span/g) || []).length === (h.match(/<\/span>/g) || []).length, "formula " + f.id + " balanced tags");
});
L.GLOSSARY.forEach(g => ok(ids.has(g[3]), "glossary " + g[0] + " links to a real lesson"));

ok(L.fxHTML("[a // [b // c]]").split('class="fxf"').length === 3, "fractions nest");
ok(L.fxHTML("x^{2}").includes("<sup>2</sup>"), "superscript");
ok(L.fxHTML("a < b").includes("&lt;"), "escapes");

const m = L.glossFind("You need the pot odds to call.");
ok(m && m.entry[0] === "pot odds" && m.len === 8, "longest match wins: pot odds, not pot");
ok(!L.glossFind("rangefinder outsider"), "no match inside other words");
const e = L.glossFind("That is +EV for sure");
ok(e && e.entry[0] === "expected value", "matches EV spellings");
const mdf = L.glossFind("defend at MDF here");
ok(mdf && mdf.entry[0] === "minimum defence frequency", "matches abbreviations");

console.log("library: " + pass + " passed, " + fail + " failed");
if (fail) process.exit(1);

/* ---- every anchor value that can be recomputed, is ---- */
{
  const fs2 = require("fs");
  const ctx = {};
  new Function("ctx", ["engine.js", "range.js", "drills.js", "drills2.js"].map(f =>
    fs2.readFileSync(__dirname + "/../src/" + f, "utf8").replace(/\nif \(typeof module[\s\S]*$/, "")).join("\n") +
    "\nctx.icmEquity = icmEquity; ctx.rangePct = rangePct; ctx.RFI = RFI; ctx.geoFrac = geoFrac;")(ctx);
  const pct = x => Math.round(100 * x);
  const A = id => Object.fromEntries(L.formulaById(id).anchors);
  const price = b => b / (1 + 2 * b), fold = b => b / (1 + b), alpha = price, mdf = b => 1 / (1 + b);
  const eq = (got, want, m) => ok(String(got) === String(want), m + ": anchor says " + want + ", maths says " + got);
  const pr = A("price"); eq(pct(price(1 / 3)) + "%", pr["he bets ⅓ pot"], "price ⅓"); eq(pct(price(.5)) + "%", pr["½ pot"], "price ½");
  eq(pct(price(.75)) + "%", pr["¾ pot"], "price ¾"); eq(pct(price(1)) + "%", pr["pot"], "price pot"); eq(pct(price(2)) + "%", pr["2× pot"], "price 2x");
  const fe = A("foldeq"); eq(pct(fold(1 / 3)) + "%", fe["⅓ pot"], "fold ⅓"); eq(pct(fold(.5)) + "%", fe["½ pot"], "fold ½"); eq(pct(fold(.75)) + "%", fe["¾ pot"], "fold ¾"); eq(pct(fold(1)) + "%", fe["pot"], "fold pot");
  const al = A("alpha"); eq(pct(alpha(.5)) + "%", al["½ pot"], "alpha ½"); eq(pct(alpha(.75)) + "%", al["¾ pot"], "alpha ¾"); eq(pct(alpha(1)) + "%", al["pot"], "alpha pot"); eq(pct(alpha(2)) + "%", al["2× pot"], "alpha 2x");
  const md = A("mdf"); eq(pct(mdf(1 / 3)) + "%", md["⅓ pot"], "mdf ⅓"); eq(pct(mdf(.5)) + "%", md["½ pot"], "mdf ½"); eq(pct(mdf(1)) + "%", md["pot"], "mdf pot"); eq(pct(mdf(2)) + "%", md["2× pot"], "mdf 2x");
  const cb = A("cbet"); eq("needs " + pct(fold(1 / 3)) + "%", cb["⅓ pot"], "cbet ⅓"); eq(pct(fold(.5)) + "%", cb["½ pot"], "cbet ½"); eq(pct(fold(1)) + "%", cb["pot"], "cbet pot");
  const bh = A("behind"); eq(pct(Math.pow(.9, 5)) + "%", bh["p = 10%, 5 behind"], "behind 5"); eq(pct(Math.pow(.9, 2)) + "%", bh["p = 10%, 2 behind"], "behind 2");
  const tf = A("tbfolds"); eq(pct(9 / 13) + "%", tf["2.5 bb open, 3-bet to 9"], "3bet folds 9"); eq(pct(10 / 14.5) + "%", tf["3 bb open, 3-bet to 10"], "3bet folds 10");
  const tc = A("tbcall"); eq(pct(6.5 / 19.5) + "%", tc["open 2.5, 3-bet to 9"], "3bet call 9"); eq(pct(8.5 / 23.5) + "%", tc["open 2.5, 3-bet to 11"], "3bet call 11");
  const er = A("eqr"); eq("need " + pct(.25 / .8) + "%", er["price 25%, R 0.8"], "eqr .8"); eq("need " + pct(.25 / 1.1) + "%", er["price 25%, R 1.1"], "eqr 1.1");
  const mu = A("multi"), two = (a, b) => pct(a + (1 - a) * b) + "% then " + pct(b) + "%";
  eq(two(alpha(1), alpha(1)), mu["pot, pot"], "multi pot pot"); eq(two(alpha(.5), alpha(.5)), mu["½ pot, ½ pot"], "multi half half");
  eq(pct(ctx.geoFrac(1, 1, 2)) + "%", A("geo")["SPR 1, two streets"], "geo spr1");
  const ic = ctx.icmEquity([5000, 3000, 2000], [50, 30, 20]).map(x => "$" + x.toFixed(1)).join(" / ");
  eq(ic, A("icm")["5k / 3k / 2k, $50/30/20"], "icm");
  const jm = .75 * 1.5 + .25 * (.4 * 20 - 9.5); eq("+" + jm.toFixed(2) + " bb", A("jam")["10 bb SB, called 25%, e 40%"], "jam");
  const rp = A("rangepct"); for (const k of ["UTG", "HJ", "CO", "BTN", "SB"]) eq(Math.round(ctx.rangePct(ctx.RFI[k])) + "%", rp[k === "UTG" ? "UTG chart" : k], "range " + k);
  const cm = A("complement"); eq((100 * (1 - 17296 / 19600)).toFixed(1) + "%", cm["set on the flop with a pair"], "set"); eq((100 * 78 / 1326).toFixed(1) + "%", cm["pocket pair dealt"], "pair"); eq((100 * 312 / 1326).toFixed(1) + "%", cm["suited hand dealt"], "suited");
  console.log("library anchors: " + pass + " passed so far, " + fail + " failed");
  if (fail) process.exit(1);
}
