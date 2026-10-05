/* The game layer: XP pays most for spaced reviews, streaks and freezes
   behave, ranks climb, trophies count the right things. */
const fs = require("fs");
eval(["game.js"].map(f => fs.readFileSync(__dirname + "/../src/" + f, "utf8").replace(/\nif \(typeof module[\s\S]*$/, "")).join("\n"));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL " + m); } };

/* XP favours the behaviour that builds skill */
const due = gmAnswerXP({ due: true, ok: true, fast: true }), cram = gmAnswerXP({ due: false, ok: true, fast: true });
ok(due > 2 * cram, "a due review pays more than twice a crammed answer: " + due + " vs " + cram);
ok(gmAnswerXP({ due: true, ok: true, fast: false }) < due, "fast beats slow");
ok(gmAnswerXP({ due: true, ok: false }) > 0, "an honest miss on a review still pays");
ok(gmAnswerXP({ due: false, ok: true, fast: true, cramToday: 40 }) === 1 && gmAnswerXP({ due: false, ok: false, cramToday: 99 }) === 0, "cramming past 40 a day pays the minimum");
ok(gmAnswerXP({ due: true, ok: true, fast: true, promoted: 3 }) === 10 + 45, "a promotion adds 15 per box");
ok(gmTableXP("Best") > gmTableXP("Good") && gmTableXP("Mistake") === 0, "table XP follows the grade");

/* ranks */
ok(gmRank(0).name === "Rookie" && gmRank(299).name === "Rookie" && gmRank(300).name === "Grinder", "rank edges");
ok(gmRank(1e6).next === null && gmRank(1e6).toNext === 1, "top rank");
ok(Math.abs(gmRank(650).toNext - 0.5) < 1e-9 && gmRank(650).need === 350, "progress to the next rank");
ok(GM_RANKS.every((r, i) => !i || r.xp > GM_RANKS[i - 1].xp), "ranks climb");
ok(gmTotal({ a: { x: 5 }, b: { x: 7 }, c: {} }) === 12, "total XP sums the days");

/* streaks: build a log of goal days relative to a fixed "now" */
const NOW = new Date(2026, 9, 20, 15).getTime();
const day = n => gmDayKey(NOW - n * 864e5);
const log = met => { const L = {}; met.forEach(n => { L[day(n)] = { g: 1 }; }); return L; };
ok(gmStreak({}, NOW).days === 0, "no log, no streak");
ok(gmStreak(log([1, 2, 3]), NOW).days === 3 && !gmStreak(log([1, 2, 3]), NOW).todayMet, "today unfinished does not break it");
ok(gmStreak(log([0, 1, 2]), NOW).days === 3 && gmStreak(log([0, 1, 2]), NOW).todayMet, "today counts once met");
ok(gmStreak(log([1, 2, 4, 5]), NOW).days === 2 && gmStreak(log([1, 2, 4, 5]), NOW).best === 2, "a gap with no freeze resets");
/* 7 goal days earn a freeze, which covers one missed day */
const run = [9, 8, 7, 6, 5, 4, 3, 1];   /* day 2 missed */
const s1 = gmStreak(log(run), NOW);
ok(s1.days === 8 && s1.freezes === 0 && s1.frozen === 1, "a freeze covers a missed day: " + JSON.stringify(s1));
ok(gmStreak(log([3, 2]), NOW).days === 0, "yesterday missed with no freeze: streak over");
const s2 = gmStreak(log([12, 11, 10, 9, 8, 7, 6, 3, 2, 1]), NOW);   /* days 5 and 4 missed, one freeze */
ok(s2.days === 3 && s2.best === 7, "two misses with one freeze resets: " + JSON.stringify(s2));
const long = gmStreak(log(Array.from({ length: 40 }, (_, i) => i + 1)), NOW);
ok(long.days === 40 && long.freezes === 2, "freezes cap at 2: " + JSON.stringify(long));
ok(gmPrevDay("2026-03-01") === "2026-02-28" && gmPrevDay("2026-01-01") === "2025-12-31", "previous day across months and years");

/* trophies */
const T0 = gmTrophies({});
ok(T0.length >= 18 && T0.every(t => !t.got && t.cur === 0), "nothing unlocked from nothing");
ok(new Set(T0.map(t => t.id)).size === T0.length, "trophy ids unique");
const T1 = gmTrophies({ lessons: 3, stages: [{ n: 1, title: "x", done: 6, of: 6 }, { n: 2, title: "y", done: 2, of: 5 }], boxes: [6, 3, 1], bestStreak: 8, answers: 150, level: 5, hands: 40 });
const got = id => T1.find(t => t.id === id).got;
ok(got("lesson1") && got("stage1") && !got("stage2") && got("streak7") && !got("streak30"), "lesson, stage and streak trophies");
ok(got("solid1") && got("auto1") && !got("auto10") && got("ans100") && got("lvStrong") && !got("lvExpert"), "skill and table trophies");
ok(T1.find(t => t.id === "hands100").cur === 40 && T1.find(t => t.id === "stage2").cur === 2, "progress toward a locked trophy");

console.log("game: " + pass + " passed, " + fail + " failed");
if (fail) process.exit(1);
