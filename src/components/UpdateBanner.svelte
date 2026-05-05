<script lang="ts">
  import { onMount } from 'svelte';

  let registration: ServiceWorkerRegistration | null = null;
  let showBanner = false;

  onMount(async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;
      registration.addEventListener('updatefound', () => {
        const newWorker = registration?.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showBanner = true;
          }
        });
      });
    } catch { /* SW not available */ }
  });

  function applyUpdate() {
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
</script>

{#if showBanner}
  <div class="banner" role="alert" aria-live="polite">
    <span>A new version is available!</span>
    <button on:click={applyUpdate}>Refresh</button>
    <button on:click={() => showBanner = false} aria-label="Dismiss">✕</button>
  </div>
{/if}

<style>
  .banner {
    position: fixed;
    bottom: 16px; left: 50%; transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    display: flex;
    gap: 12px;
    align-items: center;
    z-index: 300;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  }
  button {
    background: var(--color-accent);
    color: #000;
    border: none;
    border-radius: 4px;
    padding: 4px 12px;
    cursor: pointer;
    font-weight: bold;
  }
</style>
