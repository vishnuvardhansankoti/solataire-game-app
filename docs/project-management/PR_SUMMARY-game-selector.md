# PR Summary — Game Selector UI

**Branch:** `feature/game-selector`  
**Target:** `main`  
**Sprint:** 3  
**Author:** Developer Agent  
**Date:** 2026-05-04  
**Commit:** `65ec430`

---

## Summary

Adds a runtime game-switcher to the Svelte Solitaire PWA, allowing users to switch between Klondike, Spider, and FreeCell without leaving the page. The active game is persisted to `localStorage` so the last-played game is restored on next visit.

---

## Changes

### New Files

| File | Purpose |
|---|---|
| `src/games/registry.ts` | `GAME_REGISTRY` array + `getGameConfig()` — single source of truth for all playable games |
| `src/stores/activeGame.ts` | Persisted `writable` store for the active game ID (`solitaire:activeGameId`) |
| `src/components/GameSelector.svelte` | Dropdown component: keyboard nav (↑↓ Enter Escape), ARIA listbox, 44px tap targets |
| `tests/unit/registry.spec.ts` | 12 unit tests covering registry contents and `getGameConfig()` |
| `docs/requirements/game-selector-problem-statement.md` | Analyst deliverable |
| `docs/requirements/game-selector-user-stories.md` | 6 user stories with Gherkin scenarios |
| `docs/requirements/game-selector-acceptance-criteria.md` | 13 acceptance criteria [Final] |
| `docs/architecture/ADR-006-game-selector-architecture.md` | Architecture decision record |
| `docs/project-management/HANDOFF-GS-ARCHITECT.md` | Developer handoff specification |

### Modified Files

| File | Change |
|---|---|
| `src/components/Header.svelte` | Added `games` + `activeGameId` props; renders `<GameSelector>`; forwards `selectGame` event |
| `src/routes/+page.svelte` | Reactive `config`/`engine`/`gameStore` from `$activeGame`; confirmation dialog for mid-game switch; `<Header>` wired up; dynamic `<title>` |

---

## Acceptance Criteria Coverage

| AC-ID | Criterion | Status |
|---|---|---|
| AC-GS-01 | Game list visible in header | ✅ Met |
| AC-GS-02 | Switch game with 0 moves — no dialog | ✅ Met |
| AC-GS-03 | Switch mid-game shows confirmation | ✅ Met |
| AC-GS-04 | Confirm switch preserves prior progress | ✅ Met |
| AC-GS-05 | Cancel switch stays on current game | ✅ Met |
| AC-GS-06 | Last game persisted to localStorage | ✅ Met |
| AC-GS-07 | Restored on next visit | ✅ Met |
| AC-GS-08 | Keyboard: Arrow, Enter, Escape nav | ✅ Met |
| AC-GS-09 | Active game highlighted in dropdown | ✅ Met |
| AC-GS-10 | ARIA listbox + option roles | ✅ Met |
| AC-GS-11 | 44px min tap targets on mobile | ✅ Met |
| AC-GS-12 | Title updates to active game name | ✅ Met |
| AC-GS-13 | Auto-deal if store null after switch | ✅ Met |

---

## Test Results

```
Test Files  8 passed (8)
     Tests  83 passed (83)
  Duration  2.04s
```

No regressions. 12 new tests added for registry.

---

## Build Status

```
✔ done — Wrote site to "build"
```

Only pre-existing A11y warnings (`Header.svelte` role="banner", `WinOverlay.svelte` autofocus). No new warnings introduced.

---

## TypeScript

Pre-existing errors only (`StateManager.ts` exactOptionalPropertyTypes, `game-flow.spec.ts` E2E arg type). No new type errors.

---

## QA Handoff Note

This PR is ready for QA sign-off. See `docs/project-management/HANDOFF-GS-QA.md` for test scope.
