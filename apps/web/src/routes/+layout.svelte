<script lang="ts">
  import '../styles/main.css';
  import favicon from '$lib/assets/favicon.ico';
  import logo from '$lib/assets/logo.svg';
  import { startGlitch } from '$lib/utils/glitch';

  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
  let theme = $state('dark');
  let showGrid = $state(false);
  let time = $state('--:--:--');
  let themeDisplayText = $state('LIGHT');
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
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header class="section-container">
  <img class="logo size-8" src={logo} alt="Aikhe Logo Mark" />

  <p class="time">{time}</p>
  <p class="time-zone">GMT+8</p>
  <p class="location">CALOOCAN, PH</p>
  <p class="coordinates">14.6514° N, 120.9902° E</p>

  <button class="theme-toggle z-99" onclick={toggleTheme}>
    MODE: {themeDisplayText}
  </button>

  <button class="contact-btn z-99">CONTACT</button>
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

<style>
  header {
    align-items: center;
    color: var(--color-text-muted);
    display: grid;
    font-family: 'Geist Mono', monospace;
    font-size: 0.875rem;
    font-weight: 500;
    gap: 1.2rem;
    grid-template-columns: repeat(12, 1fr);
    height: 4.8rem;
    letter-spacing: 0.34%;
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
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    font-family: 'Geist Mono', monospace;
    font-size: 0.875rem;
    font-weight: 500;
    grid-column: 9;
    padding: 0;
    text-align: left;
  }

  .theme-toggle:hover {
    color: var(--color-text);
  }

  .contact-btn {
    align-items: center;
    background: var(--color-overlay-02);
    border: 1px solid var(--color-overlay-20);
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    grid-column: 12 / span 1;
    justify-content: center;
    justify-self: flex-end;
    padding: 6px 12px;
    position: relative;
  }

  .contact-btn::before {
    background:
      linear-gradient(to right, var(--color-text) 1px, transparent 1px) 0 0,
      linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 0 0,
      linear-gradient(to left, var(--color-text) 1px, transparent 1px) 100% 0,
      linear-gradient(to bottom, var(--color-text) 1px, transparent 1px) 100% 0,
      linear-gradient(to right, var(--color-text) 1px, transparent 1px) 0 100%,
      linear-gradient(to top, var(--color-text) 1px, transparent 1px) 0 100%,
      linear-gradient(to left, var(--color-text) 1px, transparent 1px) 100% 100%,
      linear-gradient(to top, var(--color-text) 1px, transparent 1px) 100% 100%;
    background-repeat: no-repeat;
    background-size: 8px 8px;
    content: '';
    inset: -1px;
    pointer-events: none;
    position: absolute;
  }

  .contact-btn:hover {
    background: var(--color-overlay-05);
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
    position: fixed;
    top: 0;

    /* match the gutter of .section-container */
    width: max(
      calc((100vw - var(--container-width)) / 2),
      calc((100vw - var(--container-max-width)) / 2)
    );
    z-index: -999;
  }

  .stripe-gutter--left {
    left: 0;
  }

  .stripe-gutter--right {
    right: 0;
  }
</style>
