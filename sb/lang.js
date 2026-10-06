/* ============================================================
   LANGUAGE ENGINE: shared by Swedish and Hebrew
   The unit of learning is the word (or phrase), each on its own
   spaced-repetition schedule. The form of the question hardens
   as the word climbs the boxes, which is the "desirable
   difficulty" that makes retrieval build memory:
     box 0-1  recognition      see it, pick the meaning
     box 2    reverse          see the meaning, pick the word
     box 3    production       see the meaning, type the word
     box 4    cloze            type it into a sentence
     box 5+   ear and mouth    hear it and type it; say it
   Also: paradigm drills driven by tables (noun forms, verb
   forms), the conversation grader, and the CEFR level model.
   Pure functions; the screen supplies speech and a keyboard.
   ============================================================ */

var LG_NIQQUD = /[֑-ׇ]/g;                 /* U+0591–U+05C7: points, accents, and the maqaf, which lgStrip turns into a space first */
var LG_MAQAF = /־/g;                       /* U+05BE: the Hebrew hyphen joins words, so it becomes a space, not nothing */
var LG_FINALS = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };   /* ך ם ן ף ץ -> כ מ נ פ צ */
var LG_LETTER = /[\p{L}\p{M}]/u;           /* a letter or a combining mark, in any script: \b fails for Hebrew and accented letters */

function lgStrip(s) { return String(s || "").replace(LG_MAQAF, " ").replace(LG_NIQQUD, ""); }
function lgNorm(s, lang) {
  s = String(s == null ? "" : s).normalize("NFC").trim().toLowerCase();
  s = s.replace(/\(.*?\)/g, "");                               /* "(to) run" -> "run" */
  if (lang === "he") { s = lgStrip(s).replace(/[ךםןףץ]/g, function (c) { return LG_FINALS[c]; }); s = s.replace(/[׳״'"]/g, ""); }
  s = s.replace(/[.,!?¿¡;:"“”„«»…–—]/g, " ").replace(/\s+/g, " ").trim();
  return s;
}
/* word boundaries, Unicode-aware: a boundary is the start or end of the string, or a neighbour that is not a letter */
function lgIsLetter(ch) { return !!ch && LG_LETTER.test(ch); }
/* index of `needle` in `hay` with a boundary on both sides, or -1; `loose` relaxes the right side (a token that STARTS with the needle) */
function lgFindWord(hay, needle, loose) {
  if (!needle) return -1;
  var i = hay.indexOf(needle);
  while (i >= 0) {
    if (!lgIsLetter(hay.charAt(i - 1)) && (loose || !lgIsLetter(hay.charAt(i + needle.length)))) return i;
    i = hay.indexOf(needle, i + 1);
  }
  return -1;
}
/* de-duplicate by a key; the first of each key wins */
function lgDistinct(list, keyOf) { var seen = {}, out = []; list.forEach(function (x) { var k = keyOf(x); if (!seen[k]) { seen[k] = 1; out.push(x); } }); return out; }
/* multiple-choice options: the answer plus up to k distractors, all distinct by their normalised form, shuffled; fewer than k when the pool is small */
function lgOptions(answer, pool, k, rnd, lang) {
  var key = function (x) { return lgNorm(x, lang) || String(x).toLowerCase(); }, ak = key(answer);
  var others = lgDistinct(lgShuffle(pool.filter(function (x) { return x != null && key(x) !== ak; }), rnd), key).slice(0, k);
  return lgShuffle([answer].concat(others), rnd);
}
/* accepted answers: "a / b" or "a; b" in a gloss means either is fine */
function lgSplit(g) { return String(g || "").split(/\s*[\/;]\s*|\s+or\s+/).map(function (x) { return x.trim(); }).filter(Boolean); }
function lgMatch(said, answers, lang) {
  var s = lgNorm(said, lang);
  if (!s) return false;
  var list = Array.isArray(answers) ? answers : [answers];
  var all = [];
  list.forEach(function (a) { all.push(a); lgSplit(a).forEach(function (x) { all.push(x); }); });
  return all.some(function (a) {
    var n = lgNorm(a, lang);
    if (n === s) return true;
    /* articles and "to" are optional in English glosses */
    var loose = function (x) { return x.replace(/^(to|the|a|an|att|en|ett) /, "").replace(/^(the|a|an) /, ""); };
    return loose(n) === loose(s);
  });
}
/* near miss: one letter off, for the "almost" feedback */
function lgDistance(a, b) {
  a = lgNorm(a); b = lgNorm(b);
  var m = a.length, n = b.length, d = [];
  for (var i = 0; i <= m; i++) { d[i] = [i]; }
  for (var j = 1; j <= n; j++) d[0][j] = j;
  for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

/* ---- the word list as skills ---- */
/* an entry: { id, w, g, pos, f (forms), ex, exg, t (transliteration), lesson, lang } */
function lgItem(lang, lesson, i, row) {
  var he = lang === "he";
  return he
    ? { id: lang + ":w:" + lesson + ":" + i, lang: lang, lesson: lesson, w: row[0], t: row[1], g: row[2], pos: row[3] || "", f: row[4] || "", ex: row[5] || "", exg: row[6] || "" }
    : { id: lang + ":w:" + lesson + ":" + i, lang: lang, lesson: lesson, w: row[0], g: row[1], pos: row[2] || "", f: row[3] || "", ex: row[4] || "", exg: row[5] || "" };
}
function lgShuffle(a, rnd) { rnd = rnd || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = (rnd() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function lgPickOthers(item, pool, k, rnd) {
  rnd = rnd || Math.random;
  var same = pool.filter(function (x) { return x !== item && x.pos === item.pos && lgNorm(x.g) !== lgNorm(item.g) && lgNorm(x.w) !== lgNorm(item.w); });
  var any = pool.filter(function (x) { return x !== item && lgNorm(x.g) !== lgNorm(item.g) && lgNorm(x.w) !== lgNorm(item.w); });
  var src = same.length >= k ? same : any;
  var out = [], used = {};
  src = lgShuffle(src.slice(), rnd);
  for (var i = 0; i < src.length && out.length < k; i++) { var key = lgNorm(src[i].g); if (!used[key]) { used[key] = 1; out.push(src[i]); } }
  return out;
}
var LG_LANG = { sv: { name: "Swedish", code: "sv-SE", rtl: false }, he: { name: "Hebrew", code: "he-IL", rtl: true }, es: { name: "Spanish", code: "es-ES", rtl: false } };

/* the word, as the learner should see it: Hebrew with points early, without later */
function lgShow(item, box) { return item.lang === "he" && box >= 4 ? lgStrip(item.w) : item.w; }
/* the example with the word blanked: { text, found } where `found` is the token taken out (the word itself, or an inflected
   form that starts with it, like "går" for gå); null when the word is not in the sentence on a word boundary */
function lgBlank(ex, w, lang) {
  var plain = lang === "he" ? lgStrip(ex) : String(ex || ""), target = (lang === "he" ? lgStrip(w) : String(w || "")).trim();
  var low = plain.toLowerCase(), t = target.toLowerCase();
  if (!t) return null;
  var i = lgFindWord(low, t, false), end;
  if (i >= 0) end = i + t.length;
  else {
    i = lgFindWord(low, t, true);
    if (i < 0) return null;
    end = i + t.length;
    while (end < plain.length && lgIsLetter(plain.charAt(end))) end++;
  }
  return { text: plain.slice(0, i) + "____" + plain.slice(end), found: plain.slice(i, end) };
}

/* One question for a word, shaped by its box. caps: { tts: bool, asr: bool } says what the device can do. */
function lgWordQ(item, box, pool, caps, rnd) {
  rnd = rnd || Math.random; caps = caps || {};
  var L = LG_LANG[item.lang], expl = [];
  var forms = item.f ? [item.f] : [];
  expl.push("<b>" + item.w + "</b>" + (item.t ? " <i>" + item.t + "</i>" : "") + " = " + item.g + (item.pos ? " <small>(" + item.pos + ")</small>" : ""));
  if (item.f) expl.push("Forms: " + item.f);
  if (item.ex) expl.push(item.ex + (item.exg ? " — " + item.exg : ""));
  var base = { item: item, lang: item.lang, speak: caps.tts ? { text: item.w, lang: L.code } : null, explain: expl, rtl: L.rtl };
  var kind = box <= 1 ? "recog" : box === 2 ? "reverse" : box === 3 ? "produce" : box === 4 && item.ex && lgBlank(item.ex, item.w, item.lang) ? "cloze" : caps.tts && rnd() < 0.5 ? "listen" : caps.asr && rnd() < 0.5 ? "speak" : "produce";
  if (kind === "recog") {
    var others = lgPickOthers(item, pool, 3, rnd);
    var opts = lgShuffle([item.g].concat(others.map(function (x) { return x.g; })), rnd);
    return Object.assign(base, { kind: "choice", question: "What does <b class='tw'>" + item.w + "</b>" + (item.t ? " <i class='tr'>" + item.t + "</i>" : "") + " mean?", options: opts, answer: item.g, target: 6, type: "recog" });
  }
  if (kind === "reverse") {
    var o2 = lgPickOthers(item, pool, 3, rnd);
    var opts2 = lgShuffle([item.w].concat(o2.map(function (x) { return x.w; })), rnd);
    return Object.assign(base, { kind: "choice", question: "Which word means <b>" + item.g + "</b>?", options: opts2, answer: item.w, target: 6, type: "reverse", speak: null, speakAfter: caps.tts ? { text: item.w, lang: L.code } : null });
  }
  if (kind === "produce") {
    return Object.assign(base, { kind: "text", question: "Type the " + L.name + " for <b>" + item.g + "</b>" + (item.pos ? " <small>(" + item.pos + ")</small>" : "") + ".", answer: item.w, accept: [item.w].concat(item.alt || []), target: 10, type: "produce", speak: null, speakAfter: caps.tts ? { text: item.w, lang: L.code } : null, keyboard: item.lang });
  }
  if (kind === "cloze") {
    /* the form in the sentence is the answer; the base word (and its alternatives) are accepted too */
    var blank = lgBlank(item.ex, item.w, item.lang);
    return Object.assign(base, { kind: "text", question: "Fill the gap: <span class='tw'>" + blank.text + "</span><br><small>" + item.exg + "</small>", answer: blank.found, accept: [blank.found, item.w].concat(item.alt || []), target: 12, type: "cloze", speak: null, speakAfter: caps.tts ? { text: item.ex, lang: L.code } : null, keyboard: item.lang });
  }
  if (kind === "listen") {
    var useEx = item.ex && rnd() < 0.5;
    return Object.assign(base, { kind: "text", question: "Listen, then type what you heard" + (useEx ? " (the whole sentence)." : "."), answer: useEx ? item.ex : item.w, accept: [useEx ? item.ex : item.w], target: useEx ? 20 : 10, type: "listen", speak: { text: useEx ? item.ex : item.w, lang: L.code }, hideText: true, keyboard: item.lang });
  }
  /* speak: say the word; the device listens, or you grade yourself */
  return Object.assign(base, { kind: "speak", question: "Say the " + L.name + " for <b>" + item.g + "</b> out loud.", answer: item.w, accept: [item.w].concat(item.alt || []), target: 8, type: "speak", listen: { lang: L.code }, speak: null, speakAfter: caps.tts ? { text: item.w, lang: L.code } : null });
}

/* a checkpoint question for a vocabulary lesson: recognition or reverse, so the first pass tests the reading */
function lgLessonQ(items, pool, caps, rnd) {
  rnd = rnd || Math.random;
  var item = items[(rnd() * items.length) | 0];
  return lgWordQ(item, rnd() < 0.5 ? 0 : 2, pool, caps, rnd);
}

/* ---- paradigm drills: a table row and a form to produce ---- */
/* table: { name, cols: ["infinitive","present",...], rows: [[...]], ask: [col indices that can be asked], given: col index shown } */
function lgFormQ(table, lang, rnd, caps) {
  rnd = rnd || Math.random; caps = caps || {};
  var row = table.rows[(rnd() * table.rows.length) | 0];
  var ask = table.ask[(rnd() * table.ask.length) | 0];
  var L = LG_LANG[lang];
  var expl = [row.map(function (c, i) { return "<b>" + table.cols[i] + "</b> " + c; }).join(" &middot; ")];
  if (table.note) expl.push(table.note);
  if (table.rule && table.rule[ask]) expl.push(table.rule[ask]);
  var given = table.given == null ? 0 : table.given;
  var q = { kind: "text", question: table.q ? table.q.replace("{w}", "<b class='tw'>" + row[given] + "</b>").replace("{g}", row[table.gloss == null ? row.length - 1 : table.gloss]).replace("{form}", table.cols[ask]) :
    "<b class='tw'>" + row[given] + "</b> (" + row[row.length - 1] + "): give the <b>" + table.cols[ask] + "</b>.",
    answer: row[ask], accept: lgSplit(row[ask]).concat([row[ask]]), target: table.target || 10, explain: expl, lang: lang, rtl: L.rtl, keyboard: lang, speakAfter: caps.tts ? { text: lgSplit(row[ask])[0], lang: L.code } : null };
  if (table.choice) {
    /* distractors are the distinct other forms in the table; with fewer than two options the question stays typed */
    var opts = lgOptions(row[ask], table.rows.filter(function (r) { return r !== row; }).map(function (r) { return r[ask]; }), 3, rnd, lang);
    if (opts.length >= 2) { q.kind = "choice"; q.options = opts; q.target = 7; }
  }
  return q;
}

/* ---- the conversation grader ---- */
/* a turn: { bot, botg, expect: [patterns], reject: [patterns], model, modelg, hint }. A reply passes when any expect pattern
   matches and no reject pattern does. A pattern without regex metacharacters is literal: normalised like the reply and matched
   on word boundaries ("ja" does not match "jag", "te" does not match "inte"); a multi-word literal matches a run of whole words.
   A pattern with metacharacters is a regex, tested unanchored as written, with Hebrew points stripped and finals folded. */
var LG_META = /[\\^$.*+?()[\]{}|]/;
function lgPatternOk(p, s, lang) {
  p = String(p == null ? "" : p);
  if (LG_META.test(p)) {
    var r = lang === "he" ? lgStrip(p).replace(/[ךםןףץ]/g, function (c) { return LG_FINALS[c]; }) : p.normalize("NFC");
    try { return new RegExp(r, "i").test(s); } catch (e) { return false; }
  }
  var n = lgNorm(p, lang);
  return !!n && lgFindWord(s, n, false) >= 0;
}
function lgTurnOk(turn, reply, lang) {
  var s = lgNorm(reply, lang);
  if (!s) return false;
  if ((turn.reject || []).some(function (p) { return lgPatternOk(p, s, lang); })) return false;
  return (turn.expect || []).some(function (p) { return lgPatternOk(p, s, lang); });
}
function lgDialogueScore(sc, replies, lang) {
  var ok = 0, n = sc.turns.filter(function (t) { return t.expect; }).length;
  sc.turns.forEach(function (t, i) { if (t.expect && lgTurnOk(t, replies[i] || "", lang)) ok++; });
  return { ok: ok, n: n, score: n ? ok / n : 0 };
}

/* ---- the level model: CEFR from what you can do ----
   words: known (box >= 3) and automatic (box >= 5); grammar: lessons passed / total;
   use: average scores 0..1 in conversation, reading, listening, writing (null if none);
   hours: logged hours of study and immersion; need: the FSI estimate to professional fluency */
var LG_CEFR = [
  { min: 0,  name: "A0", about: "Starting out. Sounds, the first hundred words." },
  { min: 10, name: "A1", about: "Breakthrough. Simple phrases, introduce yourself, ask and answer basic questions." },
  { min: 25, name: "A2", about: "Waystage. Routine exchanges, simple descriptions of your background and surroundings." },
  { min: 42, name: "B1", about: "Threshold. Handle travel, describe experiences, follow clear speech on familiar topics." },
  { min: 60, name: "B2", about: "Vantage. Fluent, spontaneous conversation with natives; read articles; argue a point." },
  { min: 78, name: "C1", about: "Proficient. Flexible, effective language for social, academic and professional life." },
  { min: 92, name: "C2", about: "Mastery. Near-native: nuance, idiom, register, anything you read or hear." }
];
var LG_NEED = { sv: 700, he: 1100 };    /* FSI hours to professional working proficiency: Swedish category I, Hebrew category III */
var LG_WORDS = 450;                      /* the vocabulary anchor when a course does not say how many words it has (the courses hold 425–514) */
/* vocabulary: 25 points for words known, 10 more for words automatic, each on a log curve anchored at the course's word count
   (st.total), so the term never falls when a word is promoted and all words automatic scores the full 35 */
function lgLevelScore(st) {
  var known = st.known || 0, auto = st.auto || 0, total = st.total > 0 ? st.total : LG_WORDS;
  var curve = function (n) { return Math.min(1, Math.log(1 + Math.max(0, n)) / Math.log(1 + total)); };
  var vocab = 25 * curve(known) + 10 * curve(auto);
  var grammar = 25 * (st.grammarTotal ? st.grammarPassed / st.grammarTotal : 0);
  var uses = ["conv", "read", "listen", "write"].map(function (k) { return st[k]; }).filter(function (x) { return x != null; });
  var use = uses.length ? 20 * (uses.reduce(function (a, b) { return a + b; }, 0) / uses.length) * Math.min(1, uses.length / 4 + 0.5) : 0;
  var hours = 20 * Math.min(1, (st.hours || 0) / (st.need || 700));
  return Math.max(0, Math.min(100, vocab + grammar + use + hours));
}
function lgLevel(st) {
  var sc = lgLevelScore(st), L = LG_CEFR[0];
  for (var i = 0; i < LG_CEFR.length; i++) if (sc >= LG_CEFR[i].min) L = LG_CEFR[i];
  var idx = LG_CEFR.indexOf(L), next = LG_CEFR[idx + 1] || null;
  return { score: sc, name: L.name, about: L.about, index: idx, next: next, toNext: next ? (sc - L.min) / (next.min - L.min) : 1 };
}

/* ---- numbers, for the number drills ---- */
function lgNumberWords(lang, n) {
  if (lang === "sv") {
    var ones = ["noll", "ett", "två", "tre", "fyra", "fem", "sex", "sju", "åtta", "nio", "tio", "elva", "tolv", "tretton", "fjorton", "femton", "sexton", "sjutton", "arton", "nitton"];
    var tens = ["", "", "tjugo", "trettio", "fyrtio", "femtio", "sextio", "sjuttio", "åttio", "nittio"];
    if (n < 20) return ones[n];
    if (n < 100) return tens[(n / 10) | 0] + (n % 10 ? ones[n % 10] : "");
    if (n < 1000) return (n >= 200 ? ones[(n / 100) | 0] : "") + "hundra" + (n % 100 ? lgNumberWords("sv", n % 100) : "");
    return (n >= 2000 ? ones[(n / 1000) | 0] + "tusen" : "ettusen") + (n % 1000 ? " " + lgNumberWords("sv", n % 1000) : "");   /* ett + tusen loses a t: ettusen */
  }
  /* Hebrew: the feminine forms, used for counting */
  var hOnes = ["אפס", "אחת", "שתיים", "שלוש", "ארבע", "חמש", "שש", "שבע", "שמונה", "תשע", "עשר"];
  var hTeens = ["", "אחת עשרה", "שתים עשרה", "שלוש עשרה", "ארבע עשרה", "חמש עשרה", "שש עשרה", "שבע עשרה", "שמונה עשרה", "תשע עשרה"];
  var hTens = ["", "", "עשרים", "שלושים", "ארבעים", "חמישים", "שישים", "שבעים", "שמונים", "תשעים"];
  if (n <= 10) return hOnes[n];
  if (n < 20) return hTeens[n - 10];
  if (n < 100) return hTens[(n / 10) | 0] + (n % 10 ? " ו" + hOnes[n % 10] : "");
  if (n === 100) return "מאה";
  if (n < 200) return "מאה ו" + lgNumberWords("he", n % 100);
  if (n < 300) return "מאתיים" + (n % 100 ? " ו" + lgNumberWords("he", n % 100) : "");
  if (n < 1000) return hOnes[(n / 100) | 0].replace("שלוש", "שלוש").replace("ארבע", "ארבע") + " מאות" + (n % 100 ? " ו" + lgNumberWords("he", n % 100) : "");
  return "אלף" + (n % 1000 ? " ו" + lgNumberWords("he", n % 1000) : "");
}

/* ---- the alef-bet ---- */
var HE_LETTERS = [
  ["א", "alef", "silent (carries a vowel)", "a", ""], ["ב", "bet / vet", "b with a dot, v without", "b/v", ""], ["ג", "gimel", "g as in go", "g", ""],
  ["ד", "dalet", "d", "d", ""], ["ה", "he", "h (silent at the end of a word)", "h", ""], ["ו", "vav", "v; also the vowels o and u", "v/o/u", ""],
  ["ז", "zayin", "z", "z", ""], ["ח", "chet", "a throaty h, like Scottish loch", "ch", ""], ["ט", "tet", "t", "t", ""],
  ["י", "yod", "y; also the vowel i", "y/i", ""], ["כ", "kaf / chaf", "k with a dot, ch without", "k/ch", "ך"], ["ל", "lamed", "l", "l", ""],
  ["מ", "mem", "m", "m", "ם"], ["נ", "nun", "n", "n", "ן"], ["ס", "samech", "s", "s", ""], ["ע", "ayin", "silent in most modern speech (a pharyngeal in Mizrahi and Biblical reading)", "'", ""],
  ["פ", "pe / fe", "p with a dot, f without", "p/f", "ף"], ["צ", "tsadi", "ts as in cats", "ts", "ץ"], ["ק", "qof", "k", "k", ""],
  ["ר", "resh", "r (uvular in Israel)", "r", ""], ["ש", "shin / sin", "sh with the dot on the right, s with it on the left", "sh/s", ""], ["ת", "tav", "t", "t", ""]
];
var HE_VOWELS = [
  ["ַ", "patach", "a as in father", "a"], ["ָ", "kamatz", "a (o in a few words)", "a"], ["ֶ", "segol", "e as in bed", "e"], ["ֵ", "tsere", "e, a little longer", "e"],
  ["ִ", "chirik", "i as in machine", "i"], ["ֹ", "cholam", "o as in more", "o"], ["ֻ", "kubutz", "u as in rule", "u"], ["ְ", "shva", "a very short e, or silent", "e/-"]
];

if (typeof module !== "undefined") module.exports = {
  LG_LANG: LG_LANG, LG_CEFR: LG_CEFR, LG_NEED: LG_NEED, LG_WORDS: LG_WORDS, HE_LETTERS: HE_LETTERS, HE_VOWELS: HE_VOWELS,
  lgStrip: lgStrip, lgNorm: lgNorm, lgIsLetter: lgIsLetter, lgFindWord: lgFindWord, lgDistinct: lgDistinct, lgOptions: lgOptions, lgSplit: lgSplit, lgMatch: lgMatch, lgDistance: lgDistance, lgItem: lgItem, lgShuffle: lgShuffle, lgPickOthers: lgPickOthers,
  lgShow: lgShow, lgBlank: lgBlank, lgWordQ: lgWordQ, lgLessonQ: lgLessonQ, lgFormQ: lgFormQ, lgPatternOk: lgPatternOk, lgTurnOk: lgTurnOk, lgDialogueScore: lgDialogueScore,
  lgLevelScore: lgLevelScore, lgLevel: lgLevel, lgNumberWords: lgNumberWords
};
