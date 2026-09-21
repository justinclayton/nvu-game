/* A simulated run ends, replays, and never throws. */

import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { replay } from "@application/session";
import { execute } from "@domain/engine";
import { createInitialState } from "@domain/setup";
import { greedyPolicy, POLICIES, randomPolicy } from "./policy";
import { seedsFrom, simulate, tallyOf } from "./run";

const SEEDS = seedsFrom(1, 12);

describe("simulate", () => {
  it.each(POLICIES.map((p) => [p.name, p] as const))(
    "%s finishes every seeded run",
    (_name, policy) => {
      for (const seed of SEEDS) {
        const run = simulate(seed, policy, CARD_CONTENT);
        expect(run.stopped, `seed ${String(seed)}: ${run.rejection ?? ""}`).toBe("GameOver");
        expect(run.outcome).not.toBe("Unfinished");
        expect(run.commandCount).toBe(run.commands.length);
      }
    },
  );

  it("is deterministic: the same seed and policy give the same command log", () => {
    const a = simulate(7, randomPolicy, CARD_CONTENT);
    const b = simulate(7, randomPolicy, CARD_CONTENT);
    expect(b.commands).toEqual(a.commands);
    expect(b.final).toEqual(a.final);
  });

  it("replays through the session layer to the same final state", () => {
    for (const seed of SEEDS.slice(0, 4)) {
      const run = simulate(seed, greedyPolicy, CARD_CONTENT);
      const replayed = replay({ seed, commands: run.commands }, CARD_CONTENT);
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

  it("tallies rooms, downs and plays off the events", () => {
    const run = simulate(3, greedyPolicy, CARD_CONTENT);
    const cleared = Object.values(run.tally.roomsCleared).reduce((a, b) => a + b, 0);
    const fled = Object.values(run.tally.roomsFled).reduce((a, b) => a + b, 0);
    expect(cleared + fled).toBe(run.turn);
    expect(run.tally.down.Red === null && run.tally.down.Gray === null).toBe(
      run.outcome === "Victory",
    );
    const plays = Object.values(run.tally.cardsPlayed).reduce((a, b) => a + b, 0);
    expect(plays).toBe(run.commands.filter((c) => c.type === "PLAY_CARD").length);
  });

  it("tallyOf over a replayed event log agrees with the run's own tally", () => {
    const run = simulate(5, greedyPolicy, CARD_CONTENT);
    // Rebuild the events by folding again.
    const [initial, opening] = createInitialState(5, CARD_CONTENT);
    let state = initial;
    const events = [...opening];
    for (const command of run.commands) {
      const result = execute(state, command);
      if (!result.ok) throw new Error(result.reason.message);
      state = result.state;
      events.push(...result.events);
    }
    expect(tallyOf(events)).toEqual(run.tally);
  });
});
