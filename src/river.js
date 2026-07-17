/* ============================================================
   THE RIVER SUBGAME
   The board is complete. Nothing is coming. Two players each hold
   a range, one is out of position and acts first, and the only
   questions left are how much to bet, how often to bluff, and how
   much to call. That is a small enough game to solve exactly, and
   it is the spot you actually face.

   This reuses the layer 2 range engine (parseRange, removeDead,
   comboName) and the 7-card evaluator (eval7). The CFR machinery
   is the same regret-matching loop as Kuhn and Leduc, pointed at
   a fixed five-card board with two real ranges and a bet-size tree.

   The tree (heads up, one street, OOP = player 0 acts first):
     OOP:  check | bet 1/2 pot | bet pot
       after a check, IP:  check (showdown) | bet 1/2 | bet pot
         facing that bet, OOP:  fold | call (showdown)
       after a bet, IP:  fold | call (showdown)
   No raising - a deliberately small tree. What is left is sizing,
   bluff frequency and defence frequency, which is most of what
   river study is actually about.
   ============================================================ */

var RV_POT = 6;                       /* dead money already in the middle */
var RV_SIZES = [0.5, 1.0];            /* bet as a fraction of the pot */
var RV_SIZE_LABEL = ["½ pot", "pot"];

/* replay a history string into [contrib0, contrib1] and last bettor.
   tokens: x=check h=bet½ p=betpot f=fold c=call */
function rvState(h) {
  var c = [0, 0], turn = 0, bettor = -1;
  for (var i = 0; i < h.length; i++) {
    var t = h[i];
    if (t === "x") turn = 1 - turn;
    else if (t === "h" || t === "p") {
      c[turn] = (t === "h" ? RV_SIZES[0] : RV_SIZES[1]) * RV_POT;
      bettor = turn; turn = 1 - turn;
    } else if (t === "c") c[turn] = c[1 - turn];
  }
  return { c: c, bettor: bettor };
}
/* payoff to player 0. sign0: +1 P0 wins showdown, -1 P1 wins, 0 chop. */
function rvPayoff0(h, sign0) {
  var last = h[h.length - 1], fold = last === "f";
  var s = rvState(h), c = s.c, pot = RV_POT + c[0] + c[1], collect0;
  if (fold) collect0 = s.bettor === 0 ? pot : 0;
  else collect0 = sign0 > 0 ? pot : (sign0 < 0 ? 0 : pot / 2);
  return collect0 - (RV_POT / 2 + c[0]);   /* each already "owns" half the dead pot */
}

/* ---------- the betting tree, built once as an explicit graph ----------
   Six decision nodes (slots 0..5); the rest are terminals whose payoff
   is a function only of the showdown sign, precomputed here. */
function rvBuildTree() {
  function show(h) { return { term: 1, pay: [rvPayoff0(h, -1), rvPayoff0(h, 0), rvPayoff0(h, 1)] }; }
  function fold(h) { var p = rvPayoff0(h, 0); return { term: 1, pay: [p, p, p] }; }
  function dec(slot, actor, toks, kids) { return { term: 0, slot: slot, actor: actor, n: toks.length, kids: kids }; }

  var nH  = dec(2, 1, ["f", "c"], [fold("hf"), show("hc")]);   /* IP faces the ½-pot open */
  var nP  = dec(3, 1, ["f", "c"], [fold("pf"), show("pc")]);   /* IP faces the pot open   */
  var nXH = dec(4, 0, ["f", "c"], [fold("xhf"), show("xhc")]); /* OOP faces IP's ½-pot bet */
  var nXP = dec(5, 0, ["f", "c"], [fold("xpf"), show("xpc")]); /* OOP faces IP's pot bet   */
  var nX  = dec(1, 1, ["x", "h", "p"], [show("xx"), nXH, nXP]);/* IP after OOP checks      */
  var root = dec(0, 0, ["x", "h", "p"], [nX, nH, nP]);         /* OOP opens                */
  return root;
}
var RV_ROOT = rvBuildTree();
/* slot -> the actions offered there, for readouts */
var RV_SLOT_ACTS = [["check", "½", "pot"], ["check", "½", "pot"],
  ["fold", "call"], ["fold", "call"], ["fold", "call"], ["fold", "call"]];

/* ---------- solver ----------
   range0 / range1 are combo arrays ([lo,hi] card indices) from
   parseRange. board is a 5-card index array. */
function River(range0, range1, board) {
  this.board = board.slice();
  this.r0 = removeDead(range0, board);
  this.r1 = removeDead(range1, board);
  this.maxC = Math.max(this.r0.length, this.r1.length, 1);
  this.nd = new Map();
  this.iters = 0;
  this.valueSum = 0;

  /* showdown sign for every (P0 combo, P1 combo) against the fixed
     board; -2 marks a pair that shares a card and never occurs. */
  var bd = board, score = function (c) { return eval7([c[0], c[1], bd[0], bd[1], bd[2], bd[3], bd[4]]); };
  var s0 = this.r0.map(score), s1 = this.r1.map(score);
  this.SIGN = [];
  var deals = [], i, j;
  for (i = 0; i < this.r0.length; i++) {
    var a0 = this.r0[i][0], b0 = this.r0[i][1], row = new Int8Array(this.r1.length);
    for (j = 0; j < this.r1.length; j++) {
      var a1 = this.r1[j][0], b1 = this.r1[j][1];
      if (a0 === a1 || a0 === b1 || b0 === a1 || b0 === b1) { row[j] = -2; continue; }
      row[j] = s0[i] > s1[j] ? 1 : (s0[i] < s1[j] ? -1 : 0);
      deals.push({ i0: i, i1: j, sign: row[j] });
    }
    this.SIGN.push(row);
  }
  this.deals = deals;
}
River.prototype.stat = function (actor, idx, slot, n) {
  var k = (actor * this.maxC + idx) * 6 + slot, v = this.nd.get(k);
  if (!v) { v = { r: new Float64Array(n), s: new Float64Array(n), n: n }; this.nd.set(k, v); }
  return v;
};
/* normalized average strategy at one infoset (uniform before it is touched) */
River.prototype.avg = function (actor, idx, slot, n) {
  var v = this.nd.get((actor * this.maxC + idx) * 6 + slot), out = [], j;
  if (!v) { for (j = 0; j < n; j++) out[j] = 1 / n; return out; }
  var t = 0; for (j = 0; j < v.n; j++) t += v.s[j];
  if (t <= 0) { for (j = 0; j < v.n; j++) out[j] = 1 / v.n; return out; }
  for (j = 0; j < v.n; j++) out[j] = v.s[j] / t;
  return out;
};
function rvMatch(r, n) {
  var t = 0, out = [], i;
  for (i = 0; i < n; i++) { out[i] = r[i] > 0 ? r[i] : 0; t += out[i]; }
  if (t > 0) for (i = 0; i < n; i++) out[i] /= t;
  else for (i = 0; i < n; i++) out[i] = 1 / n;
  return out;
}

River.prototype.walk = function (node, deal, p0, p1) {
  if (node.term) return node.pay[deal.sign + 1];
  var actor = node.actor, n = node.n;
  var idx = actor === 0 ? deal.i0 : deal.i1;
  var nd = this.stat(actor, idx, node.slot, n);
  var sig = rvMatch(nd.r, n);

  var util = [], v = 0, i;
  for (i = 0; i < n; i++) {
    util[i] = actor === 0
      ? this.walk(node.kids[i], deal, p0 * sig[i], p1)
      : this.walk(node.kids[i], deal, p0, p1 * sig[i]);
    v += sig[i] * util[i];
  }
  var myReach = actor === 0 ? p0 : p1, oppReach = actor === 0 ? p1 : p0, sgn = actor === 0 ? 1 : -1;
  for (i = 0; i < n; i++) {
    nd.r[i] += oppReach * sgn * (util[i] - v);
    nd.s[i] += myReach * sig[i];
  }
  return v;
};

River.prototype.train = function (iters) {
  var D = this.deals, m = D.length || 1;
  for (var k = 0; k < iters; k++) {
    var v = 0;
    for (var d = 0; d < D.length; d++) v += this.walk(RV_ROOT, D[d], 1, 1);
    this.valueSum += v / m;
    this.iters++;
  }
  return this;
};
River.prototype.gameValue = function () { return this.iters ? this.valueSum / this.iters : 0; };
River.prototype.infosets = function () { return this.nd.size; };

/* ---------- exact best response ----------
   Same idea as the Leduc lab: walk the tree for one of my combos
   carrying a vector of the opponent's reach probability over each of
   their combos. That makes my information set fully determined, so I
   maximise over an infoset instead of peeking at their hand. */
River.prototype.brWalk = function (me, myIdx, oppReach, node) {
  if (node.term) {
    var v = 0;
    for (var j = 0; j < oppReach.length; j++) {
      if (!oppReach[j]) continue;
      var sign0 = me === 0 ? this.SIGN[myIdx][j] : this.SIGN[j][myIdx];   /* -2 never survives here */
      var pay0 = node.pay[sign0 + 1];
      v += oppReach[j] * (me === 0 ? pay0 : -pay0);
    }
    return v;
  }
  if (node.actor === me) {
    var best = -Infinity;
    for (var a = 0; a < node.n; a++) {
      var val = this.brWalk(me, myIdx, oppReach, node.kids[a]);
      if (val > best) best = val;
    }
    return best;
  }
  var opp = 1 - me, total = 0;
  for (var b = 0; b < node.n; b++) {
    var sub = new Float64Array(oppReach.length), live = false;
    for (var q = 0; q < oppReach.length; q++) {
      if (!oppReach[q]) continue;
      var st = this.avg(opp, q, node.slot, node.n);
      sub[q] = oppReach[q] * st[b];
      if (sub[q] > 0) live = true;
    }
    if (live) total += this.brWalk(me, myIdx, sub, node.kids[b]);
  }
  return total;
};
River.prototype.bestResponse = function (me) {
  var mine = me === 0 ? this.r0 : this.r1, opp = me === 0 ? this.r1 : this.r0;
  var m = this.deals.length || 1, total = 0;
  for (var i = 0; i < mine.length; i++) {
    var reach = new Float64Array(opp.length);
    for (var j = 0; j < opp.length; j++) {
      var sign = me === 0 ? this.SIGN[i][j] : this.SIGN[j][i];
      reach[j] = sign === -2 ? 0 : 1;
    }
    total += this.brWalk(me, i, reach, RV_ROOT);
  }
  return total / m;
};
River.prototype.exploitability = function () { return this.bestResponse(0) + this.bestResponse(1); };

/* ---------- strategy readout, grouped by hand class ----------
   Averages the combos of a class (weighted by how many survive on this
   board) into one row, the way a solver grid shows it. */
River.prototype.byClass = function (player, slot) {
  var range = player === 0 ? this.r0 : this.r1, n = RV_SLOT_ACTS[slot].length;
  var groups = {}, order = [], i;
  for (i = 0; i < range.length; i++) {
    var name = comboName(range[i]);
    if (!groups[name]) { groups[name] = { w: 0, s: new Array(n).fill(0) }; order.push(name); }
    var g = groups[name], st = this.avg(player, i, slot, n);
    for (var a = 0; a < n; a++) g.s[a] += st[a];
    g.w++;
  }
  return order.map(function (name) {
    var g = groups[name];
    return { name: name, count: g.w, freq: g.s.map(function (x) { return x / g.w; }) };
  });
};

if (typeof module !== "undefined") module.exports = {
  River: River, rvPayoff0: rvPayoff0, RV_POT: RV_POT, RV_SIZES: RV_SIZES,
  RV_SIZE_LABEL: RV_SIZE_LABEL, RV_SLOT_ACTS: RV_SLOT_ACTS
};
