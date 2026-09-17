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

export interface SessionState {
  readonly state: GameState;
  /** The replay source. Saving a run is the seed plus this. */
  readonly commands: readonly Command[];
  /** The narrative. Sound, animation and the text log read it. */
  readonly events: readonly DomainEvent[];
  /** Undoable steps, back as far as the last checkpoint. */
  readonly history: readonly HistoryEntry[];
  /** The last command the rules refused, for the UI to show. */
  readonly lastRejection: Rejection | null;

  dispatch(command: Command): Result;
  undo(): boolean;
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
export function createSessionFrom(initial: GameState, events: readonly DomainEvent[] = []) {
  return createStore<SessionState>()(
    subscribeWithSelector((set, get) => ({
      state: initial,
      commands: [],
      events,
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
          history: before.history.slice(0, -1),
          lastRejection: null,
        });
        return true;
      },
    })),
  );
}

/** The store, with `subscribeWithSelector`'s extra `subscribe` overload intact. */
export type Session = ReturnType<typeof createSessionFrom>;

export function createSession(seed: number, content: CardContent): Session {
  const [initial, events] = createInitialState(seed, content);
  return createSessionFrom(initial, events);
}

export const canUndo = (session: SessionState): boolean => session.history.length > 0;

export const saveOf = (session: SessionState, seed: number): SavedRun => ({
  seed,
  commands: session.commands,
});

/**
 * Replay a saved run: a fold of `execute` over the command log. A command the
 * rules now refuse means the save and the rules have diverged, which is worth
 * saying out loud rather than silently truncating the run.
 */
export function replay(saved: SavedRun, content: CardContent): GameState {
  const [state] = createInitialState(saved.seed, content);
  let current = state;
  for (const [index, command] of saved.commands.entries()) {
    const result = execute(current, command);
    if (!result.ok) {
      throw new Error(
        `Replay stopped at command ${String(index)} (${command.type}): ${result.reason.message}`,
      );
    }
    current = result.state;
  }
  return current;
}

/** Load a saved run into a live session by replaying its commands into it. */
export function loadSession(saved: SavedRun, content: CardContent): Session {
  const session = createSession(saved.seed, content);
  for (const command of saved.commands) {
    const result = session.getState().dispatch(command);
    if (!result.ok) {
      throw new Error(`Could not load the saved run: ${result.reason.message}`);
    }
  }
  return session;
}
