# Handoff — Sprint 2 Task 2: FreeCell

**Date:** 2026-05-05  
**From:** QA (Spider Solitaire merged)  
**To:** Analyst (FreeCell scoping)

---

## Current Phase
**Discovery** — Requirements and acceptance criteria

---

## Context
Sprint 2 Task 1 (Spider Solitaire) successfully merged to main via PR #1. The generic card game engine and JSON config pattern are now proven. FreeCell is the next game to be added to the platform, demonstrating extensibility of the system.

**Background:** The system supports games via `src/games/{gameId}/config.json`. Spider Solitaire added a custom `dealPattern` array and `descending-any-suit` strategy. FreeCell may require additional extensions (4 foundation columns, custom "cell" pile type, etc.).

---

## Input Reference
- Game Engine Pattern: [src/engine/GameEngine.ts](../../src/engine/GameEngine.ts)
- Example Config: [src/games/spider/config.json](../../src/games/spider/config.json)
- Strategy Registry: [src/engine/strategies/registry.ts](../../src/engine/strategies/registry.ts)
- Existing Acceptance Criteria: [docs/requirements/acceptance-criteria.md](../requirements/acceptance-criteria.md)

---

## Active Agent
**Analyst**

---

## Success Criteria (Analyst Phase)
1. Create `docs/requirements/freecell-user-stories.md` — gameplay, win conditions, UI interaction
2. Create `docs/requirements/freecell-acceptance-criteria.md` — acceptance criteria marked **[Final]**
3. Identify any engine schema gaps (e.g., "cell" pile type, free moves, cascading rules)
4. Document architectural constraints or new features needed from engine

**FreeCell game mechanics to cover:**
- 4 foundation piles (by suit, ascending A–K)
- 4 free cell storage piles (any card)
- 8 tableau columns (can place cards in descending sequence by alternating color)
- Stock pile (deal all cards, no reshuffles)
- Win condition: all cards to foundations

---

## Trigger to Next Phase
When `docs/requirements/freecell-acceptance-criteria.md` is marked **[Final]** and user stories are complete, Analyst passes the token to **Architect** for schema design.

---

## Context Link
→ [global-workflow-state.md](./global-workflow-state.md)

---

## Notes
- Leverage existing generic engine—do not require major rewrites.
- Reuse existing build rules (e.g., `ascending-same-suit` for foundations).
- Consider if "cell" piles can be modeled within existing `PileConfig` or require new config field.
