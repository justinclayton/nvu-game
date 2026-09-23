/* A fixed sweep, so a rules change that breaks random play fails this test
 * instead of only showing up when someone happens to run `bin/nvu fuzz`
 * (design/cli-sim/spec.md, Checks: "Fuzz sweep"). */

import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { randomPolicy } from "./policy";
import { seedsFrom, simulate } from "./run";

describe("fuzz sweep", () => {
  it("plays fifty seeds of uniformly random legal play with no failure", () => {
    for (const seed of seedsFrom(1, 50)) {
      const run = simulate(seed, randomPolicy, CARD_CONTENT);
      const detail = `seed ${String(seed)}: ${run.rejection ?? run.stopped}, floor ${String(run.floor)}`;
      if (run.stopped === "NoLegalMove") {
        // Bands 2 and 3, and floor 10's fixed Stairwell, aren't in design/cards.yaml
        // yet (#122, #123, #125): a run that Ascends past floor 3 finds an empty
        // floor deck and stalls there. Anything short of that is a real bug.
        expect(run.floor, detail).toBeGreaterThanOrEqual(4);
        continue;
      }
      expect(run.stopped, detail).toBe("GameOver");
    }
  });
});
