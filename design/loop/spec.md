# The design loop

How a change to the sources of truth becomes code, gets playtested, and comes back to the designer. One turn of the loop is one push to a branch.

`[you]` marks the designer's rulings. `[agent-proposed]` marks details filled in by an agent and not yet ruled on. Replaces the pi game factory plan (PR #253, closed).

![The design loop](loop.svg)

## The seven steps

**1. Edit the sources.** The designer, or an agent the designer directs, edits `rulebook.md` or `cards.yaml` on a branch and commits. `[you]`

**2. Stamp and open the PR.** The pre-commit hook bumps the counter for whichever source changed, regenerates the card modules and checks them. The push opens a draft *outer PR* for the branch if none is open, and CI runs `make check` and `make app-check`. `[you]` The PR is opened on push rather than at commit time because a hook runs before anything exists on GitHub. `[agent-proposed]`

**3. Review the diff.** The push starts an agent that reads the diff of the sources since `main` and decides whether code changes are needed. It writes work issues, labelled `ready-for-agent`, and ruling questions, labelled `needs-human`, with the questions blocking the work through native issue dependencies. If no change is needed it says so on the outer PR. `[you]` for the trigger; issues as the output `[agent-proposed]`.

**4. Rule.** A question is a `needs-human` issue assigned to the designer. Agents never claim it. The answer goes on the issue; the label swap unblocks the work. `[you]`

**5. Implement.** Each work issue becomes an *inner PR*, stacked with gh-stack, targeting the outer branch. Reviewer agents review it and CI checks it. When clean it merges into the outer branch, never into `main`. Agents report status as PR and issue comments. `[you]`

**6. Agent playtest.** Runs on the outer branch once the inner PRs are in, source-blind, through `bin/nvu play`. The note and run file commit to the outer PR as today. A report issue assigned to the designer carries the summary and links to the note. `[you]` The playtest runs inside the outer PR, before merge, with one report issue per outer PR and one comment per run. `[agent-proposed]`

**7. Read, decide.** The designer reads the report and either edits the sources again on the same branch, which bumps R or C and runs the loop again inside the same outer PR, or merges the outer PR to `main`. `[you]`

## Kit revision

A kit revision names one playable state of the game: `R133.C24-v2`. It replaces the `0.2.x` rules version printed on the cards. `[you]`

- **R** counts rulebook changes and **C** counts card list changes. Both are stored in the file they count, the `Rules version` line in `rulebook.md` and a line under `meta` in `cards.yaml`, and bumped by the pre-commit hook on a commit that touches the file. The existing bump script already raises against `main`, which is how two branches that both reach R133 are resolved at merge. `[you]` for the counters; where they live `[agent-proposed]`.
- **v** counts engine changes so two playtests of the same R and C on different engine builds can be told apart. It never counts merge commits. `[you]` It is derived from git, not stored: v1 is the engine as it stood when R or C last changed, and each later non-merge commit touching `app/`, excluding the generated card module, adds one. `[agent-proposed]`
- One script prints the full kit revision. The CLI, the run file, the playtest note and the print sheet stamp what it prints. The web build bakes it in at build time. `[agent-proposed]`

## Where it runs

Deterministic CI runs on GitHub-hosted runners. Agents run as jobs on a self-hosted GitHub Actions runner on the designer's always-on desktop Mac, installed as a launchd service. The repo is private, which a self-hosted runner requires. `[you]`

The contract that keeps the runner replaceable: every step starts on a GitHub event and ends in GitHub writes, meaning comments, labels, issues, PRs and commits. Nothing downstream reads the runner's own state. Claude Code Routines on a webhook, or a controller, could take the runner's place without changing the loop. `[agent-proposed]`

What GitHub provides, so nothing is built for it: dispatch by `push`, `pull_request` and `issues.labeled` events; one worker at a time by a concurrency group per outer branch; the workflow run as the record of an attempt, with the agent transcript uploaded as a run artifact; cancel and re-run for recovery; a marker in posted comments so a retry does not post twice. `[agent-proposed]`

## Build order

Close the loop with the designer in the middle first, then take the designer out of the parts agents can do. `[agent-proposed]`

1. Step 2: the R and C counters printed on the cards, the engine count, a workflow that opens the draft outer PR on push, the runner.
2. Step 3: the review agent, writing issues.
3. Step 6: the playtest as a job, with the report issue. The loop now closes end to end, with step 5 done by hand through `/take-issue`.
4. Step 5: inner PRs, reviewer agents, merge into the outer branch.

## Not in this loop

Physical playtest kits, publication, numerical balance reports and a workbench are not part of the loop and are not blocked by it. They attach to a kit revision when they exist.
