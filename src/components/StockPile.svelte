<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Card } from '../engine/types';
  import CardComponent from './Card.svelte';

  export let cards: Card[];

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('draw');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dispatch('draw');
    }
  }
</script>

<div
  class="stock-pile"
  role="button"
  tabindex="0"
  aria-label="{cards.length} cards in stock. Click to draw."
  on:click={handleClick}
  on:keydown={handleKeydown}
>
  {#if cards.length > 0}
    <CardComponent suit="spades" value={1} faceUp={false} draggable={false} />
    <span class="count" aria-hidden="true">{cards.length}</span>
  {:else}
    <div class="empty-pile" aria-label="Empty stock — click to recycle waste">↺</div>
  {/if}
</div>

<style>
  .stock-pile {
    width: var(--card-width);
    height: var(--card-height);
    position: relative;
    cursor: pointer;
    border-radius: var(--card-radius);
  }
  .stock-pile:focus-visible { outline: 2px solid var(--color-accent); }
  .count {
    position: absolute;
    bottom: 4px;
    right: 6px;
    font-size: 0.75rem;
    font-weight: bold;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.7);
  }
  .empty-pile {
    width: 100%;
    height: 100%;
    border: 2px dashed var(--color-pile-empty-border);
    border-radius: var(--card-radius);
    background: var(--color-pile-empty);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: rgba(255,255,255,0.5);
  }
</style>
