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
    const source: WorkCell[] =
      work.cells ?? Array.from({ length: work.preview }, () => ({}) as WorkCell);
    return source.map((cell, j) => ({
      cell,
      wide: cell.span ? true : defaultWide(j, source.length)
    }));
  }

  function cellStyle(cell: WorkCell, wide: boolean): string {
    const ratio = cell.ratio ?? defaultRatio(wide);
    let s = `aspect-ratio:${ratio};`;
    if (cell.h) s += `min-height:${cell.h};`;
    return s;
  }

  const placed = buildPlaced();
</script>

<article class="opus-work">
  <div class="opus-work__columns">
    <div class="opus-work__info">
      <h3 class="opus-work__title">{work.title}</h3>
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
            <span class="opus-work__quote-by">
              <span class="opus-work__quote-avatar" aria-hidden="true">
                {#if work.quote.avatar}
                  <img src={work.quote.avatar} alt="" loading="lazy" decoding="async" />
                {/if}
              </span>
              {#if work.quote.href}
                <a class="opus-work__quote-by-name" href={work.quote.href}>{work.quote.by}</a>
              {:else}
                <span class="opus-work__quote-by-name">{work.quote.by}</span>
              {/if}
            </span>
          </div>
        </div>
      {/if}
    </div>
    <div class="opus-work__preview" aria-hidden="true">
      {#each placed as p, j (j)}
        <div
          class="opus-work__preview-cell"
          class:opus-work__preview-cell--wide={p.wide}
          style={cellStyle(p.cell, p.wide)}
        >
          {#if p.cell.src}
            <img
              src={p.cell.src}
              alt={p.cell.alt ?? work.title}
              loading="lazy"
              decoding="async"
            />
          {/if}
        </div>
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
    gap: 1rem;
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  }

  .opus-work__info {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
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

  .opus-work__meta {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    margin: 0;
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
  }

  .opus-work__value {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.5;
    margin: 0;
  }

  .opus-work__quote {
    align-items: stretch;
    display: flex;
    gap: 0.5rem;
    margin-top: 0.8rem;
  }

  .opus-work__quote-line {
    background: var(--color-text);
    display: block;
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

  a.opus-work__quote-by-name {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 0.15em;
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
  }

  .opus-work__preview-cell--wide {
    grid-column: 1 / -1;
  }

  .opus-work__preview-cell img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
</style>
