#!/usr/bin/env node
/* Checks that every card behaviour registry entry in app/src/domain/cards/
 * {red,gray,stuff}.ts carries a comment quoting that card's design/cards.yaml
 * `text` exactly (whitespace normalised), so the quotes don't silently rot.
 *
 * Comment shape expected directly above each entry: a block comment whose
 * content starts with a double-quoted string, e.g. `/* "Exhaust 2." *\/`.
 * A wrapped quote (multiple comment lines) is joined with single spaces.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseCardsYaml } from "./cards.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const YAML = join(ROOT, "design/cards.yaml");
const FILES = [
  "app/src/domain/cards/red.ts",
  "app/src/domain/cards/gray.ts",
  "app/src/domain/cards/stuff.ts",
];

function norm(s) {
  return s.replace(/\s+/g, " ").trim();
}

/* Walk upward from an entry line collecting a contiguous block comment
 * directly above it. Returns the raw lines (in order) or null if there
 * isn't one immediately above. */
function commentAbove(lines, entryIdx) {
  let j = entryIdx - 1;
  if (j < 0 || !lines[j].trim().endsWith("*/")) return null;
  const collected = [];
  while (j >= 0) {
    collected.unshift(lines[j]);
    if (lines[j].trim().startsWith("/*")) return collected;
    j--;
  }
  return null;
}

function extractQuote(commentLines) {
  const joined = norm(
    commentLines
      .map((l) => l.replace(/^\s*\/\*/, "").replace(/\*\/\s*$/, "").replace(/^\s*\*/, ""))
      .join(" "),
  );
  if (!joined.startsWith('"')) return null;
  const end = joined.indexOf('"', 1);
  if (end === -1) return null;
  return joined.slice(1, end);
}

function checkFile(path, textByName) {
  const problems = [];
  const full = readFileSync(join(ROOT, path), "utf8");
  const lines = full.split("\n");

  const startIdx = lines.findIndex((l) => /^export const \w+: Registry = \{$/.test(l));
  if (startIdx === -1) { problems.push(`${path}: no "export const X: Registry = {" found`); return problems; }
  let endIdx = lines.findIndex((l, i) => i > startIdx && l === "};");
  if (endIdx === -1) endIdx = lines.length;

  const entryPattern = /^(?:"((?:[^"\\]|\\.)*)"|([A-Za-z_][A-Za-z0-9_]*)):/;
  for (let i = startIdx + 1; i < endIdx; i++) {
    const line = lines[i];
    const indent = line.length - line.trimStart().length;
    if (indent !== 2) continue;
    const trimmed = line.trim();
    if (trimmed.startsWith("/*") || trimmed.startsWith("*")) continue;
    const m = trimmed.match(entryPattern);
    if (!m) continue;
    const name = m[1] !== undefined ? m[1] : m[2];

    const comment = commentAbove(lines, i);
    if (!comment) {
      problems.push(`${path}: "${name}" has no quoted-text comment above it`);
      continue;
    }
    const quote = extractQuote(comment);
    if (quote === null) {
      problems.push(`${path}: "${name}"'s comment doesn't start with a quoted string`);
      continue;
    }
    const want = textByName.get(name);
    if (want === undefined) {
      problems.push(`${path}: "${name}" is not a card in design/cards.yaml`);
      continue;
    }
    if (norm(want) !== norm(quote)) {
      problems.push(
        `${path}: "${name}" comment quote doesn't match cards.yaml text\n` +
          `    comment:    ${quote}\n` +
          `    cards.yaml: ${want}`,
      );
    }
  }
  return problems;
}

export function checkCardComments() {
  const doc = parseCardsYaml(readFileSync(YAML, "utf8"));
  const textByName = new Map(doc.cards.map((c) => [c.name, c.text ?? ""]));
  const problems = [];
  for (const f of FILES) problems.push(...checkFile(f, textByName));
  return problems;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const problems = checkCardComments();
  if (problems.length) {
    console.error(`card comment quotes have drifted — ${problems.length} problem(s):\n`);
    for (const p of problems) console.error("  " + p);
    process.exit(1);
  }
  console.log("card comment quotes agree with design/cards.yaml");
}
