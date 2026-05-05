# ADR-005 — FreeCell Support via JSON Config & Existing Strategy Registry

**Date:** 2026-05-05  
**Status:** Proposed  
**Decision:** Accept  
**Deciders:** Architect

---

## Context

Sprint 2 requires adding FreeCell Solitaire to the platform. FreeCell differs significantly from Klondike/Spider:
- **All 52 cards dealt upfront** to tableau (no stock/waste draw cycle)
- **4 free cells** — temporary single-card storage piles
- **8 tableau columns** with descending-alternating-color rule
- **Same win condition:** all cards to 4 foundations

The existing generic engine was designed with extensibility in mind. This ADR documents how FreeCell integrates within the proven architecture.

---

## Problem

1. **Q:** Does the existing architecture support FreeCell without major refactoring?
2. **Q:** How should free cells be represented in the config?
3. **Q:** Can the existing strategy registry handle `descending-alternating-color`?
4. **Q:** How to handle the one-time deal pattern (no stock/waste)?

---

## Decision

**Adopt Option A from the Design Handoff:** Implement FreeCell using:

1. **New `freeCells` Pile Type** — Already exists in `GameConfig.piles`
   - `freeCells: { count: 4, buildRule: "none", faceUp: true, initialCards: 0 }`
   - `buildRule: "none"` prevents automatic moves (cards stay until player moves them)
   - `initialCards: 0` ensures free cells start empty

2. **Existing `descending-alternating-color` Strategy** — Already registered
   - File: `src/engine/strategies/DescendingAlternatingColorStrategy.ts`
   - Rule: Rank descends by 1, color alternates (red ↔ black)
   - Applied to tableau pile: `tableau: { buildRule: "descending-alternating-color", ... }`

3. **No Stock/Waste Cycle** — Handled via omitted `stock` pile
   - `GameConfig.piles` omits `stock` and `waste`
   - `GameEngine.newGame()` detects missing stock; initializes all 52 cards directly to tableau
   - Deal pattern: First 4 columns get 7 cards, next 4 get 6 cards = 52 total

4. **Minimal Engine Changes** — None required!
   - `GameEngine.newGame()` already checks for optional `stock`
   - `StateManager.applyMove()` already supports free cell moves (via `freeCells` pile)
   - `GameState.history` already tracks all pile types

---

## Rationale

### Why Option A (New Pile Type)?

- **Explicit:** Free cells are semantically distinct from foundations (no build rule, no auto-move)
- **Reusable:** Future games (Tableau variant, Pyramid) can adopt the same pattern
- **Low Risk:** No existing game configs are affected; FreeCell opts into `freeCells` pile
- **Engine-Agnostic:** Doesn't blur the distinction between pile types

### Why No Engine Refactoring?

The original architecture (Sprint 1) anticipated extensibility:
- `PileConfig` was designed as a generic structure (could support future pile types)
- `BuildRuleStrategy` registry is pluggable; new rules can be added via `src/engine/strategies/` files
- `GameState` uses a map (`Record<PileId, Card[]>`) that dynamically accommodates pile types

**Result:** FreeCell fits cleanly without modifications to core engine logic.

---

## Consequences

### Positive

1. **Zero Engine Refactoring:** FreeCell is a pure config + strategy addition
2. **Proven Pattern:** Reinforces the generic game architecture for future variants
3. **Backward Compatible:** Klondike and Spider configs unchanged; FreeCell is opt-in
4. **Fast Development:** Developer can implement FreeCell in <1 day (config + deal logic)

### Negative

1. **Deal Pattern Complexity:** Two pile configurations (stock-waste-tableau vs. all-tableau) require careful handling
2. **Move Validation:** Free cells require unique validation rules (unlike tableau/foundations)
3. **Mobile UI:** 8 tableau columns + 4 free cells on small screens may require horizontal scroll

### Mitigations

1. **Deal Pattern:** Document in config; `GameEngine.newGame()` handles gracefully
2. **Validation:** Reuse existing `MoveValidator` logic; add `canMoveFromFreeCell()` helper
3. **Mobile UI:** Test layout early in Sprint 2; consider card condensing on small screens

---

## Schema Changes

Update `game-config.schema.json`:

1. Add `dealPattern: number[]` support to `tableauPileConfig` definition
   - Used by Spider and FreeCell for non-standard deal distributions
   - Optional; defaults to traditional Klondike pattern when absent

2. Explicitly document `freeCells` pile configuration
   - `count: 4`, `buildRule: "none"`, `faceUp: true`, `initialCards: 0`

3. Confirm `descending-alternating-color` is enumerated in `buildRule`
   - Already present ✓

---

## Implementation Checklist

- [x] `GameConfig.piles.freeCells` exists (already in TypeScript)
- [x] `DescendingAlternatingColorStrategy` is registered (already exists)
- [x] `descending-alternating-color` is enumerated in schema (already present)
- [ ] Update schema to support `dealPattern` in `tableauPileConfig`
- [ ] Create `src/games/freecell/config.json` with correct structure
- [ ] Verify `GameEngine.newGame()` handles omitted `stock` gracefully
- [ ] Developer to implement FreeCell config loading + move validation

---

## ADR References

- **ADR-002:** Generic Card Game Engine (original architecture)
- **ADR-001:** SvelteKit + Adapter-Static
- **Decision Rationale:** Extend proven pattern (Klondike + Spider) to third variant

---

## Sign-Off

**Architect:** FreeCell architecture is sound. No engine refactoring required. Proceed to Developer with provided config template.

**Next Step:** Architect provides `src/games/freecell/config.json` template → Developer implements → QA validates
