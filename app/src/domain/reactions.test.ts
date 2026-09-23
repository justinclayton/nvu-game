/* When a card's reaction resolves: right where its event happens, finishing
 * everything it sets off before the next listener hears that event. Turn
 * Start's draws are the exception: their effects resolve after both players
 * have drawn. */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as Behaviours from "./cards/behaviours";
import type { CardBehaviour } from "./cards/behaviours";
import {
  card,
  eventTypes,
  must,
  pile,
  play,
  player,
  resetRig,
  rig,
  room,
} from "./__fixtures__/rig";
import type { CardId, Command, DomainEvent, GameState } from "./types";

/* A vanilla card given a listener that only writes down what it heard. */
const probe = vi.hoisted(() => ({
  name: "Pry Bar",
  heard: [] as { event: DomainEvent; red: number; gray: number }[],
}));

vi.mock("./cards/behaviours", async (importOriginal) => {
  const actual = await importOriginal<typeof Behaviours>();
  const listening: CardBehaviour = {
    onEvent(event, state) {
      probe.heard.push({ event, red: state.Red.hand.length, gray: state.Gray.hand.length });
      return { state, events: [] };
    },
  };
  return {
    ...actual,
    behaviourOf: (name: string) => (name === probe.name ? listening : actual.behaviourOf(name)),
  };
});

beforeEach(() => {
  resetRig();
  probe.heard.length = 0;
});

const playFree = (state: GameState, name: string): Command => {
  const found = state.Red.hand.find((x) => x.name === name);
  if (!found) throw new Error(`Red is not holding ${name}`);
  return { type: "PLAY_CARD", character: "Red", cardId: found.id, payWith: [] };
};

const coveringFire = () => ({ owner: "Gray" as const, card: card("Covering Fire") });

/** Just the draws, Exhausts and Down, as "who: what", in the order they happened. */
const drawsAndLosses = (events: readonly DomainEvent[]): readonly string[] =>
  events.flatMap((e) => {
    if (e.type === "CARD_DRAWN") return [`${e.character}: draw`];
    if (e.type === "CARD_EXHAUSTED") return [`${e.character}: exhaust`];
    if (e.type === "WENT_DOWN") return [`${e.character}: down`];
    return [];
  });

describe("a reaction resolves where its event happens", () => {
  it("Crowbar in the play zone: the bonus piece lands before Cleanup begins", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({
        deck: pile("Shove", 4),
        hand: [card("Crowbar"), card("Shove"), card("Shove")],
      }),
      Gray: player({ deck: pile("Duck Under", 4) }),
    });
    const [crowbar, shove, payment] = state.Red.hand.map((x) => x.id) as CardId[];
    const { events } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: crowbar as CardId, payWith: [] },
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: shove as CardId,
        payWith: [payment as CardId],
      },
      { type: "END_PLAY" },
    ]);
    const types = eventTypes(events);
    expect(types.filter((t) => t === "STUFF_TAKEN")).toHaveLength(2);
    expect(types.lastIndexOf("STUFF_TAKEN")).toBeLessThan(types.indexOf("CLEANUP_BEGAN"));
  });

  it("Covering Fire and My Head Is Quantum Spinning: Gray draws, then Red Exhausts", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      playZone: [coveringFire()],
      Red: player({
        deck: pile("Shove", 3),
        hand: [card("My Head Is Quantum Spinning"), card("Coil Of Cable")],
      }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const { state: next, events } = must(state, playFree(state, "Coil Of Cable"));
    const types = eventTypes(events);
    expect(drawsAndLosses(events)).toEqual(["Gray: draw", "Red: exhaust"]);
    expect(types.indexOf("CARD_PLAYED")).toBeLessThan(types.indexOf("CARD_DRAWN"));
    expect(next.Red.deck).toHaveLength(2);
  });
});

describe("a reaction's consequences resolve before the next listener hears the event", () => {
  it("two Covering Fires: the first draw's Exhaust lands before the second draw", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      playZone: [coveringFire(), coveringFire()],
      Red: player({
        deck: [card("Shove")],
        hand: [card("My Head Is Quantum Spinning"), card("Coil Of Cable")],
      }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const { state: next, events } = must(state, playFree(state, "Coil Of Cable"));
    // The first Exhaust takes Red's last card; the second finds nothing left.
    expect(drawsAndLosses(events)).toEqual([
      "Gray: draw",
      "Red: exhaust",
      "Gray: draw",
      "Red: down",
    ]);
    expect(next.phase).toBe("GameOver");
  });

  it("with Red's deck and discard empty, Red goes Down after the first draw and the second never happens", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      playZone: [coveringFire(), coveringFire()],
      Red: player({ hand: [card("My Head Is Quantum Spinning"), card("Coil Of Cable")] }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const { state: next, events } = must(state, playFree(state, "Coil Of Cable"));
    expect(drawsAndLosses(events)).toEqual(["Gray: draw", "Red: down"]);
    expect(next.Gray.hand).toHaveLength(1);
    expect(next.phase).toBe("GameOver");
  });
});

describe("Turn Start: 'Resolve effects triggered by these draws after both players have drawn'", () => {
  it("a held card hears every draw only once both hands hold 5", () => {
    const state = rig({
      phase: "Turn Start",
      floorDeck: [room("Sorting Room")],
      Red: player({ deck: pile("Shove", 6), hand: [card(probe.name)] }),
      Gray: player({ deck: pile("Duck Under", 6) }),
    });
    must(state, { type: "FLIP_ROOM" });
    const draws = probe.heard.filter((h) => h.event.type === "CARD_DRAWN");
    expect(draws).toHaveLength(9);
    for (const heard of draws) expect([heard.red, heard.gray]).toEqual([5, 5]);
  });
});
