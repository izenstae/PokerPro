/* ============================================================
 * Exam mode — timed, mixed, deferred-feedback problem sets.
 *
 * Flashcards build recall and the practice page builds method, but
 * 70% of this course's grade is decided under a clock with no hints,
 * no topic labels and no feedback until it is over. Nothing else in
 * the tool rehearses that, so this does:
 *
 *   · problems drawn across the whole scope, order interleaved
 *   · no topic shown, no solution shown, no "correct" until you submit
 *   · a real countdown, sized from the syllabus (quiz / 70-min midterm
 *     / 150-min final)
 *   · flag-for-review and free navigation, like a paper exam
 *   · afterwards: a scored report, every worked solution, and every
 *     miss pushed into the practice stats and the redo queue
 * ============================================================ */
const Exam = (() => {
  let s = null;        // active sitting, see build()
  let ticker = null;

  const PRESETS = [
    {
      id: "quiz", label: "Wednesday quiz", icon: "✎",
      n: 5, minutes: 15,
      blurb: "Five problems, 15 minutes — the weekly quiz covers the previous week's classes and homework.",
      scope: "recent",
    },
    {
      id: "midterm", label: "Midterm rehearsal", icon: "▦",
      n: 12, minutes: 70,
      blurb: "Twelve problems, 70 minutes — the length of the real sitting (1:50–3:00 pm, Oct 21).",
      scope: "all",
    },
    {
      id: "final", label: "Final rehearsal", icon: "◆",
      n: 18, minutes: 150,
      blurb: "Eighteen problems, 150 minutes, everything registered — the final is cumulative (Nov 23).",
      scope: "all",
    },
    {
      id: "custom", label: "Custom set", icon: "⚙",
      n: 8, minutes: 30,
      blurb: "Pick the scope and length yourself. Untimed is an option, but the clock is the point.",
      scope: "all",
    },
  ];

  // Answers go back into a value="" attribute between renders.
  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function fmtClock(sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60), r = sec % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  }

  /* ---------------- setup screen ---------------- */

  function home(el) {
    stopTicker();
    s = null;
    const units = MATH340.units.filter(u => u.generators && u.generators.length);
    if (!units.length) {
      el.innerHTML = `<div class="empty-state"><div class="big">▦</div>No practice generators are registered yet, so there is nothing to build an exam from.</div>`;
      return;
    }
    const past = Store.exams();

    el.innerHTML = `
      <div class="card">
        <h2>Exam Mode</h2>
        <p class="muted">A timed, mixed problem set with no hints, no topic labels and no feedback until you submit — the conditions the quizzes, the midterm and the final are actually graded under. Practising under the real constraints is what makes the difference on the day; everything you miss is added to your practice stats and your redo queue.</p>
        <div class="grid-2" id="presets">
          ${PRESETS.map(p => `
            <div class="preset-card" data-preset="${p.id}" role="button" tabindex="0">
              <div class="preset-head"><span class="preset-ico">${p.icon}</span><b>${p.label}</b></div>
              <p class="muted" style="margin:6px 0 10px;">${p.blurb}</p>
              <span class="pill">${p.n} problems</span>
              <span class="pill">${p.minutes} min</span>
            </div>`).join("")}
        </div>
      </div>

      <div class="card" id="customCard" style="display:none;">
        <h3 style="margin-top:0;">Custom set</h3>
        <div class="toolbar">
          <label class="muted">Scope
            <select class="select" id="exScope">
              <option value="all">All chapters</option>
              ${units.map(u => `<option value="${u.id}">${u.title}</option>`).join("")}
            </select>
          </label>
          <label class="muted">Problems
            <select class="select" id="exN">${[5, 8, 10, 12, 15, 18, 25].map(n => `<option ${n === 8 ? "selected" : ""}>${n}</option>`).join("")}</select>
          </label>
          <label class="muted">Time limit
            <select class="select" id="exMin">${[10, 15, 20, 30, 45, 60, 70, 90, 150].map(m => `<option ${m === 30 ? "selected" : ""}>${m}</option>`).join("")}<option value="0">no limit</option></select>
          </label>
          <button class="btn" id="exStartCustom">Start</button>
        </div>
      </div>

      ${past.length ? `
      <div class="card">
        <h3 style="margin-top:0;">Past sittings</h3>
        <table class="tbl">
          <tr><th>When</th><th>Set</th><th>Score</th><th>Time used</th></tr>
          ${past.map(e => {
            const pct = Math.round(100 * e.correct / e.n);
            return `<tr>
              <td>${new Date(e.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</td>
              <td>${e.label}<div class="muted" style="font-size:12px">${e.scopeLabel || ""}</div></td>
              <td><b>${e.correct}/${e.n}</b> <span class="pill ${pct >= 80 ? "pill-green" : pct >= 60 ? "pill-amber" : "pill-red"}">${pct}%</span></td>
              <td class="muted">${fmtClock(e.seconds)}${e.limit ? " of " + e.limit + ":00" : ""}</td>
            </tr>`;
          }).join("")}
        </table>
      </div>` : ""}`;

    const customCard = el.querySelector("#customCard");
    el.querySelectorAll("[data-preset]").forEach(node => {
      const go = () => {
        const preset = PRESETS.find(p => p.id === node.dataset.preset);
        if (preset.id === "custom") {
          customCard.style.display = "";
          customCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
          return;
        }
        begin(el, {
          label: preset.label,
          scope: preset.scope === "recent" ? recentUnitId() : "all",
          n: preset.n, minutes: preset.minutes,
        });
      };
      node.addEventListener("click", go);
      node.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    el.querySelector("#exStartCustom").addEventListener("click", () => {
      begin(el, {
        label: "Custom set",
        scope: el.querySelector("#exScope").value,
        n: Number(el.querySelector("#exN").value),
        minutes: Number(el.querySelector("#exMin").value),
      });
    });
    App.typeset(el);
  }

  /* The unit whose week most recently started — what a Wednesday quiz covers. */
  function recentUnitId() {
    const wk = MATH340.currentWeek();
    const eligible = MATH340.units
      .filter(u => u.generators && u.generators.length && (u.week || 1) <= Math.max(wk, 1))
      .sort((a, b) => (b.week || 0) - (a.week || 0));
    return eligible.length ? eligible[0].id : "all";
  }

  /* ---------------- building a sitting ---------------- */

  function build(opts) {
    const pool = Practice.poolFor(opts.scope);
    if (!pool.length) return null;
    /* Spread the paper over as many distinct topics as possible before
     * repeating one, so a 12-problem set is not six Bayes questions. */
    const items = [];
    let bag = [];
    for (let i = 0; i < opts.n; i++) {
      if (!bag.length) bag = MATH340.util.shuffle(pool.slice());
      const gen = bag.shift();
      const found = Practice.findGen(gen.id);
      const problem = gen.make();
      items.push({
        genId: gen.id, genName: gen.name,
        unitId: found.unit.id, unitShort: found.unit.short || found.unit.title,
        problem, answer: "", flagged: false,
      });
    }
    const scopeUnit = MATH340.getUnit(opts.scope);
    return {
      label: opts.label,
      scope: opts.scope,
      scopeLabel: scopeUnit ? scopeUnit.title : "All chapters",
      items, idx: 0,
      limit: opts.minutes || 0,
      started: Date.now(),
      submitted: false,
    };
  }

  function begin(el, opts) {
    const sitting = build(opts);
    if (!sitting) return home(el);
    s = sitting;
    startTicker(el);
    renderQ(el);
  }

  /* ---------------- the clock ---------------- */

  function stopTicker() {
    if (ticker) { clearInterval(ticker); ticker = null; }
  }

  function startTicker(el) {
    stopTicker();
    ticker = setInterval(() => {
      // The router replaces the view wholesale; if our node is gone, so are we.
      if (!s || s.submitted || !el.isConnected || !el.querySelector("#exClock")) return stopTicker();
      const left = remaining();
      const clock = el.querySelector("#exClock");
      clock.textContent = s.limit ? fmtClock(left) : fmtClock(elapsed());
      clock.classList.toggle("urgent", !!s.limit && left <= 60);
      if (s.limit && left <= 0) { stopTicker(); submit(el, true); }
    }, 1000);
  }

  function elapsed() { return (Date.now() - s.started) / 1000; }
  function remaining() { return s.limit * 60 - elapsed(); }

  /* ---------------- question screen ---------------- */

  function renderQ(el) {
    const it = s.items[s.idx];
    const p = it.problem;
    const answered = s.items.filter(i => i.answer.trim()).length;

    el.innerHTML = `
      <div class="exam-bar">
        <div>
          <b>${s.label}</b>
          <span class="muted"> · ${s.scopeLabel} · ${answered}/${s.items.length} answered</span>
        </div>
        <div class="exam-clock"><span id="exClock">${s.limit ? fmtClock(remaining()) : fmtClock(elapsed())}</span>
          <span class="muted">${s.limit ? "left" : "elapsed"}</span></div>
      </div>

      <div class="exam-palette" id="palette">
        ${s.items.map((i, k) => `<button class="pal ${k === s.idx ? "on" : ""} ${i.answer.trim() ? "done" : ""} ${i.flagged ? "flag" : ""}" data-jump="${k}" title="Problem ${k + 1}${i.flagged ? " (flagged)" : ""}">${k + 1}</button>`).join("")}
      </div>

      <div class="card" style="max-width:820px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="pill pill-accent">Problem ${s.idx + 1} of ${s.items.length}</span>
          <button class="btn btn-ghost btn-sm" id="exFlag">${it.flagged ? "⚑ Flagged" : "⚐ Flag for review"}</button>
        </div>
        <div class="q-text">${p.q}</div>
        <div class="answer-row">
          <input type="text" id="exAns" aria-label="Your answer" value="${esc(it.answer)}" autocomplete="off"
            placeholder="${p.kind === "count" ? "Whole number…" : p.kind === "num" ? "A number, e.g. 2.5 or 5/2…" : "A probability, e.g. 0.25 or 1/4…"}">
        </div>
        <p class="muted" style="margin:10px 0 0;">No feedback until you submit — exactly like the real thing. Answers are kept as you move around.</p>
        <div class="run-foot">
          <button class="btn btn-ghost btn-sm" id="exPrev" ${s.idx === 0 ? "disabled" : ""}>← Previous</button>
          <span style="flex:1"></span>
          ${s.idx < s.items.length - 1
            ? `<button class="btn" id="exNext">Next →</button>`
            : `<button class="btn" id="exSubmit">Submit exam</button>`}
        </div>
      </div>

      <div style="max-width:820px;margin:0 auto;text-align:center;">
        <button class="btn btn-ghost btn-sm" id="exSubmitEarly">Submit and grade now</button>
        <button class="btn btn-ghost btn-sm" id="exAbandon" style="color:var(--red)">Abandon</button>
      </div>`;

    const input = el.querySelector("#exAns");
    const stash = () => { s.items[s.idx].answer = input.value; };
    const goto = k => { stash(); s.idx = Math.max(0, Math.min(s.items.length - 1, k)); renderQ(el); };

    input.addEventListener("input", stash);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); if (s.idx < s.items.length - 1) goto(s.idx + 1); else confirmSubmit(el); }
    });
    el.querySelectorAll("[data-jump]").forEach(b => b.addEventListener("click", () => goto(Number(b.dataset.jump))));
    el.querySelector("#exPrev").addEventListener("click", () => goto(s.idx - 1));
    el.querySelector("#exNext")?.addEventListener("click", () => goto(s.idx + 1));
    el.querySelector("#exSubmit")?.addEventListener("click", () => { stash(); confirmSubmit(el); });
    el.querySelector("#exSubmitEarly").addEventListener("click", () => { stash(); confirmSubmit(el); });
    el.querySelector("#exFlag").addEventListener("click", () => { stash(); it.flagged = !it.flagged; renderQ(el); });
    el.querySelector("#exAbandon").addEventListener("click", () => {
      if (confirm("Abandon this sitting? Nothing will be recorded.")) { stopTicker(); s = null; home(el); }
    });
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    App.typeset(el);
  }

  function confirmSubmit(el) {
    const blank = s.items.filter(i => !i.answer.trim()).length;
    const flagged = s.items.filter(i => i.flagged).length;
    if (blank || flagged) {
      const bits = [];
      if (blank) bits.push(`${blank} unanswered`);
      if (flagged) bits.push(`${flagged} still flagged`);
      if (!confirm(`Submit with ${bits.join(" and ")}?`)) return;
    }
    submit(el, false);
  }

  /* ---------------- grading ---------------- */

  function submit(el, timedOut) {
    stopTicker();
    s.submitted = true;
    s.seconds = Math.round(Math.min(elapsed(), s.limit ? s.limit * 60 : elapsed()));
    s.timedOut = timedOut;

    let correct = 0;
    const byTopic = {};
    for (const it of s.items) {
      const v = Practice.parseAnswer(it.answer);
      it.value = v;
      it.correct = Number.isFinite(v) && Practice.checkAnswer(it.problem, v, it.answer);
      if (it.correct) correct++;
      // An exam answer is unaided by construction, so it is the most honest
      // sample the weakness model gets. Feed it straight in.
      Store.recordPractice(it.genId, it.correct, it.problem.variant);
      if (!it.correct) {
        Store.recordMiss({
          genId: it.genId, genName: it.genName, unitId: it.unitId, unitShort: it.unitShort,
          variant: it.problem.variant, q: it.problem.q, sol: it.problem.sol,
          answer: it.problem.answer, kind: it.problem.kind,
        });
      }
      const t = byTopic[it.genId] || (byTopic[it.genId] = { name: it.genName, n: 0, c: 0 });
      t.n++; if (it.correct) t.c++;
    }
    s.correct = correct;
    s.byTopic = byTopic;

    Store.recordExam({
      label: s.label, scope: s.scope, scopeLabel: s.scopeLabel,
      n: s.items.length, correct, seconds: s.seconds, limit: s.limit,
    });
    renderReport(el);
  }

  function renderReport(el) {
    const pct = Math.round(100 * s.correct / s.items.length);
    const weak = Object.values(s.byTopic).filter(t => t.c < t.n)
      .sort((a, b) => (a.c / a.n) - (b.c / b.n));

    el.innerHTML = `
      <div class="card" style="text-align:center;">
        <div style="font-size:38px;">${pct >= 80 ? "★" : pct >= 60 ? "◑" : "◔"}</div>
        <h2 style="margin:4px 0 2px;">${s.correct} / ${s.items.length} &nbsp;<span class="pill ${pct >= 80 ? "pill-green" : pct >= 60 ? "pill-amber" : "pill-red"}">${pct}%</span></h2>
        <p class="muted">${s.label} · ${s.scopeLabel} · ${fmtClock(s.seconds)} used${s.limit ? ` of ${s.limit}:00` : ""}${s.timedOut ? " · <b>time expired</b>" : ""}</p>
        <p class="muted" style="max-width:560px;margin:10px auto 0;">
          ${pct >= 80
            ? "Solid. Keep the weak topics below in rotation so they do not decay."
            : pct >= 60
              ? "Passing, but the topics below are where the marks went. Drill those before the next sitting."
              : "This is the useful kind of bad score — it found the gaps while it still costs nothing. Work the topics below, then sit another set."}
        </p>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
          <a class="btn" href="#/practice">Drill the misses</a>
          <button class="btn btn-ghost" id="exAgain">Another sitting</button>
          <a class="btn btn-ghost" href="#/progress">See progress</a>
        </div>
      </div>

      ${weak.length ? `<div class="card">
        <h3 style="margin-top:0;">Where the marks went</h3>
        ${weak.map(t => `
          <div class="topic-row">
            <div style="flex:1"><b>${t.name}</b></div>
            <div class="muted">${t.c}/${t.n}</div>
            <div class="deck-bar"><div class="progress-bar"><div style="width:${Math.round(100 * t.c / t.n)}%"></div></div></div>
          </div>`).join("")}
        <p class="muted" style="margin-bottom:0;">Every missed problem is now in your redo queue on the Practice page, with the worked solution.</p>
      </div>` : ""}

      <div class="card">
        <h3 style="margin-top:0;">Every problem</h3>
        ${s.items.map((it, k) => `
          <div class="exam-review ${it.correct ? "ok" : "bad"}">
            <div class="exam-review-head">
              <span class="pill ${it.correct ? "pill-green" : "pill-red"}">${k + 1} · ${it.correct ? "correct" : "missed"}</span>
              <span class="pill">${it.genName}</span>
              <span class="pill">${it.problem.variant || ""}</span>
            </div>
            <div class="q-text" style="font-size:15px;margin:8px 0 10px;">${it.problem.q}</div>
            <p class="muted" style="margin:0 0 8px;">
              You answered <b>${it.answer.trim() ? esc(it.answer) : "—"}</b>${it.correct ? "" : ` · correct answer <b>${MATH340.util.fmt(it.problem.answer, 5)}</b>`}
            </p>
            <details ${it.correct ? "" : "open"}>
              <summary class="muted">Worked solution</summary>
              <div class="solution">${it.problem.sol}</div>
            </details>
          </div>`).join("")}
      </div>`;

    el.querySelector("#exAgain").addEventListener("click", () => home(el));
    App.typeset(el);
  }

  return {
    mount(el) {
      // Returning to the tab mid-sitting resumes it; a finished one does not
      // resurface — its score is in the history and its misses are in the
      // redo queue, so the setup screen is what you came back for.
      if (s && !s.submitted) { startTicker(el); return renderQ(el); }
      home(el);
    },
    leave() {
      stopTicker();
      if (s && s.submitted) s = null;   // finished sittings do not survive a tab change
    },
    inProgress() { return !!(s && !s.submitted); },
  };
})();
