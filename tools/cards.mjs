#!/usr/bin/env node
/* North vs Up — card list tooling.  Ticket 25.
 *
 *   node tools/cards.mjs build    regenerate prototype/cards.js from design/cards.yaml
 *   node tools/cards.mjs check    fail if cards.js, or either prose file, has drifted
 *
 * design/cards.yaml is the source of truth for every card.  Nothing else in the
 * repo may hold a card's name, cost, stats, rarity, Hold, or rules text except
 * as a generated copy (prototype/cards.js) or a checked copy (the prose files).
 *
 * No dependencies on purpose: this is a paper-prototype repo with no package.json,
 * and the parser only has to read the one file it owns.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createContext, runInContext } from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const YAML = join(ROOT, "design/cards.yaml");
const OUT = join(ROOT, "prototype/cards.js");
const PROSE = [
  join(ROOT, "design/core-design/prototypes/12-exemplar-card-set.md"),
  join(ROOT, "design/core-design/prototypes/12-card-bank.md"),
];

/* ------------------------------------------------------------------ parser
   Handles exactly the subset design/cards.yaml uses: a top-level map, one list
   of maps under `cards:`, scalars, `>-` folded blocks, and flow maps in a
   nested list.  Anything outside that subset is an error, not a silent skip. */

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

export function parseCardsYaml(text) {
  const lines = text.split("\n");
  const doc = { meta: {}, cards: [] };
  let card = null, section = null;
  let fold = null; // {target, key, indent, parts}

  const flushFold = () => {
    if (!fold) return;
    fold.target[fold.key] = fold.parts.join(" ").replace(/\s+/g, " ").trim();
    fold = null;
  };

  for (let n = 0; n < lines.length; n++) {
    const rawLine = lines[n];
    const indent = rawLine.length - rawLine.trimStart().length;

    if (fold) {
      if (rawLine.trim() === "") { fold.parts.push(""); continue; }
      if (indent > fold.indent) { fold.parts.push(rawLine.trim()); continue; }
      flushFold();
    }

    const line = stripComment(rawLine);
    const t = line.trim();
    if (t === "" || t === "---") continue;

    // top-level keys
    if (indent === 0) {
      const m = t.match(/^([A-Za-z_]+):\s*(.*)$/);
      if (!m) throw new Error(`line ${n + 1}: unexpected top-level content: ${t}`);
      section = m[1];
      if (section === "cards") { card = null; continue; }
      if (section === "meta") continue;
      throw new Error(`line ${n + 1}: unknown top-level key: ${section}`);
    }

    if (section === "meta") {
      const m = t.match(/^([A-Za-z_]+):\s*(.*)$/);
      if (!m) throw new Error(`line ${n + 1}: bad meta entry: ${t}`);
      doc.meta[m[1]] = parseScalar(m[2]);
      continue;
    }

    if (section !== "cards") throw new Error(`line ${n + 1}: content outside a known section`);

    // a new card
    if (t.startsWith("- ")) {
      const rest = t.slice(2);
      if (indent === 2) {
        card = {};
        doc.cards.push(card);
        const m = rest.match(/^([A-Za-z_]+):\s*(.*)$/);
        if (!m) throw new Error(`line ${n + 1}: a card must start with a key: ${t}`);
        card[m[1]] = parseScalar(m[2]);
        continue;
      }
      // an item of a nested list (thresholds)
      const key = card && card.__list;
      if (!key) throw new Error(`line ${n + 1}: nested list item with no list key`);
      card[key].push(parseScalar(rest));
      continue;
    }

    const m = t.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!m) throw new Error(`line ${n + 1}: unparsed line: ${t}`);
    const [, key, value] = m;
    if (!card) throw new Error(`line ${n + 1}: key outside a card: ${t}`);

    if (value === ">-" || value === ">" || value === "|" || value === "|-") {
      fold = { target: card, key, indent, parts: [] };
      continue;
    }
    if (value === "") { card.__list = key; card[key] = []; continue; }
    card[key] = parseScalar(value);
  }
  flushFold();
  for (const c of doc.cards) delete c.__list;
  return doc;
}

/* ------------------------------------------------------------------- build */

const FIELD_ORDER = [
  "name", "set", "kind", "owner", "starter", "starter_status", "rarity",
  "rarity_status", "cost", "power", "scramble", "conditional_stat", "hold",
  "thresholds", "flee", "text", "note", "flagged",
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
 * costs, stats and thresholds belong to ticket 10.
 *
 * Loaded by prototype/card-sheet.html (the cutting sheet) and
 * prototype/encounter-sim.html (the simulator) with a plain <script> tag, so
 * both keep working from file:// with no build step and no server.
 */
var NVU_CARDS = {
  meta: ${JSON.stringify(doc.meta)},
  cards: [
${body}
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
`;
}

/* ------------------------------------------------------------------- check
   The prose files are hand-written, because they carry the design reasoning
   this ticket deliberately kept out of the YAML.  What they must not do is
   disagree with it, so their card lines are parsed back and compared. */

const STAT_WORDS = /\*\*(Power|Scramble)\s+(\d+)(?:,\s*(Power|Scramble)\s+(\d+))?\*\*/;

function proseCards(text) {
  const found = [];
  const lines = text.split("\n");
  /* A section heading may set the rarity for every card under it, which is how
     the starters are written: "### Red — starters (`Fine`, near-pure stats)". */
  let sectionRarity;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const section = line.match(/^###\s+\w+\s+—\s+starters\s+\(`(Fine|Cool|Woah)`/);
    if (section) { sectionRarity = section[1]; continue; }
    if (/^##\s/.test(line)) sectionRarity = undefined;
    // "### Name · owner · `Rarity` · `Cost 0` · ..." or "**Name** · owner · ..."
    let m = line.match(/^###\s+(.+?)\s+·\s+(.*)$/) || line.match(/^\*\*(.+?)\*\*\s+·\s+(.*)$/);
    if (!m) continue;
    const [, name, rest] = m;
    if (!/`Cost/.test(rest) && !/\(cost unset\)/.test(rest)) continue;
    const card = { name: name.replace(/`/g, "").trim(), line: i + 1 };
    const cost = rest.match(/`Cost\s+(\d+)`/);
    if (cost) card.cost = Number(cost[1]);
    const rar = rest.match(/`(Fine|Cool|Woah)`/);
    if (rar) card.rarity = rar[1];
    else if (sectionRarity) card.rarity = sectionRarity;
    const stat = rest.match(STAT_WORDS);
    if (stat) {
      card[stat[1].toLowerCase()] = Number(stat[2]);
      if (stat[3]) card[stat[3].toLowerCase()] = Number(stat[4]);
    }
    if (/`Hold`/.test(rest)) card.hold = true;
    /* The printed rules text is the blockquote directly under the header. */
    const quote = [];
    for (let j = i + 1; j < lines.length; j++) {
      const q = lines[j];
      if (q.trim() === "" && quote.length === 0) continue;
      if (!q.startsWith(">")) break;
      quote.push(q.replace(/^>\s?/, ""));
    }
    /* Rules text is quoted in italics; a plain blockquote is commentary. */
    const quoted = quote.join(" ").trim();
    if (/^\*.*\*$/.test(quoted)) card.text = quoted;
    found.push(card);
  }
  return found;
}

const fmt = (v) => (v === undefined ? "unset" : JSON.stringify(v));

/* Compare what the card says, not how markdown dresses it: emphasis, backticks,
   smart quotes and whitespace are the prose file's business. */
function normalizeText(s) {
  return s
    .replace(/[`*_]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[−–]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function checkProse(doc, path) {
  const problems = [];
  const text = readFileSync(path, "utf8");
  const rel = path.slice(ROOT.length + 1);
  const listed = proseCards(text);
  for (const p of listed) {
    const c = doc.cards.find((x) => x.name === p.name);
    if (!c) {
      problems.push(`${rel}:${p.line} — "${p.name}" is not in design/cards.yaml`);
      continue;
    }
    for (const f of ["cost", "rarity", "power", "scramble", "hold"]) {
      const mine = f in p ? p[f] : undefined;
      const theirs = c[f] === null || c[f] === undefined ? undefined : c[f];
      if (mine !== theirs) {
        problems.push(
          `${rel}:${p.line} — ${p.name}: ${f} is ${fmt(mine)} in prose, ${fmt(theirs)} in cards.yaml`
        );
      }
    }
    if (p.text !== undefined && normalizeText(p.text) !== normalizeText(c.text || "")) {
      problems.push(
        `${rel}:${p.line} — ${p.name}: rules text differs from cards.yaml\n` +
        `      prose: ${normalizeText(p.text)}\n` +
        `      yaml:  ${normalizeText(c.text || "")}`
      );
    }
  }
  const namesInProse = new Set(listed.map((p) => p.name));
  const set = rel.includes("card-bank") ? "bank" : "exemplar";
  for (const c of doc.cards) {
    if (c.set !== set || c.kind.endsWith("room")) continue;
    if (!namesInProse.has(c.name)) {
      problems.push(`${rel} — ${c.name} is in cards.yaml but has no entry here`);
    }
  }
  return problems;
}

/* --------------------------------------------------- the prototypes render
   Both prototypes are now views of the card list, so "does it still render"
   is part of checking the list. Each page's script is run against a DOM stub
   and asked how many cards it put on the page. */

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
  const total = doc.cards.length;

  try {
    const sheet = readFileSync(join(ROOT, "prototype/card-sheet.html"), "utf8");
    const { ctx, store } = baseContext(cardsJs);
    runInContext(sheet.match(/<script>\n"use strict";([\s\S]*?)<\/script>/)[1], ctx);
    const html = store.sheets.innerHTML;
    const drawn = (html.match(/class="card /g) || []).length;
    if (drawn !== total) {
      problems.push(`prototype/card-sheet.html renders ${drawn} cards, not ${total}`);
    }
  } catch (e) {
    problems.push(`prototype/card-sheet.html failed to render: ${e.message}`);
  }

  try {
    const sim = readFileSync(join(ROOT, "prototype/encounter-sim.html"), "utf8");
    const { ctx, store } = baseContext(cardsJs);
    runInContext(sim.match(/<script>\n"use strict";([\s\S]*)<\/script>/)[1], ctx);
    runInContext("renderLibrary()", ctx);
    const drawn = (store.library.innerHTML.match(/class="card/g) || []).length;
    if (drawn !== total) {
      problems.push(`prototype/encounter-sim.html's card list shows ${drawn} cards, not ${total}`);
    }
  } catch (e) {
    problems.push(`prototype/encounter-sim.html failed to render: ${e.message}`);
  }
  return problems;
}

/* ---------------------------------------------------------------------- main */

const doc = parseCardsYaml(readFileSync(YAML, "utf8"));
const cmd = process.argv[2] || "build";

if (cmd === "build") {
  writeFileSync(OUT, generate(doc));
  console.log(`wrote prototype/cards.js — ${doc.cards.length} cards`);
} else if (cmd === "check") {
  const problems = [];
  const want = generate(doc);
  let have = "";
  try { have = readFileSync(OUT, "utf8"); } catch { /* missing counts as stale */ }
  if (have !== want) problems.push("prototype/cards.js is stale — run: node tools/cards.mjs build");
  for (const p of PROSE) problems.push(...checkProse(doc, p));
  problems.push(...checkRenders(doc, want));

  const exemplars = doc.cards.filter((c) => c.set === "exemplar").length;
  if (exemplars !== doc.meta.exemplar_count) {
    problems.push(`meta.exemplar_count is ${doc.meta.exemplar_count} but there are ${exemplars} exemplar cards`);
  }
  if (problems.length) {
    console.error(`card list has drifted — ${problems.length} problem(s):\n`);
    for (const p of problems) console.error("  " + p);
    process.exit(1);
  }
  console.log(`no drift — ${doc.cards.length} cards agree across cards.yaml, cards.js and both prose files,
and both prototypes render all ${doc.cards.length}`);
} else {
  console.error("usage: node tools/cards.mjs [build|check]");
  process.exit(2);
}
