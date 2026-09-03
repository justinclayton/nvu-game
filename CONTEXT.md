# North vs Up — glossary

The project's domain terms and nothing else: what each thing is, the rulebook section that governs
it, and the ticket or ruling that settled it. The rules themselves live in
[`design/rulebook.md`](design/rulebook.md), which wins wherever this file disagrees with it. Code
uses these terms spelled this way.

---

**Run** — a whole play session: ten floors, until the tower is beaten or both characters are Down.
§11. *(tickets 04, 05)*

**Floor** — one level of the tower, played as one floor deck over many turns. Ends by Ascending.
§4, §10. *(tickets 04, 05, 18)*

**Floor deck** — the shared face-down deck of rooms for the current floor: one Enemy room, three
Hazard rooms, and Stuff rooms equal to ten minus the floor number. Has a Fled pile and a Cleared pile
beside it. §3, §4. *(tickets 18, 21, 22)*

**Room** — one card of the floor deck; what the team faces this turn. Flipped into the active room at
the start of the turn. Prints challenges and a Flee line. §5 Flip, §6, §8. *(tickets 18, 21)*

**Active room** — the zone holding the room card in play this turn. §3. *(ticket 21)*

**Challenge** — a `threshold: outcome` line on a room. Met when the stat pool reaches the threshold;
excess has no effect. A room may print more than one. §5 Play, §8. *(tickets 21, 22)*

**Flee line** — what happens when the team meets no threshold. Every room prints one. A Stuff room's
Flee line Clears the room. §5 Play, §6. *(tickets 21, 22, 11)*

**Enemy room** — the room whose clearing ends the floor. Exactly one per floor deck. Challenge is
`Power`. §6. *(tickets 21, 22, 11)*

**Hazard room** — a room with two `Scramble` challenges. The lower Clears it; the higher also pays a
card reward. §6. *(tickets 21, 22)*

**Stuff room** — a room whose challenges are split per character, each read against that character's
own side of the play zone, paying Good Stuff. Its Flee line Clears it. §6. *(tickets 21, 22, 09, 11)*

**Stuff** — a card the floor gives you. Has Hold; playable; may be Exhausted from hand to pay a cost.
Stuff in an exhaust pile is Scrapped on Ascending. §7. *(tickets 21, 09, 07)*

**Good Stuff** / **Bad Stuff** — the two kinds of Stuff, named on the type line. Good Stuff is earned
from rooms and has stats and a rarity border. Bad Stuff is dealt as a punishment and has neither. §7,
§8. *(tickets 09, 11)*

**Good Stuff pool** / **Bad Stuff pool** — the face-down piles Stuff is drawn from. §3. *(ticket 09)*

**Power** / **Scramble** — the two stats. Rooms print how much is needed; played cards contribute
what they have. §8. *(tickets 21, 11)*

**Stat pool** — the total of the stats on every card in the play zone, both sides together. Not a
zone; recalculated whenever read. A Stuff room reads one side alone. §5 Play. *(tickets 21, 22)*

**Play zone** — where played cards sit face up during a turn, split into a side per character.
Exhausted at Cleanup. §3, §5. *(tickets 21, 07)*

**Type line** — the line saying what a card is: `Red`, `Gray`, `Good Stuff`, or `Bad Stuff` on a
player-side card; `Enemy`, `Hazard`, or `Stuff` on a room. §8. *(ticket 11)*

**Rarity** — `Fine`, `Cool`, or `Woah`, shown as a border. No rule reads it. Bad Stuff has none. §8.
*(tickets 11, 12)*

**Cost** — the number of cards Exhausted from hand to play a card. Unrelated to its stats. §8.
*(tickets 04, 21)*

**Cleared** — a room the team met a threshold on, or whose Flee line Cleared it. Goes to the Cleared
pile and never returns. Rooms are Cleared; cards are Exhausted. §5 Cleanup. *(tickets 18, 21, 22, 07)*

**Fled** — a room the team met no threshold on. Goes to the Fled pile, which is shuffled back into the
floor deck when the floor deck runs out. §5 Cleanup. *(tickets 18, 21)*

**Ascend** — to leave a Cleared floor for the next: Scrap Stuff from the exhaust pile (less the Scrap
tax), shuffle the exhaust pile into the deck, choose a card reward, build the next floor. Heals a Down
character. §10. *(tickets 04, 05, 24; Scrap tax and kept Stuff `[you, 2026-09-02]`)*

**Card reward** — a card added to a character's deck for the rest of the run. On Ascending, one of
three revealed; on a Hazard room's higher threshold, the top card of the pool, take it or skip it.
Cards not taken go to the bottom of the pool. §6, §10. *(tickets 05, 22, 09; skipped Hazard reveal
`[you, 2026-09-02]`)*

**Reward pool** — one per character; where that character's card rewards come from. §3. *(ticket 09)*

**Character** — `Red` or `Gray`. Both always in play; solo, one player runs both. §2, Appendix.
*(tickets 03, 04)*

**Deck** — a character's face-down draw pile. Its height is their Stamina. §3. *(ticket 04)*

**Stamina** — a character's health: the cards in their deck. Every card is one Stamina; no card prints
a value. §2, §8. *(ticket 04)*

**Hand** — the cards a character drew this turn plus any Hold cards. Maximum five. §3, §5 Draw.
*(ticket 04)*

**Maximum hand size** — five. Hold cards count. Stops drawing up, never the minimum draw: at five or
more, the required draw goes to the exhaust pile. Stuff from a room ignores it. §5 Draw. *(tickets 07,
04)*

**Draw** — the phase of moving cards from deck to hand one at a time until the player stops. At least
one is mandatory except in Last Stand. No drawing once Play begins. §5 Draw. *(tickets 04, 21)*

**Exhaust** — to move a card to its owner's exhaust pile. Bare `Exhaust X` means X off the top of
your own deck. §8. *(tickets 04, 24; bare form `[you, 2026-09-01]`)*

**Exhaust pile** — a character's face-up pile of Exhausted cards. Shuffled back into the deck on
Ascending, less any Stuff. A character has no other discard pile. §3. *(tickets 04, 21, 07, 24)*

**Scrap** — to move a card to the Scrapyard. §8. *(ticket 24)*

**Scrapyard** — the single shared pile of Scrapped cards. Nothing leaves it. §3, §8. *(ticket 24)*

**Scrap tax** — on Ascending, keeping one Stuff card from your exhaust pile by Scrapping one non-Stuff
card from that pile in its place. The kept card is ordinary Stuff. §10. *(ticket 24; non-Stuff and
ordinary `[you, 2026-09-02]`)*

**Hold** — a keyword: the card is not Exhausted at Cleanup while in hand. Once played it is Exhausted
like any other card. §8. *(tickets 04, 21)*

**Holding** — text after `Holding:` on a card applies while the card is in hand. §8. *(ticket 11)*

**Turn** — the unit of play, belonging to the floor: Flip, Draw, Play, Cleanup, with both characters
acting throughout in any order. §5. *(tickets 21, 07)*

**Last Stand** — the state a character enters when their deck runs out, from the end of that phase
until the next room check. They do not draw and play every card at no cost. Clearing the room ends it
with an alternate cleanup: play zone shuffled into the deck, then two Exhausted off the top. Fleeing
puts them Down. §9. *(tickets 04, 17, 07, 12)*

**Down** — a character out for the rest of the floor: their deck came up empty when a card would be
moved from it, or the team Fled while they were in Last Stand. Going Down empties the hand into the
exhaust pile. Skipped in Draw and Play; no cards may enter their hand; Flee lines fall on their
partner. Ascending heals them. The run ends when both are Down at the start of a turn. §9, §11.
*(tickets 03, 04, 07, 12)*
