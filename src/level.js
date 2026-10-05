/* ============================================================
   LEVEL: how well you actually play, measured at the table
   Course progress says what you have studied. This says what you
   do with it: every graded decision at the Play table goes into a
   log, and the rating is the quality of your recent decisions,
   overall and per skill. Recent, not lifetime, so it moves when
   you improve and when you slip. Mistakes are kept as spots to
   review, and each table skill maps to the drill that trains it.
   Only skills you have learned count: each decision remembers which
   of its skills you had passed the lesson for when you played it, and
   a decision that leans on a skill you had not learned yet is shown
   but never rated. Learning a skill later does not reach back.
   ============================================================ */

var LV_KEEP = 1500;          /* decisions kept in the log */
var LV_MISTAKES = 30;        /* spots kept for review */
var LV_WINDOW = 100;         /* decisions behind the overall rating */
var LV_SKILL_WINDOW = 25;    /* decisions behind a skill's rating */
var LV_PLACEMENT = 20;       /* decisions before you get a level */

/* rating floors, 0 to 100 */
var LV_LEVELS = [
  { min: 0,  name: "Beginner",     about: "Big mistakes are common. Start with the price of a call and opening ranges." },
  { min: 40, name: "Novice",       about: "The basics are there, but costly mistakes still show up most sessions." },
  { min: 55, name: "Recreational", about: "Most decisions are sound. Leaks are concentrated in a few spots." },
  { min: 65, name: "Regular",      about: "Mostly good decisions. Mistakes are rarer and cheaper." },
  { min: 75, name: "Solid reg",    about: "You find the best option most of the time. The remaining EV is in close spots." },
  { min: 83, name: "Strong",       about: "Few real mistakes. You beat this table by a lot." },
  { min: 90, name: "Expert",       about: "Nearly every decision is best or within a whisker of it." },
  { min: 95, name: "Elite",        about: "The coach rarely finds anything better than what you did." }
];

/* the table skills the coach tags decisions with, and the drill that trains each */
var LV_SKILLS = {
  rfi:      { name: "Opening ranges",          drill: "rfi" },
  threebet: { name: "Facing raises preflop",   drill: "threebet" },
  price:    { name: "Calling the right price", drill: "potodds" },
  eqr:      { name: "Equity realisation",      drill: "eqr" },
  mdf:      { name: "Defending river bets",    drill: "mdf" },
  sizing:   { name: "Value bets and raises",   drill: "ratio" },
  cbet:     { name: "C-bets",                  drill: "cbet" },
  fold:     { name: "Bluffing with fold equity", drill: "bluff" },
  spr:      { name: "Stack-to-pot commitment", drill: "spr" },
  decide:   { name: "Betting vs checking",     drill: "allin" }
};

function lvNew() { return { d: [], m: [] }; }

function lvMean(xs) { return xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : 0; }

/* decision quality is 0..1; the rating is 0..100, pulled toward the
   middle while there are only a few decisions so one hand cannot swing it */
function lvRate(ds, prior) {
  if (!ds.length) return null;
  var k = 6, p = prior == null ? 0.6 : prior;
  var s = ds.reduce(function (a, d) { return a + d.q; }, 0);
  return 100 * (s + k * p) / (ds.length + k);
}

function lvLevel(r) {
  var L = LV_LEVELS[0];
  for (var i = 0; i < LV_LEVELS.length; i++) if (r >= LV_LEVELS[i].min) L = LV_LEVELS[i];
  var i2 = LV_LEVELS.indexOf(L), next = LV_LEVELS[i2 + 1] || null;
  return { name: L.name, about: L.about, index: i2, min: L.min, next: next,
           toNext: next ? (r - L.min) / (next.min - L.min) : 1 };
}

/* which of a decision's skills you had learned when you played it */
function lvKnown(concepts, learned) {
  if (!learned) return concepts.slice();
  return concepts.filter(function (c) { return typeof learned === "function" ? learned(c) : !!learned[c]; });
}
/* a decision counts toward the rating only if every skill it tests was learned at the time.
   Entries logged before this rule (no k) count, as they always did. */
function lvCounts(x) {
  return !x.k || x.c.every(function (c) { return x.k.indexOf(c) >= 0; });
}
/* the same, for one skill */
function lvCountsFor(x, id) { return x.c.indexOf(id) >= 0 && (!x.k || x.k.indexOf(id) >= 0); }

/* add the hero's graded decisions from one finished hand (a Play history entry).
   learned: the skills you have passed (a map or a test), recorded with each decision */
function lvAddHand(Lg, hand, now, learned) {
  Lg = Lg || lvNew();
  now = now || Date.now();
  var streets = ["preflop", "flop", "turn", "river"];
  (hand.decisions || []).forEach(function (dec) {
    var A = dec.A, G = dec.G;
    var k = lvKnown(G.concepts, learned);
    Lg.d.push({ t: now, q: G.quality, l: Math.round(100 * G.loss) / 100, g: G.grade, c: G.concepts.slice(), k: k, s: A.street });
    if (G.grade === "Mistake" || G.grade === "Blunder") {
      var did = A.options.filter(function (o) { return o.key === G.chosen; })[0];
      var best = A.options.filter(function (o) { return o.key === A.best; })[0];
      Lg.m.unshift({
        id: now.toString(36) + "-" + hand.no + "-" + A.street, t: now, no: hand.no, pos: hand.pos,
        cards: hand.cards.slice(), board: A.board.slice(), street: streets[A.street] || "",
        pot: A.pot, toCall: A.toCall, eq: A.eq, grade: G.grade, loss: G.loss,
        did: did ? did.label : "", didEV: did ? did.ev : 0, best: best ? best.label : "", bestEV: best ? best.ev : 0,
        lines: G.lines.slice(), c: G.concepts.slice(), k: k.slice()
      });
    }
  });
  if (Lg.d.length > LV_KEEP) Lg.d.splice(0, Lg.d.length - LV_KEEP);
  if (Lg.m.length > LV_MISTAKES) Lg.m.length = LV_MISTAKES;
  return Lg;
}

/* the overall picture: rating now, a while ago, and the level */
function lvSummary(Lg) {
  var all = (Lg && Lg.d) || [];
  var d = all.filter(lvCounts);
  var recent = d.slice(-LV_WINDOW), before = d.slice(-2 * LV_WINDOW, -LV_WINDOW);
  var r = lvRate(recent), r0 = before.length >= LV_PLACEMENT ? lvRate(before) : null;
  return {
    n: d.length, played: all.length, unrated: all.length - d.length,
    placed: d.length >= LV_PLACEMENT, left: Math.max(0, LV_PLACEMENT - d.length),
    rating: r, prev: r0, delta: r != null && r0 != null ? r - r0 : null,
    level: r != null ? lvLevel(r) : null,
    lostPer: recent.length ? lvMean(recent.map(function (x) { return x.l; })) : null,
    first: d.length >= 2 * LV_PLACEMENT ? lvRate(d.slice(0, Math.min(LV_WINDOW, Math.floor(d.length / 2)))) : null
  };
}

/* the rating over time: one point per step of decisions, each the rating of the window ending there */
function lvSeries(Lg, points) {
  var d = ((Lg && Lg.d) || []).filter(lvCounts);
  if (d.length < LV_PLACEMENT) return [];
  points = points || 40;
  var step = Math.max(1, Math.ceil((d.length - LV_PLACEMENT) / points)), out = [];
  for (var i = LV_PLACEMENT; i <= d.length; i += step) out.push({ i: i, t: d[i - 1].t, r: lvRate(d.slice(Math.max(0, i - LV_WINDOW), i)) });
  if (out[out.length - 1].i !== d.length) out.push({ i: d.length, t: d[d.length - 1].t, r: lvRate(d.slice(-LV_WINDOW)) });
  return out;
}

/* each table skill: its recent rating, the window before it, and what it costs.
   learned (optional): the skills you have passed now, so a row can say "not learned yet" */
function lvSkills(Lg, learned) {
  var d = (Lg && Lg.d) || [];
  var all = lvRate(d.filter(lvCounts).slice(-LV_WINDOW));
  return Object.keys(LV_SKILLS).map(function (id) {
    var mine = d.filter(function (x) { return lvCountsFor(x, id); });
    var played = d.filter(function (x) { return x.c.indexOf(id) >= 0; }).length;
    var recent = mine.slice(-LV_SKILL_WINDOW), before = mine.slice(-2 * LV_SKILL_WINDOW, -LV_SKILL_WINDOW);
    var r = recent.length ? lvRate(recent, all == null ? null : all / 100) : null;
    var r0 = before.length >= 5 ? lvRate(before, all == null ? null : all / 100) : null;
    var lostPer = recent.length ? lvMean(recent.map(function (x) { return x.l; })) : 0;
    return {
      id: id, name: LV_SKILLS[id].name, drill: LV_SKILLS[id].drill, n: mine.length, recent: recent.length,
      learned: learned ? lvKnown([id], learned).length === 1 : true, played: played, unrated: played - mine.length,
      rating: r, prev: r0, delta: r != null && r0 != null ? r - r0 : null, lostPer: lostPer,
      mistakes: recent.filter(function (x) { return x.g === "Mistake" || x.g === "Blunder"; }).length
    };
  });
}

/* the weaknesses: enough decisions to mean something, and well below your own level or plainly costly */
function lvWeak(Lg, learned) {
  var S = lvSummary(Lg);
  return lvSkills(Lg, learned).filter(function (k) {
    return k.learned && k.recent >= 5 && k.rating != null && (k.rating < 60 || (S.rating != null && k.rating < S.rating - 8) || k.mistakes >= 3);
  }).sort(function (a, b) { return b.lostPer * b.recent - a.lostPer * a.recent; });
}

/* drop a reviewed spot */
function lvDismiss(Lg, id) {
  Lg.m = Lg.m.filter(function (x) { return x.id !== id; });
  return Lg;
}

if (typeof module !== "undefined") module.exports = {
  LV_LEVELS: LV_LEVELS, LV_SKILLS: LV_SKILLS, LV_PLACEMENT: LV_PLACEMENT, LV_WINDOW: LV_WINDOW,
  lvNew: lvNew, lvRate: lvRate, lvLevel: lvLevel, lvAddHand: lvAddHand, lvSummary: lvSummary,
  lvSeries: lvSeries, lvSkills: lvSkills, lvWeak: lvWeak, lvDismiss: lvDismiss, lvCounts: lvCounts, lvKnown: lvKnown
};
