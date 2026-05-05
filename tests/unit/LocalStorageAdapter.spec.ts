import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAdapter } from '../../src/storage/LocalStorageAdapter';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(store).forEach((k) => delete store[k]);
    adapter = new LocalStorageAdapter();
  });

  it('saves and loads game state', () => {
    const data = { gameId: 'klondike', score: 42 };
    adapter.save('klondike', data);
    expect(adapter.load('klondike')).toEqual(data);
  });

  it('returns null for unknown gameId', () => {
    expect(adapter.load('nonexistent')).toBeNull();
  });

  it('clears game state', () => {
    adapter.save('klondike', { score: 1 });
    adapter.clear('klondike');
    expect(adapter.load('klondike')).toBeNull();
  });

  it('saves and loads settings', () => {
    const settings = { drawMode: 3, cardBack: 'classic-red' };
    adapter.saveSettings(settings);
    expect(adapter.loadSettings()).toEqual(settings);
  });

  it('returns null for missing settings', () => {
    expect(adapter.loadSettings()).toBeNull();
  });

  it('returns null on malformed JSON', () => {
    store['svelte-solitaire:state:klondike'] = '{bad json}';
    expect(adapter.load('klondike')).toBeNull();
  });
});
