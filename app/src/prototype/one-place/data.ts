/* PROTOTYPE — throwaway. Static data for the one place sketch (issue #245).
 * Nothing here is read from GitHub or the chain; it is what the screen would
 * show on a plausible morning, so the layouts can be judged with real density.
 */

import type { RunFile } from "@application/exportRun";
import flaggedRun from "./flagged-run.json";

export type Light = "green" | "red" | "running" | "skipped" | "queued";

export interface Stage {
  readonly name: string;
  readonly light: Light;
  readonly detail: string;
}

export interface ChainRun {
  readonly id: number;
  readonly event: string;
  readonly ref: string;
  readonly title: string;
  readonly when: string;
  readonly light: Light;
  readonly stages: readonly Stage[];
}

export interface AgentRun {
  readonly label: string;
  readonly where: "routine" | "local";
  readonly subject: string;
  readonly state: string;
  readonly since: string;
}

export interface Delta {
  readonly metric: string;
  readonly baseline: string;
  readonly changed: string;
}

export interface Pr {
  readonly number: number;
  readonly title: string;
  readonly author: "designer" | "agent" | "routine";
  readonly kind: "proposal" | "behaviour" | "playtest";
  readonly checks: Light;
  readonly stackedOn?: number;
  readonly delta?: readonly Delta[];
  readonly waitingFor: string;
}

export interface Issue {
  readonly number: number;
  readonly title: string;
  readonly kind: "needs-human" | "idea";
  readonly from: string;
  readonly age: string;
}

export interface FlaggedRun {
  readonly seed: number;
  readonly why: string;
  readonly from: string;
  /** The run file, when this sketch can actually open it; null for the ones that are only names. */
  readonly file: RunFile | null;
}

export interface Anomaly {
  readonly kind: string;
  readonly detail: string;
  readonly run?: FlaggedRun | undefined;
}

export interface Report {
  readonly run: number;
  readonly ref: string;
  readonly when: string;
  readonly seeds: number;
  readonly winRate: number;
  readonly baselineWinRate: number;
  readonly floors: readonly { readonly floor: number; readonly runs: number }[];
  readonly endReasons: readonly { readonly reason: string; readonly runs: number }[];
}

const STAGES_GREEN: readonly Stage[] = [
  { name: "build", light: "green", detail: "4 s" },
  { name: "check", light: "green", detail: "12 run files replayed" },
  { name: "app-check", light: "green", detail: "lint, types, 318 tests" },
  { name: "fuzz", light: "green", detail: "5000 seeds, 0 failures" },
  { name: "sim", light: "green", detail: "5000 seeds, 18 s" },
  { name: "compare", light: "green", detail: "no change past noise" },
  { name: "release", light: "skipped", detail: "no version bump" },
];

export const CHAIN_RUNS: readonly ChainRun[] = [
  {
    id: 414,
    event: "PR #252",
    ref: "claude/sentry-drone-5",
    title: "Lower Sentry Drone's Oomph threshold to 5",
    when: "running, 41 s in",
    light: "running",
    stages: [
      { name: "build", light: "green", detail: "4 s" },
      { name: "check", light: "green", detail: "12 run files replayed" },
      { name: "app-check", light: "green", detail: "lint, types, 318 tests" },
      { name: "fuzz", light: "green", detail: "5000 seeds, 0 failures" },
      { name: "sim", light: "running", detail: "3100 of 5000 seeds" },
      { name: "compare", light: "queued", detail: "" },
      { name: "release", light: "skipped", detail: "PR" },
    ],
  },
  {
    id: 413,
    event: "PR #253",
    ref: "claude/spore-cloud-text",
    title: "Behaviour for Spore Cloud's new text",
    when: "today 08:52",
    light: "red",
    stages: [
      { name: "build", light: "green", detail: "4 s" },
      {
        name: "check",
        light: "red",
        detail: "Spore Cloud: quote above the behaviour no longer matches",
      },
      { name: "app-check", light: "queued", detail: "stopped at the first red" },
      { name: "fuzz", light: "queued", detail: "" },
      { name: "sim", light: "queued", detail: "" },
      { name: "compare", light: "queued", detail: "" },
      { name: "release", light: "skipped", detail: "PR" },
    ],
  },
  {
    id: 412,
    event: "push to main",
    ref: "ab4378d",
    title: "Card backs and a double-sided card sheet",
    when: "today 07:14",
    light: "green",
    stages: STAGES_GREEN,
  },
  {
    id: 411,
    event: "push to main",
    ref: "e0e6569",
    title: "Print sheet card design",
    when: "yesterday 22:40",
    light: "green",
    stages: STAGES_GREEN,
  },
];

export const AGENTS: readonly AgentRun[] = [
  {
    label: "gdlc:behaviour-owed",
    where: "routine",
    subject: "PR #253 — Spore Cloud's new text",
    state: "writing the behaviour and its tests",
    since: "6 min",
  },
  {
    label: "gdlc:playtest",
    where: "routine",
    subject: "issue #257 — playtest seed 13",
    state: "turn 9, floor 2",
    since: "14 min",
  },
  {
    label: "button: sim 20000 seeds",
    where: "local",
    subject: "main at ab4378d",
    state: "done 11 min ago, report below",
    since: "",
  },
];

export const NEXT_SCHEDULED = "Nightly playtest opens issue at 02:00; weekly sim at Sunday 03:00.";

export const PRS: readonly Pr[] = [
  {
    number: 252,
    title: "Lower Sentry Drone's Oomph threshold to 5",
    author: "agent",
    kind: "proposal",
    checks: "running",
    delta: [
      { metric: "win rate", baseline: "30.8%", changed: "33.1%" },
      { metric: "runs ending Down on floor 1", baseline: "412", changed: "301" },
      { metric: "Sentry Drone fled", baseline: "1,206", changed: "844" },
      { metric: "Charge In played", baseline: "22,410", changed: "23,002" },
    ],
    waitingFor: "your ruling: merge, or close with why",
  },
  {
    number: 253,
    title: "Behaviour for Spore Cloud's new text",
    author: "agent",
    kind: "behaviour",
    checks: "red",
    stackedOn: 251,
    waitingFor: "the routine; nothing from you yet",
  },
  {
    number: 254,
    title: "Playtest 13: seed 13, a run that stalls on floor 2",
    author: "routine",
    kind: "playtest",
    checks: "green",
    waitingFor: "a read of the note, then merge",
  },
  {
    number: 251,
    title: "Spore Cloud: discard down to 4, not 3",
    author: "designer",
    kind: "proposal",
    checks: "red",
    delta: [
      { metric: "win rate", baseline: "30.8%", changed: "31.4%" },
      { metric: "Spore Cloud: cards discarded per deal", baseline: "2.9", changed: "1.7" },
    ],
    waitingFor: "PR #253 to go green and merge down",
  },
];

export const ISSUES: readonly Issue[] = [
  {
    number: 250,
    title: "Decide Jev's seat in the pipeline",
    kind: "needs-human",
    from: "wayfinder map",
    age: "2 d",
  },
  {
    number: 239,
    title: "Get a TypeSafe account and API key",
    kind: "needs-human",
    from: "wayfinder map",
    age: "2 d",
  },
  {
    number: 255,
    title: "Idea: fleeing the Stairwell should cost a Good Stuff, not deal a Bad Stuff",
    kind: "idea",
    from: "playtest 13",
    age: "40 min",
  },
  {
    number: 256,
    title: "Idea: Peek Around Corner is a dead card; cut it or give it Oomph 1",
    kind: "idea",
    from: "sim, run #412",
    age: "today",
  },
  {
    number: 258,
    title: "Idea: a fourth band on floor 3 so the rooftop is not a cliff",
    kind: "idea",
    from: "playtest 12",
    age: "yesterday",
  },
];

export const FLAGGED: readonly FlaggedRun[] = [
  {
    seed: 12,
    why: "stall candidate: the second room is fled on turn 2 with Red holding two Charge In",
    from: "fuzz, run #412",
    file: flaggedRun as RunFile,
  },
  {
    seed: 2771,
    why: "turn-one win: the floor deck came up all Ventilation Shafts",
    from: "sim, run #412",
    file: null,
  },
  {
    seed: 418,
    why: "over the command budget: 600 commands without reaching floor 2",
    from: "fuzz, run #411",
    file: null,
  },
];

export const ANOMALIES: readonly Anomaly[] = [
  {
    kind: "dead card",
    detail: "Peek Around Corner: played 0 times across 5000 seeds (3 reports running)",
  },
  { kind: "stall", detail: "seed 12 flagged by fuzz", run: FLAGGED[0] },
  { kind: "turn-one win", detail: "seed 2771", run: FLAGGED[1] },
  { kind: "over budget", detail: "seed 418, 600 commands", run: FLAGGED[2] },
  {
    kind: "never offered",
    detail: "Zen Mode: in no reward pool across 5000 seeds",
  },
];

export const REPORTS: readonly Report[] = [
  {
    run: 412,
    ref: "ab4378d",
    when: "today 07:14",
    seeds: 5000,
    winRate: 0.308,
    baselineWinRate: 0.311,
    floors: [
      { floor: 1, runs: 1842 },
      { floor: 2, runs: 1619 },
      { floor: 3, runs: 1539 },
    ],
    endReasons: [
      { reason: "Victory", runs: 1540 },
      { reason: "Defeat (Down)", runs: 3102 },
      { reason: "Aborted (not enough cards)", runs: 358 },
    ],
  },
  {
    run: 411,
    ref: "e0e6569",
    when: "yesterday 22:40",
    seeds: 5000,
    winRate: 0.311,
    baselineWinRate: 0.311,
    floors: [
      { floor: 1, runs: 1830 },
      { floor: 2, runs: 1615 },
      { floor: 3, runs: 1555 },
    ],
    endReasons: [
      { reason: "Victory", runs: 1555 },
      { reason: "Defeat (Down)", runs: 3090 },
      { reason: "Aborted (not enough cards)", runs: 355 },
    ],
  },
];

export const BUILD = { rules: "0.2.6", cards: "0e20e58ce5ce", main: "ab4378d" };
