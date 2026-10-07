/* ============================================================
   ICS: imported calendars
   Reads iCalendar (.ics) files, the format Apple Calendar,
   Google Calendar and Outlook export, and turns their events
   into busy time the planner works around, date by date.
   One file may hold one calendar or several (each VCALENDAR is
   its own calendar, named by X-WR-CALNAME); several files can be
   imported at once.
   What it understands: timed events (UTC, a TZID, or floating;
   all are shown in this device's local time), DTEND or DURATION,
   RRULE (DAILY, WEEKLY, MONTHLY, YEARLY with INTERVAL, COUNT,
   UNTIL, BYDAY, BYMONTHDAY, BYMONTH), EXDATE, and moved or
   cancelled single occurrences (RECURRENCE-ID).
   All-day events, free (TRANSPARENT) and cancelled events are
   not busy time, so they are left out.
   Pure functions: the Calendar settings call them, the tests
   call them with hand-made files.
   ============================================================ */

var ICS_KINDS = ["class", "hockey", "work", "other"];

/* lines: unfold continuation lines, then split NAME;PARAMS:VALUE */
function icsLines(text) {
  return String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n[ \t]/g, "").split("\n").filter(Boolean).map(function (ln) {
    var c = -1, q = false;
    for (var i = 0; i < ln.length; i++) { var ch = ln[i]; if (ch === '"') q = !q; else if (ch === ":" && !q) { c = i; break; } }
    if (c < 0) return null;
    var head = ln.slice(0, c).split(";"), params = {};
    head.slice(1).forEach(function (p) { var e = p.indexOf("="); if (e > 0) params[p.slice(0, e).toUpperCase()] = p.slice(e + 1).replace(/^"|"$/g, ""); });
    return { name: head[0].toUpperCase(), params: params, value: ln.slice(c + 1) };
  }).filter(Boolean);
}
function icsText(v) { return String(v || "").replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim(); }

function icsPad(n) { return (n < 10 ? "0" : "") + n; }
function icsKey(d) { return d.getFullYear() + "-" + icsPad(d.getMonth() + 1) + "-" + icsPad(d.getDate()); }
function icsDate(key) { var p = key.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function icsAddDays(key, n) { var d = icsDate(key); d.setDate(d.getDate() + n); return icsKey(d); }
function icsDaysBetween(a, b) { return Math.round((icsDate(b) - icsDate(a)) / 864e5); }

/* a DTSTART-like value as local wall time: { key: "2026-10-07", min: 540, allDay } */
function icsWhen(prop) {
  if (!prop) return null;
  var v = prop.value.trim(), m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(v);
  if (!m) return null;
  if (!m[4] || prop.params.VALUE === "DATE") return { key: m[1] + "-" + m[2] + "-" + m[3], min: 0, allDay: true };
  if (m[7]) { var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0))); return { key: icsKey(d), min: d.getHours() * 60 + d.getMinutes(), allDay: false }; }
  return { key: m[1] + "-" + m[2] + "-" + m[3], min: +m[4] * 60 + +m[5], allDay: false };   /* TZID or floating: taken as local time */
}
/* minutes in an ISO duration like PT1H30M or P1D */
function icsDur(v) {
  var m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(String(v || "").trim());
  if (!m) return 0;
  return (+(m[2] || 0)) * 10080 + (+(m[3] || 0)) * 1440 + (+(m[4] || 0)) * 60 + (+(m[5] || 0));
}
function icsRule(v) {
  var r = {};
  String(v || "").split(";").forEach(function (p) { var e = p.indexOf("="); if (e > 0) r[p.slice(0, e).toUpperCase()] = p.slice(e + 1).toUpperCase(); });
  return r.FREQ ? r : null;
}

/* a kind from a name: hockey lowers the day's cap, so an event called hockey counts as hockey in any calendar */
function icsGuessKind(s) {
  s = String(s || "").toLowerCase();
  if (/hockey|skate|practice|game day/.test(s)) return "hockey";
  if (/class|course|school|lecture|lab\b|seminar|tutorial|recitation|math|stat|\b[a-z]{2,4} ?\d{3}\b/.test(s)) return "class";
  if (/work|shift|job|office/.test(s)) return "work";
  return "other";
}

/* Parse a file into calendars: [{ name, ev: [{ n, uid, key, min, dur, r, x, rid }] }]
   today (a "YYYY-MM-DD" key) trims what can no longer matter: events that ended before it. */
function icsParse(text, fallbackName, today) {
  var lines = icsLines(text), cals = [], cal = null, ev = null, depth = [];
  lines.forEach(function (L) {
    if (L.name === "BEGIN") {
      depth.push(L.value.toUpperCase());
      if (L.value.toUpperCase() === "VCALENDAR") { cal = { name: "", ev: [], raw: [] }; cals.push(cal); }
      else if (L.value.toUpperCase() === "VEVENT" && cal) ev = { props: {}, ex: [] };
      return;
    }
    if (L.name === "END") {
      var what = depth.pop();
      if (what === "VEVENT" && ev && cal) { cal.raw.push(ev); ev = null; }
      return;
    }
    var inner = depth[depth.length - 1];
    if (ev && inner === "VEVENT") { if (L.name === "EXDATE") ev.ex.push(L); else if (!ev.props[L.name]) ev.props[L.name] = L; }
    else if (cal && inner === "VCALENDAR" && L.name === "X-WR-CALNAME" && !cal.name) cal.name = icsText(L.value);
  });
  var multi = cals.length > 1;
  return cals.map(function (c, ci) {
    var out = [];
    c.raw.forEach(function (e) {
      var P = e.props;
      if (P.STATUS && /CANCELLED/i.test(P.STATUS.value) && !P["RECURRENCE-ID"]) return;
      var st = icsWhen(P.DTSTART); if (!st) return;
      var rid = P["RECURRENCE-ID"] ? icsWhen(P["RECURRENCE-ID"]) : null;
      var cancelled = !!(P.STATUS && /CANCELLED/i.test(P.STATUS.value));
      var free = !!(P.TRANSP && /TRANSPARENT/i.test(P.TRANSP.value));
      var dur = 0, en = icsWhen(P.DTEND);
      if (en) dur = icsDaysBetween(st.key, en.key) * 1440 + en.min - st.min;
      else if (P.DURATION) dur = icsDur(P.DURATION.value);
      var r = P.RRULE ? icsRule(P.RRULE.value) : null;
      var x = [];
      e.ex.forEach(function (L) { L.value.split(",").forEach(function (v) { var w = icsWhen({ value: v, params: L.params }); if (w) x.push(w.key); }); });
      var item = { n: icsText(P.SUMMARY ? P.SUMMARY.value : "") || "Busy", uid: P.UID ? P.UID.value : "", key: st.key, min: st.min, dur: Math.max(0, dur) };
      if (st.allDay || free) {
        if (!rid) return;                      /* an all-day or free event is not busy time */
        item.skip = true;                      /* ...but an all-day override still removes the occurrence it replaces */
      }
      if (cancelled) item.skip = true;
      if (r) item.r = r;
      if (x.length) item.x = x;
      if (rid) item.rid = rid.key;
      if (today && !item.rid) {
        if (!r && icsAddDays(item.key, Math.ceil((item.min + item.dur) / 1440)) < today) return;
        if (r && r.UNTIL && r.UNTIL.slice(0, 4) + "-" + r.UNTIL.slice(4, 6) + "-" + r.UNTIL.slice(6, 8) < icsAddDays(today, -1)) return;
      }
      if (today && item.rid && item.rid < icsAddDays(today, -2) && item.key < icsAddDays(today, -2)) return;
      out.push(item);
    });
    return { name: c.name || (multi ? (fallbackName || "Calendar") + " " + (ci + 1) : fallbackName || "Calendar"), ev: out };
  });
}

/* ---- recurrence ---- */
var ICS_WD = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
function icsByDay(r) {
  if (!r.BYDAY) return null;
  return r.BYDAY.split(",").map(function (s) { var m = /^([+-]?\d+)?([A-Z]{2})$/.exec(s); return m ? { n: m[1] ? +m[1] : 0, wd: ICS_WD[m[2]] } : null; }).filter(function (b) { return b && b.wd != null; });
}
/* does a day fall on the nth (or -nth) weekday of its month */
function icsNth(d, n) {
  if (!n) return true;
  if (n > 0) return Math.floor((d.getDate() - 1) / 7) + 1 === n;
  var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Math.floor((last - d.getDate()) / 7) + 1 === -n;
}
function icsMonthDayOk(d, list) {
  var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return list.some(function (v) { v = +v; return v > 0 ? d.getDate() === v : d.getDate() === last + v + 1; });
}
/* the pattern alone (no COUNT, UNTIL, EXDATE): does the rule put an occurrence on this day */
function icsPattern(e, key) {
  var r = e.r, iv = Math.max(1, +(r.INTERVAL || 1)), s = icsDate(e.key), d = icsDate(key), bd = icsByDay(r);
  if (key < e.key) return false;
  if (r.BYMONTH && r.BYMONTH.split(",").map(Number).indexOf(d.getMonth() + 1) < 0) return false;
  if (r.FREQ === "DAILY") {
    if (icsDaysBetween(e.key, key) % iv) return false;
    return !bd || bd.some(function (b) { return b.wd === d.getDay(); });
  }
  if (r.FREQ === "WEEKLY") {
    var ws = ICS_WD[r.WKST || "MO"], so = (s.getDay() - ws + 7) % 7, w0 = icsAddDays(e.key, -so);
    if (Math.floor(icsDaysBetween(w0, key) / 7) % iv) return false;
    return bd ? bd.some(function (b) { return b.wd === d.getDay(); }) : d.getDay() === s.getDay();
  }
  var months = (d.getFullYear() - s.getFullYear()) * 12 + d.getMonth() - s.getMonth();
  if (r.FREQ === "MONTHLY") {
    if (months % iv) return false;
    if (bd) return bd.some(function (b) { return b.wd === d.getDay() && icsNth(d, b.n); }) && (!r.BYMONTHDAY || icsMonthDayOk(d, r.BYMONTHDAY.split(",")));
    return icsMonthDayOk(d, r.BYMONTHDAY ? r.BYMONTHDAY.split(",") : [s.getDate()]);
  }
  if (r.FREQ === "YEARLY") {
    if ((d.getFullYear() - s.getFullYear()) % iv) return false;
    if (!r.BYMONTH && d.getMonth() !== s.getMonth()) return false;
    if (bd) return bd.some(function (b) { return b.wd === d.getDay() && icsNth(d, b.n); });
    return icsMonthDayOk(d, r.BYMONTHDAY ? r.BYMONTHDAY.split(",") : [s.getDate()]);
  }
  return false;
}
/* an occurrence on this day, after UNTIL, COUNT and EXDATE */
function icsOccurs(e, key) {
  if (!e.r) return key === e.key;
  if (!icsPattern(e, key)) return false;
  if (e.x && e.x.indexOf(key) >= 0) return false;
  var r = e.r;
  if (r.UNTIL) { var u = icsWhen({ value: r.UNTIL, params: {} }); if (u && key > u.key) return false; }
  if (r.COUNT) {
    var c = 0, lim = +r.COUNT, k = e.key, span = icsDaysBetween(e.key, key);
    if (span > 3660) return false;
    for (var i = 0; i <= span; i++) { if (icsPattern(e, k)) c++; if (c > lim) return false; k = icsAddDays(k, 1); }
    return c <= lim;
  }
  return true;
}

/* busy blocks on one day from a list of calendars: [{ n, k, f, t, cal }] in minutes */
function icsBusy(cals, key) {
  var out = [];
  (cals || []).forEach(function (cal) {
    if (cal.on === false) return;
    var moved = {};                             /* uid -> days whose occurrence was moved or cancelled */
    cal.ev.forEach(function (e) { if (e.rid && e.uid) (moved[e.uid] = moved[e.uid] || {})[e.rid] = 1; });
    cal.ev.forEach(function (e) {
      if (e.skip) return;
      var days = Math.floor((e.min + e.dur - 1) / 1440);   /* how many days past its start an event reaches */
      for (var back = 0; back <= Math.max(0, days); back++) {
        var sk = icsAddDays(key, -back);
        if (e.rid ? sk !== e.key : (!icsOccurs(e, sk) || (e.uid && moved[e.uid] && moved[e.uid][sk]))) continue;
        var f = e.min - back * 1440, t = f + e.dur;
        f = Math.max(0, f); t = Math.min(1440, t);
        if (t > f) out.push({ n: e.n, k: icsGuessKind(e.n) === "hockey" ? "hockey" : cal.k || "other", f: f, t: t, cal: cal.name });
      }
    });
  });
  return out.sort(function (a, b) { return a.f - b.f; });
}

/* memo: the week view and the planner ask for the same days many times per draw */
var icsMemo = { sig: "", days: {} };
function icsDay(cals, key) {
  var sig = (cals || []).map(function (c) { return c.name + ":" + c.at + ":" + c.on + ":" + c.k; }).join("|");
  if (sig !== icsMemo.sig) icsMemo = { sig: sig, days: {} };
  return icsMemo.days[key] || (icsMemo.days[key] = icsBusy(cals, key));
}

/* add parsed calendars to the stored list: a calendar with the same name is replaced, keeping its settings */
function icsMerge(stored, parsed, now) {
  var list = (stored || []).slice();
  parsed.forEach(function (p) {
    var i = -1; list.forEach(function (c, j) { if (c.name === p.name) i = j; });
    var old = i >= 0 ? list[i] : null;
    var cal = { name: p.name, k: old ? old.k : icsGuessKind(p.name), on: old ? old.on !== false : true, at: now, ev: p.ev };
    if (i >= 0) list[i] = cal; else list.push(cal);
  });
  return list;
}

if (typeof module !== "undefined") module.exports = {
  ICS_KINDS: ICS_KINDS, icsLines: icsLines, icsParse: icsParse, icsWhen: icsWhen, icsDur: icsDur, icsOccurs: icsOccurs, icsBusy: icsBusy, icsDay: icsDay, icsMerge: icsMerge, icsGuessKind: icsGuessKind, icsAddDays: icsAddDays
};
