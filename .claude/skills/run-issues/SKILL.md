---
name: run-issues
description: Coordinate a batch of ready-for-agent issues with one Sonnet subagent per issue, in dependency waves. Run from a Fable session.
disable-model-invocation: true
---

# Run issues

You are the coordinator. Subagents do the implementation; you decide order, launch, verify, and merge. The defaults this process rests on (model choice, wave size, environment setup, verification) are in `docs/agents/issue-tracker.md` → "Running issues with subagents"; read that section first and apply it as written.

Arguments: `$ARGUMENTS` may name issue numbers to run. With none, the batch is every open `ready-for-agent` issue.

## 1. Build the waves

List the batch with the issue-tracker doc's list query, then read each issue with its full history. Order into waves:

- An issue blocked by another open issue waits for the wave after its blocker.
- An issue that rewrites files several small issues also touch goes in a later wave than those small issues; register the blocking relationship so the order is visible on the tracker.
- Note any issue that needs exclusive access to a shared resource (a device pool, a shared database, a signed-in account) per the doc's "Running issues with subagents" section — at most one such issue per wave, unless the doc says otherwise.

Model per issue: `sonnet`, or `opus` when the issue is an architecture or refactor change across files other issues touch. Record the choice beside each issue.

Done when every issue in the batch has a wave, a model, and (where needed) a registered blocker.

## 2. First message to the user

Post the wave plan as a table (issue, title, wave, model, shared-resource use yes/no) and ask, in this message, for authorisation to merge PRs that pass their Done-when. Merging is refused unless the user grants it in this session.

## 3. Preflight

Run whatever this repo's "Running issues with subagents" section lists as setup before a wave (shared services, device/simulator pools, environment checks). Check plan usage (`get_usage`); hold the wave until the usage window has room for it.

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
CLAUDE.md and README.md describe the domain, the build, and anything a
person will see; read them before designing anything user-facing.

Environment setup, shared-resource rules (device pools, seed data, etc.), and
how to verify a change are in docs/agents/issue-tracker.md → "Running issues
with subagents". Follow that section as written.

Finish: tests pass; open a PR that closes the issue per the tracker doc's
convention, with media for anything visible per the doc. Do not merge.
Release any shared resource you acquired. Reply with: PR number/link, what
you verified and how, anything in Done-when you could not satisfy and why.

<state you inherit, when resuming: commits on the branch, open PR, scratchpad
artifacts, how the base branch has moved since the branch was cut>
```

## 5. While agents run

Act on completion notifications. A notification that an agent is waiting on a shared resource is progress, not a prompt; leave it. An agent killed by a usage limit does not resume: when the window resets, launch a fresh agent with the same brief plus the "state you inherit" block.

## 6. Land a finished issue

- Read the PR diff and check each Done-when line against it. A gap goes back to a fresh agent with the gap named; a passing PR is merged in dependency order.
- After each merge: update every still-open issue branch against the base branch (conflicts cluster wherever the doc's environment section says they do); a conflict an agent should resolve goes to a fresh Sonnet agent in that worktree.
- Remove the worktree; confirm the issue closed and its in-progress marker is gone.

Done when every issue in the wave is merged or reported back to the user with its blocker.

## 7. Close out

Post a table: issue, PR, merged or not, follow-ups filed. Then end the session; a coordinator left idle re-warms its whole context on the next turn.
