/* The rules of North vs Up, and nothing else.
 *
 * One pure function: `execute(state, command)`, which is `validate` then apply.
 * An illegal command is a value; the state handed in is never touched. Nothing
 * here reads a clock, a network or Math.random — randomness is the seed carried
 * in the state, so a run replays exactly from its seed and its command log.
 *
 * Section numbers point at design/rulebook.md, which is the authority. Where a
 * rule allowed more than one reading, the reading is marked here and written up
 * in design/web-game/open-questions.md.
 */

import { behaviourOf, type BehaviourContext, type ChoiceAnswer } from "./cards/behaviours";
import {
  canDraw,
  costOf,
  costOverrideSpentBy,
  drawCapFor,
  exhaustXPreventedBy,
  handCapFor,
  payOptions,
  thresholdIsMet,
} from "./queries";
import { shuffle } from "./rng";
import {
  buildFloor,
  emptyTurnRecord,
  LAST_STAND_PRICE,
  returnRoomsToSupply,
  TOP_FLOOR,
} from "./setup";
import type {
  AscendChoice,
  Card,
  Character,
  Command,
  DomainEvent,
  GameState,
  Pending,
  Rejection,
  RejectionCode,
  Result,
  Room,
  RoomEffect,
  Threshold,
  TurnRecord,
} from "./types";
import { CorruptStateError } from "./types";
import {
  activateLastStand,
  CHARACTERS,
  clearFreePlays,
  dealBadStuff,
  drawOne,
  discard,
  exhaustFromDeck,
  discardFromHand,
  goDown,
  playerOf,
  scrap,
  shuffleIntoDeck,
  spendFreePlay,
  standing,
  takeGoodStuff,
  topDeck,
  withPlayer,
} from "./verbs";

/** A card effect that feeds itself would loop forever; this is the tripwire. */
const TRIGGER_LIMIT = 500;

const reject = (code: RejectionCode, message: string): Rejection => ({ code, message });

/* ==========================================================================
   Validation — "would this be legal?", asked without running anything.
   ========================================================================== */

export function validate(state: GameState, command: Command): Rejection | null {
  if (state.phase === "GameOver") {
    return reject("GameIsOver", "The run is over.");
  }
  if (state.pending) return validateAnswer(state.pending, command);

  switch (command.type) {
    case "CHOOSE_CHARACTER":
    case "CHOOSE_CARDS":
    case "ORDER_CARDS":
    case "TAKE_REWARD":
      return reject("NoPendingChoice", "Nothing is waiting to be answered.");

    case "FLIP_ROOM": {
      if (state.phase !== "Flip") return wrongPhase(state, "flip a room");
      // §9: both Down at the start of a turn ends the run, so the command is
      // still legal — there is simply no flip.
      if (state.Red.down && state.Gray.down) return null;
      if (state.floorDeck.length === 0) {
        return reject("FloorDeckEmpty", "The floor deck and the Fled pile are both empty.");
      }
      return null;
    }

    case "DRAW": {
      if (state.phase !== "Draw") return wrongPhase(state, "draw");
      const p = playerOf(state, command.character);
      if (p.down) return reject("CharacterIsDown", `${command.character} is Down.`);
      if (p.lastStand) {
        return reject("InLastStand", `${command.character} is in last stand and does not draw.`);
      }
      if (p.deck.length === 0) {
        return reject("DeckIsEmpty", `${command.character} has nothing left to draw.`);
      }
      if (p.drewThisTurn >= drawCapFor(state, command.character)) {
        return reject("DrawCapReached", `${command.character} may not draw any deeper this turn.`);
      }
      if (!canDraw(state, command.character)) {
        return reject(
          "HandIsFull",
          `${command.character} is holding ${String(handCapFor(state, command.character))} and has a Full Hand.`,
        );
      }
      return null;
    }

    case "END_DRAW": {
      if (state.phase !== "Draw") return wrongPhase(state, "end the draw phase");
      return null;
    }

    case "PLAY_CARD": {
      if (state.phase !== "Play") return wrongPhase(state, "play a card");
      const c = command.character;
      const p = playerOf(state, c);
      if (p.down) return reject("CharacterIsDown", `${c} is Down.`);
      const card = p.hand.find((x) => x.id === command.cardId);
      if (!card) return reject("NotInHand", `That card is not in ${c}'s hand.`);

      const cost = costOf(state, c, card);
      if (command.payWith.length !== cost) {
        return reject(
          "WrongPayment",
          `${card.name} costs ${String(cost)}; ${String(command.payWith.length)} offered.`,
        );
      }
      const offered = new Set(command.payWith);
      if (offered.size !== command.payWith.length) {
        return reject("WrongPayment", "The same card was offered twice.");
      }
      if (offered.has(command.cardId)) {
        return reject("CannotPayWithThat", "A card cannot pay for itself.");
      }
      const payable = new Set(payOptions(state, c, command.cardId).map((x) => x.id));
      for (const id of command.payWith) {
        if (!payable.has(id)) return reject("CannotPayWithThat", `That card cannot pay this cost.`);
      }
      return null;
    }

    case "END_PLAY": {
      if (state.phase !== "Play") return wrongPhase(state, "end the play phase");
      return null;
    }

    case "ASCEND": {
      if (state.phase !== "Ascend") return wrongPhase(state, "ascend");
      for (const c of CHARACTERS) {
        const problem = validateAscendChoice(state, c, command[c]);
        if (problem) return problem;
      }
      return null;
    }
  }
}

function wrongPhase(state: GameState, what: string): Rejection {
  return reject("WrongPhase", `Cannot ${what} during the ${state.phase} phase.`);
}

function validateAnswer(pending: Pending, command: Command): Rejection | null {
  const waiting = reject("AwaitingChoice", `Waiting on: ${pending.prompt}`);
  switch (command.type) {
    case "CHOOSE_CHARACTER":
      if (pending.kind !== "ChooseCharacter") return waiting;
      return pending.options.includes(command.character)
        ? null
        : reject("NotAnOption", `${command.character} is not one of the options.`);

    case "CHOOSE_CARDS": {
      if (pending.kind !== "ChooseCards") return waiting;
      const chosen = new Set(command.cardIds);
      if (chosen.size !== command.cardIds.length) {
        return reject("NotAnOption", "The same card was chosen twice.");
      }
      const options = new Set(pending.options.map((x) => x.id));
      for (const id of chosen) {
        if (!options.has(id)) return reject("NotAnOption", "That card was not offered.");
      }
      const wanted = Math.min(pending.count, pending.options.length);
      if (command.cardIds.length === wanted) return null;
      if (pending.optional && command.cardIds.length === 0) return null;
      return reject("NotAnOption", `Choose ${String(wanted)}.`);
    }

    case "ORDER_CARDS": {
      if (pending.kind !== "OrderCards") return waiting;
      const want = [...pending.cards.map((x) => x.id)].sort();
      const got = [...command.cardIds].sort();
      const same = want.length === got.length && want.every((id, i) => id === got[i]);
      return same ? null : reject("NotAnOption", "Order every card that was shown, once each.");
    }

    case "TAKE_REWARD":
      return pending.kind === "TakeReward" ? null : waiting;

    default:
      return waiting;
  }
}

function validateAscendChoice(
  state: GameState,
  c: Character,
  choice: AscendChoice,
): Rejection | null {
  const pile = playerOf(state, c).discard;
  const hasKeep = choice.keepStuffId !== null;
  const hasScrap = choice.scrapId !== null;
  if (hasKeep !== hasScrap) {
    return reject("ScrapTaxIncomplete", "The Scrap tax is both halves or neither.");
  }
  if (hasKeep) {
    const keep = pile.find((x) => x.id === choice.keepStuffId);
    if (!keep || keep.kind === "player") {
      return reject("NotAnOption", `That is not Stuff in ${c}'s discard pile.`);
    }
    const payer = pile.find((x) => x.id === choice.scrapId);
    if (!payer || payer.id === choice.keepStuffId) {
      return reject("NotAnOption", `That is not another card in ${c}'s discard pile.`);
    }
  }
  if (choice.takeRewardId !== null) {
    const offered = state.offer?.[c] ?? [];
    if (!offered.some((x) => x.id === choice.takeRewardId)) {
      return reject("NotOffered", `That card was not offered to ${c}.`);
    }
  }
  return null;
}

/* ==========================================================================
   The engine
   ========================================================================== */

/** One command's worth of events, plus how far the trigger dispatch has read. */
interface Run {
  readonly events: DomainEvent[];
  scanned: number;
}

export function execute(state: GameState, command: Command): Result {
  const reason = validate(state, command);
  if (reason) return { ok: false, reason };
  const run: Run = { events: [], scanned: 0 };
  let next = apply(state, command, run);
  next = flush(next, run);
  return { ok: true, state: next, events: run.events };
}

function apply(state: GameState, command: Command, run: Run): GameState {
  switch (command.type) {
    case "FLIP_ROOM":
      return flipRoom(state, run);
    case "DRAW":
      // §9: `drawOne` itself sweeps for last stand right away if this empties
      // the deck — see the note on `activateLastStand`.
      return drawOne(state, command.character, run.events);
    case "END_DRAW":
      return { ...state, phase: "Play" };
    case "PLAY_CARD":
      return playCard(state, command.character, command.cardId, command.payWith, run);
    case "END_PLAY":
      return endPlay(state, run);
    case "CHOOSE_CHARACTER":
      return answerCharacter(state, command.character, run);
    case "CHOOSE_CARDS":
      return answerCards(state, command.cardIds, "cards", run);
    case "ORDER_CARDS":
      return answerCards(state, command.cardIds, "order", run);
    case "TAKE_REWARD":
      return answerReward(state, command.take, run);
    case "ASCEND":
      return ascend(state, command.Red, command.Gray, run);
  }
}

/* ------------------------------------------------------ this-turn triggers */

/** Every card that can hear an event: in either hand, or in the play zone. */
function listeners(state: GameState): readonly BehaviourContext[] {
  const out: BehaviourContext[] = [];
  for (const c of CHARACTERS) {
    for (const card of playerOf(state, c).hand) out.push({ card, character: c, zone: "hand" });
  }
  for (const played of state.playZone) {
    out.push({ card: played.card, character: played.owner, zone: "playZone" });
  }
  return out;
}

/** Hand every event produced so far to every card that might be listening. */
function flush(state: GameState, run: Run): GameState {
  let s = state;
  while (run.scanned < run.events.length) {
    const event = run.events[run.scanned];
    run.scanned += 1;
    if (!event) continue;
    for (const ctx of listeners(s)) {
      const onEvent = behaviourOf(ctx.card.name)?.onEvent;
      if (!onEvent) continue;
      const step = onEvent(event, s, ctx);
      s = step.state;
      run.events.push(...step.events);
    }
    if (run.events.length > TRIGGER_LIMIT) {
      throw new CorruptStateError("A card trigger is feeding itself.");
    }
  }
  return s;
}

/**
 * A bare `Exhaust X` line: X cards off the top of that character's own deck.
 * Rooms print it as their punishment and some cards print it as their own cost.
 * `exhaustFromDeck` sweeps for last stand right away if this empties the deck
 * (§9), whichever of the two prints it.
 *
 * This is the only shape a card can turn off. `Discard X cards from your hand`
 * names its zone, and so do cleanup, the burned draw of a full hand and the
 * price of getting out of last stand — none of those is an `Exhaust X` line, so
 * a card that stops `Exhaust X` does not stop them.
 */
function printedExhaust(
  state: GameState,
  c: Character,
  amount: number,
  cause: string,
  run: Run,
): GameState {
  const stoppedBy = exhaustXPreventedBy(state, c);
  if (stoppedBy) {
    run.events.push({ type: "EXHAUST_PREVENTED", character: c, amount, by: stoppedBy });
    return state;
  }
  return exhaustFromDeck(state, c, amount, cause, run.events);
}

/* ------------------------------------------------------------ Flip */

function flipRoom(state: GameState, run: Run): GameState {
  // §9: the run ends when both characters are Down, checked at the start of a
  // turn. If both are Down when a turn begins, there is no flip.
  if (state.Red.down && state.Gray.down) {
    run.events.push({ type: "GAME_OVER", outcome: "Defeat" });
    return { ...state, phase: "GameOver", outcome: "Defeat" };
  }
  const room = state.floorDeck[0];
  if (!room) throw new CorruptStateError("Flipped an empty floor deck.");

  // Each Turn, New Room: you always see what you are facing before you spend anything.
  run.events.push({ type: "ROOM_FLIPPED", room });
  const flipped: GameState = {
    ...state,
    turn: state.turn + 1,
    floorDeck: state.floorDeck.slice(1),
    activeRoom: room,
    phase: "Draw",
    Red: { ...state.Red, drewThisTurn: 0 },
    Gray: { ...state.Gray, drewThisTurn: 0 },
    thisTurn: emptyTurnRecord(),
  };
  return openingDraw(flipped, run);
}

/* ------------------------------------------------------------ Draw */

/**
 * Each Turn, Draw: opens with both characters drawing 1 card at the same time.
 * The engine draws them one after the other, Red first, which is the same
 * result: neither draw can see or change the other. A `Full Hand` burns the
 * card to the discard pile and a character in last stand does not draw at
 * all (§9).
 */
function openingDraw(state: GameState, run: Run): GameState {
  let s = state;
  for (const c of CHARACTERS) {
    if (playerOf(s, c).lastStand) continue;
    // §9: `drawOne` sweeps for last stand right away if this draw empties the deck.
    s = drawOne(s, c, run.events);
  }
  return s;
}

/* ------------------------------------------------------------ Play */

const addPaid = (record: TurnRecord, c: Character, n: number): TurnRecord =>
  c === "Red"
    ? { ...record, paid: { ...record.paid, Red: record.paid.Red + n } }
    : { ...record, paid: { ...record.paid, Gray: record.paid.Gray + n } };

function playCard(
  state: GameState,
  c: Character,
  cardId: Card["id"],
  payWith: readonly Card["id"][],
  run: Run,
): GameState {
  const p = playerOf(state, c);
  const card = p.hand.find((x) => x.id === cardId);
  if (!card) throw new CorruptStateError("Played a card that is not in hand.");
  const payment = payWith.flatMap((id) => {
    const found = p.hand.find((x) => x.id === id);
    return found ? [found] : [];
  });

  let s = state;
  // A one-shot cost override is used up here. Last stand is not one of those,
  // so a character playing their whole hand for nothing (§9) never burns the
  // team's free play, and neither does a card that already cost nothing.
  if (costOverrideSpentBy(s, c, card)?.reason === "free play") {
    s = spendFreePlay(s);
  }

  // Each Turn, Play: you pay in *other* cards from your own hand. Red never pays for Gray.
  s = discardFromHand(s, c, payment, run.events);
  if (payment.length > 0) {
    run.events.push({ type: "COST_PAID", character: c, cards: payment });
    s = { ...s, thisTurn: addPaid(s.thisTurn, c, payment.length) };
  }

  const after = playerOf(s, c);
  s = withPlayer(s, c, { ...after, hand: after.hand.filter((x) => x.id !== cardId) });
  s = { ...s, playZone: [...s.playZone, { owner: c, card }] };
  run.events.push({ type: "CARD_PLAYED", character: c, card });

  // Each Turn: nothing resolves while you play — the *room* is checked once, at
  // the end of the phase. A card's own printed effect still happens as it is played.
  const behaviour = behaviourOf(card.name);
  if (behaviour?.exhaustX !== undefined) {
    s = printedExhaust(s, c, behaviour.exhaustX, card.name, run);
  }
  const onPlay = behaviour?.onPlay;
  if (onPlay) {
    const step = onPlay(s, { card, character: c, zone: "playZone" });
    s = step.state;
    run.events.push(...step.events);
  }
  return s;
}

/* ------------------------------------------------------------ Outcome */

const goodStuffFor = (t: Threshold, c: Character): number =>
  t.effects
    .filter((e) => e.type === "TakeGoodStuff" && (e.who === c || e.who === "both"))
    .reduce((most, e) => Math.max(most, e.type === "TakeGoodStuff" ? e.count : 0), 0);

/**
 * A Stuff room's challenge is split per character, and a richer tier says
 * "instead" — so each character takes the largest amount any met line awards
 * them rather than the sum. See open-questions.md #2.
 */
function stuffRoomEffects(met: readonly Threshold[]): readonly RoomEffect[] {
  const out: RoomEffect[] = [];
  for (const c of CHARACTERS) {
    const count = met.reduce((most, t) => Math.max(most, goodStuffFor(t, c)), 0);
    if (count > 0) out.push({ type: "TakeGoodStuff", who: c, count });
  }
  for (const t of met) {
    for (const e of t.effects) if (e.type !== "TakeGoodStuff") out.push(e);
  }
  return out;
}

interface RoomOutcome {
  readonly met: readonly Threshold[];
  readonly cleared: boolean;
  readonly effects: readonly RoomEffect[];
}

/**
 * Each Turn, Outcome: the room is checked once, when both characters have stopped playing. If
 * any challenge's threshold is met the room is Cleared, and the card text of
 * *every* challenge met resolves — a Hazard's higher tier also reveals a
 * reward, on top of the lower tier rather than instead of it. See
 * open-questions.md #1.
 */
function roomOutcome(state: GameState, room: Room): RoomOutcome {
  const met = room.thresholds.filter((t) => thresholdIsMet(state, t));

  if (met.length === 0) {
    // Each Turn, Outcome: if no threshold is met, the characters Flee. Resolve the Flee line.
    // A Stuff room prints no Flee line of its own; it Fled empty-handed like
    // any other room, and does not Clear.
    return { met, cleared: room.flee.clears, effects: room.flee.effects };
  }
  if (room.kind === "stuff") {
    return { met, cleared: true, effects: stuffRoomEffects(met) };
  }
  // A line that says "Flee this room for free" cannot un-Clear a room another
  // met line Cleared: Outcome's first sentence is that any met threshold Clears it.
  return {
    met,
    cleared: met.some((t) => t.clears),
    effects: met.flatMap((t) => t.effects),
  };
}

function endPlay(state: GameState, run: Run): GameState {
  const room = state.activeRoom;
  if (!room) throw new CorruptStateError("Ended a play phase with no room in the zone.");

  const outcome = roomOutcome(state, room);
  for (const threshold of outcome.met) {
    run.events.push({ type: "THRESHOLD_MET", room, threshold });
  }

  let s: GameState = { ...state, activeRoom: null };
  if (outcome.cleared) {
    // A Cleared room is out of the game. Nobody counts that heap.
    run.events.push({ type: "ROOM_CLEARED", room });
    s = { ...s, cleared: [...s.cleared, room] };
  } else {
    // A Fled room comes back around when the Fled pile shuffles in. See
    // open-questions.md #21.
    run.events.push({ type: "ROOM_FLED", room });
    s = { ...s, fled: [...s.fled, room] };
  }

  s = {
    ...s,
    resolution: {
      effects: outcome.effects,
      roomEnded: outcome.cleared ? "Cleared" : "Fled",
      // §9: what matters is how the room ends, not how it got there.
      lastStandAtClear: {
        Red: outcome.cleared && s.Red.lastStand,
        Gray: outcome.cleared && s.Gray.lastStand,
      },
    },
  };
  return drain(s, run);
}

const withEffects = (state: GameState, effects: readonly RoomEffect[]): GameState =>
  state.resolution ? { ...state, resolution: { ...state.resolution, effects } } : state;

function retarget(effect: RoomEffect, who: Character): RoomEffect {
  switch (effect.type) {
    case "ExhaustFromDeck":
      return { type: "ExhaustFromDeck", who, amount: effect.amount };
    case "DealBadStuff":
      return { type: "DealBadStuff", who };
    case "TakeGoodStuff":
      return { type: "TakeGoodStuff", who, count: effect.count };
    case "RevealReward":
      return { type: "RevealReward", who };
  }
}

const promptFor = (effect: RoomEffect): string => {
  switch (effect.type) {
    case "ExhaustFromDeck":
      return `Who Exhausts ${String(effect.amount)} from their deck?`;
    case "DealBadStuff":
      return "Who takes the Bad Stuff?";
    case "TakeGoodStuff":
      return "Who takes the Good Stuff?";
    case "RevealReward":
      return "Whose reward pool is revealed?";
  }
};

function applyEffect(state: GameState, effect: RoomEffect, who: Character, run: Run): GameState {
  switch (effect.type) {
    case "ExhaustFromDeck":
      return printedExhaust(state, who, effect.amount, "a room's printed punishment", run);
    case "DealBadStuff":
      return dealBadStuff(state, who, run.events);
    case "TakeGoodStuff":
      return takeGoodStuff(state, who, effect.count, run.events);
    case "RevealReward":
      throw new CorruptStateError("A reward reveal is a pending choice, not an effect.");
  }
}

/**
 * Work through what the room owes, stopping at the first thing that needs a
 * decision. Where a line says *1 character*, the team chooses which one and
 * they take all of it — there is no splitting. With a partner Down there is
 * nothing to choose and it all falls on the survivor (§9).
 */
function drain(state: GameState, run: Run): GameState {
  let s = state;
  for (;;) {
    const resolution = s.resolution;
    if (!resolution) return s;
    const head = resolution.effects[0];
    if (!head) return finishTurn(s, run);
    const rest = resolution.effects.slice(1);

    if (head.who === "both") {
      s = withEffects(s, [...CHARACTERS.map((c) => retarget(head, c)), ...rest]);
      continue;
    }
    if (head.who === "one") {
      const options = standing(s);
      const only = options[0];
      if (!only) {
        s = withEffects(s, rest);
        continue;
      }
      if (options.length > 1) {
        return { ...s, pending: { kind: "ChooseCharacter", prompt: promptFor(head), options, source: null } };
      }
      s = withEffects(s, [retarget(head, only), ...rest]);
      continue;
    }

    if (head.type === "RevealReward") {
      // Turn the top card of that character's reward pool face up, and take
      // it or skip it. See open-questions.md #7.
      const card = s.pools[head.who][0];
      s = withEffects(s, rest);
      if (!card) continue;
      run.events.push({ type: "REWARD_REVEALED", character: head.who, card });
      return {
        ...s,
        pending: {
          kind: "TakeReward",
          prompt: `Take ${card.name}, or skip it?`,
          character: head.who,
          card,
          source: null,
        },
      };
    }

    s = applyEffect(s, head, head.who, run);
    s = withEffects(s, rest);
  }
}

/* ------------------------------------------------------------ Cleanup */

function finishTurn(state: GameState, run: Run): GameState {
  const resolution = state.resolution;
  // The resolution stays readable through cleanup: a card that asks whether the
  // room was Cleared reads it there. It is cleared at the end of the turn.
  let s: GameState = { ...state, pending: null };

  // The Play phase is over, so a free play nobody used is gone: it discounts a
  // card played this turn or nothing at all. See open-questions.md #14.
  s = clearFreePlays(s);

  // §9: the team Fleeing the room while a character is in last stand puts that
  // character Down. In last stand you have to keep clearing rooms.
  if (resolution?.roomEnded === "Fled") {
    for (const c of CHARACTERS) {
      if (playerOf(s, c).lastStand) {
        s = goDown(s, c, "the team fled while they were in last stand", run.events);
      }
    }
  }

  run.events.push({ type: "CLEANUP_BEGAN" });
  // A card that takes itself back out of the play zone does it now, before the
  // piles are cleaned.
  s = flush(s, run);

  s = cleanupPiles(s, resolution?.lastStandAtClear ?? { Red: false, Gray: false }, run);

  // §9: a backstop. `drawOne` and `exhaustFromDeck` already sweep for last
  // stand the moment a deck empties, so this ordinarily finds nothing to do.
  s = activateLastStand(s, run.events);

  // If the floor draw pile is empty, shuffle the Fled pile back in. See
  // open-questions.md #21.
  if (s.floorDeck.length === 0 && s.fled.length > 0) {
    const [deck, seed] = shuffle(s.fled, s.seed);
    run.events.push({ type: "FLED_RESHUFFLED", rooms: deck.length });
    s = { ...s, floorDeck: deck, fled: [], seed };
  }

  s = { ...s, resolution: null };
  run.events.push({ type: "TURN_ENDED", turn: s.turn });

  // §10: clearing the Enemy room ends the floor. You do not have to empty the
  // deck; you have to kill the thing on the stairs.
  if (s.cleared.some((r) => r.kind === "enemy")) {
    run.events.push({ type: "FLOOR_CLEARED", floor: s.floor });
    if (s.floor >= TOP_FLOOR) {
      run.events.push({ type: "GAME_OVER", outcome: "Victory" });
      return { ...s, phase: "GameOver", outcome: "Victory", playZone: [] };
    }
    // §10 step 3: each character is offered three cards from their own pool.
    return {
      ...s,
      phase: "Ascend",
      playZone: [],
      offer: { Red: s.pools.Red.slice(0, 3), Gray: s.pools.Gray.slice(0, 3) },
    };
  }
  return { ...s, phase: "Flip", playZone: [] };
}

/**
 * Each Turn, Cleanup: discard the entire play zone. The hand carries over untouched.
 *
 * §9: if the room was Cleared while a character was in last stand, the last
 * stand cleanup replaces their play-zone cleanup — the play zone shuffles into
 * their deck and 2 off the top are the price of getting out. See
 * open-questions.md #4.
 */
function cleanupPiles(
  state: GameState,
  lastStandAtClear: Readonly<Record<Character, boolean>>,
  run: Run,
): GameState {
  let s = state;

  // Any played card that takes itself somewhere else. It has to happen
  // before the play zone is discarded, or a card returning to hand would be
  // discarded straight back out of it.
  for (const played of s.playZone) {
    const onCleanup = behaviourOf(played.card.name)?.onCleanup;
    if (!onCleanup) continue;
    const step = onCleanup(s, {
      card: played.card,
      character: played.owner,
      zone: "playZone",
    });
    s = step.state;
    run.events.push(...step.events);
  }

  // Then the play zone itself.
  for (const c of CHARACTERS) {
    const played = s.playZone.filter((x) => x.owner === c).map((x) => x.card);

    if (lastStandAtClear[c] && !playerOf(s, c).down) {
      s = shuffleIntoDeck(s, c, played, run.events);
      s = withPlayer(s, c, { ...playerOf(s, c), lastStand: false });
      // The price is read off the top of the deck before it is paid, not
      // after: what's sitting there right now is exactly what `exhaustFromDeck`
      // is about to take, so the event can announce the escape — and report
      // what it cost — before the exhaust (and any Down it causes) happens.
      const price = playerOf(s, c).deck.slice(0, LAST_STAND_PRICE);
      run.events.push({ type: "LAST_STAND_ESCAPED", character: c, price });
      s = exhaustFromDeck(s, c, LAST_STAND_PRICE, "the price of getting out", run.events);
      continue;
    }
    for (const card of played) s = discard(s, c, card, "playZone", run.events);
  }
  return { ...s, playZone: [] };
}

/* ------------------------------------------------------ answering a choice */

function contextFor(state: GameState, pending: Pending): BehaviourContext | null {
  const source = pending.source;
  if (!source) return null;
  const zone = state.playZone.some((p) => p.card.id === source.card.id) ? "playZone" : "hand";
  return { card: source.card, character: source.character, zone };
}

function runChoice(state: GameState, answer: ChoiceAnswer, run: Run): GameState {
  const pending = state.pending;
  if (!pending) throw new CorruptStateError("Answered a choice that was not being asked.");
  const ctx = contextFor(state, pending);
  const cleared: GameState = { ...state, pending: null };
  if (!ctx) return drain(cleared, run);

  const onChoice = behaviourOf(ctx.card.name)?.onChoice;
  if (!onChoice) throw new CorruptStateError(`${ctx.card.name} asked a question it cannot answer.`);
  const step = onChoice(answer, cleared, ctx);
  run.events.push(...step.events);
  return step.state.pending ? step.state : drain(step.state, run);
}

function answerCharacter(state: GameState, character: Character, run: Run): GameState {
  const pending = state.pending;
  if (pending?.kind !== "ChooseCharacter") {
    throw new CorruptStateError("Answered a character choice that was not being asked.");
  }
  if (pending.source) {
    return runChoice(state, { kind: "character", tag: pending.source.tag, character }, run);
  }
  // A room asked, so the answer retargets the effect the drain stopped on.
  const resolution = state.resolution;
  const head = resolution?.effects[0];
  if (!resolution || !head) throw new CorruptStateError("No room effect is waiting for a target.");
  return drain(
    {
      ...state,
      pending: null,
      resolution: { ...resolution, effects: [retarget(head, character), ...resolution.effects.slice(1)] },
    },
    run,
  );
}

function answerCards(
  state: GameState,
  cardIds: readonly Card["id"][],
  kind: "cards" | "order",
  run: Run,
): GameState {
  const pending = state.pending;
  if (!pending?.source) throw new CorruptStateError("No card is waiting on that answer.");
  const shown =
    pending.kind === "ChooseCards"
      ? pending.options
      : pending.kind === "OrderCards"
        ? pending.cards
        : [];
  const cards = cardIds.flatMap((id) => {
    const found = shown.find((x) => x.id === id);
    return found ? [found] : [];
  });
  return runChoice(state, { kind, tag: pending.source.tag, cards }, run);
}

function answerReward(state: GameState, take: boolean, run: Run): GameState {
  const pending = state.pending;
  if (pending?.kind !== "TakeReward") {
    throw new CorruptStateError("No reward reveal is waiting for an answer.");
  }
  const { character, card } = pending;
  const rest = state.pools[character].slice(1);
  let s: GameState = { ...state, pending: null };
  if (take) {
    // Nothing shuffles during a floor, so it is the very next card they draw.
    s = setPool(s, character, rest);
    s = topDeck(s, character, card);
    run.events.push({ type: "REWARD_TAKEN", character, card });
  } else {
    // Bottom of its pool, as a declined ascension reward does. Ruled;
    // see open-questions.md #8.
    s = setPool(s, character, [...rest, card]);
    run.events.push({ type: "REWARD_DECLINED", character });
  }
  return drain(s, run);
}

const setPool = (state: GameState, c: Character, cards: readonly Card[]): GameState =>
  c === "Red"
    ? { ...state, pools: { ...state.pools, Red: cards } }
    : { ...state, pools: { ...state.pools, Gray: cards } };

/* ------------------------------------------------------------ §10 Ascending */

function ascend(state: GameState, red: AscendChoice, gray: AscendChoice, run: Run): GameState {
  let s = state;
  s = ascendOne(s, "Red", red, run);
  s = ascendOne(s, "Gray", gray, run);

  // Setup: build the next floor's deck, with one fewer Stuff room than last time.
  s = returnRoomsToSupply(s);
  s = buildFloor({ ...s, floor: s.floor + 1, offer: null }, run.events);
  return { ...s, phase: "Flip", playZone: [], thisTurn: emptyTurnRecord() };
}

function ascendOne(state: GameState, c: Character, choice: AscendChoice, run: Run): GameState {
  let s = state;
  let pile = [...playerOf(s, c).discard];

  // §10 step 1: all Stuff in the discard pile moves to the Scrapyard, for good.
  // The Scrap tax keeps one piece by Scrapping another card of that pile in its
  // place. Kept Stuff stays ordinary Stuff; nothing is tracked.
  if (choice.keepStuffId !== null && choice.scrapId !== null) {
    const payer = pile.find((x) => x.id === choice.scrapId);
    if (payer) {
      pile = pile.filter((x) => x.id !== payer.id);
      s = scrap(s, c, payer, run.events);
    }
  }
  for (const card of pile) {
    if (card.kind !== "player" && card.id !== choice.keepStuffId) s = scrap(s, c, card, run.events);
  }
  pile = pile.filter((x) => x.kind === "player" || x.id === choice.keepStuffId);

  // §10 step 3: three cards from their own pool; take one or decline. A declined
  // card goes to the bottom of its pool.
  const offered = state.offer?.[c] ?? [];
  const taken = offered.find((x) => x.id === choice.takeRewardId) ?? null;
  if (taken) run.events.push({ type: "REWARD_TAKEN", character: c, card: taken });
  else run.events.push({ type: "REWARD_DECLINED", character: c });
  const returned = offered.filter((x) => x.id !== taken?.id);
  s = setPool(s, c, [...s.pools[c].slice(offered.length), ...returned]);

  // §10 step 2: the discard pile shuffles back into the deck. A floor cleared is
  // a full heal, including for a character who was Down. Nothing bad crosses a
  // floor boundary. A hand carries over untouched, Stuff included.
  s = withPlayer(s, c, {
    ...playerOf(s, c),
    discard: [],
    down: false,
    lastStand: false,
    drewThisTurn: 0,
  });
  return shuffleIntoDeck(s, c, [...pile, ...(taken ? [taken] : [])], run.events);
}
