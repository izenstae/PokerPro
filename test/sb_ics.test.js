/* Imported calendars: parsing .ics files, recurrence, overrides, and the planner treating them as busy time. */
process.env.TZ = "America/New_York";
var I = require("../sb/ics.js"), P = require("../sb/planner.js");
var n = 0, fails = 0;
function ok(cond, msg) { n++; if (!cond) { fails++; console.log("  FAIL " + msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (got " + JSON.stringify(a) + ", want " + JSON.stringify(b) + ")"); }
function cal(name, events) { return "BEGIN:VCALENDAR\r\nVERSION:2.0\r\n" + (name ? "X-WR-CALNAME:" + name + "\r\n" : "") + events.map(function (e) { return "BEGIN:VEVENT\r\n" + e.join("\r\n") + "\r\nEND:VEVENT\r\n"; }).join("") + "END:VCALENDAR\r\n"; }
function busy(cals, key) { return I.icsBusy(cals, key).map(function (b) { return b.n + " " + P.plFmt24(b.f) + "-" + P.plFmt24(b.t); }); }

/* one file, two calendars (Apple and Google both write one VCALENDAR per calendar) */
var school = cal("School", [
  ["UID:calc", "SUMMARY:MATH 340", "DTSTART;TZID=America/New_York:20260907T090000", "DTEND;TZID=America/New_York:20260907T101500", "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20261211T235959Z", "EXDATE;TZID=America/New_York:20261012T090000"],
  ["UID:calc", "SUMMARY:MATH 340 (moved)", "RECURRENCE-ID;TZID=America/New_York:20261014T090000", "DTSTART;TZID=America/New_York:20261014T130000", "DTEND;TZID=America/New_York:20261014T141500"],
  ["UID:old", "SUMMARY:Orientation", "DTSTART:20250101T150000Z", "DTEND:20250101T160000Z"],
  ["UID:holiday", "SUMMARY:Fall break", "DTSTART;VALUE=DATE:20261019", "DTEND;VALUE=DATE:20261020"]
]);
var life = cal("Personal", [
  ["UID:hk", "SUMMARY:Hockey", "DTSTART:20261008T230000Z", "DURATION:PT2H", "RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4"],
  ["UID:dr", "SUMMARY:Dentist", "DTSTART:20261009T140000", "DTEND:20261009T150000", "TRANSP:TRANSPARENT"],
  ["UID:long", "SUMMARY:Overnight shift", "DTSTART:20261009T220000", "DTEND:20261010T060000"],
  ["UID:club", "SUMMARY:Club meeting", "DTSTART:20261006T180000", "DTEND:20261006T", "DURATION:PT1H", "RRULE:FREQ=MONTHLY;BYDAY=1TU"],
  ["UID:rent", "SUMMARY:Lease review", "DTSTART:20261031T100000", "DTEND:20261031T110000", "RRULE:FREQ=MONTHLY;BYMONTHDAY=-1"]
]);
var parsed = I.icsParse(school + life, "export", "2026-10-07");
eq(parsed.length, 2, "two calendars in one file");
eq(parsed[0].name + "," + parsed[1].name, "School,Personal", "named by X-WR-CALNAME");
eq(parsed[0].ev.filter(function (e) { return e.uid === "old"; }).length, 0, "past one-off events dropped");
eq(parsed[0].ev.filter(function (e) { return e.ad; }).length, 1, "all-day events kept (they can be deadlines), marked");
eq(parsed[1].ev.filter(function (e) { return e.fr; }).length, 1, "free (transparent) events kept, marked");
eq(I.icsParse(cal("", [["SUMMARY:x", "DTSTART:20261101T100000", "DTEND:20261101T110000"]]), "work", "2026-10-07")[0].name, "work", "unnamed calendar takes the file name");
/* folded lines and escaped text */
eq(I.icsParse("BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Lab\\, room\r\n  204\r\nDTSTART:20261101T100000\r\nDTEND:20261101T110000\r\nEND:VEVENT\r\nEND:VCALENDAR", "x")[0].ev[0].n, "Lab, room 204", "unfolds lines and unescapes commas");

var cals = I.icsMerge([], parsed, 1);
eq(cals[0].k, "class", "School guessed as class");
eq(cals[1].k, "other", "Personal guessed as other");
eq(busy(cals, "2026-10-07").join(), "MATH 340 09:00-10:15", "Wednesday class");
eq(busy(cals, "2026-10-06").join(), "Club meeting 18:00-19:00", "first Tuesday of the month");
eq(busy(cals, "2026-11-03").join(), "Club meeting 18:00-19:00", "first Tuesday next month");
eq(busy(cals, "2026-10-13").join(), "", "second Tuesday is not the first");
eq(busy(cals, "2026-10-12").join(), "", "EXDATE removes Monday's class");
eq(busy(cals, "2026-10-14").join(), "MATH 340 (moved) 13:00-14:15", "a moved occurrence replaces the original");
eq(busy(cals, "2026-12-11").join(), "MATH 340 09:00-10:15", "last class before UNTIL");
eq(busy(cals, "2026-12-14").join(), "", "nothing after UNTIL");
eq(busy(cals, "2026-10-08").join(), "Hockey 19:00-21:00", "UTC time shown in local time");
eq(busy(cals, "2026-10-15").join(), "", "every other week: not the week after");
eq(busy(cals, "2026-10-22").join(), "Hockey 19:00-21:00", "every other week: two weeks later");
eq(busy(cals, "2026-11-19").join(), "Hockey 19:00-21:00", "fourth occurrence of COUNT=4");
eq(busy(cals, "2026-12-03").join(), "", "no fifth occurrence");
eq(busy(cals, "2026-10-09").join(), "MATH 340 09:00-10:15,Overnight shift 22:00-24:00", "overnight event, first day");
eq(busy(cals, "2026-10-10").join(), "Overnight shift 00:00-06:00", "overnight event, spills into the next day");
eq(busy(cals, "2026-11-30").join(), "MATH 340 09:00-10:15,Lease review 10:00-11:00", "last day of a 30-day month");
eq(busy(cals, "2026-10-19").join(), "MATH 340 09:00-10:15", "all-day holiday is not busy");
eq(I.icsBusy(cals, "2026-10-08")[0].k, "hockey", "an event named hockey is hockey in any calendar");

eq(I.icsBusy(cals, "2026-10-09").map(function (b) { return b.k; }).join(), "class,work", "in a Busy calendar each event is sorted by name");
/* turning a calendar off, and re-importing keeps settings */
cals[0].k = "work"; cals[1].on = false;
eq(busy(cals, "2026-10-08").join(), "", "a calendar turned off is not busy");
var again = I.icsMerge(cals, I.icsParse(life, "x", "2026-10-07"), 2);
eq(again.length, 2, "re-importing a calendar replaces it");
eq(again[1].on, false, "and keeps it off");
eq(again[0].k, "work", "other calendars untouched");

/* the planner: imported events are busy on their date and change the day's budget */
var S = P.plDefault(); S.cals = I.icsMerge([], parsed, 3);
eq(P.plBudget(S, 4).minutes, 60, "Thursday template alone: normal cap");
eq(P.plBudget(S, 4, "2026-10-08").minutes, 40, "imported hockey makes Thursday a hockey day");
eq(P.plBudget(S, 4, "2026-10-15").minutes, 60, "the off week is not");
var w = P.plFree(S, 3, "2026-10-07");
eq(P.plFmt24(w[0].t) + "," + P.plFmt24(w[1].f), "08:45,10:30", "free windows go around the imported class");
S.week[3] = [{ n: "MATH 340", k: "class", f: "09:00", t: "10:15" }];
eq(P.plBusyMinutes(S, 3, "2026-10-07"), 75, "the same class in the week and imported counts once");
var demand = { sv: { name: "Swedish", due: 30, dueMin: 18, overdue: 0, lesson: null, drill: { href: "#s" }, apply: null, level: 1 } };
var plan = P.plPlan(S, 4, demand, {}, "2026-10-08");
ok(plan.blocks.filter(function (b) { return b.at; }).every(function (b) { return b.at.t <= P.plMins("18:45") || b.at.f >= P.plMins("21:15"); }), "the plan keeps clear of imported hockey");

/* deadlines: picked out by name and shape, or by a Deadlines calendar */
var mixed = I.icsMerge([], I.icsParse(cal("Everything", [
  ["UID:cl", "SUMMARY:ECON 101", "DTSTART:20261005T100000", "DTEND:20261005T113000", "RRULE:FREQ=WEEKLY;BYDAY=MO,WE"],
  ["UID:hw", "SUMMARY:Problem Set 4", "DTSTART:20261012T235900", "DTEND:20261012T235900"],
  ["UID:ex", "SUMMARY:ECON 101 Midterm", "DTSTART:20261016T090000", "DTEND:20261016T110000"],
  ["UID:pp", "SUMMARY:History paper", "DTSTART;VALUE=DATE:20261020", "DTEND;VALUE=DATE:20261021"],
  ["UID:lab", "SUMMARY:Lab 3 section", "DTSTART:20261008T130000", "DTEND:20261008T160000"],
  ["UID:hg", "SUMMARY:Hockey final", "DTSTART:20261010T180000", "DTEND:20261010T200000"]
]) + cal("Canvas", [["UID:cv", "SUMMARY:Reading response", "DTSTART:20261009T170000", "DTEND:20261009T180000"]]), "x", "2026-10-07"), 1);
mixed[1].k = "due";
var dl = I.icsDeadlines(mixed, "2026-10-07", 22);
eq(dl.map(function (d) { return d.n + ":" + d.type; }).join(), "Reading response:homework,Problem Set 4:homework,ECON 101 Midterm:exam,History paper:paper", "deadlines found, soonest first");
eq(busy(mixed, "2026-10-09").join(), "", "a Deadlines calendar is not busy time");
eq(busy(mixed, "2026-10-16").join(), "ECON 101 Midterm 09:00-11:00", "an exam is busy time and a deadline");
eq(busy(mixed, "2026-10-08").join(), "Lab 3 section 13:00-16:00", "a three-hour lab section is a class, not a deadline");

/* spreading the work and the dynamic budget */
var D = P.plDefault(); D.cals = mixed; D.cap = 120;
var all = P.plDueAll(D, "2026-10-07");
var ps = all.filter(function (d) { return d.n === "Problem Set 4"; })[0];
eq(ps.days.map(function (x) { return x.key; }).join(), "2026-10-08,2026-10-09,2026-10-10,2026-10-11,2026-10-12", "due 11:59pm Monday: from four days before through Monday evening");
eq(ps.days.reduce(function (a, x) { return a + x.min; }, 0), 90, "the whole estimate is planned");
var mt = all.filter(function (d) { return d.type === "exam"; })[0];
eq(mt.days[0].key, "2026-10-09", "exam study starts a week ahead");
eq(mt.days[mt.days.length - 1].key, "2026-10-15", "...and ends the day before a morning exam");
var pap = all.filter(function (d) { return d.type === "paper"; })[0];
eq(pap.days[pap.days.length - 1].key, "2026-10-20", "an all-day deadline can be worked on that day");
var sun = mt.days.filter(function (x) { return x.key === "2026-10-11"; })[0], wed = mt.days.filter(function (x) { return x.key === "2026-10-14"; })[0];
ok(sun.free > wed.free && sun.min > wed.min, "a day with more free time takes more of it: Sun " + sun.min + " > Wed " + wed.min);
var wk = P.plDueWork(D, "2026-10-13", "2026-10-07");
ok(wk.some(function (d) { return d.type === "exam"; }) && wk.some(function (d) { return d.type === "paper"; }), "Tuesday the 13th carries the exam and the paper");
var b0 = P.plBudget(D, 3, "2026-10-07", "2026-10-07"), bA = P.plBudget(D, 0, "2026-10-11", "2026-10-07");
eq(b0.due, P.plDueWork(D, "2026-10-07").reduce(function (a, d) { return a + d.min; }, 0), "today carries part of Friday's reading response");
var E = P.plDefault(); E.cap = 300; E.week[2] = [{ n: "Work", k: "work", f: "09:00", t: "12:00" }, { n: "Lab", k: "class", f: "13:00", t: "14:00" }];
eq(P.plBudget(E, 2).minutes, Math.round(P.plFreeMinutes(E, 2) * 0.15 / 5) * 5, "budget is 15% of the free time");
ok(P.plBudget(E, 2).minutes < P.plBudget(E, 0).minutes, "a busier day gets less than an open one");
E.cap = 60; eq(P.plBudget(E, 0).minutes, 60, "an open day is held to the cap");
ok(bA.due > 0 && bA.minutes === Math.min(120, Math.round((bA.free - bA.due) * 0.15 / 5) * 5), "with assignments the share comes from what is left: " + bA.minutes + " of " + bA.free + " free, " + bA.due + " due");
D.cap = 300; var bB = P.plBudget(D, 0, "2026-10-11", "2026-10-07");
eq(bB.minutes, Math.round((bB.free - bB.due) * 0.15 / 5) * 5, "under a high cap the share decides");
ok(/assignments: 15% of/.test(bB.why), "the reason names the assignments: " + bB.why); D.cap = 120;
D.dueDone = {}; D.dueDone[ps.id] = 1;
ok(!P.plDueAll(D, "2026-10-07").some(function (d) { return d.id === ps.id; }), "a finished assignment drops out");
D.dueEst = {}; D.dueEst[mt.id] = 600;
eq(P.plDueAll(D, "2026-10-07").filter(function (d) { return d.type === "exam"; })[0].days.reduce(function (a, x) { return a + x.min; }, 0), 600, "an edited estimate is used");
var Z = P.plDefault(); Z.share = 0; eq(P.plBudget(Z, 0).minutes, 60, "share 0: every day gets the cap");

console.log((fails ? "FAIL " : "ok   ") + "sb_ics: " + (n - fails) + "/" + n + " checks");
if (fails) process.exit(1);
