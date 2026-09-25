/* ============================================================
   BOTS: the opponents at the Play table
   Every bot plays a *policy*: for each of the 1,326 hands it could
   hold, a probability of folding, calling (or checking) and raising.
   Because the policy is known exactly, the coach can run Bayes'
   rule on every action and track each bot's true range, and can
   compute exactly how often a bet would make it fold.

   Postflop the policies are built from this course's own maths:
     - facing a bet, continue with the top share of the range set by
       minimum defence frequency (shared between defenders), scaled
       by the style's appetite for calling
     - betting, bet the top share of the range for value and add
       bluffs in the ratio alpha / (1 - alpha), scaled by the style
   Preflop they play charts. The styles differ in exactly the ways
   the exploitation lessons teach you to punish.
   ============================================================ */

/* ---- the 1,326 two-card combos, indexed ---- */
var COMBOS = [], COMBO_IDX = new Int16Array(52 * 52).fill(-1), COMBO_CLASS = [];
(function () {
  for (var a = 0; a < 52; a++) for (var b = a + 1; b < 52; b++) {
    COMBO_IDX[a * 52 + b] = COMBO_IDX[b * 52 + a] = COMBOS.length;
    COMBOS.push([a, b]);
  }
  COMBOS.forEach(function (c) { COMBO_CLASS.push(comboName(c)); });
})();
function comboIndex(a, b) { return COMBO_IDX[a * 52 + b]; }
function comboHits(i, dead) { var c = COMBOS[i]; return dead[c[0]] || dead[c[1]]; }
function deadMap(cards) { var d = new Uint8Array(52); cards.forEach(function (c) { d[c] = 1; }); return d; }

/* ---- styles ---- */
var BOT_STYLES = {
  reg: {
    name: "Reg", tag: "Tight-aggressive", color: "#5B8CC4",
    about: "Plays close to the charts. Defends about as often as MDF says and bluffs at about alpha. Hard to exploit; the benchmark.",
    open: { UTG: "UTG", HJ: "HJ", CO: "CO", BTN: "BTN", SB: "SB" },
    tb_ip: "QQ+, AKs, AKo, A5s-A4s, KQs, AJs", tb_oop: "QQ+, AKs, AKo, A5s-A4s, KQs",
    call_ip: "22-JJ, ATs-AQs, KTs+, QTs+, J9s+, T9s, 98s, 87s, 76s, AQo, AJo, KQo",
    bb_def: "22+, A2s+, K2s+, Q5s+, J7s+, T7s+, 96s+, 85s+, 74s+, 64s+, 53s+, 43s, A2o+, K8o+, Q9o+, J9o+, T8o+, 98o, 87o",
    sb_3b: "TT+, AJs+, KQs, AQo+, A5s-A4s", sb_call: "",
    fb: "KK+, AKs, A5s-A4s", c3: "QQ-66, AKo, AQs-ATs, KTs+, QTs+, JTs, T9s, 98s, 87s, AQo, AJo, KQo",
    cold4: "KK+, AKs", coldc: "QQ, AKo",
    jam5: "KK+, AKs", c4: "QQ+, AK",
    limp: "", iso: "TT+, AQs+, AKo",
    size: [0.5, 0.66, 0.75], vfrac: [0.3, 0.26, 0.22], bluff: 1, defend: 1, raise: 0.08, raiseBluff: 0.03, donk: 0.25
  },
  nit: {
    name: "Nit", tag: "Tight-passive", color: "#7E8AA0",
    about: "Plays few hands and folds too much to bets, and bluffs rarely. Bluff it more; believe its bets and raises.",
    open: { UTG: "UTG", HJ: "UTG", CO: "HJ", BTN: "CO", SB: "UTG" },
    tb_ip: "KK+, AKs, AKo", tb_oop: "KK+, AKs, AKo",
    call_ip: "22-QQ, AQs, AJs, KQs, AQo",
    bb_def: "22+, A2s+, KTs+, QTs+, JTs, T9s, 98s, ATo+, KJo+",
    sb_3b: "QQ+, AK", sb_call: "",
    fb: "KK+", c3: "QQ, JJ, AKs, AKo",
    cold4: "KK+", coldc: "QQ",
    jam5: "AA", c4: "KK+",
    limp: "", iso: "QQ+, AK",
    size: [0.5, 0.5, 0.66], vfrac: [0.2, 0.18, 0.16], bluff: 0.2, defend: 0.65, raise: 0.05, raiseBluff: 0, donk: 0.1
  },
  station: {
    name: "Station", tag: "Loose-passive", color: "#34A96F",
    about: "Calls far too much and rarely raises or bluffs. Value bet thinner and bigger; never bluff it.",
    open: { UTG: "CO", HJ: "CO", CO: "CO", BTN: "BTN", SB: "BTN" },
    tb_ip: "QQ+, AKs", tb_oop: "QQ+, AKs",
    call_ip: "22+, A2s+, K2s+, Q5s+, J7s+, T7s+, 96s+, 85s+, 75s+, 64s+, 54s, A2o+, K7o+, Q8o+, J8o+, T8o+, 98o",
    bb_def: "22+, A2s+, K2s+, Q2s+, J5s+, T6s+, 95s+, 85s+, 74s+, 64s+, 53s+, 43s, A2o+, K5o+, Q7o+, J8o+, T8o+, 97o+, 87o",
    sb_3b: "QQ+, AKs", sb_call: "22+, A2s+, K5s+, Q8s+, J8s+, T8s+, 98s, 87s, A7o+, KTo+, QJo",
    fb: "AA", c3: "22+, A8s+, KTs+, QJs, JTs, ATo+, KQo",
    cold4: "AA", coldc: "TT+, AQs+, AKo",
    jam5: "AA", c4: "JJ+, AK",
    limp: "22+, A2s+, K9s+, QTs+, JTs, T9s, 98s, A9o+, KJo+",
    iso: "QQ+, AK",
    size: [0.33, 0.33, 0.5], vfrac: [0.15, 0.14, 0.14], bluff: 0.1, defend: 1.45, raise: 0.02, raiseBluff: 0, donk: 0.35
  },
  maniac: {
    name: "Maniac", tag: "Loose-aggressive", color: "#D14B41",
    about: "Opens wide, 3-bets a lot and bluffs about twice as often as alpha allows. Call it down lighter; let it bluff.",
    open: { UTG: "CO", HJ: "CO", CO: "BTN", BTN: "BTN", SB: "BTN" },
    tb_ip: "88+, A2s+, KTs+, QTs+, JTs, T9s, 98s, 87s, AJo+, KQo", tb_oop: "88+, A2s+, KTs+, QTs+, JTs, T9s, AJo+, KQo",
    call_ip: "22-77, K9s, Q9s, J9s, T8s, 97s, 86s, 76s, 65s, ATo, KJo, QJo",
    bb_def: "22+, A2s+, K2s+, Q5s+, J7s+, T7s+, 96s+, 85s+, 74s+, 64s+, 53s+, A2o+, K8o+, Q9o+, J9o+, T9o",
    sb_3b: "88+, A2s+, KTs+, QTs+, JTs, T9s, AJo+, KQo", sb_call: "",
    fb: "TT+, AQs+, AKo, A5s-A2s, KQs", c3: "22-99, A9s+, KTs+, QJs, JTs, AJo+",
    cold4: "QQ+, AK, A5s", coldc: "JJ, TT, AQs",
    jam5: "JJ+, AQs+, AKo", c4: "TT, AQo",
    limp: "", iso: "88+, A9s+, KTs+, AJo+",
    size: [0.75, 1, 1.25], vfrac: [0.4, 0.35, 0.3], bluff: 2, defend: 1.1, raise: 0.12, raiseBluff: 0.08, donk: 0.6
  }
};
var BOT_NAMES = ["Ash", "Blake", "Casey", "Drew", "Emery", "Finley", "Harper", "Jules", "Kai", "Lane", "Morgan", "Quinn", "Reese", "Sage", "Tatum"];

/* class sets for every range string used, built once */
var _classSets = {};
function styleSet(str) {
  if (!str) return {};
  if (RFI[str]) str = RFI[str];
  return _classSets[str] || (_classSets[str] = rangeClasses(str));
}

/* ---- per-board strength: percentile of every combo, plus draw potential ---- */
var _boardCache = { key: "", t: null };
function drawOuts(c0, c1, board) {
  var cards = [c0, c1].concat(board);
  var suits = [0, 0, 0, 0], hsuit = [0, 0, 0, 0], rm = 0;
  cards.forEach(function (c, k) { var s = (c / 13) | 0; suits[s]++; if (k < 2) hsuit[s]++; rm |= 1 << (c % 13); });
  var outs = 0, flushDraw = false;
  for (var s = 0; s < 4; s++) if (suits[s] === 4 && hsuit[s] > 0) { outs += 9; flushDraw = true; }
  if (straightHigh(rm) < 0) {
    var straightOuts = 0;
    for (var r = 0; r < 13; r++) if (!(rm & (1 << r)) && straightHigh(rm | (1 << r)) >= 0) straightOuts += 4;
    outs += flushDraw ? Math.max(0, straightOuts - 2) : straightOuts;
  }
  return Math.min(outs, 18);
}
function boardTable(board) {
  var key = board.join(",");
  if (_boardCache.key === key) return _boardCache.t;
  var dead = deadMap(board), n = COMBOS.length;
  var score = new Float64Array(n).fill(-1), hs = new Float32Array(n), ehs = new Float32Array(n), draw = new Float32Array(n);
  var valid = [], i;
  for (i = 0; i < n; i++) {
    if (comboHits(i, dead)) continue;
    var c = COMBOS[i];
    score[i] = eval7([c[0], c[1]].concat(board));
    valid.push(i);
  }
  var sorted = valid.slice().sort(function (a, b) { return score[a] - score[b]; });
  var m = sorted.length, k = 0;
  while (k < m) {
    var j = k;
    while (j + 1 < m && score[sorted[j + 1]] === score[sorted[k]]) j++;
    var pct = (k + (j - k) / 2) / (m - 1 || 1);
    for (var q = k; q <= j; q++) hs[sorted[q]] = pct;
    k = j + 1;
  }
  var left = 5 - board.length;
  valid.forEach(function (i2) {
    var c2 = COMBOS[i2];
    var outs = left ? drawOuts(c2[0], c2[1], board) : 0;
    var pImp = left === 2 ? 1 - (1 - outs / 47) * (1 - outs / 46) : left === 1 ? outs / 46 : 0;
    draw[i2] = pImp;
    ehs[i2] = Math.min(1, hs[i2] + (1 - hs[i2]) * pImp * 0.85);
  });
  var t = { board: board.slice(), score: score, hs: hs, ehs: ehs, draw: draw, valid: valid };
  _boardCache = { key: key, t: t };
  return t;
}

/* ---- ranges ---- */
function rangeNew(deadCards) {
  var w = new Float64Array(COMBOS.length), dead = deadMap(deadCards);
  for (var i = 0; i < COMBOS.length; i++) w[i] = comboHits(i, dead) ? 0 : 1;
  return w;
}
function rangeRemove(w, cards) {
  var dead = deadMap(cards);
  for (var i = 0; i < w.length; i++) if (w[i] && comboHits(i, dead)) w[i] = 0;
}
function rangeMass(w) { var s = 0; for (var i = 0; i < w.length; i++) s += w[i]; return s; }
/* Bayes: multiply by the chance each hand takes the action that was seen */
function rangeUpdate(w, probs) {
  var total = 0;
  for (var i = 0; i < w.length; i++) { w[i] *= probs[i]; total += w[i]; }
  return total;
}

/* ---- the context a bot decides in ---- */
function botCtx(t, seat) {
  var h = t.hand, p = t.players[seat], L = hLegal(t);
  var opps = t.players.filter(function (q) { return q.i !== seat && !q.folded; });
  var limpers = 0;
  if (h.street === 0 && h.raises === 0) limpers = h.log.filter(function (e) { return e.type === "call" && e.street === 0; }).length;
  /* players who must still answer the current bet, besides this one */
  var defenders = 1 + t.players.filter(function (q) {
    return q.i !== seat && !q.folded && !q.allIn && q.bet < h.currentBet && q.i !== h.streetAggressor;
  }).length;
  /* last to act after the flop among those still in = in position */
  var order = [1, 2, 3, 4, 5, 0].map(function (d) { return (t.button + d) % 6; });
  var live = order.filter(function (i) { return !t.players[i].folded; });
  return {
    street: h.street, seat: seat, pos: hPos(t, seat), toCall: L.toCall, pot: L.pot, currentBet: h.currentBet,
    myBet: p.bet, stack: p.stack, minTo: L.minTo, maxTo: L.maxTo, canRaise: L.canRaise,
    raises: h.raises, opener: h.openerSeat, isOpener: h.openerSeat === seat, limpers: limpers,
    isPFA: h.aggressor === seat, aggressor: h.aggressor, nOpp: opps.length, defenders: defenders,
    ip: live[live.length - 1] === seat, board: h.board.slice(),
    firstIn: h.street > 0 && h.streetAggressor < 0 && t.players.filter(function (q) { return !q.folded && q.acted; }).length === 0
  };
}

/* ---- a policy: fold / call / raise probabilities for every combo, and the raise size ---- */
function policyNew(n) { return { fold: new Float32Array(n), call: new Float32Array(n), raise: new Float32Array(n), raiseTo: 0, kind: "" }; }

function botPreflop(style, ctx) {
  var S = BOT_STYLES[style], n = COMBOS.length, P = policyNew(n);
  var raiseSet = {}, callSet = {}, raiseTo = 0;
  var pos = ctx.pos;
  /* size matters more than the count: a raise to 25 bb is answered like a 4-bet,
     one to 7 bb or more like a 3-bet, however many raises came before it */
  var level = ctx.raises;
  if (ctx.currentBet >= 20) level = Math.max(level, 3);
  else if (ctx.currentBet > 6.5 && level === 1) level = 2;
  if (ctx.raises === 0) {
    if (ctx.toCall === 0) {                        /* big blind with the option */
      raiseSet = styleSet(S.iso); raiseTo = 3.5 + ctx.limpers;
      P.kind = "option";
    } else {
      raiseSet = styleSet(S.open[pos] || "UTG");
      if (ctx.limpers) { raiseSet = styleSet(S.iso); callSet = styleSet(S.limp || S.open[pos]); }
      else if (S.limp && pos !== "SB") callSet = styleSet(S.limp);
      raiseTo = ctx.limpers ? 3.5 + ctx.limpers : pos === "SB" ? 3 : 2.5;
      P.kind = ctx.limpers ? "iso" : "open";
    }
  } else if (level === 1) {
    var oop = pos === "SB" || pos === "BB";
    if (pos === "SB") { raiseSet = styleSet(S.sb_3b); callSet = styleSet(S.sb_call); }
    else if (pos === "BB") { raiseSet = styleSet(S.tb_oop); callSet = styleSet(S.bb_def); }
    else { raiseSet = styleSet(S.tb_ip); callSet = styleSet(S.call_ip); }
    raiseTo = ctx.currentBet * (oop ? 4 : 3) + ctx.limpers;
    P.kind = "vs-open";
  } else if (level === 2) {
    if (ctx.isOpener) { raiseSet = styleSet(S.fb); callSet = styleSet(S.c3); P.kind = "vs-3bet"; }
    else { raiseSet = styleSet(S.cold4); callSet = styleSet(S.coldc); P.kind = "cold-3bet"; }
    raiseTo = ctx.currentBet * 2.3;
  } else {
    raiseSet = styleSet(S.jam5); callSet = styleSet(S.c4); raiseTo = ctx.maxTo;
    P.kind = "vs-4bet";
  }
  if (raiseTo > 0.4 * (ctx.stack + ctx.myBet)) raiseTo = ctx.maxTo;           /* commit: just shove */
  if (!ctx.canRaise) { for (var k in raiseSet) callSet[k] = 1; raiseSet = {}; }
  P.raiseTo = Math.max(ctx.minTo, Math.min(ctx.maxTo, raiseTo));
  for (var i = 0; i < n; i++) {
    var cls = COMBO_CLASS[i];
    if (raiseSet[cls]) P.raise[i] = 1;
    else if (callSet[cls] || (ctx.toCall === 0)) P.call[i] = 1;
    else P.fold[i] = 1;
  }
  return P;
}

/* take the top `frac` of the range's mass by a key; returns a Uint8Array membership */
function topMass(order, w, frac, exclude) {
  var total = 0, i, out = new Uint8Array(w.length);
  for (i = 0; i < order.length; i++) if (!exclude || !exclude[order[i]]) total += w[order[i]];
  var want = frac * total, acc = 0;
  for (i = 0; i < order.length && acc < want - 1e-12; i++) {
    var c = order[i];
    if (exclude && exclude[c]) continue;
    if (!w[c]) continue;
    out[c] = 1; acc += w[c];
  }
  return out;
}

function botPostflop(style, ctx, w) {
  var S = BOT_STYLES[style], n = COMBOS.length, P = policyNew(n);
  var T = boardTable(ctx.board), st = ctx.street - 1;
  var live = T.valid.filter(function (i) { return w[i] > 0; });
  var byStrength = live.slice().sort(function (a, b) { return T.ehs[b] - T.ehs[a]; });
  var mass = 0; live.forEach(function (i) { mass += w[i]; });
  if (ctx.toCall === 0 && !ctx.canRaise) {                 /* everyone else is all in: nothing to bet */
    P.kind = "check";
    for (var z = 0; z < n; z++) P.call[z] = 1;
    return P;
  }
  if (ctx.toCall === 0) {
    /* bet: value from the top, bluffs in the ratio alpha / (1 - alpha) */
    var b = S.size[st], alpha = b / (1 + 2 * b);
    var vfrac = S.vfrac[st];
    if (!ctx.isPFA && ctx.aggressor >= 0 && ctx.firstIn) vfrac *= S.donk;      /* check to the raiser */
    var value = topMass(byStrength, w, vfrac);
    var vm = 0; live.forEach(function (i) { if (value[i]) vm += w[i]; });
    var bluffMass = vm * alpha / (1 - alpha) * S.bluff * (ctx.nOpp > 1 ? 0.4 : 1);
    var cands = live.filter(function (i) {
      return !value[i] && (ctx.street === 3 ? T.hs[i] < 0.45 : (T.draw[i] > 0.12 || T.hs[i] < 0.35));
    }).sort(function (a, c) {
      var sa = ctx.street === 3 ? -T.hs[a] : T.draw[a] * 2 - T.hs[a] * 0.3;
      var sc2 = ctx.street === 3 ? -T.hs[c] : T.draw[c] * 2 - T.hs[c] * 0.3;
      return sc2 - sa;
    });
    var bluff = new Uint8Array(n), acc = 0;
    for (var k = 0; k < cands.length && acc < bluffMass - 1e-12; k++) { bluff[cands[k]] = 1; acc += w[cands[k]]; }
    var betTo = Math.max(1, Math.round(b * ctx.pot * 2) / 2);
    if (betTo > 0.6 * ctx.stack) betTo = ctx.maxTo;
    P.raiseTo = Math.max(ctx.minTo, Math.min(ctx.maxTo, betTo));
    P.kind = "bet";
    for (var i = 0; i < n; i++) {
      if (!w[i]) { P.call[i] = 1; continue; }
      if (value[i] || bluff[i]) P.raise[i] = 1; else P.call[i] = 1;
    }
    return P;
  }
  /* facing a bet: defend by MDF, shared between the players who must answer */
  var p = ctx.toCall / (ctx.pot + ctx.toCall);
  var mdf = p >= 0.5 ? 0 : (1 - 2 * p) / (1 - p);
  var each = 1 - Math.pow(1 - mdf, 1 / Math.max(1, ctx.defenders));
  var defend = Math.max(0.03, Math.min(0.97, each * S.defend));
  var cont = topMass(byStrength, w, defend);
  var raiseV = ctx.canRaise ? topMass(byStrength, w, S.raise) : new Uint8Array(n);
  var raiseB = new Uint8Array(n);
  if (ctx.canRaise && ctx.street < 3 && S.raiseBluff > 0) {
    var dr = live.filter(function (i) { return !raiseV[i] && T.draw[i] > 0.25; }).sort(function (a, c) { return T.draw[c] - T.draw[a]; });
    var want = S.raiseBluff * mass, got = 0;
    for (var d = 0; d < dr.length && got < want - 1e-12; d++) { raiseB[dr[d]] = 1; got += w[dr[d]]; }
  }
  var to = ctx.currentBet * 3;
  if (to > 0.45 * (ctx.stack + ctx.myBet)) to = ctx.maxTo;
  P.raiseTo = Math.max(ctx.minTo, Math.min(ctx.maxTo, to));
  P.kind = "facing";
  for (var j = 0; j < n; j++) {
    if (!w[j]) { P.fold[j] = 1; continue; }
    if (raiseV[j] || raiseB[j]) P.raise[j] = 1;
    else if (cont[j]) P.call[j] = 1;
    else P.fold[j] = 1;
  }
  return P;
}

function botPolicy(style, ctx, w) { return ctx.street === 0 ? botPreflop(style, ctx) : botPostflop(style, ctx, w); }

/* the bot's actual move, from the policy row for its real hand */
function botChoose(P, combo, rng) {
  rng = rng || Math.random;
  var x = rng(), f = P.fold[combo], c = P.call[combo], r = P.raise[combo];
  var tot = f + c + r || 1;
  if (x < f / tot) return { type: "fold" };
  if (x < (f + c) / tot) return { type: "call" };
  return { type: "raise", to: P.raiseTo };
}
/* the probability row that matches an observed action, for Bayes */
function policyRow(P, type) { return type === "fold" ? P.fold : type === "raise" || type === "bet" ? P.raise : P.call; }

/* what a range holds, by made-hand category, for the coach's picture of it */
function rangeMakeup(w, board) {
  var cats = {}, total = 0;
  if (board.length < 3) return null;
  var T = boardTable(board);
  T.valid.forEach(function (i) {
    if (!w[i]) return;
    var cat = handCategory(T.score[i]);
    if (cat === "high card" && T.draw[i] > 0.2) cat = "draw";
    cats[cat] = (cats[cat] || 0) + w[i]; total += w[i];
  });
  Object.keys(cats).forEach(function (k) { cats[k] /= total || 1; });
  return cats;
}
/* the most likely hand classes in a range */
function rangeTop(w, k) {
  var by = {}, total = 0;
  for (var i = 0; i < w.length; i++) if (w[i]) { by[COMBO_CLASS[i]] = (by[COMBO_CLASS[i]] || 0) + w[i]; total += w[i]; }
  return Object.keys(by).map(function (c) { return [c, by[c] / total]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, k || 8);
}

if (typeof module !== "undefined") module.exports = {
  COMBOS: COMBOS, comboIndex: comboIndex, BOT_STYLES: BOT_STYLES, BOT_NAMES: BOT_NAMES, boardTable: boardTable,
  rangeNew: rangeNew, rangeRemove: rangeRemove, rangeMass: rangeMass, rangeUpdate: rangeUpdate,
  botCtx: botCtx, botPolicy: botPolicy, botChoose: botChoose, policyRow: policyRow, rangeMakeup: rangeMakeup, rangeTop: rangeTop,
  drawOuts: drawOuts
};
