<script lang="ts">
  import { resolve } from '$app/paths';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { uiState } from '$lib/state/ui.svelte';
  import OpusNav from '$lib/components/Opus/OpusNav.svelte';
  import OpusFooter from '$lib/components/Opus/OpusFooter.svelte';
  import WorkDetail from '$lib/components/Work/WorkDetail.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const work = $derived(data.work);

  // Return to the listing the visitor came from (?from=/ or
  // ?from=/works). Anything else falls back to the works list.
  const opusHref = resolve('/');
  const worksHref = resolve('/works');
  const fromParam = $derived(page.url.searchParams.get('from'));
  const backHref = $derived(fromParam === opusHref ? opusHref : worksHref);
  const backLabel = $derived(
    fromParam === opusHref ? 'Back to opus' : 'Back to works'
  );

  // Reached via in-app navigation (from is null on direct visits/reloads).
  let arrivedInApp = $state(false);
  afterNavigate(nav => {
    if (nav.from) arrivedInApp = true;
  });

  function goBack(event: MouseEvent) {
    // history.back() returns to the exact listing entry with its scroll
    // position restored. Direct visits fall through to the fallback href.
    if (arrivedInApp && window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  }
</script>

<main class="opus-canvas">
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
      <div class="opus-section opus-section--work-detail">
        <a
          class="opus-back"
          href={backHref}
          aria-label={backLabel}
          onclick={goBack}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
        <WorkDetail {work} />
      </div>
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
</main>

<style>
  .opus-section {
    position: relative;
    z-index: 1;
  }

  .opus-section--work-detail {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .opus-back {
    align-items: center;
    background: var(--color-overlay-05);
    border: none;
    border-radius: 0;
    color: var(--color-text);
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    min-height: 2rem;
    min-width: 2rem;
    opacity: 0.9;
    padding: 0.45rem;
    pointer-events: auto;
    position: relative;
    text-decoration: none;
    transition:
      background 0.25s ease,
      color 0.25s ease,
      opacity 0.25s ease;
    width: fit-content;
    z-index: 5;
  }

  .opus-back:hover {
    background: var(--color-text);
    color: var(--color-bg);
    opacity: 1;
  }

  /* touch: press states replace hover states */

  @media (hover: none) {
    .opus-back:hover {
      background: var(--color-overlay-05);
      color: var(--color-text);
      opacity: 0.9;
    }

    .opus-back:active {
      background: var(--color-text);
      color: var(--color-bg);
      opacity: 1;
    }
  }
</style>
