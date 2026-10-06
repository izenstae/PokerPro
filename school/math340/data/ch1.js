/* ============================================================
 * Chapter 1 — Probability and Counting  (Week 1)
 * Source: class lecture notes (C1) + Blitzstein & Hwang ch. 1
 * ============================================================ */
(function () {
  const U = MATH340.util;
  const R = String.raw;

  const flashcards = [
    {
      id: "c1-sample-space", tag: "Definition 1.2.1",
      front: R`What is the <em>sample space</em> \(S\) and an <em>event</em> \(A\)?`,
      back: R`The sample space \(S\) is the set of <b>all possible outcomes</b> of an experiment. An event \(A\) is any <b>subset</b> of \(S\); we say \(A\) occurred if the actual outcome is in \(A\).`,
    },
    {
      id: "c1-event-ops", tag: "Set operations",
      front: R`When do \(A \cup B\), \(A \cap B\), and \(A^c\) occur?`,
      back: R`\(A \cup B\): at least one of \(A\), \(B\) occurs.<br>\(A \cap B\): both \(A\) and \(B\) occur.<br>\(A^c\): \(A\) does <b>not</b> occur.`,
    },
    {
      id: "c1-disjoint", tag: "Definition",
      front: R`When are two events \(A\) and \(B\) <em>mutually exclusive (disjoint)</em>?`,
      back: R`When they cannot occur at the same time: $$A \cap B = \emptyset.$$`,
    },
    {
      id: "c1-naive", tag: "Definition 1.3.1",
      front: R`State the <em>naive definition</em> of probability, and its two restrictions.`,
      back: R`$$P_{\text{naive}}(A) = \frac{|A|}{|S|} = \frac{\#\text{ favorable outcomes}}{\#\text{ total outcomes}}$$ Requires \(S\) to be <b>finite</b> and all outcomes <b>equally likely</b>.`,
    },
    {
      id: "c1-mult-rule", tag: "Theorem 1.4.1",
      front: R`State the <em>multiplication rule</em> for a compound experiment.`,
      back: R`If experiment A has \(a\) possible outcomes and, for each of them, experiment B has \(b\) possible outcomes, the compound experiment has $$a \times b$$ outcomes. (A need not happen before B.)`,
    },
    {
      id: "c1-samp-repl", tag: "Theorem 1.4.7",
      front: R`How many outcomes are there when choosing \(k\) times from \(n\) objects <em>with replacement</em>?`,
      back: R`$$n^k$$ Each of the \(k\) draws has all \(n\) options available.`,
    },
    {
      id: "c1-samp-norepl", tag: "Theorem 1.4.8",
      front: R`How many outcomes are there when choosing \(k\) times from \(n\) objects <em>without replacement</em> (order matters)?`,
      back: R`$$n(n-1)(n-2)\cdots(n-k+1) = \frac{n!}{(n-k)!}, \qquad 1 \le k \le n.$$`,
    },
    {
      id: "c1-permutation", tag: "Formula",
      front: R`Give the formula for the number of <em>permutations</em> of \(k\) objects chosen from \(n\) (ordered selection).`,
      back: R`$$P_{n,k} = n(n-1)\cdots(n-k+1) = \frac{n!}{(n-k)!}$$ In R: <code>factorial(n)/factorial(n-k)</code>.`,
    },
    {
      id: "c1-combination", tag: "Formula",
      front: R`Give the formula for the number of <em>combinations</em> of \(k\) objects chosen from \(n\) (unordered selection).`,
      back: R`$$\binom{n}{k} = \frac{n!}{k!\,(n-k)!}$$ In R: <code>choose(n, k)</code>.`,
    },
    {
      id: "c1-order", tag: "Concept",
      front: R`How do you decide between a permutation and a combination?`,
      back: R`Ask whether <b>order matters</b>. Distinct roles/positions/sequences (president vs. treasurer, 1st–2nd–3rd place) → permutation. Groups where members are interchangeable (committees, teams, hands of cards) → combination.`,
    },
    {
      id: "c1-overcount", tag: "Example 1.4.13",
      front: R`Splitting 4 people into two unlabeled teams of 2: why isn't the answer \(\binom{4}{2} = 6\)?`,
      back: R`Choosing team \(\{A,B\}\) is the same split as choosing team \(\{C,D\}\) — each split is counted twice. <b>Adjust for overcounting</b>: divide by 2, giving \(6/2 = 3\).`,
    },
    {
      id: "c1-axioms", tag: "Definition 1.6.1",
      front: R`State the general definition (axioms) of a probability function \(P\).`,
      back: R`A probability space is a sample space \(S\) plus a function \(P\) assigning each event \(A \subseteq S\) a number in \([0,1]\), with:<br>1. \(P(\emptyset) = 0\), &nbsp; 2. \(P(S) = 1\),<br>3. If \(A_1, A_2, \dots\) are disjoint, $$P\Big(\bigcup_{j=1}^{\infty} A_j\Big) = \sum_{j=1}^{\infty} P(A_j).$$`,
    },
    {
      id: "c1-complement", tag: "Theorem 1.6.2 (1)",
      front: R`State the <em>complement rule</em>.`,
      back: R`$$P(A^c) = 1 - P(A)$$ Often the fastest route for "at least one …" questions: compute the probability of <em>none</em> and subtract from 1.`,
    },
    {
      id: "c1-monotone", tag: "Theorem 1.6.2 (2)",
      front: R`What does <em>monotonicity</em> of probability say?`,
      back: R`If \(A \subseteq B\), then $$P(A) \le P(B).$$`,
    },
    {
      id: "c1-addition", tag: "Theorem 1.6.2 (3)",
      front: R`State the <em>addition rule</em> (inclusion–exclusion for two events).`,
      back: R`$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$ Subtracting \(P(A \cap B)\) corrects for double-counting the overlap.`,
    },
    {
      id: "c1-ie3", tag: "Inclusion–Exclusion",
      front: R`State inclusion–exclusion for <em>three</em> events \(A, B, C\).`,
      back: R`$$\begin{aligned}P(A \cup B \cup C) ={}& P(A) + P(B) + P(C)\\ &- P(A \cap B) - P(A \cap C) - P(B \cap C)\\ &+ P(A \cap B \cap C)\end{aligned}$$`,
    },
    {
      id: "c1-ie-gen", tag: "Theorem 1.6.3",
      front: R`State the general <em>inclusion–exclusion</em> formula for \(A_1, \dots, A_n\).`,
      back: R`$$P\Big(\bigcup_{i=1}^n A_i\Big) = \sum_i P(A_i) - \sum_{i&lt;j} P(A_i \cap A_j) + \sum_{i&lt;j&lt;k} P(A_i \cap A_j \cap A_k) - \cdots + (-1)^{n+1} P(A_1 \cap \cdots \cap A_n)$$ Signs alternate: add singles, subtract pairs, add triples, …`,
    },
    {
      id: "c1-exactly-one", tag: "Useful identity",
      front: R`Express "exactly one of \(A\), \(B\) occurs" and its probability.`,
      back: R`The event is \((A \cap B^c) \cup (A^c \cap B)\), a disjoint union, so $$P(\text{exactly one}) = P(A) + P(B) - 2\,P(A \cap B).$$`,
    },
    {
      id: "c1-neither", tag: "De Morgan + complement",
      front: R`How do you compute \(P(\text{neither } A \text{ nor } B)\)?`,
      back: R`By De Morgan's law, \(A^c \cap B^c = (A \cup B)^c\), so $$P(A^c \cap B^c) = 1 - P(A \cup B) = 1 - P(A) - P(B) + P(A \cap B).$$`,
    },
    {
      id: "c1-r-cmds", tag: "R commands",
      front: R`Which R commands compute \(n!\), \(\binom{n}{k}\), and random samples with / without replacement?`,
      back: R`<code>factorial(n)</code> — \(n!\)<br><code>choose(n, k)</code> — \(\binom{n}{k}\)<br><code>sample(n, k)</code> — \(k\) draws without replacement<br><code>sample(n, k, replace = TRUE)</code> — with replacement<br><code>sample(n, n)</code> — random permutation.`,
    },
  ];

  /* ---------------- practice problem generators ----------------
   * Each generator is a family of *structurally different* problems,
   * not one template with the numbers shuffled: the variants below ask
   * for different counting arguments (direct count, complement, block,
   * overcounting adjustment, stars-and-bars, ...) so that recognising
   * which tool applies is itself part of the practice.
   * -------------------------------------------------------------- */

  const generators = [
    MATH340.makeGenerator({
      id: "c1-gen-perm",
      name: "Ordered selections & arrangements",
      blurb: "Podiums, shelf orders, repeated letters, blocks, round tables.",
      variants: [
        {
          name: "Top-k finishers",
          make() {
            const n = U.randInt(7, 12), k = U.randInt(3, 4);
            const ans = U.perm(n, k);
            const terms = Array.from({ length: k }, (_, i) => n - i).join(" \\times ");
            return {
              q: R`${n} runners compete in a race with no ties, and every runner finishes. How many possibilities are there for the top ${k} finishing positions (in order)?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">The positions are <b>distinct roles</b>, so order matters: the winner can be any of ${n} runners, second place any of the remaining ${n - 1}, and so on for ${k} places.</div>
                   <div class="sol-step">$$P_{${n},${k}} = \frac{${n}!}{(${n}-${k})!} = ${terms} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Arranging all n distinct objects",
          make() {
            const n = U.randInt(5, 8);
            const ans = U.factorial(n);
            const [thing, place] = U.pick([
              ["textbooks", "on a shelf"], ["photographs", "in a row on a wall"], ["songs", "in a playlist order"],
            ]);
            return {
              q: R`A student arranges ${n} different ${thing} ${place}. How many different arrangements are possible?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">Every object is used exactly once, so this is a full permutation of ${n} distinct items.</div>
                   <div class="sol-step">$$${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(" \\times ")} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Rearranging a word with repeated letters",
          make() {
            const word = U.pick(["BANANA", "SUCCESS", "TENNESSEE", "COMMITTEE", "STATISTICS", "PROBABILITY", "ALGEBRA", "BOOKKEEPER"]);
            const counts = {};
            for (const ch of word) counts[ch] = (counts[ch] || 0) + 1;
            const n = word.length;
            const reps = Object.entries(counts).filter(([, c]) => c > 1);
            let den = 1;
            for (const [, c] of reps) den *= U.factorial(c);
            const ans = U.factorial(n) / den;
            const denTex = reps.map(([ch, c]) => `${c}!`).join("\\,") || "1";
            const repList = reps.map(([ch, c]) => `${ch} appears ${c} times`).join(", ");
            return {
              q: R`How many distinguishable arrangements are there of all the letters of the word <b>${word}</b>?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">There are ${n} letters, but some are identical (${repList}), so the ${n}! orderings of the letters <b>overcount</b>: permuting identical letters among themselves gives the same word.</div>
                   <div class="sol-step"><b>Adjust for overcounting</b> by dividing by the factorial of each repeat count: $$\frac{${n}!}{${denTex}} = \frac{${U.factorial(n)}}{${den}} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "A group that must stay together",
          make() {
            const n = U.randInt(6, 9), k = U.randInt(2, 3);
            const blocks = n - k + 1;
            const ans = U.factorial(blocks) * U.factorial(k);
            return {
              q: R`${n} students are seated in a row of ${n} chairs. ${k} of them are close friends and insist on sitting in consecutive seats. How many seating orders are possible?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step"><b>Glue</b> the ${k} friends into a single block. There are then ${blocks} objects to arrange (the block plus the other ${n - k} students): \(${blocks}! = ${U.factorial(blocks)}\) orders.</div>
                   <div class="sol-step">Inside the block the friends can be ordered in \(${k}! = ${U.factorial(k)}\) ways. By the multiplication rule: $$${blocks}! \times ${k}! = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Two people who must be separated",
          make() {
            const n = U.randInt(5, 8);
            const total = U.factorial(n), together = 2 * U.factorial(n - 1);
            const ans = total - together;
            return {
              q: R`${n} people line up at random for a photograph. Two of them have had an argument and refuse to stand next to each other. How many line-ups are possible?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">Count the <b>complement</b>. All line-ups: \(${n}! = ${total}\).</div>
                   <div class="sol-step">Line-ups where the two <em>are</em> adjacent: glue them into one block, giving \((${n}-1)! = ${U.factorial(n - 1)}\) arrangements, times \(2\) for their internal order: \(${together}\).</div>
                   <div class="sol-step">$$${total} - ${together} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Seating around a round table",
          make() {
            const n = U.randInt(5, 9);
            const ans = U.factorial(n - 1);
            return {
              q: R`${n} people sit around a <b>circular</b> table. Two seatings count as the same if one is a rotation of the other. How many distinct seatings are there?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">In a row there would be \(${n}!\) orders, but each circular seating can be rotated into ${n} different rows — an overcount by a factor of ${n}.</div>
                   <div class="sol-step">$$\frac{${n}!}{${n}} = (${n}-1)! = ${ans}$$ (Equivalently: seat one person first to break the rotational symmetry, then arrange the other \(${n - 1}\) freely.)</div>`,
            };
          },
        },
        {
          name: "Arrangements that must alternate",
          make() {
            const m = U.randInt(3, 5);
            const ans = 2 * U.factorial(m) * U.factorial(m);
            return {
              q: R`A shelf holds ${m} different algebra books and ${m} different geometry books. They must be arranged in a row so that the subjects <b>alternate</b>. How many arrangements are possible?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">First choose the pattern: algebra-first or geometry-first — \(2\) choices. That fixes which positions each subject occupies.</div>
                   <div class="sol-step">Then order the ${m} algebra books in their ${m} slots (\(${m}! = ${U.factorial(m)}\)) and the ${m} geometry books in theirs (\(${m}!\)).</div>
                   <div class="sol-step">$$2 \times ${m}! \times ${m}! = ${ans}$$</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c1-gen-comb",
      name: "Unordered selections (combinations)",
      blurb: "Committees, required/forbidden members, group splits, grid paths.",
      variants: [
        {
          name: "Plain committee",
          make() {
            const n = U.randInt(7, 15), k = U.randInt(2, 4);
            const ans = U.choose(n, k);
            const ctx = U.pick([
              [`A committee of ${k} professors is to be formed from ${n} professors, all with equal roles.`, "committees"],
              [`${k} students are selected from a group of ${n} to work together on a project.`, "teams"],
              [`A pizza shop offers ${n} toppings and you choose exactly ${k} different ones.`, "topping selections"],
            ]);
            return {
              q: R`${ctx[0]} How many different ${ctx[1]} are possible?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">All members/choices are interchangeable — <b>order does not matter</b> — so use combinations.</div>
                   <div class="sol-step">$$\binom{${n}}{${k}} = \frac{${n}!}{${k}!\,(${n}-${k})!} = ${ans}$$</div>
                   <div class="sol-step">In R: <code>choose(${n}, ${k})</code>.</div>`,
            };
          },
        },
        {
          name: "One member is required",
          make() {
            const n = U.randInt(8, 14), k = U.randInt(3, 5);
            const ans = U.choose(n - 1, k - 1);
            return {
              q: R`A club has ${n} members, one of whom is the founder. A committee of ${k} members is formed, and the founder <b>must</b> be on it. How many such committees are possible?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">The founder's seat is already decided, so it is not a choice at all. Only the remaining \(${k} - 1 = ${k - 1}\) seats are open, to be filled from the other \(${n} - 1 = ${n - 1}\) members.</div>
                   <div class="sol-step">$$\binom{${n - 1}}{${k - 1}} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "At least one of a subgroup (complement)",
          make() {
            const m = U.randInt(2, 4), k = U.randInt(3, 5), n = k + m + U.randInt(1, 4);
            const total = U.choose(n, k), none = U.choose(n - m, k);
            const ans = total - none;
            return {
              q: R`A department has ${n} faculty, ${m} of whom are statisticians. A committee of ${k} is chosen. How many committees contain <b>at least one</b> statistician?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">"At least one" is easiest through the <b>complement</b>: count committees with <em>no</em> statistician and subtract.</div>
                   <div class="sol-step">All committees: \(\binom{${n}}{${k}} = ${total}\). Committees drawn only from the \(${n - m}\) non-statisticians: \(\binom{${n - m}}{${k}} = ${none}\).</div>
                   <div class="sol-step">$$${total} - ${none} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Exactly j of one type",
          make() {
            const d = U.randInt(3, 5), g = U.randInt(8, 12), k = U.randInt(3, 4), j = U.randInt(1, 2);
            const n = d + g;
            const ans = U.choose(d, j) * U.choose(g, k - j);
            return {
              q: R`A shipment of ${n} laptops contains ${d} defective ones and ${g} working ones. An inspector selects ${k} laptops at random. How many selections contain <b>exactly ${j}</b> defective ${U.plural(j, "laptop")}?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">Split the choice into two independent sub-choices and multiply: pick which defectives, then which working units.</div>
                   <div class="sol-step">$$\binom{${d}}{${j}}\binom{${g}}{${k - j}} = ${U.choose(d, j)} \times ${U.choose(g, k - j)} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Split into labelled groups",
          make() {
            const a = U.randInt(2, 4), b = U.randInt(2, 4), c = U.randInt(2, 3);
            const n = a + b + c;
            const ans = U.factorial(n) / (U.factorial(a) * U.factorial(b) * U.factorial(c));
            return {
              q: R`${n} employees are assigned to three <b>different</b> shifts: ${a} to the morning shift, ${b} to the afternoon shift, and ${c} to the night shift. In how many ways can the assignment be made?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">Choose the morning crew, then the afternoon crew from those left, then the rest work nights:</div>
                   <div class="sol-step">$$\binom{${n}}{${a}}\binom{${n - a}}{${b}}\binom{${c}}{${c}} = \frac{${n}!}{${a}!\,${b}!\,${c}!} = ${ans}$$</div>
                   <div class="sol-step">The shifts are <b>labelled</b> (distinguishable), so no further division is needed.</div>`,
            };
          },
        },
        {
          name: "Split into unlabelled groups (overcounting)",
          make() {
            const g = U.randInt(2, 4), n = 2 * g;
            const ans = U.factorial(n) / (Math.pow(2, g) * U.factorial(g));
            return {
              q: R`${n} students in a lab are divided into ${g} <b>unlabelled</b> pairs (the pairs have no names or numbers — only who is with whom matters). In how many ways can this be done?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">Line the ${n} students up in \(${n}! = ${U.factorial(n)}\) ways and read off consecutive pairs. This overcounts twice over:</div>
                   <div class="sol-step">each pair's internal order doesn't matter (divide by \(2^{${g}} = ${Math.pow(2, g)}\)), and the order of the ${g} pairs themselves doesn't matter (divide by \(${g}! = ${U.factorial(g)}\)).</div>
                   <div class="sol-step">$$\frac{${n}!}{2^{${g}}\,${g}!} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Shortest grid routes",
          make() {
            const e = U.randInt(3, 5), nn = U.randInt(3, 5);
            const ans = U.choose(e + nn, e);
            return {
              q: R`A delivery robot starts at a street corner and must reach a corner ${e} blocks east and ${nn} blocks north. It only ever moves one block east or one block north. How many shortest routes are there?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">Every shortest route is a sequence of \(${e} + ${nn} = ${e + nn}\) moves, of which exactly ${e} are "east" — the route is completely determined by <b>which positions in the sequence</b> are the east moves.</div>
                   <div class="sol-step">$$\binom{${e + nn}}{${e}} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Handshakes and polygon diagonals",
          make() {
            const n = U.randInt(6, 12);
            if (Math.random() < 0.5) {
              const ans = U.choose(n, 2);
              return {
                q: R`At a small reception, ${n} people each shake hands exactly once with every other person. How many handshakes take place?`,
                answer: ans, kind: "count",
                sol: R`<div class="sol-step">A handshake is an <b>unordered pair</b> of people: "A shakes with B" is the same handshake as "B shakes with A".</div>
                     <div class="sol-step">$$\binom{${n}}{2} = \frac{${n} \times ${n - 1}}{2} = ${ans}$$</div>`,
              };
            }
            const ans = n * (n - 3) / 2;
            return {
              q: R`How many diagonals does a convex polygon with ${n} vertices have? (A diagonal joins two vertices that are <b>not</b> adjacent.)`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">Every pair of vertices is joined by a segment: \(\binom{${n}}{2} = ${U.choose(n, 2)}\) segments in all.</div>
                   <div class="sol-step">Of those, ${n} are the polygon's own sides (adjacent pairs), so subtract them: $$\binom{${n}}{2} - ${n} = ${U.choose(n, 2)} - ${n} = ${ans}$$</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c1-gen-sampling",
      name: "Sampling with / without replacement",
      blurb: "Codes, plates, subsets, stars-and-bars, complement counting.",
      variants: [
        {
          name: "Codes with repetition allowed",
          make() {
            const n = U.pick([4, 5, 6, 9, 10]), k = U.randInt(3, 5);
            const ans = Math.pow(n, k);
            return {
              q: R`A code consists of ${k} symbols chosen from an alphabet of ${n} symbols, and symbols <b>may repeat</b>. How many different codes are possible?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">This is sampling <b>with replacement</b>, order recorded: every one of the ${k} positions has all ${n} symbols available.</div>
                   <div class="sol-step">$$n^k = ${n}^{${k}} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Ordered draws without replacement",
          make() {
            const n = U.randInt(6, 10), k = U.randInt(3, 4);
            const ans = U.perm(n, k);
            return {
              q: R`From a jar with ${n} labelled balls, you draw ${k} balls one at a time <b>without replacement</b>, keeping track of the order drawn. How many outcomes are possible?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">Each draw removes one ball, so the number of options shrinks by one each time:</div>
                   <div class="sol-step">$$${Array.from({ length: k }, (_, i) => n - i).join(" \\times ")} = \frac{${n}!}{(${n}-${k})!} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Mixed alphabets (licence plates)",
          make() {
            const L = U.randInt(2, 3), D = U.randInt(2, 3);
            const ans = Math.pow(26, L) * Math.pow(10, D);
            return {
              q: R`A licence plate consists of ${L} letters (A–Z) followed by ${D} digits (0–9). Letters and digits may repeat. How many plates are possible?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">By the <b>multiplication rule</b>, multiply the number of options at each position — the alphabets differ, but the rule is the same:</div>
                   <div class="sol-step">$$26^{${L}} \times 10^{${D}} = ${Math.pow(26, L)} \times ${Math.pow(10, D)} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Counting subsets",
          make() {
            const n = U.randInt(5, 10);
            const ans = Math.pow(2, n);
            const asSet = Math.random() < 0.5;
            return {
              q: asSet
                ? R`How many subsets does a set with ${n} elements have (counting the empty set and the whole set)?`
                : R`A true/false quiz has ${n} questions. How many different completed answer sheets are possible (every question answered)?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">${asSet ? R`Build a subset by deciding, for each of the ${n} elements, "in" or "out" — 2 independent choices per element.` : R`Each of the ${n} questions is answered T or F, independently.`}</div>
                   <div class="sol-step">$$2^{${n}} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Identical items into distinct bins (stars & bars)",
          make() {
            const k = U.randInt(5, 9), n = U.randInt(3, 5);
            const ans = U.choose(k + n - 1, n - 1);
            return {
              q: R`${k} <b>identical</b> granola bars are handed out to ${n} children, and a child may receive none. How many different distributions are possible?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">The bars are indistinguishable, so a distribution is just the list of counts. Encode it as ${k} stars and \(${n} - 1 = ${n - 1}\) bars separating the children, e.g. \(\star\star|\star|\cdots\)</div>
                   <div class="sol-step">Any arrangement of those \(${k} + ${n - 1} = ${k + n - 1}\) symbols gives one distribution, so choose which positions hold the bars:</div>
                   <div class="sol-step">$$\binom{${k} + ${n} - 1}{${n} - 1} = \binom{${k + n - 1}}{${n - 1}} = ${ans}$$</div>`,
            };
          },
        },
        {
          name: "Strings with a required symbol type",
          make() {
            const k = U.randInt(3, 4);
            const all = Math.pow(36, k), noDigit = Math.pow(26, k);
            const ans = all - noDigit;
            return {
              q: R`A password is a string of ${k} characters, each a letter (A–Z, case-insensitive) or a digit (0–9), with repeats allowed. How many passwords contain <b>at least one digit</b>?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">Count everything, then subtract the strings that violate the requirement — the <b>complement</b> is far easier than splitting by how many digits appear.</div>
                   <div class="sol-step">All strings: \(36^{${k}} = ${all}\). Strings with no digit (letters only): \(26^{${k}} = ${noDigit}\).</div>
                   <div class="sol-step">$$${all} - ${noDigit} = ${ans}$$</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c1-gen-naive",
      name: "Naive probability with counting",
      blurb: "Dice, cards, coins, birthdays: favourable ÷ total.",
      variants: [
        {
          name: "Sum of two dice",
          make() {
            const s = U.randInt(5, 9);
            let count = 0;
            for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) count++;
            const ans = count / 36;
            return {
              q: R`Two fair six-sided dice are rolled. What is the probability that the sum of the two dice equals ${s}? (Enter a decimal or a fraction like 5/36.)`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The sample space has \(6 \times 6 = 36\) equally likely <b>ordered</b> outcomes.</div>
                   <div class="sol-step">There are ${count} ordered pairs summing to ${s}, so $$P = \frac{${count}}{36} \approx ${U.fmt(ans)}.$$</div>`,
            };
          },
        },
        {
          name: "Maximum of two dice",
          make() {
            const m = U.randInt(2, 6);
            const count = 2 * m - 1;
            const ans = count / 36;
            return {
              q: R`Two fair six-sided dice are rolled. What is the probability that the <b>larger</b> of the two values (the maximum) equals ${m}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">"Max \(= ${m}\)" means both dice are \(\le ${m}\) but not both \(\le ${m - 1}\).</div>
                   <div class="sol-step">Both \(\le ${m}\): \(${m}^2 = ${m * m}\) outcomes. Both \(\le ${m - 1}\): \(${m - 1}^2 = ${(m - 1) * (m - 1)}\) outcomes.</div>
                   <div class="sol-step">$$P = \frac{${m * m} - ${(m - 1) * (m - 1)}}{36} = \frac{${count}}{36} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Mixed committee",
          make() {
            const g = U.randInt(4, 6), b = U.randInt(4, 6), k = 3, gk = U.randInt(1, 2);
            const total = U.choose(g + b, k);
            const fav = U.choose(g, gk) * U.choose(b, k - gk);
            const ans = fav / total;
            return {
              q: R`A committee of ${k} people is chosen at random from ${g} statisticians and ${b} economists. What is the probability the committee has exactly ${gk} ${U.plural(gk, "statistician")} (and ${k - gk} ${U.plural(k - gk, "economist")})?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Total equally likely committees: \(\binom{${g + b}}{${k}} = ${total}\).</div>
                   <div class="sol-step">Favourable: choose ${gk} of the ${g} statisticians and ${k - gk} of the ${b} economists: \(\binom{${g}}{${gk}}\binom{${b}}{${k - gk}} = ${fav}\).</div>
                   <div class="sol-step">$$P = \frac{\binom{${g}}{${gk}}\binom{${b}}{${k - gk}}}{\binom{${g + b}}{${k}}} = \frac{${fav}}{${total}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Cards: exactly k of a rank",
          make() {
            const k = U.randInt(1, 2);
            const rank = U.pick(["aces", "kings", "queens"]);
            const fav = U.choose(4, k) * U.choose(48, 5 - k);
            const total = U.choose(52, 5);
            const ans = fav / total;
            return {
              q: R`A 5-card hand is dealt at random from a standard 52-card deck. What is the probability the hand contains exactly ${k} ${k === 1 ? rank.slice(0, -1) : rank}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">All \(\binom{52}{5} = ${total}\) hands are equally likely (order within a hand does not matter).</div>
                   <div class="sol-step">Favourable hands: choose ${k} of the 4 ${rank}, and the other \(${5 - k}\) cards from the ${48} non-${rank}: \(\binom{4}{${k}}\binom{48}{${5 - k}} = ${fav}\).</div>
                   <div class="sol-step">$$P = \frac{${fav}}{${total}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Adjacency in a random line-up",
          make() {
            const n = U.randInt(5, 9);
            const ans = 2 / n;
            return {
              q: R`${n} people, including Ana and Ben, line up in a <b>uniformly random</b> order. What is the probability that Ana and Ben stand next to each other?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Total line-ups: \(${n}! = ${U.factorial(n)}\).</div>
                   <div class="sol-step">Line-ups with the two adjacent: glue them into a block — \((${n}-1)! = ${U.factorial(n - 1)}\) arrangements — times \(2\) for their internal order: \(${2 * U.factorial(n - 1)}\).</div>
                   <div class="sol-step">$$P = \frac{2 \cdot (${n}-1)!}{${n}!} = \frac{2}{${n}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "All dice show different values",
          make() {
            const k = U.randInt(2, 4);
            const ans = U.perm(6, k) / Math.pow(6, k);
            return {
              q: R`${k} fair six-sided dice are rolled. What is the probability that <b>all ${k} show different values</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Total equally likely outcomes: \(6^{${k}} = ${Math.pow(6, k)}\) (sampling with replacement).</div>
                   <div class="sol-step">Outcomes with all values distinct: \(${Array.from({ length: k }, (_, i) => 6 - i).join(" \\times ")} = ${U.perm(6, k)}\) (sampling without replacement).</div>
                   <div class="sol-step">$$P = \frac{${U.perm(6, k)}}{${Math.pow(6, k)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Exactly k heads in n flips",
          make() {
            const n = U.randInt(5, 8), k = U.randInt(2, n - 2);
            const ans = U.choose(n, k) / Math.pow(2, n);
            return {
              q: R`A fair coin is flipped ${n} times. What is the probability of getting exactly ${k} ${U.plural(k, "head")}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">There are \(2^{${n}} = ${Math.pow(2, n)}\) equally likely sequences of H/T.</div>
                   <div class="sol-step">A sequence has exactly ${k} heads precisely when we choose <b>which ${k} of the ${n} positions</b> are heads: \(\binom{${n}}{${k}} = ${U.choose(n, k)}\).</div>
                   <div class="sol-step">$$P = \frac{\binom{${n}}{${k}}}{2^{${n}}} = \frac{${U.choose(n, k)}}{${Math.pow(2, n)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Birthday-style matching",
          make() {
            const n = U.randInt(3, 6);
            const days = U.pick([365, 30, 12]);
            const label = days === 365 ? "birthday (ignore leap years, all 365 days equally likely)" : days === 30 ? "day of a 30-day month" : "birth month (all 12 equally likely)";
            let distinct = 1;
            for (let i = 0; i < n; i++) distinct *= (days - i) / days;
            const ans = distinct;
            return {
              q: R`${n} people are chosen at random; each has an equally likely ${label}, independently of the others. What is the probability that <b>all ${n} are different</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Total equally likely assignments: \(${days}^{${n}}\) (with replacement). Assignments with all values distinct: \(${days} \times ${days - 1} \times \cdots \times ${days - n + 1}\) (without replacement).</div>
                   <div class="sol-step">$$P = \frac{${days}\cdot${days - 1}\cdots(${days}-${n}+1)}{${days}^{${n}}} = ${Array.from({ length: n }, (_, i) => `\\tfrac{${days - i}}{${days}}`).join("\\cdot")} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c1-gen-ie",
      name: "Addition rule & inclusion–exclusion",
      blurb: "Two or three events: union, exactly one, neither, working backwards.",
      variants: [
        {
          name: "Two events: union / exactly one / neither",
          make() {
            const v = U.venn2();
            const pa = v.pa, pb = v.pb, pab = v.both;
            const [ctxA, ctxB, noun] = U.pick([
              ["get Internet service from the local cable company", "get television service", "households in a suburb"],
              ["read the morning newsletter", "listen to the daily podcast", "subscribers"],
              ["own a laptop", "own a tablet", "students"],
            ]);
            const which = U.pick(["union", "exactly", "neither"]);
            const pUnion = pa + pb - pab, pExactly = pa + pb - 2 * pab, pNeither = 1 - pUnion;
            const ans = which === "union" ? pUnion : which === "exactly" ? pExactly : pNeither;
            const ask = which === "union" ? "at least one of the two" : which === "exactly" ? "exactly one of the two" : "neither of the two";
            return {
              q: R`Among ${noun}: ${Math.round(pa * 100)}% ${ctxA} (event \(A\)), ${Math.round(pb * 100)}% ${ctxB} (event \(B\)), and ${Math.round(pab * 100)}% do both. If one is selected at random, find the probability that they do <b>${ask}</b>.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Given: \(P(A) = ${pa}\), \(P(B) = ${pb}\), \(P(A \cap B) = ${pab}\).</div>
                   <div class="sol-step">Addition rule: \(P(A \cup B) = ${pa} + ${pb} - ${pab} = ${U.fmt(pUnion)}\).</div>
                   <div class="sol-step">Exactly one: \(P(A) + P(B) - 2P(A \cap B) = ${U.fmt(pExactly)}\) (the overlap is removed <em>twice</em>: once from each event).</div>
                   <div class="sol-step">Neither (De Morgan): \(1 - P(A \cup B) = ${U.fmt(pNeither)}\).</div>
                   <div class="sol-step">Answer: $$${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Three events: at least one",
          make() {
            const only = [U.randInt(8, 20), U.randInt(8, 20), U.randInt(8, 20)];
            const pair = [U.randInt(3, 10), U.randInt(3, 10), U.randInt(3, 10)];
            const tri = U.randInt(2, 6);
            const A = only[0] + pair[0] + pair[1] + tri, B = only[1] + pair[0] + pair[2] + tri, C = only[2] + pair[1] + pair[2] + tri;
            const AB = pair[0] + tri, AC = pair[1] + tri, BC = pair[2] + tri;
            const ans = A + B + C - AB - AC - BC + tri;
            return {
              q: R`In a survey, ${A} students use app \(A\), ${B} use app \(B\), and ${C} use app \(C\). Also ${AB} use both \(A\) and \(B\), ${AC} use both \(A\) and \(C\), ${BC} use both \(B\) and \(C\), and ${tri} use all three. How many students use <b>at least one</b> of the three apps?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">Adding the three totals counts the pairwise overlaps twice and the triple overlap three times, so subtract the pairs and add the triple back:</div>
                   <div class="sol-step">$$\begin{aligned}|A \cup B \cup C| &= ${A} + ${B} + ${C} - ${AB} - ${AC} - ${BC} + ${tri}\\ &= ${ans}\end{aligned}$$</div>
                   <div class="sol-step">Check by regions: ${only[0]} + ${only[1]} + ${only[2]} (one app only) + ${pair[0]} + ${pair[1]} + ${pair[2]} (exactly two) + ${tri} (all three) = ${ans}.</div>`,
            };
          },
        },
        {
          name: "Three events: exactly one",
          make() {
            const only = [U.randInt(8, 20), U.randInt(8, 20), U.randInt(8, 20)];
            const pair = [U.randInt(3, 10), U.randInt(3, 10), U.randInt(3, 10)];
            const tri = U.randInt(2, 6);
            const A = only[0] + pair[0] + pair[1] + tri, B = only[1] + pair[0] + pair[2] + tri, C = only[2] + pair[1] + pair[2] + tri;
            const AB = pair[0] + tri, AC = pair[1] + tri, BC = pair[2] + tri;
            const ans = only[0] + only[1] + only[2];
            return {
              q: R`A club's members play chess (${A} members), go (${B} members), and bridge (${C} members); ${AB} play both chess and go, ${AC} both chess and bridge, ${BC} both go and bridge, and ${tri} play all three. How many members play <b>exactly one</b> of the three games?`,
              answer: ans, kind: "count",
              sol: R`<div class="sol-step">A member in exactly two games is counted twice by the three totals and once by one pairwise total; a member in all three is counted 3 times and 3 times. The identity that isolates "exactly one" is:</div>
                   <div class="sol-step">$$\begin{aligned}N_1 &= |A| + |B| + |C| - 2(|A \cap B| + |A \cap C| + |B \cap C|) + 3|A \cap B \cap C|\\ &= ${A + B + C} - 2(${AB + AC + BC}) + 3(${tri}) = ${ans}\end{aligned}$$</div>
                   <div class="sol-step">Equivalently, subtract the overlaps region by region: chess only ${only[0]}, go only ${only[1]}, bridge only ${only[2]}.</div>`,
            };
          },
        },
        {
          name: "Working backwards to the overlap",
          make() {
            const v = U.venn2();
            const pa = v.pa, pb = v.pb, pab = v.both;
            const pUnion = v.union;
            const askOnly = Math.random() < 0.5;
            const ans = askOnly ? U.round(pa - pab, 4) : pab;
            return {
              q: R`For events \(A\) and \(B\), \(P(A) = ${pa}\), \(P(B) = ${pb}\), and \(P(A \cup B) = ${pUnion}\). Find ${askOnly ? R`\(P(A \cap B^c)\) — the probability that \(A\) occurs but \(B\) does not` : R`\(P(A \cap B)\)`}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Rearrange the addition rule: $$P(A \cap B) = P(A) + P(B) - P(A \cup B) = ${pa} + ${pb} - ${pUnion} = ${U.fmt(pab)}$$</div>
                   ${askOnly ? R`<div class="sol-step">\(A\) splits into the disjoint pieces \(A \cap B\) and \(A \cap B^c\), so $$P(A \cap B^c) = P(A) - P(A \cap B) = ${pa} - ${U.fmt(pab)} = ${U.fmt(ans)}$$</div>` : ``}`,
            };
          },
        },
        {
          name: "Given 'neither', find the overlap",
          make() {
            const v = U.venn2();
            const pa = v.pa, pb = v.pb, pNeither = v.neither;
            const ans = v.both;
            return {
              q: R`In a town, ${Math.round(pa * 100)}% of adults drink coffee (\(A\)), ${Math.round(pb * 100)}% drink tea (\(B\)), and ${Math.round(pNeither * 100)}% drink <b>neither</b>. What proportion drink <b>both</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">"Neither" is the complement of the union: $$P(A \cup B) = 1 - ${pNeither} = ${U.fmt(1 - pNeither)}$$</div>
                   <div class="sol-step">Now invert the addition rule: $$P(A \cap B) = P(A) + P(B) - P(A \cup B) = ${pa} + ${pb} - ${U.fmt(1 - pNeither)} = ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Divisibility in 1..N",
          make() {
            const N = U.pick([60, 100, 120, 200, 300]);
            let a = 2, b = 3;
            [a, b] = U.sample([2, 3, 4, 5, 6, 7], 2);
            const l = U.lcm(a, b);
            const cnt = Math.floor(N / a) + Math.floor(N / b) - Math.floor(N / l);
            const ans = cnt / N;
            return {
              q: R`An integer is chosen uniformly at random from \(\{1, 2, \dots, ${N}\}\). What is the probability that it is divisible by ${a} <b>or</b> by ${b} (or both)?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Let \(A\) = "divisible by ${a}", \(B\) = "divisible by ${b}". Counting multiples: \(|A| = \lfloor ${N}/${a} \rfloor = ${Math.floor(N / a)}\), \(|B| = \lfloor ${N}/${b} \rfloor = ${Math.floor(N / b)}\).</div>
                   <div class="sol-step">\(A \cap B\) means divisible by \(\text{lcm}(${a},${b}) = ${l}\): \(\lfloor ${N}/${l} \rfloor = ${Math.floor(N / l)}\) numbers.</div>
                   <div class="sol-step">$$P(A \cup B) = \frac{${Math.floor(N / a)} + ${Math.floor(N / b)} - ${Math.floor(N / l)}}{${N}} = \frac{${cnt}}{${N}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c1-gen-atleast",
      name: "Complement trick (at least one)",
      blurb: "When counting 'at least one' directly is messy, count 'none'.",
      variants: [
        {
          name: "At least one six",
          make() {
            const n = U.randInt(2, 5);
            const ans = 1 - Math.pow(5 / 6, n);
            return {
              q: R`A fair die is rolled ${n} times. What is the probability of getting <b>at least one</b> 6?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Direct counting of "at least one" would split into cases (exactly one 6, exactly two, …) — use the <b>complement rule</b> instead.</div>
                   <div class="sol-step">$$P(\text{at least one } 6) = 1 - P(\text{no } 6) = 1 - \left(\frac{5}{6}\right)^{${n}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "At least one picks a given slot",
          make() {
            const n = U.randInt(3, 6), k = U.randInt(2, 3);
            const ans = 1 - Math.pow((n - 1) / n, k);
            return {
              q: R`Each of ${k} people independently and uniformly picks one of ${n} lockers. What is the probability that <b>at least one</b> of them picks locker #1?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Complement: nobody picks locker #1. Each person avoids it with probability \(\frac{${n - 1}}{${n}}\), independently.</div>
                   <div class="sol-step">$$1 - \left(\frac{${n - 1}}{${n}}\right)^{${k}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "At least one defective (without replacement)",
          make() {
            const d = U.randInt(2, 4), g = U.randInt(8, 14), k = U.randInt(3, 5);
            const n = d + g;
            const none = U.choose(g, k) / U.choose(n, k);
            const ans = 1 - none;
            return {
              q: R`A box holds ${n} components, ${d} of which are defective. ${k} components are drawn at random <b>without replacement</b>. What is the probability that at least one drawn component is defective?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Complement: all ${k} drawn are good. There are \(\binom{${g}}{${k}} = ${U.choose(g, k)}\) such samples out of \(\binom{${n}}{${k}} = ${U.choose(n, k)}\).</div>
                   <div class="sol-step">$$P = 1 - \frac{\binom{${g}}{${k}}}{\binom{${n}}{${k}}} = 1 - ${U.fmt(none)} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Note the draws are <em>not</em> independent here — without replacement, counting subsets is the safe route.</div>`,
            };
          },
        },
        {
          name: "At least two heads",
          make() {
            const n = U.randInt(4, 8);
            const ans = 1 - (n + 1) / Math.pow(2, n);
            return {
              q: R`A fair coin is flipped ${n} times. What is the probability of getting <b>at least two</b> heads?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">"At least two" has ${n - 1} cases; its complement has only two: zero heads or exactly one head.</div>
                   <div class="sol-step">\(P(0\text{ heads}) = \frac{1}{2^{${n}}}\), \(P(1\text{ head}) = \frac{${n}}{2^{${n}}}\) (choose which flip is the head).</div>
                   <div class="sol-step">$$P = 1 - \frac{1 + ${n}}{2^{${n}}} = 1 - \frac{${n + 1}}{${Math.pow(2, n)}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "At least one card of a suit",
          make() {
            const k = U.randInt(3, 5);
            const suit = U.pick(["hearts", "spades", "clubs", "diamonds"]);
            const none = U.choose(39, k) / U.choose(52, k);
            const ans = 1 - none;
            return {
              q: R`${k} cards are dealt from a standard 52-card deck. What is the probability that the hand contains <b>at least one</b> card of the ${suit} suit?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Complement: no ${suit} at all, i.e. all ${k} cards come from the other \(52 - 13 = 39\) cards.</div>
                   <div class="sol-step">$$P(\text{no } \text{${suit}}) = \frac{\binom{39}{${k}}}{\binom{52}{${k}}} = \frac{${U.choose(39, k)}}{${U.choose(52, k)}} \approx ${U.fmt(none)}$$</div>
                   <div class="sol-step">$$P(\text{at least one}) = 1 - ${U.fmt(none)} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "At least one shared birthday",
          make() {
            const days = U.pick([365, 12, 30]);
            const n = days === 365 ? U.randInt(4, 12) : U.randInt(3, 5);
            const unit = days === 365 ? "birthday" : days === 12 ? "birth month" : "birthday within a 30-day month";
            let distinct = 1;
            for (let i = 0; i < n; i++) distinct *= (days - i) / days;
            const ans = 1 - distinct;
            return {
              q: R`${n} people are selected at random, each equally likely to have any of the ${days} possible values of their ${unit}, independently. What is the probability that <b>at least two</b> of them share the same value?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">"At least two share" covers many messy cases; its complement — <b>all ${n} distinct</b> — is a single product.</div>
                   <div class="sol-step">$$P(\text{all distinct}) = ${Array.from({ length: n }, (_, i) => `\\tfrac{${days - i}}{${days}}`).join("\\cdot")} \approx ${U.fmt(distinct)}$$</div>
                   <div class="sol-step">$$P(\text{at least one match}) = 1 - ${U.fmt(distinct)} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "At least one system survives",
          make() {
            const n = U.randInt(2, 4);
            const p = U.randInt(15, 40) / 100;
            const ans = 1 - Math.pow(p, n);
            return {
              q: R`A building has ${n} independent backup generators. Each one fails to start with probability ${p}. What is the probability that <b>at least one</b> generator starts?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Complement: <em>every</em> generator fails. By independence that is a product of the ${n} failure probabilities.</div>
                   <div class="sol-step">$$P(\text{all fail}) = ${p}^{${n}} = ${U.fmt(Math.pow(p, n), 5)}$$</div>
                   <div class="sol-step">$$P(\text{at least one starts}) = 1 - ${U.fmt(Math.pow(p, n), 5)} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "At least one match (the hat-check problem)",
          make() {
            const n = U.randInt(3, 6);
            let sum = 0;
            for (let k = 1; k <= n; k++) sum += Math.pow(-1, k + 1) / U.factorial(k);
            const ans = sum;
            const terms = Array.from({ length: n }, (_, i) => `${i % 2 === 0 ? (i === 0 ? "" : "+ ") : "- "}\\tfrac{1}{${i + 1}!}`).join(" ");
            return {
              q: R`${n} people check their coats and the coats are returned in a <b>uniformly random</b> order. What is the probability that <b>at least one</b> person gets their own coat back?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Let \(A_i\) = "person \(i\) gets their own coat". We want \(P(A_1 \cup \cdots \cup A_{${n}})\), so use <b>inclusion–exclusion</b>.</div>
                   <div class="sol-step">Fixing any \(k\) specified people's coats leaves \((${n}-k)!\) arrangements, so each \(k\)-fold intersection has probability \(\frac{(${n}-k)!}{${n}!}\), and there are \(\binom{${n}}{k}\) of them — the two combine to \(\frac{1}{k!}\).</div>
                   <div class="sol-step">$$P = ${terms} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">As \(n\) grows this approaches \(1 - e^{-1} \approx 0.6321\) — it barely depends on \(n\).</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c1-gen-vans",
      name: "Random groups & random splits",
      blurb: "Van seats, same-team questions, capture–recapture.",
      variants: [
        {
          name: "Exact composition of a random group",
          make() {
            const g = U.randInt(4, 6), f = U.randInt(5, 7), c = 3;
            const total = g + f + c;
            const vg = U.randInt(2, 3), vf = U.randInt(3, 4), vc = U.randInt(1, 2);
            const vsize = vg + vf + vc;
            const totalWays = U.choose(total, vsize);
            const fav = U.choose(g, vg) * U.choose(f, vf) * U.choose(c, vc);
            const ans = fav / totalWays;
            return {
              q: R`A basketball team has ${total} players: ${g} guards, ${f} forwards, and ${c} centres. ${vsize} players are chosen at random to ride in the first van. What is the probability the van holds exactly ${vg} guards, ${vf} forwards, and ${vc} ${U.plural(vc, "centre")}?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">All \(\binom{${total}}{${vsize}} = ${totalWays}\) ways to fill the van are equally likely.</div>
                   <div class="sol-step">Favourable selections: \(\binom{${g}}{${vg}}\binom{${f}}{${vf}}\binom{${c}}{${vc}} = ${U.choose(g, vg)} \times ${U.choose(f, vf)} \times ${U.choose(c, vc)} = ${fav}\).</div>
                   <div class="sol-step">$$P = \frac{${fav}}{${totalWays}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Do two specific people land together?",
          make() {
            const m = U.randInt(3, 6);
            const n = 2 * m;
            const ans = (m - 1) / (n - 1);
            return {
              q: R`${n} students are split at random into two teams of ${m}. What is the probability that Ana and Ben end up on the <b>same</b> team?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Condition on Ana's team — by symmetry it does not matter which one. Of the remaining \(${n} - 1 = ${n - 1}\) students, exactly \(${m} - 1 = ${m - 1}\) will join her.</div>
                   <div class="sol-step">Ben is equally likely to be any one of those ${n - 1} students, so $$P = \frac{${m - 1}}{${n - 1}} \approx ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Counting check: \(\frac{2\binom{${n - 2}}{${m - 2}}}{\binom{${n}}{${m}}} = ${U.fmt(2 * U.choose(n - 2, m - 2) / U.choose(n, m))}\).</div>`,
            };
          },
        },
        {
          name: "Capture–recapture",
          make() {
            const T = U.randInt(4, 8), N = T + U.randInt(10, 20), n = U.randInt(4, 6), k = U.randInt(1, 2);
            const fav = U.choose(T, k) * U.choose(N - T, n - k);
            const tot = U.choose(N, n);
            const ans = fav / tot;
            return {
              q: R`A pond holds ${N} fish, of which ${T} were tagged earlier. A researcher nets ${n} fish at random (without replacement). What is the probability that exactly ${k} of them ${U.plural(k, "is", "are")} tagged?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Every set of ${n} fish is equally likely: \(\binom{${N}}{${n}} = ${tot}\) catches in all.</div>
                   <div class="sol-step">Favourable catches: ${k} of the ${T} tagged and \(${n - k}\) of the ${N - T} untagged: \(\binom{${T}}{${k}}\binom{${N - T}}{${n - k}} = ${fav}\).</div>
                   <div class="sol-step">$$P = \frac{${fav}}{${tot}} \approx ${U.fmt(ans)}$$ (This is the hypergeometric distribution — it returns in Chapter 3.)</div>`,
            };
          },
        },
        {
          name: "At least one of each type",
          make() {
            const g = U.randInt(4, 7), b = U.randInt(4, 7), k = U.randInt(3, 4);
            const n = g + b;
            const tot = U.choose(n, k);
            const allG = U.choose(g, k), allB = U.choose(b, k);
            const ans = 1 - (allG + allB) / tot;
            return {
              q: R`A task force of ${k} is chosen at random from ${g} engineers and ${b} designers. What is the probability it contains <b>at least one of each</b> profession?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The complement splits into two <b>disjoint</b> bad cases: all engineers, or all designers.</div>
                   <div class="sol-step">\(\binom{${g}}{${k}} = ${allG}\) all-engineer groups and \(\binom{${b}}{${k}} = ${allB}\) all-designer groups, out of \(\binom{${n}}{${k}} = ${tot}\).</div>
                   <div class="sol-step">$$P = 1 - \frac{${allG} + ${allB}}{${tot}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Random assignment to bins",
          make() {
            const n = U.randInt(3, 5), c = U.randInt(2, 3);
            const ans = c / Math.pow(c, n);
            return {
              q: R`${n} distinct gifts are handed out to ${c} children, each gift going to a child chosen uniformly at random and independently. What is the probability that <b>one child receives all ${n} gifts</b>?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Total equally likely assignments: \(${c}^{${n}} = ${Math.pow(c, n)}\).</div>
                   <div class="sol-step">Favourable: all gifts to child 1, or all to child 2${c === 3 ? ", or all to child 3" : ""} — \(${c}\) assignments, and these are disjoint.</div>
                   <div class="sol-step">$$P = \frac{${c}}{${c}^{${n}}} = \frac{1}{${c}^{${n - 1}}} \approx ${U.fmt(ans)}$$</div>`,
            };
          },
        },
      ],
    }),

    MATH340.makeGenerator({
      id: "c1-gen-rules",
      name: "Axioms, complements & Venn regions",
      blurb: "Reasoning with the rules themselves — including bounds and impossible values.",
      variants: [
        {
          name: "B but not A",
          make() {
            const pb = U.randInt(40, 70) / 100;
            const pab = U.randInt(10, Math.round(pb * 100) - 10) / 100;
            const ans = U.round(pb - pab, 4);
            return {
              q: R`For events \(A\) and \(B\), \(P(B) = ${pb}\) and \(P(A \cap B) = ${pab}\). Find \(P(A^c \cap B)\), the probability that \(B\) occurs but \(A\) does not.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(B\) splits into two <b>disjoint</b> pieces: the part inside \(A\) and the part outside it: $$B = (A \cap B) \cup (A^c \cap B).$$</div>
                   <div class="sol-step">By the axiom for disjoint events, $$P(A^c \cap B) = P(B) - P(A \cap B) = ${pb} - ${pab} = ${U.fmt(ans)}$$</div>
                   <div class="sol-step">Note \(P(A)\) is never needed — only how much of \(B\) the overlap uses up.</div>`,
            };
          },
        },
        {
          name: "Smallest possible overlap",
          make() {
            const pa = U.randInt(55, 85) / 100, pb = U.randInt(55, 85) / 100;
            const ans = U.round(Math.max(0, pa + pb - 1), 4);
            return {
              q: R`Suppose \(P(A) = ${pa}\) and \(P(B) = ${pb}\), but nothing else is known. What is the <b>smallest possible</b> value of \(P(A \cap B)\)?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">From the addition rule, \(P(A \cap B) = P(A) + P(B) - P(A \cup B)\). The overlap is smallest when the union is as large as possible, and \(P(A \cup B) \le 1\).</div>
                   <div class="sol-step">$$P(A \cap B) \ge P(A) + P(B) - 1 = ${pa} + ${pb} - 1 = ${U.fmt(ans)}$$</div>
                   <div class="sol-step">This is the <b>Bonferroni inequality</b>: two events covering more than the whole space must overlap.</div>`,
            };
          },
        },
        {
          name: "Largest possible union",
          make() {
            const pa = U.randInt(20, 60) / 100, pb = U.randInt(20, 60) / 100;
            const ans = U.round(Math.min(1, pa + pb), 4);
            return {
              q: R`Suppose \(P(A) = ${pa}\) and \(P(B) = ${pb}\), with no further information. What is the <b>largest possible</b> value of \(P(A \cup B)\)?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(P(A \cup B) = P(A) + P(B) - P(A \cap B)\) is largest when the overlap is smallest, i.e. \(P(A \cap B) = 0\) (disjoint events) — provided the sum does not exceed 1.</div>
                   <div class="sol-step">$$P(A \cup B) \le \min\{P(A) + P(B),\, 1\} = \min\{${U.fmt(pa + pb)}, 1\} = ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Completing a partition",
          make() {
            const parts = [U.randInt(10, 30), U.randInt(10, 30), U.randInt(10, 25)];
            const used = parts.reduce((a, b) => a + b, 0);
            const rest = 100 - used;
            const ans = rest / 100;
            const [g1, g2, g3, g4] = U.pick([
              ["first-years", "sophomores", "juniors", "seniors"],
              ["bus riders", "cyclists", "walkers", "drivers"],
              ["grade A", "grade B", "grade C", "grade D or below"],
            ]);
            return {
              q: R`Every student falls into exactly one of four categories: ${g1}, ${g2}, ${g3}, ${g4}. A student is chosen at random; the probabilities of the first three categories are ${U.fmt(parts[0] / 100)}, ${U.fmt(parts[1] / 100)}, and ${U.fmt(parts[2] / 100)}. What is the probability of the fourth (${g4})?`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">The four categories are disjoint and their union is all of \(S\), so their probabilities add to \(P(S) = 1\).</div>
                   <div class="sol-step">$$P(\text{${g4}}) = 1 - (${U.fmt(parts[0] / 100)} + ${U.fmt(parts[1] / 100)} + ${U.fmt(parts[2] / 100)}) = ${U.fmt(ans)}$$</div>`,
            };
          },
        },
        {
          name: "Exactly two of three events",
          make() {
            const pairP = U.randInt(15, 30) / 100;
            const triP = U.randInt(4, Math.round(pairP * 100) - 5) / 100;
            const ans = U.round(3 * pairP - 3 * triP, 4);
            return {
              q: R`Three events \(A, B, C\) are such that each <b>pair</b> intersects with probability ${pairP} (that is, \(P(A \cap B) = P(A \cap C) = P(B \cap C) = ${pairP}\)) and \(P(A \cap B \cap C) = ${triP}\). Find the probability that <b>exactly two</b> of the three events occur.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">\(P(A \cap B)\) includes outcomes where \(C\) also happens. Removing those leaves "\(A\) and \(B\) but not \(C\)": $$P(A \cap B \cap C^c) = ${pairP} - ${triP} = ${U.fmt(pairP - triP)}$$</div>
                   <div class="sol-step">The three "exactly two" regions are disjoint, so add them: $$3(${pairP} - ${triP}) = ${U.fmt(ans)}$$</div>
                   <div class="sol-step">In general: \(P(\text{exactly two}) = \sum P(\text{pairs}) - 3P(A \cap B \cap C)\).</div>`,
            };
          },
        },
        {
          name: "Monotonicity with nested events",
          make() {
            const pa = U.randInt(15, 40) / 100;
            const pb = U.round(pa + U.randInt(15, 40) / 100, 4);
            const askSubset = Math.random() < 0.5;
            const ans = askSubset ? U.round(pb - pa, 4) : 1;
            return {
              q: R`Event \(A\) implies event \(B\) (that is, \(A \subseteq B\)), with \(P(A) = ${pa}\) and \(P(B) = ${U.fmt(pb)}\). Find ${askSubset ? R`\(P(B \cap A^c)\)` : R`\(P(B \mid A)\), the probability of \(B\) given that \(A\) occurred`}.`,
              answer: ans, kind: "prob",
              sol: R`<div class="sol-step">Since \(A \subseteq B\), we have \(A \cap B = A\), and monotonicity guarantees \(P(A) \le P(B)\) — consistent with \(${pa} \le ${U.fmt(pb)}\).</div>
                   ${askSubset
                     ? R`<div class="sol-step">\(B\) is the disjoint union of \(A\) and \(B \cap A^c\), so $$P(B \cap A^c) = P(B) - P(A) = ${U.fmt(pb)} - ${pa} = ${U.fmt(ans)}$$</div>`
                     : R`<div class="sol-step">$$P(B \mid A) = \frac{P(A \cap B)}{P(A)} = \frac{P(A)}{P(A)} = 1$$ If \(A\) occurs then \(B\) must occur too — the numbers are a distraction.</div>`}`,
            };
          },
        },
      ],
    }),
  ];


  /* ---------------- how to choose a method ----------------
   * Knowing the formulas is the easy half. Under time pressure the
   * marks go to whoever reads the wording and picks the right tool, so
   * the Reference page renders this as a decision table. */
  const methodGuide = [
    {
      when: R`"in order", "arrangement", "first / second / third", distinct <em>roles</em> (president, treasurer)`,
      use: R`Permutation \(\frac{n!}{(n-k)!}\)`,
      why: R`Swapping two chosen people gives a different outcome, so the orderings must be counted separately.`,
    },
    {
      when: R`"committee", "team", "hand of cards", "select \(k\) of them" with no roles attached`,
      use: R`Combination \(\binom{n}{k}\)`,
      why: R`The members are interchangeable, so the \(k!\) orderings of one chosen set are the same outcome.`,
    },
    {
      when: R`"may repeat", "with replacement", each slot drawn from the same pool`,
      use: R`\(n^k\)`,
      why: R`Every one of the \(k\) positions still has all \(n\) options, so the multiplication rule applies unchanged.`,
    },
    {
      when: R`"at least one", "at least two", "none of them"`,
      use: R`Complement \(1 - P(\text{none})\)`,
      why: R`"At least one" splits into many disjoint cases; its complement is a single case. Almost always the shorter route.`,
    },
    {
      when: R`identical objects, repeated letters, unlabelled groups, a circular table`,
      use: R`Divide out the overcount`,
      why: R`Count as if everything were distinct, then divide by the number of ways each genuine outcome was produced (\(2!\), \(k!\), \(2^g g!\), \(n\), …).`,
    },
    {
      when: R`identical items handed out to distinct recipients, "a child may get none"`,
      use: R`Stars and bars \(\binom{k+n-1}{n-1}\)`,
      why: R`Only the counts matter, so encode a distribution as \(k\) stars split by \(n-1\) bars and choose the bar positions.`,
    },
    {
      when: R`two or three overlapping groups, "or", "either… or…", a Venn diagram`,
      use: R`Inclusion–exclusion`,
      why: R`Adding the pieces double-counts the overlaps; subtract pairs, add back triples. Signs alternate.`,
    },
    {
      when: R`some members must be on the committee, or must be left off`,
      use: R`Fix them first, then choose the rest`,
      why: R`A forced member is not a choice: reduce both \(n\) and \(k\) by one and carry on.`,
    },
    {
      when: R`"equally likely", "at random", "fair", and the outcomes are finite`,
      use: R`Naive probability \(|A|/|S|\)`,
      why: R`Count favourable and total <em>with the same convention</em> — both ordered or both unordered — or the ratio is meaningless.`,
    },
    {
      when: R`a probability is asked for but the sample space is infinite or outcomes are not equally likely`,
      use: R`The axioms, not counting`,
      why: R`The naive definition needs finiteness <b>and</b> equal likelihood. Without both, work from \(P(\emptyset)=0\), \(P(S)=1\) and countable additivity.`,
    },
  ];

  MATH340.registerUnit({
    id: "ch1",
    title: "Chapter 1 · Probability and Counting",
    short: "Ch 1 · Counting",
    week: 1,
    order: 1,
    description: "Sample spaces, naive probability, the multiplication rule, permutations and combinations, axioms of probability, and inclusion–exclusion.",
    flashcards,
    generators,
    methodGuide,
  });
})();
