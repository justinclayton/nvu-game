/* A simulated run ends, replays, and never throws. */

import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { loadSession } from "@application/session";
import { randomPolicy } from "./policy";
import { seedsFrom, simulate } from "./run";

const SEEDS = seedsFrom(1, 12);

describe("simulate", () => {
  it("finishes every seeded run", () => {
    for (const seed of SEEDS) {
      const run = simulate(seed, randomPolicy, CARD_CONTENT);
      const detail = `seed ${String(seed)}: ${run.rejection ?? run.stopped}`;
      // A band's own pool can run dry once its Stairwell is spent (design
      // says nothing about this), so a random run may also stall with no
      // legal move left, not only win or lose.
      expect(["GameOver", "NoLegalMove"], detail).toContain(run.stopped);
      if (run.stopped === "GameOver") expect(run.outcome).not.toBe("Unfinished");
      expect(run.commandCount).toBe(run.commands.length);
    }
  });

  it("is deterministic: the same seed and policy give the same command log", () => {
    const a = simulate(7, randomPolicy, CARD_CONTENT);
    const b = simulate(7, randomPolicy, CARD_CONTENT);
    expect(b.commands).toEqual(a.commands);
    expect(b.final).toEqual(a.final);
  });

  it("replays through the session layer to the same final state", () => {
    for (const seed of SEEDS.slice(0, 4)) {
      const run = simulate(seed, randomPolicy, CARD_CONTENT);
      const replayed = loadSession({ seed, commands: run.commands }, CARD_CONTENT).getState().state;
      expect(replayed).toEqual(run.final);
    }
  });

  it("stops at the command budget and says so", () => {
    const run = simulate(1, randomPolicy, CARD_CONTENT, { maxCommands: 5 });
    expect(run.stopped).toBe("Budget");
    expect(run.outcome).toBe("Unfinished");
    expect(run.commandCount).toBe(5);
  });

  it("reports a policy's illegal choice instead of throwing", () => {
    const stubborn = {
      name: "stubborn",
      choose: () => [{ type: "END_PLAY" } as const, 0] as const,
    };
    const run = simulate(1, stubborn, CARD_CONTENT);
    expect(run.stopped).toBe("Rejected");
    expect(run.rejection).toContain("END_PLAY");
    expect(run.commandCount).toBe(0);
  });
});
