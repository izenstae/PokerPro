var E = require('../src/engine.js');
var RANKS = "23456789TJQKA", SUITS = "cdhs";
function C(s) { return SUITS.indexOf(s[1]) * 13 + RANKS.indexOf(s[0]); }
function H(str) { return str.split(" ").map(C); }

/* ---------- independent, deliberately naive 5-card evaluator ---------- */
function score5(cards) {
  var rs = cards.map(function (c) { return c % 13; }).sort(function (a, b) { return b - a; });
  var ss = cards.map(function (c) { return (c / 13) | 0; });
  var flush = ss.every(function (x) { return x === ss[0]; });
  var uniq = Array.from(new Set(rs)).sort(function (a, b) { return b - a; });
  var straight = false, shigh = -1;
  if (uniq.length === 5) {
    if (uniq[0] - uniq[4] === 4) { straight = true; shigh = uniq[0]; }
    else if (uniq[0] === 12 && uniq[1] === 3 && uniq[2] === 2 && uniq[3] === 1 && uniq[4] === 0) { straight = true; shigh = 3; }
  }
  var groups = uniq.map(function (r) { return [rs.filter(function (x) { return x === r; }).length, r]; });
  groups.sort(function (a, b) { return b[0] - a[0] || b[1] - a[1]; });
  var shape = groups.map(function (g) { return g[0]; }).join("");
  var ord = groups.map(function (g) { return g[1]; });
  var cat;
  if (straight && flush) cat = 8;
  else if (shape === "41") cat = 7;
  else if (shape === "32") cat = 6;
  else if (flush) cat = 5;
  else if (straight) cat = 4;
  else if (shape === "311") cat = 3;
  else if (shape === "221") cat = 2;
  else if (shape === "2111") cat = 1;
  else cat = 0;
  var key = (cat === 8 || cat === 4) ? [shigh, 0, 0, 0, 0] : [ord[0] || 0, ord[1] || 0, ord[2] || 0, ord[3] || 0, ord[4] || 0];
  return ((((cat * 13 + key[0]) * 13 + key[1]) * 13 + key[2]) * 13 + key[3]) * 13 + key[4];
}
function best7(cards) {
  var best = -1;
  for (var a = 0; a < 7; a++) for (var b = a + 1; b < 7; b++) for (var c = b + 1; c < 7; c++)
    for (var d = c + 1; d < 7; d++) for (var e = d + 1; e < 7; e++) {
      var s = score5([cards[a], cards[b], cards[c], cards[d], cards[e]]);
      if (s > best) best = s;
    }
  return best;
}

/* ---------- agreement test: rank ORDER must match on random pairs ---------- */
function randHand() {
  var s = new Set();
  while (s.size < 7) s.add((Math.random() * 52) | 0);
  return Array.from(s);
}
var mismatch = 0, N = 200000;
for (var i = 0; i < N; i++) {
  var x = randHand(), y = randHand();
  var fx = E.eval7(x), fy = E.eval7(y);
  var gx = best7(x), gy = best7(y);
  var sf = Math.sign(fx - fy), sg = Math.sign(gx - gy);
  if (sf !== sg) {
    mismatch++;
    if (mismatch <= 3) console.log("MISMATCH", x.map(E.cardText).join(" "), "vs", y.map(E.cardText).join(" "), sf, sg);
  }
}
console.log((mismatch === 0 ? "PASS" : "FAIL") + " eval7 agrees with naive 5-from-7 on " + N + " comparisons (" + mismatch + " mismatches)");

/* ---------- exact preflop enumeration ---------- */
function equityExactPreflop(h1, h2) {
  var dead = {}; h1.concat(h2).forEach(function (c) { dead[c] = 1; });
  var deck = []; for (var i = 0; i < 52; i++) if (!dead[i]) deck.push(i);
  var w = 0, l = 0, t = 0;
  var A = new Int32Array(7), B = new Int32Array(7);
  A[0] = h1[0]; A[1] = h1[1]; B[0] = h2[0]; B[1] = h2[1];
  var n = deck.length;
  for (var a = 0; a < n; a++) { A[2] = B[2] = deck[a];
    for (var b = a + 1; b < n; b++) { A[3] = B[3] = deck[b];
      for (var c = b + 1; c < n; c++) { A[4] = B[4] = deck[c];
        for (var d = c + 1; d < n; d++) { A[5] = B[5] = deck[d];
          for (var e = d + 1; e < n; e++) { A[6] = B[6] = deck[e];
            var s1 = E.eval7(A), s2 = E.eval7(B);
            if (s1 > s2) w++; else if (s1 < s2) l++; else t++;
          } } } } }
  return { win: 100 * w / (w + l + t), lose: 100 * l / (w + l + t), tie: 100 * t / (w + l + t), eq: 100 * (w + t / 2) / (w + l + t) };
}

[["As Ad", "Kc Kh"], ["Ah Kd", "As Qc"], ["7h 2c", "As Kd"], ["As Ks", "Qc Qh"]].forEach(function (p) {
  var t0 = Date.now();
  var r = equityExactPreflop(H(p[0]), H(p[1]));
  console.log(p[0] + " vs " + p[1] + " EXACT: win " + r.win.toFixed(2) + "  lose " + r.lose.toFixed(2) +
    "  tie " + r.tie.toFixed(2) + "  equity " + r.eq.toFixed(2) + "%  (" + (Date.now() - t0) + "ms)");
});
