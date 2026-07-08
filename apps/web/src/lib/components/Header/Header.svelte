<script lang="ts">
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { startGlitch } from '$lib/utils/glitch';
  import { uiState } from '$lib/state/ui.svelte';
  import { getOpenPanel } from '$lib/analytics';
  import logo from '$lib/assets/logo.svg';

  interface Props {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
  }

  let { theme, toggleTheme }: Props = $props();

  let time = $state('--:--:--');
  let uptime = $state('0m 00s');
  let cursorX = $state(0);
  let cursorY = $state(0);
  let cursorSpeed = $state(0);
  let themeDisplayText = $state('LIGHT');
  let gridDisplayText = $state('HIDDEN');
  let layoutDisplayText = $state('LAYERED');
  let headerEl = $state<HTMLElement>();
  let glitchInterval: ReturnType<typeof setInterval> | null = null;
  let gridGlitchInterval: ReturnType<typeof setInterval> | null = null;
  let layoutGlitchInterval: ReturnType<typeof setInterval> | null = null;

  $effect(() => {
    if (glitchInterval) clearInterval(glitchInterval);
    glitchInterval = startGlitch({
      text: theme.toUpperCase(),
      revealSpeed: 3,
      tailFrames: 15,
      onUpdate: t => (themeDisplayText = t),
    });
  });

  $effect(() => {
    if (gridGlitchInterval) clearInterval(gridGlitchInterval);
    gridGlitchInterval = startGlitch({
      text: uiState.gridOverlay ? 'OVERLAY' : 'HIDDEN',
      revealSpeed: 3,
      tailFrames: 15,
      onUpdate: t => (gridDisplayText = t),
    });
  });

  $effect(() => {
    if (layoutGlitchInterval) clearInterval(layoutGlitchInterval);
    layoutGlitchInterval = startGlitch({
      text: uiState.layoutMode.toUpperCase(),
      revealSpeed: 3,
      tailFrames: 15,
      onUpdate: t => (layoutDisplayText = t),
    });
  });

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
    const interval = setInterval(() => {
      if (!uiState.isProjectView) {
        updateTime();
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  $effect(() => {
    const start = Date.now();

    const updateUptime = () => {
      const elapsed = Date.now() - start;
      const totalSec = Math.floor(elapsed / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      const ms = elapsed % 1000;
      uptime = `${m}m ${String(s).padStart(2, '0')}s ${String(ms).padStart(3, '0')}`;
    };

    updateUptime();
    const interval = setInterval(updateUptime, 50);
    return () => clearInterval(interval);
  });

  $effect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;

    const onMouseMove = (e: MouseEvent) => {
      cursorX = e.clientX;
      cursorY = e.clientY;

      if (lastTime) {
        const dt = e.timeStamp - lastTime;
        if (dt > 0) {
          const dist = Math.sqrt(
            (e.clientX - lastX) ** 2 + (e.clientY - lastY) ** 2
          );
          cursorSpeed = Math.round(dist / dt);
        }
      }

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = e.timeStamp;
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  });
  onMount(() => {
    if (headerEl) {
      const chars = headerEl.querySelectorAll('.header-anim .char');
      gsap.set(chars, { xPercent: 0, force3D: false, clearProps: 'transform' });
    }
  });

  $effect(() => {
    if (!headerEl) return;
    const chars = headerEl.querySelectorAll('.header-anim .char');
    if (uiState.isProjectView) {
      gsap.fromTo(
        chars,
        { xPercent: 0 },
        {
          xPercent: -200,
          duration: 0.6,
          ease: 'expo.inOut',
          force3D: false,
          stagger: { amount: 0.2, from: 'end' },
        }
      );
    } else {
      gsap.fromTo(
        chars,
        { xPercent: -200 },
        {
          xPercent: 0,
          duration: 0.6,
          ease: 'expo.inOut',
          force3D: false,
          clearProps: 'transform',
          stagger: { amount: 0.2, from: 'start' },
        }
      );
    }
  });
</script>

<header
  class="header section-container font--mono-label"
  class:smoke-active={uiState.layoutMode === 'smoke'}
  bind:this={headerEl}
>
  <img class="header__logo size-5" src={logo} alt="Aikhe Logo Mark" />

  <div class="header__time-group header-anim">
    <p class="header__timezone">
      {#each 'GMT+8'.split('') as char, i (i)}
        <span class="char-mask"><span class="char">{char}</span></span>
      {/each}
    </p>
    <p class="header__time">
      {#each time.split('') as char, i (i)}
        <span class="char-mask"><span class="char">{char}</span></span>
      {/each}
    </p>
    <div class="header__time-group-extra">
      <p class="header__coordinates header-anim">
        {#each '14.6514° N, 120.9902° E'.split('') as char, i (i)}
          <span class="char-mask"><span class="char">{char}</span></span>
        {/each}
      </p>
      <p class="header__location header-anim">
        {#each 'CALOOCAN, PH'.split('') as char, i (i)}
          <span class="char-mask"><span class="char">{char}</span></span>
        {/each}
      </p>
      <div class="header__meta-group">
        <p class="header__location header-anim">
          {#each 'AVAIL REMOTE'.split('') as char, i (i)}
            <span class="char-mask"><span class="char">{char}</span></span>
          {/each}
        </p>
        <p class="header__location header-anim">
          {#each 'RES: <24H'.split('') as char, i (i)}
            <span class="char-mask"><span class="char">{char}</span></span>
          {/each}
        </p>
      </div>
      <div class="header__meta-group">
        <p class="header__location header-anim">
          {#each 'REV: 06.07'.split('') as char, i (i)}
            <span class="char-mask"><span class="char">{char}</span></span>
          {/each}
        </p>
      </div>
    </div>
  </div>

  <div class="header__cursor-group">
    <p class="header__cursor-coords">
      X:{cursorX} Y:{cursorY} Z:000 {cursorSpeed}px/ms
    </p>
    <div class="header__cursor-group-extra">
      <p class="header__cursor-timer">{uptime}</p>
    </div>
  </div>

  <div class="header__theme-group">
    <button
      class="header__theme-toggle ui-button--ghost font--mono-label z-99"
      onclick={() => {
        toggleTheme();
        getOpenPanel()?.track('theme_toggle', { theme });
      }}
    >
      STATE: <span class="header__theme-value">{themeDisplayText}</span>
    </button>
    <div class="header__theme-group-extra">
      <button
        class="header__layout-name header__layout-toggle"
        onclick={() => {
          uiState.layoutMode =
            uiState.layoutMode === 'layered' ? 'smoke' : 'layered';
          getOpenPanel()?.track('layout_toggle', {
            layout: uiState.layoutMode,
          });
        }}
      >
        LAYOUT <span class="header__theme-value">[{layoutDisplayText}]</span>
      </button>
      <button
        class="header__layout-name header__grid-toggle"
        onclick={() => {
          uiState.gridOverlay = !uiState.gridOverlay;
          getOpenPanel()?.track('grid_overlay_toggle', {
            visible: uiState.gridOverlay,
          });
        }}
      >
        GRID: <span class="header__theme-value">{gridDisplayText}</span>
      </button>
      <p class="header__layout-name">1920 × 1080</p>
      <p class="header__layout-name">DPR: 2.0</p>
      <div class="header__meta-group">
        <p class="header__layout-name">
          SFX: <span class="header__theme-value">[TYPE]</span>
        </p>
      </div>
    </div>
  </div>

  <button
    class="header__contact ui-button ui-button--corners z-99"
    onclick={() => getOpenPanel()?.track('contact_click')}>CONTACT</button
  >
</header>

<style>
  .header {
    align-items: center;
    color: var(--color-text-muted);
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(12, 1fr);
    height: 4.8rem;
    white-space: nowrap;
    z-index: 2;
  }

  .header > * {
    grid-row: 1;
  }

  .header__logo {
    filter: brightness(0) invert(var(--logo-invert, 0));
    grid-column: 1;
  }

  .header__time-group {
    display: flex;
    gap: 1rem;
    grid-column: 2 / span 2;
    position: relative;
  }

  .header__time-group p {
    margin: 0;
  }

  .header__cursor-group {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    grid-column: 6 / span 2;
    position: relative;
  }

  .header__cursor-coords {
    margin: 0;
  }

  .header__cursor-group-extra {
    left: 0;
    position: absolute;
    top: calc(100% + 0.3rem);
    white-space: nowrap;
  }

  .header__cursor-timer {
    margin: 0;
  }

  .header__time-group-extra {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    left: 0;
    position: absolute;
    top: calc(100% + 0.3rem);
    white-space: nowrap;
  }

  .header__meta-group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-top: 1.2rem;
  }

  .header__time {
    color: var(--color-text);
  }

  .header__theme-value {
    color: var(--color-text);
  }

  .header__theme-toggle:hover,
  .header__grid-toggle:hover {
    color: inherit;
  }

  .header__theme-group {
    grid-column: 11;
    position: relative;
  }

  .header__theme-group-extra {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    left: 0;
    position: absolute;
    top: calc(100% + 0.3rem);
    white-space: nowrap;
  }

  .header__grid-toggle {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    display: block;
    font: inherit;
    padding: 0;
    text-align: left;
    width: 100%;
  }

  .header__layout-toggle {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    display: block;
    font: inherit;
    padding: 0;
    text-align: left;
    width: 100%;
  }

  .header__contact {
    grid-column: 12 / span 1;
    justify-self: flex-end;
  }

  .char-mask {
    display: inline-block;
    overflow: hidden;
    vertical-align: top;
  }

  .char {
    display: inline-block;
    vertical-align: top;
  }

  .header__time,
  .header__timezone,
  .header__location,
  .header__coordinates {
    display: flex;
    white-space: pre;
  }

  .header__layout-name {
    margin: 0;
  }

  .header.smoke-active {
    left: 50%;
    position: fixed;
    top: 0;
    transform: translateX(-50%);
    z-index: 9999;
  }

  /* preserve spaces */
  .char:empty::after {
    content: '\00a0';
  }
</style>
