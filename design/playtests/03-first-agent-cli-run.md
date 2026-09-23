# Playtest 3 — first agent run through the CLI

Recorded: 2026-09-21. Rules version: 0.1.0. Played by an agent standing in for a human playtester, in the CLI
(`bin/nvu`), seed 3, one shell call per move. The run reached floor 8 of 10 and was stopped at the
turn-25 limit with both characters alive. Neither character ever entered Last Stand.

Notes are the agent's, verbatim, tagged `[agent]`, in the order they were written into the run. The
analysis under each one is also the agent's. Nothing here is a ruling. A playtester checks a suspected
bug against `design/rulebook.md` and `design/cards.yaml` only. This run's agent also read the engine
source in several notes; those findings were verified separately before the note was merged, and the
ones that held are filed as issues. The rulebook says what is true.

The run file is `03-first-agent-cli-run.json`. The full transcript is the appendix, and notes cite
it by line.

## How the run went

Seed 3 turned the floor-1 Enemy room face up as the very first card. Red drew to a full hand, played
Overdrive and a Charge In for Oomph 6 against a threshold of 5, and the floor was over on turn 1.
Red took Junk Launcher, Gray took In Step.

Floor 2 went the other way and played like the game is meant to. Ration Locker paid four Good Stuff
at once, which handed Gray a Cutting Torch and Red a Pry Bar, and dropped the Good Stuff pool from
eight cards to four. Tool Cage paid two more. By the floor's Enemy room, Oomph 9, Red and Gray had
enough between them, and Gray's Cutting Torch carried half of it. Somewhere in there Riot Shield
arrived, and the rest of the run bent around it.

Floor 3 drained the Good Stuff pool to nothing on turn 7, and from that point every Stuff room in
the game paid out zero. Riot Shield covered for it. It is Scramble 3 for a cost of 1 and it returns
to hand every turn the room is cleared, so a Stuff room could be cleared for the price of one Gray
card, forever. Floors 3, 4 and 5 were all guarded by Villy at Oomph 9 and all fell to a Charge In
plus one Gray Oomph card.

Floor 5 was the only floor that bit. Ruptured Coolant Line handed both characters Bad Stuff, Red
drew Panic, and the Enemy room's Scramble line jumped from 9 to 11 while Panic sat in Red's hand.
Red paid Panic away as a cost and the floor fell anyway.

From floor 6 the run stopped being a game. Red had picked up Zen Mode, which cancels Exhaust while
held, which turns Reckless into Oomph 5 for one payment card with no drawback. Floor 6's Enemy was
Gross Thing That Looks Like A Cherry again, Oomph 5, the same card that guarded floor 1. Red cleared
it alone in one play. Floor 7 fell the same way. By floor 8 Red's reward pool was empty, both decks
were larger than they started, and the only question each turn was which card to spend.

The run ended at the turn limit on floor 8 with Red on 17 cards and Gray on 7. It was never close to
a loss after floor 1.

## Notes

1. **Turn 1 and the Enemy room is already face up. Oomph 5 clears the whole floor. Gray has no
   Oomph at all in the starter deck, so this is entirely Red's problem. Plan: draw Red only, hunt
   for Overdrive plus Charge In, which is Oomph 6 for two payment cards.** `[agent]` (log 5)

   The floor deck is shuffled with no constraint on where the Enemy room sits, so it can be the
   first room. A question for the designer: should the Enemy room be barred from the top of the
   floor deck, or is a one-turn floor an acceptable outcome of the shuffle?

2. **Gray sat out the whole Draw phase on purpose. Gray cannot add Oomph, and every card Gray draws
   is a card off Gray's stamina. It feels odd that the best play for one character is to do nothing
   at all, but the numbers are not close.** `[agent]` (log 10)

   Checked against `cards.yaml`. Gray's twelve starter cards are Duck Under, Pick The Lock and Peek
   Around Corner, and none of them prints Oomph. Against an Oomph-only room Gray's correct play is
   to spend nothing. The game is two-player co-operative and one player had no decision to make on
   the turn that decided the floor.

3. **The Play phase move list shows 24 options where there are only 7 real choices. Three identical
   Charge In cards make 18 lines that read the same. I cannot tell moves 1, 7 and 13 apart, and it
   does not matter which I pick, but I have to read all of them to find that out.** `[agent]`
   (log 11)

   A CLI problem, not a game one. The generator is complete by card identity, which is correct for
   the solver the spec names, but the printed list should collapse lines that differ only by which
   copy of a card is used.

4. **The tick next to a threshold once the pool reaches it is the single most useful thing on the
   table display. I stopped doing arithmetic and just watched for it.** `[agent]` (log 19)

   Nothing to fix. Recorded because it is the one piece of output that changed how the run was
   played.

5. **Floor 1 is over on turn 1. The Enemy room was the first card flipped and Oomph 5 is one good
   Red turn. No Stuff, no scavenging, no Hazards, one reward. Playtest 2 lost floor 1 outright; this
   is the same floor decided the opposite way by the shuffle alone. Whether the Enemy room can be
   the first room is a real design question.** `[agent]` (log 27)

   Floor 1 has ten rooms and one of them ends the floor. Clearing it first skips six Stuff rooms and
   three Hazards, so the run entered floor 2 with no Stuff and one reward each. That is a much
   poorer start than a floor played out, but it also costs almost no stamina. Which of those
   dominates is a balance question, not a bug.

6. **The rulebook says an Ascend outcome skips Cleanup. The log printed Cleanup and discarded both
   play-zone cards before Ascending. I prefer what the engine did, since otherwise the played cards
   are stranded in the play zone, but the rulebook and the engine do not agree here.** `[agent]`
   (log 28)

   Confirmed. The rulebook's Outcome section says "Skip the Cleanup phase and instead perform the
   steps in *Ascending*", and Ascending step 1 reads only the discard pile. The engine runs Cleanup
   first, which is why played cards survive. A question for the designer: should the rulebook be
   changed to say Cleanup happens and then Ascending, or should Ascending gain a line about the play
   zone?

7. **Reward choice. Junk Launcher is Oomph 6 for cost 2 when you pay with two cards, which is
   strictly better than Charge In. For Gray I want In Step: Gray's starter deck has no Oomph at all
   and In Step turns Red's turn into Gray Oomph, which is the co-op card the pair is missing. I Know
   Kung Fu has Oomph 5 but cost 3 needs a hand of four to deploy.** `[agent]` (log 29)

   A decision, recorded for the reasoning. In Step is the one Gray card that reads as genuinely
   co-operative rather than as a stat body, and it decided two later Enemy rooms.

8. **Chaining two moves in one go does not work: the list renumbers after every move, so my second
   pick was a different card. The error printed the whole help text instead of the new list. This is
   the CLI, not the game.** `[agent]` (log 45)

   CLI only. See the friction list below.

9. **One Stuff room with all four thresholds met took the Good Stuff pool from 8 to 4. That is half
   the pool for the whole run gone in a single turn on floor 2 of 10. Playtest 2 found the same
   thing and it is still here.** `[agent]` (log 67)

   Confirmed against `cards.yaml`. There are eight Good Stuff cards and not one of them prints a
   `count`, so the pool is eight cards for a ten-floor run. Playtest 2 note 8 ruled "add counts to
   the Good Stuff cards, scaled appropriately". That ruling has not been implemented in the card
   list yet.

10. **Cutting Torch is Oomph 5 in Gray's hand for cost 2. That is the answer to the Oomph-only Enemy
    room that killed playtest 2, and it came from a Stuff room rather than from Gray's deck. Gray's
    Oomph problem is real but Good Stuff does solve it, when the pool has anything left in it.**
    `[agent]` (log 68)

    This is the load-bearing link between two findings. Gray's only route to Oomph is Good Stuff,
    and the Good Stuff pool is eight cards for the whole run. Fixing either one alone leaves the
    other standing.

11. **Riot Shield reads like a broken card in the best way: Scramble 3 for cost 1, and it comes back
    to your hand every turn the room is Cleared. One payment card per turn buys Scramble 3 forever.
    I am going to lean on it and see if it holds up.** `[agent]` (log 72)

    It held up for the rest of the run. Card text confirmed in `cards.yaml`: Riot Shield, Good
    Stuff, cost 1, Scramble 3, "If the room is Cleared, return this to your hand at the end of the
    turn." Every Scramble room from floor 3 onward was cleared with Riot Shield and one payment
    card. A question for the designer: is a Stuff card that never leaves hand meant to be
    permanent, and if so should it be the cheapest Scramble in the game as well?

12. **Both hands are now four cards, three of them Good Stuff. Stuff arrives straight into hand, so
    winning Stuff rooms is also how you lose the ability to draw. I like that tension. It means a
    Stuff room is a real decision and not free money.** `[agent]` (log 85)

    The rulebook's Stuff section and the Draw rule combine into this on their own. Worth keeping.

13. **Collapsed Stairwell shows something sharp. Scramble 2 clears but costs both of us Exhaust 1,
    and Scramble 5 clears and pays a reward. Beating the high line does not let me skip the low
    line's punishment, because every met threshold resolves. So overshooting is never clean here. I
    think that is good design but it deserves to be said out loud somewhere.** `[agent]` (log 89)

    The rulebook's Outcome section does say "Resolve each cleared challenge's outcome", so the rule
    is there. It is not stated anywhere that a lower line can carry a cost the higher line does not
    cancel, which is the part a player has to discover.

14. **A Pair Of Stich-Em-Ups asked two questions in a row. The first answer, choosing which
    character to heal, printed no line at all, so from the output alone I could not tell the choice
    had registered. The second question offered fourteen pairs of which several read identically.**
    `[agent]` (log 99)

    CLI only. Answering a pending prompt that only narrows another prompt produces no event, so the
    CLI prints the table with a new question and no explanation of what happened.

15. **I was offered One Man's Junk with only its name. No cost, no stats, no text. I had to go and
    read the card list to answer. Anywhere the game asks me to take a card it should show me the
    card.** `[agent]` (log 108)

    CLI only. The Ascend offer prints full card faces; the Hazard reward reveal prints a bare name.

16. **Taking One Man's Junk anyway. Its condition, a Bad Stuff card played this turn, is dead for us
    right now, but the deck is the stamina total so any card is one more hit point and one more
    thing to pay costs with. It is strange that a card being bad barely matters when deck size is
    health.** `[agent]` (log 109)

    This is a consequence of deck-as-Stamina that runs through the whole run. A card that does
    nothing is still a hit point and still pays a cost, so there is no reason to decline a reward,
    ever. A question for the designer: should declining a reward be a real option, and if so what
    makes a bad card a bad idea to take?

17. **Floor 2's Enemy asks Oomph 9 and nothing else. Both Enemy rooms so far are Oomph-only, which
    means Gray's whole deck is irrelevant to the only room that ends a floor. Gray can only help
    through Good Stuff. That is the playtest 2 problem again, from a winning position instead of a
    losing one.** `[agent]` (log 119)

    Confirmed in `cards.yaml`. All three Enemy rooms print an Oomph threshold with the Ascend
    outcome. Villy adds a Scramble 9 line, but its outcome is "Flee this room for free", which is an
    escape and not a clear. There is no Scramble route out of any floor. This is playtest 2 note 12
    unchanged.

18. **Ascending heals the discard pile back into the deck, so cards drawn just before an Ascend cost
    nothing. I am going to draw purely to have cheap things to pay with, and keep the Good Stuff in
    hand rather than spend it, because Stuff in the discard pile gets Scrapped at Ascend and the
    rulebook says nothing about Stuff still in your hand. If holding Stuff through an Ascend is
    meant to work, that is a strong and hidden strategy. If it is not meant to work, the rulebook
    needs a line about it.** `[agent]` (log 120)

    Both halves confirmed. Ascending step 3 shuffles the discard pile back into the deck, so a card
    drawn on the turn that Ascends is free. Ascending step 1 reads only the discard pile, so Stuff
    in hand is untouched. The engine matches the rulebook exactly. The rulebook is where the gap
    is. See note 21.

19. **Undoing here. I meant to draw with Gray, but Red hitting a full hand removed Red draws from
    the list and renumbered it, so my next call ended the Draw phase and the one after played
    Crowbar. That is a CLI trap, not a decision I made. Taking it back.** `[agent]` (log 122)

    The only undo in the run, and it was a tool problem. Two `undo` calls were needed to get back
    across the phase boundary, which is correct behaviour: undo steps back one command and stops at
    hidden information.

20. **The Ascend list has 103 options and not one of them lets Red take a reward and Gray take a
    reward in the same Ascend. Every entry is either a Red choice with Gray declining or a Gray
    choice with Red declining. The rules give each player a reward on every Ascend, so the choice I
    want to make is legal and I cannot express it. This is the worst thing I hit all run.**
    `[agent]` (log 140)

    Confirmed in the source. `sim/moves.ts` crosses the two characters' ascension choices only while
    the product is 256 or fewer; past that it falls back to listing each character's choices against
    the other character's "decline". The spec records this as known debt. The consequence in play is
    that a legal and obviously correct Ascend cannot be chosen. This cost the run a card. See note
    34.

21. **Stuff I held in hand was never offered for Scrapping. Crowbar and Pry Bar sat in Red's hand
    and Riot Shield in Gray's, and the Ascend only asked about Stuff in the discard pile. So the way
    to beat Say Goodbye To Your Stuff is simply to not play your Stuff. That cannot be the
    intent.** `[agent]` (log 141)

    The engine follows the rulebook here, so this is a rules question rather than a bug. Ascending
    step 2 says to Scrap the Stuff in your discard pile. It says nothing about hand or deck. The
    strategy that follows is to hold Stuff and never spend it, which is how Riot Shield survived the
    entire run. A question for the designer: should Say Goodbye To Your Stuff read the hand and the
    deck as well?

22. **Giving the whole Ascend to Gray. Both Enemy rooms so far have been Oomph only and Gray's deck
    has no Oomph in it, so Cutting Torch kept and Hit 'n Run added are worth more than anything on
    Red's side. Scrapping Peek Around Corner, which has done nothing all run.** `[agent]` (log 142)

    A decision forced by note 20. Peek Around Corner was never played in twenty-five turns.

23. **Ration Locker offers up to four Good Stuff and the pool has two cards left in it. There is no
    reason to push past the low lines, because the high ones pay out of an empty pool. The room's
    whole reward structure has quietly stopped meaning anything, and nothing on the table tells me
    that except the pool counter in the header, which I am glad is there.** `[agent]` (log 174)

    The pool counter in the header is the only signal, and it is a CLI feature rather than a game
    one. At a physical table the players would see the pile shrinking, so this may not need fixing.

24. **The Good Stuff pool is empty on floor 3 of 10. Seven more floors of Stuff rooms will now pay
    nothing at all, and Stuff rooms are most of the floor deck. From here the game is only our two
    starter decks plus whatever rewards we are handed, and Gray still has almost no Oomph. This is
    the same finding as playtest 2 note 8 and it is the biggest number problem in the game.**
    `[agent]` (log 190)

    Confirmed. Eight Good Stuff cards, six floors of Stuff rooms, no refill and no counts in
    `cards.yaml`. From floor 3 on, every Stuff room in the run was cleared for nothing but the
    chance to dig one card deeper into the floor deck.

25. **Spill Of Cargo pays only Good Stuff, and there is none left, so clearing it is worth nothing
    except removing it from the floor deck. I am clearing it as cheaply as I can, with Riot Shield
    paid for by a Pick The Lock, purely to dig toward the Enemy room faster. A room that pays
    nothing should probably say so.** `[agent]` (log 194)

    This is the shape the whole back half of the run took. Once the pool is dry, a Stuff room is a
    toll booth: pay the minimum, move on.

26. **The log said 'The Good Stuff pool is empty, Red gets nothing' out loud. Playtest 2 found this
    happening silently. It is fixed and it reads clearly.** `[agent]` (log 205)

    Playtest 2 note 8 recorded that taking from an empty pool was a silent no-op and the log claimed
    rewards that were never handed over. That is fixed.

27. **Two turns in a row cleared a Stuff room for the cost of one Gray card, because Riot Shield
    comes straight back. Whole turns are now costing us almost nothing, which is satisfying but also
    means the Stuff rooms on this floor have no teeth at all once the pool is dry.** `[agent]`
    (log 219)

    Riot Shield plus an empty Good Stuff pool is the run's central balance problem. The rooms that
    would drain stamina cost nothing, and the rooms that would pay for it pay nothing.

28. **Red went into this turn holding five cards, so the compulsory opening draw burned a Shove
    straight off the deck. Sitting on a full hand is quietly taxed one stamina per turn. I had not
    felt that until it bit me.** `[agent]` (log 224)

    Correct per the rulebook's Full Hand rule. Worth recording because it is the only real pressure
    the hand limit applied in twenty-five turns, and it appeared once.

29. **Third Enemy room, third Oomph-only Ascend line. Villy also offers Scramble 9 to flee for free,
    which is an escape hatch and not a win. If every Enemy in the game gates the floor on Oomph,
    then Gray is structurally the support character and Red is the one who ends floors. Is that the
    intent?** `[agent]` (log 225)

    Question for the designer, stated as asked. The card list has three Enemy rooms and all three
    gate on Oomph.

30. **Second Ascend, same wall: I must choose between Red's reward and Gray's keep. I want Both
    Barrels for Red and Grav Harness kept for Gray, and the list has no line that does both. Taking
    Both Barrels, because a card that returns to Red's hand every time the room is Cleared is a
    permanent Oomph engine and Grav Harness is one card.** `[agent]` (log 243)

    Same cause as note 20.

31. **Villy is the Enemy room on floor 4 as well as floor 3. The rulebook says a floor's Enemy Room
    is the one marked with that floor's number, so seeing the same Enemy twice looks wrong. Either
    the card list does not have ten Enemy rooms yet or the floor builder is not picking by floor.**
    `[agent]` (log 289)

    Both, and the engine is handling it gracefully. `cards.yaml` has three Enemy rooms, marked
    floors 1, 2 and 3. `domain/setup.ts` looks for an Enemy room marked with the current floor and,
    finding none, falls back to any Enemy room. The content is the gap, not the code.

32. **This Ascend does offer lines where both characters take a reward, which the last two did not.
    The difference seems to be the keeps: as soon as a Stuff keep is in play the list stops crossing
    the two sides. Here Red has no Stuff in the discard pile, so Red's side is only the three reward
    cards, and the cross product fits.** `[agent]` (log 308)

    Right diagnosis, and the source agrees. Keeps multiply each character's list by every
    keep-and-scrap pair, which is what pushes the product past 256.

33. **Taking Fast Follow for Red and I Know Kung Fu for Gray, and letting Cutting Torch be Scrapped.
    Fast Follow is Oomph 3 for one card whenever Gray has played, which is the best rate of Oomph
    per card anywhere in the game, and the Enemy rooms only want Oomph.** `[agent]` (log 309)

    Fast Follow at cost 0 is one card for Oomph 3. Charge In is three cards for Oomph 4. The rate is
    roughly triple, and the condition is one Gray card played, which happens nearly every turn.
    A question for the designer: is Fast Follow priced for how often its condition is live?

34. **I picked a worse Ascend than I had to. The list ran past 128 entries, I searched it rather
    than read it, and I missed a line that took Fast Follow and kept Cutting Torch as well. The
    choice is three small decisions crossed into one flat list, and at this length a person cannot
    see the good one.** `[agent]` (log 316)

    This is the practical cost of the flat cross product, and it happened even on an Ascend where
    the crossing did work. The Ascend is really four independent decisions: Red's reward, Red's
    keep, Gray's reward, Gray's keep. Presenting it as one list of 128 lines makes a player search
    instead of choose.

35. **Bad Stuff pushed Red's hand to six cards. The rulebook gives a maximum hand size of five.
    Gaining Stuff walks straight past it, and nothing in the table display flags that the hand is
    over the limit.** `[agent]` (log 391)

    The engine is right and the rulebook allows it. The Full Hand rule only stops you drawing at
    five or more; it never caps the hand itself, and the Stuff section says Stuff is added directly
    to hand. `domain/verbs.ts` comments this deliberately. A question for the designer: should the
    rulebook say out loud that a hand can go over five, since "maximum hand size" reads like a cap?

36. **Panic and Spore Cloud are both Holding punishments, so Bad Stuff works by squatting in your
    hand until you spend cards to get rid of it. Panic saying ALL rooms need an extra 2 Scramble is
    frightening with an Oomph-only Enemy room two cards away. I am dumping it as payment before
    then.** `[agent]` (log 392)

    Bad Stuff is answered by paying it away as a cost, which costs one card play. That is a real
    decision and it worked well. It is also the only pressure the run felt after floor 2.

37. **The room line reads 'Scramble 11 (printed 9)' because Red is holding Panic. Showing the
    modified number and the printed one together is exactly right, and it also told me Panic does
    not touch the Oomph line, which I could not have worked out from the card text alone.**
    `[agent]` (log 397)

    Panic's text reads "ALL rooms require an additional 2 `Scramble` to clear", which on an
    Oomph-only room could be read as making it unclearable. The engine reads it as raising Scramble
    thresholds only. That reading is sensible and the display made it legible. A question for the
    designer: is that the intended reading, and should the card say so?

38. **Gray is holding Spore Cloud, which says you cannot have more than 3 cards in your hand, and
    Gray has 4. The compulsory opening draw put the fourth one there. Either the card is not
    enforced or a forced draw ignores it. Under the rulebook a forced draw on a full hand goes to
    the discard pile instead, so I think this is a bug.** `[agent]` (log 398)

    This is a bug, and it is a one-line one. `canDraw` in `app/src/domain/queries.ts` checks
    `handCapFor(state, c)`, which honours Spore Cloud, so a voluntary draw is blocked correctly.
    `drawOne` in `app/src/domain/verbs.ts` checks the constant `HAND_CAP` instead, so the forced
    opening draw does not honour it. Spore Cloud stops chosen draws and not forced ones.

39. **The Ascend offers to let Red keep Coil Of Cable by Scrapping Panic. Panic is Bad Stuff, and
    the rulebook says you Scrap the Stuff in your discard pile and pay for a keep with a non-Stuff
    card. Panic should already be gone, and it certainly should not be the price. I am not taking
    that line.** `[agent]` (log 417)

    Confirmed in `app/src/sim/moves.ts`. The keep candidate is filtered to non-player cards, which
    is correct, but the scrap payer is not filtered at all, so any other card in the discard pile
    can pay, including Bad Stuff. The spec says everything the generator returns passes the engine's
    `validate`, so the engine accepts it too. Ascending step 2 says the price is one non-Stuff card.
    The glossary counts Bad Stuff as Stuff.

40. **115 Ascend options and again none of them cross the two characters. Every line with a keep in
    it forces the other character to decline. That has now happened at three of the four Ascends
    where a keep was available.** `[agent]` (log 418)

    Same cause as note 20. Recorded here because by this point in the run it was clearly the normal
    case rather than the exception.

41. **Floor 6's Enemy is Gross Thing That Looks Like A Cherry, Oomph 5, the exact same card that
    guarded floor 1. Floor 3, 4 and 5 all had Villy at Oomph 9. The Enemy rooms are not scaled to
    the floor at all, so floor 6 is easier than floor 3 was. Ten floors needs ten Enemies, or the
    thresholds need to climb with the floor.** `[agent]` (log 430)

    Confirmed. Three Enemy rooms exist, at Oomph 5, 9 and 9. Floor 6 drew the Oomph 5 one and Red
    cleared it with a single play. This is the clearest content gap in the game: the tower has ten
    floors and three guards, and the guards do not get harder.

42. **Zen Mode stops it, Red Exhausts nothing. Reckless is Oomph 5 for one payment card with no
    drawback while Zen Mode sits in hand, and the log says so in plain words. This is the first
    combo in the run that felt like a deckbuilder, and it cleared an Enemy room on its own.**
    `[agent]` (log 438)

    Card text confirmed. Zen Mode is cost 0, "Holding: you don't `Exhaust`". Reckless is cost 1,
    Oomph 5, "Exhaust 3". Held together they make the game's biggest drawback free. The combo felt
    excellent to find and it also ended the run's difficulty. A question for the designer: is a card
    that blanks a whole keyword for one permanent hand slot priced correctly?

43. **I Know Kung Fu drew Gray a card in the middle of the Play phase. The rulebook says you may not
    draw during Play. Card effects presumably beat the phase rule, but the rulebook does not say so
    anywhere, and this is the first time the run has drawn outside the Draw phase.** `[agent]`
    (log 481)

    The Play section says "You may not draw during this phase." Grav Harness and I Know Kung Fu both
    draw during Play, and so does Covering Fire. The engine lets them. A question for the designer:
    should the Play section say that the rule bars choosing to draw and not card effects?

44. **Red's reward pool is empty. The Ascend offers Red nothing at all for the rest of the game,
    with three floors to go. Ten reward cards per character is exactly seven Ascends plus the Hazard
    reveals, and we burned through them faster than the tower is long.** `[agent]` (log 514)

    Confirmed against `cards.yaml`: ten Red reward cards and ten Gray. Nine Ascends and every
    Collapsed Stairwell reveal draw from the same pool, so a run that clears floors efficiently runs
    out before the roof. A question for the designer: should the reward pool be deeper, or should a
    Hazard reveal put the card back?

45. **Floor sizes have gone 10, 9, 8, 7, 6, 5, 4, and then 4 again for floor 8. The rulebook says
    each floor has one fewer room than the last. Either there is a lower bound nobody wrote down or
    floor 8 is wrong.** `[agent]` (log 521)

    There is a lower bound in the engine: one Enemy room and three Hazards on every floor, with Stuff
    rooms carrying the whole decrease, so floors 7 through 10 are all four rooms. Whether that is the
    intended shape is open in issue #52. The rulebook still says each floor is one smaller than the
    last, which stops being true at floor 7.

46. **Here, Catch moves a Stuff card from Gray's hand to Red's, and Gray had none. It resolved
    silently with nothing said. Riot Shield was in the play zone at the time, so the card read as
    dead when I had been looking right at a Stuff card a moment earlier.** `[agent]` (log 562)

    Correct by the rules, since the play zone is not the hand. Worth noting only because the log
    said nothing, so a card that did nothing looked identical to a card that worked.

47. **Turn 25 and the run has to stop here. We are on floor 8 of 10, both decks are healthy, and
    nothing has come close to killing us since floor 1. The game stopped being dangerous around
    floor 3 and became a matter of finding the cheapest line each turn.** `[agent]` (log 580)

    Both decks were larger at floor 8 than at setup: Red 17 against a starting 12, Gray 7 after
    heavy spending, with 13 more in the discard pile. Stamina was never a threat after floor 1,
    because Ascending heals the whole discard pile and the floors were falling in two or three
    turns.

48. **Stopping at the turn limit, on floor 8, with Red on 17 cards and Gray on 7 and neither ever in
    Last Stand. Sluggish is in Gray's hand now and every Gray card shows its cost bumped by one,
    which is the clearest the Bad Stuff has ever read. The run ends undefeated rather than won.**
    `[agent]` (log 603)

    Last Stand, which playtest 2 note 10 left open, never came up once in twenty-five turns. This
    run has nothing to say about whether to keep it.

## What the run showed

Three things compound into one shape, and it is the opposite of playtest 2's.

- **The guards do not scale.** Three Enemy rooms exist for ten floors, at Oomph 5, 9 and 9, and the
  floor builder repeats them when it runs out. Floor 6's guard was floor 1's guard.
- **Nothing drains stamina.** Ascending heals the entire discard pile, floors were falling in two or
  three turns, and Riot Shield cleared Scramble rooms for one card a turn. Both decks were bigger at
  floor 8 than at setup.
- **The rewards run out before the tower does.** The Good Stuff pool was empty on floor 3 and Red's
  reward pool was empty on floor 8. From floor 3 the Stuff rooms, which are most of the floor deck,
  paid nothing at all.

Playtest 2 lost floor 1 to four numbers compounding. This run cleared seven floors without ever
being in danger, to a different set of numbers compounding. Both runs point at the same place: the
floor deck's composition and the reward pools are sized for a shorter game than ten floors.

The one finding that carries over unchanged from playtest 2 is Gray. Every Enemy room gates on
Oomph, Gray's starter deck prints none, and Gray's only route to Oomph is Good Stuff or a reward
card. In this run that resolved happily, because In Step and Hit 'n Run arrived early. It resolved
happily by luck.

## The CLI as a playtest tool

Every friction point hit while playing, in rough order of how much it cost. None of these are game
problems.

1. **Move numbers renumber after every move, so two moves cannot be sent in one shell call.** The
   list is rebuilt from the new state, so move 2 in the old list is a different move in the new one.
   This cost one wrong move, one wasted card and the run's only undo (note 19). It bit a second time
   when a character reaching a full hand silently removed "Red draws" from the list and shifted
   everything up. A stable way to name a move, or a way to send several moves and have the tool
   refuse if the list changed underneath, would remove this whole class of mistake.

2. **The Ascend list is one flat cross product and it is unusable at full size.** It ran to 103, 115
   and 128 lines. Past 256 combinations the tool stops crossing the two characters entirely, so a
   legal Ascend where both take a reward cannot be chosen at all (notes 20, 32, 40). Even when the
   crossing works, a list that long forces a search rather than a choice, and I picked a worse
   Ascend than was on offer because of it (note 34). The Ascend is four independent decisions and
   should be asked as four questions.

3. **Identical cards produce identical move lines.** Three copies of Charge In turned seven real
   choices into twenty-four lines, of which eighteen read the same (note 3). The same thing happened
   to A Pair Of Stich-Em-Ups' second prompt, which offered fourteen pairs with visible duplicates
   (note 14). The list should collapse moves that differ only by which copy of a card is used.

4. **A bad move number prints the whole help text instead of the current move list.** The one thing
   I needed at that moment was the list I had just invalidated.

5. **A card reward is offered by name only.** "Take One Man's Junk, or skip it?" with no cost, no
   stats and no text. I had to open `design/cards.yaml` to answer (note 15). The Ascend offer prints
   full card faces, so the data is clearly to hand.

6. **Answering a pending prompt sometimes prints nothing.** Choosing which character A Pair Of
   Stich-Em-Ups heals produced no line at all, so there was no way to tell from the output that the
   answer had landed (note 14). A card that resolves to nothing is also silent, so Here, Catch
   fizzling looked the same as Here, Catch working (note 46).

7. **Output is all or nothing.** Every call prints the events, the whole table and the whole move
   list. There is no way to ask for just the move list, or just what happened. In practice I ended
   up piping through `grep` to find a move number, which is exactly how I missed the better Ascend
   line. Flags like `--moves`, `--table` and `--events` would have changed how the run was played.

8. **`play show` cannot show what just happened.** Once a move's output has scrolled past, the
   events are gone. `show` reprints the table and the moves but never the last few log lines.

9. **`replay --quiet` is not quiet.** It printed the full final table before the one-line verdict.
   The spec says `--quiet` prints only the verdict.

10. **`play note` echoes the current move list back.** A note should confirm itself in one line. As
    it stands, writing a note in the middle of a turn produces a screen of output that is identical
    to the last screen.

11. **The room header vanishes between resolving a room and Cleanup.** While a reward prompt is
    open, the table no longer shows which room is being resolved or what its lines were.

12. **There is no way to look up a card.** Nothing prints the contents of a deck, a discard pile or
    a reward pool, and nothing shows a single card's face on demand. Checking what a card said meant
    reading `design/cards.yaml`.

Things the tool got right, recorded because they changed how the run was played:

- The tick beside a met threshold (note 4). This did more work than anything else on screen.
- Modified numbers shown next to printed ones: `Scramble 11 (printed 9)`, `cost 0 (printed 1)`,
  `cost 2 (printed 1)`. This made Panic, Fast Follow and Sluggish legible without reading the rules
  (note 37).
- Naming the card that stopped an effect: "Zen Mode stops it: Red Exhausts nothing" (note 42).
- The pool counters in the header. The Good Stuff count is the only thing that told me a room had
  stopped paying (note 23).
- "The Good Stuff pool is empty — Red gets nothing", which playtest 2 found happening silently
  (note 26).

## Appendix: the run transcript

Output of `bin/nvu replay design/playtests/03-first-agent-cli-run.json`.

```
  1. Floor 1 is built: 10 rooms.
  2. You are in: Gross Thing That Looks Like A Cherry.
  3. Red draws Charge In.
  4. Gray draws Duck Under.
  5. NOTE — Turn 1 and the Enemy room is already face up. Oomph 5 clears the whole floor. Gray has no Oomph at all in the starter deck, so this is entirely Red's problem. Plan: draw Red only, hunt for Overdrive plus Charge In, which is Oomph 6 for two payment cards.
  6. Red draws Charge In.
  7. Red draws Charge In.
  8. Red draws Shove.
  9. Red draws Overdrive.
 10. NOTE — Gray sat out the whole Draw phase on purpose. Gray cannot add Oomph, and every card Gray draws is a card off Gray's stamina. It feels odd that the best play for one character is to do nothing at all, but the numbers are not close.
 11. NOTE — The Play phase move list shows 24 options where there are only 7 real choices. Three identical Charge In cards make 18 lines that read the same. I cannot tell moves 1, 7 and 13 apart, and it does not matter which I pick, but I have to read all of them to find that out.
 12. Red plays Overdrive.
 13. Red discards Shove from their deck.
 14. Red discards Shove from their deck.
 15. Red discards Charge In from their hand.
 16. Red discards Charge In from their hand.
 17. Red pays with Charge In, Charge In.
 18. Red plays Charge In.
 19. NOTE — The tick next to a threshold once the pool reaches it is the single most useful thing on the table display. I stopped doing arithmetic and just watched for it.
 20. Oomph 5 met — Ascend
 21. Gross Thing That Looks Like A Cherry is Cleared.
 22. Cleanup.
 23. Red discards Overdrive from their play zone.
 24. Red discards Charge In from their play zone.
 25. — end of turn 1 —
 26. Floor 1 is clear.
 27. NOTE — Floor 1 is over on turn 1. The Enemy room was the first card flipped and Oomph 5 is one good Red turn. No Stuff, no scavenging, no Hazards, one reward. Playtest 2 lost floor 1 outright; this is the same floor decided the opposite way by the shuffle alone. Whether the Enemy room can be the first room is a real design question.
 28. NOTE — The rulebook says an Ascend outcome skips Cleanup. The log printed Cleanup and discarded both play-zone cards before Ascending. I prefer what the engine did, since otherwise the played cards are stranded in the play zone, but the rulebook and the engine do not agree here.
 29. NOTE — Reward choice. Junk Launcher is Oomph 6 for cost 2 when you pay with two cards, which is strictly better than Charge In. For Gray I want In Step: Gray's starter deck has no Oomph at all and In Step turns Red's turn into Gray Oomph, which is the co-op card the pair is missing. I Know Kung Fu has Oomph 5 but cost 3 needs a hand of four to deploy.
 30. Red takes Junk Launcher.
 31. Red shuffles 7 card(s) back in.
 32. Gray takes In Step.
 33. Gray shuffles 1 card(s) back in.
 34. Floor 2 is built: 9 rooms.
 35. You are in: Ration Locker.
 36. Red draws Shove.
 37. Gray draws Peek Around Corner.
 38. Red draws Charge In.
 39. Gray draws Duck Under.
 40. Gray draws Pick The Lock.
 41. Red discards Shove from their hand.
 42. Red discards Shove from their hand.
 43. Red pays with Shove, Shove.
 44. Red plays Charge In.
 45. NOTE — Chaining two moves in one go does not work: the list renumbers after every move, so my second pick was a different card. The error printed the whole help text instead of the new list. This is the CLI, not the game.
 46. Gray discards Duck Under from their hand.
 47. Gray discards Peek Around Corner from their hand.
 48. Gray pays with Duck Under, Peek Around Corner.
 49. Gray plays Pick The Lock.
 50. Oomph 2 met — Red gets Good Stuff.
 51. Scramble 2 met — Gray gets Good Stuff.
 52. Oomph 4 met — Red gets 2 instead.
 53. Scramble 4 met — Gray gets 2 instead.
 54. Ration Locker is Cleared.
 55. Red gets Crowbar.
 56. Red takes Crowbar into hand.
 57. Red gets A Pair Of Stich-Em-Ups.
 58. Red takes A Pair Of Stich-Em-Ups into hand.
 59. Gray gets Riot Shield.
 60. Gray takes Riot Shield into hand.
 61. Gray gets Cutting Torch.
 62. Gray takes Cutting Torch into hand.
 63. Cleanup.
 64. Red discards Charge In from their play zone.
 65. Gray discards Pick The Lock from their play zone.
 66. — end of turn 2 —
 67. NOTE — One Stuff room with all four thresholds met took the Good Stuff pool from 8 to 4. That is half the pool for the whole run gone in a single turn on floor 2 of 10. Playtest 2 found the same thing and it is still here.
 68. NOTE — Cutting Torch is Oomph 5 in Gray's hand for cost 2. That is the answer to the Oomph-only Enemy room that killed playtest 2, and it came from a Stuff room rather than from Gray's deck. Gray's Oomph problem is real but Good Stuff does solve it, when the pool has anything left in it.
 69. You are in: Tool Cage.
 70. Red draws Overdrive.
 71. Gray draws Peek Around Corner.
 72. NOTE — Riot Shield reads like a broken card in the best way: Scramble 3 for cost 1, and it comes back to your hand every turn the room is Cleared. One payment card per turn buys Scramble 3 forever. I am going to lean on it and see if it holds up.
 73. Gray discards Peek Around Corner from their hand.
 74. Gray pays with Peek Around Corner.
 75. Gray plays Riot Shield.
 76. Scramble 3 met — Both of you get Good Stuff.
 77. Tool Cage is Cleared.
 78. Red gets Pry Bar.
 79. Red takes Pry Bar into hand.
 80. Gray gets Overcharged Battery.
 81. Gray takes Overcharged Battery into hand.
 82. Cleanup.
 83. Gray takes Riot Shield into hand.
 84. — end of turn 3 —
 85. NOTE — Both hands are now four cards, three of them Good Stuff. Stuff arrives straight into hand, so winning Stuff rooms is also how you lose the ability to draw. I like that tension. It means a Stuff room is a real decision and not free money.
 86. You are in: Collapsed Stairwell.
 87. Red draws Charge In.
 88. Gray draws Pick The Lock.
 89. NOTE — Collapsed Stairwell shows something sharp. Scramble 2 clears but costs both of us Exhaust 1, and Scramble 5 clears and pays a reward. Beating the high line does not let me skip the low line's punishment, because every met threshold resolves. So overshooting is never clean here. I think that is good design but it deserves to be said out loud somewhere.
 90. Gray discards Overcharged Battery from their hand.
 91. Gray pays with Overcharged Battery.
 92. Gray plays Duck Under.
 93. Gray discards Pick The Lock from their hand.
 94. Gray pays with Pick The Lock.
 95. Gray plays Riot Shield.
 96. Red discards Overdrive from their hand.
 97. Red pays with Overdrive.
 98. Red plays A Pair Of Stich-Em-Ups.
 99. NOTE — A Pair Of Stich-Em-Ups asked two questions in a row. The first answer, choosing which character to heal, printed no line at all, so from the output alone I could not tell the choice had registered. The second question offered fourteen pairs of which several read identically.
100. Pick The Lock goes to Gray's deck.
101. Pick The Lock goes to Gray's deck.
102. Scramble 2 met — Clear, but both of you Exhaust 1.
103. Scramble 5 met — Clear, and one of you reveals a reward.
104. Collapsed Stairwell is Cleared.
105. Red discards Charge In from their deck.
106. Gray discards Duck Under from their deck.
107. Gray's reward pool shows One Man's Junk.
108. NOTE — I was offered One Man's Junk with only its name. No cost, no stats, no text. I had to go and read the card list to answer. Anywhere the game asks me to take a card it should show me the card.
109. NOTE — Taking One Man's Junk anyway. Its condition, a Bad Stuff card played this turn, is dead for us right now, but the deck is the stamina total so any card is one more hit point and one more thing to pay costs with. It is strange that a card being bad barely matters when deck size is health.
110. Gray takes One Man's Junk.
111. Cleanup.
112. Gray takes Riot Shield into hand.
113. Red discards A Pair Of Stich-Em-Ups from their play zone.
114. Gray discards Duck Under from their play zone.
115. — end of turn 4 —
116. You are in: Coney, The Thing In The Stairwell.
117. Red draws Overdrive.
118. Gray draws One Man's Junk.
119. NOTE — Floor 2's Enemy asks Oomph 9 and nothing else. Both Enemy rooms so far are Oomph-only, which means Gray's whole deck is irrelevant to the only room that ends a floor. Gray can only help through Good Stuff. That is the playtest 2 problem again, from a winning position instead of a losing one.
120. NOTE — Ascending heals the discard pile back into the deck, so cards drawn just before an Ascend cost nothing. I am going to draw purely to have cheap things to pay with, and keep the Good Stuff in hand rather than spend it, because Stuff in the discard pile gets Scrapped at Ascend and the rulebook says nothing about Stuff still in your hand. If holding Stuff through an Ascend is meant to work, that is a strong and hidden strategy. If it is not meant to work, the rulebook needs a line about it.
121. Red draws Shove.
122. NOTE — Undoing here. I meant to draw with Gray, but Red hitting a full hand removed Red draws from the list and renumbered it, so my next call ended the Draw phase and the one after played Crowbar. That is a CLI trap, not a decision I made. Taking it back.
123. Gray draws Duck Under.
124. Gray draws Pick The Lock.
125. Red discards Overdrive from their hand.
126. Red discards Shove from their hand.
127. Red pays with Overdrive, Shove.
128. Red plays Charge In.
129. Gray discards Duck Under from their hand.
130. Gray discards Pick The Lock from their hand.
131. Gray pays with Duck Under, Pick The Lock.
132. Gray plays Cutting Torch.
133. Oomph 9 met — Ascend
134. Coney, The Thing In The Stairwell is Cleared.
135. Cleanup.
136. Red discards Charge In from their play zone.
137. Gray discards Cutting Torch from their play zone.
138. — end of turn 5 —
139. Floor 2 is clear.
140. NOTE — The Ascend list has 103 options and not one of them lets Red take a reward and Gray take a reward in the same Ascend. Every entry is either a Red choice with Gray declining or a Gray choice with Red declining. The rules give each player a reward on every Ascend, so the choice I want to make is legal and I cannot express it. This is the worst thing I hit all run.
141. NOTE — Stuff I held in hand was never offered for Scrapping. Crowbar and Pry Bar sat in Red's hand and Riot Shield in Gray's, and the Ascend only asked about Stuff in the discard pile. So the way to beat Say Goodbye To Your Stuff is simply to not play your Stuff. That cannot be the intent.
142. NOTE — Giving the whole Ascend to Gray. Both Enemy rooms so far have been Oomph only and Gray's deck has no Oomph in it, so Cutting Torch kept and Hit 'n Run added are worth more than anything on Red's side. Scrapping Peek Around Corner, which has done nothing all run.
143. A Pair Of Stich-Em-Ups is Scrapped.
144. Red declines the reward.
145. Red shuffles 8 card(s) back in.
146. Peek Around Corner is Scrapped.
147. Overcharged Battery is Scrapped.
148. Gray takes Hit 'n Run.
149. Gray shuffles 8 card(s) back in.
150. Floor 3 is built: 8 rooms.
151. You are in: Collapsed Stairwell.
152. Red draws Shove.
153. Gray draws Pick The Lock.
154. Gray draws Pick The Lock.
155. Gray discards One Man's Junk from their hand.
156. Gray discards Pick The Lock from their hand.
157. Gray pays with One Man's Junk, Pick The Lock.
158. Gray plays Pick The Lock.
159. Red plays Crowbar.
160. Scramble 2 met — Clear, but both of you Exhaust 1.
161. Scramble 5 met — Clear, and one of you reveals a reward.
162. Collapsed Stairwell is Cleared.
163. Red discards Overdrive from their deck.
164. Gray discards Pick The Lock from their deck.
165. Gray's reward pool shows Every Little Bit Helps.
166. Gray takes Every Little Bit Helps.
167. Cleanup.
168. Red discards Crowbar from their play zone.
169. Gray discards Pick The Lock from their play zone.
170. — end of turn 6 —
171. You are in: Ration Locker.
172. Red draws Charge In.
173. Gray draws Every Little Bit Helps.
174. NOTE — Ration Locker offers up to four Good Stuff and the pool has two cards left in it. There is no reason to push past the low lines, because the high ones pay out of an empty pool. The room's whole reward structure has quietly stopped meaning anything, and nothing on the table tells me that except the pool counter in the header, which I am glad is there.
175. Red plays Pry Bar.
176. Gray discards Every Little Bit Helps from their hand.
177. Gray pays with Every Little Bit Helps.
178. Gray plays Riot Shield.
179. Oomph 2 met — Red gets Good Stuff.
180. Scramble 2 met — Gray gets Good Stuff.
181. Ration Locker is Cleared.
182. Red gets Coil Of Cable.
183. Red takes Coil Of Cable into hand.
184. Gray gets Grav Harness.
185. Gray takes Grav Harness into hand.
186. Cleanup.
187. Gray takes Riot Shield into hand.
188. Red discards Pry Bar from their play zone.
189. — end of turn 7 —
190. NOTE — The Good Stuff pool is empty on floor 3 of 10. Seven more floors of Stuff rooms will now pay nothing at all, and Stuff rooms are most of the floor deck. From here the game is only our two starter decks plus whatever rewards we are handed, and Gray still has almost no Oomph. This is the same finding as playtest 2 note 8 and it is the biggest number problem in the game.
191. You are in: Spill Of Cargo.
192. Red draws Junk Launcher.
193. Gray draws Pick The Lock.
194. NOTE — Spill Of Cargo pays only Good Stuff, and there is none left, so clearing it is worth nothing except removing it from the floor deck. I am clearing it as cheaply as I can, with Riot Shield paid for by a Pick The Lock, purely to dig toward the Enemy room faster. A room that pays nothing should probably say so.
195. Gray discards Pick The Lock from their hand.
196. Gray pays with Pick The Lock.
197. Gray plays Riot Shield.
198. Scramble 3 met — Both of you get Good Stuff.
199. Spill Of Cargo is Cleared.
200. The Good Stuff pool is empty — Red gets nothing.
201. The Good Stuff pool is empty — Gray gets nothing.
202. Cleanup.
203. Gray takes Riot Shield into hand.
204. — end of turn 8 —
205. NOTE — The log said 'The Good Stuff pool is empty, Red gets nothing' out loud. Playtest 2 found this happening silently. It is fixed and it reads clearly.
206. You are in: Spill Of Cargo.
207. Red draws Charge In.
208. Gray draws Duck Under.
209. Gray discards Duck Under from their hand.
210. Gray pays with Duck Under.
211. Gray plays Riot Shield.
212. Scramble 3 met — Both of you get Good Stuff.
213. Spill Of Cargo is Cleared.
214. The Good Stuff pool is empty — Red gets nothing.
215. The Good Stuff pool is empty — Gray gets nothing.
216. Cleanup.
217. Gray takes Riot Shield into hand.
218. — end of turn 9 —
219. NOTE — Two turns in a row cleared a Stuff room for the cost of one Gray card, because Riot Shield comes straight back. Whole turns are now costing us almost nothing, which is satisfying but also means the Stuff rooms on this floor have no teeth at all once the pool is dry.
220. You are in: Villy, Coney's Work Husband.
221. Red's hand is full — Shove is discarded instead.
222. Red discards Shove from their deck.
223. Gray draws Peek Around Corner.
224. NOTE — Red went into this turn holding five cards, so the compulsory opening draw burned a Shove straight off the deck. Sitting on a full hand is quietly taxed one stamina per turn. I had not felt that until it bit me.
225. NOTE — Third Enemy room, third Oomph-only Ascend line. Villy also offers Scramble 9 to flee for free, which is an escape hatch and not a win. If every Enemy in the game gates the floor on Oomph, then Gray is structurally the support character and Red is the one who ends floors. Is that the intent?
226. Gray draws Hit 'n Run.
227. Red discards Charge In from their hand.
228. Red discards Charge In from their hand.
229. Red pays with Charge In, Charge In.
230. Red plays Junk Launcher.
231. Gray discards Peek Around Corner from their hand.
232. Gray discards Hit 'n Run from their hand.
233. Gray pays with Peek Around Corner, Hit 'n Run.
234. Gray plays Grav Harness.
235. Gray draws Duck Under.
236. Oomph 9 met — Ascend
237. Villy, Coney's Work Husband is Cleared.
238. Cleanup.
239. Red discards Junk Launcher from their play zone.
240. Gray discards Grav Harness from their play zone.
241. — end of turn 10 —
242. Floor 3 is clear.
243. NOTE — Second Ascend, same wall: I must choose between Red's reward and Gray's keep. I want Both Barrels for Red and Grav Harness kept for Gray, and the list has no line that does both. Taking Both Barrels, because a card that returns to Red's hand every time the room is Cleared is a permanent Oomph engine and Grav Harness is one card.
244. Overdrive is Scrapped.
245. Crowbar is Scrapped.
246. Red takes Both Barrels.
247. Red shuffles 6 card(s) back in.
248. Grav Harness is Scrapped.
249. Gray declines the reward.
250. Gray shuffles 9 card(s) back in.
251. Floor 4 is built: 7 rooms.
252. You are in: Collapsed Stairwell.
253. Red draws Shove.
254. Gray draws One Man's Junk.
255. Gray draws Duck Under.
256. Gray discards One Man's Junk from their hand.
257. Gray pays with One Man's Junk.
258. Gray plays Riot Shield.
259. Gray discards Duck Under from their hand.
260. Gray pays with Duck Under.
261. Gray plays Duck Under.
262. Scramble 2 met — Clear, but both of you Exhaust 1.
263. Scramble 5 met — Clear, and one of you reveals a reward.
264. Collapsed Stairwell is Cleared.
265. Red discards Shove from their deck.
266. Gray discards Duck Under from their deck.
267. Red's reward pool shows Heavy Pockets.
268. Red takes Heavy Pockets.
269. Cleanup.
270. Gray takes Riot Shield into hand.
271. Gray discards Duck Under from their play zone.
272. — end of turn 11 —
273. You are in: Tool Cage.
274. Red draws Heavy Pockets.
275. Gray draws Duck Under.
276. Gray discards Duck Under from their hand.
277. Gray pays with Duck Under.
278. Gray plays Riot Shield.
279. Scramble 3 met — Both of you get Good Stuff.
280. Tool Cage is Cleared.
281. The Good Stuff pool is empty — Red gets nothing.
282. The Good Stuff pool is empty — Gray gets nothing.
283. Cleanup.
284. Gray takes Riot Shield into hand.
285. — end of turn 12 —
286. You are in: Villy, Coney's Work Husband.
287. Red draws Charge In.
288. Gray draws Duck Under.
289. NOTE — Villy is the Enemy room on floor 4 as well as floor 3. The rulebook says a floor's Enemy Room is the one marked with that floor's number, so seeing the same Enemy twice looks wrong. Either the card list does not have ten Enemy rooms yet or the floor builder is not picking by floor.
290. Gray draws Every Little Bit Helps.
291. Gray draws Cutting Torch.
292. Gray draws In Step.
293. Red discards Shove from their hand.
294. Red discards Shove from their hand.
295. Red pays with Shove, Shove.
296. Red plays Charge In.
297. Gray discards Duck Under from their hand.
298. Gray discards Every Little Bit Helps from their hand.
299. Gray pays with Duck Under, Every Little Bit Helps.
300. Gray plays Cutting Torch.
301. Oomph 9 met — Ascend
302. Villy, Coney's Work Husband is Cleared.
303. Cleanup.
304. Red discards Charge In from their play zone.
305. Gray discards Cutting Torch from their play zone.
306. — end of turn 13 —
307. Floor 4 is clear.
308. NOTE — This Ascend does offer lines where both characters take a reward, which the last two did not. The difference seems to be the keeps: as soon as a Stuff keep is in play the list stops crossing the two sides. Here Red has no Stuff in the discard pile, so Red's side is only the three reward cards, and the cross product fits.
309. NOTE — Taking Fast Follow for Red and I Know Kung Fu for Gray, and letting Cutting Torch be Scrapped. Fast Follow is Oomph 3 for one card whenever Gray has played, which is the best rate of Oomph per card anywhere in the game, and the Enemy rooms only want Oomph.
310. Red takes Fast Follow.
311. Red shuffles 5 card(s) back in.
312. Cutting Torch is Scrapped.
313. Gray takes I Know Kung Fu.
314. Gray shuffles 8 card(s) back in.
315. Floor 5 is built: 6 rooms.
316. NOTE — I picked a worse Ascend than I had to. The list ran past 128 entries, I searched it rather than read it, and I missed a line that took Fast Follow and kept Cutting Torch as well. The choice is three small decisions crossed into one flat list, and at this length a person cannot see the good one.
317. You are in: Collapsed Stairwell.
318. Red draws Charge In.
319. Gray draws Duck Under.
320. Gray draws Duck Under.
321. Gray draws Pick The Lock.
322. Gray discards Duck Under from their hand.
323. Gray pays with Duck Under.
324. Gray plays Riot Shield.
325. Gray discards Pick The Lock from their hand.
326. Gray pays with Pick The Lock.
327. Gray plays Duck Under.
328. Scramble 2 met — Clear, but both of you Exhaust 1.
329. Scramble 5 met — Clear, and one of you reveals a reward.
330. Collapsed Stairwell is Cleared.
331. Red discards Fast Follow from their deck.
332. Gray discards Every Little Bit Helps from their deck.
333. Red's reward pool shows Second Wind.
334. Red takes Second Wind.
335. Cleanup.
336. Gray takes Riot Shield into hand.
337. Gray discards Duck Under from their play zone.
338. — end of turn 14 —
339. You are in: Tool Cage.
340. Red draws Second Wind.
341. Gray draws Pick The Lock.
342. Gray discards Pick The Lock from their hand.
343. Gray pays with Pick The Lock.
344. Gray plays Riot Shield.
345. Scramble 3 met — Both of you get Good Stuff.
346. Tool Cage is Cleared.
347. The Good Stuff pool is empty — Red gets nothing.
348. The Good Stuff pool is empty — Gray gets nothing.
349. Cleanup.
350. Gray takes Riot Shield into hand.
351. — end of turn 15 —
352. You are in: Collapsed Stairwell.
353. Red draws Shove.
354. Gray draws Hit 'n Run.
355. Gray draws Duck Under.
356. Red plays Coil Of Cable.
357. Gray discards Duck Under from their hand.
358. Gray pays with Duck Under.
359. Gray plays Riot Shield.
360. Scramble 2 met — Clear, but both of you Exhaust 1.
361. Scramble 5 met — Clear, and one of you reveals a reward.
362. Collapsed Stairwell is Cleared.
363. Red discards Overdrive from their deck.
364. Gray discards Pick The Lock from their deck.
365. Red's reward pool shows Zen Mode.
366. Red takes Zen Mode.
367. Cleanup.
368. Gray takes Riot Shield into hand.
369. Red discards Coil Of Cable from their play zone.
370. — end of turn 16 —
371. You are in: Ruptured Coolant Line.
372. Red draws Zen Mode.
373. Gray draws One Man's Junk.
374. Gray draws Duck Under.
375. Gray discards One Man's Junk from their hand.
376. Gray pays with One Man's Junk.
377. Gray plays Riot Shield.
378. Gray discards Hit 'n Run from their hand.
379. Gray pays with Hit 'n Run.
380. Gray plays Duck Under.
381. Scramble 4 met — Clear, but both of you get Bad Stuff.
382. Ruptured Coolant Line is Cleared.
383. Red gets Panic.
384. Red takes Panic into hand.
385. Gray gets Spore Cloud.
386. Gray takes Spore Cloud into hand.
387. Cleanup.
388. Gray takes Riot Shield into hand.
389. Gray discards Duck Under from their play zone.
390. — end of turn 17 —
391. NOTE — Bad Stuff pushed Red's hand to six cards. The rulebook gives a maximum hand size of five. Gaining Stuff walks straight past it, and nothing in the table display flags that the hand is over the limit.
392. NOTE — Panic and Spore Cloud are both Holding punishments, so Bad Stuff works by squatting in your hand until you spend cards to get rid of it. Panic saying ALL rooms need an extra 2 Scramble is frightening with an Oomph-only Enemy room two cards away. I am dumping it as payment before then.
393. You are in: Villy, Coney's Work Husband.
394. Red's hand is full — Shove is discarded instead.
395. Red discards Shove from their deck.
396. Gray draws Pick The Lock.
397. NOTE — The room line reads 'Scramble 11 (printed 9)' because Red is holding Panic. Showing the modified number and the printed one together is exactly right, and it also told me Panic does not touch the Oomph line, which I could not have worked out from the card text alone.
398. NOTE — Gray is holding Spore Cloud, which says you cannot have more than 3 cards in your hand, and Gray has 4. The compulsory opening draw put the fourth one there. Either the card is not enforced or a forced draw ignores it. Under the rulebook a forced draw on a full hand goes to the discard pile instead, so I think this is a bug.
399. Red discards Heavy Pockets from their hand.
400. Red discards Second Wind from their hand.
401. Red pays with Heavy Pockets, Second Wind.
402. Red plays Charge In.
403. Red discards Panic from their hand.
404. Red pays with Panic.
405. Red plays Shove.
406. Gray discards Spore Cloud from their hand.
407. Gray pays with Spore Cloud.
408. Gray plays In Step.
409. Oomph 9 met — Ascend
410. Villy, Coney's Work Husband is Cleared.
411. Cleanup.
412. Red discards Charge In from their play zone.
413. Red discards Shove from their play zone.
414. Gray discards In Step from their play zone.
415. — end of turn 18 —
416. Floor 5 is clear.
417. NOTE — The Ascend offers to let Red keep Coil Of Cable by Scrapping Panic. Panic is Bad Stuff, and the rulebook says you Scrap the Stuff in your discard pile and pay for a keep with a non-Stuff card. Panic should already be gone, and it certainly should not be the price. I am not taking that line.
418. NOTE — 115 Ascend options and again none of them cross the two characters. Every line with a keep in it forces the other character to decline. That has now happened at three of the four Ascends where a keep was available.
419. Shove is Scrapped.
420. Panic is Scrapped.
421. Red takes Reckless.
422. Red shuffles 8 card(s) back in.
423. Spore Cloud is Scrapped.
424. Gray declines the reward.
425. Gray shuffles 11 card(s) back in.
426. Floor 6 is built: 5 rooms.
427. You are in: Gross Thing That Looks Like A Cherry.
428. Red draws Fast Follow.
429. Gray draws Pick The Lock.
430. NOTE — Floor 6's Enemy is Gross Thing That Looks Like A Cherry, Oomph 5, the exact same card that guarded floor 1. Floor 3, 4 and 5 all had Villy at Oomph 9. The Enemy rooms are not scaled to the floor at all, so floor 6 is easier than floor 3 was. Ten floors needs ten Enemies, or the thresholds need to climb with the floor.
431. Red draws Charge In.
432. Red draws Pry Bar.
433. Red draws Reckless.
434. Red discards Charge In from their hand.
435. Red pays with Charge In.
436. Red plays Reckless.
437. Zen Mode stops it: Red Exhausts nothing.
438. NOTE — Zen Mode stops it, Red Exhausts nothing. Reckless is Oomph 5 for one payment card with no drawback while Zen Mode sits in hand, and the log says so in plain words. This is the first combo in the run that felt like a deckbuilder, and it cleared an Enemy room on its own.
439. Oomph 5 met — Ascend
440. Gross Thing That Looks Like A Cherry is Cleared.
441. Cleanup.
442. Red discards Reckless from their play zone.
443. — end of turn 19 —
444. Floor 6 is clear.
445. Red takes Reckless Swing.
446. Red shuffles 3 card(s) back in.
447. Gray takes I'll Take That.
448. Gray shuffles 1 card(s) back in.
449. Floor 7 is built: 4 rooms.
450. You are in: Collapsed Stairwell.
451. Red draws Shove.
452. Gray draws Duck Under.
453. Gray discards Pick The Lock from their hand.
454. Gray pays with Pick The Lock.
455. Gray plays Riot Shield.
456. Gray discards Pick The Lock from their hand.
457. Gray pays with Pick The Lock.
458. Gray plays Duck Under.
459. Scramble 2 met — Clear, but both of you Exhaust 1.
460. Scramble 5 met — Clear, and one of you reveals a reward.
461. Collapsed Stairwell is Cleared.
462. Zen Mode stops it: Red Exhausts nothing.
463. Gray discards Pick The Lock from their deck.
464. Red's reward pool shows Deadweight Grip.
465. Red takes Deadweight Grip.
466. Cleanup.
467. Gray takes Riot Shield into hand.
468. Gray discards Duck Under from their play zone.
469. — end of turn 20 —
470. You are in: Collapsed Stairwell.
471. Red draws Deadweight Grip.
472. Gray draws I Know Kung Fu.
473. Gray draws Pick The Lock.
474. Red discards Shove from their hand.
475. Red pays with Shove.
476. Red plays Deadweight Grip.
477. Gray discards Pick The Lock from their hand.
478. Gray pays with Pick The Lock.
479. Gray plays Riot Shield.
480. Gray draws Pick The Lock.
481. NOTE — I Know Kung Fu drew Gray a card in the middle of the Play phase. The rulebook says you may not draw during Play. Card effects presumably beat the phase rule, but the rulebook does not say so anywhere, and this is the first time the run has drawn outside the Draw phase.
482. Scramble 2 met — Clear, but both of you Exhaust 1.
483. Scramble 5 met — Clear, and one of you reveals a reward.
484. Collapsed Stairwell is Cleared.
485. Zen Mode stops it: Red Exhausts nothing.
486. Gray discards One Man's Junk from their deck.
487. Red's reward pool shows Flurry.
488. Red takes Flurry.
489. Cleanup.
490. Gray takes Riot Shield into hand.
491. Red discards Deadweight Grip from their play zone.
492. — end of turn 21 —
493. You are in: Villy, Coney's Work Husband.
494. Red draws Flurry.
495. Gray draws In Step.
496. Gray discards Pick The Lock from their hand.
497. Gray pays with Pick The Lock.
498. Gray plays Riot Shield.
499. Gray draws I'll Take That.
500. Red plays Pry Bar.
501. Red plays Fast Follow.
502. Gray discards I'll Take That from their hand.
503. Gray pays with I'll Take That.
504. Gray plays In Step.
505. Oomph 9 met — Ascend
506. Villy, Coney's Work Husband is Cleared.
507. Cleanup.
508. Gray takes Riot Shield into hand.
509. Red discards Pry Bar from their play zone.
510. Red discards Fast Follow from their play zone.
511. Gray discards In Step from their play zone.
512. — end of turn 22 —
513. Floor 7 is clear.
514. NOTE — Red's reward pool is empty. The Ascend offers Red nothing at all for the rest of the game, with three floors to go. Ten reward cards per character is exactly seven Ascends plus the Hazard reveals, and we burned through them faster than the tower is long.
515. Shove is Scrapped.
516. Red declines the reward.
517. Red shuffles 3 card(s) back in.
518. Gray takes Covering Fire.
519. Gray shuffles 10 card(s) back in.
520. Floor 8 is built: 4 rooms.
521. NOTE — Floor sizes have gone 10, 9, 8, 7, 6, 5, 4, and then 4 again for floor 8. The rulebook says each floor has one fewer room than the last. Either there is a lower bound nobody wrote down or floor 8 is wrong.
522. You are in: Collapsed Stairwell.
523. Red draws Pry Bar.
524. Gray draws Duck Under.
525. Gray draws Duck Under.
526. Gray discards Duck Under from their hand.
527. Gray pays with Duck Under.
528. Gray plays Riot Shield.
529. Gray draws One Man's Junk.
530. Gray discards One Man's Junk from their hand.
531. Gray pays with One Man's Junk.
532. Gray plays Duck Under.
533. Gray draws I'll Take That.
534. Scramble 2 met — Clear, but both of you Exhaust 1.
535. Scramble 5 met — Clear, and one of you reveals a reward.
536. Collapsed Stairwell is Cleared.
537. Zen Mode stops it: Red Exhausts nothing.
538. Gray discards Pick The Lock from their deck.
539. Gray's reward pool shows Here, Catch.
540. Gray takes Here, Catch.
541. Cleanup.
542. Gray takes Riot Shield into hand.
543. Gray discards Duck Under from their play zone.
544. — end of turn 23 —
545. You are in: Ruptured Coolant Line.
546. Red draws Charge In.
547. Gray draws Here, Catch.
548. Gray draws Pick The Lock.
549. Gray discards Pick The Lock from their hand.
550. Gray pays with Pick The Lock.
551. Gray plays Riot Shield.
552. Gray draws Covering Fire.
553. Gray discards Covering Fire from their hand.
554. Gray pays with Covering Fire.
555. Gray plays I'll Take That.
556. Gray draws In Step.
557. Red shuffles 1 card(s) back in.
558. Gray discards In Step from their hand.
559. Gray pays with In Step.
560. Gray plays Here, Catch.
561. Gray draws Pick The Lock.
562. NOTE — Here, Catch moves a Stuff card from Gray's hand to Red's, and Gray had none. It resolved silently with nothing said. Riot Shield was in the play zone at the time, so the card read as dead when I had been looking right at a Stuff card a moment earlier.
563. Scramble 4 met — Clear, but both of you get Bad Stuff.
564. Scramble 7 met — Clear, and one of you reveals a reward.
565. Ruptured Coolant Line is Cleared.
566. Red gets Torn Seal.
567. Red takes Torn Seal into hand.
568. Gray gets Faceful Of Slime.
569. Gray takes Faceful Of Slime into hand.
570. Gray's reward pool shows Level Up.
571. Gray takes Level Up.
572. Cleanup.
573. Gray takes Riot Shield into hand.
574. Gray discards I'll Take That from their play zone.
575. Gray discards Here, Catch from their play zone.
576. — end of turn 24 —
577. You are in: Ruptured Coolant Line.
578. Red draws Charge In.
579. Gray draws Level Up.
580. NOTE — Turn 25 and the run has to stop here. We are on floor 8 of 10, both decks are healthy, and nothing has come close to killing us since floor 1. The game stopped being dangerous around floor 3 and became a matter of finding the cheapest line each turn.
581. Gray discards Faceful Of Slime from their hand.
582. Gray pays with Faceful Of Slime.
583. Gray plays Riot Shield.
584. Gray draws Duck Under.
585. Gray discards Level Up from their hand.
586. Gray discards Duck Under from their hand.
587. Gray pays with Level Up, Duck Under.
588. Gray plays Pick The Lock.
589. Gray draws Every Little Bit Helps.
590. Scramble 4 met — Clear, but both of you get Bad Stuff.
591. Scramble 7 met — Clear, and one of you reveals a reward.
592. Ruptured Coolant Line is Cleared.
593. Red gets My Head Is Quantum Spinning.
594. Red takes My Head Is Quantum Spinning into hand.
595. Gray gets Sluggish.
596. Gray takes Sluggish into hand.
597. Gray's reward pool shows Hack the Doors.
598. Gray takes Hack the Doors.
599. Cleanup.
600. Gray takes Riot Shield into hand.
601. Gray discards Pick The Lock from their play zone.
602. — end of turn 25 —
603. NOTE — Stopping at the turn limit, on floor 8, with Red on 17 cards and Gray on 7 and neither ever in Last Stand. Sluggish is in Gray's hand now and every Gray card shows its cost bumped by one, which is the clearest the Bad Stuff has ever read. The run ends undefeated rather than won.

Floor 8 · turn 25 · Flip   floor deck 1, fled 0, cleared 3   Good Stuff 0, Bad Stuff 1
Red: deck 17, discard 0, hand 6
    Zen Mode [cost 0] — Holding: you don't `Exhaust`.
    Flurry [cost 1; (conditional)] — Oomph equal to twice the number of other cards Red played this turn.
    Charge In [cost 2; Oomph 4]
    Torn Seal [cost 2; Bad Stuff]
    Charge In [cost 2; Oomph 4]
    My Head Is Quantum Spinning [cost 1; Bad Stuff] — Holding: whenever you draw a card, your partner must also draw a card.
Gray: deck 7, discard 13, hand 4
    I Know Kung Fu [cost 4 (printed 3); Oomph 5] — Holding: when you play a card with Scramble, draw 1 card.
    Every Little Bit Helps [cost 2 (printed 1); (conditional)] — Scramble equal to twice the number of other cards Gray played this turn.
    Sluggish [cost 2 (printed 1); Bad Stuff] — Holding: cards cost +1 to play.
    Riot Shield [cost 2 (printed 1); Scramble 3; Good Stuff] — If the room is Cleared, return this to your hand at the end of the turn.

seed 3, 181 command(s) replayed, floor 8, turn 25, in progress (Flip).
```
