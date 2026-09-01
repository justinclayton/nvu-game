/* The text log. It subscribes to the session's event log outside React and
 * appends to its own list, so a long run does not re-render the table. Sound
 * and animation would hang off the same subscription. */

import { useEffect, useRef } from "react";

import type { DomainEvent } from "@domain/types";
import { useSession } from "./useSession";

export function describeEvent(event: DomainEvent): string {
  switch (event.type) {
    case "FLOOR_BUILT":
      return `Floor ${String(event.floor)} is built: ${String(event.rooms)} rooms.`;
    case "ROOM_FLIPPED":
      return `You are in: ${event.room.name}.`;
    case "CARD_DRAWN":
      return `${event.character} draws ${event.card.name}.`;
    case "DRAW_BURNED":
      return `${event.character}'s hand is full — ${event.card.name} is Exhausted instead.`;
    case "CARD_PLAYED":
      return `${event.character} plays ${event.card.name}.`;
    case "COST_PAID":
      return `${event.character} pays with ${event.cards.map((c) => c.name).join(", ")}.`;
    case "CARD_EXHAUSTED":
      return `${event.character} Exhausts ${event.card.name} from their ${event.from === "playZone" ? "play zone" : event.from}.`;
    case "CARD_SCRAPPED":
      return `${event.card.name} is Scrapped.`;
    case "CARDS_SHUFFLED_IN":
      return `${event.character} shuffles ${String(event.cards.length)} card(s) back in.`;
    case "CARD_TO_HAND":
      return `${event.character} takes ${event.card.name} into hand.`;
    case "CARD_MOVED":
      return `${event.card.name} goes to ${event.character}'s ${event.to}.`;
    case "CARD_KEPT":
      return `${event.character} holds ${event.card.name}.`;
    case "CARDS_PEEKED":
      return `A look at ${event.character}'s deck: ${event.cards.map((c) => c.name).join(", ")}.`;
    case "THRESHOLD_MET":
      return `${event.threshold.stat} ${String(event.threshold.value)} met — ${event.threshold.outcome}`;
    case "STUFF_TAKEN":
      return `${event.character} gets ${event.card.name}.`;
    case "ROOM_CLEARED":
      return `${event.room.name} is Cleared.`;
    case "ROOM_FLED":
      return `You Flee ${event.room.name}.`;
    case "FLED_RESHUFFLED":
      return `The Fled pile shuffles back in: ${String(event.rooms)} rooms.`;
    case "LAST_STAND":
      return `${event.character}'s deck is empty — last stand.`;
    case "LAST_STAND_ESCAPED":
      return `${event.character} gets out of last stand, ${String(event.price.length)} cards the poorer.`;
    case "WENT_DOWN":
      return `${event.character} is Down — ${event.cause}.`;
    case "REWARD_REVEALED":
      return `${event.character}'s reward pool shows ${event.card.name}.`;
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
      return event.outcome === "Victory" ? "You reach the rooftop. You win." : "Both of you are Down.";
  }
}

export function EventLog() {
  const session = useSession();
  const listRef = useRef<HTMLOListElement>(null);
  const shown = useRef(0);

  useEffect(() => {
    const render = (events: readonly DomainEvent[]) => {
      const list = listRef.current;
      if (!list) return;
      if (events.length < shown.current) {
        list.replaceChildren();
        shown.current = 0;
      }
      for (const event of events.slice(shown.current)) {
        const item = document.createElement("li");
        item.className = `log__line log__line--${event.type.toLowerCase()}`;
        item.textContent = describeEvent(event);
        list.append(item);
      }
      shown.current = events.length;
      list.scrollTop = list.scrollHeight;
    };

    render(session.getState().events);
    return session.subscribe((s) => s.events, render);
  }, [session]);

  return (
    <div className="log">
      <h2 className="log__title" id="log-title">
        Log
      </h2>
      <ol className="log__lines" aria-labelledby="log-title" ref={listRef} />
    </div>
  );
}
