<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { settings } from '../stores/settings';

  const dispatch = createEventDispatcher<{ close: void }>();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') dispatch('close');
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
  <div class="panel">
    <h2 id="settings-title">Settings</h2>

    <label>
      Draw Mode
      <select bind:value={$settings.drawMode}
        on:change={() => settings.set($settings)}>
        <option value={1}>Draw 1</option>
        <option value={3}>Draw 3</option>
      </select>
    </label>

    <label>
      Animations
      <input type="checkbox" bind:checked={$settings.animationsEnabled}
        on:change={() => settings.set($settings)} />
    </label>

    <button on:click={() => dispatch('close')} aria-label="Close settings">Close</button>
  </div>
</div>

<style>
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 200;
  }
  .panel {
    background: white;
    color: var(--color-text-dark);
    border-radius: 10px;
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 260px;
  }
  h2 { margin: 0; }
  label { display: flex; flex-direction: column; gap: 6px; font-size: 0.95rem; }
  select, input[type=checkbox] { font-size: 0.95rem; }
  button {
    align-self: flex-end;
    padding: 8px 20px;
    background: var(--color-felt);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
