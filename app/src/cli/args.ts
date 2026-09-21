/* The command line, parsed into a typed request. A wrong default here silently
 * changes a study, so this file has its own test. */

import { parseArgs } from "node:util";

export interface SimRequest {
  readonly command: "sim";
  readonly games: number;
  readonly seed: number;
  readonly policy: string;
  readonly json: boolean;
  /** Write every run's `.json` export into this directory. */
  readonly saveRuns: string | null;
  readonly maxCommands: number;
  readonly topCards: number;
}

export interface PlayRequest {
  readonly command: "play";
  /** Null: a fresh seed from infrastructure. */
  readonly seed: number | null;
  /** Write the run's exports into this directory when it ends. */
  readonly save: string | null;
  /** Let this policy take every turn, showing the table as it goes. */
  readonly policy: string | null;
}

export interface ReplayRequest {
  readonly command: "replay";
  readonly file: string;
  /** Only the summary, not the transcript. */
  readonly quiet: boolean;
}

export interface HelpRequest {
  readonly command: "help";
}

export type Request = SimRequest | PlayRequest | ReplayRequest | HelpRequest;

export class UsageError extends Error {}

export const USAGE = `North vs Up — the CLI simulator. The same rules engine as the web game, in a terminal.

  ./nvu sim    [--games N] [--seed N] [--policy NAME] [--json] [--save-runs DIR]
               [--max-commands N] [--top-cards N]
  ./nvu play   [--seed N] [--save DIR] [--policy NAME]
  ./nvu replay FILE.json [--quiet]

sim     play N seeded runs with a policy and print the report (--json for the numbers)
play    play a run in the terminal: numbered moves, u to undo, q to quit
replay  fold a .json export back through the engine and print its transcript

policies: random, greedy
defaults: --games 100 --seed 1 --policy greedy --max-commands 5000 --top-cards 12
`;

const integer = (name: string, raw: string | undefined, fallback: number): number => {
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n)) throw new UsageError(`--${name} wants a whole number, not "${raw}".`);
  return n;
};

export function parseRequest(argv: readonly string[]): Request {
  const [command, ...rest] = argv;
  if (command === undefined || command === "help" || command === "--help" || command === "-h") {
    return { command: "help" };
  }

  switch (command) {
    case "sim": {
      const { values } = parseArgs({
        args: [...rest],
        options: {
          games: { type: "string" },
          seed: { type: "string" },
          policy: { type: "string" },
          json: { type: "boolean" },
          "save-runs": { type: "string" },
          "max-commands": { type: "string" },
          "top-cards": { type: "string" },
        },
        strict: true,
      });
      const games = integer("games", values.games, 100);
      if (games < 1) throw new UsageError("--games wants at least 1.");
      return {
        command: "sim",
        games,
        seed: integer("seed", values.seed, 1),
        policy: values.policy ?? "greedy",
        json: values.json ?? false,
        saveRuns: values["save-runs"] ?? null,
        maxCommands: integer("max-commands", values["max-commands"], 5000),
        topCards: integer("top-cards", values["top-cards"], 12),
      };
    }

    case "play": {
      const { values } = parseArgs({
        args: [...rest],
        options: {
          seed: { type: "string" },
          save: { type: "string" },
          policy: { type: "string" },
        },
        strict: true,
      });
      return {
        command: "play",
        seed: values.seed === undefined ? null : integer("seed", values.seed, 0),
        save: values.save ?? null,
        policy: values.policy ?? null,
      };
    }

    case "replay": {
      const { values, positionals } = parseArgs({
        args: [...rest],
        options: { quiet: { type: "boolean" } },
        allowPositionals: true,
        strict: true,
      });
      const file = positionals[0];
      if (!file) throw new UsageError("replay wants the .json file to replay.");
      return { command: "replay", file, quiet: values.quiet ?? false };
    }

    default:
      throw new UsageError(`Unknown command "${command}".`);
  }
}
