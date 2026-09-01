// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the table", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "North vs Up" })).toBeDefined();
  });
});
