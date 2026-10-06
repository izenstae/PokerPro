/* ============================================================
 * Practice view — generated problems with worked solutions.
 *
 * Three session types share one problem runner:
 *   · topic   — drill one named technique
 *   · mixed   — interleaved topics, weighted toward your weak ones
 *   · redo    — re-attempt problems you previously got wrong
 * plus a separate "which method?" recognition drill.
 *
 * Two deliberate choices about feedback, both about learning rather
 * than scorekeeping:
 *   1. A wrong answer buys a hint and a second attempt instead of the
 *      full solution. Getting unstuck beats being told.
 *   2. Only *unaided, first-attempt* answers count as correct in your
 *      stats — that is the number that predicts how an exam will go.
 * ============================================================ */
const Practice = (() => {
  let current = null;   // active problem, see start()
  let filterUnit = "all";

  /* ---------------- answer parsing ---------------- */

  function parseAnswer(text) {
    text = (text || "").trim().replace(/\s+/g, "");
    if (!text) return NaN;
    // thousands separators, e.g. "17,576,000" — counting answers get large enough
    // that writing them out this way is natural. The pattern is deliberately strict
    // so a decimal comma ("1,5") is still rejected rather than read as 15.
    if (/^-?\d{1,3}(,\d{3})+$/.test(text)) text = text.replace(/,/g, "");
    // percentage, e.g. "25%"
    if (/^-?\d*\.?\d+%$/.test(text)) return parseFloat(text) / 100;
    // fraction, e.g. "5/36" or "0.5/2"
    const frac = text.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
    if (frac) {
      const den = parseFloat(frac[2]);
      return den === 0 ? NaN : parseFloat(frac[1]) / den;
    }
    // scientific or plain number
    const v = Number(text);
    return Number.isFinite(v) ? v : NaN;
  }

  // Decimal places in a plainly-typed decimal, or -1 if it isn't one.
  function typedDecimals(text) {
    const m = (text || "").trim().replace(/\s+/g, "").match(/^-?\d*\.(\d+)$/);
    return m ? m[1].length : -1;
  }

  function round(x, d) { const p = Math.pow(10, d); return Math.round(x * p) / p; }

  /* Correct if the value is within tolerance, OR if the student simply
   * rounded — someone who writes 0.14 for 0.1389 has done the problem.
   * The rounding allowance is capped at 5% relative error so it cannot
   * rescue an answer that is merely in the neighbourhood. */
  function checkAnswer(problem, userValue, text) {
    if (!Number.isFinite(userValue)) return false;
    const ans = problem.answer;
    // Counts are exact. The old half-unit window quietly accepted 119.6 for
    // 120; this only absorbs floating-point noise.
    if (problem.kind === "count") return Math.abs(userValue - ans) < 1e-6;
    const tol = problem.tol != null ? problem.tol : Math.max(0.0006, Math.abs(ans) * 0.004);
    if (Math.abs(userValue - ans) <= tol) return true;
    const d = typedDecimals(text);
    if (d >= 2 && Math.abs(userValue - ans) <= Math.max(Math.abs(ans) * 0.05, 1e-9)) {
      return round(ans, d) === round(userValue, d);
    }
    return false;
  }

  function roundedNotExact(problem, userValue, text) {
    if (problem.kind === "count") return false;
    const tol = problem.tol != null ? problem.tol : Math.max(0.0006, Math.abs(problem.answer) * 0.004);
    return Math.abs(userValue - problem.answer) > tol;
  }

  /* A wrong answer often *is* a recognisable mistake. Naming it is worth
   * more than "incorrect", and these three account for most of them. */
  function diagnose(problem, u) {
    const a = problem.answer;
    const close = (x, y) => Math.abs(x - y) <= Math.max(0.004, Math.abs(y) * 0.01);
    if (problem.kind === "prob") {
      if (u > 1 || u < 0) {
        return `A probability has to lie in \\([0, 1]\\) — that answer cannot be right whatever the arithmetic says. Check what you divided by.`;
      }
      if (close(u, 1 - a)) {
        return `That is the <b>complement</b> of the answer: you computed \\(P(A^c)\\) where the question asked for \\(P(A)\\) (or the other way round). Subtract from 1.`;
      }
    }
    if (problem.kind === "count" && !Number.isInteger(u)) {
      return `Counts are whole numbers — a fraction here usually means a probability was computed instead of a count.`;
    }
    if (a > 0 && a < 1 && close(u, a / (1 - a))) {
      return `That is the <b>odds</b> \\(P(A)/P(A^c)\\), not the probability. Convert back with \\(P = \\text{odds}/(1 + \\text{odds})\\).`;
    }
    if (u > 0 && a > 0 && close(u, a / (1 + a))) {
      return `That looks like a probability where the question asked for <b>odds</b> (or vice versa): \\(\\text{odds} = P/(1-P)\\).`;
    }
    return null;
  }

  /* ---------------- solution steps (used as progressive hints) ---------------- */

  function solSteps(sol) {
    const parts = (sol.match(/<div class="sol-step">[\s\S]*?<\/div>/g) || []);
    return parts.length ? parts : [sol];
  }

  /* ---------------- topic pools ---------------- */

  function unitsWithGenerators() {
    return MATH340.units.filter(u => u.generators && u.generators.length);
  }

  function poolFor(unitId) {
    const pool = [];
    for (const u of unitsWithGenerators()) {
      if (unitId && unitId !== "all" && unitId !== u.id) continue;
      pool.push(...u.generators);
    }
    return pool;
  }

  function findGen(id) {
    for (const u of MATH340.units) {
      for (const g of (u.generators || [])) if (g.id === id) return { gen: g, unit: u };
    }
    return null;
  }

  /* ---------------- home ---------------- */

  function home(el) {
    current = null;
    const units = unitsWithGenerators();
    const opts = [`<option value="all">All chapters</option>`]
      .concat(units.map(u => `<option value="${u.id}" ${filterUnit === u.id ? "selected" : ""}>${u.title}</option>`)).join("");

    const missCount = Store.missCount();
    const scopePool = poolFor(filterUnit);
    const weakest = scopePool
      .map(g => ({ g, w: Store.weakness(g.id), p: Store.getPractice(g.id) }))
      .filter(x => x.p.attempts >= 2)
      .sort((a, b) => b.w - a.w).slice(0, 3);

    let rows = "";
    for (const u of units) {
      if (filterUnit !== "all" && filterUnit !== u.id) continue;
      for (const g of u.generators) {
        const p = Store.getPractice(g.id);
        const nTypes = (g.variantNames || []).length;
        const acc = p.attempts ? Math.round(100 * p.correct / p.attempts) : null;
        const recent = p.recent.slice(-5).map(r => r
          ? `<span style="color:var(--green)">●</span>`
          : `<span style="color:var(--red)">●</span>`).join(" ");
        const seenTypes = Object.keys(p.variants || {}).length;
        rows += `
          <div class="topic-row">
            <div style="flex:1; min-width:0;">
              <div class="deck-name">${g.name}</div>
              <div class="deck-meta">${g.blurb || ""} · <span class="pill">${u.short || u.title}</span> <span class="pill">${seenTypes}/${nTypes} problem types seen</span></div>
            </div>
            <div class="muted" style="min-width:110px; text-align:right;">
              ${p.attempts ? `${p.correct}/${p.attempts} (${acc}%)<br><span style="font-size:11px">${recent}</span>` : "not started"}
            </div>
            <button class="btn btn-sm" data-gen="${g.id}">Practice</button>
          </div>`;
      }
    }

    el.innerHTML = `
      <div class="card">
        <h2>Practice Problems</h2>
        <p class="muted">Each topic is a family of <em>structurally different</em> problems, not one template with the numbers shuffled — a topic cycles through all of its problem types before any of them repeats, so you practise recognising which method applies, not just executing it. Answers accept decimals (<code>0.1389</code>), fractions (<code>5/36</code>), or percents (<code>13.9%</code>), and sensible rounding is fine.</p>
        <div class="toolbar">
          <select class="select" id="pFilter" aria-label="Chapter filter">${opts}</select>
          <button class="btn" id="pWeak">◎ Target my weak spots</button>
          <button class="btn btn-ghost" id="pMix">▶ Mixed session</button>
          <button class="btn btn-ghost" id="pIdent">⁇ Which method? drill</button>
          <button class="btn btn-ghost" id="pRedo" ${missCount ? "" : "disabled"}>↺ Redo my misses${missCount ? ` (${missCount})` : ""}</button>
        </div>
        <p class="muted" style="margin:-8px 0 16px;">In a mixed session the topic is hidden until you answer — working out <em>which</em> tool applies is the part an exam actually tests. The percentages below are <b>first-try, unaided</b> accuracy: a hint or a second attempt counts as a miss, because that is what a quiz would do.</p>
        ${weakest.length ? `<div class="callout">
          <b>Weakest right now:</b> ${weakest.map(x => `${x.g.name} <span class="muted">(${Math.round(100 * x.p.correct / x.p.attempts)}%)</span>`).join(" · ")}.
          "Target my weak spots" draws mostly from these.
        </div>` : ""}
        <div>${rows || `<div class="empty-state">No practice topics in this chapter yet.</div>`}</div>
      </div>`;

    el.querySelector("#pFilter").addEventListener("change", e => { filterUnit = e.target.value; home(el); });
    el.querySelector("#pMix").addEventListener("click", () => startMixed(el, "mixed"));
    el.querySelector("#pWeak").addEventListener("click", () => startMixed(el, "weak"));
    el.querySelector("#pIdent").addEventListener("click", () => Identify.start(el, filterUnit));
    const redo = el.querySelector("#pRedo");
    if (missCount) redo.addEventListener("click", () => startRedo(el));
    el.querySelectorAll("[data-gen]").forEach(b =>
      b.addEventListener("click", () => startTopic(el, b.dataset.gen)));
    App.typeset(el);
  }

  /* ---------------- session starters ---------------- */

  function startTopic(el, genId) {
    const found = findGen(genId);
    if (!found) return home(el);
    current = newProblem(found.gen, found.unit, { mode: "topic" });
    render(el);
  }

  function startMixed(el, mode) {
    const pool = poolFor(filterUnit);
    if (!pool.length) return home(el);
    const gen = mode === "weak"
      ? Store.pickWeighted(pool, null)
      : MATH340.util.rotate("mixed:" + filterUnit, pool);
    const found = findGen(gen.id);
    current = newProblem(found.gen, found.unit, { mode, filter: filterUnit });
    render(el);
  }

  function startRedo(el) {
    const queue = Store.misses();
    if (!queue.length) return home(el);
    runRedo(el, queue, 0);
  }

  function runRedo(el, queue, idx) {
    if (idx >= queue.length) {
      el.innerHTML = `
        <div class="card" style="max-width:820px;margin:0 auto;text-align:center;padding:36px 24px;">
          <div style="font-size:38px;">✓</div>
          <h2>Miss queue cleared</h2>
          <p class="muted">Every problem you got right has been removed from the log; the ones you missed again are still there.</p>
          <button class="btn" id="redoDone">Back to practice</button>
        </div>`;
      el.querySelector("#redoDone").addEventListener("click", () => home(el));
      return;
    }
    const m = queue[idx];
    const found = findGen(m.genId);
    current = {
      gen: found ? found.gen : { id: m.genId, name: m.genName || m.genId },
      unit: found ? found.unit : { id: m.unitId, short: m.unitShort || "" },
      problem: { q: m.q, sol: m.sol, answer: m.answer, kind: m.kind, variant: m.variant },
      mode: "redo", redo: { queue, idx, key: m.key },
      attempts: 0, hintsShown: 0, answered: false, aided: false,
    };
    render(el);
  }

  function newProblem(gen, unit, opts) {
    return {
      gen, unit, problem: gen.make(),
      mode: opts.mode, filter: opts.filter,
      attempts: 0, hintsShown: 0, answered: false, aided: false,
    };
  }

  function nextProblem(el) {
    const c = current;
    if (c.mode === "redo") return runRedo(el, c.redo.queue, c.redo.idx + 1);
    if (c.mode === "topic") return startTopic(el, c.gen.id);
    const pool = poolFor(c.filter);
    if (!pool.length) return home(el);
    const gen = c.mode === "weak"
      ? Store.pickWeighted(pool, c.gen.id)
      : MATH340.util.rotate("mixed:" + (c.filter || "all"), pool);
    const found = findGen(gen.id);
    current = newProblem(found.gen, found.unit, { mode: c.mode, filter: c.filter });
    render(el);
  }

  /* ---------------- problem runner ---------------- */

  function render(el) {
    const c = current;
    if (!c) return home(el);
    const p = c.problem;
    const steps = solSteps(p.sol);
    const stats = Store.getPractice(c.gen.id);
    // In a mixed session the topic is the thing under test, so it stays hidden
    // until the problem is over. In a single-topic drill you already know it.
    const hideTopic = (c.mode === "mixed" || c.mode === "weak") && !c.answered;
    const hideVariant = !c.answered;

    const label = c.mode === "redo"
      ? `<span class="pill pill-amber">Redo · ${c.redo.idx + 1} of ${c.redo.queue.length}</span>`
      : hideTopic
        ? `<span class="pill">${c.mode === "weak" ? "Weak-spot session" : "Mixed session"} · topic hidden</span>`
        : `<span class="pill pill-accent">${c.unit.short || c.unit.title}</span>` +
          (c.answered && p.variant ? ` <span class="pill">${p.variant}</span>` : "");

    el.innerHTML = `
      <div class="card" style="max-width: 820px; margin: 0 auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <span>${label}</span>
          <span class="muted">${hideTopic ? "" : c.gen.name + " · "}${stats.attempts ? `${stats.correct}/${stats.attempts} first-try` : "first attempt"}</span>
        </div>
        <div class="q-text" id="qText">${p.q}</div>
        <div class="answer-row">
          <input type="text" id="ansInput" aria-label="Your answer" placeholder="${p.kind === "count" ? "Enter a whole number…" : p.kind === "num" ? "Enter a number, e.g. 2.5 or 5/2…" : "Enter a probability, e.g. 0.25 or 1/4…"}" autocomplete="off" ${c.answered ? "disabled" : ""}>
          ${c.answered ? "" : `<button class="btn" id="ansCheck">Check</button>
          <button class="btn btn-ghost" id="ansHint">${steps.length > 1 ? "Hint" : "Show solution"}</button>`}
        </div>
        <div id="resultZone"></div>
        <div id="hintZone"></div>
        <div class="run-foot">
          <button class="btn btn-ghost btn-sm" id="pBack">← All topics</button>
          <span style="flex:1"></span>
          <span id="nextSlot"></span>
        </div>
      </div>`;

    const input = el.querySelector("#ansInput");
    const hintZone = el.querySelector("#hintZone");
    const resultZone = el.querySelector("#resultZone");
    const nextSlot = el.querySelector("#nextSlot");

    const showHint = () => {
      if (c.answered) return;
      c.aided = true;
      c.hintsShown = Math.min(c.hintsShown + 1, steps.length);
      if (c.hintsShown >= steps.length) return reveal(false, true);
      hintZone.innerHTML = `<div class="hint-box"><b>Hint ${c.hintsShown}</b>
        <span class="muted">— step ${c.hintsShown} of the worked solution. Using a hint logs this problem as a miss.</span>
        ${steps.slice(0, c.hintsShown).join("")}</div>`;
      const btn = el.querySelector("#ansHint");
      if (btn) btn.textContent = c.hintsShown + 1 >= steps.length ? "Show full solution" : "Another hint";
      App.typeset(hintZone);
      input.focus();
    };

    /* `solved` = answered correctly. `unaided` = solved on the first try with
     * no hints; that is what the stats record. */
    const reveal = (solved, gaveUp) => {
      if (c.answered) return;
      const unaided = solved && !c.aided && c.attempts <= 1;
      c.answered = true;

      if (c.mode === "redo") {
        if (solved) Store.clearMiss(c.redo.key);
      } else {
        Store.recordPractice(c.gen.id, unaided, p.variant);
        if (!unaided) {
          Store.recordMiss({
            genId: c.gen.id, genName: c.gen.name, unitId: c.unit.id,
            unitShort: c.unit.short || c.unit.title, variant: p.variant,
            q: p.q, sol: p.sol, answer: p.answer, kind: p.kind,
          });
        }
      }

      const verdict = solved
        ? (unaided ? `✓ Correct!` : `✓ Correct — but with ${c.aided ? "a hint" : "a second attempt"}, so it is logged as a miss and will come back in your redo queue.`)
        : gaveUp ? `Solution revealed — logged as a miss.` : `✗ Not quite.`;

      resultZone.innerHTML = `
        <div class="verdict ${solved && unaided ? "ok" : solved ? "warn" : "bad"}">${verdict}
          ${!solved ? ` The answer is <b>${MATH340.util.fmt(p.answer, 5)}</b>.` : ""}</div>
        ${c.note ? `<p class="muted" style="margin:6px 0 0;">${c.note}</p>` : ""}
        ${p.variant && (c.mode === "mixed" || c.mode === "weak")
          ? `<p class="muted" style="margin:6px 0 0;">Topic: <b>${c.gen.name}</b> · shape: <b>${p.variant}</b></p>` : ""}
        <div class="solution"><b>Worked solution</b>${p.sol}</div>`;
      hintZone.innerHTML = "";
      input.disabled = true;
      el.querySelectorAll(".answer-row button").forEach(b => b.remove());

      const next = document.createElement("button");
      next.className = "btn"; next.id = "pNext";
      next.textContent = c.mode === "redo"
        ? (c.redo.idx + 1 >= c.redo.queue.length ? "Finish redo →" : "Next miss →")
        : "Next problem →";
      nextSlot.appendChild(next);
      next.addEventListener("click", () => nextProblem(el));
      next.focus();
      App.typeset(resultZone);
    };

    if (!c.answered) {
      el.querySelector("#ansCheck").addEventListener("click", () => {
        const text = input.value;
        const v = parseAnswer(text);
        if (!Number.isFinite(v)) {
          resultZone.innerHTML = `<div class="verdict bad">Please enter a number, fraction (<code>5/36</code>), or percent (<code>13.9%</code>).</div>`;
          return;
        }
        c.attempts++;
        if (checkAnswer(p, v, text)) {
          if (roundedNotExact(p, v, text)) {
            c.note = `Accepted as a correct rounding — the exact value is \\(${MATH340.util.fmt(p.answer, 6)}\\).`;
          }
          return reveal(true, false);
        }
        if (c.attempts === 1 && !c.aided) {
          // First slip: a nudge and another go, rather than the whole answer.
          const why = diagnose(p, v);
          resultZone.innerHTML = `<div class="verdict bad">✗ Not quite — try once more.</div>
            ${why ? `<p class="muted" style="margin:6px 0 0;">${why}</p>` : ""}`;
          App.typeset(resultZone);
          showHint();
          input.select();
          return;
        }
        c.note = diagnose(p, v);
        reveal(false, false);
      });
      el.querySelector("#ansHint").addEventListener("click", showHint);
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") el.querySelector("#ansCheck")?.click();
      });
      input.focus();
    }
    el.querySelector("#pBack").addEventListener("click", () => home(el));
    App.typeset(el);
  }

  return { mount: home, parseAnswer, checkAnswer, solSteps, poolFor, findGen };
})();

/* ============================================================
 * "Which method?" drill — a problem stem with no arithmetic to do,
 * and a choice of techniques. Reading a problem and knowing which
 * tool it wants is a separate skill from executing the tool, and it
 * is the one that decides most exam questions. Questions are built
 * from the existing generators, so it needs no content of its own.
 * ============================================================ */
const Identify = (() => {
  let s = null; // { pool, q, options, answerIdx, asked, right, unitId }

  function start(el, unitId) {
    const pool = Practice.poolFor(unitId);
    if (pool.length < 3) {
      el.innerHTML = `<div class="empty-state">The method drill needs at least three practice topics in scope — pick "All chapters".</div>`;
      return;
    }
    s = { pool, unitId, asked: 0, right: 0 };
    nextQ(el);
  }

  function nextQ(el) {
    const gen = MATH340.util.pick(s.pool);
    const problem = gen.make();
    const distractors = MATH340.util.shuffle(s.pool.filter(g => g.id !== gen.id)).slice(0, 3);
    const options = MATH340.util.shuffle([gen, ...distractors]);
    s.q = problem;
    s.gen = gen;
    s.options = options;
    s.picked = null;
    render(el);
  }

  function render(el) {
    const picked = s.picked;
    el.innerHTML = `
      <div class="card" style="max-width:820px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <span class="pill pill-accent">Which method?</span>
          <span class="muted">${s.asked ? `${s.right}/${s.asked} correct` : "no arithmetic needed — just name the tool"}</span>
        </div>
        <div class="q-text">${s.q.q}</div>
        <p class="muted" style="margin:-6px 0 14px;">Which technique does this problem call for? You do not need to work out the number.</p>
        <div class="mc-opts">
          ${s.options.map((g, i) => {
            let cls = "";
            if (picked != null) {
              if (g.id === s.gen.id) cls = picked === i ? "sel-right" : "reveal-right";
              else if (picked === i) cls = "sel-wrong";
            }
            return `<button class="mc-opt ${cls}" data-opt="${i}" ${picked != null ? "disabled" : ""}>${g.name}<div class="muted" style="font-size:12px;margin-top:2px">${g.blurb || ""}</div></button>`;
          }).join("")}
        </div>
        <div id="idResult"></div>
        <div class="run-foot">
          <button class="btn btn-ghost btn-sm" id="idBack">← All topics</button>
          <span style="flex:1"></span>
          ${picked != null ? `<button class="btn" id="idNext">Next →</button>` : ""}
        </div>
      </div>`;

    el.querySelectorAll("[data-opt]").forEach(b => b.addEventListener("click", () => {
      s.picked = Number(b.dataset.opt);
      s.asked++;
      const correct = s.options[s.picked].id === s.gen.id;
      if (correct) s.right++;
      render(el);
      const zone = el.querySelector("#idResult");
      zone.innerHTML = `<div class="verdict ${correct ? "ok" : "bad"}">${correct ? "✓ Right" : "✗ It is " + s.gen.name}</div>
        <div class="solution"><b>Why</b><div class="sol-step">${s.gen.blurb || ""}</div>
        <div class="sol-step">Shape: <b>${s.q.variant}</b>. The first step of the worked solution:</div>
        ${Practice.solSteps(s.q.sol)[0]}</div>`;
      App.typeset(zone);
    }));
    el.querySelector("#idBack").addEventListener("click", () => Practice.mount(el));
    el.querySelector("#idNext")?.addEventListener("click", () => nextQ(el));
    App.typeset(el);
  }

  return { start };
})();
