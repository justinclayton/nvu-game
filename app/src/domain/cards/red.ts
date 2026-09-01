/* Red's cards. Keyed by the name design/cards.yaml makes unique.
 *
 * Where a card's printed text allowed more than one reading, the reading is
 * marked here and written up in design/web-game/open-questions.md.
 */

import type { Card, Character, DomainEvent, GameState } from "../types";
import {
  exhaustFromDeck,
  playerOf,
  returnToHand,
  shuffleIntoDeck,
  takeFromExhaust,
  takeFromHand,
} from "../verbs";
import { ask, done, nothing, source, type Registry } from "./behaviour";

/** How many cards a character has in the play zone, this card excluded. */
const othersPlayed = (state: GameState, c: Character, self: Card): number =>
  state.playZone.filter((p) => p.owner === c && p.card.id !== self.id).length;

const playedBy = (state: GameState, c: Character): number =>
  state.playZone.filter((p) => p.owner === c).length;

/** "Exhaust N" — §8's unchosen loss, off the top of your own deck. */
const exhaustSelf = (amount: number) => ({
  onPlay(state: GameState, ctx: { readonly character: Character }) {
    const events: DomainEvent[] = [];
    return done(exhaustFromDeck(state, ctx.character, amount, "a printed cost", events), events);
  },
});

export const RED: Registry = {
  /* "Exhaust 2 (the top 2 cards of your deck go to your Exhaust pile)." */
  Overdrive: exhaustSelf(2),

  /* "Exhaust 1." */
  "Reckless Swing": exhaustSelf(1),

  /* "Exhaust 3." */
  Reckless: exhaustSelf(3),

  /* "If Gray played a card this turn, this costs 0."
   *
   * A printed cost, not a discount, so a `Holding:` line that raises costs still
   * raises this one. See open-questions.md #11. */
  "Fast Follow": {
    cost(state, _owner, card) {
      return playedBy(state, "Gray") > 0 ? 0 : card.cost;
    },
  },

  /* "Shuffle an exhausted Red card back into your deck."
   *
   * Red's own cards only: Stuff in the exhaust pile is not a Red card. */
  "Second Wind": {
    onPlay(state, ctx) {
      const options = playerOf(state, ctx.character).exhaust.filter((c) => c.owner === "Red");
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Shuffle which exhausted Red card back into your deck?",
        character: ctx.character,
        options,
        count: 1,
        optional: false,
        source: source(ctx, "second-wind"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      const lifted = takeFromExhaust(state, ctx.character, answer.cards);
      return done(shuffleIntoDeck(lifted, ctx.character, answer.cards, events), events);
    },
  },

  /* "This has Power +2 for each card you paid with this turn."
   *
   * Cards paid with have already gone to the exhaust pile, so the turn record is
   * what counts them. */
  "Junk Launcher": {
    stats(state, owner, card) {
      return { power: card.power + 2 * state.thisTurn.paid[owner], scramble: card.scramble };
    },
  },

  /* "Shuffle 1 Stuff from your hand into your deck." */
  "Heavy Pockets": {
    onPlay(state, ctx) {
      const options = playerOf(state, ctx.character).hand.filter((c) => c.kind !== "player");
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Shuffle which piece of Stuff into your deck?",
        character: ctx.character,
        options,
        count: 1,
        optional: false,
        source: source(ctx, "heavy-pockets"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      const lifted = takeFromHand(state, ctx.character, answer.cards);
      return done(shuffleIntoDeck(lifted, ctx.character, answer.cards, events), events);
    },
  },

  /* "Holding: Cards you play have +1 Power, but you may not draw more than 2
   * cards at draw time." */
  "Deadweight Grip": {
    whileHeld: { playedPowerDelta: 1, drawCap: 2 },
  },

  /* "If Gray has already played at least one card this turn, +2 Power. If this
   * is the card that clears the room, put this right back in your hand."
   *
   * No single card clears a room — the check happens once, when both characters
   * have stopped — so this reads as: if the room ended Cleared, it comes back.
   * See open-questions.md #12. */
  "Both Barrels": {
    stats(state, _owner, card) {
      const bonus = playedBy(state, "Gray") > 0 ? 2 : 0;
      return { power: card.power + bonus, scramble: card.scramble };
    },
    onCleanup(state, ctx) {
      if (state.resolution?.roomEnded !== "Cleared") return nothing(state);
      const events: DomainEvent[] = [];
      return done(returnToHand(state, ctx.character, ctx.card, events), events);
    },
  },

  /* "Power equal to twice the number of other cards Red played this turn." */
  Flurry: {
    stats(state, owner, card) {
      return { power: 2 * othersPlayed(state, owner, card), scramble: card.scramble };
    },
  },
};
