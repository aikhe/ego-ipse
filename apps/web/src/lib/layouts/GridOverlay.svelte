<script lang="ts">
  import { uiState } from '$lib/state/ui.svelte';
</script>

{#if uiState.gridOverlay}
  <div class="grid-overlay section-container">
    {#each Array.from(Array(12).keys()) as i (i)}
      <div class="grid-column"></div>
    {/each}
  </div>
{/if}

<style>
  .grid-overlay {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(12, 1fr);
    inset: 0;
    margin-inline: auto;
    pointer-events: none;
    position: absolute;
    z-index: 9999;
  }

  .grid-column {
    background-color: var(--color-overlay-05);
  }
</style>
