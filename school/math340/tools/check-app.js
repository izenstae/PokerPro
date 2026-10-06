#!/usr/bin/env node
/* ============================================================
 * Application-logic tests — no browser, no dependencies.
 *
 *   node tools/check-app.js
 *
 * The problem generators are covered by check-generators.js. This
 * covers the parts that decide what a study session actually does:
 * answer grading, the Leitner ladder, the weakness model, the
 * mistake log, and schema migration from a v1 progress file.
 *
 * store.js and practice.js are loaded into a fake global with a
 * stub localStorage — neither touches the DOM at load time.
 * ============================================================ */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
let failures = 0, checks = 0;

function ok(cond, msg) {
  checks++;
  if (!cond) { failures++; console.error("  ✗ " + msg); }
}
function eq(actual, expected, msg) {
  ok(Object.is(actual, expected), `${msg} — expected ${expected}, got ${actual}`);
}
function section(name) { console.log("\n" + name); }

/* ---------- a browser-shaped sandbox ---------- */
function freshContext() {
  const store = new Map();
  const ctx = vm.createContext();
  ctx.window = ctx;
  ctx.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k),
  };
  ctx.document = { getElementById: () => null, addEventListener() {}, querySelectorAll: () => [] };
  ctx.console = console;

  /* Load the same files index.html does, minus the ones that reach for the
   * DOM as soon as they run. They declare top-level `const`s, which in a
   * browser are script-scoped rather than properties of `window` — so they
   * are concatenated into a single script and handed back by name. */
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const files = [...html.matchAll(/<script src="((?:data|js)\/[^"]+)"><\/script>/g)]
    .map(m => m[1])
    .filter(f => !/app\.js$|flashcards\.js$|exam\.js$/.test(f));
  const src = files.map(f => `/* ${f} */\n` + fs.readFileSync(path.join(root, f), "utf8")).join("\n;\n");
  const api = vm.runInContext(src + "\n;({ Store, Practice, Identify, MATH340: window.MATH340 });", ctx,
                              { filename: "bundle.js" });
  return { ...api, _raw: store };
}

/* ---------- answer grading ---------- */
section("Answer parsing and grading");
{
  const { Practice } = freshContext();
  const P = Practice.parseAnswer;

  eq(P("0.25"), 0.25, "decimal");
  eq(P("5/36"), 5 / 36, "fraction");
  eq(P("13.9%"), 0.139, "percent");
  eq(P(" 1 / 4 "), 0.25, "fraction with spaces");
  ok(Number.isNaN(P("")), "empty string is not a number");
  ok(Number.isNaN(P("abc")), "text is not a number");
  ok(Number.isNaN(P("1/0")), "division by zero is rejected");

  const prob = { kind: "prob", answer: 5 / 36 };            // 0.13888…
  const check = (t) => Practice.checkAnswer(prob, P(t), t);
  ok(check("5/36"), "exact fraction accepted");
  ok(check("0.1389"), "4-dp rounding accepted");
  ok(check("0.139"), "3-dp rounding accepted");
  ok(check("0.14"), "2-dp rounding accepted (the point of the rounding rule)");
  ok(!check("0.13"), "a wrong 2-dp value is still wrong");
  ok(!check("0.15"), "a nearby but incorrectly rounded value is rejected");
  ok(!check("0.9"), "1-dp is too coarse to credit");

  const count = { kind: "count", answer: 120 };
  ok(Practice.checkAnswer(count, 120, "120"), "exact count accepted");
  ok(!Practice.checkAnswer(count, 121, "121"), "off-by-one count rejected");
  ok(!Practice.checkAnswer(count, 119.6, "119.6"), "non-integer count rejected");

  // A tiny answer must not be rescued by coarse rounding.
  const tiny = { kind: "prob", answer: 0.004 };
  ok(!Practice.checkAnswer(tiny, 0.01, "0.01"), "coarse rounding cannot rescue a 150%-off answer");
}

/* ---------- progressive hints ---------- */
section("Solution steps drive the hint ladder");
{
  const ctx = freshContext();
  const { Practice, MATH340 } = ctx;
  let multi = 0, total = 0;
  for (const u of MATH340.units) {
    for (const g of u.generators || []) {
      for (let i = 0; i < 40; i++) {
        const p = g.make();
        const steps = Practice.solSteps(p.sol);
        total++;
        ok(steps.length >= 1, `${g.id}/${p.variant}: solution produced no steps`);
        ok(steps.join("").length <= p.sol.length, `${g.id}/${p.variant}: steps longer than the solution`);
        if (steps.length > 1) multi++;
      }
    }
  }
  ok(multi / total > 0.8, `most problems should support a partial hint (got ${Math.round(100 * multi / total)}%)`);
}

/* ---------- Leitner ladder ---------- */
section("Leitner scheduling");
{
  const { Store } = freshContext();
  eq(Store.getCard("x").box, 0, "unseen card starts at box 0");

  let c;
  for (let i = 0; i < 10; i++) c = Store.gradeCard("x", true);
  eq(c.box, Store.MAX_BOX, "box saturates at MAX_BOX");
  const days = (c.due - Date.now()) / (24 * 3600 * 1000);
  ok(days > 14, `top box should wait weeks, not days (got ${days.toFixed(1)})`);

  c = Store.gradeCard("x", false);
  eq(c.box, 1, "a miss drops straight to box 1");
  eq(c.lapses, 1, "the lapse is recorded");
  ok(c.due <= Date.now() + 1000, "a lapsed card is due immediately");

  // Intervals must be non-decreasing, or a higher box could be due sooner.
  for (let i = 1; i < Store.INTERVALS.length; i++) {
    ok(Store.INTERVALS[i] >= Store.INTERVALS[i - 1], `interval ${i} is shorter than interval ${i - 1}`);
  }

  const cards = [{ id: "a" }, { id: "b" }, { id: "c" }];
  Store.gradeCard("a", true); Store.gradeCard("a", true); Store.gradeCard("a", true); Store.gradeCard("a", true);
  Store.gradeCard("b", false);
  const s = Store.deckStats(cards);
  eq(s.total, 3, "deck total");
  eq(s.fresh, 1, "one card never seen");
  eq(s.mastered, 1, "one card is in box 4+");
  ok(s.mastery > 0 && s.mastery < 1, "mastery is a fraction");

  const weak = Store.weakCards(cards);
  eq(weak[0].id, "b", "the lapsed card leads a cram session");
  ok(weak.indexOf(weak.find(x => x.id === "a")) === weak.length - 1, "the strong card trails");
}

/* ---------- weakness model ---------- */
section("Weakness model and weighted picking");
{
  const { Store } = freshContext();
  const untouched = Store.weakness("never-tried");
  ok(untouched > 0.7, "an untried topic ranks as needing work");

  for (let i = 0; i < 10; i++) Store.recordPractice("strong", true, "v1");
  for (let i = 0; i < 10; i++) Store.recordPractice("weak", false, "v1");
  ok(Store.weakness("weak") > Store.weakness("strong"), "a missed topic outranks a mastered one");
  ok(Store.weakness("strong") < 0.3, "a topic answered right ten times is not flagged");
  ok(untouched > Store.weakness("strong"), "untried beats mastered in the queue");

  // Recency: a topic recently recovered should fall below one recently lost.
  for (let i = 0; i < 10; i++) Store.recordPractice("recovering", false, "v1");
  for (let i = 0; i < 10; i++) Store.recordPractice("recovering", true, "v1");
  ok(Store.weakness("recovering") < Store.weakness("weak"), "recent successes reduce weakness");

  const gens = [{ id: "weak" }, { id: "strong" }];
  let weakPicks = 0;
  for (let i = 0; i < 400; i++) if (Store.pickWeighted(gens, null).id === "weak") weakPicks++;
  ok(weakPicks > 240, `weighted picking should favour the weak topic (got ${weakPicks}/400)`);
  for (let i = 0; i < 50; i++) {
    ok(Store.pickWeighted(gens, "weak").id === "strong", "exclude keeps a topic from repeating");
  }

  const wv = Store.weakVariants("weak");
  eq(wv.length, 1, "the failing shape is surfaced");
  eq(wv[0].name, "v1", "…by name");
}

/* ---------- mistake log ---------- */
section("Mistake log");
{
  const { Store } = freshContext();
  const miss = (variant) => Store.recordMiss({
    genId: "g1", variant, unitId: "ch1", q: "q", sol: "s", answer: 1, kind: "count",
  });

  miss("shape-A"); miss("shape-B");
  eq(Store.missCount(), 2, "misses are recorded");
  ok(Store.misses()[0].variant === "shape-B", "newest first");

  for (let i = 0; i < 10; i++) miss("shape-A");
  const shapeA = Store.misses().filter(m => m.variant === "shape-A").length;
  ok(shapeA <= 3, `one shape cannot flood the log (got ${shapeA})`);

  const key = Store.misses()[0].key;
  Store.clearMiss(key);
  ok(!Store.misses().some(m => m.key === key), "a cleared miss is gone");
  Store.clearAllMisses();
  eq(Store.missCount(), 0, "the log can be emptied");

  for (let i = 0; i < 200; i++) Store.recordMiss({ genId: "g" + i, variant: "v", q: "q", sol: "s", answer: 1, kind: "count" });
  ok(Store.missCount() <= 60, `the log stays bounded (got ${Store.missCount()})`);
}

/* ---------- exams + activity ---------- */
section("Exam history and activity");
{
  const { Store } = freshContext();
  Store.recordExam({ label: "Midterm rehearsal", n: 12, correct: 9, seconds: 2400, limit: 70 });
  eq(Store.exams().length, 1, "sitting recorded");
  eq(Store.exams()[0].correct, 9, "score kept");
  ok(Store.totalReviews() >= 12, "a 12-problem sitting counts as 12 units of activity");
  eq(Store.streak(), 1, "today's activity starts a streak");

  for (let i = 0; i < 40; i++) Store.recordExam({ label: "x", n: 1, correct: 1, seconds: 1, limit: 0 });
  ok(Store.exams().length <= 20, "exam history stays bounded");
}

/* ---------- formula-sheet selection ---------- */
section("Formula-sheet selection");
{
  const { Store } = freshContext();
  eq(Store.sheet().size, 0, "selection starts empty");
  Store.toggleSheet("c1-bayes");
  ok(Store.sheet().has("c1-bayes"), "toggling adds");
  Store.toggleSheet("c1-bayes");
  ok(!Store.sheet().has("c1-bayes"), "toggling again removes");
  Store.setSheet(["a", "b", "a"]);
  eq(Store.sheet().size, 2, "duplicates collapse");
  ok(JSON.parse(Store.exportJSON()).sheet.length === 2, "the selection rides along in the export");
}

/* ---------- migration from v1 ---------- */
section("Migration from a v1 progress file");
{
  const ctx = freshContext();
  const v1 = {
    cards: { "c1-naive": { box: 3, due: 0, seen: 5, lapses: 1 } },
    practice: { "c1-gen-perm": { attempts: 4, correct: 3, recent: [1, 0, 1, 1] } },
    activity: { "2026-09-20": 12 },
  };
  ctx.Store.importJSON(JSON.stringify(v1));
  const S = ctx.Store;
  eq(S.getCard("c1-naive").box, 3, "card box preserved");
  eq(S.getCard("c1-naive").lapses, 1, "lapses preserved");
  eq(S.getPractice("c1-gen-perm").attempts, 4, "practice attempts preserved");
  eq(S.getPractice("c1-gen-perm").correct, 3, "practice correct preserved");
  eq(S.totalReviews(), 12, "activity preserved");
  ok(S.getPractice("c1-gen-perm").variants && typeof S.getPractice("c1-gen-perm").variants === "object",
     "a variants map is backfilled so callers need no null checks");
  eq(S.missCount(), 0, "missing collections default to empty");
  eq(S.exams().length, 0, "…including exams");
  eq(JSON.parse(S.exportJSON()).v, 2, "export is stamped with the current schema");

  // A v2 round trip must be lossless.
  S.recordMiss({ genId: "g", variant: "v", q: "q", sol: "s", answer: 1, kind: "count" });
  const round = S.exportJSON();
  S.reset();
  eq(S.missCount(), 0, "reset clears");
  S.importJSON(round);
  eq(S.missCount(), 1, "v2 round trip keeps the mistake log");
  eq(S.getCard("c1-naive").box, 3, "v2 round trip keeps cards");

  let threw = false;
  try { S.importJSON("{\"nope\": 1}"); } catch (e) { threw = true; }
  ok(threw, "a file with no cards is rejected rather than wiping progress");
}

/* ---------- method guides ---------- */
section("Method guides");
{
  const { MATH340 } = freshContext();
  const OK_TAGS = /^(b|i|em|br|code|sup|sub|strong|small)$/i;
  let guided = 0;
  for (const u of MATH340.units) {
    if (!u.methodGuide) continue;
    guided++;
    for (const row of u.methodGuide) {
      for (const [field, text] of Object.entries(row)) {
        const where = `${u.id}.methodGuide.${field}`;
        ok(typeof text === "string" && text.trim(), `${where}: empty`);
        ok(!/undefined|NaN/.test(text), `${where}: contains a placeholder`);
        const open = (text.match(/\\\(/g) || []).length, close = (text.match(/\\\)/g) || []).length;
        eq(open, close, `${where}: unbalanced \\( \\)`);
        for (const m of text.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)/g)) {
          ok(OK_TAGS.test(m[1]), `${where}: "<${m[1]}" looks like maths, not HTML — write it as &lt;`);
        }
      }
      ok(row.when && row.use && row.why, `${u.id}: a guide row is missing when/use/why`);
    }
  }
  ok(guided >= 2, `chapters with practice content should carry a method guide (found ${guided})`);
}

console.log(`\n${checks} checks run`);
if (failures) { console.error(`✗ ${failures} failed`); process.exit(1); }
console.log("✓ all application-logic checks passed");
