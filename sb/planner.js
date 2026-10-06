/* ============================================================
   PLANNER: the learning calendar
   Takes your week (classes, hockey, anything fixed), a daily
   study cap, and what each skill needs today (reviews due, the
   next lesson, a practice session), and lays out a day that fits
   the free windows without overloading you.
   The order inside a day follows the evidence on learning:
     1. reviews first: retrieval on the due day is what makes a
        skill permanent, and it is cheapest while you are fresh
     2. new material capped: at most a couple of new lessons a
        day across every skill, never two in one skill, because
        new items are what overload the schedule a week later
     3. interleaving: the skills alternate rather than stack
     4. an applied session (a game, a conversation) to turn
        knowledge into use, once the reviews are done
     5. nothing after the sleep cutoff: consolidation needs sleep
   Pure functions: the Calendar screen calls them, the tests call
   them with hand-made weeks.
   ============================================================ */

var PL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var PL_DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var PL_KINDS = { class: "Class", hockey: "Hockey", work: "Work", other: "Busy" };

function plDefault() {
  return {
    cap: 60, hockeyCap: 40, heavyCap: 45,   /* minutes a day: normal, on a hockey day, on a day with 5+ busy hours */
    minBlock: 8, buffer: 15,                 /* smallest study block; minutes lost around every commitment */
    wake: "07:00", sleep: "23:00",
    newPerDay: 2, applyMin: 15,
    week: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    priority: { poker: 2, chess: 2, sv: 3, he: 3 },
    lastNew: {}, lastApply: {}
  };
}

function plMins(hhmm) { var p = String(hhmm || "0:0").split(":"); return (+p[0]) * 60 + (+p[1] || 0); }
function plFmt(m) {
  m = ((m % 1440) + 1440) % 1440;
  var h = Math.floor(m / 60), mm = m % 60, ap = h < 12 ? "am" : "pm", h12 = h % 12 || 12;
  return h12 + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + ap;
}
function plFmt24(m) { var h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; }

/* the fixed blocks of a weekday, sorted, as minutes */
function plBusy(S, wd) {
  return ((S.week && S.week[wd]) || []).map(function (b) { return { n: b.n || PL_KINDS[b.k] || "Busy", k: b.k || "other", f: plMins(b.f), t: plMins(b.t) }; })
    .filter(function (b) { return b.t > b.f; }).sort(function (a, b) { return a.f - b.f; });
}
function plHas(S, wd, kind) { return plBusy(S, wd).some(function (b) { return b.k === kind; }); }
function plBusyMinutes(S, wd) { return plBusy(S, wd).reduce(function (a, b) { return a + (b.t - b.f); }, 0); }

/* free windows between waking and the sleep cutoff, with a buffer around every commitment */
function plFree(S, wd) {
  var wake = plMins(S.wake), sleep = plMins(S.sleep), buf = S.buffer || 0;
  var out = [], cur = wake;
  plBusy(S, wd).forEach(function (b) {
    var f = Math.max(wake, b.f - buf), t = Math.min(sleep, b.t + buf);
    if (f > cur) out.push({ f: cur, t: f });
    if (t > cur) cur = t;
  });
  if (sleep > cur) out.push({ f: cur, t: sleep });
  return out.filter(function (w) { return w.t - w.f >= (S.minBlock || 8); });
}
function plFreeMinutes(S, wd) { return plFree(S, wd).reduce(function (a, w) { return a + (w.t - w.f); }, 0); }

/* how much study the day can take: the cap, lowered on a hockey day or a heavy day, never more than the free time */
function plBudget(S, wd) {
  var cap = S.cap || 60, why = "";
  if (plHas(S, wd, "hockey")) { cap = Math.min(cap, S.hockeyCap || cap); why = "hockey day"; }
  else if (plBusyMinutes(S, wd) >= 300) { cap = Math.min(cap, S.heavyCap || cap); why = "heavy day"; }
  var free = plFreeMinutes(S, wd);
  if (free < cap) { cap = free; why = why ? why + ", little free time" : "little free time"; }
  return { minutes: Math.max(0, cap), why: why, free: free };
}

/* Lay out one day.
   demand: { skillId: { name, due, dueMin, overdue (days), lesson: {id, title, min, href} | null,
                        drill: {href, label} | null, apply: {href, label, min} | null, level } }
   done: { skillId: minutes already studied today }  (the plan shrinks as the day goes)
   dayKey: "2026-10-06" (for the rotation memory in S.lastNew / S.lastApply) */
function plPlan(S, wd, demand, done, dayKey) {
  demand = demand || {}; done = done || {};
  var B = plBudget(S, wd), budget = B.minutes, reserve = Math.round(budget * 0.1);
  var ids = Object.keys(demand).filter(function (id) { return (S.priority[id] || 0) > 0; });
  var pr = function (id) { return S.priority[id] || 0; };
  var used = 0, blocks = [];
  function spent(id) { return done[id] || 0; }
  var doneTotal = ids.reduce(function (a, id) { return a + spent(id); }, 0);
  var left = Math.max(0, budget - doneTotal);

  /* 1. reviews, most pressing first: priority, then how overdue, then how many */
  var rev = ids.filter(function (id) { return demand[id].due > 0; }).sort(function (a, b) {
    var A = demand[a], Bb = demand[b];
    return (pr(b) * 10 + Math.min(5, Bb.overdue || 0) + Math.min(3, Bb.due / 10)) - (pr(a) * 10 + Math.min(5, A.overdue || 0) + Math.min(3, A.due / 10));
  });
  rev.forEach(function (id) {
    var D = demand[id], m = Math.max(S.minBlock || 8, Math.min(25, Math.round(D.dueMin || D.due * 0.5)));
    if (used + m > left) {
      if (!blocks.length && left >= (S.minBlock || 8)) m = left; else { blocks.push({ skill: id, kind: "review", min: m, label: D.due + " reviews due", href: D.drill ? D.drill.href : "", deferred: true, why: "Over today's budget: tomorrow it costs about the same, so it waits rather than crowding today." }); return; }
    }
    used += m;
    blocks.push({ skill: id, kind: "review", min: m, label: D.due + (D.due === 1 ? " review" : " reviews") + " due", href: D.drill ? D.drill.href : "",
      why: D.overdue >= 1 ? "Overdue by " + Math.round(D.overdue) + (D.overdue >= 2 ? " days" : " day") + ": every extra day lowers the chance you still have it." : "Due today: a review on its due day is what moves a skill up." });
  });

  /* 2. new lessons: a couple a day at most, one per skill, rotating by who waited longest */
  var newCands = ids.filter(function (id) { return demand[id].lesson && !demand[id].pause; }).sort(function (a, b) {
    var la = (S.lastNew && S.lastNew[a]) || "", lb = (S.lastNew && S.lastNew[b]) || "";
    if (pr(a) !== pr(b)) return pr(b) - pr(a);
    return la < lb ? -1 : la > lb ? 1 : 0;
  });
  var newN = 0, maxNew = S.newPerDay == null ? 2 : S.newPerDay;
  newCands.forEach(function (id) {
    if (newN >= maxNew) return;
    var L = demand[id].lesson, m = Math.max(S.minBlock || 8, (L.min || 5) + 5);
    if (S.lastNew && S.lastNew[id] === dayKey) return;      /* already learned something new in this skill today */
    if (used + m > left - reserve) return;
    used += m; newN++;
    blocks.push({ skill: id, kind: "lesson", min: m, label: L.title, href: L.href, id: L.id,
      why: demand[id].due > 0 ? "After the reviews: new material lands better once the old is refreshed." : "Nothing due here, so the time goes to the next lesson." });
  });

  /* 3. an applied session: the skill whose turn it is, if there is room */
  var appCands = ids.filter(function (id) { return demand[id].apply; }).sort(function (a, b) {
    var la = (S.lastApply && S.lastApply[a]) || "", lb = (S.lastApply && S.lastApply[b]) || "";
    if (la !== lb) return la < lb ? -1 : 1;
    return pr(b) - pr(a);
  });
  for (var i = 0; i < appCands.length; i++) {
    var id = appCands[i], A = demand[id].apply, m2 = Math.max(S.minBlock || 8, A.min || S.applyMin || 15);
    if (used + m2 > left) continue;
    used += m2;
    blocks.push({ skill: id, kind: "apply", min: m2, label: A.label, href: A.href, why: "Use it: knowledge becomes skill only when it is applied under a little pressure." });
    break;
  }

  /* 4. room left and nothing new to take: free practice on the weakest skill */
  if (left - used >= (S.minBlock || 8) && !blocks.some(function (b) { return b.kind === "lesson"; })) {
    var weak = ids.filter(function (id) { return demand[id].drill; }).sort(function (a, b) { return (demand[a].level || 0) - (demand[b].level || 0); })[0];
    if (weak) { var m3 = Math.min(15, left - used); used += m3; blocks.push({ skill: weak, kind: "practice", min: m3, label: "Free practice: " + demand[weak].name, href: demand[weak].drill.href, why: "Extra practice keeps the weakest skill warm. It pays less than a due review, but it is never wasted." }); }
  }

  /* interleave: alternate skills where the kinds allow, keeping reviews ahead of lessons ahead of apply */
  var order = { review: 0, lesson: 1, apply: 2, practice: 3 };
  blocks.sort(function (a, b) { return (a.deferred ? 1 : 0) - (b.deferred ? 1 : 0) || order[a.kind] - order[b.kind]; });

  /* put the blocks into the free windows, in order, never splitting one */
  var wins = plFree(S, wd).map(function (w) { return { f: w.f, t: w.t }; }), wi = 0, cur = wins.length ? wins[0].f : 0;
  blocks.forEach(function (b) {
    if (b.deferred) return;
    while (wi < wins.length && cur + b.min > wins[wi].t) { wi++; if (wi < wins.length) cur = wins[wi].f; }
    if (wi >= wins.length) { b.at = null; return; }
    b.at = { f: cur, t: cur + b.min }; cur += b.min;
  });
  return { budget: budget, left: left, used: used, free: B.free, why: B.why, blocks: blocks, doneTotal: doneTotal, newN: newN };
}

/* which skills studied today, to remember the rotation */
function plNote(S, dayKey, blocks) {
  S.lastNew = S.lastNew || {}; S.lastApply = S.lastApply || {};
  blocks.forEach(function (b) {
    if (b.kind === "lesson") S.lastNew[b.skill] = dayKey;
    if (b.kind === "apply") S.lastApply[b.skill] = dayKey;
  });
}

/* reviews falling due per day for the next n days: items = [{ skill, due }] (ms) */
function plForecast(items, now, days, dayKeyFn) {
  var out = [], DAY = 864e5;
  for (var d = 0; d < days; d++) {
    var t0 = now + d * DAY, key = dayKeyFn(t0), row = { key: key, total: 0, by: {} };
    items.forEach(function (it) {
      var dueDay = dayKeyFn(Math.max(it.due, now));           /* overdue counts today */
      if (dueDay === key) { row.total++; row.by[it.skill] = (row.by[it.skill] || 0) + 1; }
    });
    out.push(row);
  }
  return out;
}

/* a readable summary of a week template, for the settings page */
function plWeekLines(S) {
  return PL_DAYS.map(function (name, wd) {
    var busy = plBusy(S, wd);
    return { wd: wd, name: name, busy: busy, free: plFree(S, wd), budget: plBudget(S, wd) };
  });
}

if (typeof module !== "undefined") module.exports = {
  PL_DAYS: PL_DAYS, PL_DAYS_SHORT: PL_DAYS_SHORT, PL_KINDS: PL_KINDS, plDefault: plDefault, plMins: plMins, plFmt: plFmt, plFmt24: plFmt24,
  plBusy: plBusy, plHas: plHas, plFree: plFree, plFreeMinutes: plFreeMinutes, plBudget: plBudget, plPlan: plPlan, plNote: plNote, plForecast: plForecast, plWeekLines: plWeekLines
};
