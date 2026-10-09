---
name: adding-content
description: What to do when adding content to Skill Builder — a new Math 340 chapter or homework's problem shapes, a new school course, new lessons or drills for chess, Swedish, Hebrew, Spanish or poker, or a whole new skill track. Use whenever the user hands over a lecture PDF, a homework, vocabulary, puzzles or lesson material and asks for it to go into the app, or asks to add a course, lesson, drill, flashcard or track.
---

# Adding content to Skill Builder

The app is data-driven. Almost all content goes in as data files that register themselves; application code rarely changes. Work out which kind of content it is, follow that path, then run the same build-and-check routine at the end.

## 1. Decide which path

| The content is… | Where it goes | Full guide |
|---|---|---|
| A week of MATH 340 lectures | a new or extended `school/math340/data/chN.js`, plus one `<script>` tag in `school/math340/index.html` | `school/math340/docs/ADDING_CONTENT.md` |
| A MATH 340 homework | new variants / generators, flashcards and `methodGuide` rows inside the chapter it exercises (never a unit of its own) | same guide, "Adding a homework assignment" |
| A new school course | a folder under `school/`, an entry in `SCHOOL_COURSES` in `sb/school.js`, a block in `build.js` (or the lighter `registerCourse` path for a small course) | `docs/ADDING_A_COURSE.md`, "A new course" |
| Lessons or drills for chess or a language | the track's `sb/<id>_course.js` (lessons, path, drills) and `sb/<id>_data.js` (vocabulary, tables, puzzles) | `docs/ADDING_A_COURSE.md`, "Adding a skill track" |
| A new skill track | a new `sb/<id>_data.js` + `sb/<id>_course.js` calling `registerCourse`, added to the `sb` list in `build.js`, plus a test | `docs/ADDING_A_COURSE.md`, "Adding a skill track"; `sb/chess_course.js` is the complete example |
| Poker lessons or drills | `src/lessons.js` / `src/lessons2.js`, `src/drills.js` / `src/drills2.js` | follow the neighbouring entries; tested by `npm run test:poker` |

Read the full guide for the path before writing anything. Then read one existing file of the same kind (e.g. `school/math340/data/ch2.js`, `sb/sv_course.js`) and copy its shape.

If the user gave a PDF or other source material, read all of it first and list what it contains (definitions, theorems, problem shapes, words, rules) before deciding what is new.

## 2. Rules that apply to every path

- **Check what already exists first.** Grep for the topic, word or problem shape (`grep -n 'name: "' school/math340/data/chN.js`, `grep -n 'id: "' sb/<id>_course.js`). Extend the closest existing item instead of duplicating it. A chapter that arrives in halves grows its existing file.
- **IDs are permanent.** Card, generator, lesson, drill and word ids key the user's saved progress and sync. Pick stable, unique ids and never rename or delete one that has been pushed.
- **Edit sources, not built files.** `index.html`, `sw.js` and `poker/index.html` are generated; change `sb/`, `src/`, `school/` and rebuild.
- **Practise the method, not the answer.** Generators randomise parameters and scenery; variants differ in the *method* the learner must recognise (aim for 5–8 per generator), not in the story. Never copy a homework's numbers into a fixed problem.
- **Teach in the house format.** Hub lessons are block arrays (`p`, `rule`, `tbl`, `ex`, `warn`, `key`, `how`, plus `board` for chess and `verse` for Hebrew) with a `mode` naming a drill, a vocabulary set (`words:<id>`) or a `quiz`, and one `key` block holding the thing to memorise. Drills return `{ kind, question, options/answer/accept, target, explain }`.
- **Hints are a ladder.** Math 340 solution steps (`<div class="sol-step">`) are revealed one at a time: step 1 nudges toward the method, 2–4 steps in all.
- **LaTeX (Math 340):** build any string containing LaTeX with `R\`...\`` (`String.raw`); `\( \)` inline, `$$ $$` display; write `<` before a letter as `&lt;`.
- **Match the voice.** Plain, direct prose in the style of the surrounding lessons; every claim correct (chess positions verified by the engine, probabilities computed exactly, translations checked).
- **Keep the counts honest.** Update the numbers quoted in `README.md` (and `school/math340/README.md` for Math 340) when lessons, words, drills, topics or problem types change.

## 3. Build and check

Run what applies, and fix every failure before committing:

```sh
# Math 340 content
cd school/math340 && node tools/check-generators.js 2000 && node tools/check-app.js && cd ../..

# everything
node build.js          # regenerates index.html, poker/index.html and sw.js
npm test               # poker, hub and school suites
node tools/smoke.js    # headless pass over every screen (Playwright; Chromium is preinstalled)
```

The checks do not run KaTeX or render lessons. For new Math 340 variants or new hub lessons, open a few in the built app (`npm run serve`, then http://localhost:8000) and confirm they render.

A new track or course also needs its own test in `test/` that loads it and asks every drill a few hundred times (copy `test/sb_lang.test.js`), added to `test:hub` in `package.json`.

## 4. Commit

Commit the source changes together with the rebuilt `index.html`, `sw.js` (and `poker/index.html` if `src/` changed). In the message, say what was added: the chapter or track, and how many cards, generators, variants, lessons or words. Pushing to `main` deploys through `.github/workflows/deploy.yml`, which builds and runs every suite first.
