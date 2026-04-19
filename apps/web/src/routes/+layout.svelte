<script lang="ts">
  import { onMount } from 'svelte';
  import '../styles/main.css';
  import favicon from '$lib/assets/favicon.ico';
  import logo from '$lib/assets/logo.svg';
  import { startGlitch } from '$lib/utils/glitch';
  import {
    calculateStageMetrics,
    STAGE_DESIGN_WIDTH,
    STAGE_MIN_SCALE,
  } from '$lib/utils/stageScale';

  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
  let theme = $state('dark');
  let showGrid = $state(false);
  let time = $state('--:--:--');
  let themeDisplayText = $state('LIGHT');
  let stageScale = $state(1);
  let stageHeight = $state<number | null>(null);
  let stageOffsetX = $state(0);
  let isStageScaled = $state(false);
  let glitchInterval: ReturnType<typeof setInterval> | null = null;

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
  }

  $effect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (glitchInterval) clearInterval(glitchInterval);
    glitchInterval = startGlitch({
      text: theme.toUpperCase(),
      revealSpeed: 3,
      tailFrames: 15,
      onUpdate: t => (themeDisplayText = t),
    });
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.shiftKey && event.key === 'G') {
      showGrid = !showGrid;
    }
    if (event.shiftKey && event.key === 'T') {
      toggleTheme();
    }
  }

  $effect(() => {
    const updateTime = () => {
      time = new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  });

  onMount(() => {
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
      isStageScaled = metrics.isScaled;
      document.documentElement.style.setProperty('--page-stage-scale', `${metrics.scale}`);
      document.documentElement.style.setProperty('--page-stage-width', `${metrics.width}px`);
      document.documentElement.style.setProperty('--page-stage-height', `${metrics.height}px`);
      document.documentElement.style.setProperty('--page-stage-offset-x', `${metrics.offsetX}px`);
    };

    updateStageScale();
    window.addEventListener('resize', updateStageScale);
    viewport?.addEventListener('resize', updateStageScale);

    return () => {
      window.removeEventListener('resize', updateStageScale);
      viewport?.removeEventListener('resize', updateStageScale);
      document.documentElement.style.setProperty('--page-stage-scale', '1');
      document.documentElement.style.setProperty('--page-stage-width', `${STAGE_DESIGN_WIDTH}px`);
      document.documentElement.style.setProperty('--page-stage-height', '100vh');
      document.documentElement.style.setProperty('--page-stage-offset-x', '0px');
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="app-viewport">
  <div
    class="app-stage"
    class:app-stage--scaled={isStageScaled}
    style={`--page-stage-scale: ${stageScale}; ${stageHeight === null ? '' : `--page-stage-height: ${stageHeight}px;`} --page-stage-offset-x: ${stageOffsetX}px;`}
  >
    <header class="section-container font--mono-label">
      <img class="logo size-8" src={logo} alt="Aikhe Logo Mark" />

      <p class="time">{time}</p>
      <p class="time-zone">GMT+8</p>
      <p class="location">CALOOCAN, PH</p>
      <p class="coordinates">14.6514° N, 120.9902° E</p>

      <button
        class="theme-toggle ui-button ui-button--ghost z-99"
        onclick={toggleTheme}
      >
        MODE: {themeDisplayText}
      </button>

      <button class="contact-btn ui-button ui-button--corners z-99">CONTACT</button>
    </header>

    <main>
      {@render children()}
    </main>

    {#if showGrid}
      <div class="grid-overlay section-container">
        {#each Array.from(Array(12).keys()) as i (i)}
          <div class="grid-column"></div>
        {/each}
      </div>
    {/if}

    <div class="grid-background section-container">
      {#each Array.from(Array(12).keys()) as i (i)}
        <div class="bg-grid-column"></div>
      {/each}
    </div>

    <div class="stripe-gutter stripe-gutter--left"></div>
    <div class="stripe-gutter stripe-gutter--right"></div>
  </div>

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
    margin-inline: auto;
    position: relative;
    width: var(--page-stage-width, var(--container-max-width));
  }

  .app-stage--scaled {
    transform: translateX(var(--page-stage-offset-x, 0)) scale(var(--page-stage-scale));
    transform-origin: top left;
  }

  header {
    align-items: center;
    color: var(--color-text-muted);
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(12, 1fr);
    height: 4.8rem;
    white-space: nowrap;
    z-index: 2;
  }

  header > * {
    grid-row: 1;
  }

  .logo {
    filter: brightness(0) invert(var(--logo-invert, 0));
    grid-column: 1;
  }

  .time {
    grid-column: 2 / span 1;
  }

  .time-zone {
    grid-column: 3;
  }

  .location {
    grid-column: 4 / span 2;
  }

  .coordinates {
    grid-column: 7 / span 2;
  }

  .theme-toggle {
    grid-column: 9;
  }

  .contact-btn {
    grid-column: 12 / span 1;
    justify-self: flex-end;
  }

  .grid-overlay {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(12, 1fr);
    inset: 0;
    margin-inline: auto;
    pointer-events: none;
    position: absolute;
    z-index: 1;
  }

  .grid-column {
    background-color: var(--color-overlay-02);
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
      calc((100vw - (var(--container-max-width) * var(--page-stage-scale, 1))) / 2)
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
