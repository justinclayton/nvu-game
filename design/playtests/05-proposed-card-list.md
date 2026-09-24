# Playtest 5 — first run on the proposed card list

Recorded 2026-09-23. Rules version: 0.2.2. Played by an agent standing in for a human playtester,
in the CLI (`bin/nvu`), seed 5, one shell call per move. No seed was given; 5 follows the earlier
runs' habit of seed equals playtest number. The run cleared seven floors in twenty turns and ended
in Defeat on turn 21, floor 8: Gray went Down at Turn Start with two cards left to draw from.

This is the first run on the proposed card list, the designer's own iteration from outside the repo,
adopted wholesale on this branch: twelve-card starters at two stats per card of cost, one dual-stat
starter each, Fine and Cool reward pools of nine and ten cards, thirteen Good Stuff and nine Bad
Stuff, and rooms for all three bands and floor 10. Two of its rooms print a threshold that needs
both stats, which is why the rulebook is at 0.2.2. The agent made one content change to make the
list playable at all: three copies of each band Stairwell instead of one, since a cleared Stairwell
leaves its pool and one copy could not build a second floor. Room prose was reworded only where the
generator's vocabulary required it ("both players" to "both of you"), and the Woah character rewards
of the old list were left out because the proposal defines only Fine and Cool pools. The engine work
was done by separate agents before this run.

Notes are the agent's, verbatim, tagged `[agent]`, in the order they were written into the run.
Nothing here is a ruling. Suspected bugs were checked against `design/rulebook.md` and
`design/cards.yaml` only; the playtester did not read `app/src`.

The run file is `05-proposed-card-list.json`. The full transcript is the appendix, and notes cite it
by line.

## How the run went

Floor 1 was six cards, not ten: the proposal's band 1 holds five Room cards. Security Turnstile came
first and Red took its Oomph 5 line, paying two Stamina in Exhaust for one Good Stuff, Grav Harness.
The Stairwell, The Sentry Drone at Oomph 8 or Scramble 8, came up on turn 2. Starter hands cannot
reach either number, but Grav Harness's Scramble 3 plus Pick The Lock and Duck Under made 9, and the
floor was done in two turns. Rewards: Junk Launcher and Hack the Doors.

Floor 2 was five cards. Both Flooded Ventilation Shafts fell to their dual line, Oomph 3 and
Scramble 3, which pays a Good Stuff for nothing: Emergency Power Core, then Crowbar. The second
Turnstile cost Gray her new Hack the Doors to a one-card-deck Exhaust, a mistake the agent noted
against himself. The Drone fell on turn 7 to Gray alone, and Crowbar doubled the Good Stuff it paid.
Rent showed its face at this Ascend: Grav Harness, kept one floor earlier, was asked about again.

Floor 3 was the Stairwell alone, band 1 having nothing left, and fell in one turn. In Step, the
Gray reward that scales with Red's plays, was worth 4 here and became the run's central card. By the
end of floor 3 both starters had been rebuilt: Stuff kept by Scrapping the weakest starter each time,
which is an upgrade while weak starters last.

Floors 4 to 6 were band 2 and went fast: Turret, Hub, Turret, Gears & Glitch; Turret, Hub,
Hydroponics Bay, Gears & Glitch; then Gears & Glitch flipped first on a two-card floor 6. Every room
fell on its first try and no room was Fled all run. The Hub paid a card reward per line and both
lines were met each time. Hydroponics handed out two Bad Stuff along with its Good Stuff, and the
Salvage Kit scrapped one of them the next turn. Red's reward pool was down to two cards on floor 5
and both pools were empty after floor 6.

Floor 7 was band 3. Laser Grid asked Scramble 14, Bio-Hazard Containment Vault Scramble 15, The
Iron Sentinel Oomph 10 and Scramble 10, and the team met all three without an Exhaust, mostly on In
Step worth 6 or 8. But each of these rooms' Flee lines would have put Gray Down, and their reward
lines paid nothing from empty pools. Gray left floor 7 with two cards, In Step and Riot Shield.
Red left with five and a Panic.

Floor 8 opened on The Iron Sentinel. Gray drew her two cards, the third draw of "draw up to five"
found nothing, and the run was lost before a card was played.

At the end, Red held 6 live cards with an empty Exhaust pile and Gray held 2 with one Exhausted.
Rent had Scrapped 18 of Red's cards and 20 of Gray's over seven Ascends. Every reward in both pools
had been taken.

## Notes

1. **Floor 1 is built with 6 cards, not the rulebook's 10: band 1 of the proposed list holds only 5
   Room cards (3 Security Turnstile, 2 Flooded Ventilation Shaft) plus the Stairwell. The rulebook
   says nothing about a short pool, and the floor is legal as built, but this is a quarter of the 24
   rooms issue 66 asks band 1 to hold. Cleared rooms leave the pool for the rest of the run, so
   floors 2 and 3 will be thinner still.** `[agent]` (log 13)

   Shape, independent of tuning. Floors ran 6, 5, 1, 7, 5, 2, 4 and 3 cards. Issue #66 sets the
   pool minimums at 24, 18 and 9 Rooms and three Stairwells per band; the proposal has 5, 7 and 6
   Rooms and one Stairwell per band. The one Stairwell is fatal by the rulebook (Ascending step 4
   keeps cleared rooms out of the pool), so the agent raised each band Stairwell to three copies
   before the run. The Room shortage was left as proposed and is what made floors one to two turns
   long.

2. **Turn 2 and the Stairwell is already up: a 6-card floor deck makes that a 1-in-5 chance each
   flip. Oomph 8 or Scramble 8 is out of reach for the starter hands alone (Red's best five cards
   make Oomph 8 only with both Overdrives, Exhausting 4; Gray's make Scramble 6). The Grav Harness
   Red bought last turn is what makes it reachable: its Scramble 3 plus Pick The Lock and Duck
   Under is 9. Going for the Scramble line, which also pays a Good Stuff.** `[agent]` (log 36)

   Card observation for the re-tune. The band 1 Stairwell sits above what two starter hands can
   make in a turn; the greedy bot (`bin/nvu sim --seeds 20`) loses on floor 1 in every seed, Fleeing
   it until Down. A thinking player buys Good Stuff first. Whether the gap is intended is a
   numbers question.

3. **That Exhaust took Hack the Doors, the reward Gray chose two turns ago, and it was no surprise
   in hindsight: Gray's deck held exactly one card, and I could have worked out which. The Scramble
   3 line would have cleared this room for free with Coil Of Cable. I paid two Stamina for a Duct
   Tape and lost the better card. A player's mistake, not the game's, but it shows how 0.2's
   permanent Exhaust punishes a known top card: with a one-card deck, 'Exhaust 1' is a targeted
   loss, not a random one.** `[agent]` (log 116)

   Shape. With decks this small, the top card of a deck is often known, and an Exhaust line is a
   choice about a named card rather than a risk.

4. **Settle your Stuff asks about Grav Harness again, one floor after Red paid a Shove to keep it.
   So rent is due every Ascend: each Good Stuff kept costs one starter card per floor, and a floor
   here is one to four turns long. Gray is holding five Good Stuff and eight non-Stuff cards;
   keeping all five would leave three starters and make next floor's rent unpayable. Stuff reads
   as a loan against Stamina, not deck growth. Keeping four of Gray's five and returning Emergency
   Power Core, whose Exhaust 2 per play is a second Stamina cost on top of the rent.** `[agent]`
   (log 172)

   Engine matches the rulebook (Ascending, step 2). This is the rule as written; the note is about
   what it does with floors this short. See note 8.

5. **Rent is a swap, not a loss, while a weaker starter is left to Scrap: keeping Duct Tape & Wire
   (cost 1, 2/2) by Scrapping Lean In (cost 1, 1/1) improves Red's deck at the same card count.
   After this Ascend Red has no Lean In or Overdrive left and Gray is down to one Pick The Lock, so
   next floor's rent comes out of good cards. Three floors in eight turns; band 2 starts on floor 4
   with rooms asking 7 to 11 per stat.** `[agent]` (log 226)

   Shape. For the first three floors, Settle your Stuff was a real and pleasant decision: which
   starter to trade for which Stuff. It stopped being one once the weak starters were gone.

6. **Hack the Doors reads 'Look at top 3 cards of any deck, put back in any order.' I played it to
   look at the Floor deck and put Gears & Glitch where I wanted it, and the engine asked only 'Look
   at the top 3 of whose deck?' with Red or Gray as the choices. The rulebook's table has three
   kinds of face-down deck (Character deck, Reward pool, Floor deck) and the glossary calls the
   Floor deck a deck. Suspected engine mismatch, or a rulebook question: does 'any deck' on a card
   mean the character decks only?** `[agent]` (log 259)

   Checked against `cards.yaml`: Hack the Doors and Catch Your Breath both print "any deck";
   High-Frequency Scanner prints "the Floor deck" by name, and the engine did let that one look at
   the Floor deck (log 428). So the content distinguishes the two and the engine reads "any deck"
   as the two character decks. Which reading is right is the designer's.

7. **Junk Launcher counted a payer that was not its own. Red paid Charge In and Reckless Swing for
   it (pool Oomph 6, as printed: 2 plus 2 per card), then paid Grav Harness for Duct Tape & Wire,
   and the pool went to 10, not 8: Junk Launcher gained another 2 for the card spent on Duct Tape.
   The printed text (cards.yaml) is 'This card gains Oomph +2 for each card spent to play it this
   turn'; the old wording counted every card paid this turn. Suspected engine mismatch with the
   reworded card. It did not change this room's outcome.** `[agent]` (log 294)

   Engine mismatch, suspected. It happened again on Gears & Glitch (log 515: Oomph 12 met on a turn
   where the printed reading gives 10) and on The Iron Sentinel (log 701). The previous text read
   "for each card you paid with this turn"; the proposal narrows it to the card's own payers and
   the engine still counts every payer.

8. **The rent makes a character's card count invariant at Ascend: keeping k Good Stuff Scraps k
   non-Stuff cards, so Gray leaves this floor with 5 cards plus the reward whether she keeps zero of
   her seven Stuff or five. Stuff never grows the deck; it only replaces starters, and the reward
   card is the whole of a floor's Stamina growth. Gray has 5 non-Stuff cards and 7 Stuff, so at
   most five can be kept and next floor's rent would then have nothing to Scrap. Keeping the four
   best plus In Step.** `[agent]` (log 366)

   Shape, and the run's central finding. Under Ascending step 2 as written, Stamina after an
   Ascend equals the non-Stuff count before it, plus one reward. Good Stuff is a loan repaid in
   starters. That was fine while starters were weak and pools were full. It is what emptied both
   decks by floor 7: seven Ascends, seven rewards each, and the pools held nine and ten.

9. **Overgrown Hydroponics Bay prints Scramble 6 (Clear, but both get Bad Stuff) and Scramble 11
   (Clear, and both get Good Stuff) as two challenges, not two thresholds of one. Under the Outcome
   rule both resolve at Scramble 11, so the best line still hands out two Bad Stuff. If the two
   lines were one challenge, only the 11 would resolve. Question for the designer: is the spore
   cloud meant to hit you even when you clear it cleanly? The cards.yaml shape follows the proposal
   as written; this is the first room where the challenge-versus-threshold distinction changes what
   a card does.** `[agent]` (log 460)

   Rulebook and content question. Smoldering Armory has the same shape (Oomph 10, Oomph 16) and
   was not met this run. The proposal writes one threshold per challenge everywhere except its
   dual-stat lines, so it may not have meant the distinction the rulebook draws.

10. **Grav Harness asked 'Who draws a card?' and offered only Red. Gray's deck was empty but her
    discard pile held 4 cards. The rulebook's Empty deck keyword says a draw with an empty deck
    first shuffles the discard pile into a new deck, and Turn Start draws did exactly that for Gray
    two turns ago. So Gray should have been a legal choice. Suspected engine mismatch: a mid-Play
    draw choice excludes a character with an empty deck and a non-empty discard. I wanted Gray to
    draw for the Scramble; choosing Red instead.** `[agent]` (log 465)

    Engine mismatch, suspected. The same shape recurred on floor 7 (log 616: Grav Harness's draw went
    to Red again, Gray's deck being empty and her discard not). Turn Start reshuffled Gray's discard for her draw every time, so the
    engine knows the rule; only the mid-Play choice narrows the list.

11. **Spore Cloud (Holding: at Cleanup, discard down to 3) was in Gray's hand at Cleanup and Gray
    finished the turn holding 4: Distract & Pivot, Spore Cloud, Automated Salvage Kit and Riot
    Shield. Riot Shield returned to hand in the same Cleanup, so either Spore Cloud fired first on
    a 3-card hand and then Riot Shield came back, or it did not fire at all; the log shows no Spore
    Cloud discard either way. Rulebook question: in what order do 'at Cleanup' Holding effects and
    'at the end of the turn' returns resolve? Also: Panic in Red's hand now shows every threshold
    with '+2 Scramble (printed N)', which reads clearly.** `[agent]` (log 499)

    Rulebook question. Cleanup is one step in the rulebook (discard your play zone); Riot Shield
    says "at the end of the turn" and Spore Cloud "at Cleanup". Nothing orders them.

12. **Red's Ascend offer is two cards, not three: the proposed Red reward pool holds nine cards and
    Red has taken seven in five floors (five Ascends plus two Hub rewards). Gray's pool of ten is at
    seven taken. By floor 6 both pools will be empty and Ascending will pay nothing. Under the rent
    invariant the reward card is a character's only Stamina growth, so an empty pool means the deck
    can only shrink from here. Keeping Panic rather than shedding it: shedding Scraps a real card,
    holding a dead one costs nothing until it is drawn.** `[agent]` (log 527)

    Content shape. A ten-floor run offers at least ten Ascend rewards per character plus room
    rewards; the Hub alone paid two per visit. The old list had seven Woah rewards on top of these
    pools; the proposal has none. Also a card observation: keeping Bad Stuff was always the right
    call, because shedding it costs a Scrap and holding it costs nothing until drawn.

13. **Laser Grid Security Hall on floor 7: Scramble 14 or Oomph 18, Flee is both Exhaust 4. Gray
    has 5 live cards and all 5 are in hand, so a Flee would Exhaust from an empty deck and an empty
    discard and put her Down. Six floors of rent and a ten-card reward pool that is now empty have
    left Gray with exactly the Stamina one Flee costs. Clearing is the only move.** `[agent]`
    (log 606)

    Shape. From floor 7 on, every band 3 Flee line was lethal for Gray, so there was no decision
    about whether to commit; the only question each turn was whether the cards could reach the
    number. They could, three times running, on In Step.

14. **Laser Grid's 'Gray reveals a card reward' resolved to nothing: Gray's reward pool is empty
    (all ten cards taken by floor 6) and the log printed no line saying so. The rulebook does not
    say what an empty reward pool does; the outcome just vanished. Rulebook question, and a CLI
    note: an outcome that does nothing should say so. Bio-Hazard Containment Vault's room rule
    shows up as 'scrap <character> <card> for <stat>' in the moves hint, which is how I would have
    expected to find it.** `[agent]` (log 645)

    Rulebook gap and CLI friction. On the Vault the engine still asked "Whose reward pool is
    revealed?" with both pools empty (after log 663) and the answer did nothing. At the floor 7 Ascend it
    printed "Offered: Red: nothing".

15. **Seven floors in twenty turns, and the decks are gone: after this Ascend Red has five cards
    plus Panic and Gray has two, In Step and Riot Shield. Neither pool has a reward left, so both
    decks can only shrink. Gray's best turn is now In Step paid with her other card, about Scramble
    6, so the Monolith Core's Oomph 10 and Scramble 10 is out of reach and so is the Sentinel's.
    The run did not die of Exhaust; it died of rent on a reward pool that ran out on floor 6. Both
    of us will play floor 8 as far as it goes.** `[agent]` (log 712)

    Shape. Red ended the run with an empty Exhaust pile: Second Wind, Hit 'n Run and Stitch-Em-Ups
    healed every Exhaust the run took. The Scrapyard, not the Exhaust pile, is where this run's
    Stamina went.

16. **Gray went Down at Turn Start, not to a Flee. She had two live cards, drew both, and the third
    draw of 'draw up to five' found an empty deck and an empty discard pile, which the Empty deck
    keyword says is Down. So under 0.2 as written, holding fewer than five cards in deck and discard
    together is death at the next Turn Start, before any room is faced. The engine did what the
    rulebook says. Question for the designer: is a Turn Start draw with nothing left to draw meant
    to put a character Down, or does 'draw up to five' stop when the cards run out? The Stamina line
    in About the game ('if you need a card and have none left, you go Down') reads either way.**
    `[agent]` (log 734)

    Rulebook question, the most consequential of the run. Each Turn's step 2 says "draws cards
    from their deck until they hold 5", and Empty deck says a draw with nothing to draw is Down.
    Read together they make five cards the floor of Stamina, and the last two floors of any run a
    countdown. Playtest 4 never saw this because its decks never dropped below nine.

## What the run showed

**1. Rent plus small reward pools empties the decks, and the rulebook then kills the smaller one at
Turn Start.** Settle your Stuff Scraps one non-Stuff card per Good Stuff kept, every Ascend, so a
character's Stamina after an Ascend is its non-Stuff count plus one reward (note 8). The proposal's
pools of nine and ten rewards were gone by floor 6 (note 12), and from there both decks could only
shrink. Gray reached floor 8 with two cards and went Down drawing up to five (note 16). None of this
came from Exhaust, which the heal cards kept at zero; all of it came from the Scrapyard. Three
things need a look, and they are separate: the rent rule's shape, the size of the reward pools, and
whether "draw up to five" from nothing is meant to be Down.

**2. Three suspected engine mismatches, none of which changed an outcome.** Junk Launcher counts
every card paid this turn, not only its own payers, against its reworded text (note 7). A mid-Play
"one of you draws" excludes a character whose deck is empty but whose discard is not (note 10).
"Any deck" on Hack the Doors means the two character decks, not the Floor deck (note 6); that one
may be a reading rather than a bug. The two dual-stat mechanics added for this list behaved as the
rulebook says every time: both stats had to be met, Panic added its 2 to the Scramble half, the
table showed both numbers with the modified one marked.

**3. The proposal's rooms play well and its pools are too small for them.** Every room fell on its
first try and nothing was Fled in twenty-one turns. The dual-stat lines were the best moments of the
run: Flooded Ventilation Shaft's free Good Stuff for a Charge In and a Pick The Lock, Gears &
Glitch and The Iron Sentinel asking for exactly the split the two decks were built to make, In Step
turning Red's plays into Gray's Scramble (notes 2, 13). But band 1 has five Rooms against a
required 24 and one Stairwell against three (note 1), so floors were one to two turns long, the
Stairwell was met on turn 2, and a ten-floor run needed only about 28 turns. The pace is a symptom
of the pool sizes, not of the rooms.

## The CLI as a playtest tool

- **A question with one answer, or none, still asks.** "Who draws a card?" with only Red to
  choose (logs 464, 616) and "Whose reward pool is revealed?" with both pools empty (log 663) each
  cost a call and told the playtester nothing. The first hid a finding behind a refusal; the second
  should have been one printed line saying the outcome did nothing.
- **An outcome that does nothing prints nothing.** "Gray reveals a card reward" from an empty pool
  left no trace in the log (note 14). A reader of the transcript cannot tell it resolved.
- **The Ascend questions come in a fixed order the playtester has to discover.** An answer naming
  a different Stuff card than the one being asked about is refused, and the order is only visible
  through `show`. Twice this run a `show` call was needed just to learn which card was next.
  Printing the whole queue once, at the first question, would save that.
- **`show --events N` counts a note as one event** and prints it in full, so a long note pushes
  the actual events out of the window.
- Things that worked: the dual-stat threshold line with its tick and "(printed N)" when Panic
  raised it; "Floor N is built: K rooms." exposing the pool shortage on the first line of the run;
  `scrap <character> <card> for <stat>` appearing in the moves hint only on the room that allows
  it; the per-question Ascend, which never dropped a legal combination the way playtest 4's list
  did; "A look at the Floor deck: ..." printing the peek in one line; and the refusal itself, which
  is how note 10 was found.

Two friction points were the playtester's own pipeline, not the tool: filtering output through
`grep` swallowed two refusals until `show --moves` was called, and a chained call after a refusal
had to be re-run by hand.

## Candidate issues

Engine mismatches, suspected:

- Junk Launcher gains Oomph for every card paid this turn, not only for the cards spent to play it
  (note 7; logs 294, 515, 701). The reworded text narrows the count.
- A mid-Play "one of you draws 1 card" (Grav Harness) offers only characters whose deck is not
  empty; a character with an empty deck and a non-empty discard pile should be a legal choice under
  Empty deck (note 10; logs 464, 616).
- "Any deck" on Hack the Doors and Catch Your Breath resolves to the two character decks; the
  Floor deck is not offered (note 6). May be a reading rather than a bug; see the rulebook question.

Rulebook questions for the designer:

- Does "draw up to five" put a character Down when deck and discard run out mid-draw, or does the
  draw stop short? As written, fewer than five live cards is Down at the next Turn Start (note 16).
- Does "any deck" on a card include the Floor deck and the reward pools, or only the character
  decks? (note 6)
- What does "reveals a card reward" do when the reward pool is empty? (note 14)
- In what order do "at Cleanup" Holding effects (Spore Cloud) and "at the end of the turn" returns
  (Riot Shield) resolve? (note 11)
- Is Overgrown Hydroponics Bay meant to pay its Bad Stuff even when Scramble 11 is met? Its two
  lines are two challenges in the proposal, so both resolve. Smoldering Armory has the same shape.
  (note 9)

Shape, independent of tuning:

- Settle your Stuff's rent makes a character's card count invariant at Ascend: Stuff replaces
  starters and never adds to the deck, so the reward card is the only Stamina growth. Once the
  weak starters are gone, rent Scraps good cards, and once the pools are empty the deck only
  shrinks (notes 4, 5, 8, 15).
- The reward pools are the run's Stamina budget under that rule. Nine and ten cards ran out on
  floor 6 of ten (note 12).
- With decks this small an Exhaust line often names a known card rather than a random one (note 3).
- Every band 3 Flee line was lethal for Gray from floor 7 on, which removed the commit-or-flee
  decision (note 13).

Card observations, inputs for a later re-tune:

- Band 1: five Rooms and one Stairwell against the 24 and three that issue #66 asks for; the
  agent raised the Stairwell count to three on this branch (note 1). Band 2 has seven Rooms, band
  3 six.
- The Sentry Drone at Oomph 8 or Scramble 8 is above two starter hands; the greedy bot loses on
  floor 1 in 20 of 20 seeds, Fleeing it until Down (note 2). A player who buys one Good Stuff first
  clears it.
- In Step (Scramble equal to twice Red's plays) was worth 4 to 8 on every Stairwell and every band
  3 room, and carried the run; the free plays (Fast Follow, Stim Pack, Coil Of Cable, Crowbar) are
  what make three or four Red plays a turn routine.
- Crowbar's "one additional Good Stuff" fired three times and made Gray the Stuff-rich side;
  combined with the rent invariant this only meant more choice, not more Stamina.
- Riot Shield again cleared rooms for one card a turn, as in playtests 3 and 4, and was the last
  Stuff standing.
- Keeping Bad Stuff at Ascend was always correct (note 12); the Automated Salvage Kit was the only
  thing that ever removed one.
- Emergency Power Core (free 3/3, Exhaust 2) was returned at its first Ascend: the Exhaust is a
  second Stamina cost on top of the rent.

CLI improvements:

- Skip, or answer in one line, a question with one legal answer or none (notes 10, 14).
- Narrate an outcome that resolves to nothing (note 14).
- Print the whole Ascend question queue at the first question.
- `show --events N`: count a note as one line, or print notes separately.

## Appendix: the run transcript

`bin/nvu replay design/playtests/05-proposed-card-list.json`, verbatim.

```
  1. Floor 1 is built: 6 rooms.
  2. You are in: Security Turnstile.
  3. Red draws Overdrive.
  4. Red draws Shove.
  5. Red draws Charge In.
  6. Red draws Shove.
  7. Red draws Lean In.
  8. Gray draws Pick The Lock.
  9. Gray draws Peek Around Corner.
 10. Gray draws Work The Angles.
 11. Gray draws Peek Around Corner.
 12. Gray draws Duck Under.
 13. NOTE — Floor 1 is built with 6 cards, not the rulebook's 10: band 1 of the proposed list holds only 5 Room cards (3 Security Turnstile, 2 Flooded Ventilation Shaft) plus the Stairwell. The rulebook says nothing about a short pool, and the floor is legal as built, but this is a quarter of the 24 rooms issue 66 asks band 1 to hold. Cleared rooms leave the pool for the rest of the run, so floors 2 and 3 will be thinner still.
 14. Red discards Shove from their hand.
 15. Red discards Shove from their hand.
 16. Red pays with Shove, Shove.
 17. Red plays Charge In.
 18. Red discards Overdrive from their hand.
 19. Red pays with Overdrive.
 20. Red plays Lean In.
 21. Oomph 5 met — Clear, and Red gets Good Stuff, but both of you Exhaust 1.
 22. Security Turnstile is Cleared.
 23. Red gets Grav Harness.
 24. Red takes Grav Harness into hand.
 25. Red Exhausts Charge In.
 26. Gray Exhausts Duck Under.
 27. Cleanup.
 28. Red discards Charge In from their play zone.
 29. Red discards Lean In from their play zone.
 30. — end of turn 1 —
 31. You are in: The Sentry Drone.
 32. Red draws Charge In.
 33. Red draws Shove.
 34. Red draws Charge In.
 35. Red draws Shove.
 36. NOTE — Turn 2 and the Stairwell is already up: a 6-card floor deck makes that a 1-in-5 chance each flip. Oomph 8 or Scramble 8 is out of reach for the starter hands alone (Red's best five cards make Oomph 8 only with both Overdrives, Exhausting 4; Gray's make Scramble 6). The Grav Harness Red bought last turn is what makes it reachable: its Scramble 3 plus Pick The Lock and Duck Under is 9. Going for the Scramble line, which also pays a Good Stuff.
 37. Red discards Shove from their hand.
 38. Red discards Shove from their hand.
 39. Red pays with Shove, Shove.
 40. Red plays Grav Harness.
 41. Gray draws Pick The Lock.
 42. Gray discards Peek Around Corner from their hand.
 43. Gray discards Peek Around Corner from their hand.
 44. Gray pays with Peek Around Corner, Peek Around Corner.
 45. Gray plays Pick The Lock.
 46. Gray discards Work The Angles from their hand.
 47. Gray pays with Work The Angles.
 48. Gray plays Duck Under.
 49. Scramble 8 met — Ascend, and one of you gets Good Stuff.
 50. The Sentry Drone is Cleared.
 51. Gray gets Coil Of Cable.
 52. Gray takes Coil Of Cable into hand.
 53. Cleanup.
 54. Red discards Grav Harness from their play zone.
 55. Gray discards Pick The Lock from their play zone.
 56. Gray discards Duck Under from their play zone.
 57. — end of turn 2 —
 58. Floor 1 is clear.
 59. Red shuffles 2 card(s) back in.
 60. Shove is Scrapped.
 61. Red takes Junk Launcher.
 62. Red shuffles 1 card(s) back in.
 63. Gray shuffles 2 card(s) back in.
 64. Peek Around Corner is Scrapped.
 65. Gray takes Hack the Doors.
 66. Gray shuffles 1 card(s) back in.
 67. Floor 2 is built: 5 rooms.
 68. You are in: Flooded Ventilation Shaft.
 69. Red draws Charge In.
 70. Red draws Junk Launcher.
 71. Red draws Overdrive.
 72. Red draws Charge In.
 73. Red draws Charge In.
 74. Gray draws Pick The Lock.
 75. Gray draws Pick The Lock.
 76. Gray draws Pick The Lock.
 77. Gray draws Duck Under.
 78. Gray draws Duck Under.
 79. Red discards Overdrive from their hand.
 80. Red discards Charge In from their hand.
 81. Red pays with Overdrive, Charge In.
 82. Red plays Charge In.
 83. Gray discards Duck Under from their hand.
 84. Gray discards Duck Under from their hand.
 85. Gray pays with Duck Under, Duck Under.
 86. Gray plays Pick The Lock.
 87. Scramble 4 met — Clear.
 88. Oomph 3 and Scramble 3 met — Clear, and Gray gets Good Stuff.
 89. Flooded Ventilation Shaft is Cleared.
 90. Gray gets Emergency Power Core.
 91. Gray takes Emergency Power Core into hand.
 92. Cleanup.
 93. Red discards Charge In from their play zone.
 94. Gray discards Pick The Lock from their play zone.
 95. — end of turn 3 —
 96. You are in: Security Turnstile.
 97. Red's deck is empty — the discard pile shuffles in to make a new one (10 cards).
 98. Red draws Shove.
 99. Red draws Lean In.
100. Red draws Overdrive.
101. Gray draws Coil Of Cable.
102. Gray draws Pick The Lock.
103. Red discards Shove from their hand.
104. Red discards Lean In from their hand.
105. Red pays with Shove, Lean In.
106. Red plays Junk Launcher.
107. Oomph 5 met — Clear, and Red gets Good Stuff, but both of you Exhaust 1.
108. Security Turnstile is Cleared.
109. Red gets Duct Tape & Wire.
110. Red takes Duct Tape & Wire into hand.
111. Red Exhausts Charge In.
112. Gray Exhausts Hack the Doors.
113. Cleanup.
114. Red discards Junk Launcher from their play zone.
115. — end of turn 4 —
116. NOTE — That Exhaust took Hack the Doors, the reward Gray chose two turns ago, and it was no surprise in hindsight: Gray's deck held exactly one card, and I could have worked out which. The Scramble 3 line would have cleared this room for free with Coil Of Cable. I paid two Stamina for a Duct Tape and lost the better card. A player's mistake, not the game's, but it shows how 0.2's permanent Exhaust punishes a known top card: with a one-card deck, 'Exhaust 1' is a targeted loss, not a random one.
117. You are in: Security Turnstile.
118. Red draws Shove.
119. Red draws Charge In.
120. Gray plays Coil Of Cable.
121. Scramble 3 met — Clear.
122. Security Turnstile is Cleared.
123. Cleanup.
124. Gray discards Coil Of Cable from their play zone.
125. — end of turn 5 —
126. You are in: Flooded Ventilation Shaft.
127. Gray's deck is empty — the discard pile shuffles in to make a new one (8 cards).
128. Gray draws Duck Under.
129. Red discards Shove from their hand.
130. Red discards Overdrive from their hand.
131. Red pays with Shove, Overdrive.
132. Red plays Charge In.
133. Gray discards Duck Under from their hand.
134. Gray discards Pick The Lock from their hand.
135. Gray pays with Duck Under, Pick The Lock.
136. Gray plays Pick The Lock.
137. Scramble 4 met — Clear.
138. Oomph 3 and Scramble 3 met — Clear, and Gray gets Good Stuff.
139. Flooded Ventilation Shaft is Cleared.
140. Gray gets Crowbar.
141. Gray takes Crowbar into hand.
142. Cleanup.
143. Red discards Charge In from their play zone.
144. Gray discards Pick The Lock from their play zone.
145. — end of turn 6 —
146. You are in: The Sentry Drone.
147. Red draws Overdrive.
148. Red draws Shove.
149. Red draws Charge In.
150. Gray draws Pick The Lock.
151. Gray draws Duck Under.
152. Gray discards Pick The Lock from their hand.
153. Gray discards Duck Under from their hand.
154. Gray pays with Pick The Lock, Duck Under.
155. Gray plays Pick The Lock.
156. Gray plays Crowbar.
157. Gray plays Emergency Power Core.
158. Gray Exhausts Peek Around Corner.
159. Gray Exhausts Work The Angles.
160. Scramble 8 met — Ascend, and one of you gets Good Stuff.
161. The Sentry Drone is Cleared.
162. Gray gets A Pair Of Stitch-Em-Ups.
163. Gray takes A Pair Of Stitch-Em-Ups into hand.
164. Gray gets Pry Bar.
165. Gray takes Pry Bar into hand.
166. Cleanup.
167. Gray discards Pick The Lock from their play zone.
168. Gray discards Crowbar from their play zone.
169. Gray discards Emergency Power Core from their play zone.
170. — end of turn 7 —
171. Floor 2 is clear.
172. NOTE — Settle your Stuff asks about Grav Harness again, one floor after Red paid a Shove to keep it. So rent is due every Ascend: each Good Stuff kept costs one starter card per floor, and a floor here is one to four turns long. Gray is holding five Good Stuff and eight non-Stuff cards; keeping all five would leave three starters and make next floor's rent unpayable. Stuff reads as a loan against Stamina, not deck growth. Keeping four of Gray's five and returning Emergency Power Core, whose Exhaust 2 per play is a second Stamina cost on top of the rent.
173. Red shuffles 5 card(s) back in.
174. Shove is Scrapped.
175. Shove is Scrapped.
176. Red takes Reckless Swing.
177. Red shuffles 1 card(s) back in.
178. Gray shuffles 2 card(s) back in.
179. Duck Under is Scrapped.
180. Duck Under is Scrapped.
181. Duck Under is Scrapped.
182. Pick The Lock is Scrapped.
183. Gray takes In Step.
184. Gray shuffles 1 card(s) back in.
185. Floor 3 is built: 1 rooms.
186. You are in: The Sentry Drone.
187. Red draws Duct Tape & Wire.
188. Red draws Overdrive.
189. Red draws Charge In.
190. Red draws Charge In.
191. Red draws Reckless Swing.
192. Gray draws In Step.
193. Gray draws Coil Of Cable.
194. Gray draws A Pair Of Stitch-Em-Ups.
195. Gray draws Pry Bar.
196. Gray's deck is empty — the discard pile shuffles in to make a new one (5 cards).
197. Gray draws Crowbar.
198. Red discards Overdrive from their hand.
199. Red discards Reckless Swing from their hand.
200. Red pays with Overdrive, Reckless Swing.
201. Red plays Charge In.
202. Red discards Charge In from their hand.
203. Red pays with Charge In.
204. Red plays Duct Tape & Wire.
205. Gray discards Crowbar from their hand.
206. Gray pays with Crowbar.
207. Gray plays In Step.
208. Gray plays Coil Of Cable.
209. Gray discards Pry Bar from their hand.
210. Gray pays with Pry Bar.
211. Gray plays A Pair Of Stitch-Em-Ups.
212. Hack the Doors goes to Gray's deck.
213. Duck Under goes to Gray's deck.
214. Scramble 8 met — Ascend, and one of you gets Good Stuff.
215. The Sentry Drone is Cleared.
216. Red gets Stim Pack.
217. Red takes Stim Pack into hand.
218. Cleanup.
219. Red discards Charge In from their play zone.
220. Red discards Duct Tape & Wire from their play zone.
221. Gray discards In Step from their play zone.
222. Gray discards Coil Of Cable from their play zone.
223. Gray discards A Pair Of Stitch-Em-Ups from their play zone.
224. — end of turn 8 —
225. Floor 3 is clear.
226. NOTE — Rent is a swap, not a loss, while a weaker starter is left to Scrap: keeping Duct Tape & Wire (cost 1, 2/2) by Scrapping Lean In (cost 1, 1/1) improves Red's deck at the same card count. After this Ascend Red has no Lean In or Overdrive left and Gray is down to one Pick The Lock, so next floor's rent comes out of good cards. Three floors in eight turns; band 2 starts on floor 4 with rooms asking 7 to 11 per stat.
227. Red shuffles 1 card(s) back in.
228. Overdrive is Scrapped.
229. Overdrive is Scrapped.
230. Lean In is Scrapped.
231. Red takes Tag Team.
232. Red shuffles 1 card(s) back in.
233. Pick The Lock is Scrapped.
234. Pick The Lock is Scrapped.
235. Duck Under is Scrapped.
236. Pick The Lock is Scrapped.
237. Gray takes One Man's Junk.
238. Gray shuffles 1 card(s) back in.
239. Floor 4 is built: 7 rooms.
240. You are in: Automated Defense Turret.
241. Red draws Tag Team.
242. Red draws Stim Pack.
243. Red draws Grav Harness.
244. Red's deck is empty — the discard pile shuffles in to make a new one (7 cards).
245. Red draws Duct Tape & Wire.
246. Red draws Charge In.
247. Gray draws Pick The Lock.
248. Gray draws One Man's Junk.
249. Gray draws Hack the Doors.
250. Gray's deck is empty — the discard pile shuffles in to make a new one (5 cards).
251. Gray draws Pry Bar.
252. Gray draws Coil Of Cable.
253. Gray plays Coil Of Cable.
254. Red plays Stim Pack.
255. Red draws Junk Launcher.
256. Gray discards One Man's Junk from their hand.
257. Gray pays with One Man's Junk.
258. Gray plays Hack the Doors.
259. NOTE — Hack the Doors reads 'Look at top 3 cards of any deck, put back in any order.' I played it to look at the Floor deck and put Gears & Glitch where I wanted it, and the engine asked only 'Look at the top 3 of whose deck?' with Red or Gray as the choices. The rulebook's table has three kinds of face-down deck (Character deck, Reward pool, Floor deck) and the glossary calls the Floor deck a deck. Suspected engine mismatch, or a rulebook question: does 'any deck' on a card mean the character decks only?
260. A look at Gray's deck: In Step, Crowbar, A Pair Of Stitch-Em-Ups.
261. Red discards Charge In from their hand.
262. Red pays with Charge In.
263. Red plays Tag Team.
264. Red draws Charge In.
265. Scramble 8 met — Clear, and Gray gets Good Stuff.
266. Automated Defense Turret is Cleared.
267. Gray gets Overcharged Battery.
268. Gray takes Overcharged Battery into hand.
269. Cleanup.
270. Red discards Stim Pack from their play zone.
271. Red discards Tag Team from their play zone.
272. Gray discards Coil Of Cable from their play zone.
273. Gray discards Hack the Doors from their play zone.
274. — end of turn 9 —
275. You are in: Pressurized Maintenance Hub.
276. Red draws Reckless Swing.
277. Gray draws Crowbar.
278. Gray draws In Step.
279. Red discards Charge In from their hand.
280. Red discards Reckless Swing from their hand.
281. Red pays with Charge In, Reckless Swing.
282. Red plays Junk Launcher.
283. Red discards Grav Harness from their hand.
284. Red pays with Grav Harness.
285. Red plays Duct Tape & Wire.
286. Gray discards Pick The Lock from their hand.
287. Gray pays with Pick The Lock.
288. Gray plays Overcharged Battery.
289. Gray plays In Step.
290. Oomph 7 met — Clear, and Red reveals a card reward.
291. Scramble 7 met — Clear, and Gray reveals a card reward.
292. Pressurized Maintenance Hub is Cleared.
293. Red's reward pool shows Cross Punch.
294. NOTE — Junk Launcher counted a payer that was not its own. Red paid Charge In and Reckless Swing for it (pool Oomph 6, as printed: 2 plus 2 per card), then paid Grav Harness for Duct Tape & Wire, and the pool went to 10, not 8: Junk Launcher gained another 2 for the card spent on Duct Tape. The printed text (cards.yaml) is 'This card gains Oomph +2 for each card spent to play it this turn'; the old wording counted every card paid this turn. Suspected engine mismatch with the reworded card. It did not change this room's outcome.
295. Red takes Cross Punch.
296. Gray's reward pool shows Covering Fire.
297. Gray takes Covering Fire.
298. Cleanup.
299. Red discards Junk Launcher from their play zone.
300. Red discards Duct Tape & Wire from their play zone.
301. Gray discards Overcharged Battery from their play zone.
302. Gray discards In Step from their play zone.
303. — end of turn 10 —
304. You are in: Automated Defense Turret.
305. Red draws Cross Punch.
306. Red draws Charge In.
307. Red draws Shove.
308. Red's deck is empty — the discard pile shuffles in to make a new one (8 cards).
309. Red draws Grav Harness.
310. Red draws Junk Launcher.
311. Gray draws Covering Fire.
312. Gray draws A Pair Of Stitch-Em-Ups.
313. Gray's deck is empty — the discard pile shuffles in to make a new one (6 cards).
314. Gray draws Coil Of Cable.
315. Gray discards Pry Bar from their hand.
316. Gray pays with Pry Bar.
317. Gray plays Covering Fire.
318. Gray plays Coil Of Cable.
319. Gray plays Crowbar.
320. Red discards Shove from their hand.
321. Red discards Charge In from their hand.
322. Red pays with Shove, Charge In.
323. Red plays Grav Harness.
324. Gray draws Pick The Lock.
325. Gray draws One Man's Junk.
326. Scramble 8 met — Clear, and Gray gets Good Stuff.
327. Automated Defense Turret is Cleared.
328. Gray gets High-Frequency Scanner.
329. Gray takes High-Frequency Scanner into hand.
330. Gray gets Riot Shield.
331. Gray takes Riot Shield into hand.
332. Cleanup.
333. Red discards Grav Harness from their play zone.
334. Gray discards Covering Fire from their play zone.
335. Gray discards Coil Of Cable from their play zone.
336. Gray discards Crowbar from their play zone.
337. — end of turn 11 —
338. You are in: Gears & Glitch.
339. Red draws Reckless Swing.
340. Red draws Charge In.
341. Red draws Stim Pack.
342. Red discards Charge In from their hand.
343. Red discards Reckless Swing from their hand.
344. Red pays with Charge In, Reckless Swing.
345. Red plays Junk Launcher.
346. Red plays Stim Pack.
347. Red draws Charge In.
348. Gray discards A Pair Of Stitch-Em-Ups from their hand.
349. Gray discards One Man's Junk from their hand.
350. Gray pays with A Pair Of Stitch-Em-Ups, One Man's Junk.
351. Gray plays Pick The Lock.
352. Gray discards High-Frequency Scanner from their hand.
353. Gray pays with High-Frequency Scanner.
354. Gray plays Riot Shield.
355. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
356. Gears & Glitch is Cleared.
357. Red's reward pool shows Second Wind.
358. Red takes Second Wind.
359. Cleanup.
360. Gray takes Riot Shield into hand.
361. Red discards Junk Launcher from their play zone.
362. Red discards Stim Pack from their play zone.
363. Gray discards Pick The Lock from their play zone.
364. — end of turn 12 —
365. Floor 4 is clear.
366. NOTE — The rent makes a character's card count invariant at Ascend: keeping k Good Stuff Scraps k non-Stuff cards, so Gray leaves this floor with 5 cards plus the reward whether she keeps zero of her seven Stuff or five. Stuff never grows the deck; it only replaces starters, and the reward card is the whole of a floor's Stamina growth. Gray has 5 non-Stuff cards and 7 Stuff, so at most five can be kept and next floor's rent would then have nothing to Scrap. Keeping the four best plus In Step.
367. Red shuffles 2 card(s) back in.
368. Charge In is Scrapped.
369. Charge In is Scrapped.
370. Shove is Scrapped.
371. Red takes Fast Follow.
372. Red shuffles 1 card(s) back in.
373. Gray shuffles 1 card(s) back in.
374. Hack the Doors is Scrapped.
375. Covering Fire is Scrapped.
376. Pick The Lock is Scrapped.
377. One Man's Junk is Scrapped.
378. Gray takes Distract & Pivot.
379. Gray shuffles 1 card(s) back in.
380. Floor 5 is built: 5 rooms.
381. You are in: Automated Defense Turret.
382. Red draws Tag Team.
383. Red draws Second Wind.
384. Red draws Fast Follow.
385. Red draws Duct Tape & Wire.
386. Red draws Cross Punch.
387. Gray draws In Step.
388. Gray draws Riot Shield.
389. Gray draws Distract & Pivot.
390. Gray's deck is empty — the discard pile shuffles in to make a new one (3 cards).
391. Gray draws Pry Bar.
392. Gray draws Crowbar.
393. Gray plays Crowbar.
394. Gray discards Pry Bar from their hand.
395. Gray pays with Pry Bar.
396. Gray plays Riot Shield.
397. Red discards Second Wind from their hand.
398. Red pays with Second Wind.
399. Red plays Tag Team.
400. Red's deck is empty — the discard pile shuffles in to make a new one (6 cards).
401. Red draws Second Wind.
402. Red plays Fast Follow.
403. Gray discards Distract & Pivot from their hand.
404. Gray pays with Distract & Pivot.
405. Gray plays In Step.
406. Scramble 8 met — Clear, and Gray gets Good Stuff.
407. Automated Defense Turret is Cleared.
408. Gray gets Cutting Torch.
409. Gray takes Cutting Torch into hand.
410. Gray gets High-Frequency Scanner.
411. Gray takes High-Frequency Scanner into hand.
412. Cleanup.
413. Gray takes Riot Shield into hand.
414. Red discards Tag Team from their play zone.
415. Red discards Fast Follow from their play zone.
416. Gray discards Crowbar from their play zone.
417. Gray discards In Step from their play zone.
418. — end of turn 13 —
419. You are in: Pressurized Maintenance Hub.
420. Red draws Stim Pack.
421. Red draws Junk Launcher.
422. Gray draws Coil Of Cable.
423. Gray's deck is empty — the discard pile shuffles in to make a new one (4 cards).
424. Gray draws Crowbar.
425. Gray discards Cutting Torch from their hand.
426. Gray pays with Cutting Torch.
427. Gray plays High-Frequency Scanner.
428. A look at the Floor deck: Overgrown Hydroponics Bay, Gears & Glitch, Overgrown Hydroponics Bay.
429. Gray plays Coil Of Cable.
430. Gray plays Crowbar.
431. Red discards Cross Punch from their hand.
432. Red discards Duct Tape & Wire from their hand.
433. Red pays with Cross Punch, Duct Tape & Wire.
434. Red plays Second Wind.
435. Red shuffles 1 card(s) back in.
436. Red plays Stim Pack.
437. Red draws Reckless Swing.
438. Oomph 7 met — Clear, and Red reveals a card reward.
439. Scramble 7 met — Clear, and Gray reveals a card reward.
440. Pressurized Maintenance Hub is Cleared.
441. Red's reward pool shows Heavy Pockets.
442. Red takes Heavy Pockets.
443. Gray's reward pool shows Here, Catch.
444. Gray takes Here, Catch.
445. Cleanup.
446. Red discards Second Wind from their play zone.
447. Red discards Stim Pack from their play zone.
448. Gray discards High-Frequency Scanner from their play zone.
449. Gray discards Coil Of Cable from their play zone.
450. Gray discards Crowbar from their play zone.
451. — end of turn 14 —
452. You are in: Overgrown Hydroponics Bay.
453. Red draws Heavy Pockets.
454. Red draws Grav Harness.
455. Red draws Charge In.
456. Gray draws Here, Catch.
457. Gray draws In Step.
458. Gray draws Pry Bar.
459. Gray draws Distract & Pivot.
460. NOTE — Overgrown Hydroponics Bay prints Scramble 6 (Clear, but both get Bad Stuff) and Scramble 11 (Clear, and both get Good Stuff) as two challenges, not two thresholds of one. Under the Outcome rule both resolve at Scramble 11, so the best line still hands out two Bad Stuff. If the two lines were one challenge, only the 11 would resolve. Question for the designer: is the spore cloud meant to hit you even when you clear it cleanly? The cards.yaml shape follows the proposal as written; this is the first room where the challenge-versus-threshold distinction changes what a card does.
461. Red discards Charge In from their hand.
462. Red discards Reckless Swing from their hand.
463. Red pays with Charge In, Reckless Swing.
464. Red plays Grav Harness.
465. NOTE — Grav Harness asked 'Who draws a card?' and offered only Red. Gray's deck was empty but her discard pile held 4 cards. The rulebook's Empty deck keyword says a draw with an empty deck first shuffles the discard pile into a new deck, and Turn Start draws did exactly that for Gray two turns ago. So Gray should have been a legal choice. Suspected engine mismatch: a mid-Play draw choice excludes a character with an empty deck and a non-empty discard. I wanted Gray to draw for the Scramble; choosing Red instead.
466. Red draws Charge In.
467. Red discards Charge In from their hand.
468. Red pays with Charge In.
469. Red plays Heavy Pockets.
470. Gray discards Here, Catch from their hand.
471. Gray pays with Here, Catch.
472. Gray plays In Step.
473. Gray discards Pry Bar from their hand.
474. Gray pays with Pry Bar.
475. Gray plays Riot Shield.
476. Scramble 6 met — Clear, but both of you get Bad Stuff.
477. Scramble 11 met — Clear, and both of you get Good Stuff.
478. Overgrown Hydroponics Bay is Cleared.
479. Red gets Panic.
480. Red takes Panic into hand.
481. Gray gets Spore Cloud.
482. Gray takes Spore Cloud into hand.
483. Red gets A Pair Of Stitch-Em-Ups.
484. Red takes A Pair Of Stitch-Em-Ups into hand.
485. Gray gets Automated Salvage Kit.
486. Gray takes Automated Salvage Kit into hand.
487. Cleanup.
488. Gray takes Riot Shield into hand.
489. Red discards Grav Harness from their play zone.
490. Red discards Heavy Pockets from their play zone.
491. Gray discards In Step from their play zone.
492. — end of turn 15 —
493. You are in: Gears & Glitch.
494. Red's deck is empty — the discard pile shuffles in to make a new one (11 cards).
495. Red draws Tag Team.
496. Red draws Charge In.
497. Gray's deck is empty — the discard pile shuffles in to make a new one (7 cards).
498. Gray draws Cutting Torch.
499. NOTE — Spore Cloud (Holding: at Cleanup, discard down to 3) was in Gray's hand at Cleanup and Gray finished the turn holding 4: Distract & Pivot, Spore Cloud, Automated Salvage Kit and Riot Shield. Riot Shield returned to hand in the same Cleanup, so either Spore Cloud fired first on a 3-card hand and then Riot Shield came back, or it did not fire at all; the log shows no Spore Cloud discard either way. Rulebook question: in what order do 'at Cleanup' Holding effects and 'at the end of the turn' returns resolve? Also: Panic in Red's hand now shows every threshold with '+2 Scramble (printed N)', which reads clearly.
500. Gray discards Spore Cloud from their hand.
501. Gray pays with Spore Cloud.
502. Gray plays Automated Salvage Kit.
503. Spore Cloud is Scrapped.
504. Gray discards Distract & Pivot from their hand.
505. Gray pays with Distract & Pivot.
506. Gray plays Riot Shield.
507. Red discards Panic from their hand.
508. Red discards Charge In from their hand.
509. Red pays with Panic, Charge In.
510. Red plays Junk Launcher.
511. Red discards A Pair Of Stitch-Em-Ups from their hand.
512. Red pays with A Pair Of Stitch-Em-Ups.
513. Red plays Tag Team.
514. Red draws Charge In.
515. Oomph 12 met — Ascend.
516. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
517. Gears & Glitch is Cleared.
518. Gray's reward pool shows I'll Take That.
519. Gray takes I'll Take That.
520. Cleanup.
521. Gray takes Riot Shield into hand.
522. Red discards Junk Launcher from their play zone.
523. Red discards Tag Team from their play zone.
524. Gray discards Automated Salvage Kit from their play zone.
525. — end of turn 16 —
526. Floor 5 is clear.
527. NOTE — Red's Ascend offer is two cards, not three: the proposed Red reward pool holds nine cards and Red has taken seven in five floors (five Ascends plus two Hub rewards). Gray's pool of ten is at seven taken. By floor 6 both pools will be empty and Ascending will pay nothing. Under the rent invariant the reward card is a character's only Stamina growth, so an empty pool means the deck can only shrink from here. Keeping Panic rather than shedding it: shedding Scraps a real card, holding a dead one costs nothing until it is drawn.
528. Red shuffles 1 card(s) back in.
529. Charge In is Scrapped.
530. Reckless Swing is Scrapped.
531. Charge In is Scrapped.
532. Heavy Pockets is Scrapped.
533. Red takes Bull Rush.
534. Red shuffles 1 card(s) back in.
535. Gray shuffles 2 card(s) back in.
536. I'll Take That is Scrapped.
537. Here, Catch is Scrapped.
538. Distract & Pivot is Scrapped.
539. Gray takes Hit 'n Run.
540. Gray shuffles 1 card(s) back in.
541. Floor 6 is built: 2 rooms.
542. You are in: Gears & Glitch.
543. Red draws Bull Rush.
544. Red draws Second Wind.
545. Red draws Duct Tape & Wire.
546. Red draws Fast Follow.
547. Red draws Cross Punch.
548. Gray draws Riot Shield.
549. Gray draws In Step.
550. Gray draws Hit 'n Run.
551. Gray draws Coil Of Cable.
552. Gray's deck is empty — the discard pile shuffles in to make a new one (1 cards).
553. Gray draws Automated Salvage Kit.
554. Gray discards Automated Salvage Kit from their hand.
555. Gray pays with Automated Salvage Kit.
556. Gray plays Hit 'n Run.
557. Gray shuffles 1 card(s) back in.
558. Gray plays Coil Of Cable.
559. Gray discards In Step from their hand.
560. Gray pays with In Step.
561. Gray plays Riot Shield.
562. Red plays Fast Follow.
563. Red discards Cross Punch from their hand.
564. Red discards Bull Rush from their hand.
565. Red pays with Cross Punch, Bull Rush.
566. Red plays Second Wind.
567. Red shuffles 1 card(s) back in.
568. Oomph 7 and Scramble 7 met — Ascend, and one of you reveals a card reward.
569. Gears & Glitch is Cleared.
570. Gray's reward pool shows Quick Vault.
571. Gray takes Quick Vault.
572. Cleanup.
573. Gray takes Riot Shield into hand.
574. Red discards Fast Follow from their play zone.
575. Red discards Second Wind from their play zone.
576. Gray discards Hit 'n Run from their play zone.
577. Gray discards Coil Of Cable from their play zone.
578. — end of turn 17 —
579. Floor 6 is clear.
580. Red shuffles 1 card(s) back in.
581. Bull Rush is Scrapped.
582. Charge In is Scrapped.
583. Cross Punch is Scrapped.
584. Red takes Reckless.
585. Red shuffles 1 card(s) back in.
586. Gray shuffles 1 card(s) back in.
587. Work The Angles is Scrapped.
588. Hit 'n Run is Scrapped.
589. Quick Vault is Scrapped.
590. Gray takes Catch Your Breath.
591. Gray shuffles 1 card(s) back in.
592. Floor 7 is built: 4 rooms.
593. You are in: Laser Grid Security Hall.
594. Red draws Reckless.
595. Red draws Grav Harness.
596. Red draws Stim Pack.
597. Red draws Duct Tape & Wire.
598. Red's deck is empty — the discard pile shuffles in to make a new one (5 cards).
599. Red draws Junk Launcher.
600. Gray draws Riot Shield.
601. Gray draws Catch Your Breath.
602. Gray's deck is empty — the discard pile shuffles in to make a new one (3 cards).
603. Gray draws Automated Salvage Kit.
604. Gray draws In Step.
605. Gray draws Coil Of Cable.
606. NOTE — Laser Grid Security Hall on floor 7: Scramble 14 or Oomph 18, Flee is both Exhaust 4. Gray has 5 live cards and all 5 are in hand, so a Flee would Exhaust from an empty deck and an empty discard and put her Down. Six floors of rent and a ten-card reward pool that is now empty have left Gray with exactly the Stamina one Flee costs. Clearing is the only move.
607. Gray plays Coil Of Cable.
608. Red plays Stim Pack.
609. Red draws Second Wind.
610. Red discards Reckless from their hand.
611. Red pays with Reckless.
612. Red plays Duct Tape & Wire.
613. Red discards Junk Launcher from their hand.
614. Red discards Second Wind from their hand.
615. Red pays with Junk Launcher, Second Wind.
616. Red plays Grav Harness.
617. Red draws Tag Team.
618. Gray discards Catch Your Breath from their hand.
619. Gray pays with Catch Your Breath.
620. Gray plays Riot Shield.
621. Gray discards Automated Salvage Kit from their hand.
622. Gray pays with Automated Salvage Kit.
623. Gray plays In Step.
624. Scramble 14 met — Clear, and Gray reveals a card reward.
625. Laser Grid Security Hall is Cleared.
626. Cleanup.
627. Gray takes Riot Shield into hand.
628. Red discards Stim Pack from their play zone.
629. Red discards Duct Tape & Wire from their play zone.
630. Red discards Grav Harness from their play zone.
631. Gray discards Coil Of Cable from their play zone.
632. Gray discards In Step from their play zone.
633. — end of turn 18 —
634. You are in: Bio-Hazard Containment Vault.
635. Red draws Panic.
636. Red draws Fast Follow.
637. Red's deck is empty — the discard pile shuffles in to make a new one (6 cards).
638. Red draws Grav Harness.
639. Red draws Duct Tape & Wire.
640. Gray's deck is empty — the discard pile shuffles in to make a new one (4 cards).
641. Gray draws Coil Of Cable.
642. Gray draws Automated Salvage Kit.
643. Gray draws Catch Your Breath.
644. Gray draws In Step.
645. NOTE — Laser Grid's 'Gray reveals a card reward' resolved to nothing: Gray's reward pool is empty (all ten cards taken by floor 6) and the log printed no line saying so. The rulebook does not say what an empty reward pool does; the outcome just vanished. Rulebook question, and a CLI note: an outcome that does nothing should say so. Bio-Hazard Containment Vault's room rule shows up as 'scrap <character> <card> for <stat>' in the moves hint, which is how I would have expected to find it.
646. Gray plays Coil Of Cable.
647. Red plays Fast Follow.
648. Red discards Panic from their hand.
649. Red pays with Panic.
650. Red plays Duct Tape & Wire.
651. Red discards Grav Harness from their hand.
652. Red pays with Grav Harness.
653. Red plays Tag Team.
654. Red draws Stim Pack.
655. Red plays Stim Pack.
656. Red draws Reckless.
657. Gray discards Catch Your Breath from their hand.
658. Gray pays with Catch Your Breath.
659. Gray plays Riot Shield.
660. Gray discards Automated Salvage Kit from their hand.
661. Gray pays with Automated Salvage Kit.
662. Gray plays In Step.
663. Scramble 15 met — Clear, and one of you reveals a card reward.
664. Bio-Hazard Containment Vault is Cleared.
665. Cleanup.
666. Gray takes Riot Shield into hand.
667. Red discards Fast Follow from their play zone.
668. Red discards Duct Tape & Wire from their play zone.
669. Red discards Tag Team from their play zone.
670. Red discards Stim Pack from their play zone.
671. Gray discards Coil Of Cable from their play zone.
672. Gray discards In Step from their play zone.
673. — end of turn 19 —
674. You are in: The Iron Sentinel.
675. Red draws Junk Launcher.
676. Red draws Second Wind.
677. Red's deck is empty — the discard pile shuffles in to make a new one (6 cards).
678. Red draws Stim Pack.
679. Red draws Panic.
680. Gray's deck is empty — the discard pile shuffles in to make a new one (4 cards).
681. Gray draws Automated Salvage Kit.
682. Gray draws Coil Of Cable.
683. Gray draws In Step.
684. Gray draws Catch Your Breath.
685. Gray plays Coil Of Cable.
686. Red plays Stim Pack.
687. Red draws Duct Tape & Wire.
688. Red discards Panic from their hand.
689. Red discards Reckless from their hand.
690. Red pays with Panic, Reckless.
691. Red plays Junk Launcher.
692. Red discards Second Wind from their hand.
693. Red pays with Second Wind.
694. Red plays Duct Tape & Wire.
695. Gray discards Catch Your Breath from their hand.
696. Gray pays with Catch Your Breath.
697. Gray plays Riot Shield.
698. Gray discards Automated Salvage Kit from their hand.
699. Gray pays with Automated Salvage Kit.
700. Gray plays In Step.
701. Oomph 10 and Scramble 10 met — Ascend, and both of you reveal a card reward.
702. The Iron Sentinel is Cleared.
703. Cleanup.
704. Gray takes Riot Shield into hand.
705. Red discards Stim Pack from their play zone.
706. Red discards Junk Launcher from their play zone.
707. Red discards Duct Tape & Wire from their play zone.
708. Gray discards Coil Of Cable from their play zone.
709. Gray discards In Step from their play zone.
710. — end of turn 20 —
711. Floor 7 is clear.
712. NOTE — Seven floors in twenty turns, and the decks are gone: after this Ascend Red has five cards plus Panic and Gray has two, In Step and Riot Shield. Neither pool has a reward left, so both decks can only shrink. Gray's best turn is now In Step paid with her other card, about Scramble 6, so the Monolith Core's Oomph 10 and Scramble 10 is out of reach and so is the Sentinel's. The run did not die of Exhaust; it died of rent on a reward pool that ran out on floor 6. Both of us will play floor 8 as far as it goes.
713. Second Wind is Scrapped.
714. Reckless is Scrapped.
715. Red declines the reward.
716. Gray shuffles 1 card(s) back in.
717. Catch Your Breath is Scrapped.
718. Gray declines the reward.
719. Floor 8 is built: 3 rooms.
720. You are in: The Iron Sentinel.
721. Red draws Fast Follow.
722. Red draws Tag Team.
723. Red draws Grav Harness.
724. Red's deck is empty — the discard pile shuffles in to make a new one (3 cards).
725. Red draws Panic.
726. Red draws Junk Launcher.
727. Gray draws Riot Shield.
728. Gray's deck is empty — the discard pile shuffles in to make a new one (1 cards).
729. Gray draws In Step.
730. Gray is Down — drew from an empty deck and discard pile. The run is lost.
731. Gray discards Riot Shield from their hand.
732. Gray discards In Step from their hand.
733. You lose.
734. NOTE — Gray went Down at Turn Start, not to a Flee. She had two live cards, drew both, and the third draw of 'draw up to five' found an empty deck and an empty discard pile, which the Empty deck keyword says is Down. So under 0.2 as written, holding fewer than five cards in deck and discard together is death at the next Turn Start, before any room is faced. The engine did what the rulebook says. Question for the designer: is a Turn Start draw with nothing left to draw meant to put a character Down, or does 'draw up to five' stop when the cards run out? The Stamina line in About the game ('if you need a card and have none left, you go Down') reads either way.

Floor 8 · turn 21 · GameOver   floor deck 2, cleared 20   Good Stuff 10, Bad Stuff 7
Room: The Iron Sentinel (stairwell)
    Oomph 10 and Scramble 12 (printed 10): Ascend, and both of you reveal a card reward.
    Oomph 18 and Scramble 2 (printed 0): Ascend, but both of you Exhaust 3.
    Flee: Both of you Exhaust 4, and both of you get Bad Stuff.
Red: deck 1, discard 0, exhaust 0, hand 5
    Fast Follow [cost 1; Oomph 3] — If Gray played a card this turn, play this card for free.
    Tag Team [cost 1; Oomph 2, Scramble 2] — If Gray played a card this turn, draw 1 card.
    Grav Harness [cost 2; Oomph 3, Scramble 3; Good Stuff] — One of you draws 1 card.
    Panic [cost 1; Bad Stuff] — Holding: Every room threshold requires +2 Scramble to be met. Play: Exhaust 2.
    Junk Launcher [cost 2; Oomph 2] — This card gains Oomph +2 for each card spent to play it this turn.
Gray: deck 0, discard 2, exhaust 1, hand 0  DOWN
Outcome: Defeat

seed 5, 151 command(s) replayed, floor 8, turn 21, Defeat.
```
