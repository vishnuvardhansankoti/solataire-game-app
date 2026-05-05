<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { GameEngine } from '../engine/GameEngine';
  import { createGameStore } from '../stores/gameState';
  import { settings } from '../stores/settings';
  import { activeGame } from '../stores/activeGame';
  import { GAME_REGISTRY, getGameConfig } from '../games/registry';
  import type { PileReference, Card } from '../engine/types';
  import Header from '../components/Header.svelte';
  import GameBoard from '../components/GameBoard.svelte';
  import WinOverlay from '../components/WinOverlay.svelte';
  import SettingsPanel from '../components/SettingsPanel.svelte';

  // Reactive derivations from the activeGame store
  $: config = getGameConfig($activeGame);
  $: engine = new GameEngine(config);
  $: gameStore = createGameStore($activeGame);

  let showSettings = false;
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  // Confirmation dialog state
  let pendingGameId: string | null = null;
  let showConfirm = false;

  // When the active game changes, ensure a game state exists
  $: if (browser && $gameStore === null) {
    gameStore.set(engine.newGame({ drawMode: $settings.drawMode }));
  }

  onMount(() => {
    if (!$gameStore) {
      gameStore.set(engine.newGame({ drawMode: $settings.drawMode }));
    }
    startTimer();
    if (browser) document.addEventListener('visibilitychange', handleVisibility);
  });

  onDestroy(() => {
    stopTimer();
    if (browser) document.removeEventListener('visibilitychange', handleVisibility);
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
    if (browser && document.hidden) stopTimer(); else startTimer();
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

  function handleSelectGame(event: CustomEvent<{ gameId: string }>) {
    const { gameId } = event.detail;
    if (gameId === $activeGame) return;

    const hasMoves = $gameStore && $gameStore.moves > 0 && !$gameStore.isComplete;
    if (hasMoves) {
      pendingGameId = gameId;
      showConfirm = true;
    } else {
      activeGame.switchTo(gameId);
    }
  }

  function confirmSwitch() {
    if (pendingGameId) {
      activeGame.switchTo(pendingGameId);
    }
    pendingGameId = null;
    showConfirm = false;
  }

  function cancelSwitch() {
    pendingGameId = null;
    showConfirm = false;
  }

  $: pendingGameName = pendingGameId ? getGameConfig(pendingGameId).displayName : '';
</script>

<svelte:head>
  <title>{config.displayName}</title>
</svelte:head>

{#if $gameStore}
  <div class="game-container" role="main">
    <Header
      score={$gameStore.score}
      moves={$gameStore.moves}
      elapsed={$gameStore.elapsedSeconds}
      games={GAME_REGISTRY}
      activeGameId={$activeGame}
      on:newGame={handleNewGame}
      on:undo={handleUndo}
      on:openSettings={() => showSettings = true}
      on:selectGame={handleSelectGame}
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

{#if showConfirm}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <div class="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title" on:click|self={cancelSwitch}>
    <div class="confirm-dialog">
      <p id="confirm-title">Switch to {pendingGameName}? Your {config.displayName} progress will be saved.</p>
      <div class="confirm-actions">
        <button on:click={confirmSwitch} class="btn-confirm">Switch</button>
        <button on:click={cancelSwitch} class="btn-cancel">Cancel</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .game-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }

  .confirm-dialog {
    background: #1a5c38;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    padding: 24px;
    max-width: 320px;
    width: 90%;
    text-align: center;
    color: white;
  }

  .confirm-dialog p {
    margin: 0 0 20px;
    font-size: 1rem;
    line-height: 1.4;
  }

  .confirm-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .btn-confirm, .btn-cancel {
    padding: 10px 24px;
    min-height: 44px;
    border-radius: 6px;
    font-size: 0.95rem;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .btn-confirm {
    background: rgba(255, 255, 255, 0.9);
    color: #1a5c38;
    font-weight: bold;
  }

  .btn-cancel {
    background: transparent;
    color: white;
  }
</style>
