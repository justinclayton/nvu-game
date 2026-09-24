/* The rules of North vs Up, and nothing else.
 *
 * One pure function: `execute(state, command)`, which is `validate` then apply.
 * An illegal command is a value; the state handed in is never touched. Nothing
 * here reads a clock, a network or Math.random — randomness is the seed carried
 * in the state, so a run replays exactly from its seed and its command log.
 *
 * Section numbers point at design/rulebook.md, rules version
 * 0.2.1, which is the authority.
 */

import { behaviourOf, type BehaviourContext, type ChoiceAnswer } from "./cards/behaviours";
import {
  costOf,
  costOverrideSpentBy,
  drawTargetFor,
  exhaustXPreventedBy,
  payOptions,
  thresholdIsMet,
} from "./queries";
import { shuffle } from "./rng";
import { buildFloor, emptyTurnRecord, returnRoomsToSupply, TOP_FLOOR } from "./setup";
import type {
  AscendChoice,
  Card,
  CardId,
  Challenge,
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
  UnfinishedPlay,
} from "./types";
import { CorruptStateError } from "./types";
import {
  CHARACTERS,
  clearFreePlays,
  dealBadStuff,
  drawOne,
  discard,
  exhaustFromDeck,
  discardFromHand,
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

/**
 * design/web-game/spec.md: `Command` is "switched exhaustively with a `never`
 * default." TypeScript proves that at compile time; this is what backs the
 * promise up at runtime, for a command that reached here from outside the
 * type system — a saved run from before a command was renamed or removed,
 * for instance. See design/cli-sim/spec.md, replay: that is how a rules
 * change that broke a saved run is meant to show itself, not as a silent
 * no-op.
 */
function assertNever(command: never): never {
  throw new CorruptStateError(
    `Unrecognized command: ${JSON.stringify(command)}. A saved run from an older rules version may not replay.`,
  );
}

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
      if (state.phase !== "Turn Start") return wrongPhase(state, "flip a room");
      if (state.floorDeck.length === 0) {
        return reject("FloorDeckEmpty", "The floor deck is empty.");
      }
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

    default:
      return assertNever(command);
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

/* --------------------------------------------------------- Rulebook, Ascending */

/**
 * Where one of a character's own cards currently sits — never the Exhaust
 * pile. `hand` only ever matters before Ascending's step 1 (Shuffle your
 * hand into your deck) runs: `validateAscendChoice` checks the state as
 * submitted, where the hand can still hold cards, but `settleStuff` (step 2)
 * always sees an empty one.
 */
type Pile = "deck" | "hand" | "discard";

/** Find a card of this character's, wherever among deck, hand or discard it sits. */
function locate(state: GameState, c: Character, cardId: CardId): readonly [Pile, Card] | null {
  const p = playerOf(state, c);
  const inDeck = p.deck.find((x) => x.id === cardId);
  if (inDeck) return ["deck", inDeck];
  const inHand = p.hand.find((x) => x.id === cardId);
  if (inHand) return ["hand", inHand];
  const inDiscard = p.discard.find((x) => x.id === cardId);
  if (inDiscard) return ["discard", inDiscard];
  return null;
}

function removeFrom(state: GameState, c: Character, pile: Pile, cardId: CardId): GameState {
  const p = playerOf(state, c);
  const without = (list: readonly Card[]) => list.filter((x) => x.id !== cardId);
  if (pile === "deck") return withPlayer(state, c, { ...p, deck: without(p.deck) });
  if (pile === "hand") return withPlayer(state, c, { ...p, hand: without(p.hand) });
  return withPlayer(state, c, { ...p, discard: without(p.discard) });
}

/** Every Stuff card this character's deck, hand or discard pile holds right now. */
function stuffOnHand(state: GameState, c: Character): readonly (readonly [Pile, Card])[] {
  const p = playerOf(state, c);
  const of = (pile: Pile, list: readonly Card[]) =>
    list.filter((x) => x.kind !== "player").map((x): readonly [Pile, Card] => [pile, x]);
  return [...of("deck", p.deck), ...of("hand", p.hand), ...of("discard", p.discard)];
}

function validateAscendChoice(
  state: GameState,
  c: Character,
  choice: AscendChoice,
): Rejection | null {
  const stuff = new Map(stuffOnHand(state, c).map(([, card]) => [card.id, card] as const));
  const settledCards = new Set<CardId>();
  const spentPayers = new Set<CardId>();
  for (const entry of choice.settle) {
    if (settledCards.has(entry.cardId)) {
      return reject("NotAnOption", `${c} settled the same Stuff card twice.`);
    }
    settledCards.add(entry.cardId);
    if (!stuff.has(entry.cardId)) {
      return reject("NotAnOption", `That is not Stuff in ${c}'s deck, hand or discard pile.`);
    }
    if (entry.payWith === null) continue;
    if (spentPayers.has(entry.payWith)) {
      return reject("NotAnOption", `${c} spent the same card paying to settle Stuff twice.`);
    }
    spentPayers.add(entry.payWith);
    const payer = locate(state, c, entry.payWith);
    if (!payer || payer[1].kind !== "player") {
      return reject("NotAnOption", `That is not another card of ${c}'s to Scrap.`);
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

/**
 * One command's worth of events, how many of them `settle` has already
 * resolved, and the event index each card most recently arrived in hand or
 * the play zone at — unset for a card that was already there before this
 * command started.
 */
interface Run {
  readonly events: DomainEvent[];
  settled: number;
  readonly enteredAt: Map<CardId, number>;
}

export function execute(state: GameState, command: Command): Result {
  const reason = validate(state, command);
  if (reason) return { ok: false, reason };
  const run: Run = { events: [], settled: 0, enteredAt: new Map() };
  const next = settle(apply(state, command, run), run);
  return { ok: true, state: next, events: run.events };
}

function apply(state: GameState, command: Command, run: Run): GameState {
  switch (command.type) {
    case "FLIP_ROOM":
      return flipRoom(state, run);
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
    default:
      return assertNever(command);
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

/**
 * Resolve every card reaction to the events emitted since the last settle,
 * in order. Each reaction finishes, along with anything it sets off, before
 * the next listener hears the event. A reaction can put a character Down,
 * which ends the run right there.
 */
function settle(state: GameState, run: Run): GameState {
  const from = run.settled;
  const to = run.events.length;
  run.settled = to;
  // Every arrival in this batch is already in `state`, so a card drawn last
  // must not hear the draws before it.
  trackEntries(run, from, to);
  let s = state;
  for (let i = from; i < to; i++) {
    if (s.phase === "GameOver") return s;
    const event = run.events[i];
    if (event) s = hear(s, run, event, (id) => heldSince(run, id, i));
  }
  return s;
}

function hear(
  state: GameState,
  run: Run,
  event: DomainEvent,
  hears: (id: CardId) => boolean,
): GameState {
  let s = state;
  for (const ctx of listeners(s)) {
    if (s.phase === "GameOver") return s;
    if (!hears(ctx.card.id) || !stillThere(s, ctx)) continue;
    const onEvent = behaviourOf(ctx.card.name)?.onEvent;
    if (!onEvent) continue;
    const step = onEvent(event, s, ctx);
    run.events.push(...step.events);
    if (run.events.length > TRIGGER_LIMIT) {
      throw new CorruptStateError("A card trigger is feeding itself.");
    }
    s = settle(step.state, run);
  }
  return s;
}

/** Whether a listener is still where it was when the event happened. */
function stillThere(state: GameState, ctx: BehaviourContext): boolean {
  const zone =
    ctx.zone === "hand" ? playerOf(state, ctx.character).hand : state.playZone.map((p) => p.card);
  return zone.some((x) => x.id === ctx.card.id);
}

/** A card arriving in hand or the play zone — the moment a `Holding:` effect starts hearing events. */
function trackEntries(run: Run, from: number, to: number): void {
  for (let i = from; i < to; i++) {
    const event = run.events[i];
    if (
      event?.type === "CARD_DRAWN" ||
      event?.type === "CARD_TO_HAND" ||
      event?.type === "CARD_PLAYED"
    ) {
      run.enteredAt.set(event.card.id, i);
    }
  }
}

/** Whether a card was already in its zone before the event at `index` — false for the arrival itself. */
function heldSince(run: Run, cardId: CardId, index: number): boolean {
  const entered = run.enteredAt.get(cardId);
  return entered === undefined || entered < index;
}

/**
 * A bare `Exhaust X` line: X cards off the top of that character's own deck,
 * into the Exhaust pile. Rooms print it as their punishment and some cards
 * print it as their own cost.
 *
 * This is the only shape a card can turn off. `Discard X cards from your
 * hand` names its zone, and so does cleanup and paying a cost — none of
 * those is an `Exhaust X` line, so a card that stops `Exhaust X` does not
 * stop them.
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

/* ------------------------------------------------------------ Turn Start */

/**
 * Rulebook, Each Turn, Turn Start: one phase, two steps, both run by `FLIP_ROOM` with no
 * decision in between — flip the room, then draw both hands to 5.
 */
function flipRoom(state: GameState, run: Run): GameState {
  const room = state.floorDeck[0];
  if (!room) throw new CorruptStateError("Flipped an empty floor deck.");

  // Step 1, Flip the room: you always see what you are facing before you spend anything.
  run.events.push({ type: "ROOM_FLIPPED", room });
  const flipped: GameState = {
    ...state,
    turn: state.turn + 1,
    floorDeck: state.floorDeck.slice(1),
    activeRoom: room,
    phase: "Play",
    Red: { ...state.Red, drewThisTurn: 0 },
    Gray: { ...state.Gray, drewThisTurn: 0 },
    thisTurn: emptyTurnRecord(),
  };
  const faced = settle(flipped, run);
  if (faced.phase === "GameOver") return faced;
  return settle(drawPhase(faced, run), run);
}

/**
 * Step 2, Draw up to five: both characters draw until holding 5, all at once —
 * no opening draw, no alternating turns, no decision to make, so this never
 * pauses on its own (see `types.ts`, `Phase`: `Turn Start` covers both steps).
 * A card can still lower a character's own target (`drawTargetFor`). Nothing
 * here settles: effects triggered by these draws resolve after both have drawn.
 */
function drawPhase(state: GameState, run: Run): GameState {
  let s = state;
  for (const c of CHARACTERS) {
    s = drawToCap(s, c, run);
    if (s.phase === "GameOver") return s;
  }
  return s;
}

function drawToCap(state: GameState, c: Character, run: Run): GameState {
  let s = state;
  for (;;) {
    const p = playerOf(s, c);
    if (p.hand.length >= drawTargetFor(s, c)) return s;
    s = drawOne(s, c, run.events, false, true);
    if (s.phase === "GameOver") return s;
  }
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
  // A one-shot cost override is used up here: Overcharged Battery's free play,
  // and nothing else — a card that already cost nothing never burns it.
  if (costOverrideSpentBy(s, c, card)) {
    s = spendFreePlay(s);
  }

  // Each Turn, Play: you pay in *other* cards from your own hand. Red never pays for Gray.
  const from = run.events.length;
  s = discardFromHand(s, c, payment, run.events);
  if (payment.length > 0) {
    run.events.push({ type: "COST_PAID", character: c, cards: payment });
    s = { ...s, thisTurn: addPaid(s.thisTurn, c, payment.length) };
  }

  const after = playerOf(s, c);
  s = withPlayer(s, c, { ...after, hand: after.hand.filter((x) => x.id !== cardId) });
  s = { ...s, playZone: [...s.playZone, { owner: c, card }] };
  run.events.push({ type: "CARD_PLAYED", character: c, card });
  const to = run.events.length;
  trackEntries(run, from, to);
  run.settled = to;

  const behaviour = behaviourOf(card.name);
  if (behaviour?.exhaustX !== undefined) {
    s = settle(printedExhaust(s, c, behaviour.exhaustX, card.name, run), run);
  }
  const onPlay = behaviour?.onPlay;
  if (onPlay && s.phase !== "GameOver") {
    const step = onPlay(s, { card, character: c, zone: "playZone" });
    run.events.push(...step.events);
    s = settle(step.state, run);
  }
  return finishPlay(s, run, {
    events: run.events.slice(from, to),
    listeners: presentSince(s, run, from),
  });
}

/** Every card that can hear events and has been where it is since before the event at `index`. */
function presentSince(state: GameState, run: Run, index: number): readonly CardId[] {
  return listeners(state)
    .filter((ctx) => heldSince(run, ctx.card.id, index))
    .map((ctx) => ctx.card.id);
}

/**
 * Paying for a card and playing it are heard once its own effect is done. An
 * effect waiting on a question keeps them in the state until it is answered.
 */
function finishPlay(state: GameState, run: Run, play: UnfinishedPlay): GameState {
  if (state.phase === "GameOver") return state;
  if (state.pending) return { ...state, unfinishedPlay: play };
  const since = run.events.length;
  const hears = (id: CardId) => play.listeners.includes(id) && heldSince(run, id, since);
  let s = state;
  for (const event of play.events) {
    if (s.phase === "GameOver") return s;
    s = hear(s, run, event, hears);
  }
  return s;
}

/* ------------------------------------------------------------ Outcome */

/**
 * A challenge is met when any of its thresholds is met (rulebook, Outcome).
 * When more than one is, only the lowest-printed met one resolves — the last
 * threshold in printed order that the pool still meets.
 */
function resolvedThresholdOf(state: GameState, challenge: Challenge): Threshold | null {
  let resolved: Threshold | null = null;
  for (const t of challenge.thresholds) if (thresholdIsMet(state, t)) resolved = t;
  return resolved;
}

interface RoomOutcome {
  readonly met: readonly Threshold[];
  readonly cleared: boolean;
  readonly ascends: boolean;
  readonly effects: readonly RoomEffect[];
}

/**
 * Each Turn, Outcome: the room is checked once, when both characters have stopped playing,
 * the same way whatever the room's printed type. Every met challenge resolves, but only
 * through its one chosen threshold — a Hazard's higher tier replaces its lower tier's
 * outcome, on that challenge, rather than adding to it. A different challenge on the same
 * card is untouched by that and resolves on its own.
 */
function roomOutcome(state: GameState, room: Room): RoomOutcome {
  const met = room.challenges
    .map((c) => resolvedThresholdOf(state, c))
    .filter((t): t is Threshold => t !== null);

  if (met.length === 0) {
    // Each Turn, Outcome: if no challenge is met, the characters Flee. Resolve the Flee line.
    // A room with no Flee line of its own Flees empty-handed, and does not Clear.
    return { met, cleared: room.flee.clears, ascends: false, effects: room.flee.effects };
  }
  // A line that says "Flee this room for free" cannot un-Clear a room another
  // met challenge Cleared: Outcome's first sentence is that any met challenge Clears it.
  return {
    met,
    cleared: met.some((t) => t.clears),
    ascends: met.some((t) => t.ascends),
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

  let s: GameState = { ...state, activeRoom: null, phase: "Outcome" };
  if (outcome.cleared) {
    // A Cleared room is out of the game. Nobody counts that heap.
    run.events.push({ type: "ROOM_CLEARED", room });
    s = { ...s, cleared: [...s.cleared, room] };
  } else {
    run.events.push({ type: "ROOM_FLED", room });
  }

  s = {
    ...s,
    resolution: {
      effects: outcome.effects,
      roomEnded: outcome.cleared ? "Cleared" : "Fled",
      room,
      ascends: outcome.ascends,
    },
  };
  return drain(settle(s, run), run);
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
 * they take all of it — there is no splitting. A room's printed punishment can
 * Exhaust a character's deck and discard pile both empty, which ends the run
 * (rulebook, Going Down); the loop stops there rather than draining the rest
 * of a room's effects into a game that is already over.
 */
function drain(state: GameState, run: Run): GameState {
  let s = state;
  for (;;) {
    if (s.phase === "GameOver") return s;
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
      // Asking "who" is pointless when every standing character's reward
      // pool is already empty — either answer reveals nothing, so there is
      // no real choice to make.
      const moot = head.type === "RevealReward" && options.every((c) => s.pools[c].length === 0);
      if (options.length > 1 && !moot) {
        return { ...s, pending: { kind: "ChooseCharacter", prompt: promptFor(head), options, source: null } };
      }
      s = withEffects(s, [retarget(head, only), ...rest]);
      continue;
    }

    if (head.type === "RevealReward") {
      // Turn the top card of that character's reward pool face up, and take
      // it or skip it.
      const card = s.pools[head.who][0];
      s = withEffects(s, rest);
      if (!card) {
        run.events.push({ type: "REWARD_POOL_EMPTY", character: head.who });
        continue;
      }
      run.events.push({ type: "REWARD_REVEALED", character: head.who, card });
      s = settle(s, run);
      if (s.phase === "GameOver") return s;
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

    s = settle(applyEffect(s, head, head.who, run), run);
    if (s.phase === "GameOver") return s;
    s = withEffects(s, rest);
  }
}

/* ------------------------------------------------------------ Cleanup */

/**
 * Cleanup's own one-time steps run once, guarded by the move into `Cleanup`
 * itself — a held card's own Cleanup question (Spore Cloud) can pause the
 * rest of cleanup on a `pending` and this is re-entered to resume, already
 * in `Cleanup`, so nothing before that guard may run twice.
 */
function finishTurn(state: GameState, run: Run): GameState {
  let s: GameState = state;
  if (s.phase !== "Cleanup") {
    // The resolution stays readable through cleanup: a card that asks whether the
    // room was Cleared reads it there. It is cleared at the end of the turn.
    s = { ...s, phase: "Cleanup", pending: null };

    // The Play phase is over, so a free play nobody used is gone: it discounts a
    // card played this turn or nothing at all.
    s = clearFreePlays(s);

    run.events.push({ type: "CLEANUP_BEGAN" });
    s = settle(s, run);
    if (s.phase === "GameOver") return s;
  }
  return cleanupHands(s, run);
}

/**
 * A held card's own Cleanup line (Spore Cloud's discard). Read one hand at a
 * time so a question it asks can suspend here — every held Cleanup line is
 * written to stop asking once satisfied, so a resume simply starts this scan
 * over from Red's hand without repeating anything already settled.
 */
function cleanupHands(state: GameState, run: Run): GameState {
  let s = state;
  for (const c of CHARACTERS) {
    for (const card of playerOf(s, c).hand) {
      const onCleanup = behaviourOf(card.name)?.onCleanup;
      if (!onCleanup) continue;
      const step = onCleanup(s, { card, character: c, zone: "hand" });
      run.events.push(...step.events);
      s = settle(step.state, run);
      if (s.phase === "GameOver") return s;
      if (s.pending) return s;
    }
  }
  return finishCleanup(s, run);
}

/** The rest of Cleanup, once nothing held is still asking a question. */
function finishCleanup(state: GameState, run: Run): GameState {
  const resolution = state.resolution;
  const ascends = resolution?.ascends ?? false;
  let s = cleanupPiles(state, run);
  if (s.phase === "GameOver") return s;

  // Outcome: "then shuffle the room card back into the Floor deck."
  if (resolution?.roomEnded === "Fled") {
    const [deck, seed] = shuffle([...s.floorDeck, resolution.room], s.seed);
    run.events.push({ type: "FLED_RESHUFFLED", room: resolution.room });
    s = { ...s, floorDeck: deck, seed };
  }

  s = { ...s, resolution: null };
  run.events.push({ type: "TURN_ENDED", turn: s.turn });

  // Each Turn, Outcome: an outcome that says Ascend runs Cleanup as normal first, then ends
  // the floor — a met threshold triggers this, whichever room printed it.
  if (ascends) {
    run.events.push({ type: "FLOOR_CLEARED", floor: s.floor });
    if (s.floor >= TOP_FLOOR) {
      run.events.push({ type: "GAME_OVER", outcome: "Victory" });
      return { ...s, phase: "GameOver", outcome: "Victory", playZone: [] };
    }
    // Rulebook, Ascending: each character is offered three cards from their own pool.
    return {
      ...s,
      phase: "Ascend",
      playZone: [],
      offer: { Red: s.pools.Red.slice(0, 3), Gray: s.pools.Gray.slice(0, 3) },
    };
  }
  return { ...s, phase: "Turn Start", playZone: [] };
}

/** Each Turn, Cleanup: discard the entire play zone. The hand carries over untouched. */
function cleanupPiles(state: GameState, run: Run): GameState {
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
    run.events.push(...step.events);
    s = settle(step.state, run);
    if (s.phase === "GameOver") return s;
  }

  // Then the play zone itself.
  for (const c of CHARACTERS) {
    const played = s.playZone.filter((x) => x.owner === c).map((x) => x.card);
    for (const card of played) s = discard(s, c, card, "playZone", run.events);
  }
  return settle({ ...s, playZone: [] }, run);
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
  const play = state.unfinishedPlay;
  const cleared: GameState = { ...state, pending: null, unfinishedPlay: null };
  if (!ctx) return drain(cleared, run);

  const onChoice = behaviourOf(ctx.card.name)?.onChoice;
  if (!onChoice) throw new CorruptStateError(`${ctx.card.name} asked a question it cannot answer.`);
  const step = onChoice(answer, cleared, ctx);
  run.events.push(...step.events);
  let s = settle(step.state, run);
  if (play) {
    const stayed = new Set(presentSince(s, run, 0));
    s = finishPlay(s, run, { ...play, listeners: play.listeners.filter((id) => stayed.has(id)) });
  }
  return s.pending || s.phase === "GameOver" ? s : drain(s, run);
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
    // Bottom of its pool, as a declined ascension reward does.
    s = setPool(s, character, [...rest, card]);
    run.events.push({ type: "REWARD_DECLINED", character });
  }
  return drain(settle(s, run), run);
}

const setPool = (state: GameState, c: Character, cards: readonly Card[]): GameState =>
  c === "Red"
    ? { ...state, pools: { ...state.pools, Red: cards } }
    : { ...state, pools: { ...state.pools, Gray: cards } };

/* ------------------------------------------------------------ Rulebook, Ascending */

function ascend(state: GameState, red: AscendChoice, gray: AscendChoice, run: Run): GameState {
  let s = state;
  s = ascendOne(s, "Red", red, run);
  s = ascendOne(s, "Gray", gray, run);

  // Setup: build the next floor's deck, one card smaller than this one's.
  s = returnRoomsToSupply(s);
  s = buildFloor({ ...s, floor: s.floor + 1, offer: null }, run.events);
  return { ...s, phase: "Turn Start", playZone: [], thisTurn: emptyTurnRecord() };
}

/** Rulebook, Ascending, step 1: Shuffle your hand into your deck. */
function shuffleHandIntoDeck(state: GameState, c: Character, run: Run): GameState {
  const hand = playerOf(state, c).hand;
  const s = shuffleIntoDeck(state, c, hand, run.events);
  return withPlayer(s, c, { ...playerOf(s, c), hand: [] });
}

/**
 * Rulebook, Ascending, step 2: Settle your Stuff. Search deck and discard for
 * Stuff — the hand is empty by now, already shuffled into the deck in step 1.
 * A Good Stuff card shuffles into the Good Stuff pool unless kept by
 * Scrapping one other owned, non-Stuff card from deck or discard; a Bad
 * Stuff card stays unless shed the same way. A kept card is left exactly
 * where it was found. No heal: the discard pile is untouched apart from
 * Stuff settled out of it. No hand discard either — step 1 shuffles the
 * hand into the deck, it does not spend it.
 *
 * `stuffOnHand` and `locate` still search all three piles: harmless here,
 * since step 1 already emptied the hand, and it lets the same helpers back
 * `validateAscendChoice`, which runs before step 1 and so must still accept
 * a Stuff card or a payer sitting in hand — it will be deck by the time this
 * runs.
 */
function settleStuff(state: GameState, c: Character, choice: AscendChoice, run: Run): GameState {
  let s = state;
  for (const [pile, stuffCard] of stuffOnHand(state, c)) {
    const entry = choice.settle.find((e) => e.cardId === stuffCard.id);
    const payWith = entry?.payWith ?? null;

    if (payWith !== null) {
      const payer = locate(s, c, payWith);
      if (!payer) continue; // Already validated; defensive only.
      const [payerPile, payerCard] = payer;
      s = removeFrom(s, c, payerPile, payerCard.id);
      s = scrap(s, c, payerCard, run.events);
      if (stuffCard.kind === "bad_stuff") {
        // Paying sheds Bad Stuff: off to its pool.
        s = removeFrom(s, c, pile, stuffCard.id);
        s = { ...s, pools: { ...s.pools, badStuff: [...s.pools.badStuff, stuffCard] } };
      }
      // Paying for Good Stuff keeps it where it was found: nothing else moves.
    } else if (stuffCard.kind === "good_stuff") {
      // The default for Good Stuff: shuffle it into the Good Stuff pool.
      s = removeFrom(s, c, pile, stuffCard.id);
      s = { ...s, pools: { ...s.pools, goodStuff: [...s.pools.goodStuff, stuffCard] } };
    }
    // The default for Bad Stuff is to keep it: nothing moves.
  }
  // "...then shuffle your deck."
  return shuffleIntoDeck(s, c, [], run.events);
}

function ascendOne(state: GameState, c: Character, choice: AscendChoice, run: Run): GameState {
  let s = shuffleHandIntoDeck(state, c, run);
  s = settleStuff(s, c, choice, run);

  // Rulebook, Ascending, step 3: Choose a reward. Three cards from their own pool;
  // take one, shuffled into the deck, or decline. A declined card goes to the
  // bottom of its pool.
  const offered = state.offer?.[c] ?? [];
  const taken = offered.find((x) => x.id === choice.takeRewardId) ?? null;
  const returned = offered.filter((x) => x.id !== taken?.id);
  s = setPool(s, c, [...s.pools[c].slice(offered.length), ...returned]);
  if (taken) {
    run.events.push({ type: "REWARD_TAKEN", character: c, card: taken });
    s = shuffleIntoDeck(s, c, [taken], run.events);
  } else {
    run.events.push({ type: "REWARD_DECLINED", character: c });
  }
  return s;
}
