# North vs Up — Software Approach Notes (exploratory phase)

Status: **approach decided 2026-08-12. First prototype built and run.**

> **Results are in `prototype/NOTES.md`.** Headlines: each extra job the deck does costs
> ~14 cards of deck size (energy 14 / discard 28 / bleed 42); cards-as-cost is what makes
> deck-is-life actually threaten you (87–100% of wins are close, vs 0% under energy);
> **`discard` is the leading candidate** on tension-per-component; and the kill-vs-recruit
> choice is **broken in all three models** — recruiting is dominant by 68–80%.

## 0. The fork — RESOLVED

The design handoff (`north-vs-up-game-design-handoff.md`) describes a **physical tabletop
game** — "1–2 player cooperative roguelike deck-building card/board game", with an explicit
constraint to avoid "mechanics requiring additional physical components." The ask was about
building it in software. Two possible targets:

- **(A) Digital game.** The software *is* the product. Ship on Steam/web/itch.
- **(B) Design tool.** The software is a simulator/playtest rig for a physical game.
  It answers balance questions and lets you iterate on rules faster than printing cards.

**Decision: build physical-capable, hedge on shipping.** The software's job right now is (B)
— a design and testing rig — while keeping the door open to (A). Physical-capability is a
*hard constraint on the engine*, not a nice-to-have. See §1.5.

### 1.5 What "physical-capable" costs the engine

This constraint has real teeth. It is enforced structurally, not by convention:

- **The state schema only contains physically representable things.** Zones
  (deck / hand / discard / in-play / exhaust), card orientation, adjacency/stacking, and a
  small capped set of counters. Non-physical state is *unexpressible*, so no separate "is
  this physical?" lint pass is needed. (A lint tool would be a second system — the doc's own
  low-complexity filter applies to the tooling too.)
- **Randomness only through physical randomizer primitives:** `shuffle(zone)`,
  `draw(zone)`, `roll(die)`. Each is seeded internally, so determinism and replayability
  survive intact — but every random outcome is now something two people at a table can
  physically perform. If an encounter type needs randomizing, the engine forces you to
  declare the encounter *deck* it comes from. No `rng.pick(encounterTypes)`.
- **No hidden per-turn upkeep.** Duration effects need a token or a card placement, because
  a human has to remember them.
- **Small-integer arithmetic only.** If a human needs a calculator, the mechanic is wrong.
- **Hidden information: skipped.** It's co-op, the sim policy sees everything anyway, and
  open hands is a legitimate co-op design. Not worth the engine complexity.

## 1. Recommendation

Build a **headless, deterministic rules engine in plain TypeScript** — no engine, no
framework — plus a deliberately throwaway UI (CLI first, cheap web view second).

Rationale:

- The doc's own #1 open question is **"what is the core gameplay loop?"** (combat-centric vs
  exploration-centric vs hybrid). That is a *rules* question, not a rendering question.
  Art, animation, and juice cannot answer it, so anything spent on them now is spent early.
- Determinism (seeded RNG, pure reducers) buys **simulation**: run 10,000 headless runs
  overnight, chart win rates, deck sizes, curve. This is how you'd balance a physical game
  too — it is target (B)'s entire value proposition and target (A)'s best QA tool.
- The logic is **portable**. If the answer turns out to be "digital game with real
  presentation," the engine ports to Godot (or stays TS behind a nicer UI). If the answer is
  "physical game," the engine becomes the reference implementation the rulebook is written
  from.

### Architecture sketch

```
state (plain data, immutable)  ──►  action(state, args) ──► new state
                                     ▲
                                     └── seeded RNG carried *in* the state
```

- **Pure reducers.** `applyAction(state, action) -> state`. No I/O, no `Date.now()`, no
  `Math.random()` — the seed lives in state so a run is fully replayable from
  `(seed, action log)`. This is the [Slay the Web](https://github.com/oskarrough/slaytheweb)
  pattern and it's the right one.
- **Data-driven cards.** Cards are JSON/TS data referencing a *small vocabulary of effects*,
  not bespoke code per card. The doc's "cards should do multiple jobs" and "low complexity"
  both point at a tight effect vocabulary. If a new card needs new engine code, that's a
  design smell worth noticing early.
- **Cards-as-resources** (the Star Wars CCG-inspired mechanic) is the riskiest unproven
  system in the doc. It should be modeled in the engine on day one, because it changes what
  "hand", "deck", and "damage" even mean.
  **Strawman v1: deck-is-life.** Damage mills your deck; running out = you lose. Fully
  physical (no HP track, no tokens), and it makes deck *size* a resource in tension with
  deck *quality* — which is exactly the tension the doc's trading/thinning mechanic wants.
  This is a guess, explicitly expected to be replaced. The effect vocabulary must not
  hard-code it.
- **Co-op / 2 players:** hot-seat only during exploration. Networking is a real cost and
  should not be allowed to drive the framework choice this early.

## 2. Options considered

| Option | Verdict |
| --- | --- |
| **Plain TS engine + throwaway UI** | ✅ Recommended. Fastest loop on the actual open question. Simulatable. Portable. |
| **Godot 4** | Right choice *later*, if target = digital game with animation/feel. Editor-first workflow is a tax when the open question is rules, not visuals. |
| **boardgame.io** | ⚠️ Steal the concepts (moves, phases, immutable `G`, turn order), skip the dependency. Repo is alive (12.4k stars, commits Aug 2026) but they're dependabot/lint chores — **last npm release 0.50.2, Nov 2022.** Four years without a release for a framework you'd build your core on. |
| **Phaser / PixiJS** | Rendering libraries. Solve a problem you don't have yet. |
| **Unity** | Heavier than Godot for this, and licensing noise. No advantage for a 2D card game. |
| **Tabletop Simulator / screentop.gg / Tabletopia** | Complements, not build targets — for getting *humans* playtesting a physical version. screentop.gg is free/no-install; TTS is paid and some playtest cons dropped support for it. |

## 3. Proposed first milestone (vertical slice, ~1 sitting)

Enough to actually play, not enough to be precious about:

1. Turn loop: draw → play → discard → reshuffle-on-empty.
2. ~10 cards using ~4 effect primitives.
3. One enemy with a telegraphed intent pattern.
4. **Cards-as-resource** in whatever the current best guess is.
5. Weaken → choose: **defeat** (reward) or **recruit** (enemy card enters deck).
6. Seeded RNG + full action log; a `sim` entry point that plays N runs with a dumb policy.

Deliverables of the slice: a **headless sim** (N runs, dumb policy, aggregate stats) and a
**minimal hot-seat CLI** to play it by hand. That's it.

Deliberately **not** in the slice: map/floors, narrative branching, trading, art, animation,
save files, networking, hidden information.

**Roadmap, not now:** a print-and-play exporter (card data → printable sheets) so human
playtesting is cheap. Real value, but the card data model will churn a lot before it's worth
exporting, and the core-loop question doesn't need paper to get answered.

The point of the slice is to answer: does the combat loop carry the game (Option A), or does
it need exploration around it (Option B / hybrid)?

## 4. Sources

- Slay the Web — headless, UI-agnostic deckbuilder engine: https://github.com/oskarrough/slaytheweb
- boardgame.io: https://boardgame.io/ · https://github.com/boardgameio/boardgame.io
- Same 2D prototype across React/Unity/Godot/Construct/GameMaker/Phaser:
  https://www.freecodecamp.org/news/how-i-made-a-2d-prototype-in-different-game-engines/
- Godot for rapid board-game prototyping: https://drentsoftgames.com/using-godot-for-rapid-prototyping-of-a-board-game/
- Protospiel Online's digital-prototyping platform policy (why not TTS): https://protospiel.online/tabletop-simulator-policy/
