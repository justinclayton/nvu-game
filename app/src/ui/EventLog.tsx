/* The text log, and the playtester's tools for it.
 *
 * It subscribes to the session outside React and appends to its own list, so a
 * long run does not re-render the table. Sound and animation would hang off the
 * same subscription. The lines themselves are `logLines` in the application
 * layer, which interleaves the events with the notes typed against them — a
 * note is a line of the log, not a comment attached to the side of it.
 *
 * The note box and the export buttons live here, with the log, because that is
 * what they are about: one writes a line into it and the others take it away.
 */

import { useEffect, useRef, useState } from "react";

import { lineKindOf, logLines } from "@application/narrate";
import type { SessionState } from "@application/session";
import { ExportControls } from "./ExportControls";
import { useSession } from "./useSession";

export function EventLog() {
  const session = useSession();
  const listRef = useRef<HTMLOListElement>(null);
  const shown = useRef(0);

  useEffect(() => {
    const render = (state: SessionState) => {
      const list = listRef.current;
      if (!list) return;
      const lines = logLines(state.events, state.notes);
      if (lines.length < shown.current) {
        list.replaceChildren();
        shown.current = 0;
      }
      for (const line of lines.slice(shown.current)) {
        const item = document.createElement("li");
        item.className = `log__line log__line--${lineKindOf(line)}`;
        item.textContent = line.kind === "note" ? `Note — ${line.text}` : line.text;
        list.append(item);
      }
      shown.current = lines.length;
      list.scrollTop = list.scrollHeight;
    };

    render(session.getState());
    return session.subscribe(render);
  }, [session]);

  return (
    <div className="log">
      <div className="log__head">
        <h2 className="log__title" id="log-title">
          Log
        </h2>
        <ExportControls />
      </div>
      <ol className="log__lines" aria-labelledby="log-title" ref={listRef} />
      <NoteBox />
    </div>
  );
}

/**
 * A thought, typed where it happened. The note lands at the end of the log as
 * it stands, so it reads back between the same two lines it was typed between
 * — which is the whole point of typing it here rather than on paper.
 */
function NoteBox() {
  const session = useSession();
  const [text, setText] = useState("");

  const add = () => {
    session.getState().note(text);
    setText("");
  };

  return (
    <form
      className="note-box"
      onSubmit={(e) => {
        e.preventDefault();
        add();
      }}
    >
      <label className="note-box__label" htmlFor="note-text">
        Note
      </label>
      <input
        id="note-text"
        className="note-box__input"
        type="text"
        value={text}
        placeholder="Something to come back to."
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
      <button type="submit" className="button button--small" disabled={text.trim() === ""}>
        Add note
      </button>
    </form>
  );
}
