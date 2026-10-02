# 03 — SSSF: a source audit before adapting it

Super Simple Software Factory is a repo-stamped Python workflow runner that invokes coding agents, checks their JSON reports, and records the work in SQLite—not an autonomous product-development system.

**Evaluated against.** `disler/super-simple-software-factory` main at `de31374882e7a4e3e5b7bb9bd09e69dc2f779356` (commit timestamp 2026-08-02); example branch at `b2dcb8e436db9b10f7580d7568b3e251609eb36b`. Links below pin those snapshots.

**Provenance and method.** Primary sources only: README, skill/cookbooks/references, templates, executable modules, visualizer, and selected example files. Read source and ran isolated standard-library probes in temporary directories; did not install dependencies or run models. “Implemented” means visible control flow, not independently validated end-to-end behavior. Adaptation judgments are agent-proposed. This note does not evaluate the local game, its blueprint, or Pi's own documentation.

## The important correction: it already runs Pi

Despite its `.claude/skills/sssf/` packaging and Claude Code `/sssf install` instructions, **this snapshot executes Pi exclusively**. `agents.validate()` rejects any other coding agent; `agent_cc.py` is a `NotImplementedError` stub. There is no operational Claude Code adapter, hook pipeline, or Claude Agent SDK integration to port. Even the stub describes a future `claude -p` CLI adapter, not an SDK client. The example's Claude `/prime` command only orients an agent. [README] [AGENTS] [CC] [PRIME]

Actual coupling is to Pi's CLI, model catalog, session conventions, JSONL event shapes, and TypeScript extension API. The adapter invokes `pi -p --mode json`, with provider/model, thinking, system prompt, session ID/directory, tools, and `-e` extensions. SSSF intends repeated session IDs to preserve context; this audit does not establish compatibility with a particular installed Pi version. [PI] [EXT]

## What the workflow actually does

**Triggers are explicit invocations.** A human or orchestrator launches an `adw_*.py` with inline text or a request-file path, optionally `--config` and `--adw-id`; `just` wraps these commands. The skill routes requests to cookbooks and tells the orchestrator to launch and observe rather than do the work itself. There is no shipped issue watcher, webhook, cron service, or automatic balance trigger. Those instructions are prompting conventions, not runtime enforcement. [README] [SKILL]

**The “state machine” is ordinary sequential Python.** The twelve starter scripts compose engineer, agent, and code phases through one context manager. A phase enters `running`, exits `success` on clean completion, or records `fail` and rethrows. `run.finish(accepted=...)` combines phase completion with the script's acceptance decision. A test command can execute successfully as a phase while its result rejects the run. Sessions move `running → success|fail`; joining an ID reopens `running`, reuses storage/agent context, and starts the selected script again. There is no durable scheduler, checkpoint replay, or approval-wait state. `queued` exists in the schema but the runner records phases only as they enter. [RUN] [SESSION] [AGENTS]

The fullest chain pins the starting Git commit, records the request, plans and commits the plan, builds, runs tests with repair attempts, reviews with revision attempts, retests after an approved revision, commits verified code, captures the run's diff, documents, and commits documentation. Limits are three test iterations and two review iterations. Failure leaves the plan committed and unfinished code uncommitted. One edge: the final failed test iteration still invokes a repair; without a later review revision triggering retest, that repair is never tested and the run remains rejected. [FLOW]

**Agent boundaries are typed reports, not generated implementation.** Pydantic parses the final response into an envelope containing status, summary, artifact paths, and role-specific fields. A failed parse gets at most two correction sends; failed gates get only the phase's configured retries, zero by default. Each send starts a subprocess with the same intended agent session. This is not the README's unqualified “until it parses,” nor a guarantee of identical outputs across runs. [AGENTS] [README]

**No human approval gate exists.** The engineer phase logs the incoming ask; it never pauses for sign-off. `review.approved` is an agent verdict. The UI's archive flag means review triage, not authorization to proceed. Printing, merging, or accepting a balance change would require a new explicit human decision boundary. [FLOW] [UI]

## Observable: useful instrumentation, limited guarantees

`tracer.py` appends normalized events to `events.jsonl` and SQLite, with seven tables for sessions, phases, events, envelopes, gates, agent sessions, and processes. SQLite uses WAL and a five-second busy timeout. The adapter reads Pi stdout incrementally; normalized tool rows appear when each tool completes, not when it starts. Tokens/cost come from Pi's reported usage, while elapsed spans use local clocks. [TRACE] [PI]

The shipped Vue/Bun dashboard polls the DB through a JSON API and shows session/phase traces, evidence, prompts, usage, and context occupancy. It is not a game-balance dashboard or workflow controller. The README calls it read-only, but the server also writes `sessions.archived`; the skill still says the visualizer will ship later. Executable source resolves both documentation discrepancies. [README] [SKILL] [UI]

“Files are the raw record; DB is the mirror” is a design intent, not a demonstrated recovery guarantee. No rebuild utility ships. Prompts and `envelope.json` are overwritten per agent, whereas DB envelope rows preserve multiple calls; archive/process metadata is DB-written. Preserve both stores. The README advertises real example traces, but neither pinned branch tracks the session directories or trace DB. Example app code, specs, docs, and tests demonstrate concrete artifacts—not reproducible run measurements. [AGENTS] [TRACE] [README] [EXAMPLE]

## Customizable and reusable: the real interfaces

There is no workflow DSL. YAML defines agent identities: models, thinking, system/user prompt paths, tools, extension paths, write scope, and defaults. Python scripts define sequencing and acceptance; output classes define handoff structure; gate callables return evidence-bearing reports. `quality.py` owns known commands and adapts failures into envelopes for a builder. These seams translate well to domain-specific evaluation. [CONFIG] [AGENTS] [GATES] [QUALITY]

The installer copies templates into the target repo, preserves existing files unless `--force`, and adds runtime ignores. This is **copy-and-own reuse**, not a centrally upgraded library. Forced refresh overwrites local prompts/config/code. The output contract is manually synchronized among type, prompt JSON example, and call site; there is no canonical spec compiler. A plan is prompted into a handoff file and copied to `specs/`. Cards YAML, rulebook reconciliation, generated engine/tests, bot tournaments, persona playtests, balance proposals, and print releases are all additional domain machinery—not SSSF features. [INSTALL] [HANDOFF] [CONFIG]

The workflow generator has concrete drift: its generated script returns `run.succeeded`, removed from the current `Run`, and its dependency list omits `rich`, imported by the runtime. An isolated generation probe confirmed the stale text; source inspection confirms the missing API. Copying a current starter is safer than trusting the generator unchanged. [GEN] [RUN]

## Safety, concurrency, and operational pitfalls

- **Fresh installs grade placeholders.** Test, lint, typecheck, and build commands are `echo` calls that exit zero. The example wires a real Bun suite; its “typecheck” commands are Bun builds, not semantic TypeScript checks. [QUALITY] [EXQUALITY]
- **Names overstate validation.** `diff_matches_claims` only checks that declared paths exist; it does not compare a diff or require complete declarations. Empty artifact lists pass existence/non-empty checks. The isolated probes confirmed these behaviors. [GATES]
- **Write controls are not a sandbox.** Permissions compare Git numstat counts and untracked filenames, not content hashes. Probes confirmed that a rewrite preserving an already-dirty file's line counts, or rewriting an existing untracked file, goes undetected. Gitignored/external paths are invisible. Rollback cannot restore pre-existing dirty content. Worse, enforcement occurs after successful parsing/gates, so earlier exceptions bypass it. [PERM] [AGENTS]
- **Isolation is absent.** Runs share the current checkout; commits use `git add -A`, potentially including unrelated work. No starter creates a worktree, performs a merge, or locks a checkout/session. SQLite tolerating writers is not safe concurrent repository mutation. [README] [GIT] [RUN]
- **Subagents are a separate concurrency path.** The extension launches background Pi children, with `bash` available and sessions under the user's home directory. It does not integrate their PIDs/usage into the factory tracer or await them as deterministic phases. Do not assume nested work is isolated or fully costed. [EXT]

## Jev, runtime claims, cost, and the adaptation judgment

**Jev is unsupported by these sources.** Searches of both pinned branches found no Jev reference, dependency, command, adapter, or screening stage. These sources cannot establish Jev's mechanism, latency, accuracy, safety, or suitability. Adding it would be a separate design/dependency decision, not adopting an SSSF practice.

The example's source comment claims an agent rediscovering tests cost about **one million tokens and 85 seconds**. That is an author-reported anecdote without the underlying tracked trace or a controlled comparison. “Code costs nothing” and millisecond/runtime language are rhetoric: code still consumes compute, and no Jev speedup is demonstrated. SSSF records model-reported costs but has no spend ceiling; retries and background agents add exposure. Agent calls have no execution deadline, unlike deterministic quality commands. [EXQUALITY] [PI] [QUALITY]

Maintenance includes provider credentials/catalogs, Pi event/API changes, manually synced contracts, forked templates, and sensitive raw prompts/tool outputs. The UI exposes these through unauthenticated routes; keep it local. MIT permits modification and redistribution with the copyright/permission notice retained, and provides no warranty; that does not settle separate model/service terms. [PI] [UI] [INSTALL] [LICENSE]

**Reuse the control-plane shape, not its safety claims.** The strongest pieces are named phases with explicit acceptance, typed evidence handoffs, deterministic evaluation commands, bounded repair loops, configurable role identities, and a polled trace. For a physical game, those organize experiments and proposals; they do not establish fun, balanced rules, or release authority. Harden isolation/validation and add human acceptance before trusting automatic canonical-rule edits or print releases.

<!-- Pinned primary sources, linked inline above. -->

[SESSION]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/session.py
[README]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/README.md
[SKILL]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/SKILL.md
[FLOW]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_simple_sdlc.py
[RUN]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py
[AGENTS]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py
[CC]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agent_cc.py
[PI]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agent_pi.py
[EXT]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/harness_engineering/subagents.ts
[TRACE]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/tracer.py
[UI]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/apps/visualizer/server/index.ts
[CONFIG]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/sssf.config.yaml
[GATES]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/gates.py
[QUALITY]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py
[PERM]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/permissions.py
[GIT]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/git_helper.py
[INSTALL]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/scripts/install.py
[GEN]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/scripts/make_adw.py
[HANDOFF]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/references/handoff.md
[EXAMPLE]: https://github.com/disler/super-simple-software-factory/tree/b2dcb8e436db9b10f7580d7568b3e251609eb36b
[EXQUALITY]: https://github.com/disler/super-simple-software-factory/blob/b2dcb8e436db9b10f7580d7568b3e251609eb36b/adws/adw_modules/quality.py
[PRIME]: https://github.com/disler/super-simple-software-factory/blob/b2dcb8e436db9b10f7580d7568b3e251609eb36b/.claude/commands/prime.md
[LICENSE]: https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/LICENSE
