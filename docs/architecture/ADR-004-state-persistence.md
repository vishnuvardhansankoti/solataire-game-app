# ADR-004 — State Persistence: localStorage (Primary) with Dexie.js Abstraction

**Date:** 2026-05-04  
**Status:** Approved  
**Deciders:** Architect Agent, Orchestrator  
**Input:** `docs/requirements/user-stories-core-gameplay.md §US-03`, `docs/requirements/user-stories-game-engine.md §US-ST`, `docs/PRD.md §4.4`

---

## Context

The app must persist game state across browser sessions so players can resume games after closing the browser. Two browser storage mechanisms are candidates:

- **`localStorage`** — synchronous, simple key-value store, ~5 MB limit per origin.
- **IndexedDB (via Dexie.js)** — asynchronous, structured object storage, much larger quota, supports multiple stores/indexes.

A single Klondike game state serializes to approximately **2–4 KB** of JSON (52 cards × ~40 bytes each + metadata). With a 5 MB limit, localStorage can store hundreds of saved game states before hitting quota.

---

## Decision

### Primary: localStorage

Use `localStorage` as the primary persistence mechanism for Phase 1 (MVP) and Phase 2.

**Namespacing:**
```
localStorage key: "svelte-solitaire:state:{gameId}"     ← per-game state
localStorage key: "svelte-solitaire:settings"           ← user preferences
localStorage key: "svelte-solitaire:highscores"         ← per-game high scores
```

**Write Strategy:** Debounced writes at 500ms after any state change (using Svelte's `derived` store + a debounce utility). This avoids thrashing on rapid moves.

**Schema Version:** Every serialized state object includes a `schemaVersion: number` field. On load, if the version does not match the current engine version, the state is silently discarded.

### Future: Dexie.js (IndexedDB) — Phase 3

The persistence layer must be abstracted behind a `StorageAdapter` interface from day one, so the backing store can be swapped to Dexie.js in Phase 3 without touching game logic.

```typescript
// src/storage/StorageAdapter.ts
export interface StorageAdapter {
  save(gameId: string, state: GameState): Promise<void>;
  load(gameId: string): Promise<GameState | null>;
  clear(gameId: string): Promise<void>;
  listSavedGames(): Promise<string[]>;
}
```

Two implementations are provided:
- `LocalStorageAdapter.ts` — wraps `localStorage`, returns `Promise` (sync ops wrapped in `Promise.resolve()`).
- `DexieAdapter.ts` — wraps Dexie.js IndexedDB, fully async. *(Phase 3)*

The active adapter is injected at app startup via a factory:

```typescript
export function createStorageAdapter(): StorageAdapter {
  // Phase 3: return new DexieAdapter();
  return new LocalStorageAdapter();
}
```

---

## Consequences

| Aspect | Impact |
|---|---|
| **Positive** | localStorage is universally supported; zero additional dependencies in MVP |
| **Positive** | `StorageAdapter` abstraction makes future migration to IndexedDB non-breaking |
| **Positive** | Namespaced keys prevent collision between game types |
| **Positive** | Schema versioning prevents crashes from stale data |
| **Negative** | localStorage is synchronous — potential jank if called on the render thread (mitigated by debounce) |
| **Negative** | 5 MB quota could theoretically be hit with very large multi-deck games (mitigated by future Dexie.js migration) |
| **Mitigation** | All writes are debounced; single Klondike state is ~3 KB |

---

## Security Considerations

- Game state stored in `localStorage` contains no PII — only card positions and scores.
- `JSON.parse()` on untrusted `localStorage` data is wrapped in a `try/catch`; schema version mismatch results in discard, not crash.
- No `eval()` or dynamic code execution on stored data.
- `localStorage` is origin-scoped by the browser; other sites cannot access it.

---

## Alternatives Considered

| Option | Reason Rejected |
|---|---|
| No persistence (session-only) | Violates AC-03 (auto-save game state) |
| Cookie storage | Size too small (~4 KB total); inappropriate for structured data |
| Direct Dexie.js from MVP | Over-engineered for current data sizes; adds unnecessary complexity in Phase 1 |
| `sessionStorage` | Does not survive browser close — violates AC-03 |
