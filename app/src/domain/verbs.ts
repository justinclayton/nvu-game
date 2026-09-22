/* The engine's own verbs for moving cards around.
 *
 * Every rule and every card behaviour goes through these, so a card effect
 * announces itself with the same events a rule would. Nothing here decides
 * anything: the phase logic lives in engine.ts and the card text in
 * cards/behaviours.ts.
 *
 * Each verb takes the events array it should announce itself into and returns
 * the new state. Nothing mutates the state handed to it.
 */

import type {
  Card,
  Character,
  DomainEvent,
  DiscardedFrom,
  GameState,
  PlayerState,
} from "./types";
import { shuffle } from "./rng";

export const CHARACTERS: readonly Character[] = ["Red", "Gray"];

export const other = (c: Character): Character => (c === "Red" ? "Gray" : "Red");

export const playerOf = (state: GameState, c: Character): PlayerState => state[c];

export const withPlayer = (state: GameState, c: Character, p: PlayerState): GameState =>
  c === "Red" ? { ...state, Red: p } : { ...state, Gray: p };

/** Everyone not Down. A Down character is skipped by everything (rulebook, Going Down). */
export const standing = (state: GameState): readonly Character[] =>
  CHARACTERS.filter((c) => !state[c].down);

/* --------------------------------------------------------------- discarding */

/**
 * Setup: to discard is to move a card to its owner's discard pile — gone for
 * the floor. Stuff discards like anything else; the Scrapyard only comes into
 * it at ascension (rulebook, Ascending).
 */
export function discard(
  state: GameState,
  c: Character,
  card: Card,
  from: DiscardedFrom,
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  events.push({ type: "CARD_DISCARDED", character: c, card, from });
  return withPlayer(state, c, { ...p, discard: [...p.discard, card] });
}

/** Rulebook, Going Down: one character going Down ends the run (rulebook, Winning and losing). */
export function goDown(
  state: GameState,
  c: Character,
  cause: string,
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  if (p.down) return state;
  events.push({ type: "WENT_DOWN", character: c, cause });
  let next = withPlayer(state, c, { ...p, down: true, hand: [] });
  for (const card of p.hand) next = discard(next, c, card, "hand", events);
  events.push({ type: "GAME_OVER", outcome: "Defeat" });
  return { ...next, phase: "GameOver", outcome: "Defeat" };
}

/**
 * Rulebook, Keywords: Empty deck — shared by draw and Exhaust, the two ways a card can be
 * taken off the top of a deck. If the deck is empty, the discard pile
 * reshuffles into a new deck first. If the discard pile is empty too, the
 * character goes Down, which ends the run right there — the caller sees that
 * as a `null` card and a state already moved to `GameOver`.
 */
function takeTopOfDeck(
  state: GameState,
  c: Character,
  cause: string,
  events: DomainEvent[],
): readonly [GameState, Card | null] {
  let next = state;
  let p = playerOf(next, c);
  if (p.deck.length === 0) {
    if (p.discard.length === 0) return [goDown(next, c, cause, events), null];
    const [deck, seed] = shuffle(p.discard, next.seed);
    events.push({ type: "DISCARD_RESHUFFLED", character: c, cards: deck.length });
    next = withPlayer({ ...next, seed }, c, { ...p, deck, discard: [] });
    p = playerOf(next, c);
  }
  const card = p.deck[0];
  if (!card) return [goDown(next, c, cause, events), null];
  return [withPlayer(next, c, { ...p, deck: p.deck.slice(1) }), card];
}

/**
 * Rulebook, Card anatomy: Keywords: `Exhaust X cards from your deck` — a loss you did not
 * choose, off the top, face up, into the Exhaust pile, gone for the run.
 */
export function exhaustFromDeck(
  state: GameState,
  c: Character,
  amount: number,
  cause: string,
  events: DomainEvent[],
): GameState {
  let next = state;
  for (let i = 0; i < amount; i++) {
    if (next.phase === "GameOver") return next;
    const p = playerOf(next, c);
    if (p.down) return next; // A Down character takes no punishments.
    const [after, card] = takeTopOfDeck(next, c, cause, events);
    if (!card) return after; // Went Down — the run is over.
    const exhausting = playerOf(after, c);
    events.push({ type: "CARD_EXHAUSTED", character: c, card });
    next = withPlayer(after, c, { ...exhausting, exhaust: [...exhausting.exhaust, card] });
  }
  return next;
}

/** Rulebook, Card anatomy: Keywords: `Discard X cards from your hand` — a cost you chose. */
export function discardFromHand(
  state: GameState,
  c: Character,
  cards: readonly Card[],
  events: DomainEvent[],
): GameState {
  const ids = new Set(cards.map((x) => x.id));
  const p = playerOf(state, c);
  let next = withPlayer(state, c, { ...p, hand: p.hand.filter((x) => !ids.has(x.id)) });
  for (const card of cards) next = discard(next, c, card, "hand", events);
  return next;
}

/* ----------------------------------------------------------------- drawing */

/**
 * Each Turn, Turn Start: draw one card, straight to hand. Nothing caps a single draw
 * — Turn Start's own "until you hold 5" is a stopping condition the caller
 * applies, not a rule this verb enforces, so a card that draws you a card
 * outside that step is never burned or refused; the hand may exceed 5
 * (rulebook, About the game).
 *
 * `forced` marks a draw that a card's text made someone else take, as opposed
 * to one they chose. It is stamped onto the resulting event so a card that
 * triggers off draws can tell its own forced draw apart from one that counts
 * toward triggering it again (see `My Head Is Quantum Spinning`, which must
 * not chain off the draw it just forced).
 *
 * `turnStart` marks one of Turn Start's own automatic draws, as opposed to a
 * card-driven draw during Play — see `My Head Is Quantum Spinning`, which
 * only hears the latter.
 *
 * Rulebook, Keywords: Empty deck: a draw from an empty deck and discard pile puts that
 * character Down, which ends the run (rulebook, Going Down) — every draw goes
 * through here, so this is the one place that needs to know.
 */
export function drawOne(
  state: GameState,
  c: Character,
  events: DomainEvent[],
  forced = false,
  turnStart = false,
): GameState {
  const p = playerOf(state, c);
  if (p.down) return state;
  const [after, card] = takeTopOfDeck(state, c, "drew from an empty deck and discard pile", events);
  if (!card) return after; // Went Down — the run is over.
  const drawing = playerOf(after, c);
  events.push({ type: "CARD_DRAWN", character: c, card, forced, turnStart });
  return withPlayer(after, c, {
    ...drawing,
    hand: [...drawing.hand, card],
    drewThisTurn: drawing.drewThisTurn + 1,
  });
}

/**
 * Rulebook, Going Down: no card may be put into a Down character's hand — you cannot park Stuff on
 * a partner who is out.
 */
export function moveToHand(
  state: GameState,
  c: Character,
  card: Card,
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  if (p.down) return state;
  events.push({ type: "CARD_TO_HAND", character: c, card });
  return withPlayer(state, c, { ...p, hand: [...p.hand, card] });
}

/* ---------------------------------------------------------------- the piles */

/** Rulebook, Card anatomy: Keywords: to Scrap is to move a card to the Scrapyard, gone for the run. */
export function scrap(
  state: GameState,
  c: Character | null,
  card: Card,
  events: DomainEvent[],
): GameState {
  events.push({ type: "CARD_SCRAPPED", character: c, card });
  return { ...state, scrapyard: [...state.scrapyard, card] };
}

/** Shuffle cards into a character's deck. Returns the state with the seed advanced. */
export function shuffleIntoDeck(
  state: GameState,
  c: Character,
  cards: readonly Card[],
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  const [deck, seed] = shuffle([...p.deck, ...cards], state.seed);
  if (cards.length > 0) events.push({ type: "CARDS_SHUFFLED_IN", character: c, cards });
  return withPlayer({ ...state, seed }, c, { ...p, deck });
}

/** Cards a character no longer holds. No event: the verb that receives them says so. */
export function takeFromHand(state: GameState, c: Character, cards: readonly Card[]): GameState {
  const ids = new Set(cards.map((x) => x.id));
  const p = playerOf(state, c);
  return withPlayer(state, c, { ...p, hand: p.hand.filter((x) => !ids.has(x.id)) });
}

/** Cards lifted back out of a discard pile, for a card that says it can. */
export function takeFromDiscard(
  state: GameState,
  c: Character,
  cards: readonly Card[],
): GameState {
  const ids = new Set(cards.map((x) => x.id));
  const p = playerOf(state, c);
  return withPlayer(state, c, { ...p, discard: p.discard.filter((x) => !ids.has(x.id)) });
}

/**
 * Cards lifted back out of the Exhaust pile, for a card that says it can.
 * Rulebook, Setup: the Exhaust pile is otherwise permanent — nothing else
 * takes a card back out of it.
 */
export function takeFromExhaust(
  state: GameState,
  c: Character,
  cards: readonly Card[],
): GameState {
  const ids = new Set(cards.map((x) => x.id));
  const p = playerOf(state, c);
  return withPlayer(state, c, { ...p, exhaust: p.exhaust.filter((x) => !ids.has(x.id)) });
}

/** Under the deck, so it is the last thing you will see rather than the next. */
export function moveToBottomOfDeck(
  state: GameState,
  c: Character,
  cards: readonly Card[],
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  for (const card of cards) events.push({ type: "CARD_MOVED", character: c, card, to: "deck" });
  return withPlayer(state, c, { ...p, deck: [...p.deck, ...cards] });
}

/**
 * A card taking itself back out of the play zone, at cleanup.
 *
 * Rulebook, Going Down: no card may be put into a Down character's hand, so a card whose owner is
 * out stays in the play zone and is discarded with everything else.
 */
export function returnToHand(
  state: GameState,
  c: Character,
  card: Card,
  events: DomainEvent[],
): GameState {
  if (!state.playZone.some((p) => p.card.id === card.id)) return state;
  if (playerOf(state, c).down) return state;
  const lifted = { ...state, playZone: state.playZone.filter((p) => p.card.id !== card.id) };
  return moveToHand(lifted, c, card, events);
}

/** Arm a free play: the next card played this turn costs nothing, whoever plays it. */
export const grantFreePlay = (state: GameState): GameState => ({
  ...state,
  thisTurn: { ...state.thisTurn, freePlays: state.thisTurn.freePlays + 1 },
});

/** Drop every free play nobody used. The discount is for a card played this turn. */
export const clearFreePlays = (state: GameState): GameState =>
  state.thisTurn.freePlays === 0
    ? state
    : { ...state, thisTurn: { ...state.thisTurn, freePlays: 0 } };

/** Use up one free play, as the card it paid for is played. */
export const spendFreePlay = (state: GameState): GameState => ({
  ...state,
  thisTurn: { ...state.thisTurn, freePlays: Math.max(0, state.thisTurn.freePlays - 1) },
});

/** Put a card on top of a deck. Nothing shuffles during a floor, so it is next. */
export function topDeck(state: GameState, c: Character, card: Card): GameState {
  const p = playerOf(state, c);
  return withPlayer(state, c, { ...p, deck: [card, ...p.deck] });
}

/* -------------------------------------------------------------------- Stuff */

/**
 * What you earn is drawn face down from the Good Stuff pool and goes to that
 * character's hand. A Down character earns nothing. See open-questions.md #20.
 *
 * Every piece handed over is also tallied on `thisTurn.goodStuffTaken`, which
 * is how Crowbar's own "if you got any Good Stuff this turn" looks backward
 * at what has already landed. See open-questions.md #16.
 */
export function takeGoodStuff(
  state: GameState,
  c: Character,
  count: number,
  events: DomainEvent[],
): GameState {
  let next = state;
  for (let i = 0; i < count; i++) {
    if (playerOf(next, c).down) return next;
    const [card, rest, seed] = drawFromPool(next.pools.goodStuff, next.seed);
    // The pool never refills: spent Stuff goes to the Scrapyard at ascension.
    // See open-questions.md #6. Say so — a reward the log announced but the
    // pool could not pay must not go silent (issue #37).
    if (!card) {
      events.push({ type: "STUFF_POOL_EMPTY", character: c, pool: "good_stuff" });
      return next;
    }
    next = { ...next, seed, pools: { ...next.pools, goodStuff: rest } };
    events.push({ type: "STUFF_TAKEN", character: c, card });
    next = moveToHand(next, c, card, events);
    next = {
      ...next,
      thisTurn: {
        ...next.thisTurn,
        goodStuffTaken: { ...next.thisTurn.goodStuffTaken, [c]: next.thisTurn.goodStuffTaken[c] + 1 },
      },
    };
  }
  return next;
}

/** Bad Stuff is dealt to you, as a room's printed "gets Bad Stuff" punishment. */
export function dealBadStuff(
  state: GameState,
  c: Character,
  events: DomainEvent[],
): GameState {
  if (playerOf(state, c).down) return state; // takes no punishments (rulebook, Going Down)
  const [card, rest, seed] = drawFromPool(state.pools.badStuff, state.seed);
  if (!card) {
    events.push({ type: "STUFF_POOL_EMPTY", character: c, pool: "bad_stuff" });
    return state;
  }
  const next = { ...state, seed, pools: { ...state.pools, badStuff: rest } };
  events.push({ type: "STUFF_TAKEN", character: c, card });
  return moveToHand(next, c, card, events);
}

/** Has this once-per-turn trigger already gone off? See open-questions.md #16. */
export const hasFired = (state: GameState, key: string): boolean => state.thisTurn.fired.includes(key);

/** Mark a once-per-turn trigger as spent, so an effect that could feed itself fires once. */
export const markFired = (state: GameState, key: string): GameState => ({
  ...state,
  thisTurn: { ...state.thisTurn, fired: [...state.thisTurn.fired, key] },
});

function drawFromPool(
  pool: readonly Card[],
  seed: number,
): readonly [Card | null, readonly Card[], number] {
  if (pool.length === 0) return [null, pool, seed];
  const [shuffled, next] = shuffle(pool, seed);
  return [shuffled[0] as Card, shuffled.slice(1), next];
}

