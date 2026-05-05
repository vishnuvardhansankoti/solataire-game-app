<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { GameState } from '../engine/types';
  import type { GameConfig } from '../engine/GameConfig';
  import StockPile from './StockPile.svelte';
  import WastePile from './WastePile.svelte';
  import FoundationPile from './FoundationPile.svelte';
  import TableauColumn from './TableauColumn.svelte';

  export let state: GameState;
  export let config: GameConfig;

  const dispatch = createEventDispatcher();

  const topRow = config.layout.topRow;
  const foundationCount = config.piles.foundations?.count ?? 4;
  const tableauCount = config.piles.tableau?.count ?? 7;

  let foundationIdx = 0;
  $: foundationIdx = 0; // reset on re-render

  function getFoundationIndex(slotIdx: number): number {
    // Count how many 'foundation' slots precede slotIdx in topRow
    return topRow.slice(0, slotIdx + 1).filter((s) => s === 'foundation').length - 1;
  }
</script>

<div class="game-board" role="region" aria-label="Game board">
  <!-- Top row: stock, waste, gaps, foundations -->
  <div class="top-row">
    {#each topRow as slot, i}
      {#if slot === 'stock'}
        <StockPile cards={state.deck} on:draw={() => dispatch('draw')} />
      {:else if slot === 'waste'}
        <WastePile cards={state.waste} on:move />
      {:else if slot === 'foundation'}
        <FoundationPile
          index={getFoundationIndex(i)}
          cards={state.foundations[getFoundationIndex(i)] ?? []}
          on:move
        />
      {:else}
        <div class="gap" aria-hidden="true"></div>
      {/if}
    {/each}
  </div>

  <!-- Tableau -->
  <div class="tableau-area">
    {#each state.tableau as column, colIdx}
      <TableauColumn index={colIdx} cards={column} on:move />
    {/each}
  </div>
</div>

<style>
  .game-board {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: var(--gap);
    gap: var(--gap);
    overflow: hidden;
  }
  .top-row {
    display: flex;
    gap: var(--gap);
    align-items: flex-start;
    flex-shrink: 0;
  }
  .gap {
    width: var(--card-width);
    flex-shrink: 0;
  }
  .tableau-area {
    display: flex;
    gap: var(--gap);
    flex: 1;
    align-items: flex-start;
    overflow: hidden;
  }
</style>
