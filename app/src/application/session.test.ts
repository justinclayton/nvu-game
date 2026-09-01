import { describe, expect, it } from "vitest";
import { SESSION_LAYER } from "./session";

describe("session", () => {
  it("lives in the application layer", () => {
    expect(SESSION_LAYER).toBe("application");
  });
});
