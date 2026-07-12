<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Canvas } from '@threlte/core';
  import GemSmokeBg from '$lib/shaders/gem-smoke/GemSmokeBg.svelte';
  import { getShaderColorFromString } from '$lib/shaders/gem-smoke/gem-smoke.ts';
  import { uiState } from '$lib/state/ui.svelte';
  import RenderPauser from './RenderPauser.svelte';
  import gsap from 'gsap';

  let {
    theme,
    glowEasing = 'power3.out',
  }: { theme: string; glowEasing?: string } = $props();

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
  let baseGlow = $derived(theme === 'dark' ? 0.4 : 0.26);
  let glowTarget = $state({ value: baseGlow });
  let innerGlowTarget = $state({ value: 1 });
  let innerDistortionTarget = $state({ value: 1 });
  let outerDistortionTarget = $state({ value: 1 });

  $effect(() => {
    if (uiState.layoutMode !== 'shader') return;
    const outerTarget = uiState.isProjectView ? 0 : baseGlow;
    gsap.killTweensOf(glowTarget);
    gsap.to(glowTarget, {
      value: outerTarget,
      duration: 3.2,
      delay: 0.25,
      ease: glowEasing,
      overwrite: 'auto',
    });
  });
  $effect(() => {
    if (uiState.layoutMode !== 'shader') return;
    const innerTarget = uiState.isProjectView ? 0 : 1;
    gsap.killTweensOf(innerGlowTarget);
    gsap.to(innerGlowTarget, {
      value: innerTarget,
      duration: 1.6,
      ease: glowEasing,
      overwrite: 'auto',
    });
  });

  $effect(() => {
    if (uiState.layoutMode !== 'shader') return;
    const target = uiState.isProjectView ? 0 : 1;
    gsap.killTweensOf(innerDistortionTarget);
    gsap.to(innerDistortionTarget, {
      value: target,
      duration: 5,
      ease: glowEasing,
      overwrite: 'auto',
    });
  });

  $effect(() => {
    if (uiState.layoutMode !== 'shader') return;
    const target = uiState.isProjectView ? 0 : 1;
    gsap.killTweensOf(outerDistortionTarget);
    gsap.to(outerDistortionTarget, {
      value: target,
      duration: 3.2,
      delay: 0.25,
      ease: glowEasing,
      overwrite: 'auto',
    });
  });

  onDestroy(() => {
    gsap.killTweensOf(glowTarget);
    gsap.killTweensOf(innerGlowTarget);
    gsap.killTweensOf(innerDistortionTarget);
    gsap.killTweensOf(outerDistortionTarget);
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
>
  <Canvas
    dpr={typeof window !== 'undefined'
      ? Math.min(window.devicePixelRatio, 1.5)
      : 1}
  >
    <RenderPauser active={uiState.layoutMode === 'shader'} />
    <GemSmokeBg
      scale={0.14}
      speed={0.8}
      colors={shaderColors}
      colorBack={[1, 1, 1, 0]}
      colorInner={shaderColorInner}
      outerGlow={glowTarget.value}
      innerGlow={innerGlowTarget.value}
      innerDistortion={innerDistortionTarget.value}
      outerDistortion={outerDistortionTarget.value}
      running={uiState.layoutMode === 'shader'}
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
