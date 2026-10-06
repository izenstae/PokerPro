/* ============================================================
   SCHOOL: your courses, prioritised
   A school course is either a full app of its own in a subfolder
   (Math 340 Probability Studio lives at school/math340/ and keeps
   its own flashcards, generated problems, exam mode and schedule)
   or a native course in the hub's own lesson-and-drill format.
   Either way it registers here with its term dates, its key dates
   and a reader for its saved progress, and the planner puts it at
   the front of every day. Add a course by adding one entry to
   SCHOOL_COURSES (see docs/ADDING_A_COURSE.md).
   ============================================================ */

var SCHOOL_COURSES = [
  {
    id: "math340", code: "MATH 340", name: "Probability", term: "Fall 2026", school: "Lawrence University",
    href: "school/math340/", color: "#4f46e5", glyph: "P",
    blurb: "Spaced-repetition flashcards, 204 generated problem types, timed quiz and exam rehearsals, a formula-sheet builder and a progress dashboard, built from each week's lecture.",
    textbook: "Blitzstein & Hwang, Introduction to Probability (2nd ed.)",
    storeKey: "math340-progress-v1",
    /* the course's own manifest is inlined by the build (MATH340); these are fallbacks if it is not */
    termStart: "2026-09-14",
    keyDates: [
      { date: "2026-09-25", label: "Homework 1 due (5:00 pm)", kind: "hw" }, { date: "2026-10-02", label: "Homework 2 due", kind: "hw" },
      { date: "2026-10-21", label: "Midterm Exam · 1:50–3:00 pm", kind: "exam" }, { date: "2026-11-13", label: "Last day to request final-exam change", kind: "info" },
      { date: "2026-11-23", label: "Final Exam · 11:30 am–2:00 pm (cumulative)", kind: "exam" }
    ],
    quizDay: 3,            /* Wednesday */
    links: [["Dashboard", "#/dashboard"], ["Flashcards", "#/flashcards"], ["Practice", "#/practice"], ["Exam mode", "#/exam"], ["Reference", "#/reference"], ["Schedule", "#/schedule"], ["Progress", "#/progress"]],
    gradeWeights: [["Participation", 5], ["Homework", 15], ["Quizzes", 25], ["Midterm", 20], ["Final Exam", 25], ["Final Project", 10]]
  }
];

/* the Leitner ladder the Math 340 store uses, so the hub can count what is due without loading the app */
var SCH_INTERVALS = [0, 0, 1, 2, 4, 9, 21];

function schDaysUntil(iso, now) {
  var d = new Date(iso + "T23:59:59");
  return Math.ceil((d - (now || Date.now())) / 864e5);
}
function schWeekOf(course, now) {
  var start = new Date(course.termStart + "T00:00:00");
  var wk = Math.floor(((now || Date.now()) - start) / (7 * 864e5)) + 1;
  return Math.min(Math.max(wk, 0), 11);
}
/* the next quiz: weekly on quizDay from week 2, per the syllabus, unless the manifest says otherwise */
function schNextQuiz(course, now) {
  now = now || Date.now();
  var sched = (typeof MATH340 !== "undefined" && course.id === "math340" && MATH340.schedule) || null;
  var start = new Date(course.termStart + "T00:00:00"), today = new Date(now); today.setHours(0, 0, 0, 0);
  for (var w = 1; w <= 10; w++) {
    var row = sched ? sched.filter(function (r) { return r.week === w; })[0] : { week: w, quiz: w >= 2 && w !== 6 && w !== 10, topic: "" };
    if (!row || !row.quiz) continue;
    var day = new Date(start.getTime() + ((w - 1) * 7 + (course.quizDay == null ? 2 : course.quizDay - 1)) * 864e5);
    if (day >= today) return { week: w, topic: row.topic || "", days: Math.round((day - today) / 864e5), date: day };
  }
  return null;
}
/* read a course's saved state from storage: due cards, misses, activity, mastery */
function schRead(course, raw, now, units) {
  now = now || Date.now();
  var st = null;
  try { st = raw ? JSON.parse(raw) : null; } catch (e) { st = null; }
  var out = { has: !!st, due: 0, fresh: 0, total: 0, mastered: 0, misses: 0, exams: 0, today: 0, streak: 0, lastExam: null, mastery: 0, weak: [] };
  if (!st) return out;
  var cards = st.cards || {}, seen = Object.keys(cards);
  var decks = units ? units.filter(function (u) { return u.flashcards && u.flashcards.length; }) : null;
  if (decks) {
    var boxSum = 0;
    decks.forEach(function (u) { u.flashcards.forEach(function (card) {
      out.total++;
      var c = cards[card.id];
      if (c && c.seen > 0) { boxSum += c.box; if (c.box >= 4) out.mastered++; if (c.due <= now) out.due++; }
      else { out.fresh++; out.due++; }
    }); });
    out.mastery = out.total ? boxSum / (out.total * 6) : 0;
  } else {
    seen.forEach(function (id) { var c = cards[id]; out.total++; if (c.due <= now) out.due++; if (c.box >= 4) out.mastered++; });
  }
  out.misses = (st.misses || []).length;
  out.exams = (st.exams || []).length;
  if (out.exams) { var ex = st.exams[st.exams.length - 1]; out.lastExam = { at: ex.at, label: ex.label, score: ex.n ? ex.correct / ex.n : 0 }; }
  var act = st.activity || {}, d = new Date(now), key = function (dt) { return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0"); };
  out.today = act[key(d)] || 0;
  if (!act[key(d)]) d.setDate(d.getDate() - 1);
  while (act[key(d)]) { out.streak++; d.setDate(d.getDate() - 1); }
  out.activity = act;
  /* weakest topics, from the practice stats (the store's own weakness model, reproduced) */
  var pr = st.practice || {};
  out.weak = Object.keys(pr).map(function (gid) {
    var p = pr[gid]; if (!p.attempts) return null;
    var num = 0, den = 0; (p.recent || []).forEach(function (r, i) { num += r * (i + 1); den += i + 1; });
    var recent = den ? num / den : p.correct / p.attempts, overall = p.correct / p.attempts, acc = 0.7 * recent + 0.3 * overall;
    var conf = Math.min(p.attempts, 8) / 8, adj = acc * conf + 0.5 * (1 - conf);
    return { id: gid, weakness: Math.min(1, Math.max(0.05, 1 - adj)), attempts: p.attempts, correct: p.correct };
  }).filter(Boolean).filter(function (x) { return x.attempts >= 3; }).sort(function (a, b) { return b.weakness - a.weakness; }).slice(0, 3);
  return out;
}
/* what the course needs today, for the planner and the Home page */
function schDemand(course, R, now) {
  now = now || Date.now();
  var items = [], exam = null, hw = null;
  (course.keyDates || []).forEach(function (k) {
    var d = schDaysUntil(k.date, now);
    if (d < 0) return;
    if (k.kind === "exam" && (!exam || d < exam.days)) exam = { days: d, label: k.label, date: k.date };
    if (k.kind === "hw" && (!hw || d < hw.days)) hw = { days: d, label: k.label, date: k.date };
  });
  var quiz = schNextQuiz(course, now);
  if (R.due) items.push({ kind: "review", min: Math.max(5, Math.min(25, Math.round(R.due * 0.3))), label: "Review " + R.due + " flashcard" + (R.due === 1 ? "" : "s"), href: course.href + "#/flashcards", why: R.fresh ? R.fresh + " never seen, the rest due today." : "Due today by the Leitner boxes." });
  if (R.misses) items.push({ kind: "review", min: Math.max(5, Math.min(20, R.misses * 3)), label: "Redo " + R.misses + " missed problem" + (R.misses === 1 ? "" : "s"), href: course.href + "#/practice", why: "A miss redone is worth more than a fresh problem you would have got right." });
  if (quiz && quiz.days <= 2) items.push({ kind: "apply", min: 20, label: "Quiz " + (quiz.days === 0 ? "today" : quiz.days === 1 ? "tomorrow" : "in " + quiz.days + " days") + ": sit a timed set", href: course.href + "#/exam", why: "Five problems, 15 minutes, no hints: the conditions the quiz is graded under." });
  if (exam && exam.days <= 14) items.push({ kind: "apply", min: exam.days <= 3 ? 45 : 30, label: exam.label.split("·")[0].trim() + " in " + exam.days + " day" + (exam.days === 1 ? "" : "s") + ": full rehearsal", href: course.href + "#/exam", why: "Sit it under the clock, then drill what it finds. Build the formula sheet on the Reference page." });
  if (hw && hw.days <= 3) items.push({ kind: "homework", min: hw.days === 0 ? 60 : 45, label: hw.label + (hw.days === 0 ? " today" : " in " + hw.days + " day" + (hw.days === 1 ? "" : "s")), href: course.href + "#/schedule", why: "Homework is 15% of the grade and the quiz draws on it. Reserve the time." });
  if (R.weak && R.weak.length) items.push({ kind: "practice", min: 12, label: "Drill your weakest topic", href: course.href + "#/practice", why: "Target my weak spots draws from the topics you miss most." });
  if (!items.length) items.push({ kind: "practice", min: 12, label: "Mixed practice session", href: course.href + "#/practice", why: "Nothing due: interleaved problems with the topic hidden are the best use of ten minutes." });
  return { items: items, exam: exam, hw: hw, quiz: quiz, week: schWeekOf(course, now) };
}

if (typeof module !== "undefined") module.exports = { SCHOOL_COURSES: SCHOOL_COURSES, SCH_INTERVALS: SCH_INTERVALS, schDaysUntil: schDaysUntil, schWeekOf: schWeekOf, schNextQuiz: schNextQuiz, schRead: schRead, schDemand: schDemand };
