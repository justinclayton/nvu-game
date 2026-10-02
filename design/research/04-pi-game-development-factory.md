# 04 — A pi-based factory for physical game development

**Recommendation:** borrow SSSF's separation of agents, deterministic code, typed handoffs, and observable phases, but organize the system around **design experiments**, not software tickets. Start with repository-local pi skills and the tools already here; add a small durable workflow layer when those experiments need coordination. Do not begin with the full dashboard, a behavioral transpiler, or continuous balance mutation.

**First use:** take one existing playtest finding, approve a hypothesis and a bounded candidate change, compare it with the baseline, print an identified prototype kit, play it at a table, and record an accept/reject/inconclusive decision. Completing that loop is the first milestone.

**Evaluated against:** `nvu-game` at `c396025e3f59866057759108a984f942c04fb82a`, rules 0.2.7; installed pi 0.78.0; SSSF's pinned snapshots in [the source audit](03-sssf-source-audit.md); and the user-provided `agentic-sdlc-blueprint-v2.md`. Everything recommended below is agent-proposed, not an accepted design decision. Pi references link to upstream documentation; the installed version was the inspected source.

## 1. What to reuse, and how

An important finding: **SSSF already executes pi**. Its Claude execution adapter is a stub. The choice is not “port Claude to pi,” but whether to retain a Python runner around pi CLI processes or build a smaller pi-native control layer. Its installer copies templates into a repository, so adoption means maintaining those copies. [SSSF audit]

| Approach | Where it fits | What needs changing |
| --- | --- | --- |
| Use SSSF unchanged | An isolated evaluation of its engineering workflow, not the game lifecycle | Real quality commands are still required; do not assume its defaults provide isolation, meaningful verification, or human authorization. |
| Modify SSSF | Fastest way to reuse its Python phase runner and SQLite visualizer | Add experiment contracts, durable human-wait states, worktree ownership, content-based scope checks, deadlines, and explicit approvals. Replace software-specific prompts and acceptance criteria. |
| Augment SSSF | Keep its build/test/review chain as one engineering step inside a game experiment | Let an outer layer own the experiment, table-test waiting, and release decisions. Avoid two competing coordinators or approval stores. |
| Use it as inspiration for a pi-native system | Best long-term fit for this TypeScript repo and a unified pi workflow | Own a small experiment state machine and game adapter. Reuse pi's sessions, tools, extensions, model access, and existing orchestration rather than rebuilding an agent harness. |

**My preferred path:** use inspiration-first, with selective reuse of SSSF's contracts and phase patterns. If you want to evaluate SSSF itself before choosing, run one bounded experiment using a current starter script with real checks in an isolated checkout. Its workflow generator has source/API drift; do not make the generator the starting dependency. [SSSF audit]

SSSF's three principles remain useful, but their objects change:

- **Observable:** show the hypothesis, exact candidate, evidence, limitations, and pending human decision, not only tokens and tool calls.
- **Customizable:** vary game goals, evaluation policies, playtest protocols, and print profiles without rewriting the runner.
- **Reusable:** separate the generic experiment lifecycle from an `nvu-game` adapter that knows its cards, rules, engine, and kit format.

## 2. The lifecycle is an experiment loop

```text
Observation → hypothesis + designer-approved experiment brief
            → candidate snapshot
            → rules/implementation checks + comparative digital evidence
            → identified prototype kit
            → physical or blind playtest
            → designer decision: accept / reject / inconclusive
            → accepted snapshot, next experiment, or publication candidate
```

Use different evidence requirements for different work:

- **Tooling/engine fixes:** normal software verification against accepted rules. Many do not need a physical playtest.
- **Rule or card design:** designer approves the intended semantics; agents implement and investigate; human play establishes whether the change serves the design goal.
- **Presentation/production:** render and preflight, then inspect a physical proof. A passing engine does not verify legibility, handling, or a printer's requirements.

Do not equate `agent_end`, a completed phase, an agent's favorable review, a merged PR, and an accepted game design. They are different events. SSSF currently has execution success/failure and script acceptance, but no durable human-approval state. [SSSF audit]

An experiment should preserve:

- The observation, source quote, hypothesis, and intended player experience.
- Baseline and candidate identities: Git revision, rules version, card-list ID, and relevant engine/policy/evaluator revisions.
- Allowed changes, predeclared metrics, comparison seeds, budgets, and required evidence.
- Machine results and representative replays; raw human feedback with provenance.
- The exact revision a person approved, their decision, and the reason.

Use states such as `proposed`, `approved-for-experiment`, `digital-checked`, `waiting-for-table-test`, `needs-decision`, and `accepted|rejected|inconclusive`. Waiting for people can last days; stop the agents and resume from recorded state. A restarted workflow must not silently rerun mutations or duplicate releases. Changed candidate content invalidates its old approval.

Keep briefs, evidence summaries, and decisions under a proposed `design/experiments/` convention. Keep bulky runtime traces outside Git, retaining links and selected evidence. GitHub issues remain the work queue and index, using the existing `needs-human` distinction; do not create a second independent backlog. [Issue tracker]

## 3. Revise the blueprint, rather than implement its six epics literally

### Keep canonical design, but distinguish compilation from interpretation

Keep `design/cards.yaml` authoritative for printed cards and `design/rulebook.md` authoritative for rules. The current generator already emits print/web content and parses a constrained vocabulary of room outcomes. Card behaviors remain hand-authored implementations with a coverage gate. [Generator] [Coverage]

A general natural-language-to-TypeScript step is **reviewed implementation**, not deterministic compilation. An agent can draft behavior and tests, but the same misunderstanding can contaminate both. Have an independent rules reader derive concrete examples from the canonical text, then run those examples against the implementation. Unresolved semantics return to the designer instead of becoming silent engine rulings.

A typed effect language might eventually make common mechanics genuinely compilable. Add it only after repeated mechanics justify it, and avoid maintaining unverified parallel sources of truth.

### Separate correctness, strategy, and experience evidence

1. **Correctness:** schemas, examples, invariants, replay checks, and bounded fuzzing.
2. **Quantitative dynamics:** fixed policies and seed comparisons, with uncertainty and policy limitations reported.
3. **Interpretation:** source-blind agent playtests for rulebook gaps and candidate exploits.
4. **Human experience:** table tests and blind tests without the designer teaching or repairing the rules.

The repo already supports the first three in useful forms: fuzzing, random/greedy policies, balance reports, and agent-authored playtest records. Its CLI spec explicitly separates an agent reading printed rules from a later agent inspecting engine code. Preserve that separation. [CLI spec] [Policy] [Report]

MCTS and additional personas are optional extensions, not prerequisites. A solver or bot that knows future deck order can prove possibilities under its model, but cannot represent ordinary play. Give playtest agents only player-visible observations. Personas generate hypotheses; they are not measured human cohorts.

For comparative simulation, hold the policy/evaluator fixed, compare baseline and candidate over a shared seed set where meaningful, and validate promising candidates on held-out seeds. Identical seeds do not guarantee identical draws after rules alter random-number consumption. Report aborted and unfinished runs separately; do not quietly drop them. Normalize card-use statistics by opportunities to acquire/draw/use a card, not just total plays.

### Use metrics that fit North vs Up

This is a two-player cooperative game, so competitive first-mover win rate is not the default balance target. Favor difficulty progression by band, floor completion, Flee frequency, live Stamina, role participation, and reward usefulness. Automated participation measures are proxies, not proof of meaningful decisions. [Rulebook] [Report]

Physical sessions should capture setup/teaching time, rule lookups, decision time, one-player domination, engagement, bookkeeping, and readability. Preserve verbatim observations separately from interpretations and proposals. A physical session can be partial and unseeded; do not fabricate an exact `nvu-run/1` replay to fit it into the digital format.

Existing [playtest 12] illustrates why: the agent reported Gray clearing several turns while Red did nothing, and later clears found through scratch-script search rather than by eye. A win-rate increase could leave both experience problems untouched.

### Make balance changes proposals, not autonomous optimization

Begin with a bounded, hypothesis-driven candidate rather than an always-running mutation engine. Require a report containing the change, expected mechanism, comparison results, counterevidence, and the next table-test question. The designer decides. A target win rate alone is not a specification for fun, cooperation, or complexity.

### Narrow Jev to uncertain semantic judgments

SSSF itself has no Jev integration. Pi 0.78.0 already exposes Jev classifiers through codemode and extension model access, so adding another bespoke classifier framework is unnecessary. Classifier calls return probabilities/confidence and can fail; those are not proof of correctness. [SSSF audit] [Pi models] [Pi codemode]

| Blueprint level | Recommended treatment |
| --- | --- |
| L1 schema precheck | Deterministic parser/schema; optional semantic ambiguity warning. |
| L2 feedback triage | Good classifier candidate; retain the quote and allow `uncertain`/human correction. |
| L3 complexity/risk score | Advisory ranking, calibrated against designer judgments; not permission to proceed. |
| L4 tool safety | Deterministic capability restrictions, approval rules, and isolation. |
| L5 model routing | Explicit workflow-to-role mapping first; classifier routing only if it helps measured usage. |
| L6 rulebook write gate | Explicit approval plus version/content checks; never classifier-inferred consent. |
| L7 compaction | Use pi's existing compaction and persist experiment state outside the conversation. |
| L8 replay questions | Query typed events/state with code for exact predicates. |
| L9 bulk screening | Aggregate/filter with code, then classify selected ambiguous notes or summaries. |
| L10 mutation verification | Executable tests and independent evaluation; a self-check is supporting evidence only. |

Treat “10k games/minute” and “10,000 logs in under a second” as benchmark questions, not architectural guarantees. Pi codemode currently permits four concurrent non-chat model calls per script. Measure end-to-end throughput, cost, classifier errors, and human review saved before expanding its role. [Pi codemode]

## 4. A small pi-based control layer

Keep the factory outside the pure game domain:

```text
Pi skills/commands, later a dashboard
                  ↓
Durable experiment controller + approval service
                  ↓
Game adapter: validate · evaluate · play/replay · print
                  ↓
Existing Makefile, bin/nvu, domain engine, exporters
```

**Skills** hold protocols: formulate an experiment, perform a source-blind playtest, interpret evidence, prepare a prototype. **Extensions** expose executable commands/tools, approval checks, and status. **Deterministic code** owns the transition rules, budgets, artifact identities, and gate results. Skills alone cannot enforce those boundaries. [Pi skills] [Pi extensions]

Three agent roles are enough initially:

- **Implementer:** works in a disposable worktree, implements an approved candidate and runs checks.
- **Playtester:** receives printed rules/cards and player-facing tools, not engine source or future draws; never rewrites rules during a test.
- **Evidence reviewer:** checks claims against results and canonical text; suspected engine mismatches can go to a separate code-inspection pass.

A native backend can use `createAgentSession()` for explicit working directories, selected tools, sessions, and event subscriptions. RPC is the alternative when a process boundary is preferable. Existing subagent/workflow extensions may already cover orchestration; they are not a durable physical-game lifecycle merely because they can launch parallel agents. Pi's shipped subagent example provides isolated conversations, not worktrees, and launches ephemeral sessions. [Pi SDK] [Pi CLI integration] [Pi subagents]

Start with 2–3 mutation workers at most, and serialize overlapping card/rules/engine changes. Stage only intended files. A worktree prevents accidental branch collisions but is not a security boundary; unattended agents also need constrained credentials, filesystem access, and network access. Hook-based path protection is useful defense in depth, but does not constrain arbitrary shell writes or every extension. [Issue tracker] [Pi security]

For observability, link operational traces to experiment IDs and exact artifacts. Keep execution outcome separate from scientific/design outcome. Show cost, duration, retries, failure evidence, and the next human action. An operational DB can index this information; do not assume it can be rebuilt from transcripts unless you implement and test that recovery path.

## 5. Printing is both a feedback step and a release step

The blueprint's basic PDF pipeline is already here: `make pdf` and `make rulebook`. Extend it instead of building a second print tool. [Makefile]

Each prototype kit should have an immutable identity combining rules version and card-list/snapshot identity, a component/count manifest, rulebook, changes from its baseline, and a focused playtest sheet. Current PDF filenames contain only rules version; that is insufficient to distinguish different card tunings under the same rules. Preserve the matching engine revision for digital evidence and old replay reproduction.

A **prototype kit** can be experimental. A **publication candidate** needs additional human gates: blind-test evidence, component and packaging specification, printer-specific dimensions/bleed/color/font preflight, asset-rights checks, and a physical proof. A generated PDF is not evidence that manufacturing requirements or gameplay quality have been met.

## 6. Build in this order

1. **One complete experiment.** Approve a question from an existing playtest. Use existing checks, simulation, replay, and PDF targets. Print, play, decide, and preserve the evidence. No new agent framework required.
2. **Repeatable experiment contracts.** Add snapshot manifests, a comparison report, physical-feedback capture, explicit approval records, and idempotent transitions. Smoke-test any adopted SSSF adapter against the installed pi version before relying on its sessions/events.
3. **Pi integration.** Add a small set of commands and typed game tools. Persist progress at stage boundaries, enforce scope, and provide cost/deadline limits. Package the resources once a second game or repeated installation justifies it. [Pi packages]
4. **A thin dashboard.** First show experiments, evidence, waiting decisions, and links to the existing game/replay/print views. Then add approval actions through the same controller. Do not build five independent dashboard subsystems first.
5. **Measured expansion.** Add smarter search, richer policies, calibrated classifiers, or bounded candidate search only when a completed experiment demonstrates the bottleneck.

The success measure is **time from a playtest observation to a well-supported design decision**, not games simulated, agents launched, or code merged.

[SSSF audit]: 03-sssf-source-audit.md
[Issue tracker]: ../../docs/agents/issue-tracker.md
[Generator]: ../../tools/cards.mjs
[Coverage]: ../../app/src/content/behaviour-coverage.test.ts
[CLI spec]: ../cli-sim/spec.md
[Policy]: ../../app/src/sim/policy.ts
[Report]: ../../app/src/sim/report.ts
[Rulebook]: ../rulebook.md
[playtest 12]: ../playtests/12-seed-12.md
[Makefile]: ../../Makefile
[Pi SDK]: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md
[Pi CLI integration]: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/cli-integration.md
[Pi skills]: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md
[Pi extensions]: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md
[Pi models]: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/models.md
[Pi codemode]: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/codemode.md
[Pi subagents]: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/subagent/README.md
[Pi security]: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/security.md
[Pi packages]: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md
