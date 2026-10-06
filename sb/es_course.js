/* ============================================================
   SPANISH: the course
   Eight stages from the sounds to a C-level programme. Spanish is
   FSI category I like Swedish (about 600–750 hours), with a bigger
   verb system and a smaller sound system. Same engine, same path
   shape as the other languages.
   ============================================================ */
(function () {
  var V = ES_VOCAB;
  function tblOf(rows) { return { t: "tbl", head: ["Spanish", "Meaning", "Example"], rows: rows.map(function (r) { return [r[0], r[1], r[4]]; }) }; }
  function vocabLesson(id, title, sub, gist, intro, extra) {
    return { id: id, mode: "words:" + id, pass: 8, of: 10, title: title, sub: sub, gist: gist, vocab: true,
      blocks: [{ t: "p", x: intro }].concat(extra || []).concat([tblOf(V[id]),
        { t: "key", x: "Read each word aloud, cover the meaning, say it, uncover. Then the other way. The checkpoint tests recognition; the schedule hardens it into production, dictation and speech." },
        { t: "how", drill: "Vocabulary", ask: "What does it mean? Which word is it? Type it. Fill the gap. Type what you heard. Say it.",
          steps: ["Each word is its own skill on the schedule.", "Accents count: hablo (I speak) and habló (he spoke) are different words. Type them; the on-screen keys help if you have no Spanish layout.", "If the device has a Spanish voice, listen before you look."],
          tip: "Say the example sentence aloud every time, with the stress where the rules put it." }]) };
  }
  var LESSONS = {};
  function add(L) { LESSONS[L.id] = L; return L; }

  /* ---------------- stage 0: sounds ---------------- */
  add({ id: "es_sounds", mode: "essound", pass: 8, of: 10, title: "The sounds of Spanish", sub: "Five vowels and a few consonant rules", gist: "Spanish spelling is nearly phonetic: five pure vowels, and a handful of consonant rules cover everything. Learn them in an hour and you can read anything aloud.",
    blocks: [
      { t: "p", x: "Spanish has five vowels, a e i o u, each with one sound, short and pure: no glide, no reduction, no schwa. English speakers' accent comes mostly from gliding the vowels (saying 'no' as 'no-u') and from stressing the wrong syllable. Fix the vowels first; it is the single biggest improvement available." },
      { t: "tbl", head: ["Spelling", "Sound", "Example"], rows: [["c before e, i", "s (Latin America) or th (most of Spain)", "cine, ciudad, gracias"], ["c elsewhere; qu before e, i", "k", "casa, queso, quien"], ["g before e, i; j anywhere", "a throaty h, like Scottish loch", "gente, jugar, hijo"], ["g elsewhere; gu before e, i", "g as in go (the u is silent)", "gato, guitarra"], ["h", "always silent", "hola, hielo"], ["ll, y", "y as in yes (sh/zh in Argentina)", "llave, calle, yo"], ["ñ", "ny as in canyon", "año, niño"], ["r between vowels", "a single tap", "pero, caro"], ["rr, r at the start", "rolled", "perro, carro, rosa"], ["z", "s (Latin America) or th (Spain)", "zapato, luz"], ["b, v", "the same sound, a soft b", "vivir, beber"]] },
      { t: "rule", x: "five vowels, one sound each · c/g soften before e and i · h silent · ñ = ny · rr rolled · b = v", note: "Seseo (c and z as s) is the pronunciation of all of Latin America and of the Canaries and parts of Andalusia. Either is correct; pick one and keep it." },
      { t: "key", x: "Pure vowels. c and g soft before e, i. h silent. ñ, ll, rr. b and v the same." },
      { t: "how", drill: "Sound rules", ask: "How is the marked consonant pronounced?", steps: ["Find the consonant and the vowel after it.", "e or i after c/g: soft.", "Check the fixed rules: h, ñ, ll, rr, qu/gu."], tip: "Say the word before you answer. The rule should live in the mouth." }
    ] });
  add({ id: "es_stress", mode: "esstress", pass: 8, of: 10, title: "Stress and the accent mark", sub: "Where the weight falls", gist: "Two rules decide the stress of every Spanish word, and the written accent marks the exceptions. Get this right and you sound Spanish; get it wrong and hablo becomes habló.",
    blocks: [
      { t: "p", x: "Rule one: a word ending in a vowel, n or s is stressed on the second-to-last syllable (CA-sa, CAN-tan, LU-nes). Rule two: a word ending in any other consonant is stressed on the last (ha-BLAR, ciu-DAD, re-LOJ). Any word that breaks these rules carries a written accent on the stressed vowel (can-CIÓN, MÉ-di-co, LÁ-piz). That is the whole system." },
      { t: "tbl", head: ["Word", "Stressed", "Why"], rows: ES_STRESS.map(function (r) { return [r[0], r[2], r[3]]; }) },
      { t: "rule", x: "ends in vowel / n / s → second-to-last syllable\nends in another consonant → last syllable\naccent mark → wherever it says", note: "The accent also tells words apart: si (if) / sí (yes), el (the) / él (he), tu (your) / tú (you), hablo / habló. Question words carry it: qué, dónde, cuándo." },
      { t: "key", x: "Vowel, n, s: penultimate. Other consonant: last. Accent mark overrides. Accents are letters: type them." },
      { t: "how", drill: "Stress", ask: "Which syllable is stressed?", steps: ["Look at the last letter.", "Apply the rule, unless there is an accent mark.", "Say the word with that stress."], tip: "Clap the syllables and land the clap on the stressed one." }
    ] });
  add({ id: "es_pairs", mode: "espair", pass: 7, of: 10, title: "By ear: accents and the double r", sub: "Minimal pairs", gist: "Hablo or habló, pero or perro: one feature apart, different words. Train the ear with quick trials and feedback.",
    blocks: [
      { t: "p", x: "Stress and the rolled r carry meaning in Spanish, so the ear has to hear them before the mouth can make them. The device says one of two words; you choose. Without a Spanish voice, the drill tests the rule instead." },
      { t: "tbl", head: ["A", "B", "Meanings"], rows: ES_PAIRS },
      { t: "key", x: "Hear the stress and the r. Then make them: a single tap for r, a trill for rr." },
      { t: "how", drill: "Minimal pairs", ask: "Which word did you hear?", steps: ["Play the word.", "Choose the spelling.", "Say both, exaggerating the difference."], tip: "For the rolled r, say 'butter' fast in an American accent: the tongue tap is the single r. Hold it and let it vibrate for rr." }
    ] });

  /* ---------------- stage 1: first words ---------------- */
  add(vocabLesson("es_v1", "The first thirty", "Pronouns, greetings, ser and estar", "The words in every sentence, with the two verbs 'to be' that organise Spanish.",
    "Frequency decides the order: the hundred most common words cover about half of what is said. Two of them are 'to be': ser for what things are (identity, origin, time) and estar for where and how they are (location, state). The lesson on ser and estar comes in stage 2; for now learn both sets of forms.",
    [{ t: "rule", x: "yo · tú · él / ella / usted · nosotros · vosotros · ellos / ellas / ustedes\nsoy · eres · es · somos · sois · son   (ser)\nestoy · estás · está · estamos · estáis · están   (estar)", note: "Subject pronouns are usually dropped: the verb ending says who. Usted (formal you) takes the él/ella forms." }]));
  add(vocabLesson("es_v2", "Thirty verbs", "The core verbs and their present forms", "The verbs of nine sentences in ten, with their irregular yo forms and stem changes listed.",
    "Spanish verbs change for every person, so each verb is six forms; the regular patterns (stage 2) make most of them free. The thirty here include the irregulars you cannot avoid: ir, hacer, decir, tener, poder, querer, saber. Learn the yo form with the infinitive.",
    [{ t: "rule", x: "-ar: hablo hablas habla hablamos habláis hablan\n-er: como comes come comemos coméis comen\n-ir: vivo vives vive vivimos vivís viven", note: "Vosotros (informal you plural) is used in Spain; Latin America uses ustedes with the ellos forms." }]));
  add({ id: "es_num", mode: "esnum", pass: 7, of: 10, title: "Numbers and the clock", sub: "0 to 1,000, the time", gist: "Numbers are the one piece of vocabulary you cannot look up in a conversation. Drill them to reflex.",
    blocks: [
      { t: "p", x: "One to fifteen are irregular words; sixteen to twenty-nine are written as one word (dieciséis, veintiuno); from thirty-one the tens and units are joined by y (treinta y uno). Hundreds agree in gender (doscientos / doscientas), cien becomes ciento before another number (ciento cinco), and mil never takes a plural for a count (dos mil)." },
      { t: "tbl", head: ["Number", "Spanish"], rows: [["0", "cero"], ["1", "uno (un / una)"], ["2", "dos"], ["3", "tres"], ["4", "cuatro"], ["5", "cinco"], ["6", "seis"], ["7", "siete"], ["8", "ocho"], ["9", "nueve"], ["10", "diez"], ["11", "once"], ["12", "doce"], ["13", "trece"], ["14", "catorce"], ["15", "quince"], ["16", "dieciséis"], ["20", "veinte"], ["21", "veintiuno"], ["30", "treinta"], ["31", "treinta y uno"], ["40", "cuarenta"], ["50", "cincuenta"], ["60", "sesenta"], ["70", "setenta"], ["80", "ochenta"], ["90", "noventa"], ["100", "cien / ciento"], ["200", "doscientos"], ["500", "quinientos"], ["1000", "mil"]] },
      { t: "rule", x: "Es la una. · Son las tres. · Son las tres y media. · Son las tres y cuarto. · Son las cuatro menos cuarto (3:45)\nde la mañana / de la tarde / de la noche", note: "Son las (plural) for every hour but one. Latin America often says 'un cuarto para las cuatro' for 3:45." },
      { t: "key", x: "Sixteen to twenty-nine are one word; from thirty-one, y joins. Son las + hour, y media, y cuarto, menos cuarto." },
      { t: "how", drill: "Numbers", ask: "Write this number in Spanish.", steps: ["Say it aloud first.", "Tens, then y, then the unit (from 31).", "Hundreds before the rest."], tip: "Count your reps and the stairs in Spanish. Numbers are learned by use." }
    ] });
  add(vocabLesson("es_v3", "Time words", "Days, parts of the day, soon and late", "Today, tomorrow, Monday night: the words that place a sentence in time.", "Days are not capitalised and take the article for 'on': el lunes = on Monday, los lunes = on Mondays. Mañana is both 'tomorrow' and 'the morning': mañana por la mañana = tomorrow morning."));
  add(vocabLesson("es_v4", "People and home", "Family, the house, the everyday nouns", "The first nouns, each with its gender. Learn the article with the noun, always.", "Every Spanish noun is masculine or feminine, and the article, the adjective and the pronoun follow. -o is usually masculine and -a feminine, with famous exceptions (el día, la mano, el problema). Treat el/la as part of the word."));

  /* ---------------- stage 2: grammar core ---------------- */
  add({ id: "es_gender", mode: "esgender", pass: 8, of: 10, title: "El or la", sub: "Gender and the article", gist: "-o masculine, -a feminine, and a short list of exceptions that everyone meets in the first week.",
    blocks: [
      { t: "p", x: "Gender is grammatical, not biological: la mesa, el libro. The ending is a strong clue, the article is the fact. Agreement spreads from the noun to everything around it: el coche rojo, la casa roja, los coches rojos." },
      { t: "tbl", head: ["Clue", "Gender", "Examples and exceptions"], rows: [["-o", "masculine", "el libro, el coche; but la mano, la foto, la moto, la radio"], ["-a", "feminine", "la casa, la mesa; but el día, el mapa, el planeta, and the Greek -ma words: el problema, el idioma, el clima, el sistema"], ["-ción, -sión, -dad, -tad, -tud, -umbre", "feminine", "la canción, la ciudad, la libertad"], ["-or, -aje, -an", "masculine", "el color, el viaje, el pan"], ["-e", "either", "el coche, la noche, el café, la leche: learn each"], ["stressed a-", "el in the singular, feminine", "el agua fría, las aguas; el águila"]] },
      { t: "rule", x: "el / la · los / las · un / una · unos / unas\nde + el = del · a + el = al", note: "Two contractions, and only two: voy al cine, el libro del profesor." },
      { t: "key", x: "-o el, -a la, -ción/-dad la, -ma el. The article is part of the word. del and al." },
      { t: "how", drill: "El or la", ask: "Is it el or la?", steps: ["Look at the ending.", "Check the exception list.", "Say the noun with its article."], tip: "Say the plural too: el libro, los libros." }
    ] });
  add({ id: "es_plural", mode: "esplural", pass: 7, of: 10, title: "Plurals and adjectives", sub: "-s, -es, and agreement", gist: "Vowel + s, consonant + es, z to c. Adjectives follow the noun and agree with it in gender and number.",
    blocks: [
      { t: "p", x: "The plural adds -s after a vowel and -es after a consonant; a final z becomes c (lápiz, lápices); a written accent on the last syllable drops (canción, canciones). Adjectives agree: -o/-a/-os/-as for most, -e and consonant adjectives have one form for both genders (grande, fácil) and add -s or -es." },
      { t: "tbl", head: ["m. sg.", "f. sg.", "m. pl.", "f. pl.", "meaning"], rows: ES_ADJ.rows },
      { t: "rule", x: "un coche rojo · una casa roja · coches rojos · casas rojas\nun buen día · un gran equipo (bueno, malo, grande shorten before a singular noun)", note: "Adjectives follow the noun. A few go in front with a change of meaning: un hombre grande (big) / un gran hombre (great); un amigo viejo (old in years) / un viejo amigo (long-standing)." },
      { t: "key", x: "Plural -s / -es, z → c. Adjective after the noun, agreeing in gender and number. Bueno, malo, grande shorten before the noun." },
      { t: "how", drill: "Plurals and adjectives", ask: "Give the plural, or the agreeing form.", steps: ["Vowel: -s. Consonant: -es. z: ces.", "Adjective: match the noun's gender and number."], tip: "Learn every adjective in a pair: alto/alta." }
    ] });
  add({ id: "es_pres", mode: "espres", pass: 7, of: 10, title: "The present tense", sub: "Three conjugations, the irregular yo, and the boot", gist: "Six endings per conjugation, learned once. Then the irregular yo forms and the stem changes that live in the boot.",
    blocks: [
      { t: "p", x: "Regular verbs: take off -ar, -er or -ir and add the endings. The subject pronoun is usually dropped because the ending says who. Three kinds of irregularity cover most verbs: an irregular yo form (tengo, hago, digo, pongo, salgo, vengo, sé, conozco, doy, veo), a stem change in all persons but nosotros/vosotros, the 'boot' (pienso, puedo, pido), and a few fully irregular verbs (ser, estar, ir, haber)." },
      { t: "tbl", head: ["", "-ar (hablar)", "-er (comer)", "-ir (vivir)"], rows: [["yo", "hablo", "como", "vivo"], ["tú", "hablas", "comes", "vives"], ["él / ella / usted", "habla", "come", "vive"], ["nosotros", "hablamos", "comemos", "vivimos"], ["vosotros", "habláis", "coméis", "vivís"], ["ellos / ustedes", "hablan", "comen", "viven"]] },
      { t: "rule", x: "the boot: e→ie (pensar, querer, empezar, entender) · o→ue (poder, dormir, volver, costar) · e→i (pedir, servir, vestirse)\nall persons change except nosotros and vosotros", note: "Jugar is the lone u→ue: juego, jugamos." },
      { t: "key", x: "-o -as -a -amos -áis -an / -o -es -e -emos -éis -en / -o -es -e -imos -ís -en. Irregular yo. Stem changes in the boot." },
      { t: "how", drill: "Present tense", ask: "Give the form for the person.", steps: ["Which conjugation?", "Is the verb a yo-irregular or a boot verb?", "Add the ending."], tip: "Conjugate out loud in rhythm: hablo, hablas, habla, hablamos, habláis, hablan. Rhythm is memory." }
    ] });
  add({ id: "es_serestar", mode: "esserestar", pass: 8, of: 10, title: "Ser or estar", sub: "What it is versus how and where it is", gist: "Two verbs for 'to be'. Ser for identity and nature; estar for location, state and the progressive. The distinction is learnable in an afternoon and refined for years.",
    blocks: [
      { t: "p", x: "Ser answers 'what is it?': identity, origin, profession, nationality, time and date, possession, and inherent qualities. Estar answers 'where is it?' and 'how is it right now?': location, temporary states, the result of a change, and the progressive (estoy comiendo). The test that works most of the time: could you add 'at the moment'? Then estar." },
      { t: "tbl", head: ["Ser", "Estar"], rows: [["Soy canadiense. (origin)", "Estoy en Canadá. (location)"], ["Es profesor. (profession)", "Está cansado. (state)"], ["Son las tres. (time)", "Está lloviendo. (progressive)"], ["El hielo es frío. (nature)", "La sopa está fría. (right now)"], ["Es listo. (clever)", "Está listo. (ready)"], ["Es aburrido. (boring)", "Está aburrido. (bored)"]] },
      { t: "rule", x: "ser: what · estar: where and how\nlocation of a thing: estar · location of an event: ser (la fiesta es en mi casa)", note: "Muerto, casado, contento, enfermo take estar; feliz takes both; the mood words (feliz, triste) lean estar for the moment, ser for the character." },
      { t: "key", x: "Ser = identity, origin, time, nature. Estar = location, state, progressive. 'At the moment' means estar." },
      { t: "how", drill: "Ser or estar", ask: "Which verb?", steps: ["Is it what (ser) or where/how (estar)?", "Can you add 'right now'? Then estar.", "Check the adjectives that switch meaning."], tip: "Say the full sentence with the form, not just the infinitive." }
    ] });
  add({ id: "es_pron", mode: "espron", pass: 7, of: 10, title: "Object pronouns", sub: "Lo, la, le, se, and where they go", gist: "Direct and indirect object pronouns go before the conjugated verb or hang off the infinitive. When two meet, le becomes se.",
    blocks: [
      { t: "p", x: "Direct object (what receives the action): me, te, lo, la, nos, os, los, las. Indirect object (to whom): me, te, le, nos, os, les. They sit before a conjugated verb (lo veo, te lo doy) or attach to the end of an infinitive, gerund or command (quiero verlo, dámelo). When both appear, indirect comes first, and le/les turns into se before lo/la: se lo doy." },
      { t: "tbl", head: ["", "direct", "indirect", "after a preposition", "possessive"], rows: ES_PRON.rows.map(function (r) { return [r[0], r[1], r[2], r[3], r[4]]; }) },
      { t: "rule", x: "indirect before direct · le / les → se before lo / la / los / las\nbefore the verb, or attached to infinitive / gerund / command", note: "Spanish often doubles the indirect object: le doy el libro a Juan. The le is required even though 'a Juan' is there." },
      { t: "key", x: "me te lo/la nos os los/las · me te le nos os les · le + lo = se lo. Before the verb or on the end of an infinitive." },
      { t: "how", drill: "Pronouns", ask: "Give the right pronoun form.", steps: ["Direct or indirect?", "Pick the form for the person.", "Place it before the verb."], tip: "Replace nouns in your own sentences as you speak: 'veo la casa' → 'la veo'." }
    ] });
  add({ id: "es_gustar", mode: "esgustar", pass: 7, of: 10, title: "Gustar and friends", sub: "Me gusta, me gustan, me duele", gist: "Spanish does not say 'I like coffee'; it says 'coffee is pleasing to me'. The verb agrees with the thing, and the person is an indirect object.",
    blocks: [
      { t: "p", x: "Gustar means 'to please'. The thing liked is the subject, so the verb is gusta (singular or an infinitive) or gustan (plural), and the person who likes it is the indirect object: me, te, le, nos, os, les. A whole family works this way: encantar (love), interesar, importar, doler (hurt), parecer (seem), faltar (lack), quedar (have left)." },
      { t: "tbl", head: ["English", "Spanish", "Note"], rows: ES_GUSTAR },
      { t: "rule", x: "(a mí) me gusta + singular / infinitive · me gustan + plural\nme duele la rodilla · me duelen los pies", note: "To stress or clarify the person: a mí me gusta, a Juan le gusta. The 'a' phrase is optional; the pronoun is not." },
      { t: "key", x: "Indirect pronoun + gusta/gustan agreeing with the thing. Doler, encantar, interesar, parecer the same." },
      { t: "how", drill: "Gustar", ask: "Translate the sentence.", steps: ["Who likes it? That is the pronoun.", "What is liked? Singular → gusta, plural → gustan.", "Article before the noun: me gusta el café."], tip: "Me gusta, te gusta, le gusta: say ten things you like in a row every morning." }
    ] });

  /* ---------------- stage 3: vocabulary ---------------- */
  add(vocabLesson("es_v5", "Food and drink", "The café, the table, the bill", "Enough to order, shop and talk about what you ate.", "Spain and Latin America differ most in food words: patata/papa, zumo/jugo, camarero/mesero. Both are given where they matter. Rico is 'tasty' for food and 'rich' for people."));
  add(vocabLesson("es_v6", "Daily life and the rink", "Routines, clothes, the game", "The reflexive verbs of a normal day and the words of the game.", "Daily routines are reflexive: me levanto, me ducho, me visto. The pronoun agrees with the subject and goes before the verb: te levantas, se levanta, nos levantamos."));
  add(vocabLesson("es_v7", "Out and about", "Streets, transport, directions", "Asking the way, buying a ticket, saying where you are.", "'Where' takes estar: ¿dónde está la estación? Directions use the imperative, usted form in the street: siga, gire, tome. You will hear them long before you produce them."));
  add(vocabLesson("es_v8", "Work and study", "The university, the office, right and wrong", "A student's week in Spanish.", "Tener does a lot: tener razón (be right), tener hambre, tener sed, tener frío, tener miedo, tener ganas de, tener que + infinitive (have to). Learn tener que early; it is the everyday 'must'."));
  add(vocabLesson("es_v9", "Body and health", "Hurting, being ill, the doctor", "What hurts, where, since when.", "Doler works like gustar: me duele la cabeza, me duelen los pies. The body part takes the article, not the possessive: me lavo las manos, not mis manos."));
  add(vocabLesson("es_v10", "Feelings and opinions", "Feliz, triste, creo que", "How you feel and what you think, with the hedges.", "Feelings take estar (estoy contento) or tener (tengo miedo). Opinions: creo que, pienso que, me parece que + indicative; no creo que + subjunctive, which is stage 4."));
  add(vocabLesson("es_v11", "Nature and weather", "Seasons, animals, the sky", "The weather is 'hace': hace frío, hace sol, hace viento.", "Weather uses hacer (hace calor), hay (hay nubes), and impersonal verbs (llueve, nieva). Tener frío is a person being cold; hace frío is the weather; está frío is a thing."));
  add(vocabLesson("es_v12", "Society and news", "Politics, money, the world", "The front page of El País, which is where B1 reading begins.", "Greek -ma nouns are masculine despite the -a: el problema, el sistema, el clima, el idioma, el programa. A list worth memorising as a chant."));
  add(vocabLesson("es_v13", "Connectors", "Porque, aunque, sin embargo, todavía", "The words that join sentences into arguments.", "Some connectors decide the mood of the clause after them: porque, ya que, mientras + indicative; para que, antes de que, a menos que + subjunctive; aunque with either, by meaning (stage 4)."));
  add(vocabLesson("es_v14", "Idioms and the words that make you sound Spanish", "Vale, venga, echar de menos, ojalá", "Thirty expressions a textbook never teaches.", "Vale and venga are Spain; Latin America says bueno, dale, órale (Mexico), listo. Ojalá (from Arabic 'God willing') takes the subjunctive and expresses every wish you have."));

  /* ---------------- stage 4: tenses and moods ---------------- */
  add({ id: "es_pret", mode: "espret", pass: 7, of: 10, title: "The preterite", sub: "What happened", gist: "The past of completed events. Regular endings plus a dozen irregular stems that appear in every story.",
    blocks: [
      { t: "p", x: "The preterite narrates: what happened, in order, and finished. Regular -ar: -é -aste -ó -amos -asteis -aron; -er/-ir: -í -iste -ió -imos -isteis -ieron. The accents on yo and él are not decoration: hablo is present, habló is past. The irregulars have their own stems and unaccented endings: tuve, hice, dije, puse, pude, vine, quise, supe, estuve; ser and ir share fui." },
      { t: "tbl", head: ["", "yo", "tú", "él", "nosotros", "ellos", ""], rows: ES_PRETERITE.rows.slice(0, 9).map(function (r) { return [r[0], r[1], r[2], r[3], r[4], r[5], r[6]]; }) },
      { t: "rule", x: "irregular stems: tuv- hic- dij- pus- pud- vin- quis- sup- estuv- + -e -iste -o -imos -ieron\nfui fuiste fue fuimos fueron (ser and ir)", note: "Spelling changes keep the sound: jugué, busqué, empecé; leyó, oyó." },
      { t: "key", x: "Completed events: -é -ó / -í -ió. The irregular stems as a chant: tuve, hice, dije, puse, pude, vine, quise, supe, estuve, fui." },
      { t: "how", drill: "Preterite", ask: "Give the preterite for the person.", steps: ["Regular? apply the endings, mind the accents.", "Irregular stem? unaccented endings."], tip: "Narrate yesterday in Spanish every night: me levanté, comí, entrené, volví." }
    ] });
  add({ id: "es_imp", mode: "esimp", pass: 7, of: 10, title: "The imperfect, and choosing between the pasts", sub: "What was going on", gist: "The imperfect describes: background, habit, age, time, the scene a preterite event bursts into. It is almost entirely regular. The skill is choosing.",
    blocks: [
      { t: "p", x: "Imperfect endings: -aba -abas -aba -ábamos -abais -aban for -ar; -ía -ías -ía -íamos -íais -ían for -er and -ir. Three irregulars: era, iba, veía. Use it for what used to happen, what was happening, what things were like, what time it was, how old someone was. The preterite is the camera click; the imperfect is the film running." },
      { t: "tbl", head: ["Preterite", "Imperfect"], rows: [["ayer, anoche, una vez, de repente", "siempre, todos los días, mientras, de niño"], ["Jugué un partido. (a game, done)", "Jugaba al hockey. (I used to play)"], ["Empezó a nevar. (an event)", "Nevaba. (the scene)"], ["Llegó a las tres.", "Eran las tres cuando llegó."], ["Fui a México el año pasado.", "Tenía diez años."]] },
      { t: "rule", x: "preterite: completed, specific, sequence\nimperfect: background, habit, description, age, time, interrupted action", note: "Mientras comía, sonó el teléfono: the imperfect sets the scene, the preterite interrupts it." },
      { t: "key", x: "-aba / -ía, three irregulars. Preterite = what happened; imperfect = what was going on." },
      { t: "how", drill: "Preterite or imperfect", ask: "Which form fits?", steps: ["Is it an event or a background?", "Look for the time words.", "Choose, then say the whole sentence."], tip: "Tell a story: the imperfect for the setting, the preterite for each thing that happened." }
    ] });
  add({ id: "es_fut", mode: "esfut", pass: 7, of: 10, title: "Future and conditional", sub: "-é and -ía on the infinitive", gist: "Add endings to the whole infinitive. Twelve stems are irregular and shared by both tenses. Ir a + infinitive is the everyday future.",
    blocks: [
      { t: "p", x: "The simple future adds -é -ás -á -emos -éis -án to the infinitive (hablaré, comerás, vivirá). The conditional adds -ía -ías -ía -íamos -íais -ían to the same stem (hablaría: I would speak), and gives the polite ¿podría…? Irregular stems, the same for both: tendr-, har-, dir-, podr-, pondr-, saldr-, vendr-, querr-, sabr-, habr-, cabr-, valdr-. In speech, ir a + infinitive (voy a comer) is more common than the future tense; the future also expresses probability: será la una (it must be one o'clock)." },
      { t: "tbl", head: ["Infinitive", "Future (yo)", "Future (él)", "Conditional (yo)", ""], rows: ES_FUTURE.rows },
      { t: "rule", x: "infinitive + -é -ás -á -emos -éis -án · infinitive + -ía -ías -ía -íamos -íais -ían\nvoy a + infinitive = going to", note: "" },
      { t: "key", x: "Endings on the infinitive; irregular stems shared; ir a + infinitive for everyday plans." },
      { t: "how", drill: "Future and conditional", ask: "Give the form.", steps: ["Regular? infinitive + ending.", "Irregular stem? tendr-, har-, dir-…"], tip: "Plan tomorrow aloud: mañana entrenaré, estudiaré, dormiré." }
    ] });
  add({ id: "es_subj", mode: "essubj", pass: 7, of: 10, title: "The subjunctive", sub: "Wishes, doubts, emotions, and 'so that'", gist: "A second set of present-tense forms used after verbs of wanting, doubting, feeling and after certain conjunctions. The forms are easy; knowing when is the work of B1 and B2.",
    blocks: [
      { t: "p", x: "Form: take the present yo, drop the -o, add the opposite endings: hablar → hable, comer → coma, tener → tenga. Six irregulars: sea, esté, vaya, haya, sepa, dé. Use: after a trigger in a different clause introduced by que. The triggers are wishes (quiero que vengas), doubts and denials (no creo que sea), emotions (me alegro de que estés), impersonal judgements (es importante que practiques), and conjunctions of purpose, condition and future time (para que, a menos que, cuando + future meaning)." },
      { t: "tbl", head: ["Trigger", "Example"], rows: [["querer / esperar / necesitar que", "Quiero que vengas."], ["no creer / dudar que", "No creo que sea verdad."], ["alegrarse / sentir / tener miedo de que", "Me alegro de que estés aquí."], ["es importante / necesario / posible que", "Es importante que practiques."], ["para que, antes de que, a menos que", "Te llamo para que sepas."], ["cuando, en cuanto, hasta que (future)", "Cuando llegues, llámame."], ["ojalá, tal vez, quizás", "Ojalá ganemos."]] },
      { t: "rule", x: "WEIRDO: Wishes · Emotions · Impersonal expressions · Recommendations · Doubt · Ojalá → que + subjunctive\nsame subject → infinitive: quiero venir · different subject → subjunctive: quiero que vengas", note: "Creo que takes the indicative; no creo que the subjunctive. Certainty indicative, uncertainty subjunctive." },
      { t: "key", x: "Opposite endings from the yo form; sea, esté, vaya, haya, sepa, dé. After wishes, emotions, doubt, impersonal judgements, purpose, and future time clauses." },
      { t: "how", drill: "Subjunctive", ask: "Give the present subjunctive for the person.", steps: ["Find the yo form.", "Drop the -o, add the opposite endings.", "Check the six irregulars."], tip: "Make a wish every day: ojalá que + subjunctive. Twenty wishes and the forms are yours." }
    ] });

  /* ---------------- stage 5: conversation ---------------- */
  add({ id: "es_conv", mode: "none", apply: "conv", title: "Conversation practice", sub: "Six scripted scenarios", gist: "Dialogues where you must answer, graded on function. Speaking is a production skill; nothing else trains it.",
    blocks: [{ t: "p", x: "Read (and hear) the partner's line, type or speak your reply, get graded on whether it does the job, compare with the model and say it aloud. Repeat until you can run the scenario from memory." }, { t: "tbl", head: ["Scenario", "Level", "You practise"], rows: ES_DIALOGUES.map(function (d) { return [d.title, d.level, d.setting]; }) }, { t: "key", x: "A dialogue a day; every model answer aloud three times; shadow the partner's lines." }] });
  add({ id: "es_shadow", mode: "none", title: "Shadowing and native input", sub: "Where to find Spanish to copy", gist: "Spanish is the easiest major language to find native input for. Twenty minutes of shadowing a day builds the rhythm.",
    blocks: [
      { t: "p", x: "Shadow: play native speech and speak along, half a second behind, copying melody and stress. Sources from easy to native:" },
      { t: "tbl", head: ["Source", "What it is"], rows: [["Notes in Spanish (podcast)", "Three levels of conversational Spanish with transcripts; the standard learner podcast."], ["Dreaming Spanish (YouTube)", "Comprehensible input at every level, hundreds of hours, free: the purest Krashen method available."], ["RTVE Play, Netflix (La casa de papel, Élite), Televisa, Telefe", "Native TV with Spanish subtitles. Hockey is rare; football commentary is excellent shadowing material."], ["El País, BBC Mundo", "News; BBC Mundo's Spanish is clear and neutral."], ["Radio Ambulante (NPR)", "Long-form Latin American stories with transcripts, B2 and up."], ["SpanishDict, WordReference", "Dictionary and conjugator; every form of every verb."]] },
      { t: "rule", x: "daily: 10 min shadowing + 10 min dialogue + reviews\nweekly: 30 minutes of a show, logged", note: "Log the minutes on the Level page. They count toward 700 hours." },
      { t: "key", x: "Shadow aloud daily. Log every minute of real Spanish." }
    ] });

  /* ---------------- stage 6: reading and listening ---------------- */
  ES_READINGS.forEach(function (R) {
    add({ id: R.id, mode: "quiz", pass: Math.max(2, R.qs.length - 1), of: R.qs.length, title: R.title, sub: "Reader · " + R.level, gist: R.text[0].slice(0, 90) + "…", reading: R,
      quiz: R.qs.map(function (q) { return { q: q.q, options: q.options, answer: q.answer }; }),
      blocks: [{ t: "p", x: "Read once for the gist, once with the glossary, then listen with your eyes closed (the speaker button reads it aloud), then answer." }].concat(R.text.map(function (p) { return { t: "p", x: p, lang: "es" }; })).concat([{ t: "tbl", head: ["Word", "Meaning"], rows: R.gloss }, { t: "key", x: "Extensive reading is how the vocabulary grows after the first thousand words. Finish the readers here, then graded readers (Lecturas ELE), then El País." }]) });
  });
  add({ id: "es_dict", mode: "esdict", pass: 6, of: 8, title: "Dictation", sub: "Hear it, write it", gist: "Sentences at natural speed; you type them. Accents, spelling and grammar, tested by the ear.",
    blocks: [{ t: "p", x: "Type the whole sentence, accents included: the grader is strict about letters and lenient about punctuation. Without a Spanish voice the sentence shows briefly and hides." }, { t: "key", x: "Listen twice, write once, compare letter by letter." }, { t: "how", drill: "Dictation", ask: "Type what you heard.", steps: ["Play it.", "Type it.", "Compare."], tip: "Say it back before typing." }] });
  add({ id: "es_write", mode: "eswrite", pass: 6, of: 8, title: "Writing: translate the sentence", sub: "English in, Spanish out", gist: "Short sentences from A1 to B2 with several accepted answers. Ser/estar, the pasts, the subjunctive and agreement tested together.",
    blocks: [{ t: "p", x: "Translation into the language is pure production: every ending and every choice is yours. Check your sentence against the rules: ser or estar? which past? subjunctive trigger? agreement?" }, { t: "key", x: "Write, check against the rules, say it aloud." }, { t: "how", drill: "Writing", ask: "Translate into Spanish.", steps: ["Verb first: which tense, which mood?", "Agreement everywhere.", "Accents."], tip: "Three Spanish sentences in a journal every night." }] });

  /* ---------------- stage 7: the pro path ---------------- */
  add({ id: "es_pro", mode: "none", title: "From B1 to native: the programme", sub: "Hours, sources, and the log", gist: "Spanish is FSI category I: about 600–750 hours to professional proficiency, the same as Swedish, with far more native material available. The drills take you to B1; the hours take you the rest of the way.",
    blocks: [
      { t: "p", x: "The Foreign Service Institute puts Spanish among the easiest languages for English speakers: 600–750 classroom hours to C1-level working proficiency. The structured part of that is here; the rest is input and output, and Spanish has more of both freely available than any language on earth: five hundred million speakers, a film and television industry on two continents, and a thriving learner-podcast scene." },
      { t: "tbl", head: ["Level", "What it looks like", "Hours (rough)", "What to do"], rows: [["A1–A2", "Survive: order, ask, introduce", "0–150", "Stages 0–5 here, daily reviews"], ["B1", "Hold a conversation, read easy news", "150–350", "Readers here, Notes in Spanish, Dreaming Spanish daily, one dialogue a day"], ["B2", "Fluent conversation, native TV with subtitles", "350–600", "An hour of native input a day, 100 written words a day, a tutor or tandem partner twice a week (italki, Tandem)"], ["C1", "Professional use, argue, read anything", "600–900", "Native media without subtitles, novels (García Márquez, Zafón), long podcasts; speak daily"], ["C2", "Near-native", "1000+", "Live in the language; DELE C2 as a target"]] },
      { t: "rule", x: "the level model = words known + grammar passed + applied skill + logged hours\nhours count toward 700", note: "Log every minute of real Spanish on the Level page; the calendar schedules the immersion sessions like any other." },
      { t: "key", x: "After B1: native input daily, written output daily, spoken output twice a week with a native, all logged. DELE B2 then C1 as milestones." }
    ] });

  var PATH = [
    { title: "Sounds", sub: "Vowels, consonants, stress", blurb: "Five pure vowels, the consonant rules, and where the stress falls.", ids: ["es_sounds", "es_stress", "es_pairs"] },
    { title: "First words", sub: "The hundred that cover half of speech", blurb: "Pronouns, ser and estar, the core verbs, numbers, time and the first nouns.", ids: ["es_v1", "es_v2", "es_num", "es_v3", "es_v4"] },
    { title: "Grammar core", sub: "Gender, the present, ser/estar, pronouns", blurb: "El/la, plurals and agreement, the three conjugations, ser versus estar, object pronouns, gustar.", ids: ["es_gender", "es_plural", "es_pres", "es_serestar", "es_pron", "es_gustar"] },
    { title: "Vocabulary by theme", sub: "Toward a thousand words", blurb: "Food, daily life, the city, work, the body, feelings, nature, society, connectors, idioms.", ids: ["es_v5", "es_v6", "es_v7", "es_v8", "es_v9", "es_v10", "es_v11", "es_v12", "es_v13", "es_v14"] },
    { title: "Tenses and moods", sub: "The pasts, the future, the subjunctive", blurb: "Preterite and imperfect and choosing between them, future and conditional, and the subjunctive.", ids: ["es_pret", "es_imp", "es_fut", "es_subj"] },
    { title: "Conversation", sub: "Output with feedback", blurb: "Scripted scenarios you must answer, and shadowing with native audio.", ids: ["es_conv", "es_shadow"] },
    { title: "Reading and listening", sub: "Readers, dictation, writing", blurb: "Six readers from A1 to B2, dictation, and translation into Spanish.", ids: ES_READINGS.map(function (r) { return r.id; }).concat(["es_dict", "es_write"]) },
    { title: "The pro path", sub: "B1 to native", blurb: "The hours, the sources, and the log.", ids: ["es_pro"] }
  ];

  function pick(a, rnd) { return a[((rnd || Math.random)() * a.length) | 0]; }
  function tts(text, caps) { return caps && caps.tts ? { text: text, lang: "es-ES" } : null; }
  var DRILLS = {
    essound: { name: "Sound rules", target: 6, gen: function (ctx) {
      var row = pick(ES_SOUNDS, ctx.rnd), opts = lgOptions(row[1], ES_SOUND_RULES, 3, ctx.rnd, "es");
      return { kind: "choice", question: "How is the key consonant of <b class='tw'>" + row[0] + "</b> (" + row[2] + ") pronounced?", options: opts, answer: row[1], target: 6, explain: ["<b>" + row[0] + "</b>: " + row[1] + "."], speakAfter: tts(row[0], ctx.caps) };
    } },
    esstress: { name: "Stress", target: 6, gen: function (ctx) {
      var r = pick(ES_STRESS, ctx.rnd), syl = r[2].split("-"), opts = syl.map(function (s, i) { return (i + 1) + ": " + s.toLowerCase(); });
      var ans = r[1] + ": " + syl[r[1] - 1].toLowerCase();
      return { kind: "choice", question: "Which syllable of <b class='tw'>" + r[0] + "</b> is stressed?", options: opts, answer: ans, target: 6, explain: ["<b>" + r[2] + "</b>: " + r[3] + "."], speakAfter: tts(r[0], ctx.caps) };
    } },
    espair: { name: "Minimal pairs", target: 6, gen: function (ctx) {
      var p = pick(ES_PAIRS, ctx.rnd), which = ctx.rnd() < 0.5 ? 0 : 1, word = p[which], expl = ["<b>" + p[0] + "</b> / <b>" + p[1] + "</b>: " + p[2]];
      if (ctx.caps && ctx.caps.tts) return { kind: "choice", question: "Listen. Which word did you hear?", options: [p[0], p[1]], answer: word, target: 6, explain: expl, speak: { text: word, lang: "es-ES" }, hideText: true };
      var m = p[2].split(" / ");
      return { kind: "choice", question: "Which spelling means <b>" + (m[which] || p[2]) + "</b>?", options: [p[0], p[1]], answer: word, target: 6, explain: expl };
    } },
    esnum: { name: "Numbers", target: 9, gen: function (ctx) {
      var n = ctx.rnd() < 0.4 ? (ctx.rnd() * 21) | 0 : ctx.rnd() < 0.7 ? 20 + ((ctx.rnd() * 80) | 0) : 100 + ((ctx.rnd() * 900) | 0);
      var w = esNumber(n);
      return { kind: "text", question: "Write <b>" + n + "</b> in Spanish.", answer: w, accept: [w], target: 9, explain: ["<b>" + n + "</b> = " + w], speakAfter: tts(w, ctx.caps) };
    } },
    esgender: { name: "El or la", target: 5, gen: function (ctx) { return lgFormQ(ES_GENDER, "es", ctx.rnd, ctx.caps); } },
    esplural: { name: "Plurals and adjectives", target: 7, gen: function (ctx) { return ctx.rnd() < 0.5 ? lgFormQ(ES_PLURAL, "es", ctx.rnd, ctx.caps) : lgFormQ(ES_ADJ, "es", ctx.rnd, ctx.caps); } },
    espres: { name: "Present tense", target: 9, gen: function (ctx) { return lgFormQ(ES_PRESENT, "es", ctx.rnd, ctx.caps); } },
    esserestar: { name: "Ser or estar", target: 6, gen: function (ctx) { return lgFormQ(ES_SERESTAR, "es", ctx.rnd, ctx.caps); } },
    espron: { name: "Pronouns", target: 6, gen: function (ctx) { return lgFormQ(ES_PRON, "es", ctx.rnd, ctx.caps); } },
    esgustar: { name: "Gustar", target: 12, gen: function (ctx) {
      var r = pick(ES_GUSTAR, ctx.rnd);
      return { kind: "text", question: "Translate: <b>" + r[0] + "</b>", answer: r[1], accept: [r[1]], target: 12, explain: ["<b>" + r[1] + "</b>" + (r[2] ? " — " + r[2] : "")], speakAfter: tts(r[1], ctx.caps) };
    } },
    espret: { name: "Preterite", target: 10, gen: function (ctx) { return lgFormQ(ES_PRETERITE, "es", ctx.rnd, ctx.caps); } },
    esimp: { name: "Preterite or imperfect", target: 9, gen: function (ctx) { return ctx.rnd() < 0.5 ? lgFormQ(ES_IMPERFECT, "es", ctx.rnd, ctx.caps) : lgFormQ(ES_PASTCHOICE, "es", ctx.rnd, ctx.caps); } },
    esfut: { name: "Future and conditional", target: 9, gen: function (ctx) { return lgFormQ(ES_FUTURE, "es", ctx.rnd, ctx.caps); } },
    essubj: { name: "Subjunctive", target: 10, gen: function (ctx) { return lgFormQ(ES_SUBJ, "es", ctx.rnd, ctx.caps); } },
    esdict: { name: "Dictation", target: 20, gen: function (ctx) {
      var r = pick(ES_DICTATION, ctx.rnd);
      return { kind: "text", question: "Type what you " + (ctx.caps && ctx.caps.tts ? "hear" : "read, after it hides") + ". <small>(" + r[1] + ")</small>", answer: r[0], accept: [r[0]], target: 20, explain: ["<b>" + r[0] + "</b>"], speak: tts(r[0], ctx.caps), flash: !(ctx.caps && ctx.caps.tts) ? r[0] : null, hideText: true };
    } },
    eswrite: { name: "Writing", target: 20, gen: function (ctx) {
      var r = pick(ES_WRITING, ctx.rnd);
      return { kind: "text", question: "Translate into Spanish: <b>" + r[0] + "</b> <small>(" + r[2] + ")</small>", answer: r[1][0], accept: r[1], target: 20, explain: ["<b>" + r[1][0] + "</b>" + (r[1].length > 1 ? " (also: " + r[1].slice(1).join(" / ") + ")" : "")], speakAfter: tts(r[1][0], ctx.caps) };
    } }
  };
  function esNumber(n) {
    var ones = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
    var tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    var hund = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];
    if (n < 30) return ones[n];
    if (n < 100) return tens[(n / 10) | 0] + (n % 10 ? " y " + ones[n % 10] : "");
    if (n === 100) return "cien";
    if (n < 1000) return hund[(n / 100) | 0] + (n % 100 ? " " + esNumber(n % 100) : "");
    return (n >= 2000 ? ones[(n / 1000) | 0] + " " : "") + "mil" + (n % 1000 ? " " + esNumber(n % 1000) : "");
  }

  var FORMULAS = [
    { id: "es_stressf", name: "Stress", topic: "Sounds", lesson: "es_stress", f: "vowel / n / s → penultimate · other consonant → last · accent mark overrides", anchors: [["CA-sa", ""], ["ha-BLAR", ""], ["can-CIÓN", ""]], note: "" },
    { id: "es_softf", name: "Soft c and g", topic: "Sounds", lesson: "es_sounds", f: "c, g before e, i → s/th, throaty h", anchors: [["cine", "sine / thine"], ["gente", "hente"]], note: "qu and gu keep them hard: queso, guitarra." },
    { id: "es_art", name: "Articles", topic: "Nouns", lesson: "es_gender", f: "el la los las · un una unos unas · del, al", anchors: [["-o el, -a la", ""], ["-ción, -dad la", ""], ["-ma el", "problema, idioma"]], note: "" },
    { id: "es_plurf", name: "Plurals", topic: "Nouns", lesson: "es_plural", f: "vowel + s · consonant + es · z → ces", anchors: [["lápiz → lápices", ""], ["canción → canciones", "accent drops"]], note: "" },
    { id: "es_presf", name: "Present endings", topic: "Verbs", lesson: "es_pres", f: "-ar: o as a amos áis an · -er: o es e emos éis en · -ir: o es e imos ís en", anchors: [["the boot", "e→ie, o→ue, e→i, not nosotros"]], note: "" },
    { id: "es_sef", name: "Ser or estar", topic: "Verbs", lesson: "es_serestar", f: "ser = what · estar = where and how", anchors: [["es listo / está listo", "clever / ready"]], note: "" },
    { id: "es_pronf", name: "Object pronouns", topic: "Grammar", lesson: "es_pron", f: "me te lo/la nos os los/las · me te le nos os les · le + lo → se lo", anchors: [["quiero verlo", "attached"], ["lo veo", "before the verb"]], note: "" },
    { id: "es_gustf", name: "Gustar", topic: "Grammar", lesson: "es_gustar", f: "indirect pronoun + gusta (sg. / inf.) · gustan (pl.)", anchors: [["me duele la rodilla", "doler"], ["me encantan", "encantar"]], note: "" },
    { id: "es_pretf", name: "Preterite", topic: "Verbs", lesson: "es_pret", f: "-é -aste -ó -amos -aron · -í -iste -ió -imos -ieron · irregular stems + -e -iste -o -imos -ieron", anchors: [["fui fuiste fue", "ser and ir"], ["tuve hice dije puse pude vine quise supe estuve", ""]], note: "" },
    { id: "es_impf", name: "Imperfect", topic: "Verbs", lesson: "es_imp", f: "-aba -abas -aba -ábamos -aban · -ía -ías -ía -íamos -ían · era, iba, veía", anchors: [["preterite = event", ""], ["imperfect = background", ""]], note: "" },
    { id: "es_futf", name: "Future and conditional", topic: "Verbs", lesson: "es_fut", f: "infinitive + -é -ás -á -emos -án · infinitive + -ía -ías -ía -íamos -ían", anchors: [["tendr- har- dir- podr- pondr- saldr- vendr- querr- sabr- habr-", ""]], note: "" },
    { id: "es_subjf", name: "Present subjunctive", topic: "Verbs", lesson: "es_subj", f: "yo form − o + opposite endings · sea esté vaya haya sepa dé", anchors: [["WEIRDO", "wishes, emotions, impersonal, recommendations, doubt, ojalá"]], note: "Different subject + que → subjunctive." },
    { id: "es_time", name: "Telling the time", topic: "Numbers", lesson: "es_num", f: "es la una · son las + hour · y media · y cuarto · menos cuarto", anchors: [["3:45", "las cuatro menos cuarto"]], note: "" },
    { id: "es_fsi", name: "Hours to proficiency", topic: "The path", lesson: "es_pro", f: "FSI category I: 600–750 hours to C1", anchors: [["A2", "~150 h"], ["B1", "~350 h"], ["B2", "~600 h"]], note: "" }
  ];
  var GLOSSARY = [
    ["the boot", ["boot verbs", "stem-changing"], "Verbs whose stem changes in every present form except nosotros and vosotros; drawn as a boot on the conjugation table.", "es_pres"],
    ["seseo", [], "Pronouncing c (before e, i) and z as s: all of Latin America and parts of Spain.", "es_sounds"],
    ["preterite", ["pretérito"], "The past tense of completed events.", "es_pret"],
    ["imperfect", ["imperfecto"], "The past tense of background, habit and description.", "es_imp"],
    ["subjunctive", ["subjuntivo"], "The mood used after wishes, doubts, emotions and certain conjunctions.", "es_subj"],
    ["ojalá", [], "'If only / I hope', from Arabic; always followed by the subjunctive.", "es_v14"],
    ["voseo", ["vos"], "Using vos instead of tú, with its own verb forms, in Argentina, Uruguay and parts of Central America.", "es_v1"],
    ["sobremesa", [], "The conversation that stays at the table after a meal.", "es_r3"],
    ["CEFR", ["A1", "A2", "B1", "B2", "C1", "C2"], "The European scale of language levels.", "es_pro"],
    ["DELE", [], "The official Spanish proficiency diplomas from the Instituto Cervantes.", "es_pro"],
    ["FSI", ["Foreign Service Institute"], "The US diplomatic language school whose hour estimates measure how long a language takes.", "es_pro"]
  ];
  var READING = [
    { g: "Method", items: [["Fluent Forever", "Gabriel Wyner. Sounds first, personal cards, spaced repetition."], ["Make It Stick", "Brown, Roediger and McDaniel. The science behind the schedule."], ["Learning Vocabulary in Another Language", "Paul Nation. Frequency order."]] },
    { g: "Spanish", items: [["Practice Makes Perfect: Complete Spanish Grammar", "Gilda Nissenberg. The workbook for the grammar stages."], ["501 Spanish Verbs", "Kendris. Every form of the verbs that matter; or SpanishDict's conjugator, free."], ["Aula Internacional / Gente", "Difusión. The standard communicative coursebooks used in Spain."], ["Notes in Spanish", "The podcast, three levels, with transcripts."], ["Dreaming Spanish", "Comprehensible input video at every level: the Krashen method made free."], ["Lecturas ELE / Lecturas graduadas", "Graded readers A1 to C1 from SGEL, Difusión, Edelsa."]] },
    { g: "Past B2", items: [["Cien años de soledad; La sombra del viento", "García Márquez; Ruiz Zafón. The novels most learners read first."], ["Radio Ambulante", "NPR's Latin American long-form podcast, with transcripts."], ["DELE B2 and C1", "The Instituto Cervantes diplomas, as targets with dates."]] }
  ];
  var RANKS = [{ xp: 0, name: "Principiante" }, { xp: 300, name: "Estudiante" }, { xp: 1000, name: "Hablante" }, { xp: 2500, name: "Lector" }, { xp: 5000, name: "Escritor" }, { xp: 9000, name: "Fluido" }, { xp: 15000, name: "Nativo" }, { xp: 25000, name: "Maestro" }];

  registerCourse({
    id: "es", name: "Spanish", short: "ES", glyph: "Ñ", kind: "lang", lang: "es", color: "#D14B41",
    tagline: "Reading, writing, listening and speaking, from the sounds to native.",
    blurb: "Five vowels and a stress rule, the thousand words that matter, the verb system from the present to the subjunctive, scripted conversation, dictation and translation, and a logged immersion programme with the richest native material of any language.",
    path: PATH, lessons: LESSONS, drills: DRILLS, vocab: V, formulas: FORMULAS, glossary: GLOSSARY, reading: READING, ranks: RANKS,
    dialogues: ES_DIALOGUES, readings: ES_READINGS, need: 700,
    apply: [{ id: "conv", label: "Conversation", blurb: "Six scenarios, graded turn by turn", min: 12 }, { id: "listen", label: "Dictation", blurb: "Hear it, write it", min: 8 }, { id: "write", label: "Writing", blurb: "Translate into Spanish", min: 8 }, { id: "log", label: "Immersion log", blurb: "Log native input and output", min: 0 }]
  });
})();
