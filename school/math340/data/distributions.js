/* ============================================================
 * Common Probability Distributions
 * Source: class handout — Table C of Blitzstein & Hwang
 * Distributions are introduced from Week 3 onward, but the
 * reference table and deck are available all term.
 * ============================================================ */
(function () {
  const R = String.raw;

  const distributions = [
    {
      name: "Bernoulli", params: R`\text{Bern}(p)`, type: "discrete",
      story: "A single trial that succeeds (1) with probability p and fails (0) with probability q = 1 − p.",
      support: R`x \in \{0, 1\}`,
      pmf: R`P(X = 1) = p,\quad P(X = 0) = q`,
      mean: R`p`, variance: R`pq`, mgf: R`q + pe^t`,
    },
    {
      name: "Binomial", params: R`\text{Bin}(n, p)`, type: "discrete",
      story: "Number of successes in n independent Bernoulli(p) trials.",
      support: R`k \in \{0, 1, \dots, n\}`,
      pmf: R`P(X = k) = \binom{n}{k} p^k q^{\,n-k}`,
      mean: R`np`, variance: R`npq`, mgf: R`(q + pe^t)^n`,
    },
    {
      name: "Geometric", params: R`\text{Geom}(p)`, type: "discrete",
      story: "Number of failures before the first success in independent Bernoulli(p) trials.",
      support: R`k \in \{0, 1, 2, \dots\}`,
      pmf: R`P(X = k) = q^k p`,
      mean: R`\dfrac{q}{p}`, variance: R`\dfrac{q}{p^2}`, mgf: R`\dfrac{p}{1 - qe^t},\ \ qe^t < 1`,
    },
    {
      name: "First Success", params: R`\text{FS}(p)`, type: "discrete",
      story: "Number of trials up to and including the first success. X ~ FS(p) means X − 1 ~ Geom(p).",
      support: R`k \in \{1, 2, 3, \dots\}`,
      pmf: R`P(X = k) = q^{k-1} p`,
      mean: R`\dfrac{1}{p}`, variance: R`\dfrac{q}{p^2}`, mgf: R`\dfrac{pe^t}{1 - qe^t},\ \ qe^t < 1`,
    },
    {
      name: "Negative Binomial", params: R`\text{NBin}(r, p)`, type: "discrete",
      story: "Number of failures before the r-th success in independent Bernoulli(p) trials.",
      support: R`n \in \{0, 1, 2, \dots\}`,
      pmf: R`P(X = n) = \binom{r + n - 1}{r - 1} p^r q^n`,
      mean: R`\dfrac{rq}{p}`, variance: R`\dfrac{rq}{p^2}`, mgf: R`\left(\dfrac{p}{1 - qe^t}\right)^{\!r},\ \ qe^t < 1`,
    },
    {
      name: "Hypergeometric", params: R`\text{HGeom}(w, b, n)`, type: "discrete",
      story: "Number of white balls when drawing n balls without replacement from an urn with w white and b black balls.",
      support: R`k \in \{0, 1, \dots, n\}`,
      pmf: R`P(X = k) = \dfrac{\binom{w}{k}\binom{b}{n-k}}{\binom{w+b}{n}}`,
      mean: R`\mu = \dfrac{nw}{w + b}`, variance: R`\left(\dfrac{w + b - n}{w + b - 1}\right) n \dfrac{\mu}{n}\left(1 - \dfrac{\mu}{n}\right)`, mgf: R`\text{(messy)}`,
    },
    {
      name: "Poisson", params: R`\text{Pois}(\lambda)`, type: "discrete",
      story: "Counts of rare events at rate λ; approximates Bin(n, p) when n is large and p is small (λ = np).",
      support: R`k \in \{0, 1, 2, \dots\}`,
      pmf: R`P(X = k) = \dfrac{e^{-\lambda} \lambda^k}{k!}`,
      mean: R`\lambda`, variance: R`\lambda`, mgf: R`e^{\lambda(e^t - 1)}`,
    },
    {
      name: "Uniform", params: R`\text{Unif}(a, b)`, type: "continuous",
      story: "A completely random point in the interval (a, b): probability proportional to length.",
      support: R`x \in (a, b)`,
      pmf: R`f(x) = \dfrac{1}{b - a}`,
      mean: R`\dfrac{a + b}{2}`, variance: R`\dfrac{(b - a)^2}{12}`, mgf: R`\dfrac{e^{tb} - e^{ta}}{t(b - a)},\ \ t \ne 0`,
    },
    {
      name: "Normal", params: R`\mathcal{N}(\mu, \sigma^2)`, type: "continuous",
      story: "The bell curve; limit of standardized sums by the Central Limit Theorem.",
      support: R`x \in (-\infty, \infty)`,
      pmf: R`f(x) = \dfrac{1}{\sigma\sqrt{2\pi}}\, e^{-(x - \mu)^2 / (2\sigma^2)}`,
      mean: R`\mu`, variance: R`\sigma^2`, mgf: R`e^{\mu t + \frac{1}{2}\sigma^2 t^2}`,
    },
    {
      name: "Exponential", params: R`\text{Expo}(\lambda)`, type: "continuous",
      story: "Waiting time for the first arrival in a Poisson process of rate λ; memoryless.",
      support: R`x > 0`,
      pmf: R`f(x) = \lambda e^{-\lambda x}`,
      mean: R`\dfrac{1}{\lambda}`, variance: R`\dfrac{1}{\lambda^2}`, mgf: R`\dfrac{\lambda}{\lambda - t},\ \ t < \lambda`,
    },
    {
      name: "Gamma", params: R`\text{Gamma}(a, \lambda)`, type: "continuous",
      story: "Waiting time for the a-th arrival in a Poisson process; sum of a independent Expo(λ) r.v.s (integer a).",
      support: R`x > 0`,
      pmf: R`f(x) = \dfrac{\lambda^a}{\Gamma(a)}\, x^{a-1} e^{-\lambda x}`,
      mean: R`\dfrac{a}{\lambda}`, variance: R`\dfrac{a}{\lambda^2}`, mgf: R`\left(\dfrac{\lambda}{\lambda - t}\right)^{\!a},\ \ t < \lambda`,
    },
    {
      name: "Beta", params: R`\text{Beta}(a, b)`, type: "continuous",
      story: "A random probability: flexible distribution on (0, 1); conjugate prior for the Binomial.",
      support: R`x \in (0, 1)`,
      pmf: R`f(x) = \dfrac{\Gamma(a + b)}{\Gamma(a)\Gamma(b)}\, x^{a-1} (1 - x)^{b-1}`,
      mean: R`\mu = \dfrac{a}{a + b}`, variance: R`\dfrac{\mu(1 - \mu)}{a + b + 1}`, mgf: R`\text{(messy)}`,
    },
    {
      name: "Chi-Square", params: R`\chi^2_n`, type: "continuous",
      story: "Sum of squares of n i.i.d. standard Normals; same as Gamma(n/2, 1/2).",
      support: R`x > 0`,
      pmf: R`f(x) = \dfrac{1}{2^{n/2}\Gamma(n/2)}\, x^{n/2 - 1} e^{-x/2}`,
      mean: R`n`, variance: R`2n`, mgf: R`(1 - 2t)^{-n/2},\ \ t < \tfrac{1}{2}`,
    },
    {
      name: "Student-t", params: R`t_n`, type: "continuous",
      story: "Ratio of a standard Normal to the square root of an independent χ²ₙ/n; heavy tails.",
      support: R`x \in (-\infty, \infty)`,
      pmf: R`f(x) = \dfrac{\Gamma\!\left(\frac{n+1}{2}\right)}{\sqrt{n\pi}\,\Gamma\!\left(\frac{n}{2}\right)} \left(1 + \dfrac{x^2}{n}\right)^{-\frac{n+1}{2}}`,
      mean: R`0 \ \ (n > 1)`, variance: R`\dfrac{n}{n - 2} \ \ (n > 2)`, mgf: R`\text{does not exist}`,
    },
  ];

  // Flashcards: one "story" card and one "formulas" card per core distribution.
  const flashcards = [];
  for (const d of distributions.slice(0, 10)) { // core distributions for the course
    flashcards.push({
      id: "dist-story-" + d.name.toLowerCase().replace(/\s+/g, "-"),
      tag: "Story",
      front: R`What is the <em>story</em> of the ${d.name} distribution \(${d.params}\), and what is its support?`,
      back: R`${d.story}<br><br>Support: \(${d.support}\).`,
    });
    flashcards.push({
      id: "dist-formula-" + d.name.toLowerCase().replace(/\s+/g, "-"),
      tag: d.type === "discrete" ? "PMF · mean · variance" : "PDF · mean · variance",
      front: R`For \(X \sim ${d.params}\): give the ${d.type === "discrete" ? "PMF" : "PDF"}, \(E(X)\), and \(\text{Var}(X)\).`,
      back: R`$$${d.pmf}$$ $$E(X) = ${d.mean}, \qquad \text{Var}(X) = ${d.variance}$$`,
    });
  }

  MATH340.registerUnit({
    id: "distributions",
    title: "Common Distributions · Table C",
    short: "Distributions",
    week: 3,
    order: 50,
    description: "The named distributions from the course handout (Table C of Blitzstein & Hwang): stories, PMFs/PDFs, means, variances, and MGFs.",
    flashcards,
    generators: [],
    referenceTable: distributions,
  });
})();
