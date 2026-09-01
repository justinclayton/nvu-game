/* Good Stuff and Bad Stuff. Keyed by the name design/cards.yaml makes unique.
 *
 * §7: Stuff has `Hold`, so it stays in hand across turns, and it is ordinary
 * energy — you may Exhaust it from hand to pay another card's cost. Bad Stuff
 * behaves like any other Stuff except that it contributes no stats.
 */

import type { DomainEvent } from "../types";
import {
  CHARACTERS,
  drawOne,
  exhaustFromDeck,
  grantFreePlay,
  hasFired,
  markFired,
  moveToBottomOfDeck,
  playerOf,
  returnToHand,
  takeFromExhaust,
  takeGoodStuff,
} from "../verbs";
import { ask, done, nothing, source, type Registry } from "./behaviour";

export const STUFF: Registry = {
  /* ------------------------------------------------------------ Good Stuff */

  /* "If you get any Good Stuff this turn, get an additional one."
   *
   * Once per turn per Crowbar: the extra piece is itself Good Stuff, and without
   * the marker it would feed itself for as long as the pool held out. */
  Crowbar: {
    onEvent(event, state, ctx) {
      if (ctx.zone !== "hand") return nothing(state);
      if (event.type !== "STUFF_TAKEN" || event.character !== ctx.character) return nothing(state);
      if (event.card.kind !== "good_stuff") return nothing(state);
      const key = `${ctx.card.id}:crowbar`;
      if (hasFired(state, key)) return nothing(state);
      const events: DomainEvent[] = [];
      return done(takeGoodStuff(markFired(state, key), ctx.character, 1, events), events);
    },
  },

  /* "Move 2 cards from your exhaust pile to the bottom of your deck." */
  "A Pair Of Stich-Em-Ups": {
    onPlay(state, ctx) {
      const options = playerOf(state, ctx.character).exhaust;
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Move which 2 cards to the bottom of your deck?",
        character: ctx.character,
        options,
        count: 2,
        optional: false,
        source: source(ctx, "stich-em-ups"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      const lifted = takeFromExhaust(state, ctx.character, answer.cards);
      return done(moveToBottomOfDeck(lifted, ctx.character, answer.cards, events), events);
    },
  },

  /* "One of you draws 1 card, (even if their hand is full)." */
  "Grav Harness": {
    onPlay(state, ctx) {
      const options = CHARACTERS.filter((c) => {
        const p = playerOf(state, c);
        return !p.down && p.deck.length > 0;
      });
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCharacter",
        prompt: "Who draws a card?",
        options,
        source: source(ctx, "grav-harness"),
      });
    },
    onChoice(answer, state) {
      if (answer.kind !== "character") return nothing(state);
      const events: DomainEvent[] = [];
      // The card says "even if their hand is full", so the cap does not apply
      // and nothing is burned.
      return done(drawOne(state, answer.character, events, true), events);
    },
  },

  /* "At the end of turn, return this card to your hand."
   *
   * Playing a `Hold` card normally spends it (§8): it goes to the play zone and
   * Exhausts with everything else. This one comes back instead. */
  "Riot Shield": {
    onCleanup(state, ctx) {
      const events: DomainEvent[] = [];
      return done(returnToHand(state, ctx.character, ctx.card, events), events);
    },
  },

  /* "The next card played this turn costs 0."
   *
   * Its holder's next card: Red never pays for Gray, so a discount cannot cross
   * either. See open-questions.md #14. */
  "Overcharged Battery": {
    onPlay(state, ctx) {
      return done(grantFreePlay(state, ctx.character));
    },
  },

  /* ------------------------------------------------------------- Bad Stuff */

  /* "Holding: you may not draw more than 1 card at draw time." */
  "Faceful Of Slime": {
    whileHeld: { drawCap: 1 },
  },

  /* "Holding: cards cost +1 to play."
   *
   * It bites its holder only: Red never pays for Gray (§5). */
  Sluggish: {
    whileHeld: { costDelta: 1 },
  },

  /* "Holding: Stuff you play has -1 Power." */
  Rust: {
    whileHeld: { stuffPowerDelta: -1 },
  },

  /* "Holding: You can't have more than 3 cards in your hand."
   *
   * §5's hand cap is a draw-phase limit, so this is too: it stops you drawing
   * up past 3, and Stuff pushed into your hand by a room ignores it as ever. */
  "Spore Cloud": {
    whileHeld: { handCap: 3 },
  },

  /* "Holding: ALL rooms require an additional 2 Scramble to clear.
   *  Play: Exhaust 2."
   *
   * "ALL rooms" is read from either hand — one held Panic taxes the team. */
  Panic: {
    whileHeld: { thresholdScrambleDelta: 2 },
    onPlay(state, ctx) {
      const events: DomainEvent[] = [];
      return done(exhaustFromDeck(state, ctx.character, 2, "Panic", events), events);
    },
  },
};
