<script lang="ts">
  import {
    fallbackOpusValues,
    renderRichInline,
    splitDescriptionParagraphs,
  } from '$lib/sanity/opusValues';
  import type { SanityOpusValues } from '$lib/types/sanity';

  let {
    sanityValues = null,
    ref = $bindable<HTMLDivElement | null>(null),
    titleRef = $bindable<HTMLParagraphElement | null>(null),
  }: {
    sanityValues?: SanityOpusValues | null;
    ref?: HTMLDivElement | null;
    titleRef?: HTMLParagraphElement | null;
  } = $props();

  // partial sanity docs merge over the lorem fallback field-by-field so an
  // empty field never blanks the section.
  const display = $derived({
    description: sanityValues?.description ?? fallbackOpusValues.description,
    columns: sanityValues?.columns ?? fallbackOpusValues.columns,
    quote: sanityValues?.quote ?? fallbackOpusValues.quote,
  });

  // blank line in Sanity = new paragraph, so "To me…" starts its own line.
  const paragraphs = $derived(splitDescriptionParagraphs(display.description));
</script>

<div class="opus-section opus-section--values" bind:this={ref}>
  <p class="opus-name" bind:this={titleRef}>Values</p>
  {#each paragraphs as para, k (k)}
    <p class="opus-desc">
      {@html renderRichInline(para)}
    </p>
  {/each}
  <div class="opus-values__cols">
    {#each display.columns as col, i (col.title)}
      <div class="opus-values__col" class:opus-values__col--wide={i === 0}>
        <p class="opus-values__label">{col.title}</p>
        <ul class="opus-values__list">
          {#each col.items as item (item)}
            <li class="opus-values__item">{item}</li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
  <div class="opus-values__quote">
    <span class="opus-values__quote-line" aria-hidden="true"></span>
    <div class="opus-values__quote-body">
      <p class="opus-values__quote-text">
        “{display.quote.text}”
      </p>
      <span class="opus-values__quote-by">{display.quote.by}</span>
    </div>
  </div>
</div>

<style>
  .opus-section {
    position: relative;
    z-index: 1;
  }

  .opus-section--values {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: flex-start;
    margin-top: 5rem;
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

  /* :global — <strong> arrives via {@html}, so it never carries the
    scoped hash class; without this the UA default (700) wins. */
  .opus-desc :global(strong) {
    font-weight: 500;
  }

  .opus-values__cols {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1.4fr 1fr;
    margin-top: 1.5rem;
    width: 100%;
  }

  .opus-values__col {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .opus-values__label {
    color: var(--color-text-faint-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1;
    margin: 0;
  }

  .opus-values__list {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .opus-values__item {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
  }

  .opus-values__quote {
    align-items: stretch;
    display: flex;
    gap: 0.5rem;
    margin-top: 2rem;
  }

  .opus-values__quote-line {
    background: var(--color-text);
    display: block;
    flex-shrink: 0;
    margin-right: 0.25rem;
    width: 2px;
  }

  .opus-values__quote-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .opus-values__quote-text {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
  }

  .opus-values__quote-by {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.5;
  }
</style>
