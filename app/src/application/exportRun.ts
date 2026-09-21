/* Exporting a run, so a playtest does not have to be copied off the screen by
 * hand.
 *
 * Three files, each for a different reader:
 *
 *   .txt   the transcript, numbered, notes in place. What goes into a
 *          design/playtests record, where a note cites a log line by number.
 *   .csv   one row per turn, derived from the event log. The shape of a run —
 *          which room, how it ended, how much was drawn, paid and taken — for
 *          reading several playtests side by side in a spreadsheet.
 *   .json  the run itself: the seed and the command log, so it replays, plus
 *          the notes with the log positions they were typed at. This is what a
 *          bug report carries.
 *
 * Nothing here reads a clock: the caller passes the moment of export, so the
 * application layer stays as pure as the domain under it.
 */

import type { Character, Command, DomainEvent } from "@domain/types";
import { describeEvent } from "./narrate";
import { saveOf, type Note, type SessionState } from "./session";

/** A file for the browser to hand the playtester. */
export interface ExportFile {
  readonly filename: string;
  readonly mime: string;
  readonly text: string;
}

const stamp = (at: Date): string => at.toISOString().replace(/[:.]/g, "-").slice(0, 19);

const nameOf = (session: SessionState, at: Date, extension: string): string =>
  `nvu-run-${session.seed === null ? "rigged" : String(session.seed)}-${stamp(at)}.${extension}`;

const outcomeOf = (session: SessionState): string =>
  session.state.outcome ?? `in progress, phase ${session.state.phase}`;

/* --------------------------------------------------------------- the header
   Every export says what run it is and where it came from, because a log
   nobody can place is a log nobody can act on. */

interface Heading {
  readonly seed: string;
  readonly floor: number;
  readonly turn: number;
  readonly phase: string;
  readonly outcome: string;
  readonly commands: number;
  readonly notes: number;
  readonly exportedAt: string;
}

function heading(session: SessionState, at: Date): Heading {
  return {
    seed:
      session.seed === null
        ? "none — this run was rigged into place, not played"
        : String(session.seed),
    floor: session.state.floor,
    turn: session.state.turn,
    phase: session.state.phase,
    outcome: outcomeOf(session),
    commands: session.commands.length,
    notes: session.notes.length,
    exportedAt: at.toISOString(),
  };
}

/* ------------------------------------------------------------ the transcript */

/**
 * The readable log. Lines are numbered from 1 so a note in a playtest record
 * can cite them, and a typed note is a line like any other.
 */
export function runTranscript(session: SessionState, at: Date): ExportFile {
  const head = heading(session, at);
  const lines = [
    "North vs Up — playtest log",
    "",
    `floor ${String(head.floor)} · turn ${String(head.turn)} · ${head.outcome}`,
    `seed ${head.seed}`,
    `${String(head.commands)} command(s), ${String(head.notes)} note(s)`,
    `exported ${head.exportedAt}`,
    "",
    "The .json export of this run carries the seed and the command log, and replays it exactly.",
    "",
    "--- log ---",
  ];
  const width = String(session.events.length + session.notes.length).length;
  let n = 0;
  const numbered = (text: string) => {
    n += 1;
    return `${String(n).padStart(width, " ")}. ${text}`;
  };
  for (const [index, event] of session.events.entries()) {
    for (const note of session.notes) {
      if (note.at === index) lines.push(numbered(`NOTE — ${note.text}`));
    }
    lines.push(numbered(describeEvent(event)));
  }
  for (const note of session.notes) {
    if (note.at === session.events.length) lines.push(numbered(`NOTE — ${note.text}`));
  }
  return {
    filename: nameOf(session, at, "txt"),
    mime: "text/plain",
    text: lines.join("\n") + "\n",
  };
}

/* --------------------------------------------------------- one row per turn */

export interface TurnRow {
  readonly turn: number;
  readonly floor: number;
  readonly room: string;
  readonly kind: string;
  readonly outcome: string;
  readonly red_drew: number;
  readonly gray_drew: number;
  readonly red_exhausted: number;
  readonly gray_exhausted: number;
  readonly cards_played: number;
  readonly cards_paid: number;
  readonly stuff_taken: number;
  readonly stuff_missed: number;
  readonly thresholds_met: number;
  readonly went_down: string;
  readonly notes: string;
}

export const TURN_COLUMNS: readonly (keyof TurnRow)[] = [
  "turn",
  "floor",
  "room",
  "kind",
  "outcome",
  "red_drew",
  "gray_drew",
  "red_exhausted",
  "gray_exhausted",
  "cards_played",
  "cards_paid",
  "stuff_taken",
  "stuff_missed",
  "thresholds_met",
  "went_down",
  "notes",
];

interface Draft {
  row: {
    -readonly [K in keyof TurnRow]: TurnRow[K];
  };
  /** The first event index this turn owns, for placing the notes. */
  start: number;
}

const draft = (turn: number, floor: number, start: number): Draft => ({
  start,
  row: {
    turn,
    floor,
    room: "",
    kind: "",
    outcome: "",
    red_drew: 0,
    gray_drew: 0,
    red_exhausted: 0,
    gray_exhausted: 0,
    cards_played: 0,
    cards_paid: 0,
    stuff_taken: 0,
    stuff_missed: 0,
    thresholds_met: 0,
    went_down: "",
    notes: "",
  },
});

const drew = (c: Character): "red_drew" | "gray_drew" => (c === "Red" ? "red_drew" : "gray_drew");
const exhausted = (c: Character): "red_exhausted" | "gray_exhausted" =>
  c === "Red" ? "red_exhausted" : "gray_exhausted";

/**
 * The run as one row per turn, read off the event log.
 *
 * The domain keeps no per-turn tally — `TurnRecord` is reset every Flip — so
 * everything here is counted from the events themselves, and a column only
 * exists where an event says enough to fill it. The turn in progress gets a
 * row too, with an empty outcome.
 */
export function turnRows(
  events: readonly DomainEvent[],
  notes: readonly Note[] = [],
  openTurn = 1,
  openFloor = 1,
): readonly TurnRow[] {
  const drafts: Draft[] = [];
  let floor = openFloor;
  let current = draft(openTurn, floor, 0);

  for (const [index, event] of events.entries()) {
    switch (event.type) {
      case "FLOOR_BUILT":
        floor = event.floor;
        current.row.floor = floor;
        break;
      case "ROOM_FLIPPED":
        current.row.room = event.room.name;
        current.row.kind = event.room.kind;
        break;
      case "CARD_DRAWN":
        current.row[drew(event.character)] += 1;
        break;
      case "CARD_EXHAUSTED":
        current.row[exhausted(event.character)] += 1;
        break;
      case "CARD_PLAYED":
        current.row.cards_played += 1;
        break;
      case "COST_PAID":
        current.row.cards_paid += event.cards.length;
        break;
      case "STUFF_TAKEN":
        current.row.stuff_taken += 1;
        break;
      case "STUFF_POOL_EMPTY":
        current.row.stuff_missed += 1;
        break;
      case "THRESHOLD_MET":
        current.row.thresholds_met += 1;
        break;
      case "ROOM_CLEARED":
        current.row.outcome = "Cleared";
        break;
      case "ROOM_FLED":
        current.row.outcome = "Fled";
        break;
      case "WENT_DOWN":
        current.row.went_down = current.row.went_down
          ? `${current.row.went_down}+${event.character}`
          : event.character;
        break;
      case "TURN_ENDED":
        current.row.turn = event.turn;
        drafts.push(current);
        current = draft(event.turn + 1, floor, index + 1);
        break;
      default:
        break;
    }
  }
  drafts.push(current);

  /* A note belongs to the turn whose events come before it, so a thought typed
   * on reading "end of turn 3" is filed under turn 3 rather than turn 4. */
  for (const note of notes) {
    const owner = [...drafts].reverse().find((d) => d.start < note.at) ?? drafts[0];
    if (!owner) continue;
    owner.row.notes = owner.row.notes ? `${owner.row.notes} | ${note.text}` : note.text;
  }

  /* The turn in progress earns a row; a turn that has not begun does not. */
  const began = (d: Draft, index: number) =>
    index < drafts.length - 1 || d.start < events.length || d.row.notes !== "";
  return drafts.filter(began).map((d) => d.row);
}

const cell = (value: string | number): string => {
  const s = String(value);
  return /["\n,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** One row per turn, with the run's identity in a comment line above it. */
export function runTurns(session: SessionState, at: Date): ExportFile {
  const head = heading(session, at);
  const rows = turnRows(session.events, session.notes, session.state.turn, session.state.floor);
  const lines = [
    `# North vs Up — seed ${head.seed}, exported ${head.exportedAt}, ${head.outcome}`,
    TURN_COLUMNS.join(","),
    ...rows.map((row) => TURN_COLUMNS.map((c) => cell(row[c])).join(",")),
  ];
  return {
    filename: nameOf(session, at, "csv"),
    mime: "text/csv",
    text: lines.join("\n") + "\n",
  };
}

/* ------------------------------------------------------------ the run itself */

/** What a `.json` export holds. `loadSession` takes `run` and `notes` back. */
export interface RunFile {
  readonly format: "nvu-run/1";
  readonly exportedAt: string;
  readonly floor: number;
  readonly turn: number;
  readonly phase: string;
  readonly outcome: string | null;
  /** The seed and the command log: a fold of `execute` over this is the run. */
  readonly run: { readonly seed: number; readonly commands: readonly Command[] } | null;
  /** `at` indexes into `log`, so a note reads back between the same two lines. */
  readonly notes: readonly Note[];
  readonly log: readonly string[];
}

export function runData(session: SessionState, at: Date): ExportFile {
  const saved = saveOf(session);
  const file: RunFile = {
    format: "nvu-run/1",
    exportedAt: at.toISOString(),
    floor: session.state.floor,
    turn: session.state.turn,
    phase: session.state.phase,
    outcome: session.state.outcome,
    run: saved === null ? null : { seed: saved.seed, commands: saved.commands },
    notes: session.notes,
    log: session.events.map(describeEvent),
  };
  return {
    filename: nameOf(session, at, "json"),
    mime: "application/json",
    text: JSON.stringify(file, null, 2) + "\n",
  };
}

/** The three exports, in the order the buttons offer them. */
export const EXPORTS: readonly {
  readonly extension: "txt" | "csv" | "json";
  readonly what: string;
  readonly build: (session: SessionState, at: Date) => ExportFile;
}[] = [
  { extension: "txt", what: "the log as you read it, notes in place", build: runTranscript },
  { extension: "csv", what: "one row per turn, for a spreadsheet", build: runTurns },
  { extension: "json", what: "the seed and the command log — this run replays", build: runData },
];
