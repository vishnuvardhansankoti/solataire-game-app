# Problem Statement — FreeCell Solitaire Support

**Date:** 2026-05-05  
**Author:** Analyst Agent  
**Sprint:** 2, Task 2  
**Status:** Final

---

## Objective

Extend the Svelte-Solitaire PWA to support FreeCell Solitaire as a second playable game, demonstrating the generic card game engine's extensibility and proving the JSON config pattern works across different game mechanics.

---

## Background

Sprint 1 delivered a fully functional Klondike Solitaire PWA with a generic card game engine. Sprint 2, Task 1 (Spider Solitaire) validated the engine's flexibility by supporting custom strategies (`descending-any-suit`) and variable deal patterns.

FreeCell represents a significantly different solitaire variant:
- **All cards dealt upfront** (no stock draw cycle like Klondike)
- **Temporary free cell storage** (unique pile type)
- **8 tableau columns** with different move rules (descending by alternating color, not suit)
- **Same win condition** (all cards to 4 foundations, ascending by suit)

This game tests the engine's ability to handle:
- Custom pile types (`cells`)
- Variable tableau configurations (8 columns vs. 7)
- Alternative move validation rules (color-based instead of suit-based)
- Single-card vs. multi-card move strategies

---

## User Problem

Players want to experience different solitaire variants on the same platform without downloading separate apps. FreeCell is one of the most popular solitaire games and complements Klondike well—players familiar with Klondike can transition to FreeCell while leveraging the same PWA interface, offline support, and auto-save features.

---

## Business Value

1. **Platform Credibility:** Multi-game support elevates the PWA from a single-game demo to a genuine game library.
2. **Engine Validation:** Success with FreeCell validates the generic architecture for future variants (Pyramid, FreeCell rules, etc.).
3. **Player Retention:** Game variety increases engagement and session length.
4. **Technical Debt Reduction:** Identifying schema gaps now prevents rework later.

---

## Scope Definition

### In Scope

- **Gameplay Mechanics:**
  - Deal all 52 cards into 8 tableau columns (4 with 7 cards, 4 with 6 cards)
  - Move single cards between tableau, free cells, and foundations
  - Validate moves: tableau (descending-alternating-color), free cells (any card), foundations (ascending-same-suit)
  - Undo any move
  - Auto-save game state
  - Win detection (all cards to foundations)

- **User Interface:**
  - Game selector to choose between Klondike, Spider, and FreeCell
  - Distinct visual representation of 4 free cells (separate from tableau/foundations)
  - Responsive layout for desktop, tablet, and mobile (8 tableau columns may require scrolling on mobile)

- **Architecture:**
  - Extend `GameConfig` schema to support `cells` pile type (if needed)
  - Create `descending-alternating-color` build rule strategy
  - Create `src/games/freecell/config.json` with correct layout and deal pattern
  - Unit tests for new strategy and engine handling (≥ 90% coverage)

### Out of Scope (Sprint 2)

- **Cascading multi-card moves** (e.g., moving 3 cards at once; requires complex undo state management)
- **Super moves** (optimized cascades based on available free cells)
- **Game hints or AI suggestions**
- **Statistics or game history** beyond current session
- **Custom themes or settings** specific to FreeCell
- **Accessibility enhancements** beyond existing Klondike/Spider features

---

## Success Criteria

1. **Functional:** All 13 acceptance criteria pass (P0 + selected P1)
2. **Quality:** 71+ unit tests passing, ≥ 90% coverage of new logic
3. **Performance:** Lighthouse Performance ≥ 90, PWA = 100 (no regression)
4. **Integration:** FreeCell integrates seamlessly with existing game selector and auto-save system
5. **Documentation:** Architecture decisions (schema, strategy, pile types) are documented and reviewed

---

## Constraints

- **Schema Flexibility:** The existing `PileConfig` and `BuildRule` system must support FreeCell without major refactors. If significant changes are needed, they must be flagged early (Architect phase).
- **Mobile Layout:** 8 tableau columns on mobile devices require thoughtful UX (horizontal scroll, condensed layout, etc.).
- **Undo Complexity:** Undo must correctly restore free cell states, not just tableau. Implementation must be carefully designed.
- **Performance:** Adding a third game variant must not increase bundle size or load time beyond acceptable thresholds.

---

## Dependencies

- **Upstream:** Spider Solitaire merged (PR #1) and engine proven extensible
- **Lateral:** Existing UI components (game board, card display, headers, win overlay)
- **Downstream:** All Analyst → Architect → Developer → QA phases must complete in sequence

---

## Next Steps

1. **Architect** reviews this problem statement and FreeCell acceptance criteria
2. **Architect** designs schema extensions (if needed) and documents in ADR or `freecell-config-schema.md`
3. **Developer** implements based on Architect schema
4. **QA** validates all acceptance criteria and user stories

---

## Out-of-Scope Confirmation

The following are explicitly **not included** in this task:

- User authentication or cloud save
- Multiplayer or real-time competition
- In-app purchases
- Localization (English-only)
- Drag-and-drop card moves (Phase 2 enhancement)
- Keyboard shortcuts (Phase 2 enhancement)
- Custom game uploads or modding
