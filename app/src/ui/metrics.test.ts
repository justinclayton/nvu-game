import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  WIDE_ABOVE,
  WIDE_COLUMN_GAP,
  WIDE_LOG_WIDTH,
  WIDE_MAT_MIN_WIDTH,
  WIDE_TABLE_PADDING_X,
  WIDE_TABLE_VIEWPORT_SHARE,
} from "./metrics";

const css = readFileSync(join(__dirname, "table.css"), "utf8");

describe("wide table breakpoint", () => {
  it("is wide enough for the mat, the gap and the log column", () => {
    const needed =
      WIDE_MAT_MIN_WIDTH + WIDE_COLUMN_GAP + WIDE_LOG_WIDTH + WIDE_TABLE_PADDING_X;
    expect(WIDE_ABOVE * WIDE_TABLE_VIEWPORT_SHARE).toBeGreaterThanOrEqual(needed);
  });

  it("is the media query in table.css, with the same mat, gap and log numbers", () => {
    expect(css).toContain(`@media (min-width: ${String(WIDE_ABOVE)}px) {`);
    expect(css).toContain(`min-width: ${String(WIDE_MAT_MIN_WIDTH)}px;`);
    expect(css).toContain(`padding: 14px ${String(WIDE_TABLE_PADDING_X / 2)}px 40px;`);
    expect(css).toContain(`column-gap: ${String(WIDE_COLUMN_GAP)}px;`);
    expect(css).toContain(`grid-template-columns: minmax(0, 1fr) ${String(WIDE_LOG_WIDTH)}px;`);
    expect(css).toContain(`max-width: min(${String(WIDE_TABLE_VIEWPORT_SHARE * 100)}vw, 2000px);`);
  });
});
