/* ============================================================
   COURSE: layers 0, 2, 3, 4, 5, and the assembly
   ============================================================ */

var LESSONS_0 = [
{
  id: "ladder", mode: "ladder", pass: 8, of: 10,
  title: "The ladder",
  sub: "What beats what",
  gist: "Nine rungs. Rarer is better. That is the entire ranking.",
  blocks: [
    { t:"p", x:"Start here, with nothing assumed. A poker hand is five cards. At the end, whoever holds the best five cards wins the money. Everything else in this course is about predicting that moment or avoiding it." },
    { t:"p", x:"There are exactly nine kinds of hand and they are ranked by one principle: how hard they are to make. You do not need to memorise a list so much as understand that the list is a rarity ordering, and then the list memorises itself." },
    { t:"tbl", head:["Hand","What it is","Roughly how often"], rows:[
      ["Straight flush","Five in a row, all one suit","1 in 30,000"],
      ["Four of a kind","All four of a rank","1 in 4,200"],
      ["Full house","Three of one rank, two of another","1 in 700"],
      ["Flush","Five of one suit","1 in 500"],
      ["Straight","Five in a row, any suits","1 in 250"],
      ["Three of a kind","Three of a rank","1 in 47"],
      ["Two pair","Two of one rank, two of another","1 in 21"],
      ["One pair","Two of a rank","1 in 2.4"],
      ["High card","None of the above","about half the time"]
    ], caption:"Those frequencies are for the best five of seven cards, which is what you will actually be holding. Note how fast it drops. A flush feels enormous and it is, but two pair is nine times more common than a flush and it loses to it." },
    { t:"p", x:"Two details that catch everyone. Ace can be high or low, so A-2-3-4-5 is a straight, the smallest one. And when two players hold the same kind of hand, the higher one wins, then the kicker, which is the highest card left over. Two players with a pair of kings go to the next card." },
    { t:"warn", x:"Suits have no ranking. Spades do not beat hearts. If two players make the same flush, they chop. The only thing a suit does is make a flush possible." },
    { t:"key", x:"Straight flush, quads, full house, flush, straight, trips, two pair, pair, nothing. Rarer wins. You have about ten of these to learn and you will never think about them again." },
    { t:"how", drill:"Hand ladder", ask:"Which hand wins?",
      steps:[
        "You are shown two hands by name, Hand A and Hand B, not as cards. Ignore everything except where each one sits on the ladder.",
        "Run the ladder in your head, worst to best: high card, one pair, two pair, three of a kind, straight, flush, full house, four of a kind, straight flush.",
        "Whichever hand is further up that list wins. Press A or B."
      ],
      tip:"The only thing this drill tests is whether the order is automatic for you. Chant the nine rungs out loud a few times and every one of these becomes instant." }
  ]
},
{
  id: "read", mode: "read", pass: 8, of: 10,
  title: "Reading your hand",
  sub: "Best five of seven",
  gist: "You get two cards. The table gets five. You use any five.",
  blocks: [
    { t:"p", x:"Texas hold'em deals you two private cards. Then five community cards go face up in the middle, shared by everyone. Your hand is the best five card hand you can build from those seven." },
    { t:"p", x:"Any five. Both of your cards, one of them, or neither. This is the single fact beginners get wrong, and it costs them real money in both directions." },
    { t:"ex", title:"Worked example",
      cards:{ hero:["Kh","5c"], board:["Kd","Ks","9h","9c","2d"] },
      steps:[
        "Seven cards: Kh 5c Kd Ks 9h 9c 2d.",
        "Best five: Kh Kd Ks 9h 9c.",
        "Three kings and two nines. That is a full house."
      ],
      punch:"Your five is doing nothing at all. It is not part of your hand, it never was, and every dollar you would pay to protect it is wasted." },
    { t:"ex", title:"Worked example: the trap",
      cards:{ hero:["Ah","2c"], board:["Kd","Qd","Jd","Td","3s"] },
      steps:[
        "The board alone is K Q J T of diamonds and a three.",
        "You hold the ace of hearts, which does not make a diamond flush.",
        "Your best five: K Q J T of diamonds plus the nine... there is no nine. So: the four diamonds plus your ace is not a flush, and K Q J T needs a nine or an ace for a straight.",
        "You have an ace-high straight? No. A-K-Q-J-T requires your ace, giving Broadway, the best straight. You do have it."
      ],
      punch:"You made the nut straight using one card. And notice that anyone holding a single diamond has a flush, which beats you. The board did most of the work and that means it did it for everyone." },
    { t:"warn", x:"When the board itself makes a strong hand, it makes it for the whole table. Five cards on the board that make a straight mean everyone chops. A pair on the board means everyone's two pair is live. Always ask what the board gives away for free." },
    { t:"key", x:"Best five of seven. Your two cards are ingredients, not a hand. If the board is better than what you can build, you play the board and so does everyone else." },
    { t:"how", drill:"Read your hand", ask:"What is your best five card hand?",
      steps:[
        "Treat your two cards and the five board cards as one pool of seven. There is no 'my hand' and 'the board', just seven cards.",
        "Hunt for the best five hiding in that pool by scanning down the ladder from the top: any straight flush, then quads, then a full house, and so on. Stop at the first category you can actually make.",
        "Pick that category. Two of the seven cards will go unused, and they are worth nothing, not 'almost' anything."
      ],
      tip:"Scan two things first: repeated ranks (pairs on the board plus a card in your hand make trips or two pair) and suits (a flush needs five of one suit anywhere in the seven). Those two glances catch most of the strong hands." }
  ]
},
{
  id: "shape", mode: "who", pass: 7, of: 10,
  title: "The shape of a hand",
  sub: "Streets, position, showdown",
  gist: "Four rounds of betting. Acting last is worth more than cards.",
  blocks: [
    { t:"p", x:"Money goes in across four rounds. Two players post forced bets called blinds so there is something to fight over, then the hand unfolds in streets." },
    { t:"tbl", head:["Street","Cards visible","What happens"], rows:[
      ["Preflop","Your 2","Everyone acts once. Most hands end here."],
      ["Flop","Your 2 + 3","The shape of the hand is decided."],
      ["Turn","Your 2 + 4","Bets get big. Draws get expensive."],
      ["River","Your 2 + 5","No more cards. Pure value or pure bluff."]
    ], caption:"On every street you may check, bet, call, raise or fold. The hand ends when everyone but one folds, or at showdown after the river." },
    { t:"p", x:"Position is the order you act in, and it is fixed for the whole hand. Acting last means you have watched everyone else before you decide. In a game of incomplete information, being last is a permanent, structural information advantage, and it is worth more than most of the card advantages you will ever hold." },
    { t:"p", x:"That is not a soft claim about comfort. The player in position sees a strictly larger information set at every decision node. Winrates by seat show it plainly: the same player, same cards, makes several big blinds per hundred more from the button than from early position. Nothing changed except who spoke last." },
    { t:"warn", x:"Beginners play too many hands from bad positions because the cards look nice. The cards are a small part of the equation. A mediocre hand acting last is often better than a good hand acting first." },
    { t:"key", x:"Four streets, and the button acts last on all of them but the first. If you take one strategic habit from this whole layer, make it playing more hands in position and fewer out of it." },
    { t:"how", drill:"Who wins", ask:"Showdown. Who takes it?",
      steps:[
        "Build your best five from your two cards plus the board. Then build the villain's best five from their two cards plus the same board.",
        "Compare on the ladder. If the categories tie, the higher cards inside the category decide it, then the kicker.",
        "Press You, Villain, or Split. Only pick Split when the two best fives are genuinely identical."
      ],
      tip:"When the board itself is strong, four to a straight or a pair showing, both players often lean on it and splits appear. Check what the board hands out for free before you trust your own two cards." }
  ]
}
];

var LESSONS_2 = [
{
  id: "combos", mode: "combos", pass: 4, of: 5,
  title: "Combos, not hands",
  sub: "The unit of range thinking",
  gist: "He does not have AK. There are sixteen ways to have AK.",
  blocks: [
    { t:"p", x:"Here is where most players stall forever, and where your background stops being decoration and starts paying rent." },
    { t:"p", x:"Amateurs say \"he has ace king\". That sentence is a category error. Ace king is not a hand, it is a set of sixteen distinct hands, and the right question is never which hand he has but how many ways he can have each thing, and what proportion of the total that is." },
    { t:"rule", x:"pocket pair   = C(4,2) = 6 combos\nsuited hand   = 4 combos\noffsuit hand  = 12 combos\nany two ranks = 16 combos", note:"That is the whole of it. Every range calculation you will ever do is these four numbers plus subtraction." },
    { t:"p", x:"Now notice what falls out immediately. If his range is QQ+ and AK, that is not \"four hands\". It is 18 combos of pairs against 16 combos of AK, so he holds AK more often than any single pair, and pairs collectively slightly more than AK. Suddenly the range has structure, and the structure is countable." },
    { t:"ex", title:"Worked example",
      facts:[["His range","QQ+, AK"]],
      steps:[
        "QQ = 6, KK = 6, AA = 6. Pairs: 18 combos.",
        "AK = 16 combos (4 suited, 12 offsuit).",
        "Total: 34 combos.",
        "Share that is AK: 16 / 34 = 47%."
      ],
      bar:{ fill:47, tick:null, fillLabel:"AK is 47% of this range", tickLabel:"" },
      punch:"Nearly half the time this monstrous 3bet range is a hand with no pair at all. You knew that as a feeling. Now you know it as 16/34, which is a number you can multiply by things." },
    { t:"warn", x:"Offsuit hands are three times as common as suited ones. When someone says \"he could have the flush draw\", they are quoting a 4 combo event against a 12 combo alternative. Suited hands are rare, which is precisely why they are valuable and why people overweight them." },
    { t:"key", x:"6, 4, 12, 16. Pairs, suited, offsuit, both. Count the pieces, add them up, and divide. Never estimate a range you could have counted." },
    { t:"how", drill:"Combos", ask:"How many combinations exist? (and: how many combos is that range?)",
      steps:[
        "First read what you are being asked about. One card class like AKs, a whole written range like 'QQ+, AK', or a hand after some cards are dead.",
        "Apply the four base counts: a pocket pair is 6, a suited hand is 4, an offsuit hand is 12, and any two ranks together are 16.",
        "For a whole range, count each comma-separated piece on its own and add them up. Never try to eyeball the total. Then enter the number."
      ],
      tip:"'QQ+' means QQ, KK, AA, that is three pairs at 6 each, so 18. 'AK' with no suit note means both suited and offsuit, so 16. Break the range at the commas and the plus signs, count each chunk, sum." }
  ]
},
{
  id: "removal", mode: "combos", pass: 4, of: 5,
  title: "Card removal",
  sub: "Every card you see rewrites his range",
  gist: "You hold an ace. He now has 25% less AK.",
  blocks: [
    { t:"p", x:"His range was defined before the cards came out. But you can see seven cards he cannot have, and each one deletes combos from his range without asking your permission." },
    { t:"p", x:"This is conditional probability with a very small sigma algebra, and it is exact. Not a read, not a tendency. Arithmetic." },
    { t:"ex", title:"Worked example",
      cards:{ hero:["Ah","Qd"], board:["Ac","7s","2d"] },
      steps:[
        "AK starts at 16 combos: 4 aces x 4 kings.",
        "You hold the ace of hearts. The board has the ace of clubs.",
        "Aces left: 2. So AK = 2 x 4 = 8 combos.",
        "His AK is exactly half as likely as it was a moment ago."
      ],
      bar:{ fill:50, tick:null, fillLabel:"8 of 16 AK combos survive", tickLabel:"" },
      punch:"Meanwhile his pocket pairs barely moved. So the composition of his range changed, not just its size, and the hands that got rarer are the ones that beat you." },
    { t:"p", x:"The general rule: seeing a card of rank R kills a quarter of the two-card holdings that need one specific R, half of the ones that need two, and one third of the six combos of pocket RR. It hits the hands that are most specific about that rank hardest, which is usually the top of his range." },
    { t:"tbl", head:["He needs","You hold one","Effect"], rows:[
      ["AK, one ace","the ace of spades","16 -> 12 combos, down 25%"],
      ["AA, both aces","the ace of spades","6 -> 3 combos, down 50%"],
      ["AKs, ace and king same suit","the ace of spades","4 -> 3 combos, down 25%"],
      ["77, neither card","the ace of spades","6 -> 6, no change"]
    ], caption:"Your one card did four different things to four parts of his range. That asymmetry is the whole reason card removal changes decisions rather than just shrinking numbers." },
    { t:"key", x:"Count his range, then delete everything you can see, then recount. The gap between those two numbers is where close decisions get decided." },
    { t:"how", drill:"Card removal", ask:"How many of that hand can he still have?",
      steps:[
        "Start from the full combo count of the hand in question, before any cards are out: AK is 16, AA is 6, AKs is 4.",
        "Look at every card you can see. Your hole cards and every board card are all dead cards for him.",
        "For each dead card of a rank he needs, delete the combos that used it. One ace gone takes AK from 16 to 12 and AA from 6 to 3. Enter the survivors."
      ],
      tip:"The 'before' number is the only thing to have memorised. Then the drill is pure subtraction: how many of the exact cards this hand needs are already visible, and how many combos does each remove." }
  ]
},
{
  id: "blockers", mode: "blocker", pass: 4, of: 5,
  title: "Blockers",
  sub: "The subtle piece",
  gist: "One card in your hand can move a category of his range to zero.",
  blocks: [
    { t:"p", x:"Card removal becomes a weapon the moment you notice it is not uniform. Some cards delete a combo here and there. Some cards delete an entire branch of his strategy." },
    { t:"p", x:"Hold the ace of spades on a three-spade board. His nut flush is not less likely. It is impossible. Not 20% less, not a bit rarer. Zero. You are holding the only card that makes it, so you have complete information about a hand that would otherwise beat everything you own." },
    { t:"ex", title:"Worked example",
      cards:{ hero:["As","7d"] },
      facts:[["Board","Ks 9s 4s 2h"],["His nut flush","needs the ace of spades"]],
      steps:[
        "Nut flush combos normally: As with any of 12 other spades = 12.",
        "You hold the ace of spades.",
        "His nut flush combos: 0."
      ],
      bar:{ fill:0, tick:null, fillLabel:"zero nut flushes available to him", tickLabel:"" },
      punch:"So when you shove here as a bluff, he cannot have the one hand that calls with total confidence. Your seven of diamonds is irrelevant and your ace of spades is worth more than a pair." },
    { t:"p", x:"This flips the naive intuition about which hands make good bluffs. The best bluffing candidate is not the hand with the least equity. It is the hand that removes the most combos from his calling range while having little showdown value of its own. Blockers are why a solver bluffs with hands that look like nothing and gives up with hands that look better." },
    { t:"warn", x:"Blockers cut both ways and beginners only see one edge. Holding the ace of spades also means you cannot be called by worse flushes, and it means his range is now weighted toward the hands you did not block. Removal changes the whole conditional distribution, not just the part you were hoping for." },
    { t:"key", x:"Ask two questions before every bluff: what does my hand remove from his continuing range, and what does it leave behind. If the answer is nothing, pick a different bluff." },
    { t:"how", drill:"Blockers", ask:"How many nut flushes can he have?",
      steps:[
        "The board has three of one suit, so the nut flush is possible. It needs exactly one card: the ace of that suit.",
        "Look at your own two cards. Do you hold the ace of the flush suit?",
        "If you hold it, the answer is 0, he cannot make the nut flush at all. If you do not, he can pair that ace with any of the 12 remaining cards of the suit, so the answer is 12."
      ],
      tip:"This drill has only two possible answers, 0 or 12. The entire task is checking one card in your hand against the suit on the board. That single card being a blocker is why the ace of the flush suit bluffs better than a real pair." }
  ]
},
{
  id: "counting", mode: "beat", pass: 3, of: 5,
  title: "Counting what beats you",
  sub: "Putting layer 2 to work",
  gist: "Not 'am I ahead' but 'against how many of his combos'.",
  blocks: [
    { t:"p", x:"Now everything from this layer collapses into one repeatable procedure, and it replaces the question you have been asking your whole life." },
    { t:"rule", x:"1. Write his range.\n2. Delete every card you can see.\n3. Sort what is left into beats me / loses to me.\n4. Divide.", note:"The output is not a feeling about whether you are good. It is a percentage, and it goes straight into the pot odds comparison from layer 1." },
    { t:"ex", title:"Worked example",
      cards:{ hero:["Ah","Kd"], board:["As","9c","4d"] },
      facts:[["His range","QQ+, AK"]],
      steps:[
        "His range: QQ 6, KK 6, AA 6, AK 16 = 34 combos.",
        "Remove your Ah, Kd and the board's As: AA drops to 1, KK to 3, QQ stays 6, AK to 2 x 3 = 6.",
        "Live combos: 16.",
        "Beating your top pair top kicker: AA (1) and 99 if he had it (he doesn't) and... AK ties (6). So he beats you with 1 combo, ties with 6, loses with 9."
      ],
      bar:{ fill:6, tick:null, fillLabel:"1 of 16 combos beat you", tickLabel:"" },
      punch:"You are good or chopping 94% of the time against the range you gave him. If you were about to fold this to a big bet, you were not making a read, you were making an arithmetic error." },
    { t:"p", x:"Notice what happened. Your own two cards removed five of his eighteen pair combos, including five sixths of the aces. The hand that beat you got rare precisely because you held the cards it needed. That is the payoff of layer 2, and it is why you cannot do this by feel." },
    { t:"key", x:"Every river decision is a counting problem with a small number of combos in it. If you find yourself agonising, you have stopped counting and started imagining." },
    { t:"how", drill:"What beats you", ask:"How many of his combos beat you right now?",
      steps:[
        "You are handed his range and the count of live combos left in it. Work out your own hand first: what is your best five so far.",
        "Sort his range into categories that beat you versus categories that do not. Think in groups, sets, better two pairs, higher top pairs, not one hand at a time.",
        "Count only the combos in the beats-you groups, using the live count that already has your cards and the board removed. Enter that number."
      ],
      tip:"Your own cards quietly remove combos from the very hands that beat you: an ace in your hand is an ace he cannot have. That is why the honest count is almost always kinder than the fear. Count, do not picture the one hand you are scared of." }
  ]
}
];

var LESSONS_3 = [
{
  id: "indiff", mode: "indiff", pass: 4, of: 5,
  title: "The indifference principle",
  sub: "Why equilibrium is a real thing",
  gist: "You bluff at the frequency that makes his decision worthless.",
  blocks: [
    { t:"p", x:"Heads up poker is a two player zero sum game. That is not a metaphor. It means the minimax theorem applies, a Nash equilibrium exists, and the equilibrium strategy has a guarantee attached: play it and you cannot be beaten in the long run by anyone, including someone who knows exactly what you are doing." },
    { t:"p", x:"That guarantee is the whole reason to care. It is not a description of good play. It is a strategy with a worst case bound." },
    { t:"p", x:"The load bearing idea underneath it is indifference. At equilibrium, you choose your frequencies so that your opponent's alternatives are exactly equal in value. When calling and folding earn him the same amount, he has no decision left to get right. He cannot outplay you, because you have removed the thing he would have outplayed you at." },
    { t:"rule", x:"At equilibrium, mix at the frequency that makes\nthe opponent indifferent between his options.", note:"This is why it pins your strategy without needing any read on him. You are not solving for his tendencies. You are solving for the frequency at which his tendencies stop mattering." },
    { t:"p", x:"It also explains a thing that confuses everyone: at equilibrium, your own mixed actions are all worth the same to you too. If you are bluffing 33% of the time with a hand, that hand earns the same whether you bluff it or check it. The mixing is not for your benefit. It is a constraint you accept so that his best response cannot exploit you." },
    { t:"warn", x:"Two caveats that matter and get dropped. The unexploitable guarantee is a heads up, two player result. In a multiway pot the theory is far weaker, and equilibrium play can lose to two opponents who are not colluding but happen to interact badly with you. And the guarantee is about not losing, not about winning: equilibrium beats nobody who is also at equilibrium." },
    { t:"key", x:"Equilibrium is a floor, not a ceiling. It says you cannot be exploited. Layer 5 is about deliberately leaving it to take money from people who cannot punish you for it." },
    { t:"how", drill:"Indifference", ask:"What fraction makes him indifferent? (your bluffs, or his calls)",
      steps:[
        "Read which frequency the question wants. Sometimes it asks how often you should bluff, sometimes how often he should call or defend.",
        "Your bluffing frequency is bet / (bet + pot). His defending frequency is pot / (pot + bet). The two add up to 100%.",
        "Compute the one it asked for from just the pot and the bet, then enter the percent. Notice you needed no read on him at all."
      ],
      tip:"They are one equation seen from two chairs. Work out whichever is easier, subtract from 100, and you have the other for free." }
  ]
},
{
  id: "alpha", mode: "alpha", pass: 4, of: 5,
  title: "Alpha",
  sub: "Your bluffing quota",
  gist: "alpha = bet / (bet + pot). Your bet size writes it for you.",
  blocks: [
    { t:"p", x:"Make the indifference principle concrete. You bet the river. He holds a bluff catcher, a hand that beats your bluffs and loses to your value. What has to be true for him to be indifferent between calling and folding?" },
    { t:"p", x:"Folding earns him zero. Calling earns him the pot plus your bet when you were bluffing, and costs him the call when you were not. Set those equal and solve. The bluff frequency that comes out is called alpha." },
    { t:"rule", x:"alpha = bet / (bet + pot)", note:"The share of your betting range that should be bluffs. Not the share of your hands. The share of the hands you bet." },
    { t:"p", x:"Look closely at that formula. It is identical to the pot odds formula from layer 1. That is not a coincidence and it is worth sitting with: the price you lay him is the frequency you must bluff at. You are not choosing two things. You are choosing one thing twice." },
    { t:"tbl", head:["You bet","alpha","Bluffs per value bet"], rows:[
      ["half pot","33%","1 bluff : 2 value"],
      ["three quarters","43%","3 bluffs : 4 value"],
      ["pot","50%","1 bluff : 1 value"],
      ["twice pot","67%","2 bluffs : 1 value"]
    ], caption:"Bet bigger and you are allowed, in fact required, to bluff more. The bigger bet lays him a worse price, and a worse price means he folds more, and if he folds more you must be bluffing more or he could simply fold everything." },
    { t:"ex", title:"Worked example",
      facts:[["Pot","$100"],["Your river bet","$50"]],
      steps:[
        "alpha = 50 / (50 + 100) = 33%.",
        "So one third of the hands you bet should be bluffs.",
        "If you have 8 value combos, you want 4 bluffs: 4 / 12 = 33%."
      ],
      bar:{ fill:33, tick:null, fillLabel:"33% of the betting range is bluff", tickLabel:"" },
      punch:"Bluff more than that and he calls everything and prints. Bluff less and he folds everything and prints. Hit it and he cannot do anything at all." },
    { t:"key", x:"alpha = bet / (bet + pot). Half pot is a third. Pot is a half. Your bluffs are not a mood, they are a quota you set the instant you chose a size." },
    { t:"how", drill:"Alpha", ask:"What share of this betting range should be bluffs?",
      steps:[
        "You are given the pot and your bet. Alpha is bet / (bet + pot), the exact same formula as the pot-odds price.",
        "Put the bet on top and (bet + pot) on the bottom, divide, enter the percent.",
        "Sanity check against the anchors before you commit: half pot is 33%, pot is 50%, double pot is 67%."
      ],
      tip:"The bigger the bet, the more you are required to bluff. If your answer comes out small for a big bet, you have probably put the pot instead of the bet on top, flip the fraction." }
  ]
},
{
  id: "mdf", mode: "mdf", pass: 4, of: 5,
  title: "Minimum defence frequency",
  sub: "The same equation from the other chair",
  gist: "MDF = pot / (pot + bet). Fold more and his any-two prints.",
  blocks: [
    { t:"p", x:"Now you are the one facing the bet. Ask the mirrored question: how often must you continue so that his bluffs are not automatically profitable?" },
    { t:"p", x:"If he bets and you fold too often, he can bet with every hand he holds, including the worst ones, and profit without ever showing a card. Your defence frequency has to be high enough to kill that." },
    { t:"rule", x:"MDF = pot / (pot + bet)", note:"The share of your range that must continue. Continue means call or raise, not call specifically." },
    { t:"p", x:"And notice: MDF + alpha = 1. They are the same equation seen from the two seats. His bluffing quota and your defending quota are the same number wearing different clothes, which is what you would expect from a zero sum game where one player's constraint is the other's freedom." },
    { t:"tbl", head:["He bets","You must defend","You may fold"], rows:[
      ["a third","75%","25%"],
      ["half pot","67%","33%"],
      ["three quarters","57%","43%"],
      ["pot","50%","50%"],
      ["twice pot","33%","67%"]
    ], caption:"Big bets let you fold a lot. Small bets do not. The player who bets a third of the pot is asking you to defend three quarters of your range, which is why small bets are annoying rather than weak." },
    { t:"warn", x:"MDF is a bound, not a strategy, and it is the most misapplied idea in poker. It answers exactly one question: how much do I defend so that betting any two cards is not free money for him. It does not say those calls are individually profitable. If he never bluffs, MDF is irrelevant and you should fold everything, which is exactly what layer 5 is for." },
    { t:"key", x:"MDF = pot / (pot + bet). Half pot means defend two thirds. And defend does not mean call, it means do not fold." },
    { t:"how", drill:"MDF", ask:"How much of your range must continue?",
      steps:[
        "You are given the pot and his bet. MDF is pot / (pot + bet), which is alpha wearing the other hat.",
        "Put the pot on top this time and (pot + bet) on the bottom. Divide, enter the percent you must not fold.",
        "Anchors to check against: he bets a third, defend 75%; half pot, 67%; pot, 50%; double pot, 33%."
      ],
      tip:"'Continue' means call or raise, not call specifically. And remember MDF is only a bound against a villain who could be bluffing; it is never a reason to keep calling someone who never bluffs, which is the whole of Layer 5." }
  ]
},
{
  id: "sizing", mode: "ratio", pass: 3, of: 5,
  title: "Sizing as mechanism design",
  sub: "Everything is coupled",
  gist: "Your size sets his price, and his price sets your quota.",
  blocks: [
    { t:"p", x:"Here is the shift that makes layer 3 click. Stop thinking of bet size as an expression of how much you like your hand. Think of it as choosing the rules of the subgame you are about to play." },
    { t:"p", x:"You pick a number. That number sets the price he is being offered. His price determines how often he must defend. How often he defends determines how many bluffs you are allowed. So the moment you say fifty dollars, you have written your own bluffing quota, his calling frequency, and the value of the whole node. You are not making a bet. You are designing a mechanism and then living inside it." },
    { t:"rule", x:"bluffs = value x alpha / (1 - alpha)", note:"Given a size and a count of value combos, this is how many bluff combos belong in the range. It is a construction rule, not a guideline." },
    { t:"ex", title:"Worked example",
      facts:[["Pot","$100"],["Value combos","12"]],
      steps:[
        "Bet $50: alpha = 33%, so bluffs = 12 x 0.33/0.67 = 6. Range of 18.",
        "Bet $100: alpha = 50%, so bluffs = 12 x 0.5/0.5 = 12. Range of 24.",
        "Bet $200: alpha = 67%, so bluffs = 12 x 0.67/0.33 = 24. Range of 36."
      ],
      bar:{ fill:67, tick:33, fillLabel:"double pot: 67% bluffs", tickLabel:"half pot: 33% bluffs" },
      punch:"Same 12 value hands, three completely different strategies. If you want to bet big, you had better have found 24 bluffs, and if you cannot find them, you are not allowed the size. This is why solver ranges look strange: the sizing came first and the hands were fitted to it." },
    { t:"p", x:"This is also why you cannot copy one number from a solver and paste it into your game. The size, the bluff count, the value count and the defence frequency form a system. Change one and the others must move. Most players lift the size, keep their old bluff frequency, and hand away the difference." },
    { t:"key", x:"Choose the size, then build the range the size demands. Never build a range and then reach for a size that flatters it." },
    { t:"how", drill:"Bluff ratio", ask:"How many bluff combos belong in this bet?",
      steps:[
        "You are given the pot, your bet, and a count of value combos. First get alpha = bet / (bet + pot).",
        "Then bluffs = value x alpha / (1 - alpha). Multiply your value count by alpha, then divide by (1 - alpha).",
        "Enter the number of bluff combos. You are graded within about 10%, so round the arithmetic."
      ],
      tip:"Skip the algebra with the ratio shortcut: half pot wants 1 bluff for every 2 value, pot wants 1 to 1, double pot wants 2 to 1. Multiply the value count by that ratio and you are inside the tolerance." }
  ]
},
{
  id: "cfrlab", mode: "none", pass: 0, of: 0,
  title: "The CFR lab",
  sub: "Watch an equilibrium appear",
  gist: "Build a solver. It is smaller than you think.",
  blocks: [
    { t:"p", x:"Everything in this layer has been the output of a solver stated as a rule. This lesson is the solver itself, running in this page, on a game small enough to see all of." },
    { t:"p", x:"Kuhn poker: a three card deck, J, Q and K. Each player antes one chip and takes one card. The first player checks or bets one. If he bets, the second folds or calls. If he checks, the second may check it down or bet, and then the first may fold or call. That is the whole game. Twelve information sets, five terminal nodes." },
    { t:"p", x:"It is a toy, and it is also a real poker game with real bluffing, real value betting and a real Nash equilibrium that nobody had to guess. Counterfactual regret minimisation finds it by self play, and the algorithm is about forty lines." },
    { t:"rule", x:"regret(a) += reach(opponent) x [ value(a) - value(current strategy) ]\nstrategy(a) = max(regret(a), 0) / sum of positive regrets", note:"That is CFR. Track how much you wish you had played each action, weighted by how often the opponent's play makes the node happen at all, then play in proportion to positive regret." },
    { t:"lab", kind:"cfr" },
    { t:"p", x:"Run it and watch three things. The game value converges to -1/18, which is the exact known solution to Kuhn poker: the first player loses 0.0555 chips per hand no matter how well he plays, because acting first is a real cost. Exploitability falls toward zero, which is the honest measure of how far the strategy sits from equilibrium. And the strategy table stops moving." },
    { t:"p", x:"Then look at what it learned, because nobody told it any of this. It bets the king. It never bets the queen. And it bluffs the jack, the worst hand in the deck, at some frequency alpha. Then check the ratio: it bets the king exactly three times as often as it bluffs the jack. That is alpha from the last lesson, derived by a machine that has never heard of it, purely from the arithmetic of not wanting to be exploited." },
    { t:"warn", x:"The subtle part, and the part people get wrong when they implement this themselves: the equilibrium is the average strategy over all iterations, not the current one. The current strategy oscillates forever and never converges. Only the running average does. If you build this and it seems not to work, that is almost always why." },
    { t:"key", x:"Every solver you will ever use is this, with a bigger tree and better sampling. Once you have watched regret matching produce a bluffing frequency out of nothing, GTO Wizard stops being an oracle and becomes a lookup table." }
  ]},
{
  id: "leduc", mode: "none", pass: 0, of: 0,
  title: "Leduc: the board arrives",
  sub: "Where removal meets equilibrium",
  gist: "One public card, two streets, and the whole thing gets real.",
  blocks: [
    { t:"p", x:"Kuhn taught you that regret matching finds an equilibrium, and it did it in a game with no board, no second street and no card removal. Every idea in layer 2 was missing from it. Leduc is the smallest game that puts them back." },
    { t:"p", x:"Six cards: two jacks, two queens, two kings. One private card each, then a round of betting at size two. Then one public card, then a round at size four. Maximum two bets per round. Pair the public card and you beat any unpaired hand, otherwise the higher card wins." },
    { t:"tbl", head:["","Kuhn","Leduc","No limit hold'em"], rows:[
      ["Information sets","12","288","around 10^160"],
      ["Streets","1","2","4"],
      ["Public cards","none","1","5"],
      ["Card removal","none","yes","yes"],
      ["Exploitability by brute force","64 strategies","2^144, forget it","no"]
    ], caption:"That middle column is the entire point. It is small enough to solve exactly on your phone and large enough that every structural feature of real poker is present." },
    { t:"p", x:"The exploitability number underneath the lab could no longer be brute forced, so it is computed the way real solvers do it: walk the tree carrying a vector of the opponent's reach probability for each card they might hold. That vector is what makes your information set fully determined at every node, so the best response maximises over an information set rather than cheating by peeking at a single history." },
    { t:"lab", kind:"leduc" },
    { t:"p", x:"Give it a couple of thousand iterations and then read the second table, because that is where Leduc earns its place in this course. The same jack plays completely differently depending on the card in the middle. On a jack it is the effective nuts and the solver traps with it. On a king it is worthless and the solver bluffs with it at a low frequency. Nothing about your card changed. The board changed, so the meaning of your card changed." },
    { t:"p", x:"Card removal shows up here for the first time too, quietly, in the arithmetic. When you hold a king there is only one king left in the deck, so the chance the board pairs your opponent's king, or hands you a king-high board, is not what it would be if you held a jack. The solver never reasons about this. It just plays the tree, and the tree already knows." },
    { t:"warn", x:"Notice the exploitability floor. Kuhn drops under 0.001 in a second. Leduc is still around 0.01 after a few thousand iterations, because vanilla CFR walks all 120 deals through the whole tree every single iteration. This is exactly where the field went next: Monte Carlo CFR samples the tree instead of enumerating it, and abstraction buckets similar hands together. Bowling's 2015 solve of limit hold'em is this algorithm plus a decade of that engineering." },
    { t:"key", x:"Kuhn proves the algorithm works. Leduc proves it survives a board. Everything past here is sampling and abstraction, which is engineering rather than a new idea. Your next build is a river subgame with real ranges, and you already have the range engine for it in layer 2." }
  ]
}
];

var LESSONS_4 = [
{
  id: "tstat", mode: "tstat", pass: 4, of: 5,
  title: "Is your winrate real?",
  sub: "The t-stat on your own results",
  gist: "You already know this test. Run it on yourself.",
  blocks: [
    { t:"p", x:"You have a results graph. It goes up. The question is whether that is evidence of anything, and this is a question you have already been trained to answer, just not about yourself." },
    { t:"p", x:"Poker results are a return series. Winrate is your mean, measured in big blinds per hundred hands. Standard deviation in no limit hold'em runs about 80 to 100 bb/100, and a strong winrate is around 5 bb/100. Sit with that ratio for a second. Your noise is roughly twenty times your signal, every hundred hands." },
    { t:"rule", x:"SE = sd / sqrt(n / 100)\nt  = winrate / SE", note:"Exactly the t-stat you would run on a backtest. n is hands, and everything is per hundred hands so the units cancel." },
    { t:"ex", title:"Worked example",
      facts:[["Winrate","4 bb/100"],["Std deviation","90 bb/100"],["Sample","50,000 hands"]],
      steps:[
        "SE = 90 / sqrt(500) = 90 / 22.4 = 4.02 bb/100.",
        "t = 4 / 4.02 = 1.00.",
        "That is a t-stat of one. On fifty thousand hands."
      ],
      bar:{ fill:25, tick:50, fillLabel:"t = 1.0", tickLabel:"t = 2, the 95% line" },
      punch:"Fifty thousand hands is months of serious play, and it does not distinguish this player from a break even player who ran slightly warm. He will tell you he is a 4 bb/100 winner. He does not know that." },
    { t:"warn", x:"It is worse than the formula suggests. You did not pick this sample at random, you picked it because it looked good, which is selection bias. Your winrate is not stationary across stakes, games and years. And poker returns have fatter tails than the normal that the t-stat assumes. Every one of those pushes the real requirement up, not down." },
    { t:"key", x:"t = winrate x sqrt(n/100) / sd. Run it on your own graph before you believe your own graph." },
    { t:"how", drill:"t-stat", ask:"What is the t statistic on this winrate?",
      steps:[
        "You are given a winrate, a standard deviation, and a sample of hands. First get the standard error: SE = sd / sqrt(n/100). Divide the hand count by 100, then take the square root, then divide sd by that.",
        "Then t = winrate / SE.",
        "Enter t. It is a small number, almost always between 0 and 4. Graded within about 8%."
      ],
      tip:"A t below 2 means the sample cannot tell this player apart from a break-even one who ran warm. On the samples people actually have, the answer is usually near 1, which is the sobering point of the whole lesson." }
  ]
},
{
  id: "sample", mode: "sample", pass: 4, of: 5,
  title: "How much data you need",
  sub: "Invert the t-stat",
  gist: "Around 130k hands to prove a good winrate. Most people have 20k.",
  blocks: [
    { t:"p", x:"Turn the last lesson around. Instead of asking what your sample proves, ask what sample you would need before it proved anything." },
    { t:"rule", x:"n = 100 x (2 x sd / winrate)^2", note:"Hands required for t = 2, roughly 95% confidence that your edge is not zero. Set t to whatever confidence you actually want." },
    { t:"ex", title:"Worked example",
      facts:[["Std deviation","90 bb/100"],["Claimed winrate","5 bb/100"]],
      steps:[
        "n = 100 x (2 x 90 / 5)^2",
        "= 100 x 36^2",
        "= 129,600 hands."
      ],
      bar:{ fill:6.5, tick:null, fillLabel:"129,600 hands on a 2,000,000 scale", tickLabel:"" },
      punch:"And that is for a strong winrate. A 2 bb/100 grinder needs 810,000 hands. A 1 bb/100 edge needs 3.2 million, which is a career, by which time the games have changed and the edge you measured no longer exists." },
    { t:"p", x:"The quadratic is what does the damage. Halving your edge quadruples the sample. This is the same reason a strategy with a 0.3 Sharpe needs a decade of daily data and one with 1.5 needs a year, and it is why nobody sensible evaluates a system on its P&L alone." },
    { t:"p", x:"Which leads somewhere useful rather than despairing. If results cannot tell you whether you are good inside any reasonable horizon, then results are the wrong instrument. You have to evaluate your decisions directly against a benchmark, hand by hand, which is what solvers and database work are for. Process, not P&L. You have heard this before in another context." },
    { t:"key", x:"n scales with the square of the noise to signal ratio. Six figures of hands to prove a good winrate, seven to prove a small one. Almost nobody has the sample they think they have." },
    { t:"how", drill:"Sample size", ask:"How many hands before this winrate is distinguishable from zero?",
      steps:[
        "You are given the standard deviation and the claimed winrate. Work the inside of the formula first: 2 x sd / winrate.",
        "Square that result, then multiply by 100. That is n = 100 x (2 x sd / winrate)^2.",
        "The answer is large, usually six figures or more. Enter it; graded within about 10%."
      ],
      tip:"Halving the winrate quadruples the sample, because the ratio is squared. That single fact is why a small edge needs millions of hands and why results almost never prove anything inside a real horizon." }
  ]
},
{
  id: "ror", mode: "ror", pass: 3, of: 5,
  title: "Risk of ruin",
  sub: "The cost of being early",
  gist: "A winning player with a short roll still goes broke.",
  blocks: [
    { t:"p", x:"Positive expectation is not survival. A player with a genuine edge and an inadequate bankroll busts with probability you can compute, and the computation is unforgiving." },
    { t:"rule", x:"RoR = exp( -2 x winrate x bankroll / sd^2 )", note:"Winrate and sd in bb per 100 hands, bankroll in big blinds. The continuous approximation to a random walk with drift, and close enough for any decision you would actually make." },
    { t:"ex", title:"Worked example",
      facts:[["Winrate","5 bb/100"],["Std deviation","90 bb/100"],["Bankroll","20 buyins = 2,000 bb"]],
      steps:[
        "RoR = exp(-2 x 5 x 2000 / 8100)",
        "= exp(-2.47)",
        "= 8.5%."
      ],
      bar:{ fill:8.5, tick:null, fillLabel:"8.5% chance of ruin", tickLabel:"" },
      punch:"A genuinely good player, properly rolled by the standard advice, busts about one time in twelve. Not from playing badly. From variance, doing exactly what variance does." },
    { t:"p", x:"Now feel the exponent. Take that same player to 40 buyins and ruin drops to 0.7%. Take him to 10 buyins and it climbs to 29%. Ruin is exponential in bankroll and in winrate, and it explodes in the square of the standard deviation. Which means the single highest leverage thing available to you is almost never playing better. It is playing in games with lower variance and higher edge, and having more money behind." },
    { t:"warn", x:"The formula assumes a fixed winrate, a fixed sd, and infinite hands. Real ruin is worse: your winrate is uncertain and might be zero, you tilt after losses, and you move up in stakes exactly when your roll is fat, which resets the clock. Treat the number as an optimistic bound." },
    { t:"key", x:"Ruin falls exponentially with bankroll and edge. Being right is not the same as surviving long enough to collect." },
    { t:"how", drill:"Risk of ruin", ask:"What is the chance you ever go broke?",
      steps:[
        "You are given winrate, standard deviation, and a bankroll. The bankroll line already gives you big blinds (buyins x 100) alongside the buyin count; use the bb figure.",
        "Form the exponent: -2 x winrate x bankroll / sd^2. Everything is in bb per 100 hands.",
        "Take e to that power and multiply by 100 for a percent. Enter it; graded within about 15%."
      ],
      tip:"The whole answer lives in the exponent. A more negative exponent means a tiny risk. Adding bankroll or winrate drives ruin down fast, while more variance, the sd squared on the bottom, drives it up hard." }
  ]
},
{
  id: "kelly", mode: "kelly", pass: 3, of: 5,
  title: "Kelly",
  sub: "Bankroll rules are Kelly with the numbers divided out",
  gist: "f* = edge / variance. Poker just precomputes it for you.",
  blocks: [
    { t:"p", x:"Every bankroll rule you have ever been told is a Kelly criterion with the arithmetic already done and the derivation thrown away. Since you know Kelly, you can skip the folklore and compute the thing directly." },
    { t:"rule", x:"f* = edge / variance", note:"The fraction of the bankroll to expose per unit of time, maximising the expected log of terminal wealth. In poker, per hundred hands, edge is your winrate and variance is sd squared." },
    { t:"ex", title:"Worked example",
      facts:[["Edge","5 bb/100"],["Variance","8,100 bb^2/100"]],
      steps:[
        "f* = 5 / 8100 = 1/1620.",
        "So a hundred hand block should risk about 1/1620 of your roll.",
        "Which means a bankroll of about 1,620 bb, or 16 buyins, is full Kelly for this edge."
      ],
      bar:{ fill:62, tick:null, fillLabel:"full Kelly at roughly 16 buyins", tickLabel:"" },
      punch:"And now you can see where 20 to 40 buyins comes from. It is not a superstition. It is roughly half to quarter Kelly, which is what anyone sane runs when the edge itself is an estimate." },
    { t:"p", x:"The reason nobody plays full Kelly is the same reason nobody runs a book at full Kelly. Full Kelly maximises log growth on the assumption your edge estimate is exact. It is not exact, you established that two lessons ago, and Kelly is brutally asymmetric about overestimation: bet twice the optimal fraction and your growth rate goes to zero, not to double." },
    { t:"p", x:"Half Kelly gives up 25% of the growth rate for roughly half the volatility and a far shorter drawdown. Quarter Kelly gives up 44% of growth and makes the ride survivable by a human being. Since your edge estimate has a standard error the size of the edge, fractional Kelly is not caution. It is the correct answer to a parameter you do not know." },
    { t:"key", x:"f* = edge / variance, then divide by two or four because you do not know your edge. That is the entire theory of bankroll management." },
    { t:"how", drill:"Kelly", ask:"Full Kelly risks what fraction of your roll? Give 1/x, answer x.",
      steps:[
        "You are given the edge and the variance (variance is sd squared, already worked out for you). The Kelly fraction is f = edge / variance.",
        "The drill wants the denominator x, not the fraction. So answer x = variance / edge, that is, 1 divided by f.",
        "Enter that x. Graded within about 10%."
      ],
      tip:"That x, in big blinds, doubles as your full-Kelly bankroll; divide by 100 for buyins. The drill asks for full Kelly, but remember nobody runs full Kelly in practice, half or quarter is the sane number." }
  ]
}
];

var LESSONS_5 = [
{
  id: "bayes", mode: "bayes", pass: 3, of: 5,
  title: "Your cards are evidence",
  sub: "Bayes with blockers",
  gist: "The posterior moves before he does anything.",
  blocks: [
    { t:"p", x:"Layer 5 is about leaving equilibrium on purpose. Before you can do that, you need a posterior over his range, and the first piece of evidence is not something he did. It is your own hand." },
    { t:"p", x:"Combine layer 2 with Bayes and you get something sharper than either. Uniform prior over the combos in his range, condition on the cards you can see, read off the posterior." },
    { t:"ex", title:"Worked example",
      cards:{ hero:["Ah","Ks"] },
      facts:[["His 3bet range","QQ+, AK"],["You hold","AK"]],
      steps:[
        "Prior: 18 pair combos, 16 AK combos, 34 total. P(pair) = 53%.",
        "Your ace and your king remove: AA 6 -> 3, KK 6 -> 3, QQ 6 -> 6, AK 16 -> 9.",
        "Live: 12 pairs, 9 AK, 21 total.",
        "P(pair | he 3bet, your cards) = 12 / 21 = 57%."
      ],
      bar:{ fill:57, tick:53, fillLabel:"posterior: 57% pairs", tickLabel:"prior: 53% pairs" },
      punch:"You hold AK, so he is less likely to hold AK, so he is more likely to hold the pairs that beat you. The hand that made you want to play is the hand that made playing worse. Four points, and it decides marginal spots." },
    { t:"p", x:"This generalises into the habit that separates layer 5 from wishful thinking. Every observation is a likelihood ratio applied to a prior. Your cards are an observation. The board is an observation. His sizing is an observation. None of them are conclusions, and all of them multiply." },
    { t:"key", x:"Count the range, remove your cards, divide. Your own hand is evidence about his, and it usually points the wrong way for you." },
    { t:"how", drill:"Bayes and blockers", ask:"He 3bets. How often does he hold that pair group?",
      steps:[
        "Count his written range two ways: the total combos, and how many of them are the pair group the question asks about.",
        "Now remove your two cards from both counts. Your ace deletes his ace combos, your king deletes his king combos, and so on.",
        "Divide surviving pairs by surviving total and enter the percent. Graded within 3 points."
      ],
      tip:"Holding a card he needs makes that specific hand rarer, so strong blockers usually push the answer toward the hands that beat you, not away from them. The hand that made you want to play is the hand that made playing worse." }
  ]
},
{
  id: "update", mode: "update", pass: 3, of: 5,
  title: "Updating on reads",
  sub: "Equilibrium as your prior",
  gist: "Eight hands is not a read. It is a nudge.",
  blocks: [
    { t:"p", x:"Now the actual Bayesian machinery, and the reason this layer comes last. You need a prior worth having before evidence is worth anything, and equilibrium is that prior. It is what a stranger does when you know nothing at all." },
    { t:"p", x:"Then he plays some hands and you observe. The question is how far to move, and it has a real answer, which is more than most players can say for their reads." },
    { t:"rule", x:"posterior mean = (prior strength x prior rate + observed) / (prior strength + observations)", note:"A Beta prior with a strength in units of hands. Population baseline sets the rate. Strength encodes how much you trust the baseline: 10 for an unknown in a soft game, 50 for a regular in a pool you know cold." },
    { t:"ex", title:"Worked example",
      facts:[["Population baseline","45% fold to cbet"],["Prior strength","20 hands"],["Observed","8 folds in 10"]],
      steps:[
        "Prior: 0.45 x 20 = 9 folds in 20 imagined hands.",
        "Posterior = (9 + 8) / (20 + 10) = 17 / 30",
        "= 57%."
      ],
      bar:{ fill:57, tick:45, fillLabel:"posterior 57%", tickLabel:"prior 45%" },
      punch:"He folded 80% in your sample and you moved him to 57%, not 80%. Ten hands is worth a twelve point move against a twenty hand prior. That is the correct amount of updating and it will feel far too timid, which is the point." },
    { t:"warn", x:"The failure mode is not being too slow. It is one dramatic showdown rewriting the whole model. He shows a bluff, and suddenly he is a maniac. That is a sample of one against a prior of a thousand hands of population data, and it should move you almost nothing. The reason to write the prior down is so that a single vivid hand cannot delete it." },
    { t:"key", x:"Equilibrium is the prior. Reads are evidence with a weight equal to their sample size. Update, do not overwrite." },
    { t:"how", drill:"Updating reads", ask:"What is your posterior estimate of his fold frequency?",
      steps:[
        "You are given a population baseline, a prior strength in hands, and what you observed (folds in some number of chances).",
        "Turn the baseline into imagined folds: baseline percent x prior strength. That is your prior successes.",
        "Posterior = (prior successes + observed folds) / (prior strength + observations). Enter the percent; graded within 2 points."
      ],
      tip:"The answer always lands between the baseline and what you saw, and much closer to the baseline than a small sample feels it should. That is the point: a handful of hands is a nudge, not a rewrite." }
  ]
},
{
  id: "deviate", mode: "deviate", pass: 4, of: 5,
  title: "Leaving equilibrium",
  sub: "Where the money actually is",
  gist: "GTO is unexploitable. It is not maximally profitable.",
  blocks: [
    { t:"p", x:"Here is the thing nobody says clearly enough. Playing perfect equilibrium against a bad player wins less than playing badly against him in the right direction. Equilibrium does not punish mistakes. It just declines to make any." },
    { t:"p", x:"Against an opponent at equilibrium, your bluff catcher is indifferent. Zero. That is what indifference means. Every dollar you have ever won came from the gap between his frequency and the equilibrium frequency, which means your entire job is finding gaps and your equilibrium knowledge is what lets you see them." },
    { t:"rule", x:"1. Compute the equilibrium frequency.\n2. Estimate his actual frequency.\n3. Deviate in the direction of the gap.\n4. Go back to equilibrium when the read is thin.", note:"Step 1 is not optional and this is the point people miss. You cannot spot a deviation without knowing the baseline it deviates from." },
    { t:"ex", title:"Worked example",
      facts:[["Pot","$100"],["He bets","$100"],["Equilibrium bluff rate","50%"],["Your read","he bluffs about 15%"]],
      steps:[
        "Your bluff catcher needs him bluffing 50% to break even.",
        "He bluffs 15%.",
        "Fold. Every bluff catcher, every time, until he changes."
      ],
      bar:{ fill:15, tick:50, fillLabel:"his actual bluff rate 15%", tickLabel:"indifference at 50%" },
      punch:"MDF says defend half your range. MDF is wrong here and knowing why is the whole layer. MDF only protects you against a bet that could be any two cards. His bet cannot be any two cards. He does not bluff. So defending is a rule for a game you are not in." },
    { t:"p", x:"And the cost of deviating is exactly the exposure you take on. Fold every bluff catcher and you are now exploitable by a player who starts bluffing. Against most opponents that is a trade you make gladly, because they will not notice and they will not adjust. Against a good one, you go back to the equilibrium and you stay there." },
    { t:"warn", x:"The discipline is knowing which one you are in. Most players believe they are deviating on reads when they are actually just playing badly and calling it a read. The test is whether you can state the equilibrium frequency, state his frequency, and state your evidence for the second number. If you cannot do all three, you are not exploiting anyone. You are guessing." },
    { t:"key", x:"Equilibrium is the fallback and the measuring stick. Deviate hard when the read is real, snap back to the baseline when it is not, and always be able to say which one you are doing." },
    { t:"how", drill:"Deviate", ask:"You hold a pure bluff catcher. Call or fold?",
      steps:[
        "The drill hands you two numbers directly: the equilibrium bluff rate, which is your indifference point, and your read on how often he actually bluffs.",
        "Compare them. If he bluffs more than the equilibrium rate, CALL. If he bluffs less, FOLD.",
        "That is the entire decision. Do not reach for MDF here."
      ],
      tip:"Look at the bar: your read is the moving fill, indifference is the tick. Fill past the tick means call, short of it means fold. Every dollar you make is the gap between those two marks, so trust the read the drill gave you." }
  ]
}
];

/* ---------------- assembly ---------------- */
var LAYERS = [
  { n:0, title:"The game", sub:"Rules, rankings, shape", lessons:LESSONS_0,
    blurb:"Assumes nothing. What beats what, how a hand unfolds, and why position is worth more than cards." },
  { n:1, title:"Equity and pot odds", sub:"A weekend", lessons:LESSONS_1,
    blurb:"Arithmetic. Pot odds, outs, fold equity, implied odds. The only thing worth drilling here is speed." },
  { n:2, title:"Combinatorics of ranges", sub:"A few weeks", lessons:LESSONS_2,
    blurb:"Where most people stall. Stop putting him on a hand and start counting combos, removal and blockers." },
  { n:3, title:"Game theory", sub:"The real content", lessons:LESSONS_3,
    blurb:"Indifference, alpha, MDF, sizing as mechanism design, and two working solvers you can watch converge." },
  { n:4, title:"Variance and bankroll", sub:"Familiar ground", lessons:LESSONS_4,
    blurb:"Kelly, risk of ruin, and the t-stat on your own winrate. This is a backtesting problem wearing a hoodie." },
  { n:5, title:"Exploitative deviation", sub:"Where the money is", lessons:LESSONS_5,
    blurb:"Bayesian updating with equilibrium as the prior, and the discipline to know when you are guessing." }
];

var LESSONS = [];
LAYERS.forEach(function (L) {
  L.lessons.forEach(function (les, i) {
    les.layer = L.n; les.idx = i; les.of_n = L.lessons.length;
    LESSONS.push(les);
  });
});

var READING = [
  { g:"Start here", items:[
    ["The Mathematics of Poker", "Chen and Ankenman. Chen was a quant at Susquehanna. Derives toy games from first principles and builds to real spots. Written for you specifically."],
    ["Play Optimal Poker 1 and 2", "Brokos. The same equilibrium intuition through toy games, without the machinery. Read alongside Chen."],
    ["Modern Poker Theory", "Acevedo. Solver output organised into heuristics you can actually carry to a table."]
  ]},
  { g:"The algorithm", items:[
    ["Zinkevich et al. 2007", "Regret minimisation in games with incomplete information. The CFR paper. This is the thing in the lab above."],
    ["Bowling et al. 2015", "Heads up limit hold'em is solved. Science. What CFR looks like at scale."],
    ["Brown and Sandholm", "Libratus and Pluribus. Superhuman play, and the multiplayer result that has no equilibrium guarantee behind it."]
  ]},
  { g:"Tools", items:[
    ["GTO Wizard", "Precomputed solutions. A lookup table, once you know what it is looking up."],
    ["PioSOLVER", "Run your own trees. Worth it once you can specify a question precisely."],
    ["Flopzilla", "Layer 2 reps. Combos and removal until they are reflex."],
    ["PokerTracker", "Your own database. The only honest source on your own leaks."]
  ]},
  { g:"The project", items:[
    ["Implement CFR yourself", "Kuhn first, then Leduc. Both labs above are in this page: about 90 lines and 200 lines respectively. Write your own from the regret matching rule, check it against these, then extend to a river subgame with real ranges using the layer 2 engine. You will understand a solver in a way no amount of reading its output can give you."]
  ]}
];
