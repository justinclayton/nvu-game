#!/usr/bin/env node
/* Checks design/rulebook.md's "Rules version" line two ways:
 *
 *   - it agrees with RULES_VERSION in app/src/domain/setup.ts, so the engine
 *     can't silently drift from the rulebook it implements (issue #83);
 *   - any change to the rulebook since the branch left main comes with a
 *     higher version than main had.
 *
 * `--staged` reads the rulebook and setup.ts from the index instead of the
 * working tree; the pre-commit hook uses it. */

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RULEBOOK = "design/rulebook.md";
const SETUP_TS = "app/src/domain/setup.ts";

function git(...args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
}

function read(path, staged) {
  return staged ? git("show", `:${path}`) : readFileSync(join(ROOT, path), "utf8");
}

const versionOf = (rulebook) => rulebook?.match(/^Rules version:\s*(\S+)/m)?.[1] ?? null;

function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function checkRulesVersion({ staged = false } = {}) {
  const rulebookVersion = versionOf(read(RULEBOOK, staged));
  if (!rulebookVersion) {
    return [`${RULEBOOK} has no "Rules version:" line`];
  }

  const setupVersion = read(SETUP_TS, staged)?.match(/RULES_VERSION\s*=\s*"([^"]+)"/)?.[1];
  if (!setupVersion) {
    return [`${SETUP_TS} has no RULES_VERSION export`];
  }

  if (rulebookVersion !== setupVersion) {
    return [
      `rules version drift: ${RULEBOOK} says ${rulebookVersion}, ` +
        `${SETUP_TS} RULES_VERSION says ${setupVersion}`,
    ];
  }
  return [];
}

export function checkRulesBump({ staged = false } = {}) {
  const main = ["origin/main", "main"].find((ref) => git("rev-parse", "--verify", "--quiet", ref));
  const base = main && git("merge-base", "HEAD", main)?.trim();
  const baseRulebook = base && git("show", `${base}:${RULEBOOK}`);
  if (!baseRulebook) return [];

  const rulebook = read(RULEBOOK, staged);
  if (rulebook === baseRulebook) return [];

  const before = versionOf(baseRulebook);
  const after = versionOf(rulebook);
  if (before && after && compareVersions(after, before) > 0) return [];
  return [
    `${RULEBOOK} changed since this branch left main, but its Rules version is still ${after} ` +
      `(main has ${before}). Raise "Rules version:" in ${RULEBOOK} and RULES_VERSION in ${SETUP_TS}.`,
  ];
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const staged = process.argv.includes("--staged");
  const problems = [...checkRulesVersion({ staged }), ...checkRulesBump({ staged })];
  if (problems.length) {
    for (const p of problems) console.error(p);
    process.exit(1);
  }
  console.log("rules version agrees with RULES_VERSION and is raised for any rulebook change");
}
