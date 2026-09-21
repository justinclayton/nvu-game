/* Lines from stdin, one at a time, whether stdin is a keyboard or a pipe.
 *
 * `readline.question` loses lines that arrive before it is asked, which is all
 * of them when a script is piped in. This queues every line as it comes and
 * hands them out on request; the end of input reads as null. */

import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";

export interface LineReader {
  /** The next line, or null once the input has ended. */
  next(prompt: string): Promise<string | null>;
  close(): void;
}

export function lineReader(input: Readable, output: Writable): LineReader {
  const rl = createInterface({ input, terminal: false });
  const queue: string[] = [];
  let waiting: ((line: string | null) => void) | null = null;
  let closed = false;

  rl.on("line", (line) => {
    if (waiting) {
      const resolve = waiting;
      waiting = null;
      resolve(line);
    } else {
      queue.push(line);
    }
  });
  rl.on("close", () => {
    closed = true;
    if (waiting) {
      const resolve = waiting;
      waiting = null;
      resolve(null);
    }
  });

  return {
    next(prompt) {
      output.write(prompt);
      const queued = queue.shift();
      if (queued !== undefined) return Promise.resolve(queued);
      if (closed) return Promise.resolve(null);
      return new Promise((resolve) => {
        waiting = resolve;
      });
    },
    close() {
      rl.close();
    },
  };
}
