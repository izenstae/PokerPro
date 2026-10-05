/* ============================================================
   GAME: XP, a daily goal, streaks, ranks and trophies
   Built to reward what makes poker skill stick, not raw volume:
   - a review on its due day pays most; cramming a skill that is
     not due pays little, and less after the day's first 40
   - a miss still pays something: an honest attempt at retrieval
     is the learning, a skipped one is not
   - promotions, checkpoints and good decisions at the table pay
     a bonus, so the reward follows real progress
   - the streak counts days you hit your goal, and earns freezes
     so one missed day does not wipe out weeks of work
   Pure functions: the screen calls them, the tests call them.
   ============================================================ */

var GM_GOALS = [
  { xp: 30,  name: "Light",   about: "about 10 minutes" },
  { xp: 60,  name: "Steady",  about: "about 20 minutes" },
  { xp: 120, name: "Serious", about: "about 40 minutes" }
];
var GM_CRAM_FREE = 40;          /* non-due answers a day before they pay the minimum */
var GM_FREEZE_EVERY = 7;        /* goal days per streak freeze */
var GM_FREEZE_MAX = 2;

var GM_RANKS = [
  { xp: 0,     name: "Rookie" },
  { xp: 300,   name: "Grinder" },
  { xp: 1000,  name: "Regular" },
  { xp: 2500,  name: "Shark" },
  { xp: 5000,  name: "Crusher" },
  { xp: 9000,  name: "High roller" },
  { xp: 15000, name: "Pro" },
  { xp: 25000, name: "Legend" },
  { xp: 40000, name: "Hall of Fame" }
];

/* XP for one drill answer.
   a = { due, ok, fast, recall, promoted (new box or 0), cramToday (non-due answers already today) } */
function gmAnswerXP(a) {
  var x;
  if (a.recall) x = a.due ? (a.ok ? 8 : 3) : (a.ok ? 2 : 1);
  else if (a.due) x = a.ok ? (a.fast ? 10 : 6) : 3;
  else if ((a.cramToday || 0) >= GM_CRAM_FREE) x = a.ok ? 1 : 0;
  else x = a.ok ? (a.fast ? 4 : 2) : 1;
  if (a.promoted) x += 15 * a.promoted;
  return x;
}

/* XP for one graded decision at the table */
function gmTableXP(grade) { return grade === "Best" ? 3 : grade === "Good" ? 2 : 0; }

var GM_XP_LESSON = 100;         /* first pass of a lesson checkpoint */
var GM_XP_SPOT = 15;            /* reviewing a table mistake */
var GM_XP_GOAL = 25;            /* hitting the daily goal */
var GM_XP_SWEEP = 30;           /* a review session of 10+ answers at 90%+ */

function gmTotal(plog) {
  return Object.keys(plog || {}).reduce(function (a, k) { return a + (plog[k].x || 0); }, 0);
}

function gmRank(total) {
  var i = 0;
  while (i + 1 < GM_RANKS.length && total >= GM_RANKS[i + 1].xp) i++;
  var R = GM_RANKS[i], N = GM_RANKS[i + 1] || null;
  return { index: i, name: R.name, xp: R.xp, next: N, toNext: N ? (total - R.xp) / (N.xp - R.xp) : 1, need: N ? N.xp - total : 0 };
}

/* local calendar day keys, matching srsDayKey */
function gmDayKey(t) {
  var d = new Date(t);
  return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
}
function gmPrevDay(key) {
  var p = key.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2], 12);
  d.setDate(d.getDate() - 1);
  return gmDayKey(d.getTime());
}
function gmNextDay(key) {
  var p = key.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2], 12);
  d.setDate(d.getDate() + 1);
  return gmDayKey(d.getTime());
}

/* The streak: days the goal was hit, in a row. Walking forward from the
   first goal day, every GM_FREEZE_EVERY goal days earn a freeze (at most
   GM_FREEZE_MAX); a missed day spends one if there is one, else resets.
   Today not finished yet never breaks it. */
function gmStreak(plog, now) {
  plog = plog || {};
  var today = gmDayKey(now);
  var met = Object.keys(plog).filter(function (k) { return plog[k].g; }).sort();
  var out = { days: 0, best: 0, freezes: 0, todayMet: !!(plog[today] && plog[today].g), frozen: 0 };
  if (!met.length) return out;
  var days = 0, best = 0, fz = 0, earned = 0, frozen = 0;
  for (var k = met[0]; k <= today; k = gmNextDay(k)) {
    if (plog[k] && plog[k].g) {
      days++; earned++;
      if (earned % GM_FREEZE_EVERY === 0 && fz < GM_FREEZE_MAX) fz++;
      if (days > best) best = days;
    } else if (k !== today) {
      if (fz > 0) { fz--; frozen++; }
      else { days = 0; earned = 0; frozen = 0; }
    }
  }
  out.days = days; out.best = best; out.freezes = fz; out.frozen = frozen;
  return out;
}

/* Trophies. s is a summary of the learner's state:
   { lessons, stages: [{n, title, done, of}], boxes: [box per skill], comeback, answers,
     bestStreak, hands, best, level (index), plugged, spots, sweeps, rank } */
function gmTrophies(s) {
  var T = [];
  function add(id, name, about, cur, max) { T.push({ id: id, name: name, about: about, cur: Math.min(cur, max), max: max, got: cur >= max }); }
  var boxes = s.boxes || [];
  var atLeast = function (b) { return boxes.filter(function (x) { return x >= b; }).length; };
  add("lesson1", "First checkpoint", "Pass your first lesson checkpoint.", s.lessons || 0, 1);
  (s.stages || []).forEach(function (S) { add("stage" + S.n, "Stage " + S.n + " cleared", "Pass every checkpoint in " + S.title + ".", S.done, S.of); });
  add("streak3", "Warming up", "Hit your daily goal 3 days running.", s.bestStreak || 0, 3);
  add("streak7", "One week", "A 7-day goal streak. It earns your first streak freeze.", s.bestStreak || 0, 7);
  add("streak30", "Habit", "A 30-day goal streak.", s.bestStreak || 0, 30);
  add("streak100", "Unshakeable", "A 100-day goal streak.", s.bestStreak || 0, 100);
  add("solid1", "It sticks", "Get a skill to solid: three spaced reviews passed.", atLeast(3), 1);
  add("auto1", "Second nature", "Get a skill to automatic: right and fast, months apart.", atLeast(6), 1);
  add("auto10", "Autopilot", "Ten skills automatic.", atLeast(6), 10);
  add("comeback", "Comeback", "Bring a skill you had slipped on back up to solid.", s.comeback || 0, 1);
  add("ans100", "Hundred reps", "Answer 100 drill questions.", s.answers || 0, 100);
  add("ans1000", "Thousand reps", "Answer 1,000 drill questions.", s.answers || 0, 1000);
  add("sweep", "Clean sweep", "Finish a review session of 10+ answers at 90% or better.", s.sweeps || 0, 1);
  add("hands100", "Table time", "Play 100 hands at the Play table.", s.hands || 0, 100);
  add("best100", "Sharp", "Make 100 Best decisions at the table.", s.best || 0, 100);
  add("lvRegular", "Regular", "Reach Regular level at the table.", (s.level || 0) >= 3 ? 1 : 0, 1);
  add("lvStrong", "Strong", "Reach Strong level at the table.", (s.level || 0) >= 5 ? 1 : 0, 1);
  add("lvExpert", "Expert", "Reach Expert level at the table.", (s.level || 0) >= 6 ? 1 : 0, 1);
  add("plug", "Leak plugged", "Take a table weak spot from below 60 to 70 or better.", s.plugged || 0, 1);
  add("spots10", "Student of the game", "Review 10 of your table mistakes.", s.spots || 0, 10);
  return T;
}

if (typeof module !== "undefined") module.exports = {
  GM_GOALS: GM_GOALS, GM_RANKS: GM_RANKS, GM_CRAM_FREE: GM_CRAM_FREE, GM_FREEZE_EVERY: GM_FREEZE_EVERY,
  gmAnswerXP: gmAnswerXP, gmTableXP: gmTableXP, gmTotal: gmTotal, gmRank: gmRank, gmDayKey: gmDayKey,
  gmPrevDay: gmPrevDay, gmStreak: gmStreak, gmTrophies: gmTrophies
};
