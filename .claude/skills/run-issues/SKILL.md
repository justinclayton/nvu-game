---
name: run-issues
description: Coordinate a batch of ready-for-agent issues with one Sonnet subagent per issue, in dependency waves, and review and merge PRs that are ready for review. Run from a Fable session.
disable-model-invocation: true
---

# Run issues

You are the coordinator. Subagents do the implementation; you decide order, launch, verify, and merge. The defaults this process rests on (model choice, wave size, environment setup, verification) are in `docs/agents/issue-tracker.md` → "Running issues with subagents"; read that section first and apply it as written.

Arguments: `$ARGUMENTS` may name issue numbers to run and PR numbers to review. With none, the batch is every open `ready-for-agent` issue, and the **review queue** is every open PR that is ready for review (not a draft). Either can be empty; a run with only a review queue skips steps 1, 4 and 5 but still lists the queue (last paragraph of step 1).

## 1. Build the waves and the queue

List the batch with the issue-tracker doc's list query, then read each issue with its full history. Order into waves:

- An issue blocked by another open issue waits for the wave after its blocker.
- An issue that rewrites files several small issues also touch goes in a later wave than those small issues; register the blocking relationship so the order is visible on the tracker.
- Note any issue that needs exclusive access to a shared resource (a device pool, a shared database, a signed-in account) per the doc's "Running issues with subagents" section — at most one such issue per wave, unless the doc says otherwise.

Model per issue: `sonnet`, or `opus` when the issue is an architecture or refactor change across files other issues touch. Record the choice beside each issue.

Done when every issue in the batch has a wave, a model, and (where needed) a registered blocker.

List the review queue with `gh pr list --state open --draft=false --json number,title,body`, whether or not the batch has issues. PRs are not waved. The PRs this run's agents open join the queue as they finish, and PRs this run sent back to draft for a gap rejoin it once fixed (step 6).

## 2. First message to the user

Post the wave plan as a table (issue, title, wave, model, shared-resource use yes/no) and, under it, the review queue (PR, title, closes which issue). Ask, in this message, for authorisation to merge PRs that pass their Done-when. Merging is refused unless the user grants it in this session.

## 3. Preflight

Run whatever this repo's "Running issues with subagents" section lists as setup before a wave (shared services, device/simulator pools, environment checks). Check plan usage (`get_usage`); hold the wave until the usage window has room for it.

Work the review queue (step 6) before launching wave 1, so the wave's branches are cut from a `main` that already holds those merges.

## 4. Launch a wave

Two or three agents at once. For each issue, set up an isolated worktree per the doc's environment section, then launch with the Agent tool, `model` set per step 1, `run_in_background: true`, and the brief below filled in. Each agent gets the full brief; length is not a cost worth trimming.

### Brief

```
You are implementing issue #<n> for this project, alone, in the worktree
<abs path> on branch <branch name per the tracker doc>. Work only inside that
worktree.

Start: claim the issue per docs/agents/issue-tracker.md, then read its full
history. The issue's Done-when is your completion criterion; every line of it
is satisfied before you open the PR.

Conventions: docs/agents/issue-tracker.md (claiming, branch, PR, media).
CLAUDE.md is the reading map — which files to open for a given change, and
which to leave closed; app/README.md describes the layers and the build.
Read both before designing anything user-facing.

Environment setup, shared-resource rules (device pools, seed data, etc.), and
how to verify a change are in docs/agents/issue-tracker.md → "Running issues
with subagents". Follow that section as written.

Finish: tests pass; open a PR that closes the issue per the tracker doc's
convention, with media for anything visible per the doc. Open it ready for
review, not as a draft. Do not merge.
Release any shared resource you acquired. Reply with: PR number/link, what
you verified and how, anything in Done-when you could not satisfy and why.

<state you inherit, when resuming: commits on the branch, open PR, scratchpad
artifacts, how the base branch has moved since the branch was cut>
```

## 5. While agents run

Act on completion notifications. A notification that an agent is waiting on a shared resource is progress, not a prompt; leave it. An agent killed by a usage limit does not resume: when the window resets, launch a fresh agent with the same brief plus the "state you inherit" block.

## 6. Review and land a PR

Applies to every PR in the review queue, whether this run's agents opened it or another session did.

- Find the issue it closes (`Closes #<n>` in the body) and read the issue's acceptance criteria. Read the PR diff and check each line against it.
- Check `gh pr view <n> --json mergeable,statusCheckRollup`: mergeable, and every check passing.
- For a PR this run's agents opened, rely on the agent's verification report. For any other PR, check it out in a worktree (`git worktree add .claude/worktrees/pr-<n> <branch>`, then `make app-install`) and run the verify commands from the tracker doc. Remove the worktree when done.
- A draft PR is not in the queue; leave it alone unless the user names it or this run sent it back for a gap, and if so run `gh pr ready <n>` only after it passes review.
- **A gap.** Comment on the PR naming the gap, and convert it to a draft (`gh pr ready <n> --undo`) so it leaves the queue. Then either send a fresh agent to that branch's worktree with the gap named (step 4's brief plus the "state you inherit" block) and, when it reports the gap fixed, run `gh pr ready <n>` and review the PR again from the top, or, for a PR you cannot fix without a decision, report it to the user with the blocker.
- **A pass.** Merge in dependency order with `gh pr merge <n> --merge` (this repo's history uses merge commits), once the user has authorised merging.
- After each merge: update every still-open issue branch against the base branch (conflicts cluster wherever the doc's environment section says they do); a conflict an agent should resolve goes to a fresh Sonnet agent in that worktree.
- Remove the worktree; confirm the issue closed, then clear its markers with `gh issue edit <n> --remove-label in-progress --remove-label ready-for-review 2>/dev/null || true` (closing does not remove labels).

Done when every PR in the queue is merged or reported back to the user with its blocker.

## 7. Close out

Post a table: issue, PR, merged or not, follow-ups filed. Include review-queue PRs that were sent back (pending fix) or left open, with the reason. Then end the session; a coordinator left idle re-warms its whole context on the next turn.
