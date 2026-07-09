<script lang="ts">
  import { onMount } from 'svelte';
  import { Canvas } from '@threlte/core';
  import GemSmokeBg from '$lib/shaders/gem-smoke/GemSmokeBg.svelte';
  import { getShaderColorFromString } from '$lib/shaders/gem-smoke/gem-smoke.js';
  import { uiState } from '$lib/state/ui.svelte';

  let { theme }: { theme: string } = $props();

  const lightColors = ['#454545', '#141414', '#2e2e2e', '#000000'].map(
    getShaderColorFromString
  );
  const darkColors = ['#9e9e9e', '#c2c2c2', '#e8e8e8', '#ffffff'].map(
    getShaderColorFromString
  );
  const darkColorInner = getShaderColorFromString('#0a0a0a');
  const lightColorInner = getShaderColorFromString('#fafafa');

  let shaderColors = $derived(theme === 'dark' ? darkColors : lightColors);
  let shaderColorInner = $derived(
    theme === 'dark' ? darkColorInner : lightColorInner
  );
  let shaderOuterGlow = $derived(theme === 'dark' ? 0.4 : 0.26);

  let ready = $state(false);
  onMount(() => {
    ready = true;
  });
</script>

<div
  class="gem-shader-overlay"
  class:gem-shader-overlay--hidden={ready && uiState.layoutMode !== 'shader'}
  class:gem-shader-overlay--initial={!ready}
>
  <Canvas>
    <GemSmokeBg
      scale={0.14}
      speed={0.8}
      colors={shaderColors}
      colorBack={[1, 1, 1, 0]}
      colorInner={shaderColorInner}
      outerGlow={shaderOuterGlow}
    />
  </Canvas>
</div>

<style>
  .gem-shader-overlay {
    height: calc(var(--page-stage-height, 100vh) * var(--page-stage-scale, 1));
    inset: 0;
    pointer-events: none;
    position: absolute;
    transform: scale(calc(1 / var(--page-stage-scale, 1)));
    transform-origin: top left;
    width: calc(var(--page-stage-width, 100vw) * var(--page-stage-scale, 1));
    z-index: -50;
  }

  .gem-shader-overlay--initial {
    pointer-events: none;
    visibility: hidden;
  }

  .gem-shader-overlay--hidden {
    display: none;
  }
</style>
