# 05 — Decide how React talks to the engine

Type: prototype
Status: resolved
Blocked by: 02, 04

## Question

How does a pure reducer sit under React: `useReducer`, a small store (Zustand or similar), or a
hand-rolled hook wrapping `execute`? Where do the seed, the command log, and replay live, and does
the UI subscribe to state, to events, or both? Build a throwaway React page that plays one Draw and
Play phase against the engine reference and react to how it feels.

## Answer

`[proposed by agent → ruled on your instruction, 2026-09-01]`. Resolved as a decision; the throwaway page is folded into the implementing agent's first
vertical slice instead.

**A Zustand vanilla store in application.** `application/session.ts` exports
`createSession(seed, content)` returning a `createStore` instance holding
`{ state, commands, events, history }`, with `subscribeWithSelector`. It is React-free, so a
replay runner, a smoke test, or a future bot can drive it.

**Dispatch.** `session.dispatch(command)` calls `execute`; on `ok` it replaces state
whole, appends the command to the log and the events to the event log; on rejection it stores the
rejection for the UI to show and changes nothing else.

**Undo.** A stack of prior states. Undo is allowed back to the last **checkpoint**, and a
checkpoint is any command whose events revealed hidden information: `FLIP_ROOM`, `DRAW`,
`END_PLAY`, `ASCEND`. Playing and paying can be taken back; seeing a card cannot. A domain query
`revealsHiddenInfo(events)` decides, so the rule is not in the store.

**Replay and persistence.** Saving a run is the seed plus the command log; loading is a fold. That
resolves the persistence item from the map's fog with no event store.

**React binding in ui.** `ui/useSession.ts` wraps `useStore(session, selector)` so each
component subscribes to a slice. Non-component concerns (sound, animation queue, a text log)
subscribe to the event log outside React.

**Seed source is infrastructure.** `infrastructure/seed.ts` supplies a seed from
`crypto.getRandomValues`; application asks for it at session start. The domain never sees the
source.

**Ruled out.** Redux Toolkit: its Immer slice wrapper fights a reducer that returns a new object
and cannot return events. Plain `useReducer` with context: no selectors, nothing for non-React
code to subscribe to. XState: settled in ticket 02.
