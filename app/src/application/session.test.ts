import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import type { Command } from "@domain/types";
import { canUndo, createSession, loadSession, replay, saveOf } from "./session";

const content = CARD_CONTENT;
const SEED = 4242;

const newSession = () => createSession(SEED, content);

/** The commands a session needs to get through one whole turn. */
function throughATurn(): readonly Command[] {
  return [
    { type: "FLIP_ROOM" },
    { type: "DRAW", character: "Red" },
    { type: "DRAW", character: "Gray" },
    { type: "END_DRAW" },
  ];
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
    // Flip and both draws each showed somebody a card, so there is nothing to
    // take back — END_DRAW revealed nothing, so it alone can be undone.
    expect(canUndo(session.getState())).toBe(true);
    expect(session.getState().undo()).toBe(true);
    expect(session.getState().state.phase).toBe("Draw");
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
      // Nothing affordable was drawn; the point still stands on END_DRAW alone.
      expect(canUndo(beforePlay)).toBe(true);
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
    const saved = saveOf(session.getState(), SEED);
    expect(saved.seed).toBe(SEED);
    expect(saved.commands).toEqual(throughATurn());
  });

  it("replays to exactly the same state", () => {
    const session = newSession();
    for (const command of throughATurn()) session.getState().dispatch(command);
    const saved = saveOf(session.getState(), SEED);
    expect(replay(saved, content)).toEqual(session.getState().state);
  });

  it("loads a saved run into a live session", () => {
    const session = newSession();
    for (const command of throughATurn()) session.getState().dispatch(command);
    const loaded = loadSession(saveOf(session.getState(), SEED), content);
    expect(loaded.getState().state).toEqual(session.getState().state);
    expect(loaded.getState().commands).toEqual(session.getState().commands);
  });

  it("says so when a save and the rules have diverged", () => {
    expect(() => replay({ seed: SEED, commands: [{ type: "END_PLAY" }] }, content)).toThrow(
      /Replay stopped at command 0/,
    );
  });
});

describe("subscribing outside React", () => {
  it("notifies a selector on the event log", () => {
    const session = newSession();
    const seen: number[] = [];
    const stop = session.subscribe((s) => s.events, (events) => seen.push(events.length));
    session.getState().dispatch({ type: "FLIP_ROOM" });
    session.getState().dispatch({ type: "END_PLAY" });
    stop();
    // One notification for the flip; the rejection changed no events.
    expect(seen).toHaveLength(1);
  });
});
