/* The table engine: blinds, order, min-raises, side pots, splits,
   and a long random soak that checks chips are conserved. */
const fs = require("fs");
eval(["engine.js", "holdem.js"].map(f => fs.readFileSync(__dirname + "/../src/" + f, "utf8").replace(/\nif \(typeof module[\s\S]*$/, "")).join("\n"));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL " + m); } };
const seats = [0, 1, 2, 3, 4, 5].map(i => ({ name: "P" + i }));
const C = s => "23456789TJQKA".indexOf(s[0]) + 13 * "cdhs".indexOf(s[1]);
/* build a deck so that hole cards and board come out as asked: deck.pop() deals */
function rigged(t0, holes, board) {
  const used = new Set(), order = [];
  const btn = (t0.button + 1) % 6;
  for (let k = 0; k < 2; k++) for (let s = 1; s <= 6; s++) order.push(C(holes[(btn + s) % 6][k]));
  board.forEach(b => order.push(C(b)));
  order.forEach(c => used.add(c));
  const rest = []; for (let c = 0; c < 52; c++) if (!used.has(c)) rest.push(c);
  return rest.concat(order.slice().reverse());
}

/* blinds and order */
let t = hNewTable(seats); hStart(t, Math.random);
ok(t.button === 0 && hPos(t, 1) === "SB" && hPos(t, 2) === "BB" && hPos(t, 3) === "UTG" && hPos(t, 5) === "CO", "positions from the button");
ok(t.players[1].put === 0.5 && t.players[2].put === 1 && t.hand.toAct === 3, "blinds posted, UTG to act");
hAct(t, { type: "raise", to: 3 });
ok(hLegal(t).minTo === 5, "min re-raise after a raise to 3 is 5");
hAct(t, { type: "raise", to: 10 });
ok(hLegal(t).minTo === 17, "after 3 then 10, the min 4-bet is 17");
/* everyone folds to the 3-bettor */
while (!t.hand.over) hAct(t, { type: "fold" });
ok(t.hand.result.net[4] === 4.5 && t.hand.result.net[3] === -3, "uncontested pot goes to the last raiser: +4.5, opener -3");
ok(Math.abs(t.hand.result.net.reduce((a, b) => a + b, 0)) < 1e-9, "chips conserved");

/* folded to the big blind */
t = hNewTable(seats); hStart(t); while (!t.hand.over) hAct(t, { type: "fold" });
ok(t.hand.result.net[2] === 0.5 && t.hand.result.net[1] === -0.5, "walk: BB wins the small blind");

/* BB option after limps */
t = hNewTable(seats); hStart(t);
for (let k = 0; k < 4; k++) hAct(t, { type: "call" });     /* UTG, HJ, CO, BTN limp */
hAct(t, { type: "call" });                                   /* SB completes */
ok(t.hand.toAct === 2 && hLegal(t).canCheck, "big blind gets the option");
hAct(t, { type: "check" });
ok(t.hand.street === 1 && t.hand.board.length === 3 && t.hand.toAct === 1, "flop dealt, SB first to act");

/* side pots: a short all-in wins only the main pot */
t = hNewTable(seats);
const holes = { 0: ["2c", "7d"], 1: ["3c", "8d"], 2: ["4c", "9d"], 3: ["As", "Ah"], 4: ["Ks", "Kh"], 5: ["Qs", "Qh"] };
const deck = rigged(t, holes, ["2d", "5h", "9c", "Js", "3d"]);
hStart(t, null, deck);
t.players[3].stack = 20 - 0;                                /* UTG only has 20 */
ok(t.players[3].cards.map(c => c).join() === [C("As"), C("Ah")].join(), "rigged deal gives UTG aces");
hAct(t, { type: "raise", to: 20 });                          /* UTG all in for 20 */
ok(t.players[3].allIn, "UTG all in");
hAct(t, { type: "raise", to: 60 });                          /* HJ kings */
hAct(t, { type: "call" });                                   /* CO queens call 60 */
hAct(t, { type: "fold" }); hAct(t, { type: "fold" }); hAct(t, { type: "fold" });
/* flop: HJ and CO check it down */
while (!t.hand.over) hAct(t, { type: "check" });
const r = t.hand.result;
ok(r.showdown && r.pots.length === 2, "two pots: main and side");
ok(Math.abs(r.won[3] - (20 * 3 + 1.5)) < 1e-9, "aces win the main pot 61.5: " + r.won[3]);
ok(Math.abs(r.won[4] - 80) < 1e-9, "kings win the 80 side pot: " + r.won[4]);
ok(Math.abs(r.net.reduce((a, b) => a + b, 0)) < 1e-9, "side pots conserve chips");

/* split pot: the board plays */
t = hNewTable(seats);
const h2 = { 0: ["2c", "3d"], 1: ["2h", "3s"], 2: ["4c", "4d"], 3: ["5c", "6d"], 4: ["7c", "8d"], 5: ["9c", "Td"] };
hStart(t, null, rigged(t, h2, ["As", "Ks", "Qs", "Js", "Ts"]));
for (let k = 0; k < 4; k++) hAct(t, { type: "fold" });       /* UTG..BTN fold: only blinds */
hAct(t, { type: "call" }); hAct(t, { type: "check" });
while (!t.hand.over) hAct(t, { type: "check" });
ok(t.hand.result.won[1] === 1 && t.hand.result.won[2] === 1, "royal flush on board: blinds split");

/* a short all-in does not reopen the action for players who already acted */
t = hNewTable(seats); hStart(t);                              /* button 0: UTG 3, HJ 4, CO 5, BTN 0, SB 1, BB 2 */
t.players[5].stack = 4;                                       /* CO has 4bb */
hAct(t, { type: "raise", to: 3 });                            /* UTG opens */
hAct(t, { type: "fold" });                                    /* HJ */
let Lco = hLegal(t);
ok(Lco.seat === 5 && Lco.minTo === 4 && Lco.maxTo === 4, "CO's only raise is the 4bb jam (min would be 5)");
hAct(t, { type: "raise", to: 4 });                            /* CO jams short */
ok(t.players[5].allIn && t.hand.currentBet === 4 && t.hand.lastRaise === 2, "short jam: bet is 4, the full-raise increment stays 2");
let Lbtn = hLegal(t);
ok(Lbtn.seat === 0 && Lbtn.canRaise && Lbtn.minTo === 6, "BTN had not acted: may still raise, min 6");
hAct(t, { type: "call" });                                    /* BTN calls 4 */
hAct(t, { type: "fold" }); hAct(t, { type: "fold" });         /* blinds */
let Lutg = hLegal(t);
ok(Lutg.seat === 3 && Lutg.toCall === 1 && !Lutg.canRaise && !Lutg.canCheck, "UTG faces the short jam: call or fold only");
hAct(t, { type: "raise", to: 20 });                           /* a raise attempt becomes a call */
ok(t.players[3].put === 4 && t.players[3].stack === 96 && t.hand.street === 1 && t.hand.toAct === 3, "the capped raise is treated as a call and the flop comes");
ok(t.players.every(p => !p.capped), "the cap is lifted on the next street");
/* the same spot with a full raise reopens the action */
t = hNewTable(seats); hStart(t);
hAct(t, { type: "raise", to: 3 }); hAct(t, { type: "fold" });
hAct(t, { type: "raise", to: 6 });                            /* CO: a full raise */
hAct(t, { type: "call" }); hAct(t, { type: "fold" }); hAct(t, { type: "fold" });
Lutg = hLegal(t);
ok(Lutg.seat === 3 && Lutg.canRaise && Lutg.minTo === 9, "a full raise reopens UTG's action, min 9");
/* a full raise after a short jam reopens for everyone, including the capped player */
t = hNewTable(seats); hStart(t);
t.players[5].stack = 4;
hAct(t, { type: "raise", to: 3 }); hAct(t, { type: "fold" }); hAct(t, { type: "raise", to: 4 });
hAct(t, { type: "raise", to: 12 });                           /* BTN 3-bets over the jam */
hAct(t, { type: "fold" }); hAct(t, { type: "fold" });
Lutg = hLegal(t);
ok(Lutg.seat === 3 && Lutg.canRaise && Lutg.minTo === 20 && !t.players[3].capped, "a full raise behind the jam lifts the cap");

/* soak: random legal play for thousands of hands */
let hands = 0, maxActs = 0, bad = 0;
t = hNewTable(seats);
for (let n = 0; n < 3000; n++) {
  hStart(t);
  let acts = 0;
  while (!t.hand.over && acts < 500) {
    const L = hLegal(t), x = Math.random();
    let a;
    if (x < 0.25 && !L.canCheck) a = { type: "fold" };
    else if (x < 0.65) a = { type: L.canCheck ? "check" : "call" };
    else if (L.canRaise) a = { type: "raise", to: L.minTo + Math.random() * (L.maxTo - L.minTo) * (Math.random() < 0.2 ? 1 : 0.3) };
    else a = { type: L.canCheck ? "check" : "call" };
    hAct(t, a); acts++;
  }
  maxActs = Math.max(maxActs, acts);
  const sum = t.hand.result ? t.hand.result.net.reduce((a, b) => a + b, 0) : NaN;
  if (!t.hand.over || Math.abs(sum) > 1e-6 || t.players.some(p => p.stack < -1e-9)) bad++;
  hands++;
}
ok(!bad, "3000 random hands end, conserve chips and never go negative (" + bad + " bad, max " + maxActs + " actions)");

console.log("holdem: " + pass + " passed, " + fail + " failed");
if (fail) process.exit(1);
