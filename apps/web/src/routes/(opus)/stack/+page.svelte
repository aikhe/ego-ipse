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
  const stackParagraphs = $derived(
    data.sanityStack?.description
      ? splitDescriptionParagraphs(data.sanityStack.description)
      : []
  );
  const categories = $derived(data.sanityStack?.categories ?? []);
  const catCount = $derived(categories.length);

  // single-theme render: a display:none <img> still downloads, so mounting
  // both light+dark pairs doubles every logo request. theme switches are
  // rare and re-fetch into the http cache; initial load always pays 2x.
  const isDark = $derived(uiState.theme === 'dark');

  const padIndex = (n: number) => String(n).padStart(2, '0');

  // idle logos render as a mask silhouette so every brand shares one
  // uniform muted tone (grayscale alone keeps dark/white wordmarks
  // uneven). vendor prefixes stay inline to keep stylelint quiet.
  // accepts undefined (preview urls are optional): renders no mask.
  const maskInline = (url: string | undefined) => {
    if (!url) return '';
    return (
      `-webkit-mask-image: url('${url}'); mask-image: url('${url}'); ` +
      '-webkit-mask-position: center; mask-position: center; ' +
      '-webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; ' +
      '-webkit-mask-size: contain; mask-size: contain;'
    );
  };

  // per-logo tweak from Sanity (1 = default): clamped so a typo can't
  // blow up the grid. uses the independent `scale` property to avoid
  // interfering with transforms.
  const scaleOf = (size: unknown) =>
    typeof size === 'number' && Number.isFinite(size)
      ? Math.min(2, Math.max(0.5, size))
      : 1;

  // left index column mirrors the right content heights so each number
  // sits level with its section instead of piling at the top.
  let rightColEl = $state<HTMLElement | null>(null);
  let partHeights = $state<number[]>([]);

  $effect(() => {
    // track category count so observers re-sync when sanity data arrives.
    void catCount;
    // one rAF-throttled pass: read every part height before the single
    // reactive write so one layout serves all reads (unthrottled
    // observers + resize/load listeners force a reflow per section).
    let raf = 0;
    const measure = () => {
      if (!rightColEl) return;
      const parts = rightColEl.querySelectorAll(
        ':scope > .opus-section--stack-part'
      );
      partHeights = Array.from(parts).map(
        el => (el as HTMLElement).getBoundingClientRect().height
      );
    };
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    if (rightColEl) ro.observe(rightColEl);
    window.addEventListener('resize', schedule);
    // fonts/images shift heights after first paint: re-sync on load.
    window.addEventListener('load', schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('load', schedule);
    };
  });

  // cursor-following hover tip mirroring the activity heatmap pill.
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
    // crossing the gaps between cells keeps the pill open (mirrors heatmap)
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
      <OpusNav active="stack" />
    </div>
    <div class="opus-col opus-col--2" aria-hidden="true">
      <div
        class="opus-col__section opus-col__section--stack-idx"
        style={partHeights[0] ? `height: ${partHeights[0]}px` : undefined}
      >
        <span class="opus-col__index">01</span>
      </div>
      {#each categories as cat, i (`${i}-${cat.title ?? ''}`)}
        <div
          class="opus-col__section opus-col__section--stack-idx opus-col__section--stack-cat"
          style={partHeights[i + 1]
            ? `height: ${partHeights[i + 1]}px`
            : undefined}
        >
          <span class="opus-col__index">{padIndex(i + 2)}</span>
        </div>
      {/each}
    </div>
    <div class="opus-col opus-col--3" bind:this={rightColEl}>
      <div
        class="opus-col__border opus-col__border--right"
        aria-hidden="true"
      ></div>
      <div class="opus-section opus-section--stack opus-section--stack-part">
        <h2 class="opus-stack">Stack</h2>
        {#each stackParagraphs as para, k (k)}
          <p class="opus-stack__desc">
            {@html renderRichInline(para)}
          </p>
        {/each}
      </div>
      {#each categories as cat, i (`${i}-${cat.title ?? ''}`)}
        <section
          class="opus-section opus-section--stack-cat opus-section--stack-part"
          aria-label={cat.title}
        >
          <p class="opus-stack-cat__label">
            <span class="opus-stack-cat__quote-line" aria-hidden="true"></span>
            <span>{cat.title}</span>
          </p>
          <div
            class="opus-stack-cat__grid"
            role="group"
            aria-label={`${cat.title ?? 'Stack'} tools`}
            onmousemove={showTip}
            onmouseleave={hideTip}
          >
            {#each cat.items ?? [] as item, k (k)}
              {@const hasPreview = Boolean(item.previewUrl)}
              {#if item.iconLightUrl && item.iconDarkUrl && item.name}
                {@const logoUrl = isDark ? item.iconDarkUrl : item.iconLightUrl}
                {#if item.href}
                  <a
                    class="opus-stack-cat__item"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-tip={item.name}
                    aria-label={item.name}
                    style={`--stack-scale: ${scaleOf(item.size)}`}
                  >
                    {#if hasPreview}
                      <span
                        class="opus-stack-cat__preview"
                        aria-hidden="true"
                        style={maskInline(item.previewUrl)}
                      ></span>
                    {:else}
                      <span
                        class="opus-stack-cat__mask"
                        aria-hidden="true"
                        style={maskInline(logoUrl)}
                      ></span>
                    {/if}
                    <!-- single-theme logo: the hidden light/dark pair both
                      downloaded (display:none still fetches <img>), doubling
                      every request. first category is above the fold. -->
                    <img
                      class="opus-stack-cat__logo"
                      src={logoUrl}
                      alt={item.name}
                      width="96"
                      height="36"
                      loading={i === 0 ? 'eager' : 'lazy'}
                      fetchpriority={i === 0 ? 'high' : 'low'}
                      decoding="async"
                    />
                  </a>
                {:else}
                  <span
                    class="opus-stack-cat__item"
                    data-tip={item.name}
                    aria-label={item.name}
                    style={`--stack-scale: ${scaleOf(item.size)}`}
                  >
                    {#if hasPreview}
                      <span
                        class="opus-stack-cat__preview"
                        aria-hidden="true"
                        style={maskInline(item.previewUrl)}
                      ></span>
                    {:else}
                      <span
                        class="opus-stack-cat__mask"
                        aria-hidden="true"
                        style={maskInline(logoUrl)}
                      ></span>
                    {/if}
                    <!-- single-theme logo: the hidden light/dark pair both
                      downloaded (display:none still fetches <img>), doubling
                      every request. first category is above the fold. -->
                    <img
                      class="opus-stack-cat__logo"
                      src={logoUrl}
                      alt={item.name}
                      width="96"
                      height="36"
                      loading={i === 0 ? 'eager' : 'lazy'}
                      fetchpriority={i === 0 ? 'high' : 'low'}
                      decoding="async"
                    />
                  </span>
                {/if}
              {/if}
            {/each}
          </div>
        </section>
      {/each}
      <OpusFooter />
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
      class="opus-stack__tip"
      class:opus-stack__tip--below={tip.below}
      style:left={`${tip.x}px`}
      style:top={`${tip.y}px`}
      bind:this={tipEl}
      in:pop
      out:popOut
      aria-hidden="true"
    >
      {#key tip.text}
        <span class="opus-stack__tip-swap" in:textSwap={swapParams}
          >{tip.text}</span
        >
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

  .opus-col__section--stack-cat {
    margin-top: 2.5rem;
  }

  .opus-col__index {
    color: var(--color-text-faint-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1;
  }

  .opus-section--stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .opus-stack {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.46rem;
    font-weight: 500;
    letter-spacing: 0.1%;
    line-height: 1;
    margin: 0;
  }

  .opus-stack__desc {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: -0.2rem 0 0;
    max-width: 92%;
  }

  .opus-section--stack-cat {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 2.5rem;
  }

  .opus-stack-cat__label {
    align-items: center;
    color: var(--color-text);
    display: flex;
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    gap: 0.5rem;
    letter-spacing: 0.18%;
    line-height: 1;
    margin: 0;
  }

  .opus-stack-cat__quote-line {
    background: var(--color-text);
    display: block;
    flex-shrink: 0;
    height: 2rem;
    width: 2px;
  }

  .opus-stack-cat__grid {
    background: color-mix(in srgb, var(--color-text) 4%, var(--color-bg-opus));
    border: none;
    border-radius: 2px;
    box-sizing: border-box;
    display: grid;
    gap: 1rem 0.75rem;
    grid-template-columns: repeat(5, 1fr);
    padding: 1.5rem 1rem;
    place-items: center;
    width: calc(100% + 8rem + 2px);
  }

  .opus-stack-cat__item {
    display: grid;
    min-height: clamp(1.6rem, 1.1rem + 2.5vw, 2.35rem);
    min-width: 0;
    place-items: center;
    scale: var(--stack-scale, 1);
    width: 100%;
  }

  a.opus-stack-cat__item {
    cursor: pointer;
  }

  .opus-stack-cat__logo {
    display: block;
    grid-area: 1 / 1;
    height: clamp(1.4rem, 1rem + 2.5vw, 2.25rem);
    margin: 0;
    max-height: clamp(1.4rem, 1rem + 2.5vw, 2.25rem);
    max-width: 5.8rem;
    object-fit: contain;
    object-position: center;
    opacity: 0;
    transform: none;
    transition: opacity 0.35s ease;
    width: 100%;
  }

  .opus-stack-cat__preview {
    background: var(--color-text-muted-opus);
    display: block;
    grid-area: 1 / 1;
    height: clamp(1.4rem, 1rem + 2.5vw, 2.25rem);
    margin: 0;
    max-width: 5.8rem;
    opacity: 0.6;
    transform: none;
    transition: opacity 0.35s ease;
    width: 100%;
  }

  .opus-stack-cat__mask {
    background: var(--color-text-muted-opus);
    display: block;
    grid-area: 1 / 1;
    height: clamp(1.4rem, 1rem + 2.5vw, 2.25rem);
    margin: 0;
    max-width: 5.8rem;
    opacity: 0.6;
    transform: none;
    transition: opacity 0.35s ease;
    width: 100%;
  }

  .opus-stack-cat__item:hover .opus-stack-cat__mask,
  .opus-stack-cat__item:hover .opus-stack-cat__preview {
    opacity: 0;
    transform: none;
  }

  .opus-stack-cat__item:hover .opus-stack-cat__logo {
    opacity: 1;
    transform: none;
  }

  /* keyboard mirrors hover so the dim-to-color reveal works without
    a pointer, at every width. */
  .opus-stack-cat__item:focus-visible .opus-stack-cat__mask,
  .opus-stack-cat__item:focus-visible .opus-stack-cat__preview {
    opacity: 0;
    transform: none;
  }

  .opus-stack-cat__item:focus-visible .opus-stack-cat__logo {
    opacity: 1;
    transform: none;
  }

  .opus-stack__tip {
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
    transform: translate(-50%, calc(-100% - 18px));
    transform-origin: bottom center;
    white-space: nowrap;
    z-index: 50;
  }

  .opus-stack__tip--below {
    transform: translate(-50%, 22px);
    transform-origin: top center;
  }

  /* pointer diamond bridging the gap between the pill and the cursor */
  .opus-stack__tip::after {
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
  .opus-stack__tip--below::after {
    top: 0;
  }

  .opus-stack__tip-swap {
    display: inline-block;
  }

  /* same silhouette treatment as desktop, just stronger: at 0.6 the
    small mid/mobile shapes wash out against the grid background. */
  @media (max-width: 63rem) {
    .opus-stack-cat__mask,
    .opus-stack-cat__preview {
      opacity: 0.9;
    }

    .opus-stack-cat__grid {
      padding-block: 1.75rem;
    }
  }

  @media (max-width: 48rem) {
    .opus-stack-cat__label {
      font-size: 1rem;
    }

    .opus-stack-cat__grid {
      gap: 0.75rem 0.5rem;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      padding: 1.125rem 0.625rem;
    }

    .opus-stack-cat__item {
      min-height: clamp(1.25rem, 1rem + 2vw, 1.6rem);
    }

    .opus-stack-cat__logo,
    .opus-stack-cat__mask,
    .opus-stack-cat__preview {
      height: clamp(1.1rem, 0.85rem + 2vw, 1.5rem);
      max-height: clamp(1.1rem, 0.85rem + 2vw, 1.5rem);
      max-width: 4.5rem;
    }
  }

  /* touch has no persistent hover: keep a dim idle (muted logos)
    and reveal full color on tap/keys, mirroring the desktop hover
    reveal. grayscale sits on the logo itself so the idle stays
    visible (same resource as hover, no mask dependency). */
  @media (hover: none) {
    .opus-stack-cat__mask,
    .opus-stack-cat__preview {
      opacity: 0;
    }

    .opus-stack-cat__logo {
      filter: grayscale(1);
      opacity: 0.55;
      transition:
        filter 0.35s ease,
        opacity 0.35s ease;
    }

    .opus-stack-cat__item:active .opus-stack-cat__logo,
    .opus-stack-cat__item:focus-visible .opus-stack-cat__logo,
    .opus-stack-cat__item:hover .opus-stack-cat__logo {
      filter: none;
      opacity: 1;
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
