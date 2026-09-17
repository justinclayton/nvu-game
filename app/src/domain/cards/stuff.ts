/* Good Stuff and Bad Stuff. Keyed by the name design/cards.yaml makes unique.
 *
 * Rulebook, Card anatomy: Stuff cards: Stuff is ordinary energy — you may discard it from hand to pay another
 * card's cost. Bad Stuff behaves like any other Stuff except that it
 * contributes no stats.
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
   * Once played, "this turn" covers the rest of the turn Crowbar sits in the
   * play zone — including a room's payout at Outcome, after the whole Play
   * phase (and so this card's own `onPlay`) has already run. That is the
   * primary case: a Crowbar played earlier in Play, paid off by the room
   * later. It is split across two hooks accordingly:
   *
   * - `onPlay` looks backward, once, at `thisTurn.goodStuffTaken` — whatever
   *   its controller was already handed earlier in the same turn, before
   *   Crowbar was played.
   * - `onEvent`, listening only from the play zone (the shape Covering Fire
   *   uses for the same reason), catches a later gain — the room's Outcome
   *   payout being the one there is today.
   *
   * Either hook can fire, but only one ever does: a `fired` marker keyed by
   * this copy's own card id is set the moment either pays out, so a Crowbar
   * that already looked back at play does not also react to the room's
   * payout minutes later, and its own bonus piece (itself a `STUFF_TAKEN` for
   * good_stuff) can never retrigger it. Two Crowbars each carry their own
   * key, so two played this turn pay two. Neither hook ever sees Crowbar's
   * own arrival — a room handing Crowbar to a hand is not Crowbar being
   * played, and while it sits in a hand `onEvent` is not listening at all.
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
   * Either character can be healed, so a character with cards in both discard
   * piles is asked which one first; a character with only one eligible pile
   * skips straight to picking the cards from it. Healing a partner in Last
   * Stand only refills their deck — nothing here clears the `lastStand` flag,
   * so the rulebook's "Last Stand ends at Cleanup" still holds. */
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

  /* "Holding: you may not draw more than 1 card per turn." */
  "Faceful Of Slime": {
    whileHeld: { drawCap: 1 },
  },

  /* "Holding: cards cost +1 to play."
   *
   * It bites its holder only: Red never pays for Gray (Each Turn, Play). */
  Sluggish: {
    whileHeld: { costDelta: 1 },
  },

  /* "Holding: Stuff you play has -1 Oomph." */
  Rust: {
    whileHeld: { stuffPowerDelta: -1 },
  },

  /* "Holding: You can't have more than 3 cards in your hand."
   *
   * Each Turn, Draw's hand cap is a draw-phase limit, so this is too: it stops you drawing
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
    exhaustX: 2,
  },

  /* "Holding: whenever you draw a card, your partner must also draw a card."
   *
   * One-way: the holder's draw forces the partner's, never the reverse. Any
   * draw counts — the opening draw, a chosen draw in Draw/Play, or one a card's
   * text causes — so this listens for both `CARD_DRAWN` and `DRAW_BURNED`,
   * which are the two shapes a draw can take (Each Turn). The forced draw itself is
   * stamped `forced` by `drawOne` and is skipped here, so it cannot chain: it
   * does not count as a draw that forces one, whether it lands on this same
   * copy or on a copy the partner is holding. Full Hand and Last Stand for the
   * forced draw come from `drawOne` and the same last-stand check `openingDraw`
   * uses — no new rule for either.
   *
   * Ruled for Faceful Of Slime: a draw cap already reached stops a forced draw
   * from happening at all — no card moves, and nothing is pushed to `events`,
   * so there is no draw event for anything else to see. `drawCapFor` reads
   * every `Holding:` line in the partner's hand, so Deadweight Grip's cap of 2
   * is stopped the same way; that extension is this engine's own reading, not
   * a ruling. See open-questions.md #17 and #19. */
  "My Head Is Quantum Spinning": {
    onEvent(event, state, ctx) {
      if (ctx.zone !== "hand") return nothing(state);
      if (event.type !== "CARD_DRAWN" && event.type !== "DRAW_BURNED") return nothing(state);
      if (event.character !== ctx.character || event.forced) return nothing(state);
      const partner = ctx.character === "Red" ? "Gray" : "Red";
      const partnerState = playerOf(state, partner);
      if (partnerState.lastStand) return nothing(state);
      if (partnerState.drewThisTurn >= drawCapFor(state, partner)) return nothing(state);
      const events: DomainEvent[] = [];
      return done(drawOne(state, partner, events, false, true), events);
    },
  },
};
