# HANDOFF-003: Developer → QA

**From:** Developer Agent  
**To:** QA Agent  
**Date:** 2026-05-04  
**Status:** Ready for QA

---

## Deliverables Completed

| Deliverable | Status |
|---|---|
| Engine types + interfaces | ✅ |
| DeckFactory (crypto shuffle) | ✅ |
| Build rule strategies (5 rules) | ✅ |
| MoveValidator | ✅ |
| StateManager (immutable + undo) | ✅ |
| WinDetector | ✅ |
| GameEngine facade | ✅ |
| LocalStorageAdapter | ✅ |
| Game stores (gameState, settings) | ✅ |
| Klondike config.json | ✅ |
| All Svelte components | ✅ |
| PWA + Workbox config | ✅ |
| CI/CD GitHub Actions deploy.yml | ✅ |
| Unit tests (6 spec files) | ✅ |
| PR_SUMMARY.md | ✅ |

---

## Architecture Summary (for QA reference)

- **Entry point:** `src/routes/+page.svelte` — orchestrates engine, stores, and UI
- **Engine:** Pure TypeScript, no DOM dependency — unit-testable in isolation
- **State:** Immutable transitions via `StateManager.applyMove()` / `undoMove()` / `applyDraw()`
- **Persistence:** `LocalStorageAdapter` under namespace `svelte-solitaire:`
- **Win detection:** `WinDetector.isWon()` called after every move in `GameEngine`
- **PWA:** `UpdateBanner` + `InstallPrompt` driven by Service Worker lifecycle events

---

## QA Scope

### Unit Tests (Vitest) — Already Provided
Located in `tests/unit/`. Run with `npm run test:unit`. Coverage target ≥ 90%.

### Integration Tests — QA to Create
File: `tests/integration/game-engine.spec.ts`  
Scenarios:
- Full Klondike new game — verify initial tableau cascade (7 columns, 1–7 cards)
- Foundation build sequence — Ace through King same suit
- Undo chain — 5 moves then 5 undos; state equals initial
- Draw 1 mode — single card per draw; recycle restores all waste cards
- Draw 3 mode — 3 cards per draw

### E2E Tests (Playwright) — QA to Create
Files: `tests/e2e/game-flow.spec.ts`, `tests/e2e/pwa-offline.spec.ts`  
Scenarios:
- New game renders board with 7 tableau columns and 4 foundations
- Clicking stock draws a card to waste
- Drag-and-drop valid move completes
- Keyboard shortcut Ctrl+N starts new game
- Keyboard shortcut Ctrl+Z undoes
- Win overlay appears when all cards on foundations
- Settings panel opens and persists draw mode
- PWA: SW registers; offline mode serves cached app shell

---

## Acceptance Criteria (from Analyst US-005)
- [ ] All unit tests pass with ≥ 90% coverage
- [ ] Full game of Klondike completable in browser
- [ ] New Game resets board to valid shuffled state
- [ ] Undo reverses score, moves, and board state
- [ ] Game state survives page refresh
- [ ] Win overlay appears after placing last card
- [ ] Lighthouse accessibility score ≥ 90
- [ ] App installable as PWA
- [ ] App functional offline after first load

---

## Environment
- `npm run dev` — dev server at `localhost:5173`
- `npm run build && npm run preview` — production preview
- `npm run test:unit` — Vitest unit suite
- `npm run test:e2e` — Playwright E2E suite (requires `npx playwright install` first)
