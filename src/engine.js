/* ============================================================
   ENGINE: cards, 7-card evaluator, equity, drill generators
   Card index 0..51 :: rank = i % 13 (0='2' .. 12='A'), suit = (i/13)|0 (0=c,1=d,2=h,3=s)
   ============================================================ */

var RANKS = "23456789TJQKA";
var SUITS = "cdhs";

function cardRank(c) { return c % 13; }
function cardSuit(c) { return (c / 13) | 0; }
function cardText(c) { return RANKS[c % 13] + SUITS[(c / 13) | 0]; }

function randInt(n) { return (Math.random() * n) | 0; }
function pick(a) { return a[randInt(a.length)]; }

/* ---------- evaluator ---------- */

var _rc = new Int8Array(13), _sc = new Int8Array(4), _sm = new Int32Array(4);

function topN(mask, n) {
  var out = [];
  for (var r = 12; r >= 0 && out.length < n; r--) if (mask & (1 << r)) out.push(r);
  while (out.length < n) out.push(0);
  return out;
}

/* returns high rank index of best straight, or -1 */
function straightHigh(mask) {
  var e = (mask << 1) | ((mask >> 12) & 1); /* bit0 = ace-low, bit r+1 = rank r */
  for (var h = 13; h >= 4; h--) {
    if (((e >> (h - 4)) & 0x1f) === 0x1f) return h - 1;
  }
  return -1;
}

function sc(cat, a, b, c, d, e) {
  return ((((cat * 13 + a) * 13 + b) * 13 + c) * 13 + d) * 13 + e;
}

/* cards: array-like of 7 card indices */
function eval7(cards) {
  _rc.fill(0); _sc.fill(0); _sm.fill(0);
  var rm = 0, i, cd, r, s;
  for (i = 0; i < 7; i++) {
    cd = cards[i]; r = cd % 13; s = (cd / 13) | 0;
    _rc[r]++; _sc[s]++; _sm[s] |= 1 << r; rm |= 1 << r;
  }
  var fs = -1;
  for (s = 0; s < 4; s++) if (_sc[s] >= 5) fs = s;
  if (fs >= 0) {
    var sfh = straightHigh(_sm[fs]);
    if (sfh >= 0) return sc(8, sfh, 0, 0, 0, 0);
    var ft = topN(_sm[fs], 5);
    return sc(5, ft[0], ft[1], ft[2], ft[3], ft[4]);
  }
  var quads = [], trips = [], pairs = [];
  for (r = 12; r >= 0; r--) {
    if (_rc[r] === 4) quads.push(r);
    else if (_rc[r] === 3) trips.push(r);
    else if (_rc[r] === 2) pairs.push(r);
  }
  if (quads.length) return sc(7, quads[0], topN(rm & ~(1 << quads[0]), 1)[0], 0, 0, 0);
  if (trips.length >= 2) return sc(6, trips[0], trips[1], 0, 0, 0);
  if (trips.length === 1 && pairs.length >= 1) return sc(6, trips[0], pairs[0], 0, 0, 0);
  var sh = straightHigh(rm);
  if (sh >= 0) return sc(4, sh, 0, 0, 0, 0);
  if (trips.length === 1) {
    var tk = topN(rm & ~(1 << trips[0]), 2);
    return sc(3, trips[0], tk[0], tk[1], 0, 0);
  }
  if (pairs.length >= 2) {
    var pk = topN(rm & ~(1 << pairs[0]) & ~(1 << pairs[1]), 1);
    return sc(2, pairs[0], pairs[1], pk[0], 0, 0);
  }
  if (pairs.length === 1) {
    var ok = topN(rm & ~(1 << pairs[0]), 3);
    return sc(1, pairs[0], ok[0], ok[1], ok[2], 0);
  }
  var ht = topN(rm, 5);
  return sc(0, ht[0], ht[1], ht[2], ht[3], ht[4]);
}

var CAT_NAMES = ["high card", "one pair", "two pair", "three of a kind", "straight",
  "flush", "full house", "four of a kind", "straight flush"];
function handCategory(score) { return CAT_NAMES[Math.floor(score / (13 * 13 * 13 * 13 * 13))]; }

/* ---------- equity ---------- */

var _h7a = new Int32Array(7), _h7b = new Int32Array(7);

function remainingDeck(dead) {
  var d = [], seen = {}, i;
  for (i = 0; i < dead.length; i++) seen[dead[i]] = 1;
  for (i = 0; i < 52; i++) if (!seen[i]) d.push(i);
  return d;
}

/* exact enumeration; board must have 3 or 4 cards */
function equityExact(h1, h2, board) {
  var deck = remainingDeck(h1.concat(h2, board));
  var w = 0, l = 0, t = 0, i, j, s1, s2, k;
  _h7a[0] = h1[0]; _h7a[1] = h1[1];
  _h7b[0] = h2[0]; _h7b[1] = h2[1];
  for (k = 0; k < board.length; k++) { _h7a[2 + k] = board[k]; _h7b[2 + k] = board[k]; }
  var base = 2 + board.length;
  if (base === 5) {
    for (i = 0; i < deck.length; i++) {
      for (j = i + 1; j < deck.length; j++) {
        _h7a[5] = _h7b[5] = deck[i];
        _h7a[6] = _h7b[6] = deck[j];
        s1 = eval7(_h7a); s2 = eval7(_h7b);
        if (s1 > s2) w++; else if (s1 < s2) l++; else t++;
      }
    }
  } else {
    for (i = 0; i < deck.length; i++) {
      _h7a[6] = _h7b[6] = deck[i];
      s1 = eval7(_h7a); s2 = eval7(_h7b);
      if (s1 > s2) w++; else if (s1 < s2) l++; else t++;
    }
  }
  return (w + t / 2) / (w + l + t);
}

/* monte carlo for preflop (5 cards to come) */
function equityMC(h1, h2, trials) {
  trials = trials || 25000;
  var deck = remainingDeck(h1.concat(h2));
  var n = deck.length, w = 0, l = 0, t = 0, i, k, j, tmp, s1, s2;
  _h7a[0] = h1[0]; _h7a[1] = h1[1];
  _h7b[0] = h2[0]; _h7b[1] = h2[1];
  for (i = 0; i < trials; i++) {
    for (k = 0; k < 5; k++) {
      j = k + ((Math.random() * (n - k)) | 0);
      tmp = deck[k]; deck[k] = deck[j]; deck[j] = tmp;
      _h7a[2 + k] = _h7b[2 + k] = deck[k];
    }
    s1 = eval7(_h7a); s2 = eval7(_h7b);
    if (s1 > s2) w++; else if (s1 < s2) l++; else t++;
  }
  return (w + t / 2) / trials;
}

/* ---------- hand generation ---------- */

/* draws a hand people actually play, so matchups are instructive */
function genHand(dead) {
  for (var att = 0; att < 800; att++) {
    var t = Math.random(), r1, r2, s1, s2;
    if (t < 0.22) { r1 = r2 = randInt(13); s1 = randInt(4); do { s2 = randInt(4); } while (s2 === s1); }
    else if (t < 0.34) { r1 = 12; r2 = randInt(12); s1 = s2 = randInt(4); }
    else if (t < 0.44) { r1 = 12; r2 = randInt(12); s1 = randInt(4); do { s2 = randInt(4); } while (s2 === s1); }
    else if (t < 0.58) { r1 = 8 + randInt(5); do { r2 = 8 + randInt(5); } while (r2 === r1); s1 = randInt(4); do { s2 = randInt(4); } while (s2 === s1); }
    else if (t < 0.68) { r1 = 8 + randInt(5); do { r2 = 8 + randInt(5); } while (r2 === r1); s1 = s2 = randInt(4); }
    else if (t < 0.86) { r1 = randInt(10); r2 = r1 + 1 + randInt(2); if (r2 > 12) continue; s1 = s2 = randInt(4); }
    else { r1 = randInt(13); r2 = randInt(13); s1 = randInt(4); s2 = randInt(4); }
    var c1 = s1 * 13 + r1, c2 = s2 * 13 + r2;
    if (c1 === c2) continue;
    if (dead.indexOf(c1) >= 0 || dead.indexOf(c2) >= 0) continue;
    return [c1, c2];
  }
  return null;
}

function dealCards(n, dead) {
  var out = [];
  while (out.length < n) {
    var c = randInt(52);
    if (dead.indexOf(c) >= 0 || out.indexOf(c) >= 0) continue;
    out.push(c);
  }
  return out;
}

/* plain-language read on a preflop matchup */
function classifyPreflop(h, v) {
  var hr = [cardRank(h[0]), cardRank(h[1])].sort(function (a, b) { return b - a; });
  var vr = [cardRank(v[0]), cardRank(v[1])].sort(function (a, b) { return b - a; });
  var hp = hr[0] === hr[1], vp = vr[0] === vr[1];
  var hs = cardSuit(h[0]) === cardSuit(h[1]), vs = cardSuit(v[0]) === cardSuit(v[1]);
  var suitNote = (hs || vs) ? " Suitedness is worth roughly 2 to 4 points." : "";

  function pairVsCards(pr, cr) {
    var sharesRank = (cr[0] === pr || cr[1] === pr);
    var hasOvercard = cr[0] > pr;
    if (sharesRank && !hasOvercard) return "Pair against a hand it dominates, like AA vs AK: about 93/7 for the pair.";
    if (cr[0] < pr) return "Pair against two undercards: about 80/20 for the pair.";
    if (cr[1] > pr) return "Pair against two overcards: near a flip, about 55/45 for the pair.";
    return "Pair against one overcard: about 70/30 for the pair.";
  }
  if (hp && vp) return "Pair over pair: about 80/20 for the bigger pair.";
  if (hp && !vp) return pairVsCards(hr[0], vr) + suitNote;
  if (!hp && vp) return pairVsCards(vr[0], hr) + suitNote;

  var shared = (hr[0] === vr[0] || hr[0] === vr[1] || hr[1] === vr[0] || hr[1] === vr[1]);
  if (shared) return "Domination: sharing a card with the worse kicker is about 26/74." + suitNote;
  if (hr[1] > vr[0] || vr[1] > hr[0]) return "Two overcards against two undercards: about 63/37 for the higher hand." + suitNote;
  return "Interlocked unpaired hands: usually 55/45 to 60/40 toward the stronger top card." + suitNote;
}

/* ---------- drill generators ----------
   each returns { mode, target, lines[], question, kind, unit, answer, tol,
                  bar:{fill, tick, fillLabel, tickLabel}, math[] }        */

var POTS = [20, 25, 30, 40, 50, 60, 75, 80, 100, 120, 150, 200, 250, 300];
var FRACS = [0.33, 0.4, 0.5, 0.6, 0.66, 0.75, 1, 1.25, 1.5, 2];

function money(x) { return "$" + Math.round(x).toLocaleString(); }
function betOf(pot, f) { var b = Math.round(pot * f / 5) * 5; return b < 5 ? 5 : b; }

function genPotOdds() {
  var pot = pick(POTS), f = pick(FRACS), bet = betOf(pot, f);
  var final = pot + 2 * bet;
  var ans = 100 * bet / final;
  return {
    mode: "potodds", target: 8,
    lines: [["Pot", money(pot)], ["Villain bets", money(bet)], ["To call", money(bet)]],
    question: "What equity do you need to break even on the call?",
    kind: "number", unit: "%", answer: ans, tol: 1,
    bar: { fill: ans, tick: null, fillLabel: "break-even equity you must beat", tickLabel: "" },
    math: [
      "call / (pot + villain bet + your call)",
      money(bet) + " / " + money(final) + " = " + ans.toFixed(1) + "%",
      "You are risking " + money(bet) + " to win " + money(pot + bet) + ", so " + (Math.round(10 * (pot + bet) / bet) / 10) + " to 1."
    ]
  };
}

function genOuts() {
  var outs = pick([2, 3, 4, 4, 4, 5, 6, 6, 8, 8, 8, 9, 9, 9, 10, 12, 13, 15, 15]);
  var scen = pick(["flop2", "flop2", "flop1", "turn1"]);
  var ans, label, quick, quickTxt, math;
  if (scen === "flop2") {
    ans = 100 * (1 - ((47 - outs) / 47) * ((46 - outs) / 46));
    label = "on the flop, both cards to come (all in)";
    quick = 4 * outs;
    math = [
      "1 - (miss turn x miss river) = 1 - " + (47 - outs) + "/47 x " + (46 - outs) + "/46 = " + ans.toFixed(1) + "%",
      "Rule of 4: " + outs + " x 4 = " + quick + "%. Error " + (quick - ans >= 0 ? "+" : "") + (quick - ans).toFixed(1) + " pts."
    ];
  } else if (scen === "flop1") {
    ans = 100 * outs / 47;
    label = "on the flop, turn card only";
    quick = 2 * outs;
    math = [outs + "/47 = " + ans.toFixed(1) + "%", "Rule of 2: " + outs + " x 2 = " + quick + "%. Error " + (quick - ans >= 0 ? "+" : "") + (quick - ans).toFixed(1) + " pts."];
  } else {
    ans = 100 * outs / 46;
    label = "on the turn, river card only";
    quick = 2 * outs;
    math = [outs + "/46 = " + ans.toFixed(1) + "%", "Rule of 2: " + outs + " x 2 = " + quick + "%. Error " + (quick - ans >= 0 ? "+" : "") + (quick - ans).toFixed(1) + " pts."];
  }
  return {
    mode: "outs", target: 6,
    lines: [["Outs", String(outs)], ["Street", label]],
    question: "How often do you hit at least one out?",
    kind: "number", unit: "%", answer: ans, tol: 2,
    bar: { fill: ans, tick: null, fillLabel: "your equity", tickLabel: "" },
    math: math
  };
}

function genImplied() {
  for (var i = 0; i < 200; i++) {
    var outs = pick([4, 5, 6, 8, 9, 12]);
    var e = outs / 46;
    var pot = pick([50, 60, 80, 100, 120, 150, 200]);
    var bet = betOf(pot, pick([0.5, 0.66, 0.75, 1]));
    var post = pot + bet, call = bet;
    var need = 100 * call / (post + call);
    if (100 * e >= need - 1) continue;             /* only ask when the raw call is bad */
    var x = ((1 - e) * call) / e - post;
    if (x < 15 || x > 1200) continue;
    return {
      mode: "implied", target: 20,
      lines: [["Pot", money(pot)], ["Villain bets", money(bet)], ["To call", money(bet)],
      ["Your outs", outs + " (river only, " + (100 * e).toFixed(1) + "%)"]],
      question: "How much extra must you win on the river to make this call break even?",
      kind: "number", unit: "$", answer: x, tol: Math.max(6, x * 0.08),
      bar: { fill: 100 * e, tick: need, fillLabel: "your equity", tickLabel: "pot odds need " + need.toFixed(1) + "%" },
      math: [
        "Break even: e x (pot + extra) = (1 - e) x call",
        "extra = (1 - e) x call / e - pot",
        "= " + (1 - e).toFixed(3) + " x " + money(call) + " / " + e.toFixed(3) + " - " + money(post) + " = " + money(x),
        "Villain has to pay you off " + money(x) + " on average across every river you hit, so weight it by how often they actually call."
      ]
    };
  }
  return genPotOdds();
}

function genBluff() {
  for (var i = 0; i < 200; i++) {
    var pot = pick(POTS), bet = betOf(pot, pick([0.25, 0.33, 0.5, 0.66, 0.75, 1, 1.5, 2]));
    var semi = Math.random() < 0.35;
    if (!semi) {
      var ans = 100 * bet / (pot + bet);
      return {
        mode: "bluff", target: 8,
        lines: [["Pot", money(pot)], ["Your bluff", money(bet)], ["Equity when called", "0% (pure bluff)"]],
        question: "How often must villain fold for this to break even?",
        kind: "number", unit: "%", answer: ans, tol: 1.5,
        bar: { fill: ans, tick: null, fillLabel: "folds needed to break even", tickLabel: "" },
        math: [
          "bet / (pot + bet) = " + money(bet) + " / " + money(pot + bet) + " = " + ans.toFixed(1) + "%",
          "Risking " + money(bet) + " to win " + money(pot) + ". Bigger bets need more folds, and they always need the fold percentage of their own price."
        ]
      };
    }
    var e = pick([0.12, 0.16, 0.2, 0.25, 0.3, 0.35]);
    var K = e * (pot + bet) - (1 - e) * bet;
    if (K >= -1) continue;                          /* already printing without folds */
    var f = 100 * K / (K - pot);
    if (f < 3) continue;
    return {
      mode: "bluff", target: 12,
      lines: [["Pot", money(pot)], ["Your bet", money(bet)], ["Equity when called", (100 * e).toFixed(0) + "%"]],
      question: "How often must villain fold for this semi-bluff to break even?",
      kind: "number", unit: "%", answer: f, tol: 2.5,
      bar: { fill: f, tick: null, fillLabel: "folds needed to break even", tickLabel: "" },
      math: [
        "Called: " + e.toFixed(2) + " x " + money(pot + bet) + " - " + (1 - e).toFixed(2) + " x " + money(bet) + " = " + money(K) + " (a loss)",
        "Folds win the " + money(pot) + " outright. f x pot + (1 - f) x called = 0",
        "f = " + Math.abs(K).toFixed(0) + " / (" + Math.abs(K).toFixed(0) + " + " + pot + ") = " + f.toFixed(1) + "%",
        "Pure bluff would need " + (100 * bet / (pot + bet)).toFixed(1) + "%. Equity when called buys you " + (100 * bet / (pot + bet) - f).toFixed(1) + " points of fold equity."
      ]
    };
  }
  return genBluff();
}

function genPreflopEquity() {
  var h = genHand([]), v = genHand(h);
  var eq = 100 * equityMC(h, v, 25000);
  return {
    mode: "pfeq", target: 12,
    cards: { hero: h, villain: v, board: [] },
    lines: [],
    question: "All in preflop. What is your equity?",
    kind: "number", unit: "%", answer: eq, tol: 4,
    bar: { fill: eq, tick: 50, fillLabel: "your equity", tickLabel: "flip" },
    math: [classifyPreflop(h, v), "Simulated: " + eq.toFixed(1) + "% for you, " + (100 - eq).toFixed(1) + "% for villain."]
  };
}

function genAllin() {
  for (var i = 0; i < 400; i++) {
    var h = genHand([]), v = genHand(h);
    var street = Math.random() < 0.6 ? 3 : 4;
    var board = dealCards(street, h.concat(v));
    var eq = 100 * equityExact(h, v, board);
    var pot = pick([40, 50, 60, 80, 100, 120, 150, 200]);
    var bet = betOf(pot, pick([0.5, 0.66, 0.75, 1, 1.25, 1.5, 2]));
    var need = 100 * bet / (pot + 2 * bet);
    if (Math.abs(eq - need) < 3) continue;          /* keep the answer unambiguous */
    var call = eq > need;
    return {
      mode: "allin", target: 15,
      cards: { hero: h, villain: v, board: board },
      lines: [["Pot", money(pot)], ["Villain shoves", money(bet)], ["To call", money(bet)]],
      question: "Villain is all in with their hand face up. Call or fold?",
      kind: "choice", unit: "", options: ["CALL", "FOLD"], answer: call ? "CALL" : "FOLD", tol: 0,
      bar: { fill: eq, tick: need, fillLabel: "your equity " + eq.toFixed(1) + "%", tickLabel: "need " + need.toFixed(1) + "%" },
      math: [
        "Pot odds: " + money(bet) + " / " + money(pot + 2 * bet) + " = " + need.toFixed(1) + "% needed.",
        "Exact equity against that hand on this board: " + eq.toFixed(1) + "%.",
        (call ? "Equity clears the price by " + (eq - need).toFixed(1) + " points, so calling is +EV by " + money((eq / 100) * (pot + 2 * bet) - bet) + " per call."
          : "Equity misses the price by " + (need - eq).toFixed(1) + " points, so calling burns " + money(bet - (eq / 100) * (pot + 2 * bet)) + " per call.")
      ]
    };
  }
  return genPotOdds();
}

var GENS = {
  potodds: genPotOdds, outs: genOuts, implied: genImplied,
  bluff: genBluff, pfeq: genPreflopEquity, allin: genAllin
};

if (typeof module !== "undefined") {
  module.exports = { eval7: eval7, equityExact: equityExact, equityMC: equityMC, cardText: cardText,
    handCategory: handCategory, straightHigh: straightHigh, GENS: GENS, genHand: genHand };
}
