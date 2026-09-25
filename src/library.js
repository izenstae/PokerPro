/* ============================================================
   LIBRARY: every formula the course uses, and a glossary
   One registry feeds three places: the Library tab, the formula
   cards inside lessons, and the dotted-underline definitions that
   appear on terms as you read.

   Formula notation, rendered by fxHTML():
     [a // b]   a stacked fraction (nests, innermost first)
     x^{2}      superscript        x_{0}   subscript
     sqrt(a)    square root with a bar over a
   ============================================================ */

var FORMULAS = [
  /* ---- equity and pot odds ---- */
  { id: "price", name: "Pot odds: the price of a call", topic: "Equity and pot odds", lesson: "price",
    f: "price = [call // pot + call]",
    vars: [["call", "what you must put in"], ["pot", "everything in the middle, his bet included"]],
    anchors: [["he bets ⅓ pot", "20%"], ["½ pot", "25%"], ["¾ pot", "30%"], ["pot", "33%"], ["2× pot", "40%"]],
    note: "The share of the final pot you are paying for. Call when your equity is bigger." },
  { id: "decide", name: "The call/fold test", topic: "Equity and pot odds", lesson: "decide",
    f: "call ⇔ equity > price",
    vars: [["equity", "your share of the pot at showdown"], ["price", "call ÷ (pot + call)"]],
    note: "Two numbers, one comparison. The gap between them times the final pot is the EV of calling." },
  { id: "ev", name: "Expected value", topic: "Equity and pot odds", lesson: "decide",
    f: "EV = Σ p_{i} · x_{i}",
    vars: [["p_{i}", "probability of outcome i"], ["x_{i}", "what you win or lose in outcome i"]],
    note: "Every decision in poker is a choice between EVs. For a call: EV = equity × (pot + call) − call." },
  { id: "evcall", name: "EV of a call", topic: "Equity and pot odds", lesson: "decide",
    f: "EV_{call} = e · (pot + call) − call",
    vars: [["e", "your equity"], ["pot", "the pot including his bet"], ["call", "the amount to call"]],
    note: "Zero exactly when e equals the price. Each point of equity above it is worth 1% of the final pot." },
  { id: "outs", name: "Rule of 2 and 4", topic: "Equity and pot odds", lesson: "outs",
    f: "P(hit) ≈ 2 · outs %   (one card)\nP(hit) ≈ 4 · outs %   (turn and river)",
    vars: [["outs", "cards that make your hand the winner"]],
    anchors: [["gutshot 4", "8% / 16%"], ["open-ender 8", "16% / 32%"], ["flush draw 9", "18% / 35%"], ["flush + OESD 15", "30% / 54%"]],
    note: "Above 8 outs the ×4 overshoots: subtract (outs − 8). 15 outs → 60 − 7 = 53%." },
  { id: "outsexact", name: "Exact chance to hit by the river", topic: "Equity and pot odds", lesson: "outs",
    f: "P(hit) = 1 − [(47 − outs)(46 − outs) // 47 · 46]",
    vars: [["outs", "on the flop, with 47 unseen cards"]],
    note: "The chance of missing twice, subtracted from one. The rule of 4 approximates this." },
  { id: "foldeq", name: "Fold equity: break-even folds", topic: "Equity and pot odds", lesson: "fold",
    f: "folds needed = [bet // pot + bet]",
    vars: [["bet", "your bet"], ["pot", "the pot before you bet"]],
    anchors: [["⅓ pot", "25%"], ["½ pot", "33%"], ["¾ pot", "43%"], ["pot", "50%"]],
    note: "How often a pure bluff must work to break even. Any equity when called lowers it." },
  { id: "semibluff", name: "EV of a semi-bluff", topic: "Equity and pot odds", lesson: "fold",
    f: "EV = f · pot + (1 − f) · [e · (pot + 2·bet) − bet]",
    vars: [["f", "how often he folds"], ["e", "your equity when called"], ["bet", "your bet"], ["pot", "the pot before you bet"]],
    note: "Two ways to win: he folds now, or you win at showdown when he calls." },
  { id: "implied", name: "Implied odds: money you must win later", topic: "Equity and pot odds", lesson: "implied",
    f: "extra = [(1 − e) · call // e] − (pot + bet)",
    vars: [["e", "your chance to hit"], ["call", "what you pay now"], ["pot + bet", "what is in the middle now"]],
    note: "If you can expect to win at least this much more when you hit, the call is profitable." },

  /* ---- combinatorics ---- */
  { id: "combos", name: "Combos of a starting hand", topic: "Ranges and combinatorics", lesson: "combos",
    f: "pair = C(4,2) = 6    suited = 4    offsuit = 12",
    vars: [["C(n,k)", "ways to choose k of n: n! ÷ (k! · (n − k)!)"]],
    anchors: [["AK (any)", "16"], ["AA", "6"], ["all hands", "1,326"]],
    note: "Every unpaired hand is 16 combos: 4 suited plus 12 offsuit." },
  { id: "removal", name: "Card removal", topic: "Ranges and combinatorics", lesson: "removal",
    f: "pair with k seen = C(4 − k, 2)\nunpaired = (4 − a)(4 − b)",
    vars: [["k", "cards of that rank you can see"], ["a, b", "cards of each rank you can see"]],
    anchors: [["AA, you hold one ace", "3"], ["AK, you hold an ace", "12"], ["AK, ace on board and in hand", "8"]],
    note: "Every card you can see deletes combos from his range." },
  { id: "beatshare", name: "How often you are beaten", topic: "Ranges and combinatorics", lesson: "counting",
    f: "P(behind) = [combos that beat you // live combos in his range]",
    vars: [["live combos", "his range after deleting every card you can see"]],
    note: "Count, then divide. The fear of one hand is not a count." },

  /* ---- game theory ---- */
  { id: "alpha", name: "Alpha: your bluffing quota", topic: "Game theory", lesson: "alpha",
    f: "α = [bet // pot + 2 · bet]",
    vars: [["bet", "your bet"], ["pot", "the pot before you bet"]],
    anchors: [["½ pot", "25%"], ["¾ pot", "30%"], ["pot", "33%"], ["2× pot", "40%"]],
    note: "The share of your betting range that should be bluffs. It equals the pot odds you lay him." },
  { id: "mdf", name: "Minimum defence frequency", topic: "Game theory", lesson: "mdf",
    f: "MDF = [pot // pot + bet]",
    vars: [["pot", "the pot before his bet"], ["bet", "his bet"]],
    anchors: [["⅓ pot", "75%"], ["½ pot", "67%"], ["pot", "50%"], ["2× pot", "33%"]],
    note: "Defend less than this and his any-two-cards bluff shows a profit." },
  { id: "ratio", name: "Bluffs per value bet", topic: "Game theory", lesson: "sizing",
    f: "bluffs = value · [α // 1 − α]",
    vars: [["value", "value combos in your betting range"], ["α", "bet ÷ (pot + 2·bet)"]],
    anchors: [["½ pot", "1 bluff : 3 value"], ["pot", "1 : 2"], ["2× pot", "2 : 3"]],
    note: "Bigger sizes are allowed, and required, to carry more bluffs." },
  { id: "indiff", name: "Indifference", topic: "Game theory", lesson: "indiff",
    f: "EV(call) = EV(fold)   ⇒   b · (pot + bet) = (1 − b) · bet",
    vars: [["b", "your bluff share"], ["pot + bet", "what his call wins against a bluff"], ["bet", "what his call loses against value"]],
    note: "Solve for b and you get α. Equilibrium frequencies are the ones that make the other side's choice worthless." },
  { id: "regret", name: "Regret matching (CFR)", topic: "Game theory", lesson: "cfrlab",
    f: "R(a) += π_{−i} · [v(a) − v(σ)]\nσ(a) = [max(R(a), 0) // Σ_{b} max(R(b), 0)]",
    vars: [["R(a)", "cumulative regret for action a"], ["π_{−i}", "opponents' reach probability"], ["σ", "current strategy"]],
    note: "Play each action in proportion to how much you regret not having played it. The average strategy converges to equilibrium." },

  /* ---- variance and bankroll ---- */
  { id: "se", name: "Standard error of a winrate", topic: "Variance and bankroll", lesson: "tstat",
    f: "SE = [sd // sqrt(n / 100)]     t = [winrate // SE]",
    vars: [["sd", "standard deviation, bb per 100 hands (≈ 80–100 in no-limit)"], ["n", "hands played"], ["winrate", "bb per 100 hands"]],
    note: "t above 2 means the winrate is probably real. Most players' t is under 1." },
  { id: "sample", name: "Hands needed to prove a winrate", topic: "Variance and bankroll", lesson: "sample",
    f: "n = 100 · ([2 · sd // winrate])^{2}",
    vars: [["sd", "bb/100"], ["winrate", "bb/100"]],
    anchors: [["5 bb/100, sd 90", "≈ 130,000 hands"], ["2 bb/100, sd 90", "≈ 810,000 hands"]],
    note: "The sample for a two-standard-error result. Halve the winrate and you need four times the hands." },
  { id: "ror", name: "Risk of ruin", topic: "Variance and bankroll", lesson: "ror",
    f: "RoR = e^{−2 · μ · B / σ²}",
    vars: [["μ", "winrate per hand"], ["σ", "standard deviation per hand"], ["B", "bankroll"]],
    note: "Use one unit throughout (per hand or per 100 hands, in big blinds). Doubling the roll squares the risk." },
  { id: "kelly", name: "Kelly fraction", topic: "Variance and bankroll", lesson: "kelly",
    f: "f* = [edge // variance]",
    vars: [["edge", "expected return per unit risked"], ["variance", "of that return"]],
    note: "The bet size that maximises long-run growth. Most pros play a fraction of Kelly." },

  /* ---- exploitation ---- */
  { id: "bayes", name: "Bayes' theorem", topic: "Exploitative play", lesson: "bayes",
    f: "P(H | E) = [P(E | H) · P(H) // P(E)]",
    vars: [["H", "a hypothesis: he holds hand class H"], ["E", "evidence: an action, or a card you can see"]],
    note: "Your cards are evidence too: every card you hold changes the prior on his range." },
  { id: "posterior", name: "Updating a read (beta prior)", topic: "Exploitative play", lesson: "update",
    f: "rate = [k · p_{0} + x // k + n]",
    vars: [["p_{0}", "the prior rate (equilibrium or population)"], ["k", "prior strength, in hands"], ["x", "times you saw it"], ["n", "times it could have happened"]],
    note: "Eight observations against a prior worth fifty barely move you. That is correct." },
  { id: "deviate", name: "When to call a bluff catcher", topic: "Exploitative play", lesson: "deviate",
    f: "call ⇔ his bluff share > α = [bet // pot + 2 · bet]",
    vars: [["his bluff share", "your estimate of how often he bluffs here"]],
    note: "Against equilibrium you are indifferent. Every dollar comes from the gap between his rate and α." }
];

/* ---- glossary: term, other spellings it matches, definition, lesson ---- */
var GLOSSARY = [
  ["all-in", ["all in", "all ins"], "Betting every chip you have. You cannot be forced out of the pot after that.", "shapes"],
  ["alpha", ["α"], "The share of a betting range that should be bluffs: bet ÷ (pot + 2 × bet).", "alpha"],
  ["bankroll", [], "The money set aside for poker. Its size relative to your stakes decides your risk of ruin.", "ror"],
  ["big blind", ["bb"], "The larger forced bet before the cards. Winrates are measured in big blinds.", "shape"],
  ["blinds", ["blind"], "Forced bets posted before the deal so there is something to play for.", "shape"],
  ["blocker", ["blockers"], "A card in your hand that removes combos from his range.", "blockers"],
  ["bluff", ["bluffs", "bluffing"], "A bet with a hand that wins only if he folds.", "fold"],
  ["bluff catcher", ["bluff catchers"], "A hand that beats only bluffs and loses to every value bet.", "alpha"],
  ["board", [], "The five community cards everyone shares.", "read"],
  ["button", ["dealer button"], "The dealer position. It acts last after the flop, which makes it the best seat.", "shape"],
  ["c-bet", ["continuation bet"], "A bet on the flop by the player who raised before the flop.", "fold"],
  ["check-raise", [], "Checking, then raising after an opponent bets.", "shape"],
  ["combo", ["combos", "combination"], "One exact two-card holding, like A♠K♥. AK is sixteen combos.", "combos"],
  ["counterfactual regret minimisation", ["CFR"], "The algorithm that solves poker: repeat play, track regret, play actions in proportion to it.", "cfrlab"],
  ["draw", ["draws", "drawing"], "A hand that needs more cards to win, like four to a flush.", "outs"],
  ["equilibrium", ["Nash equilibrium", "GTO"], "Strategies where neither player gains by changing theirs alone. Unexploitable, not maximally profitable.", "indiff"],
  ["equity", [], "Your share of the pot if all the cards were dealt out now: how often you win, counting ties as half.", "decide"],
  ["expected value", ["EV", "+EV", "-EV"], "The average result of a decision over every way it can turn out.", "decide"],
  ["exploit", ["exploitative", "exploiting"], "Deliberately leaving equilibrium to take more from an opponent's specific mistake.", "deviate"],
  ["flop", [], "The first three community cards, dealt together.", "shape"],
  ["flush draw", [], "Four cards to a flush. Nine outs.", "outs"],
  ["fold equity", [], "The extra value a bet gets from the times he folds.", "fold"],
  ["gutshot", [], "A straight draw that needs one exact rank in the middle. Four outs.", "outs"],
  ["implied odds", [], "Money you expect to win on later streets when you hit, on top of today's pot.", "implied"],
  ["in position", ["IP"], "Acting after your opponent on this street. It is worth a lot: you see what he does first.", "shape"],
  ["indifference", ["indifferent"], "The state where two options are worth exactly the same. Equilibrium mixes are built on it.", "indiff"],
  ["kicker", [], "The highest leftover card that breaks a tie between equal hands.", "ladder"],
  ["Kelly", ["Kelly criterion"], "The stake size that maximises long-run growth: edge ÷ variance.", "kelly"],
  ["minimum defence frequency", ["MDF"], "How often you must continue so a pure bluff shows no profit: pot ÷ (pot + bet).", "mdf"],
  ["nuts", ["the nuts", "nut"], "The best possible hand on this board.", "read"],
  ["open-ended straight draw", ["open-ender", "OESD"], "Four in a row, open at both ends. Eight outs.", "outs"],
  ["out of position", ["OOP"], "Acting first on this street, before your opponent.", "shape"],
  ["outs", [], "Unseen cards that would make your hand the winner.", "outs"],
  ["polarized", ["polarised"], "A range made of very strong hands and bluffs, with nothing in the middle.", "sizing"],
  ["pot odds", [], "The price of a call: call ÷ (pot + call). The equity you need to break even.", "price"],
  ["preflop", [], "The betting round after the hole cards and before the flop.", "shape"],
  ["range", ["ranges"], "Every hand a player could hold here, with how likely each is.", "combos"],
  ["regret", [], "How much better an action would have done than what you actually played.", "cfrlab"],
  ["risk of ruin", ["RoR"], "The chance a bankroll goes to zero even with a winning edge.", "ror"],
  ["river card", ["the river"], "The fifth and last community card, and the last betting round.", "shape"],
  ["semi-bluff", ["semi-bluffs"], "A bet with a draw: it wins if he folds, and can still win if called.", "fold"],
  ["showdown", [], "After the last bet, the remaining players show their cards and the best hand wins.", "shape"],
  ["standard deviation", ["sd"], "How widely results swing around the average. In no-limit, roughly 80–100 bb per 100 hands.", "tstat"],
  ["street", ["streets"], "One betting round: preflop, flop, turn or river.", "shape"],
  ["t-stat", ["t-statistic"], "Winrate divided by its standard error. Above about 2, the edge is probably real.", "tstat"],
  ["turn card", ["the turn"], "The fourth community card, and the third betting round.", "shape"],
  ["value bet", ["value bets", "value betting"], "A bet that wants a call, made with a hand that is ahead when called.", "sizing"],
  ["variance", [], "The spread of results around the average. Short-run results in poker are mostly variance.", "tstat"],
  ["winrate", ["win rate", "bb/100"], "Average profit, usually in big blinds per 100 hands.", "tstat"]
];

/* ---- rendering the notation ---- */
function fxEsc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function fxHTML(src) {
  var s = fxEsc(src);
  var guard = 0;
  /* sqrt(a) with no nested parentheses inside */
  s = s.replace(/sqrt\(([^()]*)\)/g, '<span class="fxr">√<span class="fxro">$1</span></span>');
  /* fractions, innermost first */
  var re = /\[([^\[\]]*?) \/\/ ([^\[\]]*?)\]/;
  while (re.test(s) && guard++ < 40) {
    s = s.replace(re, '<span class="fxf"><span class="fxn">$1</span><span class="fxd">$2</span></span>');
  }
  s = s.replace(/\^\{([^{}]*)\}/g, "<sup>$1</sup>").replace(/_\{([^{}]*)\}/g, "<sub>$1</sub>");
  return s.split("\n").map(function (line) { return '<span class="fxl">' + line + "</span>"; }).join("");
}

function formulaById(id) {
  for (var i = 0; i < FORMULAS.length; i++) if (FORMULAS[i].id === id) return FORMULAS[i];
  return null;
}
function formulasForLesson(id) { return FORMULAS.filter(function (f) { return f.lesson === id; }); }

/* glossary lookup: one regex over every spelling, longest first so "pot odds" beats "pot" */
var GLOSS_INDEX = null;
function glossIndex() {
  if (GLOSS_INDEX) return GLOSS_INDEX;
  var map = {}, words = [];
  GLOSSARY.forEach(function (g, i) {
    [g[0]].concat(g[1]).forEach(function (w) { map[w.toLowerCase()] = i; words.push(w); });
  });
  words.sort(function (a, b) { return b.length - a.length; });
  var alt = words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|");
  GLOSS_INDEX = { map: map, re: new RegExp("(^|[^A-Za-z0-9+\\-])(" + alt + ")(?![A-Za-z0-9])", "i") };
  return GLOSS_INDEX;
}
function glossFind(text) {
  var ix = glossIndex(), m = ix.re.exec(text);
  if (!m) return null;
  return { at: m.index + m[1].length, len: m[2].length, entry: GLOSSARY[ix.map[m[2].toLowerCase()]] };
}

if (typeof module !== "undefined") module.exports = {
  FORMULAS: FORMULAS, GLOSSARY: GLOSSARY, fxHTML: fxHTML, formulaById: formulaById,
  formulasForLesson: formulasForLesson, glossFind: glossFind
};
