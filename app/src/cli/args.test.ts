import { describe, expect, it } from "vitest";
import { parseRequest, UsageError } from "./args";

describe("parseRequest", () => {
  it("starts a new run from a seed, with no run file by default", () => {
    expect(parseRequest(["play", "new", "--seed", "7"])).toEqual({
      command: "play",
      action: { kind: "new", seed: 7 },
      run: null,
    });
    expect(parseRequest(["play", "new", "--seed", "7", "--run", "runs/x.json"])).toEqual({
      command: "play",
      action: { kind: "new", seed: 7 },
      run: "runs/x.json",
    });
  });

  it("refuses a new run with no seed", () => {
    expect(() => parseRequest(["play", "new"])).toThrow(UsageError);
  });

  it("reads flip and end", () => {
    expect(parseRequest(["play", "flip"])).toEqual({
      command: "play",
      action: { kind: "flip" },
      run: null,
    });
    expect(parseRequest(["play", "end", "--run", "r.json"])).toEqual({
      command: "play",
      action: { kind: "end" },
      run: "r.json",
    });
  });

  it("reads a card play, with and without payment", () => {
    expect(parseRequest(["play", "card", "Red", "CI"])).toEqual({
      command: "play",
      action: { kind: "card", character: "Red", name: "CI", pay: [] },
      run: null,
    });
    expect(parseRequest(["play", "card", "Red", "Charge In", "pay", "Rope", "Flare"])).toEqual({
      command: "play",
      action: { kind: "card", character: "Red", name: "Charge In", pay: ["Rope", "Flare"] },
      run: null,
    });
  });

  it("reads a scrap-for-stats play, requiring 'for' and a stat", () => {
    expect(parseRequest(["play", "scrap", "Red", "Pry Bar", "for", "Oomph"])).toEqual({
      command: "play",
      action: { kind: "scrap", character: "Red", name: "Pry Bar", stat: "Oomph" },
      run: null,
    });
    expect(() => parseRequest(["play", "scrap", "Red", "Pry Bar"])).toThrow(UsageError);
    expect(() => parseRequest(["play", "scrap", "Red"])).toThrow(UsageError);
    expect(() => parseRequest(["play", "scrap"])).toThrow(UsageError);
  });

  it("reads choose, with a character, cards, or none", () => {
    expect(parseRequest(["play", "choose", "Red"])).toEqual({
      command: "play",
      action: { kind: "choose", names: ["Red"] },
      run: null,
    });
    expect(parseRequest(["play", "choose", "Rope", "Flare"])).toEqual({
      command: "play",
      action: { kind: "choose", names: ["Rope", "Flare"] },
      run: null,
    });
    expect(parseRequest(["play", "choose", "none"])).toEqual({
      command: "play",
      action: { kind: "choose", names: [] },
      run: null,
    });
    expect(() => parseRequest(["play", "choose"])).toThrow(UsageError);
  });

  it("reads order", () => {
    expect(parseRequest(["play", "order", "Rope", "Flare", "Shove"])).toEqual({
      command: "play",
      action: { kind: "order", names: ["Rope", "Flare", "Shove"] },
      run: null,
    });
    expect(() => parseRequest(["play", "order"])).toThrow(UsageError);
  });

  it("reads take and skip for a reward reveal", () => {
    expect(parseRequest(["play", "take"])).toEqual({
      command: "play",
      action: { kind: "take" },
      run: null,
    });
    expect(parseRequest(["play", "skip"])).toEqual({
      command: "play",
      action: { kind: "skip" },
      run: null,
    });
  });

  it("reads take with a name or none as the Ascend reward answer", () => {
    expect(parseRequest(["play", "take", "Zen Mode"])).toEqual({
      command: "play",
      action: { kind: "takeAscend", name: "Zen Mode" },
      run: null,
    });
    expect(parseRequest(["play", "take", "none"])).toEqual({
      command: "play",
      action: { kind: "takeAscend", name: null },
      run: null,
    });
  });

  it("reads undo and show with no positionals", () => {
    expect(parseRequest(["play", "undo", "--run", "r.json"])).toEqual({
      command: "play",
      action: { kind: "undo" },
      run: "r.json",
    });
    expect(parseRequest(["play", "show"])).toEqual({
      command: "play",
      action: { kind: "show", events: null, table: false, moves: false },
      run: null,
    });
  });

  it("reads show's output flags", () => {
    expect(parseRequest(["play", "show", "--events", "5"])).toEqual({
      command: "play",
      action: { kind: "show", events: 5, table: false, moves: false },
      run: null,
    });
    expect(parseRequest(["play", "show", "--table"])).toEqual({
      command: "play",
      action: { kind: "show", events: null, table: true, moves: false },
      run: null,
    });
    expect(parseRequest(["play", "show", "--moves"])).toEqual({
      command: "play",
      action: { kind: "show", events: null, table: false, moves: true },
      run: null,
    });
  });

  it("reads a pile request", () => {
    expect(parseRequest(["play", "pile", "Red", "discard"])).toEqual({
      command: "play",
      action: { kind: "pile", character: "Red", pile: "discard" },
      run: null,
    });
    expect(() => parseRequest(["play", "pile", "Red"])).toThrow(UsageError);
  });

  it("reads a note's text", () => {
    expect(parseRequest(["play", "note", "the deck ran dry", "--run", "r.json"])).toEqual({
      command: "play",
      action: { kind: "note", text: "the deck ran dry" },
      run: "r.json",
    });
    expect(() => parseRequest(["play", "note"])).toThrow(UsageError);
  });

  it("refuses an unknown play move", () => {
    expect(() => parseRequest(["play", "dance"])).toThrow(UsageError);
    expect(() => parseRequest(["play"])).toThrow(UsageError);
  });

  it("prints a card's face with no run needed", () => {
    expect(parseRequest(["card", "Charge In"])).toEqual({ command: "card", name: "Charge In" });
    expect(() => parseRequest(["card"])).toThrow(UsageError);
  });

  it("replays the named file", () => {
    expect(parseRequest(["replay", "run.json", "--quiet"])).toEqual({
      command: "replay",
      file: "run.json",
      quiet: true,
    });
    expect(() => parseRequest(["replay"])).toThrow(UsageError);
  });

  it("reads a fuzz sweep, defaulting --from to 1", () => {
    expect(parseRequest(["fuzz", "--seeds", "20"])).toEqual({
      command: "fuzz",
      seeds: 20,
      from: 1,
    });
    expect(parseRequest(["fuzz", "--seeds", "5", "--from", "100"])).toEqual({
      command: "fuzz",
      seeds: 5,
      from: 100,
    });
    expect(() => parseRequest(["fuzz"])).toThrow(UsageError);
    expect(() => parseRequest(["fuzz", "--seeds", "0"])).toThrow(UsageError);
  });

  it("reads a sim run, defaulting --from to 1, --policy to greedy, and --json to false", () => {
    expect(parseRequest(["sim", "--seeds", "500"])).toEqual({
      command: "sim",
      seeds: 500,
      from: 1,
      policy: "greedy",
      json: false,
    });
    expect(parseRequest(["sim", "--seeds", "5", "--from", "100", "--policy", "random", "--json"])).toEqual({
      command: "sim",
      seeds: 5,
      from: 100,
      policy: "random",
      json: true,
    });
    expect(() => parseRequest(["sim"])).toThrow(UsageError);
    expect(() => parseRequest(["sim", "--seeds", "0"])).toThrow(UsageError);
    expect(() => parseRequest(["sim", "--seeds", "5", "--policy", "clever"])).toThrow(UsageError);
  });

  it("asks for help with nothing, help, or an unknown command", () => {
    expect(parseRequest([])).toEqual({ command: "help" });
    expect(parseRequest(["--help"])).toEqual({ command: "help" });
    expect(() => parseRequest(["dance"])).toThrow(UsageError);
  });
});
