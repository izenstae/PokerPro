/* ============================================================
   HOLDEM: a six-handed no-limit hold'em table
   Blinds 0.5/1, every stack topped up to 100 big blinds at the start
   of each hand (a cash game), amounts in big blinds. Handles the
   minimum-raise rule, all-ins, side pots and split pots. Pure state:
   the Play screen and the tests drive it the same way.
   ============================================================ */

var H_POS = ["BTN", "SB", "BB", "UTG", "HJ", "CO"];      /* by distance from the button */
var H_STACK = 100, H_SB = 0.5, H_BB = 1;

function hRound(x) { return Math.round(x * 100) / 100; }
function hPos(t, i) { return H_POS[(i - t.button + 6) % 6]; }

/* seats: [{ name, bot: profile key or null }] */
function hNewTable(seats) {
  return {
    players: seats.map(function (s, i) {
      return { i: i, name: s.name, bot: s.bot || null, stack: H_STACK, cards: [], folded: false, allIn: false, bet: 0, put: 0, acted: false };
    }),
    button: 5, handNo: 0, hand: null
  };
}

function hShuffle(rng) {
  var d = [];
  for (var c = 0; c < 52; c++) d.push(c);
  for (var i = 51; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = d[i]; d[i] = d[j]; d[j] = t; }
  return d;
}

/* deal a new hand; rng defaults to Math.random, deck may be forced for tests */
function hStart(t, rng, deck) {
  rng = rng || Math.random;
  t.button = (t.button + 1) % 6;
  t.handNo++;
  t.players.forEach(function (p) {
    p.stack = H_STACK; p.cards = []; p.folded = false; p.allIn = false; p.bet = 0; p.put = 0; p.acted = false;
  });
  var h = t.hand = {
    no: t.handNo, deck: deck ? deck.slice() : hShuffle(rng), board: [], street: 0,
    currentBet: 0, lastRaise: H_BB, raises: 0, toAct: -1, over: false, log: [], result: null,
    aggressor: -1, streetAggressor: -1, openerSeat: -1
  };
  for (var k = 0; k < 2; k++) for (var s = 1; s <= 6; s++) t.players[(t.button + s) % 6].cards.push(h.deck.pop());
  hPost(t, (t.button + 1) % 6, H_SB, "sb");
  hPost(t, (t.button + 2) % 6, H_BB, "bb");
  h.currentBet = H_BB;
  h.toAct = (t.button + 3) % 6;
  return t;
}
function hPost(t, i, amt, kind) {
  var p = t.players[i], a = Math.min(amt, p.stack);
  p.stack = hRound(p.stack - a); p.bet = hRound(p.bet + a); p.put = hRound(p.put + a);
  if (p.stack === 0) p.allIn = true;
  t.hand.log.push({ seat: i, street: 0, type: kind, amt: a, to: p.bet });
}

function hPot(t) { return hRound(t.players.reduce(function (a, p) { return a + p.put; }, 0)); }
function hInHand(t) { return t.players.filter(function (p) { return !p.folded; }); }
function hToCall(t, i) { var p = t.players[i]; return hRound(Math.min(t.hand.currentBet - p.bet, p.stack)); }

/* what the player to act may do */
function hLegal(t) {
  var h = t.hand, p = t.players[h.toAct];
  var toCall = hToCall(t, h.toAct);
  var maxTo = hRound(p.bet + p.stack);
  var minTo = hRound(h.currentBet + h.lastRaise);
  var canRaise = maxTo > h.currentBet && t.players.some(function (q) { return q !== p && !q.folded && !q.allIn; });
  if (minTo > maxTo) minTo = maxTo;
  return { seat: h.toAct, toCall: toCall, canCheck: toCall === 0, canRaise: canRaise, minTo: minTo, maxTo: maxTo, pot: hPot(t) };
}

/* a = { type: "fold" | "check" | "call" | "raise", to } ; raise may also be a bet */
function hAct(t, a) {
  var h = t.hand, i = h.toAct, p = t.players[i], L = hLegal(t);
  var entry = { seat: i, street: h.street, type: a.type, pot: L.pot, toCall: L.toCall };
  if (a.type === "check" && !L.canCheck) a = { type: "call" };
  if (a.type === "fold" && L.canCheck) a = { type: "check" };
  if (a.type === "call" && L.toCall === 0) a = { type: "check" };
  entry.type = a.type;
  if (a.type === "fold") { p.folded = true; }
  else if (a.type === "call") {
    var c = L.toCall;
    p.stack = hRound(p.stack - c); p.bet = hRound(p.bet + c); p.put = hRound(p.put + c); entry.amt = c;
    if (p.stack === 0) p.allIn = true;
  } else if (a.type === "raise") {
    if (!L.canRaise) return hAct(t, { type: L.canCheck ? "check" : "call" });
    var to = hRound(Math.max(L.minTo, Math.min(L.maxTo, a.to)));
    var add = hRound(to - p.bet), inc = hRound(to - h.currentBet);
    p.stack = hRound(p.stack - add); p.bet = to; p.put = hRound(p.put + add);
    if (p.stack === 0) p.allIn = true;
    entry.type = h.currentBet === 0 ? "bet" : "raise"; entry.to = to; entry.amt = add;
    if (inc >= h.lastRaise) h.lastRaise = inc;     /* an all-in short of a full raise does not reopen the minimum */
    h.currentBet = to;
    h.raises++;
    if (h.street === 0 && h.openerSeat < 0) h.openerSeat = i;
    h.aggressor = i; h.streetAggressor = i;
    t.players.forEach(function (q) { if (q !== p) q.acted = false; });
  }
  p.acted = true;
  h.log.push(entry);
  hAdvance(t);
  return entry;
}

function hAdvance(t) {
  var h = t.hand;
  var live = hInHand(t);
  if (live.length === 1) return hFinish(t);
  /* next seat that still owes an action */
  for (var s = 1; s <= 6; s++) {
    var j = (h.toAct + s) % 6, q = t.players[j];
    if (!q.folded && !q.allIn && (!q.acted || q.bet < h.currentBet)) { h.toAct = j; return; }
  }
  hEndStreet(t);
}

function hEndStreet(t) {
  var h = t.hand;
  t.players.forEach(function (p) { p.bet = 0; p.acted = false; });
  h.currentBet = 0; h.lastRaise = H_BB; h.raises = 0; h.streetAggressor = -1;
  var canAct = hInHand(t).filter(function (p) { return !p.allIn; });
  if (h.street === 3 || canAct.length <= 1) {
    while (h.board.length < 5) h.board.push(h.deck.pop());
    h.street = 4;
    return hFinish(t);
  }
  h.street++;
  var n = h.street === 1 ? 3 : 1;
  for (var k = 0; k < n; k++) h.board.push(h.deck.pop());
  for (var s = 1; s <= 6; s++) {
    var j = (t.button + s) % 6, q = t.players[j];
    if (!q.folded && !q.allIn) { h.toAct = j; return; }
  }
}

/* award the pots: side pots by contribution level, ties split */
function hFinish(t) {
  var h = t.hand, P = t.players;
  h.over = true; h.toAct = -1;
  var live = hInHand(t);
  var won = P.map(function () { return 0; });
  var pots = [];
  if (live.length === 1) {
    won[live[0].i] = hPot(t);
    pots.push({ amt: hPot(t), winners: [live[0].i], eligible: [live[0].i] });
  } else {
    var scores = P.map(function (p) { return p.folded ? -1 : eval7(p.cards.concat(h.board)); });
    var levels = P.map(function (p) { return p.put; }).filter(function (x) { return x > 0; })
      .sort(function (a, b) { return a - b; }).filter(function (x, k, arr) { return k === 0 || x !== arr[k - 1]; });
    var prev = 0;
    levels.forEach(function (lv) {
      var amt = 0;
      P.forEach(function (p) { amt += Math.max(0, Math.min(p.put, lv) - prev); });
      var elig = P.filter(function (p) { return !p.folded && p.put >= lv; }).map(function (p) { return p.i; });
      if (amt > 0) {
        if (!elig.length) {
          /* everyone who put in this much folded: it goes to the best remaining hand */
          elig = live.map(function (p) { return p.i; });
        }
        var best = Math.max.apply(null, elig.map(function (i) { return scores[i]; }));
        var winners = elig.filter(function (i) { return scores[i] === best; });
        /* split to the cent; the odd cent goes to the first winner, so no chips are made or lost */
        var cents = Math.round(amt * 100), each = Math.floor(cents / winners.length);
        winners.forEach(function (i, k) { won[i] += (each + (k === 0 ? cents - each * winners.length : 0)) / 100; });
        var last = pots[pots.length - 1];
        if (last && last.eligible.join() === elig.join()) last.amt = hRound(last.amt + amt);
        else pots.push({ amt: hRound(amt), winners: winners, eligible: elig });
      }
      prev = lv;
    });
  }
  P.forEach(function (p, i) { p.stack = hRound(p.stack + won[i]); });
  h.result = {
    pots: pots, showdown: live.length > 1,
    net: P.map(function (p, i) { return hRound(won[i] - p.put); }),
    won: won.map(hRound)
  };
}

/* the players still to act after seat i on this street, in order */
function hBehind(t, i) {
  var out = [];
  for (var s = 1; s < 6; s++) {
    var j = (i + s) % 6, q = t.players[j];
    if (!q.folded && !q.allIn) out.push(j);
  }
  return out;
}

if (typeof module !== "undefined") module.exports = {
  H_POS: H_POS, hNewTable: hNewTable, hStart: hStart, hLegal: hLegal, hAct: hAct, hPot: hPot, hPos: hPos,
  hInHand: hInHand, hToCall: hToCall, hShuffle: hShuffle, hBehind: hBehind, hRound: hRound
};
