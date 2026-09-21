/* GENERATED FILE — DO NOT EDIT.
 *
 * Source: design/cards.yaml       Regenerate: node tools/cards.mjs build
 * Check:  node tools/cards.mjs check
 *
 * Every card in North vs Up, as printed.  EVERY NUMBER IS A PLACEHOLDER —
 * costs, stats and thresholds are still open design.
 *
 * Loaded by tools/card-sheet.html (the print-and-cut sheet) with a plain
 * <script> tag, so the sheet keeps working from file:// with no build step
 * and no server.
 */
var NVU_CARDS = {
  meta: {"updated":"2026-09-16"},
  cards: [
    {"name":"Shove","set":"official","kind":"player","owner":"Red","starter":true,"cost":1,"oomph":2,"count":5},
    {"name":"Charge In","set":"official","kind":"player","owner":"Red","starter":true,"cost":2,"oomph":4,"count":5},
    {"name":"Overdrive","set":"official","kind":"player","owner":"Red","starter":true,"cost":0,"oomph":2,"text":"Exhaust 2 (the top 2 cards of your deck go to your Exhaust pile).","count":2},
    {"name":"Duck Under","set":"official","kind":"player","owner":"Gray","starter":true,"cost":1,"scramble":2,"count":5},
    {"name":"Pick The Lock","set":"official","kind":"player","owner":"Gray","starter":true,"cost":2,"scramble":4,"count":5},
    {"name":"Peek Around Corner","set":"official","kind":"player","owner":"Gray","starter":true,"cost":1,"scramble":1,"text":"Look at the top card of any deck, then put it back on top. (Peek 1?)","count":2},
    {"name":"Reckless Swing","set":"proposed","kind":"player","owner":"Red","rarity":"Fine","cost":1,"oomph":4,"text":"Exhaust 1."},
    {"name":"Fast Follow","set":"proposed","kind":"player","owner":"Red","rarity":"Fine","cost":1,"oomph":3,"text":"If Gray played a card this turn, this costs 0."},
    {"name":"Reckless","set":"proposed","kind":"player","owner":"Red","rarity":"Fine","cost":1,"oomph":5,"text":"Exhaust 3."},
    {"name":"Second Wind","set":"proposed","kind":"player","owner":"Red","rarity":"Cool","cost":2,"oomph":4,"text":"Shuffle a Red card from your discard pile back into your deck."},
    {"name":"Junk Launcher","set":"proposed","kind":"player","owner":"Red","rarity":"Cool","cost":2,"oomph":2,"text":"This has Oomph +2 for each card you paid with this turn."},
    {"name":"Heavy Pockets","set":"proposed","kind":"player","owner":"Red","rarity":"Cool","cost":1,"oomph":2,"text":"Shuffle 1 Stuff from your hand into your deck."},
    {"name":"Deadweight Grip","set":"proposed","kind":"player","owner":"Red","rarity":"Woah","cost":1,"scramble":2,"text":"Holding: Cards you play have +1 Oomph, but you may not draw more than 2 cards per turn."},
    {"name":"Both Barrels","set":"proposed","kind":"player","owner":"Red","rarity":"Woah","cost":2,"oomph":4,"text":"If Gray has already played at least one card this turn, +2 Oomph. If the room is Cleared, return this to your hand at the end of the turn."},
    {"name":"Flurry","set":"proposed","kind":"player","owner":"Red","rarity":"Woah","cost":1,"conditional_stat":true,"text":"Oomph equal to twice the number of other cards Red played this turn."},
    {"name":"Zen Mode","set":"proposed","kind":"player","owner":"Red","rarity":"Woah","cost":0,"text":"Holding: you don't `Exhaust`."},
    {"name":"Catch Your Breath","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"scramble":1,"text":"Look at the top 2 cards of any deck. Put them back in either order."},
    {"name":"In Step","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"conditional_stat":true,"text":"Oomph equal to twice the number of cards Red has played this turn."},
    {"name":"One Man's Junk","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"conditional_stat":true,"text":"If any Bad Stuff is played this turn, Oomph 2 and Scramble 2."},
    {"name":"Hack the Doors","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"scramble":2,"text":"Look at the top 3 cards of any deck, then put them back in any order."},
    {"name":"Here, Catch","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"scramble":2,"text":"Move 1 Stuff from your hand to Red's hand."},
    {"name":"Hit 'n Run","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"oomph":2,"text":"Shuffle a Gray card from your discard pile back into your deck."},
    {"name":"I'll Take That","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"scramble":2,"text":"Shuffle 1 Stuff from Red's hand into Red's deck."},
    {"name":"Covering Fire","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"scramble":2,"text":"Every time Red plays a card this turn, draw 1 card."},
    {"name":"Every Little Bit Helps","set":"proposed","kind":"player","owner":"Gray","rarity":"Woah","cost":1,"conditional_stat":true,"text":"Scramble equal to twice the number of other cards Gray played this turn."},
    {"name":"Level Up","set":"proposed","kind":"player","owner":"Gray","rarity":"Woah","cost":2,"text":"Scrap a card from your hand. If you do, draw the top card from the Gray Rewards deck directly into your hand."},
    {"name":"I Know Kung Fu","set":"proposed","kind":"player","owner":"Gray","rarity":"Woah","cost":3,"oomph":5,"text":"Holding: when you play a card with Scramble, draw 1 card."},
    {"name":"Pry Bar","set":"proposed","kind":"good_stuff","rarity":"Fine","cost":0,"oomph":3},
    {"name":"Coil Of Cable","set":"proposed","kind":"good_stuff","rarity":"Fine","cost":0,"scramble":3},
    {"name":"Crowbar","set":"proposed","kind":"good_stuff","rarity":"Fine","cost":0,"oomph":1,"scramble":1,"text":"Play: if you get any Good Stuff this turn, get an additional one."},
    {"name":"A Pair Of Stich-Em-Ups","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":1,"text":"Choose a character. Move 2 cards from that character's discard pile to the bottom of their deck."},
    {"name":"Cutting Torch","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":2,"oomph":5},
    {"name":"Grav Harness","set":"proposed","kind":"good_stuff","rarity":"Woah","cost":2,"oomph":3,"scramble":3,"text":"One of you draws 1 card, (even if their hand is full)."},
    {"name":"Riot Shield","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":1,"scramble":3,"text":"If the room is Cleared, return this to your hand at the end of the turn."},
    {"name":"Overcharged Battery","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":1,"oomph":2,"text":"The next card played this turn costs 0."},
    {"name":"Faceful Of Slime","set":"proposed","kind":"bad_stuff","cost":2,"text":"Holding: you may not draw more than 1 card per turn."},
    {"name":"Torn Seal","set":"proposed","kind":"bad_stuff","cost":2,"text":null},
    {"name":"Sluggish","set":"proposed","kind":"bad_stuff","cost":1,"text":"Holding: cards cost +1 to play."},
    {"name":"Rust","set":"proposed","kind":"bad_stuff","cost":2,"text":"Holding: Stuff you play has -1 Oomph."},
    {"name":"Spore Cloud","set":"proposed","kind":"bad_stuff","cost":2,"text":"Holding: You can't have more than 3 cards in your hand."},
    {"name":"Panic","set":"proposed","kind":"bad_stuff","cost":1,"text":"Holding: ALL rooms require an additional 2 `Scramble` to clear. Play: Exhaust 2."},
    {"name":"My Head Is Quantum Spinning","set":"proposed","kind":"bad_stuff","cost":1,"text":"Holding: whenever you draw a card, your partner must also draw a card."},
    {"name":"Gross Thing That Looks Like A Cherry","set":"proposed","kind":"enemy_room","thresholds":[{"stat":"Oomph","value":5,"outcome":"Ascend"}],"flee":"Both of you Exhaust 1.","floor":1},
    {"name":"Coney, The Thing In The Stairwell","set":"proposed","kind":"enemy_room","thresholds":[{"stat":"Oomph","value":9,"outcome":"Ascend"}],"flee":"Both of you Exhaust 1.","floor":2},
    {"name":"Villy, Coney's Work Husband","set":"proposed","kind":"enemy_room","thresholds":[{"stat":"Oomph","value":9,"outcome":"Ascend"},{"stat":"Scramble","value":9,"outcome":"Flee this room for free."}],"flee":"Both of you Exhaust 2.","floor":3},
    {"name":"Collapsed Stairwell","set":"proposed","kind":"hazard_room","thresholds":[{"stat":"Scramble","value":2,"outcome":"Clear, but both of you Exhaust 1."},{"stat":"Scramble","value":5,"outcome":"Clear, and one of you reveals a reward."}],"flee":"One of you Exhausts 3.","count":3},
    {"name":"Ruptured Coolant Line","set":"proposed","kind":"hazard_room","thresholds":[{"stat":"Scramble","value":4,"outcome":"Clear, but both of you get Bad Stuff."},{"stat":"Scramble","value":7,"outcome":"Clear, and one of you reveals a reward."}],"flee":"Both of you Exhaust 1, and one of you gets Bad Stuff.","count":3},
    {"name":"Sorting Room","set":"proposed","kind":"stuff_room","thresholds":[{"stat":"Oomph","value":2,"outcome":"Red gets Good Stuff."},{"stat":"Scramble","value":2,"outcome":"Gray gets Good Stuff."}],"count":3},
    {"name":"Ration Locker","set":"proposed","kind":"stuff_room","thresholds":[{"stat":"Oomph","value":2,"outcome":"Red gets Good Stuff."},{"stat":"Scramble","value":2,"outcome":"Gray gets Good Stuff."},{"stat":"Oomph","value":4,"outcome":"Red gets 2 instead."},{"stat":"Scramble","value":4,"outcome":"Gray gets 2 instead."}],"count":2},
    {"name":"Tool Cage","set":"proposed","kind":"stuff_room","thresholds":[{"stat":"Scramble","value":3,"outcome":"Both of you get Good Stuff."},{"stat":"Oomph","value":5,"outcome":"Red gets 2 instead."}],"count":2},
    {"name":"Spill Of Cargo","set":"proposed","kind":"stuff_room","thresholds":[{"stat":"Scramble","value":3,"outcome":"Both of you get Good Stuff."},{"stat":"Scramble","value":5,"outcome":"Gray gets 2 instead."}],"count":2}
  ]
};

/* Views over the list, for whatever loads it. */
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
