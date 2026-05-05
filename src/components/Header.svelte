<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import GameSelector from './GameSelector.svelte';
  import type { GameConfig } from '../engine/GameConfig';

  export let score = 0;
  export let moves = 0;
  export let elapsed = 0;
  export let games: GameConfig[] = [];
  export let activeGameId: string = '';

  const dispatch = createEventDispatcher<{
    newGame: void;
    undo: void;
    openSettings: void;
    selectGame: { gameId: string };
  }>();

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
</script>

<header role="banner">
  <div class="stats" aria-live="polite">
    <span aria-label="Score: {score}">⭐ {score}</span>
    <span aria-label="Moves: {moves}">♟ {moves}</span>
    <span aria-label="Time: {formatTime(elapsed)}">⏱ {formatTime(elapsed)}</span>
  </div>
  <div class="controls">
    <GameSelector
      {games}
      {activeGameId}
      on:select={(e) => dispatch('selectGame', e.detail)}
    />
    <button on:click={() => dispatch('newGame')} aria-label="New Game" title="New Game (Ctrl+N)">New</button>
    <button on:click={() => dispatch('undo')} aria-label="Undo last move" title="Undo (Ctrl+Z)">Undo</button>
    <button on:click={() => dispatch('openSettings')} aria-label="Open settings">⚙</button>
  </div>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    background: rgba(0,0,0,0.2);
    flex-shrink: 0;
  }
  .stats { display: flex; gap: 16px; font-size: 0.9rem; }
  .controls { display: flex; gap: 8px; }
  button {
    background: rgba(255,255,255,0.15);
    color: var(--color-text-ui);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 4px;
    padding: 4px 10px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  button:hover, button:focus-visible {
    background: rgba(255,255,255,0.3);
    outline: 2px solid var(--color-accent);
  }
</style>
