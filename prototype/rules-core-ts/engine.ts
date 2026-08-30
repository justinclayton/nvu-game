/* North vs Up — the rules core.
 *
 * PROTOTYPE. Throwaway code answering one question: does the state model in
 * north-vs-up-rfc.md hold up when it has to run the ratified rules?
 * See README.md for the answer, the divergences, and the open questions.
 *
 * One pure function: execute(state, command) -> [state, events]. No IO, no
 * mutation, no clock, no Math.random. The seed is part of the state, so a run
 * replays exactly from its seed and its command list.
 *
 * Rules transcribed from design/rulebook-draft.md and, where the two disagree,
 * design/core-design/issues/24-the-scrap-mechanic.md. Section numbers in the
 * comments below point at the rulebook.
 */

import { shuffle } from "./rng.ts";
import { CONDITIONALS, canPayCost, copies, type Content, type RawCard, buildContent } from "./cards.ts";
import {
  RuleError,
  type AscendChoice,
  type Card,
  type Character,
  type CharacterStatus,
  type Command,
  type DomainEvent,
  type GameState,
  type PlayerState,
  type Room,
  type Threshold,
} from "./types.ts";

export const HAND_CAP = 5;
export const LAST_STAND_PRICE = 2;
export const TOP_FLOOR = 10;

/* ------------------------------------------------------------------ reading */

export function statusOf(p: PlayerState): CharacterStatus {
  if (p.down) return "Down";
  return p.deck.length === 0 ? "LastStand" : "Standing";
}

export function playerOf(s: GameState, c: Character): PlayerState {
  return c === "Red" ? s.red : s.gray;
}

function withPlayer(s: GameState, c: Character, p: PlayerState): GameState {
  return c === "Red" ? { ...s, red: p } : { ...s, gray: p };
}

export const OTHER = (c: Character): Character => (c === "Red" ? "Gray" : "Red");

/**
 * Section 3 and 5: played cards form one shared pool across both characters,
 * and conditional stats are recalculated every time the pool is read.
 * `side` narrows the pool to one character's own side, which is the only thing
 * a Stuff room ever measures (section 6).
 */
export function pool(s: GameState, side?: Character): { power: number; scramble: number } {
  const ctx = {
    redPlayed: s.playZone.filter((p) => p.owner === "Red").length,
    grayPlayed: s.playZone.filter((p) => p.owner === "Gray").length,
    badStuffPlayed: s.playZone.filter((p) => p.card.kind === "bad_stuff").length,
    handOf: (c: Character) => playerOf(s, c).hand,
  };
  let power = 0;
  let scramble = 0;
  for (const { owner, card } of s.playZone) {
    if (side && owner !== side) continue;
    const fn = CONDITIONALS[card.name];
    const stats = fn ? fn(ctx) : { power: card.power, scramble: card.scramble };
    power += stats.power;
    scramble += stats.scramble;
  }
  // Section 7: Bad Stuff contributes no stats, whatever else it does.
  return { power, scramble };
}

/* ------------------------------------------------------- moving cards around */

/**
 * Section 7 note in design/cards.yaml: when any Stuff card would be Exhausted
 * it is Scrapped instead. Permanent Stuff (bought with the ascension Scrap tax)
 * is the exception — see OPEN QUESTION `permanent-stuff-exhaust` in README.md.
 */
function exhaust(s: GameState, c: Character, card: Card, ev: DomainEvent[]): GameState {
  const p = playerOf(s, c);
  if (card.kind !== "player" && !card.permanent) {
    ev.push({ type: "CARD_SCRAPPED", character: c, card });
    return { ...s, scrapyard: [...s.scrapyard, card] };
  }
  ev.push({ type: "CARD_EXHAUSTED", character: c, card });
  return withPlayer(s, c, { ...p, exhaust: [...p.exhaust, card] });
}

/** Section 9: going Down discards the hand. That is how you tell it from last stand. */
function goDown(s: GameState, c: Character, cause: string, ev: DomainEvent[]): GameState {
  const p = playerOf(s, c);
  if (p.down) return s;
  ev.push({ type: "WENT_DOWN", character: c, cause });
  return withPlayer(s, c, { ...p, down: true, hand: [] });
}

/**
 * Section 8: `Exhaust X cards from your deck` — off the top, no choices.
 * Section 9: exhausting from an empty deck is what puts a character Down.
 */
function exhaustFromDeck(
  s: GameState,
  c: Character,
  n: number,
  cause: string,
  ev: DomainEvent[],
): GameState {
  let state = s;
  for (let i = 0; i < n; i++) {
    const p = playerOf(state, c);
    if (p.down) return state;
    if (p.deck.length === 0) return goDown(state, c, cause, ev);
    const card = p.deck[0];
    state = withPlayer(state, c, { ...p, deck: p.deck.slice(1) });
    state = exhaust(state, c, card, ev);
    if (playerOf(state, c).deck.length === 0) {
      ev.push({ type: "LAST_STAND", character: c });
    }
  }
  return state;
}

/* ---------------------------------------------------------------- the reducer */

export function execute(state: GameState, command: Command): [GameState, DomainEvent[]] {
  const ev: DomainEvent[] = [];
  switch (command.type) {
    case "FLIP_ROOM":
      return flipRoom(state, ev);
    case "DRAW":
      return draw(state, command.character, ev);
    case "END_DRAW":
      return endDraw(state, ev);
    case "PLAY_CARD":
      return playCard(state, command.character, command.cardId, command.payWith, ev);
    case "END_PLAY":
      return endPlay(state, command.fleeTarget, ev);
    case "ASCEND":
      return ascend(state, command.red, command.gray, ev);
    default:
      return [state, ev];
  }
}

/* Phase 1 — Flip (section 5) */

function flipRoom(s: GameState, ev: DomainEvent[]): [GameState, DomainEvent[]] {
  if (s.phase !== "Flip") throw new RuleError(`Cannot flip during the ${s.phase} phase.`);

  // Section 9: the run ends when both characters are Down, checked at the start
  // of a turn. If both are Down when a turn begins there is no flip at all.
  if (s.red.down && s.gray.down) {
    ev.push({ type: "GAME_OVER", outcome: "Defeat" });
    return [{ ...s, phase: "GameOver", outcome: "Defeat" }, ev];
  }

  let state = s;
  if (state.floorDeck.length === 0) {
    // Cleanup already reshuffles Fled; reaching here means the floor is empty
    // of everything, which the exemplar floor cannot do while the Enemy lives.
    throw new RuleError("The floor deck and the Fled pile are both empty.");
  }

  const room = state.floorDeck[0];
  ev.push({ type: "ROOM_FLIPPED", room });
  return [
    {
      ...state,
      turn: state.turn + 1,
      floorDeck: state.floorDeck.slice(1),
      activeRoom: room,
      phase: "Draw",
      red: { ...state.red, drewThisTurn: 0 },
      gray: { ...state.gray, drewThisTurn: 0 },
    },
    ev,
  ];
}

/* Phase 2 — Draw (section 5) */

function draw(s: GameState, c: Character, ev: DomainEvent[]): [GameState, DomainEvent[]] {
  if (s.phase !== "Draw") throw new RuleError(`Cannot draw during the ${s.phase} phase.`);
  const p = playerOf(s, c);
  if (p.down) throw new RuleError(`${c} is Down and is skipped in the draw phase.`);

  // Deadweight Grip: a printed cap on how deep this character may draw.
  const gripCap = p.hand.some((h) => /may not draw more than 2 cards on a turn/i.test(h.text)) ? 2 : null;
  const slimeCap = p.hand.some((h) => /may not draw more than 1 card during your draw phase/i.test(h.text))
    ? 1
    : null;
  const cap = Math.min(gripCap ?? Infinity, slimeCap ?? Infinity);
  if (p.drewThisTurn >= cap) {
    throw new RuleError(`${c} may not draw more than ${cap} cards this turn.`);
  }

  if (p.deck.length === 0) {
    // OPEN QUESTION: last stand vs. the compulsory draw. The rules say you must
    // draw at least 1 and that an empty deck is last stand, and never say what
    // the two do to each other. Treated here as a no-op that still satisfies
    // the minimum. See README.md `last-stand-minimum-draw`.
    ev.push({
      type: "OPEN_QUESTION",
      id: "last-stand-minimum-draw",
      note: `${c} is in last stand and cannot draw; the compulsory draw is treated as satisfied.`,
    });
    return [withPlayer(s, c, { ...p, drewThisTurn: p.drewThisTurn + 1 }), ev];
  }

  const card = p.deck[0];
  const rest = p.deck.slice(1);

  if (p.hand.length >= HAND_CAP) {
    // Section 5: a full hand does not excuse the minimum. Draw the card anyway
    // and put it straight into the exhaust pile. A full hand costs you a card.
    ev.push({ type: "DRAW_BURNED", character: c, card });
    let state = withPlayer(s, c, { ...p, deck: rest, drewThisTurn: p.drewThisTurn + 1 });
    state = exhaust(state, c, card, ev);
    if (rest.length === 0) ev.push({ type: "LAST_STAND", character: c });
    return [state, ev];
  }

  ev.push({ type: "CARD_DRAWN", character: c, card });
  if (rest.length === 0) ev.push({ type: "LAST_STAND", character: c });
  return [
    withPlayer(s, c, {
      ...p,
      deck: rest,
      hand: [...p.hand, card],
      drewThisTurn: p.drewThisTurn + 1,
    }),
    ev,
  ];
}

function endDraw(s: GameState, ev: DomainEvent[]): [GameState, DomainEvent[]] {
  if (s.phase !== "Draw") throw new RuleError(`Not in the draw phase.`);
  // Section 5: you must draw at least 1. There is no sitting a turn out.
  for (const c of ["Red", "Gray"] as const) {
    const p = playerOf(s, c);
    if (p.down || p.drewThisTurn >= 1) continue;
    if (statusOf(p) === "LastStand") {
      // OPEN QUESTION `last-stand-minimum-draw`: an empty deck cannot satisfy a
      // compulsory draw, and the rules never say which of the two gives way.
      // Excused here, because the alternative is a state no legal move leaves.
      ev.push({
        type: "OPEN_QUESTION",
        id: "last-stand-minimum-draw",
        note: `${c} is in last stand with nothing to draw; the compulsory draw is excused.`,
      });
      continue;
    }
    throw new RuleError(`${c} must draw at least 1 card.`);
  }
  // Section 5: once anyone has begun playing cards, nobody may draw again.
  return [{ ...s, phase: "Play" }, ev];
}

/* Phase 3 — Play (section 5) */

function playCard(
  s: GameState,
  c: Character,
  cardId: string,
  payWith: readonly string[],
  ev: DomainEvent[],
): [GameState, DomainEvent[]] {
  if (s.phase !== "Play") throw new RuleError(`Cannot play during the ${s.phase} phase.`);
  const p = playerOf(s, c);
  if (p.down) throw new RuleError(`${c} is Down and is skipped in the play phase.`);

  const card = p.hand.find((x) => x.id === cardId);
  if (!card) throw new RuleError(`${cardId} is not in ${c}'s hand.`);

  // Section 9: while in last stand, every card in that hand may be played at no
  // cost. Their partner still pays normally.
  const free = statusOf(p) === "LastStand";
  const cost = free ? 0 : card.cost;

  if (payWith.length !== cost) {
    throw new RuleError(`${card.name} costs ${cost}; ${payWith.length} cards offered.`);
  }
  const payment: Card[] = [];
  for (const id of payWith) {
    if (id === cardId) throw new RuleError(`A card cannot pay for itself.`);
    const pay = p.hand.find((x) => x.id === id);
    if (!pay) throw new RuleError(`${id} is not in ${c}'s hand.`);
    if (payment.some((x) => x.id === id)) throw new RuleError(`${id} offered twice.`);
    if (!canPayCost(pay)) throw new RuleError(`${pay.name} may not be Exhausted to pay a cost.`);
    payment.push(pay);
  }

  const spentIds = new Set([cardId, ...payWith]);
  let state = withPlayer(s, c, { ...p, hand: p.hand.filter((x) => !spentIds.has(x.id)) });

  // Section 5: you pay in other cards from your own hand. Red never pays for Gray.
  for (const pay of payment) state = exhaust(state, c, pay, ev);
  if (payment.length > 0) ev.push({ type: "COST_PAID", character: c, cards: payment });

  state = { ...state, playZone: [...state.playZone, { owner: c, card }] };
  ev.push({ type: "CARD_PLAYED", character: c, card });

  // Section 5: the instant the pool meets a room's threshold, that outcome
  // happens — except on a Hazard, which is settled when play is declared over.
  return evaluateInstant(state, ev);
}

/** Enemy rooms only. Hazard and Stuff rooms settle at the end of the play phase. */
function evaluateInstant(s: GameState, ev: DomainEvent[]): [GameState, DomainEvent[]] {
  const room = s.activeRoom;
  if (!room || room.kind !== "enemy") return [s, ev];
  const met = bestMet(s, room);
  if (!met) return [s, ev];
  ev.push({ type: "THRESHOLD_MET", room, threshold: met });
  let state: GameState = { ...s, ...clearRoom(s, room, ev) };
  if (met.reward) state = payReward(state, ev);
  return [state, ev];
}

/** The highest threshold line the shared pool currently meets, or null. */
function bestMet(s: GameState, room: Room): Threshold | null {
  const p = pool(s);
  const met = room.thresholds.filter((t) => (t.stat === "Power" ? p.power : p.scramble) >= t.value);
  if (met.length === 0) return null;
  return met.reduce((a, b) => (b.value > a.value ? b : a));
}

/** Move the active room to the Cleared heap. Nobody ever asks that heap a question. */
function clearRoom(s: GameState, room: Room, ev: DomainEvent[]): Partial<GameState> {
  ev.push({ type: "ROOM_CLEARED", room });
  return { activeRoom: null, cleared: [...s.cleared, room] };
}

/* Phase 4 — Cleanup (section 5) */

function endPlay(
  s: GameState,
  fleeTarget: Character | undefined,
  ev: DomainEvent[],
): [GameState, DomainEvent[]] {
  if (s.phase !== "Play") throw new RuleError(`Not in the play phase.`);
  let state = s;
  const room = state.activeRoom;

  // A Hazard's two thresholds are settled now, not the moment the lower is met.
  if (room && room.kind === "hazard") {
    const met = bestMet(state, room);
    if (met) {
      ev.push({ type: "THRESHOLD_MET", room, threshold: met });
      state = { ...state, ...clearRoom(state, room, ev) };
      if (met.reward) state = payReward(state, ev);
    }
  }

  // A Stuff room is measured per character, on their own side of the play zone,
  // and is Cleared either way. It has no Flee line and never punishes you.
  if (room && room.kind === "stuff") {
    for (const c of ["Red", "Gray"] as const) {
      const side = pool(state, c);
      const met = room.thresholds
        .filter((t) => t.recipient === c)
        .filter((t) => (t.stat === "Power" ? side.power : side.scramble) >= t.value);
      if (met.length === 0) continue;
      const best = met.reduce((a, b) => ((b.stuffCount ?? 0) > (a.stuffCount ?? 0) ? b : a));
      ev.push({ type: "THRESHOLD_MET", room, threshold: best });
      state = takeGoodStuff(state, c, best.stuffCount ?? 1, ev);
    }
    state = { ...state, ...clearRoom(state, room, ev) };
  }

  // Who was in last stand at the moment the room resolved? That is what decides
  // whether they get the shuffle-back, and it has to be read before the flee.
  const lastStandAtClear = {
    Red: state.activeRoom === null && statusOf(state.red) === "LastStand",
    Gray: state.activeRoom === null && statusOf(state.gray) === "LastStand",
  };

  // 1. If the room is still in the active room zone, you failed it.
  if (state.activeRoom) {
    state = applyFlee(state, state.activeRoom, fleeTarget, ev);
  }

  // 3. Exhaust both hands and the entire play zone. `Hold` cards survive.
  state = cleanupPiles(state, lastStandAtClear, ev);

  // 4. If the floor draw pile is empty, shuffle the Fled pile back into it.
  if (state.floorDeck.length === 0 && state.fled.length > 0) {
    const [deck, seed] = shuffle(state.fled, state.seed);
    state = { ...state, floorDeck: deck, fled: [], seed };
  }

  // Section 6: clearing the Enemy room ends the floor.
  const killedEnemy = state.cleared.some((r) => r.kind === "enemy");
  if (killedEnemy) {
    ev.push({ type: "FLOOR_CLEARED", floor: state.floor });
    if (state.floor >= TOP_FLOOR) {
      ev.push({ type: "GAME_OVER", outcome: "Victory" });
      return [{ ...state, phase: "GameOver", outcome: "Victory" }, ev];
    }
    return [offerRewards(state), ev];
  }

  return [{ ...state, playZone: [], phase: "Flip" }, ev];
}

/** Section 6: a Stuff room pays blind from the Good Stuff pool, into the hand. */
function takeGoodStuff(s: GameState, c: Character, n: number, ev: DomainEvent[]): GameState {
  let state = s;
  for (let i = 0; i < n; i++) {
    const p = playerOf(state, c);
    if (p.down) return state; // A Down character earns nothing.
    if (state.pools.goodStuff.length === 0) return state;
    const [shuffled, seed] = shuffle(state.pools.goodStuff, state.seed);
    const card = shuffled[0];
    ev.push({ type: "STUFF_TAKEN", character: c, card });
    // Stuff pushed into your hand by a room ignores the hand cap entirely.
    state = withPlayer(
      { ...state, seed, pools: { ...state.pools, goodStuff: shuffled.slice(1) } },
      c,
      { ...p, hand: [...p.hand, card] },
    );
  }
  return state;
}

/**
 * The reward tier on a Hazard (and on one Enemy room): reveal the top card of a
 * reward pool and take it on top of your deck, or skip it.
 *
 * OPEN QUESTION `hazard-reward-pool`: the rulebook does not say whose pool is
 * read or whose deck it tops, and does not say where a skipped card goes.
 * Modelled here as always taken, by Red, because a prototype has to do
 * something. See README.md.
 */
function payReward(s: GameState, ev: DomainEvent[]): GameState {
  ev.push({
    type: "OPEN_QUESTION",
    id: "hazard-reward-pool",
    note: "Which pool the reveal reads and whose deck it tops is unruled (ticket 09); Red is assumed.",
  });
  if (s.pools.red.length === 0) return s;
  const card = s.pools.red[0];
  ev.push({ type: "REWARD_TAKEN", character: "Red", card });
  // Nothing shuffles during a floor, so it is the very next card they draw.
  return withPlayer({ ...s, pools: { ...s.pools, red: s.pools.red.slice(1) } }, "Red", {
    ...s.red,
    deck: [card, ...s.red.deck],
  });
}

/**
 * Section 5: apply the Flee line, then put the card in the Fled pile. Where the
 * line says 1 character, the team chooses which one and they take all of it —
 * there is no splitting. With a partner Down, every one of them falls on the
 * survivor (section 9).
 */
function applyFlee(
  s: GameState,
  room: Room,
  fleeTarget: Character | undefined,
  ev: DomainEvent[],
): GameState {
  let state: GameState = { ...s, activeRoom: null, fled: [...s.fled, room] };
  const flee = room.flee;
  if (!flee) {
    ev.push({ type: "ROOM_FLED", room, target: "both" });
    return state;
  }

  const survivors = (["Red", "Gray"] as const).filter((c) => !playerOf(state, c).down);
  const targets: Character[] =
    flee.who === "both"
      ? [...survivors]
      : (() => {
          const chosen = fleeTarget ?? pickFleeTarget(state);
          return survivors.includes(chosen) ? [chosen] : survivors;
        })();

  ev.push({ type: "ROOM_FLED", room, target: flee.who === "both" ? "both" : (targets[0] ?? "both") });

  for (const c of targets) {
    state = exhaustFromDeck(state, c, flee.deckExhaust, `fled ${room.name}`, ev);
  }
  if (flee.badStuffToOne && targets.length > 0) {
    state = dealBadStuff(state, targets[0], ev);
  }

  // Section 9: the team Fleeing while a character is in last stand puts them Down.
  for (const c of ["Red", "Gray"] as const) {
    if (statusOf(playerOf(state, c)) === "LastStand") {
      state = goDown(state, c, `fled ${room.name} while in last stand`, ev);
    }
  }
  return state;
}

/** Default when the team gives no choice: the one who can best afford it. */
function pickFleeTarget(s: GameState): Character {
  return s.red.deck.length >= s.gray.deck.length ? "Red" : "Gray";
}

function dealBadStuff(s: GameState, c: Character, ev: DomainEvent[]): GameState {
  const p = playerOf(s, c);
  if (p.down || s.pools.badStuff.length === 0) return s;
  const [shuffled, seed] = shuffle(s.pools.badStuff, s.seed);
  const card = shuffled[0];
  ev.push({ type: "STUFF_TAKEN", character: c, card });
  return withPlayer({ ...s, seed, pools: { ...s.pools, badStuff: shuffled.slice(1) } }, c, {
    ...p,
    hand: [...p.hand, card],
  });
}

/**
 * Cleanup step 3, and the last-stand escape from section 9.
 *
 * Normally hand and play zone both go to the exhaust pile. But if the room was
 * Cleared while a character was in last stand, those same cards are shuffled
 * back into their deck instead — minus 2, exhausted as the price of getting
 * out. The exhaust pile is not involved and `Hold` cards take no part.
 */
function cleanupPiles(
  s: GameState,
  lastStandAtClear: Record<Character, boolean>,
  ev: DomainEvent[],
): GameState {
  let state = s;
  for (const c of ["Red", "Gray"] as const) {
    const p = playerOf(state, c);
    const played = state.playZone.filter((x) => x.owner === c).map((x) => x.card);
    const held = p.hand.filter((x) => x.hold);
    const dropped = p.hand.filter((x) => !x.hold);

    state = withPlayer(state, c, { ...p, hand: held });

    if (lastStandAtClear[c]) {
      const recovering = [...played, ...dropped];
      // Stuff is Scrapped rather than exhausted, so it cannot come back either.
      const stuff = recovering.filter((x) => x.kind !== "player" && !x.permanent);
      const own = recovering.filter((x) => x.kind === "player" || x.permanent);
      for (const card of stuff) state = exhaust(state, c, card, ev);

      const price = own.slice(0, LAST_STAND_PRICE);
      const back = own.slice(LAST_STAND_PRICE);
      for (const card of price) state = exhaust(state, c, card, ev);
      const [deck, seed] = shuffle([...playerOf(state, c).deck, ...back], state.seed);
      state = { ...state, seed };
      state = withPlayer(state, c, { ...playerOf(state, c), deck });
      ev.push({ type: "LAST_STAND_ESCAPED", character: c, price });
      continue;
    }

    for (const card of [...played, ...dropped]) state = exhaust(state, c, card, ev);
  }
  return { ...state, playZone: [] };
}

/* Section 10 — Ascending */

function offerRewards(s: GameState): GameState {
  return {
    ...s,
    phase: "Ascend",
    playZone: [],
    offer: { red: s.pools.red.slice(0, 3), gray: s.pools.gray.slice(0, 3) },
  };
}

function ascend(
  s: GameState,
  red: AscendChoice,
  gray: AscendChoice,
  ev: DomainEvent[],
): [GameState, DomainEvent[]] {
  if (s.phase !== "Ascend") throw new RuleError(`The floor is not cleared yet.`);
  let state = s;
  state = ascendOne(state, "Red", red, ev);
  state = ascendOne(state, "Gray", gray, ev);

  const nextFloor = state.floor + 1;
  state = buildFloor({ ...state, floor: nextFloor, offer: null }, ev);
  return [{ ...state, phase: "Flip", activeRoom: null, cleared: [], fled: [], playZone: [] }, ev];
}

function ascendOne(s: GameState, c: Character, choice: AscendChoice, ev: DomainEvent[]): GameState {
  let state = s;
  const p = playerOf(state, c);

  // 1. Exhaust piles are picked up. Stuff in them goes back to its pool; the
  //    rest shuffles into the deck. (Ticket 24, step 1.) A floor cleared is a
  //    full heal, including for a character who was Down.
  const returning = p.exhaust.filter((x) => x.kind === "player" || x.permanent);
  const spentStuff = p.exhaust.filter((x) => x.kind !== "player" && !x.permanent);

  // 2. Stuff still in hand is shuffled into the deck as next floor's stamina.
  const heldStuff = p.hand.filter((x) => x.kind !== "player");
  const heldOwn = p.hand.filter((x) => x.kind === "player");
  if (heldOwn.length > 0) {
    ev.push({
      type: "OPEN_QUESTION",
      id: "own-cards-left-in-hand",
      note: `Ascending does not say what happens to ${c}'s own ${heldOwn.length} held card(s); shuffled back in here.`,
    });
  }

  let deck = [...p.deck, ...returning, ...heldStuff, ...heldOwn];
  let scrapyard = [...state.scrapyard];
  let goodStuff = [...state.pools.goodStuff, ...spentStuff.filter((x) => x.kind === "good_stuff")];
  let badStuff = [...state.pools.badStuff, ...spentStuff.filter((x) => x.kind === "bad_stuff")];

  // 3. The Scrap tax: keep one piece of Stuff for the rest of the run, and pay
  //    for it with one starter card from this deck, Scrapped for good.
  if (choice.keepStuffId && choice.scrapId) {
    const keep = deck.find((x) => x.id === choice.keepStuffId && x.kind !== "player");
    const pay = deck.find((x) => x.id === choice.scrapId && x.starter);
    if (!keep) throw new RuleError(`${choice.keepStuffId} is not Stuff in ${c}'s deck.`);
    if (!pay) throw new RuleError(`${choice.scrapId} is not a starter card in ${c}'s deck.`);
    deck = deck.filter((x) => x.id !== pay.id).map((x) => (x.id === keep.id ? { ...x, permanent: true } : x));
    scrapyard.push(pay);
    ev.push({ type: "CARD_SCRAPPED", character: c, card: pay });
  } else if (choice.keepStuffId || choice.scrapId) {
    throw new RuleError(`The Scrap tax is both halves or neither.`);
  }

  // 4. The ascension reward: three from your own pool, take one or decline.
  const poolKey = c === "Red" ? "red" : "gray";
  let ownPool = [...state.pools[poolKey]];
  const offered = ownPool.slice(0, 3);
  const taken = choice.takeRewardId ? offered.find((x) => x.id === choice.takeRewardId) : undefined;
  if (choice.takeRewardId && !taken) throw new RuleError(`${choice.takeRewardId} was not offered to ${c}.`);
  ownPool = ownPool.slice(offered.length);
  if (taken) {
    ev.push({ type: "REWARD_TAKEN", character: c, card: taken });
    deck.push(taken);
    // A declined card goes to the bottom of its pool; the two not taken go back too.
    ownPool = [...ownPool, ...offered.filter((x) => x.id !== taken.id)];
  } else {
    ev.push({ type: "REWARD_DECLINED", character: c });
    ownPool = [...ownPool, ...offered];
  }

  const [shuffled, seed] = shuffle(deck, state.seed);
  state = {
    ...state,
    seed,
    scrapyard,
    pools: { ...state.pools, goodStuff, badStuff, [poolKey]: ownPool } as GameState["pools"],
  };
  return withPlayer(state, c, {
    deck: shuffled,
    hand: [],
    exhaust: [],
    down: false,
    drewThisTurn: 0,
  });
}

/* Section 4 — Setting up a floor */

export function buildFloor(s: GameState, ev: DomainEvent[], content?: Content): GameState {
  const c = content ?? CONTENT;
  const stuffCount = Math.max(0, TOP_FLOOR - s.floor);
  const rooms: Room[] = [];
  let seed = s.seed;

  const pickOne = (from: readonly Room[], n: number, tag: string) => {
    for (let i = 0; i < n; i++) {
      const [shuffled, ns] = shuffle(from, seed);
      seed = ns;
      rooms.push({ ...shuffled[0], id: `${shuffled[0].name}#f${s.floor}${tag}${i}` });
    }
  };
  pickOne(c.enemyRooms, 1, "e");
  pickOne(c.hazardRooms, 3, "h");
  pickOne(c.stuffRooms, stuffCount, "s");

  const [floorDeck, ns] = shuffle(rooms, seed);
  ev.push({ type: "FLOOR_BUILT", floor: s.floor, rooms: floorDeck.length });
  return { ...s, seed: ns, floorDeck, cleared: [], fled: [] };
}

/* ------------------------------------------------------------------- content */

/** Set once by initContent(); the generated card list is data, not a dependency. */
export let CONTENT: Content;

export function initContent(raw: RawCard[]): Content {
  CONTENT = buildContent(raw);
  return CONTENT;
}

export function createInitialState(seed: number, raw?: RawCard[]): [GameState, DomainEvent[]] {
  const content = raw ? initContent(raw) : CONTENT;
  if (!content) throw new Error("Call initContent(cards) before createInitialState().");
  const ev: DomainEvent[] = [];

  const [redDeck, s1] = shuffle(content.redStarters, seed);
  const [grayDeck, s2] = shuffle(content.grayStarters, s1);
  const [redPool, s3] = shuffle(content.redRewards, s2);
  const [grayPool, s4] = shuffle(content.grayRewards, s3);

  const empty = (deck: readonly Card[]): PlayerState => ({
    deck,
    hand: [],
    exhaust: [],
    down: false,
    drewThisTurn: 0,
  });

  const base: GameState = {
    seed: s4,
    floor: 1,
    turn: 0,
    phase: "Flip",
    floorDeck: [],
    activeRoom: null,
    cleared: [],
    fled: [],
    red: empty(redDeck),
    gray: empty(grayDeck),
    playZone: [],
    scrapyard: [],
    pools: {
      red: redPool,
      gray: grayPool,
      goodStuff: content.goodStuff,
      badStuff: content.badStuff,
    },
    offer: null,
    outcome: null,
  };

  return [buildFloor(base, ev, content), ev];
}

export { copies };
