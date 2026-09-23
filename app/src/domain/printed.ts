/* The printed face of every card and every room.
 *
 * design/cards.yaml is the one place a card is written down. `make build` turns
 * it into src/content/cards.generated.ts, which is shaped exactly like the types
 * here. The prose a room prints — its threshold outcomes and its Flee line — is
 * parsed into structure by the generator, so nothing in the app ever reads a
 * sentence.
 */

/** Rulebook, About the game. Both characters are always in play. */
export type Character = "Red" | "Gray";

/** Rulebook, Card anatomy: Character cards. The two stat keywords at level 1. */
export type Stat = "Oomph" | "Scramble";

/** Rulebook, Card anatomy: Character cards. Purely printed: no rule anywhere reads it. */
export type Rarity = "Fine" | "Cool" | "Woah";

/** The type line of a player card (rulebook, Card anatomy: Character cards). There is no neutral card but Stuff. */
export type CardKind = "player" | "good_stuff" | "bad_stuff";

/** The type line of a room card (rulebook, Card anatomy: Room Cards). */
export type RoomKind = "room" | "stairwell";

/** Rooms and Stairwells pool by band: floors 1–3, 4–6, 7–9 (rulebook Setup, "Floor deck"). */
export type Band = 1 | 2 | 3;

/** Whether a card is ratified or still a proposal. Only official cards gate the build. */
export type CardSet = "official" | "proposed";

/**
 * One thing a room does to the characters. A room's Flee line and each of its
 * threshold outcomes are lists of these, so the engine never parses prose.
 *
 * `who: "one"` means the team chooses which character, and that character
 * takes all of it. There is no splitting.
 */
export type EffectTarget = Character | "one" | "both";

export type RoomEffect =
  | { readonly type: "ExhaustFromDeck"; readonly who: EffectTarget; readonly amount: number }
  | { readonly type: "DealBadStuff"; readonly who: EffectTarget }
  | { readonly type: "TakeGoodStuff"; readonly who: EffectTarget; readonly count: number }
  | { readonly type: "RevealReward"; readonly who: EffectTarget };

/**
 * One `threshold: outcome` line (rulebook, Card anatomy: Room Cards). Every
 * threshold, on every room, is read the same way: against the shared pool
 * (rulebook, Outcome). A room's `Room`/`Stairwell` type line decides which
 * pool it is drawn from, not how its thresholds resolve.
 */
export interface Threshold {
  readonly stat: Stat;
  readonly value: number;
  /** The printed prose, kept for display. No rule reads it. */
  readonly outcome: string;
  /** Meeting this line Clears the room (rulebook, Outcome) unless it's `fleeFree`. */
  readonly clears: boolean;
  /** "Flee this room for free" — the room is Fled, but its Flee line does not resolve. */
  readonly fleeFree: boolean;
  /** The outcome says `Ascend`: the Floor is cleared instead of running Cleanup. */
  readonly ascends: boolean;
  readonly effects: readonly RoomEffect[];
}

/**
 * The Flee line every room prints (rulebook, Card anatomy: Room Cards). No Stuff room in
 * design/cards.yaml prints one of its own, so the generator supplies
 * "Leave empty-handed." for display; it Flees like any other room, with no
 * Clear and no effects.
 */
export interface FleeLine {
  readonly text: string;
  /** Whether this room's Flee text Clears it. A Stuff room's never does. */
  readonly clears: boolean;
  readonly effects: readonly RoomEffect[];
}

/** A player card or a piece of Stuff, exactly as printed (rulebook, Card anatomy). */
export interface CardFace {
  readonly name: string;
  readonly set: CardSet;
  readonly kind: CardKind;
  /** Player cards only; Stuff belongs to no character. */
  readonly owner: Character | null;
  readonly rarity: Rarity | null;
  readonly starter: boolean;
  /** How many physical copies the card list prints. */
  readonly count: number;
  readonly cost: number;
  readonly oomph: number;
  readonly scramble: number;
  /** The stat lives in the text instead of a field, so a behaviour computes it. */
  readonly conditionalStat: boolean;
  readonly text: string;
}

/** A room card, exactly as printed (rulebook, Card anatomy: Room Cards). */
export interface RoomFace {
  readonly name: string;
  readonly set: CardSet;
  readonly kind: RoomKind;
  /** Which floors' pool the card is drawn from (rulebook Setup, "Floor deck"). */
  readonly band: Band;
  /** The printed flavor line. Empty until a card is given one. */
  readonly flavor: string;
  readonly count: number;
  readonly thresholds: readonly Threshold[];
  readonly flee: FleeLine;
}

/** Everything design/cards.yaml prints, sorted by what the engine does with it. */
export interface CardContent {
  readonly meta: { readonly updated: string };
  readonly cards: readonly CardFace[];
  readonly rooms: readonly RoomFace[];
}
