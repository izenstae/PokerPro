/* ============================================================
   DRILLS for layers 0, 2, 3, 4, 5
   Every generator returns the same shape the layer 1 drills use.
   ============================================================ */

var CATS = ["high card", "one pair", "two pair", "three of a kind", "straight",
            "flush", "full house", "four of a kind", "straight flush"];

/* ---------------- layer 0: the game ---------------- */

function genRead() {
  for (var i = 0; i < 400; i++) {
    var d = dealCards(7, []);
    var hero = [d[0], d[1]], board = d.slice(2);
    var cat = handCategory(eval7(d));
    if (Math.random() < 0.55 && (cat === "high card" || cat === "one pair")) continue;  /* skew interesting */
    var idx = CATS.indexOf(cat);
    /* three distractors from the rungs nearest the true answer */
    var near = [];
    for (var step = 1; near.length < 8; step++) {
      if (idx - step >= 0) near.push(idx - step);
      if (idx + step <= 8) near.push(idx + step);
      if (step > 8) break;
    }
    var opts = [cat];
    var window = near.slice(0, 5);
    while (opts.length < 4 && window.length) {
      var j = window.splice(randInt(window.length), 1)[0];
      if (opts.indexOf(CATS[j]) < 0) opts.push(CATS[j]);
    }
    opts.sort(function (a, b) { return CATS.indexOf(a) - CATS.indexOf(b); });
    return {
      mode: "read", target: 8,
      cards: { hero: hero, board: board },
      question: "What is your best five card hand?",
      kind: "choice", options: opts, answer: cat,
      bar: { fill: 100 * (idx + 1) / 9, tick: null, fillLabel: cat + ", " + (idx + 1) + " of 9 on the ladder", tickLabel: "" },
      math: [
        "Your seven cards make: " + cat + ".",
        "You play the best five of the seven. The other two just do not exist.",
        "Ladder, worst to best: " + CATS.join(", ") + "."
      ]
    };
  }
  return genRead();
}

function genLadder() {
  var a = randInt(9), b = randInt(9);
  while (b === a) b = randInt(9);
  var hi = CATS[Math.max(a, b)], lo = CATS[Math.min(a, b)];
  var first = Math.random() < 0.5 ? hi : lo;
  var second = first === hi ? lo : hi;
  return {
    mode: "ladder", target: 4,
    lines: [["Hand A", first], ["Hand B", second]],
    question: "Which hand wins?",
    kind: "choice", options: ["A", "B"], answer: first === hi ? "A" : "B",
    bar: { fill: 100 * (Math.max(a, b) + 1) / 9, tick: 100 * (Math.min(a, b) + 1) / 9, fillLabel: hi + " (wins)", tickLabel: lo },
    math: [
      hi + " beats " + lo + ".",
      "Rarer is better. That is the only rule behind the whole ladder.",
      CATS.join(" < ")
    ]
  };
}

function genWho() {
  for (var i = 0; i < 200; i++) {
    var d = dealCards(9, []);
    var h = [d[0], d[1]], v = [d[2], d[3]], b = d.slice(4);
    var hs = eval7([h[0], h[1], b[0], b[1], b[2], b[3], b[4]]);
    var vs = eval7([v[0], v[1], b[0], b[1], b[2], b[3], b[4]]);
    var ans = hs > vs ? "You" : (hs < vs ? "Villain" : "Split");
    if (ans === "Split" && Math.random() < 0.8) continue;
    return {
      mode: "who", target: 10,
      cards: { hero: h, villain: v, board: b },
      question: "Showdown. Who takes it?",
      kind: "choice", options: ["You", "Villain", "Split"], answer: ans,
      bar: { fill: ans === "You" ? 100 : (ans === "Split" ? 50 : 0), tick: null,
             fillLabel: ans === "You" ? "you win" : (ans === "Split" ? "chopped" : "villain wins"), tickLabel: "" },
      math: [
        "You: " + handCategory(hs) + ".",
        "Villain: " + handCategory(vs) + ".",
        ans === "Split" ? "Identical five card hands. The pot is chopped." : (ans === "You" ? "You win." : "Villain wins."),
        "Both of you play the best five cards available. Cards in your hand that do not improve on the board are worth nothing."
      ]
    };
  }
  return genWho();
}

/* ---------------- layer 2: combinatorics ---------------- */

var RANGE_POOL = ["QQ+, AK", "TT+, AQs+, AKo", "99+, AJs+, KQs, AKo", "JJ+, AK", "22+, AK",
                  "AQ+, JJ+", "77+, ATs+, KJs+, AQo+", "TT+, AK, AQs"];

function genCombos() {
  var kind = pick(["class", "range", "blocked"]);
  if (kind === "class") {
    var t = pick(["AA", "KK", "QQ", "77", "AKs", "AQs", "T9s", "AKo", "AQo", "KQo"]);
    var n = handClassCount(t);
    return {
      mode: "combos", target: 5,
      lines: [["Hand class", t]],
      question: "How many combinations exist?",
      kind: "number", unit: "", answer: n, tol: 0.5,
      bar: { fill: 100 * n / 16, tick: null, fillLabel: n + " of the 16 that a rank pair can hold", tickLabel: "" },
      math: [
        t.length === 2 ? "A pocket pair: choose 2 of the 4 suits. C(4,2) = 6." :
        (t[2] === "s" ? "Suited: one combo per suit. 4." : "Offsuit: 4 x 4 minus the 4 suited ones = 12."),
        "Pairs 6, suited 4, offsuit 12. Any two unpaired ranks together: 16.",
        "These three numbers are the whole of range combinatorics."
      ]
    };
  }
  if (kind === "range") {
    var r = pick(RANGE_POOL);
    var all = parseRange(r);
    return {
      mode: "combos", target: 12,
      lines: [["Villain's range", r]],
      question: "How many combos is that, before any card removal?",
      kind: "number", unit: "", answer: all.length, tol: 1.5,
      bar: { fill: 100 * all.length / 200, tick: null, fillLabel: all.length + " combos, out of 1,326 possible hands", tickLabel: "" },
      math: [
        r.split(",").map(function (tok) {
          var c = parseRange(tok).length;
          return tok.trim() + " = " + c;
        }).join("  +  ") + "  =  " + all.length,
        "As a share of all hands: " + all.length + " / 1326 = " + (100 * all.length / 1326).toFixed(1) + "% of the deck.",
        "Count the pieces separately and add. Never try to eyeball a whole range."
      ]
    };
  }
  /* blocked */
  for (var i = 0; i < 200; i++) {
    var t2 = pick(["AK", "AA", "KK", "AQ", "AKs", "QQ"]);
    var base = parseRange(t2);
    var dead = dealCards(pick([2, 2, 5]), []);
    var live = removeDead(base, dead);
    if (live.length === base.length) continue;
    var isBoard = dead.length === 5;
    return {
      mode: "combos", target: 12,
      cards: isBoard ? { hero: dead.slice(0, 2), board: dead.slice(2) } : { hero: dead },
      lines: [["Villain's holding", t2]],
      question: "How many " + t2 + " combos can he still have?",
      kind: "number", unit: "", answer: live.length, tol: 0.5,
      bar: { fill: 100 * live.length / base.length, tick: null,
             fillLabel: live.length + " of " + base.length + " left (" + Math.round(100 * live.length / base.length) + "%)", tickLabel: "" },
      math: [
        t2 + " starts as " + base.length + " combos.",
        "Cards you can see: " + dead.map(cardText).join(" ") + ".",
        "Every one of those you hold or that lies on the board deletes combos from his range: " + base.length + " -> " + live.length + ".",
        "This is card removal. It is not a tiebreaker, it is a " + Math.round(100 - 100 * live.length / base.length) + "% change in how often he holds this hand."
      ]
    };
  }
  return genCombos();
}

function genBlocker() {
  var suit = randInt(4), sName = ["clubs", "diamonds", "hearts", "spades"][suit];
  var ace = suit * 13 + 12;
  var hold = Math.random() < 0.5;
  /* nut flush combos: A of suit with any other card of that suit */
  var answer = hold ? 0 : 12;
  var other = dealCards(1, [ace]);
  return {
    mode: "blocker", target: 10,
    cards: { hero: hold ? [ace, other[0]] : dealCards(2, [ace]) },
    lines: [["Board", "three " + sName + ", flush possible"], ["Question about", "his nut flush combos"]],
    question: "How many nut flushes can he have?",
    kind: "number", unit: "", answer: answer, tol: 0.5,
    bar: { fill: hold ? 0 : 100, tick: null, fillLabel: hold ? "zero. you hold the card that makes it" : "all of them. you block nothing", tickLabel: "" },
    math: [
      hold ? "You hold the ace of " + sName + "." : "You do not hold the ace of " + sName + ".",
      hold ? "The nut flush needs that exact card. He has it zero percent of the time."
           : "He can hold the ace of " + sName + " with any of the 12 other " + sName + " left, so the nut flush is fully live.",
      "One card in your hand moved a whole category of his range to zero. That is a blocker, and it is why the ace of the flush suit is worth more as a bluff than a pair is."
    ]
  };
}

function genBeat() {
  for (var i = 0; i < 300; i++) {
    var r = pick(RANGE_POOL);
    var range = parseRange(r);
    var d = dealCards(5, []);
    var hero = [d[0], d[1]], board = d.slice(2);
    var sp = rangeSplit(hero, range, board);
    if (sp.total < 8 || sp.beat === 0 || sp.beat === sp.total) continue;
    return {
      mode: "beat", target: 25,
      cards: { hero: hero, board: board },
      lines: [["Villain's range", r], ["Live combos", String(sp.total)]],
      question: "How many of his combos beat you right now?",
      kind: "number", unit: "", answer: sp.beat, tol: Math.max(1.5, sp.beat * 0.12),
      bar: { fill: 100 * sp.beat / sp.total, tick: null,
             fillLabel: sp.beat + " of " + sp.total + " combos have you beaten (" + Math.round(100 * sp.beat / sp.total) + "%)", tickLabel: "" },
      math: [
        "You have " + handCategory(eval7(hero.concat(board).slice(0, 7))) + ".",
        "His range is " + r + ", which is " + sp.total + " combos once your cards and the board are removed.",
        "Ahead of you: " + sp.beat + ". Behind: " + sp.lose + ". Tied: " + sp.tie + ".",
        "So you are good " + (100 * (sp.lose + sp.tie / 2) / sp.total).toFixed(0) + "% of the time against this range. Notice you did this by counting, not by guessing."
      ]
    };
  }
  return genCombos();
}

/* ---------------- layer 3: game theory ---------------- */

function genAlpha() {
  var pot = pick(POTS), bet = betOf(pot, pick(FRACS));
  var a = 100 * bet / (pot + 2 * bet);
  return {
    mode: "alpha", target: 8,
    lines: [["Pot", money(pot)], ["Your bet", money(bet)]],
    question: "Alpha: what share of this betting range should be bluffs?",
    kind: "number", unit: "%", answer: a, tol: 1.5,
    bar: { fill: a, tick: null, fillLabel: "bluffs, " + a.toFixed(1) + "% of the betting range", tickLabel: "" },
    math: [
      "alpha = bet / (pot + 2 x bet) = " + money(bet) + " / " + money(pot + 2 * bet) + " = " + a.toFixed(1) + "%",
      "This is the same arithmetic as the pot-odds price you are laying him. You bluff at exactly the frequency that makes his call break even.",
      "Value combos are the other " + (100 - a).toFixed(1) + "%, so " + (a / (100 - a)).toFixed(2) + " bluffs for every value bet."
    ]
  };
}

function genMDF() {
  var pot = pick(POTS), bet = betOf(pot, pick(FRACS));
  var m = 100 * pot / (pot + bet);
  return {
    mode: "mdf", target: 8,
    lines: [["Pot", money(pot)], ["Villain bets", money(bet)]],
    question: "MDF: how much of your range must continue?",
    kind: "number", unit: "%", answer: m, tol: 1.5,
    bar: { fill: m, tick: null, fillLabel: "must defend " + m.toFixed(1) + "%", tickLabel: "" },
    math: [
      "MDF = pot / (pot + bet) = " + money(pot) + " / " + money(pot + bet) + " = " + m.toFixed(1) + "%",
      "Fold more than " + (100 - m).toFixed(1) + "% and his any-two-cards bluff prints money whatever he holds.",
      "Its mirror is the fold frequency a pure bluff needs, " + (100 - m).toFixed(1) + "%, so MDF and that sum to 100. Alpha, the bluff quota, uses pot + 2 x bet and is a separate number."
    ]
  };
}

function genRatio() {
  var pot = pick(POTS), bet = betOf(pot, pick([0.33, 0.5, 0.66, 0.75, 1, 1.5, 2]));
  var val = pick([6, 8, 9, 10, 12, 15, 16, 18, 20, 24]);
  var a = bet / (pot + 2 * bet);
  var bluffs = val * a / (1 - a);
  return {
    mode: "ratio", target: 20,
    lines: [["Pot", money(pot)], ["Your bet", money(bet)], ["Value combos", String(val)]],
    question: "How many bluff combos belong in this bet?",
    kind: "number", unit: "", answer: bluffs, tol: Math.max(1, bluffs * 0.1),
    bar: { fill: 100 * bluffs / (bluffs + val), tick: null,
           fillLabel: bluffs.toFixed(1) + " bluffs to " + val + " value = " + (100 * bluffs / (bluffs + val)).toFixed(1) + "% bluffs", tickLabel: "" },
    math: [
      "alpha = " + money(bet) + " / " + money(pot + 2 * bet) + " = " + (100 * a).toFixed(1) + "%",
      "bluffs / (value + bluffs) = alpha, so bluffs = value x alpha / (1 - alpha)",
      "= " + val + " x " + a.toFixed(3) + " / " + (1 - a).toFixed(3) + " = " + bluffs.toFixed(1) + " combos.",
      "Bigger bet, more bluffs allowed. The size you pick writes your own bluffing quota, which is why sizing is a mechanism design problem and not a feel."
    ]
  };
}

function genIndiff() {
  var pot = pick(POTS), bet = betOf(pot, pick(FRACS));
  var a = 100 * bet / (pot + 2 * bet);
  var m = 100 * pot / (pot + bet);
  var askMDF = Math.random() < 0.5;
  return {
    mode: "indiff", target: 14,
    lines: [["Pot", money(pot)], ["Bet", money(bet)],
            ["Villain holds", "a pure bluff catcher"]],
    question: askMDF
      ? "He is indifferent. What fraction of his bluff catchers does he call with?"
      : "You are betting. What fraction of your range is bluffs when he is indifferent?",
    kind: "number", unit: "%", answer: askMDF ? m : a, tol: 1.5,
    bar: { fill: askMDF ? m : a, tick: null, fillLabel: askMDF ? "he calls " + m.toFixed(1) + "%" : "you bluff " + a.toFixed(1) + "%", tickLabel: "" },
    math: askMDF
      ? ["He must make YOUR bluffs break even, so he defends MDF = pot / (pot + bet) = " + m.toFixed(1) + "%.",
         "His call frequency is not chosen for his own benefit. It is chosen so that you cannot profit by bluffing every hand.",
         "This is the indifference principle. Each player's frequency is pinned by what it does to the other one."]
      : ["You must make HIS calls break even, so you bluff alpha = bet / (pot + 2 x bet) = " + a.toFixed(1) + "%.",
         "At this frequency his bluff catcher wins exactly as much by calling as by folding. He has no decision left to get right.",
         "You are not trying to trick him. You are removing his ability to be correct."]
  };
}

/* ---------------- layer 4: variance ---------------- */

function genSample() {
  var sd = pick([80, 85, 90, 95, 100]), wr = pick([1, 2, 2.5, 3, 4, 5, 6]);
  var n = 100 * Math.pow(2 * sd / wr, 2);
  return {
    mode: "sample", target: 25,
    lines: [["Your winrate", wr + " bb/100"], ["Std deviation", sd + " bb/100"], ["Confidence", "t = 2, roughly 95%"]],
    question: "How many hands before this winrate is distinguishable from zero?",
    kind: "number", unit: "", answer: n, tol: n * 0.1,
    bar: { fill: Math.min(100, 100 * n / 2000000), tick: null,
           fillLabel: Math.round(n).toLocaleString() + " hands, on a 2,000,000 scale", tickLabel: "" },
    math: [
      "Standard error over n hands = sd / sqrt(n/100).",
      "t = wr / SE = 2  ->  n = 100 x (2 x sd / wr)^2",
      "= 100 x (2 x " + sd + " / " + wr + ")^2 = " + Math.round(n).toLocaleString() + " hands.",
      "At " + (n / 60000).toFixed(1) + " full time months of play. This is why almost every player who believes they are a winner is holding a sample that proves nothing."
    ]
  };
}

function genT() {
  var sd = pick([80, 90, 100]), wr = pick([1, 2, 3, 4, 5, 7]), n = pick([10000, 25000, 50000, 100000, 250000, 500000]);
  var t = wr / (sd / Math.sqrt(n / 100));
  return {
    mode: "tstat", target: 25,
    lines: [["Observed winrate", wr + " bb/100"], ["Std deviation", sd + " bb/100"], ["Sample", n.toLocaleString() + " hands"]],
    question: "What is the t statistic on this winrate?",
    kind: "number", unit: "", answer: t, tol: Math.max(0.15, t * 0.08),
    bar: { fill: Math.min(100, 100 * t / 4), tick: 50, fillLabel: "t = " + t.toFixed(2), tickLabel: "t = 2, the 95% line" },
    math: [
      "SE = sd / sqrt(n/100) = " + sd + " / sqrt(" + (n / 100).toLocaleString() + ") = " + (sd / Math.sqrt(n / 100)).toFixed(2) + " bb/100",
      "t = wr / SE = " + wr + " / " + (sd / Math.sqrt(n / 100)).toFixed(2) + " = " + t.toFixed(2),
      t >= 2 ? "Above 2. You can call this an edge with a straight face."
             : "Below 2. This sample is consistent with a break even player running warm. You do not have evidence yet.",
      "Same t stat you would run on a backtest. Poker results are just a return series with fat tails and no benchmark."
    ]
  };
}

function genRoR() {
  var sd = pick([80, 90, 100]), wr = pick([2, 3, 4, 5, 6]), bb = pick([20, 30, 40, 50, 60, 80, 100]);
  var B = bb * 100;                                   /* bankroll in bb */
  var ror = 100 * Math.exp(-2 * wr * B / (sd * sd));
  if (ror < 0.05 || ror > 90) return genRoR();
  return {
    mode: "ror", target: 30,
    lines: [["Winrate", wr + " bb/100"], ["Std deviation", sd + " bb/100"], ["Bankroll", bb + " buyins (" + B.toLocaleString() + " bb)"]],
    question: "Risk of ruin: what is the chance you ever go broke?",
    kind: "number", unit: "%", answer: ror, tol: Math.max(0.4, ror * 0.15),
    bar: { fill: ror, tick: null, fillLabel: ror.toFixed(2) + "% chance of ruin", tickLabel: "" },
    math: [
      "RoR = exp(-2 x wr x bankroll / sd^2), all in bb per 100 hands.",
      "= exp(-2 x " + wr + " x " + B.toLocaleString() + " / " + (sd * sd).toLocaleString() + ") = " + ror.toFixed(2) + "%",
      "Ruin decays exponentially in bankroll and in winrate, and blows up in the square of the standard deviation.",
      "Double your winrate and your risk of ruin does not halve, it squares. That is the whole argument for game selection over cleverness."
    ]
  };
}

function genKelly() {
  var ev = pick([1, 2, 3, 4, 5]);                     /* bb per 100 */
  var sd = pick([80, 90, 100]);
  var f = ev / (sd * sd);                             /* fraction of bankroll per 100 hands */
  var inv = 1 / f;
  return {
    mode: "kelly", target: 25,
    lines: [["Edge", ev + " bb/100"], ["Variance", (sd * sd).toLocaleString() + " bb^2/100"]],
    question: "Full Kelly says a 100 hand block should risk what fraction of your roll? Give 1/x, answer x.",
    kind: "number", unit: "", answer: inv, tol: inv * 0.1,
    bar: { fill: Math.min(100, 100 * 2000 / inv), tick: null, fillLabel: "risk 1/" + Math.round(inv).toLocaleString() + " of the roll", tickLabel: "" },
    math: [
      "Kelly fraction f = edge / variance = " + ev + " / " + (sd * sd).toLocaleString() + " = 1/" + Math.round(inv).toLocaleString(),
      "So your bankroll should be about " + Math.round(inv).toLocaleString() + " bb, which is " + Math.round(inv / 100) + " buyins, before this edge is worth full Kelly.",
      "Nobody plays full Kelly. Half Kelly gives up a quarter of the growth for a much better ride, and most good players sit near quarter Kelly.",
      "This is the same f* you would use to size a position. Poker bankroll rules are Kelly with the numbers already divided out."
    ]
  };
}

/* ---------------- layer 5: exploitation ---------------- */

function genBayes() {
  var r = pick(["QQ+, AK", "JJ+, AK", "TT+, AQs+, AKo", "QQ+, AKs"]);
  var range = parseRange(r);
  var heroTok = pick(["AKs", "AKo", "AQo", "KQs", "AA", "QQ"]);
  var heroCombos = parseRange(heroTok);
  var hero = heroCombos[randInt(heroCombos.length)];
  var live = removeDead(range, hero);
  var pairsTok = r.split(",")[0].trim();
  var pairs = removeDead(parseRange(pairsTok), hero).length;
  var p = 100 * pairs / live.length;
  return {
    mode: "bayes", target: 30,
    cards: { hero: hero },
    lines: [["His 3bet range", r], ["Question", "P(he has " + pairsTok + ")"]],
    question: "He 3bets. How often does he hold " + pairsTok + "?",
    kind: "number", unit: "%", answer: p, tol: 3,
    bar: { fill: p, tick: 100 * parseRange(pairsTok).length / range.length,
           fillLabel: "after your blockers: " + p.toFixed(1) + "%",
           tickLabel: "before removal: " + (100 * parseRange(pairsTok).length / range.length).toFixed(1) + "%" },
    math: [
      "Prior: " + r + " is " + range.length + " combos, of which " + parseRange(pairsTok).length + " are " + pairsTok + ".",
      "You hold " + cardText(hero[0]) + " " + cardText(hero[1]) + ". Remove those cards from his range: " + range.length + " -> " + live.length + " combos, " + pairsTok + " -> " + pairs + ".",
      "P(" + pairsTok + " | 3bet, your cards) = " + pairs + " / " + live.length + " = " + p.toFixed(1) + "%",
      "That is Bayes with a uniform prior over combos. Your own two cards are evidence, and they move the posterior before he does anything at all."
    ]
  };
}

function genUpdate() {
  var base = pick([40, 45, 50, 55, 60]);
  var k = pick([10, 20, 30]);                        /* prior strength in observations */
  var obs = pick([6, 8, 10, 12, 15, 20]);
  var folds = Math.round(obs * pick([0.2, 0.3, 0.7, 0.8, 0.9]));
  var post = 100 * ((base / 100) * k + folds) / (k + obs);
  return {
    mode: "update", target: 30,
    lines: [["Population baseline", base + "% fold to cbet"], ["Prior strength", k + " hands"], ["You have seen", folds + " folds in " + obs + " chances"]],
    question: "What is your posterior estimate of his fold frequency?",
    kind: "number", unit: "%", answer: post, tol: 2,
    bar: { fill: post, tick: base, fillLabel: "posterior " + post.toFixed(1) + "%", tickLabel: "prior " + base + "%" },
    math: [
      "Beta prior centred on the population read: alpha = " + (base / 100 * k).toFixed(1) + ", beta = " + ((1 - base / 100) * k).toFixed(1) + ", strength " + k + ".",
      "Posterior mean = (prior successes + observed) / (prior strength + observations)",
      "= (" + (base / 100 * k).toFixed(1) + " + " + folds + ") / (" + k + " + " + obs + ") = " + post.toFixed(1) + "%",
      "The equilibrium read is your prior. " + obs + " hands moved it " + Math.abs(post - base).toFixed(1) + " points, and that is the correct amount of movement for that much evidence. This is the discipline that stops one showdown from rewriting your whole model of a player."
    ]
  };
}

function genDeviate() {
  var pot = pick([60, 80, 100, 120, 150]);
  var bet = betOf(pot, pick([0.5, 0.66, 0.75, 1]));
  var a = 100 * bet / (pot + 2 * bet);
  var actual = Math.random() < 0.5
    ? a * pick([0.2, 0.3, 0.45])                      /* underbluffs */
    : Math.min(92, a * pick([1.6, 2, 2.5]));          /* overbluffs */
  var call = actual > a;
  return {
    mode: "deviate", target: 20,
    lines: [["Pot", money(pot)], ["He bets", money(bet)], ["Equilibrium bluff rate here", a.toFixed(1) + "%"],
            ["Your read on him", "bluffs about " + actual.toFixed(0) + "%"]],
    question: "You hold a pure bluff catcher. Call or fold?",
    kind: "choice", options: ["CALL", "FOLD"], answer: call ? "CALL" : "FOLD",
    bar: { fill: actual, tick: a, fillLabel: "his actual bluff rate " + actual.toFixed(1) + "%", tickLabel: "indifference at " + a.toFixed(1) + "%" },
    math: [
      "Your bluff catcher beats exactly his bluffs and loses to exactly his value.",
      "You need him bluffing " + a.toFixed(1) + "% to be indifferent. You read him at " + actual.toFixed(0) + "%.",
      call ? "He overbluffs, so calling is now strictly profitable. Take it."
           : "He underbluffs, so calling burns money. Fold and let him have it.",
      "Against equilibrium you may as well flip a coin. Every dollar you make comes from the gap between " + actual.toFixed(0) + " and " + a.toFixed(1) + ", so your job is finding the gap, not computing the " + a.toFixed(1) + "."
    ]
  };
}

/* ---------------- registry ---------------- */
GENS.read = genRead; GENS.ladder = genLadder; GENS.who = genWho;
GENS.combos = genCombos; GENS.blocker = genBlocker; GENS.beat = genBeat;
GENS.alpha = genAlpha; GENS.mdf = genMDF; GENS.ratio = genRatio; GENS.indiff = genIndiff;
GENS.sample = genSample; GENS.tstat = genT; GENS.ror = genRoR; GENS.kelly = genKelly;
GENS.bayes = genBayes; GENS.update = genUpdate; GENS.deviate = genDeviate;
