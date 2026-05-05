<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Card, PileReference } from '../engine/types';
  import CardComponent from './Card.svelte';

  export let index: number;
  export let cards: Card[];

  const dispatch = createEventDispatcher();

  let selectedStart: number | null = null;

  const fromRef: PileReference = { type: 'tableau', index };

  function handleCardTap(cardIdx: number) {
    if (!cards[cardIdx].faceUp) return;
    if (selectedStart === null) {
      selectedStart = cardIdx;
    } else {
      // Already selected in same column — deselect
      selectedStart = null;
    }
    // Propagate selection up for cross-column moves (handled by GameBoard via store)
    const selectedCards = cards.slice(cardIdx);
    dispatch('move', { from: fromRef, cards: selectedCards, pendingSelection: true });
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const raw = event.dataTransfer?.getData('text/plain');
    if (!raw) return;
    try {
      const { from, cards: movedCards } = JSON.parse(raw) as { from: PileReference; cards: Card[] };
      const toRef: PileReference = { type: 'tableau', index };
      dispatch('move', { from, to: toRef, cards: movedCards });
    } catch { /* ignore bad drag data */ }
  }

  function handleDragOver(event: DragEvent) { event.preventDefault(); }

  function handleCardDragStart(event: DragEvent, cardIdx: number) {
    const selectedCards = cards.slice(cardIdx);
    event.dataTransfer?.setData('text/plain', JSON.stringify({ from: fromRef, cards: selectedCards }));
  }
</script>

<div
  class="tableau-column"
  role="list"
  aria-label="Tableau column {index + 1}"
  on:drop={handleDrop}
  on:dragover={handleDragOver}
>
  {#if cards.length === 0}
    <div class="empty-pile" role="listitem" aria-label="Empty column"></div>
  {:else}
    {#each cards as card, i}
      <div class="card-wrapper" style="margin-top: {i > 0 ? 'calc(-1 * var(--card-height) + var(--tableau-overlap))' : '0'}"
        role="listitem">
        <CardComponent
          suit={card.suit}
          value={card.value}
          faceUp={card.faceUp}
          selected={selectedStart !== null && i >= selectedStart}
          on:tap={() => handleCardTap(i)}
          on:dragstart={(e) => handleCardDragStart(e.detail, i)}
        />
      </div>
    {/each}
  {/if}
</div>

<style>
  .tableau-column {
    display: flex;
    flex-direction: column;
    width: var(--card-width);
    flex-shrink: 0;
    min-height: var(--card-height);
    position: relative;
  }
  .empty-pile {
    width: var(--card-width);
    height: var(--card-height);
    border: 2px dashed var(--color-pile-empty-border);
    border-radius: var(--card-radius);
    background: var(--color-pile-empty);
  }
  .card-wrapper { position: relative; }
</style>
