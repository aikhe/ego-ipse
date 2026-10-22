<script lang="ts">
  import { uiState } from '$lib/state/ui.svelte';
  import OpusNav from '$lib/components/Opus/OpusNav.svelte';
  import OpusFooter from '$lib/components/Opus/OpusFooter.svelte';
  import OpusValues from '$lib/components/Opus/OpusValues.svelte';
  import {
    renderRichInline,
    splitDescriptionParagraphs,
  } from '$lib/sanity/opusValues';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  // Sanity-only: no fallback copy. Missing description renders nothing.
  const aboutParagraphs = $derived(
    data.sanityAbout?.description
      ? splitDescriptionParagraphs(data.sanityAbout.description)
      : []
  );

  let aboutEl = $state<HTMLDivElement | null>(null);
  let valuesTitleEl = $state<HTMLParagraphElement | null>(null);

  // same measured-index trick as the home page: 01 takes the about
  // section's height and 02 takes the values title's height (+ the same
  // 4rem top margin as the values section) so each index sits level
  // with its section instead of piling at the top.
  // the about measure always runs: values may be missing while about
  // content exists, and 01 must never wait on the optional section.
  $effect(() => {
    if (!aboutEl) return;
    const sync = () => {
      const h = aboutEl!.getBoundingClientRect().height;
      const th = valuesTitleEl?.getBoundingClientRect().height;
      const root = document.documentElement.style;
      root.setProperty('--about-intro-h', `${h}px`);
      if (th !== undefined)
        root.setProperty('--about-values-title-h', `${th}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(aboutEl);
    if (valuesTitleEl) ro.observe(valuesTitleEl);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  });
</script>

<div class="opus-canvas">
  <div class="opus-grid">
    <div class="opus-col opus-col--1">
      <OpusNav active="about" />
    </div>
    <div class="opus-col opus-col--2" aria-hidden="true">
      <div class="opus-col__section opus-col__section--01">
        <span class="opus-col__index">01</span>
      </div>
      {#if data.sanityValues}
        <div class="opus-col__section opus-col__section--02">
          <span class="opus-col__index">02</span>
        </div>
      {/if}
    </div>
    <div class="opus-col opus-col--3">
      <div
        class="opus-col__border opus-col__border--right"
        aria-hidden="true"
      ></div>
      <div class="opus-section opus-section--about" bind:this={aboutEl}>
        <h2 class="opus-about">About</h2>
        {#each aboutParagraphs as para, k (k)}
          <p class="opus-about__desc">
            {@html renderRichInline(para)}
          </p>
        {/each}
      </div>
      <OpusValues
        sanityValues={data.sanityValues}
        bind:titleRef={valuesTitleEl}
      />
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
</div>

<style>
  .opus-section {
    position: relative;
    z-index: 1;
  }

  .opus-col__section--01 {
    height: var(--about-intro-h);
  }

  .opus-col__section--02 {
    height: var(--about-values-title-h);
    margin-top: 4rem;
  }

  .opus-section--about {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .opus-about {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.46rem;
    font-weight: 500;
    letter-spacing: 0.1%;
    line-height: 1;
    margin: 0;
  }

  .opus-about__desc {
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
