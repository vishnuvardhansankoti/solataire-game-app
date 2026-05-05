# HANDOFF — Game Selector UI: Architect → Developer

**Current Phase:** Design → Development  
**Feature:** Sprint 3 Task 1 — Game Selector UI  
**Active Agent:** Developer  
**Date:** 2026-05-04  
**Context Link:** [global-workflow-state.md](./global-workflow-state.md)

---

## Input Artifacts

| Document | Path |
|---|---|
| Problem Statement | `docs/requirements/game-selector-problem-statement.md` |
| User Stories (6) | `docs/requirements/game-selector-user-stories.md` |
| Acceptance Criteria (13, Final) | `docs/requirements/game-selector-acceptance-criteria.md` |
| ADR-006 | `docs/architecture/ADR-006-game-selector-architecture.md` |

---

## Implementation Tasks

### 1. Create `src/games/registry.ts`

```typescript
import type { GameConfig } from '../engine/GameConfig';
import klondike from './klondike/config.json';
import spider from './spider/config.json';
import freecell from './freecell/config.json';

export const GAME_REGISTRY: GameConfig[] = [
  klondike as GameConfig,
  spider as GameConfig,
  freecell as GameConfig,
];

export function getGameConfig(gameId: string): GameConfig {
  const cfg = GAME_REGISTRY.find(g => g.gameId === gameId);
  if (!cfg) throw new Error(`Unknown gameId: ${gameId}`);
  return cfg;
}
```

### 2. Create `src/stores/activeGame.ts`

Persisted writable store for `activeGameId`. Defaults to `'klondike'`. Reads/writes `'solitaire:activeGameId'` in localStorage. Expose a `switchTo(gameId)` method.

### 3. Create `src/components/GameSelector.svelte`

- Props: `games: GameConfig[]`, `activeGameId: string`
- Dispatches: `select` event with `{ gameId: string }`
- UI: dropdown button showing active game name + list of all games
- ARIA: `role="listbox"` / `role="option"`, `aria-current="true"` on active item
- Keyboard: ArrowUp/ArrowDown navigate, Enter selects, Escape closes
- Mobile: 44×44px tap targets, no overflow on 375px viewport

### 4. Modify `src/components/Header.svelte`

- Import and render `<GameSelector>` in the controls area
- Accept new prop: `games: GameConfig[]`, `activeGameId: string`
- Forward `select` event upward to `+page.svelte`

### 5. Modify `src/routes/+page.svelte`

- Import `GAME_REGISTRY`, `activeGame` store, `getGameConfig`
- Derive `config`, `engine`, `gameStore` reactively from `$activeGame`
- On `select` event from Header/GameSelector:
  - If `moves > 0` and `!isComplete`: show inline confirm dialog
  - On confirm: call `activeGame.switchTo(gameId)`
  - On cancel: do nothing
- Reactive block: when `$activeGame` changes, if `$gameStore` is null call `engine.newGame()`
- Update `<svelte:head>` title to use `config.displayName`

---

## Success Criteria (Developer Exit)

- [ ] All 13 AC-GS-01 through AC-GS-13 acceptance criteria met
- [ ] `GameSelector` renders all 3 games from GAME_REGISTRY (no hardcoded strings)
- [ ] Switching games with no progress → immediate deal, no dialog
- [ ] Switching mid-game → confirmation dialog → save + switch or cancel unchanged
- [ ] Returning to previous game restores saved state
- [ ] Keyboard navigation works (arrow + Enter + Escape)
- [ ] 375px viewport: no overflow, 44px tap targets
- [ ] Existing 143 unit tests still pass (zero regressions)
- [ ] At least 15 new unit tests covering: registry, activeGame store, selector dispatch logic
- [ ] `PR_SUMMARY.md` updated with changes

---

## Branch

Create and work on: `feature/game-selector`
