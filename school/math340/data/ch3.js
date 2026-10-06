/* ============================================================
 * Chapter 3 — Random Variables and Their Distributions  (Week 3)
 * Source: class lecture notes (C3, both halves) + Blitzstein & Hwang
 *         ch. 3 and §4.3, §4.7
 * Covers: random variables, PMFs, CDFs, Bernoulli & Binomial,
 *         Hypergeometric, Binomial vs Hypergeometric, Discrete Uniform,
 *         functions of a random variable, independence of r.v.s and
 *         indicator random variables; Geometric, Negative Binomial and
 *         Poisson (B&H 4.3, 4.7 — second half of the C3 notes);
 *         the Binomial → Poisson limit, functions of two r.v.s, and the
 *         full independence definitions (complete C3 deck); the final
 *         pass over the deck added the Bernoulli examples (a rate, a
 *         win-loss record, a series of games) and the numbered-range
 *         uniforms (dorm-room lottery, choosing a partner).
 * ============================================================ */
(function () {
  const U = MATH340.util;
  const R = String.raw;

  const flashcards = [
    {
      id: "c3-rv-def", tag: "Definition 3.1.1",
      front: R`Define a <em>random variable</em>.`,
      back: R`Given an experiment with sample space \(S\), a random variable (r.v.) is a <b>function</b> from the sample space to the real numbers: $$X : S \to \mathbb{R}.$$ It assigns a number \(X(s)\) to each outcome \(s\). The randomness comes from which outcome occurs, not from the function.`,
    },
    {
      id: "c3-rv-event", tag: "Common pitfall",
      front: R`What kind of object is \(X\)? What kind of object is \(\{X = 3\}\)? What kind is \(P(X = 3)\)?`,
      back: R`\(X\) is a <b>function</b> (a random number). \(\{X = 3\} = \{s \in S : X(s) = 3\}\) is an <b>event</b> (a subset of \(S\)). \(P(X = 3)\) is a <b>number</b> in \([0, 1]\). Writing \(P(X)\) is meaningless: you can only take \(P\) of an event.`,
    },
    {
      id: "c3-discrete-def", tag: "Definition",
      front: R`When is a random variable <em>discrete</em>?`,
      back: R`When its possible values form a <b>finite set</b> or can be <b>listed in an infinite sequence</b> (countably infinite), e.g. \(\{0, 1, 2, \dots\}\). Counts are the typical example: number of defectives, number of tosses until the first tail.`,
    },
    {
      id: "c3-continuous-def", tag: "Definition",
      front: R`When is a random variable <em>continuous</em>? (Two conditions.)`,
      back: R`1. Its possible values are <b>all numbers in an interval</b> (or a union of intervals).<br>2. <b>No single value has positive probability</b>: \(P(X = c) = 0\) for every \(c\).<br>Measurements (length, height, pH, tension) are the typical example.`,
    },
    {
      id: "c3-support", tag: "Definition 3.2.2",
      front: R`What is the <em>support</em> of a discrete r.v. \(X\)?`,
      back: R`The set of values \(x\) with \(P(X = x) > 0\). Always write it down first: it tells you which terms appear in a sum, and a probability for a value outside the support is simply \(0\).`,
    },
    {
      id: "c3-pmf-def", tag: "Definition 3.2.3",
      front: R`Define the <em>probability mass function</em> (PMF) of a discrete r.v. \(X\).`,
      back: R`$$p_X(x) = P(X = x).$$ It is positive on the support of \(X\) and \(0\) everywhere else.`,
    },
    {
      id: "c3-pmf-valid", tag: "Theorem 3.2.7",
      front: R`What two conditions make a function \(p_X\) a <em>valid PMF</em>?`,
      back: R`1. <b>Nonnegative:</b> \(p_X(x) \ge 0\) for all \(x\) (and \(> 0\) on the support).<br>2. <b>Sums to 1:</b> $$\sum_{x} p_X(x) = 1.$$ Condition 2 is how you find an unknown constant \(c\) in a PMF.`,
    },
    {
      id: "c3-pmf-events", tag: "Using a PMF",
      front: R`How do you get \(P(X \in A)\) from the PMF — e.g. \(P(1 \le X \le 3)\)?`,
      back: R`Add the PMF over the values in \(A\): $$P(X \in A) = \sum_{x \in A} p_X(x).$$ For a count-valued \(X\): "at least 2" is \(X \ge 2\); "more than 2" is \(X \ge 3\); "at most 2" is \(X \le 2\); "fewer than 2" is \(X \le 1\). Use the complement when it has fewer terms.`,
    },
    {
      id: "c3-cdf-def", tag: "Definition 3.6.1",
      front: R`Define the <em>cumulative distribution function</em> (CDF) of a random variable \(X\).`,
      back: R`$$F_X(x) = P(X \le x) \quad\text{for every real } x.$$ For a discrete \(X\), \(F_X(x) = \sum_{y \le x} p_X(y)\): a <b>step function</b> that jumps at each value in the support.`,
    },
    {
      id: "c3-cdf-props", tag: "Theorem 3.6.3",
      front: R`What three properties does every CDF \(F\) have?`,
      back: R`1. <b>Increasing:</b> \(x_1 \le x_2 \Rightarrow F(x_1) \le F(x_2)\).<br>2. <b>Right-continuous:</b> at each jump, \(F\) takes the <em>upper</em> value (the dot is filled on the right piece).<br>3. <b>Limits:</b> \(F(x) \to 0\) as \(x \to -\infty\) and \(F(x) \to 1\) as \(x \to \infty\).`,
    },
    {
      id: "c3-cdf-interval", tag: "Proposition",
      front: R`Express \(P(a < X \le b)\) and \(P(X > a)\) in terms of the CDF \(F\).`,
      back: R`$$P(a < X \le b) = F(b) - F(a), \qquad P(X > a) = 1 - F(a).$$ The endpoints matter: \(\le\) on the right and \(<\) on the left is exactly what \(F(b) - F(a)\) counts. For an integer-valued \(X\), \(P(a \le X \le b) = F(b) - F(a - 1)\).`,
    },
    {
      id: "c3-cdf-jump", tag: "CDF ↔ PMF",
      front: R`Given the CDF of a discrete r.v., how do you recover \(P(X = x)\)?`,
      back: R`\(P(X = x)\) is the <b>size of the jump</b> of \(F\) at \(x\): $$P(X = x) = F(x) - F(x^-),$$ where \(F(x^-)\) is the value just to the left of \(x\). Where \(F\) is flat there is no jump, so \(P(X = x) = 0\).`,
    },
    {
      id: "c3-bern", tag: "Definition 3.3.1",
      front: R`Define the <em>Bernoulli distribution</em> \(\text{Bern}(p)\).`,
      back: R`\(X \sim \text{Bern}(p)\) if $$P(X = 1) = p, \qquad P(X = 0) = 1 - p, \qquad 0 &lt; p &lt; 1.$$ A single trial that succeeds (1) or fails (0).`,
    },
    {
      id: "c3-indicator", tag: "Definition 3.3.2",
      front: R`Define the <em>indicator random variable</em> \(I_A\) of an event \(A\). What is its distribution?`,
      back: R`$$I_A = \begin{cases} 1, & \text{if } A \text{ occurs}, \\ 0, & \text{if } A \text{ does not occur.} \end{cases}$$ \(I_A \sim \text{Bern}(p)\) with \(p = P(A)\). Every Bernoulli r.v. is the indicator of its "success" event.`,
    },
    {
      id: "c3-bern-trial", tag: "Definition",
      front: R`What is a <em>Bernoulli trial</em>?`,
      back: R`An experiment that results in either a <b>success</b> or a <b>failure</b> (but not both). The indicator of success is \(\text{Bern}(p)\), where \(p = P(\text{success})\).`,
    },
    {
      id: "c3-bern-model", tag: "Example · win–loss record",
      front: R`A team's record is 88–66. Let \(X = 1\) if they win their next game and \(0\) if they lose. What is the distribution of \(X\), and what is \(p\)?`,
      back: R`\(X \sim \text{Bern}(p)\): one game is one Bernoulli trial. The record does not <em>give</em> \(p\) — it <b>estimates</b> it, under the modelling assumptions that every game has the same win probability and the games are independent: $$p \approx \frac{88}{88 + 66} = \frac{88}{154} = \frac{4}{7} \approx 0.571.$$ So \(P(X = 1) = 4/7\) and \(P(X = 0) = 3/7\). The number of wins in a series of \(n\) such games is then \(\text{Bin}(n, 4/7)\).`,
    },
    {
      id: "c3-binom-exp", tag: "Binomial experiment",
      front: R`List the four conditions for a <em>binomial experiment</em>.`,
      back: R`1. A <b>fixed number</b> of trials, \(n\).<br>2. Each trial has exactly <b>two outcomes</b>, success or failure.<br>3. The trials are <b>independent</b>.<br>4. The success probability \(p\) is the <b>same</b> on every trial.<br>If any fails (e.g. drawing without replacement breaks 3 and 4), \(X\) is not Binomial.`,
    },
    {
      id: "c3-binom-def", tag: "Definition 3.3.3",
      front: R`State the story of the <em>Binomial distribution</em> \(\text{Bin}(n, p)\).`,
      back: R`\(n\) independent Bernoulli trials, each with success probability \(p\). Then $$X = \text{number of successes} \sim \text{Bin}(n, p),$$ with \(n \in \{1, 2, \dots\}\) and \(0 &lt; p &lt; 1\). \(\text{Bin}(1, p)\) is \(\text{Bern}(p)\).`,
    },
    {
      id: "c3-binom-pmf", tag: "Theorem 3.3.5",
      front: R`State the PMF of \(X \sim \text{Bin}(n, p)\) and explain each factor.`,
      back: R`$$P(X = k) = \binom{n}{k} p^k (1 - p)^{n - k}, \qquad k = 0, 1, \dots, n.$$ \(p^k(1-p)^{n-k}\) is the probability of <em>one particular</em> sequence with \(k\) successes (independence); \(\binom{n}{k}\) counts which \(k\) of the \(n\) positions are the successes.`,
    },
    {
      id: "c3-binom-sym", tag: "Theorem 3.3.7",
      front: R`If \(X \sim \text{Bin}(n, p)\), what is the distribution of the number of <em>failures</em>, \(n - X\)?`,
      back: R`$$n - X \sim \text{Bin}(n, 1 - p).$$ Swap the roles of success and failure. So "exactly \(j\) misses" is \(P(X = n - j)\).`,
    },
    {
      id: "c3-binom-atleast1", tag: "Binomial · complement",
      front: R`For \(X \sim \text{Bin}(n, p)\), what is the fastest way to get \(P(X \ge 1)\)?`,
      back: R`The complement: $$P(X \ge 1) = 1 - P(X = 0) = 1 - (1 - p)^n.$$ Summing \(P(X = 1) + \dots + P(X = n)\) gives the same answer with \(n\) terms instead of one.`,
    },
    {
      id: "c3-hgeom-def", tag: "Definition 3.4.1",
      front: R`State the story of the <em>Hypergeometric distribution</em> \(\text{HGeom}(w, b, n)\).`,
      back: R`An urn holds \(w\) white and \(b\) black balls. Draw \(n\) balls <b>without replacement</b>, all subsets of size \(n\) equally likely. Then $$X = \text{number of white balls drawn} \sim \text{HGeom}(w, b, n).$$`,
    },
    {
      id: "c3-hgeom-pmf", tag: "Theorem 3.4.2",
      front: R`State the PMF of \(X \sim \text{HGeom}(w, b, n)\) and explain each factor.`,
      back: R`$$P(X = k) = \frac{\binom{w}{k}\binom{b}{n - k}}{\binom{w + b}{n}}$$ for integers \(0 \le k \le w\) and \(0 \le n - k \le b\), and \(0\) otherwise. Numerator: choose \(k\) of the white balls <em>and</em> the other \(n - k\) from the black. Denominator: all ways to choose \(n\) of the \(w + b\) balls (naive definition).`,
    },
    {
      id: "c3-hgeom-support", tag: "HGeom · support",
      front: R`What values can \(X \sim \text{HGeom}(w, b, n)\) actually take?`,
      back: R`$$\max(0,\, n - b) \le k \le \min(n,\, w).$$ You cannot draw more white balls than there are (\(k \le w\)) or than you draw (\(k \le n\)), and if \(n > b\) at least \(n - b\) of the draws <em>must</em> be white. Outside this range \(P(X = k) = 0\).`,
    },
    {
      id: "c3-capture", tag: "Example · capture–recapture",
      front: R`A forest has \(N\) elk; \(m\) were tagged and released. Today \(n\) are captured at random. What is the distribution of the number of tagged elk in today's sample?`,
      back: R`$$X \sim \text{HGeom}(m,\ N - m,\ n), \qquad P(X = k) = \frac{\binom{m}{k}\binom{N - m}{n - k}}{\binom{N}{n}}.$$ Tagged elk are the "white balls" and untagged the "black balls". The same elk cannot be caught twice in one sample, so the draws are without replacement.`,
    },
    {
      id: "c3-bin-vs-hgeom", tag: "Binomial vs. Hypergeometric",
      front: R`An urn has \(w\) white and \(b\) black balls; draw \(n\). When is the number of white balls Binomial, and when is it Hypergeometric?`,
      back: R`<b>With replacement</b> ⇒ independent draws with constant \(p = \frac{w}{w + b}\) ⇒ \(\text{Bin}\left(n, \frac{w}{w+b}\right)\).<br><b>Without replacement</b> ⇒ dependent draws, and the success probability changes from draw to draw ⇒ \(\text{HGeom}(w, b, n)\).<br>Both count successes in \(n\) trials.`,
    },
    {
      id: "c3-waiting", tag: "Example · waiting time",
      front: R`Toss a coin whose tail probability is \(p\). Let \(X\) be the number of tosses until the first tail, <em>including</em> that toss. Find the PMF of \(X\) and \(P(X > k)\).`,
      back: R`\(X = k\) means \(k - 1\) heads, then a tail: $$P(X = k) = (1 - p)^{k - 1} p, \qquad k = 1, 2, 3, \dots$$ \(X > k\) means the first \(k\) tosses are all heads: \(P(X > k) = (1 - p)^k\). This is a valid PMF (geometric series sums to 1), and \(X\) is discrete but has infinitely many values.`,
    },

    /* ---- Section 3.5: Discrete Uniform ---- */
    {
      id: "c3-dunif-story", tag: "Definition 3.5.1",
      front: R`State the story and PMF of the <em>Discrete Uniform</em> distribution \(X \sim \text{DUnif}(C)\).`,
      back: R`Let \(C\) be a <b>finite, non-empty</b> set of values. \(X \sim \text{DUnif}(C)\) means \(X\) is equally likely to be any element of \(C\): $$P(X = x) = \frac{1}{|C|}, \qquad x \in C.$$ Picking a random element of \(C\) "at random" with no further qualification means exactly this.`,
    },
    {
      id: "c3-dunif-subset", tag: "DUnif · events",
      front: R`For \(X \sim \text{DUnif}(C)\) and any subset \(A \subseteq C\), what is \(P(X \in A)\)?`,
      back: R`$$P(X \in A) = \frac{|A|}{|C|}$$ Uniformity turns every probability question back into a <b>counting</b> question — this is the naive definition of probability from Chapter 1, now wearing a random-variable hat.`,
    },
    {
      id: "c3-dunif-trap", tag: "Common pitfall",
      front: R`Two fair dice are rolled and \(T\) is their total. Is \(T\) Discrete Uniform on \(\{2, \dots, 12\}\)?`,
      back: R`<b>No.</b> The 36 <em>outcomes</em> are equally likely, but the 11 <em>totals</em> are not: \(P(T = 7) = 6/36\) while \(P(T = 2) = 1/36\). "Uniform" is a claim about the values of the r.v., not about the underlying outcomes. A function of a uniform r.v. is usually not uniform.`,
    },
    {
      id: "c3-dunif-shifted", tag: "DUnif · counting the support",
      front: R`Dorm rooms 301–335 are equally likely; partners numbered 2–9 are equally likely. What is \(|C|\) in each case, and what is the usual slip?`,
      back: R`\(|C| = b - a + 1\), not \(b - a\) and not \(b\): rooms \(301, \dots, 335\) are \(35\) rooms and partners \(2, \dots, 9\) are \(8\) people. So \(P(\text{room } 317) = 1/35\) and \(P(\text{partner} \in \{5, 6, 7\}) = 3/8\). Count the favourable values the same way: the even rooms are \(302, 304, \dots, 334\), which is \(17\) of the \(35\).`,
    },

    {
      id: "c3-slips", tag: "Example · slips of paper",
      front: R`Five slips are drawn from a hat of slips numbered \(1, \dots, 100\). Compare sampling <em>with</em> and <em>without</em> replacement: the count of slips \(\ge 80\), the value of the \(j\)th draw, and \(P(\text{100 is drawn})\).`,
      back: R`<b>With replacement:</b> count \(\sim \text{Bin}(5, 21/100)\); \(j\)th draw \(\sim \text{DUnif}(\{1,\dots,100\})\); \(P(\text{100 drawn}) = 1 - (99/100)^5 \approx 0.049\).<br><b>Without:</b> count \(\sim \text{HGeom}(21, 79, 5)\); \(j\)th draw is <em>still</em> \(\text{DUnif}(\{1,\dots,100\})\) by symmetry; \(P(\text{100 drawn}) = 5/100\) exactly.<br>There are 21 values in \(\{80, \dots, 100\}\), not 20.`,
    },

    /* ---- Section 4.3: Geometric and Negative Binomial ---- */
    {
      id: "c3-geom-story", tag: "Geometric · story",
      front: R`State the story, support, and PMF of \(X \sim \text{Geom}(p)\).`,
      back: R`Run independent Bernoulli(\(p\)) trials until the first success. \(X\) is the number of <b>failures before</b> the first success, so \(X \in \{0, 1, 2, \dots\}\) and $$P(X = k) = q^k p, \qquad q = 1 - p.$$ \(k\) failures in a row, then one success. E.g. tails before the first head of a fair coin: \(\text{Geom}(1/2)\), \(P(X = k) = (1/2)^{k+1}\).`,
    },
    {
      id: "c3-geom-convention", tag: "Geometric · convention",
      front: R`"The 8th person is the first bike rider." Is that \(P(X = 8)\) for \(X \sim \text{Geom}(p)\)?`,
      back: R`<b>No — it is \(P(X = 7)\).</b> The class's Geometric counts <em>failures</em>, and "the 8th is the first success" means 7 failures first: \(q^7 p\). If you count <em>trials</em> including the success, that is the First Success distribution: \(Y = X + 1 \sim \text{FS}(p)\), \(P(Y = k) = q^{k-1}p\). Decide which one the question counts before writing the exponent.`,
    },
    {
      id: "c3-geom-cdf", tag: "Theorem 4.3.3",
      front: R`Give the CDF of \(X \sim \text{Geom}(p)\) and the tail \(P(X \ge k)\).`,
      back: R`$$F(x) = \begin{cases} 1 - q^{\lfloor x \rfloor + 1}, & x \ge 0 \\ 0, & x < 0 \end{cases}$$ Easiest route: \(X \ge k\) means the first \(k\) trials all fail, so \(P(X \ge k) = q^k\) and \(P(X \le k) = 1 - q^{k+1}\). No series to sum.`,
    },
    {
      id: "c3-geom-memoryless", tag: "Geometric · memoryless",
      front: R`For \(X \sim \text{Geom}(p)\), what is \(P(X \ge m + k \mid X \ge m)\)?`,
      back: R`$$P(X \ge m + k \mid X \ge m) = \frac{q^{m+k}}{q^m} = q^k = P(X \ge k).$$ The <b>memoryless property</b>: having already failed \(m\) times tells you nothing about how many more failures are coming, because the trials are independent. The Geometric is the only discrete distribution on \(\{0,1,2,\dots\}\) with this property.`,
    },
    {
      id: "c3-nbin-story", tag: "Story 4.3.8",
      front: R`State the story and PMF of \(X \sim \text{NBin}(r, p)\).`,
      back: R`\(X\) is the number of <b>failures before the \(r\)th success</b> in independent Bernoulli(\(p\)) trials: $$P(X = n) = \binom{n + r - 1}{r - 1} p^r q^n, \qquad n = 0, 1, 2, \dots$$ Why: the last trial must be the \(r\)th success, so only the first \(n + r - 1\) trials are free, and they hold \(r - 1\) successes. \(\text{NBin}(1, p) = \text{Geom}(p)\).`,
    },
    {
      id: "c3-nbin-vs-bin", tag: "NBin vs. Binomial",
      front: R`Binomial and Negative Binomial both involve independent Bernoulli(\(p\)) trials. What is the difference?`,
      back: R`<b>Binomial:</b> the number of <em>trials</em> \(n\) is fixed; count the successes. \(\binom{n}{k}p^kq^{n-k}\).<br><b>Negative Binomial:</b> the number of <em>successes</em> \(r\) is fixed; count the failures until you reach it. \(\binom{n+r-1}{r-1}p^rq^n\) — one fewer free trial, because the final one is forced to be a success.`,
    },
    {
      id: "c3-nbin-sum", tag: "Theorem 4.3.10",
      front: R`How is \(\text{NBin}(r, p)\) built out of Geometric r.v.s?`,
      back: R`If \(X \sim \text{NBin}(r, p)\) then $$X = X_1 + X_2 + \cdots + X_r, \qquad X_i \overset{\text{i.i.d.}}{\sim} \text{Geom}(p),$$ where \(X_i\) is the number of failures between the \((i-1)\)st and \(i\)th successes. Same relationship as Binomial = sum of i.i.d. Bernoullis.`,
    },

    /* ---- Section 4.7: Poisson ---- */
    {
      id: "c3-pois-def", tag: "Definition 4.7.1",
      front: R`State the PMF of \(X \sim \text{Pois}(\lambda)\) and when the Poisson is used.`,
      back: R`$$P(X = k) = \frac{e^{-\lambda}\lambda^k}{k!}, \qquad k = 0, 1, 2, \dots, \quad \lambda > 0.$$ It models the <b>number of events in a fixed interval</b> of time or space when events occur independently at a steady rate \(\lambda\) per interval — dog walkers per hour, typos per page, calls per minute. It sums to 1 because \(\sum_k \lambda^k/k! = e^{\lambda}\).`,
    },
    {
      id: "c3-pois-cdf", tag: "Poisson · CDF",
      front: R`Write the CDF of \(X \sim \text{Pois}(\lambda)\). How do you get \(P(X \ge k)\) for small \(k\)?`,
      back: R`$$F(x) = P(X \le x) = \sum_{j=0}^{\lfloor x \rfloor} \frac{e^{-\lambda}\lambda^j}{j!} \quad (x \ge 0), \qquad F(x) = 0 \ (x < 0).$$ There is no closed form, and the upper tail is an infinite sum, so use the complement: \(P(X \ge k) = 1 - F(k - 1)\). In particular \(P(X \ge 1) = 1 - e^{-\lambda}\).`,
    },
    {
      id: "c3-pois-rate", tag: "Poisson · rescaling",
      front: R`Dog walkers pass at a rate of 8 per hour. What is the distribution of the number that pass in 15 minutes?`,
      back: R`\(\text{Pois}(2)\). The parameter is the <b>expected count in the interval you are asking about</b>: rate × length \(= 8 \times \tfrac{1}{4} = 2\). Always rescale \(\lambda\) to the question's interval before plugging into the PMF.`,
    },
    {
      id: "c3-pois-bin", tag: "Poisson ↔ Binomial",
      front: R`When can \(\text{Bin}(n, p)\) be approximated by a Poisson, and with what parameter?`,
      back: R`When \(n\) is <b>large</b> and \(p\) is <b>small</b> (many trials, each a rare event), $$\text{Bin}(n, p) \approx \text{Pois}(\lambda), \qquad \lambda = np.$$ E.g. 500 items each defective with probability 0.004: the number defective is approximately \(\text{Pois}(2)\). This is why the Poisson is the law of rare events.`,
    },

    /* ---- Section 3.7: functions of a random variable ---- */
    {
      id: "c3-fn-def", tag: "Section 3.7",
      front: R`If \(X\) is a random variable and \(g\) is a function, what is \(Y = g(X)\), and how do you get its PMF?`,
      back: R`\(Y = g(X)\) is itself a random variable — the composition \(s \mapsto g(X(s))\). Its PMF is obtained by <b>collecting every \(x\) that \(g\) sends to \(y\)</b>: $$P(Y = y) = \sum_{x \,:\, g(x) = y} P(X = x).$$`,
    },
    {
      id: "c3-fn-collapse", tag: "Functions · pitfall",
      front: R`Why can the support of \(Y = g(X)\) be <em>smaller</em> than the support of \(X\)?`,
      back: R`Because \(g\) need not be one-to-one: distinct values of \(X\) can map to the same \(y\), and their probabilities <b>add</b>. E.g. if \(X \in \{-2,-1,0,1,2\}\) then \(Y = X^2 \in \{0,1,4\}\), with \(P(Y = 1) = P(X = -1) + P(X = 1)\). If \(g\) <em>is</em> one-to-one the probabilities just move across unchanged.`,
    },
    {
      id: "c3-fn-one-to-one", tag: "One-to-one transformation",
      front: R`If \(g\) is <em>one-to-one</em>, what are the support and PMF of \(Y = g(X)\)?`,
      back: R`Distinct \(x\) give distinct \(y\), so nothing collapses: $$\operatorname{supp}(Y) = \{g(x) : x \in \operatorname{supp}(X)\}, \qquad P(Y = g(x)) = P(X = x).$$ The probabilities are carried across unchanged; only the labels move. E.g. \(P(X = x) = x/6\) on \(\{1, 2, 3\}\) and \(Y = 3X\): \(Y \in \{3, 6, 9\}\) with \(P(Y = 3) = 1/6\), \(P(Y = 6) = 2/6\), \(P(Y = 9) = 3/6\).`,
    },

    /* ---- Section 3.8: independence of random variables ---- */
    {
      id: "c3-indep-rv", tag: "Definition 3.8.1",
      front: R`When are two discrete random variables \(X\) and \(Y\) <em>independent</em>?`,
      back: R`When the joint PMF factors for <b>every</b> pair of values: $$P(X = x,\ Y = y) = P(X = x)\,P(Y = y) \quad \text{for all } x, y.$$ One pair factoring is not enough — a single pair that fails is enough to make them dependent.`,
    },
    {
      id: "c3-iid", tag: "Definition · i.i.d.",
      front: R`What does <em>i.i.d.</em> mean, and which half of it does each word carry?`,
      back: R`<b>Independent and identically distributed.</b> <em>Independent</em>: the joint PMF factors. <em>Identically distributed</em>: each has the same PMF. The two are separate claims — draws without replacement are identically distributed but <b>not</b> independent, and \(X\) with \(2X\) are dependent and not identically distributed.`,
    },
    {
      id: "c3-indicator-alg", tag: "Indicator algebra",
      front: R`For indicator r.v.s, simplify \(I_A^2\), \(I_A I_B\), and \(I_{A^c}\).`,
      back: R`$$I_A^2 = I_A, \qquad I_A I_B = I_{A \cap B}, \qquad I_{A^c} = 1 - I_A$$ Indicators only take the values 0 and 1, so squaring changes nothing, and a product is 1 exactly when both are — i.e. on \(A \cap B\).`,
    },
    {
      id: "c3-indicator-count", tag: "Counting with indicators",
      front: R`If \(A_1, \dots, A_n\) are events, what does \(X = I_{A_1} + \cdots + I_{A_n}\) count? What is its distribution when the \(A_i\) are independent with the same probability \(p\)?`,
      back: R`\(X\) counts <b>how many of the events occur</b>. If the \(A_i\) are independent and each has probability \(p\), then \(X \sim \text{Bin}(n, p)\) — this is exactly the "sum of \(n\) i.i.d. Bernoulli(\(p\))" story of the Binomial.`,
    },

    /* ---- C3 full deck: classifying r.v.s ---- */
    {
      id: "c3-classify", tag: "Discrete or continuous?",
      front: R`Classify each: (a) unbroken eggs in a carton, (b) swings a golfer needs to hit the ball, (c) the sales-tax percentage on a purchase, (d) the pH of a soil sample, (e) a rattlesnake's length.`,
      back: R`(a) <b>Discrete</b>: finite set \(\{0, \dots, 12\}\). (b) <b>Discrete</b>: \(\{1, 2, 3, \dots\}\) is infinite but can be <em>listed</em>. (c) <b>Discrete</b>: only finitely many tax rates exist, even though they are decimals. (d), (e) <b>Continuous</b>: any value in an interval, and no single value has positive probability.<br>The test is not "integer or decimal" but "can the values be listed?"`,
    },

    /* ---- C3 full deck: Binomial → Poisson ---- */
    {
      id: "c3-pois-limit", tag: "Deriving the Poisson PMF",
      front: R`Let \(X \sim \text{Bin}(n, \lambda/n)\). Show that \(P(X = k) \to e^{-\lambda}\lambda^k / k!\) as \(n \to \infty\).`,
      back: R`Substitute \(p = \lambda/n\) and regroup: $$P(X = k) = \frac{\lambda^k}{k!}\left[\frac{n}{n}\cdot\frac{n-1}{n}\cdots\frac{n-k+1}{n}\right]\left(1 - \frac{\lambda}{n}\right)^{n}\left(1 - \frac{\lambda}{n}\right)^{-k}.$$ With \(k\) fixed, the bracket \(\to 1\), \((1 - \lambda/n)^{n} \to e^{-\lambda}\), and \((1 - \lambda/n)^{-k} \to 1\). What is left is the Poisson PMF.`,
    },

    /* ---- C3 full deck: functions of two r.v.s; r.v. vs distribution ---- */
    {
      id: "c3-fn-two", tag: "Functions of two r.v.s",
      front: R`What is \(g(X, Y)\) for two random variables on the same sample space, and how do you find \(P(g(X, Y) = z)\)?`,
      back: R`It is the random variable \(s \mapsto g(X(s), Y(s))\): first read off both values, then apply \(g\). Its PMF is found by <b>collecting every pair</b> that \(g\) sends to \(z\): $$P(g(X, Y) = z) = \sum_{(x, y)\,:\,g(x, y) = z} P(X = x, Y = y).$$ When \(X, Y\) are independent, each joint term is \(P(X = x)P(Y = y)\). Example: \(\max(X, Y)\) for two dice.`,
    },
    {
      id: "c3-rv-vs-dist", tag: "Common error",
      front: R`\(X\) has PMF \(p_X\). Is the PMF of \(2X\) equal to \(2p_X(x)\)? And if \(X_1, X_2\) are i.i.d. copies of \(X\), is \(X_1 + X_2\) the same as \(2X\)?`,
      back: R`<b>No to both.</b> \(2p_X\) sums to 2, so it is not a PMF at all. Doubling moves the <em>values</em>, not the probabilities: \(P(2X = 2x) = P(X = x)\).<br>\(X_1 + X_2\) is not \(2X\) either. \(2X\) is always even, but \(X_1 + X_2\) can be odd. Multiplying a random variable by 2 is a different operation from adding two independent copies of it.`,
    },
    {
      id: "c3-same-dist", tag: "Common error",
      front: R`If \(X\) and \(Y\) have the same distribution, must \(X = Y\)?`,
      back: R`<b>No.</b> Roll one die, let \(X\) be the top face and \(Y = 7 - X\) the bottom face. Both are \(\text{DUnif}(\{1, \dots, 6\})\), yet \(X \ne Y\) on <em>every</em> outcome. A distribution describes how probability is spread over values, not which value happens on a given outcome.`,
    },

    /* ---- C3 full deck: independence of r.v.s, in full ---- */
    {
      id: "c3-indep-cdf", tag: "Definition 3.8.1",
      front: R`State the general (CDF) definition of independence of two r.v.s, and its discrete equivalent.`,
      back: R`\(X\) and \(Y\) are independent if $$P(X \le x,\ Y \le y) = P(X \le x)\,P(Y \le y) \quad \text{for all } x, y \in \mathbb{R}.$$ For discrete r.v.s this is equivalent to the joint PMF factoring: \(P(X = x, Y = y) = P(X = x)P(Y = y)\) for all \(x, y\) in the supports. The CDF form also covers continuous r.v.s, which have no PMF.`,
    },
    {
      id: "c3-indep-many", tag: "Definition 3.8.2",
      front: R`When are \(X_1, \dots, X_n\) independent? What about infinitely many r.v.s?`,
      back: R`\(X_1, \dots, X_n\) are independent if $$P(X_1 \le x_1, \dots, X_n \le x_n) = P(X_1 \le x_1)\cdots P(X_n \le x_n)$$ for all \(x_1, \dots, x_n\). An infinite collection is independent if <b>every finite subset</b> is. Payoff: events like \(\max_i X_i \le m\) or \(\min_i X_i > m\) become products.`,
    },
    {
      id: "c3-indep-fn", tag: "Theorem 3.8.5",
      front: R`If \(X\) and \(Y\) are independent, what can you say about \(g(X)\) and \(h(Y)\)?`,
      back: R`They are <b>independent too</b>, for any functions \(g, h\). E.g. \(X^2\) and \(|Y - 3|\) are independent, so \(P(X^2 = 1,\ |Y - 3| \le 1) = P(X^2 = 1)\,P(|Y - 3| \le 1)\).<br>The functions must each use <em>one</em> variable: \(X + Y\) and \(X - Y\) both use both, and need not be independent.`,
    },
    {
      id: "c3-sum-diff", tag: "Example · dice",
      front: R`Two fair dice show \(X\) and \(Y\). Are \(X + Y\) and \(X - Y\) independent?`,
      back: R`<b>No.</b> One pair of values is enough to show it: \(P(X + Y = 12,\ X - Y = 1) = 0\), since a sum of 12 forces \(X = Y = 6\). But \(P(X + Y = 12)P(X - Y = 1) = \tfrac{1}{36}\cdot\tfrac{5}{36} > 0\).<br>Intuition: knowing \(X - Y\) restricts which sums are possible. For example, \(X - Y\) odd forces \(X + Y\) odd.`,
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

  /* Redraw parameters until the answer is a probability worth computing:
   * "≈ 0.0000003" or "≈ 1" teaches nothing and reads like a bug. */
  function sane(make, lo = 0.01, hi = 0.99) {
    return function () {
      let p;
      for (let i = 0; i < 60; i++) { p = make(); if (p.answer >= lo && p.answer <= hi) return p; }
      return p;
    };
  }

  function binPmf(n, k, p) {
    if (k < 0 || k > n) return 0;
    return U.choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }
  function hgeomPmf(w, b, n, k) {
    if (k < 0 || k > w || n - k < 0 || n - k > b) return 0;
    return U.choose(w, k) * U.choose(b, n - k) / U.choose(w + b, n);
  }
  const binTex = (n, k, p) => R`\binom{${n}}{${k}}(${U.fmt(p, 2)})^{${k}}(${U.fmt(1 - p, 2)})^{${n - k}}`;
  const hgTex = (w, b, n, k) => R`\frac{\binom{${w}}{${k}}\binom{${b}}{${n - k}}}{\binom{${w + b}}{${n}}}`;

  function pmfTable(xs, ps, xLabel = "x", pLabel = R`p_X(x)`) {
    return R`<table class="tbl"><tr><th>\(${xLabel}\)</th>${xs.map(x => `<td>${x}</td>`).join("")}</tr>
      <tr><th>\(${pLabel}\)</th>${ps.map(p => `<td>${p}</td>`).join("")}</tr></table>`;
  }

  /* A random step CDF: sorted jump points with masses in hundredths. */
  function stepCdf() {
    const k = U.randInt(4, 5);
    const xs = U.sample([0, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 10], k).sort((a, b) => a - b);
    const ps = pmfHundredths(k);
    const F = [];
    ps.reduce((acc, p, i) => (F[i] = acc + p), 0);
    // F[i] = F at xs[i] (hundredths); F(-inf) = 0
    const cases = [R`0, & x < ${xs[0]}`];
    for (let i = 0; i < k - 1; i++) cases.push(R`${hund(F[i])}, & ${xs[i]} \le x < ${xs[i + 1]}`);
    cases.push(R`1, & x \ge ${xs[k - 1]}`);
    const tex = R`$$F(x) = \begin{cases} ${cases.join(R` \\ `)} \end{cases}$$`;
    const Fleft = i => (i === 0 ? 0 : F[i - 1]);        // F just left of xs[i]
    const Fat = x => { let v = 0; xs.forEach((xi, i) => { if (xi <= x) v = F[i]; }); return v; };
    return { k, xs, ps, F, tex, Fleft, Fat };
  }

  /* Binomial stories: p is stated as a rate so identifying it is part of the job. */
  const BIN_CTX = [
    () => {
      const [m, t] = U.pick([[3, 4], [2, 5], [7, 10], [3, 5], [4, 5], [1, 2], [13, 20]]);
      const n = U.randInt(6, 12);
      return { p: m / t, n, setup: R`On a basketball court you take ${n} free throws. Assume you make ${m} out of every ${t} free throws you attempt, independently from shot to shot.`,
        X: "the number of free throws you make", succ: "free throws you make", fail: "free throws you miss",
        pWhy: R`\(p = ${m}/${t} = ${U.fmt(m / t, 2)}\)` };
    },
    () => {
      const c = U.pick([4, 5]);
      const n = U.randInt(6, 12);
      return { p: 1 / c, n, setup: R`A student guesses blindly on all ${n} questions of a multiple-choice quiz. Each question has ${c} options, exactly one of them correct.`,
        X: "the number of questions answered correctly", succ: "correct answers", fail: "wrong answers",
        pWhy: R`\(p = 1/${c} = ${U.fmt(1 / c, 2)}\)` };
    },
    () => {
      const p = U.pick([0.6, 0.7, 0.75, 0.8, 0.85, 0.9]);
      const n = U.randInt(6, 12);
      return { p, n, setup: R`A packet contains ${n} seeds. Each seed germinates with probability ${p}, independently of the others.`,
        X: "the number of seeds that germinate", succ: "seeds that germinate", fail: "seeds that fail to germinate",
        pWhy: R`\(p = ${p}\)` };
    },
    () => {
      const p = U.pick([0.05, 0.1, 0.15, 0.2, 0.25]);
      const n = U.randInt(8, 15);
      return { p, n, setup: R`A machine produces items that are defective with probability ${p}, independently. A quality inspector examines the next ${n} items off the line.`,
        X: "the number of defective items", succ: "defective items", fail: "non-defective items",
        pWhy: R`\(p = ${p}\)` };
    },
    () => {
      const p = U.pick([0.3, 0.35, 0.4, 0.45, 0.55]);
      const n = U.randInt(6, 12);
      return { p, n, setup: R`In a certain city ${Math.round(p * 100)}% of voters support a ballot measure. A pollster phones ${n} voters chosen independently at random (the city is large).`,
        X: "the number of supporters reached", succ: "supporters", fail: "non-supporters",
        pWhy: R`\(p = ${p}\)` };
    },
  ];

  /* Hypergeometric stories: two kinds of object, draw without replacement. */
  const HG_CTX = [
    () => ({ w: U.randInt(5, 9), b: U.randInt(4, 9), white: "white", one: "white", black: "black", obj: "balls",
      setup: (w, b, n) => R`An urn contains ${w} white and ${b} black balls. ${n} balls are drawn at random without replacement.` }),
    () => ({ w: U.randInt(3, 6), b: U.randInt(10, 16), white: "defective", one: "defective", black: "working", obj: "bulbs",
      setup: (w, b, n) => R`A box of ${w + b} light bulbs contains ${w} defective ones. An inspector picks ${n} bulbs at random from the box to test (none is put back).` }),
    () => ({ w: U.randInt(6, 10), b: U.randInt(6, 10), white: "women", one: "a woman", black: "men", obj: "people",
      setup: (w, b, n) => R`A committee of ${n} is chosen at random from a department of ${w} women and ${b} men.` }),
    () => ({ w: U.randInt(4, 8), b: U.randInt(5, 10), white: "red", one: "red", black: "blue", obj: "marbles",
      setup: (w, b, n) => R`A bag holds ${w} red and ${b} blue marbles. You grab ${n} of them at random.` }),
  ];

  /* Random-variable-from-a-story contexts for PMF tables. */
  const PMF_CTX = [
    { X: "the number of students who show up for a professor's office hours on a given day", who: "students", verb: "show up", neg: "do not show up" },
    { X: "the number of the family's cars that need repairs this year", who: "cars", verb: "need repairs", neg: "do not need repairs" },
    { X: "the number of a team's starting players who score in a game", who: "starters", verb: "score", neg: "do not score" },
    { X: "the number of seats in a small shuttle van that are occupied on a trip", who: "seats", verb: "are occupied", neg: "are empty" },
  ];

  function randomPmfTable(minM = 4, maxM = 6) {
    const m = U.randInt(minM, maxM);
    const xs = Array.from({ length: m + 1 }, (_, i) => i);
    const ps = pmfHundredths(m + 1);
    return { m, xs, ps };
  }
  const pSum = (ps, lo, hi) => sum(ps.slice(lo, hi + 1));

  /* Geometric / Negative Binomial stories: p is a per-trial rate. */
  const GEOM_CTX = [
    () => {
      const pct = U.pick([4, 5, 8, 10, 12, 15]);
      return { p: pct / 100, setup: R`${pct}% of the people travelling down a sidewalk are on bikes. You watch people go by one at a time.`,
        succ: "bike rider", succs: "bike riders", fail: "non-biker", fails: "non-bikers", trial: "person" };
    },
    () => {
      const p = U.pick([0.2, 0.25, 0.3, 0.35, 0.4]);
      return { p, setup: R`A basketball player makes each free throw with probability ${p}, independently, and keeps shooting.`,
        succ: "made shot", succs: "made shots", fail: "miss", fails: "misses", trial: "shot" };
    },
    () => {
      const p = U.pick([0.1, 0.15, 0.2, 0.25]);
      return { p, setup: R`A telemarketer's calls each result in a sale with probability ${p}, independently of one another.`,
        succ: "sale", succs: "sales", fail: "call with no sale", fails: "calls with no sale", trial: "call" };
    },
    () => {
      const c = U.pick([4, 5, 6]);
      return { p: 1 / c, setup: R`A fair ${c}-sided die is rolled repeatedly; a roll of 1 counts as a success.`,
        succ: "roll of 1", succs: "rolls of 1", fail: "other roll", fails: "other rolls", trial: "roll", pTex: R`\frac{1}{${c}}` };
    },
  ];
  const pT = c => c.pTex || U.fmt(c.p, 2);
  const qT = c => (c.pTex ? R`\frac{${Math.round(1 / c.p) - 1}}{${Math.round(1 / c.p)}}` : U.fmt(1 - c.p, 2));

  function poisPmf(lam, k) { return Math.exp(-lam) * Math.pow(lam, k) / U.factorial(k); }
  function poisCdf(lam, k) { let s = 0; for (let j = 0; j <= k; j++) s += poisPmf(lam, j); return s; }

  /* Poisson stories: a rate per `unit`, so λ may need rescaling. */
  const POIS_CTX = [
    { what: "dog walkers pass your bench in the park", per: "hour", evt: "dog walkers" },
    { what: "customers arrive at a coffee-shop counter", per: "hour", evt: "customers" },
    { what: "emails arrive in a shared inbox", per: "hour", evt: "emails" },
    { what: "typos occur in a manuscript", per: "page", evt: "typos" },
    { what: "calls reach a help desk", per: "minute", evt: "calls" },
    { what: "meteors are visible in a clear night sky", per: "hour", evt: "meteors" },
  ];

  const generators = [
    /* ========== 1. Random variables and PMFs from a story ========== */
    MATH340.makeGenerator({
      id: "c3-gen-rv",
      name: "Random variables & their PMFs",
      blurb: "Turn an experiment into a random variable: support, PMF from outcomes, waiting times.",
      variants: [
        {
          name: "Sum of two dice",
          make() {
            const s = U.randInt(3, 11);
            const ways = 6 - Math.abs(s - 7);
            const ans = ways / 36;
            const pairs = [];
            for (let a = 1; a <= 6; a++) { const b = s - a; if (b >= 1 && b <= 6) pairs.push(`(${a},${b})`); }
            return {
              q: R`Two fair six-sided dice are rolled. Let \(S\) be the sum of the two numbers. Find \(P(S = ${s})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(S\) is a function on the 36 equally likely ordered outcomes. The event \(\{S = ${s}\}\) is the set of outcomes that \(S\) maps to ${s}.</div>
                   <div class="sol-step">Those outcomes are ${pairs.join(", ")}: ${ways} of them.</div>
                   <div class="sol-step">$$P(S = ${s}) = \frac{${ways}}{36} ${ways % 36 ? R`= ${U.fracTex(ways, 36)}` : ""} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Maximum or minimum of two dice",
          make() {
            const m = U.randInt(1, 6);
            const isMax = Math.random() < 0.5;
            const ways = isMax ? 2 * m - 1 : 13 - 2 * m;
            const ans = ways / 36;
            return {
              q: R`Two fair six-sided dice are rolled. Let \(${isMax ? "M" : "L"}\) be the <b>${isMax ? "larger" : "smaller"}</b> of the two numbers (if they tie, that common value). Find \(P(${isMax ? "M" : "L"} = ${m})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Count the ordered outcomes \((a, b)\) that the r.v. maps to ${m}: both dice ${isMax ? R`\(\le ${m}\)` : R`\(\ge ${m}\)`}, with at least one equal to ${m}.</div>
                   <div class="sol-step">${isMax
                     ? R`Both \(\le ${m}\): \(${m}^2\) outcomes. Both \(\le ${m - 1}\): \(${(m - 1) * (m - 1)}\). Difference: \(${m * m} - ${(m - 1) * (m - 1)} = ${ways}\).`
                     : R`Both \(\ge ${m}\): \(${7 - m}^2 = ${(7 - m) * (7 - m)}\) outcomes. Both \(\ge ${m + 1}\): \(${(6 - m) * (6 - m)}\). Difference: \(${ways}\).`}</div>
                   <div class="sol-step">$$P = \frac{${ways}}{36} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Heads minus tails",
          make() {
            const n = U.randInt(4, 8);
            const h = U.randInt(0, n);
            const d = 2 * h - n;
            const ans = U.choose(n, h) / Math.pow(2, n);
            return {
              q: R`A fair coin is tossed ${n} times. Let \(D\) = (number of heads) − (number of tails). Find \(P(D = ${d})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Translate the value of \(D\) back into outcomes. With \(H\) heads there are \(${n} - H\) tails, so \(D = H - (${n} - H) = 2H - ${n}\).</div>
                   <div class="sol-step">\(D = ${d} \iff 2H - ${n} = ${d} \iff H = ${h}\).</div>
                   <div class="sol-step">$$P(D = ${d}) = P(H = ${h}) = \frac{\binom{${n}}{${h}}}{2^{${n}}} = \frac{${U.choose(n, h)}}{${Math.pow(2, n)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "PMF from a list of outcomes",
          make() {
            const L = U.randInt(6, 9);
            const vals = Array.from({ length: L }, () => U.pick([0, 0, 0, 1, 1, 2, 2, 3]));
            const target = U.pick(vals);
            const atLeast = Math.random() < 0.4 && target > 0;
            const hits = vals.filter(v => (atLeast ? v >= target : v === target)).length;
            const ans = hits / L;
            const tbl = R`<table class="tbl"><tr><th>Lot</th>${vals.map((_, i) => `<td>${i + 1}</td>`).join("")}</tr>
              <tr><th>Defectives</th>${vals.map(v => `<td>${v}</td>`).join("")}</tr></table>`;
            return {
              q: R`${L} lots of components are ready to ship. The number of defective components in each lot:<br><br>${tbl}<br>One lot is selected at random; let \(X\) be the number of defectives in it. Find \(P(X ${atLeast ? R`\ge` : "="} ${target})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Each <b>lot</b> is an equally likely outcome, and \(X\) maps each lot to its number of defectives. The PMF is (number of lots with that value) / ${L}.</div>
                   <div class="sol-step">Lots with ${atLeast ? R`\(X \ge ${target}\)` : R`\(X = ${target}\)`}: ${hits} of the ${L}.</div>
                   <div class="sol-step">$$P(X ${atLeast ? R`\ge` : "="} ${target}) = \frac{${hits}}{${L}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Waiting time: PMF",
          make() {
            const p = U.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6]);
            const k = U.randInt(2, 6);
            const ans = Math.pow(1 - p, k - 1) * p;
            return {
              q: R`An unfair coin lands tails with probability ${p}. It is tossed repeatedly until the first tail appears. Let \(X\) be the number of tosses needed (including the tail). Find \(P(X = ${k})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X = ${k}\) is the event "the first ${k - 1} tosses are heads and toss ${k} is a tail".</div>
                   <div class="sol-step">The tosses are independent, so multiply: $$P(X = ${k}) = (1 - ${p})^{${k - 1}} \cdot ${p} = (${U.fmt(1 - p, 2)})^{${k - 1}}(${p}) \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">In general \(P(X = k) = (1 - p)^{k - 1} p\) for \(k = 1, 2, \dots\): a discrete r.v. with infinitely many values.</div>`,
            };
          },
        },
        {
          name: "Waiting time: tail probability",
          make() {
            const p = U.pick([0.2, 0.25, 0.3, 0.4, 0.5]);
            const k = U.randInt(2, 6);
            const strict = Math.random() < 0.5;
            const e = strict ? k : k - 1;
            const ans = Math.pow(1 - p, e);
            return {
              q: R`A basketball player keeps shooting until she makes a basket. Each shot goes in with probability ${p}, independently. Let \(X\) be the number of shots she takes. Find \(P(X ${strict ? ">" : R`\ge`} ${k})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Don't sum the infinite tail. Ask what the event <em>means</em>: ${strict ? R`\(X > ${k}\)` : R`\(X \ge ${k}\)`} says the first ${e} shots all miss.</div>
                   <div class="sol-step">$$P(X ${strict ? ">" : R`\ge`} ${k}) = (1 - ${p})^{${e}} = (${U.fmt(1 - p, 2)})^{${e}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Mind the endpoint: \(X \ge ${k}\) is \(X > ${k - 1}\), so it needs only ${k - 1} misses, not ${k}.</div>`,
            };
          },
        },
        {
          name: "Discrete or continuous?",
          make() {
            const BANK = [
              [true, R`the number of unbroken eggs in a randomly chosen carton of 12`, R`finite set \(\{0, \dots, 12\}\)`],
              [true, R`the number of students on a class list absent on the first day`, R`finite set of counts`],
              [true, R`the number of swings a golfer needs before hitting the ball`, R`\(\{1, 2, 3, \dots\}\): infinite, but can be listed`],
              [true, R`the number of times three players must spin their rackets before getting something other than all-up or all-down`, R`\(\{1, 2, 3, \dots\}\): infinite, but can be listed`],
              [true, R`the sales-tax percentage on a randomly selected online purchase`, R`only finitely many tax rates exist, even though they are decimals`],
              [true, R`the number of emails that arrive in an hour`, R`\(\{0, 1, 2, \dots\}\): can be listed`],
              [false, R`the length of a randomly selected rattlesnake`, R`any value in an interval`],
              [false, R`the pH of a randomly chosen soil sample`, R`any value in an interval (roughly 0 to 14)`],
              [false, R`the tension (psi) of a randomly selected tennis racket's strings`, R`any value in an interval`],
              [false, R`the height above sea level at a random point in the continental US`, R`every value in \([-282, 14494]\) feet`],
              [false, R`the time until the next bus arrives`, R`any non-negative real number`],
            ];
            const items = U.sample(BANK, 5);
            const ans = items.filter(i => i[0]).length;
            return {
              q: R`How many of these random variables are <b>discrete</b>?<ol>${items.map(i => `<li>${i[1]}</li>`).join("")}</ol>`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">The question is not "integer or decimal?" but "can the possible values be <b>listed</b>?" A finite or countably infinite set means discrete. All numbers in an interval, with no single value having positive probability, means continuous.</div>
                   <div class="sol-step"><ol>${items.map(i => `<li>${i[0] ? "<b>Discrete</b>" : "<b>Continuous</b>"}: ${i[2]}.</li>`).join("")}</ol></div>
                   <div class="sol-step">${ans} of the 5 are discrete.</div>`,
            };
          },
        },
        {
          name: "Size of the support",
          make() {
            const kind = U.randInt(0, 3);
            let q, ans, sol;
            if (kind === 0) {
              const n = U.randInt(3, 6);
              ans = 5 * n + 1;
              q = R`${n} fair dice are rolled and \(T\) is their total. How many possible values does \(T\) have?`;
              sol = R`<div class="sol-step">Find the smallest and largest values, then check nothing in between is skipped.</div>
                   <div class="sol-step">Smallest: \(${n}\) (all ones). Largest: \(${6 * n}\) (all sixes). Every integer between is reachable by raising one die at a time.</div>
                   <div class="sol-step">\(${6 * n} - ${n} + 1 = ${ans}\) values.</div>`;
            } else if (kind === 1) {
              ans = 6;
              q = R`Two fair dice are rolled and \(Y = |a - b|\) is the absolute difference of the two numbers. How many possible values does \(Y\) have?`;
              sol = R`<div class="sol-step">List the values: the smallest difference is \(0\) (a tie) and the largest is \(6 - 1 = 5\).</div>
                   <div class="sol-step">Support \(\{0, 1, 2, 3, 4, 5\}\): ${ans} values. (Many outcomes, but only 6 values — \(Y\) is not one-to-one.)</div>`;
            } else if (kind === 2) {
              const n = U.randInt(4, 9);
              ans = n + 1;
              q = R`A coin is tossed ${n} times. Let \(D\) = (number of heads) − (number of tails). How many possible values does \(D\) have?`;
              sol = R`<div class="sol-step">\(D = 2H - ${n}\) where \(H \in \{0, 1, \dots, ${n}\}\) is the number of heads.</div>
                   <div class="sol-step">Different \(H\) give different \(D\), so \(D\) has as many values as \(H\): \(${ans}\) (from \(-${n}\) to \(${n}\) in steps of 2).</div>`;
            } else {
              const w = U.randInt(3, 7), b = U.randInt(3, 7);
              const n = U.randInt(Math.max(w, b) - 1, w + b - 2);
              const lo = Math.max(0, n - b), hi = Math.min(n, w);
              ans = hi - lo + 1;
              q = R`An urn has ${w} white and ${b} black balls. ${n} balls are drawn without replacement, and \(X\) is the number of white balls drawn. How many possible values does \(X\) have?`;
              sol = R`<div class="sol-step">\(X \sim \text{HGeom}(${w}, ${b}, ${n})\), whose support is \(\max(0, n - b) \le k \le \min(n, w)\).</div>
                   <div class="sol-step">Smallest: \(\max(0, ${n} - ${b}) = ${lo}\)${n > b ? ` — with only ${b} black balls, at least ${n - b} of the ${n} draws must be white` : ""}. Largest: \(\min(${n}, ${w}) = ${hi}\).</div>
                   <div class="sol-step">\(${hi} - ${lo} + 1 = ${ans}\) values.</div>`;
            }
            return { q, answer: ans, kind: "count", sol };
          },
        },
      ],
    }),

    /* ========== 2. Probabilities from a PMF ========== */
    MATH340.makeGenerator({
      id: "c3-gen-pmf",
      name: "Probabilities from a PMF",
      blurb: "Read events off a PMF table: at least vs more than, ranges, missing values, constants.",
      variants: [
        {
          name: "At least vs. more than",
          make() {
            const c = U.pick(PMF_CTX);
            const { m, xs, ps } = randomPmfTable();
            const a = U.randInt(1, m - 1);
            const form = U.randInt(0, 3); // at least, more than, at most, fewer than
            const [lo, hi, words, sym] = [
              [a, m, `at least ${a}`, R`X \ge ${a}`],
              [a + 1, m, `more than ${a}`, R`X > ${a}`],
              [0, a, `at most ${a}`, R`X \le ${a}`],
              [0, a - 1, `fewer than ${a}`, R`X < ${a}`],
            ][form];
            const ans = pSum(ps, lo, hi) / 100;
            const vals = xs.slice(lo, hi + 1);
            return {
              q: R`Let \(X\) be ${c.X}. Its PMF is<br><br>${pmfTable(xs, ps.map(hund))}<br>What is the probability that <b>${words}</b> ${c.who} ${c.verb}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Translate the words first: "${words}" is \(${sym}\), i.e. \(X \in \{${vals.join(", ")}\}\). ${form === 0 || form === 2 ? "The endpoint is included." : "The endpoint is excluded."}</div>
                   <div class="sol-step">$$P(${sym}) = ${vals.map(v => hund(ps[v])).join(" + ")} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Inclusive vs. exclusive range",
          make() {
            const c = U.pick(PMF_CTX);
            const { m, xs, ps } = randomPmfTable(5, 6);
            const a = U.randInt(0, m - 3), b = U.randInt(a + 2, a === 0 ? m - 1 : m);
            const incl = Math.random() < 0.5;
            const lo = incl ? a : a + 1, hi = incl ? b : b - 1;
            const ans = pSum(ps, lo, hi) / 100;
            const sym = incl ? R`${a} \le X \le ${b}` : R`${a} < X < ${b}`;
            return {
              q: R`Let \(X\) be ${c.X}. Its PMF is<br><br>${pmfTable(xs, ps.map(hund))}<br>Find \(P(${sym})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">${incl ? "Both endpoints are included" : "Both endpoints are excluded"}, so the values are \(\{${xs.slice(lo, hi + 1).join(", ")}\}\).</div>
                   <div class="sol-step">$$P(${sym}) = ${xs.slice(lo, hi + 1).map(v => hund(ps[v])).join(" + ")} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Reframe: counting the ones who don't",
          make() {
            const c = U.pick(PMF_CTX);
            const { m, xs, ps } = randomPmfTable(4, 6);
            const j = U.randInt(1, m - 1);
            const ans = pSum(ps, 0, m - j) / 100;
            return {
              q: R`There are ${m} ${c.who} in total. Let \(X\) be the number of them that ${c.verb}; its PMF is<br><br>${pmfTable(xs, ps.map(hund))}<br>What is the probability that <b>at least ${j}</b> of the ${c.who} <b>${c.neg}</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The question counts the <em>other</em> group. If \(X\) ${c.verb}, then \(${m} - X\) ${c.neg}. Rewrite the event in terms of \(X\).</div>
                   <div class="sol-step">\(${m} - X \ge ${j} \iff X \le ${m - j}\).</div>
                   <div class="sol-step">$$P(X \le ${m - j}) = ${xs.slice(0, m - j + 1).map(v => hund(ps[v])).join(" + ")} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Missing PMF value",
          make() {
            const { m, xs, ps } = randomPmfTable(3, 5);
            const i = U.randInt(0, m);
            const shown = ps.map((p, k) => (k === i ? "?" : hund(p)));
            const ans = ps[i] / 100;
            const X = U.pick(["the number of emails a support agent answers in a minute", "the number of heads showing on a handful of weighted coins", "the number of customers waiting when a bank opens"]);
            return {
              q: R`Let \(X\) be ${X}. Its PMF is given below, with one entry missing:<br><br>${pmfTable(xs, shown)}<br>Find \(P(X = ${i})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">A valid PMF must <b>sum to 1</b> over the support.</div>
                   <div class="sol-step">$$P(X = ${i}) = 1 - (${ps.filter((_, k) => k !== i).map(hund).join(" + ")}) = 1 - ${hund(100 - ps[i])} = ${hund(ps[i])}$$</div>`,
            };
          },
        },
        {
          name: "Normalising constant",
          make() {
            const n = U.randInt(3, 6);
            const shape = U.randInt(0, 2);
            const f = [x => x, x => n + 1 - x, x => x * x][shape];
            const fTex = [R`c\,x`, R`c\,(${n + 1} - x)`, R`c\,x^2`][shape];
            const tot = sum(Array.from({ length: n }, (_, i) => f(i + 1)));
            const k = U.randInt(1, n);
            const ask = Math.random() < 0.5 ? "c" : "pk";
            const ans = ask === "c" ? 1 / tot : f(k) / tot;
            return {
              q: R`A random variable \(X\) has PMF \(p_X(x) = ${fTex}\) for \(x = 1, 2, \dots, ${n}\) (and \(0\) otherwise), where \(c\) is a constant. ${ask === "c" ? R`Find \(c\).` : R`Find \(P(X = ${k})\).`}`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The only thing that pins down \(c\) is that a PMF <b>sums to 1</b>.</div>
                   <div class="sol-step">$$\sum_{x=1}^{${n}} p_X(x) = c\,(${Array.from({ length: n }, (_, i) => f(i + 1)).join(" + ")}) = ${tot}c = 1 \quad\Longrightarrow\quad c = \frac{1}{${tot}}$$</div>
                   ${ask === "c" ? "" : R`<div class="sol-step">$$P(X = ${k}) = \frac{${f(k)}}{${tot}} \approx ${U.fmt(ans)}$$</div>`}`,
            };
          },
        },
        {
          name: "Conditioning on the value of X",
          make() {
            const c = U.pick(PMF_CTX);
            const { m, xs, ps } = randomPmfTable(4, 6);
            const b = U.randInt(1, m - 1), a = U.randInt(b + 1, m);
            const num = pSum(ps, a, m), den = pSum(ps, b, m);
            const ans = num / den;
            return {
              q: R`Let \(X\) be ${c.X}. Its PMF is<br><br>${pmfTable(xs, ps.map(hund))}<br>Given that at least ${b} ${c.who} ${c.verb}, what is the probability that at least ${a} do? That is, find \(P(X \ge ${a} \mid X \ge ${b})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Events about \(X\) are ordinary events, so the Chapter 2 definition applies. Here \(\{X \ge ${a}\} \subseteq \{X \ge ${b}\}\), so the intersection is just \(\{X \ge ${a}\}\).</div>
                   <div class="sol-step">$$P(X \ge ${a} \mid X \ge ${b}) = \frac{P(X \ge ${a})}{P(X \ge ${b})} = \frac{${hund(num)}}{${hund(den)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "An event that is not an interval",
          make() {
            const { m, xs, ps } = randomPmfTable(4, 6);
            const even = Math.random() < 0.5;
            const vals = xs.filter(x => (x % 2 === 0) === even);
            const ans = sum(vals.map(v => ps[v])) / 100;
            return {
              q: R`A random variable \(X\) has the PMF below.<br><br>${pmfTable(xs, ps.map(hund))}<br>Find the probability that \(X\) is <b>${even ? "even" : "odd"}</b>.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Any event about \(X\) is a set of values; add the PMF over that set. ${even ? "Remember that 0 is even." : ""}</div>
                   <div class="sol-step">$$P(X \in \{${vals.join(", ")}\}) = ${vals.map(v => hund(ps[v])).join(" + ")} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 3. Working with a CDF ========== */
    MATH340.makeGenerator({
      id: "c3-gen-cdf",
      name: "Working with a CDF",
      blurb: "Jumps are point masses, F(b) − F(a), endpoints, building a CDF from a PMF.",
      variants: [
        {
          name: "Jump size = point mass",
          make() {
            const C = stepCdf();
            const i = U.randInt(0, C.k - 1);
            const ans = C.ps[i] / 100;
            return {
              q: R`A discrete random variable \(X\) has CDF ${C.tex} Find \(P(X = ${C.xs[i]})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(P(X = x)\) is the <b>size of the jump</b> of \(F\) at \(x\): \(F(x) - F(x^-)\).</div>
                   <div class="sol-step">$$P(X = ${C.xs[i]}) = F(${C.xs[i]}) - F(${C.xs[i]}^-) = ${hund(C.F[i])} - ${hund(C.Fleft(i))} = ${hund(C.ps[i])}$$</div>`,
            };
          },
        },
        {
          name: "Is there a jump here?",
          make() {
            const C = stepCdf();
            // a point strictly between two jumps, or a jump point, 50/50
            const onJump = Math.random() < 0.35;
            let x, ans;
            if (onJump) {
              const i = U.randInt(0, C.k - 1);
              x = C.xs[i]; ans = C.ps[i] / 100;
            } else {
              const i = U.randInt(0, C.k - 2);
              x = (C.xs[i] + C.xs[i + 1]) / 2;
              ans = 0;
            }
            return {
              q: R`A random variable \(X\) has CDF ${C.tex} Find \(P(X = ${x})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Look for a jump of \(F\) at \(x = ${x}\). \(P(X = x) = F(x) - F(x^-)\).</div>
                   <div class="sol-step">${onJump
                     ? R`\(F\) jumps from \(${hund(C.Fat(x) - Math.round(ans * 100))}\) to \(${hund(C.Fat(x))}\) at \(${x}\), so \(P(X = ${x}) = ${U.fmt(ans, 2)}\).`
                     : R`\(${x}\) lies strictly inside a flat piece of \(F\) (\(F = ${hund(C.Fat(x))}\) on both sides), so there is no jump and \(P(X = ${x}) = 0\). The value of \(F\) there is not a point probability.`}</div>`,
            };
          },
        },
        {
          name: "F(b) − F(a)",
          make() {
            const C = stepCdf();
            const i = U.randInt(0, C.k - 2), j = U.randInt(i + 1, C.k - 1);
            const a = C.xs[i], b = C.xs[j];
            const ans = (C.F[j] - C.F[i]) / 100;
            return {
              q: R`A random variable \(X\) has CDF ${C.tex} Find \(P(${a} < X \le ${b})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(<\) on the left and \(\le\) on the right is exactly the shape \(F(b) - F(a)\) counts.</div>
                   <div class="sol-step">$$P(${a} < X \le ${b}) = F(${b}) - F(${a}) = ${hund(C.F[j])} - ${hund(C.F[i])} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Endpoints included or excluded",
          make() {
            const C = stepCdf();
            const i = U.randInt(0, C.k - 2), j = U.randInt(i + 1, C.k - 1);
            const a = C.xs[i], b = C.xs[j];
            let form = U.randInt(0, 2);
            if (form === 0 && i === 0 && j === C.k - 1) form = 1;  // the whole support would give 1
            // [lower F, upper F, symbol, explanation]
            const cfg = [
              [C.Fleft(i), C.F[j], R`${a} \le X \le ${b}`, R`Including \(${a}\) means subtracting \(F(${a}^-)\), the value just <em>before</em> the jump at \(${a}\).`],
              [C.F[i], C.Fleft(j), R`${a} < X < ${b}`, R`Excluding \(${b}\) means using \(F(${b}^-)\), the value just <em>before</em> the jump at \(${b}\).`],
              [C.Fleft(i), C.Fleft(j), R`${a} \le X < ${b}`, R`Include \(${a}\): subtract \(F(${a}^-)\). Exclude \(${b}\): use \(F(${b}^-)\).`],
            ][form];
            const ans = (cfg[1] - cfg[0]) / 100;
            return {
              q: R`A random variable \(X\) has CDF ${C.tex} Find \(P(${cfg[2]})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Start from \(F(b) - F(a)\), which counts \(a < X \le b\), and fix each endpoint that differs. ${cfg[3]}</div>
                   <div class="sol-step">$$P(${cfg[2]}) = ${hund(cfg[1])} - ${hund(cfg[0])} = ${U.fmt(ans, 2)}$$</div>
                   <div class="sol-step">Check with jumps: add the masses at the values of \(X\) inside the range.</div>`,
            };
          },
        },
        {
          name: "Upper tail",
          make() {
            const C = stepCdf();
            const strict = Math.random() < 0.5;
            const i = U.randInt(strict ? 0 : 1, C.k - 2);
            const a = C.xs[i];
            const ans = strict ? (100 - C.F[i]) / 100 : (100 - C.Fleft(i)) / 100;
            return {
              q: R`A random variable \(X\) has CDF ${C.tex} Find \(P(X ${strict ? ">" : R`\ge`} ${a})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Complement: ${strict ? R`\(P(X > a) = 1 - P(X \le a) = 1 - F(a)\).` : R`\(P(X \ge a) = 1 - P(X < a) = 1 - F(a^-)\) — the value just before the jump.`}</div>
                   <div class="sol-step">$$P(X ${strict ? ">" : R`\ge`} ${a}) = 1 - ${strict ? hund(C.F[i]) : hund(C.Fleft(i))} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Build the CDF from a PMF",
          make() {
            const drives = [1, 2, 4, 8, 16];
            const ps = pmfHundredths(5);
            const y = U.pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 20]);
            let F = 0; const used = [];
            drives.forEach((d, i) => { if (d <= y) { F += ps[i]; used.push(i); } });
            const ans = F / 100;
            return {
              q: R`A store sells flash drives with 1, 2, 4, 8, or 16 GB of memory. Let \(Y\) be the memory of a purchased drive, with PMF<br><br>${pmfTable(drives, ps.map(hund), "y", R`p_Y(y)`)}<br>Find the CDF value \(F_Y(${y})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(F_Y(y) = P(Y \le y)\): add the PMF at every support value \(\le ${y}\). The CDF is defined for <em>all</em> real \(y\), not just the support.</div>
                   <div class="sol-step">Values \(\le ${y}\): \(\{${used.map(i => drives[i]).join(", ")}\}\).</div>
                   <div class="sol-step">$$F_Y(${y}) = ${used.map(i => hund(ps[i])).join(" + ")} = ${U.fmt(ans, 2)}$$</div>`,
            };
          },
        },
        {
          name: "Reading a percentile off the CDF",
          make() {
            const C = stepCdf();
            const q = U.pick([0.25, 0.5, 0.75, 0.9]);
            const i = C.F.findIndex(v => v >= q * 100);
            const ans = C.xs[i];
            return {
              q: R`A random variable \(X\) has CDF ${C.tex} What is the smallest value \(x\) with \(F(x) \ge ${q}\)?${q === 0.5 ? " (This is the median of \\(X\\).)" : ""}`,
              answer: ans, kind: "num", tol: 0.001,
              sol: R`<div class="sol-step">Walk up the steps of \(F\) until it first reaches \(${q}\).</div>
                   <div class="sol-step">${C.xs.slice(0, i + 1).map((x, t) => R`\(F(${x}) = ${hund(C.F[t])}\)`).join(", ")}. The first value \(\ge ${q}\) is at \(x = ${ans}\).</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 3b. Bernoulli (Section 3.3, first half) ========== */
    MATH340.makeGenerator({
      id: "c3-gen-bern",
      name: "Bernoulli distribution",
      blurb: "One trial, two outcomes: read p off a rate, estimate it from a record, build it from an event — and spot what is not a Bernoulli trial.",
      variants: [
        {
          name: "Read p off a stated rate",
          make() {
            // one/zero: the opening sentence (3rd person singular); oneC/zeroC: the clauses in the cases.
            const c = U.pick([
              { pct: U.randInt(15, 45), one: R`buys a desktop computer`, zero: R`buys a laptop`, oneC: R`they buy a desktop`, zeroC: R`they buy a laptop`, who: R`The next customer at an electronics store` },
              { pct: U.randInt(80, 96), one: R`succeeds`, zero: R`fails`, oneC: R`the connection succeeds`, zeroC: R`the connection fails`, who: R`An attempt to connect to the university computer system` },
              { pct: U.randInt(2, 9), one: R`is defective`, zero: R`is not defective`, oneC: R`the product is defective`, zeroC: R`the product is not defective`, who: R`The next product off a production line` },
              { pct: U.randInt(3, 12), one: R`is on a bike`, zero: R`is on foot`, oneC: R`they are on a bike`, zeroC: R`they are on foot`, who: R`The next person travelling down a sidewalk` },
            ]);
            const p = c.pct / 100;
            const askZero = Math.random() < 0.6;
            const ans = askZero ? 1 - p : p;
            return {
              q: R`${c.who} ${c.one} with probability \(${c.pct}\%\), and otherwise ${c.zero}. Define $$X = \begin{cases} 1, & \text{if ${c.oneC}}, \\ 0, & \text{if ${c.zeroC}.} \end{cases}$$ Find \(P(X = ${askZero ? 0 : 1})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">One trial with exactly two outcomes, coded 1 and 0: \(X\) is a Bernoulli r.v., and \(p\) is \(P(X = 1)\) — the probability of whatever the problem has <em>labelled</em> 1, whether or not that outcome is "good".</div>
                   <div class="sol-step">$$X \sim \text{Bern}(${U.fmt(p, 2)}), \qquad P(X = 1) = ${U.fmt(p, 2)}, \quad P(X = 0) = 1 - ${U.fmt(p, 2)} = ${U.fmt(1 - p, 2)}.$$</div>
                   <div class="sol-step">So \(P(X = ${askZero ? 0 : 1}) = ${U.fmt(ans, 2)}\). Those two values are the entire PMF.</div>`,
            };
          },
        },
        {
          name: "Estimate p from a record",
          make() {
            const c = U.pick([
              { W: U.randInt(50, 100), L: U.randInt(40, 100), unit: "games", win: "win", lose: "lose", who: "A baseball team" },
              { W: U.randInt(20, 60), L: U.randInt(10, 50), unit: "matches", win: "win", lose: "lose", who: "A tennis player" },
              { W: U.randInt(30, 90), L: U.randInt(5, 40), unit: "launches", win: "succeed", lose: "fail", who: "A rocket programme" },
            ]);
            const T = c.W + c.L;
            const askZero = Math.random() < 0.6;
            const ans = askZero ? c.L / T : c.W / T;
            return {
              q: R`${c.who} has a record of ${c.W}–${c.L} (${c.W} ${c.win}s, ${c.L} losses, in ${T} ${c.unit}). Assume every ${c.unit.replace(/s$/, "")} has the same chance of a ${c.win} and that the ${c.unit} are independent. Let \(X = 1\) if the next one is a ${c.win} and \(X = 0\) otherwise. Using the record to estimate the parameter, find \(P(X = ${askZero ? 0 : 1})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X \sim \text{Bern}(p)\). The record does not <em>give</em> \(p\); it estimates it, and only under the two assumptions stated (constant \(p\), independent trials).</div>
                   <div class="sol-step">$$p \approx \frac{\text{${c.win}s}}{\text{total}} = \frac{${c.W}}{${c.W} + ${c.L}} = ${U.fracTex(c.W, T)} \approx ${U.fmt(c.W / T, 4)}$$</div>
                   <div class="sol-step">${askZero ? R`$$P(X = 0) = 1 - p = \frac{${c.L}}{${T}} = ${U.fracTex(c.L, T)} \approx ${U.fmt(ans, 4)}$$` : R`$$P(X = 1) = p = ${U.fracTex(c.W, T)} \approx ${U.fmt(ans, 4)}$$`}</div>`,
            };
          },
        },
        {
          name: "From one trial to a series (Binomial)",
          make: sane(() => {
            const c = U.pick([
              { W: U.randInt(50, 100), L: U.randInt(40, 100), unit: "games", win: "win", who: "A baseball team" },
              { W: U.randInt(20, 60), L: U.randInt(10, 50), unit: "matches", win: "win", who: "A tennis player" },
            ]);
            const T = c.W + c.L, p = c.W / T;
            const n = U.randInt(4, 12), k = U.randInt(1, n - 1);
            const ans = binPmf(n, k, p);
            return {
              q: R`${c.who} has a record of ${c.W}–${c.L}. Treat each ${c.unit.replace(/s$/, "")} as an independent Bernoulli trial whose success probability is estimated from the record. They now play a series of ${n} ${c.unit}. What is the probability that they ${c.win} exactly ${k} of them?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Each ${c.unit.replace(/s$/, "")} is one \(\text{Bern}(p)\) trial with \(p \approx ${c.W}/${T} \approx ${U.fmt(p, 4)}\). A fixed number \(n = ${n}\) of independent trials with the same \(p\): the <b>number of ${c.win}s</b> is Binomial.</div>
                   <div class="sol-step">$$X \sim \text{Bin}(${n}, ${U.fmt(p, 4)}), \qquad P(X = ${k}) = \binom{${n}}{${k}}(${U.fmt(p, 4)})^{${k}}(${U.fmt(1 - p, 4)})^{${n - k}} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Bernoulli is the one-trial case: \(\text{Bin}(1, p) = \text{Bern}(p)\), and a sum of \(n\) i.i.d. Bernoullis is \(\text{Bin}(n, p)\).</div>`,
            };
          }),
        },
        {
          name: "Bernoulli built from a uniform outcome",
          make() {
            const d = U.pick([6, 8, 10, 12, 20]);
            const form = U.randInt(0, 2);
            let evt, count, list;
            if (form === 0) {
              const m = U.randInt(Math.ceil(d / 2), d - 1);
              evt = R`the roll is at least ${m}`; count = d - m + 1;
              list = R`\(\{${m}, \dots, ${d}\}\), which has \(${d} - ${m} + 1 = ${count}\) values`;
            } else if (form === 1) {
              const m = U.randInt(2, Math.floor(d / 2));
              evt = R`the roll is at most ${m}`; count = m;
              list = R`\(\{1, \dots, ${m}\}\), which has \(${count}\) values`;
            } else {
              const q = U.pick([3, 4, 5].filter(x => x < d));
              evt = R`the roll is a multiple of ${q}`; count = Math.floor(d / q);
              list = R`\(\{${Array.from({ length: count }, (_, i) => (i + 1) * q).join(", ")}\}\): \(\lfloor ${d}/${q} \rfloor = ${count}\) values`;
            }
            const ans = count / d;
            return {
              q: R`A fair ${d}-sided die is rolled once. Let \(X = 1\) if ${evt}, and \(X = 0\) otherwise. Identify the distribution of \(X\) and find its parameter \(p = P(X = 1)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X\) is the <b>indicator</b> of the event \(A = \{\text{${evt}}\}\), so \(X \sim \text{Bern}(p)\) with \(p = P(A)\). The roll itself is \(\text{DUnif}(\{1, \dots, ${d}\})\), so \(P(A)\) is a count over \(${d}\).</div>
                   <div class="sol-step">Favourable rolls: ${list}.</div>
                   <div class="sol-step">$$p = P(A) = \frac{${count}}{${d}} = ${U.fracTex(count, d)} \approx ${U.fmt(ans, 4)}, \qquad X \sim \text{Bern}\!\left(${U.fracTex(count, d)}\right).$$</div>`,
            };
          },
        },
        {
          name: "Indicator of a complement, union or difference",
          make() {
            const v = U.venn2();
            const form = U.randInt(0, 2);
            const cfg = [
              { expr: R`1 - I_A`, event: R`A^c`, ans: 1 - v.pa, calc: R`P(A^c) = 1 - ${hund(v.pct.a)} = ${U.fmt(1 - v.pa, 2)}` },
              { expr: R`\max(I_A, I_B)`, event: R`A \cup B`, ans: v.union, calc: R`P(A \cup B) = P(A) + P(B) - P(A \cap B) = ${hund(v.pct.a)} + ${hund(v.pct.b)} - ${hund(v.pct.both)} = ${U.fmt(v.union, 2)}` },
              { expr: R`I_A(1 - I_B)`, event: R`A \cap B^c`, ans: v.onlyA, calc: R`P(A \cap B^c) = P(A) - P(A \cap B) = ${hund(v.pct.a)} - ${hund(v.pct.both)} = ${U.fmt(v.onlyA, 2)}` },
            ][form];
            return {
              q: R`Events \(A\) and \(B\) have \(P(A) = ${hund(v.pct.a)}\), \(P(B) = ${hund(v.pct.b)}\) and \(P(A \cap B) = ${hund(v.pct.both)}\). Let \(I_A, I_B\) be their indicators and define \(Y = ${cfg.expr}\). \(Y\) is a Bernoulli r.v.; find its parameter \(P(Y = 1)\).`,
              answer: cfg.ans, kind: "prob",
              sol: R`<div class="sol-step">Indicators only take the values 0 and 1, so work out <em>which event</em> makes \(Y = 1\). Here \(Y = ${cfg.expr}\) equals 1 exactly when \(${cfg.event}\) occurs: \(Y = I_{${cfg.event}}\).</div>
                   <div class="sol-step">An indicator is \(\text{Bern}(p)\) with \(p\) the probability of its event: $$P(Y = 1) = ${cfg.calc}.$$</div>
                   <div class="sol-step">The indicator identities to keep handy: \(I_{A^c} = 1 - I_A\), \(I_{A \cap B} = I_A I_B\), \(I_{A \cup B} = I_A + I_B - I_A I_B = \max(I_A, I_B)\).</div>`,
            };
          },
        },
        {
          name: "Bernoulli trial or not?",
          make() {
            const BANK = [
              [true, R`toss a coin and record H or T`, R`two outcomes`],
              [true, R`inspect one product and record whether it is defective`, R`two outcomes: defective / not`],
              [true, R`try to connect to the university computer system and record whether the connection succeeds`, R`two outcomes: success / failure`],
              [true, R`roll a die and record whether it shows a six`, R`two outcomes: six / not six (the die has six faces, but you only record one yes/no)`],
              [true, R`ask a customer whether they bought a desktop (yes or no)`, R`two outcomes`],
              [true, R`check whether a randomly chosen student is absent on the first day`, R`two outcomes: absent / present`],
              [false, R`roll a die and record the face showing`, R`six outcomes`],
              [false, R`count the defective items in a lot of 20`, R`\(21\) possible counts; it is a <em>sum</em> of 20 Bernoulli trials`],
              [false, R`toss a coin five times and record the number of heads`, R`six possible values, \(\text{Bin}(5, p)\), not a single trial`],
              [false, R`record whether a customer buys a laptop, a desktop, or nothing`, R`three outcomes`],
              [false, R`measure the time until the connection is established`, R`a continuous measurement`],
              [false, R`keep tossing a coin and record how many tosses the first tail takes`, R`infinitely many values; a sequence of trials, not one`],
            ];
            const items = U.sample(BANK, 5);
            const ans = items.filter(i => i[0]).length;
            return {
              q: R`A <b>Bernoulli trial</b> is an experiment with exactly two outcomes, success or failure. How many of these are Bernoulli trials?<ol>${items.map(i => `<li>${i[1]}</li>`).join("")}</ol>`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">Ask "how many outcomes does <em>one</em> run of this record?" Exactly two means a Bernoulli trial. A count of successes over several runs, a face value, a measurement or a three-way choice is not — even if it is <em>built from</em> Bernoulli trials.</div>
                   <div class="sol-step"><ol>${items.map(i => `<li>${i[0] ? "<b>Bernoulli</b>" : "<b>Not Bernoulli</b>"}: ${i[2]}.</li>`).join("")}</ol></div>
                   <div class="sol-step">${ans} of the 5 are Bernoulli trials. Any yes/no question about an outcome is one: \(X = I_A \sim \text{Bern}(P(A))\).</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 4. Binomial ========== */
    MATH340.makeGenerator({
      id: "c3-gen-binom",
      name: "Binomial distribution",
      blurb: "Fixed n independent trials with constant p: exactly, at least, at most, failures.",
      variants: [
        {
          name: "Exactly k successes",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const k = U.randInt(2, c.n - 1);
            const ans = binPmf(c.n, k, c.p);
            return {
              q: R`${c.setup} Let \(X\) be ${c.X}. What is the probability of exactly ${k} ${c.succ}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Fixed number of independent trials, each a success or failure with the same probability: \(X \sim \text{Bin}(${c.n}, p)\) with ${c.pWhy}.</div>
                   <div class="sol-step">$$P(X = ${k}) = ${binTex(c.n, k, c.p)} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">\(\binom{${c.n}}{${k}} = ${U.choose(c.n, k)}\) counts which trials are the successes; each such sequence has the same probability.</div>`,
            };
          }),
        },
        {
          name: "At least one (complement)",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const ans = 1 - Math.pow(1 - c.p, c.n);
            return {
              q: R`${c.setup} Let \(X\) be ${c.X}. Find \(P(X \ge 1)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">"At least one" has ${c.n} terms; its complement, \(X = 0\), has one.</div>
                   <div class="sol-step">$$P(X \ge 1) = 1 - P(X = 0) = 1 - (${U.fmt(1 - c.p, 2)})^{${c.n}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "At most k (sum of terms)",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const k = U.randInt(1, Math.min(3, c.n - 2));
            let ans = 0; const terms = [];
            for (let j = 0; j <= k; j++) { ans += binPmf(c.n, j, c.p); terms.push(U.fmt(binPmf(c.n, j, c.p), 4)); }
            return {
              q: R`${c.setup} Let \(X\) be ${c.X}. Find the probability of <b>at most ${k}</b> ${c.succ}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X \sim \text{Bin}(${c.n}, ${U.fmt(c.p, 2)})\) (${c.pWhy}). "At most ${k}" is \(X \le ${k}\): add the PMF for \(k = 0, \dots, ${k}\).</div>
                   <div class="sol-step">$$P(X \le ${k}) = \sum_{j=0}^{${k}} \binom{${c.n}}{j}(${U.fmt(c.p, 2)})^j(${U.fmt(1 - c.p, 2)})^{${c.n} - j}$$</div>
                   <div class="sol-step">$$= ${terms.join(" + ")} \approx ${U.fmt(ans)}$$ This is the CDF value \(F_X(${k})\).</div>`,
            };
          }),
        },
        {
          name: "At least k (complement of a short sum)",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const k = U.randInt(2, 3);
            let low = 0; const terms = [];
            for (let j = 0; j < k; j++) { low += binPmf(c.n, j, c.p); terms.push(U.fmt(binPmf(c.n, j, c.p), 4)); }
            const ans = 1 - low;
            return {
              q: R`${c.setup} Let \(X\) be ${c.X}. Find the probability of <b>at least ${k}</b> ${c.succ}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(P(X \ge ${k})\) has \(${c.n - k + 1}\) terms; the complement \(X \le ${k - 1}\) has only ${k}. Go through the complement.</div>
                   <div class="sol-step">$$P(X \le ${k - 1}) = ${terms.join(" + ")} \approx ${U.fmt(low)}$$</div>
                   <div class="sol-step">$$P(X \ge ${k}) = 1 - ${U.fmt(low)} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Counting failures instead",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const j = U.randInt(2, c.n - 1);
            const ans = binPmf(c.n, c.n - j, c.p);
            return {
              q: R`${c.setup} What is the probability of exactly ${j} ${c.fail}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The number of failures is \(${c.n} - X \sim \text{Bin}(${c.n}, 1 - p)\), where \(X\) is ${c.X} and ${c.pWhy}.</div>
                   <div class="sol-step">Exactly ${j} failures \(\iff X = ${c.n - j}\): $$P = \binom{${c.n}}{${j}}(${U.fmt(1 - c.p, 2)})^{${j}}(${U.fmt(c.p, 2)})^{${c.n - j}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">A common slip is plugging \(k = ${j}\) into the success PMF, which answers a different question.</div>`,
            };
          }),
        },
        {
          name: "The k-th success on the last trial",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const k = U.randInt(2, Math.min(4, c.n - 1));
            const ans = U.choose(c.n - 1, k - 1) * Math.pow(c.p, k) * Math.pow(1 - c.p, c.n - k);
            return {
              q: R`${c.setup} What is the probability that there are exactly ${k} ${c.succ} <b>and the last one happens on trial ${c.n}</b> (the final trial is a success)?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The last trial is pinned down, so only the first \(${c.n - 1}\) trials are free: they must contain exactly \(${k - 1}\) ${U.plural(k - 1, "success", "successes")}.</div>
                   <div class="sol-step">By independence, multiply by the last success: $$\binom{${c.n - 1}}{${k - 1}}(${U.fmt(c.p, 2)})^{${k - 1}}(${U.fmt(1 - c.p, 2)})^{${c.n - k}} \cdot ${U.fmt(c.p, 2)} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Compare \(P(X = ${k}) = \binom{${c.n}}{${k}}\cdots\): fixing a position reduces \(\binom{${c.n}}{${k}}\) to \(\binom{${c.n - 1}}{${k - 1}}\).</div>`,
            };
          }),
        },
        {
          name: "Which trials? Conditioning on the total",
          make: sane(function () {
            const c = U.pick(BIN_CTX)();
            const k = U.randInt(2, c.n - 1);
            const ans = k / c.n;
            return {
              q: R`${c.setup} Given that there were exactly ${k} ${c.succ} in total, what is the probability that the <b>first</b> trial was one of them?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Given \(X = ${k}\), every arrangement of ${k} successes among ${c.n} trials has the same probability \(p^{${k}}q^{${c.n - k}}\), so all \(\binom{${c.n}}{${k}}\) arrangements are <b>equally likely</b> and \(p\) drops out.</div>
                   <div class="sol-step">$$P(\text{trial 1 success} \mid X = ${k}) = \frac{p \cdot \binom{${c.n - 1}}{${k - 1}} p^{${k - 1}}q^{${c.n - k}}}{\binom{${c.n}}{${k}} p^{${k}} q^{${c.n - k}}} = \frac{\binom{${c.n - 1}}{${k - 1}}}{\binom{${c.n}}{${k}}} = \frac{${k}}{${c.n}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Urn with replacement",
          make: sane(function () {
            const w = U.randInt(3, 8), b = U.randInt(3, 8);
            const n = U.randInt(4, 7);
            const k = U.randInt(2, n - 1);
            const p = w / (w + b);
            const ans = binPmf(n, k, p);
            return {
              q: R`An urn contains ${w} white and ${b} black balls. A ball is drawn at random, its colour noted, and it is <b>put back</b>; this is done ${n} times. Find the probability that exactly ${k} white balls are observed.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step"><b>With replacement</b> the urn is the same before every draw, so the draws are independent with constant \(p = \frac{${w}}{${w + b}}\): \(X \sim \text{Bin}\left(${n}, \frac{${w}}{${w + b}}\right)\), not Hypergeometric.</div>
                   <div class="sol-step">$$P(X = ${k}) = \binom{${n}}{${k}}\left(\frac{${w}}{${w + b}}\right)^{${k}}\left(\frac{${b}}{${w + b}}\right)^{${n - k}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
      ],
    }),

    /* ========== 5. Hypergeometric ========== */
    MATH340.makeGenerator({
      id: "c3-gen-hgeom",
      name: "Hypergeometric distribution",
      blurb: "Sampling without replacement: urns, committees, capture–recapture, card hands, support.",
      variants: [
        {
          name: "Exactly k of one type",
          make: sane(function () {
            const c = U.pick(HG_CTX)();
            const n = U.randInt(3, Math.min(6, c.w + c.b - 2));
            const lo = Math.max(0, n - c.b), hi = Math.min(n, c.w);
            const k = U.randInt(Math.max(lo, 1), hi);
            const ans = hgeomPmf(c.w, c.b, n, k);
            return {
              q: R`${c.setup(c.w, c.b, n)} Find the probability that exactly ${k} of the selected ${c.obj} are ${c.white}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Two types, a fixed sample, <b>no replacement</b>: the number of ${c.white} is \(X \sim \text{HGeom}(${c.w}, ${c.b}, ${n})\).</div>
                   <div class="sol-step">Choose the ${k} ${c.white} and, separately, the other ${n - k} from the ${c.black}; divide by all samples of size ${n}.</div>
                   <div class="sol-step">$$P(X = ${k}) = ${hgTex(c.w, c.b, n, k)} = \frac{${U.choose(c.w, k)} \cdot ${U.choose(c.b, n - k)}}{${U.choose(c.w + c.b, n)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Capture–recapture",
          make: sane(function () {
            const [N, m, n] = U.pick([[400, 40, 50], [300, 30, 40], [500, 50, 40], [200, 25, 30], [250, 20, 40], [600, 60, 50]]);
            const k = U.randInt(1, 6);
            const ans = hgeomPmf(m, N - m, n, k);
            const animal = U.pick([["elk", "forest"], ["fish", "lake"], ["deer", "reserve"], ["turtles", "pond"]]);
            return {
              q: R`A ${animal[1]} has ${N} ${animal[0]}. Yesterday ${m} were captured, tagged, and released. Today ${n} are captured at random, each subset of ${n} equally likely. What is the probability that exactly ${k} of today's ${animal[0]} are tagged?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Tagged ${animal[0]} are the "white balls" (\(w = ${m}\)) and untagged the "black balls" (\(b = ${N - m}\)). Today's catch is \(n = ${n}\) drawn without replacement: \(X \sim \text{HGeom}(${m}, ${N - m}, ${n})\).</div>
                   <div class="sol-step">$$P(X = ${k}) = ${hgTex(m, N - m, n, k)} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Numbers this large need a calculator or software. Setting up the right ratio is the part the exam tests.</div>`,
            };
          }),
        },
        {
          name: "Card hands",
          make: sane(function () {
            const kind = U.pick(["hearts", "aces", "face cards"]);
            const w = kind === "hearts" ? 13 : kind === "aces" ? 4 : 12;
            const n = U.pick([5, 5, 13]);
            const k = U.randInt(kind === "aces" ? 1 : 1, Math.min(kind === "aces" ? 3 : 4, n));
            const ans = hgeomPmf(w, 52 - w, n, k);
            return {
              q: R`A ${n}-card hand is dealt from a well-shuffled standard 52-card deck. Find the probability that the hand contains exactly ${k} ${kind}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">There are ${w} ${kind} (the "white balls") and \(${52 - w}\) other cards. A hand is a draw without replacement: \(X \sim \text{HGeom}(${w}, ${52 - w}, ${n})\).</div>
                   <div class="sol-step">$$P(X = ${k}) = ${hgTex(w, 52 - w, n, k)} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "At least one (complement)",
          make: sane(function () {
            const c = U.pick(HG_CTX)();
            const n = U.randInt(3, Math.min(6, c.b));
            const p0 = hgeomPmf(c.w, c.b, n, 0);
            const ans = 1 - p0;
            return {
              q: R`${c.setup(c.w, c.b, n)} Find the probability that <b>at least one</b> of the selected ${c.obj} is ${c.one}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Complement: "none are ${c.white}" means all ${n} come from the ${c.b} ${c.black}.</div>
                   <div class="sol-step">$$P(X = 0) = \frac{\binom{${c.b}}{${n}}}{\binom{${c.w + c.b}}{${n}}} = \frac{${U.choose(c.b, n)}}{${U.choose(c.w + c.b, n)}} \approx ${U.fmt(p0)}$$</div>
                   <div class="sol-step">$$P(X \ge 1) = 1 - ${U.fmt(p0)} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Acceptance sampling (at most c)",
          make: sane(function () {
            const N = U.pick([20, 25, 30]), D = U.randInt(3, 6), n = U.randInt(4, 6), c = U.randInt(0, 1);
            let ans = 0; const terms = [];
            for (let j = 0; j <= c; j++) { ans += hgeomPmf(D, N - D, n, j); terms.push(hgTex(D, N - D, n, j)); }
            return {
              q: R`A shipment of ${N} circuit boards contains ${D} defective boards. The buyer tests ${n} boards chosen at random (without replacement) and accepts the shipment if <b>${c === 0 ? "none" : "at most one"}</b> of them is defective. What is the probability the shipment is accepted?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Number of defectives tested: \(X \sim \text{HGeom}(${D}, ${N - D}, ${n})\). Accept \(\iff X \le ${c}\).</div>
                   <div class="sol-step">$$P(X \le ${c}) = ${terms.join(" + ")} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Check the support first",
          make() {
            const w = U.randInt(4, 8), b = U.randInt(3, 5);
            const n = U.randInt(b + 1, Math.min(w + b - 1, b + 4));
            const lo = n - b, hi = Math.min(n, w);
            const inside = Math.random() < 0.5;
            const k = inside ? U.randInt(lo, hi) : U.randInt(0, lo - 1);
            const ans = hgeomPmf(w, b, n, k);
            return {
              q: R`An urn contains ${w} white and ${b} black balls. ${n} balls are drawn without replacement. Find the probability that exactly ${k} of them are white.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Before using the formula, check that \(k = ${k}\) is possible. The draw has ${n - k} black balls, and there are only ${b} black balls in the urn.</div>
                   <div class="sol-step">${inside
                     ? R`\(${n - k} \le ${b}\), so it is possible: $$P(X = ${k}) = ${hgTex(w, b, n, k)} \approx ${U.fmt(ans)}$$`
                     : R`\(${n - k} > ${b}\): impossible. At least \(${n} - ${b} = ${lo}\) of the draws must be white, so \(P(X = ${k}) = 0\). (The formula agrees, since \(\binom{${b}}{${n - k}} = 0\).)`}</div>`,
            };
          },
        },
        {
          name: "Counting the other type",
          make: sane(function () {
            const c = U.pick(HG_CTX)();
            const n = U.randInt(3, Math.min(6, c.w + c.b - 2));
            const lo = Math.max(0, n - c.w), hi = Math.min(n, c.b);
            const j = U.randInt(Math.max(lo, 1), hi);
            const ans = hgeomPmf(c.b, c.w, n, j);
            return {
              q: R`${c.setup(c.w, c.b, n)} Find the probability that exactly ${j} of the selected ${c.obj} are ${c.black}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Either relabel (the ${c.black} are now the "white balls": \(\text{HGeom}(${c.b}, ${c.w}, ${n})\)) or note that ${j} ${c.black} means \(${n - j}\) ${c.white}.</div>
                   <div class="sol-step">$$P = \frac{\binom{${c.b}}{${j}}\binom{${c.w}}{${n - j}}}{\binom{${c.w + c.b}}{${n}}} = \frac{${U.choose(c.b, j)} \cdot ${U.choose(c.w, n - j)}}{${U.choose(c.w + c.b, n)}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Pair each \(\binom{\cdot}{\cdot}\) with its own group: the number chosen from a group sits under that group's size.</div>`,
            };
          }),
        },
      ],
    }),

    /* ========== 6. Discrete Uniform (Section 3.5) ========== */
    MATH340.makeGenerator({
      id: "c3-gen-dunif",
      name: "Discrete Uniform distribution",
      blurb: "Equally likely values: single values, subsets, divisibility, CDFs — and when it does NOT apply.",
      variants: [
        {
          name: "Probability of one value",
          make() {
            const c = U.pick([
              { lo: 1, hi: U.randInt(8, 20), what: R`a raffle ticket numbered \(1\) to \(N\) is drawn at random`, unit: "ticket number" },
              { lo: 1, hi: U.randInt(10, 30), what: R`a locker is chosen at random from lockers numbered \(1\) to \(N\)`, unit: "locker number" },
            ]);
            const N = c.hi, k = U.randInt(c.lo, N);
            const ans = 1 / N;
            return {
              q: R`Let \(X\) be the ${c.unit} when ${c.what.replace("\\(N\\)", "\\(" + N + "\\)")}. Find \(P(X = ${k})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">"At random" over a finite list with nothing to distinguish its members means \(X \sim \text{DUnif}(\{1, \dots, ${N}\})\): every value is equally likely.</div>
                   <div class="sol-step">$$P(X = ${k}) = \frac{1}{|C|} = \frac{1}{${N}} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">The particular value ${k} is irrelevant — under a uniform distribution every value in the support has the same probability.</div>`,
            };
          },
        },
        {
          name: "Probability of a range",
          make() {
            const N = U.randInt(10, 24);
            const a = U.randInt(1, N - 4), b = U.randInt(a + 2, Math.min(N, a + 8));
            const count = b - a + 1;
            const ans = count / N;
            return {
              q: R`\(X \sim \text{DUnif}(\{1, 2, \dots, ${N}\})\). Find \(P(${a} \le X \le ${b})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">For a uniform r.v. every probability is a <b>count</b> divided by the size of the support: \(P(X \in A) = |A| / |C|\).</div>
                   <div class="sol-step">The event \(\{${a} \le X \le ${b}\}\) contains \(${b} - ${a} + 1 = ${count}\) values (count the endpoints — that \(+1\) is the usual slip).</div>
                   <div class="sol-step">$$P = \frac{${count}}{${N}} \approx ${U.fmt(ans, 5)}$$</div>`,
            };
          },
        },
        {
          name: "Divisibility",
          make() {
            const N = U.pick([20, 24, 30, 36, 40, 48, 50, 60]);
            const d = U.pick([2, 3, 4, 5, 6]);
            const count = Math.floor(N / d);
            const ans = count / N;
            return {
              q: R`An integer \(X\) is chosen uniformly at random from \(\{1, 2, \dots, ${N}\}\). What is the probability that \(X\) is divisible by ${d}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Uniform, so count the favourable values: the multiples of ${d} in \(\{1, \dots, ${N}\}\) are \(${d}, 2\cdot${d}, \dots\), and there are \(\lfloor ${N}/${d} \rfloor = ${count}\) of them.</div>
                   <div class="sol-step">$$P = \frac{${count}}{${N}} \approx ${U.fmt(ans, 5)}$$</div>`,
            };
          },
        },
        {
          name: "Uniform on an arbitrary set",
          make() {
            const pool = U.shuffle([3, 5, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24]).slice(0, U.randInt(5, 7)).sort((x, y) => x - y);
            const thresh = pool[U.randInt(1, pool.length - 2)];
            const count = pool.filter(v => v > thresh).length;
            const ans = count / pool.length;
            return {
              q: R`\(X \sim \text{DUnif}(C)\) where \(C = \{${pool.join(", ")}\}\). Find \(P(X > ${thresh})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The support need not be a run of consecutive integers — uniform just means all \(${pool.length}\) listed values are equally likely, each with probability \(1/${pool.length}\).</div>
                   <div class="sol-step">Values exceeding \(${thresh}\): \(${pool.filter(v => v > thresh).join(", ") || "none"}\) — that is \(${count}\) of them.</div>
                   <div class="sol-step">$$P(X > ${thresh}) = \frac{${count}}{${pool.length}} \approx ${U.fmt(ans, 5)}$$</div>`,
            };
          },
        },
        {
          name: "CDF of a uniform",
          make() {
            const N = U.randInt(8, 16);
            const k = U.randInt(2, N - 1);
            const ans = k / N;
            return {
              q: R`\(X \sim \text{DUnif}(\{1, 2, \dots, ${N}\})\). Evaluate its CDF at ${k}, that is \(F(${k}) = P(X \le ${k})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(\{X \le ${k}\}\) is the set \(\{1, 2, \dots, ${k}\}\), which has \(${k}\) elements.</div>
                   <div class="sol-step">$$F(${k}) = \frac{${k}}{${N}} \approx ${U.fmt(ans, 5)}$$ In general \(F(x) = \lfloor x \rfloor / ${N}\) for \(1 \le x \le ${N}\): a staircase of \(${N}\) equal steps.</div>`,
            };
          },
        },
        {
          name: "Not uniform: the total of two dice",
          make() {
            const t = U.randInt(3, 11);
            let count = 0;
            for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === t) count++;
            const ans = count / 36;
            return {
              q: R`Two fair dice are rolled and \(T\) is the total. A classmate says "\(T\) takes 11 values, so \(P(T = ${t}) = 1/11\)." Compute the correct value of \(P(T = ${t})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The 36 <b>outcomes</b> \((a, b)\) are equally likely; the 11 <b>totals</b> are not. \(T\) is a function of a uniform pair, and a function of a uniform r.v. is generally not uniform.</div>
                   <div class="sol-step">Count the ordered pairs summing to ${t}: there are \(${count}\).</div>
                   <div class="sol-step">$$P(T = ${t}) = \frac{${count}}{36} \approx ${U.fmt(ans, 5)} \quad \text{(not } 1/11 \approx 0.0909\text{)}$$</div>`,
            };
          },
        },
        {
          name: "Slips of paper: with vs. without replacement",
          make() {
            const N = U.pick([50, 60, 80, 100, 120]), n = U.randInt(3, 8);
            const withR = Math.random() < 0.5;
            const ans = withR ? 1 - Math.pow((N - 1) / N, n) : n / N;
            return {
              q: R`A hat holds ${N} slips numbered \(1, \dots, ${N}\). ${n} slips are drawn at random, <b>${withR ? "with replacement" : "without replacement"}</b>. What is the probability that the slip numbered ${N} is drawn at least once?`,
              answer: ans, kind: "prob",
              sol: withR
                ? R`<div class="sol-step">With replacement, each draw is \(\text{DUnif}(\{1, \dots, ${N}\})\) and the draws are independent, so slip ${N} can appear more than once — no simple count of "slots". Use the complement.</div>
                   <div class="sol-step">$$P(\text{drawn at least once}) = 1 - P(\text{never}) = 1 - \left(\frac{${N - 1}}{${N}}\right)^{${n}} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Slightly less than \(${n}/${N}\): with replacement some draws are wasted on repeats.</div>`
                : R`<div class="sol-step">Without replacement, each \(j\)th draw is still \(\text{DUnif}(\{1, \dots, ${N}\})\) by symmetry, and the events "draw \(j\) is slip ${N}" are <b>disjoint</b> — a slip can only come out once.</div>
                   <div class="sol-step">$$P(\text{slip ${N} drawn}) = \sum_{j=1}^{${n}} \frac{1}{${N}} = \frac{${n}}{${N}} \approx ${U.fmt(ans, 5)}$$ Equivalently \(\binom{${N - 1}}{${n - 1}} / \binom{${N}}{${n}} = ${n}/${N}\).</div>`,
            };
          },
        },
        {
          name: "Numbered from a to b: count the support",
          make() {
            if (Math.random() < 0.5) {
              // Choosing a partner: students numbered 2..hi, you are number 1.
              const hi = U.randInt(8, 15);
              const size = hi - 2 + 1;
              const friends = U.sample(Array.from({ length: size }, (_, i) => i + 2), U.randInt(2, 3)).sort((x, y) => x - y);
              const ans = friends.length / size;
              return {
                q: R`The students in your class are randomly numbered \(2\) to \(${hi}\) (you are number \(1\)). The teacher picks your partner uniformly at random from these students; let \(X\) be your partner's number. Your friends are numbers \(${friends.join(", ")}\). What is the probability that your partner is one of your friends?`,
                answer: ans, kind: "prob",
                sol: R`<div class="sol-step">\(X \sim \text{DUnif}(\{2, \dots, ${hi}\})\). The support starts at 2, so count it: \(|C| = ${hi} - 2 + 1 = ${size}\), not \(${hi}\).</div>
                     <div class="sol-step">The PMF is \(P(X = x) = 1/${size}\) for \(x = 2, \dots, ${hi}\). The friends form a subset \(A\) with \(|A| = ${friends.length}\).</div>
                     <div class="sol-step">$$P(X \in A) = \frac{|A|}{|C|} = \frac{${friends.length}}{${size}} \approx ${U.fmt(ans, 5)}$$</div>`,
              };
            }
            // Dorm-room lottery: rooms f01..fNN on floor f.
            const f = U.randInt(2, 7), last = U.randInt(24, 40);
            const lo = f * 100 + 1, hi = f * 100 + last;
            const size = hi - lo + 1;
            const form = U.randInt(0, 2);
            let evt, count, how;
            if (form === 0) {
              evt = R`an <b>even</b>-numbered room`; count = Math.floor(last / 2);
              how = R`the even rooms are \(${lo + 1}, ${lo + 3}, \dots, ${lo + 1 + 2 * (count - 1)}\): \(${count}\) of them`;
            } else if (form === 1) {
              evt = R`an <b>odd</b>-numbered room`; count = Math.ceil(last / 2);
              how = R`the odd rooms are \(${lo}, ${lo + 2}, \dots, ${lo + 2 * (count - 1)}\): \(${count}\) of them`;
            } else {
              const t = U.randInt(lo + 5, hi - 5);
              evt = R`a room numbered <b>\(${t}\) or higher</b>`; count = hi - t + 1;
              how = R`rooms \(${t}, \dots, ${hi}\): \(${hi} - ${t} + 1 = ${count}\) of them (count both ends)`;
            }
            const ans = count / size;
            return {
              q: R`In the dorm lottery you will be on floor ${f}, with an equal chance of getting any room from \(${lo}\) to \(${hi}\). Let \(X\) be your room number. What is the probability that you get ${evt}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X \sim \text{DUnif}(\{${lo}, \dots, ${hi}\})\), so every probability is a count over \(|C|\). Count the support from its first label: \(|C| = ${hi} - ${lo} + 1 = ${size}\) rooms.</div>
                   <div class="sol-step">Favourable rooms: ${how}.</div>
                   <div class="sol-step">$$P = \frac{${count}}{${size}} \approx ${U.fmt(ans, 5)}$$</div>`,
            };
          },
        },
        {
          name: "Conditioning keeps it uniform",
          make() {
            const N = U.randInt(10, 20);
            const a = U.randInt(2, N - 4);
            const remaining = N - a;
            const k = U.randInt(a + 1, N);
            const ans = 1 / remaining;
            return {
              q: R`\(X \sim \text{DUnif}(\{1, \dots, ${N}\})\). Given that \(X > ${a}\), find \(P(X = ${k} \mid X > ${a})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Use the definition: \(P(X = ${k} \mid X > ${a}) = P(X = ${k},\ X > ${a}) / P(X > ${a})\). Since \(${k} > ${a}\), the numerator is just \(P(X = ${k}) = 1/${N}\).</div>
                   <div class="sol-step">\(\{X > ${a}\}\) contains \(${N} - ${a} = ${remaining}\) values, so \(P(X > ${a}) = ${remaining}/${N}\).</div>
                   <div class="sol-step">$$P = \frac{1/${N}}{${remaining}/${N}} = \frac{1}{${remaining}} \approx ${U.fmt(ans, 5)}$$ Conditioning a uniform r.v. on a subset leaves it <b>uniform on that subset</b> — the \(${N}\)s cancel.</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 7. Functions of a random variable (Section 3.7) ========== */
    MATH340.makeGenerator({
      id: "c3-gen-transform",
      name: "Functions of a random variable",
      blurb: "PMF of Y = g(X): shifts, squares, absolute values, capping — and when values collapse.",
      variants: [
        {
          name: "Linear transform (one-to-one)",
          make() {
            const { xs, ps } = randomPmfTable(3, 4);
            const a = U.pick([2, 3, -1, -2]), b = U.pick([-3, -1, 1, 4]);
            const i = U.randInt(0, xs.length - 1);
            const y = a * xs[i] + b;
            const ans = ps[i] / 100;
            const coef = a === 1 ? "" : a === -1 ? "-" : String(a);   // "-1X" is not how anyone writes it
            const shift = b >= 0 ? `+ ${b}` : `- ${-b}`;
            const gx = `${coef}x ${shift}`;
            return {
              q: R`A random variable \(X\) has the PMF below. ${pmfTable(xs, ps.map(hund))} Let \(Y = ${coef}X ${shift}\). Find \(P(Y = ${y})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(g(x) = ${gx}\) is <b>one-to-one</b>, so exactly one value of \(X\) produces each value of \(Y\) — no probabilities get added together.</div>
                   <div class="sol-step">Solve \(${gx} = ${y}\) to get \(x = ${xs[i]}\).</div>
                   <div class="sol-step">$$P(Y = ${y}) = P(X = ${xs[i]}) = ${hund(ps[i])}$$</div>`,
            };
          },
        },
        {
          name: "Squaring collapses values",
          make() {
            const xs = [-2, -1, 0, 1, 2];
            const ps = pmfHundredths(5);
            const y = U.pick([1, 4]);
            const r = Math.sqrt(y);
            const iNeg = xs.indexOf(-r), iPos = xs.indexOf(r);
            const ans = (ps[iNeg] + ps[iPos]) / 100;
            return {
              q: R`\(X\) takes values in \(\{-2, -1, 0, 1, 2\}\) with the PMF below. ${pmfTable(xs, ps.map(hund))} Let \(Y = X^2\). Find \(P(Y = ${y})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(g(x) = x^2\) is <b>not</b> one-to-one: \(${-r}\) and \(${r}\) both map to \(${y}\). Collect every \(x\) with \(g(x) = ${y}\) and <b>add</b> their probabilities.</div>
                   <div class="sol-step">$$P(Y = ${y}) = P(X = ${-r}) + P(X = ${r}) = ${hund(ps[iNeg])} + ${hund(ps[iPos])} = ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">The support shrinks from 5 values to 3: \(Y \in \{0, 1, 4\}\).</div>`,
            };
          },
        },
        {
          name: "Absolute value",
          make() {
            const xs = [-3, -2, -1, 0, 1, 2, 3];
            const ps = pmfHundredths(7);
            const y = U.randInt(1, 3);
            const iNeg = xs.indexOf(-y), iPos = xs.indexOf(y);
            const ans = (ps[iNeg] + ps[iPos]) / 100;
            return {
              q: R`\(X\) has the PMF below. ${pmfTable(xs, ps.map(hund))} Let \(Y = |X|\). Find \(P(Y = ${y})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(|X| = ${y}\) exactly when \(X = ${y}\) or \(X = ${-y}\) — two disjoint events, so the probabilities add.</div>
                   <div class="sol-step">$$P(Y = ${y}) = ${hund(ps[iNeg])} + ${hund(ps[iPos])} = ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Only \(y = 0\) would come from a single value of \(X\); every other \(y\) pools two.</div>`,
            };
          },
        },
        {
          name: "Capping creates an atom",
          make() {
            const { xs, ps } = randomPmfTable(5, 6);
            const c = U.randInt(2, xs.length - 2);
            const idx = xs.map((x, i) => i).filter(i => xs[i] >= c);
            const ans = sum(idx.map(i => ps[i])) / 100;
            return {
              q: R`\(X\) has the PMF below. ${pmfTable(xs, ps.map(hund))} Let \(Y = \min(X, ${c})\) — values above \(${c}\) are capped at \(${c}\). Find \(P(Y = ${c})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(Y = ${c}\) whenever \(X\) is \(${c}\) <em>or anything larger</em>, since everything above the cap is pushed down onto it.</div>
                   <div class="sol-step">$$P(Y = ${c}) = P(X \ge ${c}) = ${idx.map(i => hund(ps[i])).join(" + ")} = ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Capping piles the whole upper tail onto one value — that is why \(Y\) has a large "atom" at \(${c}\) even though \(X\) did not.</div>`,
            };
          },
        },
        {
          name: "Size of the transformed support",
          make() {
            const lo = U.pick([-3, -4, -5]);
            const hi = U.randInt(2, 4);
            const xs = [];
            for (let v = lo; v <= hi; v++) xs.push(v);
            const ys = new Set(xs.map(v => v * v));
            const ans = ys.size;
            return {
              q: R`\(X\) takes each integer value in \(\{${lo}, ${lo + 1}, \dots, ${hi}\}\) with positive probability. How many <b>distinct</b> values can \(Y = X^2\) take?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">The support of \(Y\) is the <b>image</b> \(\{x^2 : x \in \text{support}(X)\}\) — squaring, then discarding duplicates.</div>
                   <div class="sol-step">\(X\) has \(${xs.length}\) values; their squares are \(\{${[...ys].sort((a, b) => a - b).join(", ")}\}\), which is \(${ans}\) distinct values.</div>
                   <div class="sol-step">Values \(x\) and \(-x\) collapse together, so the support shrinks whenever the range straddles \(0\).</div>`,
            };
          },
        },
        {
          name: "Transform of a uniform",
          make() {
            const N = U.randInt(6, 12);
            const ys = new Set();
            for (let x = 1; x <= N; x++) ys.add(x % 3);
            const target = U.randInt(0, 2);
            let count = 0;
            for (let x = 1; x <= N; x++) if (x % 3 === target) count++;
            const ans = count / N;
            return {
              q: R`\(X \sim \text{DUnif}(\{1, \dots, ${N}\})\) and \(Y\) is the remainder when \(X\) is divided by 3. Find \(P(Y = ${target})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(Y = g(X)\) with \(g(x) = x \bmod 3\), which is far from one-to-one — gather every \(x\) it sends to \(${target}\).</div>
                   <div class="sol-step">In \(\{1, \dots, ${N}\}\) there are \(${count}\) such values, each of probability \(1/${N}\).</div>
                   <div class="sol-step">$$P(Y = ${target}) = \frac{${count}}{${N}} \approx ${U.fmt(ans, 5)}$$ Note \(Y\) is <b>not</b> uniform unless 3 divides \(${N}\).</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 8. Independence of random variables & indicators (Section 3.8) ========== */
    MATH340.makeGenerator({
      id: "c3-gen-indep-rv",
      name: "Independence of random variables & indicators",
      blurb: "Factor the joint PMF, i.i.d. draws, and indicator algebra.",
      variants: [
        {
          name: "Joint probability under independence",
          make() {
            const n1 = U.randInt(3, 6), n2 = U.randInt(3, 6);
            const x = U.randInt(1, n1), y = U.randInt(1, n2);
            const ans = (1 / n1) * (1 / n2);
            return {
              q: R`A fair \(${n1}\)-sided die and a fair \(${n2}\)-sided die are rolled independently. Let \(X\) and \(Y\) be the two results. Find \(P(X = ${x},\ Y = ${y})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Independence of random variables means the joint PMF <b>factors</b> for every pair of values: \(P(X = x, Y = y) = P(X = x)P(Y = y)\).</div>
                   <div class="sol-step">$$P(X = ${x},\ Y = ${y}) = \frac{1}{${n1}} \cdot \frac{1}{${n2}} = \frac{1}{${n1 * n2}} \approx ${U.fmt(ans, 5)}$$</div>`,
            };
          },
        },
        {
          name: "Check independence from a joint table",
          make() {
            const indep = Math.random() < 0.5;
            const px = U.randInt(3, 7) / 10;                  // P(X = 0)
            const py = U.randInt(3, 7) / 10;                  // P(Y = 0)
            const ans = px * py;
            /* A joint probability is not free to be any number: it has to sit
             * inside the Frechet bounds max(0, px + py - 1) <= joint <= min(px, py),
             * or the table it came from could not exist (P(X=0 or Y=0) would
             * exceed 1). With both marginals in [0.3, 0.7] that window is always
             * at least 0.3 wide, so the two offsets below stay well clear of the
             * product and the dependent case is never ambiguous. */
            const lo = Math.max(0, px + py - 1), hi = Math.min(px, py);
            const joint = indep ? ans
              : U.round(lo + (hi - lo) * (Math.random() < 0.5 ? 0.15 : 0.85), 3);
            return {
              q: R`\(X\) and \(Y\) each take the values \(0\) and \(1\). You are told \(P(X = 0) = ${U.fmt(px, 2)}\), \(P(Y = 0) = ${U.fmt(py, 2)}\) and \(P(X = 0,\ Y = 0) = ${U.fmt(joint, 3)}\). Compute the value \(P(X = 0)P(Y = 0)\) that the joint probability would have to equal for \(X\) and \(Y\) to be independent.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Independence is the statement that the joint PMF factors, so compute the right-hand side and compare it with what you were given.</div>
                   <div class="sol-step">$$P(X = 0)P(Y = 0) = ${U.fmt(px, 2)} \times ${U.fmt(py, 2)} = ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">The stated joint probability is \(${U.fmt(joint, 3)}\), so \(X\) and \(Y\) are <b>${indep ? "independent at this pair" : "dependent"}</b>.${indep ? R` (To conclude full independence you would still have to check the other three pairs — one pair factoring is not enough.)` : R` A single pair that fails to factor already settles it.`}</div>`,
            };
          },
        },
        {
          name: "i.i.d. draws: all the same",
          make() {
            const n = U.randInt(2, 4);
            const N = U.randInt(4, 8);
            const ans = Math.pow(1 / N, n - 1);
            return {
              q: R`\(X_1, \dots, X_${n}\) are i.i.d., each uniform on \(\{1, \dots, ${N}\}\). What is the probability that all \(${n}\) take the <b>same</b> value?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Split by the common value: \(P(\text{all equal}) = \sum_{k=1}^{${N}} P(X_1 = k, \dots, X_${n} = k)\).</div>
                   <div class="sol-step">By independence each joint term factors into \((1/${N})^{${n}}\), and there are \(${N}\) values of \(k\):</div>
                   <div class="sol-step">$$P = ${N} \left(\frac{1}{${N}}\right)^{${n}} = \left(\frac{1}{${N}}\right)^{${n - 1}} \approx ${U.fmt(ans, 5)}$$ Equivalently: the first draw can be anything, and each later one must match it.</div>`,
            };
          },
        },
        {
          name: "Indicator of an intersection",
          make() {
            const pa = U.randInt(30, 70) / 100, pb = U.randInt(30, 70) / 100;
            const ans = pa * pb;
            return {
              q: R`\(A\) and \(B\) are independent events with \(P(A) = ${U.fmt(pa, 2)}\) and \(P(B) = ${U.fmt(pb, 2)}\). Let \(I_A\) and \(I_B\) be their indicator random variables. Find \(P(I_A I_B = 1)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Indicators take only the values 0 and 1, so the product \(I_A I_B\) equals 1 exactly when <b>both</b> are 1 — that is, \(I_A I_B = I_{A \cap B}\).</div>
                   <div class="sol-step">$$P(I_A I_B = 1) = P(A \cap B) = P(A)P(B) = ${U.fmt(pa, 2)} \times ${U.fmt(pb, 2)} = ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">Worth remembering alongside \(I_A^2 = I_A\) and \(I_{A^c} = 1 - I_A\).</div>`,
            };
          },
        },
        {
          name: "Sum of indicators is Binomial",
          make() {
            const n = U.randInt(4, 8);
            const p = U.randInt(2, 8) / 10;
            const k = U.randInt(1, n - 1);
            const ans = binPmf(n, k, p);
            return {
              q: R`\(A_1, \dots, A_${n}\) are independent events, each of probability \(${U.fmt(p, 2)}\). Let \(X = I_{A_1} + \cdots + I_{A_${n}}\). Find \(P(X = ${k})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X\) counts how many of the \(${n}\) events occur. Each indicator is \(\text{Bern}(${U.fmt(p, 2)})\) and they are independent, which is exactly the Binomial story:</div>
                   <div class="sol-step">$$X \sim \text{Bin}(${n}, ${U.fmt(p, 2)}), \qquad P(X = ${k}) = ${binTex(n, k, p)} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">A sum of i.i.d. Bernoullis <em>is</em> a Binomial — that is where the \(\binom{n}{k}\) comes from: it counts which of the events occurred.</div>`,
            };
          },
        },
        {
          name: "Dependent despite identical distributions",
          make() {
            const w = U.randInt(3, 6), b = U.randInt(3, 6);
            const n = w + b;
            const ans = (w / n) * ((w - 1) / (n - 1));
            return {
              q: R`An urn holds ${w} red and ${b} blue balls. Two balls are drawn <b>without replacement</b>. Let \(X_1, X_2\) indicate whether the first and second draws are red. Find \(P(X_1 = 1,\ X_2 = 1)\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">These draws are <b>identically distributed</b> — both are red with probability \(${w}/${n}\) — but they are <b>not independent</b>, so the joint probability does not factor. Use the chain rule.</div>
                   <div class="sol-step">$$P(X_1 = 1, X_2 = 1) = \frac{${w}}{${n}} \cdot \frac{${w - 1}}{${n - 1}} \approx ${U.fmt(ans, 5)}$$</div>
                   <div class="sol-step">The product \(P(X_1 = 1)P(X_2 = 1) = (${w}/${n})^2 = ${U.fmt((w / n) * (w / n), 5)}\) is a <em>different</em> number — which is precisely what "dependent" means. The "i.d." in i.i.d. does not give you the "i.".</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 9. Geometric & Negative Binomial (Section 4.3) ========== */
    MATH340.makeGenerator({
      id: "c3-gen-geom",
      name: "Geometric & Negative Binomial",
      blurb: "Waiting for the first (or r-th) success: failures before, tails, CDF, memorylessness.",
      variants: [
        {
          name: "The n-th trial is the first success",
          make: sane(function () {
            const c = U.pick(GEOM_CTX)();
            const n = U.randInt(3, 10);
            const ans = Math.pow(1 - c.p, n - 1) * c.p;
            return {
              q: R`${c.setup} What is the probability that the <b>${n}th</b> ${c.trial} is the first ${c.succ}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Let \(X \sim \text{Geom}(${pT(c)})\) be the number of ${c.fails} <em>before</em> the first ${c.succ}. "The ${n}th ${c.trial} is the first ${c.succ}" means exactly \(${n - 1}\) ${c.fails} come first, i.e. \(X = ${n - 1}\) — not \(X = ${n}\).</div>
                   <div class="sol-step">$$P(X = ${n - 1}) = q^{${n - 1}}p = \left(${qT(c)}\right)^{${n - 1}}\left(${pT(c)}\right) \approx ${U.fmt(ans)}$$</div>`,
            };
          }, 0.005),
        },
        {
          name: "Exactly k failures first",
          make: sane(function () {
            const c = U.pick(GEOM_CTX)();
            const k = U.randInt(0, 8);
            const ans = Math.pow(1 - c.p, k) * c.p;
            return {
              q: R`${c.setup} Let \(X\) be the number of ${c.fails} seen before the first ${c.succ}. Find \(P(X = ${k})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Independent trials with constant success probability, counting failures before the first success: \(X \sim \text{Geom}(p)\) with \(p = ${pT(c)}\).</div>
                   <div class="sol-step">\(X = ${k}\) is one specific sequence: ${k} ${U.plural(k, c.fail, c.fails)}, then a ${c.succ}. $$P(X = ${k}) = q^{${k}}p = \left(${qT(c)}\right)^{${k}}\left(${pT(c)}\right) \approx ${U.fmt(ans)}$$</div>`,
            };
          }, 0.005),
        },
        {
          name: "No success in the first k trials (tail)",
          make: sane(function () {
            const c = U.pick(GEOM_CTX)();
            const k = U.randInt(3, 12);
            const ans = Math.pow(1 - c.p, k);
            return {
              q: R`${c.setup} What is the probability that the first ${k} ${U.plural(k, c.trial)} include <b>no</b> ${c.succ} at all?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">In terms of \(X \sim \text{Geom}(${pT(c)})\), the failures before the first success, this is \(P(X \ge ${k})\). Summing \(q^j p\) from \(j = ${k}\) to \(\infty\) works, but there is a shortcut.</div>
                   <div class="sol-step">\(X \ge ${k}\) happens exactly when the first ${k} trials all fail, and they are independent: $$P(X \ge ${k}) = q^{${k}} = \left(${qT(c)}\right)^{${k}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Geometric CDF: at most k failures",
          make: sane(function () {
            const c = U.pick(GEOM_CTX)();
            const k = U.randInt(1, 8);
            const ans = 1 - Math.pow(1 - c.p, k + 1);
            return {
              q: R`${c.setup} Let \(X\) be the number of ${c.fails} before the first ${c.succ}. Find \(P(X \le ${k})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X \sim \text{Geom}(${pT(c)})\), whose CDF is \(F(x) = 1 - q^{\lfloor x \rfloor + 1}\) for \(x \ge 0\).</div>
                   <div class="sol-step">Why: \(X \le ${k}\) fails only if the first \(${k + 1}\) trials are all failures, so \(P(X \le ${k}) = 1 - q^{${k + 1}}\). The exponent is \(k + 1\), not \(k\) — \(X = 0\) is a value too.</div>
                   <div class="sol-step">$$P(X \le ${k}) = 1 - \left(${qT(c)}\right)^{${k + 1}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Memoryless: after m failures",
          make: sane(function () {
            const c = U.pick(GEOM_CTX)();
            const m = U.randInt(3, 8), k = U.randInt(2, 6);
            const ans = Math.pow(1 - c.p, k);
            return {
              q: R`${c.setup} The first ${m} ${U.plural(m, c.trial)} have all been ${c.fails}. Given that, what is the probability that there are <b>at least ${k} more</b> ${c.fails} before the first ${c.succ}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">With \(X \sim \text{Geom}(${pT(c)})\) we want \(P(X \ge ${m + k} \mid X \ge ${m})\). Both events are tails: \(P(X \ge j) = q^j\).</div>
                   <div class="sol-step">$$P(X \ge ${m + k} \mid X \ge ${m}) = \frac{q^{${m + k}}}{q^{${m}}} = q^{${k}} = \left(${qT(c)}\right)^{${k}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">The ${m} past failures drop out completely — the <b>memoryless property</b>. The trials are independent, so the process has no memory of its bad luck.</div>`,
            };
          }),
        },
        {
          name: "Failures before the r-th success (NBin)",
          make: sane(function () {
            const c = U.pick(GEOM_CTX)();
            const r = U.randInt(2, 4), n = U.randInt(2, 12);
            const ans = U.choose(n + r - 1, r - 1) * Math.pow(c.p, r) * Math.pow(1 - c.p, n);
            return {
              q: R`${c.setup} What is the probability of seeing exactly ${n} ${c.fails} before the <b>${r === 2 ? "2nd" : r === 3 ? "3rd" : r + "th"}</b> ${c.succ}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Failures before the \(r\)th success: \(X \sim \text{NBin}(${r}, ${pT(c)})\), with \(P(X = n) = \binom{n + r - 1}{r - 1}p^r q^n\).</div>
                   <div class="sol-step">The last of the \(${n + r}\) trials must be success number ${r}. The first \(${n + r - 1}\) hold the other \(${r - 1}\) ${U.plural(r - 1, "success", "successes")} in any positions: \(\binom{${n + r - 1}}{${r - 1}} = ${U.choose(n + r - 1, r - 1)}\) ways.</div>
                   <div class="sol-step">$$P(X = ${n}) = \binom{${n + r - 1}}{${r - 1}}\left(${pT(c)}\right)^{${r}}\left(${qT(c)}\right)^{${n}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }, 0.003),
        },
        {
          name: "The r-th success on trial n",
          make: sane(function () {
            const c = U.pick(GEOM_CTX)();
            const r = U.randInt(2, 4), N = U.randInt(r + 2, r + 10);
            const ans = U.choose(N - 1, r - 1) * Math.pow(c.p, r) * Math.pow(1 - c.p, N - r);
            return {
              q: R`${c.setup} What is the probability that the ${r === 2 ? "2nd" : r === 3 ? "3rd" : r + "th"} ${c.succ} happens on ${c.trial} number <b>${N}</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Translate to failures: the ${r === 2 ? "2nd" : r === 3 ? "3rd" : r + "th"} success on trial ${N} means \(${N} - ${r} = ${N - r}\) failures before it, so this is \(P(X = ${N - r})\) for \(X \sim \text{NBin}(${r}, ${pT(c)})\).</div>
                   <div class="sol-step">Trial ${N} is a success; trials \(1, \dots, ${N - 1}\) contain exactly \(${r - 1}\) successes: $$\binom{${N - 1}}{${r - 1}}\left(${pT(c)}\right)^{${r}}\left(${qT(c)}\right)^{${N - r}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Not \(\binom{${N}}{${r}}\): that would be the Binomial "${r} successes somewhere in ${N} trials", which allows the last one to come early.</div>`,
            };
          }, 0.003),
        },
        {
          name: "Sum of two Geometrics is NBin",
          make: sane(function () {
            const c = U.pick(GEOM_CTX)();
            const n = U.randInt(2, 10);
            const ans = (n + 1) * c.p * c.p * Math.pow(1 - c.p, n);
            return {
              q: R`${c.setup} Let \(X_1\) be the number of ${c.fails} before the first ${c.succ}, and \(X_2\) the number of ${c.fails} between the first and second ${c.succs}. Find \(P(X_1 + X_2 = ${n})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X_1, X_2\) are i.i.d. \(\text{Geom}(${pT(c)})\) — after the first success the process starts afresh. By Theorem 4.3.10 their sum is the number of failures before the 2nd success: \(X_1 + X_2 \sim \text{NBin}(2, ${pT(c)})\).</div>
                   <div class="sol-step">$$P(X_1 + X_2 = ${n}) = \binom{${n} + 1}{1}p^2q^{${n}} = ${n + 1}\left(${pT(c)}\right)^2\left(${qT(c)}\right)^{${n}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Check by brute force: \(\sum_{j=0}^{${n}} P(X_1 = j)P(X_2 = ${n} - j) = \sum_{j=0}^{${n}} q^j p \cdot q^{${n} - j}p = (${n + 1})p^2q^{${n}}\) — every split of the ${n} failures has the same probability.</div>`,
            };
          }, 0.005),
        },
      ],
    }),

    /* ========== 10. Poisson (Section 4.7) ========== */
    MATH340.makeGenerator({
      id: "c3-gen-pois",
      name: "Poisson distribution",
      blurb: "Counts at a rate: exactly k, at most k, at least one, rescaling λ, approximating a Binomial.",
      variants: [
        {
          name: "Exactly k events",
          make: sane(function () {
            const c = U.pick(POIS_CTX);
            const lam = U.randInt(2, 10), k = Math.max(0, lam + U.randInt(-3, 3));
            const ans = poisPmf(lam, k);
            return {
              q: R`On average ${lam} ${c.what} per ${c.per}. Let \(X\) be the number of ${c.evt} in the next ${c.per}. Find \(P(X = ${k})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">A count of events in a fixed interval at a steady rate: \(X \sim \text{Pois}(\lambda)\) with \(\lambda = ${lam}\), the expected count in <em>one ${c.per}</em>.</div>
                   <div class="sol-step">$$P(X = ${k}) = \frac{e^{-${lam}}\,${lam}^{${k}}}{${k}!} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "At most k (Poisson CDF)",
          make: sane(function () {
            const c = U.pick(POIS_CTX);
            const lam = U.randInt(2, 7), k = U.randInt(1, 3);
            const terms = []; for (let j = 0; j <= k; j++) terms.push(U.fmt(poisPmf(lam, j), 4));
            const ans = poisCdf(lam, k);
            return {
              q: R`On average ${lam} ${c.what} per ${c.per}. Find the probability of <b>at most ${k}</b> ${c.evt} in a given ${c.per}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X \sim \text{Pois}(${lam})\). "At most ${k}" is the CDF value \(F(${k}) = \sum_{j=0}^{${k}} e^{-${lam}}${lam}^j / j!\).</div>
                   <div class="sol-step">$$P(X \le ${k}) = ${terms.join(" + ")} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Don't forget the \(j = 0\) term, \(e^{-${lam}}\): zero events is a possible value.</div>`,
            };
          }),
        },
        {
          name: "At least one (complement)",
          make: sane(function () {
            const c = U.pick(POIS_CTX);
            const lam = U.pick([0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]);
            const ans = 1 - Math.exp(-lam);
            return {
              q: R`On average ${lam} ${c.what} per ${c.per}. What is the probability of <b>at least one</b> of the ${c.evt} in a given ${c.per}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X \sim \text{Pois}(${lam})\). "At least one" is an infinite sum; its complement \(X = 0\) is a single term.</div>
                   <div class="sol-step">$$P(X \ge 1) = 1 - P(X = 0) = 1 - e^{-${lam}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Rescale the rate to the interval",
          make: sane(function () {
            const c = U.pick(POIS_CTX.filter(x => x.per === "hour"));
            const rate = U.pick([4, 6, 8, 10, 12]);
            const [len, lenTxt, frac] = U.pick([[0.5, "30 minutes", R`\tfrac{1}{2}`], [0.25, "15 minutes", R`\tfrac{1}{4}`], [2, "2 hours", "2"], [1.5, "90 minutes", R`\tfrac{3}{2}`]]);
            const lam = rate * len;
            const k = Math.max(0, Math.round(lam) + U.randInt(-2, 1));
            const ans = poisPmf(lam, k);
            return {
              q: R`On average ${rate} ${c.what} per hour. What is the probability that exactly ${k} ${c.evt} arrive in the next <b>${lenTxt}</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The Poisson parameter is the expected count <em>in the interval asked about</em>, not the hourly rate: \(\lambda = ${rate} \times ${frac} = ${U.fmt(lam)}\).</div>
                   <div class="sol-step">$$P(X = ${k}) = \frac{e^{-${U.fmt(lam)}}\,(${U.fmt(lam)})^{${k}}}{${k}!} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Plugging in \(\lambda = ${rate}\) is the classic slip — it answers the question for a one-hour window.</div>`,
            };
          }),
        },
        {
          name: "More than k (strict inequality)",
          make: sane(function () {
            const c = U.pick(POIS_CTX);
            const lam = U.randInt(1, 5), k = U.randInt(1, 3);
            const terms = []; for (let j = 0; j <= k; j++) terms.push(U.fmt(poisPmf(lam, j), 4));
            const ans = 1 - poisCdf(lam, k);
            return {
              q: R`On average ${lam} ${c.what} per ${c.per}. Find the probability of <b>more than ${k}</b> ${c.evt} in a given ${c.per}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X \sim \text{Pois}(${lam})\). "More than ${k}" is \(X \ge ${k + 1}\) — an infinite upper tail, so take the complement \(X \le ${k}\).</div>
                   <div class="sol-step">$$P(X \le ${k}) = ${terms.join(" + ")} \approx ${U.fmt(1 - ans)}$$</div>
                   <div class="sol-step">$$P(X > ${k}) = 1 - F(${k}) \approx ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Poisson approximation to a Binomial",
          make: sane(function () {
            const [n, p] = U.pick([[500, 0.004], [1000, 0.002], [200, 0.01], [400, 0.005], [800, 0.0025], [300, 0.01], [1000, 0.003]]);
            const lam = n * p;
            const k = U.randInt(0, Math.round(lam) + 1);
            const ans = poisPmf(lam, k);
            const exact = binPmf(n, k, p);
            return {
              q: R`A factory ships ${n} items; each is defective with probability ${p}, independently. Using the <b>Poisson approximation</b>, estimate the probability that exactly ${k} items are defective.`,
              answer: ans, kind: "prob", tol: Math.max(0.002, Math.abs(ans - exact) + 0.0006),
              sol: R`<div class="sol-step">Exactly, \(X \sim \text{Bin}(${n}, ${p})\): many trials, each a rare event. Then \(X\) is approximately \(\text{Pois}(\lambda)\) with \(\lambda = np = ${n} \times ${p} = ${U.fmt(lam)}\).</div>
                   <div class="sol-step">$$P(X = ${k}) \approx \frac{e^{-${U.fmt(lam)}}\,${U.fmt(lam)}^{${k}}}{${k}!} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">The exact Binomial value is \(${U.fmt(exact)}\) — the approximation is good because \(n\) is large and \(p\) is small.</div>`,
            };
          }),
        },
        {
          name: "Most likely count (mode)",
          make() {
            const c = U.pick(POIS_CTX);
            const lam = U.pick([2.4, 3.7, 4.5, 5.2, 6.8, 7.5, 1.6, 8.3]);
            const ans = Math.floor(lam);
            return {
              q: R`On average ${lam} ${c.what} per ${c.per}. Which count \(k\) is the <b>most likely</b> number of ${c.evt} in a given ${c.per}? (Give the value of \(k\) that maximises \(P(X = k)\).)`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">\(X \sim \text{Pois}(${lam})\). Compare consecutive probabilities: $$\frac{P(X = k)}{P(X = k - 1)} = \frac{e^{-\lambda}\lambda^k / k!}{e^{-\lambda}\lambda^{k-1}/(k-1)!} = \frac{\lambda}{k}.$$</div>
                   <div class="sol-step">The PMF increases while \(\lambda / k > 1\), i.e. while \(k < ${lam}\), and decreases after. So the peak is at the largest integer below \(\lambda\): \(k = \lfloor ${lam} \rfloor = ${ans}\).</div>`,
            };
          },
        },
        {
          name: "The Binomial limit (deriving the PMF)",
          make() {
            const lam = U.pick([1, 2, 3, 0.5, 1.5, 2.5]);
            const k = U.randInt(0, 3);
            const ans = poisPmf(lam, k);
            return {
              q: R`For each \(n\), let \(X_n \sim \text{Bin}\left(n, \frac{${lam}}{n}\right)\). Find \(\displaystyle\lim_{n \to \infty} P(X_n = ${k})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(np = ${lam}\) stays fixed while \(n \to \infty\) and \(p \to 0\): this is exactly the setting where the Binomial PMF converges to the Poisson PMF with \(\lambda = ${lam}\).</div>
                   <div class="sol-step">$$P(X_n = ${k}) = \frac{${lam}^{${k}}}{${k}!}\left[\frac{n(n-1)\cdots(n-${k}+1)}{n^{${k}}}\right]\left(1 - \frac{${lam}}{n}\right)^{n}\left(1 - \frac{${lam}}{n}\right)^{-${k}}$$ The bracket \(\to 1\), \(\left(1 - \frac{${lam}}{n}\right)^{n} \to e^{-${lam}}\), and the last factor \(\to 1\).</div>
                   <div class="sol-step">$$\lim_{n \to \infty} P(X_n = ${k}) = \frac{e^{-${lam}}\,${lam}^{${k}}}{${k}!} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Work backwards from P(X = 0)",
          make() {
            const c = U.pick(POIS_CTX);
            const p0 = U.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]);
            const lam = -Math.log(p0);
            const askK = U.randInt(1, 2);
            const ans = poisPmf(lam, askK);
            return {
              q: R`The number of ${c.evt} in a ${c.per} is Poisson with an unknown rate. In ${Math.round(p0 * 100)}% of ${c.per}s there are <b>none</b> at all. What is the probability of exactly ${askK} in a given ${c.per}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(P(X = 0) = e^{-\lambda}\), so the "none" rate pins down \(\lambda\): \(e^{-\lambda} = ${p0} \Rightarrow \lambda = -\ln ${p0} \approx ${U.fmt(lam)}\).</div>
                   <div class="sol-step">$$P(X = ${askK}) = e^{-\lambda}\frac{\lambda^{${askK}}}{${askK}!} = ${p0} \times \frac{(${U.fmt(lam)})^{${askK}}}{${askK}!} \approx ${U.fmt(ans)}$$ Notice \(e^{-\lambda}\) is already known — you never need to exponentiate.</div>`,
            };
          },
        },
      ],
    }),

    /* ========== 11. Functions of two r.v.s & independence (Sections 3.7–3.8) ========== */
    MATH340.makeGenerator({
      id: "c3-gen-two-rv",
      name: "Functions of two random variables",
      blurb: "g(X, Y), comparing two r.v.s, extremes of many, and what independence does and doesn't give you.",
      variants: [
        {
          name: "Comparing two r.v.s: P(X > Y)",
          make: sane(function () {
            const xs = [0, 1, 2, 3], px = pmfHundredths(4), py = pmfHundredths(4);
            let tot = 0; const terms = [];
            for (let i = 0; i < 4; i++) {
              let below = 0; for (let j = 0; j < i; j++) below += py[j];
              if (below) { tot += px[i] * below; terms.push(R`${hund(px[i])}(${hund(below)})`); }
            }
            const ans = tot / 10000;
            return {
              q: R`\(X\) and \(Y\) are independent with the PMFs below. Find \(P(X > Y)\).<br><br>${pmfTable(xs, px.map(hund), "x", R`P(X = x)`)}<br>${pmfTable(xs, py.map(hund), "y", R`P(Y = y)`)}`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(\{X > Y\}\) is an event about the <em>pair</em> \((X, Y)\). Condition on the value of \(X\): for each \(x\), you need \(Y \lt x\), and independence lets the two probabilities multiply.</div>
                   <div class="sol-step">$$P(X > Y) = \sum_x P(X = x)\,P(Y \lt x)$$ (the \(x = 0\) term vanishes, since \(Y \lt 0\) is impossible).</div>
                   <div class="sol-step">$$= ${terms.join(" + ")} = ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "PMF of a product XY",
          make() {
            let xs, ys, px, py, groups, v;
            for (let t = 0; t < 40; t++) {
              xs = U.sample([-1, 0, 1, 2, 3], 3).sort((a, b) => a - b);
              ys = U.sample([1, 2, 3, 4, 6], 3).sort((a, b) => a - b);
              groups = {};
              xs.forEach((x, i) => ys.forEach((y, j) => { (groups[x * y] = groups[x * y] || []).push([i, j]); }));
              const multi = Object.keys(groups).filter(k => groups[k].length >= 2);
              if (multi.length) { v = Number(U.pick(multi)); break; }
            }
            px = pmfHundredths(3, 10); py = pmfHundredths(3, 10);
            const pairs = groups[v];
            const ans = pairs.reduce((a, [i, j]) => a + px[i] * py[j], 0) / 10000;
            return {
              q: R`\(X\) and \(Y\) are independent with the PMFs below. Let \(Z = XY\). Find \(P(Z = ${v})\).<br><br>${pmfTable(xs, px.map(hund), "x", R`P(X = x)`)}<br>${pmfTable(ys, py.map(hund), "y", R`P(Y = y)`)}`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(Z = g(X, Y)\) with \(g(x, y) = xy\). Find <b>every pair</b> \((x, y)\) with \(xy = ${v}\); a product can be reached in more than one way.</div>
                   <div class="sol-step">Pairs: ${pairs.map(([i, j]) => R`\((${xs[i]}, ${ys[j]})\)`).join(", ")}.</div>
                   <div class="sol-step">By independence each pair has probability \(P(X = x)P(Y = y)\): $$P(Z = ${v}) = ${pairs.map(([i, j]) => R`${hund(px[i])}(${hund(py[j])})`).join(" + ")} = ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "2X is not X₁ + X₂",
          make() {
            const ps = pmfHundredths(3, 10);
            const askDouble = Math.random() < 0.5;
            const v = askDouble ? 2 : U.pick([1, 2, 3]);
            const conv = { 1: 2 * ps[0] * ps[1], 2: ps[1] * ps[1] + 2 * ps[0] * ps[2], 3: 2 * ps[1] * ps[2] };
            const ans = askDouble ? ps[1] / 100 : conv[v] / 10000;
            const tbl = pmfTable([0, 1, 2], ps.map(hund), "x", R`P(X = x)`);
            return {
              q: askDouble
                ? R`\(X\) has the PMF below. Find \(P(2X = ${v})\).<br><br>${tbl}`
                : R`\(X_1\) and \(X_2\) are i.i.d., each with the PMF below. Find \(P(X_1 + X_2 = ${v})\).<br><br>${tbl}`,
              answer: ans, kind: "prob",
              sol: askDouble
                ? R`<div class="sol-step">\(2X\) is <b>one</b> random variable with its values doubled. The probabilities do not change; they just move to new values.</div>
                   <div class="sol-step">\(2X = 2 \iff X = 1\), so \(P(2X = 2) = P(X = 1) = ${hund(ps[1])}\).</div>
                   <div class="sol-step">Compare \(X_1 + X_2\) for two independent copies: \(P(X_1 + X_2 = 2) = ${U.fmt(conv[2] / 10000)}\), a different number. \(2X\) is always even, but \(X_1 + X_2\) can be odd.</div>`
                : R`<div class="sol-step">Two <b>independent</b> copies are not the same as doubling one: \(X_1 + X_2\) can reach ${v} through different pairs \((x_1, x_2)\), and each pair's probability is a product.</div>
                   <div class="sol-step">Pairs with sum ${v}: ${v === 1 ? R`\((0,1), (1,0)\)` : v === 2 ? R`\((1,1), (0,2), (2,0)\)` : R`\((1,2), (2,1)\)`}. $$P(X_1 + X_2 = ${v}) = ${v === 1 ? R`(${hund(ps[0])})(${hund(ps[1])}) + (${hund(ps[1])})(${hund(ps[0])})` : v === 2 ? R`(${hund(ps[1])})^2 + (${hund(ps[0])})(${hund(ps[2])}) + (${hund(ps[2])})(${hund(ps[0])})` : R`(${hund(ps[1])})(${hund(ps[2])}) + (${hund(ps[2])})(${hund(ps[1])})`} = ${U.fmt(ans)}$$</div>
                   <div class="sol-step">The trap answer treats \(X_1 + X_2\) as \(2X\). ${v === 2 ? R`That gives \(P(X = 1) = ${hund(ps[1])}\), which is wrong.` : R`That gives 0, since \(2X\) is never odd, which is wrong.`}</div>`,
            };
          },
        },
        {
          name: "Is X + Y independent of X − Y?",
          make() {
            const n = U.pick([4, 6, 8]);
            const d = U.randInt(0, n - 2);
            const a = U.randInt(1, n - d);
            const s = 2 * a + d;
            const ans = 1 / (n - d);
            const pS = (n - Math.abs(s - n - 1)) / (n * n);
            return {
              q: R`Two fair ${n}-sided dice are rolled, showing \(X\) and \(Y\). Find \(P(X + Y = ${s} \mid X - Y = ${d})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Given \(X - Y = ${d}\), the possible outcomes are \((${d ? `y + ${d}` : `y`}, y)\) for \(y = 1, \dots, ${n - d}\): ${n - d} equally likely pairs.</div>
                   <div class="sol-step">On each of them \(X + Y = ${d ? `2y + ${d}` : `2y`}\) takes a <b>different</b> value, and \(${s}\) is one of them (\(y = ${a}\)). So $$P(X + Y = ${s} \mid X - Y = ${d}) = \frac{1}{${n - d}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Unconditionally, \(P(X + Y = ${s}) = ${U.fmt(pS)}\), which is different. Learning \(X - Y\) changes the distribution of \(X + Y\), so they are <b>dependent</b>, even though \(X\) and \(Y\) themselves are independent.</div>`,
            };
          },
        },
        {
          name: "Functions of independent r.v.s",
          make: sane(function () {
            const xs = [-2, -1, 0, 1, 2], px = pmfHundredths(5);
            const ys = [0, 1, 2, 3, 4], py = pmfHundredths(5);
            const sq = U.pick([1, 4]);
            const [lo, hi] = [[1, 3], [0, 2], [2, 4]][U.randInt(0, 2)];
            const c = (lo + hi) / 2;
            const pa = (px[xs.indexOf(-Math.sqrt(sq))] + px[xs.indexOf(Math.sqrt(sq))]);
            const pb = sum(py.slice(lo, hi + 1));
            const ans = pa * pb / 10000;
            return {
              q: R`\(X\) and \(Y\) are independent with the PMFs below. Find \(P\big(X^2 = ${sq} \text{ and } |Y - ${c}| \le 1\big)\).<br><br>${pmfTable(xs, px.map(hund), "x", R`P(X = x)`)}<br>${pmfTable(ys, py.map(hund), "y", R`P(Y = y)`)}`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(X^2\) is a function of \(X\) alone and \(|Y - ${c}|\) of \(Y\) alone. By <b>Theorem 3.8.5</b>, functions of independent r.v.s are independent, so the joint probability factors.</div>
                   <div class="sol-step">\(X^2 = ${sq} \iff X = \pm${Math.sqrt(sq)}\): probability \(${hund(px[xs.indexOf(-Math.sqrt(sq))])} + ${hund(px[xs.indexOf(Math.sqrt(sq))])} = ${hund(pa)}\). \(|Y - ${c}| \le 1 \iff Y \in \{${lo}, ${lo + 1}, ${hi}\}\): probability \(${hund(pb)}\).</div>
                   <div class="sol-step">$$P = ${hund(pa)} \times ${hund(pb)} = ${U.fmt(ans)}$$</div>`,
            };
          }),
        },
        {
          name: "Extremes of many independent r.v.s",
          make: sane(function () {
            const xs = [1, 2, 3, 4], ps = pmfHundredths(4);
            const n = U.randInt(3, 5);
            const useMax = Math.random() < 0.5;
            const m = useMax ? U.randInt(2, 3) : U.randInt(2, 3);
            const base = useMax ? sum(ps.slice(0, m)) : sum(ps.slice(m - 1));
            const ans = Math.pow(base / 100, n);
            return {
              q: R`\(X_1, \dots, X_${n}\) are i.i.d. with the PMF below. Find \(P\big(${useMax ? R`\max(X_1, \dots, X_${n}) \le ${m}` : R`\min(X_1, \dots, X_${n}) \ge ${m}`}\big)\).<br><br>${pmfTable(xs, ps.map(hund), "x", R`P(X = x)`)}`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Rewrite the extreme as an "all" event: ${useMax ? R`the maximum is at most \(${m}\) exactly when <b>every</b> \(X_i \le ${m}\)` : R`the minimum is at least \(${m}\) exactly when <b>every</b> \(X_i \ge ${m}\)`}.</div>
                   <div class="sol-step">By independence of \(X_1, \dots, X_${n}\) (Definition 3.8.2), an "all" event is a product of ${n} equal factors: \(P(X ${useMax ? R`\le` : R`\ge`} ${m}) = ${hund(base)}\).</div>
                   <div class="sol-step">$$P = (${hund(base)})^{${n}} \approx ${U.fmt(ans)}$$</div>`,
            };
          }, 0.005),
        },
        {
          name: "Same distribution, not the same variable",
          make() {
            const n = U.pick([5, 6, 7, 8, 9, 10, 12]);
            const ask = U.pick(["eq", "lt", "sum"]);
            const ans = ask === "eq" ? (n % 2 ? 1 / n : 0) : ask === "lt" ? Math.floor(n / 2) / n : 1;
            const event = ask === "eq" ? "X = Y" : ask === "lt" ? "X \\lt Y" : `X + Y = ${n + 1}`;
            return {
              q: R`A number \(X\) is chosen uniformly from \(\{1, \dots, ${n}\}\), and \(Y = ${n + 1} - X\). Both \(X\) and \(Y\) are \(\text{DUnif}(\{1, \dots, ${n}\})\). Find \(P(${event})\).`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Same distribution does <b>not</b> mean the same random variable. Here \(Y\) is completely determined by \(X\), so translate the event into a statement about \(X\) alone.</div>
                   <div class="sol-step">${ask === "eq" ? R`\(X = ${n + 1} - X \iff X = ${(n + 1) / 2}\), ${n % 2 ? R`which is in the support, so \(P = 1/${n}\)` : R`which is not an integer, so \(P = 0\)`}.`
                     : ask === "lt" ? R`\(X \lt ${n + 1} - X \iff X \lt ${(n + 1) / 2}\), which holds for \(X = 1, \dots, ${Math.floor(n / 2)}\). So \(P = ${Math.floor(n / 2)}/${n}\).`
                     : R`\(X + Y = ${n + 1}\) on every outcome, so \(P = 1\).`}</div>
                   <div class="sol-step">If \(X, Y\) were <em>independent</em> \(\text{DUnif}\) r.v.s, the answer would be different. The PMFs of \(X\) and \(Y\) alone cannot answer a question about how they relate to each other.</div>`,
            };
          },
        },
      ],
    }),
  ];

  /* ---------------- how to choose a method ---------------- */
  const methodGuide = [
    {
      when: R`"let \(X\) be the number of…", "the sum / maximum / difference of…"`,
      use: R`Define the r.v., list its support, then find the PMF`,
      why: R`\(\{X = x\}\) is an event: the outcomes that \(X\) sends to \(x\). Count those outcomes (or use a named distribution). Writing the support first catches impossible values.`,
    },
    {
      when: R`a PMF with an unknown constant \(c\), or a missing table entry`,
      use: R`\(\sum_x p_X(x) = 1\)`,
      why: R`That is the only condition that involves \(c\). Also check that no value comes out negative.`,
    },
    {
      when: R`"at least", "more than", "at most", "fewer than", "between"`,
      use: R`Translate to \(\ge, >, \le, <\) first, then add PMF values`,
      why: R`Most lost marks on PMF questions come from the endpoint. For a count, "more than 2" starts at 3. Use the complement when it has fewer terms.`,
    },
    {
      when: R`"at least \(j\) do <em>not</em>…" when \(X\) counts those who do`,
      use: R`Rewrite with \(n - X\)`,
      why: R`\(n - X \ge j \iff X \le n - j\). Change the event, not the table.`,
    },
    {
      when: R`a CDF is given and you want \(P(X = x)\)`,
      use: R`Jump size \(F(x) - F(x^-)\)`,
      why: R`The value \(F(x)\) itself is cumulative. A point with no jump has probability \(0\).`,
    },
    {
      when: R`a CDF is given and you want an interval probability`,
      use: R`\(P(a < X \le b) = F(b) - F(a)\); adjust endpoints with \(F(\cdot^-)\)`,
      why: R`Including the left endpoint means subtracting \(F(a^-)\). Excluding the right endpoint means using \(F(b^-)\). Upper tails: \(1 - F(a)\).`,
    },
    {
      when: R`one trial recorded as success/failure, win/lose, "record whether…"; a stated rate or a win–loss record`,
      use: R`\(X \sim \text{Bern}(p)\): \(X\) is the indicator of the success event`,
      why: R`\(P(X = 1) = p\), \(P(X = 0) = 1 - p\), and that is the whole PMF. A stated rate <em>is</em> \(p\); a record only <em>estimates</em> it (\(88\)–\(66\) gives \(p \approx 88/154\)) under the assumptions of constant \(p\) and independent trials. Several such trials turn the count into \(\text{Bin}(n, p)\).`,
    },
    {
      when: R`fixed number of independent trials, same success chance each time, "how many succeed"`,
      use: R`\(\text{Bin}(n, p)\): \(\binom{n}{k}p^k(1-p)^{n-k}\)`,
      why: R`Check all four conditions (fixed \(n\), two outcomes, independent, constant \(p\)). A rate such as "8 out of 16" is how \(p\) is given.`,
    },
    {
      when: R`Binomial with "at least one", or "at least \(k\)" for small \(k\)`,
      use: R`Complement: \(1 - P(X \le k - 1)\)`,
      why: R`\(P(X \ge 1) = 1 - (1-p)^n\) is one term instead of \(n\).`,
    },
    {
      when: R`two kinds of object, a sample drawn <b>without replacement</b> (committee, hand of cards, lot inspection, tagged animals)`,
      use: R`\(\text{HGeom}(w, b, n)\): \(\binom{w}{k}\binom{b}{n-k} / \binom{w+b}{n}\)`,
      why: R`The draws are dependent and the success chance changes. Check the support \(\max(0, n-b) \le k \le \min(n, w)\) before computing.`,
    },
    {
      when: R`an urn, but "with replacement", "put back", or a population so large it doesn't matter`,
      use: R`Binomial with \(p = \frac{w}{w+b}\)`,
      why: R`With replacement the urn is unchanged before every draw, so the draws are independent with constant \(p\). That is what separates Binomial from Hypergeometric.`,
    },
    {
      when: R`"chosen at random" from a finite list, with nothing to tell the items apart`,
      use: R`Discrete Uniform: \(P(X = x) = 1/|C|\)`,
      why: R`Every probability collapses to a count: \(P(X \in A) = |A|/|C|\). But check it really is the <em>values</em> that are equally likely — the total of two dice is not uniform even though the 36 rolls are.`,
    },
    {
      when: R`equally likely values numbered from \(a\) to \(b\) (rooms 301–335, partners 2–9)`,
      use: R`\(|C| = b - a + 1\), then \(P(X \in A) = |A| / |C|\)`,
      why: R`The support does not start at 1, so count it rather than reading off the last label: \(301, \dots, 335\) is \(35\) rooms. Count the favourable values the same way (the even rooms are \(302, \dots, 334\): \(17\) of them).`,
    },
    {
      when: R`a new r.v. is built from an old one: \(Y = g(X)\), \(X^2\), \(|X|\), \(\min(X, c)\)`,
      use: R`\(P(Y = y) = \sum_{x : g(x) = y} P(X = x)\)`,
      why: R`Gather every \(x\) that \(g\) sends to \(y\) and add their probabilities. If \(g\) is one-to-one nothing pools; if it is not, the support shrinks and probabilities combine.`,
    },
    {
      when: R`two r.v.s and a joint probability, or "independent", or "i.i.d."`,
      use: R`Factor: \(P(X = x, Y = y) = P(X = x)P(Y = y)\)`,
      why: R`Independence is what licenses multiplying. To <em>disprove</em> it, one pair that fails to factor is enough; to establish it you need every pair. Draws without replacement are identically distributed but dependent.`,
    },
    {
      when: R`counting how many of several events happen`,
      use: R`A sum of indicators, \(X = \sum_i I_{A_i}\)`,
      why: R`\(I_A I_B = I_{A \cap B}\) and \(I_A^2 = I_A\). When the \(A_i\) are independent with common probability \(p\), that sum <em>is</em> \(\text{Bin}(n, p)\).`,
    },
    {
      when: R`"until the first success", "the \(n\)th person is the first…", "keeps trying until…"`,
      use: R`\(\text{Geom}(p)\): \(P(X = k) = q^kp\), counting <b>failures</b>; tail \(P(X \ge k) = q^k\)`,
      why: R`Decide first whether the question counts failures or trials — "the 8th is the first success" is \(X = 7\). Tails and the CDF need no infinite sum: \(X \ge k\) just means the first \(k\) tries all fail.`,
    },
    {
      when: R`"already failed \(m\) times — how many more?"`,
      use: R`Memorylessness: \(P(X \ge m + k \mid X \ge m) = q^k\)`,
      why: R`Independent trials don't remember past failures, so the conditioning just restarts the count.`,
    },
    {
      when: R`"before the \(r\)th success", "the 3rd sale happens on call 12"`,
      use: R`\(\text{NBin}(r, p)\): \(\binom{n + r - 1}{r - 1}p^rq^n\)`,
      why: R`The number of successes is fixed and the trials are not — the reverse of the Binomial. The last trial is forced to be the \(r\)th success, so only \(n + r - 1\) positions are free.`,
    },
    {
      when: R`a count of events in a time window or region, "at a rate of \(\lambda\) per hour"`,
      use: R`\(\text{Pois}(\lambda)\): \(e^{-\lambda}\lambda^k/k!\)`,
      why: R`First rescale \(\lambda\) to the window asked about (rate × length). "At least one" and "more than \(k\)" are infinite tails — go through the complement.`,
    },
    {
      when: R`Binomial with huge \(n\) and tiny \(p\) (rare defects, rare events)`,
      use: R`Poisson approximation with \(\lambda = np\)`,
      why: R`The Binomial coefficients become unwieldy; the Poisson is accurate when \(n\) is large and \(p\) small.`,
    },
    {
      when: R`"is \(X\) discrete or continuous?"`,
      use: R`Ask whether the values can be <b>listed</b>`,
      why: R`Finite or countably infinite (\(1, 2, 3, \dots\)) means discrete, even if the values are decimals like tax rates. All numbers in an interval, with \(P(X = c) = 0\), means continuous.`,
    },
    {
      when: R`\(\text{Bin}(n, \lambda/n)\) with \(n \to \infty\), or "derive the Poisson PMF"`,
      use: R`Limit: bracket \(\to 1\), \((1 - \lambda/n)^n \to e^{-\lambda}\)`,
      why: R`With \(np = \lambda\) fixed, the Binomial PMF converges to \(e^{-\lambda}\lambda^k/k!\). The same fact justifies the Poisson approximation for large \(n\) and small \(p\).`,
    },
    {
      when: R`an event about two r.v.s together: \(X > Y\), \(XY = z\), \(X + Y = s\), \(\max(X, Y)\)`,
      use: R`List the pairs \((x, y)\) in the event; add \(P(X = x)P(Y = y)\) if independent`,
      why: R`\(g(X, Y)\) is a new r.v. whose PMF pools every pair \(g\) sends to the same value. For comparisons, condition on one variable: \(\sum_x P(X = x)P(Y \lt x)\).`,
    },
    {
      when: R`\(\max\) or \(\min\) of several independent r.v.s`,
      use: R`Turn it into an "all" event, then multiply`,
      why: R`\(\max \le m\) means every \(X_i \le m\); \(\min \ge m\) means every \(X_i \ge m\). By independence that is a product of \(n\) factors.`,
    },
    {
      when: R`\(2X\) vs. \(X_1 + X_2\), or "they have the same distribution"`,
      use: R`Keep the r.v. and its distribution separate`,
      why: R`\(P(2X = 2x) = P(X = x)\): doubling moves values, not probabilities. Two i.i.d. copies add differently, and \(Y = 7 - X\) has the same distribution as \(X\) without being equal to it.`,
    },
    {
      when: R`"are \(f(X, Y)\) and \(h(X, Y)\) independent?" or "are \(g(X)\) and \(h(Y)\) independent?"`,
      use: R`Theorem 3.8.5 if each uses one variable; otherwise find one failing pair`,
      why: R`Functions of separate independent r.v.s stay independent. \(X + Y\) and \(X - Y\) share both inputs: one pair of values whose joint probability doesn't factor proves dependence.`,
    },
  ];

  MATH340.registerUnit({
    id: "ch3",
    title: "Chapter 3 · Random Variables & Distributions",
    short: "Ch 3 · RVs",
    week: 3,
    order: 3,
    description: "Random variables, PMFs and CDFs; the Bernoulli, Binomial, Hypergeometric, Discrete Uniform, Geometric, Negative Binomial and Poisson distributions; functions of one and two random variables; independence and indicator r.v.s.",
    flashcards,
    generators,
    methodGuide,
  });
})();
