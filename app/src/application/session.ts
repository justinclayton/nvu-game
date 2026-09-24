/* The session: one run, and everything a driver needs to push it along.
 *
 * React-free on purpose — a replay runner, a headless test or a future bot can
 * drive a session without a browser. The rules are not here: the session holds
 * the logs, decides what may be taken back, and hands every command to the
 * engine.
 */

import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

import { execute } from "@domain/engine";
import { revealsHiddenInfo } from "@domain/queries";
import { createInitialState } from "@domain/setup";
import type { CardContent } from "@domain/printed";
import type { Command, DomainEvent, GameState, Rejection, Result } from "@domain/types";

/** One step back. The counts say how much of each log the step owned. */
export interface HistoryEntry {
  readonly state: GameState;
  readonly commands: number;
  readonly events: number;
}

/**
 * Something a playtester typed while playing. A note is not a rule and not a
 * command: it never reaches the engine, and a run replays the same with notes
 * or without them. `at` is how many events had happened when it was typed, so
 * the note reads back between the same two log lines it was typed between.
 */
export interface Note {
  readonly at: number;
  readonly text: string;
}

export interface SessionState {
  readonly state: GameState;
  /**
   * The seed this run started from — the replay origin, with `commands`. Null
   * when the session was rigged into place instead of played from a seed,
   * which only the dev fixture loader does; such a run cannot be replayed.
   */
  readonly seed: number | null;
  /** The replay source. Saving a run is the seed plus this. */
  readonly commands: readonly Command[];
  /** The narrative. Sound, animation and the text log read it. */
  readonly events: readonly DomainEvent[];
  /** What the playtester typed, each anchored to a position in `events`. */
  readonly notes: readonly Note[];
  /** Undoable steps, back as far as the last checkpoint. */
  readonly history: readonly HistoryEntry[];
  /** The last command the rules refused, for the UI to show. */
  readonly lastRejection: Rejection | null;

  dispatch(command: Command): Result;
  undo(): boolean;
  /** Write a note into the log at wherever the log has reached. */
  note(text: string): void;
}

/** Saving a run is the seed plus the command log; loading is a fold. */
export interface SavedRun {
  readonly seed: number;
  readonly commands: readonly Command[];
}

/**
 * Build a session from a state already in hand, with whatever events led to
 * it. `createSession` is this plus `createInitialState`; a fixture loader is
 * this plus a rigged state, and needs nothing else from the session.
 */
export function createSessionFrom(
  initial: GameState,
  events: readonly DomainEvent[] = [],
  seed: number | null = null,
) {
  return createStore<SessionState>()(
    subscribeWithSelector((set, get) => ({
      state: initial,
      seed,
      commands: [],
      events,
      notes: [],
      history: [],
      lastRejection: null,

      dispatch(command) {
        const before = get();
        const result = execute(before.state, command);
        if (!result.ok) {
          // A rejection changes nothing else. The state is untouched.
          set({ lastRejection: result.reason });
          return result;
        }
        // Undo reaches back to the last command that revealed hidden
        // information. Playing and paying can be taken back; seeing a card
        // cannot, so a revealing command clears the stack behind it.
        const checkpoint = revealsHiddenInfo(result.events);
        set({
          state: result.state,
          commands: [...before.commands, command],
          events: [...before.events, ...result.events],
          history: checkpoint
            ? []
            : [
                ...before.history,
                {
                  state: before.state,
                  commands: before.commands.length,
                  events: before.events.length,
                },
              ],
          lastRejection: null,
        });
        return result;
      },

      undo() {
        const before = get();
        const step = before.history[before.history.length - 1];
        if (!step) return false;
        set({
          state: step.state,
          commands: before.commands.slice(0, step.commands),
          events: before.events.slice(0, step.events),
          // Undo never throws a note away — a note about the thing being taken
          // back is the most useful kind. One left past the rewound end of the
          // log moves to the new end, which is the earliest place it can still
          // be read in order.
          notes: before.notes.map((n) => (n.at > step.events ? { ...n, at: step.events } : n)),
          history: before.history.slice(0, -1),
          lastRejection: null,
        });
        return true;
      },

      note(text) {
        const trimmed = text.trim();
        if (trimmed === "") return;
        const before = get();
        set({ notes: [...before.notes, { at: before.events.length, text: trimmed }] });
      },
    })),
  );
}

/** The store, with `subscribeWithSelector`'s extra `subscribe` overload intact. */
export type Session = ReturnType<typeof createSessionFrom>;

export function createSession(seed: number, content: CardContent): Session {
  const [initial, events] = createInitialState(seed, content);
  return createSessionFrom(initial, events, seed);
}

export const canUndo = (session: SessionState): boolean => session.history.length > 0;

/** The run as replayable data, or null for a session with no seed to replay from. */
export const saveOf = (session: SessionState): SavedRun | null =>
  session.seed === null ? null : { seed: session.seed, commands: session.commands };

/**
 * Load a saved run into a live session by replaying its commands into it. The
 * notes are handed back separately, because they are not part of what the
 * engine replays — each one goes back to the position in the log it was typed
 * at, so a loaded run reads exactly as it did when it was exported.
 */
export function loadSession(
  saved: SavedRun,
  content: CardContent,
  notes: readonly Note[] = [],
): Session {
  const session = createSession(saved.seed, content);
  for (const command of saved.commands) {
    const result = session.getState().dispatch(command);
    if (!result.ok) {
      throw new Error(`Could not load the saved run: ${result.reason.message}`);
    }
  }
  session.setState({ notes });
  return session;
}
