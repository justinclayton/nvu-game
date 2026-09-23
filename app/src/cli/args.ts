/* The command line, parsed into a typed request.
 *
 * design/cli-sim/spec.md, "Moves are named, not numbered": every name here —
 * a card, a character, a pile — is one shell argument. A name with a space in
 * it is shell-quoted, exactly as a human playtester would quote it, so this
 * parser never has to guess where one name ends and the next begins.
 * Resolving a name against the cards eligible for it is main.ts's job, once
 * it has the run's state; this file only shapes the tokens.
 */

import { parseArgs } from "node:util";

export type PlayAction =
  | { readonly kind: "new"; readonly seed: number }
  | { readonly kind: "flip" }
  | { readonly kind: "end" }
  | { readonly kind: "card"; readonly character: string; readonly name: string; readonly pay: readonly string[] }
  | { readonly kind: "choose"; readonly names: readonly string[] }
  | { readonly kind: "order"; readonly names: readonly string[] }
  | { readonly kind: "take" }
  | { readonly kind: "skip" }
  | { readonly kind: "keep"; readonly name: string; readonly pay: string | null }
  | { readonly kind: "return"; readonly name: string }
  | { readonly kind: "shed"; readonly name: string; readonly pay: string }
  | { readonly kind: "takeAscend"; readonly name: string | null }
  | { readonly kind: "undo" }
  | { readonly kind: "note"; readonly text: string }
  | {
      readonly kind: "show";
      readonly events: number | null;
      readonly table: boolean;
      readonly moves: boolean;
    }
  | { readonly kind: "pile"; readonly character: string; readonly pile: string };

export interface PlayRequest {
  readonly command: "play";
  readonly action: PlayAction;
  /** Null means the default, `runs/<seed>.json` — only resolvable for `new`. */
  readonly run: string | null;
}

export interface CardRequest {
  readonly command: "card";
  readonly name: string;
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

export type PolicyName = "random" | "greedy";

export interface SimRequest {
  readonly command: "sim";
  readonly seeds: number;
  readonly from: number;
  readonly policy: PolicyName;
  readonly json: boolean;
}

export interface HelpRequest {
  readonly command: "help";
}

export type Request = PlayRequest | CardRequest | ReplayRequest | FuzzRequest | SimRequest | HelpRequest;

export class UsageError extends Error {}

export const USAGE = `North vs Up — the CLI. The same rules engine as the web game, one shell call at a time.

  bin/nvu play new  --seed N [--run FILE]
  bin/nvu play flip                                  FLIP_ROOM (Turn Start: flip and draw)
  bin/nvu play end                                    END_PLAY
  bin/nvu play card Red Charge In [pay Rope Flare]     PLAY_CARD
  bin/nvu play choose Red                              CHOOSE_CHARACTER
  bin/nvu play choose Rope Flare | play choose none     CHOOSE_CARDS
  bin/nvu play order Rope Flare Shove                  ORDER_CARDS, top first
  bin/nvu play take | play skip                        TAKE_REWARD
  bin/nvu play keep Crowbar paying Shove               Ascend: keep Good Stuff
  bin/nvu play return Pry Bar                          Ascend: return Good Stuff
  bin/nvu play keep Torn Seal                          Ascend: keep Bad Stuff (free)
  bin/nvu play shed Rust paying Charge In              Ascend: shed Bad Stuff
  bin/nvu play take Zen Mode | play take none          Ascend: the reward
  bin/nvu play undo           [--run FILE]
  bin/nvu play note "text"    [--run FILE]
  bin/nvu play show [--events N] [--table] [--moves] [--run FILE]
  bin/nvu play pile <Red|Gray> <hand|discard|play>     [--run FILE]
  bin/nvu card "Charge In"
  bin/nvu replay FILE [--quiet]
  bin/nvu fuzz --seeds N [--from SEED]
  bin/nvu sim --seeds N [--from SEED] [--policy random|greedy] [--json]
  bin/nvu web
  bin/nvu help

A card name is the full name, the initials, or an unambiguous prefix,
case-insensitively; quote a name with a space in it.

play    the run file is the only state; every call loads it, applies one move, writes it back
        (--run defaults to runs/<seed>.json for "new"; later calls default to the run
        "new" last started, recorded in runs/current)
card    print a card's face from the content — no run needed
replay  fold a run file back through the engine and print its transcript
fuzz    play N seeds of uniformly random legal play under a command budget; prints failures only
sim     play N seeds with a policy and print a balance report (win rate, floors, per-card stats)
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

/** Split positionals at the first `pay`/`paying` keyword, if one is there. */
function splitOnPay(positionals: readonly string[]): {
  before: readonly string[];
  pay: readonly string[] | null;
} {
  const at = positionals.findIndex((p) => p === "pay" || p === "paying");
  if (at === -1) return { before: positionals, pay: null };
  return { before: positionals.slice(0, at), pay: positionals.slice(at + 1) };
}

function oneName(positionals: readonly string[], what: string): string {
  if (positionals.length !== 1) {
    throw new UsageError(`${what} wants one name — quote a name with a space in it.`);
  }
  const name = positionals[0];
  if (name === undefined || name === "") throw new UsageError(`${what} wants a name.`);
  return name;
}

function parseMove(action: string, actionRest: readonly string[]): PlayAction {
  switch (action) {
    case "flip":
      return { kind: "flip" };
    case "end":
      return { kind: "end" };

    case "card": {
      const [character, ...rest] = actionRest;
      if (character === undefined) throw new UsageError("play card wants a character, then a card name.");
      const { before, pay } = splitOnPay(rest);
      const name = oneName(before, "play card");
      return { kind: "card", character, name, pay: pay ?? [] };
    }

    case "choose": {
      if (actionRest.length === 0) {
        throw new UsageError("play choose wants a name (a character or a card) or 'none'.");
      }
      if (actionRest.length === 1 && actionRest[0]?.toLowerCase() === "none") {
        return { kind: "choose", names: [] };
      }
      return { kind: "choose", names: actionRest };
    }

    case "order":
      if (actionRest.length === 0) throw new UsageError("play order wants the cards to order.");
      return { kind: "order", names: actionRest };

    case "take":
    case "skip": {
      if (action === "skip") {
        if (actionRest.length > 0) throw new UsageError("play skip takes no name.");
        return { kind: "skip" };
      }
      if (actionRest.length === 0) return { kind: "take" };
      const name = oneName(actionRest, "play take");
      return { kind: "takeAscend", name: name.toLowerCase() === "none" ? null : name };
    }

    case "keep": {
      const { before, pay } = splitOnPay(actionRest);
      const name = oneName(before, "play keep");
      if (pay !== null && pay.length !== 1) throw new UsageError("play keep ... paying wants one payer.");
      return { kind: "keep", name, pay: pay ? (pay[0] ?? null) : null };
    }
    case "return":
      return { kind: "return", name: oneName(actionRest, "play return") };
    case "shed": {
      const { before, pay } = splitOnPay(actionRest);
      const name = oneName(before, "play shed");
      if (pay === null || pay.length !== 1 || pay[0] === undefined) {
        throw new UsageError("play shed wants: shed <Card> paying <Payer>.");
      }
      return { kind: "shed", name, pay: pay[0] };
    }

    default:
      throw new UsageError(
        `Unknown "play ${action}". Choose flip, end, card, choose, order, take, skip, keep, return, shed, undo, note, show or pile.`,
      );
  }
}

function parsePlay(rest: readonly string[]): PlayRequest {
  const [action, ...actionRest] = rest;
  if (action === undefined) throw new UsageError("play wants a move — see bin/nvu help.");

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
        options: {
          run: { type: "string" },
          events: { type: "string" },
          table: { type: "boolean" },
          moves: { type: "boolean" },
        },
        strict: true,
      });
      return {
        command: "play",
        action: {
          kind: "show",
          events: values.events === undefined ? null : integer("events", values.events, 0),
          table: values.table ?? false,
          moves: values.moves ?? false,
        },
        run: values.run ?? null,
      };
    }
    case "pile": {
      const { values, positionals } = parseArgs({
        args: [...actionRest],
        options: { run: { type: "string" } },
        allowPositionals: true,
        strict: true,
      });
      const [character, pile] = positionals;
      if (character === undefined || pile === undefined) {
        throw new UsageError("play pile wants a character (Red or Gray) and a pile (hand, discard or play).");
      }
      return { command: "play", action: { kind: "pile", character, pile }, run: values.run ?? null };
    }
    default: {
      // Every remaining move takes no flags of its own, only --run, so we
      // strip that first and hand the rest to the named-move grammar.
      const { values, positionals } = parseArgs({
        args: [action, ...actionRest],
        options: { run: { type: "string" } },
        allowPositionals: true,
        strict: true,
      });
      const [moveAction, ...moveRest] = positionals;
      if (moveAction === undefined) throw new UsageError("play wants a move — see bin/nvu help.");
      return { command: "play", action: parseMove(moveAction, moveRest), run: values.run ?? null };
    }
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

    case "card": {
      const { positionals } = parseArgs({ args: [...rest], allowPositionals: true, strict: true });
      const name = oneName(positionals, "card");
      return { command: "card", name };
    }

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

    case "sim": {
      const { values } = parseArgs({
        args: [...rest],
        options: {
          seeds: { type: "string" },
          from: { type: "string" },
          policy: { type: "string" },
          json: { type: "boolean" },
        },
        strict: true,
      });
      const seeds = requiredInteger("seeds", values.seeds);
      if (seeds < 1) throw new UsageError("--seeds wants at least 1.");
      const policyRaw = values.policy ?? "greedy";
      if (policyRaw !== "random" && policyRaw !== "greedy") {
        throw new UsageError(`--policy wants "random" or "greedy", not "${policyRaw}".`);
      }
      return {
        command: "sim",
        seeds,
        from: integer("from", values.from, 1),
        policy: policyRaw,
        json: values.json ?? false,
      };
    }

    default:
      throw new UsageError(`Unknown command "${command}".`);
  }
}
