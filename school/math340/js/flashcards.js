/* ============================================================
 * Flashcards view — Leitner spaced repetition over the decks
 * registered in MATH340.units.
 *
 * Two session shapes:
 *   · review — due cards first, then new ones (the daily habit)
 *   · cram   — everything in scope, weakest first, ignoring the
 *              schedule (the night before a quiz)
 *
 * A card you miss is re-queued a few cards later in the same session
 * rather than being deferred to tomorrow. Relearning it once, now, is
 * what stops the same card lapsing again next week.
 * ============================================================ */
const Flashcards = (() => {
  let session = null;   // { unit, queue, idx, revealed, right, wrong, relearn }

  const RELEARN_GAP = 4;   // cards to let pass before a missed card returns

  function decksHome(el) {
    session = null;
    const decks = MATH340.units.filter(u => u.flashcards && u.flashcards.length);
    const all = decks.flatMap(u => u.flashcards);
    const allStats = Store.deckStats(all);

    let html = `
      <div class="card">
        <h2>Flashcard Decks</h2>
        <p class="muted">Spaced repetition with Leitner boxes: answer a card correctly and it moves up a box (reviewed less often); miss it and it drops to box 1 <em>and comes back later in the same session</em>. A card in box ${Store.MASTER_BOX}+ of ${Store.MAX_BOX} counts as mastered, and the top box is not due again for three weeks — long enough to carry it to the final.</p>
        <div class="toolbar">
          <button class="btn" id="fcAll" ${allStats.due ? "" : "disabled"}>▶ Review everything due (${allStats.due})</button>
          <button class="btn btn-ghost" id="fcCramAll">⚡ Cram all decks, weakest first</button>
        </div>
        <div>`;
    for (const u of decks) {
      const s = Store.deckStats(u.flashcards);
      html += `
        <div class="deck-row">
          <div class="deck-info">
            <div class="deck-name">${u.title}</div>
            <div class="deck-meta">${s.total} cards · ${s.mastered} mastered · ${s.due} ready${s.fresh ? ` · ${s.fresh} never seen` : ""}</div>
          </div>
          <div class="deck-bar">
            <div class="progress-bar"><div style="width:${Math.round(s.mastery * 100)}%"></div></div>
            <div class="muted" style="text-align:right; margin-top:3px">${Math.round(s.mastery * 100)}%</div>
          </div>
          <button class="btn btn-sm btn-ghost" data-cram="${u.id}" title="Every card, weakest first, ignoring the schedule">Cram</button>
          <button class="btn btn-sm" data-deck="${u.id}">Study</button>
        </div>`;
    }
    html += `</div></div>
      <div class="card">
        <h3 style="margin-top:0">How to use this well</h3>
        <ul class="muted" style="margin:6px 0 0; padding-left: 20px;">
          <li>Say the answer <em>out loud or on paper</em> before flipping — recognition is not recall, and the flip feels far more convincing than it is.</li>
          <li>Grade yourself strictly. "Nearly" is a miss; the cost of an extra review is seconds, the cost of a false "got it" is a quiz mark.</li>
          <li>Review a little every day. Ten minutes daily beats an hour on Tuesday, and the schedule does the spacing for you.</li>
          <li>Before a Wednesday quiz, <b>cram</b> last week's chapter — that mode ignores the schedule and leads with your weakest cards.</li>
        </ul>
      </div>`;
    el.innerHTML = html;
    el.querySelectorAll("[data-deck]").forEach(b =>
      b.addEventListener("click", () => startSession(el, { unitId: b.dataset.deck, mode: "review" })));
    el.querySelectorAll("[data-cram]").forEach(b =>
      b.addEventListener("click", () => startSession(el, { unitId: b.dataset.cram, mode: "cram" })));
    el.querySelector("#fcAll").addEventListener("click", () => startSession(el, { unitId: null, mode: "review" }));
    el.querySelector("#fcCramAll").addEventListener("click", () => startSession(el, { unitId: null, mode: "cram" }));
    App.typeset(el);
  }

  function startSession(el, { unitId, mode }) {
    const units = unitId ? [MATH340.getUnit(unitId)] : MATH340.units.filter(u => u.flashcards && u.flashcards.length);
    const cards = units.flatMap(u => u.flashcards || []);
    const title = unitId ? units[0].title : "All decks";
    const short = unitId ? (units[0].short || units[0].title) : "All decks";

    let queue;
    if (mode === "cram") {
      // Weakest first: low box and repeated lapses lead, comfortable cards trail.
      queue = Store.weakCards(cards);
      if (!queue.length) queue = MATH340.util.shuffle(cards);
    } else {
      const now = Date.now();
      const due = [], fresh = [], later = [];
      for (const c of cards) {
        const st = Store.getCard(c.id);
        if (!st.seen) fresh.push(c);
        else if (st.due <= now) due.push(c);
        else later.push(c);
      }
      queue = MATH340.util.shuffle(due).concat(MATH340.util.shuffle(fresh), MATH340.util.shuffle(later));
    }

    session = { title, short, unitId, mode, queue, idx: 0, revealed: false, right: 0, wrong: 0, relearned: 0 };
    render(el);
  }

  function render(el) {
    const s = session;
    if (!s) return decksHome(el);
    if (s.idx >= s.queue.length) return renderDone(el);

    const card = s.queue[s.idx];
    const st = Store.getCard(card.id);
    const dots = Array.from({ length: Store.MAX_BOX }, (_, i) => `<span class="${i < st.box ? "on" : ""}"></span>`).join("");
    const seenBefore = s.queue.slice(0, s.idx).some(c => c.id === card.id);

    el.innerHTML = `
      <div class="fc-stage">
        <div class="fc-progress">
          ${s.short} · ${s.mode === "cram" ? "cram · " : ""}card ${s.idx + 1} of ${s.queue.length}
          <span style="margin-left:12px" class="pill pill-green">${s.right} ✓</span>
          <span class="pill pill-red">${s.wrong} ✗</span>
          ${seenBefore ? `<span class="pill pill-amber">second look</span>` : ""}
        </div>
        <div class="fc-card" id="fcCard" tabindex="0" role="button" aria-label="Flashcard — click to flip">
          <div class="fc-tag" style="display:flex; justify-content:space-between; align-items:center;">
            <span>${card.tag || ""}</span>
            <span class="box-dots" title="Leitner box ${st.box} of ${Store.MAX_BOX}">${dots}</span>
          </div>
          <div class="fc-front">${card.front}</div>
          ${s.revealed ? `<div class="fc-back">${card.back}</div>` : ""}
          ${s.revealed ? "" : `<div class="fc-hint">Answer it out loud first — then click or press Space to check</div>`}
        </div>
        <div class="fc-actions">
          ${s.revealed
            ? `<button class="btn btn-red" id="fcMiss">✗ Missed it <span class="kbd">1</span></button>
               <button class="btn btn-green" id="fcGot">✓ Got it <span class="kbd">2</span></button>`
            : `<button class="btn btn-ghost" id="fcSkipDeck">Back to decks</button>
               <button class="btn" id="fcReveal">Reveal <span class="kbd">space</span></button>`}
        </div>
      </div>`;

    const flip = () => { if (!s.revealed) { s.revealed = true; render(el); } };
    el.querySelector("#fcCard").addEventListener("click", flip);
    if (s.revealed) {
      el.querySelector("#fcGot").addEventListener("click", () => grade(el, true));
      el.querySelector("#fcMiss").addEventListener("click", () => grade(el, false));
    } else {
      el.querySelector("#fcReveal").addEventListener("click", flip);
      el.querySelector("#fcSkipDeck").addEventListener("click", () => decksHome(el));
    }
    App.typeset(el);
  }

  function renderDone(el) {
    const s = session;
    const total = s.right + s.wrong;
    const pct = total ? Math.round(100 * s.right / total) : 0;
    el.innerHTML = `
      <div class="fc-stage">
        <div class="card" style="text-align:center; padding: 40px 24px;">
          <div style="font-size: 40px;">✓</div>
          <h2>Deck complete</h2>
          <p class="muted">${s.title}${s.mode === "cram" ? " · cram session" : ""}</p>
          <div class="grid-3" style="max-width: 420px; margin: 18px auto;">
            <div class="stat"><div class="num">${total}</div><div class="lbl">Reviewed</div></div>
            <div class="stat"><div class="num" style="color:var(--green)">${s.right}</div><div class="lbl">Correct</div></div>
            <div class="stat"><div class="num" style="color:var(--red)">${s.wrong}</div><div class="lbl">Missed</div></div>
          </div>
          <p class="muted" style="max-width:460px;margin:0 auto 18px;">
            ${s.relearned ? `${s.relearned} missed ${s.relearned === 1 ? "card came" : "cards came"} back later in the session and ${s.relearned === 1 ? "was" : "were"} re-tested. ` : ""}
            ${pct >= 85
              ? "Strong recall. These cards are now spaced further out — come back when they are due."
              : "Anything you missed is back in box 1 and due again tomorrow. That is the system working, not a setback."}
          </p>
          <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
            <button class="btn" id="fcAgain">Study again</button>
            <button class="btn btn-ghost" id="fcBack">All decks</button>
            <a class="btn btn-ghost" href="#/practice">Practise problems</a>
          </div>
        </div>
      </div>`;
    el.querySelector("#fcAgain").addEventListener("click", () => startSession(el, { unitId: s.unitId, mode: s.mode }));
    el.querySelector("#fcBack").addEventListener("click", () => decksHome(el));
  }

  function grade(el, correct) {
    const s = session;
    const card = s.queue[s.idx];
    Store.gradeCard(card.id, correct);
    if (correct) {
      s.right++;
    } else {
      s.wrong++;
      /* Re-queue it a few cards later instead of leaving the miss unrehearsed
       * until tomorrow — but only once, so a hard card cannot loop forever. */
      const alreadyBack = s.queue.slice(s.idx + 1).some(c => c.id === card.id);
      if (!alreadyBack) {
        const at = Math.min(s.idx + 1 + RELEARN_GAP, s.queue.length);
        s.queue.splice(at, 0, card);
        s.relearned++;
      }
    }
    s.idx++;
    s.revealed = false;
    render(el);
  }

  function onKey(e, el) {
    if (!session || session.idx >= session.queue.length) return;
    if (e.code === "Space" || e.key === " ") {
      if (!session.revealed) { e.preventDefault(); session.revealed = true; render(el); }
    } else if (session.revealed) {
      if (e.key === "1" || e.key === "j") grade(el, false);
      if (e.key === "2" || e.key === "k") grade(el, true);
    }
  }

  return { mount: decksHome, onKey };
})();
