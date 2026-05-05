# PR Summary — MVP Core Engine

**Branch:** `feature/mvp-core-engine`  
**Phase:** Developer (Phase 3)  
**Date:** 2026-05-04

---

## Changes

### New Files

**Engine (`src/engine/`):**
- `types.ts` — Core TypeScript interfaces: `Card`, `GameState`, `MoveRecord`, `PileReference`, `Settings`
- `GameConfig.ts` — `GameConfig` interface mirroring `game-config.schema.json`
- `DeckFactory.ts` — `buildDeck()` + `shuffleDeck()` using `crypto.getRandomValues()` (Fisher-Yates)
- `MoveValidator.ts` — Validates moves via strategy registry; pile-type aware
- `StateManager.ts` — Immutable state transitions, undo stack, draw/recycle logic
- `WinDetector.ts` — `all-to-foundations` and `all-ordered-tableau` win conditions
- `GameEngine.ts` — Facade orchestrating Validator + StateManager + WinDetector
- `strategies/BuildRuleStrategy.ts` — Interface
- `strategies/registry.ts` — `getStrategy()` with strict error on unknown rule
- `strategies/AscendingSameSuitStrategy.ts` — Foundation build rule
- `strategies/DescendingAlternatingColorStrategy.ts` — Klondike tableau rule
- `strategies/DescendingSameSuitStrategy.ts` — Spider-style rule
- `strategies/AnyStrategy.ts` — FreeCell free-cell rule
- `strategies/NoneStrategy.ts` — Closed pile rule

**Storage (`src/storage/`):**
- `StorageAdapter.ts` — Interface for swappable persistence backend
- `LocalStorageAdapter.ts` — localStorage with try/catch safety, schema-namespaced keys

**Stores (`src/stores/`):**
- `gameState.ts` — Debounced (500ms) Svelte writable store backed by `LocalStorageAdapter`
- `settings.ts` — Settings store with localStorage persistence and defaults

**Game Config:**
- `src/games/klondike/config.json` — Full Klondike configuration matching the JSON Schema

**UI (`src/components/`):**
- `Card.svelte` — ARIA-labelled, keyboard/drag/tap enabled, face-up/down states
- `GameBoard.svelte` — Dynamic layout driven by config's `topRow`/`bottomRows`
- `TableauColumn.svelte` — Drag-and-drop target + tap-to-select
- `StockPile.svelte`, `WastePile.svelte`, `FoundationPile.svelte`
- `Header.svelte` — Score/timer/moves display + New/Undo/Settings buttons
- `WinOverlay.svelte` — Animated modal with game summary
- `SettingsPanel.svelte` — Draw mode toggle + animations setting
- `UpdateBanner.svelte` — SW update notification
- `InstallPrompt.svelte` — PWA install banner

**Routes:**
- `src/routes/+layout.svelte`
- `src/routes/+page.svelte` — Game page with timer, keyboard shortcuts (Ctrl+N, Ctrl+Z), visibility API pause

**Config:**
- `svelte.config.js` — `@sveltejs/adapter-static`, base path `/solataire-game-app` in production
- `vite.config.ts` — `vite-plugin-pwa` with Workbox, `registerType: 'prompt'`, CacheFirst for assets
- `tsconfig.json`, `package.json`
- `src/app.html` — CSP meta tag, base HTML
- `src/app.css` — CSS custom properties, felt color scheme

**CI/CD:**
- `.github/workflows/deploy.yml` — Checkout → Node 20 → `npm ci` → `npm run test:unit` → `npm run build` → GitHub Pages deploy
- `static/.nojekyll` — Prevents Jekyll processing on GitHub Pages

**Unit Tests (`tests/unit/`):**
- `DeckFactory.spec.ts`
- `strategies.spec.ts`
- `WinDetector.spec.ts`
- `StateManager.spec.ts`
- `MoveValidator.spec.ts`
- `LocalStorageAdapter.spec.ts`

---

## Security Notes
- No `Math.random()` — all shuffling uses `crypto.getRandomValues()`
- CSP meta tag blocks inline scripts and external connections
- `LocalStorageAdapter` wraps all JSON parse in try/catch; malformed data → null (safe discard)
- All drag-and-drop data parsed inside try/catch; no `eval()`
- No dynamic URL construction or external API calls

---

## Testing
- Unit tests: Vitest, jsdom environment
- Target: ≥ 90% branch coverage on engine files
- Run: `npm run test:unit`

---

**Trigger:** QA phase begins upon this document's creation and unit tests passing in CI.
