# Acceptance Criteria — FreeCell Solitaire
**Project:** Svelte-Solitaire PWA — Sprint 2, Task 2  
**Author:** Analyst Agent  
**Date:** 2026-05-05  
**Status:** [Final]

> **Orchestrator Note:** This document reaching [Final] status triggers the Analyst → Architect handoff for FreeCell design.

---

## FreeCell Acceptance Gate

The following criteria **must all pass** before FreeCell implementation is considered complete by QA:

### Core Gameplay (P0 — Required)

1. **AC-FC-01:** A new FreeCell game can be started, dealing all 52 cards into 8 tableau columns (4 with 7 cards, 4 with 6 cards), all face-up.
2. **AC-FC-02:** Cards can be moved between tableau columns following the rule: descending rank with alternating color.
3. **AC-FC-03:** Free cells can store any single card temporarily; up to 4 cells available.
4. **AC-FC-04:** Cards can be moved from tableau or free cells to foundations following ascending same-suit rule.
5. **AC-FC-05:** Win is detected when all 52 cards are in the 4 foundations.
6. **AC-FC-06:** Game state is auto-saved to localStorage after each move.
7. **AC-FC-07:** Undo reverses any move (tableau, free cell, foundation) and restores game state correctly.

### User Interface (P0)

8. **AC-FC-08:** Game selector clearly identifies FreeCell and displays correct deal information.
9. **AC-FC-09:** Tableau, free cells, and foundations are visually distinct and accessible on desktop, tablet, and mobile.
10. **AC-FC-10:** Game can be resumed after browser close by selecting "Resume Game".

### Constraints & Edge Cases (P1)

11. **AC-FC-11:** Moving a cascade of cards is not supported in Sprint 2 (single-card moves only).
12. **AC-FC-12:** Free cells can be used to temporarily "unlock" blocked cards; the player must manage limited space.
13. **AC-FC-13:** Invalid moves (e.g., wrong color, full free cells) are rejected with visual feedback.

---

## Schema & Architecture Notes

### Engine Extensions Required

The following engine features are needed to support FreeCell in the existing architecture:

| Feature | Status | Notes |
|---|---|---|
| **"cells" Pile Type** | New | FreeCell piles differ from foundations/tableau/stock in behavior. Propose adding `cells` to `PileConfig` with `count: 4`, `faceUp: true`, `buildRule: "none"` (no auto-moves). |
| **"descending-alternating-color" Strategy** | New | Tableau rule: rank descends by 1, color alternates (red-black-red or black-red-black). Required new `BuildRule` in registry. |
| **Single-Card Move Limitation** | Constraint | In Sprint 2, cascading multi-card moves are out-of-scope. Only single visible cards (from tableau top or free cell) can be moved. |
| **One-Time Deal (No Stock)** | Extension | FreeCell has no stock/waste cycle. All 52 cards dealt upfront. Propose adding optional `dealAllUpfront: true` flag to `GameConfig` or new pile type for stock handling. |
| **Win Condition Variation** | Existing | Win when all cards in foundations. Existing win detector should apply (already supports variable foundation counts). |

### Out-of-Scope for Sprint 2

- **Cascading Moves:** Moving multiple cards at once (requires complex undo state tracking and UI changes).
- **Super Moves:** Optimized multi-card cascades based on available free cells and empty columns.
- **Statistics / Hints:** Move recommendations or game analytics.
- **Themes / Settings:** Card back variants specific to FreeCell (existing theme system will apply).

---

## Definition of Done (FreeCell Completion)

A FreeCell implementation is considered **Done** when:

1. All 13 acceptance criteria above pass (P0 + selected P1).
2. All Gherkin scenarios in `freecell-user-stories.md` execute successfully.
3. Architect has designed the schema (`freecell-config.schema.json` or updates to `game-config.schema.json`).
4. Developer has implemented:
   - `DescendingAlternatingColorStrategy` in `src/engine/strategies/`
   - `src/games/freecell/config.json` with correct deal pattern and pile configuration
   - Any necessary `PileConfig` extensions (e.g., `cells` pile type)
   - Unit tests covering all move validations (≥ 90% coverage of new strategy logic)
5. QA has authored and executed:
   - Integration tests for FreeCell-specific move validation
   - E2E tests for complete FreeCell game flow (start → win)
   - Regression tests for existing Klondike and Spider to ensure no regressions
6. Lighthouse scores have not regressed below targets (Performance ≥ 90, PWA = 100).
7. No new `console.error` output is introduced.
8. PR includes `PR_SUMMARY.md` describing the what/why and schema changes.

---

## Risk & Mitigation

| Risk | Probability | Mitigation |
|---|---|---|
| **Engine doesn't support "cells" pile type without refactor** | Medium | Early Architect review of `PileConfig` flexibility; consider if cells can be modeled as a foundation-like pile with `buildRule: "none"`. |
| **Complex undo state with free cells** | Medium | Architect to confirm `history` structure can track free cell states. Test undo thoroughly in QA phase. |
| **Mobile UI cramped with 8 tableau columns + 4 cells + 4 foundations** | Medium | Designer to mock layout before implementation. May need horizontal scroll or compact card display on small screens. |
| **Game balance (too easy/hard)** | Low | FreeCell is a well-known game; difficulty is not a concern. Focus on correctness. |

---

## Handoff Trigger

**To Architect:** Create `docs/architecture/freecell-config-schema.md` (or ADR update) defining:
- `cells` pile configuration
- `descending-alternating-color` build rule
- Optional `dealAllUpfront` flag or stock handling changes
- Layout configuration for 8 tableau columns + 4 cells

**Success:** Architect marks schema as approved → **Analyst → Architect → Developer handoff**

---

## Summary

FreeCell is a proven, skill-based card game that will demonstrate the generic engine's ability to support varied pile types and move rules. The sprint focuses on **core single-card moves and free cell storage**, postponing complex cascading logic to future phases. This approach allows rapid validation of the engine's extensibility while keeping the implementation scope manageable.
