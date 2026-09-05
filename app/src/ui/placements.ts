/* Where every card and room on the table is right now.
 *
 * The table is drawn as one layer of card sprites over a mat of empty slots. A
 * sprite is keyed by the card's id and positioned from its placement, so when
 * the state changes the same sprite is told a new place and travels there. This
 * module is the pure half of that: state in, one placement per physical card
 * out. Nothing here knows about pixels or React.
 */

import type { Card, Character, DomainEvent, GameState, Room } from "@domain/types";

export type ZoneId =
  | "floor"
  | "room"
  | "fled"
  | "cleared"
  | "good"
  | "bad"
  | "scrap"
  | "red-rewards"
  | "gray-rewards"
  | "red-deck"
  | "gray-deck"
  | "red-hand"
  | "gray-hand"
  | "red-play"
  | "gray-play"
  | "red-exhaust"
  | "gray-exhaust";

/** A stack is one pile; a row lays its cards out side by side. */
export type ZoneShape = "stack" | "row";

export const ZONE_SHAPE: Readonly<Record<ZoneId, ZoneShape>> = {
  floor: "stack",
  room: "stack",
  fled: "stack",
  cleared: "stack",
  good: "stack",
  bad: "stack",
  scrap: "stack",
  "red-rewards": "stack",
  "gray-rewards": "stack",
  "red-deck": "stack",
  "gray-deck": "stack",
  "red-hand": "row",
  "gray-hand": "row",
  "red-play": "row",
  "gray-play": "row",
  "red-exhaust": "stack",
  "gray-exhaust": "stack",
};

/** Piles that cards are tossed onto rather than squared up, so each one settles askew. */
export const LOOSE_ZONES: ReadonlySet<ZoneId> = new Set<ZoneId>([
  "fled",
  "cleared",
  "scrap",
  "red-exhaust",
  "gray-exhaust",
]);

interface Placed {
  readonly id: string;
  readonly zone: ZoneId;
  /** 0 is the bottom of a stack, or the left end of a row. */
  readonly index: number;
  /** How many share the zone. */
  readonly count: number;
  readonly faceUp: boolean;
}

export type Placement =
  | (Placed & { readonly kind: "card"; readonly card: Card; readonly owner: Character | null })
  | (Placed & { readonly kind: "room"; readonly room: Room });

const zoneOf = (c: Character, part: "deck" | "hand" | "play" | "exhaust" | "rewards"): ZoneId =>
  `${c.toLowerCase() as "red" | "gray"}-${part}`;

export function placements(state: GameState): readonly Placement[] {
  const out: Placement[] = [];

  /* Decks and pools keep their top at index 0; discards are appended, so their
   * top is last. `topFirst` says which, and the stack index counts from the
   * bottom either way so the top card is always drawn last. */
  const cards = (
    list: readonly Card[],
    zone: ZoneId,
    opts: {
      readonly topFirst: boolean;
      readonly faceUp: boolean | ((card: Card, isTop: boolean) => boolean);
      readonly owner?: Character;
    },
  ) => {
    const count = list.length;
    list.forEach((card, i) => {
      const index = opts.topFirst ? count - 1 - i : i;
      const isTop = index === count - 1;
      out.push({
        kind: "card",
        id: card.id,
        card,
        zone,
        index,
        count,
        faceUp: typeof opts.faceUp === "function" ? opts.faceUp(card, isTop) : opts.faceUp,
        owner: opts.owner ?? card.owner,
      });
    });
  };

  const rooms = (list: readonly Room[], zone: ZoneId, topFirst: boolean, faceUp: boolean) => {
    const count = list.length;
    list.forEach((room, i) => {
      out.push({
        kind: "room",
        id: room.id,
        room,
        zone,
        index: topFirst ? count - 1 - i : i,
        count,
        faceUp,
      });
    });
  };

  rooms(state.floorDeck, "floor", true, false);
  if (state.activeRoom) rooms([state.activeRoom], "room", true, true);
  rooms(state.fled, "fled", false, true);
  rooms(state.cleared, "cleared", false, true);

  for (const c of ["Red", "Gray"] as const) {
    const p = state[c];
    cards(p.deck, zoneOf(c, "deck"), { topFirst: true, faceUp: false, owner: c });
    cards(p.hand, zoneOf(c, "hand"), { topFirst: false, faceUp: true, owner: c });
    cards(p.exhaust, zoneOf(c, "exhaust"), { topFirst: false, faceUp: true, owner: c });
    cards(
      state.playZone.filter((x) => x.owner === c).map((x) => x.card),
      zoneOf(c, "play"),
      { topFirst: false, faceUp: true, owner: c },
    );
    // §6: a revealed reward is the top of the pool, turned face up while the
    // character decides.
    const revealing = state.pending?.kind === "TakeReward" && state.pending.character === c;
    cards(state.pools[c], zoneOf(c, "rewards"), {
      topFirst: true,
      faceUp: (_card, isTop) => revealing && isTop,
      owner: c,
    });
  }

  // Stuff is drawn blind from its pool (rulebook §6), so the pools stay face down.
  cards(state.pools.goodStuff, "good", { topFirst: true, faceUp: false });
  cards(state.pools.badStuff, "bad", { topFirst: true, faceUp: false });
  cards(state.scrapyard, "scrap", { topFirst: false, faceUp: true });

  return out;
}

/**
 * The order the last command moved things in, as a delay per card id, so a
 * cleanup that Exhausts five cards sends them one after another rather than all
 * at once. A card the events never name moves with no delay.
 */
export function moveDelays(
  events: readonly DomainEvent[],
  stepMs = 90,
): ReadonlyMap<string, number> {
  const order = new Map<string, number>();
  const note = (id: string) => {
    if (!order.has(id)) order.set(id, order.size);
  };
  for (const e of events) {
    if ("room" in e) note(e.room.id);
    if ("card" in e) note(e.card.id);
    if ("cards" in e) for (const c of e.cards) note(c.id);
    if ("price" in e) for (const c of e.price) note(c.id);
  }
  const delays = new Map<string, number>();
  for (const [id, i] of order) delays.set(id, Math.min(i, 8) * stepMs);
  return delays;
}
