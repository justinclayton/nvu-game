# North vs Up — the web game

The official web version. Architecture: [`design/web-game/spec.md`](../design/web-game/spec.md).
The rules are [`design/rulebook.md`](../design/rulebook.md); the vocabulary is
[`CONTEXT.md`](../CONTEXT.md); every card is written down once in
[`design/cards.yaml`](../design/cards.yaml).

```
make app        the dev server
make app-check  lint, typecheck, tests
```

## Layers

Dependencies point inward, and `eslint.config.js` enforces the table.

| Layer | What is in it | May import |
|---|---|---|
| `src/domain` | the rules: state, commands, events, `execute`, queries, card behaviours | domain only |
| `src/content` | `cards.generated.ts`, emitted from `design/cards.yaml`; data, not rules | domain |
| `src/application` | the session: store, command log, event log, undo, replay | domain, content |
| `src/infrastructure` | adapters: seed source, storage | domain, application |
| `src/ui` | React components and hooks | domain, application, content |

The domain has no React, no `fetch`, no `Math.random` and no `Date.now`; its randomness is the
seed carried in `GameState`.
