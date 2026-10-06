/* ============================================================
   UI 2: the drill runner
   One screen asks every kind of question in the hub: a choice,
   a typed word (with an on-screen keyboard for Hebrew and the
   accents), a number, a square or a move on a chess board, a
   spoken answer, or a rule to recall. It times the answer, grades
   it, shows the working, moves the skill on its schedule, pays XP,
   and runs sessions, checkpoints and placement tests on top.
   ============================================================ */
var q = null, t0 = 0, raf = 0, answered = false, doneAt = 0;
var sess = null, cp = null, freeCtx = { last: null, retry: [] };
var drillHost = null;             /* the element the table is drawn into */
var CONF = [["g", "Guessing"], ["f", "Fairly sure"], ["s", "Sure"]];
var KEYS = { he: "אבגדהוזחטיכלמנסעפצקרשתךםןףץ", sv: "åäöÅÄÖ", es: "áéíóúñüÁÉÍÓÚÑ¿¡" };

function drillShell(host) {
  drillHost = host; host.innerHTML = "";
  host.appendChild(el("div", "tape", ""));
  host.appendChild(el("div", "cpbar", ""));
  var t = el("div", "table");
  t.innerHTML = '<div class="thead"><div class="eyebrow" id="eyebrow">ready</div><div class="clock" id="clock"><b>0.0</b>s</div></div><div class="decay"><i id="decay"></i></div>' +
    '<div class="tbody"><div id="stage"></div><div class="ask" id="ask"></div><div class="row" id="controls"></div><div class="hint" id="hint"></div></div><div class="reveal" id="reveal" hidden></div>';
  host.appendChild(t);
  host.appendChild(el("div", "cpdone", "")).hidden = true;
  host.querySelector(".cpbar").hidden = true;
}
function hostQ(sel) { return drillHost ? drillHost.querySelector(sel) : null; }

/* ---- the clock ---- */
function tick() {
  if (!q) return;
  var s = (performance.now() - t0) / 1000, c = $("clock"), d = $("decay");
  if (c) c.innerHTML = "<b>" + s.toFixed(1) + "</b>s <span style='color:var(--faint)'>/ " + q.goal + "s</span>";
  if (d) { d.style.width = Math.min(100, 100 * s / q.goal) + "%"; d.classList.toggle("over", s > q.goal); }
  raf = requestAnimationFrame(tick);
}

/* ---- which skill next ---- */
function pickNext() {
  var now = Date.now();
  if (cp && cp.seq) return { id: cp.seq[Math.min(cp.marks.length, cp.seq.length - 1)] };
  if (cp) return { cp: true };
  if (sess && sess.seq) return { id: sess.seq[Math.min(sess.n, sess.seq.length - 1)] };
  var ctx = sess ? sess.ctx : freeCtx;
  srsTickRetry(ctx);
  var pool = sess ? sess.pool : freePool();
  if (!pool.length) return null;
  var id = srsPick(pool, skills, now, ctx);
  ctx.last = id;
  return { id: id };
}
var freeSel = { course: null, modes: {} };
function freePool() {
  var c = COURSES[freeSel.course]; if (!c) return [];
  var ids = [];
  Object.keys(freeSel.modes).forEach(function (m) {
    if (!freeSel.modes[m]) return;
    if (m.indexOf("words:") === 0) (c.words[m.slice(6)] || []).forEach(function (it) { ids.push(it.id); });
    else if (m.indexOf("quiz:") === 0) ids.push(c.id + ":q:" + m.slice(5));
    else ids.push(c.id + ":" + m);
  });
  return ids;
}

/* ---- render a question ---- */
function next() {
  var now = Date.now();
  if (doneAt) { logDay(q && q.course, Math.min(60, (now - doneAt) / 1000), 0, 0); doneAt = 0; }
  answered = false;
  var pk = pickNext();
  if (!pk) { $("ask").textContent = "Nothing to drill here yet. Pass a lesson's checkpoint first."; $("controls").innerHTML = ""; return; }
  var cid, L;
  if (pk.cp) { var c0 = COURSES[cp.course]; L = c0.lessonById[cp.id]; q = cpQuestion(c0, L, { caps: capsFor(c0.lang), box: 0, rnd: Math.random }, cp.asked); cid = c0.id; }
  else { var info = skInfo(pk.id), sk = skills[pk.id]; q = skQuestion(pk.id, { caps: capsFor(COURSES[info.course].lang), box: sk ? sk.box : 0 }); cid = info.course; }
  q.course = cid;
  var skId = q.skill, s = skills[skId];
  q.goal = srsGoal(q.target, s ? s.box : 0);
  var info2 = skInfo(skId);
  $("eyebrow").innerHTML = esc(COURSES[cid].name) + " · " + esc(info2 ? info2.name : "") + (s ? "<small>" + srsLevel(s) + ", box " + s.box + "</small>" : "<small>new</small>");
  $("reveal").hidden = true; $("decay").style.width = "0%"; $("decay").classList.remove("over");
  var stage = $("stage"); stage.innerHTML = "";
  if (q.board) stage.appendChild(boardWidget(q.board.fen, { flip: q.board.flip, mark: q.board.mark, coords: q.board.coords !== false, size: "", interactive: q.kind === "square" || q.kind === "move", onSquare: q.kind === "square" ? function (sq) { submit(sq); } : null, onMove: q.kind === "move" ? function (m, S) { submit(chSan(S, m)); } : null }));
  if (q.lines) { var facts = el("dl", "facts"); q.lines.forEach(function (p) { facts.innerHTML += "<div class='fact'><dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd></div>"; }); stage.appendChild(facts); }
  var ask = $("ask"); ask.className = "ask" + (q.rtl && q.kind !== "text" ? " rtl" : ""); ask.innerHTML = q.hideText ? (q.question || "") : (q.question || "");
  if (q.speak) { var sb = el("button", "speakbtn", "🔊"); sb.type = "button"; sb.title = "Play again"; sb.onclick = function () { speak(q.speak.text, q.speak.lang); }; ask.appendChild(document.createTextNode(" ")); ask.appendChild(sb); setTimeout(function () { speak(q.speak.text, q.speak.lang); }, 150); }
  if (q.flash) { var f = el("span", "flashtext" + (q.rtl ? " rtl" : ""), esc(q.flash)); ask.appendChild(f); setTimeout(function () { f.textContent = "…"; }, Math.max(2500, 120 * q.flash.length)); }
  buildControls();
  t0 = performance.now(); cancelAnimationFrame(raf); tick();
}

function buildControls() {
  var c = $("controls"); c.innerHTML = ""; $("hint").textContent = "";
  if (q.kind === "choice") {
    var box = el("div", "opts" + (q.rtl ? " rtl" : ""));
    q.options.forEach(function (o, i) { var b = btn(esc(o) + (i < 9 ? "<kbd>" + (i + 1) + "</kbd>" : ""), "", function () { submit(o); }); box.appendChild(b); });
    c.appendChild(box); $("hint").textContent = "Keys 1–" + Math.min(9, q.options.length) + " choose.";
  } else if (q.kind === "text" || q.kind === "num") {
    var wrap = el("div", "entry"), inp = el("input"); inp.type = "text"; inp.id = "inp"; inp.autocomplete = "off"; inp.autocapitalize = "off"; inp.spellcheck = false;
    if (q.kind === "num") { inp.inputMode = "decimal"; inp.placeholder = q.unit === "%" ? "%" : "number"; }
    if (q.rtl) inp.className = "rtl";
    wrap.appendChild(inp); if (q.unit) wrap.appendChild(el("span", "u", q.unit));
    c.appendChild(wrap); c.appendChild(btn("Answer", "", function () { submit(inp.value); }));
    var lang = q.keyboard || (q.lang && KEYS[q.lang] ? q.lang : null);
    if (lang && KEYS[lang]) {
      var kb = el("div", "kbd");
      KEYS[lang].split("").forEach(function (ch) { var k = el("button", "", ch); k.type = "button"; k.tabIndex = -1; k.onmousedown = function (e) { e.preventDefault(); var st = inp.selectionStart || inp.value.length; inp.value = inp.value.slice(0, st) + ch + inp.value.slice(st); inp.focus(); inp.setSelectionRange(st + 1, st + 1); }; kb.appendChild(k); });
      var sp = el("button", "wide", "space"); sp.type = "button"; sp.tabIndex = -1; sp.onmousedown = function (e) { e.preventDefault(); inp.value += " "; inp.focus(); }; kb.appendChild(sp);
      var bs = el("button", "wide", "⌫"); bs.type = "button"; bs.tabIndex = -1; bs.onmousedown = function (e) { e.preventDefault(); inp.value = inp.value.slice(0, -1); inp.focus(); }; kb.appendChild(bs);
      c.appendChild(kb);
    }
    $("hint").textContent = q.kind === "num" ? "Enter submits." : "Enter submits. Case and punctuation are ignored; letters and accents are not.";
    setTimeout(function () { inp.focus(); }, 30);
  } else if (q.kind === "speak") {
    var code = (LG_LANG[q.lang] || {}).code || "en-US", mic = el("button", "speakbtn", "🎤"); mic.type = "button";
    var status = el("span", "said", "Tap the microphone, say it, then it is checked.");
    mic.onclick = function () {
      mic.classList.add("lit"); status.textContent = "Listening…";
      var r = listen(code, function (alts) { mic.classList.remove("lit"); var hit = alts.filter(function (a) { return lgMatch(a, q.accept || [q.answer], q.lang); })[0]; submit(hit != null ? hit : alts[0]); },
        function (err) { mic.classList.remove("lit"); status.textContent = "Could not listen (" + err + "). Say it aloud, then grade yourself below."; selfGrade(c); });
      if (!r) selfGrade(c);
    };
    c.appendChild(mic); c.appendChild(status);
    c.appendChild(btn("I said it: grade myself", "ghost sm", function () { selfGrade(c); }));
    $("hint").textContent = "Speech recognition needs a connection in most browsers; offline, grade yourself honestly.";
  } else if (q.kind === "recall") {
    c.appendChild(btn("Reveal the rule", "go", showRule));
    $("hint").textContent = "Say the rule out loud first, then reveal it and grade yourself. Enter reveals.";
  } else if (q.kind === "square" || q.kind === "move") {
    $("hint").textContent = q.kind === "square" ? "Click or tap the square on the board." : "Click a piece, then its destination. Promotions default to a queen.";
  }
}
function selfGrade(c) {
  c.innerHTML = "";
  c.appendChild(el("div", "recall" + (q.rtl ? " rtl" : ""), esc(q.answer)));
  var r = el("div", "row"); r.style.marginTop = "10px";
  r.appendChild(btn("I had it", "go", function () { submit(q.answer, true); })); r.appendChild(btn("Missed it", "ghost", function () { submit("", true); }));
  c.appendChild(r);
}
function showRule() {
  if (!q || q.kind !== "recall" || q.shown || answered) return;
  q.shown = (performance.now() - t0) / 1000; cancelAnimationFrame(raf);
  $("ask").appendChild(el("div", "recall", q.rule));
  var c = $("controls"); c.innerHTML = "";
  c.appendChild(btn("Had it <kbd>1</kbd>", "go", function () { submit("had"); })); c.appendChild(btn("Missed <kbd>2</kbd>", "ghost", function () { submit("missed"); }));
  $("hint").textContent = "Had it means the substance, not the wording.";
}

/* ---- grading ---- */
function submit(raw, selfGraded) {
  if (answered || !q) return;
  if (q.kind === "recall" && !q.shown) return;
  var secs = q.kind === "recall" ? q.shown : (performance.now() - t0) / 1000;
  var g;
  if (q.kind === "recall") g = { ok: raw === "had", said: raw };
  else if (selfGraded) g = { ok: raw === q.answer, said: raw || "(missed)" };
  else { g = gradeAnswer(q, raw, q.lang); if (!g) return; }
  answered = true; cancelAnimationFrame(raf);
  var ok = g.ok, cid = q.course, skId = q.skill, sk = skillOf(skId), wasDue = Date.now() >= sk.due;
  if (sess) { if (!(skId in sess.from)) sess.from[skId] = sk.box; sess.n++; if (ok) sess.ok++; }
  q.res = srsRecord(sk, ok, secs, q.target, Date.now());
  logDay(cid, Math.min(secs, q.target * 3 + 20), 1, ok ? 1 : 0);
  q.xp = cp ? 0 : gmAnswer(cid, skId, wasDue, ok, secs <= q.goal, q.kind === "recall", q.res.ev === "up" ? q.res.box : 0);
  doneAt = Date.now();
  if (!ok && !cp) srsQueueRetry(sess ? sess.ctx : freeCtx, skId);
  if (q.elo && HUB.chess !== undefined && cid === "chess") { HUB.chess = HUB.chess || chlNew(); chlPuzzle(HUB.chess, q.elo, ok); }
  if (cp) { cp.marks.push(ok); if (q.qi != null) cp.asked.push(q.qi); drawCp(); }
  if (q.kind !== "recall" && HUB.gstate.conf !== false && !selfGraded) { q.confPending = { ok: ok, said: g.said, secs: secs, near: g.near }; askConfidence(); }
  else drawReveal(ok, g.said, secs, g.near);
  if (sess) drawSess();
  drawTape(); saveSoon(); drawNav();
}
function askConfidence() {
  var r = $("reveal"); r.innerHTML = ""; r.hidden = false;
  var box = el("div", "confq", "<span>Locked in. How sure were you?</span>");
  CONF.forEach(function (c, i) { box.appendChild(btn(c[1] + "<kbd>" + (i + 1) + "</kbd>", "ghost sm", function () { pickConfidence(c[0]); })); });
  r.appendChild(box); box.querySelector("button").focus();
  $("hint").textContent = "1 guessing, 2 fairly sure, 3 sure. Calibration shows on the Skills page; turn this off in Settings.";
}
function pickConfidence(k) {
  var P = q.confPending; if (!P) return;
  q.confPending = null; q.conf = k;
  var C = HUB.gstate.calib || (HUB.gstate.calib = { g: [0, 0], f: [0, 0], s: [0, 0] });
  C[k][0]++; if (P.ok) C[k][1]++;
  drawReveal(P.ok, P.said, P.secs, P.near); gmCheckTrophies();
}
function srsLine() {
  var r = q.res, s = skills[q.skill], d = el("div", "srsline " + r.ev);
  if (r.ev === "up") d.innerHTML = "<b>Up to " + srsLevel(s) + ", box " + r.box + ".</b> Next review in " + r.days + (r.days === 1 ? " day." : " days.");
  else if (r.ev === "miss") d.innerHTML = "<b>" + (s.box || s.lapses ? "Down to box " + s.box : "Not yet") + ".</b> It comes back in two questions, while this is fresh.";
  else if (r.ev === "slow") d.innerHTML = "Right, but over the <b>" + r.goal + "s</b> goal for this box. Only answers inside the goal build the run toward the next box.";
  else if (Date.now() >= s.due) d.innerHTML = "Clean. <b>" + r.run + " of " + r.need + "</b> in a row toward the next box.";
  else d.innerHTML = "Clean. Not due for <b>" + fmtIn(s.due - Date.now()) + "</b>; this keeps it warm, the review on its day moves it up.";
  return d;
}
function drawReveal(ok, said, secs, near) {
  var r = $("reveal"); r.innerHTML = ""; r.hidden = false;
  var v = el("div", "verdict"), rc = q.kind === "recall";
  v.appendChild(el("span", "badge " + (ok ? "ok" : near ? "near" : "no"), rc ? (ok ? "Had it" : "Missed") : ok ? "Correct" : near ? "One letter off" : "Off"));
  if (!rc) v.appendChild(el("span", "said" + (q.rtl ? " rtl" : ""), "Answer <b>" + esc(q.kind === "num" ? q.answer + (q.unit || "") : q.answer) + "</b> &nbsp;·&nbsp; you said " + esc(said == null || said === "" ? "–" : said)));
  var fast = secs <= q.goal;
  v.appendChild(el("span", "pace " + (fast ? "fast" : "slow"), secs.toFixed(1) + "s " + (fast ? "in time" : "over " + q.goal + "s")));
  if (q.xp) v.appendChild(el("span", "xpchip", "+" + q.xp + " XP"));
  r.appendChild(v);
  if (q.conf === "s" && !ok) r.appendChild(el("div", "srsline miss", "<b>Sure, and wrong.</b> These are the errors that cost most, because nothing makes you stop and check. Read the working slowly."));
  else if (q.conf === "g" && ok) r.appendChild(el("div", "srsline", "<b>A guess that landed.</b> It counts, but it is not knowledge yet: read why it is right."));
  if (q.res) r.appendChild(srsLine());
  var ex = el("div", "expl" + (q.rtl ? " rtl" : "")); (q.explain || []).forEach(function (line) { ex.appendChild(el("p", null, line)); }); r.appendChild(ex);
  if (q.speakAfter) { var sb = btn("🔊 Hear it", "ghost sm", function () { speak(q.speakAfter.text, q.speakAfter.lang); }); sb.style.marginTop = "10px"; r.appendChild(sb); if (ok) setTimeout(function () { speak(q.speakAfter.text, q.speakAfter.lang); }, 120); }
  var info = skInfo(q.skill), L = info && info.lesson;
  if (L) r.appendChild(el("div", "rlinks", '<a href="#/c/' + q.course + '/learn/' + L.id + '">Lesson: ' + esc(L.title) + ' ›</a>' + (COURSES[q.course].formulas.some(function (f) { return f.lesson === L.id; }) ? '<a href="#/c/' + q.course + '/library">Reference ›</a>' : "")));
  if (q.board && q.kind === "move") { var S0 = chFromFen(q.board.fen), mv = chParseSan(S0, q.answer); if (mv) { var b2 = boardWidget(q.board.fen, { flip: q.board.flip, mark: [chName(mv.from), chName(mv.to)], size: "sm" }); b2.style.marginTop = "12px"; r.appendChild(b2); } }
  var last = (cp && cp.marks.length >= cp.of) || (sess && sessOver());
  var go = btn(last ? "See the result" : "Next", "", advance); go.style.marginTop = "16px"; r.appendChild(go); go.focus();
  $("hint").textContent = last ? "Press Enter for your result." : "Press Enter for the next question.";
}
function advance() {
  if (cp && cp.marks.length >= cp.of) endCp();
  else if (sess && sessOver()) endSession();
  else next();
}
function drawTape() {
  var t = hostQ(".tape"); if (!t) return;
  var d = gmToday(), st = gmStreak(plog, Date.now());
  t.innerHTML = "<span>today <b>" + (d.n || 0) + "</b> answers</span><span>right <b>" + (d.n ? Math.round(100 * d.ok / d.n) : 0) + "%</b></span><span>time <b>" + fmtDur(d.s || 0) + "</b></span><span>XP <b>" + (d.x || 0) + "</b>/" + HUB.gstate.goal + "</span><span>streak <b>" + st.days + "</b></span>";
}
document.addEventListener("keydown", function (e) {
  if (!drillHost || !document.body.contains(drillHost) || !q) return;
  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") && e.key !== "Enter") return;
  if (!answered && q.kind === "recall") { if (!q.shown && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); showRule(); } else if (q.shown && (e.key === "1" || e.key === "2")) submit(e.key === "1" ? "had" : "missed"); return; }
  if (answered && q.confPending) { var ci = ["1", "2", "3"].indexOf(e.key); if (ci >= 0) { e.preventDefault(); pickConfidence(CONF[ci][0]); } else if (e.key === "Enter") e.preventDefault(); return; }
  if (e.key === "Enter") { e.preventDefault(); if (answered) advance(); else if (q.kind === "text" || q.kind === "num") { var i = $("inp"); if (i) submit(i.value); } return; }
  if (!answered && q.kind === "choice") { var n = parseInt(e.key, 10); if (n >= 1 && n <= q.options.length) submit(q.options[n - 1]); }
});

/* ---- sessions ---- */
function startSession(kind, cid, only) {
  var now = Date.now(), pool;
  if (only && only.length) pool = only.slice();
  else if (kind === "due") pool = dueIds(cid);
  else pool = cid ? courseSkillIds(cid) : allSkillIds();
  if (!pool.length) { toast("Nothing to review " + (cid ? "in " + COURSES[cid].name : "") + " right now.", ""); return; }
  sess = { kind: kind, course: cid, pool: pool, ctx: { last: null, retry: [], idle: kind === "due" ? 0.15 : 0.6 }, n: 0, ok: 0, secs: 0, cap: kind === "due" ? 60 : 20, from: {} };
  cp = null;
  location.hash = "#/drill";
}
function sessDue() { return srsDueList(sess.pool, skills, Date.now()); }
function sessOver() { return sess.n >= sess.cap || (sess.kind === "due" && !sessDue().length); }
function drawSess() {
  var bar = hostQ(".cpbar"); if (!bar || !sess) return; bar.hidden = false;
  var left = sess.kind === "due" ? sessDue().length + " due left" : (sess.cap - sess.n) + " to go";
  bar.innerHTML = '<span class="lab">' + (sess.kind === "due" ? "Reviews" : sess.kind === "rush" ? "Tactics rush" : "Practice") + (sess.course ? " · " + esc(COURSES[sess.course].name) : " · all skills") + '</span><span class="grow">' + left + ' &nbsp;·&nbsp; ' + sess.n + ' answered' + (sess.n ? ', ' + Math.round(100 * sess.ok / sess.n) + '% right' : '') + '</span>';
  bar.appendChild(btn("End", "ghost sm", endSession));
}
function endSession() {
  var S = sess; sess = null; if (!S) { route(); return; }
  var ups = [], downs = [];
  Object.keys(S.from).forEach(function (id) { var b = skills[id].box; if (b > S.from[id]) ups.push(skillName(id) + " → " + srsLevel(skills[id])); else if (b < S.from[id]) downs.push(skillName(id)); });
  if (S.kind === "due" && S.n >= 10 && S.ok / S.n >= 0.9) { HUB.gstate.sweeps = (HUB.gstate.sweeps || 0) + 1; gmGain(S.course, GM_XP_SWEEP, "Clean sweep"); }
  saveSoon(); gmCheckTrophies();
  var d = hostQ(".cpdone"); if (!d) { route(); return; }
  d.innerHTML = "";
  var left = dueIds(S.course).length;
  d.appendChild(el("h3", "pass", S.n ? (left ? "Session ended" : "All clear" + (S.course ? " in " + COURSES[S.course].name : "")) : "Nothing answered"));
  var msg = S.n + " answers, " + (S.n ? Math.round(100 * S.ok / S.n) : 0) + "% right, " + fmtDur(S.secs) + ". ";
  if (ups.length) msg += "Moved up: " + ups.slice(0, 6).join(", ") + (ups.length > 6 ? " and " + (ups.length - 6) + " more" : "") + ". ";
  if (downs.length) msg += "Slipped, back soon: " + downs.slice(0, 6).join(", ") + ". ";
  msg += left ? left + " still due; pick it up whenever you have ten minutes." : "Everything due is cleared. The gap before the next review is what makes it stick.";
  d.appendChild(el("p", null, msg));
  var row = el("div", "row");
  row.appendChild(btn("Back to today", "", function () { location.hash = "#/home"; }));
  row.appendChild(btn(left ? "Keep going" : "Practise weakest", "ghost", function () { startSession(left ? "due" : "extra", S.course); }));
  d.appendChild(row);
  hostQ(".table").hidden = true; hostQ(".cpbar").hidden = true; d.hidden = false; window.scrollTo(0, 0);
}

/* ---- checkpoints and placement ---- */
function startCp(cid, lid) {
  var c = COURSES[cid], L = c.lessonById[lid];
  cp = { course: cid, id: lid, need: L.pass, of: L.of, marks: [], asked: [] };
  sess = null; location.hash = "#/drill";
}
function placeStageQs(c, S) {
  var ls = S.lessons.filter(passable), seq = [];
  ls.forEach(function (L) { var per = ls.length >= 5 ? 1 : 2; for (var k = 0; k < per; k++) seq.push(L.id); });
  for (var i = seq.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = seq[i]; seq[i] = seq[j]; seq[j] = t; }
  return seq.slice(0, 10);
}
function startPlacement(cid, stageN) {
  var c = COURSES[cid], S = c.stages[stageN];
  while (S && !placeStageQs(c, S).length) S = c.stages[S.n + 1];
  if (!S) { location.hash = "#/c/" + cid; return; }
  var seqL = placeStageQs(c, S);
  cp = { placement: true, course: cid, stage: S.n, id: seqL[0], seqL: seqL, of: seqL.length, need: Math.ceil(0.8 * seqL.length), marks: [], asked: [], placed: (cp && cp.placement ? cp.placed : 0) };
  cp.seq = null; sess = null; location.hash = "#/drill";
}
/* placement asks each lesson's checkpoint question in turn */
var _cpQ = cpQuestion;
function drawCp() {
  var bar = hostQ(".cpbar"); if (!bar || !cp) return; bar.hidden = false;
  var c = COURSES[cp.course], L = c.lessonById[cp.id], hits = cp.marks.filter(Boolean).length, pips = "";
  for (var i = 0; i < cp.of; i++) pips += '<i class="pip' + (i < cp.marks.length ? (cp.marks[i] ? " hit" : " miss") : "") + '"></i>';
  bar.innerHTML = '<span class="lab">' + (cp.placement ? "Placement" : "Checkpoint") + '</span><span class="grow">' + (cp.placement ? "Stage " + cp.stage + ", " + esc(c.stages[cp.stage].title) : esc(L.title)) + ' &nbsp;·&nbsp; ' + hits + ' of ' + cp.of + ' right, need ' + cp.need + '</span><span class="pips">' + pips + '</span>';
  bar.appendChild(btn("Quit", "ghost sm", function () { var id = cp.id, cid = cp.course, pl = cp.placement; cp = null; location.hash = pl ? "#/c/" + cid : "#/c/" + cid + "/learn/" + id; }));
}
function endCp() {
  var c = COURSES[cp.course], d = hostQ(".cpdone"); d.innerHTML = "";
  var hits = cp.marks.filter(Boolean).length, passedNow = hits >= cp.need, now = Date.now();
  if (cp.placement) {
    var S = c.stages[cp.stage], newly = 0;
    if (passedNow) {
      S.lessons.filter(passable).forEach(function (L) { if (passed(c.id, L.id)) return; progress[c.id + ":" + L.id] = 1; newly++; lessonSkillIds(c, L).forEach(function (id) { srsGraduate(skillOf(id), now); }); });
      cp.placed += newly; HUB.placed[c.id] = Math.max(HUB.placed[c.id] || 0, cp.stage + 1);
      if (newly) gmGain(c.id, GM_XP_PLACE * newly, null);
      saveSoon();
    }
    var nextS = c.stages[cp.stage + 1], P = cp;
    d.appendChild(el("h3", passedNow ? "pass" : "fail", passedNow ? "Stage " + S.n + ", " + esc(S.title) + ": you know it" : "Stage " + S.n + ", " + esc(S.title) + ": this is where you start"));
    d.appendChild(el("p", null, hits + " of " + P.of + " right, " + P.need + " needed. " + (passedNow ? (newly ? plural(newly, "lesson is", "lessons are") + " marked passed and on your review schedule. " : "") + (nextS ? "Keep going to place into the next stage, or stop here." : "That was the last stage: the whole path is placed.") : "Placed so far: " + plural(P.placed, "lesson") + ". The path picks up at the first lesson you have not passed; the questions you missed show what to read first.")));
    var row = el("div", "row");
    if (passedNow && nextS) row.appendChild(btn("Next: Stage " + nextS.n + ", " + esc(nextS.title), "go", function () { startPlacement(c.id, nextS.n); }));
    row.appendChild(btn(passedNow && nextS ? "Stop here" : "Go to the path", passedNow && nextS ? "ghost" : "go", function () { cp = null; location.hash = "#/c/" + c.id; }));
    d.appendChild(row);
  } else {
    var L = c.lessonById[cp.id], first = !passed(c.id, L.id);
    if (passedNow) {
      progress[c.id + ":" + L.id] = 1;
      lessonSkillIds(c, L).forEach(function (id) { srsGraduate(skillOf(id), now); });
      if (first) gmGain(c.id, GM_XP_LESSON, "Lesson passed");
      saveSoon(); gmCheckTrophies();
    }
    var i = c.lessonList.indexOf(L), nx = c.lessonList[i + 1];
    d.appendChild(el("h3", passedNow ? "pass" : "fail", passedNow ? esc(L.title) + ": passed" : hits + " of " + cp.of + ". Not yet."));
    d.appendChild(el("p", null, passedNow ? "You got " + hits + " of " + cp.of + ". " + plural(lessonSkillIds(c, L).length, "skill is", "skills are") + " on your schedule now: first review tomorrow. " + (nx ? "Next up: " + esc(nx.title) + "." : "That is the whole path for " + c.name + ".") : "You needed " + cp.need + ". Reread the lesson, in particular the boxed rule, then come straight back."));
    var row2 = el("div", "row"), lid = L.id, cid = c.id;
    if (passedNow) { row2.appendChild(btn(nx ? "Next: " + esc(nx.title) : "Back to the path", "go", function () { cp = null; location.hash = nx ? "#/c/" + cid + "/learn/" + nx.id : "#/c/" + cid; })); row2.appendChild(btn("Back to today", "ghost", function () { cp = null; location.hash = "#/home"; })); }
    else { row2.appendChild(btn("Try again", "go", function () { startCp(cid, lid); })); row2.appendChild(btn("Reread the lesson", "ghost", function () { cp = null; location.hash = "#/c/" + cid + "/learn/" + lid; })); }
    d.appendChild(row2);
  }
  if (!cp.placement || true) { hostQ(".table").hidden = true; hostQ(".cpbar").hidden = true; d.hidden = false; }
  window.scrollTo(0, 0);
}
/* placement: the next question comes from the next lesson in the sequence */
function cpQuestionPlacement(c, ctx) {
  var lid = cp.seqL[Math.min(cp.marks.length, cp.seqL.length - 1)];
  cp.id = lid;
  return _cpQ(c, c.lessonById[lid], ctx, []);
}
cpQuestion = function (c, L, ctx, asked) { return cp && cp.placement ? cpQuestionPlacement(c, ctx) : _cpQ(c, L, ctx, asked); };

/* ---- the drill view ---- */
function drawDrill(host) {
  drillShell(host);
  var pre = el("div", "crumbs"); pre.innerHTML = '<a href="#/home">Today</a><span>›</span>' + (sess ? (sess.course ? '<a href="#/c/' + sess.course + '/practice">' + esc(COURSES[sess.course].name) + ' practice</a>' : 'All reviews') : cp ? '<a href="#/c/' + cp.course + '">' + esc(COURSES[cp.course].name) + '</a><span>›</span>' + (cp.placement ? "Placement test" : "Checkpoint") : (freeSel.course ? '<a href="#/c/' + freeSel.course + '/practice">' + esc(COURSES[freeSel.course].name) + ' practice</a><span>›</span>Free practice' : 'Free practice'));
  host.insertBefore(pre, host.firstChild);
  if (!sess && !cp && !freeSel.course) { host.innerHTML = '<div class="empty">Nothing is running. Start a review session from Today, or free practice from a skill\'s Practice tab.</div>'; return; }
  if (sess) drawSess(); if (cp) drawCp();
  drawTape(); next();
}
