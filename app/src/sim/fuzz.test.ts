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
        // The rulebook says nothing about a band's Room pool running short:
        // once a band's own Stairwell is spent, that band can never Ascend
        // again, so a long enough run empties its floor deck and stalls
        // there — on any floor. Anything else stopping the run is a bug.
        continue;
      }
      expect(run.stopped, detail).toBe("GameOver");
    }
  });
});
