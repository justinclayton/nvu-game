# Pi game factory

The factory coordinates approved GitHub work and physical-game experiments through a small TypeScript controller, pi sessions, and the existing North vs Up tools.

## First complete paths

The first software path is a manually selected GitHub issue: check its readiness, run a bounded pi investigation against a pinned checkout, and report the result back to the issue. Add writable implementation work and automatic watching only after that path is observable and recoverable.

The first game-design path is one experiment: record a playtest observation and approved question, prepare a candidate, collect appropriate evidence, print an identified kit, play it at a table, and record the designer's decision. Numerical balance reports are optional, explicitly limited evidence rather than a prerequisite for this loop.

**Status:** accepted direction with proposed implementation details. The first five [vertical slices](slices.md) are published under [parent #254](https://github.com/justinclayton/nvu-game/issues/254) in [Pi Game Factory](https://github.com/users/justinclayton/projects/2); later slices remain proposals. Nothing described as a new factory capability is implemented yet.

**Provenance:** `[you]` records decisions made in this conversation. `[agent-proposed]` marks details still to approve. The previous GDLC effort is historical input, not this effort's backlog. Sources are the [SSSF audit](../research/03-sssf-source-audit.md), [factory recommendations](../research/04-pi-game-development-factory.md), the previous [decision map](https://github.com/justinclayton/nvu-game/issues/233), and the [bounded legacy decision audit](../research/05-previous-gdlc-decisions.md). Historical decisions do not automatically become new implementation requirements.

## Accepted direction `[you]`

- Build a small TypeScript controller around existing tools. Use pi's SDK and extensions; do not rebuild an agent harness or adopt SSSF wholesale.
- Switch from Claude Code to pi. Routines do not survive. A standalone controller replaces their watching and dispatch responsibilities.
- Retain GitHub issues, dependencies, readiness labels, worktrees, PRs, and the `/to-issues` vertical-slice approach. Start a fresh effort rather than extending the old GDLC backlog.
- Organize game-design work around experiments and human decisions. Keep ordinary engineering tasks available without forcing every code fix through a physical playtest.
- Keep card data and printed rules canonical. Card behavior changes are reviewed implementations, not general natural-language compilation.
- Separate correctness, numerical dynamics, agent interpretation, and physical experience evidence. Make physical and blind playtesting explicit parts of the lifecycle.
- Treat deterministic data collection as immature and changeable. Do not encode current simulation metrics as fixed design acceptance criteria.
- Keep balance automation proposal-driven. Agents collect evidence and suggest changes; the designer decides rules and player-experience goals.
- Use classifiers, if useful, for advisory semantic judgments. Exact predicates and authorization are deterministic. Jev is not required to start.
- Extend the existing print tools with snapshot identity. Distinguish a prototype kit from a publication candidate.
- Build one complete loop before expanding into a full dashboard, continuous mutation, or advanced search.

## Existing tools and boundaries

`design/cards.yaml` owns printed cards; `design/rulebook.md` owns rules; `design/GLOSSARY.md` owns game vocabulary. The controller does not introduce alternative card or rules stores.

The existing interfaces are:

| Operation | Existing interface | Factory responsibility |
| --- | --- | --- |
| Generate and validate content | `make build`, `make check` | Run against the selected snapshot and retain the verdict. |
| Verify application, CLI, and simulation code | `make app-check` | Run independently of agent claims. |
| Exercise engine behavior | `bin/nvu fuzz` | Record configuration and failures, not a claim that balance is established. |
| Gather numerical dynamics | `bin/nvu sim --json` | Preserve evaluator identity and limitations; keep report contents replaceable. |
| Play and inspect a run | `bin/nvu play`, `bin/nvu replay` | Give each attempt its own run file and the correct player-facing capabilities. |
| Play in the browser | Existing web game and run-file loader | Reuse the table and replay views. |
| Print | `make pdf`, `make rulebook` | Package outputs with identity, counts, and a test brief. |

Make remains the operator interface for setup, checks, batch stages, and controller startup. Game moves continue to use the existing CLI through a game adapter. No new CLI verbs or fixed pipeline composition are required by this spec. `[agent-proposed]`

The factory sits outside the pure game domain. A generic controller owns work lifecycle and attempts; an `nvu-game` adapter knows how to run this game's tools. Game rules remain independent of agent orchestration, GitHub, clocks, and network services.

## GitHub work and pi execution

GitHub is the work queue, dependency graph, discussion, and human review surface. Controller records describe execution; they are not a second backlog or a separate source of human approval.

### Readiness

`ready-for-agent` authorizes the next bounded task, not every remaining stage of an experiment. `needs-human` prevents automatic dispatch. Recheck the issue, its blockers, approved scope, and task revision immediately before execution.

A configured task kind selects a worker protocol and capabilities. An unknown kind, contradictory instructions, missing scope, or unresolved decision returns to human review rather than being guessed by a routing model. `[agent-proposed]`

### Attempts

Each execution has its own identity, pinned inputs, pi session, workspace, artifacts, and terminal result. Separate these outcomes:

- **Execution:** succeeded, failed, interrupted, or cancelled.
- **Engineering review:** ready for review, changes requested, or merged.
- **Design decision:** accepted, rejected, or inconclusive.

A finished pi run is not proof that the task succeeded. The controller validates outputs and runs applicable checks before reporting success. A merged PR does not by itself establish that an experiment answered its design question.

The initial controller supports manual selection and then a polling mode. It runs independently of an interactive pi session. A watcher cannot dispatch while its host is off; hosting and restart policy must be chosen explicitly. No scheduled creative or balance work is implied by enabling the watcher. `[agent-proposed]`

Claiming requires controller-side ownership, not just a label swap. Repeated polls, duplicate events, retries, or a restarted process must not launch the same active task twice. Updating GitHub and starting a session are not one atomic operation, so recovery must reconcile uncertain results before repeating side effects.

Start with one active mutation worker. Increase concurrency only after workspace ownership and overlapping changes are controlled. Workers do not push directly to `main`, silently merge PRs, or stage unrelated files. `[agent-proposed]`

## Experiments and human decisions

An experiment connects a question to a bounded candidate and its evidence. A work issue identifies a task needed for that experiment. An attempt records one execution of that task. These are deliberately different records. `[agent-proposed vocabulary]`

An experiment brief preserves:

- The observation, source, hypothesis, and intended player experience.
- The allowed changes and what would count as useful evidence or a reason to stop.
- Baseline and candidate identities, including the relevant rules, cards, and engine revision.
- Required checks, playtest protocol, evaluator configuration, and budgets where applicable.
- Results, limitations, counterevidence, and the designer's decision.

The initial progress model is `proposed → approved-for-experiment → preparing → digital-checked → waiting-for-table-test → needs-decision → accepted|rejected|inconclusive`. Revisions can require returning to an earlier stage. The exact persisted representation is an implementation decision, not a workflow-DSL requirement. `[agent-proposed]`

At a human wait, agents stop. Resume from recorded state when the required human action arrives. Do not keep a model session running to wait for a physical playtest.

Approval identifies the action and exact candidate it authorizes. Implementing an experiment, accepting its result, and publishing a kit are separate authorizations. Changed inputs invalidate affected evidence and approval; the controller must not silently substitute a newer candidate.

Preserve verbatim human feedback separately from analysis and proposals. A physical playtest may be partial and unseeded. It does not owe a fabricated digital command log. A rejected or inconclusive experiment is a valid design outcome, not an execution failure.

## Evidence without freezing the metrics

The stable contract is **provenance and interpretation**, not today's balance-report fields. An evidence record identifies its question, source snapshot, producer, configuration or protocol, artifact, and limitations. A producer can return a text report, structured data, a run file, or a physical-session record. `[agent-proposed]`

- Correctness checks remain useful even when balance telemetry is not calibrated.
- Numerical results describe the policy and evaluator that produced them. They do not establish how people play or whether play feels good.
- Quantitative comparisons pin baseline and candidate methods. Do not treat the latest unrelated report as an adequate baseline.
- Exact replay predicates are queried with code. Unplayed cards and command-budget exhaustion are observations; conclusions such as “dead card” or “infinite loop” require further evidence.
- Agent playtesters see printed rules, cards, and player-visible observations, not engine source or future draws. A separate pass can inspect code to verify a suspected implementation mismatch.
- An independent rules reading supplies concrete expected examples for semantic changes. The implementation and its generated tests agreeing with one another is not sufficient proof of fidelity.
- Physical tests address cooperation, role participation, decision burden, teaching, handling, and legibility. Blind tests expose what the rules fail to communicate without designer intervention.

Do not fix a global seed count, win-rate target, anomaly list, or solver guarantee now. Replacing an evaluator must leave prior evidence identifiable and interpretable. Do not silently reinterpret old reports under a new method.

## pi's role

Use pi for model access, sessions, tools, compaction, and agent execution. The controller owns dispatch, durable progress, budgets, artifact identity, and deterministic gates.

Initial worker protocols are investigation, implementation, source-blind playtesting, and evidence review. A protocol is a task configuration, not a reason to create a new agent runtime.

Skills hold instructions; extensions expose commands, typed game tools, and status. Tool configuration and deterministic checks enforce capabilities. Prompt instructions alone do not protect a rulebook or make an unrestricted shell read-only.

The model/service credentials, GitHub credentials, filesystem boundary, network access, project-resource loading, and cancellation policy must be explicit before unattended writable work. A worktree isolates Git changes, not operating-system access. The operator needs a way to see activity, cancel an attempt, inspect its evidence, and recover after a crash. `[agent-proposed implementation requirements]`

## Prototype kits and publication

A prototype kit includes the printable cards, rulebook, component counts, baseline changes, and a focused playtest brief. Its immutable identity distinguishes card tunings even when the rules version is unchanged. Preserve the matching source and engine revision for digital evidence and reproduction.

Kit preparation can be automated. Physical observations and design acceptance cannot be replaced by a successful build.

Publication additionally requires the relevant human approvals and production evidence, including printer-specific preflight, asset rights, and a physical proof. A rules-version bump can be an input to packaging; it is not sufficient authorization to publish. No print-studio UI is required.

## Human interface and observability

Initially, use pi/Make commands and GitHub result summaries. Link attempts, task revisions, artifacts, checks, errors, and pi sessions. Surface the next required human action alongside operational status.

A later workbench is a thin view around the existing table, not a rewrite of it. Start read-only: active work, evidence, pending decisions, and links into existing play/replay views. Add approval actions through the same controller before adding independent dashboard subsystems. `[agent-proposed delivery sequence; existing-table reuse is retained direction]`

Durable execution state needs an explicit owner and recovery policy. Whether it is files, SQLite, or another local store remains open. GitHub review actions must remain traceable; an internal index must not become an alternative decision store. Artifact retention and sharing must be defined rather than assumed to follow from a transcript or orphan branch.

## Decisions to settle before unattended execution

1. **Operating contract:** initial host, foreground/background service, credentials, resource isolation, model selection, budgets, and shutdown/recovery policy.
2. **Approval and task contract:** how task kind, authorized scope, candidate identity, and human decisions are represented and authenticated through GitHub and operator commands.
3. **State and evidence ownership:** minimum durable records, retention, artifact locations, and what must remain reproducible after the host or evaluator changes.

These are a small design gate for the first implementation wave, not a requirement to settle every future metric or screen.

## Deferred

Advanced search, exhaustive seed solving, further bots, personas, Jev triage/scoring, continuous candidate mutation, full analytics, remote access, and production-specific publishing extensions are not prerequisites for the first complete paths. Research and prototypes can earn them a place later; none should silently enter the critical path.

The first wave is tracked in the new Pi Game Factory parent/project, with its issue index in the [slice plan](slices.md#published-first-wave). No implementation workers were launched. The previous project and issues remain untouched; archival requires a separate explicit approval.
