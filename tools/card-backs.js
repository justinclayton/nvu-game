"use strict";

/* Card backs, one per face-down pile (rulebook, Setup). Shared by
   card-backs.html (the gallery) and card-sheet.html (the duplex sheet). */
var NVU_BACKS = (function () {


/* Centre glyphs, drawn in a 24x24 box; the builder centres them.
   The tower: the stepped pyramid tower, ten tiers, the tier's own floors lit. */
function tower(lo, hi) {
  var out = "";
  for (var f = 1; f <= 10; f++) {
    var w = 22 - (f - 1) * 2.2, y = 21 - (f - 1) * 2.2;
    var lit = f >= lo && f <= hi;
    out += '<rect x="' + ((24 - w) / 2).toFixed(2) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) +
      '" height="2" stroke="currentColor" stroke-width=".5" fill="' + (lit ? "currentColor" : "#fff") + '"/>';
  }
  return out;
}

var GLYPHS = {
  /* Red: three chevrons driving upward. */
  chevrons: '<g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3 21 L12 12 L21 21"/><path d="M3 14 L12 5 L21 14"/></g>' +
    '<path d="M12 -2 L15 3 L9 3 Z" fill="currentColor"/>',
  /* Gray: a scrambling, stepped route with a spark at the end. */
  scramble: '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M2 20 H8 V13 H14 V7 H20 V2"/></g>' +
    '<circle cx="2" cy="20" r="2" fill="currentColor"/><circle cx="21" cy="2" r="2.6" fill="currentColor"/>',
  /* Good Stuff: a four-point sparkle. */
  sparkle: '<path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill="currentColor"/>' +
    "",
  /* Bad Stuff: a jagged burst. */
  burst: '<path d="M12 0 L14.5 8 L22 4 L17 11 L24 13 L16 15 L20 23 L12 17 L4 23 L8 15 L0 13 L7 11 L2 4 L9.5 8 Z" fill="currentColor"/>' +
    '<circle cx="12" cy="12.5" r="2.4" fill="#fff"/>',
  tower1: tower(1, 3), tower2: tower(4, 6), tower3: tower(7, 9), tower4: tower(10, 10)
};

var BACKS = [
  { id: "red", label: "RED", ink: "#b52d24", glyph: "chevrons",
    caption: "Red character deck and Red reward pool." },
  { id: "gray", label: "GRAY", ink: "#5c6169", glyph: "scramble",
    caption: "Gray character deck and Gray reward pool." },
  { id: "good", label: "GOOD STUFF", ink: "#3f8f4a", glyph: "sparkle",
    caption: "Good Stuff pool." },
  { id: "bad", label: "BAD STUFF", ink: "#5a3a6e", glyph: "burst",
    caption: "Bad Stuff pool." },
  { id: "room-1", label: "ROOM", ink: "#2d6a4f", glyph: "tower1", tag: "FLOORS 1\u20133",
    caption: "Floors 1\u20133 tier: its Rooms and Stairwells. One back per tier so a Stairwell hides among Rooms." },
  { id: "room-2", label: "ROOM", ink: "#1d4e89", glyph: "tower2", tag: "FLOORS 4\u20136",
    caption: "Floors 4\u20136 tier." },
  { id: "room-3", label: "ROOM", ink: "#7c2d12", glyph: "tower3", tag: "FLOORS 7\u20139",
    caption: "Floors 7\u20139 tier." },
  { id: "room-4", label: "ROOM", ink: "#b8860b", glyph: "tower4", tag: "FLOOR 10",
    caption: "Floor 10: the one fixed Stairwell." }
];

function wordmark(x, y, rot) {
  return '<text x="' + x + '" y="' + y + '" transform="rotate(' + rot + " " + x + " " + y + ')" ' +
    'font-family="Helvetica Neue, Arial, sans-serif" font-size="2.6" font-weight="700" letter-spacing=".5" ' +
    'fill="currentColor">NORTH <tspan font-weight="400" font-style="italic">vs</tspan> UP</text>';
}

/* White card, one ink: the frame, glyph and words carry the pool's colour. */
function backSVG(b) {
  var tag = b.tag
    ? '<text x="31.5" y="72.5" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="3.6" ' +
      'font-weight="800" fill="currentColor">' + b.tag + "</text>"
    : "";
  return '<svg viewBox="0 0 63 88" xmlns="http://www.w3.org/2000/svg" style="color:' + b.ink + '">' +
    '<rect width="63" height="88" fill="#fff"/>' +
    '<rect x="4" y="4" width="55" height="80" rx="2" fill="none" stroke="currentColor" stroke-width=".7"/>' +
    '<rect x="5.4" y="5.4" width="52.2" height="77.2" rx="1.4" fill="none" stroke="currentColor" stroke-width=".25"/>' +
    wordmark(8, 10.5, 0) + wordmark(55, 77.5, 180) +
    '<circle cx="31.5" cy="40" r="17" fill="none" stroke="currentColor" stroke-width=".5"/>' +
    '<g transform="translate(19.5 28)">' + GLYPHS[b.glyph] + "</g>" +
    '<text x="31.5" y="66" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="5.2" ' +
    'font-weight="800" letter-spacing=".9" fill="currentColor">' + b.label + "</text>" +
    tag +
    "</svg>";
}

/* Which back a face gets. */
function backFor(c) {
  if (c.kind === "room" || c.kind === "stairwell") return c.tier === null ? "room-4" : "room-" + c.tier;
  if (c.kind === "good_stuff") return "good";
  if (c.kind === "bad_stuff") return "bad";
  return c.owner === "Red" ? "red" : "gray";
}

var BY_ID = {};
BACKS.forEach(function (b) { BY_ID[b.id] = b; });

return { BACKS: BACKS, backSVG: backSVG, backFor: backFor, byId: BY_ID };
})();
