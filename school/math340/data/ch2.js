/* ============================================================
 * Chapter 2 — Conditional Probability  (Week 2)
 * Source: class lecture notes (C2) + Blitzstein & Hwang ch. 2,
 *         plus the problem shapes from Assignment 2 (conditioning on
 *         exactly the stated information; judging a diagnostic test;
 *         hereditary-disease mixtures and sequential updating).
 * ============================================================ */
(function () {
  const U = MATH340.util;
  const R = String.raw;

  const flashcards = [
    {
      id: "c2-cond-def", tag: "Definition 2.2.1",
      front: R`State the definition of the <em>conditional probability</em> of \(A\) given \(B\).`,
      back: R`For events with \(P(B) > 0\), $$P(A \mid B) = \frac{P(A \cap B)}{P(B)}.$$ Intuition: restrict the sample space to \(B\) and renormalize.`,
    },
    {
      id: "c2-intersect2", tag: "Theorem 2.3.1",
      front: R`Express \(P(A \cap B)\) using conditional probabilities (two ways).`,
      back: R`$$P(A \cap B) = P(B)\,P(A \mid B) = P(A)\,P(B \mid A)$$`,
    },
    {
      id: "c2-chain", tag: "Theorem 2.3.2",
      front: R`State the chain rule for the probability of the intersection of \(n\) events \(A_1, \dots, A_n\).`,
      back: R`$$P(A_1, A_2, \dots, A_n) = P(A_1)\,P(A_2 \mid A_1)\,P(A_3 \mid A_1, A_2)\cdots P(A_n \mid A_1, \dots, A_{n-1})$$ (Commas denote intersections.)`,
    },
    {
      id: "c2-bayes", tag: "Theorem 2.3.3",
      front: R`State <em>Bayes' rule</em>.`,
      back: R`For events with positive probabilities, $$P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}.$$ It "flips" the direction of conditioning.`,
    },
    {
      id: "c2-odds", tag: "Definition 2.3.4",
      front: R`Define the <em>odds</em> of an event \(A\).`,
      back: R`$$\text{odds}(A) = \frac{P(A)}{P(A^c)}$$ E.g. \(P(A) = 3/4\) gives odds \(3\) ("3 to 1 in favor").`,
    },
    {
      id: "c2-odds-bayes", tag: "Theorem 2.3.5",
      front: R`State the <em>odds form</em> of Bayes' rule.`,
      back: R`$$\underbrace{\frac{P(A \mid B)}{P(A^c \mid B)}}_{\text{posterior odds}} = \underbrace{\frac{P(B \mid A)}{P(B \mid A^c)}}_{\text{likelihood ratio}} \cdot \underbrace{\frac{P(A)}{P(A^c)}}_{\text{prior odds}}$$`,
    },
    {
      id: "c2-lotp", tag: "Theorem 2.3.6",
      front: R`State the <em>law of total probability</em> (LOTP).`,
      back: R`If \(A_1, \dots, A_n\) partition \(S\) (disjoint, union \(= S\), each \(P(A_i) > 0\)), then $$P(B) = \sum_{i=1}^{n} P(B \mid A_i)\,P(A_i).$$`,
    },
    {
      id: "c2-lotp2", tag: "Two-group LOTP",
      front: R`Write the law of total probability for the partition \(\{A, A^c\}\).`,
      back: R`$$P(B) = P(B \mid A)\,P(A) + P(B \mid A^c)\,P(A^c)$$ This is the denominator you almost always need in Bayes' rule problems.`,
    },
    {
      id: "c2-condprob-are-prob", tag: "Section 2.4",
      front: R`"Conditional probabilities are probabilities." What does this mean in practice?`,
      back: R`With the conditioning event \(E\) fixed, \(P(\cdot \mid E)\) satisfies all the usual axioms and rules:<br>\(P(A^c \mid E) = 1 - P(A \mid E)\),<br>\(P(A \cup B \mid E) = P(A \mid E) + P(B \mid E) - P(A \cap B \mid E)\), etc.`,
    },
    {
      id: "c2-bayes-extra", tag: "Theorem 2.4.2",
      front: R`State Bayes' rule <em>with extra conditioning</em> on an event \(E\).`,
      back: R`$$P(A \mid B, E) = \frac{P(B \mid A, E)\,P(A \mid E)}{P(B \mid E)}$$ Everything is conditioned on \(E\) throughout.`,
    },
    {
      id: "c2-lotp-extra", tag: "Theorem 2.4.3",
      front: R`State the law of total probability <em>with extra conditioning</em> on \(E\).`,
      back: R`For a partition \(A_1, \dots, A_n\) of \(S\) with \(P(A_i \cap E) > 0\): $$P(B \mid E) = \sum_{i=1}^{n} P(B \mid A_i, E)\,P(A_i \mid E)$$`,
    },
    {
      id: "c2-indep", tag: "Definition 2.5.1",
      front: R`Define <em>independence</em> of two events \(A\) and \(B\), and give the equivalent conditional forms.`,
      back: R`$$P(A \cap B) = P(A)\,P(B)$$ If \(P(A) > 0\) and \(P(B) > 0\), equivalently \(P(A \mid B) = P(A)\) and \(P(B \mid A) = P(B)\): learning one gives no information about the other.`,
    },
    {
      id: "c2-indep-vs-disjoint", tag: "Common pitfall",
      front: R`Are disjoint events independent?`,
      back: R`<b>Essentially never.</b> If \(A \cap B = \emptyset\) then \(P(A \cap B) = 0\), so they can only be independent if \(P(A) = 0\) or \(P(B) = 0\). Knowing \(A\) happened tells you \(B\) definitely did not — that is information, i.e. dependence.`,
    },
    {
      id: "c2-indep-comp", tag: "Proposition 2.5.3",
      front: R`If \(A\) and \(B\) are independent, what about their complements?`,
      back: R`Then \(A\) &amp; \(B^c\), \(A^c\) &amp; \(B\), and \(A^c\) &amp; \(B^c\) are <b>all independent</b> too.`,
    },
    {
      id: "c2-indep3", tag: "Definition 2.5.4",
      front: R`What is required for three events \(A, B, C\) to be independent?`,
      back: R`All four equations:$$\begin{aligned}P(A \cap B) &= P(A)P(B), \quad P(A \cap C) = P(A)P(C),\\ P(B \cap C) &= P(B)P(C), \quad P(A \cap B \cap C) = P(A)P(B)P(C).\end{aligned}$$ Pairwise independence alone is <b>not</b> enough.`,
    },
    {
      id: "c2-cond-indep", tag: "Definition 2.5.7",
      front: R`Define <em>conditional independence</em> of \(A\) and \(B\) given \(E\). Does it imply (or follow from) ordinary independence?`,
      back: R`$$P(A \cap B \mid E) = P(A \mid E)\,P(B \mid E)$$ <b>Neither implies the other.</b> Independence ⇏ conditional independence given \(E\); conditional independence given \(E\) ⇏ independence, and ⇏ conditional independence given \(E^c\).`,
    },

    /* ---- Assignment 2 ideas ---- */
    {
      id: "c2-info-cond", tag: "Conditioning on information",
      front: R`A jar holds red marbles \(R_1, R_2\) and blue marbles \(B_1, B_2\); two are drawn without replacement. Find \(P(\text{both red})\) given (a) the first is red, (b) at least one is red, (c) one of them is \(R_1\).`,
      back: R`(a) \(\frac{1}{3}\): after a red first draw, 1 of the 3 remaining is red.<br>(b) \(\frac{1}{5}\): of the \(\binom{4}{2} = 6\) equally likely pairs, 5 contain a red and only 1 is both red.<br>(c) \(\frac{1}{3}\): given \(R_1\) is in the pair, the other marble is equally likely to be any of the 3 others.<br>"At least one" is weaker information than a <em>specific</em> red, so it leaves more pairs in play and a smaller answer. Condition on exactly what you were told.`,
    },
    {
      id: "c2-sens-spec", tag: "Diagnostic tests",
      front: R`Define the <em>sensitivity</em>, <em>specificity</em>, and <em>overall success rate</em> of a diagnostic test for a disease \(D\) with prevalence \(P(D)\).`,
      back: R`Sensitivity \(= P(+ \mid D)\) (catches the sick); specificity \(= P(- \mid D^c)\) (clears the healthy). The overall success rate is the probability of a correct diagnosis, by LOTP: $$P(\text{correct}) = \text{sens}\cdot P(D) + \text{spec}\cdot P(D^c).$$ The false-positive rate is \(1 - \text{spec}\).`,
    },
    {
      id: "c2-trivial-test", tag: "Common pitfall",
      front: R`A disease affects 1% of people. A "test" that declares <em>everyone</em> healthy has what overall success rate, and why is that misleading?`,
      back: R`\(P(\text{correct}) = P(D^c) = 0.99\) — higher than a test with sensitivity and specificity both \(0.95\) (success rate \(0.95\)). But its sensitivity is \(0\): it never finds a single sick person. For a rare condition, accuracy is dominated by the healthy majority, so judge a test by sensitivity, specificity and \(P(D \mid +)\), not accuracy alone.`,
    },
    {
      id: "c2-cond-indep-family", tag: "Conditional independence · example",
      front: R`A mother carries a hereditary disease with probability \(1/3\); if she does, each child independently has it with probability \(1/2\), otherwise no child does. Are the two children's statuses independent?`,
      back: R`They are <b>conditionally independent given the mother's status</b>, but <b>not independent</b>. \(P(\text{elder}) = \tfrac{1}{3}\cdot\tfrac{1}{2} = \tfrac{1}{6}\), while \(P(\text{both}) = \tfrac{1}{3}\cdot\tfrac{1}{4} = \tfrac{1}{12} \ne \tfrac{1}{36}\). A sick elder child is evidence the mother carries it, which raises the younger's chance to \(\tfrac{1}{2}\).`,
    },
    {
      id: "c2-sequential-bayes", tag: "Sequential updating",
      front: R`Evidence arrives in two pieces (e.g. two children test negative a week apart). Does it matter whether you update on both at once or one at a time?`,
      back: R`<b>No.</b> Today's posterior is tomorrow's prior: updating on \(E_1\), then on \(E_2\) using \(P(\cdot \mid E_1)\), gives exactly \(P(A \mid E_1 \cap E_2)\). When the pieces are conditionally independent given each hypothesis, the likelihoods simply multiply: \(P(E_1 \cap E_2 \mid A) = P(E_1 \mid A)P(E_2 \mid A)\).`,
    },
  ];

  /* ---------------- practice problem generators ----------------
   * As in Chapter 1, each generator is a family of structurally
   * different problems. Conditional-probability questions are easy to
   * make superficially different and secretly identical, so the
   * variants deliberately run the machinery in different directions:
   * forwards (LOTP), backwards (Bayes), sideways (odds form), and
   * through the definition itself.
   * -------------------------------------------------------------- */

  /* Two-way count tables share a few stories and a rendering helper. */
  const TABLE_CTX = [
    {
      intro: "A friend claims his presence helps his favourite team. The season's records:",
      cols: ["Friend present", "Friend absent"], rows: ["Win", "Loss"],
      colE: "F", rowE: "W", unit: "games",
      col: "your friend was at the game", colNeg: "your friend was not at the game",
      row: "the team won", rowNeg: "the team lost",
    },
    {
      intro: "A commuter logs every workday last year: whether it rained, and whether she arrived late.",
      cols: ["Rain", "No rain"], rows: ["Arrived late", "On time"],
      colE: "R", rowE: "L", unit: "workdays",
      col: "it rained that day", colNeg: "it did not rain that day",
      row: "she arrived late", rowNeg: "she arrived on time",
    },
    {
      intro: "A spam filter records, for each message received, whether the message was spam and whether it contained the word <em>free</em>.",
      cols: ["Contains 'free'", "No 'free'"], rows: ["Spam", "Not spam"],
      colE: "D", rowE: "S", unit: "messages",
      col: "the message contains the word <em>free</em>", colNeg: "the message does not contain the word <em>free</em>",
      row: "the message is spam", rowNeg: "the message is not spam",
    },
  ];

  // a = row1&col1, b = row1&col2, c = row2&col1, d = row2&col2
  function tableHtml(t, a, b, c, d) {
    return R`<table class="tbl"><tr><th></th><th>${t.cols[0]}</th><th>${t.cols[1]}</th></tr>
      <tr><td><b>${t.rows[0]}</b></td><td>${a}</td><td>${b}</td></tr>
      <tr><td><b>${t.rows[1]}</b></td><td>${c}</td><td>${d}</td></tr></table>`;
  }

  function tableCounts() {
    return [U.randInt(8, 16), U.randInt(5, 14), U.randInt(5, 14), U.randInt(10, 24)];
  }

  const generators = [
    MATH340.makeGenerator({
      id: "c2-gen-table",
      name: "Conditional probability from a table",
      blurb: "Two-way counts: condition, reverse, union, and test independence.",
      variants: [
        {
          name: "Condition on a column",
          make() {
            const t = U.pick(TABLE_CTX);
            const [a, b, c, d] = tableCounts();
            const n = a + b + c + d;
            const neg = Math.random() < 0.5;
            const ans = neg ? b / (b + d) : a / (a + c);
            return {
              q: R`${t.intro}<br><br>${tableHtml(t, a, b, c, d)}<br>
                  One of these ${n} ${t.unit} is selected at random. Let \(${t.rowE}\) be the event that ${t.row} and \(${t.colE}\) the event that ${t.col}. Find \(P(${t.rowE} \mid ${neg ? t.colE + "^c" : t.colE})\) — the probability that ${t.row}, given that ${neg ? t.colNeg : t.col}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Conditioning <b>restricts the sample space</b> to one column of the table and renormalises by that column's total.</div>
                   <div class="sol-step">$$P(${t.rowE} \mid ${neg ? t.colE + "^c" : t.colE}) = \frac{P(${t.rowE} \cap ${neg ? t.colE + "^c" : t.colE})}{P(${neg ? t.colE + "^c" : t.colE})} = \frac{${neg ? b : a}/${n}}{${neg ? b + d : a + c}/${n}} = \frac{${neg ? b : a}}{${neg ? b + d : a + c}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">The totals \(${n}\) cancel — with a count table you can work directly with counts.</div>`,
            };
          },
        },
        {
          name: "Reverse the conditioning",
          make() {
            const t = U.pick(TABLE_CTX);
            const [a, b, c, d] = tableCounts();
            const n = a + b + c + d;
            const ans = a / (a + b);
            return {
              q: R`${t.intro}<br><br>${tableHtml(t, a, b, c, d)}<br>
                  One of these ${n} ${t.unit} is selected at random. Let \(${t.rowE}\) be the event that ${t.row} and \(${t.colE}\) the event that ${t.col}. Find \(P(${t.colE} \mid ${t.rowE})\) — the probability that ${t.col}, given that ${t.row}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">This conditions on a <b>row</b> instead of a column — the same intersection cell, a different denominator. That asymmetry is exactly why \(P(A \mid B) \ne P(B \mid A)\) in general.</div>
                   <div class="sol-step">$$P(${t.colE} \mid ${t.rowE}) = \frac{${a}}{${a + b}} \approx ${U.fmt(ans)} \qquad\text{whereas}\qquad P(${t.rowE} \mid ${t.colE}) = \frac{${a}}{${a + c}} \approx ${U.fmt(a / (a + c))}$$</div>
                   <div class="sol-step">Bayes' rule is the bridge between the two: \(P(${t.colE} \mid ${t.rowE}) = P(${t.rowE} \mid ${t.colE})P(${t.colE}) / P(${t.rowE})\).</div>`,
            };
          },
        },
        {
          name: "Union from a table",
          make() {
            const t = U.pick(TABLE_CTX);
            const [a, b, c, d] = tableCounts();
            const n = a + b + c + d;
            const ans = (a + b + c) / n;
            return {
              q: R`${t.intro}<br><br>${tableHtml(t, a, b, c, d)}<br>
                  One of these ${n} ${t.unit} is selected at random. Let \(${t.rowE}\) be the event that ${t.row} and \(${t.colE}\) the event that ${t.col}. Find \(P(${t.rowE} \cup ${t.colE})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Addition rule: \(P(${t.rowE}) = \frac{${a + b}}{${n}}\), \(P(${t.colE}) = \frac{${a + c}}{${n}}\), \(P(${t.rowE} \cap ${t.colE}) = \frac{${a}}{${n}}\).</div>
                   <div class="sol-step">$$P(${t.rowE} \cup ${t.colE}) = \frac{${a + b} + ${a + c} - ${a}}{${n}} = \frac{${a + b + c}}{${n}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Or read it straight off the table: every cell except the ${d} in the bottom-right corner.</div>`,
            };
          },
        },
        {
          name: "What would independence require?",
          make() {
            const t = U.pick(TABLE_CTX);
            const [a, b, c, d] = tableCounts();
            const n = a + b + c + d;
            const ans = (a + b) * (a + c) / n;
            return {
              q: R`${t.intro}<br><br>${tableHtml(t, a, b, c, d)}<br>
                  Let \(${t.rowE}\) be the event that ${t.row} and \(${t.colE}\) the event that ${t.col}, for a randomly chosen one of these ${n} ${t.unit}. <b>If \(${t.rowE}\) and \(${t.colE}\) were independent</b>, what count would the top-left cell (${t.rows[0]} and ${t.cols[0]}) have to be? (A non-integer answer is fine.)`,
              answer: ans, kind: "num", tol: 0.05,
              sol: R`<div class="sol-step">Independence means \(P(${t.rowE} \cap ${t.colE}) = P(${t.rowE})P(${t.colE})\). Writing each as a count over \(${n}\):</div>
                   <div class="sol-step">$$\frac{\text{cell}}{${n}} = \frac{${a + b}}{${n}} \cdot \frac{${a + c}}{${n}} \quad\Longrightarrow\quad \text{cell} = \frac{${a + b} \times ${a + c}}{${n}} = ${U.fmt(ans, 3)}$$</div>
                   <div class="sol-step">The observed count is ${a}, so the events are ${Math.abs(a - ans) < 0.5 ? "essentially independent here" : `<b>not</b> independent (the cell is ${a > ans ? "larger" : "smaller"} than independence would predict)`}. This "row total × column total ÷ grand total" is the expected-count formula behind the chi-square test.</div>`,
            };
          },
        },
        {
          name: "Conditional complement",
          make() {
            const t = U.pick(TABLE_CTX);
            const [a, b, c, d] = tableCounts();
            const n = a + b + c + d;
            const ans = c / (a + c);
            return {
              q: R`${t.intro}<br><br>${tableHtml(t, a, b, c, d)}<br>
                  One of these ${n} ${t.unit} is selected at random. Let \(${t.rowE}\) be the event that ${t.row} and \(${t.colE}\) the event that ${t.col}. Find \(P(${t.rowE}^c \mid ${t.colE})\) — the probability that ${t.rowNeg}, given that ${t.col}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">"Conditional probabilities are probabilities": with \(${t.colE}\) fixed, the complement rule still holds.</div>
                   <div class="sol-step">$$P(${t.rowE}^c \mid ${t.colE}) = 1 - P(${t.rowE} \mid ${t.colE}) = 1 - \frac{${a}}{${a + c}} = \frac{${c}}{${a + c}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Three-column table",
          make() {
            const cols = U.pick([
              ["First-year", "Sophomore", "Junior"],
              ["Morning shift", "Afternoon shift", "Night shift"],
              ["Branch A", "Branch B", "Branch C"],
            ]);
            const top = [U.randInt(10, 25), U.randInt(10, 25), U.randInt(10, 25)];
            const bot = [U.randInt(4, 14), U.randInt(4, 14), U.randInt(4, 14)];
            const j = U.randInt(0, 2);
            const n = top.concat(bot).reduce((x, y) => x + y, 0);
            const topTotal = top[0] + top[1] + top[2];
            const reverse = Math.random() < 0.5;
            const ans = reverse ? top[j] / topTotal : top[j] / (top[j] + bot[j]);
            const tbl = R`<table class="tbl"><tr><th></th><th>${cols[0]}</th><th>${cols[1]}</th><th>${cols[2]}</th></tr>
              <tr><td><b>Passed</b></td><td>${top[0]}</td><td>${top[1]}</td><td>${top[2]}</td></tr>
              <tr><td><b>Did not pass</b></td><td>${bot[0]}</td><td>${bot[1]}</td><td>${bot[2]}</td></tr></table>`;
            return {
              q: R`${n} students took a qualifying exam. Their results, broken down by group:<br><br>${tbl}<br>
                  A student is selected at random. Let \(A\) be the event that the student passed and \(G\) the event that the student is in the <b>${cols[j]}</b> group. Find \(${reverse ? R`P(G \mid A)` : R`P(A \mid G)`}\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">${reverse
                      ? R`Conditioning on \(A\) restricts to the "Passed" <b>row</b>, whose total is \(${top[0]} + ${top[1]} + ${top[2]} = ${topTotal}\).`
                      : R`Conditioning on \(G\) restricts to the <b>${cols[j]}</b> column, whose total is \(${top[j]} + ${bot[j]} = ${top[j] + bot[j]}\).`}</div>
                   <div class="sol-step">$$${reverse ? R`P(G \mid A)` : R`P(A \mid G)`} = \frac{${top[j]}}{${reverse ? topTotal : top[j] + bot[j]}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">With three groups the columns form a <b>partition</b>, so the law of total probability also applies: \(P(A) = \sum_i P(A \mid G_i)P(G_i) = \frac{${topTotal}}{${n}}\).</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c2-gen-conddef",
      name: "Using the definition P(A|B) = P(A∩B)/P(B)",
      blurb: "Run the definition forwards, backwards, and on compound events.",
      variants: [
        {
          name: "Straight from the definition",
          make() {
            const pa = U.randInt(15, 35) / 100, pb = U.randInt(30, 50) / 100;
            const pab = U.randInt(6, Math.round(Math.min(pa, pb) * 100) - 2) / 100;
            const flip = Math.random() < 0.5;
            const ans = flip ? pab / pb : pab / pa;
            const ask = flip ? R`P(A \mid B)` : R`P(B \mid A)`;
            return {
              q: R`For events \(A\) and \(B\): \(P(A) = ${pa}\), \(P(B) = ${pb}\), and \(P(A \cap B) = ${pab}\). Find \(${ask}\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">By the definition of conditional probability, $$${ask} = \frac{P(A \cap B)}{${flip ? `P(B)` : `P(A)`}} = \frac{${pab}}{${flip ? pb : pa}} \approx ${U.fmt(ans)}.$$</div>
                   <div class="sol-step">Sanity check: conditioning on the ${flip ? "smaller" : "larger"} event gives the ${flip ? "larger" : "smaller"} answer — the same overlap, divided by a different slice of the sample space.</div>`,
            };
          },
        },
        {
          name: "Multiplication rule (find the intersection)",
          make() {
            const pb = U.randInt(30, 70) / 100, pab_b = U.randInt(20, 80) / 100;
            const ans = U.round(pb * pab_b, 6);
            const [ea, eb] = U.pick([
              ["a customer buys the extended warranty", "a customer buys a laptop"],
              ["the second component also fails", "the first component fails"],
              ["the student attends the review session", "the student is enrolled in the honours section"],
            ]);
            return {
              q: R`Let \(B\) be the event that ${eb} and \(A\) the event that ${ea}. Suppose \(P(B) = ${pb}\) and \(P(A \mid B) = ${pab_b}\). Find \(P(A \cap B)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Rearranging the definition gives the <b>multiplication rule</b>: $$P(A \cap B) = P(B)\,P(A \mid B)$$</div>
                   <div class="sol-step">$$P(A \cap B) = ${pb} \times ${pab_b} = ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Note \(P(A)\) alone would not be enough — you need one probability and one conditional that "chain" together.</div>`,
            };
          },
        },
        {
          name: "Solve for the conditioning event",
          make() {
            const pb = U.randInt(30, 80) / 100, cond = U.randInt(25, 90) / 100;
            const pab = U.round(pb * cond, 6);
            const ans = pb;
            return {
              q: R`For events \(A\) and \(B\), \(P(A \cap B) = ${U.fmt(pab, 5)}\) and \(P(A \mid B) = ${cond}\). Find \(P(B)\).`,
              answer: ans, kind: "prob", tol: 0.005,
              sol: R`<div class="sol-step">The definition \(P(A \mid B) = \frac{P(A \cap B)}{P(B)}\) can be solved for the <b>denominator</b>:</div>
                   <div class="sol-step">$$P(B) = \frac{P(A \cap B)}{P(A \mid B)} = \frac{${U.fmt(pab, 5)}}{${cond}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Complement of a conditional",
          make() {
            const pb = U.randInt(35, 70) / 100;
            const pab = U.randInt(10, Math.round(pb * 100) - 8) / 100;
            const ans = U.round(1 - pab / pb, 6);
            return {
              q: R`For events \(A\) and \(B\), \(P(B) = ${pb}\) and \(P(A \cap B) = ${pab}\). Find \(P(A^c \mid B)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Conditional probabilities obey every rule ordinary probabilities do, with \(B\) fixed — including the complement rule.</div>
                   <div class="sol-step">$$P(A \mid B) = \frac{${pab}}{${pb}} \approx ${U.fmt(pab / pb)} \quad\Longrightarrow\quad P(A^c \mid B) = 1 - ${U.fmt(pab / pb)} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Equivalently, \(P(A^c \mid B) = \frac{P(B) - P(A \cap B)}{P(B)} = \frac{${U.fmt(pb - pab)}}{${pb}}\).</div>`,
            };
          },
        },
        {
          name: "Union of two events, conditioned",
          make() {
            const v = U.venn2(); // conditional probabilities must stay consistent too
            const pac = v.pa, pbc = v.pb, pabc = v.both;
            const ans = v.union;
            return {
              q: R`Given an event \(C\), suppose \(P(A \mid C) = ${pac}\), \(P(B \mid C) = ${pbc}\), and \(P(A \cap B \mid C) = ${pabc}\). Find \(P(A \cup B \mid C)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">With \(C\) held fixed, \(P(\cdot \mid C)\) is itself a probability function, so the <b>addition rule applies unchanged</b>:</div>
                   <div class="sol-step">$$P(A \cup B \mid C) = P(A \mid C) + P(B \mid C) - P(A \cap B \mid C)$$</div>
                   <div class="sol-step">$$= ${pac} + ${pbc} - ${pabc} = ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Given A didn't happen, neither happens",
          make() {
            const v = U.venn2({ bothMin: 1, bothMax: 6, onlyMin: 3, onlyMax: 10 });
            const ans = v.neither / (1 - v.pa);
            return {
              q: R`In a shipment of laptops, ${v.pct.a}% have a faulty keyboard (\(K\)), ${v.pct.b}% have a faulty screen (\(S\)), and ${v.pct.both}% have both. Given that a laptop's keyboard is <b>not</b> faulty, what is the probability that its screen is also not faulty?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">We want \(P(S^c \mid K^c) = \frac{P(S^c \cap K^c)}{P(K^c)}\). The numerator is "neither" — the complement of the union.</div>
                   <div class="sol-step">$$P(K \cup S) = ${U.fmt(v.pa)} + ${U.fmt(v.pb)} - ${U.fmt(v.both)} = ${U.fmt(v.union)}, \qquad P(K^c \cap S^c) = 1 - ${U.fmt(v.union)} = ${U.fmt(v.neither)}$$</div>
                   <div class="sol-step">$$P(S^c \mid K^c) = \frac{${U.fmt(v.neither)}}{1 - ${U.fmt(v.pa)}} \approx ${U.fmt(ans)}$$ Not \(1 - P(S \mid K)\): the complement rule works inside one condition, not by swapping the condition too.</div>`,
            };
          },
        },
        {
          name: "Conditioning on the union",
          make() {
            const v = U.venn2();
            const pa = v.pa, pb = v.pb, pab = v.both;
            const pu = v.union;
            const ans = U.round(pa / pu, 6);
            return {
              q: R`For events \(A\) and \(B\): \(P(A) = ${pa}\), \(P(B) = ${pb}\), \(P(A \cap B) = ${pab}\). Given that <b>at least one</b> of the two events occurred, what is the probability that \(A\) occurred? That is, find \(P(A \mid A \cup B)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Here the conditioning event is a compound one. Since \(A \subseteq A \cup B\), the intersection simplifies: \(A \cap (A \cup B) = A\).</div>
                   <div class="sol-step">$$P(A \cup B) = ${pa} + ${pb} - ${pab} = ${U.fmt(pu)}$$</div>
                   <div class="sol-step">$$P(A \mid A \cup B) = \frac{P(A)}{P(A \cup B)} = \frac{${pa}}{${U.fmt(pu)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c2-gen-lotp",
      name: "Law of total probability",
      blurb: "Weighted averages over a partition — two groups, three machines, urns.",
      variants: [
        {
          name: "Two groups",
          make() {
            const pM = U.pick([0.5, 0.4, 0.6, 2 / 3]);
            const p1 = U.randInt(2, 8) / 100, p2 = U.randInt(1, 5) / 1000;
            const ans = p1 * pM + p2 * (1 - pM);
            return {
              q: R`In a population, a fraction ${U.fmt(pM, 3)} are men and the rest are women. ${U.fmt(p1 * 100)}% of men and ${U.fmt(p2 * 100, 2)}% of women are colourblind. A person is selected at random. What is the probability that they are colourblind?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Let \(M\) = male, \(C\) = colourblind. \(\{M, M^c\}\) partitions the population, so use LOTP:</div>
                   <div class="sol-step">$$P(C) = P(C \mid M)P(M) + P(C \mid M^c)P(M^c) = ${p1} \times ${U.fmt(pM, 3)} + ${p2} \times ${U.fmt(1 - pM, 3)} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">The answer is always <em>between</em> the two conditional rates — it is a weighted average, not a sum.</div>`,
            };
          },
        },
        {
          name: "Three machines",
          make() {
            const w = [U.randInt(2, 5), U.randInt(2, 5), U.randInt(2, 5)];
            const s = w[0] + w[1] + w[2];
            const d = [U.randInt(1, 6) / 100, U.randInt(1, 6) / 100, U.randInt(1, 6) / 100];
            const ans = (w[0] / s) * d[0] + (w[1] / s) * d[1] + (w[2] / s) * d[2];
            return {
              q: R`A factory has three machines. Machine 1 produces ${w[0]} of every ${s} items, Machine 2 produces ${w[1]}, and Machine 3 produces ${w[2]}. Their defect rates are ${U.fmt(d[0] * 100)}%, ${U.fmt(d[1] * 100)}%, and ${U.fmt(d[2] * 100)}% respectively. An item is picked at random from total production. What is the probability it is defective?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The machines partition production with \(P(M_i) = ${w[0]}/${s},\ ${w[1]}/${s},\ ${w[2]}/${s}\) (these sum to 1 — always check).</div>
                   <div class="sol-step">$$P(D) = \sum_{i=1}^{3} P(D \mid M_i)P(M_i) = ${d[0]}\cdot\tfrac{${w[0]}}{${s}} + ${d[1]}\cdot\tfrac{${w[1]}}{${s}} + ${d[2]}\cdot\tfrac{${w[2]}}{${s}} \approx ${U.fmt(ans, 5)}$$</div>`,
            };
          },
        },
        {
          name: "Pick an urn, then a ball",
          make() {
            const r1 = U.randInt(2, 6), b1 = U.randInt(2, 6), r2 = U.randInt(2, 6), b2 = U.randInt(2, 6);
            const pick1 = U.pick([0.5, 0.4, 0.6, 0.25, 0.75]);
            const ans = pick1 * (r1 / (r1 + b1)) + (1 - pick1) * (r2 / (r2 + b2));
            return {
              q: R`Urn I contains ${r1} red and ${b1} blue balls; Urn II contains ${r2} red and ${b2} blue balls. An urn is chosen — Urn I with probability ${pick1}, Urn II otherwise — and then one ball is drawn from it at random. What is the probability the ball is <b>red</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The choice of urn partitions the experiment. Condition on it:</div>
                   <div class="sol-step">$$P(\text{red} \mid \text{I}) = \frac{${r1}}{${r1 + b1}}, \qquad P(\text{red} \mid \text{II}) = \frac{${r2}}{${r2 + b2}}$$</div>
                   <div class="sol-step">$$P(\text{red}) = ${pick1}\cdot\frac{${r1}}{${r1 + b1}} + ${U.fmt(1 - pick1)}\cdot\frac{${r2}}{${r2 + b2}} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">A common error is to pool the balls (\(\frac{${r1 + r2}}{${r1 + b1 + r2 + b2}}\)) — that is only correct when the urns are equally likely <em>and</em> equally sized.</div>`,
            };
          },
        },
        {
          name: "The second draw (without replacement)",
          make() {
            const r = U.randInt(3, 8), b = U.randInt(3, 8);
            const n = r + b;
            const ans = r / n;
            return {
              q: R`An urn holds ${r} red and ${b} blue balls. Two balls are drawn without replacement. What is the probability that the <b>second</b> ball drawn is red?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Condition on the first ball — that is the partition \(\{R_1, R_1^c\}\):</div>
                   <div class="sol-step">$$P(R_2) = P(R_2 \mid R_1)P(R_1) + P(R_2 \mid B_1)P(B_1) = \frac{${r - 1}}{${n - 1}}\cdot\frac{${r}}{${n}} + \frac{${r}}{${n - 1}}\cdot\frac{${b}}{${n}}$$</div>
                   <div class="sol-step">$$= \frac{${r}\,[(${r}-1) + ${b}]}{${n}(${n}-1)} = \frac{${r}}{${n}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">The answer equals \(P(R_1)\): by symmetry, every position in the sequence is equally likely to hold a red ball. Knowing nothing about the first draw means the second is no different from the first.</div>`,
            };
          },
        },
        {
          name: "A coin of unknown type",
          make() {
            const nf = U.randInt(3, 8), nd = U.randInt(1, 3);
            const n = nf + nd;
            const ans = (nf / n) * 0.5 + (nd / n) * 1;
            return {
              q: R`A drawer holds ${n} coins: ${nf} are fair, and ${nd} ${U.plural(nd, "is", "are")} two-headed. One coin is drawn at random and flipped once. What is the probability it lands <b>Heads</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Partition by which type of coin was drawn: \(P(F) = \frac{${nf}}{${n}}\), \(P(F^c) = \frac{${nd}}{${n}}\).</div>
                   <div class="sol-step">The conditional probabilities are \(P(H \mid F) = \frac{1}{2}\) and \(P(H \mid F^c) = 1\) — a two-headed coin <em>always</em> shows Heads.</div>
                   <div class="sol-step">$$P(H) = \frac{1}{2}\cdot\frac{${nf}}{${n}} + 1\cdot\frac{${nd}}{${n}} = ${U.fmt(ans, 5)}$$</div>`,
            };
          },
        },
        {
          name: "Two draws, conditionally independent",
          make() {
            const r1 = U.randInt(2, 6), b1 = U.randInt(2, 6), r2 = U.randInt(2, 6), b2 = U.randInt(2, 6);
            const q1 = r1 / (r1 + b1), q2 = r2 / (r2 + b2);
            const ans = 0.5 * q1 * q1 + 0.5 * q2 * q2;
            return {
              q: R`Urn I contains ${r1} red and ${b1} blue balls; Urn II contains ${r2} red and ${b2} blue balls. An urn is chosen by a fair coin flip, and then <b>two</b> balls are drawn from it <b>with replacement</b>. What is the probability that both balls are red?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Given the urn, the two draws are independent (sampling with replacement), so the conditional probabilities multiply:</div>
                   <div class="sol-step">$$P(\text{both red} \mid \text{I}) = \left(\frac{${r1}}{${r1 + b1}}\right)^2 = ${U.fmt(q1 * q1, 5)}, \qquad P(\text{both red} \mid \text{II}) = \left(\frac{${r2}}{${r2 + b2}}\right)^2 = ${U.fmt(q2 * q2, 5)}$$</div>
                   <div class="sol-step">$$P(\text{both red}) = \tfrac{1}{2}(${U.fmt(q1 * q1, 5)}) + \tfrac{1}{2}(${U.fmt(q2 * q2, 5)}) \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Unconditionally the draws are <b>not</b> independent: the first red ball is evidence about which urn you are holding. Conditional independence does not imply independence.</div>`,
            };
          },
        },
        {
          name: "Hereditary mixture: no child affected",
          make() {
            const [mn, md] = U.pick([[1, 3], [1, 4], [1, 5], [2, 5], [1, 2]]);
            const m = mn / md, h = U.pick([0.5, 0.25, 0.4]), k = U.randInt(2, 3);
            const ans = m * Math.pow(1 - h, k) + (1 - m);
            return {
              q: R`A hereditary disease passes from a mother to each child independently with probability ${h} if she has it; if she does not, her children do not get it. A mother has the disease with probability \(${mn}/${md}\) and has ${k} children. What is the probability that <b>none</b> of the children has the disease?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The children are independent only <em>given</em> the mother's status, so condition on it first (LOTP with \(M\) = mother has the disease).</div>
                   <div class="sol-step">\(P(\text{none} \mid M) = (1 - ${h})^{${k}} = ${U.fmt(Math.pow(1 - h, k))}\) and \(P(\text{none} \mid M^c) = 1\).</div>
                   <div class="sol-step">$$P(\text{none}) = ${U.fmt(Math.pow(1 - h, k))}\cdot\frac{${mn}}{${md}} + 1\cdot\frac{${md - mn}}{${md}} \approx ${U.fmt(ans)}$$ Multiplying unconditional probabilities \(P(\text{child healthy})^{${k}}\) would be wrong — the children are not independent.</div>`,
            };
          },
        },
        {
          /* Theorem 2.4.3. Every quantity in the problem is already conditioned
           * on E; the work is noticing that LOTP still applies unchanged, and
           * that the weights must be P(A | E) rather than P(A). */
          name: "LOTP with extra conditioning",
          make() {
            const c = U.pick([
              {
                pop: "students who are studying abroad this term", one: "One such student", Etag: "E",
                groupA: "graduate students", groupB: "undergraduates", Atag: "G",
                doing: "living in university housing", Btag: "H",
                ask: "they live in university housing",
              },
              {
                pop: "flights that departed after 6 pm", one: "One such flight", Etag: "E",
                groupA: "international flights", groupB: "domestic flights", Atag: "I",
                doing: "arriving late", Btag: "L",
                ask: "it arrives late",
              },
              {
                pop: "insurance claims filed online", one: "One such claim", Etag: "E",
                groupA: "claims from long-standing customers", groupB: "claims from new customers", Atag: "C",
                doing: "being approved within a week", Btag: "W",
                ask: "it is approved within a week",
              },
            ]);
            const w = U.randInt(25, 70) / 100;        // P(A | E)
            const p1 = U.randInt(50, 90) / 100;       // P(B | A, E)
            const p2 = U.randInt(10, 45) / 100;       // P(B | A^c, E)
            const ans = p1 * w + p2 * (1 - w);
            return {
              q: R`Restrict attention to <b>${c.pop}</b>. Among them, a fraction ${U.fmt(w, 2)} are ${c.groupA} and the rest are ${c.groupB}. The probability of ${c.doing} is ${U.fmt(p1, 2)} among the ${c.groupA} and ${U.fmt(p2, 2)} among the ${c.groupB}. ${c.one} is chosen at random. What is the probability that ${c.ask}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Everything here already lives inside the world where \(${c.Etag}\) has occurred. <b>Conditional probabilities are probabilities</b>, so the law of total probability applies unchanged — you just carry \(${c.Etag}\) through every single term.</div>
                   <div class="sol-step">With \(${c.Atag}\) and \(${c.Atag}^c\) partitioning that restricted world: $$P(${c.Atag} \mid ${c.Etag}) = ${U.fmt(w, 2)}, \quad P(${c.Btag} \mid ${c.Atag}, ${c.Etag}) = ${U.fmt(p1, 2)}, \quad P(${c.Btag} \mid ${c.Atag}^c, ${c.Etag}) = ${U.fmt(p2, 2)}$$</div>
                   <div class="sol-step">$$P(${c.Btag} \mid ${c.Etag}) = P(${c.Btag} \mid ${c.Atag}, ${c.Etag})\,P(${c.Atag} \mid ${c.Etag}) + P(${c.Btag} \mid ${c.Atag}^c, ${c.Etag})\,P(${c.Atag}^c \mid ${c.Etag})$$ $$= ${U.fmt(p1, 2)} \times ${U.fmt(w, 2)} + ${U.fmt(p2, 2)} \times ${U.fmt(1 - w, 2)} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">The trap is reaching for an unconditional \(P(${c.Atag})\). You were never given one, and it would be the wrong weight: inside \(${c.Etag}\) the split is \(${U.fmt(w, 2)}\).</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c2-gen-bayes",
      name: "Bayes' rule",
      blurb: "Flip the conditioning: tests, coins, machines, spam, odds form.",
      variants: [
        {
          name: "Medical test (base rates)",
          make() {
            const prev = U.pick([0.01, 0.02, 0.05, 0.1]);
            const sens = U.pick([0.9, 0.95, 0.99]);
            const fpr = U.pick([0.05, 0.1, 0.02]);
            const pPos = sens * prev + fpr * (1 - prev);
            const ans = (sens * prev) / pPos;
            return {
              q: R`A disease affects ${U.fmt(prev * 100)}% of a population. A test detects the disease with probability ${sens} when it is present (sensitivity), but also gives a false positive with probability ${fpr} when it is absent. A randomly selected person tests positive. What is the probability they actually have the disease?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Let \(D\) = has disease, \(+\) = positive test. We want \(P(D \mid +)\); we are given \(P(+ \mid D) = ${sens}\), \(P(+ \mid D^c) = ${fpr}\), \(P(D) = ${prev}\).</div>
                   <div class="sol-step">LOTP for the denominator: $$P(+) = ${sens} \times ${prev} + ${fpr} \times ${U.fmt(1 - prev)} = ${U.fmt(pPos, 5)}$$</div>
                   <div class="sol-step">Bayes' rule: $$P(D \mid +) = \frac{P(+ \mid D)P(D)}{P(+)} = \frac{${sens} \times ${prev}}{${U.fmt(pPos, 5)}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Note how a positive test for a rare disease can still leave the probability surprisingly low — the prior matters.</div>`,
            };
          },
        },
        {
          name: "Which coin did you pick?",
          make() {
            const pH = U.pick([0.75, 0.8, 0.7]);
            const n = U.randInt(2, 4);
            const pDataFair = Math.pow(0.5, n);
            const pDataBias = Math.pow(pH, n);
            const ans = (pDataFair * 0.5) / (pDataFair * 0.5 + pDataBias * 0.5);
            return {
              q: R`You have one fair coin and one biased coin that lands Heads with probability ${pH}. You pick one of the two at random and flip it ${n} times; it lands Heads all ${n} times. Given this, what is the probability you picked the <b>fair</b> coin?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Let \(F\) = picked fair coin, \(A\) = all ${n} flips Heads. Prior: \(P(F) = P(F^c) = 1/2\).</div>
                   <div class="sol-step">Likelihoods: \(P(A \mid F) = (1/2)^{${n}} = ${U.fmt(pDataFair, 5)}\), \(P(A \mid F^c) = ${pH}^{${n}} = ${U.fmt(pDataBias, 5)}\).</div>
                   <div class="sol-step">$$P(F \mid A) = \frac{P(A \mid F)P(F)}{P(A \mid F)P(F) + P(A \mid F^c)P(F^c)} = \frac{${U.fmt(pDataFair, 5)}}{${U.fmt(pDataFair, 5)} + ${U.fmt(pDataBias, 5)}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">The equal priors cancel, so this reduces to comparing the two likelihoods.</div>`,
            };
          },
        },
        {
          name: "Which machine made the defective item?",
          make() {
            const w = [U.randInt(2, 5), U.randInt(2, 5), U.randInt(2, 5)];
            const s = w[0] + w[1] + w[2];
            const d = [U.randInt(1, 8) / 100, U.randInt(1, 8) / 100, U.randInt(1, 8) / 100];
            const joint = [0, 1, 2].map(i => (w[i] / s) * d[i]);
            const pD = joint[0] + joint[1] + joint[2];
            const j = U.randInt(0, 2);
            const ans = joint[j] / pD;
            return {
              q: R`A factory's three machines supply ${w[0]}, ${w[1]}, and ${w[2]} of every ${s} items produced, with defect rates ${U.fmt(d[0] * 100)}%, ${U.fmt(d[1] * 100)}%, and ${U.fmt(d[2] * 100)}% respectively. An item drawn at random turns out to be <b>defective</b>. What is the probability it came from <b>Machine ${j + 1}</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Bayes' rule with a three-part partition. The joint probabilities \(P(D \cap M_i) = P(D \mid M_i)P(M_i)\) are:</div>
                   <div class="sol-step">$$${[0, 1, 2].map(i => `${d[i]}\\cdot\\tfrac{${w[i]}}{${s}} = ${U.fmt(joint[i], 5)}`).join(", \\quad ")}$$</div>
                   <div class="sol-step">LOTP gives \(P(D) = ${U.fmt(pD, 5)}\), so $$P(M_{${j + 1}} \mid D) = \frac{${U.fmt(joint[j], 5)}}{${U.fmt(pD, 5)}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">The three posteriors sum to 1 — a useful check.</div>`,
            };
          },
        },
        {
          name: "Spam filter",
          make() {
            const pS = U.randInt(30, 70) / 100;
            const pWS = U.randInt(20, 60) / 100, pWN = U.randInt(2, 15) / 100;
            const pW = pWS * pS + pWN * (1 - pS);
            const ans = (pWS * pS) / pW;
            const word = U.pick(["free", "winner", "urgent", "prize"]);
            return {
              q: R`${U.fmt(pS * 100)}% of incoming email is spam. The word "<em>${word}</em>" appears in ${U.fmt(pWS * 100)}% of spam messages but only ${U.fmt(pWN * 100)}% of legitimate ones. A message arrives containing the word "<em>${word}</em>". What is the probability it is spam?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Let \(S\) = spam, \(W\) = contains the word. Given: \(P(S) = ${pS}\), \(P(W \mid S) = ${pWS}\), \(P(W \mid S^c) = ${pWN}\).</div>
                   <div class="sol-step">$$P(W) = ${pWS}\times${pS} + ${pWN}\times${U.fmt(1 - pS)} = ${U.fmt(pW, 5)}$$</div>
                   <div class="sol-step">$$P(S \mid W) = \frac{${pWS} \times ${pS}}{${U.fmt(pW, 5)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Odds form of Bayes",
          make() {
            const priorNum = U.randInt(1, 4), priorDen = U.randInt(1, 5);
            const lrNum = U.randInt(2, 9);
            // A likelihood ratio of exactly 1 is vacuous evidence (and reads as
            // "1 times as likely"), so keep the denominator away from the numerator.
            const lrDen = (d => (d === lrNum ? 1 : d))(U.randInt(1, 3));
            const postOdds = (priorNum / priorDen) * (lrNum / lrDen);
            const ans = postOdds / (1 + postOdds);
            return {
              q: R`Before seeing any evidence, the odds in favour of hypothesis \(H\) are ${priorNum} to ${priorDen}. A piece of evidence \(E\) is then observed; it is ${U.fmt(lrNum / lrDen, 3)} times as likely under \(H\) as under \(H^c\) (that is, \(P(E \mid H)/P(E \mid H^c) = ${U.fmt(lrNum / lrDen, 3)}\)). Find the <b>posterior probability</b> \(P(H \mid E)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The odds form of Bayes' rule multiplies rather than adds — no LOTP denominator needed:</div>
                   <div class="sol-step">$$\underbrace{\frac{P(H \mid E)}{P(H^c \mid E)}}_{\text{posterior odds}} = \underbrace{\frac{P(E \mid H)}{P(E \mid H^c)}}_{\text{likelihood ratio}} \times \underbrace{\frac{P(H)}{P(H^c)}}_{\text{prior odds}} = ${U.fmt(lrNum / lrDen, 3)} \times \frac{${priorNum}}{${priorDen}} = ${U.fmt(postOdds, 4)}$$</div>
                   <div class="sol-step">Convert odds back to a probability with \(P = \frac{\text{odds}}{1 + \text{odds}}\): $$P(H \mid E) = \frac{${U.fmt(postOdds, 4)}}{1 + ${U.fmt(postOdds, 4)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Which urn did the ball come from?",
          make() {
            const r1 = U.randInt(2, 7), b1 = U.randInt(2, 7), r2 = U.randInt(2, 7), b2 = U.randInt(2, 7);
            const j1 = 0.5 * (r1 / (r1 + b1)), j2 = 0.5 * (r2 / (r2 + b2));
            const ans = j1 / (j1 + j2);
            return {
              q: R`Urn I contains ${r1} red and ${b1} blue balls; Urn II contains ${r2} red and ${b2} blue balls. An urn is chosen by a fair coin flip and one ball is drawn from it. The ball is <b>red</b>. What is the probability it came from <b>Urn I</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Forward probabilities: \(P(\text{red} \mid \text{I}) = \frac{${r1}}{${r1 + b1}}\), \(P(\text{red} \mid \text{II}) = \frac{${r2}}{${r2 + b2}}\), each urn with prior \(\frac12\).</div>
                   <div class="sol-step">$$P(\text{red}) = \tfrac12\cdot\frac{${r1}}{${r1 + b1}} + \tfrac12\cdot\frac{${r2}}{${r2 + b2}} = ${U.fmt(j1 + j2, 5)}$$</div>
                   <div class="sol-step">$$P(\text{I} \mid \text{red}) = \frac{${U.fmt(j1, 5)}}{${U.fmt(j1 + j2, 5)}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">With equal priors the posterior just compares the two red fractions — the urn with the higher proportion of red becomes the more likely source.</div>`,
            };
          },
        },
        {
          name: "Eyewitness identification",
          make() {
            const share = U.pick([0.05, 0.1, 0.15, 0.2]);
            const acc = U.pick([0.8, 0.85, 0.9]);
            const pSay = acc * share + (1 - acc) * (1 - share);
            const ans = (acc * share) / pSay;
            return {
              q: R`In a city, ${U.fmt(share * 100)}% of taxis are blue and the rest are green. A witness to a night-time accident identifies the taxi as blue. Under the same conditions the witness correctly identifies a taxi's colour ${U.fmt(acc * 100)}% of the time (for either colour). What is the probability the taxi really was blue?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Let \(B\) = the taxi is blue, \(W\) = the witness says "blue". Given: \(P(B) = ${share}\), \(P(W \mid B) = ${acc}\), \(P(W \mid B^c) = ${U.fmt(1 - acc)}\) (a mistaken identification of a green taxi).</div>
                   <div class="sol-step">$$P(W) = ${acc}\times${share} + ${U.fmt(1 - acc)}\times${U.fmt(1 - share)} = ${U.fmt(pSay, 5)}$$</div>
                   <div class="sol-step">$$P(B \mid W) = \frac{${acc}\times${share}}{${U.fmt(pSay, 5)}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Ignoring the base rate and answering "${U.fmt(acc)}" is the classic <b>base-rate fallacy</b>: blue taxis are rare, so most "blue" reports come from misidentified green taxis.</div>`,
            };
          },
        },
        {
          name: "Updating on repeated observations",
          make() {
            const [mn, md] = U.pick([[1, 3], [1, 4], [1, 2], [2, 5]]);
            const m = mn / md, h = U.pick([0.5, 0.25, 0.4]), k = U.randInt(2, 3);
            const like = Math.pow(1 - h, k);
            const ans = m * like / (m * like + (1 - m));
            return {
              q: R`A hereditary disease passes from a mother to each child independently with probability ${h} if she has it; otherwise her children cannot get it. A mother has the disease with prior probability \(${mn}/${md}\). One by one, her ${k} children are all found <b>not</b> to have the disease. Given this, what is the probability the mother has it?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Let \(M\) = mother has the disease, \(N\) = all ${k} children healthy. Given \(M\) the children are independent: \(P(N \mid M) = (1 - ${h})^{${k}} = ${U.fmt(like)}\); \(P(N \mid M^c) = 1\).</div>
                   <div class="sol-step">$$P(M \mid N) = \frac{${U.fmt(like)}\cdot ${U.fmt(m)}}{${U.fmt(like)}\cdot ${U.fmt(m)} + 1\cdot ${U.fmt(1 - m)}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Updating one child at a time (posterior after each becomes the next prior) gives the same answer — the results arriving on different days changes nothing.</div>`,
            };
          },
        },
        {
          /* Theorem 2.4.2. Same machinery as ordinary Bayes, but with a
           * background event E that has to be carried through the prior, both
           * likelihoods and the LOTP denominator. */
          name: "Bayes with extra conditioning",
          make() {
            const c = U.pick([
              {
                pop: "support tickets that were escalated", one: "One such ticket", Etag: "E",
                groupA: "tickets from enterprise customers", groupB: "tickets from individual users", Atag: "C",
                isA: "from an enterprise customer",
                doing: "being resolved the same day", done: "been resolved the same day", Btag: "R",
              },
              {
                pop: "messages that got past the spam filter", one: "One such message", Etag: "E",
                groupA: "messages from mailing lists", groupB: "messages from people", Atag: "L", isA: "from a mailing list",
                doing: "going unread for a week", done: "gone unread for a week", Btag: "U",
              },
              {
                pop: "parts that failed inspection", one: "One such part", Etag: "E",
                groupA: "parts from the night shift", groupB: "parts from the day shift", Atag: "N", isA: "from the night shift",
                doing: "being scrapped rather than reworked", done: "been scrapped rather than reworked", Btag: "K",
              },
            ]);
            const prior = U.randInt(20, 60) / 100;    // P(A | E)
            const p1 = U.randInt(55, 90) / 100;       // P(B | A, E)
            const p2 = U.randInt(10, 40) / 100;       // P(B | A^c, E)
            const pB = p1 * prior + p2 * (1 - prior); // P(B | E)
            const ans = (p1 * prior) / pB;
            return {
              q: R`Restrict attention to <b>${c.pop}</b>. Among them, a fraction ${U.fmt(prior, 2)} are ${c.groupA} and the rest are ${c.groupB}. The probability of ${c.doing} is ${U.fmt(p1, 2)} among the ${c.groupA} and ${U.fmt(p2, 2)} among the ${c.groupB}. ${c.one} is chosen at random, and it turns out to have ${c.done}. What is the probability that it is ${c.isA}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">This is Bayes' rule run inside the world where \(${c.Etag}\) has occurred, so \(${c.Etag}\) rides along in <em>every</em> term — the prior, both likelihoods, and the denominator: $$P(${c.Atag} \mid ${c.Btag}, ${c.Etag}) = \frac{P(${c.Btag} \mid ${c.Atag}, ${c.Etag})\,P(${c.Atag} \mid ${c.Etag})}{P(${c.Btag} \mid ${c.Etag})}$$</div>
                   <div class="sol-step">Build the denominator first, with LOTP conditioned on \(${c.Etag}\): $$P(${c.Btag} \mid ${c.Etag}) = ${U.fmt(p1, 2)} \times ${U.fmt(prior, 2)} + ${U.fmt(p2, 2)} \times ${U.fmt(1 - prior, 2)} \approx ${U.fmt(pB, 5)}$$</div>
                   <div class="sol-step">$$P(${c.Atag} \mid ${c.Btag}, ${c.Etag}) = \frac{${U.fmt(p1, 2)} \times ${U.fmt(prior, 2)}}{${U.fmt(pB, 5)}} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Nothing new is happening here — fix \(${c.Etag}\), and \(P(\cdot \mid ${c.Etag})\) is a probability function like any other, obeying Bayes' rule unchanged. The only way to get this wrong is to drop \(${c.Etag}\) from one of the four terms.</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c2-gen-indep",
      name: "Independence & reliability",
      blurb: "Series, parallel, exactly-one, and k-of-n systems.",
      variants: [
        {
          name: "Series system (all must work)",
          make() {
            const p1 = U.randInt(80, 98) / 100, p2 = U.randInt(80, 98) / 100, p3 = U.randInt(80, 98) / 100;
            const all = p1 * p2 * p3;
            const which = Math.random() < 0.5 ? "all" : "one";
            const ans = which === "all" ? all : 1 - all;
            return {
              q: R`A device needs three independent components to function. The components work correctly with probabilities ${p1}, ${p2}, and ${p3}. What is the probability that ${which === "all" ? "<b>all three</b> components work" : "<b>at least one</b> component fails"}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">By independence, $$P(\text{all work}) = ${p1} \times ${p2} \times ${p3} = ${U.fmt(all, 5)}.$$</div>
                   <div class="sol-step">"At least one fails" is the complement: $$1 - ${U.fmt(all, 5)} = ${U.fmt(1 - all, 5)}.$$</div>
                   <div class="sol-step">Answer: \(${U.fmt(ans, 5)}\). Note a series system is <em>less</em> reliable than its weakest component.</div>`,
            };
          },
        },
        {
          name: "Parallel system (redundancy)",
          make() {
            const n = U.randInt(2, 4);
            const ps = Array.from({ length: n }, () => U.randInt(55, 85) / 100);
            const fail = ps.reduce((acc, p) => acc * (1 - p), 1);
            const ans = 1 - fail;
            return {
              q: R`A backup power system has ${n} independent generators, which start successfully with probabilities ${ps.map(p => String(p)).join(", ")}. The system works if <b>at least one</b> generator starts. What is the probability the system works?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">A parallel system fails only if <em>every</em> unit fails — and by independence those failures multiply:</div>
                   <div class="sol-step">$$P(\text{system fails}) = ${ps.map(p => `(1 - ${p})`).join(" \\times ")} = ${U.fmt(fail, 5)}$$</div>
                   <div class="sol-step">$$P(\text{system works}) = 1 - ${U.fmt(fail, 5)} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Redundancy makes the whole <em>more</em> reliable than any single part — the opposite of a series system.</div>`,
            };
          },
        },
        {
          name: "Exactly one works",
          make() {
            const p1 = U.randInt(40, 80) / 100, p2 = U.randInt(40, 80) / 100;
            const ans = p1 * (1 - p2) + (1 - p1) * p2;
            return {
              q: R`Two independent sensors trigger correctly with probabilities ${p1} and ${p2}. What is the probability that <b>exactly one</b> of the two triggers?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">"Exactly one" splits into two <b>disjoint</b> cases: first works and second fails, or first fails and second works.</div>
                   <div class="sol-step">$$P = ${p1}(1 - ${p2}) + (1 - ${p1})${p2} = ${U.fmt(p1 * (1 - p2), 4)} + ${U.fmt((1 - p1) * p2, 4)} = ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Equivalently \(P(A) + P(B) - 2P(A \cap B) = ${p1} + ${p2} - 2(${U.fmt(p1 * p2, 4)})\).</div>`,
            };
          },
        },
        {
          name: "Mixed series–parallel system",
          make() {
            const p1 = U.randInt(50, 85) / 100, p2 = U.randInt(50, 85) / 100, p3 = U.randInt(75, 95) / 100;
            const par = 1 - (1 - p1) * (1 - p2);
            const ans = par * p3;
            return {
              q: R`A circuit has components \(A\) and \(B\) wired <b>in parallel</b>, and that pair is wired <b>in series</b> with component \(C\). The circuit works if (\(A\) or \(B\) works) <em>and</em> \(C\) works. The three work independently with probabilities ${p1}, ${p2}, and ${p3}. What is the probability the circuit works?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Handle the parallel block first: it fails only if both \(A\) and \(B\) fail.</div>
                   <div class="sol-step">$$P(A \cup B) = 1 - (1 - ${p1})(1 - ${p2}) = ${U.fmt(par, 5)}$$</div>
                   <div class="sol-step">The block and \(C\) are independent, so multiply: $$P(\text{works}) = ${U.fmt(par, 5)} \times ${p3} \approx ${U.fmt(ans, 5)}$$</div>`,
            };
          },
        },
        {
          name: "At least k of n identical units",
          make() {
            const n = 3, p = U.randInt(60, 90) / 100, q = 1 - p;
            const ans = 3 * p * p * q + p * p * p;
            return {
              q: R`A server cluster has ${n} identical machines, each up (independently) with probability ${p}. The service stays online as long as <b>at least 2</b> machines are up. What is the probability the service is online?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Split into the disjoint cases "exactly 2 up" and "all 3 up".</div>
                   <div class="sol-step">Exactly 2: choose which machine is down (\(\binom{3}{2} = 3\) ways), each case with probability \(${p}^2(1-${p})\): $$3 \times ${U.fmt(p * p, 4)} \times ${U.fmt(q, 2)} = ${U.fmt(3 * p * p * q, 5)}$$</div>
                   <div class="sol-step">All 3: \(${p}^3 = ${U.fmt(p * p * p, 5)}\).</div>
                   <div class="sol-step">$$P = ${U.fmt(3 * p * p * q, 5)} + ${U.fmt(p * p * p, 5)} \approx ${U.fmt(ans, 5)}$$ (This is a Binomial probability — Chapter 3 gives it a name.)</div>`,
            };
          },
        },
        {
          name: "Redundant channels (at least one succeeds)",
          make() {
            const p = U.pick([0.7, 0.75, 0.8, 0.6]);
            const n = U.randInt(3, 6);
            const ans = 1 - Math.pow(1 - p, n);
            return {
              q: R`A message is sent over ${n} independent channels, each delivering it successfully with probability ${p}. The message arrives if <b>at least one</b> channel succeeds. What is the probability the message arrives?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Complement: every channel fails, each with probability \(1 - ${p} = ${U.fmt(1 - p)}\), independently.</div>
                   <div class="sol-step">$$P(\text{arrives}) = 1 - (${U.fmt(1 - p)})^{${n}} = 1 - ${U.fmt(Math.pow(1 - p, n), 6)} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Each extra channel multiplies the failure probability by \(${U.fmt(1 - p)}\) — reliability improves geometrically.</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c2-gen-union-indep",
      name: "Independent events: unions and intersections",
      blurb: "Both, at least one, neither — and solving backwards for a probability.",
      variants: [
        {
          name: "Both / at least one",
          make() {
            const pa = U.randInt(30, 70) / 100, pb = U.randInt(20, 60) / 100;
            const which = Math.random() < 0.5 ? "both" : "union";
            const both = pa * pb, union = pa + pb - both;
            const ans = which === "both" ? both : union;
            const [ia, ib] = U.pick([["orders a coffee", "orders a donut"], ["buys a ticket", "buys popcorn"], ["subscribes to the app", "enables notifications"]]);
            return {
              q: R`On a given day, a customer ${ia} with probability ${pa} and ${ib} with probability ${pb}, independently. What is the probability the customer ${which === "both" ? "does <b>both</b>" : "does <b>at least one</b> of the two"}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Independence gives \(P(A \cap B) = ${pa} \times ${pb} = ${U.fmt(both, 4)}\).</div>
                   <div class="sol-step">Addition rule: \(P(A \cup B) = ${pa} + ${pb} - ${U.fmt(both, 4)} = ${U.fmt(union, 4)}\).</div>
                   <div class="sol-step">Answer: \(${U.fmt(ans, 4)}\).</div>`,
            };
          },
        },
        {
          name: "Neither event occurs",
          make() {
            const pa = U.randInt(25, 65) / 100, pb = U.randInt(20, 60) / 100;
            const ans = (1 - pa) * (1 - pb);
            return {
              q: R`Two independent events have \(P(A) = ${pa}\) and \(P(B) = ${pb}\). Find \(P(A^c \cap B^c)\), the probability that <b>neither</b> occurs.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">If \(A\) and \(B\) are independent, so are \(A^c\) and \(B^c\) — so the complements simply multiply:</div>
                   <div class="sol-step">$$P(A^c \cap B^c) = (1 - ${pa})(1 - ${pb}) = ${U.fmt(1 - pa)} \times ${U.fmt(1 - pb)} = ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Check via De Morgan: \(1 - P(A \cup B) = 1 - (${pa} + ${pb} - ${U.fmt(pa * pb, 4)}) = ${U.fmt(1 - (pa + pb - pa * pb), 5)}\). ✓</div>`,
            };
          },
        },
        {
          name: "Exactly one of two independent events",
          make() {
            const pa = U.randInt(25, 70) / 100, pb = U.randInt(20, 65) / 100;
            const ans = pa + pb - 2 * pa * pb;
            return {
              q: R`Two independent events have \(P(A) = ${pa}\) and \(P(B) = ${pb}\). Find the probability that <b>exactly one</b> of them occurs.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(P(A \cap B) = ${pa} \times ${pb} = ${U.fmt(pa * pb, 4)}\) by independence.</div>
                   <div class="sol-step">"Exactly one" removes the overlap from <em>each</em> event: $$P(A) + P(B) - 2P(A \cap B) = ${pa} + ${pb} - 2(${U.fmt(pa * pb, 4)}) = ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Directly: \(P(A)P(B^c) + P(A^c)P(B) = ${U.fmt(pa * (1 - pb), 4)} + ${U.fmt((1 - pa) * pb, 4)}\). Same number.</div>`,
            };
          },
        },
        {
          name: "Solve backwards for P(B)",
          make() {
            const pa = U.randInt(20, 50) / 100, pb = U.randInt(20, 60) / 100;
            const union = U.round(pa + pb - pa * pb, 6);
            const ans = pb;
            return {
              q: R`Events \(A\) and \(B\) are <b>independent</b>, with \(P(A) = ${pa}\) and \(P(A \cup B) = ${U.fmt(union, 5)}\). Find \(P(B)\).`,
              answer: ans, kind: "prob", tol: 0.005,
              sol: R`<div class="sol-step">Write the addition rule and use independence on the overlap: $$P(A \cup B) = P(A) + P(B) - P(A)P(B)$$</div>
                   <div class="sol-step">$$${U.fmt(union, 5)} = ${pa} + P(B)\,(1 - ${pa})$$</div>
                   <div class="sol-step">$$P(B) = \frac{${U.fmt(union, 5)} - ${pa}}{1 - ${pa}} = \frac{${U.fmt(union - pa, 5)}}{${U.fmt(1 - pa)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "At least one of several independent events",
          make() {
            const n = U.randInt(3, 5);
            const p = U.randInt(10, 35) / 100;
            const ans = 1 - Math.pow(1 - p, n);
            return {
              q: R`A student applies to ${n} scholarships. Each application succeeds independently with probability ${p}. What is the probability of winning <b>at least one</b> scholarship?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Complement: all ${n} applications fail. By independence these multiply:</div>
                   <div class="sol-step">$$P(\text{none}) = (1 - ${p})^{${n}} = ${U.fmt(1 - p)}^{${n}} = ${U.fmt(Math.pow(1 - p, n), 6)}$$</div>
                   <div class="sol-step">$$P(\text{at least one}) = 1 - ${U.fmt(Math.pow(1 - p, n), 6)} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Adding \(${n} \times ${p} = ${U.fmt(n * p, 3)}\) instead would double-count the overlaps (and can exceed 1).</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c2-gen-odds",
      name: "Odds ↔ probability",
      blurb: "Convert in both directions, including odds against and posterior odds.",
      variants: [
        {
          name: "Odds in favour → probability",
          make() {
            const num = U.randInt(1, 5), den = U.randInt(1, 5);
            const ans = num / (num + den);
            return {
              q: R`The odds of an event \(A\) are ${num} to ${den} <b>in favour</b>, i.e. \(\text{odds}(A) = ${num}/${den}\). What is \(P(A)\)?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(\text{odds}(A) = \frac{P(A)}{1 - P(A)} = \frac{${num}}{${den}}\) ⟹ \(${den}\,P(A) = ${num}(1 - P(A))\).</div>
                   <div class="sol-step">$$P(A) = \frac{${num}}{${num} + ${den}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Shortcut: "\(a\) to \(b\) in favour" means \(a\) favourable parts out of \(a + b\) total parts.</div>`,
            };
          },
        },
        {
          name: "Probability → odds",
          make() {
            const p = U.randInt(2, 8) / 10;
            const ans = p / (1 - p);
            return {
              q: R`If \(P(A) = ${p}\), what are the odds of \(A\)? (Enter as a decimal or fraction — the odds may exceed 1.)`,
              answer: ans, kind: "num", tol: 0.01,
              sol: R`<div class="sol-step">$$\text{odds}(A) = \frac{P(A)}{P(A^c)} = \frac{${p}}{${U.fmt(1 - p)}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">As a whole-number ratio: ${(() => { const a = Math.round(p * 10), b = 10 - a, g = U.gcd(a, b); return `${a / g} to ${b / g}`; })()} in favour.</div>`,
            };
          },
        },
        {
          name: "Odds against → probability",
          make() {
            const num = U.randInt(2, 7), den = U.randInt(1, 3);
            const ans = den / (num + den);
            return {
              q: R`A bookmaker quotes the odds <b>against</b> an event \(A\) as ${num} to ${den}. What is \(P(A)\)?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Odds <em>against</em> invert the usual ratio: \(\frac{P(A^c)}{P(A)} = \frac{${num}}{${den}}\), so the odds <em>in favour</em> are \(\frac{${den}}{${num}}\).</div>
                   <div class="sol-step">$$P(A) = \frac{${den}}{${den} + ${num}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Reading the ratio the wrong way round here would give \(${U.fmt(num / (num + den))}\) — a classic slip.</div>`,
            };
          },
        },
        {
          name: "Posterior odds after evidence",
          make() {
            const p = U.pick([0.2, 0.25, 0.4, 0.5, 0.6]);
            const lr = U.pick([2, 3, 4, 5, 0.5]);
            const prior = p / (1 - p);
            const ans = prior * lr;
            return {
              q: R`A hypothesis \(H\) has prior probability \(P(H) = ${p}\). Evidence \(E\) arrives with likelihood ratio \(P(E \mid H)/P(E \mid H^c) = ${lr}\). What are the <b>posterior odds</b> of \(H\), i.e. \(P(H \mid E)/P(H^c \mid E)\)?`,
              answer: ans, kind: "num", tol: 0.01,
              sol: R`<div class="sol-step">Prior odds: $$\frac{P(H)}{P(H^c)} = \frac{${p}}{${U.fmt(1 - p)}} = ${U.fmt(prior, 4)}$$</div>
                   <div class="sol-step">The odds form of Bayes' rule just multiplies by the likelihood ratio: $$\text{posterior odds} = ${lr} \times ${U.fmt(prior, 4)} = ${U.fmt(ans, 4)}$$</div>
                   <div class="sol-step">${lr >= 1 ? R`Since the likelihood ratio exceeds 1, the evidence <b>supports</b> \(H\) and the odds rise.` : R`Since the likelihood ratio is below 1, the evidence <b>undercuts</b> \(H\) and the odds fall.`} As a probability this is \(\frac{${U.fmt(ans, 4)}}{1 + ${U.fmt(ans, 4)}} \approx ${U.fmt(ans / (1 + ans))}\).</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c2-gen-chain",
      name: "Chain rule & sequential draws",
      blurb: "Multiply conditionals along a sequence of dependent draws.",
      variants: [
        {
          name: "Several cards of one suit",
          make() {
            const k = U.randInt(2, 4);
            const suit = U.pick(["hearts", "spades", "clubs", "diamonds"]);
            const suitOne = suit.slice(0, -1); // "hearts" -> "heart"
            let ans = 1;
            for (let i = 0; i < k; i++) ans *= (13 - i) / (52 - i);
            const terms = Array.from({ length: k }, (_, i) => `\\frac{${13 - i}}{${52 - i}}`).join(" \\times ");
            return {
              q: R`${k} cards are drawn one at a time, without replacement, from a standard 52-card deck. What is the probability that <b>all ${k}</b> are ${suit}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Let \(A_i\) = "the \(i\)-th card is a ${suitOne}". The chain rule multiplies conditionals, each reflecting the cards already removed:</div>
                   <div class="sol-step">$$P(A_1 \cap \cdots \cap A_{${k}}) = P(A_1)P(A_2 \mid A_1)\cdots = ${terms} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Counting check: \(\binom{13}{${k}} / \binom{52}{${k}} = ${U.fmt(U.choose(13, k) / U.choose(52, k), 5)}\) — order does not change the answer.</div>`,
            };
          },
        },
        {
          name: "Coloured balls in a given order",
          make() {
            const r = U.randInt(4, 8), b = U.randInt(4, 8);
            const n = r + b;
            const ans = (r / n) * (b / (n - 1)) * ((r - 1) / (n - 2));
            return {
              q: R`An urn holds ${r} red and ${b} blue balls. Three balls are drawn one at a time without replacement. What is the probability the colours come out in the order <b>red, blue, red</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Apply the chain rule, updating the urn's contents after each draw:</div>
                   <div class="sol-step">$$P(R_1)P(B_2 \mid R_1)P(R_3 \mid R_1, B_2) = \frac{${r}}{${n}} \times \frac{${b}}{${n - 1}} \times \frac{${r - 1}}{${n - 2}} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">A specific <b>order</b> is required, so no binomial-style multiplier is needed here.</div>`,
            };
          },
        },
        {
          name: "No defective in a sequence of draws",
          make() {
            const d = U.randInt(2, 5), g = U.randInt(9, 15), k = U.randInt(2, 4);
            const n = d + g;
            let ans = 1;
            for (let i = 0; i < k; i++) ans *= (g - i) / (n - i);
            const terms = Array.from({ length: k }, (_, i) => `\\frac{${g - i}}{${n - i}}`).join(" \\times ");
            return {
              q: R`A crate holds ${n} parts, ${d} of which are defective. An inspector pulls ${k} parts one at a time without replacement. What is the probability that <b>none</b> of them is defective?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Each draw is conditioned on the previous ones: after \(i\) good parts are removed, \(${g} - i\) good parts remain out of \(${n} - i\).</div>
                   <div class="sol-step">$$P = ${terms} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Sampling <em>with</em> replacement would give \((${g}/${n})^{${k}} = ${U.fmt(Math.pow(g / n, k), 5)}\) — close, but not equal: without replacement the draws are dependent.</div>`,
            };
          },
        },
        {
          name: "Given conditionals, find the intersection",
          make() {
            const p1 = U.randInt(40, 80) / 100, p2 = U.randInt(40, 90) / 100, p3 = U.randInt(30, 90) / 100;
            const ans = U.round(p1 * p2 * p3, 8);
            return {
              q: R`For events \(A_1, A_2, A_3\): \(P(A_1) = ${p1}\), \(P(A_2 \mid A_1) = ${p2}\), and \(P(A_3 \mid A_1 \cap A_2) = ${p3}\). Find \(P(A_1 \cap A_2 \cap A_3)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">This is exactly the <b>chain rule</b> for three events:</div>
                   <div class="sol-step">$$P(A_1 \cap A_2 \cap A_3) = P(A_1)\,P(A_2 \mid A_1)\,P(A_3 \mid A_1, A_2)$$</div>
                   <div class="sol-step">$$= ${p1} \times ${p2} \times ${p3} = ${U.fmt(ans, 6)}$$</div>
                   <div class="sol-step">Each factor is conditioned on <em>everything</em> before it — that is what lets dependent events be multiplied.</div>`,
            };
          },
        },
        {
          name: "All different, one draw at a time",
          make() {
            const n = U.randInt(3, 5), m = U.pick([10, 12, 20]);
            let ans = 1;
            for (let i = 0; i < n; i++) ans *= (m - i) / m;
            const terms = Array.from({ length: n }, (_, i) => `\\frac{${m - i}}{${m}}`).join(" \\times ");
            return {
              q: R`${n} people each pick a number from \(\{1, 2, \dots, ${m}\}\) uniformly at random and independently. What is the probability that all ${n} numbers are <b>different</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Chain rule, person by person. The first person can pick anything; each later person must avoid the numbers already taken:</div>
                   <div class="sol-step">$$P = ${terms} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">The draws are independent, but the <em>events</em> "all distinct so far" are not — the conditional probability shrinks with each person.</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c2-gen-indep-check",
      name: "Independence: checking & pitfalls",
      blurb: "Is it really independence? Disjointness, complements, conditional independence.",
      variants: [
        {
          name: "Test the definition",
          make() {
            const pa = U.randInt(20, 60) / 100, pb = U.randInt(20, 60) / 100;
            const indep = Math.random() < 0.5;
            const actual = indep ? U.round(pa * pb, 6) : U.round(pa * pb + U.pick([-1, 1]) * U.randInt(5, 12) / 100, 6);
            const clamped = Math.min(Math.max(actual, 0.01), Math.min(pa, pb));
            const ans = U.round(pa * pb, 6);
            return {
              q: R`For events \(A\) and \(B\), \(P(A) = ${pa}\), \(P(B) = ${pb}\), and \(P(A \cap B) = ${U.fmt(clamped, 4)}\). Compute the value \(P(A)P(B)\) that the intersection <b>would</b> have if the events were independent.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Independence is the statement \(P(A \cap B) = P(A)P(B)\) — so compute the right-hand side and compare.</div>
                   <div class="sol-step">$$P(A)P(B) = ${pa} \times ${pb} = ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">The actual intersection is \(${U.fmt(clamped, 4)}\), so the events are <b>${Math.abs(clamped - ans) < 1e-9 ? "independent" : "not independent"}</b>.${Math.abs(clamped - ans) < 1e-9 ? "" : clamped > ans ? " The overlap is larger than independence predicts: the events are positively associated." : " The overlap is smaller than independence predicts: the events are negatively associated."}</div>
                   <div class="sol-step">Independence is a <em>numerical coincidence</em> between three probabilities, not something you can read off the story.</div>`,
            };
          },
        },
        {
          name: "Disjoint is not independent",
          make() {
            const pa = U.randInt(20, 45) / 100, pb = U.randInt(20, 45) / 100;
            const askCond = Math.random() < 0.5;
            const ans = 0; // disjointness forces both requested quantities to zero
            return {
              q: R`Events \(A\) and \(B\) are <b>mutually exclusive</b> (disjoint), with \(P(A) = ${pa}\) and \(P(B) = ${pb}\). Find ${askCond ? R`\(P(A \mid B)\)` : R`\(P(A \cap B)\)`}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Disjoint means \(A \cap B = \emptyset\), so \(P(A \cap B) = 0\).</div>
                   ${askCond ? R`<div class="sol-step">$$P(A \mid B) = \frac{P(A \cap B)}{P(B)} = \frac{0}{${pb}} = 0$$</div>` : ``}
                   <div class="sol-step">Were they independent we would need \(P(A \cap B) = P(A)P(B) = ${U.fmt(pa * pb, 4)} \ne 0\). So these events are <b>dependent</b>: learning that \(B\) occurred tells you \(A\) definitely did not — that is information, not independence.</div>`,
            };
          },
        },
        {
          name: "Independence of complements",
          make() {
            const pa = U.randInt(25, 70) / 100, pb = U.randInt(25, 70) / 100;
            const which = U.pick(["cc", "ac", "ca"]);
            const ans = which === "cc" ? (1 - pa) * (1 - pb) : which === "ac" ? pa * (1 - pb) : (1 - pa) * pb;
            const ask = which === "cc" ? R`P(A^c \cap B^c)` : which === "ac" ? R`P(A \cap B^c)` : R`P(A^c \cap B)`;
            return {
              q: R`\(A\) and \(B\) are independent with \(P(A) = ${pa}\) and \(P(B) = ${pb}\). Find \(${ask}\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">If \(A\) and \(B\) are independent, then so are \(A\) &amp; \(B^c\), \(A^c\) &amp; \(B\), and \(A^c\) &amp; \(B^c\) — so every such intersection is just a product.</div>
                   <div class="sol-step">$$${ask} = ${which === "cc" ? R`(1 - ${pa})(1 - ${pb})` : which === "ac" ? R`${pa}(1 - ${pb})` : R`(1 - ${pa})${pb}`} = ${U.fmt(ans, 5)}$$</div>`,
            };
          },
        },
        {
          name: "Conditional independence given E",
          make() {
            const pae = U.randInt(30, 80) / 100, pbe = U.randInt(30, 80) / 100;
            const ans = U.round(pae * pbe, 6);
            return {
              q: R`Given an event \(E\), events \(A\) and \(B\) are <b>conditionally independent</b>: \(P(A \cap B \mid E) = P(A \mid E)P(B \mid E)\). If \(P(A \mid E) = ${pae}\) and \(P(B \mid E) = ${pbe}\), find \(P(A \cap B \mid E)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Conditional independence is ordinary independence inside the world where \(E\) has occurred, so the conditional probabilities multiply:</div>
                   <div class="sol-step">$$P(A \cap B \mid E) = ${pae} \times ${pbe} = ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Careful: this says <em>nothing</em> about whether \(A\) and \(B\) are independent unconditionally, or conditionally independent given \(E^c\). Neither direction implies the other.</div>`,
            };
          },
        },
        {
          name: "Conditionally independent, yet dependent",
          make() {
            const [mn, md] = U.pick([[1, 3], [1, 4], [1, 5], [2, 5]]);
            const m = mn / md, h = U.pick([0.5, 0.6, 0.4]), g = U.pick([0, 0, 0.05, 0.1]);
            const pE = m * h + (1 - m) * g, pEY = m * h * h + (1 - m) * g * g;
            const ans = pEY / pE;
            return {
              q: R`A mother carries a gene with probability \(${mn}/${md}\). If she carries it, each of her two children independently inherits a trait with probability ${h}; if not, each independently has it with probability ${g}. Given that the <b>elder</b> child has the trait, what is the probability the <b>younger</b> one does?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Given the mother's status the children are independent, so condition on it (\(M\) = carrier): $$P(\text{elder}) = ${h}\cdot ${U.fmt(m)} + ${g}\cdot ${U.fmt(1 - m)} = ${U.fmt(pE)}, \qquad P(\text{both}) = ${h}^2 \cdot ${U.fmt(m)} + ${g}^2 \cdot ${U.fmt(1 - m)} = ${U.fmt(pEY)}$$</div>
                   <div class="sol-step">$$P(\text{younger} \mid \text{elder}) = \frac{${U.fmt(pEY)}}{${U.fmt(pE)}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Compare \(P(\text{younger}) = ${U.fmt(pE)}\): the elder's trait is evidence the mother is a carrier, which raises the younger's chance. Conditionally independent given \(M\), but <b>not</b> independent.</div>`,
            };
          },
        },
        {
          name: "Three mutually independent events",
          make() {
            const p = [U.randInt(30, 80) / 100, U.randInt(30, 80) / 100, U.randInt(30, 80) / 100];
            const askAll = Math.random() < 0.5;
            const all = p[0] * p[1] * p[2];
            const ans = askAll ? all : 1 - (1 - p[0]) * (1 - p[1]) * (1 - p[2]);
            return {
              q: R`\(A\), \(B\), and \(C\) are mutually independent with \(P(A) = ${p[0]}\), \(P(B) = ${p[1]}\), \(P(C) = ${p[2]}\). Find \(P(${askAll ? R`A \cap B \cap C` : R`A \cup B \cup C`})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Mutual independence means every intersection factorises — in particular \(P(A \cap B \cap C) = ${p[0]} \times ${p[1]} \times ${p[2]} = ${U.fmt(all, 5)}\).</div>
                   ${askAll ? `` : R`<div class="sol-step">For the union, go through the complement instead of three-event inclusion–exclusion: $$P(A \cup B \cup C) = 1 - P(A^c)P(B^c)P(C^c) = 1 - ${U.fmt((1 - p[0]) * (1 - p[1]) * (1 - p[2]), 5)} = ${U.fmt(ans, 5)}$$</div>`}
                   <div class="sol-step">Remember: mutual independence needs all four equations (three pairs <em>and</em> the triple). Pairwise independence alone is not enough.</div>`,
            };
          },
        },
      ],
    }),

    /* ========== Assignment 2: what exactly is the condition? ========== */
    MATH340.makeGenerator({
      id: "c2-gen-info",
      name: "What exactly are you conditioning on?",
      blurb: "\"The first is red\" vs \"at least one is red\" vs \"R1 is in the sample\": same story, different information.",
      variants: [
        {
          name: "Given the first draw",
          make() {
            const r = U.randInt(2, 6), b = U.randInt(2, 6), n = r + b;
            const ans = (r - 1) / (n - 1);
            return {
              q: R`A jar holds ${r} red and ${b} blue marbles. Two are drawn at random without replacement. Find the probability that both are red, <b>given that the first one is red</b>.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(P(\text{both red} \mid \text{first red}) = \frac{P(\text{both red})}{P(\text{first red})}\) since both-red is inside first-red.</div>
                   <div class="sol-step">More directly: once a red is out, ${n - 1} marbles remain and ${r - 1} of them are red. $$P = \frac{${r - 1}}{${n - 1}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Given at least one",
          make() {
            const r = U.randInt(2, 6), b = U.randInt(2, 6), n = r + b;
            const both = U.choose(r, 2), atLeast = U.choose(n, 2) - U.choose(b, 2);
            const ans = both / atLeast;
            return {
              q: R`A jar holds ${r} red and ${b} blue marbles. Two are drawn at random without replacement. Find the probability that both are red, <b>given that at least one of them is red</b>.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">All \(\binom{${n}}{2} = ${U.choose(n, 2)}\) unordered pairs are equally likely. "At least one red" rules out only the all-blue pairs: \(${U.choose(n, 2)} - \binom{${b}}{2} = ${atLeast}\) pairs remain.</div>
                   <div class="sol-step">Both red: \(\binom{${r}}{2} = ${both}\) pairs. $$P = \frac{${both}}{${atLeast}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Smaller than \(\frac{${r - 1}}{${n - 1}}\), the answer given "the first is red": "at least one" is weaker information, so it leaves more mixed pairs in play.</div>`,
            };
          },
        },
        {
          name: "Given a specific labelled item",
          make() {
            const r = U.randInt(2, 6), b = U.randInt(2, 6), n = r + b, k = U.randInt(2, Math.min(4, n - 2));
            // P(all k red | R1 in sample) = C(r-1, k-1) / C(n-1, k-1)
            const ans = U.choose(r - 1, k - 1) / U.choose(n - 1, k - 1);
            return {
              q: R`A jar holds ${r} red marbles, labelled \(R_1, \dots, R_{${r}}\), and ${b} blue marbles. ${k} marbles are drawn at random without replacement. Given that <b>\(R_1\) is one of the marbles drawn</b>, what is the probability that all ${k} are red?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Knowing a <em>specific</em> marble is in the sample fixes one slot; the other \(${k - 1}\) are a uniformly random subset of the remaining \(${n - 1}\) marbles.</div>
                   <div class="sol-step">They must all come from the other \(${r - 1}\) reds: $$P = \frac{\binom{${r - 1}}{${k - 1}}}{\binom{${n - 1}}{${k - 1}}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">This is not the same as "given at least one is red": naming the red marble is stronger information than merely knowing some red is present.</div>`,
            };
          },
        },
        {
          name: "At least one vs. a specific child",
          make() {
            const k = U.randInt(2, 4);
            const specific = Math.random() < 0.5;
            const ans = specific ? 1 / Math.pow(2, k - 1) : 1 / (Math.pow(2, k) - 1);
            return {
              q: R`A family has ${k} children; each is equally likely to be a girl or a boy, independently. Given that <b>${specific ? "the eldest child is a girl" : "at least one child is a girl"}</b>, what is the probability that all ${k} are girls?`,
              answer: ans, kind: "prob",
              sol: specific
                ? R`<div class="sol-step">The eldest's sex is independent of the others', so conditioning on it only settles that one child.</div>
                   <div class="sol-step">The remaining \(${k - 1}\) must all be girls: \(P = (1/2)^{${k - 1}} \approx ${U.fmt(ans)}\).</div>`
                : R`<div class="sol-step">The \(2^{${k}} = ${Math.pow(2, k)}\) sex sequences are equally likely. "At least one girl" removes only the all-boy sequence, leaving \(${Math.pow(2, k) - 1}\).</div>
                   <div class="sol-step">Exactly one of them is all girls: $$P = \frac{1}{${Math.pow(2, k) - 1}} \approx ${U.fmt(ans)}$$ Compare \((1/2)^{${k - 1}}\) for "the eldest is a girl" — "at least one" doesn't say <em>which</em> child.</div>`,
            };
          },
        },
        {
          name: "Dice: given at least one is high",
          make() {
            const t = U.randInt(3, 6);
            const hi = 7 - t, lo = t - 1;
            const ans = (hi * hi) / (36 - lo * lo);
            return {
              q: R`Two fair dice are rolled. Given that <b>at least one</b> die shows ${t === 6 ? "a 6" : R`\(${t}\) or more`}, what is the probability that <b>both</b> do?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">36 equally likely ordered rolls. The complement of "at least one \(\ge ${t}\)" is "both \(\le ${t - 1}\)": \(${lo}^2 = ${lo * lo}\) rolls. So the condition keeps \(36 - ${lo * lo} = ${36 - lo * lo}\) rolls.</div>
                   <div class="sol-step">Both \(\ge ${t}\): \(${hi}^2 = ${hi * hi}\) rolls, all inside the condition. $$P = \frac{${hi * hi}}{${36 - lo * lo}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Not \(${hi}/6\) — that would be the answer given that a <em>particular</em> die (say the first) is \(\ge ${t}\).</div>`,
            };
          },
        },
        {
          name: "Which draw was it? P(first | at least one)",
          make() {
            const r = U.randInt(2, 6), b = U.randInt(2, 6), n = r + b;
            const pAtLeast = 1 - U.choose(b, 2) / U.choose(n, 2);
            const ans = (r / n) / pAtLeast;
            return {
              q: R`A jar holds ${r} red and ${b} blue marbles. Two are drawn at random without replacement. Given that <b>at least one</b> of the two is red, what is the probability that the <b>first</b> one drawn is red?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">"First is red" sits inside "at least one red", so \(P(\text{first red} \mid \ge 1 \text{ red}) = P(\text{first red}) / P(\ge 1 \text{ red})\).</div>
                   <div class="sol-step">\(P(\text{first red}) = \frac{${r}}{${n}}\); \(P(\ge 1 \text{ red}) = 1 - \frac{\binom{${b}}{2}}{\binom{${n}}{2}} = 1 - \frac{${U.choose(b, 2)}}{${U.choose(n, 2)}} \approx ${U.fmt(pAtLeast)}\).</div>
                   <div class="sol-step">$$P = \frac{${r}/${n}}{${U.fmt(pAtLeast)}} \approx ${U.fmt(ans)}$$ More than \(\frac{1}{2}\): the pairs where both are red count towards "first is red" for sure.</div>`,
            };
          },
        },
      ],
    }),

    /* ========== Assignment 2: judging a diagnostic test ========== */
    MATH340.makeGenerator({
      id: "c2-gen-diag",
      name: "Diagnostic tests: sensitivity, specificity & accuracy",
      blurb: "Overall success rate, the always-negative 'test', negative predictive value, and how good a test must be.",
      variants: [
        {
          name: "Overall success rate",
          make() {
            const prev = U.pick([0.01, 0.02, 0.05, 0.1, 0.2]);
            const sens = U.pick([0.8, 0.9, 0.95, 0.99]), spec = U.pick([0.85, 0.9, 0.95, 0.98]);
            const ans = sens * prev + spec * (1 - prev);
            return {
              q: R`A disease affects ${U.fmt(prev * 100)}% of a population. A test has sensitivity ${sens} and specificity ${spec}. What is its <b>overall success rate</b> — the probability that a randomly chosen person is diagnosed correctly?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">A correct diagnosis is either a sick person testing positive or a healthy person testing negative. Partition on disease status (LOTP): $$P(\text{correct}) = P(+ \mid D)P(D) + P(- \mid D^c)P(D^c)$$</div>
                   <div class="sol-step">$$= ${sens}(${prev}) + ${spec}(${U.fmt(1 - prev)}) = ${U.fmt(ans)}$$ It is a weighted average of sensitivity and specificity, weighted by prevalence.</div>`,
            };
          },
        },
        {
          name: "Real test vs. 'everyone is healthy'",
          make() {
            const prev = U.pick([0.01, 0.02, 0.03]);
            const s = U.pick([0.9, 0.93, 0.95]);
            const real = s;
            const ans = (1 - prev) - real;
            return {
              q: R`A disease affects ${U.fmt(prev * 100)}% of people. Company A's test has sensitivity and specificity both equal to ${s}. Company B's "test" simply declares every patient disease-free. By how much does B's overall success rate <b>exceed</b> A's? (Answer B − A.)`,
              answer: ans, kind: "num", tol: 0.0006,
              sol: R`<div class="sol-step">B is correct exactly on the healthy: \(P(\text{correct}_B) = P(D^c) = ${U.fmt(1 - prev)}\).</div>
                   <div class="sol-step">A: \(${s}(${prev}) + ${s}(${U.fmt(1 - prev)}) = ${s}\) — with equal sensitivity and specificity, prevalence drops out.</div>
                   <div class="sol-step">$$${U.fmt(1 - prev)} - ${s} = ${U.fmt(ans)}$$ B "wins" on accuracy yet has sensitivity 0 — it never detects the disease, which is the whole point of testing.</div>`,
            };
          },
        },
        {
          name: "Negative predictive value",
          make() {
            const prev = U.pick([0.05, 0.1, 0.2, 0.3]);
            const sens = U.pick([0.7, 0.8, 0.85, 0.9]), spec = U.pick([0.9, 0.95, 0.98]);
            const pNeg = (1 - sens) * prev + spec * (1 - prev);
            const ans = spec * (1 - prev) / pNeg;
            return {
              q: R`A condition has prevalence ${prev}. A screening test has sensitivity ${sens} and specificity ${spec}. A patient tests <b>negative</b>. What is the probability they really are free of the condition?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Bayes, but with the <em>negative</em> result: we want \(P(D^c \mid -)\). The misses (\(1 - \text{sens}\)) are the false negatives.</div>
                   <div class="sol-step">$$P(-) = (1 - ${sens})(${prev}) + ${spec}(${U.fmt(1 - prev)}) = ${U.fmt(pNeg, 5)}$$</div>
                   <div class="sol-step">$$P(D^c \mid -) = \frac{${spec} \times ${U.fmt(1 - prev)}}{${U.fmt(pNeg, 5)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Equal sensitivity & specificity: how high?",
          make() {
            const prev = U.pick([0.01, 0.02, 0.04, 0.05, 0.08]);
            const ans = 1 - prev;
            return {
              q: R`A disease affects ${U.fmt(prev * 100)}% of people. A lab wants a test whose overall success rate beats the trivial rule "diagnose everyone as healthy". If its sensitivity and specificity are <b>equal</b> (call the common value \(s\)), how large must \(s\) be? (Give the threshold.)`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Trivial rule: correct with probability \(P(D^c) = ${U.fmt(1 - prev)}\).</div>
                   <div class="sol-step">New test: \(s(${prev}) + s(${U.fmt(1 - prev)}) = s\). We need \(s > ${U.fmt(1 - prev)}\).</div>
                   <div class="sol-step">Threshold \(s = ${U.fmt(ans)}\): a balanced test must be better than the prevalence of health — very demanding for a rare disease.</div>`,
            };
          },
        },
        {
          name: "Perfect sensitivity: required specificity",
          make() {
            const prev = U.pick([0.01, 0.02, 0.05, 0.1, 0.15]);
            const ans = (1 - 2 * prev) / (1 - prev);
            return {
              q: R`A disease affects ${U.fmt(prev * 100)}% of people. A new test has sensitivity <b>1</b>. How high must its specificity be for its overall success rate to beat the rule "diagnose everyone as healthy"? (Give the threshold.)`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Need \(1 \cdot ${prev} + \text{spec}\cdot ${U.fmt(1 - prev)} > ${U.fmt(1 - prev)}\).</div>
                   <div class="sol-step">$$\text{spec} > \frac{${U.fmt(1 - prev)} - ${prev}}{${U.fmt(1 - prev)}} = \frac{1 - 2(${prev})}{1 - ${prev}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Catching every sick person buys only \(${prev}\) of accuracy, so the test can afford very few false positives.</div>`,
            };
          },
        },
        {
          name: "Given specificity: required sensitivity",
          make() {
            const prev = U.pick([0.02, 0.05, 0.1]);
            // choose spec so that the threshold lands strictly inside (0, 1)
            const specs = [1, 0.999, 0.998, 0.995, 0.99, 0.98].filter(sp => (1 - prev) * (1 - sp) < prev);
            const spec = U.pick(specs);
            const ans = (1 - prev) * (1 - spec) / prev;
            return {
              q: R`A disease affects ${U.fmt(prev * 100)}% of people. A new test has specificity <b>${spec}</b>. How high must its sensitivity be for the overall success rate to beat "diagnose everyone as healthy"? (Give the threshold.)`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Need \(\text{sens}\cdot ${prev} + ${spec} \cdot ${U.fmt(1 - prev)} > ${U.fmt(1 - prev)}\), i.e. \(\text{sens}\cdot ${prev} > (1 - ${spec})(${U.fmt(1 - prev)})\).</div>
                   <div class="sol-step">$$\text{sens} > \frac{(1 - ${spec})(${U.fmt(1 - prev)})}{${prev}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">${spec === 1 ? R`With specificity 1 the test never makes a false positive, so <em>any</em> sensitivity above 0 beats the trivial rule.` : R`The sensitivity has to make up, in true positives, for the false positives the imperfect specificity creates among the healthy majority.`}</div>`,
            };
          },
        },
        {
          name: "Two positive tests in a row",
          make() {
            const prev = U.pick([0.005, 0.01, 0.02]);
            const sens = U.pick([0.9, 0.95, 0.98]), fpr = U.pick([0.05, 0.1]);
            const one = sens * prev / (sens * prev + fpr * (1 - prev));
            const ans = sens * sens * prev / (sens * sens * prev + fpr * fpr * (1 - prev));
            return {
              q: R`A disease has prevalence ${prev}. A test has sensitivity ${sens} and false-positive rate ${fpr}. A patient tests positive, then is retested and is positive again. Assuming the results are conditionally independent given disease status, find \(P(D \mid \text{both positive})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Conditional independence given \(D\) (and given \(D^c\)) lets the likelihoods multiply: \(P(++ \mid D) = ${sens}^2\), \(P(++ \mid D^c) = ${fpr}^2\).</div>
                   <div class="sol-step">$$P(D \mid ++) = \frac{${sens}^2(${prev})}{${sens}^2(${prev}) + ${fpr}^2(${U.fmt(1 - prev)})} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Sequentially: after one positive \(P(D \mid +) \approx ${U.fmt(one)}\); use that as the new prior and update again — same answer. One positive leaves plenty of doubt; the second does most of the work.</div>`,
            };
          },
        },
      ],
    }),
  ];


  /* ---------------- how to choose a method ---------------- */
  const methodGuide = [
    {
      when: R`"given that", "if we know", "among those who…", "of the people who…"`,
      use: R`Definition \(P(A \mid B) = \frac{P(A \cap B)}{P(B)}\)`,
      why: R`The conditioning event becomes the new sample space; divide the overlap by it. In a two-way table this is just "row total" instead of "grand total".`,
    },
    {
      when: R`you are given \(P(B)\) and \(P(A \mid B)\) and asked for the overlap`,
      use: R`Multiplication rule \(P(A \cap B) = P(B)P(A \mid B)\)`,
      why: R`Same identity read left to right instead of right to left. Which of the two events you condition on is whichever conditional you were handed.`,
    },
    {
      when: R`draws one at a time without replacement; "then", "and then"`,
      use: R`Chain rule`,
      why: R`Multiply conditionals along the sequence, updating the pool after each draw. No binomial coefficient: a specific order was asked for.`,
    },
    {
      when: R`the population splits into groups with <em>different rates</em>, and an overall rate is wanted`,
      use: R`LOTP \(P(B) = \sum_i P(B \mid A_i)P(A_i)\)`,
      why: R`You are running the rule <b>forwards</b>: weight each group's rate by how common the group is. The groups must partition the space.`,
    },
    {
      when: R`the evidence is already observed and you want the cause — "given it tested positive, …"`,
      use: R`Bayes' rule`,
      why: R`You are running it <b>backwards</b>. The denominator is nearly always LOTP, so do that first, then divide the one joint probability you care about by it.`,
    },
    {
      when: R`the prior is given as odds, or only a likelihood <em>ratio</em> is given`,
      use: R`Odds form of Bayes`,
      why: R`Posterior odds = likelihood ratio × prior odds — a multiplication with no denominator to compute. Convert back with \(P = \text{odds}/(1+\text{odds})\).`,
    },
    {
      when: R`"independently", separate components, repeated trials of the same experiment`,
      use: R`Multiply: \(P(A \cap B) = P(A)P(B)\)`,
      why: R`Independence is what licenses multiplying <em>unconditional</em> probabilities. Complements of independent events are independent too.`,
    },
    {
      when: R`"at least one works / fails / arrives" with independent parts`,
      use: R`\(1 - \prod (1 - p_i)\)`,
      why: R`Parallel systems fail only when every part fails, and independent failures multiply. Series systems are the mirror image: \(\prod p_i\).`,
    },
    {
      when: R`you are asked <em>whether</em> two events are independent`,
      use: R`Test \(P(A \cap B) \stackrel{?}{=} P(A)P(B)\)`,
      why: R`It is an arithmetic check on three numbers, not something the story tells you. Disjoint events are the classic trap: they are dependent, not independent.`,
    },
    {
      when: R`"among those who…", "restrict attention to…" — a background condition fixed for the whole question`,
      use: R`LOTP or Bayes <em>with extra conditioning</em>`,
      why: R`Fix \(E\) and \(P(\cdot \mid E)\) is an ordinary probability function, so both rules apply unchanged — but \(E\) must ride along in every term, and the weights are \(P(A_i \mid E)\), not \(P(A_i)\).`,
    },
    {
      when: R`a rare condition plus an accurate test, and the answer "feels" obviously high`,
      use: R`Check the base rate`,
      why: R`With a rare cause, most positives are false positives. Trusting the sensitivity and ignoring \(P(A)\) is the single most common error in the chapter.`,
    },
    {
      when: R`"given that the first is…" vs "given that at least one is…" vs "given that \(R_1\) is one of them"`,
      use: R`Condition on <em>exactly</em> the stated event, then count or use the definition`,
      why: R`These are different events with different probabilities. "At least one" rules out the least, so it moves the answer the least; naming a specific item or position is stronger information.`,
    },
    {
      when: R`sensitivity, specificity, "overall success rate", "accuracy"`,
      use: R`LOTP: \(\text{sens}\cdot P(D) + \text{spec}\cdot P(D^c)\)`,
      why: R`Accuracy averages the two rates by prevalence. For a rare disease "call everyone healthy" scores \(P(D^c)\) — compare against that, then solve the inequality for the unknown rate.`,
    },
    {
      when: R`several observations that are independent <em>given</em> a hidden cause (children of one mother, repeated tests of one patient)`,
      use: R`Condition on the cause first; multiply likelihoods inside each case`,
      why: R`The observations are conditionally independent but not independent, so never multiply their unconditional probabilities. Updating one observation at a time gives the same posterior as all at once.`,
    },
  ];

  MATH340.registerUnit({
    id: "ch2",
    title: "Chapter 2 · Conditional Probability",
    short: "Ch 2 · Conditional",
    week: 2,
    order: 2,
    description: "Conditional probability, Bayes' rule, odds, the law of total probability, independence, and conditional independence — plus the Assignment 2 problem shapes: what exactly is being conditioned on, and judging a diagnostic test.",
    flashcards,
    generators,
    methodGuide,
  });
})();
