/* ============================================================
   RANGES: notation -> combos, card removal, blockers, equity
   A combo is [cardIndex, cardIndex]. Card index 0..51.
   ============================================================ */

/* ---------- notation ---------- */
/* "AKs" "AKo" "AK" "77" "77+" "77-JJ" "A2s-A5s" "T9s+" "KJo+" "AsKh" */

function rIdx(ch) { return RANKS.indexOf(ch); }
function sIdx(ch) { return SUITS.indexOf(ch); }

function combosPair(r) {
  var out = [];
  for (var a = 0; a < 4; a++) for (var b = a + 1; b < 4; b++) out.push([a * 13 + r, b * 13 + r]);
  return out;                                    /* 6 */
}
function combosSuited(r1, r2) {
  var out = [];
  for (var s = 0; s < 4; s++) out.push([s * 13 + r1, s * 13 + r2]);
  return out;                                    /* 4 */
}
function combosOffsuit(r1, r2) {
  var out = [];
  for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) if (a !== b) out.push([a * 13 + r1, b * 13 + r2]);
  return out;                                    /* 12 */
}

function expandToken(tok) {
  tok = tok.trim();
  if (!tok) return [];
  var out = [];

  /* explicit combo, e.g. AsKh */
  if (/^[2-9TJQKA][cdhs][2-9TJQKA][cdhs]$/.test(tok)) {
    return [[sIdx(tok[1]) * 13 + rIdx(tok[0]), sIdx(tok[3]) * 13 + rIdx(tok[2])]];
  }

  /* dash range, e.g. 77-JJ or A2s-A5s */
  var dash = tok.split("-");
  if (dash.length === 2) {
    var lo = dash[0], hi = dash[1];
    if (/^([2-9TJQKA])\1$/.test(lo) && /^([2-9TJQKA])\1$/.test(hi)) {
      var a = rIdx(lo[0]), b = rIdx(hi[0]), s = Math.min(a, b), e = Math.max(a, b);
      for (var r = s; r <= e; r++) out = out.concat(combosPair(r));
      return out;
    }
    if (lo.length === 3 && hi.length === 3 && lo[0] === hi[0] && lo[2] === hi[2]) {
      var top = rIdx(lo[0]), k1 = rIdx(lo[1]), k2 = rIdx(hi[1]);
      var ks = Math.min(k1, k2), ke = Math.max(k1, k2);
      for (var k = ks; k <= ke; k++) {
        if (k === top) continue;
        out = out.concat(lo[2] === "s" ? combosSuited(top, k) : combosOffsuit(top, k));
      }
      return out;
    }
    return [];
  }

  /* plus, e.g. 77+ / T9s+ / KJo+ */
  var plus = tok.slice(-1) === "+";
  if (plus) tok = tok.slice(0, -1);

  /* pair */
  if (/^([2-9TJQKA])\1$/.test(tok)) {
    var pr = rIdx(tok[0]);
    var hiR = plus ? 12 : pr;
    for (var p = pr; p <= hiR; p++) out = out.concat(combosPair(p));
    return out;
  }

  /* two ranks with optional suit tag */
  var m = /^([2-9TJQKA])([2-9TJQKA])(s|o)?$/.exec(tok);
  if (!m) return [];
  var hi2 = rIdx(m[1]), lo2 = rIdx(m[2]), tag = m[3];
  if (hi2 === lo2) return [];
  if (hi2 < lo2) { var t = hi2; hi2 = lo2; lo2 = t; }

  var kickers = [];
  if (plus) {
    /* connectors like T9s+ walk both ranks up; gapped like A2s+ walk the kicker up */
    var gap = hi2 - lo2;
    if (gap === 1) {
      for (var g = lo2; g < 12; g++) kickers.push([g + 1, g]);
    } else {
      for (var k2 = lo2; k2 < hi2; k2++) kickers.push([hi2, k2]);
    }
  } else kickers.push([hi2, lo2]);

  kickers.forEach(function (pr2) {
    if (!tag || tag === "s") out = out.concat(combosSuited(pr2[0], pr2[1]));
    if (!tag || tag === "o") out = out.concat(combosOffsuit(pr2[0], pr2[1]));
  });
  return out;
}

function parseRange(str) {
  var out = [], seen = {};
  String(str).split(",").forEach(function (tok) {
    expandToken(tok).forEach(function (c) {
      var a = Math.min(c[0], c[1]), b = Math.max(c[0], c[1]), k = a * 52 + b;
      if (!seen[k]) { seen[k] = 1; out.push([a, b]); }
    });
  });
  return out;
}

/* ---------- card removal ---------- */
function removeDead(combos, dead) {
  var d = {}; dead.forEach(function (c) { d[c] = 1; });
  return combos.filter(function (c) { return !d[c[0]] && !d[c[1]]; });
}

/* ---------- naming ---------- */
function comboName(c) {
  var r1 = cardRank(c[0]), r2 = cardRank(c[1]);
  var hi = Math.max(r1, r2), lo = Math.min(r1, r2);
  if (r1 === r2) return RANKS[hi] + RANKS[lo];
  return RANKS[hi] + RANKS[lo] + (cardSuit(c[0]) === cardSuit(c[1]) ? "s" : "o");
}
function handClassCount(name) {
  if (name.length === 2) return 6;
  return name[2] === "s" ? 4 : 12;
}

/* ---------- equity ---------- */
/* one hand against a whole range, board optional (0, 3 or 4 cards) */
function equityVsRange(hero, range, board, trials) {
  trials = trials || 8000;
  var live = removeDead(range, hero.concat(board));
  if (!live.length) return null;
  var win = 0, tie = 0, n = 0;
  var dead0 = hero.concat(board);
  for (var i = 0; i < trials; i++) {
    var v = live[(Math.random() * live.length) | 0];
    var deck = remainingDeck(dead0.concat(v));
    var b = board.slice();
    for (var k = b.length; k < 5; k++) {
      var j = k - b.length;
      var idx = j + ((Math.random() * (deck.length - j)) | 0);
      var t = deck[j]; deck[j] = deck[idx]; deck[idx] = t;
      b.push(deck[j]);
    }
    var hs = eval7([hero[0], hero[1], b[0], b[1], b[2], b[3], b[4]]);
    var vs = eval7([v[0], v[1], b[0], b[1], b[2], b[3], b[4]]);
    if (hs > vs) win++; else if (hs === vs) tie++;
    n++;
  }
  return (win + tie / 2) / n;
}

/* how a range splits against a made board: ahead / behind / tied */
function rangeSplit(hero, range, board) {
  var live = removeDead(range, hero.concat(board));
  var hs = eval7(hero.concat(board).slice(0, 7));
  var ahead = 0, behind = 0, tied = 0;
  live.forEach(function (v) {
    var vs = eval7(v.concat(board).slice(0, 7));
    if (vs > hs) ahead++; else if (vs < hs) behind++; else tied++;
  });
  return { beat: ahead, lose: behind, tie: tied, total: live.length };
}
