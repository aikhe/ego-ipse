<script lang="ts">
  import { resolve } from '$app/paths';
  import { fade, scale } from 'svelte/transition';
  import { uiState } from '$lib/state/ui.svelte';
  import OpusNav from '$lib/components/Opus/OpusNav.svelte';
  import { selectedWorks, works } from '$lib/data/works';
  import { mergePreferSanity } from '$lib/sanity/opusWorks';
  import type { PageProps } from './$types';
  import WorkCard from '$lib/components/Work/WorkCard.svelte';
  import OpusFooter from '$lib/components/Opus/OpusFooter.svelte';

  interface FilterCategory {
    id: string;
    label: string;
    match: string | null;
  }

  const categories: FilterCategory[] = [
    { id: 'all', label: 'All', match: null },
    { id: 'posters', label: 'Graphic & posters', match: 'poster' },
    { id: 'mascot', label: 'Mascot/character design', match: 'mascot' },
    { id: 'mobile', label: 'Mobile app', match: 'mobile' },
    { id: 'web', label: 'Web app', match: 'web' },
    { id: 'branding', label: 'Branding', match: 'brand' },
    { id: 'miscs', label: 'Miscs', match: 'misc' },
  ];

  const fallbackCategory: FilterCategory = {
    id: 'all',
    label: 'All',
    match: null,
  };

  let { data }: PageProps = $props();

  // sanity first, hardcoded stays as fallback.
  const mergedSelected = $derived(
    mergePreferSanity(data.sanitySelected ?? [], selectedWorks)
  );
  const mergedWorks = $derived(
    mergePreferSanity(data.sanityWorks ?? [], works)
  );
  const allWorks = $derived([...mergedSelected, ...mergedWorks]);

  let selectedId = $state('all');
  let query = $state('');
  let open = $state(false);
  let filterEl = $state<HTMLDivElement | null>(null);
  let closeTimer: ReturnType<typeof setTimeout> | undefined = $state(undefined);
  let headEl = $state<HTMLDivElement | null>(null);
  let headerVisible = $state(true);
  let stickyOpen = $state(false);
  let stickyFilterEl = $state<HTMLDivElement | null>(null);
  let stickyCloseTimer: ReturnType<typeof setTimeout> | undefined =
    $state(undefined);

  const selectedCategory = $derived(
    categories.find(cat => cat.id === selectedId) ?? fallbackCategory
  );

  // sanity fetch failed: list is empty for lack of data, not lack of works.
  const loadError = $derived(data.sanityError ?? false);

  const queryText = $derived(query.trim().toLowerCase());

  const filtered = $derived(
    allWorks
      .filter(work =>
        selectedCategory.match === null
          ? true
          : (work.meta
              .find(row => row.k === 'Platform')
              ?.v.toLowerCase()
              .includes(selectedCategory.match as string) ?? false)
      )
      .filter(work =>
        queryText === ''
          ? true
          : `${work.title} ${work.description} ${work.tags.join(' ')}`
              .toLowerCase()
              .includes(queryText)
      )
  );

  function cancelScheduledClose() {
    if (closeTimer !== undefined) {
      clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  function cancelScheduledStickyClose() {
    if (stickyCloseTimer !== undefined) {
      clearTimeout(stickyCloseTimer);
      stickyCloseTimer = undefined;
    }
  }

  function hasHover() {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover)').matches
    );
  }

  function openFilter() {
    if (!hasHover()) return;
    cancelScheduledClose();
    open = true;
  }

  function openStickyFilter() {
    cancelScheduledStickyClose();
    stickyOpen = true;
  }

  function scheduleClose() {
    if (!hasHover()) return;
    cancelScheduledClose();
    closeTimer = setTimeout(() => {
      open = false;
      closeTimer = undefined;
    }, 250);
  }

  function scheduleStickyClose() {
    cancelScheduledStickyClose();
    stickyCloseTimer = setTimeout(() => {
      stickyOpen = false;
      stickyCloseTimer = undefined;
    }, 250);
  }

  function closeAll() {
    cancelScheduledClose();
    cancelScheduledStickyClose();
    open = false;
    stickyOpen = false;
  }

  function choose(id: string) {
    selectedId = id;
    closeAll();
  }

  function toggleFilter() {
    // touch-driven toggle; hover-capable devices stay hover-driven.
    if (hasHover()) return;
    if (open) {
      cancelScheduledClose();
      open = false;
    } else {
      cancelScheduledClose();
      open = true;
    }
  }

  function toggleStickyFilter() {
    // touch-driven toggle; hover-capable devices stay hover-driven.
    if (hasHover()) return;
    if (stickyOpen) {
      cancelScheduledStickyClose();
      stickyOpen = false;
    } else {
      cancelScheduledStickyClose();
      stickyOpen = true;
    }
  }

  function closeOnOutsideClick(event: MouseEvent) {
    const target = event.target as Node;
    const inMain = filterEl?.contains(target) ?? false;
    const inSticky = stickyFilterEl?.contains(target) ?? false;
    if ((open || stickyOpen) && !inMain && !inSticky) closeAll();
  }

  function closeOnEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') closeAll();
  }

  $effect(() => {
    if (!headEl) return;
    const io = new IntersectionObserver(entries => {
      const visible = entries[0]?.isIntersecting ?? true;
      headerVisible = visible;
      if (!visible) {
        cancelScheduledClose();
        open = false;
      }
    });
    io.observe(headEl);
    return () => io.disconnect();
  });
</script>

<svelte:window onclick={closeOnOutsideClick} onkeydown={closeOnEscape} />

<div class="opus-canvas">
  <div class="opus-grid">
    <div class="opus-col opus-col--1">
      <OpusNav active="works" />
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
      <div class="opus-section opus-section--works">
        <div class="opus-works__head" bind:this={headEl}>
          <h2 class="opus-works">Works</h2>
          <div class="opus-search">
            <input
              class="opus-search__input"
              type="text"
              placeholder="Filter works..."
              aria-label="Filter works"
              autocomplete="off"
              bind:value={query}
            />
          </div>
          <div
            class="opus-filter"
            bind:this={filterEl}
            onmouseenter={openFilter}
            onmouseleave={scheduleClose}
            onfocusin={openFilter}
          >
            <button
              class="opus-filter__btn"
              aria-haspopup="listbox"
              aria-expanded={open}
              onclick={toggleFilter}
            >
              <span class="opus-filter__label">{selectedCategory.label}</span>
              <svg
                class="opus-filter__chevron"
                class:opus-filter__chevron--open={open}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            {#if open}
              <ul
                class="opus-filter__menu"
                role="listbox"
                aria-label="Filter works by platform"
                in:scale={{ duration: 140, start: 0.96 }}
                out:fade={{ duration: 110 }}
              >
                {#each categories as cat (cat.id)}
                  <li role="presentation">
                    <button
                      class="opus-filter__option"
                      class:opus-filter__option--active={cat.id === selectedId}
                      role="option"
                      aria-selected={cat.id === selectedId}
                      onclick={() => choose(cat.id)}
                    >
                      {cat.label}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>
        <div class="opus-works-list">
          {#each filtered as work (work.slug)}
            <WorkCard {work} from={resolve('/works')} />
          {/each}
        </div>
        {#if filtered.length === 0}
          <p class="opus-works__empty">
            {#if loadError}
              Works are unavailable right now — check back soon.
            {:else if queryText !== ''}
              No works match "{query.trim()}" yet.
            {:else}
              No works filed under {selectedCategory.label} yet.
            {/if}
          </p>
        {/if}
      </div>
      <OpusFooter />
    </div>
    <div class="opus-col opus-col--4" aria-hidden="true"></div>
    <div class="opus-col opus-col--5" aria-hidden="true"></div>
  </div>
  {#if !headerVisible}
    <div class="opus-sticky" transition:fade={{ duration: 150 }}>
      <div class="opus-search opus-search--sticky">
        <input
          class="opus-search__input"
          type="text"
          placeholder="Filter works..."
          aria-label="Filter works"
          autocomplete="off"
          bind:value={query}
        />
      </div>
      <div
        class="opus-filter opus-filter--sticky"
        bind:this={stickyFilterEl}
        onmouseenter={openStickyFilter}
        onmouseleave={scheduleStickyClose}
        onfocusin={openStickyFilter}
      >
        <button
          class="opus-filter__btn"
          aria-haspopup="listbox"
          aria-expanded={stickyOpen}
          onclick={toggleStickyFilter}
        >
          <span class="opus-filter__label">{selectedCategory.label}</span>
          <svg
            class="opus-filter__chevron"
            class:opus-filter__chevron--open={stickyOpen}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        {#if stickyOpen}
          <ul
            class="opus-filter__menu"
            role="listbox"
            aria-label="Filter works by platform"
            in:scale={{ duration: 140, start: 0.96 }}
            out:fade={{ duration: 110 }}
          >
            {#each categories as cat (cat.id)}
              <li role="presentation">
                <button
                  class="opus-filter__option"
                  class:opus-filter__option--active={cat.id === selectedId}
                  role="option"
                  aria-selected={cat.id === selectedId}
                  onclick={() => choose(cat.id)}
                >
                  {cat.label}
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  {/if}
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
  :global(html) {
    height: auto;
    overflow: auto;
  }

  :global(body) {
    height: auto;
    min-height: 100vh;
    overflow: visible;
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
    grid-template-columns: 14rem 4rem 36rem 12rem 8rem;
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
    background-color: var(--color-overlay-05);
    content: '';
    inset: 0;
    mask-image: url('$lib/assets/stripe.svg');
    mask-repeat: repeat;
    mask-size: 7px 7px;
    pointer-events: none;
    position: absolute;
  }

  .opus-stripe--top {
    border-bottom: 1px solid var(--color-overlay-05);
    top: 0;
  }

  .opus-stripe--bottom {
    border-top: 1px solid var(--color-overlay-05);
    bottom: 0;
  }

  .opus-col {
    box-sizing: border-box;
    min-height: 100%;
    padding: 4.5rem 0 7rem;
    position: relative;
  }

  .opus-grid:not(.opus-grid--overlay) {
    border-right: 2px solid var(--color-overlay-02);
    position: relative;
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col {
    border-left: 2px solid var(--color-overlay-02);
  }

  .opus-grid:not(.opus-grid--overlay) .opus-col::after {
    background: var(--color-overlay-10);
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
    background: var(--color-overlay-10);
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
    background: var(--color-overlay-10);
    content: '';
    height: 24px;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 2px;
  }

  .opus-grid:not(.opus-grid--overlay)::before {
    background: var(--color-overlay-10);
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
        var(--color-overlay-02) 0%,
        var(--color-overlay-02) 5%,
        transparent 30%,
        transparent 60%,
        var(--color-overlay-02) 80%,
        var(--color-overlay-02) 100%
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
      var(--color-overlay-02) 0%,
      var(--color-overlay-02) 20%,
      transparent 30%,
      transparent 60%,
      var(--color-overlay-02) 80%,
      var(--color-overlay-02) 100%
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
    background: var(--color-overlay-10);
    bottom: 0;
    content: '';
    height: 24px;
    position: absolute;
    width: 2px;
  }

  .opus-col__border--right::after {
    background: var(--color-overlay-10);
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

  .opus-grid:not(.opus-grid--overlay) .opus-col--5 {
    border-image: linear-gradient(
        to bottom,
        var(--color-overlay-02) 0%,
        var(--color-overlay-02) 20%,
        transparent 30%,
        transparent 60%,
        var(--color-overlay-02) 80%,
        var(--color-overlay-02) 100%
      )
      1;
    border-left: 2px solid transparent;
    pointer-events: none;
    position: relative;
    z-index: 0;
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

  .opus-col__index {
    color: var(--color-text-faint-opus);
    font-family: 'Geist Mono', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1;
  }

  .opus-section--works {
    display: flex;
    flex-direction: column;
    width: calc(100% + 20rem + 4px);
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
    gap: 3rem;
    margin-top: 1.5rem;
  }

  .opus-works__head {
    align-items: center;
    display: flex;
    justify-content: space-between;
    position: relative;
    width: calc(100% - 20rem - 4px);
    z-index: 5;
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

  .opus-filter {
    left: calc(100% + 0.5rem);
    padding: 0.4rem;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: fit-content;
  }

  .opus-filter__btn {
    align-items: center;
    background: transparent;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    display: inline-flex;
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    gap: 0.25rem;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 0;
    padding: 0;
    white-space: nowrap;
  }

  .opus-filter__btn:hover {
    color: var(--color-text);
  }

  .opus-filter__chevron {
    display: block;
    height: 1rem;
    transition: transform 0.25s ease;
    width: 1rem;
  }

  .opus-filter__chevron--open {
    transform: rotate(180deg);
  }

  .opus-filter__menu {
    background: var(--color-bg);
    display: flex;
    flex-direction: column;
    left: 0;
    list-style: none;
    margin: 0;
    min-width: 14rem;
    padding: 0;
    position: absolute;
    top: 100%;
    z-index: 5;
  }

  .opus-filter__option {
    background: transparent;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    display: block;
    font-family: Geist, sans-serif;
    font-size: 0.92rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.5;
    padding: 0.45rem 0.8rem;
    text-align: left;
    transition:
      background-color 0.15s ease,
      color 0.1s ease;
    white-space: nowrap;
    width: 100%;
  }

  .opus-filter__option:hover {
    background-color: var(--color-overlay-05);
    color: var(--color-text);
  }

  .opus-filter__option--active {
    background: var(--color-text);
    color: var(--color-bg);
  }

  .opus-filter__option--active:hover {
    background-color: var(--color-text);
    color: var(--color-bg);
  }

  .opus-works__empty {
    color: var(--color-text-muted-opus);
    font-family: Geist, sans-serif;
    font-size: 1.08rem;
    font-weight: 400;
    letter-spacing: 0.18%;
    line-height: 1.48;
    margin: 1.5rem 0 0;
  }

  .opus-sticky {
    background: var(--color-bg);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    left: calc(50% + 37rem + 1rem);
    padding: 0;
    position: fixed;
    top: 4.5rem;
    width: 16rem;
    z-index: 6;
  }

  .opus-search--sticky {
    margin: 0;
  }

  .opus-search--sticky .opus-search__input {
    width: 100%;
  }

  .opus-filter--sticky {
    left: auto;
    margin-left: 0.5rem;
    padding: 0;
    position: relative;
    top: auto;
    transform: none;
    width: auto;
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

  .opus-grid--overlay .opus-col--5 {
    background: color-mix(in srgb, var(--color-text) 17%, transparent);
  }

  /* touch: press states replace hover states */
  @media (hover: none) {
    .opus-filter__option:hover {
      background-color: transparent;
      color: var(--color-text);
    }

    .opus-filter__option:active {
      background-color: var(--color-overlay-05);
      color: var(--color-text);
    }
  }
</style>
