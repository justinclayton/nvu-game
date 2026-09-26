/* Stepping through a recorded run: a bot's, an agent's, or a person's.
 *
 * React-free. The run file's command log is the script; the session is a live
 * one started from the same seed, and each step forward dispatches the next
 * scripted command into it, so the table animates a replay exactly as it
 * animates play. A step back rebuilds the session from the seed, because undo
 * cannot reach past a command that revealed hidden information. Taking over
 * drops the rest of the script and leaves the session live.
 */

import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

import type { CardContent } from "@domain/printed";
import type { Command } from "@domain/types";
import { mismatchedField, type RunFile } from "./exportRun";
import { createSession, loadSession, type Note, type Session } from "./session";

export interface ReplayState {
  readonly session: Session;
  readonly seed: number;
  /** The recorded command log, whole. */
  readonly script: readonly Command[];
  /** The recorded notes, each anchored to a position in the event log. */
  readonly notes: readonly Note[];
  /** How many scripted commands the session has taken. */
  readonly cursor: number;
  /** The script has been dropped and the session plays on live. */
  readonly live: boolean;

  /** One command forward. False at the end of the script. */
  stepForward(): boolean;
  /** One command back. False at the start. */
  stepBack(): boolean;
  /** Forward to the next turn's flip, or the end of the script. */
  nextTurn(): void;
  /** Rebuild at exactly `cursor` commands in. */
  seek(cursor: number): void;
  /** Keep the position, drop the script, and let the person play on. */
  takeOver(): void;
}

/** The notes typed no later than where the log has reached. */
const notesUpTo = (notes: readonly Note[], events: number): readonly Note[] =>
  notes.filter((n) => n.at <= events);

export function createReplay(
  seed: number,
  script: readonly Command[],
  notes: readonly Note[],
  content: CardContent,
) {
  const session = createSession(seed, content);
  session.setState({ notes: notesUpTo(notes, session.getState().events.length) });

  return createStore<ReplayState>()(
    subscribeWithSelector((set, get) => {
      /* Put the session at `cursor` by folding the script from the seed. A
       * rebuilt session has no undo history: nothing here was played. */
      const rebuild = (cursor: number): void => {
        const fresh = loadSession({ seed, commands: script.slice(0, cursor) }, content);
        const s = fresh.getState();
        session.setState({
          state: s.state,
          commands: s.commands,
          events: s.events,
          notes: notesUpTo(notes, s.events.length),
          history: [],
          lastRejection: null,
        });
        set({ cursor });
      };

      return {
        session,
        seed,
        script,
        notes,
        cursor: 0,
        live: false,

        stepForward() {
          const { cursor, live } = get();
          if (live || cursor >= script.length) return false;
          const command = script[cursor];
          if (!command) return false;
          const result = session.getState().dispatch(command);
          if (!result.ok) {
            throw new Error(
              `Command ${String(cursor)} (${command.type}) is no longer legal: ${result.reason.message}`,
            );
          }
          session.setState({ notes: notesUpTo(notes, session.getState().events.length) });
          set({ cursor: cursor + 1 });
          return true;
        },

        stepBack() {
          const { cursor, live } = get();
          if (live || cursor === 0) return false;
          rebuild(cursor - 1);
          return true;
        },

        nextTurn() {
          if (!get().stepForward()) return;
          while (script[get().cursor]?.type !== "FLIP_ROOM" && get().stepForward()) {
            /* through the rest of this turn */
          }
        },

        seek(cursor) {
          if (get().live) return;
          rebuild(Math.max(0, Math.min(script.length, cursor)));
        },

        takeOver() {
          set({ live: true });
        },
      };
    }),
  );
}

export type Replay = ReturnType<typeof createReplay>;

export type Opened =
  { readonly ok: true; readonly replay: Replay } | { readonly ok: false; readonly reason: string };

/** A run file's text, read back as a replay, or the sentence saying why not. */
export function openRunFile(text: string, content: CardContent): Opened {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: "That file is not JSON." };
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as { format?: unknown }).format !== "nvu-run/1"
  ) {
    return { ok: false, reason: "That file is not an nvu-run/1 run file." };
  }
  const file = parsed as RunFile;
  if (!file.run) {
    return { ok: false, reason: "That run was not played from a seed and cannot be replayed." };
  }
  const mismatch = mismatchedField(file);
  if (mismatch !== null) {
    const label = mismatch === "cards" ? "card list" : "rules";
    const recorded = (mismatch === "cards" ? file.cards : file.rules) ?? "none recorded";
    return { ok: false, reason: `That run was recorded on a different ${label} (${recorded}).` };
  }
  return {
    ok: true,
    replay: createReplay(file.run.seed, file.run.commands, file.notes ?? [], content),
  };
}
