/* ============================================================
   SWEDISH: the course
   Eight stages from the alphabet to a C-level immersion programme.
   Every vocabulary set is a lesson whose words join the schedule
   when its checkpoint is passed; every grammar lesson has a drill
   built from a paradigm table in sv_data.js. Registered through the
   same interface as chess and Hebrew (see core.js).
   ============================================================ */
(function () {
  var V = SV_VOCAB;
  function tblOf(rows) { return { t: "tbl", head: ["Swedish", "Meaning", "Example"], rows: rows.map(function (r) { return [r[0], r[1], r[4]]; }) }; }
  function vocabLesson(id, title, sub, gist, intro, extra) {
    var rows = V[id];
    return { id: id, mode: "words:" + id, pass: 8, of: 10, title: title, sub: sub, gist: gist, vocab: true,
      blocks: [{ t: "p", x: intro }].concat(extra || []).concat([
        tblOf(rows),
        { t: "key", x: "Read each word aloud, cover the meaning, say it, uncover. Then the other way. Thirty words take ten minutes; the checkpoint tests recognition, and the schedule takes it from there." },
        { t: "how", drill: "Vocabulary", ask: "What does this word mean? Which word means this? Type it. Fill the gap. Type what you heard. Say it.",
          steps: ["Each word is its own skill on the schedule. Early reviews ask you to recognise it; later ones make you produce it, spell it into a sentence, hear it and say it.",
            "Typing without the accent is marked wrong on purpose: å, ä and ö are different letters, and tak (roof) is not tack (thanks).",
            "If the device has a Swedish voice, the word is spoken; listen first, then look."],
          tip: "Say the example sentence out loud every time. The word comes back with its company, which is how native speakers hold it." }
      ]) };
  }

  var LESSONS = {};
  function add(L) { LESSONS[L.id] = L; return L; }

  /* ---------------- stage 0: sounds ---------------- */
  add({ id: "sv_alpha", mode: "svletter", pass: 7, of: 10, title: "The nine vowels", sub: "Why Swedish sounds the way it does",
    gist: "Swedish has 29 letters and nine vowels, each with a long and a short version. Get these right first and everything after is spelled the way it sounds.",
    blocks: [
      { t: "p", x: "Swedish spelling is honest: once you know what each letter does, you can read a word you have never seen and say it right. The whole difficulty sits in nine vowels, three of which do not exist in English, and in a handful of consonant rules. Train the ear first. The Foreign Service Institute, Pimsleur and every modern method agree on the order: sounds, then words, then grammar." },
      { t: "tbl", head: ["Letter", "Sound"], rows: SV_LETTERS },
      { t: "rule", x: "a vowel is LONG before one consonant, SHORT before two\nglas (glaas) vs glass (glass) · tak (taak) vs tack (tack)", note: "Length is phonemic: it changes the word. A long vowel is also tenser and often a different quality, so vit (white) and vitt (white, ett-form) differ in both length and colour." },
      { t: "p", x: "The three extra letters sort at the end of the alphabet: å, ä, ö. They are not decorated a's and o's. Å is the vowel of English 'more'; ä is the vowel of 'bed' or 'air'; ö is 'ea' in 'earn' with rounded lips. Y is the hardest for English speakers: say 'ee' and round your lips as if to whistle." },
      { t: "p", x: "Swedish also has a pitch accent: most two-syllable words have either accent 1 (one peak, like English) or accent 2 (two peaks, a rise and fall). It separates anden (the duck) from anden (the spirit), but almost never causes misunderstanding. Imitate the melody of the voice in the drills and it comes with time." },
      { t: "warn", x: "The letter o is the trap: long o is usually 'oo' (bok, sol), but in some words it is å-like (som, kom). The u is not English 'oo': purse the lips hard and say 'ü'." },
      { t: "key", x: "Nine vowels, each long or short. Long before one consonant, short before two. Å = 'more', ä = 'air', ö = rounded 'earn', y = 'ee' with rounded lips, u = pursed 'ü'." },
      { t: "how", drill: "Letters", ask: "Which sound does this letter make?", steps: ["Match the letter to its description.", "Say it aloud twice: once long, once short."], tip: "Hum the vowel for a full second to feel where the tongue sits." }
    ] });
  add({ id: "sv_pairs", mode: "svpair", pass: 7, of: 10, title: "Long or short", sub: "Minimal pairs by ear",
    gist: "Tak or tack, vit or vitt: one sound apart, different words. Hearing the difference is a skill, and it is trained in minutes a day.",
    blocks: [
      { t: "p", x: "Research on pronunciation training (minimal-pair discrimination, the method Gabriel Wyner builds Fluent Forever around) shows that adults can learn to hear a new contrast in a few hundred quick trials with immediate feedback. That is this drill. The device says one of two words; you pick the spelling. If no Swedish voice is installed, the drill tests the rule instead." },
      { t: "tbl", head: ["Long vowel", "Short vowel", "Meanings"], rows: SV_PAIRS },
      { t: "rule", x: "double consonant → short vowel\nsingle consonant → long vowel", note: "The spelling tells you the length. Train the ear until you hear it before you read it." },
      { t: "key", x: "Hear the length, not just the letters: short vowels are clipped and the consonant after them is held longer." },
      { t: "how", drill: "Long or short", ask: "Which word did you hear?", steps: ["Play the word (or read the clue).", "Choose the spelling.", "Say both words aloud, exaggerating the difference."], tip: "Hold the consonant after a short vowel: tack is 'tak-k'." }
    ] });
  add({ id: "sv_cons", mode: "svsound", pass: 7, of: 10, title: "Soft and hard: k, g, sk and the sj-sound", sub: "The consonant rules",
    gist: "Before e, i, y, ä, ö the letters k, g and sk go soft. That one rule explains kök, göra, sju and skjorta.",
    blocks: [
      { t: "p", x: "Swedish has two famous sounds. The tj-sound (as in kjol, kyrka, tjugo) is close to English 'sh' said with the tongue tip down, like 'ch' in German ich. The sj-sound (sju, sked, station) has no English equivalent: a breathy 'hw' made far back, as if blowing on cold hands. Both are triggered by spelling rules you can learn in a minute." },
      { t: "tbl", head: ["Spelling", "Before a, o, u, å (hard)", "Before e, i, y, ä, ö (soft)"], rows: [["k", "k: kaffe, katt, kort", "tj-sound: kök, kyrka, kille"], ["g", "g: gå, gul, god", "j-sound: ge, gärna, göra"], ["sk", "sk: skola, skåp", "sj-sound: sked, skida, skön"], ["kj, tj", "", "tj-sound always: kjol, tjugo"], ["sj, skj, stj, sch, -tion", "", "sj-sound always: sju, skjorta, stjärna, station"], ["dj, lj, hj, gj", "", "the first letter is silent: djur, ljus, hjärta, gjorde"]] },
      { t: "rule", x: "soft vowels: e, i, y, ä, ö\nk → tj   g → j   sk → sj   before a soft vowel", note: "Loanwords and some names keep the hard sound (kille follows the rule; kö, from French queue, does too: 'tjö')." },
      { t: "p", x: "Two more: r before s, t, d, n, l merges into a retroflex (fors sounds like 'fosh', bort like 'bawt' with a curled tongue), and a final -g after a vowel often turns into j (jag sounds like 'ja', dag like 'daa')." },
      { t: "key", x: "Soft vowels e i y ä ö make k→tj, g→j, sk→sj. sj/skj/stj/-tion are always the sj-sound. dj/lj/hj/gj drop the first letter." },
      { t: "how", drill: "Sound rules", ask: "How is the first consonant of this word pronounced?", steps: ["Look at the vowel after the consonant.", "Soft vowel: pick the soft sound; otherwise hard.", "Watch for the always-soft clusters and the silent first letters."], tip: "Say the word before you answer. The rule should become a reflex of the mouth, not of the eye." }
    ] });

  /* ---------------- stage 1: first words ---------------- */
  add(vocabLesson("sv_v1", "The first thirty", "Pronouns, greetings, yes and no", "The words in every sentence: who, what, and the little ones that hold a conversation together.",
    "Frequency lists are brutal and useful: the hundred most common words of a language cover about half of everything said. Paul Nation's work on vocabulary shows the first 2,000 word families cover 80 to 90% of ordinary text, so the order you learn words in matters more than how many you know. These thirty are the top of the list. Learn them with their example sentences, not alone.",
    [{ t: "rule", x: "jag · du · han · hon · vi · ni · de\nmig · dig · honom · henne · oss · er · dem", note: "Subject forms, then object forms. 'De' and 'dem' are both pronounced 'dom' in speech." }]));
  add(vocabLesson("sv_v2", "Thirty verbs", "Doing, having, wanting", "The verbs you will use in nine sentences out of ten. Present tense is the same for every person, so 'jag går, du går, vi går'.",
    "Swedish verbs do not change for person: one present-tense form for everyone. That makes the first verbs cheap to learn. The forms listed are infinitive, present, past and supine; for now use the present (the -r form) and add the rest when the tense lessons come.",
    [{ t: "rule", x: "jag går · du går · han går · vi går · ni går · de går", note: "No conjugation by person, ever. The energy that English spends on 'goes' Swedish spends on word order." }]));
  add({ id: "sv_num", mode: "svnum", pass: 7, of: 10, title: "Numbers and the clock", sub: "0 to 1,000, days, and telling the time",
    gist: "Numbers are the one piece of vocabulary you cannot look up mid-sentence. Drill them to reflex.",
    blocks: [
      { t: "p", x: "Numbers follow a regular pattern after twenty: tens plus units, written as one word: tjugotre, femtiosju. Hundreds are 'ett hundra, två hundra' (written hundra, tvåhundra), thousands 'ett tusen, två tusen'. Years are read as hundreds: 1994 is nittonhundranittiofyra." },
      { t: "tbl", head: ["Number", "Swedish"], rows: [["0", "noll"], ["1", "ett (en with en-words)"], ["2", "två"], ["3", "tre"], ["4", "fyra"], ["5", "fem"], ["6", "sex"], ["7", "sju"], ["8", "åtta"], ["9", "nio"], ["10", "tio"], ["11", "elva"], ["12", "tolv"], ["13", "tretton"], ["14", "fjorton"], ["15", "femton"], ["16", "sexton"], ["17", "sjutton"], ["18", "arton"], ["19", "nitton"], ["20", "tjugo"], ["30", "trettio"], ["40", "fyrtio"], ["50", "femtio"], ["60", "sextio"], ["70", "sjuttio"], ["80", "åttio"], ["90", "nittio"], ["100", "hundra"], ["1000", "tusen"]] },
      { t: "rule", x: "Klockan är tre. · halv fyra = 3:30 · kvart över tre = 3:15 · kvart i fyra = 3:45\nfem över halv fyra = 3:35 · fem i halv fyra = 3:25", note: "'Halv fyra' means half way TO four, so 3:30. This catches every English speaker once." },
      { t: "warn", x: "The -tio endings are pronounced without the o in speech: 'tretti', 'femti'. And 'sju', 'sjutton', 'sjuttio' all carry the sj-sound." },
      { t: "key", x: "Tens + units as one word. Halv fyra is 3:30. Years are hundreds: nittonhundra-." },
      { t: "how", drill: "Numbers", ask: "Write this number in Swedish.", steps: ["Say the number aloud before you type it.", "Tens first, then the unit, one word.", "Over a hundred: hundreds, then the rest."], tip: "Count your reps, your steps, the stairs, in Swedish. Numbers are learned by use, not by lists." }
    ] });
  add(vocabLesson("sv_v3", "Time words", "Days, parts of the day, soon and late", "Today, tomorrow, Monday evening: the words that place a sentence in time.",
    "Days of the week are not capitalised. 'På måndag' is next Monday; 'på måndagar' is every Monday. 'I kväll' is tonight; 'på kvällen' is in the evening generally."));
  add(vocabLesson("sv_v4", "People and home", "Family, the house, the everyday nouns", "Your first nouns, each listed with its gender and plural. Learn the article with the noun, always.",
    "Every Swedish noun is an en-word or an ett-word, and that decides its definite form, its plural and the adjective in front of it. There is no reliable rule, so treat the article as part of the word: never 'hus', always 'ett hus'. Roughly three quarters of nouns are en-words, people and animals almost always."));

  /* ---------------- stage 2: grammar core ---------------- */
  add({ id: "sv_gender", mode: "svgender", pass: 8, of: 10, title: "En or ett", sub: "The two genders", gist: "Three quarters of nouns are en-words. The rest you learn one by one, and the drill makes sure you do.",
    blocks: [
      { t: "p", x: "Old Swedish had three genders; masculine and feminine merged into the common gender (en) and the neuter stayed (ett). The gender is invisible in the bare noun and visible everywhere else: en bil → bilen, en stor bil, den; ett hus → huset, ett stort hus, det." },
      { t: "tbl", head: ["Clue", "Usually"], rows: [["People, animals, professions", "en (en man, en hund, en lärare)"], ["Nouns ending in -a, -ing, -het, -ion, -are", "en (en flicka, en tidning, en nyhet)"], ["Nouns ending in -ande, -ende, -eri, -em, -um", "ett (ett leende, ett bageri, ett problem)"], ["Many short, concrete things and substances", "ett, but unreliably (ett hus, ett bord, ett kött)"]] },
      { t: "rule", x: "en → den / -en / stor\nett → det / -et / stort", note: "Pronoun, definite ending and adjective all follow the gender." },
      { t: "key", x: "Learn the article as part of the noun. When in doubt, en: it is right three times in four." },
      { t: "how", drill: "En or ett", ask: "Is it en or ett?", steps: ["Say the word with both articles and pick the one that sounds right.", "If neither does, you have not met the word enough: the schedule will fix that."], tip: "Say the plural too when you learn a noun: en bil, bilar." }
    ] });
  add({ id: "sv_nouns", mode: "svnoun", pass: 7, of: 10, title: "Noun forms", sub: "Definite endings and the five plurals", gist: "'The' is an ending in Swedish, and the plural comes in five flavours. One table covers both.",
    blocks: [
      { t: "p", x: "Swedish has no word 'the' before a noun. It attaches 'the' to the end: bil → bilen, hus → huset. The plural has five declensions, chosen mostly by gender and the last letter, and the definite plural adds another ending on top." },
      { t: "tbl", head: ["Declension", "Plural ending", "Which nouns", "Example"], rows: [["1", "-or", "en-words ending in -a", "en flicka, flickor, flickorna"], ["2", "-ar", "most en-words", "en bil, bilar, bilarna"], ["3", "-er", "en-words from Latin/French, some with umlaut", "en stad, städer, städerna"], ["4", "-n", "ett-words ending in a vowel", "ett äpple, äpplen, äpplena"], ["5", "no ending", "ett-words ending in a consonant; en-words in -are", "ett hus, hus, husen; en lärare, lärare, lärarna"]] },
      { t: "rule", x: "definite singular: -en / -n (en-words), -et / -t (ett-words)\ndefinite plural: -na after -or/-ar/-er, -a after -n, -en after a bare consonant plural", note: "A handful of umlaut plurals must simply be known: man/män, bok/böcker, fot/fötter, hand/händer, stad/städer, land/länder." },
      { t: "ex", title: "Worked example", facts: [["Noun", "en stol"], ["Ask", "the chairs"]], steps: ["en-word, not ending in -a: declension 2, plural -ar: stolar.", "Definite plural after -ar: -na: stolarna."], punch: "Two decisions, both mechanical once the declension is known." },
      { t: "key", x: "Definite = ending. Plurals: -or (en, -a), -ar (en), -er (loans), -n (ett, vowel), nothing (ett, consonant). Definite plural -na / -a / -en." },
      { t: "how", drill: "Noun forms", ask: "Give the definite singular, the plural, or the definite plural.", steps: ["Find the gender and the last letter.", "Pick the declension.", "Add the ending; for the definite plural, add the second ending."], tip: "Say all four forms in a row every time you learn a noun: bil, bilen, bilar, bilarna." }
    ] });
  add({ id: "sv_pres", mode: "svverb", pass: 7, of: 10, title: "Verb groups and the present", sub: "Four groups, one ending each", gist: "Every Swedish verb belongs to one of four groups, and the group tells you all four forms.",
    blocks: [
      { t: "p", x: "Present tense is one form for all persons. The ending depends on the group: -ar (group 1, the largest), -er (groups 2 and 4), -r on the vowel (group 3). Group 4 are the strong verbs that change their vowel in the past, like English sing/sang/sung, and there are about eighty worth knowing." },
      { t: "tbl", head: ["Group", "Infinitive", "Present", "Past", "Supine"], rows: [["1", "tala", "talar", "talade", "talat"], ["2a", "ringa", "ringer", "ringde", "ringt"], ["2b (after p, t, k, s)", "köpa", "köper", "köpte", "köpt"], ["3 (one syllable, ends in a vowel)", "bo", "bor", "bodde", "bott"], ["4 (strong)", "skriva", "skriver", "skrev", "skrivit"]] },
      { t: "rule", x: "group 1: -ar, -ade, -at\ngroup 2: -er, -de/-te, -t\ngroup 3: -r, -dde, -tt\ngroup 4: -er, vowel change, -it", note: "If the infinitive ends in -a and you do not know better, guess group 1: it is right most of the time." },
      { t: "warn", x: "The modal verbs are irregular and extremely common: kan, vill, ska, måste, får, bör. After a modal the next verb is the bare infinitive without 'att': Jag vill äta, not Jag vill att äta." },
      { t: "key", x: "Present: -ar / -er / -r. Learn the group with the verb and the past comes free." },
      { t: "how", drill: "Verb forms", ask: "Give the present, past or supine.", steps: ["Decide the group from the infinitive.", "Apply the group's ending.", "Strong verbs: the vowel change is memorised, not derived."], tip: "Chant the four forms: skriva, skriver, skrev, skrivit. Rhythm is memory." }
    ] });
  add({ id: "sv_v2", mode: "svv2", pass: 7, of: 10, title: "Verb second", sub: "The word-order rule that runs Swedish", gist: "In a main clause the verb is always the second element. Whatever comes first, the verb comes next, then the subject.",
    blocks: [
      { t: "p", x: "This is the single most important rule in Swedish grammar and the one English speakers break for years. In a main clause, the finite verb sits in position two. If the sentence starts with the subject, that looks like English: Jag äter fisk idag. But start with anything else, and the verb still comes second, so the subject moves after it: Idag äter jag fisk. Never 'Idag jag äter'." },
      { t: "rule", x: "[first element] [VERB] [subject] [rest]\nIdag äter jag fisk. · På lördag spelar vi hockey. · Därför tar jag bussen.", note: "The first element can be a time, a place, an object, a whole clause. The verb is the pivot." },
      { t: "tbl", head: ["English order", "Swedish order"], rows: [["Today I eat fish", "Idag äter jag fisk"], ["Now she is reading", "Nu läser hon"], ["Therefore I take the bus", "Därför tar jag bussen"], ["If it rains, we stay home", "Om det regnar stannar vi hemma"]] },
      { t: "p", x: "Yes/no questions are the same rule with nothing in first position: the verb comes first, then the subject. Bor du här? Spelar hon hockey? Question words take the first slot: Var bor du?" },
      { t: "key", x: "Main clause: verb second, always. Start with a time or place and the subject jumps behind the verb. Questions: verb first." },
      { t: "how", drill: "Verb second", ask: "Which order is correct?", steps: ["Find the first element.", "Put the verb next.", "Then the subject, then everything else."], tip: "Read the options aloud: the wrong ones sound wrong faster than they look wrong." }
    ] });
  add({ id: "sv_qn", mode: "svqn", pass: 7, of: 10, title: "Questions and negation", sub: "Inte after the verb", gist: "Turn a statement into a question by moving the verb first; make it negative with 'inte' right after the verb.",
    blocks: [
      { t: "p", x: "Negation is 'inte' and it goes after the finite verb in a main clause: Jag bor inte här. Jag vill inte äta. With a question, the verb is first, then the subject, then inte: Bor du inte här? The answer to a negative question is 'jo', not 'ja'." },
      { t: "rule", x: "statement:  Du bor här.\nquestion:   Bor du här?\nnegation:   Du bor inte här.\nboth:       Bor du inte här?  — Jo!", note: "Other sentence adverbs sit in the same slot as inte: alltid, aldrig, ofta, gärna, kanske." },
      { t: "warn", x: "'Inte' is the main-clause position. In a subordinate clause (after att, om, eftersom, som) 'inte' moves in front of the verb. That is the next lesson's rule, and it is where most learners stall." },
      { t: "key", x: "Verb first for a question. 'Inte' after the verb in a main clause. 'Jo' answers a negative question." },
      { t: "how", drill: "Questions and negation", ask: "Make it a question, or make it negative.", steps: ["Question: move the verb to the front, subject second.", "Negation: keep the order and put inte after the verb.", "Type the whole sentence."], tip: "Watch the capital letter and the question mark: the grader ignores punctuation, but your writing should not." }
    ] });
  add({ id: "sv_adj", mode: "svadj", pass: 7, of: 10, title: "Adjectives agree", sub: "stor, stort, stora", gist: "An adjective takes -t with ett-words and -a in the plural and after 'the'. Three forms, learned as one chant.",
    blocks: [
      { t: "p", x: "Adjectives have three forms: the base (en-form), the -t form for ett-words, and the -a form for plurals and for definite phrases. En stor bil, ett stort hus, stora bilar, den stora bilen. Notice the last one: with 'the' the adjective takes -a even in the singular, and Swedish uses double definiteness, den + -a + -en." },
      { t: "rule", x: "en stor bil · ett stort hus · stora bilar\nden stora bilen · det stora huset · de stora bilarna", note: "Double definiteness: the article in front and the ending on the noun, both at once." },
      { t: "tbl", head: ["Ending", "ett-form", "Example"], rows: [["most", "add -t", "stor → stort, kall → kallt"], ["vowel + d or t", "-tt", "ny → nytt, vit → vitt, röd → rött"], ["consonant + d", "replace with -t", "hård → hårt, mild → milt"], ["ends in -t already", "unchanged", "trött → trött"], ["-el, -en, -er", "plural drops the e", "enkel → enkla, vacker → vackra"], ["liten", "irregular", "liten, litet, små; den lilla"]] },
      { t: "key", x: "-t for ett, -a for plural and after the/den/det/de. Double definiteness: den stora bilen." },
      { t: "how", drill: "Adjective agreement", ask: "Give the ett-form or the plural form.", steps: ["Ett-word? add -t (with the spelling rules).", "Plural or definite? add -a.", "Check the exceptions: liten, bra, and the -el/-en/-er drop."], tip: "Chant three forms every time: stor, stort, stora." }
    ] });
  add({ id: "sv_pron", mode: "svpron", pass: 7, of: 10, title: "Me, my, mine and 'sin'", sub: "Object and possessive pronouns", gist: "Object forms, possessives that agree with the thing owned, and the reflexive sin/sitt/sina that English does not have.",
    blocks: [
      { t: "p", x: "The object forms are mig, dig, honom, henne, den/det, oss, er, dem. Possessives agree with the noun owned, not the owner: min bil, mitt hus, mina bilar. Hans, hennes, deras and dess never change." },
      { t: "rule", x: "Han tar sin bil.   = his own car\nHan tar hans bil.  = someone else's car", note: "Sin/sitt/sina refers back to the subject of the same clause. It is the one pronoun rule that has no English parallel, and it is tested constantly." },
      { t: "tbl", head: ["Subject", "Object", "Possessive (en / ett / plural)"], rows: SV_PRON.rows.map(function (r) { return [r[0], r[1], r[2] + " / " + r[3] + " / " + r[4]]; }) },
      { t: "key", x: "Possessives agree with the thing owned: min / mitt / mina. Sin means the subject's own." },
      { t: "how", drill: "Pronouns", ask: "Give the object form or the right possessive.", steps: ["Object: after a verb or preposition.", "Possessive: match the gender and number of the owned noun.", "Reflexive: does it refer to the subject? Then sin/sitt/sina."], tip: "'Han älskar sin fru' and 'Han älskar hans fru' are two different stories." }
    ] });

  /* ---------------- stage 3: vocabulary by theme ---------------- */
  add(vocabLesson("sv_v5", "Food and drink", "The café, the table, the bill", "Enough to order, shop and talk about what you ate. Includes fika, which is not optional in Sweden.", "Food vocabulary is where you first use the language for real, so it comes early. The nouns carry their gender in the forms column: ett kaffe, en ost, ett bröd."));
  add(vocabLesson("sv_v6", "Daily life and the rink", "Routines, clothes, the game", "The verbs of a normal day and the things in it, with the sports words you will use most.", "Many daily verbs are reflexive in Swedish: klä på sig, tvätta sig, lära sig. The 'sig' changes with the subject: jag klär på mig, du klär på dig, han klär på sig."));
  add(vocabLesson("sv_v7", "Out and about", "Streets, transport, directions", "Asking the way, buying a ticket, telling someone where you are.", "Movement words come in pairs: här/hit (here, to here), där/dit (there, to there), hemma/hem (at home, homeward), var/vart (where, where to). Swedish marks direction where English does not."));
  add(vocabLesson("sv_v8", "Work and study", "The university, the office, right and wrong", "The words of a student's week: courses, tests, homework, colleagues.", "Note the pair läsa (read, or study a subject) and plugga (cram, study for a test). 'Jag läser matematik' means I am studying mathematics."));
  add(vocabLesson("sv_v9", "Body and health", "Hurting, being ill, the doctor", "What hurts, where, and since when: the words for the health centre.", "'Ha ont i' + definite noun: jag har ont i huvudet, i magen, i knät. Paired body parts have irregular plurals: hand/händer, fot/fötter, öga/ögon, öra/öron."));
  add(vocabLesson("sv_v10", "Feelings and opinions", "Glad, besviken, tycker, tror", "How you feel and what you think, with the hedges Swedes use constantly: kanske, ganska, faktiskt.", "Three verbs for 'think': tycka (hold an opinion), tro (believe something is true), tänka (use your mind, intend). Jag tycker att filmen är bra. Jag tror att det regnar. Jag tänker på dig."));
  add(vocabLesson("sv_v11", "Nature and weather", "Seasons, animals, the sky", "Swedes talk about the weather and go into the forest. These are the words for both.", "Weather sentences use 'det': det regnar, det snöar, det blåser, det är kallt. Seasons take 'på' for habit and 'i' for the coming one: på sommaren (in summer), i sommar (this summer)."));
  add(vocabLesson("sv_v12", "Society and news", "Politics, money, the world", "The vocabulary of a newspaper front page, which is where B1 reading starts.", "Abstract nouns are mostly en-words: en regering, en lösning, en åsikt. Verbs of saying take 'att' before a clause: berätta att, förklara att, mena att."));
  add(vocabLesson("sv_v13", "Connectors", "Eftersom, däremot, ändå", "The words that turn sentences into arguments. Each one also decides the word order after it.", "Subordinating conjunctions (eftersom, fastän, medan, innan, om, att, som) start a subordinate clause, where 'inte' goes before the verb. Conjunctive adverbs (därför, dessutom, däremot, ändå) start a main clause and trigger verb-second: Dessutom är det billigt."));
  add(vocabLesson("sv_v14", "Idioms and the words that make you sound Swedish", "Lagom, orka, hinna, trivas", "Thirty expressions a textbook never teaches and a Swede uses every day.", "Three verbs with no English equivalent: hinna (to have time to do something), orka (to have the energy to), trivas (to enjoy being somewhere). Jag hinner inte. Jag orkar inte. Jag trivs här. Use them and you stop sounding translated."));

  /* ---------------- stage 4: tenses and clauses ---------------- */
  add({ id: "sv_past", mode: "svtense", pass: 7, of: 10, title: "The past: preteritum and perfekt", sub: "-ade, -de, -te, -dde, and the strong verbs", gist: "Two past tenses, used almost exactly like English simple past and present perfect.",
    blocks: [
      { t: "p", x: "Preteritum is the simple past: Jag läste boken igår. Perfekt is 'har' plus the supine, for things with a connection to now: Jag har läst boken. The split matches English closely, with one difference: Swedish uses perfekt for 'I have lived here for two years' and also for news just in: Han har kommit!" },
      { t: "rule", x: "preteritum: group 1 -ade · 2a -de · 2b -te · 3 -dde · 4 vowel change\nperfekt: har + supine (-at · -t · -tt · -it)\npluskvamperfekt: hade + supine", note: "The supine is a form used only after har/hade. For groups 1 to 3 it looks like the ett-form of the participle; for strong verbs it ends in -it." },
      { t: "tbl", head: ["Infinitive", "Preteritum", "Perfekt"], rows: [["tala", "talade", "har talat"], ["ringa", "ringde", "har ringt"], ["köpa", "köpte", "har köpt"], ["bo", "bodde", "har bott"], ["skriva", "skrev", "har skrivit"], ["gå", "gick", "har gått"], ["vara", "var", "har varit"], ["göra", "gjorde", "har gjort"]] },
      { t: "ex", title: "Worked example", facts: [["Present", "Vi spelar hockey."], ["Ask", "past and perfect"]], steps: ["spela: ends in -a, group 1.", "Preteritum: spelade. Vi spelade hockey.", "Supine: spelat. Vi har spelat hockey."], punch: "For group 1, which is most verbs, the past is -ade and -at. Learn the strong verbs as a list." },
      { t: "key", x: "Preteritum for a finished time (igår). Perfekt (har + supine) for a link to now. Group 1: -ade / -at." },
      { t: "how", drill: "Tenses", ask: "Put the sentence in the past, the perfect, or the future.", steps: ["Find the verb and its group.", "Preteritum: the group's past ending. Perfekt: har + supine.", "Future: ska + infinitive, or kommer att + infinitive."], tip: "Strong verbs come in families: skriva/skrev/skrivit, driva/drev/drivit, bita/bet/bitit. Learn one, get five." }
    ] });
  add({ id: "sv_mod", mode: "svtense", pass: 7, of: 10, title: "Future and modals", sub: "ska, kommer att, vill, kan, måste, bör", gist: "Future is 'ska' (intention) or 'kommer att' (prediction). Modals take a bare infinitive.",
    blocks: [
      { t: "p", x: "Swedish has no future tense ending. 'Ska' expresses intention or plan: Jag ska åka till Stockholm. 'Kommer att' expresses prediction: Det kommer att regna. In speech the present tense with a time word is the most common future of all: Jag åker imorgon." },
      { t: "tbl", head: ["Modal", "Meaning", "Example"], rows: [["kan", "can, is able", "Jag kan simma."], ["vill", "wants to (never 'will'!)", "Jag vill äta."], ["ska", "shall, is going to", "Vi ska spela."], ["måste", "must", "Du måste komma."], ["får", "may, is allowed to", "Får jag fråga?"], ["bör / borde", "should / ought to", "Du borde sova."], ["behöver", "needs to", "Jag behöver inte gå."]] },
      { t: "rule", x: "modal + bare infinitive (no 'att')\nJag vill äta. · Vi måste gå. · Hon kan komma.", note: "'Vill' means want. 'Jag vill komma' is 'I want to come', not 'I will come'. The false friend costs everyone once." },
      { t: "key", x: "Ska = intention, kommer att = prediction, present + time word = everyday future. Modals take the bare infinitive." },
      { t: "how", drill: "Tenses", ask: "Put the sentence in the future.", steps: ["ska + infinitive is accepted for every future answer.", "Watch the infinitive: no -r, no 'att'."], tip: "Listen for how rarely Swedes say 'ska': the present tense does most of the work." }
    ] });
  add({ id: "sv_biff", mode: "svbiff", pass: 7, of: 10, title: "Subordinate clauses and BIFF", sub: "I bisats kommer inte före det finita verbet", gist: "After att, om, eftersom, som and the rest, 'inte' moves in front of the verb. Swedish teachers call it BIFF.",
    blocks: [
      { t: "p", x: "Main clauses put 'inte' after the verb. Subordinate clauses, the ones introduced by att, om, eftersom, när, som, fastän, medan, innan, put 'inte' and every other sentence adverb before the verb. The mnemonic BIFF: Bisats, Inte Före det Finita verbet." },
      { t: "rule", x: "main:        Han kommer inte.\nsubordinate: Jag vet att han inte kommer.\n             Vi går ut om det inte regnar.", note: "The same slot holds alltid, aldrig, ofta, kanske: Jag vet att han aldrig kommer." },
      { t: "tbl", head: ["Starts a subordinate clause", "Starts a main clause (verb second)"], rows: [["att, om, eftersom, därför att", "därför, alltså"], ["när, medan, innan, efter att, tills", "sedan, då (then)"], ["fastän, trots att", "ändå, däremot"], ["som (who/which)", "dessutom, nämligen"]] },
      { t: "p", x: "A second effect: when a subordinate clause comes first, it is the whole first element, so the main clause verb follows immediately, before the subject. Om det regnar stannar vi hemma. Eftersom jag var trött gick jag hem." },
      { t: "key", x: "BIFF: in a subordinate clause, inte before the verb. A fronted subordinate clause counts as position one, so the main verb comes next." },
      { t: "how", drill: "Clauses", ask: "Which version is correct?", steps: ["Find the conjunction. Subordinate? inte goes before the verb.", "Main clause after a fronted clause? verb before subject."], tip: "Hear it: 'att han inte kommer' has the rhythm of a Swedish sentence; 'att han kommer inte' does not." }
    ] });
  add({ id: "sv_pass", mode: "svpass", pass: 6, of: 8, title: "The -s passive", sub: "Svenska talas i Sverige", gist: "Add -s to the verb and the object becomes the subject. Also used for reciprocals and a few verbs that are always -s.",
    blocks: [
      { t: "p", x: "The passive is formed by adding -s to any tense of the verb: talas, talades, har talats. It is the normal passive in writing and instructions: Biljetter säljs här. Dörrarna stängs. The alternative with bli + participle (blev stängd) stresses the event." },
      { t: "rule", x: "present: talar → talas · past: talade → talades · supine: talat → talats\ngroup 2 present drops the -r: köper → köps · ringer → rings", note: "A few verbs are always -s (deponent) with active meaning: hoppas, finnas, trivas, minnas, lyckas, andas." },
      { t: "tbl", head: ["Active", "Passive"], rows: SV_PASSIVE.map(function (r) { return [r[0], r[1]]; }) },
      { t: "key", x: "Add -s for the passive. Hoppas, finnas, trivas, minnas are -s verbs with active meaning." },
      { t: "how", drill: "Passive", ask: "Rewrite in the -s passive.", steps: ["Find the object; it becomes the subject.", "Add -s to the verb in the same tense.", "Drop the agent unless it matters (av + agent)."], tip: "'Det finns' (there is) is the most common -s verb of all, and you already use it." }
    ] });

  /* ---------------- stage 5: conversation ---------------- */
  add({ id: "sv_conv", mode: "none", title: "Conversation practice", sub: "Six scripted scenarios with a partner", gist: "Dialogues where you must answer, graded on whether your reply does the job. Speaking is a skill of production: nothing else trains it.",
    apply: "conv",
    blocks: [
      { t: "p", x: "Reading and listening build a passive store; speaking builds the retrieval paths that let you use it under time pressure. Swain's output hypothesis and the interaction research since (Long, Mackey) show that producing language and getting corrected is what turns knowledge into fluency. Without an immersion environment, the substitute is scripted conversation with feedback, which is what the Apply tab holds." },
      { t: "tbl", head: ["Scenario", "Level", "You practise"], rows: SV_DIALOGUES.map(function (d) { return [d.title, d.level, d.setting]; }) },
      { t: "p", x: "How to use it: read the partner's line (and listen, if a voice is installed), then type your reply, or speak it if the device can listen. The grader checks that your reply does what the turn asks: it is lenient about wording and strict about function. Then compare with the model answer and say it aloud. Repeat the scenario until you can do it without the hints, then without looking at the partner's text." },
      { t: "key", x: "A conversation a day. Say every model answer out loud three times. Shadow the partner's lines: repeat them half a second behind the voice." }
    ] });
  add({ id: "sv_shadow", mode: "none", title: "Shadowing and the voice", sub: "Train the mouth, not just the eye", gist: "Shadowing: repeat native speech a half-second behind it, matching rhythm and melody. Twenty minutes a day is the single most effective pronunciation method known.",
    blocks: [
      { t: "p", x: "Alexander Arguelles' shadowing technique, now backed by a body of research on pronunciation and listening fluency, is simple: play natural speech and speak along with it, slightly behind, copying the melody rather than thinking about the words. Do it walking, at full voice. The app's listening drills and dialogues are shadowable if a Swedish voice is installed; for real speech, the sources below are free." },
      { t: "tbl", head: ["Source", "What it is"], rows: [["Sveriges Radio: Radio Sweden på lätt svenska", "News in slow, simple Swedish, daily. The best A2–B1 listening there is."], ["SVT Play: Nyheter på lätt svenska", "Short TV news in easy Swedish, with subtitles."], ["8 Sidor", "A newspaper written in plain Swedish, with audio."], ["UR Språkplay", "Swedish TV with learner subtitles and word lookup."], ["SVT Play, SR", "Everything else: dramas, podcasts, sport. Hockey commentary is excellent shadowing material because you know what is happening."]] },
      { t: "rule", x: "daily: 10 min shadowing + 10 min dialogue + reviews\nweekly: one 30-minute listen without subtitles, logged in the immersion log", note: "Log your minutes on the Level page. The hours count toward your level, because they are the part of the FSI estimate the drills cannot supply." },
      { t: "key", x: "Shadow aloud daily. Log the minutes. The ear and the mouth are muscles." }
    ] });

  /* ---------------- stage 6: reading and listening ---------------- */
  SV_READINGS.forEach(function (R) {
    add({ id: R.id, mode: "quiz", pass: Math.max(2, R.qs.length - 1), of: R.qs.length, title: R.title, sub: "Reader · " + R.level, gist: R.text[0].slice(0, 90) + "…", reading: R,
      quiz: R.qs.map(function (q) { return { q: q.q, options: q.options, answer: q.answer }; }),
      blocks: [{ t: "p", x: "Read it once for the gist without stopping. Read it again with the glossary. Then listen to it (the speaker button reads it aloud) with your eyes closed. Then answer the questions." }]
        .concat(R.text.map(function (p) { return { t: "p", x: p, lang: "sv" }; }))
        .concat([{ t: "tbl", head: ["Word", "Meaning"], rows: R.gloss }, { t: "key", x: "Extensive reading, lots of easy text, is the fastest route to vocabulary after the first thousand words (Nation, Krashen). Finish every reader here, then move to 8 Sidor and children's books." }]) });
  });
  add({ id: "sv_dict", mode: "svdict", pass: 6, of: 8, title: "Dictation", sub: "Hear it, write it", gist: "Sentences read aloud at natural speed; you type them. Dictation trains the ear, the spelling and the grammar at once.",
    blocks: [
      { t: "p", x: "Dictation is an old method that modern research keeps vindicating: it forces full attention to every sound and every ending. The sentences rise from A1 to B2. If no Swedish voice is installed, the sentence is shown for a few seconds instead, then hidden: that is a memory-span exercise, also worthwhile." },
      { t: "key", x: "Listen twice, write once, then compare letter by letter. The errors are your weak sounds." },
      { t: "how", drill: "Dictation", ask: "Type what you heard.", steps: ["Press play (or read, then wait for the text to hide).", "Type the whole sentence.", "Compare: punctuation and case are ignored, letters are not."], tip: "Say the sentence back to yourself before typing. Holding it in the mouth is easier than in the eye." }
    ] });
  add({ id: "sv_write", mode: "svwrite", pass: 6, of: 8, title: "Writing: translate the sentence", sub: "English in, Swedish out", gist: "Short sentences to translate, from A1 to B2, each with several accepted answers. This is where word order and agreement get tested together.",
    blocks: [
      { t: "p", x: "Translation into the language is unfashionable and effective. It is the purest production task there is: every word, every ending and the order are yours to get right. The sentences are built on the grammar lessons: verb second, inte, BIFF, the tenses, the passive." },
      { t: "key", x: "Write the sentence, then check it against the rules you know: verb second? inte in the right slot? adjective agreeing?" },
      { t: "how", drill: "Writing", ask: "Translate into Swedish.", steps: ["Find the verb and put it second (main clause).", "Place inte / the sentence adverb.", "Check gender, plural, agreement."], tip: "When your answer differs from the model, ask whether it is wrong or just different. The grader accepts several versions; a Swede would accept more." }
    ] });

  /* ---------------- stage 7: the pro path ---------------- */
  add({ id: "sv_pro", mode: "none", title: "From B1 to native: the programme", sub: "What the app cannot drill, and how to do it anyway", gist: "Past B1 the limiting factor is hours of input and output, not rules. Here is the plan, the hour targets, and how the app tracks them.",
    blocks: [
      { t: "p", x: "The honest picture. The US Foreign Service Institute, which has trained diplomats in Swedish for seventy years with the most intensive method ever run at scale (and is what people usually mean by 'the CIA method'; the CIA itself uses the same FSI/DLI programmes), puts Swedish in its easiest category: about 600–750 classroom hours to professional working proficiency, roughly C1. That is with five hours of class a day plus homework. There is no shortcut around the hours; there are shortcuts around wasting them, and they are built into this course: spaced retrieval, speed gates, interleaving, output with feedback, and sounds before words before grammar." },
      { t: "tbl", head: ["Level", "What it looks like", "Hours (rough)", "What to do"], rows: [["A1–A2", "Survive: order, ask, introduce", "0–150", "This course's stages 0–5, daily reviews"], ["B1", "Hold a conversation, read easy news", "150–350", "Readers here, then 8 Sidor daily; one scripted dialogue a day; shadowing"], ["B2", "Fluent conversation, native TV with subtitles", "350–600", "An hour of native input a day (SVT, SR); write 100 words a day; a tutor or tandem partner twice a week"], ["C1", "Professional use, argue, read anything", "600–900", "Native input without subtitles, books, long-form podcasts; speak daily; study register and idiom"], ["C2", "Near-native nuance", "1000+", "Live in the language: read widely, write for real readers, get corrected by natives"]] },
      { t: "rule", x: "the level model = words known + grammar passed + applied skill + logged hours\nhours count toward 700, the FSI estimate", note: "Log every minute of real input and output on the Level page. The drills get you to B1; the log is what gets you past it, and the calendar schedules it like any other session." },
      { t: "p", x: "Tandem speaking without immersion: find a Swede learning English (Tandem, HelloTalk, or the Swedish Hockey League's English-speaking fan forums) and trade thirty minutes each way, twice a week. Record yourself. Shadow the recording. It is the closest thing to immersion that exists outside Sweden, and the research on output and interaction says it is most of what immersion does anyway." },
      { t: "key", x: "After B1: an hour of native input a day, written output daily, spoken output twice a week with a native, everything logged. The calendar will hold you to it." }
    ] });

  /* ---------------- the path ---------------- */
  var PATH = [
    { title: "Sounds", sub: "Train the ear first", blurb: "The nine vowels, long and short, and the consonant rules that make Swedish spelling honest.", ids: ["sv_alpha", "sv_pairs", "sv_cons"] },
    { title: "First words", sub: "The hundred that cover half of speech", blurb: "Pronouns, the core verbs, numbers, time and the first nouns, each on its own schedule.", ids: ["sv_v1", "sv_v2", "sv_num", "sv_v3", "sv_v4"] },
    { title: "Grammar core", sub: "Gender, forms, verb second", blurb: "The machinery: en/ett, noun forms, the four verb groups, verb-second order, questions, negation, agreement, pronouns.", ids: ["sv_gender", "sv_nouns", "sv_pres", "sv_v2", "sv_qn", "sv_adj", "sv_pron"] },
    { title: "Vocabulary by theme", sub: "Toward a thousand words", blurb: "Food, daily life, the city, work, the body, feelings, nature, society, connectors, idioms.", ids: ["sv_v5", "sv_v6", "sv_v7", "sv_v8", "sv_v9", "sv_v10", "sv_v11", "sv_v12", "sv_v13", "sv_v14"] },
    { title: "Tenses and clauses", sub: "Past, future, BIFF, passive", blurb: "The two pasts, the futures and modals, subordinate word order, and the -s passive.", ids: ["sv_past", "sv_mod", "sv_biff", "sv_pass"] },
    { title: "Conversation", sub: "Output with feedback", blurb: "Scripted scenarios you must answer, and shadowing to build the voice.", ids: ["sv_conv", "sv_shadow"] },
    { title: "Reading and listening", sub: "Graded readers, dictation, writing", blurb: "Six readers from A1 to B2 with questions, dictation at speed, and translation into Swedish.", ids: SV_READINGS.map(function (r) { return r.id; }).concat(["sv_dict", "sv_write"]) },
    { title: "The pro path", sub: "B1 to native", blurb: "Hours, sources, tandem speaking, and how the level model tracks the part the drills cannot do.", ids: ["sv_pro"] }
  ];

  /* ---------------- drills ---------------- */
  function pick(a, rnd) { return a[((rnd || Math.random)() * a.length) | 0]; }
  function tts(text, caps) { return caps && caps.tts ? { text: text, lang: "sv-SE" } : null; }
  var DRILLS = {
    svletter: { name: "Letters", target: 6, gen: function (ctx) {
      var row = pick(SV_LETTERS, ctx.rnd), others = lgShuffle(SV_LETTERS.filter(function (r) { return r !== row; }).slice(), ctx.rnd).slice(0, 3);
      return { kind: "choice", question: "Which sound does <b class='tw'>" + row[0] + "</b> make?", options: lgShuffle([row[1]].concat(others.map(function (r) { return r[1]; })), ctx.rnd), answer: row[1], target: 6, explain: ["<b>" + row[0] + "</b>: " + row[1]], speakAfter: tts(row[0], ctx.caps) };
    } },
    svpair: { name: "Long or short", target: 6, gen: function (ctx) {
      var p = pick(SV_PAIRS, ctx.rnd), which = ctx.rnd() < 0.5 ? 0 : 1, word = p[which];
      var expl = ["<b>" + p[0] + "</b> (long vowel) / <b>" + p[1] + "</b> (short vowel): " + p[2]];
      if (ctx.caps && ctx.caps.tts) return { kind: "choice", question: "Listen. Which word did you hear?", options: [p[0], p[1]], answer: word, target: 6, explain: expl, speak: { text: word, lang: "sv-SE" }, hideText: true };
      return { kind: "choice", question: "Which spelling has the <b>" + (which ? "short" : "long") + "</b> vowel? (" + p[2] + ")", options: [p[0], p[1]], answer: word, target: 6, explain: expl };
    } },
    svsound: { name: "Sound rules", target: 6, gen: function (ctx) {
      var row = pick(SV_SOUNDS, ctx.rnd), opts = lgShuffle([row[1]].concat(lgShuffle(SV_SOUND_RULES.filter(function (r) { return r !== row[1]; }).slice(), ctx.rnd).slice(0, 3)), ctx.rnd);
      return { kind: "choice", question: "How is the first consonant of <b class='tw'>" + row[0] + "</b> (" + row[2] + ") pronounced?", options: opts, answer: row[1], target: 6, explain: ["<b>" + row[0] + "</b>: " + row[1] + ". Look at the vowel after it: e, i, y, ä, ö soften k, g and sk."], speakAfter: tts(row[0], ctx.caps) };
    } },
    svnum: { name: "Numbers", target: 9, gen: function (ctx) {
      var n = ctx.rnd() < 0.4 ? (ctx.rnd() * 21) | 0 : ctx.rnd() < 0.7 ? 20 + ((ctx.rnd() * 80) | 0) : 100 + ((ctx.rnd() * 900) | 0);
      var w = lgNumberWords("sv", n);
      return { kind: "text", question: "Write <b>" + n + "</b> in Swedish.", answer: w, accept: [w, w.replace(/ /g, "")], target: 9, explain: ["<b>" + n + "</b> = " + w], speakAfter: tts(w, ctx.caps) };
    } },
    svgender: { name: "En or ett", target: 5, gen: function (ctx) { return lgFormQ(SV_GENDER, "sv", ctx.rnd, ctx.caps); } },
    svnoun: { name: "Noun forms", target: 9, gen: function (ctx) { return lgFormQ(SV_NOUNS, "sv", ctx.rnd, ctx.caps); } },
    svverb: { name: "Verb forms", target: 9, gen: function (ctx) { return lgFormQ(SV_VERBS, "sv", ctx.rnd, ctx.caps); } },
    svadj: { name: "Adjective agreement", target: 7, gen: function (ctx) { return lgFormQ(SV_ADJ, "sv", ctx.rnd, ctx.caps); } },
    svpron: { name: "Pronouns", target: 6, gen: function (ctx) { return lgFormQ(SV_PRON, "sv", ctx.rnd, ctx.caps); } },
    svv2: { name: "Verb second", target: 8, gen: function (ctx) {
      var r = pick(SV_V2, ctx.rnd), S = r[0], Vb = r[1], O = r[2], A = r[3];
      var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
      var right = cap(A + " " + Vb + " " + S + (O ? " " + O : "")) + ".";
      var wrong1 = cap(A + " " + S + " " + Vb + (O ? " " + O : "")) + ".";
      var wrong2 = cap(S + " " + A + " " + Vb + (O ? " " + O : "")) + ".";
      var alt = cap(S + " " + Vb + (O ? " " + O : "") + " " + A) + ".";
      return { kind: "choice", question: "Which order is correct? <small>(" + r[4] + ", starting with <b>" + A + "</b>)</small>", options: lgShuffle([right, wrong1, wrong2], ctx.rnd), answer: right, target: 8,
        explain: ["<b>" + right + "</b>", "Verb second: '" + A + "' takes the first slot, so the verb '" + Vb + "' comes next and the subject '" + S + "' follows it.", "Starting with the subject is also fine: " + alt], speakAfter: tts(right, ctx.caps) };
    } },
    svqn: { name: "Questions and negation", target: 10, gen: function (ctx) {
      var r = pick(SV_QN, ctx.rnd), ask = ctx.rnd() < 0.5 ? 1 : 2;
      return { kind: "text", question: (ask === 1 ? "Make it a yes/no question: " : "Make it negative: ") + "<b class='tw'>" + r[0] + "</b> <small>(" + r[3] + ")</small>", answer: r[ask], accept: [r[ask]], target: 10,
        explain: ["<b>" + r[ask] + "</b>", ask === 1 ? "Question: the verb moves to the front, the subject follows." : "Negation: inte goes straight after the verb in a main clause."], speakAfter: tts(r[ask], ctx.caps) };
    } },
    svtense: { name: "Tenses", target: 12, gen: function (ctx) {
      var r = pick(SV_TENSE, ctx.rnd), k = 1 + ((ctx.rnd() * 3) | 0), names = ["", "past (preteritum)", "perfect (perfekt)", "future"];
      var acc = [r[k]]; if (k === 3) acc.push(r[3].replace(" ska ", " kommer att "));
      return { kind: "text", question: "Put it in the <b>" + names[k] + "</b>: <b class='tw'>" + r[0] + "</b> <small>(" + r[4] + ")</small>", answer: r[k], accept: acc, target: 12,
        explain: ["<b>" + r[k] + "</b>", "Present: " + r[0] + " · Past: " + r[1] + " · Perfect: " + r[2] + " · Future: " + r[3]], speakAfter: tts(r[k], ctx.caps) };
    } },
    svbiff: { name: "Clauses", target: 8, gen: function (ctx) {
      var r = pick(SV_BIFF, ctx.rnd), right = r[1];
      /* build the wrong version by swapping inte and the verb */
      var parts = right.split(" "), i = parts.indexOf("inte"), w2 = parts.slice();
      if (i > 0 && i + 1 < parts.length) { var t = w2[i]; w2[i] = w2[i + 1]; w2[i + 1] = t; }
      var wrong = w2.join(" ");
      return { kind: "choice", question: "Which is correct? <small>(" + r[2] + ")</small>", options: lgShuffle([right, wrong], ctx.rnd), answer: right, target: 8,
        explain: ["<b>" + right + "</b>", "BIFF: in a subordinate clause, inte comes before the verb. In the main clause it would be: " + r[0]], speakAfter: tts(right, ctx.caps) };
    } },
    svpass: { name: "Passive", target: 12, gen: function (ctx) {
      var r = pick(SV_PASSIVE, ctx.rnd);
      return { kind: "text", question: "Rewrite in the -s passive: <b class='tw'>" + r[0] + "</b> <small>(" + r[2] + ")</small>", answer: r[1], accept: [r[1]], target: 12, explain: ["<b>" + r[1] + "</b>", "The object becomes the subject and the verb takes -s in the same tense."], speakAfter: tts(r[1], ctx.caps) };
    } },
    svdict: { name: "Dictation", target: 20, gen: function (ctx) {
      var r = pick(SV_DICTATION, ctx.rnd);
      return { kind: "text", question: "Type what you " + (ctx.caps && ctx.caps.tts ? "hear" : "read, after it hides") + ". <small>(" + r[1] + ")</small>", answer: r[0], accept: [r[0]], target: 20, explain: ["<b>" + r[0] + "</b>"], speak: tts(r[0], ctx.caps), flash: !(ctx.caps && ctx.caps.tts) ? r[0] : null, hideText: true };
    } },
    svwrite: { name: "Writing", target: 20, gen: function (ctx) {
      var r = pick(SV_WRITING, ctx.rnd);
      return { kind: "text", question: "Translate into Swedish: <b>" + r[0] + "</b> <small>(" + r[2] + ")</small>", answer: r[1][0], accept: r[1], target: 20, explain: ["<b>" + r[1][0] + "</b>" + (r[1].length > 1 ? " (also: " + r[1].slice(1).join(" / ") + ")" : "")], speakAfter: tts(r[1][0], ctx.caps) };
    } }
  };

  /* ---------------- reference cards ---------------- */
  var FORMULAS = [
    { id: "sv_vlen", name: "Vowel length", topic: "Sounds", lesson: "sv_alpha", f: "long before one consonant, short before two", anchors: [["tak / tack", "roof / thanks"], ["vit / vitt", "white (en / ett)"]], note: "Length changes the word, so hear it before you spell it." },
    { id: "sv_soft", name: "Soft vowels", topic: "Sounds", lesson: "sv_cons", f: "e i y ä ö → k = tj, g = j, sk = sj", anchors: [["kök", "tjöök"], ["göra", "jöra"], ["sked", "sj-eed"]], note: "sj, skj, stj, sch, -tion are always the sj-sound." },
    { id: "sv_def", name: "Definite endings", topic: "Nouns", lesson: "sv_nouns", f: "en-word + -en / -n · ett-word + -et / -t", anchors: [["bil → bilen", ""], ["hus → huset", ""], ["gata → gatan", ""]], note: "The article attaches to the end." },
    { id: "sv_plur", name: "Plural declensions", topic: "Nouns", lesson: "sv_nouns", f: "-or · -ar · -er · -n · ∅", anchors: [["flickor", "en, -a"], ["bilar", "en"], ["städer", "loan / umlaut"], ["äpplen", "ett, vowel"], ["hus", "ett, consonant"]], note: "Definite plural adds -na, -a or -en." },
    { id: "sv_groups", name: "Verb groups", topic: "Verbs", lesson: "sv_pres", f: "1: -ar -ade -at · 2: -er -de/-te -t · 3: -r -dde -tt · 4: -er, vowel change, -it", anchors: [["tala", "talar talade talat"], ["köpa", "köper köpte köpt"], ["bo", "bor bodde bott"], ["skriva", "skriver skrev skrivit"]], note: "Guess group 1 for an unknown -a verb." },
    { id: "sv_v2f", name: "Verb second", topic: "Word order", lesson: "sv_v2", f: "[X] [verb] [subject] [rest]", anchors: [["Idag äter jag fisk", "time first"], ["Bor du här?", "question: verb first"]], note: "Whatever X is, the verb is next." },
    { id: "sv_inte", name: "Where inte goes", topic: "Word order", lesson: "sv_biff", f: "main: verb + inte · subordinate: inte + verb", anchors: [["Han kommer inte", "main"], ["att han inte kommer", "subordinate"]], note: "BIFF. The same slot for alltid, aldrig, ofta, kanske." },
    { id: "sv_agr", name: "Adjective agreement", topic: "Adjectives", lesson: "sv_adj", f: "en: stor · ett: stort · plural / definite: stora", anchors: [["den stora bilen", "double definiteness"]], note: "Vowel + d/t gives -tt: nytt, vitt." },
    { id: "sv_sin", name: "Sin vs hans", topic: "Pronouns", lesson: "sv_pron", f: "sin / sitt / sina = the subject's own", anchors: [["Han tar sin bil", "his own"], ["Han tar hans bil", "another's"]], note: "" },
    { id: "sv_tenses", name: "The tenses", topic: "Verbs", lesson: "sv_past", f: "preteritum · har + supine · hade + supine · ska / kommer att + infinitive", anchors: [["Jag läste", "finished time"], ["Jag har läst", "link to now"], ["Jag ska läsa", "plan"]], note: "Present + time word is the everyday future." },
    { id: "sv_modal", name: "Modals", topic: "Verbs", lesson: "sv_mod", f: "kan · vill · ska · måste · får · bör + bare infinitive", anchors: [["vill", "wants to, never 'will'"]], note: "" },
    { id: "sv_s", name: "The -s passive", topic: "Verbs", lesson: "sv_pass", f: "verb + s, any tense", anchors: [["talas", "is spoken"], ["såldes", "was sold"]], note: "Deponents: hoppas, finnas, trivas, minnas." },
    { id: "sv_time", name: "Telling the time", topic: "Numbers", lesson: "sv_num", f: "halv fyra = 3:30 · kvart över / i · fem över halv", anchors: [["halv fyra", "3:30"], ["kvart i fyra", "3:45"]], note: "Halv = half way to the next hour." },
    { id: "sv_fsi", name: "Hours to proficiency", topic: "The path", lesson: "sv_pro", f: "FSI category I: 600–750 hours to C1", anchors: [["A2", "~150 h"], ["B1", "~350 h"], ["B2", "~600 h"]], note: "Log the hours; the level model counts them." }
  ];
  var GLOSSARY = [
    ["en-word", ["en-words", "common gender"], "A noun that takes the article en and the definite ending -en. About three quarters of nouns.", "sv_gender"],
    ["ett-word", ["ett-words", "neuter"], "A noun that takes ett and the definite ending -et.", "sv_gender"],
    ["supine", ["supinum"], "The verb form used after har and hade: talat, köpt, skrivit.", "sv_past"],
    ["preteritum", ["simple past"], "The past tense for a finished time: igår läste jag.", "sv_past"],
    ["BIFF", [], "Bisats: Inte Före det Finita verbet. In a subordinate clause, inte precedes the verb.", "sv_biff"],
    ["verb second", ["V2"], "The main-clause rule: the finite verb is the second element, whatever comes first.", "sv_v2"],
    ["double definiteness", [], "Den stora bilen: the article in front and the ending on the noun, together.", "sv_adj"],
    ["sj-sound", ["sj-ljud"], "The breathy back fricative in sju, sked, station.", "sv_cons"],
    ["tj-sound", ["tj-ljud"], "The soft 'ch' in kjol, kyrka, tjugo, kök.", "sv_cons"],
    ["shadowing", [], "Speaking along with native audio half a second behind it, copying rhythm and melody.", "sv_shadow"],
    ["CEFR", ["A1", "A2", "B1", "B2", "C1", "C2"], "The European scale of language levels from A1 (beginner) to C2 (mastery).", "sv_pro"],
    ["FSI", ["Foreign Service Institute", "DLI"], "The US diplomatic language school whose hour estimates are the best-known measure of how long a language takes.", "sv_pro"],
    ["lagom", [], "Just the right amount: the word Swedes use to describe themselves.", "sv_v14"],
    ["fika", [], "Coffee with something sweet and, above all, a pause with other people.", "sv_v5"]
  ];
  var READING = [
    { g: "Method", items: [
      ["Fluent Forever", "Gabriel Wyner. Sounds first, personal flashcards, spaced repetition. The method this course's language stages follow."],
      ["How Languages Are Learned", "Lightbown and Spada. The research on second-language acquisition, readable."],
      ["Learning Vocabulary in Another Language", "Paul Nation. Frequency, coverage, and why the first 2,000 words matter most."],
      ["Make It Stick", "Brown, Roediger and McDaniel. Retrieval, spacing, interleaving: the science the schedule is built on."]
    ] },
    { g: "Swedish", items: [
      ["Rivstart A1+A2 / B1+B2", "Levy Scherrer and Lindemalm. The standard Swedish coursebook series, with audio."],
      ["Svenska Akademiens ordlista (SAOL)", "The authoritative spelling and inflection list, free online and as an app."],
      ["Lexin", "The Swedish Institute for Language and Folklore's learner dictionary, with audio and pictures."],
      ["8 Sidor", "News in easy Swedish, with audio. Daily reading from B1."],
      ["Radio Sweden på lätt svenska", "Sveriges Radio's daily slow news. The best listening at A2–B1."]
    ] },
    { g: "Past B2", items: [
      ["Pippi Långstrump, then Män som hatar kvinnor", "Astrid Lindgren for the first novel; Stieg Larsson once you can read a page without the dictionary."],
      ["SVT Play and SR Play", "Everything Swedish television and radio make, free, with subtitles. Hockey is on both."],
      ["Swedex / TISUS", "The official Swedish proficiency tests, if you want a certificate to aim at."]
    ] }
  ];

  var RANKS = [{ xp: 0, name: "Nybörjare" }, { xp: 300, name: "Elev" }, { xp: 1000, name: "Pratare" }, { xp: 2500, name: "Läsare" }, { xp: 5000, name: "Talare" }, { xp: 9000, name: "Flytande" }, { xp: 15000, name: "Infödd" }, { xp: 25000, name: "Mästare" }];

  registerCourse({
    id: "sv", name: "Swedish", short: "SV", glyph: "Sv", kind: "lang", lang: "sv", color: "#5B8CC4",
    tagline: "Reading, writing, listening and speaking, from the alphabet to native.",
    blurb: "Sounds first, then the thousand words that matter, then the grammar that holds them, then output under pressure: scripted conversations, dictation, translation, and a logged immersion programme to the C levels.",
    path: PATH, lessons: LESSONS, drills: DRILLS, vocab: V, formulas: FORMULAS, glossary: GLOSSARY, reading: READING, ranks: RANKS,
    dialogues: SV_DIALOGUES, readings: SV_READINGS, need: 700,
    apply: [{ id: "conv", label: "Conversation", blurb: "Six scenarios, graded turn by turn", min: 12 }, { id: "listen", label: "Dictation", blurb: "Hear it, write it", min: 8 }, { id: "write", label: "Writing", blurb: "Translate into Swedish", min: 8 }, { id: "log", label: "Immersion log", blurb: "Log native input and output", min: 0 }]
  });
})();
