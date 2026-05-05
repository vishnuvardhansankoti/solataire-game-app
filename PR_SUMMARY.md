# PR Summary — FreeCell Solitaire Implementation

## What

Implements FreeCell Solitaire game engine support, extending the generic card engine to handle free cell pile mechanics.

### Files Changed

**Engine (core changes):**
- `src/engine/types.ts` — Added `freeCells: Array<Card | null>` field to `GameState` interface
- `src/engine/GameEngine.ts` — Initializes free cell slots on `newGame()`; added `allFaceUp` deal logic (FreeCell deals all cards face-up)
- `src/engine/MoveValidator.ts` — Added `freeCell` case to `canMove()` (single-card moves only; slot must be empty) and `getTopCard()`
- `src/engine/StateManager.ts` — Added `freeCell` case to `removeFromPile()` (null slot) and `addToPile()` (assign card to slot); fixed pre-existing `flippedCardIndex` exactOptionalPropertyTypes error

**Game config:**
- `src/games/freecell/config.json` — Updated `tableau.faceUp: true` (all cards dealt face-up, standard FreeCell rules)

**Tests:**
- `tests/unit/freecell-config.spec.ts` — 34 new tests: config structure, deal pattern validation, GameEngine deal correctness, uniqueness/completeness of 52-card deal
- `tests/unit/freecell-moves.spec.ts` — 38 new tests: free cell moves (valid/invalid), tableau alternating-color rules, foundation moves, engine `applyMove`/`undo` integration, win detection

**Existing test fixes (backward compat):**
- `tests/unit/MoveValidator.spec.ts` — Added `freeCells: []` to `makeState()`
- `tests/unit/StateManager.spec.ts` — Added `freeCells: []` to `baseState()`
- `tests/unit/WinDetector.spec.ts` — Added `freeCells: []` to `makeState()`

## Why

Sprint 2 Task 2: FreeCell is the second game added to the platform, demonstrating the extensibility of the config-driven game engine. Architecture (ADR-005) confirmed zero engine refactoring was needed — `freeCells` pile type existed in `GameConfig`, `descending-alternating-color` strategy was pre-registered, and `dealPattern` support was already implemented for Spider.

## Test Results

| Metric | Before | After |
|---|---|---|
| Total unit tests | 71 | **143** |
| Test files | 7 | **9** |
| New FreeCell tests | — | **72** (34 config + 38 moves) |
| All passing | ✅ | ✅ |

## Architecture Notes

- Free cells use `Array<Card | null>` — `null` means empty slot
- `MoveValidator` enforces: only 1 card per free cell move, destination slot must be null
- `StateManager` enforces: remove sets slot to `null`, add sets slot to card
- `faceUp: true` in tableau config signals GameEngine to deal all cards face-up (FreeCell standard)
- Klondike/Spider behavior unchanged (faceUp defaults to false → top card only)

## Branch

`feature/freecell-implementation`
