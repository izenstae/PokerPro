# PokerPro

Poker, for people who already know the math.

A single-file browser course that goes from *"what beats what"* to Bayesian exploitation, structured the way you'd learn a trading discipline rather than a card game. No dependencies, no build step at runtime, no network calls. One HTML file, 217kb.

### ▶ **[Open the trainer → izenstae.github.io/PokerPro](https://izenstae.github.io/PokerPro/)**

Runs entirely in your browser. Nothing to install. Includes three live CFR solvers — Kuhn, Leduc, and a **river subgame solver** you point at your own ranges and board.

---

## What's in it

| Layer | Topic | Drills |
|---|---|---|
| **0** | The game: rankings, best-five-of-seven, position | hand ladder, read your hand, who wins |
| **1** | Equity and pot odds | pot odds, outs, fold equity, implied, preflop, call/fold |
| **2** | Combinatorics of ranges | combos, blockers, what beats you |
| **3** | Game theory: indifference, alpha, MDF, sizing | + **three solver labs** |
| **4** | Variance and bankroll: t-stat, sample size, ruin, Kelly | 4 drills |
| **5** | Exploitative deviation: Bayes, updating, deviating | 3 drills |

28 lessons, 23 drill generators, checkpoints that unlock progress, and progress that persists.

## The labs

Layer 3 contains three working solvers, not diagrams of solvers.

**Kuhn poker.** 12 information sets. Vanilla CFR with regret matching, exploitability computed exactly by enumerating all 64 pure best responses. Converges to the known game value of -1/18 in about a second, and rediscovers alpha unaided: it bets the king exactly 3x as often as it bluffs the jack.

**Leduc hold'em.** 288 information sets, two streets, one public card. Brute-force exploitability is impossible here (2^144 pure strategies), so best response is computed properly: a tree walk carrying a vector of the opponent's reach probability per card, which makes the acting player's information set fully determined at every node. Converges to about -0.086 with exploitability under 0.02 in ~5 seconds.

The Leduc lab is where the course earns its shape. The same jack checks 100% on a jack board (a trap) and bluffs ~8% on a king board. Nobody wrote that rule down. It falls out of regret matching, and it's card removal meeting equilibrium.

**The river subgame.** The same regret-matching loop, pointed at a real spot: a fixed five-card board, two ranges written in the layer 2 notation (`QQ+, AJs+, KQ`), and a small bet-size tree (check / bet ½ / bet pot, then fold / call). Every combo pair that survives card removal is one deal, its showdown decided once by the layer 0 evaluator and cached. Exploitability is the same vectorized best response as Leduc, exact, and it walks under 0.02 in a couple of seconds on the default spot. The ranges and board are editable — type the spot you actually face and solve it.

It's where the whole course closes. The solver polarizes unprompted (nuts and pure air jam the pot, medium hands check back), and it defends the pot-size bet at roughly the alpha-derived minimum of two thirds — but chooses *which* bluff-catchers to keep by which cards block the value combos. MDF told you how much to defend; card removal told you which hands. The river lab is the one place you watch both answers fall out of the same forty lines at once.

## Verified, not remembered

Every number taught in the lessons was computed by the engine before being written down, and several first drafts were wrong. AA vs AK is 93/7, not 88/12. The suited bonus is +3.3 points (AKo vs 77 is 44.7%, AKs is 48.0%), measured rather than quoted.

```
npm test
```

- `engine.test.js` — 27 tests on the 7-card evaluator
- `range.test.js` — 19 tests on notation parsing, card removal, blockers, range equity
- `drills.test.js` — all 23 generators, 200 draws each
- `soak.js` — 690 questions, every UI invariant and both grading directions
- `cfr.test.js` — Kuhn converges to the full known equilibrium (8 assertions)
- `leduc.test.js` — Leduc reaches 288 infosets, exploitability -> 0, best responses bracket the game value
- `river.test.js` — river payoff units, exploitability falls under 0.05, best responses bracket the game value, a dominant range wins the dead pot (13 assertions)

`npm run test:brute` cross-checks the evaluator against brute force over 200k hands (slow).

## Layout

```
index.html          the build output, this is what Pages serves
build.js            inlines src/ into index.html. no bundler, no deps
src/
  engine.js         cards, 7-card evaluator, equity, layer 1 drills
  range.js          range notation, combos, card removal, blockers
  cfr.js            Kuhn poker CFR + exact exploitability
  leduc.js          Leduc hold'em CFR + vectorized best response
  river.js          river subgame CFR over two ranges + a fixed board
  drills.js         the 17 generators for layers 0, 2, 3, 4, 5
  lessons.js        layer 1 lesson content
  course.js         layers 0, 2, 3, 4, 5 + assembly + reading list
  app.tpl.html      UI shell, CSS, and the two lab widgets
test/
```

## Build

```
npm run build     # src/ -> index.html
npm run serve     # http://localhost:8000
```

The build is a 20-line script that reads the modules, strips their node export blocks, and substitutes them into two placeholders in the template. It refuses to write a file if a placeholder survives or an export leaks.

## Deploy

Push, then **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**. Pages serves `index.html` from the root automatically.

## Storage

Progress is saved through an adapter that feature-detects its host:

1. inside a Claude artifact → the sandboxed key-value store
2. self-hosted or opened from disk → `localStorage`
3. anywhere that blocks both → session only, and the header says so

Every branch is probed and wrapped, so a refusal degrades instead of throwing.

## Where to take it next

The river subgame is built — it's `src/river.js` and the third lab in Layer 3. What's left is the road every commercial solver takes from here, and it's engineering rather than a new idea:

- **Sample the deals instead of enumerating them.** Vanilla CFR sweeps every combo pair each iteration, which is why the river lab crawls on very wide ranges. Monte Carlo CFR (external sampling) samples one deal per iteration and reaches the same equilibrium far faster.
- **Add a second street.** Solve the turn by treating each river as a subgame and backing the equity up, which is the step from a river solver to a real one.
- **Abstraction.** Bucket similar combos so the tree stops growing with the range. This is the piece that took limit hold'em from solvable-on-paper to actually solved.

## Reading

Chen & Ankenman, *The Mathematics of Poker* · Brokos, *Play Optimal Poker* · Acevedo, *Modern Poker Theory* · Zinkevich et al. 2007 (CFR) · Bowling et al. 2015 · Brown & Sandholm (Libratus, Pluribus)

## License

MIT
