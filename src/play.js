/* ============================================================
   PLAY: a session at the six-handed table
   Holds the table, each bot's style and tracked range, a simple HUD,
   and every graded decision you make. The Play screen calls these;
   the tests call them the same way with no screen at all.
   ============================================================ */

var PLAY_LINEUPS = {
  mixed:  { name: "Mixed table", about: "One of each style plus a second Reg. The realistic default.", styles: ["reg", "nit", "station", "maniac", "reg"] },
  soft:   { name: "Soft table", about: "Stations and a Maniac: value bet relentlessly, bluff almost never.", styles: ["station", "station", "maniac", "nit", "station"] },
  tough:  { name: "Tough table", about: "Four Regs and a Maniac. Mistakes cost more and edges are thin.", styles: ["reg", "reg", "maniac", "reg", "reg"] }
};

function playNew(lineup, rng) {
  rng = rng || Math.random;
  var L = PLAY_LINEUPS[lineup] || PLAY_LINEUPS.mixed;
  var names = BOT_NAMES.slice().sort(function () { return rng() - 0.5; });
  var styles = [null].concat(L.styles);
  var seats = styles.map(function (s, i) { return i === 0 ? { name: "You" } : { name: names[i - 1], bot: s }; });
  return {
    lineup: lineup, t: hNewTable(seats), hero: 0, styles: styles, ranges: [], hud: seats.map(function () { return { hands: 0, vpip: 0, pfr: 0, agg: 0, calls: 0 }; }),
    decisions: [], pending: null, history: [], session: playStatsNew(), rng: rng, boardSeen: 0
  };
}
function playStatsNew() {
  return { hands: 0, net: 0, decisions: 0, lost: 0, quality: 0, grades: { Best: 0, Good: 0, Inaccuracy: 0, Mistake: 0, Blunder: 0 }, concepts: {}, trend: [] };
}

function playDeal(g) {
  hStart(g.t, g.rng);
  var heroCards = g.t.players[g.hero].cards;
  g.ranges = g.t.players.map(function (p, i) { return i === g.hero ? null : rangeNew(heroCards); });
  g.decisions = []; g.pending = null; g.boardSeen = 0; g.entered = {};
  g.t.players.forEach(function (p, i) { g.hud[i].hands++; });
}

function playToAct(g) { return g.t.hand && !g.t.hand.over ? g.t.hand.toAct : -1; }
function playHeroTurn(g) { return playToAct(g) === g.hero; }

/* after any action: new board cards leave every range */
function playAfter(g) {
  var b = g.t.hand.board;
  if (b.length > g.boardSeen) {
    var fresh = b.slice(g.boardSeen);
    g.ranges.forEach(function (w) { if (w) rangeRemove(w, fresh); });
    g.boardSeen = b.length;
  }
}

function playHud(g, seat, entry) {
  var H = g.hud[seat];
  if (entry.street === 0 && (entry.type === "call" || entry.type === "raise" || entry.type === "bet") && !g.entered[seat]) { g.entered[seat] = 1; H.vpip++; }
  if (entry.street === 0 && (entry.type === "raise") && !g.entered["r" + seat]) { g.entered["r" + seat] = 1; H.pfr++; }
  if (entry.street > 0) { if (entry.type === "raise" || entry.type === "bet") H.agg++; else if (entry.type === "call") H.calls++; }
}

/* one bot action; returns the log entry */
function playBotStep(g) {
  var t = g.t, seat = t.hand.toAct, p = t.players[seat];
  var ctx = botCtx(t, seat);
  var P = botPolicy(g.styles[seat], ctx, g.ranges[seat]);
  var a = botChoose(P, comboIndex(p.cards[0], p.cards[1]), g.rng);
  var entry = hAct(t, a);
  /* Bayes: keep only the hands that would have done this, in proportion */
  var row = policyRow(P, entry.type === "check" ? "call" : entry.type);
  var mass = rangeUpdate(g.ranges[seat], row);
  if (mass <= 0) g.ranges[seat] = rangeNew(t.players[g.hero].cards.concat(t.hand.board));   /* cannot happen; stay safe */
  playHud(g, seat, entry);
  playAfter(g);
  if (t.hand.over) playEnd(g);
  return entry;
}

/* the coach's view of the spot, computed once per decision */
function playAnalyze(g) {
  if (!g.pending) g.pending = coachAnalyze(g, g.rng);
  return g.pending;
}

function playHeroAct(g, a) {
  var A = playAnalyze(g);
  var G = coachGrade(g, A, a, g.rng);
  var entry = hAct(g.t, a);
  playHud(g, g.hero, entry);
  var d = { A: A, G: G, action: entry, street: A.street };
  g.decisions.push(d);
  var S = g.session;
  S.decisions++; S.lost += G.loss; S.grades[G.grade]++;
  S.quality = S.quality ? 0.9 * S.quality + 0.1 * G.quality : G.quality;
  S.trend.push(Math.round(100 * G.quality)); if (S.trend.length > 60) S.trend.shift();
  G.concepts.forEach(function (c) {
    var k = S.concepts[c] || (S.concepts[c] = { n: 0, lost: 0 });
    k.n++; k.lost += G.loss;
  });
  g.pending = null;
  playAfter(g);
  if (g.t.hand.over) playEnd(g);
  return d;
}

function playEnd(g) {
  var h = g.t.hand, S = g.session;
  if (h.recorded) return;
  h.recorded = true;
  S.hands++; S.net += h.result.net[g.hero];
  g.history.unshift({
    no: h.no, pos: hPos(g.t, g.hero), cards: g.t.players[g.hero].cards.slice(), board: h.board.slice(),
    net: h.result.net[g.hero], decisions: g.decisions, log: h.log.slice(), result: h.result,
    shown: h.result.showdown ? g.t.players.map(function (p) { return p.folded ? null : p.cards.slice(); }) : null,
    names: g.t.players.map(function (p) { return p.name; }), styles: g.styles.slice(), button: g.t.button
  });
  if (g.history.length > 40) g.history.pop();
}

/* the whole-career numbers, kept apart from one session */
function playCareerAdd(C, S0, g) {
  C = C || { hands: 0, net: 0, decisions: 0, lost: 0, grades: { Best: 0, Good: 0, Inaccuracy: 0, Mistake: 0, Blunder: 0 }, concepts: {}, quality: 0 };
  var last = g.history[0];
  if (!last) return C;
  C.hands++; C.net += last.net;
  last.decisions.forEach(function (d) {
    C.decisions++; C.lost += d.G.loss; C.grades[d.G.grade]++;
    C.quality = C.quality ? 0.97 * C.quality + 0.03 * d.G.quality : d.G.quality;
    d.G.concepts.forEach(function (c) { var k = C.concepts[c] || (C.concepts[c] = { n: 0, lost: 0 }); k.n++; k.lost += d.G.loss; });
  });
  return C;
}

/* leaks: the concepts costing the most EV per decision, with enough decisions to mean something */
function playLeaks(S, min) {
  return Object.keys(S.concepts).map(function (k) { var c = S.concepts[k]; return { id: k, n: c.n, lost: c.lost, per: c.lost / c.n }; })
    .filter(function (x) { return x.n >= (min || 3); }).sort(function (a, b) { return b.lost - a.lost; });
}

if (typeof module !== "undefined") module.exports = {
  PLAY_LINEUPS: PLAY_LINEUPS, playNew: playNew, playDeal: playDeal, playBotStep: playBotStep, playHeroAct: playHeroAct,
  playAnalyze: playAnalyze, playHeroTurn: playHeroTurn, playToAct: playToAct, playLeaks: playLeaks, playCareerAdd: playCareerAdd
};
