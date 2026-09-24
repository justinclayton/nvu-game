/* When a card's reaction resolves: right where its event happens, finishing
 * everything it sets off before the next listener hears that event. Two
 * exceptions: Turn Start's draws are heard after both players have drawn, and
 * playing a card is heard after that card's own effect. */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as Behaviours from "./cards/behaviours";
import type { CardBehaviour } from "./cards/behaviours";
import {
  card,
  eventTypes,
  free,
  handCard,
  must,
  names,
  pile,
  play,
  player,
  resetRig,
  rig,
  room,
} from "./__fixtures__/rig";
import type { CardId, Character, Command, DomainEvent, GameState } from "./types";

/* A vanilla card given a listener that only writes down what it heard. */
const probe = vi.hoisted(() => ({
  name: "Pry Bar",
  heard: [] as { event: DomainEvent; id: CardId; red: number; gray: number }[],
}));

vi.mock("./cards/behaviours", async (importOriginal) => {
  const actual = await importOriginal<typeof Behaviours>();
  const listening: CardBehaviour = {
    onEvent(event, state, ctx) {
      probe.heard.push({
        event,
        id: ctx.card.id,
        red: state.Red.hand.length,
        gray: state.Gray.hand.length,
      });
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

/** Play the named card, paying with the first copies of the other cards named. */
const playPaying = (
  state: GameState,
  character: Character,
  name: string,
  payWith: readonly string[],
): Command => {
  const hand = state[character].hand;
  const found = hand.find((x) => x.name === name);
  if (!found) throw new Error(`${character} is not holding ${name}`);
  const used = new Set<CardId>([found.id]);
  const payment = payWith.map((payName) => {
    const payer = hand.find((x) => x.name === payName && !used.has(x.id));
    if (!payer) throw new Error(`${character} has no spare ${payName} to pay with`);
    used.add(payer.id);
    return payer.id;
  });
  return { type: "PLAY_CARD", character, cardId: found.id, payWith: payment };
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
    const crowbar = handCard(state, "Red", "Crowbar");
    const [shove, payment] = state.Red.hand.filter((c) => c.name === "Shove");
    if (!shove || !payment) throw new Error("Red is not holding two Shoves");
    const { events } = play(state, [
      { type: "PLAY_CARD", character: "Red", cardId: crowbar.id, payWith: [] },
      {
        type: "PLAY_CARD",
        character: "Red",
        cardId: shove.id,
        payWith: [payment.id],
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
    const { state: next, events } = must(state, free("Red", handCard(state, "Red", "Coil Of Cable").id));
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
    const { state: next, events } = must(state, free("Red", handCard(state, "Red", "Coil Of Cable").id));
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
    const { state: next, events } = must(state, free("Red", handCard(state, "Red", "Coil Of Cable").id));
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

describe("playing a card is heard after the card's own effect", () => {
  it("Covering Fire, Red plays Reckless: Red Exhausts 3, then Gray draws", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      playZone: [coveringFire()],
      Red: player({ deck: pile("Shove", 5), hand: [card("Reckless"), card("Shove")] }),
      Gray: player({ deck: pile("Duck Under", 3) }),
    });
    const { events } = must(state, playPaying(state, "Red", "Reckless", ["Shove"]));
    expect(drawsAndLosses(events)).toEqual([
      "Red: exhaust",
      "Red: exhaust",
      "Red: exhaust",
      "Gray: draw",
    ]);
  });

  describe("I Know Kung Fu, Gray plays Here, Catch", () => {
    const heldHereCatch = () =>
      rig({
        phase: "Play",
        activeRoom: room("Sorting Room"),
        Red: player({ deck: pile("Shove", 3) }),
        Gray: player({
          deck: [card("Crowbar"), ...pile("Duck Under", 2)],
          hand: [
            card("I Know Kung Fu"),
            card("Here, Catch"),
            card("Coil Of Cable"),
            card("Duck Under"),
          ],
        }),
      });

    it("the question offers only the Stuff held before the draw", () => {
      const state = heldHereCatch();
      const { state: asking, events } = must(
        state,
        playPaying(state, "Gray", "Here, Catch", ["Duck Under"]),
      );
      expect(drawsAndLosses(events)).toEqual([]);
      expect(asking.pending?.kind).toBe("ChooseCards");
      expect(asking.pending?.kind === "ChooseCards" && names(asking.pending.options)).toEqual([
        "Coil Of Cable",
      ]);
    });

    it("Gray draws once the question is answered, and the pause survives a save", () => {
      const state = heldHereCatch();
      const asking = must(state, playPaying(state, "Gray", "Here, Catch", ["Duck Under"])).state;
      const saved = JSON.parse(JSON.stringify(asking)) as GameState;
      const coil = handCard(asking, "Gray", "Coil Of Cable");
      const { state: next, events } = must(saved, {
        type: "CHOOSE_CARDS",
        cardIds: [coil.id],
      });
      const types = eventTypes(events);
      expect(types.indexOf("CARD_TO_HAND")).toBeLessThan(types.indexOf("CARD_DRAWN"));
      expect(drawsAndLosses(events)).toEqual(["Gray: draw"]);
      expect(names(next.Red.hand)).toEqual(["Coil Of Cable"]);
      expect(names(next.Gray.hand)).toEqual(["I Know Kung Fu", "Crowbar"]);
      expect(next.unfinishedPlay).toBeNull();
    });
  });

  it("I Know Kung Fu and My Head Is Quantum Spinning, Gray plays Grav Harness and draws from it: its draw and Exhaust come first", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 4), hand: [card("My Head Is Quantum Spinning")] }),
      Gray: player({
        deck: pile("Duck Under", 3),
        hand: [card("I Know Kung Fu"), card("Grav Harness"), ...pile("Duck Under", 2)],
      }),
    });
    const played = must(
      state,
      playPaying(state, "Gray", "Grav Harness", ["Duck Under", "Duck Under"]),
    );
    expect(drawsAndLosses(played.events)).toEqual([]);
    const { state: next, events } = must(played.state, {
      type: "CHOOSE_CHARACTER",
      character: "Gray",
    });
    expect(drawsAndLosses(events)).toEqual([
      "Gray: draw",
      "Red: exhaust",
      "Gray: draw",
      "Red: exhaust",
    ]);
    expect(next.Gray.hand).toHaveLength(3);
    expect(next.Red.deck).toHaveLength(2);
  });

  const playedHeard = () => probe.heard.filter((h) => h.event.type === "CARD_PLAYED");

  it("a held card hears the play after the effect's question is answered", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 3), hand: [card(probe.name)] }),
      Gray: player({
        deck: pile("Duck Under", 3),
        hand: [card("Grav Harness"), ...pile("Duck Under", 2)],
      }),
    });
    const played = must(
      state,
      playPaying(state, "Gray", "Grav Harness", ["Duck Under", "Duck Under"]),
    );
    expect(playedHeard()).toEqual([]);
    must(played.state, { type: "CHOOSE_CHARACTER", character: "Gray" });
    expect(playedHeard().map((h) => h.gray)).toEqual([1]);
  });

  it("a card the effect moves out of its zone does not hear the play", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 3) }),
      Gray: player({
        deck: pile("Duck Under", 3),
        hand: [card("Here, Catch"), card(probe.name), card("Duck Under")],
      }),
    });
    const asking = must(state, playPaying(state, "Gray", "Here, Catch", ["Duck Under"])).state;
    const pryBar = handCard(asking, "Gray", probe.name);
    const { state: next } = must(asking, { type: "CHOOSE_CARDS", cardIds: [pryBar.id] });
    expect(names(next.Red.hand)).toEqual([probe.name]);
    expect(playedHeard()).toEqual([]);
  });

  it("a card the effect brings into hand does not hear the play", () => {
    const state = rig({
      phase: "Play",
      activeRoom: room("Sorting Room"),
      Red: player({ deck: pile("Shove", 3) }),
      Gray: player({
        deck: [card(probe.name)],
        hand: [card("Grav Harness"), ...pile("Duck Under", 2)],
      }),
    });
    const played = must(
      state,
      playPaying(state, "Gray", "Grav Harness", ["Duck Under", "Duck Under"]),
    );
    const { state: next } = must(played.state, { type: "CHOOSE_CHARACTER", character: "Gray" });
    expect(names(next.Gray.hand)).toEqual([probe.name]);
    expect(playedHeard()).toEqual([]);
  });
});
