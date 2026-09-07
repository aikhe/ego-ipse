<script lang="ts">
  import { resolve } from '$app/paths';
  import { uiState } from '$lib/state/ui.svelte';
  import { works } from '$lib/data/works';
  import WorkCard from '$lib/components/Work/WorkCard.svelte';
  import ike from '$lib/assets/ike.png';
  import PosterOverlay from '$lib/components/Poster/PosterOverlay.svelte';
  import poster1 from '$lib/assets/posters/1.webp';
  import poster2 from '$lib/assets/posters/2.webp';
  import poster3 from '$lib/assets/posters/3.webp';
  import poster4 from '$lib/assets/posters/4.webp';

  const posters = [poster1, poster4, poster3, poster2];

  let selectedPoster = $state<number | null>(null);

  let viewportEl = $state<HTMLDivElement | null>(null);
  let trackEl = $state<HTMLDivElement | null>(null);
  let introEl = $state<HTMLDivElement | null>(null);
  let postersSectionEl = $state<HTMLDivElement | null>(null);
  let pos = $state(0);
  let maxPos = $state(0);

  function updateBounds() {
    if (!viewportEl || !trackEl) return;
    const col3W = 36 * 16;
    const content = trackEl.scrollWidth;
    // last poster should sit within col3 right edge, not stuck at viewport (col4) right
    maxPos = Math.max(0, content - col3W);
    pos = Math.min(pos, maxPos);
  }

  function clamp(v: number) {
    return Math.max(0, Math.min(v, maxPos));
  }

  function go(dir: -1 | 1) {
    const first = trackEl?.querySelector('.opus-poster-wrap') as HTMLElement | null;
    const gap = 0.7 * 16;
    const step = first ? first.offsetWidth + gap : 36 * 8;
    pos = clamp(pos + dir * step);
  }

  $effect(() => {
    if (!viewportEl || !trackEl) return;
    updateBounds();
    const ro = new ResizeObserver(() => updateBounds());
    ro.observe(viewportEl);
    ro.observe(trackEl);
    const onResize = () => updateBounds();
    window.addEventListener('resize', onResize);
    const imgs = trackEl.querySelectorAll('img');
    const onLoad = () => updateBounds();
    imgs.forEach((im) => im.addEventListener('load', onLoad));
    const t1 = setTimeout(updateBounds, 100);
    const t2 = setTimeout(updateBounds, 600);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(t1);
      clearTimeout(t2);
      imgs.forEach((im) => im.removeEventListener('load', onLoad));
      ro.disconnect();
    };
  });

  $effect(() => {
    if (!introEl) return;
    const sync = () => {
      const h = introEl!.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--opus-intro-h', `${h}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(introEl);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  });

  $effect(() => {
    if (!postersSectionEl) return;
    const sync = () => {
      const h = postersSectionEl!.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--opus-posters-h', `${h}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(postersSectionEl);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  });

  $effect(() => {
    if (selectedPoster !== null) {
      const prevBody = document.body.style.overflow;
      const prevHtml = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBody;
        document.documentElement.style.overflow = prevHtml;
      };
    }
  });
</script>

<div class="opus-canvas">
  <div class="opus-grid">
    <div class="opus-col opus-col--1">
      <nav class="opus-nav" aria-label="Site sections">
        <span class="opus-nav__link opus-nav__link--active" aria-current="page">opus</span>
        <a class="opus-nav__link" href="https://aikhe.pages.dev" target="_blank" rel="noopener noreferrer">ipse</a>
        <a class="opus-nav__link" href={resolve('/opus/works')}>works</a>
      </nav>
    </div>
    <div class="opus-col opus-col--2" aria-hidden="true">
      <div class="opus-col__section opus-col__section--01"><span class="opus-col__index">01</span></div>
      <div class="opus-col__section opus-col__section--02"><span class="opus-col__index">02</span></div>
      <div class="opus-col__section opus-col__section--03"><span class="opus-col__index">03</span></div>
    </div>
    <div class="opus-col opus-col--3">
      <div class="opus-col__border opus-col__border--right" aria-hidden="true"></div>
      <div class="opus-section opus-section--intro" bind:this={introEl}>
        <div class="opus-profile">
          <img src={ike} alt="Profile" loading="eager" decoding="async" />
        </div>
        <p class="opus-name">Ike Andrie Rosacay</p>
        <p class="opus-desc">
          Designer &amp; Developer based in <span class="opus-desc__hl">Caloocan,</span>
          <span class="opus-desc__hl">Philippines</span>. Freelancing
          <span class="opus-desc__hl">since 2025</span>, working across
          <span class="opus-desc__hl">design</span>, <span class="opus-desc__hl">products</span>,
          <span class="opus-desc__hl">development</span>, and
          <span class="opus-desc__hl">creative</span> projects.
        </p>
      </div>
      <div class="opus-section opus-section--posters" bind:this={postersSectionEl}>
        <div
          class="opus-posters-viewport"
          bind:this={viewportEl}
          role="region"
          aria-label="Posters"
        >
          <div
            class="opus-posters"
            bind:this={trackEl}
            style:transform={`translateX(${-pos}px)`}
          >
          {#each posters as src, i (src)}
            <div class="opus-poster-wrap">
              <div class="opus-poster" role="button" tabindex="0" onclick={() => (selectedPoster = i)} onkeydown={(e) => e.key === 'Enter' && (selectedPoster = i)}><img src={src} alt={`Poster ${i + 1}`} width="2848" height="3690" loading="eager" decoding="async" draggable="false" /></div>
              <span class="opus-poster__fig">Fig 0{i + 1}</span>
            </div>
          {/each}
          </div>
        </div>
        <div class="opus-controls">
          <div class="opus-paper-meta">
            <span class="opus-paper-quote-line" aria-hidden="true"></span>
            <span class="opus-paper-label">Loved by the team at</span>
            <a class="opus-paper-link" href="https://paper.design/" target="_blank" rel="noopener noreferrer" aria-label="Paper">
              <svg class="opus-paper-design" width="110" height="30" viewBox="0 0 110 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g clip-path="url(#clipPaperDesign)">
                <path class="paper-wordmark" d="M34.9844 23.975V2.97656H42.3338C46.6235 2.97656 49.4433 5.52637 49.4433 9.39608C49.4433 13.2658 46.6235 15.8156 42.3338 15.8156H38.4041V23.975H34.9844ZM38.4041 12.6959H42.3338C44.6137 12.6959 45.9636 11.436 45.9636 9.39608C45.9636 7.35623 44.6137 6.12633 42.3338 6.12633H38.4041V12.6959ZM49.291 16.6255C49.291 21.1551 52.1408 24.3049 56.2205 24.3049C58.3503 24.3049 60.2102 23.315 61.1101 21.7551V23.9749H64.3799V9.24598H61.1101V11.3159C60.3002 9.90594 58.3503 8.91601 56.2205 8.91601C52.1408 8.91601 49.291 12.0658 49.291 16.6255ZM56.8804 21.3351C54.3606 21.3351 52.5608 19.3853 52.5608 16.6255C52.5608 13.8657 54.3606 11.8858 56.8804 11.8858C59.4303 11.8858 61.2301 13.8357 61.2301 16.6255C61.2301 19.3853 59.4303 21.3351 56.8804 21.3351ZM67.0544 29.9745V9.24598H70.2942V11.4958C71.1641 9.93593 73.054 8.91601 75.2138 8.91601C79.2935 8.91601 82.1433 12.0658 82.1433 16.5955C82.1433 21.1551 79.2935 24.3049 75.2138 24.3049C73.084 24.3049 71.1341 23.315 70.2942 21.8751V29.9745H67.0544ZM70.2042 16.5955C70.2042 19.3853 71.974 21.3351 74.5238 21.3351C77.0737 21.3351 78.8435 19.3553 78.8435 16.5955C78.8435 13.8357 77.0737 11.8858 74.5238 11.8858C72.004 11.8858 70.2042 13.8357 70.2042 16.5955ZM83.4088 16.6255C83.4088 21.0651 86.5286 24.3049 90.9383 24.3049C94.137 24.3049 96.9186 22.428 97.769 19.6243H94.4226C93.6817 20.7667 92.403 21.4551 90.9383 21.4551C88.6284 21.4551 86.9785 19.9252 86.6786 17.4954H97.7178C97.7778 17.2254 97.8077 16.8655 97.8077 16.3555C97.8077 11.7658 95.1379 8.91601 90.8783 8.91601C86.5586 8.91601 83.4088 12.1258 83.4088 16.6255ZM94.628 15.0956H86.7986C87.3085 13.0557 88.8384 11.7358 90.8783 11.7358C93.0081 11.7358 94.358 12.9957 94.628 15.0956ZM100.072 9.24598V23.9749H103.312V16.4455C103.312 13.6257 104.692 12.0958 107.331 12.0958C108.171 12.0958 108.951 12.2458 109.551 12.3958V9.24598C109.011 9.036 108.291 8.91601 107.541 8.91601C105.622 8.91601 104.122 9.90594 103.312 11.7358V9.24598H100.072Z" />
                <path d="M4 0H26V16H16V4H4V0ZM0 4H4V16H16V26H0V4Z" fill="#81ACEC" />
              </g>
              <defs>
                <clipPath id="clipPaperDesign">
                  <rect width="110" height="30" fill="white" />
                </clipPath>
              </defs>
            </svg>
            </a>
          </div>
          <div class="opus-controls__group">
            <button
              class="opus-ctrl"
              onclick={() => go(-1)}
              disabled={pos <= 0}
              aria-label="Previous poster"
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              class="opus-ctrl"
              onclick={() => go(1)}
              disabled={pos >= maxPos}
              aria-label="Next poster"
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="opus-section opus-section--works">
        <h2 class="opus-works">Works</h2>
        <div class="opus-works-list">
          {#each works as work, i (i)}
            <WorkCard {work} />
          {/each}
        </div>
      </div>
    </div>
    <div class="opus-col opus-col--4" aria-hidden="true"></div>
  </div>
  {#if uiState.gridOverlay}
    <div class="opus-grid opus-grid--overlay" aria-hidden="true">
      <div class="opus-col opus-col--1"></div>
      <div class="opus-col opus-col--2"></div>
      <div class="opus-col opus-col--3"></div>
      <div class="opus-col opus-col--4"></div>
    </div>
  {/if}
  <div class="opus-stripe opus-stripe--top" aria-hidden="true"></div>
  <div class="opus-stripe opus-stripe--bottom" aria-hidden="true"></div>
</div>

{#if selectedPoster !== null}
  <PosterOverlay bind:selected={selectedPoster} images={posters} />
{/if}

<style>
  :global(html) {
    height: auto;
    overflow: auto;
  }

  :global(body) {
    height: auto;
    min-height: 100vh;
    overflow: auto;
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
    grid-template-columns: 9rem 4rem 36rem 12rem;
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
    background-color: var(--color-overlay-10);
    content: '';
    inset: 0;
    mask-image: url('$lib/assets/stripe.svg');
    mask-repeat: repeat;
    mask-size: 7px 7px;
    pointer-events: none;
    position: absolute;
  }

  .opus-stripe--top {
    border-bottom: 1px solid var(--color-overlay-10);
    top: 0;
  }

  .opus-stripe--bottom {
    border-top: 1px solid var(--color-overlay-10);
    bottom: 0;
  }

  .opus-col {
    box-sizing: border-box;
    min-height: 100%;
    padding: 4.5rem 0 7rem;
    position: relative;
  }

  .opus-grid:not(.opus-grid--overlay) {
    border-right: 2px solid var(--color-overlay-03);
    position: relative;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col {
    border-left: 2px solid var(--color-overlay-03);
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col::after {
    background: var(--color-overlay-15);
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
    background: var(--color-overlay-15);
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
    background: var(--color-overlay-15);
    content: '';
    height: 24px;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 2px;
  }

  .opus-grid:not(.opus-grid--overlay)::before {
    background: var(--color-overlay-15);
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
        var(--color-overlay-03) 0%,
        var(--color-overlay-03) 20%,
        transparent 30%,
        transparent 60%,
        var(--color-overlay-03) 80%,
        var(--color-overlay-03) 100%
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
        var(--color-overlay-03) 0%,
        var(--color-overlay-03) 20%,
        transparent 30%,
        transparent 60%,
        var(--color-overlay-03) 80%,
        var(--color-overlay-03) 100%
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
    background: var(--color-overlay-15);
    bottom: 0;
    content: '';
    height: 24px;
    position: absolute;
    width: 2px;
  }

  .opus-col__border--right::after {
    background: var(--color-overlay-15);
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

  .opus-nav {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    left: calc(50vw - 30.5rem);
    margin-top: -0.12rem;
    position: fixed;
    top: 4.5rem;
    z-index: 5;
  }

  .opus-nav__link {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.15;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .opus-nav__link--active {
    color: var(--color-text);
  }

  .opus-nav__link:not(.opus-nav__link--active):hover {
    color: var(--color-text);
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
    height: var(--opus-intro-h, 13.2rem);
  }

  .opus-col__section--02 {
    height: var(--opus-posters-h, auto);
  }

  .opus-col__section--03 {
    align-items: flex-start;
    display: flex;
    flex: 1;
    margin-top: 4rem;
  }

  .opus-col__index {
    color: var(--color-text-muted-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1;
  }

  .opus-section--intro {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: var(--opus-intro-h, 13.2rem);
    justify-content: flex-start;
  }

  .opus-section--posters {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .opus-section--works {
    display: flex;
    flex-direction: column;
    margin-top: 4rem;
    width: calc(100% + 12rem + 2px);
  }

  .opus-works {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.46rem;
    font-weight: 500;
    letter-spacing: 0.1%;
    line-height: 1;
    margin: 0;
  }

  .opus-works-list {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    margin-top: 1.5rem;
  }

  .opus-profile {
    aspect-ratio: 1 / 1;
    border-radius: 0.7rem;
    max-width: 3.4rem;
    overflow: hidden;
    width: 28%;
  }

  .opus-profile img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .opus-name {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.46rem;
    font-weight: 500;
    letter-spacing: 0.1%;
    line-height: 1;
    margin: 0;
  }

  .opus-desc {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: -0.2rem 0 0;
    max-width: 92%;
  }

  .opus-desc__hl {
    color: var(--color-text);
    font-weight: 500;
  }

  .opus-posters-viewport {
    cursor: default;
    overflow: hidden;
    overscroll-behavior: contain;
    position: relative;
    touch-action: auto;
    width: calc(100% + 12rem + 2px);
  }

  .opus-posters {
    display: flex;
    gap: 0.7rem;
    transition: transform 0.72s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .opus-poster-wrap {
    display: flex;
    flex: 0 0 calc((36rem - 0.7rem) / 2);
    flex-direction: column;
    gap: 0.45rem;
  }

  .opus-poster {
    aspect-ratio: 2848 / 3690;
    background: var(--color-overlay-03);
    cursor: pointer;
    overflow: hidden;
    transition: filter 0.4s cubic-bezier(0.33, 1, 0.68, 1);
    width: 100%;
  }

  .opus-poster__fig {
    color: var(--color-text-muted-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1;
  }

  /* root Poster.svelte: 0xffffff → 0x888888 (0.533) via gsap 0.4s power2.out — reduced slightly */
  .opus-posters:hover .opus-poster {
    filter: brightness(0.64);
  }

  .opus-posters:hover .opus-poster:hover {
    filter: none;
  }

  .opus-poster:focus-visible {
    outline: 1px solid var(--color-border-solid);
    outline-offset: 2px;
  }

  .opus-posters-viewport:active {
    cursor: grabbing;
  }

  .opus-controls {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
    width: calc(100% + 12rem + 2px);
  }

  .opus-paper-meta {
    align-items: center;
    display: flex;
    gap: 0.5rem;
  }

  .opus-paper-meta .opus-paper-quote-line {
    margin-right: 0.25rem;
  }

  .opus-paper-quote-line {
    background: var(--color-text);
    display: block;
    height: 2rem;
    width: 2px;
  }

  .opus-paper-label {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1;
  }

  .opus-paper-design {
    display: block;
    height: 22px;
    width: auto;
  }

  .opus-paper-link {
    display: inline-flex;
  }

  .paper-wordmark {
    fill: #3f3f3f;
  }

  :global([data-theme='dark']) .paper-wordmark {
    fill: #efefe4;
  }

  .opus-controls__group {
    display: flex;
    gap: 0.5rem;
  }

  .opus-ctrl {
    align-items: center;
    background: var(--color-overlay-05);
    border: none;
    border-radius: 0;
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    justify-content: center;
    min-height: 2rem;
    min-width: 2rem;
    opacity: 0.9;
    padding: 0.45rem;
    pointer-events: auto;
    position: relative;
    transition:
      background 0.25s ease,
      color 0.25s ease,
      opacity 0.25s ease;
    z-index: 5;
  }

  .opus-ctrl:hover:not(:disabled) {
    background: var(--color-text);
    color: var(--color-bg);
    opacity: 1;
  }

  .opus-ctrl:disabled {
    opacity: 0.35;
    pointer-events: none;
  }

  .opus-poster img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
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
</style>
