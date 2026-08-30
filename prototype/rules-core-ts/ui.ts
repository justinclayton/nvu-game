/* The demo page's behaviour. Built into rules-core-demo.html by build.mjs;
 * never loaded directly. PROTOTYPE — see README.md.
 *
 * Two ways in: guided walkthroughs, which step one hard rule at a time with
 * commentary, and free play, which exposes every legal command against the
 * live state. Both print the whole state after every action, because the point
 * is to see what changed. */

import { execute, createInitialState, playerOf, pool, statusOf, HAND_CAP } from "./engine.ts";
import { resolveStep, scenarios, useRaw, type Scenario } from "./scenarios.ts";
import type { Card, Character, Command, DomainEvent, GameState } from "./types.ts";

declare const NVU_CARDS: { cards: any[] };

const content = useRaw(NVU_CARDS.cards);
const ALL = scenarios();

interface View {
  state: GameState;
  log: { note?: string; events: DomainEvent[]; label: string }[];
  scenario: Scenario | null;
  at: number;                 // index of the next step in a walkthrough
  selected: Record<Character, string[]>;  // cards ticked as cost payment
}

/** Free play starts from one fixed seed, so what you see is what anyone else sees. */
const SEED = 42;

const view: View = {
  state: reset(),
  log: [],
  scenario: null,
  at: 0,
  selected: { Red: [], Gray: [] },
};

function reset(): GameState {
  const [s] = createInitialState(SEED, NVU_CARDS.cards);
  return s;
}

const $ = (id: string) => document.getElementById(id)!;

function say(label: string, events: DomainEvent[], note?: string) {
  view.log.unshift({ label, events, note });
}

function run(cmd: Command, label: string, note?: string) {
  try {
    const [next, ev] = execute(view.state, cmd);
    view.state = next;
    view.selected = { Red: [], Gray: [] };
    say(label, ev, note);
  } catch (e) {
    say(`REFUSED — ${label}`, [{ type: "OPEN_QUESTION", id: "rule", note: String((e as Error).message) }], note);
  }
  render();
}

/* ------------------------------------------------------------------ drawing */

function cardChip(c: Card, opts: { pick?: Character; on?: () => void; dim?: boolean } = {}): string {
  const stats = [c.power ? `P${c.power}` : "", c.scramble ? `S${c.scramble}` : ""].filter(Boolean).join(" ");
  const kind = c.kind === "player" ? c.owner ?? "" : c.kind === "good_stuff" ? "Good Stuff" : "Bad Stuff";
  const ticked = opts.pick && view.selected[opts.pick].includes(c.id);
  return `<span class="chip ${c.kind} ${ticked ? "ticked" : ""} ${opts.dim ? "dim" : ""}"
    data-id="${c.id}" title="${esc(c.text)}">
    <b>${esc(c.name)}</b><i>${kind}${c.hold ? " · Hold" : ""}</i>
    <u>${c.cost}</u>${stats ? `<em>${stats}</em>` : ""}</span>`;
}

const esc = (s: string) => s.replace(/[<>&"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

function pileLine(name: string, cards: readonly Card[]): string {
  return `<div class="pile"><h4>${name} <span>${cards.length}</span></h4>
    <div class="cards">${cards.map((c) => cardChip(c)).join("") || `<span class="empty">—</span>`}</div></div>`;
}

function playerPanel(c: Character): string {
  const s = view.state;
  const p = playerOf(s, c);
  const status = statusOf(p);
  const side = pool(s, c);
  return `<section class="player ${c.toLowerCase()} ${status.toLowerCase()}">
    <h3>${c} <span class="status">${status}</span>
      <span class="side">own side: Power ${side.power} · Scramble ${side.scramble}</span></h3>
    <div class="hand">
      <h4>Hand <span>${p.hand.length}/${HAND_CAP}</span></h4>
      <div class="cards">${
        p.hand.map((card) => cardChip(card, { pick: c })).join("") || `<span class="empty">—</span>`
      }</div>
    </div>
    <div class="counts">
      <span title="your deck is your health and your fuel">Deck <b>${p.deck.length}</b></span>
      <span>Exhaust <b>${p.exhaust.length}</b></span>
      <span>Drew this turn <b>${p.drewThisTurn}</b></span>
    </div>
    ${s.phase === "Draw" && !p.down ? `<button data-cmd="draw:${c}">Draw 1</button>` : ""}
    ${
      s.phase === "Play" && !p.down
        ? `<button data-cmd="play:${c}">Play ticked card${
            view.selected[c].length > 1 ? ", paying with the rest" : ""
          }</button>`
        : ""
    }
  </section>`;
}

function roomPanel(): string {
  const s = view.state;
  const r = s.activeRoom;
  const p = pool(s);
  if (!r) {
    return `<section class="room empty-room"><h3>No active room</h3>
      <p>Phase: <b>${s.phase}</b>. ${
        s.phase === "Flip" ? "Flip the next floor card." : s.phase === "Ascend" ? "The floor is cleared." : ""
      }</p></section>`;
  }
  return `<section class="room ${r.kind}">
    <h3>${esc(r.name)} <span class="kind">${r.kind} room</span></h3>
    <ul>${r.thresholds
      .map((t) => {
        const have = t.recipient
          ? t.stat === "Power"
            ? pool(s, t.recipient).power
            : pool(s, t.recipient).scramble
          : t.stat === "Power"
            ? p.power
            : p.scramble;
        const met = have >= t.value;
        return `<li class="${met ? "met" : ""}">${t.stat} ${t.value} — ${esc(t.outcome)}
          <span class="have">${t.recipient ? `${t.recipient}'s side: ` : "pool: "}${have}</span></li>`;
      })
      .join("")}</ul>
    <p class="flee">${
      r.flee
        ? `Flee: ${r.flee.who === "both" ? "both characters" : "1 character"} Exhaust ${
            r.flee.deckExhaust
          } from deck${r.flee.badStuffToOne ? ", and 1 takes a Bad Stuff" : ""}`
        : "No Flee line. Cleared either way."
    }</p>
  </section>`;
}

function controls(): string {
  const s = view.state;
  const bits: string[] = [];
  if (s.phase === "Flip") bits.push(`<button data-cmd="flip">Flip the next room</button>`);
  if (s.phase === "Draw") bits.push(`<button data-cmd="enddraw">Everyone is done drawing</button>`);
  if (s.phase === "Play") {
    bits.push(`<button data-cmd="endplay:Red">End play (Red takes any Flee)</button>`);
    bits.push(`<button data-cmd="endplay:Gray">End play (Gray takes any Flee)</button>`);
  }
  if (s.phase === "Ascend") bits.push(`<button data-cmd="ascend">Ascend (take the first reward each)</button>`);
  if (s.phase === "GameOver") bits.push(`<b class="outcome">${s.outcome}</b>`);
  return bits.join("");
}

function logPanel(): string {
  return view.log
    .slice(0, 40)
    .map(
      (entry) => `<div class="entry">
        <h5>${esc(entry.label)}</h5>
        ${entry.note ? `<p class="note">${esc(entry.note)}</p>` : ""}
        <ul>${entry.events
          .map((e) => `<li class="${e.type === "OPEN_QUESTION" ? "question" : ""}">${esc(describe(e))}</li>`)
          .join("")}</ul>
      </div>`,
    )
    .join("");
}

function describe(e: DomainEvent): string {
  const a = e as any;
  switch (e.type) {
    case "ROOM_FLIPPED":
      return `Flipped ${a.room.name}`;
    case "CARD_DRAWN":
      return `${a.character} drew ${a.card.name}`;
    case "DRAW_BURNED":
      return `${a.character}'s hand was full — ${a.card.name} went straight to the exhaust pile`;
    case "CARD_PLAYED":
      return `${a.character} played ${a.card.name}`;
    case "COST_PAID":
      return `${a.character} paid with ${a.cards.map((c: Card) => c.name).join(", ")}`;
    case "CARD_EXHAUSTED":
      return `${a.character} exhausted ${a.card.name}`;
    case "CARD_SCRAPPED":
      return `SCRAPPED — ${a.card.name} is gone for the run`;
    case "THRESHOLD_MET":
      return `Met ${a.threshold.stat} ${a.threshold.value}: ${a.threshold.outcome}`;
    case "STUFF_TAKEN":
      return `${a.character} took ${a.card.name}`;
    case "ROOM_CLEARED":
      return `Cleared ${a.room.name}`;
    case "ROOM_FLED":
      return `Fled ${a.room.name} — punishment on ${a.target}`;
    case "LAST_STAND":
      return `${a.character}'s deck is empty: last stand`;
    case "LAST_STAND_ESCAPED":
      return `${a.character} escaped last stand, price ${a.price.map((c: Card) => c.name).join(", ") || "nothing"}`;
    case "WENT_DOWN":
      return `${a.character} went DOWN (${a.cause})`;
    case "FLOOR_CLEARED":
      return `Floor ${a.floor} cleared`;
    case "REWARD_TAKEN":
      return `${a.character} took the reward ${a.card.name}`;
    case "REWARD_DECLINED":
      return `${a.character} declined the reward`;
    case "FLOOR_BUILT":
      return `Built floor ${a.floor}: ${a.rooms} rooms`;
    case "GAME_OVER":
      return `GAME OVER — ${a.outcome}`;
    case "OPEN_QUESTION":
      return `OPEN QUESTION (${a.id}): ${a.note}`;
    default:
      return e.type;
  }
}

function walkthroughPanel(): string {
  const sc = view.scenario;
  if (!sc) return "";
  const done = view.at >= sc.steps.length;
  const step = done ? null : sc.steps[view.at];
  return `<div class="walkthrough">
    <h3>${esc(sc.title)}</h3>
    <p class="question">${esc(sc.question)}</p>
    ${step ? `<p class="next">Next: ${esc(step.note || "(continue)")}</p>` : `<p class="next done">Walkthrough finished — carry on in free play, or pick another tab.</p>`}
    <button data-cmd="step" ${done ? "disabled" : ""}>Take the next step</button>
    <button data-cmd="restart">Restart this walkthrough</button>
  </div>`;
}

function render() {
  const s = view.state;
  $("tabs").innerHTML =
    `<button data-tab="free" class="${view.scenario ? "" : "on"}">Free play</button>` +
    ALL.map(
      (sc) => `<button data-tab="${sc.id}" class="${view.scenario?.id === sc.id ? "on" : ""}">${esc(sc.title)}</button>`,
    ).join("");

  $("walkthrough").innerHTML = walkthroughPanel();

  $("board").innerHTML = `
    <div class="meta">
      <span>Floor <b>${s.floor}</b></span>
      <span>Turn <b>${s.turn}</b></span>
      <span>Phase <b>${s.phase}</b></span>
      <span>Pool <b>Power ${pool(s).power} · Scramble ${pool(s).scramble}</b></span>
      <span>Floor deck <b>${s.floorDeck.length}</b></span>
      <span>Fled <b>${s.fled.length}</b></span>
      <span>Cleared <b>${s.cleared.length}</b></span>
      <span class="scrap">Scrapyard <b>${s.scrapyard.length}</b></span>
    </div>
    ${roomPanel()}
    <div class="controls">${controls()}</div>
    <div class="players">${playerPanel("Red")}${playerPanel("Gray")}</div>
    <div class="zone">${pileLine(
      "Play zone",
      s.playZone.map((p) => p.card),
    )}</div>
    <details><summary>Piles in full</summary>
      ${pileLine("Red exhaust", s.red.exhaust)}
      ${pileLine("Gray exhaust", s.gray.exhaust)}
      ${pileLine("Scrapyard (permanent)", s.scrapyard)}
      ${s.offer ? pileLine("Red is offered", s.offer.red) + pileLine("Gray is offered", s.offer.gray) : ""}
    </details>`;

  $("log").innerHTML = logPanel();
}

/* ------------------------------------------------------------------- wiring */

function loadScenario(id: string) {
  const sc = ALL.find((x) => x.id === id) ?? null;
  view.scenario = sc;
  view.at = 0;
  view.log = [];
  view.selected = { Red: [], Gray: [] };
  view.state = sc ? sc.setup(content) : reset();
  say(sc ? `Loaded: ${sc.title}` : "Fresh run", []);
  render();
}

function takeStep() {
  const sc = view.scenario;
  if (!sc || view.at >= sc.steps.length) return;
  const step = sc.steps[view.at++];
  const cmd = resolveStep(view.state, step);
  if (!cmd) {
    say("(no command — just look at the state)", [], step.note);
    render();
    return;
  }
  run(cmd, describeCommand(cmd), step.note);
}

function describeCommand(cmd: Command): string {
  switch (cmd.type) {
    case "PLAY_CARD":
      return `${cmd.character} plays a card`;
    case "DRAW":
      return `${cmd.character} draws`;
    case "END_PLAY":
      return `End of play phase`;
    default:
      return cmd.type;
  }
}

document.addEventListener("click", (e) => {
  const el = (e.target as HTMLElement).closest("[data-cmd],[data-tab],.chip") as HTMLElement | null;
  if (!el) return;

  const tab = el.dataset.tab;
  if (tab) return loadScenario(tab === "free" ? "" : tab);

  if (el.classList.contains("chip")) {
    // Ticking a card in hand: the first tick is the card you play, the rest pay for it.
    const id = el.dataset.id!;
    for (const c of ["Red", "Gray"] as const) {
      if (playerOf(view.state, c).hand.some((x) => x.id === id)) {
        const list = view.selected[c];
        view.selected[c] = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
        render();
        return;
      }
    }
    return;
  }

  const [cmd, arg] = (el.dataset.cmd ?? "").split(":");
  switch (cmd) {
    case "flip":
      return run({ type: "FLIP_ROOM" }, "Flip");
    case "draw":
      return run({ type: "DRAW", character: arg as Character }, `${arg} draws`);
    case "enddraw":
      return run({ type: "END_DRAW" }, "End of draw phase");
    case "play": {
      const c = arg as Character;
      const [cardId, ...payWith] = view.selected[c];
      if (!cardId) return;
      return run({ type: "PLAY_CARD", character: c, cardId, payWith }, `${c} plays`);
    }
    case "endplay":
      return run({ type: "END_PLAY", fleeTarget: arg as Character }, "End of play phase");
    case "ascend": {
      const pick = (c: Character) => {
        const offered = (c === "Red" ? view.state.offer?.red : view.state.offer?.gray) ?? [];
        return { takeRewardId: offered[0]?.id ?? null };
      };
      return run({ type: "ASCEND", red: pick("Red"), gray: pick("Gray") }, "Ascend");
    }
    case "step":
      return takeStep();
    case "restart":
      return loadScenario(view.scenario?.id ?? "");
    case "reseed":
      return loadScenario("");
  }
});

render();
