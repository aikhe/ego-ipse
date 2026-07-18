<script lang="ts">
  import { onMount } from 'svelte';
  import { Canvas } from '@threlte/core';
  import GemSmokeBg from '$lib/shaders/gem-smoke/GemSmokeBg.svelte';
  import RenderPauser from '$lib/components/Shaders/RenderPauser.svelte';
  import { uiState } from '$lib/state/ui.svelte';
  import { createShaderColors } from '$lib/components/Shaders/shaderColors.svelte';
  import { useShaderAnimations } from '$lib/components/Shaders/useShaderAnimations.svelte';

  let {
    theme,
    glowEasing = 'power3.out',
    outerDistEaseOut = 'cubic-bezier(1, 0.002, 0.636, 0.996)',
  }: {
    theme: string;
    glowEasing?: string;
    outerDistEaseOut?: string;
  } = $props();

  const colors = $derived(createShaderColors(theme));

  const {
    glowTarget,
    innerGlowTarget,
    innerDistortionTarget,
    outerDistortionTarget,
    setAnimationConfig,
  } = useShaderAnimations();

  $effect(() => {
    setAnimationConfig({
      baseGlow: colors.baseGlow,
      glowEasing,
      outerDistEaseOut,
    });
  });

  let ready = $state(false);
  onMount(() => {
    ready = true;
  });
</script>

<div
  class="gem-shader-overlay"
  class:gem-shader-overlay--hidden={uiState.layoutMode !== 'shader'}
  class:gem-shader-overlay--initial={!ready}
  class:gem-shader-overlay--right={uiState.isShaderShifted}
>
  <Canvas
    dpr={typeof window !== 'undefined'
      ? Math.min(window.devicePixelRatio, 1.5)
      : 1}
  >
    <RenderPauser active={uiState.layoutMode === 'shader'} />
    <GemSmokeBg
      scale={0.12}
      speed={0.8}
      colors={colors.shaderColors}
      colorBack={[1, 1, 1, 0]}
      colorInner={colors.shaderColorInner}
      outerGlow={glowTarget.value}
      innerGlow={innerGlowTarget.value}
      innerDistortion={innerDistortionTarget.value}
      outerDistortion={outerDistortionTarget.value}
      running={uiState.layoutMode === 'shader'}
      offsetX={uiState.isShaderShifted ? 0.245 : 0}
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

  .gem-shader-overlay--right {
    clip-path: inset(0 0 0 50%);
  }

  .gem-shader-overlay--initial {
    pointer-events: none;
    visibility: hidden;
  }

  .gem-shader-overlay--hidden {
    display: none;
  }
</style>
