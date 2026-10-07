/* The planner: free windows around classes and hockey, the daily budget, and a plan that never overloads a day. */
process.env.TZ = "America/Chicago";   /* before any Date use: the forecast is checked across the Nov 1 2026 fall-back */
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

/* a busy block that crosses midnight is kept, clipped to the day on both sides */
var M = P.plDefault(); M.week[5] = [{ n: "Late hockey", k: "hockey", f: "22:00", t: "02:00" }];
var mb = P.plBusy(M, 5);
eq(mb.length, 2, "a 22:00-02:00 block is two parts on the day");
eq(P.plFmt24(mb[0].f) + "-" + P.plFmt24(mb[0].t), "00:00-02:00", "the early-morning part");
eq(P.plFmt24(mb[1].f) + "-" + P.plFmt24(mb[1].t), "22:00-24:00", "the evening part");
ok(P.plHas(M, 5, "hockey"), "the crossing block still counts as a hockey day");
var mw = P.plFree(M, 5);
eq(mw.length, 1, "one window before the late block");
eq(P.plFmt24(mw[0].f) + "-" + P.plFmt24(mw[0].t), "07:00-21:45", "the window ends a buffer before 22:00");
eq(P.plBudget(M, 5).minutes, 40, "a midnight-crossing hockey block lowers the cap");
var Z = P.plDefault(); Z.week[5] = [{ n: "Zero", k: "class", f: "09:00", t: "09:00" }];
eq(P.plBusy(Z, 5).length, 0, "a zero-length block is dropped, not treated as crossing midnight");

/* a sleep cutoff after midnight extends the day instead of emptying it */
var N = P.plDefault(); N.sleep = "00:30";
eq(P.plSleepMins(N), 24 * 60 + 30, "00:30 is half an hour past midnight");
var nw = P.plFree(N, 0);
eq(nw.length, 1, "a night owl's free day is one window");
eq(nw[0].t, 24 * 60 + 30, "the window runs to the cutoff past midnight");
eq(P.plFreeMinutes(N, 0), 17 * 60 + 30, "17.5 hours free");
eq(P.plBudget(N, 0).minutes, 60, "a late cutoff keeps the normal budget, not 0");
eq(P.plFmt(nw[0].t), "12:30am", "the late cutoff formats as a morning time");
N.week[1] = [{ n: "Late hockey", k: "hockey", f: "22:00", t: "01:00" }];
var nw1 = P.plFree(N, 1);
ok(nw1.length === 1 && nw1[0].t === P.plMins("21:45"), "a crossing block swallows the hour after midnight: no window after it, " + JSON.stringify(nw1));
ok(P.plPlan(N, 0, demand, {}, "2026-10-04").blocks.filter(function (b) { return b.at; }).length > 0, "a plan is laid out on a late-cutoff day");

/* the forecast steps by calendar day: 14 distinct keys across the DST fall-back, even starting just after midnight */
var localKey = function (t) { var d = new Date(t); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
var fbNow = new Date(2026, 9, 25, 0, 30).getTime();
var fb = P.plForecast([{ skill: "sv", due: new Date(2026, 10, 1, 9).getTime() }, { skill: "he", due: new Date(2026, 10, 2, 9).getTime() }, { skill: "sv", due: new Date(2026, 10, 7, 22).getTime() }], fbNow, 14, localKey);
var fbKeys = fb.map(function (r) { return r.key; }), fbSet = {}; fbKeys.forEach(function (k) { fbSet[k] = 1; });
eq(Object.keys(fbSet).length, 14, "14 distinct day keys across the fall-back: " + fbKeys.join(" "));
eq(fbKeys[0], "2026-10-25", "the first key is today"); eq(fbKeys[7], "2026-11-01", "the eighth is the fall-back day"); eq(fbKeys[13], "2026-11-07", "the last is two weeks on");
eq(fb[7].total, 1, "the Nov 1 review lands on Nov 1"); eq(fb[8].total, 1, "the Nov 2 review lands on Nov 2"); eq(fb[13].total, 1, "the late Nov 7 review lands on Nov 7");
ok(fbKeys.every(function (k, i) { return i === 0 || k > fbKeys[i - 1]; }), "keys strictly increase");

/* Spanish is a track: in the default priorities, and planned when a saved map predates it */
ok(P.plDefault().priority.es > 0, "es has a default priority");
ok(P.PL_TRACKS.map(function (t) { return t[0]; }).indexOf("es") >= 0, "es is in the track list");
var ES = P.plDefault(); delete ES.priority.es;
var esDemand = { es: { name: "Spanish", due: 6, dueMin: 5, overdue: 0, lesson: { id: "e", title: "Ser y estar", min: 6, href: "#e" }, drill: { href: "#ed" }, apply: null, level: 0 } };
var esPlan = P.plPlan(ES, 0, esDemand, {}, "2026-10-04");
ok(esPlan.blocks.some(function (b) { return b.skill === "es" && b.kind === "review"; }), "a track missing from the priority map is planned as normal, not paused");
eq(P.plPriority(ES, "es"), 2, "a missing priority reads as 2");
eq(P.plPriority(ES, "sv"), 3, "a set priority reads as set");
ES.priority.es = 0; eq(P.plPriority(ES, "es"), 0, "an explicit 0 is paused");
ok(!P.plPlan(ES, 0, esDemand, {}, "2026-10-04").blocks.length, "and plans nothing");
var merged = Object.assign(P.plDefault().priority, { poker: 1 });
ok(merged.es === 3 && merged.poker === 1 && merged.sv === 3, "Object.assign(plDefault().priority, saved) still layers saved values over the defaults");

/* reviews are ordered by how overdue they are, then priority, then count (the README's promise) */
var OD = P.plDefault();
var odDemand = {
  poker: { name: "Poker", due: 3, dueMin: 3, overdue: 3, lesson: null, drill: { href: "#pd" }, apply: null, level: 2 },
  sv:    { name: "Swedish", due: 40, dueMin: 20, overdue: 0, lesson: null, drill: { href: "#sd" }, apply: null, level: 1 },
  he:    { name: "Hebrew", due: 8, dueMin: 5, overdue: 0, lesson: null, drill: { href: "#hd" }, apply: null, level: 0 },
  chess: { name: "Chess", due: 2, dueMin: 2, overdue: 3, lesson: null, drill: { href: "#cd" }, apply: null, level: 1 }
};
var odOrder = P.plPlan(OD, 0, odDemand, {}, "2026-10-04").blocks.filter(function (b) { return b.kind === "review"; }).map(function (b) { return b.skill; });
eq(odOrder[0], "poker", "three days overdue at priority 2 beats forty due today at priority 3: " + odOrder.join(","));
eq(odOrder[1], "chess", "equal overdue and priority: the one with more due first");
eq(odOrder[2], "sv", "then the due-today ones by priority (sv 3 before he 3 by count)");
eq(odOrder[3], "he", "and the smaller count last");

console.log("planner: " + (n - fails) + "/" + n + " passed");
if (fails) process.exit(1);
