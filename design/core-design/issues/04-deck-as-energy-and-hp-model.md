# 04 — Design the deck-as-energy-and-HP model

Type: grilling
Status: resolved
Blocked by: — (01 resolved)
Map: [core design map](../map.md)

## Question

How do "cards as energy" and "cards as HP" work in a physical deckbuilding roguelite?

This is the mechanical heart of the game and the reason the designer is excited about it. It is
held as a **strong hypothesis, not a fixed pillar**: it earns its place by working. If it collapses
under this ticket, record the fallback rather than forcing it.

**Scope:** the concepts carried over are *cards-as-energy* and *cards-as-HP*. Ticket 01 is
background on how one game handled a card-as-resource economy — reference material for this
question only.

Decide:

0. **What "energy" even means.** Ticket 03 deliberately refused to rule on whether energy is shared
   between the characters or held per-character, on the grounds that the word has no settled
   meaning yet. Define the term first; then rule on shared-versus-per-character. Both halves belong
   to this ticket and neither may be assumed.
1. **The zones.** What card zones exist, and what each one *means* to the player.
2. **One pool or two.** Is a single pool of cards simultaneously the energy supply and the health
   total, or are they distinct-but-coupled? A single pool is the pure form of the idea and the
   source of its tension; two pools are easier to tune and easier to explain.
3. **Spending.** What does using energy physically do to cards — move them, flip them, discard
   them? Where do spent cards go, and do they come back?
4. **Damage.** What does taking damage physically do to cards? Which zone is hit, who chooses
   which cards are lost, and is that choice interesting or just painful?
   - **Do not foreclose ticket 15.** A live hypothesis says the player should choose which cards
     they lose, turning damage into a *cull* that sharpens the deck as life shortens — a rubber
     band and a death spiral in one mechanism. Ticket 15 owns exploring it; this ticket must simply
     avoid ruling it out by making damage random or game-chosen without deciding to. If this ticket
     has a strong reason to take the choice away from the player, say so explicitly and ticket 15
     will resolve against the hypothesis rather than being silently orphaned.
5. **The loss condition.** Exactly what state ends a run. If it's "your deck runs out", say what
   running out means given the recycling rules in (3).
6. **The deckbuilder conflict.** A deckbuilder's defining act is *adding cards*. If the deck is
   also HP, then acquiring cards heals you and thinning your deck makes you fragile — which
   inverts the normal deckbuilding instinct to thin. Rule on whether that inversion is the design
   or a problem to engineer around. This is the single most important sub-question here.
   - **Prior art (ticket 01):** in a system where the deck *was* the life total, deck-thinning was
     never a viable strategy — the rules made it self-harmful, with no rule written to enforce that.
     The inversion held up on its own. That is encouraging for taking the pure form of the idea, and
     it means the interesting design question is not "how do I stop players thinning" but "what
     makes *adding* a card ever feel costly."
8. **Recursion is the failure mode — design the guard rail now, not later.** Ticket 01 found that
   this economy broke in four publicly-named ways and every one was a recursion: an infinite-turn
   engine, a loop that continuously retrieved lost resource, a first-turn resource choke, and a
   hard lock. The only two cards ever restricted in that game were both resource-economy cards.
   State, as part of this ticket's answer, **the rule that prevents a card from putting resource
   back into the pool without a hard cap.** In a game where cards are simultaneously health and
   energy, any card that recycles cards is a card that heals and refuels at once. Deciding this
   here is far cheaper than erratic-ing it later — and unlike a CCG, this game gets no errata.
7. **Bookkeeping.** How much physical shuffling, counting, and pile-management this asks a human to
   do per turn. A model that is elegant on paper and miserable at a table has failed.

## Inputs

- Ticket 01's findings on how Decipher actually did it. Reference, not answer — that was a
  two-player duelling CCG, not a solo/co-op roguelite.
- **Ticket 02's strongest finding:** the best-attested constraint in all the previous documents is
  *low complexity — no extra physical components, no extra systems; resources are printed on cards
  or are the cards themselves.* It is the only constraint stated imperatively, designated as a
  standing filter for future mechanics, and quoted back independently by both other documents. It
  points at the same place this ticket is already headed, which is either strong corroboration or
  a reason to check that the idea is being adopted on its merits. Rule on it explicitly.
- **Ticket 02's warning:** the previous attempts recorded a cost model as "locked" that was never
  tested, that its own document conceded collides with that components constraint at ~42 cards, and
  that recommended re-running the comparison *before committing* — after committing. Do not inherit
  it. Every number in those documents traces to a `prototype/NOTES.md` that does not exist in this
  repo, so no prior figure may be treated as measured. Ticket 10 exists to generate real ones.

## Notes for the session

- Sketch at least two genuinely different models before choosing, so the choice is a choice.
- If the answer implies a fallback branch (what we do if playtesting kills this), record it — the
  map should not dead-end on one mechanic.

## Answer

Resolved 2026-08-14. The hypothesis **survives in its pure form**: one pool of cards is
simultaneously the energy supply and the health total. No fallback branch was needed.

Provenance is tagged per line. Where the agent recommended something and the human ruled
differently, the agent's position is recorded too, tagged `[proposed by agent → you declined]`.

### The model in one paragraph

Each character has a deck of cards. **That deck is their stamina** — how long they can keep going.
At the start of your turn you decide how many cards to **convert** from deck into hand; that is the
core decision of the game, because every card converted is stamina spent whether you use it or not.
To play a card you **exhaust cards from your hand** equal to its cost. At the end of your turn your
whole hand exhausts. Enemies and hazards **exhaust cards from your deck**. Exhausted cards are gone
for the rest of the floor and return only when the floor is cleared. When you begin a turn and
cannot convert, you are **exhausted** — down, not dead.

### 0. What "energy" means — and the shared/per-character ruling ticket 03 handed here

`[you]` **Energy is denominated in cards. There is no energy number anywhere.** The word "energy" is
retired in favour of **stamina**, which is the same resource seen from the health side. Cost is paid
in cards; health is measured in cards; they are the same substance.

`[you]` **Stamina is per-character.** Each of Red and Gray has their own deck, their own hand, their
own exhaust pile. This was the question ticket 03 deliberately refused to rule on, and it is now
closed.

`[you]` **Solo runs the identical rules.** Physically the solo player manages two draw piles, one
pair of hands, and two exhaust piles — but the two hands are *mechanically separate*. Red's cards
pay only for Red's cards. Solo is co-op with one brain, exactly as ticket 03 ruled; fuel is never
fungible across characters, so "a character can be in trouble alone" stays true in both modes.

### 1. The zones

`[you]` **Three zones per character. There is no discard pile.**

| Zone | What it is | What it means to the player |
|---|---|---|
| **Deck** | Face-down draw pile | Your stamina. Its height *is* your health bar — nothing is counted or tracked. |
| **Hand** | Cards converted this turn | Your options *and* your fuel, simultaneously. Empties at end of turn. |
| **Exhaust pile** | **Face up** | What the floor has taken out of you. Read it to know what is no longer waiting in your deck. |

`[you]` **The exhaust pile is face up.** You watch what you lose as it goes, and you gain real
information about your remaining deck. This is also consistent with ticket 03's fully-open
information.

`[you]` **"Exhaust" is the term**, taking Slay the Spire's meaning so no player arrives confused —
and because it lets stamina carry a literal fiction. A character at zero is *exhausted*, not dead,
which lines ticket 03's *down, not dead* up with the mechanic rather than sitting beside it.

`[you]` **Exhausting is not a combat verb.** Sprinting, searching a room, forcing a door, tripping,
banging your head on a pipe — anything the floor asks of you can cost stamina. The floor itself is a
threat, not merely the monsters on it. This is also what stops "flee and scavenge" from dominating
"fight": running away is exhausting too.

### 2. One pool or two — **one**

`[you]` The pure form. There is no second pile, no membrane, no reserve. Cards are health and fuel at
once, and the tension the pitch was built on is present in the core loop with no machinery
supporting it.

### 3. Spending

`[you]` **Playing an X-cost card = "exhaust X cards from your hand"** (the played card also goes to
exhaust). Cards do **not** come back during a floor. The whole hand exhausts at end of turn.

`[you]` **Two phrases, and no keywords yet:**

- **"Exhaust X cards from your hand"** — costs the player *chose* to pay.
- **"Exhaust X cards from your deck"** — losses the player *did not* choose.

`[you]` **The principle behind which phrase to use:** chosen costs come off the hand; unchosen
punishment comes off the deck. Anything that reads as a bonk on the head, a trap, a fall, an
unexpected consequence, comes off the deck. The phrasing itself tells the player whether they had
agency, which is worth more than a keyword.

`[proposed by agent → you approved]` **A consequence worth naming: a hand is a mixture of tools and
fuel.** Because playing a card burns *other* cards in hand, drawing more does not linearly buy more
plays. Draw eight and you will still extract only a couple of actions — from a bigger hole in your
stamina. Nothing needs to regulate over-drawing; the cost structure already does.

### 4. Damage

`[you]` **Enemy damage exhausts X cards from the top of the deck. No choice, face up.** Instant,
requires no deliberation at the table, and the face-up pile turns each hit into information rather
than a mystery. **This resolves ticket 15 against its hypothesis, deliberately** — see below.

`[proposed by agent → not adopted, logged for later]` "Bracing" — taking damage off the deck by
default but allowing a card exhausted from hand to absorb a point. Not ruled on; recorded as a
candidate for ticket 07 or 11 if blocking needs to exist as an act of stamina rather than a stat.

### 5. The loss condition

`[you]` **You are exhausted when you begin a turn and cannot convert.** An empty deck is not
instantly fatal — you get one final turn with the hand you are holding and no possibility of another.

`[you]` **"Last stand" is live design space**, not settled here. The instinct: card costs might be
eliminated entirely once your deck is empty, letting you unleash a final barrage for a
skin-of-your-teeth win. Noted as unusually safe from exploitation — it is unreachable except by
nearly dying and ends immediately after. **Graduated to its own ticket (16)**, since "what happens at
zero" is now a shared question with ticket 14.

`[proposed by agent → you declined]` A mandatory minimum conversion of one card per turn, to stop a
character stalling at zero draw. Declined as an unnecessary rule, and correctly: because the hand
empties at end of turn, a character who converts nothing has no cards and cannot act at all —
stalling is spectating, not surviving. **One narrow hole remains and is logged rather than ruled on:**
in co-op, one character could idle at one card of deck indefinitely while the other solves the floor,
since ticket 03 ends the run only when both are down. To be watched at the table, not pre-empted.

### 6. The deckbuilder conflict — **the inversion is the design**

`[you]` Leaned into fully. No rule is added to let players thin safely.

The structure produces the trade on its own, with no keyword and no enforcement. Because the deck
never cycles during a floor, **a card you pick up is +1 floor-time and −1 consistency**: it makes you
able to stay longer, and it makes you worse, because you get exactly one pass through your deck and
every mediocre card is a card that appears instead of the one you needed.

This also answers the sub-question the ticket flagged as hardest — *what makes adding a card ever
feel costly* — without inventing anything. It falls out of the no-recycling rule. Ticket 09 inherits
it as a settled constraint rather than an open problem.

Prior art agrees: ticket 01 found this exact inversion surviving in the wild with no rule propping it
up. Thinning was simply self-harm and players worked it out.

### 7. Bookkeeping

The model was chosen partly on this axis and it comes out well:

- **Health is one visible stack.** Deck height *is* stamina. Nothing is ever counted or tracked.
- **No shuffling during a floor, ever.** There is no discard pile to reshuffle.
- **Three piles per character**, one of them face up.
- **Zero components.** No tokens, no dials, no track. Stamina, energy, damage, and buff duration are
  all expressed by where cards are.
- **Per-turn upkeep** is: move N cards deck → hand, move cards hand → exhaust, move damage deck →
  exhaust. No decisions are re-litigated and nothing is looked up.

`[proposed by agent → you approved]` **A clean equation falls out for ticket 10.** Because the hand
empties regardless of use, a turn's stamina cost is *exactly how much you converted* — not how much
you spent. Nothing else leaves the deck except damage. So floor length ≈ deck size ÷ average
conversion per turn, minus damage taken. Ticket 10 gets one tight relationship to simulate instead of
a tangle, and deck size and floor length are the same dial — which is what the human asked for.

### 8. Recursion — **no structural guard rail, by decision**

`[you]` **No rule is written.** Balance of any recovery mechanic is handled per-mechanic later, on
the position that a distilled mechanic design philosophy naturally prevents unintended infinite
scaling.

`[you]` **Healing exists but is exceptional, and recovers cards from the exhaust pile.**

`[you]` **"Do nothing: recover 1 card" is logged as a candidate turn action** — explicitly
*unadopted*, and it must survive playtest. Handed to ticket 07 (it is a turn action) and ticket 10
(the number is numeric).

`[proposed by agent → you declined]` The agent recommended a structural guard rail — specifically
that any card recovering from exhaust removes *itself* from the run permanently, making loops
impossible by construction rather than by balance, backed by fixed small printed numbers. The
argument was ticket 01's finding that this economy broke publicly four times and every break was a
recursion, that the only two cards ever restricted in that game were both resource-economy cards, and
that a printed board game gets no errata. **The human declined with reasoning and this is a
considered position, not an oversight.** Recorded here so that if a recovery card does run away at
playtest, the record shows the trade was seen and taken.

### Inputs the ticket was required to rule on

**Ticket 02's low-complexity constraint** — *no extra physical components, no extra systems;
resources are printed on cards or are the cards themselves.*

`[you]` **Adopted as a strong preference, not a hard rule.** It is right for this game and the model
above satisfies it completely, but making it absolute would outlaw a component before anyone had seen
whether it would make the game simpler — which is the previous attempts' mistake in a new costume.

**Ticket 02's warning about inherited numbers** — honoured. No figure from the previous documents was
used. This ticket produces no numbers at all; every quantity (deck size, conversion rate, hand size,
cost curve, damage values) is handed to ticket 10 to measure.

### Two things this ticket settled that belong to other tickets

Recorded here for provenance; the owning ticket still decides the detail.

- `[you]` **A floor is one continuous encounter.** Not a series of fights with a boss at the end — a
  2D floor plan the characters move around over many turns, entering rooms, finding a monster,
  denting it, fleeing when they are in over their heads, scavenging, doubling back, getting chased.
  The floor ends by ascending — a blocking enemy, a key to find, something. A run is many floors.
  **This is a load-bearing input to ticket 05**, which owns the detail.
- `[you]` **Persistent effects live in your hand.** A card granting an ongoing buff stays in hand via
  Retain and works as long as you keep it — but it occupies hand space you cannot refill for free,
  and it is always available to burn as fuel when you are desperate. Duration is never a rules
  question: it lasts as long as you can afford it. No tokens, no upkeep, no tracking. **Handed to
  ticket 11 (card anatomy)** as a card type to design. The agent's assessment: this is the strongest
  single idea produced in this session.

### Fallback branch

The ticket asked for one in case playtesting kills the model. It is: **reintroduce a discard pile
that recycles when the draw pile empties** (the human's "Model 1"). That converts the deck from a
strict floor clock into a resilience pool, decouples floor length from deck size, and restores
mid-floor cycling — at the cost of the one-pass dilution tension that currently makes adding cards
interesting, and at the cost of mid-floor shuffling. A softer intermediate exists between the two:
recovery of exhausted cards purchased with something else, such as a rest action in a cleared room
that costs floor-time or position.
