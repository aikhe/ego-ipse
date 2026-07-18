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
  import { uiState, toggleTheme } from '$lib/state/ui.svelte';
  import Header from '$lib/components/Header/Header.svelte';
  import GridBackground from '$lib/layouts/GridBackground.svelte';
  import GridOverlay from '$lib/layouts/GridOverlay.svelte';
  import StripeGutter from '$lib/layouts/StripeGutter.svelte';

  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
  let stageScale = $state(1);
  let stageHeight = $state<number | null>(null);
  let stageOffsetX = $state(0);
  let isMobile = $state(false);

  $effect(() => {
    document.documentElement.setAttribute('data-theme', uiState.theme);
  });

  function toggleLayout() {
    uiState.layoutMode =
      uiState.layoutMode === 'layered' ? 'shader' : 'layered';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.shiftKey && event.key === 'G') {
      uiState.gridOverlay = !uiState.gridOverlay;
    }
    if (event.shiftKey && event.key === 'T') {
      toggleTheme();
    }
    if (event.shiftKey && (event.key === 'L' || event.key === 'F')) {
      toggleLayout();
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

    const mql = window.matchMedia('(max-width: 1024px)');
    isMobile = mql.matches;
    const onMobileChange = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mql.addEventListener('change', onMobileChange);

    return () => {
      window.removeEventListener('resize', updateStageScale);
      viewport?.removeEventListener('resize', updateStageScale);
      mql.removeEventListener('change', onMobileChange);
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
    <Header theme={uiState.theme} {toggleTheme} />

    <main class:main--shader={uiState.layoutMode === 'shader'}>
      {@render children()}
    </main>

    <GridBackground />

    <GridOverlay />

    <div class="stripe-gutter-inner stripe-gutter-inner--left"></div>
    <div class="stripe-gutter-inner stripe-gutter-inner--right"></div>
  </div>

  <StripeGutter />

  {#if isMobile}
    <div class="mobile-blocker">
      <span class="font--mono-label">@aikheandrei</span>
    </div>
  {/if}
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
    z-index: 2;
  }

  .main--shader {
    padding-top: 4.8rem;
  }

  .stripe-gutter-inner {
    background-color: var(--color-overlay-10);
    bottom: 0;
    mask-image: url('$lib/assets/stripe.svg');
    mask-repeat: repeat;
    mask-size: 7px 7px;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: calc((100% - var(--container-width)) / 2);
    z-index: -999;
  }

  .stripe-gutter-inner--left {
    left: 0;
  }

  .stripe-gutter-inner--right {
    right: 0;
  }

  .mobile-blocker {
    align-items: center;
    background: var(--color-bg);
    color: var(--color-text);
    display: flex;
    height: 100dvh;
    inset: 0;
    justify-content: center;
    position: fixed;
    width: 100%;
    z-index: 9999;
  }
</style>
