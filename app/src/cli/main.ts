/* The terminal. Everything that reads a clock, a file or the argument list is
 * here and nowhere below it. `bin/nvu help` prints the usage.
 *
 * `play` has no interactive loop: the run file is the only state, and each
 * call loads it, replays the command log from the seed, applies one move, and
 * writes the file back (design/cli-sim/spec.md, play).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { stdout } from "node:process";

import { runData, type RunFile } from "@application/exportRun";
import { logLines } from "@application/narrate";
import { createSession, type Note, type SavedRun, type Session } from "@application/session";
import { CARD_CONTENT } from "@content/index";
import { legalCommands } from "@sim/moves";
import { randomPolicy } from "@sim/policy";
import { seedsFrom, simulate, type RunResult, type StopReason } from "@sim/run";
import {
  parseRequest,
  USAGE,
  UsageError,
  type FuzzRequest,
  type PlayRequest,
  type ReplayRequest,
} from "./args";
import { describeCommand, renderTable } from "./render";

const content = CARD_CONTENT;

const out = (text: string): void => {
  stdout.write(text.endsWith("\n") ? text : text + "\n");
};

// `bin/nvu replay run.json | head` closes the pipe early; that is not an error.
stdout.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EPIPE") process.exit(0);
  throw error;
});

/* ------------------------------------------------------------ run files */

function readRunFile(path: string): RunFile {
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as { format?: unknown }).format !== "nvu-run/1"
  ) {
    throw new UsageError(`${path} is not an nvu-run/1 run file.`);
  }
  return parsed as RunFile;
}

function writeRunFile(path: string, session: Session): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, runData(session.getState(), new Date()).text);
}

/**
 * Replay a saved run into a live session, the same fold `application/session`
 * does, but naming the index of a command the rules no longer accept — that
 * is how a rules change that broke a saved run shows itself.
 */
function loadRunIndexed(saved: SavedRun, notes: readonly Note[] = []): Session {
  const session = createSession(saved.seed, content);
  for (const [index, command] of saved.commands.entries()) {
    const result = session.getState().dispatch(command);
    if (!result.ok) {
      throw new UsageError(
        `Command ${String(index)} (${command.type}) is no longer legal: ${result.reason.message}`,
      );
    }
  }
  session.setState({ notes });
  return session;
}

/* ----------------------------------------------------------------- play */

/** `play new` records the run it started here; later calls default to it. */
const CURRENT = join("runs", "current");

function runPathFor(action: string, run: string | null, seed: number | null): string {
  if (run !== null) return run;
  if (seed !== null) return join("runs", `${String(seed)}.json`);
  if (existsSync(CURRENT)) {
    const current = readFileSync(CURRENT, "utf8").trim();
    if (current !== "") return current;
  }
  throw new UsageError(
    `play ${action} has no run to act on: start one with play new, or pass --run FILE.`,
  );
}

function rememberRun(path: string): void {
  mkdirSync(dirname(CURRENT), { recursive: true });
  writeFileSync(CURRENT, `${path}\n`);
}

function play(request: PlayRequest): number {
  const action = request.action;
  const path =
    action.kind === "new"
      ? runPathFor("new", request.run, action.seed)
      : runPathFor(action.kind, request.run, null);
  rememberRun(path);

  let session: Session;
  let before: number;
  if (action.kind === "new") {
    session = createSession(action.seed, content);
    before = 0;
  } else {
    if (!existsSync(path)) throw new UsageError(`${path} does not exist. Start it with play new.`);
    const file = readRunFile(path);
    if (!file.run) throw new UsageError(`${path} was not played from a seed and cannot continue.`);
    session = loadRunIndexed(file.run, file.notes);
    before = logLines(session.getState().events, session.getState().notes).length;
  }

  switch (action.kind) {
    case "new":
      break;
    case "move": {
      const legal = legalCommands(session.getState().state);
      const command = legal[action.index - 1];
      if (!command) {
        throw new UsageError(`No move numbered ${String(action.index)}. Run play show to list them.`);
      }
      const result = session.getState().dispatch(command);
      if (!result.ok) throw new UsageError(`Refused: ${result.reason.message}`);
      break;
    }
    case "undo":
      if (!session.getState().undo()) out("Nothing to undo: the last move revealed a card.");
      break;
    case "note":
      session.getState().note(action.text);
      break;
    case "show":
      break;
  }

  const { state, events, notes } = session.getState();
  const lines = logLines(events, notes).slice(before);
  for (const line of lines) {
    out(line.kind === "note" ? `NOTE — ${line.text}` : line.text);
  }
  if (lines.length > 0) out("");
  out(renderTable(state));
  out("");
  const legal = legalCommands(state);
  if (legal.length === 0) {
    out("No legal moves — the run is over.");
  } else {
    legal.forEach((command, i) => {
      out(`  ${String(i + 1).padStart(2)}. ${describeCommand(state, command)}`);
    });
  }

  if (action.kind !== "show") writeRunFile(path, session);
  return 0;
}

/* --------------------------------------------------------------- replay */

function replayRun(request: ReplayRequest): number {
  const file = readRunFile(request.file);
  if (!file.run) throw new UsageError(`${request.file} was not played from a seed and cannot replay.`);
  const session = loadRunIndexed(file.run, file.notes ?? []);
  const s = session.getState();

  if (!request.quiet) {
    const lines = logLines(s.events, s.notes);
    const width = String(lines.length).length;
    lines.forEach((line, i) => {
      const text = line.kind === "note" ? `NOTE — ${line.text}` : line.text;
      out(`${String(i + 1).padStart(width)}. ${text}`);
    });
    out("");
  }
  out(renderTable(s.state));
  out("");
  const recorded = `floor ${String(file.floor)}, turn ${String(file.turn)}, ${file.outcome ?? `in progress (${file.phase})`}`;
  const now = `floor ${String(s.state.floor)}, turn ${String(s.state.turn)}, ${s.state.outcome ?? `in progress (${s.state.phase})`}`;
  out(`seed ${String(file.run.seed)}, ${String(file.run.commands.length)} command(s) replayed, ${now}.`);
  if (recorded !== now) {
    out(`The file recorded ${recorded}; the rules now reach ${now}. The rules have changed since it was played.`);
    return 2;
  }
  return 0;
}

/* ----------------------------------------------------------------- fuzz */

const FUZZ_DIR = join("runs", "fuzz");

function fuzzMessage(run: RunResult): string {
  const kind: Record<StopReason, string> = {
    GameOver: "reached game over",
    Budget: "the budget ran out before the run ended",
    NoLegalMove: "the generator returned no moves in a state that is not game over",
    Rejected: `the engine refused a command the generator offered (${run.rejection ?? ""})`,
    Threw: `the engine threw (${run.rejection ?? ""})`,
  };
  return kind[run.stopped];
}

function fuzz(request: FuzzRequest): number {
  const failures: string[] = [];
  for (const seed of seedsFrom(request.from, request.seeds)) {
    const run = simulate(seed, randomPolicy, content);
    if (run.stopped === "GameOver") continue;

    const path = join(FUZZ_DIR, `${String(seed)}.json`);
    const session = createSession(seed, content);
    for (const command of run.commands) session.getState().dispatch(command);
    writeRunFile(path, session);
    failures.push(`seed ${String(seed)}: ${fuzzMessage(run)} — ${path}`);
  }

  if (failures.length === 0) {
    out(`${String(request.seeds)} seed(s) from ${String(request.from)}: no failures.`);
    return 0;
  }
  for (const line of failures) out(line);
  return 1;
}

/* ----------------------------------------------------------------- main */

function main(argv: readonly string[]): number {
  const request = parseRequest(argv);
  switch (request.command) {
    case "help":
      out(USAGE);
      return 0;
    case "play":
      return play(request);
    case "replay":
      return replayRun(request);
    case "fuzz":
      return fuzz(request);
  }
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  if (error instanceof UsageError) {
    out(`${error.message}\n`);
    out(USAGE);
    process.exitCode = 64;
  } else {
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
    out(message);
    process.exitCode = 1;
  }
}
