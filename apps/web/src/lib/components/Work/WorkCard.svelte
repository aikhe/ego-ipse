<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Work, WorkCell } from '$lib/data/works';

  let { work, from }: { work: Work; from?: string } = $props();

  const detailHref = $derived(
    `${resolve('/(opus)/works/[slug]', { slug: work.slug })}${from ? `?from=${encodeURIComponent(from)}` : ''}`
  );

  interface Placed {
    cell: WorkCell;
    wide: boolean;
  }

  function defaultWide(j: number, total: number): boolean {
    if (work.preview === 1) return true;
    if (work.preview === 2) return true;
    if (work.preview === 3 && j === total - 1) return true;
    return false;
  }

  function defaultRatio(wide: boolean): string {
    if (work.preview === 1) return '4 / 3';
    return wide ? '2 / 1' : '4 / 3';
  }

  function buildPlaced(): Placed[] {
    const source: WorkCell[] =
      work.cells ??
      Array.from({ length: work.preview }, () => ({}) as WorkCell);
    return source.map((cell, j) => ({
      cell,
      wide: cell.span ? true : defaultWide(j, source.length),
    }));
  }

  function cellStyle(cell: WorkCell, wide: boolean): string {
    // mirror opus posters: container aspect must match the intrinsic image
    // ratio so object-fit:cover never stretches or jags on resize.
    // fixed heights (cell.h) break that lock — only use them for empty
    // placeholder cells with no src.
    if (cell.src && cell.width && cell.height)
      return `aspect-ratio:${cell.width} / ${cell.height};`;
    if (cell.src && cell.ratio) return `aspect-ratio:${cell.ratio};`;
    // h is an exact height: aspect-ratio must be dropped, otherwise the
    // browser derives the width from height x ratio instead of stretching.
    if (cell.h) return `height:${cell.h};`;
    return `aspect-ratio:${cell.ratio ?? defaultRatio(wide)};`;
  }

  const placed = buildPlaced();
</script>

<article class="opus-work">
  <div class="opus-work__columns">
    <div class="opus-work__info">
      <h3 class="opus-work__title">
        <a class="opus-work__title-link" href={detailHref}>
          {work.title}
        </a>
      </h3>
      <dl class="opus-work__meta">
        {#each work.meta as row (row.k)}
          <div class="opus-work__row">
            <dt class="opus-work__key">{row.k}</dt>
            <dd class="opus-work__value">{row.v}</dd>
          </div>
        {/each}
      </dl>
      {#if work.quote}
        <div class="opus-work__quote">
          <span class="opus-work__quote-line" aria-hidden="true"></span>
          <div class="opus-work__quote-body">
            <p class="opus-work__quote-text">“{work.quote.text}”</p>
            {#if work.quote.href}
              <a
                class="opus-work__quote-by"
                href={work.quote.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="opus-work__quote-avatar" aria-hidden="true">
                  {#if work.quote.avatar}
                    <img
                      src={work.quote.avatar}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  {/if}
                </span>
                <span class="opus-work__quote-by-name">{work.quote.by}</span>
              </a>
            {:else}
              <span class="opus-work__quote-by">
                <span class="opus-work__quote-avatar" aria-hidden="true">
                  {#if work.quote.avatar}
                    <img
                      src={work.quote.avatar}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  {/if}
                </span>
                <span class="opus-work__quote-by-name">{work.quote.by}</span>
              </span>
            {/if}
          </div>
        </div>
      {/if}
    </div>
    <div class="opus-work__preview">
      {#each placed as p, j (j)}
        <a
          class="opus-work__preview-cell"
          class:opus-work__preview-cell--wide={p.wide}
          style={cellStyle(p.cell, p.wide)}
          href={detailHref}
          aria-label={`View ${work.title}`}
        >
          {#if p.cell.src}
            <img
              src={p.cell.src}
              alt={p.cell.alt ?? `${work.title} preview`}
              width={p.cell.width}
              height={p.cell.height}
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          {/if}
        </a>
      {/each}
    </div>
  </div>
</article>

<style>
  .opus-work {
    display: flex;
    flex-direction: column;
  }

  .opus-work__columns {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  }

  .opus-work__info {
    align-self: start;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    position: sticky;
    top: 4rem;
  }

  .opus-work__title {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
  }

  .opus-work__title-link {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .opus-work__title-link:hover {
    color: var(--color-text-muted-opus);
    text-decoration: none;
  }

  .opus-work__meta {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    margin: 0;
    min-width: 0;
  }

  .opus-work__row {
    display: grid;
    gap: 0.35rem;
    grid-template-columns: 1fr 2fr;
  }

  .opus-work__key {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.5;
    margin: 0;
    white-space: nowrap;
  }

  .opus-work__value {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.5;
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .opus-work__quote {
    align-items: stretch;
    display: flex;
    gap: 0.5rem;
    margin-top: 1.2rem;
  }

  .opus-work__quote-line {
    background: var(--color-text);
    display: block;
    flex-shrink: 0;
    width: 2px;
  }

  .opus-work__quote .opus-work__quote-line {
    margin-right: 0.25rem;
  }

  .opus-work__quote-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .opus-work__quote-text {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.5;
    margin: 0;
  }

  .opus-work__quote-by {
    align-items: center;
    color: var(--color-text-muted-opus);
    display: flex;
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 500;
    gap: 0.5rem;
    letter-spacing: 0.18%;
    line-height: 1.5;
  }

  .opus-work__quote-avatar {
    aspect-ratio: 1 / 1;
    background: var(--color-overlay-05);
    border-radius: 0.35rem;
    display: block;
    overflow: hidden;
    width: 2rem;
  }

  .opus-work__quote-avatar img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  a.opus-work__quote-by {
    color: var(--color-text-muted-opus);
    text-decoration: none;
  }

  .opus-work__preview {
    align-items: start;
    display: grid;
    gap: 0.5rem;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    width: 100%;
  }

  .opus-work__preview-cell {
    background: var(--color-overlay-02);
    max-width: 100%;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    position: relative;
    transition: filter 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    width: 100%;
  }

  .opus-work__preview-cell::after {
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

  .opus-work__preview-cell:hover::after,
  .opus-work__preview-cell:focus-visible::after {
    opacity: 1;
  }

  .opus-work__preview-cell:focus-visible {
    outline: 1px solid var(--color-border-solid);
    outline-offset: 2px;
  }

  .opus-work__preview-cell--wide {
    grid-column: 1 / -1;
  }

  .opus-work__preview:has(.opus-work__preview-cell:hover)
    .opus-work__preview-cell:not(:hover) {
    filter: brightness(0.64);
  }

  .opus-work__preview-cell img {
    display: block;
    height: 100%;
    object-fit: cover;
    object-position: center;
    width: 100%;
  }

  /* touch: press states replace hover states */
  @media (hover: none) {
    .opus-work__title-link:hover {
      text-decoration: none;
    }

    .opus-work__title-link:active {
      color: var(--color-text-muted-opus);
      text-decoration: none;
    }

    .opus-work__preview-cell:hover::after {
      opacity: 0;
    }

    .opus-work__preview-cell:active::after {
      opacity: 1;
    }

    .opus-work__preview:has(.opus-work__preview-cell:hover)
      .opus-work__preview-cell:not(:hover) {
      filter: none;
    }
  }
</style>
