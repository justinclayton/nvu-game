/* The table as text. No rule is computed here: every number is a domain query. */

import {
  allThresholds,
  costOf,
  metThresholds,
  payOptions,
  playableCards,
  scrapForStatsCards,
  statPool,
  thresholdLines,
} from "@domain/queries";
import type { Card, Character, GameState, Room } from "@domain/types";
import type { CardFace } from "@domain/printed";
import { CHARACTERS, playerOf } from "@domain/verbs";
import { currentQuestion, describeStagedAnswer, type StagedAnswer } from "./ascend";

const statsOf = (card: Card | CardFace): string => {
  const parts: string[] = [];
  if (card.oomph > 0) parts.push(`Oomph ${String(card.oomph)}`);
  if (card.scramble > 0) parts.push(`Scramble ${String(card.scramble)}`);
  if (card.conditionalStat) parts.push("(conditional)");
  return parts.join(", ");
};

const kindOf = (card: Card | CardFace): string =>
  card.kind === "good_stuff" ? "Good Stuff" : card.kind === "bad_stuff" ? "Bad Stuff" : "";

/** One line for a card, as a hand, an offer or an answer to `card NAME` shows it. */
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

/** A card's printed face, with no state or character to price it against — `bin/nvu card NAME`. */
export function printedFaceLine(card: CardFace): string {
  const bits = [`cost ${String(card.cost)}`, statsOf(card), kindOf(card)].filter((s) => s !== "");
  const text = card.text.trim() === "" ? "" : ` — ${card.text.trim()}`;
  return `${card.name} [${bits.join("; ")}]${text}`;
}

function roomLines(state: GameState, room: Room): string[] {
  const met = new Set(metThresholds(state));
  const lines = [`Room: ${room.name} (${room.kind})`];
  for (const t of allThresholds(room)) {
    const mark = met.has(t) ? "✔" : " ";
    const need = thresholdLines(state, t)
      .map((l) => {
        const raised = l.effective !== l.printed ? ` (printed ${String(l.printed)})` : "";
        return `${l.stat} ${String(l.effective)}${raised}`;
      })
      .join(" and ");
    lines.push(`  ${mark} ${need}: ${t.outcome}`);
  }
  lines.push(`    Flee: ${room.flee.text}`);
  return lines;
}

function playerLines(state: GameState, c: Character): string[] {
  const p = playerOf(state, c);
  const flags = [p.down ? "DOWN" : ""].filter((s) => s !== "");
  const head = `${c}: deck ${String(p.deck.length)}, discard ${String(p.discard.length)}, exhaust ${String(p.exhaust.length)}, hand ${String(p.hand.length)}${flags.length ? "  " + flags.join(" ") : ""}`;
  const lines = [head];
  for (const card of p.hand) lines.push(`    ${cardLine(state, c, card)}`);
  const played = state.playZone.filter((x) => x.owner === c).map((x) => x.card.name);
  if (played.length > 0) lines.push(`    played: ${played.join(", ")}`);
  return lines;
}

function ascendStatusLines(state: GameState, staged: readonly StagedAnswer[]): string[] {
  const lines: string[] = ["Ascending."];
  const asking = currentQuestion(state, staged);
  lines.push(
    asking ? `Asking: ${asking} — the reward` : "Every question is staged; composing ASCEND.",
  );
  lines.push("Offered:");
  for (const c of CHARACTERS) {
    const offer = state.offer?.[c] ?? [];
    lines.push(`  ${c}: ${offer.length > 0 ? offer.map((card) => cardLine(state, c, card)).join(" | ") : "nothing"}`);
  }
  if (staged.length > 0) {
    lines.push("Staged so far:");
    for (const a of staged) lines.push(`  ${describeStagedAnswer(state, a)}`);
  }
  return lines;
}

export function renderTable(state: GameState, staged: readonly StagedAnswer[] = []): string {
  const lines: string[] = [];
  lines.push(
    `Floor ${String(state.floor)} · turn ${String(state.turn)} · ${state.phase}` +
      `   floor deck ${String(state.floorDeck.length)}, cleared ${String(state.cleared.length)}` +
      `   Good Stuff ${String(state.pools.goodStuff.length)}, Bad Stuff ${String(state.pools.badStuff.length)}`,
  );
  if (state.activeRoom) lines.push(...roomLines(state, state.activeRoom));
  const pool = statPool(state);
  if (state.phase === "Play" || state.playZone.length > 0) {
    lines.push(`Stat pool: Oomph ${String(pool.oomph)}, Scramble ${String(pool.scramble)}`);
  }
  for (const c of CHARACTERS) lines.push(...playerLines(state, c));
  if (state.phase === "Ascend") lines.push(...ascendStatusLines(state, staged));
  if (state.pending) lines.push(`Waiting on: ${state.pending.prompt}`);
  if (state.outcome) lines.push(`Outcome: ${state.outcome}`);
  return lines.join("\n");
}

/**
 * The verbs open right now, with the cards eligible for each — not every
 * combination a command could take (design/cli-sim/spec.md, "the moves hint
 * printed after each call ... lists the verbs open in this phase with the
 * cards eligible for each, not every combination").
 */
export function moveHint(state: GameState, staged: readonly StagedAnswer[] = []): string {
  if (state.phase === "GameOver") return "No legal moves — the run is over.";

  const lines: string[] = [];
  const pending = state.pending;
  if (pending) {
    switch (pending.kind) {
      case "ChooseCharacter":
        lines.push(`choose <Name> — one of: ${pending.options.join(", ")}`);
        break;
      case "ChooseCards": {
        const names = pending.options.map((c) => c.name).join(", ") || "nothing";
        const want = Math.min(pending.count, pending.options.length);
        const plural = want > 1 ? " <Name>..." : "";
        const optional = pending.optional ? ", or choose none" : "";
        lines.push(`choose <Name>${plural} — choose ${String(want)} of: ${names}${optional}`);
        break;
      }
      case "OrderCards":
        lines.push(`order <Name> <Name>... — top first, every one of: ${pending.cards.map((c) => c.name).join(", ")}`);
        break;
      case "TakeReward":
        lines.push(`take | skip — ${pending.card.name}`);
        break;
    }
    lines.push("undo — step back to the last checkpoint");
    return lines.join("\n");
  }

  switch (state.phase) {
    case "Turn Start":
      lines.push(
        state.floorDeck.length > 0
          ? "flip — flip the next room and draw"
          : "No legal moves — the run is over.",
      );
      break;

    case "Play": {
      for (const c of CHARACTERS) {
        if (playerOf(state, c).down) continue;
        for (const card of playableCards(state, c)) {
          const cost = costOf(state, c, card);
          const payers = payOptions(state, c, card.id).map((x) => x.name);
          const pay = cost > 0 ? ` pay <${String(cost)} of: ${payers.join(", ")}>` : "";
          lines.push(`card ${c} ${card.name} (cost ${String(cost)})${pay}`);
        }
        for (const card of scrapForStatsCards(state, c)) {
          lines.push(`scrap ${c} ${card.name} for <Oomph|Scramble>`);
        }
      }
      lines.push("end — end the Play phase and resolve the room");
      break;
    }

    case "Ascend": {
      const asking = currentQuestion(state, staged);
      if (!asking) {
        lines.push("Every question is staged; composing ASCEND.");
        break;
      }
      const offered = state.offer?.[asking] ?? [];
      const names = offered.map((c) => c.name).join(", ") || "nothing";
      lines.push(`${asking}: the reward. take <Name> — one of: ${names} — or take none`);
      lines.push("undo — step back one staged question");
      break;
    }
  }
  return lines.join("\n");
}
