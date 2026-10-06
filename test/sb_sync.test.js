/* The hub sync merge: commutative, idempotent, and a newer epoch wins. */
var vm = require("vm"), fs = require("fs"), path = require("path");
var ctx = { console: console, Math: Math, Date: Date, String: String, Object: Object, Array: Array, JSON: JSON, Number: Number, Infinity: Infinity, Error: Error, fetch: function () {} };
vm.createContext(ctx);
["../src/sync.js", "../sb/hubsync.js"].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(__dirname, f), "utf8").replace(/\nif \(typeof module[\s\S]*$/, ""), ctx, { filename: f }); });
var n = 0, fails = 0;
function ok(c, m) { n++; if (!c) { fails++; console.log("  FAIL " + m); } }
var A = { v: 1, hub: { epoch: 0, progress: { "sv:sv_v1": 1 }, skills: { "sv:w:sv_v1:0": { box: 2, last: 100, due: 500 }, "chess:chmat": { box: 1, last: 50 } }, plog: { "2026-10-01": { s: 600, n: 10, ok: 8, x: 40, g: true, by: { sv: { s: 600, n: 10, ok: 8, x: 40 } } } }, gstate: { goal: 60, goalAt: 1, sweeps: 1, seen: { a: 1 } }, chess: { d: [{ t: 1, q: 1, l: 0, g: "Best" }], games: [{ t: 1, result: "win" }], puzzle: 1050, pn: 3, ph: [] }, apply: { "sv:conv": { n: 1, sum: 0.8, best: 0.8, last: 1 } }, logs: [{ id: "l1", t: 1, c: "sv", min: 30 }], plan: { at: 10, cap: 60 }, placed: {} },
  poker: { epoch: 0, progress: { price: 1 }, skills: { potodds: { box: 2, last: 10 } }, plog: { "2026-10-01": { s: 100, n: 2, ok: 2 } }, devices: {} }, pokerGame: { goal: 60, goalAt: 1, sweeps: 2, seen: {} }, pokerSim: { set: { lineup: "mixed" }, career: { decisions: 10 }, level: { d: [1, 2] }, at: 5 },
  math340: { v: 2, cards: { c1: { box: 2, due: 100, seen: 2, lapses: 0 } }, practice: { g1: { attempts: 3, correct: 2, recent: [1, 1, 0], variants: {} } }, misses: [{ key: "m1", at: 1 }], exams: [{ at: 1, n: 5, correct: 4 }], sheet: ["c1"], activity: { "2026-10-01": 5 } }, devices: { d1: { name: "mac", seen: 1 } } };
var B = { v: 1, hub: { epoch: 0, progress: { "chess:ch_board": 1 }, skills: { "sv:w:sv_v1:0": { box: 3, last: 200, due: 900 }, "he:heletter": { box: 1, last: 70 } }, plog: { "2026-10-01": { s: 300, n: 5, ok: 5, x: 20, by: { chess: { s: 300, n: 5, ok: 5, x: 20 } } }, "2026-10-02": { s: 60, n: 1, ok: 1, x: 4 } }, gstate: { goal: 30, goalAt: 2, sweeps: 0, seen: { b: 2 } }, chess: { d: [], games: [{ t: 2, result: "loss" }], puzzle: 1100, pn: 5, ph: [] }, apply: { "sv:conv": { n: 2, sum: 1.5, best: 0.9, last: 2 } }, logs: [{ id: "l2", t: 2, c: "he", min: 20 }], plan: { at: 20, cap: 45 }, placed: { chess: 2 } },
  poker: { epoch: 0, progress: { outs: 1 }, skills: { potodds: { box: 3, last: 20 } }, plog: { "2026-10-01": { s: 50, n: 3, ok: 1 } }, devices: {} }, pokerGame: { goal: 120, goalAt: 2, sweeps: 1, seen: {} }, pokerSim: { set: { lineup: "tough" }, career: { decisions: 4 }, level: { d: [1] }, at: 9 },
  math340: { v: 2, cards: { c1: { box: 3, due: 200, seen: 3, lapses: 0 }, c2: { box: 1, due: 50, seen: 1, lapses: 1 } }, practice: { g1: { attempts: 5, correct: 3, recent: [1, 0, 1, 1, 0], variants: {} } }, misses: [{ key: "m2", at: 2 }], exams: [{ at: 2, n: 5, correct: 5 }], sheet: ["c2"], activity: { "2026-10-01": 3, "2026-10-02": 7 } }, devices: { d2: { name: "ipad", seen: 2 } } };
var AB = ctx.hsMergeAll(A, B), BA = ctx.hsMergeAll(B, A);
ok(ctx.hsCanon(AB) === ctx.hsCanon(BA), "merge is commutative");
ok(ctx.hsCanon(ctx.hsMergeAll(AB, A)) === ctx.hsCanon(AB) && ctx.hsCanon(ctx.hsMergeAll(AB, B)) === ctx.hsCanon(AB), "merge is idempotent");
ok(AB.hub.progress["sv:sv_v1"] && AB.hub.progress["chess:ch_board"], "progress is the union");
ok(AB.hub.skills["sv:w:sv_v1:0"].box === 3 && AB.hub.skills["chess:chmat"] && AB.hub.skills["he:heletter"], "skills: the most recently answered copy, union of keys");
ok(AB.hub.plog["2026-10-01"].s === 600 && AB.hub.plog["2026-10-01"].by.sv.x === 40 && AB.hub.plog["2026-10-01"].by.chess.x === 20 && AB.hub.plog["2026-10-01"].g === true && AB.hub.plog["2026-10-02"].x === 4, "day log: per-field max, per-course union, goal flag kept");
ok(AB.hub.gstate.goal === 30 && AB.hub.gstate.sweeps === 1 && AB.hub.gstate.seen.a && AB.hub.gstate.seen.b, "game state: newer goal, max counters, union of trophies");
ok(AB.hub.chess.games.length === 2 && AB.hub.chess.puzzle === 1100 && AB.hub.chess.d.length === 1, "chess: games union, puzzle rating from the more answered, longer move log");
ok(AB.hub.apply["sv:conv"].n === 2 && AB.hub.apply["sv:conv"].best === 0.9, "apply scores: max");
ok(AB.hub.logs.length === 2 && AB.hub.plan.cap === 45 && AB.hub.placed.chess === 2, "logs union, newer plan, placement max");
ok(AB.poker.progress.price && AB.poker.progress.outs && AB.poker.skills.potodds.box === 3, "poker merges through PokerPro's own merge");
ok(AB.pokerGame.goal === 120 && AB.pokerGame.sweeps === 2, "poker game: newer goal, max counters");
ok(AB.pokerSim.career.decisions === 10 && AB.pokerSim.set.lineup === "tough" && AB.pokerSim.level.d.length === 2, "poker table: fuller career, newer settings, longer level log");
ok(AB.math340.cards.c1.box === 3 && AB.math340.cards.c2 && AB.math340.practice.g1.attempts === 5 && AB.math340.misses.length === 2 && AB.math340.exams.length === 2 && AB.math340.sheet.length === 2 && AB.math340.activity["2026-10-01"] === 5 && AB.math340.activity["2026-10-02"] === 7, "math 340: later card, more attempts, unions, per-day max");
ok(AB.devices.d1 && AB.devices.d2, "devices union");
var W = JSON.parse(JSON.stringify(B)); W.hub.epoch = 5; W.hub.progress = {}; W.hub.skills = {};
var AW = ctx.hsMergeAll(A, W);
ok(Object.keys(AW.hub.progress).length === 0 && Object.keys(AW.hub.skills).length === 0, "a newer epoch (a wipe) wins outright");
ok(ctx.hsCanon(ctx.hsMergeAll(W, A)) === ctx.hsCanon(AW), "and commutes");
var E = ctx.hsMergeAll(null, A); ok(ctx.hsCanon(E) === ctx.hsCanon(ctx.hsMergeAll(A, ctx.hsEmpty())), "merging with nothing is the identity");
console.log("sync: " + (n - fails) + "/" + n + " passed");
if (fails) process.exit(1);
