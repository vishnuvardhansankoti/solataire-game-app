<script lang="ts">
  import { onMount } from 'svelte';

  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  let showPrompt = false;

  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }

  onMount(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      showPrompt = true;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  });

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    showPrompt = false;
    deferredPrompt = null;
  }
</script>

{#if showPrompt}
  <div class="banner" role="complementary" aria-label="Install app">
    <span>Install Solitaire for offline play</span>
    <button on:click={install}>Install</button>
    <button on:click={() => showPrompt = false} aria-label="Dismiss">✕</button>
  </div>
{/if}

<style>
  .banner {
    position: fixed;
    top: 16px; left: 50%; transform: translateX(-50%);
    background: var(--color-felt-dark);
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
