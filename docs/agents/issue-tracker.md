# Issue tracker: Local Markdown (relocated)

Issues, specs, and wayfinder maps for this repo live as markdown files under `design/`.

This is the standard local-markdown tracker with one override: the directory is `design/`, not
`.scratch/`. This repo is entirely design documents — the maps and tickets *are* the work, not
scratch beside it — so `.scratch` was rejected as misleading.

## Conventions

- One effort per directory: `design/<effort-slug>/`
- The spec is `design/<effort-slug>/spec.md`
- Issues are one file per ticket at `design/<effort-slug>/issues/<NN>-<slug>.md`, numbered from
  `01` — never a single combined tickets file
- Triage state is a `Status:` line near the top of each issue file
- Comments and conversation history append to the bottom under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new file under `design/<effort-slug>/`, creating the directory if needed.

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `design/<effort>/map.md` — the Destination / Notes / Decisions-so-far / Not-yet-specified
  / Out-of-scope body.
- **Child ticket**: `design/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in
  the body. A `Type:` line records the ticket type (`research`/`prototype`/`grilling`/`task`); a
  `Status:` line records `open`/`claimed`/`resolved`.
- **Blocking**: a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every file it
  lists is `resolved`.
- **Frontier**: scan `design/<effort>/issues/` for files that are open, unblocked, and unclaimed;
  first by number wins.
- **Claim**: set `Status: claimed` and save before any work.
- **Resolve**: append the answer under an `## Answer` heading, set `Status: resolved`, then append a
  context pointer (gist + link) to the map's Decisions-so-far in `map.md`.

## Active efforts

- [`design/web-game/`](../../design/web-game/map.md) — architecture spec and skeleton for the official React web version.

- [`design/core-design/`](../../design/core-design/map.md) — North vs Up core design spec.
