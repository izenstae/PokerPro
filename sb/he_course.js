/* ============================================================
   HEBREW: the course, modern and Biblical
   Nine stages: the alef-bet and the vowel points, the first words,
   the grammar core, vocabulary by theme, the verb system, conversation,
   reading and listening, the Biblical track, and the pro path.
   ============================================================ */
(function () {
  var V = HE_VOCAB, B = BH_VOCAB;
  function tblOf(rows) { return { t: "tbl", head: ["Hebrew", "Say it", "Meaning", "Example"], rows: rows.map(function (r) { return [r[0], r[1], r[2], r[5]]; }), rtl: true }; }
  function vocabLesson(id, title, sub, gist, intro, extra, src) {
    var rows = (src || V)[id];
    return { id: id, mode: "words:" + id, pass: 8, of: 10, title: title, sub: sub, gist: gist, vocab: true,
      blocks: [{ t: "p", x: intro }].concat(extra || []).concat([
        tblOf(rows),
        { t: "key", x: "Read the Hebrew first, before the transliteration. Cover the meaning, say the word, uncover. The points are training wheels: later reviews show the word without them, as every Israeli text does." },
        { t: "how", drill: "Vocabulary", ask: "What does it mean? Which word is it? Type it. Fill the gap. Type what you heard. Say it.",
          steps: ["Each word is its own skill. Recognition first, then production, then the ear and the mouth.", "Type without vowel points; the grader strips them. Final letters (ך ם ן ף ץ) are accepted either way, but learn them.", "An on-screen Hebrew keyboard appears for typed answers if you have no Hebrew layout."],
          tip: "Say the example sentence aloud with its stress on the last syllable (most words) and the word will sound Israeli." }
      ]) };
  }
  var LESSONS = {};
  function add(L) { LESSONS[L.id] = L; return L; }

  /* ---------------- stage 0: the alef-bet ---------------- */
  var LET = HE_LETTERS;
  add({ id: "he_alef1", mode: "heletter", pass: 8, of: 10, title: "The alef-bet, part one", sub: "א to כ", gist: "Twenty-two letters, all consonants, read right to left. The first eleven today.",
    blocks: [
      { t: "p", x: "Hebrew is written right to left with 22 consonant letters and no capitals. Vowels are dots and dashes under or beside the letters (niqqud), used in children's books, poetry, prayer books and the Bible, and dropped in everything else. The plan: learn the letters with their names and sounds, learn the vowel points, read with points for a few weeks, then let them go. Every Israeli learned to read exactly this way." },
      { t: "tbl", head: ["Letter", "Name", "Sound", "Final form"], rows: LET.slice(0, 11).map(function (r) { return [r[0], r[1], r[2], r[4] || "–"]; }), rtl: true },
      { t: "rule", x: "בּ = b, ב = v  ·  כּ = k, כ = ch\na dot inside (dagesh) hardens bet, kaf and pe", note: "Three letters have a hard and a soft sound: ב/בּ, כ/כּ, פ/פּ. Without points, context tells you; with points, the dot does." },
      { t: "warn", x: "Four letters are silent or nearly so for most Israelis: א and ע carry a vowel and nothing else, ה is silent at the end of a word, and ו and י often serve as vowels (o/u and i). Beginners hunt for a consonant sound that is not there." },
      { t: "key", x: "Right to left. 22 consonants. א silent, בּ b / ב v, ג g, ד d, ה h, ו v (or o/u), ז z, ח throaty h, ט t, י y (or i), כּ k / כ ch." },
      { t: "how", drill: "Letters", ask: "Name the letter, or give its sound.", steps: ["Look at the shape, say the name, say the sound.", "The drill also asks the reverse: which letter makes this sound?"], tip: "Write each letter ten times by hand, saying its name. Motor memory is memory." }
    ] });
  add({ id: "he_alef2", mode: "heletter", pass: 8, of: 10, title: "The alef-bet, part two", sub: "ל to ת, and the five final forms", gist: "The second half, including five letters that change shape at the end of a word.",
    blocks: [
      { t: "p", x: "Five letters have a final form used only at the end of a word: כ→ך, מ→ם, נ→ן, פ→ף, צ→ץ (remember them as 'kamnefets'). The sound is the same. שׁ (dot right) is sh and שׂ (dot left) is s; without points, ש is sh in almost every word." },
      { t: "tbl", head: ["Letter", "Name", "Sound", "Final form"], rows: LET.slice(11).map(function (r) { return [r[0], r[1], r[2], r[4] || "–"]; }), rtl: true },
      { t: "rule", x: "finals: ך ם ן ף ץ   (kaf, mem, nun, pe, tsadi)\nשׁ sh · שׂ s · פּ p · פ f", note: "Look-alikes to separate early: ב/כ (bet has a bottom tail), ד/ר (dalet has a corner), ה/ח (he has a gap), ו/ז (zayin has a head), ס/ם (samech is round, final mem is square), ע/צ." },
      { t: "key", x: "ל l, מ m, נ n, ס s, ע silent, פּ p / פ f, צ ts, ק k, ר r, שׁ sh, ת t. Five finals: ך ם ן ף ץ." },
      { t: "how", drill: "Letters", ask: "Name the letter, give its sound, or pick the final form.", steps: ["Shape → name → sound.", "If the letter is one of the five, know its final form on sight."], tip: "Read shop signs, team names and song titles in Hebrew script whenever you see them: free reps." }
    ] });
  add({ id: "he_vowels", mode: "hevowel", pass: 8, of: 10, title: "The vowel points", sub: "Niqqud: a, e, i, o, u", gist: "Eight marks give five vowel sounds. Modern Hebrew has no long/short distinction, so they are easier than they look.",
    blocks: [
      { t: "p", x: "The Tiberian masoretes who pointed the Bible around 900 CE distinguished vowel lengths that modern Israeli speech does not. For speaking today, you need five sounds: a, e, i, o, u. Two marks each for a and e, one or two for the rest. The marks sit under the consonant they follow (read consonant, then vowel) except cholam, which sits above and to the left, and shuruk, a dot inside a vav." },
      { t: "tbl", head: ["Mark (on א)", "Name", "Sound", "Say"], rows: HE_VOWELS.map(function (v) { return ["א" + v[0], v[1], v[2], v[3]]; }), rtl: true },
      { t: "rule", x: "וֹ = o (cholam with vav) · וּ = u (shuruk) · ִי = i (chirik with yod)\nconsonant first, then its vowel: בָּ = ba, בִּ = bi, בּוֹ = bo", note: "Shva (two vertical dots) is either silent (end of a syllable) or a very short e (start of a word). Say 'shva' with the short e: שְׁמַע = shma." },
      { t: "ex", title: "Worked example", facts: [["Word", "שָׁלוֹם"], ["Letters", "ש ל ו ם"]], steps: ["שׁ with kamatz: sha.", "ל with cholam-vav: lo.", "ם final mem closes it: shalom."], punch: "Three syllables of thinking now, one glance in a month." },
      { t: "key", x: "Five sounds: a (patach, kamatz), e (segol, tsere), i (chirik), o (cholam), u (kubutz, shuruk). Shva: silent or a flick of e. Read consonant, then vowel." },
      { t: "how", drill: "Vowels", ask: "Which sound does this mark make?", steps: ["Find the mark under or above the letter.", "Name it, sound it."], tip: "Point at the marks in the first-words table and read each syllable aloud before the word." }
    ] });
  add({ id: "he_read", mode: "heread", pass: 8, of: 10, title: "Reading pointed words", sub: "Put the letters and points together", gist: "Decode real words syllable by syllable until the eye does it alone. Reading is the gateway to every other skill in Hebrew.",
    blocks: [
      { t: "p", x: "Decoding is a skill like any other: it gets automatic with reps and feedback. The drill shows a pointed word and asks for its pronunciation. Go slowly at first; the speed gate tightens as you climb the boxes, and in a few weeks you will read a word before you have consciously seen its letters." },
      { t: "rule", x: "stress is on the LAST syllable in most words (shaLOM, yeLED is an exception: segolate nouns stress the first)\nthe definite article הַ doubles the next consonant: הַסֵּפֶר = ha-SE-fer", note: "Segolates (two segols: יֶלֶד, סֵפֶר, מֶלֶךְ) stress the first syllable. Everything else, last syllable, unless you are reading Biblical text with its own accents." },
      { t: "key", x: "Consonant, vowel, consonant, vowel. Stress last unless segolate. The points come off later; the sound stays." },
      { t: "how", drill: "Reading", ask: "How is this word pronounced?", steps: ["Read right to left, one consonant and its vowel at a time.", "Pick the transliteration.", "Say it with the stress on the last syllable."], tip: "Trace the word with a finger as you read: it keeps the eye from jumping ahead." }
    ] });

  /* ---------------- stage 1: first words ---------------- */
  add(vocabLesson("he_v1", "The first thirty", "Pronouns, greetings, yes and no", "Shalom, toda, bevakasha: the words you cannot have a conversation without.",
    "Hebrew pronouns mark gender in the second and third person: אַתָּה you (m.), אַתְּ you (f.), הֵם they (m.), הֵן they (f.). Verbs and adjectives agree with them, so pick the right pronoun from day one. There is no present-tense 'to be': אֲנִי סְטוּדֶנְט is 'I (am a) student'.",
    [{ t: "rule", x: "אֲנִי · אַתָּה / אַתְּ · הוּא / הִיא · אֲנַחְנוּ · אַתֶּם / אַתֶּן · הֵם / הֵן\nno 'is' in the present: אֲנִי מוֹרֶה = I (am) a teacher", note: "Yesh and ein do the work of 'have': יֵשׁ לִי = there is to me = I have." }]));
  add(vocabLesson("he_v2", "Thirty verbs", "Infinitives and the present forms", "The core verbs, each with its infinitive and its four present-tense forms (he, she, they m., they f.).",
    "The present tense is a participle: it agrees in gender and number, not in person. אֲנִי לוֹמֵד and הוּא לוֹמֵד are the same word; אֲנִי לוֹמֶדֶת is what a woman says. The infinitive always starts with ל. Learn the infinitive and the masculine singular present together.",
    [{ t: "rule", x: "לוֹמֵד (he / I m.) · לוֹמֶדֶת (she / I f.) · לוֹמְדִים (they m. / we) · לוֹמְדוֹת (they f.)", note: "Four forms per verb in the present. That is the whole present tense." }]));
  add({ id: "he_num", mode: "henum", pass: 7, of: 10, title: "Numbers", sub: "Counting, feminine and masculine", gist: "Hebrew numbers have two genders, and the feminine set is the one used for counting. Learn it first.",
    blocks: [
      { t: "p", x: "Numbers agree with the noun's gender, and, confusingly, the feminine forms are the short ones (אַחַת, שְׁתַּיִם, שָׁלוֹשׁ) while the masculine forms carry an -a ending (אֶחָד, שְׁנַיִם, שְׁלוֹשָׁה). When you count aloud, tell the time or give a phone number, you use the feminine set. Start there." },
      { t: "tbl", head: ["Number", "Feminine (counting)", "Masculine"], rows: [["1", "אַחַת", "אֶחָד"], ["2", "שְׁתַּיִם (שְׁתֵּי + noun)", "שְׁנַיִם (שְׁנֵי + noun)"], ["3", "שָׁלוֹשׁ", "שְׁלוֹשָׁה"], ["4", "אַרְבַּע", "אַרְבָּעָה"], ["5", "חָמֵשׁ", "חֲמִשָּׁה"], ["6", "שֵׁשׁ", "שִׁשָּׁה"], ["7", "שֶׁבַע", "שִׁבְעָה"], ["8", "שְׁמוֹנֶה", "שְׁמוֹנָה"], ["9", "תֵּשַׁע", "תִּשְׁעָה"], ["10", "עֶשֶׂר", "עֲשָׂרָה"], ["20", "עֶשְׂרִים", "עֶשְׂרִים"], ["30 … 90", "שְׁלוֹשִׁים, אַרְבָּעִים, חֲמִשִּׁים, שִׁשִּׁים, שִׁבְעִים, שְׁמוֹנִים, תִּשְׁעִים", "same"], ["100", "מֵאָה", "מֵאָה"], ["1000", "אֶלֶף", "אֶלֶף"]], rtl: true },
      { t: "rule", x: "21 = עֶשְׂרִים וְאַחַת (twenty and one)\n11–19 = unit + עֶשְׂרֵה: אַחַת עֶשְׂרֵה, שְׁתֵּים עֶשְׂרֵה", note: "Tens are the same for both genders; the unit after וְ agrees. The time: הַשָּׁעָה שָׁלוֹשׁ = it's three o'clock; שָׁלוֹשׁ וָחֵצִי = half past three." },
      { t: "key", x: "Count in the feminine: achat, shtayim, shalosh, arba, chamesh, shesh, sheva, shmone, tesha, eser. Tens + ve + unit." },
      { t: "how", drill: "Numbers", ask: "Write this number in Hebrew (the counting forms).", steps: ["Tens first, then וְ, then the unit.", "Teens: unit + esre."], tip: "Read phone numbers and scores aloud in Hebrew; both use the feminine forms." }
    ] });
  add(vocabLesson("he_v3", "Time words", "Days, parts of the day, soon and late", "Sunday is day one and the week starts there; Shabbat closes it. The words for placing a sentence in time.",
    "Days are numbered: יוֹם רִאשׁוֹן (first day) is Sunday, through יוֹם שִׁשִּׁי (Friday), then שַׁבָּת. 'On Monday' is בְּיוֹם שֵׁנִי. 'Tonight' is הָעֶרֶב, 'this morning' הַבֹּקֶר: the definite article makes a time word mean 'this'."));
  add(vocabLesson("he_v4", "People and home", "Family, the house, the everyday nouns", "The first nouns, with their gender and plural: both decide the adjective and the verb.",
    "Most feminine nouns end in -ָה (ה) or -ת; most masculine ones do not. Plurals: masculine -ִים, feminine -וֹת, with plenty of exceptions carried in the forms column. The definite article is a prefix, הַ-, written as part of the word: הַבַּיִת."));

  /* ---------------- stage 2: grammar core ---------------- */
  add({ id: "he_gender", mode: "henoun", pass: 7, of: 10, title: "Gender and plurals", sub: "-im and -ot, and the exceptions", gist: "Every noun is masculine or feminine; the plural is -im or -ot, mostly by gender, with a list of famous exceptions.",
    blocks: [
      { t: "p", x: "Gender is marked on everything that goes with the noun: the adjective, the verb, the numeral, the pronoun. Feminine nouns usually end in -ָה or -ת; masculine nouns usually in a consonant. Paired body parts are feminine (יָד, רֶגֶל, עַיִן, אֹזֶן) and have a dual plural in -ַיִם: יָדַיִם, רַגְלַיִם." },
      { t: "tbl", head: ["Pattern", "Example", "Note"], rows: [["m. → -ִים", "סֵפֶר → סְפָרִים", "the first vowel often shortens"], ["f. -ָה → -וֹת", "יַלְדָּה → יְלָדוֹת", ""], ["f. -ת → -וֹת", "מְכוֹנִית → מְכוֹנִיּוֹת", ""], ["m. with -וֹת", "שֻׁלְחָן → שֻׁלְחָנוֹת, חַלּוֹן → חַלּוֹנוֹת", "still masculine: שֻׁלְחָנוֹת גְּדוֹלִים"], ["f. with -ִים", "מִלָּה → מִלִּים, שָׁנָה → שָׁנִים", "still feminine: שָׁנִים טוֹבוֹת"], ["irregular", "אִישׁ → אֲנָשִׁים, אִשָּׁה → נָשִׁים, בַּיִת → בָּתִּים, עִיר → עָרִים", "learn as words"]], rtl: true },
      { t: "rule", x: "gender decides agreement, not the plural ending\nשֻׁלְחָנוֹת גְּדוֹלִים (m.) · שָׁנִים טוֹבוֹת (f.)", note: "A plural in -ot does not make a noun feminine. Learn the gender, then the plural." },
      { t: "key", x: "Masculine -im, feminine -ot, by default. Paired body parts: feminine, dual -ayim. The famous exceptions are a list, and the drill holds it." },
      { t: "how", drill: "Plurals and gender", ask: "Give the plural, or the gender.", steps: ["Guess by the ending, then check the list of exceptions.", "Say the plural with an adjective to fix the gender: שֻׁלְחָנוֹת גְּדוֹלִים."], tip: "Learn every noun as a trio: סֵפֶר, סְפָרִים, m." }
    ] });
  add({ id: "he_def", mode: "hedef", pass: 7, of: 10, title: "The definite article and adjectives", sub: "ha- on both, adjective after", gist: "'The' is a prefix on the noun, and the adjective follows the noun and copies its definiteness, gender and number.",
    blocks: [
      { t: "p", x: "הַ- attaches to the front of the noun and usually doubles its first consonant (a dagesh): הַסֵּפֶר. Before a guttural (א ה ח ע ר), which cannot double, the vowel changes: הָאִישׁ, הֶחָבֵר, הָהָר. Adjectives come after the noun and agree in gender, number and definiteness: בַּיִת גָּדוֹל, הַבַּיִת הַגָּדוֹל." },
      { t: "rule", x: "a big house:    בַּיִת גָּדוֹל\nthe big house:  הַבַּיִת הַגָּדוֹל   (ha on both)\nthe house is big: הַבַּיִת גָּדוֹל   (ha on the noun only)", note: "The last two differ by one הַ: with it on the adjective it is a phrase, without it a sentence. That is how Hebrew says 'is' without a verb." },
      { t: "tbl", head: ["m. sg.", "f. sg.", "m. pl.", "f. pl."], rows: HE_ADJ.rows.slice(0, 8).map(function (r) { return [r[0], r[1], r[2], r[3]]; }), rtl: true },
      { t: "key", x: "ha- on the noun; the adjective follows and matches it in gender, number and ha-. Drop the second ha- and the phrase becomes a sentence." },
      { t: "how", drill: "The article", ask: "Add the article, or make the phrase definite.", steps: ["Prefix הַ to the noun (הָ or הֶ before gutturals).", "Definite phrase? prefix it to the adjective too."], tip: "Read הַבַּיִת הַגָּדוֹל and הַבַּיִת גָּדוֹל aloud until the difference is audible to you." }
    ] });
  add({ id: "he_adj", mode: "headj", pass: 7, of: 10, title: "Adjective forms", sub: "gadol, gdola, gdolim, gdolot", gist: "Four forms per adjective. The feminine adds -a, the plurals -im and -ot, and the first vowel usually shortens.",
    blocks: [
      { t: "p", x: "Adjectives behave like nouns: -ָה for feminine, -ִים and -וֹת for the plurals. The vowel under the first letter typically reduces to shva when a syllable is added (גָּדוֹל → גְּדוֹלָה). Adjectives ending in -ֶה swap it for -ָה in the feminine (יָפֶה → יָפָה) and drop it in the plural (יָפִים)." },
      { t: "tbl", head: ["m. sg.", "f. sg.", "m. pl.", "f. pl.", "meaning"], rows: HE_ADJ.rows.map(function (r) { return [r[0], r[1], r[2], r[3], r[4]]; }), rtl: true },
      { t: "key", x: "Four forms, learned as a chant: gadol, gdola, gdolim, gdolot." },
      { t: "how", drill: "Adjectives", ask: "Give the feminine or a plural form.", steps: ["Add -a / -im / -ot.", "Shorten the first vowel.", "Watch the -e adjectives: yafe, yafa, yafim, yafot."], tip: "Attach every new adjective to a noun of each gender: ספר טוב, מורה טובה." }
    ] });
  add({ id: "he_pres", mode: "hepres", pass: 7, of: 10, title: "The present tense", sub: "Four forms per verb", gist: "The present is a participle with four forms. Masculine singular, feminine singular, masculine plural, feminine plural. That is all of it.",
    blocks: [
      { t: "p", x: "Pa'al (the simple pattern) present: לוֹמֵד, לוֹמֶדֶת, לוֹמְדִים, לוֹמְדוֹת. The feminine takes -ֶת, or -ַת if the verb ends in a guttural (יוֹדַעַת, שׁוֹמַעַת), or -ָה for verbs whose last root letter is weak (רוֹצָה, קוֹנָה). Pi'el verbs start with מְ (מְדַבֵּר), hif'il with מַ (מַתְחִיל), hitpa'el with מִתְ (מִתְאַמֵּן); their four forms work the same way." },
      { t: "rule", x: "אֲנִי / אַתָּה / הוּא לוֹמֵד · אֲנִי / אַתְּ / הִיא לוֹמֶדֶת\nאֲנַחְנוּ / אַתֶּם / הֵם לוֹמְדִים · אֲנַחְנוּ / אַתֶּן / הֵן לוֹמְדוֹת", note: "The verb does not know who is speaking, only whether it is one or many, male or female." },
      { t: "tbl", head: ["Infinitive", "he", "she", "they (m.)", "they (f.)", "meaning"], rows: HE_PRESENT.rows.slice(0, 12), rtl: true },
      { t: "key", x: "Present = participle: four forms by gender and number. Feminine -et (or -at after a guttural, -a with weak roots)." },
      { t: "how", drill: "Present tense", ask: "Give the form for she, they, and so on.", steps: ["Find the masculine singular.", "Feminine: -et / -at / -a. Plural: -im / -ot, first vowel reduced."], tip: "Describe what people around you are doing, in Hebrew, in your head: הוּא יוֹשֵׁב, הִיא קוֹרֵאת." }
    ] });
  add({ id: "he_yesh", mode: "heprep", pass: 7, of: 10, title: "Yesh, ein and the little prepositions", sub: "I have = there is to me", gist: "Hebrew has no verb 'to have'. יֵשׁ לִי is 'there is to me', and the preposition takes a pronoun suffix. The suffix set is the key to half the grammar.",
    blocks: [
      { t: "p", x: "A pronoun after a preposition becomes a suffix on the preposition: לְ + אֲנִי = לִי, שֶׁל + אַתָּה = שֶׁלְּךָ, אֶת + הוּא = אוֹתוֹ. The same ten suffixes recur on nouns (my, your…) and on verbs (me, you…), so this table is worth more than its size." },
      { t: "tbl", head: ["", "me", "you (m.)", "him", "her", "us", "them"], rows: HE_PREP.rows.map(function (r) { return [r[0] + " (" + r[7] + ")", r[1], r[2], r[3], r[4], r[5], r[6]]; }), rtl: true },
      { t: "rule", x: "יֵשׁ לִי כֶּלֶב = I have a dog\nאֵין לִי זְמַן = I have no time\nיֵשׁ לָהּ / יֵשׁ לָהֶם", note: "In the past and future, 'to be' appears: הָיָה לִי (I had), יִהְיֶה לִי (I will have)." },
      { t: "key", x: "Suffixes: -i, -cha, -o, -a, -nu, -hem. Yesh li, ein li. Shel + suffix for 'my, your': ha-sefer sheli." },
      { t: "how", drill: "Prepositions", ask: "Give the preposition with the pronoun attached.", steps: ["Take the preposition's base.", "Add the suffix for the person.", "Some bases change: עַל → עָלַי, מִן → מִמֶּנִּי."], tip: "Point at things and say שֶׁלִּי, שֶׁלְּךָ, שֶׁלּוֹ. Possession is the most frequent use of the suffixes." }
    ] });
  add({ id: "he_et", mode: "heet", pass: 7, of: 10, title: "Et and word order", sub: "The object marker", gist: "A definite direct object is preceded by אֶת. Nothing in English corresponds to it, and natives notice when it is missing.",
    blocks: [
      { t: "p", x: "Word order is subject, verb, object, as in English, and questions keep the order with a rising tone or a question word in front. The one alien element is אֶת: it sits before a direct object that is definite (has הַ-, is a name, or has a possessive suffix). אֲנִי רוֹאֶה סֵפֶר (a book), אֲנִי רוֹאֶה אֶת הַסֵּפֶר (the book), אֲנִי רוֹאֶה אֶת דָּן." },
      { t: "rule", x: "verb + indefinite object:  רוֹאֶה סֵפֶר\nverb + אֶת + definite object:  רוֹאֶה אֶת הַסֵּפֶר", note: "With a pronoun object, אֶת takes the suffix: אוֹתִי, אוֹתְךָ, אוֹתוֹ." },
      { t: "tbl", head: ["Indefinite", "Definite", ""], rows: HE_ET, rtl: true },
      { t: "key", x: "Definite direct object → אֶת before it. Names count as definite. Pronoun objects: oti, otcha, oto." },
      { t: "how", drill: "Et", ask: "Does the sentence need אֶת?", steps: ["Is there a direct object?", "Is it definite (ha-, a name, a suffix)?", "Both yes: אֶת."], tip: "Say 'et ha-' as one unit. It helps to treat אֶת as part of the article." }
    ] });
  add({ id: "he_smichut", mode: "hesmichut", pass: 6, of: 8, title: "The construct state", sub: "Beit sefer, aruchat boker", gist: "Two nouns glued into 'X of Y': the first noun changes shape and only the second takes the article. Half of Hebrew's compound nouns are built this way.",
    blocks: [
      { t: "p", x: "Smichut (the construct) joins two nouns without 'of'. The first noun is the thing, the second its owner or type: בֵּית סֵפֶר (house of book = school), אֲרוּחַת בֹּקֶר (meal of morning = breakfast). Feminine -ָה becomes -ַת; masculine plural -ִים becomes -ֵי; the first noun may shorten (בַּיִת → בֵּית). The definite article goes on the second noun only: בֵּית הַסֵּפֶר = the school." },
      { t: "rule", x: "f. -ָה → -ַת:  אֲרוּחָה + בֹּקֶר → אֲרוּחַת בֹּקֶר\nm. pl. -ִים → -ֵי:  שִׁעוּרִים + בַּיִת → שִׁעוּרֵי בַּיִת\nthe: on the second noun only:  בֵּית הַסֵּפֶר", note: "In speech, שֶׁל (of) replaces most constructs except the fixed compounds: הַסֵּפֶר שֶׁל דָּן." },
      { t: "tbl", head: ["Noun", "+ noun", "Construct", "Meaning"], rows: HE_SMICHUT.rows, rtl: true },
      { t: "key", x: "Construct: first noun shortens (-a → -at, -im → -ei), article on the second. Fixed compounds use it; everyday possession uses shel." },
      { t: "how", drill: "Construct", ask: "Build the construct phrase.", steps: ["Change the first noun's ending.", "Put the second noun after it, unchanged."], tip: "Street names, institutions and food are mostly constructs: read them on signs." }
    ] });

  /* ---------------- stage 3: vocabulary by theme ---------------- */
  add(vocabLesson("he_v5", "Food and drink", "The café, the table, the bill", "Order, shop, and say it was tasty: בְּתֵאָבוֹן.", "Israeli food vocabulary mixes Hebrew, Arabic and the languages of the diaspora: פָלָאפֶל, חוּמוּס, שַׁקְשׁוּקָה need no translation. The Hebrew nouns carry gender in the forms column."));
  add(vocabLesson("he_v6", "Daily life and the rink", "Routines, clothes, the game", "The hitpa'el verbs of a routine (get up, shower, dress, train) and the words of the game.", "Reflexive routines use the hitpa'el pattern, which starts with מִתְ in the present: מִתְקַלֵּחַ, מִתְלַבֵּשׁ, מִתְאַמֵּן. Spot the pattern and you have three verbs for the price of one."));
  add(vocabLesson("he_v7", "Out and about", "Streets, transport, directions", "Asking the way and getting there.", "Direction takes the suffix -ָה: יָמִינָה (to the right), שְׂמֹאלָה (to the left), הַבַּיְתָה (homeward). It is an old accusative ending that survives in a handful of words."));
  add(vocabLesson("he_v8", "Work and study", "The university, the office, right and wrong", "A student's week in Hebrew.", "Many professions have a feminine in -ת or -ית: מוֹרֶה / מוֹרָה, סְטוּדֶנְט / סְטוּדֶנְטִית, רוֹפֵא / רוֹפְאָה. Say the one that is true of you."));
  add(vocabLesson("he_v9", "Body and health", "Hurting, being ill, the doctor", "What hurts and where, for the clinic.", "'It hurts' is כּוֹאֵב לִי + the body part as the subject: כּוֹאֵב לִי הָרֹאשׁ, כּוֹאֶבֶת לִי הַבֶּטֶן (the verb agrees with the body part, which is feminine here)."));
  add(vocabLesson("he_v10", "Feelings and opinions", "Same'ach, atsuv, chashav", "How you feel and what you think, with the hedges: אוּלַי, דֵּי, בֶּאֱמֶת.", "'I think' is אֲנִי חוֹשֵׁב שֶׁ-, and שֶׁ- (that) is a prefix on the next word: אֲנִי חוֹשֵׁב שֶׁזֶּה טוֹב. The prefix שֶׁ- also makes relative clauses: הָאִישׁ שֶׁגָּר פֹּה = the man who lives here."));
  add(vocabLesson("he_v11", "Nature and weather", "Seasons, animals, the sky", "The weather is 'there is': יֵשׁ שֶׁמֶשׁ, יֵשׁ רוּחַ, and rain 'comes down'.", "Weather verbs: יוֹרֵד גֶּשֶׁם (rain comes down), יוֹרֵד שֶׁלֶג. Temperature: חַם / קַר with no subject: חַם הַיּוֹם. Seasons take בְּ + the article: בַּקַּיִץ, בַּחֹרֶף."));
  add(vocabLesson("he_v12", "Society and news", "Politics, money, the world", "The front page of Haaretz or Ynet, which is where B1 reading begins.", "Note לַעֲלוֹת: it means to go up, to cost, and to immigrate to Israel (make aliyah). כַּמָּה זֶה עוֹלֶה? is 'how much does it cost?'."));
  add(vocabLesson("he_v13", "Connectors", "Ki, lachen, lamrot, adayin", "The words that join sentences into arguments and narratives.", "Prepositions and conjunctions pair up: בִּגְלַל + noun (because of the rain) but כִּי / בִּגְלַל שֶׁ + clause (because it rained); לִפְנֵי + noun but לִפְנֵי שֶׁ + clause; לַמְרוֹת + noun but לַמְרוֹת שֶׁ + clause. The שֶׁ turns a preposition into a conjunction."));
  add(vocabLesson("he_v14", "Slang and the words that make you sound Israeli", "Sababa, yalla, chaval al hazman", "Thirty expressions from the street, with the idioms every Israeli uses daily.", "Israeli speech borrows freely from Arabic (סַבָּבָּה, יַאלְלָה, אַחְלָה) and inverts meanings for emphasis: חֲבָל עַל הַזְּמַן literally 'a pity about the time' means 'amazing'. Use these and the register changes instantly."));

  /* ---------------- stage 4: the verb system ---------------- */
  add({ id: "he_binyan", mode: "hebinyan", pass: 7, of: 10, title: "Roots and binyanim", sub: "Seven patterns, one root", gist: "A three-letter root carries a meaning; seven patterns (binyanim) pour it into moulds: simple, intensive, causative, reflexive, passive. See the pattern and you can conjugate a verb you have never met.",
    blocks: [
      { t: "p", x: "Almost every Hebrew word grows from a root of three consonants. ל-מ-ד is 'learning': לָמַד he learned (pa'al), לִמֵּד he taught (pi'el, intensive/causative), הִתְלַמֵּד he apprenticed (hitpa'el, reflexive), תַּלְמִיד pupil, לִמּוּד study. The binyan is the vowel-and-prefix pattern; it tells you the verb's voice and its whole conjugation." },
      { t: "tbl", head: ["Binyan", "Meaning", "Infinitive shape", "Example"], rows: [["pa'al (קַל)", "simple active", "לִ-X-ֹ-X", "לִלְמֹד learn, לִכְתֹּב write"], ["pi'el", "intensive, causative", "לְ-X-ַ-X-ֵ-X", "לְדַבֵּר speak, לְלַמֵּד teach"], ["hif'il", "causative", "לְהַ-X-X-ִי-X", "לְהַתְחִיל begin, לְהַסְבִּיר explain"], ["hitpa'el", "reflexive, reciprocal", "לְהִתְ-X-ַ-X-ֵ-X", "לְהִתְלַבֵּשׁ dress oneself, לְהִתְאַמֵּן train"], ["nif'al", "passive, reflexive", "לְהִ-X-ָ-X-ֵ-X", "לְהִכָּנֵס enter, לְהִפָּגֵשׁ meet"], ["pu'al", "passive of pi'el", "(no infinitive)", "מְדֻבָּר is spoken"], ["huf'al", "passive of hif'il", "(no infinitive)", "מֻסְבָּר is explained"]], rtl: true },
      { t: "rule", x: "root (3 letters) × binyan (pattern) = verb\nthe infinitive's prefix names the binyan: לִ- pa'al · לְ- pi'el · לְהַ- hif'il · לְהִתְ- hitpa'el · לְהִ- nif'al", note: "Weak roots (with א, ה, ו, י, נ) bend the patterns; learn the regular shape first and the bends as you meet them." },
      { t: "key", x: "Three-letter root plus a pattern. Read the infinitive's prefix to know the binyan, and the binyan to know the conjugation." },
      { t: "how", drill: "Binyanim", ask: "Which binyan is this verb?", steps: ["Look at the infinitive prefix.", "Confirm with the vowel pattern."], tip: "When you meet a new verb, find its root and ask what the other binyanim of that root would mean. Vocabulary multiplies." }
    ] });
  add({ id: "he_past", mode: "hepast", pass: 7, of: 10, title: "The past tense", sub: "Suffixes for person", gist: "Past tense attaches the person to the end of the verb: lamadti, lamadta, lamad, lamda, lamadnu, lamdu. One set of suffixes serves every binyan.",
    blocks: [
      { t: "p", x: "Unlike the present, the past marks person. The base is the third masculine singular (he): לָמַד. Add -תִּי for I, -תָּ for you (m.), -תְּ for you (f.), -ָה for she, -נוּ for we, -תֶּם for you (pl.), -וּ for they. Because the suffix says who, the pronoun is often dropped: לָמַדְתִּי עִבְרִית, I studied Hebrew." },
      { t: "tbl", head: ["", "I", "you (m.)", "he", "she", "we", "they", ""], rows: HE_PAST.rows.slice(0, 10).map(function (r) { return [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]]; }), rtl: true },
      { t: "rule", x: "pa'al: לָמַד · pi'el: דִּבֵּר · hif'il: הִתְחִיל · hitpa'el: הִתְאַמֵּן\n+ -תִּי -תָּ -תְּ -ָה -נוּ -תֶּם -וּ", note: "In she and they, the vowel before the suffix drops: לָמְדָה (lamda), לָמְדוּ (lamdu)." },
      { t: "key", x: "Past = he-form + person suffix. -ti, -ta, -t, -a, -nu, -tem, -u. The same suffixes in every binyan." },
      { t: "how", drill: "Past tense", ask: "Give the past form for the person named.", steps: ["Find the he-form.", "Add the suffix.", "She and they: drop the vowel before the ending."], tip: "Narrate yesterday in Hebrew every night: קַמְתִּי, אָכַלְתִּי, הָלַכְתִּי. Ten verbs, every day." }
    ] });
  add({ id: "he_fut", mode: "hefut", pass: 7, of: 10, title: "The future tense", sub: "Prefixes for person", gist: "The future marks the person at the front: elmad, tilmad, yilmad, nilmad. The same prefixes serve as imperatives and as 'let's'.",
    blocks: [
      { t: "p", x: "Future prefixes: אֶ- (I), תִּ- (you m. and she), יִ- (he), נִ- (we), תִּ-…-וּ (you pl.), יִ-…-וּ (they). Pa'al verbs have a vowel in the middle that must be learned per verb: יִלְמַד (a) but יִכְתֹּב (o). The future also serves as a polite imperative (תָּבוֹא! come!) and after words like צָרִיךְ שֶׁ, רוֹצֶה שֶׁ (I want you to come = I want that you will come)." },
      { t: "tbl", head: ["", "I", "you (m.)", "he", "she", "we", "they", ""], rows: HE_FUTURE.rows.slice(0, 10).map(function (r) { return [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]]; }), rtl: true },
      { t: "rule", x: "אֶ- · תִּ- · יִ- · תִּ- · נִ- · תִּ…וּ · יִ…וּ\nnegative command: אַל + future: אַל תְּדַבֵּר! (don't speak!)", note: "The formal imperative (לְמַד!) exists but Israelis mostly use the future for commands." },
      { t: "key", x: "Future = person prefix + stem. e-, ti-, yi-, ti-, ni-, ti-u, yi-u. Doubles as the everyday imperative." },
      { t: "how", drill: "Future tense", ask: "Give the future form for the person named.", steps: ["Pick the prefix for the person.", "Use the verb's future stem (pa'al: learn the middle vowel).", "Plural: add -u."], tip: "Plan tomorrow in Hebrew: אָקוּם, אֶלְמַד, אֶתְאַמֵּן." }
    ] });

  /* ---------------- stage 5: conversation ---------------- */
  add({ id: "he_conv", mode: "none", apply: "conv", title: "Conversation practice", sub: "Five scripted scenarios", gist: "Dialogues where you answer, graded on function. Output is the skill the other drills cannot build.",
    blocks: [
      { t: "p", x: "Each scenario is a short exchange with an Israeli partner. Read (and hear) the line, type or speak your answer, get graded on whether it did the job, then compare with the model and say it aloud. Repeat until you can run it from memory, then without reading the partner's lines." },
      { t: "tbl", head: ["Scenario", "Level", "You practise"], rows: HE_DIALOGUES.map(function (d) { return [d.title, d.level, d.setting]; }) },
      { t: "key", x: "A dialogue a day, every model answer aloud three times, and shadow the partner's lines." }
    ] });
  add({ id: "he_shadow", mode: "none", title: "Shadowing and native input", sub: "Where to find Hebrew to copy", gist: "Twenty minutes of shadowing a day builds the Israeli rhythm faster than anything else.",
    blocks: [
      { t: "p", x: "Shadow: play native speech and speak along, half a second behind, copying melody and stress rather than parsing. The sources below are free and graded from easy to native." },
      { t: "tbl", head: ["Source", "What it is"], rows: [["Kan: Chadashot be'ivrit kala", "Israeli public radio's news in easy Hebrew, weekly, with text."], ["Streetwise Hebrew (podcast)", "Guy Sharett. Ten minutes on one word or idiom, in English, with real Israeli audio."], ["Hebrew Time / Teach Me Hebrew", "Beginner podcasts and videos with transcripts."], ["Kan 11 and Kan Box", "Israeli public TV: news, dramas (Shtisel, Fauda, Tehran) with Hebrew subtitles."], ["Pealim.com", "Every verb, every binyan, every form. The verb tables of this course, complete."], ["Sefaria", "The entire Hebrew Bible and rabbinic literature with English, free, for the Biblical track."]] },
      { t: "rule", x: "daily: 10 min shadowing + 10 min dialogue + reviews\nweekly: 30 minutes of a show with Hebrew subtitles, logged", note: "Log the minutes on the Level page. Hebrew is FSI category III: the hours matter even more than for Swedish." },
      { t: "key", x: "Shadow aloud daily. Log every minute of real Hebrew." }
    ] });

  /* ---------------- stage 6: reading and listening ---------------- */
  HE_READINGS.forEach(function (R) {
    add({ id: R.id, mode: "quiz", pass: Math.max(2, R.qs.length - 1), of: R.qs.length, title: R.title, sub: "Reader · " + R.level, gist: lgStrip(R.text[0]).slice(0, 80) + "…", reading: R,
      quiz: R.qs.map(function (q) { return { q: q.q, options: q.options, answer: q.answer }; }),
      blocks: [{ t: "p", x: "Read once for the gist, once with the glossary, then listen with your eyes closed (the speaker button), then answer. The text is pointed; the questions are too. By the B2 reader you should try the unpointed version: tap the text to toggle the points." }]
        .concat(R.text.map(function (p) { return { t: "p", x: p, lang: "he" }; }))
        .concat([{ t: "tbl", head: ["Word", "Meaning"], rows: R.gloss, rtl: true }, { t: "key", x: "Extensive reading is how the vocabulary grows after the first thousand words. Finish the readers, then move to easy news on Kan and children's books from the Israeli library (Gesher le'Ivrit)." }]) });
  });
  add({ id: "he_dict", mode: "hedict", pass: 6, of: 8, title: "Dictation", sub: "Hear it, write it", gist: "Sentences at natural speed; you type them in Hebrew letters. Spelling, grammar and the ear, trained at once.",
    blocks: [{ t: "p", x: "Type without points. If the device has no Hebrew voice, the sentence shows for a few seconds and hides." }, { t: "key", x: "Listen twice, write once, compare letter by letter." }, { t: "how", drill: "Dictation", ask: "Type what you heard.", steps: ["Play it.", "Type the whole sentence.", "Compare; points and punctuation are ignored, letters are not."], tip: "Say it back before you type it." }] });
  add({ id: "he_write", mode: "hewrite", pass: 6, of: 8, title: "Writing: translate the sentence", sub: "English in, Hebrew out", gist: "Short sentences from A1 to B2, each with several accepted answers. Gender, et, the tenses and the suffixes tested together.",
    blocks: [{ t: "p", x: "Write the sentence, then check it: gender agreement? אֶת before a definite object? the right binyan and tense? Both masculine and feminine first-person versions are accepted where it matters." }, { t: "key", x: "Production is the test. Translate, check against the rules, say it aloud." }, { t: "how", drill: "Writing", ask: "Translate into Hebrew.", steps: ["Subject, verb, object.", "Et if the object is definite.", "Agreement everywhere."], tip: "Keep a daily journal of three Hebrew sentences. Thirty seconds, every day." }] });

  /* ---------------- stage 7: Biblical Hebrew ---------------- */
  add({ id: "bh_intro", mode: "none", title: "Biblical Hebrew: what changes", sub: "Same letters, older grammar", gist: "The Bible's Hebrew is the ancestor of modern Hebrew. Letters, roots and most words carry over; the verb system and the word order do not. Here is the map.",
    blocks: [
      { t: "p", x: "Modern Hebrew was rebuilt from Biblical and rabbinic Hebrew, so everything you have learned transfers: the alef-bet, the points, the roots, the binyanim, the suffixes, and most of the core vocabulary (אֱלֹהִים, מֶלֶךְ, בַּיִת, יוֹם, טוֹב). The differences are systematic and learnable in a few lessons." },
      { t: "tbl", head: ["Feature", "Modern", "Biblical"], rows: [["Word order", "subject, verb, object", "verb, subject, object: וַיֹּאמֶר אֱלֹהִים (and said God)"], ["Tenses", "past, present, future", "perfect (complete) and imperfect (incomplete); time comes from context"], ["Narrative", "past tense", "vav-consecutive: וַיִּ- + imperfect = 'and then he…' (the backbone of every story)"], ["Pronunciation", "Israeli", "same letters; Biblical reading keeps ע, ח and vowel length (Tiberian or Sephardi tradition)"], ["Vocabulary", "~60,000 words", "~8,000 words; the top 150 cover 60% of the text, the top 1,000 about 90%"], ["Points", "rarely written", "always written, plus cantillation accents (te'amim) for chanting"]] },
      { t: "rule", x: "qatal (perfect) = completed: שָׁמַר he kept\nyiqtol (imperfect) = incomplete: יִשְׁמֹר he will keep / keeps\nwayyiqtol (vav-consecutive) = past narrative: וַיִּשְׁמֹר and he kept", note: "The vav-consecutive is why the Bible's stories read as 'and… and… and…'. Each וַיִּ- is a new event in sequence." },
      { t: "key", x: "Verb first. Perfect and imperfect, not tenses. Vav-consecutive drives narrative. The words you know are mostly the same words." }
    ] });
  add(vocabLesson("bh_v1", "The Bible's most frequent words", "Particles, God, the core verbs", "Thirty words that account for a large share of every page of the Tanakh. Learn these and Genesis 1 opens up.", "Frequency counts over the Hebrew Bible put the conjunction וְ, the article הַ, the prepositions לְ and בְּ, and the object marker אֶת at the top, followed by אֱלֹהִים, יְהוָה and the verbs of saying and being. The examples are verse fragments: you are reading scripture from the first card.", null, B));
  add(vocabLesson("bh_v2", "The Bible's most frequent words, two", "Pronouns, adjectives, the big nouns", "Covenant, soul, spirit, name, law: the nouns of the text's main themes, with the particles that join clauses.", "Note the relative particle אֲשֶׁר (modern שֶׁ-), כִּי doing the work of 'because', 'that' and 'when', and עוֹלָם meaning 'forever' rather than 'world'. Meanings drift; the frequent words drift most.", null, B));
  add(vocabLesson("bh_v3", "Verbs of the narrative", "Created, called, went, took", "The verbs that carry the stories, each shown in its vav-consecutive form as it appears in the text.", "Each verb is listed as the 3ms perfect (he did), the dictionary form, with the wayyiqtol in the example. Learn both shapes: בָּרָא / וַיִּבְרָא, קָרָא / וַיִּקְרָא, הָלַךְ / וַיֵּלֶךְ. The weak roots (ending in ה, beginning with י or נ) bend the most.", null, B));
  add({ id: "bh_qal", mode: "bhqal", pass: 7, of: 10, title: "The Qal perfect and imperfect", sub: "שָׁמַר / יִשְׁמֹר", gist: "The strong verb paradigm every grammar begins with. The suffixes of the perfect and the prefixes of the imperfect are the same ones modern Hebrew uses for past and future.",
    blocks: [
      { t: "p", x: "You already know most of this table: the perfect's suffixes are the modern past (-תִּי, -תָּ, -ָה, -נוּ, -וּ) and the imperfect's prefixes are the modern future (אֶ-, תִּ-, יִ-, נִ-). Biblical Hebrew adds a few forms modern speech dropped (the feminine plurals in -נָה, the 2fs perfect -תְּ) and uses the forms for aspect rather than time." },
      { t: "tbl", head: ["Person", "Perfect", "Imperfect"], rows: BH_QAL.rows.map(function (r) { return [r[0], r[1], r[2]]; }), rtl: true },
      { t: "rule", x: "perfect = completed action (often past): שָׁמַר\nimperfect = incomplete, habitual, future, or modal: יִשְׁמֹר\nvav-consecutive imperfect = narrative past: וַיִּשְׁמֹר\nvav-consecutive perfect = future/command sequence: וְשָׁמַרְתָּ (and you shall keep)", note: "The vav flips the aspect: a perfect with וְ in a command sequence reads as future, an imperfect with וַ reads as past. That is the famous 'vav conversive'." },
      { t: "key", x: "Perfect suffixes = modern past. Imperfect prefixes = modern future. The vav-consecutive swaps them in narrative." },
      { t: "how", drill: "Qal paradigm", ask: "Give the perfect or imperfect form for the person.", steps: ["Perfect: root + suffix.", "Imperfect: prefix + root (+ suffix in the plurals)."], tip: "Chant the paradigm aloud: shamar, shamra, shamarta, shamart, shamarti, shamru… It is how every seminary teaches it, because it works." }
    ] });
  add({ id: "bh_parse", mode: "bhparse", pass: 7, of: 10, title: "Parsing", sub: "Name the form", gist: "Reading the Bible is parsing: binyan, conjugation, person, gender, number. Fast parsing is what separates reading from decoding.",
    blocks: [
      { t: "p", x: "Every verb form answers five questions: which binyan, which conjugation (perfect, imperfect, imperative, participle, infinitive), which person, gender and number. With the vav-consecutive marked separately. The drill shows a form and asks for the parse. Speed matters: at a word a second you are reading, at ten seconds a word you are solving puzzles." },
      { t: "tbl", head: ["Form", "Parse", "Meaning"], rows: BH_PARSE.rows.slice(0, 10), rtl: true },
      { t: "key", x: "Parse: binyan, conjugation, PGN. Prefix = imperfect, suffix = perfect, וַיִּ = narrative past, מְ/מַ/מִתְ = participles of the derived binyanim." },
      { t: "how", drill: "Parsing", ask: "Parse the form.", steps: ["Prefix or suffix? That gives the conjugation.", "Which binyan from the vowels and prefix?", "Person, gender, number from the affix."], tip: "Parse every verb in the three readings here. Then open Genesis 2 on Sefaria and keep going." }
    ] });
  BH_TEXTS.forEach(function (T) {
    var qs = [];
    T.verses.forEach(function (v) { v.words.forEach(function (w) { qs.push({ q: "In " + T.title + ", what does <b class='tw'>" + w[0] + "</b> mean?", w: w }); }); });
    add({ id: "bh_" + T.id, mode: "bhtext:" + T.id, pass: 8, of: 10, title: T.title, sub: "Read word by word · " + T.ref, gist: T.verses[0].gloss, text: T,
      blocks: [{ t: "p", x: "Read each verse aloud, then the gloss word by word, then the verse again. The checkpoint asks the words. Once you pass, the verse is yours: read it without the gloss every week." }]
        .concat(T.verses.map(function (v) { return { t: "verse", v: v }; }))
        .concat([{ t: "key", x: "Memorise the passage. Recitation is the oldest spaced-retrieval system there is, and it works." }]) });
  });

  /* ---------------- stage 8: the pro path ---------------- */
  add({ id: "he_pro", mode: "none", title: "From B1 to native: the programme", sub: "Hours, sources, and both Hebrews", gist: "Hebrew is FSI category III: about 1,100 hours to professional proficiency. The drills get you to B1; input, output and logging get you the rest.",
    blocks: [
      { t: "p", x: "The Foreign Service Institute puts Hebrew in category III (with Russian, Hindi, Thai): about 1,100 classroom hours, four times Swedish. The reasons are the script, the root system, and vocabulary with no English cognates. None of that is avoided by a clever method; all of it is shortened by not wasting hours: sounds first, frequency-ordered words, spaced retrieval, speed gates, daily output with feedback, and native input from the first month." },
      { t: "tbl", head: ["Level", "What it looks like", "Hours (rough)", "What to do"], rows: [["A1–A2", "Read pointed text, survive, introduce", "0–250", "Stages 0–5 here, daily reviews, dialogues"], ["B1", "Conversation, easy news, unpointed text", "250–500", "Readers here, Kan easy news daily, Streetwise Hebrew, one dialogue a day, shadowing"], ["B2", "Israeli TV with Hebrew subtitles, argue, write", "500–800", "An hour of native input a day, 100 written words a day, a tutor or tandem partner twice a week"], ["C1", "Professional use, read anything", "800–1200", "Native media without subtitles, books, long podcasts; speak daily; register and slang"], ["C2", "Near-native", "1500+", "Live in the language"]] },
      { t: "p", x: "Biblical Hebrew has its own track: after the three texts here, read a chapter a week on Sefaria with the English beside it, parse every verb, and keep the frequent-word decks on schedule. For grammar, Pratico and Van Pelt's Basics of Biblical Hebrew is the standard first book; for reading, start with Genesis, Ruth and Jonah, whose prose is the simplest in the Bible." },
      { t: "rule", x: "the level model = words known + grammar passed + applied skill + logged hours\nhours count toward 1,100", note: "Log every minute of real Hebrew input and output on the Level page." },
      { t: "key", x: "After B1: native input daily, written output daily, spoken output with a native twice a week, a Biblical chapter a week, all logged." }
    ] });

  var PATH = [
    { title: "The alef-bet", sub: "Letters and points", blurb: "Twenty-two letters, five final forms, the vowel points, and reading pointed words until it is automatic.", ids: ["he_alef1", "he_alef2", "he_vowels", "he_read"] },
    { title: "First words", sub: "The hundred that cover half of speech", blurb: "Pronouns, the core verbs and their present forms, numbers, time and the first nouns.", ids: ["he_v1", "he_v2", "he_num", "he_v3", "he_v4"] },
    { title: "Grammar core", sub: "Gender, the article, present tense, suffixes", blurb: "Gender and plurals, ha- and adjectives, the four-form present, yesh/ein and the pronoun suffixes, et, and the construct.", ids: ["he_gender", "he_def", "he_adj", "he_pres", "he_yesh", "he_et", "he_smichut"] },
    { title: "Vocabulary by theme", sub: "Toward a thousand words", blurb: "Food, daily life, the city, work, the body, feelings, nature, society, connectors, slang.", ids: ["he_v5", "he_v6", "he_v7", "he_v8", "he_v9", "he_v10", "he_v11", "he_v12", "he_v13", "he_v14"] },
    { title: "The verb system", sub: "Roots, binyanim, past and future", blurb: "The root-and-pattern system, then the past (suffixes) and the future (prefixes) across the binyanim.", ids: ["he_binyan", "he_past", "he_fut"] },
    { title: "Conversation", sub: "Output with feedback", blurb: "Scripted scenarios you must answer, and shadowing with Israeli audio.", ids: ["he_conv", "he_shadow"] },
    { title: "Reading and listening", sub: "Readers, dictation, writing", blurb: "Four readers from A1 to B2, dictation at speed, and translation into Hebrew.", ids: HE_READINGS.map(function (r) { return r.id; }).concat(["he_dict", "he_write"]) },
    { title: "Biblical Hebrew", sub: "The text itself", blurb: "What changes, the most frequent words of the Tanakh, the Qal paradigm, parsing, and Genesis 1, Psalm 23 and the Shema word by word.", ids: ["bh_intro", "bh_v1", "bh_v2", "bh_v3", "bh_qal", "bh_parse"].concat(BH_TEXTS.map(function (t) { return "bh_" + t.id; })) },
    { title: "The pro path", sub: "B1 to native", blurb: "The hours, the sources, both Hebrews, and the log.", ids: ["he_pro"] }
  ];

  /* ---------------- drills ---------------- */
  function pick(a, rnd) { return a[((rnd || Math.random)() * a.length) | 0]; }
  function tts(text, caps) { return caps && caps.tts ? { text: text, lang: "he-IL" } : null; }
  var ALLV = [];
  Object.keys(V).forEach(function (k) { V[k].forEach(function (r) { ALLV.push(r); }); });
  var DRILLS = {
    heletter: { name: "Letters", target: 6, gen: function (ctx) {
      var row = pick(LET, ctx.rnd), kind = ctx.rnd();
      var others = lgShuffle(LET.filter(function (r) { return r !== row; }).slice(), ctx.rnd).slice(0, 3);
      if (kind < 0.4) return { kind: "choice", question: "What is the name of <b class='tw big'>" + row[0] + "</b>?", options: lgShuffle([row[1]].concat(others.map(function (r) { return r[1]; })), ctx.rnd), answer: row[1], target: 6, explain: ["<b>" + row[0] + "</b> " + row[1] + ": " + row[2]], rtl: true };
      if (kind < 0.8) return { kind: "choice", question: "Which letter is <b>" + row[1] + "</b> (" + row[2] + ")?", options: lgShuffle([row[0]].concat(others.map(function (r) { return r[0]; })), ctx.rnd), answer: row[0], target: 6, explain: ["<b>" + row[0] + "</b> " + row[1] + ": " + row[2]], rtl: true };
      var finals = LET.filter(function (r) { return r[4]; }), fr = pick(finals, ctx.rnd);
      return { kind: "choice", question: "What is the final form of <b class='tw big'>" + fr[0] + "</b> (" + fr[1] + ")?", options: lgShuffle(finals.map(function (r) { return r[4]; }), ctx.rnd).slice(0, 4).filter(function (x) { return x !== fr[4]; }).slice(0, 3).concat([fr[4]]).sort(function () { return ctx.rnd() - 0.5; }), answer: fr[4], target: 6, explain: ["<b>" + fr[0] + "</b> becomes <b>" + fr[4] + "</b> at the end of a word."], rtl: true };
    } },
    hevowel: { name: "Vowels", target: 6, gen: function (ctx) {
      var v = pick(HE_VOWELS, ctx.rnd), others = lgShuffle(HE_VOWELS.filter(function (r) { return r !== v && r[2] !== v[2]; }).slice(), ctx.rnd).slice(0, 3);
      return { kind: "choice", question: "Which sound does <b class='tw big'>" + "בּ" + v[0] + "</b> make? (" + v[1] + ")", options: lgShuffle([v[2]].concat(others.map(function (r) { return r[2]; })), ctx.rnd), answer: v[2], target: 6, explain: ["<b>" + v[1] + "</b>: " + v[2] + " → b" + v[3]], rtl: true };
    } },
    heread: { name: "Reading", target: 8, gen: function (ctx) {
      var pool = ALLV.filter(function (r) { return r[1].indexOf(" ") < 0 && r[1].length <= 9; });
      var row = pick(pool, ctx.rnd), others = lgShuffle(pool.filter(function (r) { return r !== row && r[1] !== row[1]; }).slice(), ctx.rnd).slice(0, 3);
      return { kind: "choice", question: "How is <b class='tw big'>" + row[0] + "</b> pronounced?", options: lgShuffle([row[1]].concat(others.map(function (r) { return r[1]; })), ctx.rnd), answer: row[1], target: 8, explain: ["<b>" + row[0] + "</b> = " + row[1] + " (" + row[2] + ")"], speakAfter: tts(row[0], ctx.caps), rtl: true };
    } },
    henum: { name: "Numbers", target: 10, gen: function (ctx) {
      var n = ctx.rnd() < 0.5 ? (ctx.rnd() * 11) | 0 : ctx.rnd() < 0.8 ? 11 + ((ctx.rnd() * 89) | 0) : 100 + ((ctx.rnd() * 900) | 0);
      var w = lgNumberWords("he", n);
      return { kind: "text", question: "Write <b>" + n + "</b> in Hebrew (counting forms).", answer: w, accept: [w], target: 10, explain: ["<b>" + n + "</b> = " + w], speakAfter: tts(w, ctx.caps), keyboard: "he", rtl: true };
    } },
    henoun: { name: "Plurals and gender", target: 8, gen: function (ctx) { return lgFormQ(HE_NOUNS, "he", ctx.rnd, ctx.caps); } },
    headj: { name: "Adjectives", target: 7, gen: function (ctx) { return lgFormQ(HE_ADJ, "he", ctx.rnd, ctx.caps); } },
    hepres: { name: "Present tense", target: 9, gen: function (ctx) { return lgFormQ(HE_PRESENT, "he", ctx.rnd, ctx.caps); } },
    hepast: { name: "Past tense", target: 10, gen: function (ctx) { return lgFormQ(HE_PAST, "he", ctx.rnd, ctx.caps); } },
    hefut: { name: "Future tense", target: 10, gen: function (ctx) { return lgFormQ(HE_FUTURE, "he", ctx.rnd, ctx.caps); } },
    heprep: { name: "Prepositions", target: 8, gen: function (ctx) { return lgFormQ(HE_PREP, "he", ctx.rnd, ctx.caps); } },
    hesmichut: { name: "Construct", target: 9, gen: function (ctx) { return lgFormQ(HE_SMICHUT, "he", ctx.rnd, ctx.caps); } },
    hebinyan: { name: "Binyanim", target: 6, gen: function (ctx) { return lgFormQ(HE_BINYAN, "he", ctx.rnd, ctx.caps); } },
    bhqal: { name: "Qal paradigm", target: 10, gen: function (ctx) { return lgFormQ(BH_QAL, "he", ctx.rnd, ctx.caps); } },
    bhparse: { name: "Parsing", target: 9, gen: function (ctx) { return lgFormQ(BH_PARSE, "he", ctx.rnd, ctx.caps); } },
    hedef: { name: "The article", target: 7, gen: function (ctx) {
      var r = pick(HE_DEF, ctx.rnd);
      return { kind: "text", question: "Make it definite: <b class='tw'>" + r[0] + "</b> <small>(" + r[2] + ")</small>", answer: r[1], accept: [r[1]], target: 7, explain: ["<b>" + r[1] + "</b>", "ha- on the noun, and on the adjective too if there is one."], speakAfter: tts(r[1], ctx.caps), keyboard: "he", rtl: true };
    } },
    heet: { name: "Et", target: 7, gen: function (ctx) {
      var r = pick(HE_ET, ctx.rnd), def = ctx.rnd() < 0.5, right = def ? r[1] : r[0], wrong = def ? r[0].replace(/\.$/, "") .replace(/ (\S+)\.?$/, " הַ$1.") : r[1];
      var g = r[2].split(" / ");
      var options = def ? [r[1], r[1].replace("אֶת ", "")] : [r[0], r[0].replace(/(\S+)\.$/, "אֶת $1.")];
      return { kind: "choice", question: "Which is right for <b>" + (def ? g[1] || g[0] : g[0]) + "</b>?", options: lgShuffle(options, ctx.rnd), answer: right, target: 7, explain: ["<b>" + right + "</b>", def ? "The object is definite, so אֶת goes before it." : "The object is indefinite: no אֶת."], speakAfter: tts(right, ctx.caps), rtl: true };
    } },
    hedict: { name: "Dictation", target: 22, gen: function (ctx) {
      var r = pick(HE_DICTATION, ctx.rnd);
      return { kind: "text", question: "Type what you " + (ctx.caps && ctx.caps.tts ? "hear" : "read, after it hides") + ". <small>(" + r[1] + ")</small>", answer: r[0], accept: [r[0]], target: 22, explain: ["<b>" + r[0] + "</b>"], speak: tts(r[0], ctx.caps), flash: !(ctx.caps && ctx.caps.tts) ? r[0] : null, hideText: true, keyboard: "he", rtl: true };
    } },
    hewrite: { name: "Writing", target: 22, gen: function (ctx) {
      var r = pick(HE_WRITING, ctx.rnd);
      return { kind: "text", question: "Translate into Hebrew: <b>" + r[0] + "</b> <small>(" + r[2] + ")</small>", answer: r[1][0], accept: r[1], target: 22, explain: ["<b>" + r[1][0] + "</b>" + (r[1].length > 1 ? " (also: " + r[1].slice(1).join(" / ") + ")" : "")], speakAfter: tts(r[1][0], ctx.caps), keyboard: "he", rtl: true };
    } }
  };
  /* the Biblical texts: a word from the passage, pick its gloss */
  BH_TEXTS.forEach(function (T) {
    var words = [];
    T.verses.forEach(function (v) { v.words.forEach(function (w) { words.push(w); }); });
    DRILLS["bhtext:" + T.id] = { name: T.title, target: 7, gen: function (ctx) {
      var w = pick(words, ctx.rnd), others = lgShuffle(words.filter(function (x) { return x[1] !== w[1]; }).slice(), ctx.rnd).slice(0, 3);
      return { kind: "choice", question: T.title + ": what does <b class='tw'>" + w[0] + "</b> mean?", options: lgShuffle([w[1]].concat(others.map(function (x) { return x[1]; })), ctx.rnd), answer: w[1], target: 7, explain: ["<b>" + w[0] + "</b> = " + w[1]], speakAfter: tts(w[0], ctx.caps), rtl: true };
    } };
  });

  var FORMULAS = [
    { id: "he_finals", name: "The five final letters", topic: "The alef-bet", lesson: "he_alef2", f: "כ→ך · מ→ם · נ→ן · פ→ף · צ→ץ", anchors: [["שָׁלוֹם", "final mem"], ["אֶרֶץ", "final tsadi"]], note: "Same sound, end-of-word shape." },
    { id: "he_dagesh", name: "Hard and soft", topic: "The alef-bet", lesson: "he_alef1", f: "בּ b / ב v · כּ k / כ ch · פּ p / פ f", anchors: [["בַּיִת", "b"], ["אָבִיב", "v"]], note: "A dot (dagesh) hardens." },
    { id: "he_vow", name: "The vowel points", topic: "The alef-bet", lesson: "he_vowels", f: "a: ַ ָ · e: ֶ ֵ · i: ִ · o: ֹ וֹ · u: ֻ וּ · shva: ְ", anchors: [["שָׁלוֹם", "sha-lom"]], note: "Consonant first, then its vowel." },
    { id: "he_stress", name: "Stress", topic: "Reading", lesson: "he_read", f: "last syllable, except segolates (יֶלֶד, סֵפֶר)", anchors: [["shaLOM", ""], ["YEled", "segolate"]], note: "" },
    { id: "he_plural", name: "Plurals", topic: "Nouns", lesson: "he_gender", f: "m. -ִים · f. -וֹת · dual -ַיִם", anchors: [["סְפָרִים", ""], ["יְלָדוֹת", ""], ["יָדַיִם", "hands"]], note: "Exceptions keep their gender: שֻׁלְחָנוֹת גְּדוֹלִים." },
    { id: "he_ha", name: "The article", topic: "Nouns", lesson: "he_def", f: "הַ + doubling · הָ / הֶ before gutturals", anchors: [["הַסֵּפֶר", ""], ["הָאִישׁ", ""]], note: "Adjective after the noun, agreeing in gender, number and ha-." },
    { id: "he_isdef", name: "Phrase vs sentence", topic: "Nouns", lesson: "he_def", f: "הַבַּיִת הַגָּדוֹל (the big house) · הַבַּיִת גָּדוֹל (the house is big)", anchors: [], note: "No verb 'is' in the present." },
    { id: "he_presf", name: "Present tense", topic: "Verbs", lesson: "he_pres", f: "לוֹמֵד · לוֹמֶדֶת · לוֹמְדִים · לוֹמְדוֹת", anchors: [["אֲנִי לוֹמֵד = הוּא לוֹמֵד", "no person"]], note: "Gender and number only." },
    { id: "he_pastf", name: "Past tense", topic: "Verbs", lesson: "he_past", f: "he-form + -תִּי -תָּ -תְּ -ָה -נוּ -תֶּם -וּ", anchors: [["לָמַדְתִּי", "I learned"], ["לָמְדוּ", "they learned"]], note: "The same suffixes in every binyan." },
    { id: "he_futf", name: "Future tense", topic: "Verbs", lesson: "he_fut", f: "אֶ- תִּ- יִ- תִּ- נִ- תִּ…וּ יִ…וּ + stem", anchors: [["אֶלְמַד", "I will learn"], ["יִלְמְדוּ", "they will learn"]], note: "Doubles as the imperative. אַל + future = don't." },
    { id: "he_suf", name: "Pronoun suffixes", topic: "Grammar", lesson: "he_yesh", f: "-ִי -ְךָ -וֹ -ָהּ -נוּ -ָם", anchors: [["שֶׁלִּי", "mine"], ["אוֹתוֹ", "him"], ["לָהֶם", "to them"]], note: "On prepositions, nouns and verbs alike." },
    { id: "he_yeshf", name: "To have", topic: "Grammar", lesson: "he_yesh", f: "יֵשׁ לִי = I have · אֵין לִי = I have not", anchors: [["הָיָה לִי", "I had"], ["יִהְיֶה לִי", "I will have"]], note: "" },
    { id: "he_etf", name: "The object marker", topic: "Grammar", lesson: "he_et", f: "verb + אֶת + definite object", anchors: [["רוֹאֶה אֶת הַסֵּפֶר", ""], ["רוֹאֶה סֵפֶר", "no et"]], note: "Names and suffixed nouns count as definite." },
    { id: "he_smf", name: "Construct state", topic: "Grammar", lesson: "he_smichut", f: "-ָה → -ַת · -ִים → -ֵי · article on the second noun", anchors: [["בֵּית הַסֵּפֶר", "the school"], ["אֲרוּחַת בֹּקֶר", "breakfast"]], note: "" },
    { id: "he_binf", name: "The binyanim", topic: "Verbs", lesson: "he_binyan", f: "root × pattern · לִ- pa'al · לְ- pi'el · לְהַ- hif'il · לְהִתְ- hitpa'el · לְהִ- nif'al", anchors: [["ל-מ-ד", "לָמַד learn, לִמֵּד teach, הִתְלַמֵּד apprentice"]], note: "" },
    { id: "bh_aspect", name: "Perfect, imperfect, vav-consecutive", topic: "Biblical", lesson: "bh_qal", f: "qatal: complete · yiqtol: incomplete · wayyiqtol: narrative past · weqatal: command sequence", anchors: [["וַיֹּאמֶר", "and he said"], ["וְאָהַבְתָּ", "and you shall love"]], note: "The vav flips the aspect." },
    { id: "bh_order", name: "Biblical word order", topic: "Biblical", lesson: "bh_intro", f: "verb · subject · object", anchors: [["וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹם", "and called God the light Day"]], note: "" },
    { id: "he_fsi", name: "Hours to proficiency", topic: "The path", lesson: "he_pro", f: "FSI category III: ~1,100 hours to C1", anchors: [["A2", "~250 h"], ["B1", "~500 h"], ["B2", "~800 h"]], note: "Log the hours." }
  ];
  var GLOSSARY = [
    ["niqqud", ["vowel points", "points"], "The dots and dashes that mark vowels, used in children's books, poetry, prayer books and the Bible.", "he_vowels"],
    ["dagesh", [], "A dot inside a letter: it hardens ב כ פ and marks doubling after the article.", "he_alef1"],
    ["segolate", ["segolates"], "A two-syllable noun with two segols (יֶלֶד, סֵפֶר) stressed on the first syllable.", "he_read"],
    ["binyan", ["binyanim"], "One of the seven verb patterns that pour a root into a voice: simple, intensive, causative, reflexive, passive.", "he_binyan"],
    ["root", ["shoresh", "roots"], "The three consonants that carry a word's core meaning across all its forms.", "he_binyan"],
    ["smichut", ["construct state", "construct"], "Two nouns joined as 'X of Y', the first shortened, the article on the second.", "he_smichut"],
    ["et", ["אֶת", "object marker"], "The particle that precedes a definite direct object.", "he_et"],
    ["vav-consecutive", ["wayyiqtol", "vav conversive"], "The Biblical וַיִּ- prefix that makes an imperfect read as sequential past narrative.", "bh_qal"],
    ["qatal", ["perfect"], "The Biblical suffix conjugation, for completed action.", "bh_qal"],
    ["yiqtol", ["imperfect"], "The Biblical prefix conjugation, for incomplete, future or modal action.", "bh_qal"],
    ["Tiberian", ["Masoretes", "masoretic"], "The vowel and accent system fixed in Tiberias around 900 CE, which every printed Bible uses.", "bh_intro"],
    ["aliyah", ["la'alot"], "Immigration to Israel, literally 'going up'.", "he_v12"],
    ["CEFR", ["A1", "A2", "B1", "B2", "C1", "C2"], "The European scale of language levels from A1 to C2.", "he_pro"],
    ["FSI", ["Foreign Service Institute"], "The US diplomatic language school whose hour estimates measure how long a language takes.", "he_pro"]
  ];
  var READING = [
    { g: "Method", items: [["Fluent Forever", "Gabriel Wyner. Sounds first, personal cards, spaced repetition: the method the language stages follow."], ["Make It Stick", "Brown, Roediger and McDaniel. The science behind the schedule."], ["Learning Vocabulary in Another Language", "Paul Nation. Why frequency order matters."]] },
    { g: "Modern Hebrew", items: [["Hebrew from Scratch (עברית מן ההתחלה)", "Chayat, Israeli and Kobliner. The Hebrew University ulpan book, parts 1 and 2."], ["Pealim.com", "Every verb in every binyan and form, free."], ["Morfix", "The standard Hebrew–English dictionary, with pointed headwords and audio."], ["Kan: news in easy Hebrew", "Weekly, with text, from Israeli public radio."], ["Streetwise Hebrew", "Guy Sharett's podcast: one word or idiom per episode with real audio."]] },
    { g: "Biblical Hebrew", items: [["Basics of Biblical Hebrew", "Pratico and Van Pelt. The standard first grammar, with a workbook."], ["A Reader's Hebrew Bible", "Brown and Smith. The text with rare words glossed at the foot of the page."], ["Sefaria", "The whole Tanakh and commentary, Hebrew and English, free online."], ["The Hebrew Bible: A Translation with Commentary", "Robert Alter. For reading the English with an ear for the Hebrew."], ["Biblical Hebrew Vocabulary by Frequency", "Van Pelt and Pratico. The lists this course's Biblical decks are modelled on."]] }
  ];
  var RANKS = [{ xp: 0, name: "מַתְחִיל · Matchil" }, { xp: 300, name: "תַּלְמִיד · Talmid" }, { xp: 1000, name: "מְדַבֵּר · Medaber" }, { xp: 2500, name: "קוֹרֵא · Kore" }, { xp: 5000, name: "כּוֹתֵב · Kotev" }, { xp: 9000, name: "שׁוֹטֵף · Shotef" }, { xp: 15000, name: "מֻמְחֶה · Mumche" }, { xp: 25000, name: "בָּקִי · Baki" }];

  registerCourse({
    id: "he", name: "Hebrew", short: "HE", glyph: "א", kind: "lang", lang: "he", color: "#D4A03C",
    tagline: "Modern and Biblical, from the alef-bet to reading the text itself.",
    blurb: "The letters and points, the thousand words that matter, the root-and-pattern verb system, output under pressure, and a Biblical track that reads Genesis 1, Psalm 23 and the Shema word by word.",
    path: PATH, lessons: LESSONS, drills: DRILLS, vocab: Object.assign({}, V, B), formulas: FORMULAS, glossary: GLOSSARY, reading: READING, ranks: RANKS,
    dialogues: HE_DIALOGUES, readings: HE_READINGS, texts: BH_TEXTS, need: 1100,
    apply: [{ id: "conv", label: "Conversation", blurb: "Five scenarios, graded turn by turn", min: 12 }, { id: "listen", label: "Dictation", blurb: "Hear it, write it", min: 8 }, { id: "write", label: "Writing", blurb: "Translate into Hebrew", min: 8 }, { id: "log", label: "Immersion log", blurb: "Log native input and output", min: 0 }]
  });
})();
