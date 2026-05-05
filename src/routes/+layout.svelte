<script lang="ts">
  import '../app.css';
  import UpdateBanner from '../components/UpdateBanner.svelte';
  import InstallPrompt from '../components/InstallPrompt.svelte';
</script>

<UpdateBanner />
<InstallPrompt />
<slot />
