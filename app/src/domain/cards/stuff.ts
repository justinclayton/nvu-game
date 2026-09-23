/* Good Stuff and Bad Stuff. Keyed by the name design/cards.yaml makes unique.
 * See rulebook §8, Card anatomy: Stuff cards.
 */

import type { Character, DomainEvent, GameState, Pending } from "../types";
import { exhaustXPreventedBy } from "../queries";
import {
  CHARACTERS,
  discardFromHand,
  drawOne,
  exhaustFromDeck,
  grantFreePlay,
  hasFired,
  markFired,
  moveToBottomOfDeck,
  other,
  playerOf,
  returnToHand,
  takeFromExhaust,
  takeGoodStuff,
} from "../verbs";
import { ask, done, nothing, source, type BehaviourContext, type Registry } from "./behaviour";

/** The `ChooseCards` question for a Stich-Em-Ups heal, once the target is known. */
function healCardsAsk(state: GameState, ctx: BehaviourContext, target: Character): Pending {
  return {
    kind: "ChooseCards",
    prompt: `Move which 2 cards from ${target}'s Exhaust pile to the bottom of their deck?`,
    character: target,
    options: playerOf(state, target).exhaust,
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
   * once, whether the Good Stuff arrives before or after Crowbar is played. */
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

  /* "Choose a character. Move 2 cards from that character's Exhaust pile to
   * the bottom of their deck."
   *
   * Skips the character choice when only one side has an Exhaust pile to draw
   * from, and moves fewer than 2 if that pile is that short (validation's own
   * `Math.min(count, options.length)` already covers it). */
  "A Pair Of Stich-Em-Ups": {
    onPlay(state, ctx) {
      const eligible = CHARACTERS.filter((c) => playerOf(state, c).exhaust.length > 0);
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
      const lifted = takeFromExhaust(state, target, answer.cards);
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

  /* "If the room is Cleared, return this to your hand at the end of the turn." */
  "Riot Shield": {
    onCleanup(state, ctx) {
      if (state.resolution?.roomEnded !== "Cleared") return nothing(state);
      const events: DomainEvent[] = [];
      return done(returnToHand(state, ctx.character, ctx.card, events), events);
    },
  },

  /* "The next card played this turn costs 0."
   *
   * The next card either character plays, and gone when the Play phase ends. */
  "Overcharged Battery": {
    onPlay(state) {
      return done(grantFreePlay(state));
    },
  },

  /* ------------------------------------------------------------- Bad Stuff */

  /* "Holding: At Turn Start, draw 1 fewer card." */
  "Faceful Of Slime": {
    whileHeld: { drawTargetDelta: 1 },
  },

  /* "Holding: cards cost +1 to play."
   *
   * Bites its holder only: Red never pays for Gray (rulebook §7, Play). */
  Sluggish: {
    whileHeld: { costDelta: 1 },
  },

  /* "Holding: Stuff you play has -1 Oomph." */
  Rust: {
    whileHeld: { stuffPowerDelta: -1 },
  },

  /* "Holding: At Cleanup, discard cards other than this one until you hold
   * 3."
   *
   * The holder's own choice, from every OTHER card in hand — Spore Cloud
   * itself (any copy) is not an option, but still counts toward the 3. A
   * no-op once the hand is already 3 or fewer. */
  "Spore Cloud": {
    onCleanup(state, ctx) {
      const hand = playerOf(state, ctx.character).hand;
      const excess = hand.length - 3;
      if (excess <= 0) return nothing(state);
      const options = hand.filter((c) => c.name !== "Spore Cloud");
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Discard down to 3 cards.",
        character: ctx.character,
        options,
        count: excess,
        optional: false,
        source: source(ctx, "spore-cloud"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      return done(discardFromHand(state, ctx.character, answer.cards, events), events);
    },
  },

  /* "Holding: Every challenge also requires 2 `Scramble` to clear. A `Scramble` challenge requires 2 more instead.
   *  Play: Exhaust 2." */
  Panic: {
    whileHeld: { thresholdScrambleDelta: 2 },
    exhaustX: 2,
  },

  /* "Holding: Whenever your partner draws a card during Play, Exhaust 1."
   *
   * Only the partner's draws, and only ones a card's text causes during
   * Play — Turn Start's own automatic draw does not trigger it (`drawOne`'s
   * `turnStart` flag). A bare `Exhaust 1` line, so Zen Mode can stop it. */
  "My Head Is Quantum Spinning": {
    onEvent(event, state, ctx) {
      if (ctx.zone !== "hand") return nothing(state);
      if (event.type !== "CARD_DRAWN" || event.turnStart) return nothing(state);
      if (event.character !== other(ctx.character)) return nothing(state);
      const events: DomainEvent[] = [];
      const stoppedBy = exhaustXPreventedBy(state, ctx.character);
      if (stoppedBy) {
        events.push({ type: "EXHAUST_PREVENTED", character: ctx.character, amount: 1, by: stoppedBy });
        return done(state, events);
      }
      return done(exhaustFromDeck(state, ctx.character, 1, ctx.card.name, events), events);
    },
  },
};
