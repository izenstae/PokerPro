# PokerPro

Poker, for people who already know the math.

A single-file browser course that goes from *"what beats what"* to Bayesian exploitation, structured the way you'd learn a trading discipline rather than a card game. No dependencies, no build step at runtime, no network calls. One HTML file, 174kb.

**[Live demo](https://izenstae.github.io/PokerPro/)** (live once Pages is enabled)

---

## What's in it

| Layer | Topic | Drills |
|---|---|---|
| **0** | The game: rankings, best-five-of-seven, position | hand ladder, read your hand, who wins |
| **1** | Equity and pot odds | pot odds, outs, fold equity, implied, preflop, call/fold |
| **2** | Combinatorics of ranges | combos, blockers, what beats you |
| **3** | Game theory: indifference, alpha, MDF, sizing | + **two CFR labs** |
| **4** | Variance and bankroll: t-stat, sample size, ruin, Kelly | 4 drills |
| **5** | Exploitative deviation: Bayes, updating, deviating | 3 drills |

27 lessons, 23 drill generators, checkpoints that unlock progress, and progress that persists.

## The labs

Layer 3 contains two working solvers, not diagrams of solvers.

**Kuhn poker.** 12 information sets. Vanilla CFR with regret matching, exploitability computed exactly by enumerating all 64 pure best responses. Converges to the known game value of -1/18 in about a second, and rediscovers alpha unaided: it bets the king exactly 3x as often as it bluffs the jack.

**Leduc hold'em.** 288 information sets, two streets, one public card. Brute-force exploitability is impossible here (2^144 pure strategies), so best response is computed properly: a tree walk carrying a vector of the opponent's reach probability per card, which makes the acting player's information set fully determined at every node. Converges to about -0.086 with exploitability under 0.02 in ~5 seconds.

The Leduc lab is where the course earns its shape. The same jack checks 100% on a jack board (a trap) and bluffs ~8% on a king board. Nobody wrote that rule down. It falls out of regret matching, and it's card removal meeting equilibrium.

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

The river subgame. Layer 2's range engine already parses `QQ+, AJs+, KQs, AKo` into combos, applies card removal, and computes range-vs-hand equity. Point the CFR machinery in `leduc.js` at a fixed board with two real ranges and a small bet-size tree, and you have a solver for the spot you actually face.

## Reading

Chen & Ankenman, *The Mathematics of Poker* · Brokos, *Play Optimal Poker* · Acevedo, *Modern Poker Theory* · Zinkevich et al. 2007 (CFR) · Bowling et al. 2015 · Brown & Sandholm (Libratus, Pluribus)

## License

MIT
