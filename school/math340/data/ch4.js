/* ============================================================
 * Chapter 4 — Expectation and Variance  (Week 4)
 * Source: class lecture notes (C4, 24 slides) + Blitzstein & Hwang
 *         §4.1–4.6
 * Covers: the definition of E(X) for a discrete r.v., linearity of
 *         expectation, the law of the unconscious statistician (LOTUS),
 *         variance and standard deviation, the shortcut
 *         Var(X) = E(X^2) - [E(X)]^2, the properties of variance, and the
 *         summary table of means and variances of the named discrete
 *         distributions. The deck's worked examples (the fair die, the
 *         Bernoulli, |x|/32, E(2 - 7X), the computer-store profit, the
 *         x^2/10 PMF, Var(2X + 3Y + 1)) appear as cards and as problem
 *         shapes with fresh numbers.
 * ============================================================ */
(function () {
  const U = MATH340.util;
  const R = String.raw;

  const flashcards = [
    {
      id: "c4-ev-def", tag: "Definition",
      front: R`Define the <em>expected value</em> \(E(X)\) of a discrete random variable \(X\).`,
      back: R`If the distinct possible values of \(X\) are \(x_1, x_2, \dots\), $$E(X) = \sum_{j} x_j\,P(X = x_j) = \sum_x \underbrace{x}_{\text{value}}\ \underbrace{P(X = x)}_{\text{PMF at } x}.$$ Multiply each value by its probability and add. With a finite support the sum is finite. Also called the <b>expectation</b> or <b>mean</b>.`,
    },
    {
      id: "c4-ev-weighted", tag: "Interpretation",
      front: R`What does \(E(X)\) mean, and does it have to be a value \(X\) can take?`,
      back: R`It is a <b>weighted average</b> of the possible values, weighted by their probabilities: the balance point (centre of mass) of the PMF, and the long-run average over many repetitions. It need <b>not</b> be a possible value: a fair die has \(E(X) = 3.5\).`,
    },
    {
      id: "c4-ev-die", tag: "Example 1 · fair die",
      front: R`\(X\) is the result of rolling a fair 6-sided die. Find \(E(X)\).`,
      back: R`$$E(X) = \frac{1}{6}(1 + 2 + 3 + 4 + 5 + 6) = \frac{21}{6} = 3.5.$$ More generally a fair die numbered \(1, \dots, n\), or any Discrete Uniform on \(a, \dots, b\), has mean \(\frac{a + b}{2}\), the midpoint.`,
    },
    {
      id: "c4-ev-bern", tag: "Example 2 · Bernoulli",
      front: R`\(X \sim \text{Bern}(p)\). Find \(E(X)\). What does this say about an indicator \(I_A\)?`,
      back: R`$$E(X) = 1 \cdot p + 0 \cdot q = p.$$ So \(E(I_A) = P(A)\): the expected value of an indicator is the probability of its event. This is the <b>fundamental bridge</b> between expectation and probability.`,
    },
    {
      id: "c4-ev-symmetric", tag: "Example 3 · symmetry",
      front: R`\(f_X(x) = \frac{|x|}{32}\) for \(x = -10, -5, -1, 0, 1, 5, 10\). Find \(E(X)\) without computing seven products.`,
      back: R`The PMF is <b>symmetric about 0</b>: \(P(X = x) = P(X = -x)\). The terms \(x\,P(X = x)\) and \((-x)P(X = -x)\) cancel in pairs, so \(E(X) = 0\). In general, a PMF symmetric about \(c\) has \(E(X) = c\) (when the mean exists).`,
    },
    {
      id: "c4-linearity", tag: "Theorem · linearity",
      front: R`State <em>linearity of expectation</em>. Does it need \(X\) and \(Y\) to be independent?`,
      back: R`For any \(X\), \(Y\) and any constant \(c\): $$E(X + Y) = E(X) + E(Y), \qquad E(cX) = c\,E(X).$$ <b>No independence is needed.</b> It holds for dependent random variables too, which is what makes it so powerful.`,
    },
    {
      id: "c4-linear-affine", tag: "Linearity · consequence",
      front: R`What is \(E(aX + b)\)? What is \(E(b)\) for a constant \(b\)?`,
      back: R`$$E(aX + b) = a\,E(X) + b, \qquad E(b) = b.$$ A constant is a random variable that always takes the same value, so its average is itself. Example: if \(E(X) = 5\), then \(E(2 - 7X) = 2 - 7(5) = -33\).`,
    },
    {
      id: "c4-linear-ex", tag: "Example · linearity",
      front: R`\(E(X) = 5\) and \(E(X^2) = 12\). Find \(E(3X^2 + 4X - 2)\).`,
      back: R`Treat \(X^2\) as its own random variable and apply linearity term by term: $$E(3X^2 + 4X - 2) = 3E(X^2) + 4E(X) - 2 = 3(12) + 4(5) - 2 = 54.$$ You need \(E(X^2)\) as a separate input: it cannot be built from \(E(X)\).`,
    },
    {
      id: "c4-g-trap", tag: "Common pitfall",
      front: R`Is \(E(X^2) = [E(X)]^2\)? Is \(E(g(X)) = g(E(X))\)?`,
      back: R`<b>Not in general.</b> Linearity only lets you pull out <em>constants</em> and split <em>sums</em>. For a nonlinear \(g\) (squares, \(\frac{1}{X}\), \(|X|\), \(\min(X, c)\)) you must use LOTUS. In fact \(E(X^2) - [E(X)]^2 = \text{Var}(X) \ge 0\), so \(E(X^2) \ge [E(X)]^2\), with equality only when \(X\) is constant.`,
    },
    {
      id: "c4-indicator-count", tag: "Linearity · indicators",
      front: R`How do you find the expected <em>number</em> of events \(A_1, \dots, A_n\) that occur?`,
      back: R`Write the count as a sum of indicators, \(X = I_{A_1} + \dots + I_{A_n}\), then $$E(X) = P(A_1) + \dots + P(A_n).$$ This works even when the events are dependent. Example: \(n\) people get their hats back at random, each \(P(\text{own hat}) = \frac{1}{n}\), so the expected number of matches is \(n \cdot \frac{1}{n} = 1\).`,
    },
    {
      id: "c4-bin-indicators", tag: "Binomial · via indicators",
      front: R`Use indicators to derive \(E(X)\) and \(\text{Var}(X)\) for \(X \sim \text{Bin}(n, p)\).`,
      back: R`\(X = I_1 + \dots + I_n\), where \(I_j\) indicates success on trial \(j\), with \(I_j \sim \text{Bern}(p)\). Linearity: \(E(X) = np\). The \(I_j\) are independent and each has variance \(p(1 - p)\), so \(\text{Var}(X) = np(1 - p)\).`,
    },
    {
      id: "c4-lotus", tag: "Theorem 4.5.1 · LOTUS",
      front: R`State the <em>law of the unconscious statistician</em> (LOTUS) for a discrete \(X\).`,
      back: R`If \(g : \mathbb{R} \to \mathbb{R}\), then $$E(g(X)) = \sum_x g(x)\,P(X = x),$$ summing over all possible values of \(X\). Apply \(g\) to each <b>value</b> and keep the <b>probabilities</b> of \(X\).`,
    },
    {
      id: "c4-lotus-why", tag: "LOTUS · why it helps",
      front: R`Why is LOTUS a shortcut? What would you have to do without it?`,
      back: R`Without it you would first find the PMF of \(Y = g(X)\), pooling every \(x\) that \(g\) sends to the same \(y\), and then compute \(\sum_y y\,P(Y = y)\). LOTUS skips that step: sum \(g(x)P(X = x)\) directly over the values of \(X\). Pooled values are counted correctly automatically.`,
    },
    {
      id: "c4-profit", tag: "Example · expected profit",
      front: R`A store buys 3 computers at $500 and sells each at $1000, and unsold ones go back for $200. \(X\) sold has PMF \(0.1, 0.2, 0.3, 0.4\) on \(0, 1, 2, 3\). Find \(h(X)\) and \(E[h(X)]\).`,
      back: R`$$h(X) = 1000X + 200(3 - X) - 1500 = 800X - 900.$$ \(E(X) = 0(0.1) + 1(0.2) + 2(0.3) + 3(0.4) = 2\). Since \(h\) is linear, $$E[h(X)] = 800E(X) - 900 = \$700.$$ (LOTUS term by term gives the same: \(-900(0.1) - 100(0.2) + 700(0.3) + 1500(0.4) = 700\).)`,
    },
    {
      id: "c4-ex-x2", tag: "Example · E(X²) by LOTUS",
      front: R`\(f_X(x) = \frac{x^2}{10}\) for \(x = -2, -1, 0, 1, 2\). Find \(E(X)\), \(E(X^2)\) and \(\text{Var}(X)\).`,
      back: R`Symmetric about 0, so \(E(X) = 0\). By LOTUS, $$E(X^2) = \sum x^2 \cdot \frac{x^2}{10} = \frac{16 + 1 + 0 + 1 + 16}{10} = 3.4.$$ Then \(\text{Var}(X) = 3.4 - 0^2 = 3.4\), and \(E(4X + 3) = 3\).`,
    },
    {
      id: "c4-var-def", tag: "Definition 4.6.1",
      front: R`Define the <em>variance</em> and the <em>standard deviation</em> of \(X\).`,
      back: R`$$\text{Var}(X) = E\big[(X - E(X))^2\big], \qquad \text{SD}(X) = \sqrt{\text{Var}(X)}.$$ Variance is the average squared distance from the mean, a measure of spread. The SD is in the same units as \(X\). Variance is in squared units.`,
    },
    {
      id: "c4-var-shortcut", tag: "Theorem 4.6.2",
      front: R`State the computational formula for \(\text{Var}(X)\).`,
      back: R`$$\text{Var}(X) = E(X^2) - [E(X)]^2.$$ "Mean of the square minus square of the mean." Find \(E(X)\) and \(E(X^2)\) (by LOTUS), then subtract. Rearranged: \(E(X^2) = \text{Var}(X) + [E(X)]^2\).`,
    },
    {
      id: "c4-var-shift", tag: "Properties of variance",
      front: R`What is \(\text{Var}(X + c)\) for a constant \(c\), and why?`,
      back: R`$$\text{Var}(X + c) = \text{Var}(X).$$ Shifting moves the whole distribution, including its mean, by \(c\). The distances from the mean do not change, so the spread does not change.`,
    },
    {
      id: "c4-var-scale", tag: "Properties of variance",
      front: R`What are \(\text{Var}(cX)\) and \(\text{Var}(aX + b)\)?`,
      back: R`$$\text{Var}(cX) = c^2\,\text{Var}(X), \qquad \text{Var}(aX + b) = a^2\,\text{Var}(X).$$ The constant comes out <b>squared</b>, so a negative sign disappears: \(\text{Var}(-X) = \text{Var}(X)\). For the SD: \(\text{SD}(aX + b) = |a|\,\text{SD}(X)\).`,
    },
    {
      id: "c4-var-indep", tag: "Properties of variance",
      front: R`When is \(\text{Var}(X + Y) = \text{Var}(X) + \text{Var}(Y)\)? What is \(\text{Var}(X - Y)\)?`,
      back: R`When \(X\) and \(Y\) are <b>independent</b>. Unlike linearity of expectation, this needs independence. Then $$\text{Var}(X - Y) = \text{Var}(X) + (-1)^2\text{Var}(Y) = \text{Var}(X) + \text{Var}(Y).$$ Variances of a difference <b>add</b>. More generally, \(\text{Var}(aX + bY + c) = a^2\text{Var}(X) + b^2\text{Var}(Y)\).`,
    },
    {
      id: "c4-var-nonneg", tag: "Properties of variance",
      front: R`What is the smallest a variance can be, and when is it attained?`,
      back: R`\(\text{Var}(X) \ge 0\), with equality <b>if and only if</b> \(P(X = a) = 1\) for some constant \(a\). It is an average of squares. A negative variance in your working means an arithmetic slip, typically \(E(X^2) - E(X)\) instead of \(E(X^2) - [E(X)]^2\).`,
    },
    {
      id: "c4-var-ex", tag: "Example · properties",
      front: R`\(\text{Var}(X) = 5\), \(\text{Var}(Y) = 4\), \(X\) and \(Y\) independent. Find \(\text{Var}(2X + 2)\), \(\text{Var}(2X + 3Y + 1)\) and \(\text{SD}(Y)\).`,
      back: R`\(\text{Var}(2X + 2) = 2^2 \cdot 5 = 20\). The shift drops out.<br>\(\text{Var}(2X + 3Y + 1) = 4(5) + 9(4) = 56\).<br>\(\text{SD}(Y) = \sqrt{4} = 2\).`,
    },
    {
      id: "c4-sum-vs-scale", tag: "Common pitfall",
      front: R`\(X_1, \dots, X_n\) are i.i.d. with variance \(\sigma^2\). Compare \(\text{Var}(X_1 + \dots + X_n)\) with \(\text{Var}(nX_1)\).`,
      back: R`$$\text{Var}(X_1 + \dots + X_n) = n\sigma^2, \qquad \text{Var}(nX_1) = n^2\sigma^2.$$ Both have mean \(n\mu\), but \(n\) independent copies partly cancel each other's deviations. One copy scaled by \(n\) moves all at once.`,
    },
    {
      id: "c4-sd-combine", tag: "Common pitfall",
      front: R`\(X\), \(Y\) independent with \(\text{SD}(X) = 3\), \(\text{SD}(Y) = 4\). Is \(\text{SD}(X + Y) = 7\)?`,
      back: R`<b>No.</b> Standard deviations do not add; <b>variances</b> do (for independent r.v.s). Square, add, take the root: $$\text{SD}(X + Y) = \sqrt{3^2 + 4^2} = 5.$$`,
    },
    {
      id: "c4-summary-table", tag: "Summary table",
      front: R`Give the mean and variance of \(\text{Bern}(p)\), \(\text{Bin}(n, p)\), \(\text{HGeom}\) (population \(N\), \(K\) successes, \(n\) drawn) and \(\text{Pois}(\lambda)\).`,
      back: R`Bern: \(p\), \(p(1 - p)\).<br>Bin: \(np\), \(np(1 - p)\).<br>HGeom: \(n\frac{K}{N}\), \(n\frac{K}{N}\left(1 - \frac{K}{N}\right)\frac{N - n}{N - 1}\).<br>Pois: \(\lambda\), \(\lambda\).<br>The hypergeometric has the binomial's mean but a smaller variance: the factor \(\frac{N - n}{N - 1}\) is the finite-population correction for sampling without replacement.`,
    },
    {
      id: "c4-geom-convention", tag: "Summary table · conventions",
      front: R`The lecture's summary table gives the Geometric mean as \(\frac{1}{p}\) and the Negative Binomial mean as \(\frac{r}{p}\); Table C gives \(\frac{q}{p}\) and \(\frac{rq}{p}\). Which is right?`,
      back: R`Both. They count different things. \(\frac{1}{p}\) and \(\frac{r}{p}\) count <b>trials</b>, up to and including the first (or \(r\)th) success. \(\frac{q}{p}\) and \(\frac{rq}{p}\) count <b>failures</b> before it. Trials \(=\) failures \(+\, r\), so the means differ by \(r\) (by 1 for the Geometric). The variances are the same: \(\frac{q}{p^2}\) and \(\frac{rq}{p^2}\), because a shift does not change variance. Read the question for which count it wants.`,
    },
  ];

  /* ---------------- small helpers ---------------- */

  // k positive multiples of `step` (in hundredths) summing to 100.
  function pmfHundredths(k, step = 5) {
    const units = 100 / step;
    const parts = Array(k).fill(1);
    for (let i = 0; i < units - k; i++) parts[U.randInt(0, k - 1)]++;
    return parts.map(x => x * step);
  }
  const hund = h => U.fmt(h / 100, 2);                 // 35 -> "0.35"
  const sum = a => a.reduce((x, y) => x + y, 0);
  const f4 = x => U.fmt(x, 4);
  const paren = x => (x < 0 ? `(${x})` : String(x));   // -3 -> "(-3)" inside a product
  const signed = (x, first) => (x < 0 ? `- ${-x}` : (first ? String(x) : `+ ${x}`));

  function pmfTable(xs, ps, xLabel = "x", pLabel = R`P(X = x)`) {
    return R`<table class="tbl"><tr><th>\(${xLabel}\)</th>${xs.map(x => `<td>${x}</td>`).join("")}</tr>
      <tr><th>\(${pLabel}\)</th>${ps.map(p => `<td>${p}</td>`).join("")}</tr></table>`;
  }

  /* A random PMF on k distinct integer values, probabilities in hundredths.
   * Moments are kept as exact integers (in hundredths) so the solution can
   * show them without floating-point noise. */
  function randomPmf({ k = U.randInt(4, 5), pool = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6] } = {}) {
    const xs = U.sample(pool, k).sort((a, b) => a - b);
    const ps = pmfHundredths(k);
    const m100 = sum(xs.map((x, i) => x * ps[i]));
    const s100 = sum(xs.map((x, i) => x * x * ps[i]));
    return { xs, ps, mean: m100 / 100, ex2: s100 / 100, variance: (100 * s100 - m100 * m100) / 10000 };
  }
  const meanTerms = (xs, ps) => xs.map((x, i) => `${paren(x)}(${hund(ps[i])})`).join(" + ");
  const sqTerms = (xs, ps) => xs.map((x, i) => `${paren(x)}^2(${hund(ps[i])})`).join(" + ");

  // "aX + b"-style text with sensible signs: lin("X", 3, -2) -> "3X - 2".
  function lin(v, a, b) {
    const head = a === 1 ? v : a === -1 ? `-${v}` : `${a}${v}`;
    return b === 0 ? head : `${head} ${b < 0 ? "-" : "+"} ${Math.abs(b)}`;
  }

  const generators = [
    /* ========== 1. The definition of E(X) ========== */
    MATH340.makeGenerator({
      id: "c4-gen-ev",
      name: "Expected value from a PMF",
      blurb: "E(X) = Σ x P(X = x): tables, formulas, uniform values, indicators, games and solving backwards.",
      variants: [
        {
          name: "Weighted sum over a PMF table",
          make() {
            const { xs, ps, mean } = randomPmf();
            return {
              q: R`A random variable \(X\) has the PMF below. ${pmfTable(xs, ps.map(hund))} Find \(E(X)\).`,
              answer: mean, kind: "num",
              sol: R`<div class="sol-step">By definition \(E(X) = \sum_x x\,P(X = x)\): multiply each value by its probability and add.</div>
                   <div class="sol-step">$$E(X) = ${meanTerms(xs, ps)}$$</div>
                   <div class="sol-step">$$E(X) = ${f4(mean)}$$ The mean is a weighted average, and it need not be one of the values \(X\) can take.</div>`,
            };
          },
        },
        {
          name: "Equally likely values: the midpoint",
          make() {
            const useDie = Math.random() < 0.5;
            const a = useDie ? 1 : U.randInt(2, 40);
            const b = useDie ? U.pick([4, 6, 8, 10, 12, 20]) : a + U.randInt(4, 30);
            const n = b - a + 1;
            const ans = (a + b) / 2;
            const q = useDie
              ? R`A fair ${b}-sided die, numbered \(1\) to \(${b}\), is rolled once. Let \(X\) be the number showing. Find \(E(X)\).`
              : R`Raffle tickets numbered \(${a}\) through \(${b}\) are in a drum, and one is drawn at random. Let \(X\) be its number. Find \(E(X)\).`;
            return {
              q, answer: ans, kind: "num",
              sol: R`<div class="sol-step">Each of the \(${n}\) values has probability \(\frac{1}{${n}}\), so \(E(X)\) is the plain average of the values. Pair the smallest with the largest.</div>
                   <div class="sol-step">$$E(X) = \frac{1}{${n}}(${a} + ${a + 1} + \dots + ${b}) = \frac{${a} + ${b}}{2}$$</div>
                   <div class="sol-step">$$E(X) = ${U.fmt(ans)}$$ For a fair 6-sided die this is \(3.5\), which the die can never show.</div>`,
            };
          },
        },
        {
          name: "Indicator: E(I) = P(A)",
          make() {
            const ctx = U.pick([
              () => { const n = U.pick([6, 8, 10, 12, 20]); const k = U.randInt(2, n - 1);
                return { q: R`A fair ${n}-sided die is rolled. Let \(X = 1\) if it shows at least \(${k}\) and \(X = 0\) otherwise.`, num: n - k + 1, den: n,
                  why: R`\(P(\text{at least } ${k}) = \frac{${n - k + 1}}{${n}}\)` }; },
              () => { const [what, c] = U.pick([["a heart", 13], ["a face card (J, Q, K)", 12], ["an ace", 4], ["a red card", 26], ["a black face card", 6]]);
                return { q: R`One card is drawn from a well-shuffled standard 52-card deck. Let \(X = 1\) if it is ${what} and \(X = 0\) otherwise.`, num: c, den: 52,
                  why: R`\(P(\text{${what}}) = \frac{${c}}{52}\)` }; },
              () => { const n = U.randInt(2, 4);
                return { q: R`A fair coin is tossed ${n} times. Let \(X = 1\) if every toss lands heads and \(X = 0\) otherwise.`, num: 1, den: Math.pow(2, n),
                  why: R`\(P(\text{all heads}) = \left(\frac{1}{2}\right)^{${n}} = \frac{1}{${Math.pow(2, n)}}\)` }; },
            ])();
            const ans = ctx.num / ctx.den;
            return {
              q: R`${ctx.q} Find \(E(X)\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">\(X\) is an <b>indicator</b>, so \(X \sim \text{Bern}(p)\) with \(p = P(A)\), and \(E(X) = 1 \cdot p + 0 \cdot (1 - p) = p\).</div>
                   <div class="sol-step">${ctx.why}.</div>
                   <div class="sol-step">$$E(X) = ${U.fracTex(ctx.num, ctx.den)} \approx ${f4(ans)}$$ The expected value of an indicator is the probability of its event.</div>`,
            };
          },
        },
        {
          name: "Missing PMF value first",
          make() {
            const { xs, ps, mean } = randomPmf({ k: U.randInt(4, 5) });
            const miss = U.randInt(0, xs.length - 1);
            const shown = ps.map((p, i) => (i === miss ? "?" : hund(p)));
            const others = ps.filter((_, i) => i !== miss).map(hund).join(" + ");
            return {
              q: R`A random variable \(X\) has the PMF below, with one entry missing. ${pmfTable(xs, shown)} Find \(E(X)\).`,
              answer: mean, kind: "num",
              sol: R`<div class="sol-step">First complete the PMF: the probabilities must sum to 1.</div>
                   <div class="sol-step">$$P(X = ${xs[miss]}) = 1 - (${others}) = ${hund(ps[miss])}$$</div>
                   <div class="sol-step">$$E(X) = ${meanTerms(xs, ps)} = ${f4(mean)}$$</div>`,
            };
          },
        },
        {
          name: "PMF given by a formula",
          make() {
            const sq = Math.random() < 0.5;
            const g = x => (sq ? x * x : Math.abs(x));
            const xs = U.sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], U.randInt(4, 6)).sort((a, b) => a - b);
            const S = sum(xs.map(g));
            const num = sum(xs.map(x => x * g(x)));
            const ans = num / S;
            const gt = sq ? "x^2" : "|x|";
            return {
              q: R`\(X\) has PMF \(f_X(x) = c\,${gt}\) for \(x \in \{${xs.join(", ")}\}\), and \(0\) otherwise. Find \(E(X)\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Find \(c\) from \(\sum f_X(x) = 1\): \(c\,(${xs.map(x => g(x)).join(" + ")}) = 1\), so \(c = \frac{1}{${S}}\).</div>
                   <div class="sol-step">$$E(X) = \sum_x x \cdot \frac{${gt}}{${S}} = \frac{${xs.map(x => paren(x * g(x))).join(" + ")}}{${S}} = \frac{${num}}{${S}}$$</div>
                   <div class="sol-step">$$E(X) \approx ${f4(ans)}$$ Values \(x\) and \(-x\) that are both in the support cancel. If the support is symmetric about 0, so is the PMF, and \(E(X) = 0\).</div>`,
            };
          },
        },
        {
          name: "Expected winnings of a game",
          make() {
            if (Math.random() < 0.5) {
              const n = U.pick([6, 8, 10, 12]);
              const k = U.randInt(1, Math.floor(n / 3));
              const W = U.randInt(3, 12) * 5, L = U.randInt(1, 6) * 5;
              const ans = (W * k - L * (n - k)) / n;
              return {
                q: R`You pay nothing to play a game: roll a fair ${n}-sided die. If it shows ${k === 1 ? `its highest number, ${n},` : `one of its ${k} highest numbers`} you win $${W}; otherwise you lose $${L}. Let \(X\) be your net winnings in dollars. Find \(E(X)\).`,
                answer: ans, kind: "num",
                sol: R`<div class="sol-step">\(X\) takes two values: \(${W}\) with probability \(\frac{${k}}{${n}}\) and \(-${L}\) with probability \(\frac{${n - k}}{${n}}\).</div>
                     <div class="sol-step">$$E(X) = ${W}\cdot\frac{${k}}{${n}} + (-${L})\cdot\frac{${n - k}}{${n}} = \frac{${W * k - L * (n - k)}}{${n}}$$</div>
                     <div class="sol-step">$$E(X) \approx ${f4(ans)}$$ ${ans < 0 ? "Negative: on average you lose this much per play." : ans > 0 ? "Positive: the game favours you on average." : "Exactly zero: a fair game."}</div>`,
              };
            }
            const N = U.pick([100, 200, 250, 500, 1000]);
            const c = U.pick([1, 2, 5]);
            const P = U.pick([50, 100, 150, 200, 300]);
            const ans = P / N - c;
            return {
              q: R`A raffle sells ${N} tickets at $${c} each, and one ticket is drawn to win a $${P} prize. You buy one ticket. Let \(X\) be your net gain in dollars. Find \(E(X)\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Net gain: \(${P} - ${c} = ${P - c}\) if your ticket is drawn (probability \(\frac{1}{${N}}\)), and \(-${c}\) otherwise.</div>
                   <div class="sol-step">$$E(X) = ${P - c}\cdot\frac{1}{${N}} + (-${c})\cdot\frac{${N - 1}}{${N}} = \frac{${P}}{${N}} - ${c}$$</div>
                   <div class="sol-step">$$E(X) = ${f4(ans)}$$ Subtracting the ticket price once, from the expected prize, gives the same answer.</div>`,
            };
          },
        },
        {
          name: "Solve for a probability from E(X)",
          make() {
            const [p0, p1, p2] = pmfHundredths(3);
            const m = (p1 + 2 * p2) / 100;
            return {
              q: R`\(X\) takes only the values \(0\), \(1\) and \(2\). You know \(P(X = 0) = ${hund(p0)}\) and \(E(X) = ${U.fmt(m, 2)}\). Find \(P(X = 2)\).`,
              answer: p2 / 100, kind: "prob",
              sol: R`<div class="sol-step">Two unknowns, \(a = P(X = 1)\) and \(b = P(X = 2)\), so you need two equations: the PMF sums to 1, and the definition of \(E(X)\).</div>
                   <div class="sol-step">$$a + b = 1 - ${hund(p0)} = ${hund(p1 + p2)}, \qquad 0(${hund(p0)}) + 1\cdot a + 2b = ${U.fmt(m, 2)}$$</div>
                   <div class="sol-step">Subtract the first from the second: \(b = ${U.fmt(m, 2)} - ${hund(p1 + p2)} = ${hund(p2)}\). So \(P(X = 2) = ${hund(p2)}\) (and \(P(X = 1) = ${hund(p1)}\)).</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 2. Linearity of expectation ========== */
    MATH340.makeGenerator({
      id: "c4-gen-linear",
      name: "Linearity of expectation",
      blurb: "E(aX + b), polynomials in X, sums of dependent r.v.s, indicator counts, and a linear profit.",
      variants: [
        {
          name: "E(a + bX)",
          make() {
            const m = U.pick([-4, -3, -2, 2, 3, 4, 5, 6, 1.5, 2.5]);
            const a = U.randInt(-6, 9), b = U.pick([-7, -5, -3, -2, 2, 3, 4, 6]);
            const ans = a + b * m;
            const expr = a === 0 ? `${b}X` : `${a} ${b < 0 ? "-" : "+"} ${Math.abs(b)}X`;
            return {
              q: R`\(E(X) = ${m}\). Find \(E(${expr})\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Linearity: constants come out of \(E\), and the expectation of a constant is the constant. \(E(a + bX) = a + b\,E(X)\).</div>
                   <div class="sol-step">$$E(${expr}) = ${a === 0 ? "" : `${a} + `}(${b})(${m}) = ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Polynomial: E(X²) is its own input",
          make() {
            const m = U.randInt(-3, 6);
            const ex2 = m * m + U.randInt(1, 9);
            const a = U.pick([-2, 2, 3, 4, 5]), b = U.pick([-5, -4, -3, 2, 3, 4, 6]), c = U.randInt(-8, 8);
            const ans = a * ex2 + b * m + c;
            const expr = `${a}X^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}X${c === 0 ? "" : ` ${c < 0 ? "-" : "+"} ${Math.abs(c)}`}`;
            return {
              q: R`\(E(X) = ${m}\) and \(E(X^2) = ${ex2}\). Find \(E(${expr})\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Linearity term by term, treating \(X^2\) as a random variable of its own: \(E(${expr}) = ${a}E(X^2) ${signed(b)}E(X)${c === 0 ? "" : ` ${signed(c)}`}\).</div>
                   <div class="sol-step">$$= ${a}(${ex2}) + (${b})(${m})${c === 0 ? "" : ` + (${c})`} = ${ans}$$</div>
                   <div class="sol-step">Note that \(E(X^2) = ${ex2}\), not \([E(X)]^2 = ${m * m}\). Squaring is not linear, so it had to be given separately.</div>`,
            };
          },
        },
        {
          name: "Sum of dependent r.v.s",
          make() {
            const ctx = U.pick([
              { X: "the number of heads", Y: "the number of tails", note: R`\(X + Y\) is fixed, so they are as dependent as two variables can be` },
              { X: "a student's score on the midterm", Y: "the same student's score on the final", note: R`students who do well on one tend to do well on the other` },
              { X: "the day's high temperature", Y: "the day's low temperature", note: R`a hot day tends to have a warm night` },
            ]);
            const m1 = U.randInt(2, 80), m2 = U.randInt(2, 80);
            const a = U.pick([1, 2, 3, -1]), b = U.pick([1, 2, -1, -2, -3]), c = U.randInt(-10, 10);
            const ans = a * m1 + b * m2 + c;
            const expr = `${lin("X", a, 0)} ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}Y${c === 0 ? "" : ` ${c < 0 ? "-" : "+"} ${Math.abs(c)}`}`;
            return {
              q: R`Let \(X\) be ${ctx.X} and \(Y\) be ${ctx.Y}, with \(E(X) = ${m1}\) and \(E(Y) = ${m2}\). \(X\) and \(Y\) are <b>not</b> independent. Find \(E(${expr})\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Linearity of expectation does <b>not</b> need independence. The dependence (${ctx.note}) is irrelevant here.</div>
                   <div class="sol-step">$$E(${expr}) = ${a}E(X) + (${b})E(Y)${c === 0 ? "" : ` + (${c})`} = ${a}(${m1}) + (${b})(${m2})${c === 0 ? "" : ` + (${c})`} = ${ans}$$</div>
                   <div class="sol-step">Independence <em>would</em> matter for \(\text{Var}(X + Y)\) or \(E(XY)\), but not for the mean of a sum.</div>`,
            };
          },
        },
        {
          name: "Expected count: add the indicator probabilities",
          make() {
            const k = U.randInt(3, 5);
            const ps = Array.from({ length: k }, () => U.randInt(3, 19) * 5);
            const ans = sum(ps) / 100;
            const ctx = U.pick([
              { intro: R`A student takes ${k} exams this term. The chances of passing them are`, unit: "exam", what: "the number of exams passed" },
              { intro: R`A salesperson makes ${k} pitches today. The chances that they result in a sale are`, unit: "pitch", what: "the number of sales" },
              { intro: R`${k} job applications are out. The chances of getting an offer from each are`, unit: "application", what: "the number of offers" },
            ]);
            return {
              q: R`${ctx.intro} ${ps.map(hund).join(", ")}, respectively. Let \(X\) be ${ctx.what}. Find \(E(X)\). (Nothing is said about independence.)`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Write \(X\) as a sum of indicators: \(X = I_1 + \dots + I_${k}\), where \(I_j = 1\) if ${ctx.unit} \(j\) succeeds. Each \(E(I_j) = P(\text{success } j)\).</div>
                   <div class="sol-step">Linearity, which needs no independence: $$E(X) = ${ps.map(hund).join(" + ")} = ${U.fmt(ans, 2)}$$</div>
                   <div class="sol-step">\(X\) is not Binomial (the probabilities differ), and you never needed its PMF.</div>`,
            };
          },
        },
        {
          name: "Expected count with dependent indicators",
          make() {
            const which = U.randInt(0, 2);
            if (which === 0) {
              const n = U.randInt(5, 30);
              return {
                q: R`${n} guests check their coats, and the attendant hands the coats back in a completely random order. Let \(X\) be the number of guests who get their own coat. Find \(E(X)\).`,
                answer: 1, kind: "num",
                sol: R`<div class="sol-step">Let \(I_j\) indicate that guest \(j\) gets their own coat. By symmetry each guest is equally likely to get any of the ${n} coats, so \(E(I_j) = \frac{1}{${n}}\).</div>
                     <div class="sol-step">The \(I_j\) are dependent (if 29 people match, so does the 30th), but linearity does not care: $$E(X) = ${n} \cdot \frac{1}{${n}} = 1.$$</div>
                     <div class="sol-step">The answer does not depend on how many guests there are.</div>`,
              };
            }
            if (which === 1) {
              const w = U.randInt(4, 12), b = U.randInt(4, 15), n = U.randInt(3, Math.min(8, w + b - 1));
              const ans = n * w / (w + b);
              return {
                q: R`An urn holds ${w} red and ${b} blue balls. You draw ${n} without replacement. Let \(X\) be the number of red balls drawn. Find \(E(X)\).`,
                answer: ans, kind: "num",
                sol: R`<div class="sol-step">Let \(I_j\) indicate that draw \(j\) is red. By symmetry each individual draw is red with probability \(\frac{${w}}{${w + b}}\), even without replacement.</div>
                     <div class="sol-step">$$E(X) = ${n}\cdot\frac{${w}}{${w + b}} \approx ${f4(ans)}$$</div>
                     <div class="sol-step">This is the Hypergeometric mean \(n\frac{K}{N}\): the same as a Binomial with \(p = \frac{K}{N}\). Drawing without replacement changes the variance, not the mean.</div>`,
              };
            }
            const k = U.randInt(4, 13);
            const [what, c] = U.pick([["hearts", 13], ["aces", 4], ["face cards", 12], ["red cards", 26]]);
            const ans = k * c / 52;
            return {
              q: R`You are dealt ${k} cards from a well-shuffled 52-card deck. Let \(X\) be the number of ${what} in your hand. Find \(E(X)\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">One indicator per card in your hand: card \(j\) is one of the ${what} with probability \(\frac{${c}}{52}\), whatever position it was dealt in.</div>
                   <div class="sol-step">$$E(X) = ${k}\cdot\frac{${c}}{52} \approx ${f4(ans)}$$</div>
                   <div class="sol-step">The cards are dependent, but linearity adds the expectations regardless.</div>`,
            };
          },
        },
        {
          name: "Profit: a linear function of X",
          make() {
            const N = U.randInt(3, 4);
            const cost = U.pick([300, 400, 500, 600]);
            const price = cost * 2 + U.pick([-100, 0, 100]);
            const refund = U.pick([100, 150, 200]);
            const xs = Array.from({ length: N + 1 }, (_, i) => i);
            const ps = pmfHundredths(N + 1);
            const m = sum(xs.map((x, i) => x * ps[i])) / 100;
            const slope = price - refund, icpt = refund * N - cost * N;
            const ans = slope * m + icpt;
            return {
              q: R`A store buys ${N} units of a product at $${cost} each and sells them at $${price} each. Any unit unsold at the end of the season is returned to the manufacturer for $${refund}. The number sold, \(X\), has the PMF below. ${pmfTable(xs, ps.map(hund))} Find the expected profit in dollars.`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Write the profit as a function of \(X\): revenue \(${price}X\), refunds \(${refund}(${N} - X)\), cost \(${cost} \cdot ${N}\). $$h(X) = ${price}X + ${refund}(${N} - X) - ${cost * N} = ${slope}X ${signed(icpt)}$$</div>
                   <div class="sol-step">\(h\) is linear, so \(E[h(X)] = ${slope}E(X) ${signed(icpt)}\). And \(E(X) = ${meanTerms(xs, ps)} = ${U.fmt(m, 2)}\).</div>
                   <div class="sol-step">$$E[h(X)] = ${slope}(${U.fmt(m, 2)}) ${signed(icpt)} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Work backwards to E(X)",
          make() {
            const m = U.randInt(-5, 9);
            const a = U.randInt(-8, 8), b = U.pick([-4, -3, -2, 2, 3, 5, 7]);
            const v = a + b * m;
            const expr = a === 0 ? `${b}X` : `${a} ${b < 0 ? "-" : "+"} ${Math.abs(b)}X`;
            return {
              q: R`A random variable satisfies \(E(${expr}) = ${v}\). Find \(E(X)\).`,
              answer: m, kind: "num",
              sol: R`<div class="sol-step">Linearity turns the given equation into one about the number \(E(X)\): \(${a === 0 ? "" : `${a} + `}(${b})\,E(X) = ${v}\).</div>
                   <div class="sol-step">$$E(X) = \frac{${v} - (${a})}{${b}} = ${m}$$</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 3. LOTUS ========== */
    MATH340.makeGenerator({
      id: "c4-gen-lotus",
      name: "LOTUS: E[g(X)]",
      blurb: "Apply g to the values and keep the probabilities: squares, distances, caps, and the newsvendor.",
      variants: [
        {
          name: "E(X²) from a PMF",
          make() {
            const { xs, ps, mean, ex2 } = randomPmf();
            return {
              q: R`\(X\) has the PMF below. ${pmfTable(xs, ps.map(hund))} Find \(E(X^2)\).`,
              answer: ex2, kind: "num",
              sol: R`<div class="sol-step">LOTUS: \(E(g(X)) = \sum_x g(x)P(X = x)\). Square each <b>value</b> and keep the probabilities of \(X\). No need to find the PMF of \(X^2\).</div>
                   <div class="sol-step">$$E(X^2) = ${sqTerms(xs, ps)} = ${f4(ex2)}$$</div>
                   <div class="sol-step">Compare \([E(X)]^2 = ${f4(mean)}^2 = ${f4(mean * mean)}\). They differ, by exactly \(\text{Var}(X)\).</div>`,
            };
          },
        },
        {
          name: "E|X − c|: distance from a point",
          make() {
            const { xs, ps } = randomPmf({ k: U.randInt(4, 5), pool: [0, 1, 2, 3, 4, 5, 6, 7, 8] });
            const c = U.randInt(xs[0] + 1, xs[xs.length - 1] - 1);
            const ds = xs.map(x => Math.abs(x - c));
            const ans = sum(ds.map((d, i) => d * ps[i])) / 100;
            return {
              q: R`\(X\) has the PMF below. ${pmfTable(xs, ps.map(hund))} Find \(E|X - ${c}|\), the expected distance of \(X\) from \(${c}\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">LOTUS with \(g(x) = |x - ${c}|\): replace each value by its distance from \(${c}\) and keep the probabilities.</div>
                   <div class="sol-step">Distances: \(${xs.map((x, i) => `|${x} - ${c}| = ${ds[i]}`).join(",\\ ")}\).</div>
                   <div class="sol-step">$$E|X - ${c}| = ${ds.map((d, i) => `${d}(${hund(ps[i])})`).join(" + ")} = ${f4(ans)}$$ This is <b>not</b> \(|E(X) - ${c}|\): positive and negative deviations would cancel there.</div>`,
            };
          },
        },
        {
          name: "Nonlinear g: powers and reciprocals",
          make() {
            const xs = [0, 1, 2, 3];
            const ps = pmfHundredths(4);
            const [gt, g, gts] = U.pick([
              [R`2^X`, x => Math.pow(2, x), x => `2^${x}`],
              [R`\frac{1}{X + 1}`, x => 1 / (x + 1), x => `\\tfrac{1}{${x + 1}}`],
              [R`X(X - 1)`, x => x * (x - 1), x => `${x}(${x - 1})`],
            ]);
            const ans = sum(xs.map((x, i) => g(x) * ps[i] / 100));
            return {
              q: R`\(X\) has the PMF below. ${pmfTable(xs, ps.map(hund))} Find \(E\!\left(${gt}\right)\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">\(g\) is not linear, so \(E(g(X)) \ne g(E(X))\). Use LOTUS: \(\sum_x g(x)\,P(X = x)\).</div>
                   <div class="sol-step">$$E\!\left(${gt}\right) = ${xs.map((x, i) => `${gts(x)}(${hund(ps[i])})`).join(" + ")}$$</div>
                   <div class="sol-step">$$= ${f4(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Capped demand: E[min(X, s)]",
          make() {
            const m = U.randInt(4, 5);
            const xs = Array.from({ length: m + 1 }, (_, i) => i);
            const ps = pmfHundredths(m + 1);
            const s = U.randInt(1, m - 1);
            const g = xs.map(x => Math.min(x, s));
            const ans = sum(g.map((v, i) => v * ps[i])) / 100;
            const item = U.pick(["cakes", "newspapers", "concert tickets", "loaves of bread"]);
            return {
              q: R`A shop stocks ${s} ${item} each day. The daily demand \(X\) has the PMF below. ${pmfTable(xs, ps.map(hund))} Customers beyond the first ${s} go away empty-handed, so the number sold is \(\min(X, ${s})\). Find the expected number sold.`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">LOTUS with \(g(x) = \min(x, ${s})\): every demand of \(${s}\) or more sells exactly \(${s}\).</div>
                   <div class="sol-step">Sales for each demand: \(${g.join(", ")}\).</div>
                   <div class="sol-step">$$E[\min(X, ${s})] = ${g.map((v, i) => `${v}(${hund(ps[i])})`).join(" + ")} = ${f4(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Newsvendor profit",
          make() {
            const m = U.randInt(3, 5);
            const xs = Array.from({ length: m + 1 }, (_, i) => i);
            const ps = pmfHundredths(m + 1);
            const s = U.randInt(1, m - 1);
            const price = U.pick([5, 8, 10, 12]), cost = U.randInt(2, price - 2);
            const h = xs.map(x => price * Math.min(x, s) - cost * s);
            const ans = sum(h.map((v, i) => v * ps[i])) / 100;
            return {
              q: R`A vendor buys ${s} items each morning at $${cost} each and sells them at $${price} each. Unsold items are worthless at the end of the day. The daily demand \(X\) has the PMF below. ${pmfTable(xs, ps.map(hund))} Find the vendor's expected daily profit in dollars.`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Profit is \(h(X) = ${price}\min(X, ${s}) - ${cost * s}\). The \(\min\) makes it nonlinear in \(X\), so you cannot just plug in \(E(X)\). Use LOTUS.</div>
                   <div class="sol-step">Profit for each demand \(${xs.join(", ")}\): \(${h.join(", ")}\).</div>
                   <div class="sol-step">$$E[h(X)] = ${h.map((v, i) => `${paren(v)}(${hund(ps[i])})`).join(" + ")} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Two PMFs, one combination",
          make() {
            const X = randomPmf({ k: U.randInt(3, 5), pool: [-2, -1, 0, 1, 2, 3] });
            const ys = [0, 1, 2, 3];
            const yps = pmfHundredths(4);
            const ey = sum(ys.map((y, i) => y * yps[i])) / 100;
            const a = U.pick([2, 3, 4]), b = U.pick([1, 2, 3]), c = U.randInt(-3, 5);
            const ans = a * X.ex2 - b * ey + c;
            const expr = `${a}X^2 - ${b === 1 ? "" : b}Y${c === 0 ? "" : ` ${c < 0 ? "-" : "+"} ${Math.abs(c)}`}`;
            return {
              q: R`\(X\) and \(Y\) have the PMFs below. ${pmfTable(X.xs, X.ps.map(hund))} ${pmfTable(ys, yps.map(hund), "y", R`P(Y = y)`)} Find \(E(${expr})\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Linearity splits it into pieces you can get from one PMF each: \(E(${expr}) = ${a}E(X^2) - ${b}E(Y)${c === 0 ? "" : ` ${signed(c)}`}\). The joint distribution is never needed.</div>
                   <div class="sol-step">LOTUS: \(E(X^2) = ${sqTerms(X.xs, X.ps)} = ${f4(X.ex2)}\). Definition: \(E(Y) = ${meanTerms(ys, yps)} = ${U.fmt(ey, 2)}\).</div>
                   <div class="sol-step">$$${a}(${f4(X.ex2)}) - ${b}(${U.fmt(ey, 2)})${c === 0 ? "" : ` ${signed(c)}`} = ${f4(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Expand the square first",
          make() {
            const m = U.randInt(-3, 6);
            const ex2 = m * m + U.randInt(1, 10);
            const a = U.pick([1, 2, 3]), b = U.pick([-4, -3, -2, -1, 1, 2, 5]);
            const ans = a * a * ex2 + 2 * a * b * m + b * b;
            const inner = lin("X", a, b);
            return {
              q: R`\(E(X) = ${m}\) and \(E(X^2) = ${ex2}\). Find \(E\big[(${inner})^2\big]\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">\(E[(${inner})^2] \ne (${a === 1 ? "" : a}E(X) ${b < 0 ? "-" : "+"} ${Math.abs(b)})^2\). Expand the square, then use linearity.</div>
                   <div class="sol-step">$$(${inner})^2 = ${a * a === 1 ? "" : a * a}X^2 ${signed(2 * a * b)}X + ${b * b}$$</div>
                   <div class="sol-step">$$E\big[(${inner})^2\big] = ${a * a}(${ex2}) + (${2 * a * b})(${m}) + ${b * b} = ${ans}$$</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 4. Variance and standard deviation ========== */
    MATH340.makeGenerator({
      id: "c4-gen-var",
      name: "Variance & standard deviation",
      blurb: "Var(X) = E(X²) − [E(X)]²: from tables, from moments, backwards, and for indicators and uniforms.",
      variants: [
        {
          name: "Variance from a PMF table",
          make() {
            const { xs, ps, mean, ex2, variance } = randomPmf();
            return {
              q: R`\(X\) has the PMF below. ${pmfTable(xs, ps.map(hund))} Find \(\text{Var}(X)\).`,
              answer: variance, kind: "num",
              sol: R`<div class="sol-step">Use the shortcut \(\text{Var}(X) = E(X^2) - [E(X)]^2\): two sums over the table, then subtract.</div>
                   <div class="sol-step">\(E(X) = ${meanTerms(xs, ps)} = ${f4(mean)}\)<br>\(E(X^2) = ${sqTerms(xs, ps)} = ${f4(ex2)}\)</div>
                   <div class="sol-step">$$\text{Var}(X) = ${f4(ex2)} - (${f4(mean)})^2 = ${f4(variance)}$$</div>`,
            };
          },
        },
        {
          name: "Standard deviation from a PMF",
          make() {
            const { xs, ps, mean, ex2, variance } = randomPmf({ k: 4 });
            const ans = Math.sqrt(variance);
            return {
              q: R`\(X\) has the PMF below. ${pmfTable(xs, ps.map(hund))} Find \(\text{SD}(X)\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">The SD is the square root of the variance, so find \(\text{Var}(X) = E(X^2) - [E(X)]^2\) first.</div>
                   <div class="sol-step">\(E(X) = ${f4(mean)}\), \(E(X^2) = ${f4(ex2)}\), so \(\text{Var}(X) = ${f4(ex2)} - ${f4(mean * mean)} = ${f4(variance)}\).</div>
                   <div class="sol-step">$$\text{SD}(X) = \sqrt{${f4(variance)}} \approx ${f4(ans)}$$</div>`,
            };
          },
        },
        {
          name: "From E(X) and E(X²)",
          make() {
            const m = U.pick([-3, -2, -1, 1, 2, 3, 4, 5, 0.5, 1.5, 2.5]);
            const v = U.randInt(1, 12) + U.pick([0, 0, 0.25, 0.5, 0.75]);
            const ex2 = m * m + v;
            return {
              q: R`\(E(X) = ${m}\) and \(E(X^2) = ${U.fmt(ex2)}\). Find \(\text{Var}(X)\).`,
              answer: v, kind: "num",
              sol: R`<div class="sol-step">"Mean of the square minus the square of the mean."</div>
                   <div class="sol-step">$$\text{Var}(X) = E(X^2) - [E(X)]^2 = ${U.fmt(ex2)} - (${m})^2 = ${U.fmt(v)}$$</div>
                   <div class="sol-step">A common slip is \(E(X^2) - E(X) = ${U.fmt(ex2 - m)}\). Square the mean before subtracting.</div>`,
            };
          },
        },
        {
          name: "Backwards: E(X²) from the mean and spread",
          make() {
            const m = U.randInt(-4, 8);
            const giveSd = Math.random() < 0.5;
            const s = U.randInt(1, 6);
            const v = giveSd ? s * s : U.randInt(1, 20);
            const ans = v + m * m;
            return {
              q: R`\(E(X) = ${m}\) and ${giveSd ? R`\(\text{SD}(X) = ${s}\)` : R`\(\text{Var}(X) = ${v}\)`}. Find \(E(X^2)\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Rearrange the shortcut: \(E(X^2) = \text{Var}(X) + [E(X)]^2\).</div>
                   ${giveSd ? R`<div class="sol-step">You were given the SD, so square it first: \(\text{Var}(X) = ${s}^2 = ${v}\).</div>` : ""}
                   <div class="sol-step">$$E(X^2) = ${v} + (${m})^2 = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Indicator variance: p(1 − p)",
          make() {
            const ctx = U.pick([
              () => { const p = U.randInt(5, 95) / 100; return { p, q: R`A free throw is made with probability ${p}. Let \(X = 1\) if it is made and \(0\) if not.`, pt: String(p) }; },
              () => { const n = U.pick([4, 6, 8, 10, 12]); const k = U.randInt(1, n - 1); return { p: k / n, q: R`A fair ${n}-sided die is rolled. Let \(X = 1\) if it shows at most ${k} and \(0\) otherwise.`, pt: U.fracTex(k, n) }; },
            ])();
            const ans = ctx.p * (1 - ctx.p);
            return {
              q: R`${ctx.q} Find \(\text{Var}(X)\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">\(X \sim \text{Bern}(p)\) with \(p = ${ctx.pt}\). Since \(X^2 = X\) for a 0/1 variable, \(E(X^2) = E(X) = p\).</div>
                   <div class="sol-step">$$\text{Var}(X) = p - p^2 = p(1 - p)$$</div>
                   <div class="sol-step">$$\text{Var}(X) = ${ctx.pt}\left(1 - ${ctx.pt}\right) \approx ${f4(ans)}$$ It is largest, \(0.25\), at \(p = 0.5\).</div>`,
            };
          },
        },
        {
          name: "Symmetric PMF: the mean is free",
          make() {
            const k = U.randInt(2, 3);
            const sq = Math.random() < 0.5;
            const g = x => (sq ? x * x : Math.abs(x));
            const xs = [];
            for (let x = -k; x <= k; x++) xs.push(x);
            const S = sum(xs.map(g));
            const num = sum(xs.map(x => x * x * g(x)));
            const ans = num / S;
            const gt = sq ? "x^2" : "|x|";
            return {
              q: R`\(X\) has PMF \(f_X(x) = \dfrac{${gt}}{${S}}\) for \(x = ${xs.join(", ")}\), and \(0\) otherwise. Find \(\text{Var}(X)\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">The PMF is symmetric about 0 (\(f_X(x) = f_X(-x)\)), so \(E(X) = 0\) with no arithmetic. Then \(\text{Var}(X) = E(X^2)\).</div>
                   <div class="sol-step">LOTUS: $$E(X^2) = \sum_x x^2\cdot\frac{${gt}}{${S}} = \frac{${xs.map(x => x * x * g(x)).join(" + ")}}{${S}} = \frac{${num}}{${S}}$$</div>
                   <div class="sol-step">$$\text{Var}(X) = ${U.fracTex(num, S)} \approx ${f4(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Discrete uniform: the shift drops out",
          make() {
            const n = U.randInt(4, 12);
            const a = U.pick([1, 1, U.randInt(2, 50)]);
            const b = a + n - 1;
            const ans = (n * n - 1) / 12;
            return {
              q: a === 1
                ? R`A fair ${n}-sided die, numbered \(1\) to \(${n}\), is rolled. Find the variance of the number showing.`
                : R`A seat is chosen at random from seats numbered \(${a}\) through \(${b}\). Let \(X\) be its number. Find \(\text{Var}(X)\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">${a === 1 ? R`\(X\) is uniform on \(1, \dots, ${n}\).` : R`Write \(X = ${a - 1} + Y\) with \(Y\) uniform on \(1, \dots, ${n}\). Shifting does not change variance, so \(\text{Var}(X) = \text{Var}(Y)\).`}</div>
                   <div class="sol-step">For \(Y\) uniform on \(1, \dots, ${n}\): \(E(Y) = \frac{${n + 1}}{2}\) and \(E(Y^2) = \frac{1}{${n}}\sum_{k=1}^{${n}} k^2 = \frac{(${n + 1})(${2 * n + 1})}{6}\).</div>
                   <div class="sol-step">$$\text{Var} = \frac{(${n + 1})(${2 * n + 1})}{6} - \left(\frac{${n + 1}}{2}\right)^2 = \frac{${n}^2 - 1}{12} = ${U.fracTex(n * n - 1, 12)} \approx ${f4(ans)}$$</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 5. Properties of variance ========== */
    MATH340.makeGenerator({
      id: "c4-gen-varprops",
      name: "Properties of variance",
      blurb: "Shifts vanish, scales square, independent variances add — even for differences.",
      variants: [
        {
          name: "Var(aX + b)",
          make() {
            const v = U.randInt(2, 12);
            const a = U.pick([-5, -3, -2, 2, 3, 4, 5]), b = U.randInt(-9, 9);
            const ans = a * a * v;
            return {
              q: R`\(\text{Var}(X) = ${v}\). Find \(\text{Var}(${lin("X", a, b)})\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">${b === 0 ? "No shift here." : R`The shift \(${b}\) drops out: \(\text{Var}(X + c) = \text{Var}(X)\).`} The scale comes out <b>squared</b>.</div>
                   <div class="sol-step">$$\text{Var}(${lin("X", a, b)}) = (${a})^2 \cdot ${v} = ${ans}$$${a < 0 ? R` The minus sign disappears when it is squared.` : ""}</div>`,
            };
          },
        },
        {
          name: "Var(aX + bY + c), independent",
          make() {
            const vx = U.randInt(1, 9), vy = U.randInt(1, 9);
            const a = U.pick([1, 2, 3, 4]), b = U.pick([1, 2, 3, 5]), c = U.randInt(-6, 9);
            const ans = a * a * vx + b * b * vy;
            const expr = `${a === 1 ? "" : a}X + ${b === 1 ? "" : b}Y${c === 0 ? "" : ` ${c < 0 ? "-" : "+"} ${Math.abs(c)}`}`;
            return {
              q: R`\(X\) and \(Y\) are independent with \(\text{Var}(X) = ${vx}\) and \(\text{Var}(Y) = ${vy}\). Find \(\text{Var}(${expr})\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Independence lets the variances add. Each coefficient comes out squared${c === 0 ? "" : ", and the constant drops out"}.</div>
                   <div class="sol-step">$$\text{Var}(${expr}) = ${a}^2(${vx}) + ${b}^2(${vy}) = ${a * a * vx} + ${b * b * vy} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Differences add too",
          make() {
            const vx = U.randInt(2, 12), vy = U.randInt(2, 12);
            const a = U.pick([1, 1, 2, 3]), b = U.pick([1, 1, 2, 4]);
            const ans = a * a * vx + b * b * vy;
            const expr = `${a === 1 ? "" : a}X - ${b === 1 ? "" : b}Y`;
            return {
              q: R`\(X\) and \(Y\) are independent with \(\text{Var}(X) = ${vx}\) and \(\text{Var}(Y) = ${vy}\). Find \(\text{Var}(${expr})\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Write \(${expr} = ${a === 1 ? "" : a}X + (-${b === 1 ? "" : b})Y\). The coefficient \(-${b}\) is squared, so the variances still <b>add</b>.</div>
                   <div class="sol-step">$$\text{Var}(${expr}) = ${a * a}(${vx}) + ${b * b}(${vy}) = ${ans}$$</div>
                   <div class="sol-step">Subtracting gives \(${a * a * vx - b * b * vy}\), which is wrong and could even be negative. A difference of two independent random quantities is <em>more</em> uncertain than either one.</div>`,
            };
          },
        },
        {
          name: "SD(aX + b)",
          make() {
            const s = U.randInt(2, 9);
            const a = U.pick([-4, -3, -2, 2, 3, 5]), b = U.randInt(-10, 10);
            const giveVar = Math.random() < 0.5;
            const ans = Math.abs(a) * s;
            return {
              q: R`${giveVar ? R`\(\text{Var}(X) = ${s * s}\)` : R`\(\text{SD}(X) = ${s}\)`}. Find \(\text{SD}(${lin("X", a, b)})\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">\(\text{Var}(aX + b) = a^2\text{Var}(X)\), so taking square roots gives \(\text{SD}(aX + b) = |a|\,\text{SD}(X)\).</div>
                   ${giveVar ? R`<div class="sol-step">\(\text{SD}(X) = \sqrt{${s * s}} = ${s}\).</div>` : ""}
                   <div class="sol-step">$$\text{SD}(${lin("X", a, b)}) = |${a}| \cdot ${s} = ${ans}$$ An SD is never negative.</div>`,
            };
          },
        },
        {
          name: "n copies vs. n times one copy",
          make() {
            const n = U.randInt(2, 10), v = U.randInt(2, 9);
            const sumAsk = Math.random() < 0.5;
            const ans = sumAsk ? n * v : n * n * v;
            return {
              q: sumAsk
                ? R`\(X_1, \dots, X_{${n}}\) are i.i.d., each with variance \(${v}\). Find \(\text{Var}(X_1 + X_2 + \dots + X_{${n}})\).`
                : R`\(X\) has variance \(${v}\). Find \(\text{Var}(${n}X)\).`,
              answer: ans, kind: "num",
              sol: sumAsk
                ? R`<div class="sol-step">The \(X_i\) are independent, so their variances add: there are ${n} terms of \(${v}\).</div>
                   <div class="sol-step">$$\text{Var}(X_1 + \dots + X_{${n}}) = ${n} \cdot ${v} = ${ans}$$</div>
                   <div class="sol-step">It is <b>not</b> \(\text{Var}(${n}X_1) = ${n}^2 \cdot ${v} = ${n * n * v}\). Independent copies partly cancel each other out.</div>`
                : R`<div class="sol-step">One random variable multiplied by a constant: the constant comes out squared.</div>
                   <div class="sol-step">$$\text{Var}(${n}X) = ${n}^2 \cdot ${v} = ${ans}$$</div>
                   <div class="sol-step">Contrast \(${n}\) independent copies \(X_1 + \dots + X_{${n}}\), with variance only \(${n} \cdot ${v} = ${n * v}\). \(${n}X\) moves all at once.</div>`,
            };
          },
        },
        {
          name: "Work in variances, not SDs",
          make() {
            const [s1, s2] = U.pick([[3, 4], [5, 12], [6, 8], [8, 15], [2, 3], [1, 2], [4, 5]]);
            const a = U.pick([1, 1, 2]), b = U.pick([1, 1, 2, 3]);
            const minus = Math.random() < 0.5;
            const v = a * a * s1 * s1 + b * b * s2 * s2;
            const ans = Math.sqrt(v);
            const expr = `${a === 1 ? "" : a}X ${minus ? "-" : "+"} ${b === 1 ? "" : b}Y`;
            return {
              q: R`\(X\) and \(Y\) are independent with \(\text{SD}(X) = ${s1}\) and \(\text{SD}(Y) = ${s2}\). Find \(\text{SD}(${expr})\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Standard deviations do not add; variances do. Convert to variances: \(\text{Var}(X) = ${s1 * s1}\), \(\text{Var}(Y) = ${s2 * s2}\).</div>
                   <div class="sol-step">$$\text{Var}(${expr}) = ${a * a}(${s1 * s1}) + ${b * b}(${s2 * s2}) = ${v}$$${minus ? R` The minus sign squares away.` : ""}</div>
                   <div class="sol-step">$$\text{SD}(${expr}) = \sqrt{${v}} \approx ${f4(ans)}$$ Not \(${a * s1} ${minus ? "-" : "+"} ${b * s2} = ${minus ? a * s1 - b * s2 : a * s1 + b * s2}\).</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 6. Means and variances of the named distributions ========== */
    MATH340.makeGenerator({
      id: "c4-gen-named",
      name: "Means & variances of named distributions",
      blurb: "The summary table in use: recognise the distribution, then read off E and Var (trials vs. failures).",
      variants: [
        {
          name: "Binomial: np and np(1 − p)",
          make() {
            const n = U.randInt(8, 60), p = U.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.8]);
            const ask = U.pick(["E", "Var", "SD"]);
            const ans = ask === "E" ? n * p : ask === "Var" ? n * p * (1 - p) : Math.sqrt(n * p * (1 - p));
            const ctx = U.pick([
              R`A multiple-choice exam has ${n} questions; a student answers each correctly with probability ${p}, independently. Let \(X\) be the number answered correctly.`,
              R`${n} seeds are planted; each germinates with probability ${p}, independently. Let \(X\) be the number that germinate.`,
              R`A machine makes ${n} parts; each is defective with probability ${p}, independently. Let \(X\) be the number of defective parts.`,
            ]);
            const what = { E: R`E(X)`, Var: R`\text{Var}(X)`, SD: R`\text{SD}(X)` }[ask];
            return {
              q: R`${ctx} Find \(${what}\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">A fixed number of independent trials with the same success chance: \(X \sim \text{Bin}(${n}, ${p})\).</div>
                   <div class="sol-step">\(E(X) = np = ${U.fmt(n * p)}\), \(\text{Var}(X) = np(1 - p) = ${n}(${p})(${U.fmt(1 - p, 2)}) = ${f4(n * p * (1 - p))}\).</div>
                   <div class="sol-step">$$${what} ${ask === "SD" ? R`= \sqrt{${f4(n * p * (1 - p))}} \approx` : "="} ${f4(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Hypergeometric: mean and correction factor",
          make() {
            const N = U.randInt(20, 60), K = U.randInt(4, Math.floor(N / 2)), n = U.randInt(4, 12);
            const askVar = Math.random() < 0.5;
            const mu = n * K / N;
            const v = mu * (1 - K / N) * (N - n) / (N - 1);
            const ans = askVar ? v : mu;
            return {
              q: R`A box of ${N} batteries contains ${K} dead ones. You pick ${n} at random without replacement. Let \(X\) be the number of dead batteries you get. Find \(${askVar ? R`\text{Var}(X)` : R`E(X)`}\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Sampling without replacement from two types: \(X\) is Hypergeometric with \(N = ${N}\), \(K = ${K}\), \(n = ${n}\).</div>
                   <div class="sol-step">\(E(X) = n\frac{K}{N} = ${n}\cdot\frac{${K}}{${N}} \approx ${f4(mu)}\), the same as a Binomial with \(p = \frac{K}{N}\).</div>
                   <div class="sol-step">${askVar
                     ? R`$$\text{Var}(X) = n\frac{K}{N}\left(1 - \frac{K}{N}\right)\frac{N - n}{N - 1} = ${f4(mu)}\left(1 - \frac{${K}}{${N}}\right)\frac{${N - n}}{${N - 1}} \approx ${f4(v)}$$ The factor \(\frac{N - n}{N - 1}\) is the finite-population correction. It makes the variance smaller than the Binomial's.`
                     : R`$$E(X) \approx ${f4(mu)}$$`}</div>`,
            };
          },
        },
        {
          name: "Geometric: trials or failures?",
          make() {
            const p = U.pick([0.1, 0.2, 0.25, 0.4, 0.5]);
            const trials = Math.random() < 0.5;
            const askVar = Math.random() < 0.3;
            const q1 = 1 - p;
            const ans = askVar ? q1 / (p * p) : trials ? 1 / p : q1 / p;
            const ctx = U.pick([
              { setup: R`Each call a telemarketer makes results in a sale with probability ${p}, independently.`, t: "calls", f: "calls without a sale", s: "the first sale" },
              { setup: R`A basketball player makes each free throw with probability ${p}, independently.`, t: "shots", f: "misses", s: "the first made shot" },
              { setup: R`Each lottery scratch card wins with probability ${p}, independently.`, t: "cards", f: "losing cards", s: "the first winning card" },
            ]);
            const what = askVar
              ? R`the variance of the number of ${trials ? ctx.t + " up to and including " : ctx.f + " before "}${ctx.s}`
              : trials ? R`the expected number of ${ctx.t} up to and including ${ctx.s}` : R`the expected number of ${ctx.f} before ${ctx.s}`;
            return {
              q: R`${ctx.setup} Find ${what}.`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Decide what is being counted. Failures before the first success is \(\text{Geom}(p)\), with mean \(\frac{q}{p}\). Trials up to and including it is that plus 1, with mean \(\frac{1}{p}\).</div>
                   <div class="sol-step">${askVar
                     ? R`The two counts differ by the constant 1, and shifting does not change variance. Both have \(\text{Var} = \frac{q}{p^2} = \frac{${U.fmt(q1, 2)}}{${U.fmt(p, 2)}^2}\).`
                     : trials ? R`Counting trials: \(E = \frac{1}{p} = \frac{1}{${p}}\).` : R`Counting failures: \(E = \frac{q}{p} = \frac{${U.fmt(q1, 2)}}{${p}}\).`}</div>
                   <div class="sol-step">$$= ${f4(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Negative Binomial: waiting for the r-th success",
          make() {
            const p = U.pick([0.2, 0.25, 0.4, 0.5, 0.6]);
            const r = U.randInt(2, 6);
            const trials = Math.random() < 0.5;
            const q1 = 1 - p;
            const ans = trials ? r / p : r * q1 / p;
            return {
              q: R`A salesperson closes each pitch with probability ${p}, independently, and keeps pitching until they have closed ${r} sales. Find the expected number of ${trials ? "pitches made in total" : "unsuccessful pitches"}.`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">The number of failures before the \(${r}\)th success is \(\text{NBin}(${r}, ${p})\), a sum of ${r} independent \(\text{Geom}(${p})\) waiting times. Linearity: mean \(r\frac{q}{p}\).</div>
                   <div class="sol-step">${trials ? R`Total pitches \(=\) failures \(+\) the ${r} successes: \(E = \frac{rq}{p} + r = \frac{r}{p} = \frac{${r}}{${p}}\).` : R`\(E = \frac{rq}{p} = \frac{${r}(${U.fmt(q1, 2)})}{${p}}\).`}</div>
                   <div class="sol-step">$$= ${f4(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Poisson: mean equals variance",
          make() {
            const rate = U.pick([2, 3, 4, 5, 6, 8, 10, 12]);
            const per = U.pick(["hour", "day"]);
            const t = U.pick([0.5, 1, 2, 3]);
            const lam = rate * t;
            const ask = U.pick(["Var", "SD", "EX2"]);
            const ans = ask === "Var" ? lam : ask === "SD" ? Math.sqrt(lam) : lam + lam * lam;
            const span = t === 1 ? `one ${per}` : `${t} ${per}s`;
            const what = { Var: R`\text{Var}(X)`, SD: R`\text{SD}(X)`, EX2: R`E(X^2)` }[ask];
            return {
              q: R`Calls arrive at a help desk according to a Poisson process at an average rate of ${rate} per ${per}. Let \(X\) be the number of calls in ${span}. Find \(${what}\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Rescale the rate to the window: \(\lambda = ${rate} \times ${t} = ${U.fmt(lam)}\), so \(X \sim \text{Pois}(${U.fmt(lam)})\).</div>
                   <div class="sol-step">For a Poisson, \(E(X) = \text{Var}(X) = \lambda = ${U.fmt(lam)}\).</div>
                   <div class="sol-step">${ask === "Var" ? R`$$\text{Var}(X) = ${U.fmt(lam)}$$`
                     : ask === "SD" ? R`$$\text{SD}(X) = \sqrt{${U.fmt(lam)}} \approx ${f4(ans)}$$`
                     : R`$$E(X^2) = \text{Var}(X) + [E(X)]^2 = ${U.fmt(lam)} + ${U.fmt(lam)}^2 = ${U.fmt(ans)}$$`}</div>`,
            };
          },
        },
        {
          name: "Second moment of a Binomial",
          make() {
            const n = U.randInt(5, 30), p = U.pick([0.1, 0.2, 0.3, 0.5, 0.6, 0.8]);
            const mu = n * p, v = n * p * (1 - p);
            const ans = v + mu * mu;
            return {
              q: R`\(X \sim \text{Bin}(${n}, ${p})\). Find \(E(X^2)\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">Summing \(k^2\binom{${n}}{k}p^k q^{${n} - k}\) is painful. Run the variance shortcut backwards: \(E(X^2) = \text{Var}(X) + [E(X)]^2\).</div>
                   <div class="sol-step">\(E(X) = np = ${U.fmt(mu)}\), \(\text{Var}(X) = np(1 - p) = ${f4(v)}\).</div>
                   <div class="sol-step">$$E(X^2) = ${f4(v)} + ${U.fmt(mu)}^2 = ${f4(ans)}$$</div>`,
            };
          },
        },
        {
          name: "A cost that depends on a count",
          make() {
            const lam = U.randInt(2, 9);
            const fee = U.pick([20, 50, 100, 150]), per = U.pick([5, 10, 15, 25, 40]);
            const askVar = Math.random() < 0.5;
            const ans = askVar ? per * per * lam : fee + per * lam;
            return {
              q: R`The number of repairs \(X\) a printer needs in a year is Poisson with mean ${lam}. The yearly maintenance cost is \(C = ${fee} + ${per}X\) dollars. Find \(${askVar ? R`\text{Var}(C)` : R`E(C)`}\).`,
              answer: ans, kind: "num",
              sol: R`<div class="sol-step">\(C\) is a linear function of \(X \sim \text{Pois}(${lam})\), and \(E(X) = \text{Var}(X) = ${lam}\).</div>
                   <div class="sol-step">${askVar
                     ? R`The fixed fee is a shift and drops out; the per-repair charge comes out squared: $$\text{Var}(C) = ${per}^2 \cdot ${lam} = ${ans}$$`
                     : R`Linearity: $$E(C) = ${fee} + ${per}E(X) = ${fee} + ${per}(${lam}) = ${ans}$$`}</div>`,
            };
          },
        },
      ],
    }),
  ];

  /* When the question says X, reach for Y — the Chapter 4 decision table. */
  const methodGuide = [
    {
      when: R`"expected value", "mean", "on average" with a PMF table or formula`,
      use: R`\(E(X) = \sum_x x\,P(X = x)\)`,
      why: R`A probability-weighted average of the values. If a table entry is missing, make the PMF sum to 1 first. The answer need not be a possible value.`,
    },
    {
      when: R`the PMF is symmetric about some point \(c\) (e.g. \(|x|/32\) or \(x^2/10\) on a symmetric support)`,
      use: R`\(E(X) = c\) by symmetry`,
      why: R`Paired terms cancel. Spot it before writing out seven products. With mean 0, \(\text{Var}(X) = E(X^2)\).`,
    },
    {
      when: R`"expected number of …" that happen (matches, successes, red balls, people who …)`,
      use: R`Indicators + linearity: \(E(X) = \sum_j P(A_j)\)`,
      why: R`Each indicator has \(E(I_A) = P(A)\), and linearity adds them <b>even when the events are dependent</b>. You never need the PMF of the count.`,
    },
    {
      when: R`given \(E(X)\) (and maybe \(E(X^2)\)), asked for \(E\) of a linear combination or polynomial`,
      use: R`Linearity: \(E(aX + bY + c) = aE(X) + bE(Y) + c\)`,
      why: R`No independence needed. Treat \(X^2\) as its own variable: \(E(X^2)\) must be given or computed. It is not \([E(X)]^2\).`,
    },
    {
      when: R`\(E\) of a nonlinear function: \(X^2\), \(|X - c|\), \(2^X\), \(\frac{1}{X + 1}\), \(\min(X, s)\)`,
      use: R`LOTUS: \(E(g(X)) = \sum_x g(x)P(X = x)\)`,
      why: R`Transform the values, keep the probabilities. \(g(E(X))\) is the classic wrong answer. Square-of-a-linear? Expand first, then use linearity.`,
    },
    {
      when: R`profit, cost or payout as a function of a count (units sold, demand, repairs)`,
      use: R`Write \(h(X)\) explicitly, then \(E[h(X)]\)`,
      why: R`If \(h\) is linear, \(E[h(X)] = h(E(X))\). A cap such as \(\min(X, \text{stock})\) makes it nonlinear, so use LOTUS term by term.`,
    },
    {
      when: R`"variance", "spread", "standard deviation" from a PMF`,
      use: R`\(\text{Var}(X) = E(X^2) - [E(X)]^2\); \(\text{SD} = \sqrt{\text{Var}}\)`,
      why: R`Two sums over the table and a subtraction. A negative result means an arithmetic slip. Run it backwards for \(E(X^2) = \text{Var} + \text{mean}^2\).`,
    },
    {
      when: R`variance of \(aX + b\)`,
      use: R`\(\text{Var}(aX + b) = a^2\,\text{Var}(X)\); \(\text{SD}(aX + b) = |a|\,\text{SD}(X)\)`,
      why: R`Shifts do not change spread. Scales come out squared, so signs vanish.`,
    },
    {
      when: R`variance of a sum or difference of <b>independent</b> r.v.s`,
      use: R`\(\text{Var}(aX \pm bY) = a^2\text{Var}(X) + b^2\text{Var}(Y)\)`,
      why: R`Variances of differences <b>add</b>. Given SDs, square them first; SDs themselves never add. \(n\) i.i.d. copies: \(n\sigma^2\), but \(nX\): \(n^2\sigma^2\).`,
    },
    {
      when: R`a named distribution (Bin, HGeom, Geom, NBin, Pois) and "expected", "variance"`,
      use: R`The summary table: Bin \(np, npq\); HGeom \(n\frac{K}{N}\), with \(\frac{N - n}{N - 1}\); Pois \(\lambda, \lambda\)`,
      why: R`Recognise the story first. For Geometric/NBin check whether it counts <b>trials</b> (\(\frac{1}{p}\), \(\frac{r}{p}\)) or <b>failures</b> (\(\frac{q}{p}\), \(\frac{rq}{p}\)). The variance is the same either way.`,
    },
  ];

  MATH340.registerUnit({
    id: "ch4",
    title: "Chapter 4 · Expectation & Variance",
    short: "Ch 4 · E & Var",
    week: 4,
    order: 4,
    description: "Expected value of a discrete r.v., linearity of expectation and indicators, LOTUS, variance and standard deviation, the properties of variance, and the means and variances of the named discrete distributions.",
    flashcards,
    generators,
    methodGuide,
  });
})();
