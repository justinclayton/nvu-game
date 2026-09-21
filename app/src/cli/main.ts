/* The terminal. Everything that reads a clock, a file or stdin is here and
 * nowhere below it. `./nvu help` prints the usage. */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stdin, stdout } from "node:process";

import { EXPORTS, runData, type RunFile } from "@application/exportRun";
import { logLines } from "@application/narrate";
import { createSession, loadSession, type Note, type Session } from "@application/session";
import { CARD_CONTENT } from "@content/index";
import type { Command } from "@domain/types";
import { freshSeed } from "@infrastructure/seed";
import { legalCommands } from "@sim/moves";
import { policyNamed, POLICIES } from "@sim/policy";
import { aggregate, formatReport } from "@sim/report";
import { seedsFrom, simulate, type RunResult } from "@sim/run";
import { policySeed } from "@sim/rng";
import {
  parseRequest,
  USAGE,
  UsageError,
  type PlayRequest,
  type ReplayRequest,
  type SimRequest,
} from "./args";
import { lineReader } from "./input";
import { describeCommand, renderTable } from "./render";

const content = CARD_CONTENT;

const out = (text: string): void => {
  stdout.write(text.endsWith("\n") ? text : text + "\n");
};

// `./nvu replay run.json | head` closes the pipe early; that is not an error.
stdout.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EPIPE") process.exit(0);
  throw error;
});

/* ------------------------------------------------------------------ sim */

/** A finished run as the web game's `.json` export, so it loads there. */
function runFileOf(run: RunResult, at: Date): string {
  const session = loadSession({ seed: run.seed, commands: run.commands }, content);
  return runData(session.getState(), at).text;
}

function sim(request: SimRequest): number {
  const policy = policyNamed(request.policy);
  if (!policy) {
    throw new UsageError(
      `No policy named "${request.policy}". Choose one of: ${POLICIES.map((p) => p.name).join(", ")}.`,
    );
  }
  const started = Date.now();
  const results = seedsFrom(request.seed, request.games).map((seed) =>
    simulate(seed, policy, content, { maxCommands: request.maxCommands }),
  );
  const elapsed = Date.now() - started;
  const report = aggregate(results);

  if (request.saveRuns !== null) {
    mkdirSync(request.saveRuns, { recursive: true });
    const at = new Date();
    for (const run of results) {
      const name = `nvu-run-${String(run.seed)}-${policy.name}-${run.outcome.toLowerCase()}.json`;
      writeFileSync(join(request.saveRuns, name), runFileOf(run, at));
    }
  }

  if (request.json) {
    out(
      JSON.stringify(
        {
          ...report,
          seedFrom: request.seed,
          elapsedMs: elapsed,
          runs: results.map((r) => ({
            seed: r.seed,
            outcome: r.outcome,
            stopped: r.stopped,
            floor: r.floor,
            turn: r.turn,
            commands: r.commandCount,
            down: r.tally.down,
          })),
        },
        null,
        2,
      ),
    );
  } else {
    out(formatReport(report, { topCards: request.topCards }));
    out(
      `seeds ${String(request.seed)}–${String(request.seed + request.games - 1)}, ${String(elapsed)} ms`,
    );
    if (request.saveRuns !== null) out(`runs written to ${request.saveRuns}/`);
  }
  return 0;
}

/* ----------------------------------------------------------------- play */

function saveSession(session: Session, dir: string): void {
  mkdirSync(dir, { recursive: true });
  const at = new Date();
  for (const { build } of EXPORTS) {
    const file = build(session.getState(), at);
    writeFileSync(join(dir, file.filename), file.text);
    out(`wrote ${join(dir, file.filename)}`);
  }
}

/** The log lines added since `from`, as text. */
function newLogText(session: Session, from: number): string {
  const { events, notes } = session.getState();
  return logLines(events, notes)
    .slice(from)
    .map((line) => (line.kind === "note" ? `  NOTE — ${line.text}` : `  ${line.text}`))
    .join("\n");
}

const PLAY_HELP = `  <number>  make that move      u  undo      n <text>  write a note into the log
  l         show the whole log  t  redraw    s         save the exports now
  q         quit`;

async function play(request: PlayRequest): Promise<number> {
  const seed = request.seed ?? freshSeed();
  const session = createSession(seed, content);
  const policy = request.policy === null ? null : policyNamed(request.policy);
  if (request.policy !== null && !policy) {
    throw new UsageError(`No policy named "${request.policy}".`);
  }
  let rng = policySeed(seed);
  let shown = 0;

  out(`North vs Up — seed ${String(seed)}${policy ? `, ${policy.name} plays` : ""}`);
  out(PLAY_HELP);
  out("");

  const rl = lineReader(stdin, stdout);
  try {
    for (;;) {
      const { state, events, notes } = session.getState();
      const lines = logLines(events, notes);
      if (lines.length > shown) {
        out(newLogText(session, shown));
        shown = lines.length;
      }
      out("");
      out(renderTable(state));
      if (state.phase === "GameOver") {
        out("");
        out(
          state.outcome === "Victory" ? "You reach the rooftop. You win." : "Both of you are Down.",
        );
        break;
      }

      const legal = legalCommands(state);
      out("");
      legal.forEach((command, i) => {
        out(`  ${String(i + 1).padStart(2)}. ${describeCommand(state, command)}`);
      });

      let command: Command | null = null;
      if (policy) {
        const [chosen, next] = policy.choose(state, legal, rng);
        rng = next;
        const answer = await rl.next(
          `${policy.name} → ${describeCommand(state, chosen)}  [enter to accept, q to quit] `,
        );
        if (answer === null || answer.trim() === "q") break;
        command = chosen;
      } else {
        const raw = await rl.next("> ");
        if (raw === null) break;
        const answer = raw.trim();
        if (answer === "q") break;
        if (answer === "u") {
          if (!session.getState().undo()) out("Nothing to undo: the last move revealed a card.");
          else
            shown = Math.min(
              shown,
              logLines(session.getState().events, session.getState().notes).length,
            );
          continue;
        }
        if (answer === "l") {
          out(newLogText(session, 0));
          continue;
        }
        if (answer === "t" || answer === "") continue;
        if (answer === "s") {
          saveSession(session, request.save ?? ".");
          continue;
        }
        if (answer.startsWith("n ")) {
          session.getState().note(answer.slice(2));
          continue;
        }
        if (answer === "h" || answer === "?") {
          out(PLAY_HELP);
          continue;
        }
        const n = Number(answer);
        const picked = Number.isInteger(n) ? legal[n - 1] : undefined;
        if (!picked) {
          out(`Pick a number from 1 to ${String(legal.length)}, or a letter from the help.`);
          continue;
        }
        command = picked;
      }

      const result = session.getState().dispatch(command);
      if (!result.ok) out(`Refused: ${result.reason.message}`);
    }
  } finally {
    rl.close();
  }

  const s = session.getState();
  out("");
  out(
    `${String(s.commands.length)} command(s), floor ${String(s.state.floor)}, turn ${String(s.state.turn)}, ${s.state.outcome ?? "unfinished"}.`,
  );
  if (request.save !== null) saveSession(session, request.save);
  else
    out(
      `Start this seed again with: ./nvu play --seed ${String(seed)}  (save the run next time with --save DIR)`,
    );
  return 0;
}

/* --------------------------------------------------------------- replay */

function readRunFile(path: string): RunFile {
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as { format?: unknown }).format !== "nvu-run/1"
  ) {
    throw new UsageError(`${path} is not an nvu-run/1 export.`);
  }
  return parsed as RunFile;
}

function replayRun(request: ReplayRequest): number {
  const file = readRunFile(request.file);
  if (!file.run) {
    throw new UsageError(
      `${request.file} was rigged into place, not played from a seed; it cannot replay.`,
    );
  }
  const notes: readonly Note[] = file.notes ?? [];
  const session = loadSession(file.run, content, notes);
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
  out(
    `seed ${String(file.run.seed)}, ${String(file.run.commands.length)} command(s) replayed, ` +
      `floor ${String(s.state.floor)}, turn ${String(s.state.turn)}, ${s.state.outcome ?? `in progress (${s.state.phase})`}.`,
  );
  const recorded = `floor ${String(file.floor)}, turn ${String(file.turn)}, ${file.outcome ?? `in progress (${file.phase})`}`;
  const now = `floor ${String(s.state.floor)}, turn ${String(s.state.turn)}, ${s.state.outcome ?? `in progress (${s.state.phase})`}`;
  if (recorded !== now) {
    out(
      `The export recorded ${recorded}; the rules now reach ${now}. The rules have changed since it was played.`,
    );
    return 2;
  }
  return 0;
}

/* ----------------------------------------------------------------- main */

async function main(argv: readonly string[]): Promise<number> {
  const request = parseRequest(argv);
  switch (request.command) {
    case "help":
      out(USAGE);
      return 0;
    case "sim":
      return sim(request);
    case "play":
      return play(request);
    case "replay":
      return replayRun(request);
  }
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    if (error instanceof UsageError) {
      out(`${error.message}\n`);
      out(USAGE);
      process.exitCode = 64;
      return;
    }
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
    out(message);
    process.exitCode = 1;
  },
);
