/* ============================================================
 * App shell — routing, dashboard, schedule, reference, progress.
 * ============================================================ */
const App = (() => {
  const view = document.getElementById("view");
  const titleEl = document.getElementById("topbarTitle");
  const weekEl = document.getElementById("topbarWeek");

  /* ---------- KaTeX ---------- */
  function typeset(el) {
    if (window.renderMathInElement) {
      try {
        renderMathInElement(el, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true },
          ],
          throwOnError: false,
        });
      } catch (e) { /* keep raw TeX visible rather than crash */ }
    }
  }

  /* ---------- helpers ---------- */
  const DAY = 24 * 3600 * 1000;

  function fmtDate(iso) {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }
  function daysUntil(iso) {
    const d = new Date(iso + "T23:59:59");
    return Math.ceil((d - new Date()) / DAY);
  }
  function inDays(n) {
    return n === 0 ? "today" : n === 1 ? "tomorrow" : "in " + n + " days";
  }
  function weekLabel() {
    const wk = MATH340.currentWeek();
    if (wk <= 0) return "Term starts " + fmtDate(MATH340.course.termStart);
    if (wk >= 11) return "Term complete";
    const row = MATH340.schedule.find(r => r.week === wk);
    return `Week ${wk} · ${row ? row.topic : ""}`;
  }
  function escapeAttr(t) {
    return String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  /* Plain text of a card, for the reference search box. */
  function plain(html) {
    return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
  }

  /* The next Wednesday that carries a quiz, per the syllabus schedule. */
  function nextQuiz() {
    const start = new Date(MATH340.course.termStart + "T00:00:00");
    const now = new Date(); now.setHours(0, 0, 0, 0);
    for (const row of MATH340.schedule) {
      if (!row.quiz) continue;
      const wed = new Date(start.getTime() + ((row.week - 1) * 7 + 2) * DAY);
      if (wed >= now) return { week: row.week, topic: row.topic, days: Math.round((wed - now) / DAY) };
    }
    return null;
  }

  /* ---------- Dashboard ---------- */

  /* The dashboard's job is to answer "what should I do right now?" — a
   * number of due cards is data, a ranked next action is a study plan. */
  function studyPlan() {
    const plan = [];
    const decks = MATH340.units.filter(u => u.flashcards && u.flashcards.length);
    const gens = MATH340.units.flatMap(u => u.generators || []);

    let due = 0, fresh = 0;
    for (const u of decks) { const s = Store.deckStats(u.flashcards); due += s.due; fresh += s.fresh; }
    const misses = Store.missCount();
    const quiz = nextQuiz();
    const exam = MATH340.keyDates.filter(k => k.kind === "exam" && daysUntil(k.date) >= 0)[0];

    if (due) {
      plan.push({
        pri: fresh === due ? 2 : 1,
        icon: "⧉", href: "#/flashcards",
        title: `Review ${due} flashcard${due === 1 ? "" : "s"}`,
        why: fresh ? `${fresh} you have never seen; the rest are scheduled for today. About ${Math.max(1, Math.round(due * 0.2))} min.` : `Scheduled for today by the Leitner boxes. About ${Math.max(1, Math.round(due * 0.2))} min.`,
      });
    }
    if (misses) {
      plan.push({
        pri: 1, icon: "↺", href: "#/practice",
        title: `Redo ${misses} missed problem${misses === 1 ? "" : "s"}`,
        why: "Problems you got wrong, kept with their worked solutions. Re-attempting a miss is worth more than a fresh problem you would have got right.",
      });
    }
    if (quiz && quiz.days <= 2 && gens.length) {
      plan.push({
        pri: 0, icon: "✎", href: "#/exam",
        title: `Quiz ${inDays(quiz.days)} — sit a timed set`,
        why: `Week ${quiz.week} quiz covers the previous week's classes and homework. Five problems, 15 minutes, no hints.`,
      });
    }
    if (exam && daysUntil(exam.date) <= 14 && gens.length) {
      plan.push({
        pri: 0, icon: "▦", href: "#/exam",
        title: `${exam.label.split("·")[0].trim()} ${inDays(daysUntil(exam.date))}`,
        why: "Sit a full-length rehearsal under the clock, then drill whatever it finds. Also: build your formula sheet on the Reference page.",
      });
    }
    const weakest = gens.map(g => ({ g, w: Store.weakness(g.id), p: Store.getPractice(g.id) }))
      .filter(x => x.p.attempts >= 3).sort((a, b) => b.w - a.w)[0];
    if (weakest && weakest.w > 0.4) {
      plan.push({
        pri: 2, icon: "◎", href: "#/practice",
        title: `Drill your weakest topic: ${weakest.g.name}`,
        why: `${weakest.p.correct}/${weakest.p.attempts} first-try so far. "Target my weak spots" draws mostly from topics like this one.`,
      });
    }
    if (!plan.length && gens.length) {
      plan.push({
        pri: 3, icon: "▶", href: "#/practice",
        title: "Mixed practice session",
        why: "Nothing is due and nothing is outstanding. Interleaved problems with the topic hidden are the best use of a free ten minutes.",
      });
    }
    return plan.sort((a, b) => a.pri - b.pri).slice(0, 3);
  }

  function dashboard(el) {
    const wk = MATH340.currentWeek();
    const decks = MATH340.units.filter(u => u.flashcards && u.flashcards.length);
    const gens = MATH340.units.flatMap(u => u.generators || []);

    let dueTotal = 0, masteredTotal = 0, cardTotal = 0;
    for (const u of decks) {
      const s = Store.deckStats(u.flashcards);
      dueTotal += s.due; masteredTotal += s.mastered; cardTotal += s.total;
    }
    const ps = Store.practiceStats(gens);
    const upcoming = MATH340.keyDates.filter(k => daysUntil(k.date) >= 0).slice(0, 3);
    const plan = studyPlan();
    const lastExam = Store.exams()[0];

    let unitCards = "";
    for (const u of MATH340.units) {
      if (!u.flashcards || !u.flashcards.length) continue;
      const s = Store.deckStats(u.flashcards);
      const pStats = Store.practiceStats(u.generators || []);
      unitCards += `
        <div class="card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;">
            <h3 style="margin:0; font-size:15.5px;">${u.title}</h3>
            <span class="pill ${wk >= (u.week || 1) ? "pill-accent" : ""}">Week ${u.week}${wk < (u.week || 1) ? " · upcoming" : ""}</span>
          </div>
          <p class="muted" style="margin:8px 0 12px;">${u.description || ""}</p>
          <div class="progress-bar"><div style="width:${Math.round(s.mastery * 100)}%"></div></div>
          <div class="muted" style="margin-top:6px; display:flex; justify-content:space-between;">
            <span>${Math.round(s.mastery * 100)}% card mastery</span>
            <span>${pStats.attempts ? Math.round(100 * (pStats.accuracy || 0)) + "% first-try" : "no practice yet"}</span>
          </div>
          <div style="display:flex; gap:8px; margin-top:14px; flex-wrap:wrap;">
            <a class="btn btn-sm btn-ghost" href="#/flashcards">Cards</a>
            ${(u.generators && u.generators.length) ? `<a class="btn btn-sm btn-ghost" href="#/practice">Practice</a>` : ""}
            ${u.referenceTable ? `<a class="btn btn-sm btn-ghost" href="#/reference">Table</a>` : ""}
          </div>
        </div>`;
    }

    el.innerHTML = `
      <div class="card hero">
        <h2 style="margin-bottom:2px;">${greeting()}</h2>
        <p class="muted" style="margin: 4px 0 0;">${weekLabel()} — ${dueTotal > 0
          ? `you have <b>${dueTotal}</b> flashcard${dueTotal === 1 ? "" : "s"} ready to review.`
          : "all caught up on reviews. Nice."}</p>
      </div>

      <div class="card">
        <h3 style="margin-top:0;">Today's plan</h3>
        ${plan.map((p, i) => `
          <a class="plan-row ${i === 0 ? "lead" : ""}" href="${p.href}">
            <span class="plan-ico">${p.icon}</span>
            <span style="flex:1;min-width:0;">
              <span class="plan-title">${p.title}</span>
              <span class="muted plan-why">${p.why}</span>
            </span>
            <span class="plan-go">→</span>
          </a>`).join("") || `<p class="muted">Nothing registered to study yet.</p>`}
      </div>

      <div class="grid-4">
        <div class="card stat" style="margin-bottom:0"><div class="num">${Store.streak()}</div><div class="lbl">day streak</div></div>
        <div class="card stat" style="margin-bottom:0"><div class="num">${masteredTotal}<span class="muted" style="font-size:15px">/${cardTotal}</span></div><div class="lbl">cards mastered</div></div>
        <div class="card stat" style="margin-bottom:0"><div class="num">${ps.attempts}</div><div class="lbl">problems attempted</div></div>
        <div class="card stat" style="margin-bottom:0"><div class="num">${ps.attempts ? Math.round(100 * ps.accuracy) + "%" : "—"}</div><div class="lbl">first-try accuracy</div></div>
      </div>

      ${lastExam ? `<div class="card" style="margin-top:18px;">
        <h3 style="margin-top:0;">Last timed sitting</h3>
        <div class="topic-row">
          <span class="pill ${lastExam.correct / lastExam.n >= 0.8 ? "pill-green" : lastExam.correct / lastExam.n >= 0.6 ? "pill-amber" : "pill-red"}">${Math.round(100 * lastExam.correct / lastExam.n)}%</span>
          <div style="flex:1;">${lastExam.label} · ${lastExam.correct}/${lastExam.n} · ${lastExam.scopeLabel || ""}</div>
          <a class="btn btn-sm btn-ghost" href="#/exam">Sit another</a>
        </div>
      </div>` : ""}

      <div class="grid-2" style="margin-top:18px;">
        ${unitCards}
      </div>

      <div class="card" style="margin-top:18px;">
        <h3 style="margin-top:0;">Coming up</h3>
        ${upcoming.length ? upcoming.map(k => `
          <div class="topic-row">
            <span class="pill ${k.kind === "exam" ? "pill-red" : k.kind === "hw" ? "pill-amber" : ""}">${fmtDate(k.date)}</span>
            <div style="flex:1;">${k.label}</div>
            <span class="muted">${inDays(daysUntil(k.date))}</span>
          </div>`).join("") : `<p class="muted">No upcoming dates on record.</p>`}
        <p class="muted" style="margin-bottom:0;">Quizzes are given most Wednesdays and cover the previous week's classes and homework — see the <a href="#/schedule">schedule</a>.</p>
      </div>`;
    typeset(el);
  }

  function greeting() {
    const h = new Date().getHours();
    const g = h < 5 ? "Late-night session" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    return g + " 👋";
  }

  /* ---------- Schedule ---------- */
  function schedule(el) {
    const wk = MATH340.currentWeek();
    const rows = MATH340.schedule.map(r => `
      <tr class="${r.week === wk ? "current-week" : ""}">
        <td><span class="week-badge">Week ${r.week}</span>${r.week === wk ? ` <span class="pill pill-accent">now</span>` : ""}</td>
        <td>${r.topic}</td>
        <td>${r.quiz ? `<span class="pill pill-amber">Quiz Wed</span>` : ""}</td>
      </tr>`).join("");

    el.innerHTML = `
      <div class="card">
        <h2>Course Schedule</h2>
        <p class="muted">${MATH340.course.code} · ${MATH340.course.term} · ${MATH340.course.instructor} — MWF 1:50–3:00 pm. Tentative; chapters refer to ${MATH340.course.textbook}.</p>
        <table class="tbl">
          <tr><th>Week</th><th>Topics</th><th></th></tr>
          ${rows}
        </table>
      </div>

      <div class="grid-2">
        <div class="card" style="margin-bottom:0;">
          <h3 style="margin-top:0;">Key dates</h3>
          ${MATH340.keyDates.map(k => `
            <div class="topic-row">
              <span class="pill ${k.kind === "exam" ? "pill-red" : k.kind === "hw" ? "pill-amber" : ""}">${fmtDate(k.date)}</span>
              <div style="flex:1;">${k.label}</div>
            </div>`).join("")}
        </div>
        <div class="card" style="margin-bottom:0;">
          <h3 style="margin-top:0;">Grade weighting</h3>
          ${MATH340.gradeWeights.map(g => `
            <div style="display:flex; align-items:center; gap:10px; margin:9px 0;">
              <div style="width:110px; font-size:13.5px;">${g.name}</div>
              <div class="progress-bar" style="flex:1;"><div style="width:${g.pct * 3}%"></div></div>
              <div style="width:38px; text-align:right; font-size:13px;" class="muted">${g.pct}%</div>
            </div>`).join("")}
          <p class="muted" style="margin-bottom:0;">Lowest quiz and lowest homework are dropped. Midterm allows one 8.5×11" formula sheet — build it on the <a href="#/reference">Reference page</a> and print it.</p>
        </div>
      </div>`;
    typeset(el);
  }

  /* ---------- Reference ---------- */

  /* The reference page doubles as the formula-sheet builder: tick the
   * identities you want, then print. The midterm allows one 8.5x11"
   * sheet, so this is a graded artefact, not a nicety. */
  function reference(el) {
    const sel = Store.sheet();
    let html = "";
    // Searchable text travels with each row so filtering is a class toggle
    // rather than a re-render — re-running KaTeX on every keystroke is slow
    // enough to feel broken, and it fights the caret.
    const key = (...parts) => escapeAttr(parts.map(plain).join(" "));

    // "How do I choose?" guides, where a unit supplies one.
    for (const u of MATH340.units) {
      if (!u.methodGuide || !u.methodGuide.length) continue;
      const rows = u.methodGuide;
      html += `
        <div class="card no-print ref-sec" data-sec>
          <h2>${u.short || u.title} — choosing the right tool</h2>
          <p class="muted">The identities below are the easy part; picking the right one under time pressure is not. Read this column-by-column: the question's wording is the clue.</p>
          <table class="tbl guide-tbl">
            <tr><th style="width:34%">When the question says…</th><th style="width:26%">Reach for</th><th>Because</th></tr>
            ${rows.map(g => `<tr class="ref-hit" data-k="${key(g.when, g.use, g.why)}"><td>${g.when}</td><td><b>${g.use}</b></td><td class="muted">${g.why}</td></tr>`).join("")}
          </table>
        </div>`;
    }

    // Identity sheets per chapter (rendered from the flashcards' backs).
    for (const u of MATH340.units) {
      if (u.referenceTable) continue;
      if (!u.flashcards || !u.flashcards.length) continue;
      const cards = u.flashcards;
      html += `
        <div class="card ref-group ref-sec" data-sec>
          <div class="ref-group-head no-print">
            <h2 style="margin:0">${u.title}</h2>
            <button class="btn btn-ghost btn-sm" data-all="${u.id}">Select all</button>
            <button class="btn btn-ghost btn-sm" data-none="${u.id}">Clear</button>
          </div>
          <p class="muted no-print">${u.description || ""}</p>
          ${cards.map(c => `
            <div class="ident-item ref-hit ${sel.has(c.id) ? "picked" : ""}" data-ident="${c.id}" data-k="${key(c.front, c.back, c.tag || "")}">
              <label class="ident-pick no-print"><input type="checkbox" data-pick="${escapeAttr(c.id)}" ${sel.has(c.id) ? "checked" : ""} aria-label="Add to formula sheet"></label>
              <div style="flex:1;min-width:0;">
                <div class="ident-name">${c.tag ? `<span class="pill" style="margin-right:8px">${c.tag}</span>` : ""}${c.front}</div>
                <div class="ident-formula">${c.back}</div>
              </div>
            </div>`).join("")}
        </div>`;
    }

    // Distribution table.
    for (const u of MATH340.units) {
      if (!u.referenceTable) continue;
      const dists = u.referenceTable;
      html += `<div class="card no-print ref-sec" data-sec><h2 class="ref-hit" data-k="${key(u.title, u.description)}">${u.title}</h2><p class="muted ref-hit" data-k="${key(u.title, u.description)}">${u.description}</p></div>`;
      for (const d of dists) {
        const id = "dist:" + d.name;
        html += `
          <div class="card dist-card ref-group ref-hit ${sel.has(id) ? "picked" : ""}" data-ident="${escapeAttr(id)}" data-k="${key(d.name, d.story, d.params, d.pmf, d.type)}">
            <div class="dist-head">
              <label class="ident-pick no-print"><input type="checkbox" data-pick="${escapeAttr(id)}" ${sel.has(id) ? "checked" : ""} aria-label="Add to formula sheet"></label>
              <h3>${d.name}</h3>
              <span class="muted">\\(${d.params}\\)</span>
              <span class="pill ${d.type === "discrete" ? "pill-accent" : "pill-green"}">${d.type}</span>
            </div>
            <p class="muted" style="margin: 8px 0 4px;">${d.story}</p>
            <div class="dist-body">
              <table class="tbl">
                <tr><th style="width:130px">Support</th><td>\\(${d.support}\\)</td></tr>
                <tr><th>${d.type === "discrete" ? "PMF" : "PDF"}</th><td>\\(${d.pmf}\\)</td></tr>
                <tr><th>Mean</th><td>\\(${d.mean}\\)</td></tr>
                <tr><th>Variance</th><td>\\(${d.variance}\\)</td></tr>
                <tr><th>MGF</th><td>\\(${d.mgf}\\)</td></tr>
              </table>
            </div>
          </div>`;
      }
    }

    el.innerHTML = `
      <div class="card no-print">
        <h2>Reference &amp; formula sheet</h2>
        <p class="muted">Every identity from the decks on one searchable page. Tick the ones you want and print: the midterm allows a single 8.5×11" sheet, and the print layout drops everything unticked and sets your selection in two dense columns. Roughly 25 entries fit on a side — which is the useful kind of constraint. Tick what you would actually forget, print it, and untick until it fits. Your selection is saved and travels in your progress export.</p>
        <div class="toolbar">
          <input type="text" class="select" id="refSearch" placeholder="Search identities, distributions, keywords…" style="flex:1;min-width:220px" aria-label="Search reference">
          <span class="pill ${sel.size ? "pill-accent" : ""}" id="selCount">${sel.size} selected</span>
          <button class="btn" id="refPrint" ${sel.size ? "" : "disabled"}>⎙ Print formula sheet</button>
          <button class="btn btn-ghost" id="refClear" ${sel.size ? "" : "disabled"}>Clear selection</button>
        </div>
      </div>
      ${html || `<div class="empty-state"><div class="big">Σ</div>No reference material registered yet.</div>`}
      <div class="empty-state no-print" id="refEmpty" hidden><div class="big">Σ</div>Nothing here matches that search.</div>
      <div class="print-only sheet-head">
        <b>${MATH340.course.code} ${MATH340.course.name}</b> — formula sheet · ${sel.size} entries
      </div>`;

    const hits = [...el.querySelectorAll(".ref-hit")];
    const secs = [...el.querySelectorAll("[data-sec]")];
    el.querySelector("#refSearch").addEventListener("input", e => {
      const q = e.target.value.trim().toLowerCase();
      for (const h of hits) h.hidden = !!q && !h.dataset.k.includes(q);
      let any = false;
      for (const sec of secs) {
        const live = [...sec.querySelectorAll(".ref-hit")].some(h => !h.hidden);
        sec.hidden = !live;
        any = any || live;
      }
      // Distribution cards are sections in their own right.
      for (const d of el.querySelectorAll(".dist-card.ref-hit")) any = any || !d.hidden;
      el.querySelector("#refEmpty").hidden = any;
    });
    el.querySelectorAll("[data-pick]").forEach(box => box.addEventListener("change", () => {
      Store.toggleSheet(box.dataset.pick);
      const row = box.closest("[data-ident]");
      if (row) row.classList.toggle("picked", box.checked);
      const n = Store.sheet().size;
      el.querySelector("#selCount").textContent = n + " selected";
      el.querySelector("#selCount").classList.toggle("pill-accent", n > 0);
      el.querySelector("#refPrint").disabled = !n;
      el.querySelector("#refClear").disabled = !n;
    }));
    el.querySelectorAll("[data-all]").forEach(b => b.addEventListener("click", () => {
      const u = MATH340.getUnit(b.dataset.all);
      Store.setSheet([...Store.sheet(), ...u.flashcards.map(c => c.id)]);
      reference(el);
    }));
    el.querySelectorAll("[data-none]").forEach(b => b.addEventListener("click", () => {
      const u = MATH340.getUnit(b.dataset.none);
      const ids = new Set(u.flashcards.map(c => c.id));
      Store.setSheet([...Store.sheet()].filter(id => !ids.has(id)));
      reference(el);
    }));
    el.querySelector("#refPrint").addEventListener("click", () => {
      document.body.classList.add("printing-sheet");
      window.print();
      setTimeout(() => document.body.classList.remove("printing-sheet"), 500);
    });
    el.querySelector("#refClear").addEventListener("click", () => { Store.setSheet([]); reference(el); });
    typeset(el);
  }

  /* ---------- Progress ---------- */
  function progress(el) {
    const decks = MATH340.units.filter(u => u.flashcards && u.flashcards.length);
    let deckRows = "";
    for (const u of decks) {
      const s = Store.deckStats(u.flashcards);
      deckRows += `
        <div class="deck-row">
          <div class="deck-info">
            <div class="deck-name">${u.title}</div>
            <div class="deck-meta">${s.started}/${s.total} cards started · ${s.mastered} mastered (box ${Store.MASTER_BOX}+)</div>
          </div>
          <div class="deck-bar">
            <div class="progress-bar green"><div style="width:${Math.round(s.mastery * 100)}%"></div></div>
            <div class="muted" style="text-align:right; margin-top:3px">${Math.round(s.mastery * 100)}%</div>
          </div>
        </div>`;
    }

    let topicRows = "", weakShapes = "";
    for (const u of MATH340.units) {
      for (const g of (u.generators || [])) {
        const p = Store.getPractice(g.id);
        if (!p.attempts) continue;
        const acc = Math.round(100 * p.correct / p.attempts);
        const recentAcc = p.recent.length ? Math.round(100 * p.recent.reduce((a, b) => a + b, 0) / p.recent.length) : null;
        const seen = Object.keys(p.variants || {}).length, total = (g.variantNames || []).length;
        topicRows += `
          <tr>
            <td>${g.name}<div class="muted" style="font-size:12px">${u.short || u.title} · ${seen}/${total} shapes seen</div></td>
            <td>${p.correct}/${p.attempts}</td>
            <td>${acc}%</td>
            <td>${recentAcc == null ? "—" : recentAcc + "%"} ${recentAcc != null && recentAcc >= 80 ? `<span class="pill pill-green">solid</span>` : recentAcc != null && recentAcc < 50 ? `<span class="pill pill-red">review</span>` : ""}</td>
          </tr>`;
        for (const v of Store.weakVariants(g.id)) {
          weakShapes += `<tr><td>${v.name}<div class="muted" style="font-size:12px">${g.name}</div></td><td>${v.correct}/${v.attempts}</td><td>${Math.round(100 * v.acc)}%</td></tr>`;
        }
      }
    }

    // last 14 days of activity
    let actCells = "";
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const n = Store.activityOn(d);
      const level = n === 0 ? "var(--surface-2)" : n < 10 ? "color-mix(in srgb, var(--accent) 35%, var(--surface-2))" : n < 30 ? "color-mix(in srgb, var(--accent) 65%, var(--surface-2))" : "var(--accent)";
      actCells += `<div title="${d.toDateString()}: ${n} reviews" style="width:22px;height:22px;border-radius:5px;background:${level}"></div>`;
    }

    const exams = Store.exams();
    const misses = Store.missCount();

    el.innerHTML = `
      <div class="grid-3">
        <div class="card stat" style="margin-bottom:0"><div class="num">${Store.streak()}</div><div class="lbl">day streak</div></div>
        <div class="card stat" style="margin-bottom:0"><div class="num">${Store.totalReviews()}</div><div class="lbl">total reviews & problems</div></div>
        <div class="card stat" style="margin-bottom:0"><div class="num">${misses}</div><div class="lbl">problems in redo queue</div></div>
      </div>

      <div class="card" style="margin-top:18px;">
        <h3 style="margin-top:0;">Last 14 days</h3>
        <div style="display:flex; gap:5px; flex-wrap:wrap;">${actCells}</div>
      </div>

      ${exams.length ? `<div class="card">
        <h3 style="margin-top:0;">Timed sittings</h3>
        <table class="tbl">
          <tr><th>When</th><th>Set</th><th>Score</th></tr>
          ${exams.slice(0, 8).map(e => `<tr>
            <td class="muted">${new Date(e.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</td>
            <td>${e.label}<div class="muted" style="font-size:12px">${e.scopeLabel || ""}</div></td>
            <td><b>${e.correct}/${e.n}</b> <span class="pill ${e.correct / e.n >= 0.8 ? "pill-green" : e.correct / e.n >= 0.6 ? "pill-amber" : "pill-red"}">${Math.round(100 * e.correct / e.n)}%</span></td>
          </tr>`).join("")}
        </table>
      </div>` : ""}

      <div class="card">
        <h3 style="margin-top:0;">Flashcard mastery by unit</h3>
        ${deckRows || `<p class="muted">No decks registered yet.</p>`}
      </div>

      <div class="card">
        <h3 style="margin-top:0;">Practice accuracy by topic</h3>
        <p class="muted" style="margin-top:0;">First-try, unaided answers only — a hint or a second attempt counts as a miss, because a quiz gives you neither.</p>
        ${topicRows ? `<table class="tbl"><tr><th>Topic</th><th>Correct</th><th>Overall</th><th>Last 10</th></tr>${topicRows}</table>`
          : `<p class="muted">No practice attempts yet — head to <a href="#/practice">Practice</a> to get started.</p>`}
      </div>

      ${weakShapes ? `<div class="card">
        <h3 style="margin-top:0;">Specific problem shapes to work on</h3>
        <p class="muted" style="margin-top:0;">A topic's average can look fine while one shape inside it keeps catching you. These are the shapes below 60%.</p>
        <table class="tbl"><tr><th>Shape</th><th>Correct</th><th>Rate</th></tr>${weakShapes}</table>
      </div>` : ""}

      <div class="card">
        <h3 style="margin-top:0;">Backup</h3>
        <p class="muted">Progress lives in this browser (localStorage). Export it to move between devices, or if you clear browser data.</p>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-ghost btn-sm" id="expBtn">Export progress</button>
          <button class="btn btn-ghost btn-sm" id="impBtn">Import progress</button>
          <button class="btn btn-ghost btn-sm" id="clrMiss" ${misses ? "" : "disabled"}>Clear redo queue</button>
          <button class="btn btn-ghost btn-sm" id="rstBtn" style="color:var(--red)">Reset all progress</button>
          <input type="file" id="impFile" accept="application/json" style="display:none">
        </div>
      </div>`;

    el.querySelector("#expBtn").addEventListener("click", () => {
      const blob = new Blob([Store.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "math340-progress.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    const impFile = el.querySelector("#impFile");
    el.querySelector("#impBtn").addEventListener("click", () => impFile.click());
    impFile.addEventListener("change", () => {
      const f = impFile.files[0];
      if (!f) return;
      f.text().then(t => {
        try { Store.importJSON(t); progress(el); }
        catch (e) { alert("Could not import: " + e.message); }
      });
    });
    el.querySelector("#clrMiss").addEventListener("click", () => {
      if (!misses) return;
      if (confirm(`Discard all ${misses} problems in the redo queue?`)) { Store.clearAllMisses(); progress(el); }
    });
    el.querySelector("#rstBtn").addEventListener("click", () => {
      if (confirm("Reset ALL flashcard and practice progress? This cannot be undone.")) {
        Store.reset(); progress(el);
      }
    });
    typeset(el);
  }

  /* ---------- Router ---------- */
  const routes = {
    dashboard: { title: "Dashboard", mount: dashboard },
    flashcards: { title: "Flashcards", mount: el => Flashcards.mount(el) },
    practice: { title: "Practice", mount: el => Practice.mount(el) },
    exam: { title: "Exam Mode", mount: el => Exam.mount(el) },
    reference: { title: "Reference", mount: reference },
    schedule: { title: "Schedule", mount: schedule },
    progress: { title: "Progress", mount: progress },
  };

  function route() {
    const hash = (location.hash || "#/dashboard").replace(/^#\//, "");
    const name = routes[hash] ? hash : "dashboard";
    if (name !== "exam") Exam.leave();   // stop the countdown when leaving
    const r = routes[name];
    titleEl.textContent = r.title;
    weekEl.textContent = weekLabel();
    document.querySelectorAll(".nav a").forEach(a =>
      a.classList.toggle("active", a.dataset.route === name));
    view.scrollTop = 0;
    window.scrollTo(0, 0);
    r.mount(view);
    document.getElementById("sidebar").classList.remove("open");
    document.body.classList.remove("nav-open");
  }

  /* ---------- Theme ---------- */
  function applyTheme(t) {
    if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else if (t === "light") document.documentElement.removeAttribute("data-theme");
    else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
      document.documentElement.setAttribute("data-theme", "dark");
  }

  /* ---------- init ---------- */
  window.addEventListener("hashchange", route);
  /* Clicking a nav link for the route you are already on fires no
   * hashchange, which would leave you stuck inside a flashcard session or a
   * practice problem with a dead sidebar. Re-mount the view explicitly. */
  document.addEventListener("click", e => {
    const link = e.target.closest(".nav a[data-route]");
    if (!link) return;
    if ("#/" + link.dataset.route === (location.hash || "#/dashboard")) { e.preventDefault(); route(); }
  });
  window.addEventListener("beforeunload", e => {
    if (Exam.inProgress()) { e.preventDefault(); e.returnValue = ""; }
  });
  window.addEventListener("DOMContentLoaded", () => {
    applyTheme(Store.getTheme());
    document.getElementById("themeToggle").addEventListener("click", () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      const next = dark ? "light" : "dark";
      Store.setTheme(next);
      applyTheme(next);
    });
    /* Mobile nav. The open sidebar sits over the topbar, hamburger included,
     * so it needs a way out that is not "pick a destination": a backdrop tap
     * or Escape closes it. */
    const sidebar = document.getElementById("sidebar");
    const setNav = open => {
      sidebar.classList.toggle("open", open);
      document.body.classList.toggle("nav-open", open);
    };
    document.getElementById("hamburger").addEventListener("click", e => {
      e.stopPropagation();
      setNav(!sidebar.classList.contains("open"));
    });
    document.addEventListener("click", e => {
      if (sidebar.classList.contains("open") && !e.target.closest("#sidebar")) setNav(false);
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && sidebar.classList.contains("open")) setNav(false);
    });
    document.addEventListener("keydown", e => {
      if ((location.hash || "").startsWith("#/flashcards") && !e.target.matches("input, textarea, select")) {
        Flashcards.onKey(e, view);
      }
    });
    route();
  });
  // KaTeX loads with defer; re-typeset once it is ready in case the first view rendered before it.
  window.addEventListener("load", () => typeset(view));

  return { typeset };
})();
