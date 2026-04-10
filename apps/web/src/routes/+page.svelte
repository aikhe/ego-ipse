<script lang="ts">
  import Hero from '$lib/layouts/Hero.svelte';
  import PosterOverlay from '$lib/components/Poster/PosterOverlay.svelte';
  import Scene from '$lib/components/Poster/Scene.svelte';

  import poster1 from '$lib/assets/posters/1.png';
  import poster2 from '$lib/assets/posters/2.png';
  import poster3 from '$lib/assets/posters/3.png';
  import poster4 from '$lib/assets/posters/4.png';

  import { Canvas } from '@threlte/core';
  import * as THREE from 'three';

  import type { Project } from '$lib/types/project';

  let selectedPoster = $state<number | null>(null);
  let selectedProject = $state<Project | null>(null);
</script>

<section class="section-container pointer-events-none relative z-20">
  <Hero bind:selectedProject />
</section>

<div class="scene-container fixed inset-0 z-1">
  <Canvas dpr={1} toneMapping={THREE.NoToneMapping}>
    <Scene 
      isShifted={!!selectedProject} 
      onposterclick={i => (selectedPoster = i)} 
    />
  </Canvas>
</div>

{#if selectedPoster !== null}
  <PosterOverlay
    bind:selected={selectedPoster}
    images={[poster1, poster2, poster3, poster4]}
  />
{/if}

<style>
  section {
    align-items: end;
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(12, 1fr);
    height: calc(100vh - 4.8rem);
    padding-bottom: 2rem;
  }
</style>
