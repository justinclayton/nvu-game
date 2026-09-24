# Playtest 6: Stuff stays in the deck

Recorded 2026-09-24. Rules version: 0.2.4. Played by an agent standing in for a human playtester,
in the CLI (`bin/nvu`), seed 6, one shell call per decision. No seed was given; 6 follows the
earlier runs' habit of seed equals playtest number. The run cleared six floors in twenty turns and
ended in Defeat on turn 25, floor 7: Red went Down at Turn Start with two cards left to draw from,
after four Flees in the last six turns, three of them with no line in reach.

This is the first run under rules 0.2.3, where Stuff stays in the deck until Scrapped or Exhausted
and there is no Settle your Stuff, and under 0.2.4, where `any deck` on a card means any face-down
pile on the table. The card list is the proposed list as adopted in playtest 5, with the Stuff
counts the designer asked for (Fine Good Stuff ×3, Cool ×2, Woah ×1, every Bad Stuff ×2). The
engine work for both rulings was done by separate agents before this run.

Notes are the agent's, verbatim, tagged `[agent]`, in the order they were written into the run.
Nothing here is a ruling. Suspected bugs were checked against `design/rulebook.md` and
`design/cards.yaml` only; the engine was not read.

## How the run went

Floor 1 was six cards, not ten: band 1 holds five Rooms and a Stairwell (note 1). Security
Turnstile opened it and Red took the Oomph 5 line for Duct Tape & Wire at an Exhaust each (log 21).
The second Turnstile fell to Scramble 3 for nothing, and Flooded Ventilation Shaft paid Gray Riot
Shield for meeting both of its lines. That turn Gray played Peek Around Corner on the Floor deck
and saw The Sentry Drone coming (log 60, note 2). The Drone was then Fled by the playtester's own
shell mistake (note 3): an Exhaust each and Panic for Red. The Shaft came round again for Emergency
Power Core, and on turn 6 the Drone fell to Oomph 8 only because Gray spent that Power Core's two
Exhausts (note 4). Both characters ended the floor at twelve live cards, where they started.

Floor 2 was two cards and floor 3 was one (notes 5, 6): cleared Rooms leave the band for good, and
band 1 had five. The Turnstile fell to Scramble 3, the Drone to Scramble 9 for an Ascend and a
Cutting Torch (log 198), and on floor 3 the Drone alone fell to Junk Launcher plus that Torch. Hack
the Doors, taken at floor 2's Ascend, went straight onto the Good Stuff pool and put A Pair Of
Stitch-Em-Ups on top (log 235). Three floors took nine turns.

Floor 4 was a full seven cards. Overgrown Hydroponics Bay was cleared at Scramble 6 for a Bad Stuff
each: Corrosive Acid for Red, Torn Seal for Gray (logs 279, 281). Pressurized Maintenance Hub paid
Red Reckless Swing. Gears & Glitch came third, with Panic back in Red's hand, and fell to Oomph 8
and Scramble 7 at three Red Exhausts, two of them Overdrive taking Second Wind and Tag Team (logs
335, 336). On that turn Hack the Doors set Gray's reward pool so Hit 'n Run was the room reward,
and Catch Your Breath put the milder of two Bad Stuff cards on top of that pool (logs 340, 344,
note 7).

Floor 5 was six cards and the run's best stretch: six rooms in six turns, every one cleared.
Automated Defense Turret fell to Oomph 12, Hydroponics to Scramble 7 for two more Bad Stuff, the
second Turret to Oomph 10 with Sluggish held so it could be Scrapped (log 446), the Hub to both
lines for Heavy Pockets and Covering Fire, the third Turret to Scramble 8, and Gears & Glitch to
Oomph 10 and Scramble 7. Gray grew from thirteen live cards to twenty-one. Red stayed at fourteen:
Corrosive Acid fired at four Turn Starts (logs 294, 399, 465, 543) and Red's reward pool ran dry.
The two Bad Stuff draws on this floor also showed that ordering a Stuff pool does not decide what
is gained next (notes 9, 10).

Floor 6 was Gears & Glitch alone. The opening hands could not reach either line, so the turn was
a forced Flee at three Exhausts each plus System Feedback for Red (note 11, log 600). The next
hand reached Oomph 13 and Ascended; Red took the last card in his reward pool.

Floor 7 flipped The Iron Sentinel first (note 12): four Exhausts each and a Bad Stuff each. Red was
at nine cards. Smoldering Armory fell to Oomph 10 for an Overcharged Battery (log 713), with Junk
Launcher counting Charge In's payers on the way (note 13). Laser Grid Security Hall needed Scramble
14 or Oomph 18 and was Fled twice in a row, the second time only survivable by paying three cards
into the discard first (notes 14, 15). At turn 25's Turn Start Red drew his last two cards and the
third draw of "draw up to five" was Down (log 773).

Live cards (deck, discard and hand together) at each Ascend:

| Ascend | Turn | Red | Gray |
|---|---|---|---|
| Floor 1 | 6 | 12 | 10 |
| Floor 2 | 8 | 13 | 12 |
| Floor 3 | 9 | 14 | 13 |
| Floor 4 | 12 | 14 | 16 |
| Floor 5 | 18 | 14 | 21 |
| Floor 6 | 20 | 11 | 19 |
| End | 25 | 0 | 10 |

Where Red's 26 Exhausts came from: Flee lines 16, Overdrive 4, Corrosive Acid 4, Reckless Swing 1,
the turn 1 Turnstile 1; Second Wind returned one. Gray's 19: Flee lines 16, Emergency Power Core 2,
the Turnstile 1; Hit 'n Run returned two. Fifteen of each side's Flee Exhausts came in turns 19 to
24.

## Notes

1. **Floor 1 built with 6 rooms, not the rulebook's 10.** `[agent]` (log 13)

   > Floor 1 built with 6 rooms, not the rulebook's 10. Band 1 holds five Room copies (Security
   > Turnstile x3, Flooded Ventilation Shaft x2) plus one Stairwell, so the pool runs short. The
   > rulebook's Floor deck step says to draw Rooms until the deck holds the floor's count and does
   > not say what to do when the band runs out. Question for the designer: is a short floor the
   > intended result, or should the band be padded some other way? Shape note: floors 1 to 3 will
   > each be six rooms on this list.

   Checked against the rulebook, Setup, Floor deck: "Take Room cards at random from the same band
   until the deck holds this floor's count." Nothing covers a band with fewer Rooms than the count.
   Playtest 5 saw the same short floor and issue #151 records the counts. The question stands as
   written.

2. **Peek Around Corner offered all seven face-down piles.** `[agent]` (log 71)

   > Peek Around Corner offered all seven face-down piles, as the any-deck ruling says, and I
   > peeked the Floor deck: The Sentry Drone is next. Knowing the Stairwell is coming while both
   > hands are spent changes nothing this turn, but it is the first time a Scramble 1 starter has
   > felt worth its cost. Shape note: with six-room floors and a Peek, the Stairwell is rarely a
   > surprise.

   The prompt listed Red deck, Gray deck, Floor deck, both reward pools and both Stuff pools, and
   the Floor deck honoured the peek (log 60, then log 72). The Floor deck and the reward pools
   behaved as ordered piles every time they were looked at.

3. **I Fled The Sentry Drone by accident.** `[agent]` (log 95)

   > I Fled The Sentry Drone by accident. I meant to play Pick The Lock paying with Riot Shield,
   > but the lock costs 2 and Gray held only one other card, so the play was refused; my shell
   > chain then ran end anyway, at Scramble 4 against 8. Undo was refused because the Flee
   > revealed Panic, which is the right guard. The Flee cost both of us an Exhaust and put Panic
   > in Red's hand: Holding, every threshold needs +2 Scramble. Continuing; the mistake is mine,
   > not the tool's.

   A refused move exits 1; piping the output through `head` hid that and the chained `end` ran.
   The tool did nothing wrong. The mistake cost two Exhausts, a Bad Stuff card and one turn, and
   Panic then shaped turns 5, 12, 17 and 19.

4. **Floor 1 cleared on turn 6, on the Stairwell's second visit.** `[agent]` (log 145)

   > Floor 1 cleared on turn 6, on the Stairwell's second visit, and only because Gray spent
   > Emergency Power Core: a Woah Good Stuff that is Oomph 3 and Scramble 3 for free but Exhausts
   > 2. Under no-rent gaining it was +1 Stamina and playing it is -2, so it is a card you hold as
   > deck weight until a Stairwell is on the line. Both characters are at 12 live cards, where
   > they started: two Exhausts each, two Stuff each.

   Two starter hands make Oomph 8 only with Charge In twice, which needs four payers from a hand
   of five. Every Drone clear in this run used a non-starter card. Playtest 5's finding that the
   greedy bot loses floor 1 in every seed still holds: 0 of 20 this branch.

5. **Floor 2 is built with 2 rooms.** `[agent]` (log 164)

   > Floor 2 is built with 2 rooms. Rulebook, Build the next floor: cleared rooms, the Stairwell
   > included, stay on the Rooms pile, so the five band-1 Rooms I cleared on floor 1 are gone
   > from the band for good. Band 1 had five Room copies and three Sentry Drones; after floor 1 it
   > holds one Turnstile and two Drones, so floor 2 is two cards and floor 3 will be the Stairwell
   > alone. Question for the designer: is a band meant to drain across its three floors like this,
   > or should cleared Rooms return to the band at Build the next floor while cleared Stairwells
   > stay out? Shape note: the run is shrinking to one Stairwell fight per floor by floor 3.

   Checked against the rulebook, Ascending, step 3: "Return every room still in the floor deck,
   Fled rooms included, to its band's pool. Rooms you cleared, the Stairwell included, stay on the
   Rooms pile." The engine follows it. The consequence with five, seven and six Rooms per band is
   that floors 2, 3 and 6 were one or two cards. A question, not a bug.

6. **Floor 3 is the Stairwell alone.** `[agent]` (log 227)

   > Floor 3 is the Stairwell alone: one card, flipped on turn 9. Shape note, same cause as the
   > last note.

   Same cause as note 5. Floor 6 was the same shape (note 11).

7. **Floor 4 cleared on turn 12 with four rooms still in the floor deck.** `[agent]` (log 357)

   > Floor 4 cleared on turn 12 with four rooms still in the floor deck: Gears & Glitch came third,
   > and once a Stairwell is flipped you either Ascend or Flee it, so the rest of the floor is
   > skipped. Panic in Red's hand printed the Oomph 12 line as Oomph 12 and Scramble 2, which the
   > card text supports (every threshold needs +2 Scramble). Paying for Reckless Swing with Panic
   > lifted it. Overdrive's Exhaust 2 took Second Wind and Tag Team, Red's two best rewards: blind
   > Exhausts off a deck that now holds rewards and Stuff cost more than they did on floor 1. Hack
   > the Doors on Gray's reward pool put Hit 'n Run on top for the room reward, and Catch Your
   > Breath put the milder Bad Stuff on top of that pool; both are real plays under the any-deck
   > ruling.

   Panic reads "Every room threshold requires +2 Scramble to be met", so a pure Oomph line gaining
   a Scramble 2 half matches the text. The reward pool reorder worked: Hit 'n Run was the room
   reward (log 347). The Bad Stuff pool reorder did not (note 9). Under no-rent an Exhaust is a
   loss of whatever the deck holds, and by floor 4 that includes the rewards.

8. **Corrosive Acid was drawn during this Turn Start's draw and its Holding line fired at once.**
   `[agent]` (log 400)

   > Corrosive Acid was drawn during this Turn Start's draw and its Holding line (At Turn Start,
   > Exhaust 1) fired at once: Red Exhausted Charge In in the same Turn Start. Rulebook, Draw up
   > to five: resolve effects triggered by these draws after both players have drawn. Question for
   > the designer: does a Holding effect that says At Turn Start apply when the card arrives in
   > hand during that Turn Start's draw, or only on a Turn Start it was already held through?
   > Under no-rent this card is the run's first real tax: it Exhausts 1 every Turn Start it is in
   > hand, and the only way out is a Scrap.

   The rulebook defines Holding as "a passive effect that applies while the card is in your hand"
   and says draw-triggered effects resolve after both players have drawn. It does not say whether
   an "At Turn Start" effect that becomes active during Turn Start fires in that same Turn Start.
   The engine says yes: logs 394 and 399, 457 and 465, 540 and 543 are the draw and the Exhaust in
   the same Turn Start. Four Exhausts over the run came from this card. A question for the
   designer.

9. **Suspected engine mismatch: the Bad Stuff pool.** `[agent]` (log 430)

   > Suspected engine mismatch. On turn 12 Catch Your Breath looked at the top 2 of the Bad Stuff
   > pool and I put them back as My Head Is Quantum Spinning, then Corrosive Acid; the tool
   > printed Ordered. No Bad Stuff left the pool until Hydroponics on turn 14, when Red got
   > Sluggish and Gray got Quantum Spinning. The rulebook has Stuff drawn from a face-down pool
   > and the any-deck keyword calls that pool a pile you can look at and reorder, so the next card
   > gained should have been the one I put on top. Either the reorder did not take, or the engine
   > draws Stuff at random from the pool rather than off the top. I set the Good Stuff pool on
   > turn 9 with A Pair Of Stitch-Em-Ups on top and nothing has left it since, so the next Good
   > Stuff gain will show which.

   The look is at log 344; the two gains are at logs 415 and 417, with the pool count at 15
   throughout. The rulebook: Stuff cards are "drawn face down from their matching pool" (glossary)
   and `any deck` is "any face-down pile on the table: a character deck, a reward pool, the Floor
   deck, or a Stuff pool" (Keywords). If a Stuff pool is a pile, its top card is the next one
   gained. Confirmed on the other pool in note 10.

10. **Confirmed from the other pool: Gray got Crowbar, not A Pair Of Stitch-Em-Ups.** `[agent]`
    (log 544)

    > Confirmed from the other pool: Gray got Crowbar from the Good Stuff pool, not A Pair Of
    > Stitch-Em-Ups, which Hack the Doors put on top on turn 9 with nothing leaving the pool
    > since. So reordering a Stuff pool does not decide the next Stuff gained. The Floor deck did
    > behave: Peek Around Corner showed The Sentry Drone and it flipped next. Question for the
    > designer, same as the last note: are the Stuff pools ordered piles a look-and-reorder effect
    > can set, as the any-deck keyword implies, or does gaining Stuff draw at random? Corrosive
    > Acid fired again this Turn Start, its third Exhaust in five turns; Red is at 13 live cards to
    > Gray's 21.

    The look is at log 235 (Overcharged Battery, A Pair Of Stitch-Em-Ups, High-Frequency Scanner,
    put back with Stitch-Em-Ups first), the gain at log 526, the pool at 24 cards between them.
    Two pools, two reorders, neither honoured; the Floor deck (log 60) and a reward pool (log 347)
    were. Either the engine gains Stuff at random or a Stuff pool reorder is not applied. Engine
    mismatch under the rulebook as written; if pools are meant to be random, that is a rulebook
    line to add and the `any deck` keyword to narrow.

11. **Floor 6 is Gears & Glitch alone and the opening hands cannot reach it.** `[agent]` (log 587)

    > Floor 6 is Gears & Glitch alone and the opening hands cannot reach it: Red holds Bull Rush,
    > Heavy Pockets, two Overdrives and Panic, Gray holds Peek, One Man's Junk, Duck Under, Torn
    > Seal and Work The Angles. Best case is Oomph 8 and Scramble 6 against 7 and 7, or Oomph 9
    > against 12. So the turn is a forced Flee: both Exhaust 3 and Red gets Bad Stuff, the largest
    > single loss of the run, with nothing to decide except which cards to cycle before it. Shape
    > note: once a band has drained to its Stairwell, a floor is one card, and a bad opening hand
    > costs six Stamina with no room to set up. I am playing the cheap cards to cycle both hands
    > and keeping one Overdrive.

    The Flee is at log 600. The rulebook, Outcome: "If no challenges have been met, the players
    must Flee." There is no third option on a Stairwell. On a one-card floor the hand you hold
    at the flip is the whole floor.

12. **Floor 7 flips The Iron Sentinel first, on a four-card floor.** `[agent]` (log 667)

    > Floor 7 flips The Iron Sentinel first, on a four-card floor: Oomph 10 and Scramble 10, or
    > Oomph 18. Red's hand tops out at Oomph 11 with Reckless's Exhaust 3, Gray's at Scramble 6, so
    > this is the second forced Flee in three turns: both Exhaust 4 and both get Bad Stuff. Red
    > goes from 12 live cards to 8 plus a Bad Stuff card. Every band 3 line is 10 or more on one
    > stat, and these decks make about Oomph 8 and Scramble 6 a turn, so band 3 is where the run
    > stops unless Good Stuff arrives. I am holding Red's hand so Red draws nothing next Turn
    > Start, and cycling Gray's.

    The Flee is at log 675. Band 3 lines on this list: 10 and 10, 14, 15, 16, 18, 18; the Vault's
    room rule (Scrap Good Stuff for +3) is the only help printed. The one band 3 room cleared was
    Smoldering Armory at Oomph 10 (log 713).

13. **Junk Launcher again (issue #144, seen the other way round).** `[agent]` (log 711)

    > Junk Launcher again (issue #144, seen the other way round). I played it first, paying two
    > cards, and the pool read Oomph 6 as printed. Then Charge In paid with two more cards and the
    > pool jumped to Oomph 14, not 10: the Launcher counted Charge In's payers too. Its text is
    > 'gains Oomph +2 for each card spent to play it this turn', so the two later cards should not
    > count. Oomph 10 is met either way, so I am not claiming the 16 line.

    Playtest 5 saw the Launcher count cards paid before it; this run shows it counting cards paid
    after it. Same cause as #144. The Armory's Oomph 16 line would have read as met if Gray had
    added two more; it was not attempted.

14. **Laser Grid Security Hall: Scramble 14 or Oomph 18.** `[agent]` (log 731)

    > Laser Grid Security Hall: Scramble 14 or Oomph 18. Gray's hand makes Scramble 8 at most,
    > Red's Oomph 8, so this is the third forced Flee since floor 6: both Exhaust 4. Red drops
    > from 10 live cards to 6. I am playing nothing so both hands stay at five and nobody draws at
    > the next Turn Start, where a short deck would be Down under the #146 ruling. Two rooms
    > remain in the floor deck: the Vault, which these hands can clear at Oomph 15 by Scrapping
    > Overcharged Battery for +3, or the Sentinel, which they cannot.

    The Flee is at log 732. Holding five cards to avoid the Turn Start draw is a real decision
    under #146 and the engine honoured it: no draw after log 745.

15. **Laser Grid shuffled back in and flipped straight back up.** `[agent]` (log 746)

    > Laser Grid shuffled back in and flipped straight back up. Same hands, same answer: Flee. Red
    > has one card in deck and none in discard, so Exhaust 4 is Down unless cards reach the
    > discard first. Paying moves cards to the discard at once, so I am playing Junk Launcher
    > paying with Shove and System Feedback, and Overcharged Battery paying with Fast Follow: three
    > payers plus the deck card is exactly the four. Red survives the Flee with nothing in deck or
    > discard and two cards in the play zone, and then draw up to five at the next Turn Start is
    > Down under #146. So this is the last decision of the run: whether Red goes Down on the Flee
    > or at Turn Start, one turn later.

    Logs 754 to 759: the Exhaust took the deck card, reshuffled the three payers, and took them.
    Log 773: Down on the third draw of turn 25's Turn Start, as #146 says. Paying is "move that
    number of cards from your hand to your discard pile" (rulebook, Play), so the timing is by the
    book.

## What the run showed

- **A band drains, and the drained floors are Stairwell fights with whatever you hold.** Cleared
  Rooms stay out of the band, and the bands hold five, seven and six Rooms, so floors 2, 3 and 6
  were one or two cards. A Stairwell flipped on a bad hand is a forced Flee at three or four
  Exhausts each. Fifteen of Red's twenty-six Exhausts came from four Flees in turns 19 to 24, and
  that is the whole story of the defeat (notes 5, 6, 11, 12, 14).
- **No rent grew the decks, but only Gray's.** Gray went from 12 live cards to 21 by floor 5 on
  Good Stuff, rewards and Hit 'n Run. Red stayed at 14: the Exhaust lines on this list mostly name
  Red or hit Red's own cards (Overdrive, Reckless Swing, Corrosive Acid, the Turnstile), Red's
  nine-card reward pool was empty by floor 6, and Bad Stuff for Red was the taxing kind. Deck
  bloat never registered in 25 turns: Bad Stuff was paid away the turn it was drawn, and the only
  Stuff that hurt was the one card that fires while held (note 8).
- **Band 3 is a wall at these numbers.** The decks made Oomph 8 to 12 and Scramble 6 to 9 a turn;
  band 3 prints 10 and 10, 14, 15, 16 and 18. One room in five was cleared. Playtest 5 ended on
  floor 8 the same way.
- **The any-deck ruling gave the run its best decisions**: Peek on the Floor deck, Hack the Doors
  on a reward pool to choose a room reward, Catch Your Breath on the Bad Stuff pool. The Stuff
  pools did not honour the order (notes 9, 10), so two of those decisions did nothing.

## The CLI as a playtest tool

- **A Stuff pool reorder leaves no trace in the transcript.** The look prints ("A look at the Bad
  Stuff pool: ...", log 344) but the order chosen does not, so a reader of the appendix cannot see
  what notes 9 and 10 claim was put on top. Print the order as an event.
- **`bin/nvu card` refuses Room names.** Only character and Stuff cards are eligible, so every
  room's text had to be read from `cards.yaml` by hand.
- **A "may" outcome with nothing to choose still asks.** "Who may Scrap a Bad Stuff card from
  their hand?" on the first Turret (log 384) when neither of us held one, with no way to say
  nobody; answering Red did nothing. Same shape as playtest 5's finding.
- Things that worked: the pile prompt listing all seven piles in one line; "(printed N)" on the
  lines Panic raised, including a pure Oomph line gaining a Scramble half; "A look at the X: ..."
  as one line; "Floor N is built: K rooms." on the first line of every floor; the refusal that
  stopped a chain once `pipefail` was set; undo refusing after a reveal.

Two friction points were the playtester's own: a chain of moves piped through `head` ran `end`
after a refused play (note 3), and Pick The Lock's cost was miscounted twice against a hand of two.
`set -o pipefail` fixed the first for the rest of the run.

## Candidate issues

Engine mismatches, suspected:

- Reordering a Stuff pool does not decide the next Stuff gained: two reorders, on both pools,
  and neither top card was the next one drawn (notes 9, 10; logs 235, 344, 415, 417, 526). The
  Floor deck and the reward pools honour a reorder. Either the pools are gained at random or the
  reorder is not written back.
- Junk Launcher counts cards paid for later cards this turn (note 13; issue #144, the other
  direction).
- The "one of you may Scrap" prompt asks when nobody can (log 384). Minor.

Rulebook questions for the designer:

- What builds a floor when the band holds fewer Rooms than the floor's count? (note 1)
- Are cleared Rooms meant to leave the band for the rest of the game, so that a band of five
  Rooms gives a two-card floor 2 and a one-card floor 3? (notes 5, 6, 11)
- Does a Holding effect that says "At Turn Start" fire when the card is drawn during that Turn
  Start? (note 8)
- Are the Stuff pools ordered piles a look-or-reorder effect can set, as `any deck` now says, or
  is Stuff gained at random? (notes 9, 10)

Shape, independent of tuning:

- A Stairwell flipped on a floor with no other cards is decided by the opening hand; there is no
  Flee-and-set-up, because Fleeing a Stairwell is the same cost as losing to it and the card comes
  straight back (notes 11, 12, 15).
- Flee lines of three and four Exhausts each on rooms whose lines are out of reach are not a
  decision; from floor 6 on every Flee was forced (notes 11, 12, 14, 15).
- Under no rent, Stamina growth goes to whoever the Good Stuff and heal lines name. On this list
  they mostly name Gray, and the Exhaust lines mostly name Red.
- Red's nine-card reward pool was taken in full by turn 20; Gray's ten had two left. Every reward
  was taken, because under no rent a card is a card.

Card observations, inputs for a later re-tune:

- Corrosive Acid Exhausted four cards in eight turns and is the only Bad Stuff that hurt; Torn
  Seal, Faceful Of Slime, My Head Is Quantum Spinning and System Feedback were paid away for
  nothing. Sluggish was Scrapped on the one Turret line that allows it (log 446).
- Emergency Power Core won floor 1 and was otherwise a payer. Free 3 and 3 for two Exhausts is a
  card you play once.
- Riot Shield returned to hand four times (logs 203, 419, 528, 564) and
  is again the best Stuff on the list.
- Junk Launcher (Oomph 6 for two payers as printed), Cutting Torch (5 for two) and Fast Follow (3
  for none, three plays) carried band 2. Hack the Doors is Scramble 3 for one payer plus a peek.
- Overdrive's two plays Exhausted Second Wind, Tag Team, Corrosive Acid and Heavy Pockets: a
  blind Exhaust off a deck full of rewards is a bad trade, and the one time it took a Bad Stuff
  card was the best thing it did.
- Lean In was never played: Exhausted on turn 1 (log 25), returned by Second Wind, paid as a cost,
  Exhausted again. Work The Angles was played twice, both times for the last Oomph a Stairwell
  needed (logs 136, 639), and paid three times.
- Hit 'n Run healed two cards, Second Wind one before Overdrive Exhausted it. The heals are the
  only Stamina Red can buy on this list, and Red's reward pool held one.

CLI improvements:

- Print a reorder as a transcript event.
- Let `bin/nvu card` print a Room.
- Skip a "may" question with no legal target.

## Answers for the design consultant

The designer's consultant asked four questions of this run. Answers from one run and the bot,
not from a sample.

1. **Dual-stat starters.** Lean In and Work The Angles were payers, not plays, in band 1. Lean In
   was never played across 25 turns. Work The Angles was played twice, each time because a
   Stairwell was exactly one Oomph short (logs 136, 639). A 1 and 1 for one payer is the weakest
   card in either hand, and it is only worth playing when the pool is one short on the stat the
   other character lacks.
2. **Band transition.** Band 1 lines were met by starters plus one Stuff card (Emergency Power
   Core on the floor 1 Stairwell). From floor 4 every clear used at least one reward or Stuff card
   (Cutting Torch, Junk Launcher, Fast Follow, Distract & Pivot, Emergency Power Core) and the
   starters were the payers. So the tipping point is real and it lands on floor 4. There is no win
   rate to report: one run, and the greedy bot loses floor 1 in 20 of 20 seeds on this branch.
3. **Stamina and Down.** Band 1 cost two Exhausts each over six turns, not counting the
   playtester's own Flee. Band 2 cost Red nine, all from his own cards (Overdrive, Reckless Swing,
   Corrosive Acid), while Gray gained seven cards net. Band 3 and the one-card floor 6 cost each
   character fifteen in six turns, all from Flee lines on rooms that could not be met. That is not
   pressure; it is a cliff, and the same cliff ended playtest 5 on floor 8. Premature failure in
   band 1 is the bot's problem, not this run's.
4. **Reward pick rates.** Every reward offered was taken, because under no rent a card is a card.
   They did feel like spikes over the starters' two-for-one: Fast Follow at three for nothing,
   Junk Launcher at six for two, Tag Team and One Man's Junk at four for one, Hack the Doors at
   three for one plus a peek, Second Wind and Hit 'n Run as the only heals. The limit was not the
   rate but the pool: Red's nine cards were gone by floor 6.

## Appendix: the run transcript

`bin/nvu replay design/playtests/06-stuff-stays.json`, verbatim.

```
  1. Floor 1 is built: 6 rooms.
  2. You are in: Security Turnstile.
  3. Red draws Shove.
  4. Red draws Charge In.
  5. Red draws Charge In.
  6. Red draws Shove.
  7. Red draws Charge In.
  8. Gray draws Duck Under.
  9. Gray draws Duck Under.
 10. Gray draws Pick The Lock.
 11. Gray draws Work The Angles.
 12. Gray draws Pick The Lock.
 13. NOTE — Floor 1 built with 6 rooms, not the rulebook's 10. Band 1 holds five Room copies (Security Turnstile x3, Flooded Ventilation Shaft x2) plus one Stairwell, so the pool runs short. The rulebook's Floor deck step says to draw Rooms until the deck holds the floor's count and does not say what to do when the band runs out. Question for the designer: is a short floor the intended result, or should the band be padded some other way? Shape note: floors 1 to 3 will each be six rooms on this list.
 14. Red discards Charge In from their hand.
 15. Red discards Shove from their hand.
 16. Red pays with Charge In, Shove.
 17. Red plays Charge In.
 18. Red discards Charge In from their hand.
 19. Red pays with Charge In.
 20. Red plays Shove.
 21. Oomph 5 met — Clear, and Red gets Good Stuff, but both of you Exhaust 1.
 22. Security Turnstile is Cleared.
 23. Red gets Duct Tape & Wire.
 24. Red takes Duct Tape & Wire into hand.
 25. Red Exhausts Lean In.
 26. Gray Exhausts Duck Under.
 27. Cleanup.
 28. Red discards Charge In from their play zone.
 29. Red discards Shove from their play zone.
 30. — end of turn 1 —
 31. You are in: Security Turnstile.
 32. Red draws Overdrive.
 33. Red draws Charge In.
 34. Red draws Shove.
 35. Red draws Overdrive.
 36. Gray discards Duck Under from their hand.
 37. Gray discards Duck Under from their hand.
 38. Gray pays with Duck Under, Duck Under.
 39. Gray plays Pick The Lock.
 40. Scramble 3 met — Clear.
 41. Security Turnstile is Cleared.
 42. Cleanup.
 43. Gray discards Pick The Lock from their play zone.
 44. — end of turn 2 —
 45. You are in: Flooded Ventilation Shaft.
 46. Gray draws Pick The Lock.
 47. Gray draws Pick The Lock.
 48. Gray draws Peek Around Corner.
 49. Red discards Overdrive from their hand.
 50. Red discards Overdrive from their hand.
 51. Red pays with Overdrive, Overdrive.
 52. Red plays Charge In.
 53. Gray discards Pick The Lock from their hand.
 54. Gray discards Pick The Lock from their hand.
 55. Gray pays with Pick The Lock, Pick The Lock.
 56. Gray plays Pick The Lock.
 57. Gray discards Work The Angles from their hand.
 58. Gray pays with Work The Angles.
 59. Gray plays Peek Around Corner.
 60. A look at the Floor deck: The Sentry Drone.
 61. Scramble 4 met — Clear.
 62. Oomph 3 and Scramble 3 met — Clear, and Gray gets Good Stuff.
 63. Flooded Ventilation Shaft is Cleared.
 64. Gray gets Riot Shield.
 65. Gray takes Riot Shield into hand.
 66. Cleanup.
 67. Red discards Charge In from their play zone.
 68. Gray discards Pick The Lock from their play zone.
 69. Gray discards Peek Around Corner from their play zone.
 70. — end of turn 3 —
 71. NOTE — Peek Around Corner offered all seven face-down piles, as the any-deck ruling says, and I peeked the Floor deck: The Sentry Drone is next. Knowing the Stairwell is coming while both hands are spent changes nothing this turn, but it is the first time a Scramble 1 starter has felt worth its cost. Shape note: with six-room floors and a Peek, the Stairwell is rarely a surprise.
 72. You are in: The Sentry Drone.
 73. Red draws Shove.
 74. Red draws Charge In.
 75. Red's deck is empty — the discard pile shuffles in to make a new one (8 cards).
 76. Red draws Shove.
 77. Gray draws Peek Around Corner.
 78. Gray draws Duck Under.
 79. Gray draws Pick The Lock.
 80. Gray's deck is empty — the discard pile shuffles in to make a new one (8 cards).
 81. Gray draws Pick The Lock.
 82. Gray discards Peek Around Corner from their hand.
 83. Gray discards Duck Under from their hand.
 84. Gray pays with Peek Around Corner, Duck Under.
 85. Gray plays Pick The Lock.
 86. You Flee The Sentry Drone.
 87. Red Exhausts Shove.
 88. Gray Exhausts Pick The Lock.
 89. Red gets Panic.
 90. Red takes Panic into hand.
 91. Cleanup.
 92. Gray discards Pick The Lock from their play zone.
 93. The Sentry Drone shuffles back into the Floor deck.
 94. — end of turn 4 —
 95. NOTE — I Fled The Sentry Drone by accident. I meant to play Pick The Lock paying with Riot Shield, but the lock costs 2 and Gray held only one other card, so the play was refused; my shell chain then ran end anyway, at Scramble 4 against 8. Undo was refused because the Flee revealed Panic, which is the right guard. The Flee cost both of us an Exhaust and put Panic in Red's hand: Holding, every threshold needs +2 Scramble. Continuing; the mistake is mine, not the tool's.
 96. You are in: Flooded Ventilation Shaft.
 97. Gray draws Duck Under.
 98. Gray draws Pick The Lock.
 99. Gray draws Duck Under.
100. Red discards Panic from their hand.
101. Red pays with Panic.
102. Red plays Duct Tape & Wire.
103. Red discards Shove from their hand.
104. Red pays with Shove.
105. Red plays Shove.
106. Gray discards Duck Under from their hand.
107. Gray discards Duck Under from their hand.
108. Gray pays with Duck Under, Duck Under.
109. Gray plays Pick The Lock.
110. Scramble 4 met — Clear.
111. Oomph 3 and Scramble 3 met — Clear, and Gray gets Good Stuff.
112. Flooded Ventilation Shaft is Cleared.
113. Gray gets Emergency Power Core.
114. Gray takes Emergency Power Core into hand.
115. Cleanup.
116. Red discards Duct Tape & Wire from their play zone.
117. Red discards Shove from their play zone.
118. Gray discards Pick The Lock from their play zone.
119. — end of turn 5 —
120. You are in: The Sentry Drone.
121. Red draws Charge In.
122. Red draws Overdrive.
123. Red draws Charge In.
124. Gray draws Peek Around Corner.
125. Gray draws Work The Angles.
126. Red discards Shove from their hand.
127. Red discards Overdrive from their hand.
128. Red pays with Shove, Overdrive.
129. Red plays Charge In.
130. Gray plays Emergency Power Core.
131. Gray Exhausts Pick The Lock.
132. Gray's deck is empty — the discard pile shuffles in to make a new one (6 cards).
133. Gray Exhausts Pick The Lock.
134. Gray discards Peek Around Corner from their hand.
135. Gray pays with Peek Around Corner.
136. Gray plays Work The Angles.
137. Oomph 8 met — Ascend.
138. The Sentry Drone is Cleared.
139. Cleanup.
140. Red discards Charge In from their play zone.
141. Gray discards Emergency Power Core from their play zone.
142. Gray discards Work The Angles from their play zone.
143. — end of turn 6 —
144. Floor 1 is clear.
145. NOTE — Floor 1 cleared on turn 6, on the Stairwell's second visit, and only because Gray spent Emergency Power Core: a Woah Good Stuff that is Oomph 3 and Scramble 3 for free but Exhausts 2. Under no-rent gaining it was +1 Stamina and playing it is -2, so it is a card you hold as deck weight until a Stairwell is on the line. Both characters are at 12 live cards, where they started: two Exhausts each, two Stuff each. The Flee's Panic is Red's only Bad Stuff.
146. Red shuffles 2 card(s) back in.
147. Red takes Tag Team.
148. Red shuffles 1 card(s) back in.
149. Gray shuffles 2 card(s) back in.
150. Gray takes Catch Your Breath.
151. Gray shuffles 1 card(s) back in.
152. Floor 2 is built: 2 rooms.
153. You are in: Security Turnstile.
154. Red draws Charge In.
155. Red draws Charge In.
156. Red draws Charge In.
157. Red draws Overdrive.
158. Red draws Charge In.
159. Gray draws Duck Under.
160. Gray draws Duck Under.
161. Gray draws Pick The Lock.
162. Gray draws Pick The Lock.
163. Gray draws Peek Around Corner.
164. NOTE — Floor 2 is built with 2 rooms. Rulebook, Build the next floor: cleared rooms, the Stairwell included, stay on the Rooms pile, so the five band-1 Rooms I cleared on floor 1 are gone from the band for good. Band 1 had five Room copies and three Sentry Drones; after floor 1 it holds one Turnstile and two Drones, so floor 2 is two cards and floor 3 will be the Stairwell alone. Question for the designer: is a band meant to drain across its three floors like this, or should cleared Rooms return to the band at Build the next floor while cleared Stairwells stay out? Shape note: the run is shrinking to one Stairwell fight per floor by floor 3.
165. Gray discards Duck Under from their hand.
166. Gray discards Duck Under from their hand.
167. Gray pays with Duck Under, Duck Under.
168. Gray plays Pick The Lock.
169. Red discards Charge In from their hand.
170. Red discards Charge In from their hand.
171. Red pays with Charge In, Charge In.
172. Red plays Charge In.
173. Scramble 3 met — Clear.
174. Security Turnstile is Cleared.
175. Cleanup.
176. Red discards Charge In from their play zone.
177. Gray discards Pick The Lock from their play zone.
178. — end of turn 7 —
179. You are in: The Sentry Drone.
180. Red draws Tag Team.
181. Red's deck is empty — the discard pile shuffles in to make a new one (10 cards).
182. Red draws Charge In.
183. Red draws Duct Tape & Wire.
184. Gray draws Duck Under.
185. Gray draws Catch Your Breath.
186. Gray draws Riot Shield.
187. Gray discards Peek Around Corner from their hand.
188. Gray discards Duck Under from their hand.
189. Gray pays with Peek Around Corner, Duck Under.
190. Gray plays Pick The Lock.
191. Gray discards Catch Your Breath from their hand.
192. Gray pays with Catch Your Breath.
193. Gray plays Riot Shield.
194. Red discards Overdrive from their hand.
195. Red pays with Overdrive.
196. Red plays Tag Team.
197. Red draws Shove.
198. Scramble 8 met — Ascend, and one of you gets Good Stuff.
199. The Sentry Drone is Cleared.
200. Gray gets Cutting Torch.
201. Gray takes Cutting Torch into hand.
202. Cleanup.
203. Gray takes Riot Shield into hand.
204. Red discards Tag Team from their play zone.
205. Gray discards Pick The Lock from their play zone.
206. — end of turn 8 —
207. Floor 2 is clear.
208. Red shuffles 4 card(s) back in.
209. Red takes Junk Launcher.
210. Red shuffles 1 card(s) back in.
211. Gray shuffles 2 card(s) back in.
212. Gray takes Hack the Doors.
213. Gray shuffles 1 card(s) back in.
214. Floor 3 is built: 1 rooms.
215. You are in: The Sentry Drone.
216. Red draws Charge In.
217. Red draws Junk Launcher.
218. Red draws Shove.
219. Red draws Shove.
220. Red draws Charge In.
221. Gray draws Hack the Doors.
222. Gray draws Cutting Torch.
223. Gray draws Riot Shield.
224. Gray's deck is empty — the discard pile shuffles in to make a new one (10 cards).
225. Gray draws Pick The Lock.
226. Gray draws Duck Under.
227. NOTE — Floor 3 is the Stairwell alone: one card, flipped on turn 9. Shape note, same cause as the last note.
228. Red discards Shove from their hand.
229. Red discards Shove from their hand.
230. Red pays with Shove, Shove.
231. Red plays Junk Launcher.
232. Gray discards Riot Shield from their hand.
233. Gray pays with Riot Shield.
234. Gray plays Hack the Doors.
235. A look at the Good Stuff pool: Overcharged Battery, A Pair Of Stitch-Em-Ups, High-Frequency Scanner.
236. Gray discards Duck Under from their hand.
237. Gray discards Pick The Lock from their hand.
238. Gray pays with Duck Under, Pick The Lock.
239. Gray plays Cutting Torch.
240. Oomph 8 met — Ascend.
241. The Sentry Drone is Cleared.
242. Cleanup.
243. Red discards Junk Launcher from their play zone.
244. Gray discards Hack the Doors from their play zone.
245. Gray discards Cutting Torch from their play zone.
246. — end of turn 9 —
247. Floor 3 is clear.
248. Red shuffles 2 card(s) back in.
249. Red takes Second Wind.
250. Red shuffles 1 card(s) back in.
251. Gray takes Distract & Pivot.
252. Gray shuffles 1 card(s) back in.
253. Floor 4 is built: 7 rooms.
254. You are in: Overgrown Hydroponics Bay.
255. Red draws Charge In.
256. Red draws Shove.
257. Red draws Charge In.
258. Red draws Charge In.
259. Red draws Overdrive.
260. Gray draws Emergency Power Core.
261. Gray draws Peek Around Corner.
262. Gray draws Pick The Lock.
263. Gray draws Duck Under.
264. Gray draws Duck Under.
265. Gray discards Peek Around Corner from their hand.
266. Gray discards Duck Under from their hand.
267. Gray pays with Peek Around Corner, Duck Under.
268. Gray plays Pick The Lock.
269. Gray discards Emergency Power Core from their hand.
270. Gray pays with Emergency Power Core.
271. Gray plays Duck Under.
272. Red discards Charge In from their hand.
273. Red discards Charge In from their hand.
274. Red pays with Charge In, Charge In.
275. Red plays Charge In.
276. Scramble 6 met — Clear, but both of you get Bad Stuff.
277. Overgrown Hydroponics Bay is Cleared.
278. Red gets Corrosive Acid.
279. Red takes Corrosive Acid into hand.
280. Gray gets Torn Seal.
281. Gray takes Torn Seal into hand.
282. Cleanup.
283. Red discards Charge In from their play zone.
284. Gray discards Pick The Lock from their play zone.
285. Gray discards Duck Under from their play zone.
286. — end of turn 10 —
287. You are in: Pressurized Maintenance Hub.
288. Red draws Second Wind.
289. Red draws Charge In.
290. Gray draws Peek Around Corner.
291. Gray draws Catch Your Breath.
292. Gray draws Work The Angles.
293. Gray draws Distract & Pivot.
294. Red Exhausts Charge In.
295. Red discards Corrosive Acid from their hand.
296. Red discards Shove from their hand.
297. Red pays with Corrosive Acid, Shove.
298. Red plays Second Wind.
299. Red shuffles 1 card(s) back in.
300. Gray discards Torn Seal from their hand.
301. Gray discards Peek Around Corner from their hand.
302. Gray pays with Torn Seal, Peek Around Corner.
303. Gray plays Distract & Pivot.
304. Red discards Overdrive from their hand.
305. Red pays with Overdrive.
306. Red plays Charge In.
307. Oomph 7 met — Clear, and Red reveals a card reward.
308. Pressurized Maintenance Hub is Cleared.
309. Red's reward pool shows Reckless Swing.
310. Red takes Reckless Swing.
311. Cleanup.
312. Red discards Second Wind from their play zone.
313. Red discards Charge In from their play zone.
314. Gray discards Distract & Pivot from their play zone.
315. — end of turn 11 —
316. You are in: Gears & Glitch.
317. Red draws Reckless Swing.
318. Red draws Panic.
319. Red draws Duct Tape & Wire.
320. Red draws Lean In.
321. Red's deck is empty — the discard pile shuffles in to make a new one (13 cards).
322. Red draws Overdrive.
323. Gray's deck is empty — the discard pile shuffles in to make a new one (13 cards).
324. Gray draws Hack the Doors.
325. Gray draws Duck Under.
326. Gray draws Torn Seal.
327. Red discards Panic from their hand.
328. Red pays with Panic.
329. Red plays Reckless Swing.
330. Red Exhausts Charge In.
331. Red discards Lean In from their hand.
332. Red pays with Lean In.
333. Red plays Duct Tape & Wire.
334. Red plays Overdrive.
335. Red Exhausts Second Wind.
336. Red Exhausts Tag Team.
337. Gray discards Torn Seal from their hand.
338. Gray pays with Torn Seal.
339. Gray plays Hack the Doors.
340. A look at the Gray reward pool: Hit 'n Run, One Man's Junk, I'll Take That.
341. Gray discards Work The Angles from their hand.
342. Gray pays with Work The Angles.
343. Gray plays Catch Your Breath.
344. A look at the Bad Stuff pool: My Head Is Quantum Spinning, Corrosive Acid.
345. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
346. Gears & Glitch is Cleared.
347. Gray's reward pool shows Hit 'n Run.
348. Gray takes Hit 'n Run.
349. Cleanup.
350. Red discards Reckless Swing from their play zone.
351. Red discards Duct Tape & Wire from their play zone.
352. Red discards Overdrive from their play zone.
353. Gray discards Hack the Doors from their play zone.
354. Gray discards Catch Your Breath from their play zone.
355. — end of turn 12 —
356. Floor 4 is clear.
357. NOTE — Floor 4 cleared on turn 12 with four rooms still in the floor deck: Gears & Glitch came third, and once a Stairwell is flipped you either Ascend or Flee it, so the rest of the floor is skipped. Panic in Red's hand printed the Oomph 12 line as Oomph 12 and Scramble 2, which the card text supports (every threshold needs +2 Scramble). Paying for Reckless Swing with Panic lifted it. Overdrive's Exhaust 2 took Second Wind and Tag Team, Red's two best rewards: blind Exhausts off a deck that now holds rewards and Stuff cost more than they did on floor 1. Hack the Doors on Gray's reward pool put Hit 'n Run on top for the room reward, and Catch Your Breath put the milder Bad Stuff on top of that pool; both are real plays under the any-deck ruling.
358. Red takes Fast Follow.
359. Red shuffles 1 card(s) back in.
360. Gray shuffles 1 card(s) back in.
361. Gray takes One Man's Junk.
362. Gray shuffles 1 card(s) back in.
363. Floor 5 is built: 6 rooms.
364. You are in: Automated Defense Turret.
365. Red draws Charge In.
366. Red draws Shove.
367. Red draws Charge In.
368. Red draws Fast Follow.
369. Red draws Overdrive.
370. Gray draws Cutting Torch.
371. Gray draws Duck Under.
372. Gray draws Duck Under.
373. Gray draws Riot Shield.
374. Gray draws Peek Around Corner.
375. Gray discards Duck Under from their hand.
376. Gray discards Duck Under from their hand.
377. Gray pays with Duck Under, Duck Under.
378. Gray plays Cutting Torch.
379. Red plays Fast Follow.
380. Red discards Shove from their hand.
381. Red discards Overdrive from their hand.
382. Red pays with Shove, Overdrive.
383. Red plays Charge In.
384. Oomph 10 met — Clear, and one of you may Scrap a Bad Stuff card from your hand.
385. Automated Defense Turret is Cleared.
386. Cleanup.
387. Red discards Fast Follow from their play zone.
388. Red discards Charge In from their play zone.
389. Gray discards Cutting Torch from their play zone.
390. — end of turn 13 —
391. You are in: Overgrown Hydroponics Bay.
392. Red draws Junk Launcher.
393. Red draws Shove.
394. Red draws Corrosive Acid.
395. Red draws Shove.
396. Gray draws Pick The Lock.
397. Gray draws One Man's Junk.
398. Gray draws Peek Around Corner.
399. Red Exhausts Charge In.
400. NOTE — Corrosive Acid was drawn during this Turn Start's draw and its Holding line (At Turn Start, Exhaust 1) fired at once: Red Exhausted Charge In in the same Turn Start. Rulebook, Draw up to five: resolve effects triggered by these draws after both players have drawn. Question for the designer: does a Holding effect that says At Turn Start apply when the card arrives in hand during that Turn Start's draw, or only on a Turn Start it was already held through? Under no-rent this card is the run's first real tax: it Exhausts 1 every Turn Start it is in hand, and the only way out is a Scrap.
401. Gray discards Peek Around Corner from their hand.
402. Gray discards Peek Around Corner from their hand.
403. Gray pays with Peek Around Corner, Peek Around Corner.
404. Gray plays Pick The Lock.
405. Gray discards One Man's Junk from their hand.
406. Gray pays with One Man's Junk.
407. Gray plays Riot Shield.
408. Red discards Corrosive Acid from their hand.
409. Red discards Shove from their hand.
410. Red pays with Corrosive Acid, Shove.
411. Red plays Junk Launcher.
412. Scramble 6 met — Clear, but both of you get Bad Stuff.
413. Overgrown Hydroponics Bay is Cleared.
414. Red gets Sluggish.
415. Red takes Sluggish into hand.
416. Gray gets My Head Is Quantum Spinning.
417. Gray takes My Head Is Quantum Spinning into hand.
418. Cleanup.
419. Gray takes Riot Shield into hand.
420. Red discards Junk Launcher from their play zone.
421. Gray discards Pick The Lock from their play zone.
422. — end of turn 14 —
423. You are in: Automated Defense Turret.
424. Red's deck is empty — the discard pile shuffles in to make a new one (12 cards).
425. Red draws Lean In.
426. Red draws Fast Follow.
427. Gray draws Emergency Power Core.
428. Gray draws Hit 'n Run.
429. Gray draws Distract & Pivot.
430. NOTE — Suspected engine mismatch. On turn 12 Catch Your Breath looked at the top 2 of the Bad Stuff pool and I put them back as My Head Is Quantum Spinning, then Corrosive Acid; the tool printed Ordered. No Bad Stuff left the pool until Hydroponics on turn 14, when Red got Sluggish and Gray got Quantum Spinning. The rulebook has Stuff drawn from a face-down pool and the any-deck keyword calls that pool a pile you can look at and reorder, so the next card gained should have been the one I put on top. Either the reorder did not take, or the engine draws Stuff at random from the pool rather than off the top. I set the Good Stuff pool on turn 9 with A Pair Of Stitch-Em-Ups on top and nothing has left it since, so the next Good Stuff gain will show which.
431. Gray discards My Head Is Quantum Spinning from their hand.
432. Gray discards Riot Shield from their hand.
433. Gray pays with My Head Is Quantum Spinning, Riot Shield.
434. Gray plays Distract & Pivot.
435. Red discards Shove from their hand.
436. Red discards Lean In from their hand.
437. Red pays with Shove, Lean In.
438. Red plays Charge In.
439. Red plays Fast Follow.
440. Gray discards Emergency Power Core from their hand.
441. Gray pays with Emergency Power Core.
442. Gray plays Hit 'n Run.
443. Gray shuffles 1 card(s) back in.
444. Oomph 10 met — Clear, and one of you may Scrap a Bad Stuff card from your hand.
445. Automated Defense Turret is Cleared.
446. Sluggish is Scrapped.
447. Cleanup.
448. Red discards Charge In from their play zone.
449. Red discards Fast Follow from their play zone.
450. Gray discards Distract & Pivot from their play zone.
451. Gray discards Hit 'n Run from their play zone.
452. — end of turn 15 —
453. You are in: Pressurized Maintenance Hub.
454. Red draws Junk Launcher.
455. Red draws Duct Tape & Wire.
456. Red draws Shove.
457. Red draws Corrosive Acid.
458. Red draws Overdrive.
459. Gray draws Pick The Lock.
460. Gray draws Pick The Lock.
461. Gray draws Duck Under.
462. Gray's deck is empty — the discard pile shuffles in to make a new one (16 cards).
463. Gray draws Duck Under.
464. Gray draws Peek Around Corner.
465. Red Exhausts Reckless Swing.
466. Red discards Corrosive Acid from their hand.
467. Red discards Overdrive from their hand.
468. Red pays with Corrosive Acid, Overdrive.
469. Red plays Junk Launcher.
470. Red discards Shove from their hand.
471. Red pays with Shove.
472. Red plays Duct Tape & Wire.
473. Gray discards Peek Around Corner from their hand.
474. Gray discards Duck Under from their hand.
475. Gray pays with Peek Around Corner, Duck Under.
476. Gray plays Pick The Lock.
477. Gray discards Pick The Lock from their hand.
478. Gray pays with Pick The Lock.
479. Gray plays Duck Under.
480. Oomph 7 met — Clear, and Red reveals a card reward.
481. Scramble 7 met — Clear, and Gray reveals a card reward.
482. Pressurized Maintenance Hub is Cleared.
483. Red's reward pool shows Heavy Pockets.
484. Red takes Heavy Pockets.
485. Gray's reward pool shows Covering Fire.
486. Gray takes Covering Fire.
487. Cleanup.
488. Red discards Junk Launcher from their play zone.
489. Red discards Duct Tape & Wire from their play zone.
490. Gray discards Pick The Lock from their play zone.
491. Gray discards Duck Under from their play zone.
492. — end of turn 16 —
493. You are in: Automated Defense Turret.
494. Red draws Heavy Pockets.
495. Red draws Shove.
496. Red draws Panic.
497. Red draws Charge In.
498. Red draws Overdrive.
499. Gray draws Covering Fire.
500. Gray draws Cutting Torch.
501. Gray draws Riot Shield.
502. Gray draws Emergency Power Core.
503. Gray draws My Head Is Quantum Spinning.
504. Gray discards My Head Is Quantum Spinning from their hand.
505. Gray pays with My Head Is Quantum Spinning.
506. Gray plays Covering Fire.
507. Red discards Panic from their hand.
508. Red discards Shove from their hand.
509. Red pays with Panic, Shove.
510. Red plays Charge In.
511. Gray draws Hack the Doors.
512. Red discards Overdrive from their hand.
513. Red pays with Overdrive.
514. Red plays Heavy Pockets.
515. Gray draws Catch Your Breath.
516. Gray discards Cutting Torch from their hand.
517. Gray pays with Cutting Torch.
518. Gray plays Riot Shield.
519. Gray discards Emergency Power Core from their hand.
520. Gray pays with Emergency Power Core.
521. Gray plays Hack the Doors.
522. A look at the Gray deck: Hit 'n Run, Pick The Lock, Peek Around Corner.
523. Scramble 8 met — Clear, and Gray gets Good Stuff.
524. Automated Defense Turret is Cleared.
525. Gray gets Crowbar.
526. Gray takes Crowbar into hand.
527. Cleanup.
528. Gray takes Riot Shield into hand.
529. Red discards Charge In from their play zone.
530. Red discards Heavy Pockets from their play zone.
531. Gray discards Covering Fire from their play zone.
532. Gray discards Hack the Doors from their play zone.
533. — end of turn 17 —
534. You are in: Gears & Glitch.
535. Red's deck is empty — the discard pile shuffles in to make a new one (14 cards).
536. Red draws Junk Launcher.
537. Red draws Shove.
538. Red draws Shove.
539. Red draws Charge In.
540. Red draws Corrosive Acid.
541. Gray draws Hit 'n Run.
542. Gray draws Pick The Lock.
543. Red Exhausts Charge In.
544. NOTE — Confirmed from the other pool: Gray got Crowbar from the Good Stuff pool, not A Pair Of Stitch-Em-Ups, which Hack the Doors put on top on turn 9 with nothing leaving the pool since. So reordering a Stuff pool does not decide the next Stuff gained. The Floor deck did behave: Peek Around Corner showed The Sentry Drone and it flipped next. Question for the designer, same as the last note: are the Stuff pools ordered piles a look-and-reorder effect can set, as the any-deck keyword implies, or does gaining Stuff draw at random? Corrosive Acid fired again this Turn Start, its third Exhaust in five turns; Red is at 13 live cards to Gray's 21.
545. Red discards Corrosive Acid from their hand.
546. Red discards Shove from their hand.
547. Red pays with Corrosive Acid, Shove.
548. Red plays Junk Launcher.
549. Red discards Charge In from their hand.
550. Red pays with Charge In.
551. Red plays Shove.
552. Gray discards Catch Your Breath from their hand.
553. Gray discards Hit 'n Run from their hand.
554. Gray pays with Catch Your Breath, Hit 'n Run.
555. Gray plays Pick The Lock.
556. Gray discards Crowbar from their hand.
557. Gray pays with Crowbar.
558. Gray plays Riot Shield.
559. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
560. Gears & Glitch is Cleared.
561. Red's reward pool shows Reckless.
562. Red takes Reckless.
563. Cleanup.
564. Gray takes Riot Shield into hand.
565. Red discards Junk Launcher from their play zone.
566. Red discards Shove from their play zone.
567. Gray discards Pick The Lock from their play zone.
568. — end of turn 18 —
569. Floor 5 is clear.
570. Red takes Bull Rush.
571. Red shuffles 1 card(s) back in.
572. Gray shuffles 1 card(s) back in.
573. Gray takes I'll Take That.
574. Gray shuffles 1 card(s) back in.
575. Floor 6 is built: 1 rooms.
576. You are in: Gears & Glitch.
577. Red draws Bull Rush.
578. Red draws Overdrive.
579. Red draws Heavy Pockets.
580. Red draws Overdrive.
581. Red draws Panic.
582. Gray draws Peek Around Corner.
583. Gray draws One Man's Junk.
584. Gray draws Duck Under.
585. Gray draws Torn Seal.
586. Gray draws Work The Angles.
587. NOTE — Floor 6 is Gears & Glitch alone and the opening hands cannot reach it: Red holds Bull Rush, Heavy Pockets, two Overdrives and Panic, Gray holds Peek, One Man's Junk, Duck Under, Torn Seal and Work The Angles. Best case is Oomph 8 and Scramble 6 against 7 and 7, or Oomph 9 against 12. So the turn is a forced Flee: both Exhaust 3 and Red gets Bad Stuff, the largest single loss of the run, with nothing to decide except which cards to cycle before it. Shape note: once a band has drained to its Stairwell, a floor is one card, and a bad opening hand costs six Stamina with no room to set up. I am playing the cheap cards to cycle both hands and keeping one Overdrive.
588. Red discards Panic from their hand.
589. Red pays with Panic.
590. Red plays Bull Rush.
591. Red discards Overdrive from their hand.
592. Red pays with Overdrive.
593. Red plays Heavy Pockets.
594. Gray discards Torn Seal from their hand.
595. Gray pays with Torn Seal.
596. Gray plays One Man's Junk.
597. Gray discards Peek Around Corner from their hand.
598. Gray pays with Peek Around Corner.
599. Gray plays Duck Under.
600. You Flee Gears & Glitch.
601. Red Exhausts Lean In.
602. Red Exhausts Duct Tape & Wire.
603. Red Exhausts Shove.
604. Gray Exhausts Distract & Pivot.
605. Gray Exhausts Riot Shield.
606. Gray Exhausts I'll Take That.
607. Red gets System Feedback.
608. Red takes System Feedback into hand.
609. Cleanup.
610. Red discards Bull Rush from their play zone.
611. Red discards Heavy Pockets from their play zone.
612. Gray discards One Man's Junk from their play zone.
613. Gray discards Duck Under from their play zone.
614. Gears & Glitch shuffles back into the Floor deck.
615. — end of turn 19 —
616. You are in: Gears & Glitch.
617. Red draws Reckless.
618. Red draws Fast Follow.
619. Red's deck is empty — the discard pile shuffles in to make a new one (9 cards).
620. Red draws Shove.
621. Gray's deck is empty — the discard pile shuffles in to make a new one (18 cards).
622. Gray draws Cutting Torch.
623. Gray draws Duck Under.
624. Gray draws Covering Fire.
625. Gray draws My Head Is Quantum Spinning.
626. Gray discards My Head Is Quantum Spinning from their hand.
627. Gray discards Duck Under from their hand.
628. Gray pays with My Head Is Quantum Spinning, Duck Under.
629. Gray plays Cutting Torch.
630. Red discards System Feedback from their hand.
631. Red pays with System Feedback.
632. Red plays Shove.
633. Red plays Fast Follow.
634. Red plays Overdrive.
635. Red Exhausts Corrosive Acid.
636. Red Exhausts Heavy Pockets.
637. Gray discards Covering Fire from their hand.
638. Gray pays with Covering Fire.
639. Gray plays Work The Angles.
640. Oomph 12 met — Ascend.
641. Gears & Glitch is Cleared.
642. Cleanup.
643. Red discards Shove from their play zone.
644. Red discards Fast Follow from their play zone.
645. Red discards Overdrive from their play zone.
646. Gray discards Cutting Torch from their play zone.
647. Gray discards Work The Angles from their play zone.
648. — end of turn 20 —
649. Floor 6 is clear.
650. Red shuffles 1 card(s) back in.
651. Red takes Cross Punch.
652. Red shuffles 1 card(s) back in.
653. Gray takes Quick Vault.
654. Gray shuffles 1 card(s) back in.
655. Floor 7 is built: 4 rooms.
656. You are in: The Iron Sentinel.
657. Red draws Junk Launcher.
658. Red draws Bull Rush.
659. Red draws Reckless.
660. Red draws Shove.
661. Red draws Charge In.
662. Gray draws Pick The Lock.
663. Gray draws Peek Around Corner.
664. Gray draws Crowbar.
665. Gray draws Catch Your Breath.
666. Gray draws Duck Under.
667. NOTE — Floor 7 flips The Iron Sentinel first, on a four-card floor: Oomph 10 and Scramble 10, or Oomph 18. Red's hand tops out at Oomph 11 with Reckless's Exhaust 3, Gray's at Scramble 6, so this is the second forced Flee in three turns: both Exhaust 4 and both get Bad Stuff. Red goes from 12 live cards to 8 plus a Bad Stuff card. Every band 3 line is 10 or more on one stat, and these decks make about Oomph 8 and Scramble 6 a turn, so band 3 is where the run stops unless Good Stuff arrives. I am holding Red's hand so Red draws nothing next Turn Start, and cycling Gray's.
668. Gray discards Peek Around Corner from their hand.
669. Gray discards Catch Your Breath from their hand.
670. Gray pays with Peek Around Corner, Catch Your Breath.
671. Gray plays Pick The Lock.
672. Gray discards Crowbar from their hand.
673. Gray pays with Crowbar.
674. Gray plays Duck Under.
675. You Flee The Iron Sentinel.
676. Red Exhausts Panic.
677. Red Exhausts Cross Punch.
678. Red Exhausts Overdrive.
679. Red's deck is empty — the discard pile shuffles in to make a new one (4 cards).
680. Red Exhausts Overdrive.
681. Gray Exhausts Pick The Lock.
682. Gray Exhausts Peek Around Corner.
683. Gray Exhausts Pick The Lock.
684. Gray Exhausts Torn Seal.
685. Red gets Faceful Of Slime.
686. Red takes Faceful Of Slime into hand.
687. Gray gets Sluggish.
688. Gray takes Sluggish into hand.
689. Cleanup.
690. Gray discards Pick The Lock from their play zone.
691. Gray discards Duck Under from their play zone.
692. The Iron Sentinel shuffles back into the Floor deck.
693. — end of turn 21 —
694. You are in: Smoldering Armory.
695. Gray draws Emergency Power Core.
696. Gray draws Duck Under.
697. Gray draws One Man's Junk.
698. Gray draws Hit 'n Run.
699. Red discards Faceful Of Slime from their hand.
700. Red discards Shove from their hand.
701. Red pays with Faceful Of Slime, Shove.
702. Red plays Junk Launcher.
703. Red discards Bull Rush from their hand.
704. Red discards Reckless from their hand.
705. Red pays with Bull Rush, Reckless.
706. Red plays Charge In.
707. Gray discards Sluggish from their hand.
708. Gray discards Duck Under from their hand.
709. Gray pays with Sluggish, Duck Under.
710. Gray plays Hit 'n Run.
711. NOTE — Junk Launcher again (issue #144, seen the other way round). I played it first, paying two cards, and the pool read Oomph 6 as printed. Then Charge In paid with two more cards and the pool jumped to Oomph 14, not 10: the Launcher counted Charge In's payers too. Its text is 'gains Oomph +2 for each card spent to play it this turn', so the two later cards should not count. Oomph 10 is met either way, so I am not claiming the 16 line.
712. Gray shuffles 1 card(s) back in.
713. Oomph 10 met — Clear, and Red gets Good Stuff.
714. Smoldering Armory is Cleared.
715. Red gets Overcharged Battery.
716. Red takes Overcharged Battery into hand.
717. Cleanup.
718. Red discards Junk Launcher from their play zone.
719. Red discards Charge In from their play zone.
720. Gray discards Hit 'n Run from their play zone.
721. — end of turn 22 —
722. You are in: Laser Grid Security Hall.
723. Red draws Fast Follow.
724. Red draws Shove.
725. Red draws System Feedback.
726. Red's deck is empty — the discard pile shuffles in to make a new one (6 cards).
727. Red draws Junk Launcher.
728. Gray draws Pick The Lock.
729. Gray draws Hack the Doors.
730. Gray draws Quick Vault.
731. NOTE — Laser Grid Security Hall: Scramble 14 or Oomph 18. Gray's hand makes Scramble 8 at most, Red's Oomph 8, so this is the third forced Flee since floor 6: both Exhaust 4. Red drops from 10 live cards to 6. I am playing nothing so both hands stay at five and nobody draws at the next Turn Start, where a short deck would be Down under the #146 ruling. Two rooms remain in the floor deck: the Vault, which these hands can clear at Oomph 15 by Scrapping Overcharged Battery for +3, or the Sentinel, which they cannot.
732. You Flee Laser Grid Security Hall.
733. Red Exhausts Faceful Of Slime.
734. Red Exhausts Charge In.
735. Red Exhausts Bull Rush.
736. Red Exhausts Reckless.
737. Gray's deck is empty — the discard pile shuffles in to make a new one (13 cards).
738. Gray Exhausts Catch Your Breath.
739. Gray Exhausts My Head Is Quantum Spinning.
740. Gray Exhausts Hit 'n Run.
741. Gray Exhausts Sluggish.
742. Cleanup.
743. Laser Grid Security Hall shuffles back into the Floor deck.
744. — end of turn 23 —
745. You are in: Laser Grid Security Hall.
746. NOTE — Laser Grid shuffled back in and flipped straight back up. Same hands, same answer: Flee. Red has one card in deck and none in discard, so Exhaust 4 is Down unless cards reach the discard first. Paying moves cards to the discard at once, so I am playing Junk Launcher paying with Shove and System Feedback, and Overcharged Battery paying with Fast Follow: three payers plus the deck card is exactly the four. Red survives the Flee with nothing in deck or discard and two cards in the play zone, and then draw up to five at the next Turn Start is Down under #146. So this is the last decision of the run: whether Red goes Down on the Flee or at Turn Start, one turn later.
747. Red discards Shove from their hand.
748. Red discards System Feedback from their hand.
749. Red pays with Shove, System Feedback.
750. Red plays Junk Launcher.
751. Red discards Fast Follow from their hand.
752. Red pays with Fast Follow.
753. Red plays Overcharged Battery.
754. You Flee Laser Grid Security Hall.
755. Red Exhausts Shove.
756. Red's deck is empty — the discard pile shuffles in to make a new one (3 cards).
757. Red Exhausts Fast Follow.
758. Red Exhausts Shove.
759. Red Exhausts System Feedback.
760. Gray Exhausts Duck Under.
761. Gray Exhausts Peek Around Corner.
762. Gray Exhausts Covering Fire.
763. Gray Exhausts Work The Angles.
764. Cleanup.
765. Red discards Junk Launcher from their play zone.
766. Red discards Overcharged Battery from their play zone.
767. Laser Grid Security Hall shuffles back into the Floor deck.
768. — end of turn 24 —
769. You are in: The Iron Sentinel.
770. Red's deck is empty — the discard pile shuffles in to make a new one (2 cards).
771. Red draws Junk Launcher.
772. Red draws Overcharged Battery.
773. Red is Down — drew from an empty deck and discard pile. The run is lost.
774. Red discards Junk Launcher from their hand.
775. Red discards Overcharged Battery from their hand.
776. You lose.

Floor 7 · turn 25 · GameOver   floor deck 2, cleared 19   Good Stuff 22, Bad Stuff 10
Room: The Iron Sentinel (stairwell)
    Oomph 10 and Scramble 10: Ascend, and both of you reveal a card reward.
    Oomph 18: Ascend, but both of you Exhaust 3.
    Flee: Both of you Exhaust 4, and both of you get Bad Stuff.
Red: deck 0, discard 2, exhaust 25, hand 0  DOWN
Gray: deck 5, discard 0, exhaust 17, hand 5
    Emergency Power Core [cost 0; Oomph 3, Scramble 3; Good Stuff] — Exhaust 2.
    One Man's Junk [cost 1; Oomph 2, Scramble 2] — If any Bad Stuff is played this turn, gain Oomph +1 and Scramble +1.
    Pick The Lock [cost 2; Scramble 4]
    Hack the Doors [cost 1; Scramble 3] — Look at top 3 cards of any deck, put back in any order.
    Quick Vault [cost 1; Oomph 1, Scramble 2]
Outcome: Defeat

seed 6, 149 command(s) replayed, floor 7, turn 25, Defeat.
```
