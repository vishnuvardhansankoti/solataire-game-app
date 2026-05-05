# FreeCell Schema Design — Implementation Guide

**Date:** 2026-05-05  
**Author:** Architect  
**Status:** Approved

---

## Overview

FreeCell Solitaire is implemented using the existing generic game engine with no modifications to core logic. The architecture leverages:

1. **Existing `freeCells` Pile Type** — Pre-designed in `GameConfig`
2. **Existing `descending-alternating-color` Strategy** — Already registered in strategy registry
3. **Deal Pattern Support** — Extended `tableauPileConfig` with `dealPattern` field

---

## Configuration Structure

### `src/games/freecell/config.json`

```json
{
  "gameId": "freecell",
  "displayName": "FreeCell Solitaire",
  "version": "1.0.0",
  "decks": 1,
  "piles": {
    "foundations": { "count": 4, "buildRule": "ascending-same-suit", "startsWith": 1 },
    "freeCells": { "count": 4, "buildRule": "none", "faceUp": true },
    "tableau": { "count": 8, "buildRule": "descending-alternating-color", "dealPattern": [7,7,7,7,6,6,6,6] }
  },
  "layout": { "topRow": ["freeCell", "freeCell", "freeCell", "freeCell", "gap", "foundation", "foundation", "foundation", "foundation"] }
}
```

### Key Fields

| Field | Value | Explanation |
|---|---|---|
| `gameId` | `"freecell"` | Unique identifier; used as localStorage key |
| `decks` | `1` | Single deck (52 cards total) |
| `piles.foundations.count` | `4` | One foundation per suit |
| `piles.foundations.buildRule` | `"ascending-same-suit"` | Ace → King by suit |
| `piles.freeCells.count` | `4` | Four temporary storage cells |
| `piles.freeCells.buildRule` | `"none"` | No automatic build rules; manual moves only |
| `piles.tableau.count` | `8` | Eight tableau columns |
| `piles.tableau.buildRule` | `"descending-alternating-color"` | King → Ace, alternating color |
| `piles.tableau.dealPattern` | `[7,7,7,7,6,6,6,6]` | Columns 1–4: 7 cards; Columns 5–8: 6 cards |
| `layout.topRow` | `["freeCell", "freeCell", ..., "foundation", ...]` | Defines visual arrangement |

---

## Pile Type Details

### Foundations (`ascending-same-suit`)

- **Count:** 4 (one per suit: ♠, ♥, ♦, ♣)
- **Build Rule:** Ascending by rank, same suit only
- **Start:** Ace (value 1)
- **Top Card:** Always face-up
- **Win Condition:** All 52 cards in foundations

---

### Free Cells (`buildRule: "none"`)

- **Count:** 4 temporary storage cells
- **Capacity:** 1 card per cell (enforced by engine)
- **Move Rules:** 
  - Any card can move TO a free cell (if empty)
  - Any card in a free cell can move OUT (to tableau or foundation)
  - No automatic stacking; no build rules apply
- **Purpose:** Unblock cards in tableau by temporary storage

---

### Tableau (`descending-alternating-color`)

- **Count:** 8 columns
- **Deal Pattern:** `[7,7,7,7,6,6,6,6]` → 28 + 24 = 52 cards dealt upfront
- **Build Rule:** 
  - Rank descends by 1 (King on empty, 10 on Jack, etc.)
  - Color alternates (♥/♦ red, ♠/♣ black)
  - Example: 10♥ (red) on J♣ (black) ✓
  - Example: 10♥ (red) on J♥ (same color) ✗
- **Empty Columns:** Any card can start an empty column
- **Top Card:** Always face-up
- **Note:** Sprint 2 supports single-card moves only (no cascading)

---

## No Stock Pile

FreeCell **omits the stock/waste pile cycle** entirely:
- All 52 cards are dealt to tableau at game start
- `GameEngine.newGame()` detects missing `stock` and handles accordingly
- Player cannot draw additional cards
- Win depends entirely on strategic tableau manipulation and free cell use

---

## Deal Sequence

`GameEngine.newGame()` with FreeCell config:

1. Shuffle 52-card deck
2. **Column 1–4:** Deal 7 cards each (28 total)
3. **Column 5–8:** Deal 6 cards each (24 total)
4. All 52 cards in tableau; all face-up
5. All 4 free cells empty
6. All 4 foundations empty
7. Timer starts at 00:00

---

## Move Validation Rules

### Valid Moves

| From | To | Condition |
|---|---|---|
| Tableau | Tableau | Top card descends by 1 rank AND alternates color |
| Tableau | Free Cell | Free cell is empty |
| Tableau | Foundation | Card matches suit and ascending sequence |
| Free Cell | Tableau | Follows tableau descending-alternating-color rule |
| Free Cell | Foundation | Follows foundation ascending-same-suit rule |

### Invalid Moves (Rejected)

- Tableau to occupied free cell
- Cards that don't match destination's build rule
- Non-top tableau cards (only visible top card can move)
- Any move from empty foundation (impossible; foundations never empty once started)

---

## Undo & State Management

### Undo Behavior

Undo reverses the previous move atomically:
- Card(s) return to source pile
- Free cell state updated (freed or refilled)
- Score adjustment reversed
- Move counter decremented
- Game history updated

### State Structure

`GameState.freeCells: Card[][]` stores free cell contents:
- `freeCells[0]` = first free cell (may be empty)
- Each cell holds 0 or 1 card

---

## Auto-Save & Persistence

FreeCell game state persists to localStorage:
- Key: `"svelte-solitaire:state:freecell"`
- Stored after each move (debounced 500ms)
- Includes: `tableau`, `foundations`, `freeCells`, `score`, `moves`, `elapsedSeconds`, `history`
- Resume feature: Player can reload and continue from last saved state

---

## Scoring (Simple)

- **Tableau to Foundation:** +10 points
- **No time penalties** (optional; not configured)
- Final score = number of foundation moves × 10

---

## Schema Validation

The config must pass `game-config.schema.json` validation:
- All required fields present
- `dealPattern` array sums to 52
- `buildRule` values match registered strategies
- Layout references match defined piles

---

## Future Extensions (Out of Scope Sprint 2)

- **Cascading Moves:** Move multiple cards at once (requires complex undo logic)
- **Super Moves:** Auto-cascade based on available free cells/empty columns
- **Statistics:** Session history, best times, move counts
- **Difficulty Levels:** Different deal patterns or rule variations
- **Mobile Optimization:** Conditional card size/layout for small screens

---

## References

- **ADR-005:** FreeCell architecture decision
- **Strategy Implementation:** `src/engine/strategies/DescendingAlternatingColorStrategy.ts`
- **Game Config Type:** `src/engine/GameConfig.ts`
- **Schema Validation:** `docs/schema/game-config.schema.json`
