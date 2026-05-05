<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { GameConfig } from '../engine/GameConfig';

  export let games: GameConfig[] = [];
  export let activeGameId: string = '';

  let open = false;
  let listEl: HTMLUListElement;

  const dispatch = createEventDispatcher<{ select: { gameId: string } }>();

  function toggle() {
    open = !open;
    if (open) {
      // Focus active item after DOM update
      setTimeout(() => {
        const active = listEl?.querySelector('[aria-selected="true"]') as HTMLElement | null;
        active?.focus();
      }, 0);
    }
  }

  function select(gameId: string) {
    open = false;
    if (gameId !== activeGameId) {
      dispatch('select', { gameId });
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) return;
    const items = Array.from(listEl?.querySelectorAll('[role="option"]') ?? []) as HTMLElement[];
    const idx = items.findIndex((el) => el === document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Escape') {
      open = false;
    }
  }

  function handleBlur(e: FocusEvent) {
    // Close if focus leaves the entire selector
    const next = e.relatedTarget as Node | null;
    if (!listEl?.contains(next)) {
      open = false;
    }
  }

  $: activeGame = games.find((g) => g.gameId === activeGameId);
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="game-selector" role="none" on:keydown={handleKeydown}>
  <button
    class="selector-btn"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-label="Select game: {activeGame?.displayName ?? 'Game'}"
    on:click={toggle}
  >
    {activeGame?.displayName ?? 'Select Game'}
    <span class="chevron" aria-hidden="true">{open ? '▲' : '▼'}</span>
  </button>

  {#if open}
    <ul
      bind:this={listEl}
      role="listbox"
      aria-label="Available games"
      class="game-list"
      on:focusout={handleBlur}
    >
      {#each games as game}
        <li
          role="option"
          tabindex="0"
          aria-selected={game.gameId === activeGameId}
          aria-current={game.gameId === activeGameId ? 'true' : undefined}
          class:active={game.gameId === activeGameId}
          on:click={() => select(game.gameId)}
          on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(game.gameId); } }}
        >
          {#if game.gameId === activeGameId}
            <span class="check" aria-hidden="true">✓</span>
          {:else}
            <span class="check" aria-hidden="true"> </span>
          {/if}
          {game.displayName}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .game-selector {
    position: relative;
    display: inline-block;
  }

  .selector-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    min-height: 44px;
    min-width: 44px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    color: inherit;
    font-size: 0.9rem;
    cursor: pointer;
    white-space: nowrap;
  }

  .selector-btn:hover,
  .selector-btn:focus-visible {
    background: rgba(255, 255, 255, 0.25);
    outline: 2px solid white;
    outline-offset: 2px;
  }

  .chevron {
    font-size: 0.7rem;
  }

  .game-list {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 100;
    list-style: none;
    margin: 0;
    padding: 4px 0;
    min-width: 160px;
    background: #1a5c38;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .game-list li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    min-height: 44px;
    cursor: pointer;
    font-size: 0.95rem;
    color: white;
    user-select: none;
  }

  .game-list li:hover,
  .game-list li:focus-visible {
    background: rgba(255, 255, 255, 0.2);
    outline: none;
  }

  .game-list li.active {
    font-weight: bold;
  }

  .check {
    width: 1em;
    display: inline-block;
    text-align: center;
  }

  /* Mobile: full-width on small screens */
  @media (max-width: 480px) {
    .game-list {
      left: auto;
      right: 0;
      min-width: 140px;
    }
  }
</style>
