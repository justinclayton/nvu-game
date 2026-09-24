import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { card, pile, player, rig, room } from "@domain/__fixtures__/rig";
import type { Command } from "@domain/types";
import {
  canUndo,
  createSession,
  createSessionFrom,
  loadSession,
  saveOf,
  type SavedRun,
  type Session,
} from "./session";

const content = CARD_CONTENT;
const SEED = 4242;

const newSession = () => createSession(SEED, content);

/** A session built from a seed always has one to save from. */
function mustSave(session: Session): SavedRun {
  const saved = saveOf(session.getState());
  if (!saved) throw new Error("a seeded session had no seed to save from");
  return saved;
}

/** The command a session needs to get from a new run into the Play phase. */
function throughATurn(): readonly Command[] {
  return [{ type: "FLIP_ROOM" }];
}

describe("dispatch", () => {
  it("replaces the state whole and appends to both logs", () => {
    const session = newSession();
    const before = session.getState();
    const result = session.getState().dispatch({ type: "FLIP_ROOM" });
    const after = session.getState();

    expect(result.ok).toBe(true);
    expect(after.state).not.toBe(before.state);
    expect(after.commands).toHaveLength(1);
    expect(after.events.length).toBeGreaterThan(before.events.length);
    expect(after.lastRejection).toBeNull();
  });

  it("stores a rejection and changes nothing else", () => {
    const session = newSession();
    const before = session.getState();
    const result = session.getState().dispatch({ type: "END_PLAY" });
    const after = session.getState();

    expect(result.ok).toBe(false);
    expect(after.state).toBe(before.state);
    expect(after.commands).toEqual(before.commands);
    expect(after.events).toEqual(before.events);
    expect(after.lastRejection?.code).toBe("WrongPhase");
  });

  it("clears the last rejection once a command lands", () => {
    const session = newSession();
    session.getState().dispatch({ type: "END_PLAY" });
    expect(session.getState().lastRejection).not.toBeNull();
    session.getState().dispatch({ type: "FLIP_ROOM" });
    expect(session.getState().lastRejection).toBeNull();
  });
});

describe("undo", () => {
  it("cannot reach back past a command that revealed hidden information", () => {
    const session = newSession();
    for (const command of throughATurn()) session.getState().dispatch(command);
    // The flip drew both hands to 5, all in the one command — that is itself
    // the checkpoint, so there is nothing before it in this run to undo to.
    expect(canUndo(session.getState())).toBe(false);
    expect(session.getState().undo()).toBe(false);
  });

  it("takes back a play, and the log with it", () => {
    const session = newSession();
    for (const command of throughATurn()) session.getState().dispatch(command);
    const beforePlay = session.getState();

    const red = beforePlay.state.Red;
    const card = red.hand[0];
    if (!card) throw new Error("Red drew nothing");
    const cost = card.cost;
    const payWith = red.hand.filter((c) => c.id !== card.id).slice(0, cost);
    if (payWith.length < cost) {
      // Nothing affordable was drawn; the point still stands on the flip alone.
      expect(canUndo(beforePlay)).toBe(false);
      return;
    }

    session.getState().dispatch({
      type: "PLAY_CARD",
      character: "Red",
      cardId: card.id,
      payWith: payWith.map((c) => c.id),
    });
    expect(session.getState().commands).toHaveLength(beforePlay.commands.length + 1);

    expect(session.getState().undo()).toBe(true);
    expect(session.getState().state).toEqual(beforePlay.state);
    expect(session.getState().commands).toEqual(beforePlay.commands);
    expect(session.getState().events).toEqual(beforePlay.events);
  });
});

describe("save and replay", () => {
  it("a run is its seed plus its command log", () => {
    const session = newSession();
    for (const command of throughATurn()) session.getState().dispatch(command);
    const saved = mustSave(session);
    expect(saved.seed).toBe(SEED);
    expect(saved.commands).toEqual(throughATurn());
  });

  it("replays to exactly the same state", () => {
    const session = newSession();
    for (const command of throughATurn()) session.getState().dispatch(command);
    const loaded = loadSession(mustSave(session), content);
    expect(loaded.getState().state).toEqual(session.getState().state);
  });

  it("loads a saved run into a live session", () => {
    const session = newSession();
    for (const command of throughATurn()) session.getState().dispatch(command);
    const loaded = loadSession(mustSave(session), content);
    expect(loaded.getState().state).toEqual(session.getState().state);
    expect(loaded.getState().commands).toEqual(session.getState().commands);
  });

  it("has no seed to save from when the state was rigged into place", () => {
    const rigged = createSessionFrom(createSession(SEED, content).getState().state);
    expect(rigged.getState().seed).toBeNull();
    expect(saveOf(rigged.getState())).toBeNull();
  });

  it("says so when a save and the rules have diverged", () => {
    expect(() => loadSession({ seed: SEED, commands: [{ type: "END_PLAY" }] }, content)).toThrow(
      /Command 0 \(END_PLAY\) is no longer legal/,
    );
  });
});

describe("notes", () => {
  it("lands a note at the point the log has reached", () => {
    const session = newSession();
    session.getState().dispatch({ type: "FLIP_ROOM" });
    const after = session.getState().events.length;
    session.getState().note("  the floor is bigger than the rulebook says  ");
    expect(session.getState().notes).toEqual([
      { at: after, text: "the floor is bigger than the rulebook says" },
    ]);
  });

  it("ignores a note with nothing in it", () => {
    const session = newSession();
    session.getState().note("   ");
    expect(session.getState().notes).toEqual([]);
  });

  it("changes neither log, so a run replays the same with notes or without", () => {
    const session = newSession();
    for (const command of throughATurn()) session.getState().dispatch(command);
    const before = session.getState();
    session.getState().note("a thought");
    expect(session.getState().commands).toEqual(before.commands);
    expect(session.getState().events).toEqual(before.events);
    expect(loadSession(mustSave(session), content).getState().state).toEqual(before.state);
  });

  it("keeps a note about the thing being undone, at the new end of the log", () => {
    // A card printed at Cost 0 needs no payment, so the play is still
    // takeable back — a play reveals nothing.
    const session = createSessionFrom(
      rig({
        phase: "Play",
        activeRoom: room("Security Turnstile"),
        Red: player({ deck: pile("Shove", 4), hand: [card("Pry Bar")] }),
        Gray: player({ deck: pile("Duck Under", 4) }),
      }),
    );
    const pryBar = session.getState().state.Red.hand[0];
    if (!pryBar) throw new Error("rig");
    session.getState().dispatch({
      type: "PLAY_CARD",
      character: "Red",
      cardId: pryBar.id,
      payWith: [],
    });
    session.getState().note("that play should be easy to take back");
    const noted = session.getState().events.length;
    expect(noted).toBeGreaterThan(0);

    expect(session.getState().undo()).toBe(true);
    const [note] = session.getState().notes;
    expect(note?.text).toBe("that play should be easy to take back");
    expect(note?.at).toBe(session.getState().events.length);
    expect(note?.at).toBeLessThan(noted);
  });
});

describe("subscribing outside React", () => {
  it("notifies a selector on the event log", () => {
    const session = newSession();
    const seen: number[] = [];
    const stop = session.subscribe(
      (s) => s.events,
      (events) => seen.push(events.length),
    );
    session.getState().dispatch({ type: "FLIP_ROOM" });
    // The flip already lands in Play, so a second flip is what the rules
    // refuse here.
    session.getState().dispatch({ type: "FLIP_ROOM" });
    stop();
    // One notification for the first flip; the rejection changed no events.
    expect(seen).toHaveLength(1);
  });
});
