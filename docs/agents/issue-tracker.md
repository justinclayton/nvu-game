# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues on `justinclayton/nvu-game`. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Issue bodies here use an "Acceptance criteria" checklist rather than a "Done-when" line; treat it the same way — every box checked is the completion criterion.

## Claiming an issue

Open issues an agent may pick up carry `ready-for-agent`. "Take the next issue" means the lowest-numbered open `ready-for-agent` issue with no open blocker. Claiming is the session's first write: swap the label so no other session picks the same one.

```
gh issue edit <n> --add-label in-progress --remove-label ready-for-agent
```

An issue that says "design first" or asks for `/grilling` carries `needs-human` instead of `ready-for-agent`: the designer settles the design in a session, records the outcome on the issue, and swaps the label. Agents never claim `needs-human` issues.

Name the working branch `claude/issue-<n>` after the issue number. Open the PR with `Closes #<n>` in the body; the merge closes the issue and the `in-progress` label goes with it.

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone.

## Running issues with subagents

A coordinator session can work a batch of `ready-for-agent` issues by launching one subagent per issue, each in its own worktree (`.claude/worktrees/issue-<n>`, branch `claude/issue-<n>`), in dependency order. `/run-issues` (a user-level skill) is that process; `/take-issue` is the single-issue path for a Sonnet session in the main checkout.

- **Model: Sonnet by default.** Use Opus only for architecture or refactor issues that rewrite files other issues also touch (a restructure of the engine under `app/src/domain/` is the shape).
- **Concurrency: 2–3 agents at once.** Check plan usage (`get_usage`) before launching each wave.
- **No shared runtime resource.** This is a web app with no device pool or shared signed-in account, so waves aren't limited by that; the only thing to serialize is issues that touch the same generated or hand-authored files (`design/cards.yaml`, `tools/cards.js`, the engine in `app/src/`).
- **Environment setup, per worktree:**
  ```sh
  git worktree add .claude/worktrees/issue-<n> -b claude/issue-<n> origin/main
  ( cd .claude/worktrees/issue-<n> && make app-install )
  ```
- **Verify:** `make check` (regenerates and checks the card modules against `design/cards.yaml`) and `make app-check` (lint, typecheck, test the web game) in the worktree. Both must pass before opening a PR. Run `make build` after any change to `design/cards.yaml` so the generated modules aren't stale.
- **Own preview.** A worktree agent that wants to look at its own app runs the dev server from inside the worktree — `npm run dev -- --port <n>` in `app/` — not `preview_start`. `preview_start` and `.claude/launch.json` serve the main checkout's `app/`, not the worktree's, so a screenshot taken through them can show unmodified code and get called verified. `?fixture=<name>` works the same on that port; see **Screenshots and video** below for shooting it headlessly.
- **Port per issue.** Use port `5000 + <n>` (`<n>` the issue number), so parallel agents never collide.
- **Conflict hotspots** when merging the base branch into a still-open issue branch: `design/cards.yaml`, `tools/cards.js` (generated — regenerate rather than hand-merge), and the engine/rules files under `app/src/`.
- **Recovery.** On resuming a run after a limit or a sleep: launch a fresh agent with an explicit "state you inherit" section (commits, PR, scratchpad artifacts, how `main` moved).

## Screenshots and video on pull requests

A PR for anything a person can see (a new screen, control, layout, or a visible bug fix) carries pictures of it, so the review can happen from the PR page rather than by building the branch. Screenshots for a static change; a short GIF for an interaction. Skip it for pure rules, engine, or tooling changes with no UI surface.

Media lives on the orphan branch `pr-media`, one directory per issue, and is referenced from the PR body by URL. It never merges into `main`.

```
# from any checkout, without disturbing the working tree
git fetch origin pr-media
git worktree add --detach /tmp/pr-media-<n> origin/pr-media   # detached, so parallel sessions don't fight over the branch
mkdir -p /tmp/pr-media-<n>/issue-<n> && cp <screenshots> /tmp/pr-media-<n>/issue-<n>/
git -C /tmp/pr-media-<n> add -A && git -C /tmp/pr-media-<n> commit -m "Add media for issue #<n>"
git -C /tmp/pr-media-<n> push origin HEAD:pr-media   # rejected? pull --rebase origin pr-media, then push again
git worktree remove /tmp/pr-media-<n>
```

Reference each file as `![caption](https://github.com/justinclayton/nvu-game/raw/pr-media/issue-<n>/<file>)`, with a one-line caption saying what to look at. This repo is private, so use that `github.com/.../raw/...` form: it loads for anyone signed in with access, while a `raw.githubusercontent.com` URL does not render. Keep files small: downscale screenshots to about 800px wide (`sips --resampleWidth 800 in.png --out out.png`), and keep GIFs under a few megabytes.

**Opening a mid-game screen.** The web game always starts from a fresh run, and reaching a given
prompt can take several turns of play. Under the dev server (`make app`), `?fixture=<name>` opens
the app already parked on a named state instead — `http://localhost:5173/?fixture=play`, say. An
unknown name shows the list of names that exist. This only works under the dev server: the loader
and the named states are dev-only and are not in a production build.

The named states are `app/src/domain/__fixtures__/scenarios.ts`, built with the same `rig` helpers
the domain tests use (`app/src/domain/__fixtures__/rig.ts`), so a state is a few lines and cannot
drift from the engine's types. Add a fixture there when a PR needs a state the set lacks: build it
the way a domain test would — `rig`, `card`, `pile`, `must`/`play` — ending wherever the screen
wants to be looked at, and give it a name and a one-line description in the `FIXTURES` list.

Taking a screenshot of a page without a browser session, for the web game's dev server or a local file such as `tools/card-sheet.html`:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --screenshot=out.png --window-size=1280,800 <url>
```

Before-and-after pairs are the most useful shape for a fix; a single frame of the new thing is enough for a feature.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (`gh api` on the sub-issues endpoint). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: prefer GitHub's native issue dependencies (`gh api --method POST repos/justinclayton/nvu-game/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric database id from `gh api repos/justinclayton/nvu-game/issues/<n> --jq .id`, not the `#number`). Where that isn't set up, the existing fallback in this repo is a `## Blocked by` section in the body listing the blocker issue URLs directly.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me`, the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.
