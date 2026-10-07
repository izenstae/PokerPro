/* ============================================================
   CHESS ENGINE
   A 10x12 mailbox board, full legal move generation (castling,
   en passant, promotion), FEN and SAN, alpha-beta search with
   quiescence and a node budget, a material + piece-square
   evaluation, a forced-mate finder, and move grading measured
   in centipawns and win probability. Pure functions on a plain
   state object: the drills, the Play board and the tests all
   call the same code.
   Squares: a1 = 21 ... h1 = 28, a8 = 91 ... h8 = 98 (rank*10 + file + 21).
   Pieces: P N B R Q K = 1..6, black negative, 0 empty, 7 off board.
   ============================================================ */

var CH_P = 1, CH_N = 2, CH_B = 3, CH_R = 4, CH_Q = 5, CH_K = 6, CH_OFF = 7;
var CH_VAL = [0, 100, 320, 330, 500, 900, 20000];
var CH_POINTS = [0, 1, 3, 3, 5, 9, 0];            /* the classroom scale */
var CH_NAMES = ["", "pawn", "knight", "bishop", "rook", "queen", "king"];
var CH_LETTER = ["", "", "N", "B", "R", "Q", "K"];
var CH_MATE = 100000;
var CH_FILES = "abcdefgh";
var CH_KNIGHT = [-21, -19, -12, -8, 8, 12, 19, 21];
var CH_KING = [-11, -10, -9, -1, 1, 9, 10, 11];
var CH_BISHOP = [-11, -9, 9, 11];
var CH_ROOK = [-10, -1, 1, 10];
var CH_WK = 1, CH_WQ = 2, CH_BK = 4, CH_BQ = 8;

function chSq(file, rank) { return 21 + rank * 10 + file; }            /* file 0..7, rank 0..7 */
function chFile(sq) { return (sq - 21) % 10; }
function chRank(sq) { return ((sq - 21) / 10) | 0; }
function chName(sq) { return CH_FILES[chFile(sq)] + (chRank(sq) + 1); }
function chIdx(name) { return chSq(CH_FILES.indexOf(name[0]), parseInt(name[1], 10) - 1); }
function chOnBoard(sq) { var f = (sq - 21) % 10, r = ((sq - 21) / 10) | 0; return sq >= 21 && sq <= 98 && f >= 0 && f <= 7 && r >= 0 && r <= 7; }

function chNew() {
  var b = new Int8Array(120);
  for (var i = 0; i < 120; i++) b[i] = chOnBoard(i) ? 0 : CH_OFF;
  return { b: b, side: 1, castle: 0, ep: -1, half: 0, full: 1, hist: [], wk: -1, bk: -1 };
}

/* ---- FEN ---- */
var CH_FEN_PIECE = { p: -1, n: -2, b: -3, r: -4, q: -5, k: -6, P: 1, N: 2, B: 3, R: 4, Q: 5, K: 6 };
var CH_START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function chFromFen(fen) {
  var s = chNew(), parts = fen.trim().split(/\s+/);
  var rows = parts[0].split("/");
  if (rows.length !== 8) throw new Error("bad fen: " + fen);
  for (var r = 0; r < 8; r++) {
    var rank = 7 - r, file = 0;
    for (var i = 0; i < rows[r].length; i++) {
      var c = rows[r][i];
      if (/[1-8]/.test(c)) file += +c;
      else { s.b[chSq(file, rank)] = CH_FEN_PIECE[c]; file++; }
    }
  }
  s.side = parts[1] === "b" ? -1 : 1;
  var cs = parts[2] || "-";
  s.castle = (cs.indexOf("K") >= 0 ? CH_WK : 0) | (cs.indexOf("Q") >= 0 ? CH_WQ : 0) | (cs.indexOf("k") >= 0 ? CH_BK : 0) | (cs.indexOf("q") >= 0 ? CH_BQ : 0);
  s.ep = parts[3] && parts[3] !== "-" ? chIdx(parts[3]) : -1;
  s.half = parts[4] ? +parts[4] : 0;
  s.full = parts[5] ? +parts[5] : 1;
  return s;
}
function chStart() { return chFromFen(CH_START); }

function chToFen(s) {
  var out = [];
  for (var rank = 7; rank >= 0; rank--) {
    var row = "", empty = 0;
    for (var file = 0; file < 8; file++) {
      var p = s.b[chSq(file, rank)];
      if (!p) { empty++; continue; }
      if (empty) { row += empty; empty = 0; }
      var ch = "pnbrqk"[Math.abs(p) - 1];
      row += p > 0 ? ch.toUpperCase() : ch;
    }
    if (empty) row += empty;
    out.push(row);
  }
  var cs = (s.castle & CH_WK ? "K" : "") + (s.castle & CH_WQ ? "Q" : "") + (s.castle & CH_BK ? "k" : "") + (s.castle & CH_BQ ? "q" : "");
  return out.join("/") + " " + (s.side > 0 ? "w" : "b") + " " + (cs || "-") + " " + (s.ep >= 0 ? chName(s.ep) : "-") + " " + s.half + " " + s.full;
}
/* the position only: for repetition counting. The ep square counts only when an en passant capture is actually legal. */
function chKey(s) {
  var f = chToFen(s).split(" ");
  if (s.ep >= 0 && !chLegal(s).some(function (m) { return m.flag === "ep"; })) f[3] = "-";
  return f.slice(0, 4).join(" ");
}

/* ---- attacks ---- */
/* the king's square: a remembered hint, checked with one read, then a scan (drills place pieces directly, so the hint can be stale) */
function chKingSq(s, side) {
  var k = side > 0 ? s.wk : s.bk;
  if (k >= 0 && s.b[k] === CH_K * side) return k;
  for (var i = 21; i <= 98; i++) if (s.b[i] === CH_K * side) { if (side > 0) s.wk = i; else s.bk = i; return i; }
  return -1;
}
/* is sq attacked by side? */
function chAttacked(s, sq, side) {
  var b = s.b, i, t, d;
  /* pawns: a white pawn on sq-9 or sq-11 attacks sq */
  if (side > 0) { if (b[sq - 9] === CH_P || b[sq - 11] === CH_P) return true; }
  else { if (b[sq + 9] === -CH_P || b[sq + 11] === -CH_P) return true; }
  for (i = 0; i < 8; i++) { if (b[sq + CH_KNIGHT[i]] === CH_N * side) return true; }
  for (i = 0; i < 8; i++) { if (b[sq + CH_KING[i]] === CH_K * side) return true; }
  for (i = 0; i < 4; i++) {
    d = CH_BISHOP[i]; t = sq + d;
    while (b[t] === 0) t += d;
    if (b[t] === CH_B * side || b[t] === CH_Q * side) return true;
  }
  for (i = 0; i < 4; i++) {
    d = CH_ROOK[i]; t = sq + d;
    while (b[t] === 0) t += d;
    if (b[t] === CH_R * side || b[t] === CH_Q * side) return true;
  }
  return false;
}
function chInCheck(s, side) { side = side || s.side; var k = chKingSq(s, side); return k >= 0 && chAttacked(s, k, -side); }

/* every square the piece on sq attacks (empty or occupied), for the drills */
function chAttacksFrom(s, sq) {
  var p = s.b[sq], out = [], i, t, d;
  if (!p || p === CH_OFF) return out;
  var side = p > 0 ? 1 : -1, kind = Math.abs(p);
  if (kind === CH_P) { [9, 11].forEach(function (o) { t = sq + o * side; if (s.b[t] !== CH_OFF) out.push(t); }); return out; }
  if (kind === CH_N || kind === CH_K) { var D = kind === CH_N ? CH_KNIGHT : CH_KING; for (i = 0; i < 8; i++) { t = sq + D[i]; if (s.b[t] !== CH_OFF) out.push(t); } return out; }
  var dirs = kind === CH_B ? CH_BISHOP : kind === CH_R ? CH_ROOK : CH_BISHOP.concat(CH_ROOK);
  for (i = 0; i < dirs.length; i++) {
    d = dirs[i]; t = sq + d;
    while (s.b[t] === 0) { out.push(t); t += d; }
    if (s.b[t] !== CH_OFF) out.push(t);
  }
  return out;
}

/* ---- move generation ---- */
function chMv(from, to, piece, cap, promo, flag) { return { from: from, to: to, piece: piece, cap: cap || 0, promo: promo || 0, flag: flag || "" }; }

function chPseudo(s, capsOnly) {
  var b = s.b, side = s.side, out = [], sq, p, i, t, d, kind;
  for (sq = 21; sq <= 98; sq++) {
    p = b[sq];
    if (!p || p === CH_OFF || (p > 0) !== (side > 0)) continue;
    kind = Math.abs(p);
    if (kind === CH_P) {
      var fwd = sq + 10 * side, startRank = side > 0 ? 1 : 6, promoRank = side > 0 ? 7 : 0;
      if (!capsOnly || chRank(fwd) === promoRank) {
        if (b[fwd] === 0) {
          if (chRank(fwd) === promoRank) [CH_Q, CH_R, CH_B, CH_N].forEach(function (pr) { out.push(chMv(sq, fwd, p, 0, pr * side)); });
          else {
            if (!capsOnly) out.push(chMv(sq, fwd, p));
            if (!capsOnly && chRank(sq) === startRank && b[fwd + 10 * side] === 0) out.push(chMv(sq, fwd + 10 * side, p, 0, 0, "dbl"));
          }
        }
      }
      for (i = 0; i < 2; i++) {
        t = sq + (i ? 11 : 9) * side;
        var tp = b[t];
        if (tp !== 0 && tp !== CH_OFF && (tp > 0) !== (side > 0)) {
          if (chRank(t) === promoRank) [CH_Q, CH_R, CH_B, CH_N].forEach(function (pr) { out.push(chMv(sq, t, p, tp, pr * side)); });
          else out.push(chMv(sq, t, p, tp));
        } else if (t === s.ep && tp === 0) out.push(chMv(sq, t, p, -CH_P * side, 0, "ep"));
      }
      continue;
    }
    if (kind === CH_N || kind === CH_K) {
      var D = kind === CH_N ? CH_KNIGHT : CH_KING;
      for (i = 0; i < 8; i++) {
        t = sq + D[i]; var q = b[t];
        if (q === CH_OFF) continue;
        if (q === 0) { if (!capsOnly) out.push(chMv(sq, t, p)); }
        else if ((q > 0) !== (side > 0)) out.push(chMv(sq, t, p, q));
      }
      if (kind === CH_K && !capsOnly) {
        var home = side > 0 ? 25 : 95;
        if (sq === home) {
          var kBit = side > 0 ? CH_WK : CH_BK, qBit = side > 0 ? CH_WQ : CH_BQ;
          if ((s.castle & kBit) && b[home + 1] === 0 && b[home + 2] === 0 && b[home + 3] === CH_R * side &&
              !chAttacked(s, home, -side) && !chAttacked(s, home + 1, -side) && !chAttacked(s, home + 2, -side))
            out.push(chMv(sq, home + 2, p, 0, 0, "castle"));
          if ((s.castle & qBit) && b[home - 1] === 0 && b[home - 2] === 0 && b[home - 3] === 0 && b[home - 4] === CH_R * side &&
              !chAttacked(s, home, -side) && !chAttacked(s, home - 1, -side) && !chAttacked(s, home - 2, -side))
            out.push(chMv(sq, home - 2, p, 0, 0, "castle"));
        }
      }
      continue;
    }
    var dirs = kind === CH_B ? CH_BISHOP : kind === CH_R ? CH_ROOK : CH_BISHOP.concat(CH_ROOK);
    for (i = 0; i < dirs.length; i++) {
      d = dirs[i]; t = sq + d;
      while (b[t] === 0) { if (!capsOnly) out.push(chMv(sq, t, p)); t += d; }
      if (b[t] !== CH_OFF && (b[t] > 0) !== (side > 0)) out.push(chMv(sq, t, p, b[t]));
    }
  }
  return out;
}

function chMake(s, m) {
  var b = s.b, side = s.side;
  s.hist.push({ m: m, castle: s.castle, ep: s.ep, half: s.half });
  b[m.from] = 0;
  b[m.to] = m.promo || m.piece;
  if (m.flag === "ep") b[m.to - 10 * side] = 0;
  if (m.flag === "castle") {
    if (m.to > m.from) { b[m.to + 1] = 0; b[m.to - 1] = CH_R * side; }
    else { b[m.to - 2] = 0; b[m.to + 1] = CH_R * side; }
  }
  s.ep = m.flag === "dbl" ? m.from + 10 * side : -1;
  /* castling rights fall when the king or a rook moves, or a rook is captured */
  if (Math.abs(m.piece) === CH_K) s.castle &= side > 0 ? ~(CH_WK | CH_WQ) : ~(CH_BK | CH_BQ);
  if (m.from === 21 || m.to === 21) s.castle &= ~CH_WQ;
  if (m.from === 28 || m.to === 28) s.castle &= ~CH_WK;
  if (m.from === 91 || m.to === 91) s.castle &= ~CH_BQ;
  if (m.from === 98 || m.to === 98) s.castle &= ~CH_BK;
  s.half = (m.cap || Math.abs(m.piece) === CH_P) ? 0 : s.half + 1;
  if (side < 0) s.full++;
  s.side = -side;
}
function chUnmake(s) {
  var h = s.hist.pop(), m = h.m, b = s.b;
  s.side = -s.side;
  var side = s.side;
  b[m.from] = m.piece;
  b[m.to] = m.flag === "ep" ? 0 : m.cap;
  if (m.flag === "ep") b[m.to - 10 * side] = -CH_P * side;
  if (m.flag === "castle") {
    if (m.to > m.from) { b[m.to + 1] = CH_R * side; b[m.to - 1] = 0; }
    else { b[m.to - 2] = CH_R * side; b[m.to + 1] = 0; }
  }
  s.castle = h.castle; s.ep = h.ep; s.half = h.half;
  if (side < 0) s.full--;
}

function chLegal(s, capsOnly) {
  var ps = chPseudo(s, capsOnly), out = [], side = s.side;
  for (var i = 0; i < ps.length; i++) {
    chMake(s, ps[i]);
    if (!chInCheck(s, side)) out.push(ps[i]);
    chUnmake(s);
  }
  return out;
}
function chPerft(s, depth) {
  if (depth === 0) return 1;
  var ms = chLegal(s), n = 0;
  for (var i = 0; i < ms.length; i++) { chMake(s, ms[i]); n += chPerft(s, depth - 1); chUnmake(s); }
  return n;
}

/* ---- the result of a position ---- */
function chStatus(s, keys) {
  var ms = chLegal(s), check = chInCheck(s);
  if (!ms.length) return check ? "checkmate" : "stalemate";
  if (s.half >= 100) return "fifty";
  if (chInsufficient(s)) return "material";
  if (keys) { var k = chKey(s), n = 0; for (var i = 0; i < keys.length; i++) if (keys[i] === k) n++; if (n >= 3) return "repetition"; }
  return check ? "check" : "";
}
function chInsufficient(s) {
  var minor = 0, other = 0, bishops = [];
  for (var i = 21; i <= 98; i++) { var p = Math.abs(s.b[i]); if (!p || p === CH_OFF || p === CH_K) continue; if (p === CH_N || p === CH_B) { minor++; if (p === CH_B) bishops.push(i); } else other++; }
  if (other) return false;
  if (minor <= 1) return true;
  /* bishops only, all on one square colour (KB vs KB, or more on the same colour): no mate is possible */
  if (bishops.length === minor) { var col = (chFile(bishops[0]) + chRank(bishops[0])) % 2; return bishops.every(function (b) { return (chFile(b) + chRank(b)) % 2 === col; }); }
  return false;
}

/* ---- SAN ---- */
function chSan(s, m) {
  var kind = Math.abs(m.piece), str;
  if (m.flag === "castle") str = m.to > m.from ? "O-O" : "O-O-O";
  else {
    if (kind === CH_P) str = (m.cap ? CH_FILES[chFile(m.from)] + "x" : "") + chName(m.to) + (m.promo ? "=" + CH_LETTER[Math.abs(m.promo)] : "");
    else {
      /* disambiguate against other legal moves of the same piece to the same square */
      var others = chLegal(s).filter(function (o) { return o.to === m.to && o.piece === m.piece && o.from !== m.from; });
      var dis = "";
      if (others.length) {
        var sameFile = others.some(function (o) { return chFile(o.from) === chFile(m.from); });
        var sameRank = others.some(function (o) { return chRank(o.from) === chRank(m.from); });
        if (!sameFile) dis = CH_FILES[chFile(m.from)];
        else if (!sameRank) dis = String(chRank(m.from) + 1);
        else dis = chName(m.from);
      }
      str = CH_LETTER[kind] + dis + (m.cap ? "x" : "") + chName(m.to);
    }
  }
  chMake(s, m);
  var check = chInCheck(s), mate = check && !chLegal(s).length;
  chUnmake(s);
  return str + (mate ? "#" : check ? "+" : "");
}
function chParseSan(s, san) {
  var want = san.replace(/[+#!?]/g, "").replace(/0/g, "O");
  var ms = chLegal(s);
  for (var i = 0; i < ms.length; i++) {
    var got = chSan(s, ms[i]).replace(/[+#]/g, "");
    if (got === want) return ms[i];
  }
  /* lenient: pawn capture without the file, promotion without "=" */
  for (i = 0; i < ms.length; i++) {
    got = chSan(s, ms[i]).replace(/[+#]/g, "").replace("=", "");
    if (got === want.replace("=", "") || got.replace(/^[a-h]x/, "x") === want) return ms[i];
  }
  return null;
}
function chMoveName(m) { return chName(m.from) + chName(m.to) + (m.promo ? CH_LETTER[Math.abs(m.promo)].toLowerCase() : ""); }
function chFindMove(s, from, to, promo) {
  var ms = chLegal(s);
  for (var i = 0; i < ms.length; i++) {
    var m = ms[i];
    if (m.from === from && m.to === to && (!m.promo || !promo || Math.abs(m.promo) === promo)) {
      if (m.promo && !promo && Math.abs(m.promo) !== CH_Q) continue;
      return m;
    }
  }
  return null;
}

/* ---- evaluation: material and piece-square tables (from white's view, a8 first) ---- */
var CH_PST = {
  1: [ 0,  0,  0,  0,  0,  0,  0,  0,
      50, 50, 50, 50, 50, 50, 50, 50,
      10, 10, 20, 30, 30, 20, 10, 10,
       5,  5, 10, 25, 25, 10,  5,  5,
       0,  0,  0, 20, 20,  0,  0,  0,
       5, -5,-10,  0,  0,-10, -5,  5,
       5, 10, 10,-20,-20, 10, 10,  5,
       0,  0,  0,  0,  0,  0,  0,  0],
  2: [-50,-40,-30,-30,-30,-30,-40,-50,
      -40,-20,  0,  0,  0,  0,-20,-40,
      -30,  0, 10, 15, 15, 10,  0,-30,
      -30,  5, 15, 20, 20, 15,  5,-30,
      -30,  0, 15, 20, 20, 15,  0,-30,
      -30,  5, 10, 15, 15, 10,  5,-30,
      -40,-20,  0,  5,  5,  0,-20,-40,
      -50,-40,-30,-30,-30,-30,-40,-50],
  3: [-20,-10,-10,-10,-10,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5, 10, 10,  5,  0,-10,
      -10,  5,  5, 10, 10,  5,  5,-10,
      -10,  0, 10, 10, 10, 10,  0,-10,
      -10, 10, 10, 10, 10, 10, 10,-10,
      -10,  5,  0,  0,  0,  0,  5,-10,
      -20,-10,-10,-10,-10,-10,-10,-20],
  4: [  0,  0,  0,  0,  0,  0,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,
        0,  0,  0,  5,  5,  0,  0,  0],
  5: [-20,-10,-10, -5, -5,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5,  5,  5,  5,  0,-10,
       -5,  0,  5,  5,  5,  5,  0, -5,
        0,  0,  5,  5,  5,  5,  0, -5,
      -10,  5,  5,  5,  5,  5,  0,-10,
      -10,  0,  5,  0,  0,  0,  0,-10,
      -20,-10,-10, -5, -5,-10,-10,-20],
  6: [-30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -20,-30,-30,-40,-40,-30,-30,-20,
      -10,-20,-20,-20,-20,-20,-20,-10,
       20, 20,  0,  0,  0,  0, 20, 20,
       20, 30, 10,  0,  0, 10, 30, 20],
  7: [-50,-40,-30,-20,-20,-30,-40,-50,   /* the king in the endgame */
      -30,-20,-10,  0,  0,-10,-20,-30,
      -30,-10, 20, 30, 30, 20,-10,-30,
      -30,-10, 30, 40, 40, 30,-10,-30,
      -30,-10, 30, 40, 40, 30,-10,-30,
      -30,-10, 20, 30, 30, 20,-10,-30,
      -30,-30,  0,  0,  0,  0,-30,-30,
      -50,-30,-30,-30,-30,-30,-30,-50]
};
function chPstIdx(sq, side) {
  var f = chFile(sq), r = chRank(sq);
  return side > 0 ? (7 - r) * 8 + f : r * 8 + f;
}
/* score from the side to move's point of view */
function chEval(s) {
  var b = s.b, score = 0, mat = 0, i, p, kind, side;
  for (i = 21; i <= 98; i++) { p = b[i]; if (p && p !== CH_OFF) { kind = Math.abs(p); if (kind !== CH_K && kind !== CH_P) mat += CH_VAL[kind]; } }
  var endgame = mat <= 1300;
  for (i = 21; i <= 98; i++) {
    p = b[i]; if (!p || p === CH_OFF) continue;
    kind = Math.abs(p); side = p > 0 ? 1 : -1;
    var v = CH_VAL[kind] + CH_PST[kind === CH_K && endgame ? 7 : kind][chPstIdx(i, side)];
    score += side * v;
  }
  /* a small bonus for mobility keeps the pieces active */
  return s.side > 0 ? score : -score;
}

/* ---- search ---- */
function chOrder(ms) {
  for (var i = 0; i < ms.length; i++) {
    var m = ms[i];
    m.sc = (m.cap ? 10 * CH_VAL[Math.abs(m.cap)] - CH_VAL[Math.abs(m.piece)] : 0) + (m.promo ? 800 : 0) + (m.flag === "castle" ? 30 : 0);
  }
  ms.sort(function (a, b) { return b.sc - a.sc; });
  return ms;
}
function chQuiesce(s, alpha, beta, ctx) {
  ctx.nodes++;
  var stand = chEval(s);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;
  if (ctx.nodes > ctx.limit) return alpha;
  var ms = chOrder(chLegal(s, true));
  for (var i = 0; i < ms.length; i++) {
    chMake(s, ms[i]);
    var v = -chQuiesce(s, -beta, -alpha, ctx);
    chUnmake(s);
    if (v >= beta) return beta;
    if (v > alpha) alpha = v;
  }
  return alpha;
}
function chAlphaBeta(s, depth, alpha, beta, ctx, ply) {
  ctx.nodes++;
  if (depth <= 0 && !chInCheck(s)) return chQuiesce(s, alpha, beta, ctx);
  if (depth <= 0) depth = 1;                      /* check extension: a mate on the horizon is still a mate */
  var ms = chLegal(s);
  if (!ms.length) return chInCheck(s) ? -CH_MATE + ply : 0;
  if (s.half >= 100) return 0;
  if (ctx.nodes > ctx.limit) { ctx.aborted = true; return chEval(s); }
  chOrder(ms);
  if (ctx.pvFirst && ply === 0) {
    var k = ctx.pvFirst;
    for (var j = 0; j < ms.length; j++) if (ms[j].from === k.from && ms[j].to === k.to && ms[j].promo === k.promo) { ms.splice(0, 0, ms.splice(j, 1)[0]); break; }
  }
  var best = -Infinity, bestMove = null;
  for (var i = 0; i < ms.length; i++) {
    chMake(s, ms[i]);
    var v = -chAlphaBeta(s, depth - 1, -beta, -alpha, ctx, ply + 1);
    chUnmake(s);
    if (v > best) { best = v; bestMove = ms[i]; }
    if (v > alpha) alpha = v;
    if (alpha >= beta) break;
    if (ctx.aborted) break;
  }
  if (ply === 0) ctx.best = bestMove;
  return best;
}
/* iterative deepening to depth, within a node budget. Returns the best move, its score and the depth reached. */
function chSearch(s, depth, limit) {
  var ctx = { nodes: 0, limit: limit || 400000, aborted: false, best: null, pvFirst: null };
  var out = { move: null, score: 0, depth: 0, nodes: 0 };
  for (var d = 1; d <= depth; d++) {
    ctx.aborted = false; ctx.pvFirst = out.move;
    var v = chAlphaBeta(s, d, -Infinity, Infinity, ctx, 0);
    if (ctx.aborted && d > 1) break;
    out.move = ctx.best; out.score = v; out.depth = d;
    if (Math.abs(v) >= CH_MATE - 50) break;
  }
  out.nodes = ctx.nodes;
  return out;
}
/* every legal move scored at the given depth, best first */
function chScoreMoves(s, depth, limit) {
  var ms = chLegal(s), out = [];
  for (var i = 0; i < ms.length; i++) {
    chMake(s, ms[i]);
    var r = depth <= 1 ? { score: -chQuiesce(s, -Infinity, Infinity, { nodes: 0, limit: limit || 50000 }) } : chSearch(s, depth - 1, limit);
    var v = depth <= 1 ? r.score : -r.score;
    if (!chLegal(s).length) v = chInCheck(s) ? CH_MATE - 1 : 0;
    chUnmake(s);
    out.push({ move: ms[i], score: v, san: chSan(s, ms[i]) });
  }
  out.sort(function (a, b) { return b.score - a.score; });
  return out;
}

/* a forced mate in n moves for the side to move, or null */
function chMateIn(s, n, limit) {
  var r = chSearch(s, 2 * n - 1, limit || 300000);
  return r.move && r.score >= CH_MATE - (2 * n - 1) ? r.move : null;
}
/* the moves that mate at once */
function chMatingMoves(s) {
  return chLegal(s).filter(function (m) { chMake(s, m); var mate = chStatus(s) === "checkmate"; chUnmake(s); return mate; });
}

/* ---- grading a move: centipawns given up, as win probability ---- */
function chWinProb(cp) { return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * Math.max(-2000, Math.min(2000, cp)))) - 1); }
var CH_GRADES = [["Best", 0.02], ["Good", 0.06], ["Inaccuracy", 0.12], ["Mistake", 0.25], ["Blunder", 1.01]];
function chGrade(bestCp, playedCp) {
  var drop = (chWinProb(bestCp) - chWinProb(playedCp)) / 100;
  if (drop < 0) drop = 0;
  var g = "Blunder";
  for (var i = 0; i < CH_GRADES.length; i++) if (drop <= CH_GRADES[i][1]) { g = CH_GRADES[i][0]; break; }
  var clamp = function (cp) { return Math.max(-2000, Math.min(2000, cp)); };
  return { grade: g, drop: drop, loss: Math.max(0, clamp(bestCp) - clamp(playedCp)), quality: Math.max(0, 1 - drop * 4) };
}
/* a move's accuracy from its drop in win probability (percentage points), lichess's curve: 0 → 100, 1 → 95.6, 2 → 91.4, 5 → 79.8 */
function chMoveAccuracy(dropPct) { if (!(dropPct > 0)) return 100; return Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * dropPct) - 3.1669)); }
/* grade the move m in position s at the given depth: returns the best move, both scores and the grade */
function chJudge(s, m, depth, limit) {
  var best = chSearch(s, depth, limit);
  chMake(s, m);
  var after = chLegal(s).length ? chSearch(s, Math.max(1, depth - 1), limit) : { score: chInCheck(s) ? -CH_MATE + 1 : 0 };
  chUnmake(s);
  var played = -after.score;
  var same = best.move && best.move.from === m.from && best.move.to === m.to && best.move.promo === m.promo;
  if (same || played > best.score) played = best.score;
  var g = chGrade(best.score, played);
  g.best = best.move; g.bestSan = best.move ? chSan(s, best.move) : ""; g.bestCp = best.score; g.playedCp = played;
  return g;
}

/* ---- helpers for the drills ---- */
function chRandomPosition(plies, rnd) {
  rnd = rnd || Math.random;
  var s = chStart();
  for (var i = 0; i < plies; i++) {
    var ms = chLegal(s);
    if (!ms.length) break;
    /* prefer sensible moves: captures and development, so positions look like chess */
    var caps = ms.filter(function (m) { return m.cap; });
    var pick = (caps.length && rnd() < 0.5) ? caps[(rnd() * caps.length) | 0] : ms[(rnd() * ms.length) | 0];
    chMake(s, pick);
  }
  s.hist = [];
  return s;
}
function chMaterial(s) {
  var w = 0, bl = 0;
  for (var i = 21; i <= 98; i++) { var p = s.b[i]; if (!p || p === CH_OFF || Math.abs(p) === CH_K) continue; if (p > 0) w += CH_POINTS[p]; else bl += CH_POINTS[-p]; }
  return { white: w, black: bl };
}
function chPieces(s) {
  var out = [];
  for (var i = 21; i <= 98; i++) { var p = s.b[i]; if (p && p !== CH_OFF) out.push({ sq: i, p: p, side: p > 0 ? 1 : -1, kind: Math.abs(p) }); }
  return out;
}
function chCount(s) { return chPieces(s).length; }
function chCopy(s) { var c = chFromFen(chToFen(s)); return c; }

if (typeof module !== "undefined") module.exports = {
  CH_P: CH_P, CH_N: CH_N, CH_B: CH_B, CH_R: CH_R, CH_Q: CH_Q, CH_K: CH_K, CH_VAL: CH_VAL, CH_POINTS: CH_POINTS, CH_NAMES: CH_NAMES, CH_MATE: CH_MATE, CH_START: CH_START,
  chSq: chSq, chFile: chFile, chRank: chRank, chName: chName, chIdx: chIdx, chNew: chNew, chFromFen: chFromFen, chStart: chStart, chToFen: chToFen, chKey: chKey,
  chAttacked: chAttacked, chInCheck: chInCheck, chAttacksFrom: chAttacksFrom, chLegal: chLegal, chMake: chMake, chUnmake: chUnmake, chPerft: chPerft,
  chStatus: chStatus, chSan: chSan, chParseSan: chParseSan, chMoveName: chMoveName, chFindMove: chFindMove, chEval: chEval, chSearch: chSearch, chScoreMoves: chScoreMoves,
  chMateIn: chMateIn, chMatingMoves: chMatingMoves, chWinProb: chWinProb, chGrade: chGrade, chMoveAccuracy: chMoveAccuracy, chJudge: chJudge, chRandomPosition: chRandomPosition,
  chMaterial: chMaterial, chPieces: chPieces, chCount: chCount, chCopy: chCopy, chKingSq: chKingSq, chInsufficient: chInsufficient
};
