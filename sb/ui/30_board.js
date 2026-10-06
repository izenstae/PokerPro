/* ============================================================
   UI 3: the chess board, Play against the engine, tactics rush
   ============================================================ */
function boardWidget(fen, opts) {
  opts = opts || {};
  var s = chFromFen(fen), box = el("div", "board" + (opts.size ? " " + opts.size : "") + (opts.coords === false ? " nocoords" : ""));
  var flip = !!opts.flip, sel = null, legal = [], marks = opts.mark || [], last = opts.last || [];
  var kingInCheck = chInCheck(s) ? chKingSq(s, s.side) : -1;
  function render() {
    box.innerHTML = "";
    for (var r = 0; r < 8; r++) for (var f = 0; f < 8; f++) {
      var rank = flip ? r : 7 - r, file = flip ? 7 - f : f, sq = chSq(file, rank), p = s.b[sq], name = chName(sq);
      var d = el("div", "sq " + ((rank + file) % 2 ? "l" : "d"));
      d.dataset.sq = name;
      if (p) d.appendChild(el("span", "p" + (p > 0 ? " w" : ""), CH_UNI[p]));
      if (marks.indexOf(name) >= 0) d.classList.add("mark"); if (last.indexOf(name) >= 0) d.classList.add("last");
      if (sel === sq) d.classList.add("sel");
      if (legal.some(function (m) { return m.to === sq; })) { d.classList.add("hint"); if (s.b[sq]) d.classList.add("cap"); }
      if (sq === kingInCheck) d.classList.add("check");
      if (file === (flip ? 7 : 0)) d.appendChild(el("span", "co", String(rank + 1)));
      if (rank === (flip ? 7 : 0)) d.appendChild(el("span", "cf", CH_FILES[file]));
      box.appendChild(d);
    }
  }
  box.onclick = function (e) {
    if (!opts.interactive) return;
    var t = e.target.closest(".sq"); if (!t) return;
    var sq = chIdx(t.dataset.sq);
    if (opts.onSquare) { opts.onSquare(t.dataset.sq); return; }
    if (!opts.onMove) return;
    var p = s.b[sq];
    if (sel != null) {
      var m = chFindMove(s, sel, sq, opts.promo || CH_Q);
      if (m) { sel = null; legal = []; opts.onMove(m, s); render(); return; }
    }
    if (p && (p > 0) === (s.side > 0)) { sel = sq; legal = chLegal(s).filter(function (m) { return m.from === sq; }); }
    else { sel = null; legal = []; }
    render();
  };
  box.set = function (newFen, o) { s = chFromFen(newFen); sel = null; legal = []; if (o && o.last) last = o.last; if (o && o.mark) marks = o.mark; kingInCheck = chInCheck(s) ? chKingSq(s, s.side) : -1; render(); };
  render();
  return box;
}

/* ---- Play ---- */
var game = null, gameBoard = null, gameThinking = false;
function drawPlay(host) {
  host.innerHTML = "";
  var c = COURSES.chess;
  if (!game) {
    var p = el("div", "panel");
    p.innerHTML = '<div class="ph"><h3>New game</h3><span>every move graded against the engine</span></div>' +
      '<p class="pnote">Pick a level and a colour. After each of your moves the engine says whether it was Best, Good, an Inaccuracy, a Mistake or a Blunder, and what it would have played; the game feeds your chess level. Start at level 1 and move up when you win two in a row.</p>';
    var lv = el("div", "chips"); lv.style.margin = "12px 0";
    var chosen = { level: HUB.gstate.chessLevel || 1, color: 1 };
    CH_LEVELS_ENGINE.forEach(function (L) { var b = el("button", "chip" + (chosen.level === L.n ? " on" : ""), L.n + " · " + esc(L.name) + " <small>~" + L.elo + "</small>"); b.type = "button"; b.title = L.about; b.onclick = function () { chosen.level = L.n; lv.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); }; lv.appendChild(b); });
    p.appendChild(lv);
    var col = el("div", "chips"); ["White", "Black"].forEach(function (nm, i) { var b = el("button", "chip" + (i === 0 ? " on" : ""), nm); b.type = "button"; b.onclick = function () { chosen.color = i === 0 ? 1 : -1; col.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); }; col.appendChild(b); });
    p.appendChild(col);
    var row = el("div", "row"); row.style.marginTop = "14px";
    row.appendChild(btn("Start the game", "go", function () { HUB.gstate.chessLevel = chosen.level; game = chPlayNew(chosen.level, chosen.color); saveSoon(); drawPlay(host); }));
    p.appendChild(row);
    host.appendChild(p);
    var S = HUB.chess ? chlSummary(HUB.chess) : null;
    if (S && S.games) {
      var h = el("div", "panel"); h.style.marginTop = "16px";
      h.innerHTML = '<div class="ph"><h3>Recent games</h3><a href="#/c/chess/level">Your level ›</a></div><div class="clist">' + HUB.chess.games.slice(0, 8).map(function (g) { return '<div><span>' + (g.result === "win" ? "Won" : g.result === "loss" ? "Lost" : "Drew") + ' vs level ' + g.level + ' as ' + (g.color > 0 ? "White" : "Black") + '<small>' + g.n + ' moves · accuracy ' + (g.acc != null ? g.acc + "%" : "–") + ' · ' + fmtAgo(g.t) + '</small></span><b>' + Object.keys(g.grades).map(function (k) { return g.grades[k] ? g.grades[k] + " " + k.toLowerCase() : ""; }).filter(Boolean).join(", ") + '</b></div>'; }).join("") + '</div>';
      host.appendChild(h);
    }
    return;
  }
  var grid = el("div", "playgrid"), left = el("div"), right = el("div");
  gameBoard = boardWidget(chToFen(game.s), { flip: game.color < 0, interactive: true, onMove: function (m) { heroPlays(m); } });
  left.appendChild(gameBoard);
  var fb = el("div", "panel tight"); fb.id = "pFeed"; fb.style.marginTop = "12px"; left.appendChild(fb);
  var side = el("div", "panel"); side.id = "pSide"; right.appendChild(side);
  var mv = el("div", "panel"); mv.id = "pMoves"; mv.style.marginTop = "12px"; right.appendChild(mv);
  grid.appendChild(left); grid.appendChild(right); host.appendChild(grid);
  drawPlaySide(); drawPlayFeed(null);
  if (!game.over && game.s.side !== game.color) engineTurn();
}
function heroPlays(m) {
  if (!game || game.over || gameThinking || game.s.side !== game.color) return;
  var j = chHeroMove(game, m, 4);
  gameBoard.set(chToFen(game.s), { last: [chName(m.from), chName(m.to)] });
  drawPlayFeed(j); drawPlaySide();
  if (game.over) { finishGame(); return; }
  engineTurn();
}
function engineTurn() {
  gameThinking = true; $("pFeed") && ($("pFeed").dataset.thinking = "1");
  setTimeout(function () {
    if (!game) return;
    var mv = chEngineMove(game); gameThinking = false;
    if (mv) gameBoard.set(chToFen(game.s), { last: [chName(mv.from), chName(mv.to)] });
    drawPlaySide();
    if (game.over) finishGame();
  }, 250);
}
function drawPlayFeed(j) {
  var f = $("pFeed"); if (!f) return;
  if (!j) { f.innerHTML = '<div class="ph"><h3>Coach</h3><span>' + (game.s.side === game.color ? "your move" : "engine thinking") + '</span></div><p class="pnote">' + (game.moves.length ? "Play on." : "Checks, captures, threats, for both sides, before every move.") + '</p>'; return; }
  f.innerHTML = '<div class="ph"><h3>Coach</h3><span class="tag ' + (j.grade === "Best" ? "green" : j.grade === "Good" ? "" : j.grade === "Inaccuracy" ? "gold" : "red") + '">' + j.grade + '</span></div>' +
    '<p class="pnote">' + (j.grade === "Best" ? "That is the engine's choice too." : "The engine prefers <b>" + esc(j.bestSan) + "</b>" + (j.loss ? ": your move gives up about " + (j.loss / 100).toFixed(1) + " pawns (" + Math.round(j.drop * 100) + " points of winning chance)." : ".")) + '</p>';
}
function drawPlaySide() {
  var s = $("pSide"), m = $("pMoves"); if (!s || !game) return;
  var acc = chAccuracy(game), L = CH_LEVELS_ENGINE[game.level - 1], st = chStatus(game.s, game.keys);
  s.innerHTML = '<div class="ph"><h3>Game</h3><span>level ' + game.level + ' · ' + esc(L.name) + '</span></div>' +
    '<div class="stats"><div class="stat"><b>' + game.n + '</b><span>your moves</span></div><div class="stat"><b class="' + (acc && acc.accuracy >= 85 ? "hi" : acc && acc.accuracy >= 65 ? "mid" : "lo") + '">' + (acc ? Math.round(acc.accuracy) + "%" : "–") + '</b><span>accuracy</span></div><div class="stat"><b>' + (acc ? Math.round(acc.acpl) : "–") + '</b><span>avg cp loss</span></div></div>' +
    '<div class="gradebar">' + ["Best", "Good", "Inaccuracy", "Mistake", "Blunder"].map(function (k) { return '<i class="' + k + '" style="flex:' + (game.grades[k] || 0) + '" title="' + k + ': ' + game.grades[k] + '"></i>'; }).join("") + '</div>' +
    '<p class="pnote">' + (game.over ? "Game over: " + (game.result === "win" ? "you won" : game.result === "loss" ? "you lost" : "a draw") + " (" + game.over + ")." : st === "check" ? "Check!" : (game.s.side === game.color ? "Your move." : "Engine to move.")) + '</p>';
  var row = el("div", "row"); row.style.marginTop = "8px";
  if (!game.over) row.appendChild(btn("Resign", "ghost sm", function () { game.over = "resigned"; game.result = "loss"; finishGame(); }));
  else row.appendChild(btn("New game", "go sm", function () { game = null; drawPlay($("applyHost")); }));
  row.appendChild(btn("Flip board", "ghost sm", function () { gameBoard = boardWidget(chToFen(game.s), { flip: !gameBoard.classList.contains("flipped"), interactive: true, onMove: heroPlays }); var old = $("applyHost").querySelector(".board"); old.replaceWith(gameBoard); gameBoard.classList.toggle("flipped"); }));
  s.appendChild(row);
  var ms = game.moves, html = "";
  for (var i = 0; i < ms.length; i += 2) { html += '<span class="mn">' + (i / 2 + 1) + '.</span>' + mvHtml(ms[i]) + (ms[i + 1] ? mvHtml(ms[i + 1]) : ""); }
  m.innerHTML = '<div class="ph"><h3>Moves</h3><span>your moves coloured by grade</span></div><div class="moves">' + (html || "<span class='mn'>no moves yet</span>") + '</div>';
  m.querySelector(".moves").scrollTop = 1e6;
}
function mvHtml(m) { return '<span class="mv ' + (m.grade || "") + '" title="' + (m.grade ? m.grade + (m.best && m.grade !== "Best" ? ", best " + m.best : "") : "") + '">' + esc(m.san) + '</span>'; }
function finishGame() {
  if (!game) return;
  HUB.chess = HUB.chess || chlNew();
  chlAddGame(HUB.chess, game, Date.now());
  var acc = chAccuracy(game), xp = Math.round((acc ? acc.accuracy : 50) / 5) + (game.result === "win" ? 30 : game.result === "draw" ? 10 : 0);
  gmGain("chess", xp, game.result === "win" ? "Won the game" : game.result === "draw" ? "A draw" : "Game played");
  logDay("chess", Math.max(60, game.n * 20), 0, 0);
  saveSoon(); gmCheckTrophies(); drawPlaySide();
  toast("<b>Game over.</b> " + (game.result === "win" ? "You won." : game.result === "loss" ? "You lost." : "A draw.") + " Accuracy " + (acc ? Math.round(acc.accuracy) + "%" : "–") + ". Your level is updated.", "goal");
}

/* ---- tactics rush: ten rated puzzles, the tactics rating moves ---- */
function startRush() {
  var pool = ["chess:chmate1", "chess:chfork", "chess:chbest", "chess:chmate2", "chess:chmate1", "chess:chfork", "chess:chbest", "chess:chmate1", "chess:chfork", "chess:chmate2"];
  sess = { kind: "rush", course: "chess", pool: pool, ctx: { last: null, retry: [], idle: 1 }, n: 0, ok: 0, secs: 0, cap: 10, from: {}, seq: pool.slice() };
  cp = null; location.hash = "#/drill";
}
