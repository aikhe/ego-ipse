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

  // Sanity-only: no fallback copy. Missing description renders nothing.
  const fleurParagraphs = $derived(
    data.sanityFleur?.description
      ? splitDescriptionParagraphs(data.sanityFleur.description)
      : []
  );
  const fleurImages = $derived(data.sanityFleur?.images ?? []);
  const figCount = $derived(fleurImages.length);
  const fleurExtras = $derived(data.sanityFleur?.extras ?? []);
  const extraCount = $derived(fleurExtras.length);

  // extras filter (same pattern as the works page search).
  let query = $state('');
  const queryText = $derived(query.trim().toLowerCase());
  const filteredExtras = $derived(
    fleurExtras.filter(extra => {
      if (queryText === '') return true;
      const haystack =
        `${extra.title} ${extra.description} ${extra.repo ?? ''}`.toLowerCase();
      return haystack.includes(queryText);
    })
  );

  const figLabel = (i: number) => `Fig ${String(i + 1).padStart(2, '0')}`;

  // left index column mirrors the right content heights so 01 sits level
  // with the intro, each Fig 01 sits level with its figure, and 02 sits
  // level with the extras title instead of piling at the top
  // (same pattern as the stack page).
  let rightColEl = $state<HTMLElement | null>(null);
  let extrasTitleEl = $state<HTMLElement | null>(null);
  let partHeights = $state<number[]>([]);

  $effect(() => {
    void figCount;
    void extraCount;
    let raf = 0;
    const measure = () => {
      if (!rightColEl) return;
      const parts = rightColEl.querySelectorAll(
        ':scope > .opus-section--fleur-part'
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
      <OpusNav active="fleur" />
    </div>
    <div class="opus-col opus-col--2" aria-hidden="true">
      <div
        class="opus-col__section opus-col__section--01"
        style={partHeights[0] ? `height: ${partHeights[0]}px` : undefined}
      >
        <span class="opus-col__index">01</span>
      </div>
      {#each fleurImages as image, i (image.src ?? i)}
        <div
          class="opus-col__section opus-col__section--fleur-fig"
          style={partHeights[i + 1]
            ? `height: ${partHeights[i + 1]}px`
            : undefined}
        >
          <span class="opus-col__index">{figLabel(i)}</span>
        </div>
      {/each}
      {#if extraCount > 0}
        <div
          class="opus-col__section opus-col__section--fleur-extras"
          style={partHeights[figCount + 1]
            ? `height: ${partHeights[figCount + 1]}px`
            : undefined}
        >
          <span class="opus-col__index">02</span>
        </div>
      {/if}
    </div>
    <div class="opus-col opus-col--3" bind:this={rightColEl}>
      <div
        class="opus-col__border opus-col__border--right"
        aria-hidden="true"
      ></div>
      <div class="opus-section opus-section--fleur opus-section--fleur-part">
        <h2 class="opus-fleur">Fleur</h2>
        {#each fleurParagraphs as para, k (k)}
          <p class="opus-fleur__desc">
            {@html renderRichInline(para)}
          </p>
        {/each}
      </div>
      {#each fleurImages as image, i (image.src ?? i)}
        <figure
          class="opus-section opus-section--fleur-fig opus-section--fleur-part"
          aria-label={image.alt ?? `Fleur figure ${i + 1}`}
        >
          {#if image.src}
            <img
              class="opus-fleur__img"
              src={sizedSanityUrl(image.src)}
              alt={image.alt ?? `Fleur figure ${i + 1}`}
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
      {#if fleurExtras.length > 0}
        <div
          class="opus-section opus-section--fleur-extras opus-section--fleur-part"
        >
          <div class="opus-fleur__head">
            <h2 class="opus-fleur" bind:this={extrasTitleEl}>Extras</h2>
            <div class="opus-search">
              <input
                class="opus-search__input"
                type="text"
                placeholder="Filter extras..."
                aria-label="Filter extras"
                autocomplete="off"
                bind:value={query}
              />
            </div>
          </div>
          <div class="opus-fleur__rule" aria-hidden="true"></div>
          <div class="opus-fleur__extras">
            {#each filteredExtras as extra (extra.repo)}
              <a
                class="opus-fleur__extra"
                href={extra.repo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${extra.title} repo on GitHub`}
              >
                <span class="opus-fleur__card-title">
                  {extra.title}
                </span>
                <p class="opus-fleur__card-desc">
                  {extra.description}
                </p>
              </a>
            {/each}
          </div>
          {#if filteredExtras.length === 0}
            <p class="opus-fleur__empty">
              No extras match "{query.trim()}" yet.
            </p>
          {/if}
        </div>
      {/if}
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

  .opus-col__section--fleur-fig {
    margin-top: 0.5rem;
  }

  .opus-col__section--01 + .opus-col__section--fleur-fig {
    margin-top: 2rem;
  }

  .opus-col__section--fleur-extras {
    margin-top: 3rem;
  }

  .opus-section--fleur {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .opus-section--fleur-fig {
    box-sizing: border-box;
    margin: 0.5rem 0 0;
    max-width: none;
    min-width: 0;
    width: calc(100% + 12rem + 2px);
  }

  .opus-section--fleur + .opus-section--fleur-fig {
    margin-top: 2rem;
  }

  .opus-fleur__img {
    display: block;
    height: auto;
    max-width: 100%;
    width: 100%;
  }

  .opus-fleur {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.46rem;
    font-weight: 500;
    letter-spacing: 0.1%;
    line-height: 1;
    margin: 0;
  }

  .opus-fleur__desc {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: -0.2rem 0 0;
    max-width: 92%;
  }

  .opus-section--fleur-extras {
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: flex-start;
    margin-top: 3rem;
  }

  .opus-fleur__head {
    align-items: center;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    width: 100%;
  }

  .opus-search {
    margin-left: auto;
    margin-right: 0;
  }

  .opus-search__input {
    background: var(--color-overlay-05);
    border: none;
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.5;
    margin: 0;
    padding: 0.4rem 0.75rem;
    width: 20rem;
  }

  .opus-search__input::placeholder {
    color: var(--color-text-faint-opus);
    opacity: 1;
  }

  .opus-search__input:focus-visible {
    outline: 1px solid var(--color-border-solid);
    outline-offset: 0;
  }

  .opus-fleur__rule {
    background-color: var(--color-overlay-03);
    height: 2px;
    margin-top: 1rem;
    width: 100%;
  }

  .opus-fleur__extras {
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: flex-start;
  }

  .opus-fleur__empty {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 1.25rem 0 0;
  }

  .opus-fleur__extra {
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

  .opus-fleur__extra .opus-fleur__card-title {
    transition: color 0.15s ease;
  }

  .opus-fleur__extra .opus-fleur__card-desc {
    font-size: 1.08rem;
    line-height: 1.48;
    max-width: 100%;
    transition: color 0.15s ease;
  }

  .opus-fleur__extra:hover .opus-fleur__card-title {
    color: color-mix(in srgb, var(--color-text) 60%, white);
  }

  .opus-fleur__extra:hover .opus-fleur__card-desc {
    color: color-mix(in srgb, var(--color-text-muted-opus) 60%, white);
  }

  .opus-fleur__card-title {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
  }

  .opus-fleur__card-desc {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
    max-width: 92%;
  }

  /* touch: press states replace hover states */

  @media (hover: none) {
    .opus-fleur__extra:hover .opus-fleur__card-title {
      color: var(--color-text);
    }

    .opus-fleur__extra:hover .opus-fleur__card-desc {
      color: var(--color-text-muted-opus);
    }

    .opus-fleur__extra:active .opus-fleur__card-title {
      color: color-mix(in srgb, var(--color-text) 60%, white);
    }

    .opus-fleur__extra:active .opus-fleur__card-desc {
      color: color-mix(in srgb, var(--color-text-muted-opus) 60%, white);
    }
  }

  /* mobile: type steps down with the other opus descriptions.
    figures stop bleeding into the gutter so sanity images
    stay inside the single column. */

  @media (max-width: 48rem) {
    .opus-section--fleur-fig {
      max-width: 100%;
      width: 100%;
    }

    .opus-fleur__head {
      flex-wrap: wrap;
    }

    .opus-search {
      flex-basis: 100%;
      margin-left: 0;
    }

    .opus-fleur__desc,
    .opus-fleur__card-title,
    .opus-fleur__card-desc,
    .opus-fleur__empty {
      font-size: 1rem;
    }
  }
</style>
