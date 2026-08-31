/* GENERATED FILE — DO NOT EDIT.
 *
 * Source: design/cards.yaml       Regenerate: node tools/cards.mjs build
 * Check:  node tools/cards.mjs check
 *
 * Every card in North vs Up, as printed.  EVERY NUMBER IS A PLACEHOLDER —
 * costs, stats and thresholds are still open design.
 *
 * Loaded by prototype/card-sheet.html (the cutting sheet) and
 * prototype/encounter-sim.html (the simulator) with a plain <script> tag, so
 * both keep working from file:// with no build step and no server.
 */
var NVU_CARDS = {
  meta: {"updated":"2026-08-30"},
  cards: [
    {"name":"Shove","set":"official","kind":"player","owner":"Red","starter":true,"cost":1,"power":2,"count":5},
    {"name":"Charge In","set":"official","kind":"player","owner":"Red","starter":true,"cost":2,"power":4,"count":5},
    {"name":"Overdrive","set":"official","kind":"player","owner":"Red","starter":true,"cost":0,"power":2,"text":"Exhaust 2 (the top 2 cards of your deck go to your Exhaust pile).","count":2},
    {"name":"Duck Under","set":"official","kind":"player","owner":"Gray","starter":true,"cost":1,"scramble":2,"count":5},
    {"name":"Pick The Lock","set":"official","kind":"player","owner":"Gray","starter":true,"cost":2,"scramble":4,"count":5},
    {"name":"Peek Around Corner","set":"official","kind":"player","owner":"Gray","starter":true,"cost":1,"scramble":1,"text":"Look at the top card of any deck, then put it back on top. (Peek 1?)","count":2},
    {"name":"Reckless Swing","set":"proposed","kind":"player","owner":"Red","rarity":"Fine","cost":1,"power":4,"text":"Exhaust 1."},
    {"name":"Fast Follow","set":"proposed","kind":"player","owner":"Red","rarity":"Fine","cost":1,"power":3,"text":"If Gray played a card this turn, this costs 0."},
    {"name":"Reckless","set":"proposed","kind":"player","owner":"Red","rarity":"Fine","cost":1,"power":5,"text":"Exhaust 3."},
    {"name":"Second Wind","set":"proposed","kind":"player","owner":"Red","rarity":"Cool","cost":2,"power":4,"text":"Shuffle an exhausted Red card back into your deck."},
    {"name":"Junk Launcher","set":"proposed","kind":"player","owner":"Red","rarity":"Cool","cost":2,"power":2,"text":"This has Power +2 for each card you paid with this turn."},
    {"name":"Heavy Pockets","set":"proposed","kind":"player","owner":"Red","rarity":"Cool","cost":1,"power":2,"text":"Shuffle 1 Stuff from your hand into your deck."},
    {"name":"Deadweight Grip","set":"proposed","kind":"player","owner":"Red","rarity":"Woah","cost":1,"scramble":2,"hold":true,"text":"Holding: Cards you play have +1 Power, but you may not draw more than 2 cards at draw time."},
    {"name":"Both Barrels","set":"proposed","kind":"player","owner":"Red","rarity":"Woah","cost":2,"power":4,"text":"If Gray has already played at least one card this turn, +2 Power. If this is the card that clears the room, put this right back in your hand."},
    {"name":"Flurry","set":"proposed","kind":"player","owner":"Red","rarity":"Woah","cost":1,"conditional_stat":true,"text":"Power equal to twice the number of other cards Red played this turn."},
    {"name":"Zen Mode","set":"proposed","kind":"player","owner":"Red","rarity":"Woah","cost":0,"hold":true,"text":"While `Holding`, you don't Exhaust cards."},
    {"name":"Catch Your Breath","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"scramble":1,"text":"Look at the top 2 cards of any deck. Put them back in either order."},
    {"name":"In Step","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"conditional_stat":true,"text":"Power equal to twice the number of cards Red has played this turn."},
    {"name":"One Man's Junk","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"conditional_stat":true,"text":"If any Bad Stuff is played this turn, Power 2 and Scramble 2."},
    {"name":"Hack the Doors","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"scramble":2,"text":"Look at the top 3 cards of any deck, then put them back in any order."},
    {"name":"Here, Catch","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"scramble":2,"text":"Move 1 Stuff from your hand to Red's hand."},
    {"name":"Hit 'n Run","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"power":2,"text":"Shuffle an exhausted Gray card back into your deck."},
    {"name":"I'll Take That","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"scramble":2,"text":"Shuffle 1 Stuff from Red's hand into Red's deck."},
    {"name":"Covering Fire","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"scramble":2,"text":"Every time Red plays a card this turn, draw 1 card."},
    {"name":"Every Little Bit Helps","set":"proposed","kind":"player","owner":"Gray","rarity":"Woah","cost":1,"conditional_stat":true,"text":"Scramble equal to twice the number of other cards Gray played this turn."},
    {"name":"Level Up","set":"proposed","kind":"player","owner":"Gray","rarity":"Woah","cost":2,"text":"Scrap a card from your hand. If you do, draw the top card from the Gray Rewards deck directly into your hand."},
    {"name":"I Know Kung Fu","set":"proposed","kind":"player","owner":"Gray","rarity":"Woah","cost":3,"power":5,"hold":true,"text":"Holding: when you play a card with Scramble, draw 1 card."},
    {"name":"Pry Bar","set":"proposed","kind":"good_stuff","rarity":"Fine","cost":0,"power":3,"hold":true},
    {"name":"Coil Of Cable","set":"proposed","kind":"good_stuff","rarity":"Fine","cost":0,"scramble":3,"hold":true},
    {"name":"Crowbar","set":"proposed","kind":"good_stuff","rarity":"Fine","cost":0,"power":1,"scramble":1,"hold":true,"text":"If you get any Good Stuff this turn, get an additional one."},
    {"name":"A Pair Of Stich-Em-Ups","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":1,"hold":true,"text":"Move 2 cards from your exhaust pile to the bottom of your deck."},
    {"name":"Cutting Torch","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":2,"power":5,"hold":true},
    {"name":"Grav Harness","set":"proposed","kind":"good_stuff","rarity":"Woah","cost":2,"power":3,"scramble":3,"hold":true,"text":"One of you draws 1 card, (even if their hand is full)."},
    {"name":"Riot Shield","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":1,"scramble":3,"hold":true,"text":"At the end of turn, return this card to your hand."},
    {"name":"Overcharged Battery","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":1,"power":2,"hold":true,"text":"The next card played this turn costs 0."},
    {"name":"Faceful Of Slime","set":"proposed","kind":"bad_stuff","cost":1,"hold":true,"text":"Holding: you may not draw more than 1 card at draw time."},
    {"name":"Torn Seal","set":"proposed","kind":"bad_stuff","cost":2,"hold":true,"text":null},
    {"name":"Sluggish","set":"proposed","kind":"bad_stuff","cost":1,"hold":true,"text":"Holding: cards cost +1 to play."},
    {"name":"Rust","set":"proposed","kind":"bad_stuff","cost":2,"hold":true,"text":"Holding: Stuff you play has -1 Power."},
    {"name":"Spore Cloud","set":"proposed","kind":"bad_stuff","cost":2,"hold":true,"text":"Holding: You can't have more than 3 cards in your hand."},
    {"name":"Panic","set":"proposed","kind":"bad_stuff","cost":1,"hold":true,"text":"Holding: ALL rooms require an additional 2 `Scramble` to clear. Play: Exhaust 2."},
    {"name":"Gross Thing That Looks Like A Cherry","set":"proposed","kind":"enemy_room","thresholds":[{"stat":"Power","value":5,"outcome":"Ascend"}],"flee":"Both of you Exhaust 1.","floor":1},
    {"name":"Coney, The Thing In The Stairwell","set":"proposed","kind":"enemy_room","thresholds":[{"stat":"Power","value":9,"outcome":"Ascend"}],"flee":"Both of you Exhaust 1.","floor":2},
    {"name":"Villy, Coney's Work Husband","set":"proposed","kind":"enemy_room","thresholds":[{"stat":"Power","value":9,"outcome":"Ascend"},{"stat":"Scramble","value":9,"outcome":"Flee this room for free."}],"flee":"Both of you Exhaust 2.","floor":3},
    {"name":"Collapsed Stairwell","set":"proposed","kind":"hazard_room","thresholds":[{"stat":"Scramble","value":2,"outcome":"Clear, but both of you Exhaust 1."},{"stat":"Scramble","value":5,"outcome":"Clear"}],"flee":"One of you Exhausts 3.","count":3},
    {"name":"Ruptured Coolant Line","set":"proposed","kind":"hazard_room","thresholds":[{"stat":"Scramble","value":4,"outcome":"Clear, but both of you get Bad Stuff."},{"stat":"Scramble","value":7,"outcome":"Clear"}],"flee":"Both of you Exhaust 1, and one of you gets Bad Stuff.","count":3},
    {"name":"Sorting Room","set":"proposed","kind":"stuff_room","thresholds":[{"stat":"Power","value":2,"outcome":"Red gets Good Stuff."},{"stat":"Scramble","value":2,"outcome":"Gray gets Good Stuff."}],"count":3},
    {"name":"Ration Locker","set":"proposed","kind":"stuff_room","thresholds":[{"stat":"Power","value":2,"outcome":"Red gets Good Stuff."},{"stat":"Scramble","value":2,"outcome":"Gray gets Good Stuff."},{"stat":"Power","value":4,"outcome":"Red gets 2 instead."},{"stat":"Scramble","value":4,"outcome":"Gray gets 2 instead."}],"count":2},
    {"name":"Tool Cage","set":"proposed","kind":"stuff_room","thresholds":[{"stat":"Scramble","value":3,"outcome":"Both of you get Good Stuff."},{"stat":"Power","value":5,"outcome":"Red gets 2 instead."}],"count":2},
    {"name":"Spill Of Cargo","set":"proposed","kind":"stuff_room","thresholds":[{"stat":"Scramble","value":3,"outcome":"Both of you get Good Stuff."},{"stat":"Scramble","value":5,"outcome":"Gray gets 2 instead."}],"count":2}
  ]
};

/* Views the prototypes share. */
NVU_CARDS.by = function (fn) { return NVU_CARDS.cards.filter(fn); };
NVU_CARDS.official = NVU_CARDS.cards.filter(function (c) { return c.set === "official"; });
NVU_CARDS.proposed = NVU_CARDS.cards.filter(function (c) { return c.set === "proposed"; });
NVU_CARDS.byName = function (n) {
  for (var i = 0; i < NVU_CARDS.cards.length; i++) {
    if (NVU_CARDS.cards[i].name === n) return NVU_CARDS.cards[i];
  }
  return null;
};

if (typeof module !== "undefined") module.exports = NVU_CARDS;
