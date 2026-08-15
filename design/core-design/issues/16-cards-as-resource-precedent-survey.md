# 16 — Survey card games that use cards themselves as resource, health, or counters

Type: research
Status: resolved
Blocked by: —
Map: [core design map](../map.md)
Feeds: ticket 04 (deck-as-energy-and-HP model)

## Question

Ticket 01 established, in depth, how **one** game ran a card-as-resource economy (Decipher's *Star
Wars CCG*). Ticket 04 is now designing North vs Up's deck-as-energy-and-HP model against that
single data point. This ticket widens the evidence base: **what other card games have made the
cards themselves do the job that tokens, dials, or a life track normally do**, and what is
factually known about how each one worked and what went wrong with it.

The designer's own prompt for this ticket named **San Juan** — cards as currency, not a
deckbuilder — as the one other example they could think of. The genre net is therefore
deliberately wide: any card game, of any era, of any genre, that collapses a resource, a health
total, or a counter into the cards themselves.

Establish, for each game surveyed:

1. **The substitution.** What would normally be a token, track, or dial, and what the cards do
   instead. Which of these it is:
   - cards as **currency** — cards spent from hand to pay costs
   - cards as **health** — the deck, or a pile, *is* the life total
   - cards as **time/clock** — running out of deck ends the game or the run
   - cards as **damage** — taking a hit inserts cards into, or removes cards from, your deck
   - cards as **counters/track** — cards standing in for goods, wounds, progress, score
2. **The zones and the flow.** Where cards go when spent, whether they come back, and by what
   rule.
3. **Who chooses.** When cards leave a pool, is the choice the player's, the opponent's, or
   random?
4. **The loss condition**, where the cards-as-resource system is what ends the game.
5. **Known problems.** Documented degenerate strategies, errata, restrictions, tempo issues,
   bookkeeping complaints, or designer post-mortems attached to that specific mechanic. This
   section matters as much as the mechanic itself.
6. **Bookkeeping cost.** How much physical card-moving per turn the system actually asks of a
   human, as reported by rules text or players.

### Seed list — a floor, not a ceiling

Not exhaustive and not vetted; several of these may turn out not to qualify. Confirm or discard
each, and **go well beyond it** — the value of this ticket is in the examples nobody in the room
had thought of.

- **San Juan** and **Race for the Galaxy** — cards as universal currency (designer's own example)
- **Glory to Rome** — cards as material, currency, and role
- **Star Wars: Unlimited**, **Disney Lorcana** — play a card face down each turn to become a
  resource
- **Flesh and Blood** — every card carries a pitch value; deck-out as a loss condition
- **Marvel Champions**, **Arkham Horror LCG** — cards from hand spent as resources or committed
  to tests
- **Mage Knight** — wounds enter the deck as cards; deck as fatigue clock
- **Gloomhaven** / **Frosthaven** — cards lost to negate damage; deck exhaustion as death
- **Undaunted: Normandy** — cards *are* units, casualties permanently remove them from the deck
- **Magic: The Gathering** — deck-out as a loss condition; life-as-resource cards (the
  Necropotence family) as the *inverse* substitution
- **Hearthstone** — fatigue

**Excluded:** Decipher's *Star Wars CCG*. Ticket 01 already covers it in full; reference it only
where another game's mechanic is a direct descendant or a deliberate departure, and do not
re-establish its facts.

## Constraints on the answer

These are the map's standing research rules, and they are strict here:

- **Facts only.** No recommendations. **No application to North vs Up.** No design opinions. Do
  not rank the games, do not say which is the best fit, do not sketch how any of it could work in
  this game. The human decides what, if anything, is inspiration.
- **Cite sources.** Prefer rulebooks, official errata, and designer statements over wiki
  summaries. Where only community sources exist (BGG threads, fan wikis), say so explicitly and
  mark the confidence.
- Where sources disagree, or rules changed across editions, record the disagreement rather than
  picking a side.
- **Say what you could not find.** A game you could not verify is a recorded gap, not a silent
  omission.
- Organise by **mechanical family** (the five substitutions in question 1), not by a narrative,
  and not as a proposal.

## Provenance note

The map carries a standing rule that a **survey of comparable games was declined** by the
designer. This ticket is a **narrow, explicitly-requested carve-out** from that rule, not a
reversal of it: the subject is *prior art for one mechanic* — cards standing in for tokens — and
not a survey of deckbuilders or roguelites as such. The broader declined survey stays declined.
`[you — requested 2026-08-14]`

## Deliverable

A research file at `design/core-design/research/16-cards-as-resource-survey.md`, linked from this
ticket, plus an answer summary below.

## Answer

Full findings: [research/16-cards-as-resource-survey.md](../research/16-cards-as-resource-survey.md)
— ~1,200 lines. ~50 games examined, **31 qualified**, organised by the five mechanical families with
cross-references, plus a 22-game discard table and a per-claim gaps section. Every entry carries a
confidence marker; community-only sourcing is labelled as such throughout.

**Provenance of the survey itself.** San Juan was the designer's own example `[you]`. The rest of the
seed list was agent-proposed, and three of those seeds were **wrong** — see "Corrections" below. This
is `[research]`: it establishes facts and rules nothing. Nothing here constrains the design until a
grilling ticket adopts it and the human says so.

### The five families

- **Cards as currency** (largest): San Juan, Race for the Galaxy, Glory to Rome, Bohnanza, 7 Wonders,
  Star Wars: Unlimited, Disney Lorcana, Flesh and Blood, Marvel Champions, Ashes Reborn (Meditate
  only), Star Wars LCG (edge battles only), Etherfields, Inscryption, Gloomhaven (damage negation),
  and Magic's Necropotence family as the **inverse** case — life buys cards rather than cards buying
  life.
- **Cards as health**: Coup, Legendary Encounters: Alien, ISS Vanguard, Love Letter.
- **Cards as clock**: Magic (deck-out, CR 104.3c), Hearthstone (fatigue), Glory to Rome, Bohnanza,
  Gloomhaven/Frosthaven (exhaustion), Aeon's End, 5-Minute Dungeon, Sleeping Gods, Legendary
  Marvel/DC, Etherfields, Mage Knight.
- **Cards as damage**: Undaunted: Normandy, Mage Knight (Wounds enter the deck), Aeon's End (hand
  destruction), Thunderstone (Disease), Dominion (Curse), Legendary Encounters (Strike).
- **Cards as counters/track**: Arkham Horror LCG (card commitment), Dominion, Thunderstone, No
  Thanks!, For Sale, plus the goods/vault mechanics in San Juan, Race for the Galaxy, Glory to Rome.

### Most mechanically distinct examples found

- **Star Wars LCG edge battles** — blind bidding of cards from hand against the opponent's bid. The
  only *opponent-interactive* card-spend in the survey.
- **Undaunted: Normandy** — casualties follow a **fixed removal priority** (hand → discard → deck →
  counter). **Neither player chooses** the card that dies. A third answer to "who chooses" beyond
  player-picks and opponent-picks.
- **Coup** — a two-card life total where each loss is **flipped face up**, so losing health converts
  private information into public information.
- **Bohnanza** — hand is a **locked FIFO queue**; cards must be played in draw order, so the currency
  cannot be freely selected.
- **5-Minute Dungeon** — the deck is **never reshuffled**.

### Recurring failure modes across multiple games

1. **Recursion and engine loops draw bans.** Necropotence restricted in 2000 and again in a 2026
   WotC announcement (the latter primary-verified); Lorcana's Fortisphere banned April 2025 for "a
   draw-engine meta… creating a predictable and never-ending loop." This is the **same failure mode
   ticket 01 found in Decipher**, now attested across three more games.
2. **Thinning inverts designer intent.** Undaunted players **deliberately bait casualties** as free
   deck-thinning — a published strategy guide recommends it. Losing units makes the deck better.
3. **Hidden-pile bookkeeping produces formal tournament errata.** Ravensburger publishes an official
   **"Inkwell Error"** remediation procedure for wrong card counts in Lorcana's permanently-hidden
   resource pile — a publisher formally conceding that an unverifiable pile miscounts at real tables.
4. **Endgame full-deck counting is tedious** (Dominion, Thunderstone).
5. **Instant deck-out "felt hollow"** — Hearthstone's fatigue exists because designers deliberately
   softened an instant-loss deck-out into gradual escalating damage.

### Corrections to this ticket's own seed list

The agent-proposed seeds contained three errors, caught and corrected against primary sources:

1. **Flesh and Blood has no deck-out loss condition** (verified against the Comprehensive Rules).
2. **Thunderstone has no "Weakness" card type** — the analogue is **Disease**, and unlike Dominion's
   Curse it is **curable**.
3. **Legendary's deck exhaustion is a draw, not a loss** `[medium confidence]`.

Also: Fort is Leder Games, not Eagle-Gryphon; and Netrunner's "cards installed face-down as credits"
premise does not hold.

### What could not be verified

BoardGameGeek hard-blocked automated fetching for the entire window, so **every BGG citation is
snippet-level**. Several official rulebook PDFs would not parse (San Juan, Race for the Galaxy,
Bohnanza, Legendary, Love Letter). **No designer rationale was found** for Undaunted's casualty
mechanic or Mage Knight's Wounds specifically, despite targeted searching. ISS Vanguard's entry rests
on a fan blog and is the weakest load-bearing claim in the survey. Curious Cargo was never examined
and should be treated as unexamined rather than discarded. §7 of the research file lists 13
specifically-flagged claims and 6 thin sections.
