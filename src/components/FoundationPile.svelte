<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Card, PileReference } from '../engine/types';
  import CardComponent from './Card.svelte';

  export let index: number;
  export let cards: Card[];

  const dispatch = createEventDispatcher();
  const toRef: PileReference = { type: 'foundation', index };

  $: topCard = cards.length > 0 ? cards[cards.length - 1] : null;

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const raw = event.dataTransfer?.getData('text/plain');
    if (!raw) return;
    try {
      const { from, cards: movedCards } = JSON.parse(raw) as { from: PileReference; cards: Card[] };
      dispatch('move', { from, to: toRef, cards: movedCards });
    } catch { /* ignore */ }
  }

  function handleDragOver(event: DragEvent) { event.preventDefault(); }

  function handleTap() {
    // When a card on the foundation is tapped, no action needed for Klondike.
    // This slot is a drop target.
  }
</script>

<div
  class="foundation-pile"
  role="region"
  aria-label="Foundation {index + 1}: {topCard ? `${topCard.value} of ${topCard.suit}` : 'empty'}"
  on:drop={handleDrop}
  on:dragover={handleDragOver}
>
  {#if topCard}
    <CardComponent
      suit={topCard.suit}
      value={topCard.value}
      faceUp={true}
      draggable={false}
      on:tap={handleTap}
    />
  {:else}
    <div class="empty-pile" aria-label="Empty foundation {index + 1}">A</div>
  {/if}
</div>

<style>
  .foundation-pile { width: var(--card-width); height: var(--card-height); }
  .empty-pile {
    width: 100%;
    height: 100%;
    border: 2px dashed var(--color-pile-empty-border);
    border-radius: var(--card-radius);
    background: var(--color-pile-empty);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: rgba(255,255,255,0.4);
    font-weight: bold;
  }
</style>
