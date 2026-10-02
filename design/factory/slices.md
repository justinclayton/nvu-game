# Pi game factory: vertical slices

This is the implementation breakdown for the [factory spec](spec.md). Each slice ends in an observable task or experiment outcome, not merely a schema, adapter, or scaffold.

**Status:** the designer approved publishing slices 1–5 as the first wave. Slices 6–13 remain proposals, not approved tickets. Numbers below are plan references, not GitHub issue numbers. Use a fresh parent and project; do not reuse the previous GDLC map.

**Types:** HITL requires a designer decision or real playtest. AFK implementation can proceed once its contracts and blockers are settled; it does not authorize autonomous design rulings, merges, or publication.

## Proposed slices

| # | Slice | Type | Blocked by | Demonstrable outcome |
| --- | --- | --- | --- | --- |
| 1 | Set the operating, approval, and evidence-ownership contract | HITL | None | An operator can state where work runs, what it may do, how approval works, and what survives a restart. |
| 2 | Run one investigation issue through pi and report to GitHub | AFK | 1 | A manually selected issue produces a bounded, traceable result without an interactive pi session. |
| 3 | Recover or cancel an interrupted attempt without duplicating work | AFK | 2 | Interrupt a run, restart, and reconcile it without duplicate sessions or GitHub results. |
| 4 | Turn one approved implementation issue into a verified PR | AFK | 3 | A scoped pi worker changes a private worktree; independent checks determine whether a PR is ready. |
| 5 | Dispatch eligible GitHub issues through a standalone watcher | AFK | 4 | A readiness-label change reaches pi automatically; blocked, stale, or duplicate work does not run. |
| 6 | Execute a bounded experiment and attach versioned evidence | AFK | 2 | An approved brief selects existing tools and receives interpretable evidence without requiring calibrated balance metrics. |
| 7 | Independently check a candidate's rules fidelity | AFK | 6 | A source-derived example detects an implementation mismatch or escalates ambiguous semantics. |
| 8 | Run a source-blind agent playtest and retain its run file | AFK | 6 | A player-facing agent completes or bounds a run, writes observations, and returns replayable evidence. |
| 9 | Prepare an immutable physical prototype kit | AFK | 6 | A selected candidate produces identified cards, rules, component counts, and a focused test brief. |
| 10 | Capture physical feedback and a revision-bound designer decision | AFK | 9 | Partial human observations remain verbatim; only an explicit decision for the tested candidate advances the experiment. |
| 11 | Complete one real experiment from observation to decision | HITL | 6, 9, 10 | A physical test establishes whether the lifecycle helps reach a supported decision; missing or misleading evidence becomes concrete follow-up work. |
| 12 | Prototype a thin workbench around the existing table | HITL | 5, 6, 10 | The designer can inspect work/evidence and reach play/replay without rebuilding the table; the interface and app seam get a ruling before production UI work. |
| 13 | Publish only an explicitly authorized snapshot bundle | AFK | 9, 10, 11 | A named, approved kit reaches a GitHub Release with provenance and no duplicate or stale publication. |

Slices 7 and 8 can proceed in parallel with kit/feedback work. Slice 11 does not require them unless its approved brief calls for their evidence. A semantic implementation change still owes the applicable rules-fidelity checks; selecting a numbers-only or existing-snapshot experiment avoids inventing such a requirement.

## First wave: replace the execution machinery

### 1. Set the operating, approval, and evidence-ownership contract

Choose the smallest environment sufficient to run one investigation safely, then define what must be added before writable or unattended execution. Suggested starting point: the designer's laptop with an explicitly started foreground controller. This is a proposal, not a deployment decision.

Acceptance criteria:

- The initial host, model/provider access, GitHub credentials, and process lifecycle are chosen without putting secrets in issues or artifacts.
- The capability boundary, budgets, cancellation behavior, and conditions for unattended writable work are explicit.
- Task kind, authorized scope, revision identity, and human decision representation have an agreed minimal contract.
- Durable attempt ownership, state storage, artifact location, retention, and recovery responsibilities are settled enough for slices 2–5. Current balance-report schemas remain open.

### 2. Run one investigation issue through pi and report to GitHub

A Make-driven manual invocation reads an eligible issue, pins its task and source revision, launches an investigation session with the chosen read-only capabilities, and posts a concise result with trace/evidence references. The controller performs GitHub writes; the worker does not receive unrestricted GitHub access.

Acceptance criteria:

- A real explicitly selected investigation issue can complete the path without a running interactive pi session.
- A durable attempt identifies its inputs, pi session, artifacts, operational outcome, and reported GitHub result.
- Unready work, unresolved blockers, changed scope, missing configuration, and disallowed capabilities prevent execution.
- Model failure, invalid output, and controller errors produce an honest failure record rather than a successful issue result.
- Automated tests use controlled GitHub/pi substitutes; a bounded live smoke test is explicit rather than part of every test run.

### 3. Recover or cancel an interrupted attempt without duplicating work

The operator can inspect an active attempt, cancel it, or restart the controller after interruption. Recovery reconciles process/workspace ownership and uncertain external side effects before deciding whether to continue, retry, or ask a person.

Acceptance criteria:

- Cancellation stops owned work and records what was retained; it does not leave a task silently running.
- A restart cannot start a second worker while the original still owns the attempt.
- An uncertain GitHub update is reconciled instead of posted repeatedly.
- Retry is a distinct recorded attempt with preserved prior evidence; stale task inputs require renewed authorization.

### 4. Turn one approved implementation issue into a verified PR

The manual path now supports an implementation worker. It uses an isolated worktree, approved scope, and repository checks; the controller validates the actual diff before committing intended files and opening a PR.

Acceptance criteria:

- One eligible task produces a PR linked to its issue and attempt, against the authorized base.
- Actual changes match the allowed scope; unrelated checkout files, secrets, and controller-runtime artifacts are excluded.
- Applicable Make checks run independently of the worker's claimed success; failure is not reported as ready for review.
- Changed base/input revisions are detected and required verification is repeated before reporting readiness.
- Neither the worker nor this slice directly pushes to `main` or silently merges the PR.

### 5. Dispatch eligible GitHub issues through a standalone watcher

An explicitly started controller polls the configured repository/work scope and dispatches tasks through the same manual execution path. Start with one mutation worker; parallel worker scheduling is not part of this slice.

Acceptance criteria:

- Setting readiness on an eligible issue leads to one attempt without an interactive pi session.
- `needs-human`, open blockers, unknown task kinds, changed authorization, and excluded historical work prevent dispatch.
- Repeated polls, GitHub failures, and controller restarts do not produce duplicate workers.
- Claim/progress/review updates reflect recorded state; the operator can inspect, stop, and restart the watcher.
- Disabling watching does not disable manual task execution. Enabling it does not silently schedule creative work.

## Second wave: complete the physical-game loop

### 6. Execute a bounded experiment and attach versioned evidence

An approved experiment brief selects a pinned candidate and existing evidence producers. Results return to its GitHub work record with artifact identity, method, configuration, limitations, and the next human action.

Acceptance criteria:

- One experiment can use correctness checks and qualitative evidence without a numerical balance report.
- When comparative evaluation is requested, baseline and candidate methods/configuration are pinned and failures remain visible.
- Replacing a report/evaluator does not require rewriting dispatch or human-wait behavior, and does not reinterpret old evidence silently.
- Tool failure is distinct from a negative or inconclusive design finding; no fixed seed count or win-rate acceptance threshold is imposed.

### 7. Independently check a candidate's rules fidelity

A rules-reading pass derives concrete expected examples from canonical printed text without consulting behavior code. A separate verification pass runs/checks those examples against the candidate and reports the evidence.

Acceptance criteria:

- A controlled implementation mismatch is caught independently of the implementation worker's own tests.
- Source text, expected behavior, observed behavior, and candidate identity are linked in the result.
- Ambiguity returns as a human question, not a silent rulebook rewrite or invented ruling.
- Findings can open authorized engineering follow-up work without approving a gameplay change.

### 8. Run a source-blind agent playtest and retain its run file

A configured playtester receives printed rules/cards and typed player-facing operations against a private run. It records observations as it plays, then returns the run file and a playtest note through the evidence path.

Acceptance criteria:

- Tools expose only permitted observations and moves, not engine source, arbitrary shell access, or future draws.
- Notes distinguish observations, suspicions, and proposed changes; they are not designer rulings.
- The retained run replays under its recorded source snapshot and can be opened by existing replay tooling.
- Budget exhaustion, cancellation, and illegal attempts remain visible; the worker does not run indefinitely to finish a game.

### 9. Prepare an immutable physical prototype kit

The controller invokes existing print tooling for an approved candidate and packages the cards, rulebook, component manifest, baseline changes, and test brief.

Acceptance criteria:

- Different card tunings under the same rules version receive distinct kit identities and do not overwrite one another.
- Printed material and the manifest let a tester identify the kit; counts and source identities agree.
- The kit is traceable to the experiment and candidate; build failure prevents a ready-for-test result.
- No print-studio UI or calibrated simulation score is required.

### 10. Capture physical feedback and a revision-bound designer decision

Operator commands accept human session notes and record an explicit accept/reject/inconclusive decision for the tested candidate. GitHub remains the review surface; controller state records and reconciles the authorized transition.

Acceptance criteria:

- Verbatim feedback is preserved separately from agent analysis, with kit/session provenance and explicit unknowns.
- Partial, unseeded physical sessions are valid records; no digital command log is fabricated.
- Agents stop at human waits. A valid human action resumes the correct experiment without repeating completed preparation.
- Unauthorized actors, ambiguous consent, stale candidates, and duplicate actions cannot advance the experiment incorrectly.
- Experiment acceptance does not implicitly authorize publication.

### 11. Complete one real experiment from observation to decision

The designer chooses one question from actual playtest evidence, approves a bounded trial, uses the kit at a physical table, and records a decision. This is validation of the factory, not a promise that the candidate will improve the game.

Acceptance criteria:

- The experiment completes using the manual controller path if watching is unavailable.
- Required evidence, printed identity, human observations, and the decision refer to the same candidate.
- The designer can find the evidence and next action without reconstructing agent conversations.
- Friction, unreliable measurements, missing information, and unsupported automation become specific follow-up work. A rejected/inconclusive candidate can still validate the lifecycle.

## Later slices

### 12. Prototype a thin workbench around the existing table

Build a bounded, read-only prototype over real controller records: active work, waiting decisions, artifacts, and entry points to the existing table/replay. Have the designer rule on the interface and app boundary before drafting production UI tickets.

Acceptance criteria:

- A live or recorded attempt, experiment, and human wait can each be inspected.
- A run file reaches the existing replay/table experience without duplicating its game rules.
- Metrics are displayed as evidence with limitations, not as mandatory analytics charts.
- The prototype produces a concrete interface/architecture decision and new narrow UI slices, not an implicit commitment to a five-module dashboard.

### 13. Publish only an explicitly authorized snapshot bundle

A Make-driven action validates publication authorization and the declared requirements for the selected kit, then creates or reconciles its GitHub Release and artifacts.

Acceptance criteria:

- The published source, kit identity, artifacts, and approval agree; a version bump alone does not publish.
- Prototype and publication-candidate release requirements are distinguished; missing required human/production evidence blocks the latter.
- Retry or interruption does not create duplicate releases or replace an approved kit with different content.
- Publication and failure are reported back with provenance, without direct unreviewed changes to canonical rules or cards.

## Work deliberately not ticketed yet

New balance metrics, numerical anomaly definitions, advanced search, additional bots/personas, Jev experiments, continuous mutation, production UI, remote deployment, and vendor-specific production work. Draft those slices when measured use or a concrete designer decision makes them necessary.

## Publication and archival `[you: scope; agent: readiness handling]`

Publish a fresh **Pi Game Factory** parent and project, with slices 1–5 in dependency order. Link the spec rather than copying the entire architecture into each issue. Slice 1 carries `needs-human`. Keep `ready-for-agent` off the blocked AFK issues until their prerequisites are resolved, so publication cannot fire a readiness-label watcher. Record native dependencies and do not launch implementation workers.

Treat old GDLC research/prototypes as historical evidence. Do not move its open tickets into the new backlog, reuse its parent, or let old routine/solver/metric assumptions become new readiness conditions. The previous project and issues stay untouched; archival requires a separate explicit approval.
