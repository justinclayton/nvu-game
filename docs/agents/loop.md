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
  only, through the rule `Edit(design/playtests/**)`: a `Write(...)` rule
  does not match, and Claude Code refuses the write. Reading `app/src` and `design/loop` is denied, so it plays blind.
  It runs on Sonnet: a run is several hundred `bin/nvu` calls, one move each.
  The job fails if the agent wrote anything but one new note, or moved HEAD.
  Its read allows are scoped to the checkout (`./**`), with denies for
  `app/src` and `design/loop` by relative and absolute path, so another copy of
  the repo on the runner is closed too.
- **What the job does.** It copies `runs/<seed>.json` next to the note, runs
  the replay check (`app/src/cli/playtests.test.ts`), and commits both to the
  top layer, then posts the report, both as `nvu-agent`. `nvu-bot` has no
  Contents write.
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
- **Setup.** `NVU_AGENT_APP_ID` and `NVU_AGENT_PRIVATE_KEY`. Without them the
  job fails.

**Recovery.** Add the label again. If the newest `nvu-agent` `Playtest:`
commit on the top layer has no report marker, the run plays nothing and posts
that commit's report. Each App token is minted just before its use, so a long
run does not outlive one. A gate or mint failure comments on the source PR and
takes the label off.

## Step 5: code layers, reviewers and the stack

Two workflows build and review the layers of a stack whose bottom is the source
layer's PR. Nothing in either merges: the designer merges the whole stack with
`gh stack merge <top PR> --merge` (step 7).

### The coder: `.github/workflows/layer.yml`

The prompt is [`.github/loop/layer.md`](../../.github/loop/layer.md).

- **What starts it.** The label `ready-for-agent` on an issue whose body has a
  `Source PR: #n` line. The planner writes that line. The `gate` job, on a
  GitHub-hosted runner, stops unless the issue has no open blocker and PR `#n`
  is an open PR to `main` from this repo, then finds the stack by following
  open PRs based on each branch. A blocked issue is skipped: once its blockers
  close, remove and add `ready-for-agent` to start it. A labeled event needs
  write access, so a fork cannot start it.
- **A new layer.** The job claims the issue (`in-progress` on, `ready-for-agent`
  off), comments on it, and runs the coder on Sonnet in a checkout of the
  stack's top. The coder edits files and runs `make check` and `make app-check`.
  It has no git write access, and it may not edit `rulebook.md`, `cards.yaml`,
  the generated card modules or `.github/`. The job runs both make targets
  itself, then, as `nvu-agent`, adds the branch `claude/issue-<n>` on top with
  `gh stack add`, opens its PR with `gh stack submit --auto`, titles it with
  the issue and puts `Source PR: #n` and `Closes #<n>` in the body, and marks it
  ready for review. The issue stays open, with `in-progress`, until the stack
  merges: the PR's base is the layer below, so `Closes` takes effect only then.
- **A fix or revert.** An issue that also has a `Layer PR: #m` line is committed
  on the branch of PR `#m` as a new commit with a plain push, then
  `gh stack rebase --upstack` and `gh stack push` carry it into the layers
  above. That rebase is the one allowed rewrite. No job amends, squashes or
  force-pushes anything else.
- **Status.** The job comments on the issue when it starts and when it ends,
  and on the layer's PR for a fix. A failure comments on the issue. Every
  comment carries a marker, and the transcript is the run's artifact
  `layer-transcript-<run id>-<attempt>` for 30 days.
- **One at a time.** The concurrency group `layer-<source PR>` runs one layer
  per stack at a time. GitHub keeps only one pending run per group, so a
  finished job removes and adds `ready-for-agent` on the stack's next ready
  issue to start it.
- **Retries.** Re-running a failed run resumes on the claimed issue. If the
  layer's commit is on its branch already, the agent is skipped and the job
  carries on from the push.
- **Setup.** `NVU_AGENT_APP_ID` and `NVU_AGENT_PRIVATE_KEY`. The runner needs
  `gh stack` installed.

### The reviewer: `.github/workflows/review.yml`

The prompt is [`.github/loop/review.md`](../../.github/loop/review.md).

- **When it runs.** A PR from this repo that is not a draft, is based on a
  branch other than `main` and has `Source PR: #` in its body, when it opens,
  becomes ready or gets a push. One review per head commit.
- **What it does.** A read-only agent on Sonnet reviews the diff against the
  issue's acceptance criteria and the repo's standards, and runs `make check`
  and `make app-check`. Its final message is the review body. The job posts it
  as `nvu-bot`, because the coder writes as `nvu-agent` and GitHub does not let
  an author approve their own PR: an approval for `# ✅ Clean`, a change
  request for `# ❌ Changes needed`. The body ends with
  `<!-- nvu-loop: review <sha> -->`, and a run that finds it posts nothing.
- **Clean.** CI green plus the reviewer's approval `[agent-proposed]`. The
  approval is all a layer gets. The coder never merges, and `nvu-bot` and
  `nvu-agent` are not used to merge.
- **Changes needed.** The review stays on the PR. The designer decides: file a
  fix issue with `Layer PR: #m`, or say so on the PR.
- **CI.** `ci.yml` runs on every PR, not only those to `main`, so a layer is
  checked against the layer below.
- **Setup.** `NVU_BOT_APP_ID` and `NVU_BOT_PRIVATE_KEY`.

### Open details

- A layer whose diff a revert empties: whether GitHub merges it is not known.
  If it does not, rebuild the stack without that layer (`gh stack unstack`,
  then `init`).
- A bug the playtest finds reaches its layer as an issue with `Layer PR: #m`,
  filed by the designer. Nothing files it automatically yet.
- `gh stack` has not run on the runner with an App token. Run a first stack by
  hand and watch it before relying on it.
