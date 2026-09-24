import { describe, expect, it } from "vitest";

import type { DomainEvent } from "@domain/types";
import { lineKindOf, logLines, tailEvents } from "./narrate";

const events: readonly DomainEvent[] = [
  { type: "FLOOR_BUILT", floor: 1, rooms: 10 },
  { type: "CLEANUP_BEGAN" },
  { type: "TURN_ENDED", turn: 1 },
];

describe("logLines", () => {
  it("is the event lines when nothing was typed", () => {
    expect(logLines(events).map((l) => l.text)).toEqual([
      "Floor 1 is built: 10 rooms.",
      "Cleanup.",
      "— end of turn 1 —",
    ]);
  });

  it("puts a note between the two lines it was typed between", () => {
    const lines = logLines(events, [{ at: 2, text: "why now?" }]);
    expect(lines.map((l) => l.text)).toEqual([
      "Floor 1 is built: 10 rooms.",
      "Cleanup.",
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
      "Cleanup.",
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
