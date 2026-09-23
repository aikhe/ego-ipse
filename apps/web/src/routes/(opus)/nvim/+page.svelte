<script lang="ts">
  import { cubicIn, cubicOut, quartOut } from 'svelte/easing';
  import type { TransitionConfig } from 'svelte/transition';
  import { uiState } from '$lib/state/ui.svelte';
  import OpusNav from '$lib/components/Opus/OpusNav.svelte';
  import OpusFooter from '$lib/components/Opus/OpusFooter.svelte';
  import {
    renderRichInline,
    splitDescriptionParagraphs,
  } from '$lib/sanity/opusValues';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  // Sanity-only: no fallback copy. Missing description renders nothing.
  const nvimParagraphs = $derived(
    data.sanityNvim?.description
      ? splitDescriptionParagraphs(data.sanityNvim.description)
      : []
  );
  const nvimPlugins = $derived(data.sanityNvim?.plugins ?? []);
  const nvimMiscs = $derived(data.sanityNvim?.miscs ?? []);
  const nvimConfigCard = $derived(data.sanityNvim?.configCard);
  const pluginStars = $derived(data.pluginStars ?? {});

  // live star count for the tooltip, formatted like `1,234`.
  // null means the count is unknown: the item renders without a tip.
  function starsTip(repo: string | undefined): string | null {
    if (!repo) return null;
    const stars = pluginStars[repo];
    if (typeof stars !== 'number') return null;
    return stars.toLocaleString('en-US');
  }

  let introEl = $state<HTMLDivElement | null>(null);
  let featuresEl = $state<HTMLDivElement | null>(null);
  let pluginsTitleEl = $state<HTMLElement | null>(null);
  let miscsTitleEl = $state<HTMLElement | null>(null);

  // same measured-index trick as the about page: 01 takes the intro
  // section's height and 02 takes the full features section's height
  // (+ the same 2rem top margin as the features section) so each index
  // sits level with its section instead of piling at the top.
  // 03 follows the same pattern for the plugins title, 04 for miscs.
  $effect(() => {
    if (!introEl) return;
    const sync = () => {
      const h = introEl!.getBoundingClientRect().height;
      const fh = featuresEl?.getBoundingClientRect().height;
      const ph = pluginsTitleEl?.getBoundingClientRect().height;
      const mh = miscsTitleEl?.getBoundingClientRect().height;
      const root = document.documentElement.style;
      root.setProperty('--nvim-intro-h', `${h}px`);
      if (fh !== undefined) root.setProperty('--nvim-features-h', `${fh}px`);
      if (ph !== undefined)
        root.setProperty('--nvim-plugins-title-h', `${ph}px`);
      if (mh !== undefined)
        root.setProperty('--nvim-miscs-title-h', `${mh}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(introEl);
    if (featuresEl) ro.observe(featuresEl);
    if (pluginsTitleEl) ro.observe(pluginsTitleEl);
    if (miscsTitleEl) ro.observe(miscsTitleEl);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  });

  // cursor-following hover tip copied from the stack page category
  // items, with the pill offset and hide/out settle of the root
  // activity heatmap: the pill follows the pointer and shows the
  // repo's live GitHub star count.
  let tip = $state<{
    x: number;
    y: number;
    below: boolean;
    dx: number;
    dy: number;
    text: string;
  } | null>(null);
  const swapParams = $derived({
    dx: tip?.dx ?? 0,
    dy: tip?.dy ?? 1,
  });
  let prevEl: HTMLElement | null = null;
  let lastX: number | null = null;
  let lastY: number | null = null;
  let tipEl = $state<HTMLDivElement | null>(null);
  let lastTipW: number | null = null;
  let widthAnim: Animation | null = null;

  // smooth width: content-driven auto width jumps skip css transitions,
  // so tween the measured width via waapi whenever the text changes
  $effect(() => {
    const text = tip?.text;
    if (!text) {
      lastTipW = null;
      return;
    }
    const el = tipEl;
    if (!el) return;
    // a previous tween may still hold the width: read the rendered width,
    // cancel it, then measure the new intrinsic width before tweening
    const from = el.getBoundingClientRect().width;
    const fresh = lastTipW === null;
    widthAnim?.cancel();
    const to = el.offsetWidth;
    lastTipW = to;
    if (fresh || Math.abs(from - to) < 1) return;
    widthAnim = el.animate([{ width: `${from}px` }, { width: `${to}px` }], {
      duration: 280,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    });
  });

  // page scroll leaves a fixed pill stale: drop it on scroll.
  $effect(() => {
    window.addEventListener('scroll', hideTip, { passive: true });
    return () => window.removeEventListener('scroll', hideTip);
  });

  function showTip(e: MouseEvent) {
    const cell = (e.target as HTMLElement).closest('[data-tip]');
    // crossing the gaps between items keeps the pill open (mirrors stack)
    if (!(cell instanceof HTMLElement)) return;
    const text = cell.dataset.tip ?? '';
    if (!text) return;
    const below = e.clientY < 80;
    // same item: follow the cursor without replaying the text animation
    if (cell === prevEl && tip) {
      tip = { ...tip, x: e.clientX, y: e.clientY, below };
      lastX = e.clientX;
      lastY = e.clientY;
      return;
    }
    // enter vector points from where the cursor came: moving right slides
    // text left-to-right, moving up slides it bottom-to-top, and so on
    let dx = 0;
    let dy = 1;
    if (lastX !== null && lastY !== null && prevEl !== null) {
      const mx = e.clientX - lastX;
      const my = e.clientY - lastY;
      if (Math.abs(mx) >= Math.abs(my) && mx !== 0) {
        dx = mx > 0 ? -1 : 1;
        dy = 0;
      } else if (my !== 0) {
        dx = 0;
        dy = my > 0 ? -1 : 1;
      }
    }
    prevEl = cell;
    lastX = e.clientX;
    lastY = e.clientY;
    tip = { x: e.clientX, y: e.clientY, below, dx, dy, text };
  }

  function hideTip() {
    tip = null;
    prevEl = null;
    lastX = null;
    lastY = null;
  }

  // subtle settle: faint scale with no overshoot in, quick fade out.
  // base transform is read live so centering is preserved mid-animation.
  function pop(
    node: HTMLElement,
    { duration = 170 }: { duration?: number } = {}
  ): TransitionConfig {
    const base = getComputedStyle(node).transform;
    return {
      duration,
      easing: cubicOut,
      css: (t: number) =>
        `transform: ${base} scale(${0.94 + 0.06 * t}); opacity: ${t};`,
    };
  }

  function popOut(
    node: HTMLElement,
    { duration = 120 }: { duration?: number } = {}
  ): TransitionConfig {
    const base = getComputedStyle(node).transform;
    return {
      duration,
      easing: cubicIn,
      css: (t: number) =>
        `transform: ${base} scale(${0.97 + 0.03 * t}); opacity: ${t};`,
    };
  }

  // text swap: new text glides in from the side the cursor came from,
  // sharpening from a soft blur with a long decelerating ease
  function textSwap(
    _node: HTMLElement,
    {
      dx = 0,
      dy = 1,
      duration = 280,
    }: { dx?: number; dy?: number; duration?: number } = {}
  ): TransitionConfig {
    return {
      duration,
      easing: quartOut,
      css: (t: number) =>
        `transform: translate(${dx * (1 - t) * 10}px, ${dy * (1 - t) * 10}px); filter: blur(${(1 - t) * 6}px); opacity: ${t};`,
    };
  }
</script>

<div class="opus-canvas">
  <div class="opus-grid">
    <div class="opus-col opus-col--1">
      <OpusNav active="nvim" />
    </div>
    <div class="opus-col opus-col--2" aria-hidden="true">
      <div class="opus-col__section opus-col__section--01">
        <span class="opus-col__index">01</span>
      </div>
      <div class="opus-col__section opus-col__section--02">
        <span class="opus-col__index">02</span>
      </div>
      <div class="opus-col__section opus-col__section--03">
        <span class="opus-col__index">03</span>
      </div>
      <div class="opus-col__section opus-col__section--04">
        <span class="opus-col__index">04</span>
      </div>
    </div>
    <div class="opus-col opus-col--3">
      <div
        class="opus-col__border opus-col__border--right"
        aria-hidden="true"
      ></div>
      <div class="opus-section opus-section--nvim" bind:this={introEl}>
        <h2 class="opus-nvim">Nvim</h2>
        {#each nvimParagraphs as para, k (k)}
          <p class="opus-nvim__desc">
            {@html renderRichInline(para)}
          </p>
        {/each}
      </div>
      <div
        class="opus-section opus-section--nvim-features"
        bind:this={featuresEl}
      >
        {#if nvimConfigCard}
          <a
            class="opus-nvim__card"
            href="https://github.com/aikhe/nvim-config"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View nvim config on GitHub"
          >
            <span class="opus-nvim__card-top">
              <span class="opus-nvim__card-title">{nvimConfigCard.title}</span>
              <svg
                class="opus-nvim__card-arrow"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m6.5 17.5 11-11m0 9v-9h-9" />
              </svg>
            </span>
            <p class="opus-nvim__card-desc">
              {nvimConfigCard.description}
            </p>
          </a>
        {/if}
      </div>
      <div class="opus-section opus-section--nvim-plugins">
        <h2 class="opus-nvim" bind:this={pluginsTitleEl}>Plugins</h2>
        <div class="opus-nvim__rule" aria-hidden="true"></div>
        {#if nvimPlugins.length > 0}
          <div
            class="opus-nvim__plugins"
            role="group"
            aria-label="Plugin repos"
            onmousemove={showTip}
            onmouseleave={hideTip}
          >
            {#each nvimPlugins as plugin (plugin.repo)}
              <a
                class="opus-nvim__plugin"
                href={plugin.repo}
                target="_blank"
                rel="noopener noreferrer"
                data-tip={starsTip(plugin.repo)}
                aria-label={`View ${plugin.title} repo on GitHub`}
              >
                <span class="opus-nvim__card-title">
                  {plugin.title}
                </span>
                <p class="opus-nvim__card-desc">
                  {plugin.description}
                </p>
              </a>
            {/each}
          </div>
        {/if}
      </div>
      <div class="opus-section opus-section--nvim-miscs">
        <h2 class="opus-nvim" bind:this={miscsTitleEl}>Miscs</h2>
        <div class="opus-nvim__rule" aria-hidden="true"></div>
        {#if nvimMiscs.length > 0}
          <div
            class="opus-nvim__plugins"
            role="group"
            aria-label="Misc repos"
            onmousemove={showTip}
            onmouseleave={hideTip}
          >
            {#each nvimMiscs as misc (misc.repo)}
              <a
                class="opus-nvim__plugin"
                href={misc.repo}
                target="_blank"
                rel="noopener noreferrer"
                data-tip={starsTip(misc.repo)}
                aria-label={`View ${misc.title} repo on GitHub`}
              >
                <span class="opus-nvim__card-title">
                  {misc.title}
                </span>
                <p class="opus-nvim__card-desc">
                  {misc.description}
                </p>
              </a>
            {/each}
          </div>
        {/if}
      </div>
      <OpusFooter showCard={false} />
    </div>
    <div class="opus-col opus-col--4" aria-hidden="true"></div>
    <div class="opus-col opus-col--5" aria-hidden="true"></div>
  </div>
  {#if uiState.gridOverlay}
    <div class="opus-grid opus-grid--overlay" aria-hidden="true">
      <div class="opus-col opus-col--1"></div>
      <div class="opus-col opus-col--2"></div>
      <div class="opus-col opus-col--3"></div>
      <div class="opus-col opus-col--4"></div>
      <div class="opus-col opus-col--5"></div>
    </div>
  {/if}
  <div class="opus-stripe opus-stripe--top" aria-hidden="true"></div>
  <div class="opus-stripe opus-stripe--bottom" aria-hidden="true"></div>
  {#if tip}
    <div
      class="opus-nvim__tip"
      class:opus-nvim__tip--below={tip.below}
      style:left={`${tip.x}px`}
      style:top={`${tip.y}px`}
      bind:this={tipEl}
      in:pop
      out:popOut
      aria-hidden="true"
    >
      {#key tip.text}
        <span class="opus-nvim__tip-swap" in:textSwap={swapParams}>
          <svg
            class="opus-nvim__tip-logo"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
          </svg>
          <span>{tip.text}</span>
        </span>
      {/key}
    </div>
  {/if}
</div>

<style>
  :global(html) {
    height: auto;
    overflow: auto;
  }

  :global(body) {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .opus-canvas {
    align-items: start;
    background: var(--color-bg-opus);
    display: grid;
    justify-items: center;
    min-height: 100dvh;
    overflow: visible;
    position: relative;
    width: 100%;
  }

  .opus-grid {
    box-sizing: border-box;
    display: grid;
    gap: 0;
    grid-template-columns: 14rem 4rem 36rem 12rem 8rem;
    justify-content: center;
    min-height: calc(100dvh + 16rem);
    width: fit-content;
  }

  .opus-grid--overlay {
    box-sizing: border-box;
    height: 100dvh;
    inset: 0;
    margin: auto;
    pointer-events: none;
    position: absolute;
    z-index: 2;
  }

  .opus-stripe {
    height: 24px;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    z-index: 1;
  }

  .opus-stripe::before {
    background-color: var(--color-overlay-05);
    content: '';
    inset: 0;
    mask-image: url('$lib/assets/stripe.svg');
    mask-repeat: repeat;
    mask-size: 7px 7px;
    pointer-events: none;
    position: absolute;
  }

  .opus-stripe--top {
    border-bottom: 1px solid var(--color-overlay-05);
    top: 0;
  }

  .opus-stripe--bottom {
    border-top: 1px solid var(--color-overlay-05);
    bottom: 0;
  }

  .opus-col {
    box-sizing: border-box;
    min-height: 100%;
    padding: 4.5rem 0 7rem;
    position: relative;
  }

  .opus-grid:not(.opus-grid--overlay) {
    border-right: 2px solid var(--color-overlay-02);
    position: relative;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col {
    border-left: 2px solid var(--color-overlay-02);
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col::after {
    background: var(--color-overlay-10);
    content: '';
    height: 24px;
    left: -2px;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 2px;
    z-index: 0;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col::before {
    background: var(--color-overlay-10);
    bottom: 0;
    content: '';
    height: 24px;
    left: -2px;
    pointer-events: none;
    position: absolute;
    width: 2px;
    z-index: 0;
  }

  .opus-grid:not(.opus-grid--overlay)::after {
    background: var(--color-overlay-10);
    content: '';
    height: 24px;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 2px;
  }

  .opus-grid:not(.opus-grid--overlay)::before {
    background: var(--color-overlay-10);
    bottom: 0;
    content: '';
    height: 24px;
    pointer-events: none;
    position: absolute;
    right: -2px;
    width: 2px;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col--3 {
    align-items: stretch;
    border-left: 2px solid transparent;
    border-image: linear-gradient(
        to bottom,
        var(--color-overlay-02) 0%,
        var(--color-overlay-02) 5%,
        transparent 30%,
        transparent 60%,
        var(--color-overlay-02) 80%,
        var(--color-overlay-02) 100%
      )
      1;
    border-right: none;
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: flex-start;
    position: relative;
    z-index: 1;
  }

  .opus-col__border--right {
    background: linear-gradient(
      to bottom,
      var(--color-overlay-02) 0%,
      var(--color-overlay-02) 20%,
      transparent 30%,
      transparent 60%,
      var(--color-overlay-02) 80%,
      var(--color-overlay-02) 100%
    );
    bottom: 0;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 2px;
    z-index: 0;
  }

  .opus-col__border--right::before {
    background: var(--color-overlay-10);
    bottom: 0;
    content: '';
    height: 24px;
    position: absolute;
    width: 2px;
  }

  .opus-col__border--right::after {
    background: var(--color-overlay-10);
    content: '';
    height: 24px;
    position: absolute;
    top: 0;
    width: 2px;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col--4 {
    border-left: none;
    pointer-events: none;
    position: relative;
    z-index: 0;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col--4::after,
  .opus-grid:not(.opus-grid--overlay) .opus-col--4::before {
    display: none;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col--5 {
    border-image: linear-gradient(
        to bottom,
        var(--color-overlay-02) 0%,
        var(--color-overlay-02) 20%,
        transparent 30%,
        transparent 60%,
        var(--color-overlay-02) 80%,
        var(--color-overlay-02) 100%
      )
      1;
    border-left: 2px solid transparent;
    pointer-events: none;
    position: relative;
    z-index: 0;
  }

  .opus-section {
    position: relative;
    z-index: 1;
  }

  .opus-col__section {
    position: relative;
    z-index: 1;
  }

  .opus-col--1 {
    align-items: stretch;
  }

  .opus-col--2 {
    align-items: stretch;
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: flex-start;
  }

  .opus-col__section {
    align-items: flex-start;
    display: flex;
  }

  .opus-col__section--01 {
    height: var(--nvim-intro-h);
  }

  .opus-col__section--02 {
    height: var(--nvim-features-h);
    margin-top: 2rem;
  }

  .opus-col__section--03 {
    height: var(--nvim-plugins-title-h);
    margin-top: 3rem;
  }

  .opus-col__section--04 {
    height: var(--nvim-miscs-title-h);
    margin-top: 3rem;
  }

  .opus-col__index {
    color: var(--color-text-faint-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1;
  }

  .opus-section--nvim {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .opus-nvim {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.46rem;
    font-weight: 500;
    letter-spacing: 0.1%;
    line-height: 1;
    margin: 0;
  }

  .opus-nvim__desc {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: -0.2rem 0 0;
    max-width: 92%;
  }

  .opus-section--nvim-features {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: flex-start;
    margin-top: 2rem;
  }

  .opus-section--nvim-plugins {
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: flex-start;
    margin-top: 3rem;
  }

  .opus-section--nvim-miscs {
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: flex-start;
    margin-top: 3rem;
  }

  .opus-nvim__rule {
    background-color: var(--color-overlay-03);
    height: 2px;
    margin-top: 1rem;
    width: 100%;
  }

  .opus-nvim__plugins {
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: flex-start;
  }

  .opus-nvim__plugin {
    border-bottom: 2px solid var(--color-overlay-03);
    color: inherit;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1.25rem 0;
    position: relative;
    text-decoration: none;
    width: 100%;
  }

  .opus-nvim__plugin .opus-nvim__card-title {
    transition: color 0.15s ease;
  }

  .opus-nvim__plugin .opus-nvim__card-desc {
    font-size: 1.08rem;
    line-height: 1.48;
    max-width: 100%;
    transition: color 0.15s ease;
  }

  .opus-nvim__plugin:hover .opus-nvim__card-title {
    color: color-mix(in srgb, var(--color-text) 60%, white);
  }

  .opus-nvim__plugin:hover .opus-nvim__card-desc {
    color: color-mix(in srgb, var(--color-text-muted-opus) 60%, white);
  }

  /* 90% of col-3 (36rem), same as the footer services card */
  .opus-nvim__card {
    background: var(--color-overlay-03);
    box-sizing: border-box;
    color: inherit;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    position: relative;
    text-decoration: none;
    transition: background-color 0.15s ease;
    width: 32.4rem;
  }

  .opus-nvim__card::after {
    background-image:
      linear-gradient(var(--color-border-corner), var(--color-border-corner)),
      linear-gradient(var(--color-border-corner), var(--color-border-corner)),
      linear-gradient(var(--color-border-corner), var(--color-border-corner)),
      linear-gradient(var(--color-border-corner), var(--color-border-corner));
    background-position:
      0 0,
      100% 0,
      0 100%,
      100% 100%;
    background-repeat: no-repeat;
    background-size: 3px 10px;
    content: '';
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity 0.15s ease;
  }

  .opus-nvim__card:hover {
    background-color: var(--color-overlay-05);
  }

  .opus-nvim__card:hover::after {
    opacity: 1;
  }

  .opus-nvim__card-top {
    align-items: center;
    display: flex;
    gap: 0.25rem;
  }

  .opus-nvim__card-arrow {
    color: var(--color-text);
    display: block;
    flex-shrink: 0;
    height: 1.125rem;
    width: 1.125rem;
  }

  .opus-nvim__card-title {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
  }

  .opus-nvim__card-desc {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
    max-width: 92%;
  }

  /* cursor-following hover tip copied from the root activity
    heatmap: pill offset, hide/out settle and pointer diamond all
    match, the content shows the repo's live GitHub star count. */
  .opus-nvim__tip {
    background: var(--color-text);
    color: var(--color-bg);
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    font-weight: 500;
    left: 0;
    letter-spacing: 0.04em;
    line-height: 1;
    padding: 0.55rem 0.75rem;
    pointer-events: none;
    position: fixed;
    text-align: center;
    top: 0;
    transform: translate(-50%, calc(-100% - 10px));
    transform-origin: bottom center;
    white-space: nowrap;
    z-index: 50;
  }

  .opus-nvim__tip--below {
    transform: translate(-50%, 14px);
    transform-origin: top center;
  }

  /* pointer diamond bridging the gap between the pill and the cursor */
  .opus-nvim__tip::after {
    background: var(--color-text);
    content: '';
    height: 8px;
    left: 50%;
    position: absolute;
    top: 100%;
    transform: translate(-50%, -50%) rotate(45deg);
    width: 8px;
  }

  /* sits after the base rule: same specificity, so this wins for below tips */
  .opus-nvim__tip--below::after {
    top: 0;
  }

  .opus-nvim__tip-swap {
    align-items: center;
    display: inline-flex;
    gap: 0.35rem;
  }

  .opus-nvim__tip-logo {
    display: block;
    flex-shrink: 0;
    height: 1rem;
    width: 1rem;
  }

  /* touch: press states replace hover states */
  @media (hover: none) {
    .opus-nvim__plugin:hover .opus-nvim__card-title {
      color: var(--color-text);
    }

    .opus-nvim__plugin:hover .opus-nvim__card-desc {
      color: var(--color-text-muted-opus);
    }

    .opus-nvim__plugin:active .opus-nvim__card-title {
      color: color-mix(in srgb, var(--color-text) 60%, white);
    }

    .opus-nvim__plugin:active .opus-nvim__card-desc {
      color: color-mix(in srgb, var(--color-text-muted-opus) 60%, white);
    }

    .opus-nvim__card:hover {
      background-color: var(--color-overlay-03);
    }

    .opus-nvim__card:active {
      background-color: var(--color-overlay-05);
    }

    .opus-nvim__card:hover::after {
      opacity: 0;
    }

    .opus-nvim__card:active::after {
      opacity: 1;
    }
  }

  /* mobile: single fluid column (see _opus.css) — the fixed 36rem
    column and 32.4rem cards no longer apply, so cards go full-width
    and type steps down with the other opus descriptions. */
  @media (max-width: 48rem) {
    .opus-nvim__card {
      width: 100%;
    }

    .opus-nvim__desc,
    .opus-nvim__card-title,
    .opus-nvim__card-desc {
      font-size: 1rem;
    }
  }

  /* debug grid — Shift+G — background only */
  .opus-grid--overlay .opus-col--1 {
    background: color-mix(in srgb, var(--color-text) 5%, transparent);
  }

  .opus-grid--overlay .opus-col--2 {
    background: color-mix(in srgb, var(--color-text) 8%, transparent);
  }

  .opus-grid--overlay .opus-col--3 {
    background: color-mix(in srgb, var(--color-text) 11%, transparent);
  }

  .opus-grid--overlay .opus-col--4 {
    background: color-mix(in srgb, var(--color-text) 14%, transparent);
  }

  .opus-grid--overlay .opus-col--5 {
    background: color-mix(in srgb, var(--color-text) 17%, transparent);
  }
</style>
