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
  meta: {"updated":"2026-09-23"},
  cards: [
    {"name":"Shove","set":"official","kind":"player","owner":"Red","starter":true,"cost":1,"oomph":2,"flavor":"A quick, decisive shove to clear space.","count":4},
    {"name":"Charge In","set":"official","kind":"player","owner":"Red","starter":true,"cost":2,"oomph":4,"flavor":"Lower your shoulder and put your full momentum into it.","count":5},
    {"name":"Lean In","set":"proposed","kind":"player","owner":"Red","starter":true,"cost":1,"oomph":1,"scramble":1,"flavor":"Put your weight into helping Gray slip past.","count":1},
    {"name":"Overdrive","set":"official","kind":"player","owner":"Red","starter":true,"cost":0,"oomph":2,"flavor":"Burn extra stamina for an immediate burst.","text":"Exhaust 2.","count":2},
    {"name":"Duck Under","set":"official","kind":"player","owner":"Gray","starter":true,"cost":1,"scramble":2,"flavor":"Stay low and keep moving.","count":4},
    {"name":"Pick The Lock","set":"official","kind":"player","owner":"Gray","starter":true,"cost":2,"scramble":4,"flavor":"Pop the pins before anyone notices you're there.","count":5},
    {"name":"Work The Angles","set":"proposed","kind":"player","owner":"Gray","starter":true,"cost":1,"oomph":1,"scramble":1,"flavor":"Find the structural weak point so Red can strike.","count":1},
    {"name":"Peek Around Corner","set":"official","kind":"player","owner":"Gray","starter":true,"cost":1,"scramble":1,"flavor":"A quick glance ahead to spot hazards.","text":"Peek 1.","count":2},
    {"name":"Reckless Swing","set":"proposed","kind":"player","owner":"Red","rarity":"Fine","cost":1,"oomph":4,"flavor":"Put everything into a wide arc, damn the recoil.","text":"Exhaust 1."},
    {"name":"Fast Follow","set":"proposed","kind":"player","owner":"Red","rarity":"Fine","cost":1,"oomph":3,"flavor":"Stepping right into the opening Gray created.","text":"If Gray played a card this turn, play this card for free."},
    {"name":"Reckless","set":"proposed","kind":"player","owner":"Red","rarity":"Fine","cost":1,"oomph":5,"flavor":"Pure raw force that leaves you completely breathless.","text":"Exhaust 3."},
    {"name":"Bull Rush","set":"proposed","kind":"player","owner":"Red","rarity":"Fine","cost":1,"oomph":2,"scramble":1,"flavor":"Charge ahead while keeping your footing on loose debris."},
    {"name":"Cross Punch","set":"proposed","kind":"player","owner":"Red","rarity":"Fine","cost":2,"oomph":4,"scramble":2,"flavor":"A heavy two-part combination attack.","text":"Exhaust 1."},
    {"name":"Second Wind","set":"proposed","kind":"player","owner":"Red","rarity":"Cool","cost":2,"oomph":4,"flavor":"Catch your breath and shake off the fatigue.","text":"Shuffle a Red card from your Exhaust pile into your deck."},
    {"name":"Junk Launcher","set":"proposed","kind":"player","owner":"Red","rarity":"Cool","cost":2,"oomph":2,"flavor":"Hurl whatever scrap isn't nailed down.","text":"This card gains Oomph +2 for each card spent to play it this turn."},
    {"name":"Heavy Pockets","set":"proposed","kind":"player","owner":"Red","rarity":"Cool","cost":1,"oomph":2,"scramble":1,"flavor":"Stash the heavy salvage where it won't weigh down your swing.","text":"Shuffle 1 Stuff from your hand into your deck."},
    {"name":"Tag Team","set":"proposed","kind":"player","owner":"Red","rarity":"Cool","cost":1,"oomph":2,"scramble":2,"flavor":"Seamless hand-off between partners.","text":"If Gray played a card this turn, draw 1 card."},
    {"name":"Catch Your Breath","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"scramble":2,"flavor":"Pause for a second to read the room.","text":"Look at top 2 cards of any deck. Put them back in either order."},
    {"name":"Here, Catch","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"scramble":3,"flavor":"Toss a heavy tool over before it bogs you down.","text":"Move 1 Stuff from your hand to Red's hand."},
    {"name":"Hit 'n Run","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"oomph":1,"scramble":2,"flavor":"Strike fast and disappear into the shadows.","text":"Shuffle a Gray card from your Exhaust pile into your deck."},
    {"name":"I'll Take That","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"scramble":3,"flavor":"Relieve Red of that cumbersome pack.","text":"Shuffle 1 Stuff from Red's hand into Red's deck."},
    {"name":"Quick Vault","set":"proposed","kind":"player","owner":"Gray","rarity":"Fine","cost":1,"oomph":1,"scramble":2,"flavor":"Spring off Red's shoulder to clear the gap."},
    {"name":"In Step","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"conditional_stat":true,"flavor":"Sync your movements perfectly with Red's brute rhythm.","text":"Scramble equal to 2 times the number of cards Red has played this turn."},
    {"name":"One Man's Junk","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"oomph":2,"scramble":2,"flavor":"Turn hazardous junk into a makeshift advantage.","text":"If any Bad Stuff is played this turn, gain Oomph +1 and Scramble +1."},
    {"name":"Hack the Doors","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"scramble":3,"flavor":"Bypass the security subroutines to peek ahead.","text":"Look at top 3 cards of any deck, put back in any order."},
    {"name":"Covering Fire","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":1,"scramble":2,"flavor":"Keep their eyes on you so Red can maneuver freely.","text":"Every time Red plays a card this turn, draw 1 card."},
    {"name":"Distract & Pivot","set":"proposed","kind":"player","owner":"Gray","rarity":"Cool","cost":2,"oomph":2,"scramble":3,"flavor":"Create a wide opening for Red to land a massive strike.","text":"The next card Red plays this turn costs 1 fewer card to play."},
    {"name":"Pry Bar","set":"proposed","kind":"good_stuff","rarity":"Fine","cost":0,"oomph":3,"flavor":"Simple, solid steel. Good for prying open grates or cracking skulls.","count":3},
    {"name":"Coil Of Cable","set":"proposed","kind":"good_stuff","rarity":"Fine","cost":0,"scramble":3,"flavor":"High-tensile wire. Essential for rigging quick bypasses.","count":3},
    {"name":"Crowbar","set":"proposed","kind":"good_stuff","rarity":"Fine","cost":0,"oomph":1,"scramble":1,"flavor":"Versatile tool that helps pop open supply crates.","text":"Play: If you get any Good Stuff this turn, get 1 additional Good Stuff.","count":3},
    {"name":"Duct Tape & Wire","set":"proposed","kind":"good_stuff","rarity":"Fine","cost":1,"oomph":2,"scramble":2,"flavor":"Quick repairs that surprisingly hold together under pressure.","count":3},
    {"name":"Stim Pack","set":"proposed","kind":"good_stuff","rarity":"Fine","cost":0,"oomph":2,"flavor":"Adrenaline surge to keep moving when stamina is low.","text":"Play: Draw 1 card.","count":3},
    {"name":"Cutting Torch","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":2,"oomph":5,"flavor":"Burns through reinforced bulkheads in seconds.","count":2},
    {"name":"Riot Shield","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":1,"scramble":3,"flavor":"Heavy poly-carb barrier that survives multiple engagements.","text":"If the room is Cleared, return this card to your hand at the end of the turn.","count":2},
    {"name":"Overcharged Battery","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":1,"oomph":2,"scramble":1,"flavor":"Sparks fly as raw current surges through your gear.","text":"The next card played this turn is played for free.","count":2},
    {"name":"A Pair Of Stitch-Em-Ups","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":1,"flavor":"Field-grade medical staples to restore lost Stamina.","text":"Choose a character. Move 2 cards from that character's Exhaust pile to the bottom of their deck.","count":2},
    {"name":"High-Frequency Scanner","set":"proposed","kind":"good_stuff","rarity":"Cool","cost":1,"scramble":3,"flavor":"Pings upcoming hazards before you step into the room.","text":"Play: Look at the top 3 cards of the Floor deck.","count":2},
    {"name":"Grav Harness","set":"proposed","kind":"good_stuff","rarity":"Woah","cost":2,"oomph":3,"scramble":3,"flavor":"Defies local gravity to make heavy obstacles weightless.","text":"One of you draws 1 card."},
    {"name":"Automated Salvage Kit","set":"proposed","kind":"good_stuff","rarity":"Woah","cost":1,"oomph":2,"scramble":2,"flavor":"Converts toxic debris and hazards directly into usable scrap.","text":"Play: Scrap 1 Bad Stuff card from your hand or discard pile."},
    {"name":"Emergency Power Core","set":"proposed","kind":"good_stuff","rarity":"Woah","cost":0,"oomph":3,"scramble":3,"flavor":"Unleashes a massive energy overload at the cost of internal circuit burning.","text":"Exhaust 2."},
    {"name":"Torn Seal","set":"proposed","kind":"bad_stuff","cost":2,"flavor":"Broken rubber gasket. Useless dead weight clogging your pack.","text":null,"count":2},
    {"name":"Sluggish","set":"proposed","kind":"bad_stuff","cost":1,"flavor":"Limb fatigue slows down every movement.","text":"Holding: Cards you play cost +1 card to play.","count":2},
    {"name":"Rust","set":"proposed","kind":"bad_stuff","cost":2,"flavor":"Corrosion degrades the quality of your scavenged gear.","text":"Holding: Stuff cards you play have -1 Oomph and -1 Scramble.","count":2},
    {"name":"Faceful Of Slime","set":"proposed","kind":"bad_stuff","cost":2,"flavor":"Murky goop blinds your vision and slows drawing.","text":"Holding: At Turn Start, draw 1 fewer card.","count":2},
    {"name":"Spore Cloud","set":"proposed","kind":"bad_stuff","cost":2,"flavor":"Choking spores force you to drop excess gear.","text":"Holding: At Cleanup, discard cards other than this one until you hold 3.","count":2},
    {"name":"My Head Is Quantum Spinning","set":"proposed","kind":"bad_stuff","cost":1,"flavor":"Disorientation drains stamina whenever team communication spikes.","text":"Holding: Whenever your partner draws a card during Play, Exhaust 1.","count":2},
    {"name":"Panic","set":"proposed","kind":"bad_stuff","cost":1,"flavor":"Blinding fear raises room difficulty and drains team stamina.","text":"Holding: Every room threshold requires +2 Scramble to be met. Play: Exhaust 2.","count":2},
    {"name":"Corrosive Acid","set":"proposed","kind":"bad_stuff","cost":2,"flavor":"Caustic fluid eats away at your deck stamina and gear.","text":"Holding: At Turn Start, Exhaust 1. Play: Scrap 1 Good Stuff card from your hand.","count":2},
    {"name":"System Feedback","set":"proposed","kind":"bad_stuff","cost":1,"flavor":"Electrical backlash dampens cheap card plays.","text":"Holding: Whenever you play a card with Cost 0, lose 1 Oomph and 1 Scramble from the Stat pool this turn.","count":2},
    {"name":"Security Turnstile","set":"proposed","kind":"room","band":1,"flavor":"A rusted barrier blocks the thoroughfare. You can slip through quietly or tear it off its hinges.","challenges":[{"thresholds":[{"stat":"Scramble","value":3,"outcome":"Clear."}]},{"thresholds":[{"stat":"Oomph","value":5,"outcome":"Clear, and Red gets Good Stuff, but both of you Exhaust 1."}]}],"flee":"Both of you Exhaust 1.","count":3},
    {"name":"Flooded Ventilation Shaft","set":"proposed","kind":"room","band":1,"flavor":"A narrow duct dripping with murky condensation. Red can force the grate while Gray navigates the wiring.","challenges":[{"thresholds":[{"stat":"Scramble","value":4,"outcome":"Clear."}]},{"thresholds":[{"stats":{"Oomph":3,"Scramble":3},"outcome":"Clear, and Gray gets Good Stuff."}]}],"flee":"Gray Exhausts 2.","count":2},
    {"name":"The Sentry Drone","set":"proposed","kind":"stairwell","band":1,"flavor":"An automated defense unit guarding the stairwell. Destroy its chassis or cut its power harness.","challenges":[{"thresholds":[{"stat":"Oomph","value":8,"outcome":"Ascend."}]},{"thresholds":[{"stat":"Scramble","value":8,"outcome":"Ascend, and one of you gets Good Stuff."}]}],"flee":"Both of you Exhaust 1, and Red gets Bad Stuff.","count":3},
    {"name":"Automated Defense Turret","set":"proposed","kind":"room","band":2,"flavor":"A heavy turretted cannon sweeps the corridor. Deactivating its targeting sensors requires precision; smashing it requires brute force.","challenges":[{"thresholds":[{"stat":"Scramble","value":8,"outcome":"Clear, and Gray gets Good Stuff."}]},{"thresholds":[{"stat":"Oomph","value":10,"outcome":"Clear, and one of you may Scrap a Bad Stuff card from your hand."}]}],"flee":"Both of you Exhaust 2, and both of you get Bad Stuff.","count":3},
    {"name":"Pressurized Maintenance Hub","set":"proposed","kind":"room","band":2,"flavor":"High-pressure steam pipes obstruct the gangway. Red must brace the valves while Gray hacks the overrides.","challenges":[{"thresholds":[{"stat":"Oomph","value":7,"outcome":"Clear, and Red reveals a card reward."}]},{"thresholds":[{"stat":"Scramble","value":7,"outcome":"Clear, and Gray reveals a card reward."}]}],"flee":"Both of you Exhaust 2.","count":2},
    {"name":"Overgrown Hydroponics Bay","set":"proposed","kind":"room","band":2,"flavor":"Mutated flora fills the chamber, emitting dense spore clouds.","challenges":[{"thresholds":[{"stat":"Scramble","value":6,"outcome":"Clear, but both of you get Bad Stuff."}]},{"thresholds":[{"stat":"Scramble","value":11,"outcome":"Clear, and both of you get Good Stuff."}]}],"flee":"Both of you Exhaust 2, and Gray gets Bad Stuff.","count":2},
    {"name":"Gears & Glitch","set":"proposed","kind":"stairwell","band":2,"flavor":"A pair of rogue maintenance constructs blocking the stairwell door.","challenges":[{"thresholds":[{"stat":"Oomph","value":12,"outcome":"Ascend."}]},{"thresholds":[{"stats":{"Oomph":7,"Scramble":7},"outcome":"Ascend, and one of you reveals a card reward."}]}],"flee":"Both of you Exhaust 3, and Red gets Bad Stuff.","count":3},
    {"name":"Laser Grid Security Hall","set":"proposed","kind":"room","band":3,"flavor":"Interlocking laser beams cover every inch of the floor. Slip through without touching a beam, or shatter the emitter relay.","challenges":[{"thresholds":[{"stat":"Scramble","value":14,"outcome":"Clear, and Gray reveals a card reward."}]},{"thresholds":[{"stat":"Oomph","value":18,"outcome":"Clear, but both of you Exhaust 2."}]}],"flee":"Both of you Exhaust 4.","count":2},
    {"name":"Bio-Hazard Containment Vault","set":"proposed","kind":"room","band":3,"flavor":"A sealed vault holding experimental equipment. The door control requires an energy surge.","challenges":[{"thresholds":[{"stat":"Oomph","value":15,"outcome":"Clear, and one of you reveals a card reward."}]},{"thresholds":[{"stat":"Scramble","value":15,"outcome":"Clear, and one of you reveals a card reward."}]}],"flee":"Both of you get 2 Bad Stuff, and both of you Exhaust 2.","text":"Players may Scrap Good Stuff cards from their hand during Play to add +3 Oomph or +3 Scramble per card.","count":2},
    {"name":"Smoldering Armory","set":"proposed","kind":"room","band":3,"flavor":"An overheating weapons cache on the verge of exploding.","challenges":[{"thresholds":[{"stat":"Oomph","value":10,"outcome":"Clear, and Red gets Good Stuff."}]},{"thresholds":[{"stat":"Oomph","value":16,"outcome":"Clear; both of you reveal a card reward, and both of you get Good Stuff."}]}],"flee":"Red Exhausts 5.","count":2},
    {"name":"The Iron Sentinel","set":"proposed","kind":"stairwell","band":3,"flavor":"The massive titan guarding the doorway to the upper tower.","challenges":[{"thresholds":[{"stats":{"Oomph":10,"Scramble":10},"outcome":"Ascend, and both of you reveal a card reward."}]},{"thresholds":[{"stat":"Oomph","value":18,"outcome":"Ascend, but both of you Exhaust 3."}]}],"flee":"Both of you Exhaust 4, and both of you get Bad Stuff.","count":3},
    {"name":"The Monolith Core","set":"proposed","kind":"stairwell","band":null,"flavor":"The central nexus at the apex of Pyramid Tower. It radiates crackling energy.","challenges":[{"thresholds":[{"stats":{"Oomph":10,"Scramble":10},"outcome":"Ascend."}]},{"thresholds":[{"stat":"Oomph","value":22,"outcome":"Ascend, but both of you Exhaust 3."}]}],"flee":"Both of you Exhaust 5."}
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
