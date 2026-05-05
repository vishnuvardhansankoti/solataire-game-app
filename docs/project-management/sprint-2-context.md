# Sprint 2 Context — Multi-Game Support & Extensibility

**Sprint:** 2  
**Status:** In Progress  
**Date:** 2026-05-05  
**Current Phase:** Task 2 — FreeCell Discovery (Analyst)

---

## Sprint Goals

1. **Demonstrate Generic Engine Extensibility** — Add second game (Spider Solitaire) using JSON config pattern
2. **Validate Architecture** — Prove `GameConfig` schema covers multiple game types without core rewrites
3. **Lay Foundation for Future Games** — Establish pattern for rapid game addition (Analyst → Architect → Developer → QA)
4. **Prepare for Post-Deployment Optimization** — Lighthouse audit, performance tuning

---

## Completed Tasks

### ✅ Task 1: Spider Solitaire
- **Status:** Merged to main (PR #1, commit `ed947b2`)
- **Deliverables:**
  - `DescendingAnySuitStrategy` (tableau rule: any-suit descending)
  - `dealPattern` engine extension (per-column card counts)
  - `src/games/spider/config.json` (2 decks, 10 cols, [6,6,6,6,5,5,5,5,5,5] deal)
  - 26 unit tests (spider-config.spec.ts)
  - CSP fix (hash-mode SvelteKit config for dynamic bootstrap scripts)
- **Agents Involved:** Developer, QA, Orchestrator
- **Tests:** 71/71 passing across 7 files

---

## Current Task

### 🔄 Task 2: FreeCell
- **Status:** In Progress — Analyst (Discovery phase)
- **Scope:** 
  - Establish FreeCell gameplay rules & win conditions
  - Map FreeCell mechanics to existing engine
  - Identify schema gaps (e.g., "cell" pile type, multi-card moves)
  - Document any new strategies or engine features needed
- **Assigned to:** Analyst
- **Success Criteria:**
  - `docs/requirements/freecell-user-stories.md` created
  - `docs/requirements/freecell-acceptance-criteria.md` created and marked **[Final]**
  - Handoff to Architect for schema design
- **Expected Duration:** ~1 day (similar to Spider Solitaire story scoping)

---

## Upcoming Tasks

### 3. Lighthouse Audit & Performance Optimization
- Post-deployment optimization
- Target: Lighthouse PWA Score = 100, Performance ≥ 90
- Assigned to: Developer (performance tuning) + Orchestrator (reporting)

### 4. Drag-and-Drop Card Moves
- UI/UX enhancement
- Requires new component logic (drag-drop.ts) + integration tests
- Assigned to: Developer → QA

### 5. Additional Games (FreeCell, Solitaire variants, etc.)
- Follow proven pattern: Analyst → Architect → Developer → QA
- Estimated: 2–3 sprints for stable multi-game library

---

## Architecture Notes

- **Generic Engine:** `src/engine/GameEngine.ts` is game-agnostic, driven by JSON config
- **Build Rules:** Extensible registry in `src/engine/strategies/registry.ts` supports custom rules (e.g., `descending-any-suit`)
- **Config Schema:** [game-config.schema.json](../schema/game-config.schema.json) validated in Architect phase; proven with Klondike + Spider
- **Pile Types:** `stock`, `waste`, `tableau`, `foundations`, `cells` (new for FreeCell)

---

## Links
- [HANDOFF.md](./HANDOFF.md) — FreeCell handoff details
- [global-workflow-state.md](./global-workflow-state.md) — Real-time phase tracker
- [timeline.md](./timeline.md) — Agent transition log
- [workflow-token.json](../../workflow-token.json) — Audit trail
