/* ============================================================
   CHESS DRILLS and the Play model
   Generators that build positions and verify the answer with the
   engine before asking, so every question is sound: which squares
   a piece reaches, notation, material, forks, mates in one and two,
   the best move, the square rule, the opposition, openings, Elo
   and win probability. Also the Play game loop (engine levels,
   per-move grading) and the chess level: the quality of your
   recent moves, and a tactics rating that moves like Elo.
   ============================================================ */

var CH_UNI = { 1: "♙", 2: "♘", 3: "♗", 4: "♖", 5: "♕", 6: "♔", "-1": "♟", "-2": "♞", "-3": "♝", "-4": "♜", "-5": "♛", "-6": "♚" };
function chdRnd(ctx) { return (ctx && ctx.rnd) || Math.random; }
function chdPick(a, rnd) { return a[(rnd() * a.length) | 0]; }
function chdSide(s) { return s.side > 0 ? "White" : "Black"; }
function chdPos(s, opts) { return Object.assign({ fen: chToFen(s), flip: s.side < 0 }, opts || {}); }

/* a playable middlegame-ish position, not over, with the side to move not in a silly spot */
function chdPosition(ctx, minPlies, maxPlies, test) {
  var rnd = chdRnd(ctx);
  for (var tries = 0; tries < 60; tries++) {
    var plies = minPlies + ((rnd() * (maxPlies - minPlies + 1)) | 0);
    var s = chRandomPosition(plies, rnd);
    if (chStatus(s) === "checkmate" || chStatus(s) === "stalemate") continue;
    if (!test || test(s)) return s;
  }
  return null;
}

/* ---- curated tactical positions, verified by the tests ---- */
var CH_MATE1 = [
  ["6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1", "Ra8#", "Back-rank mate: the pawns box the king in."],
  ["r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", "Qxf7#", "Scholar's mate: queen and bishop on f7."],
  ["rn1q1bnr/ppp1kB1p/3p2p1/4N3/4P3/2N5/PPPP1PPP/R1BbK2R w KQ - 0 1", "Nd5#", "Légal's mate: White gave up the queen for this."],
  ["6k1/5ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1", "Rc8#", "The classic back rank."],
  ["r1b2k1r/ppp2ppp/8/8/8/8/PPP2PPP/R2Q1RK1 w - - 0 1", "Qd8#", "The queen lands on the open d-file; the bishop on c8 blocks the rook's defence."],
  ["7k/5Q2/5K2/8/8/8/8/8 w - - 0 1", "Qg7#", "King and queen: the queen mates next to the king, protected."],
  ["1k6/R7/1K6/8/8/8/8/7R w - - 0 1", "Rh8#", "The ladder: one rook holds the seventh, the other mates on the eighth."],
  ["3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", "Rxd8#", "Trade the rooks: the recapture is impossible and the capture is mate."],
  ["2k5/8/2K5/8/8/8/8/7R w - - 0 1", "Rh8#", "King and rook: opposition, then the check on the edge."]
];

var CH_MATE2 = [
  ["5r1k/6pp/8/4N3/8/1Q6/B7/7K w - - 0 1", "Qg8+", "Philidor's legacy, shortened: Qg8+ Rxg8, Nf7#."],
  ["5k2/8/4K3/8/8/8/8/7R w - - 0 1", "Rg1", "The rook takes the g-file, the king is driven to the edge, and the check on the eighth is mate: a waiting move wins."]
];

var CH_OPENINGS = [
  ["1.e4 e5 2.Nf3 Nc6 3.Bb5", "Ruy Lopez (Spanish)", "Bb5 pressures the knight that defends e5."],
  ["1.e4 e5 2.Nf3 Nc6 3.Bc4", "Italian Game", "Bc4 eyes f7, the weakest square in Black's camp."],
  ["1.e4 c5", "Sicilian Defence", "Black fights for d4 with a wing pawn and keeps the game unbalanced."],
  ["1.e4 e6", "French Defence", "Black prepares d5; the c8 bishop is the long-term problem."],
  ["1.e4 c6", "Caro-Kann Defence", "Like the French, but the bishop gets out before e6."],
  ["1.d4 d5 2.c4", "Queen's Gambit", "A pawn offered for the centre; taking it is not winning it."],
  ["1.d4 Nf6 2.c4 g6 3.Nc3 Bg7", "King's Indian Defence", "Black lets White build a centre and attacks it later."],
  ["1.d4 Nf6 2.c4 e6 3.Nc3 Bb4", "Nimzo-Indian Defence", "The pin on c3 fights for e4 without a pawn."],
  ["1.d4 d5 2.Bf4", "London System", "A quiet setup White can play against anything."],
  ["1.e4 e5 2.Nf3 Nf6", "Petrov's Defence", "Black counterattacks e4 instead of defending e5."],
  ["1.c4", "English Opening", "A flank opening that often transposes to d4 systems."],
  ["1.e4 e5 2.f4", "King's Gambit", "A pawn for an open f-file and a fast attack."],
  ["1.d4 d5 2.c4 c6", "Slav Defence", "Black defends d5 with the c-pawn, keeping the bishop free."],
  ["1.e4 d6 2.d4 Nf6 3.Nc3 g6", "Pirc Defence", "A kingside fianchetto against White's full centre."],
  ["1.Nf3 d5 2.g3", "Réti / King's Indian Attack", "White fianchettos and strikes the centre from the side."],
  ["1.e4 e5 2.Nf3 Nc6 3.d4", "Scotch Game", "White opens the centre at once."]
];

/* ---- generators ---- */
var CH_DRILLS = {};

CH_DRILLS.chmove = { name: "How the pieces move", target: 8, gen: function (ctx) {
  var rnd = chdRnd(ctx);
  var s = chdPosition(ctx, 0, 24) || chStart();
  var pieces = chPieces(s).filter(function (p) { return p.side === s.side && p.kind !== CH_K; });
  var legal = chLegal(s), choices = pieces.filter(function (p) { return legal.some(function (m) { return m.from === p.sq; }); });
  if (!choices.length) { s = chStart(); legal = chLegal(s); choices = chPieces(s).filter(function (p) { return p.side === 1 && legal.some(function (m) { return m.from === p.sq; }); }); }
  var p = chdPick(choices, rnd), targets = legal.filter(function (m) { return m.from === p.sq; }).map(function (m) { return chName(m.to); });
  var uniq = targets.filter(function (t, i) { return targets.indexOf(t) === i; });
  return { kind: "square", question: "Click a square the <b>" + CH_NAMES[p.kind] + "</b> on <b>" + chName(p.sq) + "</b> can move to.", answer: uniq[0], accept: uniq, target: 8,
    board: chdPos(s, { mark: [chName(p.sq)] }), explain: ["The " + CH_NAMES[p.kind] + " on " + chName(p.sq) + " can go to: " + uniq.join(", ") + ".", p.kind === CH_P ? "Pawns move forward one square (two from the start) and capture diagonally." : p.kind === CH_N ? "The knight jumps in an L: two squares one way, one square sideways, over anything." : p.kind === CH_B ? "The bishop slides diagonally until something is in the way." : p.kind === CH_R ? "The rook slides along ranks and files." : "The queen combines rook and bishop."] };
} };

CH_DRILLS.chnot = { name: "Notation", target: 5, gen: function (ctx) {
  var rnd = chdRnd(ctx), file = (rnd() * 8) | 0, rank = (rnd() * 8) | 0, name = chName(chSq(file, rank));
  if (rnd() < 0.5) return { kind: "square", question: "Click <b>" + name + "</b>.", answer: name, target: 5, board: { fen: "8/8/8/8/8/8/8/8 w - - 0 1", flip: rnd() < 0.3, coords: false }, explain: ["Files a to h run left to right from White's side; ranks 1 to 8 run up from White's side. " + name + " is file " + name[0] + ", rank " + name[1] + "."] };
  var others = []; while (others.length < 3) { var o = chName(chSq((rnd() * 8) | 0, (rnd() * 8) | 0)); if (o !== name && others.indexOf(o) < 0) others.push(o); }
  return { kind: "choice", question: "Which square is marked?", options: lgShuffle([name].concat(others), rnd), answer: name, target: 5, board: { fen: "8/8/8/8/8/8/8/8 w - - 0 1", mark: [name], coords: false }, explain: ["The marked square is " + name + "."] };
} };

CH_DRILLS.chcheck = { name: "Check", target: 7, gen: function (ctx) {
  var rnd = chdRnd(ctx);
  var s = chdPosition(ctx, 8, 40, function (x) { return rnd() < 0.5 ? chInCheck(x) : !chInCheck(x); }) || chStart();
  var inCheck = chInCheck(s), side = chdSide(s);
  if (inCheck && rnd() < 0.6) {
    var k = chKingSq(s, s.side), attackers = chPieces(s).filter(function (p) { return p.side === -s.side && chAttacksFrom(s, p.sq).indexOf(k) >= 0; });
    var a = attackers[0];
    var opts = lgShuffle([chName(a.sq)].concat(chPieces(s).filter(function (p) { return p.side === -s.side && p.sq !== a.sq; }).slice(0, 3).map(function (p) { return chName(p.sq); })), rnd);
    return { kind: "square", question: side + " is in check. Click the piece giving check.", answer: chName(a.sq), accept: attackers.map(function (p) { return chName(p.sq); }), target: 7, board: chdPos(s), explain: ["The " + CH_NAMES[a.kind] + " on " + chName(a.sq) + " attacks the king on " + chName(k) + ".", attackers.length > 1 ? "It is a double check: " + attackers.map(function (p) { return CH_NAMES[p.kind] + " on " + chName(p.sq); }).join(" and ") + ". Only a king move answers a double check." : "A check must be answered by moving the king, capturing the checker, or blocking the line."] };
  }
  return { kind: "choice", question: "Is <b>" + side + "</b> (to move) in check?", options: ["Yes", "No"], answer: inCheck ? "Yes" : "No", target: 7, board: chdPos(s), explain: [inCheck ? "Yes: an enemy piece attacks the king on " + chName(chKingSq(s, s.side)) + "." : "No: nothing attacks the king on " + chName(chKingSq(s, s.side)) + ". Look along every line to the king: diagonals, files, ranks, and the eight knight squares."] };
} };

CH_DRILLS.chmat = { name: "Counting material", target: 10, gen: function (ctx) {
  var s = chdPosition(ctx, 10, 60, function (x) { var m = chMaterial(x); return m.white !== m.black || chdRnd(ctx)() < 0.2; }) || chStart();
  var m = chMaterial(s), diff = m.white - m.black;
  return { kind: "num", question: "Count the material. <b>White minus Black</b>, on the 1/3/3/5/9 scale (negative if Black is ahead).", answer: diff, tol: 0, target: 10, board: chdPos(s, { flip: false }),
    explain: ["White: " + m.white + " · Black: " + m.black + " · difference " + (diff > 0 ? "+" : "") + diff + ".", "Pawn 1, knight 3, bishop 3, rook 5, queen 9. Count by piece type, not by scanning squares: queens first, then rooks, minors, pawns."] };
} };

CH_DRILLS.chvalue = { name: "Trades", target: 6, gen: function (ctx) {
  var rnd = chdRnd(ctx), kinds = [CH_P, CH_N, CH_B, CH_R, CH_Q];
  var give = [chdPick(kinds, rnd)], get = [chdPick(kinds, rnd)];
  if (rnd() < 0.4) give.push(chdPick(kinds, rnd)); if (rnd() < 0.3) get.push(chdPick(kinds, rnd));
  var vg = give.reduce(function (a, k) { return a + CH_POINTS[k]; }, 0), vt = get.reduce(function (a, k) { return a + CH_POINTS[k]; }, 0);
  var ans = vt > vg ? "Good for you" : vt < vg ? "Bad for you" : "Even";
  var names = function (ks) { return ks.map(function (k) { return CH_NAMES[k]; }).join(" and "); };
  return { kind: "choice", question: "You give up your <b>" + names(give) + "</b> and win their <b>" + names(get) + "</b>. Is the trade good, bad or even?", options: ["Good for you", "Bad for you", "Even"], answer: ans, target: 6,
    explain: ["You give " + vg + " points, you get " + vt + ": " + ans.toLowerCase() + ".", "The point scale is a guide. Two minor pieces usually beat a rook, a rook and pawn roughly equals two minors, and the bishop pair is worth about half a pawn extra."] };
} };

/* a knight fork on two pieces worth more than a knight (or king + anything), where the knight is safe */
function chdFindForks(s) {
  var out = [];
  chLegal(s).forEach(function (m) {
    if (Math.abs(m.piece) !== CH_N) return;
    chMake(s, m);
    var hit = chAttacksFrom(s, m.to).map(function (t) { return s.b[t]; }).filter(function (p) { return p && p !== CH_OFF && (p > 0) !== (s.b[m.to] > 0) && (Math.abs(p) === CH_K || CH_VAL[Math.abs(p)] > CH_VAL[CH_N]); });
    var safe = !chAttacked(s, m.to, s.side) || chAttacked(s, m.to, -s.side);
    chUnmake(s);
    if (hit.length >= 2 && safe) out.push({ m: m, hit: hit });
  });
  return out;
}
CH_DRILLS.chfork = { name: "Forks", target: 12, gen: function (ctx) {
  var rnd = chdRnd(ctx), best = null;
  for (var t = 0; t < 80 && !best; t++) {
    var s = chRandomPosition(10 + ((rnd() * 30) | 0), rnd);
    if (chStatus(s) === "checkmate" || chStatus(s) === "stalemate" || chInCheck(s)) continue;
    var f = chdFindForks(s);
    if (f.length) best = { s: s, forks: f };
  }
  if (!best) { var s2 = chFromFen("r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1"); best = { s: s2, forks: chdFindForks(s2) }; }
  if (!best.forks.length) return CH_DRILLS.chbest.gen(ctx);
  var S = best.s, F = best.forks, sans = F.map(function (f) { return chSan(S, f.m); });
  var f0 = F[0];
  return { kind: "move", question: chdSide(S) + " to move. Find the <b>knight fork</b>: one move that attacks two valuable pieces at once.", answer: sans[0], accept: sans, target: 12, board: chdPos(S),
    explain: ["<b>" + sans[0] + "</b> attacks " + f0.hit.map(function (p) { return "the " + CH_NAMES[Math.abs(p)]; }).join(" and ") + " at once" + (sans.length > 1 ? " (also: " + sans.slice(1).join(", ") + ")" : "") + ".", "A fork works because one piece can only move once: whatever is saved, the other is lost. Knights fork best because their attack cannot be blocked and they attack squares of the colour they do not stand on."] };
} };

CH_DRILLS.chmate1 = { name: "Mate in one", target: 15, gen: function (ctx) {
  var rnd = chdRnd(ctx), found = null;
  for (var t = 0; t < 120 && !found; t++) {
    var s = chRandomPosition(20 + ((rnd() * 50) | 0), rnd);
    var st = chStatus(s); if (st === "checkmate" || st === "stalemate") continue;
    var mm = chMatingMoves(s);
    if (mm.length && chCount(s) >= 6) found = { s: s, mm: mm };
  }
  var curated = false;
  if (!found) { var c = chdPick(CH_MATE1, rnd), sc = chFromFen(c[0]); found = { s: sc, mm: chMatingMoves(sc), note: c[2] }; curated = true; }
  var S = found.s, sans = found.mm.map(function (m) { return chSan(S, m); });
  return { kind: "move", question: chdSide(S) + " to move. <b>Mate in one.</b>", answer: sans[0], accept: sans, target: 15, board: chdPos(S), elo: curated ? 1000 : 1100,
    explain: ["<b>" + sans[0] + "</b>" + (sans.length > 1 ? " (also " + sans.slice(1).join(", ") + ")" : "") + "." + (found.note ? " " + found.note : ""), "Mate in one: look at every check first. A checking move that leaves the king no square, no block and no capture is the answer."] };
} };

CH_DRILLS.chmate2 = { name: "Mate in two", target: 40, gen: function (ctx) {
  var rnd = chdRnd(ctx), found = null, t0 = Date.now();
  for (var t = 0; t < 400 && !found && Date.now() - t0 < 1500; t++) {
    var s = chRandomPosition(20 + ((rnd() * 50) | 0), rnd);
    var st = chStatus(s); if (st === "checkmate" || st === "stalemate" || chCount(s) < 6) continue;
    if (chMatingMoves(s).length) continue;
    var r = chSearch(s, 3, 120000);
    if (r.move && r.score >= CH_MATE - 3) found = { s: s, note: "" };
  }
  if (!found) { var c = chdPick(CH_MATE2, rnd); found = { s: chFromFen(c[0]), note: c[2] }; }
  var S = found.s, sans = [];
  chLegal(S).forEach(function (mv) { chMake(S, mv); var rr = chSearch(S, 2, 150000); chUnmake(S); if (rr.score <= -CH_MATE + 3 && chLegal(S).length) sans.push(chSan(S, mv)); });
  if (!sans.length) { var m0 = chMateIn(S, 2); sans = [m0 ? chSan(S, m0) : chSan(S, chLegal(S)[0])]; }
  return { kind: "move", question: chdSide(S) + " to move. <b>Mate in two.</b> Play the first move.", answer: sans[0], accept: sans, target: 40, board: chdPos(S), elo: 1400,
    explain: ["<b>" + sans[0] + "</b>" + (sans.length > 1 ? " (also " + sans.slice(1).join(", ") + ")" : "") + "." + (found.note ? " " + found.note : " Every reply allows mate next move."), "Mate in two: find a forcing first move (check, capture or threat) after which every reply allows mate in one. Calculate the opponent's every option, not just the obvious one."] };
} };

CH_DRILLS.chbest = { name: "Best move", target: 30, gen: function (ctx) {
  var rnd = chdRnd(ctx), found = null;
  for (var t = 0; t < 40 && !found; t++) {
    var s = chRandomPosition(16 + ((rnd() * 40) | 0), rnd);
    var st = chStatus(s); if (st === "checkmate" || st === "stalemate") continue;
    var sc = chScoreMoves(s, 3, 60000);
    if (sc.length >= 4 && sc[0].score - sc[1].score >= 250 && sc[0].score < CH_MATE - 50 && Math.abs(sc[0].score) < 1500) found = { s: s, sc: sc };
  }
  if (!found) { var s2 = chFromFen("4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1"); found = { s: s2, sc: chScoreMoves(s2, 3, 60000) }; }
  var S = found.s, top = found.sc[0], second = found.sc[1];
  var accept = found.sc.filter(function (x) { return top.score - x.score <= 30; }).map(function (x) { return x.san; });
  return { kind: "move", question: chdSide(S) + " to move. <b>Find the best move.</b> There is one clearly best; the engine graded every option.", answer: top.san, accept: accept, target: 30, board: chdPos(S), elo: 1300,
    explain: ["<b>" + top.san + "</b>, worth about " + (top.score / 100).toFixed(1) + " pawns; the next best, " + second.san + ", is worth " + (second.score / 100).toFixed(1) + ".", "Method: list the checks, captures and threats for both sides first (CCT). The best move is usually among them, and the ones you did not consider are the ones that lose games."] };
} };

/* the square rule: can the defending king catch a passed pawn with no other pieces on the board? */
function chdSquareRule(pawnSq, kingSq, pawnSide, kingToMove) {
  var pf = chFile(pawnSq), pr = chRank(pawnSq), promoRank = pawnSide > 0 ? 7 : 0;
  var dist = Math.abs(promoRank - pr); if ((pawnSide > 0 && pr === 1) || (pawnSide < 0 && pr === 6)) dist -= 1;   /* the double step */
  var kd = Math.max(Math.abs(chFile(kingSq) - pf), Math.abs(chRank(kingSq) - promoRank));
  return kd <= dist + (kingToMove ? 1 : 0);
}
CH_DRILLS.chsquare = { name: "The square rule", target: 12, gen: function (ctx) {
  var rnd = chdRnd(ctx);
  for (var t = 0; t < 200; t++) {
    var pf = (rnd() * 8) | 0, pr = 1 + ((rnd() * 5) | 0), pawn = chSq(pf, pr);
    var kf = (rnd() * 8) | 0, kr = 3 + ((rnd() * 5) | 0), king = chSq(kf, kr);
    var wk = chSq((rnd() * 8) | 0, 0);
    if (king === pawn || wk === pawn || Math.abs(kf - pf) <= 1 && kr - pr <= 1 && kr >= pr || Math.max(Math.abs(chFile(wk) - kf), Math.abs(chRank(wk) - kr)) <= 1) continue;
    if (Math.abs(chFile(wk) - pf) <= 1 && chRank(wk) < pr) {} /* fine: white king behind is irrelevant to the rule */
    var s = chNew(); s.b[pawn] = CH_P; s.b[king] = -CH_K; s.b[wk] = CH_K;
    var blackToMove = rnd() < 0.5; s.side = blackToMove ? -1 : 1;
    if (chInCheck(s, -1) || chAttacked(s, wk, -1)) continue;
    if (Math.abs(chFile(wk) - pf) <= 1 && chRank(wk) > pr) continue;   /* the white king must not be able to help; keep it behind */
    var catches = chdSquareRule(pawn, king, 1, blackToMove);
    return { kind: "choice", question: "Only kings and this pawn. <b>" + (blackToMove ? "Black" : "White") + " to move.</b> Can the black king catch the pawn before it queens?", options: ["Yes, it catches it", "No, the pawn queens"], answer: catches ? "Yes, it catches it" : "No, the pawn queens", target: 12, board: { fen: chToFen(s), flip: false },
      explain: ["The pawn on " + chName(pawn) + " needs " + (Math.abs(7 - pr) - (pr === 1 ? 1 : 0)) + " moves to queen on " + chName(chSq(pf, 7)) + "; the king on " + chName(king) + " is " + Math.max(Math.abs(kf - pf), Math.abs(kr - 7)) + " king-moves from that square.", "Draw the square whose side runs from the pawn to its queening square. With the pawn to move, the king must already be inside it; with the king to move, stepping inside is enough. In numbers: king-moves to the queening square ≤ pawn-moves to queen, plus one if the king moves first. A pawn on its starting square counts as one rank further on because of the double step."] };
  }
  return CH_DRILLS.chvalue.gen(ctx);
} };

/* the opposition: kings on the same file or rank with one square between, and the other side to move */
CH_DRILLS.chopp = { name: "The opposition", target: 12, gen: function (ctx) {
  var rnd = chdRnd(ctx);
  for (var t = 0; t < 200; t++) {
    var wk = chSq(1 + ((rnd() * 6) | 0), 1 + ((rnd() * 4) | 0)), bk = chSq(chFile(wk) + (rnd() < 0.5 ? 0 : (rnd() < 0.5 ? -1 : 1)) , chRank(wk) + 3);
    if (!chOnBoard(bk)) continue;
    var s = chNew(); s.b[wk] = CH_K; s.b[bk] = -CH_K; s.side = 1;
    var moves = chLegal(s), opp = moves.filter(function (m) { return (chFile(m.to) === chFile(bk) && Math.abs(chRank(m.to) - chRank(bk)) === 2) || (chRank(m.to) === chRank(bk) && Math.abs(chFile(m.to) - chFile(bk)) === 2); });
    if (opp.length !== 1) continue;
    var all = moves.map(function (m) { return chName(m.to); });
    return { kind: "square", question: "Kings only, <b>White to move</b>. Click the square that takes the <b>opposition</b>.", answer: chName(opp[0].to), accept: [chName(opp[0].to)], target: 12, board: { fen: chToFen(s), flip: false },
      explain: ["<b>" + chName(opp[0].to) + "</b>: the kings face each other with one square between and Black must move, so Black must give way.", "Opposition = same file or rank, one square apart, the other side to move. In king-and-pawn endings it decides whether the king gets through. Legal king moves here: " + all.join(", ") + "."] };
  }
  return CH_DRILLS.chsquare.gen(ctx);
} };

CH_DRILLS.chelo = { name: "Elo", target: 20, gen: function (ctx) {
  var rnd = chdRnd(ctx), ra = 800 + 50 * ((rnd() * 30) | 0), rb = ra + 25 * (((rnd() * 25) | 0) - 12);
  var E = 1 / (1 + Math.pow(10, (rb - ra) / 400));
  if (rnd() < 0.5) return { kind: "num", question: "You are rated <b>" + ra + "</b>, your opponent <b>" + rb + "</b>. What is your expected score (0 to 1)? Within 0.02.", answer: Math.round(E * 100) / 100, tol: 0.02, target: 20, unit: "", explain: ["E = 1 / (1 + 10^((" + rb + " − " + ra + ") / 400)) = " + E.toFixed(3) + ".", "A 100-point gap is about 64/36; 200 points about 76/24; 400 points about 91/9."] };
  var K = 20, S = chdPick([1, 0.5, 0], rnd), d = K * (S - E);
  return { kind: "num", question: "You are rated <b>" + ra + "</b>, your opponent <b>" + rb + "</b>, K = 20. You " + (S === 1 ? "win" : S === 0.5 ? "draw" : "lose") + ". How many rating points do you gain (negative if you lose points)? Within 1.", answer: Math.round(d * 10) / 10, tol: 1, target: 20, explain: ["Expected score E = " + E.toFixed(3) + ". Change = K × (S − E) = 20 × (" + S + " − " + E.toFixed(3) + ") = " + d.toFixed(1) + ".", "You gain more for beating a stronger player and lose less for losing to one. That is the whole system."] };
} };

CH_DRILLS.chwp = { name: "Evals to odds", target: 15, gen: function (ctx) {
  var rnd = chdRnd(ctx), cp = 50 * (((rnd() * 24) | 0) - 12), wp = chWinProb(cp);
  return { kind: "num", question: "The engine says <b>" + (cp >= 0 ? "+" : "") + (cp / 100).toFixed(1) + "</b> for White. Roughly what are White's winning chances, in percent? Within 8.", answer: Math.round(wp), tol: 8, target: 15, unit: "%",
    explain: ["About " + Math.round(wp) + "%. The curve used by lichess and this app: 50 + 50 × (2 / (1 + e^(−0.00368 × cp)) − 1).", "+1.0 is about 65%, +2.0 about 80%, +3.0 about 90%. The curve flattens: going from +3 to +5 adds little, which is why a winning position does not need more material, it needs the win converted."] };
} };

CH_DRILLS.chopen = { name: "Openings", target: 10, gen: function (ctx) {
  var rnd = chdRnd(ctx), o = chdPick(CH_OPENINGS, rnd), others = lgShuffle(CH_OPENINGS.filter(function (x) { return x !== o; }).slice(), rnd).slice(0, 3);
  var s = chStart(); o[0].split(/\s+/).forEach(function (tok) { var san = tok.replace(/^\d+\./, ""); if (!san) return; var m = chParseSan(s, san); if (m) chMake(s, m); });
  return { kind: "choice", question: "<b>" + o[0] + "</b>. Which opening is this?", options: lgShuffle([o[1]].concat(others.map(function (x) { return x[1]; })), rnd), answer: o[1], target: 10, board: { fen: chToFen(s), flip: false }, explain: ["<b>" + o[1] + "</b>: " + o[2]] };
} };

/* ============================================================
   PLAY: a game against the engine, every move graded
   ============================================================ */
var CH_LEVELS_ENGINE = [
  { n: 1, name: "Beginner bot", about: "Looks one move ahead and blunders often.", depth: 1, noise: 350, elo: 600 },
  { n: 2, name: "Casual", about: "Two plies. Sees simple captures, misses tactics.", depth: 2, noise: 150, elo: 900 },
  { n: 3, name: "Club", about: "Three plies plus captures. Punishes hanging pieces.", depth: 3, noise: 40, elo: 1200 },
  { n: 4, name: "Strong club", about: "Four plies. Finds most two-move tactics.", depth: 4, noise: 0, elo: 1500 },
  { n: 5, name: "Expert", about: "Five plies, node-capped. Solid and sharp.", depth: 5, noise: 0, elo: 1800 },
  { n: 6, name: "Master", about: "Six plies within a budget. Hard.", depth: 6, noise: 0, elo: 2000 }
];
function chPlayNew(level, color, rnd) {
  return { s: chStart(), level: level, color: color, keys: [], moves: [], over: "", result: null, rnd: rnd || Math.random, grades: { Best: 0, Good: 0, Inaccuracy: 0, Mistake: 0, Blunder: 0 }, loss: 0, n: 0 };
}
function chPlayStatus(g) {
  var st = chStatus(g.s, g.keys);
  if (st === "checkmate") { g.over = "checkmate"; g.result = g.s.side === g.color ? "loss" : "win"; }
  else if (st === "stalemate" || st === "fifty" || st === "material" || st === "repetition") { g.over = st; g.result = "draw"; }
  return g.over;
}
function chEngineMove(g) {
  var L = CH_LEVELS_ENGINE[g.level - 1] || CH_LEVELS_ENGINE[2];
  var ms = chLegal(g.s); if (!ms.length) return null;
  var pick;
  if (L.noise) {
    var sc = chScoreMoves(g.s, Math.max(1, L.depth), 40000);
    var top = sc.filter(function (x) { return sc[0].score - x.score <= L.noise; });
    pick = top[(g.rnd() * top.length) | 0].move;
    if (sc[0].score >= CH_MATE - 50) pick = sc[0].move;
  } else {
    var r = chSearch(g.s, L.depth, L.depth >= 6 ? 1500000 : L.depth >= 5 ? 900000 : 400000);
    pick = r.move || ms[0];
  }
  var san = chSan(g.s, pick);
  chMake(g.s, pick); g.keys.push(chKey(g.s));
  g.moves.push({ san: san, who: "engine" });
  chPlayStatus(g);
  return pick;
}
/* the hero's move: judge it at depth 4, record the grade, make it */
function chHeroMove(g, m, depth) {
  var j = chJudge(g.s, m, depth || 4, 300000);
  var san = chSan(g.s, m);
  chMake(g.s, m); g.keys.push(chKey(g.s));
  g.moves.push({ san: san, who: "hero", grade: j.grade, loss: j.loss, best: j.bestSan, drop: j.drop, quality: j.quality });
  g.grades[j.grade]++; g.loss += j.loss; g.n++;
  chPlayStatus(g);
  return j;
}
function chAccuracy(g) {
  if (!g.n) return null;
  var acpl = g.loss / g.n;
  return { acpl: acpl, accuracy: Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * acpl) - 3.1669)) };
}

/* ---- the chess level: your recent moves and your tactics rating ---- */
var CHL_LEVELS = [
  { min: 0, name: "Beginner", about: "Pieces hang, mates are missed. Drill the tactics and play the bot at level 1." },
  { min: 35, name: "Novice", about: "The rules are automatic; one-move tactics still slip by." },
  { min: 50, name: "Club player", about: "Most moves are sound. Two-move tactics and endgame technique are the gap." },
  { min: 62, name: "Intermediate", about: "Few blunders. Strategy and calculation depth decide games now." },
  { min: 72, name: "Advanced", about: "Strong, consistent play. Mistakes are positional, not tactical." },
  { min: 80, name: "Expert", about: "Nearly every move within a whisker of the engine's choice at this depth." },
  { min: 88, name: "Master", about: "The engine rarely finds a clearly better move." },
  { min: 94, name: "Grandmaster-like", about: "At this depth, the engine and you agree." }
];
function chlNew() { return { d: [], games: [], puzzle: 1000, pn: 0, ph: [] }; }
function chlAddGame(L, g, now) {
  g.moves.filter(function (m) { return m.who === "hero"; }).forEach(function (m) { L.d.push({ t: now, q: m.quality, l: m.loss, g: m.grade }); });
  if (L.d.length > 1500) L.d.splice(0, L.d.length - 1500);
  var acc = chAccuracy(g);
  L.games.unshift({ t: now, level: g.level, color: g.color, result: g.result, over: g.over, n: g.n, acc: acc ? Math.round(acc.accuracy) : null, acpl: acc ? Math.round(acc.acpl) : null, grades: g.grades, moves: g.moves.map(function (m) { return m.san; }) });
  if (L.games.length > 60) L.games.length = 60;
  return L;
}
function chlRate(ds) { if (!ds.length) return null; var k = 6, p = 0.6, s = ds.reduce(function (a, d) { return a + d.q; }, 0); return 100 * (s + k * p) / (ds.length + k); }
function chlLevel(r) { var Lv = CHL_LEVELS[0]; for (var i = 0; i < CHL_LEVELS.length; i++) if (r >= CHL_LEVELS[i].min) Lv = CHL_LEVELS[i]; var ix = CHL_LEVELS.indexOf(Lv), nx = CHL_LEVELS[ix + 1] || null; return { name: Lv.name, about: Lv.about, index: ix, next: nx, toNext: nx ? (r - Lv.min) / (nx.min - Lv.min) : 1 }; }
function chlSummary(L) {
  var d = (L && L.d) || [], recent = d.slice(-100), before = d.slice(-200, -100);
  var r = chlRate(recent), r0 = before.length >= 20 ? chlRate(before) : null;
  var wins = (L.games || []).filter(function (g) { return g.result === "win"; }).length;
  return { n: d.length, placed: d.length >= 20, left: Math.max(0, 20 - d.length), rating: r, prev: r0, delta: r != null && r0 != null ? r - r0 : null, level: r != null ? chlLevel(r) : null, acpl: recent.length ? recent.reduce(function (a, x) { return a + x.l; }, 0) / recent.length : null, games: (L.games || []).length, wins: wins, puzzle: L.puzzle || 1000, puzzles: L.pn || 0, bestLevelBeaten: (L.games || []).filter(function (g) { return g.result === "win"; }).reduce(function (a, g) { return Math.max(a, g.level); }, 0) };
}
/* a puzzle answered: Elo against the puzzle's rating, K shrinking as you settle */
function chlPuzzle(L, elo, ok) {
  var E = 1 / (1 + Math.pow(10, (elo - L.puzzle) / 400)), K = L.pn < 20 ? 48 : L.pn < 60 ? 32 : 20;
  L.puzzle = Math.round(L.puzzle + K * ((ok ? 1 : 0) - E));
  L.pn = (L.pn || 0) + 1;
  L.ph = L.ph || []; L.ph.push(L.puzzle); if (L.ph.length > 200) L.ph.shift();
  return L.puzzle;
}

if (typeof module !== "undefined") module.exports = {
  CH_DRILLS: CH_DRILLS, CH_MATE1: CH_MATE1, CH_MATE2: CH_MATE2, CH_OPENINGS: CH_OPENINGS, CH_UNI: CH_UNI, chdSquareRule: chdSquareRule, chdFindForks: chdFindForks,
  CH_LEVELS_ENGINE: CH_LEVELS_ENGINE, chPlayNew: chPlayNew, chEngineMove: chEngineMove, chHeroMove: chHeroMove, chPlayStatus: chPlayStatus, chAccuracy: chAccuracy,
  CHL_LEVELS: CHL_LEVELS, chlNew: chlNew, chlAddGame: chlAddGame, chlSummary: chlSummary, chlPuzzle: chlPuzzle, chlLevel: chlLevel
};
