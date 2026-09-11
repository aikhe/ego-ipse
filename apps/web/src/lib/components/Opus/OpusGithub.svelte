<script lang="ts">
  import { cubicIn, cubicOut, quartOut } from 'svelte/easing';
  import type { TransitionConfig } from 'svelte/transition';

  interface ContributionDay {
    date: string;
    count: number;
    level: number;
  }

  // kept in sync with the grid gap in the stylesheet below
  const GRID_GAP_PX = 2;
  const WINDOW_DAYS = 365;
  const WINDOW_DAYS_MOBILE = 182;

  let {
    ref = $bindable<HTMLDivElement | null>(null),
    titleRef = $bindable<HTMLParagraphElement | null>(null),
  }: {
    ref?: HTMLDivElement | null;
    titleRef?: HTMLParagraphElement | null;
  } = $props();

  let rawDays = $state<ContributionDay[]>([]);
  let loaded = $state(false);
  let failed = $state(false);
  let scrollEl = $state<HTMLDivElement | null>(null);
  let cellPx = $state(8);
  let isMobile = $state(false);

  // mobile shows a trailing 6 months, desktop the full year
  const windowDays = $derived(isMobile ? WINDOW_DAYS_MOBILE : WINDOW_DAYS);
  const built = $derived(buildYearWindow(rawDays, windowDays));
  const days = $derived(loaded ? built.days : []);
  const total = $derived(loaded ? built.total : null);
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
  let prevIdx: number | null = null;

  const formattedTotal = $derived(
    total === null ? '—' : total.toLocaleString('en-US')
  );

  function formatTipDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function showTip(e: MouseEvent) {
    const cell = (e.target as HTMLElement).closest('[data-idx]');
    // crossing the gaps between cells keeps the pill open
    if (!(cell instanceof HTMLElement)) return;
    const idx = Number(cell.dataset.idx ?? -1);
    if (Number.isNaN(idx) || idx < 0) return;
    const count = Number(cell.dataset.count ?? 0);
    const below = e.clientY < 80;
    // same cell: follow the cursor without replaying the text animation
    if (idx === prevIdx && tip) {
      tip = { ...tip, x: e.clientX, y: e.clientY, below };
      return;
    }
    // enter vector points from where the cursor came: moving right slides
    // text left-to-right, moving up slides it bottom-to-top, and so on
    let dx = 0;
    let dy = 1;
    if (prevIdx !== null) {
      const dcol = Math.floor(idx / 7) - Math.floor(prevIdx / 7);
      const drow = (idx % 7) - (prevIdx % 7);
      if (Math.abs(dcol) >= Math.abs(drow) && dcol !== 0) {
        dx = dcol > 0 ? -1 : 1;
        dy = 0;
      } else if (drow !== 0) {
        dx = 0;
        dy = drow > 0 ? -1 : 1;
      }
    }
    prevIdx = idx;
    tip = {
      x: e.clientX,
      y: e.clientY,
      below,
      dx,
      dy,
      text: `${formatTipDate(cell.dataset.date ?? '')} · ${count} contribution${count === 1 ? '' : 's'}`,
    };
  }

  function hideTip() {
    tip = null;
    prevIdx = null;
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

  function levelOf(day: ContributionDay): 0 | 1 | 2 | 3 | 4 {
    if (day.level <= 0) return 0;
    if (day.level === 1) return 1;
    if (day.level === 2) return 2;
    if (day.level === 3) return 3;
    return 4;
  }

  function toISODate(d: Date): string {
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  // trailing window ending today, padded back to sunday so weekday
  // rows stay aligned. total counts the window only, not the padding.
  function buildYearWindow(
    list: ContributionDay[],
    span: number
  ): {
    days: ContributionDay[];
    total: number;
  } {
    const byDate = new Map(list.map(d => [d.date, d]));
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const windowStart = new Date(end);
    windowStart.setDate(windowStart.getDate() - (span - 1));
    const gridStart = new Date(windowStart);
    while (gridStart.getDay() !== 0) gridStart.setDate(gridStart.getDate() - 1);
    const out: ContributionDay[] = [];
    let sum = 0;
    for (const d = new Date(gridStart); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = toISODate(d);
      const day = byDate.get(iso) ?? { date: iso, count: 0, level: 0 };
      out.push(day);
      if (d >= windowStart) sum += day.count;
    }
    return { days: out, total: sum };
  }

  $effect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/github/contributions');
        if (!res.ok) throw new Error('contributions fetch failed');
        const data = (await res.json()) as {
          total?: number;
          contributions?: ContributionDay[];
        };
        if (cancelled) return;
        rawDays = Array.isArray(data.contributions) ? data.contributions : [];
        loaded = true;
      } catch {
        if (!cancelled) failed = true;
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  });

  // exact fractional cell size so the window spans the full column width
  $effect(() => {
    if (!scrollEl) return;
    const weeks = Math.max(1, Math.ceil(days.length / 7));
    const sync = () => {
      const w = scrollEl!.clientWidth;
      const next = (w - (weeks - 1) * GRID_GAP_PX) / weeks;
      cellPx = Math.max(3, Math.min(12, next));
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(scrollEl);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  });

  // mobile breakpoint mirrors the opus layout (48rem): 6-month window
  $effect(() => {
    const mq = window.matchMedia('(max-width: 48rem)');
    const sync = () => {
      isMobile = mq.matches;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  });
</script>

<div class="opus-section opus-section--github opus-github" bind:this={ref}>
  <p class="opus-name" bind:this={titleRef}>Activity</p>
  <div
    class="opus-github__scroll"
    bind:this={scrollEl}
    onscroll={hideTip}
    role="group"
    aria-label={total === null
      ? 'GitHub contribution heatmap'
      : `${formattedTotal} GitHub contributions in the last ${isMobile ? '6 months' : 'year'}`}
  >
    {#if days.length > 0}
      <a
        class="opus-github__grid"
        href="https://github.com/aikhe"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View @aikhe on GitHub"
        style:--gh-cell={`${cellPx}px`}
        onmousemove={showTip}
        onmouseleave={hideTip}
      >
        {#each days as day, i (day.date)}
          <span
            class="opus-github__cell opus-github__cell--l{levelOf(day)}"
            data-idx={i}
            data-date={day.date}
            data-count={day.count}
          ></span>
        {/each}
      </a>
      {#if tip}
        <div
          class="opus-github__tip"
          class:opus-github__tip--below={tip.below}
          style:left={`${tip.x}px`}
          style:top={`${tip.y}px`}
          in:pop
          out:popOut
          aria-hidden="true"
        >
          {#key tip.text}
            <span class="opus-github__tip-swap" in:textSwap={swapParams}
              >{tip.text}</span
            >
          {/key}
        </div>
      {/if}
    {:else if failed}
      <p class="opus-github__note">
        Contribution graph is unavailable right now.
      </p>
    {:else}
      <p class="opus-github__note">Loading contribution graph…</p>
    {/if}
  </div>
</div>

<style>
  /* local copies of the opus title/desc type: page-scoped styles do not
    cross into this child component, so the classes alone render unstyled */
  .opus-name {
    color: var(--color-text);
    font-family: Geist, sans-serif;
    font-size: 1.46rem;
    font-weight: 500;
    letter-spacing: 0.1%;
    line-height: 1;
    margin: 0;
  }

  /* top margin separates from values, bottom padding + footer gap separate from footer */
  .opus-section--github {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: flex-start;
    margin-top: 5rem;
    padding-bottom: 2rem;
  }

  .opus-github__scroll {
    margin-top: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    scrollbar-width: none;
    width: 100%;
  }

  .opus-github__scroll::-webkit-scrollbar {
    display: none;
  }

  .opus-github__grid {
    color: inherit;
    cursor: pointer;
    display: grid;
    gap: 2px;
    grid-auto-flow: column;
    grid-template-rows: repeat(7, var(--gh-cell, 0.5rem));
    text-decoration: none;
    width: max-content;
  }

  .opus-github__cell {
    border-radius: 2px;
    display: block;
    height: var(--gh-cell, 0.5rem);
    width: var(--gh-cell, 0.5rem);
  }

  /* light mode: soft graphite scale */
  .opus-github__cell--l0 {
    background: color-mix(in srgb, var(--color-text) 3%, transparent);
  }

  .opus-github__cell--l1 {
    background: color-mix(in srgb, var(--color-text) 8%, transparent);
  }

  .opus-github__cell--l2 {
    background: color-mix(in srgb, var(--color-text) 16%, transparent);
  }

  .opus-github__cell--l3 {
    background: color-mix(in srgb, var(--color-text) 26%, transparent);
  }

  .opus-github__cell--l4 {
    background: color-mix(in srgb, var(--color-text) 42%, transparent);
  }

  /* dark mode: dimmed so the grid stays quiet on near-black */
  :global([data-theme='dark']) .opus-github__cell--l0 {
    background: color-mix(in srgb, var(--color-text) 4%, transparent);
  }

  :global([data-theme='dark']) .opus-github__cell--l1 {
    background: color-mix(in srgb, var(--color-text) 10%, transparent);
  }

  :global([data-theme='dark']) .opus-github__cell--l2 {
    background: color-mix(in srgb, var(--color-text) 18%, transparent);
  }

  :global([data-theme='dark']) .opus-github__cell--l3 {
    background: color-mix(in srgb, var(--color-text) 28%, transparent);
  }

  :global([data-theme='dark']) .opus-github__cell--l4 {
    background: color-mix(in srgb, var(--color-text) 50%, transparent);
  }

  .opus-github__note {
    color: var(--color-text-faint-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    line-height: 1.5;
    margin: 0;
  }

  .opus-github__tip {
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
    top: 0;
    transform: translate(-50%, calc(-100% - 10px));
    transform-origin: bottom center;
    white-space: nowrap;
    z-index: 50;
  }

  .opus-github__tip--below {
    transform: translate(-50%, 14px);
    transform-origin: top center;
  }

  .opus-github__tip-swap {
    display: inline-block;
  }
</style>
