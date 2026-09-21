import { describe, expect, it } from "vitest";
import { parseRequest, UsageError } from "./args";

describe("parseRequest", () => {
  it("defaults a sim to 100 greedy games from seed 1", () => {
    expect(parseRequest(["sim"])).toEqual({
      command: "sim",
      games: 100,
      seed: 1,
      policy: "greedy",
      json: false,
      saveRuns: null,
      maxCommands: 5000,
      topCards: 12,
    });
  });

  it("reads every sim flag", () => {
    const req = parseRequest([
      "sim",
      "--games",
      "7",
      "--seed",
      "42",
      "--policy",
      "random",
      "--json",
      "--save-runs",
      "out",
      "--max-commands",
      "99",
      "--top-cards",
      "3",
    ]);
    expect(req).toEqual({
      command: "sim",
      games: 7,
      seed: 42,
      policy: "random",
      json: true,
      saveRuns: "out",
      maxCommands: 99,
      topCards: 3,
    });
  });

  it("refuses a games count that is not a whole positive number", () => {
    expect(() => parseRequest(["sim", "--games", "0"])).toThrow(UsageError);
    expect(() => parseRequest(["sim", "--games", "many"])).toThrow(UsageError);
  });

  it("plays from a fresh seed unless one is given", () => {
    expect(parseRequest(["play"])).toEqual({
      command: "play",
      seed: null,
      save: null,
      policy: null,
    });
    expect(parseRequest(["play", "--seed", "9", "--save", "runs", "--policy", "greedy"])).toEqual({
      command: "play",
      seed: 9,
      save: "runs",
      policy: "greedy",
    });
  });

  it("replays the named file", () => {
    expect(parseRequest(["replay", "run.json", "--quiet"])).toEqual({
      command: "replay",
      file: "run.json",
      quiet: true,
    });
    expect(() => parseRequest(["replay"])).toThrow(UsageError);
  });

  it("asks for help with nothing, help, or an unknown command", () => {
    expect(parseRequest([])).toEqual({ command: "help" });
    expect(parseRequest(["--help"])).toEqual({ command: "help" });
    expect(() => parseRequest(["dance"])).toThrow(UsageError);
  });
});
