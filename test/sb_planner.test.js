/* The planner: free windows around classes and hockey, the daily budget, and a plan that never overloads a day. */
var P = require("../sb/planner.js");
var n = 0, fails = 0;
function ok(cond, msg) { n++; if (!cond) { fails++; console.log("  FAIL " + msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (got " + a + ", want " + b + ")"); }

var S = P.plDefault();
S.week[1] = [{ n: "Calculus", k: "class", f: "09:00", t: "10:30" }, { n: "Lab", k: "class", f: "13:00", t: "16:00" }, { n: "Hockey", k: "hockey", f: "19:00", t: "21:00" }];
S.week[2] = [{ n: "Stats", k: "class", f: "10:00", t: "11:00" }];
S.week[3] = [{ n: "A", k: "class", f: "08:00", t: "11:00" }, { n: "B", k: "class", f: "12:00", t: "15:00" }];

/* windows */
var w = P.plFree(S, 1);
eq(w.length, 4, "Monday has four free windows");
eq(P.plFmt24(w[0].f) + "-" + P.plFmt24(w[0].t), "07:00-08:45", "first window ends a buffer before class");
eq(P.plFmt24(w[1].f) + "-" + P.plFmt24(w[1].t), "10:45-12:45", "between classes, buffered both sides");
eq(P.plFmt24(w[3].f) + "-" + P.plFmt24(w[3].t), "21:15-23:00", "after hockey until the sleep cutoff");
eq(P.plFree(S, 0).length, 1, "a free day is one window");
eq(P.plFreeMinutes(S, 0), 16 * 60, "a free day has 16 hours");

/* budget */
eq(P.plBudget(S, 0).minutes, 60, "normal cap on a free day");
eq(P.plBudget(S, 1).minutes, 40, "hockey day cap");
eq(P.plBudget(S, 1).why, "hockey day", "hockey day named");
eq(P.plBudget(S, 3).minutes, 45, "six hours of class is a heavy day");
var tight = P.plDefault(); tight.week[4] = [{ n: "All day", k: "work", f: "07:00", t: "22:50" }];
eq(P.plBudget(tight, 4).minutes, 0, "no free time, no budget");

/* a plan */
var demand = {
  poker: { name: "Poker", due: 12, dueMin: 10, overdue: 0, lesson: { id: "x", title: "SPR", min: 6, href: "#p" }, drill: { href: "#pd" }, apply: { href: "#pp", label: "Play 20 hands", min: 15 }, level: 2 },
  chess: { name: "Chess", due: 0, dueMin: 0, overdue: 0, lesson: { id: "y", title: "Forks", min: 5, href: "#c" }, drill: { href: "#cd" }, apply: { href: "#cp", label: "Play a game", min: 15 }, level: 1 },
  sv:    { name: "Swedish", due: 30, dueMin: 18, overdue: 2, lesson: { id: "z", title: "Verbs", min: 7, href: "#s" }, drill: { href: "#sd" }, apply: { href: "#sp", label: "Conversation", min: 12 }, level: 1 },
  he:    { name: "Hebrew", due: 4, dueMin: 3, overdue: 0, lesson: null, drill: { href: "#hd" }, apply: null, level: 0 }
};
var plan = P.plPlan(S, 0, demand, {}, "2026-10-04");
ok(plan.used <= plan.budget, "plan fits the budget: " + plan.used + " of " + plan.budget);
var kinds = plan.blocks.filter(function (b) { return !b.deferred; }).map(function (b) { return b.kind; });
eq(kinds[0], "review", "reviews come first");
ok(kinds.indexOf("lesson") < 0 || kinds.lastIndexOf("review") < kinds.indexOf("lesson"), "every review precedes every lesson");
eq(plan.blocks.filter(function (b) { return b.kind === "review" && !b.deferred; })[0].skill, "sv", "most overdue, highest priority review first");
ok(plan.blocks.filter(function (b) { return b.kind === "lesson"; }).length <= 2, "at most two new lessons a day");
var perSkill = {}; plan.blocks.forEach(function (b) { if (b.kind === "lesson") perSkill[b.skill] = (perSkill[b.skill] || 0) + 1; });
ok(Object.keys(perSkill).every(function (k) { return perSkill[k] === 1; }), "never two new lessons in one skill");
ok(plan.blocks.filter(function (b) { return b.at; }).every(function (b) { return b.at.f >= P.plMins(S.wake) && b.at.t <= P.plMins(S.sleep); }), "every block sits inside the day");
ok(plan.blocks.filter(function (b) { return b.min < S.minBlock; }).length === 0, "no block under the minimum");

/* the hockey day is lighter and nothing lands during hockey */
var hp = P.plPlan(S, 1, demand, {}, "2026-10-05");
ok(hp.used <= 40, "hockey day plan within 40: " + hp.used);
ok(hp.blocks.filter(function (b) { return b.at; }).every(function (b) { return b.at.t <= P.plMins("18:45") || b.at.f >= P.plMins("21:15"); }), "nothing during hockey");

/* as the day goes, the plan shrinks */
var later = P.plPlan(S, 0, demand, { sv: 40, poker: 15 }, "2026-10-04");
ok(later.used <= Math.max(0, 60 - 55), "55 minutes done leaves at most 5: " + later.used);

/* rotation: a skill that had its new lesson today does not get another */
var S2 = P.plDefault(); S2.lastNew = { sv: "2026-10-04", poker: "2026-10-01", chess: "2026-10-03" };
var p2 = P.plPlan(S2, 0, demand, {}, "2026-10-04");
ok(!p2.blocks.some(function (b) { return b.kind === "lesson" && b.skill === "sv"; }), "Swedish already had its lesson today");
var firstLesson = p2.blocks.filter(function (b) { return b.kind === "lesson"; })[0];
ok(firstLesson && (firstLesson.skill === "poker" || firstLesson.skill === "chess"), "the skill that waited longest at equal priority goes first");

/* priority 0 switches a skill off */
var S3 = P.plDefault(); S3.priority.poker = 0;
var p3 = P.plPlan(S3, 0, demand, {}, "2026-10-04");
ok(!p3.blocks.some(function (b) { return b.skill === "poker"; }), "a skill at priority 0 is left out");

/* note and forecast */
P.plNote(S2, "2026-10-04", p2.blocks);
ok(S2.lastNew[firstLesson.skill] === "2026-10-04", "the rotation remembers today's lesson");
var DAY = 864e5, now = Date.UTC(2026, 9, 4, 12);
var keyOf = function (t) { return new Date(t).toISOString().slice(0, 10); };
var fc = P.plForecast([{ skill: "sv", due: now - DAY }, { skill: "sv", due: now + DAY }, { skill: "he", due: now + 2 * DAY }, { skill: "chess", due: now + 2 * DAY + 3600e3 }], now, 3, keyOf);
eq(fc[0].total, 1, "overdue counts today"); eq(fc[1].by.sv, 1, "tomorrow one Swedish"); eq(fc[2].total, 2, "day after: two");

eq(P.plFmt(570), "9:30am", "time format"); eq(P.plFmt(780), "1pm", "whole hours"); eq(P.plFmt(0), "12am", "midnight");

console.log("planner: " + (n - fails) + "/" + n + " passed");
if (fails) process.exit(1);
