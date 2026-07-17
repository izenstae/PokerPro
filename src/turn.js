/* ============================================================
   THE TURN: TWO STREETS, BACKWARD INDUCTION
   The river lab solved one street with the board complete. The turn is
   the real thing: there is a card still to come, so a bet on the turn is
   also a claim about every river that can fall. You cannot solve the turn
   without first knowing what each river is worth, and you cannot know that
   without solving the river. So you solve the rivers first and back their
   value up - which is exactly how a river solver becomes a turn solver,
   and how a turn solver becomes a real one.

   THE METHOD.
   1. For every river card that can fall, build the river subgame over the
      same two ranges (card removal strips the combos that card blocks) and
      solve it with the layer-3 River engine.
   2. From each solved river read the value of every surviving combo pair.
      Average those over all the rivers: that is g(i0,i1), the expected
      value to P0 of reaching the river with this exact pair, per chip of
      pot that arrives there. Pot-fractional bets make the river game scale
      with the pot, so one solve per river card serves every pot size.
   3. Solve the turn's own betting tree - the same OOP/IP check-bet-call
      shape - where the "showdown" leaves are no longer showdowns. They hand
      the pot to the river, worth (pot that arrives) x g(i0,i1). The fold
      leaves pay out on the turn as before.

   This is the decoupled backward-induction a solver runs before it starts
   re-solving subgames with the ranges that actually arrive at each node.
   The gap it leaves - that both full ranges are assumed to reach every
   river - is precisely what "subgame resolving" closes, and it is the next
   piece of engineering past this page.

   Depends on river.js (River, RV_POT), the range engine and eval7.
   ============================================================ */

var TURN_POT = 2;                     /* dead money entering the turn */
var TURN_SIZES = [0.5, 1.0];          /* bet as a fraction of the turn pot */
var TURN_SIZE_LABEL = ["½ pot", "pot"];

/* replay a turn history into [contrib0, contrib1] and last bettor.
   Same token grammar as the river: x=check h=bet½ p=betpot f=fold c=call */
function turnState(h) {
  var c = [0, 0], turn = 0, bettor = -1;
  for (var i = 0; i < h.length; i++) {
    var t = h[i];
    if (t === "x") turn = 1 - turn;
    else if (t === "h" || t === "p") {
      c[turn] = (t === "h" ? TURN_SIZES[0] : TURN_SIZES[1]) * TURN_POT;
      bettor = turn; turn = 1 - turn;
    } else if (t === "c") c[turn] = c[1 - turn];
  }
  return { c: c, bettor: bettor };
}
/* fold payoff to P0 on the turn (no river seen) */
function turnFoldPay0(h) {
  var s = turnState(h), c = s.c, pot = TURN_POT + c[0] + c[1];
  var collect0 = s.bettor === 0 ? pot : 0;
  return collect0 - (TURN_POT / 2 + c[0]);
}
/* pot that arrives at the river after a check-through or a bet+call */
function turnPotToRiver(h) {
  var c = turnState(h).c;
  return TURN_POT + c[0] + c[1];
}

/* ---------- the turn betting tree ----------
   Identical shape to the river tree. Terminals carry whether a player
   folded (a scalar payoff) or the hand goes to the river (a pot that then
   scales the backed-up river value g). */
function turnBuildTree() {
  function river(h) { return { term: 1, fold: 0, potR: turnPotToRiver(h) }; }
  function fold(h) { return { term: 1, fold: 1, foldPay: turnFoldPay0(h) }; }
  function dec(slot, actor, toks, kids) { return { term: 0, slot: slot, actor: actor, n: toks.length, kids: kids }; }

  var nH  = dec(2, 1, ["f", "c"], [fold("hf"), river("hc")]);
  var nP  = dec(3, 1, ["f", "c"], [fold("pf"), river("pc")]);
  var nXH = dec(4, 0, ["f", "c"], [fold("xhf"), river("xhc")]);
  var nXP = dec(5, 0, ["f", "c"], [fold("xpf"), river("xpc")]);
  var nX  = dec(1, 1, ["x", "h", "p"], [river("xx"), nXH, nXP]);
  var root = dec(0, 0, ["x", "h", "p"], [nX, nH, nP]);
  return root;
}
var TURN_ROOT = turnBuildTree();
var TURN_SLOT_ACTS = [["check", "½", "pot"], ["check", "½", "pot"],
  ["fold", "call"], ["fold", "call"], ["fold", "call"], ["fold", "call"]];

function tnMatch(r, n) {
  var t = 0, out = [], i;
  for (i = 0; i < n; i++) { out[i] = r[i] > 0 ? r[i] : 0; t += out[i]; }
  if (t > 0) for (i = 0; i < n; i++) out[i] /= t;
  else for (i = 0; i < n; i++) out[i] = 1 / n;
  return out;
}
function tnKey(c) { return c[0] * 52 + c[1]; }

/* ---------- solver ----------
   range0 / range1: combo arrays; board4: a 4-card index array.
   opts.buckets: strength buckets for the turn tree (0 = no abstraction).
   opts.riverBuckets / opts.riverIters / opts.riverMC: how the nested
   river subgames are solved.
   opts.defer: leave the river backup to solveRiverStep()/finishBackup(),
   so the browser can spread the 48 solves over animation frames instead of
   freezing on one long call. Omit it and the constructor solves everything. */
function Turn(range0, range1, board4, opts) {
  opts = opts || {};
  this.opts = opts;
  this.board = board4.slice();
  this.r0 = removeDead(range0, board4);
  this.r1 = removeDead(range1, board4);
  var R0 = this.r0.length, R1 = this.r1.length;

  /* which pairs can ever be dealt on the turn (no shared card) */
  this.valid = [];
  var i, j;
  for (i = 0; i < R0; i++) {
    var row = new Uint8Array(R1), a0 = this.r0[i][0], b0 = this.r0[i][1];
    for (j = 0; j < R1; j++) {
      var a1 = this.r1[j][0], b1 = this.r1[j][1];
      row[j] = (a0 === a1 || a0 === b1 || b0 === a1 || b0 === b1) ? 0 : 1;
    }
    this.valid.push(row);
  }

  /* back the river up: g[i0][i1] = mean over rivers of the per-pair river
     value, per chip of river pot (river solved at RV_POT, so divide it out) */
  this.G = [];
  for (i = 0; i < R0; i++) this.G.push(new Float64Array(R1));
  this._cnt = [];
  for (i = 0; i < R0; i++) this._cnt.push(new Float64Array(R1));
  this._t0map = {}; this._t1map = {};
  for (i = 0; i < R0; i++) this._t0map[tnKey(this.r0[i])] = i;
  for (j = 0; j < R1; j++) this._t1map[tnKey(this.r1[j])] = j;

  this._rivers = remainingDeck(board4);
  this.riverCount = this._rivers.length;
  this.riversDone = 0;
  this.ready = false;

  this.iters = 0;
  this.valueSum = 0;
  this.nd = new Map();

  if (!opts.defer) { this.solveRiverStep(this.riverCount); this.finishBackup(); }
}

/* solve the next `k` river subgames and fold their per-pair values into the
   running mean. Returns rivers still to do. Cheap enough to call once per
   animation frame. */
Turn.prototype.solveRiverStep = function (k) {
  var opts = this.opts, rIters = opts.riverIters || 120;
  var rBuckets = opts.riverBuckets == null ? 8 : opts.riverBuckets;
  var subOpts = { buckets: rBuckets };
  var end = Math.min(this.riversDone + k, this.riverCount);
  for (; this.riversDone < end; this.riversDone++) {
    var board5 = this.board.concat(this._rivers[this.riversDone]);
    var sub = new River(this.r0, this.r1, board5, subOpts);
    if (opts.riverMC) sub.trainMC(rIters * (sub.deals.length || 1)); else sub.train(rIters);
    for (var d = 0; d < sub.deals.length; d++) {
      var dl = sub.deals[d];
      var ti0 = this._t0map[tnKey(sub.r0[dl.i0])], ti1 = this._t1map[tnKey(sub.r1[dl.i1])];
      this.G[ti0][ti1] += sub.pairValue0(dl.i0, dl.i1, dl.sign) / RV_POT;
      this._cnt[ti0][ti1]++;
    }
  }
  return this.riverCount - this.riversDone;
};

/* once every river is backed up, finalise g, enumerate turn deals and set up
   the (optional) turn-tree abstraction. */
Turn.prototype.finishBackup = function () {
  var R0 = this.r0.length, R1 = this.r1.length, i, j;
  for (i = 0; i < R0; i++) for (j = 0; j < R1; j++) if (this._cnt[i][j]) this.G[i][j] /= this._cnt[i][j];

  var deals = [];
  for (i = 0; i < R0; i++) for (j = 0; j < R1; j++) if (this.valid[i][j]) deals.push({ i0: i, i1: j, g: this.G[i][j] });
  this.deals = deals;

  var K = this.opts.buckets | 0;
  if (K > 0) {
    var m0 = new Array(R0).fill(0), n0 = new Array(R0).fill(0);
    var m1 = new Array(R1).fill(0), n1 = new Array(R1).fill(0);
    for (i = 0; i < R0; i++) for (j = 0; j < R1; j++) if (this.valid[i][j]) {
      m0[i] += this.G[i][j]; n0[i]++; m1[j] += this.G[i][j]; n1[j]++;
    }
    var str0 = m0.map(function (x, k) { return n0[k] ? x / n0[k] : 0; });
    var str1 = m1.map(function (x, k) { return n1[k] ? -x / n1[k] : 0; });
    var g0 = rvBucketize(str0, K), g1 = rvBucketize(str1, K);
    this.b0 = g0.b; this.b1 = g1.b; this.nb0 = g0.k; this.nb1 = g1.k;
  } else {
    this.b0 = this.r0.map(function (_, k) { return k; });
    this.b1 = this.r1.map(function (_, k) { return k; });
    this.nb0 = R0; this.nb1 = R1;
  }
  this.buckets = K;
  this.maxC = Math.max(this.nb0, this.nb1, 1);
  this.ready = true;
  return this;
};

Turn.prototype.stat = function (actor, bIdx, slot, n) {
  var k = (actor * this.maxC + bIdx) * 6 + slot, v = this.nd.get(k);
  if (!v) { v = { r: new Float64Array(n), s: new Float64Array(n), n: n }; this.nd.set(k, v); }
  return v;
};
Turn.prototype.avg = function (actor, bIdx, slot, n) {
  var v = this.nd.get((actor * this.maxC + bIdx) * 6 + slot), out = [], j;
  if (!v) { for (j = 0; j < n; j++) out[j] = 1 / n; return out; }
  var t = 0; for (j = 0; j < v.n; j++) t += v.s[j];
  if (t <= 0) { for (j = 0; j < v.n; j++) out[j] = 1 / v.n; return out; }
  for (j = 0; j < v.n; j++) out[j] = v.s[j] / t;
  return out;
};
Turn.prototype.leaf0 = function (node, i0, i1) {
  return node.fold ? node.foldPay : node.potR * this.G[i0][i1];
};

/* ---------- vanilla CFR over the turn tree ---------- */
Turn.prototype.walk = function (node, deal, p0, p1) {
  if (node.term) return node.fold ? node.foldPay : node.potR * deal.g;
  var actor = node.actor, n = node.n;
  var b = actor === 0 ? this.b0[deal.i0] : this.b1[deal.i1];
  var nd = this.stat(actor, b, node.slot, n);
  var sig = tnMatch(nd.r, n);
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
Turn.prototype.train = function (iters) {
  var D = this.deals, m = D.length || 1;
  for (var k = 0; k < iters; k++) {
    var v = 0;
    for (var d = 0; d < D.length; d++) v += this.walk(TURN_ROOT, D[d], 1, 1);
    this.valueSum += v / m;
    this.iters++;
  }
  return this;
};

/* ---------- Monte Carlo CFR: external sampling on the turn tree ---------- */
Turn.prototype.esWalk = function (node, deal, trav) {
  if (node.term) { var p0 = node.fold ? node.foldPay : node.potR * deal.g; return trav === 0 ? p0 : -p0; }
  var actor = node.actor, n = node.n;
  var b = actor === 0 ? this.b0[deal.i0] : this.b1[deal.i1];
  var nd = this.stat(actor, b, node.slot, n);
  var sig = tnMatch(nd.r, n);
  if (actor === trav) {
    var util = [], v = 0, i;
    for (i = 0; i < n; i++) { util[i] = this.esWalk(node.kids[i], deal, trav); v += sig[i] * util[i]; }
    for (i = 0; i < n; i++) nd.r[i] += util[i] - v;
    return v;
  }
  for (var j = 0; j < n; j++) nd.s[j] += sig[j];
  var a = 0, x = Math.random(), acc = 0;
  for (; a < n - 1; a++) { acc += sig[a]; if (x < acc) break; }
  return this.esWalk(node.kids[a], deal, trav);
};
Turn.prototype.trainMC = function (iters) {
  var D = this.deals;
  if (!D.length) return this;
  for (var k = 0; k < iters; k++) {
    this.esWalk(TURN_ROOT, D[(Math.random() * D.length) | 0], this.iters & 1);
    this.iters++;
  }
  return this;
};

Turn.prototype.gameValue = function () { return this.iters ? this.valueSum / this.iters : 0; };
Turn.prototype.infosets = function () { return this.nd.size; };

Turn.prototype._pairEV = function (node, i0, i1) {
  if (node.term) return this.leaf0(node, i0, i1);
  var actor = node.actor, n = node.n;
  var b = actor === 0 ? this.b0[i0] : this.b1[i1];
  var st = this.avg(actor, b, node.slot, n), v = 0;
  for (var a = 0; a < n; a++) if (st[a] > 0) v += st[a] * this._pairEV(node.kids[a], i0, i1);
  return v;
};
Turn.prototype.evUnderAvg = function () {
  var D = this.deals, m = D.length || 1, total = 0;
  for (var d = 0; d < D.length; d++) total += this._pairEV(TURN_ROOT, D[d].i0, D[d].i1);
  return total / m;
};

/* ---------- exact best response over the turn tree ----------
   The best-responder plays a full, unbucketed reply; the opponent plays its
   average (possibly bucketed) turn strategy. River values g are held fixed,
   so this measures how exploitable the turn strategy is given those
   backed-up continuations. */
Turn.prototype.brWalk = function (me, myIdx, oppReach, node) {
  if (node.term) {
    var v = 0, k;
    if (node.fold) {
      var p = me === 0 ? node.foldPay : -node.foldPay;
      for (k = 0; k < oppReach.length; k++) if (oppReach[k]) v += oppReach[k] * p;
      return v;
    }
    for (k = 0; k < oppReach.length; k++) {
      if (!oppReach[k]) continue;
      var g = me === 0 ? this.G[myIdx][k] : this.G[k][myIdx];
      v += oppReach[k] * node.potR * (me === 0 ? g : -g);
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
      var oppB = opp === 0 ? this.b0[q] : this.b1[q];
      var st = this.avg(opp, oppB, node.slot, node.n);
      sub[q] = oppReach[q] * st[b];
      if (sub[q] > 0) live = true;
    }
    if (live) total += this.brWalk(me, myIdx, sub, node.kids[b]);
  }
  return total;
};
Turn.prototype.bestResponse = function (me) {
  var mine = me === 0 ? this.r0 : this.r1, opp = me === 0 ? this.r1 : this.r0;
  var m = this.deals.length || 1, total = 0;
  for (var i = 0; i < mine.length; i++) {
    var reach = new Float64Array(opp.length);
    for (var j = 0; j < opp.length; j++) reach[j] = (me === 0 ? this.valid[i][j] : this.valid[j][i]) ? 1 : 0;
    total += this.brWalk(me, i, reach, TURN_ROOT);
  }
  return total / m;
};
Turn.prototype.exploitability = function () { return this.bestResponse(0) + this.bestResponse(1); };

/* ---------- readouts, grouped by hand class ---------- */
Turn.prototype.byClass = function (player, slot) {
  var range = player === 0 ? this.r0 : this.r1, n = TURN_SLOT_ACTS[slot].length;
  var bucket = player === 0 ? this.b0 : this.b1;
  var groups = {}, order = [], i;
  for (i = 0; i < range.length; i++) {
    var name = comboName(range[i]);
    if (!groups[name]) { groups[name] = { w: 0, s: new Array(n).fill(0) }; order.push(name); }
    var g = groups[name], st = this.avg(player, bucket[i], slot, n);
    for (var a = 0; a < n; a++) g.s[a] += st[a];
    g.w++;
  }
  return order.map(function (name) {
    var g = groups[name];
    return { name: name, count: g.w, freq: g.s.map(function (x) { return x / g.w; }) };
  });
};

if (typeof module !== "undefined") module.exports = {
  Turn: Turn, TURN_POT: TURN_POT, TURN_SIZES: TURN_SIZES, TURN_SIZE_LABEL: TURN_SIZE_LABEL,
  TURN_SLOT_ACTS: TURN_SLOT_ACTS, turnFoldPay0: turnFoldPay0, turnPotToRiver: turnPotToRiver
};
