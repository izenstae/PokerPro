/* ============================================================
   HEBREW: grammar tables, dialogues, readers, and the Biblical track
   ============================================================ */

/* nouns: [singular, plural, gender, meaning] */
var HE_NOUNS = {
  name: "Plurals and gender", cols: ["singular", "plural", "gender", "meaning"], ask: [1, 2], given: 0, gloss: 3, target: 8,
  q: "{w} ({g}): give the <b>{form}</b>.",
  rule: { 1: "Masculine plural usually -ִים (-im), feminine plural usually -וֹת (-ot). Many common nouns break the pattern: שֻׁלְחָן → שֻׁלְחָנוֹת (m. with -ot), מִלָּה → מִלִּים (f. with -im). Learn the plural with the word.", 2: "Feminine nouns mostly end in -ָה or -ת. Paired body parts are feminine (יָד, רֶגֶל, עַיִן). Gender decides the adjective and the verb." },
  choice: true,
  rows: [["סֵפֶר", "סְפָרִים", "m", "book"], ["יֶלֶד", "יְלָדִים", "m", "boy"], ["יַלְדָּה", "יְלָדוֹת", "f", "girl"], ["שֻׁלְחָן", "שֻׁלְחָנוֹת", "m", "table"], ["מִלָּה", "מִלִּים", "f", "word"], ["אִישׁ", "אֲנָשִׁים", "m", "man"],
    ["אִשָּׁה", "נָשִׁים", "f", "woman"], ["בַּיִת", "בָּתִּים", "m", "house"], ["עִיר", "עָרִים", "f", "city"], ["יוֹם", "יָמִים", "m", "day"], ["שָׁנָה", "שָׁנִים", "f", "year"], ["שָׁבוּעַ", "שָׁבוּעוֹת", "m", "week"],
    ["כִּסֵּא", "כִּסְאוֹת", "m", "chair"], ["חַלּוֹן", "חַלּוֹנוֹת", "m", "window"], ["דֶּלֶת", "דְּלָתוֹת", "f", "door"], ["מַפְתֵּחַ", "מַפְתְּחוֹת", "m", "key"], ["יָד", "יָדַיִם", "f", "hand"], ["רֶגֶל", "רַגְלַיִם", "f", "foot"],
    ["עַיִן", "עֵינַיִם", "f", "eye"], ["חָבֵר", "חֲבֵרִים", "m", "friend"], ["מוֹרָה", "מוֹרוֹת", "f", "teacher (f.)"], ["מְכוֹנִית", "מְכוֹנִיּוֹת", "f", "car"], ["כֶּלֶב", "כְּלָבִים", "m", "dog"], ["שְׁאֵלָה", "שְׁאֵלוֹת", "f", "question"],
    ["מִשְׂחָק", "מִשְׂחָקִים", "m", "game"], ["קְבוּצָה", "קְבוּצוֹת", "f", "team"], ["אֶרֶץ", "אֲרָצוֹת", "f", "country"], ["שֵׁם", "שֵׁמוֹת", "m", "name"], ["דָּבָר", "דְּבָרִים", "m", "thing"], ["לַיְלָה", "לֵילוֹת", "m", "night"]]
};
/* present tense: [infinitive, m.sg, f.sg, m.pl, f.pl, meaning] */
var HE_PRESENT = {
  name: "Present tense", cols: ["infinitive", "he / I (m.)", "she / I (f.)", "they / we (m.)", "they / we (f.)", "meaning"], ask: [1, 2, 3, 4], given: 0, gloss: 5, target: 9,
  q: "{w} ({g}): give the present form for <b>{form}</b>.",
  rule: { 1: "The present tense is a participle: it agrees in gender and number with the subject, not in person. אֲנִי לוֹמֵד, הוּא לוֹמֵד.", 2: "Feminine singular of pa'al: -ֶת (לוֹמֶדֶת); verbs ending in a guttural take -ַת (יוֹדַעַת); final-he verbs take -ָה (רוֹצָה).", 3: "Masculine plural: -ִים.", 4: "Feminine plural: -וֹת." },
  rows: [["לִלְמֹד", "לוֹמֵד", "לוֹמֶדֶת", "לוֹמְדִים", "לוֹמְדוֹת", "learn"], ["לִכְתֹּב", "כּוֹתֵב", "כּוֹתֶבֶת", "כּוֹתְבִים", "כּוֹתְבוֹת", "write"], ["לֶאֱכֹל", "אוֹכֵל", "אוֹכֶלֶת", "אוֹכְלִים", "אוֹכְלוֹת", "eat"],
    ["לָדַעַת", "יוֹדֵעַ", "יוֹדַעַת", "יוֹדְעִים", "יוֹדְעוֹת", "know"], ["לִשְׁמֹעַ", "שׁוֹמֵעַ", "שׁוֹמַעַת", "שׁוֹמְעִים", "שׁוֹמְעוֹת", "hear"], ["לִרְצוֹת", "רוֹצֶה", "רוֹצָה", "רוֹצִים", "רוֹצוֹת", "want"],
    ["לִרְאוֹת", "רוֹאֶה", "רוֹאָה", "רוֹאִים", "רוֹאוֹת", "see"], ["לִקְנוֹת", "קוֹנֶה", "קוֹנָה", "קוֹנִים", "קוֹנוֹת", "buy"], ["לָגוּר", "גָּר", "גָּרָה", "גָּרִים", "גָּרוֹת", "live"],
    ["לָבוֹא", "בָּא", "בָּאָה", "בָּאִים", "בָּאוֹת", "come"], ["לָקוּם", "קָם", "קָמָה", "קָמִים", "קָמוֹת", "get up"], ["לְדַבֵּר", "מְדַבֵּר", "מְדַבֶּרֶת", "מְדַבְּרִים", "מְדַבְּרוֹת", "speak"],
    ["לְשַׂחֵק", "מְשַׂחֵק", "מְשַׂחֶקֶת", "מְשַׂחֲקִים", "מְשַׂחֲקוֹת", "play"], ["לְבַשֵּׁל", "מְבַשֵּׁל", "מְבַשֶּׁלֶת", "מְבַשְּׁלִים", "מְבַשְּׁלוֹת", "cook"], ["לְהָבִין", "מֵבִין", "מְבִינָה", "מְבִינִים", "מְבִינוֹת", "understand"],
    ["לְהַתְחִיל", "מַתְחִיל", "מַתְחִילָה", "מַתְחִילִים", "מַתְחִילוֹת", "begin"], ["לְהַרְגִּישׁ", "מַרְגִּישׁ", "מַרְגִּישָׁה", "מַרְגִּישִׁים", "מַרְגִּישׁוֹת", "feel"], ["לְהִתְאַמֵּן", "מִתְאַמֵּן", "מִתְאַמֶּנֶת", "מִתְאַמְּנִים", "מִתְאַמְּנוֹת", "train"],
    ["לְהִתְלַבֵּשׁ", "מִתְלַבֵּשׁ", "מִתְלַבֶּשֶׁת", "מִתְלַבְּשִׁים", "מִתְלַבְּשׁוֹת", "get dressed"], ["לָלֶכֶת", "הוֹלֵךְ", "הוֹלֶכֶת", "הוֹלְכִים", "הוֹלְכוֹת", "go"], ["לַעֲבֹד", "עוֹבֵד", "עוֹבֶדֶת", "עוֹבְדִים", "עוֹבְדוֹת", "work"],
    ["לִישֹׁן", "יָשֵׁן", "יְשֵׁנָה", "יְשֵׁנִים", "יְשֵׁנוֹת", "sleep"], ["לֶאֱהֹב", "אוֹהֵב", "אוֹהֶבֶת", "אוֹהֲבִים", "אוֹהֲבוֹת", "love"], ["לַעֲשׂוֹת", "עוֹשֶׂה", "עוֹשָׂה", "עוֹשִׂים", "עוֹשׂוֹת", "do"]]
};
/* past tense of pa'al: [infinitive, I, you (m.), he, she, we, they, meaning] */
var HE_PAST = {
  name: "Past tense", cols: ["infinitive", "I (אֲנִי)", "you (אַתָּה)", "he (הוּא)", "she (הִיא)", "we (אֲנַחְנוּ)", "they (הֵם)", "meaning"], ask: [1, 2, 3, 4, 5, 6], given: 0, gloss: 7, target: 10,
  q: "{w} ({g}): give the past tense for <b>{form}</b>.",
  rule: { 1: "Past tense marks the person with a suffix: -תִּי (I), -תָּ (you m.), -תְּ (you f.), nothing (he), -ָה (she), -נוּ (we), -תֶּם (you pl.), -וּ (they). The pronoun can be dropped.", 2: "", 3: "The he-form is the dictionary base: three root letters with a-a vowels in pa'al (לָמַד), i-e in pi'el (דִּבֵּר), hi-i in hif'il (הִתְחִיל).", 4: "She: -ָה, and the second vowel shortens: לָמְדָה (lamda).", 5: "", 6: "They: -וּ, same shortening: לָמְדוּ (lamdu)." },
  rows: [["לִלְמֹד", "לָמַדְתִּי", "לָמַדְתָּ", "לָמַד", "לָמְדָה", "לָמַדְנוּ", "לָמְדוּ", "learn"], ["לִכְתֹּב", "כָּתַבְתִּי", "כָּתַבְתָּ", "כָּתַב", "כָּתְבָה", "כָּתַבְנוּ", "כָּתְבוּ", "write"],
    ["לֶאֱכֹל", "אָכַלְתִּי", "אָכַלְתָּ", "אָכַל", "אָכְלָה", "אָכַלְנוּ", "אָכְלוּ", "eat"], ["לִשְׁמֹעַ", "שָׁמַעְתִּי", "שָׁמַעְתָּ", "שָׁמַע", "שָׁמְעָה", "שָׁמַעְנוּ", "שָׁמְעוּ", "hear"],
    ["לָלֶכֶת", "הָלַכְתִּי", "הָלַכְתָּ", "הָלַךְ", "הָלְכָה", "הָלַכְנוּ", "הָלְכוּ", "go"], ["לִרְאוֹת", "רָאִיתִי", "רָאִיתָ", "רָאָה", "רָאֲתָה", "רָאִינוּ", "רָאוּ", "see"],
    ["לִרְצוֹת", "רָצִיתִי", "רָצִיתָ", "רָצָה", "רָצְתָה", "רָצִינוּ", "רָצוּ", "want"], ["לָגוּר", "גַּרְתִּי", "גַּרְתָּ", "גָּר", "גָּרָה", "גַּרְנוּ", "גָּרוּ", "live"],
    ["לָבוֹא", "בָּאתִי", "בָּאתָ", "בָּא", "בָּאָה", "בָּאנוּ", "בָּאוּ", "come"], ["לָקוּם", "קַמְתִּי", "קַמְתָּ", "קָם", "קָמָה", "קַמְנוּ", "קָמוּ", "get up"],
    ["לְדַבֵּר", "דִּבַּרְתִּי", "דִּבַּרְתָּ", "דִּבֵּר", "דִּבְּרָה", "דִּבַּרְנוּ", "דִּבְּרוּ", "speak"], ["לְשַׂחֵק", "שִׂחַקְתִּי", "שִׂחַקְתָּ", "שִׂחֵק", "שִׂחֲקָה", "שִׂחַקְנוּ", "שִׂחֲקוּ", "play"],
    ["לְהַתְחִיל", "הִתְחַלְתִּי", "הִתְחַלְתָּ", "הִתְחִיל", "הִתְחִילָה", "הִתְחַלְנוּ", "הִתְחִילוּ", "begin"], ["לְהַרְגִּישׁ", "הִרְגַּשְׁתִּי", "הִרְגַּשְׁתָּ", "הִרְגִּישׁ", "הִרְגִּישָׁה", "הִרְגַּשְׁנוּ", "הִרְגִּישׁוּ", "feel"],
    ["לְהִתְאַמֵּן", "הִתְאַמַּנְתִּי", "הִתְאַמַּנְתָּ", "הִתְאַמֵּן", "הִתְאַמְּנָה", "הִתְאַמַּנּוּ", "הִתְאַמְּנוּ", "train"], ["לִהְיוֹת", "הָיִיתִי", "הָיִיתָ", "הָיָה", "הָיְתָה", "הָיִינוּ", "הָיוּ", "be"],
    ["לָדַעַת", "יָדַעְתִּי", "יָדַעְתָּ", "יָדַע", "יָדְעָה", "יָדַעְנוּ", "יָדְעוּ", "know"], ["לַעֲבֹד", "עָבַדְתִּי", "עָבַדְתָּ", "עָבַד", "עָבְדָה", "עָבַדְנוּ", "עָבְדוּ", "work"]]
};
/* future tense: [infinitive, I, you (m.), he, she, we, they, meaning] */
var HE_FUTURE = {
  name: "Future tense", cols: ["infinitive", "I (אֲנִי)", "you (אַתָּה)", "he (הוּא)", "she (הִיא)", "we (אֲנַחְנוּ)", "they (הֵם)", "meaning"], ask: [1, 2, 3, 4, 5, 6], given: 0, gloss: 7, target: 10,
  q: "{w} ({g}): give the future tense for <b>{form}</b>.",
  rule: { 1: "Future marks the person with a prefix: אֶ- (I), תִּ- (you m. / she), יִ- (he), נִ- (we), תִּ...וּ (you pl.), יִ...וּ (they). The same prefixes serve every binyan; only the vowels change.", 2: "You (m.) and she share the form תִּלְמַד; context tells them apart.", 3: "", 4: "", 5: "", 6: "They: יִ...וּ." },
  rows: [["לִלְמֹד", "אֶלְמַד", "תִּלְמַד", "יִלְמַד", "תִּלְמַד", "נִלְמַד", "יִלְמְדוּ", "learn"], ["לִכְתֹּב", "אֶכְתֹּב", "תִּכְתֹּב", "יִכְתֹּב", "תִּכְתֹּב", "נִכְתֹּב", "יִכְתְּבוּ", "write"],
    ["לִשְׁמֹר", "אֶשְׁמֹר", "תִּשְׁמֹר", "יִשְׁמֹר", "תִּשְׁמֹר", "נִשְׁמֹר", "יִשְׁמְרוּ", "guard / keep"], ["לִגְמֹר", "אֶגְמֹר", "תִּגְמֹר", "יִגְמֹר", "תִּגְמֹר", "נִגְמֹר", "יִגְמְרוּ", "finish"],
    ["לֶאֱכֹל", "אֹכַל", "תֹּאכַל", "יֹאכַל", "תֹּאכַל", "נֹאכַל", "יֹאכְלוּ", "eat"], ["לָלֶכֶת", "אֵלֵךְ", "תֵּלֵךְ", "יֵלֵךְ", "תֵּלֵךְ", "נֵלֵךְ", "יֵלְכוּ", "go"],
    ["לִרְאוֹת", "אֶרְאֶה", "תִּרְאֶה", "יִרְאֶה", "תִּרְאֶה", "נִרְאֶה", "יִרְאוּ", "see"], ["לָבוֹא", "אָבוֹא", "תָּבוֹא", "יָבוֹא", "תָּבוֹא", "נָבוֹא", "יָבוֹאוּ", "come"],
    ["לָקוּם", "אָקוּם", "תָּקוּם", "יָקוּם", "תָּקוּם", "נָקוּם", "יָקוּמוּ", "get up"], ["לְדַבֵּר", "אֲדַבֵּר", "תְּדַבֵּר", "יְדַבֵּר", "תְּדַבֵּר", "נְדַבֵּר", "יְדַבְּרוּ", "speak"],
    ["לְשַׂחֵק", "אֲשַׂחֵק", "תְּשַׂחֵק", "יְשַׂחֵק", "תְּשַׂחֵק", "נְשַׂחֵק", "יְשַׂחֲקוּ", "play"], ["לְהַתְחִיל", "אַתְחִיל", "תַּתְחִיל", "יַתְחִיל", "תַּתְחִיל", "נַתְחִיל", "יַתְחִילוּ", "begin"],
    ["לְהִתְאַמֵּן", "אֶתְאַמֵּן", "תִּתְאַמֵּן", "יִתְאַמֵּן", "תִּתְאַמֵּן", "נִתְאַמֵּן", "יִתְאַמְּנוּ", "train"], ["לִהְיוֹת", "אֶהְיֶה", "תִּהְיֶה", "יִהְיֶה", "תִּהְיֶה", "נִהְיֶה", "יִהְיוּ", "be"],
    ["לָתֵת", "אֶתֵּן", "תִּתֵּן", "יִתֵּן", "תִּתֵּן", "נִתֵּן", "יִתְּנוּ", "give"], ["לָקַחַת", "אֶקַּח", "תִּקַּח", "יִקַּח", "תִּקַּח", "נִקַּח", "יִקְחוּ", "take"]]
};
/* prepositions with pronoun suffixes: [preposition, me, you (m.), him, her, us, them, meaning] */
var HE_PREP = {
  name: "Prepositions with suffixes", cols: ["preposition", "me", "you (m.)", "him", "her", "us", "them (m.)", "meaning"], ask: [1, 2, 3, 4, 5, 6], given: 0, gloss: 7, target: 8,
  q: "{w} ({g}): the form with <b>{form}</b>.",
  rule: { 1: "A pronoun after a preposition becomes a suffix on it: לְ + אֲנִי = לִי. The suffix set is the same across most prepositions: -ִי, -ְךָ, -וֹ, -ָהּ, -נוּ, -ָם.", 2: "", 3: "", 4: "Her: -ָהּ with a dot (mappiq) in the he.", 5: "", 6: "" },
  rows: [["לְ", "לִי", "לְךָ", "לוֹ", "לָהּ", "לָנוּ", "לָהֶם", "to / for"], ["שֶׁל", "שֶׁלִּי", "שֶׁלְּךָ", "שֶׁלּוֹ", "שֶׁלָּהּ", "שֶׁלָּנוּ", "שֶׁלָּהֶם", "of (possession)"],
    ["אֶת", "אוֹתִי", "אוֹתְךָ", "אוֹתוֹ", "אוֹתָהּ", "אוֹתָנוּ", "אוֹתָם", "(object marker)"], ["עִם", "אִתִּי", "אִתְּךָ", "אִתּוֹ", "אִתָּהּ", "אִתָּנוּ", "אִתָּם", "with"],
    ["בְּ", "בִּי", "בְּךָ", "בּוֹ", "בָּהּ", "בָּנוּ", "בָּהֶם", "in"], ["עַל", "עָלַי", "עָלֶיךָ", "עָלָיו", "עָלֶיהָ", "עָלֵינוּ", "עֲלֵיהֶם", "on / about"],
    ["אֶל", "אֵלַי", "אֵלֶיךָ", "אֵלָיו", "אֵלֶיהָ", "אֵלֵינוּ", "אֲלֵיהֶם", "to / toward"], ["מִן", "מִמֶּנִּי", "מִמְּךָ", "מִמֶּנּוּ", "מִמֶּנָּה", "מֵאִתָּנוּ", "מֵהֶם", "from"]]
};
/* adjectives: [m.sg, f.sg, m.pl, f.pl, meaning] */
var HE_ADJ = {
  name: "Adjective agreement", cols: ["m. sg.", "f. sg.", "m. pl.", "f. pl.", "meaning"], ask: [1, 2, 3], given: 0, gloss: 4, target: 7,
  q: "{w} ({g}): give the <b>{form}</b> form.",
  rule: { 1: "Feminine: usually add -ָה. Adjectives in -ֶה take -ָה replacing the e (יָפֶה → יָפָה).", 2: "Masculine plural -ִים; the first vowel often shortens (גָּדוֹל → גְּדוֹלִים).", 3: "Feminine plural -וֹת. The adjective follows the noun and agrees with it, and takes הַ- if the noun has it: הַבַּיִת הַגָּדוֹל." },
  rows: [["גָּדוֹל", "גְּדוֹלָה", "גְּדוֹלִים", "גְּדוֹלוֹת", "big"], ["קָטָן", "קְטַנָּה", "קְטַנִּים", "קְטַנּוֹת", "small"], ["חָדָשׁ", "חֲדָשָׁה", "חֲדָשִׁים", "חֲדָשׁוֹת", "new"], ["יָשָׁן", "יְשָׁנָה", "יְשָׁנִים", "יְשָׁנוֹת", "old (thing)"],
    ["טוֹב", "טוֹבָה", "טוֹבִים", "טוֹבוֹת", "good"], ["יָפֶה", "יָפָה", "יָפִים", "יָפוֹת", "beautiful"], ["אָדֹם", "אֲדֻמָּה", "אֲדֻמִּים", "אֲדֻמּוֹת", "red"], ["אָרֹךְ", "אֲרֻכָּה", "אֲרֻכִּים", "אֲרֻכּוֹת", "long"],
    ["קָצָר", "קְצָרָה", "קְצָרִים", "קְצָרוֹת", "short"], ["חַם", "חַמָּה", "חַמִּים", "חַמּוֹת", "hot"], ["קַר", "קָרָה", "קָרִים", "קָרוֹת", "cold"], ["מָהִיר", "מְהִירָה", "מְהִירִים", "מְהִירוֹת", "fast"],
    ["זוֹל", "זוֹלָה", "זוֹלִים", "זוֹלוֹת", "cheap"], ["יָקָר", "יְקָרָה", "יְקָרִים", "יְקָרוֹת", "expensive / dear"], ["עָיֵף", "עֲיֵפָה", "עֲיֵפִים", "עֲיֵפוֹת", "tired"], ["שָׂמֵחַ", "שְׂמֵחָה", "שְׂמֵחִים", "שְׂמֵחוֹת", "happy"],
    ["יִשְׂרְאֵלִי", "יִשְׂרְאֵלִית", "יִשְׂרְאֵלִים", "יִשְׂרְאֵלִיּוֹת", "Israeli"], ["קַל", "קַלָּה", "קַלִּים", "קַלּוֹת", "easy"], ["חָשׁוּב", "חֲשׁוּבָה", "חֲשׁוּבִים", "חֲשׁוּבוֹת", "important"], ["לָבָן", "לְבָנָה", "לְבָנִים", "לְבָנוֹת", "white"]]
};
/* construct state (smichut): [first noun, second noun, construct phrase, meaning] */
var HE_SMICHUT = {
  name: "Construct state", cols: ["noun", "+ noun", "construct phrase", "meaning"], ask: [2], given: 0, gloss: 3, target: 9,
  q: "{w} + {g}: build the construct phrase (\"X of Y\").",
  rule: { 2: "Two nouns joined as \"X of Y\": the first loses its definiteness and often changes shape (-ָה → -ַת, -ִים → -ֵי), and only the second takes הַ-: בֵּית הַסֵּפֶר. Stress and vowels shorten on the first word." },
  rows: [["בַּיִת", "סֵפֶר", "בֵּית סֵפֶר", "school (house of book)"], ["אֲרוּחָה", "בֹּקֶר", "אֲרוּחַת בֹּקֶר", "breakfast"], ["שִׁעוּרִים", "בַּיִת", "שִׁעוּרֵי בַּיִת", "homework"], ["מֶזֶג", "אֲוִיר", "מֶזֶג אֲוִיר", "weather"],
    ["בַּיִת", "חוֹלִים", "בֵּית חוֹלִים", "hospital"], ["כְּאֵב", "רֹאשׁ", "כְּאֵב רֹאשׁ", "headache"], ["חֻלְצָה", "הוֹקִי", "חֻלְצַת הוֹקִי", "hockey jersey"], ["תַּחֲנָה", "אוֹטוֹבּוּס", "תַּחֲנַת אוֹטוֹבּוּס", "bus stop"],
    ["יוֹם", "הֻלֶּדֶת", "יוֹם הֻלֶּדֶת", "birthday"], ["שֵׁם", "מִשְׁפָּחָה", "שֵׁם מִשְׁפָּחָה", "surname"], ["כַּרְטִיס", "אַשְׁרַאי", "כַּרְטִיס אַשְׁרַאי", "credit card"], ["סֵפֶר", "תּוֹרָה", "סֵפֶר תּוֹרָה", "Torah scroll"]]
};
/* yes/no questions, negation, and the definite article: [sentence with ha-, without, gloss] */
var HE_DEF = [
  ["סֵפֶר", "הַסֵּפֶר", "book / the book"], ["יֶלֶד", "הַיֶּלֶד", "boy / the boy"], ["עִיר", "הָעִיר", "city / the city"], ["אִישׁ", "הָאִישׁ", "man / the man"], ["חָבֵר", "הֶחָבֵר", "friend / the friend"], ["הַר", "הָהָר", "mountain / the mountain"],
  ["בַּיִת גָּדוֹל", "הַבַּיִת הַגָּדוֹל", "a big house / the big house"], ["מוֹרָה טוֹבָה", "הַמּוֹרָה הַטּוֹבָה", "a good teacher / the good teacher"]
];
/* word order and the object marker: [sentence without את, with את, gloss] */
var HE_ET = [
  ["אֲנִי רוֹאֶה סֵפֶר.", "אֲנִי רוֹאֶה אֶת הַסֵּפֶר.", "I see a book / I see the book."], ["הִיא קוֹרֵאת עִתּוֹן.", "הִיא קוֹרֵאת אֶת הָעִתּוֹן.", "She reads a newspaper / the newspaper."],
  ["אֲנַחְנוּ אוֹהֲבִים מוּזִיקָה.", "אֲנַחְנוּ אוֹהֲבִים אֶת הַמּוּזִיקָה הַזֹּאת.", "We like music / this music."], ["הוּא פּוֹתֵחַ דֶּלֶת.", "הוּא פּוֹתֵחַ אֶת הַדֶּלֶת.", "He opens a door / the door."],
  ["תֵּן לִי סֵפֶר.", "תֵּן לִי אֶת הַסֵּפֶר.", "Give me a book / the book."], ["אֲנִי לוֹקֵחַ אוֹטוֹבּוּס.", "אֲנִי לוֹקֵחַ אֶת הָאוֹטוֹבּוּס.", "I take a bus / the bus."]
];
/* binyanim: [infinitive, binyan, meaning] */
var HE_BINYAN = {
  name: "Which binyan?", cols: ["verb", "binyan", "meaning"], ask: [1], given: 0, gloss: 2, choice: true, target: 6,
  q: "Which binyan is {w} ({g})?",
  rule: { 1: "Seven patterns (binyanim) carry the same root through different meanings. Pa'al: simple active (לִ-). Pi'el: intensive/causative (לְ-X-ֵ-). Hif'il: causative (לְהַ-). Hitpa'el: reflexive/reciprocal (לְהִתְ-). Nif'al: passive/reflexive (לְהִ-X-ָ-). Pu'al and huf'al: passives of pi'el and hif'il (no infinitive)." },
  rows: [["לִלְמֹד", "pa'al", "learn"], ["לְלַמֵּד", "pi'el", "teach"], ["לְדַבֵּר", "pi'el", "speak"], ["לְהַתְחִיל", "hif'il", "begin"], ["לְהִתְלַבֵּשׁ", "hitpa'el", "get dressed"], ["לְהִכָּנֵס", "nif'al", "enter"],
    ["לִכְתֹּב", "pa'al", "write"], ["לְהַסְבִּיר", "hif'il", "explain"], ["לְהִתְאַמֵּן", "hitpa'el", "train"], ["לְבַשֵּׁל", "pi'el", "cook"], ["לְהִפָּגֵשׁ", "nif'al", "meet (each other)"], ["לְהָבִין", "hif'il", "understand"],
    ["לִשְׁמֹר", "pa'al", "guard"], ["לְסַפֵּר", "pi'el", "tell"], ["לְהַרְגִּישׁ", "hif'il", "feel"], ["לְהִשָּׁאֵר", "nif'al", "stay"], ["לְהִתְרַחֵץ", "hitpa'el", "wash oneself"], ["לְשַׂחֵק", "pi'el", "play"],
    ["לִסְגֹּר", "pa'al", "close"], ["לְהַזְמִין", "hif'il", "order / invite"], ["לְהִתְגַּעְגֵּעַ", "hitpa'el", "miss (someone)"], ["לְהִוָּלֵד", "nif'al", "be born"], ["לְנַצֵּחַ", "pi'el", "win"], ["לִקְנוֹת", "pa'al", "buy"]]
};

/* ---- dialogues ---- */
var HE_DIALOGUES = [
  { id: "he_d1", title: "Hello, who are you?", setting: "A new teammate at the rink. Introduce yourself.", level: "A1",
    turns: [
      { bot: "שָׁלוֹם! קוֹרְאִים לִי נֹעָה. אֵיךְ קוֹרְאִים לְךָ?", botg: "Hi! My name is Noa. What's your name?", expect: ["קוראים לי", "השם שלי", "אני "], model: "שָׁלוֹם! קוֹרְאִים לִי אֶרִיק.", modelg: "Hi! My name is Erik.", hint: "קוראים לי ... (they call me ...)" },
      { bot: "נָעִים מְאוֹד! מֵאֵיפֹה אַתָּה?", botg: "Nice to meet you! Where are you from?", expect: ["אני מ.", "^מ\\S\\S", "מקנדה"], model: "אֲנִי מִקָּנָדָה.", modelg: "I'm from Canada.", hint: "אני מ... (I'm from ...)" },
      { bot: "יָפֶה! אַתָּה גָּר פֹּה עַכְשָׁו?", botg: "Nice! Do you live here now?", expect: ["^כן", "^לא", "אני גר(ה)?"], model: "כֵּן, אֲנִי גָּר פֹּה עַכְשָׁו.", modelg: "Yes, I live here now.", hint: "כן / לא, אני גר ..." },
      { bot: "אַתָּה מְשַׂחֵק הוֹקִי?", botg: "Do you play hockey?", expect: ["כן", "משחק(ת)?"], reject: ["לא"], model: "כֵּן, אֲנִי מְשַׂחֵק הוֹקִי.", modelg: "Yes, I play hockey.", hint: "כן, אני משחק ..." },
      { bot: "מְצֻיָּן! נִתְרָאֶה בָּאִמּוּן. לְהִתְרָאוֹת!", botg: "Excellent! See you at practice. Bye!", expect: ["להתראות", "ביי", "נתראה"], model: "לְהִתְרָאוֹת!", modelg: "See you!", hint: "להתראות / נתראה" }
    ] },
  { id: "he_d2", title: "At the café", setting: "Order a coffee and something to eat.", level: "A1",
    turns: [
      { bot: "שָׁלוֹם, מָה תִּרְצֶה?", botg: "Hello, what would you like?", expect: ["קפה", "תה", "אני רוצה", "בבקשה"], model: "קָפֶה הָפוּךְ, בְּבַקָּשָׁה.", modelg: "A latte, please.", hint: "קפה, בבקשה / אני רוצה ..." },
      { bot: "רוֹצֶה גַּם מַשֶּׁהוּ לֶאֱכֹל?", botg: "Want something to eat too?", expect: ["כן", "לא", "בורקס", "עוגה", "תודה"], model: "כֵּן, בּוּרֶקָס, בְּבַקָּשָׁה.", modelg: "Yes, a burekas, please.", hint: "כן, ... בבקשה / לא, תודה" },
      { bot: "עֶשְׂרִים וּשְׁמוֹנֶה שֶׁקֶל. אַשְׁרַאי אוֹ מְזֻמָּן?", botg: "Twenty-eight shekels. Card or cash?", expect: ["אשראי", "מזומן", "כרטיס"], model: "אַשְׁרַאי, בְּבַקָּשָׁה.", modelg: "Card, please.", hint: "אשראי / מזומן" },
      { bot: "בְּבַקָּשָׁה, בְּתֵאָבוֹן!", botg: "Here you go, enjoy!", expect: ["תודה"], model: "תּוֹדָה רַבָּה!", modelg: "Thanks a lot!", hint: "תודה ..." }
    ] },
  { id: "he_d3", title: "Asking the way", setting: "You are lost in Jerusalem and need the central bus station.", level: "A2",
    turns: [
      { bot: "שָׁלוֹם, אֶפְשָׁר לַעֲזֹר?", botg: "Hello, can I help?", expect: ["איפה", "התחנה", "איך מגיעים", "מחפש"], model: "כֵּן, אֵיפֹה הַתַּחֲנָה הַמֶּרְכָּזִית?", modelg: "Yes, where is the central station?", hint: "איפה ...? / איך מגיעים ל...?" },
      { bot: "לֵךְ יָשָׁר וְתִפְנֶה שְׂמֹאלָה לְיַד הַבַּנְק. הֵבַנְתָּ?", botg: "Go straight and turn left by the bank. Did you get it? (say it back)", expect: ["ישר", "שמאלה", "הבנק"], model: "יָשָׁר, וְשְׂמֹאלָה לְיַד הַבַּנְק.", modelg: "Straight, and left by the bank.", hint: "Repeat: ישר ... שמאלה ..." },
      { bot: "בְּדִיּוּק. זֶה בְּעֵרֶךְ עֶשֶׂר דַּקּוֹת. אַתָּה נוֹסֵעַ לְתֵל אָבִיב?", botg: "Exactly. It's about ten minutes. Are you going to Tel Aviv?", expect: ["כן", "לא", "נוסע", "תל אביב", "חיפה"], model: "כֵּן, אֲנִי נוֹסֵעַ לְתֵל אָבִיב.", modelg: "Yes, I'm going to Tel Aviv.", hint: "כן, אני נוסע ל..." },
      { bot: "בְּהַצְלָחָה! לְהִתְרָאוֹת.", botg: "Good luck! Bye.", expect: ["תודה", "להתראות"], model: "תּוֹדָה רַבָּה! לְהִתְרָאוֹת.", modelg: "Thanks a lot! Bye.", hint: "תודה ... להתראות" }
    ] },
  { id: "he_d4", title: "At the doctor", setting: "You hurt your knee at hockey. Describe it in the past tense.", level: "A2",
    turns: [
      { bot: "שָׁלוֹם, מָה הַבְּעָיָה?", botg: "Hello, what's the problem?", expect: ["כואב(ת)?", "ה?ברך", "פצעתי", "נפלתי"], model: "כּוֹאֶבֶת לִי הַבֶּרֶךְ.", modelg: "My knee hurts.", hint: "כואב לי ה... / פצעתי את ה..." },
      { bot: "מָתַי זֶה קָרָה?", botg: "When did it happen?", expect: ["אתמול", "לפני", "באימון", "במשחק", "ביום"], model: "אֶתְמוֹל, בָּאִמּוּן הוֹקִי.", modelg: "Yesterday, at hockey practice.", hint: "אתמול / לפני ... / באימון" },
      { bot: "אַתָּה יָכוֹל לָלֶכֶת?", botg: "Can you walk?", expect: ["כן", "לא", "קצת", "יכול"], model: "כֵּן, אֲבָל קָשֶׁה.", modelg: "Yes, but it's hard.", hint: "כן / לא / קצת" },
      { bot: "קַח אֶת הַתְּרוּפָה פַּעֲמַיִם בְּיוֹם וְתָנוּחַ שָׁבוּעַ. בְּסֵדֶר?", botg: "Take the medicine twice a day and rest a week. OK?", expect: ["בסדר", "תודה", "כן"], model: "בְּסֵדֶר, תּוֹדָה רַבָּה.", modelg: "OK, thanks a lot.", hint: "בסדר, תודה" }
    ] },
  { id: "he_d5", title: "Talking about the game", setting: "A friend asks about last night's game. Past tense and opinions.", level: "B1",
    turns: [
      { bot: "אֵיךְ הָיָה הַמִּשְׂחָק אֶתְמוֹל?", botg: "How was the game yesterday?", expect: ["ני?צחנו", "הפסדנו", "היה", "תיקו"], model: "נִצַּחְנוּ שָׁלוֹשׁ-שְׁתַּיִם!", modelg: "We won 3–2!", hint: "ניצחנו / הפסדנו / היה ..." },
      { bot: "כָּל הַכָּבוֹד! הִבְקַעְתָּ שַׁעַר?", botg: "Well done! Did you score a goal?", expect: ["כן", "לא", "שער", "הבקעתי", "בי?שול"], model: "הִבְקַעְתִּי שַׁעַר אֶחָד וְנָתַתִּי בִּשּׁוּל.", modelg: "I scored one goal and gave an assist.", hint: "הבקעתי ... / לא, אבל ..." },
      { bot: "מָה הָיָה הֲכִי קָשֶׁה?", botg: "What was the hardest?", expect: ["הכי קשה", "היה", "השליש", "עיי?פים", "מהירים"], model: "הֲכִי קָשֶׁה הָיָה הַשְּׁלִישׁ הָאַחֲרוֹן, הָיִינוּ עֲיֵפִים.", modelg: "The hardest was the last period; we were tired.", hint: "הכי קשה היה ..." },
      { bot: "מָתַי הַמִּשְׂחָק הַבָּא?", botg: "When's the next game?", expect: ["ביום", "בשבוע", "מחר", "הבא"], model: "בְּיוֹם שִׁשִּׁי, מִשְׂחַק חוּץ.", modelg: "On Friday, an away game.", hint: "ביום ... / בשבוע הבא" },
      { bot: "אֲנִי אָבוֹא לִרְאוֹת. בְּהַצְלָחָה!", botg: "I'll come and watch. Good luck!", expect: ["תודה", "סבבה", "יופי"], model: "סַבָּבָּה, תּוֹדָה!", modelg: "Cool, thanks!", hint: "תודה / סבבה" }
    ] }
];

/* ---- graded readers (modern) ---- */
var HE_READINGS = [
  { id: "he_r1", title: "הַמִּשְׁפָּחָה שֶׁלִּי", level: "A1", text: [
      "קוֹרְאִים לִי שָׂרָה וַאֲנִי בַּת עֶשְׂרִים. אֲנִי גָּרָה בְּחֵיפָה עִם הַמִּשְׁפָּחָה שֶׁלִּי. אֲנַחְנוּ חָמֵשׁ: אִמָּא, אַבָּא, אָח, אָחוֹת וַאֲנִי.",
      "הָאָח שֶׁלִּי, יוֹנָתָן, בֶּן עֶשְׂרִים וְשָׁלוֹשׁ. הוּא מְשַׂחֵק הוֹקִי. הָאָחוֹת שֶׁלִּי, לִיאַת, בַּת חֲמֵשׁ עֶשְׂרֵה וְהִיא לוֹמֶדֶת בְּבֵית סֵפֶר. אִמָּא עוֹבֶדֶת בְּבֵית חוֹלִים וְאַבָּא מוֹרֶה.",
      "יֵשׁ לָנוּ גַּם כֶּלֶב. קוֹרְאִים לוֹ מַקְס. הוּא זָקֵן אֲבָל שָׂמֵחַ. בְּשַׁבָּת אֲנַחְנוּ אוֹכְלִים אֲרוּחַת עֶרֶב בְּיַחַד."
    ], gloss: [["בַּת עֶשְׂרִים", "twenty years old (f.)"], ["בֶּן", "aged (m.) / son"], ["בְּיַחַד", "together"]],
    qs: [{ q: "כַּמָּה אֲנָשִׁים בַּמִּשְׁפָּחָה?", options: ["שְׁלוֹשָׁה", "אַרְבָּעָה", "חֲמִשָּׁה", "שִׁשָּׁה"], answer: "חֲמִשָּׁה" }, { q: "מָה אַבָּא עוֹשֶׂה?", options: ["הוּא מוֹרֶה", "הוּא מְשַׂחֵק הוֹקִי", "הוּא עוֹבֵד בְּבֵית חוֹלִים", "הוּא לוֹמֵד"], answer: "הוּא מוֹרֶה" }, { q: "אֵיךְ קוֹרְאִים לַכֶּלֶב?", options: ["יוֹנָתָן", "מַקְס", "לִיאַת", "שָׂרָה"], answer: "מַקְס" }] },
  { id: "he_r2", title: "יוֹם בְּתֵל אָבִיב", level: "A2", text: [
      "אֶתְמוֹל נָסַעְתִּי לְתֵל אָבִיב בָּרַכֶּבֶת. הַנְּסִיעָה לָקְחָה בְּעֵרֶךְ שָׁעָה. הִגַּעְתִּי בְּעֶשֶׂר וְהָלַכְתִּי יָשָׁר לַשּׁוּק, לְשׁוּק הַכַּרְמֶל.",
      "בַּשּׁוּק יֵשׁ הַרְבֵּה אֲנָשִׁים, פֵּרוֹת, יְרָקוֹת וְתַבְלִינִים. שָׁתִיתִי מִיץ רִמּוֹנִים וְאָכַלְתִּי פָלָאפֶל. אַחַר כָּךְ הָלַכְתִּי לַיָּם. הַיָּם הָיָה חַם וְהַשֶּׁמֶשׁ זָרְחָה.",
      "בָּעֶרֶב יָשַׁבְתִּי בְּבֵית קָפֶה בְּרְחוֹב דִּיזֶנְגוֹף וְקָרָאתִי סֵפֶר. בְּתֵשַׁע חָזַרְתִּי הַבַּיְתָה, עָיֵף אֲבָל מְרֻצֶּה."
    ], gloss: [["נְסִיעָה", "journey"], ["הִגַּעְתִּי", "I arrived"], ["שׁוּק", "market"], ["תַּבְלִינִים", "spices"], ["רִמּוֹנִים", "pomegranates"], ["זָרְחָה", "shone"], ["חָזַרְתִּי", "I returned"]],
    qs: [{ q: "אֵיךְ הוּא נָסַע לְתֵל אָבִיב?", options: ["בִּמְכוֹנִית", "בָּרַכֶּבֶת", "בְּאוֹטוֹבּוּס", "בְּמָטוֹס"], answer: "בָּרַכֶּבֶת" }, { q: "מָה הוּא שָׁתָה בַּשּׁוּק?", options: ["קָפֶה", "מַיִם", "מִיץ רִמּוֹנִים", "תֵּה"], answer: "מִיץ רִמּוֹנִים" }, { q: "מָה הוּא עָשָׂה בָּעֶרֶב?", options: ["הָלַךְ לַיָּם", "קָרָא סֵפֶר בְּבֵית קָפֶה", "אָכַל פָלָאפֶל", "יָשַׁן"], answer: "קָרָא סֵפֶר בְּבֵית קָפֶה" }] },
  { id: "he_r3", title: "שַׁבָּת בְּיִשְׂרָאֵל", level: "B1", text: [
      "בְּיִשְׂרָאֵל הַשָּׁבוּעַ מַתְחִיל בְּיוֹם רִאשׁוֹן, וְיוֹם הַמְּנוּחָה הוּא שַׁבָּת. הַשַּׁבָּת מַתְחִילָה בְּיוֹם שִׁשִּׁי בָּעֶרֶב, עִם שְׁקִיעַת הַשֶּׁמֶשׁ, וּמִסְתַּיֶּמֶת בְּמוֹצָאֵי שַׁבָּת.",
      "בְּיוֹם שִׁשִּׁי אַחַר הַצָּהֳרַיִם הָרְחוֹבוֹת מִתְרוֹקְנִים. חֲנֻיּוֹת נִסְגָּרוֹת, הָאוֹטוֹבּוּסִים מַפְסִיקִים לִנְסֹעַ בְּרֹב הֶעָרִים, וּמִשְׁפָּחוֹת מִתְכַּנְּסוֹת לַאֲרוּחַת שַׁבָּת. גַּם מִי שֶׁאֵינוֹ דָּתִי אוֹמֵר \"שַׁבָּת שָׁלוֹם\".",
      "בְּשַׁבָּת עַצְמָהּ יֵשׁ מִי שֶׁהוֹלֵךְ לְבֵית הַכְּנֶסֶת, וְיֵשׁ מִי שֶׁנּוֹסֵעַ לַיָּם אוֹ לְטִיּוּל. בְּמוֹצָאֵי שַׁבָּת הָעִיר מִתְעוֹרֶרֶת שׁוּב, וְהַשָּׁבוּעַ הַחָדָשׁ מַתְחִיל."
    ], gloss: [["מְנוּחָה", "rest"], ["שְׁקִיעָה", "sunset"], ["מִסְתַּיֶּמֶת", "ends"], ["מוֹצָאֵי שַׁבָּת", "Saturday night (the going-out of Shabbat)"], ["מִתְרוֹקְנִים", "empty out"], ["מִתְכַּנְּסוֹת", "gather"], ["דָּתִי", "religious"], ["בֵּית הַכְּנֶסֶת", "synagogue"], ["מִתְעוֹרֶרֶת", "wakes up"]],
    qs: [{ q: "מָתַי מַתְחִילָה הַשַּׁבָּת?", options: ["בְּיוֹם שִׁשִּׁי בַּבֹּקֶר", "בְּיוֹם שִׁשִּׁי בָּעֶרֶב", "בְּשַׁבָּת בַּבֹּקֶר", "בְּיוֹם רִאשׁוֹן"], answer: "בְּיוֹם שִׁשִּׁי בָּעֶרֶב" }, { q: "מָה קוֹרֶה לָאוֹטוֹבּוּסִים בְּשַׁבָּת?", options: ["נוֹסְעִים יוֹתֵר", "מַפְסִיקִים לִנְסֹעַ בְּרֹב הֶעָרִים", "חִנָּם", "נוֹסְעִים רַק בַּלַּיְלָה"], answer: "מַפְסִיקִים לִנְסֹעַ בְּרֹב הֶעָרִים" }, { q: "מָה זֶה מוֹצָאֵי שַׁבָּת?", options: ["יוֹם שִׁשִּׁי", "שַׁבָּת בַּבֹּקֶר", "מוֹצָאֵי שַׁבָּת הוּא הָעֶרֶב אַחֲרֵי הַשַּׁבָּת", "יוֹם רִאשׁוֹן בָּעֶרֶב"], answer: "מוֹצָאֵי שַׁבָּת הוּא הָעֶרֶב אַחֲרֵי הַשַּׁבָּת" }] },
  { id: "he_r4", title: "תְּחִיַּת הַשָּׂפָה הָעִבְרִית", level: "B2", text: [
      "הָעִבְרִית הִיא הַשָּׂפָה הַיְּחִידָה בָּעוֹלָם שֶׁחָזְרָה לִהְיוֹת שְׂפַת אֵם אַחֲרֵי שֶׁבְּמֶשֶׁךְ כְּאַלְפַּיִם שָׁנָה לֹא דִּבְּרוּ אוֹתָהּ בַּיּוֹם־יוֹם. בְּכָל אוֹתָן שָׁנִים הִיא שִׁמְּשָׁה לִתְפִלָּה, לְלִמּוּד וְלִכְתִיבָה, אֲבָל אִישׁ לֹא גָּדַל אִתָּהּ בַּבַּיִת.",
      "בְּסוֹף הַמֵּאָה הַתְּשַׁע־עֶשְׂרֵה הֶחְלִיט אֱלִיעֶזֶר בֶּן־יְהוּדָה שֶׁהַיְּהוּדִים הַחוֹזְרִים לְאֶרֶץ יִשְׂרָאֵל צְרִיכִים שָׂפָה מְשֻׁתֶּפֶת. הוּא חִנֵּךְ אֶת בְּנוֹ, אִיתָמָר, כְּדוֹבֵר הָעִבְרִית הָרִאשׁוֹן בָּעֵת הַחֲדָשָׁה, חִבֵּר מִלּוֹן, וְהִמְצִיא מֵאוֹת מִלִּים לְמֻשָּׂגִים שֶׁלֹּא הָיוּ קַיָּמִים בַּתַּנַ\"ךְ, כְּמוֹ \"גְּלִידָה\" וְ\"עִתּוֹן\".",
      "הַהַצְלָחָה לֹא הָיְתָה מֻבְטַחַת. בָּתֵּי הַסֵּפֶר הָעִבְרִיִּים הָרִאשׁוֹנִים, וְאַחֲרֵיהֶם מִלְחֶמֶת הַשָּׂפוֹת שֶׁל 1913, הִכְרִיעוּ שֶׁהָעִבְרִית, וְלֹא הַגֶּרְמָנִית אוֹ הַיִּידִישׁ, תִּהְיֶה שְׂפַת הַהוֹרָאָה. הַיּוֹם מְדַבְּרִים עִבְרִית כְּתִשְׁעָה מִילְיוֹן אֲנָשִׁים, וְהִיא מַמְשִׁיכָה לְהִשְׁתַּנּוֹת, לִשְׁאֹל מִלִּים מֵאַנְגְּלִית וּמֵעֲרָבִית, וּלְהַמְצִיא חֲדָשׁוֹת."
    ], gloss: [["תְּחִיָּה", "revival"], ["שְׂפַת אֵם", "mother tongue"], ["שִׁמְּשָׁה", "served"], ["תְּפִלָּה", "prayer"], ["מְשֻׁתֶּפֶת", "shared"], ["חִנֵּךְ", "educated / raised"], ["מִלּוֹן", "dictionary"], ["מֻשָּׂגִים", "concepts"], ["מֻבְטַחַת", "guaranteed"], ["הִכְרִיעוּ", "decided (settled)"], ["הוֹרָאָה", "teaching / instruction"], ["לִשְׁאֹל מִלִּים", "to borrow words"]],
    qs: [{ q: "מָה מְיֻחָד בָּעִבְרִית לְפִי הַטֶּקְסְט?", options: ["הִיא הַשָּׂפָה הַקָּשָׁה בְּיוֹתֵר", "הִיא הַשָּׂפָה הַיְּחִידָה שֶׁחָזְרָה לִהְיוֹת שְׂפַת אֵם", "אֵין בָּהּ מִלִּים חֲדָשׁוֹת", "הִיא נִכְתֶּבֶת מִשְּׂמֹאל לְיָמִין"], answer: "הִיא הַשָּׂפָה הַיְּחִידָה שֶׁחָזְרָה לִהְיוֹת שְׂפַת אֵם" }, { q: "מִי הָיָה דּוֹבֵר הָעִבְרִית הָרִאשׁוֹן בָּעֵת הַחֲדָשָׁה?", options: ["אֱלִיעֶזֶר בֶּן־יְהוּדָה", "אִיתָמָר בֶּן־יְהוּדָה", "הֶרְצְל", "אֵין יוֹדְעִים"], answer: "אִיתָמָר בֶּן־יְהוּדָה" }, { q: "מָה הִכְרִיעָה מִלְחֶמֶת הַשָּׂפוֹת?", options: ["שֶׁהַגֶּרְמָנִית תִּהְיֶה שְׂפַת הַהוֹרָאָה", "שֶׁהָעִבְרִית תִּהְיֶה שְׂפַת הַהוֹרָאָה", "שֶׁהַיִּידִישׁ תִּהְיֶה שְׂפַת הַמְּדִינָה", "שֶׁיִּלְמְדוּ בִּשְׁתֵּי שָׂפוֹת"], answer: "שֶׁהָעִבְרִית תִּהְיֶה שְׂפַת הַהוֹרָאָה" }] }
];

var HE_DICTATION = [
  ["קוֹרְאִים לִי דָּנָה וַאֲנִי גָּרָה בְּחֵיפָה.", "A1"], ["כַּמָּה זֶה עוֹלֶה?", "A1"], ["נִתְרָאֶה מָחָר בְּעֶשֶׂר.", "A1"], ["אֲנִי לֹא מֵבִין. אֶפְשָׁר עוֹד פַּעַם?", "A1"],
  ["הָאָח שֶׁלִּי מְשַׂחֵק הוֹקִי בְּיוֹם שִׁשִּׁי.", "A2"], ["אֶתְמוֹל יָרַד גֶּשֶׁם כָּל הַיּוֹם.", "A2"], ["אֶפְשָׁר אֶת הַחֶשְׁבּוֹן, בְּבַקָּשָׁה?", "A2"], ["הָרַכֶּבֶת לְחֵיפָה יוֹצֵאת מֵרָצִיף אַרְבַּע.", "A2"],
  ["אֲנִי גָּר בְּיִשְׂרָאֵל כְּבָר שְׁנָתַיִם.", "B1"], ["אִם יֵרֵד שֶׁלֶג מָחָר, יְבַטְּלוּ אֶת הַמִּשְׂחָק.", "B1"], ["הִיא אָמְרָה שֶׁאֵין לָהּ זְמַן.", "B1"], ["אֲנַחְנוּ צְרִיכִים לְהַחְלִיט לִפְנֵי יוֹם שִׁשִּׁי.", "B1"],
  ["לַמְרוֹת שֶׁהַקְּבוּצָה שִׂחֲקָה טוֹב, הִיא הִפְסִידָה בְּשַׁעַר אֶחָד.", "B2"], ["הַדָּבָר הֲכִי חָשׁוּב הוּא לַעֲצֹר וּלְדַבֵּר עִם אֲנָשִׁים.", "B2"], ["הַמֶּמְשָׁלָה מַצִּיעָה לְהוֹרִיד אֶת הַמִּסִּים בַּשָּׁנָה הַבָּאָה.", "B2"], ["מֵעוֹלָם לֹא חָשַׁבְתִּי שֶׁהַחֹרֶף יִהְיֶה כָּל כָּךְ אָרֹךְ.", "B2"]
];
var HE_WRITING = [
  ["I am tired.", ["אני עייף.", "אני עייפה."], "A1"], ["Where do you live?", ["איפה אתה גר?", "איפה את גרה?"], "A1"], ["I don't understand.", ["אני לא מבין.", "אני לא מבינה."], "A1"], ["We have a dog.", ["יש לנו כלב."], "A1"],
  ["Today I'm playing hockey.", ["היום אני משחק הוקי.", "אני משחק הוקי היום."], "A2"], ["The book is on the table.", ["הספר על השולחן.", "הספר נמצא על השולחן."], "A2"], ["Can you help me?", ["אתה יכול לעזור לי?", "את יכולה לעזור לי?"], "A2"], ["She bought a new car.", ["היא קנתה מכונית חדשה."], "A2"],
  ["I know that he isn't coming.", ["אני יודע שהוא לא בא.", "אני יודעת שהוא לא בא."], "B1"], ["We have lived here for three years.", ["אנחנו גרים פה שלוש שנים.", "אנחנו גרים כאן שלוש שנים.", "אנחנו גרים פה כבר שלוש שנים."], "B1"], ["If it rains, we'll stay home.", ["אם ירד גשם, נישאר בבית.", "אם ירד גשם נישאר בבית."], "B1"], ["Yesterday I was at the rink all day.", ["אתמול הייתי במגרש כל היום.", "אתמול הייתי בחלקה כל היום."], "B1"],
  ["Hebrew is spoken in Israel.", ["בישראל מדברים עברית.", "מדברים עברית בישראל."], "B2"], ["Although we lost, I was proud of the team.", ["למרות שהפסדנו, הייתי גאה בקבוצה.", "למרות שהפסדנו הייתי גאה בקבוצה."], "B2"], ["I would rather train in the morning.", ["אני מעדיף להתאמן בבוקר.", "אני מעדיפה להתאמן בבוקר."], "B2"], ["The game was cancelled because of the weather.", ["המשחק בוטל בגלל מזג האוויר."], "B2"]
];

/* ============================================================
   BIBLICAL HEBREW
   The most frequent words of the Hebrew Bible (the top ~150 cover
   roughly 60% of the running text), the Qal paradigms, and three
   texts read word by word. Row: [word, translit, gloss, pos, forms/notes, example (a verse fragment), example gloss]
   ============================================================ */
var BH_VOCAB = {
  bh_v1: [
    ["וְ", "ve-", "and (prefix)", "conj", "vav, attached to the next word; וַ- with a verb = narrative 'and then'", "וְהָאָרֶץ", "and the earth"],
    ["הַ", "ha-", "the (prefix)", "art", "attached to the noun, usually doubling the next letter", "הַשָּׁמַיִם", "the heavens"],
    ["לְ", "le-", "to / for (prefix)", "prep", "", "לְאוֹר", "for light"],
    ["בְּ", "be-", "in / with (prefix)", "prep", "", "בְּרֵאשִׁית", "in the beginning"],
    ["אֶת", "et", "(marks the definite object)", "part", "not translated", "אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ", "the heavens and the earth (as objects)"],
    ["אֱלֹהִים", "elohim", "God; gods", "n", "plural form, singular meaning when it is God", "בָּרָא אֱלֹהִים", "God created"],
    ["יְהוָה", "YHWH (read Adonai)", "the LORD", "n", "the divine name, read aloud as אֲדֹנָי", "יְהוָה רֹעִי", "the LORD is my shepherd"],
    ["אָמַר", "amar", "he said", "verb", "Qal perfect 3ms; וַיֹּאמֶר = and he said (the most common verb form in the Bible)", "וַיֹּאמֶר אֱלֹהִים", "and God said"],
    ["הָיָה", "haya", "he was / it was", "verb", "וַיְהִי = and it was/came to pass", "וַיְהִי אוֹר", "and there was light"],
    ["עָשָׂה", "asa", "he made / did", "verb", "", "וַיַּעַשׂ אֱלֹהִים", "and God made"],
    ["בּוֹא", "bo", "come / enter", "verb", "וַיָּבֹא = and he came", "וַיָּבֹא", "and he came"],
    ["הָלַךְ", "halach", "he went / walked", "verb", "", "וַיֵּלֶךְ", "and he went"],
    ["רָאָה", "ra'a", "he saw", "verb", "וַיַּרְא = and he saw", "וַיַּרְא אֱלֹהִים אֶת הָאוֹר", "and God saw the light"],
    ["נָתַן", "natan", "he gave", "verb", "", "וַיִּתֵּן", "and he gave"],
    ["יָדַע", "yada", "he knew", "verb", "", "וַיֵּדַע", "and he knew"],
    ["שָׁמַע", "shama", "he heard / obeyed", "verb", "שְׁמַע = hear! (imperative)", "שְׁמַע יִשְׂרָאֵל", "Hear, O Israel"],
    ["דָּבָר", "davar", "word; thing", "n", "דְּבָרִים (pl.)", "דְּבַר יְהוָה", "the word of the LORD"],
    ["אֶרֶץ", "erets", "earth / land", "n", "f.; הָאָרֶץ", "הָאָרֶץ", "the earth"],
    ["שָׁמַיִם", "shamayim", "heavens / sky", "n", "dual form", "הַשָּׁמַיִם", "the heavens"],
    ["יוֹם", "yom", "day", "n", "יָמִים (pl.)", "יוֹם אֶחָד", "day one"],
    ["מֶלֶךְ", "melech", "king", "n", "מְלָכִים (pl.)", "מֶלֶךְ יִשְׂרָאֵל", "king of Israel"],
    ["אִישׁ", "ish", "man; each", "n", "אֲנָשִׁים (pl.)", "הָאִישׁ", "the man"],
    ["בֵּן", "ben", "son", "n", "בָּנִים (pl.); בֶּן־ in construct", "בֶּן־אָדָם", "son of man"],
    ["עַם", "am", "people / nation", "n", "עַמִּים (pl.)", "עַמִּי", "my people"],
    ["בַּיִת", "bayit", "house", "n", "בֵּית־ in construct", "בֵּית יְהוָה", "the house of the LORD"],
    ["אָב", "av", "father", "n", "אָבוֹת (pl.)", "אֲבִי", "my father"],
    ["יָד", "yad", "hand; power", "n", "f.", "בְּיַד", "by the hand of"],
    ["לֵב", "lev", "heart; mind", "n", "לֵבָב also", "בְּכָל־לְבָבְךָ", "with all your heart"],
    ["כֹּל", "kol", "all / every", "n", "כָּל־ in construct", "כָּל־הָאָרֶץ", "all the earth"],
    ["לֹא", "lo", "not", "adv", "", "לֹא אֶחְסָר", "I shall not lack"]
  ],
  bh_v2: [
    ["אֲשֶׁר", "asher", "who / which / that", "rel", "the relative particle", "אֲשֶׁר בָּרָא", "which he created"],
    ["כִּי", "ki", "for / because / that / when", "conj", "", "כִּי־טוֹב", "that it was good"],
    ["עַל", "al", "on / over / against", "prep", "", "עַל־פְּנֵי", "upon the face of"],
    ["אֶל", "el", "to / toward", "prep", "", "אֶל־הָאָרֶץ", "to the land"],
    ["מִן", "min", "from / out of", "prep", "מִ- attached", "מִן־הָאָרֶץ", "from the earth"],
    ["עִם", "im", "with", "prep", "", "עִמָּנוּ", "with us"],
    ["אַתָּה", "ata", "you (m.)", "pron", "", "אַתָּה עִמָּדִי", "you are with me"],
    ["אָנֹכִי", "anochi", "I", "pron", "also אֲנִי", "אָנֹכִי יְהוָה", "I am the LORD"],
    ["הוּא", "hu", "he / it; that", "pron", "", "הוּא", "he"],
    ["זֶה", "ze", "this", "pron", "זֹאת (f.)", "הַיּוֹם הַזֶּה", "this day"],
    ["טוֹב", "tov", "good", "adj", "", "כִּי־טוֹב", "that it was good"],
    ["גָּדוֹל", "gadol", "great / big", "adj", "", "הַמָּאוֹר הַגָּדֹל", "the great light"],
    ["רַב", "rav", "many / much / great", "adj", "", "רַב", "much"],
    ["קָדוֹשׁ", "kadosh", "holy", "adj", "", "קָדוֹשׁ קָדוֹשׁ קָדוֹשׁ", "holy, holy, holy"],
    ["אֶחָד", "echad", "one", "num", "אַחַת (f.)", "יְהוָה אֶחָד", "the LORD is one"],
    ["שֵׁם", "shem", "name", "n", "", "שֵׁם יְהוָה", "the name of the LORD"],
    ["עִיר", "ir", "city", "n", "f.; עָרִים (pl.)", "הָעִיר", "the city"],
    ["דֶּרֶךְ", "derech", "way / road", "n", "", "דֶּרֶךְ", "way"],
    ["נֶפֶשׁ", "nefesh", "soul / life / person", "n", "f.", "נַפְשִׁי", "my soul"],
    ["מַיִם", "mayim", "water", "n", "dual form", "עַל־פְּנֵי הַמָּיִם", "over the face of the waters"],
    ["אוֹר", "or", "light", "n", "", "יְהִי אוֹר", "let there be light"],
    ["חֹשֶׁךְ", "choshech", "darkness", "n", "", "וְחֹשֶׁךְ", "and darkness"],
    ["רוּחַ", "ru'ach", "wind / spirit / breath", "n", "f.", "רוּחַ אֱלֹהִים", "the spirit of God"],
    ["פָּנִים", "panim", "face; presence", "n", "פְּנֵי in construct; לִפְנֵי = before", "עַל־פְּנֵי תְהוֹם", "over the face of the deep"],
    ["תּוֹרָה", "tora", "instruction / law", "n", "", "תּוֹרַת יְהוָה", "the law of the LORD"],
    ["מִצְוָה", "mitsva", "commandment", "n", "מִצְוֹת (pl.)", "מִצְוֹתַי", "my commandments"],
    ["בְּרִית", "brit", "covenant", "n", "f.", "בְּרִית עוֹלָם", "an everlasting covenant"],
    ["עוֹלָם", "olam", "forever; eternity; world (later)", "n", "לְעוֹלָם = forever", "לְעוֹלָם", "forever"],
    ["שָׁלוֹם", "shalom", "peace / wholeness", "n", "", "שָׁלוֹם", "peace"],
    ["חֶסֶד", "chesed", "steadfast love / kindness", "n", "", "טוֹב וָחֶסֶד", "goodness and steadfast love"]
  ],
  bh_v3: [
    ["בָּרָא", "bara", "he created", "verb", "only God is its subject", "בְּרֵאשִׁית בָּרָא אֱלֹהִים", "In the beginning God created"],
    ["קָרָא", "kara", "he called / read", "verb", "וַיִּקְרָא = and he called", "וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹם", "and God called the light Day"],
    ["יָשַׁב", "yashav", "he sat / dwelt", "verb", "", "וַיֵּשֶׁב", "and he dwelt"],
    ["יָצָא", "yatsa", "he went out", "verb", "", "וַיֵּצֵא", "and he went out"],
    ["עָלָה", "ala", "he went up", "verb", "", "וַיַּעַל", "and he went up"],
    ["יָרַד", "yarad", "he went down", "verb", "", "וַיֵּרֶד", "and he went down"],
    ["שָׁלַח", "shalach", "he sent", "verb", "", "וַיִּשְׁלַח", "and he sent"],
    ["לָקַח", "lakach", "he took", "verb", "", "וַיִּקַּח", "and he took"],
    ["מָצָא", "matsa", "he found", "verb", "", "וַיִּמְצָא", "and he found"],
    ["אָכַל", "achal", "he ate", "verb", "", "וַיֹּאכַל", "and he ate"],
    ["מוּת", "mut", "die", "verb", "וַיָּמָת = and he died", "מוֹת תָּמוּת", "you shall surely die"],
    ["שׁוּב", "shuv", "return / turn back", "verb", "", "וַיָּשָׁב", "and he returned"],
    ["קוּם", "kum", "arise / stand", "verb", "", "וַיָּקָם", "and he arose"],
    ["שָׁמַר", "shamar", "he kept / guarded", "verb", "", "לִשְׁמֹר", "to keep"],
    ["עָבַד", "avad", "he served / worked", "verb", "עֶבֶד = servant", "לְעָבְדָהּ וּלְשָׁמְרָהּ", "to work it and keep it"],
    ["אָהַב", "ahav", "he loved", "verb", "", "וְאָהַבְתָּ", "and you shall love"],
    ["יָרֵא", "yare", "he feared", "verb", "", "יִרְאַת יְהוָה", "the fear of the LORD"],
    ["בָּנָה", "bana", "he built", "verb", "", "וַיִּבֶן", "and he built"],
    ["כָּתַב", "katav", "he wrote", "verb", "", "וַיִּכְתֹּב", "and he wrote"],
    ["זָכַר", "zachar", "he remembered", "verb", "", "זָכוֹר", "remember!"],
    ["מָקוֹם", "makom", "place", "n", "", "הַמָּקוֹם הַזֶּה", "this place"],
    ["הַר", "har", "mountain", "n", "", "הַר סִינַי", "Mount Sinai"],
    ["שָׂדֶה", "sade", "field", "n", "", "הַשָּׂדֶה", "the field"],
    ["עֵץ", "ets", "tree / wood", "n", "", "עֵץ הַחַיִּים", "the tree of life"],
    ["זֶרַע", "zera", "seed / offspring", "n", "", "זַרְעֲךָ", "your offspring"],
    ["אִשָּׁה", "isha", "woman / wife", "n", "אֵשֶׁת in construct", "הָאִשָּׁה", "the woman"],
    ["נָבִיא", "navi", "prophet", "n", "", "הַנָּבִיא", "the prophet"],
    ["כֹּהֵן", "kohen", "priest", "n", "", "הַכֹּהֵן", "the priest"],
    ["מִשְׁפָּט", "mishpat", "judgment / justice", "n", "", "מִשְׁפָּט וּצְדָקָה", "justice and righteousness"],
    ["צֶדֶק", "tsedek", "righteousness", "n", "צְדָקָה also", "מַעְגְּלֵי־צֶדֶק", "paths of righteousness"]
  ]
};

/* the Qal perfect and imperfect of שׁמר (to keep): the strong-verb paradigm every grammar starts from */
var BH_QAL = {
  name: "Qal perfect and imperfect", cols: ["person", "perfect (he kept...)", "imperfect (he will keep...)", "meaning"], ask: [1, 2], given: 0, gloss: 3, target: 10,
  q: "שׁ-מ-ר (keep), <b>{w}</b>: give the <b>{form}</b>.",
  rule: { 1: "Perfect: completed action, suffixes. 3ms שָׁמַר, 3fs שָׁמְרָה, 2ms שָׁמַרְתָּ, 2fs שָׁמַרְתְּ, 1cs שָׁמַרְתִּי, 3cp שָׁמְרוּ, 2mp שְׁמַרְתֶּם, 2fp שְׁמַרְתֶּן, 1cp שָׁמַרְנוּ.", 2: "Imperfect: incomplete action, prefixes (and some suffixes). 3ms יִשְׁמֹר, 3fs תִּשְׁמֹר, 2ms תִּשְׁמֹר, 2fs תִּשְׁמְרִי, 1cs אֶשְׁמֹר, 3mp יִשְׁמְרוּ, 3fp תִּשְׁמֹרְנָה, 2mp תִּשְׁמְרוּ, 2fp תִּשְׁמֹרְנָה, 1cp נִשְׁמֹר." },
  rows: [["3ms (he)", "שָׁמַר", "יִשְׁמֹר", "he"], ["3fs (she)", "שָׁמְרָה", "תִּשְׁמֹר", "she"], ["2ms (you m.)", "שָׁמַרְתָּ", "תִּשְׁמֹר", "you (m.)"], ["2fs (you f.)", "שָׁמַרְתְּ", "תִּשְׁמְרִי", "you (f.)"],
    ["1cs (I)", "שָׁמַרְתִּי", "אֶשְׁמֹר", "I"], ["3cp (they)", "שָׁמְרוּ", "יִשְׁמְרוּ", "they"], ["2mp (you pl. m.)", "שְׁמַרְתֶּם", "תִּשְׁמְרוּ", "you (m. pl.)"], ["1cp (we)", "שָׁמַרְנוּ", "נִשְׁמֹר", "we"]]
};
/* parsing drill: [form, parse, gloss] */
var BH_PARSE = {
  name: "Parse the verb", cols: ["form", "parsing", "meaning"], ask: [1], given: 0, gloss: 2, choice: true, target: 9,
  q: "Parse <b class='tw'>{w}</b> ({g}).",
  rule: { 1: "Name the binyan, conjugation, person, gender and number. The vav-consecutive (וַיִּ-) turns an imperfect into past narrative: וַיֹּאמֶר = and he said." },
  rows: [["שָׁמַר", "Qal perfect 3ms", "he kept"], ["שָׁמְרוּ", "Qal perfect 3cp", "they kept"], ["שָׁמַרְתִּי", "Qal perfect 1cs", "I kept"], ["יִשְׁמֹר", "Qal imperfect 3ms", "he will keep"],
    ["תִּשְׁמְרוּ", "Qal imperfect 2mp", "you (pl.) will keep"], ["אֶשְׁמֹר", "Qal imperfect 1cs", "I will keep"], ["וַיִּשְׁמֹר", "Qal vav-consecutive imperfect 3ms", "and he kept"], ["שְׁמֹר", "Qal imperative 2ms", "keep!"],
    ["שֹׁמֵר", "Qal participle ms", "keeping / keeper"], ["לִשְׁמֹר", "Qal infinitive construct", "to keep"], ["וַיֹּאמֶר", "Qal vav-consecutive imperfect 3ms", "and he said"], ["וַיְהִי", "Qal vav-consecutive imperfect 3ms", "and it was"],
    ["בָּרָא", "Qal perfect 3ms", "he created"], ["וַיַּרְא", "Qal vav-consecutive imperfect 3ms", "and he saw"], ["אָהַבְתָּ", "Qal perfect 2ms", "you loved"], ["וְאָהַבְתָּ", "Qal vav-consecutive perfect 2ms", "and you shall love"]]
};
/* texts read word by word: words = [[hebrew, gloss], ...] per verse */
var BH_TEXTS = [
  { id: "gen1", title: "Genesis 1:1–5", ref: "בְּרֵאשִׁית א", verses: [
    { v: 1, text: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃", words: [["בְּרֵאשִׁית", "in (the) beginning"], ["בָּרָא", "created"], ["אֱלֹהִים", "God"], ["אֵת", "(object marker)"], ["הַשָּׁמַיִם", "the heavens"], ["וְאֵת", "and (obj.)"], ["הָאָרֶץ", "the earth"]], gloss: "In the beginning God created the heavens and the earth." },
    { v: 2, text: "וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם׃", words: [["וְהָאָרֶץ", "and the earth"], ["הָיְתָה", "was"], ["תֹהוּ וָבֹהוּ", "formless and empty"], ["וְחֹשֶׁךְ", "and darkness"], ["עַל־פְּנֵי", "upon the face of"], ["תְהוֹם", "the deep"], ["וְרוּחַ אֱלֹהִים", "and the spirit of God"], ["מְרַחֶפֶת", "hovering"], ["עַל־פְּנֵי הַמָּיִם", "over the face of the waters"]], gloss: "And the earth was formless and empty, and darkness was over the face of the deep, and the spirit of God was hovering over the face of the waters." },
    { v: 3, text: "וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר׃", words: [["וַיֹּאמֶר", "and he said"], ["אֱלֹהִים", "God"], ["יְהִי", "let there be"], ["אוֹר", "light"], ["וַיְהִי־אוֹר", "and there was light"]], gloss: "And God said, Let there be light; and there was light." },
    { v: 4, text: "וַיַּרְא אֱלֹהִים אֶת־הָאוֹר כִּי־טוֹב וַיַּבְדֵּל אֱלֹהִים בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ׃", words: [["וַיַּרְא", "and he saw"], ["אֶת־הָאוֹר", "the light"], ["כִּי־טוֹב", "that (it was) good"], ["וַיַּבְדֵּל", "and he separated"], ["בֵּין", "between"], ["הָאוֹר", "the light"], ["וּבֵין", "and between"], ["הַחֹשֶׁךְ", "the darkness"]], gloss: "And God saw the light, that it was good; and God separated the light from the darkness." },
    { v: 5, text: "וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹם וְלַחֹשֶׁךְ קָרָא לָיְלָה וַיְהִי־עֶרֶב וַיְהִי־בֹקֶר יוֹם אֶחָד׃", words: [["וַיִּקְרָא", "and he called"], ["לָאוֹר", "to the light"], ["יוֹם", "Day"], ["וְלַחֹשֶׁךְ", "and to the darkness"], ["קָרָא", "he called"], ["לָיְלָה", "Night"], ["וַיְהִי־עֶרֶב", "and there was evening"], ["וַיְהִי־בֹקֶר", "and there was morning"], ["יוֹם אֶחָד", "day one"]], gloss: "And God called the light Day, and the darkness he called Night. And there was evening and there was morning, day one." }
  ] },
  { id: "ps23", title: "Psalm 23:1–4", ref: "תְּהִלִּים כג", verses: [
    { v: 1, text: "מִזְמוֹר לְדָוִד יְהוָה רֹעִי לֹא אֶחְסָר׃", words: [["מִזְמוֹר", "a psalm"], ["לְדָוִד", "of David"], ["יְהוָה", "the LORD"], ["רֹעִי", "(is) my shepherd"], ["לֹא", "not"], ["אֶחְסָר", "I shall lack"]], gloss: "A psalm of David. The LORD is my shepherd; I shall not want." },
    { v: 2, text: "בִּנְאוֹת דֶּשֶׁא יַרְבִּיצֵנִי עַל־מֵי מְנֻחוֹת יְנַהֲלֵנִי׃", words: [["בִּנְאוֹת דֶּשֶׁא", "in pastures of grass"], ["יַרְבִּיצֵנִי", "he makes me lie down"], ["עַל־מֵי מְנֻחוֹת", "beside waters of rest"], ["יְנַהֲלֵנִי", "he leads me"]], gloss: "He makes me lie down in green pastures; he leads me beside still waters." },
    { v: 3, text: "נַפְשִׁי יְשׁוֹבֵב יַנְחֵנִי בְמַעְגְּלֵי־צֶדֶק לְמַעַן שְׁמוֹ׃", words: [["נַפְשִׁי", "my soul"], ["יְשׁוֹבֵב", "he restores"], ["יַנְחֵנִי", "he guides me"], ["בְמַעְגְּלֵי־צֶדֶק", "in paths of righteousness"], ["לְמַעַן שְׁמוֹ", "for the sake of his name"]], gloss: "He restores my soul; he guides me in paths of righteousness for his name's sake." },
    { v: 4, text: "גַּם כִּי־אֵלֵךְ בְּגֵיא צַלְמָוֶת לֹא־אִירָא רָע כִּי־אַתָּה עִמָּדִי שִׁבְטְךָ וּמִשְׁעַנְתֶּךָ הֵמָּה יְנַחֲמֻנִי׃", words: [["גַּם כִּי", "even though"], ["אֵלֵךְ", "I walk"], ["בְּגֵיא צַלְמָוֶת", "in the valley of deep darkness"], ["לֹא־אִירָא", "I will not fear"], ["רָע", "evil"], ["כִּי־אַתָּה", "for you"], ["עִמָּדִי", "(are) with me"], ["שִׁבְטְךָ", "your rod"], ["וּמִשְׁעַנְתֶּךָ", "and your staff"], ["הֵמָּה", "they"], ["יְנַחֲמֻנִי", "comfort me"]], gloss: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me." }
  ] },
  { id: "shema", title: "The Shema, Deuteronomy 6:4–5", ref: "דְּבָרִים ו", verses: [
    { v: 4, text: "שְׁמַע יִשְׂרָאֵל יְהוָה אֱלֹהֵינוּ יְהוָה אֶחָד׃", words: [["שְׁמַע", "hear!"], ["יִשְׂרָאֵל", "Israel"], ["יְהוָה", "the LORD"], ["אֱלֹהֵינוּ", "our God"], ["יְהוָה", "the LORD"], ["אֶחָד", "(is) one"]], gloss: "Hear, O Israel: the LORD our God, the LORD is one." },
    { v: 5, text: "וְאָהַבְתָּ אֵת יְהוָה אֱלֹהֶיךָ בְּכָל־לְבָבְךָ וּבְכָל־נַפְשְׁךָ וּבְכָל־מְאֹדֶךָ׃", words: [["וְאָהַבְתָּ", "and you shall love"], ["אֵת יְהוָה", "the LORD"], ["אֱלֹהֶיךָ", "your God"], ["בְּכָל־לְבָבְךָ", "with all your heart"], ["וּבְכָל־נַפְשְׁךָ", "and with all your soul"], ["וּבְכָל־מְאֹדֶךָ", "and with all your might"]], gloss: "And you shall love the LORD your God with all your heart and with all your soul and with all your might." }
  ] }
];

if (typeof module !== "undefined") module.exports = {
  HE_NOUNS: HE_NOUNS, HE_PRESENT: HE_PRESENT, HE_PAST: HE_PAST, HE_FUTURE: HE_FUTURE, HE_PREP: HE_PREP, HE_ADJ: HE_ADJ, HE_SMICHUT: HE_SMICHUT, HE_DEF: HE_DEF, HE_ET: HE_ET, HE_BINYAN: HE_BINYAN,
  HE_DIALOGUES: HE_DIALOGUES, HE_READINGS: HE_READINGS, HE_DICTATION: HE_DICTATION, HE_WRITING: HE_WRITING, BH_VOCAB: BH_VOCAB, BH_QAL: BH_QAL, BH_PARSE: BH_PARSE, BH_TEXTS: BH_TEXTS
};
