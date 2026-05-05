<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Card, PileReference } from '../engine/types';
  import CardComponent from './Card.svelte';

  export let cards: Card[];

  const dispatch = createEventDispatcher();
  const fromRef: PileReference = { type: 'waste' };

  $: topCard = cards.length > 0 ? cards[cards.length - 1] : null;

  function handleTap() {
    if (!topCard) return;
    dispatch('move', { from: fromRef, cards: [topCard], pendingSelection: true });
  }

  function handleDragStart(event: DragEvent) {
    if (!topCard) return;
    event.dataTransfer?.setData('text/plain', JSON.stringify({ from: fromRef, cards: [topCard] }));
  }
</script>

<div class="waste-pile" role="region" aria-label="Waste pile, {cards.length} cards">
  {#if topCard}
    <CardComponent
      suit={topCard.suit}
      value={topCard.value}
      faceUp={topCard.faceUp}
      on:tap={handleTap}
      on:dragstart={(e) => handleDragStart(e.detail)}
    />
  {:else}
    <div class="empty-pile" aria-label="Waste pile empty"></div>
  {/if}
</div>

<style>
  .waste-pile { width: var(--card-width); height: var(--card-height); }
  .empty-pile {
    width: 100%;
    height: 100%;
    border: 2px dashed var(--color-pile-empty-border);
    border-radius: var(--card-radius);
    background: var(--color-pile-empty);
  }
</style>
