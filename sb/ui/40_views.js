/* ============================================================
   UI 4: the router, the navigation, Today, the skills overview,
   and the course hub (path, reader, practice, level, library)
   ============================================================ */
var view = "home", curHash = "", openLayer = {};
var VIEWS = ["home", "calendar", "skills", "c", "poker", "school", "quant", "library", "sync", "drill", "method"];
var ICON = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  skills: '<svg viewBox="0 0 24 24"><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 17.2c5-1 3-6.4 8-9.8"/><path d="M4 6h4M6 4v4"/></svg>',
  school: '<svg viewBox="0 0 24 24"><path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5"/><path d="M21 9v6"/></svg>',
  library: '<svg viewBox="0 0 24 24"><path d="M4 5.5C6.5 4 9.5 4 12 5.5v14C9.5 18 6.5 18 4 19.5z"/><path d="M20 5.5C17.5 4 14.5 4 12 5.5v14c2.5-1.5 5.5-1.5 8 0z"/></svg>'
};
function drawNav() {
  var n = $("nav");
  if (!n.dataset.built) {
    n.dataset.built = "1";
    n.innerHTML = [["home", "Today"], ["calendar", "Calendar"], ["skills", "Skills"], ["school", "School"], ["library", "Library"]].map(function (x) { return '<a class="navi" id="nav_' + x[0] + '" href="#/' + x[0] + '" aria-label="' + x[1] + '">' + ICON[x[0]] + '<span>' + x[1] + '</span><i class="nbadge" hidden></i></a>'; }).join("");
  }
  var active = view === "c" || view === "poker" || view === "quant" || view === "drill" ? "skills" : view === "method" || view === "sync" ? "library" : view;
  ["home", "calendar", "skills", "school", "library"].forEach(function (v) { var a = $("nav_" + v); if (a) { if (active === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); } });
  var due = dueIds(null).length + pokerRead().due, b = $("nav_skills").querySelector(".nbadge"); b.hidden = !due; b.textContent = due; b.title = due + " reviews due";
  var sd = 0; SCHOOL_COURSES.forEach(function (sc) { var R = schoolRead(sc); sd += R.due + R.misses; });
  var sb = $("nav_school").querySelector(".nbadge"); sb.hidden = !sd; sb.textContent = sd; sb.className = "nbadge red"; sb.title = sd + " school items due";
}
window.addEventListener("hashchange", function () { if (location.hash !== curHash) route(); });
function route() {
  var parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (!parts.length) parts = ["home"];
  if (VIEWS.indexOf(parts[0]) < 0) parts = ["home"];
  view = parts[0]; curHash = "#/" + parts.join("/");
  if (view !== "drill") { if (sess || cp) { sess = null; cp = null; } q = null; cancelAnimationFrame(raf); }
  if (view !== "c" || parts[2] !== "apply") game = game && game.over ? null : game;
  schoolLeave();
  /* PokerPro is already on screen: steer it to the new page rather than reloading it */
  if (view === "poker" && pokerSteer(parts.slice(1))) { drawNav(); drawGamePill(); return; }
  var main = $("main"); main.innerHTML = ""; main.className = "wrap v-" + view;
  try {
    if (view === "home") drawHome(main);
    else if (view === "calendar") drawCalendar(main, parts[1] || "week");
    else if (view === "skills") drawSkills(main);
    else if (view === "c") drawCourse(main, parts[1], parts[2] || "learn", parts[3]);
    else if (view === "poker") drawPoker(main, parts.slice(1));
    else if (view === "school") drawSchool(main, parts[1], parts[2]);
    else if (view === "quant") drawQuant(main, parts[1]);
    else if (view === "library") drawLibrary(main, parts[1] || "all");
    else if (view === "method") drawMethod(main);
    else if (view === "sync") drawSync(main);
    else if (view === "drill") drawDrill(main);
  } catch (e) { main.innerHTML = '<div class="empty">Something went wrong drawing this page: ' + esc(e.message) + '. <a href="#/home">Back to Today</a></div>'; if (window.console) console.error(e); }
  drawNav(); drawGamePill();
  if (view !== "drill") window.scrollTo(0, 0);
  /* keyboard and screen-reader users land on the new view (main has tabindex=-1), unless the view already focused a control */
  if (!main.contains(document.activeElement)) { try { main.focus({ preventScroll: true }); } catch (e) { main.focus(); } }
}
function go(h) { location.hash = h; }

/* ============================================================ TODAY ============================================================ */
var TRACK_COLOR = { poker: "var(--gold)", chess: "var(--green)", sv: "var(--blue)", he: "var(--accent)", es: "var(--red)", quant: "var(--purple)" };
function trackColor(k) { return k.indexOf("school:") === 0 ? "var(--purple)" : TRACK_COLOR[k] || "var(--ink3)"; }
function trackName(k) { if (k === "poker") return "Poker"; if (k.indexOf("school:") === 0) { var sc = SCHOOL_COURSES.filter(function (x) { return "school:" + x.id === k; })[0]; return sc ? sc.code : k; } return COURSES[k] ? COURSES[k].name : k; }
function blockLabel(b) { return b.school || b.label.indexOf(":") > 0 && b.label.indexOf(trackName(b.skill)) === 0 ? b.label : trackName(b.skill) + ": " + b.label; }
function trackHref(k) { if (k === "poker") return "#/poker"; if (k.indexOf("school:") === 0) return "#/school/" + k.slice(7); return "#/c/" + k; }
function drawHome(box) {
  var now = Date.now(), hr = new Date(now).getHours(), plan = planToday(now);
  planRemember(plan);
  box.appendChild(el("div", "hgreet", "<h1>" + (hr < 5 ? "Late night" : hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening") + "</h1><p>" + new Date(now).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) + (plan.why ? " · " + plan.why : "") + "</p>"));
  var hero = el("div", "hero");
  var live = plan.blocks.filter(function (b) { return !b.deferred; }), todo = live.filter(function (b) { return !b.done; });
  var mins = live.reduce(function (a, b) { return a + (b.kind === "homework" ? 0 : b.min); }, 0);
  var nextB = todo[0];
  hero.innerHTML = '<div class="kick">Today\'s plan · ' + Math.round(plan.doneTotal) + ' of ' + plan.budget + ' minutes used</div>' +
    (nextB ? '<h2>Next: ' + esc(blockLabel(nextB)) + '</h2><p>' + esc(nextB.why) + (nextB.at ? ' <span style="color:var(--faint)">Suggested ' + plFmt(nextB.at.f) + '–' + plFmt(nextB.at.t) + '.</span>' : '') + '</p>'
      : live.length ? '<h2>Plan done for today</h2><p>Everything the day asked for is finished. Anything more is a bonus; the gap before tomorrow is part of the method.</p>' : '<h2>Nothing scheduled yet</h2><p>Set your week in the Calendar and start a skill from the Skills tab; the plan fills itself from what is due.</p>');
  var row = el("div", "row");
  if (nextB) row.appendChild(btn("Start: " + blockLabel(nextB).split(":")[0], "go", function () { if (nextB.href.indexOf("#/") === 0 || nextB.href.indexOf("#") === 0) go(nextB.href); else location.href = nextB.href; }));
  row.appendChild(btn("Calendar", "ghost", function () { go("#/calendar"); }));
  var allDue = dueIds(null).length; if (allDue) row.appendChild(btn("All reviews (" + allDue + ")", "ghost", function () { startSession("due", null); }));
  hero.appendChild(row); box.appendChild(hero);

  /* the plan, block by block */
  var P = el("div", "panel");
  P.innerHTML = '<div class="ph"><h3>The day, in order</h3><span>' + plural(live.length, "block") + ' · ' + mins + ' min · schoolwork first, reviews before new material</span></div>';
  var list = el("div", "plan");
  if (!plan.blocks.length) list.appendChild(el("div", "empty", "No blocks today. Either nothing is due and every path is finished, or the calendar has no free time today."));
  plan.blocks.forEach(function (b) {
    var a = el("a", "pblock" + (b.done ? " done" : "") + (b.deferred ? " deferred" : "")); a.href = b.href || "#/home";
    a.innerHTML = '<div class="pbm"><b>' + b.min + '</b><i>min</i></div><div class="pbt"><b><span class="dot" style="background:' + trackColor(b.skill) + '"></span>' + esc(blockLabel(b)) + (b.school ? ' <span class="tag school">school</span>' : '') + '</b><span class="why">' + esc(b.why) + '</span></div><div class="pbat">' + (b.at ? '<span><b>' + plFmt(b.at.f) + '</b>–' + plFmt(b.at.t) + '</span>' : b.deferred ? "<span>later</span>" : "<span>any time</span>") + '</div>';
    var mk = el("button", "chip", b.done ? "✓ done" : "mark done"); mk.type = "button"; mk.style.cssText = "font-size:11px"; mk.onclick = function (e) { e.preventDefault(); planMark(b); route(); };
    a.querySelector(".pbat").appendChild(mk);
    list.appendChild(a);
  });
  P.appendChild(list);
  P.appendChild(el("p", "pnote", "Budget today: <b>" + plan.budget + " min</b> (" + (plan.why || "your normal cap") + "). The planner puts school items first, then reviews by how overdue they are, then at most two new lessons, then one applied session. Edit the week, the cap and the priorities in <a href='#/calendar/settings'>Calendar › Settings</a>."));
  box.appendChild(P);

  /* every track at a glance */
  var grid = el("div", "cgrid");
  var tracks = [];
  SCHOOL_COURSES.forEach(function (sc) { var R = schoolRead(sc), dm = schDemand(sc, R, now); tracks.push({ k: "school:" + sc.id, glyph: sc.glyph, name: sc.code + " · " + sc.name, lv: dm.exam ? dm.exam.label.split("·")[0].trim() + " in " + dm.exam.days + " d" : "week " + dm.week, meta: (R.has ? R.due + " cards due · " + R.misses + " to redo · " + Math.round(100 * R.mastery) + "% mastered" : "no progress saved yet"), due: R.due + R.misses, bar: R.mastery, color: sc.color }); });
  tracks.push({ k: "poker", glyph: "♠", name: "Poker", lv: courseLevel("poker").name, meta: pokerRead().lessons + " of " + POKER_TOTAL_LESSONS + " lessons · " + pokerRead().due + " reviews due", due: pokerRead().due, bar: pokerRead().lessons / POKER_TOTAL_LESSONS, color: TRACK_COLOR.poker });
  COURSE_ORDER.forEach(function (cid) { var c = COURSES[cid], lv = courseLevel(cid), d = dueIds(cid).length; tracks.push({ k: cid, glyph: c.glyph, name: c.name, lv: lv.name, meta: courseLessonsPassed(c) + " of " + courseLessonsTotal(c) + " lessons · " + d + " reviews due", due: d, bar: courseLessonsPassed(c) / courseLessonsTotal(c), color: c.color }); });
  var ql = qtLevel(HUB.quant); tracks.push({ k: "quant", glyph: "Σ", name: "Quant games", lv: ql.name, meta: qtPlayedToday(HUB.quant, todayKey(), dayKey) ? "played today" : "2 minutes, no stakes: a warm-up", due: 0, bar: ql.score / 100, color: TRACK_COLOR.quant });
  tracks.forEach(function (t) {
    var a = el("a", "ccard"); a.href = t.k === "quant" ? "#/quant" : trackHref(t.k); a.style.borderTopColor = t.color;
    a.innerHTML = '<div class="cg">' + t.glyph + '</div><b>' + esc(t.name) + '</b><div class="lv">' + esc(t.lv) + '</div><div class="cm">' + esc(t.meta) + '</div><div class="pbar"><span style="width:' + Math.round(100 * Math.min(1, t.bar)) + '%"></span></div>' + (t.due ? '<span class="cdue nbadge">' + t.due + '</span>' : "");
    grid.appendChild(a);
  });
  box.appendChild(grid);

  /* activity and streak */
  var g2 = el("div", "grid2");
  var days = [], mx = 0, byDay = [];
  for (var i = 20; i >= 0; i--) { var d = plog[dayKey(now - i * SRS_DAY)], m = d ? d.s / 60 : 0; var pk = pokerRead().plog[dayKey(now - i * SRS_DAY)]; if (pk) m += pk.s / 60; days.push(m); if (m > mx) mx = m; }
  var st = gmStreak(plog, now), tot = Object.keys(plog).reduce(function (a, k) { return a + plog[k].s; }, 0);
  var ac = el("div", "panel");
  ac.innerHTML = '<div class="ph"><h3>Last 3 weeks</h3><span>' + (mx ? "best day " + Math.round(mx) + " min" : "minutes studied") + '</span></div><div class="tspark">' + days.map(function (m, i) { return '<i class="' + (m > 0 ? "on" : "") + (i === 20 ? " now" : "") + '" style="height:' + (mx ? Math.max(4, 100 * m / mx) : 4) + '%" title="' + Math.round(m) + ' min"></i>'; }).join("") + '</div><div class="tsparkcap"><span>3 weeks ago</span><span>today</span></div>' +
    '<div class="stats"><div class="stat"><b>' + st.days + '</b><span>day streak</span></div><div class="stat"><b>' + hubTotalXP().toLocaleString() + '</b><span>XP</span></div><div class="stat"><b>' + fmtDur(tot) + '</b><span>all time</span></div><div class="stat"><b>' + esc(rankIn(SB_RANKS, hubTotalXP()).name) + '</b><span>rank</span></div></div>' +
    '<p class="pnote">The streak counts days you hit your XP goal (' + HUB.gstate.goal + '). Every 7 goal days earn a freeze, so one missed day does not wipe out weeks. ' + (st.freezes ? st.freezes + " freeze" + (st.freezes > 1 ? "s" : "") + " banked." : "") + '</p>';
  g2.appendChild(ac);
  /* coming up */
  var items = allSkillIds().map(function (id) { return { skill: skInfo(id).course, due: skills[id].due }; });
  var fc = plForecast(items, now, 7, dayKey);
  var cu = el("div", "panel");
  cu.innerHTML = '<div class="ph"><h3>Reviews coming up</h3><a href="#/calendar/forecast">Full forecast ›</a></div><div class="clist">' + fc.map(function (r, i) { return '<div><span>' + (i === 0 ? "Today" : i === 1 ? "Tomorrow" : new Date(now + i * SRS_DAY).toLocaleDateString(undefined, { weekday: "long" })) + '<small>' + Object.keys(r.by).map(function (k) { return r.by[k] + " " + trackName(k); }).join(", ") + '</small></span><b' + (i === 0 && r.total ? ' class="due"' : '') + '>' + r.total + '</b></div>'; }).join("") + '</div><p class="pnote">The forecast is exact: every skill on the schedule has a due date, and new lessons add to it. Keep the daily number flat by keeping new material capped.</p>';
  g2.appendChild(cu);
  box.appendChild(g2);
  var foot = el("p", "hfoot"); foot.innerHTML = '<span id="savetag"></span> · <a href="#/sync">Sync, backup and install</a> · <a href="#/method">How this works</a>'; box.appendChild(foot); drawSaveTag();
}

/* ============================================================ SKILLS OVERVIEW ============================================================ */
function drawSkills(box) {
  box.innerHTML = '<div class="vhead"><div><h1>Skills</h1><p>Every track, its level, and what it needs today. Each has the same shape: learn the theory, drill it on a schedule, apply it in a simulated setting, and a level measured from what you actually do.</p></div></div>';
  var grid = el("div", "cgrid"); grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(290px,1fr))";
  function card(k, glyph, name, tagline, lv, lines, color, href, due) {
    var a = el("a", "ccard"); a.href = href; a.style.borderTopColor = color;
    a.innerHTML = '<div class="cg">' + glyph + '</div><b>' + esc(name) + '</b><div class="lv">' + esc(lv.name) + (lv.count > 1 ? ' · level ' + (lv.index + 1) + ' of ' + lv.count : '') + '</div><div class="cm">' + esc(tagline) + '</div><div class="lvstrip">' + Array.apply(null, Array(lv.count || 1)).map(function (_, i) { return '<i class="' + (i <= lv.index && lv.name !== "Not yet placed" && lv.name !== "Beginner" || (i < lv.index) ? "on" : "") + '"></i>'; }).join("") + '</div><div class="cm" style="margin-top:8px">' + lines.map(esc).join(" · ") + '</div>' + (due ? '<span class="cdue nbadge">' + due + '</span>' : "");
    grid.appendChild(a);
  }
  var P = pokerRead();
  card("poker", "♠", "Poker", "Playing optimally: the maths from pot odds to CFR solvers, a graded table.", courseLevel("poker"), [P.lessons + " of " + POKER_TOTAL_LESSONS + " lessons", P.due + " due", P.auto + " skills automatic"], TRACK_COLOR.poker, "#/poker", P.due);
  COURSE_ORDER.forEach(function (cid) { var c = COURSES[cid], d = dueIds(cid).length; card(cid, c.glyph, c.name, c.tagline, courseLevel(cid), [courseLessonsPassed(c) + " of " + courseLessonsTotal(c) + " lessons", d + " due", courseSkillIds(cid).filter(function (id) { return skills[id].box >= 6; }).length + " automatic"], c.color, "#/c/" + cid, d); });
  var ql = qtLevel(HUB.quant); card("quant", "Σ", "Quant games", "Two-minute arithmetic, sequences, estimation, percentages and odds. No stakes.", ql, [plural((HUB.quant.runs || []).length, "run"), "sprint tier " + (qtTier(HUB.quant, "sprint") + 1)], TRACK_COLOR.quant, "#/quant", 0);
  box.appendChild(grid);
  var T = sbTrophies(trophySummary()), got = T.filter(function (t) { return t.got; });
  var tp = el("div", "panel"); tp.style.marginTop = "16px";
  tp.innerHTML = '<div class="ph"><h3>Trophies</h3><span>' + got.length + ' of ' + T.length + '</span></div><div class="cgrid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr));margin:0">' + T.map(function (t) { return '<div class="ccard" style="border-top-color:' + (t.got ? "var(--gold)" : "var(--line)") + ';opacity:' + (t.got ? 1 : .6) + '"><b>' + (t.got ? "🏆 " : "") + esc(t.name) + '</b><div class="cm">' + esc(t.about) + '</div><div class="pbar gold" style="margin-top:8px"><span style="width:' + Math.round(100 * t.cur / t.max) + '%"></span></div><div class="cm" style="margin-top:4px">' + t.cur + ' / ' + t.max + '</div></div>'; }).join("") + '</div>';
  box.appendChild(tp);
}

/* ============================================================ COURSE HUB ============================================================ */
function drawCourse(box, cid, tab, arg) {
  var c = COURSES[cid]; if (!c) { box.innerHTML = '<div class="empty">No such skill. <a href="#/skills">Skills</a></div>'; return; }
  if (tab === "learn" && arg && c.lessonById[arg]) { drawReader(box, c, c.lessonById[arg]); return; }
  var lv = courseLevel(cid), due = dueIds(cid).length;
  var head = el("div", "chead");
  head.innerHTML = '<div class="cg" style="color:' + c.color + '">' + c.glyph + '</div><div><div class="crumbs"><a href="#/skills">Skills</a><span>›</span>' + esc(c.name) + '</div><h1>' + esc(c.name) + '</h1><p>' + esc(c.blurb) + '</p><div class="cmeta"><span>Level: <b>' + esc(lv.name) + '</b></span><span>Lessons: <b>' + courseLessonsPassed(c) + ' / ' + courseLessonsTotal(c) + '</b></span><span>Due today: <b>' + due + '</b></span><span>XP: <b>' + xpOf(plog, cid).toLocaleString() + '</b> · ' + esc(rankIn(c.ranks, xpOf(plog, cid)).name) + '</span></div></div>';
  box.appendChild(head);
  var tabs = [["learn", "Learn"], ["practice", "Practice"], ["apply", "Apply"], ["level", "Level"], ["library", "Library"]];
  var nav = el("nav", "subnav"); nav.innerHTML = tabs.map(function (t) { return '<a href="#/c/' + cid + '/' + t[0] + '"' + (tab === t[0] ? ' aria-current="page"' : '') + '>' + t[1] + (t[0] === "practice" && due ? ' <span class="nbadge">' + due + '</span>' : '') + '</a>'; }).join("");
  box.appendChild(nav);
  var body = el("div"); box.appendChild(body);
  if (tab === "learn") drawPath(body, c);
  else if (tab === "practice") drawPractice(body, c, arg);
  else if (tab === "apply") drawApply(body, c, arg);
  else if (tab === "level") drawLevel(body, c);
  else if (tab === "library") drawCourseLibrary(body, c, arg);
}

function drawPath(box, c) {
  var nx = nextLesson(c), total = courseLessonsTotal(c), done = courseLessonsPassed(c);
  if (nx) { var pn = el("div", "pathnext"); pn.innerHTML = '<span>Next up</span><b>' + esc(nx.title) + '</b><em>Stage ' + nx.layer + ' · ' + lessonMinutes(nx) + ' min read, then a ' + nx.of + '-question checkpoint</em>'; pn.appendChild(btn("Open the lesson", "go", function () { go("#/c/" + c.id + "/learn/" + nx.id); })); box.appendChild(pn); }
  if (done < total - 3) {
    var pb = el("div", "placebox", "<b>Already know some of this?</b><span>Take the placement test: a few questions per stage, and every stage you already know is marked passed and put on your review schedule so it stays fresh. Stop whenever you like, and the path picks up exactly where you landed.</span>");
    pb.appendChild(btn("Take the placement test", "ghost", function () { var first = c.stages.filter(function (S) { return S.lessons.some(function (L) { return passable(L) && !passed(c.id, L.id); }); })[0]; startPlacement(c.id, first ? first.n : 0); }));
    box.appendChild(pb);
  }
  var list = el("ol", "stages"), open = openLayer[c.id] != null ? openLayer[c.id] : (nx ? nx.layer : 0);
  c.stages.forEach(function (S) {
    var dn = stageDone(c, S), ct = S.lessons.length, isCur = nx ? nx.layer === S.n : false, isOpen = open === S.n;
    var li = el("li", "stage" + (dn === ct ? " done" : "") + (isCur ? " cur" : ""));
    var hb = el("button", "shead"); hb.type = "button"; hb.setAttribute("aria-expanded", isOpen);
    hb.innerHTML = '<span class="snum">' + (dn === ct ? "✓" : S.n) + '</span><span class="smain"><b>' + esc(S.title) + '</b><span>' + esc(S.blurb) + '</span></span><span class="sside"><span class="sprog"><i style="width:' + (100 * dn / ct).toFixed(0) + '%"></i></span><small>' + dn + '/' + ct + (S.sub ? ' · ' + esc(S.sub) : '') + '</small></span><span class="lcar">' + (isOpen ? "−" : "+") + '</span>';
    hb.onclick = function () { openLayer[c.id] = isOpen ? -1 : S.n; route(); };
    li.appendChild(hb);
    if (isOpen) {
      var ul = el("div", "slessons");
      S.lessons.forEach(function (L, i) {
        var st = passed(c.id, L.id) ? "done" : nx && L.id === nx.id ? "next" : !passable(L) ? "lab" : "";
        var a = el("a", "lrow " + st); a.href = "#/c/" + c.id + "/learn/" + L.id;
        a.innerHTML = '<span class="lic">' + (st === "done" ? "✓" : st === "lab" ? "◇" : S.n + "." + (i + 1)) + '</span><span class="lmain"><b>' + esc(L.title) + (lessonDue(c, L) ? ' <em class="duechip">review due</em>' : "") + '</b><span>' + esc(L.gist) + '</span></span><span class="lmeta">' + lessonMinutes(L) + ' min<br><small>' + (st === "done" ? "passed" : st === "lab" ? "no checkpoint" : st === "next" ? "next up" : L.vocab ? "words" : "checkpoint") + '</small></span>';
        ul.appendChild(a);
      });
      li.appendChild(ul);
    }
    list.appendChild(li);
  });
  box.appendChild(list);
  box.appendChild(el("details", "help", "<summary>How a lesson works</summary><ol><li><b>Read</b> the lesson: the idea, the rule in a box, worked examples, the warnings, and how the drill asks it.</li><li><b>Try one</b> question at the bottom before the checkpoint, free, to see the drill's shape.</li><li><b>Pass the checkpoint</b> and every skill the lesson teaches (its drill, its words, its rule) joins your review schedule, due tomorrow.</li><li><b>Reviews</b> then come on the days the schedule says; a skill climbs a box only on a due day with clean, fast answers. That is what makes it permanent.</li></ol>"));
}

/* ---- the reader ---- */
var SEC_NAME = { idea: "The idea", formula: "Formula", ex: "Worked examples", warn: "Watch out", key: "Remember", how: "In the drill", tbl: "Reference", board: "Position", verse: "The text", try: "Try one", fx: "Reference cards" };
function drawReader(box, c, L) {
  var r = el("article", "reader"), S = c.stages[L.layer], ids = lessonSkillIds(c, L), isPassed = passed(c.id, L.id);
  var h = el("div", "rhead");
  h.innerHTML = '<nav class="crumbs"><a href="#/skills">Skills</a><span>›</span><a href="#/c/' + c.id + '">' + esc(c.name) + '</a><span>›</span><a href="#/c/' + c.id + '" data-stage="' + S.n + '">Stage ' + S.n + ' · ' + esc(S.title) + '</a><span>›</span>Lesson ' + (L.idx + 1) + ' of ' + L.of_n + '</nav><h1>' + esc(L.title) + '</h1><p class="rsub">' + esc(L.sub || "") + '</p><p class="rgist">' + esc(L.gist) + '</p><div class="rmeta"><span>' + lessonMinutes(L) + ' min read</span>' + (passable(L) ? '<span>Checkpoint: ' + L.pass + ' of ' + L.of + '</span><span>' + plural(ids.length, "skill") + ' on the schedule when passed</span>' : '<span>No checkpoint: read and use</span>') + (isPassed ? '<span class="ok">✓ Passed</span>' : "") + '</div>';
  h.querySelector("[data-stage]").onclick = function () { openLayer[c.id] = S.n; };
  r.appendChild(h);
  var body = el("div", "rbody"), secs = [], first = {};
  function mark(kind, node) { if (first[kind]) return; first[kind] = 1; node.id = "sec-" + kind; secs.push(kind); }
  L.blocks.forEach(function (b) { var n = drawBlock(b, c); var kind = b.t === "p" ? "idea" : b.t === "rule" ? "formula" : b.t; if (SEC_NAME[kind]) mark(kind, n); body.appendChild(n); });
  var fxs = c.formulas.filter(function (f) { return f.lesson === L.id; });
  if (fxs.length) { var fs = el("div", "fxsec"); fs.innerHTML = '<h3 class="sech">Reference cards</h3>' + fxs.map(function (f) { return fxCard(f, c, false); }).join(""); mark("fx", fs); body.appendChild(fs); }
  if (passable(L) && L.mode !== "quiz") { var tc = el("div", "trycard"); mark("try", tc); body.appendChild(tc); miniQ(tc, c, L); }
  r.appendChild(body);
  var jump = el("nav", "rjump"); jump.innerHTML = secs.map(function (k) { return '<a href="#sec-' + k + '" data-k="' + k + '">' + SEC_NAME[k] + '</a>'; }).join("");
  jump.onclick = function (e) { var a = e.target.closest("a[data-k]"); if (!a) return; e.preventDefault(); var t = $("sec-" + a.dataset.k); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 110, behavior: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
  if (secs.length > 1) r.insertBefore(jump, body);
  glossify(body, c, L.id);
  var f = el("div", "rfoot"), i = c.lessonList.indexOf(L), prev = c.lessonList[i - 1], nx = c.lessonList[i + 1];
  if (passable(L)) {
    var cpBox = el("div", "rcp"); cpBox.innerHTML = '<b>' + (isPassed ? "Passed. Run the checkpoint again any time." : "Ready? Pass the checkpoint to put this on your schedule.") + '</b><span>' + L.of + ' questions, ' + L.pass + ' right to pass. Timed, but only accuracy counts here.' + (L.vocab ? " The words are asked by recognition: what does it mean, which word is it." : "") + '</span>';
    cpBox.appendChild(btn(isPassed ? "Retake checkpoint" : "Start checkpoint", "go", function () { startCp(c.id, L.id); }));
    if (!isPassed) cpBox.appendChild(el("span", "xpchip", "+" + GM_XP_LESSON + " XP"));
    f.appendChild(cpBox);
    var rec = ids.map(function (id) { var s = skills[id]; return s ? { id: id, s: s } : null; }).filter(Boolean);
    var rb = el("div", "rrec", "<b>Your record</b>" + (rec.length ? (rec.length > 6 ? "<span><b>" + rec.length + " skills</b> from this lesson are on your schedule; " + rec.filter(function (x) { return x.s.box >= 3; }).length + " solid or better, " + rec.filter(function (x) { return Date.now() >= x.s.due; }).length + " due now.</span>" : rec.map(function (x) { var rr = srsRecent(x.s, 10); return "<span><b>" + esc(skillName(x.id)) + "</b>: " + srsLevel(x.s) + ", box " + x.s.box + (rr.n ? ", " + Math.round(100 * rr.acc) + "% recently" : "") + (Date.now() >= x.s.due ? ", <b>due now</b>" : ", next in " + fmtIn(x.s.due - Date.now())) + "</span>"; }).join("")) : "<span>Nothing yet: pass the checkpoint to put " + plural(ids.length, "skill") + " on your review schedule.</span>"));
    var rr2 = el("div", "row"); rr2.style.marginTop = "8px";
    if (ids.length) rr2.appendChild(btn("Drill this lesson", "ghost sm", function () { startSession("extra", c.id, ids); }));
    rb.appendChild(rr2); f.appendChild(rb);
  } else if (L.apply) { var ap = el("div", "rcp", "<b>This one is applied.</b><span>Use it on the Apply tab.</span>"); ap.appendChild(btn("Go to Apply", "go", function () { go("#/c/" + c.id + "/apply"); })); f.appendChild(ap); }
  else f.appendChild(el("div", "rcp", "<b>No checkpoint on this one.</b><span>Read it, keep it, come back to it.</span>"));
  var pn = el("div", "rpn"); pn.innerHTML = (prev ? '<a href="#/c/' + c.id + '/learn/' + prev.id + '"><small>‹ Previous</small>' + esc(prev.title) + '</a>' : '<span></span>') + (nx ? '<a class="nx" href="#/c/' + c.id + '/learn/' + nx.id + '"><small>Next ›</small>' + esc(nx.title) + '</a>' : '<a class="nx" href="#/c/' + c.id + '"><small>Done</small>Back to the path</a>');
  f.appendChild(pn); r.appendChild(f); box.appendChild(r);
}
function drawBlock(b, c) {
  if (b.t === "p") { var p = el("p", "prose" + (b.lang === "he" ? " rtl" : b.lang ? " l2" : ""), b.x); if (b.lang) { var sb = btn("🔊", "ghost sm", function () { speak(b.x, LG_LANG[b.lang].code, 0.85); }); sb.setAttribute("aria-label", "Listen"); sb.style.cssText = "margin-left:8px;min-height:28px;padding:2px 8px"; p.appendChild(sb); } return p; }
  if (b.t === "warn") return el("div", "warn", b.x);
  if (b.t === "key") { var k = el("div", "keybox"); k.innerHTML = "<b>Commit this</b><span>" + b.x + "</span>"; return k; }
  if (b.t === "rule") { var r = el("div", "rule"); r.innerHTML = "<pre>" + esc(b.x) + "</pre>" + (b.note ? "<small>" + b.note + "</small>" : ""); return r; }
  if (b.t === "tbl") { var w = el("div"), t = el("table", "tbl" + (b.rtl ? " rtl" : "")); t.innerHTML = "<thead><tr>" + b.head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" + b.rows.map(function (row) { return "<tr>" + row.map(function (cell, i) { return "<td" + (b.rtl && i === 0 ? " class='rtl'" : "") + ">" + cell + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody>"; w.appendChild(t); if (b.caption) w.appendChild(el("div", "cap", b.caption)); return w; }
  if (b.t === "ex") { var e = el("div", "ex"); e.appendChild(el("h4", null, b.title)); var body = el("div", "exb"); if (b.facts) { var f = el("dl", "facts"); b.facts.forEach(function (pr) { f.innerHTML += "<div class='fact'><dt>" + pr[0] + "</dt><dd>" + pr[1] + "</dd></div>"; }); body.appendChild(f); } var ol = el("ol", "steps"); b.steps.forEach(function (x) { ol.appendChild(el("li", null, x)); }); body.appendChild(ol); if (b.punch) body.appendChild(el("div", "punch", b.punch)); e.appendChild(body); return e; }
  if (b.t === "how") { var hw = el("div", "how"); hw.innerHTML = "<h4>In the drill" + (b.drill ? " <span>· " + esc(b.drill) + "</span>" : "") + "</h4>" + (b.ask ? '<p class="howask">“' + b.ask + '”</p>' : "") + '<ol class="howsteps">' + b.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>" + (b.tip ? '<div class="tip"><b>Tip</b>' + b.tip + "</div>" : ""); return hw; }
  if (b.t === "board") { var bw = el("div", "bwrap"); bw.appendChild(boardWidget(b.fen, { mark: b.mark, size: "sm", flip: b.flip })); if (b.caption) bw.appendChild(el("div", "cap", b.caption)); return bw; }
  if (b.t === "verse") { var v = b.v, vd = el("div", "verse"); vd.innerHTML = '<div class="vt">' + esc(v.text) + '<span class="vn">' + v.v + '</span></div><div class="vw">' + v.words.map(function (w) { return "<span>" + esc(w[0]) + "<small>" + esc(w[1]) + "</small></span>"; }).join("") + '</div><div class="vg">' + esc(v.gloss) + '</div>'; var sb2 = btn("🔊 Hear the verse", "ghost sm", function () { speak(v.text, "he-IL", 0.8); }); sb2.style.marginTop = "8px"; vd.appendChild(sb2); return vd; }
  return el("div");
}
function fxCard(f, c, compact) {
  return '<div class="fx"><div class="fxh"><b>' + esc(f.name) + '</b>' + (compact ? '<a href="#/c/' + c.id + '/learn/' + f.lesson + '">' + esc((c.lessonById[f.lesson] || {}).title || "") + ' ›</a>' : '<span style="font-size:12px;color:var(--faint)">' + esc(f.topic) + '</span>') + '</div><div class="fxm">' + esc(f.f) + '</div>' +
    (f.vars && f.vars.length ? '<dl class="fxv">' + f.vars.map(function (v) { return "<div><dt>" + esc(v[0]) + "</dt><dd>" + esc(v[1]) + "</dd></div>"; }).join("") + "</dl>" : "") +
    (f.anchors && f.anchors.length ? '<div class="fxa">' + f.anchors.map(function (a) { return "<span><b>" + esc(a[0]) + "</b>" + (a[1] ? " " + esc(a[1]) : "") + "</span>"; }).join("") + "</div>" : "") + (f.note ? '<p class="fxnote">' + esc(f.note) + "</p>" : "") + "</div>";
}
function glossify(root, c, lessonId) {
  var G = c.glossary || []; if (!G.length) return;
  var terms = []; G.forEach(function (g) { [g[0]].concat(g[1] || []).forEach(function (t) { terms.push({ t: t, g: g }); }); });
  terms.sort(function (a, b) { return b.t.length - a.t.length; });
  var re = new RegExp("\\b(" + terms.map(function (x) { return x.t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")\\b", "i");
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), nodes = [], seen = {};
  while (walker.nextNode()) { var nd = walker.currentNode; if (nd.parentNode.closest(".rule,.keybox,.fx,.how,.board,.verse,table,.trycard")) continue; nodes.push(nd); }
  nodes.forEach(function (nd) {
    var m = re.exec(nd.nodeValue); if (!m) return;
    var term = terms.filter(function (x) { return x.t.toLowerCase() === m[1].toLowerCase(); })[0]; if (!term || seen[term.g[0]] || term.g[3] === lessonId) return;
    seen[term.g[0]] = 1;
    var span = el("span", "gl", m[1]); span.tabIndex = 0; span.dataset.def = term.g[2]; span.dataset.term = term.g[0];
    var after = nd.splitText(m.index); after.nodeValue = after.nodeValue.slice(m[1].length);
    nd.parentNode.insertBefore(span, after);
    span.onmouseenter = span.onfocus = function () { var tip = $("gltip"); tip.innerHTML = "<b>" + esc(span.dataset.term) + "</b>" + esc(span.dataset.def); tip.hidden = false; var rc = span.getBoundingClientRect(); tip.style.left = Math.max(8, Math.min(window.innerWidth - 300, rc.left)) + "px"; tip.style.top = (rc.bottom + 8) + "px"; };
    span.onmouseleave = span.onblur = function () { $("gltip").hidden = true; };
  });
}
function miniQ(box, c, L) {
  box.innerHTML = '<div class="ph"><h3>Try one</h3><span>free: it does not touch your schedule</span></div>';
  var qq = cpQuestion(c, L, { caps: capsFor(c.lang), box: 2 });
  var ask = el("div", "ask" + (qq.rtl && qq.kind !== "text" ? " rtl" : ""), qq.question); box.appendChild(ask);
  if (qq.speak) setTimeout(function () { speak(qq.speak.text, qq.speak.lang); }, 100);
  if (qq.board) box.appendChild(boardWidget(qq.board.fen, { flip: qq.board.flip, mark: qq.board.mark, size: "sm", interactive: qq.kind === "square" || qq.kind === "move", onSquare: function (sq) { done(gradeAnswer(qq, sq).ok, sq); }, onMove: function (m, S) { done(gradeAnswer(qq, chSan(S, m)).ok, chSan(S, m)); } }));
  var ctl = el("div", "row"); box.appendChild(ctl);
  function done(ok, said) { ctl.innerHTML = ""; var v = el("div", "verdict"); v.appendChild(el("span", "badge " + (ok ? "ok" : "no"), ok ? "Correct" : "Off")); v.appendChild(el("span", "said", "Answer <b>" + esc(qq.answer) + "</b> · you said " + esc(said))); box.appendChild(v); var ex = el("div", "expl" + (qq.rtl ? " rtl" : "")); (qq.explain || []).forEach(function (l) { ex.appendChild(el("p", null, l)); }); box.appendChild(ex); if (qq.speakAfter) speak(qq.speakAfter.text, qq.speakAfter.lang); var again = btn("Another", "ghost sm", function () { miniQ(box, c, L); }); again.style.marginTop = "10px"; box.appendChild(again); }
  if (qq.kind === "choice") { var opts = el("div", "opts" + (qq.rtl ? " rtl" : "")); qq.options.forEach(function (o) { opts.appendChild(btn(esc(o), "", function () { done(o === qq.answer, o); })); }); ctl.appendChild(opts); }
  else if (qq.kind === "text" || qq.kind === "num" || qq.kind === "speak") { var w = el("div", "entry"), inp = el("input"); inp.type = "text"; if (qq.rtl) inp.className = "rtl"; w.appendChild(inp); ctl.appendChild(w); ctl.appendChild(btn("Check", "", function () { var g = gradeAnswer(Object.assign({}, qq, { kind: qq.kind === "speak" ? "text" : qq.kind }), inp.value, c.lang); if (g) done(g.ok, inp.value); })); inp.onkeydown = function (e) { if (e.key === "Enter") { var g = gradeAnswer(Object.assign({}, qq, { kind: qq.kind === "speak" ? "text" : qq.kind }), inp.value, c.lang); if (g) done(g.ok, inp.value); } }; }
}

/* ---- practice ---- */
function drawPractice(box, c, sub) {
  var ids = courseSkillIds(c.id), due = dueIds(c.id), now = Date.now();
  var today = el("div", "hero");
  if (!ids.length) { today.innerHTML = '<div class="kick">Practice</div><h2>Nothing on the schedule yet</h2><p>Pass a lesson\'s checkpoint and its skills appear here with their first review tomorrow. Until then, free practice below is open to everything.</p>'; today.appendChild(btn("Go to the path", "go", function () { go("#/c/" + c.id); })); }
  else if (due.length) { today.innerHTML = '<div class="kick">Today in ' + esc(c.name) + '</div><h2>' + plural(due.length, "review") + ' due</h2><p>' + due.slice(0, 6).map(skillName).map(esc).join(", ") + (due.length > 6 ? " and " + (due.length - 6) + " more" : "") + '. About ' + Math.max(1, Math.round(dueMinutes(due))) + ' minutes, mixed, with a little from your other skills woven in. Reviews on their due day are what move a skill up.</p>'; var rw = el("div", "row"); rw.appendChild(btn("Start today's reviews", "go", function () { startSession("due", c.id); })); rw.appendChild(btn("Practise weakest", "ghost", function () { startSession("extra", c.id); })); today.appendChild(rw); }
  else { var soon = ids.slice().sort(function (a, b) { return skills[a].due - skills[b].due; })[0]; today.innerHTML = '<div class="kick">' + esc(c.name) + '</div><h2>All clear</h2><p>Next review: ' + esc(skillName(soon)) + ' in ' + fmtIn(skills[soon].due - now) + '. Extra practice keeps skills warm and fixes weak spots, but only a review on its due day moves a skill up.</p>'; var rw2 = el("div", "row"); rw2.appendChild(btn("Practise weakest", "go", function () { startSession("extra", c.id); })); var nx = nextLesson(c); if (nx) rw2.appendChild(btn("Next lesson: " + esc(nx.title), "ghost", function () { go("#/c/" + c.id + "/learn/" + nx.id); })); today.appendChild(rw2); }
  box.appendChild(today);
  /* free practice: pick drills */
  var fp = el("div", "panel"); fp.innerHTML = '<div class="ph"><h3>Free practice</h3><span>choose what to drill; weighted toward weak and due</span></div>';
  var modes = el("div", "modes");
  c.stages.forEach(function (S) {
    var row = el("div", "mrow"); row.appendChild(el("span", "mtag", "S" + S.n));
    var any = false;
    S.lessons.forEach(function (L) {
      if (!passable(L)) return;
      var m = L.mode === "quiz" ? "quiz:" + L.id : L.mode === "mixed" ? null : L.mode; if (!m) return;
      if (!L.vocab && m.indexOf("quiz:") < 0 && !c.drills[m]) return;
      any = true;
      var name = L.vocab ? L.title : (c.drills[m] ? c.drills[m].name : L.title);
      var b = el("button", "chip"); b.type = "button"; b.textContent = name; b.setAttribute("aria-pressed", freeSel.course === c.id && freeSel.modes[m] ? "true" : "false");
      b.onclick = function () { if (freeSel.course !== c.id) { freeSel.course = c.id; freeSel.modes = {}; } freeSel.modes[m] = !freeSel.modes[m]; b.setAttribute("aria-pressed", freeSel.modes[m] ? "true" : "false"); };
      row.appendChild(b);
    });
    if (any) modes.appendChild(row);
  });
  fp.appendChild(modes);
  var r3 = el("div", "row");
  r3.appendChild(btn("Drill the selected", "go", function () { if (freeSel.course !== c.id || !Object.keys(freeSel.modes).some(function (k) { return freeSel.modes[k]; })) { toast("Pick at least one drill first.", ""); return; } sess = null; cp = null; go("#/drill"); }));
  r3.appendChild(btn("Select all", "ghost sm", function () { freeSel.course = c.id; freeSel.modes = {}; modes.querySelectorAll(".chip").forEach(function (b) { b.setAttribute("aria-pressed", "true"); }); c.lessonList.forEach(function (L) { if (!passable(L)) return; var m = L.mode === "quiz" ? "quiz:" + L.id : L.mode === "mixed" ? null : L.mode; if (m) freeSel.modes[m] = true; }); }));
  fp.appendChild(r3);
  fp.appendChild(el("p", "pnote", "Free practice never moves a skill up (only a due-day review does) and pays less XP, but it is how you fix a weak spot and how you learn the drill's shape before the checkpoint."));
  box.appendChild(fp);
  /* the skills table */
  var sk = el("div", "panel"); sk.style.marginTop = "16px";
  var auto = ids.filter(function (id) { return skills[id].box >= 6; }).length;
  sk.innerHTML = '<div class="ph"><h3>Skills on the schedule</h3><span>' + ids.length + ' skills · ' + auto + ' automatic</span></div>';
  var boxes = [0, 0, 0, 0, 0, 0, 0, 0]; ids.forEach(function (id) { boxes[skills[id].box]++; });
  sk.innerHTML += '<div class="mbar">' + boxes.map(function (n, i) { return '<i class="b' + i + '" style="flex:' + (n || 0.001) + '" title="box ' + i + ': ' + n + '"></i>'; }).join("") + '</div><p class="pnote">Boxes 0–7, left to right: new, learning, familiar, solid, solid, fluent, automatic, automatic. The gaps between reviews are 1, 3, 7, 16, 35, 80 and 180 days.</p>';
  var cal = HUB.gstate.calib;
  if (cal && (cal.g[0] + cal.f[0] + cal.s[0]) >= 20) sk.innerHTML += '<p class="pnote"><b>Calibration:</b> when you said sure you were right ' + pct(cal.s[0] ? cal.s[1] / cal.s[0] : 0) + ' of the time (' + cal.s[0] + '), fairly sure ' + pct(cal.f[0] ? cal.f[1] / cal.f[0] : 0) + ' (' + cal.f[0] + '), guessing ' + pct(cal.g[0] ? cal.g[1] / cal.g[0] : 0) + ' (' + cal.g[0] + '). Sure should be above 90%.</p>';
  if (ids.length) {
    var tbl = el("div"); tbl.innerHTML = '<div class="skrow head"><span>skill</span><span>box</span><span>level</span><span class="nb">acc</span><span class="nb">pace</span><span class="du">next</span></div>';
    var show = ids.slice().sort(function (a, b) { return skills[a].due - skills[b].due; });
    var wordsHidden = 0;
    show.forEach(function (id) {
      var s = skills[id], i = skInfo(id), r = srsRecent(s, 10);
      if (i.kind === "word" && show.length > 40 && s.box >= 3 && now < s.due) { wordsHidden++; return; }
      var row = el("div", "skrow"); row.innerHTML = '<span class="nm" title="' + esc(i.name) + '">' + esc(i.name) + '</span><span class="lv">' + s.box + '</span><span class="lv">' + srsLevel(s) + '</span><span class="nb">' + (r.n ? Math.round(100 * r.acc) + "%" : "–") + '</span><span class="nb">' + (r.pace ? r.pace.toFixed(1) + "×" : "–") + '</span><span class="du' + (now >= s.due ? " due" : "") + '">' + (now >= s.due ? "due" : fmtIn(s.due - now)) + '</span>';
      tbl.appendChild(row);
    });
    if (wordsHidden) tbl.appendChild(el("p", "pnote", wordsHidden + " solid words not due are hidden to keep the list short."));
    sk.appendChild(tbl);
  }
  box.appendChild(sk);
}

/* ---- level ---- */
function drawLevel(box, c) {
  var lv = courseLevel(c.id);
  var hero = el("div", "lvhero");
  hero.innerHTML = '<div class="lvrate">' + (lv.score ? Math.round(lv.score) : "–") + '<small>' + (c.kind === "lang" ? "CEFR score" : "rating") + '</small></div><div><div class="lvname">' + esc(lv.name) + '</div><div class="lvabout">' + esc(lv.about) + '</div><div class="lvbar"><span style="width:' + Math.round(100 * Math.max(0, Math.min(1, lv.toNext))) + '%"></span></div><div class="lvcap">' + (lv.next ? Math.round(100 * lv.toNext) + "% of the way to " + esc(lv.next.name) : "the top level") + '</div></div>';
  box.appendChild(hero);
  var g = el("div", "grid2");
  var d = el("div", "panel"); d.innerHTML = '<div class="ph"><h3>What the level is made of</h3></div><div class="clist">' + lv.detail.map(function (x) { return "<div><span>" + esc(x[0]) + "</span><b>" + esc(String(x[1])) + "</b></div>"; }).join("") + '</div>' +
    (c.kind === "lang" ? '<p class="pnote">Vocabulary (log-scaled toward 5,000 known words), grammar lessons passed, applied skill (conversation, reading, listening, writing), and hours of study and logged immersion against the FSI estimate of ' + (c.need || 700) + ' hours. A1 at 10, A2 at 25, B1 at 42, B2 at 60, C1 at 78, C2 at 92.</p>' : c.kind === "chess" ? '<p class="pnote">The rating is the engine\'s grade of your last 100 moves in Play (quality 0–1 per move, pulled toward the middle while there are few). The tactics rating moves like Elo on every drill answer: mate in one ≈ 1000–1100, forks ≈ 1100, best move ≈ 1300, mate in two ≈ 1400.</p>' : "");
  g.appendChild(d);
  var lad = el("div", "panel"); var L = c.kind === "lang" ? LG_CEFR : c.kind === "chess" ? CHL_LEVELS : [];
  lad.innerHTML = '<div class="ph"><h3>The ladder</h3></div><div class="ladder">' + L.map(function (x, i) { return '<div class="' + (i === lv.index ? "cur" : i < lv.index ? "done" : "") + '"><b>' + esc(x.name) + '</b><span>' + esc(x.about) + '</span></div>'; }).join("") + '</div>';
  g.appendChild(lad); box.appendChild(g);
  if (c.kind === "lang") drawImmersionLog(box, c);
  if (c.kind === "chess" && HUB.chess && HUB.chess.ph && HUB.chess.ph.length > 1) { var ch = el("div", "panel"); ch.style.marginTop = "16px"; ch.innerHTML = '<div class="ph"><h3>Tactics rating over time</h3><span>' + HUB.chess.ph.length + ' puzzles</span></div>'; ch.appendChild(lineChart(HUB.chess.ph.map(function (v, i) { return { x: i, y: v }; }), { y0: Math.min.apply(null, HUB.chess.ph) - 50, y1: Math.max.apply(null, HUB.chess.ph) + 50 })); box.appendChild(ch); }
}
function lineChart(pts, opts) {
  opts = opts || {}; var W = 600, H = 180, pad = 28, box = el("div", "chart");
  if (!pts.length) { box.innerHTML = '<div class="empty">No data yet.</div>'; return box; }
  var x0 = pts[0].x, x1 = pts[pts.length - 1].x || 1, y0 = opts.y0 != null ? opts.y0 : Math.min.apply(null, pts.map(function (p) { return p.y; })), y1 = opts.y1 != null ? opts.y1 : Math.max.apply(null, pts.map(function (p) { return p.y; }));
  if (y1 === y0) y1 = y0 + 1;
  var X = function (x) { return pad + (W - 2 * pad) * (x1 === x0 ? 0.5 : (x - x0) / (x1 - x0)); }, Y = function (y) { return H - pad + (2 * pad - H) * (y - y0) / (y1 - y0); };
  var path = pts.map(function (p, i) { return (i ? "L" : "M") + X(p.x).toFixed(1) + " " + Y(p.y).toFixed(1); }).join(" ");
  var grid = ""; for (var i = 0; i <= 4; i++) { var yy = y0 + (y1 - y0) * i / 4; grid += '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + Y(yy).toFixed(1) + '" y2="' + Y(yy).toFixed(1) + '"/><text x="2" y="' + (Y(yy) + 3).toFixed(1) + '">' + Math.round(yy) + '</text>'; }
  box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '"><g class="grid">' + grid + '</g><path class="ar" d="' + path + ' L' + X(pts[pts.length - 1].x).toFixed(1) + ' ' + (H - pad) + ' L' + X(pts[0].x).toFixed(1) + ' ' + (H - pad) + ' Z"/><path class="ln" d="' + path + '"/>' + (pts.length < 80 ? pts.map(function (p) { return '<circle class="dot" r="3" cx="' + X(p.x).toFixed(1) + '" cy="' + Y(p.y).toFixed(1) + '"><title>' + esc(p.label != null ? p.label : String(p.y)) + '</title></circle>'; }).join("") : "") + '</svg>';
  return box;
}

/* ---- the course library ---- */
function drawCourseLibrary(box, c, sub) {
  sub = sub || "cards";
  var nav = el("nav", "subnav"); nav.innerHTML = [["cards", "Reference cards"], ["glossary", "Glossary"], ["reading", "Reading list"]].map(function (t) { return '<a href="#/c/' + c.id + '/library/' + t[0] + '"' + (sub === t[0] ? ' aria-current="page"' : '') + '>' + t[1] + '</a>'; }).join(""); box.appendChild(nav);
  if (sub === "cards") { var topics = {}; c.formulas.forEach(function (f) { (topics[f.topic] = topics[f.topic] || []).push(f); }); Object.keys(topics).forEach(function (t) { box.appendChild(el("h3", "sech", esc(t))); topics[t].forEach(function (f) { box.insertAdjacentHTML("beforeend", fxCard(f, c, true)); }); }); }
  else if (sub === "glossary") { var gl = el("div", "panel clist"); gl.innerHTML = c.glossary.map(function (g) { return '<div><span><b>' + esc(g[0]) + '</b>' + (g[1] && g[1].length ? ' <small>' + esc(g[1].join(", ")) + '</small>' : "") + '<small>' + esc(g[2]) + '</small></span><b><a href="#/c/' + c.id + '/learn/' + g[3] + '" style="color:var(--gold);text-decoration:none">lesson ›</a></b></div>'; }).join(""); box.appendChild(gl); }
  else { c.reading.forEach(function (g) { box.appendChild(el("h3", "sech", esc(g.g))); var p = el("div", "panel clist"); p.innerHTML = g.items.map(function (it) { return "<div><span><b>" + esc(it[0]) + "</b><small>" + esc(it[1]) + "</small></span>" + (it[2] ? '<b><a href="' + it[2] + '" target="_blank" rel="noopener">open ›</a></b>' : "") + "</div>"; }).join(""); box.appendChild(p); }); }
}
