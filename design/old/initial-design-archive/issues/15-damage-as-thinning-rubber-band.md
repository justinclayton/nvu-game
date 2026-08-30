# 15 — Explore damage-as-thinning as a built-in rubber band

Type: grilling
Status: resolved
Blocked by: 04
Map: [core design map](../map.md)

## Question

**The idea — `[you]`, recorded 2026-08-14, before ticket 04 is worked so it cannot be foreclosed.**

Thinning means two opposite things in the two genres this game sits between:

- **In the CCG**, where the deck *was* the life total, thinning was self-harm. It was never a
  strategy, and no rule was needed to prevent it (ticket 01, point 8). Losing cards was pure loss —
  which is why the fiction called it a *drain*.
- **In a deckbuilder**, thinning is one of the most powerful strategies there is. A smaller deck
  cycles faster, draws more consistently, and — depending on what is left — is precisely what
  enables the overpowered chains that players build decks to find. Thinning is the *fun*.

North vs Up puts both of these in the same deck at the same time. **This ticket explores turning
that collision into the engine of the game rather than a problem to be resolved.**

The hypothesis: **if a damaged player chooses which cards they lose, damage becomes a cull.** You
shed your low-quality cards and keep the high-quality ones. Your deck gets sharper exactly as your
life gets shorter. That is a rubber band and a death spiral running in opposite directions through
the same mechanism — the player is rewarded with power for being in danger, which is a very direct
expression of the frantic, in-over-your-head pillar (ticket 06).

Note the prior art fits: in the CCG, **the player taking the loss chose which cards went**
(ticket 01, point 4). The mechanism this hypothesis needs is the one that game already used — it
simply had no deckbuilding layer for the cull to pay off into.

## Decide

1. **Does the player choose which cards are lost to damage?** The hypothesis dies without this. If
   damage is random or chosen by the game, there is no cull and no rubber band. Weigh it honestly:
   free choice may make damage feel toothless, and it adds a decision to every hit — a real cost
   against both the pillar and the low-complexity constraint.
2. **How constrained is the choice?** Free pick from the whole deck is maximally strong and
   maximally slow. Candidates: choose from a revealed few, choose only from hand, choose from the
   top N, pay something for the privilege of choosing.
3. **Is the rubber band too strong?** If culling is pure upside, players may *want* to take damage,
   which inverts the danger the game is built on. Find what makes damage still hurt: perhaps the
   cull costs tempo, perhaps low-quality cards are load-bearing, perhaps the cards you most want
   to keep are also the most expensive to hold.
4. **Does it collapse the difficulty curve?** A rubber band that reliably rescues losing players
   makes runs unlosable in the middle and only losable at the edges. Decide whether this is meant
   to be a *soft* rubber band (slows the spiral) or a *hard* one (reverses it).
5. **Where does the acquisition model push back?** Ticket 09 decides how cards enter the deck. If
   damage removes bad cards and acquisition adds them, the two form a loop — check its sign. A deck
   that gets strictly better under pressure is the runaway ticket 04's guard rail exists to stop.
6. **What it does to the low-quality cards.** This design only works if some cards are genuinely
   worse than others *and* the player can tell. That has consequences for card anatomy (ticket 11)
   and for whether starting decks carry deliberate chaff.
7. **Whether the fiction supports it.** "Drain" was the CCG's metaphor because loss was pure loss.
   If loss is a cull here, the tower is burning away what is weak in you. Worth naming, though the
   map keeps lore out of scope — the metaphor should not fight the mechanic.

## Inputs

**Ticket 16's survey found this hypothesis already running in a published game — and question 3 is
the one it answers.** `[research — adopted by nothing yet]`

- **Undaunted: Normandy is the live case of "the rubber band is too strong."** Damage permanently
  removes unit cards from your deck, and a published BGG deck-building guide **recommends
  deliberately baiting casualties as free deck-thinning**: "Every casualty means you get to draw your
  non-scout cards more often." Experienced players attack-bait their own weak units on purpose. This
  is question 3's failure mode, observed in the wild, in a well-regarded game — evidence that the
  mechanism *works* and evidence that it inverts danger, at the same time. Weigh it as both.
- **A third answer to question 1 that this ticket does not currently consider.** Undaunted resolves
  *which* card dies by a **fixed rules priority** — hand, then discard, then deck, then the unit
  itself — so **neither player chooses**, while the attacker still chooses the *target*. The choice
  space here is not the binary "player picks vs. random"; there is a middle where the attacker
  aims and the rules resolve. Question 2's list of constraints should include it.
- **Coup, for question 3's "what makes damage still hurt."** Losing an influence card flips it **face
  up**, so each point of damage converts private information into public information. A cost that is
  not tempo and not card quality.

Full survey: [research/16-cards-as-resource-survey.md](../research/16-cards-as-resource-survey.md),
§4.1 (Undaunted) and §2.1 (Coup). **Facts only — nothing above is adopted**, and the Undaunted
sourcing is community-level `[medium]`, not a designer statement.

## Handoff to the simulator

Questions 3 and 4 are **numeric** and cannot be settled by argument. Ticket 10's simulator must be
built to test this specifically: run floors with and without player-chosen damage and compare win
rate, deck quality over time, and whether players are incentivised to take hits.

## Notes for the session

- This is an *exploration*, not a commitment. The honest outcome may be that the rubber band is too
  strong and damage has to hurt plainly. Record that outcome as a real answer if it happens.

## Answer

Resolved 2026-08-14 **by ticket 04, against the hypothesis** — deliberately, as ticket 04 was
required to do rather than silently orphaning this.

`[you]` **The player does not choose which cards damage takes.** Enemy damage exhausts X cards from
the **top of the deck**, no choice. There is no cull, and therefore no rubber band from this
mechanism.

### Why

- **Table cost against the pillar.** The floor is a fast, reactive chase, and hits are frequent. Any
  version of the cull — free pick, choose-from-top-N, pay-to-choose — stops the table for a small
  optimisation decision on *every hit*. That is the "elegant on paper, miserable at a table" failure
  ticket 04 was required to guard against, and it is worse in solo where one person makes both
  characters' decisions.
- **The payoff largely evaporated under ticket 04's model.** This ticket was written assuming a
  cycling deck, where culling a weak card improves every future draw. Ticket 04 settled that **the
  deck does not recycle during a floor** — you get one pass. Culling a bad card therefore barely
  improves your odds; it mostly just shortens the floor. The rubber band this hypothesis was built
  on is much weaker than it looked when written.
- **The information it was reaching for arrived by another route.** `[you]` The exhaust pile is
  **face up**. You feel the loss as it happens and you learn what is no longer waiting in your deck.
  That gives damage weight and gives the player a read on their remaining resources — without a
  decision per hit.

### What survives

`[proposed by agent → not adopted, logged]` **"Bracing."** Damage comes off the deck by default, but
a card exhausted from hand may absorb a point. This keeps a choice at the only moment it is
interesting — whether to *take* the hit, not which cards it eats — for one card of cost and no
per-hit deliberation. Not ruled on. Candidate for ticket 07 or ticket 11 if blocking should be an act
of stamina rather than a printed stat.

### Downstream

- **Ticket 10** no longer needs its most important job. Sub-question 6 ("run floors with and without
  player-chosen damage") is void — there is no player-chosen damage to compare against.
- **Ticket 09** keeps sub-question 5, but only its **voluntary** thinning half. Involuntary thinning
  is settled: it is random, off the top, and it is pure loss.
- The genuine tension this ticket was hunting is now carried elsewhere and more cheaply: under ticket
  04, adding a card is **+1 floor-time and −1 consistency** on a deck you see once. That is the
  bidirectional pressure, and it lives in acquisition rather than in damage.

### Corroboration that arrived after the fact

Ticket 16's survey ran concurrently and was not available to the ticket 04 session. Read afterwards,
it **independently supports this resolution** rather than challenging it.

- **Undaunted: Normandy is this hypothesis running in a published game, and it is too strong.**
  Damage permanently removes unit cards, and a published guide recommends **deliberately baiting
  casualties as free deck-thinning**. Experienced players attack-bait their own weak units on purpose.
  That is sub-question 3's failure mode — *players want to take damage* — observed in the wild, in a
  well-regarded game. It is the strongest available evidence that a player-steered cull inverts the
  danger the design is built on.
- **A third answer to sub-question 1 that this ticket never considered**, and worth recording even
  though the ticket is closed: Undaunted resolves *which* card dies by **fixed rules priority**, so
  neither player chooses, while the attacker still chooses the target. The choice space was never the
  binary "player picks vs. random." North vs Up landed on a fourth option — off the top, but **face
  up** — which keeps the loss legible without a decision.
- **Coup** answers "what makes damage still hurt" differently again: a lost influence flips **face
  up**, converting private information into public. North vs Up's face-up exhaust pile is the same
  instinct applied to a solo/co-op game, where the audience for that information is you.

Full survey: [research/16-cards-as-resource-survey.md](../research/16-cards-as-resource-survey.md),
§4.1 (Undaunted) and §2.1 (Coup). Sourcing on the Undaunted claim is community-level, not a designer
statement.
