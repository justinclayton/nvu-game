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
  it("prints a Room's name, band, thresholds and Flee text", () => {
    const { status, output } = runCard("Automated Defense Turret");
    expect(status).toBe(0);
    expect(output).toContain("Automated Defense Turret [room; band 2]");
    expect(output).toContain("Scramble 8: Clear, and Gray gets Good Stuff.");
    expect(output).toContain("Oomph 10: Clear, and one of you may Scrap a Bad Stuff card from your hand.");
    expect(output).toContain("Flee: Both of you Exhaust 2, and both of you get Bad Stuff.");
  });

  it("matches a Room by an unambiguous prefix, same as a card", () => {
    const { status, output } = runCard("Automated Defense");
    expect(status).toBe(0);
    expect(output).toContain("Automated Defense Turret [room; band 2]");
  });

  it("still prints a non-Room card as before", () => {
    const { status, output } = runCard("Charge In");
    expect(status).toBe(0);
    expect(output.trim()).toBe("Charge In [cost 2; Oomph 4]");
  });

  it("refuses a name matching neither a card nor a Room", () => {
    const { status, output } = runCard("Not A Real Name");
    expect(status).toBe(1);
    expect(output).toContain("Refused:");
  });
});
