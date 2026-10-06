/* ============================================================
 * Progress store — persists to localStorage.
 *
 * Shape (schema v2):
 * {
 *   v: 2,
 *   cards:    { [cardId]: { box, due, seen, lapses } },
 *   practice: { [genId]: { attempts, correct, recent: [0|1,...],
 *                          variants: { [name]: { a, c } } } },
 *   misses:   [ { key, genId, unitId, variant, q, sol, answer, kind, at } ],
 *   exams:    [ { at, label, scope, n, correct, seconds, limit, items } ],
 *   sheet:    [ cardId, ... ],           // formula-sheet selection (Reference page)
 *   activity: { [YYYY-MM-DD]: count },   // reviews + problems per day
 * }
 *
 * v1 files (no `v`, no misses/exams/variants) are migrated on load
 * without losing any card or practice history.
 * ============================================================ */
const Store = (() => {
  const KEY = "math340-progress-v1";   // key kept: v2 migrates v1 data in place
  const THEME_KEY = "math340-theme";
  const SCHEMA = 2;

  /* Leitner ladder. intervals[box] = days until the card is due again.
   * Six boxes rather than five, topping out at three weeks, so that a card
   * learned early in the term is still scheduled to resurface before the
   * cumulative final rather than pinging every seven days forever. */
  const INTERVALS = [0, 0, 1, 2, 4, 9, 21];
  const MAX_BOX = INTERVALS.length - 1;   // 6
  const MASTER_BOX = 4;                   // box 4+ counts as mastered
  const MAX_MISSES = 60;                  // mistake log cap (oldest dropped)
  const MAX_PER_VARIANT = 3;              // …and per problem shape, so one bad
                                          //   topic cannot flood the log
  const MAX_EXAMS = 20;

  let state = load();

  function blank() {
    return { v: SCHEMA, cards: {}, practice: {}, misses: [], exams: [], sheet: [], activity: {} };
  }

  function migrate(raw) {
    const s = blank();
    if (!raw || typeof raw !== "object") return s;
    s.cards = raw.cards || {};
    s.practice = raw.practice || {};
    s.activity = raw.activity || {};
    s.misses = Array.isArray(raw.misses) ? raw.misses : [];
    s.exams = Array.isArray(raw.exams) ? raw.exams : [];
    s.sheet = Array.isArray(raw.sheet) ? raw.sheet : [];
    // v1 practice rows have no per-variant breakdown; give them an empty one
    // so callers never have to null-check it.
    for (const p of Object.values(s.practice)) {
      if (!p.variants) p.variants = {};
      if (!Array.isArray(p.recent)) p.recent = [];
    }
    return s;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return migrate(JSON.parse(raw));
    } catch (e) { /* storage unavailable or corrupted — start fresh */ }
    return blank();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) {
      // Most likely the quota: the mistake log is the only unbounded-ish part,
      // so shed it rather than silently losing the whole session's progress.
      try {
        state.misses = state.misses.slice(-10);
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch (e2) { /* give up; the session still works in memory */ }
    }
  }

  function dayKey(dt) {
    return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") +
           "-" + String(dt.getDate()).padStart(2, "0");
  }

  function bumpActivity(n) {
    const k = dayKey(new Date());
    state.activity[k] = (state.activity[k] || 0) + (n || 1);
    save();
  }

  return {
    MAX_BOX, MASTER_BOX, INTERVALS,

    // ---- flashcards (Leitner boxes 1..MAX_BOX) ----
    getCard(id) {
      return state.cards[id] || { box: 0, due: 0, seen: 0, lapses: 0 };
    },
    gradeCard(id, correct) {
      const c = this.getCard(id);
      if (correct) c.box = Math.min((c.box || 0) + 1, MAX_BOX);
      else { c.box = 1; c.lapses = (c.lapses || 0) + 1; }
      c.seen = (c.seen || 0) + 1;
      c.due = Date.now() + INTERVALS[c.box] * 24 * 3600 * 1000;
      state.cards[id] = c;
      bumpActivity();
      save();
      return c;
    },
    deckStats(cards) {
      let started = 0, mastered = 0, due = 0, fresh = 0, boxSum = 0;
      const now = Date.now();
      for (const card of cards) {
        const c = state.cards[card.id];
        if (c && c.seen > 0) {
          started++;
          boxSum += c.box;
          if (c.box >= MASTER_BOX) mastered++;
          if (c.due <= now) due++;
        } else {
          fresh++;
          due++; // new cards count as available to study
        }
      }
      const mastery = cards.length ? boxSum / (cards.length * MAX_BOX) : 0;
      return { total: cards.length, started, mastered, due, fresh, mastery };
    },
    /* Cards whose box is low or that have lapsed repeatedly — what a cram
     * session before a quiz should lead with. */
    weakCards(cards, limit) {
      const scored = cards.map(card => {
        const c = this.getCard(card.id);
        // unseen cards score below lapsed ones but above comfortable ones
        const score = c.seen ? (MAX_BOX - c.box) * 2 + Math.min(c.lapses, 5) : MAX_BOX;
        return { card, score };
      });
      scored.sort((a, b) => b.score - a.score);
      return scored.filter(s => s.score > 0).slice(0, limit || scored.length).map(s => s.card);
    },

    // ---- practice ----
    getPractice(genId) {
      const p = state.practice[genId];
      if (!p) return { attempts: 0, correct: 0, recent: [], variants: {} };
      if (!p.variants) p.variants = {};
      return p;
    },
    recordPractice(genId, correct, variant) {
      const p = this.getPractice(genId);
      p.attempts++;
      if (correct) p.correct++;
      p.recent.push(correct ? 1 : 0);
      if (p.recent.length > 10) p.recent.shift();
      if (variant) {
        const v = p.variants[variant] || { a: 0, c: 0 };
        v.a++; if (correct) v.c++;
        p.variants[variant] = v;
      }
      state.practice[genId] = p;
      bumpActivity();
      save();
      return p;
    },
    practiceStats(generators) {
      let attempts = 0, correct = 0, recentAcc = null, recentN = 0, recentHits = 0;
      for (const g of generators) {
        const p = state.practice[g.id];
        if (!p) continue;
        attempts += p.attempts;
        correct += p.correct;
        recentN += p.recent.length;
        recentHits += p.recent.reduce((a, b) => a + b, 0);
      }
      if (recentN > 0) recentAcc = recentHits / recentN;
      return { attempts, correct, accuracy: attempts ? correct / attempts : null, recentAcc };
    },

    /* How badly a topic needs work, in [0, 1].
     *
     * Untouched topics score high (you cannot know you are fine at something
     * you have never tried), lightly-attempted topics are pulled toward the
     * middle so three lucky answers do not retire a topic, and recent answers
     * count for more than old ones — the point is what you know *now*, not
     * what you knew in week 2. */
    weakness(genId) {
      const p = state.practice[genId];
      if (!p || !p.attempts) return 0.85;
      let num = 0, den = 0;
      p.recent.forEach((r, i) => { const w = i + 1; num += r * w; den += w; });
      const recentAcc = den ? num / den : p.correct / p.attempts;
      const overall = p.correct / p.attempts;
      const acc = 0.7 * recentAcc + 0.3 * overall;
      // shrink toward 0.5 accuracy while the sample is small
      const conf = Math.min(p.attempts, 8) / 8;
      const adj = acc * conf + 0.5 * (1 - conf);
      return Math.min(1, Math.max(0.05, 1 - adj));
    },
    /* Problem shapes inside one topic that are pulling its accuracy down. */
    weakVariants(genId) {
      const p = this.getPractice(genId);
      return Object.entries(p.variants)
        .filter(([, v]) => v.a >= 2 && v.c / v.a < 0.6)
        .sort((a, b) => (a[1].c / a[1].a) - (b[1].c / b[1].a))
        .map(([name, v]) => ({ name, attempts: v.a, correct: v.c, acc: v.c / v.a }));
    },
    /* Pick a generator at random, weighted toward the ones you are weak at.
     * `exclude` keeps a session from serving the same topic twice running. */
    pickWeighted(generators, exclude) {
      const pool = generators.filter(g => generators.length < 2 || g.id !== exclude);
      if (!pool.length) return generators[0] || null;
      const weights = pool.map(g => Math.pow(this.weakness(g.id), 1.6) + 0.05);
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
      return pool[pool.length - 1];
    },

    // ---- mistake log ----
    /* Missed problems are kept verbatim (question + worked solution) so they
     * can be re-attempted later. Redoing a problem you got wrong is where most
     * of the learning in a practice session actually happens. */
    recordMiss(entry) {
      const key = entry.genId + "|" + (entry.variant || "") + "|" + Date.now();
      const sameShape = state.misses.filter(m => m.genId === entry.genId && m.variant === entry.variant);
      if (sameShape.length >= MAX_PER_VARIANT) {
        const oldest = sameShape[0];
        state.misses = state.misses.filter(m => m !== oldest);
      }
      state.misses.push({ ...entry, key, at: Date.now() });
      if (state.misses.length > MAX_MISSES) state.misses = state.misses.slice(-MAX_MISSES);
      save();
    },
    misses() { return state.misses.slice().reverse(); },   // newest first
    missCount() { return state.misses.length; },
    clearMiss(key) {
      state.misses = state.misses.filter(m => m.key !== key);
      save();
    },
    clearAllMisses() { state.misses = []; save(); },

    // ---- exam history ----
    recordExam(result) {
      state.exams.push({ at: Date.now(), ...result });
      if (state.exams.length > MAX_EXAMS) state.exams = state.exams.slice(-MAX_EXAMS);
      bumpActivity(result.n || 1);
      save();
    },
    exams() { return state.exams.slice().reverse(); },     // newest first

    // ---- activity / streak ----
    activity() { return state.activity; },
    activityOn(dt) { return state.activity[dayKey(dt)] || 0; },
    streak() {
      let s = 0;
      const d = new Date();
      // today counts if there is activity; otherwise start from yesterday
      if (!state.activity[dayKey(d)]) d.setDate(d.getDate() - 1);
      while (state.activity[dayKey(d)]) { s++; d.setDate(d.getDate() - 1); }
      return s;
    },
    totalReviews() {
      return Object.values(state.activity).reduce((a, b) => a + b, 0);
    },

    // ---- export / import / reset ----
    exportJSON() { return JSON.stringify(state, null, 2); },
    importJSON(text) {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || !parsed.cards) throw new Error("Not a valid progress file.");
      state = migrate(parsed);
      save();
    },
    reset() { state = blank(); save(); },

    /* ---- formula-sheet selection ----
     * The midterm allows one 8.5x11" sheet, so which identities you have
     * picked for it is real study state: it survives reloads and rides
     * along in the export like everything else. */
    sheet() { return new Set(state.sheet || []); },
    toggleSheet(id) {
      const set = new Set(state.sheet || []);
      if (set.has(id)) set.delete(id); else set.add(id);
      state.sheet = [...set];
      save();
      return set;
    },
    setSheet(ids) { state.sheet = [...new Set(ids)]; save(); },

    // ---- theme ----
    getTheme() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } },
    setTheme(t) { try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* ignore */ } },
  };
})();
