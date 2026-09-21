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

  it("reads a move number", () => {
    expect(parseRequest(["play", "move", "3", "--run", "r.json"])).toEqual({
      command: "play",
      action: { kind: "move", index: 3 },
      run: "r.json",
    });
    expect(() => parseRequest(["play", "move", "many"])).toThrow(UsageError);
  });

  it("reads undo and show with no positionals", () => {
    expect(parseRequest(["play", "undo", "--run", "r.json"])).toEqual({
      command: "play",
      action: { kind: "undo" },
      run: "r.json",
    });
    expect(parseRequest(["play", "show"])).toEqual({
      command: "play",
      action: { kind: "show" },
      run: null,
    });
  });

  it("reads a note's text", () => {
    expect(parseRequest(["play", "note", "the deck ran dry", "--run", "r.json"])).toEqual({
      command: "play",
      action: { kind: "note", text: "the deck ran dry" },
      run: "r.json",
    });
    expect(() => parseRequest(["play", "note"])).toThrow(UsageError);
  });

  it("refuses an unknown play subcommand", () => {
    expect(() => parseRequest(["play", "dance"])).toThrow(UsageError);
    expect(() => parseRequest(["play"])).toThrow(UsageError);
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

  it("asks for help with nothing, help, or an unknown command", () => {
    expect(parseRequest([])).toEqual({ command: "help" });
    expect(parseRequest(["--help"])).toEqual({ command: "help" });
    expect(() => parseRequest(["dance"])).toThrow(UsageError);
  });
});
