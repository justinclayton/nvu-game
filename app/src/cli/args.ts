/* The command line, parsed into a typed request. */

import { parseArgs } from "node:util";

export type PlayAction =
  | { readonly kind: "new"; readonly seed: number }
  | { readonly kind: "move"; readonly index: number }
  | { readonly kind: "undo" }
  | { readonly kind: "note"; readonly text: string }
  | { readonly kind: "show" };

export interface PlayRequest {
  readonly command: "play";
  readonly action: PlayAction;
  /** Null means the default, `runs/<seed>.json` — only resolvable for `new`. */
  readonly run: string | null;
}

export interface ReplayRequest {
  readonly command: "replay";
  readonly file: string;
  /** Only the verdict, not the transcript. */
  readonly quiet: boolean;
}

export interface FuzzRequest {
  readonly command: "fuzz";
  readonly seeds: number;
  readonly from: number;
}

export interface HelpRequest {
  readonly command: "help";
}

export type Request = PlayRequest | ReplayRequest | FuzzRequest | HelpRequest;

export class UsageError extends Error {}

export const USAGE = `North vs Up — the CLI. The same rules engine as the web game, one shell call at a time.

  bin/nvu play new  --seed N [--run FILE]
  bin/nvu play move N        [--run FILE]
  bin/nvu play undo          [--run FILE]
  bin/nvu play note "text"   [--run FILE]
  bin/nvu play show          [--run FILE]
  bin/nvu replay FILE [--quiet]
  bin/nvu fuzz --seeds N [--from SEED]
  bin/nvu web
  bin/nvu help

play    the run file is the only state; every call loads it, applies one move, writes it back
        (--run defaults to runs/<seed>.json, which only "new" can resolve on its own)
replay  fold a run file back through the engine and print its transcript
fuzz    play N seeds of uniformly random legal play under a command budget; prints failures only
web     run the web game's dev server
`;

const integer = (name: string, raw: string | undefined, fallback: number): number => {
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n)) throw new UsageError(`--${name} wants a whole number, not "${raw}".`);
  return n;
};

const requiredInteger = (name: string, raw: string | undefined): number => {
  if (raw === undefined) throw new UsageError(`--${name} is required.`);
  return integer(name, raw, 0);
};

function parsePlay(rest: readonly string[]): PlayRequest {
  const [action, ...actionRest] = rest;
  if (action === undefined) throw new UsageError("play wants a subcommand: new, move, undo, note or show.");

  switch (action) {
    case "new": {
      const { values } = parseArgs({
        args: [...actionRest],
        options: { seed: { type: "string" }, run: { type: "string" } },
        strict: true,
      });
      return {
        command: "play",
        action: { kind: "new", seed: requiredInteger("seed", values.seed) },
        run: values.run ?? null,
      };
    }
    case "move": {
      const { values, positionals } = parseArgs({
        args: [...actionRest],
        options: { run: { type: "string" } },
        allowPositionals: true,
        strict: true,
      });
      const raw = positionals[0];
      const n = raw === undefined ? Number.NaN : Number(raw);
      if (!Number.isInteger(n)) throw new UsageError(`move wants the number of a listed move, not "${raw ?? ""}".`);
      return { command: "play", action: { kind: "move", index: n }, run: values.run ?? null };
    }
    case "undo": {
      const { values } = parseArgs({
        args: [...actionRest],
        options: { run: { type: "string" } },
        strict: true,
      });
      return { command: "play", action: { kind: "undo" }, run: values.run ?? null };
    }
    case "note": {
      const { values, positionals } = parseArgs({
        args: [...actionRest],
        options: { run: { type: "string" } },
        allowPositionals: true,
        strict: true,
      });
      const text = positionals[0];
      if (text === undefined) throw new UsageError("note wants the text to write into the log.");
      return { command: "play", action: { kind: "note", text }, run: values.run ?? null };
    }
    case "show": {
      const { values } = parseArgs({
        args: [...actionRest],
        options: { run: { type: "string" } },
        strict: true,
      });
      return { command: "play", action: { kind: "show" }, run: values.run ?? null };
    }
    default:
      throw new UsageError(`Unknown "play ${action}". Choose new, move, undo, note or show.`);
  }
}

export function parseRequest(argv: readonly string[]): Request {
  const [command, ...rest] = argv;
  if (command === undefined || command === "help" || command === "--help" || command === "-h") {
    return { command: "help" };
  }

  switch (command) {
    case "play":
      return parsePlay(rest);

    case "replay": {
      const { values, positionals } = parseArgs({
        args: [...rest],
        options: { quiet: { type: "boolean" } },
        allowPositionals: true,
        strict: true,
      });
      const file = positionals[0];
      if (!file) throw new UsageError("replay wants the run file to replay.");
      return { command: "replay", file, quiet: values.quiet ?? false };
    }

    case "fuzz": {
      const { values } = parseArgs({
        args: [...rest],
        options: { seeds: { type: "string" }, from: { type: "string" } },
        strict: true,
      });
      const seeds = requiredInteger("seeds", values.seeds);
      if (seeds < 1) throw new UsageError("--seeds wants at least 1.");
      return { command: "fuzz", seeds, from: integer("from", values.from, 1) };
    }

    default:
      throw new UsageError(`Unknown command "${command}".`);
  }
}
