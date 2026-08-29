# Card bank — ticket 12

The growing list of designed cards for the two per-character reward pools, for Good Stuff, and for
Bad Stuff. Ticket 12 sized those pools at **45–55 cards per character**; the
[exemplar set](12-exemplar-card-set.md) holds the twenty-four cards built to test the anatomy — 10
player cards, 4 Good Stuff, 2 Bad Stuff, 4 rooms and 4 Stuff rooms — and this file is where the rest
accumulate.

Everything on this page is `[you, 2026-08-27]` — handed to the map in
`north-vs-up-card-designs.md`. The exemplar set's cards are not repeated here.

**Every number is a placeholder.** Ticket 10 owns costs, stats and thresholds.

Format, per ticket 11: **Name** · type line · `Cost N` · **Stat** · effect text · `Hold` where
printed · rarity.

---

## Red — the volatile smasher

Red spends his own stamina, or permanently destroys scavenged gear, to make Power.

**Overdrive** · Red · `Fine` · `Cost 0` · **Power 2**
> *Exhaust 2 cards from your deck.*

Fast tempo that pays no card out of hand, and 2 stamina off the top of the deck instead. Written as a
starter; the exemplar set already has two Red starters, so treat this as a third candidate rather
than a settled one.

**Scrap Metal** · Red · `Fine` · `Cost 1` · **Power 3**
> *Scrap a Stuff card from your hand.*

An early swing that destroys a scavenged item outright. The cleanest use is vaporising Bad Stuff.

**Reckless Swing** · Red · `Fine` · `Cost 1` · **Power 3**
> *Put the top card of your deck into your exhaust pile.*

Turns stamina directly into board pressure, so deck-as-health is felt every time it is played.

**Fast Follow** · Red · `Fine` · `Cost 1` · **Power 3**
> *If Gray played a card this turn, this costs 0.*

Rewards sequencing behind Gray. Solo, it is a plain `Cost 1` card — ticket 03's claim again.

**Junk Launcher** · Red · `Cool` · `Cost 2` · **Power 1**
> *This gains Power +2 for each card you Scrapped or Exhausted from hand to pay a cost this turn.*

A linear payoff on Red's whole spend. Easy to count at the table because everything spent is sitting
face up.

**Heavy Pockets** · Red · `Cool` · `Cost 1` · **Power 2**
> *Shuffle a Stuff card from your hand into your deck.*

Packs gear away: +1 stamina now, and the weapon comes back later in the run.

**Zen Mode** · Red · `Woah` · *(no cost)* · `Hold`
> *While you hold this, you do not exhaust cards from your deck to pay deck-exhaustion costs.*
> *Play this to gain Power 4.*

A state card. One of Red's five hand slots buys immunity to the self-damage on `Overdrive` and
`Reckless Swing`, until he cashes it in for a big number.

## Gray — the attuned logistician

Gray draws, moves cards between zones, and manages hand congestion for both characters.

**Hack the Doors** · Gray · `Fine` · `Cost 1` · **Scramble 1**
> *Look at the top 3 cards of the floor deck. You may put them back in any order.*

Scouting, so the team knows what it is drawing into before it commits. Written as a starter.

**Hand Off** · Gray · `Fine` · `Cost 0` · **Scramble 1**
> *Move 1 card from your hand to Red's hand.*

Hand-cap traffic control. Gray scavenges and passes across the table.

**Patch Up** · Gray · `Fine` · `Cost 1` · **Scramble 1**
> *Move 1 card from your exhaust pile to the top of your deck.*

A heal. Net zero on the turn it is played, and it chooses which card comes back.

**Pack Away** · Gray · `Fine` · `Cost 1` · **Scramble 1**
> *Choose a Stuff card in Red's hand. Shuffle it into Red's deck.*

Gray as quartermaster, healing Red by stowing his heavy gear.

**Covering Fire** · Gray · `Cool` · `Cost 1` · **Scramble 2**
> *If Red played a card this turn, draw 1 card.*

The mirror of `Fast Follow`: Red draws attention, Gray scrounges.

**Scrap Salvage** · Gray · `Woah` · `Cost 2` · **Scramble 2**
> *Scrap a card from your hand. If you do, draw 1 card from your reward pool into your hand.*

High-stakes thinning: trade a starter permanently for a premium card, mid-floor.

**I Know Kung Fu** · Gray · `Woah` · *(no cost)* · `Hold`
> *While you hold this, other cards you play that have Scramble also read "Draw 1 card."*
> *Play this to gain Scramble 3.*

The other state card. A permanent −1 hand size turns every basic Scramble play into a cantrip, until
Gray breaks the state for an emergency escape.

## Good Stuff

**Crowbar** · Good Stuff · `Fine` · `Cost 0` · **Power 1, Scramble 1** · `Hold`
> *When you play this to clear a Stuff room, you may Scrap it to draw 2 Good Stuff instead of 1.*

Small utility that can be broken open for double loot.

**Stitch-Kit** · Good Stuff · `Fine` · `Cost 1` · *(no stat)* · `Hold`
> *Move 2 cards from your exhaust pile to the bottom of your deck. Then Scrap this.*

An emergency bandage: one card from hand for two back into the deck, net +1 stamina, consumed.

**Riot Shield** · Good Stuff · `Cool` · `Cost 1` · **Scramble 3** · `Hold`
> *At the end of the turn, if this is in the play zone, you may return it to your hand instead of
> Exhausting it.*

Repeatable Scramble that permanently occupies a hand slot to stay repeatable.

**Overcharged Battery** · Good Stuff · `Cool` · `Cost 0` · **Power 1** · `Hold`
> *You may Scrap this from your hand to make another card played this turn cost 0.*

Either a small stat, or the fuel that deploys Red's heavy cards free.

## Bad Stuff

No stat field, always `Hold`, playable to be rid of it.

**Thick Slime** · Bad Stuff · `Fine` · `Cost 1` · `Hold`
> *When you draw this, choose another card in your hand. It costs +1 this turn.*

**Rust** · Bad Stuff · `Fine` · `Cost 2` · `Hold`
> *While you hold this, Good Stuff you play has −1 Power.*

**Spore Cloud** · Bad Stuff · `Woah` · `Cost 1` · `Hold`
> *While you hold this, cards you draw go to your exhaust pile instead of your hand.*

**Panic** · Bad Stuff · `Fine` · `Cost 1` · `Hold`
> *While you hold this, you must be the character who resolves the room's Flee line.*
> *When you play this, Exhaust 2 cards from your deck.*

`Panic` is built for the Flee punishment specifically: a panicked character cannot be shielded by
their partner, and clearing their head costs stamina.

---

## Where these sit against settled rulings

Recorded, not fixed. Each is the human's call.

- **`Scrap Salvage` draws from a reward pool mid-floor — ruled permanent, 2026-08-29.** `[you]` What
  it pulls stays in the deck for the rest of the run, exactly like an ascend reward. This makes it a
  **third acquisition source** alongside the ascend offer and the floor card's reward, which ticket 09
  should record.

  Note it is also **one-for-one**: a card Scrapped, a card gained, deck size unchanged — the same shape
  ticket 24's ascend tax was ruled to have on the same day.
- **~~`Scrounge` looks at the floor deck.~~ Ruled 2026-08-29: the card stays, renamed
  `Hack the Doors`.** `[you]` Ticket 18 settled that a room flips face up at the start of the turn and
  that is all the players know; this card is a deliberate exception, and the new name gives the
  exception a fiction — Gray works the door controls and sees what the next rooms hold. Scouting the
  floor deck is now granted, on a card, to Gray.
- **`Overdrive` and `Hack the Doors` are written as starters.** The starting deck's shape belongs to
  tickets 09 and 10, and the exemplar set already names four starters. They are listed here as pool
  cards.
- **`Heavy Pockets` and `Pack Away` shuffle Stuff into a deck — ruled to survive, 2026-08-29.**
  `[you]` Ticket 24 does this for free at the ascend, which is what killed `Pack Rat`. These two are
  different because they act **mid-floor**: a card shuffled into the deck partway through a floor is
  stamina you can still draw and spend *this* floor, where the free version only ever arrives after
  the floor is over. That is a heal, not an early copy of a free effect.

  **The principle, stated once:** a card that does at the ascend what ticket 24 already gives away is
  dead weight; a card that does it mid-floor is buying tempo and earns its slot. `[proposed by agent
  → you approved, 2026-08-29]`

  **This exposes a gap in ticket 24.** `[finding]` Ticket 24's ascend sorts the *exhaust pile* and the
  *hand*, and says nothing about Stuff sitting **in a deck** — which is exactly where these two cards
  put it. Whether it is pulled back to the pool like other Stuff, or stays as a permanent deck card,
  decides whether these are tempo cards or permanent upgrades. Ticket 24's.
- **`Zen Mode` and `I Know Kung Fu` have no cost and are played for a stat.** The anatomy in ticket
  11 has one cost field; a card that is free to play but pays a hand slot to hold is a shape that
  field cannot say. `Scrap Sense` prints a cost and `Hold` together, so this is a
  real departure.
- **`Thick Slime` near-duplicates `Faceful of Slime`**, and three cards now carry `Scrap` in the name
  alongside the exemplar `Scrap Sense`. A naming pass is owed before print.
- **`Spore Cloud` is rarity `Woah`.** Under the value axis, rarity reports a card's ceiling for the
  player holding it, and a Bad Stuff card's ceiling is its nastiness. Whether Bad Stuff carries
  rarity on the same axis at all is unruled — the exemplar Bad Stuff prints none.
