/* The school course helpers: days until a key date on local calendar days, the quiz calendar across a DST change, the term week, and reading an empty store. */
process.env.TZ = "America/Chicago";   /* before any Date use: the Nov 1 2026 fall-back is the case that matters */
var S = require("../sb/school.js");
var n = 0, fails = 0;
function ok(c, m) { n++; if (!c) { fails++; console.log("  FAIL " + m); } }
function eq(a, b, m) { ok(a === b, m + " (got " + a + ", want " + b + ")"); }
var C = S.SCHOOL_COURSES[0];
function at(y, mo, d, h, mi) { return new Date(y, mo - 1, d, h || 0, mi || 0).getTime(); }

/* days until: the due day itself is 0, however early or late in the day you look */
eq(S.schDaysUntil("2026-10-02", at(2026, 10, 2, 10)), 0, "HW2 due day at 10:00 reads 0");
eq(S.schDaysUntil("2026-10-02", at(2026, 10, 2, 0, 1)), 0, "due day just after midnight reads 0");
eq(S.schDaysUntil("2026-10-02", at(2026, 10, 2, 23, 59)), 0, "due day just before midnight reads 0");
eq(S.schDaysUntil("2026-10-02", at(2026, 10, 1, 10)), 1, "the day before reads 1");
eq(S.schDaysUntil("2026-10-02", at(2026, 10, 3, 10)), -1, "the day after reads -1, not -0");
ok(!Object.is(S.schDaysUntil("2026-10-02", at(2026, 10, 2, 10)), -0), "never a negative zero");
eq(S.schDaysUntil("2026-11-23", at(2026, 10, 25, 9)), 29, "across the fall-back the count is still whole days");
eq(S.schDaysUntil("2026-11-02", at(2026, 10, 31, 23, 30)), 2, "late on the eve of the fall-back: two calendar days");

/* the demand filter: the day after a homework it is past, the day of it is today */
var D0 = S.schDemand(C, { due: 0, misses: 0, weak: [] }, at(2026, 10, 2, 10));
ok(D0.hw && D0.hw.days === 0 && D0.hw.label.indexOf("Homework 2") === 0, "on the due day the homework is due today");
ok(D0.items.some(function (it) { return it.kind === "homework" && / today$/.test(it.label); }), "and the plan item says today");
var D1 = S.schDemand(C, { due: 0, misses: 0, weak: [] }, at(2026, 10, 3, 10));
ok(!D1.hw || D1.hw.date !== "2026-10-02", "the day after, Homework 2 is past, not today");
var Dx = S.schDemand(C, { due: 0, misses: 0, weak: [] }, at(2026, 10, 21, 9));
ok(Dx.exam && Dx.exam.days === 0 && /Midterm/.test(Dx.exam.label), "the midterm on its day is 0 days away");

/* the quiz calendar: Wednesdays from week 2 (not weeks 6 and 10); the fall-back on Nov 1 must not drift it */
var q1 = S.schNextQuiz(C, at(2026, 9, 14, 9));
ok(q1 && q1.week === 2 && q1.days === 9, "from the first Monday the next quiz is week 2, nine days off: " + JSON.stringify(q1 && { week: q1.week, days: q1.days }));
var q8 = S.schNextQuiz(C, at(2026, 11, 4, 10));
ok(q8 && q8.week === 8 && q8.days === 0, "Wed Nov 4 (after the fall-back) is the week 8 quiz, today: " + JSON.stringify(q8 && { week: q8.week, days: q8.days }));
ok(q8 && q8.date.getDay() === 3 && q8.date.getHours() === 0, "the quiz date is a Wednesday at local midnight, not Tuesday 23:00");
var q8b = S.schNextQuiz(C, at(2026, 11, 2, 8));
ok(q8b && q8b.week === 8 && q8b.days === 2, "Mon Nov 2: the week 8 quiz is in two days");
var q9 = S.schNextQuiz(C, at(2026, 11, 5, 8));
ok(q9 && q9.week === 9 && q9.days === 6, "Thu Nov 5: the week 9 quiz is next Wednesday, six days off");
var qd = S.schDemand(C, { due: 0, misses: 0, weak: [] }, at(2026, 11, 4, 10));
ok(qd.quiz && qd.quiz.days === 0 && qd.items.some(function (it) { return /Quiz today/.test(it.label); }), "the plan shows the quiz today on Nov 4");
ok(S.schNextQuiz(C, at(2026, 11, 20, 8)) === null, "after the last quiz week there is no next quiz");
ok(S.schNextQuiz(C, at(2026, 10, 21, 8)).week === 7, "week 6 has no quiz: from Oct 21 the next is week 7");

/* the term week, on calendar days */
eq(S.schWeekOf(C, at(2026, 9, 14, 0, 1)), 1, "the first Monday is week 1");
eq(S.schWeekOf(C, at(2026, 9, 20, 23, 59)), 1, "the first Sunday is still week 1");
eq(S.schWeekOf(C, at(2026, 9, 21, 0, 1)), 2, "the second Monday is week 2");
eq(S.schWeekOf(C, at(2026, 11, 1, 1, 30)), 7, "Sunday Nov 1 at 1:30 (the repeated hour) is the last day of week 7");
eq(S.schWeekOf(C, at(2026, 11, 2, 0, 30)), 8, "Monday Nov 2 just after midnight is week 8, not week 7");
eq(S.schWeekOf(C, at(2026, 11, 4, 10)), 8, "Nov 4 is week 8");
eq(S.schWeekOf(C, at(2026, 9, 1)), 0, "before the term: week 0");
eq(S.schWeekOf(C, at(2027, 3, 1)), 11, "long after: capped at 11");

/* reading a store */
var R0 = S.schRead(C, null, at(2026, 10, 6, 10));
ok(R0 && R0.has === false && R0.due === 0 && R0.total === 0 && R0.streak === 0 && R0.weak.length === 0 && R0.lastExam === null, "no saved store reads as empty");
ok(S.schRead(C, "{not json", at(2026, 10, 6, 10)).has === false, "unreadable JSON reads as empty");
var R1 = S.schRead(C, JSON.stringify({ cards: { a: { box: 1, due: 1, seen: 1 }, b: { box: 5, due: 9e15, seen: 2 } }, misses: [{ key: "m" }], activity: { "2026-10-06": 3, "2026-10-05": 2 } }), at(2026, 10, 6, 10));
ok(R1.has && R1.due === 1 && R1.total === 2 && R1.mastered === 1 && R1.misses === 1 && R1.today === 3 && R1.streak === 2, "a saved store: due, totals, misses, today, streak");

/* demand on an empty store falls back to a mixed practice session */
var De = S.schDemand(C, S.schRead(C, null, at(2026, 10, 3, 10)), at(2026, 10, 3, 10));
ok(De.items.length === 1 && De.items[0].kind === "practice" && /Mixed practice/.test(De.items[0].label), "nothing due on Sat Oct 3: one mixed practice item");
ok(De.week === 3 && De.quiz && De.quiz.week === 4 && De.quiz.days === 4, "Oct 3 is week 3 with the week 4 quiz in four days");
ok(De.hw === null && De.exam && De.exam.days === 18, "no homework pending on Oct 3 (HW2 was yesterday); the midterm is 18 days off");
var Dq = S.schDemand(C, S.schRead(C, null, at(2026, 10, 6, 10)), at(2026, 10, 6, 10));
ok(Dq.items.length === 1 && Dq.items[0].kind === "apply" && /Quiz tomorrow/.test(Dq.items[0].label), "Oct 6: the quiz tomorrow is the one item");

console.log("school: " + (n - fails) + "/" + n + " passed");
if (fails) process.exit(1);
