# PokerPro

Poker, for people who already know the math.

A single-file browser course that goes from *"what beats what"* to Bayesian exploitation, structured the way you'd learn a trading discipline rather than a card game. No dependencies, no build step at runtime, no network calls. One HTML file, 255kb.

### ▶ **[Open the trainer → izenstae.github.io/PokerPro](https://izenstae.github.io/PokerPro/)**

Runs entirely in your browser. Nothing to install. Includes four live CFR solvers — Kuhn, Leduc, a **river subgame solver** you point at your own ranges and board (with a Monte Carlo engine and strength-bucket abstraction on a switch), and a **two-street turn solver** that solves every river as a subgame and backs the value up.

---

## What's in it

| Layer | Topic | Drills |
|---|---|---|
| **0** | The game: rankings, best-five-of-seven, position | hand ladder, read your hand, who wins |
| **1** | Equity and pot odds | pot odds, outs, fold equity, implied, preflop, call/fold |
| **2** | Combinatorics of ranges | combos, blockers, what beats you |
| **3** | Game theory: indifference, alpha, MDF, sizing | + **four solver labs** |
| **4** | Variance and bankroll: t-stat, sample size, ruin, Kelly | 4 drills |
| **5** | Exploitative deviation: Bayes, updating, deviating | 3 drills |

29 lessons, 23 drill generators, checkpoints that unlock progress, and progress that persists.

## The labs

Layer 3 contains four working solvers, not diagrams of solvers.

**Kuhn poker.** 12 information sets. Vanilla CFR with regret matching, exploitability computed exactly by enumerating all 64 pure best responses. Converges to the known game value of -1/18 in about a second, and rediscovers alpha unaided: it bets the king exactly 3x as often as it bluffs the jack.

**Leduc hold'em.** 288 information sets, two streets, one public card. Brute-force exploitability is impossible here (2^144 pure strategies), so best response is computed properly: a tree walk carrying a vector of the opponent's reach probability per card, which makes the acting player's information set fully determined at every node. Converges to about -0.086 with exploitability under 0.02 in ~5 seconds.

The Leduc lab is where the course earns its shape. The same jack checks 100% on a jack board (a trap) and bluffs ~8% on a king board. Nobody wrote that rule down. It falls out of regret matching, and it's card removal meeting equilibrium.

**The river subgame.** The same regret-matching loop, pointed at a real spot: a fixed five-card board, two ranges written in the layer 2 notation (`QQ+, AJs+, KQ`), and a small bet-size tree (check / bet ½ / bet pot, then fold / call). Every combo pair that survives card removal is one deal, its showdown decided once by the layer 0 evaluator and cached. Exploitability is the same vectorized best response as Leduc, exact, and it walks under 0.02 in a couple of seconds on the default spot. The ranges and board are editable — type the spot you actually face and solve it.

The solver polarizes unprompted (nuts and pure air jam the pot, medium hands check back), and it defends the pot-size bet at roughly the alpha-derived minimum of two thirds — but chooses *which* bluff-catchers to keep by which cards block the value combos. MDF told you how much to defend; card removal told you which hands. The river lab is the one place you watch both answers fall out of the same forty lines at once. Two switches sit above the numbers: **Engine** flips between exact enumeration and **Monte Carlo CFR** (external sampling, one deal per iteration — the same equilibrium, reached fast enough to take ranges the enumerator refuses); **Abstraction** groups combos into strength buckets so the info-set count stops growing with the range, at a small, visible cost in the exploitability floor.

**The turn.** The first street with a card still to come, so a bet is also a bet about the river — and you can't solve it without knowing what the rivers are worth. So it solves them: for every one of the ~48 river cards it builds the river subgame, solves it, reads the value of each surviving combo pair, and averages those into a per-pair continuation value. Then it solves the turn's own betting tree, where the "showdown" leaves pay out that backed-up value times the pot that arrives. Because every bet is pot-fractional, each river is solved once and reused at any size. That's backward induction — a river solver called 48 times with the turn wrapped around the answers — and it's exactly how a river solver becomes a real one. The 48 solves are spread across animation frames so the page never freezes, and the turn shows the same read as the river one street earlier: value hands bet, missed draws barrel as bluffs because a card is still coming, the nuts sometimes trap.

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
- `river.test.js` — river payoff units, exploitability falls under 0.05, Monte Carlo agrees with the enumerator on the value, strength buckets cut the info sets and finer buckets are less exploitable, a dominant range wins the dead pot (18 assertions)
- `turn.test.js` — turn payoff units, all 48 river subgames solved and backed up, exploitability falls under 0.06, best responses bracket the game value, the chunked backup reproduces the one-shot solve, abstraction cuts the info sets (14 assertions)

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
  river.js          river subgame CFR (vanilla + Monte Carlo) with bucket abstraction
  turn.js           two-street turn solver: solve every river, back the value up
  drills.js         the 17 generators for layers 0, 2, 3, 4, 5
  lessons.js        layer 1 lesson content
  course.js         layers 0, 2, 3, 4, 5 + assembly + reading list
  app.tpl.html      UI shell, CSS, and the four lab widgets
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

The road every commercial solver takes from a river solver is now built into the page, and it was engineering rather than a new idea:

- **Sampling — done.** `src/river.js` has a Monte Carlo engine (external-sampling MCCFR) beside the enumerator, on a switch in the river lab. It touches one deal per iteration instead of sweeping all of them, reaches the same equilibrium, and takes ranges tens of thousands of pairs wide that the enumerator won't.
- **A second street — done.** `src/turn.js` is a two-street turn solver: it solves each of the 48 river subgames, backs each one's per-pair value up, and solves the turn's betting tree against those continuations. It's the fourth lab in Layer 3.
- **Abstraction — done.** Both solvers can bucket combos into strength classes so the info-set count stops growing with the range. It's the switch that makes the turn lab's 48 nested solves cheap enough for a browser, and its cost shows up directly in the exploitability number.

What's still ahead is the same recursion run deeper, and the one real approximation this page leaves open:

- **Subgame resolving.** The turn solver decouples: every river is solved as if both full ranges reach it, when the turn's betting actually decides which hands get there. Real solvers re-solve each subgame with the range that arrives — that's the gap between "close and correctly shaped" and "exact."
- **More streets and sizes.** Run the same backward induction from the river to the flop, with more bet sizes and raises in the tree, and lean on sampling and abstraction to hold the size down.

## Reading

Chen & Ankenman, *The Mathematics of Poker* · Brokos, *Play Optimal Poker* · Acevedo, *Modern Poker Theory* · Zinkevich et al. 2007 (CFR) · Bowling et al. 2015 · Brown & Sandholm (Libratus, Pluribus)

## License

MIT
