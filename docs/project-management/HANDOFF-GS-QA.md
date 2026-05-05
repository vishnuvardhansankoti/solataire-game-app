# QA Handoff — Game Selector UI

**Handoff Reference:** HANDOFF-GS-QA  
**Current Phase:** Testing  
**Input Files:**
- `docs/project-management/PR_SUMMARY-game-selector.md` (Developer sign-off)
- `docs/requirements/game-selector-acceptance-criteria.md` (13 ACs, [Final])
- `docs/architecture/ADR-006-game-selector-architecture.md`
**Active Agent:** QA  
**Feature Branch:** `feature/game-selector` (commit `65ec430`)  
**Date:** 2026-05-04  
**Context Link:** [Global Workflow State](global-workflow-state.md)

---

## Handoff Trigger Confirmation

| Trigger | Status |
|---|---|
| `PR_SUMMARY-game-selector.md` present | ✅ Yes — `docs/project-management/PR_SUMMARY-game-selector.md` |
| Unit tests pass | ✅ Yes — 83/83 passing |
| Build succeeds | ✅ Yes — `Wrote site to "build"` |

---

## Success Criteria (QA Exit Gate)

QA must produce a `docs/project-management/test-results-game-selector.md` showing **100% pass** on all items below before the token returns to Orchestrator.

---

## Test Scope

### 1. Regression — Existing 83 Unit Tests

Run: `npm run test:unit -- --run`

| Expectation | Target |
|---|---|
| All 83 prior tests still passing | ✅ Zero regressions |

---

### 2. New Unit Tests Required (≥ 15 total new)

Current new tests: **12** (in `tests/unit/registry.spec.ts`). QA must add **≥ 3 more** to reach ≥ 15 new test target from the Architect handoff.

Suggested additions (in a new `tests/unit/active-game.spec.ts`):

| Test | Description |
|---|---|
| Default game is `klondike` | `activeGame` store starts with `'klondike'` when localStorage empty |
| `switchTo` updates store value | After `switchTo('spider')`, subscribed value equals `'spider'` |
| `switchTo` with same id is idempotent | No errors thrown when switching to current game |

---

### 3. Acceptance Criteria Verification

Verify each AC manually or via test:

| AC-ID | Criterion | Verification Method |
|---|---|---|
| AC-GS-01 | Selector displays all 3 games | Unit: GAME_REGISTRY.length === 3 ✅ already in registry.spec.ts |
| AC-GS-02 | Active game highlighted (aria-current) | Component render test or manual browser check |
| AC-GS-03 | Keyboard nav (↑↓ Enter Escape) | Manual or Playwright E2E |
| AC-GS-04 | No dialog when 0 moves | Unit: handleSelectGame with moves=0 |
| AC-GS-05 | Dialog shown mid-game | Unit: handleSelectGame with moves>0 |
| AC-GS-06 | Cancel leaves game unchanged | Unit: cancelSwitch does not call activeGame.switchTo |
| AC-GS-07 | Confirm calls activeGame.switchTo | Unit: confirmSwitch calls switchTo with pendingGameId |
| AC-GS-08 | Returns to prior state | Integration: createGameStore with saved state |
| AC-GS-09 | Fresh deal for never-played game | Unit: null gameStore triggers auto-deal reactive block |
| AC-GS-10 | ARIA labels on all options | Component render check: aria-label present per option |
| AC-GS-11 | 44px tap targets | CSS: min-height: 44px in GameSelector.svelte ✅ |
| AC-GS-12 | 375px viewport usable | Manual: Chrome DevTools mobile emulation, no horizontal scroll |
| AC-GS-13 | Zero hardcoded game strings | Code review: GameSelector.svelte uses `game.displayName` only ✅ |

---

### 4. Build & Type Checks

| Check | Command | Pass Condition |
|---|---|---|
| Type check | `npx tsc --noEmit` | No **new** errors beyond pre-existing 2 |
| Build | `npm run build` | `Wrote site to "build"`, no new A11y warnings |

---

### 5. Lighthouse / Performance (P2 — best-effort)

Run on production build via `npm run preview`:
- Performance ≥ 90 (baseline must not regress)
- Accessibility ≥ 90 (selector ARIA must not degrade score)

---

## QA Deliverables

To trigger QA → Orchestrator handoff, produce:

1. **`docs/project-management/test-results-game-selector.md`** — table with pass/fail for all 13 ACs + regression count
2. **`tests/unit/active-game.spec.ts`** — ≥ 3 tests for `activeGame` store (brings total new to ≥ 15)
3. Update **`docs/project-management/global-workflow-state.md`** — mark Game Selector QA ✅ Complete
4. Update **`workflow-token.json`** — owner → Orchestrator

---

## Pre-existing Known Issues (do not flag as new)

| Issue | Location | Notes |
|---|---|---|
| `StateManager.ts` TS2412 | `src/engine/StateManager.ts:41` | On `feature/freecell-implementation` — not yet merged |
| `game-flow.spec.ts` TS2345 | `tests/e2e/game-flow.spec.ts:33` | Legacy E2E arg type mismatch |
| A11y: role="banner" | `Header.svelte:16` | Pre-existing vite-plugin-svelte warning |
| A11y: autofocus | `WinOverlay.svelte:19` | Pre-existing vite-plugin-svelte warning |
