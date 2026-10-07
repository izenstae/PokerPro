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
eq(parsed[0].ev.length, 2, "past one-off and all-day events dropped");
eq(parsed[1].ev.filter(function (e) { return e.uid === "dr"; }).length, 0, "free (transparent) events dropped");
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

console.log((fails ? "FAIL " : "ok   ") + "sb_ics: " + (n - fails) + "/" + n + " checks");
if (fails) process.exit(1);
