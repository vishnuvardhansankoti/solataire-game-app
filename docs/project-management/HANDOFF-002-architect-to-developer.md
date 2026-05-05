# HANDOFF — Architect → Developer
**Date:** 2026-05-04  
**Handoff ID:** HANDOFF-002

---

## 1. Current Phase
**Design → Development**

---

## 2. Input Files (Architect Deliverables)

| File | Description | Status |
|---|---|---|
| `docs/architecture/ADR-001-sveltekit-adapter-static.md` | Static adapter + GitHub Pages base path | ✅ Approved |
| `docs/architecture/ADR-002-generic-card-game-engine.md` | Strategy pattern engine design | ✅ Approved |
| `docs/architecture/ADR-003-pwa-service-worker-workbox.md` | Workbox / vite-plugin-pwa config | ✅ Approved |
| `docs/architecture/ADR-004-state-persistence.md` | localStorage + StorageAdapter interface | ✅ Approved |
| `docs/architecture/system-architecture.md` | Full system diagram, component tree, data flow | ✅ Approved |
| `docs/schema/game-config.schema.json` | JSON Schema v7 for game configs | ✅ Approved |
| `docs/schema/game-state.schema.json` | JSON Schema v7 for runtime state | ✅ Approved |

---

## 3. Active Agent
**Developer**

---

## 4. Success Criteria (What the Developer Must Produce)

The Developer phase is complete when **all** of the following exist:

**Configuration Files:**
- [ ] `package.json` with all required dependencies
- [ ] `svelte.config.js` (per ADR-001)
- [ ] `vite.config.ts` (per ADR-003)
- [ ] `tsconfig.json`

**Game Engine (src/engine/):**
- [ ] `BuildRuleStrategy.ts` interface
- [ ] `registry.ts` (strategy registry)
- [ ] All 5 strategy implementations
- [ ] `DeckFactory.ts` (crypto.getRandomValues shuffle)
- [ ] `MoveValidator.ts`
- [ ] `StateManager.ts` (immutable transitions + undo stack)
- [ ] `WinDetector.ts`
- [ ] `AssetManager.ts`

**Storage:**
- [ ] `StorageAdapter.ts` interface
- [ ] `LocalStorageAdapter.ts`

**Svelte Stores:**
- [ ] `stores/gameState.ts`
- [ ] `stores/settings.ts`

**Game Config:**
- [ ] `src/games/klondike/config.json`

**Key Components:**
- [ ] `Card.svelte` (with ARIA, tap, drag)
- [ ] `GameBoard.svelte` (dynamic layout)
- [ ] `TableauColumn.svelte`
- [ ] `StockPile.svelte`, `WastePile.svelte`, `FoundationPile.svelte`
- [ ] `Header.svelte`
- [ ] `WinOverlay.svelte`

**CI/CD:**
- [ ] `.github/workflows/deploy.yml`
- [ ] `static/.nojekyll`

**Unit Tests (Vitest):**
- [ ] `tests/unit/DeckFactory.spec.ts`
- [ ] `tests/unit/MoveValidator.spec.ts`
- [ ] `tests/unit/StateManager.spec.ts`
- [ ] `tests/unit/WinDetector.spec.ts`
- [ ] `tests/unit/strategies/*.spec.ts`
- [ ] `tests/unit/LocalStorageAdapter.spec.ts`

**PR Documentation:**
- [ ] `docs/project-management/PR_SUMMARY.md`

**Trigger to advance to QA:** `PR_SUMMARY.md` is present and all unit tests pass.

---

## 5. Context Link
[global-workflow-state.md](./global-workflow-state.md)

---

## 6. Developer Constraints

- **Branch:** `feature/mvp-core-engine` from `develop`.
- **Never:** commit secrets, skip unit tests, or use `innerHTML` with dynamic content.
- **Must use:** `crypto.getRandomValues()` for shuffle (not `Math.random()`).
- **Commit style:** Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`).
- **Test coverage:** ≥ 90% branch coverage on all engine files.
