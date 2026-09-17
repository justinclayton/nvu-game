import { describe, expect, it } from "vitest";

import { CARD_CONTENT } from "@content/index";
import { costOf, payOptions, playableCards } from "@domain/queries";
import type { AscendChoice, Character, Command, GameState } from "@domain/types";
import { EXPORTS, runData, runTranscript, runTurns, turnRows, type RunFile } from "./exportRun";
import { createSession, loadSession, type Session } from "./session";

const content = CARD_CONTENT;
const SEED = 20260917;
const WHEN = new Date("2026-09-17T09:30:00.000Z");

/**
 * Plays a real run to its end, taking the first legal thing on offer every
 * time. Deterministic, so the same seed gives the same log — which is what
 * makes it worth exporting and loading back.
 */
function playOut(session: Session, stopAfter = 600): void {
  for (let step = 0; step < stopAfter; step += 1) {
    const state = session.getState().state;
    if (state.phase === "GameOver") return;
    const result = session.getState().dispatch(nextCommand(state));
    if (!result.ok)
      throw new Error(`the driver played something illegal: ${result.reason.message}`);
  }
  throw new Error("the run did not end");
}

function nextCommand(state: GameState): Command {
  const pending = state.pending;
  if (pending) {
    switch (pending.kind) {
      case "ChooseCharacter":
        return { type: "CHOOSE_CHARACTER", character: pending.options[0] ?? "Red" };
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
    case "Flip":
      return { type: "FLIP_ROOM" };
    case "Draw":
      return { type: "END_DRAW" };
    case "Play": {
      for (const character of ["Red", "Gray"] as const) {
        const play = affordablePlay(state, character);
        if (play) return play;
      }
      return { type: "END_PLAY" };
    }
    case "Ascend":
      return { type: "ASCEND", Red: ascendChoice(state, "Red"), Gray: ascendChoice(state, "Gray") };
    case "GameOver":
      throw new Error("the run is over");
  }
}

function affordablePlay(state: GameState, character: Character) {
  for (const card of playableCards(state, character)) {
    const cost = costOf(state, character, card);
    const options = payOptions(state, character, card.id);
    if (options.length < cost) continue;
    return {
      type: "PLAY_CARD" as const,
      character,
      cardId: card.id,
      payWith: options.slice(0, cost).map((c) => c.id),
    };
  }
  return null;
}

const ascendChoice = (state: GameState, character: Character): AscendChoice => ({
  keepStuffId: null,
  scrapId: null,
  takeRewardId: state.offer?.[character][0]?.id ?? null,
});

/** A run with notes typed into it at three different points. */
function playedAndNoted(): Session {
  const session = createSession(SEED, content);
  session.getState().note("first thought, before anything happened");
  session.getState().dispatch({ type: "FLIP_ROOM" });
  session.getState().note("that room again");
  playOut(session);
  session.getState().note("last thought, after the run ended");
  return session;
}

describe("the transcript (.txt)", () => {
  it("numbers every line, and a note is a line like any other", () => {
    const session = playedAndNoted();
    const text = runTranscript(session.getState(), WHEN).text;
    const lines = text.split("\n");

    expect(lines[0]).toBe("North vs Up — playtest log");
    expect(text).toContain(`seed ${String(SEED)}`);
    expect(text).toContain("exported 2026-09-17T09:30:00.000Z");

    const numbered = lines.filter((l) => /^\s*\d+\. /.test(l));
    const notes = session.getState().notes;
    expect(numbered).toHaveLength(session.getState().events.length + notes.length);
    expect(notes).toHaveLength(3);
    // A note anchored at event `at`, with `i` notes before it, is that line.
    for (const [i, note] of notes.entries()) {
      expect(numbered[note.at + i]).toContain(`NOTE — ${note.text}`);
    }
    expect(numbered[numbered.length - 1]).toContain("NOTE — last thought, after the run ended");
  });

  it("names the file after the seed, so two runs never collide", () => {
    const file = runTranscript(createSession(SEED, content).getState(), WHEN);
    expect(file.filename).toBe(`nvu-run-${String(SEED)}-2026-09-17T09-30-00.txt`);
    expect(file.mime).toBe("text/plain");
  });
});

describe("one row per turn (.csv)", () => {
  it("counts what the events say, and files each note under the turn it was typed in", () => {
    const session = playedAndNoted();
    const rows = turnRows(
      session.getState().events,
      session.getState().notes,
      session.getState().state.turn,
      session.getState().state.floor,
    );

    expect(rows.length).toBeGreaterThan(1);
    const first = rows[0];
    expect(first?.turn).toBe(1);
    expect(first?.floor).toBe(1);
    expect(first?.room).not.toBe("");
    expect((first?.red_drew ?? 0) + (first?.gray_drew ?? 0)).toBeGreaterThan(0);
    expect(first?.notes).toBe("first thought, before anything happened | that room again");

    // Every card the log says was drawn is counted exactly once.
    const drawn = session.getState().events.filter((e) => e.type === "CARD_DRAWN").length;
    const counted = rows.reduce((sum, r) => sum + r.red_drew + r.gray_drew, 0);
    expect(counted).toBe(drawn);
  });

  it("quotes a cell that would otherwise break the row", () => {
    const session = createSession(SEED, content);
    session.getState().dispatch({ type: "FLIP_ROOM" });
    session.getState().note('the room says "Oomph 2", the card says otherwise');
    const text = runTurns(session.getState(), WHEN).text;
    expect(text).toContain('"the room says ""Oomph 2"", the card says otherwise"');
    // Header comment, column names, then the turn in progress.
    const lines = text.trimEnd().split("\n");
    expect(lines[0]?.startsWith("# North vs Up")).toBe(true);
    expect(lines[1]?.startsWith("turn,floor,room,kind,outcome")).toBe(true);
    expect(lines).toHaveLength(3);
  });
});

describe("the run itself (.json)", () => {
  it("carries the seed and the command log", () => {
    const session = playedAndNoted();
    const file = JSON.parse(runData(session.getState(), WHEN).text) as RunFile;

    expect(file.format).toBe("nvu-run/1");
    expect(file.run?.seed).toBe(SEED);
    expect(file.run?.commands).toEqual(session.getState().commands);
    expect(file.notes).toEqual(session.getState().notes);
    expect(file.log).toHaveLength(session.getState().events.length);
  });

  it("replays to the same event log, with the notes back where they were typed", () => {
    const session = playedAndNoted();
    const file = JSON.parse(runData(session.getState(), WHEN).text) as RunFile;
    const run = file.run;
    if (!run) throw new Error("a run played from a seed exported no seed");

    const loaded = loadSession({ seed: run.seed, commands: run.commands }, content, file.notes);

    expect(loaded.getState().state).toEqual(session.getState().state);
    expect(loaded.getState().events).toEqual(session.getState().events);
    expect(loaded.getState().notes).toEqual(session.getState().notes);
    // The proof a reader cares about: the same run reads back the same way.
    expect(runTranscript(loaded.getState(), WHEN).text).toBe(
      runTranscript(session.getState(), WHEN).text,
    );
  });

  it("says there is no seed when the session was rigged into place", () => {
    const session = playedAndNoted();
    const rigged = { ...session.getState(), seed: null };
    const file = JSON.parse(runData(rigged, WHEN).text) as RunFile;
    expect(file.run).toBeNull();
    // The notes and the readable log survive; only the replay does not.
    expect(file.notes).toEqual(session.getState().notes);
    expect(runTranscript(rigged, WHEN).text).toContain("seed none");
  });
});

describe("the three formats", () => {
  it("are offered as .txt, .csv and .json, each with its own mime type", () => {
    const session = playedAndNoted().getState();
    const built = EXPORTS.map(({ build }) => build(session, WHEN));
    expect(EXPORTS.map((e) => e.extension)).toEqual(["txt", "csv", "json"]);
    expect(built.map((f) => f.mime)).toEqual(["text/plain", "text/csv", "application/json"]);
    for (const file of built) expect(file.text.endsWith("\n")).toBe(true);
  });
});
