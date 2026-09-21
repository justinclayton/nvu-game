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
      expect(run.stopped, `seed ${String(seed)}: ${run.rejection ?? run.stopped}`).toBe("GameOver");
    }
  });
});
