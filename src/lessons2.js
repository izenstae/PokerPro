/* ============================================================
   LESSONS added for the zero-to-pro path. Each one is backed by a
   formula from the reading list (Chen and Ankenman's Mathematics of
   Poker, Brokos, Acevedo) and has a drill in drills2.js.
   ============================================================ */

/* ---------------- stage 0: the game ---------------- */
var L_RULES = {
  id: "rules", mode: "rules", pass: 7, of: 10,
  title: "How a hand is played",
  sub: "Blinds, actions, raises, the pot",
  gist: "Forced bets start it, four betting rounds build it, the best five cards or the last player standing win it.",
  blocks: [
    { t:"p", x:"Start with nothing assumed. Six players sit at the table. A plastic disc called the button marks the dealer seat and moves one place clockwise after every hand, so everyone takes turns in every seat." },
    { t:"p", x:"The two players left of the button post forced bets before any cards are dealt: the small blind, usually half a big blind, and the big blind. Without them nobody would ever need to play a hand. Everything in poker is measured in big blinds, written bb." },
    { t:"tbl", head:["On your turn you may","When"], rows:[
      ["Fold","Give up the hand and anything you have put in."],
      ["Check","Pass, when nobody has bet this round."],
      ["Bet","Put chips in first, when nobody has bet this round."],
      ["Call","Match the current bet."],
      ["Raise","Increase the current bet. Everyone must match it again or fold."]
    ], caption:"A betting round ends when everyone still in has put in the same amount and had a chance to act." },
    { t:"rule", x:"minimum raise = current bet + size of the last raise", note:"If the big blind is $2 and someone raises to $6, the raise was $4, so the next raise must go to at least $10. It is measured by the size of the last raise, never by doubling the total." },
    { t:"p", x:"No-limit means you can bet any amount up to everything in front of you. Going all-in means betting all of it. Once you are all-in you cannot be forced to fold; you just can't win more from each opponent than you put in. Extra chips between bigger stacks go into a side pot that only they contest." },
    { t:"ex", title:"Worked example: one whole hand",
      facts:[["Blinds","$1 / $2"],["Players","CO, BTN, SB, BB"]],
      steps:[
        "Preflop: CO raises to $6. BTN calls $6. SB folds, leaving $1 in the pot. BB calls, adding $4 to the $2 blind.",
        "Pot on the flop: $6 + $6 + $6 + $1 = $19.",
        "Flop: BB checks, CO bets $10, BTN folds, BB calls. Pot: $19 + $20 = $39.",
        "Turn: both check. River: BB bets $25, CO calls. Pot: $39 + $50 = $89.",
        "Showdown: the best five cards win the $89. If everyone else folds earlier, the last player in wins without showing."
      ],
      punch:"Every price you will ever compute starts with counting this pot correctly. Folded blinds stay in as dead money; the big blind's $2 counts toward its call." },
    { t:"warn", x:"The two classic rule mistakes: forgetting that a blind counts toward a call, and treating a min-raise as double the total. Both change the pot, and the pot changes every decision after it." },
    { t:"key", x:"Blinds force the action. Four rounds: preflop, flop, turn, river. Fold, check, bet, call, raise. A raise is at least the size of the last raise. Count the pot every street." },
    { t:"how", drill:"Rules", ask:"Minimum raises, who acts first, and how much is in the pot.",
      steps:[
        "Minimum raise: find the size of the last raise (new total minus the old one) and add it to the current total.",
        "Who acts first: preflop it is the first seat after the big blind; on the flop, turn and river it is the first seat after the button.",
        "Pot size: add what every player put in, blinds included, plus any blinds that folded."
      ],
      tip:"Say the pot out loud after every action while you practise. It is the one number every later decision needs." }
  ]
};

var L_SEATS = {
  id: "seats", mode: "position", pass: 7, of: 10,
  title: "Seats and position",
  sub: "Six seats, two orders of action",
  gist: "The later you act, the more you see first. Ranges widen toward the button for exactly that reason.",
  blocks: [
    { t:"p", x:"At a six-handed table the seats have names. Going clockwise from the blinds: UTG (under the gun, first to act before the flop), HJ (hijack), CO (cutoff), BTN (button), then SB and BB." },
    { t:"tbl", head:["Seat","Preflop acts","After the flop acts","Opens about"], rows:[
      ["UTG","1st","3rd","17%"],
      ["HJ","2nd","4th","22%"],
      ["CO","3rd","5th","28%"],
      ["BTN","4th","last","46%"],
      ["SB","5th","1st","38%"],
      ["BB","last","2nd","defends"]
    ], caption:"Opening percentages are from the chart this course uses, an approximation of solver output at 100 big blinds. Preflop the blinds act last because they have already put money in; after that they act first for the whole hand." },
    { t:"p", x:"Two things change as you move toward the button. Fewer players are left behind you who could wake up with a big hand, and you are more likely to act last on every later street. Both mean a hand that is a losing open from UTG can be a winning one from the button." },
    { t:"rule", x:"P(nobody behind you has it) = (1 − p)^n", note:"If each of the n players behind you holds a hand strong enough to fight with probability p, the chance all of them miss shrinks with every extra player. With p = 10%: five players behind you leaves 59%, two leaves 81%. That is why early seats open so much tighter." },
    { t:"ex", title:"Worked example",
      facts:[["You hold","A9 offsuit"],["Folded to you","every seat before yours"]],
      steps:[
        "From UTG, five players act after you, and after the flop you will usually act before at least one of them. A9o is a fold.",
        "From the button only the blinds remain, and you will act last on every street after the flop. A9o is a comfortable raise.",
        "Same cards, different seat, opposite decision."
      ],
      punch:"The seat is part of the hand. Read it before you read your cards." },
    { t:"key", x:"Preflop order: UTG, HJ, CO, BTN, SB, BB. After the flop: SB, BB, UTG, HJ, CO, BTN. The button acts last after the flop, and the later your seat, the more hands you open." },
    { t:"how", drill:"Position", ask:"Who is in position, how many act behind you, how wide each seat opens.",
      steps:[
        "For who acts last after the flop, walk the postflop order SB, BB, UTG, HJ, CO, BTN and take the last player still in.",
        "For players behind you preflop, count the seats after yours in UTG, HJ, CO, BTN, SB, BB.",
        "For opening width, anchor on the chart: UTG about 17%, CO about 28%, button about 46%."
      ],
      tip:"The button is in position against everyone. The blinds are out of position against everyone after the flop, even though they close the action before it." }
  ]
};

/* ---------------- stage 1: odds and equity ---------------- */
var L_PROB = {
  id: "prob", mode: "prob", pass: 4, of: 5,
  title: "Probability you can do at the table",
  sub: "Counting, complements, the 1,326",
  gist: "Count the ways something can happen, divide by the ways anything can. When that is hard, count the misses instead.",
  blocks: [
    { t:"p", x:"Almost every probability in poker is a counting problem. A deck has 52 cards, so there are C(52,2) = 52 × 51 / 2 = 1,326 possible two-card starting hands, all equally likely. Count the ones you care about and divide." },
    { t:"rule", x:"C(n, k) = n! / (k! × (n − k)!)\nP(event) = favourable cases / all cases", note:"C(n, k) is the number of ways to choose k cards from n, ignoring order. C(4,2) = 6 ways to pair up four aces; C(50,3) = 19,600 possible flops once you know your two cards." },
    { t:"tbl", head:["Being dealt","Count","Chance"], rows:[
      ["Any pocket pair","13 × 6 = 78","5.9%, 1 in 17"],
      ["A specific pair, like AA","6","0.45%, 1 in 221"],
      ["Any suited hand","78 × 4 = 312","23.5%"],
      ["AK, any suits","4 × 4 = 16","1.2%, 1 in 83"]
    ], caption:"These are the anchors behind every range you will ever read. Ranges are counts of combos, and combos are what this table counts." },
    { t:"p", x:"When the thing you want can happen several ways, it is usually easier to count how it fails. The chance of at least one hit equals one minus the chance of missing every time. Misses multiply because each card you don't hit leaves the deck for the next one." },
    { t:"rule", x:"P(at least one hit) = 1 − P(miss every time)", note:"Holding a pocket pair, you miss a set on the flop only if all three flop cards come from the 48 cards that are not your rank: C(48,3) / C(50,3) = 88.2%. So you flop a set 11.8% of the time, about 1 in 8.5." },
    { t:"ex", title:"Worked example: a flush draw by the river",
      facts:[["Your suited cards + flop","four to a flush"],["Unseen cards","47"],["Outs","9"]],
      steps:[
        "Miss the turn: 38 of the 47 unseen cards are blanks, so 38/47.",
        "Then miss the river: 37 of the remaining 46, so 37/46.",
        "Miss both: 38/47 × 37/46 = 65.0%. Hit at least once: 35.0%."
      ],
      bar:{ fill:35, tick:null, fillLabel:"flush by the river 35%", tickLabel:"" },
      punch:"The rule of 4 gives 36%. The exact count is what the rule is approximating, and now you know why it overshoots with lots of outs: misses overlap." },
    { t:"key", x:"1,326 starting hands. Pairs 1 in 17, suited 1 in 4, a set on the flop 1 in 8.5. When it is hard to count hits, count misses and subtract from one." },
    { t:"how", drill:"Probability", ask:"Chances of common events, from draws to being dealt a pair.",
      steps:[
        "For draws: count the unseen cards (47 on the flop, 46 on the turn) and the outs.",
        "For 'by the river', multiply the two miss chances and subtract from one. For one card, it is just outs / unseen.",
        "For starting hands, count combos out of 1,326: 6 for a pair, 4 for suited, 12 for offsuit."
      ],
      tip:"Graded within a point or so, and tighter for very small chances. Rule of 2 and 4 is close enough on draws until you hit ten or more outs." }
  ]
};

var L_EV = {
  id: "ev", mode: "ev", pass: 4, of: 5,
  title: "Expected value",
  sub: "The only scoreboard that matters",
  gist: "Every decision is a bet with several outcomes. Weight each by its chance and add them up.",
  blocks: [
    { t:"p", x:"You will lose hands you played perfectly and win hands you played terribly. Results are noise. What you control is the average result of each decision, if you could make it thousands of times. That average is expected value, EV." },
    { t:"rule", x:"EV = Σ p_i × x_i", note:"Add up, over every way the decision can turn out, the chance of that outcome times what you win or lose in it. Measure from the moment of the decision: money already in the pot is no longer yours." },
    { t:"p", x:"Apply it to a call. You win the final pot when your hand holds up and you lose your call when it doesn't. The EV of folding is zero: you neither win nor lose anything more. So calling is right exactly when its EV is above zero." },
    { t:"rule", x:"EV(call) = equity × (pot + call) − call", note:"Pot includes his bet. Set this to zero and solve: equity = call / (pot + call), the pot-odds price from the first lesson of this stage. Pot odds are just the break-even point of this equation." },
    { t:"ex", title:"Worked example",
      facts:[["Pot","$100"],["He bets","$50"],["Your equity","30%"]],
      steps:[
        "Final pot if you call: $100 + $50 + $50 = $200.",
        "EV(call) = 30% × $200 − $50 = $60 − $50 = +$10.",
        "You lose this hand 70% of the time and calling still makes $10 every time you face it."
      ],
      bar:{ fill:30, tick:25, fillLabel:"your equity 30%", tickLabel:"price 25%" },
      punch:"EV is measured in money per decision. Five extra percent of equity on a $200 pot is $10. That is how you compare mistakes of different sizes." },
    { t:"p", x:"EV is additive. The EV of a bet is the EV of the times they fold plus the EV of the times they call, each weighted by how often it happens. That one idea, split the future into branches and weight them, is how every piece of poker maths in this course is built, up to and including the solvers in Stage 4." },
    { t:"warn", x:"Do not include money you already put in the pot as something you 'lose' by folding. It is gone either way. Counting it is the sunk-cost mistake, and it makes every bad call look better than it is." },
    { t:"key", x:"EV = Σ probability × result. EV(call) = equity × final pot − call; folding is zero. Judge every decision by its EV, never by how the hand turned out." },
    { t:"how", drill:"Expected value", ask:"EV of a call, of a bet with fold equity, or of a spread of outcomes.",
      steps:[
        "Write down every outcome with its chance. They must add to 100%.",
        "Multiply each outcome's chance by its result in dollars, with losses negative.",
        "Add them up. That is the EV; enter it with a minus sign if it loses."
      ],
      tip:"For a call: equity × final pot − call. For a bet: folds × pot + calls × (equity × (pot + 2 × bet) − bet)." }
  ]
};

/* ---------------- stage 2: preflop ---------------- */
var L_RFI = {
  id: "rfi", mode: "rfi", pass: 8, of: 10,
  title: "Opening ranges",
  sub: "Raise first in, by seat",
  gist: "When everyone folds to you, raise a fixed chart for your seat and fold the rest. Limping is not on the menu.",
  blocks: [
    { t:"p", x:"The first decision of almost every hand is the same: everyone before you folded, so do you open? Solvers answer it with a chart per seat, and the charts are stable enough that strong players simply memorise them. That frees all their thinking for later streets, where the money is." },
    { t:"p", x:"Open with a raise, usually to 2 to 2.5 big blinds, not a call. Raising gives you two ways to win, everyone folds or you win later, and it takes the initiative into the flop. Calling the big blind, limping, gives the blinds a cheap look and wins nothing by itself." },
    { t:"tbl", head:["Seat","Chart","Share of hands"], rows:[
      ["UTG","22+, A2s+, K9s+, Q9s+, J9s+, T9s, 98s, 87s, 76s, AJo+, KQo","17%"],
      ["HJ","adds K7s–K8s, T8s, 97s, 86s, 65s, ATo, KJo, QJo","22%"],
      ["CO","adds K5s–K6s, Q7s–Q8s, J8s, 75s, 54s, A8o–A9o, KTo, QTo, JTo","28%"],
      ["BTN","adds most suited hands, A2o+, K8o+, Q9o+, J9o+, T8o+, 98o, 87o","46%"],
      ["SB","raise-or-fold against the big blind","38%"]
    ], caption:"An approximation of 100-big-blind solver charts, and the same chart the Play table's opponents use. The exact edges move a little with rake, antes and opponents; the shape does not." },
    { t:"rule", x:"range % = combos in the range / 1,326", note:"Every pair class is 6 combos, suited 4, offsuit 12. Offsuit hands are three times as heavy as suited ones, which is why adding a few offsuit hands widens a range so quickly." },
    { t:"ex", title:"Worked example",
      facts:[["Hand","K8 offsuit"]],
      steps:[
        "UTG, HJ, CO: not in the chart. Fold.",
        "Button: in the chart. Raise.",
        "The hand did not change. The number of players behind you, and your position after the flop, did."
      ],
      punch:"Most losing players lose most of their money in hands they should never have entered. A chart fixes that on day one." },
    { t:"key", x:"Folded to you: raise the chart for your seat, fold everything else. UTG about 17%, CO about 28%, button about 46%. Never open by limping." },
    { t:"how", drill:"Opening ranges", ask:"Folded to you in a seat, holding a hand: raise or fold?",
      steps:[
        "Read the seat first, then the hand.",
        "Check the hand against that seat's chart. The drill picks hands near the edges, where it matters.",
        "Raise if it is in, fold if it is out."
      ],
      tip:"Learn the charts as a picture: pairs always, suited aces always, suited broadways almost always, and offsuit hands only get added as you approach the button." }
  ]
};

var L_3BET = {
  id: "threebet", mode: "threebet", pass: 4, of: 5,
  title: "3-bets: risk and reward",
  sub: "Re-raising, and calling re-raises",
  gist: "A 3-bet risks your raise to win the pot. Facing one, you are being quoted a price like any other bet.",
  blocks: [
    { t:"p", x:"A 3-bet is the second raise of a hand: someone opens and you raise again. You 3-bet strong hands for value and some weaker ones as bluffs, usually hands with a blocker to strong hands, like a suited ace, or good playability when called." },
    { t:"rule", x:"folds needed = risk / (risk + reward)", note:"Risk is the total you put in with the 3-bet. Reward is everything already in the pot: the open raise plus the blinds. It is the fold-equity formula from Stage 1 with the pot measured in big blinds." },
    { t:"ex", title:"Worked example: a button 3-bet",
      facts:[["CO opens","2.5 bb"],["You 3-bet to","9 bb"],["Blinds","1.5 bb, still to act"]],
      steps:[
        "Reward: 2.5 + 1.5 = 4 bb already in the middle.",
        "Risk: your 9 bb.",
        "Break-even folds: 9 / 13 = 69%."
      ],
      bar:{ fill:69, tick:null, fillLabel:"everyone must fold 69% for a pure bluff", tickLabel:"" },
      punch:"That sounds like a lot, and it is. That is why 3-bet bluffs use hands with equity when called: every percent of equity lowers the folds you need." },
    { t:"p", x:"From the other chair: you opened, and someone 3-bets. You now face a price like any bet. You have already put in your open, and that money is gone. What you must add is the difference, and the pot you are playing for includes both raises and the blinds." },
    { t:"rule", x:"price to call = (3-bet − your open) / (pot + 3-bet − your open)", note:"Pot here is everything in the middle before you call: your open, their 3-bet and the dead blinds. Out of position you will realise less equity than you hold, so defend a little tighter than the bare price." },
    { t:"key", x:"A pure 3-bet bluff needs folds of risk / (risk + reward), usually 60–70%. Facing a 3-bet, your price is (3-bet − open) / (pot + 3-bet − open), typically 25–35%." },
    { t:"how", drill:"3-bets", ask:"Break-even folds for a 3-bet bluff, or the price to call one.",
      steps:[
        "Measure everything in big blinds. The blinds add 1.5 bb to the pot.",
        "For a bluff: your 3-bet size divided by (your 3-bet + what is already in the pot).",
        "For a call: what you must add divided by (the pot before your call + what you add)."
      ],
      tip:"A 3-bet to about 3.5× the open makes the bluff need roughly two folds in three; calling that 3-bet costs about 30% equity." }
  ]
};

var L_SPR = {
  id: "spr", mode: "spr", pass: 4, of: 5,
  title: "Stack-to-pot ratio",
  sub: "How deep the rest of the hand is",
  gist: "SPR = stack behind / pot on the flop. It tells you, before the flop comes, which hands are good enough to go broke with.",
  blocks: [
    { t:"p", x:"How much a hand is worth depends on how much money can still go in. Top pair in a pot with little behind is a monster; the same top pair with a huge stack behind is a bluff catcher. The number that captures this is the stack-to-pot ratio." },
    { t:"rule", x:"SPR = effective stack behind / pot on the flop", note:"Effective stack is the smaller of the two stacks, because that is all that can be won. Measure it after the preflop betting." },
    { t:"tbl", head:["SPR","Typical pot","Hands happy to get it all in"], rows:[
      ["under 3","3-bet and 4-bet pots","Top pair and overpairs"],
      ["3 to 6","3-bet pots","Top pair good kicker, two pair+"],
      ["6 to 13","single-raised pots at 100 bb","Two pair, sets, strong draws"],
      ["over 13","limped or deep pots","Sets and better; nut draws"]
    ], caption:"A rule of thumb in the spirit of Acevedo's commitment thresholds, not a law. The idea is that you should decide how far to go with a hand before the flop, from the SPR, not in the middle of a raise war." },
    { t:"ex", title:"Worked example",
      facts:[["Stacks","100 bb"],["Preflop","CO opens 2.5 bb, BTN calls, blinds fold"]],
      steps:[
        "Pot on the flop: 2.5 + 2.5 + 0.5 + 1 = 6.5 bb.",
        "Stack behind: 100 − 2.5 = 97.5 bb.",
        "SPR = 97.5 / 6.5 = 15."
      ],
      punch:"At SPR 15, one pair is rarely worth three streets of big bets. In a 3-bet pot to 9 bb it would be (100 − 9) / 19.5 = 4.7, and top pair is often good enough." },
    { t:"key", x:"SPR = stack behind / pot on the flop. Low SPR: one pair can go all-in. High SPR: it takes two pair or better. Know the SPR before the flop comes." },
    { t:"how", drill:"SPR", ask:"Given stacks and the preflop action, what is the SPR on the flop?",
      steps:[
        "Build the pot: every call and raise, plus the 1.5 bb of blinds (dead if they folded).",
        "Subtract what each player put in preflop from the effective stack.",
        "Divide the stack behind by the pot."
      ],
      tip:"Single-raised pots at 100 bb are SPR 13 to 16. 3-bet pots are 4 to 5. 4-bet pots are about 1." }
  ]
};

/* ---------------- stage 4: game theory ---------------- */
var L_AKQ = {
  id: "akq", mode: "akq", pass: 4, of: 5,
  title: "The AKQ game",
  sub: "A whole equilibrium you can solve by hand",
  gist: "Three cards, one bet. Every idea from this stage in a game small enough to solve on paper.",
  blocks: [
    { t:"p", x:"Chen and Ankenman open The Mathematics of Poker with toy games, because a game small enough to solve exactly teaches you what real equilibria look like. The most famous is the AKQ game." },
    { t:"p", x:"The deck is three cards: an ace, a king and a queen. Each player gets one; the ace beats the king beats the queen. There is a pot P. Player X may bet B or check; facing a bet, Y calls or folds. There are no further bets." },
    { t:"p", x:"Most of the strategy is obvious. X bets the ace, since it always wins. Y calls with the ace and folds the queen, since the queen can't beat anything. X checks the king, since betting it only gets called by the ace. Everything interesting happens with two hands: X's queen, which can bluff, and Y's king, which can catch bluffs." },
    { t:"rule", x:"X bluffs the queen:  β = B / (P + B)\nY calls with the king:  c = (P − B) / (P + B)", note:"β makes Y's king indifferent: bluffs are then α = B / (P + 2B) of X's bets, the Stage 4 alpha. c makes X's queen indifferent: Y, holding ace or king, folds (1 − c)/2 of the time, which is exactly the break-even fold rate for the bluff." },
    { t:"ex", title:"Worked example: pot 2, bet 1",
      steps:[
        "X bluffs queens B / (P + B) = 1/3 of the time.",
        "So of X's bets, aces make 1 part and bluffs 1/3 part: bluffs are 1/4 of the bets. Alpha for a half-pot bet is 1/4. ✓",
        "Y calls with kings (2 − 1) / (2 + 1) = 1/3 of the time.",
        "Facing a bet Y continues with all aces and a third of kings. From X's queen's point of view Y folds (1 − 1/3)/2 = 1/3, and the bluff needs 1 / (2 + 1) = 1/3 folds. ✓"
      ],
      punch:"Neither player can gain by changing. X's bluff and X's check with the queen earn the same; Y's call and fold with the king earn the same. That is what an equilibrium is." },
    { t:"warn", x:"The toy game is exact only under its rules: one bet, no raises, no draws. Real poker adds all three, which is why real solvers need the CFR machinery in the labs. The logic, though, is identical: bluff at the rate that makes their bluff catchers indifferent, catch at the rate that makes your bluffs indifferent." },
    { t:"key", x:"AKQ: bet aces, check kings, bluff queens B/(P + B). Call with aces, fold queens, call kings (P − B)/(P + B). Pot 2, bet 1: a third and a third." },
    { t:"how", drill:"AKQ game", ask:"How often should X bluff the queen, or Y call with the king?",
      steps:[
        "Read P and B.",
        "Bluff frequency with the queen: B / (P + B).",
        "Calling frequency with the king: (P − B) / (P + B)."
      ],
      tip:"Check with P = 2, B = 1: both are a third. Bigger bets mean more bluffs and fewer calls; at B = P, Y's king never needs to call." }
  ]
};

/* ---------------- stage 5: postflop strategy ---------------- */
var L_EQR = {
  id: "eqr", mode: "eqr", pass: 4, of: 5,
  title: "Equity realisation",
  sub: "Equity is not what you collect",
  gist: "Your equity assumes you see every card for free. You won't. Realisation is the share of it you actually take home.",
  blocks: [
    { t:"p", x:"Equity answers: if all the cards came out now with no more betting, how often would you win? Real hands have more betting. Out of position you will sometimes be bet off the best hand, or face a bet you can't call with a draw that was going to get there. In position you do the reverse to them." },
    { t:"rule", x:"realised equity = R × equity\ncall ⇔ R × equity > price", note:"R is the realisation factor. In position it is often above 1: you collect more than your raw share. Out of position, with a weak or drawing hand, it can be 0.6 to 0.8. Solvers estimate it; Acevedo's Modern Poker Theory uses it to explain why the same equity defends differently from different seats." },
    { t:"tbl", head:["Situation","Typical R"], rows:[
      ["In position, strong hand","1.05–1.15"],
      ["In position, medium hand","0.9–1.0"],
      ["Out of position, medium hand","0.75–0.9"],
      ["Out of position, weak draw","0.6–0.75"]
    ], caption:"Rough bands, not constants. Suited and connected hands realise better than offsuit disconnected ones, because they make hands that can keep calling." },
    { t:"ex", title:"Worked example",
      facts:[["Pot odds","25%"],["Your equity","28%"],["Position","out of position, R ≈ 0.8"]],
      steps:[
        "Raw equity 28% beats the 25% price. On pot odds alone, this is a call.",
        "Realised equity: 0.8 × 28% = 22.4%.",
        "22.4% < 25%: fold. Equivalently, you need 25% / 0.8 = 31% raw equity."
      ],
      bar:{ fill:22.4, tick:25, fillLabel:"realised 22.4%", tickLabel:"price 25%" },
      punch:"This is why the big blind can defend wide against a button open but the small blind, out of position against everyone, should mostly 3-bet or fold." },
    { t:"key", x:"You collect R × equity, not equity. Out of position R is below 1, so you need price / R raw equity to call. In position you can call a little lighter." },
    { t:"how", drill:"Realisation", ask:"The raw equity you need, or call/fold once realisation is counted.",
      steps:[
        "Compute the price: call / (pot + call).",
        "Divide by R to get the raw equity you need, or multiply your equity by R to get what you realise.",
        "Compare with the price."
      ],
      tip:"Dividing by 0.8 adds a quarter: a 24% price becomes 30%. Dividing by 0.9 adds about a ninth." }
  ]
};

var L_CBET = {
  id: "cbet", mode: "cbet", pass: 4, of: 5,
  title: "Continuation bets",
  sub: "Betting the flop after raising preflop",
  gist: "Small c-bets need few folds. Range and nut advantage decide how often and how big.",
  blocks: [
    { t:"p", x:"The preflop raiser usually has the stronger range on the flop: they chose to raise, the caller chose only to call. Betting again on the flop, a continuation bet, uses that edge. With no hand at all it is a bluff, and the fold-equity maths applies directly." },
    { t:"rule", x:"pure bluff profits ⇔ folds > bet / (pot + bet)\nEV = folds × pot − calls × bet", note:"A third-pot c-bet needs 25% folds. A pot-size c-bet needs 50%. Real c-bets also have equity when called, so they need even less." },
    { t:"tbl", head:["C-bet size","Folds needed for a pure bluff"], rows:[
      ["25% pot","20%"],["33% pot","25%"],["50% pot","33%"],["75% pot","43%"],["100% pot","50%"]
    ], caption:"The same table as fold equity in Stage 1, because it is the same formula. Cheap bets need few folds; that is the whole case for small c-bets." },
    { t:"p", x:"How often and how big depends on two properties of the board. Range advantage: whose whole range has more equity here? Nut advantage: who holds more of the very best hands? A dry ace-high board favours the raiser on both, so solvers bet small with almost everything. A low connected board favours the caller, who has more of the two pairs and straights, so the raiser checks much more." },
    { t:"ex", title:"Worked example",
      facts:[["Pot","$60"],["C-bet","$20 (a third)"],["They fold","35%"]],
      steps:[
        "Break-even folds: $20 / ($60 + $20) = 25%.",
        "EV of the bluff: 35% × $60 − 65% × $20 = $21 − $13 = +$8.",
        "It profits even if your hand could never win when called."
      ],
      bar:{ fill:35, tick:25, fillLabel:"they fold 35%", tickLabel:"break-even 25%" },
      punch:"The same bet at pot size would need 50% folds. Against someone who folds 35%, the small bet profits and the big one loses." },
    { t:"key", x:"A c-bet bluff needs folds > bet / (pot + bet). Bet small and often where you have range and nut advantage; check more on boards that favour the caller." },
    { t:"how", drill:"C-bets", ask:"Is the c-bet bluff profitable, or what is its EV?",
      steps:[
        "Break-even folds: bet / (pot + bet).",
        "Compare the fold rate you are given with it: above, bet; below, check.",
        "For EV: folds × pot − calls × bet."
      ],
      tip:"Third pot, 25%. Half pot, 33%. Pot, 50%. The drill gives a pure bluff, so there is no equity to add." }
  ]
};

var L_GEO = {
  id: "geo", mode: "geo", pass: 4, of: 5,
  title: "Geometric bet sizing",
  sub: "Getting the stacks in on time",
  gist: "To be all-in by the river, bet the same fraction of the pot each street. The fraction follows from the SPR.",
  blocks: [
    { t:"p", x:"With a strong hand and a polarised range you want the most money in by the river. Bet too small early and you can't get the stacks in; bet too big early and you fold out the hands that would have paid. The answer from Chen and Ankenman's multi-street games is to bet the same fraction of the pot on every street." },
    { t:"rule", x:"f = [(1 + 2 × stack / pot)^(1/n) − 1] / 2", note:"Each bet of f times the pot, once called, multiplies the pot by (1 + 2f). Going all-in after n streets means pot × (1 + 2f)^n = pot + 2 × stack. Solve for f." },
    { t:"tbl", head:["Stack / pot (SPR)","One street","Two streets","Three streets"], rows:[
      ["1","100%","37%","22%"],
      ["4","400%","100%","54%"],
      ["6.5","650%","137%","71%"],
      ["13","1,300%","210%","100%"]
    ], caption:"At SPR 13, a normal single-raised pot at 100 bb, three pot-size bets exactly get it in. At SPR 4, two pot-size bets do." },
    { t:"ex", title:"Worked example",
      facts:[["Pot on the flop","10 bb"],["Stack behind","90 bb"],["Streets","3"]],
      steps:[
        "stack / pot = 9, so 1 + 2 × 9 = 19.",
        "19^(1/3) = 2.668. f = (2.668 − 1) / 2 = 0.83.",
        "Bet 83% of the pot on the flop, turn and river: 8.3 bb into 10, 22.3 bb into 26.7, 59.4 bb into 71.2. All in."
      ],
      punch:"Three bets of 83% put 90 bb in; three bets of a third would put in only about 18 bb. Size is how you choose the final pot." },
    { t:"key", x:"f = [(1 + 2·SPR)^(1/n) − 1] / 2. SPR 13 over three streets: pot, pot, pot. SPR 4 over two: pot, pot." },
    { t:"how", drill:"Geometric sizing", ask:"What fraction of the pot, every street, gets the stacks in by the river?",
      steps:[
        "Compute 1 + 2 × stack / pot.",
        "Take the n-th root, where n is the number of streets left: square root for two, cube root for three.",
        "Subtract 1 and halve. Enter it as a percent of the pot."
      ],
      tip:"Anchor on the table: 1 + 2·SPR equal to 3 (one street), 9 (two streets) or 27 (three streets) means pot-size bets. With one street left the answer is just the SPR. Graded within a few points." }
  ]
};

var L_MULTI = {
  id: "multi", mode: "multi", pass: 4, of: 5,
  title: "Bluffing across streets",
  sub: "Why the turn carries more bluffs than the river",
  gist: "Some turn bluffs give up on the river. So the turn needs its own bluffs plus the river's.",
  blocks: [
    { t:"p", x:"Alpha tells you the bluff share of a single bet. Over two streets something new happens: some hands bet the turn as a bluff and then give up on the river. They still count as bluffs on the turn. So the turn range must hold more bluffs than the river range." },
    { t:"p", x:"Work it out with the same indifference argument as alpha. Your opponent holds a bluff catcher and calls your turn bet. Then either you give up, and they win the pot, or you bet the river, where your range is balanced so their call is worth nothing extra. For their turn call to be break-even, you must give up on the river with exactly alpha of your turn range." },
    { t:"rule", x:"turn bluffs = α_t + (1 − α_t) × α_r\nα = b / (1 + 2b)", note:"b is the bet as a fraction of the pot. α_t of the turn range gives up on the river, and α_r of the rest bluffs the river. This is the two-street version of the Mathematics of Poker's multi-street clairvoyance game." },
    { t:"ex", title:"Worked example: pot, then pot",
      steps:[
        "α for a pot-size bet is 1 / 3.",
        "Turn bluffs = 1/3 + (2/3) × (1/3) = 5/9 ≈ 56%.",
        "Of every 9 turn bets: 4 value hands, 2 bluffs that fire again on the river, and 3 that give up.",
        "On the river the 4 value and 2 bluffs are 1/3 bluffs, exactly α. ✓"
      ],
      bar:{ fill:55.6, tick:33.3, fillLabel:"turn bluffs 56%", tickLabel:"river bluffs 33%" },
      punch:"If your turn bets are as value-heavy as your river bets, you are under-bluffing the turn, and a good opponent folds every bluff catcher to your turn bets." },
    { t:"warn", x:"The model assumes bluffs never win at showdown and value always does. Real draws improve, which lets them bluff the turn more cheaply, but the direction holds: more bluffs early, fewer late." },
    { t:"key", x:"Turn bluffs = α_t + (1 − α_t) × α_r. Pot then pot: 56% bluffs on the turn, 33% on the river. Earlier streets carry more bluffs." },
    { t:"how", drill:"Two-street bluffing", ask:"With these turn and river sizes, what share of turn bets should be bluffs?",
      steps:[
        "Alpha for each size: b / (1 + 2b). Half pot 25%, three quarters 30%, pot 33%.",
        "Turn bluff share = α_turn + (1 − α_turn) × α_river.",
        "Enter as a percent."
      ],
      tip:"It is always above both alphas: you are adding the river bluffs on top of the give-ups." }
  ]
};

/* ---------------- stage 6: tournaments ---------------- */
var L_JAM = {
  id: "jam", mode: "jam", pass: 4, of: 5,
  title: "Push or fold",
  sub: "Short stacks, one decision",
  gist: "With 15 big blinds or fewer, the best play is often all-in or fold. It is a pure EV sum.",
  blocks: [
    { t:"p", x:"In tournaments, blinds rise and stacks get short. Below about 15 big blinds there is no room for a raise and a fold on the flop; the cleanest strategy is to move all-in or fold. That makes each decision one EV sum with two branches." },
    { t:"rule", x:"EV(jam) = folds × pot + calls × (equity × final pot − what you add)", note:"Measured against folding. Pot is what is already in the middle: blinds and antes, your own small blind included. What you add is your stack minus what you had already posted." },
    { t:"ex", title:"Worked example: 10 bb from the small blind",
      facts:[["Your stack","10 bb, SB posted"],["Pot","1.5 bb"],["BB calls","25% of hands"],["Your equity when called","40%"]],
      steps:[
        "You add 10 − 0.5 = 9.5 bb. Final pot if called: 20 bb.",
        "Fold branch: 75% × 1.5 = 1.125 bb.",
        "Call branch: 25% × (40% × 20 − 9.5) = 25% × (−1.5) = −0.375 bb.",
        "EV = +0.75 bb. Shove."
      ],
      punch:"You lose when called, on average, and the shove is still clearly profitable. The folds pay for it. That is fold equity at its purest." },
    { t:"p", x:"Sklansky and Chubukov asked the most pessimistic version: what if the big blind saw your cards and called only when ahead? The stack size at which a hand is still a profitable shove even then is its Sklansky–Chubukov number. Real opponents can't see your cards, so real shoving ranges, the Nash push/fold charts, are far wider." },
    { t:"key", x:"EV(jam) = folds × pot + calls × (equity × final pot − added). Short stacks, wide shoves: the folds you collect pay for the times you are called and behind." },
    { t:"how", drill:"Push or fold", ask:"EV of shoving from the small blind, or simply shove or fold.",
      steps:[
        "Pot: 1.5 bb plus any antes. Added: your stack minus 0.5. Final pot if called: twice your stack plus antes.",
        "Fold branch: fold rate × pot. Call branch: call rate × (equity × final pot − added).",
        "Add them. Positive means shove."
      ],
      tip:"The call branch is usually a small loss. The question is whether the fold branch covers it." }
  ]
};

var L_ICM = {
  id: "icm", mode: "icm", pass: 4, of: 5,
  title: "ICM",
  sub: "Chips are not money",
  gist: "In a tournament your chips convert into prize money non-linearly. Chips you lose cost more than chips you win are worth.",
  blocks: [
    { t:"p", x:"In a cash game a chip is worth its face value. In a tournament it isn't. If you win every chip you get first prize, not the whole prize pool; if you lose them all you get nothing, but you may already have locked in a payout by outlasting others. The Independent Chip Model, ICM, turns stacks into dollar equity." },
    { t:"rule", x:"P(1st) = your stack / total chips\nP(2nd) = Σ_j P(j wins) × your stack / (total − stack_j)\n$EV = Σ prize_k × P(finish k)", note:"This is the Malmuth–Harville model: the chance you finish in a place is proportional to your share of the chips still left in contention. Apply it recursively for lower places." },
    { t:"ex", title:"Worked example",
      facts:[["Stacks","A 5,000 · B 3,000 · C 2,000"],["Prizes","$50 · $30 · $20"]],
      steps:[
        "A wins 50%. A is second if B wins then A beats C (30% × 5/7) or C wins then A beats B (20% × 5/8): 21.4% + 12.5% = 33.9%.",
        "A finishes third 100% − 50% − 33.9% = 16.1%.",
        "A's equity = $50 × 50% + $30 × 33.9% + $20 × 16.1% = $38.4.",
        "A holds 50% of the chips but only 38.4% of the money."
      ],
      bar:{ fill:38.4, tick:50, fillLabel:"A's ICM equity $38.4", tickLabel:"chip share $50" },
      punch:"Because big stacks are worth less than their chips and short stacks more, doubling up gains less than busting loses. Near the money you should call all-ins tighter than chip EV says." },
    { t:"warn", x:"ICM ignores skill and future blind levels. It is the standard for final-table decisions and deal-making, and a good first approximation elsewhere." },
    { t:"key", x:"ICM turns chips into dollars: finish probabilities from stack shares, weighted by prizes. Big stacks are worth less than their chips, short stacks more. Near the money, risk less." },
    { t:"how", drill:"ICM", ask:"A player's ICM equity in dollars, three players left.",
      steps:[
        "P(1st) = stack / total.",
        "P(2nd): for each other player j, P(j wins) × stack / (total − stack_j), summed.",
        "With three players, P(3rd) is whatever is left. Multiply by the prizes and add."
      ],
      tip:"Sanity check: the answer lies between the chip share of the prize pool and an even split. Graded within a few percent." }
  ]
};

/* where each new lesson sits: inserted before the named existing lesson, or appended to a new stage */
var NEW_LESSONS = {
  rules: L_RULES, seats: L_SEATS, prob: L_PROB, ev: L_EV, rfi: L_RFI, threebet: L_3BET, spr: L_SPR,
  akq: L_AKQ, eqr: L_EQR, cbet: L_CBET, geo: L_GEO, multi: L_MULTI, jam: L_JAM, icm: L_ICM
};
