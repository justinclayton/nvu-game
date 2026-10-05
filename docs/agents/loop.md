# The design loop's jobs

How each step of the [design loop](../../design/loop/spec.md) runs on GitHub.
Agent jobs run on the [self-hosted runner](runner.md).

## Step 2: the source layer's PR

`.github/workflows/source-pr.yml` opens a draft PR to `main`, as `nvu-bot`,
for a pushed branch whose `rulebook.md` or `cards.yaml` differ from `main`,
unless the branch is built on another open branch.

CI (`.github/workflows/ci.yml`) runs `make check` on it but skips
`make app-check` when the PR changes nothing but `rulebook.md`, `cards.yaml`
and the generated card modules, since the app's tests are expected to fail
until the code layers land. Any other PR to `main` runs both.

## Step 3: the planner

`.github/workflows/plan.yml` runs the planner. The prompt is
[`.github/loop/plan.md`](../../.github/loop/plan.md); change the planner's
behaviour there, in a PR, like code.

- **When it runs.** On a push to a branch with an open PR to `main` whose
  sources differ from `main`, and on that PR's opened event, which covers the
  first push, before `source-pr.yml` has opened the PR. Any other push stops
  at the `gate` job on a GitHub-hosted runner and never reaches the Mac. A
  pull request from a fork never runs it.
- **What it reads.** The source diff from the commit in its last plan marker
  on the PR to the pushed commit, or from where the branch left `main` the
  first time. The job lists the stack's issues and hands them to the agent
  in the prompt. A push that changed nothing in the sources since the last
  plan runs no agent and posts nothing.
- **What it writes.** As `nvu-agent`: work issues and questions, each with
  `Source PR: #n`, dependencies through `.github/loop/block.sh`, comments and
  closes on issues, and comments on PRs. The job, not the agent, posts the
  agent's final message on the source layer's PR with
  `<!-- nvu-loop: plan <sha> -->`.
- **Status comments.** When the agent starts, the job comments on the
  source layer's PR with the range it reads and a link to the run. The plan
  comment is the end comment; a run that fails before posting it comments
  that it failed instead. A run that stops before the agent starts, because
  the commit is planned already or the sources did not change, posts
  nothing.
- **What holds it to that.** `claude -p --restricted` with only Bash, Read,
  Grep and Glob, and `--permission-mode dontAsk` with an allowlist of
  `git diff/log/show`, `gh issue` and `gh pr` read and comment commands, and
  `block.sh`. Anything else, including `gh api`, output redirection and file
  writes, is refused. The checkout has no git credentials, and the job fails
  without posting if the checkout changed. It runs on Opus.
- **One at a time.** The concurrency group `plan-<branch>` runs one plan per
  stack at a time. A plan that finds its own commit's marker posts nothing,
  so a re-run of a plan that already posted is harmless.
- **The record.** The agent transcript, `transcript.jsonl` in stream-json, is
  the run's artifact `plan-transcript-<sha>` for 30 days.
- **Setup.** The variable `NVU_AGENT_APP_ID` and the secret
  `NVU_AGENT_PRIVATE_KEY`. Without them the job fails.

A stack's issues are the ones `nvu-agent` wrote naming its PR:
`author:app/nvu-agent "Source PR: #n"` in the issue search.

**Recovery.** Re-run the failed run from the Actions tab. If the agent filed
issues and then failed before the comment was posted, the re-run sees them in
the stack's issues and files them again only if they are missing.

## Step 6: the playtest

`.github/workflows/playtest.yml` runs one agent playtest on the stack's top
layer. The prompt is [`.github/loop/playtest.md`](../../.github/loop/playtest.md);
the agent follows the [`/playtest` skill](../../.claude/skills/playtest/SKILL.md).

- **When it runs.** The designer puts the `playtest` label on the source
  layer's PR. The `gate` job, on a GitHub-hosted runner, finds the top layer by
  following open PRs based on the source branch, then those based on them,
  until none is left. With no layers above, the source branch is the top. A
  pull request from a fork never runs it. The job takes the label off when it
  ends, so adding it again asks for another run.
- **The seed.** The source PR's number times 100, plus the run number. The run
  number is the count of earlier reports on the stack plus one.
- **What the agent may do.** `claude -p --restricted` with Bash, Read, Grep,
  Glob and Write. Bash is `bin/nvu` only, and Write is `design/playtests/**`
  only. Reading `app/src` and `design/loop` is denied, so it plays blind.
  The job fails if the agent wrote anything but one new note, or moved HEAD.
  Its read allows are scoped to the checkout (`./**`), with denies for
  `app/src` and `design/loop` by relative and absolute path, so another copy of
  the repo on the runner is closed too.
- **What the job does.** It copies `runs/<seed>.json` next to the note, runs
  the replay check (`app/src/cli/playtests.test.ts`), and commits both to the
  top layer as `nvu-bot`. It then posts the report as `nvu-agent`.
- **The report issue.** One per stack: an issue `nvu-agent` wrote with
  `Report for PR: #n` in the body, labelled `loop` and assigned to the
  designer. The first run opens it with the note's "What the run showed" and
  "Candidate issues" and a link to the note at its commit. Each later run is a
  comment in the same shape. Every post carries
  `<!-- nvu-loop: playtest <sha> -->`, the top layer's commit with the note,
  and the job posts nothing if it finds that marker.
- **Closing it.** Merging the stack approves the playtest.
  `.github/workflows/playtest-close.yml` closes the report issue, as
  `nvu-agent`, when the source layer's PR merges (completed, with a comment
  naming the merge) or closes without merging (not planned).
- **Status comments.** The job comments on the source layer's PR when the
  playtest starts, with a link to the run, when it finishes, with a link to
  the report, and when it fails.
- **One at a time.** The concurrency group `playtest-<source branch>` queues
  runs for a stack.
- **The record.** The transcript is the run's artifact
  `playtest-transcript-<run id>-<attempt>` for 30 days.
- **Setup.** `NVU_AGENT_APP_ID`, `NVU_AGENT_PRIVATE_KEY`, `NVU_BOT_APP_ID` and
  `NVU_BOT_PRIVATE_KEY`. Without them the job fails.

**Recovery.** Add the label again. If the newest `nvu-bot` `Playtest:`
commit on the top layer has no report marker, the run plays nothing and posts
that commit's report. Each App token is minted just before its use, so a long
run does not outlive one. A gate or mint failure comments on the source PR and
takes the label off.
