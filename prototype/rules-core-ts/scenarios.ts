/* Guided walkthroughs: the cases that are hard to reason about on paper.
 *
 * PROTOTYPE — see README.md. Each scenario builds a deliberately rigged state
 * and then steps through it, so you can watch one rule at a time and say
 * whether it feels right. Nothing here is a test; there are no assertions and
 * nothing fails. The point is to look at it.
 */

import { buildContent, copies, type Content, type RawCard } from "./cards.ts";
import { buildFloor, initContent } from "./engine.ts";
import type { Card, Character, Command, GameState, PlayerState, Room } from "./types.ts";

export interface Step {
  readonly note: string;              // what to watch for, before it happens
  readonly command?: Command;         // the command this step issues
}

export interface Scenario {
  readonly id: string;
  readonly title: string;
  readonly question: string;          // the thing this walkthrough is here to settle
  readonly setup: (c: Content) => GameState;
  readonly steps: readonly Step[];
}

/* ------------------------------------------------------------- state rigging */

let raw: RawCard[] = [];
export function useRaw(list: RawCard[]): Content {
  raw = list;
  return initContent(list);
}

/** One physical copy of a printed card, by name. Throws rather than guess. */
export function card(name: string): Card {
  const found = raw.find((c) => c.name === name);
  if (!found) throw new Error(`No card named ${name} in design/cards.yaml`);
  return copies(found, 1)[0];
}

export function roomNamed(content: Content, name: string): Room {
  const all = [...content.enemyRooms, ...content.hazardRooms, ...content.stuffRooms];
  const found = all.find((r) => r.name === name);
  if (!found) throw new Error(`No room named ${name} in design/cards.yaml`);
  return found;
}

function player(over: Partial<PlayerState> = {}): PlayerState {
  return { deck: [], hand: [], exhaust: [], down: false, lastStand: false, drewThisTurn: 0, ...over };
}

/** A bare state with nothing in it, so a scenario only has to fill in what it means. */
export function rig(content: Content, over: Partial<GameState> = {}): GameState {
  const base: GameState = {
    seed: 1,
    floor: 1,
    turn: 1,
    phase: "Draw",
    floorDeck: [],
    activeRoom: null,
    cleared: [],
    fled: [],
    red: player(),
    gray: player(),
    playZone: [],
    scrapyard: [],
    pools: {
      red: content.redRewards,
      gray: content.grayRewards,
      goodStuff: content.goodStuff,
      badStuff: content.badStuff,
    },
    offer: null,
    outcome: null,
  };
  return { ...base, ...over };
}

const deckOf = (name: string, n: number) => Array.from({ length: n }, () => card(name));

/* ------------------------------------------------------------------ the list */

export function scenarios(): Scenario[] {
  return [
    {
      id: "hand-cap",
      title: "A full hand costs you a card",
      question:
        "Section 5 says a full hand does not excuse the minimum draw — the card goes straight to the exhaust pile. Does that read as a punishment or as a shrug?",
      setup: (c) =>
        rig(c, {
          activeRoom: roomNamed(c, "Sorting Room"),
          red: player({ deck: deckOf("Shove", 6), hand: deckOf("Shove", 5) }),
          gray: player({ deck: deckOf("Duck Under", 6) }),
        }),
      steps: [
        {
          note: "Red already holds 5. Watch the drawn card go past the hand into the exhaust pile — Red is one card of health poorer and no better armed.",
          command: { type: "DRAW", character: "Red" },
        },
        { note: "Gray draws normally, for contrast.", command: { type: "DRAW", character: "Gray" } },
        { note: "Both have met the minimum, so the draw phase can end.", command: { type: "END_DRAW" } },
      ],
    },

    {
      id: "last-stand",
      title: "Into last stand and back out",
      question:
        "Clearing a room in last stand shuffles your hand and play zone back, minus 2. Is that a real escape or a formality?",
      setup: (c) =>
        rig(c, {
          activeRoom: roomNamed(c, "Sump Crawler"),
          floorDeck: [roomNamed(c, "Sorting Room")],
          red: player({ deck: [card("Charge In")], hand: [] }),
          gray: player({ deck: deckOf("Pick The Lock", 4) }),
        }),
      steps: [
        {
          note: "Red draws their last card. The deck is now empty; last stand activates as the last step of this draw phase.",
          command: { type: "DRAW", character: "Red" },
        },
        { note: "Gray draws to have something to spend.", command: { type: "DRAW", character: "Gray" } },
        { note: "", command: { type: "DRAW", character: "Gray" } },
        { note: "", command: { type: "END_DRAW" } },
        {
          note: "Red plays Charge In for free — in last stand every card in hand costs nothing. Oomph 3 against the Sump Crawler's Oomph 5.",
          command: { type: "PLAY_CARD", character: "Red", cardId: "", payWith: [] },
        },
        {
          note: "Gray adds Pick The Lock. It is Scramble, so it does nothing here — but watch it become part of Red's escape anyway. It is not Red's card, so it will not.",
          command: { type: "PLAY_CARD", character: "Gray", cardId: "", payWith: [] },
        },
        {
          note: "End the play phase. The room is NOT cleared, Red is in last stand, and the team is fleeing. Section 9: fleeing in last stand puts Red Down.",
          command: { type: "END_PLAY", fleeTarget: "Gray" },
        },
      ],
    },

    {
      id: "last-stand-escape",
      title: "The escape that actually works",
      question:
        "Same state, but the room is cleared. The play zone shuffles into the deck and 2 cards off the top are the price. Watch what comes back and what does not.",
      setup: (c) =>
        rig(c, {
          activeRoom: roomNamed(c, "Sorting Room"),
          floorDeck: [roomNamed(c, "Sump Crawler")],
          red: player({ deck: [], hand: deckOf("Shove", 4), lastStand: true }),
          gray: player({ deck: deckOf("Duck Under", 4) }),
        }),
      steps: [
        {
          note: "Red begins the turn in last stand: empty deck, cards in hand. A character in last stand does not draw — only Gray does.",
          command: { type: "DRAW", character: "Gray" },
        },
        { note: "", command: { type: "END_DRAW" } },
        {
          note: "Red plays free — every card in a last-stand hand costs nothing.",
          command: { type: "PLAY_CARD", character: "Red", cardId: "", payWith: [] },
        },
        {
          note: "A second free card. The escape shuffles the play zone into the deck and then exhausts 2 off the top, so clearing with fewer than 2 played would send Red Down instead.",
          command: { type: "PLAY_CARD", character: "Red", cardId: "", payWith: [] },
        },
        {
          note: "And a third, so something is left over after the price.",
          command: { type: "PLAY_CARD", character: "Red", cardId: "", payWith: [] },
        },
        {
          note: "End play. The Stuff room clears either way, Red was in last stand, so the 3 played cards shuffle into Red's deck and 2 are exhausted off the top. Count the deck: 1.",
          command: { type: "END_PLAY" },
        },
      ],
    },

    {
      id: "stuff-is-scrapped",
      title: "Spending Stuff spends it for good",
      question:
        "Section 7: spent Stuff exhausts like anything else, but at ascension it moves to the Scrapyard instead of shuffling back. So a Pry Bar burned as fuel sits in the exhaust pile looking recoverable — and is not, unless the Scrap tax saves it. Does that read at the table?",
      setup: (c) =>
        rig(c, {
          phase: "Play",
          activeRoom: roomNamed(c, "Sump Crawler"),
          red: player({
            deck: deckOf("Shove", 5),
            hand: [card("Charge In"), card("Pry Bar")],
          }),
          gray: player({ deck: deckOf("Duck Under", 5) }),
        }),
      steps: [
        {
          note: "Red plays Charge In (Cost 1) and pays with the Pry Bar. The Pry Bar lands in Red's exhaust pile like any card — but it will move to the Scrapyard at ascension, not back into the deck.",
          command: { type: "PLAY_CARD", character: "Red", cardId: "", payWith: [] },
        },
        { note: "End play and flee — the point was where the Pry Bar went.", command: { type: "END_PLAY", fleeTarget: "Gray" } },
      ],
    },

    {
      id: "hazard-settles-late",
      title: "Nothing resolves until play is declared over",
      question:
        "Section 5: the room is checked once, at the end of the play phase, and every met challenge resolves. On a Hazard that means you can keep pushing for the reward tier past the clear line. Does the single check feel right at the table?",
      setup: (c) =>
        rig(c, {
          phase: "Play",
          activeRoom: roomNamed(c, "Collapsed Stair"),
          red: player({ deck: deckOf("Shove", 5) }),
          gray: player({
            deck: deckOf("Duck Under", 5),
            hand: [card("Pick The Lock"), card("Coil of Cable"), card("Duck Under"), card("Duck Under")],
          }),
        }),
      steps: [
        {
          note: "Collapsed Stair clears at Scramble 2 and pays a reward at Scramble 5. Gray plays Pick The Lock: Scramble 3. Past the low tier — and nothing happens. The room is still in the zone.",
          command: { type: "PLAY_CARD", character: "Gray", cardId: "", payWith: [] },
        },
        {
          note: "Gray plays the Coil of Cable (Scramble 3, Cost 0) to reach 6, over the reward line.",
          command: { type: "PLAY_CARD", character: "Gray", cardId: "", payWith: [] },
        },
        {
          note: "NOW declare play over. Both tiers are met and the higher one pays; the excess evaporates and nothing carries. The reward tops Gray's deck.",
          command: { type: "END_PLAY", rewardTarget: "Gray" },
        },
      ],
    },

    {
      id: "stuff-room-sides",
      title: "A Stuff room reads each character's own side",
      question:
        "Tool Cage asks Red for Scramble and Gray for Oomph — each measured only against their own side of the play zone. So the shared pool is not shared here. Does one room reading the zone differently from every other room hold up?",
      setup: (c) =>
        rig(c, {
          phase: "Play",
          activeRoom: roomNamed(c, "Tool Cage"),
          red: player({ deck: deckOf("Shove", 5), hand: [card("Shove")] }),
          gray: player({ deck: deckOf("Duck Under", 5), hand: [card("Duck Under")] }),
        }),
      steps: [
        {
          note: "Red plays Shove: Oomph 1. The shared pool now has Oomph 1 — but Tool Cage wants Scramble from Red, so Red still gets nothing.",
          command: { type: "PLAY_CARD", character: "Red", cardId: "", payWith: [] },
        },
        {
          note: "Gray plays Duck Under: Scramble 1. Team pool is now Oomph 1 AND Scramble 1, which looks like both lines are met.",
          command: { type: "PLAY_CARD", character: "Gray", cardId: "", payWith: [] },
        },
        {
          note: "End play. Neither line pays: Red's own side has no Scramble and Gray's own side has no Oomph. The room clears anyway and the team walks out empty-handed.",
          command: { type: "END_PLAY" },
        },
      ],
    },

    {
      id: "down-and-out",
      title: "Down, and everything landing on the survivor",
      question:
        "A Down character takes no punishments, so every Flee line falls on whoever is left. Does the survivor's spiral feel like tension or like a formality on the way to the loss?",
      setup: (c) =>
        rig(c, {
          phase: "Play",
          activeRoom: roomNamed(c, "Ruptured Coolant Line"),
          floorDeck: [roomNamed(c, "Sump Crawler")],
          red: player({ deck: [], hand: [], down: true }),
          gray: player({ deck: deckOf("Duck Under", 2), hand: [card("Duck Under")] }),
        }),
      steps: [
        {
          note: "Red is Down: empty deck AND empty hand. Gray plays alone and cannot reach Scramble 4.",
          command: { type: "PLAY_CARD", character: "Gray", cardId: "", payWith: [] },
        },
        {
          note: "Flee. The line says both characters Exhaust 1 from deck — but Red is Down and takes nothing, so it all lands on Gray. Gray also takes the Bad Stuff.",
          command: { type: "END_PLAY" },
        },
        { note: "Next turn begins. If both were Down there would be no flip at all.", command: { type: "FLIP_ROOM" } },
      ],
    },

    {
      id: "ascend",
      title: "Ascending: full heal, Scrap tax, reward",
      question:
        "Clearing the Enemy room is a total reset except for the Scrapyard. Is the Scrap tax — keep one exhausted piece of Stuff by scrapping another exhausted card in its place — a choice anyone would actually make?",
      setup: (c) => {
        const s = rig(c, {
          phase: "Play",
          activeRoom: roomNamed(c, "Sump Crawler"),
          floor: 1,
          red: player({
            deck: deckOf("Shove", 2),
            hand: [card("Charge In"), card("Charge In"), card("Pry Bar")],
            exhaust: deckOf("Shove", 4),
          }),
          gray: player({ deck: deckOf("Duck Under", 3), exhaust: deckOf("Duck Under", 5) }),
        });
        return s;
      },
      steps: [
        {
          note: "Red plays Charge In (Oomph 3), paying with the other Charge In.",
          command: { type: "PLAY_CARD", character: "Red", cardId: "", payWith: [] },
        },
        {
          note: "Not enough: the Sump Crawler wants Oomph 5 and the pool is 3. Nothing happens yet.",
        },
        {
          note: "End play. Red flees, then the turn ends. (Rig the numbers in the free-play tab if you want to see the kill.)",
          command: { type: "END_PLAY", fleeTarget: "Red" },
        },
      ],
    },
  ];
}

/**
 * The scenarios above leave cardId empty on purpose: the ids are minted at
 * setup time and the scenario cannot know them. This fills each PLAY_CARD in
 * against the live state, choosing the first card the acting character can
 * legally play, so a walkthrough survives a change to the card list.
 */
export function resolveStep(state: GameState, step: Step): Command | null {
  const cmd = step.command;
  if (!cmd) return null;
  if (cmd.type !== "PLAY_CARD" || cmd.cardId !== "") return cmd;

  const p = cmd.character === "Red" ? state.red : state.gray;
  const free = p.lastStand;
  for (const c of p.hand) {
    const cost = free ? 0 : c.cost;
    const fodder = p.hand
      .filter((x) => x.id !== c.id && !/may not be Exhausted to pay a cost/i.test(x.text))
      .sort((a, b) => a.oomph + a.scramble - (b.oomph + b.scramble))
      .slice(0, cost);
    if (fodder.length < cost) continue;
    return { ...cmd, cardId: c.id, payWith: fodder.map((x) => x.id) };
  }
  return null;
}

export { buildContent, buildFloor };
