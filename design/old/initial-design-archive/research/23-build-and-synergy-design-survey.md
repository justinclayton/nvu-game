# 23 — How card games design builds and synergies

Unticketed background research, requested directly. Survey of how existing games make "builds" and
"synergies" work: TCGs (Magic), deckbuilders (Dominion, Slay the Spire), and item-battlers
(The Bazaar).

**Provenance.** Sections 1–6 report what the sources say, with citations. Section 7 is
agent-proposed synthesis — patterns I drew out of the sources, not claims any source makes. Nothing
here is applied to North vs Up; that would be a separate ticket.

**Source quality warning.** Unlike research 01/01a, this was not a primary-document read. Most
sources below were read once through a summarising fetch, and two of the strongest leads could not
be read at all (see Gaps). Treat specific numbers as needing a re-check before anyone builds on
them.

## Sources

| Tag | Document | Class |
|---|---|---|
| **[MTG-NB15]** | Rosewater, *Nuts & Bolts #15: Structural Support* — `https://magic.wizards.com/en/news/making-magic/nuts-and-bolts-15-structural-support` | Tier 1, designer writing about own game |
| **[MTG-INF]** | Rosewater, *To Infinity and Beyond*, 4 Nov 2002 — `https://magic.wizards.com/en/news/making-magic/infinity-and-beyond-2002-11-04-0` | Tier 1 |
| **[MTG-30Y3]** | Rosewater, *30 Years, Part 3* — `https://magic.wizards.com/en/news/making-magic/30-years-part-3` | Tier 1 |
| **[MOLL]** | Félix Moll, *Archetypes in deckbuilding games*, Game Developer — `https://www.gamedeveloper.com/design/archetypes-in-deckbuilding-games` | Tier 2, working designer (Neurodeck), not about a major title |
| **[GD-DB]** | *Designing for deck-building in video games*, Game Developer — `https://www.gamedeveloper.com/design/designing-for-deck-building-in-video-games` | Tier 2, journalism quoting designers |
| **[STS-GDC]** | Giovannetti, *Slay the Spire: Metrics Driven Design and Balance*, GDC — summary at `https://podwise.ai/episodes/1459444` | Tier 3, AI summary of a talk. Not the talk itself. |
| **[BAZ-WIKI]** | *Items*, The Bazaar Wiki — `https://thebazaar.wiki.gg/wiki/Items` | Tier 3, community wiki |

---

## 1. The core vocabulary: set-up and pay-off

The taxonomy every source converges on splits synergy cards in two. [MOLL]

- A **set-up** (enabler) is "a card you might want to play for its effect alone, but that also
  allows a chain reaction with other cards." Poison applied to an enemy, or a strength buff, are the
  stock examples: each does something on its own turn *and* raises the ceiling of a later card.
- A **pay-off** is "a card that offers a strong synergy with a particular set of 'set-ups'." Its
  value is near zero without them.

The balance rule [MOLL] states: weigh a few high-impact, hard-to-reach pay-offs against many
medium-strength, easy-to-reach ones. Consistency comes from the medium tier; the memorable runs come
from the top.

## 2. An archetype is more than a pile of synergies

[MOLL] defines an archetype as "a cohesive group of game elements … designed with the intention to
give clues to the player about one way to play the game." Three claims follow:

- **Flavour is load-bearing.** Art, name, and mechanics have to point the same way, or the player
  never recognises the group as a group.
- **A shared keyword does not make an archetype.** Keywords signal a strategy but do not guarantee
  there is enough design space for one.
- **Archetypes need names players can say out loud** ("fire build"). If players can't name it, they
  can't aim at it.

The worked example is Neurodeck's two-axis archetype: *Wrath X* raises damage, *Sorrow X* forces
discards, some set-ups feed only one axis, and shared set-ups (a "Punching Ball" card) feed both.
Players can go pure or hybrid, and the archetype keeps its identity either way.

## 3. Magic: archetypes as a construction skeleton

Magic builds ten two-colour archetypes per set as its default structure. Per archetype, the design
team answers three questions [MTG-NB15]:

1. **Which mechanics does it rest on?** Set mechanics are deliberately distributed across colours so
   each pair inherits a distinct pair of tools.
2. **How does it win?** Creature swarm, one big threat, or spells.
3. **How fast is it?** Fast / medium / slow, with a target of at least three archetypes at each
   speed.

Two further rules of thumb:

- **The familiarity mix.** Roughly two archetypes should be genuinely novel, four should riff on
  traditional themes, and four should be familiar patterns rebuilt with new cards. [MTG-NB15]
- **Density is checked numerically.** Designers track how many cards of each mechanic a player will
  actually see, whether each archetype has playable threats along the whole curve, and whether each
  pair has its own removal and evasion. [MTG-NB15]

**Signposts.** Magic prints a ten-card cycle of two-colour uncommons that spell out each archetype's
plan. They are uncommon on purpose: common enough to show up in most drafts, but build-around cards
felt wrong at common. Drafting one tells the player how to value everything else they pick.
[MTG-30Y3]

[MTG-NB15] also advises copying the structure of a proven similar set rather than inventing the
skeleton from scratch.

## 4. Combos: why they're wanted and how they're leashed

[MTG-INF] is the clearest statement of the tension.

**Wanted:** combos give the creative player "the ability to do bizarre and cool things," and are
open-ended in a way designed content can't be.

**Dangerous, two ways:**
- *Fast* combos turn the game into solitaire — the opponent stops mattering. The reference case is
  "Combo Winter" (1998), when games ended on turn one or two and the match reduced to opening hands.
- *Slow* combos are the opposite failure: they resolve correctly but take forever, and are tedious.

**The four levers Magic watches**, because each is a combo enabler [MTG-INF]:
1. **Engine cards** — anything converting one resource into another.
2. **Tutors** — searching your deck for a specific card.
3. **Card draw** — converting resource into card selection.
4. **Acceleration** — anything that gets you resources early.

After Combo Winter, R&D priced all four conservatively, cut tutors, weakened draw, and stayed wary
of acceleration. Note that the levers are all about *finding and affording* the pieces, not about
the pieces themselves.

## 5. Slay the Spire: single-player changes the maths

The stated principle is "every card should have its place and avoid overpowered effects to maintain
diverse strategies" [STS-GDC]. But the key structural point is that a single-player roguelike can
afford rare broken combos, because one player's blowout run doesn't ruin anyone else's game — so the
team did not chase every overpowered combination out of the game [STS-GDC].

Two supporting practices:
- **Relics as context.** A card's value is not fixed; relics vary run to run and re-rank the cards.
  The same card is a trap in one run and a keystone in another. [STS-GDC]
- **Metrics, sceptically.** They ran a metrics server plus a playtester Slack, and warn that metrics
  mislead — "super playtester bias" in particular. Ascension levels let them tune for different
  skill bands rather than one average player. [STS-GDC]

The roguelike frame is itself the justification for constant deckbuilding: the run supplies a reason
to keep taking new cards, the way a draft does [GD-DB].

**A named failure mode.** Commentary on the genre points at the homogeneous-deck problem: a class
whose cards don't flex ends up played the same way every run. Slay the Spire's Defect is the usual
example cited. (Low-trust — this came from search-result commentary, not a designer or an analysis I
read; flagged as a hypothesis to check, not a fact.)

## 6. The Bazaar: synergy through space and time, not draw

The Bazaar is an item-battler, so its synergy structure is different in kind. [BAZ-WIKI]

- **Board space is the cost.** Items are Large (3 slots), Medium (2), or Small (1) on a limited
  playmat. Adding a synergy piece means removing something else. There is no draw to dilute — the
  constraint is spatial.
- **Time is the second axis.** Items fire on cooldowns, or on triggers (Start of Combat, On
  condition, Each Hour). Synergy therefore includes *rate*: haste, slow, freeze, and cooldown
  reduction change how often a piece pays off, which is a whole class of synergy that draw-based
  games don't have.
- **Types are the synergy handles.** 18 item types (Weapon, Tool, Food, Relic, …) give pay-offs
  something to reference.
- **Enchantments graft effects on.** A single enchantment per item, from a fixed list — Deadly
  (crit), Fiery (burn), Icy (freeze), Toxic (poison), Turbo (haste), Shielded, Shiny (+1 multicast),
  Obsidian (double damage), and others. This lets an item that was never part of an archetype be
  pulled into one. Enchanted items cost double.
- **Duplicates are the upgrade path.** Bronze → silver → gold → diamond, by finding another copy or
  through level-up encounters. Diamond can't be upgraded and blocks lower copies from appearing.
- **Internal cooldowns exist as a backstop** against infinite trigger chains, per the wiki — exact
  mechanics unclear.

Related, from a different game: SteamWorld Quest's "Heroic Chains" give a bonus for playing three
cards from the same character, which is synergy expressed purely as an ordering constraint rather
than as card text pairs. [GD-DB]

## 7. Synthesis — patterns across the sources

*Agent-proposed. None of these are claims a cited source makes.*

- **Every synergy system needs a scarce thing that isn't power.** Magic's is deck slots plus mana
  colour; Dominion's is buys and the fixed kingdom; Slay the Spire's is deck dilution — every card
  added makes the good ones rarer; The Bazaar's is board slots and cooldown time. Choose the
  scarcity first, because it determines what "committing to a build" costs.
- **Legibility and discovery pull opposite ways.** Signposts [MTG-30Y3] make the archetype
  findable but pre-name it. Slay the Spire's relic-context [STS-GDC] and The Bazaar's enchantments
  [BAZ-WIKI] make builds emerge unnamed. A game can do both — a small set of named archetypes plus
  a modifier layer that reshuffles what's good — and that seems to be where the successful ones land.
- **The four combo levers [MTG-INF] are the general control surface.** They aren't Magic-specific:
  they're search, selection, acceleration, and conversion. Anywhere a design lets players find
  pieces cheaply and early, combos get sharp. In a single-player game the reason to leash them is
  pacing, not fairness [STS-GDC].
- **Pay-off cards are what make a run feel like a build, and set-up cards are what make it feel
  playable.** A pool heavy on pay-offs produces feast-or-famine runs; heavy on set-ups produces runs
  that never crest. [MOLL]'s "few big, many medium" rule is really about the shape of that curve.
- **Ordering and rate are underused synergy axes.** [BAZ-WIKI] cooldowns and [GD-DB] Heroic Chains
  both create synergy without any card-to-card text reference, which means they scale without a
  combinatorial balance problem.

## 8. Gaps — what to read next

- **Dominion.** `dominionstrategy.com` returned HTTP 403 to the fetcher. Vaccarino's "Secret
  History" designer diaries are the single best primary source on deckbuilder card interaction and
  should be read directly — try a browser or an archive mirror. *The Secret History of Dominion*
  (24 Jun 2013) and *The Secret History of Dark Ages* (23 Aug 2012, the "crazy combos set").
- **The Slay the Spire GDC talk itself**, rather than [STS-GDC]'s AI summary. The specific metrics
  (pick rates, win rates by card) are the interesting part and are absent from the summary.
- **Balatro and Monster Train.** Both are cited in the genre commentary as solving build diversity
  differently — Balatro by making the scoring formula itself the synergy surface. No good source
  found; needs a real search.
- **Richard Garfield on randomness and combo**, not searched at all here.
- **Whether the Defect homogeneous-deck claim in §5 is real.** Sourced only to search commentary.
