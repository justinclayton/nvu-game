/* The log as a person reads it: one line per event, and the playtester's own
 * notes in among them.
 *
 * React-free, so the screen and every export read the same lines from the same
 * place — a note cites a log line by what it says, and the two must never
 * disagree. Nothing here is a rule: the domain narrates nothing and knows
 * nothing about notes.
 */

import { printedThresholdLines } from "@domain/queries";
import type { DomainEvent } from "@domain/types";
import type { Note } from "./session";

export function describeEvent(event: DomainEvent): string {
  switch (event.type) {
    case "FLOOR_BUILT":
      return `Floor ${String(event.floor)} is built: ${String(event.rooms)} rooms.`;
    case "ROOM_FLIPPED":
      return `You are in: ${event.room.name}.`;
    case "CARD_DRAWN":
      return `${event.character} draws ${event.card.name}.`;
    case "CARD_PLAYED":
      return `${event.character} plays ${event.card.name}.`;
    case "COST_PAID":
      return `${event.character} pays with ${event.cards.map((c) => c.name).join(", ")}.`;
    case "CARD_DISCARDED":
      return `${event.character} discards ${event.card.name} from their ${event.from === "playZone" ? "play zone" : event.from}.`;
    case "CARD_SCRAPPED":
      return `${event.card.name} is Scrapped.`;
    case "CARD_SCRAPPED_FOR_STATS":
      return `${event.character} Scraps ${event.card.name} for +${String(event.amount)} ${event.stat}.`;
    case "CARD_EXHAUSTED":
      return `${event.character} Exhausts ${event.card.name}.`;
    case "EXHAUST_PREVENTED":
      return `${event.by.name} stops it: ${event.character} Exhausts nothing.`;
    case "CARDS_SHUFFLED_IN":
      return `${event.character} shuffles ${String(event.cards.length)} card(s) back in.`;
    case "DISCARD_RESHUFFLED":
      return `${event.character}'s deck is empty — the discard pile shuffles in to make a new one (${String(event.cards)} cards).`;
    case "CARD_TO_HAND":
      return `${event.character} takes ${event.card.name} into hand.`;
    case "CARD_MOVED":
      return `${event.card.name} goes to ${event.character}'s ${event.to}.`;
    case "CARDS_PEEKED":
      return `A look at the ${event.pile}: ${event.cards.map((c) => c.name).join(", ")}.`;
    case "THRESHOLD_MET": {
      const need = printedThresholdLines(event.threshold)
        .map((l) => `${l.stat} ${String(l.effective)}`)
        .join(" and ");
      return `${need} met — ${event.threshold.outcome}`;
    }
    case "STUFF_TAKEN":
      return `${event.character} gets ${event.card.name}.`;
    case "STUFF_POOL_EMPTY":
      return `The ${event.pool === "good_stuff" ? "Good" : "Bad"} Stuff pool is empty — ${event.character} gets nothing.`;
    case "ROOM_CLEARED":
      return `${event.room.name} is Cleared.`;
    case "ROOM_FLED":
      return `You Flee ${event.room.name}.`;
    case "FLED_RESHUFFLED":
      return `${event.room.name} shuffles back into the Floor deck.`;
    case "WENT_DOWN":
      return `${event.character} is Down — ${event.cause}. The run is lost.`;
    case "REWARD_REVEALED":
      return `${event.character}'s reward pool shows ${event.card.name}.`;
    case "REWARD_POOL_EMPTY":
      return `${event.character}'s reward pool is empty — nothing to reveal.`;
    case "REWARD_TAKEN":
      return `${event.character} takes ${event.card.name}.`;
    case "REWARD_DECLINED":
      return `${event.character} declines the reward.`;
    case "CLEANUP_BEGAN":
      return "Cleanup.";
    case "TURN_ENDED":
      return `— end of turn ${String(event.turn)} —`;
    case "FLOOR_CLEARED":
      return `Floor ${String(event.floor)} is clear.`;
    case "GAME_OVER":
      return event.outcome === "Victory" ? "You reach the rooftop. You win." : "You lose.";
    case "RUN_ABORTED":
      return `The run is void: ${event.reason}`;
  }
}

/** One line of the log: something the rules did, or something a person typed. */
export type LogLine =
  | { readonly kind: "event"; readonly event: DomainEvent; readonly text: string }
  | { readonly kind: "note"; readonly text: string };

/**
 * The events and the notes as one ordered list. A note anchored at `n` sits
 * just before event `n` — that is where the log had reached when it was typed.
 *
 * A note is always anchored at the end of the log as it stands, so this list
 * only ever grows at its end; the screen appends to it rather than redrawing.
 */
export function logLines(
  events: readonly DomainEvent[],
  notes: readonly Note[] = [],
): readonly LogLine[] {
  const lines: LogLine[] = [];
  const at = (n: number) => {
    for (const note of notes) if (note.at === n) lines.push({ kind: "note", text: note.text });
  };
  for (const [index, event] of events.entries()) {
    at(index);
    lines.push({ kind: "event", event, text: describeEvent(event) });
  }
  at(events.length);
  return lines;
}

/** The class suffix a line carries, so the screen can colour it. */
export const lineKindOf = (line: LogLine): string =>
  line.kind === "note" ? "note" : line.event.type.toLowerCase();

/**
 * The last N *event* lines, plus any note anchored among them — what
 * `show --events N` prints. A note does not spend one of the N slots: a long
 * one, printed in full, would otherwise fill the window on its own with
 * nothing else in it. `n <= 0` prints nothing.
 */
export function tailEvents(lines: readonly LogLine[], n: number): readonly LogLine[] {
  if (n <= 0) return [];
  let seen = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i]?.kind === "event") {
      seen += 1;
      if (seen === n) return lines.slice(i);
    }
  }
  return lines;
}
