/* ============================================================
   DRILLS for the stages added in the zero-to-pro path:
   rules and positions, probability, EV, preflop charts, 3-bets,
   SPR, equity realisation, c-bets, geometric sizing, bluffing on
   two streets, the AKQ game, push/fold, and ICM.
   Same shape as every other generator.
   ============================================================ */

var SEATS6 = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];            /* preflop order of action */
var POST6 = ["SB", "BB", "UTG", "HJ", "CO", "BTN"];             /* postflop order of action */

/* A standard 6-max, 100bb raise-first-in chart: an approximation of solver
   output, the same one the Play table's opponents use. */
var RFI = {
  UTG: "22+, A2s+, K9s+, Q9s+, J9s+, T9s, 98s, 87s, 76s, AJo+, KQo",
  HJ:  "22+, A2s+, K7s+, Q9s+, J9s+, T8s+, 97s+, 86s+, 76s, 65s, ATo+, KJo+, QJo",
  CO:  "22+, A2s+, K5s+, Q7s+, J8s+, T8s+, 97s+, 86s+, 75s+, 65s, 54s, A8o+, KTo+, QTo+, JTo",
  BTN: "22+, A2s+, K2s+, Q4s+, J6s+, T6s+, 96s+, 85s+, 74s+, 64s+, 53s+, 43s, A2o+, K8o+, Q9o+, J9o+, T8o+, 98o, 87o",
  SB:  "22+, A2s+, K3s+, Q5s+, J7s+, T7s+, 97s+, 86s+, 75s+, 64s+, 54s, A4o+, K9o+, Q9o+, J9o+, T9o"
};

/* every one of the 169 starting-hand classes, and which are in a range */
var HAND_CLASSES = (function () {
  var out = [];
  for (var i = 12; i >= 0; i--) for (var j = 12; j >= 0; j--) {
    if (i === j) out.push(RANKS[i] + RANKS[i]);
    else if (i > j) out.push(RANKS[i] + RANKS[j] + "s", RANKS[i] + RANKS[j] + "o");
  }
  return out;
})();
var RFI_SET = {};
function rangeClasses(str) {
  if (RFI_SET[str]) return RFI_SET[str];
  var set = {};
  parseRange(str).forEach(function (c) { set[comboName(c)] = 1; });
  return (RFI_SET[str] = set);
}
function rangePct(str) { return 100 * parseRange(str).length / 1326; }
function classCombos(name) { return name.length === 2 ? 6 : name[2] === "s" ? 4 : 12; }

function pctFmt(x, d) { return x.toFixed(d == null ? 1 : d) + "%"; }
function bbFmt(x) { return (Math.round(x * 100) / 100) + " bb"; }

/* ---------------- stage 0: rules and positions ---------------- */

function genRules() {
  var v = randInt(3);
  if (v === 0) {
    /* minimum raise: the next raise must be at least as big as the last raise */
    var sb = pick([1, 1, 2, 5]), bb = sb * 2;
    var open = bb * pick([2.5, 3, 3, 3.5, 4]);
    open = Math.round(open);
    if (Math.random() < 0.5) {
      var ans = open + (open - bb);
      return {
        mode: "rules", target: 10, unit: "$", kind: "number", tol: 0.5, answer: ans,
        lines: [["Blinds", "$" + sb + " / $" + bb], ["UTG raises to", "$" + open]],
        question: "What is the smallest legal re-raise, as a total?",
        bar: null,
        math: [
          "A raise must be at least as big as the last bet or raise on this street.",
          "The last raise was $" + open + " − $" + bb + " = $" + (open - bb) + " on top of the big blind.",
          "So the minimum re-raise is $" + open + " + $" + (open - bb) + " = $" + ans + " in total."
        ]
      };
    }
    var three = open * pick([3, 3, 3.5, 4]);
    three = Math.round(three);
    var ans2 = three + (three - open);
    return {
      mode: "rules", target: 12, unit: "$", kind: "number", tol: 0.5, answer: ans2,
      lines: [["Blinds", "$" + sb + " / $" + bb], ["UTG raises to", "$" + open], ["BTN re-raises to", "$" + three]],
      question: "What is the smallest legal 4-bet, as a total?",
      bar: null,
      math: [
        "The last raise was $" + three + " − $" + open + " = $" + (three - open) + ".",
        "A 4-bet must add at least that much again: $" + three + " + $" + (three - open) + " = $" + ans2 + ".",
        "Min-raises are measured by the size of the last raise, not by the total."
      ]
    };
  }
  if (v === 1) {
    /* who acts first: preflop from UTG, postflop from the small blind */
    var n = 2 + randInt(3);
    var pool = POST6.slice();
    var who = [];
    while (who.length < n) who.push(pool.splice(randInt(pool.length), 1)[0]);
    var street = Math.random() < 0.35 ? "preflop" : pick(["on the flop", "on the turn", "on the river"]);
    var order = street === "preflop" ? SEATS6 : POST6;
    who.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
    var first = who[0];
    var shown = who.slice().sort(function () { return Math.random() - 0.5; });
    return {
      mode: "rules", target: 8, kind: "choice", options: shown, answer: first,
      lines: [["Players in the hand", shown.join(", ")], ["Street", street]],
      question: "Who acts first " + street + "?",
      bar: null,
      math: [
        "Preflop the action starts left of the big blind: UTG, HJ, CO, BTN, SB, BB.",
        "On every later street it starts left of the button: SB, BB, UTG, HJ, CO, BTN.",
        "Of " + who.join(", ") + ", " + first + " acts first " + street + "."
      ]
    };
  }
  /* pot size after preflop action */
  var sb2 = 1, bb2 = 2, r = pick([5, 6, 6, 7]), callers = 1 + randInt(2);
  var blindsIn = Math.random() < 0.5;
  var pot, desc;
  if (blindsIn) {
    pot = r * (1 + callers + 1);
    desc = "CO raises to $" + r + ", " + (callers === 2 ? "BTN and SB call" : "SB calls") + ", BB calls";
    if (callers === 2) pot = r * 4;
    else pot = r * 3;
  } else {
    pot = r * (1 + callers) + sb2 + bb2;
    desc = "CO raises to $" + r + ", " + (callers === 2 ? "BTN and BB call, SB folds" : "BTN calls, both blinds fold");
    if (callers === 2) pot = r * 3 + sb2;
  }
  var expl = blindsIn
    ? "Every player who called put in $" + r + " in total, blinds included: their blind counts toward the call."
    : "Folded blinds leave their money in the pot as dead money.";
  return {
    mode: "rules", target: 14, unit: "$", kind: "number", tol: 0.5, answer: pot,
    lines: [["Blinds", "$1 / $2"], ["Action", desc]],
    question: "How much is in the pot on the flop?",
    bar: null,
    math: [
      expl,
      "Count every dollar: the pot on the flop is $" + pot + ".",
      "Getting the pot right is step one of every price you will ever compute."
    ]
  };
}

function genPosition() {
  var v = randInt(3);
  if (v === 0) {
    var n = 2 + randInt(2), pool = POST6.slice(), who = [];
    while (who.length < n) who.push(pool.splice(randInt(pool.length), 1)[0]);
    var last = who.slice().sort(function (a, b) { return POST6.indexOf(b) - POST6.indexOf(a); })[0];
    return {
      mode: "position", target: 7, kind: "choice", options: who, answer: last,
      lines: [["Players who saw the flop", who.join(", ")]],
      question: "Who is in position, acting last after the flop?",
      bar: null,
      math: [
        "After the flop the order is SB, BB, UTG, HJ, CO, BTN. The button always acts last.",
        last + " acts after everyone else here, so " + last + " is in position.",
        "Acting last means seeing everyone else's decision before making yours. That information is worth more than a lot of card strength."
      ]
    };
  }
  if (v === 1) {
    var seat = pick(["UTG", "HJ", "CO", "BTN", "SB"]);
    var behind = 5 - SEATS6.indexOf(seat);
    return {
      mode: "position", target: 7, kind: "number", tol: 0.5, answer: behind,
      lines: [["You are", seat], ["Table", "6-max, everyone folds to you"]],
      question: "How many players still act after you preflop?",
      bar: { fill: 100 * behind / 5, tick: null, fillLabel: behind + " players left to wake up with a hand", tickLabel: "" },
      math: [
        "Preflop order: UTG, HJ, CO, BTN, SB, BB.",
        "From " + seat + ", " + SEATS6.slice(SEATS6.indexOf(seat) + 1).join(", ") + " still act: " + behind + " players.",
        "Each player behind you is another chance someone holds a real hand. That is why ranges widen as you move toward the button."
      ]
    };
  }
  var pos = pick(["UTG", "HJ", "CO", "BTN", "SB"]);
  var pct = rangePct(RFI[pos]);
  return {
    mode: "position", target: 12, unit: "%", kind: "number", tol: 4, answer: pct,
    lines: [["Seat", pos], ["Table", "6-max, 100 big blinds"]],
    question: "Roughly what share of hands does a standard chart open from " + pos + "?",
    bar: { fill: pct, tick: null, fillLabel: pos + " opens " + pctFmt(pct, 0), tickLabel: "" },
    math: [
      "The chart used across this course: UTG " + pctFmt(rangePct(RFI.UTG), 0) + ", HJ " + pctFmt(rangePct(RFI.HJ), 0) +
        ", CO " + pctFmt(rangePct(RFI.CO), 0) + ", BTN " + pctFmt(rangePct(RFI.BTN), 0) + ", SB " + pctFmt(rangePct(RFI.SB), 0) + ".",
      "Fewer players behind you means fewer who can wake up with a hand, and a better chance of acting last after the flop.",
      "Roughly: the range doubles from UTG to the cutoff and doubles again on the button."
    ]
  };
}

/* ---------------- stage 1: probability and EV ---------------- */

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  var r = 1;
  for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
  return r;
}

function genProb() {
  var v = randInt(4);
  var ans, lines, q, math;
  if (v === 0) {
    var outs = pick([2, 4, 5, 6, 8, 9, 10, 12, 15]);
    ans = 100 * (1 - (47 - outs) * (46 - outs) / (47 * 46));
    lines = [["Street", "flop, two cards to come"], ["Your outs", outs + ""]];
    q = "Exact chance you hit by the river?";
    math = [
      "Miss the turn and the river: (" + (47 - outs) + "/47) × (" + (46 - outs) + "/46) = " + (100 - ans).toFixed(1) + "%.",
      "Hit = 1 − miss = " + ans.toFixed(1) + "%.",
      "Rule of 4 says " + (4 * outs) + "%" + (outs > 8 ? "; subtract the " + (outs - 8) + " outs over eight to get " + (4 * outs - (outs - 8)) + "%." : ".")
    ];
  } else if (v === 1) {
    var o2 = pick([2, 4, 6, 8, 9, 12, 15]);
    ans = 100 * o2 / 46;
    lines = [["Street", "turn, one card to come"], ["Your outs", o2 + ""]];
    q = "Chance the river is one of your outs?";
    math = ["46 cards are unseen on the turn (52, minus your 2, minus 4 on the board).", o2 + " / 46 = " + ans.toFixed(1) + "%.", "Rule of 2: " + (2 * o2) + "%. Close enough to act on."];
  } else if (v === 2) {
    var ev = pick([
      ["a pocket pair", 100 * 78 / 1326, "13 ranks × 6 combos = 78 of the 1,326 starting hands: 1 in 17."],
      ["pocket aces", 100 * 6 / 1326, "6 combos of 1,326: 1 in 221."],
      ["any suited hand", 100 * 312 / 1326, "78 rank pairs × 4 suits = 312 of 1,326: about 1 in 4."],
      ["ace-king, any suits", 100 * 16 / 1326, "16 combos of 1,326: 1 in 83."],
      ["two suited connectors (like 76s, no aces)", 100 * 4 * 12 / 1326, "12 connected rank pairs from 32 to KQ, 4 suits each: 48 of 1,326."]
    ]);
    ans = ev[1];
    lines = [["Event", "being dealt " + ev[0]]];
    q = "Chance of being dealt " + ev[0] + "?";
    math = ["There are C(52,2) = 1,326 two-card hands.", ev[2], "= " + ans.toFixed(2) + "%."];
  } else {
    var e = pick([
      ["flop a set or better holding a pocket pair", 100 * (1 - choose(48, 3) / choose(50, 3)), "Miss = C(48,3) / C(50,3): all three flop cards from the 48 that are not your rank.", "About 1 in 8.5. That is why small pairs want cheap flops and deep stacks."],
      ["flop a flush holding two suited cards", 100 * choose(11, 3) / choose(50, 3), "All three flop cards from the 11 left in your suit: C(11,3) / C(50,3).", "Under 1%. Suited adds about 2–3% equity preflop, not a flush every other hand."],
      ["flop a four-flush or better holding two suited cards", 100 * (choose(11, 3) + choose(11, 2) * 39) / choose(50, 3), "Three of your suit, or exactly two plus one other: [C(11,3) + C(11,2)·39] / C(50,3).", "About 1 in 9."],
      ["pair at least one of your two unpaired cards on the flop", 100 * (1 - choose(44, 3) / choose(50, 3)), "Miss = all three from the 44 cards that match neither rank: C(44,3) / C(50,3).", "About 1 in 3. Two thirds of the time you flop nothing."]
    ]);
    ans = e[1];
    lines = [["Event", e[0]]];
    q = "Chance to " + e[0] + "?";
    math = ["50 cards are unseen from your seat; the flop is 3 of them: C(50,3) = 19,600 flops.", e[2], ans.toFixed(1) + "%. " + e[3]];
  }
  return {
    mode: "prob", target: 16, unit: "%", kind: "number", tol: ans < 3 ? 0.3 : ans < 12 ? 1 : 1.5, answer: ans,
    lines: lines, question: q,
    bar: { fill: Math.min(100, ans), tick: null, fillLabel: ans.toFixed(1) + "%", tickLabel: "" },
    math: math
  };
}

function genEV() {
  var v = randInt(3);
  if (v === 0) {
    var pot = pick(POTS), bet = betOf(pot, pick(FRACS));
    var e = pick([15, 20, 25, 30, 35, 40, 45, 55]);
    var final = pot + 2 * bet, ans = e / 100 * final - bet;
    return {
      mode: "ev", target: 18, unit: "$", kind: "number", tol: Math.max(3, Math.abs(ans) * 0.08), answer: ans,
      lines: [["Pot", money(pot)], ["He bets", money(bet)], ["Your equity", e + "%"]],
      question: "What is the EV of calling? (negative if it loses money)",
      bar: { fill: e, tick: 100 * bet / final, fillLabel: "your equity " + e + "%", tickLabel: "price " + (100 * bet / final).toFixed(1) + "%" },
      math: [
        "EV(call) = equity × final pot − call.",
        "Final pot = " + money(pot) + " + " + money(bet) + " + " + money(bet) + " = " + money(final) + ".",
        e + "% × " + money(final) + " − " + money(bet) + " = " + (ans < 0 ? "−" : "") + money(Math.abs(ans)) + ".",
        ans >= 0 ? "Positive: calling wins money on average, even though you lose this hand more often than not." : "Negative: folding (EV 0) is better."
      ]
    };
  }
  if (v === 1) {
    var pot2 = pick(POTS), bet2 = betOf(pot2, pick([0.5, 0.66, 0.75, 1]));
    var f = pick([20, 30, 35, 40, 50, 60]), eq = pick([0, 0, 15, 20, 30, 35]);
    var called = eq / 100 * (pot2 + 2 * bet2) - bet2;
    var ans2 = f / 100 * pot2 + (1 - f / 100) * called;
    return {
      mode: "ev", target: 25, unit: "$", kind: "number", tol: Math.max(3, Math.abs(ans2) * 0.1), answer: ans2,
      lines: [["Pot", money(pot2)], ["You bet", money(bet2)], ["He folds", f + "%"], ["Your equity if called", eq + "%"]],
      question: "What is the EV of the bet?",
      bar: null,
      math: [
        "EV = P(fold) × pot + P(call) × [equity × (pot + 2·bet) − bet].",
        "Fold branch: " + f + "% × " + money(pot2) + " = " + money(f / 100 * pot2) + ".",
        "Call branch: " + eq + "% × " + money(pot2 + 2 * bet2) + " − " + money(bet2) + " = " + (called < 0 ? "−" : "") + money(Math.abs(called)) + ", weighted by " + (100 - f) + "%.",
        "Total: " + (ans2 < 0 ? "−" : "") + money(Math.abs(ans2)) + "."
      ]
    };
  }
  /* a spread of outcomes */
  var outcomes = [[pick([10, 20, 25, 30]), pick([150, 200, 300, 400])], [pick([20, 30, 40]), pick([-50, -80, -100])]];
  outcomes.push([100 - outcomes[0][0] - outcomes[1][0], pick([-20, 0, 30, 60])]);
  var ans3 = outcomes.reduce(function (a, o) { return a + o[0] / 100 * o[1]; }, 0);
  var sgn = function (x) { return (x < 0 ? "−$" : "+$") + Math.abs(x); };
  return {
    mode: "ev", target: 20, unit: "$", kind: "number", tol: Math.max(2, Math.abs(ans3) * 0.08), answer: ans3,
    lines: outcomes.map(function (o, i) { return ["Outcome " + "ABC"[i], o[0] + "% of the time: " + sgn(o[1])]; }),
    question: "What is the expected value of this decision?",
    bar: null,
    math: [
      "EV = Σ probability × result.",
      outcomes.map(function (o) { return o[0] + "% × " + sgn(o[1]); }).join(" + ") + ".",
      "= " + (ans3 < 0 ? "−" : "") + money(Math.abs(ans3)) + " per decision, on average."
    ]
  };
}

/* ---------------- stage 2: preflop ---------------- */

function genRFI() {
  var pos = pick(["UTG", "HJ", "CO", "BTN", "SB"]);
  var set = rangeClasses(RFI[pos]);
  var inside = HAND_CLASSES.filter(function (h) { return set[h]; });
  /* border hands: out of this chart but in the next seat's, or in this chart but not the previous seat's */
  var idx = ["UTG", "HJ", "CO", "BTN", "SB"].indexOf(pos);
  var wider = rangeClasses(RFI[pos === "SB" ? "BTN" : pos === "BTN" ? "BTN" : ["HJ", "CO", "BTN", "BTN"][idx]]);
  var tighter = idx > 0 ? rangeClasses(RFI[["UTG", "UTG", "HJ", "CO", "CO"][idx]]) : {};
  var out = HAND_CLASSES.filter(function (h) { return !set[h] && wider[h]; });
  /* the button has no wider chart: use hands just outside it, with a high card or a suit */
  if (!out.length) out = HAND_CLASSES.filter(function (h) { return !set[h] && ("AKQJT".indexOf(h[0]) >= 0 || h[2] === "s"); });
  var edge = inside.filter(function (h) { return !tighter[h]; });
  var hand, open;
  if (Math.random() < 0.5) { hand = pick(edge.length ? edge : inside); open = true; }
  else { hand = pick(out); open = false; }
  var pct = rangePct(RFI[pos]);
  return {
    mode: "rfi", target: 8, kind: "choice", options: ["RAISE", "FOLD"], answer: open ? "RAISE" : "FOLD",
    lines: [["Seat", pos], ["Action", "folded to you"], ["Your hand", hand]],
    question: "Open-raise or fold?",
    bar: { fill: pct, tick: null, fillLabel: pos + " opens " + pctFmt(pct, 0) + " of hands", tickLabel: "" },
    math: [
      pos + " chart (" + pctFmt(pct, 0) + "): " + RFI[pos] + ".",
      hand + (open ? " is in it: raise." : " is not: fold."),
      open ? "Hands at the edge of a chart are close to break-even; the chart draws the line where raising stops beating folding."
           : "It would be an open from a later seat, where fewer players are left to wake up with a hand and you are more often in position."
    ]
  };
}

function genThreeBet() {
  var v = randInt(2);
  var open = pick([2, 2.5, 2.5, 3]);
  if (v === 0) {
    var three = Math.round(open * pick([3, 3.5, 4]) * 2) / 2;
    var pot = open + 1.5, risk = three;
    var ans = 100 * risk / (risk + pot);
    return {
      mode: "threebet", target: 15, unit: "%", kind: "number", tol: 1.5, answer: ans,
      lines: [["CO opens to", open + " bb"], ["You 3-bet from the button to", three + " bb"], ["Blinds", "0.5 + 1 bb, still to act"]],
      question: "As a pure bluff, how often must everyone fold for the 3-bet to break even?",
      bar: { fill: ans, tick: null, fillLabel: "folds needed " + ans.toFixed(1) + "%", tickLabel: "" },
      math: [
        "Break-even folds = risk / (risk + reward).",
        "Risk: your " + three + " bb. Reward: what is already in the pot, " + open + " + 0.5 + 1 = " + pot + " bb.",
        three + " / (" + three + " + " + pot + ") = " + ans.toFixed(1) + "%.",
        "It is the fold-equity formula with the pot measured in big blinds. A real 3-bet bluff also has equity when called, so it needs less."
      ]
    };
  }
  var three2 = Math.round(open * pick([3, 3.5, 4]) * 2) / 2;
  var call = three2 - open, potAfter = open + three2 + 1.5;
  var ans2 = 100 * call / (potAfter + call);
  return {
    mode: "threebet", target: 15, unit: "%", kind: "number", tol: 1.5, answer: ans2,
    lines: [["You open to", open + " bb"], ["Button 3-bets to", three2 + " bb"], ["Blinds", "folded (1.5 bb dead)"]],
    question: "What equity do you need to call the 3-bet (ignoring later streets)?",
    bar: { fill: ans2, tick: null, fillLabel: "price " + ans2.toFixed(1) + "%", tickLabel: "" },
    math: [
      "You have to add " + three2 + " − " + open + " = " + call + " bb.",
      "Pot before your call: " + open + " + " + three2 + " + 1.5 = " + potAfter + " bb.",
      "Price = " + call + " / (" + potAfter + " + " + call + ") = " + ans2.toFixed(1) + "%.",
      "Out of position you will realise less than your raw equity, so defend a little tighter than this price says."
    ]
  };
}

function genSPR() {
  var stack = pick([60, 80, 100, 100, 100, 150, 200]);
  var kind = randInt(2);
  var inv, pot, desc;
  if (kind === 0) {
    var r = pick([2.5, 3]);
    inv = r; pot = 2 * r + 1.5;
    desc = "CO opens " + r + " bb, BTN calls, blinds fold";
  } else {
    var o = pick([2.5, 3]), t = pick([8, 9, 10, 11]);
    inv = t; pot = 2 * t + 1.5;
    desc = "CO opens " + o + " bb, BTN 3-bets to " + t + " bb, CO calls, blinds fold";
  }
  var left = stack - inv, ans = left / pot;
  return {
    mode: "spr", target: 14, kind: "number", tol: Math.max(0.3, ans * 0.08), answer: ans,
    lines: [["Effective stacks", stack + " bb"], ["Preflop", desc]],
    question: "What is the stack-to-pot ratio on the flop?",
    bar: { fill: Math.min(100, 100 * ans / 15), tick: 100 * 3 / 15, fillLabel: "SPR " + ans.toFixed(1), tickLabel: "about 3: one pair is committed" },
    math: [
      "SPR = effective stack behind / pot on the flop.",
      "Pot on the flop = " + pot + " bb. Stack behind = " + stack + " − " + inv + " = " + left + " bb.",
      "SPR = " + left + " / " + pot + " = " + ans.toFixed(1) + ". " + (ans < 4 ? "Low: top pair is usually happy to get it all in." : ans < 10 ? "Medium: top pair wants a pot, not a stack." : "High: it takes two pair or better to want stacks in.")
    ]
  };
}

/* ---------------- stage 5: postflop strategy ---------------- */

function genEQR() {
  var v = randInt(2);
  var pot = pick(POTS), bet = betOf(pot, pick(FRACS));
  var price = 100 * bet / (pot + 2 * bet);
  if (v === 0) {
    var R = pick([0.7, 0.75, 0.8, 0.85, 0.9, 1.05, 1.1]);
    var need = price / R;
    return {
      mode: "eqr", target: 18, unit: "%", kind: "number", tol: 1.5, answer: need,
      lines: [["Pot", money(pot)], ["He bets", money(bet)], ["Your realisation", Math.round(R * 100) + "% " + (R < 1 ? "(out of position)" : "(in position)")]],
      question: "What raw equity do you need to call?",
      bar: { fill: need, tick: price, fillLabel: "raw equity needed " + need.toFixed(1) + "%", tickLabel: "pot odds " + price.toFixed(1) + "%" },
      math: [
        "You only collect R × equity on average: the rest leaks away on later streets.",
        "Need R × equity ≥ price, so equity ≥ price / R.",
        price.toFixed(1) + "% / " + R + " = " + need.toFixed(1) + "%.",
        R < 1 ? "Out of position you need more than the pot odds say." : "In position you realise more than your share, so you can call a little lighter."
      ]
    };
  }
  var eq = pick([25, 30, 35, 40, 45]), R2 = pick([0.7, 0.8, 0.9, 1.1]);
  var eff = eq * R2, call = eff >= price;
  return {
    mode: "eqr", target: 16, kind: "choice", options: ["CALL", "FOLD"], answer: call ? "CALL" : "FOLD",
    lines: [["Pot", money(pot)], ["He bets", money(bet)], ["Your equity", eq + "%"], ["Realisation", Math.round(R2 * 100) + "%"]],
    question: "Call or fold, once realisation is counted?",
    bar: { fill: eff, tick: price, fillLabel: "realised equity " + eff.toFixed(1) + "%", tickLabel: "price " + price.toFixed(1) + "%" },
    math: [
      "Realised equity = " + eq + "% × " + R2 + " = " + eff.toFixed(1) + "%.",
      "Price = " + money(bet) + " / " + money(pot + 2 * bet) + " = " + price.toFixed(1) + "%.",
      call ? "Realised equity clears the price: call." : "Raw equity alone would look fine or close, but what you actually collect falls short: fold."
    ]
  };
}

function genCbet() {
  var pot = pick([6, 7, 8, 10, 12, 16, 20]) * 10;
  var frac = pick([0.25, 0.33, 0.5, 0.66, 0.75, 1]);
  var bet = Math.round(pot * frac / 5) * 5 || 5;
  var need = 100 * bet / (pot + bet);
  var f = Math.max(5, Math.min(90, Math.round(need + (Math.random() < 0.5 ? -1 : 1) * (4 + randInt(18)))));
  if (Math.random() < 0.5) {
    var ok = f > need;
    return {
      mode: "cbet", target: 12, kind: "choice", options: ["BET", "CHECK"], answer: ok ? "BET" : "CHECK",
      lines: [["Pot", money(pot)], ["Your c-bet", money(bet) + " (" + Math.round(frac * 100) + "% pot)"], ["He folds to it", f + "%"], ["Your hand", "no equity if called"]],
      question: "Is the c-bet bluff profitable on its own?",
      bar: { fill: f, tick: need, fillLabel: "he folds " + f + "%", tickLabel: "break-even " + need.toFixed(1) + "%" },
      math: [
        "A pure bluff needs folds ≥ bet / (pot + bet) = " + money(bet) + " / " + money(pot + bet) + " = " + need.toFixed(1) + "%.",
        "He folds " + f + "%: " + (ok ? "above the line, so the bet profits by itself." : "below it, so the bet loses unless your hand has equity to fall back on."),
        "Small c-bets need few folds: a third of the pot needs only 25%. That is why range bets on dry boards work."
      ]
    };
  }
  var ev = f / 100 * pot - (1 - f / 100) * bet;
  return {
    mode: "cbet", target: 16, unit: "$", kind: "number", tol: Math.max(2, Math.abs(ev) * 0.1), answer: ev,
    lines: [["Pot", money(pot)], ["Your c-bet", money(bet)], ["He folds to it", f + "%"], ["Your hand", "no equity if called"]],
    question: "What is the EV of this c-bet bluff?",
    bar: { fill: f, tick: need, fillLabel: "he folds " + f + "%", tickLabel: "break-even " + need.toFixed(1) + "%" },
    math: [
      "EV = P(fold) × pot − P(call) × bet.",
      f + "% × " + money(pot) + " − " + (100 - f) + "% × " + money(bet) + " = " + (ev < 0 ? "−" : "") + money(Math.abs(ev)) + ".",
      "Break-even at " + need.toFixed(1) + "% folds."
    ]
  };
}

function geoFrac(pot, stack, n) { return (Math.pow(1 + 2 * stack / pot, 1 / n) - 1) / 2; }
function genGeo() {
  var pot = pick([10, 12, 15, 20, 25, 30]), n = pick([1, 2, 2, 3, 3]);
  var spr = pick([1, 1.5, 2, 3, 4, 5, 6, 8, 10]);
  var stack = Math.round(pot * spr);
  var f = geoFrac(pot, stack, n), ans = 100 * f;
  var p = pot, lines = [];
  for (var i = 0; i < n; i++) { var b = f * p; lines.push(bbFmt(b) + " into " + bbFmt(p)); p += 2 * b; }
  return {
    mode: "geo", target: 30, unit: "%", kind: "number", tol: Math.max(4, ans * 0.08), answer: ans,
    lines: [["Pot", pot + " bb"], ["Effective stack", stack + " bb"], ["Streets left", n === 3 ? "flop, turn and river" : n === 2 ? "turn and river" : "river only"]],
    question: "Betting the same fraction of the pot each street, what fraction gets the stacks in by the river?",
    bar: { fill: Math.min(100, ans / 2), tick: null, fillLabel: ans.toFixed(0) + "% of the pot each street", tickLabel: "" },
    math: [
      "Each pot-fraction bet f, called, multiplies the pot by (1 + 2f).",
      "All in after " + n + (n === 1 ? " street" : " streets") + ": pot × (1 + 2f)^" + n + " = pot + 2 × stack, so f = [(1 + 2·stack/pot)^(1/" + n + ") − 1] / 2.",
      "(1 + 2 × " + stack + "/" + pot + ")^(1/" + n + ") = " + Math.pow(1 + 2 * stack / pot, 1 / n).toFixed(3) + ", so f = " + f.toFixed(3) + " = " + ans.toFixed(0) + "% of the pot.",
      "Streets: " + lines.join(", then ") + "."
    ]
  };
}

function genMulti() {
  var sizes = [[0.5, "half pot"], [0.66, "two thirds"], [0.75, "three quarters"], [1, "pot"], [1.5, "1.5× pot"]];
  var t = pick(sizes), r = pick(sizes);
  var at = t[0] / (1 + 2 * t[0]), ar = r[0] / (1 + 2 * r[0]);
  var ans = 100 * (at + (1 - at) * ar);
  return {
    mode: "multi", target: 25, unit: "%", kind: "number", tol: 2, answer: ans,
    lines: [["Turn bet", t[1]], ["River bet", r[1]], ["Model", "bluffs never win at showdown; he holds a bluff catcher"]],
    question: "What share of your turn betting range should be bluffs?",
    bar: { fill: ans, tick: 100 * ar, fillLabel: "turn bluffs " + ans.toFixed(1) + "%", tickLabel: "river bluffs " + (100 * ar).toFixed(1) + "%" },
    math: [
      "River: α_r = b / (1 + 2b) = " + (100 * ar).toFixed(1) + "% of the river bets are bluffs.",
      "Turn: for his call to be break-even, a share α_t = " + (100 * at).toFixed(1) + "% of your turn bets must give up on the river.",
      "Turn bluffs = give-ups + river bluffs = α_t + (1 − α_t) × α_r = " + (100 * at).toFixed(1) + "% + " + (100 * (1 - at)).toFixed(1) + "% × " + (100 * ar).toFixed(1) + "% = " + ans.toFixed(1) + "%.",
      "Earlier streets carry more bluffs, because some of them will give up later."
    ]
  };
}

/* ---------------- stage 4: the AKQ game ---------------- */

function genAKQ() {
  var P = pick([2, 2, 3, 4]), B = pick([1, 1, 2, 3].filter(function (b) { return b < P; }));
  var askX = Math.random() < 0.5;
  var beta = B / (P + B), c = (P - B) / (P + B);
  var alpha = B / (P + 2 * B);
  if (askX) {
    return {
      mode: "akq", target: 25, unit: "%", kind: "number", tol: 2, answer: 100 * beta,
      lines: [["Deck", "A, K, Q: one card each"], ["Pot", P + ""], ["X may bet", B + ""], ["Y", "calls or folds"]],
      question: "How often should X bluff with the queen?",
      bar: { fill: 100 * beta, tick: null, fillLabel: "bluff Q " + (100 * beta).toFixed(1) + "%", tickLabel: "" },
      math: [
        "X bets every ace. The share of X's bets that are bluffs must be α = B / (P + 2B) = " + (100 * alpha).toFixed(1) + "%, to make Y's king indifferent.",
        "With A and Q equally likely: bluffs / (aces + bluffs) = β / (1 + β) = α, so β = α / (1 − α) = B / (P + B).",
        B + " / (" + P + " + " + B + ") = " + (100 * beta).toFixed(1) + "% of queens are bluffed. X checks every king: betting it only gets called by the ace."
      ]
    };
  }
  return {
    mode: "akq", target: 25, unit: "%", kind: "number", tol: 2, answer: 100 * c,
    lines: [["Deck", "A, K, Q: one card each"], ["Pot", P + ""], ["X may bet", B + ""], ["Y", "calls or folds"]],
    question: "How often should Y call a bet with the king?",
    bar: { fill: 100 * c, tick: null, fillLabel: "call with K " + (100 * c).toFixed(1) + "%", tickLabel: "" },
    math: [
      "Y's ace always calls and Y's queen always folds. Only the king is a real decision.",
      "X's queen-bluff must be break-even: P(fold) × P = P(call) × B. Facing a queen, Y holds A or K equally, so P(fold) = (1 − c)/2.",
      "(1 − c) × " + P + " = (1 + c) × " + B + ", so c = (P − B) / (P + B) = " + (100 * c).toFixed(1) + "%.",
      "Across Y's whole range that is exactly MDF: Y continues with the ace and a slice of kings."
    ]
  };
}

/* ---------------- stage 6: tournaments ---------------- */

function genJam() {
  var S = pick([6, 8, 10, 12, 15]), ante = pick([0, 0, 1]);
  var c = pick([15, 20, 25, 30, 40, 50]) / 100;
  var e = pick([30, 35, 38, 42, 45, 50]) / 100;
  var P = 1.5 + ante, X = S - 0.5, F = 2 * S + ante;
  var ev = (1 - c) * P + c * (e * F - X);
  var asChoice = Math.random() < 0.4;
  var lines = [["Your stack (SB)", S + " bb, blinds 0.5/1" + (ante ? ", 1 bb ante in" : "")], ["Big blind calls", Math.round(c * 100) + "% of hands"], ["Your equity when called", Math.round(e * 100) + "%"]];
  var math = [
    "EV(jam) = P(fold) × pot + P(call) × (equity × final pot − what you add).",
    "Fold: " + Math.round((1 - c) * 100) + "% × " + P + " bb = " + ((1 - c) * P).toFixed(2) + " bb.",
    "Call: you add " + X + " bb; the final pot is " + F + " bb. " + Math.round(e * 100) + "% × " + F + " − " + X + " = " + (e * F - X).toFixed(2) + " bb, times " + Math.round(c * 100) + "%.",
    "EV = " + ev.toFixed(2) + " bb compared with folding" + (ev > 0 ? ": shove." : ": fold.")
  ];
  if (asChoice) return {
    mode: "jam", target: 25, kind: "choice", options: ["JAM", "FOLD"], answer: ev > 0 ? "JAM" : "FOLD",
    lines: lines, question: "Shove or fold?", bar: null, math: math
  };
  return {
    mode: "jam", target: 30, kind: "number", tol: Math.max(0.15, Math.abs(ev) * 0.1), answer: ev,
    lines: lines, question: "EV of shoving, in big blinds, compared with folding?", bar: null, math: math
  };
}

function icmEquity(stacks, prizes) {
  var T = stacks.reduce(function (a, b) { return a + b; }, 0);
  var n = stacks.length, eq = stacks.map(function () { return 0; });
  /* Malmuth-Harville: recursively, finish first with probability stack / chips left */
  function rec(left, placed, prob, place) {
    if (place >= prizes.length || !left.length) return;
    var sum = left.reduce(function (a, i) { return a + stacks[i]; }, 0);
    left.forEach(function (i) {
      var p = prob * stacks[i] / sum;
      eq[i] += p * prizes[place];
      rec(left.filter(function (j) { return j !== i; }), placed, p, place + 1);
    });
  }
  rec(stacks.map(function (_, i) { return i; }), [], 1, 0);
  return eq;
}

function genICM() {
  var total = pick([100, 200, 500, 1000]);
  var split = pick([[50, 30, 20], [65, 35], [50, 30, 20], [60, 40]]);
  var prizes = split.map(function (x) { return total * x / 100; });
  var stacks = [pick([2000, 3000, 4000, 5000, 6000]), pick([1000, 2000, 3000, 4000]), pick([1000, 1500, 2000, 3000])];
  var eq = icmEquity(stacks, prizes);
  var T = stacks[0] + stacks[1] + stacks[2];
  var who = randInt(3), ans = eq[who];
  var chip = total * stacks[who] / T;
  return {
    mode: "icm", target: 45, unit: "$", kind: "number", tol: Math.max(1, ans * 0.04), answer: ans,
    lines: [["Stacks", stacks.map(function (s, i) { return "ABC"[i] + " " + s.toLocaleString(); }).join(", ")], ["Prizes", prizes.map(function (p, i) { return ["1st", "2nd", "3rd"][i] + " " + money(p); }).join(", ")]],
    question: "What is player " + "ABC"[who] + "'s ICM equity in dollars?",
    bar: { fill: 100 * ans / total, tick: 100 * chip / total, fillLabel: "ICM " + money(ans), tickLabel: "chip share " + money(chip) },
    math: [
      "P(1st) = stack / total chips. P(2nd) = Σ over each other player j of P(j wins) × stack / (total − stack_j).",
      "Player " + "ABC"[who] + ": P(1st) = " + (100 * stacks[who] / T).toFixed(1) + "%.",
      "Summed over places: " + money(ans) + ", against a chip-share value of " + money(chip) + ".",
      (ans < chip ? "Big stacks are worth less than their chips, " : "Short stacks are worth more than their chips, ") + "because the prizes are flatter than the chips: chips you win are worth less than chips you lose."
    ]
  };
}

/* ---------------- registry ---------------- */
GENS.rules = genRules; GENS.position = genPosition; GENS.prob = genProb; GENS.ev = genEV;
GENS.rfi = genRFI; GENS.threebet = genThreeBet; GENS.spr = genSPR;
GENS.eqr = genEQR; GENS.cbet = genCbet; GENS.geo = genGeo; GENS.multi = genMulti;
GENS.akq = genAKQ; GENS.jam = genJam; GENS.icm = genICM;

if (typeof module !== "undefined") module.exports = {
  RFI: RFI, SEATS6: SEATS6, POST6: POST6, HAND_CLASSES: HAND_CLASSES, rangeClasses: rangeClasses, rangePct: rangePct,
  choose: choose, geoFrac: geoFrac, icmEquity: icmEquity
};
