/* ============================================================
   COACH: what every option was worth, and why
   At each of your decisions the coach knows every opponent's true
   range (tracked by Bayes' rule from policies it can read) and how
   each of them would answer any bet. From that it prices every
   option in big blinds:
     fold          0
     check         R × equity × pot
     call          R × equity × (pot + call) − call
     bet or raise  P(all fold) × pot
                   + Σ P(only j continues) × [R × equity vs j's continuing range × final pot − bet]
                   + P(two or more continue) × [same, against all of them]
   R is equity realisation (1 on the river or all in; otherwise
   by position), the lesson from Stage 5. It looks one street ahead:
   a raise by an opponent is treated as a call, and later streets
   enter only through R. The grade is the EV you gave up, measured
   against the size of the pot.
   ============================================================ */

var COACH_TRIALS = 900;

/* sample a combo from a weight vector */
function rangeSampler(w) {
  var idx = [], cum = [], s = 0;
  for (var i = 0; i < w.length; i++) if (w[i] > 0) { s += w[i]; idx.push(i); cum.push(s); }
  return { idx: idx, cum: cum, total: s };
}
function sampleFrom(S, rng) {
  var x = rng() * S.total, lo = 0, hi = S.cum.length - 1;
  while (lo < hi) { var mid = (lo + hi) >> 1; if (S.cum[mid] < x) lo = mid + 1; else hi = mid; }
  return S.idx[lo];
}

/* hero's equity (share of the pot, ties split) against one or more weighted ranges */
function equityVs(hero, board, ranges, trials, rng) {
  rng = rng || Math.random;
  ranges = ranges.filter(function (w) { return w; });
  if (!ranges.length) return 1;
  var samplers = ranges.map(rangeSampler);
  if (samplers.some(function (S) { return S.total <= 0; })) return 0.5;
  /* river against one range: exact */
  if (board.length === 5 && ranges.length === 1) {
    var hs = eval7(hero.concat(board)), dead = deadMap(hero.concat(board)), win = 0, tot = 0;
    var S0 = samplers[0];
    for (var k = 0; k < S0.idx.length; k++) {
      var i = S0.idx[k], c = COMBOS[i];
      if (dead[c[0]] || dead[c[1]]) continue;
      var w = ranges[0][i], vs = eval7([c[0], c[1]].concat(board));
      win += w * (hs > vs ? 1 : hs === vs ? 0.5 : 0); tot += w;
    }
    return tot ? win / tot : 0.5;
  }
  trials = trials || COACH_TRIALS;
  var share = 0, done = 0, used = new Uint8Array(52);
  var cards = new Array(7);
  for (var tr = 0; tr < trials * 3 && done < trials; tr++) {
    used.fill(0);
    hero.forEach(function (c) { used[c] = 1; });
    board.forEach(function (c) { used[c] = 1; });
    var holes = [], okDeal = true;
    for (var r = 0; r < samplers.length && okDeal; r++) {
      var got = -1;
      for (var a = 0; a < 12; a++) {
        var ci = sampleFrom(samplers[r], rng), cc = COMBOS[ci];
        if (!used[cc[0]] && !used[cc[1]]) { got = ci; break; }
      }
      if (got < 0) { okDeal = false; break; }
      var g = COMBOS[got]; used[g[0]] = used[g[1]] = 1; holes.push(g);
    }
    if (!okDeal) continue;
    var runout = board.slice();
    while (runout.length < 5) { var d = (rng() * 52) | 0; if (!used[d]) { used[d] = 1; runout.push(d); } }
    var hsc = eval7(hero.concat(runout)), best = hsc, nBest = 1, heroBest = true;
    for (var o = 0; o < holes.length; o++) {
      var sc2 = eval7(holes[o].concat(runout));
      if (sc2 > best) { best = sc2; nBest = 1; heroBest = false; }
      else if (sc2 === best) { nBest++; }
    }
    if (heroBest && hsc === best) share += 1 / nBest;
    done++;
  }
  return done ? share / done : 0.5;
}

/* realisation factor for the hero at this point */
function coachR(street, ip, allIn) {
  if (allIn || street >= 3) return 1;
  if (street === 0) return ip ? 0.92 : 0.8;
  return ip ? 1 : 0.88;
}
function heroIP(t, seat) {
  var order = [1, 2, 3, 4, 5, 0].map(function (d) { return (t.button + d) % 6; });
  var live = order.filter(function (i) { return !t.players[i].folded; });
  return live[live.length - 1] === seat;
}

function cloneTable(t) {
  var c = { button: t.button, handNo: t.handNo, players: t.players.map(function (p) { return Object.assign({}, p, { cards: p.cards.slice() }); }) };
  var h = t.hand;
  c.hand = Object.assign({}, h, { deck: h.deck.slice(), board: h.board.slice(), log: h.log.slice() });
  return c;
}

/* the sizes worth pricing at this point */
function coachSizes(t, L) {
  var h = t.hand, out = [], pot = L.pot;
  function add(to, label) {
    to = Math.max(L.minTo, Math.min(L.maxTo, Math.round(to * 2) / 2));
    if (!out.some(function (o) { return Math.abs(o.to - to) < 0.25; })) out.push({ to: to, label: label });
  }
  if (!L.canRaise) return out;
  if (h.street === 0) {
    var pos = hPos(t, L.seat);
    if (h.raises === 0) {
      var limpers = h.log.filter(function (e) { return e.type === "call" && e.street === 0; }).length;
      if (L.toCall === 0) add(3.5 + limpers, "Raise to " + (3.5 + limpers));
      else add(limpers ? 3.5 + limpers : pos === "SB" ? 3 : 2.5, "Open to " + (limpers ? 3.5 + limpers : pos === "SB" ? 3 : 2.5));
    } else if (h.raises === 1) {
      var oop = pos === "SB" || pos === "BB";
      add(h.currentBet * (oop ? 4 : 3), "3-bet to " + h.currentBet * (oop ? 4 : 3));
    } else if (h.raises === 2) add(h.currentBet * 2.3, "4-bet to " + hRound(h.currentBet * 2.3));
    add(L.maxTo, "All in " + L.maxTo);
  } else if (L.toCall === 0) {
    [[0.33, "Bet ⅓ pot"], [0.66, "Bet ⅔ pot"], [1, "Bet pot"]].forEach(function (s) { add(s[0] * pot, s[1]); });
    if (L.maxTo <= 2 * pot) add(L.maxTo, "All in " + L.maxTo);
  } else {
    add(h.currentBet * 3, "Raise to " + hRound(Math.max(L.minTo, h.currentBet * 3)));
    if (L.maxTo <= 3 * pot) add(L.maxTo, "All in " + L.maxTo);
  }
  return out;
}

/* price one bet/raise to `to` */
function coachBet(g, A, to, rng) {
  var t = g.t, h = t.hand, hero = t.players[g.hero];
  var c = cloneTable(t);
  hAct(c, { type: "raise", to: to });
  var add = hRound(c.players[g.hero].put - hero.put);
  var potAfter = hPot(c);
  var responders = t.players.filter(function (q) { return q.i !== g.hero && !q.folded && !q.allIn; });
  var allInOpps = t.players.filter(function (q) { return q.i !== g.hero && !q.folded && q.allIn; });
  var resp = responders.map(function (q) {
    c.hand.toAct = q.i;
    var ctx = botCtx(c, q.i);
    var P = botPolicy(g.styles[q.i], ctx, g.ranges[q.i]);
    var w = g.ranges[q.i], cont = new Float64Array(w.length), m = 0, mc = 0;
    for (var i = 0; i < w.length; i++) if (w[i]) { m += w[i]; cont[i] = w[i] * (P.call[i] + P.raise[i]); mc += cont[i]; }
    var callAmt = Math.min(ctx.toCall, q.stack);
    return { seat: q.i, name: q.name, style: g.styles[q.i], pFold: m ? 1 - mc / m : 1, cont: cont, callAmt: callAmt };
  });
  var pAll = resp.reduce(function (a, r) { return a * r.pFold; }, 1);
  var ev = pAll * (A.pot - 0) + 0, parts = [{ what: "everyone folds", p: pAll, value: A.pot }];
  /* with no responders (everyone else all in) the bet is just a call-like investment */
  var base = allInOpps.map(function (q) { return g.ranges[q.i]; });
  var heroAllIn = hero.stack - add <= 0.001;
  resp.forEach(function (r, k) {
    var pOnly = (1 - r.pFold) * resp.reduce(function (a, o, j) { return j === k ? a : a * o.pFold; }, 1);
    if (pOnly < 1e-4) return;
    var eq = equityVs(hero.cards, h.board, base.concat([r.cont]), 600, rng);
    var R = coachR(h.street, A.ip, heroAllIn || r.callAmt >= t.players[r.seat].stack - 0.001);
    var final = potAfter + r.callAmt;
    var v = R * eq * final - add;
    ev += pOnly * v;
    parts.push({ what: r.name + " continues", p: pOnly, eq: eq, value: v });
    r.eqCalled = eq;
  });
  var pOne = parts.slice(1).reduce(function (a, x) { return a + x.p; }, 0);
  var pMulti = Math.max(0, 1 - pAll - pOne);
  if (pMulti > 1e-3) {
    var eqm = equityVs(hero.cards, h.board, base.concat(resp.map(function (r) { return r.cont; })), 600, rng);
    var finalM = potAfter + resp.reduce(function (a, r) { return a + r.callAmt; }, 0);
    var vm = coachR(h.street, A.ip, heroAllIn) * eqm * finalM - add;
    ev += pMulti * vm;
    parts.push({ what: "two or more continue", p: pMulti, eq: eqm, value: vm });
  }
  if (!resp.length) {
    var eq0 = equityVs(hero.cards, h.board, base, 600, rng);
    ev = eq0 * (potAfter) - add; parts = [{ what: "showdown", p: 1, eq: eq0, value: ev }];
  }
  return { ev: ev, add: add, pAllFold: resp.length ? pAll : 0, responders: resp.map(function (r) { return { seat: r.seat, name: r.name, style: r.style, pFold: r.pFold, eqCalled: r.eqCalled }; }), parts: parts };
}

/* everything the coach knows at the hero's decision */
function coachAnalyze(g, rng) {
  var t = g.t, h = t.hand, L = hLegal(t), hero = t.players[g.hero];
  var opps = t.players.filter(function (q) { return q.i !== g.hero && !q.folded; });
  var ip = heroIP(t, g.hero);
  var A = {
    street: h.street, pos: hPos(t, g.hero), hand: hero.cards.slice(), board: h.board.slice(),
    pot: L.pot, toCall: L.toCall, stack: hero.stack, ip: ip, raises: h.raises,
    price: L.toCall ? L.toCall / (L.pot + L.toCall) : 0,
    spr: h.street > 0 ? Math.min.apply(null, [hero.stack].concat(opps.map(function (q) { return q.stack; }))) / Math.max(1, L.pot) : null,
    opps: opps.map(function (q) {
      var w = g.ranges[q.i];
      return { seat: q.i, name: q.name, style: g.styles[q.i], pos: hPos(t, q.i), rangePct: 100 * rangeMass(w) / 1326,
        makeup: rangeMakeup(w, h.board), top: rangeTop(w, 6) };
    })
  };
  A.eq = equityVs(hero.cards, h.board, opps.map(function (q) { return g.ranges[q.i]; }), COACH_TRIALS, rng);
  var callAllIn = L.toCall >= hero.stack - 0.001;
  A.R = coachR(h.street, ip, false);
  var opts = [];
  if (L.toCall > 0) {
    opts.push({ key: "fold", type: "fold", label: "Fold", ev: 0 });
    var Rc = coachR(h.street, ip, callAllIn);
    opts.push({ key: "call", type: "call", label: "Call " + L.toCall, ev: Rc * A.eq * (L.pot + L.toCall) - L.toCall, R: Rc });
  } else {
    opts.push({ key: "check", type: "check", label: "Check", ev: A.R * A.eq * L.pot, R: A.R });
  }
  coachSizes(t, L).forEach(function (s) {
    var b = coachBet(g, A, s.to, rng);
    opts.push({ key: "raise:" + s.to, type: "raise", to: s.to, label: s.label, ev: b.ev, bet: b });
  });
  A.options = opts;
  var best = opts.reduce(function (a, o) { return o.ev > a.ev ? o : a; }, opts[0]);
  A.best = best.key;
  A.bestEV = best.ev;
  return A;
}

var GRADES = [
  ["Best", 0.03, 1], ["Good", 0.1, 0.85], ["Inaccuracy", 0.22, 0.55], ["Mistake", 0.45, 0.25], ["Blunder", Infinity, 0]
];

/* score the action the hero actually took */
function coachGrade(g, A, act, rng) {
  var opt;
  if (act.type === "fold") opt = A.options.filter(function (o) { return o.type === "fold"; })[0];
  else if (act.type === "check" || act.type === "call") opt = A.options.filter(function (o) { return o.type === "check" || o.type === "call"; })[0];
  else {
    var raises = A.options.filter(function (o) { return o.type === "raise"; });
    opt = raises.filter(function (o) { return Math.abs(o.to - act.to) <= Math.max(0.5, 0.12 * o.to); })[0];
    if (!opt) {
      var b = coachBet(g, A, act.to, rng);
      opt = { key: "raise:" + act.to, type: "raise", to: act.to, label: (A.toCall || A.street === 0 ? "Raise to " : "Bet ") + act.to + " (yours)", ev: b.ev, bet: b };
      A.options.push(opt);
      if (opt.ev > A.bestEV) { A.bestEV = opt.ev; A.best = opt.key; }
    }
  }
  if (!opt) opt = A.options[0];
  var loss = Math.max(0, A.bestEV - opt.ev);
  var scale = Math.max(2, A.pot + A.toCall);
  var r = loss < 0.05 ? 0 : loss / scale, G = GRADES[0];
  for (var i = 0; i < GRADES.length; i++) if (r < GRADES[i][1]) { G = GRADES[i]; break; }
  var res = { chosen: opt.key, loss: loss, grade: G[0], quality: G[2], concepts: coachConcepts(A, opt), lines: [] };
  res.lines = coachExplain(A, opt, res);
  return res;
}

/* which lessons a decision exercises */
function coachConcepts(A, opt) {
  var c = [];
  var best = A.options.filter(function (o) { return o.key === A.best; })[0] || opt;
  if (A.street === 0) {
    c.push(A.raises === 0 ? "rfi" : "threebet");
    if (A.toCall > 0 && (opt.type === "call" || best.type === "call")) c.push("eqr");
  } else {
    if (A.toCall > 0) {
      c.push("price");
      if (A.street === 3) c.push(A.eq < 0.6 ? "mdf" : "sizing");
      else c.push("eqr");
    } else {
      var betLike = opt.type === "raise" || best.type === "raise";
      if (betLike && A.eq < 0.45) c.push(A.street === 1 ? "cbet" : "fold");
      else if (betLike) c.push("sizing");
      else c.push("decide");
    }
    if (A.spr != null && A.spr < 3 && (opt.type === "raise" || best.type === "raise")) c.push("spr");
  }
  return c.filter(function (x, i) { return c.indexOf(x) === i; });
}

function pc(x) { return (100 * x).toFixed(0) + "%"; }
function bb(x) { return (x >= 0 ? "+" : "−") + Math.abs(x).toFixed(2) + " bb"; }

function coachExplain(A, opt, res) {
  var L = [], best = A.options.filter(function (o) { return o.key === A.best; })[0];
  var who = A.opps.length === 1 ? A.opps[0].name + "'s range" : "their ranges";
  L.push("Your equity against " + who + ": " + pc(A.eq) + (A.R < 1 ? ", of which you realise about " + pc(A.R) + " from " + (A.ip ? "in" : "out of") + " position." : "."));
  if (A.toCall > 0) {
    L.push("Pot odds: call " + A.toCall + " into " + hRound(A.pot + A.toCall) + " needs " + pc(A.price) + " equity" +
      (A.R < 1 ? " (" + pc(A.price / A.R) + " raw, after realisation)." : "."));
  }
  var br = best && best.bet;
  if (br && br.responders.length) {
    L.push(best.label + ": " + br.responders.map(function (r) { return r.name + " folds " + pc(r.pFold); }).join(", ") +
      (br.pAllFold < 0.999 && br.responders.length > 1 ? "; everyone folds " + pc(br.pAllFold) : "") +
      (br.responders[0].eqCalled != null ? "; when called you have " + pc(br.responders[0].eqCalled) : "") + ".");
  }
  if (opt.key === A.best || res.loss < 0.05) L.push("You chose the highest-EV option (" + bb(opt.ev) + ").");
  else L.push("Best was " + best.label + " at " + bb(best.ev) + "; your " + opt.label.toLowerCase() + " was worth " + bb(opt.ev) + ". You gave up " + res.loss.toFixed(2) + " bb.");
  return L;
}

if (typeof module !== "undefined") module.exports = {
  equityVs: equityVs, coachAnalyze: coachAnalyze, coachGrade: coachGrade, coachR: coachR, GRADES: GRADES, coachSizes: coachSizes
};
