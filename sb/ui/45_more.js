/* ============================================================
   UI 6: the Calendar, the Poker and School hubs, the quant games,
   the Library and Method pages, Sync, and boot.
   ============================================================ */

/* ============================================================ CALENDAR ============================================================ */
function drawCalendar(box, sub) {
  box.innerHTML = '<div class="vhead"><div><h1>Calendar</h1><p>Your week with classes and hockey, today\'s study blocks placed in the free windows, a forecast of what each day will ask, and the history of what you did.</p></div></div>';
  var nav = el("nav", "subnav"); nav.innerHTML = [["week", "This week"], ["forecast", "Forecast"], ["month", "History"], ["settings", "Week & settings"]].map(function (t) { return '<a href="#/calendar/' + t[0] + '"' + (sub === t[0] ? ' aria-current="page"' : '') + '>' + t[1] + '</a>'; }).join(""); box.appendChild(nav);
  if (sub === "week") drawWeek(box); else if (sub === "forecast") drawForecast(box); else if (sub === "month") drawMonth(box); else drawCalSettings(box);
}
function drawWeek(box) {
  var S = HUB.plan, now = new Date(), wd = now.getDay(), startH = Math.max(5, Math.floor(plMins(S.wake) / 60) - 1), endH = Math.min(24, Math.ceil(plMins(S.sleep) / 60) + 1), hourPx = 34;
  var plan = planToday(now.getTime());
  var w = el("div", "week"); w.style.setProperty("--hour", hourPx + "px");
  w.appendChild(el("div", "hd", ""));
  var sunday = new Date(now); sunday.setDate(now.getDate() - wd);
  var dks = []; for (var d = 0; d < 7; d++) { var dt = new Date(sunday); dt.setDate(sunday.getDate() + d); dks.push(dayKey(dt.getTime())); var B = plBudget(S, d, dks[d], todayKey()), hd = el("div", "hd" + (d === wd ? " today" : ""), PL_DAYS_SHORT[d] + "<b>" + dt.getDate() + "</b>" + B.minutes + " min" + (B.due ? "<br><span style='color:var(--purple)'>+" + Math.round(B.due) + " assignments</span>" : "") + (plHas(S, d, "hockey", dks[d]) ? "<br><span style='color:var(--accent)'>hockey day</span>" : "")); if (B.why) hd.title = "Skills: " + B.minutes + " min (" + B.why + ")"; w.appendChild(hd); }
  var hrs = el("div", "hrs"); hrs.style.height = (endH - startH) * hourPx + "px";
  for (var h = startH; h <= endH; h++) { var lab = el("i", "", plFmt(h * 60)); lab.style.top = (h - startH) * hourPx + "px"; hrs.appendChild(lab); }
  w.appendChild(hrs);
  for (d = 0; d < 7; d++) {
    var col = el("div", "col" + (d === wd ? " today" : "")); col.style.height = (endH - startH) * hourPx + "px";
    plBusy(S, d, dks[d]).forEach(function (b) { if (b.t / 60 <= startH || b.f / 60 >= endH) return; var e = el("div", "evt " + b.k, "<b>" + esc(b.n) + "</b>" + plFmt(b.f) + "–" + plFmt(b.t)); e.style.top = ((Math.max(b.f / 60, startH) - startH) * hourPx) + "px"; e.style.height = Math.max(14, (Math.min(b.t / 60, endH) - Math.max(b.f / 60, startH)) * hourPx - 2) + "px"; e.title = b.n + " " + plFmt(b.f) + "–" + plFmt(b.t) + (b.cal ? " · " + b.cal : ""); col.appendChild(e); });
    if (d === wd) plan.blocks.forEach(function (b) { if (!b.at) return; var e = el("div", "evt study" + (b.school ? " school" : "") + (b.deferred ? " deferred" : ""), "<b>" + esc(blockLabel(b)) + "</b>" + b.min + " min"); e.style.top = ((b.at.f / 60 - startH) * hourPx) + "px"; e.style.height = Math.max(14, b.min / 60 * hourPx - 2) + "px"; e.title = blockLabel(b) + " · " + plFmt(b.at.f) + "–" + plFmt(b.at.t); col.appendChild(e); });
    else { var free = plFree(S, d, dks[d]); free.forEach(function (f) { var e = el("div", "evt study", "<b>free</b>" + plFmt(f.f) + "–" + plFmt(f.t)); e.style.opacity = ".35"; e.style.top = ((f.f / 60 - startH) * hourPx) + "px"; e.style.height = Math.max(14, (f.t - f.f) / 60 * hourPx - 2) + "px"; col.appendChild(e); }); }
    w.appendChild(col);
  }
  box.appendChild(w);
  box.appendChild(el("div", "legend", '<span><i class="dot k-class"></i>class</span><span><i class="dot k-hockey"></i>hockey</span><span><i class="dot k-study"></i>study block (today) / free window (other days)</span><span><i class="dot k-school"></i>school block</span>'));
  var p = el("div", "panel"); p.style.marginTop = "16px";
  p.innerHTML = '<div class="ph"><h3>Today\'s blocks</h3><a href="#/home">Today ›</a></div><div class="clist">' + (plan.blocks.length ? plan.blocks.map(function (b) { return '<div><span>' + (b.at ? plFmt(b.at.f) + "–" + plFmt(b.at.t) + " · " : "") + esc(blockLabel(b)) + '<small>' + esc(b.why) + '</small></span><b>' + b.min + ' min</b></div>'; }).join("") : '<div><span>No blocks today.</span></div>') + '</div><p class="pnote">Blocks are placed in your free windows from now onward and never split. Mark them done on Today; a block also counts as done once its track has logged that many minutes.</p>';
  box.appendChild(p);
}
function drawForecast(box) {
  var now = Date.now(), items = allSkillIds().map(function (id) { return { skill: skInfo(id).course, due: skills[id].due }; });
  var P = pokerRead(); try { var pc = JSON.parse(STORE.get(POKER_KEYS.course) || "null"); if (pc && pc.skills) Object.keys(pc.skills).forEach(function (id) { items.push({ skill: "poker", due: pc.skills[id].due || 0 }); }); } catch (e) {}
  var fc = plForecast(items, now, 14, dayKey), S = HUB.plan;
  var p = el("div", "panel"); p.innerHTML = '<div class="ph"><h3>Reviews falling due, next 14 days</h3><span>exact: every skill has a date</span></div>';
  var g = el("div", "fc");
  fc.forEach(function (r, i) { var d = new Date(now + i * SRS_DAY), wd = d.getDay(), dk = dayKey(d.getTime()), B = plBudget(S, wd, dk, todayKey()); var cell = el("div", (i === 0 ? "today" : "") + (r.total > 40 ? " heavy" : "")); cell.innerHTML = '<b>' + (i === 0 ? "Today" : PL_DAYS_SHORT[wd] + " " + d.getDate()) + '</b><div class="n">' + r.total + '</div><div class="by">' + Object.keys(r.by).map(function (k) { return '<i style="color:' + trackColor(k) + '">' + r.by[k] + ' ' + esc(trackName(k)) + '</i>'; }).join("") + '</div><div class="cm" style="font-size:10.5px;color:var(--faint);margin-top:4px">' + B.minutes + ' min budget' + (B.due ? ' · +' + Math.round(B.due) + ' assignments' : '') + (plHas(S, wd, "hockey", dk) ? " · hockey" : "") + '</div>'; g.appendChild(cell); });
  p.appendChild(g);
  p.appendChild(el("p", "pnote", "Reviews are the floor of each day. A heavy day (outlined red) means a lot came due at once; the fix is to keep new lessons to the daily cap, not to skip the reviews. Overdue reviews roll forward and show on today."));
  box.appendChild(p);
  box.appendChild(drawDeadlines(S));
  /* school dates */
  var sd = el("div", "panel"); sd.style.marginTop = "16px"; sd.innerHTML = '<div class="ph"><h3>School dates</h3><a href="#/school">School ›</a></div>';
  var list = el("div", "dates"), any = false;
  SCHOOL_COURSES.forEach(function (sc) { schoolRead(sc); (sc.keyDates || []).forEach(function (k) { var dd = schDaysUntil(k.date, now); if (dd < -1 || dd > 60) return; any = true; list.innerHTML += '<div><span class="dd">' + k.date.slice(5) + '</span><span>' + esc(sc.code) + ': ' + esc(k.label) + '</span><span class="in' + (dd <= 3 ? " soon" : "") + '">' + (dd < 0 ? "yesterday" : dd === 0 ? "today" : dd === 1 ? "tomorrow" : "in " + dd + " days") + '</span></div>'; }); var qz = schNextQuiz(sc, now); if (qz) { any = true; list.innerHTML += '<div><span class="dd">quiz</span><span>' + esc(sc.code) + ': week ' + qz.week + ' quiz' + (qz.topic ? " · " + esc(qz.topic) : "") + '</span><span class="in' + (qz.days <= 2 ? " soon" : "") + '">' + (qz.days === 0 ? "today" : qz.days === 1 ? "tomorrow" : "in " + qz.days + " days") + '</span></div>'; } });
  sd.appendChild(any ? list : el("p", "pnote", "No dates in the next two months."));
  box.appendChild(sd);
}
function drawMonth(box) {
  var now = new Date(), y = now.getFullYear(), m = now.getMonth(), first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
  var p = el("div", "panel"); p.innerHTML = '<div class="ph"><h3>' + now.toLocaleDateString(undefined, { month: "long", year: "numeric" }) + '</h3><span>minutes per track per day</span></div>';
  var grid = el("div", "month"); PL_DAYS_SHORT.forEach(function (d) { grid.appendChild(el("div", "", "<span style='color:var(--dim)'>" + d + "</span>")).style.aspectRatio = "auto"; });
  for (var i = 0; i < first.getDay(); i++) grid.appendChild(el("div", "", "")).style.visibility = "hidden";
  var P = pokerRead();
  for (var d = 1; d <= days; d++) {
    var key = y + "-" + ("0" + (m + 1)).slice(-2) + "-" + ("0" + d).slice(-2), L = plog[key], cell = el("div", (key === todayKey() ? "today" : "") + (L ? " on" : ""));
    cell.innerHTML = '<span class="dn">' + d + '</span>';
    var bars = el("div", "bars"), tot = 0, parts = [];
    if (L && L.by) Object.keys(L.by).forEach(function (k) { var mins = L.by[k].s / 60; if (mins >= 1) { parts.push([k, mins]); tot += mins; } });
    var pk = P.plog[key]; if (pk && pk.s >= 60) { parts.push(["poker", pk.s / 60]); tot += pk.s / 60; }
    parts.forEach(function (pp) { var b = el("i"); b.style.background = trackColor(pp[0]); b.style.width = Math.min(100, Math.round(pp[1] / 60 * 100)) + "%"; bars.appendChild(b); });
    cell.appendChild(bars); if (tot) cell.title = key + ": " + Math.round(tot) + " min (" + parts.map(function (pp) { return trackName(pp[0]) + " " + Math.round(pp[1]); }).join(", ") + ")" + (L && L.g ? " · goal met" : "");
    if (L && L.g) cell.style.borderColor = "var(--green)";
    grid.appendChild(cell);
  }
  p.appendChild(grid);
  p.appendChild(el("div", "legend", ["poker", "chess", "sv", "he", "es", "quant"].map(function (k) { return '<span><i class="dot" style="background:' + trackColor(k) + '"></i>' + trackName(k === "quant" ? "quant" : k) + '</span>'; }).join("") + '<span><i class="dot k-school"></i>school</span><span>green border: XP goal met</span>'));
  box.appendChild(p);
  var tot = 0, n = 0; Object.keys(plog).forEach(function (k) { if (k.indexOf(y + "-" + ("0" + (m + 1)).slice(-2)) === 0) { tot += plog[k].s; n++; } });
  box.appendChild(el("p", "pnote", "This month: " + fmtDur(tot) + " over " + plural(n, "day") + " in the hub" + (P.has ? ", plus PokerPro's own log" : "") + "."));
}
/* assignments and exams from the imported calendars: the estimate of each, how the planner spreads it, and finishing it */
function drawDeadlines(S) {
  var p = el("div", "panel"); p.style.marginTop = "16px";
  p.innerHTML = '<div class="ph"><h3>Assignments and exams</h3><a href="#/calendar/settings">Calendars ›</a></div>';
  var today = todayKey(), all = plDeadlines(S, today, 22), plan = {}; plDueAll(S, today).forEach(function (d) { plan[d.id] = d; });
  if (!(S.cals || []).length) { p.appendChild(el("p", "pnote", "Import your calendars in <a href='#/calendar/settings'>Week &amp; settings</a>: assignments, papers, quizzes and exams in them show up here, and the planner makes time for them before they are due.")); return p; }
  if (!all.length) { p.appendChild(el("p", "pnote", "Nothing due in the next three weeks in your imported calendars. If your assignments are in a calendar of their own (a Canvas feed, say), set that calendar to Deadlines in Week &amp; settings.")); return p; }
  var list = el("div", "busylist callist duelist");
  all.forEach(function (d) {
    var fin = !!(S.dueDone || {})[d.id], P = plan[d.id], est = (S.dueEst || {})[d.id] != null ? +S.dueEst[d.id] : d.est, row = el("div");
    var spread = P ? P.days.filter(function (x) { return x.min > 0; }).map(function (x) { return (x.key === today ? "today" : PL_DAYS_SHORT[plKeyDate(x.key).getDay()]) + " " + x.min; }).join(" · ") : "";
    row.innerHTML = '<span' + (fin ? ' style="opacity:.55"' : '') + '><span class="dot k-school"></span>' + esc(d.n.replace(/\s*[-–:(]?\s*(is )?due\)?$/i, "")) + ' <small>' + esc(dueWhen(d, today)) + ' · ' + esc(d.cal) + (fin ? " · finished" : spread ? "<br>planned (min): " + spread : est ? "" : " · no time planned") + '</small></span>';
    var inp = el("input"); inp.type = "number"; inp.min = 0; inp.max = 40; inp.step = 0.5; inp.value = Math.round(est / 30) / 2; inp.style.width = "74px"; inp.title = "Hours of work it needs";
    inp.onchange = function () { S.dueEst = S.dueEst || {}; S.dueEst[d.id] = Math.max(0, Math.round((+inp.value || 0) * 60)); S.at = Date.now(); saveSoon(); route(); };
    var lab = el("label", "", ""); lab.style.cssText = "display:flex;align-items:center;gap:4px;font-size:12px;color:var(--dim)"; lab.appendChild(inp); lab.appendChild(document.createTextNode("h"));
    row.appendChild(lab);
    row.appendChild(btn(fin ? "reopen" : "finished", "ghost sm", function () { S.dueDone = S.dueDone || {}; if (fin) delete S.dueDone[d.id]; else S.dueDone[d.id] = Date.now(); Object.keys(S.dueDone).forEach(function (k) { var dk = k.slice(k.lastIndexOf("@") + 1); if (dk < plKeyAdd(today, -30)) delete S.dueDone[k]; }); S.at = Date.now(); saveSoon(); route(); }));
    list.appendChild(row);
  });
  p.appendChild(list);
  p.appendChild(el("p", "pnote", "Each one gets a first estimate from its name (homework 1.5 h, a paper or project 4 h, a quiz 1 h, an exam 4 h of study); change the hours to what it really takes. The work is spread from a few days before (a week for papers and exams) up to the due date, more on days with more free time, and it comes out of the day before the skills get their share. Mark it finished and its time goes back to the skills."));
  return p;
}
/* calendars imported from .ics files: their events are busy time on their own dates, on top of the week above */
function drawImported(S) {
  var p = el("div", "panel"); p.style.marginTop = "16px";
  p.innerHTML = '<div class="ph"><h3>Imported calendars</h3><span>.ics files from Apple, Google or Outlook</span></div><p class="pnote">Import one .ics file or several at once; a file holding several calendars becomes one entry per calendar. Their events block study time on the days they happen, repeating events included; all-day and free events do not. An event named hockey counts as hockey wherever it is, and in a calendar left as Busy each event is sorted by its name (a course code is a class, a shift is work). Assignments, papers, quizzes and exams are picked out by name and get time before they are due (see Forecast); set a calendar to Deadlines when every event in it is something due, like a Canvas feed. To refresh a calendar, import a newer export of it: one with the same name is replaced and keeps its settings.</p>';
  var cals = S.cals || [];
  var list = el("div", "busylist callist");
  cals.forEach(function (c, i) {
    var rep = c.ev.filter(function (e) { return e.r; }).length, row = el("div");
    row.innerHTML = '<span><span class="dot ' + (c.k === "class" ? "k-class" : c.k === "hockey" ? "k-hockey" : c.k === "due" ? "k-school" : "k-other") + '"></span>' + esc(c.name) + ' <small>' + plural(c.ev.filter(function (e) { return !e.skip; }).length, "event") + (rep ? ", " + rep + " repeating" : "") + (c.on === false ? " · off" : "") + '</small></span>';
    var kind = el("select"); kind.style.width = "auto"; ICS_KINDS.forEach(function (k) { var o = el("option", "", ICS_KIND_NAMES[k]); o.value = k; if ((c.k || "other") === k) o.selected = true; kind.appendChild(o); });
    kind.onchange = function () { c.k = kind.value; c.at = Date.now(); S.at = Date.now(); saveSoon(); route(); };
    row.appendChild(kind);
    row.appendChild(btn(c.on === false ? "turn on" : "turn off", "ghost sm", function () { c.on = c.on === false; c.at = Date.now(); S.at = Date.now(); saveSoon(); route(); }));
    row.appendChild(btn("remove", "ghost sm", function () { S.cals.splice(i, 1); S.at = Date.now(); saveSoon(); route(); }));
    list.appendChild(row);
  });
  if (!cals.length) list.appendChild(el("p", "pnote", "No calendars imported yet."));
  p.appendChild(list);
  var file = el("input"); file.type = "file"; file.multiple = true; file.accept = ".ics,.ical,.ifb,.icalendar,text/calendar"; file.hidden = true;
  file.onchange = function () {
    var files = Array.prototype.slice.call(file.files || []); if (!files.length) return;
    Promise.all(files.map(function (f) { return f.text().then(function (t) { return icsParse(t, f.name.replace(/\.[^.]+$/, ""), todayKey()); }); })).then(function (parsed) {
      var all = [].concat.apply([], parsed).filter(function (c) { return c.ev.length; });
      if (!all.length) { toast("No timed events found in " + (files.length > 1 ? "those files" : "that file") + ". Is it an .ics export?", ""); return; }
      S.cals = icsMerge(S.cals, all, Date.now()); S.at = Date.now(); saveSoon();
      toast("Imported " + all.map(function (c) { return esc(c.name) + " (" + plural(c.ev.length, "event") + ")"; }).join(", ") + ".", "");
      route();
    }).catch(function (e) { toast("Could not read the file: " + esc(e.message || e), ""); });
  };
  var row = el("div", "row"); row.style.marginTop = "12px";
  row.appendChild(btn(cals.length ? "Import more .ics files" : "Import .ics files", "go sm", function () { file.click(); }));
  row.appendChild(file);
  p.appendChild(row);
  p.appendChild(el("p", "pnote", "<b>Apple Calendar (Mac):</b> select a calendar in the sidebar, then File › Export › Export…; repeat for each calendar and import all the files together. <b>Google Calendar:</b> Settings › Import &amp; export › Export downloads a zip with one .ics per calendar; unzip it and pick them all. <b>Outlook:</b> save the calendar as an .ics file. Times are shown in this device's time zone."));
  return p;
}
function drawCalSettings(box) {
  var S = HUB.plan;
  var wk = el("div", "panel"); wk.innerHTML = '<div class="ph"><h3>Your week</h3><span>classes, hockey and anything fixed</span></div><p class="pnote">Add every recurring commitment with its day and time. The planner leaves a buffer around each one, keeps study out of them, lowers the daily cap on hockey days and on days with five or more busy hours, and never schedules anything after your sleep cutoff.</p>';
  var tabs = el("div", "daytabs"), curD = drawCalSettings.day == null ? new Date().getDay() : drawCalSettings.day;
  PL_DAYS.forEach(function (nm, i) { var b = el("button", "chip" + (i === curD ? " on" : ""), nm.slice(0, 3) + (S.week[i] && S.week[i].length ? " · " + S.week[i].length : "")); b.type = "button"; b.onclick = function () { drawCalSettings.day = i; route(); }; tabs.appendChild(b); });
  wk.appendChild(tabs);
  var list = el("div", "busylist");
  (S.week[curD] || []).forEach(function (b, i) { var row = el("div"); row.innerHTML = '<span><span class="dot ' + (b.k === "class" ? "k-class" : b.k === "hockey" ? "k-hockey" : "k-other") + '"></span>' + esc(b.n) + ' <small>' + esc(PL_KINDS[b.k] || b.k) + '</small></span><span>' + esc(b.f) + '</span><span>' + esc(b.t) + '</span>'; row.appendChild(btn("remove", "ghost sm", function () { S.week[curD].splice(i, 1); S.at = Date.now(); saveSoon(); route(); })); list.appendChild(row); });
  if (!(S.week[curD] || []).length) list.appendChild(el("p", "pnote", "Nothing fixed on " + PL_DAYS[curD] + " yet."));
  wk.appendChild(list);
  var form = el("div", "row"); form.style.marginTop = "12px";
  var nm = el("input"); nm.type = "text"; nm.placeholder = "e.g. MATH 340"; nm.style.flex = "1 1 140px";
  var kind = el("select"); kind.style.width = "auto"; Object.keys(PL_KINDS).forEach(function (k) { var o = el("option", "", PL_KINDS[k]); o.value = k; kind.appendChild(o); });
  var f = el("input"); f.type = "time"; f.value = "09:00"; f.style.width = "120px"; var t = el("input"); t.type = "time"; t.value = "10:00"; t.style.width = "120px";
  var days = el("select"); days.style.width = "auto"; [["one", "this day only"], ["mwf", "Mon, Wed, Fri"], ["tth", "Tue, Thu"], ["wk", "Mon–Fri"], ["all", "every day"]].forEach(function (o) { var op = el("option", "", o[1]); op.value = o[0]; days.appendChild(op); });
  form.appendChild(nm); form.appendChild(kind); form.appendChild(f); form.appendChild(t); form.appendChild(days);
  form.appendChild(btn("Add", "go sm", function () { if (!nm.value.trim() || !f.value || !t.value) return; var ds = { one: [curD], mwf: [1, 3, 5], tth: [2, 4], wk: [1, 2, 3, 4, 5], all: [0, 1, 2, 3, 4, 5, 6] }[days.value]; ds.forEach(function (d) { S.week[d] = S.week[d] || []; S.week[d].push({ n: nm.value.trim(), k: kind.value, f: f.value, t: t.value }); }); S.at = Date.now(); saveSoon(); route(); }));
  wk.appendChild(form);
  box.appendChild(wk);
  box.appendChild(drawImported(S));
  var st = el("div", "panel"); st.style.marginTop = "16px"; st.innerHTML = '<div class="ph"><h3>Daily budget</h3><span>how much the planner may ask of a day</span></div>';
  var g = el("div", "grid3");
  function num(label, key, min, max, step, help) { var w = el("div", "field"); w.innerHTML = '<label class="f">' + label + '</label>'; var i = el("input"); i.type = "number"; i.min = min; i.max = max; i.step = step || 1; i.value = S[key]; i.onchange = function () { S[key] = +i.value; S.at = Date.now(); saveSoon(); }; w.appendChild(i); if (help) w.appendChild(el("div", "hint", help)); return w; }
  function time(label, key, help) { var w = el("div", "field"); w.innerHTML = '<label class="f">' + label + '</label>'; var i = el("input"); i.type = "time"; i.value = S[key]; i.onchange = function () { S[key] = i.value; S.at = Date.now(); saveSoon(); }; w.appendChild(i); if (help) w.appendChild(el("div", "hint", help)); return w; }
  g.appendChild(num("Share of free time for the skills, %", "share", 0, 100, 5, "Each day's budget is this share of its free time, after classes, hockey, everything on your calendars and assignment work. 0 turns it off and every day gets the cap."));
  g.appendChild(num("Most study minutes on a day", "cap", 10, 300, 5, "The ceiling on an open day. Reviews, lessons and applied sessions in the hub; school blocks count inside it, homework and assignment blocks are reserved on top."));
  g.appendChild(num("Cap on hockey days", "hockeyCap", 5, 300, 5, "Lower, because you are tired and the day is short."));
  g.appendChild(num("Cap on heavy days (5+ busy hours)", "heavyCap", 5, 300, 5, ""));
  g.appendChild(num("New lessons a day, at most", "newPerDay", 0, 6, 1, "Across every skill, never two in one skill. Two is the evidence-based default."));
  g.appendChild(num("Smallest block, minutes", "minBlock", 5, 30, 1, ""));
  g.appendChild(num("Buffer around commitments, minutes", "buffer", 0, 60, 5, "Getting there and back."));
  g.appendChild(time("Day starts", "wake", "No block before this."));
  g.appendChild(time("Sleep cutoff", "sleep", "Nothing after this: consolidation needs sleep."));
  g.appendChild(num("XP goal a day", "xpgoal", 20, 300, 10, ""));
  st.appendChild(g);
  var xg = st.querySelector("input[type=number]:last-of-type");
  st.querySelectorAll("input").forEach(function (i) { if (i.value == S.xpgoal && i.min == 20) { i.value = HUB.gstate.goal; i.onchange = function () { HUB.gstate.goal = +i.value; HUB.gstate.goalAt = Date.now(); saveSoon(); drawGamePill(); }; } });
  box.appendChild(st);
  var pr = el("div", "panel"); pr.style.marginTop = "16px"; pr.innerHTML = '<div class="ph"><h3>Priorities</h3><span>who gets the budget first</span></div><p class="pnote">School is always first and always on. For the rest: 3 = focus (first pick for new lessons), 2 = normal, 1 = light (reviews mostly), 0 = paused (nothing scheduled; reviews still wait).</p>';
  var pg = el("div", "prio");
  var tracks = [["poker", "Poker"]].concat(COURSE_ORDER.map(function (cid) { return [cid, COURSES[cid].name]; }));
  SCHOOL_COURSES.forEach(function (sc) { pg.innerHTML += '<span>' + esc(sc.code) + ' · ' + esc(sc.name) + '</span><span class="tag school">school: always first</span>'; });
  tracks.forEach(function (t) { var lab = el("span", "", esc(t[1])), sel = el("select"); [["3", "3 · focus"], ["2", "2 · normal"], ["1", "1 · light"], ["0", "0 · paused"]].forEach(function (o) { var op = el("option", "", o[1]); op.value = o[0]; if (String(S.priority[t[0]] == null ? 2 : S.priority[t[0]]) === o[0]) op.selected = true; sel.appendChild(op); }); sel.onchange = function () { S.priority[t[0]] = +sel.value; S.at = Date.now(); saveSoon(); }; pg.appendChild(lab); pg.appendChild(sel); });
  pr.appendChild(pg); box.appendChild(pr);
  var pv = el("div", "panel"); pv.style.marginTop = "16px";
  pv.innerHTML = '<div class="ph"><h3>Each day, as set</h3></div><div class="clist">' + plWeekLines(S).map(function (d) { return '<div><span>' + d.name + '<small>' + (d.busy.length ? d.busy.map(function (b) { return esc(b.n) + " " + plFmt(b.f) + "–" + plFmt(b.t); }).join(", ") : "nothing fixed") + ' · free: ' + (d.free.length ? d.free.map(function (f) { return plFmt(f.f) + "–" + plFmt(f.t); }).join(", ") : "none") + '</small></span><b>' + d.budget.minutes + ' min' + (d.budget.why ? " · " + esc(d.budget.why) : "") + '</b></div>'; }).join("") + '</div>';
  box.appendChild(pv);
}

/* ============================================================ POKER ============================================================ */
function drawPoker(box) {
  var P = pokerRead(), lv = courseLevel("poker");
  box.innerHTML = '<div class="chead"><div class="cg" style="color:var(--gold)">♠</div><div><div class="crumbs"><a href="#/skills">Skills</a><span>›</span>Poker</div><h1>Poker</h1><p>PokerPro: a nine-stage path from the rules to Bayesian exploitation, 37 drills on a spaced schedule, four CFR solver labs, a six-handed table where every decision is priced and graded, and a level measured at that table. It runs as its own app; the hub reads its progress for the calendar and the levels.</p><div class="cmeta"><span>Level: <b>' + esc(lv.name) + '</b></span><span>Lessons: <b>' + P.lessons + ' / ' + POKER_TOTAL_LESSONS + '</b></span><span>Due today: <b>' + P.due + '</b></span><span>XP: <b>' + P.xp.toLocaleString() + '</b></span><span>Streak: <b>' + P.streak + '</b></span></div></div></div>';
  var hero = el("div", "hero");
  hero.innerHTML = '<div class="kick">PokerPro</div><h2>' + (P.due ? plural(P.due, "review") + " due" : P.lessons ? "All clear in poker" : "Start with the rules, or take the placement test") + '</h2><p>' + (P.due ? "About " + Math.max(1, Math.round(P.dueMin)) + " minutes. Reviews first, then the next lesson, then hands at the table." : P.lessons ? "Keep the reviews up and put the maths to work at the table." : "PokerPro has its own placement test that passes every stage you already know.") + '</p>';
  var row = el("div", "row");
  [["Open PokerPro", "poker/#/home", "go"], ["Reviews", "poker/#/practice/review", "ghost"], ["Learn", "poker/#/learn", "ghost"], ["Play the table", "poker/#/play", "ghost"], ["Level", "poker/#/level", "ghost"]].forEach(function (b) { var a = el("a", "act " + b[2], b[0]); a.href = b[1]; row.appendChild(a); });
  hero.appendChild(row); box.appendChild(hero);
  var g = el("div", "grid2");
  var d = el("div", "panel"); d.innerHTML = '<div class="ph"><h3>Level at the table</h3><a href="poker/#/level">Details ›</a></div><div class="lvname">' + esc(lv.name) + '</div><div class="lvabout">' + esc(lv.about) + '</div><div class="clist">' + lv.detail.map(function (x) { return "<div><span>" + esc(x[0]) + "</span><b>" + esc(String(x[1])) + "</b></div>"; }).join("") + (P.hands ? '<div><span>Hands played</span><b>' + P.hands + '</b></div><div><span>Decision score</span><b>' + (P.quality != null ? Math.round(100 * P.quality) : "–") + '</b></div>' : "") + '</div>';
  g.appendChild(d);
  var h = el("div", "panel"); h.innerHTML = '<div class="ph"><h3>How it connects</h3></div><p class="pnote">Poker keeps its own storage in this browser. The hub reads it for: the reviews due (into today\'s plan), minutes studied (into the history), the level (into Skills), and the sync file (so PokerPro\'s progress travels with everything else). PokerPro\'s own Sync tab still works; the hub\'s sync covers it too.</p><p class="pnote">' + (P.has ? "Progress found: " + P.skills + " skills on the schedule, " + P.auto + " automatic." : "No PokerPro progress in this browser yet. Open it and pass the first checkpoint, or sync from another device.") + '</p>';
  g.appendChild(h); box.appendChild(g);
}

/* ============================================================ SCHOOL ============================================================ */
function drawSchool(box, id) {
  box.innerHTML = '<div class="vhead"><div><h1>School</h1><p>Your courses come first on every day. Each one keeps its own flashcards, generated problems and timed rehearsals; the hub reads what is due and the key dates and puts them at the front of the plan. Add a course as the term adds one.</p></div></div>';
  var now = Date.now();
  SCHOOL_COURSES.forEach(function (sc) {
    var R = schoolRead(sc), dm = schDemand(sc, R, now);
    var p = el("div", "sch"); p.style.marginBottom = "16px";
    p.innerHTML = '<div class="code">' + esc(sc.code) + ' · ' + esc(sc.term) + (sc.school ? ' · ' + esc(sc.school) : '') + '</div><h2>' + esc(sc.name) + '</h2><p class="pnote">' + esc(sc.blurb) + (sc.textbook ? " Textbook: " + esc(sc.textbook) + "." : "") + '</p>' +
      '<div class="stats"><div class="stat"><b class="' + (R.due ? "mid" : "hi") + '">' + R.due + '</b><span>cards due</span></div><div class="stat"><b class="' + (R.misses ? "lo" : "hi") + '">' + R.misses + '</b><span>to redo</span></div><div class="stat"><b>' + Math.round(100 * R.mastery) + '%</b><span>deck mastery</span></div><div class="stat"><b>' + R.streak + '</b><span>day streak</span></div><div class="stat"><b>' + (R.lastExam ? Math.round(100 * R.lastExam.score) + "%" : "–") + '</b><span>last timed sitting</span></div><div class="stat"><b>' + dm.week + '</b><span>week of term</span></div></div>';
    var todayP = el("div", "panel tight"); todayP.innerHTML = '<div class="ph"><h3>Today for this course</h3><span>first in the plan</span></div><div class="clist">' + dm.items.map(function (it) { return '<div><span><a href="' + it.href + '" style="text-decoration:none;color:var(--bone)">' + esc(it.label) + '</a><small>' + esc(it.why) + '</small></span><b>' + it.min + ' min</b></div>'; }).join("") + '</div>';
    p.appendChild(todayP);
    var dates = el("div", "panel tight"); dates.style.marginTop = "10px";
    var dl = (sc.keyDates || []).map(function (k) { var dd = schDaysUntil(k.date, now); return { k: k, dd: dd }; }).filter(function (x) { return x.dd >= -7; });
    dates.innerHTML = '<div class="ph"><h3>Key dates</h3><span>from the syllabus</span></div><div class="dates">' + dl.map(function (x) { return '<div><span class="dd">' + x.k.date.slice(5) + '</span><span>' + esc(x.k.label) + ' <span class="tag">' + x.k.kind + '</span></span><span class="in' + (x.dd >= 0 && x.dd <= 3 ? " soon" : "") + '">' + (x.dd < 0 ? Math.abs(x.dd) + " days ago" : x.dd === 0 ? "today" : x.dd === 1 ? "tomorrow" : "in " + x.dd + " days") + '</span></div>'; }).join("") + (dm.quiz ? '<div><span class="dd">quiz</span><span>Week ' + dm.quiz.week + ' quiz' + (dm.quiz.topic ? " · " + esc(dm.quiz.topic) : "") + ' <span class="tag">quiz</span></span><span class="in' + (dm.quiz.days <= 2 ? " soon" : "") + '">' + (dm.quiz.days === 0 ? "today" : dm.quiz.days === 1 ? "tomorrow" : "in " + dm.quiz.days + " days") + '</span></div>' : "") + '</div>' + (sc.gradeWeights ? '<p class="pnote">Grade: ' + sc.gradeWeights.map(function (w) { return esc(w[0]) + " " + w[1] + "%"; }).join(" · ") + '</p>' : "");
    p.appendChild(dates);
    if (R.weak && R.weak.length) { var wk = el("div", "panel tight"); wk.style.marginTop = "10px"; wk.innerHTML = '<div class="ph"><h3>Weakest topics</h3><span>first-try accuracy, recent answers weighted</span></div><div class="clist">' + R.weak.map(function (w) { var g = (typeof MATH340 !== "undefined") ? MATH340.units.flatMap(function (u) { return u.generators || []; }).filter(function (x) { return x.id === w.id; })[0] : null; return '<div><span>' + esc(g ? g.name : w.id) + '</span><b>' + w.correct + ' / ' + w.attempts + '</b></div>'; }).join("") + '</div>'; p.appendChild(wk); }
    var links = el("div", "links"); (sc.links || []).forEach(function (l) { var a = el("a", "", l[0]); a.href = sc.href + l[1]; links.appendChild(a); }); p.appendChild(links);
    var row = el("div", "row"); row.style.marginTop = "12px"; var open = el("a", "act go", "Open " + esc(sc.code)); open.href = sc.href; row.appendChild(open); p.appendChild(row);
    box.appendChild(p);
  });
  var add = el("div", "panel"); add.innerHTML = '<div class="ph"><h3>Adding a course</h3></div><p class="pnote">New coursework is added as it arrives: a chapter or homework set goes into the course\'s own <code>data/</code> folder (Math 340 has a ten-minute recipe in <code>school/math340/docs/ADDING_CONTENT.md</code>), and a new course is one entry in <code>sb/school.js</code> plus its folder under <code>school/</code>. The hub, the calendar and the sync pick it up on the next build. See <code>docs/ADDING_A_COURSE.md</code>.</p>';
  box.appendChild(add);
}

/* ============================================================ QUANT ============================================================ */
var qrun = null;
function drawQuant(box, gid) {
  var S = HUB.quant;
  if (!gid) {
    var lv = qtLevel(S);
    box.innerHTML = '<div class="vhead"><div><h1>Quant games</h1><p>Two minutes against the clock, as many right answers as you can, no stakes. Modelled on the arithmetic game quant firms screen with. Your score over time is the progress; tiers raise the numbers as your median climbs.</p></div></div>';
    var hero = el("div", "hero"); hero.innerHTML = '<div class="kick">Level: ' + esc(lv.name) + '</div><h2>' + (qtPlayedToday(S, todayKey(), dayKey) ? "Played today. Another run is free." : "One game today, before the first real session") + '</h2><p>The sprint is the one that transfers most; rotate through the others. A run takes two minutes and is not counted against your study budget.</p>'; box.appendChild(hero);
    var grid = el("div", "qgrid");
    QT_GAMES.forEach(function (G) { var tier = qtTier(S, G.id), T = G.tiers[tier], hist = qtHistory(S, G.id, 5).filter(function (r) { return r.tier === tier; }).map(function (r) { return r.score; }), best = S.best[G.id + ":" + tier] || 0; var a = el("a", "qcard"); a.href = "#/quant/" + G.id; a.innerHTML = '<b>' + esc(G.name) + '</b><span>' + esc(G.blurb) + '</span><div class="qb">' + T.name + ' of ' + G.tiers.length + ' · ' + esc(T.about) + '</div><span>target ' + T.target + ' · best ' + best + ' · last: ' + (hist.length ? hist.join(", ") : "none yet") + '</span>'; grid.appendChild(a); });
    box.appendChild(grid);
    var plan = el("div", "panel"); plan.style.marginTop = "16px"; plan.innerHTML = '<div class="ph"><h3>The plan</h3></div>' + QT_PLAN.map(function (p) { return '<p class="pnote"><b>' + esc(p.title) + '.</b> ' + esc(p.body) + '</p>'; }).join(""); box.appendChild(plan);
    var det = el("div", "panel"); det.style.marginTop = "16px"; det.innerHTML = '<div class="ph"><h3>Where you stand</h3><span>score ' + Math.round(lv.score) + ' of 100</span></div><div class="clist">' + lv.detail.map(function (x) { return "<div><span>" + esc(x[0]) + "</span><b>" + esc(x[1]) + "</b></div>"; }).join("") + '</div>'; box.appendChild(det);
    return;
  }
  var G = qtGame(gid); if (!G) { go("#/quant"); return; }
  var tier = qtTier(S, gid), T = G.tiers[tier];
  box.innerHTML = '<div class="crumbs"><a href="#/quant">Quant games</a><span>›</span>' + esc(G.name) + '</div>';
  var host = el("div", "panel"); box.appendChild(host);
  if (!qrun || qrun.g !== gid || qrun.over) {
    host.innerHTML = '<div class="ph"><h3>' + esc(G.name) + ' · ' + T.name + '</h3><span>' + esc(T.about) + ' · target ' + T.target + ' in ' + G.secs + 's</span></div><p class="pnote">' + esc(G.blurb) + ' Type the answer and press Enter; a wrong answer shows the right one and moves on. ' + (G.id === "estimate" ? "Within " + Math.round(T.tol * 100) + "% counts." : G.id === "odds" || G.id === "percent" ? "Percentages to within half a point." : "Exact answers.") + '</p>';
    var r = el("div", "row"); r.appendChild(btn("Start (" + G.secs + " seconds)", "go", function () { startQuant(gid); })); host.appendChild(r);
    var hist = qtHistory(S, gid, 60);
    if (hist.length) { var ch = el("div", "panel"); ch.style.marginTop = "16px"; ch.innerHTML = '<div class="ph"><h3>Score over time</h3><span>' + plural(hist.length, "run") + ' · tier shown as colour depth</span></div>'; ch.appendChild(lineChart(hist.map(function (r, i) { return { x: i, y: r.score, label: r.score + " (tier " + (r.tier + 1) + ", " + new Date(r.t).toLocaleDateString() + ")" }; }), { y0: 0 })); var byOp = {}; ch.appendChild(el("p", "pnote", "Best at this tier: " + (S.best[gid + ":" + tier] || 0) + ". Five runs at or above the target as a median unlock the next tier.")); box.appendChild(ch); }
    return;
  }
  drawQuantRun(host);
}
function startQuant(gid) {
  var S = HUB.quant, G = qtGame(gid), tier = qtTier(S, gid);
  qrun = { g: gid, tier: tier, t0: Date.now(), end: Date.now() + G.secs * 1000, score: 0, n: 0, log: [], q: null, over: false, by: {} };
  qrun.q = qtQuestion(gid, tier);
  route();
}
function drawQuantRun(host) {
  var G = qtGame(qrun.g);
  host.innerHTML = '<div class="qclock" id="qclock"></div><div class="qask' + (qrun.q.q.length > 24 ? " sm" : "") + '" id="qask">' + esc(qrun.q.q) + '</div><div class="qentry"><input id="qinp" type="text" inputmode="decimal" autocomplete="off"></div><p class="hint" style="text-align:center">Enter to answer. Score <b id="qscore">' + qrun.score + '</b></p><div class="qlog" id="qlog"></div>';
  var inp = $("qinp"); inp.focus();
  inp.onkeydown = function (e) { if (e.key !== "Enter") return; var v = inp.value; if (!v.trim()) return; var ok = qtCheck(qrun.q, v); qrun.n++; if (ok) qrun.score++; var k = qrun.q.kind; qrun.by[k] = qrun.by[k] || [0, 0]; qrun.by[k][0]++; if (ok) qrun.by[k][1]++; var li = el("i", ok ? "" : "no", esc(qrun.q.q.replace(" ≈ ?", "").replace(", ?", "")) + " = " + esc(String(Math.round(qrun.q.a * 100) / 100)) + (ok ? "" : " (you: " + esc(v) + ")")); $("qlog").prepend(li); $("qscore").textContent = qrun.score; qrun.q = qtQuestion(qrun.g, qrun.tier); $("qask").textContent = qrun.q.q; $("qask").className = "qask" + (qrun.q.q.length > 24 ? " sm" : ""); inp.value = ""; };
  function tickQ() { if (!qrun || qrun.over) return; var left = Math.max(0, qrun.end - Date.now()); var c = $("qclock"); if (!c) return; c.innerHTML = "<b>" + (left / 1000).toFixed(0) + "</b>s left"; if (left <= 0) { endQuant(host); return; } requestAnimationFrame(tickQ); }
  tickQ();
}
function endQuant(host) {
  qrun.over = true;
  var G = qtGame(qrun.g), R = qtRecord(HUB.quant, qrun.g, qrun.tier, qrun.score, qrun.n, Date.now());
  gmGain(null, Math.min(15, Math.round(qrun.score / 3)), null); logDay("quant", G.secs, 0, 0); saveSoon();
  host.innerHTML = '<div class="qres"><b>' + qrun.score + '</b><span>right in ' + G.secs + ' seconds, ' + qrun.n + ' attempted · ' + G.tiers[qrun.tier].name + ' target ' + G.tiers[qrun.tier].target + (R.best === qrun.score && qrun.score ? ' · <b style="font-size:14px;color:var(--gold)">new best</b>' : '') + '</span></div>' +
    (R.moved ? '<div class="cpdone"><h3 class="pass">Tier up</h3><p>Your median over the last five runs beat the target. The next tier starts next run.</p></div>' : '<p class="pnote" style="text-align:center">' + (R.median != null ? "Median of the last five: " + R.median + " (target " + R.target + ")." : "Five runs at this tier set a median; " + (5 - qtHistory(HUB.quant, qrun.g, 5).filter(function (r) { return r.tier === qrun.tier; }).length) + " more to go.") + '</p>') +
    '<div class="stats">' + Object.keys(qrun.by).map(function (k) { return '<div class="stat"><b>' + qrun.by[k][1] + '/' + qrun.by[k][0] + '</b><span>' + esc(k) + '</span></div>'; }).join("") + '</div>';
  var r = el("div", "row"); r.style.justifyContent = "center"; r.appendChild(btn("Again", "go", function () { startQuant(qrun.g); })); r.appendChild(btn("All games", "ghost", function () { qrun = null; go("#/quant"); })); host.appendChild(r);
}

/* ============================================================ LIBRARY and METHOD ============================================================ */
function drawLibrary(box, sub) {
  box.innerHTML = '<div class="vhead"><div><h1>Library</h1><p>Every reference card and glossary term across the skills, searchable, each linked to its lesson; the science the hub runs on; and the reading lists.</p></div></div>';
  var nav = el("nav", "subnav"); nav.innerHTML = [["all", "Reference cards"], ["glossary", "Glossary"], ["reading", "Reading"], ["method", "The method"]].map(function (t) { return '<a href="#/library/' + t[0] + '"' + (sub === t[0] ? ' aria-current="page"' : '') + '>' + t[1] + '</a>'; }).join(""); box.appendChild(nav);
  if (sub === "method") { drawMethod(box, true); return; }
  var search = el("input"); search.type = "search"; search.placeholder = "Search…"; search.style.marginBottom = "14px"; box.appendChild(search);
  var list = el("div"); box.appendChild(list);
  function draw() {
    var qv = search.value.trim().toLowerCase(); list.innerHTML = "";
    COURSE_ORDER.forEach(function (cid) {
      var c = COURSES[cid];
      if (sub === "all") { var fx = c.formulas.filter(function (f) { return !qv || (f.name + " " + f.f + " " + f.topic + " " + (f.note || "")).toLowerCase().indexOf(qv) >= 0; }); if (!fx.length) return; list.appendChild(el("h3", "sech", esc(c.name))); fx.forEach(function (f) { list.insertAdjacentHTML("beforeend", fxCard(f, c, true)); }); }
      else if (sub === "glossary") { var gl = c.glossary.filter(function (g) { return !qv || (g[0] + " " + (g[1] || []).join(" ") + " " + g[2]).toLowerCase().indexOf(qv) >= 0; }); if (!gl.length) return; list.appendChild(el("h3", "sech", esc(c.name))); var p = el("div", "panel clist"); p.innerHTML = gl.map(function (g) { return '<div><span><b>' + esc(g[0]) + '</b><small>' + esc(g[2]) + '</small></span><b><a href="#/c/' + cid + '/learn/' + g[3] + '" style="color:var(--gold);text-decoration:none">lesson ›</a></b></div>'; }).join(""); list.appendChild(p); }
      else { list.appendChild(el("h3", "sech", esc(c.name))); c.reading.forEach(function (g) { var p2 = el("div", "panel clist"); p2.style.marginBottom = "10px"; p2.innerHTML = '<div><span><b>' + esc(g.g) + '</b></span></div>' + g.items.map(function (it) { return "<div><span>" + esc(it[0]) + "<small>" + esc(it[1]) + "</small></span></div>"; }).join(""); list.appendChild(p2); }); }
    });
    if (sub === "reading") { list.appendChild(el("h3", "sech", "Poker")); list.appendChild(el("p", "pnote", "PokerPro's reading list (Chen & Ankenman, Brokos, Acevedo, the CFR papers) is on its own Library tab: <a href='poker/#/library/reading'>open it ›</a>.")); }
  }
  search.oninput = draw; draw();
}
function drawMethod(box, embedded) {
  if (!embedded) box.innerHTML = '<div class="vhead"><div><h1>How this works</h1><p>The rules the hub runs on, each with the evidence behind it.</p></div></div>';
  METHOD.forEach(function (m) { var p = el("div", "panel"); p.style.marginBottom = "12px"; p.innerHTML = '<div class="ph"><h3>' + esc(m.title) + '</h3></div><p style="font-size:15px;margin-bottom:8px"><b>' + esc(m.one) + '</b></p><p class="pnote" style="margin-top:0">' + esc(m.body) + '</p><p class="hint">' + esc(m.src) + '</p>'; box.appendChild(p); });
}

/* ============================================================ SYNC, BACKUP, INSTALL, SETTINGS ============================================================ */
var sync = { token: "", gist: "", login: "", auto: true, device: null, state: "off", msg: "", at: 0, busy: null, again: false, timer: 0, dirty: false, remote: null, log: [], last: "" };
function syncLoadCfg() { try { var c = JSON.parse(STORE.get(SYNC_CFG_KEY) || "null"); if (c) Object.assign(sync, { token: c.token || "", gist: c.gist || "", login: c.login || "", auto: c.auto !== false, device: c.device || null, log: c.log || [], at: c.at || 0, last: c.last || "" }); } catch (e) {} if (!sync.device) sync.device = { id: "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name: guessDevice() }; if (sync.token) sync.state = "on"; }
function syncSaveCfg() { try { STORE.set(SYNC_CFG_KEY, JSON.stringify({ token: sync.token, gist: sync.gist, login: sync.login, auto: sync.auto, device: sync.device, log: sync.log.slice(-40), at: sync.at, last: sync.last })); } catch (e) {} }
function guessDevice() { var u = navigator.userAgent || ""; return /iPad/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1) ? "iPad" : /iPhone/.test(u) ? "iPhone" : /Android/.test(u) ? "Android" : /Macintosh/.test(u) ? "Mac" : /Windows/.test(u) ? "Windows PC" : "Device"; }
function syncLogAdd(kind, msg) { sync.log.push({ t: Date.now(), k: kind, m: msg }); if (sync.log.length > 40) sync.log.shift(); }
function syncLocal() { var pr = pokerRaw(); var m3 = null; try { m3 = JSON.parse(STORE.get("math340-progress-v1") || "null"); } catch (e) {} return { v: 1, hub: hubSnapshot(), poker: pr.course, pokerGame: pr.game, pokerSim: pr.sim ? Object.assign({ at: 0 }, pr.sim) : null, math340: m3, devices: {} }; }
function syncApply(merged) {
  var before = hsCanon(syncLocal());
  HUB = Object.assign(hsEmptyHub(), merged.hub); HUB.gstate = Object.assign({ goal: 60, goalAt: 0, seen: {}, conf: true }, merged.hub.gstate || {}); HUB.plan = Object.assign(plDefault(), merged.hub.plan || {}); HUB.plan.week = Object.assign(plDefault().week, (merged.hub.plan || {}).week || {}); HUB.plan.priority = Object.assign(plDefault().priority, (merged.hub.plan || {}).priority || {}); HUB.quant = Object.assign(qtNew(), merged.hub.quant || {}); rebind(); saveNow();
  try { if (merged.poker) STORE.set(POKER_KEYS.course, JSON.stringify(merged.poker)); if (merged.pokerGame) STORE.set(POKER_KEYS.game, JSON.stringify(merged.pokerGame)); if (merged.pokerSim) STORE.set(POKER_KEYS.sim, JSON.stringify(merged.pokerSim)); if (merged.math340) STORE.set("math340-progress-v1", JSON.stringify(merged.math340)); } catch (e) {}
  return hsCanon(syncLocal()) !== before;
}
var SYNC_FILE_HUB = HS_FILE;
async function hubFindGist(token, seed) {
  for (var page = 1; page <= 10; page++) { var list = await syncReq(token, "GET", "/gists?per_page=100&page=" + page); for (var i = 0; i < list.length; i++) if (list[i].files && list[i].files[SYNC_FILE_HUB]) return list[i].id; if (list.length < 100) break; }
  var files = {}; files[SYNC_FILE_HUB] = { content: JSON.stringify(seed) };
  var g = await syncReq(token, "POST", "/gists", { description: "Skill Builder progress (synced between devices by the app)", public: false, files: files });
  return g.id;
}
async function hubReadGist(token, id) { var g = await syncReq(token, "GET", "/gists/" + id); var f = g.files && g.files[SYNC_FILE_HUB]; if (!f) return hsEmpty(); var text = f.content; if (f.truncated && f.raw_url) text = await (await fetch(f.raw_url, { cache: "no-store" })).text(); try { return hsNorm(JSON.parse(text)); } catch (e) { return hsEmpty(); } }
function hubWriteGist(token, id, st, keepalive) { var files = {}; files[SYNC_FILE_HUB] = { content: JSON.stringify(st) }; return syncReq(token, "PATCH", "/gists/" + id, { files: files }, keepalive); }
function syncSoon() { if (!sync.token || !sync.auto) return; sync.dirty = true; clearTimeout(sync.timer); sync.timer = setTimeout(function () { syncNow("after practice"); }, 5000); }
function syncNow(why) {
  if (!sync.token) return Promise.resolve();
  if (sync.busy) { sync.again = true; return sync.busy; }
  clearTimeout(sync.timer); sync.timer = 0; sync.state = "busy"; drawSyncPill();
  sync.busy = (async function () {
    try {
      if (!sync.login) { try { var w = await syncWho(sync.token); sync.login = w.login; } catch (e) { if (e.code === "auth" || e.code === "offline") throw e; } }
      if (!sync.gist) { sync.gist = await hubFindGist(sync.token, syncLocal()); syncLogAdd("link", "Linked to private gist " + sync.gist.slice(0, 7)); }
      var remote = await hubReadGist(sync.token, sync.gist), mine = syncLocal(), merged = hsMergeAll(mine, remote), now = Date.now();
      merged.devices[sync.device.id] = { name: sync.device.name, seen: now, kind: guessDevice() };
      var changedHere = hsCanon(merged) !== hsCanon(mine), changedThere = hsCanon(merged) !== hsCanon(remote);
      if (changedHere) { syncApply(merged); if (view !== "drill") route(); }
      if (changedThere || JSON.stringify(merged.devices) !== JSON.stringify(remote.devices)) await hubWriteGist(sync.token, sync.gist, merged);
      sync.remote = merged; sync.state = "on"; sync.msg = ""; sync.at = now; sync.dirty = false;
      sync.last = changedHere && changedThere ? "Merged both ways" : changedHere ? "Received changes" : changedThere ? "Sent changes" : "Already up to date";
      syncLogAdd(changedHere ? "pull" : changedThere ? "push" : "same", sync.last + " (" + why + ")");
    } catch (e) { sync.state = "error"; sync.msg = (e && e.message) || "sync failed"; syncLogAdd("error", sync.msg + " (" + why + ")"); }
    syncSaveCfg(); sync.busy = null; drawSyncPill(); drawSaveTag(); if (view === "sync") route();
    if (sync.again) { sync.again = false; syncSoon(); }
  })();
  return sync.busy;
}
function syncFlush() { if (!sync.token || !sync.auto || !sync.gist || !sync.remote || !sync.dirty) return; try { var merged = hsMergeAll(syncLocal(), sync.remote); hubWriteGist(sync.token, sync.gist, merged, true); } catch (e) {} }
function drawSyncPill() { var p = $("syncPill"); if (!p) return; p.className = "spill " + (sync.token ? sync.state : "off"); p.innerHTML = "<i></i><span>" + (!sync.token ? "Sync off" : sync.state === "busy" ? "Syncing" : sync.state === "error" ? "Sync error" : "Synced " + (sync.at ? fmtAgo(sync.at) : "")) + "</span>"; p.title = !sync.token ? "Sync is off" : sync.state === "error" ? sync.msg : "Synced " + (sync.at ? fmtAgo(sync.at) : ""); }
function drawSync(box) {
  box.innerHTML = '<div class="vhead"><div><h1>Sync, backup and install</h1><p>One private GitHub gist carries the hub, PokerPro and Math 340 progress between your Mac, iPad and iPhone. Each device merges, never overwrites, so you can work offline on any of them and they converge when they reconnect.</p></div></div>';
  var st = el("div", "sstat " + (sync.token ? sync.state : "off"));
  st.innerHTML = '<div class="sdot"></div><div><b>' + (!sync.token ? "Not connected" : sync.state === "error" ? "Sync failed: " + esc(sync.msg) : sync.state === "busy" ? "Syncing…" : "Connected" + (sync.login ? " as " + esc(sync.login) : "")) + '</b><p>' + (!sync.token ? "Progress is saved on this device only. Connect a token below to sync." : (sync.last ? esc(sync.last) + ". " : "") + (sync.at ? "Last sync " + fmtAgo(sync.at) + ". " : "") + "Syncs on open, a few seconds after you answer, every five minutes while open, and when the device comes back online.") + '</p></div>';
  box.appendChild(st);
  var g = el("div", "grid2");
  var tk = el("div", "panel"); tk.innerHTML = '<div class="ph"><h3>' + (sync.token ? "Token" : "Connect") + '</h3></div>';
  if (!sync.token) {
    tk.innerHTML += '<p class="pnote">Create a GitHub token with only the <b>gist</b> permission, then paste it here on each device. The app finds or creates one secret gist and talks to GitHub directly; there is no server of its own. The token lives only in this browser\'s storage.</p><p class="pnote"><a href="https://github.com/settings/tokens/new?scopes=gist&description=Skill%20Builder%20sync" target="_blank" rel="noopener">Create a token ›</a> (classic, tick <b>gist</b>; or a fine-grained token with Gists: read and write)</p>';
    var f = el("div", "row"); var inp = el("input"); inp.type = "text"; inp.placeholder = "ghp_… or github_pat_…"; inp.autocomplete = "off"; inp.style.flex = "1 1 240px"; f.appendChild(inp);
    f.appendChild(btn("Connect", "go", function () { var t = inp.value.trim(); if (!t) return; sync.token = t; sync.state = "on"; syncSaveCfg(); syncNow("first connect"); route(); })); tk.appendChild(f);
  } else {
    tk.innerHTML += '<p class="pnote">Token ' + esc(sync.token.slice(0, 7)) + '…' + esc(sync.token.slice(-4)) + (sync.gist ? ' · gist <a href="https://gist.github.com/' + esc(sync.gist) + '" target="_blank" rel="noopener">' + esc(sync.gist.slice(0, 7)) + '</a>' : "") + '</p>';
    var r = el("div", "row"); r.appendChild(btn("Sync now", "go sm", function () { syncNow("by hand"); })); var auto = btn(sync.auto ? "Auto-sync: on" : "Auto-sync: off", "ghost sm", function () { sync.auto = !sync.auto; syncSaveCfg(); route(); }); r.appendChild(auto); r.appendChild(btn("Disconnect this device", "danger sm", function () { sync.token = ""; sync.gist = ""; sync.login = ""; sync.state = "off"; sync.remote = null; syncSaveCfg(); route(); })); tk.appendChild(r);
    var dn = el("div", "field"); dn.style.marginTop = "12px"; dn.innerHTML = '<label class="f">This device\'s name</label>'; var di = el("input"); di.type = "text"; di.value = sync.device.name; di.onchange = function () { sync.device.name = di.value; syncSaveCfg(); }; dn.appendChild(di); tk.appendChild(dn);
    if (sync.remote && sync.remote.devices) { var dv = el("div", "devs"); Object.keys(sync.remote.devices).forEach(function (k) { var d = sync.remote.devices[k]; dv.innerHTML += '<div><span>' + esc(d.name) + (k === sync.device.id ? " (this one)" : "") + '</span><small>' + fmtAgo(d.seen) + '</small></div>'; }); tk.appendChild(el("div", "ph", "<h3>Devices</h3>")); tk.appendChild(dv); }
  }
  g.appendChild(tk);
  var bk = el("div", "panel"); bk.innerHTML = '<div class="ph"><h3>Backup and restore</h3></div><p class="pnote">A JSON file with everything: the hub, PokerPro\'s three saved keys and the Math 340 store. Restoring merges rather than overwrites.</p>';
  var br = el("div", "row"); br.appendChild(btn("Download backup", "ghost sm", function () { var blob = new Blob([JSON.stringify(syncLocal(), null, 1)], { type: "application/json" }); var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "skillbuilder-backup-" + todayKey() + ".json"; a.click(); }));
  var fi = el("input"); fi.type = "file"; fi.accept = ".json,application/json"; fi.style.display = "none"; fi.onchange = function () { var f = fi.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function () { try { var st = JSON.parse(rd.result); syncApply(hsMergeAll(syncLocal(), hsNorm(st))); toast("<b>Restored.</b> Merged with what was here.", "goal"); route(); } catch (e) { toast("That file could not be read.", ""); } }; rd.readAsText(f); };
  br.appendChild(btn("Restore from file", "ghost sm", function () { fi.click(); })); br.appendChild(fi); bk.appendChild(br);
  bk.innerHTML += '<div class="ph" style="margin-top:16px"><h3>Settings</h3></div>';
  var cf = el("div", "row"); cf.appendChild(btn("Confidence prompt: " + (HUB.gstate.conf !== false ? "on" : "off"), "ghost sm", function () { HUB.gstate.conf = HUB.gstate.conf === false; saveSoon(); route(); })); bk.appendChild(cf);
  bk.appendChild(el("p", "pnote", "The prompt after each answer (guessing / fairly sure / sure) builds a calibration score. Turn it off for speed."));
  var wipe = btn("Clear all hub progress", "danger sm", function () { if (!wipe.dataset.armed) { wipe.dataset.armed = "1"; wipe.textContent = "Sure? Click again"; setTimeout(function () { delete wipe.dataset.armed; wipe.textContent = "Clear all hub progress"; }, 3000); return; } var g0 = HUB.gstate.goal; HUB = hsEmptyHub(); HUB.epoch = Date.now(); HUB.gstate = { goal: g0, goalAt: Date.now(), seen: {}, conf: true, primed: true }; HUB.plan = plDefault(); HUB.quant = qtNew(); rebind(); saveNow(); syncSoon(); toast("Hub progress cleared. PokerPro and Math 340 keep theirs; clear those in their own apps.", ""); route(); }); wipe.style.marginTop = "12px"; bk.appendChild(wipe);
  g.appendChild(bk); box.appendChild(g);
  var inst = el("div", "panel"); inst.style.marginTop = "16px";
  inst.innerHTML = '<div class="ph"><h3>Install on your Mac, iPad and iPhone</h3><span>works offline after the first visit</span></div><div class="install"><b>iPhone and iPad (Safari):</b> open this page, tap Share, then <b>Add to Home Screen</b>. It opens full-screen with its own icon, and everything, including PokerPro and the Math 340 tool, works offline.<br><b>Mac (Safari 17+):</b> File › <b>Add to Dock</b>. <b>Mac (Chrome/Edge):</b> the install icon in the address bar, or the menu › Install Skill Builder.<br><b>Offline:</b> a service worker caches all three apps on the first visit. Progress made offline is saved on the device and merged with the gist the next time you are online, on every device.</div>' +
    '<p class="pnote">Status: ' + ("serviceWorker" in navigator ? (navigator.serviceWorker.controller ? "offline copy installed on this device." : "service worker registering; reload once to complete the offline copy.") : "this browser does not support offline installation.") + (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches ? " Running as an installed app." : "") + '</p>';
  box.appendChild(inst);
  if (sync.log.length) { var lg = el("div", "panel"); lg.style.marginTop = "16px"; lg.innerHTML = '<div class="ph"><h3>Sync log</h3></div><div class="slog">' + sync.log.slice().reverse().map(function (l) { return '<div><span class="t">' + new Date(l.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + '</span><span>' + esc(l.m) + '</span></div>'; }).join("") + '</div>'; box.appendChild(lg); }
}
$("syncPill").onclick = function () { go("#/sync"); };

/* ============================================================ THEME: paper by day, lamp by night ============================================================ */
var THEME_ICON = {
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
};
function themeNow() { var t = document.documentElement.getAttribute("data-theme"); if (t) return t; return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
function drawThemeBtn() {
  var b = $("themeBtn"); if (!b) return; var dark = themeNow() === "dark";
  b.innerHTML = dark ? THEME_ICON.sun : THEME_ICON.moon; b.title = dark ? "Switch to the paper theme" : "Switch to the lamp theme";
  var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? "#161411" : "#F4EFE6";
}
$("themeBtn").onclick = function () { var next = themeNow() === "dark" ? "light" : "dark"; document.documentElement.setAttribute("data-theme", next); try { localStorage.setItem("sb-theme", next); } catch (e) {} drawThemeBtn(); };
if (window.matchMedia) { try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", drawThemeBtn); } catch (e) {} }

/* ============================================================ BOOT ============================================================ */
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
(function boot() {
  hubLoad(); rebind(); speechInit(); syncLoadCfg();
  gmCheckTrophies(); drawSyncPill(); drawThemeBtn();
  route();
  if (sync.token && sync.auto) syncNow("on open");
  setInterval(function () { if (sync.token && sync.auto && !sync.busy) syncNow("every 5 minutes"); }, 5 * 60 * 1000);
  window.addEventListener("online", function () { if (sync.token && sync.auto) syncNow("back online"); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && sync.token && sync.auto) syncNow("back to the tab"); });
  window.addEventListener("storage", function (e) { if (e.key === POKER_KEYS.course || e.key === "math340-progress-v1") { if (view === "home" || view === "school" || view === "poker") route(); } });
})();
