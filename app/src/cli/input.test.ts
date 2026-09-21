import { PassThrough } from "node:stream";
import { describe, expect, it } from "vitest";
import { lineReader } from "./input";

const sink = () => {
  const written: string[] = [];
  const out = new PassThrough();
  out.on("data", (chunk: Buffer) => written.push(chunk.toString()));
  return { out, written };
};

describe("lineReader", () => {
  it("hands out lines that arrived before they were asked for, in order", async () => {
    const input = new PassThrough();
    const { out, written } = sink();
    const reader = lineReader(input, out);
    input.write("1\nu\nq\n");
    await new Promise((r) => setTimeout(r, 0));
    expect(await reader.next("> ")).toBe("1");
    expect(await reader.next("> ")).toBe("u");
    expect(await reader.next("> ")).toBe("q");
    expect(written.join("")).toBe("> > > ");
    reader.close();
  });

  it("waits for a line that has not arrived yet", async () => {
    const input = new PassThrough();
    const reader = lineReader(input, sink().out);
    const pending = reader.next("? ");
    input.write("later\n");
    expect(await pending).toBe("later");
    reader.close();
  });

  it("reads null once the input ends", async () => {
    const input = new PassThrough();
    const reader = lineReader(input, sink().out);
    input.end("last\n");
    expect(await reader.next("")).toBe("last");
    expect(await reader.next("")).toBeNull();
    expect(await reader.next("")).toBeNull();
  });
});
