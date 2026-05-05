# ADR-006 — Game Selector: In-Page Reactive Store Switch

**Date:** 2026-05-04  
**Status:** Accepted  
**Deciders:** Architect  
**Feature:** Sprint 3 Task 1 — Game Selector UI

---

## Context

The app currently hardcodes `klondikeConfig` in `src/routes/+page.svelte`. Three games are shipped (`klondike`, `spider`, `freecell`). The new requirement is to let users switch between games at runtime from the UI, with state preservation and confirmation guards.

Two architectural approaches were considered.

---

## Options Considered

### Option A — In-Page Reactive Store Switch (Selected)

A Svelte writable store (`activeGameId`) drives which game config, engine, and game store are active. `+page.svelte` reacts to `activeGameId` changes and reinitialises the engine and board. No SvelteKit routing changes needed.

**Pros:**
- Zero route restructuring (single-page, single `+layout.js` prerender config preserved)
- Existing `GameBoard`, `Header`, `WinOverlay` components unchanged
- Per-gameId localStorage isolation already in place (`createGameStore(gameId)`)
- No URL change → no back-button confusion
- Easiest to implement without regressions

**Cons:**
- `activeGameId` is not reflected in the URL (deep-linking to a specific game not supported)
- If future requirement adds per-game URLs, a migration is needed

### Option B — Route Per Game (`/games/[gameId]`)

Each game gets its own SvelteKit route with dynamic parameter.

**Pros:**
- URL reflects active game; bookmarkable; proper browser history

**Cons:**
- Requires SvelteKit dynamic routing + server-side/prerender config for each game
- Would require restructuring `+page.svelte` into `src/routes/games/[gameId]/+page.svelte`
- Significant refactor risk; breaks existing prerender setup
- Out of scope for this sprint

**Decision: Option A.** URL-based routing is deferred to a future ADR if/when deep-linking is required.

---

## Architecture Design

### 1. Game Registry — `src/games/registry.ts`

A single source of truth for all available games. Importing all configs here avoids dynamic imports (which would complicate prerendering).

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

Adding a new game = add one import line + one entry. The `GameSelector` component receives `GAME_REGISTRY` as a prop.

### 2. Active Game Store — `src/stores/activeGame.ts`

```typescript
import { writable } from 'svelte/store';

const STORAGE_KEY = 'solitaire:activeGameId';

function createActiveGameStore() {
  const initial = (typeof localStorage !== 'undefined'
    ? localStorage.getItem(STORAGE_KEY)
    : null) ?? 'klondike';

  const { subscribe, set } = writable<string>(initial);

  return {
    subscribe,
    switchTo(gameId: string) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, gameId);
      }
      set(gameId);
    }
  };
}

export const activeGame = createActiveGameStore();
```

### 3. GameSelector Component — `src/components/GameSelector.svelte`

Props:
- `games: GameConfig[]` — list from registry
- `activeGameId: string` — currently active game

Events dispatched:
- `select: { gameId: string }` — user confirmed a game switch

Internal state:
- `open: boolean` — dropdown visibility
- Delegates confirmation logic to `+page.svelte` (keeps selector pure/presentational)

### 4. Page-Level Switch Logic — `+page.svelte`

On `select` event from `GameSelector`:
1. If `$gameStore` has `moves > 0` and `isComplete === false` → show confirm dialog
2. On confirm (or no confirmation needed):
   - Current state is already in localStorage (auto-saved by existing store subscription)
   - Call `activeGame.switchTo(gameId)`
   - Reactive block re-derives `config`, `engine`, `gameStore` from `$activeGame`
   - If `$gameStore` is null → call `engine.newGame()` and set store

### 5. State Contract

| Scenario | Behaviour |
|---|---|
| User switches with `moves === 0` | Switch immediately, no dialog |
| User switches with `moves > 0`, `isComplete === false` | Show dialog; save on confirm |
| User switches to previously played game | Existing localStorage state auto-loaded |
| User switches to never-played game | `engine.newGame()` called automatically |
| User cancels dialog | No state change; current game continues |

---

## Schema Changes

No changes to `GameConfig` schema are required. The `displayName` field (already required) is used as the label in the selector. No `enabled` or `order` fields are needed at this time — registry order controls display order.

---

## Component Design: `GameSelector.svelte`

```
[Selector Button: "▼ Spider Solitaire"]
     ↓ (click/Enter opens dropdown)
┌────────────────────┐
│ ✓ Klondike         │  ← aria-current="true" on active
│   Spider           │
│   FreeCell         │
└────────────────────┘
```

- Dropdown positioned below the selector button (CSS `position: absolute`)
- On mobile (≤480px): full-width panel or slide-in sheet
- Keyboard: arrow keys navigate, Enter selects, Escape closes
- ARIA: `role="listbox"` on container, `role="option"` on each game

---

## Files to Create / Modify

| File | Action | Notes |
|---|---|---|
| `src/games/registry.ts` | **Create** | Central game list |
| `src/stores/activeGame.ts` | **Create** | Persisted activeGameId store |
| `src/components/GameSelector.svelte` | **Create** | Dropdown selector component |
| `src/routes/+page.svelte` | **Modify** | React to activeGame store, add switch logic + confirm dialog |
| `src/components/Header.svelte` | **Modify** | Add `GameSelector` to header controls area |

---

## Consequences

- All three games immediately switchable at runtime
- Adding a fourth game requires only: `src/games/newgame/config.json` + 1 line in `registry.ts`
- No regressions to existing 143 unit tests (engine/validator/state logic untouched)
- URL does not reflect active game (acceptable for Sprint 3; revisit in future ADR)
