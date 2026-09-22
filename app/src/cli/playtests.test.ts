/* Every run file under design/playtests/ replays to the final state and
 * outcome it recorded. A rules change that breaks a saved playtest fails this
 * check (design/cli-sim/spec.md, Checks: "Saved runs replay").
 *
 * `PRE_0_2` is every run recorded before design/rulebook-0.2-draft.md: they
 * played DRAW and END_DRAW commands and the 0.1 shape of ASCEND, neither of
 * which the engine accepts any more, so they cannot replay against it. #83
 * (not yet landed) is where a run's own rules version becomes the thing this
 * check reads, so this list can retire itself; until then it is named by
 * hand. The files stay in the repo as the record they are — this only stops
 * the automated replay check from reading them. */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CARD_CONTENT } from "@content/index";
import { replay } from "@application/session";
import type { RunFile } from "@application/exportRun";

const PRE_0_2 = new Set(["03-first-agent-cli-run.json"]);

const dir = join(process.cwd(), "..", "design", "playtests");
const files = existsSync(dir)
  ? readdirSync(dir).filter((name) => name.endsWith(".json") && !PRE_0_2.has(name))
  : [];

describe("saved playtest runs", () => {
  if (files.length === 0) {
    it("has no run files to replay yet", () => {
      expect(files).toEqual([]);
    });
  }

  for (const file of files) {
    it(`replays ${file} to its recorded final state`, () => {
      const parsed: unknown = JSON.parse(readFileSync(join(dir, file), "utf8"));
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        (parsed as { format?: unknown }).format !== "nvu-run/1"
      ) {
        throw new Error(`${file} is not an nvu-run/1 run file.`);
      }
      const run = parsed as RunFile;
      if (!run.run) throw new Error(`${file} was not played from a seed and cannot replay.`);
      const state = replay(run.run, CARD_CONTENT);
      expect(state.floor).toBe(run.floor);
      expect(state.turn).toBe(run.turn);
      expect(state.outcome).toBe(run.outcome);
    });
  }
});
