import { writable } from 'svelte/store';
import type { Settings } from '../engine/types';
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter';

const storage = new LocalStorageAdapter();

const DEFAULT_SETTINGS: Settings = {
  drawMode: 1,
  cardBack: 'classic-blue',
  cardFaceTheme: 'standard',
  autoFlip: true,
  animationsEnabled: true,
};

function isValidSettings(obj: unknown): obj is Settings {
  if (typeof obj !== 'object' || obj === null) return false;
  const s = obj as Record<string, unknown>;
  return (s['drawMode'] === 1 || s['drawMode'] === 3) && typeof s['cardBack'] === 'string';
}

const raw = storage.loadSettings();
const initial: Settings = isValidSettings(raw) ? raw : DEFAULT_SETTINGS;

const { subscribe, set, update } = writable<Settings>(initial);

export const settings = {
  subscribe,
  set(s: Settings) {
    set(s);
    storage.saveSettings(s);
  },
  update(fn: (s: Settings) => Settings) {
    update((s) => {
      const next = fn(s);
      storage.saveSettings(next);
      return next;
    });
  },
};
