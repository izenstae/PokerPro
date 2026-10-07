# Adding coursework and courses

Schoolwork is first in every day's plan. This is how new material gets in, from a single homework set to a whole new course.

## New material for a course that already exists (Math 340)

Math 340 lives whole at `school/math340/` and keeps its own content format: one self-registering file per chapter in `school/math340/data/`, plus one `<script>` tag in `school/math340/index.html`. The ten-minute recipe, with the template for flashcards, problem generators and the "which method?" guide, is in [`school/math340/docs/ADDING_CONTENT.md`](../school/math340/docs/ADDING_CONTENT.md).

The quickest route, as that guide says: give Claude the week's lecture PDF or the homework PDF and ask it to add the chapter (or the homework's problem shapes) following that guide, then run the course's checks:

```sh
cd school/math340 && node tools/check-generators.js 2000 && node tools/check-app.js
```

Then `node build.js` at the root. The build reads the script tags in `school/math340/index.html`, inlines the content and the app into the hub, and regenerates the service worker's file list, so the new chapter is on the course's pages inside the hub, counted in the hub's "cards due", works offline, and syncs. Nothing in the hub needs editing.

## A new course

1. **Make it a folder under `school/`.** Copy `school/math340/` as a starting point (its app is course-agnostic: the manifest in `data/manifest.js` holds the course code, term start, schedule, key dates and grade weights; the chapters are data files). Change `data/manifest.js` to the new course, give it a new storage key in `js/store.js` (`const KEY = "<course>-progress-v1"`), and add its content files.
2. **Register it in the hub.** Add one entry to `SCHOOL_COURSES` in `sb/school.js`: id, code, name, term, `href` (the folder), `storeKey` (the same key as step 1), `termStart`, `keyDates`, `quizDay`, `links` (its pages, `[title, pageId]`), `gradeWeights`. The planner, the School page, the Calendar's dates and the sync file pick it up from that entry.
3. **Inline it into the hub.** In `build.js`, the Math 340 block reads the course's `index.html`, inlines its `data/` files and then its `js/` files inside a function scope of their own, and registers the app's shell as `SCHOOL_APPS["<id>"] = App`. Duplicate that block for the new course (same scope trick, so two courses' `App`, `Store` and `Practice` never meet) and add the scoped stylesheet the same way (`scopeCss(…, ".m340")` and the `.m340` variable block in `sb/app.tpl.html` serve any course with the Math 340 stylesheet; a course with its own stylesheet gets its own scope class). The hub then draws the course's pages at `#/school/<id>/<page>` under its own header and tabs, from `App.pages` and `App.mount(page, el, { base })`; the app's shell (`js/app.js`) shows the contract: `mount`, `pages`, `link` (every internal link goes through it), `leave`, `inProgress`, `onKey`, `reload`, `typeset`, `weekLabel`. Add the store key to `syncLocal()` / `syncApply()` in `sb/ui/45_more.js` and a merge in `sb/hubsync.js` if its store shape differs from Math 340's.
4. **Build and test.** `node build.js && npm test && node tools/smoke.js`.

If the course is small, there is a lighter path: write it in the hub's own lesson-and-drill format (see `sb/chess_course.js` for a complete example) and register it with `registerCourse`. It then gets the hub's reader, checkpoints, placement test, schedule, level page and library for free. Give it `kind: "school"` and a priority of 4 in `plDefault()` so the planner treats it as schoolwork.

## Adding a skill track

Any new skill (an instrument, a sport's theory, a programming language) follows the same shape as chess, Swedish, Hebrew and Spanish:

- a data file (vocabulary, tables, puzzles) and a course file that calls `registerCourse({ id, name, kind, path, lessons, drills, formulas, glossary, reading, ranks, apply })`;
- lessons as block arrays (`p`, `rule`, `tbl`, `ex`, `warn`, `key`, `how`, and `board` / `verse` for chess and Hebrew), each with a `mode` naming its drill, a vocabulary set (`words:<id>`), or a fixed `quiz`;
- drills as generators returning `{ kind, question, options/answer/accept, target, explain }`;
- a test in `test/` that loads the course and asks every drill a few hundred times (copy `test/sb_lang.test.js`).

Add the files to the `sb` list in `build.js` and the track appears in Skills, the Calendar, the Library and the sync.
