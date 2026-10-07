#!/usr/bin/env node
/* ============================================================
 * Application-logic tests — no browser, no dependencies.
 *
 *   node tools/check-app.js
 *
 * The problem generators are covered by check-generators.js. This
 * covers the parts that decide what a study session actually does:
 * answer grading, the Leitner ladder, the weakness model, the
 * mistake log, schema migration and validation of imported files,
 * sanitising of stored HTML, and calendar arithmetic.
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
  return { ...api, _raw: store, _ctx: ctx };
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

  // Trailing zeros, percents, signs and exponents are all the same commitment.
  ok(check("0.140"), "a trailing zero does not defeat the rounding allowance");
  ok(check("14%"), "percent input gets the rounding allowance (14% ≈ 0.14 to 2 places)");
  ok(check("13.9%"), "a 1-dp percent is a 3-dp value");
  ok(!check("13%"), "a wrong percent is still wrong");
  ok(check("+0.14"), "a leading plus is accepted");
  ok(check("1.4e-1"), "scientific notation gets the rounding allowance");
  ok(check("1.39E-1"), "…whatever the case of the e");
  eq(P("\u22123"), -3, "Unicode minus is read as a minus sign");
  eq(P("+5/36"), 5 / 36, "a signed fraction parses");
  eq(Practice.typedDecimals("0.140"), 2, "typed decimals ignore trailing zeros");
  eq(Practice.typedDecimals("14%"), 2, "a whole-number percent has two decimals as a probability");
  eq(Practice.typedDecimals("5/36"), -1, "a fraction has no typed decimals");

  // A tiny answer must not be rescued by coarse rounding.
  const tiny = { kind: "prob", answer: 0.004 };
  ok(!Practice.checkAnswer(tiny, 0.01, "0.01"), "coarse rounding cannot rescue a 150%-off answer");
  const small = { kind: "prob", answer: 0.0046 };
  ok(!Practice.checkAnswer(small, 0.004, "0.004"), "the absolute floor shrinks for answers below 0.01 (0.004 for 0.0046)");
  ok(Practice.checkAnswer(small, 0.0046, "0.0046"), "the exact tiny answer is accepted");
  ok(!Practice.checkAnswer(small, 0.005, "0.005"), "one significant figure is too coarse for a tiny answer (the 5% cap)");
  ok(Practice.checkAnswer(small, Practice.parseAnswer("0.46%"), "0.46%"), "the same tiny answer as a percent is accepted");
  ok(Practice.checkAnswer(small, Practice.parseAnswer("4.6e-3"), "4.6e-3"), "…and in scientific notation");
  ok(Practice.checkAnswer({ kind: "prob", answer: 0.5 }, 0.5004, "0.5004"), "the 0.0006 floor still applies to ordinary answers");
}

/* Every generator's own answer, as the UI prints it, must pass the grader —
 * otherwise a problem with a tiny or awkward answer can never be got right. */
section("Generators' own answers are accepted");
{
  const { Practice, MATH340 } = freshContext();
  for (const u of MATH340.units) {
    for (const g of u.generators || []) {
      for (let i = 0; i < 40; i++) {
        const p = g.make();
        ok(Practice.checkAnswer(p, p.answer, String(p.answer)), `${g.id}/${p.variant}: exact answer ${p.answer} rejected`);
        const shown = MATH340.util.fmt(p.answer, 5);
        ok(Practice.checkAnswer(p, Practice.parseAnswer(shown), shown), `${g.id}/${p.variant}: displayed answer ${shown} rejected for ${p.answer}`);
        // The sanitiser applied to stored misses must leave authored markup alone.
        ok(Practice.sanitize(p.q) === p.q && Practice.sanitize(p.sol) === p.sol, `${g.id}/${p.variant}: sanitiser altered the generator's own HTML`);
      }
    }
  }
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

  // Only a due card is promoted, so to climb the ladder the clock has to
  // move: pull the card's due date into the past between reviews.
  const backdate = (id) => {
    const st = JSON.parse(Store.exportJSON());
    st.cards[id].due = 0;
    Store.importJSON(JSON.stringify(st));
  };
  const midnight = (t) => { const d = new Date(t); return d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0; };

  let c = Store.gradeCard("x", true);
  eq(c.box, 1, "first correct answer moves a new card to box 1");
  ok(c.due <= Date.now(), "box 1 (interval 0) is due straight away");
  c = Store.gradeCard("x", true);
  eq(c.box, 2, "a due card is promoted");
  ok(midnight(c.due), "due dates fall on local midnight");
  const tomorrow = new Date(); tomorrow.setHours(0, 0, 0, 0); tomorrow.setDate(tomorrow.getDate() + 1);
  eq(c.due, tomorrow.getTime(), "a one-day interval is due from midnight tomorrow, whatever the time now");

  const early = Store.gradeCard("x", true);
  eq(early.box, 2, "a correct answer before the card is due does not promote it");
  eq(early.due, c.due, "…and does not move its due date");
  eq(early.seen, 3, "…but the review is still counted");

  for (let i = 0; i < 10; i++) { backdate("x"); c = Store.gradeCard("x", true); }
  eq(c.box, Store.MAX_BOX, "box saturates at MAX_BOX");
  const days = (c.due - Date.now()) / (24 * 3600 * 1000);
  ok(days > 14, `top box should wait weeks, not days (got ${days.toFixed(1)})`);
  ok(midnight(c.due), "the top-box due date is a local midnight too");

  c = Store.gradeCard("x", false);
  eq(c.box, 1, "a miss drops straight to box 1, even when the card was not due");
  eq(c.lapses, 1, "the lapse is recorded");
  ok(c.due <= Date.now() + 1000, "a lapsed card is due immediately");

  // Intervals must be non-decreasing, or a higher box could be due sooner.
  for (let i = 1; i < Store.INTERVALS.length; i++) {
    ok(Store.INTERVALS[i] >= Store.INTERVALS[i - 1], `interval ${i} is shorter than interval ${i - 1}`);
  }

  const cards = [{ id: "a" }, { id: "b" }, { id: "c" }];
  for (let i = 0; i < 4; i++) { Store.gradeCard("a", true); backdate("a"); }
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
  threw = false;
  try { S.importJSON("{\"cards\": []}"); } catch (e) { threw = true; }
  ok(threw, "cards must be an object, not an array");
}

/* ---------- import validation ---------- */
section("A malformed progress file cannot poison the store");
{
  const { Store } = freshContext();
  const bad = {
    cards: {
      good: { box: 3, due: 0, seen: 2, lapses: 0 },
      strBox: { box: "3", due: 0 },
      noDue: { box: 2 },
      huge: { box: 99, due: 0, seen: 1 },
      nul: null, arr: [1, 2], str: "box 3",
    },
    practice: {
      ok: { attempts: 3, correct: 2, recent: [1, 0, 1], variants: { a: { a: 1, c: 1 }, broken: "x" } },
      noNums: { attempts: "3", correct: 2 },
      nul: null,
    },
    misses: [null, "string", 42, { key: "k", genId: "g", q: "q", sol: "s", answer: 1, kind: "count" }, { genId: "g2", q: 1, sol: "s" }, { genId: "g3", q: "q", sol: "s", answer: "x" }],
    exams: [null, { label: "ok", n: 5, correct: 4, seconds: 10 }, { label: "no n", correct: 1 }, { n: 0, correct: 0 }, "x"],
    sheet: ["a", 1, null, "a", "b"],
    activity: { "2026-09-20": 3, "2026-09-21": "4", "2026-09-22": -1 },
  };
  let threw = false;
  try { Store.importJSON(JSON.stringify(bad)); } catch (e) { threw = true; }
  ok(!threw, "malformed entries are dropped rather than thrown on");
  eq(Store.getCard("good").box, 3, "a well-formed card survives");
  eq(Store.getCard("strBox").box, 0, "a card with a string box is dropped");
  eq(Store.getCard("noDue").box, 0, "a card without a due date is dropped");
  eq(Store.getCard("huge").box, Store.MAX_BOX, "a box beyond the ladder is clamped");
  eq(Store.getCard("nul").box, 0, "a null card is dropped");
  eq(Store.getPractice("ok").attempts, 3, "a well-formed practice row survives");
  eq(Object.keys(Store.getPractice("ok").variants).length, 1, "a malformed variant is dropped");
  eq(Store.getPractice("noNums").attempts, 0, "a practice row with string counts is dropped");
  eq(Store.missCount(), 1, "only object misses with text are kept");
  eq(Store.exams().length, 1, "only exams with a positive n and a numeric score are kept");
  eq(Store.sheet().size, 2, "non-string sheet ids are dropped and duplicates collapse");
  eq(Store.totalReviews(), 3, "non-numeric or negative activity is dropped");
  ok(Store.deckStats([{ id: "good" }, { id: "huge" }, { id: "nul" }]).total === 3, "deck stats run over the imported cards");
  ok(Store.weakCards([{ id: "good" }, { id: "huge" }]).length >= 1, "weak-card ranking runs over the imported cards");
  ok(Store.streak() >= 0, "the streak computes");
  ok(JSON.parse(Store.exportJSON()).misses[0].key === "k", "a kept miss retains its key");
}

/* ---------- stored HTML ---------- */
section("Stored HTML is sanitised or escaped on render");
{
  const ctx = freshContext();
  const { Store, Practice, MATH340 } = ctx;
  Store.recordMiss({ genId: "g", variant: "v", unitId: "u", answer: 1, kind: "count",
    q: `Pick <img src=x onerror=alert(1)> <a href="javascript:alert(1)">one</a><script>alert(2)</script>`,
    sol: `<div class="sol-step" onclick="x()">Step \\(a<b\\)</div><iframe src="//evil"></iframe>` });
  const m = Store.misses()[0];
  const q = Practice.sanitize(m.q), sol = Practice.sanitize(m.sol);
  ok(!/onerror/i.test(q), "an onerror handler is stripped from a stored question");
  ok(/<img src=x>/.test(q), "the harmless part of the tag is kept");
  ok(!/javascript:/i.test(q), "a javascript: href is stripped");
  ok(!/<script/i.test(q), "a script element is removed");
  ok(!/onclick/i.test(sol), "an on* attribute is stripped from a solution step");
  ok(/<div class="sol-step">Step/.test(sol), "the solution step markup survives");
  ok(!/<iframe/i.test(sol), "an iframe is removed");
  eq(MATH340.util.sanitizeHtml(`<span style="color:red">\\(\\frac{1}{2}\\)</span>`), `<span style="color:red">\\(\\frac{1}{2}\\)</span>`,
     "ordinary KaTeX-bearing markup passes through unchanged");
  eq(MATH340.util.escapeHtml(`<b>x</b> & "y"`), "&lt;b&gt;x&lt;/b&gt; &amp; &quot;y&quot;", "escapeHtml escapes the four HTML characters");

  // Exam labels are plain text. Render the exam home page with a fake element
  // and make sure a label with markup arrives escaped.
  Store.recordExam({ label: "<b>bold</b> sitting", scopeLabel: "<i>scope</i>", n: 5, correct: 4, seconds: 60, limit: 15 });
  ctx._ctx.App = { typeset() {} };
  const Exam = vm.runInContext(fs.readFileSync(path.join(root, "js/exam.js"), "utf8") + "\n;Exam;", ctx._ctx, { filename: "exam.js" });
  const fakeEl = { innerHTML: "", querySelector: () => ({ addEventListener() {}, style: {} }), querySelectorAll: () => [] };
  Exam.mount(fakeEl);
  ok(fakeEl.innerHTML.includes("&lt;b&gt;bold&lt;/b&gt; sitting"), "an exam label with <b> is escaped in the past-sittings table");
  ok(!fakeEl.innerHTML.includes("<b>bold</b>"), "…and never rendered as markup");
  ok(fakeEl.innerHTML.includes("&lt;i&gt;scope&lt;/i&gt;"), "the scope label is escaped too");
}

/* ---------- calendar arithmetic ---------- */
section("Calendar days, not milliseconds");
{
  const { MATH340 } = freshContext();
  const savedTZ = process.env.TZ;
  process.env.TZ = "America/Chicago";   // DST ends 2026-11-01
  try {
    eq(MATH340.daysUntil("2026-10-21", new Date(2026, 9, 21, 15, 0)), 0, "the exam is 'today' at 3 pm on the day");
    eq(MATH340.daysUntil("2026-10-21", new Date(2026, 9, 20, 23, 59)), 1, "…'tomorrow' late the day before");
    eq(MATH340.daysUntil("2026-10-21", new Date(2026, 9, 22, 0, 1)), -1, "…and past just after midnight the day after");
    eq(MATH340.daysUntil("2026-11-23", new Date(2026, 9, 31, 12)), 23, "a span across the DST change counts whole days");
    const q = MATH340.nextQuiz(new Date(2026, 10, 4, 9, 0));
    ok(q && q.week === 8 && q.days === 0, `the week-8 quiz is today on Wed Nov 4 (got ${JSON.stringify(q)})`);
    const q2 = MATH340.nextQuiz(new Date(2026, 10, 3, 9, 0));
    ok(q2 && q2.week === 8 && q2.days === 1, `…and tomorrow on Nov 3 (got ${JSON.stringify(q2)})`);
    eq(MATH340.currentWeek(new Date(2026, 10, 22, 23, 30)), 10, "late on Sunday Nov 22 is still week 10");
    eq(MATH340.currentWeek(new Date(2026, 10, 23, 0, 0)), 11, "Monday Nov 23 (finals day) is week 11");
    eq(MATH340.currentWeek(new Date(2026, 8, 13, 23, 0)), 0, "before term start");
    eq(MATH340.currentWeek(new Date(2026, 8, 14, 0, 0)), 1, "term start is week 1");
  } finally {
    if (savedTZ === undefined) delete process.env.TZ; else process.env.TZ = savedTZ;
  }
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
