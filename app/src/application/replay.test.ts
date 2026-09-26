import { describe, expect, it } from "vitest";
import { CARD_LIST_ID } from "@content/index";
import { FULL_CONTENT as CARD_CONTENT } from "@domain/__fixtures__/rig";
import { costOf, payOptions, playableCards } from "@domain/queries";
import { RULES_VERSION } from "@domain/setup";
import type { AscendChoice, Character, Command, GameState } from "@domain/types";
import { runData } from "./exportRun";
import { createReplay, openRunFile } from "./replay";
import { createSession } from "./session";

const content = CARD_CONTENT;
// A seed the driver below plays several turns into before it ends (exportRun.test.ts).
const SEED = 9;

/** A recorded run: the first legal thing on offer, forty times or to the end. */
function recorded(): readonly Command[] {
  const session = createSession(SEED, content);
  for (let step = 0; step < 40; step += 1) {
    const state = session.getState().state;
    if (state.phase === "GameOver") break;
    const result = session.getState().dispatch(nextCommand(state));
    if (!result.ok) throw new Error(result.reason.message);
  }
  return session.getState().commands;
}

function nextCommand(state: GameState): Command {
  const pending = state.pending;
  if (pending) {
    switch (pending.kind) {
      case "ChooseCharacter":
        return { type: "CHOOSE_CHARACTER", character: pending.options[0] ?? "Red" };
      case "ChoosePile":
        return { type: "CHOOSE_PILE", pile: pending.options[0] ?? "Red deck" };
      case "ChooseCards":
        return {
          type: "CHOOSE_CARDS",
          cardIds: pending.options.slice(0, pending.count).map((c) => c.id),
        };
      case "OrderCards":
        return { type: "ORDER_CARDS", cardIds: pending.cards.map((c) => c.id) };
      case "TakeReward":
        return { type: "TAKE_REWARD", take: true };
    }
  }
  switch (state.phase) {
    case "Turn Start":
      return { type: "FLIP_ROOM" };
    case "Play":
      for (const character of ["Red", "Gray"] as const) {
        const play = affordablePlay(state, character);
        if (play) return play;
      }
      return { type: "END_PLAY" };
    case "Ascend":
      return { type: "ASCEND", Red: ascendChoice(state, "Red"), Gray: ascendChoice(state, "Gray") };
    default:
      throw new Error(`${state.phase} should never rest without a pending choice`);
  }
}

function affordablePlay(state: GameState, character: Character): Command | null {
  for (const card of playableCards(state, character)) {
    const cost = costOf(state, character, card);
    const options = payOptions(state, character, card.id);
    if (options.length < cost) continue;
    return {
      type: "PLAY_CARD",
      character,
      cardId: card.id,
      payWith: options.slice(0, cost).map((c) => c.id),
    };
  }
  return null;
}

const ascendChoice = (state: GameState, character: Character): AscendChoice => ({
  takeRewardId: state.offer?.[character][0]?.id ?? null,
});

describe("stepping", () => {
  it("starts at the seed with nothing taken", () => {
    const replay = createReplay(SEED, recorded(), [], content);
    const r = replay.getState();
    expect(r.cursor).toBe(0);
    expect(r.session.getState().commands).toHaveLength(0);
    expect(r.session.getState().state.floor).toBe(1);
  });

  it("forward dispatches the next scripted command into the session", () => {
    const script = recorded();
    const replay = createReplay(SEED, script, [], content);
    expect(replay.getState().stepForward()).toBe(true);
    expect(replay.getState().cursor).toBe(1);
    expect(replay.getState().session.getState().commands).toEqual([script[0]]);
  });

  it("back rebuilds the position it left, state and log alike", () => {
    const script = recorded();
    const replay = createReplay(SEED, script, [], content);
    for (let i = 0; i < 5; i++) replay.getState().stepForward();
    const at5 = replay.getState().session.getState();
    replay.getState().stepForward();
    expect(replay.getState().stepBack()).toBe(true);
    const back = replay.getState().session.getState();
    expect(replay.getState().cursor).toBe(5);
    expect(back.state).toEqual(at5.state);
    expect(back.events).toEqual(at5.events);
    expect(back.history).toHaveLength(0);
  });

  it("stops at both ends", () => {
    const script = recorded();
    const replay = createReplay(SEED, script, [], content);
    expect(replay.getState().stepBack()).toBe(false);
    replay.getState().seek(script.length);
    expect(replay.getState().cursor).toBe(script.length);
    expect(replay.getState().stepForward()).toBe(false);
  });

  it("next turn stops just before the next flip", () => {
    const script = recorded();
    const replay = createReplay(SEED, script, [], content);
    replay.getState().nextTurn();
    const cursor = replay.getState().cursor;
    expect(cursor).toBeGreaterThan(1);
    expect(script[cursor]?.type).toBe("FLIP_ROOM");
    expect(replay.getState().session.getState().state.phase).toBe("Turn Start");
  });

  it("reaches the same end the recording did", () => {
    const script = recorded();
    const whole = createSession(SEED, content);
    for (const c of script) whole.getState().dispatch(c);
    const replay = createReplay(SEED, script, [], content);
    replay.getState().seek(script.length);
    expect(replay.getState().session.getState().state).toEqual(whole.getState().state);
  });
});

describe("notes", () => {
  it("appear only once the log has reached where they were typed", () => {
    const script = recorded();
    const notes = [
      { at: 0, text: "before anything" },
      { at: 10_000, text: "at the very end" },
    ];
    const replay = createReplay(SEED, script, notes, content);
    expect(
      replay
        .getState()
        .session.getState()
        .notes.map((n) => n.text),
    ).toEqual(["before anything"]);
    replay.getState().stepForward();
    expect(replay.getState().session.getState().notes).toHaveLength(1);
  });
});

describe("taking over", () => {
  it("drops the script and leaves the session live", () => {
    const script = recorded();
    const replay = createReplay(SEED, script, [], content);
    replay.getState().stepForward();
    replay.getState().takeOver();
    expect(replay.getState().live).toBe(true);
    expect(replay.getState().stepForward()).toBe(false);
    expect(replay.getState().stepBack()).toBe(false);
    const session = replay.getState().session;
    expect(session.getState().commands).toHaveLength(1);
    expect(session.getState().state.phase).not.toBe("Turn Start");
  });
});

describe("opening a run file", () => {
  it("reads back what the web game exports", () => {
    const session = createSession(SEED, content);
    for (const c of recorded()) session.getState().dispatch(c);
    session.getState().note("a note");
    const opened = openRunFile(runData(session.getState(), new Date(0)).text, content);
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    expect(opened.replay.getState().script).toHaveLength(session.getState().commands.length);
    expect(opened.replay.getState().notes).toHaveLength(1);
  });

  it("refuses what is not a run file", () => {
    expect(openRunFile("not json", content)).toEqual({
      ok: false,
      reason: "That file is not JSON.",
    });
    expect(openRunFile('{"format":"other"}', content).ok).toBe(false);
  });

  it("refuses a run with no seed, and one from other cards or rules", () => {
    const base = {
      format: "nvu-run/1",
      cards: CARD_LIST_ID,
      rules: RULES_VERSION,
      notes: [],
      run: { seed: 1, commands: [] },
    };
    expect(openRunFile(JSON.stringify({ ...base, run: null }), content).ok).toBe(false);
    const cards = openRunFile(JSON.stringify({ ...base, cards: "other" }), content);
    expect(cards.ok).toBe(false);
    if (!cards.ok) expect(cards.reason).toMatch(/card list/);
    const rules = openRunFile(JSON.stringify({ ...base, rules: "0.0.0" }), content);
    expect(rules.ok).toBe(false);
    if (!rules.ok) expect(rules.reason).toMatch(/rules/);
  });
});
