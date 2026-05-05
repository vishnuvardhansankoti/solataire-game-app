<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let score = 0;
  export let moves = 0;
  export let elapsed = 0;

  const dispatch = createEventDispatcher<{ newGame: void }>();

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="win-title">
  <div class="win-card">
    <h1 id="win-title">🎉 You Win!</h1>
    <p>Score: <strong>{score}</strong></p>
    <p>Moves: <strong>{moves}</strong></p>
    <p>Time: <strong>{formatTime(elapsed)}</strong></p>
    <button on:click={() => dispatch('newGame')} autofocus>Play Again</button>
  </div>
</div>

<style>
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.65);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }
  .win-card {
    background: var(--color-card-bg);
    color: var(--color-text-dark);
    border-radius: 12px;
    padding: 32px 40px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  h1 { margin: 0 0 16px; font-size: 2rem; }
  p { margin: 8px 0; font-size: 1.1rem; }
  button {
    margin-top: 20px;
    padding: 10px 28px;
    background: var(--color-felt);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  button:hover { background: var(--color-felt-dark); }
  @keyframes popIn {
    from { transform: scale(0.7); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
</style>
