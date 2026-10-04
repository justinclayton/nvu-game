# 10 — Research: wiring a pure game engine under React

Type: research
Status: resolved
Blocked by:

## Question

How do turn-based games and board-game engines in React keep a pure `(state, command) -> state`
reducer separate from the view: boardgame.io's model, Redux-style stores, Zustand, plain
`useReducer`. What each costs for replay, undo, and testing. Cite primary sources. Findings go to
`design/web-game/research/react-engine-state.md`.

## Answer

Findings: `design/web-game/research/react-engine-state.md` on branch `research/react-engine-state`
(worktree `.claude/worktrees/research-react-engine-state`). `[research subagent, 2026-09-01]`

- Every option is the same three parts: pure reducer, store, React binding on
  `useSyncExternalStore`. The engine is already the reducer they all want; only store and binding
  are in question.
- boardgame.io owns the reducer and drops the `[state, events]` shape; its server and transport are
  dead weight here. Its stage pattern for pending choices is worth copying: the move ends, state
  records who must answer, and the answer is a separate command legal only in that stage.
- Redux Toolkit's slice wrapper conflicts with a reducer that returns a new object and cannot
  return events.
- Zustand vanilla is the least opinionated host: whole-state replacement, selectors for components,
  and out-of-React subscriptions for sound, animation, and a replay runner. Replay, undo and RNG are
  trivial to add on top.
- XState's `transition` returns `[snapshot, actions]`, an exact match, but makes `xstate` a domain
  dependency and routes all updates through `assign`. A separate design question, not a wiring one.
- Plain `useReducer` plus context stays React-free in the reducer but has no selectors and nothing
  for non-React code to subscribe to.
- Replay in every thin host is a fold over the command log; undo is a stack of states or Immer
  inverse patches; a pending choice is a field the reducer checks first.
