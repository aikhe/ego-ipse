<script lang="ts">
  import type { Work, WorkCell } from '$lib/data/works';

  let { work }: { work: Work } = $props();

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
    const source: WorkCell[] = work.images ?? [];
    return source.map((cell, j) => ({
      cell,
      wide: cell.span ? true : defaultWide(j, source.length),
    }));
  }

  function cellStyle(cell: WorkCell, wide: boolean): string {
    // mirror opus posters: container aspect must match the intrinsic image
    // ratio so object-fit:cover never stretches or jags on resize.
    if (cell.src && cell.width && cell.height)
      return `aspect-ratio:${cell.width} / ${cell.height};`;
    if (cell.src && cell.ratio) return `aspect-ratio:${cell.ratio};`;
    if (cell.h) return `height:${cell.h};`;
    return `aspect-ratio:${cell.ratio ?? defaultRatio(wide)};`;
  }

  const placed = $derived(buildPlaced());
</script>

<article class="opus-work-detail">
  <h3 class="opus-work-detail__title">{work.title}</h3>
  <p class="opus-work-detail__desc">{work.description}</p>
  <dl class="opus-work-detail__meta">
    {#each work.meta as row (row.k)}
      <div class="opus-work-detail__row">
        <dt class="opus-work-detail__key">{row.k}</dt>
        <dd class="opus-work-detail__value">{row.v}</dd>
      </div>
    {/each}
  </dl>
  {#if work.quote}
    <div class="opus-work-detail__quote">
      <span class="opus-work-detail__quote-line" aria-hidden="true"></span>
      <div class="opus-work-detail__quote-body">
        <p class="opus-work-detail__quote-text">“{work.quote.text}”</p>
        {#if work.quote.href}
          <a class="opus-work-detail__quote-by" href={work.quote.href} target="_blank" rel="noopener noreferrer">
            <span class="opus-work-detail__quote-avatar" aria-hidden="true">
              {#if work.quote.avatar}
                <img
                  src={work.quote.avatar}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              {/if}
            </span>
            <span class="opus-work-detail__quote-by-name">{work.quote.by}</span>
          </a>
        {:else}
          <span class="opus-work-detail__quote-by">
            <span class="opus-work-detail__quote-avatar" aria-hidden="true">
              {#if work.quote.avatar}
                <img
                  src={work.quote.avatar}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              {/if}
            </span>
            <span class="opus-work-detail__quote-by-name">{work.quote.by}</span>
          </span>
        {/if}
      </div>
    </div>
  {/if}
  {#if placed.length > 0}
    <div class="opus-work-detail__gallery">
      {#each placed as p, j (j)}
        <div
          class="opus-work-detail__gallery-cell"
          class:opus-work-detail__gallery-cell--wide={p.wide}
          style={cellStyle(p.cell, p.wide)}
        >
          {#if p.cell.src}
            <img
              src={p.cell.src}
              alt={p.cell.alt ?? work.title}
              width={p.cell.width}
              height={p.cell.height}
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</article>

<style>
  .opus-work-detail {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .opus-work-detail__title {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.46rem;
    font-weight: 500;
    letter-spacing: 0.1%;
    line-height: 1;
    margin: 0;
  }

  .opus-work-detail__desc {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0.35rem 0 0;
  }

  .opus-work-detail__meta {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    margin: 0.35rem 0 0;
    min-width: 0;
  }

  .opus-work-detail__row {
    display: grid;
    gap: 0.35rem;
    grid-template-columns: 1fr 2fr;
  }

  .opus-work-detail__key {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.5;
    margin: 0;
  }

  .opus-work-detail__value {
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

  .opus-work-detail__quote {
    align-items: stretch;
    display: flex;
    gap: 0.5rem;
    margin-top: 1.2rem;
  }

  .opus-work-detail__quote-line {
    background: var(--color-text);
    display: block;
    margin-right: 0.25rem;
    width: 2px;
  }

  .opus-work-detail__quote-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .opus-work-detail__quote-text {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 500;
    letter-spacing: 0.18%;
    line-height: 1.5;
    margin: 0;
  }

  .opus-work-detail__quote-by {
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

  .opus-work-detail__quote-avatar {
    aspect-ratio: 1 / 1;
    background: var(--color-overlay-05);
    border-radius: 0.35rem;
    display: block;
    overflow: hidden;
    width: 2rem;
  }

  .opus-work-detail__quote-avatar img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  a.opus-work-detail__quote-by {
    color: var(--color-text-muted-opus);
    text-decoration: none;
  }

  .opus-work-detail__gallery {
    align-items: start;
    display: grid;
    gap: 0.5rem;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    margin-top: 3.5rem;
    width: calc(100% + 20rem + 4px);
  }

  .opus-work-detail__gallery-cell {
    background: var(--color-overlay-02);
    max-width: 100%;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    width: 100%;
  }

  .opus-work-detail__gallery-cell--wide {
    grid-column: 1 / -1;
  }

  .opus-work-detail__gallery-cell img {
    display: block;
    height: 100%;
    object-fit: cover;
    object-position: center;
    width: 100%;
  }
</style>
