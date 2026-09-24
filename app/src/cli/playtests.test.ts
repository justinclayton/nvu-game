/* Every run file under design/playtests/ replays to the final state and
 * outcome it recorded. A rules change that breaks a saved playtest fails this
 * check (design/cli-sim/spec.md, Checks: "Saved runs replay").
 *
 * A run recorded on a different card list than `CARD_LIST_ID` cannot replay —
 * the cards it names may no longer exist, or mean something else — so it is
 * skipped rather than played, and named in the output as it is skipped. The
 * files stay in the repo as the record they are; this only stops the
 * automated replay check from reading them. */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CARD_CONTENT, CARD_LIST_ID } from "@content/index";
import { loadSession } from "@application/session";
import type { RunFile } from "@application/exportRun";

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

const runs = names.map((file) => ({ file, run: loadRun(file) }));
const current = runs.filter(({ run }) => run.cards === CARD_LIST_ID);
const skipped = runs.filter(({ run }) => run.cards !== CARD_LIST_ID);

for (const { file, run } of skipped) {
  console.log(
    `${file}: skipped — recorded on card list ${run.cards ?? "(none recorded)"}, this build is ${CARD_LIST_ID}.`,
  );
}

describe("saved playtest runs", () => {
  if (current.length === 0) {
    it("has no run files on the current card list to replay", () => {
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
