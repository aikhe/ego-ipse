<script lang="ts">
  import { uiState } from '$lib/state/ui.svelte';
  import OpusNav from '$lib/components/Opus/OpusNav.svelte';
  import OpusFooter from '$lib/components/Opus/OpusFooter.svelte';
  import kaia from '$lib/assets/kaia.webp';
  import {
    renderRichInline,
    splitDescriptionParagraphs,
  } from '$lib/sanity/opusValues';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  // Sanity-only: no fallback copy. Missing description renders nothing.
  const kaiaParagraphs = $derived(
    data.sanityKaia?.description
      ? splitDescriptionParagraphs(data.sanityKaia.description)
      : []
  );

  let introEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!introEl) return;
    const sync = () => {
      const h = introEl!.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--kaia-intro-h', `${h}px`);
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
</script>

<main class="opus-canvas">
  <div class="opus-grid">
    <div class="opus-col opus-col--1">
      <OpusNav active="kaia" />
    </div>
    <div class="opus-col opus-col--2" aria-hidden="true">
      <div class="opus-col__section opus-col__section--01">
        <span class="opus-col__index">01</span>
      </div>
    </div>
    <div class="opus-col opus-col--3">
      <div
        class="opus-col__border opus-col__border--right"
        aria-hidden="true"
      ></div>
      <div class="opus-section opus-section--intro" bind:this={introEl}>
        <div class="opus-profile">
          <img
            src={kaia}
            alt="Kaia profile"
            width="256"
            height="256"
            loading="eager"
            decoding="async"
          />
        </div>
        <p class="opus-name">Kaia</p>
        {#each kaiaParagraphs as para, k (k)}
          <p class="opus-desc">
            {@html renderRichInline(para)}
          </p>
        {/each}
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
</main>

<style>
  .opus-section {
    position: relative;
    z-index: 1;
  }

  .opus-col__section--01 {
    height: var(--kaia-intro-h, 13.2rem);
  }

  .opus-section--intro {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: flex-start;
  }

  .opus-profile {
    aspect-ratio: 1 / 1;
    border-radius: 0.7rem;
    flex-shrink: 0;
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
</style>
