# Previous Agentic GDLC: bounded decision audit

This historical audit identifies reusable decisions and constraints from closed issues #241, #245, #240 and #237; it is **not an accepted specification for the new effort**. Use the proposals below to seed fresh decisions, not to reactivate the old backlog. Only these issues’ complete bodies/comments and the linked solver and API write-ups were inspected. No current API validation or benchmark rerun was performed.

## Recorded human approvals

**Chain (#241).** The resolution explicitly attributes its decisions to `[you]`, separately marking agent proposals approved by the human. It rules: “One pipeline, not five”; a fail-fast deterministic chain ordered build → check → app-check → fuzz → sim → compare, with release conditional on a rules-version bump. Checks replay committed playtests; reports compare against the last baseline on `main`. Deterministic code “never names an agent harness”: GitHub labels communicate work owed, and Actions owns result-derived PR labels. Tools glue belongs in `tools/`, without adding CLI verbs. These are recorded approvals, not proof of implementation. [Chain ruling][chain]

The approved deterministic boundary accommodates structured card changes, while changed printed text, missing behavior, renames and rulebook edits require code work. This supports **generation plus explicit behavior maintenance**, not a general card-text transpiler. Approved agent-origin defaults include every-PR/push execution, no path filter, one sim per PR, and 5,000 seeds each for fuzz and sim. “About a minute” appears as rationale, not a benchmark supplied by these sources. [Chain ruling][chain]

**Workbench (#245).** The recorded human ruling selects “A, Workbench”, “more or less”: a new app with four tabs, Status first, and the existing table unchanged as one tab. This approves layout preference, not production architecture or working review controls. The preceding agent sketch says everything except a real replay was static and Merge/Close/Answer did nothing; the prototype was never to merge. [Sketch][sketch]; [layout ruling][layout]

## Measurements and agent interpretations

**Solver (#240).** The resolution reports “Not tractable as specced” for exhaustive whole-seed enumeration and line counting. Unlike #241/#245, it does not explicitly tag that conclusion as a human ruling; treat it as the prototype’s measured conclusion. Measurements are dated 2026-10-01, at `ab4378d`, Node 26, on a 32 GB laptop. [Solver resolution][solver]; [full measurements][solver-note]

Five sampled first turns took 5–17 seconds and 59–155 MB; seed 7 took **246 seconds, 6,514,207 states and 2.3 GB**. Its dual discard choices multiplied exits by roughly 100. Seed 1’s second turn exhausted a four-million-state budget after only **34 of 15,474 roots**, in 248 seconds with 4.0 GB heap. The projected day/hundreds-of-gigabytes cost is extrapolation, not a completed measurement. Transposition reduced repeated work but hashing dominated per-node cost. [Full measurements][solver-note]

The suggested per-turn hindsight oracle, early-exit winning-line search and symmetry reductions are explicitly “the agent’s reading … not decisions.” The universal “seconds and megabytes” oracle claim is too strong given seed 7. An ordering cap for more than four cards did not trigger in the reported first-turn walks, but remains a completeness debt. A found winning line is evidence of existence; “not found” is not proof of impossibility. [Full measurements][solver-note]

## Dated research, not new API guarantees

**GitHub (#237).** This was “Facts only; no recommendation.” Its write-up separates documented claims, read-only observations dated 2026-10-01, and unresolved questions. It reports native issue dependencies/sub-issues, separate PR checks retrieval, ref-based contents reads, and both REST/GraphQL Projects access. These are integration leads, not current contracts. [Research resolution][api]; [API write-up][api-note]

The `gh` OAuth credential covered tested **reads**, not verified writes. Historical fine-grained PAT limitations, user-owned Projects access for Apps, artifact redirect browser behavior and raw-host guarantees require fresh validation. There were no artifacts in this repository for end-to-end testing. CORS permitting calls does not justify exposing credentials to a browser. [API write-up][api-note]

## Proposals for the new effort

- **Carry forward the seam:** keep existing Makefile/`bin/nvu` machinery deterministic and harness-neutral; let a small TypeScript pi controller coordinate experiments through GitHub readiness, human-wait labels, dependencies and PRs.
- **Replace Claude coupling:** discard Routines, one-routine-per-label dispatch, label-edge suppression as concurrency control, and mandatory `claude/` branches. Preserve explicit work signals, not the old launcher. Durable waits and approval checkpoints need new design; the four sources do not establish them.
- **Defer inherited scale:** retain the workbench as a later UI preference, not a dashboard prerequisite. Reconsider fixed seed counts, every-push full measurement and baseline/storage conventions while metrics remain immature and replaceable.
- **Budget evaluation:** avoid exhaustive seed counting; bound time, states and memory, expose incomplete results, and benchmark exceptional turns before promising an oracle. Validate only the GitHub endpoints/authentication needed by the first experiment slice, especially writes and approval enforcement.

[chain]: https://github.com/justinclayton/nvu-game/issues/241#issuecomment-5947675325
[sketch]: https://github.com/justinclayton/nvu-game/issues/245#issuecomment-5947956447
[layout]: https://github.com/justinclayton/nvu-game/issues/245#issuecomment-5956104302
[solver]: https://github.com/justinclayton/nvu-game/issues/240#issuecomment-5946082412
[solver-note]: https://github.com/justinclayton/nvu-game/blob/prototype/seed-solver/design/agentic-gdlc/prototypes/seed-solver.md
[api]: https://github.com/justinclayton/nvu-game/issues/237#issuecomment-5943668100
[api-note]: https://github.com/justinclayton/nvu-game/blob/research/github-api/design/agentic-gdlc/research/github-api.md
