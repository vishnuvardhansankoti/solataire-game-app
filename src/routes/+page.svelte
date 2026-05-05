<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';
  import { GameEngine } from '../engine/GameEngine';
  import { createGameStore } from '../stores/gameState';
  import { settings } from '../stores/settings';
  import type { GameConfig } from '../engine/GameConfig';
  import type { PileReference, Card } from '../engine/types';
  import Header from '../components/Header.svelte';
  import GameBoard from '../components/GameBoard.svelte';
  import WinOverlay from '../components/WinOverlay.svelte';
  import SettingsPanel from '../components/SettingsPanel.svelte';

  import klondikeConfig from '../games/klondike/config.json';

  const config = klondikeConfig as GameConfig;
  const gameId = config.gameId;
  const engine = new GameEngine(config);
  const gameStore = createGameStore(gameId);

  let showSettings = false;
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  onMount(() => {
    if (!$gameStore) {
      gameStore.set(engine.newGame({ drawMode: $settings.drawMode }));
    }
    startTimer();
    document.addEventListener('visibilitychange', handleVisibility);
  });

  onDestroy(() => {
    stopTimer();
    document.removeEventListener('visibilitychange', handleVisibility);
  });

  function startTimer() {
    timerInterval = setInterval(() => {
      gameStore.update((s) => {
        if (s && !s.isComplete) return { ...s, elapsedSeconds: s.elapsedSeconds + 1 };
        return s;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function handleVisibility() {
    if (document.hidden) stopTimer(); else startTimer();
  }

  function handleNewGame() {
    gameStore.set(engine.newGame({ drawMode: $settings.drawMode }));
  }

  function handleUndo() {
    if ($gameStore) gameStore.set(engine.undo($gameStore));
  }

  function handleDraw() {
    if ($gameStore) gameStore.set(engine.draw($gameStore));
  }

  function handleMove(event: CustomEvent<{ from: PileReference; to: PileReference; cards: Card[] }>) {
    if (!$gameStore) return;
    const next = engine.applyMove($gameStore, event.detail.from, event.detail.to, event.detail.cards);
    if (next) gameStore.set(next);
  }
</script>

<svelte:head>
  <title>Klondike Solitaire</title>
</svelte:head>

{#if $gameStore}
  <div class="game-container" role="main">
    <Header
      score={$gameStore.score}
      moves={$gameStore.moves}
      elapsed={$gameStore.elapsedSeconds}
      on:newGame={handleNewGame}
      on:undo={handleUndo}
      on:openSettings={() => showSettings = true}
    />
    <GameBoard
      state={$gameStore}
      {config}
      on:move={handleMove}
      on:draw={handleDraw}
    />
    {#if $gameStore.isComplete}
      <WinOverlay
        score={$gameStore.score}
        moves={$gameStore.moves}
        elapsed={$gameStore.elapsedSeconds}
        on:newGame={handleNewGame}
      />
    {/if}
    {#if showSettings}
      <SettingsPanel on:close={() => showSettings = false} />
    {/if}
  </div>
{/if}

<style>
  .game-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
</style>
