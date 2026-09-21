/* Many runs, added up. Numbers for a balance question, and the text that prints them. */

import type { Character } from "@domain/types";
import { CHARACTERS } from "@domain/verbs";
import type { RunOutcome, RunResult, StopReason } from "./run";

export interface RoomRow {
  readonly room: string;
  readonly cleared: number;
  readonly fled: number;
  /** Cleared over Cleared plus Fled, or null when it was never faced. */
  readonly clearRate: number | null;
}

export interface Report {
  readonly policy: string;
  readonly games: number;
  readonly outcomes: Readonly<Record<RunOutcome, number>>;
  readonly stopped: Readonly<Record<StopReason, number>>;
  readonly winRate: number;
  /** How many runs reached each floor as their highest. */
  readonly floorReached: Readonly<Record<number, number>>;
  readonly meanTurns: number;
  readonly meanCommands: number;
  readonly meanFloor: number;
  readonly downs: Readonly<Record<Character, number>>;
  /** Mean turn a character went Down on, over the runs where they did. */
  readonly meanDownTurn: Readonly<Record<Character, number | null>>;
  readonly rooms: readonly RoomRow[];
  /** Most played first. */
  readonly cardsPlayed: readonly { readonly card: string; readonly plays: number }[];
  readonly perGame: {
    readonly goodStuffTaken: number;
    readonly badStuffDealt: number;
    readonly stuffMissed: number;
    readonly exhausted: number;
    readonly lastStands: number;
    readonly escapes: number;
    readonly rewardsTaken: number;
    readonly rewardsDeclined: number;
  };
}

const mean = (xs: readonly number[]): number =>
  xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;

const sumBy = (results: readonly RunResult[], f: (r: RunResult) => number): number =>
  results.reduce((a, r) => a + f(r), 0);

export function aggregate(results: readonly RunResult[]): Report {
  const games = results.length;
  const outcomes: Record<RunOutcome, number> = { Victory: 0, Defeat: 0, Unfinished: 0 };
  const stopped: Record<StopReason, number> = {
    GameOver: 0,
    Budget: 0,
    NoLegalMove: 0,
    Rejected: 0,
  };
  const floorReached: Record<number, number> = {};
  const downs: Record<Character, number> = { Red: 0, Gray: 0 };
  const downTurns: Record<Character, number[]> = { Red: [], Gray: [] };
  const cleared: Record<string, number> = {};
  const fled: Record<string, number> = {};
  const plays: Record<string, number> = {};

  for (const r of results) {
    outcomes[r.outcome] += 1;
    stopped[r.stopped] += 1;
    floorReached[r.floor] = (floorReached[r.floor] ?? 0) + 1;
    for (const c of CHARACTERS) {
      const turn = r.tally.down[c];
      if (turn !== null) {
        downs[c] += 1;
        downTurns[c].push(turn);
      }
    }
    for (const [room, n] of Object.entries(r.tally.roomsCleared))
      cleared[room] = (cleared[room] ?? 0) + n;
    for (const [room, n] of Object.entries(r.tally.roomsFled)) fled[room] = (fled[room] ?? 0) + n;
    for (const [card, n] of Object.entries(r.tally.cardsPlayed))
      plays[card] = (plays[card] ?? 0) + n;
  }

  const roomNames = [...new Set([...Object.keys(cleared), ...Object.keys(fled)])].sort();
  const rooms: RoomRow[] = roomNames.map((room) => {
    const c = cleared[room] ?? 0;
    const f = fled[room] ?? 0;
    return { room, cleared: c, fled: f, clearRate: c + f === 0 ? null : c / (c + f) };
  });

  const per = (f: (r: RunResult) => number): number =>
    games === 0 ? 0 : sumBy(results, f) / games;

  return {
    policy: results[0]?.policy ?? "",
    games,
    outcomes,
    stopped,
    winRate: games === 0 ? 0 : outcomes.Victory / games,
    floorReached,
    meanTurns: mean(results.map((r) => r.turn)),
    meanCommands: mean(results.map((r) => r.commandCount)),
    meanFloor: mean(results.map((r) => r.floor)),
    downs,
    meanDownTurn: {
      Red: downTurns.Red.length === 0 ? null : mean(downTurns.Red),
      Gray: downTurns.Gray.length === 0 ? null : mean(downTurns.Gray),
    },
    rooms,
    cardsPlayed: Object.entries(plays)
      .map(([card, n]) => ({ card, plays: n }))
      .sort((a, b) => b.plays - a.plays || a.card.localeCompare(b.card)),
    perGame: {
      goodStuffTaken: per((r) => r.tally.goodStuffTaken),
      badStuffDealt: per((r) => r.tally.badStuffDealt),
      stuffMissed: per((r) => r.tally.stuffMissed),
      exhausted: per((r) => r.tally.exhausted),
      lastStands: per((r) => r.tally.lastStands),
      escapes: per((r) => r.tally.escapes),
      rewardsTaken: per((r) => r.tally.rewardsTaken),
      rewardsDeclined: per((r) => r.tally.rewardsDeclined),
    },
  };
}

/* ---------------------------------------------------------------- text */

const pct = (x: number): string => `${(100 * x).toFixed(1)}%`;
const num = (x: number): string => (Number.isInteger(x) ? String(x) : x.toFixed(2));

/** Columns padded to their widest cell; numbers right-aligned. */
export function table(rows: readonly (readonly (string | number)[])[]): string {
  const widths: number[] = [];
  for (const row of rows) {
    row.forEach((cell, i) => {
      widths[i] = Math.max(widths[i] ?? 0, String(cell).length);
    });
  }
  return rows
    .map((row) =>
      row
        .map((cell, i) => {
          const w = widths[i] ?? 0;
          const s = String(cell);
          return typeof cell === "number" ? s.padStart(w) : s.padEnd(w);
        })
        .join("  ")
        .trimEnd(),
    )
    .join("\n");
}

export function formatReport(report: Report, options: { readonly topCards?: number } = {}): string {
  const topCards = options.topCards ?? 12;
  const lines: string[] = [];
  lines.push(`North vs Up — ${String(report.games)} run(s), policy ${report.policy}`);
  lines.push("");
  lines.push(
    table([
      ["wins", report.outcomes.Victory, pct(report.winRate)],
      [
        "defeats",
        report.outcomes.Defeat,
        pct(report.games ? report.outcomes.Defeat / report.games : 0),
      ],
      ["unfinished", report.outcomes.Unfinished, ""],
      ["mean floor", num(report.meanFloor), ""],
      ["mean turns", num(report.meanTurns), ""],
      ["mean commands", num(report.meanCommands), ""],
    ]),
  );

  if (report.stopped.Budget + report.stopped.NoLegalMove + report.stopped.Rejected > 0) {
    lines.push("");
    lines.push("stopped early:");
    lines.push(
      table([
        ["  budget", report.stopped.Budget],
        ["  no legal move", report.stopped.NoLegalMove],
        ["  rejected", report.stopped.Rejected],
      ]),
    );
  }

  lines.push("");
  lines.push("floor reached:");
  const floors = Object.keys(report.floorReached)
    .map(Number)
    .sort((a, b) => a - b);
  lines.push(
    table(
      floors.map((f) => {
        const n = report.floorReached[f] ?? 0;
        return [`  ${String(f)}`, n, pct(report.games ? n / report.games : 0)];
      }),
    ),
  );

  lines.push("");
  lines.push("down:");
  lines.push(
    table(
      CHARACTERS.map((c) => {
        const t = report.meanDownTurn[c];
        return [`  ${c}`, report.downs[c], t === null ? "" : `mean turn ${num(t)}`];
      }),
    ),
  );

  lines.push("");
  lines.push("per game:");
  const p = report.perGame;
  lines.push(
    table([
      ["  Good Stuff taken", num(p.goodStuffTaken)],
      ["  Bad Stuff dealt", num(p.badStuffDealt)],
      ["  Stuff pool empty", num(p.stuffMissed)],
      ["  cards exhausted", num(p.exhausted)],
      ["  last stands", num(p.lastStands)],
      ["  escapes", num(p.escapes)],
      ["  rewards taken", num(p.rewardsTaken)],
      ["  rewards declined", num(p.rewardsDeclined)],
    ]),
  );

  if (report.rooms.length > 0) {
    lines.push("");
    lines.push("rooms:");
    lines.push(
      table([
        ["  room", "cleared", "fled", "clear rate"],
        ...report.rooms.map((r) => [
          `  ${r.room}`,
          r.cleared,
          r.fled,
          r.clearRate === null ? "" : pct(r.clearRate),
        ]),
      ]),
    );
  }

  if (report.cardsPlayed.length > 0) {
    lines.push("");
    lines.push(`cards played (top ${String(topCards)}):`);
    lines.push(table(report.cardsPlayed.slice(0, topCards).map((c) => [`  ${c.card}`, c.plays])));
  }
  return lines.join("\n") + "\n";
}
