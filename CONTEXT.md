# North vs Up — glossary

The project's domain terms and nothing else. A term enters this file only when a ticket has actually
settled it; if it is still being argued about, it lives in the ticket, not here.

Every entry is tagged with the ticket that settled it.

---

**Run** — a whole play session, from the start of the first floor until both characters are exhausted
or the tower is beaten. A run is **ten floors**, and should take 60–75 minutes. *(tickets 04, 05)*

**Floor** — one level of the tower, and **one continuous encounter**: a **floor deck** the characters
play against over many turns. Beating the deck is what grants passage; the in-fiction reason varies
floor to floor. A floor ends by **ascending**, and should play in **5–7 minutes**. *(tickets 04, 05,
18)*

**Floor deck** — the deck of **rooms** the players face on a floor. Shuffled at the start of the
encounter. It has a draw pile, a **Fled** pile, and a **Cleared** pile, and it belongs to the floor
rather than to either character. It holds exactly one **Enemy room**; clearing that room ends the
encounter, not exhausting the whole deck — Hazard and Stuff rooms are resources along the way, never
mandatory to clear. *(tickets 18, 21, 22)*

**Room** — one card of the floor deck, and the whole of what the players face on a given turn.
Flipped face up into the **active room zone** at the **start of the turn**, before anything is spent,
so the players always know what they are up against before committing. Clear it and it leaves the
floor deck for good; fail and the players take its printed punishment and it is **Fled**. A room has
no behaviour beyond being flipped — all of its pressure is its **challenge** and its punishment.
*(tickets 18, 21)*

**Challenge** — the **named threshold** a room prints, such as `Power 3` or `Scramble 2`. The players
Clear the room the instant their **stat pool** meets it. Excess is wasted. There is no partial
progress: a room is Cleared or it is not, and it does not remember being attacked. A **hazard room**
prints two thresholds rather than one; which is reached locks in only once play stops, not the
instant either is first met. *(tickets 21, 22)*

**Enemy room** — a room holding an enemy, and the word printed on its type line. Its challenge is
**`Power X`**, one stat standing in for combined attack and health. **Exactly one per floor deck;
clearing it is the floor's win condition.** Always carries a **Flee cost** — failing or declining is
fleeing the fight, with a few scrapes to show. *(tickets 21, 22, 11)*

**Hazard room** — a room with no enemy but something to get through. Its challenge is
**`Scramble X`** — running, not falling, not braining yourself on a pipe. **Prints a second, higher
threshold**: the lower clears the room and moves the players on; the higher clears it and pays a
permanent **card reward**. Which is reached locks in only once the players declare the play phase
done. *(tickets 21, 22)*

**Stuff room** — a room holding a piece of **Stuff**, and the word printed on its type line. **Prints
a threshold and no Flee line** — the **lowest threshold in the deck**, below what Hazard and Enemy
rooms ask. Meet it and the Stuff goes to a chosen character's hand with **Hold**; fail it and you
leave empty-handed. Either way the room is Cleared and it can never go to Fled. There is no
punishment: the only loss is the Stuff you did not take. Only **Good Stuff** is found here.
*(tickets 21, 22, 09, 11)*

**Stuff** — a card a floor hands you: a tool, a piece of junk, a faceful of slime. It goes to hand
with **Hold**, it is **playable**, and it is **ordinary fuel** — it can be Exhausted from hand to pay
another card's cost like anything else. **A deck is not Stuff's entry route** — no reward or purchase
ever puts Stuff in a deck — but the rule is a default, not an absolute: a **last stand** shuffles
played Stuff back with everything else. Stuff Exhausts normally, and **ascending pulls all Stuff out
of the exhaust pile** before restoring it, so no Stuff survives a floor. It is a mass noun: *"I have
three Stuff."* *(tickets 21, 09, 07)*

**Good Stuff** / **Bad Stuff** — where a piece of Stuff came from, and loosely how welcome it is.
**Good Stuff** lives in the floor deck and is what a Stuff room hands you *if you meet its
threshold* — and since Stuff supplies **the bulk of the raw stats**, it is the game's supply line
rather than a bonus, so paying the threshold is almost always correct. **Bad Stuff** lives in a pool
**outside** the floor deck and reaches you only as a room's printed punishment; it contributes **no
stats** toward a challenge, so it clutters your hand until you pay to play it. Both are **printed on
the card's type line** — a player must see at a glance which cards in hand are dead weight. Good
Stuff carries **rarity**; Bad Stuff does not. *(tickets 09, 11)*

**Power** / **Scramble** — the two stat keywords at level 1. Both rooms and player cards carry them:
a room prints how much is needed, a played card contributes what it has. More are expected as the
design grows. **The bulk of the raw stats come from Stuff**, not from a character's own deck: a
permanent deck is mostly *modifiers*, and the base they act on is scavenged fresh each floor.
*(tickets 21, 11)*

**Type line** — the one line every card prints saying what it is. On a player card it reads `Red`,
`Gray`, `Good Stuff`, or `Bad Stuff`; on a room card, `Enemy`, `Hazard`, or `Stuff`. It doubles as the
character marking, so there is no separate ownership symbol — and there is **no neutral card**, since
every card a character owns comes from their own pool and the only cards belonging to neither are
Stuff. *(ticket 11)*

**Rarity** — a card's **value** tier, shown as a border colour: **`Fine`**, **`Cool`**, **`Woah`**.
Starter cards are all `Fine`. It is measured on a card's **ceiling** — the most it can do for you when
things line up — not on its efficiency, because a five-card hand cap means one big number is worth
more than two good ones. **Complexity rides along rather than setting the tier**: the most complex
cards are still always the highest rarity, because **a complex card has to pay for its complexity in
what it does when the synergy comes together**. A simple card can be `Woah` on power alone. Rarity is
**purely printed** and touches no rules, and the reward **pool is flat** — every tier is equally likely
at every floor, so rarity never becomes a second escalation dial. Good Stuff carries rarity; Bad Stuff
does not. *(tickets 11, 12)*

> **Reverses ticket 11's "a complexity signal, never a quality one"** `[you, 2026-08-25]`. The
> protection ticket 11 wanted survives, because the implication that matters runs one way: every
> complex card is high rarity, so a player who declines `Woah` still avoids every nested conditional
> in the game. What they give up is also declining some simple bombs.

**Flee cost** — the punishment a room prints, and the only punishment it has. Normally *"1 character
Exhausts X from deck"*, with the team choosing who absorbs the whole amount. A room's punishment and
its Flee cost were once described as two things; they are one field, printed once, under the word
that already means *the room beat us and comes back around.* Stuff rooms have none — failing one
costs you the Stuff, not stamina, and the room is Cleared regardless. *(tickets 21, 22, 11)*

**Stat pool** — the total of the stats on every card in the **play zone**, shared across both
characters. It is not a zone and has no tracker — it is simply what the face-up cards on the table
add up to, and it evaporates at cleanup. *(ticket 21)*

**Play zone** — where played cards sit face up during a turn, contributing their stats. **Split into
a side per character**, both feeding the one shared stat pool — the split is bookkeeping only, so that
cleanup can return each card to the right exhaust pile without sorting. Everything in it is exhausted
at cleanup, so nothing persists here between turns. *(tickets 21, 07)*

**Cleared** — a room defeated and removed from the floor deck **permanently**; it is never
reshuffled. Clearing the floor deck's one **Enemy room** ends the encounter; a Hazard or Stuff room
being Cleared does not. Applies only to rooms — a character's cards are **exhausted**, never
Cleared. The Cleared pile is a **heap, not a zone**: face up, unordered, never counted, and no rule
ever asks it a question. *(tickets 18, 21, 22, 07)*

**Fled** — the floor deck's discard pile, and the verb for going there. A room the players failed, or
declined outright, is Fled. The Fled pile is shuffled back into the floor deck when its draw pile runs
out, so a room you could not handle comes back around — which is how the game says *you were
outmatched and had to scramble.* *(tickets 18, 21)*

**Ascend** — to leave a floor for the next one. Ascending restores every card in a character's
exhaust pile to their deck: a floor cleared is a full heal. It also offers a **card reward**.
*(tickets 04, 05)*

**Card reward** — a card added permanently to a character's deck for the rest of the run. It arrives
two ways. **On ascending**, each character chooses one of **three** cards drawn from their own
**reward pool**, and it goes into their deck before the shuffle. **On meeting a hazard room's higher
threshold**, the top card of a reward pool is turned face up and the only choice is take it or skip
it; taken, it goes **on top of the deck**, since nothing shuffles during a floor. **Declining is
always allowed** and is a real play: under the deck-as-stamina model a card refused is consistency
preserved. A declined card goes to the bottom of its pool. *(tickets 05, 22, 09)*

**Reward pool** — the cards a character's permanent rewards are drawn from. There is **one per
character**, so Red is offered Red's cards and Gray is offered Gray's — which is what lets each of
them build toward something. Flat: no rarity tiers and no escalation by floor. *(ticket 09)*

**Character** — Red or Gray. Both are always in play. In co-op one player runs each; solo, one player
runs both, under identical rules. *(tickets 03, 04)*

**Deck** — a character's face-down draw pile. **The deck is the character's stamina** — its height is
the health bar, and nothing else tracks health. Each character has their own. *(ticket 04)*

**Stamina** — a character's health, measured in cards remaining outside the exhaust pile. **One card
is exactly one stamina, always**, and no card ever prints a stamina value — which is what keeps the
deckbuilding inversion legible without arithmetic. It is the
same substance as the energy used to pay for cards; there is no separate resource and no number
anywhere. *(ticket 04)*

**Drain** — the one-way loss of stamina that runs for as long as an encounter lasts; **ascending** is
what reverses it. It is charged **against turns, not against actions**: nothing in a turn costs
stamina except drawing and paying card costs, but each standing character **must draw at least one**,
so a turn costs the team two cards whether or not they engage the room. *(tickets 04, 06, 07)*

**Hand** — the cards a character drew this turn. Simultaneously their available **tools** and
the **fuel** those tools burn. The whole hand exhausts at end of turn unless a card has **Hold**.
*(ticket 04)*

**Draw** — the act, in the draw phase, of moving cards from deck to hand, one at a time, until the
player declares they are done. Each character must draw **at least one** card. Drawing spends stamina
whether or not the cards get used, which makes it the central decision of the game — and since the
whole hand is exhausted at cleanup anyway, it is where nearly all of a turn's tension lives. A player
cannot draw again once the play phase has begun. *(tickets 04, 21)*

**Exhaust** — to move a character's card to their exhaust pile. Takes Slay the Spire's meaning: the
card is gone for the rest of the floor. Used both for costs the player chose and for damage they
didn't. A character's cards are exhausted; a **room** is **Cleared**. *(ticket 04)*

**Exhaust pile** — a character's **face-up** pile of exhausted cards. Face up so the loss is felt as
it happens and so the player can read what is no longer waiting in their deck. Returns to the deck on
ascending, **less any Stuff in it, which is pulled out first**. **A character has no discard pile** —
only the floor deck has one, its **Fled** pile. *(tickets 04, 21, 07)*

**Exhaust X cards from your hand** — how a chosen cost is written. A card's **cost** and its **stats**
are separate, unrelated numbers: to play a card you Exhaust cards from hand equal to its cost, then
put the card itself into the play zone, where it is exhausted at cleanup with everything else.
*(tickets 04, 21)*

**Exhaust X cards from your deck** — how an unchosen loss is written: a room's punishment, traps,
falls, bonks on the head. Comes off the top, no choice. The phrasing itself tells the player whether
they had agency. A room's punishment normally reads *"1 character Exhausts X from deck"* and the team
chooses who absorbs the whole amount; a minority of rooms read *"both characters exhaust…"* for
things that should feel wide-area. *(tickets 04, 21)*

**Hold** — a keyword, taking Slay the Spire's meaning: this card is not exhausted at end of turn. Used
for highly situational cards, for anything that should feel equipped, and for persistent effects,
which work for as long as they are held in hand. **Printed on the card face**, so it is not exclusive
to Stuff. A Hold card survives cleanup only while it stays in hand — playing it moves it to the play
zone, where it is exhausted like anything else, so using a piece of Stuff spends it. *(tickets 04, 21; card
design owned by ticket 11)*

**Down** (of a character) — down, not dead. A character is **Down** when something would Exhaust a
card from their **empty deck**, or when the team **Flees** the room while that character is in **last
stand**. Reaching an empty deck is *not* itself Down — it is last stand, which is the state you have
to fight out of. **Being unable to draw is not Down either**, whether from a full hand or an empty
deck; the minimum draw simply goes unmet. A Down character is **skipped in the draw and play phases
entirely**, **takes no rewards**, and **cannot have cards put into their hand** — Stuff cannot be
parked on them. With no one else to absorb them **every room Flee cost falls on the survivor**.
**Ascending heals them to full** like anyone else. The run ends only when both characters are Down.
*(tickets 03, 04, 07, 12; mid-floor revival owned by ticket 14)*

> Supersedes ticket 04's *"exhausted when they begin a turn and cannot draw."* **Exhaust** is now
> exclusively what happens to **cards**; a character is **Down**.

**Last stand** — the state a character is in **for as long as their deck is empty**: every card in
their hand can be played **at no cost**. Their partner pays costs normally. If the **room** is
Cleared while they are in it they **survive**, and that turn ends in an **alternate cleanup** — the
cards that would have been exhausted from **hand and play zone** are shuffled back into their deck
instead, **less 2, the cost of exiting**. The exhaust pile is not involved; `Hold` cards in hand stay
in hand rather than joining the shuffle-back. **Fleeing a room while in last stand puts that character
Down**, so it cannot be coasted in — you clear rooms or you are finished. *(tickets 04, 17, 07, 12)*

**Turn** — the unit of play, and it belongs to the **floor**, not to a character: one flip, one draw
phase, one play phase, one cleanup, with **both characters acting throughout, simultaneously, in any
order**. There is no turn order and no lead character, and *round* is not a separate thing — it is
the same word. *(tickets 21, 07)*

**Neutral card** — a card belonging to no character: **Stuff**, and anything else a floor hands out.
Red's and Gray's own cards — starting decks and reward pools — are **visually distinguished** so they
can be sorted by sight; neutral cards cannot be, which is why the play zone is split by character
rather than shared. *(ticket 07; execution owned by ticket 11)*

**Maximum hand size** — **5**, and **`Hold` cards count against it**, which is what gives `Hold` a
price. It is a **draw-phase limit only**: you cannot draw while at or over 5, but **Stuff enters your
hand regardless of how full it is**, so a punishment can shove you above the cap and lock your draw
for turns. A floor begins with **empty hands**. *(ticket 07)*
