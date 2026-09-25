/* Library: every formula renders, links to a real lesson, and the glossary matches whole words only. */
const fs = require("fs");
eval(fs.readFileSync(__dirname + "/../src/lessons.js", "utf8") + fs.readFileSync(__dirname + "/../src/course.js", "utf8"));
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
