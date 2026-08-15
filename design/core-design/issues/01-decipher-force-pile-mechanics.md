# 01 — Establish how Decipher's Force pile actually worked

Type: research
Status: resolved
Blocked by: —
Map: [core design map](../map.md)

## Question

Decipher's *Star Wars CCG* (1995) used the player's own cards as a unified resource — commonly
called Life Force. North vs Up intends to adapt "cards as energy" and "cards as HP" to a
deckbuilding roguelite (ticket 04). Before designing that adaptation, establish what the original
actually did, as **facts**, so we build on the real mechanic rather than a half-memory of it.

Establish:

1. **The zones.** Reserve Deck, Force Pile, Used Pile, Lost Pile, Hand — what each one was and
   what it represented.
2. **Activation.** How many cards moved per turn, what determined that number, and who chose.
3. **Spending.** What it physically cost to deploy a card or take an action, and where the spent
   cards went.
4. **Damage.** How battle damage, attrition, and "Force loss" were resolved — which zone cards
   were taken from, who chose them, and where they went.
5. **The loss condition.** Exactly what state ended the game, and how a player was drained toward
   it.
6. **The cycle.** Whether and how cards returned from Used/Force piles to the Reserve Deck, and
   what happened when a deck ran out mid-turn.
7. **Known problems.** What tempo issues, degenerate strategies, or player complaints the mechanic
   was known to produce — deck-thinning, drain-lock, first-turn advantage, bookkeeping burden.

## Constraints on the answer

- **Facts only.** No recommendations. No application to North vs Up. No design opinions.
- Cite sources. Prefer the actual rulebook / official rules documents over wiki summaries; where
  only community sources exist, say so.
- Where sources disagree or the rules changed across editions, record the disagreement rather than
  picking a side.
- Flat list. Do not organise the findings into a proposal.

## Deliverable

A research file in this repo, linked from this ticket, plus the answer summary below.

## Answer

Full findings: [research/01-decipher-force-pile.md](../research/01-decipher-force-pile.md) — ~130
numbered facts, each cited, organised under the seven headings above.

1. **Zones.** 1 card = 1 Force. **Life Force = Reserve Deck + Force Pile + Used Pile only.** Hand,
   table and Lost Pile are explicitly excluded. Deck is exactly 60; opening hand 8.
2. **Activation.** First phase of your turn: count your side's Force icons on all locations, add 1
   for personal Force (later also +1 per Jedi Master), move that many cards face down and unseen
   from top of Reserve Deck to top of Force Pile. Optional and partial; card-forced activation is
   mandatory and maximal.
3. **Spending.** Costs are paid **only** from the Force Pile, one card at a time, face down, into
   the Used Pile. Deploy costs are printed; battle costs 1; most moves cost 1. Force Pile persists
   across turns and can be spent on the opponent's turn. Drawing to hand also comes out of the
   Force Pile — and removes those cards from Life Force.
4. **Taking a loss.** Whatever triggered it, the mechanism was uniform: **the player losing chooses
   which cards go** — any card from hand, or the top card of any pool. Lost cards leave the pool
   permanently into a discard that never recirculates. (The several distinct combat systems that
   could trigger a loss are recorded in the research file; they are specific to a two-player
   duelling CCG and are not carried over here.)
5. **Loss condition.** "If at any time your opponent's entire Life Force — Reserve Deck, Force Pile
   and Used Pile — is depleted, you win." Checked continuously. Cards in hand do **not** save you.
6. **Cycle.** Used Pile is placed **as a group, unshuffled, under the Reserve Deck at the end of
   every player's turn** — mandatory for both players. Force Pile and Lost Pile do not recirculate.
   An empty Reserve Deck is survivable; destiny draws simply fail (in the opponent's favour).
7. **Known problems.** Weakest section, and unevenly so. Well evidenced, and all of it transferable
   as **bookkeeping and complexity cost**: the rulebook singles out its own resource-loss subsystem
   as "probably the most complicated concept in the game"; the current rulebook runs 186 pp /
   165,253 words, ~47% of which is errata and card-specific exceptions; there are eight tracked
   zones, not five; every unit of resource moves one card at a time as a separate action; and
   because the deck is never reshuffled by the normal cycle, competitive players card-count their
   own piles. The rules themselves flag the core trap: **the same cards are your economy, your
   randomiser and your life total**, so every decision pulls against two others.
8. **Two findings that bear directly on ticket 04, both settled from primary sources.**
   - **Deck-thinning was never a strategy in this system — the rules make it self-harmful.** In a
     game where the deck *is* the life total, removing cards removes life. The instinct a normal
     deckbuilder rewards is inverted here, and it inverted on its own, without a rule to enforce it.
     This is prior art for the central tension in ticket 04, question 6.
   - **The economy broke in four publicly-named ways, and every one was a recursion.** Decipher
     issued errata against an infinite-turn engine, a loop that continuously retrieved lost
     resource, a first-turn resource choke, and a hard lock — plus a set of characters that
     simultaneously boosted resource output *and* accelerated the engine generating it, which took
     a whole new rules section to contain. There was never a banned list; exactly two cards were
     ever restricted, and **both were resource-economy cards**. The failure mode of a card-as-
     resource economy is not imbalance, it is **any card that puts resource back into the pool**.
   **Still thin:** first-turn win-rate data and tempo theory — nothing published was found. Every
   major community archive is hard-blocked and Usenet was never searched.

The rules changed materially across editions; §8 of the research file records each change side by
side rather than picking a version.

**Scope of this ticket's use.** Cards-as-energy and cards-as-HP are the concepts referenced. Read
the research file as background on how one game handled a card-as-resource economy, not as a menu
of features.

**On the record vs. the archive.** The research file was deliberately cut back to the mechanics —
zones, activation, spending, loss, cycle. The known-problems investigation behind point 8 above was
removed along with it. **Point 8 is the record; do not go looking for its evidence in the research
file, and do not treat its absence as doubt.** It was sourced from Decipher's own errata
newsflashes and rulebook text at the time it was written. If it ever needs re-verifying, that is a
fresh research ticket, not a hunt through this one.
