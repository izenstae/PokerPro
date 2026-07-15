/* ============================================================
   LEDUC HOLD'EM
   6 card deck: two suits x three ranks (J,Q,K). Suits never matter,
   so everything below works in ranks 0,1,2 with two of each.
   Ante 1. Round 0: bet 2. One public card. Round 1: bet 4.
   Max two bets/raises per round. Pair the board and you win.
   ============================================================ */

var L_RANKS = ["J", "Q", "K"];
var L_BET = [2, 4];
var L_MAXR = 2;

/* 0 = still live, 1 = someone folded, 2 = round closed */
function lDone(seq) {
  if (!seq) return 0;
  var last = seq[seq.length - 1];
  if (last === "f") return 1;
  if (last === "c" && seq.length >= 2) return 2;
  return 0;
}
function lActions(seq) {
  var raises = 0;
  for (var i = 0; i < seq.length; i++) if (seq[i] === "r") raises++;
  var facing = seq.length > 0 && seq[seq.length - 1] === "r";
  var out = [];
  if (facing) out.push("f");
  out.push("c");
  if (raises < L_MAXR) out.push("r");
  return out;
}
function lApply(contrib, p, a, round) {
  var c = [contrib[0], contrib[1]];
  if (a === "c") c[p] = c[1 - p];
  else if (a === "r") c[p] = c[1 - p] + L_BET[round];
  return c;
}
/* returns 0, 1, or -1 for a chop. Only one player can pair the board. */
function lWinner(r0, r1, board) {
  var p0 = r0 === board, p1 = r1 === board;
  if (p0 && !p1) return 0;
  if (p1 && !p0) return 1;
  if (r0 > r1) return 0;
  if (r1 > r0) return 1;
  return -1;
}
function lKey(card, s0, board, s1, round) {
  return card + ":" + s0 + ":" + (round === 1 ? board : "") + ":" + s1;
}
function lRegretMatch(r, n) {
  var t = 0, out = [], i;
  for (i = 0; i < n; i++) { out[i] = r[i] > 0 ? r[i] : 0; t += out[i]; }
  if (t > 0) { for (i = 0; i < n; i++) out[i] /= t; }
  else { for (i = 0; i < n; i++) out[i] = 1 / n; }
  return out;
}

/* ---------- the 120 equiprobable deals ---------- */
var L_DECK = [0, 0, 1, 1, 2, 2];
var L_DEALS = (function () {
  var out = [];
  for (var a = 0; a < 6; a++) for (var b = 0; b < 6; b++) for (var c = 0; c < 6; c++) {
    if (a === b || a === c || b === c) continue;
    out.push([L_DECK[a], L_DECK[b], L_DECK[c]]);      /* p0 rank, p1 rank, board rank */
  }
  return out;
})();

/* ---------- trainer ---------- */
function Leduc() {
  this.node = {};
  this.iters = 0;
  this.valueSum = 0;
}
Leduc.prototype.get = function (key, n) {
  var v = this.node[key];
  if (!v) { v = this.node[key] = { r: new Float64Array(n), s: new Float64Array(n), n: n }; }
  return v;
};
Leduc.prototype.average = function (key, n) {
  var v = this.node[key];
  if (!v) { var u = []; for (var i = 0; i < n; i++) u[i] = 1 / n; return u; }
  var t = 0, out = [], j;
  for (j = 0; j < v.n; j++) t += v.s[j];
  if (t <= 0) { for (j = 0; j < v.n; j++) out[j] = 1 / v.n; return out; }
  for (j = 0; j < v.n; j++) out[j] = v.s[j] / t;
  return out;
};

Leduc.prototype.walk = function (cards, round, s0, s1, contrib, p0, p1) {
  var seq = round === 0 ? s0 : s1;
  var d = lDone(seq);
  if (d === 1) {
    var folder = (seq.length - 1) % 2;
    return folder === 0 ? -contrib[0] : contrib[1];
  }
  if (d === 2) {
    if (round === 0) return this.walk(cards, 1, s0, "", contrib, p0, p1);
    var w = lWinner(cards[0], cards[1], cards[2]);
    return w === -1 ? 0 : (w === 0 ? contrib[1] : -contrib[0]);
  }

  var pl = seq.length % 2;
  var acts = lActions(seq);
  var n = acts.length;
  var key = lKey(cards[pl], s0, cards[2], s1, round);
  var nd = this.get(key, n);
  var sig = lRegretMatch(nd.r, n);

  var util = [], node = 0;
  for (var i = 0; i < n; i++) {
    var a = acts[i];
    var c2 = lApply(contrib, pl, a, round);
    var ns0 = round === 0 ? s0 + a : s0;
    var ns1 = round === 1 ? s1 + a : s1;
    util[i] = pl === 0
      ? this.walk(cards, round, ns0, ns1, c2, p0 * sig[i], p1)
      : this.walk(cards, round, ns0, ns1, c2, p0, p1 * sig[i]);
    node += sig[i] * util[i];
  }

  var myReach = pl === 0 ? p0 : p1;
  var oppReach = pl === 0 ? p1 : p0;
  for (var b = 0; b < n; b++) {
    nd.r[b] += oppReach * (pl === 0 ? 1 : -1) * (util[b] - node);
    nd.s[b] += myReach * sig[b];
  }
  return node;
};

Leduc.prototype.train = function (iters) {
  for (var i = 0; i < iters; i++) {
    var v = 0;
    for (var d = 0; d < L_DEALS.length; d++) v += this.walk(L_DEALS[d], 0, "", "", [1, 1], 1, 1);
    this.valueSum += v / L_DEALS.length;
    this.iters++;
  }
  return this;
};
Leduc.prototype.gameValue = function () { return this.iters ? this.valueSum / this.iters : 0; };
Leduc.prototype.infosets = function () { return Object.keys(this.node).length; };

/* ---------- exact best response ----------
   Brute force over pure strategies is 2^144 here, so we do it properly:
   walk the tree carrying a vector of opponent reach probabilities indexed
   by the opponent's rank. That makes the acting player's information set
   fully determined at every node, so the max is taken over an actual
   information set rather than a history. */
function lBRWalk(avg, me, R, oppReach, board, round, s0, s1, contrib) {
  var seq = round === 0 ? s0 : s1;
  var d = lDone(seq);
  var C, v = 0, i;

  if (d === 1) {
    var folder = (seq.length - 1) % 2;
    var pay = folder === 0 ? -contrib[0] : contrib[1];        /* to player 0 */
    var mine = me === 0 ? pay : -pay;
    for (C = 0; C < 3; C++) v += oppReach[C] * mine;
    return v;
  }
  if (d === 2 && round === 0) {
    /* deal the board. its distribution depends on both private cards. */
    for (var B = 0; B < 3; B++) {
      var sub = [0, 0, 0], any = false;
      for (C = 0; C < 3; C++) {
        if (!oppReach[C]) continue;
        var left = 2 - (R === B ? 1 : 0) - (C === B ? 1 : 0);
        if (left <= 0) continue;
        sub[C] = oppReach[C] * left / 4;
        any = true;
      }
      if (any) v += lBRWalk(avg, me, R, sub, B, 1, s0, "", contrib);
    }
    return v;
  }
  if (d === 2) {
    for (C = 0; C < 3; C++) {
      if (!oppReach[C]) continue;
      var w = lWinner(me === 0 ? R : C, me === 0 ? C : R, board);
      var p = w === -1 ? 0 : (w === 0 ? contrib[1] : -contrib[0]);
      v += oppReach[C] * (me === 0 ? p : -p);
    }
    return v;
  }

  var pl = seq.length % 2;
  var acts = lActions(seq);

  if (pl === me) {
    var best = -Infinity;
    for (i = 0; i < acts.length; i++) {
      var c2 = lApply(contrib, pl, acts[i], round);
      var val = lBRWalk(avg, me, R, oppReach, board,
        round, round === 0 ? s0 + acts[i] : s0, round === 1 ? s1 + acts[i] : s1, c2);
      if (val > best) best = val;
    }
    return best;
  }

  for (i = 0; i < acts.length; i++) {
    var sub2 = [0, 0, 0], live = false;
    for (C = 0; C < 3; C++) {
      if (!oppReach[C]) continue;
      var st = avg(lKey(C, s0, board, s1, round), acts.length);
      sub2[C] = oppReach[C] * st[i];
      if (sub2[C] > 0) live = true;
    }
    if (!live) continue;
    var c3 = lApply(contrib, pl, acts[i], round);
    v += lBRWalk(avg, me, R, sub2, board,
      round, round === 0 ? s0 + acts[i] : s0, round === 1 ? s1 + acts[i] : s1, c3);
  }
  return v;
}

function lBestResponse(avg, me) {
  var total = 0;
  for (var R = 0; R < 3; R++) {
    var opp = [];
    for (var C = 0; C < 3; C++) opp[C] = (2 - (R === C ? 1 : 0)) / 5;
    total += (1 / 3) * lBRWalk(avg, me, R, opp, null, 0, "", "", [1, 1]);
  }
  return total;
}
function lExploitability(avg) {
  return lBestResponse(avg, 0) + lBestResponse(avg, 1);
}

if (typeof module !== "undefined") module.exports = {
  Leduc: Leduc, lExploitability: lExploitability, lBestResponse: lBestResponse, L_DEALS: L_DEALS
};
