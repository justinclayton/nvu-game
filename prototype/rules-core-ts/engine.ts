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
 * Rules transcribed from design/rulebook-draft.md, which is the authority.
 * Section numbers in the comments below point at the rulebook.
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
  return p.lastStand ? "LastStand" : "Standing";
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
 * Section 7: spent Stuff is exhausted like anything else, to the pile of
 * whoever spent it. The Scrapyard only comes into it at ascension.
 */
function exhaust(s: GameState, c: Character, card: Card, ev: DomainEvent[]): GameState {
  const p = playerOf(s, c);
  ev.push({ type: "CARD_EXHAUSTED", character: c, card });
  return withPlayer(s, c, { ...p, exhaust: [...p.exhaust, card] });
}

/** Section 9: going Down empties the hand into the exhaust pile. */
function goDown(s: GameState, c: Character, cause: string, ev: DomainEvent[]): GameState {
  const p = playerOf(s, c);
  if (p.down) return s;
  ev.push({ type: "WENT_DOWN", character: c, cause });
  return withPlayer(s, c, {
    ...p,
    down: true,
    lastStand: false,
    hand: [],
    exhaust: [...p.exhaust, ...p.hand],
  });
}

/**
 * Section 8: `Exhaust X cards from your deck` — off the top, no choices.
 * Section 9: a card that would be moved from an empty deck puts the character
 * Down. Last stand itself activates later, at the end of the phase (section 9).
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
  }
  return state;
}

/**
 * Section 9: last stand activates as the last step of the phase that emptied
 * the deck. Called at the end of each phase that can touch a deck.
 */
function activateLastStand(s: GameState, ev: DomainEvent[]): GameState {
  let state = s;
  for (const c of ["Red", "Gray"] as const) {
    const p = playerOf(state, c);
    if (p.down || p.lastStand || p.deck.length > 0) continue;
    ev.push({ type: "LAST_STAND", character: c });
    state = withPlayer(state, c, { ...p, lastStand: true });
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
      return endPlay(state, command.fleeTarget, command.rewardTarget, ev);
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
    // of everything, which a normal floor cannot do while the Enemy lives.
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

  // Section 9: a character in last stand does not draw — there is nothing left
  // to draw, and the mandatory draw does not apply.
  if (p.lastStand) throw new RuleError(`${c} is in last stand and does not draw.`);
  if (p.deck.length === 0) throw new RuleError(`${c} has no deck to draw from.`);

  const card = p.deck[0];
  const rest = p.deck.slice(1);

  if (p.hand.length >= HAND_CAP) {
    // Section 5: a full hand does not excuse the minimum. Draw the card anyway
    // and put it straight into the exhaust pile. A full hand costs you a card.
    ev.push({ type: "DRAW_BURNED", character: c, card });
    let state = withPlayer(s, c, { ...p, deck: rest, drewThisTurn: p.drewThisTurn + 1 });
    state = exhaust(state, c, card, ev);
    return [state, ev];
  }

  ev.push({ type: "CARD_DRAWN", character: c, card });
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
  // Section 5: you must draw at least 1. There is no sitting a turn out. The
  // one exception is a character in last stand, who does not draw at all.
  for (const c of ["Red", "Gray"] as const) {
    const p = playerOf(s, c);
    if (p.down || p.lastStand || p.drewThisTurn >= 1) continue;
    throw new RuleError(`${c} must draw at least 1 card.`);
  }
  // Section 9: a deck emptied by drawing puts its character in last stand as
  // the last step of the draw phase.
  const state = activateLastStand(s, ev);
  return [{ ...state, phase: "Play" }, ev];
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
  const free = p.lastStand;
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

  // Section 5: nothing resolves while you play. The room is checked once, at
  // the end of the play phase.
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
  rewardTarget: Character | undefined,
  ev: DomainEvent[],
): [GameState, DomainEvent[]] {
  if (s.phase !== "Play") throw new RuleError(`Not in the play phase.`);
  let state = s;
  const room = state.activeRoom;

  // Section 5: when the play phase ends the room is checked once. If any
  // challenge's threshold is met the room is Cleared and every met challenge's
  // text resolves; if none is, the characters Flee.
  if (room && (room.kind === "enemy" || room.kind === "hazard")) {
    const met = bestMet(state, room);
    if (met) {
      ev.push({ type: "THRESHOLD_MET", room, threshold: met });
      state = { ...state, ...clearRoom(state, room, ev) };
      if (met.reward) state = payReward(state, rewardTarget ?? "Red", ev);
    }
  }

  // A Stuff room is measured per character, on their own side of the play zone.
  // Its Flee line clears the room and does nothing else, so it is Cleared
  // either way and never punishes you (section 6).
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

  // Section 9: what decides a last stand is how the room ends. Cleared — even
  // by a Flee line whose own text clears it — means the character gets out;
  // anything else means the team fled and they go Down.
  const roomCleared = state.activeRoom === null;
  const lastStandAtClear = {
    Red: roomCleared && state.red.lastStand,
    Gray: roomCleared && state.gray.lastStand,
  };

  // If no threshold was met, the characters Flee (section 5).
  if (state.activeRoom) {
    state = applyFlee(state, state.activeRoom, fleeTarget, ev);
  }

  // Cleanup: exhaust both hands and the entire play zone. `Hold` cards survive.
  state = cleanupPiles(state, lastStandAtClear, ev);

  // Section 9: a deck emptied this phase puts its character in last stand as
  // the phase's last step — after the room check and the Flee have resolved.
  state = activateLastStand(state, ev);

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
 * The reward tier on a Hazard (and on one Enemy room): turn the top card of the
 * named character's reward pool face up; it goes on top of that character's
 * deck (section 6). Rooms that print "one character" leave the choice
 * on the END_PLAY command.
 *
 * Always taken here: whether a skipped reveal goes to the bottom of its pool is
 * NOT YET RULED (ticket 09), so the prototype does not offer the skip.
 */
function payReward(s: GameState, c: Character, ev: DomainEvent[]): GameState {
  const poolKey = c === "Red" ? "red" : "gray";
  const pool = s.pools[poolKey];
  if (pool.length === 0) return s;
  const card = pool[0];
  ev.push({ type: "REWARD_TAKEN", character: c, card });
  // Nothing shuffles during a floor, so it is the very next card they draw.
  return withPlayer(
    { ...s, pools: { ...s.pools, [poolKey]: pool.slice(1) } as GameState["pools"] },
    c,
    { ...playerOf(s, c), deck: [card, ...playerOf(s, c).deck] },
  );
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

  // Section 9: the team Fleeing while a character is in last stand puts them
  // Down. A character whose deck emptied only this phase is not yet in last
  // stand — activation is the phase's last step — so the flag decides.
  for (const c of ["Red", "Gray"] as const) {
    if (playerOf(state, c).lastStand) {
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
 * Normally hand and play zone both go to the exhaust pile. But if the room
 * ended Cleared while a character was in last stand, the last stand cleanup
 * replaces their play-zone cleanup: all cards in their play zone — Stuff
 * included — are shuffled into their deck, then 2 cards are Exhausted from the
 * top of that deck as the price of getting out. Fewer than 2 cards in the
 * shuffle means the price meets an empty deck and sends them Down. The hand is
 * cleaned up as normal either way.
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
    for (const card of dropped) state = exhaust(state, c, card, ev);

    if (lastStandAtClear[c] && !playerOf(state, c).down) {
      const [deck, seed] = shuffle([...playerOf(state, c).deck, ...played], state.seed);
      state = withPlayer({ ...state, seed }, c, { ...playerOf(state, c), deck, lastStand: false });
      const before = playerOf(state, c).deck.slice(0, LAST_STAND_PRICE);
      state = exhaustFromDeck(state, c, LAST_STAND_PRICE, "the price of getting out", ev);
      ev.push({ type: "LAST_STAND_ESCAPED", character: c, price: before });
      continue;
    }

    for (const card of played) state = exhaust(state, c, card, ev);
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

  // 1. All Stuff in the exhaust pile moves to the Scrapyard, for good — nothing
  //    ever leaves the Scrapyard. This is the moment of the Scrap tax: keep one
  //    Stuff card from your own exhaust pile by Scrapping another card from
  //    that pile in its place.
  let exhaustPile = [...p.exhaust];
  const scrapyard = [...state.scrapyard];
  if (choice.keepStuffId && choice.scrapId) {
    const keep = exhaustPile.find((x) => x.id === choice.keepStuffId && x.kind !== "player");
    const pay = exhaustPile.find((x) => x.id === choice.scrapId && x.id !== choice.keepStuffId);
    if (!keep) throw new RuleError(`${choice.keepStuffId} is not Stuff in ${c}'s exhaust pile.`);
    if (!pay) throw new RuleError(`${choice.scrapId} is not another card in ${c}'s exhaust pile.`);
    exhaustPile = exhaustPile.filter((x) => x.id !== pay.id);
    scrapyard.push(pay);
    ev.push({ type: "CARD_SCRAPPED", character: c, card: pay });
    // `keep` stays in the exhaust pile and shuffles into the deck with the rest.
    // It is still ordinary Stuff; nothing is tracked.
  } else if (choice.keepStuffId || choice.scrapId) {
    throw new RuleError(`The Scrap tax is both halves or neither.`);
  }
  const kept = new Set(choice.keepStuffId ? [choice.keepStuffId] : []);
  const scrappedStuff = exhaustPile.filter((x) => x.kind !== "player" && !kept.has(x.id));
  for (const card of scrappedStuff) {
    scrapyard.push(card);
    ev.push({ type: "CARD_SCRAPPED", character: c, card });
  }
  exhaustPile = exhaustPile.filter((x) => x.kind === "player" || kept.has(x.id));

  // 2. The exhaust pile shuffles back into the deck: a floor cleared is a full
  //    heal, including for a character who was Down. The hand follows the
  //    normal cleanup rules and nothing more — `Hold` cards carry up the
  //    stairs, Stuff included (section 10).
  let deck = [...p.deck, ...exhaustPile];

  // 3. The ascension reward: three from your own pool, take one or decline.
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
    pools: { ...state.pools, [poolKey]: ownPool } as GameState["pools"],
  };
  return withPlayer(state, c, {
    deck: shuffled,
    hand: p.hand,
    exhaust: [],
    down: false,
    lastStand: false,
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
    lastStand: false,
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
