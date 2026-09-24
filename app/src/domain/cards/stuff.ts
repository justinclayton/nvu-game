/* Good Stuff and Bad Stuff. Keyed by the name design/cards.yaml makes unique.
 * See rulebook §8, Card anatomy: Stuff cards.
 */

import type { Character, DomainEvent, GameState, Pending } from "../types";
import { exhaustXPreventedBy } from "../queries";
import {
  applyPoolPenalty,
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
  scrap,
  takeFrom,
  takeGoodStuff,
} from "../verbs";
import { ask, done, nothing, source, type BehaviourContext, type Registry } from "./behaviour";

/** The `ChooseCards` question for a Stitch-Em-Ups heal, once the target is known. */
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

  /* "Play: If you get any Good Stuff this turn, get 1 additional Good Stuff."
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
  "A Pair Of Stitch-Em-Ups": {
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
      const lifted = takeFrom(state, target, "exhaust", answer.cards);
      return done(moveToBottomOfDeck(lifted, target, answer.cards, events), events);
    },
  },

  /* "One of you draws 1 card."
   *
   * Rulebook, Keywords: Empty deck: an empty deck with a non-empty discard still
   * draws — it reshuffles first — so only a character with both empty, or already
   * Down, is not a legal choice.
   *
   * Skips the character choice when only one side is eligible to draw — the
   * same "no real choice" shape as Stitch-Em-Ups' heal target above. */
  "Grav Harness": {
    onPlay(state, ctx) {
      const options = CHARACTERS.filter((c) => {
        const p = playerOf(state, c);
        return !p.down && (p.deck.length > 0 || p.discard.length > 0);
      });
      if (options.length === 0) return nothing(state);
      if (options.length === 1) {
        const only = options[0];
        if (!only) return nothing(state);
        const events: DomainEvent[] = [];
        return done(drawOne(state, only, events), events);
      }
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

  /* "If the room is Cleared, return this card to your hand at the end of the turn." */
  "Riot Shield": {
    onCleanup(state, ctx) {
      if (state.resolution?.roomEnded !== "Cleared") return nothing(state);
      const events: DomainEvent[] = [];
      return done(returnToHand(state, ctx.character, ctx.card, events), events);
    },
  },

  /* "The next card played this turn is played for free."
   *
   * The next card either character plays, and gone when the Play phase ends. */
  "Overcharged Battery": {
    onPlay(state) {
      return done(grantFreePlay(state));
    },
  },

  /* "Play: Draw 1 card." */
  "Stim Pack": {
    onPlay(state, ctx) {
      const events: DomainEvent[] = [];
      return done(drawOne(state, ctx.character, events), events);
    },
  },

  /* "Play: Look at the top 3 cards of the Floor deck." */
  "High-Frequency Scanner": {
    onPlay(state, ctx) {
      const top = state.floorDeck.slice(0, 3);
      return done(state, [
        { type: "CARDS_PEEKED", character: ctx.character, pile: "Floor deck", cards: top },
      ]);
    },
  },

  /* "Play: Scrap 1 Bad Stuff card from your hand or discard pile." */
  "Automated Salvage Kit": {
    onPlay(state, ctx) {
      const p = playerOf(state, ctx.character);
      const options = [...p.hand, ...p.discard].filter((c) => c.kind === "bad_stuff");
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Scrap which Bad Stuff card from your hand or discard pile?",
        character: ctx.character,
        options,
        count: 1,
        optional: false,
        source: source(ctx, "automated-salvage-kit"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      let s = state;
      for (const chosen of answer.cards) {
        const inHand = playerOf(s, ctx.character).hand.some((c) => c.id === chosen.id);
        s = inHand
          ? takeFrom(s, ctx.character, "hand", [chosen])
          : takeFrom(s, ctx.character, "discard", [chosen]);
        s = scrap(s, ctx.character, chosen, events);
      }
      return done(s, events);
    },
  },

  /* "Exhaust 2." */
  "Emergency Power Core": { exhaustX: 2 },

  /* ------------------------------------------------------------- Bad Stuff */

  /* "Holding: At Turn Start, draw 1 fewer card." */
  "Faceful Of Slime": {
    whileHeld: { drawTargetDelta: 1 },
  },

  /* "Holding: Cards you play cost +1 card to play."
   *
   * Bites its holder only: Red never pays for Gray (rulebook §7, Play). */
  Sluggish: {
    whileHeld: { costDelta: 1 },
  },

  /* "Holding: Stuff cards you play have -1 Oomph and -1 Scramble." */
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

  /* "Holding: Every room threshold requires +2 Scramble to be met. Play: Exhaust 2." */
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

  /* "Holding: At Turn Start, Exhaust 1. Play: Scrap 1 Good Stuff card from your hand." */
  "Corrosive Acid": {
    onTurnStart(state, ctx) {
      const events: DomainEvent[] = [];
      const stoppedBy = exhaustXPreventedBy(state, ctx.character);
      if (stoppedBy) {
        events.push({ type: "EXHAUST_PREVENTED", character: ctx.character, amount: 1, by: stoppedBy });
        return done(state, events);
      }
      return done(exhaustFromDeck(state, ctx.character, 1, ctx.card.name, events), events);
    },
    onPlay(state, ctx) {
      const options = playerOf(state, ctx.character).hand.filter((c) => c.kind === "good_stuff");
      if (options.length === 0) return nothing(state);
      return ask(state, {
        kind: "ChooseCards",
        prompt: "Scrap which Good Stuff card from your hand?",
        character: ctx.character,
        options,
        count: 1,
        optional: false,
        source: source(ctx, "corrosive-acid"),
      });
    },
    onChoice(answer, state, ctx) {
      if (answer.kind !== "cards") return nothing(state);
      const events: DomainEvent[] = [];
      const lifted = takeFrom(state, ctx.character, "hand", answer.cards);
      let s = lifted;
      for (const chosen of answer.cards) s = scrap(s, ctx.character, chosen, events);
      return done(s, events);
    },
  },

  /* "Holding: Whenever you play a card with Cost 0, lose 1 Oomph and 1 Scramble from the Stat pool this turn." */
  "System Feedback": {
    onEvent(event, state, ctx) {
      if (ctx.zone !== "hand") return nothing(state);
      if (event.type !== "CARD_PLAYED" || event.character !== ctx.character) return nothing(state);
      if (event.card.cost !== 0) return nothing(state);
      return done(applyPoolPenalty(state, 1, 1));
    },
  },
};
