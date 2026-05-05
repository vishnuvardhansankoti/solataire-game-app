# Handoff — Sprint 2 Task 2: FreeCell Implementation

**Date:** 2026-05-05  
**From:** Architect (FreeCell schema approved)  
**To:** Developer (FreeCell implementation)

---

## Current Phase
**Development** — Implementation and unit testing

---

## Context
FreeCell schema is finalized with zero engine refactoring required. The generic architecture supports FreeCell natively via:
- **Pre-existing `freeCells` Pile Type** in `GameConfig`
- **Pre-existing `descending-alternating-color` Strategy** in registry
- **New `dealPattern` Support** added to `tableauPileConfig` in schema

**Deliverables Ready for Developer:**
- [ADR-005-freecell-architecture.md](../architecture/ADR-005-freecell-architecture.md) — Architecture decision + rationale
- [freecell-schema-design.md](../architecture/freecell-schema-design.md) — Implementation guide with move validation rules
- [src/games/freecell/config.json](../../src/games/freecell/config.json) — Ready-to-use game config
- [Updated game-config.schema.json](../schema/game-config.schema.json) — Schema validation with `dealPattern` support

---

## Active Agent
**Developer**

---

## Success Criteria (Developer Phase)

1. **Verify & Validate:**
   - [ ] Confirm `src/games/freecell/config.json` loads without errors
   - [ ] Verify `GameEngine.newGame(freecellConfig)` produces correct deal: [7,7,7,7,6,6,6,6] = 52 cards
   - [ ] Confirm all 52 cards appear in tableau; 4 free cells empty; 4 foundations empty

2. **Implement FreeCell Move Validation:**
   - [ ] Create `src/engine/validators/FreeCell-MoveValidator.ts` (extends or supplements `MoveValidator`)
   - [ ] Implement `canMoveFromFreeCell(state, from, to)` logic
   - [ ] Implement `canMoveToFreeCell(state, card, cellIndex)` logic
   - [ ] Validate `descending-alternating-color` rule for tableau moves
   - [ ] Reject invalid moves with descriptive error codes

3. **Unit Tests:**
   - [ ] Create `tests/unit/freecell-config.spec.ts` (similar to spider-config.spec.ts)
     - Test config structure and schema compliance
     - Test deal pattern correctness
     - Test tableau column card counts
   - [ ] Create `tests/unit/freecell-moves.spec.ts` (move validation)
     - Test tableau-to-tableau moves (valid & invalid color/rank)
     - Test free cell moves (from/to tableau, free cell, foundations)
     - Test foundation moves from free cells
     - Test empty column handling
     - Test undo state correctness
   - [ ] Target: 26+ new tests; **75+ total passing across all 8 unit spec files**

4. **UI Integration:**
   - [ ] Verify game selector includes FreeCell option (existing layout system should work)
   - [ ] Verify FreeCell renders correctly in browser (use existing GameBoard component)
   - [ ] Test on desktop, tablet, mobile viewports
   - [ ] Confirm 4 free cells display above tableau (per layout config)

5. **Performance & Build:**
   - [ ] Run `npm run lint` — zero new errors/warnings
   - [ ] Run `npm run test:unit -- --run` — 75+ tests passing
   - [ ] Run `npm run build` — bundle builds clean, no TypeScript errors
   - [ ] Confirm no regression in Lighthouse metrics

---

## Input References
- **Analyst Requirements:** [freecell-user-stories.md](../../docs/requirements/freecell-user-stories.md), [freecell-acceptance-criteria.md](../../docs/requirements/freecell-acceptance-criteria.md)
- **Architecture:** [ADR-005](../architecture/ADR-005-freecell-architecture.md), [freecell-schema-design.md](../architecture/freecell-schema-design.md)
- **Config Template:** [src/games/freecell/config.json](../../src/games/freecell/config.json)
- **Existing Code Examples:**
  - Spider implementation: `src/engine/strategies/DescendingAnySuitStrategy.ts` (custom strategy example)
  - Move validator: `src/engine/MoveValidator.ts` (base validation logic)
  - Test patterns: `tests/unit/spider-config.spec.ts` (test structure example)

---

## Key Implementation Notes

### 1. **Deal Pattern Handling**
```typescript
// In GameEngine.newGame()
const dealPattern = this.config.piles.tableau?.dealPattern;
for (let col = 0; col < tableauCount; col++) {
  const cardCount = dealPattern ? dealPattern[col] : col + 1;
  // ... deal cardCount cards to column col
}
```
**Status:** Already implemented for Spider; FreeCell reuses same logic ✓

### 2. **Free Cell Move Validation**
```typescript
// New logic required:
function canMoveFromFreeCell(state: GameState, cellIndex: number, to: PileReference): boolean {
  const card = state.freeCells[cellIndex][0]; // freeCells[i] is 0 or 1 card
  if (!card) return false; // empty free cell

  switch (to.pileId) {
    case 'tableau':
      return canPlaceOnTableau(state, card, to.column);
    case 'foundations':
      return canPlaceOnFoundation(state, card, to.index);
    default:
      return false;
  }
}
```

### 3. **Free Cell Capacity Enforcement**
```typescript
// In StateManager.applyMove(), when moving to freeCells pile:
if (to.pileId === 'freeCells') {
  const cell = state.freeCells[to.column];
  if (cell.length >= 1) return null; // Free cell full!
}
```

### 4. **Descending-Alternating-Color Strategy**
Already exists: `src/engine/strategies/DescendingAlternatingColorStrategy.ts`
```typescript
// Example usage in tests:
const strategy = getStrategy('descending-alternating-color');
const topCard = { suit: 'clubs', value: 11, color: 'black' };
const cardToPlace = { suit: 'hearts', value: 10, color: 'red' };
expect(strategy.canPlace(topCard, cardToPlace)).toBe(true); // ✓ (black→red, 11→10)
```

### 5. **Undo State Correctness**
Ensure `GameState.history` captures free cell moves:
```typescript
// Each history entry must include:
{
  from: { pileId: 'freeCells', column: 2 },
  to: { pileId: 'tableau', column: 5 },
  cards: [{ suit: 'hearts', value: 8 }],
  scoreChange: 0
}
```

---

## Testing Checklist

### Unit Tests (26+ new)

#### freecell-config.spec.ts (8 tests)
- [ ] Config loads and validates
- [ ] Deal pattern [7,7,7,7,6,6,6,6] produces 52 cards
- [ ] All tableau cards face-up
- [ ] Free cells initialized empty
- [ ] Foundations initialized empty
- [ ] Schema compliance check
- [ ] Descending-alternating-color strategy registered

#### freecell-moves.spec.ts (18+ tests)
- [ ] Tableau: valid descending-alternating-color moves
- [ ] Tableau: invalid same-color moves (rejected)
- [ ] Tableau: invalid non-descending moves (rejected)
- [ ] Free cell: move from tableau to free cell (empty)
- [ ] Free cell: move from tableau to free cell (full, rejected)
- [ ] Free cell: move from free cell to tableau
- [ ] Free cell: move from free cell to foundation
- [ ] Foundation: move from tableau to foundation
- [ ] Foundation: move from free cell to foundation
- [ ] Empty column: any card can start (King, 8, Ace, etc.)
- [ ] Undo: free cell moves reversed correctly
- [ ] Undo: score adjustments reversed
- [ ] Undo: game state consistency after undo
- [ ] Multi-card move: rejected (Sprint 2 constraint)
- [ ] Stock pile: absent (no-draw game)
- [ ] Auto-save: game state persists to localStorage

---

## Implementation Workflow

1. **Day 1:**
   - Verify `src/games/freecell/config.json` loads
   - Confirm deal pattern produces 52 cards in tableau
   - Write 8 config validation tests (freecell-config.spec.ts)

2. **Day 2:**
   - Implement move validation logic for free cells
   - Implement tableau-to-tableau validation for alternating-color
   - Write 18+ move validation tests (freecell-moves.spec.ts)

3. **Day 3:**
   - Verify UI renders FreeCell correctly (no changes needed; reuse existing GameBoard)
   - Test mobile layout (may require minor CSS adjustments)
   - Run full test suite; confirm 75+ tests passing

4. **Day 4:**
   - Code review & refactor
   - Documentation (PR_SUMMARY.md, commit messages)
   - Prepare for QA handoff

---

## Trigger to Next Phase

**To QA:**
- Push `feature/freecell` branch to origin
- Submit PR with `PR_SUMMARY.md` describing:
  - What: FreeCell game config, move validation, 26+ tests
  - Why: Sprint 2 Task 2; demonstrate engine extensibility
  - Changes: New config, new move validation logic, schema update
- 75+ unit tests passing ✓
- Build clean ✓
- No regressions ✓

**Success:** Developer marks feature complete → **Developer → QA handoff**

---

## Resources

- **Tech Stack:** SvelteKit 2, TypeScript, Vite 5, Vitest
- **Code Style:** [styleguide.md](../../docs/dev/styleguide.md)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)
- **Dependencies:** No new packages; reuse existing engine

---

## Notes

- **Cascading Moves:** Out of scope Sprint 2. Single-card moves only.
- **Test Coverage:** Aim for ≥ 90% coverage of new move validation logic.
- **Commit Messages:** Use Conventional Commits format (e.g., `feat(freecell): implement move validation`)
- **Mobile UX:** 8 tableau columns may require horizontal scroll on small screens; test thoroughly.
