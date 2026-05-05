import { writable } from 'svelte/store';
import type { GameState } from '../engine/types';
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter';

const SCHEMA_VERSION = 1;
const storage = new LocalStorageAdapter();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function isValidState(obj: unknown): obj is GameState {
  if (typeof obj !== 'object' || obj === null) return false;
  const s = obj as Record<string, unknown>;
  return s['schemaVersion'] === SCHEMA_VERSION &&
    typeof s['gameId'] === 'string' &&
    Array.isArray(s['tableau']) &&
    Array.isArray(s['foundations']);
}

export function createGameStore(gameId: string) {
  const raw = storage.load(gameId);
  const initial: GameState | null = isValidState(raw) ? raw : null;

  const { subscribe, set, update } = writable<GameState | null>(initial);

  function persist(state: GameState | null): void {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (state !== null) storage.save(gameId, state);
    }, 500);
  }

  return {
    subscribe,
    set(state: GameState | null) {
      set(state);
      persist(state);
    },
    update(fn: (s: GameState | null) => GameState | null) {
      update((s) => {
        const next = fn(s);
        persist(next);
        return next;
      });
    },
    clear() {
      storage.clear(gameId);
      set(null);
    },
  };
}
