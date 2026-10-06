#!/usr/bin/env node
/* ============================================================
 * Practice-generator smoke test.
 *
 *   node tools/check-generators.js [runs-per-generator]
 *
 * Loads every data/*.js unit listed in index.html inside a fake
 * browser global, hammers each problem generator, and checks that
 * every problem it can produce is well posed:
 *
 *   · answer is a finite number of the right sort for its `kind`
 *   · question and solution are non-empty and free of "undefined"/"NaN"
 *   · LaTeX delimiters are balanced
 *   · no stray "<" that the browser would swallow as an HTML tag
 *   · every declared variant actually shows up
 *   · ids are unique across units
 * ============================================================ */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const RUNS = Number(process.argv[2]) || 400;

// Load the data files in the same order index.html does, so this test
// stays in sync with the app without a second list to maintain.
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const files = [...html.matchAll(/<script src="(data\/[^"]+)"><\/script>/g)].map(m => m[1]);
if (!files.length) fail("no data/*.js script tags found in index.html");

const ctx = vm.createContext();
ctx.window = ctx; // in a browser, window properties are globals
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
const MATH340 = ctx.MATH340;

const problems = [];
function fail(msg) { problems.push(msg); }

/* Tag names that legitimately appear in card/solution HTML. Anything else
 * is almost always a "<" from maths (e.g. \sum_{i<j}) that the browser will
 * parse as a tag and silently truncate the card — see docs/ADDING_CONTENT.md. */
const OK_TAGS = new Set(["div", "span", "b", "i", "em", "br", "code", "sup", "sub", "table", "tr", "td", "th", "tbody", "thead", "ul", "ol", "li", "p", "small", "strong"]);

/* Any probability the text *states* must be a probability. This catches
 * generators that draw P(A), P(B) and P(A∩B) independently and end up
 * asserting something impossible like P(A ∪ B) = 1.05. */
function checkStatedProbabilities(where, s) {
  for (const m of s.matchAll(/P\([^)]*\)\s*=\s*(-?\d+(?:\.\d+)?)/g)) {
    const v = Number(m[1]);
    if (v >= 0 && v <= 1) continue;
    const before = s.slice(Math.max(0, m.index - 12), m.index);
    if (/\/\s*$/.test(before)) continue;                          // denominator of a ratio, e.g. P(E|H)/P(E|H^c) = 3
    if (/\d\s*(\\,|\\cdot|\\times)?\s*$/.test(before)) continue;   // a coefficient, e.g. 2\,P(A) = 3(1 - P(A))
    if (/^\s*\//.test(s.slice(m.index + m[0].length))) continue;  // the numerator of a fraction, e.g. P(M_i) = 2/9
    fail(`${where}: states ${m[0].trim()} — not a valid probability`);
  }
}

/* A joint probability is constrained by its marginals, and stating one that
 * is not is the same class of bug as asserting P(A u B) = 1.05: every number
 * looks like a probability on its own, but no table could produce them all.
 * Frechet: max(0, P(A) + P(B) - 1) <= P(A n B) <= min(P(A), P(B)). */
function checkJointBounds(where, s) {
  const t = s.replace(/\\[,;!]/g, "").replace(/\\ /g, " ").replace(/\s+/g, " ");
  const num = /(-?\d*\.?\d+)/.source;
  /* Only trust "P(...) = v" when the P starts the expression. In
   * "P(A) + P(B) - 2P(A n B) = 0.62" the 0.62 belongs to the whole line, not
   * to the intersection — same trap checkStatedProbabilities already dodges. */
  const standalone = (idx) => !/[\d+\-*\/]\s*(\\,|\\cdot|\\times)?\s*$/.test(t.slice(Math.max(0, idx - 14), idx));

  const marginals = new Map();
  for (const m of t.matchAll(new RegExp(String.raw`P\(([^()|,]+?)\)\s*=\s*` + num, "g"))) {
    if (standalone(m.index)) marginals.set(m[1].trim(), Number(m[2]));
  }
  const joints = [];
  for (const m of t.matchAll(new RegExp(String.raw`P\(([^()|,]+?)\\cap([^()|,]+?)\)\s*=\s*` + num, "g"))) {
    if (standalone(m.index)) joints.push([m[1].trim(), m[2].trim(), Number(m[3])]);
  }
  for (const m of t.matchAll(new RegExp(String.raw`P\(([^(),|]+?),\s*([^(),|]+?)\)\s*=\s*` + num, "g"))) {
    if (standalone(m.index)) joints.push([m[1].trim(), m[2].trim(), Number(m[3])]);
  }
  for (const [a, b, joint] of joints) {
    if (!marginals.has(a) || !marginals.has(b)) continue;   // nothing to compare against
    const pa = marginals.get(a), pb = marginals.get(b);
    const lo = Math.max(0, pa + pb - 1), hi = Math.min(pa, pb);
    if (joint > hi + 1e-9) {
      fail(`${where}: states P(${a}, ${b}) = ${joint}, which exceeds min(${pa}, ${pb}) — an intersection cannot beat its marginals`);
    } else if (joint < lo - 1e-9) {
      fail(`${where}: states P(${a}, ${b}) = ${joint} with P(${a}) = ${pa}, P(${b}) = ${pb} — that forces P(union) = ${(pa + pb - joint).toFixed(3)} > 1`);
    }
  }
}

function checkMarkup(where, s) {
  if (typeof s !== "string" || !s.trim()) return fail(`${where}: empty or non-string`);
  for (const bad of ["undefined", "NaN", "Infinity", "[object Object]"]) {
    if (s.includes(bad)) fail(`${where}: contains "${bad}"`);
  }
  const dd = (s.match(/\$\$/g) || []).length;
  if (dd % 2) fail(`${where}: odd number of $$ delimiters (${dd})`);
  const open = (s.match(/\\\(/g) || []).length, close = (s.match(/\\\)/g) || []).length;
  if (open !== close) fail(`${where}: unbalanced \\( ... \\) (${open} vs ${close})`);
  for (const m of s.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)/g)) {
    if (!OK_TAGS.has(m[1].toLowerCase())) fail(`${where}: "<${m[1]}" looks like maths, not HTML — write it as &lt;`);
  }
}

const seenIds = new Set();
let generatorCount = 0, variantCount = 0, problemCount = 0;

for (const unit of MATH340.units) {
  for (const card of unit.flashcards || []) {
    if (seenIds.has(card.id)) fail(`duplicate id "${card.id}"`);
    seenIds.add(card.id);
    checkMarkup(`${card.id} (front)`, card.front);
    checkMarkup(`${card.id} (back)`, card.back);
  }

  for (const g of unit.generators || []) {
    generatorCount++;
    if (seenIds.has(g.id)) fail(`duplicate id "${g.id}"`);
    seenIds.add(g.id);
    if (!g.variantNames || !g.variantNames.length) fail(`${g.id}: no variantNames — build it with MATH340.makeGenerator`);
    variantCount += (g.variantNames || []).length;

    const seenVariants = new Map();
    let prevVariant = null, repeats = 0;
    for (let i = 0; i < RUNS; i++) {
      let p;
      try { p = g.make(); } catch (e) { fail(`${g.id}: make() threw — ${e.message}`); break; }
      problemCount++;
      seenVariants.set(p.variant, (seenVariants.get(p.variant) || 0) + 1);
      if (p.variant === prevVariant) repeats++;
      prevVariant = p.variant;

      const where = `${g.id} / ${p.variant}`;
      if (!Number.isFinite(p.answer)) { fail(`${where}: answer is not a finite number (${p.answer})`); continue; }
      if (!["prob", "count", "num"].includes(p.kind)) fail(`${where}: unknown kind "${p.kind}"`);
      if (p.kind === "count") {
        if (!Number.isInteger(p.answer)) fail(`${where}: kind "count" but answer ${p.answer} is not an integer`);
        if (p.answer < 0) fail(`${where}: negative count ${p.answer}`);
        if (p.answer > Number.MAX_SAFE_INTEGER) fail(`${where}: count ${p.answer} exceeds exact integer range`);
      }
      if (p.kind === "prob" && (p.answer < 0 || p.answer > 1)) {
        fail(`${where}: kind "prob" but answer ${p.answer} is outside [0, 1]`);
      }
      checkMarkup(`${where} (q)`, p.q);
      checkMarkup(`${where} (sol)`, p.sol);
      checkStatedProbabilities(`${where} (q)`, p.q);
      checkStatedProbabilities(`${where} (sol)`, p.sol);
      checkJointBounds(`${where} (q)`, p.q);
      checkJointBounds(`${where} (sol)`, p.sol);
    }

    // The whole point of the round-robin picker: a topic must not serve the same
    // problem shape twice in a row, and must spread attempts evenly across shapes.
    const nv = (g.variantNames || []).length;
    if (nv > 1 && repeats) fail(`${g.id}: served the same variant twice in a row ${repeats}x in ${RUNS} runs`);
    for (const name of g.variantNames || []) {
      if (!seenVariants.has(name)) fail(`${g.id}: variant "${name}" never generated in ${RUNS} runs`);
    }
    if (nv > 1) {
      const expected = RUNS / nv;
      for (const [name, count] of seenVariants) {
        if (Math.abs(count - expected) > expected * 0.25 + 2) {
          fail(`${g.id}: variant "${name}" appeared ${count}x in ${RUNS} runs (expected about ${Math.round(expected)})`);
        }
      }
    }
    for (const name of seenVariants.keys()) {
      if (!(g.variantNames || []).includes(name)) fail(`${g.id}: produced undeclared variant "${name}"`);
    }
  }
}

const unique = [...new Set(problems)];
const totalCards = MATH340.units.reduce((n, u) => n + (u.flashcards || []).length, 0);
console.log(`${MATH340.units.length} units · ${totalCards} flashcards · ${generatorCount} generators · ${variantCount} problem variants`);
console.log(`${problemCount} problems generated (${RUNS} per generator)`);
for (const u of MATH340.units) {
  for (const g of u.generators || []) console.log(`  ${g.id.padEnd(18)} ${String((g.variantNames || []).length).padStart(2)} variants  ${g.name}`);
}
if (unique.length) {
  console.error(`\n✗ ${unique.length} distinct ${unique.length === 1 ? "problem" : "problems"}:`);
  for (const p of unique.slice(0, 40)) console.error(`  · ${p}`);
  if (unique.length > 40) console.error(`  … and ${unique.length - 40} more`);
  process.exit(1);
}
console.log("\n✓ all generators produce well-posed problems");
