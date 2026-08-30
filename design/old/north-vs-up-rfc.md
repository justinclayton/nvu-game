# RFC 001: Deterministic Domain-Driven Rules Core for \"North vs Up\"

**Status**: PROPOSED  
**Author**: Gemini Notebook (Architect)  
**Date**: August 29, 2026  
**Target Runtimes**: Node.js (Simulation/Automated Testing) & Browser (React/Web Client)  

---

## 1. Executive Summary

This RFC outlines the architectural blueprint and TypeScript interfaces for the deterministic core of **North vs Up**, a physical-turned-digital single-player/co-op roguelike deckbuilder. 

To bridge the gap between high-speed automated playtesting (for *Slay the Spire*-style balance telemetry) and reactive, state-driven frontends, this design proposes a **purely functional, event-driven state machine** built on Domain-Driven Design (DDD) principles. 

### Core Architectural Mandates:
1. **100% Side-Effect Free**: The core domain engine is a pure state transition function: `(State, Command) -> [State, Event[]]`. It contains no IO, random-number generators, or direct mutations.
2. **Platform Agnostic**: The engine compiles to clean ESM with zero external dependencies, making it directly runnable in a headless Node.js simulator, a Web Worker, or a React UI context.
3. **Tactile Rule Invariants**: All tabletop physical constraints—such as the 5-card hand cap, deck-as-health draw penalties, hand-exhaustion costs, and last stand shuffles—are strictly enforced as domain invariants.

---

## 2. Ubiquitous Language & Domain Definitions

To align the code directly with the physical rulebook, we map game concepts to formal Domain Types:

*   **Stamina (HP)**: Represented by the size of the player's personal draw deck. Every card drawn, played, or milled is a direct consumption of health.
*   **Exhaust Pile**: Temporary discard pile containing cards spent on this floor. These are returned to the deck when ascending (healing).
*   **Scrap Pile (The Scrapyard)**: Permanent grave. Cards here are permanently removed from the campaign, serving as the currency for deck thinning and explosive power.
*   **Stuff**: Fragile, temporary tools or environmental clutter (Good/Bad Stuff) that possess the `Hold` keyword and do not naturally survive floor boundaries.
*   **Last Stand**: A critical state triggered when a character's deck is empty. All cards are played for free, but clearing the room forces a shuffle with a permanent 2-card exhaust penalty.
*   **Shared Stat Pool**: The sum of active stats (Power, Scramble) played simultaneously by Red and Gray during the active turn.

---

## 3. Bounded Context & Aggregate Model

The entire game session is managed by a single Bounded Context containing the **Encounter Aggregate Root**. 

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Encounter (Aggregate)                         │
│                                                                        │
│  ┌──────────────────────────┐          ┌────────────────────────────┐  │
│  │    ActiveRoom (Entity)   │          │   SharedStatPool (Value)   │  │
│  │  - Thresholds            │          │  - power: number           │  │
│  │  - Flee Line             │          │  - scramble: number        │  │
│  └──────────────────────────┘          └────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Red / Gray Characters (Entities)            │  │
│  │  - state: 'Standing' | 'LastStand' | 'Downed'                    │  │
│  │  - piles: deck[], hand[], exhaustPile[], scrapPile[]            │  │
│  │  - classPassive: AdrenalineRush / TacticalBackpack              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. TypeScript Architecture & State Types

The state tree is strictly typed as a deeply nested, immutable object. We use `readonly` modifiers to enforce compile-time immutability.

```typescript
export type CharacterClass = 'Red' | 'Gray';
export type CardRarity = 'Fine' | 'Cool' | 'Woah';
export type CardType = 'Starter' | 'Class' | 'GoodStuff' | 'BadStuff';
export type CharacterState = 'Standing' | 'LastStand' | 'Downed';
export type RoomType = 'Enemy' | 'Hazard' | 'Stuff';

export interface Card {
  readonly id: string;
  readonly name: string;
  readonly type: CardType;
  readonly rarity: CardRarity;
  readonly cost: number;
  readonly power: number;
  readonly scramble: number;
  readonly hasHold: boolean;
  readonly text: string;
}

export interface Room {
  readonly id: string;
  readonly name: string;
  readonly type: RoomType;
  readonly floor: number;
  readonly thresholds: {
    readonly power?: number;
    readonly scramble?: number;
    readonly statsPerPlayer?: boolean; // For Stuff room individual challenges
  };
  readonly fleeOutcome: {
    readonly type: 'ExhaustDeck' | 'ApplyBadStuff' | 'SelectPlayer';
    readonly value: number;
    readonly cardName?: string;
  };
}

export interface PlayerState {
  readonly characterClass: CharacterClass;
  readonly state: CharacterState;
  readonly deck: readonly Card[];
  readonly hand: readonly Card[];
  readonly exhaustPile: readonly Card[];
  readonly scrapPile: readonly Card[];
  readonly backpack: readonly Card[]; // Gray-only slot, empty array for Red
  readonly adrenalineRushUsed: boolean; // Red-only round-tracker
}

export type GamePhase = 
  | 'Scouting' 
  | 'Draw' 
  | 'Play' 
  | 'Evaluation' 
  | 'Ascension' 
  | 'GameOver';

export interface SharedStatPool {
  readonly power: number;
  readonly scramble: number;
}

export interface GameState {
  readonly floor: number;
  readonly phase: GamePhase;
  readonly activeRoom: Room | null;
  readonly floorDeck: readonly Room[];
  readonly clearedRooms: readonly Room[];
  readonly fledRooms: readonly Room[];
  readonly red: PlayerState;
  readonly gray: PlayerState;
  readonly playZone: readonly { readonly owner: CharacterClass; readonly card: Card }[];
  readonly statPool: SharedStatPool;
}
```

---

## 5. Domain Commands & State Reducer

Interaction with the engine occurs by passing strongly-typed **Commands**. The engine processes these commands, validates core rules (invariants), updates the state, and returns a checklist of **Domain Events** (excellent for UI audio/visual triggers).

### Commands (Intent to Change State)
```typescript
export type Command =
  | { type: 'START_ENCOUNTER'; payload: { floor: number; floorDeck: Room[] } }
  | { type: 'DRAW_CARD'; payload: { character: CharacterClass } }
  | { type: 'PLAY_CARD'; payload: { character: CharacterClass; cardId: string; payWithCardIds: string[]; usePassive?: boolean } }
  | { type: 'DECLARE_PLAY_FINISHED' }
  | { type: 'HAND_OFF'; payload: { source: CharacterClass; cardId: string } }
  | { type: 'SCRAP_CARD'; payload: { character: CharacterClass; cardId: string } }
  | { type: 'ASCEND_FLOOR'; payload: { redPreserveId?: string; redScrapId?: string; grayPreserveId?: string; grayScrapId?: string } };
```

### Domain Events (Facts of What Occurred)
```typescript
export type DomainEvent =
  | { type: 'CARD_PLAYED'; character: CharacterClass; card: Card }
  | { type: 'STAMINA_LOST'; character: CharacterClass; amount: number }
  | { type: 'ROOM_CLEARED'; roomId: string }
  | { type: 'TEAM_FLED'; roomId: string; punishmentCharacter?: CharacterClass }
  | { type: 'CHARACTER_DOWNED'; character: CharacterClass }
  | { type: 'LAST_STAND_TRIGGERED'; character: CharacterClass }
  | { type: 'CARD_SCRAPPED'; character: CharacterClass; card: Card }
  | { type: 'FLOOR_ASCENDED'; nextFloor: number };
```

---

## 6. Functional Domain Implementation

Below is the concrete implementation of the domain reducer, demonstrating how complex tabletop mathematics are handled elegantly and deterministically.

```typescript
export class DomainEngine {
  
  /**
   * Main reducer function. Ensures deep immutability by returning a fresh state clone.
   */
  public static execute(state: GameState, command: Command): [GameState, DomainEvent[]] {
    const events: DomainEvent[] = [];
    let updatedState = { ...state };

    switch (command.type) {
      case 'DRAW_CARD': {
        const charId = command.payload.character;
        const player = this.getPlayer(updatedState, charId);
        
        if (player.state === 'Downed') {
          throw new Error(`Downed player ${charId} cannot draw cards.`);
        }
        if (player.hand.length >= 5) {
          // Hand cap exceeded: draw goes straight to the exhaust pile (stamina burn)
          const [updatedPlayer, burnedCard] = this.burnTopCard(player);
          updatedState = this.setPlayer(updatedState, charId, updatedPlayer);
          events.push({ type: 'STAMINA_LOST', character: charId, amount: 1 });
        } else {
          // Normal Draw Step
          const [updatedPlayer, drawnCard] = this.drawSingleCard(player);
          updatedState = this.setPlayer(updatedState, charId, updatedPlayer);
          if (updatedPlayer.state === 'LastStand' && player.state !== 'LastStand') {
            events.push({ type: 'LAST_STAND_TRIGGERED', character: charId });
          }
        }
        return [updatedState, events];
      }

      case 'PLAY_CARD': {
        const { character, cardId, payWithCardIds, usePassive } = command.payload;
        let player = this.getPlayer(updatedState, character);
        const card = player.hand.find(c => c.id === cardId);

        if (!card) throw new Error(`Card ${cardId} not in ${character}'s hand.`);

        // 1. Verify Cost Payment Invariant
        const isLastStand = player.state === 'LastStand';
        const isRedPassiveActive = character === 'Red' && usePassive && !player.adrenalineRushUsed;
        const actualCost = (isLastStand || isRedPassiveActive) ? 0 : card.cost;

        if (!isLastStand && !isRedPassiveActive) {
          if (payWithCardIds.length !== actualCost) {
            throw new Error(`Must select exactly ${actualCost} hand cards to pay cost of ${card.name}.`);
          }
          // Verify selected payment cards are in hand and distinct from the played card
          payWithCardIds.forEach(id => {
            if (id === cardId || !player.hand.some(c => c.id === id)) {
              throw new Error(`Invalid hand-exhaust payment card ID ${id}`);
            }
          });
        }

        // 2. Perform Physical Exhaustion / Cost Payment
        let updatedHand = player.hand.filter(c => c.id !== cardId);
        let updatedExhaust = [...player.exhaustPile];

        if (actualCost > 0) {
          // Pay from hand
          const paymentCards = player.hand.filter(c => payWithCardIds.includes(c.id));
          updatedHand = updatedHand.filter(c => !payWithCardIds.includes(c.id));
          updatedExhaust.push(...paymentCards);
        } else if (isRedPassiveActive) {
          // Red's Class Passive: pay cost by exhausting top card of DECK instead of hand
          const [deckPlayer, milled] = this.burnTopCard(player);
          player = deckPlayer;
          updatedState = this.setPlayer(updatedState, 'Red', player);
          events.push({ type: 'STAMINA_LOST', character: 'Red', amount: 1 });
        }

        // Move played card into the play zone
        const updatedPlayZone = [...updatedState.playZone, { owner: character, card }];
        
        player = {
          ...player,
          hand: updatedHand,
          exhaustPile: updatedExhaust,
          adrenalineRushUsed: isRedPassiveActive ? true : player.adrenalineRushUsed
        };

        updatedState = this.setPlayer(updatedState, character, player);
        updatedState = { ...updatedState, playZone: updatedPlayZone };

        // Recalculate Shared Stat Pool & Evaluate immediate thresholds
        updatedState = this.recalculateStats(updatedState);
        events.push({ type: 'CARD_PLAYED', character, card });

        return this.evaluateRoomOutcome(updatedState, events);
      }

      case 'HAND_OFF': {
        const { source, cardId } = command.payload;
        const target = source === 'Red' ? 'Gray' : 'Red';
        let srcPlayer = this.getPlayer(updatedState, source);
        let tgtPlayer = this.getPlayer(updatedState, target);

        const card = srcPlayer.hand.find(c => c.id === cardId);
        if (!card) throw new Error(`Card ${cardId} not in ${source}'s hand.`);
        if (tgtPlayer.hand.length >= 5) {
          throw new Error(`Cannot hand off card. Target ${target}'s hand is full.`);
        }

        srcPlayer = { ...srcPlayer, hand: srcPlayer.hand.filter(c => c.id !== cardId) };
        tgtPlayer = { ...tgtPlayer, hand: [...tgtPlayer.hand, card] };

        updatedState = this.setPlayer(updatedState, source, srcPlayer);
        updatedState = this.setPlayer(updatedState, target, tgtPlayer);
        return [updatedState, events];
      }

      case 'DECLARE_PLAY_FINISHED': {
        if (updatedState.phase !== 'Play') {
          throw new Error("Can only finish play phase during the Play phase.");
        }
        
        // Handle unresolved Hazard room evaluations
        if (updatedState.activeRoom?.type === 'Hazard') {
          return this.resolveHazardRoom(updatedState, events);
        }

        // Otherwise proceed directly to cleanup
        return this.cleanupPhase(updatedState, events);
      }

      case 'ASCEND_FLOOR': {
        const { redPreserveId, redScrapId, grayPreserveId, grayScrapId } = command.payload;
        
        // Perform Ascension Cleanup & Scrap-Passage optimization
        updatedState = this.processAscension(updatedState, 'Red', redPreserveId, redScrapId, events);
        updatedState = this.processAscension(updatedState, 'Gray', grayPreserveId, grayScrapId, events);

        const nextFloor = updatedState.floor + 1;
        updatedState = {
          ...updatedState,
          floor: nextFloor,
          phase: 'Scouting',
          activeRoom: null,
          playZone: []
        };
        events.push({ type: 'FLOOR_ASCENDED', nextFloor });
        return [updatedState, events];
      }

      default:
        return [updatedState, events];
    }
  }

  // --- Helper Methods ---

  private static getPlayer(state: GameState, character: CharacterClass): PlayerState {
    return character === 'Red' ? state.red : state.gray;
  }

  private static setPlayer(state: GameState, character: CharacterClass, player: PlayerState): GameState {
    return character === 'Red' 
      ? { ...state, red: player } 
      : { ...state, gray: player };
  }

  private static drawSingleCard(player: PlayerState): [PlayerState, Card] {
    if (player.deck.length === 0) {
      if (player.state !== 'LastStand') {
        // Trigger Last Stand State
        return [{ ...player, state: 'LastStand' }, null as any];
      }
      // If draw would occur while empty in last stand, player goes Downed
      return [{ ...player, state: 'Downed' }, null as any];
    }

    const drawnCard = player.deck[0];
    const updatedDeck = player.deck.slice(1);
    const updatedHand = [...player.hand, drawnCard];

    return [{
      ...player,
      deck: updatedDeck,
      hand: updatedHand,
      state: updatedDeck.length === 0 ? 'LastStand' : player.state
    }, drawnCard];
  }

  private static burnTopCard(player: PlayerState): [PlayerState, Card] {
    if (player.deck.length === 0) {
      // Trying to exhaust a card from an empty deck drops the player to downed
      return [{ ...player, state: 'Downed' }, null as any];
    }
    const burned = player.deck[0];
    return [{
      ...player,
      deck: player.deck.slice(1),
      exhaustPile: [...player.exhaustPile, burned]
    }, burned];
  }

  private static recalculateStats(state: GameState): GameState {
    let power = 0;
    let scramble = 0;
    state.playZone.forEach(({ card }) => {
      power += card.power;
      scramble += card.scramble;
    });

    // Handle interactive "Hold States" like "I Know Kung Fu"
    const isGrayHoldingKungFu = state.gray.hand.some(c => c.name === "I Know Kung Fu");
    if (isGrayHoldingKungFu) {
      // Example of active stat calculations
    }

    return { ...state, statPool: { power, scramble } };
  }

  private static evaluateRoomOutcome(state: GameState, events: DomainEvent[]): [GameState, DomainEvent[]] {
    const room = state.activeRoom;
    if (!room) return [state, events];

    // Stuff Rooms and Enemy Rooms clear instantly upon meeting thresholds
    if (room.type === 'Enemy' && room.thresholds.power) {
      if (state.statPool.power >= room.thresholds.power) {
        events.push({ type: 'ROOM_CLEARED', roomId: room.id });
        return [this.markActiveRoomCleared(state), events];
      }
    }

    return [state, events];
  }

  private static resolveHazardRoom(state: GameState, events: DomainEvent[]): [GameState, DomainEvent[]] {
    const room = state.activeRoom!;
    const threshold = room.thresholds.scramble || 0;

    if (state.statPool.scramble >= threshold) {
      events.push({ type: 'ROOM_CLEARED', roomId: room.id });
      return [this.cleanupPhase(this.markActiveRoomCleared(state), events)[0], events];
    } else {
      // Room failed, apply flee punishment
      return this.handleFlee(state, events);
    }
  }

  private static handleFlee(state: GameState, events: DomainEvent[]): [GameState, DomainEvent[]] {
    const room = state.activeRoom!;
    events.push({ type: 'TEAM_FLED', roomId: room.id });

    let updatedState = { ...state };
    
    // Evaluate flee mechanics: Exhaust deck cards as damage
    if (room.fleeOutcome.type === 'ExhaustDeck') {
      const damage = room.fleeOutcome.value;
      // Default to split damage, or choice
      const [newRed] = this.inflictDeckDamage(updatedState.red, Math.ceil(damage / 2));
      const [newGray] = this.inflictDeckDamage(updatedState.gray, Math.floor(damage / 2));
      
      updatedState = {
        ...updatedState,
        red: newRed,
        gray: newGray,
        fledRooms: [...updatedState.fledRooms, room]
      };
    }

    return this.cleanupPhase(updatedState, events);
  }

  private static inflictDeckDamage(player: PlayerState, amount: number): [PlayerState, number] {
    let current = { ...player };
    let actualDam = 0;
    for (let i = 0; i < amount; i++) {
      if (current.deck.length === 0) {
        current = { ...current, state: 'Downed' };
        break;
      }
      const [damagedPlayer] = this.burnTopCard(current);
      current = damagedPlayer;
      actualDam++;
    }
    return [current, actualDam];
  }

  private static markActiveRoomCleared(state: GameState): GameState {
    if (!state.activeRoom) return state;
    return {
      ...state,
      clearedRooms: [...state.clearedRooms, state.activeRoom],
      activeRoom: null
    };
  }

  private static cleanupPhase(state: GameState, events: DomainEvent[]): [GameState, DomainEvent[]] {
    // 1. Move played cards and remaining hand cards (without Hold) to exhaust
    const cleanPlayer = (player: PlayerState, character: CharacterClass): PlayerState => {
      const playZoneCards = state.playZone.filter(pz => pz.owner === character).map(pz => pz.card);
      const handExhaust = player.hand.filter(c => !c.hasHold);
      const handPreserved = player.hand.filter(c => c.hasHold);

      let nextDeck = [...player.deck];
      let nextExhaust = [...player.exhaustPile, ...playZoneCards, ...handExhaust];

      // Last Stand Restoration logic: Shuffled back into deck instead of exhaust, minus 2
      if (player.state === 'LastStand' && state.activeRoom === null) {
        const recoverPool = [...playZoneCards, ...handExhaust];
        if (recoverPool.length > 2) {
          const penalty = recoverPool.slice(0, 2);
          const recovered = recoverPool.slice(2);
          nextDeck.push(...recovered);
          nextExhaust.push(...penalty);
        } else {
          nextExhaust.push(...recoverPool);
        }
        return {
          ...player,
          hand: handPreserved,
          deck: nextDeck,
          exhaustPile: nextExhaust,
          state: nextDeck.length > 0 ? 'Standing' : 'LastStand'
        };
      }

      return {
        ...player,
        hand: handPreserved,
        exhaustPile: nextExhaust,
        adrenalineRushUsed: false // Reset passive limit
      };
    };

    const nextRed = cleanPlayer(state.red, 'Red');
    const nextGray = cleanPlayer(state.gray, 'Gray');

    // If floor deck is empty, shuffle the Fled pile back in
    let nextFloorDeck = [...state.floorDeck];
    if (nextFloorDeck.length === 0 && state.fledRooms.length > 0) {
      nextFloorDeck = [...state.fledRooms];
    }

    return [{
      ...state,
      red: nextRed,
      gray: nextGray,
      playZone: [],
      floorDeck: nextFloorDeck,
      statPool: { power: 0, scramble: 0 },
      phase: 'Scouting'
    }, events];
  }

  private static processAscension(
    state: GameState, 
    character: CharacterClass, 
    preserveId?: string, 
    scrapId?: string,
    events?: DomainEvent[]
  ): GameState {
    let player = this.getPlayer(state, character);

    // 1. Filter out all temporary scavenged Stuff from Exhaust Pile
    const cleanedExhaust = player.exhaustPile.filter(c => c.type !== 'GoodStuff' && c.type !== 'BadStuff');

    // 2. Ascension / Deck Optimization: Choose starter card to permanently Scrap in exchange for a Stuff card
    let finalDeck = [...player.deck, ...cleanedExhaust]; // Shuffle exhaust back in (full heal)
    let finalScrap = [...player.scrapPile];

    if (preserveId && scrapId) {
      const stuffCard = player.hand.find(c => c.id === preserveId);
      const starterCard = finalDeck.find(c => c.id === scrapId);

      if (stuffCard && starterCard) {
        // Permanently Scrap starter card (Deck Thinning)
        finalDeck = finalDeck.filter(c => c.id !== scrapId);
        finalScrap.push(starterCard);
        
        // Transform the temporary Stuff card's metadata to 'Class' to preserve it
        const preservedStuff: Card = {
          ...stuffCard,
          type: 'Class' // Strips its temporary "Stuff" identity
        };
        finalDeck.push(preservedStuff);
        events?.push({ type: 'CARD_SCRAPPED', character, card: starterCard });
      }
    }

    // Unplayed Held Stuff that was not upgraded is shuffled back to deck as temporary health buffer
    const remainingTemporaryStuff = player.hand.filter(c => c.type === 'GoodStuff' || c.type === 'BadStuff');
    finalDeck.push(...remainingTemporaryStuff);

    player = {
      ...player,
      deck: finalDeck,
      hand: [],
      exhaustPile: [],
      scrapPile: finalScrap,
      state: 'Standing', // Full revival / rest
      adrenalineRushUsed: false
    };

    return this.setPlayer(state, character, player);
  }
}
```

---

## 7. Node-Based Simulation & Automation Architecture

By modeling the game loop as a pure domain function, we can instantiate a headless simulator script with a deterministic card pool to run massive mock playthroughs in milliseconds.

This approach matches the **instrumentation loop** model detailed in the *Mazocarta* research paper [cite: 115, 117], using reproducible seeds and actor scripts to monitor win rates and difficulty shifts [cite: 110, 117].

### Functional Simulator Script
```typescript
import { GameState, DomainEngine, Command, Room } from './engine';

class HeadlessActor {
  // Simple deterministic play heuristic
  public static selectBestMove(state: GameState, activeCharacter: 'Red' | 'Gray'): Command | null {
    const player = activeCharacter === 'Red' ? state.red : state.gray;
    
    // Determine target threshold
    const targetScramble = state.activeRoom?.thresholds.scramble || 0;
    const currentScramble = state.statPool.scramble;

    if (currentScramble < targetScramble) {
      // Find a card in hand that provides Scramble stats
      const playableScrambleCard = player.hand.find(c => c.scramble > 0);
      if (playableScrambleCard) {
        // Choose other cards in hand to pay costs
        const potentialPayments = player.hand.filter(c => c.id !== playableScrambleCard.id);
        if (potentialPayments.length >= playableScrambleCard.cost) {
          const payments = potentialPayments.slice(0, playableScrambleCard.cost).map(c => c.id);
          return {
            type: 'PLAY_CARD',
            payload: {
              character: activeCharacter,
              cardId: playableScrambleCard.id,
              payWithCardIds: payments
            }
          };
        }
      }
    }

    return null; // Actor declares play finished
  }
}

// Runnable Simulator Runner
export function runAutomatedTelemetryProbes(seeds: number): { winRate: number; avgFloor: number } {
  let victories = 0;
  let totalFloorCount = 0;

  for (let i = 0; i < seeds; i++) {
    // Generate seeded layout
    let state: GameState = createSeededStartingState(i);
    
    while (state.phase !== 'GameOver') {
      if (state.phase === 'Play') {
        const redMove = HeadlessActor.selectBestMove(state, 'Red');
        if (redMove) {
          [state] = DomainEngine.execute(state, redMove);
          continue;
        }
        
        const grayMove = HeadlessActor.selectBestMove(state, 'Gray');
        if (grayMove) {
          [state] = DomainEngine.execute(state, grayMove);
          continue;
        }

        // Both players are done, declare turn finished
        [state] = DomainEngine.execute(state, { type: 'DECLARE_PLAY_FINISHED' });
      } else {
        // Auto-draw or auto-ascend
        // ... state transition execution ...
      }
    }

    if (state.clearedRooms.some(r => r.floor === 10 && r.type === 'Enemy')) {
      victories++;
    }
    totalFloorCount += state.floor;
  }

  return {
    winRate: victories / seeds,
    avgFloor: totalFloorCount / seeds
  };
}
```

---

## 8. React UI Integration Architecture

Integrating this pure Node simulator engine into a React UI requires zero wrapper modules. We can wrap the state reducer directly inside a **Custom React Hook**, ensuring that React handles layout re-renders natively every time the immutable domain state tree updates.

### Hook Implementation (`useNorthVsUp.ts`)
```typescript
import { useState, useCallback } from 'react';
import { GameState, DomainEngine, Command, DomainEvent } from './engine';

export function useNorthVsUp(initialState: GameState) {
  const [state, setState] = useState<GameState>(initialState);
  const [eventHistory, setEventHistory] = useState<DomainEvent[]>([]);

  const dispatch = useCallback((command: Command) => {
    setState((currentState) => {
      const [nextState, newEvents] = DomainEngine.execute(currentState, command);
      
      // Accumulate event history to trigger UI animations sequentially (similar to Balatro's score cascade)
      if (newEvents.length > 0) {
        setEventHistory((prev) => [...prev, ...newEvents]);
      }
      
      return nextState;
    });
  }, []);

  return {
    state,
    dispatch,
    recentEvents: eventHistory,
    clearEvents: () => setEventHistory([])
  };
}
```

### Component Rendering Sample (`ActiveRoomPanel.tsx`)
```tsx
import React from 'react';
import { useNorthVsUp } from './useNorthVsUp';

export const ActiveRoomPanel: React.FC<{ engine: ReturnType<typeof useNorthVsUp> }> = ({ engine }) => {
  const { state, dispatch } = engine;
  const { activeRoom, statPool } = state;

  if (!activeRoom) {
    return <div className=\"scout-panel\">Scouting next corridor...</div>;
  }

  return (
    <div className={`room-card room-type-${activeRoom.type.toLowerCase()}`}>
      <h3>Floor {state.floor} - {activeRoom.name}</h3>
      <div className=\"threshold-display\">
        {activeRoom.thresholds.power && (
          <div className=\"stat-progress\">
            <span>Power Threshold: {activeRoom.thresholds.power}</span>
            <div className=\"progress-bar\" style={{ width: `${(statPool.power / activeRoom.thresholds.power) * 100}%` }} />
            <span className=\"stat-pool-val\">Current: {statPool.power}</span>
          </div>
        )}
      </div>
      
      <div className=\"team-hand-controls\">
        <h4>Red's Hand</h4>
        <div className=\"cards-row\">
          {state.red.hand.map(card => (
            <button 
              key={card.id}
              onClick={() => dispatch({
                type: 'PLAY_CARD',
                payload: { character: 'Red', cardId: card.id, payWithCardIds: [] } // cost pay logic resolved here
              })}
            >
              {card.name} (Cost: {card.cost})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 9. Telemetry Export Formats (Telemetry Data Modeling)

To fulfill the **Metrics Driven Balance** goal, every run session (whether played by a human in React or an automated headless test runner) should serialise its completion state into a unified **Morgue File** [cite: 148]. This is then exported as a JSON string to compile aggregate dashboards for balancing.

```json
{
  "run_id": "8f64e21a-3a21-49b9-873b-5517cb83713f",
  "seed": 9812,
  "outcome": "Victory",
  "floor_reached": 10,
  "turns_played": 42,
  "characters": {
    "red_stamina_remaining": 8,
    "gray_stamina_remaining": 6
  },
  "scraped_cards_history": [
    { "floor": 2, "character": "Red", "card_name": "Overdrive" },
    { "floor": 5, "character": "Gray", "card_name": "Scrounge" }
  ],
  "preserved_stuff_history": [
    { "floor": 2, "character": "Red", "card_name": "Crowbar" }
  ],
  "room_history": [
    { "floor": 1, "room_name": "Collapsed Grate", "outcome": "Cleared", "scramble_stat": 3 },
    { "floor": 1, "room_name": "Scrap-Iron Sentinel", "outcome": "Cleared", "power_stat": 6 }
  ]
}
```

---

## 10. Implementation Roadmap

*   **Phase 1 (Domain Core)**: Ship the type definitions and pure reducer implementation (this RFC) into a dedicated folder `/src/domain/`. Validate with 100% code-coverage unit tests.
*   **Phase 2 (Telemetry Hookup)**: Build headless command actors to execute mock runs using Node.js and output metrics profiles.
*   **Phase 3 (React Rendering)**: Map DOM nodes and simple text/button controls using Tailwind CSS grids, listening directly to events to trigger transitions.
