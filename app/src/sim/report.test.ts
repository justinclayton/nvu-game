import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { greedyPolicy } from "./policy";
import { aggregate, formatReport, table } from "./report";
import { seedsFrom, simulate } from "./run";

describe("aggregate", () => {
  const results = seedsFrom(1, 6).map((s) => simulate(s, greedyPolicy, CARD_CONTENT));
  const report = aggregate(results);

  it("counts every run exactly once", () => {
    expect(report.games).toBe(6);
    const { Victory, Defeat, Unfinished } = report.outcomes;
    expect(Victory + Defeat + Unfinished).toBe(6);
    expect(Object.values(report.floorReached).reduce((a, b) => a + b, 0)).toBe(6);
    expect(report.winRate).toBe(Victory / 6);
  });

  it("adds the per-room and per-card counts across runs", () => {
    const cleared = results.reduce(
      (n, r) => n + Object.values(r.tally.roomsCleared).reduce((a, b) => a + b, 0),
      0,
    );
    expect(report.rooms.reduce((n, r) => n + r.cleared, 0)).toBe(cleared);
    const plays = results.reduce(
      (n, r) => n + Object.values(r.tally.cardsPlayed).reduce((a, b) => a + b, 0),
      0,
    );
    expect(report.cardsPlayed.reduce((n, c) => n + c.plays, 0)).toBe(plays);
    for (const row of report.rooms) {
      if (row.clearRate !== null)
        expect(row.clearRate).toBe(row.cleared / (row.cleared + row.fled));
    }
  });

  it("handles no runs at all", () => {
    const empty = aggregate([]);
    expect(empty.games).toBe(0);
    expect(empty.winRate).toBe(0);
    expect(formatReport(empty)).toContain("0 run(s)");
  });

  it("prints the headline numbers", () => {
    const text = formatReport(report, { topCards: 3 });
    expect(text).toContain("6 run(s), policy greedy");
    expect(text).toContain("floor reached:");
    expect(text).toContain("rooms:");
    expect(text.split("cards played (top 3):")[1]?.trim().split("\n")).toHaveLength(3);
  });
});

describe("table", () => {
  it("pads text left and numbers right", () => {
    expect(
      table([
        ["a", 1],
        ["bbb", 22],
      ]),
    ).toBe("a     1\nbbb  22");
  });
});
