# 07 — Decide how card data reaches the app

Type: grilling
Status: resolved
Blocked by: 01, 03

## Question

`make build` turns `design/cards.yaml` into `tools/cards.js`. Does the app consume that same
generated file, a generated JSON or TypeScript module of its own, or read the YAML at build time?
Decide who owns the generator, where the output lands in the new tree, and how `make check`
guards against drift for the app as it does for the card sheet.

## Answer

`[proposed by agent → ruled on your instruction, 2026-09-01]`

**The YAML stays the one source.** `tools/cards.mjs` gains a second output alongside
`tools/cards.js`: `app/src/content/cards.generated.ts`, a typed `as const` module that
imports only domain types. `make build` writes both; `make check` fails if either is stale.

**Parsing happens in the generator, not the app.** A room's Flee prose is parsed in the generator,
not at runtime, so the content module already carries structured `thresholds` and `flee` fields
and the domain never parses a sentence.

**Behaviour coverage is part of `check`.** The Vitest content test asserts every official card
with `text` has a registry entry, and `make check` runs it, so a card added to the YAML without
code fails the same way a stale sheet does today.

**The generator is a tool, not a layer.** It lives in `tools/`, owns no rules, and is the only
thing that reads the YAML.

**Ruled out.** Reading the YAML at app build time through a Vite plugin: adds a parser to the app
and splits the generation logic in two. Reusing `tools/cards.js` directly: the card sheet's module
is untyped and carries no domain types.
