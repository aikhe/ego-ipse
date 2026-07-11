<script lang="ts">
  import Hero from '$lib/layouts/Hero.svelte';
  import SceneLayout from '$lib/layouts/SceneLayout.svelte';
  import PosterOverlay from '$lib/components/Poster/PosterOverlay.svelte';
  import { getOpenPanel } from '$lib/analytics';

  import poster1 from '$lib/assets/posters/1.png';
  import poster2 from '$lib/assets/posters/2.png';
  import poster3 from '$lib/assets/posters/3.png';
  import poster4 from '$lib/assets/posters/4.png';

  import { uiState } from '$lib/state/ui.svelte';

  let { data } = $props();

  let selectedPoster = $state<number | null>(null);

  $effect(() => {
    if (selectedPoster !== null) {
      getOpenPanel()?.track('gallery_open', { poster: selectedPoster });
    }
  });
</script>

<div class="page-shell">
  <section class="hero-section section-container pointer-events-none relative">
    <Hero
      projects={data.projects || []}
      socials={data.socials || []}
      github={data.github}
    />
  </section>

  <SceneLayout
    isShifted={uiState.isProjectView}
    onposterclick={i => (selectedPoster = i)}
  />
</div>

{#if selectedPoster !== null}
  <PosterOverlay
    bind:selected={selectedPoster}
    images={[poster1, poster2, poster3, poster4]}
  />
{/if}

<style>
  .page-shell {
    height: var(--page-stage-height, 100vh);
    position: relative;
  }

  .hero-section {
    align-items: end;
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(12, 1fr);
    height: calc(var(--page-stage-height, 100vh) - 4.8rem);
    padding-bottom: 2rem;
    z-index: 1;
  }
</style>
