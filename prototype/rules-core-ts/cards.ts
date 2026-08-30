/* Turns the generated card list into engine types.
 *
 * PROTOTYPE — see README.md.
 *
 * design/cards.yaml is the one place a card is written down (ticket 25). This
 * file never holds a card; it reads prototype/cards.js, which `make build`
 * generates from the YAML, and reshapes it into Card and Room. If a number
 * looks wrong, change the YAML and run `make build`, not this file.
 */

import type { Card, Character, FleeLine, Room, Stat, Threshold } from "./types.ts";

/** The shape of one entry in the generated prototype/cards.js. */
export interface RawCard {
  name: string;
  set: "official" | "proposed";
  kind: string;
  owner?: Character;
  rarity?: "Fine" | "Cool" | "Woah";
  starter?: boolean;
  cost: number | null;
  power?: number;
  scramble?: number;
  conditional_stat?: boolean;
  hold?: boolean;
  text?: string;
  thresholds?: { stat: Stat; value: number; outcome: string }[];
  flee?: string;
}

export interface Content {
  readonly redStarters: readonly Card[];
  readonly grayStarters: readonly Card[];
  readonly redRewards: readonly Card[];
  readonly grayRewards: readonly Card[];
  readonly goodStuff: readonly Card[];
  readonly badStuff: readonly Card[];
  readonly enemyRooms: readonly Room[];
  readonly hazardRooms: readonly Room[];
  readonly stuffRooms: readonly Room[];
}

let counter = 0;
/** Every physical copy of a card needs its own id; the name alone is not unique. */
function mint(raw: RawCard): Card {
  counter += 1;
  return {
    id: `${raw.name}#${counter}`,
    name: raw.name,
    kind: raw.kind === "player" ? "player" : raw.kind === "good_stuff" ? "good_stuff" : "bad_stuff",
    owner: raw.owner,
    rarity: raw.rarity,
    cost: raw.cost ?? 0,
    power: raw.power ?? 0,
    scramble: raw.scramble ?? 0,
    hold: raw.hold === true,
    starter: raw.starter === true,
    text: raw.text ?? "",
  };
}

/** Make `n` distinct physical copies of the same printed card. */
export function copies(raw: RawCard, n: number): Card[] {
  return Array.from({ length: n }, () => mint(raw));
}

/**
 * The Flee lines in design/cards.yaml are printed prose. The engine wants
 * structure, so parse the shapes the card list actually prints and
 * refuse anything else rather than silently dropping a punishment.
 */
export function parseFlee(text: string | undefined): FleeLine | null {
  if (!text) return null;
  const who: "one" | "both" = /^both/i.test(text) ? "both" : "one";
  const exhaust = text.match(/Exhausts? (\d+) from deck/i);
  const badStuff = /takes a Bad Stuff/i.test(text);
  if (!exhaust && !badStuff) {
    throw new Error(`Unparsed Flee line: "${text}"`);
  }
  return {
    who,
    deckExhaust: exhaust ? Number(exhaust[1]) : 0,
    badStuffToOne: badStuff,
  };
}

/** "Red takes 2 instead." -> { recipient: "Red", stuffCount: 2 } */
function parseStuffOutcome(outcome: string): { recipient?: Character; stuffCount?: number } {
  const m = outcome.match(/^(Red|Gray) takes (\d+)/i);
  if (!m) return {};
  return { recipient: m[1] as Character, stuffCount: Number(m[2]) };
}

function toRoom(raw: RawCard, kind: Room["kind"], index: number): Room {
  const thresholds: Threshold[] = (raw.thresholds ?? []).map((t) => ({
    stat: t.stat,
    value: t.value,
    outcome: t.outcome,
    clears: kind !== "stuff",
    reward: /reveals reward/i.test(t.outcome),
    ...parseStuffOutcome(t.outcome),
  }));
  return {
    id: `${raw.name}#room${index}`,
    name: raw.name,
    kind,
    thresholds,
    flee: kind === "stuff" ? null : parseFlee(raw.flee),
  };
}

/**
 * Conditional stats. The rulebook says these are recalculated every time the
 * pool is read, so they are functions of state rather than numbers on a card.
 * Only the known conditionals are implemented; everything else falls back
 * to what the card prints.
 */
export type StatFn = (ctx: {
  redPlayed: number;
  grayPlayed: number;
  badStuffPlayed: number;
  handOf: (c: Character) => readonly Card[];
}) => { power: number; scramble: number };

export const CONDITIONALS: Record<string, StatFn> = {
  "In Step": ({ redPlayed }) => ({ power: 2 * redPlayed, scramble: 0 }),
  "One Man's Junk": ({ badStuffPlayed }) =>
    badStuffPlayed > 0 ? { power: 2, scramble: 2 } : { power: 0, scramble: 0 },
  "Both Barrels": ({ grayPlayed }) => ({ power: grayPlayed > 0 ? 5 : 2, scramble: 0 }),
};

/** Cards that print a rule against being spent as fuel (Torn Seal). */
export function canPayCost(card: Card): boolean {
  return !/may not be Exhausted to pay a cost/i.test(card.text);
}

/**
 * Build the whole content set from the generated list.
 *
 * Starting decks are 12 cards each, which the rulebook marks NOT YET RULED and
 * calls scaffolding (ticket 10). Copies of the two starters are repeated to
 * reach 12 — also scaffolding.
 */
export function buildContent(raw: RawCard[]): Content {
  counter = 0; // ids must be stable across builds, or a seeded run stops replaying
  const players = raw.filter((c) => c.kind === "player");
  const starters = (owner: Character) => players.filter((c) => c.owner === owner && c.starter);
  const rewards = (owner: Character) => players.filter((c) => c.owner === owner && !c.starter);

  const deckOf = (owner: Character): Card[] => {
    const s = starters(owner);
    if (s.length === 0) throw new Error(`No starter cards for ${owner}`);
    const out: Card[] = [];
    for (let i = 0; i < 12; i++) out.push(...copies(s[i % s.length], 1));
    return out;
  };

  const stuff = (kind: string) => raw.filter((c) => c.kind === kind).flatMap((c) => copies(c, 4));

  const rooms = (kind: string, roomKind: Room["kind"]) =>
    raw.filter((c) => c.kind === kind).map((c, i) => toRoom(c, roomKind, i));

  return {
    redStarters: deckOf("Red"),
    grayStarters: deckOf("Gray"),
    redRewards: rewards("Red").flatMap((c) => copies(c, 1)),
    grayRewards: rewards("Gray").flatMap((c) => copies(c, 1)),
    goodStuff: stuff("good_stuff"),
    badStuff: stuff("bad_stuff"),
    enemyRooms: rooms("enemy_room", "enemy"),
    hazardRooms: rooms("hazard_room", "hazard"),
    stuffRooms: rooms("stuff_room", "stuff"),
  };
}
