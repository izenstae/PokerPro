# Adding a New Week of Course Content

The app is data-driven: each chapter/unit is one self-registering JavaScript file in `data/`. The dashboard, flashcards, practice, reference, and progress views all pick new units up automatically.

## The two-step recipe

1. **Create `data/chN.js`** following the template below (copy `data/ch2.js` as a starting point).
2. **Add one line to `index.html`**, next to the other data files:

   ```html
   <script src="data/chN.js"></script>
   ```

That's it. Commit and push; once the change reaches `main`, the `Deploy to GitHub Pages` workflow republishes the site.

A chapter's material doesn't have to land all at once. When the second half of a lecture deck arrives, extend the existing `data/chN.js` (new cards, new generators, new `methodGuide` rows) rather than creating a second unit. Chapter 3 grew this way.

> **Tip:** the fastest workflow is to upload the week's lecture PDF to Claude and say:
> *"Add this chapter to my study tool following docs/ADDING_CONTENT.md — extract every definition/theorem/identity into flashcards, write 4–7 practice generators with 5–8 structurally different variants each (different methods, not the same formula with new numbers), and add a methodGuide. Then run `node tools/check-generators.js && node tools/check-app.js`."*
>
> For a homework PDF, say: *"Add the problem shapes from this assignment following the homework section of docs/ADDING_CONTENT.md."*

## Unit template

```js
(function () {
  const U = MATH340.util;      // see "Shared utilities" below
  const R = String.raw;        // IMPORTANT: use R`...` for any string containing LaTeX

  const flashcards = [
    {
      id: "c3-unique-id",                  // stable & unique — progress is keyed on this
      tag: "Definition 3.1.1",             // small label shown on the card
      front: R`What is a <em>random variable</em>?`,
      back: R`A function \(X : S \to \mathbb{R}\) ... $$P(X = x)$$`,
    },
    // ... one card per identity/definition/theorem from lecture
  ];

  /* A decision table for the Reference page: how to tell, from the wording,
   * which tool the question wants. This is the part that is hard under time
   * pressure, and the part a formula sheet cannot give you. */
  const methodGuide = [
    {
      when: R`"given that", "among those who…"`,
      use: R`Definition \(P(A \mid B) = P(A \cap B)/P(B)\)`,
      why: R`The conditioning event becomes the new sample space.`,
    },
    // ... 6-10 rows, covering every generator in the chapter
  ];

  const generators = [
    MATH340.makeGenerator({
      id: "c3-gen-something",              // stable & unique — accuracy stats keyed on this
      name: "Short topic name",
      blurb: "One-line description shown in the topic list.",
      variants: [                          // one entry per *distinct* problem shape
        {
          name: "Direct count",                // the method — revealed with the solution
          make() {
            const n = U.randInt(5, 12);    // randomize parameters each call
            const ans = /* compute the exact answer */;
            return {
              q: R`Question text with \(\LaTeX\) and the value ${n}.`,
              answer: ans,                 // a single number
              kind: "prob",                // "prob" | "count" | "num" (see below)
              // tol: 0.01,                // optional custom tolerance
              sol: R`<div class="sol-step">Step 1 ...</div>
                     <div class="sol-step">$$\text{display math}$$</div>`,
            };
          },
        },
        {
          name: "Via the complement",      // a different *method*, not just different numbers
          make() { /* ... */ },
        },
      ],
    }),
  ];

  MATH340.registerUnit({
    id: "ch3",                             // unique unit id
    title: "Chapter 3 · Random Variables",
    short: "Ch 3 · RVs",
    week: 3,                               // week the material is covered (from the syllabus)
    order: 3,                              // sort position across units
    description: "One-sentence summary shown on the dashboard.",
    flashcards,
    generators,
    methodGuide,                           // optional — "when the question says X, reach for Y"
    // referenceTable: [...]               // optional — see data/distributions.js
  });
})();
```

## Adding a homework assignment

Homework doesn't get its own unit: it goes into the chapter it exercises, since that is what the Wednesday quiz draws on. For each assignment:

1. **Read every problem and name its *shape***, meaning the method it forces rather than its story. Assignment 2, for example, reduces to: conditioning on "the first is red" vs. "at least one is red" vs. "R₁ was drawn"; the overall success rate of a diagnostic test and how good a test must be to beat "call everyone healthy"; a two-way defect table with a complement condition; a hereditary mixture whose children are conditionally independent but not independent; and updating a posterior on evidence that arrives in stages.
2. **Check which shapes already exist** (`grep -n 'name: "' data/chN.js`). Skip any shape that is already covered. A new shape goes in as a variant of the closest existing generator. If several new shapes share one idea, give them a generator (topic) of their own.
3. **Add a flashcard for each idea a shape teaches**, and a `methodGuide` row for each new wording cue.
4. **Don't copy the homework's numbers into a fixed problem.** Randomise the parameters and the scenery so the student practises the method, not the answer.
5. Run both checks, and update the counts in `README.md` (topics, problem types, the unit table).

## Shared utilities

`MATH340.util` (defined in `data/manifest.js`) is available as `U` in every unit:

| Helper | What it does |
| --- | --- |
| `randInt(a, b)`, `pick(arr)`, `shuffle(arr)`, `sample(arr, k)` | Random integers and random picks |
| `factorial(n)`, `perm(n, k)`, `choose(n, k)` | Counting. `choose` uses exact BigInt arithmetic |
| `gcd`, `lcm`, `round(x, d)`, `fmt(x, d = 4)` | Arithmetic and display rounding |
| `fracTex(n, d)` | A reduced fraction as LaTeX, e.g. `\frac{3}{4}` |
| `plural(n, one, many)` | Grammatical plurals in generated text |
| `venn2(opts)` | Four consistent Venn regions (in hundredths) for two events. Use this instead of drawing P(A), P(B) and P(A∩B) independently |
| `rotate(key, list)` | The round-robin picker behind `makeGenerator` |

Some chapter files also define local helpers, such as `sane(make, lo, hi)` in `ch3.js`, which redraws parameters until the answer is a probability worth computing. Reuse them within a file before writing new ones.

## Writing generators that actually vary

A generator is a **family of structurally different problems**, not one template with
the numbers shuffled. `MATH340.makeGenerator` takes a list of `variants` and hands them
out round-robin: a topic cycles through every variant in random order before any of them
repeats, and never repeats one back-to-back across cycles. The variant's `name` is revealed
*with the solution* (never before — naming the method is half the question) and counted as
"N problem types" in the topic list, the per-shape accuracy table, and the "which method?" drill.

Aim for **5–8 variants** per generator, and make them differ in the *method the student
has to recognise*, not the scenery:

- ✅ direct count vs. complement vs. overcounting adjustment vs. stars-and-bars
- ✅ running a rule forwards (LOTP) and backwards (Bayes), or solving it for a different unknown
- ✅ an edge case that punishes autopilot (disjoint ≠ independent; `A ⊆ B`; a two-headed coin)
- ❌ the same formula wearing a different hat ("8 runners" → "8 swimmers")

Re-skinning a story is still worth doing *inside* a variant (`U.pick` over a few contexts)
so the wording does not become a memorised cue — but it does not count as a variant.

## Conventions & gotchas

- **LaTeX in JS strings:** always build LaTeX-bearing strings with ``String.raw`...` `` (aliased to `R` in each file). A plain string literal silently eats backslashes (`"\("` becomes `"("`), which breaks rendering.
- **Delimiters:** `\( ... \)` for inline math, `$$ ... $$` for display math.
- **`<` in math:** card/solution strings are injected as HTML, so a `<` immediately followed by a letter (e.g. `\sum_{i<j}`) is parsed as an HTML tag and truncates the card. Write it as `&lt;` (`\sum_{i&lt;j}`); KaTeX still renders it as `<`. A `<` followed by a space or digit (e.g. `qe^t < 1`) is safe.
- **Stable IDs:** card and generator `id`s are the keys for saved progress. Never rename them once pushed, or users lose that item's history.
- **Answer checking:** `kind: "count"` requires the exact integer; `kind: "prob"` allows a small tolerance (default ±0.0006 or 0.4%, whichever is larger) and accepts `0.25`, `1/4`, or `25%`. A student who simply *rounds* is also credited: if they type a plain decimal to 2+ places and it is the correct rounding of the answer to that many places (and within 5% of it), it counts. Use `kind: "num"` for a numeric answer that is *not* a probability (odds, an expected count) — same tolerance rules, but the input placeholder stops saying "probability" and the smoke test stops demanding a value in `[0, 1]`.

- **Solution steps are the hint ladder.** Each `<div class="sol-step">` is revealed one at a
  time when the student asks for a hint or misses their first attempt, so write the steps so
  that step 1 is a *nudge toward the method* ("count the complement", "this is LOTP run
  backwards") rather than the arithmetic. Aim for 2–4 steps; a one-step solution can only be
  shown whole, which wastes the hint mechanism.

- **Add a `methodGuide`** to the unit: a list of `{ when, use, why }` rows describing how to
  tell from the wording which tool a question wants. It renders as a decision table at the top
  of the Reference page, and it is the part students reread before an exam. Use `R` for LaTeX
  here too.
- **Generator hygiene:** every random parameter combination must produce a well-posed problem and a finite `answer`. Run the smoke test before committing (no dependencies, needs only Node):

  ```sh
  node tools/check-generators.js        # or: node tools/check-generators.js 2000
  node tools/check-app.js               # grading, scheduling, migration, method guides
  ```

  It loads the data files listed in `index.html`, hammers every generator, and fails on a
  non-finite answer, a probability *stated in the question text* outside `[0, 1]` or a joint probability its marginals
  cannot produce, a `count` that is not a whole number, a `prob` outside `[0, 1]`, an
  `undefined`/`NaN` that leaked into the question text, unbalanced `$$` or `\( \)`, a stray
  `<` that the browser would eat as a tag, a duplicate id, or a declared variant that never
  actually appears. It also prints the variant count per generator. CI runs both scripts on every push and pull request.

  It does not run KaTeX. A malformed formula (an unknown command, a missing brace) passes the smoke test but renders as red error text in the browser, so open a few problems of each new variant in the site before pushing.

- **Schedule updates:** dates and topics live in `data/manifest.js` (`schedule`, `keyDates`, `gradeWeights`). Adjust there if the instructor shifts the calendar or posts a new due date. `keyDates` entries of `kind: "exam"` also drive the dashboard's exam countdown and rehearsal prompts.
- **Keep the README in step:** it quotes the topic and problem-type counts and has a per-unit table. `node tools/check-generators.js` prints the numbers. After a unit changes noticeably, refresh the screenshots with `node tools/screenshots.js` (needs Playwright with Chromium).
