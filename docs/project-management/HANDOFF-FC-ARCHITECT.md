# Handoff — Sprint 2 Task 2: FreeCell Schema Design

**Date:** 2026-05-05  
**From:** Analyst (FreeCell requirements finalized)  
**To:** Architect (FreeCell schema design)

---

## Current Phase
**Design** — Schema and architecture decisions

---

## Context
FreeCell requirements are now finalized with 7 user stories and 13 acceptance criteria (all marked **[Final]**). The core challenge for Architect is determining how to represent FreeCell's unique pile structure and move rules within the existing generic engine without major refactoring.

**Key differences from Klondike/Spider:**
- All 52 cards dealt upfront to 8 tableau columns (not a stock/waste cycle)
- 4 "free cells" — temporary single-card storage (unique pile type)
- Tableau rule: descending by alternating color (not suit-based)
- No multi-card cascading in Sprint 2 (single-card moves only)

---

## Input References
- [freecell-problem-statement.md](../requirements/freecell-problem-statement.md) — Scope, constraints, dependencies
- [freecell-user-stories.md](../requirements/freecell-user-stories.md) — 7 user stories with Gherkin acceptance scenarios
- [freecell-acceptance-criteria.md](../requirements/freecell-acceptance-criteria.md) — 13 acceptance criteria + schema notes + risks
- [src/engine/GameConfig.ts](../../src/engine/GameConfig.ts) — Current config structure
- [src/games/spider/config.json](../../src/games/spider/config.json) — Example config (demonstrating `dealPattern`)
- [game-config.schema.json](../schema/game-config.schema.json) — JSON schema validation

---

## Active Agent
**Architect**

---

## Success Criteria (Architect Phase)

1. **Create `freecell-config-schema.md`** (or ADR) defining:
   - How to represent 4 "free cells" in `PileConfig` (new pile type vs. alternative structure)
   - New `BuildRule`: `"descending-alternating-color"` (tableau rule for FreeCell)
   - Optional one-time deal pattern: all 52 cards to tableau, no stock/waste cycle
   - Exactly how `src/games/freecell/config.json` will be structured

2. **Update or create JSON schema:**
   - Extend `game-config.schema.json` to validate FreeCell config
   - Define `"cells"` pile type if adding new one
   - Document backwards compatibility with Klondike/Spider configs

3. **Identify minimal engine changes (if any):**
   - Will `GameEngine.newGame()` need modification to handle "no stock" scenario?
   - Can `BuildRuleValidator` handle `descending-alternating-color` without changes?
   - Are there undo state implications for free cells?

4. **Create schema ADR (if major decision):**
   - Why `cells` were modeled as a separate pile type (vs. alternative)
   - Trade-offs considered
   - Rationale for reusing vs. extending existing pile structures

---

## Design Decisions to Make

### 1. **"Cells" Pile Type Representation**

**Option A: New Pile Type**
```json
{
  "piles": {
    "cells": { "count": 4, "faceUp": true, "buildRule": "none" },
    "foundations": { "count": 4, "buildRule": "ascending-same-suit" },
    "tableau": { "count": 8, ... },
    "stock": null  // FreeCell has no stock
  }
}
```
- **Pros:** Explicit, clear semantics
- **Cons:** Requires `GameEngine` to handle new pile type in `newGame()`, `applyMove()`, etc.

**Option B: Extend Foundations**
```json
{
  "piles": {
    "foundations": { "count": 8, "buildRule": ["ascending-same-suit", "none"] },
    "tableau": { "count": 8, ... }
  }
}
```
First 4 are true foundations, last 4 are "cell" foundations (no build rule).
- **Pros:** No new pile type needed; minimal engine changes
- **Cons:** Semantically confusing; mixes two different pile types

**Option C: Generalize to "storage" Piles**
Add generic `"storage"` pile type with configurable count and buildRule.
- **Pros:** Extensible for future game variants (e.g., reserve piles, bonus piles)
- **Cons:** More complex; over-engineering for FreeCell alone?

**Recommendation:** Evaluate Option A first. If it requires > 2 hours of engine work, escalate to Developer for feasibility check.

---

### 2. **"descending-alternating-color" Strategy**

Tableau rule: **Rank descends by 1, color alternates (red ↔ black)**

**Example valid moves:**
- 10♥ (red) on J♣ (black)
- 8♠ (black) on 9♦ (red)

**Example invalid moves:**
- 10♥ (red) on J♥ (same color) → INVALID
- 10♥ (red) on Q♣ (rank doesn't descend by 1) → INVALID

**Implementation:**
- Add to `src/engine/strategies/registry.ts`
- Create `DescendingAlternatingColorStrategy.ts` (similar to `DescendingAnySuitStrategy.ts`)
- `canPlace(topCard, cardToPlace)`: Check `topCard.value - 1 === cardToPlace.value && topCard.color !== cardToPlace.color`

---

### 3. **One-Time Deal (No Stock Cycle)**

FreeCell deals all 52 cards upfront; no stock/waste draw phase.

**Option A: Add `dealAllUpfront` Flag**
```json
{ "dealAllUpfront": true, "piles": { "tableau": { "count": 8, "dealPattern": [7,7,7,7,6,6,6,6] } } }
```
- Modify `GameEngine.newGame()` to skip stock initialization

**Option B: Omit Stock Pile**
```json
{ "piles": { "stock": null, "tableau": {...} } }
```
- `GameEngine.newGame()` detects missing stock and initializes tableau with all cards

**Option C: Implicit (Detected at Runtime)**
If `dealPattern` covers all cards, automatically assume no stock.

**Recommendation:** Option B or C. Simplest; no explicit flag needed.

---

## Risk Flags Raised by Analyst

| Risk | Mitigation | Owner |
|---|---|---|
| Engine doesn't support "cells" pile without refactor | Evaluate Options A–C above; escalate to Developer if > 2 hours work | Architect |
| Mobile layout: 8 tableau + 4 cells might be cramped | Document layout assumptions; Developer/QA will mock and test | Architect (scope doc) |
| Undo state complexity with free cells | Confirm `GameState.history` can track cell moves; test thoroughly in QA phase | Developer (implementation) |
| Build rule validator assumes suit-based rules | New `descending-alternating-color` strategy must integrate cleanly | Developer (implementation) |

---

## Deliverables

### Artifact 1: `docs/architecture/freecell-schema-design.md` (or ADR-X-FreeCell)
- Problem: How to represent FreeCell within generic engine
- Decision: Which option (A/B/C) chosen and why
- Consequences: Engine changes, schema changes, future implications
- Alternatives considered: Document trade-offs

### Artifact 2: Updated `game-config.schema.json` (or new `freecell-config.schema.json`)
- Validate FreeCell config structure
- Ensure backwards compatibility with existing games

### Artifact 3: `src/games/freecell/config.json` (Template)
- Example FreeCell config ready for Developer to use
- Document: all 52 cards deal pattern, pile types, strategies

---

## Trigger to Next Phase

**To Developer:** 
- Review and approve FreeCell schema
- Confirm engine can support chosen design (Architect Option A/B/C)
- If any unknowns, escalate for quick spike

**Success:** Architect marks schema as approved → **Architect → Developer handoff**

---

## Notes

- **Sprint 2 Constraint:** Single-card moves only; no cascading. This simplifies undo state but may require future redesign for cascading.
- **Keep It Simple:** FreeCell is a well-established game. The goal is to prove generic engine extensibility, not to invent new mechanics. Stick to proven rules.
- **Performance:** Adding a 3rd game variant must not increase bundle size or load time. Monitor after implementation.
- **Engine Reusability:** Every design decision should consider: "Does this pattern help future games (Pyramid, FreeCell 2, etc.)?"
