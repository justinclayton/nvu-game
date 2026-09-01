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

import { HAND_CAP } from "./setup";
import type {
  Card,
  Character,
  DomainEvent,
  ExhaustedFrom,
  GameState,
  PlayerState,
} from "./types";
import { shuffle } from "./rng";

export const CHARACTERS: readonly Character[] = ["Red", "Gray"];

export const other = (c: Character): Character => (c === "Red" ? "Gray" : "Red");

export const playerOf = (state: GameState, c: Character): PlayerState => state[c];

export const withPlayer = (state: GameState, c: Character, p: PlayerState): GameState =>
  c === "Red" ? { ...state, Red: p } : { ...state, Gray: p };

/** Everyone not Down. A Down character is skipped by everything (§9). */
export const standing = (state: GameState): readonly Character[] =>
  CHARACTERS.filter((c) => !state[c].down);

/* --------------------------------------------------------------- exhausting */

/**
 * §4: to Exhaust is to move a card to its owner's exhaust pile — gone for the
 * floor. Stuff exhausts like anything else; the Scrapyard only comes into it at
 * ascension (§7).
 */
export function exhaust(
  state: GameState,
  c: Character,
  card: Card,
  from: ExhaustedFrom,
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  events.push({ type: "CARD_EXHAUSTED", character: c, card, from });
  return withPlayer(state, c, { ...p, exhaust: [...p.exhaust, card] });
}

/** §9: going Down empties your hand into your exhaust pile. */
export function goDown(
  state: GameState,
  c: Character,
  cause: string,
  events: DomainEvent[],
): GameState {
  const p = playerOf(state, c);
  if (p.down) return state;
  events.push({ type: "WENT_DOWN", character: c, cause });
  let next = withPlayer(state, c, { ...p, down: true, lastStand: false, hand: [] });
  for (const card of p.hand) next = exhaust(next, c, card, "hand", events);
  return next;
}

/**
 * §8: `Exhaust X cards from your deck` — a loss you did not choose. Off the top,
 * face up, no choices.
 *
 * §9: a card that would be moved from the top of an empty deck puts that
 * character Down. Last stand is a separate thing and activates later, as the
 * last step of the phase (see `activateLastStand`).
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
    const p = playerOf(next, c);
    if (p.down) return next; // A Down character takes no punishments (§9).
    const card = p.deck[0];
    if (!card) return goDown(next, c, cause, events);
    next = withPlayer(next, c, { ...p, deck: p.deck.slice(1) });
    next = exhaust(next, c, card, "deck", events);
  }
  return next;
}

/** §8: `Exhaust X cards from your hand` — a cost you chose. */
export function exhaustFromHand(
  state: GameState,
  c: Character,
  cards: readonly Card[],
  events: DomainEvent[],
): GameState {
  const ids = new Set(cards.map((x) => x.id));
  const p = playerOf(state, c);
  let next = withPlayer(state, c, { ...p, hand: p.hand.filter((x) => !ids.has(x.id)) });
  for (const card of cards) next = exhaust(next, c, card, "hand", events);
  return next;
}

/* ----------------------------------------------------------------- drawing */

/**
 * §5: draw one card. A full hand does not excuse the minimum — the card is put
 * straight into the exhaust pile instead of the hand, so a full hand costs you a
 * card a turn rather than saving you one.
 *
 * `ignoreHandCap` is for a card that says so in its own text.
 */
export function drawOne(
  state: GameState,
  c: Character,
  events: DomainEvent[],
  ignoreHandCap = false,
): GameState {
  const p = playerOf(state, c);
  if (p.down) return state;
  const card = p.deck[0];
  if (!card) return goDown(state, c, "drew from an empty deck", events);

  const rest = { ...p, deck: p.deck.slice(1), drewThisTurn: p.drewThisTurn + 1 };
  if (!ignoreHandCap && p.hand.length >= HAND_CAP) {
    events.push({ type: "DRAW_BURNED", character: c, card });
    return exhaust(withPlayer(state, c, rest), c, card, "deck", events);
  }
  events.push({ type: "CARD_DRAWN", character: c, card });
  return withPlayer(state, c, { ...rest, hand: [...p.hand, card] });
}

/**
 * §9: no card may be put into a Down character's hand — you cannot park Stuff on
 * a partner who is out. Stuff pushed into a hand by a room ignores the hand cap
 * entirely (§5), and so does anything else that moves a card to a hand.
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

/** §10: to Scrap is to move a card to the Scrapyard, gone for the run. */
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

/** Cards lifted back out of an exhaust pile, for a card that says it can. */
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
 * §9: no card may be put into a Down character's hand, so a card whose owner is
 * out stays in the play zone and Exhausts with everything else.
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

/** Overcharged Battery: this character's next play costs nothing. */
export const grantFreePlay = (state: GameState, c: Character): GameState =>
  c === "Red"
    ? {
        ...state,
        thisTurn: {
          ...state.thisTurn,
          freePlays: { ...state.thisTurn.freePlays, Red: state.thisTurn.freePlays.Red + 1 },
        },
      }
    : {
        ...state,
        thisTurn: {
          ...state.thisTurn,
          freePlays: { ...state.thisTurn.freePlays, Gray: state.thisTurn.freePlays.Gray + 1 },
        },
      };

/** Put a card on top of a deck. Nothing shuffles during a floor, so it is next (§6). */
export function topDeck(state: GameState, c: Character, card: Card): GameState {
  const p = playerOf(state, c);
  return withPlayer(state, c, { ...p, deck: [card, ...p.deck] });
}

/* -------------------------------------------------------------------- Stuff */

/**
 * §6: what you earn is drawn blind from the Good Stuff pool and goes to that
 * character's hand. A Down character earns nothing.
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
    // See open-questions.md #6.
    if (!card) return next;
    next = { ...next, seed, pools: { ...next.pools, goodStuff: rest } };
    events.push({ type: "STUFF_TAKEN", character: c, card });
    next = moveToHand(next, c, card, events);
  }
  return next;
}

/** §7: Bad Stuff is dealt to you, as a room's printed punishment. */
export function dealBadStuff(
  state: GameState,
  c: Character,
  events: DomainEvent[],
): GameState {
  if (playerOf(state, c).down) return state; // takes no punishments (§9)
  const [card, rest, seed] = drawFromPool(state.pools.badStuff, state.seed);
  if (!card) return state;
  const next = { ...state, seed, pools: { ...state.pools, badStuff: rest } };
  events.push({ type: "STUFF_TAKEN", character: c, card });
  return moveToHand(next, c, card, events);
}

function drawFromPool(
  pool: readonly Card[],
  seed: number,
): readonly [Card | null, readonly Card[], number] {
  if (pool.length === 0) return [null, pool, seed];
  const [shuffled, next] = shuffle(pool, seed);
  return [shuffled[0] as Card, shuffled.slice(1), next];
}

/* --------------------------------------------------------------- last stand */

/**
 * §9: last stand activates as the last step of the phase that emptied the deck,
 * so whatever else that phase does resolves first. Called at the end of every
 * phase that can touch a deck.
 */
export function activateLastStand(state: GameState, events: DomainEvent[]): GameState {
  let next = state;
  for (const c of CHARACTERS) {
    const p = playerOf(next, c);
    if (p.down || p.lastStand || p.deck.length > 0) continue;
    events.push({ type: "LAST_STAND", character: c });
    next = withPlayer(next, c, { ...p, lastStand: true });
  }
  return next;
}

/** Mark a once-per-turn trigger as spent, so an effect that feeds itself fires once. */
export const hasFired = (state: GameState, key: string): boolean =>
  state.thisTurn.fired.includes(key);

export const markFired = (state: GameState, key: string): GameState => ({
  ...state,
  thisTurn: { ...state.thisTurn, fired: [...state.thisTurn.fired, key] },
});
