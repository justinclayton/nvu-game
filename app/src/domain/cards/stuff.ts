/* Good Stuff and Bad Stuff. Keyed by the name design/cards.yaml makes unique.
 * See rulebook §8, Card anatomy: Stuff cards.
 */

import type { Character, DomainEvent, GameState, Pending } from "../types";
import { drawCapFor } from "../queries";
import {
  CHARACTERS,
  drawOne,
  grantFreePlay,
  hasFired,
  markFired,
  moveToBottomOfDeck,
  playerOf,
  returnToHand,
  takeFromDiscard,
  takeGoodStuff,
} from "../verbs";
import { ask, done, nothing, source, type BehaviourContext, type Registry } from "./behaviour";

/** The `ChooseCards` question for a Stich-Em-Ups heal, once the target is known. */
function healCardsAsk(state: GameState, ctx: BehaviourContext, target: Character): Pending {
  return {
    kind: "ChooseCards",
    prompt: `Move which 2 cards to the bottom of ${target}'s deck?`,
    character: target,
    options: playerOf(state, target).discard,
    count: 2,
    optional: false,
    source: source(ctx, `stich-em-ups:${target}`),
  };
}

export const STUFF: Registry = {
  /* ------------------------------------------------------------ Good Stuff */

  /* "Play: if you get any Good Stuff this turn, get an additional one."
   *
   * Two hooks share one `fired` marker per copy so the bonus pays out exactly
   * once, whether the Good Stuff arrives before or after Crowbar is played.
   * See open-questions.md #16. */
  Crowbar: {
    onPlay(state, ctx) {
      if (state.thisTurn.goodStuffTaken[ctx.character] === 0) return nothing(state);
      const key = `${ctx.card.id}:crowbar`;
      const events: DomainEvent[] = [];
      return done(takeGoodStuff(markFired(state, key), ctx.character, 1, events), events);
    },
    onEvent(event, state, ctx) {
      if (ctx.zone !== "playZone") return nothing(state);
      if (event.type !== "STUFF_TAKEN" || event.character !== ctx.character) return nothing(state);
      if (event.card.kind !== "good_stuff") return nothing(state);
      const key = `${ctx.card.id}:crowbar`;
      if (hasFired(state, key)) return nothing(state);
      const events: DomainEvent[] = [];
      return done(takeGoodStuff(markFired(state, key), ctx.character, 1, events), events);
    },
  },

  /* "Choose a character. Move 2 cards from that character's discard pile to the
   * bottom of their deck."
   *
   * Skips the character choice when only one side has discard to draw from. */
  "A Pair Of Stich-Em-Ups": {
    onPlay(state, ctx) {
      const eligible = CHARACTERS.filter((c) => playerOf(state, c).discard.length > 0);
      if (eligible.length === 0) return nothing(state);
      if (eligible.length === 1) {
        const target = eligible[0];
        if (!target) return nothing(state);
        return ask(state, healCardsAsk(state, ctx, target));
      }
      return ask(state, {
        kind: "ChooseCharacter",
        prompt: "Heal which character?",
        options: eligible,
        source: source(ctx, "stich-em-ups-character"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind === "character") {
        return ask(state, healCardsAsk(state, ctx, answer.character));
      }
      if (answer.kind !== "cards") return nothing(state);
      const target = answer.tag.split(":")[1] === "Red" ? "Red" : "Gray";
      const events: DomainEvent[] = [];
      const lifted = takeFromDiscard(state, target, answer.cards);
      return done(moveToBottomOfDeck(lifted, target, answer.cards, events), events);
    },
  },

  /* "One of you draws 1 card." */
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
      return done(drawOne(state, answer.character, events), events);
    },
  },

  /* "If the room is Cleared, return this to your hand at the end of the turn."
   *
   * See open-questions.md #12. */
  "Riot Shield": {
    onCleanup(state, ctx) {
      if (state.resolution?.roomEnded !== "Cleared") return nothing(state);
      const events: DomainEvent[] = [];
      return done(returnToHand(state, ctx.character, ctx.card, events), events);
    },
  },

  /* "The next card played this turn costs 0."
   *
   * The next card either character plays, and gone when the Play phase ends.
   * See open-questions.md #14. */
  "Overcharged Battery": {
    onPlay(state) {
      return done(grantFreePlay(state));
    },
  },

  /* ------------------------------------------------------------- Bad Stuff */

  /* "Holding: you may not draw more than 1 card per turn.
   *  Ascend: keep this, or shuffle it into the Bad Stuff pool and Scrap a
   *  non-Stuff card." */
  "Faceful Of Slime": {
    whileHeld: { drawCap: 1 },
  },

  /* "Holding: cards cost +1 to play.
   *  Ascend: keep this, or shuffle it into the Bad Stuff pool and Scrap a
   *  non-Stuff card."
   *
   * Bites its holder only: Red never pays for Gray (rulebook §7, Play). */
  Sluggish: {
    whileHeld: { costDelta: 1 },
  },

  /* "Holding: Stuff you play has -1 Oomph.
   *  Ascend: keep this, or shuffle it into the Bad Stuff pool and Scrap a
   *  non-Stuff card." */
  Rust: {
    whileHeld: { stuffPowerDelta: -1 },
  },

  /* "Holding: You can't have more than 3 cards in your hand.
   *  Ascend: keep this, or shuffle it into the Bad Stuff pool and Scrap a
   *  non-Stuff card."
   *
   * A ceiling on Turn Start's "draw up to five"; Stuff pushed into hand by a
   * room ignores it. Flagged for the economy pass (fights draw-to-five). */
  "Spore Cloud": {
    whileHeld: { handCap: 3 },
  },

  /* "Holding: ALL rooms require an additional 2 `Scramble` to clear.
   *  Play: Exhaust 2.
   *  Ascend: keep this, or shuffle it into the Bad Stuff pool and Scrap a
   *  non-Stuff card."
   *
   * Read from either hand — one held Panic taxes the team. */
  Panic: {
    whileHeld: { thresholdScrambleDelta: 2 },
    exhaustX: 2,
  },

  /* "Holding: whenever you draw a card, your partner must also draw a card.
   *  Ascend: keep this, or shuffle it into the Bad Stuff pool and Scrap a
   *  non-Stuff card."
   *
   * One-way, and the forced draw can't chain (see `drawOne`'s `forced` flag).
   * Draw caps in the partner's hand block it same as any draw. See
   * open-questions.md #17, #19. */
  "My Head Is Quantum Spinning": {
    onEvent(event, state, ctx) {
      if (ctx.zone !== "hand") return nothing(state);
      if (event.type !== "CARD_DRAWN") return nothing(state);
      if (event.character !== ctx.character || event.forced) return nothing(state);
      const partner = ctx.character === "Red" ? "Gray" : "Red";
      if (playerOf(state, partner).drewThisTurn >= drawCapFor(state, partner)) return nothing(state);
      const events: DomainEvent[] = [];
      return done(drawOne(state, partner, events, true), events);
    },
  },
};
