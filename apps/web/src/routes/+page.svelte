<script lang="ts">
  import Hero from '$lib/layouts/Hero.svelte';
  import PosterOverlay from '$lib/components/Poster/PosterOverlay.svelte';
  import Scene from '$lib/components/Poster/Scene.svelte';
  import { getOpenPanel } from '$lib/analytics';

  import poster1 from '$lib/assets/posters/1.png';
  import poster2 from '$lib/assets/posters/2.png';
  import poster3 from '$lib/assets/posters/3.png';
  import poster4 from '$lib/assets/posters/4.png';

  import { Canvas } from '@threlte/core';
  import * as THREE from 'three';

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
  <section
    class="hero-section section-container pointer-events-none relative z-20"
  >
    <Hero projects={data.projects || []} />
  </section>

  <div class="scene-container">
    <Canvas dpr={1} toneMapping={THREE.NoToneMapping}>
      <Scene
        isShifted={uiState.isProjectView}
        onposterclick={i => (selectedPoster = i)}
      />
    </Canvas>
  </div>
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
  }

  .scene-container {
    height: calc(var(--page-stage-height, 100vh) * var(--page-stage-scale, 1));
    inset: 0;
    position: absolute;
    transform: scale(calc(1 / var(--page-stage-scale, 1)));
    transform-origin: top left;
    width: calc(var(--page-stage-width, 100vw) * var(--page-stage-scale, 1));
  }
</style>
