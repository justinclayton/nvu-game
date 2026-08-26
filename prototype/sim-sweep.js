#!/usr/bin/env node
/* Headless driver for encounter-sim.html.
 *
 * The HTML simulator is the instrument; this runs its engine without a browser so
 * a whole parameter sweep can be done in one go. It loads the <script> block out of
 * the HTML into a VM with a stubbed DOM, so there is exactly one engine — edit the
 * HTML and this follows automatically.
 *
 *   node prototype/sim-sweep.js
 *
 * Prints the sweeps that ticket 10 was answered from. Edit SWEEPS at the bottom to
 * ask something else.
 */
"use strict";
var fs = require("fs"), vm = require("vm"), path = require("path");

var HTML = path.join(__dirname, "encounter-sim.html");

function loadEngine() {
  var src = fs.readFileSync(HTML, "utf8").match(/<script>([\s\S]*)<\/script>/)[1];
  var stub = function () {
    return { value:"", checked:false, textContent:"", innerHTML:"", style:{}, type:"",
             addEventListener:function(){}, appendChild:function(){},
             querySelectorAll:function(){return [];},
             classList:{ add:function(){}, remove:function(){}, toggle:function(){} } };
  };
  var ctx = { console:console, Math:Math, JSON:JSON, Date:Date, parseInt:parseInt,
              parseFloat:parseFloat, isNaN:isNaN, String:String, Number:Number,
              Array:Array, Object:Object, setTimeout:setTimeout };
  ctx.localStorage = { getItem:function(){return null;}, setItem:function(){} };
  ctx.document = { getElementById:stub, querySelector:stub, createElement:stub,
                   querySelectorAll:function(){return [];}, body:stub(),
                   addEventListener:function(){} };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return ctx;
}

var E = loadEngine();
function mean(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }

/* How many cards in this deck carry a raw stat at all? Ticket 11's failure mode is
   a hand of modifiers with nothing to modify, so this is the number that shows it. */
function statDensity(deck) {
  var k = 0;
  deck.forEach(function (x) { if ((x.def.power || 0) > 0 || (x.def.scramble || 0) > 0) k++; });
  return { n: deck.length, k: k };
}
/* P(at least one stat card in a hand of h), hypergeometric. */
function pStatInHand(n, k, h) {
  if (n === 0) return 0;
  if (h > n) h = n;
  var p = 1;
  for (var i = 0; i < h; i++) p *= (n - k - i) / (n - i);
  return 1 - p;
}

/* Run N ten-floor runs at one configuration and return everything measured. */
function run(cfg, policy, N, floors) {
  N = N || 600; floors = floors || 10;
  Object.keys(cfg).forEach(function (k) { E.CFG[k] = cfg[k]; });
  var opts = { turnCap: 120, greed: "afford", chaseStuff: true, holdStuff: false, verbose: false };
  Object.keys(policy || {}).forEach(function (k) { opts[k] = policy[k]; });

  var a = { runs:N, fullRuns:0, lostOn:[], wiped:0, stalled:0,
            perFloor:[], turns:[], charTurns:0, overCap:0, lsTurns:0, lsExits:0,
            flees:0, waits:[], reshuffles:0, stuffTaken:0, stuffMissed:0,
            deckAt:{}, densAt:{}, handStat:{}, lostEnemyFled:0 };
  for (var f = 0; f < floors; f++) { a.perFloor.push({ played:0, won:0 }); a.turns.push([]); }

  for (var r = 0; r < N; r++) {
    var chars = { Red: E.newChar("Red"), Gray: E.newChar("Gray") }, alive = true;
    for (var fl = 1; fl <= floors && alive; fl++) {
      var g = E.runFloorAuto(fl, chars, E.goodStuffPool(), opts);
      var pf = a.perFloor[fl - 1]; pf.played++;
      a.turns[fl - 1].push(g.stats.turns);
      a.charTurns += g.stats.charTurns; a.overCap += g.stats.overCapTurns;
      a.lsTurns += g.stats.lastStandTurns; a.lsExits += g.stats.lastStandExits;
      a.flees += g.stats.enemyFlees; a.waits = a.waits.concat(g.stats.enemyWaitTurns);
      a.reshuffles += g.stats.reshuffles;
      a.stuffTaken += g.stats.stuffTaken; a.stuffMissed += g.stats.stuffMissed;
      if (g.over === "won") {
        pf.won++; E.ascend(chars);
        ["Red", "Gray"].forEach(function (nm) {
          var d = statDensity(chars[nm].deck), key = fl + 1;
          (a.deckAt[key]   = a.deckAt[key]   || []).push(d.n);
          (a.densAt[key]   = a.densAt[key]   || []).push(d.n ? d.k / d.n : 0);
          (a.handStat[key] = a.handStat[key] || []).push(pStatInHand(d.n, d.k, E.CFG.capN));
        });
      } else {
        alive = false; a.lostOn.push(fl);
        g.over === "wiped" ? a.wiped++ : a.stalled++;
        if (g.fled.some(function (x) { return x.def.kind === "Enemy"; })) a.lostEnemyFled++;
      }
    }
    if (alive) a.fullRuns++;
  }
  return a;
}

function clearPct(a) { return (100 * a.fullRuns / a.runs).toFixed(1); }
function floorWins(a) {
  return a.perFloor.map(function (p) {
    return (p.played ? (100 * p.won / p.played).toFixed(0) : "-").padStart(4);
  }).join("");
}

/* ---------------------------------------------------------------- sweeps */

function sweepDifficulty() {
  console.log("\n=== what actually carries the difficulty curve ===");
  console.log("config".padEnd(24) + "clear%  | win% per floor given reached (f1..f10)");
  [[0, 0], [0, 2], [0.5, 0], [0.5, 2], [1, 0], [1, 2]].forEach(function (p) {
    var a = run({ deckRed:12, deckGray:12, enemyPow:5, enemyPowStep:p[0], stuffTop:p[1] }, {});
    console.log(("enemyPow +" + p[0] + "/floor, top=" + p[1]).padEnd(24) +
                clearPct(a).padStart(6) + "  |" + floorWins(a));
  });
}

function sweepDeckSize() {
  console.log("\n=== starting deck size (enemyPow 5 +0.5/floor, stuffTop 2) ===");
  console.log("deck  clear%   f10 win% given reached");
  [6, 8, 10, 12, 15, 18, 24].forEach(function (d) {
    var a = run({ deckRed:d, deckGray:d, enemyPow:5, enemyPowStep:0.5, stuffTop:2 }, {});
    var p = a.perFloor[9];
    console.log(String(d).padStart(4) + clearPct(a).padStart(8) +
                (p.played ? (100 * p.won / p.played).toFixed(0) : "-").padStart(24));
  });
}

function sweepPolicy() {
  console.log("\n=== is any single line dominant? (deck 12, flat enemyPow 5) ===");
  console.log("draw policy  chaseStuff  hoardStuff  clear%  Stuff taken/run");
  ["afford", "min", "max"].forEach(function (greed) {
    [true, false].forEach(function (chase) {
      [false, true].forEach(function (hoard) {
        var a = run({ deckRed:12, deckGray:12, enemyPow:5, enemyPowStep:0, stuffTop:0 },
                    { greed:greed, chaseStuff:chase, holdStuff:hoard });
        console.log(greed.padEnd(13) + String(chase).padEnd(12) + String(hoard).padEnd(12) +
                    clearPct(a).padStart(6) + (a.stuffTaken / a.runs).toFixed(1).padStart(17));
      });
    });
  });
}

function sweepDeckGrowth() {
  console.log("\n=== deck growth and stat density across a run ===");
  var a = run({ deckRed:12, deckGray:12, enemyPow:5, enemyPowStep:0.5, stuffTop:2 }, {});
  console.log("entering floor  mean deck  stat density  P(stat in a full hand)");
  for (var f = 2; f <= 10; f++) {
    if (!a.deckAt[f]) continue;
    console.log(String(f).padStart(14) + mean(a.deckAt[f]).toFixed(1).padStart(11) +
                mean(a.densAt[f]).toFixed(3).padStart(14) +
                mean(a.handStat[f]).toFixed(3).padStart(24));
  }
}

function sweepPressure() {
  console.log("\n=== loss mode, last stand, and the reshuffle ===");
  [[0, 0], [0.5, 2], [1, 2]].forEach(function (p) {
    var a = run({ deckRed:12, deckGray:12, enemyPow:5, enemyPowStep:p[0], stuffTop:p[1] }, {});
    console.log(("+" + p[0] + "/floor, top=" + p[1]).padEnd(18) +
      "clear% " + clearPct(a) +
      " · wiped " + a.wiped + " stalled " + a.stalled +
      " · last stand " + (100 * a.lsTurns / a.charTurns).toFixed(1) + "% of turns" +
      " · Enemy flees/run " + (a.flees / a.runs).toFixed(1) +
      " · wait to meet it again mean " + mean(a.waits).toFixed(1) +
      " max " + (a.waits.length ? Math.max.apply(null, a.waits) : 0) +
      " · hand cap bound on " + (100 * a.overCap / a.charTurns).toFixed(1) + "% of turns");
  });
}

sweepDifficulty();
sweepDeckSize();
sweepPolicy();
sweepDeckGrowth();
sweepPressure();
