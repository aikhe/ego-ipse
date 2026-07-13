<script lang="ts">
  import { onMount } from 'svelte';
  import { Canvas } from '@threlte/core';
  import * as THREE from 'three';
  import Scene from '$lib/components/Poster/Scene.svelte';
  import { uiState } from '$lib/state/ui.svelte';
  import RenderPauser from '$lib/components/Shaders/RenderPauser.svelte';

  let {
    isShifted,
    onposterclick,
  }: {
    isShifted: boolean;
    onposterclick: (i: number) => void;
  } = $props();

  let ready = $state(false);
  onMount(() => {
    ready = true;
  });
</script>

<div
  class="scene-container"
  class:scene-container--hidden={ready && uiState.layoutMode === 'shader'}
  class:scene-container--initial={!ready}
>
  <Canvas
    dpr={typeof window !== 'undefined'
      ? Math.min(window.devicePixelRatio, 2)
      : 1}
    toneMapping={THREE.NoToneMapping}
  >
    <RenderPauser active={uiState.layoutMode === 'layered'} />
    <Scene {isShifted} {onposterclick} />
  </Canvas>
</div>

<style>
  .scene-container {
    height: calc(var(--page-stage-height, 100vh) * var(--page-stage-scale, 1));
    inset: 0;
    position: absolute;
    transform: scale(calc(1 / var(--page-stage-scale, 1)));
    transform-origin: top left;
    width: calc(var(--page-stage-width, 100vw) * var(--page-stage-scale, 1));
  }

  .scene-container--initial {
    pointer-events: none;
    visibility: hidden;
  }

  .scene-container--hidden {
    display: none;
  }
</style>
