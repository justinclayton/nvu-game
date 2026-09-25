/* A fixed, small seed set, so this checks the aggregation logic itself and
 * not merely that a report can be produced. */

import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { greedyPolicy } from "./policy";
import { buildReport } from "./report";
import { simulate } from "./run";

const FROM = 1;
const SEEDS = 5;

describe("buildReport", () => {
  it("totals play, take and paid-as-cost events that match the run's own event log", () => {
    let playedTotal = 0;
    let takenTotal = 0;
    let paidTotal = 0;
    let ascendCommands = 0;
    for (let seed = FROM; seed < FROM + SEEDS; seed++) {
      simulate(seed, greedyPolicy, CARD_CONTENT, {
        onStep: (_before, command, _after, events) => {
          for (const event of events) {
            if (event.type === "CARD_PLAYED") playedTotal += 1;
            if (event.type === "REWARD_TAKEN" || event.type === "STUFF_TAKEN") takenTotal += 1;
            if (event.type === "COST_PAID") paidTotal += event.cards.length;
          }
          if (command.type === "ASCEND") ascendCommands += 1;
        },
      });
    }

    const report = buildReport(greedyPolicy, CARD_CONTENT, FROM, SEEDS);
    const reportPlayed = report.cards.reduce((sum, c) => sum + c.played, 0);
    const reportTaken = report.cards.reduce((sum, c) => sum + c.taken, 0);
    const reportPaid = report.cards.reduce((sum, c) => sum + c.paid, 0);

    expect(reportPlayed).toBe(playedTotal);
    expect(reportTaken).toBe(takenTotal);
    expect(reportPaid).toBe(paidTotal);
    expect(report.characters.Red.ascends).toBe(ascendCommands);
    expect(report.characters.Gray.ascends).toBe(ascendCommands);
  });

  it("lists Bad Stuff in the per-card table once a room has dealt it, so a Bad Stuff change is measurable", () => {
    const report = buildReport(greedyPolicy, CARD_CONTENT, FROM, SEEDS);
    const badStuffNames = new Set<string>(CARD_CONTENT.cards.filter((c) => c.kind === "bad_stuff").map((c) => c.name));
    const listed = report.cards.filter((c) => badStuffNames.has(c.name));
    expect(listed.length).toBeGreaterThan(0);
    expect(listed.some((c) => c.taken > 0)).toBe(true);
  });

  it("floor and end-reason counts each sum to the run count", () => {
    const report = buildReport(greedyPolicy, CARD_CONTENT, FROM, SEEDS);
    expect(report.runs).toBe(SEEDS);
    expect(report.floors.reduce((sum, f) => sum + f.runs, 0)).toBe(SEEDS);
    expect(report.endReasons.reduce((sum, e) => sum + e.runs, 0)).toBe(SEEDS);
    expect(report.wins).toBeGreaterThanOrEqual(0);
    expect(report.wins).toBeLessThanOrEqual(SEEDS);
    expect(report.winRate).toBeCloseTo(report.wins / SEEDS);
  });

  it("is deterministic: the same policy and seeds give the same report", () => {
    const a = buildReport(greedyPolicy, CARD_CONTENT, FROM, SEEDS);
    const b = buildReport(greedyPolicy, CARD_CONTENT, FROM, SEEDS);
    expect(b).toEqual(a);
  });

  it("tallies Exhausted and paid-as-cost losses that match the run's own event log", () => {
    let exhaustedTotal = 0;
    let paidAsCostTotal = 0;
    for (let seed = FROM; seed < FROM + SEEDS; seed++) {
      simulate(seed, greedyPolicy, CARD_CONTENT, {
        onStep: (_before, _command, _after, events) => {
          for (const event of events) {
            if (event.type === "CARD_EXHAUSTED") exhaustedTotal += 1;
            if (event.type === "COST_PAID") paidAsCostTotal += event.cards.length;
          }
        },
      });
    }

    const report = buildReport(greedyPolicy, CARD_CONTENT, FROM, SEEDS);
    const reportExhausted = report.floorLosses.reduce((sum, r) => sum + r.exhausted, 0);
    const reportPaidAsCost = report.floorLosses.reduce((sum, r) => sum + r.paidAsCost, 0);

    expect(reportExhausted).toBe(exhaustedTotal);
    expect(reportPaidAsCost).toBe(paidAsCostTotal);
  });
});
