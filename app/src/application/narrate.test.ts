import { describe, expect, it } from "vitest";

import type { Card, DomainEvent } from "@domain/types";
import { describeEvent, lineKindOf, logLines, tailEvents } from "./narrate";

const events: readonly DomainEvent[] = [
  { type: "FLOOR_BUILT", floor: 1, rooms: 10 },
  { type: "CLEANUP_BEGAN" },
  { type: "TURN_ENDED", turn: 1 },
];

describe("logLines", () => {
  it("is the event lines when nothing was typed", () => {
    expect(logLines(events).map((l) => l.text)).toEqual([
      "Floor 1 is built: 10 rooms.",
      "Cleanup phase starts.",
      "— end of turn 1 —",
    ]);
  });

  it("puts a note between the two lines it was typed between", () => {
    const lines = logLines(events, [{ at: 2, text: "why now?" }]);
    expect(lines.map((l) => l.text)).toEqual([
      "Floor 1 is built: 10 rooms.",
      "Cleanup phase starts.",
      "why now?",
      "— end of turn 1 —",
    ]);
    expect(lines.map(lineKindOf)).toEqual(["floor_built", "cleanup_began", "note", "turn_ended"]);
  });

  it("keeps two notes typed at the same point in the order they were typed", () => {
    const lines = logLines(events, [
      { at: 3, text: "first" },
      { at: 3, text: "second" },
    ]);
    expect(lines.slice(-2).map((l) => l.text)).toEqual(["first", "second"]);
  });
});

describe("tailEvents", () => {
  it("counts only event lines toward N, not notes among them", () => {
    // A long note sits among the last 2 events; it must not spend one of
    // their 2 slots, or a long note would fill the window on its own.
    const lines = logLines(events, [{ at: 2, text: "a very long note\nspanning lines" }]);
    expect(tailEvents(lines, 2).map((l) => l.text)).toEqual([
      "Cleanup phase starts.",
      "a very long note\nspanning lines",
      "— end of turn 1 —",
    ]);
  });

  it("returns every line when there are fewer than N events", () => {
    const lines = logLines(events);
    expect(tailEvents(lines, 10)).toEqual(lines);
  });

  it("prints nothing for N <= 0", () => {
    expect(tailEvents(logLines(events), 0)).toEqual([]);
  });
});

describe("describeEvent", () => {
  const crowbar = { id: "c1", name: "Crowbar", kind: "stuff" } as unknown as Card;

  it("pluralises the shuffled-back count", () => {
    const shuffled = (n: number): DomainEvent => ({
      type: "CARDS_SHUFFLED_IN",
      character: "Red",
      cards: Array.from({ length: n }, (_, i) => ({ id: `c${String(i)}`, name: "Crowbar", kind: "stuff" }) as unknown as Card),
    });
    expect(describeEvent(shuffled(1))).toBe("Red shuffles 1 card back in.");
    expect(describeEvent(shuffled(3))).toBe("Red shuffles 3 cards back in.");
  });

  it("pluralises the reshuffled discard count", () => {
    const reshuffled = (n: number): DomainEvent => ({ type: "DISCARD_RESHUFFLED", character: "Gray", cards: n });
    expect(describeEvent(reshuffled(1))).toContain("(1 card).");
    expect(describeEvent(reshuffled(4))).toContain("(4 cards).");
  });

  it("names the card whose text caused an effect", () => {
    const event: DomainEvent = {
      type: "CARD_EXHAUSTED",
      character: "Gray",
      card: crowbar,
      source: "Corrosive Acid",
    };
    expect(describeEvent(event)).toBe("Corrosive Acid triggers: Gray Exhausts Crowbar.");
  });

  it("names the room whose text caused an effect", () => {
    const event: DomainEvent = {
      type: "CARD_EXHAUSTED",
      character: "Red",
      card: crowbar,
      source: "Ticking Time Bomb",
    };
    expect(describeEvent(event)).toBe("Ticking Time Bomb triggers: Red Exhausts Crowbar.");
  });

  it("says nothing of a cause when a player acted on their own", () => {
    expect(describeEvent({ type: "CARD_PLAYED", character: "Red", card: crowbar })).toBe(
      "Red plays Crowbar.",
    );
  });

  it("names the cause of a Good Stuff reveal", () => {
    const event: DomainEvent = {
      type: "GOOD_STUFF_REVEALED",
      character: "Red",
      cards: [crowbar],
      source: "Security Turnstile",
    };
    expect(describeEvent(event)).toBe("Security Turnstile triggers: Red reveals Good Stuff: Crowbar.");
  });

  it("marks where each phase starts and ends", () => {
    const phases = ["Turn Start", "Play", "Outcome", "Cleanup"] as const;
    expect(
      phases.flatMap((phase) => [
        describeEvent({ type: "PHASE_STARTED", phase }),
        describeEvent({ type: "PHASE_ENDED", phase }),
      ]),
    ).toEqual([
      "Turn Start phase starts.",
      "Turn Start phase ends.",
      "Play phase starts.",
      "Play phase ends.",
      "Outcome phase starts.",
      "Outcome phase ends.",
      "Cleanup phase starts.",
      "Cleanup phase ends.",
    ]);
  });
});
