/* ============================================================
 * MATH 340 Probability Studio — course manifest
 * ------------------------------------------------------------
 * Central registry for course content. Each chapter/unit lives
 * in its own file under data/ and registers itself by calling
 * MATH340.registerUnit(...). To add a new week of material:
 *   1. create data/chN.js following the pattern of ch1.js
 *   2. add a <script src="data/chN.js"></script> tag to index.html
 * Nothing else needs to change — the app picks it up everywhere.
 * ============================================================ */

window.MATH340 = {
  course: {
    code: "MATH 340",
    name: "Probability",
    term: "Fall 2026",
    instructor: "Suxian Zhou",
    textbook: "Blitzstein & Hwang, Introduction to Probability (2nd ed.)",
    // Monday of Week 1 (term start). Used to compute the current week.
    termStart: "2026-09-14",
  },

  // Tentative course schedule (from the syllabus).
  schedule: [
    { week: 1,  topic: "Chap 1: Definition of Probability and Counting Techniques", quiz: false },
    { week: 2,  topic: "Chap 2: Conditional Probability and Bayes' Rule",           quiz: true  },
    { week: 3,  topic: "Chap 3 & 4: Discrete Distributions",                        quiz: true  },
    { week: 4,  topic: "Chap 4 & 5: Expectation and Variance",                      quiz: true  },
    { week: 5,  topic: "Chap 5 & 8: Continuous Distributions",                      quiz: true  },
    { week: 6,  topic: "Review and Midterm Exam",                                   quiz: false },
    { week: 7,  topic: "Chap 6: Moments and Moment Generating Functions",           quiz: true  },
    { week: 8,  topic: "Chap 7: Multivariate Distributions",                        quiz: true  },
    { week: 9,  topic: "Chap 8: Limit Laws and Central Limit Theorem",              quiz: true  },
    { week: 10, topic: "Final Exam Review",                                         quiz: false },
  ],

  keyDates: [
    { date: "2026-09-25", label: "Homework 1 due (5:00 pm)",                kind: "hw"   },
    { date: "2026-10-02", label: "Homework 2 due",                          kind: "hw"   },
    { date: "2026-10-21", label: "Midterm Exam · 1:50–3:00 pm",             kind: "exam" },
    { date: "2026-11-13", label: "Last day to request final-exam change",   kind: "info" },
    { date: "2026-11-23", label: "Final Exam · 11:30 am–2:00 pm (cumulative)", kind: "exam" },
  ],

  gradeWeights: [
    { name: "Participation", pct: 5 },
    { name: "Homework",      pct: 15 },
    { name: "Quizzes",       pct: 25 },
    { name: "Midterm",       pct: 20 },
    { name: "Final Exam",    pct: 25 },
    { name: "Final Project", pct: 10 },
  ],

  // Registered content units (chapters / reference decks).
  units: [],

  registerUnit(unit) {
    // unit: { id, title, short, week, order, flashcards:[], generators:[], reference?:fn }
    this.units.push(unit);
    this.units.sort((a, b) => (a.order ?? a.week ?? 99) - (b.order ?? b.week ?? 99));
  },

  getUnit(id) { return this.units.find(u => u.id === id); },

  /* ---- calendar arithmetic ----
   * Everything the app says about dates is in whole local days ("today",
   * "tomorrow", "Week 8"), so the arithmetic is done on calendar days too.
   * Dividing a millisecond difference by 86 400 000 is off by an hour across
   * the DST change, which is enough to put a quiz on the wrong day. */
  parseISODate(iso) {
    const [y, m, d] = String(iso).split("-").map(Number);
    return new Date(y, m - 1, d);   // local midnight
  },
  // Whole local calendar days from `from` to `to` (Date objects; time of day ignored).
  calendarDays(from, to) {
    const utc = dt => Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate());
    return Math.round((utc(to) - utc(from)) / (24 * 3600 * 1000));
  },
  // Days until an ISO date: 0 on the day itself, 1 the day before, -1 the day after.
  daysUntil(iso, now) {
    return this.calendarDays(now || new Date(), this.parseISODate(iso));
  },

  currentWeek(now) {
    const days = this.calendarDays(this.parseISODate(this.course.termStart), now || new Date());
    const wk = Math.floor(days / 7) + 1;
    return Math.min(Math.max(wk, 0), 11); // 0 = before term, 11 = after
  },

  /* The next Wednesday that carries a quiz, per the syllabus schedule, as
   * { week, topic, days } — or null once the last quiz has passed. */
  nextQuiz(now) {
    const start = this.parseISODate(this.course.termStart);
    for (const row of this.schedule) {
      if (!row.quiz) continue;
      const wed = new Date(start.getFullYear(), start.getMonth(), start.getDate() + (row.week - 1) * 7 + 2);
      const days = this.calendarDays(now || new Date(), wed);
      if (days >= 0) return { week: row.week, topic: row.topic, days };
    }
    return null;
  },

  // ---- small math/random utilities shared by problem generators ----
  util: {
    randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    // k distinct elements of arr, in random order.
    sample(arr, k) { return this.shuffle(arr).slice(0, k); },
    factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
    perm(n, k) { let r = 1; for (let i = 0; i < k; i++) r *= (n - i); return r; },
    choose(n, k) {
      if (k < 0 || k > n) return 0;
      k = Math.min(k, n - k);
      // Exact integer arithmetic: in floating point the partial products overflow
      // 2^53 for n in the fifties and the result comes back off by one, which for a
      // counting answer is simply the wrong number.
      let r = 1n;
      const N = BigInt(n);
      for (let i = 0n; i < BigInt(k); i++) r = (r * (N - i)) / (i + 1n);
      return Number(r);
    },
    gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; },
    lcm(a, b) { return a * b / this.gcd(a, b); },
    round(x, d) { const p = Math.pow(10, d); return Math.round(x * p) / p; },
    fmt(x, d = 4) {
      if (Number.isInteger(x)) return String(x);
      return String(Math.round(x * Math.pow(10, d)) / Math.pow(10, d));
    },
    /* Plain text into HTML: for labels that were typed, imported or synced
     * rather than authored in the data files. */
    escapeHtml(t) {
      return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    },
    /* Stored problem HTML (the mistake log keeps question + solution verbatim,
     * and an imported or synced file could hold anything). The markup the
     * generators produce is KaTeX-friendly HTML, so it is kept; anything that
     * could run script is dropped: active elements, on* handlers and
     * javascript:/data: URLs. */
    sanitizeHtml(html) {
      let s = String(html == null ? "" : html);
      s = s.replace(/<(script|iframe|object|embed|style|svg|math|template)\b[\s\S]*?<\/\1\s*>/gi, "");
      s = s.replace(/<\/?(script|iframe|object|embed|style|svg|math|template|link|meta|base|form)\b[^>]*>/gi, "");
      s = s.replace(/<([a-zA-Z][^\s>\/]*)([^>]*)>/g, (tag, name, attrs) => {
        let a = attrs
          .replace(/\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
          .replace(/\s+on[a-zA-Z]+(?=[\s>]|$)/gi, "");
        a = a.replace(/\s+(href|src|xlink:href|formaction|action|srcdoc)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi,
          (m, attr, q, dq, sq, bare) => {
            const v = (dq != null ? dq : sq != null ? sq : bare).replace(/[\s\u0000-\u001f]+/g, "").toLowerCase();
            return /^(javascript|data|vbscript):/.test(v) ? "" : m;
          });
        return "<" + name + a + ">";
      });
      return s;
    },
    // "5" / "5s" — tiny helper so generated sentences stay grammatical.
    plural(n, one, many) { return n === 1 ? one : (many != null ? many : one + "s"); },
    // Reduced fraction as LaTeX, e.g. fracTex(6, 8) -> "\frac{3}{4}".
    fracTex(n, d) {
      const g = this.gcd(n, d) || 1;
      const num = n / g, den = d / g;
      return den === 1 ? String(num) : `\\frac{${num}}{${den}}`;
    },

    /* Four mutually consistent regions for a pair of events, as whole
     * percentages that sum to 100. Generators that need P(A), P(B) and
     * P(A∩B) should take them from here rather than drawing three numbers
     * independently — that is how you end up stating P(A ∪ B) = 1.05. */
    venn2({ bothMin = 8, bothMax = 25, onlyMin = 15, onlyMax = 35 } = {}) {
      const both = this.randInt(bothMin, bothMax);
      const onlyA = this.randInt(onlyMin, onlyMax);
      const onlyB = this.randInt(onlyMin, onlyMax);
      const neither = 100 - both - onlyA - onlyB; // >= 0 for the default ranges
      return {
        both: both / 100, onlyA: onlyA / 100, onlyB: onlyB / 100, neither: neither / 100,
        pa: (both + onlyA) / 100, pb: (both + onlyB) / 100,
        union: (both + onlyA + onlyB) / 100,
        exactlyOne: (onlyA + onlyB) / 100,
        pct: { both, onlyA, onlyB, neither, a: both + onlyA, b: both + onlyB },
      };
    },

    /* Round-robin variant picker.
     * Returns entries of `list` one at a time, cycling through the whole list
     * in random order before any entry repeats (and never repeating an entry
     * back-to-back across cycles). This is what keeps a practice topic from
     * serving the same problem shape twice in a row. */
    _queues: {},
    _last: {},
    rotate(key, list) {
      if (!list || !list.length) return null;
      if (list.length === 1) return list[0];
      let q = this._queues[key];
      if (!q || !q.length) {
        q = this.shuffle(list.map((_, i) => i));
        if (q[0] === this._last[key]) [q[0], q[1]] = [q[1], q[0]];
        this._queues[key] = q;
      }
      const i = q.shift();
      this._last[key] = i;
      return list[i];
    },
  },

  /* Build a practice generator from a list of *structurally different*
   * problem variants. Each variant is { name, make() } and returns the usual
   * { q, answer, kind, sol, tol? } object; the variant's name is attached to
   * the problem so the UI can show which flavour is on screen.
   *   kind: "count" — exact non-negative integer answer
   *         "prob"  — a probability in [0, 1]
   *         "num"   — any other number (odds, expected counts, ...)
   */
  makeGenerator({ id, name, blurb, variants }) {
    return {
      id, name, blurb,
      variantNames: variants.map(v => v.name),
      make() {
        const v = MATH340.util.rotate(id, variants);
        return { variant: v.name, ...v.make() };
      },
    };
  },
};
