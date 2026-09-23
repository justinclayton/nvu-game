#!/usr/bin/env node
/* Checks that design/rulebook.md's "Rules version" line agrees with
 * RULES_VERSION in app/src/domain/setup.ts, so the engine can't silently
 * drift from the rulebook it implements. See issue #83. */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RULEBOOK = join(ROOT, "design/rulebook.md");
const SETUP_TS = join(ROOT, "app/src/domain/setup.ts");

export function checkRulesVersion() {
  const rulebook = readFileSync(RULEBOOK, "utf8");
  const rulebookMatch = rulebook.match(/^Rules version:\s*(\S+)/m);
  if (!rulebookMatch) {
    return [`design/rulebook.md has no "Rules version:" line`];
  }

  const setup = readFileSync(SETUP_TS, "utf8");
  const setupMatch = setup.match(/RULES_VERSION\s*=\s*"([^"]+)"/);
  if (!setupMatch) {
    return [`app/src/domain/setup.ts has no RULES_VERSION export`];
  }

  const rulebookVersion = rulebookMatch[1];
  const setupVersion = setupMatch[1];
  if (rulebookVersion !== setupVersion) {
    return [
      `rules version drift: design/rulebook.md says ${rulebookVersion}, ` +
        `app/src/domain/setup.ts RULES_VERSION says ${setupVersion}`,
    ];
  }
  return [];
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const problems = checkRulesVersion();
  if (problems.length) {
    console.error(problems[0]);
    process.exit(1);
  }
  console.log("rules version agrees between design/rulebook.md and RULES_VERSION");
}
