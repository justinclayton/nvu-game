# Prototype: a seed solver for one seed

Wayfinder ticket [#240](https://github.com/justinclayton/nvu-game/issues/240). A throwaway, on this
branch only: [`app/scripts/solve-seed.ts`](../../../app/scripts/solve-seed.ts).

```sh
app/node_modules/.bin/tsx --tsconfig app/tsconfig.json app/scripts/solve-seed.ts --seed 7 \
  [--max-nodes N] [--max-seconds S] [--turns T] [--count-only] [--no-table]
```

Measured 2026-10-01 on a 32 GB laptop, Node 26, engine at `main` (`ab4378d`), card list as of that commit.

## What it does

Every transition is deterministic because the rng lives in `GameState.seed`, so the solver is a
plain walk over `legalCommands` and `execute`: no policy, no opinion. It walks one **layer** at a
time, from one fresh Turn Start to the next (or to GameOver), because floors have no fixed length:
seed 7 flips the Stairwell first, so a floor can end on turn 1.

Within a layer, states are deduplicated through a transposition table keyed on a 64-bit hash of
the state with every card and room projected to its id (cards are immutable printed faces, so the
id is the identity). The table also gives, without walking it, the size of the **raw tree** a
table-less solver would visit, and the number of distinct **lines** reaching each exit.

The move generator's one cap applies: an `OrderCards` answer over more than four cards offers only
the order shown and its reverse (`design/cli-sim/spec.md`, The move generator). None of the turn-1
walks below hit it, but a complete solver would have to pay that debt.

## Turn 1, from the seed's initial state

| seed | expanded states | interior | table hits | raw tree | lines to turn 2 | distinct turn-2 states | wall | heap |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 75,728 | 60,254 | 89,544 | 555,698 | 321,612 | 15,474 | 6 s | 97 MB |
| 2 | 101,925 | 80,615 | 94,152 | 196,077 | 115,462 | 21,310 | 6 s | 59 MB |
| 3 | 97,435 | 79,005 | 114,828 | 657,715 | 378,382 | 18,430 | 6 s | 74 MB |
| 11 | 84,720 | 67,227 | 95,066 | 518,660 | 297,197 | 17,493 | 5 s | 69 MB |
| 12 | 282,693 | 213,095 | 310,824 | 593,517 | 380,422 | 69,598 | 17 s | 155 MB |
| 7 | 6,514,207 | 1,245,511 | 1,475,728 | 84,614,195 | not captured | 5,268,696 | 246 s | 2.3 GB |

*Expanded* is distinct states visited; *interior* is those that had a move to make (the rest are
exits). *Raw tree* is what the same walk costs without the table. Seed 7's lines were not captured
(the count-only mode gained line counts after that run); its raw tree bounds them.

Legal moves at the first Play step: 45 to 48 commands, almost all `PLAY_CARD` with one entry per
payment combination. Depth of a turn: 8 to 13 commands.

Seed 7 is the heavy case for a reason worth knowing: its first room is the Stairwell, fleeing it
deals Spore Cloud to both characters, and Spore Cloud's "Discard down to 3 cards" is a
`ChooseCards` over C(5,3) = 10 answers for each character. One Bad Stuff card multiplied the
turn's exits by about a hundred. Seed 12 is mid-way for a similar reason.

## Turn 2

Seed 1, with the table and the turn-2 roots retained, on an 8 GB heap and a 4 million state budget:

| layer | roots | expanded | table hits | raw tree | lines from the start | distinct next-turn states | wall | heap |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| turn 1 | 1 | 75,728 | 89,544 | 555,698 | 321,612 | 15,474 | 6 s | 97 MB |
| turn 2 | 15,474 | 4,000,000 (budget) | 4,221,012 | 27,562,555 | 204,669,747 | 853,366 | 248 s | 4.0 GB |

The budget ran out with **34 of the 15,474 roots** fully walked: about 115,000 distinct states per
root, with the table merging roughly half of what the roots share. Taken straight, turn 2 of seed
1 is on the order of 10^8 to 10^9 distinct states and more than 10^11 lines, which at the measured
16,000 states a second on a heap this size is a day of wall time and hundreds of gigabytes. No
victory, defeat or abort was reachable inside two turns of this seed, so every line was still
alive.

## Cost per node

| mode | per node | notes |
|---|---:|---|
| engine only (`legalCommands` + `execute`) | 9 µs | measured over 2,000 repeats of the first Play step |
| table-less walk | about 4 µs | 400,000 nodes in 1.7 s; most nodes are leaves that call nothing |
| walk with the table | about 30 to 40 µs | the hash over the id-projected state dominates; a full `JSON.stringify` of the state is 77 KB and 50 µs, and the first draft hashed that at 500 µs a node |

Memory with the table is about 350 bytes a state in count-only mode (seed 7: 6.5 M states in
2.3 GB) and about 3 KB a state when the next layer's roots and the edges for line counting are
retained (the first draft ran out of a 4 GB heap at 1.5 M states, and 1.5 M states cost 5 GB with
a 12 GB heap).

## Where it stops being feasible

Within floor 1, on turn 2. A single turn from a single state is tractable and fast: a few hundred
thousand raw nodes, 15 to 70 thousand distinct successor states, five to twenty seconds, under
200 MB, and about seven times cheaper with the table than without. The trouble is the fan-out
between turns: turn 2 starts from every one of those 15 to 70 thousand states (5 million on a
bad flee), each with its own turn-sized subtree. Transposition across those roots merges about
half, and the measured turn-2 walk is still four orders of magnitude bigger than turn 1, with a
floor five to ten turns long and nine floors after it. A whole-game enumeration, "winnable and by how
many lines", is out of reach by a factor that no table or constant-factor speedup closes.

## What a solver can still answer, for the next decision

These are the agent's reading of the numbers, for ticket #248 to rule on, not decisions.

- **One turn, exactly.** From any state, every line through the current turn, with every exit
  counted: whether this room could have been cleared, whether anyone had to go Down, what the best
  reachable threshold was. Seconds and megabytes. This is a hindsight oracle per turn of a run
  file, not a solver of the seed.
- **Existence, not count.** "Is there a winning line" is a search with early exit, not an
  enumeration, and it needs move ordering and pruning to be anything but luck. Proving a seed
  *unwinnable* is the full enumeration again, so this answers yes or "not found", never no.
- **A floor, under symmetry.** Discard choices and payment choices account for most of the
  fan-out. A solver that treats identical copies of a card as interchangeable, and payments by
  the multiset of cards spent rather than their ids, would shrink the table by a large constant.
  Unmeasured; it does not change the order-of-magnitude verdict.
