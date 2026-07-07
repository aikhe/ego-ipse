<script lang="ts">
  import { onMount } from 'svelte';
  import '../styles/main.css';
  import favicon from '$lib/assets/favicon.ico';
  import { getOpenPanel } from '$lib/analytics';
  import {
    calculateStageMetrics,
    STAGE_DESIGN_WIDTH,
    STAGE_MIN_SCALE,
  } from '$lib/utils/stageScale';
  import { uiState } from '$lib/state/ui.svelte';
  import Header from '$lib/components/Header/Header.svelte';

  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
  let theme = $state('light');
  let stageScale = $state(1);
  let stageHeight = $state<number | null>(null);
  let stageOffsetX = $state(0);

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
  }

  $effect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.shiftKey && event.key === 'G') {
      uiState.gridOverlay = !uiState.gridOverlay;
    }
    if (event.shiftKey && event.key === 'T') {
      toggleTheme();
    }
  }

  onMount(() => {
    getOpenPanel();

    const viewport = window.visualViewport;

    const updateStageScale = () => {
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const metrics = calculateStageMetrics(
        viewportWidth,
        viewportHeight,
        STAGE_DESIGN_WIDTH,
        STAGE_MIN_SCALE
      );

      stageScale = metrics.scale;
      stageHeight = metrics.height;
      stageOffsetX = metrics.offsetX;
      document.documentElement.style.setProperty(
        '--page-stage-scale',
        `${metrics.scale}`
      );
      document.documentElement.style.setProperty(
        '--page-stage-width',
        `${metrics.width}px`
      );
      document.documentElement.style.setProperty(
        '--page-stage-height',
        `${metrics.height}px`
      );
      document.documentElement.style.setProperty(
        '--page-stage-offset-x',
        `${metrics.offsetX}px`
      );
    };

    updateStageScale();
    window.addEventListener('resize', updateStageScale);
    viewport?.addEventListener('resize', updateStageScale);

    return () => {
      window.removeEventListener('resize', updateStageScale);
      viewport?.removeEventListener('resize', updateStageScale);
      document.documentElement.style.setProperty('--page-stage-scale', '1');
      document.documentElement.style.setProperty(
        '--page-stage-width',
        `${STAGE_DESIGN_WIDTH}px`
      );
      document.documentElement.style.setProperty(
        '--page-stage-height',
        '100vh'
      );
      document.documentElement.style.setProperty(
        '--page-stage-offset-x',
        '0px'
      );
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="app-viewport">
  <div
    class="app-stage"
    style={`--page-stage-scale: ${stageScale}; ${stageHeight === null ? '' : `--page-stage-height: ${stageHeight}px;`} --page-stage-offset-x: ${stageOffsetX}px; transform: translateX(${stageOffsetX}px) scale(${stageScale}); transform-origin: top left;`}
  >
    <Header {theme} {toggleTheme} />

    <main>
      {@render children()}
    </main>

    <div class="grid-background section-container">
      {#each Array.from(Array(12).keys()) as i (i)}
        <div class="bg-grid-column"></div>
      {/each}
    </div>

    <div class="stripe-gutter stripe-gutter--left"></div>
    <div class="stripe-gutter stripe-gutter--right"></div>
  </div>

  {#if uiState.gridOverlay}
    <div class="grid-overlay section-container">
      {#each Array.from(Array(12).keys()) as i (i)}
        <div class="grid-column"></div>
      {/each}
    </div>
  {/if}

  <div class="stripe-gutter-outer stripe-gutter-outer--left"></div>
  <div class="stripe-gutter-outer stripe-gutter-outer--right"></div>
</div>

<style>
  .app-viewport {
    height: 100vh;
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  .app-stage {
    height: var(--page-stage-height, 100vh);
    position: relative;
    width: var(--page-stage-width, var(--container-max-width));
  }

  .grid-overlay {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(12, 1fr);
    inset: 0;
    margin-inline: auto;
    pointer-events: none;
    position: absolute;
    z-index: 9999;
  }

  .grid-column {
    background-color: var(--color-overlay-05);
  }

  .grid-background {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(12, 1fr);
    inset: 0;
    margin-inline: auto;
    pointer-events: none;
    position: absolute;
    z-index: -99;
  }

  .bg-grid-column:is(
    :nth-child(1),
    :nth-child(2),
    :nth-child(4),
    :nth-child(7),
    :nth-child(10)
  ) {
    border-left: 1px dashed var(--color-overlay-15);
  }

  .bg-grid-column:nth-child(9) {
    border-right: 1px dashed var(--color-overlay-15);
  }

  .bg-grid-column:last-child {
    border-right: 1px dashed var(--color-overlay-15);
  }

  .stripe-gutter {
    background-color: var(--color-overlay-10);
    bottom: 0;
    mask-image: url('$lib/assets/stripe.svg');
    mask-repeat: repeat;
    mask-size: 7px 7px;
    pointer-events: none;
    position: absolute;
    top: 0;

    /* match section-container side gutters inside 1920 design stage */
    width: calc((100% - var(--container-width)) / 2);
    z-index: -999;
  }

  .stripe-gutter--left {
    left: 0;
  }

  .stripe-gutter--right {
    right: 0;
  }

  .stripe-gutter-outer {
    background-color: var(--color-overlay-10);
    bottom: 0;
    mask-image: url('$lib/assets/stripe.svg');
    mask-repeat: repeat;
    mask-size: 7px 7px;
    pointer-events: none;
    position: fixed;
    top: 0;
    width: max(
      0px,
      calc(
        (100vw - (var(--container-max-width) * var(--page-stage-scale, 1))) / 2
      )
    );
    z-index: -1000;
  }

  .stripe-gutter-outer--left {
    left: 0;
  }

  .stripe-gutter-outer--right {
    right: 0;
  }
</style>
