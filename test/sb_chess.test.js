/* The chess engine: perft against the published counts, rules, SAN, search and grading. */
var C = require("../sb/chess.js");
var n = 0, fails = 0;
function ok(cond, msg) { n++; if (!cond) { fails++; console.log("  FAIL " + msg); } }
function eq(a, b, msg) { ok(a === b, msg + " (got " + a + ", want " + b + ")"); }

var t0 = Date.now();
/* perft: the standard positions */
var start = C.chStart();
eq(C.chPerft(start, 1), 20, "perft 1");
eq(C.chPerft(start, 2), 400, "perft 2");
eq(C.chPerft(start, 3), 8902, "perft 3");
eq(C.chPerft(start, 4), 197281, "perft 4");
var kiwi = C.chFromFen("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
eq(C.chPerft(kiwi, 1), 48, "kiwipete 1");
eq(C.chPerft(kiwi, 2), 2039, "kiwipete 2");
eq(C.chPerft(kiwi, 3), 97862, "kiwipete 3");
var p3 = C.chFromFen("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");
eq(C.chPerft(p3, 3), 2812, "position 3 depth 3");
eq(C.chPerft(p3, 4), 43238, "position 3 depth 4");
var p4 = C.chFromFen("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1");
eq(C.chPerft(p4, 3), 9467, "position 4 depth 3");
var p5 = C.chFromFen("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8");
eq(C.chPerft(p5, 3), 62379, "position 5 depth 3");

/* fen round trip */
eq(C.chToFen(C.chFromFen(C.CH_START)), C.CH_START, "fen round trip");
var k2 = "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1";
eq(C.chToFen(C.chFromFen(k2)), k2, "kiwipete round trip");

/* status */
eq(C.chStatus(C.chFromFen("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3")), "checkmate", "fool's mate");
eq(C.chStatus(C.chFromFen("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1")), "stalemate", "stalemate");
eq(C.chStatus(C.chFromFen("4k3/8/8/8/8/8/8/4K2N w - - 0 1")), "material", "insufficient material");
eq(C.chStatus(C.chFromFen("4k3/8/8/8/8/8/4Q3/4K3 b - - 0 1")), "check", "queen on the open file gives check");
eq(C.chStatus(C.chFromFen("4k3/8/8/8/8/8/3Q4/4K3 b - - 0 1")), "", "quiet position");
ok(C.chInCheck(C.chFromFen("4k3/8/8/8/8/8/3Q4/4K3 b - - 0 1")) === false, "not in check");
ok(C.chAttacked(C.chFromFen("4k3/8/8/8/8/8/4Q3/4K3 b - - 0 1"), C.chIdx("e8"), 1) === true, "queen attacks down the file");

/* SAN */
var s = C.chStart();
var m = C.chParseSan(s, "e4"); ok(m && C.chMoveName(m) === "e2e4", "parse e4");
C.chMake(s, m); m = C.chParseSan(s, "e5"); C.chMake(s, m);
m = C.chParseSan(s, "Nf3"); eq(C.chSan(s, m), "Nf3", "san Nf3"); C.chMake(s, m);
m = C.chParseSan(s, "Nc6"); C.chMake(s, m);
m = C.chParseSan(s, "Bb5"); C.chMake(s, m);
m = C.chParseSan(s, "a6"); C.chMake(s, m);
m = C.chParseSan(s, "Bxc6"); eq(C.chSan(s, m), "Bxc6", "san capture"); C.chMake(s, m);
m = C.chParseSan(s, "dxc6"); eq(C.chSan(s, m), "dxc6", "pawn capture san"); C.chMake(s, m);
m = C.chParseSan(s, "O-O"); ok(m && m.flag === "castle", "castle parses"); eq(C.chSan(s, m), "O-O", "castle san");
var dis = C.chFromFen("4k3/8/8/8/8/8/4K3/R6R w - - 0 1");
var ra = C.chParseSan(dis, "Rad1"); ok(ra && C.chMoveName(ra) === "a1d1", "disambiguation by file"); eq(C.chSan(dis, ra), "Rad1", "san disambiguates");
var promo = C.chFromFen("8/P6k/8/8/8/8/8/K7 w - - 0 1");
var pm = C.chParseSan(promo, "a8=Q"); ok(pm && pm.promo === C.CH_Q, "promotion parses"); eq(C.chSan(promo, pm), "a8=Q", "promotion san");
var mateSan = C.chFromFen("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1");
eq(C.chSan(mateSan, C.chParseSan(mateSan, "Ra8")), "Ra8#", "back rank mate gets #");

/* en passant */
var ep = C.chFromFen("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2");
var epm = C.chLegal(ep).filter(function (x) { return x.flag === "ep"; });
eq(epm.length, 1, "one en passant"); eq(C.chSan(ep, epm[0]), "exd6", "ep san");
C.chMake(ep, epm[0]); eq(C.chToFen(ep).split(" ")[0], "4k3/8/3P4/8/8/8/8/4K3", "ep removes the pawn"); C.chUnmake(ep);
eq(C.chToFen(ep), "4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2", "unmake restores ep");

/* attacks from */
var at = C.chFromFen("4k3/8/8/8/3N4/8/8/4K3 w - - 0 1");
eq(C.chAttacksFrom(at, C.chIdx("d4")).length, 8, "knight in the centre attacks 8");
eq(C.chAttacksFrom(C.chStart(), C.chIdx("b1")).length, 3, "knight on b1 reaches 3 squares");

/* search finds mate */
var m1 = C.chFromFen("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1");
var mm = C.chMatingMoves(m1); eq(mm.length, 1, "one mating move"); eq(C.chSan(m1, mm[0]), "Ra8#", "it is Ra8");
ok(C.chMateIn(m1, 1), "mate in 1 found");
var m2 = C.chFromFen("r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4");
var sm = C.chSearch(m2, 1); eq(C.chSan(m2, sm.move), "Qxf7#", "scholar's mate at depth 1");
var m2b = C.chFromFen("5r1k/6pp/8/4N3/8/1Q6/B7/7K w - - 0 1");
var r2 = C.chSearch(m2b, 3);
ok(r2.score >= C.CH_MATE - 3, "mate in 2 recognised (" + r2.score + ")");
eq(C.chSan(m2b, r2.move), "Qg8+", "mate in 2 starts Qg8+");
ok(C.chMateIn(m2b, 2) && C.chSan(m2b, C.chMateIn(m2b, 2)) === "Qg8+", "chMateIn finds the 2-mover");
ok(!C.chMateIn(m2b, 1), "no mate in 1 there");

/* search prefers winning material */
var hang = C.chFromFen("4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1");
eq(C.chSan(hang, C.chSearch(hang, 2).move), "Rxd5", "takes the free queen");

/* grading: the best move grades Best, hanging the queen grades Blunder */
var g = C.chJudge(hang, C.chParseSan(hang, "Rxd5"), 3);
eq(g.grade, "Best", "best move is Best");
var g2 = C.chJudge(hang, C.chParseSan(hang, "Rd4"), 3);
ok(g2.grade === "Blunder" || g2.grade === "Mistake", "giving up the queen is a blunder, got " + g2.grade);
ok(C.chWinProb(0) === 50, "even is 50%");
ok(C.chWinProb(300) > 70 && C.chWinProb(-300) < 30, "win prob moves with eval");

/* check suffix survives a draw status; mate scores do not poison the loss */
eq(C.chSan(C.chFromFen("4k3/8/8/8/8/8/3n4/4K3 b - - 0 1"), C.chParseSan(C.chFromFen("4k3/8/8/8/8/8/3n4/4K3 b - - 0 1"), "Nf3")), "Nf3+", "check suffix with insufficient material");
var fifty = C.chFromFen("4k3/8/8/8/8/8/8/R3K3 w - - 99 1");
eq(C.chSan(fifty, C.chParseSan(fifty, "Ra8")), "Ra8+", "check suffix at the fifty-move mark");
var missed = C.chJudge(m1, C.chParseSan(m1, "Ra2"), 3);
ok(missed.loss <= 4000, "missing a mate costs a bounded loss (" + missed.loss + ")"); eq(missed.grade, "Blunder", "and grades Blunder");
eq(C.chGrade(C.CH_MATE - 1, 200).loss, 1800, "loss clamps both sides to ±2000");
/* insufficient material */
ok(C.chInsufficient(C.chFromFen("4k3/8/8/8/8/8/3b4/2B1K3 w - - 0 1")), "KB vs KB, same colour, is dead");
ok(!C.chInsufficient(C.chFromFen("4k3/8/8/8/8/8/2b5/2B1K3 w - - 0 1")), "KB vs KB on opposite colours is not");
ok(!C.chInsufficient(C.chFromFen("4k3/8/8/8/8/8/8/1NN1K3 w - - 0 1")), "KNN is not dead");
ok(C.chInsufficient(C.chFromFen("4k3/8/8/8/8/8/8/B1B1K3 w - - 0 1")), "two bishops on one colour are dead");
ok(!C.chInsufficient(C.chFromFen("4k3/8/8/8/8/8/4P3/4K3 w - - 0 1")), "a pawn is enough");
/* repetition keys: the ep square counts only when the capture is legal */
var k1 = C.chStart(); C.chMake(k1, C.chParseSan(k1, "e4"));
ok(C.chKey(k1).split(" ")[3] === "-", "after 1.e4 the key has no ep square (" + C.chKey(k1) + ")");
eq(C.chKey(ep).split(" ")[3], "d6", "a legal en passant keeps the ep square in the key");
/* move accuracy: lichess's curve on the win% drop */
eq(C.chMoveAccuracy(0), 100, "no drop is 100");
ok(Math.abs(C.chMoveAccuracy(1) - 95.6) < 0.1, "1 point drop ≈ 95.6 (" + C.chMoveAccuracy(1).toFixed(2) + ")");
ok(Math.abs(C.chMoveAccuracy(2) - 91.4) < 0.1, "2 points ≈ 91.4"); ok(Math.abs(C.chMoveAccuracy(5) - 79.8) < 0.1, "5 points ≈ 79.8");
eq(C.chMoveAccuracy(500), 0, "clamped at 0");
/* win probability anchors the course quotes */
[[50, 54.6], [100, 59.1], [200, 67.6], [300, 75.1], [500, 86.3]].forEach(function (a) { ok(Math.abs(C.chWinProb(a[0]) - a[1]) < 0.1, "win% at +" + a[0] + " is " + a[1]); });

/* random positions are legal and material counts */
var rp = C.chRandomPosition(20, function () { return 0.37; });
ok(C.chLegal(rp).length > 0 || C.chStatus(rp), "random position is playable");
var mat = C.chMaterial(C.chStart()); eq(mat.white, 39, "start material 39"); eq(mat.black, 39, "black 39");

/* perft-level sanity on make/unmake: board unchanged after a deep perft */
var before = C.chToFen(kiwi); C.chPerft(kiwi, 2); eq(C.chToFen(kiwi), before, "perft leaves the board as it was");

console.log("chess: " + (n - fails) + "/" + n + " passed in " + ((Date.now() - t0) / 1000).toFixed(1) + "s");
if (fails) process.exit(1);
