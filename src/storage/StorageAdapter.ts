/**
 * StorageAdapter abstracts the persistence backing store.
 * Implement this interface to swap localStorage for IndexedDB (Dexie) or any other store.
 */
export interface StorageAdapter {
  save(gameId: string, data: unknown): void;
  load(gameId: string): unknown | null;
  clear(gameId: string): void;
  loadSettings(): unknown | null;
  saveSettings(settings: unknown): void;
}
