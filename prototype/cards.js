/* GENERATED FILE — DO NOT EDIT.
 *
 * Source: design/cards.yaml       Regenerate: node tools/cards.mjs build
 * Check:  node tools/cards.mjs check
 *
 * Every card in North vs Up, as printed.  EVERY NUMBER IS A PLACEHOLDER —
 * costs, stats and thresholds belong to ticket 10.
 *
 * Loaded by prototype/card-sheet.html (the cutting sheet) and
 * prototype/encounter-sim.html (the simulator) with a plain <script> tag, so
 * both keep working from file:// with no build step and no server.
 */
var NVU_CARDS = {
  meta: {"ratified":"2026-08-29","exemplar_count":25,"source_tickets":[11,12,21,22,24]},
  cards: [
    {"name":"Shove","set":"exemplar","kind":"player","owner":"Red","starter":true,"rarity":"Fine","cost":0,"power":1},
    {"name":"Charge In","set":"exemplar","kind":"player","owner":"Red","starter":true,"rarity":"Fine","cost":1,"power":3},
    {"name":"Duck Under","set":"exemplar","kind":"player","owner":"Gray","starter":true,"rarity":"Fine","cost":0,"scramble":1},
    {"name":"Pick The Lock","set":"exemplar","kind":"player","owner":"Gray","starter":true,"rarity":"Fine","cost":1,"scramble":3},
    {"name":"Catch Your Breath","set":"exemplar","kind":"player","owner":"Gray","rarity":"Fine","cost":0,"text":"Look at the top 2 cards of your deck. Put them back in either order."},
    {"name":"Reckless","set":"exemplar","kind":"player","owner":"Red","rarity":"Cool","cost":0,"power":5,"text":"At cleanup, Red Exhausts 3 from deck."},
    {"name":"Second Wind","set":"exemplar","kind":"player","owner":"Red","rarity":"Cool","cost":1,"text":"Shuffle 3 cards from Red's exhaust pile into Red's deck.","flagged":"Prints the shuffle version deliberately. It is the recursion shape tickets 01 and 16 found breaking four games, and it breaks ticket 04's no-shuffling-during- a-floor rule. Unruled on purpose."},
    {"name":"In Step","set":"exemplar","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"conditional_stat":true,"text":"Power equal to twice the number of cards Red has played into the play zone this turn."},
    {"name":"Deadweight Grip","set":"exemplar","kind":"player","owner":"Red","rarity":"Woah","cost":0,"hold":true,"text":"While you hold this, cards Red plays have +1 Power. While you hold this, Red may not draw more than 2 cards on a turn."},
    {"name":"One Man's Junk","set":"exemplar","kind":"player","owner":"Gray","rarity":"Cool","cost":0,"conditional_stat":true,"text":"If any Bad Stuff is played this turn, Power 2 and Scramble 2."},
    {"name":"Both Barrels","set":"exemplar","kind":"player","owner":"Red","rarity":"Woah","cost":2,"power":2,"text":"If Gray has played at least one card this turn, Power 5 instead. If this Clears a room, return this to Red's hand instead of Exhausting it."},
    {"name":"Pry Bar","set":"exemplar","kind":"good_stuff","rarity":"Fine","cost":0,"power":3,"hold":true},
    {"name":"Coil of Cable","set":"exemplar","kind":"good_stuff","rarity":"Fine","cost":0,"scramble":3,"hold":true},
    {"name":"Cutting Torch","set":"exemplar","kind":"good_stuff","rarity":"Cool","cost":1,"power":5,"hold":true},
    {"name":"Grav Harness","set":"exemplar","kind":"good_stuff","rarity":"Woah","cost":1,"power":3,"scramble":3,"hold":true,"text":"When you play this, one character may draw 1 card, ignoring the hand cap."},
    {"name":"Faceful of Slime","set":"exemplar","kind":"bad_stuff","cost":0,"hold":true,"text":"While you hold this, you may not draw more than 1 card during your draw phase. Play this to be rid of it."},
    {"name":"Torn Seal","set":"exemplar","kind":"bad_stuff","cost":2,"hold":true,"text":"This may not be Exhausted to pay a cost. Play this to be rid of it."},
    {"name":"Sump Crawler","set":"exemplar","kind":"enemy_room","thresholds":[{"stat":"Power","value":5,"outcome":"Clear"}],"flee":"1 character Exhausts 2 from deck"},
    {"name":"The Thing In The Stairwell","set":"exemplar","kind":"enemy_room","thresholds":[{"stat":"Power","value":9,"outcome":"Clear"},{"stat":"Power","value":12,"outcome":"Clear — one character reveals reward. You may add it to the top of your deck or skip it."}],"flee":"both characters Exhaust 3 from deck","note":"The floor deck's hardest card, and the set's probe of whether an Enemy room may carry a reward tier."},
    {"name":"Collapsed Stair","set":"exemplar","kind":"hazard_room","thresholds":[{"stat":"Scramble","value":2,"outcome":"Clear"},{"stat":"Scramble","value":5,"outcome":"Clear — one character reveals reward. You may add it to the top of your deck or skip it."}],"flee":"1 character Exhausts 3 from deck"},
    {"name":"Ruptured Coolant Line","set":"exemplar","kind":"hazard_room","thresholds":[{"stat":"Scramble","value":4,"outcome":"Clear"},{"stat":"Scramble","value":7,"outcome":"Clear — one character reveals reward. You may add it to the top of your deck or skip it."}],"flee":"both characters Exhaust 1 from deck, and 1 character takes a Bad Stuff"},
    {"name":"Sorting Room","set":"exemplar","kind":"stuff_room","thresholds":[{"stat":"Power","value":1,"outcome":"Red takes 1 Good Stuff."},{"stat":"Scramble","value":1,"outcome":"Gray takes 1 Good Stuff."}]},
    {"name":"Ration Locker","set":"exemplar","kind":"stuff_room","thresholds":[{"stat":"Power","value":1,"outcome":"Red takes 1 Good Stuff."},{"stat":"Scramble","value":1,"outcome":"Gray takes 1 Good Stuff."},{"stat":"Power","value":3,"outcome":"Red takes 2 instead."},{"stat":"Scramble","value":3,"outcome":"Gray takes 2 instead."}]},
    {"name":"Tool Cage","set":"exemplar","kind":"stuff_room","thresholds":[{"stat":"Scramble","value":1,"outcome":"Red takes 1 Good Stuff."},{"stat":"Power","value":1,"outcome":"Gray takes 1 Good Stuff."}]},
    {"name":"Spill of Cargo","set":"exemplar","kind":"stuff_room","thresholds":[{"stat":"Scramble","value":1,"outcome":"Red takes 1 Good Stuff."},{"stat":"Power","value":3,"outcome":"Gray takes 1 Good Stuff."},{"stat":"Scramble","value":3,"outcome":"Red takes 2 instead."},{"stat":"Power","value":3,"outcome":"Gray takes 2 instead."}]},
    {"name":"Overdrive","set":"bank","kind":"player","owner":"Red","starter":true,"starter_status":"provisional","rarity":"Fine","cost":0,"power":2,"text":"Exhaust 2 cards from your deck."},
    {"name":"Reckless Swing","set":"bank","kind":"player","owner":"Red","rarity":"Fine","cost":1,"power":3,"text":"Put the top card of your deck into your exhaust pile."},
    {"name":"Fast Follow","set":"bank","kind":"player","owner":"Red","rarity":"Fine","cost":1,"power":3,"text":"If Gray played a card this turn, this costs 0."},
    {"name":"Junk Launcher","set":"bank","kind":"player","owner":"Red","rarity":"Cool","cost":2,"power":1,"text":"This gains Power +2 for each card you Scrapped or Exhausted from hand to pay a cost this turn."},
    {"name":"Heavy Pockets","set":"bank","kind":"player","owner":"Red","rarity":"Cool","cost":1,"power":2,"text":"Shuffle a Stuff card from your hand into your deck."},
    {"name":"Zen Mode","set":"bank","kind":"player","owner":"Red","rarity":"Woah","cost":0,"hold":true,"text":"While you hold this, you do not exhaust cards from your deck to pay deck-exhaustion costs.","note":"No play line, so it cannot be voluntarily spent. The only exit is Exhausting it from hand to pay a cost."},
    {"name":"Peek Around Corner","set":"bank","kind":"player","owner":"Gray","starter":true,"rarity":"Fine","rarity_status":"by starter precedent, not ruled","cost":null,"text":"Look at the top card of the floor deck. Put it back on top.","note":"Cost and stat are unset. The starter-tier counterpart to Hack the Doors — information, not control."},
    {"name":"Hack the Doors","set":"bank","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"scramble":1,"text":"Look at the top 3 cards of the floor deck. You may put them back in any order.","note":"A deliberate exception to ticket 18's rule that the face-up room is all the players know."},
    {"name":"Hand Off","set":"bank","kind":"player","owner":"Gray","rarity":"Fine","cost":0,"scramble":1,"text":"Move 1 card from your hand to Red's hand."},
    {"name":"Patch Up","set":"bank","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"scramble":1,"text":"Move 1 card from your exhaust pile to the top of your deck."},
    {"name":"Pack Away","set":"bank","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"scramble":1,"text":"Choose a Stuff card in Red's hand. Shuffle it into Red's deck."},
    {"name":"Covering Fire","set":"bank","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"scramble":2,"text":"If Red played a card this turn, draw 1 card."},
    {"name":"All At Once","set":"bank","kind":"player","owner":"Gray","rarity":"Woah","cost":1,"conditional_stat":true,"text":"Scramble equal to twice the number of other cards Gray played this turn.","note":"A Red counterpart of this kind is owed but not written."},
    {"name":"Spot Salvage","set":"bank","kind":"player","owner":"Gray","rarity":"Woah","cost":2,"scramble":2,"text":"Scrap a card from your hand. If you do, draw 1 card from your reward pool into your hand.","note":"A third acquisition source. What it pulls is permanent."},
    {"name":"I Know Kung Fu","set":"bank","kind":"player","owner":"Gray","rarity":"Woah","cost":3,"hold":true,"text":"While Holding this, when you play a card with Scramble, draw 1 card. Play: Power 5","note":"Pays Power, not Scramble, from a Gray card. Ticket 13 owns whether that crossing is intended."},
    {"name":"Crowbar","set":"bank","kind":"good_stuff","rarity":"Fine","cost":0,"power":1,"scramble":1,"hold":true,"text":"When you play this to clear a Stuff room, you may Scrap it to draw 2 Good Stuff instead of 1."},
    {"name":"Stitch-Kit","set":"bank","kind":"good_stuff","rarity":"Fine","cost":1,"hold":true,"text":"Move 2 cards from your exhaust pile to the bottom of your deck."},
    {"name":"Riot Shield","set":"bank","kind":"good_stuff","rarity":"Cool","cost":1,"scramble":3,"hold":true,"text":"At the end of the turn, if this is in the play zone, you may return it to your hand instead of Exhausting it."},
    {"name":"Overcharged Battery","set":"bank","kind":"good_stuff","rarity":"Cool","cost":0,"power":1,"hold":true,"text":"You may Scrap this from your hand to make another card played this turn cost 0."},
    {"name":"Sluggish","set":"bank","kind":"bad_stuff","cost":1,"hold":true,"text":"When you draw this, choose another card in your hand. It costs +1 this turn."},
    {"name":"Rust","set":"bank","kind":"bad_stuff","cost":2,"hold":true,"text":"While you hold this, Good Stuff you play has -1 Power."},
    {"name":"Spore Cloud","set":"bank","kind":"bad_stuff","cost":1,"hold":true,"text":"While you hold this, cards you draw go to your exhaust pile instead of your hand."},
    {"name":"Panic","set":"bank","kind":"bad_stuff","cost":1,"hold":true,"text":"While you hold this, you must be the character who resolves the room's Flee line. When you play this, Exhaust 2 cards from your deck."}
  ]
};

/* Views the two prototypes share. */
NVU_CARDS.by = function (fn) { return NVU_CARDS.cards.filter(fn); };
NVU_CARDS.exemplars = NVU_CARDS.cards.filter(function (c) { return c.set === "exemplar"; });
NVU_CARDS.bank = NVU_CARDS.cards.filter(function (c) { return c.set === "bank"; });
NVU_CARDS.byName = function (n) {
  for (var i = 0; i < NVU_CARDS.cards.length; i++) {
    if (NVU_CARDS.cards[i].name === n) return NVU_CARDS.cards[i];
  }
  return null;
};

if (typeof module !== "undefined") module.exports = NVU_CARDS;
