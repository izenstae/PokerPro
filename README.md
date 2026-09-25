# PokerPro

Poker, for people who already know the math.

A single-file browser course that goes from *"what beats what"* to Bayesian exploitation, structured the way you'd learn a trading discipline rather than a card game. The goal isn't to have read it. The goal is that the maths turns into reflex. A built-in spaced-repetition schedule decides what you practise each day and only calls a skill learned once you're right *and* fast, on separate days, weeks apart. No dependencies, no build step at runtime, and no network calls unless you turn on sync. One HTML file, about 280kb.

### ▶ **[Open the trainer → izenstae.github.io/PokerPro](https://izenstae.github.io/PokerPro/)**

Runs entirely in your browser. Nothing to install. Open **Train** once a day, clear what's due (usually 10 to 20 minutes), and the schedule handles the rest. Includes four live CFR solvers — Kuhn, Leduc, a **river subgame solver** you point at your own ranges and board (with a Monte Carlo engine and strength-bucket abstraction on a switch), and a **two-street turn solver** that solves every river as a subgame and backs the value up.

---

## What's in it

A path in nine stages, from never having played to the maths strong players use. New lessons are marked ★.

| Stage | Topic | Lessons |
|---|---|---|
| **0** | The game | ★ how a hand is played (blinds, actions, min-raises, pot counting), the ladder, reading your hand, the shape of a hand, ★ seats and position |
| **1** | Odds and equity | ★ probability (C(n,k), complements), pot odds, outs, equity vs price, ★ expected value, fold equity, implied odds, preflop shapes, capstone |
| **2** | Preflop | ★ opening ranges by seat, ★ 3-bets (break-even folds, the price of calling), ★ stack-to-pot ratio |
| **3** | Ranges | combos, card removal, blockers, counting what beats you |
| **4** | Game theory | indifference, alpha, MDF, sizing, ★ the AKQ game, **four solver labs** |
| **5** | Postflop strategy | ★ equity realisation, ★ c-bets, ★ geometric sizing, ★ bluffing across streets |
| **6** | Tournaments | ★ push or fold, ★ ICM (Malmuth–Harville) |
| **7** | Variance and bankroll | t-stat, sample size, risk of ruin, Kelly |
| **8** | Exploitative play | Bayes and blockers, updating reads, deviating |

43 lessons (39 with a checkpoint, 4 labs), 37 drill generators, 39 formulas in the Library (every numeric anchor checked by a test), and a daily schedule that keeps all of it from fading. Every new lesson is built on a formula from the reading list: Chen and Ankenman's *Mathematics of Poker* (the AKQ game, multi-street bluffing, geometric sizing), Acevedo's *Modern Poker Theory* (equity realisation, SPR), and the standard tournament models (Sklansky–Chubukov, Malmuth–Harville ICM).

The app has four sections, plus sync. On a phone or iPad in portrait they sit in a bottom tab bar:

- **Home**: one clear next step (reviews due, or the next lesson), your streak and time, where you are on the path, what is coming up on the schedule, and a formula of the day.
- **Learn**: the path, stage by stage, with progress and the next lesson marked. Each lesson has a section map, formula cards with every symbol explained, definitions on key terms (hover or tap the dotted underline), a free "Try one" question before the checkpoint, and previous/next links.
- **Practice**: today's reviews, free practice on any mix of drills, and the skill table with each skill's box, accuracy, pace and next review.
- **Library**: every formula in the course (searchable, grouped by topic, each linked to its lesson), a glossary, and the reading list.
- **Sync**: tap the indicator at the top right to share progress between devices.

Every screen has its own address (`#/learn/alpha`, `#/library/formulas`), so the back button and bookmarks work.

## How it makes things stick

Every drill is a *skill*, and so is every lesson's boxed "Commit this" rule. The skills run on a Leitner schedule (`src/srs.js`) built around a few well-established findings on durable learning:

| Principle | What the app does |
|---|---|
| **Spaced retrieval** | Each skill sits in one of 8 boxes. It moves up a box only on a day it's due, after 3 clean answers in a row (5 for a brand-new skill). The review gaps grow: 1, 3, 7, 16, 35, 80, 180 days. Practising a skill before it's due keeps it fresh but never moves it up. |
| **Fluency, not just accuracy** | Each drill has a time target. A skill's time goal starts at that target and gets 6% shorter per box, down to 60% of it. A right answer over the goal doesn't count toward moving up, because the clock is the honest test of whether something has become automatic. |
| **Immediate correction** | A miss drops the skill one box, makes it due again right away, and asks it again two questions later while the worked solution is still fresh. |
| **Interleaving** | Sessions mix skills and avoid asking the same skill twice in a row. Due skills make up most of a session, with a few questions from your other skills mixed in. |
| **Free recall** | Passing a lesson also schedules its rule as a recall card. You say the rule out loud, reveal it, and mark whether you got it. |
| **Distributed practice** | Train shows time trained, a 21-day chart and a day streak, and tells you when you've cleared everything due. Short daily sessions beat long weekend ones. |

A skill counts as **automatic** at box 6. To get there it needs clean, fast answers after gaps of 1, 3, 7, 16 and 35 days, so about two months of daily 15-minute sessions puts a skill there for good. The Train tab counts automatic skills out of 23 and shows overall progress toward the top box.

Passing a checkpoint schedules that drill and its rule for review the next day. Progress saved by earlier versions carries over: any lesson you'd already passed goes on the schedule, due now.

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
- `srs.test.js` — the schedule: early practice never moves a skill up, a due review does, slow answers don't count, the time goal gets shorter, misses drop a box, the picker favours due and weak skills, interleaves and brings a miss back two questions later, day streaks (25 assertions)

`npm run test:brute` cross-checks the evaluator against brute force over 200k hands (slow).

## Layout

```
index.html          the build output, this is what Pages serves
build.js            inlines src/ into index.html. no bundler, no deps
src/
  engine.js         cards, 7-card evaluator, equity, the stage 1 drills
  range.js          range notation, combos, card removal, blockers
  cfr.js            Kuhn poker CFR + exact exploitability
  leduc.js          Leduc hold'em CFR + vectorized best response
  river.js          river subgame CFR (vanilla + Monte Carlo) with bucket abstraction
  turn.js           two-street turn solver: solve every river, back the value up
  drills.js         the original 17 generators
  drills2.js        14 generators for the new lessons, and the 6-max opening chart
  srs.js            the schedule: Leitner boxes, time goals, skill picker, practice log
  sync.js           cross-device sync: the progress merge and a tiny GitHub Gist client
  library.js        the formula registry, the glossary, and the formula notation renderer
  lessons.js        stage 1 lesson content
  course.js         the original lessons outside stage 1, and the reading list
  lessons2.js       the lessons added for the zero-to-pro path
  path.js           the order: nine stages, which lessons each holds
  app.tpl.html      UI shell, CSS, Train view, sessions, and the four lab widgets
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

Lesson progress, drill stats, every skill's schedule and the daily practice log are saved under one key, through an adapter that feature-detects its host:

1. inside a Claude artifact → the sandboxed key-value store
2. self-hosted or opened from disk → `localStorage`
3. anywhere that blocks both → session only, and the header says so

Every branch is probed and wrapped, so a refusal degrades instead of throwing.

### Sync across devices

Browser storage belongs to one browser, so a computer and an iPad each keep their own copy. To share one, open the **Sync** tab (or tap the sync indicator at the top right), [create a GitHub token](https://github.com/settings/tokens/new?scopes=gist&description=PokerPro%20sync) with only the `gist` scope, and paste it on each device. The app finds or creates one secret gist, `pokerpro-progress.json`, and talks to the GitHub API directly. There's still no server of its own.

It syncs on load, a few seconds after you answer, and when you come back to the tab. Each sync pulls the gist, merges it with local progress, and pushes only if the gist is behind. The merge in `src/sync.js` is commutative and idempotent, so devices converge whatever order they sync in:

- passed lessons: the union
- each skill's schedule: the copy answered most recently
- the practice log: per day, the larger of each figure
- drill stats: the most recently reset copy, then the one with more answers

**Clear all progress** and **Reset stats** stamp a new epoch, and a newer epoch beats an older one outright, so a wipe spreads to other devices instead of being merged back in. The token lives only in that browser's storage.

The Sync tab shows everything about it: a status headline with a fix for each kind of failure, this device and the cloud side by side (lessons, scheduled skills, days, minutes, answers), every device that has synced and when, an activity log of each sync and what it sent or received, settings (account, masked token, token permissions, gist link, auto-sync on or off, device name), JSON backup and restore that merges rather than overwrites, and step-by-step setup and troubleshooting help. It also syncs every five minutes while the page is open, and when the device comes back online.

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
