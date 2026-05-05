import type { StorageAdapter } from './StorageAdapter';

const NS = 'svelte-solitaire';
const isBrowser = typeof localStorage !== 'undefined';

function stateKey(gameId: string): string {
  return `${NS}:state:${gameId}`;
}

const SETTINGS_KEY = `${NS}:settings`;

export class LocalStorageAdapter implements StorageAdapter {
  save(gameId: string, data: unknown): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(stateKey(gameId), JSON.stringify(data));
    } catch {
      // localStorage may be unavailable in private browsing; fail silently
    }
  }

  load(gameId: string): unknown | null {
    if (!isBrowser) return null;
    try {
      const raw = localStorage.getItem(stateKey(gameId));
      if (raw === null) return null;
      return JSON.parse(raw) as unknown;
    } catch {
      return null; // malformed JSON → discard
    }
  }

  clear(gameId: string): void {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(stateKey(gameId));
    } catch {
      // ignore
    }
  }

  loadSettings(): unknown | null {
    if (!isBrowser) return null;
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw === null) return null;
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  saveSettings(settings: unknown): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }
}
