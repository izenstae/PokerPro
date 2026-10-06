/* ============================================================
   UI 5: Apply. The conversation simulator, dictation and writing
   sessions, the immersion log, and the chess Apply tab.
   ============================================================ */
function drawApply(box, c, arg) {
  if (c.kind === "chess") {
    var nav = el("nav", "subnav"); nav.innerHTML = [["play", "Play the engine"], ["rush", "Tactics rush"]].map(function (t) { return '<a href="#/c/chess/apply/' + t[0] + '"' + ((arg || "play") === t[0] ? ' aria-current="page"' : '') + '>' + t[1] + '</a>'; }).join(""); box.appendChild(nav);
    var host = el("div"); host.id = "applyHost"; box.appendChild(host);
    if ((arg || "play") === "play") drawPlay(host);
    else { var p = el("div", "panel"); p.innerHTML = '<div class="ph"><h3>Tactics rush</h3><span>ten rated puzzles</span></div><p class="pnote">Mates in one and two, forks and best-move positions, generated and verified by the engine. Each answer moves your tactics rating like Elo: solving a 1400 puzzle when you are rated 1000 gains a lot; missing a 1000 puzzle costs a lot. Speed counts for the schedule, not for the rating.</p>'; var r = el("div", "row"); r.appendChild(btn("Start a rush", "go", startRush)); p.appendChild(r); host.appendChild(p); var S = HUB.chess ? chlSummary(HUB.chess) : null; if (S) host.appendChild(el("p", "pnote", "Tactics rating <b>" + S.puzzle + "</b> over " + plural(S.puzzles, "puzzle") + ".")); }
    return;
  }
  if (c.kind !== "lang") { box.appendChild(el("div", "empty", "Nothing to apply here yet.")); return; }
  var sub = arg || "conv";
  var nav2 = el("nav", "subnav"); nav2.innerHTML = c.apply.map(function (a) { return '<a href="#/c/' + c.id + '/apply/' + a.id + '"' + (sub === a.id ? ' aria-current="page"' : '') + '>' + esc(a.label) + '</a>'; }).join(""); box.appendChild(nav2);
  if (sub === "conv") drawConv(box, c);
  else if (sub === "listen" || sub === "write") drawApplyDrill(box, c, sub);
  else if (sub === "log") drawImmersionLog(box, c, true);
}

/* ---- the conversation simulator ---- */
var conv = null;
function drawConv(box, c) {
  var A = HUB.apply || {}, done = (A[c.id + ":conv"] || {}).done || {};
  if (!conv || conv.course !== c.id) {
    var intro = el("div", "panel"); intro.innerHTML = '<div class="ph"><h3>Conversation</h3><span>' + c.dialogues.length + ' scenarios</span></div><p class="pnote">Your partner speaks (text, and voice if the device has one). You answer by typing, or by speaking if the browser can listen. Each reply is graded on whether it does the job the turn asks for, lenient on wording; then the model answer appears for you to say aloud. Finish a scenario at 80% or better and it counts toward your level. Repeat until you can run it without the hints.</p>';
    box.appendChild(intro);
    var grid = el("div", "scen"); grid.style.marginTop = "14px";
    c.dialogues.forEach(function (d) { var a = el("a", ""); a.href = "javascript:void 0"; a.innerHTML = '<b>' + esc(d.title) + ' <span class="tag">' + d.level + '</span></b><span>' + esc(d.setting) + '</span>' + (done[d.id] != null ? '<div class="sc">best ' + pct(done[d.id]) + (done[d.id] >= 0.8 ? " ✓" : "") + '</div>' : '<div class="sc">not yet tried</div>'); a.onclick = function () { conv = { course: c.id, d: d, i: 0, replies: [], ok: 0, hint: false }; route(); }; grid.appendChild(a); });
    box.appendChild(grid);
    return;
  }
  var d = conv.d, code = LG_LANG[c.lang].code, caps = capsFor(c.lang);
  var p = el("div", "panel"); p.innerHTML = '<div class="ph"><h3>' + esc(d.title) + ' <span class="tag">' + d.level + '</span></h3><span>' + esc(d.setting) + '</span></div>';
  var thread = el("div", "conv");
  for (var i = 0; i <= Math.min(conv.i, d.turns.length - 1); i++) {
    var t = d.turns[i], bb = el("div", "bub bot" + (c.lang === "he" ? " rtl" : "")); bb.innerHTML = esc(t.bot) + '<small>' + esc(t.botg) + '</small>';
    (function (tt) { var sb = btn("🔊", "ghost sm", function () { speak(tt.bot, code, 0.85); }); sb.style.cssText = "min-height:26px;padding:2px 8px;margin-top:6px"; bb.appendChild(sb); })(t);
    thread.appendChild(bb);
    if (i < conv.i || conv.replies[i] != null) { var rep = conv.replies[i], okr = lgTurnOk(t, rep || "", c.lang); var mb = el("div", "bub me" + (okr ? "" : " bad") + (c.lang === "he" ? " rtl" : "")); mb.innerHTML = esc(rep || "(no answer)") + '<small>' + (okr ? "✓ that does the job" : "✗ not quite") + '</small><div class="model">' + esc(t.model) + '<small>' + esc(t.modelg) + '</small></div>'; thread.appendChild(mb); }
  }
  p.appendChild(thread);
  if (conv.i < d.turns.length) {
    var t2 = d.turns[conv.i];
    if (conv.i === 0 || conv.replies[conv.i - 1] != null) setTimeout(function () { speak(t2.bot, code, 0.85); }, 200);
    var inRow = el("div", "convin"), w = el("div", "entry"), inp = el("input"); inp.type = "text"; inp.autocomplete = "off"; if (c.lang === "he") inp.className = "rtl"; w.appendChild(inp); inRow.appendChild(w);
    var sendIt = function (text) { conv.replies[conv.i] = text; if (lgTurnOk(t2, text, c.lang)) conv.ok++; conv.i++; if (conv.i >= d.turns.length) finishConv(c); route(); };
    inRow.appendChild(btn("Send", "go", function () { sendIt(inp.value); }));
    if (caps.asr) { var mic = el("button", "speakbtn", "🎤"); mic.type = "button"; mic.onclick = function () { mic.classList.add("lit"); listen(code, function (alts) { mic.classList.remove("lit"); var best = alts.filter(function (a) { return lgTurnOk(t2, a, c.lang); })[0] || alts[0]; inp.value = best; }, function () { mic.classList.remove("lit"); toast("Could not listen; type the reply.", ""); }); }; inRow.appendChild(mic); }
    inRow.appendChild(btn(conv.hint ? "Hide hint" : "Hint", "ghost sm", function () { conv.hint = !conv.hint; route(); }));
    if (conv.hint) inRow.appendChild(el("span", "said", "Try: <b>" + esc(t2.hint) + "</b>"));
    inp.onkeydown = function (e) { if (e.key === "Enter") sendIt(inp.value); };
    p.appendChild(inRow); setTimeout(function () { inp.focus(); }, 50);
    if (KEYS[c.lang]) { var kb = el("div", "kbd"); KEYS[c.lang].split("").forEach(function (ch) { var k = el("button", "", ch); k.type = "button"; k.onmousedown = function (e) { e.preventDefault(); inp.value += ch; inp.focus(); }; kb.appendChild(k); }); p.appendChild(kb); }
  } else {
    var sc = lgDialogueScore(d, conv.replies, c.lang);
    p.appendChild(el("div", "cpdone", '<h3 class="' + (sc.score >= 0.8 ? "pass" : "fail") + '">' + sc.ok + ' of ' + sc.n + ' turns did the job</h3><p>' + (sc.score >= 0.8 ? "That counts toward your level. Now run it again without the hints, then say every model answer aloud three times." : "Read the model answers, say them aloud, and run it again. The second attempt is where the learning happens.") + '</p>'));
    var r = el("div", "row"); r.style.justifyContent = "center"; r.appendChild(btn("Run it again", "go", function () { conv = { course: c.id, d: d, i: 0, replies: [], ok: 0, hint: false }; route(); })); r.appendChild(btn("All scenarios", "ghost", function () { conv = null; route(); })); p.appendChild(r);
  }
  box.appendChild(p);
}
function finishConv(c) {
  var sc = lgDialogueScore(conv.d, conv.replies, c.lang);
  applyRecord(c.id, "conv", sc.score, { id: conv.d.id });
  var xp = Math.round(30 * sc.score) + (sc.score >= 0.8 ? 20 : 0);
  gmGain(c.id, xp, "Conversation: " + Math.round(100 * sc.score) + "%");
  logDay(c.id, 60 * 6, 0, 0);
  if (sc.score >= 0.8) HUB.gstate.convs = (HUB.gstate.convs || 0) + 1;
  saveSoon(); gmCheckTrophies();
}

/* ---- dictation and writing as applied sessions: eight questions, a score ---- */
function drawApplyDrill(box, c, kind) {
  var mode = kind === "listen" ? (c.id + "dict") : (c.id + "write");
  var p = el("div", "panel");
  p.innerHTML = '<div class="ph"><h3>' + (kind === "listen" ? "Dictation" : "Writing") + '</h3><span>eight sentences, A1 to B2</span></div><p class="pnote">' + (kind === "listen" ? "Sentences read aloud at natural speed; you type them. If the device has no " + c.name + " voice, each sentence shows briefly and then hides." : "Short English sentences to translate into " + c.name + ", each with several accepted answers. Word order, agreement and tense are tested together.") + ' The session score counts toward your level and the sentences are also drilled on your schedule.</p>';
  var A = (HUB.apply || {})[c.id + ":" + kind]; if (A && A.n) p.innerHTML += '<p class="pnote">Average so far: <b>' + pct(A.sum / A.n) + '</b> over ' + plural(A.n, "session") + '; best ' + pct(A.best) + '.</p>';
  var r = el("div", "row"); r.appendChild(btn("Start a session", "go", function () { startApplySession(c, kind, mode); })); p.appendChild(r); box.appendChild(p);
}
function startApplySession(c, kind, mode) {
  var pool = []; for (var i = 0; i < 8; i++) pool.push(c.id + ":" + mode);
  sess = { kind: "apply", applyKind: kind, course: c.id, pool: pool, seq: pool, ctx: { last: null, retry: [], idle: 1 }, n: 0, ok: 0, secs: 0, cap: 8, from: {} };
  cp = null; go("#/drill");
}
var _endSession = endSession;
endSession = function () {
  if (sess && sess.kind === "apply" && sess.n) { var score = sess.ok / sess.n; applyRecord(sess.course, sess.applyKind, score); gmGain(sess.course, Math.round(20 * score), (sess.applyKind === "listen" ? "Dictation" : "Writing") + ": " + Math.round(100 * score) + "%"); }
  _endSession();
};

/* ---- the immersion log: minutes of real input and output, counted as hours toward the level ---- */
function drawImmersionLog(box, c, full) {
  var p = el("div", "panel"); p.style.marginTop = "16px";
  var logs = (HUB.logs || []).filter(function (l) { return l.c === c.id; }).sort(function (a, b) { return b.t - a.t; });
  var hours = loggedHours(c.id);
  p.innerHTML = '<div class="ph"><h3>Immersion log</h3><span>' + hours.toFixed(1) + ' h logged · ' + (c.need || 700) + ' h is the FSI estimate to C1</span></div><p class="pnote">Log the minutes of real ' + esc(c.name) + ' you take in and put out: shows, podcasts, reading, a tandem call, shadowing. Past B1 these hours are the level, and the planner schedules them. Drills and lessons are counted automatically; this is for everything else.</p>';
  var form = el("div", "row"); form.style.margin = "10px 0";
  var sel = el("select"); ["listening", "reading", "speaking", "writing", "shadowing"].forEach(function (k) { var o = el("option", "", k); o.value = k; sel.appendChild(o); }); sel.style.width = "auto";
  var min = el("input"); min.type = "number"; min.placeholder = "minutes"; min.style.width = "110px"; min.min = 1;
  var note = el("input"); note.type = "text"; note.placeholder = "what (optional)"; note.style.flex = "1 1 160px";
  form.appendChild(sel); form.appendChild(min); form.appendChild(note);
  form.appendChild(btn("Log it", "go sm", function () { var m = parseInt(min.value, 10); if (!(m > 0)) return; HUB.logs = HUB.logs || []; HUB.logs.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t: Date.now(), c: c.id, k: sel.value, min: m, n: note.value.slice(0, 80) }); logDay(c.id, m * 60, 0, 0); gmGain(c.id, Math.min(30, Math.round(m / 3)), "Logged " + m + " min of " + sel.value); saveSoon(); route(); }));
  p.appendChild(form);
  if (logs.length) { var ll = el("div", "loglist"); logs.slice(0, full ? 60 : 8).forEach(function (l) { var row = el("div"); row.innerHTML = '<span class="said">' + new Date(l.t).toLocaleDateString(undefined, { month: "short", day: "numeric" }) + '</span><span>' + esc(l.k) + (l.n ? " · " + esc(l.n) : "") + '</span><b>' + l.min + ' min</b>'; var x = btn("×", "ghost sm", function () { HUB.logs = HUB.logs.filter(function (y) { return y.id !== l.id; }); saveSoon(); route(); }); row.appendChild(x); ll.appendChild(row); }); p.appendChild(ll); }
  else p.appendChild(el("p", "pnote", "Nothing logged yet."));
  box.appendChild(p);
}
