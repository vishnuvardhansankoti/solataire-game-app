import { writable } from 'svelte/store';

const STORAGE_KEY = 'solitaire:activeGameId';
const DEFAULT_GAME = 'klondike';

function createActiveGameStore() {
  const initial =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) ?? DEFAULT_GAME)
      : DEFAULT_GAME;
  const { subscribe, set } = writable<string>(initial);

  return {
    subscribe,
    switchTo(gameId: string) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, gameId);
      }
      set(gameId);
    },
  };
}

export const activeGame = createActiveGameStore();
