#!/usr/bin/env node
/* North vs Up — card list tooling.
 *
 *   node tools/cards.mjs build    regenerate the generated card modules from design/cards.yaml
 *   node tools/cards.mjs check    fail if either is stale or the card sheet stops rendering
 *
 * design/cards.yaml is the source of truth for every card.  Nothing else in the
 * repo may hold a card's name, cost, stats, rarity, or rules text except
 * as a generated copy.  There are two:
 *
 *   tools/cards.js                     untyped, for the printable card sheet
 *   app/src/content/cards.generated.ts typed, for the web game
 *
 * The web game's module is structured, not prose: a room's threshold outcomes
 * and its Flee line are parsed here so nothing in the app ever reads a sentence.
 *
 * No dependencies on purpose: this script and the card sheet beside it run from
 * a bare checkout, and the parser only has to read the one file it owns.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createContext, runInContext } from "node:vm";
import { createHash } from "node:crypto";
import { checkCardComments } from "./check-card-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const YAML = join(ROOT, "design/cards.yaml");
const OUT = join(ROOT, "tools/cards.js");
const OUT_TS = join(ROOT, "app/src/content/cards.generated.ts");
const SETS = new Set(["official", "proposed"]);

/* ------------------------------------------------------------------ parser
   Handles exactly the subset design/cards.yaml uses: a top-level map, one list
   of maps under `cards:`, scalars, `>-` folded blocks, and lists of block maps
   nested to whatever depth a card needs (a room's `challenges:`, each holding
   its own `thresholds:`).  Anything outside that subset is an error, not a
   silent skip. */

function parseScalar(raw) {
  const s = raw.trim();
  if (s === "") return "";
  if (s === "null" || s === "~") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+$/.test(s)) return Number(s);
  if ((s[0] === '"' && s.at(-1) === '"') || (s[0] === "'" && s.at(-1) === "'")) {
    return s.slice(1, -1);
  }
  if (s[0] === "[" && s.at(-1) === "]") {
    return splitFlow(s.slice(1, -1)).map(parseScalar);
  }
  if (s[0] === "{" && s.at(-1) === "}") return parseFlowMap(s);
  return s;
}

/* Split on commas that are not inside quotes or braces. */
function splitFlow(s) {
  const out = [];
  let buf = "", depth = 0, quote = null;
  for (const ch of s) {
    if (quote) {
      if (ch === quote) quote = null;
      buf += ch;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
    if (ch === "{" || ch === "[") depth++;
    if (ch === "}" || ch === "]") depth--;
    if (ch === "," && depth === 0) { out.push(buf); buf = ""; continue; }
    buf += ch;
  }
  if (buf.trim() !== "") out.push(buf);
  return out.map((x) => x.trim());
}

function parseFlowMap(s) {
  const obj = {};
  for (const pair of splitFlow(s.trim().slice(1, -1))) {
    const i = pair.indexOf(":");
    if (i === -1) throw new Error(`bad flow map entry: ${pair}`);
    obj[pair.slice(0, i).trim()] = parseScalar(pair.slice(i + 1));
  }
  return obj;
}

function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) { if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === "#" && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}

/* The line-level helpers below all work off the raw (not comment-stripped)
   line, since a folded block's own indent check needs the untouched line and
   nothing else here cares about the distinction. */

const isBlank = (rawLine) => stripComment(rawLine).trim() === "";
const indentOf = (rawLine) => rawLine.length - rawLine.trimStart().length;
const KEY_LINE = /^([A-Za-z_]+):\s*(.*)$/;

/** A folded block scalar (`>-`, `>`, `|`, `|-`): every line indented past
 * `ownerIndent`, blank lines included, joined into one whitespace-normalised
 * string. Returns the text and the index of the line that ended it. */
function parseFold(rawLines, i, ownerIndent) {
  const parts = [];
  while (i < rawLines.length) {
    const rawLine = rawLines[i];
    if (rawLine.trim() === "") { parts.push(""); i++; continue; }
    if (indentOf(rawLine) > ownerIndent) { parts.push(rawLine.trim()); i++; continue; }
    break;
  }
  return [parts.join(" ").replace(/\s+/g, " ").trim(), i];
}

/** A value that reads as `key:` with nothing after it: the nested list it
 * introduces, indented on the lines that follow. `challenges:` and a
 * challenge's own `thresholds:` both take this shape. */
function parseNestedList(rawLines, i, ownerIndent, key) {
  let j = i;
  while (j < rawLines.length && isBlank(rawLines[j])) j++;
  if (j >= rawLines.length || indentOf(rawLines[j]) <= ownerIndent || !stripComment(rawLines[j]).trim().startsWith("- ")) {
    throw new Error(`line ${i + 1}: expected a nested list after "${key}:"`);
  }
  return parseListEntries(rawLines, j, indentOf(rawLines[j]));
}

/** One value on the right of `key:`, whatever shape it takes. */
function parseValue(rawLines, i, entryIndent, key, rawValue) {
  if (rawValue === ">-" || rawValue === ">" || rawValue === "|" || rawValue === "|-") {
    return parseFold(rawLines, i, entryIndent);
  }
  if (rawValue === "") return parseNestedList(rawLines, i, entryIndent, key);
  return [parseScalar(rawValue), i];
}

/** Every `key: value` line at exactly `entryIndent`, filled into `obj`, until
 * the indent drops (the map's own end). */
function parseMapEntries(rawLines, i, entryIndent, obj) {
  while (i < rawLines.length) {
    if (isBlank(rawLines[i])) { i++; continue; }
    if (indentOf(rawLines[i]) !== entryIndent) break;
    const t = stripComment(rawLines[i]).trim();
    const m = t.match(KEY_LINE);
    if (!m) throw new Error(`line ${i + 1}: unparsed line: ${t}`);
    const [value, next] = parseValue(rawLines, i + 1, entryIndent, m[1], m[2]);
    obj[m[1]] = value;
    i = next;
  }
  return i;
}

/** A sequence of `- ...` items at exactly `itemIndent`: each is a block map
 * (its first key inline after the dash, more keys indented to match) or,
 * failing that, a bare scalar. */
function parseListEntries(rawLines, i, itemIndent) {
  const arr = [];
  while (i < rawLines.length) {
    if (isBlank(rawLines[i])) { i++; continue; }
    if (indentOf(rawLines[i]) !== itemIndent) break;
    const t = stripComment(rawLines[i]).trim();
    if (!t.startsWith("- ")) break;
    const rest = t.slice(2);
    const m = rest.match(KEY_LINE);
    if (!m) { arr.push(parseScalar(rest)); i++; continue; }
    const entryIndent = itemIndent + 2;
    const item = {};
    const [value, next] = parseValue(rawLines, i + 1, entryIndent, m[1], m[2]);
    item[m[1]] = value;
    i = parseMapEntries(rawLines, next, entryIndent, item);
    arr.push(item);
  }
  return [arr, i];
}

/** One card: a `- key: value` line at indent 2, plus whatever `key: value`
 * lines follow it at indent 4 — including nested lists such as `challenges`. */
function parseCardBlock(rawLines, i) {
  const dashIndent = indentOf(rawLines[i]);
  const t = stripComment(rawLines[i]).trim();
  const m = t.slice(2).match(KEY_LINE);
  if (!m) throw new Error(`line ${i + 1}: a card must start with a key: ${t}`);
  const entryIndent = dashIndent + 2;
  const card = {};
  const [value, next] = parseValue(rawLines, i + 1, entryIndent, m[1], m[2]);
  card[m[1]] = value;
  return [card, parseMapEntries(rawLines, next, entryIndent, card)];
}

export function parseCardsYaml(text) {
  const rawLines = text.split("\n");
  const doc = { meta: {}, cards: [] };
  let section = null;
  let i = 0;

  while (i < rawLines.length) {
    if (isBlank(rawLines[i]) || stripComment(rawLines[i]).trim() === "---") { i++; continue; }
    const indent = indentOf(rawLines[i]);
    const t = stripComment(rawLines[i]).trim();

    if (indent === 0) {
      const m = t.match(KEY_LINE);
      if (!m) throw new Error(`line ${i + 1}: unexpected top-level content: ${t}`);
      section = m[1];
      i++;
      if (section === "cards" || section === "meta") continue;
      throw new Error(`line ${i}: unknown top-level key: ${section}`);
    }

    if (section === "meta") {
      const m = t.match(KEY_LINE);
      if (!m) throw new Error(`line ${i + 1}: bad meta entry: ${t}`);
      doc.meta[m[1]] = parseScalar(m[2]);
      i++;
      continue;
    }

    if (section !== "cards") throw new Error(`line ${i + 1}: content outside a known section`);
    if (indent !== 2 || !t.startsWith("- ")) {
      throw new Error(`line ${i + 1}: expected a new card here: ${t}`);
    }
    const [card, next] = parseCardBlock(rawLines, i);
    doc.cards.push(card);
    i = next;
  }
  return doc;
}

/* ------------------------------------------------------------------- build */

const FIELD_ORDER = [
  "name", "set", "kind", "owner", "starter", "rarity",
  "rarity_status", "cost", "oomph", "scramble", "conditional_stat",
  "band", "flavor", "challenges", "flee", "text", "note", "flagged",
];

function ordered(card) {
  const out = {};
  for (const k of FIELD_ORDER) if (k in card) out[k] = card[k];
  for (const k of Object.keys(card)) if (!(k in out)) out[k] = card[k];
  return out;
}

function generate(doc) {
  const body = doc.cards.map((c) => "    " + JSON.stringify(ordered(c))).join(",\n");
  return `/* GENERATED FILE — DO NOT EDIT.
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
  meta: ${JSON.stringify(doc.meta)},
  cards: [
${body}
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
`;
}

/* ------------------------------------------------- the printed prose, parsed
   A room prints its threshold outcomes and its Flee line as sentences.  The web
   game never reads a sentence, so the shapes the card list actually prints are
   turned into structure here.  Anything this does not recognise is an error,
   not a silently dropped rule.

   Rulebook, Card anatomy: Room Cards: a threshold or a Flee line resolves the same way whether
   it is printed on a Room or a Stairwell. Kind only decides which pool a card is drawn from and,
   for a Stairwell, that it is the one card in the floor that can print `Ascend` (setup.ts). */

const CARD_KINDS = new Set(["player", "good_stuff", "bad_stuff"]);
const ROOM_KINDS = new Set(["room", "stairwell"]);

/** The text shown when a room with no printed Flee line of its own is fled
 * without meeting a threshold. It has no effect and, like any other Flee,
 * does not clear the room. */
const NO_FLEE_PRINTED = "Leave empty-handed.";

function who(word) {
  const w = word.trim().toLowerCase();
  if (w === "both players" || w === "both") return "both";
  if (w === "one of you" || w === "one") return "one";
  if (w === "red") return "Red";
  if (w === "gray") return "Gray";
  throw new Error(`unrecognised target: "${word}"`);
}

/* Each entry reads one clause. `clears`, `ascends`, and `fleeFree` are flags
   the clause raises; `effect` is what it does. */
const CLAUSES = [
  [/^(?:and )?ascend$/i, () => ({ clears: true, ascends: true })],
  [/^you win$/i, () => ({ clears: true, ascends: true })],
  [/^(?:and )?clear(?: the room)?$/i, () => ({ clears: true })],
  [/^(?:and )?flee this room for free$/i, () => ({ fleeFree: true })],
  [/^(?:and )?leave empty-handed$/i, () => ({})],
  [
    /^(both players|one of you|red|gray) exhausts? (\d+)$/i,
    (m) => ({ effect: { type: "ExhaustFromDeck", who: who(m[1]), amount: Number(m[2]) } }),
  ],
  [
    /^(both players|one of you|red|gray) (?:gets?|takes?) (?:(\d+) )?bad stuff$/i,
    (m) => ({ effect: { type: "DealBadStuff", who: who(m[1]), count: Number(m[2] ?? 1) } }),
  ],
  [
    /^(both players|one of you|red|gray) (?:gets?|takes?) (?:(\d+) )?good stuff$/i,
    (m) => ({ effect: { type: "TakeGoodStuff", who: who(m[1]), count: Number(m[2] ?? 1) } }),
  ],
  [
    /^(both players|one of you|red|gray) reveals? (?:a |the )?(?:card )?reward$/i,
    (m) => ({ effect: { type: "RevealReward", who: who(m[1]) } }),
  ],
  [
    /^(both players|one of you|red|gray) may scrap a bad stuff card from (?:your|their) hand$/i,
    (m) => ({ effect: { type: "ScrapBadStuffFromHand", who: who(m[1]), optional: true } }),
  ],
];

/** Split printed prose into clauses: on full stops, commas, and a joining "and". */
function clausesOf(prose) {
  return prose
    .split(/[.;!]|,\s*(?:and\s+)?|\s+and\s+/i)
    .map((c) => c.replace(/^\s*but\s+/i, "").trim())
    .filter((c) => c !== "");
}

function readProse(prose, where) {
  const out = { clears: false, ascends: false, fleeFree: false, effects: [] };
  for (const clause of clausesOf(prose)) {
    const hit = CLAUSES.find(([re]) => re.test(clause));
    if (!hit) throw new Error(`${where}: unparsed clause "${clause}" in "${prose}"`);
    const read = hit[1](clause.match(hit[0]));
    if (read.clears) out.clears = true;
    if (read.ascends) out.ascends = true;
    if (read.fleeFree) out.fleeFree = true;
    if (read.effect) out.effects.push(read.effect);
  }
  return out;
}

/** A threshold's `stat`/`value` pair, or its `stats: { Oomph, Scramble }` pair, read
 * into one shape: how much of each stat the line asks of the pool (0 for neither). */
function requirementsOf(raw, where) {
  if (raw && raw.stats && typeof raw.stats === "object") {
    const { Oomph, Scramble } = raw.stats;
    if (typeof Oomph !== "number" && typeof Scramble !== "number") {
      throw new Error(`${where}: stats needs an Oomph or Scramble number`);
    }
    return { oomph: Oomph ?? 0, scramble: Scramble ?? 0 };
  }
  if (raw && typeof raw.value === "number" && raw.stat === "Oomph") return { oomph: raw.value, scramble: 0 };
  if (raw && typeof raw.value === "number" && raw.stat === "Scramble") return { oomph: 0, scramble: raw.value };
  throw new Error(`${where}: a threshold needs a Oomph or Scramble stat and a value, or a stats: { Oomph, Scramble } pair`);
}

function threshold(raw, where) {
  const requires = requirementsOf(raw, where);
  const outcome = String(raw.outcome ?? "");
  const read = readProse(outcome, `${where} threshold "${outcome}"`);
  return {
    requires,
    outcome,
    // Each Turn, Outcome: any met threshold Clears the room, full stop — a line's own
    // prose need not say "Clear" (most Stuff lines never do). The one exception a line
    // can print for itself is "Flee this room for free", which does not.
    clears: !read.fleeFree,
    fleeFree: read.fleeFree,
    ascends: read.ascends,
    effects: read.effects,
  };
}

function fleeLine(card) {
  if (!card.flee) return { text: NO_FLEE_PRINTED, clears: false, effects: [] };
  const read = readProse(card.flee, `${card.name} Flee line`);
  return { text: card.flee, clears: read.clears, effects: read.effects };
}

function cardFace(c) {
  return {
    name: c.name,
    set: c.set,
    kind: c.kind,
    owner: c.owner ?? null,
    rarity: c.rarity ?? null,
    starter: c.starter === true,
    count: c.count ?? 1,
    cost: c.cost ?? 0,
    oomph: c.oomph ?? 0,
    scramble: c.scramble ?? 0,
    conditionalStat: c.conditional_stat === true,
    text: c.text ?? "",
    flavor: c.flavor ?? "",
  };
}

function challenge(raw, where) {
  const thresholds = (raw?.thresholds ?? []).map((t) => threshold(t, where));
  if (thresholds.length === 0) throw new Error(`${where}: a challenge needs at least one threshold`);
  return { thresholds };
}

function roomFace(c) {
  const challenges = (c.challenges ?? []).map((ch) => challenge(ch, c.name));
  if (challenges.length === 0) throw new Error(`${c.name}: a room prints at least one challenge`);
  if (c.band !== 1 && c.band !== 2 && c.band !== 3 && c.band !== null) {
    throw new Error(`${c.name}: a room needs a band of 1, 2, 3, or null for the fixed Floor 10 Stairwell`);
  }
  if (c.band === null && c.kind !== "stairwell") {
    throw new Error(`${c.name}: only a Stairwell may print band: null`);
  }
  return {
    name: c.name,
    set: c.set,
    kind: c.kind,
    band: c.band,
    flavor: c.flavor ?? "",
    text: c.text ?? "",
    count: c.count ?? 1,
    challenges,
    flee: fleeLine(c),
  };
}

/** The whole card list, in the shape app/src/domain/printed.ts describes. */
export function structure(doc) {
  const cards = [];
  const rooms = [];
  for (const c of doc.cards) {
    if (CARD_KINDS.has(c.kind)) cards.push(cardFace(c));
    else if (ROOM_KINDS.has(c.kind)) rooms.push(roomFace(c));
    else throw new Error(`${c.name}: unknown kind ${JSON.stringify(c.kind)}`);
  }
  const fixedStairwells = rooms.filter((r) => r.band === null);
  if (fixedStairwells.length !== 1) {
    throw new Error(
      `expected exactly one Floor 10 Stairwell (band: null), found ${fixedStairwells.length}`,
    );
  }
  return { meta: { updated: String(doc.meta.updated ?? "") }, cards, rooms };
}

/* ------------------------------------------------------- the typed TS module */

/** The first 12 hex of sha256 over the JSON of the structured content — a stable
 * id for exactly this card list, independent of source formatting. */
function cardListId(content) {
  return createHash("sha256").update(JSON.stringify(content)).digest("hex").slice(0, 12);
}

export function generateTs(doc) {
  const content = structure(doc);
  const cardsBody = content.cards.map((c) => "    " + JSON.stringify(c)).join(",\n");
  const roomsBody = content.rooms.map((r) => "    " + JSON.stringify(r)).join(",\n");
  return `/* GENERATED FILE — DO NOT EDIT.
 *
 * Source: design/cards.yaml       Regenerate: node tools/cards.mjs build
 * Check:  node tools/cards.mjs check
 *
 * Every card in North vs Up, as printed, with each room's threshold outcomes and
 * Flee line already parsed into structure.  Data, not rules: this module knows
 * what a card says and nothing about what the engine does with it.
 *
 * EVERY NUMBER IS A PLACEHOLDER — costs, stats and thresholds are still open
 * design (design/rulebook.md, "NOT YET RULED").
 */

import type { CardContent } from "../domain/printed";

export const CARD_CONTENT = {
  meta: ${JSON.stringify(content.meta)},
  cards: [
${cardsBody}
  ],
  rooms: [
${roomsBody}
  ],
} as const satisfies CardContent;

/** The first 12 hex of sha256 over the JSON of CARD_CONTENT above — identifies this card list. */
export const CARD_LIST_ID = ${JSON.stringify(cardListId(content))};
`;
}

/* ------------------------------------------------------------------- check */

function checkSchema(doc) {
  const problems = [];
  const names = new Set();
  for (const c of doc.cards) {
    if (!c.name) problems.push("a card is missing a name");
    else if (names.has(c.name)) problems.push(`duplicate card name: ${c.name}`);
    else names.add(c.name);
    if (!SETS.has(c.set)) {
      problems.push(`${c.name || "?"}: set must be official|proposed, got ${JSON.stringify(c.set)}`);
    }
    if (!c.kind) problems.push(`${c.name || "?"}: missing kind`);
  }
  return problems;
}

/* ------------------------------------------------- the card sheet renders
   The sheet is a view of the card list, so "does it still print every card"
   is part of checking the list. Its script is run against a DOM stub and
   asked how many cards it put on the page. */

function stubEl() {
  return {
    value: "", checked: false, textContent: "", innerHTML: "", style: {}, type: "",
    addEventListener() { }, appendChild() { }, querySelectorAll: () => [],
    insertAdjacentHTML(_, v) { this.innerHTML = v + this.innerHTML; },
    classList: { add() { }, remove() { }, toggle() { } },
  };
}

function baseContext(cardsJs) {
  const store = {};
  const ctx = {
    console: { log() { }, warn() { }, error() { } },
    Math, JSON, Date, parseInt, parseFloat, isNaN,
    String, Number, Array, Object, Boolean, setTimeout,
    localStorage: { getItem: () => null, setItem() { } },
    document: {
      getElementById: (id) => (store[id] = store[id] || stubEl()),
      querySelector: stubEl, createElement: stubEl,
      querySelectorAll: () => [], body: stubEl(), addEventListener() { },
    },
  };
  ctx.window = ctx;
  createContext(ctx);
  runInContext(cardsJs, ctx);
  return { ctx, store };
}

function checkRenders(doc, cardsJs) {
  const problems = [];
  const totalWithCopies = doc.cards.reduce((sum, c) => sum + (c.count || 1), 0);

  try {
    const sheet = readFileSync(join(ROOT, "tools/card-sheet.html"), "utf8");
    const { ctx, store } = baseContext(cardsJs);
    runInContext(sheet.match(/<script>\n"use strict";([\s\S]*?)<\/script>/)[1], ctx);
    const html = store.sheets.innerHTML;
    const drawn = (html.match(/class="card /g) || []).length;
    if (drawn !== totalWithCopies) {
      problems.push(`tools/card-sheet.html renders ${drawn} cards, not ${totalWithCopies}`);
    }
  } catch (e) {
    problems.push(`tools/card-sheet.html failed to render: ${e.message}`);
  }
  return problems;
}

/* ---------------------------------------------------------------------- main */

const doc = parseCardsYaml(readFileSync(YAML, "utf8"));
const cmd = process.argv[2] || "build";

if (cmd === "build") {
  writeFileSync(OUT, generate(doc));
  writeFileSync(OUT_TS, generateTs(doc));
  const { cards, rooms } = structure(doc);
  console.log(
    `wrote tools/cards.js and app/src/content/cards.generated.ts — ` +
    `${cards.length} cards and ${rooms.length} rooms`,
  );
} else if (cmd === "check") {
  const problems = [];
  problems.push(...checkSchema(doc));
  const want = generate(doc);
  let have = "";
  try { have = readFileSync(OUT, "utf8"); } catch { /* missing counts as stale */ }
  if (have !== want) problems.push("tools/cards.js is stale — run: node tools/cards.mjs build");

  const wantTs = generateTs(doc);
  let haveTs = "";
  try { haveTs = readFileSync(OUT_TS, "utf8"); } catch { /* missing counts as stale */ }
  if (haveTs !== wantTs) {
    problems.push("app/src/content/cards.generated.ts is stale — run: node tools/cards.mjs build");
  }

  problems.push(...checkRenders(doc, want));
  problems.push(...checkCardComments());

  if (problems.length) {
    console.error(`card list has drifted — ${problems.length} problem(s):\n`);
    for (const p of problems) console.error("  " + p);
    process.exit(1);
  }
  console.log(`no drift — ${doc.cards.length} cards agree across cards.yaml and cards.js,
and the card sheet prints every copy of all ${doc.cards.length}`);
} else {
  console.error("usage: node tools/cards.mjs [build|check]");
  process.exit(2);
}
