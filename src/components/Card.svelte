<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Card } from '../engine/types';

  export let suit: string;
  export let value: number;
  export let faceUp: boolean;
  export let draggable = true;
  export let selected = false;

  const dispatch = createEventDispatcher<{ tap: void; dragstart: DragEvent }>();

  const RANK_LABELS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const SUIT_SYMBOLS: Record<string, string> = {
    hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠',
  };
  const RED_SUITS = new Set(['hearts', 'diamonds']);

  $: rank = RANK_LABELS[value] ?? String(value);
  $: symbol = SUIT_SYMBOLS[suit] ?? suit;
  $: isRed = RED_SUITS.has(suit);
  $: ariaLabel = faceUp ? `${rank} of ${suit}` : 'Face-down card';

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dispatch('tap');
    }
  }

  function handleDragStart(event: DragEvent) {
    if (!faceUp || !draggable) { event.preventDefault(); return; }
    dispatch('dragstart', event);
  }
</script>

<div
  class="card"
  class:face-up={faceUp}
  class:face-down={!faceUp}
  class:red={isRed && faceUp}
  class:selected
  role="button"
  tabindex={faceUp ? 0 : -1}
  aria-label={ariaLabel}
  aria-pressed={selected}
  draggable={faceUp && draggable}
  on:click={() => dispatch('tap')}
  on:keydown={handleKeydown}
  on:dragstart={handleDragStart}
>
  {#if faceUp}
    <div class="card-inner">
      <span class="corner top-left">{rank}<br />{symbol}</span>
      <span class="suit-center" aria-hidden="true">{symbol}</span>
      <span class="corner bottom-right">{rank}<br />{symbol}</span>
    </div>
  {/if}
</div>

<style>
  .card {
    width: var(--card-width);
    height: var(--card-height);
    border-radius: var(--card-radius);
    border: 1px solid var(--color-card-border);
    box-shadow: 2px 2px 4px var(--color-card-shadow);
    flex-shrink: 0;
    user-select: none;
    cursor: pointer;
    position: relative;
    transition: transform var(--transition-snap), outline var(--transition-snap);
  }
  .face-up { background: var(--color-card-bg); }
  .face-down {
    background: repeating-linear-gradient(
      45deg,
      var(--color-card-back),
      var(--color-card-back) 4px,
      #2048a8 4px,
      #2048a8 8px
    );
    cursor: default;
  }
  .red { color: var(--color-suit-red); }
  .card:not(.face-down) { color: var(--color-suit-black); }
  .red { color: var(--color-suit-red); }
  .selected { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  .card:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  .card-inner { display: flex; flex-direction: column; height: 100%; padding: 3px; font-size: 0.7rem; font-weight: bold; }
  .corner { line-height: 1.1; }
  .bottom-right { align-self: flex-end; transform: rotate(180deg); margin-top: auto; }
  .suit-center { font-size: 1.5rem; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
</style>
