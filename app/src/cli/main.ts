/* The terminal. Everything that reads a clock, a file or the argument list is
 * here and nowhere below it. `bin/nvu help` prints the usage.
 *
 * `play` has no interactive loop: the run file is the only state, and each
 * call loads it, replays the command log from the seed, applies one move, and
 * writes the file back (design/cli-sim/spec.md, play).
 */

import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { stdout } from "node:process";

import { runData, type RunFile } from "@application/exportRun";
import { logLines } from "@application/narrate";
import { createSession, type Note, type SavedRun, type Session } from "@application/session";
import { CARD_CONTENT } from "@content/index";
import { resolveCardName } from "@content/names";
import { costOf, payOptions, playableCards } from "@domain/queries";
import type { Card, CardId, Character, Command, GameState } from "@domain/types";
import { CHARACTERS, playerOf } from "@domain/verbs";
import { POLICIES, randomPolicy } from "@sim/policy";
import { buildReport, type BalanceReport } from "@sim/report";
import { seedsFrom, simulate, type RunResult, type StopReason } from "@sim/run";
import {
  ascendComplete,
  composeAscend,
  currentQuestion,
  describeStagedAnswer,
  parseAnswers,
  payerCandidates,
  serializeAnswers,
  type AscendQuestion,
  type StagedAnswer,
} from "./ascend";
import {
  parseRequest,
  USAGE,
  UsageError,
  type CardRequest,
  type FuzzRequest,
  type PlayAction,
  type PlayRequest,
  type ReplayRequest,
  type SimRequest,
} from "./args";
import { cardLine, moveHint, printedFaceLine, renderTable } from "./render";

const content = CARD_CONTENT;

const out = (text: string): void => {
  stdout.write(text.endsWith("\n") ? text : text + "\n");
};

// `bin/nvu replay run.json | head` closes the pipe early; that is not an error.
stdout.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EPIPE") process.exit(0);
  throw error;
});

/** A move the engine or the CLI's own name resolution refused. Never the help text. */
class MoveRefused extends Error {}

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

/* -------------------------------------------------------- the run pointer */

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
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(CURRENT, `${path}\n`);
}

const ascendSidecarPath = (runPath: string): string => `${runPath}.ascend.json`;

function readAscendSidecar(path: string): StagedAnswer[] {
  if (!existsSync(path)) return [];
  return parseAnswers(readFileSync(path, "utf8"));
}

function writeAscendSidecar(path: string, answers: readonly StagedAnswer[]): void {
  writeFileSync(path, serializeAnswers(answers));
}

function deleteAscendSidecar(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}

/* ------------------------------------------------------ naming a character */

function matchCharacter(raw: string): Character {
  const found = CHARACTERS.find((c) => c.toLowerCase() === raw.toLowerCase());
  if (!found) throw new MoveRefused(`"${raw}" is not a character — choose Red or Gray.`);
  return found;
}

/* ------------------------------------------------------- building commands */

function buildPlayCard(
  state: GameState,
  action: Extract<PlayAction, { kind: "card" }>,
): Command {
  if (state.phase !== "Play") {
    throw new MoveRefused(`Cannot play a card during the ${state.phase} phase.`);
  }
  const character = matchCharacter(action.character);
  const named = resolveCardName(action.name, playableCards(state, character));
  if (!named.ok) throw new MoveRefused(named.reason);
  const card = named.card;

  const consumed = new Set<CardId>();
  const payWith: CardId[] = [];
  for (const payerName of action.pay) {
    const candidates = payOptions(state, character, card.id).filter((c) => !consumed.has(c.id));
    const payer = resolveCardName(payerName, candidates);
    if (!payer.ok) throw new MoveRefused(payer.reason);
    consumed.add(payer.card.id);
    payWith.push(payer.card.id);
  }
  const cost = costOf(state, character, card);
  if (payWith.length !== cost) {
    throw new MoveRefused(`${card.name} costs ${String(cost)}; ${String(payWith.length)} named.`);
  }
  return { type: "PLAY_CARD", character, cardId: card.id, payWith };
}

function buildChoose(state: GameState, action: Extract<PlayAction, { kind: "choose" }>): Command {
  const pending = state.pending;
  if (!pending) throw new MoveRefused("Nothing is waiting to be answered.");

  if (pending.kind === "ChooseCharacter") {
    const [only, ...extra] = action.names;
    if (only === undefined || extra.length > 0) {
      throw new MoveRefused(`Choose one of: ${pending.options.join(", ")}.`);
    }
    const character = pending.options.find((c) => c.toLowerCase() === only.toLowerCase());
    if (!character) {
      throw new MoveRefused(`"${only}" is not one of: ${pending.options.join(", ")}.`);
    }
    return { type: "CHOOSE_CHARACTER", character };
  }

  if (pending.kind === "ChooseCards") {
    const consumed = new Set<CardId>();
    const cardIds: CardId[] = [];
    for (const name of action.names) {
      const candidates = pending.options.filter((c) => !consumed.has(c.id));
      const named = resolveCardName(name, candidates);
      if (!named.ok) throw new MoveRefused(named.reason);
      consumed.add(named.card.id);
      cardIds.push(named.card.id);
    }
    return { type: "CHOOSE_CARDS", cardIds };
  }

  throw new MoveRefused(`Waiting on: ${pending.prompt}`);
}

function buildOrder(state: GameState, action: Extract<PlayAction, { kind: "order" }>): Command {
  const pending = state.pending;
  if (!pending || pending.kind !== "OrderCards") {
    throw new MoveRefused(pending ? `Waiting on: ${pending.prompt}` : "Nothing is waiting to be answered.");
  }
  const consumed = new Set<CardId>();
  const cardIds: CardId[] = [];
  for (const name of action.names) {
    const candidates = pending.cards.filter((c) => !consumed.has(c.id));
    const named = resolveCardName(name, candidates);
    if (!named.ok) throw new MoveRefused(named.reason);
    consumed.add(named.card.id);
    cardIds.push(named.card.id);
  }
  return { type: "ORDER_CARDS", cardIds };
}

function resolvePayer(
  state: GameState,
  character: Character,
  payName: string,
  staged: readonly StagedAnswer[],
): Card {
  const candidates = payerCandidates(state, character, staged);
  const named = resolveCardName(payName, candidates);
  if (!named.ok) throw new MoveRefused(named.reason);
  return named.card;
}

/**
 * One Ascend question's answer, staged (not yet dispatched). Refuses naming
 * the wrong card, or a verb that does not fit the card being asked about
 * (design/cli-sim/spec.md, "Ascending, one question at a time").
 */
type AscendAction = Extract<PlayAction, { kind: "keep" | "return" | "shed" | "takeAscend" }>;

function buildAscendAnswer(
  state: GameState,
  question: AscendQuestion,
  action: AscendAction,
  staged: readonly StagedAnswer[],
): StagedAnswer {
  if (question.kind === "reward") {
    if (action.kind !== "takeAscend") {
      throw new MoveRefused(
        `${question.character} is being asked about the reward. Use: take <Name>, or take none.`,
      );
    }
    if (action.name === null) {
      return { kind: "reward", character: question.character, takeRewardId: null };
    }
    const offered = state.offer?.[question.character] ?? [];
    const named = resolveCardName(action.name, offered);
    if (!named.ok) throw new MoveRefused(named.reason);
    return { kind: "reward", character: question.character, takeRewardId: named.card.id };
  }

  const card = question.card;
  if (!card) throw new MoveRefused("No Stuff card is being asked about.");
  if (action.kind === "takeAscend") {
    throw new MoveRefused(`${question.character} is being asked about ${card.name}, not the reward yet.`);
  }
  const named = resolveCardName(action.name, [card]);
  if (!named.ok) {
    throw new MoveRefused(`${question.character} is being asked about ${card.name}, not "${action.name}".`);
  }
  const isGoodStuff = card.kind === "good_stuff";

  if (action.kind === "return") {
    if (!isGoodStuff) {
      throw new MoveRefused(`${card.name} is Bad Stuff — return only answers Good Stuff. Use keep or shed.`);
    }
    return { kind: "settle", character: question.character, cardId: card.id, payWith: null };
  }
  if (action.kind === "keep") {
    if (isGoodStuff) {
      if (action.pay === null) {
        throw new MoveRefused(`${card.name} is Good Stuff — keep it by paying: keep ${card.name} paying <Payer>.`);
      }
      const payer = resolvePayer(state, question.character, action.pay, staged);
      return { kind: "settle", character: question.character, cardId: card.id, payWith: payer.id };
    }
    if (action.pay !== null) throw new MoveRefused(`${card.name} is Bad Stuff — keeping it is free.`);
    return { kind: "settle", character: question.character, cardId: card.id, payWith: null };
  }
  // action.kind === "shed"
  if (isGoodStuff) {
    throw new MoveRefused(`${card.name} is Good Stuff — shed only answers Bad Stuff. Use keep or return.`);
  }
  const payer = resolvePayer(state, question.character, action.pay, staged);
  return { kind: "settle", character: question.character, cardId: card.id, payWith: payer.id };
}

/** A one-line account of a dispatched action that produced no narrated event. */
function describeAction(action: PlayAction): string {
  switch (action.kind) {
    case "flip":
      return "Flipped the room.";
    case "end":
      return "Ended the Play phase.";
    case "card":
      return action.pay.length > 0
        ? `Played ${action.name}, paying ${action.pay.join(", ")}.`
        : `Played ${action.name}.`;
    case "choose":
      return action.names.length === 0 ? "Chose none." : `Chose ${action.names.join(", ")}.`;
    case "order":
      return `Ordered ${action.names.join(", ")}.`;
    case "take":
      return "Took the reward.";
    case "skip":
      return "Skipped the reward.";
    default:
      return "Nothing to report.";
  }
}

function dispatchOrThrow(session: Session, command: Command): void {
  const result = session.getState().dispatch(command);
  if (!result.ok) throw new MoveRefused(result.reason.message);
}

/* ----------------------------------------------------------------- play */

function showPlay(run: string | null, action: Extract<PlayAction, { kind: "show" }>): number {
  const path = runPathFor("show", run, null);
  rememberRun(path);
  if (!existsSync(path)) throw new UsageError(`${path} does not exist. Start it with play new.`);
  const file = readRunFile(path);
  if (!file.run) throw new UsageError(`${path} was not played from a seed and cannot continue.`);
  const session = loadRunIndexed(file.run, file.notes);
  const { state, events, notes } = session.getState();
  const staged = readAscendSidecar(ascendSidecarPath(path));

  const wantsPart = action.events !== null || action.table || action.moves;
  if (!wantsPart) {
    out(renderTable(state, staged));
    out("");
    out(moveHint(state, staged));
    return 0;
  }
  if (action.events !== null) {
    const lines = logLines(events, notes).slice(-action.events);
    for (const line of lines) out(line.kind === "note" ? `NOTE — ${line.text}` : line.text);
  }
  if (action.table) out(renderTable(state, staged));
  if (action.moves) out(moveHint(state, staged));
  return 0;
}

function showPile(run: string | null, action: Extract<PlayAction, { kind: "pile" }>): number {
  const path = runPathFor("pile", run, null);
  rememberRun(path);
  if (!existsSync(path)) throw new UsageError(`${path} does not exist. Start it with play new.`);
  const file = readRunFile(path);
  if (!file.run) throw new UsageError(`${path} was not played from a seed and cannot continue.`);
  const session = loadRunIndexed(file.run, file.notes);
  const state = session.getState().state;
  const character = matchCharacter(action.character);
  const p = playerOf(state, character);

  const pileName = action.pile.toLowerCase();
  const cards: readonly Card[] =
    pileName === "hand"
      ? p.hand
      : pileName === "discard"
        ? p.discard
        : pileName === "play"
          ? state.playZone.filter((x) => x.owner === character).map((x) => x.card)
          : (() => {
              throw new UsageError(`Unknown pile "${action.pile}" — choose hand, discard or play.`);
            })();

  if (cards.length === 0) {
    out(`${character}'s ${pileName} is empty.`);
  } else {
    for (const card of cards) out(cardLine(state, character, card));
  }
  return 0;
}

function play(request: PlayRequest): number {
  const action = request.action;
  if (action.kind === "show") return showPlay(request.run, action);
  if (action.kind === "pile") return showPile(request.run, action);

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

  if (action.kind === "note") {
    session.getState().note(action.text);
    writeRunFile(path, session);
    out(`Noted: "${action.text}"`);
    return 0;
  }

  const ascendPath = ascendSidecarPath(path);
  let staged = readAscendSidecar(ascendPath);
  let manualNote: string | null = null;

  try {
    switch (action.kind) {
      case "new":
        break;
      case "undo": {
        if (staged.length > 0) {
          staged = staged.slice(0, -1);
          writeAscendSidecar(ascendPath, staged);
          manualNote = "Undid the last staged Ascend answer.";
        } else if (session.getState().undo()) {
          manualNote = "Undid the last move.";
        } else {
          manualNote = "Nothing to undo: the last move revealed a card.";
        }
        break;
      }
      case "flip":
        dispatchOrThrow(session, { type: "FLIP_ROOM" });
        break;
      case "end":
        dispatchOrThrow(session, { type: "END_PLAY" });
        break;
      case "card":
        dispatchOrThrow(session, buildPlayCard(session.getState().state, action));
        break;
      case "choose":
        dispatchOrThrow(session, buildChoose(session.getState().state, action));
        break;
      case "order":
        dispatchOrThrow(session, buildOrder(session.getState().state, action));
        break;
      case "take":
        dispatchOrThrow(session, { type: "TAKE_REWARD", take: true });
        break;
      case "skip":
        dispatchOrThrow(session, { type: "TAKE_REWARD", take: false });
        break;
      case "keep":
      case "return":
      case "shed":
      case "takeAscend": {
        const state = session.getState().state;
        if (state.phase !== "Ascend") {
          throw new MoveRefused(`Cannot answer Ascend outside the Ascend phase (currently ${state.phase}).`);
        }
        const question = currentQuestion(state, staged);
        if (!question) throw new MoveRefused("Every Ascend question is already staged.");
        const answer = buildAscendAnswer(state, question, action, staged);
        staged = [...staged, answer];
        manualNote = describeStagedAnswer(state, answer);
        if (ascendComplete(state, staged)) {
          dispatchOrThrow(session, composeAscend(staged));
          deleteAscendSidecar(ascendPath);
          staged = [];
        } else {
          writeAscendSidecar(ascendPath, staged);
        }
        break;
      }
    }
  } catch (error) {
    if (error instanceof MoveRefused) {
      out(`Refused: ${error.message}`);
      out("");
      out(moveHint(session.getState().state, staged));
      return 1;
    }
    throw error;
  }

  const { state, events, notes } = session.getState();
  const lines = logLines(events, notes).slice(before);
  if (lines.length > 0) {
    for (const line of lines) out(line.kind === "note" ? `NOTE — ${line.text}` : line.text);
  } else {
    out(manualNote ?? describeAction(action));
  }
  out("");
  out(renderTable(state, staged));
  out("");
  out(moveHint(state, staged));

  writeRunFile(path, session);
  return 0;
}

/* ------------------------------------------------------------------ card */

function cardFace(request: CardRequest): number {
  const named = resolveCardName(request.name, content.cards);
  if (!named.ok) {
    out(`Refused: ${named.reason}`);
    return 1;
  }
  out(printedFaceLine(named.card));
  return 0;
}

/* --------------------------------------------------------------- replay */

function replayRun(request: ReplayRequest): number {
  const file = readRunFile(request.file);
  if (!file.run) throw new UsageError(`${request.file} was not played from a seed and cannot replay.`);
  const session = loadRunIndexed(file.run, file.notes ?? []);
  const s = session.getState();

  const recorded = `floor ${String(file.floor)}, turn ${String(file.turn)}, ${file.outcome ?? `in progress (${file.phase})`}`;
  const now = `floor ${String(s.state.floor)}, turn ${String(s.state.turn)}, ${s.state.outcome ?? `in progress (${s.state.phase})`}`;

  if (!request.quiet) {
    const lines = logLines(s.events, s.notes);
    const width = String(lines.length).length;
    lines.forEach((line, i) => {
      const text = line.kind === "note" ? `NOTE — ${line.text}` : line.text;
      out(`${String(i + 1).padStart(width)}. ${text}`);
    });
    out("");
    out(renderTable(s.state));
    out("");
  }
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

/* ------------------------------------------------------------------ sim */

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function renderReport(report: BalanceReport): string {
  const lines: string[] = [];
  lines.push(`Policy: ${report.policy}. Seeds ${String(report.from)}-${String(report.from + report.seeds - 1)}, ${String(report.runs)} run(s).`);
  lines.push(`Win rate: ${pct(report.winRate)} (${String(report.wins)}/${String(report.runs)}).`);
  lines.push("");
  lines.push("Floor reached:");
  for (const f of report.floors) lines.push(`  ${String(f.floor)}: ${String(f.runs)}`);
  lines.push("");
  lines.push("Why runs ended:");
  for (const e of report.endReasons) lines.push(`  ${e.reason}: ${String(e.runs)}`);
  lines.push("");
  lines.push("After each Ascend, mean pile sizes:");
  for (const c of CHARACTERS) {
    const s = report.characters[c];
    lines.push(
      `  ${c}: ${String(s.ascends)} Ascend(s), deck ${s.meanDeckSize.toFixed(1)}, live ${s.meanLiveSize.toFixed(1)}, exhaust ${s.meanExhaustSize.toFixed(1)}`,
    );
  }
  lines.push("");
  lines.push("Per card — played / taken / kept:");
  for (const card of report.cards) {
    lines.push(`  ${card.name}: ${String(card.played)} / ${String(card.taken)} / ${String(card.kept)}`);
  }
  lines.push("");
  lines.push("Where cards went, by floor — Exhausted / Scrapped / paid as cost / Stuff returned:");
  for (const c of CHARACTERS) {
    lines.push(`  ${c}:`);
    for (const row of report.floorLosses.filter((r) => r.character === c)) {
      lines.push(
        `    Floor ${String(row.floor)}: ${String(row.exhausted)} / ${String(row.scrapped)} / ${String(row.paidAsCost)} / ${String(row.stuffReturned)}`,
      );
    }
  }
  return lines.join("\n");
}

function sim(request: SimRequest): number {
  const policy = POLICIES[request.policy];
  const report = buildReport(policy, content, request.from, request.seeds);
  out(request.json ? JSON.stringify(report, null, 2) : renderReport(report));
  return 0;
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
    case "card":
      return cardFace(request);
    case "replay":
      return replayRun(request);
    case "fuzz":
      return fuzz(request);
    case "sim":
      return sim(request);
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
