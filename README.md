# Skill Builder

One hub for everything you are learning, built the way PokerPro was built: a path from zero to pro for each skill, drills on a spaced-repetition schedule with a speed gate, a simulated setting where the knowledge has to be used, and a level measured from what you actually do. Around all of it, a learning calendar that knows your classes and hockey and tells you what to study today without overloading you, with schoolwork first.

Six tracks, one page, no server:

| Track | Learn | Drill | Apply | Level |
|---|---|---|---|---|
| **School** (MATH 340 Probability, more as the term adds them) | the course's own lecture-built flashcards and method guides, inside the hub | generated problem types, a redo queue | timed quiz, midterm and final rehearsals | per-topic first-try accuracy, timed sittings |
| **Poker** (PokerPro, whole, inside the hub) | 43 lessons, four CFR solver labs | 37 drill generators | a six-handed table that prices and grades every decision | rating from your last 100 decisions |
| **Chess** | 21 lessons: rules, material, tactics, openings, endgames, strategy, calculation, Elo and engine evaluation | 15 generators verified by a built-in engine (mates, forks, best move, the square rule, the opposition…) | play six engine levels, every move graded; a rated tactics rush | move quality over the last 100 moves, plus a tactics rating that moves like Elo |
| **Swedish** | 30 lessons: sounds, 430 words by frequency, the grammar core, tenses and clauses, conversation, six graded readers, the C-level programme | per-word schedules that harden from recognition to production, dictation and speech; paradigm drills | six scripted conversations graded turn by turn, dictation, translation, an immersion log | a CEFR estimate (A0–C2) from words known, grammar passed, applied scores and hours |
| **Hebrew** (modern and Biblical) | 35 lessons: the alef-bet and points, 430 modern words, the root-and-binyan verb system, four readers, and a Biblical track (90 most-frequent words, the Qal paradigm, parsing, Genesis 1, Psalm 23 and the Shema word by word) | as Swedish, with an on-screen Hebrew keyboard | five conversations, dictation, translation, the log | CEFR estimate |
| **Spanish** | 30 lessons: sounds and stress, 430 words, ser/estar, the verb system to the subjunctive, six readers | as Swedish | six conversations, dictation, translation, the log | CEFR estimate |
| **Quant games** | the plan and the techniques | — | five two-minute games (arithmetic sprint, sequences, estimation, percentages, odds) modelled on the quant-firm screening game; no stakes, outside the budget | score history, tiers that rise with your median |

Everything is one page: the Math 340 studio draws inside the hub at `#/school/math340/…` and PokerPro runs inside the hub at `#/poker/…` with the hub's header, tabs and theme, so nothing hands you off to another app. It installs on a Mac, iPad and iPhone, works offline after the first visit, and syncs between devices through one private GitHub gist with a merge that never overwrites.

## Using it

- **Today** is the home page: the day's plan in order, built by the planner from what every track needs, placed into the free windows of your calendar. Schoolwork comes first (due flashcards, the redo queue, a timed set the night before a quiz, a full rehearsal in the two weeks before an exam, time reserved before a homework deadline), then reviews by how overdue they are, then at most two new lessons, then one applied session. Mark blocks done, or let them count themselves as the minutes come in.
- **Calendar**: the week with your classes and hockey, today's blocks drawn into it, a 14-day forecast of reviews falling due (exact, since every skill has a date), the month's history coloured by track, and the settings: your week, the daily cap (lower on hockey days and heavy days), the sleep cutoff, how many new lessons a day, and each track's priority.
- **Skills**: every track with its level, and trophies.
- **A skill's hub**: Learn (the path, stage by stage, with a placement test that passes whole stages you already know), Practice (today's reviews, free practice on any mix of drills, the skills table and your calibration), Apply (the engine, the conversations, dictation, writing, the log), Level, and Library (reference cards, glossary, reading list).
- **School**: each course's due cards, redo queue, mastery, key dates and weakest topics; open the course and its own pages (dashboard, flashcards, practice, exam mode, reference, schedule, progress) draw inside the hub under the hub's header and tabs.
- **Poker**: PokerPro, whole, under the hub's Poker header and tabs (Home, Learn, Practice, Play, Level, Library). It follows the hub's light or dark theme, the page scrolls as one, and the hub's address follows every page the app moves to, so Back and bookmarks work.
- **Library**: every reference card and glossary term across skills, searchable; the reading lists; and *The method*, the science each rule rests on, with sources.
- **Sync, backup and install**: the token, the devices that have synced, the log, a JSON backup that merges on restore, and the install steps for each device.

## How it makes things stick

The schedule is PokerPro's: every skill sits in one of eight Leitner boxes and climbs only on a day it is due, after clean answers inside a time goal that tightens as the box rises (gaps of 1, 3, 7, 16, 35, 80, 180 days). A miss drops a box and comes back two questions later. Sessions interleave. Recall cards make you say a lesson's rule before revealing it. A confidence prompt after each answer builds a calibration score. XP, a daily goal, a streak with freezes, ranks and trophies reward what builds skill; the levels measure outcomes and can go down.

For the languages, each word is its own skill and the question hardens as it climbs: pick the meaning, pick the word, type it, type it into a sentence, type what you heard, say it. Listening and speaking use the device's own voices and speech recognition when it has them (Safari and Chrome on Apple devices have Swedish, Spanish and Hebrew voices), and fall back to showing text briefly or to honest self-grading. The planner's rules (reviews first, capped new material, a budget from the calendar, nothing after the sleep cutoff) and the sources behind them are on the Library's method page.

On the question of the best way to learn a language without immersion: what people call the CIA method is the Foreign Service Institute's programme, and its contribution here is the hour estimates (Swedish and Spanish about 600–750 hours to professional proficiency, Hebrew about 1,100) and the order: sounds first, then high-frequency words with their sentences, then grammar as patterns you produce, then output with feedback. The level model counts logged immersion hours because past B1 they are the level.

## Layout

```
index.html              the hub, built from sb/ (do not edit; run node build.js); the Math 340 app is inlined into it
sw.js                   the service worker, generated: every file the hub and PokerPro need offline
site/                   the hub's manifest, icon and the service-worker template
poker/                  PokerPro, built from src/, shown inside the hub's frame at #/poker (and still a page of its own)
school/math340/         the MATH 340 Probability Studio: its content and app, inlined into the hub, and its own tests and standalone page
src/                    PokerPro's modules; app.tpl.html has an embedded mode (no header, the hub's theme) for the hub's frame
sb/
  core.js               the course registry and the skill model shared by every track
  lang.js               the language engine: normalisation, graduated word drills, paradigm drills, the conversation grader, the CEFR model
  planner.js            the learning calendar: free windows, the daily budget, the plan, the forecast
  school.js             the School track: course registry, the SCHOOL_APPS registry the inlined course apps join, reading a course's saved progress, what it needs today
  hubsync.js            the cross-device merge for hub + PokerPro + Math 340 state
  quant.js              the five quant games, scoring, tiers, the plan
  chess.js              the chess engine: move generation, FEN, SAN, search, evaluation, grading
  chess_drills.js       chess generators, the Play model, the chess level
  chess_course.js       the chess course
  sv_data.js / sv_course.js, he_data.js / he_data2.js / he_course.js, es_data.js / es_course.js
  method.js             the science, with sources
  app.tpl.html          the hub's shell and CSS
  ui/                   the hub's screens, concatenated in order by the build
test/                   PokerPro's tests, and sb_*.test.js for the hub's modules
tools/smoke.js          a headless browser pass over every screen of the built hub (Playwright)
docs/ADDING_A_COURSE.md how new coursework and new skills get in
```

## Build and test

```
node build.js        # src/ -> poker/index.html, sb/ + school/math340 content and app -> index.html, sw.js
npm test             # PokerPro's suites, the hub's suites, and Math 340's checks
npm run serve        # http://localhost:8000
node tools/smoke.js  # the headless pass (needs Playwright with Chromium)
```

The hub's suites: `sb_chess.test.js` (perft against the published counts, SAN, mates, grading), `sb_planner.test.js` (windows, budgets, the plan's ordering and caps, the forecast), `sb_lang.test.js` (every lesson of every language resolves, every drill and every word at every box produces a gradable question, the level model), `sb_chess_drills.test.js` (curated puzzles verified by the engine, generated mates really mate, forks really fork, the square rule agrees with a search, a full graded game), `sb_sync.test.js` (the merge is commutative and idempotent, a wipe wins), `sb_quant.test.js` (every game at every tier).

## Adding content

Math 340 content is added week by week into `school/math340/data/` with no changes to application code ([`school/math340/docs/ADDING_CONTENT.md`](school/math340/docs/ADDING_CONTENT.md)); the build picks it up. New courses and new skill tracks: [`docs/ADDING_A_COURSE.md`](docs/ADDING_A_COURSE.md).

## Deploy

Push to `main`. The workflow builds, runs every test suite, assembles the site (the hub, `poker/`, `school/math340/`) and publishes it to GitHub Pages. The first time, set **Settings → Pages → Source** to **GitHub Actions**.

## License

MIT
