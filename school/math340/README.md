# Probability Studio — MATH 340 Study Companion

An interactive study tool for **MATH 340: Probability** (Fall 2026, Lawrence University), built as a fast, dependency-light static site. It turns each week's lecture material into **spaced-repetition flashcards**, **freshly generated practice problems with worked solutions**, **timed exam rehearsals**, and a **progress dashboard that tells you what to study next** — so the identities stick and the problem-solving methods become automatic before each Wednesday quiz, the midterm, and the final.

> **Textbook:** Blitzstein & Hwang, *Introduction to Probability* (2nd ed.) · **Course schedule, key dates, and grade weights are built in** from the syllabus.

![Dashboard](docs/assets/dashboard.png)

## Features

**🃏 Flashcards with spaced repetition**
Every definition, theorem, and identity from lecture is a card (Definition 2.2.1, Bayes' rule, inclusion–exclusion, Table C distributions, …). A six-box Leitner system schedules reviews: cards you know move up a box and appear less often — the top box waits three weeks, long enough to carry a week-2 card to the cumulative final — and cards you miss drop to box 1 *and come back later in the same session*, so a lapse is relearned while you are still sitting there. Cards in box 4+ count as *mastered*. A **cram** mode ignores the schedule and leads with your weakest cards, which is what you actually want the night before a quiz. Keyboard-friendly: Space flips the card, then 1 or J means "missed it" and 2 or K means "knew it".

**✏️ Generated practice problems**
Each topic is a *family of problems*, not a fixed bank and not one template with the numbers shuffled. There are **30 topics holding 204 structurally different problem types**, and a topic cycles through all of its types before any one repeats:

- **Chapter 1 (8 topics, 54 types):** ordered selections, combinations, sampling with/without replacement, naive probability, inclusion–exclusion, the complement trick, random splits, and the axioms and Venn regions.
- **Chapter 2 (11 topics, 69 types):** two-way tables, the definition of conditional probability, the law of total probability, Bayes' rule, independence and reliability, unions and intersections of independent events, odds, the chain rule, checking independence, and two topics built from Assignment 2: *what exactly are you conditioning on?* ("the first is red" vs. "at least one is red" vs. "R₁ was drawn") and *diagnostic tests* (sensitivity, specificity, overall success rate, and the "call everyone healthy" rule).
- **Chapter 3 (11 topics, 81 types):** random variables and PMFs (including telling discrete from continuous), probabilities from a PMF, CDFs, the Binomial, the Hypergeometric, the Discrete Uniform, functions of a random variable, independence of r.v.s and indicators, the Geometric and Negative Binomial, the Poisson (including its derivation as a limit of the Binomial), and functions of two random variables: comparing them, products, 2X vs. X₁ + X₂, whether X + Y and X − Y are independent, extremes of many i.i.d. r.v.s, and variables that share a distribution without being equal.

That means a single topic will ask you to count directly, then via the complement, then adjust for overcounting, then reach for stars-and-bars; or run a rule forwards (law of total probability) and then backwards (Bayes), then solve it for a different unknown. Several variants exist purely to punish autopilot — disjoint events that are *not* independent, an event nested inside another, a two-headed coin. Answers accept decimals, fractions (`5/36`), or percents, and sensible rounding is credited.

The point is **recognising which method applies**, so the session is built around that:

- **The topic is hidden** in a mixed session until you answer. (Being told "complement trick" above a problem whose whole difficulty is spotting that you need the complement gives away the question.)
- **A wrong answer buys a hint and a second attempt**, not the answer — the worked solution is revealed one step at a time, and the first step points at the *method* rather than the arithmetic.
- **Common mistakes are named, not just marked wrong.** Answer the complement and it says so; hand back odds where a probability was asked for and it says that too.
- **Only unaided first attempts count as correct** in your stats, because that is the number that predicts how a quiz will go.
- **"Target my weak spots"** samples topics weighted by how badly you are doing at them, and untried topics rank high — you cannot know you are fine at something you have never attempted.
- **"Which method?" drill** shows a problem stem and four techniques, and asks only which one it wants. No arithmetic. It is the fastest way to train the skill that decides most exam questions.
- **What you miss is kept**, question and worked solution, in a redo queue you can re-attempt later, and solving it there clears it. A problem you only got right with a hint or on the second try goes in too. The queue holds your 60 most recent misses, at most 3 per problem shape, so one bad topic cannot crowd out the rest. Getting the same problem right the second time is where most of the learning happens.

**⏱ Exam mode**
Timed, mixed, deferred-feedback problem sets — the conditions 70% of the grade (quizzes, midterm and final) is actually decided under. Presets match the syllabus: a 5-problem/15-minute Wednesday quiz on the most recent chapter, a 12-problem/70-minute midterm rehearsal (the real sitting is 1:50–3:00 pm), an 18-problem/150-minute cumulative final rehearsal, or a custom set of any size, length and chapter. No hints, no topic labels, no feedback until you submit; free navigation, flag-for-review, and a question palette, like a paper exam. Afterwards you get a score, a per-topic breakdown of where the marks went, every worked solution, and every miss pushed into your practice stats and redo queue.

**📊 Progress tracking**
Per-chapter mastery bars, per-topic first-try accuracy (overall and last 10), **per-problem-shape accuracy** so you can see that a topic's respectable average is hiding one shape that keeps catching you, a timed-sitting history, a 14-day activity strip, and a study streak. Progress is stored in your browser and can be exported/imported as JSON to move between devices; the export includes your formula-sheet selection.

![Progress](docs/assets/progress.png)

**🎯 A dashboard that answers "what should I do right now?"**
Not a wall of numbers — a ranked list of two or three concrete actions with a reason attached, built from what is due, what you have missed, what you are weakest at, and how close the next quiz or exam is.

**Σ Reference sheets and a formula-sheet builder**
Every identity from lecture on one searchable page, plus the full **Common Distributions table (Table C)** — story, support, PMF/PDF, mean, variance, and MGF for each named distribution. The midterm allows one 8.5×11" sheet, so the page doubles as the builder: tick the identities you want and hit print, and the print stylesheet drops everything else and sets your selection in two dense columns. The selection is saved and travels in your export.

**🧭 "Choosing the right tool" guides**
Formulas are the easy half. Each chapter carries a decision table (49 rows in all) — *when the question says …, reach for …, because …* — covering the wording cues that tell you it is a combination rather than a permutation, LOTP rather than Bayes, Binomial rather than Hypergeometric or Negative Binomial, or a base rate you are about to ignore.

**🗓 Course schedule awareness**
The tool knows the 10-week schedule, highlights the current week, flags quiz weeks, and counts down to the key dates in `data/manifest.js`: homework deadlines, the midterm (Oct 21), and the final (Nov 23). Within two weeks of an exam the dashboard starts recommending full-length rehearsals.

| Practice — a miss buys a hint and another go | Exam mode — timed, no feedback until you submit |
| --- | --- |
| ![Practice](docs/assets/practice.png) | ![Exam mode](docs/assets/exam.png) |
| **Flashcards** — Leitner boxes, in-session relearning | **Reference** — tick identities, print the sheet |
| ![Flashcards](docs/assets/flashcards.png) | ![Reference](docs/assets/reference.png) |

## Using the site

The tool is a static site — no build step, no server, no account.

- **On GitHub Pages (recommended):** the `Deploy to GitHub Pages` workflow (`.github/workflows/deploy-pages.yml`) publishes the repository root on every push to `main`. The first time, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The site will be live at `https://<username>.github.io/<repository-name>/`.
- **Locally:** clone the repo and open `index.html` in a browser, or serve it with `python3 -m http.server`.

Math rendering (KaTeX) is vendored in `lib/katex/`, so the site also works offline.

There is no build step and no test framework. Both test suites are plain Node with no dependencies, and the `Checks` workflow runs them on every push and pull request:

```sh
node tools/check-generators.js 2000   # every problem type is well posed (CI uses 2000 runs per topic)
node tools/check-app.js               # grading, hints, Leitner scheduling, weakness model, method guides, migration
```

## A study routine that fits the course

| When | What |
| --- | --- |
| Daily (5–10 min) | Work the Dashboard's "today's plan" — usually due flashcards plus your redo queue. |
| After each lecture | Study the new chapter's deck until every card is at box 2+. |
| Tuesday nights | **Cram** last week's deck, then sit a 5-problem timed quiz in Exam Mode — quizzes are Wednesdays and cover the previous week. |
| Whenever you have 10 minutes | "Target my weak spots", or the "which method?" drill if you are away from paper. |
| Two weeks before the midterm/final | Sit a full-length rehearsal, drill whatever it finds, repeat. Build and print the formula sheet from the Reference page. |

## Course content grows week by week

Lecture materials are released week-of, so the repository adds a content module per chapter as the term progresses. Homework is folded into the matching chapter rather than kept separately: each assignment's problem shapes become practice topics and problem types, so what you rehearse is what gets graded.

| Unit | Source material | Cards | Topics | Problem types | Status |
| --- | --- | ---: | ---: | ---: | --- |
| Chapter 1 · Probability and Counting | C1 notes, B&H ch. 1 | 20 | 8 | 54 | ✅ Available |
| Chapter 2 · Conditional Probability | C2 notes, B&H ch. 2, Assignment 2 | 21 | 11 | 69 | ✅ Available |
| Chapter 3 · Random Variables & Distributions — PMFs, CDFs, Bernoulli/Binomial, Hypergeometric, Discrete Uniform, Geometric & Negative Binomial, Poisson and the Binomial limit, functions of one and two r.v.s, independence & indicators | Full C3 deck (84 slides), B&H ch. 3 and §4.3, §4.7 | 56 | 11 | 81 | ✅ Available |
| Common Distributions · Table C | Class handout | 20 | — | — | ✅ Available (reference + flashcards) |
| Chapters 4–8 (expectation and variance, continuous distributions, MGFs, multivariate, limit laws) | | | | | 🔜 Added as covered in class |

Each unit is a single self-registering file in `data/` — adding a new week requires **no changes to the application code**. See [`docs/ADDING_CONTENT.md`](docs/ADDING_CONTENT.md) for the 10-minute recipe. The quickest route is to give Claude the new lecture or homework PDF and ask it to follow that guide.

## Project structure

```
├── index.html            # App shell — add one <script> tag per new content unit
├── css/styles.css        # Theme (light/dark), layout, components
├── js/
│   ├── app.js            # Router, dashboard + study plan, schedule, reference, progress
│   ├── flashcards.js     # Leitner engine, review/cram sessions, in-session relearning
│   ├── practice.js       # Problem runner, hints, answer grading, "which method?" drill
│   ├── exam.js           # Timed deferred-feedback sittings + scored report
│   └── store.js          # localStorage persistence, weakness model, mistake log, export/import
├── data/
│   ├── manifest.js       # Course info, schedule, key dates, grade weights, unit registry, math utils
│   ├── ch1.js            # Chapter 1 — flashcards, problem generators, method guide
│   ├── ch2.js            # Chapter 2 — same, plus the Assignment 2 problem shapes
│   ├── ch3.js            # Chapter 3 — random variables, PMF/CDF, named discrete distributions
│   └── distributions.js  # Table C reference + distribution flashcards
├── lib/katex/            # Vendored KaTeX (offline math rendering)
├── tools/
│   ├── check-generators.js  # Smoke test: every problem type is well posed (node, no deps)
│   ├── check-app.js         # Tests: grading, hints, Leitner ladder, weakness model, migration
│   └── screenshots.js       # Regenerates docs/assets/*.png (needs Playwright; not run in CI)
├── .github/workflows/
│   ├── checks.yml        # Runs both test suites on every push and PR
│   └── deploy-pages.yml  # Publishes the site to GitHub Pages on push to main
└── docs/
    ├── ADDING_CONTENT.md # How to add a chapter or homework assignment
    └── assets/           # README screenshots
```

## Privacy

All progress data stays in your browser's `localStorage`. Nothing is transmitted anywhere.

## Acknowledgements

Content is transcribed and adapted from the MATH 340 lecture notes (S. Zhou) and Blitzstein & Hwang, *Introduction to Probability* (2nd ed.), whose Table C the distributions reference follows. This is a personal study aid, not an official course resource.
