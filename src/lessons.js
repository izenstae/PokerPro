/* ============================================================
   COURSE CONTENT
   block types:
     p    prose
     rule boxed formula
     tbl  reference table
     ex   worked example (facts, steps, optional bar, optional cards)
     warn caveat
     key  the thing to memorise
   ============================================================ */
var LESSONS_1 = [
{
  id: "price", mode: "potodds", pass: 4, of: 5,
  title: "The price of a call",
  sub: "Pot odds",
  gist: "You are being sold a share of the pot. Work out what share.",
  blocks: [
    { t:"p", x:"Forget whether your hand is good. When someone bets at you, they are selling you a share of the pot at a fixed price, and you have one decision to make: is the share you are buying worth more than what it costs?" },
    { t:"p", x:"That is a real question with a real answer, and it is the same answer every time. It does not care how you feel about your hand." },
    { t:"rule", x:"price = call / (pot + call)", note:"Pot means everything already in the middle, including the bet you are facing. Then add your own call on top, because by the time the hand is decided your money is in there too." },
    { t:"warn", x:"The most common mistake in poker is dividing by the pot before adding your call. It makes every call look worse than it is and it will cost you money for years." },
    { t:"ex", title:"Worked example",
      facts:[["Pot","$100"],["Villain bets","$50"],["To call","$50"]],
      steps:[
        "The middle now holds $100 + $50 = $150.",
        "Add your call: $150 + $50 = $200.",
        "price = $50 / $200 = 25%."
      ],
      bar:{ fill:25, tick:null, fillLabel:"equity you need to break even", tickLabel:"" },
      punch:"You need to win this pot 1 time in 4. That is all a half pot bet ever asks of you." },
    { t:"p", x:"Because the price only depends on the size of the bet relative to the pot, there are about six numbers in the whole game. Learn these and you have already stopped calculating." },
    { t:"tbl", head:["Villain bets","You need"], rows:[
      ["a third of the pot","20%"],
      ["half the pot","25%"],
      ["two thirds","28.5%"],
      ["three quarters","30%"],
      ["the pot","33%"],
      ["twice the pot","40%"]
    ], caption:"Notice how slowly the right column moves. Doubling the bet from half pot to pot only costs you 8 points of required equity. Big bets are cheaper to call than they feel." },
    { t:"key", x:"Half pot is 25. Pot is 33. Double pot is 40. Interpolate everything else and never be wrong by more than a point." }
  ]
},
{
  id: "outs", mode: "outs", pass: 4, of: 5,
  title: "Counting outs",
  sub: "Turning cards into a percentage",
  gist: "An out is a card that wins, not a card that helps.",
  blocks: [
    { t:"p", x:"You know the price. Now you need the other half: how often you actually win. When you are drawing, that starts by counting the cards that get you there." },
    { t:"p", x:"An out is a card that makes you the winner. Not a card that improves your hand. If you hold two hearts on a heart heart club flop and the villain has a set, three of your nine hearts pair the board and hand him a full house. Those hearts were never outs. They were invitations." },
    { t:"tbl", head:["What you have","Outs"], rows:[
      ["Flush draw","9"],
      ["Open ended straight draw","8"],
      ["Gutshot","4"],
      ["Two overcards","6"],
      ["Pair, drawing to trips","2"],
      ["Pair, drawing to two pair or trips","5"],
      ["Flush draw plus gutshot","12"],
      ["Flush draw plus open ender","15"]
    ], caption:"Nine, eight, four. Almost every drawing spot you will ever face is one of these three, or a sum of two of them." },
    { t:"p", x:"Converting outs into a percentage is where the table would normally lose you. It does not have to. There is a shortcut that is accurate enough to bet real money on." },
    { t:"rule", x:"outs x 2 = your chance on the next card\nouts x 4 = your chance across turn and river", note:"Use the x4 version only when the money is going in now and you will see both cards. If you can still be bet off the turn, you are only buying one card, so use x2." },
    { t:"warn", x:"The x4 rule drifts high as outs climb, because it double counts the runouts where you hit twice. Above eight outs, subtract one point for each out over eight. Fifteen outs is not 60%, it is closer to 54%." },
    { t:"ex", title:"Worked example",
      facts:[["Your hand","flush draw"],["Outs","9"],["Street","flop, all in, both cards to come"]],
      steps:[
        "Rule of 4: 9 x 4 = 36%.",
        "Nine outs is one over eight, so subtract one point: 35%.",
        "Exact answer: 34.97%."
      ],
      bar:{ fill:35, tick:null, fillLabel:"you get there", tickLabel:"" },
      punch:"You did that in two seconds and you were off by three hundredths of a point. There is no spot at any table where that error changes a decision." },
    { t:"key", x:"9 outs: 19% one card, 35% two. 8 outs: 17% and 31%. 4 outs: 9% and 17%. Those six numbers cover most of your drawing life." }
  ]
},
{
  id: "decide", mode: "allin", pass: 4, of: 5,
  title: "Equity against the price",
  sub: "The decision itself",
  gist: "Two numbers, one comparison. This is the whole of Layer 1.",
  blocks: [
    { t:"p", x:"You have a price from lesson one and an equity from lesson two. The decision is just putting them next to each other." },
    { t:"rule", x:"equity > price   ->   call\nequity < price   ->   fold", note:"There is no third option and no judgement involved. If you are ahead of the price you call, even with a hand you dislike, even when you will lose most of the time." },
    { t:"p", x:"That last part is what people cannot swallow. A correct call can lose two times out of three. It is still correct, because you were not paying for a win, you were paying for a share, and you got the share cheap. The losses are already in the price." },
    { t:"ex", title:"Worked example",
      cards:{ hero:["9h","8h"], villain:["As","Kd"], board:["Ah","7h","2c"] },
      facts:[["Pot","$120"],["Villain shoves","$80"],["To call","$80"]],
      steps:[
        "Price: $80 / ($120 + $80 + $80) = 28.6%.",
        "Outs: 9 hearts. My nine and my eight are dead, he already has aces, so pairing does nothing.",
        "Rule of 4: 9 x 4 = 36, minus 1 for being over eight outs = 35%.",
        "35 beats 28.6. Call, and do not think about it again."
      ],
      bar:{ fill:35, tick:28.6, fillLabel:"your equity (estimated)", tickLabel:"price of the call" },
      punch:"Exact answer, by enumerating all 990 runouts: 39.8%. Your estimate was five points low and the decision was never in doubt. Being conservative and fast beat being precise and slow, which is the entire argument for this method." },
    { t:"warn", x:"The margin tells you how much the mistake costs. A spot where you need 30% and hold 31% barely matters either way. A spot where you need 30% and hold 55% is a catastrophe if you fold it. Spend your thinking time on the wide gaps, not the coin flips." },
    { t:"key", x:"Price first, then equity, then compare. Always in that order, because knowing the price tells you how hard you need to work on the equity." }
  ]
},
{
  id: "fold", mode: "bluff", pass: 4, of: 5,
  title: "Fold equity",
  sub: "The other side of the table",
  gist: "When you bet, you buy two ways to win.",
  blocks: [
    { t:"p", x:"Everything so far has been about calling. Now you are the one betting, and the arithmetic flips over." },
    { t:"p", x:"When you bet, you can win two ways: they fold now, or they call and you win at showdown. The first way has nothing to do with your cards. That is the part beginners never use and good players live on." },
    { t:"rule", x:"folds needed = bet / (pot + bet)", note:"You risk your bet to win the pot. The break-even fold percentage is your own price, seen from the other side of the table." },
    { t:"tbl", head:["You bet","They must fold"], rows:[
      ["a third of the pot","25%"],
      ["half the pot","33%"],
      ["three quarters","43%"],
      ["the pot","50%"],
      ["twice the pot","67%"]
    ], caption:"Small bluffs are cheap. A third pot bluff only has to work one time in four, and almost any hand folds a quarter of the time." },
    { t:"ex", title:"Worked example: pure bluff",
      facts:[["Pot","$90"],["Your bluff","$60"],["Equity when called","0%"]],
      steps:[
        "$60 / ($90 + $60) = $60 / $150 = 40%.",
        "They must fold 40% of the time for this to break even."
      ],
      bar:{ fill:40, tick:null, fillLabel:"folds needed to break even", tickLabel:"" },
      punch:"Ask yourself honestly: out of every ten times, does this player really pass six? If yes, the bluff loses. That is now a question about him, not about you." },
    { t:"p", x:"Now add cards to it. If you have a draw, the times they call are not all losses, and every point of equity when called buys you back fold equity you no longer need." },
    { t:"ex", title:"Worked example: semi-bluff",
      facts:[["Pot","$90"],["Your bet","$60"],["Equity when called","30%"]],
      steps:[
        "When called: 0.30 x $150 won minus 0.70 x $60 lost = $45 - $42 = a $3 loss.",
        "When they fold you take $90 clean.",
        "f x $90 = $3, so f = 3 / (3 + 90) = 3.2%."
      ],
      bar:{ fill:3.2, tick:40, fillLabel:"folds needed with a draw", tickLabel:"folds needed as a pure bluff" },
      punch:"The same bet went from needing 40% folds to needing 3%. You did not change the bet. You changed the hand behind it. This is why you bluff with your draws and check your air." },
    { t:"warn", x:"The formula is exact. The input is not. Fold equity is a guess about a human being, and no amount of arithmetic will make a bad read good. Be honest about the guess and the math will take care of itself." },
    { t:"key", x:"Half pot needs a third of folds. Pot needs half. Every point of equity when called pulls the requirement down hard." }
  ]
},
{
  id: "implied", mode: "implied", pass: 3, of: 5,
  title: "Implied odds",
  sub: "When a bad price is a good call",
  gist: "Pot odds assume the hand ends here. It usually doesn't.",
  blocks: [
    { t:"p", x:"Everything in lesson one assumed the hand ends the moment you call. But you are on the flop, there are two more cards and possibly another bet, and if you hit your draw the villain may hand you his whole stack." },
    { t:"p", x:"That future money is real and you are allowed to count it. Carefully." },
    { t:"rule", x:"extra = (1 - e) x call / e - pot", note:"e is your equity, call is what you are paying, pot is the middle before your call. The answer is how much more you must win on later streets, on average, for the call to break even." },
    { t:"ex", title:"Worked example",
      facts:[["Pot","$100"],["Villain bets","$50"],["To call","$50"],["Your outs","4 (gutshot, 8.7%)"]],
      steps:[
        "Price: $50 / $200 = 25%. You have 8.7%. Raw call is bad.",
        "extra = 0.913 x $50 / 0.087 - $150",
        "= $525 - $150 = $375."
      ],
      bar:{ fill:8.7, tick:25, fillLabel:"your equity", tickLabel:"price of the call" },
      punch:"You must extract $375 more, on average, across every river you hit. If he has $200 behind, that call is not close. It is on fire." },
    { t:"p", x:"That word average is doing the heavy lifting. The number is not what you win when he pays you off. It is what you win across every time you hit, including the times he folds, the times you check it back, and the times he was never paying anyway. If he only calls half the time you hit, you need to stack him for double the number." },
    { t:"warn", x:"Implied odds are where losing players hide their bad calls. Three tests before you count a dollar of future money. Does he have a stack deep enough to pay it? Is he the kind of player who actually pays? And when you hit, will your hand still be second best? A gutshot to the idiot end has negative implied odds. You do not win less, you lose more." },
    { t:"key", x:"Draws want deep stacks and loose opponents. Against a short stack or a good player, the raw price is the only price you get." }
  ]
},
{
  id: "shapes", mode: "pfeq", pass: 3, of: 5,
  title: "Preflop shapes",
  sub: "Hand versus hand",
  gist: "Six matchups. Every all in you ever face is one of them.",
  blocks: [
    { t:"p", x:"Preflop equity looks like it needs a computer. It does not. Two random hands only ever relate to each other in about six ways, and each way has a number attached that barely moves." },
    { t:"p", x:"Learn the shape, read off the number, done in a second and a half." },
    { t:"tbl", head:["Shape","Split"], rows:[
      ["Pair over pair (QQ vs 77)","80 / 20"],
      ["Pair vs two overcards (77 vs AK)","55 / 45"],
      ["Pair vs one over, one under (77 vs A5)","70 / 30"],
      ["Dominated (AK vs AQ)","74 / 26"],
      ["Two live overs vs two unders (KQ vs 87)","64 / 36"],
      ["Pair vs a hand it dominates (AA vs AK)","93 / 7"]
    ], caption:"The famous coin flip is pair against two overcards, and it is not actually a flip. The pair is a 55/45 favourite, because it is already the best hand and the overcards have to improve." },
    { t:"p", x:"Then two small adjustments, worth remembering because they are the entire argument for playing suited cards." },
    { t:"tbl", head:["Modifier","Worth"], rows:[
      ["Suited instead of offsuit","+3 points (AKo vs 77 is 44.7%, AKs is 48.0%)"],
      ["Connected instead of gapped","+2 points (84o vs KQo is 34%, 87o is 36%)"],
      ["AK against a pair, suited (AKs vs 77)","48 / 52, basically a flip"]
    ], caption:"Three points sounds like nothing. It is the difference between a hand you open and a hand you fold, repeated ten thousand times." },
    { t:"ex", title:"Worked example",
      cards:{ hero:["Ac","Kd"], villain:["Qh","Qs"] },
      steps:[
        "Shape: pair versus two overcards.",
        "That is the 55/45, and the pair is the favourite.",
        "Exact answer: 43% for AK. You said 45. You are 2 points off and you took a second."
      ],
      bar:{ fill:43, tick:null, fillLabel:"AK equity against QQ", tickLabel:"" },
      punch:"Nobody at the table needs the decimal. They need to know it is close, and that folding AK to a shove is losing you money." },
    { t:"key", x:"80 / 55 / 70 / 74. Pair over pair, the flip, pair with one over, and domination. Four numbers and you have covered preflop." }
  ]
},
{
  id: "table", mode: "mixed", pass: 8, of: 10,
  title: "Doing it at the table",
  sub: "Capstone",
  gist: "Everything above, in under ten seconds, while people watch.",
  blocks: [
    { t:"p", x:"You now know all of Layer 1. The gap between knowing it and using it is speed, and speed comes from doing it in a fixed order so you never have to decide what to think about next." },
    { t:"rule", x:"1. What is the price?\n2. What is my equity?\n3. Is there money behind?\n4. Compare. Act.", note:"The order matters. The price is the cheapest number to get, and it tells you how much precision the equity actually needs." },
    { t:"p", x:"Step three is the one people skip. If the stacks are deep and you are drawing, the raw comparison in step four is not the real decision. If the stacks are shallow, it is exactly the decision and you can go faster." },
    { t:"ex", title:"The whole thing, live",
      cards:{ hero:["9s","8s"], board:["7s","6h","2d"] },
      facts:[["Pot","$60"],["Villain bets","$40"],["To call","$40"],["Stacks behind","$300"]],
      steps:[
        "Price: 40 / 140 = 29%.",
        "Outs: 8 for the straight, 9 for the flush, minus 2 that overlap = 15. One card only, so 15 x 2 = 30%.",
        "30 vs 29. Break even on the raw price alone.",
        "There is $300 behind and I am drawing to a straight and a flush. Everything past break even is free money."
      ],
      bar:{ fill:30, tick:29, fillLabel:"your equity", tickLabel:"price of the call" },
      punch:"Four seconds. And notice you never needed to know if you were ahead. You are not. It does not matter." },
    { t:"warn", x:"Round aggressively. 28.5 becomes 30, 34.97 becomes 35, and the villain's $37 bet into $61 becomes half pot. Every spot where rounding changes your answer was a spot worth almost nothing anyway. Precision is a trap that costs you tempo and tells the table you are thinking." },
    { t:"key", x:"Price, equity, stacks, act. When the two numbers are within a couple of points, stop working. The decision is a coin flip and coin flips are free." }
  ]
}
];
