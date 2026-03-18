<script lang="ts">
  import Hero from '$lib/layouts/Hero.svelte';
  import Info from '$lib/layouts/Info.svelte';
  import PosterOverlay from '$lib/components/PosterOverlay.svelte';

  import poster1 from '$lib/assets/posters/1.png'
  import poster2 from '$lib/assets/posters/2.png'
  import poster3 from '$lib/assets/posters/3.png'
  import poster4 from '$lib/assets/posters/4.png'

  import { Canvas } from '@threlte/core'
  import Scene from './Scene.svelte'
  import * as THREE from 'three'

  let selectedPoster = $state<number | null>(null);
</script>

<section class="section-container relative z-20 pointer-events-none">
  <Hero />
  <Info />
</section>

<div class="fixed inset-0 z-1">
  <Canvas 
    dpr={1}
    toneMapping={THREE.NoToneMapping}
  >
    <Scene onposterclick={(i) => selectedPoster = i}/>
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
    height: calc(100vh - 4.8rem);
  
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1.2rem;
    align-items: end;
    padding-bottom: 2rem;
  }
</style>
