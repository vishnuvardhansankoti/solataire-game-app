# Acceptance Criteria — Game Selector UI
**Feature Area:** Multi-Game Navigation  
**Author:** Analyst Agent  
**Date:** 2026-05-04  
**Status:** [Final]

> **Orchestrator Note:** This document reaching [Final] status triggers the Analyst → Architect handoff per `orchestrator.agent.md`.

---

## Summary Table

| ID | Criterion | Priority | User Story | Gherkin Scenarios |
|---|---|---|---|---|
| AC-GS-01 | Selector displays all available games from config | P0 | US-GS-01 | 1 |
| AC-GS-02 | Active game is visually and semantically highlighted (aria-current) | P1 | US-GS-01 | 1 |
| AC-GS-03 | Selector is keyboard navigable (arrow keys + Enter/Space) | P1 | US-GS-01 | 1 |
| AC-GS-04 | Switching with no active game starts a fresh deal immediately, no dialog | P0 | US-GS-02 | 1 |
| AC-GS-05 | Switching mid-game shows a confirmation dialog naming the target game | P0 | US-GS-03 | 1 |
| AC-GS-06 | Cancelling the confirmation dialog leaves current game completely unchanged | P0 | US-GS-03 | 1 |
| AC-GS-07 | Confirming the switch auto-saves current state before switching | P0 | US-GS-03 | 1 |
| AC-GS-08 | Returning to a previously played game restores last saved state | P0 | US-GS-04 | 1 |
| AC-GS-09 | Returning to a never-played game deals a fresh game automatically | P0 | US-GS-04 | 1 |
| AC-GS-10 | All game options have descriptive ARIA labels | P1 | US-GS-05 | 1 |
| AC-GS-11 | Minimum tap target 44×44px per option on mobile | P1 | US-GS-05 | 1 |
| AC-GS-12 | Selector usable on 375px viewport without horizontal scroll | P1 | US-GS-05 | 1 |
| AC-GS-13 | Game list is driven by GameConfig.displayName — zero hardcoded strings in component | P1 | US-GS-06 | 1 |

---

## Detailed Criteria

### AC-GS-01 — Game List from Config
The selector component must render one entry per game config registered in the app. It must not contain hardcoded game names. The displayed label must equal `GameConfig.displayName`.

### AC-GS-02 — Active Game Highlighted
The currently active game must be visually distinct (e.g., bold, underline, or highlighted background) and carry `aria-current="true"` on its list item.

### AC-GS-03 — Keyboard Navigation
The selector must trap focus when open, support arrow key movement between options, Enter/Space to confirm selection, and Escape to close without selecting.

### AC-GS-04 — Switch With No Progress
When `gameStore` has no state (null) or the game is complete (`isComplete === true`), selecting a different game deals immediately without a dialog.

### AC-GS-05 — Mid-Game Confirmation Dialog
When `gameStore` has an active state with `moves > 0` and `isComplete === false`, selecting a different game must show a dialog: *"Switch to [Game Name]? Your [Current Game] progress will be saved."*

### AC-GS-06 — Cancel Leaves State Unchanged
If the user dismisses the confirmation (Escape, Cancel button, clicking outside), the current game board, store state, and localStorage entry must be exactly unchanged.

### AC-GS-07 — Auto-Save on Confirm
Before switching, the engine must flush the current game state to localStorage via the existing `gameStore` mechanism. The destination game is loaded only after save completes.

### AC-GS-08 — Restore Saved State
If `localStorage` contains a saved state for the target game, it is loaded via `createGameStore(gameId)` and restored to the board.

### AC-GS-09 — Fresh Deal for New Game
If `localStorage` contains no saved state for the target game, `engine.newGame()` is called automatically.

### AC-GS-10 — ARIA Labels
Each game option element must have `role="option"` or equivalent and a descriptive `aria-label` matching the game's `displayName`.

### AC-GS-11 — Touch Target Size
On touch devices, each game option must have a rendered hit area of at least 44×44 CSS pixels.

### AC-GS-12 — 375px Viewport
At 375px width the selector must not overflow its container, must not require horizontal scrolling, and all game names must be fully legible.

### AC-GS-13 — Config-Driven (No Hardcoding)
The selector component receives the game list as a prop or imports it from a central registry. Adding `src/games/pyramid/config.json` and registering it in the registry is the only change needed to surface it in the selector.

---

## Exit Criteria (Analyst → Architect Handoff)

All 13 acceptance criteria are defined with Gherkin coverage across 6 user stories. Status is **[Final]**.

The **Architect** must produce:
1. **ADR-006** — Game Selector architecture decision (in-page reactive store vs. route-per-game; config discovery pattern)
2. **`GameSelector.svelte`** component design (props interface, state contract, layout spec)
3. Any `GameConfig` schema additions needed (e.g., `enabled` flag, `order` field)
4. State management contract: how `activeGameId` is stored and reactive across the app
