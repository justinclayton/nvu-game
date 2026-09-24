/* Every run file under design/playtests/ replays to the final state and
 * outcome it recorded. A rules change that breaks a saved playtest fails this
 * check (design/cli-sim/spec.md, Checks: "Saved runs replay").
 *
 * A run recorded on a different card list or rules version than this build's
 * cannot replay — the cards it names may no longer exist or mean something
 * else, and a rules change may have changed what the same commands do — so
 * it is skipped rather than played, and named in the output as it is
 * skipped, along with which field differs. The files stay in the repo as the
 * record they are; this only stops the automated replay check from reading
 * them. */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CARD_CONTENT, CARD_LIST_ID } from "@content/index";
import { loadSession } from "@application/session";
import { mismatchedField, type RunFile } from "@application/exportRun";
import { RULES_VERSION } from "@domain/setup";

const dir = join(process.cwd(), "..", "design", "playtests");
const names = existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith(".json")) : [];

function loadRun(file: string): RunFile {
  const parsed: unknown = JSON.parse(readFileSync(join(dir, file), "utf8"));
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as { format?: unknown }).format !== "nvu-run/1"
  ) {
    throw new Error(`${file} is not an nvu-run/1 run file.`);
  }
  return parsed as RunFile;
}

/** Which of a set of saved runs the current build can replay, and one line for each it must skip, naming which field differs. */
export function partitionRuns(runs: readonly { readonly file: string; readonly run: RunFile }[]): {
  readonly current: readonly { readonly file: string; readonly run: RunFile }[];
  readonly skipMessages: readonly string[];
} {
  const current: { readonly file: string; readonly run: RunFile }[] = [];
  const skipMessages: string[] = [];
  for (const entry of runs) {
    const field = mismatchedField(entry.run);
    if (field === null) {
      current.push(entry);
      continue;
    }
    const recorded = (field === "cards" ? entry.run.cards : entry.run.rules) ?? "(none recorded)";
    const build = field === "cards" ? CARD_LIST_ID : RULES_VERSION;
    skipMessages.push(`${entry.file}: skipped — recorded ${field} ${recorded}, this build is ${build}.`);
  }
  return { current, skipMessages };
}

const runs = names.map((file) => ({ file, run: loadRun(file) }));
const { current, skipMessages } = partitionRuns(runs);
for (const message of skipMessages) console.log(message);

describe("saved playtest runs", () => {
  if (current.length === 0) {
    it("has no run files on the current build to replay", () => {
      expect(current).toEqual([]);
    });
  }

  for (const { file, run } of current) {
    it(`replays ${file} to its recorded final state`, () => {
      if (!run.run) throw new Error(`${file} was not played from a seed and cannot replay.`);
      const state = loadSession(run.run, CARD_CONTENT).getState().state;
      expect(state.floor).toBe(run.floor);
      expect(state.turn).toBe(run.turn);
      expect(state.outcome).toBe(run.outcome);
    });
  }
});

describe("the replay check", () => {
  const base: RunFile = {
    format: "nvu-run/1",
    exportedAt: "2026-01-01T00:00:00.000Z",
    cards: CARD_LIST_ID,
    rules: RULES_VERSION,
    floor: 1,
    turn: 1,
    phase: "Play",
    outcome: null,
    run: { seed: 1, commands: [] },
    notes: [],
    log: [],
  };

  it("skips a run recorded on a different rules version, even when the cards match", () => {
    const run: RunFile = { ...base, rules: "0.0.0" };
    const partitioned = partitionRuns([{ file: "fake.json", run }]);
    expect(partitioned.current).toEqual([]);
    expect(partitioned.skipMessages).toEqual([
      `fake.json: skipped — recorded rules 0.0.0, this build is ${RULES_VERSION}.`,
    ]);
  });

  it("skips a run missing cards or rules altogether, naming cards first", () => {
    const run: RunFile = {
      format: "nvu-run/1",
      exportedAt: "2026-01-01T00:00:00.000Z",
      floor: 1,
      turn: 1,
      phase: "Play",
      outcome: null,
      run: { seed: 1, commands: [] },
      notes: [],
      log: [],
    };
    const partitioned = partitionRuns([{ file: "old.json", run }]);
    expect(partitioned.current).toEqual([]);
    expect(partitioned.skipMessages).toEqual([
      `old.json: skipped — recorded cards (none recorded), this build is ${CARD_LIST_ID}.`,
    ]);
  });

  it("replays a run whose cards and rules both match the current build", () => {
    const partitioned = partitionRuns([{ file: "fine.json", run: base }]);
    expect(partitioned.skipMessages).toEqual([]);
    expect(partitioned.current).toEqual([{ file: "fine.json", run: base }]);
  });
});
