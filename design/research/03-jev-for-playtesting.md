# 03 — Jev for playtesting: what it is and where it would fit

Unticketed research, requested directly. The ask `[you, 2026-10-01]`: what is Jev, TypeSafe AI's structured-decision model, what is known about how it performs and what it costs, and where, if anywhere, it would fit beside the playtesting tools this project already has: the agent playtest through the CLI, `nvu fuzz`, the greedy `nvu sim` balance report, the seed solver the spec names for later, the run files and the playtest notes. This note stops short of building anything.

**Evaluated against.** Rules 0.2.6, card list `0e20e58ce5ce` (`cards.yaml` updated 2026-09-30), engine at commit `ab4378d` (2026-09-30). This note will be re-read as the game changes and as Jev changes, so any later evaluation should state its own triple and the Jev model version it tested.

**Provenance.** Facts about Jev come from the cited sources and carry a [TAG] into the Sources table at the end. Facts about the game and its tools come from the repository at the triple above and cite file paths and line numbers. Everything under "How we would use it" is agent-proposed. Nothing here is decided; the last two sections list what you would need to rule on and what could not be read.

## Source quality warning

The research sandbox's proxy blocked TypeSafe's own sites (`typesafe.ai`, `docs.typesafe.ai`), OpenRouter, arXiv, Medium, Hacker News, dev.to and most blogs. GitHub, `raw.githubusercontent.com`, the npm registry and Anthropic's pricing page were reachable. The classes of fact below therefore rest on different classes of source.

The API contract (request and response shapes, the three primitives, the absence of seed and temperature fields) rests on the official TypeScript SDK source [TS-SDK-TYPES] [TS-SDK-CLIENT] and the official agent skill file [TS-SKILL]. This is the firmest class: TypeSafe's own code. The limits, price and rate limits rest on platform listings [VERCEL-README] [PORTKEY-940] and on secondary pages quoting the official docs [AWESOME-JEV] [AWESOME-USES]; two or more copies agree on every number used, but none was read from TypeSafe directly. Performance and calibration numbers rest on independent GitHub repositories whose READMEs were read in full [AUDIT-SEOUL] [OOD-CAL] [ANTHUS-CAL] [ARCADE] [CHESS-WT] [STS2-SHOE]; these are hands-on but unreviewed, small-n and self-reported.

The shakiest facts are marked where used: the "50 identical requests, 15 distinct answers" nondeterminism finding [AUDIT-SEOUL]; the "32.5% of answers flip when yes/no labels are swapped" finding, from a blocked blog's excerpt [DEV-8DAYS]; the data terms [TS-LEGAL-SNIP]; the "waitlist only, no free tier" access claim [LAYER3-SNIP]; and every number from the Pokémon Red repository that is now a 404 [POKE-THUMAY]. The official "jaggedness" page was not read; its gist comes from secondary copies [AWESOME-USES] [TS-DOCS-SNIP].

## What Jev is

Jev is TypeSafe AI's first "System One" model: a hosted, closed API that takes a serialized state plus typed questions and returns typed answers with probability distributions, with no text generation [TS-DOCS-SNIP] [TS-SKILL]. Early access opened on 2026-09-15; the only published version is `jev-1.13.0`, aliased `jev-latest` [SYSONE-SNIP] [DSPY-LAB]. The TypeScript SDK `@typesafe-ai/sdk` 0.6.0 has no production dependencies and needs Node 20 [NPM-SDK].

A request is `{model?, state, questions}`; state is a string, JSON object, JSON array or null. Each question is one of three types [TS-SDK-TYPES]:

| Primitive | Asks | Returns | Limits |
|---|---|---|---|
| Choice | pick one of N named options, each with an optional description | `choice`, `probabilities` per label, `confidence` | up to 255 options [VERCEL-README] |
| Score | place the state on an ordered rubric | `score` (probability-weighted mean of level indices), `probabilities` per level, `confidence` | 2 to 10 levels [VERCEL-README] |
| Noul | yes or no | `noul` = P(yes); no separate confidence | none stated |

Every question in one request is evaluated independently against the same state; one answer never becomes context for another [TS-SKILL] [WIDTH-SNIP]. Question keys are not sent to the model, so the meaning must be in `instructions` and the option descriptions [TS-SKILL]. There is no temperature, seed, few-shot, fine-tuning or memory field in the request type [TS-SDK-TYPES]; gateways say sampling settings are ignored [PYDANTIC-SNIP]. Context caps are 32k tokens for state plus the longest question and 64k per request [AWESOME-USES] [PYDANTIC-SNIP]. Price is $0.042 per million input tokens, output free [PORTKEY-940] [AWESOME-JEV]. Published rate limits are 1,200 requests per minute and 250,000 tokens per second [AWESOME-JEV]; another page quotes 40 requests per second and says limits "adjust dynamically" [LAYER3-SNIP].

Access from TypeSafe itself is by waitlist, with no free tier [LAYER3-SNIP]. The same model is reachable without the waitlist through OpenRouter (`typesafe/jev-1.13`), Vercel AI Gateway and Cloudflare Workers AI at list price [OPENROUTER-SNIP] [AWESOME-JEV]. Vercel's provider rounds probabilities to two decimals [VERCEL-README], so a harness wanting the full distribution should use the SDK or raw HTTP. Terms as excerpted: inputs are retained to provide the service and not used for training; zero data retention is an enterprise option [TS-LEGAL-SNIP]. TypeSafe publishes no calibration metric of its own and tells users to "validate their performance in the target domain" [TS-SKILL] [LEARNJEV-SNIP].

The official division of labour matters most for this project. What stays in code: "Known rules and calculations; Exact lookups; Execution logic; Workflow orchestration and state management" [TS-SKILL]. What goes to Jev: a judgement among options code has already made legal and described.

## What the evidence says about how it performs

Every game harness that reports numbers converged on one loop: code reads the state, code enumerates the legal options and annotates each with computed facts, Jev picks one, code executes it, and every call is logged with its distribution [JEVCRAFT] [HERMES-MC] [POKE-FRIGADE] [STS2-MECKES]. "Code decides what is possible. Jev decides what to do" [JEVCRAFT]; bad behaviour "is fixed by changing what gets offered" [HERMES-MC].

Within that loop the ceiling is local judgement. The clearest quantified boundary is an arcade benchmark on three seeded episodes per game [ARCADE]:

| Game | Random | Heuristic | Jev | Jev as % of heuristic |
|---|---|---|---|---|
| Snake | 0 | 80 | 70 | 88 |
| 2048 | 447 | 497 | 484 | 97 |
| Tetris | 0 | 2,333 | 167 | 7 |

The author's reading: strong where "local reasoning with at most 4 moves" suffices, poor where "multi-step planning ahead" is required; on Tetris, confidence stayed below 0.3 on 97 of 104 decisions, which the author reads as the model correctly reporting that it does not know the game [ARCADE]. A chess benchmark gives the second lesson. Mean centipawn loss fell from 533 (FEN only, worse than random) to 144 (code-computed piece and material facts) to 90 (one-ply tactical facts) purely by changing what code put in the options; at its best Jev still lost to Stockfish at depth 1. "Jev is a judgment engine, not a calculator" [CHESS-WT]. A Craftax harness found the same shape: it picks the option whose words match a fact in the state 92 to 100% of the time when such a fact exists, otherwise "falls back to list position"; it "does not count", and told to mine stone once it mined nine [CRAFTAX].

The deckbuilder results are the closest analogue. A Slay the Spire 2 harness that factors each turn into one request (a Choice over legal moves plus per-candidate "safe", "prog", "waste" factors) measured $0.00046 and 315 ms p50 per decision against $0.012 and 3,590 ms for Claude Opus 5.5, with quality 27/30 versus 29/30 on graded fixtures, "not separable" at a ±3 noise floor [STS2-SHOE]. It also found that Score outputs on near-tied candidates are noise unless deadbanded: returning neutral when factor spread fell below 0.15 gained 16 quality points [STS2-SHOE]. Another harness reached one verified Ascension-0 win across many policy versions and says this "is not a current-policy win-rate estimate" [STS2-MECKES]; a third, after 118 logged experiments, concludes "no new-seed, multi-run win rate demonstrated" [STS2-RSI]. The author of the viral Act 1 video notes that Jev "doesn't seem to maintain a coherent long term strategy (especially without any memory)" [PRANAY-SNIP]. Every serious StS2 harness ended up adding an LLM strategist or engine-side search for the hard turns [STS2-RSI] [HERMES-MC].

Calibration is good in distribution and worse off it. On public multiple-choice benchmarks one study measured 86 to 94% accuracy with expected calibration error (ECE) 0.024 to 0.032; on synthetic out-of-distribution tickets ECE rose to 0.107, with Choice overconfident (refit temperature 1.30), Boolean underconfident (0.66), and Score at ECE 0.325 with mean stated probability 0.74 on a rule unknowable from the state [OOD-CAL]. A sentiment study of 8,801 examples found Choice at 91.4% mean confidence against 76.1% accuracy; isotonic recalibration on a few hundred labels brought ECE to 0.008 [ANTHUS-CAL]. A Seoul audit of about 7,000 calls found accuracy on unanswerable items falling from 0.950 to 0.000 when the abstain option was removed, and a state-blind control scoring 0.38 to 0.46 against chance near 0.15, so option text alone carries signal [AUDIT-SEOUL]. The official skill says the same from the other side: "Include no-match outcomes" [TS-SKILL].

Two findings bear on reproducibility. The same audit reports that 50 identical requests gave 15 distinct answers, and that bundling 16 questions in one request shifted confidence by 0.008 and flipped 0.4% of answers at +14 ms [AUDIT-SEOUL]. One open-source user reports the opposite, that repeated sweeps "vary only by endpoint latency clustering, not model randomness" [STS2-SHOE]. The safe reading is that drift is small but not zero and unmeasured for this kind of state. Separately, swapping which rubric sat behind "yes" and "no" changed 32.5% of answers in one test, against about 2% with neutral names [DEV-8DAYS]; this rests on an excerpt.

As a rubric judge, Jev was ahead of LLM judges mostly on binary criteria and behind only on graded ones, with per-case variance 433 to 913 times lower, but "LLM judges repeat nearly all of Jev's most confident errors" [RUBRIC-ARX]. On agent traces it was stable where an LLM judge jumped by up to 0.250, yet on a "clarity" rubric it returned near-flat scores [JUDGE-NAD]. A phishing study went from 62.6% with one question to 88.2% with a written definition to 95.0% with five signals and weights fitted on 1,000 labels, noting that the 95% "is not Jev's accuracy alone" [BERI-DECOMP]; a replication found "split + fitted weights" the only prompt-shape rule that transferred, and naive splitting without fitting pushed ECE to 0.306 [DECOMP-TR].

Two external points frame this. No cooperative game appears in the Jev corpus; every multi-agent use is adversarial [BOARD-KW]. And the game-AI literature says AI play of any kind is not predictive of human play; what transfers is skill-level matching and best-of-N per seed [JAFFE-12] [ROOHI-21], and weak agents remain useful as relative difficulty rankers when their ranking correlates with human ratings [LLM-TESTERS]. Shipped deckbuilder studios balance on human telemetry, not bot play [GDC-STS-SNIP]; the Dominion simulators "fell out of favor" because their heuristics "stopped matching up with high level play" [IRPAN-21].

## What it costs

| Measure | Figure | Source |
|---|---|---|
| List price | $0.042 per 1M input tokens; output free | [PORTKEY-940] |
| Latency, one question, direct | p50 191 to 280 ms; p95 about 400 ms | [DSPY-LAB] [AUDIT-SEOUL] |
| Latency, via Vercel gateway | median 621 ms (n=6) | [POKE-VAL] |
| Latency tail seen in StS2 | bimodal: 0.34 to 0.79 s, then 7 to 16 s clusters | [STS2-SHOE] |
| 16 questions in one request vs 1 | +14 ms | [AUDIT-SEOUL] |
| Tokens per decision, game harnesses | 725 to 3,100 | [POKE-VAL] [JEVCRAFT] |
| Cost per decision, measured | $0.00002 (short) to $0.00046 (factored StS2 turn) | [MSQ-BENCH] [STS2-SHOE] |
| Pokémon Red, full game | 16,150 decisions, 39.2M tokens, $1.65, 37h 40m | [POKE-FRIGADE] |
| Opus 5.5 on the same StS2 state | $0.012 and 3,590 ms per decision | [STS2-SHOE] |
| Claude list prices, 2026-10-01 | Sonnet 5 $2/$10, Opus 5.5 $4/$20, Haiku 4.5 $1/$5 per MTok in/out | [ANTHROPIC-PRICE] |

Applied to this project. The three most recent agent runs were 241, 238 and 226 engine commands (run files of playtests 10 to 12), so a 500-seed sweep is about 100,000 policy calls. A mid-game CLI table is an estimated 1 to 2 KB (`app/src/cli/render.ts:95-190`; measured end-of-run tables run 290 to 1,089 characters), so with the moves hint and instructions 1,500 tokens per call is a fair planning figure:

| Workload | Calls | Tokens | Cost at list | Serial at 300 ms | At 1,200 req/min |
|---|---|---|---|---|---|
| Full Jev policy, 500 seeds | 100,000 | 150M | $6.30 | 8.3 h | 1.4 h |
| Jev at about 40 flagged decisions per run, 500 seeds | 20,000 | 30M | $1.26 | 1.7 h | 17 min |
| Classify every in-run note in playtests 3 to 12 (about 150 notes, one request each) | 150 | 0.15M | under $0.01 | under 1 min | |
| Same full sweep on Sonnet 5, 300 output tokens per call | 100,000 | | about $700 | 38 h | |

Dollars are not the constraint. Wall-clock and the unknown latency tail are, and the in-process greedy bot runs the same 500 seeds in seconds to minutes with no network at all.

## The suite today, and what it does and does not measure

The spec names four jobs (`design/cli-sim/spec.md:14-29`). The agent playtest `[you]` "stands in for a human playtester. It is not a bot." Random play `[you]` shakes the engine and reports only failures. The greedy bot `[you]` "gives balance volume" and "measures itself as much as the game". The seed solver `[agent, accepted]` is not built but pins two constraints: a pure run loop and a complete move generator.

Three are implemented on one engine through two drivers. `simulate(seed, policy, content, options)` is a synchronous `while` loop: `legalCommands`, then `policy.choose(state, legal, rng)`, then `execute`, stopping with a typed reason (`app/src/sim/run.ts:59-126`). `Policy` is `choose(state, legal, rng): readonly [Command, Rng]` (`app/src/sim/policy.ts:40-44`), registered in `POLICIES` as `random` or `greedy` (`policy.ts:424-427`). `fuzz` and `sim` are thin callers (`app/src/cli/main.ts:602-636, 680-686`); `buildReport` wires `onStep` to an accumulator that tallies win rate, floors, end reasons, pile sizes after each Ascend and per-card counts (`app/src/sim/report.ts:55-67, 130-155`). The agent playtest is the other driver: one process per move, state in a `nvu-run/1` file replayed from the seed on every call (`main.ts:70-135`), notes anchored to log lines, written up under the `playtest` skill with findings weighted engine fidelity, then rulebook gaps, then shape, then card observations (`.claude/skills/playtest/SKILL.md`).

What the suite lacks is stated in its own notes. The greedy bot wins 0 of 500 on the 0.2.4 and 0.2.5 builds while the agent has won twice, and playtest 11 concludes that "the bot's win rate is no longer a good proxy for how hard the game is" because it barely plays the co-op cards (`design/playtests/11-first-rooftop.md`, note 6). The shortfall is judgement: whether a line is reachable with sequencing and draws, and which co-op card is worth playing for the partner. Playtest 12 found four Band 3 clears "by search, not by eye" with a throwaway script (`12-seed-12.md:12-16`). The balance report keeps no per-decision record of which alternatives existed; no tool diffs two `--json` reports although the spec names that use; the saved-run replay check skips every file whose `cards` or `rules` differ from the build, which on this triple is all nine (`app/src/cli/playtests.test.ts:271-345`); and the pass that verifies a note's "possible engine mismatch" against the engine is manual (`SKILL.md`, "What you may read").

Six seams exist, all pure function boundaries: `Policy.choose`; the greedy bot's scalar scorers `effectsValue`, `keepValue`, `rewardScore` and `choosePending` (`policy.ts:85-106, 127-131, 288-291, 333-389`); `RunOptions.onStep` (`run.ts:16-26`); `legalCommands` plus `validate`; the CLI `play` step and its printed text; and the run file with its notes. Four constraints bind all of them. `src/sim` and `src/domain` are lint-enforced pure, with no `fetch`, `Math.random`, `Date.now` or `window` (`app/eslint.config.js:81-101`), and `src/infrastructure` may not import `src/sim` (`eslint.config.js:72`), so only `src/cli` can host an HTTP adapter today (`eslint.config.js:75-79`). The loop is synchronous, so a remote call cannot be awaited inside `simulate` without changing `run.ts`, `report.ts`, `fuzz`, `sim` and four test files, or writing a second loop. `GameState` carries face-down information (`floorDeck`, each `deck`, `pools`, `roomSupply`; `app/src/domain/types.ts:285-314`); the only public-view serialisations are `renderTable`, `moveHint`, `pending.prompt` and `describeEvent`. Tests assert that the same seed and policy give the same command log (`app/src/sim/run.test.ts:205-252`), and every recorded artefact carries the version triple (`app/src/application/exportRun.ts:285-301`).

## How we would use it (agent-proposed)

The first filter is the one TypeSafe states and every harness confirms: Jev judges among options code has already made legal and described; it does not count, plan, or infer rules. Applied to the suite, that rules out several tempting uses before cost is even considered.

It would only measure itself, or add noise, in these places. As an absolute win-rate instrument: a policy's win rate measures the policy, and Jev at mid-price-LLM accuracy [DEV-8DAYS] with no memory [PRANAY-SNIP] would be a second such policy, not a stand-in for a human. As a Score of fun, tension or Band 3 feel: no source validates any model's experiential ratings against human raters, Score is the most overconfident primitive off distribution [OOD-CAL], and the label-swap result [DEV-8DAYS] says the wording would do much of the work. Inside the greedy bot's scalar scorers: the same seam called 200 times per run with a Score that is noise on near-ties [STS2-SHOE], for no evidence gain. As a reachability or dead-turn detector: those are counting problems the engine answers exactly, and Jev cannot count [CRAFTAX] [TS-DOCS-SNIP]; the reach helper playtest 12 asked for belongs in code. As the "separate agent" that verifies an engine-mismatch claim: that needs reading the engine and the indirection the vendor lists as a weakness [TS-DOCS-SNIP]. And anything fed the raw `GameState` would judge with face-down cards in view, which the playtest ethos and the undo checkpoint rule treat as out of bounds (`app/src/application/session.ts:95-98`).

Four candidate uses survive, ranked by evidence added per unit of cost and effort.

**1. A Jev policy at flagged decisions only, for paired restricted-play comparisons.** The greedy bot already factors its play: target line, card, payers, reward, prompt answer. Leave all of that in code and ask Jev a Choice at the two decision classes where the notes say the bot's judgement fails: Clear-or-Flee at the start of a Play phase (the spec's "an unreachable room is Fled without a card played", `spec.md`, "sim") and the Ascend reward pick. Each option is described with engine-computed facts: the threshold, the best reachable Oomph and Scramble from the visible hands, the Flee cost in cards, what a reward adds. That is the chess ladder's lesson: put the consequences in the option text [CHESS-WT]. The measurement is not the win rate but the paired delta between two policies on the same seeds, greedy versus greedy-with-Jev, or Jev-with-card-X versus Jev-with-X-masked, following restricted play [JAFFE-12]. Bot skill cancels to first order; what remains is the marginal value of the judgement or the card under that policy class. At 500 seeds the standard error on a win rate near 50% is about 2.2 points; at the bot's current 0 of 500, floor reached and live cards are the better paired outcomes.

Seam: a new entry beside `POLICIES` and a new `--policy` value. Constraints: the adapter lives in `src/cli` or a new lint row; either the loop becomes async or a second async loop in `src/cli` reuses `legalCommands`, `execute` and `greedyPolicy.choose` for unflagged decisions; the model sees only `renderTable` text and the factored options, never `GameState`; every request and answer is recorded keyed by a hash of the whole request with the model version, so the sweep replays with no network and the run files replay from `commands` alone, as agent-testing tools do at the model boundary [CHRONICLE]; and the report carries the triple plus the Jev version. Cost: about 20,000 calls per 500 seeds, under $2, 20 minutes to 2 hours. Effort: medium. Serializing a decision into facts is the real work, and it is reusable by any later policy, including an LLM through TypeSafe's own adapter [TS-ADAPTER].

**2. A Noul classifier over in-run notes, as a calibration experiment first.** Each agent playtest produces 3 to 48 in-run notes, and the write-up sorts each into engine mismatch, rulebook question, shape or card observation (`SKILL.md`, "Candidate issues"). Playtests 3 to 12 therefore already hold about 150 hand-labelled notes: enough to measure, for under a cent, whether Jev's Nouls ("Does this note claim the engine resolved a move differently from the rulebook?") agree with the agent's labels, and whether its confidence means anything on this text. The decomposition recipe says to write a definition per label, split into atomic Nouls, and fit on labels before trusting a threshold [DECOMP-TR] [BERI-DECOMP]; binary rubrics are where Jev holds up [RUBRIC-ARX]. If agreement is high, the same questions could check a new note's sort before write-up and surface "possible engine mismatch" items for the verification pass in a stable order. If low, that is also an answer. Seam: the run file's `notes` and the note markdown, read by a script in `tools/`. Constraints: output is an input to the candidate-issues list, never a ruling; notes are free text and Jev breaks under prompt injection like a language model [CHECKPOINT-SNIP], so nothing it returns drives an action; carry the triple of the note classified. Cost: negligible. Effort: low, one afternoon.

**3. A full Jev policy on every command.** The adapter from use 1 extended to every decision. It gives a third policy class for the balance report and for the solver's skill-headroom statistic later, at five times the calls of use 1, and it inherits the option explosion: a cost-2 card with five payers alone yields ten `PLAY_CARD` entries (`app/src/sim/moves.ts:108-116`), so the Choice must be factored card-then-payers as the greedy bot does (`policy.ts:243-267`). Try it only if use 1 shows a paired delta worth having. Cost: about $6 and 1.5 to 8 hours per 500 seeds. Effort: medium, on top of use 1.

**4. A difficulty ranker across seeds, validated once against people.** Weak agents' per-level outcomes correlate with human difficulty ratings even when their play is poor [LLM-TESTERS]. A Jev policy's floor reached per seed could rank seeds for the physical playtest. But validation needs human ratings of the same seeds, and the repo holds two human playtests. This use waits for that data. Cost: a subset of use 1 or 3. Effort: low once either exists.

| Rank | Use | Evidence it adds | Where it measures itself | Seam | Cost per 500 seeds | Effort |
|---|---|---|---|---|---|---|
| 1 | Jev at flagged decisions, paired deltas | marginal value of a judgement or a card under a fixed policy class | absolute win rate; co-op coordination untested | `POLICIES`, async loop in `src/cli` | under $2; 20 min to 2 h | medium |
| 2 | Noul classifier over notes | consistency of the four-tier sort; a measured calibration on this text | any threshold before fitting; free-text injection | run file `notes`, `tools/` script | under $0.01 | low |
| 3 | Full Jev policy | a third policy class; skill headroom against the solver later | everything use 1 does, more often | as 1, plus factoring | about $6; 1.5 to 8 h | medium |
| 4 | Seed difficulty ranker | a ranking for the physical playtest | unvalidated until human ratings exist | subset of 1 or 3 | small | low, later |

Try use 2 first: it costs nothing, touches no engine code, and says within a day whether Jev's judgement on this project's own text is worth anything. Spike use 1 in parallel: it is the only use that produces balance evidence the suite lacks, and it builds the option-serialization layer every later use needs. Do not try Score as a fun or feel judge, Jev inside the greedy bot's scorers, Jev as a reach helper or engine verifier, any sweep not recorded and pinned to a model version, or any use that reads `GameState` rather than the printed view.

One alternative is free and deserves naming. The spec's seed solver, once the `OrderCards` cap is paid (`moves.ts:62-63`), gives per seed an upper bound on what any policy can reach; the gap between that bound and the greedy bot is a skill-headroom statistic that needs no model. Mazocarta's posture for its 1,000-seed autoplay numbers, "repeatable probes rather than final balance values" [MAZOCARTA], is the right one for every number from use 1 as well.

## Rulings needed

- Whether a remote model may stand behind a `--policy` at all, given `[you]` "sim has no process, no console, no clock"; if yes, whether the adapter lives in `src/cli` under the existing lint table or in a new layer row.
- Whether `simulate` may become async, or a second loop in `src/cli` is preferred so `run.ts` stays untouched.
- Whether a model-driven policy sees only what the CLI prints, matching the playtest skill's rule, or may see `GameState` as the greedy bot does.
- Where recorded request-answer logs live (gitignored `runs/`, or `design/` beside playtest run files), and whether a sweep is reportable without one.
- What a Jev-backed run is called. The spec says the bot "is not a stand-in for a human"; the same line would need to cover this policy class.
- Which decision classes are flagged for use 1, and which paired comparison runs first.
- Whether the note classifier may touch the candidate-issues list, and who labels beyond the labels already in notes 3 to 12.
- The access route (waitlist, or an OpenRouter or Vercel gateway key) and whether the excerpted data terms are acceptable for this repository's text.
- A budget ceiling per sweep and a model-version pin (`jev-1.13.0`, not `jev-latest`).

## Gaps

- TypeSafe's own docs (introduction, primitives, API reference, models and pricing, jaggedness, legal) were not read; their content here is from snippets and third-party copies.
- No TypeSafe statement on determinism, caching or reproducibility was found; the two independent sources disagree, and drift on card-game states is unmeasured.
- Whether OpenRouter passes the native `state`/`questions` body through is unverified.
- No source tests Jev on a cooperative game, on hidden partner information, or on human-likeness of play.
- The thumay9700 Pokémon repository behind the "50 to 150 ms" and "$1 per RPG" claims returned 404; those numbers are not TypeSafe's.
- Tokens per NvU decision and the wall-clock of a 500-seed greedy sweep were not measured; `node_modules` was not installed and nothing was run.
- The GitHub issues named in the spec and code (#81, #93, #97, #98, #102, #190, #213) were not fetched.
- Whether `report.ts`'s accumulator is exported for reuse by a second loop was not checked.
- The HN threads, the Tom's Hardware article, the PowerHub and Medium commentary, and the dev.to roundup were read as excerpts only.

## Sources

| Tag | Document | Class |
|---|---|---|
| **[TS-SDK-TYPES]** | TypeSafe AI, `typesafe-sdk-js` `src/types.ts`: `https://raw.githubusercontent.com/typesafe-ai/typesafe-sdk-js/main/src/types.ts` | official docs or SDK source |
| **[TS-SDK-CLIENT]** | TypeSafe AI, `typesafe-sdk-js` `src/client.ts`: `https://raw.githubusercontent.com/typesafe-ai/typesafe-sdk-js/main/src/client.ts` | official docs or SDK source |
| **[TS-SKILL]** | TypeSafe AI, agent skill `SKILL.md`: `https://raw.githubusercontent.com/typesafe-ai/skills/main/skills/typesafe-ai/SKILL.md` | official docs or SDK source |
| **[TS-ADAPTER]** | TypeSafe AI, `system-one-adapter-python` README: `https://github.com/typesafe-ai/system-one-adapter-python` | official docs or SDK source |
| **[NPM-SDK]** | npm registry metadata for `@typesafe-ai/sdk`: `https://registry.npmjs.org/@typesafe-ai/sdk` | official docs or SDK source |
| **[TS-DOCS-SNIP]** | `docs.typesafe.ai` pages `introduction`, `concepts/system-one`, `primitives/score`, `model-jaggedness/jev-1.13`, seen as search excerpts (site blocked) | search excerpt only |
| **[TS-LEGAL-SNIP]** | `docs.typesafe.ai/legal` and `typesafe.ai/legal/*`, seen as search excerpts (blocked) | search excerpt only |
| **[ANTHROPIC-PRICE]** | Anthropic pricing page, read 2026-10-01: `https://platform.claude.com/docs/en/about-claude/pricing` | official docs or SDK source |
| **[VERCEL-README]** | `@ai-sdk/typesafe-ai` README in `vercel/ai`: `https://raw.githubusercontent.com/vercel/ai/main/packages/typesafe-ai/README.md` | platform listing |
| **[PORTKEY-940]** | Portkey model catalog PR #940 mirroring the OpenRouter listing: `https://github.com/Portkey-AI/models/pull/940` | platform listing |
| **[OPENROUTER-SNIP]** | OpenRouter `typesafe` model pages and community guide, seen as search excerpts (blocked): `https://openrouter.ai/typesafe` | search excerpt only |
| **[PYDANTIC-SNIP]** | Pydantic AI TypeSafe model page, seen as search excerpt (blocked): `https://pydantic.dev/docs/ai/models/typesafe/` | search excerpt only |
| **[AUDIT-SEOUL]** | jujumilk3, *jev-calibration-audit*: `https://github.com/jujumilk3/jev-calibration-audit` | independent hands-on report |
| **[OOD-CAL]** | scienthoon, *jev-ood-calibration*: `https://github.com/scienthoon/jev-ood-calibration` | independent hands-on report |
| **[DSPY-LAB]** | jmanhype, *jev-dspy-lab*: `https://github.com/jmanhype/jev-dspy-lab` | independent hands-on report |
| **[ANTHUS-CAL]** | AnthusAI, *Jev-Calibration* README: `https://raw.githubusercontent.com/AnthusAI/Jev-Calibration/main/README.md` | independent hands-on report |
| **[MSQ-BENCH]** | themsquared, *jev-benchmark*: `https://github.com/themsquared/jev-benchmark` | independent hands-on report |
| **[ARCADE]** | CankatSarac, *jev-arcade* README: `https://raw.githubusercontent.com/CankatSarac/jev-arcade/main/README.md` | independent hands-on report |
| **[CHESS-WT]** | wondertwins, *jev-benchmark* (chess) README: `https://raw.githubusercontent.com/wondertwins/jev-benchmark/main/README.md` | independent hands-on report |
| **[CRAFTAX]** | mansicer, *jev-plays* (Craftax) README and `jev_policy.py`: `https://github.com/mansicer/jev-plays` | independent hands-on report |
| **[JEVCRAFT]** | mrubens, *jevcraft* README: `https://raw.githubusercontent.com/mrubens/jevcraft/main/README.md` | independent hands-on report |
| **[HERMES-MC]** | teknium1, *hermes-and-jev-play-minecraft* README: `https://raw.githubusercontent.com/teknium1/hermes-and-jev-play-minecraft/main/README.md` | independent hands-on report |
| **[POKE-FRIGADE]** | christianmat, *jev-pokemon* README: `https://raw.githubusercontent.com/christianmat/jev-pokemon/main/README.md` | independent hands-on report |
| **[POKE-VAL]** | valentynkit, *jev-plays-pokemon-red* README: `https://raw.githubusercontent.com/valentynkit/jev-plays-pokemon-red/main/README.md` | independent hands-on report |
| **[POKE-THUMAY]** | thumay9700, *jev-plays*: `https://github.com/thumay9700/jev-plays` (HTTP 404 on 2026-10-01; search-index snippet only) | search excerpt only |
| **[STS2-SHOE]** | shoemoney, *jev-the-spire2* README: `https://github.com/shoemoney/jev-the-spire2` | independent hands-on report |
| **[STS2-MECKES]** | alexmeckes, *jev-the-spire* README: `https://raw.githubusercontent.com/alexmeckes/jev-the-spire/main/README.md` | independent hands-on report |
| **[STS2-RSI]** | yzxoi, *RSI-Jev-Slay-the-Spire-2* README: `https://raw.githubusercontent.com/yzxoi/RSI-Jev-Slay-the-Spire-2/main/README.md` | independent hands-on report |
| **[PRANAY-SNIP]** | Pranay Prakash, X post on Jev playing Slay the Spire 2, seen as search excerpt (blocked): `https://x.com/pranaygp/status/2100870399039037810` | search excerpt only |
| **[JUDGE-NAD]** | nadheesh, *jev-llm-judge* README: `https://raw.githubusercontent.com/nadheesh/jev-llm-judge/main/README.md` | independent hands-on report |
| **[DECOMP-TR]** | betulsimsek, *jev-decomposition-tr* README: `https://github.com/betulsimsek/jev-decomposition-tr` | independent hands-on report |
| **[BERI-DECOMP]** | beri.net, Jev calibration and decomposition article, seen as search excerpt (blocked): `https://www.beri.net/article/typesafe-jev-typed-decision-model-calibration-decomposition-shadow-eval` | search excerpt only |
| **[BOARD-KW]** | KeWang0622, *jev-board-game* README: `https://raw.githubusercontent.com/KeWang0622/jev-board-game/main/README.md` | independent hands-on report |
| **[DEV-8DAYS]** | *Jev After Eight Days of Independent Tests*, dev.to, seen as search excerpt (blocked): `https://dev.to/aws-builders/jev-after-eight-days-of-independent-tests-level-with-mid-price-llms-behind-the-frontier-1c60` | search excerpt only |
| **[WIDTH-SNIP]** | width.ai, *What is Jev*, seen as search excerpt (blocked): `https://www.width.ai/post/what-is-jev-ai-typesafe` | search excerpt only |
| **[CHECKPOINT-SNIP]** | Check Point Research, *Jev is not a language model, but it breaks like one*, listing only (blocked): `https://blog.checkpoint.com/ai-security/jev-is-not-a-language-model-but-it-breaks-like-one-prompt-injection-against-a-typed-decision-model/` | search excerpt only |
| **[RUBRIC-ARX]** | *JEV vs. LLMs as Rubric Judges: Cheaper, Faster, and Wrong in the Same Places*, arXiv 2609.29769, seen as search excerpt (blocked); peer-review status unknown: `https://arxiv.org/abs/2609.29769` | search excerpt only |
| **[CHRONICLE]** | Chronicle, record-and-replay at agent boundaries, README read directly; paper arXiv 2609.20625 blocked: `https://github.com/theagentplane/chronicle` | paper |
| **[MAZOCARTA]** | *Mazocarta*, seeded procedural deckbuilder with 1,000-seed autoplay evaluation, arXiv 2605.08319, seen as search excerpt (blocked): `https://arxiv.org/html/2605.08319v1` | search excerpt only |
| **[JAFFE-12]** | Jaffe et al., restricted play for balance evaluation, AIIDE 2012, seen as search excerpt: `https://homes.cs.washington.edu/~zoran/jaffe2012ecg.pdf` | search excerpt only |
| **[ROOHI-21]** | Roohi et al., DRL agents predicting human pass rates via top-5% runs, arXiv 2107.12061, seen as search excerpt (blocked): `https://arxiv.org/abs/2107.12061` | search excerpt only |
| **[LLM-TESTERS]** | *LLMs May Not Be Human-Level Players, But They Can Be Testers*, arXiv 2410.02829, seen as search excerpt (blocked): `https://arxiv.org/html/2410.02829v1` | search excerpt only |
| **[GDC-STS-SNIP]** | Mega Crit, *Slay the Spire: Metrics Driven Design and Balance*, GDC 2019, and Game Developer coverage, seen as search excerpts: `https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics` | search excerpt only |
| **[IRPAN-21]** | Alex Irpan, *A New Online Dominion Client Approaches*, 2021, seen as search excerpt: `https://www.alexirpan.com/2021/05/23/dominion-temple.html` | search excerpt only |
| **[AWESOME-JEV]** | kraayenjon, *awesome-jev* (aggregator attributing limits and pricing to the official docs): `https://github.com/kraayenjon/awesome-jev` | secondary blog |
| **[AWESOME-USES]** | walidboulanouar, *awesome-jev-use-cases* and its `docs/api-quickstart.md` copy of the official quickstart: `https://github.com/walidboulanouar/awesome-jev-use-cases` | secondary blog |
| **[SYSONE-SNIP]** | systemonemodels.org, Jev model page, seen as search excerpt (blocked): `https://systemonemodels.org/models/jev/` | search excerpt only |
| **[LAYER3-SNIP]** | Layer3 Labs, *Is Jev free* and *Jev limits* guides, seen as search excerpts (blocked): `https://www.layer3labs.io/guides/is-jev-free` | search excerpt only |
| **[LEARNJEV-SNIP]** | learnjev.com, calibration concept page, seen as search excerpt (blocked): `https://learnjev.com/concepts/calibration` | search excerpt only |
