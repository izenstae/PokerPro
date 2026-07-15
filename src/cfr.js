/* ============================================================
   CFR on Kuhn poker.
   Deck J,Q,K = 0,1,2. Each antes 1, is dealt one card.
   P0 acts: p (check) or b (bet 1). Then P1. Then possibly P0 again.
   Terminals: pp, bp, bb, pbp, pbb
   ============================================================ */

var KUHN_CARDS = ["J", "Q", "K"];
var DEALS = [[0,1],[0,2],[1,0],[1,2],[2,0],[2,1]];

function kuhnTerminal(h) {
  return h === "pp" || h === "bp" || h === "bb" || h === "pbp" || h === "pbb";
}
/* payoff to player 0 */
function kuhnPayoff(h, cards) {
  var win = cards[0] > cards[1] ? 1 : -1;
  if (h === "pp") return win;
  if (h === "bp") return 1;
  if (h === "pbp") return -1;
  return 2 * win;                     /* bb, pbb */
}
function kuhnActor(h) { return h.length === 1 && h[0] === "p" ? 1 : (h.length % 2); }
/* "" -> P0, "p"/"b" -> P1, "pb" -> P0 */
function actorOf(h) { return h.length % 2 === 0 ? 0 : 1; }

/* ---------- trainer ---------- */
function CFR() {
  this.node = {};                     /* key -> {r:[2], s:[2]} */
  this.iters = 0;
  this.valueSum = 0;
}
CFR.prototype.get = function (key) {
  var n = this.node[key];
  if (!n) { n = this.node[key] = { r: [0, 0], s: [0, 0] }; }
  return n;
};
function regretMatch(r) {
  var a = r[0] > 0 ? r[0] : 0, b = r[1] > 0 ? r[1] : 0, t = a + b;
  return t > 0 ? [a / t, b / t] : [0.5, 0.5];
}
CFR.prototype.strategy = function (key) { return regretMatch(this.get(key).r); };
CFR.prototype.average = function (key) {
  var s = this.get(key).s, t = s[0] + s[1];
  return t > 0 ? [s[0] / t, s[1] / t] : [0.5, 0.5];
};

/* returns expected payoff to player 0 */
CFR.prototype.walk = function (cards, h, p0, p1) {
  if (kuhnTerminal(h)) return kuhnPayoff(h, cards);
  var pl = actorOf(h);
  var key = cards[pl] + h;
  var n = this.get(key);
  var sig = regretMatch(n.r);
  var util = [0, 0], node = 0;

  for (var a = 0; a < 2; a++) {
    var nh = h + (a === 0 ? "p" : "b");
    util[a] = pl === 0
      ? this.walk(cards, nh, p0 * sig[a], p1)
      : this.walk(cards, nh, p0, p1 * sig[a]);
    node += sig[a] * util[a];
  }

  var myReach = pl === 0 ? p0 : p1;
  var oppReach = pl === 0 ? p1 : p0;
  for (var b = 0; b < 2; b++) {
    var regret = (pl === 0 ? 1 : -1) * (util[b] - node);
    n.r[b] += oppReach * regret;
    n.s[b] += myReach * sig[b];
  }
  return node;
};

CFR.prototype.train = function (iters) {
  for (var i = 0; i < iters; i++) {
    for (var d = 0; d < DEALS.length; d++) {
      this.valueSum += this.walk(DEALS[d], "", 1, 1) / 6;
    }
    this.iters++;
  }
  return this;
};
CFR.prototype.gameValue = function () { return this.iters ? this.valueSum / this.iters : 0; };

/* ---------- exact exploitability ----------
   Best response is always achieved by a pure strategy, and each player has
   only 6 information sets, so we enumerate all 64 and take the max. */
function infosetsOf(pl) {
  var out = [];
  for (var c = 0; c < 3; c++) (pl === 0 ? ["", "pb"] : ["p", "b"]).forEach(function (h) { out.push(c + h); });
  return out;
}
function evOfDeal(cards, h, sigma) {
  if (kuhnTerminal(h)) return kuhnPayoff(h, cards);
  var pl = actorOf(h);
  var s = sigma(cards[pl] + h, pl);
  return s[0] * evOfDeal(cards, h + "p", sigma) + s[1] * evOfDeal(cards, h + "b", sigma);
}
/* value to player 0 when both play sigma */
function kuhnValue(sigma) {
  var v = 0;
  for (var d = 0; d < DEALS.length; d++) v += evOfDeal(DEALS[d], "", sigma) / 6;
  return v;
}
/* best response value for player `pl` against fixed avg strategy */
function bestResponse(avg, pl) {
  var sets = infosetsOf(pl), best = -Infinity, bestPure = null;
  for (var mask = 0; mask < 64; mask++) {
    var pure = {};
    for (var i = 0; i < 6; i++) pure[sets[i]] = (mask >> i) & 1 ? [0, 1] : [1, 0];
    var sigma = function (key, who) { return who === pl ? pure[key] : avg(key); };
    var v = kuhnValue(sigma) * (pl === 0 ? 1 : -1);
    if (v > best) { best = v; bestPure = pure; }
  }
  return { value: best, pure: bestPure };
}
/* NashConv: 0 at equilibrium, in chips per hand */
function exploitability(avg) {
  return bestResponse(avg, 0).value + bestResponse(avg, 1).value;
}

if (typeof module !== "undefined") module.exports = { CFR: CFR, exploitability: exploitability, bestResponse: bestResponse, kuhnValue: kuhnValue, DEALS: DEALS };
