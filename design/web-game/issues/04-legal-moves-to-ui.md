# 04 — Decide how the engine tells the UI what is legal

Type: grilling
Status: resolved
Blocked by: 02

## Question

The UI must never re-implement a rule to know which buttons to show. How does the engine expose
legal commands and pending choices (who absorbs a Flee cost, which cards may pay a cost, whether
draw is still allowed)? Options include a `legalCommands(state)` query, a validation function the
UI calls per candidate, or the state carrying an explicit "awaiting choice" phase. Decide the one
mechanism, and how illegal commands fail.

## Answer

`[proposed by agent → ruled on your instruction, 2026-09-01]`

**Three pieces, all in domain, and the UI uses nothing else.**

1. `state.pending`. When set, it names the choice being waited for, who must answer, and the
   legal answers, for example `{ kind: "FleeTarget", options: ["Red", "Gray"] }` or
   `{ kind: "PeekOrder", character, cards }`. The UI renders exactly that and nothing else until it
   is cleared. Only the answering command is legal while it is set.
2. `validate(state, command): Rejection | null`. `execute` is validate then apply, so the UI
   can ask "would this be legal" for any candidate without running it. A rejection carries a
   `reason` code and a printable message.
3. **Targeted queries** for the common cases, so the UI never enumerates: `canDraw(state, c)`,
   `playableCards(state, c)`, `payOptions(state, c, cardId)`, `metThresholds(state)`,
   `statPool(state, side?)`.

**Illegal commands never throw.** They come back as `{ ok: false, reason }` and the session
surfaces the message. A throw is reserved for a corrupted state, which is a bug.

**Ruled out.** A single `legalCommands(state)` enumerator: `PLAY_CARD` with its `payWith`
set explodes combinatorially. Letting the UI grey buttons from its own rule knowledge: the exact
thing the boundary exists to stop.
