# Playtest 1 — first playtest

Recorded: 2026-09-06. Rules version: 0.1.0. Notes are the designer's, verbatim, tagged `[you]`. Nothing here is a ruling:
each note is a question or an observation, with a pointer to the rule or card it touches so a
later ticket has one place to start. The rulebook (`design/rulebook.md`) still says what is true.

## Notes

1. **Draw and play phases could be combined?** `[you]`
   Touches §5 Phases 2 and 3, and the "End of Draw" rule that nobody plays until both have stopped
   drawing.

2. **When adding stuff to your deck during ascend: you should be able to see your whole deck to
   choose which card it replaces.** `[you]`
   Touches §10 step 4 (Choose a reward). As written the reward is shuffled in and replaces nothing;
   the note implies a swap, and that the deck is open information at that moment.

3. **We never got close to having the max 5 cards in our hand.** `[you]`
   Touches §5 Draw, maximum hand size and the burned draw on a full hand. Observation, no proposal.

4. **Bad stuff card idea: when one draws, the other must also draw.** `[you]`
   A new `Bad Stuff` card for `design/cards.yaml`. Would need a ruling on what "must also draw"
   means against the §5 minimum and maximum, and against a partner in `Last Stand`.

5. **Face full of slime should cost 2.** `[you]`
   `Faceful Of Slime` (`Bad Stuff`, cost 1, *Holding: you may not draw more than 1 card at draw
   time*) in `design/cards.yaml`.

6. **A lot of times we have an empty hand.** `[you]`
   Observation. Related to note 3 and to §5 Cleanup step 2, which Exhausts every non-`Hold` card
   at end of turn.

7. **A pair of stitch-em-ups should heal either player.** `[you]`
   `A Pair Of Stich-Em-Ups` (`Good Stuff`, cost 1, *Move 2 cards from your exhaust pile to the
   bottom of your deck*) in `design/cards.yaml`. Currently reads only its player's own exhaust
   pile and deck.

8. **Is "Oomph" a better name than "Power"?** `[you]`
   `Power` is one of the two stats, §8, named on every card and room that prints it, and in
   `CONTEXT.md`. Naming question only.

9. **Hazard rooms need to provide big rewards to make them worth doing.** `[you]`
   Touches §6 Hazard room. See also `design/web-game/open-questions.md` #7: neither Hazard in the
   card list prints the reward tier the rulebook describes, so as played the higher threshold paid
   nothing.

10. **Should EVERY card in hand be held at end of turn?** `[you]`
    Touches §5 Cleanup step 2 and the `Hold` keyword, §8. Would make `Hold` the default rather than
    a keyword.

11. **OR should some cards go to a true discard pile and reshuffled in like a true deckbuilder, but
    then card costs are exhausted?** `[you]`
    The alternative to note 10. Touches §3 (a character has no discard pile other than the exhaust
    pile) and the deck-as-Stamina model, §2. The archived ticket
    `design/old/initial-design-archive/issues/04-deck-as-energy-and-hp-model.md` recorded a
    discard pile as the fallback if playtesting killed the model.
