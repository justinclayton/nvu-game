/* `bin/nvu card NAME`, run through the real launcher. */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO = fileURLToPath(new URL("../../..", import.meta.url));

function runCard(name: string): { readonly status: number; readonly output: string } {
  try {
    const output = execFileSync("bin/nvu", ["card", name], { cwd: REPO, encoding: "utf8" });
    return { status: 0, output };
  } catch (error) {
    const e = error as { readonly status: number; readonly stdout: string };
    return { status: e.status, output: e.stdout };
  }
}

describe("bin/nvu card", () => {
  it("prints a Room's name, floors, thresholds and Flee text", () => {
    const { status, output } = runCard("Automated Defense Turret");
    expect(status).toBe(0);
    expect(output).toContain("Automated Defense Turret [room; floors 3, 4]");
    expect(output).toContain("Scramble 8: Both players get Good Stuff.");
    expect(output).toContain("Oomph 10: Both players may Scrap a card from their hand or discard pile.");
    expect(output).toContain("Flee: Both players Exhaust 2, and both players get Bad Stuff.");
  });

  it("matches a Room by an unambiguous prefix, same as a card", () => {
    const { status, output } = runCard("Automated Defense");
    expect(status).toBe(0);
    expect(output).toContain("Automated Defense Turret [room; floors 3, 4]");
  });

  it("still prints a non-Room card as before", () => {
    const { status, output } = runCard("Charge");
    expect(status).toBe(0);
    expect(output.trim()).toBe("Charge [cost 2; Oomph 4]");
  });

  it("refuses a name matching neither a card nor a Room", () => {
    const { status, output } = runCard("Not A Real Name");
    expect(status).toBe(1);
    expect(output).toContain("Refused:");
  });
});
