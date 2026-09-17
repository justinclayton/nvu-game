import { describe, expect, it } from "vitest";

import type { DomainEvent } from "@domain/types";
import { lineKindOf, logLines } from "./narrate";

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
