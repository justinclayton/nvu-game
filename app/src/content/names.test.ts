import { describe, expect, it } from "vitest";
import { initialsCollisions, resolveCardName } from "./names";

interface FakeCard {
  readonly id: string;
  readonly name: string;
}

const card = (id: string, name: string): FakeCard => ({ id, name });

describe("resolveCardName", () => {
  const eligible = [
    card("1", "Charge In"),
    card("2", "Reckless Swing"),
    card("3", "Riot Shield"),
    card("4", "Reckless"),
    card("5", "Rust"),
  ];

  it("matches the full name, case-insensitively", () => {
    const r = resolveCardName("charge in", eligible);
    expect(r.ok && r.card.id).toBe("1");
  });

  it("matches unambiguous initials", () => {
    const r = resolveCardName("CI", eligible);
    expect(r.ok && r.card.id).toBe("1");
  });

  it("matches an unambiguous prefix", () => {
    const r = resolveCardName("Charg", eligible);
    expect(r.ok && r.card.id).toBe("1");
  });

  it("refuses an ambiguous initials match and lists candidates", () => {
    const r = resolveCardName("RS", eligible);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toContain("Reckless Swing");
      expect(r.reason).toContain("Riot Shield");
    }
  });

  it("refuses an ambiguous prefix match and lists candidates", () => {
    const r = resolveCardName("R", eligible);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toContain("Reckless");
      expect(r.reason).toContain("Rust");
    }
  });

  it("refuses a name matching nothing eligible", () => {
    const r = resolveCardName("Zen Mode", eligible);
    expect(r.ok).toBe(false);
  });

  it("treats several copies of the same card as interchangeable", () => {
    const copies = [card("a", "Shove"), card("b", "Shove"), card("c", "Charge In")];
    const r = resolveCardName("Shove", copies);
    expect(r.ok).toBe(true);
    expect(r.ok && ["a", "b"]).toContain(r.ok && r.card.id);
  });
});

describe("initialsCollisions", () => {
  it("reports every known pair from design/cards.yaml", () => {
    const eligible = [
      card("1", "Reckless Swing"),
      card("2", "Riot Shield"),
      card("3", "Reckless"),
      card("4", "Rust"),
      card("5", "Shove"),
      card("6", "Sluggish"),
      card("7", "Charge In"),
    ];
    const pairs = initialsCollisions(eligible).map(([a, b]) => `${a} / ${b}`);
    expect(pairs.sort()).toEqual(
      ["Reckless Swing / Riot Shield", "Reckless / Rust", "Shove / Sluggish"].sort(),
    );
  });
});
