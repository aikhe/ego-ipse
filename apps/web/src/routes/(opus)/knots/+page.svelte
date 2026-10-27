<script lang="ts">
  import { uiState } from '$lib/state/ui.svelte';
  import OpusNav from '$lib/components/Opus/OpusNav.svelte';
  import OpusFooter from '$lib/components/Opus/OpusFooter.svelte';
  import {
    renderRichInline,
    splitDescriptionParagraphs,
  } from '$lib/sanity/opusValues';
  import { sizedSanityUrl } from '$lib/sanity/common';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  // sanity-only: no fallback copy. missing description renders nothing.
  const knotsParagraphs = $derived(
    data.sanityKnots?.description
      ? splitDescriptionParagraphs(data.sanityKnots.description)
      : []
  );
  const knotsImages = $derived(data.sanityKnots?.images ?? []);
  const figCount = $derived(knotsImages.length);

  const figLabel = (i: number) => `Fig ${String(i + 1).padStart(2, '0')}`;

  // left index column mirrors the right content heights so 01 sits level
  // with the intro and each fig 01 sits level with its figure
  // (same pattern as the osn page).
  let rightColEl = $state<HTMLElement | null>(null);
  let partHeights = $state<number[]>([]);

  $effect(() => {
    void figCount;
    let raf = 0;
    const measure = () => {
      if (!rightColEl) return;
      const parts = rightColEl.querySelectorAll(
        ':scope > .opus-section--knots-part'
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
    window.addEventListener('load', schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('load', schedule);
    };
  });
</script>

<main class="opus-canvas">
  <div class="opus-grid">
    <div class="opus-col opus-col--1">
      <OpusNav active="knots" />
    </div>
    <div class="opus-col opus-col--2" aria-hidden="true">
      <div
        class="opus-col__section opus-col__section--01"
        style={partHeights[0] ? `height: ${partHeights[0]}px` : undefined}
      >
        <span class="opus-col__index">01</span>
      </div>
      {#each knotsImages as image, i (image.src ?? i)}
        <div
          class="opus-col__section opus-col__section--knots-fig"
          style={partHeights[i + 1]
            ? `height: ${partHeights[i + 1]}px`
            : undefined}
        >
          <span class="opus-col__index">{figLabel(i)}</span>
        </div>
      {/each}
    </div>
    <div class="opus-col opus-col--3" bind:this={rightColEl}>
      <div
        class="opus-col__border opus-col__border--right"
        aria-hidden="true"
      ></div>
      <div class="opus-section opus-section--knots opus-section--knots-part">
        <h2 class="opus-knots">Knots</h2>
        {#each knotsParagraphs as para, k (k)}
          <p class="opus-knots__desc">
            {@html renderRichInline(para)}
          </p>
        {/each}
      </div>
      {#each knotsImages as image, i (image.src ?? i)}
        <figure
          class="opus-section opus-section--knots-fig opus-section--knots-part"
          aria-label={image.alt ?? `Knots figure ${i + 1}`}
        >
          {#if image.src}
            <img
              class="opus-knots__img"
              src={sizedSanityUrl(image.src)}
              alt={image.alt ?? `Knots figure ${i + 1}`}
              width={image.width ?? image.assetWidth ?? 1200}
              height={image.height ??
                image.assetHeight ??
                Math.round(
                  ((image.width ?? image.assetWidth ?? 1200) * 9) / 16
                )}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchpriority={i === 0 ? 'high' : 'low'}
              decoding="async"
            />
          {/if}
        </figure>
      {/each}
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
  .opus-grid:not(.opus-grid--overlay) .opus-col--3 {
    min-width: 0;
  }

  .opus-section {
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  .opus-col__section--knots-fig {
    margin-top: 0.5rem;
  }

  .opus-col__section--01 + .opus-col__section--knots-fig {
    margin-top: 2rem;
  }

  .opus-section--knots {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .opus-section--knots-fig {
    box-sizing: border-box;
    margin: 0.5rem 0 0;
    max-width: none;
    min-width: 0;
    width: calc(100% + 20rem + 4px);
  }

  .opus-section--knots + .opus-section--knots-fig {
    margin-top: 2rem;
  }

  .opus-knots__img {
    display: block;
    height: auto;
    max-width: 100%;
    width: 100%;
  }

  .opus-knots {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.46rem;
    font-weight: 500;
    letter-spacing: 0.1%;
    line-height: 1;
    margin: 0;
  }

  .opus-knots__desc {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: -0.2rem 0 0;
    max-width: 92%;
  }

  /* mobile: type steps down with the other opus descriptions.
    figures stop bleeding into the gutter so sanity images
    stay inside the single column. */

  @media (max-width: 48rem) {
    .opus-section--knots-fig {
      max-width: 100%;
      width: 100%;
    }

    .opus-knots__desc {
      font-size: 1rem;
    }
  }
</style>
