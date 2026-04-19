<script lang="ts">
  import { onMount } from 'svelte';
  import { T } from '@threlte/core';
  import { useTexture, interactivity } from '@threlte/extras';
  import * as THREE from 'three';
  import poster1 from '$lib/assets/posters/1.png';
  import poster2 from '$lib/assets/posters/2.png';
  import poster3 from '$lib/assets/posters/3.png';
  import poster4 from '$lib/assets/posters/4.png';
  import Poster from './Poster.svelte';
  import {
    calculateStageMetrics,
    STAGE_DESIGN_WIDTH,
    STAGE_MIN_SCALE,
  } from '$lib/utils/stageScale';

  interactivity();

  const posters = [poster1, poster2, poster3, poster4];

  const stackCenterX = 0;
  const stackCenterY = 0;
  const baseCameraZ = 7.5;
  const baseCameraX = 4.65;
  const baseCameraY = 4.8;
  const baseZoom = 94;
  const MIN_POSTER_SCALE = 0.6;
  const POSTER_SCALE_SENSITIVITY = 1.8;
  const POSTER_SCALE_START = 0.92;
  const MAX_STACK_DOWN_SHIFT = 0.8;
  const STACK_DOWN_SHIFT_SENSITIVITY = 0.34;
  const STACK_DOWN_SHIFT_START = 0.9;
  const MIN_STACK_SPACING_SCALE = 0.6;
  const STACK_SPACING_SENSITIVITY = 1.4;
  const MIN_STACK_STAGGER_SCALE = 0.2;
  const STACK_STAGGER_SENSITIVITY = 1;

  let cameraRef: THREE.OrthographicCamera | null = null;
  const cameraPosition: [number, number, number] = [
    baseCameraX,
    baseCameraY,
    baseCameraZ,
  ];
  const cameraZoom = baseZoom;

  const textures = useTexture(posters, {
    transform: t => {
      t.anisotropy = 16;
      t.generateMipmaps = true;
      t.colorSpace = 'srgb';
      return t;
    },
  });

  const width = 3;
  const height = (3690 / 2848) * width;

  let {
    isShifted = false,
    onposterclick,
  }: {
    isShifted?: boolean;
    onposterclick?: (index: number) => void;
  } = $props();

  let hovered = $state<number | null>(null);
  let posterScale = $state(1);
  let stackSpacingScale = $state(1);
  let stackStaggerScale = $state(1);
  let stackDownShift = $state(0);

  function getViewportWidth() {
    if (typeof window === 'undefined') return STAGE_DESIGN_WIDTH;

    const viewport = window.visualViewport;
    return viewport?.width ?? window.innerWidth;
  }

  function syncPosterScale() {
    const metrics = calculateStageMetrics(
      getViewportWidth(),
      window.innerHeight,
      STAGE_DESIGN_WIDTH,
      STAGE_MIN_SCALE
    );
    const normalized = (metrics.scale - STAGE_MIN_SCALE) / (1 - STAGE_MIN_SCALE);
    const posterRange = POSTER_SCALE_START - STAGE_MIN_SCALE;
    const posterNormalized =
      posterRange <= 0
        ? normalized
        : Math.min(1, Math.max(0, (metrics.scale - STAGE_MIN_SCALE) / posterRange));
    const downShiftRange = STACK_DOWN_SHIFT_START - STAGE_MIN_SCALE;
    const downShiftNormalized =
      downShiftRange <= 0
        ? normalized
        : Math.min(
            1,
            Math.max(0, (metrics.scale - STAGE_MIN_SCALE) / downShiftRange)
          );
    const downShiftProgress = 1 - downShiftNormalized;
    const spacingProgress = Math.pow(normalized, STACK_SPACING_SENSITIVITY);
    const staggerProgress = Math.pow(normalized, STACK_STAGGER_SENSITIVITY);

    posterScale =
      MIN_POSTER_SCALE +
      Math.pow(posterNormalized, POSTER_SCALE_SENSITIVITY) *
        (1 - MIN_POSTER_SCALE);
    stackSpacingScale =
      MIN_STACK_SPACING_SCALE +
      spacingProgress * (1 - MIN_STACK_SPACING_SCALE);
    stackStaggerScale =
      MIN_STACK_STAGGER_SCALE +
      staggerProgress * (1 - MIN_STACK_STAGGER_SCALE);
    stackDownShift =
      MAX_STACK_DOWN_SHIFT *
      Math.pow(downShiftProgress, STACK_DOWN_SHIFT_SENSITIVITY);
  }

  function syncCameraFraming() {
    syncPosterScale();
    if (!cameraRef) return;

    cameraRef.position.set(baseCameraX, baseCameraY, baseCameraZ);
    cameraRef.zoom = baseZoom;
    cameraRef.lookAt(stackCenterX, stackCenterY, 0);
    cameraRef.updateProjectionMatrix();
  }

  onMount(() => {
    const viewport = window.visualViewport;

    const onResize = () => {
      syncCameraFraming();
    };

    window.addEventListener('resize', onResize);
    viewport?.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      viewport?.removeEventListener('resize', onResize);
    };
  });
</script>

<T.OrthographicCamera
  makeDefault
  position={cameraPosition}
  zoom={cameraZoom}
  oncreate={ref => {
    cameraRef = ref;
    syncCameraFraming();
  }}
/>

{#if $textures}
  {#each $textures as texture, i (i)}
    <Poster
      index={i}
      totalLength={posters.length}
      {texture}
      {hovered}
      {isShifted}
      scale={posterScale}
      spacingScale={stackSpacingScale}
      staggerScale={stackStaggerScale}
      downShift={stackDownShift}
      {width}
      {height}
      onenter={() => (hovered = i)}
      onleave={() => (hovered = null)}
      onclick={() => onposterclick?.(i)}
    />
  {/each}
{/if}
