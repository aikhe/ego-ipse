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
  let themeDisplayText = $state('LIGHT');
  let headerEl = $state<HTMLElement>();
  let glitchInterval: ReturnType<typeof setInterval> | null = null;

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

<header class="header section-container font--mono-label" bind:this={headerEl}>
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
      <p class="header__coordinates">14.6514° N, 120.9902° E</p>
      <p class="header__location header-anim">
        {#each 'CALOOCAN, PH'.split('') as char, i (i)}
          <span class="char-mask"><span class="char">{char}</span></span>
        {/each}
      </p>
    </div>
  </div>

  <button
    class="header__theme-toggle ui-button--ghost font--mono-label z-99"
    onclick={() => { toggleTheme(); getOpenPanel()?.track('theme_toggle', { theme }); }}
  >
    MODE: {themeDisplayText}
  </button>

  <button
    class="header__contact ui-button ui-button--corners z-99"
    onclick={() => getOpenPanel()?.track('contact_click')}
  >CONTACT</button
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
    gap: 1.2rem;
    grid-column: 2 / span 2;
    position: relative;
  }

  .header__time-group p {
    margin: 0;
  }

  .header__time-group-extra {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    left: 0;
    position: absolute;
    top: calc(100% + 0.4rem);
    white-space: nowrap;
  }

  .header__time {
    color: var(--color-text);
  }

  .header__theme-toggle {
    grid-column: 10;
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
    backface-visibility: hidden;
    display: inline-block;
    transform: translate3d(0, 0, 0);
    vertical-align: top;
    will-change: transform;
  }

  .header__time,
  .header__timezone,
  .header__location,
  .header__coordinates {
    display: flex;
    white-space: pre;
  }

  /* preserve spaces */
  .char:empty::after {
    content: '\00a0';
  }
</style>
