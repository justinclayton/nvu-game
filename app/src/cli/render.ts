/* The table as text. No rule is computed here: every number is a domain query. */

import { costOf, metThresholds, statPool, thresholdTarget } from "@domain/queries";
import type { Card, Character, Command, GameState, Room } from "@domain/types";
import { CHARACTERS, playerOf } from "@domain/verbs";

const statsOf = (card: Card): string => {
  const parts: string[] = [];
  if (card.oomph > 0) parts.push(`Oomph ${String(card.oomph)}`);
  if (card.scramble > 0) parts.push(`Scramble ${String(card.scramble)}`);
  if (card.conditionalStat) parts.push("(conditional)");
  return parts.join(", ");
};

const kindOf = (card: Card): string =>
  card.kind === "good_stuff" ? "Good Stuff" : card.kind === "bad_stuff" ? "Bad Stuff" : "";

/** One line for a card, as a hand or a menu lists it. */
export function cardLine(state: GameState, c: Character, card: Card): string {
  const cost = costOf(state, c, card);
  const costNote =
    cost !== card.cost
      ? `cost ${String(cost)} (printed ${String(card.cost)})`
      : `cost ${String(cost)}`;
  const bits = [costNote, statsOf(card), kindOf(card)].filter((s) => s !== "");
  const text = card.text.trim() === "" ? "" : ` — ${card.text.trim()}`;
  return `${card.name} [${bits.join("; ")}]${text}`;
}

function roomLines(state: GameState, room: Room): string[] {
  const met = new Set(metThresholds(state));
  const lines = [`Room: ${room.name} (${room.kind})`];
  for (const t of room.thresholds) {
    const target = thresholdTarget(state, t);
    const mark = met.has(t) ? "✔" : " ";
    const raised = target !== t.value ? ` (printed ${String(t.value)})` : "";
    lines.push(`  ${mark} ${t.stat} ${String(target)}${raised}: ${t.outcome}`);
  }
  lines.push(`    Flee: ${room.flee.text}`);
  return lines;
}

function playerLines(state: GameState, c: Character): string[] {
  const p = playerOf(state, c);
  const flags = p.down ? "  DOWN" : "";
  const head = `${c}: deck ${String(p.deck.length)}, discard ${String(p.discard.length)}, exhaust ${String(p.exhaust.length)}, hand ${String(p.hand.length)}${flags}`;
  const lines = [head];
  for (const card of p.hand) lines.push(`    ${cardLine(state, c, card)}`);
  const played = state.playZone.filter((x) => x.owner === c).map((x) => x.card.name);
  if (played.length > 0) lines.push(`    played: ${played.join(", ")}`);
  return lines;
}

export function renderTable(state: GameState): string {
  const lines: string[] = [];
  lines.push(
    `Floor ${String(state.floor)} · turn ${String(state.turn)} · ${state.phase}` +
      `   floor deck ${String(state.floorDeck.length)}, fled ${String(state.fled.length)}, cleared ${String(state.cleared.length)}` +
      `   Good Stuff ${String(state.pools.goodStuff.length)}, Bad Stuff ${String(state.pools.badStuff.length)}`,
  );
  if (state.activeRoom) lines.push(...roomLines(state, state.activeRoom));
  const pool = statPool(state);
  if (state.phase === "Play" || state.playZone.length > 0) {
    lines.push(`Stat pool: Oomph ${String(pool.oomph)}, Scramble ${String(pool.scramble)}`);
  }
  for (const c of CHARACTERS) lines.push(...playerLines(state, c));
  if (state.phase === "Ascend" && state.offer) {
    lines.push("Ascending. Offered:");
    for (const c of CHARACTERS) {
      lines.push(
        `  ${c}: ${state.offer[c].map((card) => cardLine(state, c, card)).join(" | ") || "nothing"}`,
      );
    }
  }
  if (state.pending) lines.push(`Waiting on: ${state.pending.prompt}`);
  if (state.outcome) lines.push(`Outcome: ${state.outcome}`);
  return lines.join("\n");
}

const nameOf = (state: GameState, id: string): string => {
  for (const c of CHARACTERS) {
    const p = playerOf(state, c);
    const found = [...p.hand, ...p.discard, ...p.deck].find((x) => x.id === id);
    if (found) return found.name;
  }
  const offered = [...(state.offer?.Red ?? []), ...(state.offer?.Gray ?? [])].find(
    (x) => x.id === id,
  );
  if (offered) return offered.name;
  const pending = state.pending;
  if (pending?.kind === "ChooseCards" || pending?.kind === "OrderCards") {
    const shown = pending.kind === "ChooseCards" ? pending.options : pending.cards;
    const found = shown.find((x) => x.id === id);
    if (found) return found.name;
  }
  return id;
};

/** A command as a menu line. */
export function describeCommand(state: GameState, command: Command): string {
  switch (command.type) {
    case "FLIP_ROOM":
      return "Flip the next room (draws both hands up to 5)";
    case "PLAY_CARD": {
      const card = playerOf(state, command.character).hand.find((x) => x.id === command.cardId);
      const paying =
        command.payWith.length === 0
          ? "for free"
          : `paying ${command.payWith.map((id) => nameOf(state, id)).join(", ")}`;
      return `${command.character} plays ${card ? card.name : command.cardId} ${paying}`;
    }
    case "END_PLAY":
      return "End the Play phase and resolve the room";
    case "CHOOSE_CHARACTER":
      return command.character;
    case "CHOOSE_CARDS":
      return command.cardIds.length === 0
        ? "None"
        : command.cardIds.map((id) => nameOf(state, id)).join(", ");
    case "ORDER_CARDS":
      return command.cardIds.map((id) => nameOf(state, id)).join(" → ");
    case "TAKE_REWARD":
      return command.take ? "Take it" : "Skip it";
    case "ASCEND": {
      const one = (c: Character) => {
        const ch = command[c];
        const reward =
          ch.takeRewardId === null ? "declines" : `takes ${nameOf(state, ch.takeRewardId)}`;
        const settle =
          ch.settle.length === 0
            ? ""
            : `, settles ${ch.settle
                .map((d) =>
                  d.pay === null
                    ? nameOf(state, d.stuffId)
                    : `${nameOf(state, d.stuffId)} (paid with ${nameOf(state, d.pay)})`,
                )
                .join(", ")}`;
        return `${c} ${reward}${settle}`;
      };
      return `Ascend: ${one("Red")}; ${one("Gray")}`;
    }
  }
}
