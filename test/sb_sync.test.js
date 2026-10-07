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
function same(x, y) { return ctx.hsCanon(x) === ctx.hsCanon(y); }
function hub(h) { return { v: 1, hub: Object.assign({ epoch: 0 }, h) }; }

/* trophies: the first sighting survives, whichever side syncs first */
var T1 = hub({ gstate: { seen: { a: 500, b: 100 } } }), T2 = hub({ gstate: { seen: { a: 300, c: 900 } } });
var TM = ctx.hsMergeAll(T1, T2);
ok(TM.hub.gstate.seen.a === 300 && TM.hub.gstate.seen.b === 100 && TM.hub.gstate.seen.c === 900, "trophy seen: the earliest time, union of keys");
ok(same(TM, ctx.hsMergeAll(T2, T1)), "and commutes");

/* the plan ticks of today survive a sync with a device that has none, in either order */
var local = hub({ gstate: { planDone: { "2026-10-06": { "sv:review": true, "poker:lesson": true }, "2026-10-05": { "he:review": true } }, planLast: "2026-10-06", conf: false, primed: true, planStreak: 3 } });
var remote = hub({ gstate: { planDone: { "2026-10-06": { "chess:apply": true }, "2026-09-20": { "sv:review": true } }, planLast: "2026-10-05", conf: true, planStreak: 2 } });
var LR = ctx.hsMergeAll(local, remote), RL = ctx.hsMergeAll(remote, local);
ok(same(LR, RL), "gstate plan fields merge commutatively");
var pd = LR.hub.gstate.planDone["2026-10-06"];
ok(pd && pd["sv:review"] && pd["poker:lesson"] && pd["chess:apply"], "today's ticks are the union of both devices: " + JSON.stringify(pd));
ok(LR.hub.gstate.planDone["2026-10-05"]["he:review"] && LR.hub.gstate.planDone["2026-09-20"], "other days are kept as sets");
ok(LR.hub.gstate.planLast === "2026-10-06", "planLast is the later day");
ok(LR.hub.gstate.planStreak === 3, "the streak is the max");
ok(LR.hub.gstate.primed === true, "primed is OR");
ok(LR.hub.gstate.conf === true && RL.hub.gstate.conf === true, "with nothing to date it, conf is OR");
var cA = hub({ gstate: { conf: false, confAt: 20 } }), cB = hub({ gstate: { conf: true, confAt: 10 } });
ok(ctx.hsMergeAll(cA, cB).hub.gstate.conf === false && ctx.hsMergeAll(cB, cA).hub.gstate.conf === false && ctx.hsMergeAll(cB, cA).hub.gstate.confAt === 20, "with a stamp the newer conf wins both ways");
var sA = hub({ gstate: { conf: false, goalAt: 50 }, plan: { at: 900 } }), sB = hub({ gstate: { conf: true, goalAt: 60 }, plan: { at: 100 } });
ok(ctx.hsMergeAll(sA, sB).hub.gstate.conf === false && ctx.hsMergeAll(sB, sA).hub.gstate.conf === false, "without a conf stamp the side whose settings moved later (plan.at) decides, both ways");
var many = {}; for (var di = 1; di <= 12; di++) many["2026-09-" + (di < 10 ? "0" : "") + di] = { "sv:review": true };
var PM = ctx.hsMergePlanDone(many, { "2026-10-06": { "a:b": true } });
ok(Object.keys(PM).length === 8 && PM["2026-10-06"] && !PM["2026-09-01"], "only the newest eight days of ticks are kept");
ok(same(PM, ctx.hsMergePlanDone({ "2026-10-06": { "a:b": true } }, many)), "in either order");
var sc1 = hub({ gstate: { schoolClear: 2 } }), sc2 = hub({ gstate: { schoolClear: 1 } });
ok(ctx.hsMergeAll(sc1, sc2).hub.gstate.schoolClear === 2 && ctx.hsMergeAll(sc2, sc1).hub.gstate.schoolClear === 2, "schoolClear is a counter: max");
ok(same(ctx.hsMergeAll(LR, local), LR) && same(ctx.hsMergeAll(LR, remote), LR), "the plan merge is idempotent");

/* skills: a graduated skill (box 1, never answered) is never demoted by a fresh copy */
var grad = { box: 1, due: 5000, run: 0, n: 0, ok: 0, lapses: 0, last: 0, secs: 0, hist: [] }, fresh = { box: 0, due: 0, run: 0, n: 0, ok: 0, lapses: 0, last: 0, secs: 0, hist: [] };
ok(ctx.hsNewerSkill(grad, fresh).box === 1 && ctx.hsNewerSkill(fresh, grad).box === 1, "graduated beats fresh in both orders");
var G1 = hub({ skills: { "sv:w:1": grad } }), G2 = hub({ skills: { "sv:w:1": fresh } });
ok(ctx.hsMergeAll(G1, G2).hub.skills["sv:w:1"].box === 1 && ctx.hsMergeAll(G2, G1).hub.skills["sv:w:1"].box === 1, "through the whole merge too");
var crammed = { box: 1, due: 9000, n: 3, ok: 2, last: 700 };
ok(ctx.hsNewerSkill(grad, crammed) === crammed && ctx.hsNewerSkill(crammed, grad) === crammed, "a graduated skill yields to an answered copy of the same box");
var wrongOnce = { box: 0, due: 100, n: 1, ok: 0, last: 700 };
ok(ctx.hsNewerSkill(grad, wrongOnce).box === 1 && ctx.hsNewerSkill(wrongOnce, grad).box === 1, "but an answered box-0 copy never demotes a graduated one");
var t1 = { box: 2, last: 500, n: 4, ok: 3 }, t2 = { box: 3, last: 500, n: 4, ok: 3 };
ok(ctx.hsNewerSkill(t1, t2) === t2 && ctx.hsNewerSkill(t2, t1) === t2, "a tie on last goes to the higher box");
var u1 = { box: 2, last: 500, n: 4, ok: 3 }, u2 = { box: 2, last: 500, n: 6, ok: 3 };
ok(ctx.hsNewerSkill(u1, u2) === u2 && ctx.hsNewerSkill(u2, u1) === u2, "then to the more answered");
var v1 = { box: 2, last: 900, n: 4, ok: 3 }, v2 = { box: 3, last: 500, n: 9, ok: 9 };
ok(ctx.hsNewerSkill(v1, v2) === v1 && ctx.hsNewerSkill(v2, v1) === v1, "when both were answered the later answer still wins");
var w1 = { box: 2, last: 500, n: 4, ok: 3, due: 1 }, w2 = { box: 2, last: 500, n: 4, ok: 3, due: 2 };
ok(ctx.hsNewerSkill(w1, w2) === ctx.hsNewerSkill(w2, w1), "a full tie is still order-independent");

/* capped sets: the newest survive whichever side is first */
var gA = [], gB = []; for (var gi = 0; gi < 60; gi++) { gA.push({ t: 1000 + gi * 2, result: "win" }); gB.push({ t: 1001 + gi * 2, result: "loss" }); }
var CA = hub({ chess: { d: [], games: gA, puzzle: 1000, pn: 0, ph: [] } }), CB = hub({ chess: { d: [], games: gB, puzzle: 1000, pn: 0, ph: [] } });
var CAB = ctx.hsMergeAll(CA, CB), CBA = ctx.hsMergeAll(CB, CA);
ok(CAB.hub.chess.games.length === 60 && same(CAB, CBA), "two disjoint 60-game sets merge to the same 60 in either order");
ok(CAB.hub.chess.games[0].t === 1119 && CAB.hub.chess.games[59].t === 1060, "the survivors are the 60 most recent, newest first");
ok(CAB.hub.chess.games.filter(function (g) { return g.result === "win"; }).length === 30, "half from each side");
var LA = [], LB = []; for (var li = 0; li < 1500; li++) { LA.push({ id: "a" + li, t: li * 2 }); LB.push({ id: "b" + li, t: li * 2 + 1 }); }
var LAB = ctx.hsMergeAll(hub({ logs: LA }), hub({ logs: LB })), LBA = ctx.hsMergeAll(hub({ logs: LB }), hub({ logs: LA }));
ok(LAB.hub.logs.length === 2000 && same(LAB, LBA) && LAB.hub.logs[0].t === 1000 && LAB.hub.logs[1999].t === 2999, "logs: sorted by time, then capped to the newest 2000, both ways");
ok(same(ctx.hsUnionBy([{ k: 1, t: 5 }, { k: 2, t: 1 }], [{ k: 3, t: 3 }], function (x) { return x.k; }, 2, function (x) { return x.t; }), [{ k: 3, t: 3 }, { k: 1, t: 5 }]), "hsUnionBy sorts before it caps");

/* malformed payloads: nothing throws, the shape is restored, and both orders agree */
var bad = { v: 1, hub: { epoch: 0, progress: null, skills: null, plog: "x", gstate: null, chess: { d: "no", games: null, puzzle: "abc", pn: null }, apply: 7, logs: "not a list", plan: "later", placed: [1, 2], quant: { runs: {}, tier: null, best: "no" } }, poker: "x", pokerGame: 3, pokerSim: [], math340: { cards: null, practice: 4, misses: "m", exams: null, sheet: {}, activity: [] }, devices: null };
var mergedBad = null, threw = false;
try { mergedBad = ctx.hsMergeAll(A, bad); } catch (e) { threw = true; console.log("  threw: " + (e && e.stack)); }
ok(!threw && mergedBad && mergedBad.hub.progress["sv:sv_v1"] && mergedBad.hub.skills["sv:w:sv_v1:0"].box === 2, "a malformed gist merges without throwing and keeps the good side");
ok(!threw && same(mergedBad, ctx.hsMergeAll(bad, A)), "and in either order");
ok(!threw && mergedBad.hub.chess.games.length === 1 && mergedBad.hub.logs.length === 1 && mergedBad.hub.plan.cap === 60 && mergedBad.math340.cards.c1, "arrays and objects on the bad side read as empty");
ok(!threw && mergedBad.poker && mergedBad.poker.progress.price && mergedBad.pokerGame.goal === 60 && mergedBad.pokerSim.at === 5, "a string, a number and an array where PokerPro's objects belong read as absent");
var N = ctx.hsNorm(bad);
ok(N.hub.skills && typeof N.hub.skills === "object" && Array.isArray(N.hub.logs) && N.hub.logs.length === 0 && N.hub.plan === null && Array.isArray(N.hub.chess.games) && N.hub.chess.puzzle === 0 && Array.isArray(N.hub.quant.runs) && N.poker === null && N.math340.cards && Array.isArray(N.math340.misses) && N.devices && typeof N.devices === "object", "hsNorm coerces every known sub-shape");
ok(same(ctx.hsNorm(null), ctx.hsEmpty()) && same(ctx.hsNorm("junk"), ctx.hsEmpty()) && same(ctx.hsNorm([1]), ctx.hsEmpty()), "a non-object file normalises to empty");
var halfSkills = hub({ skills: { good: { box: 2, last: 5 }, bad: "x", worse: null } });
var HS = ctx.hsMergeAll(halfSkills, A);
ok(HS.hub.skills.good && !HS.hub.skills.bad && !HS.hub.skills.worse && same(HS, ctx.hsMergeAll(A, halfSkills)), "non-object skill records are dropped, not merged");
var badDays = hub({ plog: { "2026-10-01": "x", "2026-10-03": { s: 5 } } });
ok(ctx.hsMergeAll(badDays, A).hub.plog["2026-10-01"].s === 600 && ctx.hsMergeAll(badDays, A).hub.plog["2026-10-03"].s === 5, "non-object day logs are dropped");
threw = false; try { ctx.hsMergeAll({ hub: { epoch: "7", skills: { a: { box: "2", last: "x" } } } }, A); } catch (e) { threw = true; }
ok(!threw, "string numbers in the hub do not throw");

/* unknown top-level keys round-trip, the remote (b) copy when both have one */
var X1 = Object.assign({}, A, { future: { schema: 2, note: "from A" }, flag: 1 }), X2 = Object.assign({}, B, { future: { schema: 3 }, other: [1] });
var XM = ctx.hsMergeAll(X1, X2);
ok(XM.future && XM.future.schema === 3 && XM.flag === 1 && XM.other && XM.other.length === 1, "unknown keys from both sides are kept, b's copy when both have it");
ok(ctx.hsMergeAll(X2, X1).future.schema === 2, "(and a's when a is the remote)");
ok(ctx.hsNorm(X1).future && ctx.hsNorm(X1).future.note === "from A", "hsNorm keeps unknown keys");
ok(same(ctx.hsMergeAll(X1, XM), XM) && same(ctx.hsMergeAll(XM, X2), XM) && same(ctx.hsMergeAll(XM, XM), XM), "merging again with the merged file as the remote changes nothing");
var oldStyle = ctx.hsMergeAll(A, B);
ok(Object.keys(oldStyle).sort().join(",") === "devices,hub,math340,poker,pokerGame,pokerSim,v", "without unknown keys the file has exactly its known keys");

/* a reset stage holds through sync: the old passes and skills on another device do not come back, work done after it does */
var R0 = hub({ progress: { "chess:ch_fork": 1, "chess:ch_pin": 1, "chess:ch_board": 1 }, skills: { "chess:chfork": { box: 1, last: 0, due: 900 }, "chess:chmat": { box: 2, last: 50 } } });
var R1 = hub({ progress: { "chess:ch_board": 1 }, skills: { "chess:chmat": { box: 2, last: 50 } }, resets: { "p:chess:ch_fork": 1000, "p:chess:ch_pin": 1000, "s:chess:chfork": 1000 } });
var RM = ctx.hsMergeAll(R0, R1);
ok(!RM.hub.progress["chess:ch_fork"] && !RM.hub.progress["chess:ch_pin"] && RM.hub.progress["chess:ch_board"] && !RM.hub.skills["chess:chfork"] && RM.hub.skills["chess:chmat"], "a reset un-passes the old copy's lessons and drops their skills");
ok(same(RM, ctx.hsMergeAll(R1, R0)) && same(ctx.hsMergeAll(RM, R0), RM), "resets commute and are idempotent");
var R2 = hub({ progress: { "chess:ch_fork": 2000 }, skills: { "chess:chfork": { box: 1, last: 0, due: 9000, at: 2000 } } });
var RN = ctx.hsMergeAll(ctx.hsMergeAll(RM, R2), R0);
ok(RN.hub.progress["chess:ch_fork"] === 2000 && RN.hub.skills["chess:chfork"].at === 2000 && !RN.hub.progress["chess:ch_pin"], "a lesson re-passed after the reset survives it");
ok(ctx.hsNewerSkill({ box: 1, last: 0 }, { box: 1, last: 0, at: 5 }).at === 5 && ctx.hsNewerSkill({ box: 1, last: 0, at: 5 }, { box: 1, last: 0 }).at === 5, "a tie between graduated copies goes to the later-made one");

console.log("sync: " + (n - fails) + "/" + n + " passed");
if (fails) process.exit(1);
