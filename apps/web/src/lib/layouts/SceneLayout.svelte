<script lang="ts">
  import { Canvas } from '@threlte/core';
  import * as THREE from 'three';
  import Scene from '$lib/components/Poster/Scene.svelte';
  import { uiState } from '$lib/state/ui.svelte';

  let {
    isShifted,
    onposterclick,
  }: {
    isShifted: boolean;
    onposterclick: (i: number) => void;
  } = $props();
</script>

<div
  class="scene-container"
  class:scene-container--hidden={uiState.layoutMode === 'smoke'}
>
  <Canvas
    dpr={typeof window !== 'undefined'
      ? Math.min(window.devicePixelRatio, 2)
      : 1}
    toneMapping={THREE.NoToneMapping}
  >
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

  .scene-container--hidden {
    display: none;
  }
</style>
